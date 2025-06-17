'use client';

import { useState } from 'react';

export default function MasteredSkillsSection({
  masteredSkills,
  masteredSkillsLoading,
  fetchMasteredSkills,
  handleDeleteMasteredSkill,
  handleEditMasteredSkill,
}) {
  const [showMasteredSkillForm, setShowMasteredSkillForm] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [newMasteredSkill, setNewMasteredSkill] = useState({
    name: '',
    description: '',
    experienceYears: 1
  });

  // Handle mastered skill form input changes
  const handleMasteredSkillChange = (e) => {
    const { name, value } = e.target;
    setNewMasteredSkill(prev => ({
      ...prev,
      [name]: name === 'experienceYears' ? parseInt(value) || 0 : value
    }));
  };

  // Submit mastered skill form
  const handleMasteredSkillSubmit = async (e) => {
    e.preventDefault();

    if (!newMasteredSkill.name) {
      alert('Skill name is required!');
      return;
    }

    try {
      console.log('Submitting mastered skill:', newMasteredSkill);

      const token = localStorage.getItem('token');
      const endpoint = '/api/mastered-skills';

      // Prepare the request payload
      const payload = {
        skill: newMasteredSkill.name,
        description: newMasteredSkill.description,
        experienceYears: newMasteredSkill.experienceYears
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log('API response:', responseData);

      if (response.ok) {
        // Reset form
        setNewMasteredSkill({ name: '', description: '', experienceYears: 1 });
        setShowMasteredSkillForm(false);
        setEditingSkillId(null);

        // Refresh the mastered skills list
        fetchMasteredSkills();

        alert(`Successfully ${editingSkillId ? 'updated' : 'added'} mastered skill!`);
      } else {
        alert(`Failed to ${editingSkillId ? 'update' : 'add'} mastered skill: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error with mastered skill:', error);
      alert('Something went wrong with the mastered skill operation.');
    }
  };

   const handleLocalEdit = (skill) => {
    setNewMasteredSkill({
      name: skill.name,
      description: skill.description || '',
      experienceYears: skill.experienceYears || 1
    });
    setEditingSkillId(skill._id);
    setShowMasteredSkillForm(true);
     if(handleEditMasteredSkill) handleEditMasteredSkill(skill); // Call prop if exists
  };



  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-600">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mastered Skills</h2>
        <p className="text-gray-600">Showcase skills you've mastered and want to teach others</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {masteredSkillsLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-gray-600">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-4 border-blue-600 mb-4"></div>
            <p>Loading your mastered skills...</p>
          </div>
        ) : masteredSkills.length > 0 ? (
          masteredSkills.map((skill) => (
            <div key={skill._id || skill.name} className="bg-gray-50 rounded-lg p-5 shadow-sm border-l-4 border-primary-500 hover:translate-y-[-3px] hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🎓</span>
                  <h3 className="text-lg font-semibold text-gray-800">{skill.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLocalEdit(skill)}
                    className="p-1 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Edit this skill"
                  >
                    <span className="text-base">✏️</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMasteredSkill(skill.name)}
                    className="p-1 rounded-md text-red-600 hover:bg-red-200 transition-colors"
                    title="Delete this skill"
                  >
                    <span className="text-base">🗑️</span>
                  </button>
                </div>
              </div>
              {skill.description && (
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{skill.description}</p>
              )}
              <div className="flex justify-between items-center border-t pt-3 border-gray-200 border-dashed">
                <span className="flex items-center space-x-1 text-sm text-gray-600">
                  <span className="text-base">⏱️</span>
                  <span>{skill.experienceYears} {skill.experienceYears === 1 ? 'year' : 'years'} of experience</span>
                </span>
                <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">Available to teach</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-4">🧠</div>
            <p className="text-gray-700 mb-2">You haven't added any mastered skills yet.</p>
            <p className="text-gray-600 italic text-sm">Add skills you're proficient in and want to teach others!</p>
          </div>
        )}
      </div>

      {showMasteredSkillForm ? (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{editingSkillId ? 'Edit Mastered Skill' : 'Add Mastered Skill'}</h3>
          <form onSubmit={handleMasteredSkillSubmit} className="flex flex-col space-y-4">
            <div>
              <label htmlFor="skillName" className="block text-sm font-medium text-gray-700">Skill Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                id="skillName"
                name="name"
                value={newMasteredSkill.name}
                onChange={handleMasteredSkillChange}
                placeholder="e.g., JavaScript, Photography, Chess"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="skillDescription" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="skillDescription"
                name="description"
                value={newMasteredSkill.description}
                onChange={handleMasteredSkillChange}
                placeholder="Describe your expertise and what you can teach others"
                rows="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <div className="mt-1 flex items-center">
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-l-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={() => {
                    if (newMasteredSkill.experienceYears > 1) {
                      setNewMasteredSkill({
                        ...newMasteredSkill,
                        experienceYears: newMasteredSkill.experienceYears - 1
                      });
                    }
                  }}
                >-</button>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  min="1"
                  max="50"
                  value={newMasteredSkill.experienceYears}
                  onChange={handleMasteredSkillChange}
                  className="w-16 text-center border-t border-b border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={() => {
                    if (newMasteredSkill.experienceYears < 50) {
                      setNewMasteredSkill({
                        ...newMasteredSkill,
                        experienceYears: newMasteredSkill.experienceYears + 1
                      });
                    }
                  }}
                >+</button>
              </div>
            </div>

            <div className="flex space-x-4 mt-4">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {editingSkillId ? 'Update Skill' : 'Add Skill'}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => {
                  setShowMasteredSkillForm(false);
                  setNewMasteredSkill({ name: '', description: '', experienceYears: 1 });
                  setEditingSkillId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          className="mt-6 w-full px-4 py-3 bg-white text-primary-600 border-2 border-dashed border-primary-600 rounded-md font-semibold flex items-center justify-center space-x-2 hover:bg-primary-50 transition-colors"
          onClick={() => setShowMasteredSkillForm(true)}
        >
          <span className="text-xl font-bold">+</span> <span>Add a Mastered Skill</span>
        </button>
      )}
    </div>
  );
}
