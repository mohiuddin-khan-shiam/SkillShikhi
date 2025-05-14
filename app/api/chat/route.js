export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import Chat from '../../../models/Chat';
import User from '../../../models/User';
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

// Get all chats for the current user
export async function GET(request) {
    console.log('📥 GET /api/chat HIT');
    try {
        await dbConnect();
        console.log('✅ Database connected');

        const decoded = verifyToken(request);
        if (!decoded) {
            console.log('❌ Authentication failed - no valid token');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ User authenticated:', decoded.userId);

        // Get all chats where the user is a participant
        const chats = await Chat.find({
            participants: decoded.userId
        })
            .populate('participants', '_id name profileImage')
            .populate('messages.sender', '_id name profileImage')
            .sort({ lastUpdated: -1 });

        console.log(`✅ Retrieved ${chats.length} chats for user`);

        // Format the response
        const formattedChats = chats.map(chat => {
            const otherParticipants = chat.participants.filter(
                p => p._id.toString() !== decoded.userId
            );

            return {
                _id: chat._id,
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
        });

        return NextResponse.json(formattedChats);
    } catch (error) {
        console.error('❌ Error fetching chats:', error.message);
        console.error(error.stack);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Create a new chat or send a message to an existing chat
export async function POST(request) {
    console.log('📥 POST /api/chat HIT');
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

        const { recipientId, message } = body;

        if (!recipientId) {
            console.log('❌ Missing recipient ID');
            return NextResponse.json({ message: 'Recipient ID is required' }, { status: 400 });
        }

        if (!message) {
            console.log('❌ Missing message content');
            return NextResponse.json({ message: 'Message content is required' }, { status: 400 });
        }

        // Check if users exist
        const currentUser = await User.findById(decoded.userId);
        const recipientUser = await User.findById(recipientId);

        if (!currentUser) {
            console.log('❌ Current user not found:', decoded.userId);
            return NextResponse.json({ message: 'Current user not found' }, { status: 404 });
        }

        if (!recipientUser) {
            console.log('❌ Recipient user not found:', recipientId);
            return NextResponse.json({ message: 'Recipient user not found' }, { status: 404 });
        }

        console.log('✅ Both users found - current:', currentUser.name, 'recipient:', recipientUser.name);

        // Check if they're friends
        const areFriends = currentUser.friends.some(friend => friend.toString() === recipientId);
        if (!areFriends) {
            console.log('❌ Users are not friends');
            return NextResponse.json({ message: 'You can only chat with friends' }, { status: 403 });
        }

        // Sort participant IDs to ensure consistent ordering for finding existing chats
        const participantIds = [decoded.userId, recipientId].sort();

        // Try to find existing chat
        let chat = await Chat.findOne({
            participants: { $all: participantIds }
        });

        if (!chat) {
            console.log('🆕 Creating new chat between users');
            // Create new chat
            chat = new Chat({
                participants: participantIds,
                messages: []
            });
        }

        // Add message to chat
        chat.messages.push({
            sender: decoded.userId,
            content: message,
            createdAt: new Date()
        });

        await chat.save();
        console.log('✅ Message saved successfully');

        // Add notification for recipient
        recipientUser.notifications.push({
            type: 'message',
            fromUser: decoded.userId,
            message: `${currentUser.name} sent you a message`,
            read: false,
            createdAt: new Date()
        });

        await recipientUser.save();
        console.log('✅ Notification added for recipient');

        // Populate the chat data for response
        await chat.populate('participants', '_id name profileImage');
        await chat.populate('messages.sender', '_id name profileImage');

        return NextResponse.json({
            chatId: chat._id,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('❌ Error sending message:', error.message);
        console.error(error.stack);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
} 