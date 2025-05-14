export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    console.log('❌ No authorization header found');
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('❌ No token found in authorization header');
    return null;
  }

  try {
    console.log('🔑 Verifying token:', token.substring(0, 15) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for user:', decoded.userId);
    return decoded;
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

export async function GET(request) {
  console.log('👁️ GET /api/public-profile/:id HIT');

  try {
    await dbConnect();

    // Extract ID directly from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    console.log('🔍 Requested user profile ID:', id);

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Log the full auth header for debugging
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'Not provided');

    // Verify the requester's identity
    const decoded = verifyToken(request);
    const requesterId = decoded?.userId;

    console.log('🔑 Requester ID:', requesterId || 'Not authenticated');

    // Find the requested user
    const user = await User.findById(id)
      .select('_id name bio skills availability location profileImage coverImage isPublic friends masteredSkills');

    if (!user) {
      console.log('❌ User not found:', id);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Log the isPublic value to debug
    console.log('🔒 User profile privacy setting:', user.isPublic);

    // Variables to track access levels
    let isSelf = false;
    let isFriend = false;

    // Check if user is viewing their own profile
    if (requesterId && requesterId === id) {
      console.log('🔓 User is viewing their own profile');
      isSelf = true;
    }
    // Check if users are friends
    else if (requesterId) {
      isFriend = await checkFriendshipStatus(requesterId, id);
      console.log(`👥 Friendship status: ${isFriend ? 'Friends' : 'Not friends'}`);
    }

    // For all profiles, include basic information
    const userResponse = {
      _id: user._id,
      name: user.name,
      profileImage: user.profileImage || '/images/profile-placeholder.png',
      coverImage: user.coverImage || '/images/cover-placeholder.png',
      isPublic: user.isPublic
    };

    // Private profile access rules:
    // 1. Return limited profile if not logged in and profile is private
    // 2. Return limited profile if logged in, not friends, and profile is private
    if (user.isPublic === false && !isSelf && !isFriend) {
      console.log('🔒 Access denied: Profile is private and users are not friends');
      console.log('   - Viewing own profile?', isSelf);
      console.log('   - Are friends?', isFriend);
      console.log('   - Profile is public?', user.isPublic);

      // For private profiles, return only basic info plus privacy status message
      return NextResponse.json({
        message: 'Profile is private',
        isPrivate: true,
        user: userResponse, // Only basic info
        debug: {
          viewingOwnProfile: isSelf,
          areFriends: isFriend,
          isPublic: user.isPublic
        }
      }, { status: 200 }); // Use 200 instead of 403 for better client handling
    }

    // Only add detailed info for public profiles or friends/self
    if (user.isPublic || isSelf || isFriend) {
      userResponse.bio = user.bio || '';
      userResponse.skills = user.skills || [];
      userResponse.availability = user.availability || '';
      userResponse.location = user.location || '';
      userResponse.masteredSkills = user.masteredSkills || [];
    }

    return NextResponse.json({
      user: userResponse,
      isPrivate: false
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json({
      message: 'Error fetching profile',
      error: error.message || 'Unknown server error'
    }, { status: 500 });
  }
}
