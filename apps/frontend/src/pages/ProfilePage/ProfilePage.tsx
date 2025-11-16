/**
 * Profile Page
 * User profile management page
 */

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Circle,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Header } from '../../shared/components/Header/Header';
import { useUserStore } from '../../stores/userStore';

export const ProfilePage = () => {
  const { profile, isLoading, error, fetchProfile } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <Box minH="100vh" bg="bg">
        <Header />
        <Container maxW="1200px" py={8}>
          <VStack align="center" justify="center" minH="400px">
            <Spinner size="xl" color="brand.500" />
            <Text color="fg.muted">Loading profile...</Text>
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
              Error Loading Profile
            </Heading>
            <Text color="red.600">{error}</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  // API returns snake_case, so we need to use that
  const basicInfo = (profile as any)?.basic_info;
  const profileDetails = (profile as any)?.profile_details;
  const lifestyleInfo = (profile as any)?.lifestyle_info;

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Container maxW="1200px" py={8} px={{ base: 4, md: 8 }} mx="auto">
        <VStack align="stretch" gap={6} mx="auto" w="100%" maxW="1000px">
          {/* Header Section */}
          <Box textAlign="center" mb={2}>
            <Heading size="xl" color="gray.800" mb={2}>
              My Profile
            </Heading>
            <Text color="gray.600">
              View and manage your profile information
            </Text>
          </Box>

          {/* Profile Card */}
          <Box
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
          >
            {/* Avatar and Basic Info */}
            <HStack gap={4} mb={6}>
              <Circle size="80px" bg="brand.500" color="white" fontWeight="bold" fontSize="2xl">
                {(basicInfo?.name || basicInfo?.email || 'U').charAt(0).toUpperCase()}
              </Circle>
              <VStack align="start" gap={1}>
                <Heading size="lg" color="fg">
                  {basicInfo?.name || 'Unknown User'}
                </Heading>
                <Text color="fg.muted">{basicInfo?.email}</Text>
                {basicInfo?.age && <Text color="fg.muted">{basicInfo.age} years old</Text>}
              </VStack>
            </HStack>

            {/* Profile Details Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  User ID
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(profile as any)?.user_id || 'N/A'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Gender
                </Text>
                <Text color="fg" fontWeight="medium">
                  {basicInfo?.gender && basicInfo.gender !== 'GENDER_UNSPECIFIED'
                    ? basicInfo.gender.replace('GENDER_', '')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Phone Number
                </Text>
                <Text color="fg" fontWeight="medium">
                  {basicInfo?.phone_number || 'Not provided'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Height
                </Text>
                <Text color="fg" fontWeight="medium">
                  {profileDetails?.height && profileDetails.height > 0
                    ? `${profileDetails.height} cm`
                    : 'Not provided'}
                </Text>
              </Box>

              <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Bio
                </Text>
                <Text color="fg">
                  {profileDetails?.bio || 'No bio yet'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Job Title
                </Text>
                <Text color="fg" fontWeight="medium">
                  {profileDetails?.job_title || 'Not provided'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Company
                </Text>
                <Text color="fg" fontWeight="medium">
                  {profileDetails?.company || 'Not provided'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  School
                </Text>
                <Text color="fg" fontWeight="medium">
                  {profileDetails?.school || 'Not provided'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Hometown
                </Text>
                <Text color="fg" fontWeight="medium">
                  {profileDetails?.hometown || 'Not provided'}
                </Text>
              </Box>
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
            <Heading size="md" color="fg" mb={4}>
              Lifestyle
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Drinking
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.drinking && lifestyleInfo.drinking !== 'DRINKING_UNSPECIFIED'
                    ? lifestyleInfo.drinking.replace('DRINKING_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Smoking
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.smoking && lifestyleInfo.smoking !== 'SMOKING_UNSPECIFIED'
                    ? lifestyleInfo.smoking.replace('SMOKING_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Workout
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.workout && lifestyleInfo.workout !== 'WORKOUT_UNSPECIFIED'
                    ? lifestyleInfo.workout.replace('WORKOUT_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Dietary Preference
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.dietary_preference && lifestyleInfo.dietary_preference !== 'DIETARY_UNSPECIFIED'
                    ? lifestyleInfo.dietary_preference.replace('DIETARY_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Religion
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.religion && lifestyleInfo.religion !== 'RELIGION_UNSPECIFIED'
                    ? lifestyleInfo.religion.replace('RELIGION_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Religion Importance
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.religion_importance && lifestyleInfo.religion_importance !== 'IMPORTANCE_UNSPECIFIED'
                    ? lifestyleInfo.religion_importance.replace('IMPORTANCE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Political View
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.political_view && lifestyleInfo.political_view !== 'POLITICAL_UNSPECIFIED'
                    ? lifestyleInfo.political_view.replace('POLITICAL_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Pets
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.pets && lifestyleInfo.pets !== 'PET_UNSPECIFIED'
                    ? lifestyleInfo.pets.replace('PET_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Children
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.children && lifestyleInfo.children !== 'CHILDREN_UNSPECIFIED'
                    ? lifestyleInfo.children.replace('CHILDREN_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Personality Type
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.personality_type || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Communication Style
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.communication_style && lifestyleInfo.communication_style !== 'COMMUNICATION_UNSPECIFIED'
                    ? lifestyleInfo.communication_style.replace('COMMUNICATION_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Love Language
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.love_language && lifestyleInfo.love_language !== 'LOVE_LANGUAGE_UNSPECIFIED'
                    ? lifestyleInfo.love_language.replace('LOVE_LANGUAGE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Sleep Schedule
                </Text>
                <Text color="fg" fontWeight="medium">
                  {lifestyleInfo?.sleep_schedule && lifestyleInfo.sleep_schedule !== 'SLEEP_SCHEDULE_UNSPECIFIED'
                    ? lifestyleInfo.sleep_schedule.replace('SLEEP_SCHEDULE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Account Metadata Section */}
          <Box
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
          >
            <Heading size="md" color="fg" mb={4}>
              Account Information
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Account Status
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(profile as any)?.metadata?.status?.replace('ACCOUNT_STATUS_', '').toLowerCase() || 'N/A'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Email Verified
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(profile as any)?.metadata?.email_verified?.includes('VERIFIED') ? 'Yes' : 'No'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Phone Verified
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(profile as any)?.metadata?.phone_verified?.includes('VERIFIED') ? 'Yes' : 'No'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Profile Verified
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(profile as any)?.is_verified ? 'Yes' : 'No'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Completion Percentage
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(profile as any)?.completion_percentage || 0}%
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Profile Visibility
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(profile as any)?.is_public ? 'Public' : 'Private'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
