'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const NotificationsPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef(null);
    const router = useRouter();

    // Function to fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                setNotifications(data.notifications || []);
                setUnreadCount(
                    data.notifications.filter(notification => !notification.read).length
                );
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch notifications on mount and whenever the panel is opened
    useEffect(() => {
        if (showPanel) {
            fetchNotifications();
        }
    }, [showPanel]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every minute
        const intervalId = setInterval(fetchNotifications, 60000);

        return () => clearInterval(intervalId);
    }, []);

    // Handle click outside to close panel
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    notificationIds: [notificationId]
                })
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ all: true })
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update local state
            const updatedNotifications = notifications.filter(
                notification => notification._id !== notificationId
            );
            setNotifications(updatedNotifications);

            // Update unread count
            const deletedNotification = notifications.find(n => n._id === notificationId);
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => prev - 1);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Clear all notifications
    const clearAllNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications?all=true', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update local state
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    // Handle friend request action (accept/reject)
    const handleFriendRequest = async (notificationId, requestId, action) => {
        try {
            const token = localStorage.getItem('token');

            // First mark the notification as read
            await markAsRead(notificationId);

            // Then accept/reject the friend request
            const res = await fetch('/api/friends', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    requestId,
                    action
                })
            });

            if (res.ok) {
                // Remove the notification from the list
                await deleteNotification(notificationId);
                // Refresh notifications
                fetchNotifications();
            }
        } catch (error) {
            console.error(`Error ${action}ing friend request:`, error);
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }

        // Handle different notification types
        if (notification.type === 'friend_request') {
            // Don't navigate, user needs to accept/reject
        } else if (notification.type === 'friend_accepted') {
            // Navigate to the user's profile
            router.push(`/user/${notification.fromUser._id}`);
            setShowPanel(false);
        }
    };

    return (
        <div className="notifications-container">
            <button
                className="notification-bell"
                onClick={() => setShowPanel(!showPanel)}
                aria-label="Notifications"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {showPanel && (
                <div className="notifications-panel" ref={panelRef}>
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {notifications.length > 0 && (
                            <div className="notification-actions">
                                <button onClick={markAllAsRead}>Mark all as read</button>
                                <button onClick={clearAllNotifications}>Clear all</button>
                            </div>
                        )}
                    </div>
                    <div className="notifications-list">
                        {loading ? (
                            <div className="notification-loading">Loading...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    {notification.fromUser && (
                                        <img
                                            src={notification.fromUser.profileImage || '/images/profile-placeholder.png'}
                                            alt={notification.fromUser.name}
                                            className="notification-avatar"
                                        />
                                    )}
                                    <div className="notification-content">
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </span>

                                        {notification.type === 'friend_request' && (
                                            <div className="notification-actions">
                                                <button
                                                    className="accept-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFriendRequest(notification._id, notification.fromUser._id, 'accept');
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="reject-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFriendRequest(notification._id, notification.fromUser._id, 'reject');
                                                    }}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="notification-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                        aria-label="Delete notification"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="notification-empty">No notifications</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel;
