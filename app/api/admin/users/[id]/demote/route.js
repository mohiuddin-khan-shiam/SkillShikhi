import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyAdminToken } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    // Verify admin token
    const token = request.headers.get('authorization')?.split(' ')[1];
    const admin = await verifyAdminToken(token);
    
    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }
    
    const userId = params.id;
    
    // Prevent admin from demoting themselves
    if (admin._id.toString() === userId) {
      return NextResponse.json(
        { message: 'You cannot remove your own admin privileges' },
        { status: 403 }
      );
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent demoting non-admin users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'User is not an admin' },
        { status: 400 }
      );
    }
    
    // Update user role to regular user
    user.role = 'user';
    await user.save();
    
    return NextResponse.json({
      message: 'Admin privileges removed successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error demoting admin:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to remove admin privileges' },
      { status: 500 }
    );
  }
}
