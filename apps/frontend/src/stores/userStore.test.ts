/**
 * User Store Tests
 * Tests for userStore fetchProfile and updateProfile methods
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserStore } from './userStore';
import type { UserProfile } from '../gen/user/v1/user_pb';

// Mock the UserService
jest.mock('../services/user', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    getMyProfile: jest.fn(),
    updateProfile: jest.fn(),
  })),
}));

// Mock the ApiClient
jest.mock('../services/base', () => ({
  ApiClient: jest.fn().mockImplementation(() => ({})),
}));

// Mock the authStore
jest.mock('./authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      tokens: { accessToken: 'test-access-token' },
    })),
  },
}));

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useUserStore.setState({
      profile: null,
      isLoading: false,
      error: null,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('fetchProfile', () => {
    it('should fetch profile successfully', async () => {
      const mockProfile: Partial<UserProfile> = {
        userId: '123',
        basicInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
          age: 30,
          gender: 'GENDER_MALE' as any,
          pronouns: 'he/him',
          zodiacSign: 'ZODIAC_ARIES' as any,
          dateOfBirth: undefined,
        } as any,
        profileDetails: {
          bio: 'Test bio',
          height: 180,
          jobTitle: 'Engineer',
          company: 'Test Co',
          school: 'Test University',
          hometown: 'Test City',
          occupations: [],
          education: [],
          interests: [],
          languages: [],
          relationshipGoals: [],
        } as any,
      };

      const { result } = renderHook(() => useUserStore());

      // Mock the service response
      const mockGetMyProfile = jest.fn().mockResolvedValue({
        profile: mockProfile,
      });
      result.current.userService.getMyProfile = mockGetMyProfile;

      // Call fetchProfile
      await act(async () => {
        await result.current.fetchProfile();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the profile was set
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.error).toBeNull();
      expect(mockGetMyProfile).toHaveBeenCalledWith({});
    });

    it('should set isLoading to true while fetching', async () => {
      const { result } = renderHook(() => useUserStore());

      // Mock a delayed response
      const mockGetMyProfile = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ profile: {} }), 100))
      );
      result.current.userService.getMyProfile = mockGetMyProfile;

      // Start fetching
      act(() => {
        result.current.fetchProfile();
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle fetch errors', async () => {
      const { result } = renderHook(() => useUserStore());

      const errorMessage = 'Failed to fetch profile';
      const mockGetMyProfile = jest.fn().mockRejectedValue(new Error(errorMessage));
      result.current.userService.getMyProfile = mockGetMyProfile;

      // Call fetchProfile and expect it to throw
      await act(async () => {
        try {
          await result.current.fetchProfile();
        } catch (err) {
          // Expected to throw
        }
      });

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear error on successful fetch', async () => {
      const { result } = renderHook(() => useUserStore());

      // Set an initial error
      act(() => {
        useUserStore.setState({ error: 'Previous error' });
      });

      const mockProfile = { userId: '123' };
      const mockGetMyProfile = jest.fn().mockResolvedValue({ profile: mockProfile });
      result.current.userService.getMyProfile = mockGetMyProfile;

      await act(async () => {
        await result.current.fetchProfile();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const { result } = renderHook(() => useUserStore());

      const initialProfile: Partial<UserProfile> = {
        userId: '123',
        basicInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '',
          age: 30,
          gender: 'GENDER_MALE' as any,
          pronouns: '',
          zodiacSign: 'ZODIAC_ARIES' as any,
          dateOfBirth: undefined,
        } as any,
      };

      const updates = {
        basicInfo: {
          name: 'Jane Doe',
        },
      };

      const updatedProfile = {
        ...initialProfile,
        basicInfo: {
          ...initialProfile.basicInfo,
          name: 'Jane Doe',
        },
      };

      // Set initial profile
      act(() => {
        useUserStore.setState({ profile: initialProfile as UserProfile });
      });

      // Mock the service response
      const mockUpdateProfile = jest.fn().mockResolvedValue({
        profile: updatedProfile,
      });
      result.current.userService.updateProfile = mockUpdateProfile;

      // Call updateProfile
      await act(async () => {
        await result.current.updateProfile(updates);
      });

      // Wait for update to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the profile was updated
      expect(result.current.profile).toEqual(updatedProfile);
      expect(result.current.error).toBeNull();
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    it('should set isLoading to true while updating', async () => {
      const { result } = renderHook(() => useUserStore());

      const mockUpdateProfile = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ profile: {} }), 100))
      );
      result.current.userService.updateProfile = mockUpdateProfile;

      // Start updating
      act(() => {
        result.current.updateProfile({ basicInfo: { name: 'Test' } });
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle update errors', async () => {
      const { result } = renderHook(() => useUserStore());

      const errorMessage = 'Failed to update profile';
      const mockUpdateProfile = jest.fn().mockRejectedValue(new Error(errorMessage));
      result.current.userService.updateProfile = mockUpdateProfile;

      // Call updateProfile and expect it to throw
      await act(async () => {
        try {
          await result.current.updateProfile({ basicInfo: { name: 'Test' } });
        } catch (err) {
          // Expected to throw
        }
      });

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should merge updates with current profile', async () => {
      const { result } = renderHook(() => useUserStore());

      const initialProfile: Partial<UserProfile> = {
        userId: '123',
        basicInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
          age: 30,
          gender: 'GENDER_MALE' as any,
          pronouns: 'he/him',
          zodiacSign: 'ZODIAC_ARIES' as any,
          dateOfBirth: undefined,
        } as any,
        profileDetails: {
          bio: 'Original bio',
          height: 180,
          jobTitle: '',
          company: '',
          school: '',
          hometown: '',
          occupations: [],
          education: [],
          interests: [],
          languages: [],
          relationshipGoals: [],
        } as any,
      };

      act(() => {
        useUserStore.setState({ profile: initialProfile as UserProfile });
      });

      const updates = {
        profileDetails: {
          bio: 'Updated bio',
        },
      };

      const mockUpdateProfile = jest.fn().mockImplementation((data) => {
        return Promise.resolve({ profile: data });
      });
      result.current.userService.updateProfile = mockUpdateProfile;

      await act(async () => {
        await result.current.updateProfile(updates);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The update should have been called with merged data
      expect(mockUpdateProfile).toHaveBeenCalled();
      const callArg = mockUpdateProfile.mock.calls[0][0];
      expect(callArg).toMatchObject({
        ...initialProfile,
        profileDetails: {
          bio: 'Updated bio',
        },
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useUserStore());

      // Set an error
      act(() => {
        useUserStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('setProfile', () => {
    it('should set profile manually', () => {
      const { result } = renderHook(() => useUserStore());

      const mockProfile: Partial<UserProfile> = {
        userId: '123',
        basicInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '',
          age: 25,
          gender: 'GENDER_MALE' as any,
          pronouns: '',
          zodiacSign: 'ZODIAC_ARIES' as any,
          dateOfBirth: undefined,
        } as any,
      };

      act(() => {
        result.current.setProfile(mockProfile as UserProfile);
      });

      expect(result.current.profile).toEqual(mockProfile);
    });

    it('should set profile to null', () => {
      const { result } = renderHook(() => useUserStore());

      // Set a profile first
      const mockProfile = { userId: '123' } as UserProfile;
      act(() => {
        result.current.setProfile(mockProfile);
      });

      expect(result.current.profile).toEqual(mockProfile);

      // Clear it
      act(() => {
        result.current.setProfile(null);
      });

      expect(result.current.profile).toBeNull();
    });
  });
});
