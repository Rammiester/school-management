
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  amount: Number,
  date: Date,
  description: String,
  revenueId: mongoose.Schema.Types.ObjectId
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true }, // e.g. pat202501
  admissionYear: { type: Number, required: true },
  cityCode: { type: String, required: true }, // e.g. "pat"
  gender: String,
  dob: Date,
  age: Number,
  admissionId: String,
  bloodGroup: String,
  email: String,
  contact: String,
  fatherName: String,
  parentContact: String,
  grade: String,
  section: String,
  rollNumber: Number, // New field for roll number
  address: String,
  remarks: String,
  department: {
    type: String,
    enum: ['hostel', 'food', 'academics', 'transport', 'administration', 'other'],
  },
  performanceScore: Number,
  attendance: String,
  overallPercentage: Number,
  classPosition: { type: mongoose.Schema.Types.Mixed, default: 'N/A' },
  sectionPosition: { type: mongoose.Schema.Types.Mixed, default: 'N/A' },
  schoolPerformanceRange: String,
  marks: Object,
  testReports: Array,
  complaints: Array,
  awards: Array,
  examResults: Array,
  payments: [PaymentSchema], // all fee/payments
});

module.exports = mongoose.model('Student', studentSchema);
