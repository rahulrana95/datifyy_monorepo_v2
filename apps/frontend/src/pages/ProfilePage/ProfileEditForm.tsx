/**
 * Profile Edit Form Component
 * Handles editing of user profile using Tanstack Form
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Box,
  Button,
  HStack,
  Input,
  SimpleGrid,
  Textarea,
  VStack,
  Text,
  Heading,
  Icon,
  NativeSelect,
} from '@chakra-ui/react';
import { useForm } from '@tanstack/react-form';
import { useState, useCallback, useEffect } from 'react';
import type { UserProfile } from '../../gen/user/v1/user_pb';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Note: We send enum values as strings (e.g., "GENDER_MALE", "DRINKING_SOCIALLY")
 * to the backend. The backend uses protojson.Unmarshal to parse these string enums.
 * This follows API best practices for readability and compatibility.
 */

// Chevron icon component
const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }): JSX.Element => (
  <Icon viewBox="0 0 24 24" boxSize={5}>
    <path
      fill="currentColor"
      d={isExpanded ? 'M7 14l5-5 5 5H7z' : 'M7 10l5 5 5-5H7z'}
    />
  </Icon>
);

// Collapsible section component
const CollapsibleSection = ({
  title,
  subtitle,
  children,
  icon,
  isExpanded,
  onToggle
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: string;
  isExpanded: boolean;
  onToggle: () => void;
}): JSX.Element => (
  <Box
    bg="white"
    borderRadius="lg"
    borderWidth="1px"
    borderColor="gray.200"
    overflow="hidden"
    boxShadow="sm"
  >
    <HStack
      p={4}
      cursor="pointer"
      onClick={onToggle}
      bg={isExpanded ? 'gray.50' : 'white'}
      _hover={{ bg: 'gray.50' }}
      transition="background 0.2s"
      justify="space-between"
    >
      <HStack gap={3}>
        {icon && <Text fontSize="xl">{icon}</Text>}
        <Box>
          <Heading size="sm" color="gray.800">{title}</Heading>
          {subtitle && <Text fontSize="xs" color="gray.600">{subtitle}</Text>}
        </Box>
      </HStack>
      <ChevronIcon isExpanded={isExpanded} />
    </HStack>
    {isExpanded && (
      <Box p={6} borderTop="1px" borderColor="gray.100">
        {children}
      </Box>
    )}
  </Box>
);

// Number input component that properly handles zero deletion
const NumberInput = ({
  value,
  onChange,
  min,
  max,
  placeholder,
  error,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  error?: string;
}): JSX.Element => {
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === '') {
      setDisplayValue('');
      return;
    }

    if (!/^\d+$/.test(newValue)) {
      return;
    }

    const numValue = parseInt(newValue, 10);

    if (max !== undefined && numValue > max) {
      return;
    }

    setDisplayValue(newValue);
    onChange(numValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (displayValue === '') {
      const fallbackValue = min ?? 0;
      setDisplayValue(fallbackValue.toString());
      onChange(fallbackValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      size="sm"
      px={3}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      borderColor={error ? 'red.500' : 'gray.200'}
      _focus={{
        borderColor: error ? 'red.500' : 'brand.500',
        boxShadow: error ? '0 0 0 1px var(--chakra-colors-red-500)' : '0 0 0 1px var(--chakra-colors-brand-500)',
      }}
    />
  );
};

// Simple form field wrapper
const FormField = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
  <Box>
    <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
      {label}
    </Text>
    {children}
    {error && <Text fontSize="xs" color="red.500" mt={1}>{error}</Text>}
  </Box>
);

export const ProfileEditForm = ({ profile, onSave, onCancel }: ProfileEditFormProps) => {
  // Extract data from profile (handle both snake_case and camelCase)
  const basicInfo = (profile as any)?.basic_info || profile.basicInfo;
  const profileDetails = (profile as any)?.profile_details || profile.profileDetails;
  const lifestyleInfo = (profile as any)?.lifestyle_info || profile.lifestyleInfo;
  const culturalInfo = (profile as any)?.cultural_info || profile.culturalInfo;
  const appearanceInfo = (profile as any)?.appearance_info || profile.appearanceInfo;
  const professionalInfo = (profile as any)?.professional_info || profile.professionalInfo;
  const familyInfo = (profile as any)?.family_info || profile.familyInfo;

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    profile: true,
    lifestyle: false,
    cultural: false,
    appearance: false,
    professional: false,
    family: false,
  });

  // Field errors state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Toggle section expansion
  const toggleSection = useCallback((section: 'basic' | 'profile' | 'lifestyle' | 'cultural' | 'appearance' | 'professional' | 'family') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Validation function
  const validateForm = useCallback((values: any): boolean => {
    const errors: Record<string, string> = {};

    // Height validation
    if (values.height && (values.height < 100 || values.height > 250)) {
      errors.height = 'Height must be between 100-250 cm';
    }

    // Bio validation
    if (values.bio && values.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    // Name validation
    if (!values.name || values.name.trim().length === 0) {
      errors.name = 'Name is required';
    }

    // Email validation
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Valid email is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const form = useForm({
    defaultValues: {
      // Basic Info - prioritize camelCase (from backend) over snake_case (for backwards compatibility)
      name: basicInfo?.name || '',
      email: basicInfo?.email || '',
      phoneNumber: basicInfo?.phoneNumber || basicInfo?.phone_number || '',
      gender: basicInfo?.gender || 'GENDER_UNSPECIFIED',
      pronouns: basicInfo?.pronouns || '',

      // Profile Details
      bio: profileDetails?.bio || '',
      height: profileDetails?.height || 0,
      jobTitle: profileDetails?.jobTitle || profileDetails?.job_title || '',
      company: profileDetails?.company || '',
      school: profileDetails?.school || '',
      hometown: profileDetails?.hometown || '',

      // Lifestyle Info
      drinking: lifestyleInfo?.drinking || 'DRINKING_UNSPECIFIED',
      smoking: lifestyleInfo?.smoking || 'SMOKING_UNSPECIFIED',
      workout: lifestyleInfo?.workout || 'WORKOUT_UNSPECIFIED',
      dietaryPreference: lifestyleInfo?.dietaryPreference || lifestyleInfo?.dietary_preference || 'DIETARY_UNSPECIFIED',
      religion: lifestyleInfo?.religion || 'RELIGION_UNSPECIFIED',
      religionImportance: lifestyleInfo?.religionImportance || lifestyleInfo?.religion_importance || 'IMPORTANCE_UNSPECIFIED',
      politicalView: lifestyleInfo?.politicalView || lifestyleInfo?.political_view || 'POLITICAL_UNSPECIFIED',
      pets: lifestyleInfo?.pets || 'PET_UNSPECIFIED',
      children: lifestyleInfo?.children || 'CHILDREN_UNSPECIFIED',
      personalityType: lifestyleInfo?.personalityType || lifestyleInfo?.personality_type || '',
      communicationStyle: lifestyleInfo?.communicationStyle || lifestyleInfo?.communication_style || 'COMMUNICATION_UNSPECIFIED',
      loveLanguage: lifestyleInfo?.loveLanguage || lifestyleInfo?.love_language || 'LOVE_LANGUAGE_UNSPECIFIED',
      sleepSchedule: lifestyleInfo?.sleepSchedule || lifestyleInfo?.sleep_schedule || 'SLEEP_SCHEDULE_UNSPECIFIED',

      // Cultural Info
      motherTongue: culturalInfo?.motherTongue || culturalInfo?.mother_tongue || '',
      nationality: culturalInfo?.nationality || '',
      caste: culturalInfo?.caste || '',
      subCaste: culturalInfo?.subCaste || culturalInfo?.sub_caste || '',
      willingToRelocate: culturalInfo?.willingToRelocate ?? culturalInfo?.willing_to_relocate ?? false,

      // Appearance Info
      bodyType: appearanceInfo?.bodyType || appearanceInfo?.body_type || 'BODY_TYPE_UNSPECIFIED',
      complexion: appearanceInfo?.complexion || 'COMPLEXION_UNSPECIFIED',
      hairColor: appearanceInfo?.hairColor || appearanceInfo?.hair_color || 'HAIR_COLOR_UNSPECIFIED',
      eyeColor: appearanceInfo?.eyeColor || appearanceInfo?.eye_color || 'EYE_COLOR_UNSPECIFIED',
      hasTattoos: appearanceInfo?.hasTattoos ?? appearanceInfo?.has_tattoos ?? false,
      hasPiercings: appearanceInfo?.hasPiercings ?? appearanceInfo?.has_piercings ?? false,

      // Professional Info
      employmentType: professionalInfo?.employmentType || professionalInfo?.employment_type || 'EMPLOYMENT_TYPE_UNSPECIFIED',
      industry: professionalInfo?.industry || '',
      yearsOfExperience: professionalInfo?.yearsOfExperience ?? professionalInfo?.years_of_experience ?? 0,
      highestEducation: professionalInfo?.highestEducation || professionalInfo?.highest_education || 'EDUCATION_LEVEL_UNSPECIFIED',
      ownsProperty: professionalInfo?.ownsProperty ?? professionalInfo?.owns_property ?? false,
      ownsVehicle: professionalInfo?.ownsVehicle ?? professionalInfo?.owns_vehicle ?? false,

      // Family Info
      familyType: familyInfo?.familyType || familyInfo?.family_type || 'FAMILY_TYPE_UNSPECIFIED',
      numSiblings: familyInfo?.numSiblings ?? familyInfo?.num_siblings ?? 0,
      fatherOccupation: familyInfo?.fatherOccupation || familyInfo?.father_occupation || '',
      motherOccupation: familyInfo?.motherOccupation || familyInfo?.mother_occupation || '',
      livingSituation: familyInfo?.livingSituation || familyInfo?.living_situation || 'LIVING_SITUATION_UNSPECIFIED',
      familyLocation: familyInfo?.familyLocation || familyInfo?.family_location || '',
      aboutFamily: familyInfo?.aboutFamily || familyInfo?.about_family || '',
    },
    onSubmit: async ({ value }) => {
      // Validate form before submission
      if (!validateForm(value)) {
        return;
      }

      // Transform form values to camelCase format (as per src/gen TypeScript definitions)
      // Send enum values as strings (best practice for readability and compatibility)
      // Backend will parse camelCase field names to snake_case as needed
      const updates: any = {
        basicInfo: {
          name: value.name,
          email: value.email,
          phoneNumber: value.phoneNumber,
          gender: value.gender, // Send as string: "GENDER_MALE"
          pronouns: value.pronouns,
          age: basicInfo?.age || 0,
        },
        profileDetails: {
          bio: value.bio,
          height: value.height,
          jobTitle: value.jobTitle,
          company: value.company,
          school: value.school,
          hometown: value.hometown,
        },
        lifestyleInfo: {
          drinking: value.drinking, // Send as string: "DRINKING_SOCIALLY"
          smoking: value.smoking,
          workout: value.workout,
          dietaryPreference: value.dietaryPreference,
          religion: value.religion,
          religionImportance: value.religionImportance,
          politicalView: value.politicalView,
          pets: value.pets,
          children: value.children,
          personalityType: value.personalityType,
          communicationStyle: value.communicationStyle,
          loveLanguage: value.loveLanguage,
          sleepSchedule: value.sleepSchedule,
        },
        culturalInfo: {
          motherTongue: value.motherTongue,
          nationality: value.nationality,
          caste: value.caste,
          subCaste: value.subCaste,
          willingToRelocate: value.willingToRelocate,
        },
        appearanceInfo: {
          bodyType: value.bodyType,
          complexion: value.complexion,
          hairColor: value.hairColor,
          eyeColor: value.eyeColor,
          hasTattoos: value.hasTattoos,
          hasPiercings: value.hasPiercings,
        },
        professionalInfo: {
          employmentType: value.employmentType,
          industry: value.industry,
          yearsOfExperience: value.yearsOfExperience,
          highestEducation: value.highestEducation,
          ownsProperty: value.ownsProperty,
          ownsVehicle: value.ownsVehicle,
        },
        familyInfo: {
          familyType: value.familyType,
          numSiblings: value.numSiblings,
          fatherOccupation: value.fatherOccupation,
          motherOccupation: value.motherOccupation,
          livingSituation: value.livingSituation,
          familyLocation: value.familyLocation,
          aboutFamily: value.aboutFamily,
        },
        // Add updateFields to specify which fields to update
        // Backend expects flat snake_case field names (not nested paths)
        updateFields: [
          'name',
          'email',
          'phone_number',
          'gender',
          'pronouns',
          'bio',
          'height',
          'job_title',
          'company',
          'school',
          'hometown',
          'drinking',
          'smoking',
          'workout',
          'dietary_preference',
          'religion',
          'religion_importance',
          'political_view',
          'pets',
          'children',
          'personality_type',
          'communication_style',
          'love_language',
          'sleep_schedule',
          'mother_tongue',
          'nationality',
          'caste',
          'sub_caste',
          'willing_to_relocate',
          'body_type',
          'complexion',
          'hair_color',
          'eye_color',
          'has_tattoos',
          'has_piercings',
          'employment_type',
          'industry',
          'years_of_experience',
          'highest_education',
          'owns_property',
          'owns_vehicle',
          'family_type',
          'num_siblings',
          'father_occupation',
          'mother_occupation',
          'living_situation',
          'family_location',
          'about_family',
        ],
      };

      await onSave(updates);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <VStack align="stretch" gap={4}>
        {/* Basic Information Section */}
        <CollapsibleSection
          title="Basic Information"
          subtitle="Name, contact, gender"
          icon="👤"
          isExpanded={expandedSections.basic}
          onToggle={() => toggleSection('basic')}
        >
          <VStack align="stretch" gap={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <form.Field name="name">
              {(field: any) => (
                <FormField label="Name" error={fieldErrors.name}>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setFieldErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Your name"
                    px={4}
                    borderColor={fieldErrors.name ? 'red.500' : 'gray.200'}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="email">
              {(field: any) => (
                <FormField label="Email" error={fieldErrors.email}>
                  <Input
                    type="email"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="your.email@example.com"
                    px={4}
                    borderColor={fieldErrors.email ? 'red.500' : 'gray.200'}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="phoneNumber">
              {(field: any) => (
                <FormField label="Phone Number">
                  <Input
                    type="tel"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+1234567890"
                    px={4}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="gender">
              {(field: any) => (
                <FormField label="Gender">
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    >
                      <option value="GENDER_UNSPECIFIED">Not specified</option>
                      <option value="GENDER_MALE">Male</option>
                      <option value="GENDER_FEMALE">Female</option>
                      <option value="GENDER_NON_BINARY">Non-binary</option>
                      <option value="GENDER_OTHER">Other</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </FormField>
              )}
            </form.Field>

            <form.Field name="pronouns">
              {(field: any) => (
                <FormField label="Pronouns">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., he/him, she/her, they/them"
                    px={4}
                    size="sm"
                  />
                </FormField>
              )}
            </form.Field>
          </SimpleGrid>
          </VStack>
        </CollapsibleSection>

        {/* Profile Details Section */}
        <CollapsibleSection
          title="Profile Details"
          subtitle="Bio, work, education"
          icon="📝"
          isExpanded={expandedSections.profile}
          onToggle={() => toggleSection('profile')}
        >
          <VStack align="stretch" gap={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <form.Field name="height">
              {(field: any) => (
                <FormField label="Height (cm)" error={fieldErrors.height}>
                  <NumberInput
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v);
                      setFieldErrors(prev => ({ ...prev, height: '' }));
                    }}
                    min={100}
                    max={250}
                    placeholder="170"
                    error={fieldErrors.height}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="jobTitle">
              {(field: any) => (
                <FormField label="Job Title">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Software Engineer"
                    px={4}
                    size="sm"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="company">
              {(field: any) => (
                <FormField label="Company">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Company name"
                    px={4}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="school">
              {(field: any) => (
                <FormField label="School">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="University name"
                    px={4}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="hometown">
              {(field: any) => (
                <FormField label="Hometown">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="City, Country"
                    px={4}
                    size="sm"
                  />
                </FormField>
              )}
            </form.Field>

            <Box gridColumn={{ base: '1', md: '1 / -1' }}>
              <form.Field name="bio">
                {(field: any) => (
                  <FormField label="Bio" error={fieldErrors.bio}>
                    <Textarea
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setFieldErrors(prev => ({ ...prev, bio: '' }));
                      }}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      borderColor={fieldErrors.bio ? 'red.500' : 'gray.200'}
                    />
                  </FormField>
                )}
              </form.Field>
            </Box>
          </SimpleGrid>
          </VStack>
        </CollapsibleSection>

        {/* Lifestyle Section */}
        <CollapsibleSection
          title="Lifestyle"
          subtitle="Habits, preferences, personality"
          icon="🌿"
          isExpanded={expandedSections.lifestyle}
          onToggle={() => toggleSection('lifestyle')}
        >
          <VStack align="stretch" gap={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {['drinking', 'smoking', 'workout', 'dietaryPreference', 'religion', 'religionImportance',
              'politicalView', 'pets', 'children', 'communicationStyle', 'loveLanguage', 'sleepSchedule'].map((fieldName) => (
              <form.Field key={fieldName} name={fieldName as any}>
                {(field: any) => {
                  const labels: Record<string, string> = {
                    drinking: 'Drinking',
                    smoking: 'Smoking',
                    workout: 'Workout',
                    dietaryPreference: 'Dietary Preference',
                    religion: 'Religion',
                    religionImportance: 'Religion Importance',
                    politicalView: 'Political View',
                    pets: 'Pets',
                    children: 'Children',
                    communicationStyle: 'Communication Style',
                    loveLanguage: 'Love Language',
                    sleepSchedule: 'Sleep Schedule',
                  };

                  const options: Record<string, Array<{ value: string; label: string }>> = {
                    drinking: [
                      { value: 'DRINKING_UNSPECIFIED', label: 'Not specified' },
                      { value: 'DRINKING_NEVER', label: 'Never' },
                      { value: 'DRINKING_RARELY', label: 'Rarely' },
                      { value: 'DRINKING_SOCIALLY', label: 'Socially' },
                      { value: 'DRINKING_OFTEN', label: 'Often' },
                    ],
                    smoking: [
                      { value: 'SMOKING_UNSPECIFIED', label: 'Not specified' },
                      { value: 'SMOKING_NEVER', label: 'Never' },
                      { value: 'SMOKING_RARELY', label: 'Rarely' },
                      { value: 'SMOKING_SOCIALLY', label: 'Socially' },
                      { value: 'SMOKING_OFTEN', label: 'Often' },
                    ],
                    workout: [
                      { value: 'WORKOUT_UNSPECIFIED', label: 'Not specified' },
                      { value: 'WORKOUT_NEVER', label: 'Never' },
                      { value: 'WORKOUT_RARELY', label: 'Rarely' },
                      { value: 'WORKOUT_SOMETIMES', label: 'Sometimes' },
                      { value: 'WORKOUT_OFTEN', label: 'Often' },
                      { value: 'WORKOUT_DAILY', label: 'Daily' },
                    ],
                    dietaryPreference: [
                      { value: 'DIETARY_UNSPECIFIED', label: 'Not specified' },
                      { value: 'DIETARY_OMNIVORE', label: 'Omnivore' },
                      { value: 'DIETARY_VEGETARIAN', label: 'Vegetarian' },
                      { value: 'DIETARY_VEGAN', label: 'Vegan' },
                      { value: 'DIETARY_PESCATARIAN', label: 'Pescatarian' },
                      { value: 'DIETARY_HALAL', label: 'Halal' },
                      { value: 'DIETARY_KOSHER', label: 'Kosher' },
                    ],
                    religion: [
                      { value: 'RELIGION_UNSPECIFIED', label: 'Not specified' },
                      { value: 'RELIGION_CHRISTIAN', label: 'Christian' },
                      { value: 'RELIGION_MUSLIM', label: 'Muslim' },
                      { value: 'RELIGION_JEWISH', label: 'Jewish' },
                      { value: 'RELIGION_HINDU', label: 'Hindu' },
                      { value: 'RELIGION_BUDDHIST', label: 'Buddhist' },
                      { value: 'RELIGION_ATHEIST', label: 'Atheist' },
                      { value: 'RELIGION_AGNOSTIC', label: 'Agnostic' },
                      { value: 'RELIGION_OTHER', label: 'Other' },
                    ],
                    religionImportance: [
                      { value: 'IMPORTANCE_UNSPECIFIED', label: 'Not specified' },
                      { value: 'IMPORTANCE_NOT_IMPORTANT', label: 'Not important' },
                      { value: 'IMPORTANCE_SOMEWHAT', label: 'Somewhat' },
                      { value: 'IMPORTANCE_IMPORTANT', label: 'Important' },
                      { value: 'IMPORTANCE_VERY_IMPORTANT', label: 'Very important' },
                    ],
                    politicalView: [
                      { value: 'POLITICAL_UNSPECIFIED', label: 'Not specified' },
                      { value: 'POLITICAL_LIBERAL', label: 'Liberal' },
                      { value: 'POLITICAL_MODERATE', label: 'Moderate' },
                      { value: 'POLITICAL_CONSERVATIVE', label: 'Conservative' },
                      { value: 'POLITICAL_APOLITICAL', label: 'Apolitical' },
                    ],
                    pets: [
                      { value: 'PET_UNSPECIFIED', label: 'Not specified' },
                      { value: 'PET_NONE', label: 'None' },
                      { value: 'PET_DOG', label: 'Dog' },
                      { value: 'PET_CAT', label: 'Cat' },
                      { value: 'PET_BOTH', label: 'Both' },
                      { value: 'PET_OTHER', label: 'Other' },
                    ],
                    children: [
                      { value: 'CHILDREN_UNSPECIFIED', label: 'Not specified' },
                      { value: 'CHILDREN_WANT', label: 'Want children' },
                      { value: 'CHILDREN_DONT_WANT', label: "Don't want" },
                      { value: 'CHILDREN_HAVE_AND_WANT_MORE', label: 'Have and want more' },
                      { value: 'CHILDREN_HAVE_DONT_WANT_MORE', label: "Have, don't want more" },
                      { value: 'CHILDREN_NOT_SURE', label: 'Not sure' },
                    ],
                    communicationStyle: [
                      { value: 'COMMUNICATION_UNSPECIFIED', label: 'Not specified' },
                      { value: 'COMMUNICATION_BIG_TIME_TEXTER', label: 'Big time texter' },
                      { value: 'COMMUNICATION_PHONE_CALLER', label: 'Phone caller' },
                      { value: 'COMMUNICATION_VIDEO_CHATTER', label: 'Video chatter' },
                      { value: 'COMMUNICATION_IN_PERSON', label: 'In person' },
                    ],
                    loveLanguage: [
                      { value: 'LOVE_LANGUAGE_UNSPECIFIED', label: 'Not specified' },
                      { value: 'LOVE_LANGUAGE_WORDS_OF_AFFIRMATION', label: 'Words of affirmation' },
                      { value: 'LOVE_LANGUAGE_QUALITY_TIME', label: 'Quality time' },
                      { value: 'LOVE_LANGUAGE_RECEIVING_GIFTS', label: 'Receiving gifts' },
                      { value: 'LOVE_LANGUAGE_ACTS_OF_SERVICE', label: 'Acts of service' },
                      { value: 'LOVE_LANGUAGE_PHYSICAL_TOUCH', label: 'Physical touch' },
                    ],
                    sleepSchedule: [
                      { value: 'SLEEP_SCHEDULE_UNSPECIFIED', label: 'Not specified' },
                      { value: 'SLEEP_SCHEDULE_EARLY_BIRD', label: 'Early bird' },
                      { value: 'SLEEP_SCHEDULE_NIGHT_OWL', label: 'Night owl' },
                      { value: 'SLEEP_SCHEDULE_IN_A_SPECTRUM', label: 'In a spectrum' },
                    ],
                  };

                  return (
                    <FormField label={labels[fieldName]}>
                      <select
                        value={field.state.value as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '16px',
                        }}
                      >
                        {options[fieldName]?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  );
                }}
              </form.Field>
            ))}

            <form.Field name="personalityType">
              {(field: any) => (
                <FormField label="Personality Type (MBTI)">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., INTJ, ENFP"
                    maxLength={4}
                    px={4}
                    size="sm"
                  />
                </FormField>
              )}
            </form.Field>
          </SimpleGrid>
          </VStack>
        </CollapsibleSection>

        {/* Cultural Info Section */}
        <CollapsibleSection
          title="Cultural & Matrimonial Information"
          subtitle="Mother tongue, nationality, community"
          icon="🌏"
          isExpanded={expandedSections.cultural}
          onToggle={() => toggleSection('cultural')}
        >
          <VStack align="stretch" gap={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <form.Field name="motherTongue">
                {(field: any) => (
                  <FormField label="Mother Tongue">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Hindi, Tamil, English"
                      px={4}
                      size="sm"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="nationality">
                {(field: any) => (
                  <FormField label="Nationality">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Indian, American"
                      px={4}
                      size="sm"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="caste">
                {(field: any) => (
                  <FormField label="Caste/Community">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter caste or community"
                      px={4}
                      size="sm"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="subCaste">
                {(field: any) => (
                  <FormField label="Sub-Caste">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter sub-caste (optional)"
                      px={4}
                      size="sm"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="willingToRelocate">
                {(field: any) => (
                  <FormField label="Willing to Relocate">
                    <HStack gap={4}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <Text fontSize="sm">Yes, willing to relocate</Text>
                      </label>
                    </HStack>
                  </FormField>
                )}
              </form.Field>
            </SimpleGrid>
          </VStack>
        </CollapsibleSection>

        {/* Appearance Section */}
        <CollapsibleSection
          title="Appearance"
          subtitle="Physical attributes and features"
          icon="👁️"
          isExpanded={expandedSections.appearance}
          onToggle={() => toggleSection('appearance')}
        >
          <VStack align="stretch" gap={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <form.Field name="bodyType">
                {(field: any) => (
                  <FormField label="Body Type">
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      <option value="BODY_TYPE_UNSPECIFIED">Not specified</option>
                      <option value="BODY_TYPE_SLIM">Slim</option>
                      <option value="BODY_TYPE_ATHLETIC">Athletic</option>
                      <option value="BODY_TYPE_AVERAGE">Average</option>
                      <option value="BODY_TYPE_FEW_EXTRA_POUNDS">Few extra pounds</option>
                      <option value="BODY_TYPE_HEAVYSET">Heavyset</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="complexion">
                {(field: any) => (
                  <FormField label="Complexion">
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      <option value="COMPLEXION_UNSPECIFIED">Not specified</option>
                      <option value="COMPLEXION_FAIR">Fair</option>
                      <option value="COMPLEXION_WHEATISH">Wheatish</option>
                      <option value="COMPLEXION_MEDIUM">Medium</option>
                      <option value="COMPLEXION_DARK">Dark</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="hairColor">
                {(field: any) => (
                  <FormField label="Hair Color">
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      <option value="HAIR_COLOR_UNSPECIFIED">Not specified</option>
                      <option value="HAIR_COLOR_BLACK">Black</option>
                      <option value="HAIR_COLOR_BROWN">Brown</option>
                      <option value="HAIR_COLOR_BLONDE">Blonde</option>
                      <option value="HAIR_COLOR_RED">Red</option>
                      <option value="HAIR_COLOR_GRAY">Gray</option>
                      <option value="HAIR_COLOR_OTHER">Other</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="eyeColor">
                {(field: any) => (
                  <FormField label="Eye Color">
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      <option value="EYE_COLOR_UNSPECIFIED">Not specified</option>
                      <option value="EYE_COLOR_BROWN">Brown</option>
                      <option value="EYE_COLOR_BLUE">Blue</option>
                      <option value="EYE_COLOR_GREEN">Green</option>
                      <option value="EYE_COLOR_HAZEL">Hazel</option>
                      <option value="EYE_COLOR_GRAY">Gray</option>
                      <option value="EYE_COLOR_OTHER">Other</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="hasTattoos">
                {(field: any) => (
                  <FormField label="Tattoos">
                    <HStack gap={4}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <Text fontSize="sm">Has tattoos</Text>
                      </label>
                    </HStack>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="hasPiercings">
                {(field: any) => (
                  <FormField label="Piercings">
                    <HStack gap={4}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <Text fontSize="sm">Has piercings</Text>
                      </label>
                    </HStack>
                  </FormField>
                )}
              </form.Field>
            </SimpleGrid>
          </VStack>
        </CollapsibleSection>

        {/* Professional Section */}
        <CollapsibleSection
          title="Professional & Financial"
          subtitle="Career, education, assets"
          icon="💼"
          isExpanded={expandedSections.professional}
          onToggle={() => toggleSection('professional')}
        >
          <VStack align="stretch" gap={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <form.Field name="employmentType">
                {(field: any) => (
                  <FormField label="Employment Type">
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      <option value="EMPLOYMENT_TYPE_UNSPECIFIED">Not specified</option>
                      <option value="EMPLOYMENT_TYPE_EMPLOYED">Employed</option>
                      <option value="EMPLOYMENT_TYPE_SELF_EMPLOYED">Self-employed</option>
                      <option value="EMPLOYMENT_TYPE_BUSINESS">Business</option>
                      <option value="EMPLOYMENT_TYPE_STUDENT">Student</option>
                      <option value="EMPLOYMENT_TYPE_UNEMPLOYED">Unemployed</option>
                      <option value="EMPLOYMENT_TYPE_RETIRED">Retired</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="industry">
                {(field: any) => (
                  <FormField label="Industry">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Technology, Healthcare"
                      px={4}
                      size="sm"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="yearsOfExperience">
                {(field: any) => (
                  <FormField label="Years of Experience">
                    <NumberInput
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v)}
                      min={0}
                      max={60}
                      placeholder="0"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="highestEducation">
                {(field: any) => (
                  <FormField label="Highest Education">
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      <option value="EDUCATION_LEVEL_UNSPECIFIED">Not specified</option>
                      <option value="EDUCATION_LEVEL_HIGH_SCHOOL">High School</option>
                      <option value="EDUCATION_LEVEL_BACHELORS">Bachelors</option>
                      <option value="EDUCATION_LEVEL_MASTERS">Masters</option>
                      <option value="EDUCATION_LEVEL_DOCTORATE">Doctorate</option>
                      <option value="EDUCATION_LEVEL_DIPLOMA">Diploma</option>
                      <option value="EDUCATION_LEVEL_PROFESSIONAL">Professional</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="ownsProperty">
                {(field: any) => (
                  <FormField label="Property Ownership">
                    <HStack gap={4}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <Text fontSize="sm">Owns property</Text>
                      </label>
                    </HStack>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="ownsVehicle">
                {(field: any) => (
                  <FormField label="Vehicle Ownership">
                    <HStack gap={4}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <Text fontSize="sm">Owns vehicle</Text>
                      </label>
                    </HStack>
                  </FormField>
                )}
              </form.Field>
            </SimpleGrid>
          </VStack>
        </CollapsibleSection>

        {/* Family Info Section */}
        <CollapsibleSection
          title="Family Background"
          subtitle="Family details and background"
          icon="👨‍👩‍👧‍👦"
          isExpanded={expandedSections.family}
          onToggle={() => toggleSection('family')}
        >
          <VStack align="stretch" gap={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <form.Field name="familyType">
                {(field: any) => (
                  <FormField label="Family Type">
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      <option value="FAMILY_TYPE_UNSPECIFIED">Not specified</option>
                      <option value="FAMILY_TYPE_NUCLEAR">Nuclear</option>
                      <option value="FAMILY_TYPE_JOINT">Joint</option>
                      <option value="FAMILY_TYPE_EXTENDED">Extended</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="numSiblings">
                {(field: any) => (
                  <FormField label="Number of Siblings">
                    <NumberInput
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v)}
                      min={0}
                      max={20}
                      placeholder="0"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="fatherOccupation">
                {(field: any) => (
                  <FormField label="Father's Occupation">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Engineer, Teacher"
                      px={4}
                      size="sm"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="motherOccupation">
                {(field: any) => (
                  <FormField label="Mother's Occupation">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Doctor, Homemaker"
                      px={4}
                      size="sm"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="livingSituation">
                {(field: any) => (
                  <FormField label="Living Situation">
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      <option value="LIVING_SITUATION_UNSPECIFIED">Not specified</option>
                      <option value="LIVING_SITUATION_WITH_FAMILY">With family</option>
                      <option value="LIVING_SITUATION_ALONE">Alone</option>
                      <option value="LIVING_SITUATION_WITH_ROOMMATES">With roommates</option>
                      <option value="LIVING_SITUATION_WITH_PARTNER">With partner</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="familyLocation">
                {(field: any) => (
                  <FormField label="Family Location">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="City, State/Country"
                      px={4}
                      size="sm"
                    />
                  </FormField>
                )}
              </form.Field>

              <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                <form.Field name="aboutFamily">
                  {(field: any) => (
                    <FormField label="About Family">
                      <Textarea
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Tell us about your family..."
                        rows={4}
                      />
                    </FormField>
                  )}
                </form.Field>
              </Box>
            </SimpleGrid>
          </VStack>
        </CollapsibleSection>

        {/* Action Buttons */}
        <HStack justify="flex-end" gap={4}>
          <Button
            bg="white"
            borderWidth="1px"
            borderColor="brand.500"
            color="brand.600"
            _hover={{ bg: 'brand.50', borderColor: 'brand.600' }}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
            _active={{ bg: 'brand.700' }}
          >
            Save Changes
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
