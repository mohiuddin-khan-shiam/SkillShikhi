'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminDashboardTracker = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Track admin dashboard visit
    const trackVisit = async () => {
      try {
        // Only use adminToken for admin routes
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          console.error('No admin authentication token found');
          return;
        }
        
        // Create activity log for admin dashboard visit
        const logResponse = await fetch('/api/admin/logs', {
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
        
        // Check if logging was successful
        if (!logResponse.ok) {
          console.warn('Activity logging failed with status ' + logResponse.status + ': ' + logResponse.statusText);
        }
        
        // Update analytics for today
        const analyticsResponse = await fetch('/api/admin/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0]
          })
        });
        
        // Check if analytics update was successful
        if (!analyticsResponse.ok) {
          console.warn('Analytics update failed with status ' + analyticsResponse.status + ': ' + analyticsResponse.statusText);
        }
      } catch (error) {
        console.error('Error tracking admin dashboard visit:', error);
      }
    };
    
    trackVisit();
  }, []);
  
  return null; // This component doesn't render anything
};

export default AdminDashboardTracker;
