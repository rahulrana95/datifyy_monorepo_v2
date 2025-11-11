import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders Datifyy Frontend heading', () => {
    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve('Test API Response')
    });

    render(<App />);
    const heading = screen.getByText(/Datifyy Frontend/i);
    expect(heading).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve('Test API Response')
    });

    render(<App />);
    const loading = screen.getByText(/Loading.../i);
    expect(loading).toBeInTheDocument();
  });

  test('displays API response when fetch succeeds', async () => {
    const mockResponse = 'Datifyy Backend API';
    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockResponse)
    });

    render(<App />);

    await waitFor(() => {
      const apiResponse = screen.getByText(`API Response: ${mockResponse}`);
      expect(apiResponse).toBeInTheDocument();
    });
  });

  test('handles fetch errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching from API:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('uses correct API URL from environment', () => {
    const originalEnv = process.env.REACT_APP_API_URL;
    process.env.REACT_APP_API_URL = 'http://test-api.com';

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve('Test')
    });

    render(<App />);

    expect(fetch).toHaveBeenCalledWith('http://test-api.com/');

    process.env.REACT_APP_API_URL = originalEnv;
  });

  test('falls back to localhost when API URL not set', () => {
    const originalEnv = process.env.REACT_APP_API_URL;
    delete process.env.REACT_APP_API_URL;

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve('Test')
    });

    render(<App />);

    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/');

    process.env.REACT_APP_API_URL = originalEnv;
  });
});