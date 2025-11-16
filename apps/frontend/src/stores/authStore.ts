/**
 * Auth Store
 * Zustand store for authentication state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { create as createProto } from '@bufbuild/protobuf';
import { AuthService } from '../services/auth';
import { ApiClient } from '../services/base';
import {
  EmailPasswordCredentialsSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema
} from '../gen/auth/v1/messages_pb';
import type { TokenPair, UserProfile } from '../gen/auth/v1/messages_pb';
import type { AccountStatus, VerificationStatus } from '../gen/common/v1/types_pb';

// ============================================================================
// Types
// ============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  photoUrl?: string;
  accountStatus?: AccountStatus;
  emailVerified?: VerificationStatus;
  phoneVerified?: VerificationStatus;
}

export interface AuthState {
  // State
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth Service
  authService: AuthService;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: AuthUser | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

const extractTokens = (tokenPair?: TokenPair): AuthTokens | null => {
  if (!tokenPair?.accessToken?.token || !tokenPair?.refreshToken?.token) {
    return null;
  }
  return {
    accessToken: tokenPair.accessToken.token,
    refreshToken: tokenPair.refreshToken.token,
    expiresAt: tokenPair.accessToken.expiresAt?.seconds
      ? Number(tokenPair.accessToken.expiresAt.seconds) * 1000
      : undefined,
  };
};

const transformUser = (user?: UserProfile): AuthUser | null => {
  if (!user) return null;

  return {
    userId: user.userId || '',
    email: user.email || '',
    name: user.name,
    phoneNumber: user.phoneNumber,
    photoUrl: user.photoUrl,
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
  };
};

// Initialize API client and auth service
const createAuthService = () => {
  const apiClient = new ApiClient({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080'
  });
  return new AuthService(apiClient);
};

// ============================================================================
// Store
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authService: createAuthService(),

      // Login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { authService } = get();
          const response = await authService.loginWithEmail({
            credentials: createProto(EmailPasswordCredentialsSchema, {
              email,
              password,
              name: '',
            }),
          });

          const tokens = extractTokens(response.tokens);
          const user = transformUser(response.user);

          if (tokens && user) {
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },

      // Signup
      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const { authService } = get();
          const response = await authService.registerWithEmail({
            credentials: createProto(EmailPasswordCredentialsSchema, {
              email,
              password,
              name,
            }),
          });

          const tokens = extractTokens(response.tokens);
          const user = transformUser(response.user);

          if (tokens && user) {
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const { authService } = get();

          // Call logout API (LogoutRequest is an empty message)
          try {
            await authService.logout({});
          } catch (err) {
            // Continue logout even if API call fails
            console.error('Logout API call failed:', err);
          }

          // Clear local state
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Logout failed';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // Request Password Reset
      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { authService } = get();
          await authService.requestPasswordReset({
            resetRequest: createProto(PasswordResetRequestSchema, {
              email,
              deviceInfo: undefined,
            }),
          });
          set({ isLoading: false, error: null });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Password reset request failed';
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },

      // Confirm Password Reset
      confirmPasswordReset: async (resetToken: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const { authService } = get();
          await authService.confirmPasswordReset({
            confirmation: createProto(PasswordResetConfirmSchema, {
              resetToken,
              newPassword,
              deviceInfo: undefined,
            }),
          });
          set({ isLoading: false, error: null });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },

      // Refresh Token
      refreshToken: async () => {
        const { authService, tokens } = get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }

        set({ isLoading: true, error: null });
        try {
          const response = await authService.refreshToken({
            refreshToken: tokens.refreshToken,
          });

          const newTokens = extractTokens(response.tokens);
          if (newTokens) {
            set({
              tokens: newTokens,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Invalid token response');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Token refresh failed';
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: errorMessage,
            isLoading: false,
          });
          throw err;
        }
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Set User (for manual updates)
      setUser: (user: AuthUser | null) => {
        set({ user, isAuthenticated: !!user });
      },

      // Set Tokens (for manual updates)
      setTokens: (tokens: AuthTokens | null) => {
        set({ tokens });
      },
    }),
    {
      name: 'auth-storage', // Storage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
