export const runtime = 'nodejs';

import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile } from '../../../controllers/user/userController';

// Helper function to verify JWT token
function verifyToken(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      console.log('❌ No auth header found for profile API');
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Token verified for user: ${decoded.userId}`);
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return null;
  }
}

// GET user profile
export async function GET(request) {
  console.log('🔍 GET /api/profile HIT');
  
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Call the controller method to get user profile
    const result = await getUserProfile(decoded.userId);
    
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    
    return NextResponse.json(result.user);
  } catch (error) {
    console.error('❌ Error in profile route:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PUT to update user profile
export async function PUT(request) {
  console.log('✏️ PUT /api/profile HIT');
  
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    
    // Call the controller method to update user profile
    const result = await updateUserProfile(decoded.userId, data);
    
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    
    return NextResponse.json(result.user);
  } catch (error) {
    console.error('❌ Error in profile update route:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}
