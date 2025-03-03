import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import FormContainer from './components/FormContainer';
import EventsPage from './EventsPage';
import BookingPage from './BookingPage';
import './App.css';
import './EventsPage.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormContainer />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/book/:eventId" element={<BookingPage />} />
      </Routes>
    </Router>
  );
};

export default App;