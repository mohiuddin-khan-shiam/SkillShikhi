// app/api/register/route.js
import { register } from '../../../controllers/auth/registerController';
import { successResponse, errorResponse, handleControllerResponse } from '../../../utils/apiResponse';

export async function POST(request) {
  try {
    // Parse request body
    const userData = await request.json();
    
    // Call the register controller function
    const result = await register(userData);
    
    // Return standardized response using the utility function
    return handleControllerResponse(result);
  } catch (error) {
    console.error('Unexpected registration error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
