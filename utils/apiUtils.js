/**
 * API Utilities
 * Common utilities for working with APIs and fetch
 */
import config from '../config';

/**
 * Get absolute URL for an API endpoint
 * 
 * This helper ensures that API calls work in both client and server contexts
 * by properly constructing absolute URLs from relative paths.
 * 
 * @param {string} path - Relative API path (e.g., '/api/users')
 * @returns {string} - Absolute URL
 */
export function getAbsoluteUrl(path) {
  // Handle browser environment
  if (typeof window !== 'undefined') {
    // For browser environment, use current origin
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${window.location.origin}${normalizedPath}`;
  }
  
  // For server environment, use config
  const baseUrl = config.app.baseUrl || 'http://localhost:3000';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  try {
    return new URL(normalizedPath, baseUrl).toString();
  } catch (error) {
    console.error('Error constructing URL:', error);
    // Fallback to simple concatenation
    return `${baseUrl}${normalizedPath}`;
  }
}

/**
 * Enhanced fetch that automatically uses absolute URLs
 * 
 * @param {string} path - Relative API path
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function apiFetch(path, options = {}) {
  const url = getAbsoluteUrl(path);
  return fetch(url, options);
} 