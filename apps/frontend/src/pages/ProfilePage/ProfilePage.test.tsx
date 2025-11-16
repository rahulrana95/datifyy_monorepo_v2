/**
 * Profile Page Tests
 * Tests for ProfilePage component in view and edit modes
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ProfilePage } from './ProfilePage';
import { useUserStore } from '../../stores/userStore';
import type { UserProfile } from '../../gen/user/v1/user_pb';

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
  ProfileEditForm: ({ onSave, onCancel }: any) => (
    <div data-testid="profile-edit-form">
      <button onClick={() => onSave({ test: 'data' })}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock the userStore
jest.mock('../../stores/userStore');

const mockFetchProfile = jest.fn();
const mockUpdateProfile = jest.fn();

describe('ProfilePage', () => {
  const mockProfile: any = {
    user_id: '123',
    basic_info: {
      name: 'John Doe',
      email: 'john@example.com',
      phone_number: '+1234567890',
      age: 30,
      gender: 'GENDER_MALE',
      pronouns: 'he/him',
      zodiac_sign: 'ZODIAC_ARIES',
      date_of_birth: undefined,
    },
    profile_details: {
      bio: 'Test bio',
      height: 180,
      job_title: 'Engineer',
      company: 'Tech Co',
      school: 'University',
      hometown: 'City',
      occupations: [],
      education: [],
      interests: [],
      languages: [],
      relationship_goals: [],
    },
    lifestyle_info: {
      drinking: 'DRINKING_SOCIALLY',
      smoking: 'SMOKING_NEVER',
      workout: 'WORKOUT_OFTEN',
      dietary_preference: 'DIETARY_VEGETARIAN',
      religion: 'RELIGION_AGNOSTIC',
      religion_importance: 'IMPORTANCE_NOT_IMPORTANT',
      political_view: 'POLITICAL_MODERATE',
      pets: 'PET_DOG',
      children: 'CHILDREN_WANT',
      personality_type: 'INTJ',
      communication_style: 'COMMUNICATION_BIG_TIME_TEXTER',
      love_language: 'LOVE_LANGUAGE_QUALITY_TIME',
      sleep_schedule: 'SLEEP_SCHEDULE_EARLY_BIRD',
    },
    metadata: {
      status: 'ACCOUNT_STATUS_ACTIVE',
      email_verified: 'EMAIL_VERIFIED',
      phone_verified: 'PHONE_VERIFIED',
      created_at: undefined,
      updated_at: undefined,
      last_login_at: undefined,
    },
    completion_percentage: 80,
    is_public: true,
    is_verified: true,
    is_online: false,
    compatibility_score: 0,
    photos: [],
    prompts: [],
    partner_preferences: undefined,
    user_preferences: undefined,
    last_seen_at: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      fetchProfile: mockFetchProfile,
      updateProfile: mockUpdateProfile,
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: null,
        isLoading: true,
        error: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<ProfilePage />);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when error exists', () => {
      const errorMessage = 'Failed to load profile';
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: null,
        isLoading: false,
        error: errorMessage,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<ProfilePage />);

      expect(screen.getByText('Error Loading Profile')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('View Mode', () => {
    it('should fetch profile on mount', () => {
      customRender(<ProfilePage />);

      expect(mockFetchProfile).toHaveBeenCalledTimes(1);
    });

    it('should display profile information in view mode', () => {
      customRender(<ProfilePage />);

      // Check basic info
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('30 years old')).toBeInTheDocument();

      // Check profile details
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByText('180 cm')).toBeInTheDocument();
      expect(screen.getByText('Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Co')).toBeInTheDocument();

      // Check lifestyle info
      expect(screen.getByText(/socially/i)).toBeInTheDocument(); // drinking
      expect(screen.getByText(/never/i)).toBeInTheDocument(); // smoking
    });

    it('should show Edit Profile button in view mode', () => {
      customRender(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });

    it('should display profile avatar with first letter of name', () => {
      customRender(<ProfilePage />);

      // The avatar should contain the first letter "J"
      const avatar = screen.getByText('J');
      expect(avatar).toBeInTheDocument();
    });

    it('should display account metadata', () => {
      customRender(<ProfilePage />);

      expect(screen.getByText('80%')).toBeInTheDocument(); // completion percentage
      expect(screen.getByText('Public')).toBeInTheDocument(); // visibility
    });

    it('should handle missing profile data gracefully', () => {
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: {
          user_id: '123',
          basic_info: { name: '', email: '', phone_number: '', age: 0 },
        },
        isLoading: false,
        error: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<ProfilePage />);

      expect(screen.getByText('Unknown User')).toBeInTheDocument();
      expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0);
    });
  });

  describe('Edit Mode', () => {
    it('should switch to edit mode when Edit Profile button is clicked', async () => {
      customRender(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });
    });

    it('should hide Edit Profile button in edit mode', async () => {
      customRender(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /edit profile/i })).not.toBeInTheDocument();
      });
    });

    it('should hide view mode content when in edit mode', async () => {
      customRender(<ProfilePage />);

      // Verify view mode content is present
      expect(screen.getByText('Test bio')).toBeInTheDocument();

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        // View mode content should be hidden
        expect(screen.queryByText('Test bio')).not.toBeInTheDocument();
        // Edit form should be visible
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });
    });

    it('should change heading text in edit mode', async () => {
      customRender(<ProfilePage />);

      expect(screen.getByText('View and manage your profile information')).toBeInTheDocument();

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit your profile information')).toBeInTheDocument();
      });
    });
  });

  describe('Save and Cancel', () => {
    it('should call updateProfile when save is clicked', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);

      customRender(<ProfilePage />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });

      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ test: 'data' });
      });
    });

    it('should exit edit mode after successful save', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);

      customRender(<ProfilePage />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });

      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Should exit edit mode
      await waitFor(() => {
        expect(screen.queryByTestId('profile-edit-form')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
    });

    it('should exit edit mode when cancel is clicked', async () => {
      customRender(<ProfilePage />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Should exit edit mode
      await waitFor(() => {
        expect(screen.queryByTestId('profile-edit-form')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
    });

    it('should not call updateProfile when cancel is clicked', async () => {
      customRender(<ProfilePage />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should handle save errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockUpdateProfile.mockRejectedValue(new Error('Update failed'));

      customRender(<ProfilePage />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });

      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to update profile:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      customRender(<ProfilePage />);

      const mainHeading = screen.getByRole('heading', { name: /my profile/i, level: 2 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should have accessible form controls in edit mode', async () => {
      customRender(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });
});
