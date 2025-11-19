/**
 * Partner Preferences Page
 * Manage partner preference settings
 */

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Spinner,
  Button,
  Badge,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Header } from '../../shared/components/Header/Header';
import { useUserStore } from '../../stores/userStore';
import { PartnerPreferencesEditForm } from './PartnerPreferencesEditForm';
import type { PartnerPreferences } from '../../gen/user/v1/user_pb';

export const PartnerPreferencesPage = (): JSX.Element => {
  const { profile, isLoading, error, fetchProfile, updatePartnerPreferences } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSave = async (updates: PartnerPreferences): Promise<void> => {
    try {
      await updatePartnerPreferences(updates);
      setIsEditing(false);
      setNotification({
        type: 'success',
        message: 'Your partner preferences have been updated successfully.',
      });
    } catch (err) {
      console.error('Failed to update partner preferences:', err);
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'An error occurred while saving your preferences.',
      });
    }
  };

  const handleCancel = (): void => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="bg">
        <Header />
        <Container maxW="1200px" py={8}>
          <VStack align="center" justify="center" minH="400px">
            <Spinner size="xl" color="brand.500" />
            <Text color="fg.muted">Loading partner preferences...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="bg">
        <Header />
        <Container maxW="1200px" py={8}>
          <Box
            bg="red.50"
            borderColor="red.300"
            borderWidth="1px"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="red.700" mb={2}>
              Error Loading Partner Preferences
            </Heading>
            <Text color="red.600">{error}</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  const partnerPrefs = profile?.partnerPreferences;

  // Enum display maps
  const enumMaps: Record<string, Record<number, string>> = {
    'RELATIONSHIP_GOAL': {
      1: 'Casual', 2: 'Serious', 3: 'Marriage', 4: 'Friendship',
    },
    'EDUCATION': {
      1: 'High School', 2: 'Associate', 3: 'Bachelor', 4: 'Master', 5: 'Doctorate', 6: 'Professional',
    },
    'OCCUPATION': {
      1: 'Software', 2: 'Healthcare', 3: 'Finance', 4: 'Education', 5: 'Engineering', 6: 'Legal', 7: 'Marketing', 8: 'Business',
    },
    'RELIGION': {
      1: 'Hindu', 2: 'Muslim', 3: 'Christian', 4: 'Sikh', 5: 'Buddhist', 6: 'Jain', 7: 'Jewish', 8: 'Other',
    },
    'CHILDREN': {
      1: 'Has Children', 2: 'No Children', 3: 'Wants Children', 4: 'Open',
    },
    'DRINKING': {
      1: 'Never', 2: 'Rarely', 3: 'Socially', 4: 'Regularly',
    },
    'SMOKING': {
      1: 'Never', 2: 'Occasionally', 3: 'Regularly', 4: 'Quitting',
    },
    'DIETARY': {
      1: 'Vegetarian', 2: 'Non-Veg', 3: 'Vegan', 4: 'Eggetarian',
    },
    'PET': {
      1: 'Dogs', 2: 'Cats', 3: 'Birds', 4: 'Fish', 5: 'Other', 6: 'None',
    },
    'WORKOUT': {
      1: 'Never', 2: 'Occasionally', 3: 'Regularly', 4: 'Daily',
    },
    'COMMUNICATION': {
      1: 'Direct', 2: 'Indirect', 3: 'Reserved', 4: 'Expressive',
    },
    'LOVE_LANGUAGE': {
      1: 'Words', 2: 'Acts', 3: 'Gifts', 4: 'Time', 5: 'Touch',
    },
    'POLITICAL': {
      1: 'Liberal', 2: 'Conservative', 3: 'Moderate', 4: 'Apolitical',
    },
    'SLEEP': {
      1: 'Early Bird', 2: 'Night Owl', 3: 'Flexible',
    },
    'BODY_TYPE': {
      1: 'Slim', 2: 'Athletic', 3: 'Average', 4: 'Heavy', 5: 'Muscular',
    },
    'COMPLEXION': {
      1: 'Fair', 2: 'Wheatish', 3: 'Dark', 4: 'Very Fair',
    },
    'HAIR': {
      1: 'Black', 2: 'Brown', 3: 'Blonde', 4: 'Red', 5: 'Gray', 6: 'Other',
    },
    'EYE': {
      1: 'Black', 2: 'Brown', 3: 'Blue', 4: 'Green', 5: 'Hazel', 6: 'Gray',
    },
    'FACIAL_HAIR': {
      1: 'Clean', 2: 'Stubble', 3: 'Beard', 4: 'Mustache',
    },
    'INCOME': {
      1: 'Under 25K', 2: '25K-50K', 3: '50K-100K', 4: '100K-200K', 5: '200K+',
    },
    'EMPLOYMENT': {
      1: 'Full-time', 2: 'Part-time', 3: 'Self-employed', 4: 'Student', 5: 'Retired', 6: 'Unemployed',
    },
    'FAMILY_TYPE': {
      1: 'Joint', 2: 'Nuclear', 3: 'Single Parent',
    },
    'FAMILY_VALUES': {
      1: 'Traditional', 2: 'Moderate', 3: 'Liberal',
    },
    'LIVING': {
      1: 'With Family', 2: 'Alone', 3: 'Roommates', 4: 'Partner',
    },
    'AFFLUENCE': {
      1: 'Lower', 2: 'Middle', 3: 'Upper Middle', 4: 'Upper',
    },
    'LANGUAGE': {
      1: 'English', 2: 'Hindi', 3: 'Punjabi', 4: 'Tamil', 5: 'Telugu', 6: 'Bengali', 7: 'Marathi', 8: 'Gujarati',
    },
    'ETHNICITY': {
      1: 'Asian', 2: 'Black', 3: 'Caucasian', 4: 'Hispanic', 5: 'Mixed', 6: 'Other',
    },
    'INTEREST': {
      1: 'Music', 2: 'Movies', 3: 'Sports', 4: 'Travel', 5: 'Reading', 6: 'Cooking', 7: 'Gaming', 8: 'Art',
    },
  };

  // Reverse maps for string enum values
  const stringEnumMaps: Record<string, Record<string, string>> = {
    'RELATIONSHIP_GOAL': {
      'RELATIONSHIP_GOAL_UNSPECIFIED': 'Unspecified', 'RELATIONSHIP_GOAL_CASUAL': 'Casual',
      'RELATIONSHIP_GOAL_SERIOUS': 'Serious', 'RELATIONSHIP_GOAL_MARRIAGE': 'Marriage',
      'RELATIONSHIP_GOAL_FRIENDSHIP': 'Friendship',
    },
    'EDUCATION': {
      'EDUCATION_UNSPECIFIED': 'Unspecified', 'EDUCATION_HIGH_SCHOOL': 'High School',
      'EDUCATION_ASSOCIATE': 'Associate', 'EDUCATION_BACHELOR': 'Bachelor',
      'EDUCATION_MASTER': 'Master', 'EDUCATION_DOCTORATE': 'Doctorate',
      'EDUCATION_PROFESSIONAL': 'Professional',
    },
    'OCCUPATION': {
      'OCCUPATION_UNSPECIFIED': 'Unspecified', 'OCCUPATION_SOFTWARE': 'Software',
      'OCCUPATION_HEALTHCARE': 'Healthcare', 'OCCUPATION_FINANCE': 'Finance',
      'OCCUPATION_EDUCATION': 'Education', 'OCCUPATION_ENGINEERING': 'Engineering',
      'OCCUPATION_LEGAL': 'Legal', 'OCCUPATION_MARKETING': 'Marketing',
      'OCCUPATION_BUSINESS': 'Business',
    },
    'RELIGION': {
      'RELIGION_UNSPECIFIED': 'Unspecified', 'RELIGION_HINDU': 'Hindu',
      'RELIGION_MUSLIM': 'Muslim', 'RELIGION_CHRISTIAN': 'Christian',
      'RELIGION_SIKH': 'Sikh', 'RELIGION_BUDDHIST': 'Buddhist',
      'RELIGION_JAIN': 'Jain', 'RELIGION_JEWISH': 'Jewish', 'RELIGION_OTHER': 'Other',
    },
    'CHILDREN': {
      'CHILDREN_UNSPECIFIED': 'Unspecified', 'CHILDREN_HAS': 'Has Children',
      'CHILDREN_NO': 'No Children', 'CHILDREN_WANTS': 'Wants Children', 'CHILDREN_OPEN': 'Open',
    },
    'DRINKING': {
      'DRINKING_UNSPECIFIED': 'Unspecified', 'DRINKING_NEVER': 'Never',
      'DRINKING_RARELY': 'Rarely', 'DRINKING_SOCIALLY': 'Socially', 'DRINKING_REGULARLY': 'Regularly',
    },
    'SMOKING': {
      'SMOKING_UNSPECIFIED': 'Unspecified', 'SMOKING_NEVER': 'Never',
      'SMOKING_OCCASIONALLY': 'Occasionally', 'SMOKING_REGULARLY': 'Regularly', 'SMOKING_QUITTING': 'Quitting',
    },
    'DIETARY': {
      'DIETARY_UNSPECIFIED': 'Unspecified', 'DIETARY_VEGETARIAN': 'Vegetarian',
      'DIETARY_NON_VEG': 'Non-Veg', 'DIETARY_VEGAN': 'Vegan', 'DIETARY_EGGETARIAN': 'Eggetarian',
    },
    'PET': {
      'PET_UNSPECIFIED': 'Unspecified', 'PET_DOGS': 'Dogs', 'PET_CATS': 'Cats',
      'PET_BIRDS': 'Birds', 'PET_FISH': 'Fish', 'PET_OTHER': 'Other', 'PET_NONE': 'None',
    },
    'WORKOUT': {
      'WORKOUT_UNSPECIFIED': 'Unspecified', 'WORKOUT_NEVER': 'Never',
      'WORKOUT_OCCASIONALLY': 'Occasionally', 'WORKOUT_REGULARLY': 'Regularly', 'WORKOUT_DAILY': 'Daily',
    },
    'COMMUNICATION': {
      'COMMUNICATION_UNSPECIFIED': 'Unspecified', 'COMMUNICATION_DIRECT': 'Direct',
      'COMMUNICATION_INDIRECT': 'Indirect', 'COMMUNICATION_RESERVED': 'Reserved', 'COMMUNICATION_EXPRESSIVE': 'Expressive',
    },
    'LOVE_LANGUAGE': {
      'LOVE_LANGUAGE_UNSPECIFIED': 'Unspecified', 'LOVE_LANGUAGE_WORDS': 'Words',
      'LOVE_LANGUAGE_ACTS': 'Acts', 'LOVE_LANGUAGE_GIFTS': 'Gifts',
      'LOVE_LANGUAGE_TIME': 'Time', 'LOVE_LANGUAGE_TOUCH': 'Touch',
    },
    'POLITICAL': {
      'POLITICAL_UNSPECIFIED': 'Unspecified', 'POLITICAL_LIBERAL': 'Liberal',
      'POLITICAL_CONSERVATIVE': 'Conservative', 'POLITICAL_MODERATE': 'Moderate', 'POLITICAL_APOLITICAL': 'Apolitical',
    },
    'SLEEP': {
      'SLEEP_UNSPECIFIED': 'Unspecified', 'SLEEP_EARLY_BIRD': 'Early Bird',
      'SLEEP_NIGHT_OWL': 'Night Owl', 'SLEEP_FLEXIBLE': 'Flexible',
    },
    'BODY_TYPE': {
      'BODY_TYPE_UNSPECIFIED': 'Unspecified', 'BODY_TYPE_SLIM': 'Slim',
      'BODY_TYPE_ATHLETIC': 'Athletic', 'BODY_TYPE_AVERAGE': 'Average',
      'BODY_TYPE_HEAVY': 'Heavy', 'BODY_TYPE_MUSCULAR': 'Muscular',
    },
    'COMPLEXION': {
      'COMPLEXION_UNSPECIFIED': 'Unspecified', 'COMPLEXION_FAIR': 'Fair',
      'COMPLEXION_WHEATISH': 'Wheatish', 'COMPLEXION_DARK': 'Dark', 'COMPLEXION_VERY_FAIR': 'Very Fair',
    },
    'HAIR': {
      'HAIR_COLOR_UNSPECIFIED': 'Unspecified', 'HAIR_COLOR_BLACK': 'Black',
      'HAIR_COLOR_BROWN': 'Brown', 'HAIR_COLOR_BLONDE': 'Blonde',
      'HAIR_COLOR_RED': 'Red', 'HAIR_COLOR_GRAY': 'Gray', 'HAIR_COLOR_OTHER': 'Other',
    },
    'EYE': {
      'EYE_COLOR_UNSPECIFIED': 'Unspecified', 'EYE_COLOR_BLACK': 'Black',
      'EYE_COLOR_BROWN': 'Brown', 'EYE_COLOR_BLUE': 'Blue',
      'EYE_COLOR_GREEN': 'Green', 'EYE_COLOR_HAZEL': 'Hazel', 'EYE_COLOR_GRAY': 'Gray',
    },
    'FACIAL_HAIR': {
      'FACIAL_HAIR_UNSPECIFIED': 'Unspecified', 'FACIAL_HAIR_CLEAN': 'Clean',
      'FACIAL_HAIR_STUBBLE': 'Stubble', 'FACIAL_HAIR_BEARD': 'Beard', 'FACIAL_HAIR_MUSTACHE': 'Mustache',
    },
    'INCOME': {
      'INCOME_UNSPECIFIED': 'Unspecified', 'INCOME_UNDER_25K': 'Under 25K',
      'INCOME_25K_50K': '25K-50K', 'INCOME_50K_100K': '50K-100K',
      'INCOME_100K_200K': '100K-200K', 'INCOME_200K_PLUS': '200K+',
    },
    'EMPLOYMENT': {
      'EMPLOYMENT_UNSPECIFIED': 'Unspecified', 'EMPLOYMENT_FULL_TIME': 'Full-time',
      'EMPLOYMENT_PART_TIME': 'Part-time', 'EMPLOYMENT_SELF_EMPLOYED': 'Self-employed',
      'EMPLOYMENT_STUDENT': 'Student', 'EMPLOYMENT_RETIRED': 'Retired', 'EMPLOYMENT_UNEMPLOYED': 'Unemployed',
    },
    'FAMILY_TYPE': {
      'FAMILY_TYPE_UNSPECIFIED': 'Unspecified', 'FAMILY_TYPE_JOINT': 'Joint',
      'FAMILY_TYPE_NUCLEAR': 'Nuclear', 'FAMILY_TYPE_SINGLE_PARENT': 'Single Parent',
    },
    'FAMILY_VALUES': {
      'FAMILY_VALUES_UNSPECIFIED': 'Unspecified', 'FAMILY_VALUES_TRADITIONAL': 'Traditional',
      'FAMILY_VALUES_MODERATE': 'Moderate', 'FAMILY_VALUES_LIBERAL': 'Liberal',
    },
    'LIVING': {
      'LIVING_SITUATION_UNSPECIFIED': 'Unspecified', 'LIVING_SITUATION_WITH_FAMILY': 'With Family',
      'LIVING_SITUATION_ALONE': 'Alone', 'LIVING_SITUATION_ROOMMATES': 'Roommates', 'LIVING_SITUATION_PARTNER': 'Partner',
    },
    'AFFLUENCE': {
      'AFFLUENCE_UNSPECIFIED': 'Unspecified', 'AFFLUENCE_LOWER': 'Lower',
      'AFFLUENCE_MIDDLE': 'Middle', 'AFFLUENCE_UPPER_MIDDLE': 'Upper Middle', 'AFFLUENCE_UPPER': 'Upper',
    },
    'LANGUAGE': {
      'LANGUAGE_UNSPECIFIED': 'Unspecified', 'LANGUAGE_ENGLISH': 'English',
      'LANGUAGE_HINDI': 'Hindi', 'LANGUAGE_PUNJABI': 'Punjabi',
      'LANGUAGE_TAMIL': 'Tamil', 'LANGUAGE_TELUGU': 'Telugu',
      'LANGUAGE_BENGALI': 'Bengali', 'LANGUAGE_MARATHI': 'Marathi', 'LANGUAGE_GUJARATI': 'Gujarati',
    },
    'ETHNICITY': {
      'ETHNICITY_UNSPECIFIED': 'Unspecified', 'ETHNICITY_ASIAN': 'Asian',
      'ETHNICITY_BLACK': 'Black', 'ETHNICITY_CAUCASIAN': 'Caucasian',
      'ETHNICITY_HISPANIC': 'Hispanic', 'ETHNICITY_MIXED': 'Mixed', 'ETHNICITY_OTHER': 'Other',
    },
    'INTEREST': {
      'INTEREST_UNSPECIFIED': 'Unspecified', 'INTEREST_MUSIC': 'Music',
      'INTEREST_MOVIES': 'Movies', 'INTEREST_SPORTS': 'Sports',
      'INTEREST_TRAVEL': 'Travel', 'INTEREST_READING': 'Reading',
      'INTEREST_COOKING': 'Cooking', 'INTEREST_GAMING': 'Gaming', 'INTEREST_ART': 'Art',
    },
  };

  const formatEnumArray = (values: (number | string)[] | undefined, prefix: string): string => {
    if (!values || values.length === 0) return 'Not specified';

    return values.map(val => {
      // Handle numeric values
      if (typeof val === 'number') {
        const numMap = enumMaps[prefix];
        if (numMap && numMap[val]) return numMap[val];
        return `Unknown (${val})`;
      }
      // Handle string values
      if (typeof val === 'string') {
        const strMap = stringEnumMaps[prefix];
        if (strMap && strMap[val]) return strMap[val];
        // Try to extract label from string (e.g., "RELATIONSHIP_GOAL_CASUAL" -> "Casual")
        const parts = val.split('_');
        if (parts.length > 1) {
          return parts.slice(-1)[0].charAt(0) + parts.slice(-1)[0].slice(1).toLowerCase();
        }
        return val;
      }
      return `Unknown`;
    }).join(', ');
  };

  const formatGenderArray = (genders: (number | string)[] | undefined): string => {
    if (!genders || genders.length === 0) return 'Not specified';
    const genderNumMap: Record<number, string> = {
      0: 'Unspecified',
      1: 'Male',
      2: 'Female',
      3: 'Non-binary',
      4: 'Transgender Male',
      5: 'Transgender Female',
      6: 'Genderqueer',
      7: 'Other',
      8: 'Prefer not to say',
    };
    const genderStrMap: Record<string, string> = {
      'GENDER_UNSPECIFIED': 'Unspecified',
      'GENDER_MALE': 'Male',
      'GENDER_FEMALE': 'Female',
      'GENDER_NON_BINARY': 'Non-binary',
      'GENDER_TRANSGENDER_MALE': 'Transgender Male',
      'GENDER_TRANSGENDER_FEMALE': 'Transgender Female',
      'GENDER_GENDERQUEER': 'Genderqueer',
      'GENDER_OTHER': 'Other',
      'GENDER_PREFER_NOT_TO_SAY': 'Prefer not to say',
    };
    return genders.map(g => {
      if (typeof g === 'number') return genderNumMap[g] || `Unknown (${g})`;
      if (typeof g === 'string') return genderStrMap[g] || g;
      return 'Unknown';
    }).join(', ');
  };

  const formatImportance = (value: number | undefined): string => {
    const importanceMap: Record<number, string> = {
      0: 'Not specified',
      1: 'Not important',
      2: 'Somewhat important',
      3: 'Important',
      4: 'Very important',
    };
    return importanceMap[value ?? 0] || 'Not specified';
  };

  const formatBoolean = (value: boolean | undefined): string => {
    return value ? 'Yes' : 'No';
  };

  const formatNumber = (value: number | undefined, suffix: string = ''): string => {
    return value ? `${value}${suffix}` : 'Not specified';
  };

  const formatStringArray = (values: string[] | undefined): string => {
    if (!values || values.length === 0) return 'Not specified';
    return values.join(', ');
  };

  // Section component for consistency
  const PreferenceSection = ({
    title,
    children
  }: {
    title: string;
    children: React.ReactNode;
  }): JSX.Element => (
    <Box
      bg="white"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.200"
      p={{ base: 4, md: 6 }}
      boxShadow="sm"
    >
      <Heading size="md" color="fg" mb={4}>{title}</Heading>
      {children}
    </Box>
  );

  // Field display component
  const PreferenceField = ({
    label,
    value
  }: {
    label: string;
    value: string | React.ReactNode;
  }): JSX.Element => (
    <Box>
      <Text fontSize="sm" color="fg.muted" mb={1}>
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text color="fg" fontWeight="medium">
          {value}
        </Text>
      ) : (
        value
      )}
    </Box>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Container maxW="1200px" py={8} px={{ base: 4, md: 8 }} mx="auto">
        <VStack align="stretch" gap={6} mx="auto" w="100%" maxW="1000px">
          {/* Success/Error Notification */}
          {notification && (
            <Box
              position="fixed"
              top={4}
              right={4}
              zIndex={1000}
              maxW="400px"
              bg={notification.type === 'success' ? 'green.500' : 'red.500'}
              color="white"
              p={4}
              borderRadius="md"
              boxShadow="lg"
              display="flex"
              alignItems="center"
              gap={3}
            >
              <Text fontSize="xl">
                {notification.type === 'success' ? '✓' : '✕'}
              </Text>
              <Box flex={1}>
                <Text fontWeight="semibold" mb={1}>
                  {notification.type === 'success' ? 'Success' : 'Error'}
                </Text>
                <Text fontSize="sm">{notification.message}</Text>
              </Box>
              <Button
                size="xs"
                variant="ghost"
                color="white"
                _hover={{ bg: notification.type === 'success' ? 'green.600' : 'red.600' }}
                onClick={() => setNotification(null)}
              >
                ✕
              </Button>
            </Box>
          )}

          {/* Header Section */}
          <Box mb={2}>
            <HStack justify="space-between" align="center" mb={4}>
              <Box>
                <Heading size="xl" color="gray.800" mb={2}>
                  Partner Preferences
                </Heading>
                <Text color="gray.600">
                  {isEditing
                    ? 'Edit your partner preferences'
                    : 'View and manage your partner preferences'}
                </Text>
              </Box>
              {!isEditing && (
                <Button
                  bg="brand.500"
                  color="white"
                  _hover={{ bg: 'brand.600' }}
                  _active={{ bg: 'brand.700' }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Preferences
                </Button>
              )}
            </HStack>
          </Box>

          {/* Edit Mode */}
          {isEditing && partnerPrefs && (
            <PartnerPreferencesEditForm
              preferences={partnerPrefs}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}

          {/* Show message if no partner preferences exist yet */}
          {isEditing && !partnerPrefs && (
            <Box
              bg="white"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="gray.200"
              p={{ base: 4, md: 8 }}
              boxShadow="md"
            >
              <Heading size="md" color="fg" mb={4}>
                Set Up Partner Preferences
              </Heading>
              <Text color="fg.muted" mb={4}>
                You haven't set up your partner preferences yet. Please complete your profile first by visiting the profile page.
              </Text>
              <Button
                bg="brand.500"
                color="white"
                _hover={{ bg: 'brand.600' }}
                _active={{ bg: 'brand.700' }}
                onClick={handleCancel}
              >
                Go Back
              </Button>
            </Box>
          )}

          {/* View Mode */}
          {!isEditing && (
            <>
              {/* Basic Preferences */}
              <PreferenceSection title="Basic Preferences">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Looking For"
                    value={formatGenderArray(partnerPrefs?.lookingForGender)}
                  />
                  <PreferenceField
                    label="Age Range"
                    value={partnerPrefs?.ageRange
                      ? `${partnerPrefs.ageRange.minAge || 18} - ${partnerPrefs.ageRange.maxAge || 99} years`
                      : 'Not specified'}
                  />
                  <PreferenceField
                    label="Distance"
                    value={formatNumber(partnerPrefs?.distancePreference, ' km')}
                  />
                  <PreferenceField
                    label="Height Range"
                    value={partnerPrefs?.heightRange
                      ? `${partnerPrefs.heightRange.minHeight || 0} - ${partnerPrefs.heightRange.maxHeight || 0} cm`
                      : 'Not specified'}
                  />
                  <PreferenceField
                    label="Verified Only"
                    value={<Badge colorScheme={partnerPrefs?.verifiedOnly ? 'green' : 'gray'}>
                      {formatBoolean(partnerPrefs?.verifiedOnly)}
                    </Badge>}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Lifestyle Preferences */}
              <PreferenceSection title="Lifestyle Preferences">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Relationship Goals"
                    value={formatEnumArray(partnerPrefs?.relationshipGoals, 'RELATIONSHIP_GOAL')}
                  />
                  <PreferenceField
                    label="Education Levels"
                    value={formatEnumArray(partnerPrefs?.educationLevels, 'EDUCATION')}
                  />
                  <PreferenceField
                    label="Occupations"
                    value={formatEnumArray(partnerPrefs?.occupations, 'OCCUPATION')}
                  />
                  <PreferenceField
                    label="Religions"
                    value={formatEnumArray(partnerPrefs?.religions, 'RELIGION')}
                  />
                  <PreferenceField
                    label="Religion Importance"
                    value={formatImportance(partnerPrefs?.religionImportance)}
                  />
                  <PreferenceField
                    label="Children"
                    value={formatEnumArray(partnerPrefs?.childrenPreferences, 'CHILDREN')}
                  />
                  <PreferenceField
                    label="Drinking"
                    value={formatEnumArray(partnerPrefs?.drinkingPreferences, 'DRINKING')}
                  />
                  <PreferenceField
                    label="Smoking"
                    value={formatEnumArray(partnerPrefs?.smokingPreferences, 'SMOKING')}
                  />
                  <PreferenceField
                    label="Dietary"
                    value={formatEnumArray(partnerPrefs?.dietaryPreferences, 'DIETARY')}
                  />
                  <PreferenceField
                    label="Pets"
                    value={formatEnumArray(partnerPrefs?.petPreferences, 'PET')}
                  />
                  <PreferenceField
                    label="Workout"
                    value={formatEnumArray(partnerPrefs?.workoutPreferences, 'WORKOUT')}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Personality & Communication */}
              <PreferenceSection title="Personality & Communication">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Personality Types"
                    value={formatStringArray(partnerPrefs?.personalityTypes)}
                  />
                  <PreferenceField
                    label="Communication Styles"
                    value={formatEnumArray(partnerPrefs?.communicationStyles, 'COMMUNICATION')}
                  />
                  <PreferenceField
                    label="Love Languages"
                    value={formatEnumArray(partnerPrefs?.loveLanguages, 'LOVE_LANGUAGE')}
                  />
                  <PreferenceField
                    label="Political Views"
                    value={formatEnumArray(partnerPrefs?.politicalViews, 'POLITICAL')}
                  />
                  <PreferenceField
                    label="Sleep Schedule"
                    value={formatEnumArray(partnerPrefs?.sleepSchedules, 'SLEEP')}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Cultural & Matrimonial */}
              <PreferenceSection title="Cultural & Matrimonial">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Caste Preferences"
                    value={formatStringArray(partnerPrefs?.castePreferences)}
                  />
                  <PreferenceField
                    label="Sub-Caste"
                    value={formatStringArray(partnerPrefs?.subCastePreferences)}
                  />
                  <PreferenceField
                    label="Gotra"
                    value={formatStringArray(partnerPrefs?.gotraPreferences)}
                  />
                  <PreferenceField
                    label="Manglik Preference"
                    value={partnerPrefs?.manglikPreference ? 'Yes' : 'No preference'}
                  />
                  <PreferenceField
                    label="Mother Tongue"
                    value={formatStringArray(partnerPrefs?.motherTonguePreferences)}
                  />
                  <PreferenceField
                    label="Ethnicity"
                    value={formatEnumArray(partnerPrefs?.ethnicityPreferences, 'ETHNICITY')}
                  />
                  <PreferenceField
                    label="Nationality"
                    value={formatStringArray(partnerPrefs?.nationalityPreferences)}
                  />
                  <PreferenceField
                    label="NRI Preference"
                    value={partnerPrefs?.nriPreference ? 'Yes' : 'No preference'}
                  />
                  <PreferenceField
                    label="Horoscope Matching"
                    value={formatBoolean(partnerPrefs?.horoscopeMatchingRequired)}
                  />
                  <PreferenceField
                    label="Relocation"
                    value={partnerPrefs?.relocationExpectation ? 'Yes' : 'Not specified'}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Appearance Preferences */}
              <PreferenceSection title="Appearance Preferences">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Body Type"
                    value={formatEnumArray(partnerPrefs?.bodyTypePreferences, 'BODY_TYPE')}
                  />
                  <PreferenceField
                    label="Complexion"
                    value={formatEnumArray(partnerPrefs?.complexionPreferences, 'COMPLEXION')}
                  />
                  <PreferenceField
                    label="Hair Color"
                    value={formatEnumArray(partnerPrefs?.hairColorPreferences, 'HAIR')}
                  />
                  <PreferenceField
                    label="Eye Color"
                    value={formatEnumArray(partnerPrefs?.eyeColorPreferences, 'EYE')}
                  />
                  <PreferenceField
                    label="Facial Hair"
                    value={formatEnumArray(partnerPrefs?.facialHairPreferences, 'FACIAL_HAIR')}
                  />
                  <PreferenceField
                    label="Tattoo Preference"
                    value={partnerPrefs?.tattooPreference ? 'Acceptable' : 'No preference'}
                  />
                  <PreferenceField
                    label="Piercing Preference"
                    value={partnerPrefs?.piercingPreference ? 'Acceptable' : 'No preference'}
                  />
                  <PreferenceField
                    label="Disability Acceptance"
                    value={partnerPrefs?.disabilityAcceptance ? 'Yes' : 'No preference'}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Professional & Financial */}
              <PreferenceSection title="Professional & Financial">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Income Range"
                    value={formatEnumArray(partnerPrefs?.incomePreferences, 'INCOME')}
                  />
                  <PreferenceField
                    label="Employment Type"
                    value={formatEnumArray(partnerPrefs?.employmentPreferences, 'EMPLOYMENT')}
                  />
                  <PreferenceField
                    label="Industry"
                    value={formatStringArray(partnerPrefs?.industryPreferences)}
                  />
                  <PreferenceField
                    label="Min Experience"
                    value={formatNumber(partnerPrefs?.minYearsExperience, ' years')}
                  />
                  <PreferenceField
                    label="Property Preference"
                    value={partnerPrefs?.propertyPreference ? 'Required' : 'No preference'}
                  />
                  <PreferenceField
                    label="Vehicle Preference"
                    value={partnerPrefs?.vehiclePreference ? 'Required' : 'No preference'}
                  />
                  <PreferenceField
                    label="Financial Expectation"
                    value={formatImportance(partnerPrefs?.financialExpectation)}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Family Background */}
              <PreferenceSection title="Family Background">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Family Type"
                    value={formatEnumArray(partnerPrefs?.familyTypePreferences, 'FAMILY_TYPE')}
                  />
                  <PreferenceField
                    label="Family Values"
                    value={formatEnumArray(partnerPrefs?.familyValuesPreferences, 'FAMILY_VALUES')}
                  />
                  <PreferenceField
                    label="Living Situation"
                    value={formatEnumArray(partnerPrefs?.livingSituationPreferences, 'LIVING')}
                  />
                  <PreferenceField
                    label="Family Affluence"
                    value={formatEnumArray(partnerPrefs?.familyAffluencePreferences, 'AFFLUENCE')}
                  />
                  <PreferenceField
                    label="Family Location"
                    value={formatStringArray(partnerPrefs?.familyLocationPreferences)}
                  />
                  <PreferenceField
                    label="Max Siblings"
                    value={formatNumber(partnerPrefs?.maxSiblings)}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Language & Location */}
              <PreferenceSection title="Language & Location">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Languages"
                    value={formatEnumArray(partnerPrefs?.languagePreferences, 'LANGUAGE')}
                  />
                  <PreferenceField
                    label="Min Language Proficiency"
                    value={formatImportance(partnerPrefs?.minLanguageProficiency)}
                  />
                  <PreferenceField
                    label="Location Preferences"
                    value={formatStringArray(partnerPrefs?.locationPreferences)}
                  />
                  <PreferenceField
                    label="Open to Long Distance"
                    value={formatBoolean(partnerPrefs?.openToLongDistance)}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Interests */}
              <PreferenceSection title="Interests">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Interest Preferences"
                    value={formatEnumArray(partnerPrefs?.interestPreferences, 'INTEREST')}
                  />
                  <PreferenceField
                    label="Min Shared Interests"
                    value={formatNumber(partnerPrefs?.minSharedInterests)}
                  />
                </SimpleGrid>
              </PreferenceSection>

              {/* Deal-Breakers & Must-Haves */}
              <PreferenceSection title="Deal-Breakers & Must-Haves">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <PreferenceField
                    label="Max Days Inactive"
                    value={formatNumber(partnerPrefs?.maxDaysInactive, ' days')}
                  />
                  <PreferenceField
                    label="Photos Required"
                    value={formatBoolean(partnerPrefs?.photosRequired)}
                  />
                  <PreferenceField
                    label="Min Profile Completion"
                    value={formatNumber(partnerPrefs?.minProfileCompletion, '%')}
                  />
                  <PreferenceField
                    label="Deal Breakers"
                    value={formatEnumArray(
                      partnerPrefs?.dealBreakers?.map(v => v as unknown as number),
                      'DEAL_BREAKER'
                    )}
                  />
                  <PreferenceField
                    label="Must Haves"
                    value={formatEnumArray(
                      partnerPrefs?.mustHaves?.map(v => v as unknown as number),
                      'MUST_HAVE'
                    )}
                  />
                  <PreferenceField
                    label="Custom Deal-Breakers"
                    value={formatStringArray(partnerPrefs?.customDealbreakers)}
                  />
                </SimpleGrid>
              </PreferenceSection>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
