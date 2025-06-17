'use client';

import { useState } from 'react';

function ReportModalHeader({ userName, onClose }) {
  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-danger text-white rounded-top">
      <h5 className="modal-title fw-semibold mb-0">Report User: {userName}</h5>
      <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
    </div>
  );
}

function ReportSuccessMessage() {
  return (
    <div className="p-4 text-center text-success fw-medium">
      <p>Report submitted successfully. Thank you for helping keep our community safe.</p>
    </div>
  );
}

function ReportErrorMessage({ message }) {
  return (
    <p className="text-danger mb-3 fw-medium">{message}</p>
  );
}

function ReportForm({
  reason,
  setReason,
  details,
  setDetails,
  isSubmitting,
  handleSubmit,
  submitError,
  onClose
}) {
  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="mb-3">
        <label htmlFor="reason" className="form-label fw-semibold">Reason for Report</label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="form-select"
        >
          <option value="">Select a reason</option>
          <option value="inappropriate_content">Inappropriate Content</option>
          <option value="harassment">Harassment</option>
          <option value="spam">Spam</option>
          <option value="false_information">False Information</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="details" className="form-label fw-semibold">Details</label>
        <textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Please provide specific details about the issue..."
          required
          rows={4}
          className="form-control"
        />
      </div>
      {submitError && <ReportErrorMessage message={submitError} />}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-danger"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
}

const ReportModal = ({ isOpen, onClose, userId, userName }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUserId: userId,
          reason,
          details
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      setSubmitSuccess(true);
      setReason('');
      setDetails('');
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content shadow rounded-3">
          <ReportModalHeader userName={userName} onClose={onClose} />
          {submitSuccess ? (
            <ReportSuccessMessage />
          ) : (
            <ReportForm
              reason={reason}
              setReason={setReason}
              details={details}
              setDetails={setDetails}
              isSubmitting={isSubmitting}
              handleSubmit={handleSubmit}
              submitError={submitError}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;