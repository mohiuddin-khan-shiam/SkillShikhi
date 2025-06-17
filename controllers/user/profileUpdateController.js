import User from '../../models/User';
import dbConnect from '../../lib/mongodb';
import { uploadToCloudinary } from './imageUploadController';

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