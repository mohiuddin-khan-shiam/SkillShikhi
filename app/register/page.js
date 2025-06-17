'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/profile');
    }
    
    // Fade in animation
    setIsPageLoaded(true);
  }, [router]);

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    const password = form.password;
    
    if (password.length > 0) strength += 1; // Any characters
    if (password.length >= 8) strength += 1; // At least 8 characters
    if (/\d/.test(password)) strength += 1; // Contains number
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1; // Has both uppercase and lowercase
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // Has special characters
    
    setPasswordStrength(strength);
  }, [form.password]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Basic client-side validation
    if (form.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!/\d/.test(form.password)) {
      setErrorMsg('Password must contain at least one number');
      setLoading(false);
      return;
    }

    if (!form.email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!form.name.trim()) {
      setErrorMsg('Name is required');
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Registration failed');
      } else {
        setSuccessMsg('Registration successful! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get password strength class and text
  const getPasswordStrengthInfo = () => {
    const strengthClasses = [
      'bg-gray-200', // Not entered
      'bg-red-500', // Very weak
      'bg-orange-500', // Weak
      'bg-yellow-500', // Medium
      'bg-blue-500', // Strong
      'bg-green-500', // Very strong
    ];

    const strengthTexts = [
      '', 
      'Very weak', 
      'Weak', 
      'Medium', 
      'Strong', 
      'Very strong'
    ];

    return {
      class: form.password ? strengthClasses[passwordStrength] : strengthClasses[0],
      text: strengthTexts[passwordStrength],
      width: `${(passwordStrength / 5) * 100}%`
    };
  };

  const strengthInfo = getPasswordStrengthInfo();

  return (
    <div className={`min-h-screen flex transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold">
                <span className="text-primary-600">Skill</span>
                <span className="text-primary-900">Shikhi</span>
              </h2>
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold mb-6 text-gray-900 font-heading">
            Create your account
          </h2>
          <p className="text-gray-600 mb-8">Join our community and start sharing your skills today.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Email Field */}
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
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300"
                />
              </div>
              {/* Password strength indicator */}
              {form.password && (
                <div className="mt-2 mb-1">
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strengthInfo.class} transition-all duration-300 ease-in-out`} 
                      style={{ width: strengthInfo.width }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className={passwordStrength > 0 ? 'text-gray-700' : 'text-gray-400'}>Password strength: {strengthInfo.text}</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with at least one number</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Error and Success Messages */}
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

            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {successMsg}
                </p>
              </div>
            )}

            {/* Register Button */}
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
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-800 font-medium transition-colors duration-300">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Illustration/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-800 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-600 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-400 rounded-full opacity-20"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6 font-heading">
            Join the SkillShikhi Community
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Connect with skilled people in your community. Learn new skills and share your knowledge with others.
          </p>
          
          {/* Benefits */}
          <div className="text-left mb-10">
            {[
              'Access hundreds of different skills in your community',
              'Connect with like-minded learners and teachers',
              'Schedule in-person or virtual learning sessions',
              'Build your profile and showcase your expertise'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-primary-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


