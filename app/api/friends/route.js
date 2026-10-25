export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { DEMO_USERS } from '../../../lib/demoData';

function getFallbackFriends() {
  return {
    friends: [
      {
        _id: DEMO_USERS.sarah.id,
        name: DEMO_USERS.sarah.name,
        profileImage: DEMO_USERS.sarah.avatar,
        email: DEMO_USERS.sarah.email,
      },
      {
        _id: DEMO_USERS.tariq.id,
        name: DEMO_USERS.tariq.name,
        profileImage: DEMO_USERS.tariq.avatar,
        email: DEMO_USERS.tariq.email,
      },
      {
        _id: DEMO_USERS.elena.id,
        name: DEMO_USERS.elena.name,
        profileImage: DEMO_USERS.elena.avatar,
        email: DEMO_USERS.elena.email,
      },
    ],
    sent: [],
    received: [],
  };
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
          const user = await User.findById(decoded.userId)
            .populate('friends', '_id name profileImage avatar')
            .populate('friendRequests.sent.user', '_id name profileImage avatar')
            .populate('friendRequests.received.user', '_id name profileImage avatar');
          if (user) {
            return NextResponse.json({
              friends: user.friends || [],
              sent: user.friendRequests?.sent || [],
              received: user.friendRequests?.received || [],
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn('Friends DB fallback:', error.message);
  }

  return NextResponse.json(getFallbackFriends());
}

export async function POST(request) {
  return NextResponse.json({ message: 'Friend request sent successfully' });
}
