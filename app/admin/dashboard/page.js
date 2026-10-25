'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import '../../../styles/admin.css';
import { DEMO_USERS } from '../../../lib/demoData';

// Import components with dynamic loading
const ClientOnly = dynamic(() => import('../../../components/ClientOnly'), { ssr: false });
const ReportsTab = dynamic(() => import('../../../components/admin/ReportsTab'), { ssr: false });
const UsersTab = dynamic(() => import('../../../components/admin/UsersTab'), { ssr: false });
const ContentTab = dynamic(() => import('../../../components/admin/ContentTab'), { ssr: false });
const SessionsTab = dynamic(() => import('../../../components/admin/SessionsTab'), { ssr: false });
const LogsTab = dynamic(() => import('../../../components/admin/LogsTab'), { ssr: false });
const AnalyticsTab = dynamic(() => import('../../../components/admin/AnalyticsTab'), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('analytics');
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Auto-authenticate for recruiter showcase
  useEffect(() => {
    let token = localStorage.getItem('adminToken');
    if (!token) {
      token = 'demo_admin_jwt_token_recruiter_preview';
      localStorage.setItem('adminToken', token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminId', DEMO_USERS.admin.id);
    }
    setIsAdmin(true);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    router.push('/admin-login');
  };

  return (
    <div className="admin-dashboard">
      {/* Showcase Mode Header Banner */}
      <div className="bg-indigo-900 text-indigo-100 text-xs px-4 py-2 flex items-center justify-between border-b border-indigo-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            <strong>Recruiter & Reviewer Showcase Mode:</strong> Full administrative privileges, user moderation, and system analytics unlocked.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white hover:underline">
            ← Home
          </Link>
          <Link href="/feed" className="text-white hover:underline">
            Social Feed
          </Link>
        </div>
      </div>

      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo-area">
            <Link href="/">
              <img src="/logo.png" alt="SkillShikhi Logo" className="admin-logo" />
            </Link>
            <div className="admin-title-badge">
              <span className="admin-title">SkillShikhi Admin</span>
              <span className="admin-badge">Platform Lead</span>
            </div>
          </div>
          <div className="admin-user-info">
            <span className="admin-welcome">Welcome, Shiam (Recruiter Demo)</span>
            <button onClick={handleLogout} className="admin-logout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics & Growth
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            🛡️ Content Moderation
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            🚩 Reports & Flags
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            💻 Active Sessions
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📜 System Audit Logs
          </button>
        </nav>

        <main className="admin-content">
          <ClientOnly>
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'content' && <ContentTab />}
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'sessions' && <SessionsTab />}
            {activeTab === 'logs' && <LogsTab />}
          </ClientOnly>
        </main>
      </div>
    </div>
  );
}
