// controllers/admin/adminAuthController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import dbConnect from '../../lib/mongodb';

/**
 * Verify admin token and check if user has admin privileges
 * @param {string} token - JWT token
 * @returns {Object} Response object with admin user data or error message
 */
export async function verifyAdminToken(token) {
  console.log('🔍 Verifying admin token');
  
  try {
    if (!token) {
      console.log('❌ No token provided');
      return { success: false, message: 'Unauthorized', status: 401 };
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified successfully');
    } catch (error) {
      console.error('❌ Token verification error:', error);
      return { success: false, message: 'Invalid token', status: 401 };
    }
    
    // Check if user is admin
    if (!decoded.isAdmin) {
      console.log('❌ User is not an admin');
      return { success: false, message: 'Unauthorized - Admin access required', status: 403 };
    }
    
    // Connect to database
    try {
      await dbConnect();
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      return { success: false, message: 'Database connection error', status: 500 };
    }
    
    // Find user
    let user;
    try {
      user = await User.findById(decoded.userId);
      console.log('🔍 User search completed');
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return { success: false, message: 'Error finding user', status: 500 };
    }
    
    if (!user) {
      console.log('❌ User not found for id:', decoded.userId);
      return { success: false, message: 'User not found', status: 404 };
    }
    
    // Double check if user is admin
    if (!user.isAdmin) {
      console.log('❌ User is not an admin in database:', decoded.userId);
      return { success: false, message: 'Unauthorized - Admin access required', status: 403 };
    }
    
    console.log('✅ Admin verification successful for user:', user.email);
    
    return {
      success: true,
      message: 'Admin verification successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: true
      },
      status: 200
    };
  } catch (error) {
    console.error('❌ Unexpected admin verification error:', error);
    return { success: false, message: 'Internal Server Error', status: 500 };
  }
}

/**
 * Handle admin login
 * @param {Object} credentials - Admin login credentials
 * @param {string} credentials.email - Admin email
 * @param {string} credentials.password - Admin password
 * @returns {Object} Response object with token and admin user data or error message
 */
export async function adminLogin(credentials) {
  console.log('📧 Admin login attempt for email:', credentials.email);

  try {
    const { email, password } = credentials;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return { success: false, message: 'Email and password are required', status: 400 };
    }

    // Connect to database
    try {
      await dbConnect();
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      return { success: false, message: 'Database connection error', status: 500 };
    }

    // Find user
    let user;
    try {
      user = await User.findOne({ email });
      console.log('🔍 User search completed');
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return { success: false, message: 'Error finding user', status: 500 };
    }

    if (!user) {
      console.log('❌ User not found for email:', email);
      return { success: false, message: 'Invalid email or password', status: 401 };
    }

    // Check if user is admin
    if (!user.isAdmin) {
      console.log('❌ User is not an admin:', email);
      return { success: false, message: 'Unauthorized - Admin access required', status: 403 };
    }

    // Compare password
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log('🔐 Password match:', isMatch);
    } catch (error) {
      console.error('❌ Password comparison error:', error);
      return { success: false, message: 'Authentication error', status: 500 };
    }

    if (!isMatch) {
      console.log('❌ Password mismatch for admin:', email);
      return { success: false, message: 'Invalid email or password', status: 401 };
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign(
        { userId: user._id, email: user.email, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log('🔑 Admin JWT token generated successfully');
    } catch (error) {
      console.error('❌ JWT generation error:', error);
      return { success: false, message: 'Authentication error', status: 500 };
    }

    console.log('✅ Admin login successful for user:', email);

    return {
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: true
      },
      status: 200
    };
  } catch (error) {
    console.error('❌ Unexpected admin login error:', error);
    return { success: false, message: 'Internal Server Error', status: 500 };
  }
}
