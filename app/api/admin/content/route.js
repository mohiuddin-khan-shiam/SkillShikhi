// app/api/admin/content/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import ActivityLog from '../../../../models/ActivityLog';
import Report from '../../../../models/Report';
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

// GET content for moderation with filtering options
export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type'); // 'post', 'comment', 'message'
    const reportStatus = searchParams.get('reportStatus'); // 'reported', 'flagged', 'all'
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Determine which model to query based on content type
    let Model;
    let query = {};
    
    // Add date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Add user filter if provided
    if (userId) {
      query.userId = userId;
    }
    
    // Add report status filter if provided
    if (reportStatus === 'reported') {
      // Get content that has been reported
      const reports = await Report.find({}).lean();
      const reportedContentIds = reports.map(report => report.targetId);
      query._id = { $in: reportedContentIds };
    } else if (reportStatus === 'flagged') {
      // Get content that has been flagged by the system
      query.flags = { $exists: true, $ne: [] };
    }
    
    // Determine which model to use based on content type
    if (contentType === 'post') {
      // Import dynamically to avoid circular dependencies
      const Post = (await import('../../../../models/Post')).default;
      Model = Post;
      // Adjust query for Post model structure
      if (userId) {
        query.user = userId;
        delete query.userId;
      }
    } else if (contentType === 'comment') {
      // For comments, we need to query posts and extract comments
      const Post = (await import('../../../../models/Post')).default;
      Model = Post;
      // We'll handle comments differently below
    } else if (contentType === 'message') {
      // Import dynamically to avoid circular dependencies
      const Message = (await import('../../../../models/Message')).default;
      Model = Message;
      // Adjust query for Message model structure
      if (userId) {
        query.$or = [{ sender: userId }, { recipient: userId }];
        delete query.userId;
      }
    } else {
      // Default to posts if no content type specified
      const Post = (await import('../../../../models/Post')).default;
      Model = Post;
      // Adjust query for Post model structure
      if (userId) {
        query.user = userId;
        delete query.userId;
      }
    }
    
    // Execute query with pagination
    let content = [];
    let total = 0;
    
    if (contentType === 'comment') {
      // For comments, we need to extract them from posts
      const posts = await Model.find()
        .populate({
          path: 'comments',
          populate: { path: 'author', select: 'name email profileImage' }
        })
        .lean();
      
      let allComments = [];
      
      posts.forEach(post => {
        if (post.comments && post.comments.length > 0) {
          post.comments.forEach(comment => {
            // Make sure comment has a user reference
            const commentUser = comment.author || { _id: comment.author };
            
            allComments.push({
              _id: comment._id,
              content: comment.content,
              createdAt: comment.createdAt,
              postId: post._id,
              postTitle: post.title || 'Untitled Post',
              postContent: post.content ? (post.content.substring(0, 50) + '...') : 'Post content unavailable',
              user: commentUser,
              userId: commentUser._id,
              reportCount: 0 // Will be updated below if needed
            });
          });
        }
      });
      
      // Apply filtering
      let filteredComments = allComments;
      if (userId) {
        filteredComments = filteredComments.filter(comment => 
          comment.user && comment.user._id.toString() === userId
        );
      }
      
      // Apply date filtering
      if (query.createdAt) {
        if (query.createdAt.$gte) {
          filteredComments = filteredComments.filter(comment => 
            new Date(comment.createdAt) >= new Date(query.createdAt.$gte)
          );
        }
        if (query.createdAt.$lte) {
          filteredComments = filteredComments.filter(comment => 
            new Date(comment.createdAt) <= new Date(query.createdAt.$lte)
          );
        }
      }
      
      // Apply pagination
      total = filteredComments.length;
      content = filteredComments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + limit);
      
    } else {
      // For posts and messages
      const populateField = contentType === 'post' ? 'user' : 'sender recipient';
      content = await Model.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(populateField, 'name email profileImage')
        .lean();
      
      total = await Model.countDocuments(query);
    }
    
    // If content is reported, add report count and details
    if (reportStatus === 'reported' && content.length > 0) {
      const reports = await Report.find({
        targetId: { $in: content.map(item => item._id.toString()) }
      }).lean();
      
      // Add report count to each content item
      content = content.map(item => {
        const itemReports = reports.filter(report => 
          report.targetId === item._id.toString()
        );
        return {
          ...item,
          reportCount: itemReports.length,
          reports: itemReports
        };
      });
    }
    
    // Return content with pagination info
    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching content for moderation:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST to moderate content (delete, flag, etc.)
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
    const { contentId, contentType, action, reason } = await request.json();
    
    if (!contentId || !contentType || !action) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // Determine which model to use based on content type
    let Model;
    if (contentType === 'post') {
      const Post = (await import('../../../../models/Post')).default;
      Model = Post;
    } else if (contentType === 'comment') {
      // For comments, we need special handling
      const Post = (await import('../../../../models/Post')).default;
      Model = Post;
    } else if (contentType === 'message') {
      const Message = (await import('../../../../models/Message')).default;
      Model = Message;
    } else {
      return NextResponse.json({ message: 'Invalid content type' }, { status: 400 });
    }
    
    // Perform action based on action type
    if (action === 'delete') {
      if (contentType === 'comment') {
        // For comments, we need to find the post containing the comment and remove it
        const post = await Model.findOne({ 'comments._id': contentId });
        if (!post) {
          return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }
        
        // Remove the comment from the post
        post.comments = post.comments.filter(comment => 
          comment._id.toString() !== contentId
        );
        await post.save();
        
      } else {
        // For posts and messages, simply delete the document
        const result = await Model.findByIdAndDelete(contentId);
        if (!result) {
          return NextResponse.json({ message: `${contentType} not found` }, { status: 404 });
        }
      }
      
      // Log the action
      await ActivityLog.create({
        user: authResult.user._id,
        actionType: 'content_moderate',
        details: {
          action: 'delete',
          contentType,
          contentId,
          reason
        }
      });
      
      return NextResponse.json({ message: `${contentType} deleted successfully` });
      
    } else if (action === 'flag') {
      // Flag content for further review
      if (contentType === 'comment') {
        // For comments, we need to find the post containing the comment and flag it
        const post = await Model.findOne({ 'comments._id': contentId });
        if (!post) {
          return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }
        
        // Find and update the comment
        const commentIndex = post.comments.findIndex(comment => 
          comment._id.toString() === contentId
        );
        
        if (commentIndex === -1) {
          return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }
        
        // Add flag to comment
        if (!post.comments[commentIndex].flags) {
          post.comments[commentIndex].flags = [];
        }
        
        post.comments[commentIndex].flags.push({
          reason,
          flaggedBy: authResult.user._id,
          flaggedAt: new Date()
        });
        
        await post.save();
        
      } else {
        // For posts and messages
        const content = await Model.findById(contentId);
        if (!content) {
          return NextResponse.json({ message: `${contentType} not found` }, { status: 404 });
        }
        
        // Add flag to content
        if (!content.flags) {
          content.flags = [];
        }
        
        content.flags.push({
          reason,
          flaggedBy: authResult.user._id,
          flaggedAt: new Date()
        });
        
        await content.save();
      }
      
      // Log the action
      await ActivityLog.create({
        user: authResult.user._id,
        actionType: 'content_moderate',
        details: {
          action: 'flag',
          contentType,
          contentId,
          reason
        }
      });
      
      return NextResponse.json({ message: `${contentType} flagged successfully` });
      
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error moderating content:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
