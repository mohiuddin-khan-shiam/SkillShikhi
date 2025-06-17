'use client';

import { format } from 'date-fns';
import ReportsService from './ReportsService';
import { showNotification } from './ReportNotification';

/**
 * Component to display detailed report information
 */
const ReportDetailPanel = ({ report, onClose, onActionCompleted }) => {
  if (!report) return null;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle report action
  const handleAction = async (action) => {
    try {
      await ReportsService.handleReportAction(report._id, action);
      showNotification(`Report ${action === 'resolve' ? 'resolved' : 'dismissed'} successfully`, 'success');
      
      if (onActionCompleted) {
        onActionCompleted();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      showNotification(error.message || `Failed to ${action} report`, 'error', 5000);
    }
  };
  
  return (
    <div className="report-detail-panel">
      <div className="detail-header">
        <h3 className="detail-title">Report Details</h3>
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Close report details"
        >
          ×
        </button>
      </div>
      
      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-label">Reported By</div>
          <div className="detail-value">
            {report.reportedBy?.name || 'Anonymous'}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Reported User</div>
          <div className="detail-value">
            {report.reportedUser?.name || 'Unknown user'}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Reason</div>
          <div className="detail-value">
            {report.reason || 'No reason provided'}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Description</div>
          <div className="detail-value">
            {report.description || 'No description provided'}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Evidence</div>
          <div className="detail-value">
            {report.evidence ? (
              <a href={report.evidence} target="_blank" rel="noopener noreferrer">
                View Evidence
              </a>
            ) : 'No evidence provided'}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Date Reported</div>
          <div className="detail-value">
            {formatDate(report.createdAt)}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Status</div>
          <div className="detail-value">
            <span className={`status-badge ${report.status}`}>
              {report.status}
            </span>
          </div>
        </div>
      </div>
      
      {report.status === 'pending' && (
        <div className="detail-actions">
          <button 
            className="action-button resolve"
            onClick={() => handleAction('resolve')}
          >
            Resolve
          </button>
          <button 
            className="action-button dismiss"
            onClick={() => handleAction('dismiss')}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportDetailPanel; 