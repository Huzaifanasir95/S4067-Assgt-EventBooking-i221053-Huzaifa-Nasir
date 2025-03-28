// NotificationService/models/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  userEmail: { type: String, required: true },
  status: { type: String, required: true, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
  notificationType: { type: String, enum: ['EMAIL', 'SMS'], required: true }, // Added for flexibility
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;