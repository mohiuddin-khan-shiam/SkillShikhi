// utils/validation.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and message
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is valid'
  };
}

/**
 * Validate user registration data
 * @param {Object} userData - User registration data
 * @returns {Object} Validation result with isValid flag and errors
 */
export function validateUserRegistration(userData) {
  const errors = {};
  
  // Validate name
  if (!userData.name || userData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  // Validate email
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.email = 'Please provide a valid email address';
  }
  
  // Validate password
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate login credentials
 * @param {Object} credentials - Login credentials
 * @returns {Object} Validation result with isValid flag and errors
 */
export function validateLoginCredentials(credentials) {
  const errors = {};
  
  // Validate email
  if (!credentials.email || !isValidEmail(credentials.email)) {
    errors.email = 'Please provide a valid email address';
  }
  
  // Validate password
  if (!credentials.password || credentials.password.trim().length === 0) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate session request data
 * @param {Object} sessionData - Session request data
 * @returns {Object} Validation result with isValid flag and errors
 */
export function validateSessionRequest(sessionData) {
  const errors = {};
  
  // Validate toUserId
  if (!sessionData.toUserId) {
    errors.toUserId = 'Recipient user ID is required';
  }
  
  // Validate skill
  if (!sessionData.skill || sessionData.skill.trim().length === 0) {
    errors.skill = 'Skill name is required';
  }
  
  // Validate preferredDate if provided
  if (sessionData.preferredDate) {
    const date = new Date(sessionData.preferredDate);
    if (isNaN(date.getTime())) {
      errors.preferredDate = 'Invalid date format';
    } else if (date < new Date()) {
      errors.preferredDate = 'Preferred date cannot be in the past';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
