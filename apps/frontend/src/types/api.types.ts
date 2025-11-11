/**
 * API Response Types
 * Following TypeScript best practices with strict typing
 */

export interface ServiceStatus {
  database: boolean;
  redis: boolean;
}

export interface ApiResponse {
  service: string;
  version: string;
  timestamp: string;
  status: ServiceStatus;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export type ApiState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };