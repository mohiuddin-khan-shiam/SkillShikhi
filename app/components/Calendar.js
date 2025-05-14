'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes, addMonths, subMonths } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import './Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom toolbar component to fix navigation buttons
const CustomToolbar = ({ date, onNavigate, onView, view, views }) => {
  const goToToday = useCallback(() => {
    onNavigate('TODAY');
  }, [onNavigate]);

  const goToBack = useCallback(() => {
    onNavigate('PREV');
  }, [onNavigate]);

  const goToNext = useCallback(() => {
    onNavigate('NEXT');
  }, [onNavigate]);

  const goToMonth = useCallback(() => {
    onView('month');
  }, [onView]);

  const goToWeek = useCallback(() => {
    onView('week');
  }, [onView]);

  const goToDay = useCallback(() => {
    onView('day');
  }, [onView]);

  const currentMonth = format(date, 'MMMM yyyy');

  return (
    <div className="rbc-toolbar">
      <div className="rbc-toolbar-navigation-buttons">
        <button type="button" onClick={goToToday}>Today</button>
        <button type="button" onClick={goToBack}>Back</button>
        <button type="button" onClick={goToNext}>Next</button>
      </div>
      <span className="rbc-toolbar-label">{currentMonth}</span>
      <div className="rbc-toolbar-view-buttons">
        <button type="button" className={view === 'month' ? 'rbc-active' : ''} onClick={goToMonth}>Month</button>
        <button type="button" className={view === 'week' ? 'rbc-active' : ''} onClick={goToWeek}>Week</button>
        <button type="button" className={view === 'day' ? 'rbc-active' : ''} onClick={goToDay}>Day</button>
      </div>
    </div>
  );
};

export default function Calendar() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchAllSessions();
  }, []);

  const fetchAllSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fetch all session types
      const types = ['upcoming', 'pending', 'completed'];
      const sessionResults = await Promise.all(
        types.map(async (type) => {
          const res = await fetch(`/api/sessions?type=${type}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Server returned ${res.status}`);
          }
          
          const data = await res.json();
          return data.sessions || [];
        })
      );
      
      // Combine all sessions
      const allSessions = [].concat(...sessionResults);
      console.log('All sessions fetched:', allSessions.length);
      setSessions(allSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError(error.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert sessions to events for the calendar
  const calendarEvents = useMemo(() => {
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
  }, [sessions]);

  const handleSelectEvent = (event) => {
    setSelectedSession(event.resource);
    setShowSessionDetails(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP p'); // Date and time
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calendar event styling
  const eventStyleGetter = (event) => {
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

  // Navigation handlers
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  // View change handler
  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-header">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Session Calendar
      </h2>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading calendar...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <strong>Error: </strong>
          <span>{error}</span>
        </div>
      ) : calendarEvents.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="empty-state-title">No sessions found</p>
          <p className="empty-state-subtitle">When you schedule sessions, they&apos;ll appear here</p>
        </div>
      ) : (
        <div className="calendar-view">
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#FCD34D' }}></span>
              <span>Pending</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#34D399' }}></span>
              <span>Accepted</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#60A5FA' }}></span>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#F87171' }}></span>
              <span>Rejected</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#9CA3AF' }}></span>
              <span>Cancelled</span>
            </div>
          </div>
          
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            view={view}
            date={date}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            defaultView={Views.MONTH}
            tooltipAccessor={event => `${event.skill} with ${event.otherUser}`}
            components={{
              toolbar: CustomToolbar
            }}
          />
        </div>
      )}
      
      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Session Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSessionDetails(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="session-detail-content">
                <div className="detail-row">
                  <strong>Skill:</strong> {selectedSession.skill}
                </div>
                <div className="detail-row">
                  <strong>With:</strong> {selectedSession.fromUser?.name || selectedSession.toUser?.name || 'User'}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> <span className={`status-pill ${selectedSession.status}`}>{selectedSession.status}</span>
                </div>
                <div className="detail-row">
                  <strong>Date & Time:</strong> {formatDate(selectedSession.preferredDate)}
                </div>
                <div className="detail-row">
                  <strong>Role:</strong> {localStorage.getItem('userId') === (selectedSession.fromUser?._id || selectedSession.fromUser) 
                    ? 'You requested this session' 
                    : 'Requested a session with you'}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn-primary"
                  onClick={() => setShowSessionDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 