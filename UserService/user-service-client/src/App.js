import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import EventsPage from './EventsPage';
import BookingPage from './BookingPage';
import FormContainer from './components/FormContainer';

// Use an environment variable for the API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const App = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  // Function to update events after login
  const handleLoginSuccess = (loginData) => {
    if (loginData.events) {
      setEvents(loginData.events);
      setError(null);
    } else {
      setError('No events returned during login');
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<FormContainer onLoginSuccess={handleLoginSuccess} error={error} />}
        />
        <Route path="/events" element={<EventsPage events={events} setEvents={setEvents} />} />
        <Route path="/book/:eventId" element={<BookingPage />} />
      </Routes>
    </Router>
  );
};

export default App;