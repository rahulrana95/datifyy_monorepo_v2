/**
 * CTA Section
 */

import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  return (
    <Box
      as="section"
      py={{ base: 16, md: 20 }}
      px={4}
      bgGradient="linear(135deg, brand.100 0%, rose.100 50%, premium.100 100%)"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: 'linear(to-b, whiteAlpha.300 0%, transparent 100%)',
        zIndex: 0,
      }}
    >
      <VStack gap={6} maxW="800px" mx="auto" textAlign="center" position="relative" zIndex={1}>
        <Heading
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          fontWeight="black"
          bgGradient="linear(to-r, brand.700, rose.700, premium.800)"
          bgClip="text"
          letterSpacing="tight"
        >
          Ready to Find Your Match?
        </Heading>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          color="gray.800"
          fontWeight="semibold"
          maxW="600px"
          lineHeight="1.6"
        >
          Join thousands of verified singles finding meaningful relationships through Datifyy
        </Text>
        <Button
          size="lg"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700', transform: 'translateY(-2px)' }}
          _active={{ bg: 'brand.800', transform: 'translateY(0)' }}
          borderRadius="full"
          px={10}
          py={7}
          fontSize="lg"
          fontWeight="semibold"
          boxShadow="2xl"
          transition="all 0.2s"
          onClick={onGetStarted}
        >
          Start Your Journey
        </Button>
      </VStack>
    </Box>
  );
};
