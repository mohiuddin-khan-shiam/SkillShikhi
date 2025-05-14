'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      console.log('Sending admin login request for:', email);

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Login failed');
        console.error('Admin login failed:', data.message);
      } else {
        console.log('Admin login successful');
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('isAdmin', 'true');
        
        // Store the user ID in localStorage
        if (data.user && data.user.id) {
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('adminId', data.user.id);
          console.log('Saved admin ID to localStorage:', data.user.id);
        } else {
          console.warn('Admin ID not received in login response');
        }
        
        // Use replace instead of push for more reliable navigation
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
          <h1 className="tagline">Admin Portal</h1>
        </div>

        <h2 className="login-title">Admin Login</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="admin@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="toggle-password"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {errorMsg && <p className="error-message">{errorMsg}</p>}

          <button type="submit" className="login-button admin-login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>

          <div className="login-footer">
            <a href="/login" className="register-link">Back to User Login</a>
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-page {
          background-color: #f1f5f9;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .login-card {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .login-logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          height: 60px;
          margin-bottom: 10px;
        }
        .tagline {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        .login-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
          text-align: center;
          color: #222;
        }
        .login-form {
          display: flex;
          flex-direction: column;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-control {
          display: block;
          width: 100%;
          padding: 10px 12px;
          font-size: 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
        }
        .password-input {
          position: relative;
        }
        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .error-message {
          color: #dc2626;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }
        .login-button {
          background-color: #5b21b6;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
        }
        .admin-login-button {
          background-color: #1e40af;
        }
        .admin-login-button:hover {
          background-color: #1e3a8a;
        }
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
        }
        .login-footer a {
          color: #5b21b6;
          text-decoration: none;
        }
        .separator {
          margin: 0 8px;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
