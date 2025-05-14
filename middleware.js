import { NextResponse } from 'next/server';
import { sessionMiddleware } from './middleware/sessionTracker';

/**
 * Main middleware function
 * This middleware integrates all middleware functions
 */
export async function middleware(req, event) {
  // Run session tracking middleware
  const sessionResponse = await sessionMiddleware(req, event);
  if (sessionResponse !== NextResponse.next()) {
    return sessionResponse;
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Export the matcher configuration from session middleware
export { config } from './middleware/sessionTracker';
