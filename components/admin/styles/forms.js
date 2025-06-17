const formStyles = `
  .filter-controls {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }
  
  .filter-title {
    font-weight: 500;
    color: #4a5568;
    margin-right: 4px;
  }
  
  .filter-select, .filter-input {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: white;
    min-width: 150px;
  }

  .bulk-actions {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .selected-count {
    font-weight: 500;
    color: #4a5568;
  }
  
  .bulk-action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

export default formStyles; 