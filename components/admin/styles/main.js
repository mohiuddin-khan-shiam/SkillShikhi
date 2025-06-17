import tableStyles from './table.js';
import formStyles from './forms.js';
import statusStyles from './status.js';
import loadingStyles from './loading.js';
import emptyStyles from './empty.js';
import paginationStyles from './pagination.js';
import notificationStyles from './notification.js';
import buttonStyles from './buttons.js';
import detailsStyles from './details.js';

const combinedStyles = `
  ${tableStyles}
  ${formStyles}
  ${statusStyles}
  ${loadingStyles}
  ${emptyStyles}
  ${paginationStyles}
  ${notificationStyles}
  ${buttonStyles}
  ${detailsStyles}
  
  .reports-tab {
    font-family: 'Inter', sans-serif;
  }
  
  .reports-header {
    margin-bottom: 20px;
  }
  
  .reports-header h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1a202c;
  }
  
  @media (max-width: 768px) {
    .filter-controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .reports-table {
      display: block;
      overflow-x: auto;
    }
    
    .bulk-action-buttons {
      flex-direction: column;
    }
  }
`;

export default combinedStyles; 