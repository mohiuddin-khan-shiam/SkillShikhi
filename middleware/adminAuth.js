// middleware/adminAuth.js

import jwt from 'jsonwebtoken';
import dbConnect from '../lib/mongodb';
import User from '../models/User';

/**
 * Middleware to verify admin token and authenticate admin users
 * @param {Object} request - Next.js request object
 * @returns {Object} Authentication result with user and token or error
 */
export async function verifyAdminToken(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.isAdmin) {
      return { error: 'Unauthorized - Admin access required', status: 403 };
    }
    
    await dbConnect();
    
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isAdmin) {
      return { error: 'Unauthorized - Admin access required', status: 403 };
    }
    
    return { user, token };
  } catch (error) {
    console.error('Token verification error:', error);
    return { error: 'Invalid token', status: 401 };
  }
}
