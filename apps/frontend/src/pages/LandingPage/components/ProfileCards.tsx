/**
 * Profile Cards Section
 * Showcase sample profiles with attractive UI
 */

import { Box, Heading, Text, VStack, HStack, SimpleGrid, Badge } from '@chakra-ui/react';

const sampleProfiles = [
  {
    name: 'Sarah',
    age: 28,
    location: 'San Francisco',
    interests: ['Photography', 'Yoga', 'Travel'],
    verified: true,
    gradient: 'linear(to-br, rose.400, pink.500)',
    image: '👩‍💼',
  },
  {
    name: 'Michael',
    age: 32,
    location: 'New York',
    interests: ['Cooking', 'Hiking', 'Music'],
    verified: true,
    gradient: 'linear(to-br, brand.400, premium.500)',
    image: '👨‍💻',
  },
  {
    name: 'Emma',
    age: 26,
    location: 'Los Angeles',
    interests: ['Art', 'Coffee', 'Reading'],
    verified: true,
    gradient: 'linear(to-br, premium.400, rose.500)',
    image: '👩‍🎨',
  },
  {
    name: 'David',
    age: 30,
    location: 'Chicago',
    interests: ['Fitness', 'Tech', 'Food'],
    verified: true,
    gradient: 'linear(to-br, like.400, brand.500)',
    image: '👨‍🔬',
  },
  {
    name: 'Sophia',
    age: 27,
    location: 'Seattle',
    interests: ['Dancing', 'Nature', 'Wine'],
    verified: true,
    gradient: 'linear(to-br, rose.500, premium.600)',
    image: '👩‍🎤',
  },
  {
    name: 'James',
    age: 29,
    location: 'Austin',
    interests: ['Guitar', 'Sports', 'Movies'],
    verified: true,
    gradient: 'linear(to-br, brand.500, like.500)',
    image: '👨‍🎤',
  },
];

export const ProfileCards = () => {
  return (
    <Box as="section" py={{ base: 16, md: 20 }} px={4} bg="bg">
      <VStack gap={12} maxW="1200px" mx="auto">
        <VStack gap={4} textAlign="center">
          <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} fontWeight="bold" color="fg">
            Meet Your Matches
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="fg.muted" maxW="600px">
            Connect with verified singles who share your interests and values
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6} w="full">
          {sampleProfiles.map((profile, index) => (
            <Box
              key={index}
              position="relative"
              borderRadius="2xl"
              overflow="hidden"
              bgGradient={profile.gradient}
              p={6}
              _hover={{
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '2xl',
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              cursor="pointer"
              boxShadow="lg"
            >
              {/* Verified Badge */}
              {profile.verified && (
                <Badge
                  position="absolute"
                  top={3}
                  right={3}
                  bg="white"
                  color="like.600"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="2xs"
                  fontWeight="bold"
                  boxShadow="sm"
                  zIndex={10}
                >
                  ✓ Verified
                </Badge>
              )}

              <VStack gap={4} align="start">
                {/* Profile Image */}
                <Box
                  fontSize="6xl"
                  bg="whiteAlpha.300"
                  w="full"
                  h="200px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="xl"
                  backdropFilter="blur(10px)"
                >
                  {profile.image}
                </Box>

                {/* Profile Info */}
                <VStack align="start" gap={2} w="full">
                  <HStack justify="space-between" w="full">
                    <Heading size="lg" color="gray.900" textShadow="0 1px 2px rgba(255,255,255,0.5)">
                      {profile.name}, {profile.age}
                    </Heading>
                  </HStack>
                  <Text fontSize="sm" color="gray.800" fontWeight="semibold" textShadow="0 1px 1px rgba(255,255,255,0.3)">
                    📍 {profile.location}
                  </Text>

                  {/* Interests */}
                  <HStack gap={2} flexWrap="wrap" mt={2}>
                    {profile.interests.map((interest, i) => (
                      <Badge
                        key={i}
                        bg="whiteAlpha.600"
                        color="gray.900"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor="whiteAlpha.400"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <Text fontSize="sm" color="fg.muted" textAlign="center" maxW="500px">
          These are sample profiles. All real profiles are verified through government ID or work email.
        </Text>
      </VStack>
    </Box>
  );
};
