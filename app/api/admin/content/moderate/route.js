// app/api/admin/content/moderate/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import ActivityLog from '../../../../../models/ActivityLog';
import jwt from 'jsonwebtoken';

// Helper function to verify admin token
async function verifyAdminToken(request) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  // Verify token
  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
  
  // Get user from token
  const userId = decoded.userId;
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User not found', status: 404 };
  }
  
  // Check if user is admin
  if (!user.isAdmin) {
    return { error: 'Unauthorized - Admin access required', status: 403 };
  }
  
  return { user };
}

// POST to moderate content (delete, warn, etc.)
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    
    // Parse request body
    const body = await request.json();
    const { contentId, contentType, action, reason, notifyUser } = body;
    
    // Validate required fields
    if (!contentId || !contentType || !action) {
      return NextResponse.json({ 
        message: 'contentId, contentType, and action are required' 
      }, { status: 400 });
    }
    
    // Validate content type
    if (!['post', 'comment', 'message'].includes(contentType)) {
      return NextResponse.json({ 
        message: 'contentType must be one of: post, comment, message' 
      }, { status: 400 });
    }
    
    // Validate action
    if (!['delete', 'warn', 'flag', 'approve'].includes(action)) {
      return NextResponse.json({ 
        message: 'action must be one of: delete, warn, flag, approve' 
      }, { status: 400 });
    }
    
    // Determine which model to use based on content type
    let Model;
    if (contentType === 'post') {
      // Import dynamically to avoid circular dependencies
      const Post = (await import('../../../../../models/Post')).default;
      Model = Post;
    } else if (contentType === 'comment') {
      // Import dynamically to avoid circular dependencies
      const Comment = (await import('../../../../../models/Comment')).default;
      Model = Comment;
    } else if (contentType === 'message') {
      // Import dynamically to avoid circular dependencies
      const Message = (await import('../../../../../models/Message')).default;
      Model = Message;
    }
    
    // Find the content
    const content = await Model.findById(contentId);
    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }
    
    // Get the user who created the content
    const contentCreator = await User.findById(content.userId);
    if (!contentCreator) {
      return NextResponse.json({ message: 'Content creator not found' }, { status: 404 });
    }
    
    // Perform the requested action
    let result;
    switch (action) {
      case 'delete':
        // Delete the content
        result = await Model.findByIdAndDelete(contentId);
        break;
        
      case 'warn':
        // Add warning to user
        if (!contentCreator.warnings) {
          contentCreator.warnings = [];
        }
        
        contentCreator.warnings.push({
          contentId,
          contentType,
          reason: reason || 'Violation of community guidelines',
          timestamp: new Date()
        });
        
        await contentCreator.save();
        result = { warned: true, user: contentCreator._id };
        break;
        
      case 'flag':
        // Flag the content
        if (!content.flags) {
          content.flags = [];
        }
        
        content.flags.push({
          adminId: authResult.user._id,
          reason: reason || 'Flagged by admin',
          timestamp: new Date()
        });
        
        await content.save();
        result = { flagged: true, content: content._id };
        break;
        
      case 'approve':
        // Approve the content (remove flags)
        content.flags = [];
        content.approved = true;
        content.approvedBy = authResult.user._id;
        content.approvedAt = new Date();
        
        await content.save();
        result = { approved: true, content: content._id };
        break;
    }
    
    // Log the moderation action
    const log = new ActivityLog({
      userId: authResult.user._id,
      actionType: 'content_moderate',
      targetId: contentId,
      targetModel: contentType.charAt(0).toUpperCase() + contentType.slice(1),
      details: {
        action,
        reason: reason || 'Admin moderation',
        notifyUser: !!notifyUser
      }
    });
    
    await log.save();
    
    // If notifyUser is true, create a notification for the user
    if (notifyUser) {
      // Import dynamically to avoid circular dependencies
      const Notification = (await import('../../../../../models/Notification')).default;
      
      const notification = new Notification({
        userId: contentCreator._id,
        type: 'moderation',
        title: `Your ${contentType} has been ${action}ed`,
        message: reason || `Your ${contentType} has been ${action}ed by an admin.`,
        read: false,
        createdAt: new Date()
      });
      
      await notification.save();
    }
    
    return NextResponse.json({
      message: `Content ${action} successful`,
      result
    });
  } catch (error) {
    console.error('Error moderating content:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
