const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'smartcity',
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const uploadFromUrl = async (url, options = {}) => {
  return cloudinary.uploader.upload(url, {
    folder: 'smartcity',
    ...options,
  });
};

const deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadBuffer, uploadFromUrl, deleteFile, cloudinary };
