'use client';

import { useState, useEffect } from 'react';
import { DEMO_DROPLETS, DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function DropletsPage() {
  const [droplets, setDroplets] = useState([]);
  const [newDropletText, setNewDropletText] = useState('');
  const [newTag, setNewTag] = useState('#CodeTip');
  const [selectedTag, setSelectedTag] = useState('All');
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.alex);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setDroplets(clientStore.getDroplets());
    setCurrentUser(clientStore.getCurrentUser() || DEMO_USERS.alex);
  }, []);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  const tags = ['All', '#JavaScript', '#AI', '#Linux', '#DesignTips', '#CSS', '#DevOps', '#Nextjs'];

  const filteredDroplets =
    selectedTag === 'All'
      ? droplets
      : droplets.filter((d) => d.tag?.toLowerCase().includes(selectedTag.toLowerCase().replace('#', '')));

  const handleCreateDroplet = (e) => {
    e.preventDefault();
    if (!newDropletText.trim()) return;

    const newDrop = clientStore.addDroplet({
      content: newDropletText.trim(),
      tag: newTag,
    });

    setDroplets([newDrop, ...droplets]);
    setNewDropletText('');
    showToast('🚀 Droplet published to the developer feed!');
  };

  const handleLike = (id) => {
    setDroplets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isLiked: !d.isLiked, likes: d.isLiked ? d.likes - 1 : d.likes + 1 } : d))
    );
  };

  const handleRepost = (id) => {
    setDroplets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, reposts: d.reposts + 1 } : d))
    );
    showToast('🔁 Code Droplet reposted to your followers!');
  };

  const handleBookmark = (id) => {
    showToast('🔖 Tip bookmarked to your personal cheat sheet!');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span>✓</span>
            <span>{toast}</span>
          </div>
        )}

        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <h1 className="text-xl font-black text-slate-900">Skill Droplets & Fast Tips</h1>
            <span className="text-[10px] font-bold uppercase bg-slate-900 text-white px-2.5 py-0.5 rounded-full">
              X & Twitter Paradigm
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            280-character knowledge nuggets, terminal one-liners, and quick engineering revelations.
          </p>
        </div>

        {/* Droplet Composer */}
        <form
          onSubmit={handleCreateDroplet}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
        >
          <div className="flex items-start gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div className="flex-1 space-y-2">
              <textarea
                rows={3}
                maxLength={280}
                value={newDropletText}
                onChange={(e) => setNewDropletText(e.target.value)}
                placeholder="Share a bite-sized coding tip or one-liner (max 280 chars)..."
                className="w-full text-sm border-0 focus:ring-0 p-1 resize-none text-slate-800 placeholder-slate-400 focus:outline-hidden"
                required
              />

              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Tag:</span>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-indigo-700"
                  >
                    <option value="#JavaScript">#JavaScript</option>
                    <option value="#AI">#AI #LLMs</option>
                    <option value="#Linux">#Linux #Bash</option>
                    <option value="#CSS">#CSS #Tailwind</option>
                    <option value="#Nextjs">#Nextjs15</option>
                    <option value="#DevOps">#DevOps</option>
                  </select>
                  <span className="text-[11px] text-slate-400">
                    {280 - newDropletText.length} left
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!newDropletText.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Post Droplet
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex-shrink-0 ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Droplets Stream */}
        <div className="space-y-3">
          {filteredDroplets.map((drop) => (
            <div
              key={drop.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={drop.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={drop.author?.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{drop.author?.name}</span>
                      <span className="text-[11px] text-slate-400">{drop.handle}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{drop.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {drop.tag}
                </span>
              </div>

              <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed my-3 font-sans">
                {drop.content}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 max-w-sm">
                <button
                  onClick={() => showToast(`Replied to ${drop.author?.name}`)}
                  className="flex items-center gap-1.5 hover:text-indigo-600 transition"
                >
                  <span>💬</span>
                  <span>{drop.replies}</span>
                </button>

                <button
                  onClick={() => handleRepost(drop.id)}
                  className="flex items-center gap-1.5 hover:text-emerald-600 transition"
                >
                  <span>🔁</span>
                  <span>{drop.reposts}</span>
                </button>

                <button
                  onClick={() => handleLike(drop.id)}
                  className={`flex items-center gap-1.5 transition ${
                    drop.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                  }`}
                >
                  <span>{drop.isLiked ? '❤️' : '🤍'}</span>
                  <span>{drop.likes}</span>
                </button>

                <button
                  onClick={() => handleBookmark(drop.id)}
                  className="hover:text-amber-600 transition"
                >
                  <span>🔖</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
