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
  const { profile, isLoading, error, fetchProfile, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (updates: PartnerPreferences): Promise<void> => {
    try {
      await updateProfile({ partnerPreferences: updates });
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
              {/* Basic Preferences Card */}
              <Box
                bg="white"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                p={{ base: 4, md: 8 }}
                boxShadow="md"
              >
                <Heading size="md" color="fg" mb={4}>
                  Basic Preferences
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Looking For
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatGenderArray(partnerPrefs?.lookingForGender)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Age Range
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {partnerPrefs?.ageRange
                        ? `${partnerPrefs.ageRange.minAge || 18} - ${partnerPrefs.ageRange.maxAge || 99} years`
                        : 'Not specified'}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Distance Preference
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {partnerPrefs?.distancePreference
                        ? `${partnerPrefs.distancePreference} km`
                        : 'Not specified'}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Height Range
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {partnerPrefs?.heightRange
                        ? `${partnerPrefs.heightRange.minHeight || 0} - ${partnerPrefs.heightRange.maxHeight || 0} cm`
                        : 'Not specified'}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Verified Only
                    </Text>
                    <Badge colorScheme={partnerPrefs?.verifiedOnly ? 'green' : 'gray'}>
                      {partnerPrefs?.verifiedOnly ? 'Yes' : 'No'}
                    </Badge>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Lifestyle Preferences Card */}
              <Box
                bg="white"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                p={{ base: 4, md: 8 }}
                boxShadow="md"
              >
                <Heading size="md" color="fg" mb={4}>
                  Lifestyle Preferences
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Drinking Habits
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatEnumArray(partnerPrefs?.drinkingPreferences, 'DRINKING')}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Smoking Habits
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatEnumArray(partnerPrefs?.smokingPreferences, 'SMOKING')}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Dietary Preferences
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatEnumArray(partnerPrefs?.dietaryPreferences, 'DIETARY')}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Pet Preferences
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatEnumArray(partnerPrefs?.petPreferences, 'PET')}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Children Preferences
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatEnumArray(partnerPrefs?.childrenPreferences, 'CHILDREN')}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Additional Preferences Card */}
              <Box
                bg="white"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                p={{ base: 4, md: 8 }}
                boxShadow="md"
              >
                <Heading size="md" color="fg" mb={4}>
                  Additional Preferences
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Relationship Goals
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatEnumArray(partnerPrefs?.relationshipGoals, 'RELATIONSHIP_GOAL')}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Education Levels
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatEnumArray(partnerPrefs?.educationLevels, 'EDUCATION')}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Religions
                    </Text>
                    <Text color="fg" fontWeight="medium">
                      {formatEnumArray(partnerPrefs?.religions, 'RELIGION')}
                    </Text>
                  </Box>

                  <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                    <Text fontSize="sm" color="fg.muted" mb={1}>
                      Dealbreakers
                    </Text>
                    <Text color="fg">
                      {partnerPrefs?.dealbreakers && partnerPrefs.dealbreakers.length > 0
                        ? partnerPrefs.dealbreakers.join(', ')
                        : 'None specified'}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
