/**
 * App Component Tests
 * Using TypeScript with React Testing Library
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { apiService } from './services/api.service';
import { ApiResponse } from './types';

// Mock the API service
jest.mock('./services/api.service', () => ({
  apiService: {
    getApiStatus: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('App Component', () => {
  const mockApiResponse: ApiResponse = {
    service: 'Test Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: {
      database: true,
      redis: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app header', () => {
    mockApiService.getApiStatus.mockResolvedValueOnce(mockApiResponse);
    
    render(<App />);
    
    const heading = screen.getByText(/Datifyy Frontend/i);
    expect(heading).toBeInTheDocument();
    
    const subtitle = screen.getByText(/Built with TypeScript \+ React/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('displays loading state initially', async () => {
    mockApiService.getApiStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockApiResponse), 100))
    );
    
    render(<App />);
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  it('displays API response when fetch succeeds', async () => {
    mockApiService.getApiStatus.mockResolvedValueOnce(mockApiResponse);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(mockApiResponse.service)).toBeInTheDocument();
      expect(screen.getByText(mockApiResponse.version)).toBeInTheDocument();
    });
  });

  it('displays service status indicators', async () => {
    mockApiService.getApiStatus.mockResolvedValueOnce(mockApiResponse);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Database:/)).toBeInTheDocument();
      expect(screen.getByText(/Redis:/)).toBeInTheDocument();
      expect(screen.getAllByText(/Connected/i)).toHaveLength(2);
    });
  });

  it('handles fetch errors gracefully', async () => {
    const errorMessage = 'Network error';
    mockApiService.getApiStatus.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('allows retry on error', async () => {
    const errorMessage = 'Network error';
    mockApiService.getApiStatus
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce(mockApiResponse);
    
    render(<App />);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
    
    // Click retry button
    const retryButton = screen.getByText(/Try Again/i);
    fireEvent.click(retryButton);
    
    // Wait for successful response
    await waitFor(() => {
      expect(screen.getByText(mockApiResponse.service)).toBeInTheDocument();
    });
  });

  it('allows manual refresh of data', async () => {
    mockApiService.getApiStatus.mockResolvedValue(mockApiResponse);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(mockApiResponse.service)).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByText(/Refresh/i);
    expect(refreshButton).toBeInTheDocument();
    
    fireEvent.click(refreshButton);
    
    expect(mockApiService.getApiStatus).toHaveBeenCalledTimes(2);
  });

  it('disables refresh button while loading', async () => {
    mockApiService.getApiStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockApiResponse), 100))
    );
    
    render(<App />);
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
    });
  });
});