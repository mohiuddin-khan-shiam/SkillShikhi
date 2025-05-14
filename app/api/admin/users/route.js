// app/api/admin/users/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import { getUsers, updateUserStatus, deleteUser } from '../../../../controllers/admin/adminUsersController';
import { verifyAdminToken } from '../../../../middleware/adminAuth';
dotenv.config();

console.log('Users API module loaded');

// GET users with pagination and filters
export async function GET(request) {
  console.log('📥 GET /api/admin/users HIT');
  
  try {
    // Verify admin token
    const auth = await verifyAdminToken(request);
    
    if (auth.error) {
      console.log(`❌ ${auth.error}`);
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    const { user, token } = auth;
    console.log(`✅ Admin authenticated: ${user.name}`);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      role: searchParams.get('role'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder')
    };
    
    // Call the controller method to get users
    const result = await getUsers(queryParams, token);
    
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    
    return NextResponse.json({
      users: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Error in admin users route:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ message: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}

// PUT to update user status (ban/unban, make admin/remove admin)
export async function PUT(request) {
  console.log('✏️ PUT /api/admin/users HIT');
  
  try {
    // Verify admin token
    const auth = await verifyAdminToken(request);
    
    if (auth.error) {
      console.log(`❌ ${auth.error}`);
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    const { token } = auth;
    
    // Parse request body
    const body = await request.json();
    const { userId, ...updateData } = body;
    
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    
    // Call the controller method to update user status
    const result = await updateUserStatus(userId, updateData, token);
    
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    
    return NextResponse.json({
      message: result.message,
      user: result.user
    });
  } catch (error) {
    console.error('❌ Error in update user route:', error);
    return NextResponse.json({ message: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}

// DELETE to remove a user
export async function DELETE(request) {
  console.log('🗑️ DELETE /api/admin/users HIT');
  
  try {
    // Verify admin token
    const auth = await verifyAdminToken(request);
    
    if (auth.error) {
      console.log(`❌ ${auth.error}`);
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    const { token } = auth;
    
    // Parse URL to get user ID
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    
    // Call the controller method to delete user
    const result = await deleteUser(userId, token);
    
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    
    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error('❌ Error in delete user route:', error);
    return NextResponse.json({ message: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
