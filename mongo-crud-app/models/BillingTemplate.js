const mongoose = require('mongoose');

const billingTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  props: [String],
  tags: [String],
  feeTypeDescriptions: {
    TotalPay: String,
    AcademicPay: String,
    SportPay: String,
    LibraryPay: String,
    HostalPay: String,
    TransportPay: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('BillingTemplate', billingTemplateSchema);
