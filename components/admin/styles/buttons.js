const buttonStyles = `
  .apply-button, .reset-button {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .apply-button {
    background-color: #4299e1;
    color: white;
    border: none;
  }
  
  .apply-button:hover {
    background-color: #3182ce;
  }
  
  .reset-button {
    background-color: white;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }
  
  .reset-button:hover {
    background-color: #f7fafc;
  }
  
  .bulk-action-button {
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    border: none;
  }
  
  .bulk-action-button.review {
    background-color: #ebf8ff;
    color: #2b6cb0;
  }
  
  .bulk-action-button.review:hover {
    background-color: #bee3f8;
  }
  
  .bulk-action-button.resolve {
    background-color: #f0fff4;
    color: #2f855a;
  }
  
  .bulk-action-button.resolve:hover {
    background-color: #c6f6d5;
  }
  
  .bulk-action-button.dismiss {
    background-color: #fff5f5;
    color: #c53030;
  }
  
  .bulk-action-button.dismiss:hover {
    background-color: #fed7d7;
  }
  
  .bulk-action-button.cancel {
    background-color: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }
  
  .bulk-action-button.cancel:hover {
    background-color: #edf2f7;
  }
  
  .action-icon {
    font-size: 14px;
  }
  
  .action-button {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .action-button.resolve {
    background-color: #48bb78;
    color: white;
    border: none;
  }
  
  .action-button.resolve:hover {
    background-color: #38a169;
  }
  
  .action-button.dismiss {
    background-color: #f56565;
    color: white;
    border: none;
  }
  
  .action-button.dismiss:hover {
    background-color: #e53e3e;
  }
  
  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: #a0aec0;
  }
  
  .close-button:hover {
    color: #4a5568;
  }
`;

export default buttonStyles; 