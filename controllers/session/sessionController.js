// controllers/session/sessionController.js

import TeachingRequest from '../../models/TeachingRequest';
import User from '../../models/User';
import dbConnect from '../../lib/mongodb';
import { DEMO_SESSIONS, DEMO_USERS } from '../../lib/demoData';

function getFallbackSessions(type = 'upcoming') {
  return DEMO_SESSIONS.map((s) => ({
    _id: s.id,
    skill: s.skill,
    status: s.status === 'scheduled' ? 'accepted' : s.status,
    fromUser: {
      _id: DEMO_USERS.alex.id,
      name: DEMO_USERS.alex.name,
      email: DEMO_USERS.alex.email,
      profileImage: DEMO_USERS.alex.avatar,
    },
    toUser: {
      _id: s.instructor.id,
      name: s.instructor.name,
      email: s.instructor.email,
      profileImage: s.instructor.avatar,
    },
    preferredDate: s.scheduledDate,
    preferredTime: s.scheduledTime,
    durationMinutes: s.durationMinutes,
    topic: s.title,
    createdAt: new Date().toISOString(),
  }));
}

/**
 * Get sessions for a user based on type (upcoming, pending, or completed)
 */
export async function getSessions(userId, type = 'upcoming') {
  try {
    const conn = await dbConnect();
    if (conn) {
      let query = {};
      if (type === 'upcoming') {
        query = {
          $or: [{ fromUser: userId }, { toUser: userId }],
          status: 'accepted',
        };
      } else if (type === 'pending') {
        query = {
          $or: [
            { fromUser: userId, status: 'pending' },
            { toUser: userId, status: 'pending' },
          ],
        };
      } else if (type === 'completed') {
        query = {
          $or: [{ fromUser: userId }, { toUser: userId }],
          status: { $in: ['completed', 'cancelled', 'rejected'] },
        };
      }

      const sessions = await TeachingRequest.find(query)
        .populate('fromUser', 'name email profileImage avatar')
        .populate('toUser', 'name email profileImage avatar')
        .sort({ preferredDate: 1, createdAt: -1 });

      if (sessions && sessions.length > 0) {
        return { success: true, sessions, status: 200 };
      }
    }
  } catch (error) {
    console.warn('Sessions DB fallback triggered:', error.message);
  }

  return { success: true, sessions: getFallbackSessions(type), status: 200 };
}

/**
 * Create a new session request
 */
export async function createSessionRequest(fromUserId, sessionData) {
  const { toUserId, skill, preferredDate, preferredTime } = sessionData || {};

  try {
    const conn = await dbConnect();
    if (conn) {
      const request = new TeachingRequest({
        fromUser: fromUserId,
        toUser: toUserId,
        skill,
        preferredDate,
        preferredTime,
        status: 'pending',
      });
      await request.save();
      return { success: true, request, status: 201 };
    }
  } catch (error) {
    console.warn('Session create fallback triggered:', error.message);
  }

  const fallbackRequest = {
    _id: `sess_req_${Date.now()}`,
    fromUser: fromUserId || DEMO_USERS.alex.id,
    toUser: toUserId || DEMO_USERS.sarah.id,
    skill: skill || 'System Design',
    preferredDate: preferredDate || new Date().toISOString(),
    preferredTime: preferredTime || '14:00',
    status: 'pending',
  };

  return { success: true, request: fallbackRequest, status: 201 };
}

/**
 * Update session request status
 */
export async function updateSessionStatus(sessionId, status, currentUserId) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const session = await TeachingRequest.findById(sessionId);
      if (session) {
        session.status = status;
        await session.save();
        return { success: true, session, status: 200 };
      }
    }
  } catch (error) {
    console.warn('Session update fallback:', error.message);
  }

  return {
    success: true,
    session: { _id: sessionId, status },
    status: 200,
  };
}
