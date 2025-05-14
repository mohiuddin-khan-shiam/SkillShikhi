'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../styles.css';
import NotificationsPanel from '../components/NotificationsPanel';
import Image from 'next/image';

export default function FriendsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmUnfriend, setConfirmUnfriend] = useState(null);
    const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
    const [friendToUnfriend, setFriendToUnfriend] = useState(null);

    useEffect(() => {
        fetchFriendsData();
    }, []);

    const fetchFriendsData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch('/api/friends', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch friends data');
            }

            const data = await res.json();
            console.log('📊 Friends data:', data);

            setFriends(data.friends || []);
            setSentRequests(data.sent || []);
            setReceivedRequests(data.received || []);
        } catch (error) {
            console.error('Error fetching friends data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch('/api/friends/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ requestId })
            });

            if (!res.ok) {
                throw new Error('Failed to cancel request');
            }

            // Remove the request from local state
            setSentRequests(prevRequests =>
                prevRequests.filter(req => req._id !== requestId)
            );

            setSuccessMessage('Friend request cancelled successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            setError(error.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleRespondToRequest = async (requestId, status) => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/friends/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ requestId, status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setSuccessMessage(data.message || `Friend request ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);

            // Filter out the responded request
            setReceivedRequests(prev => prev.filter(req => req._id !== requestId));

            // If accepted, add to friends
            if (status === 'accepted') {
                const request = receivedRequests.find(req => req._id === requestId);
                if (request && request.user) {
                    const newFriend = typeof request.user === 'object' ? request.user : { _id: request.user };
                    setFriends(prev => [...prev, newFriend]);
                }
            }

            // Refetch the data after a short delay to ensure everything is updated
            setTimeout(() => {
                fetchFriendsData();
            }, 1000);
        } catch (error) {
            console.error('Error responding to request:', error);
            setError(error.message || 'Failed to respond to friend request');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (userId) => {
        // Ensure auth token is stored in session storage before navigating
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Store token in sessionStorage to ensure it's available after navigation
                sessionStorage.setItem('current_auth_token', token);
                console.log('✅ Stored auth token for profile navigation');
                
                // Pre-set the friendship status for faster profile loading
                localStorage.setItem(`friendship_${userId}`, 'true');
            } else {
                console.log('⚠️ No token available when viewing friend profile');
            }
        } catch (error) {
            console.error('Error preparing for profile navigation:', error);
        }
        
        // Navigate to user profile
        router.push(`/user/${userId}`);
    };

    const handleBackToProfile = () => {
        router.push('/profile');
    };

    const handleUnfriend = async (friendId) => {
        try {
            setLoading(true);
            const response = await fetch('/api/friends/unfriend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ friendId }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Friend removed successfully');
                // Update the friends list
                setFriends(friends.filter(friend => friend._id !== friendId));
            } else {
                setError(data.message || 'Failed to remove friend');
            }
        } catch (error) {
            console.error('Error unfriending:', error);
            setError('An error occurred while trying to unfriend');
        } finally {
            setLoading(false);
        }
    };

    const startChat = async (friendId, friendName) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId: friendId,
                    message: `Hey ${friendName}! Let's chat.`
                })
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/chat/${data.chatId}`);
            } else {
                setError('Could not start the chat. Please try again.');
                setTimeout(() => setError(null), 3000);
            }
        } catch (error) {
            console.error('Error creating chat:', error);
            setError('Error creating chat. Please try again.');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleMessage = (userId) => {
        // Navigate to messages with this user
        router.push(`/messages/${userId}`);
    };

    const renderFriends = () => {
        if (!friends.length) {
            return (
                <div className="empty-state-container">
                    <div className="empty-state-icon">👋</div>
                    <p className="empty-message">You don't have any friends yet.</p>
                    <p className="empty-message-sub">Find people with similar skills to connect with!</p>
                </div>
            );
        }

        // Sort friends alphabetically by name
        const sortedFriends = [...friends].sort((a, b) => 
            a.name.localeCompare(b.name)
        );

        return (
            <div className="friend-list-container">
                <div className="list-header">
                    <div className="header-cell profile-cell">Profile</div>
                    <div className="header-cell info-cell">Information</div>
                    <div className="header-cell actions-cell">Actions</div>
                </div>
                {sortedFriends.map((friend) => (
                    <div key={friend._id} className="list-item">
                        <div className="item-cell profile-cell">
                            <img 
                                src={friend.profileImage || '/images/profile-placeholder.png'} 
                                alt={friend.name}
                                className="friend-avatar-img" 
                            />
                        </div>
                        <div className="item-cell info-cell">
                            <h3 className="friend-name">{friend.name}</h3>
                            <p className="friend-location">{friend.location || 'No location provided'}</p>
                            {friend.skills && friend.skills.length > 0 && (
                                <div className="friend-skills">
                                    {friend.skills.slice(0, 2).map((skill, index) => (
                                        <span key={index} className="skill-tag">{skill}</span>
                                    ))}
                                    {friend.skills.length > 2 && <span className="more-skills">+{friend.skills.length - 2}</span>}
                                </div>
                            )}
                        </div>
                        <div className="item-cell actions-cell">
                            <button 
                                className="action-button message-button"
                                onClick={() => handleMessage(friend._id)}
                                title="Send a message"
                            >
                                <span className="button-icon">💬</span>
                                Message
                            </button>
                            <button 
                                className="action-button view-profile-button"
                                onClick={() => handleViewProfile(friend._id)}
                                title="View profile"
                            >
                                <span className="button-icon">👤</span>
                                Profile
                            </button>
                            <button 
                                className="action-button unfriend-button"
                                onClick={() => {
                                    setFriendToUnfriend(friend);
                                    setShowUnfriendConfirm(true);
                                }}
                                title="Remove friend"
                            >
                                <span className="button-icon">✖️</span>
                                Unfriend
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSentRequests = () => {
        if (!sentRequests || sentRequests.length === 0) {
            return (
                <div className="emptyStateContainer">
                    <div className="emptyStateIcon">
                        <span style={{ fontSize: 64, color: '#ccc' }}>👤❌</span>
                    </div>
                    <div className="emptyStateMessage">
                        No pending friend requests sent
                    </div>
                </div>
            );
        }

        // Sort requests by date, newest first
        const sortedRequests = [...sentRequests].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return (
            <div className="friendsList">
                {sortedRequests.map((request) => {
                    const user = request.user;
                    const userName = user?.name || 'Unknown User';
                    const userImage = user?.profilePicture || '/images/default-profile.png';
                    const userLocation = user?.location || 'Location unknown';

                    return (
                        <div key={request._id} className="friendItem">
                            <div className="friendInfo">
                                <div className="friendAvatar">
                                    <Image
                                        src={userImage}
                                        alt={userName}
                                        width={60}
                                        height={60}
                                        className="profilePic"
                                    />
                                </div>
                                <div className="friendDetails">
                                    <div className="friendName">{userName}</div>
                                    <div className="friendLocation">{userLocation}</div>
                                    <div className="requestDate">
                                        Sent on {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="friendActions">
                                <button
                                    className="cancelButton"
                                    onClick={() => handleCancelRequest(request._id)}
                                >
                                    Cancel Request
                                </button>
                                <button
                                    className="viewProfileButton"
                                    onClick={() => handleViewProfile(user._id)}
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderReceivedRequests = () => {
        if (!receivedRequests || receivedRequests.length === 0) {
            return (
                <div className="emptyStateContainer">
                    <div className="emptyStateIcon">
                        <span style={{ fontSize: 64, color: '#ccc' }}>👤❌</span>
                    </div>
                    <div className="emptyStateMessage">
                        No friend requests to respond to
                    </div>
                </div>
            );
        }

        // Sort requests by date, newest first
        const sortedRequests = [...receivedRequests].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return (
            <div className="friendsList">
                {sortedRequests.map((request) => {
                    const user = request.user;
                    const userName = user?.name || 'Unknown User';
                    const userImage = user?.profilePicture || '/images/default-profile.png';
                    const userLocation = user?.location || 'Location unknown';

                    return (
                        <div key={request._id} className="friendItem">
                            <div className="friendInfo">
                                <div className="friendAvatar">
                                    <Image
                                        src={userImage}
                                        alt={userName}
                                        width={60}
                                        height={60}
                                        className="profilePic"
                                    />
                                </div>
                                <div className="friendDetails">
                                    <div className="friendName">{userName}</div>
                                    <div className="friendLocation">{userLocation}</div>
                                </div>
                            </div>
                            <div className="friendActions">
                                <button
                                    className="acceptButton"
                                    onClick={() => handleRespondToRequest(request._id, 'accepted')}
                                >
                                    Accept
                                </button>
                                <button
                                    className="rejectButton"
                                    onClick={() => handleRespondToRequest(request._id, 'rejected')}
                                >
                                    Reject
                                </button>
                                <button
                                    className="viewProfileButton"
                                    onClick={() => handleViewProfile(user._id)}
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const styles = {
        friendItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            marginBottom: '15px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #eaeaea',
        },
        friendInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flex: '1',
        },
        friendAvatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #e0e0e0',
        },
        friendDetails: {
            display: 'flex',
            flexDirection: 'column',
        },
        friendName: {
            margin: '0 0 5px 0',
            fontSize: '1rem',
            fontWeight: '600',
        },
        friendLocation: {
            margin: '0',
            fontSize: '0.85rem',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
        },
        friendActions: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
        },
        messageButton: {
            backgroundColor: '#4a69bd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'background-color 0.2s',
        },
        viewProfileButton: {
            backgroundColor: '#60a3bc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'background-color 0.2s',
        },
        unfriendButton: {
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'background-color 0.2s',
        },
        confirmDialog: {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000',
        },
        confirmDialogContent: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        },
        confirmDialogTitle: {
            margin: '0 0 15px 0',
            fontSize: '1.2rem',
        },
        confirmDialogText: {
            margin: '0 0 20px 0',
            color: '#555',
        },
        confirmDialogActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
        },
        cancelButton: {
            background: '#f1f1f1',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 15px',
            cursor: 'pointer',
            fontWeight: '500',
        },
        confirmButton: {
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 15px',
            cursor: 'pointer',
            fontWeight: '500',
        },
        requestStatus: {
            margin: 0,
            fontSize: '0.85rem',
            color: '#666',
        },
        statusIcon: {
            marginRight: '5px',
        },
    };

    return (
        <div className="friends-wrapper">
            <header className="profile-header">
                <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                <div className="nav-buttons">
                    <NotificationsPanel />
                    <button onClick={handleBackToProfile} className="back-button">
                        <span className="button-icon">⬅️</span> Back to Profile
                    </button>
                </div>
            </header>

            <div className="friends-container">
                <h1>Friends &amp; Requests</h1>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        <span className="tab-icon">👥</span>
                        Friends <span className="count-badge">{friends.length}</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
                        onClick={() => setActiveTab('received')}
                    >
                        <span className="tab-icon">📩</span>
                        Requests <span className="count-badge">{receivedRequests.length}</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sent')}
                    >
                        <span className="tab-icon">📤</span>
                        Sent <span className="count-badge">{sentRequests.length}</span>
                    </button>
                </div>

                <div className="tab-content">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'friends' && renderFriends()}
                            {activeTab === 'sent' && renderSentRequests()}
                            {activeTab === 'received' && renderReceivedRequests()}
                        </>
                    )}
                </div>
            </div>

            {/* Improved Unfriend Confirmation Dialog */}
            {showUnfriendConfirm && friendToUnfriend && (
                <div className="confirmation-dialog-overlay">
                    <div className="confirmation-dialog">
                        <div className="confirmation-dialog-header">
                            <h3>Remove Friend</h3>
                            <button 
                                className="close-dialog-button"
                                onClick={() => {
                                    setShowUnfriendConfirm(false);
                                    setFriendToUnfriend(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="confirmation-dialog-content">
                            <div className="confirmation-user-info">
                                <img 
                                    src={friendToUnfriend.profileImage || '/images/profile-placeholder.png'} 
                                    alt={friendToUnfriend.name}
                                    className="confirmation-avatar" 
                                />
                                <p>
                                    Are you sure you want to unfriend <strong>{friendToUnfriend.name}</strong>?
                                </p>
                            </div>
                            <p className="confirmation-note">
                                They will not be notified, but you will no longer be friends.
                            </p>
                        </div>
                        <div className="dialog-buttons">
                            <button 
                                className="cancel-button"
                                onClick={() => {
                                    setShowUnfriendConfirm(false);
                                    setFriendToUnfriend(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-button"
                                onClick={() => {
                                    handleUnfriend(friendToUnfriend._id);
                                    setShowUnfriendConfirm(false);
                                    setFriendToUnfriend(null);
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .friends-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                }
                
                .profile-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    margin-bottom: 20px;
                }
                
                .logo {
                    height: 40px;
                }
                
                .nav-buttons {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: #f0f2f5;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                    color: #050505;
                    transition: background-color 0.2s;
                }
                
                .back-button:hover {
                    background: #e4e6eb;
                }
                
                .friends-container {
                    background-color: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }
                
                h1 {
                    font-size: 24px;
                    margin-top: 0;
                    margin-bottom: 20px;
                    color: #1c1e21;
                }
                
                .error-message, .success-message {
                    padding: 10px 15px;
                    border-radius: 6px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                }
                
                .error-message {
                    background-color: #ffebe9;
                    color: #cb2431;
                    border: 1px solid #ffc1c0;
                }
                
                .success-message {
                    background-color: #e6f6e6;
                    color: #1d8348;
                    border: 1px solid #c3e6cb;
                }
                
                .tabs {
                    display: flex;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #dddfe2;
                    overflow-x: auto;
                }
                
                .tab-button {
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    color: #65676b;
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.2s;
                    font-size: 15px;
                }
                
                .tab-button:hover {
                    color: #1877f2;
                    background-color: #f0f2f5;
                }
                
                .tab-button.active {
                    color: #1877f2;
                    border-bottom: 3px solid #1877f2;
                }
                
                .tab-icon {
                    font-size: 18px;
                }
                
                .count-badge {
                    background-color: #e4e6eb;
                    color: #050505;
                    font-size: 13px;
                    border-radius: 10px;
                    padding: 0 6px;
                    min-width: 20px;
                    height: 20px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .tab-content {
                    padding: 10px 0;
                }
                
                /* Empty states */
                .empty-state-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    text-align: center;
                }
                
                .empty-state-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                
                .empty-message {
                    font-size: 1.1rem;
                    color: #666;
                }
                
                .empty-message-sub {
                    color: #8e8e8e;
                    font-size: 14px;
                    margin: 0;
                }
                
                /* Friends grid */
                .friends-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                
                .friend-card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                    position: relative;
                }
                
                .friend-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                
                .friend-card-cover {
                    height: 80px;
                    background: linear-gradient(45deg, #42a5f5, #2196f3);
                }
                
                .friend-card-avatar {
                    position: absolute;
                    top: 40px;
                    left: 20px;
                    border: 4px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                }
                
                .friend-avatar-img {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                
                .friend-card-content {
                    padding: 60px 20px 20px;
                }
                
                .friend-name {
                    margin: 0 0 4px 0;
                    font-size: 18px;
                    color: #1c1e21;
                }
                
                .friend-meta {
                    color: #65676b;
                    font-size: 14px;
                    margin: 0 0 15px 0;
                }
                
                .friend-card-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                /* Button styles */
                .message-button, .view-profile-button, .unfriend-button,
                .accept-button, .reject-button, .cancel-button {
                    border: none;
                    border-radius: 6px;
                    padding: 8px 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    transition: all 0.2s;
                }
                
                .message-button {
                    background-color: #e7f3ff;
                    color: #1877f2;
                }
                
                .message-button:hover {
                    background-color: #dbeeff;
                }
                
                .view-profile-button {
                    background-color: #f0f2f5;
                    color: #050505;
                }
                
                .view-profile-button:hover {
                    background-color: #e4e6eb;
                }
                
                .view-profile-button.secondary {
                    color: #65676b;
                    background-color: #f0f2f5;
                }
                
                .unfriend-button {
                    background-color: #fef2f2;
                    color: #dc2626;
                }
                
                .unfriend-button:hover {
                    background-color: #fee2e2;
                }
                
                .accept-button {
                    background-color: #1877f2;
                    color: white;
                }
                
                .accept-button:hover {
                    background-color: #166fe5;
                }
                
                .reject-button {
                    background-color: #f0f2f5;
                    color: #65676b;
                }
                
                .reject-button:hover {
                    background-color: #e4e6eb;
                }
                
                .cancel-button {
                    background-color: #e74c3c;
                    color: white;
                }
                
                .cancel-button:hover {
                    background-color: #b91c1c;
                }
                
                .confirm-button {
                    background-color: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .confirm-button:hover {
                    background-color: #b91c1c;
                }
                
                .button-icon {
                    font-size: 16px;
                }
                
                /* Requests list */
                .requests-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .request-item {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .request-item-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex: 1;
                }
                
                .request-user-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .request-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .request-details {
                    display: flex;
                    flex-direction: column;
                }
                
                .request-user-name {
                    margin: 0 0 5px 0;
                    font-size: 16px;
                    color: #1c1e21;
                }
                
                .request-date, .request-status {
                    margin: 0;
                    font-size: 14px;
                    color: #65676b;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .request-status {
                    font-style: italic;
                }
                
                .request-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                /* Loading indicator */
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 0;
                }
                
                .loading-spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #1877f2;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                }
                
                .loading-text {
                    color: #65676b;
                    font-size: 16px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Confirmation Dialog */
                .confirmation-dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .confirmation-dialog {
                    background-color: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 450px;
                    box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2);
                }
                
                .confirmation-dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #dddfe2;
                }
                
                .confirmation-dialog-header h3 {
                    margin: 0;
                    font-size: 20px;
                    color: #1c1e21;
                }
                
                .close-dialog-button {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #65676b;
                    cursor: pointer;
                }
                
                .confirmation-dialog-content {
                    padding: 20px;
                }
                
                .confirmation-user-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                
                .confirmation-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                
                .confirmation-note {
                    color: #65676b;
                    font-size: 14px;
                    margin: 0;
                }
                
                .dialog-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 10px 20px 20px;
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .friends-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .request-item {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .request-actions {
                        width: 100%;
                    }
                }

                /* List Layout Styles */
                .friend-list-container,
                .request-list-container {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .list-header {
                    display: flex;
                    background-color: #f8f9fa;
                    padding: 10px 15px;
                    font-weight: 600;
                    color: #4a5568;
                    border-bottom: 1px solid #e0e0e0;
                }

                .list-item {
                    display: flex;
                    padding: 15px;
                    border-bottom: 1px solid #e0e0e0;
                    transition: background-color 0.2s ease;
                }

                .list-item:last-child {
                    border-bottom: none;
                }

                .list-item:hover {
                    background-color: #f5f8ff;
                }

                .header-cell,
                .item-cell {
                    padding: 0 10px;
                }

                .profile-cell {
                    width: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .info-cell {
                    flex: 1;
                    padding-left: 15px;
                }

                .actions-cell {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                    gap: 5px;
                    min-width: 240px;
                }

                .friend-avatar-img,
                .request-avatar-img {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #e0e0e0;
                }

                .friend-name,
                .request-user-name {
                    margin: 0 0 5px 0;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .friend-location,
                .request-date {
                    margin: 0 0 5px 0;
                    font-size: 0.85rem;
                    color: #666;
                }

                .friend-skills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    margin-top: 5px;
                }

                .skill-tag {
                    display: inline-flex;
                    background: #e0f2fe;
                    color: #0369a1;
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: 12px;
                }

                .more-skills {
                    font-size: 0.75rem;
                    color: #666;
                }
                
                .action-button {
                    padding: 6px 12px;
                    border-radius: 4px;
                    border: none;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    cursor: pointer;
                    transition: background-color 0.2s, transform 0.1s;
                }
                
                .action-button:hover {
                    transform: translateY(-1px);
                }
                
                .message-button {
                    background-color: #4a69bd;
                    color: white;
                }
                
                .view-profile-button {
                    background-color: #60a3bc;
                    color: white;
                }
                
                .unfriend-button {
                    background-color: #e74c3c;
                    color: white;
                }
                
                .accept-button {
                    background-color: #2ecc71;
                    color: white;
                }
                
                .reject-button {
                    background-color: #e74c3c;
                    color: white;
                }
                
                .secondary {
                    background-color: #f1f2f6;
                    color: #2f3542;
                }
                
                .button-icon {
                    font-size: 1rem;
                }
                
                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .list-header {
                        display: none;
                    }
                    
                    .list-item {
                        flex-direction: column;
                        padding: 15px 10px;
                    }
                    
                    .profile-cell {
                        width: 100%;
                        justify-content: flex-start;
                        margin-bottom: 10px;
                    }
                    
                    .info-cell {
                        width: 100%;
                        padding-left: 0;
                        margin-bottom: 15px;
                    }
                    
                    .actions-cell {
                        width: 100%;
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </div>
    );
} 