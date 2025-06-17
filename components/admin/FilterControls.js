'use client';

const FilterControls = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters,
  onResetFilters
}) => {
  return (
    <div className="filter-controls">
      <div>
        <span className="filter-title">Status:</span>
        <select
          name="status"
          value={filters.status}
          onChange={onFilterChange}
          className="filter-select"
        >
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="">All</option>
        </select>
      </div>
      
      <div>
        <span className="filter-title">From:</span>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={onFilterChange}
          className="filter-input"
        />
      </div>
      
      <div>
        <span className="filter-title">To:</span>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={onFilterChange}
          className="filter-input"
        />
      </div>
      
      <button
        className="apply-button"
        onClick={onApplyFilters}
      >
        Apply Filters
      </button>
      
      <button
        className="reset-button"
        onClick={onResetFilters}
      >
        Reset
      </button>
    </div>
  );
};

export default FilterControls; 