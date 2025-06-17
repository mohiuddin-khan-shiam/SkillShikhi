'use client';

/**
 * Service for handling session-related API calls
 */
const SessionsApi = {
  /**
   * Fetch all session types (upcoming, pending, completed)
   * @returns {Promise<Array>} Array of sessions
   */
  async fetchAllSessions() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fetch all session types
      const types = ['upcoming', 'pending', 'completed'];
      const sessionResults = await Promise.all(
        types.map(async (type) => {
          const res = await fetch(`/api/sessions?type=${type}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Server returned ${res.status}`);
          }
          
          const data = await res.json();
          return data.sessions || [];
        })
      );
      
      // Combine all sessions
      return [].concat(...sessionResults);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },
  
  /**
   * Accept a session request
   * @param {string} sessionId - ID of the session to accept
   * @returns {Promise<Object>} Updated session data
   */
  async acceptSession(sessionId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/sessions/${sessionId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error accepting session:', error);
      throw error;
    }
  },
  
  /**
   * Reject a session request
   * @param {string} sessionId - ID of the session to reject
   * @returns {Promise<Object>} Updated session data
   */
  async rejectSession(sessionId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/sessions/${sessionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error rejecting session:', error);
      throw error;
    }
  },
  
  /**
   * Cancel a session
   * @param {string} sessionId - ID of the session to cancel
   * @returns {Promise<Object>} Updated session data
   */
  async cancelSession(sessionId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/sessions/${sessionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw error;
    }
  }
};

export default SessionsApi; 