'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../styles.css';
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
    localStorage.setItem('token', 'demo_jwt_token_recruiter_preview');
    localStorage.setItem('userId', user.id || user._id);
    router.push('/profile');
  };

  const handleDemoLearner = () => {
    setLoading(true);
    setTimeout(() => {
      triggerLogin(DEMO_USERS.alex);
    }, 250);
  };

  const handleDemoMentor = () => {
    setLoading(true);
    setTimeout(() => {
      triggerLogin(DEMO_USERS.sarah);
    }, 250);
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
        // Fallback gracefully for recruiter preview
        triggerLogin(DEMO_USERS.alex);
      } else {
        localStorage.setItem('token', data.token || 'demo_jwt_token_recruiter_preview');
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
    <div className="login-page">
      <div className="login-card">
        {/* Fast-Track Demo Header Pill */}
        <div className="recruiter-pill">
          <span className="pulse-dot"></span>
          <span>⚡ Fast-Track Demo Access</span>
        </div>

        <div className="login-logo text-center">
          <Link href="/">
            <img src="/logo.png" alt="SkillShikhi Logo" className="logo mx-auto mb-2" />
          </Link>
          <h1 className="tagline font-bold text-gray-800">Learn, Share & Connect</h1>
          <p className="text-xs text-gray-500">Combining 14 social learning paradigms</p>
        </div>

        {/* 1-Click Recruiter Personas */}
        <div className="demo-personas-grid">
          <button
            type="button"
            onClick={handleDemoLearner}
            className="persona-btn persona-learner"
            disabled={loading}
          >
            <div className="persona-avatar">🎒</div>
            <div className="text-left">
              <div className="font-semibold text-xs text-indigo-900">Explore as Learner</div>
              <div className="text-[10px] text-indigo-600">Alex River (Code feeds, reels)</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleDemoMentor}
            className="persona-btn persona-mentor"
            disabled={loading}
          >
            <div className="persona-avatar">🎓</div>
            <div className="text-left">
              <div className="font-semibold text-xs text-emerald-900">Explore as Mentor</div>
              <div className="text-[10px] text-emerald-600">Dr. Sarah Khan (Teaching & AI)</div>
            </div>
          </button>
        </div>

        <div className="divider-line">
          <span>or log in with credentials</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group mb-3">
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="alex.river@skillshikhi.demo"
              onChange={(e) => setEmail(e.target.value)}
              className="form-control w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="form-control w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2 top-2 text-gray-400 text-sm"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-xs text-red-600 mb-3">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm mb-3"
            disabled={loading}
          >
            {loading ? 'Entering SkillShikhi...' : 'Sign In'}
          </button>

          <Link
            href="/admin-login"
            className="w-full block text-center py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            🛡️ Lead Admin Portal
          </Link>

          <div className="login-footer mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
            <Link href="/" className="hover:text-indigo-600">
              Back to Home
            </Link>
            <Link href="/register" className="text-indigo-600 font-medium hover:underline">
              Create New Account
            </Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-page {
          background-color: #f8fafc;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
        }
        .login-card {
          background-color: #ffffff;
          padding: 2rem;
          border-radius: 16px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .recruiter-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #eef2ff;
          color: #4338ca;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          margin-bottom: 1.25rem;
          border: 1px solid #c7d2fe;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4f46e5;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(79, 70, 229, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
          }
        }
        .demo-personas-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin: 1.25rem 0 1rem;
        }
        .persona-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          border: 1px solid transparent;
        }
        .persona-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .persona-learner {
          background: #eef2ff;
          border-color: #c7d2fe;
        }
        .persona-mentor {
          background: #ecfdf5;
          border-color: #a7f3d0;
        }
        .persona-avatar {
          font-size: 1.25rem;
        }
        .divider-line {
          position: relative;
          text-align: center;
          margin: 1rem 0;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .divider-line::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: #e2e8f0;
          z-index: 1;
        }
        .divider-line span {
          background: white;
          padding: 0 0.5rem;
          position: relative;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
