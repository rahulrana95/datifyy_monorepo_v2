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
  Button,
  Flex,
  Link,
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { Header } from '../../shared/components/Header/Header';
import { useUserStore } from '../../stores/userStore';
import { ProfileEditForm } from './ProfileEditForm';

export const ProfilePage = () => {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  // Refs for each section
  const basicRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const lifestyleRef = useRef<HTMLDivElement>(null);
  const culturalRef = useRef<HTMLDivElement>(null);
  const appearanceRef = useRef<HTMLDivElement>(null);
  const professionalRef = useRef<HTMLDivElement>(null);
  const familyRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: 'basic', label: 'Basic Info', ref: basicRef },
    { id: 'profile', label: 'Profile Details', ref: profileRef },
    { id: 'lifestyle', label: 'Lifestyle', ref: lifestyleRef },
    { id: 'cultural', label: 'Cultural Info', ref: culturalRef },
    { id: 'appearance', label: 'Appearance', ref: appearanceRef },
    { id: 'professional', label: 'Professional', ref: professionalRef },
    { id: 'family', label: 'Family', ref: familyRef },
    { id: 'account', label: 'Account', ref: accountRef },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, id: string): void => {
    setActiveSection(id);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (updates: any) => {
    try {
      await updateProfile(updates);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

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
  // Handle both camelCase (from backend) and snake_case (for compatibility)
  const basicInfo = (profile as any)?.basicInfo || (profile as any)?.basic_info;
  const profileDetails = (profile as any)?.profileDetails || (profile as any)?.profile_details;
  const lifestyleInfo = (profile as any)?.lifestyleInfo || (profile as any)?.lifestyle_info;
  const culturalInfo = (profile as any)?.culturalInfo || (profile as any)?.cultural_info;
  const appearanceInfo = (profile as any)?.appearanceInfo || (profile as any)?.appearance_info;
  const professionalInfo = (profile as any)?.professionalInfo || (profile as any)?.professional_info;
  const familyInfo = (profile as any)?.familyInfo || (profile as any)?.family_info;

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      {/* Sticky Header Section */}
      <Box
        position="sticky"
        top="64px"
        zIndex={10}
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Container maxW="1400px" py={4} px={{ base: 4, md: 8 }}>
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="lg" color="gray.800" mb={1}>
                My Profile
              </Heading>
              <Text color="gray.600" fontSize="sm">
                {isEditing ? 'Edit your profile information' : 'View and manage your profile information'}
              </Text>
            </Box>
            {!isEditing && (
              <Button
                bg="brand.500"
                color="white"
                _hover={{ bg: 'brand.600' }}
                _active={{ bg: 'brand.700' }}
                onClick={() => setIsEditing(true)}
                size={{ base: 'sm', md: 'md' }}
              >
                Edit Profile
              </Button>
            )}
          </HStack>
        </Container>
      </Box>

      <Container maxW="1400px" py={6} px={{ base: 4, md: 8 }} mx="auto">

          {/* Edit Mode */}
          {isEditing && profile && (
            <Box maxW="900px" mx={{ base: 0, lg: "220px" }} w="100%">
              <ProfileEditForm
                profile={profile}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </Box>
          )}

          {/* View Mode */}
          {!isEditing && (
            <Flex gap={6} align="flex-start">
              {/* Sidebar Navigation - Hidden on mobile */}
              <Box
                display={{ base: 'none', lg: 'block' }}
                position="sticky"
                top="150px"
                w="220px"
                flexShrink={0}
              >
                <Box
                  bg="white"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="gray.200"
                  p={4}
                  boxShadow="sm"
                >
                  <Text fontWeight="bold" color="gray.700" mb={3} fontSize="sm">
                    QUICK NAVIGATION
                  </Text>
                  <VStack align="stretch" gap={1}>
                    {sections.map((section) => (
                      <Link
                        key={section.id}
                        onClick={() => scrollToSection(section.ref, section.id)}
                        px={3}
                        py={2}
                        borderRadius="md"
                        fontSize="sm"
                        fontWeight="medium"
                        cursor="pointer"
                        bg={activeSection === section.id ? 'brand.50' : 'transparent'}
                        color={activeSection === section.id ? 'brand.600' : 'gray.600'}
                        _hover={{
                          bg: activeSection === section.id ? 'brand.100' : 'gray.100',
                          color: activeSection === section.id ? 'brand.700' : 'gray.800',
                        }}
                        transition="all 0.2s"
                      >
                        {section.label}
                      </Link>
                    ))}
                  </VStack>
                </Box>
              </Box>

              {/* Main Content */}
              <VStack align="stretch" gap={6} flex={1} maxW="900px">
              {/* Basic Info Section */}
              <Box
                ref={basicRef}
                bg="white"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                p={{ base: 4, md: 8 }}
                boxShadow="md"
                scrollMarginTop="150px"
              >
                <Heading size="md" color="fg" mb={6}>Basic Information</Heading>
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

            {/* Basic Details Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  User ID
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(profile as any)?.userId || (profile as any)?.user_id || 'N/A'}
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
                  {basicInfo?.phoneNumber || basicInfo?.phone_number || 'Not provided'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Pronouns
                </Text>
                <Text color="fg" fontWeight="medium">
                  {basicInfo?.pronouns || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Zodiac Sign
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(basicInfo?.zodiacSign || basicInfo?.zodiac_sign) &&
                   (basicInfo?.zodiacSign || basicInfo?.zodiac_sign) !== 'ZODIAC_UNSPECIFIED'
                    ? (basicInfo?.zodiacSign || basicInfo?.zodiac_sign).replace('ZODIAC_', '')
                    : 'Not specified'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Profile Details Section */}
          <Box
            ref={profileRef}
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
            scrollMarginTop="150px"
          >
            <Heading size="md" color="fg" mb={4}>
              Profile Details
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
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
                  {profileDetails?.jobTitle || profileDetails?.job_title || 'Not provided'}
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
            </SimpleGrid>
          </Box>

          {/* Lifestyle Section */}
          <Box
            ref={lifestyleRef}
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
            scrollMarginTop="150px"
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
                  {(lifestyleInfo?.dietaryPreference || lifestyleInfo?.dietary_preference) &&
                   (lifestyleInfo?.dietaryPreference || lifestyleInfo?.dietary_preference) !== 'DIETARY_UNSPECIFIED'
                    ? (lifestyleInfo?.dietaryPreference || lifestyleInfo?.dietary_preference).replace('DIETARY_', '').toLowerCase().replace('_', ' ')
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
                  {(lifestyleInfo?.religionImportance || lifestyleInfo?.religion_importance) &&
                   (lifestyleInfo?.religionImportance || lifestyleInfo?.religion_importance) !== 'IMPORTANCE_UNSPECIFIED'
                    ? (lifestyleInfo?.religionImportance || lifestyleInfo?.religion_importance).replace('IMPORTANCE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Political View
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(lifestyleInfo?.politicalView || lifestyleInfo?.political_view) &&
                   (lifestyleInfo?.politicalView || lifestyleInfo?.political_view) !== 'POLITICAL_UNSPECIFIED'
                    ? (lifestyleInfo?.politicalView || lifestyleInfo?.political_view).replace('POLITICAL_', '').toLowerCase().replace('_', ' ')
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
                  {lifestyleInfo?.personalityType || lifestyleInfo?.personality_type || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Communication Style
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(lifestyleInfo?.communicationStyle || lifestyleInfo?.communication_style) &&
                   (lifestyleInfo?.communicationStyle || lifestyleInfo?.communication_style) !== 'COMMUNICATION_UNSPECIFIED'
                    ? (lifestyleInfo?.communicationStyle || lifestyleInfo?.communication_style).replace('COMMUNICATION_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Love Language
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(lifestyleInfo?.loveLanguage || lifestyleInfo?.love_language) &&
                   (lifestyleInfo?.loveLanguage || lifestyleInfo?.love_language) !== 'LOVE_LANGUAGE_UNSPECIFIED'
                    ? (lifestyleInfo?.loveLanguage || lifestyleInfo?.love_language).replace('LOVE_LANGUAGE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Sleep Schedule
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(lifestyleInfo?.sleepSchedule || lifestyleInfo?.sleep_schedule) &&
                   (lifestyleInfo?.sleepSchedule || lifestyleInfo?.sleep_schedule) !== 'SLEEP_SCHEDULE_UNSPECIFIED'
                    ? (lifestyleInfo?.sleepSchedule || lifestyleInfo?.sleep_schedule).replace('SLEEP_SCHEDULE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Cultural Info Section */}
          <Box
            ref={culturalRef}
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
            scrollMarginTop="150px"
          >
            <Heading size="md" color="fg" mb={4}>
              Cultural & Matrimonial Information
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Mother Tongue
                </Text>
                <Text color="fg" fontWeight="medium">
                  {culturalInfo?.motherTongue || culturalInfo?.mother_tongue || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Nationality
                </Text>
                <Text color="fg" fontWeight="medium">
                  {culturalInfo?.nationality || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Caste/Community
                </Text>
                <Text color="fg" fontWeight="medium">
                  {culturalInfo?.caste || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Sub-Caste
                </Text>
                <Text color="fg" fontWeight="medium">
                  {culturalInfo?.subCaste || culturalInfo?.sub_caste || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Willing to Relocate
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(culturalInfo?.willingToRelocate ?? culturalInfo?.willing_to_relocate) ? 'Yes' : 'No'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Appearance Info Section */}
          <Box
            ref={appearanceRef}
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
            scrollMarginTop="150px"
          >
            <Heading size="md" color="fg" mb={4}>
              Appearance
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Body Type
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(appearanceInfo?.bodyType || appearanceInfo?.body_type) &&
                   (appearanceInfo?.bodyType || appearanceInfo?.body_type) !== 'BODY_TYPE_UNSPECIFIED'
                    ? (appearanceInfo?.bodyType || appearanceInfo?.body_type).replace('BODY_TYPE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Complexion
                </Text>
                <Text color="fg" fontWeight="medium">
                  {appearanceInfo?.complexion && appearanceInfo.complexion !== 'COMPLEXION_UNSPECIFIED'
                    ? appearanceInfo.complexion.replace('COMPLEXION_', '').toLowerCase()
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Hair Color
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(appearanceInfo?.hairColor || appearanceInfo?.hair_color) &&
                   (appearanceInfo?.hairColor || appearanceInfo?.hair_color) !== 'HAIR_COLOR_UNSPECIFIED'
                    ? (appearanceInfo?.hairColor || appearanceInfo?.hair_color).replace('HAIR_COLOR_', '').toLowerCase()
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Eye Color
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(appearanceInfo?.eyeColor || appearanceInfo?.eye_color) &&
                   (appearanceInfo?.eyeColor || appearanceInfo?.eye_color) !== 'EYE_COLOR_UNSPECIFIED'
                    ? (appearanceInfo?.eyeColor || appearanceInfo?.eye_color).replace('EYE_COLOR_', '').toLowerCase()
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Tattoos
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(appearanceInfo?.hasTattoos ?? appearanceInfo?.has_tattoos) ? 'Yes' : 'No'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Piercings
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(appearanceInfo?.hasPiercings ?? appearanceInfo?.has_piercings) ? 'Yes' : 'No'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Professional Info Section */}
          <Box
            ref={professionalRef}
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
            scrollMarginTop="150px"
          >
            <Heading size="md" color="fg" mb={4}>
              Professional & Financial
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Employment Type
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(professionalInfo?.employmentType || professionalInfo?.employment_type) &&
                   (professionalInfo?.employmentType || professionalInfo?.employment_type) !== 'EMPLOYMENT_TYPE_UNSPECIFIED'
                    ? (professionalInfo?.employmentType || professionalInfo?.employment_type).replace('EMPLOYMENT_TYPE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Industry
                </Text>
                <Text color="fg" fontWeight="medium">
                  {professionalInfo?.industry || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Years of Experience
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(professionalInfo?.yearsOfExperience ?? professionalInfo?.years_of_experience) || 0} years
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Highest Education
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(professionalInfo?.highestEducation || professionalInfo?.highest_education) &&
                   (professionalInfo?.highestEducation || professionalInfo?.highest_education) !== 'EDUCATION_LEVEL_UNSPECIFIED'
                    ? (professionalInfo?.highestEducation || professionalInfo?.highest_education).replace('EDUCATION_LEVEL_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Owns Property
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(professionalInfo?.ownsProperty ?? professionalInfo?.owns_property) ? 'Yes' : 'No'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Owns Vehicle
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(professionalInfo?.ownsVehicle ?? professionalInfo?.owns_vehicle) ? 'Yes' : 'No'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Family Info Section */}
          <Box
            ref={familyRef}
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
            scrollMarginTop="150px"
          >
            <Heading size="md" color="fg" mb={4}>
              Family Background
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Family Type
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(familyInfo?.familyType || familyInfo?.family_type) &&
                   (familyInfo?.familyType || familyInfo?.family_type) !== 'FAMILY_TYPE_UNSPECIFIED'
                    ? (familyInfo?.familyType || familyInfo?.family_type).replace('FAMILY_TYPE_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Number of Siblings
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(familyInfo?.numSiblings ?? familyInfo?.num_siblings) || 0}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Father's Occupation
                </Text>
                <Text color="fg" fontWeight="medium">
                  {familyInfo?.fatherOccupation || familyInfo?.father_occupation || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Mother's Occupation
                </Text>
                <Text color="fg" fontWeight="medium">
                  {familyInfo?.motherOccupation || familyInfo?.mother_occupation || 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Living Situation
                </Text>
                <Text color="fg" fontWeight="medium">
                  {(familyInfo?.livingSituation || familyInfo?.living_situation) &&
                   (familyInfo?.livingSituation || familyInfo?.living_situation) !== 'LIVING_SITUATION_UNSPECIFIED'
                    ? (familyInfo?.livingSituation || familyInfo?.living_situation).replace('LIVING_SITUATION_', '').toLowerCase().replace('_', ' ')
                    : 'Not specified'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  Family Location
                </Text>
                <Text color="fg" fontWeight="medium">
                  {familyInfo?.familyLocation || familyInfo?.family_location || 'Not specified'}
                </Text>
              </Box>

              <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                <Text fontSize="sm" color="fg.muted" mb={1}>
                  About Family
                </Text>
                <Text color="fg">
                  {familyInfo?.aboutFamily || familyInfo?.about_family || 'Not provided'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Account Metadata Section */}
          <Box
            ref={accountRef}
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            boxShadow="md"
            scrollMarginTop="150px"
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
            </Flex>
          )}
      </Container>
    </Box>
  );
};
