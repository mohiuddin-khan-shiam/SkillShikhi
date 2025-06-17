'use client';

import { useState, useEffect } from 'react';

/**
 * Form to request a skill session with a user
 */
const SessionRequestForm = ({ user, onCancel, onSubmit, loading, success, error }) => {
  const [formData, setFormData] = useState({
    skill: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    skill: '',
    date: ''
  });
  const [minDate, setMinDate] = useState('');
  
  // Set minimum date to today
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setMinDate(formattedDate);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear relevant validation errors
    if (name === 'skill' && validationErrors.skill) {
      setValidationErrors(prev => ({ ...prev, skill: '' }));
    } else if ((name === 'preferredDate' || name === 'preferredTime') && validationErrors.date) {
      setValidationErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { skill: '', date: '' };
    let isValid = true;
    
    // Validate skill field
    if (!formData.skill.trim()) {
      newErrors.skill = 'Please enter a skill you want to learn';
      isValid = false;
    } else if (formData.skill.length > 100) {
      newErrors.skill = 'Skill name must be 100 characters or less';
      isValid = false;
    }
    
    // Validate date if provided
    if (formData.preferredDate) {
      const dateObj = new Date(formData.preferredDate);
      if (formData.preferredTime) {
        const [hours, minutes] = formData.preferredTime.split(':');
        dateObj.setHours(parseInt(hours, 10));
        dateObj.setMinutes(parseInt(minutes, 10));
      } else {
        // Set default time to current time if not provided
        const now = new Date();
        dateObj.setHours(now.getHours(), now.getMinutes());
      }
      
      if (dateObj < new Date()) {
        newErrors.date = 'Please select a future date and time';
        isValid = false;
      }
    }
    
    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format data and submit
    let formattedDate = null;
    if (formData.preferredDate) {
      const dateObj = new Date(formData.preferredDate);
      if (formData.preferredTime) {
        const [hours, minutes] = formData.preferredTime.split(':');
        dateObj.setHours(parseInt(hours, 10));
        dateObj.setMinutes(parseInt(minutes, 10));
      }
      formattedDate = dateObj.toISOString();
    }
    
    onSubmit({
      toUserId: user.id,
      skill: formData.skill,
      preferredDate: formattedDate
    });
  };

  if (success) {
    return (
      <div className="request-form success-state p-4 bg-light rounded-3 text-center" role="alert" aria-live="polite">
        <div className="success-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px', fontSize: '32px' }}>
          <i className="bi bi-check-lg" aria-hidden="true"></i>
        </div>
        <h3 className="mb-3">Request Sent Successfully!</h3>
        <p className="mb-4">You will be notified when {user.name} responds to your request.</p>
        <button 
          onClick={onCancel} 
          className="btn btn-outline-secondary px-4"
          aria-label="Close form"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="request-form p-4 bg-white rounded shadow-sm">
      <div className="form-header d-flex justify-content-between align-items-center mb-4">
        <h3 className="m-0 fs-4">Request a Session with {user.name}</h3>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onCancel}
          aria-label="Close"
        ></button>
      </div>
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
          <div>{error}</div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} aria-label="Session request form">
        <div className="mb-3">
          <label htmlFor="skill" className="form-label">Skill you want to learn <span className="text-danger">*</span></label>
          <input
            id="skill"
            name="skill"
            type="text"
            value={formData.skill}
            onChange={handleChange}
            placeholder="Enter skill name"
            className={`form-control ${validationErrors.skill ? 'is-invalid' : ''}`}
            aria-describedby="skillFeedback"
            required
          />
          {validationErrors.skill && (
            <div id="skillFeedback" className="invalid-feedback">
              {validationErrors.skill}
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <label htmlFor="preferredDate" className="form-label">Preferred Date (optional):</label>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            value={formData.preferredDate}
            onChange={handleChange}
            min={minDate}
            className={`form-control ${validationErrors.date ? 'is-invalid' : ''}`}
            aria-describedby="dateFeedback"
          />
          <div id="preferredDateHelp" className="form-text">Select a date for your learning session</div>
        </div>
        
        {formData.preferredDate && (
          <div className="mb-3">
            <label htmlFor="preferredTime" className="form-label">Preferred Time (optional):</label>
            <input
              id="preferredTime"
              name="preferredTime"
              type="time"
              value={formData.preferredTime}
              onChange={handleChange}
              className={`form-control ${validationErrors.date ? 'is-invalid' : ''}`}
            />
            {validationErrors.date && (
              <div id="dateFeedback" className="invalid-feedback">
                {validationErrors.date}
              </div>
            )}
          </div>
        )}
        
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button 
            type="button" 
            className="btn btn-outline-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary px-4 d-flex align-items-center justify-content-center" 
            disabled={loading}
            style={{ minWidth: '120px' }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span>Sending...</span>
              </>
            ) : 'Send Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionRequestForm;