import jwt from 'jsonwebtoken';

// Secret key for JWT should be in environment variables in a real application
const JWT_SECRET = process.env.JWT_SECRET || 'skillshikhi-secret-key';

/**
 * Verify a JWT token and return the decoded data if valid
 * @param {string} token - The JWT token to verify
 * @returns {object|null} The decoded token if valid, null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user ID to encode in the token
 * @param {string} email - The user email to encode in the token
 * @returns {string} The JWT token
 */
export function generateToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email 
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

/**
 * Extract user ID from request headers authorization token
 * @param {object} req - The request object
 * @returns {string|null} The user ID if token is valid, null otherwise
 */
export function getUserIdFromRequest(req) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    
    const decoded = verifyToken(token);
    return decoded?.userId || null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
}
