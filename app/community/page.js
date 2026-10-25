'use client';

import { useState, useEffect } from 'react';
import { DEMO_COMMUNITIES, DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function CommunityPage() {
  const [communities, setCommunities] = useState([]);
  const [activeSlug, setActiveSlug] = useState('web-dev');
  const [filterMode, setFilterMode] = useState('hot');
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    setCommunities(clientStore.getCommunities());
  }, []);

  const activeCommunity =
    communities.find((c) => c.slug === activeSlug) || DEMO_COMMUNITIES[0];

  const handleVote = (threadId, direction) => {
    const updated = clientStore.voteThread(activeSlug, threadId, direction);
    setCommunities(updated);
  };

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const user = clientStore.getCurrentUser();
    const newThread = {
      id: `t_${Date.now()}`,
      title: newTitle,
      author: user,
      upvotes: 1,
      userVote: 1,
      commentsCount: 0,
      timeAgo: 'Just now',
      isBestAnswered: false,
      summary: newSummary || newTitle,
    };

    setCommunities((prev) =>
      prev.map((c) =>
        c.slug === activeSlug ? { ...c, threads: [newThread, ...c.threads] } : c
      )
    );

    setNewTitle('');
    setNewSummary('');
    setShowThreadModal(false);
    showToast('🚀 Question submitted to community!');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h1 className="text-xl font-black text-slate-900">Skill Communities & Sub-Forums</h1>
              <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
                Reddit Paradigm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Crowdsourced engineering Q&A, upvoting, verified best solutions, and peer karma.
            </p>
          </div>

          <button
            onClick={() => setShowThreadModal(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Ask / Start Discussion</span>
          </button>
        </div>

        {/* Communities Navigation Header */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {communities.map((comm) => (
            <button
              key={comm.slug}
              onClick={() => setActiveSlug(comm.slug)}
              className={`p-3 rounded-2xl border transition flex items-center gap-3 flex-shrink-0 text-left ${
                activeSlug === comm.slug
                  ? 'bg-white border-orange-500 shadow-md ring-2 ring-orange-100'
                  : 'bg-white/80 border-slate-200 hover:bg-white'
              }`}
            >
              <span className="text-2xl">{comm.icon}</span>
              <div>
                <div className="font-bold text-xs text-slate-900">{comm.name}</div>
                <div className="text-[10px] text-slate-400">{comm.membersCount} members</div>
              </div>
            </button>
          ))}
        </div>

        {/* Community Info Banner */}
        {activeCommunity && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
            <div className="h-28 bg-gradient-to-r from-orange-600 to-amber-600 relative">
              <img
                src={activeCommunity.banner}
                alt={activeCommunity.title}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-4">
                <div className="text-white">
                  <h2 className="font-extrabold text-lg flex items-center gap-2">
                    <span>{activeCommunity.icon}</span>
                    <span>{activeCommunity.title}</span>
                  </h2>
                  <p className="text-xs text-slate-200">{activeCommunity.description}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterMode('hot')}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    filterMode === 'hot' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔥 Hot
                </button>
                <button
                  onClick={() => setFilterMode('top')}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    filterMode === 'top' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ⭐ Top
                </button>
                <button
                  onClick={() => setFilterMode('new')}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    filterMode === 'new' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ✨ New
                </button>
              </div>

              <span className="text-slate-500 text-[11px]">
                Active moderation & karma rewards enabled
              </span>
            </div>
          </div>
        )}

        {/* Threads List */}
        <div className="space-y-4">
          {activeCommunity?.threads?.map((thread) => (
            <div
              key={thread.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex items-start gap-4 hover:border-orange-300 transition"
            >
              {/* Upvote & Downvote Widget */}
              <div className="flex flex-col items-center bg-slate-50 rounded-xl p-2 border border-slate-200/80 min-w-[50px]">
                <button
                  onClick={() => handleVote(thread.id, 1)}
                  className={`p-1 rounded hover:bg-orange-100 transition text-sm ${
                    thread.userVote === 1 ? 'text-orange-600 font-bold scale-110' : 'text-slate-400'
                  }`}
                  aria-label="Upvote"
                >
                  ▲
                </button>
                <span
                  className={`text-xs font-black my-1 ${
                    thread.userVote === 1
                      ? 'text-orange-600'
                      : thread.userVote === -1
                      ? 'text-indigo-600'
                      : 'text-slate-700'
                  }`}
                >
                  {thread.upvotes}
                </span>
                <button
                  onClick={() => handleVote(thread.id, -1)}
                  className={`p-1 rounded hover:bg-indigo-100 transition text-sm ${
                    thread.userVote === -1 ? 'text-indigo-600 font-bold scale-110' : 'text-slate-400'
                  }`}
                  aria-label="Downvote"
                >
                  ▼
                </button>
              </div>

              {/* Thread Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700">Posted by {thread.author?.name}</span>
                  <span>·</span>
                  <span>{thread.timeAgo}</span>
                  {thread.isBestAnswered && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <span>✓</span>
                      <span>Verified Best Answer</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug hover:text-orange-600 transition cursor-pointer">
                  {thread.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">{thread.summary}</p>

                <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                  <button
                    onClick={() => showToast('💬 Verified solutions & thread answers expanded!')}
                    className="flex items-center gap-1.5 hover:text-orange-600 font-medium"
                  >
                    <span>💬</span>
                    <span>{thread.commentsCount} Answers & Solutions</span>
                  </button>
                  <button
                    onClick={() => showToast('🔗 Shareable community thread link copied!')}
                    className="flex items-center gap-1 hover:text-slate-700"
                  >
                    <span>↗</span>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Start Discussion */}
        {showThreadModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">
                  Ask {activeCommunity.name} Community
                </h3>
                <button onClick={() => setShowThreadModal(false)} className="text-slate-400 hover:text-slate-700">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question / Discussion Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Best pattern for serverless cold starts in Next.js 15?"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Details & Code Snippet
                  </label>
                  <textarea
                    rows={4}
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Provide full context, what you have tried, and expected behavior..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowThreadModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Post Question
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
