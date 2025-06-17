'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      // If admin is already logged in, redirect to dashboard
      router.push('/admin/dashboard');
    }
    
    // Fade in animation
    setIsPageLoaded(true);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      console.log('Sending admin login request for:', email);

      // Add cache: 'no-store' to prevent caching issues
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store'
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Login failed');
        console.error('Admin login failed:', data.message);
        setLoading(false);
      } else {
        console.log('Admin login successful with token:', data.token);
        
        // Clear any existing tokens first to prevent conflicts
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Set admin-specific tokens in both localStorage and cookies
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('isAdmin', 'true');
        
        // Set cookies for server-side authentication
        document.cookie = `adminToken=${data.token}; path=/; max-age=${60*60*24*7}`; // 7 days
        
        // Store the user ID in localStorage
        if (data.user && data.user.id) {
          localStorage.setItem('adminId', data.user.id);
          console.log('Saved admin ID to localStorage:', data.user.id);
        } else {
          console.warn('Admin ID not received in login response');
        }
        
        // Use router.push for Next.js navigation with the correct admin dashboard path
        console.log('Redirecting to admin dashboard...');
        
        // Use setTimeout to ensure token storage is complete before navigation
        setTimeout(() => {
          // Ensure we're using the correct path: /admin/dashboard (with slash)
          router.push('/admin/dashboard');
        }, 300);
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-vh-100 d-flex align-items-center justify-content-center bg-light py-4 transition-opacity ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`} style={{transition: 'opacity 0.5s'}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm rounded p-4 p-md-5">
              <div className="text-center mb-4">
                <Link href="/" className="text-decoration-none d-inline-block">
                  <h2 className="fs-3 fw-bold">
                    <span className="text-primary">Skill</span>
                    <span style={{color: '#0a326e'}}>Shikhi</span>
                  </h2>
                </Link>
                <p className="text-secondary small mb-2">Admin Portal</p>
                <h1 className="fs-2 fw-bold text-dark">Admin Login</h1>
              </div>
        
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-group">
              <span className="input-group-text">
                <svg width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="form-control"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <svg width="16" height="16" fill="currentColor" className="bi bi-lock" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-control"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="btn btn-outline-secondary"
              >
                {showPass ? (
                  <svg width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <svg width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <div>{errorMsg}</div>
            </div>
          )}

          <div className="d-grid gap-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              aria-label="Login as administrator"
              className="btn btn-primary py-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in as Admin'
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link href="/login" className="text-decoration-none">
              Back to User Login
            </Link>
          </div>
        </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
