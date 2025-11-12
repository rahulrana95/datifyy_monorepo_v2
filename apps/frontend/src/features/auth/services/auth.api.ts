/**
 * Auth REST API Client
 * HTTP client for authentication REST endpoints
 * Uses types from generated proto files
 */

import type {
  RegisterWithEmailResponse,
  LoginWithEmailResponse,
  RefreshTokenResponse,
  RevokeTokenResponse,
} from '../../../gen/auth/v1/auth_pb';

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Register new user with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<RegisterWithEmailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      name,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Registration failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginWithEmailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Login failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Token refresh failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Revoke refresh token (logout)
 */
export async function revokeToken(
  refreshToken: string
): Promise<RevokeTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Token revocation failed: ${response.status}`);
  }

  return response.json();
}
