'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        setSuccessMsg('Registration successful! Redirecting...');
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err) {
      setErrorMsg('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <img src="/logo.png" alt="SkillShikhi Logo" style={styles.logo} />
          <h1 style={styles.tagline}>Empower your community through learning</h1>
        </div>

        <h2 style={styles.title}>Create a SkillShikhi Account</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}
          {successMsg && <p style={styles.success}>{successMsg}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div style={styles.footer}>
            <span>Already have an account? </span>
            <a href="/login" style={styles.link}>Login here</a>
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
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#222',
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
