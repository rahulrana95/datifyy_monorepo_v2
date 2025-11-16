/**
 * User Store
 * Zustand store for user profile state management
 */

import { create } from 'zustand';
import { UserService } from '../services/user';
import { ApiClient } from '../services/base';
import type { UserProfile } from '../gen/user/v1/user_pb';

// ============================================================================
// Types
// ============================================================================

export interface UserState {
  // State
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // User Service
  userService: UserService;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  setProfile: (profile: UserProfile | null) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

// Initialize API client and user service
const createUserService = () => {
  const apiClient = new ApiClient({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    getAuthToken: async () => {
      // Get access token from auth store
      const authStore = await import('./authStore');
      return authStore.useAuthStore.getState().tokens?.accessToken || null;
    }
  });
  return new UserService(apiClient);
};

// ============================================================================
// Store
// ============================================================================

export const useUserStore = create<UserState>()((set, get) => ({
  // Initial State
  profile: null,
  isLoading: false,
  error: null,
  userService: createUserService(),

  // Fetch Profile
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const { userService } = get();
      const response = await userService.getMyProfile({});

      set({
        profile: response.profile || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  // Update Profile
  updateProfile: async (updates: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const { userService, profile } = get();

      // Merge updates with current profile
      const updatedProfile = {
        ...profile,
        ...updates,
      };

      const response = await userService.updateProfile(updatedProfile as any);

      set({
        profile: response.profile || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },

  // Set Profile (for manual updates)
  setProfile: (profile: UserProfile | null) => {
    set({ profile });
  },
}));
