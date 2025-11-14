import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  const heading = screen.getByText(/Datifyy/i);
  expect(heading).toBeInTheDocument();
});
