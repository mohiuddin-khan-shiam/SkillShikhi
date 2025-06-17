'use client';

import { format } from 'date-fns';

/**
 * Session details panel that appears when a user clicks on a calendar event
 */
const SessionDetailsPanel = ({ session, onClose }) => {
  if (!session) return null;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP p'); // Date and time
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FCD34D'; // Yellow
      case 'accepted':
        return '#34D399'; // Green
      case 'completed':
        return '#60A5FA'; // Blue
      case 'rejected':
        return '#F87171'; // Red
      case 'cancelled':
        return '#9CA3AF'; // Gray
      default:
        return '#9CA3AF'; // Gray
    }
  };
  
  return (
    <div className="session-detail-panel">
      <div className="detail-header">
        <h3 className="detail-title">Session Details</h3>
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Close session details"
        >
          ×
        </button>
      </div>
      
      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-label">Session With</div>
          <div className="detail-value">
            {session.otherUser ? session.otherUser.name : 'Unknown User'}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Skill</div>
          <div className="detail-value">
            {session.skill || 'Not specified'}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Date/Time</div>
          <div className="detail-value">
            {formatDate(session.preferredDate)}
          </div>
        </div>
        
        <div className="detail-section">
          <div className="detail-label">Status</div>
          <div className="detail-value">
            <span 
              className="status-badge" 
              style={{ 
                backgroundColor: getStatusColor(session.status),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: '500',
                fontSize: '12px',
                textTransform: 'uppercase'
              }}
            >
              {session.status}
            </span>
          </div>
        </div>
        
        {session.notes && (
          <div className="detail-section">
            <div className="detail-label">Notes</div>
            <div className="detail-value">
              {session.notes}
            </div>
          </div>
        )}
      </div>
      
      {(session.status === 'pending' || session.status === 'accepted') && (
        <div className="detail-actions">
          {session.status === 'pending' && (
            <>
              <button className="action-button accept">
                Accept
              </button>
              <button className="action-button reject">
                Decline
              </button>
            </>
          )}
          {session.status === 'accepted' && (
            <button className="action-button cancel">
              Cancel Session
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionDetailsPanel; 