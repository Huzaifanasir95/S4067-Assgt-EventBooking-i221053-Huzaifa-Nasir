const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  tickets: { type: Number, required: true },
  status: { type: String, default: 'CONFIRMED' },
  paymentStatus: { type: String, default: 'PAID' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);