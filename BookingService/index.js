const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const amqp = require('amqplib');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Import Booking model
const Booking = require('./models/booking');

let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    const queue = 'booking_notifications';
    await channel.assertQueue(queue, { durable: true });
    console.log('Connected to RabbitMQ, queue created:', queue);
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}
connectRabbitMQ();

// Create Booking
app.post('/bookings', async (req, res) => {
  const { userId, eventId, tickets, cardInfo } = req.body;

  try {
    // Check event availability
    let availableTickets;
    try {
      const availabilityResponse = await axios.get(`http://localhost:5001/events/${eventId}/availability`);
      availableTickets = availabilityResponse.data.availableTickets;
    } catch (availabilityError) {
      if (availabilityError.response && availabilityError.response.status === 404) {
        return res.status(400).json({ message: 'Event not found. Please add the event first.' });
      }
      throw availabilityError; // Re-throw other errors
    }

    if (availableTickets < tickets) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    // Mock payment processing
    const isPaymentValid = mockPaymentValidation(cardInfo);
    if (!isPaymentValid) {
      return res.status(400).json({ message: 'Invalid payment details. Please provide a card number with at least 10 digits.' });
    }

    // Create booking
    const booking = new Booking({ userId, eventId, tickets, status: 'CONFIRMED', paymentStatus: 'PAID' });
    await booking.save();

    // Update event availability
    try {
      await axios.patch(`http://localhost:5001/events/${eventId}/availability`, {
        availableTickets: availableTickets - tickets,
      });
    } catch (updateError) {
      console.warn('Failed to update event availability:', updateError.message);
      // Continue with booking even if update fails (non-critical)
    }

    // Publish notification to RabbitMQ
    if (channel) {
      const queue = 'booking_notifications';
      const message = JSON.stringify({
        bookingId: booking._id,
        userEmail: 'user@example.com', // Replace with real user email
        status: 'CONFIRMED',
        notificationType: 'EMAIL',
      });
      channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      console.log('Sent notification to RabbitMQ for booking:', booking._id);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: booking._id,
      details: { eventId, tickets, status: 'CONFIRMED', paymentStatus: 'PAID' },
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: `Error creating booking: ${error.message}` });
  }
});

// Get Booking by ID
app.get('/bookings/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error });
  }
});

// Get All Bookings by User ID
app.get('/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });
    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
});

// Mock payment validation function
const mockPaymentValidation = (cardInfo) => {
  return cardInfo && cardInfo.cardNumber && cardInfo.cardNumber.length >= 10;
};

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`BookingService is running on port ${PORT}`);
});