import User from '../../models/User';
import dbConnect from '../../lib/mongodb';
import { uploadToCloudinary } from './imageUploadController';

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