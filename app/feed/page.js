'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_POSTS, DEMO_USERS, DEMO_STORIES } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.alex);
  const [newContent, setNewContent] = useState('');
  const [newSkillTag, setNewSkillTag] = useState('Frontend Engineering');
  const [newCategory, setNewCategory] = useState('Code Breakdown');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    setCurrentUser(clientStore.getCurrentUser());
    setPosts(clientStore.getPosts());
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newPost = clientStore.addPost({
      content: newContent,
      skillTag: newSkillTag,
      category: newCategory,
      media: mediaPreview,
    });

    setPosts([newPost, ...posts]);
    setNewContent('');
    setMediaPreview(null);
    setShowPostComposer(false);
  };

  const handleLike = (postId) => {
    const updated = clientStore.toggleLikePost(postId);
    setPosts(updated);
  };

  const handleAddComment = (postId) => {
    if (!commentInput.trim()) return;
    const updated = clientStore.addCommentToPost(postId, commentInput);
    setPosts(updated);
    setCommentInput('');
    setActiveCommentPostId(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header & Social Paradigm Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📰</span>
              <h1 className="text-xl font-black text-slate-900">Skill Feed & Peer Updates</h1>
              <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                Facebook & Threads Paradigm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Share code walkthroughs, ask technical questions, and celebrate peer learning achievements.
            </p>
          </div>

          <button
            onClick={() => setShowPostComposer(!showPostComposer)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <span>✍️</span>
            <span>{showPostComposer ? 'Close Composer' : 'Create Skill Post'}</span>
          </button>
        </div>

        {/* Stories Bar (Snapchat & Instagram 24h updates) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
            <span>👻</span>
            <span>24h Daily Practice Snaps</span>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            {DEMO_STORIES.map((s) => (
              <div key={s.id} className="flex-shrink-0 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-indigo-600">
                  <img
                    src={s.author?.avatar || s.preview}
                    alt={s.author?.name || 'Story'}
                    className="w-full h-full rounded-full object-cover border border-white"
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-700 mt-1">{(s.author?.name || 'Peer').split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Post Composer Modal / Card */}
        {showPostComposer && (
          <form
            onSubmit={handleCreatePost}
            className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-md space-y-4 transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-indigo-200"
              />
              <div>
                <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400">Posting to Community Skill Feed</div>
              </div>
            </div>

            <textarea
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What skill are you building or sharing today? Share insights, code tips, or ask for peer review..."
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary Skill Tag</label>
                <select
                  value={newSkillTag}
                  onChange={(e) => setNewSkillTag(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Frontend Engineering">Frontend Engineering (React / Next.js)</option>
                  <option value="Machine Learning">Machine Learning & PyTorch</option>
                  <option value="DevOps & Cloud">DevOps & Cloud Architecture</option>
                  <option value="UI/UX Design">UI/UX Design & Figma</option>
                  <option value="System Design">System Design & Databases</option>
                  <option value="Cybersecurity">Cybersecurity & Ethics</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Post Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Code Breakdown">Code Breakdown & Tutorial</option>
                  <option value="Architecture Case Study">Architecture Case Study</option>
                  <option value="Project Launch">Project Launch & Showcase</option>
                  <option value="Peer Question">Peer Question & Help Needed</option>
                </select>
              </div>
            </div>

            {/* Media Upload (Base64 Ephemeral Safe) */}
            <div className="flex items-center justify-between pt-2">
              <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                <span>📷</span>
                <span>Attach Screenshot / Diagram</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Publish Post
              </button>
            </div>

            {mediaPreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-60">
                <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setMediaPreview(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full"
                >
                  Remove
                </button>
              </div>
            )}
          </form>
        )}

        {/* Posts Stream */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={post.author?.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900">{post.author?.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {post.author?.role} · <span className="text-slate-400">Published Recently</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {post.skillTag}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {post.content}
              </p>

              {/* Post Media */}
              {post.media && (
                <div className="rounded-xl overflow-hidden border border-slate-100 max-h-96 bg-slate-950">
                  <img src={post.media} alt="Post asset" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition px-3 py-1.5 rounded-lg ${
                    post.isLiked
                      ? 'text-rose-600 bg-rose-50'
                      : 'hover:text-rose-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{post.isLiked ? '❤️' : '🤍'}</span>
                  <span>{post.likesCount} Helpful</span>
                </button>

                <button
                  onClick={() =>
                    setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                  }
                  className="flex items-center gap-1.5 font-medium hover:text-indigo-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
                >
                  <span>💬</span>
                  <span>{post.commentsCount || 0} Discussions</span>
                </button>

                <button
                  onClick={() => showToast('🔗 Link copied to clipboard for peer sharing!')}
                  className="flex items-center gap-1.5 font-medium hover:text-indigo-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
                >
                  <span>↗</span>
                  <span>{post.sharesCount || 0} Reposts</span>
                </button>
              </div>

              {/* Comment Thread Box */}
              {activeCommentPostId === post.id && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write a constructive peer comment or reply..."
                      className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      Reply
                    </button>
                  </div>

                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {post.comments.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{c.author?.name || 'Peer'}</span>
                            <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                          </div>
                          <p className="text-slate-700">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
