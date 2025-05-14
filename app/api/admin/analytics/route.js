// app/api/admin/analytics/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Analytics from '../../../../models/Analytics';
import User from '../../../../models/User';
import Session from '../../../../models/Session';
import Report from '../../../../models/Report';
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

// GET analytics data with date range filtering
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json'; // 'json', 'csv'
    
    // Build query
    const query = {};
    
    // Add date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Execute query
    const analyticsData = await Analytics.find(query)
      .sort({ date: -1 })
      .lean();
    
    // If no analytics data exists or if we need to refresh it
    if (analyticsData.length === 0 || searchParams.get('refresh') === 'true') {
      // Generate analytics data on the fly
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get start date (default to 30 days ago if not provided)
      const queryStartDate = startDate ? new Date(startDate) : new Date(today);
      queryStartDate.setDate(queryStartDate.getDate() - 30);
      
      // Get end date (default to today if not provided)
      const queryEndDate = endDate ? new Date(endDate) : today;
      
      // Generate real-time analytics
      const realtimeAnalytics = await generateRealtimeAnalytics(queryStartDate, queryEndDate);
      
      // Return the real-time data
      if (format === 'csv') {
        // Convert to CSV
        const csv = await convertToCSV(realtimeAnalytics);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="analytics-${startDate}-to-${endDate}.csv"`
          }
        });
      }
      
      return NextResponse.json({
        analytics: realtimeAnalytics,
        isRealtime: true
      });
    }
    
    // Return the stored analytics data
    if (format === 'csv') {
      // Convert to CSV
      const csv = await convertToCSV(analyticsData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${startDate}-to-${endDate}.csv"`
        }
      });
    }
    
    return NextResponse.json({
      analytics: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate real-time analytics
async function generateRealtimeAnalytics(startDate, endDate) {
  const analytics = [];
  
  // Loop through each day in the date range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Get daily active users
    const dailyActiveUsers = await Session.distinct('userId', {
      lastActivity: { $gte: dayStart, $lte: dayEnd }
    }).countDocuments();
    
    // Get new users
    const newUsers = await User.countDocuments({
      createdAt: { $gte: dayStart, $lte: dayEnd }
    });
    
    // Get total sessions
    const totalSessions = await Session.countDocuments({
      startTime: { $gte: dayStart, $lte: dayEnd }
    });
    
    // Get average session duration
    const sessions = await Session.find({
      startTime: { $gte: dayStart, $lte: dayEnd },
      endTime: { $exists: true }
    }).lean();
    
    let totalDuration = 0;
    let sessionCount = 0;
    
    sessions.forEach(session => {
      const duration = new Date(session.endTime) - new Date(session.startTime);
      totalDuration += duration;
      sessionCount++;
    });
    
    const averageSessionDuration = sessionCount > 0 ? Math.floor(totalDuration / sessionCount / 1000) : 0;
    
    // Get total reports
    const totalReports = await Report.countDocuments({
      createdAt: { $gte: dayStart, $lte: dayEnd }
    });
    
    // Get content moderated
    const contentModerated = await ActivityLog.countDocuments({
      actionType: 'content_moderate',
      timestamp: { $gte: dayStart, $lte: dayEnd }
    });
    
    // Get users banned
    const usersBanned = await ActivityLog.countDocuments({
      actionType: 'account_ban',
      timestamp: { $gte: dayStart, $lte: dayEnd }
    });
    
    // Get most active users
    const userActivity = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: dayStart, $lte: dayEnd } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', activityCount: '$count', name: '$user.name', email: '$user.email' } }
    ]);
    
    // Get most reported users
    const reportedUsers = await Report.aggregate([
      { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
      { $group: { _id: '$reportedUser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', reportCount: '$count', name: '$user.name', email: '$user.email' } }
    ]);
    
    // Create analytics object for this day
    const dayAnalytics = {
      date: new Date(currentDate),
      dailyActiveUsers,
      newUsers,
      totalSessions,
      averageSessionDuration,
      totalReports,
      contentModerated,
      usersBanned,
      mostActiveUsers: userActivity,
      mostReportedUsers: reportedUsers
    };
    
    analytics.push(dayAnalytics);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return analytics;
}

// Helper function to convert data to CSV
async function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle strings with commas by wrapping in quotes
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      // Format dates
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}



// POST to manually trigger analytics generation
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    
    // Parse request body
    const body = await request.json();
    const { date } = body;
    
    if (!date) {
      return NextResponse.json({ message: 'Date is required' }, { status: 400 });
    }
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Check if analytics already exist for this date
    const existingAnalytics = await Analytics.findOne({ date: targetDate });
    
    // Generate analytics for the specified date
    const analyticsData = (await generateRealtimeAnalytics(targetDate, targetDate))[0];
    
    if (existingAnalytics) {
      // Update existing analytics
      Object.assign(existingAnalytics, analyticsData);
      await existingAnalytics.save();
      
      return NextResponse.json({
        message: 'Analytics updated successfully',
        analytics: existingAnalytics
      });
    } else {
      // Create new analytics
      const analytics = new Analytics(analyticsData);
      await analytics.save();
      
      return NextResponse.json({
        message: 'Analytics generated successfully',
        analytics
      });
    }
  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
