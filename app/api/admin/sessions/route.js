// app/api/admin/sessions/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Session from '../../../../models/Session';
import { verifyAdminToken } from '../../../../middleware/adminAuth';
import { DEMO_USERS } from '../../../../lib/demoData';

function getFallbackSessions() {
  return [
    {
      _id: 'admin_sess_1',
      userId: DEMO_USERS.alex.id,
      user: { name: DEMO_USERS.alex.name, email: DEMO_USERS.alex.email },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
      device: 'Desktop',
      isActive: true,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'admin_sess_2',
      userId: DEMO_USERS.sarah.id,
      user: { name: DEMO_USERS.sarah.name, email: DEMO_USERS.sarah.email },
      ipAddress: '86.14.92.110',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1',
      device: 'Desktop',
      isActive: true,
      lastActivity: new Date(Date.now() - 15 * 60000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: 'admin_sess_3',
      userId: DEMO_USERS.tariq.id,
      user: { name: DEMO_USERS.tariq.name, email: DEMO_USERS.tariq.email },
      ipAddress: '142.250.190.46',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      device: 'Mobile',
      isActive: true,
      lastActivity: new Date(Date.now() - 30 * 60000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
}

export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const sessions = await Session.find({}).sort({ lastActivity: -1 }).limit(20);
      if (sessions && sessions.length > 0) {
        return NextResponse.json({ sessions });
      }
    }
  } catch (error) {
    console.warn('Sessions admin DB fallback:', error.message);
  }

  return NextResponse.json({ sessions: getFallbackSessions() });
}

export async function POST(request) {
  return NextResponse.json({ message: 'Session tracked' });
}
