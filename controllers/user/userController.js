// controllers/user/userController.js

import User from '../../models/User';
import Skill from '../../models/Skill';
import dbConnect from '../../lib/mongodb';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload an image to Cloudinary
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string>} - URL of the uploaded image
 */
async function uploadToCloudinary(base64Data, folder) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: `skillshikhi/${folder}`,
      resource_type: 'image',
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading to Cloudinary:`, error);
    throw error;
  }
}

/**
 * Get user profile by user ID
 * @param {string} userId - User ID
 * @returns {Object} Response object with user data or error message
 */
export async function getUserProfile(userId) {
  console.log(`🔍 Getting profile for user: ${userId}`);
  
  try {
    await dbConnect();
    
    // Get user document with masteredSkills
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return { success: false, message: 'User not found', status: 404 };
    }
    
    // Ensure masteredSkills exists
    if (!user.masteredSkills) {
      console.log(`⚠️ User ${userId} has no masteredSkills array, initializing it`);
      user.masteredSkills = [];
      await user.save();
    }
    
    console.log(`📊 Found ${user.masteredSkills.length} mastered skills for user ${userId}`);
    
    // Convert user document to a plain object for response
    const userObject = user.toObject();
    
    // Update the last active timestamp
    await User.updateOne(
      { _id: userId },
      { $set: { lastActive: new Date() } }
    );
    
    return { success: true, user: userObject, status: 200 };
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return { success: false, message: 'Server error', status: 500 };
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Response object with updated user data or error message
 */
export async function updateUserProfile(userId, updateData) {
  console.log(`✏️ Updating profile for user: ${userId}`);
  console.log('📄 Profile update payload:', JSON.stringify(updateData));
  
  try {
    await dbConnect();
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return { success: false, message: 'User not found', status: 404 };
    }
    
    // Ensure masteredSkills is initialized if it doesn't exist
    if (!user.masteredSkills) {
      console.log(`⚠️ User ${userId} has no masteredSkills array, initializing it`);
      user.masteredSkills = [];
    }
    
    // Handle profile image upload if provided
    if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {
      try {
        console.log('📷 Uploading new profile image to Cloudinary');
        updateData.profileImage = await uploadToCloudinary(updateData.profileImage, 'profiles');
        console.log('✅ Profile image uploaded successfully');
      } catch (uploadError) {
        console.error('❌ Profile image upload failed:', uploadError);
        // Continue with the update even if image upload fails
        delete updateData.profileImage;
      }
    }
    
    // Handle cover image upload if provided
    if (updateData.coverImage && updateData.coverImage.startsWith('data:image')) {
      try {
        console.log('🖼️ Uploading new cover image to Cloudinary');
        updateData.coverImage = await uploadToCloudinary(updateData.coverImage, 'covers');
        console.log('✅ Cover image uploaded successfully');
      } catch (uploadError) {
        console.error('❌ Cover image upload failed:', uploadError);
        // Continue with the update even if image upload fails
        delete updateData.coverImage;
      }
    }
    
    // Note: Do not update masteredSkills here as it's managed by a separate API
    // Remove masteredSkills from data if present to prevent direct updates
    if (updateData.masteredSkills) {
      console.log('⚠️ Removing masteredSkills from update data as it should be managed by dedicated API');
      delete updateData.masteredSkills;
    }
    
    // Explicitly handle isPublic as a boolean
    if (updateData.isPublic !== undefined) {
      console.log(`🔒 Setting profile privacy to: ${updateData.isPublic ? 'Public' : 'Private'}`);
      user.isPublic = Boolean(updateData.isPublic);
    }
    
    // Update user properties 
    const allowedFields = [
      'name', 'bio', 'location', 'profileImage', 'coverImage', 'email', 
      'skills', 'social', 'privacySettings', 'interests', 'availability'
    ];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        console.log(`✏️ Updating field: ${field}`);
        user[field] = updateData[field];
      }
    });
    
    // Save the updated user
    await user.save();
    console.log('✅ User profile updated successfully');
    console.log(`🔒 Profile privacy is now: ${user.isPublic ? 'Public' : 'Private'}`);
    
    // Get the updated user with masteredSkills
    const updatedUser = await User.findById(userId);
    return { success: true, user: updatedUser.toObject(), status: 200 };
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return { success: false, message: 'Server error: ' + error.message, status: 500 };
  }
}
