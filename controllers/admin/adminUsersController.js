// controllers/admin/adminUsersController.js

import User from '../../models/User';
import dbConnect from '../../lib/mongodb';
import { logActivity } from '../../utils/activityLogger';

/**
 * Get users with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Number of users per page
 * @param {string} params.role - User role filter
 * @param {string} params.status - User status filter
 * @param {string} params.search - Search term
 * @param {string} params.sortBy - Field to sort by
 * @param {string} params.sortOrder - Sort order (asc or desc)
 * @param {string} adminToken - Admin JWT token for activity logging
 * @returns {Object} Response object with users data and pagination info
 */
export async function getUsers(params, adminToken) {
  console.log('ud83dudd0d Getting users with params:', params);
  
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = params;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    console.log('Query params:', { pageNum, limitNum, role, status, search, sortBy, sortOrder });
    
    // Connect to database
    await dbConnect();
    console.log('Connected to database');
    
    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      if (status === 'banned') {
        query.isBanned = true;
      } else if (status === 'active') {
        query.isBanned = false;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
      // If status is 'all', don't apply any filter
    }
    
    if (search) {
      // Check if search is a date format
      const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
      if (dateRegex.test(search)) {
        // If it's a date format, search by createdAt
        const searchDate = new Date(search);
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.createdAt = {
          $gte: searchDate,
          $lt: nextDay
        };
      } else {
        // Regular search by name or email
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { _id: search.length === 24 ? search : null }
        ];
      }
    }
    
    console.log('Query:', JSON.stringify(query));
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    console.log(`Total users matching query: ${total}`);
    
    // Get users with pagination
    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('name email profileImage role isAdmin isBanned isActive createdAt')
      .lean();
    
    console.log(`Retrieved ${users.length} users`);
    
    // Process users to ensure all have required fields
    const processedUsers = users.map(user => {
      return {
        ...user,
        role: user.role || 'user',
        stats: {
          posts: 0,
          comments: 0,
          courses: 0,
          reports: 0
        }
      };
    });
    
    // Log activity
    try {
      await logActivity(adminToken, 'user_view', null, 'User', { filters: { role, status, search } });
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Continue even if logging fails
    }
    
    console.log(`u2705 Successfully processed user data`);
    
    return { 
      success: true,
      users: processedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum
      },
      status: 200
    };
  } catch (error) {
    console.error('u274c Error fetching users:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return { success: false, message: 'Internal Server Error: ' + error.message, status: 500 };
  }
}

/**
 * Update user status (ban/unban, make admin/remove admin)
 * @param {string} userId - User ID to update
 * @param {Object} updateData - Data to update
 * @param {boolean} updateData.isBanned - Ban status
 * @param {boolean} updateData.isAdmin - Admin status
 * @param {string} adminToken - Admin JWT token for activity logging
 * @returns {Object} Response object with updated user data
 */
export async function updateUserStatus(userId, updateData, adminToken) {
  console.log(`u270fufe0f Updating user status for user ID: ${userId}`);
  console.log('Update data:', updateData);
  
  try {
    await dbConnect();
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found', status: 404 };
    }
    
    // Update user fields
    if (updateData.isBanned !== undefined) {
      user.isBanned = updateData.isBanned;
      console.log(`User ${userId} ${updateData.isBanned ? 'banned' : 'unbanned'}`);
    }
    
    if (updateData.isAdmin !== undefined) {
      user.isAdmin = updateData.isAdmin;
      console.log(`User ${userId} ${updateData.isAdmin ? 'made admin' : 'removed from admin'}`);
    }
    
    // Save user
    await user.save();
    
    // Log activity
    try {
      const actionType = updateData.isBanned !== undefined 
        ? (updateData.isBanned ? 'BAN_USER' : 'UNBAN_USER')
        : (updateData.isAdmin !== undefined ? (updateData.isAdmin ? 'MAKE_ADMIN' : 'REMOVE_ADMIN') : 'UPDATE_USER');
      
      await logActivity(adminToken, actionType, userId, 'User', updateData);
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Continue even if logging fails
    }
    
    return { 
      success: true, 
      message: 'User updated successfully', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        isActive: user.isActive
      },
      status: 200 
    };
  } catch (error) {
    console.error('u274c Error updating user:', error);
    return { success: false, message: 'Internal Server Error: ' + error.message, status: 500 };
  }
}

/**
 * Delete a user
 * @param {string} userId - User ID to delete
 * @param {string} adminToken - Admin JWT token for activity logging
 * @returns {Object} Response object with success status
 */
export async function deleteUser(userId, adminToken) {
  console.log(`ud83duddd1ufe0f Deleting user ID: ${userId}`);
  
  try {
    await dbConnect();
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found', status: 404 };
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    // Log activity
    try {
      await logActivity(adminToken, 'DELETE_USER', userId, 'User', { email: user.email });
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Continue even if logging fails
    }
    
    return { success: true, message: 'User deleted successfully', status: 200 };
  } catch (error) {
    console.error('u274c Error deleting user:', error);
    return { success: false, message: 'Internal Server Error: ' + error.message, status: 500 };
  }
}
