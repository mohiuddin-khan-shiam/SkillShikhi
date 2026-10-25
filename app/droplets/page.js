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

  useEffect(() => {
    setDroplets(clientStore.getDroplets());
    setCurrentUser(clientStore.getCurrentUser());
  }, []);

  const tags = ['All', '#JavaScript', '#AI', '#Linux', '#DesignTips', '#CSS', '#DevOps', '#Nextjs'];

  const filteredDroplets =
    selectedTag === 'All'
      ? droplets
      : droplets.filter((d) => d.tag?.toLowerCase().includes(selectedTag.toLowerCase().replace('#', '')));

  const handleCreateDroplet = (e) => {
    e.preventDefault();
    if (!newDropletText.trim()) return;

    const newDrop = clientStore.addDroplet({
      content: newDropletText,
      tag: newTag,
    });

    setDroplets([newDrop, ...droplets]);
    setNewDropletText('');
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
    alert('Skill Droplet reposted to your followers!');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
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
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover"
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
                    <option value="#Linux">#Linux #DevOps</option>
                    <option value="#DesignTips">#DesignTips</option>
                    <option value="#Nextjs">#Nextjs</option>
                    <option value="#CodeTip">#CodeTip</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono ${
                      newDropletText.length > 250 ? 'text-amber-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {280 - newDropletText.length}
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition shadow-sm"
                  >
                    Drop Tip ⚡
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition flex-shrink-0 ${
                selectedTag === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Droplets Feed */}
        <div className="space-y-4">
          {filteredDroplets.map((drop) => (
            <div
              key={drop.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 hover:border-indigo-300 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={drop.author?.avatar}
                    alt={drop.author?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{drop.author?.name}</span>
                      <span className="text-slate-400 font-normal text-xs">{drop.handle}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{drop.timeAgo}</div>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {drop.tag}
                </span>
              </div>

              <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed my-3 font-sans">
                {drop.content}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 max-w-sm">
                <button
                  onClick={() => alert(`Replied to ${drop.author?.name}`)}
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
                  onClick={() => alert('Tip bookmarked to your collection!')}
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
