'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../styles.css';

export default function DiscoverSkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [endorsedSkills, setEndorsedSkills] = useState({});

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch('/api/skills');
        const data = await res.json();
        setSkills(data.skills || []);
      } catch (error) {
        console.warn('Skills fetch fallback:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
  }, []);

  const categories = ['All', 'Frontend', 'AI/ML', 'Design', 'DevOps', 'Backend', 'Security', 'Architecture'];

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || skill.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleEndorse = (skillId, e) => {
    e.stopPropagation();
    setEndorsedSkills((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl font-black text-slate-900">Skill Directory & Peer Endorsements</h1>
              <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                LinkedIn Skill Mastery Paradigm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Discover verified technical capabilities, endorse community members, and connect with peer mentors.
            </p>
          </div>

          <Link
            href="/profile"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Manage Your Skills
          </Link>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills by name (e.g. PyTorch, Next.js, Kubernetes, Figma)..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading skills catalog...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm text-slate-500">No skills found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSkills.map((skill) => {
              const isEndorsed = endorsedSkills[skill._id];
              return (
                <div
                  key={skill._id}
                  onClick={() => router.push(`/skills/${encodeURIComponent(skill.name)}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {skill.category || 'Skill'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        👥 {skill.count} {skill.count === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-sky-700 transition">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Connect with experienced peer tutors and learners actively mastering this skill.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <button
                      onClick={(e) => handleEndorse(skill._id, e)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                        isEndorsed
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 text-sky-700 border-sky-200 hover:bg-sky-50'
                      }`}
                    >
                      <span>{isEndorsed ? '✓ Endorsed' : '👍 Endorse Skill'}</span>
                    </button>

                    <span className="text-xs font-bold text-indigo-600 group-hover:underline">
                      Find Mentors →
                    </span>
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
