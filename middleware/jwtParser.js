/**
 * Base64 URL decoder that works in both browser and Node.js
 */
function base64UrlDecode(str) {
  // Replace non-url compatible chars with base64 standard chars
  let input = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad out with standard base64 required padding characters
  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
    }
    input += new Array(5-pad).join('=');
  }
  
  // Use either browser or Node.js approach to decode
  if (typeof atob === 'function') {
    return decodeURIComponent(atob(input).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } else {
    // Node.js approach
    return Buffer.from(input, 'base64').toString('utf-8');
  }
}

/**
 * Extract payload from JWT token without verification
 */
export function extractJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch (error) {
    console.error('Failed to extract JWT payload:', error);
    return null;
  }
} 