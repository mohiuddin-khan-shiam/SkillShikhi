// app/api/reports/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Report from '../../../../models/Report';
import User from '../../../../models/User';
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

// Update a report - only accessible by admins
export async function PATCH(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    
    // Get report ID from params
    const reportId = params.id;
    if (!reportId) {
      return NextResponse.json({ message: 'Report ID is required' }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    const { status, reviewNotes } = body;
    
    // Validate status
    if (!status || !['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ 
        message: 'Status must be one of: reviewed, resolved, dismissed' 
      }, { status: 400 });
    }
    
    // Find and update report
    const report = await Report.findById(reportId);
    if (!report) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }
    
    // Update report
    report.status = status;
    if (reviewNotes) {
      report.reviewNotes = reviewNotes;
    }
    report.reviewedBy = authResult.user._id;
    report.updatedAt = new Date();
    
    await report.save();
    
    return NextResponse.json({ 
      message: 'Report updated successfully',
      report: {
        _id: report._id,
        status: report.status,
        reviewNotes: report.reviewNotes,
        reviewedBy: report.reviewedBy,
        updatedAt: report.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
