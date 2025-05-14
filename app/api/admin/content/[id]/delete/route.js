// app/api/admin/content/[id]/delete/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../../../lib/mongodb';
import Post from '../../../../../../models/Post';
import Comment from '../../../../../../models/Comment';
import Message from '../../../../../../models/Message';
import { logActivity } from '../../../../../../utils/activityLogger';
import dotenv from 'dotenv';
dotenv.config();

console.log('Content delete endpoint loaded');

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

// POST to delete content
export async function POST(request, { params }) {
  console.log(`📥 POST /api/admin/content/${params.id}/delete HIT`);
  
  try {
    // Verify admin token
    const auth = await verifyAdminToken(request);
    
    if (auth.error) {
      console.log(`❌ ${auth.error}`);
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    // Get content ID from params
    const contentId = params.id;
    
    // Parse request body
    const body = await request.json();
    const { contentType, reason } = body;
    
    console.log(`Deleting ${contentType} with ID: ${contentId}, reason: ${reason}`);
    
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
      console.log(`❌ ${contentType} not found: ${contentId}`);
      return NextResponse.json({ message: `${contentType} not found` }, { status: 404 });
    }
    
    // Delete content
    await Model.findByIdAndDelete(contentId);
    
    // Log activity
    await logActivity(auth.token, 'DELETE_CONTENT', contentId, contentType, { reason });
    
    console.log(`✅ ${contentType} deleted: ${contentId}`);
    
    return NextResponse.json({ message: `${contentType} deleted successfully` });
  } catch (error) {
    console.error('❌ Error deleting content:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ message: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
