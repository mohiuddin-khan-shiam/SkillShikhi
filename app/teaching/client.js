'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function TeachingRequestsClient() {
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);

  // Check authentication status with demo fallback
  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    const currentUser = clientStore.getCurrentUser() || DEMO_USERS.alex;
    setUser(currentUser);

    // Fetch user data if real API available
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          if (userData?.user) setUser(userData.user);
        }
      } catch (error) {
        console.warn('Fallback to demo persona in teaching requests');
      }
    };

    fetchUserData();
  }, []);

  // Fetch teaching requests
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError('');

      try {
        const token = Cookies.get('token') || localStorage.getItem('token') || 'demo_token';
        const response = await fetch(`/api/teaching-requests?type=${activeTab}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.requests) {
          setRequests(data.requests);
        } else {
          setRequests([
            {
              _id: 'req_1',
              skill: 'Neural Networks & PyTorch',
              status: 'pending',
              date: '2026-10-28',
              time: '18:00 UTC',
              message: 'Looking for 1-on-1 guidance on PyTorch autograd tensors and fine-tuning adapters.',
              requester: DEMO_USERS.alex,
              teacher: DEMO_USERS.sarah,
            },
            {
              _id: 'req_2',
              skill: 'Docker & Kubernetes Manifests',
              status: 'accepted',
              date: '2026-10-30',
              time: '16:30 UTC',
              message: 'Help setting up local k3s multi-container development environment.',
              requester: DEMO_USERS.alex,
              teacher: DEMO_USERS.tariq,
            },
          ]);
        }
      } catch (error) {
        console.warn('Using demo teaching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [activeTab]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      setRequests((prev) =>
        prev.map((req) => (req._id === requestId ? { ...req, status: newStatus } : req))
      );
      setSuccessMessage(`Request successfully marked as ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating teaching request:', error);
      setError('Failed to update status');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Peer Teaching & Mentorship Requests
              </h1>
              <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                Messenger Paradigm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Coordinate 1-on-1 peer mentoring sessions, code audits, and technical tutoring requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/sessions"
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>📅 Classroom Workshops</span>
            </Link>
            <Link
              href="/skills"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Find a Mentor
            </Link>
          </div>
        </div>

        {/* Feedback messages */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
            ✓ {successMessage}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold animate-in fade-in">
            ✕ {error}
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'received'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Mentorship Requests Received ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'sent'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Requests Sent
          </button>
        </div>

        {/* List of Requests */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading teaching requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <div className="text-3xl">📬</div>
            <h3 className="font-bold text-sm text-slate-800">No {activeTab} teaching requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore community skills and request 1-on-1 mentorship from top-ranked practitioners.
            </p>
            <Link
              href="/skills"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Explore Mentors & Skills
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => {
              const partner = req.requester || req.teacher || DEMO_USERS.sarah;
              return (
                <div
                  key={req._id}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-200 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{req.skill}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          req.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <img
                        src={partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={partner.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>
                        Collaborator: <strong className="text-indigo-700">{partner.name}</strong>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">
                        🗓 {req.date || 'Flexible Date'} at {req.time || '18:00 UTC'}
                      </span>
                    </div>

                    {req.message && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                        "{req.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(req._id, 'accepted')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          Accept Mentorship
                        </button>
                        <button
                          onClick={() => handleStatusChange(req._id, 'rejected')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <Link
                        href="/chat"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                      >
                        <span>💬 Message in Pod</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
