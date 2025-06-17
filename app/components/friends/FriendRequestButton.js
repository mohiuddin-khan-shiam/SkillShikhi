'use client';

import { useState, useEffect } from 'react';
import { friendButtonStyles } from '../styles/buttonStyles';
import {
  checkFriendStatus,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  unfriend
} from './FriendRequestManager';

/**
 * A button component for handling friend requests and relationships
 */
const FriendRequestButton = ({ userId, targetUserId, onStatusChange }) => {
  // Use targetUserId if provided, otherwise use userId
  const effectiveUserId = targetUserId || userId;

  const [status, setStatus] = useState('loading');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [showUnfriendOption, setShowUnfriendOption] = useState(false);

  // Check friend status on component mount
  useEffect(() => {
    const fetchFriendStatus = async () => {
      const result = await checkFriendStatus(effectiveUserId);
      setStatus(result.status);
      if (result.requestData) {
        setRequestData(result.requestData);
      }
    };

    fetchFriendStatus();
  }, [effectiveUserId]);

  // Handler for sending a friend request
  const handleSendRequest = async () => {
    setLoading(true);
    
    const result = await sendFriendRequest(effectiveUserId);
    
    if (result.success) {
      setStatus('sent');
      setRequestData(result.data.request);
      setPopupMessage('Friend request sent!');
      setShowPopup(true);
      if (onStatusChange) onStatusChange('sent');
    } else {
      setPopupMessage(`Error: ${result.error}`);
      setShowPopup(true);
    }
    
    setLoading(false);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // Handler for canceling a friend request
  const handleCancelRequest = async () => {
    if (!requestData || !requestData._id) {
      setPopupMessage('Cannot cancel request: missing request data');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setLoading(true);
    
    const result = await cancelFriendRequest(requestData._id);
    
    if (result.success) {
      setStatus('send');
      setRequestData(null);
      setPopupMessage('Friend request canceled');
      setShowPopup(true);
      if (onStatusChange) onStatusChange('send');
    } else {
      setPopupMessage(`Error: ${result.error}`);
      setShowPopup(true);
    }
    
    setLoading(false);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // Handler for accepting a friend request
  const handleAcceptRequest = async () => {
    if (!requestData || !requestData._id) {
      setPopupMessage('Cannot accept request: missing request data');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setLoading(true);
    
    const result = await acceptFriendRequest(requestData._id);
    
    if (result.success) {
      setStatus('friends');
      setRequestData(null);
      setPopupMessage('Friend request accepted!');
      setShowPopup(true);
      if (onStatusChange) onStatusChange('friends');
    } else {
      setPopupMessage(`Error: ${result.error}`);
      setShowPopup(true);
    }
    
    setLoading(false);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // Handler for unfriending a user
  const handleUnfriend = async () => {
    setLoading(true);
    
    const result = await unfriend(effectiveUserId);
    
    if (result.success) {
      setStatus('send');
      setShowUnfriendOption(false);
      setPopupMessage('Friend removed');
      setShowPopup(true);
      if (onStatusChange) onStatusChange('send');
    } else {
      setPopupMessage(`Error: ${result.error}`);
      setShowPopup(true);
    }
    
    setLoading(false);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // Render popup message for notifications
  const renderPopupMessage = () => {
    if (!showPopup) return null;
    
    return (
      <div className="popup-message">
        <span>{popupMessage}</span>
        <button className="popup-close" onClick={() => setShowPopup(false)}>
          &times;
        </button>
      </div>
    );
  };

  // Determine which button to render based on status
  const renderButton = () => {
    if (loading) {
      return (
        <button style={friendButtonStyles.loading} disabled>
          Loading...
        </button>
      );
    }

    if (status === 'friends') {
      return (
        <div>
          <button 
            style={friendButtonStyles.friends} 
            onClick={() => setShowUnfriendOption(!showUnfriendOption)}
          >
            Friends
          </button>
          
          {showUnfriendOption && (
            <div className="unfriend-confirm">
              <p>Remove this friend?</p>
              <div className="unfriend-actions">
                <button onClick={handleUnfriend} className="unfriend-yes">Yes</button>
                <button onClick={() => setShowUnfriendOption(false)} className="unfriend-no">
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (status === 'sent') {
      return (
        <button 
          style={friendButtonStyles.sent} 
          onClick={handleCancelRequest}
        >
          Cancel Request
        </button>
      );
    }

    if (status === 'received') {
      return (
        <button 
          style={friendButtonStyles.accept} 
          onClick={handleAcceptRequest}
        >
          Accept Request
        </button>
      );
    }

    return (
      <button 
        style={friendButtonStyles.send} 
        onClick={handleSendRequest}
      >
        Add Friend
      </button>
    );
  };

  return (
    <div className="friend-request-container">
      {renderButton()}
      {renderPopupMessage()}
    </div>
  );
};

export default FriendRequestButton; 