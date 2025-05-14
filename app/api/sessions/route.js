export const runtime = 'nodejs';

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { getSessions, createSessionRequest, updateSessionStatus } from '../../../controllers/session/sessionController';

// Helper to verify the JWT token from request headers
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Token verified for user: ${decoded.userId}`);
    return decoded;
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return null;
  }
}

// GET handler - Get sessions (upcoming, pending, or completed)
export async function GET(request) {
  try {
    // Verify token
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = decoded.userId;
    console.log(`🔍 Fetching sessions for user: ${userId}`);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || 'upcoming'; // "upcoming", "pending", or "completed"
    
    // Call the controller method to get sessions
    const result = await getSessions(userId, type);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    
    return NextResponse.json({ success: true, sessions: result.sessions });
  } catch (error) {
    console.error("Error in sessions route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler - Create a new session request
export async function POST(request) {
  try {
    // Verify token
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const fromUserId = decoded.userId;

    // Call the controller method to create a session request
    const result = await createSessionRequest(fromUserId, body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    
    return NextResponse.json({ success: true, session: result.session }, { status: result.status });
  } catch (error) {
    console.error('Error in create session route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler - Update session status
export async function PUT(request) {
  try {
    // Verify token
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = decoded.userId;
    const body = await request.json();
    
    // Call the controller method to update session status
    const result = await updateSessionStatus(userId, body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    
    return NextResponse.json({ success: true, session: result.session }, { status: result.status });
  } catch (error) {
    console.error('Error in update session route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}