// app/api/admin/logs/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import ActivityLog from '../../../../models/ActivityLog';
import { DEMO_ADMIN_DATA } from '../../../../lib/demoData';

function getFallbackLogs() {
  return DEMO_ADMIN_DATA.systemAuditLogs.map((l) => ({
    _id: l.id,
    action: l.action,
    details: `${l.actor} -> ${l.target} (${l.status})`,
    timestamp: l.timestamp,
    createdAt: new Date().toISOString(),
    user: { name: l.actor, email: 'system@skillshikhi.demo' },
  }));
}

export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(30);
      if (logs && logs.length > 0) {
        return NextResponse.json({ logs });
      }
    }
  } catch (error) {
    console.warn('Logs admin DB fallback:', error.message);
  }

  return NextResponse.json({ logs: getFallbackLogs() });
}
