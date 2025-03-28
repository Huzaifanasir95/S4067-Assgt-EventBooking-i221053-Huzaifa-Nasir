import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Login = ({ apiBaseUrl, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Use prop apiBaseUrl, fallback to environment variable or Ingress path
  const API_BASE_URL = apiBaseUrl || process.env.REACT_APP_API_BASE_URL || 'http://eventbooking.local/api/users';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      setMessage(response.data.message);
      const { userId, userEmail } = response.data;
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', userEmail);
      onLoginSuccess(response.data);
      navigate('/events');
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <FormTitle>Login</FormTitle>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit">Login</Button>
      {message && <Message>{message}</Message>}
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #4a6076;
  border-radius: 5px;
  background-color: #2c3e50;
  color: #ffffff;
  outline: none;

  &:focus {
    border-color: #3498db;
  }

  &::placeholder {
    color: #bdc3c7;
  }
`;

const Button = styled.button`
  background-color: #2ecc71;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 25px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #27ae60;
  }
`;

const Message = styled.p`
  color: #e74c3c;
  font-size: 1rem;
  text-align: center;
`;

export default Login;