// routes/feedback.js

const express = require('express');
const Feedback = require('../models/Feedback');
const { authMiddleware, adminMiddleware } = require('../middleware/jwt');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const router = express.Router();

// Configure S3 for image uploads
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer to store file in memory instead of disk for S3 upload
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

// Create new feedback (user route)
router.post('/', authMiddleware, upload.none(), async (req, res) => {
  try {
    const { title, description, priority, image } = req.body;
    
    // Create feedback object
    const feedbackData = {
      userId: req.user.id,
      userName: req.user.name || req.user.email, // Fallback to email if name not available
      userRole: req.user.role,
      title,
      description,
      priority: priority || 'medium'
    };

    // Handle image data (if provided) - this comes from the separate image upload endpoint
    if (image) {
      try {
        const imageInfo = JSON.parse(image);
        feedbackData.image = {
          url: imageInfo.url,
          filename: imageInfo.filename
        };
      } catch (parseError) {
        // If parsing fails, treat as string and store as-is (backward compatibility)
        feedbackData.image = {
          url: image
        };
      }
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: feedback
    });
  } catch (err) {
    console.error('Feedback submission error:', err); // Add logging for debugging
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
    res.status(400).json({ error: err.message });
  }
});

// Create new feedback with image upload (user route)
router.post('/with-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    
    // If image was uploaded, upload to S3 first
    let imageData = null;
    if (req.file) {
      const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `feedback/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };

      const uploadResult = await s3.upload(s3Params).promise();
      
      imageData = {
        url: uploadResult.Location,
        filename: uploadResult.Key
      };
    }

    // Create feedback object
    const feedbackData = {
      userId: req.user.id,
      userName: req.user.name || req.user.email, // Fallback to email if name not available
      userRole: req.user.role,
      title,
      description,
      priority: priority || 'medium'
    };

    // Add image data if available
    if (imageData) {
      feedbackData.image = imageData;
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: feedback
    });
  } catch (err) {
    console.error('Feedback submission with image error:', err); // Add logging for debugging
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
    res.status(400).json({ error: err.message });
  }
});

// Get all feedback (admin/superuser route)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, priority, sortBy, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Build sort
    const sort = {};
    if (sortBy === 'newest') {
      sort.createdAt = -1;
    } else if (sortBy === 'oldest') {
      sort.createdAt = 1;
    } else if (sortBy === 'priority') {
      // Sort by priority (critical, high, medium, low)
      sort.priority = 1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const feedback = await Feedback.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    
    // Check if user is authorized to view this feedback
    if (req.user.role !== 'admin' && feedback.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update feedback status (admin/superuser only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, resolvedBy } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
        resolvedBy: resolvedBy || req.user.id
      },
      { new: true, runValidators: true }
    );
    
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    
    res.json({
      message: 'Feedback status updated successfully',
      feedback
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update feedback priority (admin/superuser only)
router.put('/:id/priority', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { priority } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true, runValidators: true }
    );
    
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    
    res.json({
      message: 'Feedback priority updated successfully',
      feedback
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete feedback (admin/superuser only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    
    res.json({
      message: 'Feedback deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);

    const priorityStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          priority: '$_id',
          count: 1
        }
      }
    ]);

    res.json({
      statusDistribution: stats,
      priorityDistribution: priorityStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
