export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import dbConnect from '../../../../lib/mongodb';
import Chat from '../../../../models/Chat';
import User from '../../../../models/User';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Extract JWT token from request headers
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

// Get a specific chat and mark messages as read
export async function GET(request) {
    // Extract ID directly from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const chatId = pathSegments[pathSegments.length - 1];

    console.log(`📥 GET /api/chat/${chatId} HIT`);

    try {
        await dbConnect();
        console.log('✅ Database connected');

        const decoded = verifyToken(request);
        if (!decoded) {
            console.log('❌ Authentication failed - no valid token');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ User authenticated:', decoded.userId);

        // Find the chat by ID
        const chat = await Chat.findById(chatId)
            .populate('participants', '_id name profileImage')
            .populate('messages.sender', '_id name profileImage');

        if (!chat) {
            console.log('❌ Chat not found:', chatId);
            return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            participant => participant._id.toString() === decoded.userId
        );

        if (!isParticipant) {
            console.log('❌ User is not a participant in this chat');
            return NextResponse.json({ message: 'Unauthorized access to chat' }, { status: 403 });
        }

        // Mark messages from other users as read
        let isModified = false;
        chat.messages.forEach(message => {
            if (message.sender._id.toString() !== decoded.userId && !message.read) {
                message.read = true;
                isModified = true;
            }
        });

        // Save if there were unread messages
        if (isModified) {
            await chat.save();
            console.log('✅ Updated message read status');
        }

        // Format the response
        const otherParticipants = chat.participants.filter(
            p => p._id.toString() !== decoded.userId
        );

        const formattedChat = {
            _id: chat._id,
            participants: chat.participants,
            otherParticipants: otherParticipants,
            messages: chat.messages.map(msg => ({
                _id: msg._id,
                content: msg.content,
                sender: msg.sender,
                read: msg.read,
                createdAt: msg.createdAt
            })),
            lastUpdated: chat.lastUpdated
        };

        return NextResponse.json({ chat: formattedChat });
    } catch (error) {
        console.error('❌ Error fetching chat:', error.message);
        console.error(error.stack);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Add a new message to an existing chat
export async function POST(request) {
    // Extract ID directly from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const chatId = pathSegments[pathSegments.length - 1];

    console.log(`📥 POST /api/chat/${chatId} HIT`);

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

        // Handle both content and message fields to be more robust
        const messageContent = body.content || body.message;

        if (!messageContent) {
            console.log('❌ Missing message content');
            return NextResponse.json({ message: 'Message content is required' }, { status: 400 });
        }

        // Find the chat by ID
        const chat = await Chat.findById(chatId);

        if (!chat) {
            console.log('❌ Chat not found:', chatId);
            return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            participant => participant.toString() === decoded.userId
        );

        if (!isParticipant) {
            console.log('❌ User is not a participant in this chat');
            return NextResponse.json({ message: 'Unauthorized access to chat' }, { status: 403 });
        }

        // Add the new message
        chat.messages.push({
            sender: decoded.userId,
            content: messageContent,
            createdAt: new Date()
        });

        await chat.save();
        console.log('✅ Message added to chat');

        // Find the other participant to send a notification
        const otherParticipantId = chat.participants.find(
            id => id.toString() !== decoded.userId
        );

        if (otherParticipantId) {
            // Get the current user for the notification message
            const currentUser = await mongoose.model('User').findById(decoded.userId);

            // Add notification for the other participant
            const otherUser = await mongoose.model('User').findById(otherParticipantId);
            if (otherUser) {
                otherUser.notifications.push({
                    type: 'message',
                    fromUser: decoded.userId,
                    message: `${currentUser.name} sent you a message`,
                    read: false,
                    createdAt: new Date()
                });

                await otherUser.save();
                console.log('✅ Notification added for recipient');
            }
        }

        // Return the updated chat
        const updatedChat = await Chat.findById(chatId)
            .populate('participants', '_id name profileImage')
            .populate('messages.sender', '_id name profileImage');

        // Format the response
        const otherParticipants = updatedChat.participants.filter(
            p => p._id.toString() !== decoded.userId
        );

        const formattedChat = {
            _id: updatedChat._id,
            participants: updatedChat.participants,
            otherParticipants: otherParticipants,
            messages: updatedChat.messages.map(msg => ({
                _id: msg._id,
                content: msg.content,
                sender: msg.sender,
                read: msg.read,
                createdAt: msg.createdAt
            })),
            lastUpdated: updatedChat.lastUpdated
        };

        return NextResponse.json({
            chat: formattedChat,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('❌ Error adding message:', error.message);
        console.error(error.stack);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
} 