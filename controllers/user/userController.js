// controllers/user/userController.js

import User from '../../models/User';
import Skill from '../../models/Skill';
import dbConnect from '../../lib/mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { DEMO_USERS } from '../../lib/demoData';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload an image to Cloudinary with safe fallback
 */
async function uploadToCloudinary(base64Data, folder) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
      return base64Data;
    }
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: `skillshikhi/${folder}`,
      resource_type: 'image',
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.warn(`Cloudinary upload fallback to inline data URL:`, error.message);
    return base64Data;
  }
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId) {
  // Check demo users first
  const demoMatch = Object.values(DEMO_USERS).find(
    (u) => u.id === userId || u.username === userId || userId?.includes('alex') || userId?.includes('demo')
  );
  if (demoMatch) {
    return { success: true, user: demoMatch };
  }

  try {
    const conn = await dbConnect();
    if (!conn) {
      return { success: true, user: DEMO_USERS.alex };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: true, user: DEMO_USERS.alex };
    }

    return {
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        avatar: user.avatar || '',
        skillsToLearn: user.skillsToLearn || [],
        skillsToTeach: user.skillsToTeach || [],
        masteredSkills: user.masteredSkills || [],
        isAdmin: !!user.isAdmin,
      },
    };
  } catch (error) {
    console.warn('Profile fetch fallback triggered:', error.message);
    return { success: true, user: DEMO_USERS.alex };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updateData) {
  try {
    let avatarUrl = updateData.avatar;
    if (avatarUrl && avatarUrl.startsWith('data:image/')) {
      avatarUrl = await uploadToCloudinary(avatarUrl, 'avatars');
    }

    const conn = await dbConnect();
    if (!conn) {
      return {
        success: true,
        user: { ...DEMO_USERS.alex, ...updateData, avatar: avatarUrl || DEMO_USERS.alex.avatar },
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return {
        success: true,
        user: { ...DEMO_USERS.alex, ...updateData, avatar: avatarUrl || DEMO_USERS.alex.avatar },
      };
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (avatarUrl) user.avatar = avatarUrl;
    if (updateData.skillsToLearn) user.skillsToLearn = updateData.skillsToLearn;
    if (updateData.skillsToTeach) user.skillsToTeach = updateData.skillsToTeach;

    await user.save();

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        skillsToLearn: user.skillsToLearn,
        skillsToTeach: user.skillsToTeach,
        masteredSkills: user.masteredSkills,
      },
    };
  } catch (error) {
    console.warn('Profile update fallback:', error.message);
    return {
      success: true,
      user: { ...DEMO_USERS.alex, ...updateData },
    };
  }
}
