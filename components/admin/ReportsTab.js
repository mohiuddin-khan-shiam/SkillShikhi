'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: '',
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state before fetching
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Admin token for reports:', token);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      // Since we only support user reports, we'll remove the type filter completely
      // This ensures all reports show up regardless of their type
      // params.append('type', 'user');
      
      console.log('Fetching reports with params:', params.toString());
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store' // Prevent caching to ensure fresh data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reports');
      }
      
      const data = await response.json();
      console.log('Reports data received:', data);
      
      // Check if reports array exists and has items
      if (!data.reports || !Array.isArray(data.reports)) {
        console.warn('No reports array in response or invalid format');
        setReports([]);
      } else {
        setReports(data.reports);
      }
      
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle report action (resolve, dismiss, etc.)
  const handleReportAction = async (reportId, action, reason = '') => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`/api/admin/reports/${reportId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} report`);
      }
      
      // Refresh reports
      fetchReports();
      
      // Close details panel if the actioned report was selected
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport(null);
      }
      
      // Use a more elegant notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'report-notification success';
      notification.innerHTML = `
        <span class="notification-icon">${action === 'resolve' ? '✅' : '❌'}</span>
        <span>Report ${action === 'resolve' ? 'resolved' : 'dismissed'} successfully</span>
        <button class="close-notification">×</button>
      `;
      document.body.appendChild(notification);
      
      // Add event listener to close button
      const closeButton = notification.querySelector('.close-notification');
      closeButton.addEventListener('click', () => {
        notification.remove();
      });
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 3000);
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      // Use a more elegant error notification
      const notification = document.createElement('div');
      notification.className = 'report-notification error';
      notification.innerHTML = `
        <span class="notification-icon">⚠️</span>
        <span>Error: ${error.message}</span>
        <button class="close-notification">×</button>
      `;
      document.body.appendChild(notification);
      
      // Add event listener to close button
      const closeButton = notification.querySelector('.close-notification');
      closeButton.addEventListener('click', () => {
        notification.remove();
      });
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 5000);
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
    
    // Immediately fetch reports when filter changes for better UX
    setTimeout(() => {
      fetchReports();
    }, 100);
  };
  
  // Apply filters
  const applyFilters = () => {
    setLoading(true);
    fetchReports();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'pending',
      type: 'user',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Load reports on mount and when filters/page changes
  useEffect(() => {
    fetchReports();
  }, [page, filters.status]);
  
  // Set up auto-refresh for reports
  useEffect(() => {
    // Auto-refresh regardless of filter status to ensure data is always fresh
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing reports...');
      fetchReports();
    }, 30000); // Refresh every 30 seconds for better real-time updates
    
    return () => {
      clearInterval(intervalId);
    };
  }, [filters.status]);
  
  // Handle selecting/deselecting all reports
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReports(reports.map(report => report._id));
    } else {
      setSelectedReports([]);
    }
  };

  // Handle selecting/deselecting a single report
  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report');
      return;
    }

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/reports/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportIds: selectedReports,
          action: action
        })
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      // Refresh reports after bulk action
      fetchReports();
      // Clear selections
      setSelectedReports([]);
      alert(`Bulk action '${action}' completed successfully`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Render loading state
  if (loading && !reports.length) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Loading reports...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchReports} className="retry-button">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="reports-tab">
      <div className="reports-header">
        <h2>User Reports</h2>
        
        {selectedReports.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedReports.length} reports selected</span>
            <div className="bulk-action-buttons">
              <button 
                onClick={() => handleBulkAction('review')}
                disabled={bulkActionLoading}
                className="bulk-action-button review"
              >
                <span className="action-icon">✓</span> Mark All as Reviewed
              </button>
              <button 
                onClick={() => handleBulkAction('resolve')}
                disabled={bulkActionLoading}
                className="bulk-action-button resolve"
              >
                <span className="action-icon">✅</span> Resolve All
              </button>
              <button 
                onClick={() => handleBulkAction('dismiss')}
                disabled={bulkActionLoading}
                className="bulk-action-button dismiss"
              >
                <span className="action-icon">❌</span> Dismiss All
              </button>
              <button 
                onClick={() => setSelectedReports([])}
                className="bulk-action-button cancel"
              >
                <span className="action-icon">↩</span> Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="filter-controls">
          <span className="filter-title">Status:</span>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          {/* User type selector removed as requested */}
          <span className="filter-title">From:</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="filter-input"
          />
          <span className="filter-title">To:</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="filter-input"
          />
          <button onClick={applyFilters} className="apply-button">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="reset-button">
            Reset
          </button>
        </div>
      </div>
      
      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Reports Found</h3>
          <p>No user reports found matching the current filters.</p>
          <button onClick={fetchReports} className="retry-button">
            <span className="refresh-icon">🔄</span> Refresh Reports
          </button>
        </div>
      ) : (
        <div className="reports-container">
          <div className="reports-list">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={reports.length > 0 && selectedReports.length === reports.length}
                      className="select-checkbox"
                    />
                  </th>
                  <th>Reporter</th>
                  <th>Reported User</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className={selectedReports.includes(report._id) ? 'selected-row' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedReports.includes(report._id)}
                        onChange={() => handleSelectReport(report._id)}
                        className="select-checkbox"
                      />
                    </td>
                    <td className="user-cell">
                      {report.reportedBy ? (
                        <>
                          <img 
                            src={report.reportedBy.profileImage || '/images/profile-placeholder.png'} 
                            alt={report.reportedBy.name} 
                            className="user-avatar-small" 
                          />
                          <span>{report.reportedBy.name}</span>
                        </>
                      ) : (
                        <span>Anonymous</span>
                      )}
                    </td>
                    <td>
                      {report.reportedUser ? (
                        <>
                          <img 
                            src={report.reportedUser.profileImage || '/images/profile-placeholder.png'} 
                            alt={report.reportedUser.name} 
                            className="user-avatar-small" 
                          />
                          <span>{report.reportedUser.name}</span>
                        </>
                      ) : (
                        <span>Unknown</span>
                      )}
                    </td>
                    <td className="reason-cell">
                      {report.reason === 'inappropriate_content' && 'Inappropriate Content'}
                      {report.reason === 'harassment' && 'Harassment or Bullying'}
                      {report.reason === 'spam' && 'Spam or Misleading'}
                      {report.reason === 'impersonation' && 'Impersonation'}
                      {report.reason === 'misinformation' && 'Misinformation'}
                      {report.reason === 'other' && 'Other'}
                      {report.details && report.details.length > 0 && (
                        <span className="details-preview">: {report.details.substring(0, 30)}{report.details.length > 30 ? '...' : ''}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${report.status}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(report.createdAt)}</td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => setSelectedReport(report)} 
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
          
          {/* Report Details Modal */}
          {selectedReport && (
            <div className="report-details-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Report Details</h3>
                  <button 
                    onClick={() => setSelectedReport(null)} 
                    className="close-button"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="reporter-section">
                    <h4>Reporter</h4>
                    {selectedReport.reportedBy ? (
                      <div className="user-profile">
                        <img 
                          src={selectedReport.reportedBy.profileImage || '/images/profile-placeholder.png'} 
                          alt={selectedReport.reportedBy.name} 
                          className="user-avatar" 
                        />
                        <div className="user-info">
                          <h5>{selectedReport.reportedBy.name}</h5>
                          <p>{selectedReport.reportedBy.email}</p>
                          <button 
                            onClick={() => window.open(`/user/${selectedReport.reportedBy._id}`, '_blank')} 
                            className="view-profile-button"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>Anonymous Report</p>
                    )}
                  </div>
                  
                  <div className="reported-content-section">
                    <h4>Reported User</h4>
                    {selectedReport.reportedUser && (
                      <div className="user-profile">
                        <img 
                          src={selectedReport.reportedUser.profileImage || '/images/profile-placeholder.png'} 
                          alt={selectedReport.reportedUser.name} 
                          className="user-avatar" 
                        />
                        <div className="user-info">
                          <h5>{selectedReport.reportedUser.name}</h5>
                          <p>{selectedReport.reportedUser.email}</p>
                          <button 
                            onClick={() => window.open(`/user/${selectedReport.reportedUser._id}`, '_blank')} 
                            className="view-profile-button"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="reported-content">
                      <h4>Report Details</h4>
                      <p className="content-preview">{selectedReport.details}</p>
                    </div>
                  </div>
                  
                  <div className="report-details-section">
                    <div className="detail-item">
                      <span className="detail-label">Report Type:</span>
                      <p className="detail-value">
                        {selectedReport.reason === 'inappropriate_content' && 'Inappropriate Content'}
                        {selectedReport.reason === 'harassment' && 'Harassment or Bullying'}
                        {selectedReport.reason === 'spam' && 'Spam or Misleading'}
                        {selectedReport.reason === 'impersonation' && 'Impersonation'}
                        {selectedReport.reason === 'misinformation' && 'Misinformation'}
                        {selectedReport.reason === 'other' && 'Other'}
                      </p>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Reason:</span>
                      <p className="detail-value">{selectedReport.reason}</p>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Date Reported:</span>
                      <p className="detail-value">{formatDate(selectedReport.createdAt)}</p>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <p className="detail-value">
                        <span className={`status-badge ${selectedReport.status}`}>
                          {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    
                    {selectedReport.reviewNotes && (
                      <div className="detail-item">
                        <span className="detail-label">Resolution Notes:</span>
                        <p className="detail-value">{selectedReport.reviewNotes}</p>
                      </div>
                    )}
                    
                    {selectedReport.reviewedBy && (
                      <div className="detail-item">
                        <span className="detail-label">Reviewed By:</span>
                        <p className="detail-value">{selectedReport.reviewedBy.name}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedReport.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          const reason = prompt('Enter resolution reason:');
                          if (reason) {
                            handleReportAction(selectedReport._id, 'resolve', reason);
                          }
                        }} 
                        className="resolve-button"
                      >
                        Resolve Report
                      </button>
                      
                      <button 
                        onClick={() => {
                          const reason = prompt('Enter dismissal reason:');
                          if (reason) {
                            handleReportAction(selectedReport._id, 'dismiss', reason);
                          }
                        }} 
                        className="dismiss-button"
                      >
                        Dismiss Report
                      </button>
                      
                      {selectedReport.reportType === 'user' && (
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to ban this user?')) {
                              const reason = prompt('Enter ban reason:');
                              if (reason) {
                                // Mock ban user API call
                                setTimeout(() => {
                                  alert('User banned successfully');
                                  handleReportAction(selectedReport._id, 'resolve', `User banned: ${reason}`);
                                }, 500);
                              }
                            }
                          }} 
                          className="ban-button"
                        >
                          Ban User
                        </button>
                      )}
                      
                      {(selectedReport.reportType === 'post' || selectedReport.reportType === 'comment' || selectedReport.reportType === 'message') && (
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this content?')) {
                              const reason = prompt('Enter deletion reason:');
                              if (reason) {
                                // Mock content moderation API call
                                setTimeout(() => {
                                  alert('Content deleted successfully');
                                  handleReportAction(selectedReport._id, 'resolve', `Content deleted: ${reason}`);
                                }, 500);
                              }
                            }
                          }} 
                          className="delete-button"
                        >
                          Delete Content
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .reports-tab {
          width: 100%;
        }
        
        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .filter-controls {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        .filter-select, .filter-input {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
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
        
        .pending-report {
          background-color: #fffbeb;
        }
        
        .reason-cell {
          max-width: 300px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .status-badge.resolved {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.dismissed {
          background-color: #f3f4f6;
          color: #6b7280;
        }
        
        .report-details-modal {
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
          max-width: 700px;
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
        
        .reporter-section, .reported-content-section, .report-details-section {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .user-profile {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }
        
        .user-avatar {
          width: 60px;
          height: 60px;
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
        
        .user-info h5 {
          margin: 0 0 5px 0;
        }
        
        .user-info p {
          margin: 0 0 10px 0;
          color: #6b7280;
        }
        
        .reported-content {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin-top: 10px;
        }
        
        .content-preview {
          margin: 0 0 10px 0;
          white-space: pre-wrap;
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
        
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .resolve-button, .dismiss-button, .ban-button, .delete-button, .view-profile-button, .view-content-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .resolve-button {
          background-color: #10b981;
          color: white;
        }
        
        .dismiss-button {
          background-color: #6b7280;
          color: white;
        }
        
        .ban-button {
          background-color: #ef4444;
          color: white;
        }
        
        .delete-button {
          background-color: #f97316;
          color: white;
        }
        
        .view-profile-button, .view-content-button {
          background-color: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ReportsTab;

// Add improved styles at the end of the file
const styles = `
  /* Loading spinner animation */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
  }
  
  .loading-spinner-large {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
  
  .retry-button {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
  }
  
  .retry-button:hover {
    background-color: #3182ce;
  }
  
  .refresh-icon {
    display: inline-block;
    animation: spin 2s linear infinite;
    animation-play-state: paused;
  }
  
  .retry-button:hover .refresh-icon {
    animation-play-state: running;
  }
  
  /* Notification styles */
  .report-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    max-width: 350px;
    animation: slide-in 0.3s ease-out forwards;
  }
  
  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .report-notification.fade-out {
    animation: slide-out 0.5s ease-in forwards;
  }
  
  @keyframes slide-out {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .report-notification.success {
    background-color: #d1fae5;
    border-left: 4px solid #10b981;
    color: #065f46;
  }
  
  .report-notification.error {
    background-color: #fee2e2;
    border-left: 4px solid #ef4444;
    color: #991b1b;
  }
  
  .notification-icon {
    font-size: 18px;
  }
  
  .close-notification {
    margin-left: auto;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
  }
  
  .close-notification:hover {
    opacity: 1;
  }
  
  .reports-tab {
    font-family: 'Inter', sans-serif;
  }
  
  .reports-header {
    margin-bottom: 20px;
  }
  
  .reports-header h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1a202c;
  }
  
  .bulk-actions {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .selected-count {
    font-weight: 500;
    color: #4a5568;
  }
  
  .bulk-action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .bulk-action-button {
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    border: none;
  }
  
  .bulk-action-button.review {
    background-color: #ebf8ff;
    color: #2b6cb0;
  }
  
  .bulk-action-button.review:hover {
    background-color: #bee3f8;
  }
  
  .bulk-action-button.resolve {
    background-color: #f0fff4;
    color: #2f855a;
  }
  
  .bulk-action-button.resolve:hover {
    background-color: #c6f6d5;
  }
  
  .bulk-action-button.dismiss {
    background-color: #fff5f5;
    color: #c53030;
  }
  
  .bulk-action-button.dismiss:hover {
    background-color: #fed7d7;
  }
  
  .bulk-action-button.cancel {
    background-color: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }
  
  .bulk-action-button.cancel:hover {
    background-color: #edf2f7;
  }
  
  .action-icon {
    font-size: 14px;
  }
  
  .filter-controls {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }
  
  .filter-title {
    font-weight: 500;
    color: #4a5568;
    margin-right: 4px;
  }
  
  .filter-select, .filter-input {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: white;
    min-width: 150px;
  }
  
  .apply-button, .reset-button {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .apply-button {
    background-color: #4299e1;
    color: white;
    border: none;
  }
  
  .apply-button:hover {
    background-color: #3182ce;
  }
  
  .reset-button {
    background-color: white;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }
  
  .reset-button:hover {
    background-color: #f7fafc;
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    background-color: #f8fafc;
    border-radius: 8px;
    border: 1px dashed #e2e8f0;
  }
  
  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: #a0aec0;
  }
  
  .empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #4a5568;
  }
  
  .empty-state p {
    color: #718096;
    margin-bottom: 16px;
  }
  
  .reports-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
  }
  
  .reports-table th {
    background-color: #f7fafc;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #4a5568;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .reports-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }
  
  .reports-table tr:last-child td {
    border-bottom: none;
  }
  
  .reports-table tr:hover {
    background-color: #f8fafc;
  }
  
  .selected-row {
    background-color: #ebf8ff !important;
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .user-avatar-small {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .status-badge.pending {
    background-color: #fef3c7;
    color: #92400e;
  }
  
  .status-badge.resolved {
    background-color: #d1fae5;
    color: #065f46;
  }
  
  .status-badge.dismissed {
    background-color: #fee2e2;
    color: #991b1b;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    gap: 8px;
  }
  
  .pagination-button {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .pagination-button:hover:not(:disabled) {
    background-color: #f7fafc;
  }
  
  .pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-button.active {
    background-color: #4299e1;
    color: white;
    border-color: #4299e1;
  }
  
  .report-detail-panel {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .detail-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a202c;
  }
  
  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: #a0aec0;
  }
  
  .close-button:hover {
    color: #4a5568;
  }
  
  .detail-content {
    margin-bottom: 20px;
  }
  
  .detail-section {
    margin-bottom: 16px;
  }
  
  .detail-label {
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 4px;
  }
  
  .detail-value {
    color: #1a202c;
  }
  
  .detail-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }
  
  .action-button {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .action-button.resolve {
    background-color: #48bb78;
    color: white;
    border: none;
  }
  
  .action-button.resolve:hover {
    background-color: #38a169;
  }
  
  .action-button.dismiss {
    background-color: #f56565;
    color: white;
    border: none;
  }
  
  .action-button.dismiss:hover {
    background-color: #e53e3e;
  }
  
  @media (max-width: 768px) {
    .filter-controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .reports-table {
      display: block;
      overflow-x: auto;
    }
    
    .bulk-action-buttons {
      flex-direction: column;
    }
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
