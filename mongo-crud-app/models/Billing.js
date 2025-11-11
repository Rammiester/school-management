const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillingTemplate',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  paymentDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  description: String,
  amount: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  items: [{
    name: String,
    amount: Number,
    description: String
  }],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
