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
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent promoting already admin users
    if (user.role === 'admin') {
      return NextResponse.json(
        { message: 'User is already an admin' },
        { status: 400 }
      );
    }
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    return NextResponse.json({
      message: 'User promoted to admin successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error promoting user:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to promote user' },
      { status: 500 }
    );
  }
}
