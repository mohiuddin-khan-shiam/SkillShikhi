// app/api/login/route.js

export const runtime = 'nodejs';

import dotenv from 'dotenv';
dotenv.config();

import { NextResponse } from 'next/server';
import { login } from '../../../controllers/auth/authController';
import { successResponse, errorResponse, handleControllerResponse } from '../../../utils/apiResponse';

export async function POST(request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('❌ Error parsing request body:', error);
      return errorResponse('Invalid request body', 400);
    }

    // Call the login controller function
    const result = await login(body);
    
    // Use the utility to handle the controller response
    return handleControllerResponse(result);
  } catch (error) {
    console.error('❌ Unexpected login error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
