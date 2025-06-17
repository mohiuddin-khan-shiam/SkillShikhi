// utils/jwt.js
// This file is deprecated, import from utils/jwtUtils.js instead

import {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  getUserFromRequest,
} from './jwtUtils';

export {
  generateToken,
  verifyToken as verifyJWT, // Export verifyToken as verifyJWT for backward compatibility
  extractTokenFromHeader,
  getUserFromRequest,
};