// services/notificationService.js

import nodemailer from 'nodemailer';
import User from '../models/User';
import dbConnect from '../lib/mongodb';
import config from '../config';

/**
 * Configure email transporter
 * @returns {Object} Configured nodemailer transporter
 */
function getEmailTransporter() {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
}

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise<Object>} Result of the email sending operation
 */
export async function sendEmail({ to, subject, html }) {
  try {
    const transporter = getEmailTransporter();
    
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send session request notification
 * @param {Object} sessionData - Session request data
 * @param {Object} fromUser - User who sent the request
 * @param {Object} toUser - User who received the request
 * @returns {Promise<Object>} Result of the notification operation
 */
export async function sendSessionRequestNotification(sessionData, fromUser, toUser) {
  const subject = `New Session Request from ${fromUser.name}`;
  
  const html = `
    <h1>New Session Request</h1>
    <p>Hello ${toUser.name},</p>
    <p>${fromUser.name} has requested a session with you for learning ${sessionData.skill}.</p>
    <p><strong>Message:</strong> ${sessionData.message || 'No message provided'}</p>
    <p><strong>Preferred Date:</strong> ${sessionData.preferredDate ? new Date(sessionData.preferredDate).toLocaleDateString() : 'Flexible'}</p>
    <p>Please log in to your account to accept or decline this request.</p>
    <p>Best regards,<br>SkillShikhi Team</p>
  `;
  
  return sendEmail({
    to: toUser.email,
    subject,
    html,
  });
}

/**
 * Send session status update notification
 * @param {Object} session - Session data
 * @param {string} status - New status of the session
 * @param {Object} fromUser - User who updated the status
 * @param {Object} toUser - User who receives the notification
 * @returns {Promise<Object>} Result of the notification operation
 */
export async function sendSessionStatusNotification(session, status, fromUser, toUser) {
  let subject, statusText;
  
  switch (status) {
    case 'accepted':
      subject = `Session Request Accepted by ${fromUser.name}`;
      statusText = 'accepted';
      break;
    case 'rejected':
      subject = `Session Request Declined by ${fromUser.name}`;
      statusText = 'declined';
      break;
    case 'completed':
      subject = `Session Marked as Completed by ${fromUser.name}`;
      statusText = 'marked as completed';
      break;
    default:
      subject = `Session Status Updated by ${fromUser.name}`;
      statusText = 'updated';
  }
  
  const html = `
    <h1>Session Status Update</h1>
    <p>Hello ${toUser.name},</p>
    <p>Your session request for learning ${session.skill} has been ${statusText} by ${fromUser.name}.</p>
    ${status === 'accepted' ? `<p><strong>Scheduled Date:</strong> ${session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : 'To be determined'}</p>` : ''}
    ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
    <p>Please log in to your account to view more details.</p>
    <p>Best regards,<br>SkillShikhi Team</p>
  `;
  
  return sendEmail({
    to: toUser.email,
    subject,
    html,
  });
}

/**
 * Get user data by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
export async function getUserById(userId) {
  try {
    await dbConnect();
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    return { success: true, user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, message: 'Error fetching user', error: error.message };
  }
}
