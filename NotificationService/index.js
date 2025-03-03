// NotificationService/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
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

// Import Notification model
const Notification = require('./models/notification');

// RabbitMQ connection and consumer
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    const queue = 'booking_notifications';
    await channel.assertQueue(queue, { durable: true });
    console.log('Waiting for messages in %s', queue);

    channel.consume(queue, async (msg) => {
      if (msg) {
        const { bookingId, userEmail, status, notificationType = 'EMAIL' } = JSON.parse(msg.content.toString());
        console.log('Received message:', { bookingId, userEmail, status, notificationType });

        let notificationMessage = '';
        let notificationStatus = 'FAILED';

        // Simulate sending notification
        try {
          if (notificationType === 'EMAIL') {
            notificationMessage = `Booking ${status} confirmation email sent to ${userEmail} for booking ${bookingId}`;
            console.log(notificationMessage); // Placeholder for email service (e.g., Nodemailer)
          } else if (notificationType === 'SMS') {
            notificationMessage = `Booking ${status} confirmation SMS sent to ${userEmail} for booking ${bookingId}`;
            console.log(notificationMessage); // Placeholder for SMS service (e.g., Twilio)
          }
          notificationStatus = 'SENT';
        } catch (sendError) {
          notificationMessage = `Failed to send ${notificationType} for booking ${bookingId}: ${sendError.message}`;
          console.error(notificationMessage);
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
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

connectRabbitMQ();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start the server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`NotificationService is running on port ${PORT}`);
});