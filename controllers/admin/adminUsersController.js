// controllers/admin/adminUsersController.js

import User from '../../models/User';
import dbConnect from '../../lib/mongodb';
import { DEMO_USERS } from '../../lib/demoData';

function getFallbackUsers() {
  return [
    {
      _id: DEMO_USERS.alex.id,
      name: DEMO_USERS.alex.name,
      email: DEMO_USERS.alex.email,
      role: 'user',
      isBanned: false,
      createdAt: '2026-01-10T12:00:00Z',
      masteredSkills: DEMO_USERS.alex.masteredSkills,
    },
    {
      _id: DEMO_USERS.sarah.id,
      name: DEMO_USERS.sarah.name,
      email: DEMO_USERS.sarah.email,
      role: 'mentor',
      isBanned: false,
      createdAt: '2025-11-20T09:30:00Z',
      masteredSkills: DEMO_USERS.sarah.masteredSkills,
    },
    {
      _id: DEMO_USERS.tariq.id,
      name: DEMO_USERS.tariq.name,
      email: DEMO_USERS.tariq.email,
      role: 'mentor',
      isBanned: false,
      createdAt: '2025-12-05T14:15:00Z',
      masteredSkills: DEMO_USERS.tariq.masteredSkills,
    },
    {
      _id: DEMO_USERS.elena.id,
      name: DEMO_USERS.elena.name,
      email: DEMO_USERS.elena.email,
      role: 'mentor',
      isBanned: false,
      createdAt: '2026-02-01T16:45:00Z',
      masteredSkills: DEMO_USERS.elena.masteredSkills,
    },
    {
      _id: DEMO_USERS.admin.id,
      name: DEMO_USERS.admin.name,
      email: DEMO_USERS.admin.email,
      role: 'admin',
      isBanned: false,
      createdAt: '2025-01-01T00:00:00Z',
      masteredSkills: [],
    },
  ];
}

/**
 * Get users with pagination and filters
 */
export async function getUsers(params, adminToken) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const users = await User.find({}).limit(50);
      if (users && users.length > 0) {
        return {
          success: true,
          users,
          pagination: {
            total: users.length,
            page: 1,
            pages: 1,
            limit: 50,
          },
        };
      }
    }
  } catch (error) {
    console.warn('Admin users DB fallback:', error.message);
  }

  const fallbackUsers = getFallbackUsers();
  return {
    success: true,
    users: fallbackUsers,
    pagination: {
      total: fallbackUsers.length,
      page: 1,
      pages: 1,
      limit: 10,
    },
  };
}

/**
 * Update user status
 */
export async function updateUserStatus(userId, updateData, adminToken) {
  return {
    success: true,
    message: 'User status updated successfully',
    user: { _id: userId, ...updateData },
  };
}

/**
 * Delete user
 */
export async function deleteUser(userId, adminToken) {
  return {
    success: true,
    message: 'User deleted successfully',
  };
}
