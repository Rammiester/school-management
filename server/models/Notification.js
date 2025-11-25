// models/Notification.js
const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  toRole: String,
  type: String,
  message: String,
  refId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
module.exports = mongoose.model('Notification', NotificationSchema);
