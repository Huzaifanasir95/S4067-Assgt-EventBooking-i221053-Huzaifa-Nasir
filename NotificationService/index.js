const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const amqp = require('amqplib');

const app = express();

// Configure CORS for Kubernetes port-forwarding (allow localhost for testing)
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5000', 'http://localhost:5001', 'http://localhost:5002', 'http://localhost:5003', 'http://eventbooking.local'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// MongoDB connection using environment variable from Kubernetes Secret
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Import Notification model
const Notification = require('./models/notification');

// RabbitMQ connection and consumer
let channel;
async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5673'; // Fallback for port-forwarding
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    const queue = 'booking_notifications';
    await channel.assertQueue(queue, { durable: true });
    console.log('Waiting for messages in %s', queue);

    channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const { bookingId, userEmail, status, notificationType = 'EMAIL' } = JSON.parse(msg.content.toString());
          console.log('Received message:', { bookingId, userEmail, status, notificationType });

          let notificationMessage = '';
          let notificationStatus = 'FAILED';

          // Simulate sending notification
          try {
            if (notificationType === 'EMAIL') {
              const emailSubject = `Booking Confirmation for Booking ID ${bookingId}`;
              const emailBody = `
Dear Customer,

We are pleased to confirm your booking!

Booking Details:
- Booking ID: ${bookingId}
- Status: ${status}
- Email: ${userEmail}

Thank you for choosing our service!

Best regards,
Event Booking Team
              `;
              console.log(`[Dummy Email Sent] To: ${userEmail}`);
              console.log(`Subject: ${emailSubject}`);
              console.log(`Body: ${emailBody}`);
              notificationMessage = `Booking ${status} confirmation email sent to ${userEmail} for booking ${bookingId}`;
            } else if (notificationType === 'SMS') {
              const smsMessage = `Booking ${status}! Booking ID: ${bookingId}. Check your email (${userEmail}) for details.`;
              console.log(`[Dummy SMS Sent] To: ${userEmail}`);
              console.log(`Message: ${smsMessage}`);
              notificationMessage = `Booking ${status} confirmation SMS sent to ${userEmail} for booking ${bookingId}`;
            } else {
              throw new Error(`Unsupported notification type: ${notificationType}`);
            }
            notificationStatus = 'SENT';
          } catch (sendError) {
            notificationMessage = `Failed to send ${notificationType} for booking ${bookingId}: ${sendError.message}`;
            console.error(notificationMessage);
            notificationStatus = 'FAILED';
          }

          // Save notification to MongoDB
          const notification = new Notification({
            bookingId,
            userEmail,
            status: notificationStatus,
            message: notificationMessage,
            notificationType,
          });
          await notification.save();
          console.log(`Notification saved for booking ${bookingId}`);

          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error.message);
          channel.nack(msg, false, true);
        }
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
}

connectRabbitMQ();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Get notifications for a specific booking
app.get('/notifications/booking/:bookingId', async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const notifications = await Notification.find({ bookingId });
    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found for this booking' });
    }
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`NotificationService is running on port ${PORT}`);
});