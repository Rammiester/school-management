// models/Feedback.js

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    userName: { 
        type: String, 
        required: true 
    },
    userRole: { 
        type: String, 
        required: true,
        enum: ['student', 'teacher', 'staff', 'admin', 'user', 'chairman']
    },
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true 
    },
    image: {
        url: { type: String },
        filename: { type: String }
    },
    status: { 
        type: String, 
        default: 'pending',
        enum: ['pending', 'reviewed', 'resolved', 'rejected']
    },
    priority: { 
        type: String, 
        default: 'medium',
        enum: ['low', 'medium', 'high', 'critical']
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    resolvedAt: { 
        type: Date 
    },
    resolvedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
});

// Add indexes for better query performance
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
