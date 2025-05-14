// app/api/reports/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Report from '../../../models/Report';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify token
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    // Get user from token
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Parse request body
    const body = await request.json();
    const { reportedUserId, reason, details } = body;
    
    // Validate input
    if (!reportedUserId) {
      return NextResponse.json({ message: 'Reported user ID is required' }, { status: 400 });
    }
    
    if (!reason) {
      return NextResponse.json({ message: 'Reason is required' }, { status: 400 });
    }
    
    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return NextResponse.json({ message: 'Reported user not found' }, { status: 404 });
    }
    
    // Create report
    const report = new Report({
      reportedUser: reportedUserId,
      reportedBy: userId,
      reason,
      details: details || '',
      status: 'pending'
    });
    
    await report.save();
    
    return NextResponse.json({ message: 'Report submitted successfully', reportId: report._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Get all reports - only accessible by admins
export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify token
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    // Get user from token
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized - Admin access required' }, { status: 403 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    // Get reports
    const reports = await Report.find(query)
      .populate('reportedUser', 'name email profileImage')
      .populate('reportedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
