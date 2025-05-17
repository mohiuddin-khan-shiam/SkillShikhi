'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const SessionsTab = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filter, setFilter] = useState('active'); // 'active', 'all', 'terminated'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Session status options
  const sessionStatusOptions = {
    active: 'Active',
    terminated: 'Terminated',
    all: 'All'
  };
  
  // Fetch sessions from API
  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Always use adminToken for admin actions
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Admin authentication token not found. Please log in again.');
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (filter === 'active') {
        params.append('isActive', 'true');
      } else if (filter === 'terminated') {
        params.append('isActive', 'false');
      }
      
      const response = await fetch(`/api/admin/sessions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch sessions');
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Terminate session
  const terminateSession = async (sessionId, reason = 'Admin terminated') => {
    try {
      // Always use adminToken for admin actions
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Admin authentication token not found. Please log in again.');
      }
      
      const response = await fetch(`/api/admin/sessions/${sessionId}/terminate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }
      
      // Refresh sessions
      fetchSessions();
      
      // Close details panel if the terminated session was selected
      if (selectedSession && selectedSession._id === sessionId) {
        setSelectedSession(null);
      }
      
      alert('Session terminated successfully');
    } catch (error) {
      console.error('Error terminating session:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  // Format duration
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Fetch sessions on mount and when filter/page changes
  useEffect(() => {
    fetchSessions();
  }, [page, filter]);
  
  // Set up auto-refresh for active sessions
  useEffect(() => {
    // Only auto-refresh if viewing active sessions
    let intervalId;
    if (filter === 'active') {
      intervalId = setInterval(() => {
        console.log('Auto-refreshing active sessions...');
        fetchSessions();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [filter]);
  
  // Render loading state
  if (loading && !sessions.length) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading active sessions...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={fetchSessions} className="admin-button primary-button">
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="sessions-tab">
      <div className="tab-header">
        <h2>Live Session Monitoring</h2>
        <div className="filter-controls">
          <label htmlFor="sessionFilter">Filter:</label>
          <select
            id="sessionFilter"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1); // Reset to first page when filter changes
            }}
            className="filter-select"
          >
            <option value="active">Active Sessions</option>
            <option value="terminated">Terminated Sessions</option>
            <option value="all">All Sessions</option>
          </select>
          <button onClick={fetchSessions} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>
      
      {sessions.length === 0 ? (
        <div className="admin-empty-state">
          <p>No sessions found matching the current filter.</p>
          <p className="admin-help-text">Live sessions show user activity on the platform in real-time. If you're seeing this message, it may be because:</p>
          <ul className="admin-help-list">
            <li>There are currently no {filter === 'all' ? '' : filter} sessions on the platform</li>
            <li>The session tracking system needs to be configured</li>
          </ul>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="admin-button primary-button">
              View All Sessions
            </button>
          )}
        </div>
      ) : (
        <div className="sessions-container">
          <div className="sessions-list">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Started</th>
                  <th>Duration</th>
                  <th>Last Activity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session._id} className={!session.isActive ? 'terminated-session' : ''}>
                    <td className="user-cell">
                      {session.userId ? (
                        <>
                          <img 
                            src={session.userId.profileImage || '/images/profile-placeholder.png'} 
                            alt={session.userId.name} 
                            className="user-avatar-small" 
                          />
                          <span>{session.userId.name}</span>
                        </>
                      ) : (
                        <span>Unknown User</span>
                      )}
                    </td>
                    <td>{session.ipAddress || 'Unknown'}</td>
                    <td>{formatDate(session.startTime)}</td>
                    <td>{formatDuration(session.durationMinutes)}</td>
                    <td>{formatDate(session.lastActivity)}</td>
                    <td>
                      <span className={`status-badge ${session.isActive ? 'active' : 'terminated'}`}>
                        {session.isActive ? 'Active' : 'Terminated'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {session.isActive && (
                        <button 
                          onClick={() => terminateSession(session._id)} 
                          className="terminate-button"
                        >
                          Terminate
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedSession(session)} 
                        className="view-button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                  disabled={page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={page === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          
          {/* Session Details Panel */}
          {selectedSession && (
            <div className="session-details">
              <div className="details-header">
                <h3>Session Details</h3>
                <button 
                  onClick={() => setSelectedSession(null)} 
                  className="close-button"
                >
                  &times;
                </button>
              </div>
              
              <div className="details-content">
                <div className="user-profile-header">
                  {selectedSession.userId && (
                    <>
                      <img 
                        src={selectedSession.userId.profileImage || '/images/profile-placeholder.png'} 
                        alt={selectedSession.userId.name} 
                        className="user-avatar" 
                      />
                      <div className="user-info">
                        <h4>{selectedSession.userId.name}</h4>
                        <p>{selectedSession.userId.email}</p>
                        <span className={`status-badge ${selectedSession.isActive ? 'active' : 'terminated'}`}>
                          {selectedSession.isActive ? 'Active Session' : 'Terminated Session'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Session ID:</span>
                  <p className="detail-value">{selectedSession._id}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">IP Address:</span>
                  <p className="detail-value">{selectedSession.ipAddress || 'Unknown'}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">User Agent:</span>
                  <p className="detail-value detail-text">{selectedSession.userAgent || 'Unknown'}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Device:</span>
                  <p className="detail-value">{selectedSession.device || 'Unknown'}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <p className="detail-value">{selectedSession.location || 'Unknown'}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Start Time:</span>
                  <p className="detail-value">{formatDate(selectedSession.startTime)}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Last Activity:</span>
                  <p className="detail-value">{formatDate(selectedSession.lastActivity)}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <p className="detail-value">{formatDuration(selectedSession.durationMinutes)}</p>
                </div>
                
                {!selectedSession.isActive && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">End Time:</span>
                      <p className="detail-value">{formatDate(selectedSession.endTime)}</p>
                    </div>
                    
                    {selectedSession.terminationReason && (
                      <div className="detail-item">
                        <span className="detail-label">Termination Reason:</span>
                        <p className="detail-value">{selectedSession.terminationReason}</p>
                      </div>
                    )}
                  </>
                )}
                
                {selectedSession.flags && selectedSession.flags.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Flags:</span>
                    <ul className="flags-list">
                      {selectedSession.flags.map((flag, index) => (
                        <li key={index} className="flag-item">{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {selectedSession.isActive && (
                <div className="action-buttons">
                  <button 
                    onClick={() => {
                      const reason = prompt('Enter reason for termination:', 'Admin terminated');
                      if (reason !== null) {
                        terminateSession(selectedSession._id, reason);
                      }
                    }} 
                    className="action-button terminate-button"
                  >
                    Terminate Session
                  </button>
                  
                  <button 
                    onClick={() => window.open(`/user/${selectedSession.userId._id}`, '_blank')} 
                    className="action-button view-profile-button"
                  >
                    View User Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .sessions-tab {
          width: 100%;
        }
        
        .sessions-container {
          display: flex;
          gap: 20px;
        }
        
        .sessions-list {
          flex: 1;
          overflow-x: auto;
        }
        
        .session-details {
          width: 350px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .terminated-session {
          opacity: 0.7;
        }
        
        .terminate-button {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .terminate-button:hover {
          background-color: #dc2626;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 10px;
        }
        
        .pagination-button {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-info {
          font-size: 14px;
          color: #6b7280;
        }
        
        .flags-list {
          margin: 0;
          padding-left: 20px;
        }
        
        .flag-item {
          margin-bottom: 4px;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default SessionsTab;
