'use client';

import { useState, useEffect } from 'react';
import UserSearch from './UserSearch';
import UserCard from './UserCard';
import SessionRequestForm from './SessionRequestForm';
import { searchUsers, sendSessionRequest } from './UserService';
import './UserList.css';

/**
 * Main component for displaying a list of users with search functionality
 */
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [showSelfRequestError, setShowSelfRequestError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID on component mount
  useEffect(() => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.error('Error getting userId from localStorage:', error);
    }
  }, []);

  // Handle search query changes
  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const result = await searchUsers(query);
    
    if (result.success) {
      setUsers(result.users);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Handle opening session request form
  const handleRequestSession = (user) => {
    // Check if user is trying to request a session with themselves
    if (user.id === currentUserId) {
      setShowSelfRequestError(true);
      setTimeout(() => setShowSelfRequestError(false), 3000);
      return;
    }
    
    setSelectedUser(user);
  };

  // Handle session request submission
  const handleSubmitRequest = async (formData) => {
    setRequestLoading(true);
    setError(null);
    
    const result = await sendSessionRequest(formData);
    
    if (result.success) {
      setRequestSuccess(true);
      setTimeout(() => {
        setSelectedUser(null);
        setRequestSuccess(false);
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setRequestLoading(false);
  };

  // Render empty state based on search status
  const renderEmptyState = () => {
    return (
      <div className="empty-state start-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="empty-state-title">Find your perfect learning match</p>
        <p className="empty-state-subtitle">Type at least 2 characters to start searching</p>
      </div>
    );
  };

  return (
    <div className="user-list-container">
      <h2 className="user-list-header">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Find Users for Skill Sessions
      </h2>
      
      <UserSearch onSearch={handleSearch} />
      
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

      {showSelfRequestError && (
        <div className="error-message">
          <strong>Error: </strong>
          <span>You cannot request a session with yourself</span>
          <button 
            className="error-close"
            onClick={() => setShowSelfRequestError(false)}
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
      ) : users.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="user-grid">
          {users.map(user => (
            <UserCard 
              key={user.id} 
              user={user} 
              onRequestSession={handleRequestSession} 
            />
          ))}
        </div>
      )}
      
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <SessionRequestForm
              user={selectedUser}
              onCancel={() => setSelectedUser(null)}
              onSubmit={handleSubmitRequest}
              loading={requestLoading}
              success={requestSuccess}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList; 