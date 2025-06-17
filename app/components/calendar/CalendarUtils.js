'use client';

import { addMinutes } from 'date-fns';

/**
 * Converts session data to calendar event format
 * @param {Array} sessions - Array of session objects
 * @returns {Array} Formatted calendar events
 */
export const sessionsToCalendarEvents = (sessions) => {
  if (!sessions || !Array.isArray(sessions)) {
    return [];
  }
  
  return sessions.map(session => {
    // Default duration to 1 hour if no end time is specified
    const startDate = session.preferredDate ? new Date(session.preferredDate) : new Date();
    const endDate = addMinutes(startDate, 60);
    
    // Get the other user
    const userId = localStorage.getItem('userId');
    const otherUser = session.fromUser?._id === userId
      ? session.toUser
      : session.fromUser;
    
    // Color based on status
    let color;
    switch (session.status) {
      case 'pending':
        color = '#FCD34D'; // Yellow
        break;
      case 'accepted':
        color = '#34D399'; // Green
        break;
      case 'completed':
        color = '#60A5FA'; // Blue
        break;
      case 'rejected':
        color = '#F87171'; // Red
        break;
      case 'cancelled':
        color = '#9CA3AF'; // Gray
        break;
      default:
        color = '#9CA3AF'; // Gray
    }
    
    return {
      id: session._id,
      title: `${session.skill} with ${otherUser?.name || 'User'}`,
      start: startDate,
      end: endDate,
      status: session.status,
      skill: session.skill,
      otherUser: otherUser?.name || 'User',
      backgroundColor: color,
      borderColor: color,
      allDay: false,
      resource: session
    };
  });
};

/**
 * Event style getter for calendar events
 * @param {Object} event - Calendar event
 * @returns {Object} Styles for the event
 */
export const getEventStyle = (event) => {
  return {
    style: {
      backgroundColor: event.backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0',
      display: 'block',
      fontWeight: '600',
    }
  };
}; 