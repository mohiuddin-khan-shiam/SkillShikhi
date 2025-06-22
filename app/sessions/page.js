'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import UserList from '../components/UserList';
import Calendar from '../components/Calendar';
import Link from 'next/link';
import Image from 'next/image';
import './sessions.css';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    preferredDate: '',
    preferredTime: ''
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);
  const [showDateError, setShowDateError] = useState(false);

  // Initialize userId from localStorage only once on component mount
  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      console.log('Auth info on page load:', { 
        userId: storedUserId ? 'exists' : 'missing',
        token: token ? 'exists' : 'missing' 
      });
      
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        console.error('No userId found in localStorage');
        setError('Authentication required. Please log in again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setError('Error initializing session. Please refresh the page.');
      setLoading(false);
    }
  }, []);

  // Fetch sessions when tab changes or userId is set
  useEffect(() => {
    if (userId && activeTab !== 'calendar') {
      fetchSessions();
    }
  }, [activeTab, userId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log(`Fetching ${activeTab} sessions with userId: ${userId}`);
      
      const res = await fetch(`/api/sessions?type=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }
      
      const data = await res.json();
      console.log(`Received ${data.sessions?.length || 0} sessions`);
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError(error.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId, status) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log(`Updating session ${sessionId} to status: ${status}`);
      
      const res = await fetch('/api/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, status })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Status update error response:', errorData);
        throw new Error(errorData.error || `Failed to update session (${res.status})`);
      }
      
      // Refresh sessions list
      fetchSessions();
    } catch (error) {
      console.error('Error updating session status:', error);
      setError(error.message || 'Failed to update session status');
    }
  };

  const rescheduleSession = async (sessionId, newDate) => {
    try {
      setError(null);
      setRescheduleLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log(`Rescheduling session ${sessionId} to ${newDate}`);
      
      const res = await fetch('/api/sessions/reschedule', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, preferredDate: newDate })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Reschedule error response:', errorData);
        throw new Error(errorData.error || `Failed to reschedule session (${res.status})`);
      }
      
      // Refresh sessions list
      fetchSessions();
    } catch (error) {
      console.error('Error rescheduling session:', error);
      setError(error.message || 'Failed to reschedule session');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const cancelSession = async (sessionId) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log(`Cancelling session ${sessionId}`);
      
      const res = await fetch(`/api/sessions/cancel?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Cancel error response:', errorData);
        throw new Error(errorData.error || `Failed to cancel session (${res.status})`);
      }
      
      console.log('Session cancelled successfully');
      
      // Refresh sessions list
      fetchSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      setError(error.message || 'Failed to cancel session');
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Determine if user is the sender or receiver of the session request
  const isRequester = (session) => {
    const fromUserId = session.fromUser?._id || session.fromUser;
    
    console.log('Session details:', {
      sessionId: session._id,
      skill: session.skill,
      fromUser: fromUserId,
      toUser: session.toUser?._id || session.toUser,
      status: session.status,
      userId
    });
    
    return String(fromUserId) === String(userId);
  };

  // Handle rescheduling with date validation
  const handleReschedule = (sessionId) => {
    // Show modal for rescheduling
    setCurrentSessionId(sessionId);
    setRescheduleData({
      preferredDate: '',
      preferredTime: ''
    });
    setRescheduleError(null);
    setShowRescheduleModal(true);
  };

  // Handle reschedule submit
  const handleRescheduleSubmit = () => {
    try {
      // Validate date and time
      if (!rescheduleData.preferredDate) {
        setRescheduleError('Please select a date');
        return;
      }

      // Create date object for validation
      const dateObj = new Date(rescheduleData.preferredDate);
      if (rescheduleData.preferredTime) {
        const [hours, minutes] = rescheduleData.preferredTime.split(':');
        dateObj.setHours(parseInt(hours, 10));
        dateObj.setMinutes(parseInt(minutes, 10));
      }

      // Check if date is in the past
      if (dateObj < new Date()) {
        setShowDateError(true);
        return;
      }

      // Proceed with rescheduling
      rescheduleSession(currentSessionId, dateObj);
      setShowRescheduleModal(false);
    } catch (error) {
      setRescheduleError(error.message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Back to Profile Link */}
      <div className="header">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/profile" className="back-link flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            <span className="text-lg">Back to Profile</span>
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="page-title">Session Management</h1>
        
        {/* Add User List Component with better styling */}
        <div className="user-list-container">
          <UserList />
        </div>
        
        {/* Error message display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative shadow-sm">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}
        
        {/* Tabs - Improved styling */}
        <div className="tabs-container">
          <div className="flex border-b">
            {['upcoming', 'pending', 'completed', 'calendar'].map((tab) => (
              <button 
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'calendar' ? 'Calendar' : tab.charAt(0).toUpperCase() + tab.slice(1) + ' Sessions'}
              </button>
            ))}
          </div>
        
        {/* Content based on active tab */}
        <div className="p-6">
          {activeTab === 'calendar' ? (
            <Calendar />
          ) : loading ? (
            <div className="py-10 text-center">
              <div className="loading-spinner animate-spin rounded-full border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sessions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition-colors"
                onClick={() => router.push('/login')}
              >
                Go to Login
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="empty-state-message">No {activeTab} sessions found</p>
              <p className="empty-state-subtext">You don&apos;t have any {activeTab} sessions yet. When you do, they&apos;ll show up here!</p>
              {activeTab === 'pending' && (
                <button className="find-skills-btn" onClick={() => router.push('/skills')}
                >
                  Find Skills to Learn
                </button>
              )}
            </div>
          ) : (
            <div className="session-grid">
              {sessions.map((session) => {
                // Debug user role in this session
                const userIsRequester = isRequester(session);
                const otherUser = userIsRequester ? session.toUser : session.fromUser;
                
                return (
                <div key={session._id} className="session-card">
                  {/* Session header with color based on status */}
                  <div className={`px-6 py-3 flex justify-between items-center ${
                    session.status === 'pending' ? 'bg-yellow-50' :
                    session.status === 'accepted' ? 'bg-green-50' :
                    session.status === 'completed' ? 'bg-blue-50' :
                    session.status === 'rejected' ? 'bg-red-50' :
                    session.status === 'cancelled' ? 'bg-gray-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center">
                      <div className="user-avatar">
                        <img 
                          src={otherUser?.profileImage || '/images/profile-placeholder.png'} 
                          alt={otherUser?.name || 'User'} 
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{otherUser?.name || 'User'}</h3>
                        <p className="text-sm text-gray-500">
                          {userIsRequester ? 'You requested this session' : 'Requested a session with you'}
                        </p>
                      </div>
                    </div>
                    <span className={`status-badge ${session.status}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Session content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-6 flex-1">
                      <h4 className="session-skill">
                        <span className="skill-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </span>
                        {session.skill}
                      </h4>
                      
                      <div className="session-date-row">
                        <span className="date-icon mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <span>
                          <strong>Date:</strong> {formatDate(session.preferredDate)}
                        </span>
                      </div>
                      
                      {(session.status === 'rejected' || session.status === 'cancelled') && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 text-sm">
                          <span className="info-icon inline-block mr-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          This session was {session.status}
                        </div>
                      )}
                    </div>
                    
                    <div className="session-actions">
                      {/* Show actions based on session status and user role */}
                      {/* Case 1: Pending session where user is recipient - show Accept/Decline */}
                      {session.status === 'pending' && !userIsRequester && (
                        <>
                          <button 
                            className="action-btn accept-btn"
                            onClick={() => {
                              console.log(`Accepting session ${session._id}`);
                              updateSessionStatus(session._id, 'accepted');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept
                          </button>
                          <button 
                            className="action-btn decline-btn"
                            onClick={() => {
                              console.log(`Declining session ${session._id}`);
                              updateSessionStatus(session._id, 'rejected');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Decline
                          </button>
                        </>
                      )}
                      
                      {/* Case 2: Pending session where user is requester - show Cancel */}
                      {session.status === 'pending' && userIsRequester && (
                        <button 
                          className="action-btn cancel-btn"
                          onClick={() => {
                            console.log(`Cancelling session ${session._id}`);
                            cancelSession(session._id);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Request
                        </button>
                      )}
                      
                      {/* Case 3: Accepted session - both users can reschedule, complete, or cancel */}
                      {session.status === 'accepted' && (
                        <div className="session-actions-row">
                          <button 
                            className="action-btn reschedule-btn"
                            onClick={() => {
                              console.log(`Rescheduling session ${session._id}`);
                              handleReschedule(session._id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Reschedule
                          </button>
                          <button 
                            className="action-btn complete-btn"
                            onClick={() => {
                              console.log(`Marking session ${session._id} as complete`);
                              updateSessionStatus(session._id, 'completed');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Complete
                          </button>
                          <button 
                            className="action-btn cancel-btn"
                            onClick={() => {
                              console.log(`Cancelling session ${session._id}`);
                              cancelSession(session._id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Session ID - for debugging */}
                    <p className="text-xs text-gray-400 mt-4 text-right">ID: {session._id}</p>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Reschedule Session</h3>
              <button 
                className="modal-close"
                onClick={() => setShowRescheduleModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleRescheduleSubmit();
              }}>
                <div className="form-group">
                  <label className="form-label">New Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={rescheduleData.preferredDate}
                    onChange={(e) => setRescheduleData({...rescheduleData, preferredDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">New Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={rescheduleData.preferredTime}
                    onChange={(e) => setRescheduleData({...rescheduleData, preferredTime: e.target.value})}
                  />
                </div>
                
                {rescheduleError && (
                  <div className="error-message mb-4">
                    <strong>Error: </strong>
                    <span>{rescheduleError}</span>
                  </div>
                )}
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowRescheduleModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={rescheduleLoading}
                  >
                    {rescheduleLoading ? (
                      <>
                        <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Rescheduling...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Reschedule
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Date Error Modal */}
      {showDateError && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Invalid Date/Time</h3>
              <button className="modal-close" onClick={() => setShowDateError(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{textAlign: 'center', fontWeight: 500, color: '#b91c1c', fontSize: '1.1rem'}}>Can&apos;t go to the past.</p>
              <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
                <button className="btn-primary" onClick={() => setShowDateError(false)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 