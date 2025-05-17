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
  const baseUrl = config.app.baseUrl || 'http://localhost:3000';
  // Make sure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, baseUrl).toString();
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