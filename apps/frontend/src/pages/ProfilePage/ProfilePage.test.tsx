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
    cultural_info: {
      mother_tongue: 'English',
      nationality: 'USA',
      caste: 'General',
      sub_caste: 'Sub-General',
      willing_to_relocate: true,
    },
    appearance_info: {
      body_type: 'BODY_TYPE_ATHLETIC',
      complexion: 'COMPLEXION_FAIR',
      hair_color: 'HAIR_COLOR_BLACK',
      eye_color: 'EYE_COLOR_BROWN',
      has_tattoos: true,
      has_piercings: false,
    },
    professional_info: {
      employment_type: 'EMPLOYMENT_TYPE_FULL_TIME',
      industry: 'Technology',
      years_of_experience: 5,
      highest_education: 'EDUCATION_LEVEL_BACHELORS',
      owns_property: true,
      owns_vehicle: true,
    },
    family_info: {
      family_type: 'FAMILY_TYPE_NUCLEAR',
      num_siblings: 2,
      father_occupation: 'Doctor',
      mother_occupation: 'Teacher',
      living_situation: 'LIVING_SITUATION_WITH_PARENTS',
      family_location: 'New York',
      about_family: 'Loving family',
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
    // Mock scrollIntoView for Jest environment
    Element.prototype.scrollIntoView = jest.fn();

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

  describe('New Sections - Phase 2', () => {
    describe('Cultural Info Section', () => {
      it('should display cultural information fields', () => {
        customRender(<ProfilePage />);

        expect(screen.getByText('Cultural & Matrimonial Information')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument(); // mother_tongue
        expect(screen.getByText('USA')).toBeInTheDocument(); // nationality
        expect(screen.getByText('General')).toBeInTheDocument(); // caste
        expect(screen.getByText('Sub-General')).toBeInTheDocument(); // sub_caste
      });

      it('should display willing to relocate status', () => {
        customRender(<ProfilePage />);

        const elements = screen.getAllByText('Yes');
        expect(elements.length).toBeGreaterThan(0); // willing_to_relocate is true
      });

      it('should handle missing cultural info gracefully', () => {
        (useUserStore as unknown as jest.Mock).mockReturnValue({
          profile: { ...mockProfile, cultural_info: null },
          isLoading: false,
          error: null,
          fetchProfile: mockFetchProfile,
          updateProfile: mockUpdateProfile,
        });

        customRender(<ProfilePage />);

        const notSpecifiedElements = screen.getAllByText('Not specified');
        expect(notSpecifiedElements.length).toBeGreaterThan(0);
      });
    });

    describe('Appearance Info Section', () => {
      it('should display appearance information fields', () => {
        customRender(<ProfilePage />);

        // "Appearance" appears in both sidebar and section heading
        const appearanceElements = screen.getAllByText('Appearance');
        expect(appearanceElements.length).toBeGreaterThan(0);
        expect(screen.getByText(/athletic/i)).toBeInTheDocument(); // body_type
        expect(screen.getByText(/fair/i)).toBeInTheDocument(); // complexion
        expect(screen.getByText(/black/i)).toBeInTheDocument(); // hair_color
        expect(screen.getByText(/brown/i)).toBeInTheDocument(); // eye_color
      });

      it('should display tattoos and piercings status', () => {
        customRender(<ProfilePage />);

        const yesElements = screen.getAllByText('Yes');
        const noElements = screen.getAllByText('No');
        expect(yesElements.length).toBeGreaterThan(0); // has_tattoos
        expect(noElements.length).toBeGreaterThan(0); // has_piercings
      });
    });

    describe('Professional Info Section', () => {
      it('should display professional information fields', () => {
        customRender(<ProfilePage />);

        expect(screen.getByText('Professional & Financial')).toBeInTheDocument();
        expect(screen.getByText(/full time/i)).toBeInTheDocument(); // employment_type
        expect(screen.getByText('Technology')).toBeInTheDocument(); // industry
        expect(screen.getByText('5 years')).toBeInTheDocument(); // years_of_experience
        expect(screen.getByText(/bachelors/i)).toBeInTheDocument(); // highest_education
      });

      it('should display property and vehicle ownership', () => {
        customRender(<ProfilePage />);

        const yesElements = screen.getAllByText('Yes');
        expect(yesElements.length).toBeGreaterThan(2); // owns_property and owns_vehicle
      });
    });

    describe('Family Info Section', () => {
      it('should display family information fields', () => {
        customRender(<ProfilePage />);

        expect(screen.getByText('Family Background')).toBeInTheDocument();
        expect(screen.getByText(/nuclear/i)).toBeInTheDocument(); // family_type
        expect(screen.getByText('2')).toBeInTheDocument(); // num_siblings
        expect(screen.getByText('Doctor')).toBeInTheDocument(); // father_occupation
        expect(screen.getByText('Teacher')).toBeInTheDocument(); // mother_occupation
        expect(screen.getByText('New York')).toBeInTheDocument(); // family_location
        expect(screen.getByText('Loving family')).toBeInTheDocument(); // about_family
      });
    });

    describe('Sidebar Navigation', () => {
      it('should display sidebar with all section links', () => {
        customRender(<ProfilePage />);

        expect(screen.getByText('QUICK NAVIGATION')).toBeInTheDocument();
        expect(screen.getByText('Basic Info')).toBeInTheDocument();
        // "Profile Details", "Lifestyle", and "Appearance" appear in both sidebar and content
        expect(screen.getAllByText('Profile Details').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Lifestyle').length).toBeGreaterThan(0);
        expect(screen.getByText('Cultural Info')).toBeInTheDocument();
        expect(screen.getAllByText('Appearance').length).toBeGreaterThan(0);
        expect(screen.getByText('Professional')).toBeInTheDocument();
        expect(screen.getByText('Family')).toBeInTheDocument();
        expect(screen.getByText('Account')).toBeInTheDocument();
      });

      it('should handle section navigation clicks', () => {
        customRender(<ProfilePage />);

        const culturalLink = screen.getByText('Cultural Info');
        fireEvent.click(culturalLink);

        // Verify the section exists and is in the document
        expect(screen.getByText('Cultural & Matrimonial Information')).toBeInTheDocument();
      });
    });

    describe('Sticky Header', () => {
      it('should render sticky header with title', () => {
        customRender(<ProfilePage />);

        const headings = screen.getAllByText('My Profile');
        expect(headings.length).toBeGreaterThan(0);
        expect(screen.getByText('View and manage your profile information')).toBeInTheDocument();
      });

      it('should show correct subtitle in edit mode', async () => {
        customRender(<ProfilePage />);

        const editButton = screen.getByRole('button', { name: /edit profile/i });
        fireEvent.click(editButton);

        await waitFor(() => {
          expect(screen.getByText('Edit your profile information')).toBeInTheDocument();
        });
      });
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

    it('should have proper section headings', () => {
      customRender(<ProfilePage />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      // "Profile Details", "Lifestyle", and "Appearance" appear in both sidebar and content
      expect(screen.getAllByText('Profile Details').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lifestyle').length).toBeGreaterThan(0);
      expect(screen.getByText('Cultural & Matrimonial Information')).toBeInTheDocument();
      expect(screen.getAllByText('Appearance').length).toBeGreaterThan(0);
      expect(screen.getByText('Professional & Financial')).toBeInTheDocument();
      expect(screen.getByText('Family Background')).toBeInTheDocument();
      expect(screen.getByText('Account Information')).toBeInTheDocument();
    });
  });
});
