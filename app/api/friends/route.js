export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

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

// Get friends and friend requests
export async function GET(request) {
    console.log('📥 GET /api/friends HIT');
    try {
        await dbConnect();
        console.log('✅ Database connected');

        const decoded = verifyToken(request);
        if (!decoded) {
            console.log('❌ Authentication failed - no valid token');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ User authenticated:', decoded.userId);

        const user = await User.findById(decoded.userId)
            .populate('friends', '_id name profileImage')
            .populate('friendRequests.sent.user', '_id name profileImage')
            .populate('friendRequests.received.user', '_id name profileImage');

        if (!user) {
            console.log('❌ User not found:', decoded.userId);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        console.log('✅ Found user:', user.name);

        // Make sure all _id fields are properly stringified
        const response = {
            friends: user.friends.map(friend => ({
                ...friend.toObject(),
                _id: friend._id.toString()
            })) || [],
            sent: user.friendRequests?.sent
                .filter(req => req.status === 'pending') // Only include pending requests
                .map(req => ({
                    ...req.toObject(),
                    _id: req._id.toString(),
                    user: req.user && typeof req.user === 'object' ? {
                        ...req.user.toObject(),
                        _id: req.user._id.toString()
                    } : req.user.toString()
                })) || [],
            received: user.friendRequests?.received
                .filter(req => req.status === 'pending') // Only include pending requests
                .map(req => ({
                    ...req.toObject(),
                    _id: req._id.toString(),
                    user: req.user && typeof req.user === 'object' ? {
                        ...req.user.toObject(),
                        _id: req.user._id.toString()
                    } : req.user.toString()
                })) || []
        };

        console.log('📤 Returning friends data:', {
            friendsCount: response.friends.length,
            sentCount: response.sent.length,
            receivedCount: response.received.length
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('❌ Error fetching friends:', error.message);
        console.error(error.stack);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Send a friend request
export async function POST(request) {
    console.log('📥 POST /api/friends HIT');
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

        const { userId: targetUserId } = requestBody;
        if (!targetUserId) {
            console.log('❌ Missing target user ID');
            return NextResponse.json({ message: 'Target user ID is required' }, { status: 400 });
        }
        console.log('🎯 Target user ID:', targetUserId);

        // Prevent self-friend requests
        if (targetUserId === decoded.userId) {
            console.log('❌ Cannot send friend request to yourself');
            return NextResponse.json({ message: 'Cannot send friend request to yourself' }, { status: 400 });
        }

        // Check if users exist
        const currentUser = await User.findById(decoded.userId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser) {
            console.log('❌ Current user not found:', decoded.userId);
            return NextResponse.json({ message: 'Current user not found' }, { status: 404 });
        }

        if (!targetUser) {
            console.log('❌ Target user not found:', targetUserId);
            return NextResponse.json({ message: 'Target user not found' }, { status: 404 });
        }

        console.log('✅ Both users found - current:', currentUser.name, 'target:', targetUser.name);

        // Facebook-style relationship checks
        
        // 1. ALREADY FRIENDS CHECK
        // Check if they're already friends (using some() for better performance)
        const alreadyFriends = currentUser.friends.some(friend => friend.toString() === targetUserId);
        if (alreadyFriends) {
            console.log('⚠️ Already friends');
            return NextResponse.json({ message: 'Already friends with this user' }, { status: 400 });
        }

        // 2. PENDING REQUEST CHECKS

        // Case A: User has already sent a request to target (avoid duplicate requests)
        const existingSentRequest = currentUser.friendRequests.sent.some(
            req => req.user.toString() === targetUserId && req.status === 'pending'
        );
        
        if (existingSentRequest) {
            console.log('⚠️ Friend request already sent');
            return NextResponse.json({ message: 'Friend request already sent' }, { status: 400 });
        }

        // Case B: Target has already sent a request to user
        // In Facebook's algorithm, this would auto-accept the request
        const existingReceivedRequest = currentUser.friendRequests.received.find(
            req => req.user.toString() === targetUserId && req.status === 'pending'
        );

        if (existingReceivedRequest) {
            console.log('✨ Existing received request found - auto-accepting per Facebook algorithm');
            
            // Auto-accept the existing request (Facebook behavior)
            const timestamp = new Date();
            
            // Update request status
            existingReceivedRequest.status = 'accepted';
            existingReceivedRequest.updatedAt = timestamp;
            
            // Find sender's request to current user
            const senderRequestIndex = targetUser.friendRequests.sent.findIndex(
                req => req.user.toString() === decoded.userId && req.status === 'pending'
            );
            
            if (senderRequestIndex !== -1) {
                targetUser.friendRequests.sent[senderRequestIndex].status = 'accepted';
                targetUser.friendRequests.sent[senderRequestIndex].updatedAt = timestamp;
            }
            
            // Add to friends list on both sides with timestamp
            currentUser.friends.push({
                user: targetUserId,
                since: timestamp
            });
            
            targetUser.friends.push({
                user: decoded.userId,
                since: timestamp
            });
            
            // Create mutual friend notifications
            targetUser.notifications.push({
                type: 'friend_connected',
                fromUser: decoded.userId,
                message: `You and ${currentUser.name} are now connected!`,
                read: false,
                createdAt: timestamp
            });
            
            currentUser.notifications.push({
                type: 'friend_connected',
                fromUser: targetUserId,
                message: `You and ${targetUser.name} are now connected!`,
                read: false,
                createdAt: timestamp
            });
            
            await currentUser.save();
            await targetUser.save();
            
            return NextResponse.json({ 
                message: 'Friend connection established automatically', 
                status: 'connected' 
            });
        }

        // 3. STANDARD FRIEND REQUEST FLOW
        console.log('✅ No existing relationships, creating new friend request');

        const timestamp = new Date();
        
        // Add friend request with timestamp
        currentUser.friendRequests.sent.push({
            user: targetUserId,
            status: 'pending',
            createdAt: timestamp,
            updatedAt: timestamp
        });

        targetUser.friendRequests.received.push({
            user: decoded.userId,
            status: 'pending',
            createdAt: timestamp,
            updatedAt: timestamp
        });

        // Add notification for the target user
        targetUser.notifications.push({
            type: 'friend_request',
            fromUser: decoded.userId,
            message: `${currentUser.name} sent you a friend request`,
            read: false,
            createdAt: timestamp
        });

        await currentUser.save();
        await targetUser.save();
        console.log('✅ Friend request saved successfully');

        return NextResponse.json({ 
            message: 'Friend request sent successfully',
            status: 'pending'
        });
    } catch (error) {
        console.error('❌ Error sending friend request:', error.message);
        console.error(error.stack);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error.message
        }, { status: 500 });
    }
}

// Update a friend request (accept/reject)
export async function PUT(request) {
    console.log('📥 PUT /api/friends HIT');
    // Initialize action variable outside of try/catch to ensure it's accessible in catch block
    let action = 'process';

    try {
        await dbConnect();
        console.log('✅ Database connected');

        const decoded = verifyToken(request);
        if (!decoded) {
            console.log('❌ Authentication failed - no valid token');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ User authenticated:', decoded.userId);

        const body = await request.json();
        console.log('📦 Request body:', body);

        // Extract action from request body and assign to our outer scoped variable
        const { requestId, action: requestAction } = body;
        action = requestAction || action; // Use the provided action or keep default

        if (!requestId || !action) {
            console.log('❌ Missing requestId or action in request body');
            return NextResponse.json({ message: 'Request ID and action are required' }, { status: 400 });
        }

        if (!['accept', 'reject'].includes(action)) {
            console.log('❌ Invalid action:', action);
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        const currentUser = await User.findById(decoded.userId);
        if (!currentUser) {
            console.log('❌ Current user not found:', decoded.userId);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        console.log('✅ Found current user:', currentUser.name);

        // Find the request in received requests
        console.log('🔍 Looking for received request with ID:', requestId);
        const requestIndex = currentUser.friendRequests.received.findIndex(req => {
            const reqIdStr = req._id.toString();
            const targetIdStr = requestId.toString();
            console.log('🔄 Comparing request IDs:', reqIdStr, 'vs', targetIdStr);
            return reqIdStr === targetIdStr;
        });
        console.log('🔍 Received request index:', requestIndex);

        if (requestIndex === -1) {
            console.log('❌ Friend request not found in received requests');
            return NextResponse.json({ message: 'Friend request not found' }, { status: 404 });
        }

        const requestObj = currentUser.friendRequests.received[requestIndex];
        const senderUserId = requestObj.user;
        console.log('🎯 Sender user ID:', senderUserId);

        // Find the sender
        const senderUser = await User.findById(senderUserId);
        if (!senderUser) {
            console.log('❌ Sender user not found:', senderUserId);
            return NextResponse.json({ message: 'Sender user not found' }, { status: 404 });
        }
        console.log('✅ Found sender user:', senderUser.name);

        // Find the matching sent request and update its status
        console.log('🔍 Looking for matching sent request from sender');
        const senderRequestIndex = senderUser.friendRequests.sent.findIndex(req => {
            const reqUserStr = req.user.toString();
            const currentUserStr = decoded.userId.toString();
            console.log('🔄 Comparing user IDs:', reqUserStr, 'vs', currentUserStr);
            return reqUserStr === currentUserStr;
        });
        console.log('🔍 Sender request index:', senderRequestIndex);

        // Update the request status
        console.log('🔄 Updating request status to:', action);

        if (action === 'accept') {
            // Update statuses for both users
            currentUser.friendRequests.received[requestIndex].status = 'accepted';

            if (senderRequestIndex !== -1) {
                console.log('✅ Found and updating sender request status');
                senderUser.friendRequests.sent[senderRequestIndex].status = 'accepted';
            } else {
                console.log('⚠️ No matching sent request found on sender user');
            }

            console.log('🤝 Adding users to each other\'s friends list');
            // Add to friends list for both users
            if (!currentUser.friends.includes(senderUserId)) {
                currentUser.friends.push(senderUserId);
            }

            if (!senderUser.friends.includes(decoded.userId)) {
                senderUser.friends.push(decoded.userId);
            }

            // Add notification for the sender
            console.log('📣 Adding notification for sender');
            senderUser.notifications.push({
                type: 'friend_accepted',
                fromUser: decoded.userId,
                message: `${currentUser.name} accepted your friend request`,
                read: false,
                createdAt: new Date()
            });
        } else {
            // For reject action, remove the request completely from both users
            console.log('❌ Removing rejected request from both users');

            // Remove from current user's received requests
            currentUser.friendRequests.received.splice(requestIndex, 1);

            // Remove from sender's sent requests
            if (senderRequestIndex !== -1) {
                senderUser.friendRequests.sent.splice(senderRequestIndex, 1);

                // Add rejection notification
                senderUser.notifications.push({
                    type: 'friend_rejected',
                    fromUser: decoded.userId,
                    message: `${currentUser.name} declined your friend request`,
                    read: false,
                    createdAt: new Date()
                });
            }
        }

        console.log('💾 Saving changes to both users');
        await currentUser.save();
        await senderUser.save();
        console.log('✅ Successfully saved changes');

        return NextResponse.json({
            message: action === 'accept'
                ? 'Friend request accepted'
                : 'Friend request rejected'
        });
    } catch (error) {
        console.error(`❌ Error in friend request processing:`, error.message);
        console.error(error.stack);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
