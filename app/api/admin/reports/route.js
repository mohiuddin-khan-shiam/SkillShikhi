// app/api/admin/reports/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../lib/mongodb';
import Report from '../../../../models/Report';
import User from '../../../../models/User';
import { logActivity } from '../../../../utils/activityLogger';
import dotenv from 'dotenv';
dotenv.config();

// Verify admin token function
async function verifyAdminToken(request) {
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

// GET reports with pagination and filters
export async function GET(request) {
  console.log('📥 GET /api/admin/reports HIT');
  
  try {
    // Verify admin token
    const auth = await verifyAdminToken(request);
    
    if (auth.error) {
      console.log(`❌ ${auth.error}`);
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    const { user, token } = auth;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.reason = type;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // End of the day
        query.createdAt.$lte = endDateObj;
      }
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Report.countDocuments(query);
    
    // Get reports with pagination
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reportedBy', 'name email profileImage')
      .populate('reportedUser', 'name email profileImage')
      .populate('reviewedBy', 'name');
    
    // Log activity
    await logActivity(token, 'VIEW_REPORTS', null, 'Report', { filters: { status, type, startDate, endDate } });
    
    console.log(`✅ Retrieved ${reports.length} reports`);
    
    return NextResponse.json({
      reports,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST to create a new report
export async function POST(request) {
  console.log('📥 POST /api/admin/reports HIT');
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        console.error('❌ Token verification error:', error);
        // Continue without user ID for anonymous reports
      }
    }
    
    // Connect to database
    await dbConnect();
    
    // Create new report
    const report = new Report({
      reporterId: userId,
      reportType: body.reportType,
      reportedUser: body.reportedUser,
      reportedContent: body.reportedContent,
      reportedContentId: body.reportedContentId,
      contentLink: body.contentLink,
      reason: body.reason,
      status: 'pending'
    });
    
    await report.save();
    
    console.log('✅ Report created successfully');
    
    return NextResponse.json({
      message: 'Report submitted successfully',
      reportId: report._id
    });
  } catch (error) {
    console.error('❌ Error creating report:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
