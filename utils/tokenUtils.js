/**
 * Generates a secure random token for password reset
 * @returns {string} A random token string
 */
export function generateResetToken() {
  // In a browser environment
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // In Node.js environment
  try {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  } catch (error) {
    // Fallback for environments without crypto
    console.warn('Crypto not available, using less secure token generation');
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }
}

/**
 * Checks if a token is expired
 * @param {Date} expiryDate - The expiry date to check
 * @returns {boolean} True if the token is expired
 */
export function isTokenExpired(expiryDate) {
  if (!expiryDate) return true;
  return new Date() > new Date(expiryDate);
} 