'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { apiFetch } from '../../utils/apiUtils';

const LogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    actionType: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Action type options
  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'profile_edit', label: 'Profile Edit' },
    { value: 'post_create', label: 'Post Create' },
    { value: 'post_edit', label: 'Post Edit' },
    { value: 'post_delete', label: 'Post Delete' },
    { value: 'comment_create', label: 'Comment Create' },
    { value: 'comment_edit', label: 'Comment Edit' },
    { value: 'comment_delete', label: 'Comment Delete' },
    { value: 'message_send', label: 'Message Send' },
    { value: 'report_submit', label: 'Report Submit' },
    { value: 'account_ban', label: 'Account Ban' },
    { value: 'account_unban', label: 'Account Unban' },
    { value: 'session_terminate', label: 'Session Terminate' },
    { value: 'content_moderate', label: 'Content Moderate' },
    { value: 'admin_dashboard_visit', label: 'Admin Dashboard Visit' },
    { value: 'VIEW_REPORTS', label: 'View Reports' },
    { value: 'VIEW_USERS', label: 'View Users' }
  ];
  
  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Admin authentication token not found. Please log in again.');
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (filters.actionType) {
        params.append('actionType', filters.actionType);
      }
      
      if (filters.userId) {
        params.append('userId', filters.userId);
      }
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await apiFetch(`/api/admin/logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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
    fetchLogs(); // Fetch logs with new filters
  };

  // Handle search input
  const handleSearchInput = (e) => {
    const { value } = e.target;
    setFilters(prev => ({
      ...prev,
      userId: value
    }));
    // Auto-search after a short delay
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      setPage(1);
      fetchLogs();
    }, 500));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      actionType: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    setPage(1);
    fetchLogs();
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Load logs on mount and when page changes
  useEffect(() => {
    fetchLogs();
  }, [page]);
  
  // Render loading state
  if (loading && !logs.length) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading activity logs...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={fetchLogs} className="admin-button primary-button">
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="logs-tab">
      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="actionType">Action Type</label>
            <select 
              id="actionType" 
              name="actionType" 
              value={filters.actionType} 
              onChange={handleFilterChange}
              className="admin-form-select"
            >
              {actionTypes.map(action => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="userId">User ID</label>
            <input 
              type="text" 
              id="userId" 
              name="userId" 
              value={filters.userId} 
              onChange={handleSearchInput}
              placeholder="Enter user ID"
              className="admin-form-control"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input 
              type="date" 
              id="startDate" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange}
              className="admin-form-control"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="endDate">End Date</label>
            <input 
              type="date" 
              id="endDate" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange}
              className="admin-form-control"
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
      
      {logs.length === 0 ? (
        <div className="admin-empty-state">
          <p>No activity logs found matching the current filters.</p>
          <p className="admin-help-text">Activity logs track user actions such as logins, profile edits, content creation, and moderation actions. If you're seeing this message, it may be because:</p>
          <ul className="admin-help-list">
            <li>No user activity has been logged yet</li>
            <li>The current filters are too restrictive</li>
            <li>The activity logging system needs to be configured</li>
          </ul>
          <button onClick={resetFilters} className="admin-button primary-button">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="admin-data-container">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} onClick={() => setSelectedLog(log)} className="log-row">
                    <td>{formatDate(log.timestamp)}</td>
                    <td>
                      {log.user ? (
                        <div className="user-cell">
                          {log.user.profileImage && (
                            <img 
                              src={log.user.profileImage} 
                              alt={log.user.name} 
                              className="user-avatar-small" 
                            />
                          )}
                          <span>{log.user.name || 'Unknown User'}</span>
                        </div>
                      ) : (
                        <span>System</span>
                      )}
                    </td>
                    <td>
                      <span className={`action-badge ${log.actionType}`}>
                        {log.actionType.includes('_') 
                          ? log.actionType.replace(/_/g, ' ') 
                          : log.actionType.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </td>
                    <td>
                      {log.targetType && (
                        <span className="target-badge">
                          {log.targetType}: {log.targetId}
                        </span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }} 
                        className="admin-button secondary-button small-button"
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
        </div>
      )}
      
      {/* Log Details Modal */}
      {selectedLog && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Log Details</h3>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="admin-modal-close"
              >
                &times;
              </button>
            </div>
            
            <div className="admin-modal-body">
              <div className="log-details">
                <div className="detail-item">
                  <span className="detail-label">Log ID:</span>
                  <p className="detail-value">{selectedLog._id}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Timestamp:</span>
                  <p className="detail-value">{formatDate(selectedLog.timestamp)}</p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">User:</span>
                  <p className="detail-value">
                    {selectedLog.user ? (
                      <>
                        {selectedLog.user.name} ({selectedLog.user._id})
                      </>
                    ) : (
                      'System'
                    )}
                  </p>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Action:</span>
                  <p className="detail-value">
                                      <span className={`action-badge ${selectedLog.actionType}`}>
                    {selectedLog.actionType.includes('_') 
                      ? selectedLog.actionType.replace(/_/g, ' ') 
                      : selectedLog.actionType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  </p>
                </div>
                
                {selectedLog.targetType && (
                  <div className="detail-item">
                    <span className="detail-label">Target:</span>
                    <p className="detail-value">
                      {selectedLog.targetType}: {selectedLog.targetId}
                    </p>
                  </div>
                )}
                
                {selectedLog.ip && (
                  <div className="detail-item">
                    <span className="detail-label">IP Address:</span>
                    <p className="detail-value">{selectedLog.ip}</p>
                  </div>
                )}
                
                {selectedLog.userAgent && (
                  <div className="detail-item">
                    <span className="detail-label">User Agent:</span>
                    <p className="detail-value user-agent">{selectedLog.userAgent}</p>
                  </div>
                )}
                
                {selectedLog.details && (
                  <div className="detail-item">
                    <span className="detail-label">Additional Details:</span>
                    <pre className="detail-value details-json">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsTab;
