'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaSearch, FaFilter, FaUserCircle, FaBan, FaUnlock, FaEye, FaDownload } from 'react-icons/fa';

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
      // Always prioritize the adminToken for admin actions
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Admin authentication token not found. Please login again.');
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
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="card-title mb-0">{filters.status === 'banned' ? 'Banned Users' : 'User Management'}</h5>
        </div>
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary">Loading users...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error && !users.length) {
    return (
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="card-title text-danger mb-0">Error</h5>
        </div>
        <div className="card-body text-center py-5">
          <div className="alert alert-danger">{error}</div>
          <button onClick={() => fetchUsers(true)} className="btn btn-primary">
            <i className="bi bi-arrow-clockwise me-2"></i> Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">User Management</h5>
        <button className="btn btn-outline-primary">
          <FaDownload className="me-2" /> Export Users
        </button>
      </div>
      
      <div className="card-body">
        {/* Enhanced Filters */}
        <div className="mb-4 p-3 bg-light rounded">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch className="text-secondary" />
                </span>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleSearchInput}
                  placeholder="Search by name, email, or ID"
                  className="form-control"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="col-md-6 d-flex gap-2">
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="form-select"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
              
              <button onClick={applyFilters} className="btn btn-primary">
                <FaFilter className="me-2" /> Filter
              </button>
              <button onClick={resetFilters} className="btn btn-outline-secondary">
                Reset
              </button>
            </div>
          </div>
        </div>
      
        {users.length === 0 ? (
          <div className="alert alert-info text-center">
            <p className="mb-0">No users found matching the current filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle">
              <thead className="table-primary">
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Last Login</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className={user.isBanned ? 'table-danger' : ''}>
                    <td>
                      <div className="d-flex align-items-center">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="rounded-circle me-2" 
                            width="40" 
                            height="40"
                          />
                        ) : (
                          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{width: '40px', height: '40px'}}>
                            <FaUserCircle size={24} />
                          </div>
                        )}
                        <span className="fw-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                    <td>
                      <span className={`badge ${user.isBanned ? 'bg-danger' : user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button 
                          onClick={() => openUserModal(user)} 
                          className="btn btn-sm btn-outline-primary"
                          aria-label="View user details"
                        >
                          <FaEye className="me-1" /> View
                        </button>
                        {user.isBanned ? (
                          <button
                            onClick={() => handleUserAction(user._id, 'unban')}
                            className="btn btn-sm btn-outline-success"
                            title="Unban User"
                            aria-label="Unban user"
                          >
                            <FaUnlock className="me-1" /> Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt(`Enter reason for banning ${user.name}:`);
                              if (reason) {
                                handleUserAction(user._id, 'ban', reason);
                              }
                            }}
                            className="btn btn-sm btn-outline-danger"
                            title="Ban User"
                            aria-label="Ban user"
                          >
                            <FaBan className="me-1" /> Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav aria-label="User pagination">
                  <ul className="pagination">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button 
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                        className="page-link"
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">Page {page} of {totalPages}</span>
                    </li>
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <button 
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
                        className="page-link"
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-modal="true" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">User Details</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeUserModal}
                  aria-label="Close"
                ></button>
              </div>
              
              <div className="modal-body p-0">
                {/* User Profile Header */}
                <div className="bg-light p-4 d-flex align-items-center">
                  <div className="me-4">
                    {selectedUser.profileImage ? (
                      <img 
                        src={selectedUser.profileImage} 
                        alt={selectedUser.name} 
                        className="rounded-circle" 
                        width="80" 
                        height="80" 
                      />
                    ) : (
                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                        <FaUserCircle size={48} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="mb-1">{selectedUser.name}</h4>
                    <div className="mb-2">
                      <span className={`badge ${selectedUser.role === 'admin' ? 'bg-danger' : 'bg-primary'} me-2`}>
                        {selectedUser.role?.toUpperCase() || 'USER'}
                      </span>
                      <span className={`badge ${selectedUser.isBanned ? 'bg-danger' : selectedUser.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {selectedUser.isBanned ? 'BANNED' : selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <a 
                      href={`/user/${selectedUser._id}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Public Profile
                    </a>
                  </div>
                </div>
                
                {/* User Details */}
                <div className="p-4">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-light">User ID</div>
                        <div className="card-body">
                          <code>{selectedUser._id}</code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-light">Username</div>
                        <div className="card-body">
                          {selectedUser.username || 'Not set'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-light">Joined</div>
                        <div className="card-body">
                          {formatDate(selectedUser.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-light">Last Login</div>
                        <div className="card-body">
                          {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-light">Phone</div>
                        <div className="card-body">
                          {selectedUser.phone || 'Not provided'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-light">Location</div>
                        <div className="card-body">
                          {selectedUser.location || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Admin Actions */}
                  <div className="d-flex gap-2 justify-content-end">
                    {!selectedUser.isBanned ? (
                      <button 
                        onClick={() => {
                          const reason = prompt(`Enter reason for banning ${selectedUser.name}:`);
                          if (reason) {
                            handleUserAction(selectedUser._id, 'ban', reason);
                          }
                        }} 
                        className="btn btn-danger"
                      >
                        <FaBan className="me-2" /> Ban User
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to unban ${selectedUser.name}?`)) {
                            handleUserAction(selectedUser._id, 'unban');
                          }
                        }} 
                        className="btn btn-success"
                      >
                        <FaUnlock className="me-2" /> Unban User
                      </button>
                    )}
                    
                    {selectedUser.role !== 'admin' ? (
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to make ${selectedUser.name} an admin?`)) {
                            handleUserAction(selectedUser._id, 'promote');
                          }
                        }} 
                        className="btn btn-primary"
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
                        className="btn btn-warning"
                      >
                        Remove Admin
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeUserModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
