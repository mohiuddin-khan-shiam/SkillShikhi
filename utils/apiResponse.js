// utils/apiResponse.js

import { NextResponse } from 'next/server';

/**
 * Create a standardized success response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {NextResponse} Formatted Next.js response
 */
export function successResponse(data, status = 200) {
  return NextResponse.json({
    success: true,
    ...data
  }, { status });
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 500)
 * @returns {NextResponse} Formatted Next.js response
 */
export function errorResponse(message, status = 500) {
  return NextResponse.json({
    success: false,
    message
  }, { status });
}

/**
 * Handle controller response and convert to NextResponse
 * @param {Object} result - Controller result object
 * @returns {NextResponse} Formatted Next.js response
 */
export function handleControllerResponse(result) {
  if (!result.success) {
    return errorResponse(result.message, result.status);
  }
  
  // Remove success and status from the response data
  const { success, status, ...data } = result;
  return successResponse(data, status);
}
