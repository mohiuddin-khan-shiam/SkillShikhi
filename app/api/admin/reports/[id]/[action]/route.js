// app/api/admin/reports/[id]/[action]/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../../../lib/mongodb';
import Report from '../../../../../../models/Report';
import User from '../../../../../../models/User';
import { logActivity } from '../../../../../../utils/activityLogger';
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

// POST to perform an action on a report (resolve, dismiss)
export async function POST(request, { params }) {
  console.log(`📥 POST /api/admin/reports/${params.id}/${params.action} HIT`);
  
  try {
    // Verify admin token
    const auth = await verifyAdminToken(request);
    
    if (auth.error) {
      console.log(`❌ ${auth.error}`);
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    const { user, token } = auth;
    
    // Get report ID and action from params
    const { id, action } = params;
    
    // Validate action
    if (!['resolve', 'dismiss'].includes(action)) {
      console.log(`❌ Invalid action: ${action}`);
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    const { reason } = body;
    
    // Connect to database
    await dbConnect();
    
    // Find report
    const report = await Report.findById(id);
    
    if (!report) {
      console.log(`❌ Report not found: ${id}`);
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }
    
    // Check if report is already resolved or dismissed
    if (report.status !== 'pending') {
      console.log(`❌ Report already ${report.status}: ${id}`);
      return NextResponse.json({ message: `Report already ${report.status}` }, { status: 400 });
    }
    
    // Update report status
    report.status = action === 'resolve' ? 'resolved' : 'dismissed';
    report.reviewNotes = reason || '';
    report.reviewedBy = user._id;
    report.updatedAt = new Date();
    
    await report.save();
    
    // Log activity
    await logActivity(token, `${action.toUpperCase()}_REPORT`, report._id, 'Report', { reason });
    
    console.log(`✅ Report ${action}d successfully: ${id}`);
    
    return NextResponse.json({
      message: `Report ${action}d successfully`,
      report
    });
  } catch (error) {
    console.error(`❌ Error ${params.action}ing report:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
