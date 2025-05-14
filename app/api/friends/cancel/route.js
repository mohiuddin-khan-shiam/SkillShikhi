export const runtime = 'nodejs';

import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(request) {
    console.log('📥 POST /api/friends/cancel HIT');
    try {
        await dbConnect();
        console.log('✅ Database connected');

        // Verify token
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            console.log('❌ No authorization header found');
            return NextResponse.json({ message: 'Unauthorized - No token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token verified for user:', decoded.userId);
        } catch (error) {
            console.log('❌ Token verification failed:', error.message);
            return NextResponse.json({ message: 'Unauthorized - Invalid token' }, { status: 401 });
        }

        // Get request data
        const body = await request.json();
        console.log('📦 Request body:', body);

        // Handle both requestId and direct targetUserId approaches
        const { requestId, targetUserId } = body;
        
        if (!requestId && !targetUserId) {
            console.log('❌ Missing both requestId and targetUserId in request body');
            return NextResponse.json({ message: 'Either Request ID or Target User ID is required' }, { status: 400 });
        }
        
        if (requestId) {
            console.log('🔍 Request ID to cancel:', requestId);
        } else {
            console.log('🔍 Target user ID to find request for:', targetUserId);
        }

        // Find current user
        const currentUser = await User.findById(decoded.userId);
        if (!currentUser) {
            console.log('❌ Current user not found:', decoded.userId);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        console.log('✅ Found current user:', currentUser.name);

        // If we have a targetUserId but no requestId, find the request to that user
        let sentRequestIndex = -1;
        let recipientUserId;
        
        if (requestId) {
            // Find by request ID
            console.log('🔍 Looking for sent request with ID:', requestId);
            console.log('📋 Current user sent requests:', currentUser.friendRequests.sent);
            
            sentRequestIndex = currentUser.friendRequests.sent.findIndex(req => {
                // Handle both string and ObjectId comparisons
                const reqIdStr = req._id.toString();
                const targetIdStr = requestId.toString();
                console.log('🔄 Comparing request IDs:', reqIdStr, 'vs', targetIdStr);
                return reqIdStr === targetIdStr;
            });
            
            if (sentRequestIndex !== -1) {
                recipientUserId = currentUser.friendRequests.sent[sentRequestIndex].user;
            }
        } else {
            // Find by target user ID
            console.log('🔍 Looking for sent request to target user ID:', targetUserId);
            
            sentRequestIndex = currentUser.friendRequests.sent.findIndex(req => {
                const reqUserIdStr = req.user.toString();
                const targetIdStr = targetUserId.toString();
                console.log('🔄 Comparing user IDs:', reqUserIdStr, 'vs', targetIdStr);
                return reqUserIdStr === targetIdStr;
            });
            
            if (sentRequestIndex !== -1) {
                recipientUserId = targetUserId;
            }
        }

        console.log('🔍 Sent request index:', sentRequestIndex);

        if (sentRequestIndex === -1) {
            console.log('❌ Friend request not found in sent requests');
            return NextResponse.json({
                message: 'Friend request not found or you are not the sender'
            }, { status: 404 });
        }

        // Get the recipient user ID
        console.log('🎯 Recipient user ID:', recipientUserId);

        // Find the recipient user
        const recipientUser = await User.findById(recipientUserId);
        if (!recipientUser) {
            console.log('❌ Recipient user not found:', recipientUserId);
            return NextResponse.json({ message: 'Recipient user not found' }, { status: 404 });
        }
        console.log('✅ Found recipient user:', recipientUser.name);

        // Remove the request from the recipient's received requests
        console.log('🔍 Looking for received request from current user:', decoded.userId);
        const receivedRequestIndex = recipientUser.friendRequests.received.findIndex(req => {
            const reqUserStr = req.user.toString();
            const currentUserStr = decoded.userId.toString();
            console.log('🔄 Comparing user IDs:', reqUserStr, 'vs', currentUserStr);
            return reqUserStr === currentUserStr;
        });

        console.log('🔍 Received request index:', receivedRequestIndex);

        if (receivedRequestIndex !== -1) {
            console.log('✅ Found and removing received request at index:', receivedRequestIndex);
            recipientUser.friendRequests.received.splice(receivedRequestIndex, 1);
        } else {
            console.log('⚠️ No matching received request found on recipient user');
        }

        // Remove the request from the sender's sent requests
        console.log('✅ Removing sent request at index:', sentRequestIndex);
        currentUser.friendRequests.sent.splice(sentRequestIndex, 1);

        // Save both users
        console.log('💾 Saving changes to both users');
        await currentUser.save();
        await recipientUser.save();
        console.log('✅ Successfully saved changes');

        return NextResponse.json({ 
            message: 'Friend request cancelled successfully',
            success: true 
        });
    } catch (error) {
        console.error('❌ Error cancelling friend request:', error.message);
        console.error(error.stack);
        return NextResponse.json({
            message: 'Error cancelling friend request',
            error: error.message
        }, { status: 500 });
    }
} 