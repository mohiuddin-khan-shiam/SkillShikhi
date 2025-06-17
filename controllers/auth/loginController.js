import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { executeDbOperation } from '../../services/databaseService';
import { validateLoginCredentials } from '../../utils/validation';
import config from '../../config';
import logger from '../../services/loggerService';

// Create a development fallback for JWT secret
const getJwtSecret = () => {
  if (!config.auth.jwtSecret && config.server.nodeEnv === 'development') {
    console.log('⚠️ Development mode: Using fallback JWT_SECRET');
    return 'development-jwt-secret-key';
  }
  return config.auth.jwtSecret;
};

/**
 * Handle user login
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Object} Response object with token and user data or error message
 */
export async function login(credentials) {
  logger.info(`Login attempt for email: ${credentials.email}`);

  // Validate login credentials
  const validation = validateLoginCredentials(credentials);
  if (!validation.isValid) {
    logger.warn('Validation failed', validation.errors);
    return { 
      success: false, 
      message: 'Validation failed', 
      errors: validation.errors, 
      status: 400 
    };
  }

  const { email, password } = credentials;

  // Development mode mock user (when no DB is available)
  if (config.server.nodeEnv === 'development' && !config.database.uri) {
    logger.debug('Using mock user in development mode');
    // For development, accept any credentials with valid format
    const mockUser = {
      _id: 'mock-user-id',
      name: 'Test User',
      email,
      isAdmin: email.includes('admin')
    };

    // Generate JWT token with fallback secret
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined');
      return { success: false, message: 'Server configuration error', status: 500 };
    }

    const token = jwt.sign(
      { userId: mockUser._id, email: mockUser.email },
      jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn || '7d' }
    );

    logger.info(`Development mode: Mock login successful for user: ${email}`);
    return {
      success: true,
      message: 'Login successful (development mode)',
      token,
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        isAdmin: mockUser.isAdmin
      },
      status: 200
    };
  }

  // Find user
  let user;
  try {
    user = await executeDbOperation(async () => {
      return await User.findOne({ email });
    });
    logger.debug('User search completed');
  } catch (error) {
    logger.error('Error finding user', error);
    return { success: false, message: 'Error finding user', status: 500 };
  }

  if (!user) {
    logger.warn(`User not found for email: ${email}`);
    return { success: false, message: 'Invalid email or password', status: 401 };
  }

  // Compare password
  let isMatch;
  try {
    isMatch = await bcrypt.compare(password, user.password);
    logger.debug(`Password match: ${isMatch}`);
  } catch (error) {
    logger.error('Password comparison error', error);
    return { success: false, message: 'Authentication error', status: 500 };
  }

  if (!isMatch) {
    logger.warn(`Password mismatch for user: ${email}`);
    return { success: false, message: 'Invalid email or password', status: 401 };
  }

  // Generate JWT token
  let token;
  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined');
      return { success: false, message: 'Server configuration error', status: 500 };
    }

    token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn || '7d' }
    );
    logger.debug('JWT token generated successfully');
  } catch (error) {
    logger.error('JWT generation error', error);
    return { success: false, message: 'Authentication error', status: 500 };
  }

  logger.info(`Login successful for user: ${email}`);

  return {
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false
    },
    status: 200
  };
}

export { getJwtSecret }; 