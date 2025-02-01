import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form', () => {
  render(<App />);
  const loginTab = screen.getByText(/Sign In/i);
  expect(loginTab).toBeInTheDocument();
});



