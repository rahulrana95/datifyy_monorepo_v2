/**
 * Auth gRPC Client
 * Connect-RPC client for authentication service
 */

import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { AuthService } from '../../../gen/auth/v1/auth_pb';

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Create Connect transport for gRPC-Web
 */
const transport = createConnectTransport({
  baseUrl: API_BASE_URL,
  // Optional: Add interceptors for auth tokens
  // interceptors: [authInterceptor],
});

/**
 * Auth service client
 * Type-safe gRPC client using generated protobuf types
 */
export const authClient = createClient(AuthService, transport);

/**
 * Example usage:
 *
 * ```ts
 * import { authClient } from './auth.client';
 * import { create } from '@bufbuild/protobuf';
 * import {
 *   RegisterWithEmailRequestSchema,
 *   EmailPasswordCredentialsSchema,
 * } from '../../../gen/auth/v1/auth_pb';
 *
 * // Register new user
 * const response = await authClient.registerWithEmail(
 *   create(RegisterWithEmailRequestSchema, {
 *     credentials: create(EmailPasswordCredentialsSchema, {
 *       email: 'user@example.com',
 *       password: 'securepassword',
 *       name: 'John Doe',
 *     }),
 *   })
 * );
 *
 * // Login
 * const loginResponse = await authClient.loginWithEmail(
 *   create(LoginWithEmailRequestSchema, {
 *     credentials: create(EmailPasswordCredentialsSchema, {
 *       email: 'user@example.com',
 *       password: 'securepassword',
 *     }),
 *   })
 * );
 *
 * // Access response
 * const user = loginResponse.user;
 * const tokens = loginResponse.tokens;
 * ```
 */
