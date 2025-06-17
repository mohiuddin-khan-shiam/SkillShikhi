import { successResponse, errorResponse } from '../../../../utils/apiResponse';
import User from '../../../../models/User';
import { executeDbOperation } from '../../../../services/databaseService';
import { isTokenExpired } from '../../../../utils/tokenUtils';
import logger from '../../../../services/loggerService';

export async function GET(request) {
  try {
    // Extract token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      logger.warn('Password reset attempt with missing token');
      return errorResponse('Token is required', 400);
    }

    // In development mode without a database, return a success response
    if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI) {
      logger.debug('Development mode: Mock token validation');
      return successResponse({ 
        message: 'Token is valid',
        valid: true
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

    logger.info(`Valid reset token used for user: ${user.email}`);
    return successResponse({
      message: 'Token is valid',
      valid: true
    });
  } catch (error) {
    logger.error('Token validation error:', error);
    return errorResponse('Internal server error', 500);
  }
} 