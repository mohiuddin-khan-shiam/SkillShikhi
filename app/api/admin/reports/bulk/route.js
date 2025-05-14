// app/api/admin/reports/bulk/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Report from '../../../../../models/Report';
import User from '../../../../../models/User';
import { verifyAdminToken } from '../../../../../lib/auth';
import { createActivityLog } from '../../../../../lib/activityLogger';

// Handle bulk actions on reports
export async function POST(request) {
  console.log('ud83dudce5 POST /api/admin/reports/bulk HIT');

  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ message: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { reportIds, action } = body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json({ message: 'Report IDs are required and must be an array' }, { status: 400 });
    }

    if (!action || !['review', 'resolve', 'dismiss'].includes(action)) {
      return NextResponse.json({ message: 'Valid action is required (review, resolve, or dismiss)' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Map action to status
    const statusMap = {
      review: 'reviewed',
      resolve: 'resolved',
      dismiss: 'dismissed'
    };

    // Update reports with the specified action
    const updateResult = await Report.updateMany(
      { _id: { $in: reportIds } },
      { 
        $set: { 
          status: statusMap[action],
          updatedAt: new Date()
        } 
      }
    );

    // Log the activity
    await createActivityLog({
      userId: adminData.userId,
      action: `bulk_report_${action}`,
      details: `Bulk ${action} action on ${reportIds.length} reports`,
      metadata: {
        reportCount: reportIds.length,
        action: action
      }
    });

    return NextResponse.json({
      message: `Successfully performed ${action} action on ${updateResult.modifiedCount} reports`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('u274c Error performing bulk action on reports:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
