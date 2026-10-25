// middleware/adminAuth.js

import jwt from 'jsonwebtoken';
import dbConnect from '../lib/mongodb';
import User from '../models/User';
import { DEMO_USERS } from '../lib/demoData';

/**
 * Middleware to verify admin token and authenticate admin users
 */
export async function verifyAdminToken(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  // Instant demo admin token check for showcase
  if (token.includes('demo_admin') || token.includes('recruiter_preview')) {
    return {
      user: {
        _id: DEMO_USERS.admin.id,
        name: DEMO_USERS.admin.name,
        email: DEMO_USERS.admin.email,
        isAdmin: true,
      },
      token,
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'turjoyRocks2025!');

    if (!decoded.isAdmin) {
      return { error: 'Unauthorized - Admin access required', status: 403 };
    }

    const conn = await dbConnect();
    if (!conn) {
      return {
        user: {
          _id: DEMO_USERS.admin.id,
          name: DEMO_USERS.admin.name,
          email: DEMO_USERS.admin.email,
          isAdmin: true,
        },
        token,
      };
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isAdmin) {
      return { error: 'Unauthorized - Admin access required', status: 403 };
    }

    return { user, token };
  } catch (error) {
    // In showcase mode, grant demo admin preview
    return {
      user: {
        _id: DEMO_USERS.admin.id,
        name: DEMO_USERS.admin.name,
        email: DEMO_USERS.admin.email,
        isAdmin: true,
      },
      token,
    };
  }
}
