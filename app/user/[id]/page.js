'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ClientOnly from '../../../components/ClientOnly';

// Dynamically import the ReportButton component with SSR disabled
const ReportButton = dynamic(() => import('../../../components/ReportButton'), { ssr: false });
import { useRouter, useParams } from 'next/navigation';
import '../../styles.css';
import FriendRequestButton from '../../components/FriendRequestButton';
import NotificationsPanel from '../../components/NotificationsPanel';
import SessionRequestButton from '../../components/SessionRequestButton';

export default function ViewUserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params?.id;

    console.log('🔄 ViewUserProfilePage rendered, userId from params:', userId);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);

    // State for post creation
    const [showPostForm, setShowPostForm] = useState(false);
    const [postData, setPostData] = useState({
        content: '',
        skillTag: '',
        media: null,
        mediaPreview: null,
        mediaType: null
    });
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // Add state for likes and comments after the post-related state
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [commentsVisible, setCommentsVisible] = useState({});
    const [postsWithComments, setPostsWithComments] = useState({});
    const [isLiking, setIsLiking] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [friendStatusKey, setFriendStatusKey] = useState(0);

    const [friendRequestSent, setFriendRequestSent] = useState(false);
    const [cancellingRequest, setCancellingRequest] = useState(false);
    
    // State for client-side rendering
    const [mounted, setMounted] = useState(false);
    
    // Use useEffect to handle client-side rendering
    useEffect(() => {
        setMounted(true);
    }, []);

    // Add a useEffect to fetch current user if not available - moved from privacy error section
    useEffect(() => {
        if (!currentLoggedInUser && error === 'privacy') {
            async function fetchCurrentUserForPrivacy() {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        console.log('⚠️ No token found, skipping current user fetch');
                        return;
                    }

                    console.log('🔍 Fetching current user profile for privacy view');
                    const res = await fetch('/api/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        console.log('✅ Current user data received for privacy view:', data.user);
                        if (data.user && data.user._id) {
                            localStorage.setItem('userId', data.user._id);
                        }
                        setCurrentLoggedInUser(data.user);
                    } else {
                        console.error('❌ Failed to fetch current user for privacy view');
                    }
                } catch (error) {
                    console.error('❌ Error in fetchCurrentUserForPrivacy:', error);
                }
            }

            fetchCurrentUserForPrivacy();
        }
    }, [currentLoggedInUser, error]);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                console.log('🔍 Fetching user profile data for:', userId);

                // Get the token from localStorage or sessionStorage
                let token = localStorage.getItem('token');

                // Check if we're coming from the friends page, and ensure the token is properly set
                if (!token) {
                    console.log('⚠️ No token found in localStorage, checking sessionStorage');
                    token = sessionStorage.getItem('current_auth_token');
                    if (token) {
                        // Restore token to localStorage if it was only in sessionStorage
                        localStorage.setItem('token', token);
                        console.log('✅ Restored token from sessionStorage to localStorage');
                    }
                } else {
                    // Always ensure it's also in sessionStorage too for consistency
                    sessionStorage.setItem('current_auth_token', token);
                }

                console.log('🔒 Using auth token for profile fetch:', token ? 'Yes' : 'No');

                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                // First check if we already verified a friendship
                const knownFriendship = localStorage.getItem('friendship_' + userId);
                if (knownFriendship === 'true') {
                    console.log('✅ Using cached friendship status: Friends');
                }

                console.log('🔍 Making API request to:', `/api/public-profile/${userId}`);
                const res = await fetch(`/api/public-profile/${userId}`, {
                    headers
                });

                // Check for error response BEFORE parsing JSON
                if (!res.ok) {
                    try {
                        // Get the content type to check if it's JSON
                        const contentType = res.headers.get('content-type');

                        if (contentType && contentType.includes('application/json')) {
                            // Parse the error response if it's JSON
                            const errorData = await res.json();
                            console.error('❌ API error response:', errorData);

                            // Check specifically for privacy error
                            if (res.status === 403 && errorData.message === 'Profile is private') {
                                console.log('🔒 Privacy setting detected: Profile is private');

                                // If we already know they're friends but getting privacy error,
                                // there's an issue with the auth token
                                if (knownFriendship === 'true') {
                                    console.log('⚠️ Getting privacy error despite being friends - auth issue');
                                    // Clear token and friendship status
                                    localStorage.removeItem('friendship_' + userId);
                                    setError('auth');
                                } else {
                                    // Try to verify friendship status before showing privacy error
                                    const isFriend = await refreshFriendshipStatus();
                                    if (isFriend) {
                                        // If we confirm they're friends, try to fetch the profile again
                                        console.log('🔄 Friendship confirmed, retrying profile fetch');
                                        fetchUserProfile();
                                        return;
                                    } else {
                                        setError('privacy');
                                    }
                                }
                            } else {
                                console.error('❌ Failed to fetch user profile:', errorData.message);
                                setError(errorData.message || 'Failed to fetch user profile');
                            }
                        } else {
                            // Handle non-JSON error response
                            const errorText = await res.text();
                            console.error('❌ API error response (non-JSON):', errorText || 'Empty response');
                            setError('Failed to fetch user profile: ' + (errorText || 'Server error'));
                        }
                    } catch (parseError) {
                        // Handle JSON parsing error or empty response
                        console.error('❌ Error parsing API response:', parseError);
                        setError('Failed to fetch user profile: Server returned an invalid response');
                    }

                    // Important: Set loading to false before returning
                    setLoading(false);
                    return;
                }

                // If response is OK, parse the data
                const data = await res.json();
                console.log('✅ User profile data received:', data);

                // Handle private profile case with 200 status but isPrivate flag
                if (data.isPrivate === true) {
                    console.log('🔒 Private profile detected with limited data');

                    // Set the user with limited data
                    if (data.user) {
                        setUser(data.user);

                        // Ensure we check friend request status even for private profiles
                        setTimeout(() => {
                            // Check if there's an active friend request
                            checkRequestStatus();
                        }, 100);
                    }

                    // Set privacy error status to show appropriate UI
                    setError('privacy');
                    setLoading(false);
                    return;
                }

                // Validate user data before setting it
                if (!data.user || !data.user.name) {
                    console.error('❌ Invalid user data received:', data);
                    setError('Invalid user data received');
                    setLoading(false);
                    return;
                }

                setUser(data.user);
                // Clear any previous error
                setError(null);

                // Check if there's an active friend request
                checkRequestStatus();

            } catch (error) {
                // This will catch network errors and other exceptions
                console.error('❌ Error in fetchUserProfile:', error);

                // Don't overwrite if we already set the privacy error
                if (error !== 'privacy') {
                    setError(error.message || 'An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        }

        // Get the current logged in user
        async function fetchCurrentUser() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('⚠️ No token found, skipping current user fetch');
                    return;
                }

                console.log('🔍 Fetching current user profile');
                const res = await fetch('/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log('✅ Current user data received:', data.user);
                    // Store the current user ID for later use in chat functionality
                    if (data.user && data.user._id) {
                        localStorage.setItem('userId', data.user._id);
                    }
                    setCurrentLoggedInUser(data.user);
                } else {
                    console.error('❌ Failed to fetch current user');
                }
            } catch (error) {
                console.error('❌ Error in fetchCurrentUser:', error);
            }
        }

        if (userId) {
            fetchUserProfile();
            fetchCurrentUser();
        }
    }, [userId, friendStatusKey]);

    // Fetch posts when user data is loaded - always declare the hook unconditionally
    useEffect(() => {
        // Move the conditional check inside
        if (user) {
            fetchPosts();
            setShouldRender(true);
        }
    }, [user]);

    // Add backup effect to ensure consistent hook order
    useEffect(() => {
        // This empty effect ensures hook order consistency
    }, []);

    const handleBackToSkills = () => {
        router.push('/skills');
    };

    const handleBackToProfile = () => {
        router.push('/profile');
    };

    // Fetch user posts
    const fetchPosts = async () => {
        setPostsLoading(true);
        try {
            // Ensure we have a consistent token across navigation contexts
            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('current_auth_token');
                if (token) {
                    // Restore token to localStorage if missing
                    localStorage.setItem('token', token);
                    console.log('✅ Restored token from sessionStorage for posts fetch');
                }
            }

            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log('🔍 Fetching posts for user:', userId);
            console.log('🔒 Using auth token for posts fetch:', token ? 'Yes' : 'No');

            const response = await fetch(`/api/posts/user/${userId}`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Received ${data.posts?.length || 0} posts for user ${userId}`);
                setPosts(data.posts || []);
            } else {
                console.error('Failed to fetch posts:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setPostsLoading(false);
        }
    };

    // Function to directly send friend request
    const sendFriendRequest = async () => {
        try {
            // Get token from localStorage or sessionStorage
            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('current_auth_token');
                if (token) {
                    localStorage.setItem('token', token);
                    console.log('Restored token from sessionStorage for friend request');
                }
            }

            if (!token) {
                alert('Please log in to send friend requests');
                router.push('/login');
                return;
            }

            console.log('Sending friend request to user:', userId);

            // Additional log to debug token
            console.log('Token length for request:', token.length, 'Token starts with:', token.substring(0, 10) + '...');

            // Use XMLHttpRequest for better control and compatibility
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/friends', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.onload = function () {
                console.log('Friend request response status:', xhr.status);
                console.log('Friend request response text:', xhr.responseText);

                let data;
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    console.error('Error parsing response:', e);
                    data = { message: 'Unknown error occurred' };
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    alert('Friend request sent successfully!');
                    setFriendRequestSent(true);
                    setFriendStatusKey(prev => prev + 1);
                } else {
                    if (data.message && data.message.includes('already sent')) {
                        alert('You have already sent a friend request to this user');
                        setFriendRequestSent(true);
                    } else if (data.message && data.message.includes('Already friends')) {
                        alert('You are already friends with this user!');
                    } else if (data.message && data.message.includes('authentication')) {
                        alert('Authentication issue. Please log in again.');
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('current_auth_token');
                        router.push('/login');
                    } else {
                        alert(`Failed to send request: ${data.message || 'Unknown error'}`);
                    }
                }
            };

            xhr.onerror = function () {
                console.error('Network error when sending friend request');
                alert('Network error occurred. Please try again.');
            };

            xhr.send(JSON.stringify({ userId }));
        } catch (error) {
            console.error('Error sending request:', error);
            alert('An error occurred while sending the request');
        }
    };

    // Add this new function to handle refreshing the friendship check
    const refreshFriendshipStatus = async () => {
        try {
            // Ensure we have a consistent token across navigation contexts
            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('current_auth_token');
                if (token) {
                    // Restore token to localStorage if missing
                    localStorage.setItem('token', token);
                    console.log('✅ Restored token from sessionStorage for friendship check');
                }
            } else {
                // Always ensure it's also in sessionStorage
                sessionStorage.setItem('current_auth_token', token);
            }

            if (!token) {
                console.log('❌ No token available for friendship check');
                return false;
            }

            // Force-check friendship status with the API using the full URL to avoid Next.js params issues
            const apiUrl = `/api/friends/check/${userId}`;
            console.log('🔄 Checking friendship status via:', apiUrl);

            const res = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log('🔄 Friendship status check result:', data);

                // If they are friends but seeing privacy error, set a flag and return true without reloading
                if (data.isFriend) {
                    console.log('✅ Friendship confirmed! We should have access.');
                    // Instead of reloading, save friendship status and return true
                    localStorage.setItem('friendship_' + userId, 'true');
                    return true;
                } else {
                    console.log('❌ Not friends according to the API check');
                    localStorage.setItem('friendship_' + userId, 'false');
                }
            } else {
                console.error('❌ Failed to check friendship status:', await res.text());
            }
            return false;
        } catch (error) {
            console.error('Error checking friendship status:', error);
            return false;
        }
    };

    // Check if the current user has liked a post
    const hasUserLikedPost = (post) => {
        return (
            currentLoggedInUser &&
            currentLoggedInUser._id &&
            post &&
            post.likes &&
            Array.isArray(post.likes) &&
            post.likes.includes(currentLoggedInUser._id)
        );
    };

    // Toggle like on a post
    const handleLikePost = async (postId) => {
        if (isLiking) return;

        setIsLiking(true);
        try {
            // Get the token from localStorage or session storage
            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('current_auth_token');
            }

            const response = await fetch('/api/posts/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ postId })
            });

            if (response.ok) {
                // Update the posts state to reflect the like
                setPosts(currentPosts =>
                    currentPosts.map(post => {
                        if (post._id === postId) {
                            // Check if user already liked the post
                            const userLiked = post.likes?.includes(currentLoggedInUser._id);

                            if (!userLiked) {
                                // Add like
                                return {
                                    ...post,
                                    likes: [...(post.likes || []), currentLoggedInUser._id]
                                };
                            } else {
                                // Remove like
                                return {
                                    ...post,
                                    likes: post.likes.filter(id => id !== currentLoggedInUser._id)
                                };
                            }
                        }
                        return post;
                    })
                );
            } else {
                console.error('Failed to update like status');
            }
        } catch (error) {
            console.error('Error liking post:', error);
        } finally {
            setIsLiking(false);
        }
    };

    // Toggle comment section for a post
    const toggleComments = async (postId) => {
        // Toggle comments visibility
        setCommentsVisible(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));

        // If we're showing comments and haven't loaded them yet, fetch them
        if (!commentsVisible[postId] && !postsWithComments[postId]) {
            await fetchComments(postId);
        }
    };

    // Fetch comments for a post
    const fetchComments = async (postId) => {
        try {
            // Get the token from localStorage or session storage
            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('current_auth_token');
            }

            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await fetch(`/api/posts/comment?postId=${postId}`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                setPostsWithComments(prev => ({
                    ...prev,
                    [postId]: data.comments || []
                }));
            } else {
                console.error('Failed to fetch comments:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    // Add a comment to a post
    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!activeCommentPost || !commentText.trim() || isCommenting) return;

        setIsCommenting(true);
        try {
            // Get the token from localStorage or session storage
            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('current_auth_token');
            }

            const response = await fetch('/api/posts/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    postId: activeCommentPost,
                    content: commentText
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Add the new comment to the comments list
                setPostsWithComments(prev => ({
                    ...prev,
                    [activeCommentPost]: [
                        ...(prev[activeCommentPost] || []),
                        data.comment
                    ]
                }));

                // Update the post's comment count
                setPosts(currentPosts =>
                    currentPosts.map(post => {
                        if (post._id === activeCommentPost) {
                            return {
                                ...post,
                                comments: [...(post.comments || []), data.comment._id]
                            };
                        }
                        return post;
                    })
                );

                // Clear the comment text
                setCommentText('');
            } else {
                console.error('Failed to add comment:', await response.text());
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsCommenting(false);
        }
    };

    // Function to check if a friend request has been sent to this user
    const checkRequestStatus = async () => {
        if (currentLoggedInUser && userId) {
            try {
                // Use token from localStorage or sessionStorage
                let token = localStorage.getItem('token');
                if (!token) {
                    token = sessionStorage.getItem('current_auth_token');
                    if (token) {
                        localStorage.setItem('token', token);
                        console.log('Restored token from sessionStorage');
                    } else {
                        console.log('No token found for friend request status check');
                        return;
                    }
                }

                console.log('Checking friend request status for user:', userId);

                const res = await fetch('/api/friends', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    cache: 'no-store' // Prevent caching
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log('Friend status data:', data);

                    // Check if a request has been sent to this user
                    const normalizedTargetId = String(userId);
                    console.log('Normalized target ID for checking sent request:', normalizedTargetId);

                    // First try to find requests with object IDs
                    let hasSentRequest = data.sent.some(req => {
                        if (req.user && typeof req.user === 'object' && req.user._id) {
                            const reqUserId = String(req.user._id);
                            const matches = reqUserId === normalizedTargetId && req.status === 'pending';
                            console.log(`Comparing object ID ${reqUserId} with target ${normalizedTargetId}: ${matches}`);
                            return matches;
                        }
                        return false;
                    });

                    // If not found, try with string IDs
                    if (!hasSentRequest) {
                        hasSentRequest = data.sent.some(req => {
                            const reqUserId = String(req.user);
                            const matches = reqUserId === normalizedTargetId && req.status === 'pending';
                            console.log(`Comparing string ID ${reqUserId} with target ${normalizedTargetId}: ${matches}`);
                            return matches;
                        });
                    }

                    console.log('Friend request sent status:', hasSentRequest);
                    setFriendRequestSent(hasSentRequest);
                } else {
                    console.error('Failed to fetch friend request status:', await res.text());
                }
            } catch (error) {
                console.error('Error checking request status:', error);
            }
        }
    };

    // Call checkRequestStatus when currentLoggedInUser or userId changes
    useEffect(() => {
        checkRequestStatus();
    }, [currentLoggedInUser, userId, friendStatusKey]);

    // IMPORTANT: Place these checks at the top level, outside of any other conditions
    if (loading) return (
        <div className="profile-wrapper">
            <header className="profile-header">
                <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                <div className="nav-buttons">
                    <NotificationsPanel />
                    <button onClick={() => router.push('/friends')} className="friends-button">
                        Friends & Requests
                    </button>
                    <button onClick={handleBackToProfile} className="back-button">
                        Back to Profile
                    </button>
                    <button onClick={handleBackToSkills} className="back-button">
                        Back to Skills
                    </button>
                </div>
            </header>
            <div className="loading-container">
                <p>Loading profile...</p>
            </div>
        </div>
    );

    // Safety check - if we have a user object but it's empty or incomplete
    if (user && (!user.name || Object.keys(user).length < 3)) {
        console.log('⚠️ User object is incomplete:', user);
        // Try to refresh the data one more time
        return (
            <div className="profile-wrapper">
                <header className="profile-header">
                    <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                    <div className="nav-buttons">
                        <NotificationsPanel />
                        <button onClick={() => router.push('/friends')} className="friends-button">
                            Friends & Requests
                        </button>
                        <button onClick={handleBackToProfile} className="back-button">
                            Back to Profile
                        </button>
                        <button onClick={handleBackToSkills} className="back-button">
                            Back to Skills
                        </button>
                    </div>
                </header>
                <div className="error-message-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Profile Data Issue</h2>
                    <p>There was a problem loading the complete profile data.</p>
                    <div className="action-buttons">
                        <button
                            onClick={() => window.location.reload()}
                            className="retry-button"
                        >
                            Retry Loading
                        </button>
                        <button
                            onClick={handleBackToProfile}
                            className="back-button-large"
                        >
                            Back to My Profile
                        </button>
                    </div>
                </div>
                <style jsx>{`
                    .error-message-container {
                        max-width: 600px;
                        margin: 100px auto;
                        text-align: center;
                        padding: 40px;
                        background-color: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }
                    
                    .error-icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                        color: #f59e0b;
                    }
                    
                    .error-message-container h2 {
                        color: #1f2937;
                        margin-bottom: 16px;
                        font-size: 24px;
                    }
                    
                    .error-message-container p {
                        color: #6b7280;
                        margin-bottom: 8px;
                        font-size: 16px;
                    }
                    
                    .action-buttons {
                        display: flex;
                        justify-content: center;
                        margin-top: 30px;
                        gap: 16px;
                    }
                    
                    .retry-button {
                        background-color: #f59e0b;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s;
                    }
                    
                    .retry-button:hover {
                        background-color: #d97706;
                    }
                    
                    .back-button-large {
                        background-color: #3b82f6;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s;
                    }
                    
                    .back-button-large:hover {
                        background-color: #2563eb;
                    }
                `}</style>
            </div>
        );
    }

    // Special handling for auth error
    if (error === 'auth') {
        return (
            <div className="profile-wrapper">
                <header className="profile-header">
                    <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                    <div className="nav-buttons">
                        <NotificationsPanel />
                        <button onClick={() => router.push('/friends')} className="friends-button">
                            Friends & Requests
                        </button>
                        <button onClick={handleBackToProfile} className="back-button">
                            Back to Profile
                        </button>
                        <button onClick={handleBackToSkills} className="back-button">
                            Back to Skills
                        </button>
                    </div>
                </header>

                <div className="error-message-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Authentication Error</h2>
                    <p>There was an issue with your authentication when trying to view this profile.</p>
                    <div className="action-buttons">
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                router.push('/login');
                            }}
                            className="login-button"
                        >
                            Log In Again
                        </button>
                        <button
                            onClick={handleBackToProfile}
                            className="back-button-large"
                        >
                            Back to My Profile
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    .error-message-container {
                        max-width: 600px;
                        margin: 100px auto;
                        text-align: center;
                        padding: 40px;
                        background-color: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }
                    
                    .error-icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                        color: #e74c3c;
                    }
                    
                    .error-message-container h2 {
                        color: #1f2937;
                        margin-bottom: 16px;
                        font-size: 24px;
                    }
                    
                    .error-message-container p {
                        color: #6b7280;
                        margin-bottom: 8px;
                        font-size: 16px;
                    }
                    
                    .action-buttons {
                        display: flex;
                        justify-content: center;
                        margin-top: 30px;
                        gap: 16px;
                    }
                    
                    .login-button {
                        background-color: #e74c3c;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s;
                    }
                    
                    .login-button:hover {
                        background-color: #c0392b;
                    }
                    
                    .back-button-large {
                        background-color: #3b82f6;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s;
                    }
                    
                    .back-button-large:hover {
                        background-color: #2563eb;
                    }
                `}</style>
            </div>
        );
    }

    // Special handling for privacy error - REMOVE the useEffect here
    if (error === 'privacy') {
        // Check if token exists even if currentLoggedInUser isn't detected
        const hasToken = localStorage.getItem('token') || sessionStorage.getItem('current_auth_token');
        console.log(`Privacy profile view - Token exists: ${!!hasToken}`);

        return (
            <div className="profile-wrapper">
                <header className="profile-header">
                    <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                    <div className="nav-buttons">
                        <NotificationsPanel />
                        <button onClick={() => router.push('/friends')} className="friends-button">
                            Friends & Requests
                        </button>
                        <button onClick={handleBackToProfile} className="back-button">
                            Back to Profile
                        </button>
                        <button onClick={handleBackToSkills} className="back-button">
                            Back to Skills
                        </button>
                    </div>
                </header>

                {/* Show the user's basic information */}
                {user && (
                    <div className="cover-container">
                        <img src={user.coverImage || '/images/cover-placeholder.png'} alt="Cover" className="cover-image" />
                        <img src={user.profileImage || '/images/profile-placeholder.png'} alt="Profile" className="profile-picture" />
                    </div>
                )}

                {/* Show the user's name if available */}
                {user && user.name && (
                    <div className="limited-profile-info">
                        <h2>{user.name}</h2>
                    </div>
                )}

                <div className="private-profile-message">
                    <div className="private-icon">🔒</div>
                    <h2>This Profile is Private</h2>
                    <p>The user has set their profile to private mode.</p>
                    <p>Connect with this user to view their profile and posts.</p>
                    <div className="action-buttons">
                        {/* Always show a direct Add Friend button regardless of login state detection */}
                        <button
                            onClick={() => {
                                console.log('Direct Add Friend clicked for private profile:', userId);
                                sendFriendRequest();
                                // Update UI immediately
                                setFriendRequestSent(true);
                            }}
                            className="direct-add-friend-button"
                            disabled={friendRequestSent}
                        >
                            {friendRequestSent ? 'Friend Request Sent' : 'Add Friend'}
                        </button>

                        {/* Show cancel button only if a request was sent */}
                        {friendRequestSent && (
                            <button
                                onClick={async () => {
                                    if (confirm('Are you sure you want to cancel this friend request?')) {
                                        try {
                                            // Get token from localStorage or sessionStorage
                                            let token = localStorage.getItem('token');
                                            if (!token) {
                                                token = sessionStorage.getItem('current_auth_token');
                                                if (token) localStorage.setItem('token', token);
                                            }

                                            const response = await fetch('/api/friends/direct-cancel', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ targetUserId: userId })
                                            });

                                            if (response.ok) {
                                                alert('Request cancelled successfully');
                                                setFriendRequestSent(false);
                                                setFriendStatusKey(prev => prev + 1);
                                            } else {
                                                alert('Failed to cancel request');
                                            }
                                        } catch (error) {
                                            console.error('Error cancelling request:', error);
                                            alert('An error occurred while cancelling the request');
                                        }
                                    }
                                }}
                                className="cancel-request-button"
                            >
                                Cancel Request
                            </button>
                        )}

                        <button
                            onClick={handleBackToProfile}
                            className="back-button-large"
                        >
                            Back to My Profile
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    .private-profile-message {
                        max-width: 600px;
                        margin: 30px auto;
                        text-align: center;
                        padding: 40px;
                        background-color: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }
                    
                    .auth-message {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 15px;
                    }
                    
                    .auth-message p {
                        margin-bottom: 10px;
                        color: #6b7280;
                    }
                    
                    .private-icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                        color: #6b7280;
                    }
                    
                    .private-profile-message h2 {
                        color: #1f2937;
                        margin-bottom: 16px;
                        font-size: 24px;
                    }
                    
                    .private-profile-message p {
                        color: #6b7280;
                        margin-bottom: 8px;
                        font-size: 16px;
                    }
                    
                    .action-buttons {
                        display: flex;
                        justify-content: center;
                        margin-top: 30px;
                        gap: 16px;
                        flex-wrap: wrap;
                    }
                    
                    .direct-add-friend-button {
                        background-color: #4f46e5;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        margin: 0 10px;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s;
                        min-width: 160px;
                    }
                    
                    .direct-add-friend-button:hover {
                        background-color: #4338ca;
                    }
                    
                    .direct-add-friend-button:disabled {
                        background-color: #9ca3af;
                        cursor: default;
                    }
                    
                    .cancel-request-button {
                        background-color: #ef4444;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        margin: 0;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s;
                        min-width: 160px;
                    }
                    
                    .cancel-request-button:hover {
                        background-color: #dc2626;
                    }
                    
                    .back-button-large {
                        background-color: #3b82f6;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s;
                    }
                    
                    .back-button-large:hover {
                        background-color: #2563eb;
                    }

                    .limited-profile-info {
                        text-align: center;
                        margin: 20px 0;
                    }
                    
                    .limited-profile-info h2 {
                        font-size: 28px;
                        color: #1f2937;
                        margin: 0;
                    }
                `}</style>
            </div>
        );
    }

    // Report functionality moved to the ReportButton and ReportModal components
    
    // Wrap the main rendering in a try-catch to prevent blank pages
    try {
        // Then check other errors
        if (error && error !== 'privacy' && error !== 'auth') return (
            <div className="profile-wrapper">
                <header className="profile-header">
                    <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                    <div className="nav-buttons">
                        <NotificationsPanel />
                        <button onClick={() => router.push('/friends')} className="friends-button">
                            Friends & Requests
                        </button>
                        <button onClick={handleBackToProfile} className="back-button">
                            Back to Profile
                        </button>
                        <button onClick={handleBackToSkills} className="back-button">
                            Back to Skills
                        </button>
                    </div>
                </header>
                <div className="error-message-container">
                    <div className="error-icon">❌</div>
                    <h2>Error Loading Profile</h2>
                    <p>{error}</p>
                    <div className="action-buttons">
                        <button
                            onClick={() => window.location.reload()}
                            className="retry-button"
                        >
                            Retry Loading
                        </button>
                        <button
                            onClick={handleBackToProfile}
                            className="back-button-large"
                        >
                            Back to My Profile
                        </button>
                    </div>
                </div>
            </div>
        );

        if (!user) return (
            <div className="profile-wrapper">
                <header className="profile-header">
                    <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                    <div className="nav-buttons">
                        <NotificationsPanel />
                        <button onClick={() => router.push('/friends')} className="friends-button">
                            Friends & Requests
                        </button>
                        <button onClick={handleBackToProfile} className="back-button">
                            Back to Profile
                        </button>
                        <button onClick={handleBackToSkills} className="back-button">
                            Back to Skills
                        </button>
                    </div>
                </header>
                <div className="loading-container">
                    <p>User not found</p>
                </div>
            </div>
        );

        // Safely extract variables with fallbacks to prevent rendering errors
        const displayName = user?.name || 'User';
        const displayBio = user?.bio || "This user hasn't added a bio yet.";
        const displaySkills = user?.skills?.length > 0 ? user.skills.join(', ') : 'No skills added.';
        const profileImage = (user?.profileImage && user.profileImage.trim()) ? user.profileImage : '/images/profile-placeholder.png';
        const coverImage = (user?.coverImage && user.coverImage.trim()) ? user.coverImage : '/images/cover-placeholder.png';

        // Continue with the rest of your component rendering
        return (
            <div className="profile-wrapper">
                <header className="profile-header">
                    <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                    <div className="nav-buttons">
                        <NotificationsPanel />
                        <button onClick={() => router.push('/friends')} className="friends-button">
                            Friends & Requests
                        </button>
                        <button onClick={handleBackToProfile} className="back-button">
                            Back to Profile
                        </button>
                        <button onClick={handleBackToSkills} className="back-button">
                            Back to Skills
                        </button>
                    </div>
                </header>
                <div className="cover-container">
                    <img src={coverImage} alt="Cover" className="cover-image" />
                    <img src={profileImage} alt="Profile" className="profile-picture" />
                </div>

                {/* Simple Facebook-style profile info with Add Friend button */}
                <div className="fb-style-profile-header">
                    <div className="fb-style-profile-info">
                        <h1>{displayName}</h1>
                    </div>
                    <div className="profile-actions">
                        {userId && userId !== localStorage.getItem('userId') && (
                            <>
                                <button
                                    onClick={() => {
                                        console.log('Add Friend clicked for non-private profile:', userId);
                                        sendFriendRequest();
                                        // Update UI immediately
                                        setFriendRequestSent(true);
                                    }}
                                    className="fb-style-add-friend"
                                    disabled={friendRequestSent}
                                    data-sent={friendRequestSent ? "true" : "false"}
                                >
                                    {friendRequestSent ? 'Friend Request Sent' : 'Add Friend'}
                                </button>
                                
                                <SessionRequestButton 
                                    userId={userId} 
                                    userName={displayName}
                                    userSkills={user?.masteredSkills?.map(skill => skill.name) || []}
                                />
                                
                                {/* Use our client-side ReportButton component with ClientOnly wrapper */}
                                <ClientOnly>
                                    <ReportButton
                                        userId={userId}
                                        userName={displayName}
                                    />
                                </ClientOnly>
                            </>
                        )}
                    </div>
                </div>

                <div className="profile-content view-only">
                    <div className="profile-bio">
                        <h3>About</h3>
                        <p>{displayBio}</p>

                        <div className="profile-skills">
                            <h3>Skills</h3>
                            <p>{displaySkills}</p>
                        </div>
                        
                        {/* Display mastered skills section */}
                        {user?.masteredSkills && user.masteredSkills.length > 0 && (
                            <div className="mastered-skills-section">
                                <h3>Skills I Can Teach</h3>
                                <ul className="mastered-skills-list">
                                    {user.masteredSkills.map((skill, index) => (
                                        <li key={index} className="mastered-skill-item">
                                            <span className="skill-name">{skill.name}</span>
                                            {skill.experienceYears > 0 && (
                                                <span className="experience-years">
                                                    {skill.experienceYears} {skill.experienceYears === 1 ? 'year' : 'years'} experience
                                                </span>
                                            )}
                                            {skill.description && (
                                                <p className="skill-description">{skill.description}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <style jsx>{`
                    .profile-actions {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                    
                    .report-button {
                        background-color: #f87171;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    }
                    
                    .report-button:hover {
                        background-color: #ef4444;
                    }
                    
                    .mastered-skills-section {
                        margin-top: 24px;
                    }
                    
                    .mastered-skills-list {
                        list-style-type: none;
                        padding: 0;
                        margin-top: 10px;
                    }
                    
                    .mastered-skill-item {
                        background-color: #f0f2f5;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 10px;
                    }
                    
                    .skill-name {
                        font-weight: 600;
                        color: #1877f2;
                        display: block;
                        margin-bottom: 4px;
                    }
                    
                    .experience-years {
                        font-size: 13px;
                        color: #65676b;
                        display: inline-block;
                        background-color: #e4e6eb;
                        padding: 2px 8px;
                        border-radius: 12px;
                        margin-top: 4px;
                    }
                    
                    .skill-description {
                        margin-top: 8px;
                        font-size: 14px;
                        color: #1c1e21;
                    }
                `}</style>
                
                {/* Report Modal component is now imported from components/ReportModal.js */}
                
                {/* Report button styles are now in the ReportButton component */}
            </div>
        );
    } catch (error) {
        console.error('Error rendering profile:', error);
        return (
            <div className="profile-wrapper">
                <div className="error-message-container">
                    <div className="error-icon">❌</div>
                    <h2>Rendering Error</h2>
                    <p>There was a problem displaying this profile.</p>
                </div>
            </div>
        );
    }
}