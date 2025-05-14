export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

function verifyToken(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        console.log('❌ Token verification failed:', err.message);
        return null;
    }
}

// Get all notifications for the user
export async function GET(request) {
    console.log('📥 GET /api/notifications HIT');
    try {
        await dbConnect();

        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(decoded.userId)
            .populate('notifications.fromUser', '_id name profileImage');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Sort notifications by date (newest first)
        const notifications = [...user.notifications].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('❌ Error fetching notifications:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Mark notifications as read
export async function PUT(request) {
    console.log('📥 PUT /api/notifications HIT');
    try {
        await dbConnect();

        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { notificationIds, all } = await request.json();

        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (all) {
            // Mark all notifications as read
            user.notifications.forEach(notification => {
                notification.read = true;
            });
        } else if (notificationIds && notificationIds.length > 0) {
            // Mark specific notifications as read
            notificationIds.forEach(id => {
                const notification = user.notifications.id(id);
                if (notification) {
                    notification.read = true;
                }
            });
        } else {
            return NextResponse.json({
                message: 'Either notificationIds or all parameter is required'
            }, { status: 400 });
        }

        await user.save();

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('❌ Error marking notifications as read:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Delete notifications
export async function DELETE(request) {
    console.log('📥 DELETE /api/notifications HIT');
    try {
        await dbConnect();

        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const params = url.searchParams;
        const notificationId = params.get('id');
        const deleteAll = params.get('all') === 'true';

        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (deleteAll) {
            // Clear all notifications
            user.notifications = [];
        } else if (notificationId) {
            // Remove specific notification
            const notificationIndex = user.notifications.findIndex(
                n => n._id.toString() === notificationId
            );

            if (notificationIndex === -1) {
                return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
            }

            user.notifications.splice(notificationIndex, 1);
        } else {
            return NextResponse.json({
                message: 'Either notificationId or all=true parameter is required'
            }, { status: 400 });
        }

        await user.save();

        return NextResponse.json({
            message: deleteAll
                ? 'All notifications deleted'
                : 'Notification deleted'
        });
    } catch (error) {
        console.error('❌ Error deleting notifications:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
