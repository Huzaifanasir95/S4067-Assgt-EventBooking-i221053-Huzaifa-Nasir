const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const User = require('./models/User');

const app = express();

// Configure CORS for Kubernetes and Ingress access
app.use(cors({
  origin: ['http://localhost:8080', 'http://eventbooking.local'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// MongoDB connection using environment variable from Kubernetes Secret
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    console.error('MONGODB_URI:', process.env.MONGODB_URI); // Log the URI for debugging (be careful in production)
  });

// Register Route
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login Route
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Fetch events from EventService using Kubernetes Service URL
    let events = [];
    try {
      const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:5001';
      const eventsResponse = await axios.get(`${eventServiceUrl}/api/events`, { timeout: 5000 });
      events = eventsResponse.data;
      console.log('Fetched events:', events);
    } catch (error) {
      console.error('Error fetching events:', error.message);
      // Continue with login even if event fetching fails
    }

    res.status(200).json({
      message: 'Login successful',
      events: events,
      userId: user._id,
      userEmail: user.email,
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get User by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ name: user.name });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Fetch Events Route
app.get('/api/users/events', async (req, res) => {
  try {
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:5001';
    const response = await axios.get(`${eventServiceUrl}/api/events`, { timeout: 5000 });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ error: 'Failed to fetch events', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`UserService is running on port ${PORT}`);
});