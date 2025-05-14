export const runtime = 'nodejs';

import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(request) {
    console.log('📥 POST /api/friends/cancel-request HIT');
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

        const { targetUserId } = body;
        
        if (!targetUserId) {
            console.log('❌ Missing targetUserId in request body');
            return NextResponse.json({ message: 'Target User ID is required' }, { status: 400 });
        }
        
        console.log('🔍 Target user ID to find request for:', targetUserId);

        // Find current user
        const currentUser = await User.findById(decoded.userId);
        if (!currentUser) {
            console.log('❌ Current user not found:', decoded.userId);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        console.log('✅ Found current user:', currentUser.name);

        // Print all sent requests for debugging
        const sentRequests = currentUser.friendRequests.sent.map(req => ({
            id: req._id.toString(),
            userId: typeof req.user === 'object' ? req.user._id.toString() : req.user.toString(),
            status: req.status
        }));
        console.log('📋 Current user sent requests:', JSON.stringify(sentRequests));

        // Find by target user ID
        console.log('🔍 Looking for sent request to target user ID:', targetUserId);
        
        const sentRequestIndex = currentUser.friendRequests.sent.findIndex(req => {
            let reqUserIdStr = '';
            if (typeof req.user === 'object' && req.user._id) {
                reqUserIdStr = req.user._id.toString();
            } else {
                reqUserIdStr = req.user.toString();
            }
            
            const targetIdStr = targetUserId.toString();
            console.log('🔄 Comparing user IDs:', reqUserIdStr, 'vs', targetIdStr);
            return reqUserIdStr === targetIdStr && req.status === 'pending';
        });

        console.log('🔍 Sent request index:', sentRequestIndex);

        if (sentRequestIndex === -1) {
            console.log('⚠️ Friend request not found in sent requests, trying alternative approach');
            
            // Attempt to find the recipient user directly
            const recipientUser = await User.findById(targetUserId);
            if (!recipientUser) {
                console.log('❌ Target user not found:', targetUserId);
                return NextResponse.json({ message: 'Target user not found' }, { status: 404 });
            }
            
            console.log('✅ Found target user:', recipientUser.name);
            
            // Check if there's a received request from the current user
            const receivedIndex = recipientUser.friendRequests.received.findIndex(req => {
                const reqUserStr = typeof req.user === 'object' ? req.user._id.toString() : req.user.toString();
                return reqUserStr === decoded.userId.toString() && req.status === 'pending';
            });
            
            if (receivedIndex !== -1) {
                console.log('✅ Found received request in target user at index:', receivedIndex);
                recipientUser.friendRequests.received.splice(receivedIndex, 1);
                await recipientUser.save();
                
                // Force refresh the current user and search again
                const refreshedCurrentUser = await User.findById(decoded.userId);
                const refreshedSentIndex = refreshedCurrentUser.friendRequests.sent.findIndex(req => {
                    const reqUserStr = typeof req.user === 'object' ? req.user._id.toString() : req.user.toString();
                    return reqUserStr === targetUserId.toString() && req.status === 'pending';
                });
                
                if (refreshedSentIndex !== -1) {
                    console.log('✅ Found sent request after refresh at index:', refreshedSentIndex);
                    refreshedCurrentUser.friendRequests.sent.splice(refreshedSentIndex, 1);
                    await refreshedCurrentUser.save();
                    console.log('✅ Successfully removed friend request using alternative approach');
                    
                    return NextResponse.json({ 
                        message: 'Friend request cancelled successfully',
                        success: true 
                    });
                }
            }
            
            console.log('❌ Alternative approach failed. No matching request found');
            return NextResponse.json({
                message: 'Friend request not found or already cancelled',
                success: false
            }, { status: 404 });
        }

        // Get the recipient user ID
        const recipientUserId = currentUser.friendRequests.sent[sentRequestIndex].user;
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
            const reqUserStr = typeof req.user === 'object' ? req.user._id.toString() : req.user.toString();
            const currentUserStr = decoded.userId.toString();
            console.log('🔄 Comparing user IDs:', reqUserStr, 'vs', currentUserStr);
            return reqUserStr === currentUserStr && req.status === 'pending';
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