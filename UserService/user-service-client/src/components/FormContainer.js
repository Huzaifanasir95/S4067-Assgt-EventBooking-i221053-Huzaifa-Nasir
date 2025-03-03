// D:\SEM6\DevOPS\Ass_1\S4067-Assgt-EventBooking-i221053-Huzaifa-Nasir\UserService\user-service-client\src/components/FormContainer.js

import React, { useState, useRef } from 'react';
import Register from './Register';
import Login from './Login';
import styled from 'styled-components';

const FormContainer = () => {
  const [showRegister, setShowRegister] = useState(true);
  const formRef = useRef();

  const toggleForm = () => {
    setShowRegister((prev) => !prev);
  };

  return (
    <Container>
      <Title>Welcome to User Service</Title>
      <Button onClick={toggleForm}>{showRegister ? 'Go to Login' : 'Go to Register'}</Button>

      <FormWrapper ref={formRef}>
        {showRegister ? (
          <Form>
            <Register />
          </Form>
        ) : (
          <Form>
            <Login />
          </Form>
        )}
      </FormWrapper>
    </Container>
  );
};

// Remove FormTransition component and use conditional rendering instead
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f0f0f0;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 20px;
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
  margin-bottom: 20px;
`;

const FormWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 400px;
  transition: all 0.5s ease;
`;

const Form = styled.div`
  width: 100%;
  transition: opacity 0.5s ease;
`;

export default FormContainer;