import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Session tracking middleware
 * This middleware automatically creates and updates user sessions
 * It runs on API routes related to authentication and user actions
 */
export async function sessionMiddleware(req, event) {
  try {
    // Skip if not an authentication-related route
    const url = new URL(req.url);
    const isAuthRoute = url.pathname.includes('/api/auth') || 
                       url.pathname.includes('/api/login') || 
                       url.pathname.includes('/api/admin/login');
    
    // Only track sessions for authentication routes
    if (!isAuthRoute) {
      return NextResponse.next();
    }
    
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.next();
    }
    
    // Extract user information from the request
    const token = authHeader.split(' ')[1];
    
    // Decode token to get userId
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      if (!userId) {
        console.error('No userId found in token');
        return NextResponse.next();
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return NextResponse.next();
    }
    
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
    
    // Get base URL from request
    const baseUrl = url.origin;
    
    // Create session ID
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Create or update session
    try {
      const sessionResponse = await fetch(`${baseUrl}/api/admin/sessions`, {
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
          device,
          location: 'Unknown' // Would require IP geolocation service
        })
      });
      
      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error(`Failed to create session: ${sessionResponse.status} - ${errorText}`);
      }
    } catch (fetchError) {
      console.error('Fetch error creating session:', fetchError);
    }
    
    // Continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Error in session middleware:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/login',
    '/api/admin/login'
  ],
};
