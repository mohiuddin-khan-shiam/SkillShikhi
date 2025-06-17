const notificationStyles = `
  /* Notification styles */
  .report-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    max-width: 350px;
    animation: slide-in 0.3s ease-out forwards;
  }
  
  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .report-notification.fade-out {
    animation: slide-out 0.5s ease-in forwards;
  }
  
  @keyframes slide-out {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .report-notification.success {
    background-color: #d1fae5;
    border-left: 4px solid #10b981;
    color: #065f46;
  }
  
  .report-notification.error {
    background-color: #fee2e2;
    border-left: 4px solid #ef4444;
    color: #991b1b;
  }
  
  .notification-icon {
    font-size: 18px;
  }
  
  .close-notification {
    margin-left: auto;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
  }
  
  .close-notification:hover {
    opacity: 1;
  }
`;

export default notificationStyles; 