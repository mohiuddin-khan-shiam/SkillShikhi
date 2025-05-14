export const runtime = 'nodejs';

import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Verify JWT token from authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.userId;

        // Get request body
        const data = await request.json();
        const { targetUserId } = data;

        if (!targetUserId) {
            return NextResponse.json({ message: 'Target user ID is required' }, { status: 400 });
        }

        // Connect to database
        await dbConnect();

        // Find current user
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Find the friend request in sent requests
        const sentRequestIndex = currentUser.friendRequests.sent.findIndex(
            request => request.user.toString() === targetUserId && request.status === 'pending'
        );

        if (sentRequestIndex === -1) {
            return NextResponse.json({ message: 'Friend request not found' }, { status: 404 });
        }

        // Remove the request from current user's sent requests
        currentUser.friendRequests.sent.splice(sentRequestIndex, 1);
        await currentUser.save();

        // Find target user
        const targetUser = await User.findById(targetUserId);
        if (targetUser) {
            // Remove the request from target user's received requests
            const receivedRequestIndex = targetUser.friendRequests.received.findIndex(
                request => request.user.toString() === currentUserId && request.status === 'pending'
            );

            if (receivedRequestIndex !== -1) {
                targetUser.friendRequests.received.splice(receivedRequestIndex, 1);
                await targetUser.save();
            }

            // Add notification for the target user
            targetUser.notifications.push({
                type: 'friend_rejected',
                fromUser: currentUserId,
                message: `${currentUser.name} has canceled their friend request.`,
            });
            await targetUser.save();
        }

        return NextResponse.json({ message: 'Friend request canceled successfully' });
    } catch (error) {
        console.error('Error canceling friend request:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
} 