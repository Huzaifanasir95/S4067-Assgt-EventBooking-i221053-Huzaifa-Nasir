import React, { useState, useRef } from 'react';
import Register from './Register';
import Login from './Login';
import styled from 'styled-components';

const FormContainer = ({ onLoginSuccess, error }) => {
  const [showRegister, setShowRegister] = useState(true);
  const formRef = useRef();

  const toggleForm = () => {
    setShowRegister((prev) => !prev);
  };

  return (
    <Container>
      <Title>Welcome to User Service</Title>
      <ToggleButton onClick={toggleForm}>
        {showRegister ? 'Go to Login' : 'Go to Register'}
      </ToggleButton>
      <FormWrapper ref={formRef}>
        {showRegister ? (
          <FormBox>
            <Register />
          </FormBox>
        ) : (
          <FormBox>
            <Login onLoginSuccess={onLoginSuccess} />
          </FormBox>
        )}
      </FormWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #2c3e50;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #ffffff;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  background-color: #3498db;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 25px;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background-color: #2980b9;
  }
`;

const FormWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 400px;
  transition: all 0.5s ease;
`;

const FormBox = styled.div`
  width: 100%;
  transition: opacity 0.5s ease;
`;

const ErrorMessage = styled.p`
  color: #e74c3c; /* Red for error messages */
  font-size: 1rem;
  text-align: center;
  margin-top: 20px;
`;

export default FormContainer;