/**
 * Hero Section
 * Main hero section with headline and CTA
 */

import { Box, Heading, Text, Button, VStack, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <Box
      as="section"
      py={{ base: 16, md: 24 }}
      px={4}
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-br, bg 0%, brand.50 100%)"
      _before={{
        content: '""',
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: 'full',
        bgGradient: 'radial(circle, rose.100, transparent 70%)',
        opacity: 0.4,
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: 'absolute',
        bottom: '-30%',
        left: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: 'full',
        bgGradient: 'radial(circle, premium.100, transparent 70%)',
        opacity: 0.4,
        zIndex: 0,
      }}
    >
      <VStack gap={8} maxW="900px" mx="auto" textAlign="center" position="relative" zIndex={1}>
        {/* Headline */}
        <VStack gap={4}>
          <Heading
            fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
            fontWeight="black"
            bgGradient="linear(to-r, brand.600, rose.500, premium.600)"
            bgClip="text"
            letterSpacing="tight"
            lineHeight="1.1"
          >
            Verified Dating.
            <br />
            Real Connections.
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
            color="fg.muted"
            maxW="700px"
          >
            Curated matches, verified profiles, and meaningful dates. Experience dating built on trust, safety, and real human connections.
          </Text>
        </VStack>

        {/* CTA Buttons */}
        <HStack gap={4} flexWrap="wrap" justify="center">
          <Button
            size="lg"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600', transform: 'translateY(-2px)' }}
            _active={{ bg: 'brand.700', transform: 'translateY(0)' }}
            borderRadius="full"
            px={8}
            py={7}
            fontSize="lg"
            fontWeight="semibold"
            boxShadow="lg"
            transition="all 0.2s"
            onClick={onGetStarted}
          >
            Get Started Free
          </Button>
          <Link to="/theme-components">
            <Button
              size="lg"
              bg="transparent"
              borderWidth="2px"
              borderColor="brand.500"
              color="brand.600"
              _hover={{ bg: 'brand.50', borderColor: 'brand.600', color: 'brand.700' }}
              _active={{ bg: 'brand.100' }}
              borderRadius="full"
              px={8}
              py={7}
              fontSize="lg"
              fontWeight="semibold"
              transition="all 0.2s"
            >
              Learn More
            </Button>
          </Link>
        </HStack>

        {/* Trust Indicators */}
        <HStack gap={8} flexWrap="wrap" justify="center" mt={8}>
          <VStack gap={1}>
            <Text fontSize="2xl" fontWeight="bold" color="brand.600">
              100%
            </Text>
            <Text fontSize="sm" color="fg.muted">
              Verified Profiles
            </Text>
          </VStack>
          <VStack gap={1}>
            <Text fontSize="2xl" fontWeight="bold" color="like.600">
              10K+
            </Text>
            <Text fontSize="sm" color="fg.muted">
              Successful Matches
            </Text>
          </VStack>
          <VStack gap={1}>
            <Text fontSize="2xl" fontWeight="bold" color="premium.600">
              4.9
            </Text>
            <Text fontSize="sm" color="fg.muted">
              User Rating
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};
