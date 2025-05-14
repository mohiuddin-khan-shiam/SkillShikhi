'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const BannedUsersTab = () => {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'banDate',
    sortOrder: 'desc'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch banned users from API
  const fetchBannedUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('status', 'banned'); // Only get banned users
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
      
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch banned users');
      }
      
      const data = await response.json();
      setBannedUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching banned users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle user action (unban)
  const handleUnban = async (userId) => {
    try {
      if (!confirm('Are you sure you want to unban this user?')) {
        return;
      }
      
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}) // Add empty body to ensure proper JSON request
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to unban user');
      }
      
      // Refresh banned users list
      fetchBannedUsers();
      
      // Close details panel if the unbanned user was selected
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
      
      alert('User unbanned successfully');
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filter changes
  };
  
  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchBannedUsers();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      sortBy: 'banDate',
      sortOrder: 'desc'
    });
    setPage(1);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };
  
  // Load banned users on mount and when filters/page changes
  useEffect(() => {
    fetchBannedUsers();
  }, [page, filters.search, filters.sortBy, filters.sortOrder]);
  
  // Render loading state
  if (loading && !bannedUsers.length) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading banned users...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={fetchBannedUsers} className="admin-button primary-button">
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="banned-users-tab">
      <div className="tab-header">
        <h2>Banned Users</h2>
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="search">Search:</label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Name, email, or username"
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="sortBy">Sort By:</label>
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="banDate">Ban Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="sortOrder">Order:</label>
              <select
                id="sortOrder"
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            
            <div className="filter-buttons">
              <button onClick={applyFilters} className="apply-button">
                Apply Filters
              </button>
              <button onClick={resetFilters} className="reset-button">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {bannedUsers.length === 0 ? (
        <div className="admin-empty-state">
          <p>No banned users found.</p>
          <p className="admin-help-text">When users are banned, they will appear in this list. If you're seeing this message, it may be because:</p>
          <ul className="admin-help-list">
            <li>There are currently no banned users on the platform</li>
            <li>The search filter is too restrictive</li>
          </ul>
          {filters.search && (
            <button onClick={resetFilters} className="admin-button primary-button">
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="banned-users-container">
          <div className="banned-users-list">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Ban Date</th>
                  <th>Ban Reason</th>
                  <th>Banned By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bannedUsers.map(user => (
                  <tr key={user._id}>
                    <td className="user-cell">
                      <img 
                        src={user.profileImage || '/images/profile-placeholder.png'} 
                        alt={user.name} 
                        className="user-avatar-small" 
                      />
                      <span>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.banInfo?.date || user.updatedAt)}</td>
                    <td className="reason-cell">{user.banInfo?.reason || 'No reason provided'}</td>
                    <td>{user.banInfo?.adminName || 'System'}</td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => setSelectedUser(user)} 
                        className="view-button"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleUnban(user._id)} 
                        className="unban-button"
                      >
                        Unban
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
          
          {/* User Details Modal */}
          {selectedUser && (
            <div className="user-details-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Banned User Details</h3>
                  <button 
                    onClick={() => setSelectedUser(null)} 
                    className="close-button"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="user-profile-section">
                    <div className="user-profile">
                      <img 
                        src={selectedUser.profileImage || '/images/profile-placeholder.png'} 
                        alt={selectedUser.name} 
                        className="user-avatar-large" 
                      />
                      <div className="user-info">
                        <h4>{selectedUser.name}</h4>
                        <p className="user-email">{selectedUser.email}</p>
                        <div className="user-badges">
                          <span className={`role-badge ${selectedUser.role}`}>
                            {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                          </span>
                          <span className="status-badge banned">
                            Banned
                          </span>
                        </div>
                        <button 
                          onClick={() => window.open(`/user/${selectedUser._id}`, '_blank')} 
                          className="view-profile-button"
                        >
                          View Public Profile
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ban-details-section">
                    <h4>Ban Information</h4>
                    <div className="ban-info">
                      <div className="detail-item">
                        <span className="detail-label">Ban Date:</span>
                        <p className="detail-value">{formatDate(selectedUser.banInfo?.date || selectedUser.updatedAt)}</p>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Ban Reason:</span>
                        <p className="detail-value">{selectedUser.banInfo?.reason || 'No reason provided'}</p>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Banned By:</span>
                        <p className="detail-value">{selectedUser.banInfo?.adminName || 'System'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-details-section">
                    <h4>User Information</h4>
                    <div className="detail-columns">
                      <div className="detail-column">
                        <div className="detail-item">
                          <span className="detail-label">User ID:</span>
                          <p className="detail-value">{selectedUser._id}</p>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Joined:</span>
                          <p className="detail-value">{formatDate(selectedUser.createdAt)}</p>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Last Login:</span>
                          <p className="detail-value">{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
                        </div>
                      </div>
                      
                      <div className="detail-column">
                        <div className="detail-item">
                          <span className="detail-label">Username:</span>
                          <p className="detail-value">{selectedUser.username || 'Not set'}</p>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Phone:</span>
                          <p className="detail-value">{selectedUser.phone || 'Not provided'}</p>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <p className="detail-value">{selectedUser.location || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="activity-section">
                    <h4>Activity Before Ban</h4>
                    <div className="activity-stats">
                      <div className="stat-item">
                        <span className="stat-value">{selectedUser.stats?.posts || 0}</span>
                        <span className="stat-label">Posts</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{selectedUser.stats?.comments || 0}</span>
                        <span className="stat-label">Comments</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{selectedUser.stats?.courses || 0}</span>
                        <span className="stat-label">Courses</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{selectedUser.stats?.reports || 0}</span>
                        <span className="stat-label">Reports</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="admin-actions">
                    <h4>Admin Actions</h4>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleUnban(selectedUser._id)} 
                        className="unban-button"
                      >
                        Unban User
                      </button>
                      
                      <button 
                        onClick={() => window.location.href = `/admin/logs?userId=${selectedUser._id}`} 
                        className="view-logs-button"
                      >
                        View Activity Logs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .banned-users-tab {
          width: 100%;
        }
        
        .filter-section {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .filter-row {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 200px;
        }
        
        .filter-select, .filter-input {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .filter-buttons {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        
        .apply-button, .reset-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .apply-button {
          background-color: #3b82f6;
          color: white;
        }
        
        .reset-button {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
        }
        
        .reason-cell {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .role-badge, .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .role-badge.admin {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .role-badge.instructor {
          background-color: #e0e7ff;
          color: #4338ca;
        }
        
        .role-badge.user {
          background-color: #f3f4f6;
          color: #4b5563;
        }
        
        .status-badge.banned {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .user-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        
        .user-profile-section, .ban-details-section, .user-details-section, .activity-section, .admin-actions {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .user-profile {
          display: flex;
          gap: 20px;
        }
        
        .user-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .user-avatar-small {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 8px;
        }
        
        .user-info h4 {
          margin: 0 0 5px 0;
          font-size: 20px;
        }
        
        .user-email {
          margin: 0 0 10px 0;
          color: #6b7280;
        }
        
        .user-badges {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .ban-info {
          background-color: #fee2e2;
          padding: 15px;
          border-radius: 6px;
          margin-top: 10px;
        }
        
        .detail-columns {
          display: flex;
          gap: 30px;
          margin-bottom: 15px;
        }
        
        .detail-column {
          flex: 1;
        }
        
        .detail-item {
          margin-bottom: 15px;
        }
        
        .detail-label {
          font-weight: 600;
          color: #4b5563;
          display: block;
          margin-bottom: 5px;
        }
        
        .detail-value {
          margin: 0;
        }
        
        .activity-stats {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }
        
        .stat-item {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          flex: 1;
          text-align: center;
        }
        
        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #6b7280;
          font-size: 14px;
        }
        
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .unban-button, .view-logs-button, .view-profile-button, .view-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .unban-button {
          background-color: #10b981;
          color: white;
        }
        
        .view-logs-button {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #4b5563;
        }
        
        .view-profile-button {
          background-color: #3b82f6;
          color: white;
        }
        
        .view-button {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #4b5563;
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default BannedUsersTab;
