'use client';

/**
 * Fetch mastered skills for a user
 * @param {string} userId - User ID (optional, if not provided will fetch current user's skills)
 * @returns {Promise<Array>} Array of mastered skills
 */
export const fetchMasteredSkills = async (userId = null) => {
  const endpoint = userId 
    ? `/api/mastered-skills?userId=${userId}` 
    : '/api/mastered-skills';
  
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch mastered skills');
  }
  
  const data = await response.json();
  return data.masteredSkills || [];
};

/**
 * Add a new mastered skill
 * @param {string} skill - Skill to add
 * @returns {Promise<Array>} Updated array of mastered skills
 */
export const addMasteredSkill = async (skill) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch('/api/mastered-skills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ skill: skill.trim() })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to add skill');
  }
  
  const data = await response.json();
  return data.masteredSkills;
};

/**
 * Remove a mastered skill
 * @param {string} skill - Skill to remove
 * @returns {Promise<Array>} Updated array of mastered skills
 */
export const removeMasteredSkill = async (skill) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
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
    throw new Error(errorText || 'Failed to remove skill');
  }
  
  const data = await response.json();
  return data.masteredSkills;
}; 