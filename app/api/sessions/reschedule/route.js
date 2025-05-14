export const runtime = 'nodejs';

import dbConnect from '../../../../lib/mongodb';
import TeachingRequest from '../../../../models/TeachingRequest';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
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

// PATCH handler - Reschedule a session
export async function PATCH(request) {
  try {
    // Verify token
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { sessionId, preferredDate } = body;

    if (!sessionId || !preferredDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Find the session and populate user details
    const session = await TeachingRequest.findById(sessionId)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');
      
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check authorization - both participants can reschedule a session
    const isToUserActing = session.toUser._id.toString() === userId;
    const isFromUserActing = session.fromUser._id.toString() === userId;

    if (!isToUserActing && !isFromUserActing) {
      return NextResponse.json({ error: 'Not authorized to reschedule this session' }, { status: 403 });
    }

    // Only accepted sessions can be rescheduled
    if (session.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Only accepted sessions can be rescheduled' },
        { status: 400 }
      );
    }

    // Format dates for notification/email
    const newDateObj = new Date(preferredDate);
    const formattedNewDate = newDateObj.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const formattedOldDate = session.preferredDate 
        ? new Date(session.preferredDate).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
          }) 
        : 'Previously Unspecified';

    // Update session with new date
    session.preferredDate = newDateObj;
    session.updatedAt = new Date();
    await session.save();

    // Determine recipient and actor
    const actor = isFromUserActing ? session.fromUser : session.toUser;
    const recipient = isFromUserActing ? session.toUser : session.fromUser;

    // Create in-app notification for the other user
    await User.findByIdAndUpdate(recipient._id, {
      $push: {
        notifications: {
          type: 'teaching_request',
          fromUser: actor._id,
          message: `${actor.name} rescheduled your session for ${session.skill} to ${formattedNewDate}`,
          read: false
        }
      }
    });

    // --- Add Email Notification ---
    if (recipient.email) {
        const subject = `Session Rescheduled: ${session.skill}`;
        const emailHtml = `
          <p>Hello ${recipient.name},</p>
          <p>Your skill session with <b>${actor.name}</b> for "<b>${session.skill}</b>" has been rescheduled.</p>
          <p><b>Previous Date:</b> ${formattedOldDate}</p>
          <p><b>New Date:</b> ${formattedNewDate}</p>
          <p>You can view the details in your SkillShikhi dashboard.</p>
          <br/><p>Thanks,</p><p>The SkillShikhi Team</p>
        `;
        
        sendEmail(recipient.email, subject, emailHtml).catch(emailError => {
          console.error(`Failed to send session reschedule email for ${sessionId}:`, emailError);
        });
    } else {
      console.warn(`Recipient ${recipient.name} (${recipient._id}) has no email address. Cannot send reschedule notification.`);
    }
    // --- End Email Notification ---

    console.log(`✅ Rescheduled session ${sessionId} from ${formattedOldDate} to ${formattedNewDate}`);
    return NextResponse.json({ success: true, session: session.toObject() });
  } catch (error) {
    console.error('Error rescheduling session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 