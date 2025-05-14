export const runtime = 'nodejs';

import dotenv from 'dotenv';
dotenv.config();

import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Post from '../../../models/Post';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  console.log('🔍 Auth Header:', authHeader);

  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    return decoded;
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return null;
  }
}

// Upload media to Cloudinary
async function uploadToCloudinary(base64Data, folder, resourceType = 'image') {
  try {
    const uploadResponse = await cloudinary.v2.uploader.upload(base64Data, {
      folder: `skillshikhi/${folder}`,
      resource_type: resourceType,
    });
    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// Parse multipart form data
async function parseFormData(request) {
  const formData = await request.formData();
  const content = formData.get('content');
  const skillTag = formData.get('skillTag');
  const media = formData.get('media');

  let mediaInfo = null;
  
  if (media) {
    // Convert file to base64 for Cloudinary upload
    const buffer = await media.arrayBuffer();
    const base64String = `data:${media.type};base64,${Buffer.from(buffer).toString('base64')}`;
    
    // Determine resource type
    const resourceType = media.type.startsWith('image/') ? 'image' : 'video';
    
    // Upload to Cloudinary
    mediaInfo = await uploadToCloudinary(base64String, 'posts', resourceType);
    mediaInfo.type = resourceType;
  }
  
  return {
    content,
    skillTag,
    mediaInfo,
  };
}

// GET all posts
export async function GET(request) {
  console.log('📥 GET /api/posts HIT');
  await dbConnect();
  
  try {
    // Fetch posts with user information
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage')
      .limit(20);
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ message: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST create a new post
export async function POST(request) {
  console.log('📤 POST /api/posts HIT');
  await dbConnect();
  
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse form data from the request
    const { content, skillTag, mediaInfo } = await parseFormData(request);
    
    if (!content || !skillTag) {
      return NextResponse.json({ message: 'Content and skill tag are required' }, { status: 400 });
    }
    
    // Create new post
    const post = new Post({
      user: decoded.userId,
      content,
      skillTag,
      mediaUrl: mediaInfo?.url || null,
      mediaType: mediaInfo?.type || null,
    });
    
    await post.save();
    
    // Return the created post
    return NextResponse.json({ message: 'Post created successfully', post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ message: 'Failed to create post' }, { status: 500 });
  }
} 