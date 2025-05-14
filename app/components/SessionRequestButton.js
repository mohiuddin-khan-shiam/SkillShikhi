'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionRequestButton({ userId, userName, userSkills = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [skill, setSkill] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!skill) {
      setError('Please select a skill');
      setLoading(false);
      return;
    }

    try {
      // Combine date and time if both are provided
      let preferredDate = null;
      if (date) {
        preferredDate = new Date(date);
        if (time) {
          const [hours, minutes] = time.split(':');
          preferredDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }
      }

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          toUserId: userId,
          skill,
          preferredDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setShowModal(false);
        
        // Ask user if they want to go to sessions page
        const goToSessions = window.confirm('Session request sent successfully! Do you want to view your sessions?');
        if (goToSessions) {
          router.push('/sessions');
        }
      } else {
        setError(data.error || 'Failed to send session request');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSkill('');
    setDate('');
    setTime('');
    setError('');
    setSuccess(false);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
        </svg>
        Request Session
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Request Session with {userName}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Skill</label>
                {userSkills.length > 0 ? (
                  <select
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select a skill</option>
                    {userSkills.map((skill, index) => (
                      <option key={index} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500 italic">This user hasn&apos;t added any teachable skills yet.</p>
                )}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 text-red-500">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={loading || !skill || userSkills.length === 0}
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50">
          Session request sent successfully!
        </div>
      )}
    </>
  );
} 