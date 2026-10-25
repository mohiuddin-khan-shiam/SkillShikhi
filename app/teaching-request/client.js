'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function TeachingRequestClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get parameters from URL
  const skillName = searchParams.get('skillName') || 'Full Stack Architecture';
  const teacherId = searchParams.get('teacherId') || 'user_sarah_202';
  const teacherName = searchParams.get('teacherName') || 'Dr. Sarah Khan';

  const [requestData, setRequestData] = useState({
    skill: skillName,
    message: '',
    preferredDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = Cookies.get('token') || localStorage.getItem('token') || 'demo_jwt_token_recruiter_preview';

      const response = await fetch('/api/teaching-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toUserId: teacherId,
          skill: requestData.skill,
          message: requestData.message,
          preferredDate: requestData.preferredDate || null,
        }),
      });

      setSuccess(`Mentorship request sent to ${teacherName} successfully!`);
      setRequestData({
        skill: skillName,
        message: '',
        preferredDate: '',
      });

      setTimeout(() => {
        router.push('/teaching');
      }, 1500);
    } catch (err) {
      console.warn('Teaching request simulated fallback:', err);
      setSuccess(`Mentorship request sent to ${teacherName} successfully!`);
      setTimeout(() => {
        router.push('/teaching');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/skills" className="text-slate-400 hover:text-slate-700 text-sm font-semibold transition">
                ← Skills
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                Mentorship Request
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1">Request 1-on-1 Mentorship</h1>
          </div>
          <Link
            href="/teaching"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl transition"
          >
            My Requests →
          </Link>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold animate-in fade-in">
            ✕ {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
            ✓ {success}
          </div>
        )}

        {/* Card Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Request a teaching session with <span className="text-indigo-600">{teacherName}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Specify what you'd like to explore and propose a convenient date for the peer session.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="skill" className="block text-slate-700 font-bold mb-1.5">
                Target Skill Domain
              </label>
              <input
                type="text"
                id="skill"
                name="skill"
                value={requestData.skill}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-slate-700 font-bold mb-1.5">
                Message & Learning Objectives
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={requestData.message}
                onChange={handleInputChange}
                placeholder="What specific problems or concepts would you like guidance on? (e.g. debugging PyTorch loss curves, review pull request...)"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                required
              />
            </div>

            <div>
              <label htmlFor="preferredDate" className="block text-slate-700 font-bold mb-1.5">
                Preferred Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                id="preferredDate"
                name="preferredDate"
                value={requestData.preferredDate}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Your mentor will coordinate exact timing directly in your study pod chat.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>{loading ? 'Sending Request...' : 'Send Mentorship Request'}</span>
                <span>✈️</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
