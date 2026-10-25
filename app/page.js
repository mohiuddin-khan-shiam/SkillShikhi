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
  DEMO_STORIES,
} from '../lib/demoData';
import { clientStore } from '../lib/clientStore';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState(DEMO_POSTS || []);
  const [reels, setReels] = useState(DEMO_REELS || []);
  const [pins, setPins] = useState(DEMO_PINS || []);
  const [droplets, setDroplets] = useState(DEMO_DROPLETS || []);
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
    if (updated) {
      setPosts(updated);
    }
  };

  const handleSavePin = (pinId) => {
    const updated = clientStore.toggleSavePin(pinId);
    if (updated) {
      setPins(updated);
    }
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
    <div className="bg-slate-50 min-h-screen text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Concept Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 border border-indigo-200 text-indigo-800 text-xs font-bold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            14 Major Social Paradigms Unified for Peer Learning
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Where Social Networks Meet{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
              Technical Mastery
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            SkillShikhi re-engineers viral social mechanics—feeds, 60s vertical reels, architecture pinboards, and developer droplets—purely for technical education, live peer classrooms, and community mentorship.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/feed"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 text-sm flex items-center gap-2"
            >
              <span>🌐</span>
              <span>Launch Live Feed</span>
            </Link>
            <Link
              href="/reels"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-rose-200 transition transform hover:-translate-y-0.5 text-sm flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Watch Skill Reels</span>
            </Link>
            <Link
              href="/admin/dashboard"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm flex items-center gap-2"
            >
              <span>🛡️</span>
              <span>Admin Operations</span>
            </Link>
          </div>

          {/* Quick Demo Persona Pills */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Experience As:</span>
            <button
              onClick={() => handleQuickRole('learner')}
              className="bg-white hover:bg-indigo-50 text-indigo-700 font-semibold py-1.5 px-3 rounded-lg border border-indigo-200 shadow-2xs transition flex items-center gap-1.5"
            >
              <span>🎒</span>
              <span>Student (Alex)</span>
            </button>
            <button
              onClick={() => handleQuickRole('mentor')}
              className="bg-white hover:bg-emerald-50 text-emerald-700 font-semibold py-1.5 px-3 rounded-lg border border-emerald-200 shadow-2xs transition flex items-center gap-1.5"
            >
              <span>🎓</span>
              <span>Mentor (Dr. Sarah)</span>
            </button>
            <button
              onClick={() => handleQuickRole('admin')}
              className="bg-white hover:bg-violet-50 text-violet-700 font-semibold py-1.5 px-3 rounded-lg border border-violet-200 shadow-2xs transition flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>Lead Admin (Shiam)</span>
            </button>
          </div>

          {/* Synthesized Platforms Strip */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-5xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Integrated Learning Paradigms
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {platformPills.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs flex items-center gap-1.5 text-xs text-slate-700"
                >
                  <span>{p.icon}</span>
                  <span className="font-bold text-slate-900">{p.name}</span>
                  <span className="text-[10px] text-slate-400">({p.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Daily Learning Stories (Snapchat / Instagram) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Daily Learning Check-ins & Stories (Snapchat / Instagram)
              </h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">Click avatar to inspect today's update</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 no-scrollbar">
            {(DEMO_STORIES || []).map((story) => {
              const authorName = story?.author?.name || story?.userName || 'Peer Member';
              const authorAvatar = story?.author?.avatar || story?.userAvatar || story?.preview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
              const firstName = authorName.split(' ')[0] || 'Peer';
              const viewsCount = story?.views || 350;

              return (
                <button
                  key={story.id}
                  onClick={() =>
                    setSelectedStory({
                      ...story,
                      authorName,
                      authorAvatar,
                      viewsCount,
                      caption: story?.content || story?.title || 'Daily Progress',
                      mediaUrl: story?.preview || story?.mediaUrl,
                    })
                  }
                  className="flex flex-col items-center gap-2 group flex-shrink-0 focus:outline-none"
                >
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 group-hover:scale-105 transition-transform">
                    <div className="bg-white p-0.5 rounded-full">
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-14 h-14 rounded-full object-cover"
                        style={{ width: '56px', height: '56px' }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate max-w-[70px]">
                      {firstName}
                    </div>
                    <div className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-0.5">
                      <span>🔥</span>
                      <span>{viewsCount} views</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStory.authorAvatar}
                  alt={selectedStory.authorName}
                  className="w-9 h-9 rounded-full object-cover border border-amber-400"
                  style={{ width: '36px', height: '36px' }}
                />
                <div>
                  <div className="text-sm font-bold">{selectedStory.authorName}</div>
                  <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                    <span>🔥 {selectedStory.viewsCount} Community Views Today</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
              >
                ✕
              </button>
            </div>

            {/* Media */}
            <div className="relative aspect-[9/12] bg-slate-950 flex items-center justify-center">
              <img
                src={selectedStory.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-5">
                <p className="text-white text-base font-semibold drop-shadow-md">
                  {selectedStory.caption}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                  <span className="bg-indigo-600/80 px-2 py-1 rounded text-white font-medium">
                    Verified Daily Update
                  </span>
                  <span>Tap anywhere to close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Multi-Platform Live Preview Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Explore The 6 Core Learning Hubs
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Switch between paradigms to experience how different social interaction patterns are applied to technical skill mastery.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {[
            { id: 'feed', label: 'Skill Feed', icon: '📰', badge: 'FB / Threads' },
            { id: 'reels', label: '60s Reels', icon: '⚡', badge: 'TikTok / IG' },
            { id: 'pins', label: 'Blueprints', icon: '📌', badge: 'Pinterest' },
            { id: 'community', label: 'Communities', icon: '🤖', badge: 'Reddit' },
            { id: 'droplets', label: 'Droplets', icon: '🚀', badge: 'X / Twitter' },
            { id: 'sessions', label: 'Classroom', icon: '📺', badge: 'YouTube' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  activeTab === tab.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content Panes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          {/* TAB: FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Interactive Social Feed (Facebook & Threads Paradigm)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rich technical walk-throughs, architecture updates, and peer code discussions.
                  </p>
                </div>
                <Link
                  href="/feed"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Full Feed</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(posts || []).slice(0, 2).map((post) => {
                  const author = post?.author || {};
                  const authorName = author.name || 'Developer';
                  const authorAvatar = author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                  const authorHeadline = author.headline || 'Full Stack Engineer';
                  const postMedia = post?.media || post?.image;
                  const likesCount = post?.likesCount ?? post?.likes ?? 142;
                  const isLiked = post?.isLiked ?? post?.likedByMe ?? false;
                  const commentsCount = post?.comments?.length ?? post?.commentsCount ?? 12;

                  return (
                    <div
                      key={post.id}
                      className="border border-slate-200/80 rounded-xl p-5 hover:border-indigo-200 hover:shadow-xs transition bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-900">{authorName}</div>
                          <div className="text-xs text-slate-500">{authorHeadline}</div>
                        </div>
                      </div>

                      <p className="text-sm text-slate-800 leading-relaxed mb-4 whitespace-pre-line">
                        {post.content}
                      </p>

                      {postMedia && (
                        <div className="rounded-lg overflow-hidden mb-4 border border-slate-200 aspect-video bg-slate-100">
                          <img
                            src={postMedia}
                            alt="Post media"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1.5 font-semibold transition ${
                            isLiked ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
                          }`}
                        >
                          <span>{isLiked ? '❤️' : '🤍'}</span>
                          <span>{likesCount} Likes</span>
                        </button>
                        <span className="text-slate-500">💬 {commentsCount} Comments</span>
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                          #{post.skillTag || post.category || 'Engineering'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: REELS */}
          {activeTab === 'reels' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    60-Second Vertical Skill Reels (TikTok & Instagram Paradigm)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bite-sized, high-yield conceptual breakdowns with instant key takeaways.
                  </p>
                </div>
                <Link
                  href="/reels"
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Full Reel Player</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(reels || []).map((reel) => {
                  const author = reel?.author || {};
                  const authorName = author.name || 'Instructor';
                  const authorAvatar = author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                  const takeaway = reel?.tip || reel?.takeaway || 'High-efficiency micro-lesson';

                  return (
                    <div
                      key={reel.id}
                      className="relative rounded-2xl overflow-hidden aspect-[9/14] bg-slate-950 group shadow-md"
                    >
                      <video
                        src={reel.videoUrl}
                        poster={reel.thumbnail}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                        loop
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            60s Reel
                          </span>
                          <span className="text-xs text-white/90 font-semibold">{reel.duration}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={authorAvatar}
                              alt={authorName}
                              className="w-7 h-7 rounded-full object-cover border border-white"
                              style={{ width: '28px', height: '28px' }}
                            />
                            <span className="text-xs font-bold text-white">{authorName}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-snug mb-1">{reel.title}</h4>
                          <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 text-[11px] text-white/90 border border-white/10 mt-2">
                            💡 <strong>Key Takeaway:</strong> {takeaway}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PINS */}
          {activeTab === 'pins' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Architecture & Cheat Sheet Pinboards (Pinterest Paradigm)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visual bookmarks for system designs, Git commands, Docker pipelines, and CSS grids.
                  </p>
                </div>
                <Link
                  href="/pins"
                  className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Full Pinboard</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(pins || []).map((pin) => {
                  const author = pin?.author || {};
                  const authorName = author.name || pin?.authorName || 'Creator';
                  const pinImage = pin?.image || pin?.imageUrl;
                  const isSaved = pin?.isSaved ?? pin?.savedByMe ?? false;
                  const savesCount = pin?.saves ?? 240;

                  return (
                    <div
                      key={pin.id}
                      className="border border-slate-200/80 rounded-xl overflow-hidden hover:shadow-md transition bg-slate-50/50 group"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={pinImage}
                          alt={pin.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => handleSavePin(pin.id)}
                          className={`absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition ${
                            isSaved
                              ? 'bg-red-600 text-white'
                              : 'bg-white/90 hover:bg-white text-slate-900 backdrop-blur-sm'
                          }`}
                        >
                          {isSaved ? '📌 Saved' : 'Save'}
                        </button>
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {pin.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-2">{pin.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{pin.description}</p>
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                          <span>Pinned by {authorName}</span>
                          <span>❤️ {savesCount} Saves</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: COMMUNITY */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Technical Sub-Communities (Reddit Paradigm)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Topic-specific sub-shikhis with community upvoting and verified mentor answers.
                  </p>
                </div>
                <Link
                  href="/community"
                  className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Full Communities</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(DEMO_COMMUNITIES || []).map((c) => (
                  <div
                    key={c.id}
                    className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 hover:border-orange-300 transition"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{c.name}</div>
                        <div className="text-xs text-orange-600 font-semibold">{c.slug}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">{c.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                      <span>👥 {c.members?.toLocaleString?.() || c.members} Members</span>
                      <span className="text-emerald-600 font-semibold">● {c.online} online</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DROPLETS */}
          {activeTab === 'droplets' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    280-Character Code Droplets (X / Twitter Paradigm)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Terminal one-liners, concise architecture tips, and rapid engineering takeaways.
                  </p>
                </div>
                <Link
                  href="/droplets"
                  className="text-xs font-bold text-slate-800 hover:text-black flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Full Droplet Stream</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(droplets || []).map((d) => {
                  const author = d?.author || {};
                  const authorName = author.name || 'Developer';
                  const authorAvatar = author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                  const authorHandle = d?.handle || author.username || 'dev';
                  const dropletContent = d?.content || d?.text || '';

                  return (
                    <div
                      key={d.id}
                      className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 hover:border-slate-400 transition"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="w-8 h-8 rounded-full object-cover"
                          style={{ width: '32px', height: '32px' }}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{authorName}</div>
                          <div className="text-[11px] text-slate-500">{authorHandle}</div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-800 font-mono bg-white p-3 rounded-lg border border-slate-200 leading-relaxed my-2">
                        {dropletContent}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                        <div className="flex items-center gap-4">
                          <span>❤️ {d.likes}</span>
                          <span>🔄 {d.reposts}</span>
                        </div>
                        <span className="text-indigo-600 font-medium">#{d.tag || 'Tip'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Live Peer Classrooms & Tutoring (YouTube & Classroom Paradigm)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hands-on interactive workshops with screen sharing, live chat, and instant seat reservation.
                  </p>
                </div>
                <Link
                  href="/sessions"
                  className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Full Classroom</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(DEMO_SESSIONS || []).map((s) => {
                  const instructor = s?.instructor || {};
                  const instructorName = instructor.name || 'Lead Mentor';
                  const instructorAvatar = instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                  const duration = s?.durationMinutes ? `${s.durationMinutes} min` : '45 min';
                  const attendees = s?.enrolledCount ?? 20;
                  const maxAttendees = s?.maxSeats ?? 30;

                  return (
                    <div
                      key={s.id}
                      className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 hover:border-red-300 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {s.level || 'All'} Level
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{duration}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mb-1">{s.title}</h4>
                      <p className="text-xs text-slate-600 mb-3">{s.skill || 'Hands-on live session'}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={instructorAvatar}
                            alt={instructorName}
                            className="w-6 h-6 rounded-full object-cover"
                            style={{ width: '24px', height: '24px' }}
                          />
                          <span className="font-medium text-slate-700">{instructorName}</span>
                        </div>
                        <Link
                          href="/sessions"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1 rounded-lg text-xs transition"
                        >
                          Reserve Seat ({attendees}/{maxAttendees})
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Architecture & Engineering Highlights */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Robust Full-Stack Engineering
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mt-2">
              Engineered for Real-World Scalability
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Designed for zero-downtime serverless deployments, offline resilience, and optimistic client-side hydration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-base text-white mb-1">Next.js 15 & React 19</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                App Router architecture with Server Components, streaming SSR, and Next.js 15 dynamic metadata.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-bold text-base text-white mb-1">Resilient Fallback Layer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic fallback handling across all endpoints ensures 0% 500 error rates when external databases sleep.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl mb-3">📁</div>
              <h3 className="font-bold text-base text-white mb-1">Ephemeral Serverless Safe</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero disk writes (`EROFS`-safe). Client uploads sync seamlessly via Base64 and browser localStorage.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-bold text-base text-white mb-1">Instant Multi-Role Simulation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic switching between Learner, Mentor, and Lead Admin with full dashboard access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final Call To Action */}
      <section className="py-16 sm:py-20 bg-gradient-to-tr from-indigo-700 via-indigo-800 to-violet-800 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Start Learning & Sharing Today
          </h2>
          <p className="mt-4 text-sm sm:text-base text-indigo-100 max-w-xl mx-auto">
            Join thousands of developers, researchers, and creators sharing knowledge across 14 interactive social learning paradigms.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/feed"
              className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition text-sm"
            >
              Explore Feed
            </Link>
            <Link
              href="/skills"
              className="bg-indigo-950/60 text-white border border-indigo-400/40 font-bold px-6 py-3 rounded-xl hover:bg-indigo-950 transition text-sm"
            >
              Browse Skills Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
