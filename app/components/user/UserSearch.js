'use client';

import { useState } from 'react';

/**
 * User search input with icon
 */
const UserSearch = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      onSearch(query);
    } else if (query.trim().length === 0) {
      onSearch(''); // Clear results when search is empty
    }
  };

  return (
    <div className="search-container">
      <div className="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search users by name, skills or location..."
        className="search-input"
        value={searchQuery}
        onChange={handleSearch}
      />
    </div>
  );
};

export default UserSearch; 