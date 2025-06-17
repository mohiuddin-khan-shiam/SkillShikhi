'use client';

import { useState } from 'react';

const SkillTag = ({ skill, editable = false, onRemove, removing = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate a consistent pastel color based on skill name
  const generatePastelColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a pastel hue (using limited range for pastel effect)
    const h = hash % 360;
    const s = 65 + (hash % 20); // Saturation between 65-85%
    const l = 75 + (hash % 10); // Lightness between 75-85%
    
    return { backgroundColor: `hsl(${h}, ${s}%, ${l}%)`, color: `hsl(${h}, 80%, 25%)` };
  };
  
  const tagStyle = generatePastelColor(skill);
  
  return (
    <span 
      className="badge rounded-pill d-inline-flex align-items-center py-2 px-3 me-2 mb-2 position-relative overflow-hidden transition-all"
      style={{
        ...tagStyle,
        transition: 'all 0.2s ease',
        transform: isHovered && editable ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered && editable ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      role="listitem"
    >
      {/* Ripple background for hover effect */}
      {editable && (
        <span 
          className="position-absolute top-0 start-0 w-100 h-100 opacity-25" 
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
            transform: `scale(${isHovered ? 1 : 0})`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease-out',
            zIndex: 0
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Skill name */}
      <span className="fw-medium" style={{ zIndex: 1 }}>{skill}</span>
      
      {/* Remove button */}
      {editable && (
        <button
          onClick={() => onRemove(skill)}
          className="d-flex align-items-center justify-content-center ms-2"
          style={{ 
            width: '16px', 
            height: '16px', 
            borderRadius: '50%', 
            border: 'none',
            backgroundColor: 'rgba(0,0,0,0.1)',
            cursor: removing ? 'wait' : 'pointer',
            padding: 0,
            zIndex: 1,
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.2s ease'
          }}
          disabled={removing}
          title="Remove skill"
          aria-label={`Remove ${skill} skill`}
        >
          {removing ? (
            <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }} role="status" aria-hidden="true" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          )}
        </button>
      )}
    </span>
  );
};

export default SkillTag;