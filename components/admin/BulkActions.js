'use client';

const BulkActions = ({
  selectedCount,
  loading,
  onBulkAction,
  onCancel,
}) => {
  return (
    <div className="bulk-actions">
      <div className="selected-count">
        {selectedCount} {selectedCount === 1 ? 'report' : 'reports'} selected
      </div>
      <div className="bulk-action-buttons">
        <button
          className="bulk-action-button resolve"
          onClick={() => onBulkAction('resolve')}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Processing...
            </>
          ) : (
            <>
              <span className="action-icon">✓</span>
              Resolve All
            </>
          )}
        </button>
        <button
          className="bulk-action-button dismiss"
          onClick={() => onBulkAction('dismiss')}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Processing...
            </>
          ) : (
            <>
              <span className="action-icon">✗</span>
              Dismiss All
            </>
          )}
        </button>
        <button
          className="bulk-action-button cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BulkActions; 