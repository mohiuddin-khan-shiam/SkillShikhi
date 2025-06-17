// controllers/user/userController.js

import { getUserProfile } from './profileController';
import { updateUserProfile } from './profileUpdateController';
import { uploadToCloudinary } from './imageUploadController';

// Re-export all user-related functions
export {
  getUserProfile,
  updateUserProfile,
  uploadToCloudinary
};
