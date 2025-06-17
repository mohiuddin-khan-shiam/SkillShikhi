import { NextResponse } from 'next/server';
import { trackUserSession } from './middleware/sessionTracking';
import { extractJwtPayload } from './middleware/jwtParser';

/**
 * Main middleware function
 * This middleware integrates all middleware functions and handles route protection
 */
export async function middleware(req) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Special handling for admin routes
    if (pathname.startsWith('/admin/')) {
      // Check for admin token in cookies
      const adminToken = req.cookies.get('adminToken')?.value;
      
      // If no admin token is found, redirect to admin login
      if (!adminToken && pathname !== '/admin-login') {
        return NextResponse.redirect(new URL('/admin-login', req.url));
      }
    }
    
    // Auth API route handling
    const isAuthRoute = pathname.includes('/api/auth') || 
                       pathname.includes('/api/login') || 
                       pathname.includes('/api/admin/login');
    
    if (isAuthRoute) {
      // Get authorization header
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Extract token from header
        const token = authHeader.split(' ')[1];
        
        // Track user session
        await trackUserSession(req, token);
      }
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
    // API routes
    '/api/auth/:path*',
    '/api/login',
    '/api/admin/login',
    // Admin routes protection
    '/admin/:path*'
  ],
};
