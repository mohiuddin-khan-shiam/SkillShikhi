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
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.type) {
        params.append('type', filters.type);
      }
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data.reports || []);
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
      
      alert(`Report ${action === 'resolve' ? 'resolved' : 'dismissed'} successfully`);
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
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
    fetchReports();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'pending',
      type: '',
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
  }, [page, filters.status, filters.type]);
  
  // Set up auto-refresh for reports
  useEffect(() => {
    // Only auto-refresh if viewing pending reports
    if (filters.status === 'pending') {
      const intervalId = setInterval(() => {
        console.log('Auto-refreshing reports...');
        fetchReports();
      }, 60000); // Refresh every minute
      
      return () => {
        clearInterval(intervalId);
      };
    }
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
            <span>{selectedReports.length} reports selected</span>
            <button 
              onClick={() => handleBulkAction('review')}
              disabled={bulkActionLoading}
              className="bulk-action-button review"
            >
              Mark All as Reviewed
            </button>
            <button 
              onClick={() => handleBulkAction('resolve')}
              disabled={bulkActionLoading}
              className="bulk-action-button resolve"
            >
              Resolve All
            </button>
            <button 
              onClick={() => handleBulkAction('dismiss')}
              disabled={bulkActionLoading}
              className="bulk-action-button dismiss"
            >
              Dismiss All
            </button>
            <button 
              onClick={() => setSelectedReports([])}
              className="bulk-action-button cancel"
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="filter-controls">
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
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="user">User</option>
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="message">Message</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="filter-input"
          />
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
          <p>No reports found matching the current filters.</p>
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
