import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EventsPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://eventbooking.local/api/users';
const EVENT_SERVICE_URL = process.env.REACT_APP_EVENT_SERVICE_URL || 'http://eventbooking.local/api/events';
const BOOKING_SERVICE_URL = process.env.REACT_APP_BOOKING_SERVICE_URL || 'http://eventbooking.local/api/bookings';

const EventsPage = ({ events, setEvents }) => {
  const [message, setMessage] = useState('');
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [eventTitles, setEventTitles] = useState({});
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    availableTickets: '',
    location: '',
    createdBy: localStorage.getItem('userId') || 'Unknown',
  });
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${BOOKING_SERVICE_URL}/user/${userId}`);
      setBookings(response.data);
      setShowBookings(true);

      const userIds = [...new Set([userId, ...response.data.map(booking => booking.userId)])];
      const eventIds = [...new Set(response.data.map(booking => booking.eventId))];
      const names = { ...userNames };
      const titles = { ...eventTitles };
      for (const uid of userIds) {
        if (!names[uid]) {
          const userResponse = await axios.get(`${API_BASE_URL}/${uid}`);
          names[uid] = userResponse.data.name || 'Unknown';
        }
      }
      for (const eid of eventIds) {
        if (!titles[eid]) {
          const eventResponse = await axios.get(`${EVENT_SERVICE_URL}/${eid}`);
          titles[eid] = eventResponse.data.title || 'Unknown Event';
        }
      }
      setUserNames(names);
      setEventTitles(titles);
    } catch (error) {
      setMessage('Error fetching bookings');
    }
  };

  const handleBackToEvents = () => {
    setShowBookings(false);
    setShowAddEventForm(false);
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${EVENT_SERVICE_URL}`, {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        availableTickets: parseInt(newEvent.availableTickets, 10),
        location: newEvent.location,
        createdBy: newEvent.createdBy,
      });
      setMessage(response.data.message);
      const updatedEvents = await axios.get(`${EVENT_SERVICE_URL}`);
      setEvents(updatedEvents.data);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        availableTickets: '',
        location: '',
        createdBy: userId || 'Unknown',
      });
      setShowAddEventForm(false);
    } catch (error) {
      setMessage(`Error creating event: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddEvent = () => {
    setShowAddEventForm(true);
    setShowBookings(false);
    setMessage('');
  };

  const handleBookNow = (eventId) => {
    if (!userId) {
      setMessage('Please log in to book an event.');
      navigate('/');
      return;
    }
    console.log(`Attempting to navigate to /book/${eventId}`);
    navigate(`/book/${eventId}`, { replace: false });
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">Event Booking Platform</h1>
        <div className="header-buttons">
          <button className="add-event-btn" onClick={handleAddEvent}>
            Add Event
          </button>
          <button className="show-bookings-btn" onClick={fetchBookings}>
            Show My Bookings
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="events-container">
        {message && <p className="message">{message}</p>}
        {showAddEventForm ? (
          <div className="add-event-section">
            <h2 className="section-title">Add New Event</h2>
            <form className="add-event-form" onSubmit={handleAddEventSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="availableTickets">Available Tickets:</label>
                <input
                  type="number"
                  id="availableTickets"
                  name="availableTickets"
                  value={newEvent.availableTickets}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-event-btn">
                  Create Event
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleBackToEvents}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : showBookings ? (
          <div className="bookings-section">
            <h2 className="section-title">My Bookings</h2>
            <ul className="bookings-list">
              {bookings.map((booking) => (
                <li key={booking._id} className="booking-item">
                  <span className="booking-event">
                    Event: {eventTitles[booking.eventId] || 'Loading...'}
                  </span>
                  <span className="booking-tickets">
                    Tickets: {booking.tickets}
                  </span>
                </li>
              ))}
            </ul>
            <button className="back-to-events-btn" onClick={handleBackToEvents}>
              Back to Events
            </button>
          </div>
        ) : (
          <div className="events-listing">
            <h2 className="section-title">Event Listings</h2>
            <div className="events-grid">
              {events.map((event) => (
                <div key={event._id} className="event-card">
                  <div className="event-card-content">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-created">
                      Created by: {event.createdBy || 'Unknown'}
                    </p>
                    <p className="event-date">
                      Date: {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="event-tickets">
                      Available Tickets: {event.availableTickets}
                    </p>
                    <p className="event-location">
                      Location: {event.location || 'TBD'}
                    </p>
                    <p className="event-description">
                      {event.description || 'No description available.'}
                    </p>
                    <button
                      className="book-now-btn"
                      onClick={() => handleBookNow(event._id)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EventsPage;