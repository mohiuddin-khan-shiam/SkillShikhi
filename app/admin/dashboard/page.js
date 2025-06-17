'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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
        // Only use adminToken, not regular token for admin routes
        const token = localStorage.getItem('adminToken');
        
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
    // Clear localStorage tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    localStorage.removeItem('adminId');
    
    // Clear cookies
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirect to admin login with the correct path: /admin-login (with hyphen)
    router.push('/admin-login');
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="card shadow p-4 text-center" style={{ maxWidth: '400px' }}>
          <div className="d-flex justify-content-center mb-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <p className="text-secondary fs-5">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Show unauthorized message if not admin
  if (!isAdmin) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="card shadow p-4 text-center" style={{ maxWidth: '400px' }}>
          <div className="text-danger mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
          </div>
          <h2 className="fs-3 fw-bold mb-2">Unauthorized Access</h2>
          <p className="text-secondary mb-4">You do not have permission to access the admin dashboard.</p>
          <button 
            onClick={() => router.push('/admin-login')} 
            className="btn btn-primary py-2 px-4"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Main dashboard render
  return (
    <div className="min-vh-100 bg-light">
      <ClientOnly>
        <AdminDashboardTracker />
      </ClientOnly>
      <nav className="navbar navbar-light bg-white shadow-sm px-3">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <span className="fw-bold">
              <span className="text-primary">Skill</span>
              <span style={{color: '#0a326e'}}>Shikhi</span>
              <span className="text-secondary ms-2 fw-normal">Admin</span>
            </span>
          </a>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-secondary btn-sm"
          >
            Logout
          </button>
        </div>
      </nav>
      
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 col-lg-2 bg-white shadow-sm min-vh-100 p-0">
            <div className="list-group list-group-flush">
              <a 
                href="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('reports');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-clipboard-data me-2" viewBox="0 0 16 16">
                  <path d="M4 11a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1zm6-4a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V7zM7 9a1 1 0 0 1 2 0v3a1 1 0 1 1-2 0V9z"/>
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Reports
              </a>
              <a 
                href="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${activeTab === 'users' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('users');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-people me-2" viewBox="0 0 16 16">
                  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
                </svg>
                User Management
              </a>
              <a 
                href="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${activeTab === 'content' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('content');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-file-text me-2" viewBox="0 0 16 16">
                  <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
                  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
                </svg>
                Content Moderation
              </a>
              <a 
                href="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${activeTab === 'sessions' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('sessions');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-arrow-repeat me-2" viewBox="0 0 16 16">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                  <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                </svg>
                Active Sessions
              </a>
              <a 
                href="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('logs');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-list-ul me-2" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                </svg>
                Activity Logs
              </a>
              <a 
                href="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('analytics');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-graph-up me-2" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
                </svg>
                Analytics
              </a>
            </div>
          </div>
          
          <div className="col-md-9 col-lg-10 p-4">
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="card shadow-sm">
                <div className="card-header py-3">
                  <h5 className="card-title mb-0">Reports Management</h5>
                </div>
                <div className="card-body">
                  <ClientOnly>
                    <ReportsTab />
                  </ClientOnly>
                </div>
              </div>
            )}
          
            {/* Users Tab - Combined with Banned Users */}
            {activeTab === 'users' && (
              <div className="card shadow-sm">
                <div className="card-header py-3">
                  <h5 className="card-title mb-0">User Management</h5>
                </div>
                <div className="card-body">
                  <ClientOnly>
                    <UsersTab />
                  </ClientOnly>
                </div>
              </div>
            )}
          
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="card shadow-sm">
                <div className="card-header py-3">
                  <h5 className="card-title mb-0">Content Moderation</h5>
                </div>
                <div className="card-body">
                  <ClientOnly>
                    <ContentTab />
                  </ClientOnly>
                </div>
              </div>
            )}
          
            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="card shadow-sm">
                <div className="card-header py-3">
                  <h5 className="card-title mb-0">Active Sessions</h5>
                </div>
                <div className="card-body">
                  <ClientOnly>
                    <SessionsTab />
                  </ClientOnly>
                </div>
              </div>
            )}
          
            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="card shadow-sm">
                <div className="card-header py-3">
                  <h5 className="card-title mb-0">Activity Logs</h5>
                </div>
                <div className="card-body">
                  <ClientOnly>
                    <LogsTab />
                  </ClientOnly>
                </div>
              </div>
            )}
          
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="card shadow-sm">
                <div className="card-header py-3">
                  <h5 className="card-title mb-0">Analytics Dashboard</h5>
                </div>
                <div className="card-body">
                  <ClientOnly>
                    <AnalyticsTab />
                  </ClientOnly>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}