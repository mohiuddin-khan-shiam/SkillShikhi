// app/api/admin/users/[id]/demote/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Helper function to verify admin token
async function verifyAdminToken(token) {
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return null;
    }
    
    await dbConnect();
    const admin = await User.findById(decoded.userId);
    if (!admin || admin.role !== 'admin') {
      return null;
    }
    
    return admin;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const admin = await verifyAdminToken(token);
    
    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }
    
    const userId = params.id;
    
    // Prevent admin from demoting themselves
    if (admin._id.toString() === userId) {
      return NextResponse.json(
        { message: 'You cannot remove your own admin privileges' },
        { status: 403 }
      );
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent demoting non-admin users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'User is not an admin' },
        { status: 400 }
      );
    }
    
    // Update user role to regular user
    user.role = 'user';
    await user.save();
    
    return NextResponse.json({
      message: 'Admin privileges removed successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error demoting admin:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to remove admin privileges' },
      { status: 500 }
    );
  }
}
