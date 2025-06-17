'use client';

import { useEffect, useState, useMemo } from 'react';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import './Calendar.css';
import SessionDetailsPanel from './calendar/SessionDetailsPanel';
import SessionsApi from './calendar/SessionsApi';
import CalendarHeader from './calendar/CalendarHeader';
import LoadingState from './calendar/LoadingState';
import ErrorState from './calendar/ErrorState';
import EmptyState from './calendar/EmptyState';
import CalendarView from './calendar/CalendarView';
import { sessionsToCalendarEvents, getEventStyle } from './calendar/CalendarUtils';

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

export default function Calendar() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allSessions = await SessionsApi.fetchAllSessions();
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
    return sessionsToCalendarEvents(sessions);
  }, [sessions]);

  const handleSelectEvent = (event) => {
    setSelectedSession(event.resource);
    setShowSessionDetails(true);
  };

  // Navigation handlers
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  // View change handler
  const handleViewChange = (newView) => {
    setView(newView);
  };
  
  // Close session details
  const handleCloseSessionDetails = () => {
    setShowSessionDetails(false);
    setSelectedSession(null);
  };

  return (
    <div className="calendar-container">
      <CalendarHeader />
      
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : calendarEvents.length === 0 ? (
        <EmptyState />
      ) : (
        <CalendarView
          localizer={localizer}
          events={calendarEvents}
          view={view}
          date={date}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          eventStyleGetter={getEventStyle}
        />
      )}
      
      {showSessionDetails && selectedSession && (
        <SessionDetailsPanel
          session={selectedSession}
          onClose={handleCloseSessionDetails}
        />
      )}
    </div>
  );
} 