/**
 * API Service
 * Centralized API communication layer following SOLID principles
 */

import { ApiResponse, ApiError } from '../types';

class ApiService {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw this.mapToApiError(error);
      }
      throw error;
    }
  }

  /**
   * Handle non-OK responses
   */
  private async handleErrorResponse(response: Response): Promise<ApiError> {
    let message = `HTTP Error ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      // If response body is not JSON, use default message
    }

    return {
      message,
      statusCode: response.status,
      code: response.status.toString(),
    };
  }

  /**
   * Map generic errors to ApiError type
   */
  private mapToApiError(error: Error): ApiError {
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'NETWORK_ERROR',
    };
  }

  /**
   * Get API health status
   */
  async getHealth(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.text();
  }

  /**
   * Get API status with all service information
   */
  async getApiStatus(): Promise<ApiResponse> {
    return this.fetchWithErrorHandling<ApiResponse>('/');
  }

  /**
   * Test database connection
   */
  async testDatabase(): Promise<{ database: string; time: string }> {
    return this.fetchWithErrorHandling('/api/test-db');
  }

  /**
   * Test Redis connection
   */
  async testRedis(): Promise<{ redis: string; key: string; value: string; ttl: string }> {
    return this.fetchWithErrorHandling('/api/test-redis');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing purposes
export { ApiService };