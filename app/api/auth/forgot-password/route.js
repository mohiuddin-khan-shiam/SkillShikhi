import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '../../../../utils/apiResponse';
import User from '../../../../models/User';
import { executeDbOperation } from '../../../../services/databaseService';
import { generateResetToken } from '../../../../utils/tokenUtils';
import { sendPasswordResetEmail } from '../../../../services/emailService';
import logger from '../../../../services/loggerService';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      logger.warn('Forgot password attempt without email');
      return errorResponse('Email is required', 400);
    }

    // In development mode without a database, return a success response
    if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI) {
      logger.debug('Development mode: Mock forgot password');
      return successResponse({ 
        message: 'If your email exists in our system, you will receive a password reset link'
      });
    }

    // Check if user exists
    let user;
    try {
      user = await executeDbOperation(async () => {
        return await User.findOne({ email });
      });
    } catch (error) {
      logger.error('Error finding user for password reset:', error);
      return errorResponse('Database error', 500);
    }

    // For security reasons, always return a success response even if the email doesn't exist
    // This prevents user enumeration attacks
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return successResponse({ 
        message: 'If your email exists in our system, you will receive a password reset link'
      });
    }

    // Generate reset token and save to user record
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    try {
      await executeDbOperation(async () => {
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();
      });
      logger.info(`Reset token generated for user: ${email}`);
    } catch (error) {
      logger.error(`Error saving reset token for user: ${email}`, error);
      return errorResponse('Failed to process reset request', 500);
    }

    // Send password reset email
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error(`Error sending reset email to: ${email}`, error);
      // Don't return an error to the client for security reasons
    }

    return successResponse({ 
      message: 'If your email exists in our system, you will receive a password reset link'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return errorResponse('Internal server error', 500);
  }
} 