// app/api/admin/sessions/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Session from '../../../../models/Session';
import User from '../../../../models/User';
import ActivityLog from '../../../../models/ActivityLog';
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

// GET active sessions with filtering options
export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (isActive !== undefined) query.isActive = isActive;
    
    // Add date range if provided
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const sessions = await Session.find(query)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email profileImage')
      .lean();
    
    // Get total count for pagination
    const total = await Session.countDocuments(query);
    
    // Calculate session durations for active sessions
    const sessionsWithDuration = sessions.map(session => {
      const endTimeOrNow = session.endTime || new Date();
      const durationMs = endTimeOrNow - new Date(session.startTime);
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      
      return {
        ...session,
        durationMinutes
      };
    });
    
    return NextResponse.json({
      sessions: sessionsWithDuration,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST to create a new session (for internal use)
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { userId, sessionId, ipAddress, userAgent, device, location } = body;
    
    // Validate required fields
    if (!userId || !sessionId) {
      return NextResponse.json({ message: 'userId and sessionId are required' }, { status: 400 });
    }
    
    // Check if this user already has an active session
    const existingSession = await Session.findOne({ 
      userId, 
      isActive: true 
    });
    
    if (existingSession) {
      // Update the existing session with the new lastActivity time
      existingSession.lastActivity = new Date();
      existingSession.activityCount = (existingSession.activityCount || 0) + 1;
      
      // If there's new information, update it
      if (ipAddress) existingSession.ipAddress = ipAddress;
      if (userAgent) existingSession.userAgent = userAgent;
      if (device) existingSession.device = device;
      if (location) existingSession.location = location;
      
      await existingSession.save();
      
      return NextResponse.json({
        message: 'Session updated successfully',
        session: existingSession
      });
    }
    
    // Create new session
    const session = new Session({
      userId,
      sessionId,
      ipAddress,
      userAgent,
      device,
      location,
      startTime: new Date(),
      lastActivity: new Date(),
      isActive: true,
      activityCount: 1
    });
    
    await session.save();
    
    return NextResponse.json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
