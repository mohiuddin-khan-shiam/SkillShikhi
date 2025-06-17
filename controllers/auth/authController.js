// controllers/auth/authController.js

import { login } from './loginController';
import { register } from './registerController';
import { verifyToken } from './tokenController';

// Re-export all authentication functions
export {
  login,
  register,
  verifyToken
};
