'use client';

import { useState, useEffect } from 'react';

const ReportModal = ({ isOpen, onClose, userId, userName }) => {
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReportSuccess(false);
      setReportReason('');
      setReportDetails('');
      setErrorMessage('');
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reportReason) {
      setErrorMessage('Please select a reason for your report.');
      return;
    }

    setReportSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('You must be logged in to submit a report.');
        setReportSubmitting(false);
        return;
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportedUserId: userId,
          reason: reportReason,
          details: reportDetails
        })
      });

      if (response.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          onClose();
          setReportSuccess(false);
          setReportReason('');
          setReportDetails('');
          setErrorMessage('');
        }, 2200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || 'Unable to submit report at this time.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrorMessage('A network error occurred while submitting your report. Please try again.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xl text-rose-400">🛡️</span>
            <h3 id="report-modal-title" className="text-lg font-bold text-gray-100">
              Report User: <span className="text-rose-400">{userName || 'Member'}</span>
            </h3>
          </div>
          <button
            onClick={() => {
              onClose();
              setReportSuccess(false);
              setReportReason('');
              setReportDetails('');
              setErrorMessage('');
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {reportSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/30">
              ✓
            </div>
            <h4 className="text-xl font-bold text-white">Report Submitted</h4>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Thank you for keeping SkillShikhi safe. Our moderation team reviews every incident promptly.
            </p>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleReportSubmit}>
            {errorMessage && (
              <div className="p-3 text-sm bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="report-reason" className="block text-sm font-medium text-gray-300 mb-1.5">
                Reason for report <span className="text-rose-400">*</span>
              </label>
              <select
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <option value="">Select a reason</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="spam">Spam or Misleading Links</option>
                <option value="impersonation">Impersonation or False Credentials</option>
                <option value="other">Other Community Guideline Violation</option>
              </select>
            </div>

            <div>
              <label htmlFor="report-details" className="block text-sm font-medium text-gray-300 mb-1.5">
                Additional context <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <textarea
                id="report-details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe what occurred, timestamp, or any relevant details..."
                rows={4}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportSubmitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-2"
              >
                {reportSubmitting ? (
                  <>
                    <span className="animate-spin inline-block">⟳</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
