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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (updates: PartnerPreferences): Promise<void> => {
    try {
      await updatePartnerPreferences(updates);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update partner preferences:', err);
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

  const formatEnumArray = (values: number[] | undefined, prefix: string): string => {
    if (!values || values.length === 0) return 'Not specified';
    return values
      .map(val => {
        const strVal = val.toString();
        return strVal.replace(`${prefix}_`, '').replace(/_/g, ' ').toLowerCase();
      })
      .join(', ');
  };

  const formatGenderArray = (genders: number[] | undefined): string => {
    if (!genders || genders.length === 0) return 'Not specified';
    const genderMap: Record<number, string> = {
      0: 'Unspecified',
      1: 'Male',
      2: 'Female',
      3: 'Non-binary',
    };
    return genders.map(g => genderMap[g] || 'Unknown').join(', ');
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
