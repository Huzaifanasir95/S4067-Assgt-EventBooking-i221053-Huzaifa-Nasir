const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Reference to User
  eventId: { type: String, required: true }, // Reference to Event
  tickets: { type: Number, required: true },
  status: { type: String, default: 'PENDING' }, // PENDING, CONFIRMED, CANCELLED
  paymentStatus: { type: String, default: 'UNPAID' }, // UNPAID, PAID
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;