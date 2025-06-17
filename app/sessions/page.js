'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import UserList from '../components/UserList';
import Calendar from '../components/Calendar';
import Link from 'next/link';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      setError(error.message || 'Failed to fetch sessions');
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
      
      console.log(`Updating session ${sessionId} to ${status}`);
      
      const res = await fetch(`/api/sessions/status?sessionId=${sessionId}&status=${status}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Status update error response:', errorData);
        throw new Error(errorData.error || `Failed to update session status (${res.status})`);
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
      setRescheduleLoading(true);
      setRescheduleError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log(`Rescheduling session ${sessionId} to ${newDate}`);
      
      const res = await fetch(`/api/sessions/reschedule`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          newDate: newDate.toISOString()
        })
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
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Determine if user is the sender or receiver of the session request
  const isRequester = (session) => {
    try {
      if (!userId) return false;
      
      // If the user ID matches the fromUser._id, they are the requester
      const isRequestor = session.fromUser?._id === userId;
      console.log(`Session ${session._id}: User is ${isRequestor ? 'requester' : 'recipient'}`);
      return isRequestor;
    } catch (error) {
      console.error('Error determining user role:', error);
      return false;
    }
  };

  // Handle rescheduling with date validation
  const handleReschedule = (sessionId) => {
    setCurrentSessionId(sessionId);
    setRescheduleData({
      preferredDate: '',
      preferredTime: ''
    });
    setShowDateError(false);
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
    <div className="bg-light min-vh-100">
      {/* Header with Back to Profile Link */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
        <div className="container-fluid py-2">
          <div className="d-flex align-items-center">
            <a href="/profile" className="btn btn-link text-secondary d-flex align-items-center">
              <i className="bi bi-arrow-left me-2"></i> Back to Profile
            </a>
            <h1 className="h4 fw-bold mb-0 ms-3">Your Sessions</h1>
          </div>
          <button 
            onClick={() => router.push('/skills')}
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-lg me-2"></i> New Session
          </button>
        </div>
      </nav>
      <div className="container py-5">
        {/* Error notification */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <strong>Error:</strong> {error}
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setError(null)}></button>
          </div>
        )}
        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          {['upcoming', 'pending', 'completed', 'calendar'].map((tab) => (
            <li className="nav-item" key={tab} role="presentation">
              <button
                className={`nav-link${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                type="button"
                role="tab"
              >
                {tab === 'calendar' ? 'Calendar' : tab.charAt(0).toUpperCase() + tab.slice(1) + ' Sessions'}
              </button>
            </li>
          ))}
        </ul>
        <div className="card shadow-sm p-4">
          {/* Content based on active tab */}
          {activeTab === 'calendar' ? (
            <Calendar />
          ) : loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p className="lead text-secondary">Loading your sessions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <i className="bi bi-x-circle display-4 text-danger mb-3"></i>
              <p className="text-danger lead mb-4">{error}</p>
              <a href="/login" className="btn btn-primary btn-lg">Go to Login</a>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x display-4 text-secondary mb-3"></i>
              <h3 className="fw-bold mb-2">No {activeTab} sessions found</h3>
              <p className="text-secondary mb-4">You don't have any {activeTab} sessions yet. When you do, they'll show up here!</p>
              {activeTab === 'pending' && (
                <a href="/skills" className="btn btn-primary btn-lg">Find Skills to Learn</a>
              )}
            </div>
          ) : (
            <div className="row g-4">
              {sessions.map((session) => {
                const userIsRequester = isRequester(session);
                const otherUser = userIsRequester ? session.toUser : session.fromUser;
                return (
                  <div className="col-12 col-md-6 col-lg-4" key={session._id}>
                    <div className="card h-100 shadow-sm border-0">
                      <div className={`card-header d-flex justify-content-between align-items-center ${
                        session.status === 'pending' ? 'bg-warning bg-opacity-10' :
                        session.status === 'accepted' ? 'bg-success bg-opacity-10' :
                        session.status === 'completed' ? 'bg-primary bg-opacity-10' :
                        session.status === 'rejected' ? 'bg-danger bg-opacity-10' :
                        session.status === 'cancelled' ? 'bg-light' : 'bg-light'
                      }`}>
                        <div className="d-flex align-items-center">
                          <img
                            src={otherUser?.profileImage || '/images/profile-placeholder.png'}
                            alt={otherUser?.name || 'User'}
                            className="rounded-circle border me-3"
                            style={{width: '48px', height: '48px', objectFit: 'cover'}}
                          />
                          <div>
                            <h5 className="mb-0 fw-semibold">{otherUser?.name || 'User'}</h5>
                            <div className="text-secondary small">
                              {userIsRequester ? 'You requested this session' : 'Requested a session with you'}
                            </div>
                          </div>
                        </div>
                        <span className={`badge rounded-pill ${
                          session.status === 'pending' ? 'bg-warning text-dark' :
                          session.status === 'accepted' ? 'bg-success' :
                          session.status === 'completed' ? 'bg-primary' :
                          session.status === 'rejected' ? 'bg-danger' :
                          'bg-secondary'
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="fw-semibold text-secondary small mb-1">Skill</div>
                          <div className="fw-bold">{session.skill?.name || 'Unknown Skill'}</div>
                        </div>
                        <div className="mb-3">
                          <div className="fw-semibold text-secondary small mb-1">Date & Time</div>
                          <div>{formatDate(session.scheduledFor)}</div>
                        </div>
                        <div className="mb-3">
                          <div className="fw-semibold text-secondary small mb-1">Message</div>
                          <div className="text-secondary small">{session.message || 'No message provided'}</div>
                        </div>
                        {/* Session actions based on status */}
                        {session.status === 'pending' && !userIsRequester && (
                          <div className="d-flex gap-2 flex-wrap">
                            <button className="btn btn-success btn-sm d-flex align-items-center" onClick={() => updateSessionStatus(session._id, 'accepted')}>
                              <i className="bi bi-check-circle me-2"></i> Accept
                            </button>
                            <button className="btn btn-danger btn-sm d-flex align-items-center" onClick={() => updateSessionStatus(session._id, 'rejected')}>
                              <i className="bi bi-x-circle me-2"></i> Decline
                            </button>
                          </div>
                        )}
                        {session.status === 'pending' && userIsRequester && (
                          <button className="btn btn-secondary btn-sm d-flex align-items-center" onClick={() => cancelSession(session._id)}>
                            <i className="bi bi-x-circle me-2"></i> Cancel Request
                          </button>
                        )}
                        {session.status === 'accepted' && (
                          <div className="d-flex gap-2 flex-wrap">
                            <button className="btn btn-primary btn-sm d-flex align-items-center" onClick={() => handleReschedule(session._id)}>
                              <i className="bi bi-calendar-event me-2"></i> Reschedule
                            </button>
                            <button className="btn btn-success btn-sm d-flex align-items-center" onClick={() => updateSessionStatus(session._id, 'completed')}>
                              <i className="bi bi-check2-circle me-2"></i> Mark as Complete
                            </button>
                            <button className="btn btn-secondary btn-sm d-flex align-items-center" onClick={() => cancelSession(session._id)}>
                              <i className="bi bi-x-circle me-2"></i> Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reschedule Session</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowRescheduleModal(false)}></button>
              </div>
              <div className="modal-body">
                {rescheduleError && (
                  <div className="alert alert-danger" role="alert">{rescheduleError}</div>
                )}
                <div className="mb-3">
                  <label htmlFor="preferredDate" className="form-label">Preferred Date</label>
                  <input
                    type="date"
                    id="preferredDate"
                    className="form-control"
                    value={rescheduleData.preferredDate}
                    onChange={(e) => {
                      setRescheduleData({...rescheduleData, preferredDate: e.target.value});
                      setShowDateError(false);
                    }}
                  />
                  {showDateError && (
                    <div className="form-text text-danger">Please select a future date</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="preferredTime" className="form-label">Preferred Time (optional)</label>
                  <input
                    type="time"
                    id="preferredTime"
                    className="form-control"
                    value={rescheduleData.preferredTime}
                    onChange={(e) => setRescheduleData({...rescheduleData, preferredTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRescheduleModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleRescheduleSubmit} disabled={rescheduleLoading}>
                  {rescheduleLoading ? 'Submitting...' : 'Reschedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
