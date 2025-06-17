'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Optional: validate token here
      router.push('/profile');
    }
    
    // Fade in animation
    setIsPageLoaded(true);
  }, [router]);

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
    <div className={`min-h-screen flex transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-900 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary-600 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-secondary-500 rounded-full opacity-20"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6 font-heading">
            Welcome Back to SkillShikhi
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Connect with your community, share your skills, and continue your learning journey.
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            {[1, 2, 3].map((num) => (
              <div key={num} className="w-3 h-3 rounded-full bg-white opacity-60"></div>
            ))}
          </div>
          
          <div className="mt-12">
            <p className="text-primary-200">Don't have an account?</p>
            <Link 
              href="/register" 
              className="mt-3 inline-block px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-900 transition-colors duration-300 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold">
                <span className="text-primary-600">Skill</span>
                <span className="text-primary-900">Shikhi</span>
              </h2>
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold mb-8 text-gray-900 font-heading">
            Sign in to your account
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors duration-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-900 transition-colors duration-300"
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorMsg}
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 focus:ring-opacity-50 transition-colors duration-300 shadow-md flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
            
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-sm text-gray-500">Or continue with</span>
              </div>
            </div>
            
            {/* Admin Login Button */}
            <Link 
              href="/admin-login" 
              className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50 transition-colors duration-300 shadow-md flex justify-center items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Admin Login
            </Link>
          </form>
          
          <div className="mt-8 text-center lg:hidden">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-800 font-medium transition-colors duration-300">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
