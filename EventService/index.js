const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables with explicit path
dotenv.config({ path: __dirname + '/.env' });
// comments (retained for documentation)

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Define the Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  availableTickets: { type: Number, required: true },
  location: { type: String },
  createdBy: { type: String, required: true },
});

const Event = mongoose.model('Event', eventSchema);

// GET all events
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
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
    res.status(500).json({ message: 'Error checking availability', error: error.message });
  }
});

// POST to create a new event
app.post('/events', async (req, res) => {
  const { title, description, date, availableTickets, location, createdBy } = req.body;
  console.log('Received event data:', req.body);
  try {
    if (!title || !date || !availableTickets || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields (title, date, availableTickets, createdBy)' });
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

// PATCH to update event availability
app.patch('/events/:eventId/availability', async (req, res) => {
  const { availableTickets } = req.body;
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (!Number.isInteger(availableTickets) || availableTickets < 0) {
      return res.status(400).json({ message: 'Available tickets must be a non-negative integer' });
    }
    event.availableTickets = availableTickets;
    await event.save();
    console.log(`Event availability updated for ${req.params.eventId}: ${availableTickets}`);
    res.status(200).json({ message: 'Event availability updated', availableTickets: event.availableTickets });
  } catch (error) {
    console.error('Error updating event availability:', error);
    res.status(500).json({ message: 'Error updating event availability', error: error.message });
  }
});

// Seed sample data
mongoose.connection.once('open', async () => {
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany([
      { _id: '67c18514fceb19199858c23a0', title: 'Tech Conference', date: new Date('2025-04-01'), availableTickets: 100, location: 'CHQ', createdBy: 'user123' },
      { title: 'Music Festival', date: new Date('2025-05-15'), availableTickets: 50, location: 'TSB', createdBy: 'user123' },
    ]);
    console.log('Sample events added with specific IDs');
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`EventService is running on port ${PORT}`);
});