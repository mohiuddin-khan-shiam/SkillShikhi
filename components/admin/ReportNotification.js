'use client';

/**
 * Component for showing notifications in the ReportsTab
 */
const ReportNotification = ({ type, message, onClose }) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`report-notification ${type}`}>
      <span className="notification-icon">
        {type === 'success' ? '✅' : '⚠️'}
      </span>
      <span>{message}</span>
      <button className="close-notification" onClick={handleClose}>×</button>
    </div>
  );
};

/**
 * Show a notification that auto-dismisses after a timeout
 */
export const showNotification = (message, type = 'success', autoHideTime = 3000) => {
  // Create the notification element
  const notification = document.createElement('div');
  notification.className = `report-notification ${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${type === 'success' ? '✅' : '⚠️'}</span>
    <span>${message}</span>
    <button class="close-notification">×</button>
  `;
  document.body.appendChild(notification);
  
  // Add event listener to close button
  const closeButton = notification.querySelector('.close-notification');
  closeButton.addEventListener('click', () => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  });
  
  // Auto-remove after specified time
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, autoHideTime);
};

export default ReportNotification; 