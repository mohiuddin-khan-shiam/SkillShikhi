'use client';

/**
 * Service functions for handling friend request API operations
 */

/**
 * Check the friendship status between current user and target user
 * @param {string} targetUserId - ID of the target user
 * @returns {Promise<Object>} Friendship status data
 */
export async function checkFriendStatus(targetUserId) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('⚠️ No token found');
      return { status: 'send' };
    }

    const res = await fetch('/api/friends', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.log('❌ Failed to fetch friend status');
      return { status: 'send' };
    }

    const data = await res.json();
    const normalizedTargetId = String(targetUserId);

    // Check if already friends
    const isFriend = data.friends.some(friend => {
      let friendId = typeof friend === 'object' ? String(friend._id) : String(friend);
      return friendId === normalizedTargetId;
    });

    if (isFriend) {
      return { status: 'friends' };
    }

    // Check sent requests
    let sentRequest = data.sent.find(req => {
      if (req.user && typeof req.user === 'object' && req.user._id) {
        return String(req.user._id) === normalizedTargetId && req.status === 'pending';
      }
      return String(req.user) === normalizedTargetId && req.status === 'pending';
    });

    if (sentRequest) {
      return { status: 'sent', requestData: sentRequest };
    }

    // Check received requests
    let receivedRequest = data.received.find(req => {
      if (req.user && typeof req.user === 'object' && req.user._id) {
        return String(req.user._id) === normalizedTargetId && req.status === 'pending';
      }
      return String(req.user) === normalizedTargetId && req.status === 'pending';
    });

    if (receivedRequest) {
      return { status: 'received', requestData: receivedRequest };
    }

    return { status: 'send' };
  } catch (error) {
    console.error('Error checking friend status:', error);
    return { status: 'send' };
  }
}

/**
 * Send a friend request to a user
 * @param {string} targetUserId - ID of the target user
 * @returns {Promise<Object>} Result of the operation
 */
export async function sendFriendRequest(targetUserId) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId: targetUserId })
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send friend request');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel a pending friend request
 * @param {string} requestId - ID of the friend request
 * @returns {Promise<Object>} Result of the operation
 */
export async function cancelFriendRequest(requestId) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(`/api/friends/${requestId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to cancel friend request');
    }

    return { success: true };
  } catch (error) {
    console.error('Error canceling friend request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Accept a friend request
 * @param {string} requestId - ID of the friend request
 * @returns {Promise<Object>} Result of the operation
 */
export async function acceptFriendRequest(requestId) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(`/api/friends/${requestId}/accept`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to accept friend request');
    }

    return { success: true };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a friend
 * @param {string} targetUserId - ID of the user to unfriend
 * @returns {Promise<Object>} Result of the operation
 */
export async function unfriend(targetUserId) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(`/api/friends/${targetUserId}/unfriend`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to unfriend');
    }

    return { success: true };
  } catch (error) {
    console.error('Error unfriending:', error);
    return { success: false, error: error.message };
  }
} 