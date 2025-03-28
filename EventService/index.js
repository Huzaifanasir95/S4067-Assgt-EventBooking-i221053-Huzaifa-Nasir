const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const Event = require('./models/Event'); // Import the Event model

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// GET all events
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// GET event by ID
app.get('/events/:eventId', async (req, res) => {
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
app.get('/events/:eventId/availability', async (req, res) => {
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
app.patch('/events/:eventId/availability', async (req, res) => {
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
app.post('/events', async (req, res) => {
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