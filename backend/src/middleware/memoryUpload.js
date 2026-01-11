const multer = require('multer');

// Use memory storage for in-memory file uploads
const memoryStorage = multer.memoryStorage();

const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024 // 2MB default
  }
});

module.exports = memoryUpload;
