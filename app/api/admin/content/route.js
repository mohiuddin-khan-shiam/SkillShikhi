// app/api/admin/content/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import { DEMO_POSTS, DEMO_USERS } from '../../../../lib/demoData';

function getFallbackContent() {
  return DEMO_POSTS.map((p) => ({
    _id: p.id,
    type: 'post',
    content: p.content,
    author: p.author,
    createdAt: p.createdAt,
    reportCount: 0,
    reports: [],
    status: 'approved',
  }));
}

export async function GET(request) {
  return NextResponse.json({
    content: getFallbackContent(),
    pagination: {
      page: 1,
      limit: 10,
      total: DEMO_POSTS.length,
      pages: 1,
    },
  });
}

export async function POST(request) {
  return NextResponse.json({ message: 'Moderation action applied' });
}
