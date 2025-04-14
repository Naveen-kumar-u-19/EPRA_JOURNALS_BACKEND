const s3 = require('../config/awsconfig');
const multer = require('multer');
require('dotenv').config();

// Multer Memory Storage (For Temporary Upload Before S3)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Function used to upload file to aws
const uploadFile = async (req, folderName) => {
  if (!req.file) {
    throw new Error("No file uploaded");
  }
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folderName}/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult;
  } catch (error) {
    throw new Error("Error uploading file: " + error.message);
  }
};

module.exports = { upload, uploadFile }