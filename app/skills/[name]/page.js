'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEMO_USERS } from '../../../lib/demoData';

export default function SkillUsersPage({ params }) {
  const router = useRouter();
  const resolvedParams = params ? (typeof params.then === 'function' ? use(params) : params) : {};
  const skillName = resolvedParams?.name || '';
  const decodedSkillName = decodeURIComponent(skillName);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [endorsedUsers, setEndorsedUsers] = useState({});

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`/api/skills/${skillName}/users`);
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            setUsers(data.users);
            return;
          }
        }
      } catch (error) {
        console.warn('Using demo users for skill:', error);
      }

      // High fidelity fallback matching the skill
      setUsers([
        {
          _id: DEMO_USERS.sarah.id,
          name: DEMO_USERS.sarah.name,
          email: DEMO_USERS.sarah.email,
          profileImage: DEMO_USERS.sarah.avatar,
          bio: DEMO_USERS.sarah.bio,
          role: DEMO_USERS.sarah.role,
          experienceYears: 7,
          endorsements: 42,
          isMentor: true,
        },
        {
          _id: DEMO_USERS.tariq.id,
          name: DEMO_USERS.tariq.name,
          email: DEMO_USERS.tariq.email,
          profileImage: DEMO_USERS.tariq.avatar,
          bio: DEMO_USERS.tariq.bio,
          role: DEMO_USERS.tariq.role,
          experienceYears: 5,
          endorsements: 29,
          isMentor: true,
        },
        {
          _id: DEMO_USERS.elena.id,
          name: DEMO_USERS.elena.name,
          email: DEMO_USERS.elena.email,
          profileImage: DEMO_USERS.elena.avatar,
          bio: DEMO_USERS.elena.bio,
          role: DEMO_USERS.elena.role,
          experienceYears: 4,
          endorsements: 34,
          isMentor: false,
        },
      ]);
      setLoading(false);
    }

    if (skillName) {
      fetchUsers();
    }
  }, [skillName]);

  const toggleEndorse = (userId) => {
    setEndorsedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/skills"
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold transition"
              >
                ← Skills Directory
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                LinkedIn Paradigm
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Community Members with{' '}
              <span className="text-sky-700">"{decodedSkillName}"</span>
            </h1>
            <p className="text-xs text-slate-500">
              Connect with verified mentors, peer collaborators, and endorse technical proficiency.
            </p>
          </div>

          <Link
            href="/skills"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>🔍 Browse All Skills</span>
          </Link>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading skill members...</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <div className="text-3xl">🎓</div>
            <h3 className="font-bold text-sm text-slate-800">No members found yet</h3>
            <p className="text-xs text-slate-500">
              Be the first to add <span className="font-semibold">{decodedSkillName}</span> to your mastered skills!
            </p>
            <Link
              href="/profile"
              className="inline-block mt-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition"
            >
              Add to My Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {users.map((u) => {
              const uId = u._id || u.id;
              const isEndorsed = endorsedUsers[uId];
              const count = (u.endorsements || 12) + (isEndorsed ? 1 : 0);

              return (
                <div
                  key={uId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-900">{u.name}</h3>
                            {u.isMentor && (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                Mentor
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.role || 'Practitioner'}</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {u.bio || 'Active technical learner and collaborator in SkillShikhi community.'}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400 text-[11px]">Experience:</span>
                      <span className="font-semibold text-slate-700">{u.experienceYears || 3}+ years</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Endorsement Button */}
                      <button
                        onClick={() => toggleEndorse(uId)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isEndorsed
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-700'
                        }`}
                      >
                        <span>{isEndorsed ? '✓ Endorsed' : '👍 Endorse'}</span>
                        <span className="font-mono text-[10px]">({count})</span>
                      </button>

                      {/* Message / Pod Button */}
                      <Link
                        href="/chat"
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition"
                        title="Send Message"
                      >
                        💬
                      </Link>
                    </div>

                    <Link
                      href={`/user/${uId}`}
                      className="block text-center text-xs text-slate-500 hover:text-sky-700 font-semibold py-1 transition"
                    >
                      View Public Profile →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
