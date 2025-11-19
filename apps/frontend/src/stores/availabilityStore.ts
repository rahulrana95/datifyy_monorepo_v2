/**
 * Availability Store
 * Zustand store for availability state management
 */

import { create } from 'zustand';
import {
  AvailabilityService,
  AvailabilitySlot,
  AvailabilitySlotInput
} from '../services/availability';
import { ApiClient } from '../services/base';

// ============================================================================
// Types
// ============================================================================

export interface AvailabilityState {
  // State
  slots: AvailabilitySlot[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Service
  availabilityService: AvailabilityService;

  // Actions
  fetchAvailability: (fromTime?: number, toTime?: number) => Promise<void>;
  submitAvailability: (slots: AvailabilitySlotInput[]) => Promise<{ success: boolean; message: string; errors?: Record<number, string> }>;
  deleteSlot: (slotId: string) => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

const createAvailabilityService = () => {
  const apiClient = new ApiClient({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    getAuthToken: async () => {
      const authStore = await import('./authStore');
      return authStore.useAuthStore.getState().tokens?.accessToken || null;
    }
  });
  return new AvailabilityService(apiClient);
};

// ============================================================================
// Store
// ============================================================================

export const useAvailabilityStore = create<AvailabilityState>()((set, get) => ({
  // Initial State
  slots: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  availabilityService: createAvailabilityService(),

  // Fetch Availability
  fetchAvailability: async (fromTime?: number, toTime?: number) => {
    set({ isLoading: true, error: null });
    try {
      const { availabilityService } = get();
      const response = await availabilityService.getAvailability(fromTime, toTime);

      set({
        slots: response.slots || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch availability';
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  // Submit Availability
  submitAvailability: async (slots: AvailabilitySlotInput[]) => {
    set({ isSubmitting: true, error: null });
    try {
      const { availabilityService, fetchAvailability } = get();
      const response = await availabilityService.submitAvailability(slots);

      set({ isSubmitting: false });

      // Refresh the slots list
      await fetchAvailability();

      return {
        success: response.createdCount > 0,
        message: response.message,
        errors: Object.keys(response.validationErrors).length > 0 ? response.validationErrors : undefined
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit availability';
      set({ error: errorMessage, isSubmitting: false });
      throw err;
    }
  },

  // Delete Slot
  deleteSlot: async (slotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { availabilityService, slots } = get();
      await availabilityService.deleteAvailability(slotId);

      // Remove from local state
      set({
        slots: slots.filter(s => s.slotId !== slotId),
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete slot';
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  // Clear Error
  clearError: () => set({ error: null }),
}));
