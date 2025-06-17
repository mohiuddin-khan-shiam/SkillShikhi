import nodemailer from 'nodemailer';
import config from '../config';
import logger from './loggerService';

/**
 * Create a nodemailer transporter
 * @returns {Object} Configured transporter
 */
function createTransporter() {
  // Check if email configuration is available
  if (!config.email.host || !config.email.user || !config.email.password) {
    logger.warn('Email configuration missing, using test account');
    return createTestTransporter();
  }

  // Create a production transporter
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port || 587,
    secure: config.email.secure || false,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
}

/**
 * Create test transporter for development
 * @returns {Object} Test transporter
 */
async function createTestTransporter() {
  // For development/testing only - creates a test account
  try {
    const testAccount = await nodemailer.createTestAccount();
    logger.debug('Created test email account', testAccount);
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    logger.error('Failed to create test email account', error);
    // Return a mock transporter
    return {
      sendMail: async (options) => {
        logger.info('Mock email sent:', options);
        return { messageId: 'mock-message-id' };
      },
    };
  }
}

/**
 * Send a password reset email
 * @param {string} to - Recipient email
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise} Email send result
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  try {
    // In development mode with no email config, just log the email
    if (config.server.nodeEnv === 'development' && !config.email.host) {
      logger.info('Development mode: Email would be sent to', to);
      logger.info('Reset URL:', resetUrl);
      return { messageId: 'mock-message-id' };
    }
    
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: config.email.from,
      to,
      subject: 'Reset Your SkillShikhi Password',
      text: `
        You requested a password reset for your SkillShikhi account.
        
        Please click the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you did not request this password reset, please ignore this email.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5b21b6;">Reset Your SkillShikhi Password</h2>
          <p>You requested a password reset for your SkillShikhi account.</p>
          <p>Please click the button below to reset your password:</p>
          <a 
            href="${resetUrl}" 
            style="display: inline-block; background-color: #5b21b6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;"
          >
            Reset Password
          </a>
          <p style="color: #666;">This link will expire in 1 hour.</p>
          <p style="color: #666;">If you did not request this password reset, please ignore this email.</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent:', info.messageId);
    
    // Log preview URL for test accounts
    if (info.messageId && info.messageId.includes('ethereal')) {
      logger.info('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @returns {Promise} Email send result
 */
export async function sendWelcomeEmail(to, name) {
  try {
    // In development mode with no email config, just log the email
    if (config.server.nodeEnv === 'development' && !config.email.host) {
      logger.info('Development mode: Welcome email would be sent to', to);
      return { messageId: 'mock-message-id' };
    }
    
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: config.email.from,
      to,
      subject: 'Welcome to SkillShikhi!',
      text: `
        Hi ${name},
        
        Welcome to SkillShikhi! We're excited to have you join our community.
        
        You can now log in to your account at ${config.app.baseUrl}/login
        
        Best regards,
        The SkillShikhi Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5b21b6;">Welcome to SkillShikhi!</h2>
          <p>Hi ${name},</p>
          <p>Welcome to SkillShikhi! We're excited to have you join our community.</p>
          <p>You can now log in to your account:</p>
          <a 
            href="${config.app.baseUrl}/login" 
            style="display: inline-block; background-color: #5b21b6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;"
          >
            Log In
          </a>
          <p>Best regards,<br>The SkillShikhi Team</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info('Welcome email sent:', info.messageId);
    
    // Log preview URL for test accounts
    if (info.messageId && info.messageId.includes('ethereal')) {
      logger.info('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    throw error;
  }
} 