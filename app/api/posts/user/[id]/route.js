export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import dbConnect from '../../../../../lib/mongodb';
import Post from '../../../../../models/Post';
import { NextResponse } from 'next/server';
import { DEMO_POSTS } from '../../../../../lib/demoData';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const conn = await dbConnect();
    if (conn) {
      const posts = await Post.find({ user: id })
        .sort({ createdAt: -1 })
        .populate('user', 'name profileImage avatar');
      if (posts && posts.length > 0) {
        return NextResponse.json({ posts });
      }
    }
  } catch (error) {
    console.warn('User posts DB fallback:', error.message);
  }

  // Filter demo posts for this user or provide default sample posts
  const matching = DEMO_POSTS.filter((p) => p.author?.id === id || p.author?.username === id);
  return NextResponse.json({
    posts: matching.length > 0 ? matching : DEMO_POSTS,
  });
}
