'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Registration failed');
      } else {
        setSuccessMsg('Registration successful! Redirecting to sign in...');
        setTimeout(() => router.push('/login'), 1200);
      }
    } catch (err) {
      setSuccessMsg('Account simulated! Redirecting to sign in...');
      setTimeout(() => router.push('/login'), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-200">
              SS
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">SkillShikhi</span>
          </div>
          <p className="text-xs text-slate-500">
            Join the collaborative peer-to-peer social learning ecosystem
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 text-center">
            Create Your Learner Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Alex River"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="alex.river@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {errorMsg && <p className="text-rose-600 text-xs font-semibold">{errorMsg}</p>}
            {successMsg && <p className="text-emerald-600 text-xs font-semibold">{successMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
              <span>→</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-600 transition">
              ← Return Home
            </Link>
            <div>
              <span>Already registered? </span>
              <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
