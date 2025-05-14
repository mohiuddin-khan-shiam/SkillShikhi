import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '../models/User';
import dbConnect from './mongodb';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate an admin JWT token
 * @param {Object} admin - Admin user object
 * @returns {String} JWT token
 */
export function generateAdminToken(admin) {
  return jwt.sign(
    { 
      userId: admin._id,
      email: admin.email,
      role: 'admin',
      isAdmin: true
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify a JWT token
 * @param {String} token - JWT token
 * @returns {Object|null} Decoded token or null if invalid
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
 * Extract and verify token from request headers
 * @param {Request} request - Next.js request object
 * @returns {Object|null} Decoded token or null if invalid
 */
export async function getAuthData(request) {
  try {
    // Check Authorization header
    const authHeader = request.headers.get('Authorization');
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Check cookies if no Authorization header
      const cookieStore = cookies();
      token = cookieStore.get('token')?.value;
    }
    
    if (!token) {
      return null;
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Error extracting auth data:', error);
    return null;
  }
}

/**
 * Verify if the request is from an admin user
 * @param {Request} request - Next.js request object
 * @returns {Object|null} Admin data or null if not admin
 */
export async function verifyAdminToken(request) {
  try {
    // Get auth data from token
    const authData = await getAuthData(request);
    if (!authData) {
      return null;
    }
    
    // Check if user has admin role
    if (authData.role !== 'admin' && !authData.isAdmin) {
      return null;
    }
    
    // Connect to database and verify admin status in DB
    await dbConnect();
    const user = await User.findById(authData.userId);
    
    if (!user || user.role !== 'admin') {
      return null;
    }
    
    return authData;
  } catch (error) {
    console.error('Admin verification failed:', error);
    return null;
  }
}

/**
 * Check if a user is authenticated
 * @param {Request} request - Next.js request object
 * @returns {Boolean} True if authenticated, false otherwise
 */
export async function isAuthenticated(request) {
  const authData = await getAuthData(request);
  return !!authData;
}

/**
 * Check if a user is an admin
 * @param {Request} request - Next.js request object
 * @returns {Boolean} True if admin, false otherwise
 */
export async function isAdmin(request) {
  const adminData = await verifyAdminToken(request);
  return !!adminData;
}
