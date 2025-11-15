/**
 * Landing Page
 * Main landing page for Datifyy dating app
 */

import { Box, Heading, Text, Button, HStack, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="bg"
      px={4}
    >
      <VStack gap={8} maxW="800px" w="full">
        {/* Hero Section */}
        <VStack gap={4}>
          <Heading
            fontSize={{ base: '5xl', md: '7xl' }}
            fontWeight="black"
            textAlign="center"
            bgGradient="linear(to-r, brand.500, rose.500, premium.500)"
            bgClip="text"
            letterSpacing="tight"
          >
            Datifyy
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: '2xl' }}
            color="fg.muted"
            textAlign="center"
            maxW="600px"
          >
            Premium dating experience with a romantic, cohesive design system
          </Text>
        </VStack>

        {/* Theme Color Showcase */}
        <VStack gap={6} w="full">
          <Text fontSize="md" color="fg.subtle" fontWeight="medium">
            All buttons use theme colors - no hard-coded values
          </Text>

          {/* Action Buttons */}
          <HStack gap={4} flexWrap="wrap" justify="center">
            <Button
              bg="brand.500"
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'brand.600' }}
              _active={{ bg: 'brand.700' }}
            >
              Brand
            </Button>
            <Button
              bg="like.500"
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'like.600' }}
              _active={{ bg: 'like.700' }}
            >
              Like
            </Button>
            <Button
              bg="nope.500"
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'nope.600' }}
              _active={{ bg: 'nope.700' }}
            >
              Nope
            </Button>
          </HStack>

          {/* Premium Features */}
          <HStack gap={4} flexWrap="wrap" justify="center">
            <Button
              bg="superLike.500"
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'superLike.600' }}
              _active={{ bg: 'superLike.700' }}
            >
              Super Like
            </Button>
            <Button
              bg="boost.500"
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'boost.600' }}
              _active={{ bg: 'boost.700' }}
            >
              Boost
            </Button>
            <Button
              bg="premium.500"
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'premium.600' }}
              _active={{ bg: 'premium.700' }}
            >
              Premium
            </Button>
          </HStack>

          {/* Accent Colors */}
          <HStack gap={4} flexWrap="wrap" justify="center">
            <Button
              bg="rose.500"
              color="white"
              size="md"
              px={6}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'rose.600' }}
              _active={{ bg: 'rose.700' }}
            >
              Rose Accent
            </Button>
            <Button
              bg="pink.500"
              color="white"
              size="md"
              px={6}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'pink.600' }}
              _active={{ bg: 'pink.700' }}
            >
              Pink Accent
            </Button>
          </HStack>

          {/* Theme Preview Link */}
          <Link to="/theme-components">
            <Button
              variant="outline"
              borderColor="brand.500"
              color="brand.600"
              size="lg"
              px={8}
              borderRadius="xl"
              fontWeight="semibold"
              _hover={{ bg: 'brand.50', borderColor: 'brand.600' }}
              _active={{ bg: 'brand.100' }}
            >
              View Theme Components →
            </Button>
          </Link>
        </VStack>

        {/* Theme Info */}
        <Box
          bg="bg.surface"
          p={8}
          borderRadius="2xl"
          boxShadow="lg"
          w="full"
          borderWidth="1px"
          borderColor="border"
        >
          <VStack gap={4} align="start">
            <Heading size="lg" color="fg">
              Theme Features
            </Heading>
            <VStack gap={2} align="start" color="fg.muted">
              <Text>✓ Romantic, premium color palette</Text>
              <Text>✓ Cohesive design across all components</Text>
              <Text>✓ No hard-coded colors - all from theme</Text>
              <Text>✓ Beautiful gradients and shadows</Text>
              <Text>✓ Responsive and accessible</Text>
              <Text>✓ 50+ romantic animations ready</Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};
