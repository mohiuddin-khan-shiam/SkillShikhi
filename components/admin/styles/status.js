const statusStyles = `
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .status-badge.pending {
    background-color: #fef3c7;
    color: #92400e;
  }
  
  .status-badge.resolved {
    background-color: #d1fae5;
    color: #065f46;
  }
  
  .status-badge.dismissed {
    background-color: #fee2e2;
    color: #991b1b;
  }
`;

export default statusStyles; 