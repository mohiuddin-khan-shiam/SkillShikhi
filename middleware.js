import { NextResponse } from 'next/server';
import { getAbsoluteUrl } from './utils/apiUtils';

/**
 * Base64 URL decoder that works in both browser and Node.js
 */
function base64UrlDecode(str) {
  // Replace non-url compatible chars with base64 standard chars
  let input = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad out with standard base64 required padding characters
  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
    }
    input += new Array(5-pad).join('=');
  }
  
  // Use either browser or Node.js approach to decode
  if (typeof atob === 'function') {
    return decodeURIComponent(atob(input).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } else {
    // Node.js approach
    return Buffer.from(input, 'base64').toString('utf-8');
  }
}

/**
 * Extract payload from JWT token without verification
 */
function extractJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch (error) {
    console.error('Failed to extract JWT payload:', error);
    return null;
  }
}

/**
 * Main middleware function
 * This middleware integrates all middleware functions
 */
export async function middleware(req) {
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
    
    // Try to decode the token to get the user ID
    try {
      // Extract payload from token
      const payload = extractJwtPayload(token);
      const userId = payload?.userId;
      
      if (userId) {
        // Generate a unique session ID
        const sessionId = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        
        // Get the base URL for the API
        const baseUrl = url.origin;
        const sessionsUrl = `${baseUrl}/api/admin/sessions`;
        
        // Call the sessions API to track this activity
        try {
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
          // Ignore response - we don't want to block if this fails
        } catch (sessionError) {
          // Log but don't block
          console.warn('Session tracking failed:', sessionError.message);
        }
      }
    } catch (tokenError) {
      // Just log the error and continue
      console.warn('Token parsing failed in session middleware:', tokenError.message);
    }
    
    // Continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
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
