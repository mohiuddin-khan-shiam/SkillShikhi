// app/api/admin/login/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import { verifyAdminToken as verifyAdminTokenController, adminLogin } from '../../../../controllers/admin/adminAuthController';
import { verifyAdminToken as verifyAdminTokenMiddleware } from '../../../../middleware/adminAuth';
dotenv.config();

// Verify admin token
export async function GET(request) {
  console.log('📥 GET /api/admin/login HIT');

  try {
    // Use the middleware to verify admin token
    const auth = await verifyAdminTokenMiddleware(request);
    
    if (auth.error) {
      console.log(`❌ ${auth.error}`);
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    const { user } = auth;
    console.log(`✅ Admin authenticated: ${user.name}`);
    
    // Return user data
    return NextResponse.json({
      message: 'Admin verification successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('❌ Unexpected admin verification error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  console.log('📥 POST /api/admin/login HIT');

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('📦 Request body parsed successfully');
    } catch (error) {
      console.error('❌ Error parsing request body:', error);
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // Call the controller method to handle admin login
    const result = await adminLogin(body);
    
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    
    return NextResponse.json({
      message: result.message,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('❌ Unexpected admin login error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
