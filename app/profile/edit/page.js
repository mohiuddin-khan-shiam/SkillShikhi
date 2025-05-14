'use client';
import '../../styles.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    skills: '',
    availability: {},
    timeSlots: [],
    location: '',
    profileImage: '',
    coverImage: '',
    isPublic: true,
  });
  
  // State for mastered skills
  const [masteredSkills, setMasteredSkills] = useState([]);
  const [newMasteredSkill, setNewMasteredSkill] = useState({
    name: '',
    description: '',
    experienceYears: 1
  });
  
  // Calendar visibility state
  const [calendarVisible, setCalendarVisible] = useState(false);
  // Time selector visibility state
  const [timeSelectVisible, setTimeSelectVisible] = useState(false);
  // Custom time input states
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [timeFormat, setTimeFormat] = useState('AM');
  const [endTimeFormat, setEndTimeFormat] = useState('AM');

  // Days of the week starting from Saturday
  const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Pre-defined time slots for quick selection
  const quickTimeSlots = [
    'Morning (8:00 AM - 12:00 PM)',
    'Afternoon (12:00 PM - 4:00 PM)',
    'Evening (4:00 PM - 8:00 PM)',
    'Night (8:00 PM - 12:00 AM)'
  ];
  
  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        // The API returns the user object directly, not nested under a 'user' property
        const userData = data;
        
        // Parse availability if it exists and is a string
        let availabilityData = {};
        let timeSlotsData = [];
        
        try {
          if (userData.availability) {
            if (typeof userData.availability === 'string') {
              const parsedData = JSON.parse(userData.availability);
              if (parsedData.days) {
                availabilityData = parsedData.days;
                timeSlotsData = parsedData.timeSlots || [];
              } else {
                // Legacy format - just days
                availabilityData = parsedData;
              }
            } else {
              availabilityData = userData.availability;
            }
          }
        } catch (e) {
          console.error('Error parsing availability:', e);
          availabilityData = {};
          timeSlotsData = [];
        }

        // Ensure isPublic is treated as a boolean
        const isPublicValue = userData.isPublic === undefined ? true : Boolean(userData.isPublic);
        console.log('Profile privacy setting loaded:', isPublicValue);

        setForm({
          name: userData.name || '',
          bio: userData.bio || '',
          skills: (userData.skills || []).join(', '),
          availability: availabilityData,
          timeSlots: timeSlotsData,
          location: userData.location || '',
          profileImage: userData.profileImage || '',
          coverImage: userData.coverImage || '',
          isPublic: isPublicValue,
        });
      } else {
        router.push('/login');
      }
    }

    async function fetchMasteredSkills() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/mastered-skills', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Fetched mastered skills:', data.masteredSkills);
          setMasteredSkills(data.masteredSkills || []);
        } else {
          console.error('Failed to fetch mastered skills');
        }
      } catch (error) {
        console.error('Error fetching mastered skills:', error);
      }
    }

    fetchProfile();
    fetchMasteredSkills();
  }, []);

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'skillshikhi_unsigned');

    const res = await fetch('https://api.cloudinary.com/v1_1/dcbnjswon/image/upload', {
      method: 'POST',
      body: data,
    });

    const result = await res.json();
    return result.secure_url;
  };

  const handleChange = async (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (files && files.length > 0) {
      const url = await uploadToCloudinary(files[0]);
      setForm((prev) => ({ ...prev, [name]: url }));
    } else if (type === 'checkbox') {
      console.log(`Checkbox ${name} changed to ${checked}`);
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDaySelection = (day) => {
    setForm(prev => {
      const updatedAvailability = { ...prev.availability };
      
      if (updatedAvailability[day]) {
        // If day is already selected, remove it
        const { [day]: _, ...rest } = updatedAvailability;
        return {
          ...prev,
          availability: rest
        };
      } else {
        // If day is not selected, add it
        return {
          ...prev,
          availability: {
            ...updatedAvailability,
            [day]: true
          }
        };
      }
    });
  };

  const handleTimeSlotSelection = (timeSlot) => {
    setForm(prev => {
      const timeSlots = [...prev.timeSlots];
      
      if (timeSlots.includes(timeSlot)) {
        // Remove the time slot if already selected
        return {
          ...prev,
          timeSlots: timeSlots.filter(t => t !== timeSlot)
        };
      } else {
        // Add the time slot if not already selected
        return {
          ...prev,
          timeSlots: [...timeSlots, timeSlot]
        };
      }
    });
  };

  const addCustomTimeSlot = () => {
    const customTimeSlot = `${startTime} ${timeFormat} - ${endTime} ${endTimeFormat}`;
    
    setForm(prev => {
      const timeSlots = [...prev.timeSlots];
      
      if (!timeSlots.includes(customTimeSlot)) {
        return {
          ...prev,
          timeSlots: [...timeSlots, customTimeSlot]
        };
      }
      return prev;
    });
  };

  const isDaySelected = (day) => {
    return !!form.availability[day];
  };
  
  const isTimeSlotSelected = (timeSlot) => {
    return form.timeSlots.includes(timeSlot);
  };
  
  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
    if (timeSelectVisible) setTimeSelectVisible(false);
  };
  
  const toggleTimeSelect = () => {
    setTimeSelectVisible(!timeSelectVisible);
    if (calendarVisible) setCalendarVisible(false);
  };
  
  const getSelectedDaysText = () => {
    const selectedDays = Object.keys(form.availability);
    if (selectedDays.length === 0) return "No days selected";
    if (selectedDays.length === 7) return "All days selected";
    return selectedDays.join(", ");
  };
  
  const getSelectedTimesText = () => {
    if (form.timeSlots.length === 0) return "No time slots selected";
    if (form.timeSlots.length === quickTimeSlots.length) return "All times selected";
    if (form.timeSlots.length <= 2) return form.timeSlots.join(", ");
    return `${form.timeSlots.length} time slots selected`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Combine days and time slots into a single structure
    const availabilityData = {
      days: form.availability,
      timeSlots: form.timeSlots
    };

    // Log isPublic value before sending
    console.log('Sending isPublic value:', form.isPublic);

    const payload = {
      ...form,
      skills: form.skills.split(',').map((s) => s.trim()),
      availability: JSON.stringify(availabilityData), // Convert availability object to string for storage
      isPublic: form.isPublic // Make sure this field is sent explicitly
    };
    
    // Ensure boolean type
    if (typeof payload.isPublic !== 'boolean') {
      payload.isPublic = Boolean(payload.isPublic);
    }
    
    console.log('🟢 Payload being sent:', payload);
    console.log(`Profile privacy in payload: ${payload.isPublic ? 'Public' : 'Private'}`);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      console.log('Server response for profile update:', responseData);

      if (res.ok) {
        alert('Profile updated successfully!');
        router.push('/profile');
      } else {
        const error = await res.text();
        console.error('❌ Failed:', error);
        alert('Update failed!');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert(`Update failed: ${error.message}`);
    }
  };

  const handleMasteredSkillChange = (e) => {
    const { name, value } = e.target;
    setNewMasteredSkill(prev => ({
      ...prev,
      [name]: name === 'experienceYears' ? parseInt(value, 10) || 0 : value
    }));
  };

  const addMasteredSkill = async () => {
    if (!newMasteredSkill.name) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Sending request to add skill:', newMasteredSkill);
      
      const res = await fetch('/api/mastered-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Send the complete skill object - the API will use the 'skill' property as the name
        body: JSON.stringify({
          skill: newMasteredSkill.name,
          description: newMasteredSkill.description,
          experienceYears: newMasteredSkill.experienceYears
        }),
      });

      const responseData = await res.json();
      console.log('Server response:', responseData);
      
      if (res.ok) {
        // Use the returned skill from the API or create one locally
        const newSkillObj = responseData.skill || { 
          name: newMasteredSkill.name,
          description: newMasteredSkill.description,
          experienceYears: newMasteredSkill.experienceYears 
        };
        setMasteredSkills(prev => [...prev, newSkillObj]);
        
        // Reset the form
        setNewMasteredSkill({ name: '', description: '', experienceYears: 1 });
        
        // Show success message
        alert(`Skill "${newMasteredSkill.name}" added successfully!`);
      } else {
        console.error('Failed to add mastered skill:', responseData.message);
        alert(`Failed to add skill: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding mastered skill:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  const removeMasteredSkill = async (skillName) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending request to remove skill:', skillName);
      
      // The API expects the parameter to be named 'skill' not 'name'
      const res = await fetch(`/api/mastered-skills?skill=${encodeURIComponent(skillName)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await res.json();
      console.log('Server response for removal:', responseData);
      
      if (res.ok) {
        // Update local state
        setMasteredSkills(prev => prev.filter(skill => skill.name !== skillName));
        // Show success message
        alert(`Skill "${skillName}" removed successfully!`);
      } else {
        console.error('Failed to remove mastered skill:', responseData.message);
        alert(`Failed to remove skill: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error removing mastered skill:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <h1>Edit Your Profile</h1>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-section">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="form-section">
          <label>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} />
        </div>

        <div className="form-section">
          <label>Skills (comma separated)</label>
          <input name="skills" value={form.skills} onChange={handleChange} />
        </div>

        <div className="form-section">
          <label>Skills You Can Teach</label>
          <div className="mastered-skills-container">
            {masteredSkills.length > 0 && (
              <div className="mastered-skills-list">
                <h3>Your Teaching Skills</h3>
                {masteredSkills.map((skill, index) => (
                  <div key={index} className="mastered-skill-item">
                    <div className="mastered-skill-content">
                      <div className="mastered-skill-name">{skill.name}</div>
                      <div className="mastered-skill-experience">{skill.experienceYears} years of experience</div>
                      {skill.description && (
                        <div className="mastered-skill-description">{skill.description}</div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="remove-mastered-skill" 
                      onClick={() => removeMasteredSkill(skill.name)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="add-mastered-skill-form">
              <h3>Add a Skill You Can Teach</h3>
              <div className="mastered-skill-form-row">
                <input
                  type="text"
                  placeholder="Skill Name"
                  name="name"
                  value={newMasteredSkill.name}
                  onChange={handleMasteredSkillChange}
                  className="mastered-skill-input"
                />
              </div>
              
              <div className="mastered-skill-form-row">
                <textarea
                  placeholder="Description (optional)"
                  name="description"
                  value={newMasteredSkill.description}
                  onChange={handleMasteredSkillChange}
                  className="mastered-skill-textarea"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="mastered-skill-form-row">
                <label className="years-label">Years of Experience:</label>
                <input
                  type="number"
                  name="experienceYears"
                  value={newMasteredSkill.experienceYears}
                  onChange={handleMasteredSkillChange}
                  min="0"
                  max="50"
                  className="years-input"
                />
              </div>
              
              <button 
                type="button" 
                className="add-mastered-skill-btn" 
                onClick={addMasteredSkill}
              >
                Add Teaching Skill
              </button>
            </div>
          </div>
          <style jsx>{`
            .mastered-skills-container {
              margin-top: 10px;
            }
            
            .mastered-skills-list {
              margin-bottom: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              background-color: #f9f9f9;
            }
            
            .mastered-skills-list h3, .add-mastered-skill-form h3 {
              font-size: 16px;
              margin-top: 0;
              margin-bottom: 15px;
              color: #444;
            }
            
            .mastered-skill-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px;
              border: 1px solid #e1e1e1;
              border-radius: 6px;
              margin-bottom: 10px;
              background-color: white;
            }
            
            .mastered-skill-content {
              flex: 1;
            }
            
            .mastered-skill-name {
              font-weight: bold;
              color: #333;
            }
            
            .mastered-skill-experience {
              font-size: 14px;
              color: #666;
              margin-top: 4px;
            }
            
            .mastered-skill-description {
              font-size: 14px;
              color: #555;
              margin-top: 6px;
              font-style: italic;
            }
            
            .remove-mastered-skill {
              background-color: #ff4d4f;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 5px 10px;
              cursor: pointer;
              font-size: 14px;
            }
            
            .remove-mastered-skill:hover {
              background-color: #ff7875;
            }
            
            .add-mastered-skill-form {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              background-color: #f9f9f9;
            }
            
            .mastered-skill-form-row {
              margin-bottom: 12px;
            }
            
            .mastered-skill-input, .mastered-skill-textarea {
              width: 100%;
              padding: 8px 12px;
              border: 1px solid #d9d9d9;
              border-radius: 4px;
              font-size: 14px;
            }
            
            .mastered-skill-textarea {
              resize: vertical;
            }
            
            .years-label {
              display: inline-block;
              margin-right: 10px;
              font-size: 14px;
            }
            
            .years-input {
              width: 80px;
              padding: 8px 12px;
              border: 1px solid #d9d9d9;
              border-radius: 4px;
              font-size: 14px;
            }
            
            .add-mastered-skill-btn {
              background-color: #1890ff;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 8px 16px;
              cursor: pointer;
              font-size: 14px;
              margin-top: 8px;
            }
            
            .add-mastered-skill-btn:hover {
              background-color: #40a9ff;
            }
          `}</style>
        </div>

        <div className="form-section">
          <label>Availability</label>
          <div className="availability-selector">
            <div className="selectors-container">
              <div className="calendar-toggle" onClick={toggleCalendar}>
                <div className="calendar-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="selected-days">
                  {getSelectedDaysText()}
                </div>
                <div className={`toggle-arrow ${calendarVisible ? 'open' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              
              <div className="time-toggle" onClick={toggleTimeSelect}>
                <div className="time-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="selected-times">
                  {getSelectedTimesText()}
                </div>
                <div className={`toggle-arrow ${timeSelectVisible ? 'open' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
            
            {calendarVisible && (
              <div className="availability-scheduler">
                <p className="availability-instruction">Select the days when you're available for appointments</p>
                
                <div className="days-calendar">
                  {daysOfWeek.map(day => (
                    <div 
                      key={day} 
                      className={`calendar-day ${isDaySelected(day) ? 'selected' : ''}`}
                      onClick={() => handleDaySelection(day)}
                    >
                      <div className="day-name">{day}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {timeSelectVisible && (
              <div className="time-slot-selector">
                <p className="availability-instruction">Set your available time slots</p>
                
                <div className="alarm-clock-interface">
                  <div className="alarm-clock-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                      <line x1="4" y1="2" x2="6" y2="4"></line>
                      <line x1="20" y1="2" x2="18" y2="4"></line>
                      <line x1="2" y1="12" x2="4" y2="12"></line>
                      <line x1="20" y1="12" x2="22" y2="12"></line>
                      <line x1="6" y1="20" x2="8" y2="18"></line>
                      <line x1="18" y1="20" x2="16" y2="18"></line>
                    </svg>
                  </div>
                  
                  <div className="custom-time-input">
                    <div className="time-input-group">
                      <div className="time-label">Start Time</div>
                      <div className="time-controls">
                        <input 
                          type="time" 
                          value={startTime} 
                          onChange={(e) => setStartTime(e.target.value)} 
                          className="time-input" 
                        />
                        <select 
                          value={timeFormat} 
                          onChange={(e) => setTimeFormat(e.target.value)} 
                          className="time-format"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="time-input-group">
                      <div className="time-label">End Time</div>
                      <div className="time-controls">
                        <input 
                          type="time" 
                          value={endTime} 
                          onChange={(e) => setEndTime(e.target.value)} 
                          className="time-input" 
                        />
                        <select 
                          value={endTimeFormat} 
                          onChange={(e) => setEndTimeFormat(e.target.value)} 
                          className="time-format"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      className="add-time-btn" 
                      onClick={addCustomTimeSlot}
                    >
                      Add Time Slot
                    </button>
                  </div>
                </div>
                
                <div className="time-quick-select">
                  <div className="quick-select-heading">Quick Select:</div>
                  <div className="time-slots-container">
                    {quickTimeSlots.map(timeSlot => (
                      <div 
                        key={timeSlot} 
                        className={`time-slot ${isTimeSlotSelected(timeSlot) ? 'selected' : ''}`}
                        onClick={() => handleTimeSlotSelection(timeSlot)}
                      >
                        {timeSlot}
                      </div>
                    ))}
                  </div>
                </div>
                
                {form.timeSlots.length > 0 && (
                  <div className="selected-time-slots">
                    <div className="selected-slots-heading">Your Selected Time Slots:</div>
                    <div className="selected-slots-list">
                      {form.timeSlots.map(slot => (
                        <div key={slot} className="selected-slot">
                          <span>{slot}</span>
                          <button 
                            type="button" 
                            className="remove-slot" 
                            onClick={() => handleTimeSlotSelection(slot)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange} />
        </div>

        <div className="form-section">
          <label>Profile Picture</label>
          <input type="file" name="profileImage" accept="image/*" onChange={handleChange} />
          {form.profileImage && <img src={form.profileImage} className="preview" />}
        </div>

        <div className="form-section">
          <label>Cover Image</label>
          <input type="file" name="coverImage" accept="image/*" onChange={handleChange} />
          {form.coverImage && <img src={form.coverImage} className="preview cover-preview" />}
        </div>

        <div className="form-section">
          <label>Profile Privacy</label>
          <div className="privacy-toggle-container">
            <div className="privacy-toggle">
              <input 
                type="checkbox" 
                id="privacy-toggle" 
                name="isPublic" 
                checked={form.isPublic} 
                onChange={handleChange} 
                className="privacy-checkbox"
              />
              <label htmlFor="privacy-toggle" className="privacy-label">
                <div className="toggle-track">
                  <div className="toggle-indicator"></div>
                </div>
                <span className="privacy-status">
                  {form.isPublic ? 'Public' : 'Private'}
                </span>
              </label>
            </div>
            <p className="privacy-description">
              {form.isPublic 
                ? 'Your full profile is visible to everyone.' 
                : 'Only your name, skills, and profile picture will be visible to others.'}
            </p>
            <div className="current-privacy-status">
              Current status: <strong>{form.isPublic ? 'Public' : 'Private'}</strong>
            </div>
          </div>
        </div>

        <button type="submit" className="edit-button">Save Changes</button>
      </form>
    </div>
  );
}
