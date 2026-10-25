export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import Chat from '../../../models/Chat';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { DEMO_CHATS, DEMO_USERS } from '../../../lib/demoData';

function getFallbackChats() {
  return DEMO_CHATS.map((c) => ({
    _id: c.id,
    otherParticipants: [
      {
        _id: c.withUser.id,
        name: c.withUser.name,
        profileImage: c.withUser.avatar,
      },
    ],
    messages: c.messages.map((m) => ({
      _id: m.id,
      content: m.text,
      sender: {
        _id: m.sender === 'me' ? DEMO_USERS.alex.id : c.withUser.id,
        name: m.sender === 'me' ? DEMO_USERS.alex.name : c.withUser.name,
      },
      read: true,
      createdAt: new Date().toISOString(),
    })),
    lastUpdated: new Date().toISOString(),
  }));
}

export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'turjoyRocks2025!');
        if (decoded?.userId) {
          const chats = await Chat.find({ participants: decoded.userId })
            .populate('participants', '_id name profileImage')
            .populate('messages.sender', '_id name profileImage')
            .sort({ lastUpdated: -1 });
          if (chats && chats.length > 0) {
            return NextResponse.json(chats);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Chat DB fallback:', error.message);
  }

  return NextResponse.json(getFallbackChats());
}

export async function POST(request) {
  return NextResponse.json({
    message: 'Message sent',
    chat: getFallbackChats()[0],
  });
}
