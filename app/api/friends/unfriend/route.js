export const runtime = 'nodejs';

import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

export async function POST(request) {
    console.log('📥 POST /api/friends/unfriend HIT');
    try {
        await dbConnect();
        console.log('✅ Database connected');

        const decoded = verifyToken(request);
        if (!decoded) {
            console.log('❌ Authorization failed - invalid or missing token');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ User authenticated:', decoded.userId);

        const requestBody = await request.json();
        console.log('📦 Request body:', requestBody);

        const { friendId } = requestBody;
        if (!friendId) {
            console.log('❌ Missing friend ID');
            return NextResponse.json({ message: 'Friend ID is required' }, { status: 400 });
        }
        console.log('🎯 Friend ID to remove:', friendId);

        // Check if users exist
        const currentUser = await User.findById(decoded.userId);
        const friendUser = await User.findById(friendId);

        if (!currentUser) {
            console.log('❌ Current user not found:', decoded.userId);
            return NextResponse.json({ message: 'Current user not found' }, { status: 404 });
        }

        if (!friendUser) {
            console.log('❌ Friend user not found:', friendId);
            return NextResponse.json({ message: 'Friend user not found' }, { status: 404 });
        }

        console.log('✅ Both users found - current:', currentUser.name, 'friend:', friendUser.name);

        // Check if they're actually friends
        const isFriend = currentUser.friends.some(friend => friend.toString() === friendId);
        if (!isFriend) {
            console.log('❌ Users are not friends');
            return NextResponse.json({ message: 'You are not friends with this user' }, { status: 400 });
        }

        console.log('🔄 Removing from current user\'s friends list');
        // Remove friend from current user's list
        currentUser.friends = currentUser.friends.filter(friend => friend.toString() !== friendId);

        console.log('🔄 Removing from friend\'s friends list');
        // Remove current user from friend's list
        friendUser.friends = friendUser.friends.filter(friend => friend.toString() !== decoded.userId);

        // Also clean up any pending friend requests between these users
        console.log('🧹 Cleaning up any pending friend requests');

        // Remove any sent requests from current user to friend
        currentUser.friendRequests.sent = currentUser.friendRequests.sent.filter(req =>
            req.user.toString() !== friendId
        );

        // Remove any received requests from friend to current user
        currentUser.friendRequests.received = currentUser.friendRequests.received.filter(req =>
            req.user.toString() !== friendId
        );

        // Remove any sent requests from friend to current user
        friendUser.friendRequests.sent = friendUser.friendRequests.sent.filter(req =>
            req.user.toString() !== decoded.userId
        );

        // Remove any received requests from current user to friend
        friendUser.friendRequests.received = friendUser.friendRequests.received.filter(req =>
            req.user.toString() !== decoded.userId
        );

        // Add notification for the friend user
        friendUser.notifications.push({
            type: 'unfriend',
            fromUser: decoded.userId,
            message: `${currentUser.name} has removed you as a friend`,
            read: false,
            createdAt: new Date()
        });

        await currentUser.save();
        await friendUser.save();
        console.log('✅ Successfully unfriended');

        return NextResponse.json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('❌ Error unfriending:', error.message);
        console.error(error.stack);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
} 