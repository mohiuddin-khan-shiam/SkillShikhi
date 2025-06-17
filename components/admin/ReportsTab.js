'use client';

import { useState, useEffect } from 'react';
import styles from './ReportsTab.styles';
import ReportsService from './ReportsService';
import { showNotification } from './ReportNotification';
import ReportDetailPanel from './ReportDetailPanel';
import ReportsList from './ReportsList';
import FilterControls from './FilterControls';
import BulkActions from './BulkActions';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import LoadingState from './LoadingState';

const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: '',
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state before fetching
      
      const data = await ReportsService.fetchReports(filters, page);
      
      // Check if reports array exists and has items
      if (!data.reports || !Array.isArray(data.reports)) {
        console.warn('No reports array in response or invalid format');
        setReports([]);
      } else {
        setReports(data.reports);
      }
      
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle report action 
  const handleReportAction = async (reportId, action, reason = '') => {
    try {
      await ReportsService.handleReportAction(reportId, action, reason);
      
      // Refresh reports
      fetchReports();
      
      // Close details panel if the actioned report was selected
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport(null);
      }
      
      // Show notification
      showNotification(`Report ${action === 'resolve' ? 'resolved' : 'dismissed'} successfully`, 'success');
    } catch (error) {
      showNotification(error.message || `Failed to ${action} report`, 'error', 5000);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filter changes
    
    // Immediately fetch reports when filter changes for better UX
    setTimeout(() => {
      fetchReports();
    }, 100);
  };
  
  // Apply filters
  const applyFilters = () => {
    setLoading(true);
    fetchReports();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'pending',
      type: 'user',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };
  
  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allReportIds = reports.map(report => report._id);
      setSelectedReports(allReportIds);
    } else {
      setSelectedReports([]);
    }
  };
  
  // Handle select report checkbox
  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    } else {
      setSelectedReports(prev => [...prev, reportId]);
    }
  };
  
  // Handle bulk action
  const handleBulkAction = async (action) => {
    if (selectedReports.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      await ReportsService.bulkAction(selectedReports, action);
      
      // Show success notification
      showNotification(`${selectedReports.length} reports ${action === 'resolve' ? 'resolved' : 'dismissed'} successfully`, 'success');
      
      // Reset selected reports
      setSelectedReports([]);
      
      // Refresh reports
      fetchReports();
    } catch (error) {
      showNotification(error.message || `Failed to ${action} reports in bulk`, 'error', 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  // Cancel bulk action
  const cancelBulkAction = () => {
    setSelectedReports([]);
  };
  
  // Show report details
  const showReportDetails = (report) => {
    setSelectedReport(report);
  };
  
  // Close report details
  const closeReportDetails = () => {
    setSelectedReport(null);
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, [page]);
  
  return (
    <>
      {/* Inject the CSS styles */}
      <style jsx global>{styles}</style>
      
      <div className="reports-tab">
        <div className="reports-header">
          <h2>User Reports</h2>
          
          {/* Bulk actions section */}
          {selectedReports.length > 0 && (
            <BulkActions
              selectedCount={selectedReports.length}
              loading={bulkActionLoading}
              onBulkAction={handleBulkAction}
              onCancel={cancelBulkAction}
            />
          )}
          
          {/* Filter controls */}
          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
          />
        </div>
        
        {/* Loading state */}
        {loading && (
          <LoadingState />
        )}
        
        {/* Error or empty state */}
        {!loading && (error || reports.length === 0) && (
          <EmptyState 
            error={error} 
            onRetry={fetchReports} 
          />
        )}
        
        {/* Reports table */}
        {!loading && !error && reports.length > 0 && (
          <>
            <ReportsList
              reports={reports}
              selectedReports={selectedReports}
              onSelectReport={handleSelectReport}
              onSelectAll={handleSelectAll}
              onShowDetails={showReportDetails}
              onReportAction={handleReportAction}
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
        
        {/* Report detail panel */}
        {selectedReport && (
          <ReportDetailPanel
            report={selectedReport}
            onClose={closeReportDetails}
            onActionCompleted={fetchReports}
          />
        )}
      </div>
    </>
  );
};

export default ReportsTab;
