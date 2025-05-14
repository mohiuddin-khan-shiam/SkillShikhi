'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../styles.css';
import Link from 'next/link';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export default function ChatViewPage() {
    const router = useRouter();
    const params = useParams();
    const chatId = params?.id;

    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const [currentUserId, setCurrentUserId] = useState(null);
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Store current user ID in localStorage if not already there
        fetchCurrentUser();

        // Initial fetch
        fetchChat();

        // Fetch messages every 10 seconds - reduce load on server
        const interval = setInterval(() => {
            // Only fetch if we're not already in the middle of sending a message
            if (!sending) {
                fetchChat(true); // Pass true to indicate this is a background check
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [params.id]);

    const fetchCurrentUser = async () => {
        try {
            // Check if we already have the userId in localStorage
            const existingUserId = localStorage.getItem('userId');
            if (existingUserId) {
                setCurrentUserId(existingUserId);
                return existingUserId;
            }

            const token = localStorage.getItem('token');
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData && userData.user && userData.user._id) {
                    localStorage.setItem('userId', userData.user._id);
                    setCurrentUserId(userData.user._id);
                    return userData.user._id;
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
        }
    };

    const fetchChat = async (isBackgroundCheck = false) => {
        // If it's a background check, don't show loading state
        if (!isBackgroundCheck) {
            setLoading(true);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chat/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Check if we have new messages before updating state
                const newMessageCount = data.chat?.messages?.length || 0;
                const hasNewMessages = newMessageCount > lastMessageCount;

                // Update state only if:
                // 1. This is the first load OR
                // 2. There are new messages OR
                // 3. This is a manual refresh (not a background check)
                if (!chat || hasNewMessages || !isBackgroundCheck) {
                    setChat(data.chat);
                    setLastMessageCount(newMessageCount);

                    // Determine the other user in the conversation
                    if (data.chat && data.chat.participants) {
                        const userId = localStorage.getItem('userId');
                        if (userId) {
                            setCurrentUserId(userId);

                            const otherParticipant = data.chat.participants.find(
                                participant => participant._id !== userId
                            );
                            setOtherUser(otherParticipant);
                        }
                    }

                    // Only scroll to bottom if new messages came in
                    if (hasNewMessages) {
                        setTimeout(scrollToBottom, 100);
                    }
                }

                setLoading(false);
            } else {
                console.error('Failed to fetch chat:', await response.text());
                if (!isBackgroundCheck) {
                    setLoading(false);
                    setError('Failed to load chat');
                }
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
            if (!isBackgroundCheck) {
                setLoading(false);
                setError('Error connecting to server');
            }
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chat/${params.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newMessage })
            });

            let responseData;
            try {
                const responseText = await response.text();
                console.log('Send message response:', responseText);
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parsing response:', e);
                throw new Error('Invalid response from server');
            }

            if (response.ok) {
                setNewMessage('');

                // Add optimistic update for better UX
                const userId = localStorage.getItem('userId');
                if (userId) {
                    setCurrentUserId(userId);

                    const currentUser = chat.participants.find(p => p._id === userId);

                    // For safety, provide a fallback if current user not found
                    const senderObj = currentUser || { _id: userId, name: 'Me' };

                    const optimisticMessage = {
                        _id: 'temp-' + Date.now(),
                        content: newMessage,
                        sender: senderObj,
                        createdAt: new Date().toISOString(),
                        isOptimistic: true
                    };

                    setChat(prevChat => ({
                        ...prevChat,
                        messages: [...prevChat.messages, optimisticMessage]
                    }));

                    // Then fetch the actual updated chat
                    await fetchChat();
                }
            } else {
                console.error('Failed to send message:', responseData?.message || 'Unknown error');
                setError(`Failed to send message: ${responseData?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setError(`Error sending message: ${error.message}`);
        } finally {
            setSending(false);
            messageInputRef.current?.focus();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (chat && chat.messages && chat.messages.length > 0) {
            scrollToBottom();
        }
    }, [chat?.messages?.length]);

    const formatMessageDate = (date) => {
        const messageDate = new Date(date);

        if (isToday(messageDate)) {
            return 'Today';
        } else if (isYesterday(messageDate)) {
            return 'Yesterday';
        } else {
            return format(messageDate, 'MMMM d, yyyy');
        }
    };

    // Fix the groupMessagesByDate function to handle null chat safely
    const groupMessagesByDate = () => {
        if (!chat || !chat.messages || !Array.isArray(chat.messages)) {
            console.log('No valid messages to group by date');
            return {};
        }

        const groups = {};
        chat.messages.forEach((message) => {
            if (!message || !message.createdAt) {
                console.log('Invalid message:', message);
                return;
            }

            const date = new Date(message.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!groups[date]) {
                groups[date] = [];
            }

            groups[date].push(message);
        });

        console.log('Grouped messages:', Object.keys(groups));
        return groups;
    };

    // Safely initialize messageGroups with null checking
    const messageGroups = useMemo(() => {
        if (!chat || !chat.messages) {
            return {};
        }
        return groupMessagesByDate();
    }, [chat?.messages]);

    const formatMessageTime = (date) => {
        return format(new Date(date), 'h:mm a');
    };

    // CORRECTLY identify messages from the current user
    const isMyMessage = (message) => {
        try {
            // Simple guard clause
            if (!message || !message.sender || !currentUserId) {
                return false;
            }

            // Convert IDs to strings for comparison
            const senderId = typeof message.sender === 'object'
                ? String(message.sender._id)
                : String(message.sender);

            const myId = String(currentUserId);

            // Debug to console
            console.log(`Comparing IDs - Message sender: ${senderId}, Current user: ${myId}`);

            // Return true if the message is from the current user
            return senderId === myId;
        } catch (error) {
            console.error('Error in isMyMessage:', error);
            return false;
        }
    };

    if (loading && !chat) {
        return (
            <div className="chat-view-container">
                <div className="loading-spinner-chat"></div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="chat-view-container">
                <div className="chat-header">
                    <Link href="/chat" className="back-button">
                        &larr; Back to chats
                    </Link>
                </div>
                <div className="message-error">
                    <p>This chat could not be loaded or doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button
                    className="back-button"
                    onClick={() => router.push('/chat')}
                >
                    &larr;
                </button>
                <div className="chat-header-info">
                    {otherUser ? (
                        <div className="user-info">
                            <img
                                src={otherUser.profileImage || '/default-avatar.png'}
                                alt={otherUser.name || 'User'}
                                className="avatar"
                            />
                            <h2>{otherUser.name}</h2>
                        </div>
                    ) : (
                        <h2>Loading user...</h2>
                    )}
                </div>
            </div>

            <div className="messages-container" ref={messagesEndRef}>
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading conversation...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>Error: {error}</p>
                        <button onClick={() => fetchChat(false)}>Try Again</button>
                    </div>
                ) : !chat ? (
                    <div className="empty-state">
                        <p>Waiting for chat data...</p>
                    </div>
                ) : Object.keys(messageGroups).length === 0 ? (
                    <div className="empty-state">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    Object.entries(messageGroups).map(([date, messagesForDate]) => (
                        <div key={date} className="message-group">
                            <div className="date-divider">
                                <span>{date}</span>
                            </div>
                            {messagesForDate && Array.isArray(messagesForDate) ? messagesForDate.map((message) => {
                                const isMine = isMyMessage(message);

                                return (
                                    <div
                                        key={message._id || `msg-${Date.now()}`}
                                        style={{
                                            display: 'flex',
                                            justifyContent: isMine ? 'flex-end' : 'flex-start',
                                            width: '100%',
                                            marginBottom: '10px'
                                        }}
                                    >
                                        {/* Show avatar for other's messages */}
                                        {!isMine && otherUser && (
                                            <img
                                                src={otherUser.profileImage || '/default-avatar.png'}
                                                alt={otherUser.name}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                    alignSelf: 'flex-end'
                                                }}
                                            />
                                        )}

                                        {/* Message bubble */}
                                        <div
                                            style={{
                                                maxWidth: '70%',
                                                padding: '12px 16px',
                                                borderRadius: '18px',
                                                backgroundColor: isMine ? '#3182ce' : 'white',
                                                color: isMine ? 'white' : '#333',
                                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                                borderBottomRightRadius: isMine ? '5px' : '18px',
                                                borderBottomLeftRadius: isMine ? '18px' : '5px',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ marginBottom: '20px' }}>
                                                {message.content}
                                            </div>
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '5px',
                                                    right: '10px',
                                                    fontSize: '11px',
                                                    color: isMine ? 'rgba(255, 255, 255, 0.7)' : '#888'
                                                }}
                                            >
                                                {formatMessageTime(new Date(message.createdAt))}
                                            </div>
                                        </div>

                                        {/* Empty space for my messages to balance layout */}
                                        {isMine && (
                                            <div style={{ width: '32px', marginLeft: '8px' }} />
                                        )}
                                    </div>
                                );
                            }) : (
                                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                    No messages to display
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="message-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    ref={messageInputRef}
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={!newMessage.trim() || sending}
                >
                    {sending ? '...' : '→'}
                </button>
            </form>

            <style jsx>{`
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background-color: #f0f4f8;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                
                .chat-header {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background-color: #ffffff;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    z-index: 10;
                }
                
                .back-button {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #4a5568;
                    margin-right: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                }
                
                .chat-header-info {
                    flex: 1;
                }
                
                .user-info {
                    display: flex;
                    align-items: center;
                }
                
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 12px;
                    object-fit: cover;
                    border: 1px solid #e2e8f0;
                }
                
                h2 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1a202c;
                }
                
                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }
                
                .loading-state, .error-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #718096;
                    text-align: center;
                    padding: 20px;
                }
                
                .spinner {
                    width: 36px;
                    height: 36px;
                    border: 3px solid rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    border-top-color: #3182ce;
                    animation: spin 1s ease-in-out infinite;
                    margin-bottom: 16px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .error-state button {
                    margin-top: 16px;
                    padding: 8px 16px;
                    background-color: #3182ce;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .message-group {
                    margin-bottom: 16px;
                }
                
                .date-divider {
                    display: flex;
                    align-items: center;
                    margin: 24px 0 16px;
                    color: #718096;
                    font-size: 12px;
                }
                
                .date-divider:before, .date-divider:after {
                    content: "";
                    flex: 1;
                    height: 1px;
                    background-color: #e2e8f0;
                }
                
                .date-divider:before {
                    margin-right: 12px;
                }
                
                .date-divider:after {
                    margin-left: 12px;
                }
                
                .my-message {
                    justify-content: flex-end;
                }
                
                .their-message {
                    justify-content: flex-start;
                }
                
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    margin-right: 8px;
                    object-fit: cover;
                }
                
                .message-input-form {
                    display: flex;
                    padding: 12px 16px;
                    background-color: white;
                    border-top: 1px solid #e2e8f0;
                }
                
                .message-input {
                    flex: 1;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 12px 16px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                
                .message-input:focus {
                    border-color: #3182ce;
                }
                
                .send-button {
                    background-color: #3182ce;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    color: white;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .send-button:hover {
                    background-color: #2c5282;
                }
                
                .send-button:disabled {
                    background-color: #a0aec0;
                    cursor: not-allowed;
                }
                
                @media (max-width: 768px) {
                    .message-bubble {
                        max-width: 85%;
                    }
                    
                    .message-input {
                        padding: 10px 14px;
                    }
                    
                    .send-button {
                        width: 36px;
                        height: 36px;
                    }
                }
            `}</style>
        </div>
    );
}