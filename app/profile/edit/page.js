'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEMO_USERS } from '../../../lib/demoData';
import { clientStore } from '../../../lib/clientStore';

export default function EditProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.alex);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const user = clientStore.getCurrentUser() || DEMO_USERS.alex;
    setCurrentUser(user);
    setName(user.name || '');
    setRole(user.role || '');
    setBio(user.bio || '');
    setAvatar(user.avatar || user.profileImage || '');
    setSkills((user.skills || ['Full Stack Engineering', 'React 19', 'Next.js 15']).join(', '));
  }, []);

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      avatar,
      profileImage: avatar,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
    };

    clientStore.setCurrentUser(updatedUser);

    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    }, 400);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/profile" className="text-slate-400 hover:text-slate-700 text-xs font-semibold transition">
                ← Profile
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                Account Settings
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1">Edit Profile Details</h1>
          </div>
          <Link
            href="/profile"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl transition"
          >
            Cancel
          </Link>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
            ✓ Profile successfully updated! Redirecting to your profile...
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5 text-xs">
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt="Avatar preview"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
            />
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">PNG, JPG or WebP up to 5MB.</p>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 mb-1 block">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 mb-1 block">Professional Headline / Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Machine Learning Engineer · PyTorch Mentor"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 mb-1 block">Bio & Learning Philosophy</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell community members about what you build, what you mentor, and your technical focus..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 mb-1 block">Skills (Comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React 19, PyTorch, Docker, Kubernetes, Next.js"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Comma-separated skills will be displayed on your peer profile.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              <span>✓</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
