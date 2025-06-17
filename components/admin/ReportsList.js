'use client';

import { format } from 'date-fns';

const ReportsList = ({ 
  reports, 
  selectedReports, 
  onSelectReport, 
  onSelectAll, 
  onShowDetails,
  onReportAction
}) => {
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  return (
    <table className="reports-table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              onChange={onSelectAll}
              checked={selectedReports.length === reports.length && reports.length > 0}
            />
          </th>
          <th>Reported User</th>
          <th>Reason</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.map(report => (
          <tr
            key={report._id}
            className={selectedReports.includes(report._id) ? 'selected-row' : ''}
            onClick={() => onShowDetails(report)}
            style={{ cursor: 'pointer' }}
          >
            <td onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selectedReports.includes(report._id)}
                onChange={() => onSelectReport(report._id)}
              />
            </td>
            <td>
              <div className="user-cell">
                {report.reportedUser?.profileImage ? (
                  <img
                    src={report.reportedUser.profileImage}
                    alt={report.reportedUser.name}
                    className="user-avatar-small"
                  />
                ) : (
                  <div className="user-avatar-small"></div>
                )}
                {report.reportedUser?.name || 'Unknown user'}
              </div>
            </td>
            <td>{report.reason}</td>
            <td>{formatDate(report.createdAt)}</td>
            <td>
              <span className={`status-badge ${report.status}`}>
                {report.status}
              </span>
            </td>
            <td onClick={(e) => e.stopPropagation()}>
              {report.status === 'pending' && (
                <>
                  <button
                    className="action-button resolve"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReportAction(report._id, 'resolve');
                    }}
                  >
                    Resolve
                  </button>
                  <button
                    className="action-button dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReportAction(report._id, 'dismiss');
                    }}
                  >
                    Dismiss
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReportsList; 