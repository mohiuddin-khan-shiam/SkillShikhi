'use client';

import { useCallback } from 'react';
import { format } from 'date-fns';

/**
 * Custom toolbar component for the calendar
 */
const CustomToolbar = ({ date, onNavigate, onView, view }) => {
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

export default CustomToolbar; 