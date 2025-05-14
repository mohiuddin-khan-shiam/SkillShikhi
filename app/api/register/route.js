// app/api/register/route.js
import { register } from '../../../controllers/auth/authController';

export async function POST(request) {
  try {
    // Parse request body
    const userData = await request.json();
    
    // Call the register controller function
    const result = await register(userData);
    
    // Return the appropriate response based on the controller result
    return Response.json(
      {
        message: result.message,
        ...(result.success ? { user: result.user } : {})
      }, 
      { status: result.status }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
