'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminDashboardTracker = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Track admin dashboard visit
    const trackVisit = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        // Create activity log for admin dashboard visit
        await fetch('/api/admin/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            actionType: 'admin_dashboard_visit',
            details: {
              page: 'dashboard',
              timestamp: new Date().toISOString()
            }
          })
        });
        
        // Update analytics for today
        await fetch('/api/admin/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0]
          })
        });
      } catch (error) {
        console.error('Error tracking admin dashboard visit:', error);
      }
    };
    
    trackVisit();
  }, []);
  
  return null; // This component doesn't render anything
};

export default AdminDashboardTracker;
