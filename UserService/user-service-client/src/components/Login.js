import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password }); // Debug log
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      setMessage(response.data.message);
      const { events, userId, userEmail } = response.data;
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', userEmail);
      navigate('/events', { state: { events } });
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => { console.log('Email changed:', e.target.value); setEmail(e.target.value); }}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => { console.log('Password changed:', e.target.value); setPassword(e.target.value); }}
        required
      />
      <Button type="submit">Login</Button>
      {message && <Message>{message}</Message>}
    </Form>
  );
};

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

export default Login;