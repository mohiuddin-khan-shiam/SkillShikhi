'use client';

const EmptyState = ({ error, onRetry }) => {
  return (
    <div className="text-center py-5 my-4">
      <div className="display-4 mb-3">
        {error ? '⚠️' : '📊'}
      </div>
      <h3 className="mb-3">{error ? 'Error loading reports' : 'No reports found'}</h3>
      <p className="text-secondary mb-4">
        {error 
          ? error 
          : 'There are no reports matching your current filters.'}
      </p>
      {error && (
        <button className="btn btn-outline-primary" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Retry
        </button>
      )}
    </div>
  );
};

export default EmptyState;