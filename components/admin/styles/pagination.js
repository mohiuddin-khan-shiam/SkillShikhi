const paginationStyles = `
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    gap: 8px;
  }
  
  .pagination-button {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .pagination-button:hover:not(:disabled) {
    background-color: #f7fafc;
  }
  
  .pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-button.active {
    background-color: #4299e1;
    color: white;
    border-color: #4299e1;
  }
`;

export default paginationStyles; 