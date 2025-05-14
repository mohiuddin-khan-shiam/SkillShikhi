import dbConnect from './mongodb';
import ActivityLog from '../models/ActivityLog';

/**
 * Create an activity log entry
 * @param {Object} logData - Log data object
 * @param {String} logData.userId - User ID who performed the action
 * @param {String} logData.action - Action performed
 * @param {String} logData.details - Description of the action
 * @param {Object} logData.metadata - Additional metadata about the action
 * @returns {Promise<Object>} Created activity log
 */
export async function createActivityLog(logData) {
  try {
    const { userId, action, details, metadata = {} } = logData;
    
    if (!userId || !action) {
      console.error('Activity log requires userId and action');
      return null;
    }
    
    // Connect to database
    await dbConnect();
    
    // Create log entry
    const log = new ActivityLog({
      userId,
      action,
      details: details || action,
      metadata,
      createdAt: new Date()
    });
    
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
}

/**
 * Get activity logs with pagination
 * @param {Object} options - Query options
 * @param {Number} options.page - Page number (default: 1)
 * @param {Number} options.limit - Items per page (default: 20)
 * @param {Object} options.filter - Filter criteria
 * @returns {Promise<Object>} Activity logs with pagination info
 */
export async function getActivityLogs(options = {}) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      filter = {}
    } = options;
    
    // Connect to database
    await dbConnect();
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await ActivityLog.countDocuments(filter);
    
    // Get logs with pagination
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');
    
    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting activity logs:', error);
    throw error;
  }
}

/**
 * Get recent activity logs for a specific user
 * @param {String} userId - User ID
 * @param {Number} limit - Maximum number of logs to return
 * @returns {Promise<Array>} Recent activity logs
 */
export async function getUserRecentActivity(userId, limit = 10) {
  try {
    if (!userId) {
      return [];
    }
    
    // Connect to database
    await dbConnect();
    
    // Get recent logs for the user
    const logs = await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error(`Error getting recent activity for user ${userId}:`, error);
    return [];
  }
}
