// app/api/admin/logs/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import ActivityLog from '../../../../models/ActivityLog';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '../../../../utils/apiResponse';

// Helper function to verify admin token
async function verifyAdminToken(request) {
  try {
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
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found', status: 404 };
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      return { error: 'Unauthorized - Admin access required', status: 403 };
    }
    
    return { user };
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return { error: 'Internal server error', status: 500 };
  }
}

// GET logs with filtering options
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
    const actionType = searchParams.get('actionType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (actionType) query.actionType = actionType;
    
    // Add date range if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean();
    
    // Get total count for pagination
    const total = await ActivityLog.countDocuments(query);
    
    return successResponse({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST a new log entry (for internal use)
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return errorResponse('Invalid request body', 400);
    }
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Authentication required', 401);
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    let userId;
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      
      // Use the userId from the token to ensure security
      body.userId = userId;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return errorResponse('Invalid authentication token', 401);
    }
    
    const { actionType, targetId, targetModel, ipAddress, userAgent, details } = body;
    
    // Validate required fields
    if (!userId || !actionType) {
      return errorResponse('userId and actionType are required', 400);
    }
    
    // Create new log entry
    const log = new ActivityLog({
      userId,
      actionType,
      targetId,
      targetModel,
      ipAddress,
      userAgent,
      details,
      timestamp: new Date()
    });
    
    await log.save();
    
    return successResponse({
      message: 'Activity log created successfully',
      log
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return errorResponse('Internal server error', 500);
  }
}
