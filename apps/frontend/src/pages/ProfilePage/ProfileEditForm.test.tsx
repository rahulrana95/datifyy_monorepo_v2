/**
 * ProfileEditForm Tests
 * Tests for ProfileEditForm component with validation, collapsible sections, and NumberInput
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ProfileEditForm } from './ProfileEditForm';
import type { UserProfile } from '../../gen/user/v1/user_pb';

// Test wrapper with ChakraProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
};

const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

describe('ProfileEditForm', () => {
  const mockProfile: any = {
    user_id: '123',
    basic_info: {
      name: 'John Doe',
      email: 'john@example.com',
      phone_number: '+1234567890',
      gender: 'GENDER_MALE',
      pronouns: 'he/him',
      age: 30,
    },
    profile_details: {
      bio: 'Test bio',
      height: 180,
      job_title: 'Engineer',
      company: 'Tech Co',
      school: 'University',
      hometown: 'City',
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
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all three collapsible sections', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Profile Details')).toBeInTheDocument();
      expect(screen.getByText('Lifestyle')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should have basic and profile sections expanded by default', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Basic section should show its fields
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();

      // Profile section should show its fields
      expect(screen.getByPlaceholderText('Tell us about yourself...')).toBeInTheDocument();
    });

    it('should have lifestyle section collapsed by default', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Personality Type field is in lifestyle section, should not be visible initially
      expect(screen.queryByPlaceholderText('e.g., INTJ, ENFP')).not.toBeInTheDocument();
    });
  });

  describe('Collapsible Sections', () => {
    it('should expand lifestyle section when clicked', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Find and click the lifestyle section header
      const lifestyleHeader = screen.getByText('Lifestyle');
      fireEvent.click(lifestyleHeader);

      // Personality Type field should now be visible
      expect(screen.getByPlaceholderText('e.g., INTJ, ENFP')).toBeInTheDocument();
    });

    it('should collapse expanded section when clicked again', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Basic section is expanded by default
      const nameInput = screen.getByPlaceholderText('Your name');
      expect(nameInput).toBeInTheDocument();

      // Click to collapse
      const basicHeader = screen.getByText('Basic Information');
      fireEvent.click(basicHeader);

      // Name input should no longer be visible
      expect(screen.queryByPlaceholderText('Your name')).not.toBeInTheDocument();
    });
  });

  describe('Form Fields - Basic Information', () => {
    it('should display initial values from profile', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('he/him')).toBeInTheDocument();
    });

    it('should allow editing name field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByPlaceholderText('Your name');
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    });

    it('should allow editing email field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const emailInput = screen.getByPlaceholderText('your.email@example.com');
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });

      expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    });

    it('should allow editing phone number field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const phoneInput = screen.getByPlaceholderText('+1234567890');
      fireEvent.change(phoneInput, { target: { value: '+9876543210' } });

      expect(screen.getByDisplayValue('+9876543210')).toBeInTheDocument();
    });

    it('should allow editing pronouns field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const pronounsInput = screen.getByPlaceholderText('e.g., he/him, she/her, they/them');
      fireEvent.change(pronounsInput, { target: { value: 'they/them' } });

      expect(screen.getByDisplayValue('they/them')).toBeInTheDocument();
    });
  });

  describe('Form Fields - Profile Details', () => {
    it('should display initial profile detail values', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
      expect(screen.getByDisplayValue('180')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Tech Co')).toBeInTheDocument();
      expect(screen.getByDisplayValue('University')).toBeInTheDocument();
      expect(screen.getByDisplayValue('City')).toBeInTheDocument();
    });

    it('should allow editing bio field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const bioInput = screen.getByPlaceholderText('Tell us about yourself...');
      fireEvent.change(bioInput, { target: { value: 'Updated bio' } });

      expect(screen.getByDisplayValue('Updated bio')).toBeInTheDocument();
    });

    it('should allow editing job title field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const jobInput = screen.getByPlaceholderText('Software Engineer');
      fireEvent.change(jobInput, { target: { value: 'Senior Engineer' } });

      expect(screen.getByDisplayValue('Senior Engineer')).toBeInTheDocument();
    });

    it('should allow editing company field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const companyInput = screen.getByPlaceholderText('Company name');
      fireEvent.change(companyInput, { target: { value: 'New Company' } });

      expect(screen.getByDisplayValue('New Company')).toBeInTheDocument();
    });
  });

  describe('NumberInput Component', () => {
    it('should allow typing numbers in height field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const heightInput = screen.getByPlaceholderText('170');
      fireEvent.change(heightInput, { target: { value: '175' } });

      expect(screen.getByDisplayValue('175')).toBeInTheDocument();
    });

    it('should allow clearing height field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const heightInput = screen.getByPlaceholderText('170');
      fireEvent.change(heightInput, { target: { value: '' } });

      expect(heightInput).toHaveValue('');
    });

    it('should set fallback value on blur when height is empty', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const heightInput = screen.getByPlaceholderText('170');

      // Clear the field
      fireEvent.change(heightInput, { target: { value: '' } });
      expect(heightInput).toHaveValue('');

      // Blur should set to min value (100)
      fireEvent.blur(heightInput);

      waitFor(() => {
        expect(heightInput).toHaveValue('100');
      });
    });

    it('should reject non-numeric input in height field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const heightInput = screen.getByPlaceholderText('170');
      const initialValue = heightInput.getAttribute('value');

      // Try to input letters
      fireEvent.change(heightInput, { target: { value: 'abc' } });

      // Value should remain unchanged
      expect(heightInput).toHaveValue(initialValue);
    });

    it('should reject values exceeding max in height field', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const heightInput = screen.getByPlaceholderText('170');

      // Try to input value > 250 (max)
      fireEvent.change(heightInput, { target: { value: '300' } });

      // Value should not change to 300
      expect(heightInput).not.toHaveValue('300');
    });
  });

  describe('Form Fields - Lifestyle', () => {
    beforeEach(() => {
      // Expand lifestyle section for these tests
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );
      const lifestyleHeader = screen.getByText('Lifestyle');
      fireEvent.click(lifestyleHeader);
    });

    it('should display personality type field', () => {
      expect(screen.getByPlaceholderText('e.g., INTJ, ENFP')).toBeInTheDocument();
      expect(screen.getByDisplayValue('INTJ')).toBeInTheDocument();
    });

    it('should allow editing personality type', () => {
      const personalityInput = screen.getByPlaceholderText('e.g., INTJ, ENFP');
      fireEvent.change(personalityInput, { target: { value: 'ENFP' } });

      expect(screen.getByDisplayValue('ENFP')).toBeInTheDocument();
    });

    it('should limit personality type to 4 characters', () => {
      const personalityInput = screen.getByPlaceholderText('e.g., INTJ, ENFP');
      expect(personalityInput).toHaveAttribute('maxlength', '4');
    });
  });

  describe('Validation', () => {
    it('should show error when name is empty', async () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Clear the name field
      const nameInput = screen.getByPlaceholderText('Your name');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show error for invalid email format', async () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Enter invalid email
      const emailInput = screen.getByPlaceholderText('your.email@example.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Valid email is required')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show error for height out of range', async () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Set height to 50 (below min of 100)
      const heightInput = screen.getByPlaceholderText('170');
      fireEvent.change(heightInput, { target: { value: '50' } });

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Height must be between 100-250 cm')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show error for bio exceeding max length', async () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Create a bio longer than 500 characters
      const longBio = 'a'.repeat(501);
      const bioInput = screen.getByPlaceholderText('Tell us about yourself...');
      fireEvent.change(bioInput, { target: { value: longBio } });

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Bio must be less than 500 characters')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should clear error when user starts editing name field', async () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Clear the name field and submit to trigger error
      const nameInput = screen.getByPlaceholderText('Your name');
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      // Start editing again
      fireEvent.change(nameInput, { target: { value: 'J' } });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });

    it('should show red border on fields with errors', async () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Clear the name field
      const nameInput = screen.getByPlaceholderText('Your name');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(nameInput).toHaveStyle({ borderColor: 'red.500' });
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSave with correct data structure when form is valid', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Edit some fields
      const nameInput = screen.getByPlaceholderText('Your name');
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      const bioInput = screen.getByPlaceholderText('Tell us about yourself...');
      fireEvent.change(bioInput, { target: { value: 'Updated bio text' } });

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData).toHaveProperty('basicInfo');
      expect(savedData).toHaveProperty('profileDetails');
      expect(savedData).toHaveProperty('lifestyleInfo');
      expect(savedData).toHaveProperty('updateFields');

      expect(savedData.basicInfo.name).toBe('Jane Doe');
      expect(savedData.profileDetails.bio).toBe('Updated bio text');

      // Verify updateFields contains flat snake_case field names (as backend expects)
      expect(savedData.updateFields).toContain('name');
      expect(savedData.updateFields).toContain('email');
      expect(savedData.updateFields).toContain('phone_number');
      expect(savedData.updateFields).toContain('bio');
      expect(savedData.updateFields).toContain('job_title');
      expect(savedData.updateFields).toContain('drinking');
    });

    it('should send enum values as strings in submitted data', async () => {
      mockOnSave.mockResolvedValue(undefined);

      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const savedData = mockOnSave.mock.calls[0][0];

      // Check that enums are sent as strings (best practice for APIs)
      expect(typeof savedData.basicInfo.gender).toBe('string');
      expect(typeof savedData.lifestyleInfo.drinking).toBe('string');
      expect(typeof savedData.lifestyleInfo.smoking).toBe('string');
      expect(savedData.basicInfo.gender).toBe('GENDER_MALE');
      expect(savedData.lifestyleInfo.drinking).toBe('DRINKING_SOCIALLY');
    });

    it('should not call onSave when validation fails', async () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Clear required field
      const nameInput = screen.getByPlaceholderText('Your name');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    it('should call onCancel when cancel button is clicked', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onSave when cancel is clicked', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle profile with missing optional fields', () => {
      const minimalProfile: any = {
        user_id: '123',
        basic_info: {
          name: 'John',
          email: 'john@test.com',
          age: 25,
        },
      };

      customRender(
        <ProfileEditForm profile={minimalProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Should render without crashing
      expect(screen.getByText('Basic Information')).toBeInTheDocument();

      // Empty fields should have empty values
      expect(screen.getByPlaceholderText('Software Engineer')).toHaveValue('');
      expect(screen.getByPlaceholderText('Tell us about yourself...')).toHaveValue('');
    });

    it('should handle profile with camelCase field names', () => {
      const camelCaseProfile: any = {
        userId: '123',
        basicInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
        },
        profileDetails: {
          bio: 'Test bio',
          jobTitle: 'Engineer',
        },
        lifestyleInfo: {
          dietaryPreference: 'DIETARY_VEGETARIAN',
        },
      };

      customRender(
        <ProfileEditForm profile={camelCaseProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Should display values correctly
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should have form labels for all input fields', () => {
      customRender(
        <ProfileEditForm profile={mockProfile} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone Number')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByText('Pronouns')).toBeInTheDocument();
      expect(screen.getByText('Bio')).toBeInTheDocument();
      expect(screen.getByText('Height (cm)')).toBeInTheDocument();
    });
  });
});
