'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DEMO_USERS } from '../lib/demoData';
import { clientStore } from '../lib/clientStore';
import GlobalSearchModal from './GlobalSearchModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.alex);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const user = clientStore.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, [pathname]);

  const handleRoleSelect = (roleKey) => {
    const user = clientStore.switchRole(roleKey);
    if (user) {
      setCurrentUser(user);
    }
    setRoleMenuOpen(false);
    if (roleKey === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.refresh();
    }
  };

  const navLinks = [
    { href: '/', label: 'Overview', icon: '🏠' },
    { href: '/feed', label: 'Feed', icon: '📰' },
    { href: '/reels', label: 'Reels', icon: '⚡' },
    { href: '/pins', label: 'Blueprints', icon: '📌' },
    { href: '/community', label: 'Communities', icon: '💬' },
    { href: '/droplets', label: 'Droplets', icon: '🚀' },
    { href: '/sessions', label: 'Classroom', icon: '📅' },
    { href: '/chat', label: 'Study Pods', icon: '💬' },
    { href: '/skills', label: 'Skills', icon: '🎓' },
    { href: '/admin/dashboard', label: 'Admin Hub', icon: '🛡️' },
  ];

  const userName = currentUser?.name || 'User';
  const firstName = userName.split(' ')[0] || 'User';

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform"
                style={{ width: '36px', height: '36px' }}
              >
                SS
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 bg-clip-text text-transparent">
                  SkillShikhi
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  Social Learning
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action: Search, Demo Switcher & Profile */}
          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/90 hover:bg-indigo-50 border border-slate-200 text-xs text-slate-600 hover:text-indigo-600 transition"
              title="Quick Search (Ctrl+K)"
              aria-label="Quick Search"
            >
              <span>🔍</span>
              <span className="hidden sm:inline font-medium">Search</span>
              <kbd className="hidden md:inline text-[9px] bg-white border border-slate-200 px-1 py-0.2 rounded text-slate-400 font-mono">⌘K</kbd>
            </button>

            {/* Interactive Demo Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition shadow-2xs"
                title="Switch Demo Role"
              >
                <span className="text-xs">
                  {currentUser?.isAdmin ? '🛡️' : currentUser?.role?.includes('Mentor') ? '🎓' : '🎒'}
                </span>
                <span className="hidden sm:inline font-medium text-slate-500">Demo Role:</span>
                <span className="font-bold text-slate-800">{firstName}</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Interactive Demo Roles
                  </div>
                  <button
                    onClick={() => handleRoleSelect('learner')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-indigo-50 transition ${
                      currentUser?.username === 'alexriver' ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-lg">🎒</span>
                    <div>
                      <div className="font-semibold">Alex River (Learner)</div>
                      <div className="text-[10px] text-slate-500">Explore feeds, watch reels, save pins</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('mentor')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-emerald-50 transition ${
                      currentUser?.username === 'sarahkhan_ai' ? 'bg-emerald-50/70 font-semibold text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-lg">🎓</span>
                    <div>
                      <div className="font-semibold">Dr. Sarah Khan (Mentor)</div>
                      <div className="text-[10px] text-slate-500">Conducts AI workshops, verifies Q&A</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-violet-50 transition ${
                      currentUser?.isAdmin ? 'bg-violet-50/70 font-semibold text-violet-700' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-lg">🛡️</span>
                    <div>
                      <div className="font-semibold">Shiam (Admin Lead)</div>
                      <div className="text-[10px] text-slate-500">Live analytics, reports & moderation</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar Pill */}
            <Link
              href="/profile"
              className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full border transition ${
                pathname === '/profile'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 hover:border-indigo-300 bg-white text-slate-700'
              }`}
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={userName}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                style={{ width: '28px', height: '28px' }}
              />
              <span className="text-xs font-semibold hidden md:inline">{userName}</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="grid grid-cols-2 gap-2 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                  pathname === link.href ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* Global Search Dialog Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </nav>
  );
}
