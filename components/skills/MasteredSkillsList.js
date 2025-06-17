'use client';

import { useState, useEffect, useRef } from 'react';
import SkillTag from './SkillTag';
import AddSkillForm from './AddSkillForm';
import { fetchMasteredSkills, addMasteredSkill, removeMasteredSkill } from './SkillsApi';

export default function MasteredSkillsList({ userId, editable = false }) {
  const [masteredSkills, setMasteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingSkill, setAddingSkill] = useState(false);
  const [removingSkillId, setRemovingSkillId] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const listRef = useRef(null);

  // Hide feedback message after timeout
  useEffect(() => {
    let timer;
    if (feedback.show) {
      timer = setTimeout(() => {
        setFeedback({ show: false, message: '', type: '' });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [feedback.show]);

  // Fetch mastered skills
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const skills = await fetchMasteredSkills(userId);
        setMasteredSkills(skills);
      } catch (error) {
        console.error('Error fetching mastered skills:', error);
        setError('Failed to load skills. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSkills();
  }, [userId]);
  
  // Show feedback message
  const showFeedback = (message, type = 'success') => {
    setFeedback({ show: true, message, type });
  };

  // Add a new mastered skill
  const handleAddSkill = async (skillName) => {
    const formattedSkill = skillName.trim();
    
    if (masteredSkills.some(skill => skill.toLowerCase() === formattedSkill.toLowerCase())) {
      showFeedback('You already have this skill listed', 'warning');
      return;
    }
    
    try {
      setAddingSkill(true);
      await addMasteredSkill(userId, formattedSkill);
      setMasteredSkills([...masteredSkills, formattedSkill]);
      showFeedback(`"${formattedSkill}" added to your skills`);
      
      // Scroll to newly added skill if list exists
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    } catch (error) {
      console.error('Error adding mastered skill:', error);
      showFeedback('Failed to add skill. Please try again.', 'danger');
    } finally {
      setAddingSkill(false);
    }
  };
  
  // Remove a mastered skill
  const handleRemoveSkill = async (skillName) => {
    try {
      setRemovingSkillId(skillName);
      await removeMasteredSkill(userId, skillName);
      setMasteredSkills(masteredSkills.filter(skill => skill !== skillName));
      showFeedback(`"${skillName}" removed from your skills`);
    } catch (error) {
      console.error('Error removing mastered skill:', error);
      showFeedback('Failed to remove skill. Please try again.', 'danger');
    } finally {
      setRemovingSkillId(null);
    }
  };
  
  return (
    <div className="mt-4" aria-live="polite">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fs-4 fw-semibold m-0">Skills I've Mastered</h3>
        {masteredSkills.length > 0 && (
          <span className="badge bg-primary rounded-pill" aria-label="Total skills">
            {masteredSkills.length}
          </span>
        )}
      </div>
      
      {/* Feedback message */}
      {feedback.show && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show mb-3 d-flex align-items-center`} role="alert">
          {feedback.type === 'success' && <i className="bi bi-check-circle-fill me-2" aria-hidden="true"></i>}
          {feedback.type === 'warning' && <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>}
          {feedback.type === 'danger' && <i className="bi bi-x-circle-fill me-2" aria-hidden="true"></i>}
          <div>{feedback.message}</div>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setFeedback({ show: false, message: '', type: '' })}></button>
        </div>
      )}
      
      {loading ? (
        <div className="d-flex justify-content-center my-4" aria-label="Loading skills">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading skills...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
          {error}
        </div>
      ) : editable && (
        <AddSkillForm onAddSkill={handleAddSkill} isAdding={addingSkill} />
      )}
      
      {!loading && !error && masteredSkills.length === 0 ? (
        <div className="card border-light bg-light p-4 text-center">
          <p className="text-secondary mb-0 fst-italic">
            <i className="bi bi-lightbulb me-2" aria-hidden="true"></i>
            No mastered skills yet. {editable && 'Add skills that you can teach others!'}
          </p>
        </div>
      ) : (
        <div ref={listRef} className="d-flex flex-wrap gap-2 mt-3" aria-label="List of mastered skills">
          {masteredSkills.map((skill, index) => (
            <SkillTag 
              key={index}
              skill={skill}
              editable={editable}
              onRemove={handleRemoveSkill}
              removing={removingSkillId === skill}
            />
          ))}
        </div>
      )}
    </div>
  );
} 