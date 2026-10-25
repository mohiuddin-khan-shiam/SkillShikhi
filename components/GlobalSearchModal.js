'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ skills: [], users: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults({ skills: [], users: [] });
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults({ skills: [], users: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data || { skills: [], users: [] });
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSkill = (skillName) => {
    onClose();
    router.push(`/skills/${encodeURIComponent(skillName)}`);
  };

  const handleSelectUser = (userId) => {
    onClose();
    router.push(`/user/${userId}`);
  };

  if (!isOpen) return null;

  const popularSuggestions = ['React', 'Next.js', 'Python', 'Tailwind CSS', 'Docker', 'Sarah'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 transition-all transform scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <span className="text-slate-400 text-lg mr-3">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, peers, mentors (e.g. React, Sarah, Python)..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {loading && (
            <span className="animate-spin text-indigo-500 text-sm mr-2">⟳</span>
          )}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded mr-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-200/80 hover:bg-slate-300 text-slate-600 font-semibold px-2 py-1 rounded-md transition"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 transition"
                  >
                    #{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !loading && results.skills.length === 0 && results.users.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              <span className="text-3xl block mb-2">🔭</span>
              No skills or peers matching &ldquo;<span className="font-semibold text-slate-700">{query}</span>&rdquo;
            </div>
          )}

          {/* Matched Skills */}
          {results.skills.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center justify-between">
                <span>🎓 Skills ({results.skills.length})</span>
                <span className="text-[10px] text-slate-400">Click to view endorsements</span>
              </div>
              <div className="space-y-1">
                {results.skills.map((skill) => (
                  <button
                    key={skill._id || skill.name}
                    onClick={() => handleSelectSkill(skill.name)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {skill.name.charAt(0)}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700">
                          {skill.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Mastery directory & peer endorsements
                        </div>
                      </div>
                    </div>
                    {skill.count && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {skill.count} peers
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Users */}
          {results.users.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>👥 Peers & Mentors ({results.users.length})</span>
                <span className="text-[10px] text-slate-400">Click to visit profile</span>
              </div>
              <div className="space-y-1.5">
                {results.users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.isPublic && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-100 font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>📍 {user.location}</span>
                          {user.skills && user.skills.length > 0 && (
                            <span>• {user.skills.slice(0, 3).join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition">
                      View →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] shadow-2xs">ESC</kbd> to exit</span>
          </div>
          <span className="text-indigo-600 font-medium">SkillShikhi Global Directory</span>
        </div>
      </div>
    </div>
  );
}
