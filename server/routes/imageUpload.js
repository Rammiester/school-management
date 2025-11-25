const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer to store file in memory instead of disk
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Upload image endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const uploadResult = await s3.upload(params).promise();

    console.log('Image uploaded to S3 successfully:', {
      url: uploadResult.Location,
      key: uploadResult.Key,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        url: uploadResult.Location,
        key: uploadResult.Key,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (err) {
    console.error('Image upload error:', err);
    // Handle multer errors specifically
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5MB limit' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files uploaded' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected field in form data' });
      }
    }
    // Handle other errors
    res.status(500).json({ 
      error: 'Image upload failed',
      message: err.message 
    });
  }
});

// Health check endpoint for image upload functionality
router.get('/health', (req, res) => {
  try {
    // Check if S3 configuration is properly set up
    const hasAccessKeyId = !!process.env.AWS_ACCESS_KEY_ID;
    const hasSecretAccessKey = !!process.env.AWS_SECRET_ACCESS_KEY;
    const hasBucketName = !!process.env.AWS_S3_BUCKET_NAME;
    const hasRegion = !!process.env.AWS_REGION;

    const s3Configured = hasAccessKeyId && hasSecretAccessKey && hasBucketName && hasRegion;
    
    res.json({
      status: 'OK',
      s3Configured: s3Configured,
      s3AccessKeyId: hasAccessKeyId ? 'configured' : 'missing',
      s3SecretAccessKey: hasSecretAccessKey ? 'configured' : 'missing',
      s3BucketName: hasBucketName ? 'configured' : 'missing',
      s3Region: hasRegion ? process.env.AWS_REGION : 'missing'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

module.exports = router;
