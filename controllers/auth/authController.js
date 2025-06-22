// controllers/auth/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { executeDbOperation } from '../../services/databaseService';
import { validateUserRegistration, validateLoginCredentials } from '../../utils/validation';
import config from '../../config';
import logger from '../../services/loggerService';

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
    token = jwt.sign(
      { userId: user._id, email: user.email },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
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

/**
 * Handle user registration
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Object} Response object with success status and message
 */
export async function register(userData) {
  try {
    // Validate user registration data
    const validation = validateUserRegistration(userData);
    if (!validation.isValid) {
      return { 
        success: false, 
        message: 'Validation failed', 
        errors: validation.errors,
        status: 400 
      };
    }
    
    const { name, email, password } = userData;
    
    // Use database service for all database operations
    return await executeDbOperation(async () => {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { 
          success: false, 
          message: 'User already exists', 
          status: 400 
        };
      }
      
      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, config.auth.bcryptSaltRounds);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      
      return { 
        success: true, 
        message: 'User registered successfully', 
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        status: 201 
      };
    });
  } catch (error) {
    logger.error('Registration error', error);
    return { 
      success: false, 
      message: 'Something went wrong', 
      status: 500 
    };
  }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload or error
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    return { success: true, decoded };
  } catch (error) {
    return { success: false, message: 'Invalid token', error };
  }
}
