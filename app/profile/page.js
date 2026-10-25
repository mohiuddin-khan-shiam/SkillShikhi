'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(DEMO_USERS.alex);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'posts', 'about'
  const [masteredSkills, setMasteredSkills] = useState([]);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Skill Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillExp, setNewSkillExp] = useState(2);

  // New Post Form
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState('Full Stack Engineering');

  // Posts
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const currentUser = clientStore.getCurrentUser() || DEMO_USERS.alex;
    setUser(currentUser);
    setMasteredSkills(currentUser.masteredSkills || [
      { name: 'JavaScript & TypeScript', experienceYears: 3, endorsements: 18, description: 'Modern ESNext, strict typing, and Node.js backend development.' },
      { name: 'React 19 & Next.js 15', experienceYears: 2, endorsements: 24, description: 'Server components, client hydration, and optimistic state engines.' },
      { name: 'Tailwind CSS', experienceYears: 3, endorsements: 15, description: 'Component design systems, responsive utilities, and custom tokens.' }
    ]);
    setUserPosts(clientStore.getPosts().filter((p) => p.author?.username === currentUser.username || p.author?.id === currentUser.id));
  }, []);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill = {
      name: newSkillName.trim(),
      description: newSkillDesc.trim(),
      experienceYears: parseInt(newSkillExp, 10) || 1,
      endorsements: 1,
    };

    const updated = [newSkill, ...masteredSkills];
    setMasteredSkills(updated);

    // Save to user object
    const updatedUser = { ...user, masteredSkills: updated };
    setUser(updatedUser);
    clientStore.setCurrentUser(updatedUser);

    setNewSkillName('');
    setNewSkillDesc('');
    setShowSkillModal(false);
    showToast(`🎓 Mastered skill "${newSkill.name}" added to your profile!`);
  };

  const handleDeleteSkill = (skillName) => {
    const updated = masteredSkills.filter((s) => s.name !== skillName);
    setMasteredSkills(updated);
    const updatedUser = { ...user, masteredSkills: updated };
    setUser(updatedUser);
    clientStore.setCurrentUser(updatedUser);
    showToast(`Skill removed from profile.`);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const post = clientStore.addPost({
      content: newPostContent.trim(),
      skillTag: newPostTag,
    });

    setUserPosts([post, ...userPosts]);
    setNewPostContent('');
    setShowPostModal(false);
    showToast(`📰 Post published to the Skill Feed!`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Profile Card & Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Cover Banner */}
          <div className="h-36 sm:h-48 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Header Details */}
          <div className="px-6 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
              <div className="flex items-end gap-4">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
                    {user.isAdmin ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-violet-100 text-violet-800 rounded-full border border-violet-200">
                        Admin Lead
                      </span>
                    ) : user.role?.includes('Mentor') ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                        Mentor
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                        Learner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">@{user.username || 'user'} · {user.role || 'Member'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  onClick={() => setShowSkillModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>+</span>
                  <span>Add Mastered Skill</span>
                </button>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>✍️</span>
                  <span>Create Post</span>
                </button>
                <Link
                  href="/profile/edit"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  title="Edit Profile"
                >
                  ⚙️
                </Link>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
              {user.bio || 'Continuous learner exploring modern distributed systems, cloud computing, and social peer knowledge sharing.'}
            </p>

            {/* Quick Metrics Strip */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 mt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900">{masteredSkills.length}</span>
                <span className="text-slate-500">Mastered Skills</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900">42</span>
                <span className="text-slate-500">Peer Endorsements</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900">18</span>
                <span className="text-slate-500">Study Pod Sessions</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span>🔥 24-Day Learning Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'skills'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🎓</span>
            <span>Mastered Skills ({masteredSkills.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>📰</span>
            <span>My Skill Posts ({userPosts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'about'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>ℹ️</span>
            <span>Availability & Setup</span>
          </button>
        </div>

        {/* Tab 1: Mastered Skills (LinkedIn Paradigm) */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Verified Mastered Capabilities</h3>
                <p className="text-xs text-slate-500">Skills you are qualified to mentor and teach other community members.</p>
              </div>
              <button
                onClick={() => setShowSkillModal(true)}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 transition"
              >
                + Add Another Skill
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masteredSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-lg font-bold">
                        🎓
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{skill.name}</h4>
                        <div className="text-[11px] text-slate-400">
                          {skill.experienceYears} {skill.experienceYears === 1 ? 'year' : 'years'} practical experience
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(skill.name)}
                      className="text-slate-300 hover:text-rose-500 text-xs p-1 transition"
                      title="Remove skill"
                    >
                      🗑️
                    </button>
                  </div>

                  {skill.description && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {skill.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 text-[10px]">
                      ✓ Available to Teach
                    </span>
                    <span className="text-slate-500 font-semibold text-[11px]">
                      👍 {skill.endorsements || 12} Endorsements
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: User Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {userPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
                <div className="text-3xl">✍️</div>
                <h3 className="font-bold text-sm text-slate-800">No posts published yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share a technical breakdown, code snippet, or learning question with the community.
                </p>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              userPosts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      #{p.skillTag || 'Engineering'}
                    </span>
                    <span className="text-[11px] text-slate-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">{p.content}</p>
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>❤️ {p.likesCount || 0} Likes</span>
                    <span>💬 {p.commentsCount || 0} Comments</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: About & Availability */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900">Mentorship Schedule & Study Pod Hours</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">Weekdays:</div>
                <p className="text-slate-600">Available from 17:00 to 20:00 UTC for peer code reviews and study pods.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">Weekends:</div>
                <p className="text-slate-600">Hosting live classroom workshops and open Q&A sessions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Mastered Skill */}
        {showSkillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Add Mastered Skill</h3>
                <button
                  onClick={() => setShowSkillModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Skill Name</label>
                  <input
                    type="text"
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. PyTorch, Kubernetes, Rust, System Design"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Years of Practical Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newSkillExp}
                    onChange={(e) => setNewSkillExp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Expertise & What You Can Teach</label>
                  <textarea
                    rows={3}
                    value={newSkillDesc}
                    onChange={(e) => setNewSkillDesc(e.target.value)}
                    placeholder="Describe specific frameworks, patterns, or architecture practices you can mentor peers on..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSkillModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold transition shadow-sm"
                  >
                    Save Mastered Skill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Post */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Create Skill Post</h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Skill Domain Tag</label>
                  <select
                    value={newPostTag}
                    onChange={(e) => setNewPostTag(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Full Stack Engineering">Full Stack Engineering</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="DevOps & Containers">DevOps & Containers</option>
                    <option value="UI/UX Engineering">UI/UX Engineering</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Post Content</label>
                  <textarea
                    rows={4}
                    required
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share what you worked on, an architectural pattern, or code breakthrough..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm"
                  >
                    Publish Post
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
