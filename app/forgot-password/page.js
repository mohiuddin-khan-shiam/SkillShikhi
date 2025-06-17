'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to process your request');
      } else {
        setSuccessMsg('If your email exists in our system, you will receive a password reset link');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 style={styles.tagline}>Reset your password</h1>
        </div>

        <h2 style={styles.title}>Forgot Password</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <p style={styles.instructions}>
            Enter your email address below and we'll send you a link to reset your password.
          </p>

          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}
          {successMsg && <p style={styles.success}>{successMsg}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Processing...' : 'Send Reset Link'}
          </button>

          <div style={styles.footer}>
            <a href="/login" style={styles.link}>Back to Login</a>
          </div>
        </form>
      </div>
    </div>
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
}; 