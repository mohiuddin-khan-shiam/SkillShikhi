'use client';

import { useState, useRef, useEffect } from 'react';

const AddSkillForm = ({ onAddSkill, isAdding }) => {
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef(null);
  const MAX_CHARS = 50; // Maximum characters allowed

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update character count when skill input changes
  useEffect(() => {
    setCharCount(newSkill.length);
    if (newSkill.trim() && error) {
      setError('');
    }
  }, [newSkill, error]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setNewSkill(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) {
      setError('Please enter a skill');
      return;
    }
    
    if (newSkill.length > MAX_CHARS) {
      setError(`Skill name must be ${MAX_CHARS} characters or less`);
      return;
    }
    
    onAddSkill(newSkill);
    setNewSkill('');
    setError('');
    setCharCount(0);
    
    // Return focus to input after submission
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="form-group mb-2">
        <label htmlFor="skillInput" className="form-label visually-hidden">Add a skill you've mastered</label>
        <div className="input-group has-validation">
          <input
            id="skillInput"
            ref={inputRef}
            type="text"
            value={newSkill}
            onChange={handleChange}
            placeholder="Add a skill you've mastered"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            disabled={isAdding}
            aria-describedby={error ? 'skillInputFeedback' : 'skillInputHelp'}
            maxLength={MAX_CHARS}
          />
          <button
            type="submit"
            className="btn btn-primary d-flex align-items-center justify-content-center"
            disabled={isAdding}
            aria-label="Add skill"
            style={{ minWidth: '46px' }}
          >
            {isAdding ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
              </svg>
            )}
          </button>
          {error && (
            <div id="skillInputFeedback" className="invalid-feedback">{error}</div>
          )}
        </div>
        <div id="skillInputHelp" className="form-text d-flex justify-content-between align-items-center mt-1">
          <small>Add a specific skill that you can teach others</small>
          <small className={charCount > MAX_CHARS * 0.8 ? 'text-danger' : 'text-muted'}>{charCount}/{MAX_CHARS}</small>
        </div>
      </div>
    </form>
  );
};

export default AddSkillForm;