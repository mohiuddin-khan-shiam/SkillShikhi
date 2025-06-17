'use client';

/**
 * Individual user card with user information
 */
const UserCard = ({ user, onRequestSession }) => {
  return (
    <div className="user-card">
      <div className="user-card-content">
        <div className="user-image">
          <img 
            src={user.profileImage || '/images/default-avatar.png'} 
            alt={`${user.name}'s profile`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-avatar.png';
            }}
          />
        </div>
        <div className="user-info">
          <h3 className="user-name">{user.name}</h3>
          <p className="user-location">
            <span className="location-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            {user.location || 'Unknown location'}
          </p>
          {user.skills && user.skills.length > 0 && (
            <div className="user-skills">
              <span className="skills-label">Skills:</span>
              <div className="skills-list">
                {user.skills.slice(0, 3).map((skill, index) => (
                  <span key={`${skill._id || index}`} className="skill-tag">
                    {skill.name || skill}
                  </span>
                ))}
                {user.skills.length > 3 && (
                  <span className="more-skills">+{user.skills.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="user-card-actions">
        <button 
          className="request-session-btn"
          onClick={() => onRequestSession(user)}
        >
          Request Session
        </button>
      </div>
    </div>
  );
};

export default UserCard; 