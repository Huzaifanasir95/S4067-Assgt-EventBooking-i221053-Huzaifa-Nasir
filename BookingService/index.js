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

// Use an environment variable for the EventService URL
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://event-service:5001';

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Booking model
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
    // Retry connection after a delay
    setTimeout(connectRabbitMQ, 5000);
  }
}
connectRabbitMQ();

// Create Booking
app.post('/bookings', async (req, res) => {
  const { userId, eventId, tickets, cardInfo, userEmail } = req.body;

  // Validate required fields
  if (!userId || !eventId || !tickets || !cardInfo || !userEmail) {
    return res.status(400).json({ message: 'Missing required fields: userId, eventId, tickets, cardInfo, and userEmail are required' });
  }

  // Validate email format (basic check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check event availability
    let availableTickets;
    try {
      const availabilityResponse = await axios.get(`${EVENT_SERVICE_URL}/events/${eventId}/availability`, {
        timeout: 5000,
      });
      availableTickets = availabilityResponse.data.availableTickets;
    } catch (availabilityError) {
      if (availabilityError.response) {
        if (availabilityError.response.status === 404) {
          return res.status(400).json({ message: 'Event not found. Please add the event first.' });
        }
        return res.status(500).json({ message: `Error checking event availability: ${availabilityError.response.data.message}` });
      }
      console.error('Availability check error:', availabilityError.message);
      return res.status(503).json({ message: 'EventService unavailable. Please try again later.' });
    }

    if (availableTickets < tickets || availableTickets - tickets < 0) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    // Create booking
    const booking = new Booking({ userId, eventId, tickets, status: 'CONFIRMED', paymentStatus: 'PAID' });
    await booking.save();

    // Update event availability
    const newTickets = availableTickets - tickets;
    try {
      const updateResponse = await axios.patch(`${EVENT_SERVICE_URL}/events/${eventId}/availability`, {
        availableTickets: newTickets,
      }, {
        timeout: 5000,
      });
      console.log('Event availability updated:', updateResponse.data);
    } catch (updateError) {
      console.warn('Failed to update event availability:', updateError.message);
      // Log the failure but don't fail the booking, as the booking is already saved
    }

    // Publish notification to RabbitMQ
    if (channel) {
      const queue = 'booking_notifications';
      const message = JSON.stringify({
        bookingId: booking._id.toString(), // Ensure bookingId is a string
        userEmail,
        status: 'CONFIRMED',
        notificationType: 'EMAIL',
      });
      try {
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
        console.log('Sent notification to RabbitMQ for booking:', booking._id);
      } catch (rabbitError) {
        console.error('Failed to send notification to RabbitMQ:', rabbitError.message);
      }
    } else {
      console.warn('RabbitMQ channel not available, notification not sent for booking:', booking._id);
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

// Get bookings for a specific user
app.get('/bookings/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookings = await Booking.find({ userId });
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
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