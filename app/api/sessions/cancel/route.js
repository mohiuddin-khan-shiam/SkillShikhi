export const runtime = 'nodejs';

import dbConnect from '../../../../lib/mongodb';
import TeachingRequest from '../../../../models/TeachingRequest';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { sendEmail } from '../../../../lib/nodemailer';

// Helper to verify the JWT token from request headers
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Token verified for user: ${decoded.userId}`);
    return decoded;
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return null;
  }
}

// DELETE handler - Cancel a session (delete it and notify the other user)
export async function DELETE(request) {
  try {
    console.log('🔄 Cancel session endpoint called');
    
    // Verify token
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = decoded.userId;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId parameter' }, { status: 400 });
    }
    
    console.log(`🗑️ Attempting to cancel session ${sessionId} by user ${userId}`);
    
    await dbConnect();

    // Find the session and populate user details
    const session = await TeachingRequest.findById(sessionId)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check authorization (both participants can cancel a session)
    const isToUserActing = session.toUser._id.toString() === userId;
    const isFromUserActing = session.fromUser._id.toString() === userId;

    if (!isToUserActing && !isFromUserActing) {
      return NextResponse.json({ error: 'Not authorized to cancel this session' }, { status: 403 });
    }

    // Determine recipient and actor
    const actor = isFromUserActing ? session.fromUser : session.toUser;
    const recipient = isFromUserActing ? session.toUser : session.fromUser;

    // Create in-app notification for the other user
    const notificationMessage = `${actor.name} cancelled your session for ${session.skill}`;
    await User.findByIdAndUpdate(recipient._id, {
      $push: {
        notifications: {
          type: 'teaching_request',
          fromUser: actor._id,
          message: notificationMessage,
          read: false
        }
      }
    });

    // --- Add Email Notification ---
    if (recipient.email) {
        const subject = `Session Cancelled: ${session.skill}`;
        const emailHtml = `
          <p>Hello ${recipient.name},</p>
          <p>Your skill session with <b>${actor.name}</b> for "<b>${session.skill}</b>" has been cancelled.</p>
          <p>You can view your remaining sessions in your SkillShikhi dashboard.</p>
          <br/><p>Thanks,</p><p>The SkillShikhi Team</p>
        `;
        
        sendEmail(recipient.email, subject, emailHtml).catch(emailError => {
          console.error(`Failed to send session cancellation email for ${sessionId}:`, emailError);
        });
    } else {
      console.warn(`Recipient ${recipient.name} (${recipient._id}) has no email address. Cannot send cancellation notification.`);
    }
    // --- End Email Notification ---
    
    // Now delete the session
    await TeachingRequest.findByIdAndDelete(sessionId);
    
    console.log(`✅ Successfully cancelled session ${sessionId}`);
    return NextResponse.json({ success: true, message: 'Session cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 