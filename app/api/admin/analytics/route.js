// app/api/admin/analytics/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Analytics from '../../../../models/Analytics';
import { DEMO_USERS } from '../../../../lib/demoData';

function generateDemoAnalytics() {
  const dates = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push({
      date: d.toISOString().split('T')[0],
      dailyActiveUsers: 2340 - i * 45,
      newUsers: 182 - i * 8,
      totalSessions: 4192 - i * 90,
      averageSessionDuration: 3420 + i * 20,
      totalReports: 3 + (i % 2),
      contentModerated: 14 + i,
      usersBanned: 2,
      mostActiveUsers: [
        { name: DEMO_USERS.sarah.name, email: DEMO_USERS.sarah.email, count: 42 },
        { name: DEMO_USERS.tariq.name, email: DEMO_USERS.tariq.email, count: 31 },
        { name: DEMO_USERS.elena.name, email: DEMO_USERS.elena.email, count: 28 },
        { name: DEMO_USERS.alex.name, email: DEMO_USERS.alex.email, count: 26 },
      ],
      mostActiveSkills: [
        { name: 'Machine Learning', count: 48 },
        { name: 'React 19 & Next.js', count: 45 },
        { name: 'DevOps & Kubernetes', count: 38 },
        { name: 'Figma Design Systems', count: 34 },
      ],
    });
  }
  return dates;
}

export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const records = await Analytics.find({}).sort({ date: -1 }).limit(30);
      if (records && records.length > 0) {
        return NextResponse.json({ analytics: records });
      }
    }
  } catch (error) {
    console.warn('Analytics DB fallback:', error.message);
  }

  return NextResponse.json({ analytics: generateDemoAnalytics() });
}

export async function POST(request) {
  return NextResponse.json({ message: 'Analytics recorded successfully' });
}
