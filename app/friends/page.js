'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_USERS } from '../../lib/demoData';

export default function FriendsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'received', 'sent'
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || 'demo_jwt_token_recruiter_preview';
      const res = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setSentRequests(data.sent || []);
        setReceivedRequests(data.received || []);
      } else {
        throw new Error('Fallback to demo peers');
      }
    } catch (error) {
      setFriends([
        {
          _id: DEMO_USERS.sarah.id,
          name: DEMO_USERS.sarah.name,
          profileImage: DEMO_USERS.sarah.avatar,
          email: DEMO_USERS.sarah.email,
          headline: DEMO_USERS.sarah.role,
          bio: DEMO_USERS.sarah.bio,
          skills: ['Deep Learning', 'PyTorch', 'MLOps'],
        },
        {
          _id: DEMO_USERS.tariq.id,
          name: DEMO_USERS.tariq.name,
          profileImage: DEMO_USERS.tariq.avatar,
          email: DEMO_USERS.tariq.email,
          headline: DEMO_USERS.tariq.role,
          bio: DEMO_USERS.tariq.bio,
          skills: ['Kubernetes', 'Docker', 'Terraform'],
        },
        {
          _id: DEMO_USERS.elena.id,
          name: DEMO_USERS.elena.name,
          profileImage: DEMO_USERS.elena.avatar,
          email: DEMO_USERS.elena.email,
          headline: DEMO_USERS.elena.role,
          bio: DEMO_USERS.elena.bio,
          skills: ['Figma Tokens', 'Tailwind CSS', 'Design Systems'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = (friendId) => {
    setFriends((prev) => prev.filter((f) => (f._id || f.id) !== friendId));
    setNotification({ type: 'info', text: 'Peer connection removed from your study network.' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancelRequest = (requestId) => {
    setSentRequests((prev) => prev.filter((r) => r._id !== requestId));
    setNotification({ type: 'info', text: 'Connection request cancelled.' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAcceptRequest = (requestId) => {
    const accepted = receivedRequests.find((r) => r._id === requestId);
    setReceivedRequests((prev) => prev.filter((r) => r._id !== requestId));
    if (accepted?.user) {
      setFriends((prev) => [...prev, accepted.user]);
    }
    setNotification({ type: 'success', text: 'Connection request accepted! Added to study network.' });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Peer Network & Study Collaborators
              </h1>
              <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                Social Learning Network
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Connect with developers, pair-programmers, and mentors across all 14 learning paradigms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>💬 Study Pods</span>
            </Link>
            <Link
              href="/skills"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Discover Mentors
            </Link>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
            }`}
          >
            <span>{notification.text}</span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'friends'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>👥</span>
            <span>Connected Peers ({friends.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'received'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>📩</span>
            <span>Requests Received ({receivedRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>📤</span>
            <span>Sent ({sentRequests.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading peers...</div>
        ) : activeTab === 'friends' ? (
          friends.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <div className="text-3xl">👥</div>
              <h3 className="font-bold text-sm text-slate-800">No peers connected yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore community sub-forums or search for skills to send collaboration requests.
              </p>
              <Link
                href="/skills"
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                Browse Skills Directory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {friends.map((friend) => {
                const fId = friend._id || friend.id;
                return (
                  <div
                    key={fId}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            friend.profileImage ||
                            friend.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={friend.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{friend.name}</h3>
                          <div className="text-[11px] text-slate-500 truncate">
                            {friend.headline || friend.role || 'Peer Learner'}
                          </div>
                        </div>
                      </div>

                      {friend.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {friend.bio}
                        </p>
                      )}

                      {friend.skills && (
                        <div className="flex flex-wrap gap-1">
                          {friend.skills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        href="/chat"
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition text-center flex items-center justify-center gap-1.5"
                      >
                        <span>💬</span>
                        <span>Study Pod</span>
                      </Link>

                      <Link
                        href={`/user/${fId}`}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                        title="View Profile"
                      >
                        Profile
                      </Link>

                      <button
                        onClick={() => handleUnfriend(fId)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs"
                        title="Remove peer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === 'received' ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <div className="text-2xl">📬</div>
            <h3 className="font-bold text-sm text-slate-800">No incoming friend requests</h3>
            <p className="text-xs text-slate-500">You are completely caught up on invitations!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <div className="text-2xl">📤</div>
            <h3 className="font-bold text-sm text-slate-800">No pending sent requests</h3>
            <p className="text-xs text-slate-500">Connect with members via the skills directory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
