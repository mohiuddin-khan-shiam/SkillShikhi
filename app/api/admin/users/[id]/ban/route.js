// app/api/admin/users/[id]/ban/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

console.log('Ban endpoint loaded');

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

// Ban a user - only accessible by admins
export async function PATCH(request, { params }) {
  console.log('📥 PATCH /api/admin/users/[id]/ban HIT');
  
  try {
    // Connect to database
    await dbConnect();
    console.log('Connected to database');
    
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      console.log(`❌ ${authResult.error}`);
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    
    console.log(`✅ Admin authenticated: ${authResult.user.name}`);
    
    // Get user ID from params
    const userId = params.id;
    if (!userId) {
      console.log('❌ User ID is required');
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`Processing ban request for user ID: ${userId}`);
    
    // Parse request body
    const body = await request.json();
    console.log('Ban request body:', body);
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ User not found with ID: ${userId}`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    console.log(`Found user: ${user.name} (${user._id})`);
    
    // Don't allow banning other admins
    if (user.isAdmin) {
      console.log(`❌ Cannot ban admin user: ${user.name}`);
      return NextResponse.json({ message: 'Cannot ban admin users' }, { status: 403 });
    }
    
    // Update user's ban status - always set to true for this endpoint
    user.isBanned = true;
    
    // Store ban reason if provided
    if (!user.banInfo) {
      user.banInfo = {};
    }
    
    user.banInfo.reason = body.reason || 'No reason provided';
    user.banInfo.bannedAt = new Date();
    user.banInfo.bannedBy = authResult.user._id;
    
    console.log(`Banning user ${user.name} (${user._id}) with reason: ${user.banInfo.reason}`);
    
    // Save the updated user
    const savedUser = await user.save();
    console.log('User saved with ban status:', savedUser.isBanned);
    
    // Double-check the ban status was set correctly
    const updatedUser = await User.findById(userId);
    console.log('User after save, ban status:', updatedUser.isBanned);
    
    return NextResponse.json({ 
      message: 'User banned successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isBanned: updatedUser.isBanned,
        banInfo: updatedUser.banInfo
      }
    });
  } catch (error) {
    console.error('❌ Error banning user:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ message: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
