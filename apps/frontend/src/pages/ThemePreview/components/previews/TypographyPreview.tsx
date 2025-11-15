/**
 * Typography Preview
 */

import { VStack, Text, Heading, Box } from '@chakra-ui/react';

export const TypographyPreview = () => {
  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Heading size="2xl" color="fg">Display 2XL</Heading>
        <Heading size="xl" color="fg" mt={4}>Display XL</Heading>
        <Heading size="lg" color="fg" mt={4}>Display LG</Heading>
        <Heading size="md" color="fg" mt={4}>Display MD</Heading>
        <Heading size="sm" color="fg" mt={4}>Display SM</Heading>
        <Heading size="xs" color="fg" mt={4}>Display XS</Heading>
      </Box>

      <Box>
        <Text fontSize="2xl" color="fg">Text 2XL - The quick brown fox jumps over the lazy dog</Text>
        <Text fontSize="xl" color="fg" mt={2}>Text XL - The quick brown fox jumps over the lazy dog</Text>
        <Text fontSize="lg" color="fg" mt={2}>Text LG - The quick brown fox jumps over the lazy dog</Text>
        <Text fontSize="md" color="fg" mt={2}>Text MD - The quick brown fox jumps over the lazy dog</Text>
        <Text fontSize="sm" color="fg.muted" mt={2}>Text SM - The quick brown fox jumps over the lazy dog</Text>
        <Text fontSize="xs" color="fg.subtle" mt={2}>Text XS - The quick brown fox jumps over the lazy dog</Text>
      </Box>

      <Box>
        <Text fontWeight="bold" color="fg">Bold Text</Text>
        <Text fontWeight="semibold" color="fg">Semibold Text</Text>
        <Text fontWeight="medium" color="fg">Medium Text</Text>
        <Text fontWeight="normal" color="fg">Normal Text</Text>
      </Box>
    </VStack>
  );
};
