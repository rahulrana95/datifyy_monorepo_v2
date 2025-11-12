/**
 * Auth Store
 * Zustand store for authentication state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as authAPI from '../services/auth.api';

/**
 * User and Token types matching REST API responses
 */
export interface User {
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

export interface Tokens {
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

/**
 * Auth state interface
 */
interface AuthState {
  // State
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
  clearError: () => void;
}

/**
 * Helper to extract error message from ConnectError
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Auth store with persistence
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Register new user with email and password
       */
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.registerWithEmail(email, password, name);

          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Login with email and password
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.loginWithEmail(email, password);

          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Logout current user
       */
      logout: async () => {
        const { tokens } = get();
        set({ isLoading: true, error: null });

        try {
          if (tokens?.refresh_token?.token) {
            await authAPI.revokeToken(tokens.refresh_token.token);
          }

          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          // Clear state even if logout fails
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: getErrorMessage(error),
            isLoading: false,
          });
        }
      },

      /**
       * Refresh access token using refresh token
       */
      refreshAccessToken: async () => {
        const { tokens } = get();
        if (!tokens?.refresh_token?.token) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authAPI.refreshToken(tokens.refresh_token.token);

          set({
            tokens: response.tokens,
          });
        } catch (error) {
          // If refresh fails, logout user
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: getErrorMessage(error),
          });
          throw error;
        }
      },

      /**
       * Request password reset email
       */
      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Implement when backend REST endpoint is added
          console.warn('requestPasswordReset not yet implemented', email);
          set({ isLoading: false });
        } catch (error) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Reset password with token
       */
      resetPassword: async (resetToken: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Implement when backend REST endpoint is added
          console.warn('resetPassword not yet implemented', resetToken, newPassword);
          set({ isLoading: false });
        } catch (error) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Verify email with code
       */
      verifyEmail: async (_code: string) => {
        const { user } = get();
        if (!user) {
          throw new Error('No user logged in');
        }

        set({ isLoading: true, error: null });

        try {
          // TODO: Implement when backend REST endpoint is added
          console.warn('verifyEmail not yet implemented');
          set({ isLoading: false });
        } catch (error) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Resend email verification
       */
      resendVerificationEmail: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Implement when backend REST endpoint is added
          console.warn('resendVerificationEmail not yet implemented', email);
          set({ isLoading: false });
        } catch (error) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Load user from storage on app start
       */
      loadUserFromStorage: async () => {
        const { tokens, refreshAccessToken } = get();

        if (tokens?.refresh_token) {
          try {
            // Try to refresh the access token
            await refreshAccessToken();
          } catch (error) {
            // If refresh fails, clear auth state
            set({
              user: null,
              tokens: null,
              isAuthenticated: false,
            });
          }
        }
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'datifyy-auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user and tokens
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Selectors for commonly used state
 */
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectTokens = (state: AuthState) => state.tokens;
