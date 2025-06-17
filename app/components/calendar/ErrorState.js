'use client';

const ErrorState = ({ error }) => {
  return (
    <div className="error-message">
      <strong>Error: </strong>
      <span>{error}</span>
    </div>
  );
};

export default ErrorState; 