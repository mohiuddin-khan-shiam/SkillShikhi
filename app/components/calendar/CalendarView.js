'use client';

import { Calendar as BigCalendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CalendarLegend from './CalendarLegend';
import CustomToolbar from './Toolbar';

const CalendarView = ({ 
  localizer, 
  events, 
  view, 
  date, 
  onNavigate, 
  onView,
  onSelectEvent,
  eventStyleGetter 
}) => {
  return (
    <div className="calendar-view">
      <CalendarLegend />
      
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        view={view}
        views={['month', 'week', 'day']}
        date={date}
        onNavigate={onNavigate}
        onView={onView}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        popup
        components={{
          toolbar: CustomToolbar
        }}
      />
    </div>
  );
};

export default CalendarView; 