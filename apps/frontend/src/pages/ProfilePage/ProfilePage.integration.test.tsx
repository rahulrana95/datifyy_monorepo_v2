/**
 * Profile Page Integration Tests
 * End-to-end tests for the complete profile update flow
 */

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { act } from 'react';
import { ProfilePage } from './ProfilePage';
import { useUserStore } from '../../stores/userStore';

// Test wrapper with ChakraProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
};

const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

// Mock the Header component
jest.mock('../../shared/components/Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

// Mock the ProfileEditForm component
jest.mock('./ProfileEditForm', () => ({
  ProfileEditForm: ({ profile, onSave, onCancel }: any) => (
    <div data-testid="profile-edit-form">
      <div data-testid="form-profile">{JSON.stringify(profile)}</div>
      <button data-testid="save-button" onClick={() => onSave({ test: 'data' })}>Save Changes</button>
      <button data-testid="cancel-button" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock the userStore
jest.mock('../../stores/userStore');

describe('ProfilePage Integration Tests', () => {
  let mockFetchProfile: jest.Mock;
  let mockUpdateProfile: jest.Mock;

  const mockProfile: any = {
    user_id: '123',
    basic_info: {
      name: 'John Doe',
      email: 'john@example.com',
      phone_number: '+1234567890',
      age: 30,
      gender: 'GENDER_MALE',
      pronouns: 'he/him',
    },
    profile_details: {
      bio: 'Software Engineer',
      height: 175,
      job_title: 'Senior Developer',
      company: 'Tech Corp',
      school: 'MIT',
      hometown: 'Boston',
    },
    lifestyle_info: {
      drinking: 'DRINKING_SOCIALLY',
      smoking: 'SMOKING_NEVER',
      workout: 'WORKOUT_OFTEN',
      dietary_preference: 'DIETARY_VEGETARIAN',
    },
    completion_percentage: 75,
    is_public: true,
  };

  beforeEach(() => {
    mockFetchProfile = jest.fn().mockResolvedValue(undefined);
    mockUpdateProfile = jest.fn().mockResolvedValue(undefined);

    // Mock the store
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      fetchProfile: mockFetchProfile,
      updateProfile: mockUpdateProfile,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Profile Update Flow', () => {
    it('should complete full profile update workflow', async () => {
      customRender(<ProfilePage />);

      // 1. Verify initial profile data is displayed
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      // 2. Click Edit Profile button
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      // 3. Verify edit mode is active
      await waitFor(() => {
        expect(screen.getByText('Edit your profile information')).toBeInTheDocument();
      });

      // 4. Click Save button in the mocked form
      const saveButton = screen.getByTestId('save-button');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // 5. Verify updateProfile was called
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      });

      // 6. Verify form submitted with data
      expect(mockUpdateProfile).toHaveBeenCalledWith({ test: 'data' });
    });

    it('should handle canceling edit mode without saving', async () => {
      customRender(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit your profile information')).toBeInTheDocument();
      });

      // Cancel without saving
      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      // Verify returned to view mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      // Verify updateProfile was NOT called
      expect(mockUpdateProfile).not.toHaveBeenCalled();

      // Verify original name is still displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should exit edit mode after successful save', async () => {
      customRender(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit your profile information')).toBeInTheDocument();
      });

      // Save changes
      const saveButton = screen.getByTestId('save-button');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Verify returned to view mode after save
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error when profile update fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockUpdateProfile.mockRejectedValue(new Error('Network error'));

      customRender(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit your profile information')).toBeInTheDocument();
      });

      // Try to save
      const saveButton = screen.getByTestId('save-button');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Verify error was logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to update profile:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
