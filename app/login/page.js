'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles.css';

export default function LoginPage() {
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
      console.log('Sending login request for:', email);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Login failed');
        console.error('Login failed:', data.message);
      } else {
        console.log('Login successful');
        localStorage.setItem('token', data.token);
        
        // Store the user ID in localStorage
        if (data.user && data.user.id) {
          localStorage.setItem('userId', data.user.id);
          console.log('Saved user ID to localStorage:', data.user.id);
        } else {
          console.warn('User ID not received in login response');
        }
        
        router.push('/profile');
      }
    } catch (err) {
      console.error('Login error:', err);
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
          <h1 className="tagline">Learn and give back to your community</h1>
        </div>

        <h2 className="login-title">Login to SkillShikhi</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <button 
            type="button" 
            className="admin-login-button"
            onClick={() => window.location.href = '/admin-login'}
          >
            Admin Login
          </button>

          <div className="login-footer">
            <a href="#" className="forgot-password">Forgot Password?</a>
            <span className="separator">|</span>
            <a href="/register" className="register-link">Register</a>
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
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-login-button {
          background-color: #1e40af;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
          margin-top: 12px;
        }
        
        .admin-login-button:hover {
          background-color: #1e3a8a;
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
