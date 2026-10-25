'use client';

import { useState, useEffect } from 'react';
import Toast from './Toast';

export default function MasteredSkillsList({ userId, editable = false }) {
  const [masteredSkills, setMasteredSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(false);
  const [removingSkillId, setRemovingSkillId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchMasteredSkills = async () => {
      try {
        setLoading(true);
        const endpoint = userId 
          ? `/api/mastered-skills?userId=${userId}` 
          : '/api/mastered-skills';
        
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setMasteredSkills(data.masteredSkills || []);
      } catch (error) {
        console.error('Error fetching mastered skills:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMasteredSkills();
  }, [userId]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) {
      showToast('Please enter a skill name', 'error');
      return;
    }
    
    try {
      setAddingSkill(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please log in to add skills', 'error');
        return;
      }
      
      const response = await fetch('/api/mastered-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill: newSkill.trim() })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const data = await response.json();
      setMasteredSkills(data.masteredSkills || []);
      setNewSkill('');
      showToast('Skill added successfully!');
    } catch (error) {
      console.error('Error adding mastered skill:', error);
      showToast(error.message || 'Failed to add skill', 'error');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      setRemovingSkillId(skill);
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please log in to remove skills', 'error');
        return;
      }
      
      const response = await fetch('/api/mastered-skills', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const data = await response.json();
      setMasteredSkills(data.masteredSkills || []);
      showToast('Skill removed successfully');
    } catch (error) {
      console.error('Error removing mastered skill:', error);
      showToast(error.message || 'Failed to remove skill', 'error');
    } finally {
      setRemovingSkillId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin text-indigo-400 text-xl">⟳</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <span>🎯</span> Mastered Skills
        </h3>
        <span className="text-xs text-gray-400 bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700/50">
          {masteredSkills.length} total
        </span>
      </div>

      {editable && (
        <form onSubmit={handleAddSkill} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="e.g. Next.js, PyTorch, GraphQL..."
            className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            disabled={addingSkill}
          />
          <button
            type="submit"
            disabled={addingSkill}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            {addingSkill ? (
              <span className="animate-spin text-base">⟳</span>
            ) : (
              <><span>+</span><span>Add</span></>
            )}
          </button>
        </form>
      )}

      {masteredSkills.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-2">No mastered skills recorded yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {masteredSkills.map((skill, index) => (
            <div
              key={index}
              className="group bg-indigo-950/40 text-indigo-300 border border-indigo-700/40 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 hover:border-indigo-500/60 transition-colors"
            >
              <span>{skill}</span>
              {editable && (
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-gray-400 hover:text-rose-400 focus:outline-none transition-colors text-sm"
                  title="Remove skill"
                >
                  {removingSkillId === skill ? (
                    <span className="animate-spin inline-block">⟳</span>
                  ) : (
                    '×'
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
