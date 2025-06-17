import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Base64 URL decoder that works in both browser and Node.js
 */
export function base64UrlDecode(str) {
  // Replace non-url compatible chars with base64 standard chars
  let input = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad out with standard base64 required padding characters
  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
    }
    input += new Array(5-pad).join('=');
  }
  
  // Use either browser or Node.js approach to decode
  if (typeof atob === 'function') {
    return decodeURIComponent(atob(input).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } else {
    // Node.js approach
    return Buffer.from(input, 'base64').toString('utf-8');
  }
}

/**
 * Extract payload from JWT token without verification
 */
export function extractJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch (error) {
    console.error('Failed to extract JWT payload:', error);
    return null;
  }
}

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in the token
 * @returns {String} JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Extract token from authorization header
 * @param {String} authHeader - Authorization header
 * @returns {String|null} Token or null if not found
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}

/**
 * Get user data from request
 * @param {Object} req - Request object
 * @returns {Object|null} User data or null if not authenticated
 */
export function getUserFromRequest(req) {
  const authHeader = req.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Get user information from a JWT token
 * @param {string} token - JWT token
 * @returns {Object} User information from the token payload
 */
export function getUserInfoFromToken(token) {
  try {
    const payload = extractJwtPayload(token);
    return {
      userId: payload?.userId,
      email: payload?.email
    };
  } catch (error) {
    console.warn('Error extracting user info from token:', error.message);
    return null;
  }
}

/**
 * Determine if a token is valid by checking its format
 * @param {string} token - JWT token
 * @returns {boolean} Whether the token has a valid format
 */
export function hasValidTokenFormat(token) {
  try {
    const parts = token.split('.');
    return parts.length === 3;
  } catch (error) {
    return false;
  }
} 