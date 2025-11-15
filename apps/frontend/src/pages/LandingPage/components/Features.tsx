/**
 * Features Section
 * Key features and benefits
 */

import { Box, Heading, Text, SimpleGrid, VStack } from '@chakra-ui/react';

const features = [
  {
    icon: '✓',
    title: 'Verified Profiles',
    description: 'Every user is verified through government ID, work email, or manual review. Date with confidence.',
    color: 'brand.500',
  },
  {
    icon: '♥',
    title: 'Curated Matches',
    description: 'Human matchmakers review preferences and curate perfect matches based on compatibility.',
    color: 'rose.500',
  },
  {
    icon: '🎯',
    title: 'Smart Preferences',
    description: 'Detailed partner preferences with must-have, nice-to-have, and flexible options.',
    color: 'premium.500',
  },
  {
    icon: '📅',
    title: 'Easy Scheduling',
    description: 'Share your availability for the week. We handle the rest - online or in-person dates.',
    color: 'like.500',
  },
  {
    icon: '💬',
    title: 'Safe Communication',
    description: 'Chat securely without sharing personal details until you are ready.',
    color: 'superLike.500',
  },
  {
    icon: '⭐',
    title: 'Premium Experience',
    description: 'Romantic ambiance, trusted platform, and meaningful connections every step.',
    color: 'boost.500',
  },
];

export const Features = () => {
  return (
    <Box as="section" py={{ base: 16, md: 20 }} px={4} bg="bg">
      <VStack gap={12} maxW="1200px" mx="auto">
        {/* Section Header */}
        <VStack gap={4} textAlign="center">
          <Heading
            fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
            fontWeight="bold"
            color="fg"
          >
            Why Choose Datifyy?
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="fg.muted" maxW="600px">
            We are built different. Trust, verification, and meaningful connections at every step.
          </Text>
        </VStack>

        {/* Feature Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} w="full">
          {features.map((feature, index) => (
            <Box
              key={index}
              p={6}
              bg="bg.surface"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="border"
              _hover={{
                boxShadow: 'lg',
                transform: 'translateY(-4px)',
                borderColor: feature.color,
              }}
              transition="all 0.3s"
            >
              <VStack align="start" gap={3}>
                <Box
                  fontSize="3xl"
                  w="14"
                  h="14"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="xl"
                  bg={`${feature.color.split('.')[0]}.50`}
                  color={feature.color}
                >
                  {feature.icon}
                </Box>
                <Heading size="md" color="fg">
                  {feature.title}
                </Heading>
                <Text color="fg.muted" fontSize="sm">
                  {feature.description}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
