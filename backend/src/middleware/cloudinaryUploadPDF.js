const cloudinary = require('../config/cloudinary');

/**
 * Uploads a PDF buffer to Cloudinary and returns the result
 * Usage: cloudinaryUploadPDF(buffer)
 */
const cloudinaryUploadPDF = async (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'raw', folder: 'certificates' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }).end(buffer);
  });
};

module.exports = cloudinaryUploadPDF;
