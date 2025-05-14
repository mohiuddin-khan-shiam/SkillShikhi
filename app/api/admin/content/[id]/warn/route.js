// app/api/admin/content/[id]/warn/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../../../lib/mongodb';
import Post from '../../../../../../models/Post';
import Comment from '../../../../../../models/Comment';
import Message from '../../../../../../models/Message';
import User from '../../../../../../models/User';
import { logActivity } from '../../../../../../utils/activityLogger';
import dotenv from 'dotenv';
dotenv.config();

console.log('Content warn endpoint loaded');

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
    
    return { userId: decoded.userId, token };
  } catch (error) {
    console.error('Token verification error:', error);
    return { error: 'Invalid token', status: 401 };
  }
}

// POST to warn user about content
export async function POST(request, { params }) {
  console.log(`ud83dudce5 POST /api/admin/content/${params.id}/warn HIT`);
  
  try {
    // Verify admin token
    const auth = await verifyAdminToken(request);
    
    if (auth.error) {
      console.log(`u274c ${auth.error}`);
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    // Get content ID from params
    const contentId = params.id;
    
    // Parse request body
    const body = await request.json();
    const { contentType, reason } = body;
    
    console.log(`Warning for ${contentType} with ID: ${contentId}, reason: ${reason}`);
    
    // Connect to database
    await dbConnect();
    
    // Determine which model to use based on content type
    let Model;
    switch (contentType) {
      case 'post':
        Model = Post;
        break;
      case 'comment':
        Model = Comment;
        break;
      case 'message':
        Model = Message;
        break;
      default:
        return NextResponse.json({ message: 'Invalid content type' }, { status: 400 });
    }
    
    // Find content
    const content = await Model.findById(contentId);
    
    if (!content) {
      console.log(`u274c ${contentType} not found: ${contentId}`);
      return NextResponse.json({ message: `${contentType} not found` }, { status: 404 });
    }
    
    // Mark content as warned
    content.isWarned = true;
    content.warnReason = reason;
    content.warnedAt = new Date();
    content.warnedBy = auth.userId;
    await content.save();
    
    // Send notification to the user
    const user = await User.findById(content.userId);
    if (user) {
      // Create a notification for the user
      const notification = {
        type: 'system',
        message: `Your ${contentType} has been flagged for violating our community guidelines. Reason: ${reason}`,
        read: false,
        createdAt: new Date()
      };
      
      // Add notification to user's notifications
      if (!user.notifications) {
        user.notifications = [];
      }
      
      user.notifications.push(notification);
      await user.save();
    }
    
    // Log activity
    await logActivity(auth.token, 'WARN_CONTENT', contentId, contentType, { reason });
    
    console.log(`u2705 ${contentType} warned: ${contentId}`);
    
    return NextResponse.json({ message: `User warned about ${contentType} successfully` });
  } catch (error) {
    console.error('u274c Error warning about content:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ message: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
