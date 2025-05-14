// app/api/admin/sessions/[id]/terminate/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import Session from '../../../../../../models/Session';
import ActivityLog from '../../../../../../models/ActivityLog';
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

// PATCH to terminate a session
export async function PATCH(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    
    // Get session ID from params
    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ message: 'Session ID is required' }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    const { reason } = body;
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }
    
    // Check if session is already terminated
    if (!session.isActive) {
      return NextResponse.json({ message: 'Session is already terminated' }, { status: 400 });
    }
    
    // Update session
    session.isActive = false;
    session.endTime = new Date();
    session.terminatedBy = authResult.user._id;
    session.terminationReason = reason || 'Admin terminated';
    
    await session.save();
    
    // Log the action
    const log = new ActivityLog({
      userId: authResult.user._id,
      actionType: 'session_terminate',
      targetId: session.userId,
      targetModel: 'User',
      details: {
        sessionId: session._id,
        reason: session.terminationReason
      }
    });
    
    await log.save();
    
    return NextResponse.json({
      message: 'Session terminated successfully',
      session
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
