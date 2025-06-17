/**
 * Service for handling report-related API calls
 */
export const ReportsService = {
  /**
   * Fetch reports from the API
   * @param {Object} filters - Filter options for reports query
   * @param {number} page - Current page number
   * @returns {Promise<Object>} - The reports data
   */
  async fetchReports(filters, page) {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store' // Prevent caching to ensure fresh data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reports');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },
  
  /**
   * Handle report action (resolve, dismiss, etc.)
   * @param {string} reportId - ID of the report
   * @param {string} action - Action to perform (resolve, dismiss)
   * @param {string} reason - Reason for the action (optional)
   * @returns {Promise<Object>} - The API response
   */
  async handleReportAction(reportId, action, reason = '') {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`/api/admin/reports/${reportId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} report`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      throw error;
    }
  },
  
  /**
   * Perform bulk action on multiple reports
   * @param {Array<string>} reportIds - IDs of reports to act on
   * @param {string} action - Action to perform (resolve, dismiss)
   * @returns {Promise<Object>} - The API response
   */
  async bulkAction(reportIds, action) {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`/api/admin/reports/bulk/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reportIds })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} reports in bulk`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      throw error;
    }
  }
};

export default ReportsService; 