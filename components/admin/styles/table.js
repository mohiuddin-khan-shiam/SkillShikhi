const tableStyles = `
  .reports-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
  }
  
  .reports-table th {
    background-color: #f7fafc;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #4a5568;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .reports-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }
  
  .reports-table tr:last-child td {
    border-bottom: none;
  }
  
  .reports-table tr:hover {
    background-color: #f8fafc;
  }
  
  .selected-row {
    background-color: #ebf8ff !important;
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .user-avatar-small {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

export default tableStyles; 