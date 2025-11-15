/**
 * Buttons Preview
 * Showcases all button variants and colors
 */

import { VStack, HStack, Button, Text, Box } from '@chakra-ui/react';

export const ButtonsPreview = () => {
  return (
    <VStack align="stretch" gap={8}>
      {/* Solid Buttons - All Colors */}
      <Box>
        <Text fontSize="md" fontWeight="semibold" mb={4} color="fg">
          Solid Buttons - All Theme Colors
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Button
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
            _active={{ bg: 'brand.700' }}
          >
            Brand
          </Button>
          <Button
            bg="like.500"
            color="white"
            _hover={{ bg: 'like.600' }}
            _active={{ bg: 'like.700' }}
          >
            Like
          </Button>
          <Button
            bg="nope.500"
            color="white"
            _hover={{ bg: 'nope.600' }}
            _active={{ bg: 'nope.700' }}
          >
            Nope
          </Button>
          <Button
            bg="superLike.500"
            color="white"
            _hover={{ bg: 'superLike.600' }}
            _active={{ bg: 'superLike.700' }}
          >
            Super Like
          </Button>
          <Button
            bg="boost.500"
            color="white"
            _hover={{ bg: 'boost.600' }}
            _active={{ bg: 'boost.700' }}
          >
            Boost
          </Button>
          <Button
            bg="premium.500"
            color="white"
            _hover={{ bg: 'premium.600' }}
            _active={{ bg: 'premium.700' }}
          >
            Premium
          </Button>
          <Button
            bg="rose.500"
            color="white"
            _hover={{ bg: 'rose.600' }}
            _active={{ bg: 'rose.700' }}
          >
            Rose
          </Button>
          <Button
            bg="pink.500"
            color="white"
            _hover={{ bg: 'pink.600' }}
            _active={{ bg: 'pink.700' }}
          >
            Pink
          </Button>
        </HStack>
      </Box>

      {/* Outline Buttons */}
      <Box>
        <Text fontSize="md" fontWeight="semibold" mb={4} color="fg">
          Outline Buttons
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Button
            variant="outline"
            borderColor="brand.500"
            color="brand.600"
            _hover={{ bg: 'brand.50' }}
          >
            Brand
          </Button>
          <Button
            variant="outline"
            borderColor="like.500"
            color="like.600"
            _hover={{ bg: 'like.50' }}
          >
            Like
          </Button>
          <Button
            variant="outline"
            borderColor="nope.500"
            color="nope.600"
            _hover={{ bg: 'nope.50' }}
          >
            Nope
          </Button>
          <Button
            variant="outline"
            borderColor="premium.500"
            color="premium.600"
            _hover={{ bg: 'premium.50' }}
          >
            Premium
          </Button>
        </HStack>
      </Box>

      {/* Ghost Buttons */}
      <Box>
        <Text fontSize="md" fontWeight="semibold" mb={4} color="fg">
          Ghost Buttons
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Button
            variant="ghost"
            color="brand.600"
            _hover={{ bg: 'brand.50' }}
          >
            Brand
          </Button>
          <Button
            variant="ghost"
            color="like.600"
            _hover={{ bg: 'like.50' }}
          >
            Like
          </Button>
          <Button
            variant="ghost"
            color="nope.600"
            _hover={{ bg: 'nope.50' }}
          >
            Nope
          </Button>
          <Button
            variant="ghost"
            color="premium.600"
            _hover={{ bg: 'premium.50' }}
          >
            Premium
          </Button>
        </HStack>
      </Box>

      {/* Button Sizes */}
      <Box>
        <Text fontSize="md" fontWeight="semibold" mb={4} color="fg">
          Button Sizes
        </Text>
        <HStack gap={4} align="center" flexWrap="wrap">
          <Button
            size="xs"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
          >
            Extra Small
          </Button>
          <Button
            size="sm"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
          >
            Small
          </Button>
          <Button
            size="md"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
          >
            Medium
          </Button>
          <Button
            size="lg"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
          >
            Large
          </Button>
        </HStack>
      </Box>

      {/* Button States */}
      <Box>
        <Text fontSize="md" fontWeight="semibold" mb={4} color="fg">
          Button States
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Button
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
          >
            Normal
          </Button>
          <Button
            bg="brand.500"
            color="white"
            loading
          >
            Loading
          </Button>
          <Button
            bg="brand.500"
            color="white"
            disabled
          >
            Disabled
          </Button>
        </HStack>
      </Box>

      {/* Rounded Buttons */}
      <Box>
        <Text fontSize="md" fontWeight="semibold" mb={4} color="fg">
          Border Radius Variants
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Button
            bg="brand.500"
            color="white"
            borderRadius="sm"
            _hover={{ bg: 'brand.600' }}
          >
            Small Radius
          </Button>
          <Button
            bg="brand.500"
            color="white"
            borderRadius="md"
            _hover={{ bg: 'brand.600' }}
          >
            Medium Radius
          </Button>
          <Button
            bg="brand.500"
            color="white"
            borderRadius="xl"
            _hover={{ bg: 'brand.600' }}
          >
            Large Radius
          </Button>
          <Button
            bg="brand.500"
            color="white"
            borderRadius="full"
            _hover={{ bg: 'brand.600' }}
          >
            Fully Rounded
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
};
