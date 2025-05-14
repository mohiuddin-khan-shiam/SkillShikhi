/**
 * Activity Logger Utility
 * 
 * This utility provides functions for logging user activities throughout the application.
 * It helps maintain a consistent approach to activity logging and ensures all necessary
 * information is captured for admin reporting and analytics.
 */

/**
 * Log a user activity
 * @param {string} token - User authentication token
 * @param {string} actionType - Type of action (login, logout, profile_edit, etc.)
 * @param {string} targetId - ID of the target object (optional)
 * @param {string} targetModel - Model name of the target (User, Post, Comment, etc.) (optional)
 * @param {Object} details - Additional details about the action (optional)
 * @param {string} ipAddress - User's IP address (optional)
 * @returns {Promise<Object>} - The created activity log
 */
export async function logActivity(token, actionType, targetId = null, targetModel = null, details = {}, ipAddress = null) {
  try {
    if (!token) {
      console.error('Authentication token is required for activity logging');
      return null;
    }
    
    if (!actionType) {
      console.error('Action type is required for activity logging');
      return null;
    }
    
    const payload = {
      actionType,
      ...(targetId && { targetId }),
      ...(targetModel && { targetModel }),
      ...(Object.keys(details).length > 0 && { details }),
      ...(ipAddress && { ipAddress })
    };
    
    const response = await fetch('/api/admin/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.log;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
}

/**
 * Log a user login
 * @param {string} token - User authentication token
 * @param {string} ipAddress - User's IP address (optional)
 * @param {Object} details - Additional details about the login (optional)
 * @returns {Promise<Object>} - The created activity log
 */
export async function logLogin(token, ipAddress = null, details = {}) {
  return logActivity(token, 'login', null, null, details, ipAddress);
}

/**
 * Log a user logout
 * @param {string} token - User authentication token
 * @param {string} ipAddress - User's IP address (optional)
 * @returns {Promise<Object>} - The created activity log
 */
export async function logLogout(token, ipAddress = null) {
  return logActivity(token, 'logout', null, null, {}, ipAddress);
}

/**
 * Log a profile edit
 * @param {string} token - User authentication token
 * @param {string} userId - ID of the user whose profile was edited
 * @param {Object} changes - Summary of changes made to the profile
 * @returns {Promise<Object>} - The created activity log
 */
export async function logProfileEdit(token, userId, changes = {}) {
  return logActivity(token, 'profile_edit', userId, 'User', { changes });
}

/**
 * Log content creation (post, comment, message)
 * @param {string} token - User authentication token
 * @param {string} contentId - ID of the created content
 * @param {string} contentType - Type of content (Post, Comment, Message)
 * @param {Object} details - Additional details about the content
 * @returns {Promise<Object>} - The created activity log
 */
export async function logContentCreation(token, contentId, contentType, details = {}) {
  const actionType = contentType.toLowerCase() + '_create';
  return logActivity(token, actionType, contentId, contentType, details);
}

/**
 * Log content moderation
 * @param {string} token - Admin authentication token
 * @param {string} contentId - ID of the moderated content
 * @param {string} contentType - Type of content (Post, Comment, Message)
 * @param {string} action - Moderation action (delete, warn, flag, approve)
 * @param {string} reason - Reason for moderation
 * @returns {Promise<Object>} - The created activity log
 */
export async function logContentModeration(token, contentId, contentType, action, reason) {
  return logActivity(token, 'content_moderate', contentId, contentType, { action, reason });
}

/**
 * Log a report submission
 * @param {string} token - User authentication token
 * @param {string} reportId - ID of the created report
 * @param {string} reportedContentId - ID of the reported content
 * @param {string} contentType - Type of reported content (Post, Comment, User, Message)
 * @param {string} reason - Reason for the report
 * @returns {Promise<Object>} - The created activity log
 */
export async function logReportSubmission(token, reportId, reportedContentId, contentType, reason) {
  return logActivity(token, 'report_submit', reportedContentId, contentType, { reportId, reason });
}

/**
 * Log account ban
 * @param {string} token - Admin authentication token
 * @param {string} userId - ID of the banned user
 * @param {string} reason - Reason for the ban
 * @param {number} duration - Ban duration in days (0 for permanent)
 * @returns {Promise<Object>} - The created activity log
 */
export async function logAccountBan(token, userId, reason, duration = 0) {
  return logActivity(token, 'account_ban', userId, 'User', { reason, duration });
}

/**
 * Log account unban
 * @param {string} token - Admin authentication token
 * @param {string} userId - ID of the unbanned user
 * @param {string} reason - Reason for the unban
 * @returns {Promise<Object>} - The created activity log
 */
export async function logAccountUnban(token, userId, reason) {
  return logActivity(token, 'account_unban', userId, 'User', { reason });
}

/**
 * Log session termination
 * @param {string} token - Admin authentication token
 * @param {string} sessionId - ID of the terminated session
 * @param {string} userId - ID of the user whose session was terminated
 * @param {string} reason - Reason for termination
 * @returns {Promise<Object>} - The created activity log
 */
export async function logSessionTermination(token, sessionId, userId, reason) {
  return logActivity(token, 'session_terminate', userId, 'User', { sessionId, reason });
}
