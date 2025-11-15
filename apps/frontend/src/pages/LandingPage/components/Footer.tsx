/**
 * Footer Component
 */

import { Box, Flex, HStack, VStack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <Box as="footer" bg="bg.surface" borderTopWidth="1px" borderColor="border" py={12} px={4}>
      <Flex
        maxW="1200px"
        mx="auto"
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        gap={8}
      >
        <VStack align={{ base: 'center', md: 'start' }} gap={4}>
          <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, brand.500, rose.500)" bgClip="text">
            Datifyy
          </Text>
          <Text fontSize="sm" color="fg.muted" maxW="300px" textAlign={{ base: 'center', md: 'left' }}>
            Verified dating built on trust, safety, and meaningful connections.
          </Text>
        </VStack>

        <HStack gap={12} flexWrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
          <VStack align={{ base: 'center', md: 'start' }} gap={2}>
            <Text fontSize="sm" fontWeight="semibold" color="fg">
              Company
            </Text>
            <Link to="/about">
              <Text fontSize="sm" color="fg.muted" _hover={{ color: 'brand.500' }}>
                About Us
              </Text>
            </Link>
            <Link to="/contact">
              <Text fontSize="sm" color="fg.muted" _hover={{ color: 'brand.500' }}>
                Contact
              </Text>
            </Link>
          </VStack>

          <VStack align={{ base: 'center', md: 'start' }} gap={2}>
            <Text fontSize="sm" fontWeight="semibold" color="fg">
              Legal
            </Text>
            <Link to="/privacy">
              <Text fontSize="sm" color="fg.muted" _hover={{ color: 'brand.500' }}>
                Privacy Policy
              </Text>
            </Link>
            <Link to="/terms">
              <Text fontSize="sm" color="fg.muted" _hover={{ color: 'brand.500' }}>
                Terms of Service
              </Text>
            </Link>
          </VStack>
        </HStack>
      </Flex>

      <Text fontSize="xs" color="fg.subtle" textAlign="center" mt={8}>
        © 2025 Datifyy. All rights reserved.
      </Text>
    </Box>
  );
};
