import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// Use an environment variable for the API base URL
const EVENT_SERVICE_URL = process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:5001';
const BOOKING_SERVICE_URL = process.env.REACT_APP_BOOKING_SERVICE_URL || 'http://localhost:5002';

const BookingPage = () => {
  const [tickets, setTickets] = useState(1);
  const [message, setMessage] = useState('');
  const [cardInfo, setCardInfo] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [eventTitle, setEventTitle] = useState('');
  const navigate = useNavigate();
  const { eventId } = useParams();
  const userId = localStorage.getItem('userId');  // Fetch userId from localStorage
  const userEmail = localStorage.getItem('userEmail');  // Fetch userEmail from localStorage

  useEffect(() => {
    const fetchEventTitle = async () => {
      try {
        const response = await axios.get(`${EVENT_SERVICE_URL}/events/${eventId}`);
        setEventTitle(response.data.title || 'Unknown Event');
      } catch (error) {
        console.error('Error fetching event title:', error);
        setEventTitle('Unknown Event');
      }
    };
    fetchEventTitle();
  }, [eventId]);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, { userId, eventId, tickets, cardInfo, userEmail });
      setMessage(response.data.message);
      if (response.data.details) {
        setMessage(`Booking successful! Event: ${eventTitle}, Tickets: ${response.data.details.tickets}, Status: ${response.data.details.status}`);
      }
      setTimeout(() => navigate('/events'), 3000);
    } catch (error) {
      console.error('Error creating booking:', error.response?.data || error.message);
      setMessage(`Error creating booking: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <FormContainer>
      <h1>Book Event</h1>
      <div className="booking-info">
        <p>Booking for Event ID: {eventId}</p>
        <p>{eventTitle}</p>
      </div>
      <Form onSubmit={handleBook}>
        <Label>
          Tickets:
          <Input
            type="number"
            min="1"
            value={tickets}
            onChange={(e) => setTickets(Math.max(1, e.target.value))}
            required
          />
        </Label>
        <Label>
          Card Number:
          <Input
            type="text"
            value={cardInfo.cardNumber}
            onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
            placeholder="Enter card number (min 10 digits)"
            required
          />
        </Label>
        <Label>
          Expiry Date:
          <Input
            type="text"
            value={cardInfo.expiry}
            onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
            placeholder="MM/YY"
            required
          />
        </Label>
        <Label>
          CVV:
          <Input
            type="text"
            value={cardInfo.cvv}
            onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
            placeholder="CVV"
            required
          />
        </Label>
        <Button type="submit">Confirm Booking</Button>
      </Form>
      {message && <Message>{message}</Message>}
    </FormContainer>
  );
};

// Styled components
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f4f4f9;
  padding: 20px;
`;

const Form = styled.form`
  background: #fff;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  &:focus {
    border-color: #4CAF50;
  }
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #45a049;
  }
`;

const Message = styled.p`
  color: #d9534f;
  font-size: 1rem;
  text-align: center;
`;

export default BookingPage;