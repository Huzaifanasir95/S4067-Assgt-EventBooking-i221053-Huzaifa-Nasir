const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Event = require('./models/Event');

const app = express();

// Configure CORS for Kubernetes port-forwarding (allow localhost for testing)
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5000', 'http://localhost:5001', 'http://eventbooking.local'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// MongoDB connection using environment variable from Kubernetes Secret
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
  socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    console.error('MONGODB_URI:', process.env.MONGODB_URI); // Log the URI for debugging (be careful in production)
  });

// GET all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// GET event by ID
app.get('/api/events/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// GET event availability
app.get('/api/events/:eventId/availability', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ availableTickets: event.availableTickets });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Error checking availability', error: error.message });
  }
});

// PATCH to update event availability
app.patch('/api/events/:eventId/availability', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { availableTickets } = req.body;
    if (typeof availableTickets !== 'number' || availableTickets < 0) {
      return res.status(400).json({ message: 'Available tickets must be a non-negative number' });
    }

    event.availableTickets = availableTickets;
    await event.save();

    res.status(200).json({ message: 'Event availability updated', availableTickets: event.availableTickets });
  } catch (error) {
    console.error('Error updating event availability:', error);
    res.status(500).json({ message: 'Error updating event availability', error: error.message });
  }
});

// POST to create a new event
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, availableTickets, location, createdBy } = req.body;

    if (!title || !date || !availableTickets || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields (title, date, availableTickets, createdBy)' });
    }

    if (typeof availableTickets !== 'number' || availableTickets < 0) {
      return res.status(400).json({ message: 'Available tickets must be a non-negative number' });
    }

    const newEvent = new Event({
      title,
      description,
      date: new Date(date),
      availableTickets: parseInt(availableTickets, 10),
      location,
      createdBy,
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', eventId: newEvent._id });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`EventService is running on port ${PORT}`);
});