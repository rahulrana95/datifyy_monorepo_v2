/**
 * Base API Client
 * Reusable HTTP client for all API services
 */

import type {
  ApiClientConfig,
  ApiError,
  ApiRequestConfig,
  ApiResponse,
  HttpMethod,
} from './types';

/**
 * Default timeout for API requests (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Base API Client class
 * Handles all HTTP communication with the backend
 */
export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: DEFAULT_TIMEOUT,
      ...config,
    };
  }

  /**
   * Build full URL with query parameters
   */
  private buildURL(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(path, this.config.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Build request headers
   */
  private async buildHeaders(config?: ApiRequestConfig): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...config?.headers,
    };

    // Add authentication token if available and not skipped
    if (!config?.skipAuth && this.config.getAuthToken) {
      const token = await this.config.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Create AbortController for request timeout
   */
  private createAbortController(timeout: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: { message?: string; code?: string; details?: unknown } = {};

    try {
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, use default error message
      errorData = { message: response.statusText };
    }

    const error: ApiError = {
      message: errorData.message || 'An unexpected error occurred',
      status: response.status,
      code: errorData.code,
      details: errorData.details,
    };

    // Call error interceptor if provided
    if (this.config.onError) {
      await this.config.onError(error);
    }

    throw error;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    // Apply request interceptor
    let requestConfig = config || {};
    if (this.config.onRequest) {
      requestConfig = await this.config.onRequest(requestConfig);
    }

    const url = this.buildURL(path, requestConfig.params);
    const headers = await this.buildHeaders(requestConfig);
    const timeout = requestConfig.timeout || this.config.timeout || DEFAULT_TIMEOUT;
    const controller = this.createAbortController(timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: requestConfig.body ? JSON.stringify(requestConfig.body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();

      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        headers: response.headers,
      };

      // Apply response interceptor
      if (this.config.onResponse) {
        return await this.config.onResponse(apiResponse);
      }

      return apiResponse;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError: ApiError = {
            message: 'Request timeout',
            status: 408,
            code: 'TIMEOUT',
          };
          if (this.config.onError) {
            await this.config.onError(timeoutError);
          }
          throw timeoutError;
        }
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, config);
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, { ...config, body });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, { ...config, body });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, { ...config, body });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, config);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<ApiClientConfig> {
    return { ...this.config };
  }
}
