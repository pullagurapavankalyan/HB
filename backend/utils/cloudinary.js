const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const logger = require('./logger');

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary and removes the local temporary file
 * @param {String} localFilePath 
 * @param {String} folderName 
 * @returns {Object} Upload result containing secure_url and public_id
 */
const uploadOnCloudinary = async (localFilePath, folderName = 'smart_hotel') => {
  try {
    if (!localFilePath) return null;
    
    // Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: folderName,
    });
    
    // File has been uploaded successfully
    fs.unlinkSync(localFilePath); // remove locally saved temp file
    return response;
  } catch (error) {
    logger.error('Error uploading to Cloudinary', error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload operation failed
    }
    return null;
  }
};

/**
 * Deletes a file from Cloudinary using its public ID
 * @param {String} publicId 
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Error deleting from Cloudinary', error);
  }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
