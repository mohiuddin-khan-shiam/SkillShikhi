import { extractJwtPayload } from './jwtParser';

/**
 * Track user session by calling the sessions API
 * @param {Object} req - Request object
 * @param {string} token - JWT token
 */
export async function trackUserSession(req, token) {
  try {
    // Extract payload from token
    const payload = extractJwtPayload(token);
    const userId = payload?.userId;
    
    if (userId) {
      // Get user agent and IP information
      const userAgent = req.headers.get('user-agent') || 'Unknown';
      const ipAddress = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 
                       'Unknown';
      
      // Determine device type from user agent
      let device = 'Unknown';
      if (userAgent.includes('Mobile')) {
        device = 'Mobile';
      } else if (userAgent.includes('Tablet')) {
        device = 'Tablet';
      } else {
        device = 'Desktop';
      }
      
      // Generate a unique session ID
      const sessionId = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Get the base URL for the API
      const url = new URL(req.url);
      const baseUrl = url.origin;
      const sessionsUrl = `${baseUrl}/api/admin/sessions`;
      
      // Call the sessions API to track this activity
      await fetch(sessionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          sessionId,
          ipAddress,
          userAgent,
          device
        })
      });
    }
  } catch (error) {
    // Log but don't block
    console.warn('Session tracking failed:', error.message);
  }
} 