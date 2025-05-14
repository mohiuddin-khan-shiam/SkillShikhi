export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return null;
  }
}

// Check if users are friends - checks bidirectionally
async function checkFriendshipStatus(userId1, userId2) {
  if (!userId1 || !userId2) {
    console.log('❌ Missing user IDs for friendship check');
    return false;
  }
  
  console.log(`🔍 Checking friendship between ${userId1} and ${userId2}`);
  
  try {
    // Convert IDs to strings for consistent comparison
    const user1IdStr = userId1.toString();
    const user2IdStr = userId2.toString();
    
    // Check direction 1: Is user2 in user1's friends list?
    const user1 = await User.findById(userId1);
    if (!user1 || !user1.friends) {
      console.log(`❌ User1 (${userId1}) not found or has no friends list`);
      return false;
    }
    
    // Log the friends list of user1 for debugging
    console.log(`👥 User1 (${user1.name}) friends:`, user1.friends.map(f => f.toString()));
    
    const direction1 = user1.friends.some(friendId => {
      const friendIdStr = friendId.toString();
      const isMatch = friendIdStr === user2IdStr;
      if (isMatch) console.log(`✅ ${user2IdStr} found in ${user1.name}'s friends list`);
      return isMatch;
    });
    
    // Early return if already confirmed as friends
    if (direction1) {
      console.log('✅ Friendship confirmed in direction 1');
      return true;
    }
    
    // Check direction 2: Is user1 in user2's friends list?
    const user2 = await User.findById(userId2);
    if (!user2 || !user2.friends) {
      console.log(`❌ User2 (${userId2}) not found or has no friends list`);
      return false;
    }
    
    // Log the friends list of user2 for debugging
    console.log(`👥 User2 (${user2.name}) friends:`, user2.friends.map(f => f.toString()));
    
    const direction2 = user2.friends.some(friendId => {
      const friendIdStr = friendId.toString();
      const isMatch = friendIdStr === user1IdStr;
      if (isMatch) console.log(`✅ ${user1IdStr} found in ${user2.name}'s friends list`);
      return isMatch;
    });
    
    if (direction2) {
      console.log('✅ Friendship confirmed in direction 2');
      return true;
    }
    
    // No friendship found in either direction
    console.log('❌ No friendship found in either direction');
    return false;
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return false;
  }
}

export async function GET(request, { params }) {
  console.log('🔍 GET /api/friends/check/[id] HIT');

  try {
    await dbConnect();
    console.log('✅ Database connected');

    // Extract the ID from URL path segments instead of using params directly
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const targetUserId = pathSegments[pathSegments.length - 1];
    
    console.log('🎯 Target user ID:', targetUserId);

    if (!targetUserId) {
      console.log('❌ Missing target user ID in URL');
      return NextResponse.json({ message: 'Target user ID is required' }, { status: 400 });
    }

    // Verify the requester's identity
    const decoded = verifyToken(request);
    if (!decoded) {
      console.log('❌ Authorization failed - invalid or missing token');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const requesterId = decoded.userId;
    console.log('🔑 Requester ID:', requesterId);

    // Check if users exist
    const requesterUser = await User.findById(requesterId);
    const targetUser = await User.findById(targetUserId);

    if (!requesterUser) {
      console.log('❌ Requester user not found:', requesterId);
      return NextResponse.json({ message: 'Requester not found' }, { status: 404 });
    }

    if (!targetUser) {
      console.log('❌ Target user not found:', targetUserId);
      return NextResponse.json({ message: 'Target user not found' }, { status: 404 });
    }

    console.log('✅ Both users found - requester:', requesterUser.name, 'target:', targetUser.name);

    // Check if these users are friends
    const isFriend = await checkFriendshipStatus(requesterId, targetUserId);
    
    // Return the friendship status
    return NextResponse.json({ 
      isFriend,
      requesterId: requesterUser._id,
      targetUserId: targetUser._id,
      requesterName: requesterUser.name,
      targetName: targetUser.name
    });
  } catch (error) {
    console.error('❌ Error checking friendship status:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 