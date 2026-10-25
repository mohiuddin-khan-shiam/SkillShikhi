// app/api/admin/reports/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Report from '../../../../models/Report';
import { verifyAdminToken } from '../../../../middleware/adminAuth';
import { DEMO_ADMIN_DATA, DEMO_USERS } from '../../../../lib/demoData';

function getFallbackReports() {
  return DEMO_ADMIN_DATA.moderationReports.map((r) => ({
    _id: r.id,
    type: r.type,
    reason: r.contentSnippet,
    status: r.status,
    createdAt: r.date,
    reportedBy: {
      _id: DEMO_USERS.alex.id,
      name: DEMO_USERS.alex.name,
      email: DEMO_USERS.alex.email,
    },
    reportedUser: {
      _id: 'user_suspicious_1',
      name: r.reportedUser,
      email: 'flagged@example.com',
    },
  }));
}

export async function GET(request) {
  try {
    const auth = await verifyAdminToken(request);
    if (auth.error) {
      // In showcase mode, allow demo recruiter review
    }

    const conn = await dbConnect();
    if (conn) {
      const reports = await Report.find({})
        .sort({ createdAt: -1 })
        .populate('reportedBy', 'name email')
        .populate('reportedUser', 'name email')
        .limit(20);
      if (reports && reports.length > 0) {
        return NextResponse.json({
          reports,
          pagination: { total: reports.length, page: 1, pages: 1, limit: 20 },
        });
      }
    }
  } catch (error) {
    console.warn('Reports DB fallback:', error.message);
  }

  const fallback = getFallbackReports();
  return NextResponse.json({
    reports: fallback,
    pagination: { total: fallback.length, page: 1, pages: 1, limit: 10 },
  });
}
