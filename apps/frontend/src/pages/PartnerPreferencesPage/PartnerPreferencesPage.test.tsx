/**
 * Partner Preferences Page Tests
 * Tests for PartnerPreferencesPage component in view and edit modes
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { PartnerPreferencesPage } from './PartnerPreferencesPage';
import { useUserStore } from '../../stores/userStore';
import type { PartnerPreferences } from '../../gen/user/v1/user_pb';

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

// Mock the PartnerPreferencesEditForm component
jest.mock('./PartnerPreferencesEditForm', () => ({
  PartnerPreferencesEditForm: ({ onSave, onCancel }: {
    onSave: (updates: PartnerPreferences) => Promise<void>;
    onCancel: () => void;
  }) => (
    <div data-testid="partner-preferences-edit-form">
      <button onClick={() => onSave({} as PartnerPreferences)}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock the userStore
jest.mock('../../stores/userStore');

const mockFetchProfile = jest.fn();
const mockUpdateProfile = jest.fn();

describe('PartnerPreferencesPage', () => {
  const mockPartnerPreferences: PartnerPreferences = {
    lookingForGender: [2],
    ageRange: {
      minAge: 25,
      maxAge: 35,
    },
    distancePreference: 50,
    heightRange: {
      minHeight: 160,
      maxHeight: 180,
    },
    relationshipGoals: [],
    dealbreakers: ['smoking', 'no pets'],
    educationLevels: [],
    occupations: [],
    religions: [],
    childrenPreferences: [],
    drinkingPreferences: [],
    smokingPreferences: [],
    dietaryPreferences: [],
    petPreferences: [],
    verifiedOnly: true,
  } as PartnerPreferences;

  const mockProfile = {
    userId: '123',
    partnerPreferences: mockPartnerPreferences,
    completionPercentage: 80,
    isPublic: true,
    isVerified: true,
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
    it('should display loading spinner when isLoading is true', () => {
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: null,
        isLoading: true,
        error: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Loading partner preferences...')).toBeInTheDocument();
    });

    it('should call fetchProfile on mount', () => {
      customRender(<PartnerPreferencesPage />);
      expect(mockFetchProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error State', () => {
    it('should display error message when error exists', () => {
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: null,
        isLoading: false,
        error: 'Failed to load preferences',
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Error Loading Partner Preferences')).toBeInTheDocument();
      expect(screen.getByText('Failed to load preferences')).toBeInTheDocument();
    });
  });

  describe('View Mode', () => {
    it('should display partner preferences in readonly view', () => {
      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Partner Preferences')).toBeInTheDocument();
      expect(screen.getByText('View and manage your partner preferences')).toBeInTheDocument();
      expect(screen.getByText('Edit Preferences')).toBeInTheDocument();
    });

    it('should display looking for gender correctly', () => {
      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Looking For')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
    });

    it('should display age range correctly', () => {
      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Age Range')).toBeInTheDocument();
      expect(screen.getByText('25 - 35 years')).toBeInTheDocument();
    });

    it('should display distance preference correctly', () => {
      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Distance Preference')).toBeInTheDocument();
      expect(screen.getByText('50 km')).toBeInTheDocument();
    });

    it('should display height range correctly', () => {
      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Height Range')).toBeInTheDocument();
      expect(screen.getByText('160 - 180 cm')).toBeInTheDocument();
    });

    it('should display verified only badge', () => {
      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Verified Only')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('should display dealbreakers correctly', () => {
      customRender(<PartnerPreferencesPage />);

      expect(screen.getAllByText('Dealbreakers')[0]).toBeInTheDocument();
      expect(screen.getByText('smoking, no pets')).toBeInTheDocument();
    });

    it('should display "Not specified" when looking for gender is empty', () => {
      const modifiedPrefs = { ...mockPartnerPreferences, lookingForGender: [] };
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: { ...mockProfile, partnerPreferences: modifiedPrefs },
        isLoading: false,
        error: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<PartnerPreferencesPage />);

      const lookingForSection = screen.getAllByText('Not specified');
      expect(lookingForSection.length).toBeGreaterThan(0);
    });

    it('should display "None specified" when dealbreakers is empty', () => {
      const modifiedPrefs = { ...mockPartnerPreferences, dealbreakers: [] };
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: { ...mockProfile, partnerPreferences: modifiedPrefs },
        isLoading: false,
        error: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('None specified')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should switch to edit mode when Edit Preferences button is clicked', () => {
      customRender(<PartnerPreferencesPage />);

      const editButton = screen.getByText('Edit Preferences');
      fireEvent.click(editButton);

      expect(screen.getByTestId('partner-preferences-edit-form')).toBeInTheDocument();
      expect(screen.queryByText('Edit Preferences')).not.toBeInTheDocument();
    });

    it('should display edit form with correct message', () => {
      customRender(<PartnerPreferencesPage />);

      const editButton = screen.getByText('Edit Preferences');
      fireEvent.click(editButton);

      expect(screen.getByText('Edit your partner preferences')).toBeInTheDocument();
    });

    it('should call updateProfile when save is clicked in edit form', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);

      customRender(<PartnerPreferencesPage />);

      const editButton = screen.getByText('Edit Preferences');
      fireEvent.click(editButton);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          partnerPreferences: expect.any(Object),
        });
      });
    });

    it('should exit edit mode after successful save', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);

      customRender(<PartnerPreferencesPage />);

      const editButton = screen.getByText('Edit Preferences');
      fireEvent.click(editButton);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByTestId('partner-preferences-edit-form')).not.toBeInTheDocument();
        expect(screen.getByText('Edit Preferences')).toBeInTheDocument();
      });
    });

    it('should exit edit mode when cancel is clicked', () => {
      customRender(<PartnerPreferencesPage />);

      const editButton = screen.getByText('Edit Preferences');
      fireEvent.click(editButton);

      expect(screen.getByTestId('partner-preferences-edit-form')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId('partner-preferences-edit-form')).not.toBeInTheDocument();
      expect(screen.getByText('Edit Preferences')).toBeInTheDocument();
    });

    it('should stay in edit mode when save fails', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('Update failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      customRender(<PartnerPreferencesPage />);

      const editButton = screen.getByText('Edit Preferences');
      fireEvent.click(editButton);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      });

      expect(screen.getByTestId('partner-preferences-edit-form')).toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update partner preferences:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Gender Formatting', () => {
    it('should display multiple genders correctly', () => {
      const modifiedPrefs = { ...mockPartnerPreferences, lookingForGender: [1, 2, 3] };
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: { ...mockProfile, partnerPreferences: modifiedPrefs },
        isLoading: false,
        error: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Male, Female, Non-binary')).toBeInTheDocument();
    });

    it('should handle unknown gender values gracefully', () => {
      const modifiedPrefs = { ...mockPartnerPreferences, lookingForGender: [999] };
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        profile: { ...mockProfile, partnerPreferences: modifiedPrefs },
        isLoading: false,
        error: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      });

      customRender(<PartnerPreferencesPage />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render header component', () => {
      customRender(<PartnerPreferencesPage />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      customRender(<PartnerPreferencesPage />);

      const mainHeading = screen.getByRole('heading', { name: 'Partner Preferences' });
      expect(mainHeading).toBeInTheDocument();

      const sectionHeadings = screen.getAllByRole('heading', { name: /Basic Preferences|Lifestyle Preferences|Additional Preferences/i });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });
  });
});
