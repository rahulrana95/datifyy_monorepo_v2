/**
 * Datifyy App
 * Main application component with Chakra UI theme
 */

import { ChakraProvider } from './providers/ChakraProvider';
import { Box, Heading, Text, Button, HStack, VStack } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider>
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

            {/* Color Test - Direct color references */}
            <HStack gap={2}>
              <Box w="50px" h="50px" bg="brand.500" borderRadius="md" />
              <Box w="50px" h="50px" bg="like.500" borderRadius="md" />
              <Box w="50px" h="50px" bg="nope.500" borderRadius="md" />
              <Box w="50px" h="50px" bg="superLike.500" borderRadius="md" />
              <Box w="50px" h="50px" bg="boost.500" borderRadius="md" />
              <Box w="50px" h="50px" bg="premium.500" borderRadius="md" />
            </HStack>

            {/* Action Buttons */}
            <HStack gap={4} flexWrap="wrap" justify="center">
              <Button
                colorPalette="brand"
                variant="solid"
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="semibold"
              >
                Brand
              </Button>
              <Button
                colorPalette="like"
                variant="solid"
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="semibold"
              >
                Like
              </Button>
              <Button
                colorPalette="nope"
                variant="solid"
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="semibold"
              >
                Nope
              </Button>
            </HStack>

            {/* Premium Features */}
            <HStack gap={4} flexWrap="wrap" justify="center">
              <Button
                colorPalette="superLike"
                variant="solid"
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="semibold"
              >
                Super Like
              </Button>
              <Button
                colorPalette="boost"
                variant="solid"
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="semibold"
              >
                Boost
              </Button>
              <Button
                colorPalette="premium"
                variant="solid"
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="semibold"
              >
                Premium
              </Button>
            </HStack>

            {/* Accent Colors */}
            <HStack gap={4} flexWrap="wrap" justify="center">
              <Button
                colorPalette="rose"
                variant="outline"
                size="md"
                px={6}
                borderRadius="xl"
                fontWeight="semibold"
              >
                Rose Accent
              </Button>
              <Button
                colorPalette="pink"
                variant="outline"
                size="md"
                px={6}
                borderRadius="xl"
                fontWeight="semibold"
              >
                Pink Accent
              </Button>
            </HStack>
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
    </ChakraProvider>
  );
}

export default App;
