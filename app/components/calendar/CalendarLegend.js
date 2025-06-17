'use client';

const CalendarLegend = () => {
  return (
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
  );
};

export default CalendarLegend; 