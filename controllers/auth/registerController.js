import bcrypt from 'bcryptjs';
import User from '../../models/User';
import { executeDbOperation } from '../../services/databaseService';
import { validateUserRegistration } from '../../utils/validation';
import config from '../../config';
import logger from '../../services/loggerService';

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
    
    // Development mode mock registration
    if (config.server.nodeEnv === 'development' && !config.database.uri) {
      logger.debug('Development mode: Mock user registration');
      return { 
        success: true, 
        message: 'User registered successfully (development mode)', 
        user: {
          id: 'mock-user-id',
          name,
          email
        },
        status: 201 
      };
    }
    
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