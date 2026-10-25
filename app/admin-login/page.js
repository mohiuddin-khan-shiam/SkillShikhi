'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../styles.css';
import { DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerAdminLogin = (token, user) => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.setItem('adminToken', token);
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminId', user.id || user._id);
    clientStore.setCurrentUser(DEMO_USERS.admin);
    router.push('/admin/dashboard');
  };

  const handleDemoAdminClick = () => {
    setLoading(true);
    setTimeout(() => {
      triggerAdminLogin('demo_admin_jwt_token_recruiter_preview', DEMO_USERS.admin);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        // Fallback for demo ease
        triggerAdminLogin('demo_admin_jwt_token_recruiter_preview', DEMO_USERS.admin);
      } else {
        triggerAdminLogin(data.token, data.user || DEMO_USERS.admin);
      }
    } catch (err) {
      console.warn('Admin login fallback triggered:', err);
      triggerAdminLogin('demo_admin_jwt_token_recruiter_preview', DEMO_USERS.admin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        {/* Quick Mode Banner */}
        <div className="recruiter-pill-banner">
          <span className="badge-pulse"></span>
          <span>Lead Administrator Portal</span>
        </div>

        <div className="login-logo text-center">
          <Link href="/">
            <img src="/logo.png" alt="SkillShikhi Logo" className="logo mx-auto mb-2" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-xs text-gray-500">Platform Analytics, Moderation & Health Metrics</p>
        </div>

        <button
          type="button"
          onClick={handleDemoAdminClick}
          className="demo-instant-btn"
          disabled={loading}
        >
          <span>⚡</span>
          <div>
            <div className="font-semibold text-sm">Instant Demo Admin Login</div>
            <div className="text-xs text-indigo-200">1-click login with full moderation privileges</div>
          </div>
        </button>

        <div className="divider-text">
          <span>or sign in with credentials</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group mb-3">
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="admin@skillshikhi.demo"
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
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
          <Link href="/login" className="hover:text-indigo-600">
            ← Member Login
          </Link>
          <Link href="/" className="hover:text-indigo-600">
            Back to Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .admin-login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          padding: 1.5rem;
        }
        .admin-login-box {
          background: #ffffff;
          max-width: 440px;
          width: 100%;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        }
        .recruiter-pill-banner {
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
        .badge-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4f46e5;
          box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
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
        .demo-instant-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          margin: 1.25rem 0 1rem;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
          text-align: left;
        }
        .demo-instant-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
        }
        .divider-text {
          position: relative;
          text-align: center;
          margin: 1rem 0;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .divider-text::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: #e2e8f0;
          z-index: 1;
        }
        .divider-text span {
          background: white;
          padding: 0 0.5rem;
          position: relative;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
