const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config({ path: __dirname + '/.env' });
// comments
const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.log('Error connecting to MongoDB:', err);
});

const Event = require('./models/event');

// API Endpoints
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

app.get('/events/:eventId/availability', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ availableTickets: event.availableTickets });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability', error });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`EventService is running on port ${PORT}`);
});

mongoose.connection.once('open', async () => {
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany([
      { title: 'Tech Conference 2025', description: 'A tech event', date: new Date('2025-04-01'), availableTickets: 100 },
      { title: 'Music Festival', description: 'Live music event', date: new Date('2025-05-15'), availableTickets: 50 },
    ]);
    console.log('Sample events added');
  }
});