'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DEMO_USERS } from '../lib/demoData';
import { clientStore } from '../lib/clientStore';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.alex);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const user = clientStore.getCurrentUser();
    setCurrentUser(user);
  }, [pathname]);

  const handleRoleSelect = (roleKey) => {
    const user = clientStore.switchRole(roleKey);
    setCurrentUser(user);
    setRoleMenuOpen(false);
    if (roleKey === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.refresh();
    }
  };

  const navLinks = [
    { href: '/', label: 'Overview', icon: '🏠' },
    { href: '/feed', label: 'Feed', icon: '📰', badge: 'FB / Threads' },
    { href: '/reels', label: 'Reels', icon: '⚡', badge: 'TikTok / IG' },
    { href: '/pins', label: 'Pins', icon: '📌', badge: 'Pinterest' },
    { href: '/community', label: 'Communities', icon: '💬', badge: 'Reddit' },
    { href: '/droplets', label: 'Droplets', icon: '🚀', badge: 'X' },
    { href: '/sessions', label: 'Classroom', icon: '📅', badge: 'YouTube' },
    { href: '/chat', label: 'Chat', icon: '💬', badge: 'WhatsApp' },
    { href: '/skills', label: 'Skills', icon: '🎓', badge: 'LinkedIn' },
    { href: '/admin/dashboard', label: 'Admin Hub', icon: '🛡️', badge: 'Recruiter' },
  ];

  return (
    <>
      {/* Top Recruiter Showcase Ribbon */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-indigo-100 text-xs py-2 px-4 border-b border-indigo-800/60 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-200">
              <strong className="text-white">Recruiter Showcase Mode:</strong> All 14 social learning features & admin dashboards are open for review.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-indigo-300 hidden sm:inline">Active Persona:</span>
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="bg-indigo-600/60 hover:bg-indigo-600 text-white font-semibold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-indigo-400/40 transition"
              >
                <span>{currentUser.isAdmin ? '🛡️' : currentUser.role?.includes('Mentor') ? '🎓' : '🎒'}</span>
                <span>{currentUser.name}</span>
                <span className="text-[10px] opacity-75">▼</span>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-1 w-60 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Switch Recruiter Persona
                  </div>
                  <button
                    onClick={() => handleRoleSelect('learner')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-indigo-50 transition ${currentUser.username === 'alexriver' ? 'bg-indigo-50/70 font-semibold text-indigo-700' : ''}`}
                  >
                    <span className="text-base">🎒</span>
                    <div>
                      <div className="font-medium">Alex River (Learner)</div>
                      <div className="text-[10px] text-gray-500">Learning Next.js, code feeds, reels</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('mentor')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-emerald-50 transition ${currentUser.username === 'sarahkhan_ai' ? 'bg-emerald-50/70 font-semibold text-emerald-700' : ''}`}
                  >
                    <span className="text-base">🎓</span>
                    <div>
                      <div className="font-medium">Dr. Sarah Khan (Mentor)</div>
                      <div className="text-[10px] text-gray-500">AI Researcher, conducts sessions</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-100 transition ${currentUser.isAdmin ? 'bg-slate-100 font-semibold text-slate-800' : ''}`}
                  >
                    <span className="text-base">🛡️</span>
                    <div>
                      <div className="font-medium">Shiam (Admin Lead)</div>
                      <div className="text-[10px] text-gray-500">Full platform analytics & moderation</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-9 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200">
                  SS
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                    SkillShikhi
                  </span>
                  <span className="hidden md:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    Social Learning
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border transition ${
                  pathname === '/profile'
                    ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700'
                    : 'border-slate-200 hover:border-indigo-300 bg-white text-slate-700'
                }`}
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-200"
                />
                <span className="text-xs font-semibold hidden sm:inline">Profile</span>
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                aria-label="Toggle Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <div className="grid grid-cols-2 gap-1.5 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                    pathname === link.href ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                  {link.badge && (
                    <span className="text-[9px] opacity-75">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
