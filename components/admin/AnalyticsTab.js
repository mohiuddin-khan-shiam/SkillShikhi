'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';

const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [exportFormat, setExportFormat] = useState('json');
  const [exportInProgress, setExportInProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch analytics data
  const fetchAnalytics = async (refresh = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      params.append('format', exportFormat);
      
      if (refresh) {
        params.append('refresh', 'true');
        setRefreshing(true);
      }
      
      const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      if (['csv', 'pdf', 'excel'].includes(exportFormat)) {
        // Handle file download
        setExportInProgress(true);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange.startDate}-to-${dateRange.endDate}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Reset to JSON format after download
        setExportFormat('json');
        setExportInProgress(false);
      } else {
        // Handle JSON response
        const data = await response.json();
        setAnalytics(data.analytics || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Generate analytics for a specific date
  const generateAnalytics = async (date) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate analytics');
      }
      
      // Refresh analytics data
      fetchAnalytics();
      
      alert('Analytics generated successfully');
    } catch (error) {
      console.error('Error generating analytics:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply date range
  const applyDateRange = () => {
    // Validate date range
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    
    if (start > end) {
      alert('Start date cannot be after end date');
      return;
    }
    
    // Force refresh with new date range
    fetchAnalytics(true);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (!previous) return null;
    const percentChange = ((current - previous) / previous) * 100;
    return percentChange.toFixed(2);
  };
  
  // Load analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  // Render loading state
  if (loading && !analytics.length) {
    return (
      <div className="loading-container">
        <p>Loading analytics data...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => fetchAnalytics()} className="retry-button">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="analytics-tab">
      <div className="tab-header">
        <h2>Platform Analytics</h2>
        <div className="controls-section">
          <div className="date-range-controls">
            <div className="date-input-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="date-input"
              />
            </div>
            
            <div className="date-input-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="date-input"
              />
            </div>
            
            <button onClick={applyDateRange} className="apply-button">
              Apply
            </button>
          </div>
          
          <div className="action-buttons">
            <div className="export-controls">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="export-select"
                disabled={exportInProgress}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              
              <button 
                onClick={() => fetchAnalytics()} 
                className="export-button"
                disabled={exportFormat === 'json'}
              >
                Export
              </button>
            </div>
            
            <button 
              onClick={() => fetchAnalytics(true)} 
              className="refresh-button"
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            
            <button 
              onClick={() => generateAnalytics(new Date().toISOString().split('T')[0])} 
              className="generate-button"
            >
              Generate Today's Analytics
            </button>
          </div>
        </div>
      </div>
      
      {analytics.length === 0 ? (
        <div className="empty-state">
          <p>No analytics data available for the selected date range.</p>
        </div>
      ) : (
        <div className="analytics-container">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Daily Active Users</h3>
              <div className="card-content">
                <div className="metric-value">
                  {analytics[0].dailyActiveUsers}
                </div>
                {analytics.length > 1 && (
                  <div className={`trend ${calculateTrend(analytics[0].dailyActiveUsers, analytics[1].dailyActiveUsers) > 0 ? 'positive' : 'negative'}`}>
                    {calculateTrend(analytics[0].dailyActiveUsers, analytics[1].dailyActiveUsers)}%
                  </div>
                )}
              </div>
              <p className="metric-date">{formatDate(analytics[0].date)}</p>
            </div>
            
            <div className="summary-card">
              <h3>New Users</h3>
              <div className="card-content">
                <div className="metric-value">
                  {analytics[0].newUsers}
                </div>
                {analytics.length > 1 && (
                  <div className={`trend ${calculateTrend(analytics[0].newUsers, analytics[1].newUsers) > 0 ? 'positive' : 'negative'}`}>
                    {calculateTrend(analytics[0].newUsers, analytics[1].newUsers)}%
                  </div>
                )}
              </div>
              <p className="metric-date">{formatDate(analytics[0].date)}</p>
            </div>
            
            <div className="summary-card">
              <h3>Total Sessions</h3>
              <div className="card-content">
                <div className="metric-value">
                  {analytics[0].totalSessions}
                </div>
                {analytics.length > 1 && (
                  <div className={`trend ${calculateTrend(analytics[0].totalSessions, analytics[1].totalSessions) > 0 ? 'positive' : 'negative'}`}>
                    {calculateTrend(analytics[0].totalSessions, analytics[1].totalSessions)}%
                  </div>
                )}
              </div>
              <p className="metric-date">{formatDate(analytics[0].date)}</p>
            </div>
            
            <div className="summary-card">
              <h3>Avg. Session Duration</h3>
              <div className="card-content">
                <div className="metric-value">
                  {analytics[0].averageSessionDuration}s
                </div>
                {analytics.length > 1 && (
                  <div className={`trend ${calculateTrend(analytics[0].averageSessionDuration, analytics[1].averageSessionDuration) > 0 ? 'positive' : 'negative'}`}>
                    {calculateTrend(analytics[0].averageSessionDuration, analytics[1].averageSessionDuration)}%
                  </div>
                )}
              </div>
              <p className="metric-date">{formatDate(analytics[0].date)}</p>
            </div>
          </div>
          
          {/* Moderation Metrics */}
          <div className="metrics-section">
            <h3>Moderation Metrics</h3>
            <div className="metrics-cards">
              <div className="metric-card">
                <div className="metric-title">Reports</div>
                <div className="metric-value">{analytics[0].totalReports}</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-title">Content Moderated</div>
                <div className="metric-value">{analytics[0].contentModerated}</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-title">Users Banned</div>
                <div className="metric-value">{analytics[0].usersBanned}</div>
              </div>
            </div>
          </div>
          
          {/* User Activity */}
          <div className="activity-section">
            <div className="activity-column">
              <h3>Most Active Users</h3>
              {analytics[0].mostActiveUsers && analytics[0].mostActiveUsers.length > 0 ? (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Activity Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics[0].mostActiveUsers.map((user, index) => (
                      <tr key={index}>
                        <td>{user.name}</td>
                        <td>{user.activityCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>
            
            <div className="activity-column">
              <h3>Most Reported Users</h3>
              {analytics[0].mostReportedUsers && analytics[0].mostReportedUsers.length > 0 ? (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Report Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics[0].mostReportedUsers.map((user, index) => (
                      <tr key={index}>
                        <td>{user.name}</td>
                        <td>{user.reportCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>
          </div>
          
          {/* Historical Data */}
          <div className="historical-section">
            <h3>Historical Data</h3>
            <table className="historical-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Active Users</th>
                  <th>New Users</th>
                  <th>Sessions</th>
                  <th>Reports</th>
                  <th>Content Moderated</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((day, index) => (
                  <tr key={index}>
                    <td>{formatDate(day.date)}</td>
                    <td>{day.dailyActiveUsers}</td>
                    <td>{day.newUsers}</td>
                    <td>{day.totalSessions}</td>
                    <td>{day.totalReports}</td>
                    <td>{day.contentModerated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .analytics-tab {
          width: 100%;
        }
        
        .controls-section {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
          justify-content: space-between;
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
        }
        
        .date-range-controls {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        
        .date-input-group {
          display: flex;
          flex-direction: column;
        }
        
        .date-input {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        
        .apply-button, .refresh-button, .generate-button, .export-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .apply-button {
          background-color: #3b82f6;
          color: white;
        }
        
        .refresh-button {
          background-color: #10b981;
          color: white;
        }
        
        .generate-button {
          background-color: #8b5cf6;
          color: white;
        }
        
        .export-controls {
          display: flex;
          gap: 5px;
        }
        
        .export-select {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        
        .export-button {
          background-color: #6b7280;
          color: white;
        }
        
        .export-button:disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .summary-card h3 {
          margin-top: 0;
          color: #4b5563;
          font-size: 16px;
        }
        
        .card-content {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        
        .metric-value {
          font-size: 28px;
          font-weight: 600;
          color: #111827;
        }
        
        .trend {
          font-size: 14px;
          font-weight: 500;
        }
        
        .trend.positive {
          color: #10b981;
        }
        
        .trend.negative {
          color: #ef4444;
        }
        
        .metric-date {
          margin-top: 10px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .metrics-section {
          margin-bottom: 30px;
        }
        
        .metrics-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 15px;
        }
        
        .metric-card {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        
        .metric-title {
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 5px;
        }
        
        .activity-section {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .activity-table, .historical-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .activity-table th, .activity-table td,
        .historical-table th, .historical-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .activity-table th, .historical-table th {
          background-color: #f9fafb;
          font-weight: 500;
        }
        
        .no-data {
          color: #6b7280;
          font-style: italic;
        }
        
        .historical-section {
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsTab;
