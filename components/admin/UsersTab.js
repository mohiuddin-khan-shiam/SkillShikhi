'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { FaSearch, FaFilter, FaUserCircle, FaBan, FaUnlock, FaEye } from 'react-icons/fa';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: 'all', // 'all', 'active', 'inactive', 'banned'
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
  
  // Open user details modal
  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Close user details modal
  const closeUserModal = () => {
    setShowUserModal(false);
    setTimeout(() => setSelectedUser(null), 300); // Delay clearing user data for animation
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
      
      alert(responseData.message || `User ${action}ed successfully`);
      
      // Force refresh the users list to reflect the changes
      await fetchUsers(true);
      
      // Close modal if the actioned user was selected
      if (selectedUser && selectedUser._id === userId) {
        closeUserModal();
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
      <div className="admin-users-tab">
        <div className="admin-header">
          <h2>{filters.status === 'banned' ? 'Banned Users' : 'User Management'}</h2>
        </div>
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
          <div className="filter-controls">
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          
          <div className="filter-group search-group">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
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
          </div>
          
          <div className="filter-actions">
            <button onClick={applyFilters} className="admin-button primary-button">
              <FaFilter className="button-icon" /> Apply Filters
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
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="user-avatar-small" 
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          <FaUserCircle className="avatar-icon" />
                        </div>
                      )}
                      <span className="user-name">{user.name}</span>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role || 'user'}`}>
                        {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(user.createdAt)}</td>
                    <td className="date-cell">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                    <td>
                      <span className={`status-badge ${user.isBanned ? 'banned' : user.isActive ? 'active' : 'inactive'}`}>
                        {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => openUserModal(user)} 
                        className="admin-button view-button small-button"
                        aria-label="View user details"
                      >
                        <FaEye className="button-icon" /> View
                      </button>
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUserAction(user._id, 'unban')}
                          className="admin-button success-button small-button"
                          title="Unban User"
                          aria-label="Unban user"
                        >
                          <FaUnlock className="button-icon" /> Unban
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
                          aria-label="Ban user"
                        >
                          <FaBan className="button-icon" /> Ban
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
          {showUserModal && selectedUser && (
            <div className="admin-modal-backdrop" onClick={closeUserModal}>
              <div className="admin-modal improved-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">User Details</h3>
                  <button 
                    onClick={closeUserModal} 
                    className="admin-modal-close"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="admin-modal-body">
                  <div className="user-profile-section enhanced">
                    <div className="user-profile">
                      <div className="avatar-container">
                        <img 
                          src={selectedUser.profileImage || '/images/profile-placeholder.png'} 
                          alt={selectedUser.name} 
                          className="user-avatar-large" 
                        />
                      </div>
                      <div className="user-info">
                        <h4 className="user-name-large">{selectedUser.name}</h4>
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
                  
                  <div className="tabs-container">
                    <div className="tab-navigation">
                      <button className="tab-button active">Profile Info</button>
                      <button className="tab-button">Activity</button>
                      <button className="tab-button">Admin Actions</button>
                    </div>
                    
                    <div className="tab-content">
                      <div className="user-details-section enhanced">
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">User ID</span>
                            <p className="detail-value">{selectedUser._id}</p>
                          </div>
                          
                          <div className="detail-item">
                            <span className="detail-label">Username</span>
                            <p className="detail-value">{selectedUser.username || 'Not set'}</p>
                          </div>
                          
                          <div className="detail-item">
                            <span className="detail-label">Joined</span>
                            <p className="detail-value">{formatDate(selectedUser.createdAt)}</p>
                          </div>
                          
                          <div className="detail-item">
                            <span className="detail-label">Last Login</span>
                            <p className="detail-value">{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
                          </div>
                          
                          <div className="detail-item">
                            <span className="detail-label">Phone</span>
                            <p className="detail-value">{selectedUser.phone || 'Not provided'}</p>
                          </div>
                          
                          <div className="detail-item">
                            <span className="detail-label">Location</span>
                            <p className="detail-value">{selectedUser.location || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        {selectedUser.bio && (
                          <div className="detail-item bio-item">
                            <span className="detail-label">Bio</span>
                            <p className="detail-value bio-text">{selectedUser.bio}</p>
                          </div>
                        )}
                        
                        {selectedUser.isBanned && (
                          <div className="detail-item ban-info enhanced">
                            <span className="detail-label">Ban Information</span>
                            <div className="ban-details">
                              <p><strong>Banned on:</strong> {formatDate(selectedUser.banInfo?.date)}</p>
                              <p><strong>Reason:</strong> {selectedUser.banInfo?.reason || 'No reason provided'}</p>
                              <p><strong>Banned by:</strong> {selectedUser.banInfo?.adminName || 'System'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="activity-section enhanced">
                    <h4>Activity Summary</h4>
                    <div className="activity-stats">
                      <div className="stat-item enhanced">
                        <span className="stat-value">{selectedUser.stats?.posts || 0}</span>
                        <span className="stat-label">Posts</span>
                      </div>
                      <div className="stat-item enhanced">
                        <span className="stat-value">{selectedUser.stats?.comments || 0}</span>
                        <span className="stat-label">Comments</span>
                      </div>
                      <div className="stat-item enhanced">
                        <span className="stat-value">{selectedUser.stats?.courses || 0}</span>
                        <span className="stat-label">Courses</span>
                      </div>
                      <div className="stat-item enhanced">
                        <span className="stat-value">{selectedUser.stats?.reports || 0}</span>
                        <span className="stat-label">Reports</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="admin-actions enhanced">
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
                          <FaBan className="button-icon" /> Ban User
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
                          <FaUnlock className="button-icon" /> Unban User
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

// Add styles for the modal animation and enhanced UI
const styles = `
  /* Modern color scheme */
  :root {
    --primary-color: #4a6cf7;
    --primary-hover: #3a5ce5;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --light-color: #f8f9fa;
    --dark-color: #343a40;
    --white-color: #ffffff;
    --gray-100: #f8f9fa;
    --gray-200: #e9ecef;
    --gray-300: #dee2e6;
    --gray-400: #ced4da;
    --gray-500: #adb5bd;
    --gray-600: #6c757d;
    --gray-700: #495057;
    --gray-800: #343a40;
    --gray-900: #212529;
  }

  /* Enhanced table styling */
  .admin-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    margin-bottom: 1.5rem;
    background-color: var(--white-color);
  }

  .admin-table th {
    background-color: var(--primary-color);
    color: var(--white-color);
    font-weight: 600;
    text-align: left;
    padding: 12px 15px;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .admin-table td {
    padding: 12px 15px;
    border-bottom: 1px solid var(--gray-200);
    vertical-align: middle;
  }

  .admin-table tr:last-child td {
    border-bottom: none;
  }

  .admin-table tbody tr:hover {
    background-color: var(--gray-100);
    transition: background-color 0.2s ease;
  }

  /* User cell styling */
  .user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-avatar-small {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--gray-300);
  }

  .avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-600);
  }

  .avatar-icon {
    font-size: 24px;
  }

  .user-name {
    font-weight: 600;
    color: var(--gray-800);
  }

  /* Badge styling */
  .role-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .role-badge.admin {
    background-color: var(--primary-color);
    color: var(--white-color);
  }

  .role-badge.user {
    background-color: var(--info-color);
    color: var(--white-color);
  }

  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-badge.active {
    background-color: var(--success-color);
    color: var(--white-color);
  }

  .status-badge.inactive {
    background-color: var(--warning-color);
    color: var(--gray-900);
  }

  .status-badge.banned {
    background-color: var(--danger-color);
    color: var(--white-color);
  }

  /* Button styling */
  .admin-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .admin-button.small-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .admin-button.primary-button {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    transition: all 0.2s ease;
  }
  
  .admin-button.primary-button:hover {
    background-color: var(--primary-hover);
    border-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(74, 108, 247, 0.3);
  }

  .admin-button.secondary-button {
    background-color: var(--secondary-color);
    color: var(--white-color);
  }

  .admin-button.secondary-button:hover {
    background-color: var(--gray-700);
  }

  .admin-button.success-button {
    background-color: var(--success-color);
    border-color: var(--success-color);
    color: white;
    transition: all 0.2s ease;
  }
  
  .admin-button.success-button:hover {
    background-color: #218838;
    border-color: #218838;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
  }

  .admin-button.danger-button {
    background-color: var(--danger-color);
    border-color: var(--danger-color);
    color: white;
    transition: all 0.2s ease;
  }
  
  .admin-button.danger-button:hover {
    background-color: #c82333;
    border-color: #bd2130;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
  }

  .admin-button.view-button {
    background-color: var(--info-color);
    color: var(--white-color);
  }

  .admin-button.view-button:hover {
    background-color: #138496;
  }

  .button-icon {
    font-size: 0.9rem;
  }

  /* Filter section styling */
  .admin-filters {
    background-color: var(--gray-100);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: flex-end;
  }

  .filter-controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filter-select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--gray-300);
    background-color: var(--white-color);
    min-width: 120px;
    font-size: 0.9rem;
  }

  .filter-select:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.25);
  }

  .search-group {
    flex-grow: 1;
  }

  .search-type-selector {
    margin-bottom: 8px;
  }

  .search-type {
    width: 100%;
  }

  .search-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    color: var(--gray-500);
  }

  .filter-input {
    padding: 8px 12px 8px 35px;
    border-radius: 4px;
    border: 1px solid var(--gray-300);
    width: 100%;
    font-size: 0.9rem;
  }

  .date-input {
    padding: 8px 12px;
  }

  .filter-input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.25);
  }

  .filter-actions {
    display: flex;
    gap: 10px;
  }

  /* Pagination styling */
  .admin-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    gap: 15px;
  }

  .page-info {
    font-size: 0.9rem;
    color: var(--gray-700);
  }

  /* Banned user row styling */
  .banned-user {
    background-color: rgba(220, 53, 69, 0.05);
  }

  .banned-user:hover {
    background-color: rgba(220, 53, 69, 0.1) !important;
  }

  /* Date cell styling */
  .date-cell {
    white-space: nowrap;
    font-size: 0.85rem;
    color: var(--gray-700);
  }

  .user-email {
    color: var(--gray-700);
    font-size: 0.9rem;
  }

  /* Empty state styling */
  .admin-empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--gray-600);
    background-color: var(--gray-100);
    border-radius: 8px;
    margin-top: 20px;
  }

  /* Loading state styling */
  .admin-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .admin-loading-spinner {
    border: 4px solid var(--gray-200);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin-right: 10px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Actions cell styling */
  .actions-cell {
    display: flex;
    gap: 8px;
    white-space: nowrap;
  }

  /* Responsive adjustments */
  @media (max-width: 992px) {
    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }
    
    .filter-controls {
      flex-direction: column;
    }
    
    .admin-table {
      display: block;
      overflow-x: auto;
    }
  }

  .admin-modal-backdrop {
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
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .admin-modal {
    background-color: var(--white-color);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    margin: 2rem auto;
    animation: modalFadeIn 0.3s ease-out forwards;
  }

  .improved-modal {
    border-radius: 12px;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  @keyframes slideIn {
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .admin-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .admin-modal-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #2d3748;
  }

  .admin-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #718096;
    transition: color 0.2s;
  }

  .admin-modal-close:hover {
    color: #e53e3e;
  }

  .admin-modal-body {
    padding: 20px;
  }

  .user-profile-section {
    margin-bottom: 24px;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .user-avatar-large {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--white-color);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease;
  }

  .avatar-container {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .user-name-large {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
    color: var(--dark-color);
  }

  .user-info h4 {
    font-size: 20px;
    margin: 0 0 4px;
    color: #2d3748;
  }

  .user-email {
    color: #718096;
    margin: 0 0 8px;
  }

  .user-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .role-badge, .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .role-badge.admin {
    background-color: #ebf8ff;
    color: #2b6cb0;
  }

  .role-badge.user {
    background-color: #e9f5f8;
    color: #2c7a7b;
  }

  .status-badge.active {
    background-color: #e6fffa;
    color: #2c7a7b;
  }

  .status-badge.inactive {
    background-color: #f7fafc;
    color: #718096;
  }

  .status-badge.banned {
    background-color: #fff5f5;
    color: #c53030;
  }

  .detail-columns {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -0.75rem;
  }

  .detail-column {
    flex: 1 1 300px;
    padding: 0 0.75rem;
  }

  .detail-item {
    margin-bottom: 12px;
  }

  .detail-label {
    font-size: 14px;
    font-weight: 500;
    color: #718096;
    display: block;
    margin-bottom: 4px;
  }

  .detail-value {
    margin: 0;
    color: #2d3748;
  }

  .bio-text {
    white-space: pre-wrap;
    line-height: 1.6;
    padding: 1rem;
    background-color: white;
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
  }

  .ban-info {
    margin-top: 1.5rem;
    background-color: #fff5f5;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid var(--danger-color);
    grid-column: 1 / -1;
  }

  .ban-info.enhanced {
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.1);
  }

  .activity-section {
    padding: 1.5rem;
    border-bottom: 1px solid var(--gray-200);
  }

  .activity-section.enhanced {
    padding: 2rem 1.5rem;
    background-color: var(--gray-100);
  }

  .activity-stats {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1rem;
    gap: 1.25rem;
  }

  .stat-item {
    flex: 1 1 100px;
    background-color: var(--gray-100);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }

  .stat-item.enhanced {
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 1.25rem;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .stat-item.enhanced:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .stat-value {
    display: block;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .stat-label {
    display: block;
    font-size: 0.875rem;
    color: var(--gray-600);
    margin-top: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .admin-actions {
    padding: 1.5rem;
  }
  
  .admin-actions.enhanced {
    padding: 2rem 1.5rem;
    background-color: var(--gray-100);
    border-top: 1px solid var(--gray-200);
    border-radius: 0 0 12px 12px;
  }
  
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  /* Tab styles for user modal */
  .tabs-container {
    width: 100%;
  }
  
  .tab-navigation {
    display: flex;
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: 1rem;
  }
  
  .tab-button {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-weight: 600;
    color: var(--gray-600);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .tab-button:hover {
    color: var(--primary-color);
  }
  
  .tab-button.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
  
  .tab-content {
    padding: 1rem 0;
  }
  
  .user-profile-section {
    display: flex;
    padding: 1.5rem;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .user-profile-section.enhanced {
    background: linear-gradient(135deg, var(--primary-color) 0%, #6a8af7 100%);
    padding: 2rem 1.5rem;
    border-radius: 0;
    margin: -1px;
    color: white;
  }
  
  .user-details-section {
    padding: 1.5rem;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .user-details-section.enhanced {
    padding: 2rem 1.5rem;
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .detail-item {
    margin-bottom: 1.25rem;
    background-color: var(--gray-100);
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .detail-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  
  .bio-item {
    margin-top: 1.5rem;
    grid-column: 1 / -1;
  }
    gap: 12px;
    justify-content: flex-end;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
