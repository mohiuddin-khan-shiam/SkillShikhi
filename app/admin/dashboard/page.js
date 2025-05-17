'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import '../../../styles/admin.css';

// Import components with relative paths
const ClientOnly = dynamic(() => import('../../../components/ClientOnly'), { ssr: false });
const ReportsTab = dynamic(() => import('../../../components/admin/ReportsTab'), { ssr: false });
const UsersTab = dynamic(() => import('../../../components/admin/UsersTab'), { ssr: false });
const ContentTab = dynamic(() => import('../../../components/admin/ContentTab'), { ssr: false });
const SessionsTab = dynamic(() => import('../../../components/admin/SessionsTab'), { ssr: false });
const LogsTab = dynamic(() => import('../../../components/admin/LogsTab'), { ssr: false });
const AnalyticsTab = dynamic(() => import('../../../components/admin/AnalyticsTab'), { ssr: false });
const AdminDashboardTracker = dynamic(() => import('../../../components/admin/AdminDashboardTracker'), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('reports');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        if (!token) {
          router.push('/admin-login');
          return;
        }
        
        console.log('Checking admin status with token:', token);
        const response = await fetch('/api/admin/login', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });
        
        const data = await response.json();
        console.log('Admin check response:', data);
        
        if (response.ok) {
          console.log('Admin authentication successful');
          setIsAdmin(true);
        } else {
          router.push('/admin-login');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/admin-login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [router]);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    localStorage.removeItem('adminId');
    router.push('/admin-login');
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Show unauthorized message if not admin
  if (!isAdmin) {
    return (
      <div className="admin-error">
        <div className="admin-error-content">
          <h2>Unauthorized Access</h2>
          <p>You do not have permission to access the admin dashboard.</p>
          <button onClick={() => router.push('/admin-login')} className="admin-button primary-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Main dashboard render
  return (
    <div className="admin-dashboard">
      <ClientOnly>
        <AdminDashboardTracker />
      </ClientOnly>
      <div className="admin-header">
        <h1 className="admin-title">SkillShikhi Admin</h1>
        <button onClick={handleLogout} className="admin-button secondary-button">Logout</button>
      </div>
      
      <div className="admin-layout">
        <nav className="admin-nav">
          <ul className="admin-nav-list">
            <li className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}>
              <a href="#" className="admin-nav-link" onClick={(e) => {
                e.preventDefault();
                setActiveTab('reports');
              }}>
                <span className="nav-icon">📊</span>
                Reports
              </a>
            </li>
            <li className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}>
              <a href="#" className="admin-nav-link" onClick={(e) => {
                e.preventDefault();
                setActiveTab('users');
              }}>
                <span className="nav-icon">👥</span>
                User Management
              </a>
            </li>
            <li className={`admin-nav-item ${activeTab === 'content' ? 'active' : ''}`}>
              <a href="#" className="admin-nav-link" onClick={(e) => {
                e.preventDefault();
                setActiveTab('content');
              }}>
                <span className="nav-icon">📝</span>
                Content Moderation
              </a>
            </li>
            <li className={`admin-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}>
              <a href="#" className="admin-nav-link" onClick={(e) => {
                e.preventDefault();
                setActiveTab('sessions');
              }}>
                <span className="nav-icon">🔄</span>
                Active Sessions
              </a>
            </li>
            <li className={`admin-nav-item ${activeTab === 'logs' ? 'active' : ''}`}>
              <a href="#" className="admin-nav-link" onClick={(e) => {
                e.preventDefault();
                setActiveTab('logs');
              }}>
                <span className="nav-icon">📋</span>
                Activity Logs
              </a>
            </li>
            <li className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
              <a href="#" className="admin-nav-link" onClick={(e) => {
                e.preventDefault();
                setActiveTab('analytics');
              }}>
                <span className="nav-icon">📈</span>
                Analytics
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="admin-content">
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Reports Management</h2>
              </div>
              <div className="admin-card-body">
                <ClientOnly>
                  <ReportsTab />
                </ClientOnly>
              </div>
            </div>
          )}
          
          {/* Users Tab - Combined with Banned Users */}
          {activeTab === 'users' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">User Management</h2>
              </div>
              <div className="admin-card-body">
                <ClientOnly>
                  <UsersTab />
                </ClientOnly>
              </div>
            </div>
          )}
          
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Content Moderation</h2>
              </div>
              <div className="admin-card-body">
                <ClientOnly>
                  <ContentTab />
                </ClientOnly>
              </div>
            </div>
          )}
      
          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Active Sessions</h2>
              </div>
              <div className="admin-card-body">
                <ClientOnly>
                  <SessionsTab />
                </ClientOnly>
              </div>
            </div>
          )}
          
          {/* Activity Logs Tab */}
          {activeTab === 'logs' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Activity Logs</h2>
              </div>
              <div className="admin-card-body">
                <ClientOnly>
                  <LogsTab />
                </ClientOnly>
              </div>
            </div>
          )}
          
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Analytics & Reporting</h2>
              </div>
              <div className="admin-card-body">
                <ClientOnly>
                  <AnalyticsTab />
                </ClientOnly>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
