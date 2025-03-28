import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Use MemoryRouter for testing routes
import App from './App';

test('renders FormContainer with welcome message on root path', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  // Check for the "Welcome to User Service" heading rendered by FormContainer
  const headingElement = screen.getByText(/Welcome to User Service/i);
  expect(headingElement).toBeInTheDocument();
});