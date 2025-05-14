'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Fetch users from API
  const fetchUsers = async (forceRefresh = false) => {
    try {
      setLoading(true);
      // Prioritize adminToken over regular token for admin operations
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (filters.role) {
        params.append('role', filters.role);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
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
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle user action (ban, unban, etc.)
  const handleUserAction = async (userId, action, reason = '') => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Check if admin is trying to ban themselves
      if (action === 'ban') {
        // Decode the token to get admin ID
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        const adminId = decodedToken.userId;
        
        if (adminId === userId) {
          alert('Admin cannot ban their own account.');
          return;
        }
      }
      
      // Prepare the request body based on the action
      let requestBody = {};
      
      if (action === 'ban') {
        requestBody = { reason };
      }
      
      console.log(`Sending ${action} request for user ${userId}:`, requestBody);
      
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error(`Error response from server when trying to ${action} user:`, errorData);
        throw new Error(errorData.message || `Failed to ${action} user`);
      }
      
      // Get the updated user data from the response
      const responseData = await response.json();
      console.log('User action response:', responseData);
      
      // Show success message
      alert(responseData.message || `User ${action}ed successfully`);
      
      // Force refresh the users list to reflect the changes
      await fetchUsers(true);
      
      // Update selected user if it was the actioned user
      if (selectedUser && selectedUser._id === userId) {
        // Fetch the updated user details
        const userResponse = await fetch(`/api/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setSelectedUser(userData.user);
        } else {
          // If we can't fetch the updated user, just close the details panel
          setSelectedUser(null);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
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
  };
  
  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchUsers(true);
  };

  // Handle search input
  const handleSearchInput = (e) => {
    const { value } = e.target;
    setFilters(prev => ({
      ...prev,
      search: value
    }));
    // Auto-search after a short delay
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      setPage(1);
      fetchUsers(true);
    }, 500));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      role: '',
      status: 'all',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPage(1);
    fetchUsers(true);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Load users on mount and when filters/page changes
  useEffect(() => {
    fetchUsers();
  }, [page]);
  
  // Render loading state
  if (loading && !users.length) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }
  
  // Render error state
  if (error && !users.length) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={() => fetchUsers(true)} className="admin-button primary-button">
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="users-tab">
      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="role">Role</label>
            <select 
              id="role" 
              name="role" 
              value={filters.role} 
              onChange={handleFilterChange}
              className="admin-form-select"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="user">User</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select 
              id="status" 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
              className="admin-form-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          
          <div className="filter-group search-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleSearchInput}
              placeholder="Search by name, email, or ID"
              className="filter-input"
            />
          </div>
          
          <div className="filter-actions">
            <button onClick={applyFilters} className="admin-button primary-button">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="admin-button secondary-button">
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {users.length === 0 ? (
        <div className="admin-empty-state">
          <p>No users found matching the current filters.</p>
        </div>
      ) : (
        <div className="admin-data-container">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className={user.isBanned ? 'banned-user' : ''}>
                    <td className="user-cell">
                      <img 
                        src={user.profileImage || '/images/profile-placeholder.png'} 
                        alt={user.name} 
                        className="user-avatar-small" 
                      />
                      <span>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role || 'user'}`}>
                        {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                    <td>
                      <span className={`status-badge ${user.isBanned ? 'banned' : user.isActive ? 'active' : 'inactive'}`}>
                        {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => setSelectedUser(user)} 
                        className="admin-button secondary-button small-button"
                      >
                        View
                      </button>
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUserAction(user._id, 'unban')}
                          className="admin-button success-button small-button"
                          title="Unban User"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const reason = prompt(`Enter reason for banning ${user.name}:`);
                            if (reason) {
                              handleUserAction(user._id, 'ban', reason);
                            }
                          }}
                          className="admin-button danger-button small-button"
                          title="Ban User"
                        >
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <button 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                  disabled={page === 1}
                  className="admin-button secondary-button small-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={page === totalPages}
                  className="admin-button secondary-button small-button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          
          {/* User Details Modal */}
          {selectedUser && (
            <div className="admin-modal-backdrop">
              <div className="admin-modal">
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">User Details</h3>
                  <button 
                    onClick={() => setSelectedUser(null)} 
                    className="admin-modal-close"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="admin-modal-body">
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
                          <span className={`role-badge ${selectedUser.role || 'user'}`}>
                            {selectedUser.role ? (selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)) : 'User'}
                          </span>
                          <span className={`status-badge ${selectedUser.isBanned ? 'banned' : selectedUser.isActive ? 'active' : 'inactive'}`}>
                            {selectedUser.isBanned ? 'Banned' : selectedUser.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <button 
                          onClick={() => window.open(`/user/${selectedUser._id}`, '_blank')} 
                          className="admin-button secondary-button small-button"
                        >
                          View Public Profile
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-details-section">
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
                    
                    {selectedUser.bio && (
                      <div className="detail-item bio-item">
                        <span className="detail-label">Bio:</span>
                        <p className="detail-value bio-text">{selectedUser.bio}</p>
                      </div>
                    )}
                    
                    {selectedUser.isBanned && (
                      <div className="detail-item ban-info">
                        <span className="detail-label">Ban Information:</span>
                        <div className="ban-details">
                          <p><strong>Banned on:</strong> {formatDate(selectedUser.banInfo?.date)}</p>
                          <p><strong>Reason:</strong> {selectedUser.banInfo?.reason || 'No reason provided'}</p>
                          <p><strong>Banned by:</strong> {selectedUser.banInfo?.adminName || 'System'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="activity-section">
                    <h4>Activity Summary</h4>
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
                      {!selectedUser.isBanned ? (
                        <button 
                          onClick={() => {
                            const reason = prompt(`Enter reason for banning ${selectedUser.name}:`);
                            if (reason) {
                              handleUserAction(selectedUser._id, 'ban', reason);
                            }
                          }} 
                          className="admin-button danger-button"
                        >
                          Ban User
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to unban ${selectedUser.name}?`)) {
                              handleUserAction(selectedUser._id, 'unban');
                            }
                          }} 
                          className="admin-button success-button"
                        >
                          Unban User
                        </button>
                      )}
                      
                      {selectedUser.role !== 'admin' ? (
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to make ${selectedUser.name} an admin?`)) {
                              handleUserAction(selectedUser._id, 'promote');
                            }
                          }} 
                          className="admin-button primary-button"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove admin privileges from ${selectedUser.name}?`)) {
                              handleUserAction(selectedUser._id, 'demote');
                            }
                          }} 
                          className="admin-button warning-button"
                        >
                          Remove Admin
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersTab;
