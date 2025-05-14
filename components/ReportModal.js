'use client';

import { useState, useEffect } from 'react';

const ReportModal = ({ isOpen, onClose, userId, userName }) => {
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    
    // Use useEffect for cleanup when modal closes
    useEffect(() => {
        // Reset form when modal is closed
        if (!isOpen) {
            setReportSuccess(false);
            setReportReason('');
            setReportDetails('');
        }
        
        // Prevent body scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // Cleanup function
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Function to handle report submission
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        
        if (!reportReason) {
            alert('Please select a reason for your report');
            return;
        }
        
        setReportSubmitting(true);
        
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            if (!token) {
                alert('You must be logged in to submit a report');
                setReportSubmitting(false);
                return;
            }
            
            // Submit report to API
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
                // Reset form after 3 seconds
                setTimeout(() => {
                    onClose();
                    setReportSuccess(false);
                    setReportReason('');
                    setReportDetails('');
                }, 3000);
            } else {
                const errorData = await response.json();
                alert(`Error submitting report: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('An error occurred while submitting your report. Please try again.');
        } finally {
            setReportSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="report-modal-overlay">
            <div className="report-modal">
                <div className="report-modal-header">
                    <h3>Report User: {userName}</h3>
                    <button 
                        className="close-modal-button"
                        onClick={() => {
                            onClose();
                            setReportSuccess(false);
                            setReportReason('');
                            setReportDetails('');
                        }}
                    >
                        &times;
                    </button>
                </div>
                
                <div className="report-modal-content">
                    {reportSuccess ? (
                        <div className="report-success">
                            <div className="success-icon">✓</div>
                            <h4>Report Submitted Successfully</h4>
                            <p>Thank you for helping keep our community safe. Our team will review this report.</p>
                        </div>
                    ) : (
                        <form className="report-form" onSubmit={handleReportSubmit}>
                            <div className="form-group">
                                <label htmlFor="report-reason">Reason for Report *</label>
                                <select 
                                    id="report-reason"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    <option value="inappropriate_content">Inappropriate Content</option>
                                    <option value="harassment">Harassment or Bullying</option>
                                    <option value="spam">Spam or Misleading</option>
                                    <option value="impersonation">Impersonation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="report-details">Additional Details (Optional)</label>
                                <textarea
                                    id="report-details"
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                    placeholder="Please provide any additional details that will help us understand the issue."
                                    rows={4}
                                ></textarea>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="submit-report-button"
                                disabled={reportSubmitting}
                            >
                                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style jsx>{`
                .report-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .report-modal {
                    background-color: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
                
                .report-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .report-modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #1f2937;
                }
                
                .close-modal-button {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6b7280;
                }
                
                .report-modal-content {
                    padding: 0;
                }
                
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #374151;
                }
                
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }
                
                .form-group textarea {
                    resize: vertical;
                }
                
                .report-form {
                    padding: 20px;
                }
                
                .report-success {
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .success-icon {
                    font-size: 48px;
                    color: #10b981;
                    margin-bottom: 16px;
                }
                
                .report-success h4 {
                    margin: 0 0 10px 0;
                    color: #1f2937;
                    font-size: 18px;
                }
                
                .report-success p {
                    color: #6b7280;
                    margin: 0;
                }
                
                .submit-report-button {
                    background-color: #ef4444;
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 16px;
                }
                
                .submit-report-button:disabled {
                    background-color: #f87171;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ReportModal;
