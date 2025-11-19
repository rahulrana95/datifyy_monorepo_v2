/**
 * Partner Preferences Edit Form Tests
 * Tests for PartnerPreferencesEditForm component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { PartnerPreferencesEditForm } from './PartnerPreferencesEditForm';
import type { PartnerPreferences } from '../../gen/user/v1/user_pb';

// Test wrapper with ChakraProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
};

const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

describe('PartnerPreferencesEditForm', () => {
  const mockPreferences: PartnerPreferences = {
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

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the form with all sections', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Basic Preferences')).toBeInTheDocument();
      expect(screen.getByText('Dealbreakers')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render all input fields', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Minimum Age')).toBeInTheDocument();
      expect(screen.getByText('Maximum Age')).toBeInTheDocument();
      expect(screen.getByText('Minimum Height (cm)')).toBeInTheDocument();
      expect(screen.getByText('Maximum Height (cm)')).toBeInTheDocument();
      expect(screen.getByText('Maximum Distance (km)')).toBeInTheDocument();
      expect(screen.getByText('Profile Verification')).toBeInTheDocument();
      expect(screen.getByText('Looking For (select one or more)')).toBeInTheDocument();
    });

    it('should render gender checkboxes', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('Male')).toBeInTheDocument();
      expect(screen.getByLabelText('Female')).toBeInTheDocument();
      expect(screen.getByLabelText('Non-binary')).toBeInTheDocument();
    });
  });

  describe('Initial Values', () => {
    it('should populate form with preferences values', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const minAgeInput = screen.getByLabelText('Minimum Age') as HTMLInputElement;
      const maxAgeInput = screen.getByLabelText('Maximum Age') as HTMLInputElement;
      const minHeightInput = screen.getByLabelText('Minimum Height (cm)') as HTMLInputElement;
      const maxHeightInput = screen.getByLabelText('Maximum Height (cm)') as HTMLInputElement;
      const distanceInput = screen.getByLabelText('Maximum Distance (km)') as HTMLInputElement;

      expect(minAgeInput.value).toBe('25');
      expect(maxAgeInput.value).toBe('35');
      expect(minHeightInput.value).toBe('160');
      expect(maxHeightInput.value).toBe('180');
      expect(distanceInput.value).toBe('50');
    });

    it('should check the correct gender checkboxes', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const maleCheckbox = screen.getByLabelText('Male') as HTMLInputElement;
      const femaleCheckbox = screen.getByLabelText('Female') as HTMLInputElement;
      const nonBinaryCheckbox = screen.getByLabelText('Non-binary') as HTMLInputElement;

      expect(maleCheckbox.checked).toBe(false);
      expect(femaleCheckbox.checked).toBe(true);
      expect(nonBinaryCheckbox.checked).toBe(false);
    });

    it('should check verified only checkbox when true', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const verifiedCheckbox = screen.getByLabelText('Show only verified profiles') as HTMLInputElement;
      expect(verifiedCheckbox.checked).toBe(true);
    });

    it('should populate dealbreakers input', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const dealbreakersInput = screen.getByPlaceholderText('e.g., smoking, no pets, long distance') as HTMLInputElement;
      expect(dealbreakersInput.value).toBe('smoking, no pets');
    });

    it('should handle undefined ageRange gracefully', () => {
      const prefsWithoutAgeRange = { ...mockPreferences, ageRange: undefined };
      customRender(
        <PartnerPreferencesEditForm
          preferences={prefsWithoutAgeRange}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const minAgeInput = screen.getByLabelText('Minimum Age') as HTMLInputElement;
      const maxAgeInput = screen.getByLabelText('Maximum Age') as HTMLInputElement;

      expect(minAgeInput.value).toBe('18');
      expect(maxAgeInput.value).toBe('99');
    });

    it('should handle undefined heightRange gracefully', () => {
      const prefsWithoutHeightRange = { ...mockPreferences, heightRange: undefined };
      customRender(
        <PartnerPreferencesEditForm
          preferences={prefsWithoutHeightRange}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const minHeightInput = screen.getByLabelText('Minimum Height (cm)') as HTMLInputElement;
      const maxHeightInput = screen.getByLabelText('Maximum Height (cm)') as HTMLInputElement;

      expect(minHeightInput.value).toBe('150');
      expect(maxHeightInput.value).toBe('200');
    });

    it('should handle empty dealbreakers array', () => {
      const prefsWithoutDealbreakers = { ...mockPreferences, dealbreakers: [] };
      customRender(
        <PartnerPreferencesEditForm
          preferences={prefsWithoutDealbreakers}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const dealbreakersInput = screen.getByPlaceholderText('e.g., smoking, no pets, long distance') as HTMLInputElement;
      expect(dealbreakersInput.value).toBe('');
    });
  });

  describe('User Interactions', () => {
    it('should update minAge when input changes', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const minAgeInput = screen.getByLabelText('Minimum Age') as HTMLInputElement;
      fireEvent.change(minAgeInput, { target: { value: '30' } });

      expect(minAgeInput.value).toBe('30');
    });

    it('should update maxAge when input changes', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const maxAgeInput = screen.getByLabelText('Maximum Age') as HTMLInputElement;
      fireEvent.change(maxAgeInput, { target: { value: '40' } });

      expect(maxAgeInput.value).toBe('40');
    });

    it('should update distance preference when input changes', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const distanceInput = screen.getByLabelText('Maximum Distance (km)') as HTMLInputElement;
      fireEvent.change(distanceInput, { target: { value: '100' } });

      expect(distanceInput.value).toBe('100');
    });

    it('should toggle gender checkboxes', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const maleCheckbox = screen.getByLabelText('Male') as HTMLInputElement;
      const femaleCheckbox = screen.getByLabelText('Female') as HTMLInputElement;

      fireEvent.click(maleCheckbox);
      expect(maleCheckbox.checked).toBe(true);

      fireEvent.click(femaleCheckbox);
      expect(femaleCheckbox.checked).toBe(false);
    });

    it('should toggle verified only checkbox', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const verifiedCheckbox = screen.getByLabelText('Show only verified profiles') as HTMLInputElement;
      expect(verifiedCheckbox.checked).toBe(true);

      fireEvent.click(verifiedCheckbox);
      expect(verifiedCheckbox.checked).toBe(false);
    });

    it('should update dealbreakers input', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const dealbreakersInput = screen.getByPlaceholderText('e.g., smoking, no pets, long distance') as HTMLInputElement;
      fireEvent.change(dealbreakersInput, { target: { value: 'new, dealbreakers, here' } });

      expect(dealbreakersInput.value).toBe('new, dealbreakers, here');
    });
  });

  describe('Form Submission', () => {
    it('should call onSave with updated preferences when form is submitted', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const minAgeInput = screen.getByLabelText('Minimum Age') as HTMLInputElement;
      fireEvent.change(minAgeInput, { target: { value: '30' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.ageRange.minAge).toBe(30);
      expect(calledWith.ageRange.maxAge).toBe(35);
    });

    it('should include selected genders in lookingForGender array', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const maleCheckbox = screen.getByLabelText('Male') as HTMLInputElement;
      const nonBinaryCheckbox = screen.getByLabelText('Non-binary') as HTMLInputElement;

      fireEvent.click(maleCheckbox);
      fireEvent.click(nonBinaryCheckbox);

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.lookingForGender).toContain(1); // Male
      expect(calledWith.lookingForGender).toContain(2); // Female
      expect(calledWith.lookingForGender).toContain(3); // Non-binary
    });

    it('should parse dealbreakers string into array', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const dealbreakersInput = screen.getByPlaceholderText('e.g., smoking, no pets, long distance') as HTMLInputElement;
      fireEvent.change(dealbreakersInput, { target: { value: 'smoking, pets, distance' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.dealbreakers).toEqual(['smoking', 'pets', 'distance']);
    });

    it('should trim whitespace from dealbreakers', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const dealbreakersInput = screen.getByPlaceholderText('e.g., smoking, no pets, long distance') as HTMLInputElement;
      fireEvent.change(dealbreakersInput, { target: { value: '  smoking  ,  pets  ,  distance  ' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.dealbreakers).toEqual(['smoking', 'pets', 'distance']);
    });

    it('should filter out empty dealbreakers', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const dealbreakersInput = screen.getByPlaceholderText('e.g., smoking, no pets, long distance') as HTMLInputElement;
      fireEvent.change(dealbreakersInput, { target: { value: 'smoking,,pets,  ,distance' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.dealbreakers).toEqual(['smoking', 'pets', 'distance']);
    });

    it('should handle empty dealbreakers string', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const dealbreakersInput = screen.getByPlaceholderText('e.g., smoking, no pets, long distance') as HTMLInputElement;
      fireEvent.change(dealbreakersInput, { target: { value: '' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.dealbreakers).toEqual([]);
    });

    it('should preserve existing preference properties when submitting', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.relationshipGoals).toEqual(mockPreferences.relationshipGoals);
      expect(calledWith.educationLevels).toEqual(mockPreferences.educationLevels);
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when Cancel button is clicked', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onSave when Cancel is clicked', () => {
      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple genders being selected', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={{ ...mockPreferences, lookingForGender: [1, 2, 3] }}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.lookingForGender).toHaveLength(3);
    });

    it('should handle no genders being selected', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <PartnerPreferencesEditForm
          preferences={mockPreferences}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const femaleCheckbox = screen.getByLabelText('Female') as HTMLInputElement;
      fireEvent.click(femaleCheckbox); // Uncheck the only selected gender

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.lookingForGender).toEqual([]);
    });

    it('should preserve ageRange $typeName when it exists', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const prefsWithTypeName = {
        ...mockPreferences,
        ageRange: {
          ...mockPreferences.ageRange,
          $typeName: 'datifyy.user.v1.AgeRange',
        },
      } as PartnerPreferences;

      customRender(
        <PartnerPreferencesEditForm
          preferences={prefsWithTypeName}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const calledWith = mockOnSave.mock.calls[0][0];
      expect(calledWith.ageRange).toBeDefined();
    });
  });
});
