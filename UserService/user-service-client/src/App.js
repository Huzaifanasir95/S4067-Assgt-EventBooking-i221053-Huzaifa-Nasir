import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import EventsPage from './EventsPage';
import BookingPage from './BookingPage';
import FormContainer from './components/FormContainer';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://eventbooking.local/api/users';

const App = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const handleLoginSuccess = (loginData) => {
    if (loginData && loginData.events) {
      setEvents(loginData.events);
      setError(null);
    } else {
      setEvents([]); // Ensure events is always an array
      setError('No events returned during login');
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<FormContainer apiBaseUrl={API_BASE_URL} onLoginSuccess={handleLoginSuccess} error={error} />}
        />
        <Route path="/events" element={<EventsPage events={events} setEvents={setEvents} />} />
        <Route path="/book/:eventId" element={<BookingPage />} />
      </Routes>
    </Router>
  );
};

export default App;