'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './UserList.css';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    skill: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [showDateError, setShowDateError] = useState(false);
  const [showSelfRequestError, setShowSelfRequestError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get the current user's ID from localStorage
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.error('Error getting userId from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      searchUsers(searchQuery);
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [searchQuery]);

  const searchUsers = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      setRequestLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Check if user is trying to request a session with themselves
      if (selectedUser.id === currentUserId) {
        setShowSelfRequestError(true);
        setRequestLoading(false);
        return;
      }
      
      // Format date and time
      let formattedDate = null;
      if (requestData.preferredDate) {
        const dateObj = new Date(requestData.preferredDate);
        if (requestData.preferredTime) {
          const [hours, minutes] = requestData.preferredTime.split(':');
          dateObj.setHours(parseInt(hours, 10));
          dateObj.setMinutes(parseInt(minutes, 10));
        }
        // Validation: date/time must be in the future
        if (dateObj < new Date()) {
          setRequestLoading(false);
          setShowDateError(true);
          return;
        }
        formattedDate = dateObj.toISOString();
      }
      
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toUserId: selectedUser.id,
          skill: requestData.skill,
          preferredDate: formattedDate
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send request');
      }
      
      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestForm(false);
        setSelectedUser(null);
        setRequestData({
          skill: '',
          preferredDate: '',
          preferredTime: ''
        });
        setRequestSuccess(false);
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="user-list-container">
      <h2 className="user-list-header">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Find Users for Skill Sessions
      </h2>
      
      <div className="search-container">
        <div className="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search users by name, skills or location..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {error && (
        <div className="error-message">
          <strong>Error: </strong>
          <span>{error}</span>
          <button 
            className="error-close"
            onClick={() => setError(null)}
          >
            <span>&times;</span>
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Searching for users...</p>
        </div>
      ) : searchQuery.trim().length < 2 ? (
        <div className="empty-state start-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="empty-state-title">Find your perfect learning match</p>
          <p className="empty-state-subtitle">Type at least 2 characters to start searching</p>
        </div>
      ) : users.length > 0 ? (
        <div className="user-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-card-content">
                <div className="user-info">
                  <div className="user-avatar">
                    <img 
                      src={user.profileImage || '/images/profile-placeholder.png'}
                      alt={user.name}
                    />
                  </div>
                  <div>
                    <h3 className="user-name">{user.name}</h3>
                    {user.location && !user.isPrivate && (
                      <p className="user-location">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {user.location}
                      </p>
                    )}
                  </div>
                </div>
                
                {!user.isPrivate && user.skills && user.skills.length > 0 && (
                  <div className="skills-section">
                    <p className="skills-title">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Skills:
                    </p>
                    <div className="skills-container">
                      {user.skills.map(skill => (
                        <span key={skill} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="card-actions">
                  <button
                    className="request-btn"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowRequestForm(true);
                    }}
                    disabled={user.id === currentUserId}
                    title={user.id === currentUserId ? "You can't request a session with yourself" : "Request a skill session"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Request Session
                  </button>
                  
                  <button
                    className="profile-btn"
                    onClick={() => router.push(`/user/${user.id}`)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p className="empty-state-title">No users found matching &quot;{searchQuery}&quot;</p>
          <p className="empty-state-subtitle">Try another search term or broaden your query</p>
        </div>
      )}
      
      {/* Session Request Modal */}
      {showRequestForm && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Request Session with {selectedUser.name}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowRequestForm(false);
                  setSelectedUser(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              {requestSuccess ? (
                <div className="success-message">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="success-title">Request sent successfully!</p>
                  <p className="success-subtitle">You&apos;ll be notified when {selectedUser.name} responds</p>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSendRequest();
                }}>
                  <div className="form-group">
                    <label className="form-label">What skill do you want to learn?</label>
                    <input
                      type="text"
                      placeholder="Enter skill name"
                      className="form-input"
                      value={requestData.skill}
                      onChange={(e) => setRequestData({...requestData, skill: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Preferred Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={requestData.preferredDate}
                      onChange={(e) => setRequestData({...requestData, preferredDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Preferred Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={requestData.preferredTime}
                      onChange={(e) => setRequestData({...requestData, preferredTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setShowRequestForm(false);
                        setSelectedUser(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={requestLoading}
                    >
                      {requestLoading ? (
                        <>
                          <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
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
      
      {/* Self Request Error Modal */}
      {showSelfRequestError && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Invalid Request</h3>
              <button className="modal-close" onClick={() => setShowSelfRequestError(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{textAlign: 'center', fontWeight: 500, color: '#b91c1c', fontSize: '1.1rem'}}>You can&apos;t request a session with yourself.</p>
              <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
                <button className="btn-primary" onClick={() => setShowSelfRequestError(false)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 