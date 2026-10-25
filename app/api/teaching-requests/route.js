export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { DEMO_SESSIONS, DEMO_USERS } from '../../../lib/demoData';

function getFallbackRequests() {
  return [
    {
      _id: 'req_1',
      skill: 'Neural Networks & PyTorch',
      status: 'pending',
      date: '2026-10-28',
      time: '18:00',
      message: 'Looking for guidance on PyTorch autograd and backprop optimization.',
      requester: {
        _id: DEMO_USERS.alex.id,
        name: DEMO_USERS.alex.name,
        email: DEMO_USERS.alex.email,
        profileImage: DEMO_USERS.alex.avatar,
      },
      teacher: {
        _id: DEMO_USERS.sarah.id,
        name: DEMO_USERS.sarah.name,
        email: DEMO_USERS.sarah.email,
        profileImage: DEMO_USERS.sarah.avatar,
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'req_2',
      skill: 'Dockerizing Microservices',
      status: 'accepted',
      date: '2026-10-29',
      time: '15:30',
      message: 'Would love help reviewing my Docker multi-stage build setup.',
      requester: {
        _id: DEMO_USERS.alex.id,
        name: DEMO_USERS.alex.name,
        email: DEMO_USERS.alex.email,
        profileImage: DEMO_USERS.alex.avatar,
      },
      teacher: {
        _id: DEMO_USERS.tariq.id,
        name: DEMO_USERS.tariq.name,
        email: DEMO_USERS.tariq.email,
        profileImage: DEMO_USERS.tariq.avatar,
      },
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (conn) {
      // If DB is connected and working, try to query
    }
  } catch (error) {
    console.warn('Teaching requests DB fallback:', error.message);
  }

  return NextResponse.json({
    requests: getFallbackRequests(),
  });
}

export async function POST(request) {
  return NextResponse.json({
    message: 'Teaching request submitted successfully',
    request: getFallbackRequests()[0],
  });
}
