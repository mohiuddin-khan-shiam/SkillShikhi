// app/api/admin/users/[id]/unban/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import jwt from 'jsonwebtoken';

// Helper function to verify admin token
async function verifyAdminToken(request) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  // Verify token
  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
  
  // Get user from token
  const userId = decoded.userId;
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User not found', status: 404 };
  }
  
  // Check if user is admin
  if (!user.isAdmin) {
    return { error: 'Unauthorized - Admin access required', status: 403 };
  }
  
  return { user };
}

// Unban a user - only accessible by admins
export async function PATCH(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    
    // Get user ID from params
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    
    // Parse request body - make this optional
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      console.log('No request body or invalid JSON, continuing with default values');
    }
    
    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Check if user is already unbanned
    if (!user.isBanned) {
      return NextResponse.json({ 
        message: 'User is already unbanned',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isBanned: user.isBanned
        }
      });
    }
    
    // Update user's ban status
    user.isBanned = false;
    
    // Clear ban info if it exists
    if (user.banInfo) {
      user.banInfo = undefined;
    }
    
    console.log(`Unbanning user ${user.name} (${user._id})`);
    await user.save();
    
    return NextResponse.json({ 
      message: 'User unbanned successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ message: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
