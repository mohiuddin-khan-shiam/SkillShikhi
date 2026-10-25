'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DEMO_USERS,
  DEMO_POSTS,
  DEMO_REELS,
  DEMO_PINS,
  DEMO_DROPLETS,
  DEMO_COMMUNITIES,
  DEMO_SESSIONS,
  DEMO_ADMIN_DATA,
  DEMO_STORIES,
} from '../lib/demoData';
import { clientStore } from '../lib/clientStore';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [reels, setReels] = useState(DEMO_REELS);
  const [pins, setPins] = useState(DEMO_PINS);
  const [droplets, setDroplets] = useState(DEMO_DROPLETS);
  const [selectedStory, setSelectedStory] = useState(null);

  const handleQuickRole = (role) => {
    clientStore.switchRole(role);
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/profile');
    }
  };

  const handleLikePost = (postId) => {
    const updated = clientStore.toggleLikePost(postId);
    setPosts(updated);
  };

  const handleSavePin = (pinId) => {
    const updated = clientStore.toggleSavePin(pinId);
    setPins(updated);
  };

  const platformPills = [
    { name: 'Facebook', role: 'Skill Feed', color: 'bg-blue-600', icon: '🌐' },
    { name: 'Threads', role: 'Conversations', color: 'bg-slate-900', icon: '🧵' },
    { name: 'LinkedIn', role: 'Skill Mastery', color: 'bg-sky-700', icon: '💼' },
    { name: 'YouTube', role: 'Live Workshops', color: 'bg-red-600', icon: '📺' },
    { name: 'Classroom', role: 'Peer Sessions', color: 'bg-emerald-600', icon: '🏫' },
    { name: 'TikTok', role: 'Micro-Reels', color: 'bg-rose-600', icon: '⚡' },
    { name: 'Instagram', role: 'Reels & Stories', color: 'bg-pink-600', icon: '📸' },
    { name: 'WhatsApp', role: 'Study Pods', color: 'bg-emerald-500', icon: '💬' },
    { name: 'Telegram', role: 'Channels', color: 'bg-sky-500', icon: '✈️' },
    { name: 'Reddit', role: 'Sub-Communities', color: 'bg-orange-600', icon: '🤖' },
    { name: 'X / Twitter', role: 'Code Droplets', color: 'bg-slate-800', icon: '🚀' },
    { name: 'Pinterest', role: 'Pinboards', color: 'bg-red-700', icon: '📌' },
    { name: 'Snapchat', role: 'Daily Streaks', color: 'bg-yellow-500', icon: '👻' },
    { name: 'Messenger', role: 'Tutor Alerts', color: 'bg-indigo-600', icon: '💬' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. Recruiter Fast-Action Bar */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white py-4 px-4 sm:px-6 border-b border-indigo-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="text-2xl">👋</span>
            <div>
              <div className="font-bold text-sm text-indigo-200">
                Welcome Job Recruiter & Hiring Manager!
              </div>
              <div className="text-xs text-slate-300">
                Explore the entire application without auth walls. Choose a role to experience all features:
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleQuickRole('learner')}
              className="bg-indigo-700/80 hover:bg-indigo-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg border border-indigo-400/40 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>🎒</span>
              <span>Learner View (Alex)</span>
            </button>
            <button
              onClick={() => handleQuickRole('mentor')}
              className="bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg border border-emerald-400/40 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>🎓</span>
              <span>Mentor View (Dr. Sarah)</span>
            </button>
            <button
              onClick={() => handleQuickRole('admin')}
              className="bg-violet-700/80 hover:bg-violet-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg border border-violet-400/40 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>🛡️</span>
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Concept Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            14 Major Social Media Platforms Unified for Skill Sharing & Learning
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Where Social Media Meets{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
              Peer Skill Sharing
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            <strong>SkillShikhi</strong> reimagines the viral interaction mechanics of Facebook, TikTok, LinkedIn,
            Reddit, Pinterest, X, and YouTube purely for technical education, live peer classrooms, and community mentorship.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/feed"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5"
            >
              📰 Open Social Feed
            </Link>
            <Link
              href="/reels"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition transform hover:-translate-y-0.5"
            >
              ⚡ Watch Skill Reels
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 font-bold text-sm rounded-xl shadow-xs transition"
            >
              🛡️ Review Admin Hub
            </Link>
          </div>

          {/* Social Platform Badges Carousel */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Synthesized UX Paradigms
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {platformPills.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs shadow-2xs font-medium text-slate-700"
                >
                  <span>{p.icon}</span>
                  <span className="font-semibold text-slate-900">{p.name}</span>
                  <span className="text-[10px] text-slate-400">({p.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Daily Streaks & Stories (Snapchat / Instagram) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">👻</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">24-Hour Skill Streaks & Daily Snaps</h2>
              <p className="text-xs text-slate-500">Snapchat & Instagram style peer learning updates</p>
            </div>
          </div>
          <span className="text-xs text-indigo-600 font-semibold cursor-pointer">Click to inspect</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none">
          {DEMO_STORIES.map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
            >
              <div className="w-18 h-18 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-rose-500 to-indigo-600 group-hover:scale-105 transition transform shadow-md">
                <img
                  src={story.author.avatar}
                  alt={story.author.name}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-indigo-600 text-center max-w-[80px] truncate">
                {story.author.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400">{story.timeAgo}</span>
            </div>
          ))}
        </div>

        {/* Story Modal Preview */}
        {selectedStory && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-700">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedStory.author.avatar}
                    alt={selectedStory.author.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-sm">{selectedStory.author.name}</div>
                    <div className="text-[10px] text-slate-400">{selectedStory.timeAgo} · {selectedStory.tag}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
                >
                  ✕
                </button>
              </div>
              <div className="relative h-64 bg-slate-950">
                <img
                  src={selectedStory.preview}
                  alt={selectedStory.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-4">
                  <h3 className="font-bold text-lg text-white">{selectedStory.title}</h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-slate-200 leading-relaxed">{selectedStory.content}</p>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>👁️ {selectedStory.views} peer views</span>
                  <button
                    onClick={() => {
                      setSelectedStory(null);
                      router.push('/chat');
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                  >
                    Reply to Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Master Interactive Feature Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Showcase Tabs */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 pt-3 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'feed'
                  ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📰</span>
              <span>Facebook / Threads Feed</span>
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'reels'
                  ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⚡</span>
              <span>TikTok / IG Reels</span>
            </button>
            <button
              onClick={() => setActiveTab('pins')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'pins'
                  ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📌</span>
              <span>Pinterest Pinboard</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'community'
                  ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🤖</span>
              <span>Reddit Communities</span>
            </button>
            <button
              onClick={() => setActiveTab('droplets')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'droplets'
                  ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🚀</span>
              <span>X / Twitter Droplets</span>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'sessions'
                  ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📅</span>
              <span>Classrooms & YouTube</span>
            </button>
          </div>

          {/* Active Tab Contents */}
          <div className="p-6">
            {/* Tab 1: Feed Preview */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Social Skill Feed (Facebook & Threads UX)</h3>
                    <p className="text-xs text-slate-500">Peer updates, code breakdowns, likes & threaded discussions</p>
                  </div>
                  <Link href="/feed" className="text-xs font-bold text-indigo-600 hover:underline">
                    View Full Feed Hub →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-bold text-sm text-slate-900">{post.author.name}</div>
                              <div className="text-[11px] text-slate-500">{post.author.role}</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                            {post.skillTag}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed mb-4">
                          {post.content}
                        </p>

                        {post.media && (
                          <div className="rounded-lg overflow-hidden mb-4 border border-slate-100 max-h-56">
                            <img src={post.media} alt="Post media" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1.5 font-semibold transition ${
                            post.isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                          }`}
                        >
                          <span>{post.isLiked ? '❤️' : '🤍'}</span>
                          <span>{post.likesCount} Likes</span>
                        </button>
                        <span className="flex items-center gap-1">
                          <span>💬</span>
                          <span>{post.commentsCount} Comments</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>↗</span>
                          <span>{post.sharesCount} Shares</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Reels Preview */}
            {activeTab === 'reels' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Skill Reels (TikTok & Instagram UX)</h3>
                    <p className="text-xs text-slate-500">60-second vertical micro-lessons and coding walk-throughs</p>
                  </div>
                  <Link href="/reels" className="text-xs font-bold text-indigo-600 hover:underline">
                    View Full Reels Hub →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {reels.slice(0, 3).map((reel) => (
                    <div
                      key={reel.id}
                      className="bg-slate-900 text-white rounded-xl overflow-hidden shadow-md flex flex-col justify-between"
                    >
                      <div className="relative h-64 bg-slate-950">
                        <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover opacity-85" />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ⏱ {reel.duration}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="text-[10px] bg-indigo-600 font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                            {reel.skillTag}
                          </span>
                          <h4 className="font-bold text-sm leading-snug drop-shadow-md">{reel.title}</h4>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-800/90 text-[11px] text-slate-300 border-t border-slate-700/60">
                        <div className="line-clamp-2 italic mb-2">"{reel.tip}"</div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>❤️ {reel.likes}</span>
                          <span>💬 {reel.comments}</span>
                          <span className="text-indigo-400">By {reel.author.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Pinterest Pins */}
            {activeTab === 'pins' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Inspiration Pinboards (Pinterest UX)</h3>
                    <p className="text-xs text-slate-500">Architecture diagrams, UI kits & database cheatsheets</p>
                  </div>
                  <Link href="/pins" className="text-xs font-bold text-indigo-600 hover:underline">
                    View Full Pinboard →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {pins.slice(0, 3).map((pin) => (
                    <div
                      key={pin.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition"
                    >
                      <div className="relative h-48 bg-slate-100">
                        <img src={pin.image} alt={pin.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleSavePin(pin.id)}
                          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md transition ${
                            pin.isSaved ? 'bg-rose-600 text-white' : 'bg-white/90 text-slate-800 hover:bg-white'
                          }`}
                        >
                          {pin.isSaved ? 'Saved ✓' : 'Save Pin 📌'}
                        </button>
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {pin.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1 mb-2">{pin.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{pin.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Reddit Communities */}
            {activeTab === 'community' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Sub-Shikhi Communities (Reddit UX)</h3>
                    <p className="text-xs text-slate-500">Upvoting, karma, Q&A forums, and verified best answers</p>
                  </div>
                  <Link href="/community" className="text-xs font-bold text-indigo-600 hover:underline">
                    Explore Communities →
                  </Link>
                </div>

                <div className="space-y-4">
                  {DEMO_COMMUNITIES.map((comm) => (
                    <div key={comm.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{comm.icon}</span>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{comm.name}</div>
                            <div className="text-xs text-slate-500">{comm.description}</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                          {comm.membersCount} members
                        </span>
                      </div>
                      <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200/80">
                        <div className="text-xs font-semibold text-slate-900">
                          🔥 Hot Discussion: {comm.threads[0]?.title}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-3">
                          <span>⬆ {comm.threads[0]?.upvotes} Upvotes</span>
                          <span>💬 {comm.threads[0]?.commentsCount} Replies</span>
                          {comm.threads[0]?.isBestAnswered && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ✓ Best Answer Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: X / Twitter Droplets */}
            {activeTab === 'droplets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Skill Droplets (X & Twitter UX)</h3>
                    <p className="text-xs text-slate-500">280-char punchy engineering tips, snippets & terminal one-liners</p>
                  </div>
                  <Link href="/droplets" className="text-xs font-bold text-indigo-600 hover:underline">
                    View All Droplets →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {droplets.map((drop) => (
                    <div key={drop.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={drop.author.avatar}
                            alt={drop.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900">{drop.author.name}</div>
                            <div className="text-[10px] text-slate-400">{drop.handle} · {drop.timeAgo}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {drop.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed mb-3">
                        {drop.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
                        <span>💬 {drop.replies}</span>
                        <span>🔁 {drop.reposts}</span>
                        <span>❤️ {drop.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 6: Classrooms & Sessions */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Virtual Classrooms & YouTube Workshops</h3>
                    <p className="text-xs text-slate-500">Scheduled 1-on-1 peer teaching and group live workshops</p>
                  </div>
                  <Link href="/sessions" className="text-xs font-bold text-indigo-600 hover:underline">
                    Open Full Calendar →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {DEMO_SESSIONS.slice(0, 2).map((sess) => (
                    <div key={sess.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {sess.skill}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          {sess.scheduledDate} at {sess.scheduledTime}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mb-2">{sess.title}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={sess.instructor.avatar}
                          alt={sess.instructor.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-slate-600">
                          Instructor: <strong>{sess.instructor.name}</strong> ({sess.instructor.role})
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1 mb-4">
                        <div className="font-semibold text-slate-700">Workshop Syllabus:</div>
                        {sess.agenda.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <span>•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                          👥 {sess.enrolledCount} / {sess.maxSeats} enrolled
                        </span>
                        <Link
                          href="/sessions"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                        >
                          Book Seat / Join
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Key Architecture Features for the Recruiter */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Engineering Deep Dive
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black">
              Engineered for Production & Serverless Resilience
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Architectural decisions designed specifically for modern Vercel edge deployment and frictionless recruiter review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="text-3xl mb-3">🛡️</div>
              <h4 className="font-bold text-base text-white mb-2">Resilient Fallback Data Layer</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Serverless API endpoints automatically catch database timeouts (e.g. paused free MongoDB Atlas clusters) and seamlessly fallback to high-fidelity mock data. Zero 500 error crashes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="text-3xl mb-3">📁</div>
              <h4 className="font-bold text-base text-white mb-2">Ephemeral Storage Safe</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vercel functions are strictly read-only (`EROFS` safe). Media uploads, new posts, and pin additions use client-side Base64 object hydration and localStorage persistence without relying on server disk writes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold text-base text-white mb-2">Next.js 15 & React 19</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built with the latest App Router paradigms, dynamic client components, optimized remote image patterns, and accessible responsive UI design.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
