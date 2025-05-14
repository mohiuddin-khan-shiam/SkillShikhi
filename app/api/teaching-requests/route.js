export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyJWT } from '@/utils/jwt';
import mongoose from 'mongoose';
import TeachingRequest from '@/models/TeachingRequest';
import { verifyJwtToken } from '@/lib/jwt';

// Helper to verify the JWT token from request headers
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return null;
  }
}

// Helper function to check if a user exists
async function userExists(userId) {
  try {
    const user = await User.findById(userId);
    return !!user;
  } catch (error) {
    return false;
  }
}

// Helper function to verify the token and get user ID
const getUserIdFromToken = async (request) => {
  const token = request.cookies.get('token')?.value || '';
  if (!token) {
    return null;
  }
  
  try {
    const decoded = await verifyJwtToken(token);
    return decoded.id;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// GET handler - Get teaching requests (received or sent)
export async function GET(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || 'received'; // "received" or "sent"
    
    // Build query based on type
    let query = {};
    if (type === "received") {
      query = { toUser: userId };
    } else if (type === "sent") {
      query = { fromUser: userId };
    } else {
      // Default to all requests related to the user
      query = { $or: [{ toUser: userId }, { fromUser: userId }] };
    }
    
    // Fetch teaching requests and populate user details
    const requests = await TeachingRequest.find(query)
      .populate("fromUser", "name email profile.picture")
      .populate("toUser", "name email profile.picture")
      .sort({ createdAt: -1 });
    
    console.log(`Retrieved ${requests.length} teaching requests for user ${userId}`);
    
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching teaching requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler - Create a new teaching request
export async function POST(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { toUserId, skill, message, preferredDate } = body;

    if (!toUserId || !skill) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      User.findById(userId),
      User.findById(toUserId)
    ]);

    if (!fromUser || !toUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if a pending request already exists
    const existingRequest = await TeachingRequest.findOne({
      fromUser: userId,
      toUser: toUserId,
      skill,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'A pending request already exists' }, { status: 409 });
    }

    // Create new teaching request
    const newRequest = await TeachingRequest.create({
      fromUser: userId,
      toUser: toUserId,
      skill,
      message,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined
    });

    return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating teaching request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler - Update teaching request status
export async function PUT(request) {
  try {
    await dbConnect();
    
    // Verify token and get user ID
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - Token not provided" }, { status: 401 });
    }
    
    const { userId } = await verifyJWT(token);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { requestId, status } = body;
    
    // Validate required fields
    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: requestId and status are required" },
        { status: 400 }
      );
    }
    
    // Validate status value
    if (!["pending", "accepted", "rejected", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be one of: pending, accepted, rejected, completed" },
        { status: 400 }
      );
    }
    
    // Find the teaching request
    const teachingRequest = await TeachingRequest.findById(requestId);
    if (!teachingRequest) {
      return NextResponse.json(
        { error: "Teaching request not found" },
        { status: 404 }
      );
    }
    
    // Check if the user is authorized to update the request
    // Only the toUser can accept/reject and both users can mark as completed
    if (
      (status === "accepted" || status === "rejected") && 
      teachingRequest.toUser.toString() !== userId
    ) {
      return NextResponse.json(
        { error: "Unauthorized to update this request status" },
        { status: 403 }
      );
    }
    
    if (
      status === "completed" && 
      (teachingRequest.toUser.toString() !== userId && 
       teachingRequest.fromUser.toString() !== userId)
    ) {
      return NextResponse.json(
        { error: "Unauthorized to mark this request as completed" },
        { status: 403 }
      );
    }
    
    // Update the request status
    teachingRequest.status = status;
    teachingRequest.updatedAt = new Date();
    await teachingRequest.save();
    
    console.log(`Teaching request ${requestId} updated to status: ${status}`);
    
    return NextResponse.json(teachingRequest);
  } catch (error) {
    console.error("Error updating teaching request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update teaching request status
export async function PATCH(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await dbConnect();

    // Find the request and ensure the user is authorized to update it
    const teachingRequest = await TeachingRequest.findById(requestId);
    
    if (!teachingRequest) {
      return NextResponse.json({ error: 'Teaching request not found' }, { status: 404 });
    }

    // Only the recipient can update status
    if (teachingRequest.toUser.toString() !== userId) {
      return NextResponse.json({ error: 'Not authorized to update this request' }, { status: 403 });
    }

    // Update the request status
    teachingRequest.status = status;
    await teachingRequest.save();

    return NextResponse.json({ success: true, request: teachingRequest });
  } catch (error) {
    console.error('Error updating teaching request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 