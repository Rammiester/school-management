const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  month: { type: String, required: true },
  earnings: { type: Number, required: true },
  expenses: { type: Number, required: true },
  description: String,
  createdBy: String,
  studentUniqueId: String, // when fee collected
  status: { type: String, default: "pending" }, // pending/approved/declined
  type: {
    type: String,
    enum: ["expense", "revenue"],
    required: true,
  },
  requestType: {
    type: String,
    enum: [
      "transport",
      "salary",
      "food",
      "admin office",
      "housekeeping",
      "stationary",
      "other",
      "school fee",
      "hostel fee",
      "uniform fee",
      "other fees",
      "donation",
      "grant",
    ],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  attachments: [
    {
      type: String, // File paths
    },
  ],
  time: {
    type: String,
    required: true,
  },
  modeOfPayment: {
    type: String,
    enum: ["cash", "card", "upi", "bank transfer", "cheque"],
    required: true,
  },
  feePeriod: {
    type: String, // Only for revenue type
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: {
    type: Date,
  },
  reviewNotes: {
    type: String,
  },
});

// Add indexes for better query performance
earningSchema.index({ requestType: 1, type: 1 });
earningSchema.index({ date: 1 });
earningSchema.index({ status: 1 });
earningSchema.index({ requestedBy: 1 });
earningSchema.index({ type: 1, requestType: 1, status: 1 });

module.exports = mongoose.model('Earning', earningSchema);
