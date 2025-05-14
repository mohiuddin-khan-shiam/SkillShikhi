// controllers/session/sessionController.js

import TeachingRequest from '../../models/TeachingRequest';
import User from '../../models/User';
import dbConnect from '../../lib/mongodb';
import { sendSessionRequestNotification, sendSessionStatusNotification, getUserById } from '../../services/notificationService';

/**
 * Get sessions for a user based on type (upcoming, pending, or completed)
 * @param {string} userId - User ID
 * @param {string} type - Session type (upcoming, pending, or completed)
 * @returns {Object} Response object with sessions data or error message
 */
export async function getSessions(userId, type = 'upcoming') {
  console.log(`ud83dudd0d Fetching ${type} sessions for user: ${userId}`);
  
  try {
    await dbConnect();
    
    // Build query based on type
    let query = {};
    if (type === "upcoming") {
      query = { 
        $or: [{ fromUser: userId }, { toUser: userId }],
        status: 'accepted'
      };
    } else if (type === "pending") {
      query = {
        $or: [
          { fromUser: userId, status: 'pending' },
          { toUser: userId, status: 'pending' }
        ]
      };
    } else if (type === "completed") {
      query = {
        $or: [{ fromUser: userId }, { toUser: userId }],
        status: { $in: ['completed', 'cancelled', 'rejected'] }
      };
    }
    
    // Fetch sessions and populate user details
    const sessions = await TeachingRequest.find(query)
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")
      .sort({ preferredDate: 1, createdAt: -1 });
    
    console.log(`Retrieved ${sessions.length} ${type} sessions for user ${userId}`);
    
    // Add detailed logging for debugging
    if (sessions.length > 0) {
      console.log('Session examples:');
      sessions.slice(0, 2).forEach((session, i) => {
        console.log(`Session ${i+1}:`, {
          _id: session._id,
          skill: session.skill,
          status: session.status,
          fromUser: session.fromUser?._id || 'Unknown',
          toUser: session.toUser?._id || 'Unknown',
          requesterId: userId,
          isFromCurrentUser: String(session.fromUser?._id) === String(userId)
        });
      });
    }
    
    return { success: true, sessions, status: 200 };
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}

/**
 * Create a new session request
 * @param {string} fromUserId - User ID of the requester
 * @param {Object} sessionData - Session request data
 * @param {string} sessionData.toUserId - User ID of the recipient
 * @param {string} sessionData.skill - Skill name
 * @param {string} sessionData.preferredDate - Preferred date for the session
 * @returns {Object} Response object with created session or error message
 */
export async function createSessionRequest(fromUserId, sessionData) {
  try {
    const { toUserId, skill, preferredDate } = sessionData;

    if (!toUserId || !skill) {
      return { success: false, message: 'Missing required fields', status: 400 };
    }

    await dbConnect();

    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId).lean(),
      User.findById(toUserId).lean()
    ]);

    if (!fromUser || !toUser) {
      return { success: false, message: 'User not found', status: 404 };
    }

    // Check if a pending request already exists
    const existingRequest = await TeachingRequest.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
      skill,
      status: 'pending'
    });

    if (existingRequest) {
      return { success: false, message: 'A pending request already exists', status: 409 };
    }

    // Create new session request
    const newSession = await TeachingRequest.create({
      fromUser: fromUserId,
      toUser: toUserId,
      skill,
      preferredDate: preferredDate ? new Date(preferredDate) : null
    });

    // Create notification for recipient
    await User.findByIdAndUpdate(toUserId, {
      $push: {
        notifications: {
          type: 'teaching_request',
          fromUser: fromUserId,
          message: `${fromUser.name} sent you a session request for ${skill}`,
          read: false
        }
      }
    });

    // Send email notification using the notification service
    sendSessionRequestNotification(
      {
        skill,
        preferredDate,
        message: sessionData.message || ''
      },
      fromUser,
      toUser
    ).catch(emailError => {
      console.error(`Failed to send session request email for ${newSession._id}:`, emailError);
    });

    console.log(`u2705 Created new session request for ${skill} from ${fromUserId} to ${toUserId}`);
    return { success: true, session: newSession, status: 201 };
  } catch (error) {
    console.error('Error creating session request:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
}

/**
 * Update session status
 * @param {string} userId - User ID of the updater
 * @param {Object} updateData - Session update data
 * @param {string} updateData.sessionId - Session ID
 * @param {string} updateData.status - New status (accepted, rejected, completed, cancelled)
 * @returns {Object} Response object with updated session or error message
 */
export async function updateSessionStatus(userId, updateData) {
  try {
    const { sessionId, status } = updateData;

    if (!sessionId || !status) {
      return { success: false, message: 'Missing required fields', status: 400 };
    }

    // Validate status value
    const validStatuses = ['accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return { 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 
        status: 400 
      };
    }

    await dbConnect();

    // Find the session and populate user details needed for email
    const session = await TeachingRequest.findById(sessionId)
      .populate('fromUser', 'name email') 
      .populate('toUser', 'name email');

    if (!session) {
      return { success: false, message: 'Session not found', status: 404 };
    }

    // Check authorization based on action
    const isToUser = session.toUser._id.toString() === userId;
    const isFromUser = session.fromUser._id.toString() === userId;

    if (!isToUser && !isFromUser) {
      return { success: false, message: 'Not authorized to update this session', status: 403 };
    }

    // Some status changes can only be performed by specific users
    if ((status === 'accepted' || status === 'rejected') && !isToUser) {
      return { 
        success: false, 
        message: 'Only the recipient can accept or reject a session request', 
        status: 403 
      };
    }

    // Update session status
    const oldStatus = session.status; // Store old status if needed
    session.status = status;
    session.updatedAt = new Date();
    await session.save();

    // Determine recipient and actor for notification/email
    const isFromUserActing = session.fromUser._id.toString() === userId;
    const actor = isFromUserActing ? session.fromUser : session.toUser;
    const recipient = isFromUserActing ? session.toUser : session.fromUser;

    // Create in-app notification
    let notificationMessage = '';
    switch (status) {
       case 'accepted': notificationMessage = `${actor.name} accepted your session request for ${session.skill}`; break;
       case 'rejected': notificationMessage = `${actor.name} declined your session request for ${session.skill}`; break;
       case 'completed': notificationMessage = `${actor.name} marked your session for ${session.skill} as completed`; break;
       // Note: 'cancelled' is handled by the DELETE endpoint now
    }
    if (notificationMessage) { // Only send notification if message exists
        await User.findByIdAndUpdate(recipient._id, {
          $push: {
            notifications: {
              type: 'teaching_request', // Could make this more specific (e.g., session_accepted)
              fromUser: actor._id,
              message: notificationMessage,
              read: false
            }
          }
        });
    }
    
    // Send email notification using the notification service
    sendSessionStatusNotification(
      session,
      status,
      actor,
      recipient
    ).catch(emailError => {
      console.error(`Failed to send session status update (${status}) email for ${sessionId}:`, emailError);
    });

    console.log(`✅ Updated session ${sessionId} status to ${status}`);
    return { success: true, session: session.toObject(), status: 200 };
  } catch (error) {
    console.error('Error updating session status:', error);
    // Check for specific validation errors if needed
    if (error.name === 'ValidationError') {
        return { success: false, message: `Validation Error: ${error.message}`, status: 400 };
    }
    return { success: false, message: 'Internal server error', status: 500 };
  }
}
