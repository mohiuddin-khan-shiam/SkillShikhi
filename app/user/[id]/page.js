'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_USERS } from '../../../lib/demoData';

export default function ViewUserProfilePage({ params }) {
  const router = useRouter();
  const resolvedParams = params ? (typeof params.then === 'function' ? use(params) : params) : {};
  const userId = resolvedParams?.id || 'sarah';

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [endorsedSkills, setEndorsedSkills] = useState({});

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/public-profile/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          return;
        }
      } catch (err) {
        console.warn('Fallback public user profile:', err);
      }

      const match =
        Object.values(DEMO_USERS).find((u) => u.id === userId || u.username === userId) ||
        DEMO_USERS.sarah;

      setUser({
        _id: match.id,
        name: match.name,
        email: match.email,
        bio: match.bio,
        profileImage: match.avatar,
        role: match.role,
        masteredSkills: match.masteredSkills || [
          { name: 'PyTorch & Deep Learning', experienceYears: 7, endorsements: 48, description: 'Neural networks, GPU kernel optimization, transformer models.' },
          { name: 'Python Engineering', experienceYears: 8, endorsements: 54, description: 'High performance data science and asynchronous backends.' }
        ],
        skillsToTeach: ['PyTorch', 'TensorFlow', 'LLMs'],
        skillsToLearn: ['Next.js 15', 'Rust'],
      });
      setLoading(false);
    }

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const toggleEndorse = (skillName) => {
    setEndorsedSkills((prev) => ({
      ...prev,
      [skillName]: !prev[skillName],
    }));
  };

  if (loading && !user) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 text-center text-xs text-slate-400">
        Loading peer profile...
      </div>
    );
  }

  const profile = user || DEMO_USERS.sarah;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/skills" className="text-slate-400 hover:text-slate-700 font-semibold transition">
              ← Skills
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/friends" className="text-slate-400 hover:text-slate-700 font-semibold transition">
              Peers
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">{profile.name}</span>
          </div>

          <Link
            href="/chat"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>💬 Open Study Pod</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Banner */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-indigo-700 via-sky-600 to-indigo-900 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
              <div className="flex items-end gap-4">
                <img
                  src={profile.profileImage || profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">{profile.name}</h1>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                      {profile.role || 'Verified Mentor'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Community Mentor · Active Today</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  onClick={() => setIsConnected(!isConnected)}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isConnected
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  <span>{isConnected ? '✓ Connected' : '+ Connect Peer'}</span>
                </button>

                <Link
                  href={`/teaching-request?teacherId=${profile._id || profile.id}&teacherName=${encodeURIComponent(
                    profile.name
                  )}&skillName=Mentorship`}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>🤝 Request Mentorship</span>
                </Link>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
              {profile.bio || 'Technical mentor and active contributor in SkillShikhi ecosystem.'}
            </p>
          </div>
        </div>

        {/* Mastered Skills Showcase */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Mastered Skills & Endorsements</h2>
              <p className="text-xs text-slate-500">Verified domain capabilities endorsed by community peers.</p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
              LinkedIn Paradigm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(profile.masteredSkills || []).map((skill) => {
              const isEndorsed = endorsedSkills[skill.name];
              const count = (skill.endorsements || 18) + (isEndorsed ? 1 : 0);

              return (
                <div
                  key={skill.name}
                  className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 transition space-y-2.5 bg-slate-50/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{skill.name}</h3>
                      <div className="text-[11px] text-slate-400">
                        {skill.experienceYears || 3}+ years practical experience
                      </div>
                    </div>

                    <button
                      onClick={() => toggleEndorse(skill.name)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isEndorsed
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-white hover:bg-sky-50 text-sky-700 border border-slate-200'
                      }`}
                    >
                      <span>{isEndorsed ? '✓' : '👍'}</span>
                      <span>{count}</span>
                    </button>
                  </div>

                  {skill.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{skill.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Workshop Participation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900">Classroom Sessions Hosted</h2>
            <Link href="/sessions" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View Calendar →
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            {profile.name} hosts weekly interactive workshops and study pods on SkillShikhi. Check the classroom schedule to reserve upcoming seats.
          </p>
        </div>
      </div>
    </div>
  );
}
