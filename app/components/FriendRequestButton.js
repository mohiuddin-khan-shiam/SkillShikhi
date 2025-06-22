'use client';

import { useState, useEffect } from 'react';
import '../styles.css';

// Define a wrapper style for the button to use outside of React
const buttonStyles = {
    send: {
        backgroundColor: '#5b21b6',
        color: 'white',
        padding: '12px 20px',
        margin: '15px 0',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: 20,
        display: 'block',
        width: '100%',
        maxWidth: '200px'
    },
    sent: {
        backgroundColor: '#e11d48',
        color: 'white',
        padding: '12px 20px',
        margin: '15px 0',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: 20,
        display: 'block',
        width: '100%',
        maxWidth: '200px'
    },
    accept: {
        backgroundColor: '#059669',
        color: 'white',
        padding: '12px 20px',
        margin: '15px 0',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: 20,
        display: 'block',
        width: '100%',
        maxWidth: '200px'
    },
    friends: {
        backgroundColor: '#9ca3af',
        color: 'white',
        padding: '12px 20px',
        margin: '15px 0',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'default',
        outline: 'none',
        opacity: 0.8,
        position: 'relative',
        zIndex: 20,
        display: 'block',
        width: '100%',
        maxWidth: '200px'
    },
    loading: {
        backgroundColor: '#9ca3af',
        color: 'white',
        padding: '12px 20px',
        margin: '15px 0',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'wait',
        outline: 'none',
        opacity: 0.7,
        position: 'relative',
        zIndex: 20,
        display: 'block',
        width: '100%',
        maxWidth: '200px'
    }
};

const FriendRequestButton = ({ userId, targetUserId, currentUser, onStatusChange }) => {
    // Use targetUserId if provided, otherwise use userId
    const effectiveUserId = targetUserId || userId;

    const [status, setStatus] = useState('loading');
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [requestData, setRequestData] = useState(null);
    const [showUnfriendOption, setShowUnfriendOption] = useState(false);

    console.log('🔄 FriendRequestButton rendering with userId:', effectiveUserId);

    useEffect(() => {
        // Check if we're already friends or have pending requests
        const checkFriendStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('🔍 FriendRequestButton - Target userId:', effectiveUserId);

                if (!token) {
                    console.log('⚠️ No token found, setting status to send');
                    setStatus('send');
                    return;
                }

                const res = await fetch('/api/friends', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    // Add cache control to prevent caching
                    cache: 'no-store'
                });

                if (!res.ok) {
                    console.log('❌ Failed to fetch friend status, setting status to send');
                    setStatus('send');
                    return;
                }

                const data = await res.json();
                console.log('📊 Friend status data:', data);
                console.log('📊 Friends array:', data.friends);
                console.log('📊 Sent requests:', data.sent);
                console.log('📊 Received requests:', data.received);

                // Normalize the target userId (ensure it's a string)
                const normalizedTargetId = String(effectiveUserId);

                // Check if already friends - use normalized string comparison
                const isFriend = data.friends.some(friend => {
                    let friendId;
                    if (typeof friend === 'object') {
                        friendId = String(friend._id);
                    } else {
                        friendId = String(friend);
                    }
                    const isMatch = friendId === normalizedTargetId;
                    console.log(`🔄 Comparing friend ID ${friendId} with target ${normalizedTargetId}: ${isMatch}`);
                    return isMatch;
                });

                if (isFriend) {
                    console.log('✅ Already friends with this user');
                    setStatus('friends');
                    return;
                }

                // Check sent requests - use normalized string comparison
                console.log('🔎 Looking for sent request to user:', normalizedTargetId);
                console.log('📋 All sent requests:', JSON.stringify(data.sent));

                // First pass - try using user object if available
                let sentRequest = data.sent.find(req => {
                    // Check if user is an object
                    if (req.user && typeof req.user === 'object' && req.user._id) {
                        const requestUserId = String(req.user._id);
                        const isMatch = requestUserId === normalizedTargetId && req.status === 'pending';
                        console.log('🔄 Comparing object IDs:', requestUserId, 'vs', normalizedTargetId, 'Match:', isMatch);
                        return isMatch;
                    }
                    return false;
                });

                // Second pass - try with string IDs
                if (!sentRequest) {
                    sentRequest = data.sent.find(req => {
                        const requestUserId = String(req.user);
                        const isMatch = requestUserId === normalizedTargetId && req.status === 'pending';
                        console.log('🔄 Comparing string IDs:', requestUserId, 'vs', normalizedTargetId, 'Match:', isMatch);
                        return isMatch;
                    });
                }

                if (sentRequest) {
                    console.log('📤 Found sent request:', JSON.stringify(sentRequest));
                    setStatus('sent');
                    setRequestData(sentRequest);
                    return;
                }

                // Check received requests - use normalized string comparison
                console.log('🔎 Looking for received request from user:', normalizedTargetId);

                // First pass with object IDs
                let receivedRequest = data.received.find(req => {
                    if (req.user && typeof req.user === 'object' && req.user._id) {
                        const requestUserId = String(req.user._id);
                        const isMatch = requestUserId === normalizedTargetId && req.status === 'pending';
                        console.log('🔄 Comparing received object IDs:', requestUserId, 'vs', normalizedTargetId, 'Match:', isMatch);
                        return isMatch;
                    }
                    return false;
                });

                // Second pass with string IDs
                if (!receivedRequest) {
                    receivedRequest = data.received.find(req => {
                        const requestUserId = String(req.user);
                        const isMatch = requestUserId === normalizedTargetId && req.status === 'pending';
                        console.log('🔄 Comparing received string IDs:', requestUserId, 'vs', normalizedTargetId, 'Match:', isMatch);
                        return isMatch;
                    });
                }

                if (receivedRequest) {
                    console.log('📥 Found received request:', JSON.stringify(receivedRequest));
                    setStatus('accept');
                    setRequestData(receivedRequest);
                    return;
                }

                // Default case - no relationship yet
                console.log('🆕 No relationship found, setting to send');
                setStatus('send');
            } catch (error) {
                console.error('Error checking friend status:', error);
                setStatus('send'); // Fallback
            }
        };

        if (!loading) {
            checkFriendStatus();
        }
    }, [effectiveUserId, loading]);

    // Simple event handlers
    const handleSendRequest = async () => {
        console.log('👥 Attempting to send friend request to user:', effectiveUserId);

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('❌ No auth token found in localStorage');
                setPopupMessage('Please log in to send friend requests');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
                return;
            }

            // Check if effectiveUserId is undefined or invalid
            if (!effectiveUserId) {
                console.error('❌ Invalid userId:', effectiveUserId);
                setPopupMessage('Invalid user ID. Cannot send request.');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
                setLoading(false);
                return;
            }

            // Debug current authentication status
            try {
                console.log('🔍 Verifying current authentication before sending request');
                const profileRes = await fetch('/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    console.log('✅ Authenticated as:', profileData.user?.name, '(ID:', profileData.user?._id, ')');
                } else {
                    console.error('❌ Authentication verification failed with status:', profileRes.status);
                }
            } catch (e) {
                console.error('❌ Error checking authentication:', e);
            }

            // Ensure we're using the string value of the effectiveUserId
            const targetUserId = String(effectiveUserId);
            console.log('🔄 Sending friend request with params - userId:', targetUserId, 'token length:', token.length);

            // Use XMLHttpRequest for direct control over the request
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/friends', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.onload = async () => {
                console.log('📄 Direct XHR response status:', xhr.status);
                console.log('📄 Direct XHR response text:', xhr.responseText);

                let data;
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    console.error('❌ Error parsing XHR response:', e);
                    data = { message: 'Failed to parse response' };
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log('✅ Friend request sent successfully');
                    setStatus('sent');
                    if (onStatusChange) onStatusChange('sent');
                    setPopupMessage('Friend request sent!');
                    setShowPopup(true);

                    // Refresh to get request ID
                    try {
                        console.log('🔄 Fetching updated friend data to get request ID');
                        const friendsRes = await fetch('/api/friends', {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        if (friendsRes.ok) {
                            const friendsData = await friendsRes.json();
                            console.log('📊 Updated friend data:', friendsData);

                            // Use normalized string comparison for user IDs
                            const sentRequest = friendsData.sent.find(req => {
                                const requestUserId = req.user && typeof req.user === 'object'
                                    ? String(req.user._id)
                                    : String(req.user);
                                return requestUserId === targetUserId && req.status === 'pending';
                            });

                            if (sentRequest) {
                                console.log('✅ Found sent request with ID:', sentRequest._id);
                                setRequestData(sentRequest);
                            } else {
                                console.warn('⚠️ Could not find the sent request in updated data');
                            }
                        }
                    } catch (error) {
                        console.error('❌ Error fetching updated friend data:', error);
                    }
                } else {
                    console.error('❌ Failed to send friend request:', data.message);

                    // Handle specific error cases
                    if (data.message && data.message.includes('Already friends')) {
                        setStatus('friends');
                        setPopupMessage('You are already friends with this user');
                    } else if (data.message && data.message.includes('already sent')) {
                        setStatus('sent');
                        setPopupMessage('Friend request already sent');
                    } else {
                        setPopupMessage(data.message || 'Failed to send request');
                    }
                    setShowPopup(true);
                }

                setLoading(false);
                setTimeout(() => setShowPopup(false), 3000);
            };

            xhr.onerror = () => {
                console.error('❌ XHR Network error when sending friend request');
                setPopupMessage('Network error occurred');
                setShowPopup(true);
                setLoading(false);
                setTimeout(() => setShowPopup(false), 3000);
            };

            // Send the request using XHR
            const requestData = JSON.stringify({ userId: targetUserId });
            console.log('📤 Sending XHR request with data:', requestData);
            xhr.send(requestData);

        } catch (error) {
            console.error('❌ Error in friend request process:', error);
            setPopupMessage('An error occurred');
            setShowPopup(true);
            setLoading(false);
            setTimeout(() => setShowPopup(false), 3000);
        }
    };

    const handleCancelRequest = async () => {
        try {
            setLoading(true);
            console.log('🛑 Attempting to cancel request to user:', effectiveUserId);

            // Get the token from localStorage or sessionStorage
            let token = localStorage.getItem('token');

            // Try to get token from sessionStorage if not in localStorage
            if (!token) {
                token = sessionStorage.getItem('current_auth_token');
                if (token) {
                    // Store in localStorage for consistency
                    localStorage.setItem('token', token);
                    console.log('✅ Restored token from sessionStorage for cancel request');
                }
            } else {
                // Ensure token is also in sessionStorage
                sessionStorage.setItem('current_auth_token', token);
            }

            if (!token) {
                console.error('❌ No auth token found in localStorage or sessionStorage');
                setPopupMessage('Please log in to cancel requests');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
                setLoading(false);
                return Promise.reject(new Error('No auth token found'));
            }

            // Use the new cancel-request endpoint
            console.log('📤 Sending cancellation request with targetUserId:', effectiveUserId);

            const res = await fetch('/api/friends/cancel-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId: effectiveUserId }),
                cache: 'no-store' // Ensure no caching
            });

            console.log('📤 Cancel request response status:', res.status);

            // Get response text first to debug any JSON parsing issues
            const responseText = await res.text();
            console.log('📤 Cancel request response text:', responseText);

            // Try to parse the response data
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('📄 Parsed cancellation response:', data);
            } catch (error) {
                console.error('❌ Error parsing cancellation response:', error);
                data = { message: 'Failed to parse server response' };
            }

            if (res.ok) {
                console.log('✅ Successfully cancelled friend request');
                setStatus('send');
                setRequestData(null);
                if (onStatusChange) onStatusChange('send');
                setPopupMessage('Request cancelled! Refreshing...');
                setShowPopup(true);

                // Force a state refresh
                setTimeout(() => {
                    // Trigger a recheck of friend status
                    setLoading(false);
                    // Trigger a complete page reload to get fresh data after a delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }, 500);

                return Promise.resolve(true);
            } else {
                console.error('❌ Failed to cancel request:', data.message);
                setPopupMessage(data.message || 'Failed to cancel request');
                setShowPopup(true);
                setLoading(false);
                setTimeout(() => setShowPopup(false), 3000);
                return Promise.reject(new Error(data.message || 'Failed to cancel request'));
            }
        } catch (error) {
            console.error('❌ Error cancelling friend request:', error);
            setPopupMessage('An error occurred while cancelling the request');
            setShowPopup(true);
            setLoading(false);
            setTimeout(() => setShowPopup(false), 3000);
            return Promise.reject(error);
        }
    };

    const handleAcceptRequest = async () => {
        if (!requestData || !requestData._id) {
            setPopupMessage('No request data available');
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const res = await fetch('/api/friends', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    requestId: requestData._id,
                    action: 'accept'
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('friends');
                if (onStatusChange) onStatusChange('friends');
                setPopupMessage('Friend request accepted!');
                setShowPopup(true);
            } else {
                setPopupMessage(data.message || 'Failed to accept request');
                setShowPopup(true);
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            setPopupMessage('An error occurred');
            setShowPopup(true);
        } finally {
            setLoading(false);
            setTimeout(() => setShowPopup(false), 3000);
        }
    };

    const handleUnfriend = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const res = await fetch('/api/friends/unfriend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    friendId: effectiveUserId
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('send');
                if (onStatusChange) onStatusChange('send');
                setPopupMessage('Friend removed!');
                setShowPopup(true);
            } else {
                console.error('❌ Failed to unfriend:', data.message);
                setPopupMessage(data.message || 'Failed to remove friend');
                setShowPopup(true);
            }
        } catch (error) {
            console.error('❌ Error unfriending:', error);
            setPopupMessage('An error occurred');
            setShowPopup(true);
        } finally {
            setLoading(false);
            setTimeout(() => setShowPopup(false), 3000);
        }
    };

    const renderPopupMessage = () => {
        if (!showPopup) return null;

        return (
            <div style={{
                position: 'absolute',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#4b5563',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                zIndex: 110,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap'
            }}>
                {popupMessage}
            </div>
        );
    };

    // Render a basic HTML button based on the current status
    if (status === 'loading') {
        return (
            <div style={{ position: 'relative' }}>
                <button style={{ ...buttonStyles.loading }} disabled>Loading...</button>
                {renderPopupMessage()}
            </div>
        );
    }

    if (status === 'send') {
        return (
            <div style={{ position: 'relative' }}>
                <button
                    onClick={(e) => {
                        console.log('🖱️ Add Friend button clicked');
                        e.stopPropagation(); // Prevent event bubbling
                        handleSendRequest();
                    }}
                    disabled={loading}
                    style={{
                        ...buttonStyles.send,
                        cursor: 'pointer',
                        pointerEvents: 'auto'
                    }}
                >
                    {loading ? 'Sending...' : 'Send Friend Request'}
                </button>
                {renderPopupMessage()}
            </div>
        );
    }

    if (status === 'sent') {
        return (
            <div style={{ position: 'relative' }}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        console.log('🖱️ Cancel Request button clicked for user:', effectiveUserId);

                        // Add immediate visual feedback
                        const button = e.target;
                        const originalText = button.innerText;
                        button.innerText = 'Cancelling...';
                        button.style.opacity = '0.7';

                        // Call the handler function
                        handleCancelRequest()
                            .catch(err => {
                                console.error('Failed to cancel request:', err);
                                setPopupMessage('Failed to cancel request. Try again.');
                                setShowPopup(true);
                                setTimeout(() => setShowPopup(false), 5000);
                            })
                            .finally(() => {
                                // Reset button if still in sent state
                                if (status === 'sent') {
                                    button.innerText = originalText;
                                    button.style.opacity = '1';
                                }
                            });
                    }}
                    disabled={loading}
                    style={{
                        ...buttonStyles.sent,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    {loading ? 'Cancelling...' : 'Cancel Request'}
                </button>

                {/* Force refresh option */}
                <div
                    onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                            setLoading(false);
                        }, 500);
                    }}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        backgroundColor: '#f97316',
                        color: 'white',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        marginTop: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        opacity: 0.7,
                        zIndex: 100
                    }}
                >
                    Refresh Status
                </div>

                {showPopup && (
                    <div style={{
                        position: 'absolute',
                        top: '-40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#4b5563',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        zIndex: 110,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap'
                    }}>
                        {popupMessage}
                        {popupMessage.includes('Failed') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelRequest();
                                }}
                                style={{
                                    marginLeft: '8px',
                                    background: '#e74c3c',
                                    border: 'none',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                Retry
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (status === 'accept') {
        return (
            <div style={{ position: 'relative' }}>
                <button
                    onClick={handleAcceptRequest}
                    disabled={loading}
                    style={{ ...buttonStyles.accept }}
                >
                    {loading ? 'Accepting...' : 'Accept Request'}
                </button>
                {renderPopupMessage()}
            </div>
        );
    }

    if (status === 'friends') {
        return (
            <div
                style={{
                    position: 'relative',
                    display: 'block'
                }}
                onMouseEnter={() => setShowUnfriendOption(true)}
                onMouseLeave={() => setShowUnfriendOption(false)}
            >
                <button
                    onClick={() => setShowUnfriendOption(!showUnfriendOption)}
                    style={{
                        ...buttonStyles.friends,
                        backgroundColor: showUnfriendOption ? '#d1d5db' : '#9ca3af'
                    }}
                >
                    Friends
                </button>

                {showUnfriendOption && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            maxWidth: '200px',
                            backgroundColor: 'white',
                            borderRadius: '0 0 8px 8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                            zIndex: 150,
                            marginTop: '2px'
                        }}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                handleUnfriend();
                            }}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Removing...' : 'Unfriend'}
                        </button>
                    </div>
                )}
                {renderPopupMessage()}
            </div>
        );
    }

    return null;
};

export default FriendRequestButton;
