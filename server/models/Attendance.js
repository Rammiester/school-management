const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // Made optional for student attendance
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: false // Made optional for user attendance
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    default: 'checked-in'
  },
  biometricId: {
    type: String
  },
  biometricVerified: {
    type: Boolean,
    default: false
  },
  biometricType: {
    type: String,
    enum: ['fingerprint', 'face']
  },
  deviceInfo: {
    type: String
  }
}, { timestamps: true });

// Add an index to ensure we can efficiently query by either userId or studentId
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
