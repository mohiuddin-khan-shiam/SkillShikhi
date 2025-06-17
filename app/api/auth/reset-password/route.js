import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '../../../../utils/apiResponse';
import User from '../../../../models/User';
import { executeDbOperation } from '../../../../services/databaseService';
import { isTokenExpired } from '../../../../utils/tokenUtils';
import config from '../../../../config';
import logger from '../../../../services/loggerService';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      logger.warn('Password reset attempt with missing token or password');
      return errorResponse('Token and password are required', 400);
    }

    // Validate password
    if (password.length < 8) {
      logger.warn('Password reset attempt with short password');
      return errorResponse('Password must be at least 8 characters long', 400);
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      logger.warn('Password reset attempt with password missing a number');
      return errorResponse('Password must contain at least one number', 400);
    }

    // In development mode without a database, return a success response
    if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI) {
      logger.debug('Development mode: Mock password reset');
      return successResponse({ 
        message: 'Password has been reset successfully'
      });
    }

    // Find user with the reset token
    let user;
    try {
      user = await executeDbOperation(async () => {
        return await User.findOne({ 
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: new Date() }
        });
      });
    } catch (error) {
      logger.error('Error finding reset token:', error);
      return errorResponse('Database error', 500);
    }

    if (!user) {
      // For security reasons, don't specify if token was invalid or just expired
      logger.warn(`Reset token not found or expired: ${token.substring(0, 10)}...`);
      return errorResponse('Invalid or expired token', 400);
    }

    // Check if token is expired
    if (isTokenExpired(user.resetPasswordExpires)) {
      logger.warn(`Expired reset token used for user: ${user.email}`);
      return errorResponse('Token has expired', 400);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, config.auth.bcryptSaltRounds);

    // Update user password and clear reset token
    try {
      await executeDbOperation(async () => {
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
      });
      
      logger.info(`Password reset successful for user: ${user.email}`);
    } catch (error) {
      logger.error(`Error updating password for user: ${user.email}`, error);
      return errorResponse('Failed to update password', 500);
    }

    return successResponse({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    return errorResponse('Internal server error', 500);
  }
} 