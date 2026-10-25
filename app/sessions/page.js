'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_SESSIONS, DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'all', 'live', 'upcoming', 'enrolled'
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.alex);
  const [showHostModal, setShowHostModal] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState(null);

  // New Workshop Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSkill, setNewSkill] = useState('AI & Machine Learning');
  const [newDate, setNewDate] = useState('2026-11-02');
  const [newTime, setNewTime] = useState('18:00 UTC');
  const [newDuration, setNewDuration] = useState('60');
  const [newSeats, setNewSeats] = useState('30');
  const [newAgenda, setNewAgenda] = useState('Foundational overview\nLive coding walkthrough\nInteractive Q&A');

  useEffect(() => {
    setCurrentUser(clientStore.getCurrentUser());
    const storedSessions = clientStore.getSessions();
    if (storedSessions && storedSessions.length > 0) {
      setSessions(storedSessions);
    } else {
      setSessions(DEMO_SESSIONS);
    }
  }, []);

  const handleBookSession = (sessionId) => {
    const updated = clientStore.bookSession(sessionId);
    setSessions(updated);
    setBookingFeedback({
      sessionId,
      message: '🎉 Seat confirmed! Classroom invite and study notes added to your schedule.',
    });
    setTimeout(() => setBookingFeedback(null), 4000);
  };

  const handleHostSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const user = clientStore.getCurrentUser();
    const newSession = {
      id: `sess_${Date.now()}`,
      title: newTitle.trim(),
      instructor: user,
      skill: newSkill,
      status: 'scheduled',
      scheduledDate: newDate,
      scheduledTime: newTime,
      durationMinutes: parseInt(newDuration, 10) || 60,
      enrolledCount: 1,
      maxSeats: parseInt(newSeats, 10) || 30,
      roomLink: `/classroom/${newSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      level: 'All Levels',
      isEnrolled: true,
      agenda: newAgenda.split('\n').filter((item) => item.trim().length > 0),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    try {
      localStorage.setItem('skillshikhi_sessions', JSON.stringify(updated));
    } catch (e) {}

    setNewTitle('');
    setShowHostModal(false);
    setBookingFeedback({
      sessionId: newSession.id,
      message: '🚀 Workshop broadcast created! Classroom link is now public to community peers.',
    });
    setTimeout(() => setBookingFeedback(null), 4000);
  };

  const filteredSessions = sessions.filter((sess) => {
    if (activeTab === 'enrolled') return sess.isEnrolled;
    if (activeTab === 'live') return sess.id === 'sess_1'; // Featured live demo
    if (activeTab === 'upcoming') return sess.status === 'scheduled';
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner & Paradigm Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📺</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Live Peer Workshops & Virtual Classrooms
              </h1>
              <span className="text-[10px] font-bold uppercase bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
                YouTube & Google Classroom Paradigm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Attend interactive engineering workshops, follow structured curriculum agendas, and reserve seats in mentor classrooms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHostModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <span>+</span>
              <span>Host a Workshop</span>
            </button>
            <Link
              href="/chat"
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>💬 Study Pods</span>
            </Link>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {bookingFeedback && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
            <span>{bookingFeedback.message}</span>
            <button onClick={() => setBookingFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {/* Featured Live Main Stage Workshop */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3 py-1 bg-red-600 text-white rounded-full">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Live Main Stage
                </span>
                <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
                  Deep Learning & AI
                </span>
                <span className="text-xs text-slate-400">⏱ 60 min session</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Practical Neural Networks with PyTorch: From Scratch to Fine-Tuning
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Step-by-step tensor computation, automatic backprop mechanics, and hands-on LLM adapter fine-tuning hosted live with real-time code reviews.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={DEMO_USERS.sarah.avatar}
                  alt={DEMO_USERS.sarah.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400"
                />
                <div>
                  <div className="text-xs font-bold text-white">{DEMO_USERS.sarah.name}</div>
                  <div className="text-[11px] text-slate-400">{DEMO_USERS.sarah.bio}</div>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleBookSession('sess_1')}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/50 flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <span>📺</span>
                  <span>Join Live Classroom</span>
                </button>
                <Link
                  href="/chat"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition flex items-center gap-2"
                >
                  <span>💬 Open Session Chat</span>
                </Link>
              </div>
            </div>

            {/* Stage Preview Box */}
            <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-700/80 p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-3">
                <span>Classroom Agenda</span>
                <span className="text-emerald-400 font-mono">28 / 30 Seats Booked</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Tensors and Automatic Differentiation fundamentals</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Building an MLP with custom forward and backward passes</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Interactive PyTorch notebook debugging & peer Q&A</span>
                </div>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-indigo-500 h-full rounded-full" style={{ width: '93%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'upcoming', label: 'Upcoming Workshops', icon: '📅' },
              { id: 'live', label: 'Live Now', icon: '🔴' },
              { id: 'enrolled', label: 'My Enrolled Sessions', icon: '🎒' },
              { id: 'all', label: 'All Catalog', icon: '📚' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredSessions.length} technical workshop{filteredSessions.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const isEnrolled = session.isEnrolled;
            const instructor = session.instructor || DEMO_USERS.sarah;
            const seatsFilled = session.enrolledCount || 0;
            const maxSeats = session.maxSeats || 30;
            const fillPct = Math.min(100, Math.round((seatsFilled / maxSeats) * 100));

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {session.skill}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ⏱ {session.durationMinutes} min
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                    {session.title}
                  </h3>

                  {/* Scheduled Date & Time */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span>🗓</span>
                    <span className="font-semibold text-slate-700">{session.scheduledDate}</span>
                    <span className="text-slate-300">·</span>
                    <span>{session.scheduledTime}</span>
                  </div>

                  {/* Agenda */}
                  {session.agenda && session.agenda.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Curriculum Highlights:
                      </div>
                      <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                        {session.agenda.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="truncate">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* Instructor Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={instructor.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{instructor.name}</div>
                        <div className="text-[10px] text-slate-400">{instructor.role || 'Peer Mentor'}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-600">
                        {seatsFilled} / {maxSeats} seats
                      </div>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${fillPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Reserve / Enrolled Button */}
                  <button
                    onClick={() => handleBookSession(session.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isEnrolled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    <span>{isEnrolled ? '✓ Enrolled in Classroom' : '🎟 Reserve Workshop Seat'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Host Workshop Modal */}
        {showHostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎙️</span>
                  <h3 className="font-extrabold text-base text-slate-900">Host a Live Peer Workshop</h3>
                </div>
                <button
                  onClick={() => setShowHostModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleHostSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Workshop Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Modern State Management with Zustand & React 19"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Skill Domain</label>
                    <select
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Full Stack Engineering">Full Stack Engineering</option>
                      <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                      <option value="UI/UX Engineering">UI/UX Engineering</option>
                      <option value="Systems Programming">Systems Programming</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Duration</label>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                      <option value="90">90 Minutes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Date</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Time (UTC)</label>
                    <input
                      type="text"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="18:00 UTC"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Agenda Milestones (one per line)</label>
                  <textarea
                    rows={3}
                    value={newAgenda}
                    onChange={(e) => setNewAgenda(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHostModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm"
                  >
                    Publish Workshop
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
