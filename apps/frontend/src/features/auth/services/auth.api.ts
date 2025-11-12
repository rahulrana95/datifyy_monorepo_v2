/**
 * Auth REST API Client
 * HTTP client for authentication REST endpoints
 */

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * API Types matching backend REST responses
 */
export interface UserResponse {
  user_id: string;
  email: string;
  name: string;
  account_status: string;
  email_verified: string;
  created_at: {
    seconds: number;
    nanos: number;
  };
}

export interface TokenResponse {
  access_token: {
    token: string;
    token_type: string;
    expires_at: {
      seconds: number;
      nanos: number;
    };
  };
  refresh_token: {
    token: string;
    expires_at: {
      seconds: number;
      nanos: number;
    };
  };
}

export interface RegisterResponse {
  user: UserResponse;
  tokens: TokenResponse;
  session: {
    session_id: string;
    user_id: string;
  };
  requires_email_verification: boolean;
}

export interface LoginResponse {
  user: UserResponse;
  tokens: TokenResponse;
  session: {
    session_id: string;
    user_id: string;
  };
}

export interface RefreshTokenResponse {
  tokens: TokenResponse;
}

export interface RevokeTokenResponse {
  message: string;
}

/**
 * Register new user with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
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
): Promise<LoginResponse> {
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
