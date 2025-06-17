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
export async function uploadToCloudinary(base64Data, folder) {
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