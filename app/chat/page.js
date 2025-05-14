'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../styles.css';

export default function ChatPage() {
    const router = useRouter();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const res = await fetch('/api/chat', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch chats');
                }

                const data = await res.json();
                setChats(data);
            } catch (err) {
                console.error('Error fetching chats:', err);
                setError('Failed to load chats. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [router]);

    const handleChatClick = (chatId) => {
        router.push(`/chat/${chatId}`);
    };

    const handleBackToProfile = () => {
        router.push('/profile');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Less than a day
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Less than a week
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[date.getDay()];
        }

        // Otherwise return date
        return date.toLocaleDateString();
    };

    const getLastMessage = (chat) => {
        if (!chat.messages || chat.messages.length === 0) {
            return 'No messages yet';
        }

        const lastMessage = chat.messages[chat.messages.length - 1];
        const shortMessage = lastMessage.content.length > 40
            ? `${lastMessage.content.substring(0, 40)}...`
            : lastMessage.content;

        return shortMessage;
    };

    const getUnreadCount = (chat) => {
        if (!chat.messages) return 0;

        return chat.messages.filter(msg =>
            !msg.read && msg.sender._id !== localStorage.getItem('userId')
        ).length;
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-spinner">Loading chats...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error-message">{error}</div>
                <button onClick={() => window.location.reload()} className="action-button">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="chat-list-container">
            <header className="profile-header">
                <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                <h1>Messages</h1>
                <div className="nav-buttons">
                    <button onClick={handleBackToProfile} className="back-button">
                        Back to Profile
                    </button>
                </div>
            </header>

            <div className="chat-list">
                {chats.length === 0 ? (
                    <div className="no-chats">
                        <p>You don't have any messages yet.</p>
                        <p>Connect with friends to start chatting!</p>
                    </div>
                ) : (
                    chats.map(chat => (
                        <div
                            key={chat._id}
                            className="chat-item"
                            onClick={() => handleChatClick(chat._id)}
                        >
                            <div className="chat-avatar">
                                <img
                                    src={chat.otherParticipants[0]?.profileImage || '/images/profile-placeholder.png'}
                                    alt="User"
                                />
                            </div>
                            <div className="chat-details">
                                <div className="chat-name">
                                    {chat.otherParticipants[0]?.name || 'Unknown User'}
                                </div>
                                <div className="chat-preview">
                                    {getLastMessage(chat)}
                                </div>
                            </div>
                            <div className="chat-meta">
                                <div className="chat-time">
                                    {formatDate(chat.lastUpdated)}
                                </div>
                                {getUnreadCount(chat) > 0 && (
                                    <div className="unread-badge">
                                        {getUnreadCount(chat)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 