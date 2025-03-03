const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
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

// Define the User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Register Route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = new User({ name, email, password });
  await newUser.save();
  res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  if (user.password !== password) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Fetch events from EventService after successful login
  try {
    const eventsResponse = await axios.get('http://localhost:5001/events');
    const events = eventsResponse.data;

    res.status(200).json({
      message: 'Login successful',
      events: events,
      userId: user._id,
      userEmail: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events from EventService', error });
  }
});

// Get User by ID
app.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Start the server

app.listen(5000, () => {
  console.log('UserService is running on port 5000');

// app.listen(5000, () => {
//     console.log('UserService is running on port 5000');
// });


app.get('/', (req, res) => {
    res.send('Welcome to the Event Booking API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});