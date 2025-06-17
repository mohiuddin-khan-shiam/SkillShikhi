'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Wrapper component that uses useSearchParams
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  
  useEffect(() => {
    // Redirect if no token is provided
    if (!token) {
      setErrorMsg('Invalid or missing reset token');
      setTokenValid(false);
    } else {
      // Validate token on page load
      validateToken();
    }
  }, [token]);
  
  const validateToken = async () => {
    try {
      const res = await fetch(`/api/auth/validate-reset-token?token=${token}`);
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Invalid or expired token');
        setTokenValid(false);
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setErrorMsg('Failed to validate reset token');
      setTokenValid(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenValid) {
      return;
    }
    
    // Basic validation
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    
    if (!/\d/.test(password)) {
      setErrorMsg('Password must contain at least one number');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to reset password');
      } else {
        setSuccessMsg('Password has been reset successfully');
        // Redirect to login page after a brief delay
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login if token is invalid
  if (!tokenValid && !loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoSection}>
            <img 
              src="/logo.png" 
              alt="SkillShikhi Logo" 
              style={styles.logo} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/120x60/5b21b6/ffffff?text=SkillShikhi";
              }}
            />
          </div>
          
          <h2 style={styles.title}>Password Reset Failed</h2>
          
          <p style={styles.errorBox}>{errorMsg || 'Invalid or expired password reset link'}</p>
          
          <div style={styles.footer}>
            <a href="/forgot-password" style={styles.button}>Request New Reset Link</a>
            <a href="/login" style={styles.link}>Back to Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <img 
            src="/logo.png" 
            alt="SkillShikhi Logo" 
            style={styles.logo} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/120x60/5b21b6/ffffff?text=SkillShikhi";
            }}
          />
          <h1 style={styles.tagline}>Create a new password</h1>
        </div>

        <h2 style={styles.title}>Reset Your Password</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <p style={styles.instructions}>
            Please enter your new password below.
          </p>

          <label style={styles.label}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="••••••••"
            required
            minLength="8"
          />
          <p style={styles.passwordHint}>Password must be at least 8 characters and contain at least one number</p>

          <label style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            placeholder="••••••••"
            required
          />

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}
          {successMsg && <p style={styles.success}>{successMsg}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div style={styles.footer}>
            <a href="/login" style={styles.link}>Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingForm() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <img 
            src="/logo.png" 
            alt="SkillShikhi Logo" 
            style={styles.logo} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/120x60/5b21b6/ffffff?text=SkillShikhi";
            }}
          />
        </div>
        <h2 style={styles.title}>Loading...</h2>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingForm />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

const styles = {
  page: {
    backgroundColor: '#f1f5f9',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '50px 60px',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logo: {
    height: '60px',
    marginBottom: '10px',
  },
  tagline: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#222',
  },
  instructions: {
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#555',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '6px',
    fontWeight: '600',
    color: '#444',
  },
  input: {
    padding: '12px',
    fontSize: '1rem',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: '100%',
  },
  button: {
    padding: '14px',
    backgroundColor: '#5b21b6',
    color: '#fff',
    fontSize: '1.1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.95rem',
    color: '#555',
  },
  link: {
    color: '#5b21b6',
    textDecoration: 'none',
    marginTop: '1rem',
    display: 'inline-block',
  },
  error: {
    color: 'crimson',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  passwordHint: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '-15px',
    marginBottom: '20px',
  },
}; 