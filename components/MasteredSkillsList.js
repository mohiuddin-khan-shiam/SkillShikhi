'use client';

import { useState, useEffect } from 'react';
// Removing the react-icons import
// Creating simple replacements for the icons
// Replacing toast with simple alert or console messages

export default function MasteredSkillsList({ userId, editable = false }) {
  const [masteredSkills, setMasteredSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(false);
  const [removingSkillId, setRemovingSkillId] = useState(null);

  // Fetch mastered skills
  useEffect(() => {
    const fetchMasteredSkills = async () => {
      try {
        setLoading(true);
        
        // If userId is provided, fetch that user's skills, otherwise fetch current user's skills
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
          console.error('Failed to fetch mastered skills:', await response.text());
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
  
  // Add a new mastered skill
  const handleAddSkill = async (e) => {
    e.preventDefault();
    
    if (!newSkill.trim()) {
      alert('Please enter a skill');
      return;
    }
    
    try {
      setAddingSkill(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to add skills');
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
      setMasteredSkills(data.masteredSkills);
      setNewSkill('');
      alert('Skill added successfully!');
    } catch (error) {
      console.error('Error adding mastered skill:', error);
      alert('Failed to add skill: ' + (error.message || 'Unknown error'));
    } finally {
      setAddingSkill(false);
    }
  };
  
  // Remove a mastered skill
  const handleRemoveSkill = async (skill) => {
    try {
      setRemovingSkillId(skill);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to remove skills');
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
      setMasteredSkills(data.masteredSkills);
      alert('Skill removed successfully!');
    } catch (error) {
      console.error('Error removing mastered skill:', error);
      alert('Failed to remove skill: ' + (error.message || 'Unknown error'));
    } finally {
      setRemovingSkillId(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin text-blue-500 text-2xl">⟳</div>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Mastered Skills</h3>
      
      {editable && (
        <form onSubmit={handleAddSkill} className="mb-4 flex">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill you've mastered"
            className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={addingSkill}
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white p-2 rounded-r-md flex items-center justify-center ${
              addingSkill ? 'opacity-75' : 'hover:bg-blue-600'
            }`}
            disabled={addingSkill}
          >
            {addingSkill ? <span className="animate-spin">⟳</span> : <span>+</span>}
          </button>
        </form>
      )}
      
      {masteredSkills.length === 0 ? (
        <p className="text-gray-500 italic">No mastered skills yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {masteredSkills.map((skill, index) => (
            <div 
              key={index} 
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
            >
              <span>{skill}</span>
              
              {editable && (
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-800 hover:text-red-600 focus:outline-none"
                  title="Remove skill"
                >
                  {removingSkillId === skill ? (
                    <span className="animate-spin">⟳</span>
                  ) : (
                    <span>×</span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 