'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ContentTab = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [filters, setFilters] = useState({
    type: 'post',
    reportStatus: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  
  // Content types for reference
  const contentTypes = {
    post: 'Post',
    comment: 'Comment',
    message: 'Message'
  };
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Fetch content from API
  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('type', filters.type);
      
      if (filters.reportStatus) {
        params.append('reportStatus', filters.reportStatus);
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
      
      const response = await fetch(`/api/admin/content?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      setContent(data.content || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle content action (delete, flag, etc.)
  const handleContentAction = async (contentId, action, reason = '') => {
    try {
      // Prioritize adminToken over regular token for admin operations
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log(`Performing ${action} action on content ${contentId} with reason: ${reason}`);
      
      const response = await fetch(`/api/admin/content/${contentId}/${action}`, {
        method: 'POST', // Changed from PATCH to POST to match API expectations
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason,
          contentType: filters.type
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error(`Error response from server when trying to ${action} content:`, errorData);
        throw new Error(errorData.message || `Failed to ${action} content`);
      }
      
      // Get the response data
      const responseData = await response.json();
      console.log(`${action} content response:`, responseData);
      
      // Refresh content list
      fetchContent();
      
      // Close details panel if the actioned content was selected
      if (selectedContent && selectedContent._id === contentId) {
        setSelectedContent(null);
      }
      
      // Show success message
      alert(responseData.message || `Content ${action} successful`);
    } catch (error) {
      console.error(`Error ${action}ing content:`, error);
      alert(`Error: ${error.message}`);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchContent();
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
      fetchContent();
    }, 500));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: 'post',
      reportStatus: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Format content for display
  const formatContent = (item) => {
    if (!item) return '';
    
    // Truncate content to a reasonable length
    const maxLength = 100;
    let content = item.content || '';
    
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }
    
    // For comments, add context about the parent post
    if (filters.type === 'comment' && item.postContent) {
      content = `${content} (on post: ${item.postContent})`;
    }
    
    return content;
  };
  
  // Load content on mount and when filters/page changes
  useEffect(() => {
    fetchContent();
  }, [page, filters.type, filters.reportStatus]);
  
  // Render loading state
  if (loading && !content.length) {
    return (
      <div className="loading-container">
        <p>Loading content...</p>
      </div>
    );
  }
  
  // Render error state
  if (error && !content.length) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchContent} className="retry-button">
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="content-tab">
      <div className="tab-header">
        <h2>Content Moderation</h2>
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="type">Content Type:</label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="post">Posts</option>
                <option value="comment">Comments</option>
                <option value="message">Messages</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="reportStatus">Report Status:</label>
              <select
                id="reportStatus"
                name="reportStatus"
                value={filters.reportStatus}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Content</option>
                <option value="reported">Reported Content</option>
                <option value="flagged">Flagged Content</option>
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="userId">User ID:</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={filters.userId}
                onChange={handleSearchInput}
                placeholder="Filter by user ID"
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
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
      
      {content.length === 0 ? (
        <div className="no-content">
          <p>No content found matching the current filters.</p>
        </div>
      ) : (
        <div className="content-container">
          <div className="content-list">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Content</th>
                  <th>Created</th>
                  <th>Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {content.map(item => (
                  <tr key={item._id} className={item.reportCount > 0 ? 'reported-content' : ''}>
                    <td className="user-cell">
                      {item.user ? (
                        <>
                          <img 
                            src={item.user.profileImage || '/images/profile-placeholder.png'} 
                            alt={item.user.name} 
                            className="user-avatar-small" 
                          />
                          <span>{item.user.name}</span>
                        </>
                      ) : item.sender ? (
                        <>
                          <img 
                            src={item.sender.profileImage || '/images/profile-placeholder.png'} 
                            alt={item.sender.name} 
                            className="user-avatar-small" 
                          />
                          <span>{item.sender.name}</span>
                        </>
                      ) : (
                        <span>Unknown User</span>
                      )}
                    </td>
                    <td className="content-cell">
                      <div className="content-preview" onClick={() => setSelectedContent(item)}>
                        {filters.type === 'post' && (
                          <>
                            <h4>{item.title || 'Untitled Post'}</h4>
                            <p>{formatContent(item)}</p>
                          </>
                        )}
                        
                        {filters.type === 'comment' && (
                          <p>{formatContent(item)}</p>
                        )}
                        
                        {filters.type === 'message' && (
                          <p>{formatContent(item)}</p>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      {item.reportCount > 0 ? (
                        <span className="report-count">{item.reportCount}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          onClick={() => {
                            const reason = prompt('Enter reason for deletion:', 'Violation of community guidelines');
                            if (reason !== null) {
                              handleContentAction(item._id, 'delete', reason);
                            }
                          }} 
                          className="delete-button"
                        >
                          Delete
                        </button>
                        
                        <button 
                          onClick={() => {
                            const reason = prompt('Enter warning reason:', 'Inappropriate content');
                            if (reason !== null) {
                              handleContentAction(item._id, 'warn', reason);
                            }
                          }}
                          className="warn-button"
                        >
                          Warn User
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
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
          
          {/* Content Details Modal */}
          {selectedContent && (
            <div className="content-details-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Content Details</h3>
                  <button 
                    onClick={() => setSelectedContent(null)} 
                    className="close-modal-button"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="user-profile-header">
                    {selectedContent.user ? (
                      <>
                        <img 
                          src={selectedContent.user.profileImage || '/images/profile-placeholder.png'} 
                          alt={selectedContent.user.name} 
                          className="user-avatar-medium" 
                        />
                        <div className="user-info">
                          <h4>{selectedContent.user.name}</h4>
                          <p>{selectedContent.user.email}</p>
                        </div>
                      </>
                    ) : selectedContent.sender ? (
                      <>
                        <img 
                          src={selectedContent.sender.profileImage || '/images/profile-placeholder.png'} 
                          alt={selectedContent.sender.name} 
                          className="user-avatar-medium" 
                        />
                        <div className="user-info">
                          <h4>{selectedContent.sender.name}</h4>
                          <p>{selectedContent.sender.email}</p>
                        </div>
                      </>
                    ) : (
                      <div className="user-info">
                        <h4>Unknown User</h4>
                      </div>
                    )}
                  </div>
                  
                  <div className="content-details">
                    {filters.type === 'post' && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Title:</span>
                          <span className="detail-value">{selectedContent.title || 'Untitled Post'}</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Content:</span>
                          <div className="detail-value content-text">{selectedContent.content}</div>
                        </div>
                        
                        {selectedContent.mediaUrl && (
                          <div className="detail-item">
                            <span className="detail-label">Media:</span>
                            <div className="detail-value">
                              {selectedContent.mediaType === 'image' ? (
                                <img 
                                  src={selectedContent.mediaUrl} 
                                  alt="Post media" 
                                  className="content-media" 
                                />
                              ) : (
                                <video 
                                  src={selectedContent.mediaUrl} 
                                  controls 
                                  className="content-media"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {filters.type === 'comment' && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Comment:</span>
                          <div className="detail-value content-text">{selectedContent.content}</div>
                        </div>
                        
                        {selectedContent.postContent && (
                          <div className="detail-item">
                            <span className="detail-label">On Post:</span>
                            <div className="detail-value content-text">{selectedContent.postContent}</div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {filters.type === 'message' && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Message:</span>
                          <div className="detail-value content-text">{selectedContent.content}</div>
                        </div>
                        
                        {selectedContent.recipient && (
                          <div className="detail-item">
                            <span className="detail-label">To:</span>
                            <div className="detail-value">{selectedContent.recipient.name}</div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{formatDate(selectedContent.createdAt)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Reports:</span>
                      <span className="detail-value">{selectedContent.reportCount || 0}</span>
                    </div>
                  </div>
                  
                  <div className="moderation-actions">
                    <h4>Moderation Actions</h4>
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          const reason = prompt('Enter reason for deletion:', 'Violation of community guidelines');
                          if (reason !== null) {
                            handleContentAction(selectedContent._id, 'delete', reason);
                          }
                        }} 
                        className="delete-button"
                      >
                        Delete Content
                      </button>
                      
                      <button 
                        onClick={() => {
                          const reason = prompt('Enter warning reason:', 'Inappropriate content');
                          if (reason !== null) {
                            handleContentAction(selectedContent._id, 'warn', reason);
                          }
                        }}
                        className="warn-button"
                      >
                        Warn User
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to ban this user?')) {
                            const userId = selectedContent.user?._id || selectedContent.sender?._id;
                            if (userId) {
                              handleContentAction(userId, 'ban', 'Multiple violations');
                            } else {
                              alert('Could not identify user to ban');
                            }
                          }
                        }}
                        className="ban-button"
                      >
                        Ban User
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
        .content-tab {
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
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 200px;
        }
        
        .filter-select, .filter-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .filter-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .apply-button, .reset-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .apply-button {
          background-color: #3b82f6;
          color: white;
        }
        
        .reset-button {
          background-color: #9ca3af;
          color: white;
        }
        
        .content-container {
          position: relative;
        }
        
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .admin-table th, .admin-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .admin-table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        .user-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .user-avatar-small {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .user-avatar-medium {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .content-preview {
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .content-preview:hover {
          background-color: #f3f4f6;
        }
        
        .content-preview h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
        }
        
        .content-preview p {
          margin: 0;
          color: #4b5563;
        }
        
        .report-count {
          display: inline-block;
          background-color: #ef4444;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .reported-content {
          background-color: #fee2e2;
        }
        
        .actions-cell {
          white-space: nowrap;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .delete-button, .warn-button, .ban-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .delete-button {
          background-color: #ef4444;
          color: white;
        }
        
        .warn-button {
          background-color: #f59e0b;
          color: white;
        }
        
        .ban-button {
          background-color: #7f1d1d;
          color: white;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 10px;
        }
        
        .pagination-button {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background-color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-info {
          font-size: 14px;
        }
        
        .content-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
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
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 20px;
        }
        
        .close-modal-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .user-profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .user-info h4 {
          margin: 0 0 4px 0;
          font-size: 18px;
        }
        
        .user-info p {
          margin: 0;
          color: #6b7280;
        }
        
        .content-details {
          margin-bottom: 20px;
        }
        
        .detail-item {
          margin-bottom: 12px;
        }
        
        .detail-label {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
          color: #4b5563;
        }
        
        .content-text {
          white-space: pre-wrap;
          background-color: #f9fafb;
          padding: 12px;
          border-radius: 4px;
          font-family: inherit;
        }
        
        .content-media {
          max-width: 100%;
          max-height: 300px;
          border-radius: 4px;
        }
        
        .moderation-actions {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        .moderation-actions h4 {
          margin-top: 0;
          margin-bottom: 12px;
        }
        
        .loading-container, .error-container, .no-content {
          padding: 40px;
          text-align: center;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .retry-button {
          margin-top: 10px;
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ContentTab;
