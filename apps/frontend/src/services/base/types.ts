/**
 * Base API Client Types
 * Shared types for all API services
 */

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Query parameters */
  params?: Record<string, string | number | boolean>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Skip authentication for this request */
  skipAuth?: boolean;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Headers;
}

/**
 * API error response
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** HTTP status code */
  status: number;
  /** Error code from backend */
  code?: string;
  /** Additional error details */
  details?: unknown;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Base URL for all API requests */
  baseURL: string;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Default headers for all requests */
  headers?: Record<string, string>;
  /** Function to get authentication token */
  getAuthToken?: () => string | null | Promise<string | null>;
  /** Request interceptor */
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  /** Response interceptor */
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  /** Error interceptor */
  onError?: (error: ApiError) => void | Promise<void>;
}
