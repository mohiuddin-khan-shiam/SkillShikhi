'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerLogin = (user) => {
    clientStore.setCurrentUser(user);
    localStorage.setItem('token', 'demo_jwt_token_active');
    localStorage.setItem('userId', user.id || user._id);
    router.push('/profile');
  };

  const handleDemoLearner = () => {
    setLoading(true);
    setTimeout(() => {
      triggerLogin(DEMO_USERS.alex);
    }, 200);
  };

  const handleDemoMentor = () => {
    setLoading(true);
    setTimeout(() => {
      triggerLogin(DEMO_USERS.sarah);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        triggerLogin(DEMO_USERS.alex);
      } else {
        localStorage.setItem('token', data.token || 'demo_jwt_token_active');
        localStorage.setItem('userId', data.user?.id || DEMO_USERS.alex.id);
        clientStore.setCurrentUser(data.user || DEMO_USERS.alex);
        router.push('/profile');
      }
    } catch (err) {
      console.warn('Login error fallback:', err);
      triggerLogin(DEMO_USERS.alex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            14 Social Learning Paradigms
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-200">
              SS
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">SkillShikhi</span>
          </div>
          <p className="text-xs text-slate-500">
            Sign in to access your feeds, study pods, live workshops & blueprints
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          {/* Quick Demo Personas */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              1-Click Interactive Demo Personas
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDemoLearner}
                disabled={loading}
                className="p-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 transition text-left flex items-start gap-2.5 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🎒</span>
                <div>
                  <div className="font-extrabold text-xs text-indigo-950">Learner</div>
                  <div className="text-[10px] text-indigo-600">Alex River</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleDemoMentor}
                disabled={loading}
                className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 transition text-left flex items-start gap-2.5 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
                <div>
                  <div className="font-extrabold text-xs text-emerald-950">Mentor</div>
                  <div className="text-[10px] text-emerald-600">Dr. Sarah Khan</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span>or sign in with email</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Email Address</label>
              <input
                type="email"
                value={email}
                placeholder="alex.river@skillshikhi.demo"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {errorMsg && <p className="text-rose-600 text-xs">{errorMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Entering...' : 'Sign In'}</span>
              <span>→</span>
            </button>
          </form>

          <Link
            href="/admin-login"
            className="w-full block text-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            🛡️ Lead Administrator Portal
          </Link>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-600 transition">
              ← Return Home
            </Link>
            <Link href="/register" className="text-indigo-600 font-bold hover:underline">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
