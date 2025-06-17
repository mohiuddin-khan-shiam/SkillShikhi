import jwt from 'jsonwebtoken';
import config from '../../config';

/**
 * Create a development fallback for JWT secret
 * @returns {string} JWT secret
 */
const getJwtSecret = () => {
  if (!config.auth.jwtSecret && config.server.nodeEnv === 'development') {
    console.log('⚠️ Development mode: Using fallback JWT_SECRET');
    return 'development-jwt-secret-key';
  }
  return config.auth.jwtSecret;
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload or error
 */
export function verifyToken(token) {
  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return { success: false, message: 'Server configuration error' };
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    return { success: true, decoded };
  } catch (error) {
    return { success: false, message: 'Invalid token', error };
  }
} 