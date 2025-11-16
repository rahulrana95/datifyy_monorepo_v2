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
} from '@chakra-ui/react';
import { useForm } from '@tanstack/react-form';
import type { UserProfile } from '../../gen/user/v1/user_pb';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

// Simple form field wrapper
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box>
    <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
      {label}
    </Text>
    {children}
  </Box>
);

export const ProfileEditForm = ({ profile, onSave, onCancel }: ProfileEditFormProps) => {
  // Extract data from profile (handle both snake_case and camelCase)
  const basicInfo = (profile as any)?.basic_info || profile.basicInfo;
  const profileDetails = (profile as any)?.profile_details || profile.profileDetails;
  const lifestyleInfo = (profile as any)?.lifestyle_info || profile.lifestyleInfo;

  const form = useForm({
    defaultValues: {
      // Basic Info
      name: basicInfo?.name || '',
      email: basicInfo?.email || '',
      phoneNumber: basicInfo?.phone_number || basicInfo?.phoneNumber || '',
      gender: basicInfo?.gender || 'GENDER_UNSPECIFIED',
      pronouns: basicInfo?.pronouns || '',

      // Profile Details
      bio: profileDetails?.bio || '',
      height: profileDetails?.height || 0,
      jobTitle: profileDetails?.job_title || profileDetails?.jobTitle || '',
      company: profileDetails?.company || '',
      school: profileDetails?.school || '',
      hometown: profileDetails?.hometown || '',

      // Lifestyle Info
      drinking: lifestyleInfo?.drinking || 'DRINKING_UNSPECIFIED',
      smoking: lifestyleInfo?.smoking || 'SMOKING_UNSPECIFIED',
      workout: lifestyleInfo?.workout || 'WORKOUT_UNSPECIFIED',
      dietaryPreference: lifestyleInfo?.dietary_preference || lifestyleInfo?.dietaryPreference || 'DIETARY_UNSPECIFIED',
      religion: lifestyleInfo?.religion || 'RELIGION_UNSPECIFIED',
      religionImportance: lifestyleInfo?.religion_importance || lifestyleInfo?.religionImportance || 'IMPORTANCE_UNSPECIFIED',
      politicalView: lifestyleInfo?.political_view || lifestyleInfo?.politicalView || 'POLITICAL_UNSPECIFIED',
      pets: lifestyleInfo?.pets || 'PET_UNSPECIFIED',
      children: lifestyleInfo?.children || 'CHILDREN_UNSPECIFIED',
      personalityType: lifestyleInfo?.personality_type || lifestyleInfo?.personalityType || '',
      communicationStyle: lifestyleInfo?.communication_style || lifestyleInfo?.communicationStyle || 'COMMUNICATION_UNSPECIFIED',
      loveLanguage: lifestyleInfo?.love_language || lifestyleInfo?.loveLanguage || 'LOVE_LANGUAGE_UNSPECIFIED',
      sleepSchedule: lifestyleInfo?.sleep_schedule || lifestyleInfo?.sleepSchedule || 'SLEEP_SCHEDULE_UNSPECIFIED',
    },
    onSubmit: async ({ value }) => {
      // Transform form values back to UserProfile structure
      const updates: any = {
        basic_info: {
          name: value.name,
          email: value.email,
          phone_number: value.phoneNumber,
          gender: value.gender,
          pronouns: value.pronouns,
          age: basicInfo?.age || 0,
        },
        profile_details: {
          bio: value.bio,
          height: value.height,
          job_title: value.jobTitle,
          company: value.company,
          school: value.school,
          hometown: value.hometown,
        },
        lifestyle_info: {
          drinking: value.drinking,
          smoking: value.smoking,
          workout: value.workout,
          dietary_preference: value.dietaryPreference,
          religion: value.religion,
          religion_importance: value.religionImportance,
          political_view: value.politicalView,
          pets: value.pets,
          children: value.children,
          personality_type: value.personalityType,
          communication_style: value.communicationStyle,
          love_language: value.loveLanguage,
          sleep_schedule: value.sleepSchedule,
        },
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
      <VStack align="stretch" gap={6}>
        {/* Basic Information Section */}
        <Box
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          p={{ base: 4, md: 8 }}
          boxShadow="md"
        >
          <Text fontSize="lg" fontWeight="bold" mb={6}>Basic Information</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <form.Field name="name">
              {(field: any) => (
                <FormField label="Name">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your name"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="email">
              {(field: any) => (
                <FormField label="Email">
                  <Input
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="your.email@example.com"
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
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="gender">
              {(field: any) => (
                <FormField label="Gender">
                  <select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '16px',
                    }}
                  >
                    <option value="GENDER_UNSPECIFIED">Not specified</option>
                    <option value="GENDER_MALE">Male</option>
                    <option value="GENDER_FEMALE">Female</option>
                    <option value="GENDER_NON_BINARY">Non-binary</option>
                    <option value="GENDER_OTHER">Other</option>
                  </select>
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
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="height">
              {(field: any) => (
                <FormField label="Height (cm)">
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="170"
                  />
                </FormField>
              )}
            </form.Field>

            <Box gridColumn={{ base: '1', md: '1 / -1' }}>
              <form.Field name="bio">
                {(field: any) => (
                  <FormField label="Bio">
                    <Textarea
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </FormField>
                )}
              </form.Field>
            </Box>

            <form.Field name="jobTitle">
              {(field: any) => (
                <FormField label="Job Title">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Software Engineer"
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
                  />
                </FormField>
              )}
            </form.Field>
          </SimpleGrid>
        </Box>

        {/* Lifestyle Section */}
        <Box
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          p={{ base: 4, md: 8 }}
          boxShadow="md"
        >
          <Text fontSize="lg" fontWeight="bold" mb={6}>Lifestyle</Text>
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
                  />
                </FormField>
              )}
            </form.Field>
          </SimpleGrid>
        </Box>

        {/* Action Buttons */}
        <HStack justify="flex-end" gap={4}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue">
            Save Changes
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
