import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', availableTickets: '', location: '' });
  const [message, setMessage] = useState('');
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [userNames, setUserNames] = useState({}); // Cache user names
  const [eventTitles, setEventTitles] = useState({}); // Cache event titles
  const location = useLocation();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 'user123';

  useEffect(() => {
    const { state } = location;
    console.log('Location state:', state);
    const fetchEventsAndUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/events');
        console.log('Fetched events:', response.data);
        setEvents(response.data);
        // Pre-fetch event titles
        const titles = {};
        response.data.forEach(event => titles[event._id] = event.title);
        setEventTitles(titles);
        // Pre-fetch user names for createdBy
        const userIds = [...new Set(response.data.map(event => event.createdBy))];
        const names = { ...userNames };
        for (const uid of userIds) {
          if (!names[uid]) {
            try {
              const userResponse = await axios.get(`http://localhost:5000/users/${uid}`);
              names[uid] = userResponse.data.name;
            } catch (userError) {
              console.error(`Error fetching user ${uid}:`, userError);
              names[uid] = 'Unknown'; // Fallback for failed fetches
            }
          }
        }
        setUserNames(names);
      } catch (error) {
        console.error('Error fetching events:', error);
        setMessage(`Error fetching events: ${error.message}`);
      }
    };
    fetchEventsAndUsers();
  }, [location]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/events', {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        availableTickets: parseInt(newEvent.availableTickets, 10),
        location: newEvent.location,
        createdBy: userId,
      });
      setMessage(response.data.message);
      setEvents([...events, { _id: response.data.eventId, ...newEvent, date: new Date(newEvent.date), availableTickets: parseInt(newEvent.availableTickets, 10), createdBy: userId }]);
      setNewEvent({ title: '', description: '', date: '', availableTickets: '', location: '' });
      setShowAddEvent(false);
      setEventTitles({ ...eventTitles, [response.data.eventId]: newEvent.title });
      // Update userNames if needed
      if (!userNames[userId]) {
        const userResponse = await axios.get(`http://localhost:5000/users/${userId}`);
        setUserNames({ ...userNames, [userId]: userResponse.data.name });
      }
    } catch (error) {
      console.error('Error adding event:', error.response?.data || error.message);
      setMessage(`Error adding event: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`http://localhost:5002/bookings/user/${userId}`);
      setBookings(response.data);
      setShowBookings(true);
      // Pre-fetch user names and event titles for bookings
      const userIds = [...new Set([userId, ...response.data.map(booking => booking.userId)])]; // Include logged-in userId
      const eventIds = [...new Set(response.data.map(booking => booking.eventId))];
      const names = { ...userNames };
      const titles = { ...eventTitles };
      for (const uid of userIds) {
        if (!names[uid]) {
          try {
            const userResponse = await axios.get(`http://localhost:5000/users/${uid}`);
            names[uid] = userResponse.data.name || 'Unknown';
          } catch (userError) {
            console.error(`Error fetching user ${uid}:`, userError);
            names[uid] = 'Unknown';
          }
        }
      }
      for (const eid of eventIds) {
        if (!titles[eid]) {
          try {
            const eventResponse = await axios.get(`http://localhost:5001/events/${eid}`);
            titles[eid] = eventResponse.data.title || 'Unknown Event';
          } catch (eventError) {
            console.error(`Error fetching event ${eid}:`, eventError);
            titles[eid] = 'Unknown Event';
          }
        }
      }
      setUserNames(names);
      setEventTitles(titles);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMessage(`Error fetching bookings: ${error.message}`);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Event Booking Platform</h1>
        <button onClick={() => setShowAddEvent(true)} style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', marginRight: '10px' }}>Add Event</button>
        <button onClick={fetchBookings} style={{ padding: '10px', backgroundColor: '#3498db', color: 'white' }}>Show My Bookings</button>
      </header>
      <main className="events-container">
        <h2>Event Listings</h2>
        {showAddEvent && (
          <form onSubmit={handleAddEvent} style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa' }}>
            <input
              type="text"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Available Tickets"
              value={newEvent.availableTickets}
              onChange={(e) => setNewEvent({ ...newEvent, availableTickets: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white' }}>Add Event</button>
            <button type="button" onClick={() => setShowAddEvent(false)} style={{ padding: '10px', marginLeft: '10px' }}>Cancel</button>
          </form>
        )}
        {message && <p>{message}</p>}
        {showBookings && (
          <div className="bookings-section" style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa' }}>
            <h3>My Bookings</h3>
            {bookings.length > 0 ? (
              <ul>
                {bookings.map((booking) => (
                  <li key={booking._id}>
                    Booking ID: {booking._id}, Event: {eventTitles[booking.eventId] || 'Loading...'}, Tickets: {booking.tickets}, 
                    Status: {booking.status}, Payment Status: {booking.paymentStatus}, 
                    Created by: {userNames[booking.userId] || 'Loading...'}, Created: {new Date(booking.createdAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bookings found.</p>
            )}
            <button onClick={() => setShowBookings(false)} style={{ padding: '10px', marginTop: '10px' }}>Close</button>
          </div>
        )}
        {events.length > 0 ? (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <h3>{event.title} (Created by: {userNames[event.createdBy] || 'Loading...'})</h3>
                <p className="event-date">Date: {new Date(event.date).toLocaleDateString()}</p>
                <p className="event-tickets">Available Tickets: {event.availableTickets}</p>
                <button className="book-button" onClick={() => navigate(`/book/${event._id}`)}>Book Now</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-events">No events available.</p>
        )}
      </main>
    </div>
  );
};

export default EventsPage;