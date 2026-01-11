const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer to Cloudinary and returns the result
 * Usage: cloudinaryUpload(req.file.buffer, req.file.mimetype)
 */
const cloudinaryUpload = async (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }).end(buffer);
  });
};

module.exports = cloudinaryUpload;
