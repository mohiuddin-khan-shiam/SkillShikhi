export const runtime = 'nodejs';

import dbConnect from '../../../../lib/mongodb';
import Post from '../../../../models/Post';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Verify JWT token
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

// Check if users are friends
async function checkFriendshipStatus(userId1, userId2) {
  if (!userId1 || !userId2) return false;
  
  try {
    console.log(`🔍 Checking friendship between user ${userId1} and ${userId2}`);
    
    // First check: userId2 in userId1's friends list
    const user = await User.findById(userId1);
    if (!user || !user.friends) {
      console.log(`❌ User ${userId1} not found or has no friends array`);
      return false;
    }

    // Convert both IDs to strings to ensure consistent comparison
    const targetIdStr = String(userId2);
    
    // Debug log the friends array
    console.log(`👥 User's friends array:`, user.friends.map(f => String(f)));
    
    // Check if userId2 is in userId1's friends list using string comparison
    const isFriend = user.friends.some(friendId => {
      // Handle both object IDs and string IDs
      const friendIdStr = typeof friendId === 'object' && friendId._id 
        ? String(friendId._id) 
        : String(friendId);
      
      const isMatch = friendIdStr === targetIdStr;
      console.log(`🔄 Comparing friend ID ${friendIdStr} with target ${targetIdStr}: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      return isMatch;
    });
    
    if (isFriend) {
      console.log(`✅ Users are friends! ${userId1} and ${userId2}`);
      return true;
    }

    // Double check: Also verify the reverse relationship (userId1 in userId2's friends list)
    const otherUser = await User.findById(userId2);
    if (!otherUser || !otherUser.friends) {
      console.log(`❌ User ${userId2} not found or has no friends array`);
      return false;
    }
    
    // Debug log the other user's friends array
    console.log(`👥 Other user's friends array:`, otherUser.friends.map(f => String(f)));
    
    const isAlsoFriend = otherUser.friends.some(friendId => {
      const friendIdStr = typeof friendId === 'object' && friendId._id 
        ? String(friendId._id) 
        : String(friendId);
      
      const isMatch = friendIdStr === String(userId1);
      console.log(`🔄 Reverse check - Comparing friend ID ${friendIdStr} with ${String(userId1)}: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      return isMatch;
    });
    
    if (isAlsoFriend) {
      console.log(`✅ Reverse friendship check confirmed! ${userId2} has ${userId1} as friend`);
      return true;
    }
    
    console.log(`❌ Users are not friends: ${userId1} and ${userId2}`);
    return false;
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return false;
  }
}

// Check if user has permission to interact with a post
async function hasPostAccessPermission(postId, userId) {
  try {
    console.log(`🔄 Checking if user ${userId} has permission to access post ${postId}`);
    
    const post = await Post.findById(postId).populate('user', '_id name');
    if (!post) {
      console.log(`❌ Post ${postId} not found`);
      return false;
    }
    
    // Log the post details for debugging
    console.log(`📝 Post details: ID=${post._id}, Owner=${typeof post.user === 'object' ? post.user._id : post.user}`);
    
    // Get the post owner ID as string
    const postOwnerId = typeof post.user === 'object' ? String(post.user._id) : String(post.user);
    const currentUserId = String(userId);
    
    // Always allow users to interact with their own posts
    if (postOwnerId === currentUserId) {
      console.log(`✅ User ${userId} is interacting with their own post`);
      return true;
    }
    
    // Check if users are friends
    const isFriend = await checkFriendshipStatus(userId, postOwnerId);
    
    // If they're friends, allow interaction
    if (isFriend) {
      console.log(`✅ User ${userId} is friends with post owner ${postOwnerId}`);
      return true;
    }
    
    // Check if post owner has a public profile
    const postOwner = await User.findById(postOwnerId);
    if (!postOwner) {
      console.log(`❌ Post owner ${postOwnerId} not found in database`);
      return false;
    }
    
    console.log(`🔒 Post owner ${postOwnerId} privacy settings: isPublic=${postOwner.isPublic}`);
    
    if (postOwner.isPublic) {
      console.log(`✅ Post owner ${postOwnerId} has a public profile`);
      return true;
    }
    
    console.log(`❌ User ${userId} does not have permission to interact with post ${postId}`);
    console.log(`   - Not the post owner`);
    console.log(`   - Not friends with post owner`);
    console.log(`   - Post owner has a private profile`);
    
    return false;
  } catch (error) {
    console.error('Error checking post access permission:', error);
    return false;
  }
}

export async function POST(request) {
  console.log('👍 POST /api/posts/like HIT');
  await dbConnect();
  
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { postId } = body;
    
    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    
    // Check if user has permission to like this post
    const hasPermission = await hasPostAccessPermission(postId, decoded.userId);
    if (!hasPermission) {
      return NextResponse.json({ 
        message: 'You do not have permission to like this post' 
      }, { status: 403 });
    }
    
    const userId = decoded.userId;
    const userLikedIndex = post.likes.indexOf(userId);
    
    if (userLikedIndex === -1) {
      // User hasn't liked the post yet - add like
      post.likes.push(userId);
      await post.save();
      return NextResponse.json({ message: 'Post liked successfully', liked: true });
    } else {
      // User already liked the post - remove like
      post.likes.splice(userLikedIndex, 1);
      await post.save();
      return NextResponse.json({ message: 'Post unliked successfully', liked: false });
    }
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    return NextResponse.json({ message: 'Failed to update like status' }, { status: 500 });
  }
} 