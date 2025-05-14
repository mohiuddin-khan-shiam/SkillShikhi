export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import dbConnect from '../../../../../lib/mongodb';
import Post from '../../../../../models/Post';
import User from '../../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    console.log('❌ No authorization header found in posts API');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('❌ No token found in authorization header of posts API');
    return null;
  }

  try {
    console.log('🔑 Posts API verifying token:', token.substring(0, 15) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Posts API token verified for user:', decoded.userId);
    return decoded;
  } catch (err) {
    console.log('❌ Posts API token verification failed:', err.message);
    return null;
  }
}

// Check if users are friends
async function checkFriendshipStatus(userId1, userId2) {
  if (!userId1 || !userId2) {
    console.log('❌ Missing user IDs for friendship check in posts API');
    return false;
  }
  
  console.log(`🔍 Posts API checking friendship between ${userId1} and ${userId2}`);
  
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
    console.log(`👥 User1 friends for posts API:`, user1.friends.map(f => f.toString()));
    
    const direction1 = user1.friends.some(friendId => {
      const friendIdStr = friendId.toString();
      const isMatch = friendIdStr === user2IdStr;
      if (isMatch) console.log(`✅ ${user2IdStr} found in user's friends list`);
      return isMatch;
    });
    
    // Early return if already confirmed as friends
    if (direction1) {
      console.log('✅ Posts API: Friendship confirmed in direction 1');
      return true;
    }
    
    // Check direction 2: Is user1 in user2's friends list?
    const user2 = await User.findById(userId2);
    if (!user2 || !user2.friends) {
      console.log(`❌ User2 (${userId2}) not found or has no friends list`);
      return false;
    }
    
    // Log the friends list of user2 for debugging
    console.log(`👥 User2 friends for posts API:`, user2.friends.map(f => f.toString()));
    
    const direction2 = user2.friends.some(friendId => {
      const friendIdStr = friendId.toString();
      const isMatch = friendIdStr === user1IdStr;
      if (isMatch) console.log(`✅ ${user1IdStr} found in other user's friends list`);
      return isMatch;
    });
    
    if (direction2) {
      console.log('✅ Posts API: Friendship confirmed in direction 2');
      return true;
    }
    
    // No friendship found in either direction
    console.log('❌ Posts API: No friendship found in either direction');
    return false;
  } catch (error) {
    console.error('Error checking friendship status in posts API:', error);
    return false;
  }
}

export async function GET(request) {
  console.log('📥 GET /api/posts/user/[id] HIT');
  
  try {
    await dbConnect();
    
    // Extract user ID from the URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];
    
    console.log('🔍 Looking for posts from user:', userId);
    
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    
    // Log the auth header for debugging
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Posts API Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'Not provided');
    
    // Verify the requester's identity
    const decoded = verifyToken(request);
    const requesterId = decoded?.userId;
    
    console.log('🔑 Posts API Requester ID:', requesterId || 'Not authenticated');
    
    // Post visibility rules:
    // 1. User can always see their own posts
    // 2. Friends can see each other's posts (regardless of privacy settings)
    // 3. Public profiles' posts are visible to everyone
    // 4. Private profiles' posts are only visible to friends
    
    // Check authorization - if no token, we'll only check if the target user is public
    if (!requesterId) {
      console.log('⚠️ No token provided, checking if user is public');
      const targetUser = await User.findById(userId);
      
      if (!targetUser) {
        console.log('❌ Target user not found');
        return NextResponse.json({ posts: [] });
      }
      
      console.log(`🔒 Target user privacy setting: isPublic=${targetUser.isPublic}`);
      
      if (!targetUser.isPublic) {
        console.log('🔒 User is not public or does not exist');
        return NextResponse.json({ posts: [] });
      }
      
      console.log('🔓 User has a public profile, showing posts to unauthenticated user');
    } 
    // If token is valid, perform authorization checks
    else {
      console.log('🔍 Requester ID for posts:', requesterId);
      
      // Case 1: User is viewing their own posts
      const isSelfView = String(requesterId) === String(userId);
      
      if (isSelfView) {
        console.log('👤 User is viewing their own posts');
      }
      else {
        // Case 2: Check if requester is friends with the post owner
        const requester = await User.findById(requesterId);
        
        if (!requester) {
          console.log('❌ Requester not found');
          return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        // Use the improved friendship check
        const isFriend = await checkFriendshipStatus(requesterId, userId);
        
        const targetUser = await User.findById(userId);
        if (!targetUser) {
          console.log('❌ Target user not found');
          return NextResponse.json({ posts: [] });
        }
        
        const isTargetUserPublic = targetUser.isPublic;
        console.log(`🔒 Target user privacy setting: isPublic=${isTargetUserPublic}`);
        
        // If not friends and the target user is not public, return empty posts
        if (!isFriend && !isTargetUserPublic) {
          console.log('🔒 Access denied: Not friends and user is not public');
          return NextResponse.json({ posts: [] });
        }
        
        console.log(`👥 Friendship status for posts: ${isFriend ? 'Friends' : 'Not friends'}`);
        
        if (!isFriend && isTargetUserPublic) {
          console.log('🌐 User has public profile, posts visible to non-friend');
        } else if (isFriend) {
          console.log('🤝 Friends can see each other\'s posts regardless of privacy');
        }
      }
    }
    
    // Find posts by the user and sort by newest first
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage');
      
    console.log(`✅ Found ${posts.length} posts for user ${userId}`);
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json({ message: 'Failed to fetch user posts' }, { status: 500 });
  }
} 