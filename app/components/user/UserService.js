'use client';

/**
 * Service for user-related API operations
 */

/**
 * Search for users based on query
 * @param {string} query - Search query
 * @returns {Promise<Object>} Result containing users or error
 */
export async function searchUsers(query) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await res.json();
    return { success: true, users: data.users || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Send a session request to a user
 * @param {object} requestData - Session request data
 * @returns {Promise<Object>} Result of the operation
 */
export async function sendSessionRequest(requestData) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to send request');
    }
    
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
} 