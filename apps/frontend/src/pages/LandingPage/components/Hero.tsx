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
      py={{ base: 20, md: 28, lg: 32 }}
      px={{ base: 4, md: 8 }}
      position="relative"
      overflow="hidden"
      minH={{ base: '100vh', md: '95vh' }}
      display="flex"
      alignItems="center"
      css={{
        backgroundImage: 'url(/assets/candy-goode-WkTkj9I-cyU-unsplash.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        '@media (min-width: 48em)': {
          backgroundPosition: 'center top',
        },
        '@media (min-width: 62em)': {
          backgroundAttachment: 'fixed',
        },
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: 'linear(to-br, rgba(255, 250, 250, 0.92) 0%, rgba(255, 237, 241, 0.88) 50%, rgba(252, 231, 243, 0.90) 100%)',
        backdropFilter: 'blur(0.5px)',
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: 'radial(circle at 20% 30%, rgba(251, 113, 133, 0.15), transparent 50%), radial(circle at 80% 70%, rgba(236, 72, 153, 0.12), transparent 50%)',
        zIndex: 1,
      }}
    >
      <VStack gap={{ base: 6, md: 8, lg: 10 }} maxW="1000px" mx="auto" textAlign="center" position="relative" zIndex={2}>
        {/* Headline */}
        <VStack gap={{ base: 3, md: 4, lg: 6 }}>
          <Heading
            fontSize={{ base: '3.5xl', sm: '5xl', md: '6xl', lg: '7xl', xl: '8xl' }}
            fontWeight="black"
            bgGradient="linear(to-r, brand.600, rose.500, premium.600)"
            bgClip="text"
            letterSpacing="tight"
            lineHeight={{ base: '1.1', md: '1.05' }}
            textShadow="0 2px 20px rgba(251, 113, 133, 0.15)"
          >
            Verified Dating.
            <br />
            Real Connections.
          </Heading>
          <Box
            bg="white"
            px={{ base: 6, md: 8, lg: 10 }}
            py={{ base: 5, md: 6, lg: 7 }}
            borderRadius="3xl"
            boxShadow="0 10px 40px rgba(0, 0, 0, 0.12)"
            maxW={{ base: '95%', md: '750px' }}
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bgGradient: 'linear(to-r, brand.500, rose.500, premium.500)',
            }}
          >
            <Text
              fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
              color="fg"
              fontWeight="semibold"
              lineHeight={{ base: '1.6', md: '1.7' }}
              textAlign="center"
            >
              Curated matches, verified profiles, and meaningful dates. Experience dating built on trust, safety, and real human connections.
            </Text>
          </Box>
        </VStack>

        {/* CTA Buttons */}
        <HStack gap={{ base: 3, md: 4 }} flexWrap="wrap" justify="center" mt={{ base: 2, md: 4 }}>
          <Button
            size={{ base: 'md', md: 'lg' }}
            bg="brand.500"
            color="white"
            _hover={{
              bg: 'brand.600',
              transform: 'translateY(-3px)',
              boxShadow: '0 10px 30px rgba(251, 113, 133, 0.4)'
            }}
            _active={{ bg: 'brand.700', transform: 'translateY(0)' }}
            borderRadius="full"
            px={{ base: 6, md: 8, lg: 10 }}
            py={{ base: 6, md: 7, lg: 8 }}
            fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
            fontWeight="bold"
            boxShadow="0 6px 20px rgba(251, 113, 133, 0.3)"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            onClick={onGetStarted}
          >
            Get Started Free
          </Button>
          <Link to="/theme-components">
            <Button
              size={{ base: 'md', md: 'lg' }}
              bg="white"
              borderWidth="2px"
              borderColor="brand.500"
              color="brand.600"
              _hover={{
                bg: 'brand.50',
                borderColor: 'brand.600',
                color: 'brand.700',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 25px rgba(251, 113, 133, 0.2)'
              }}
              _active={{ bg: 'brand.100', transform: 'translateY(0)' }}
              borderRadius="full"
              px={{ base: 6, md: 8, lg: 10 }}
              py={{ base: 6, md: 7, lg: 8 }}
              fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
              fontWeight="bold"
              boxShadow="0 4px 15px rgba(0, 0, 0, 0.08)"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              Learn More
            </Button>
          </Link>
        </HStack>

        {/* Trust Indicators */}
        <HStack
          gap={{ base: 6, md: 8, lg: 12 }}
          flexWrap="wrap"
          justify="center"
          mt={{ base: 6, md: 8, lg: 10 }}
        >
          <VStack
            gap={2}
            bg="white"
            px={{ base: 4, md: 6 }}
            py={{ base: 3, md: 4 }}
            borderRadius="2xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(251, 113, 133, 0.15)' }}
          >
            <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="black" color="brand.600">
              100%
            </Text>
            <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="semibold" color="gray.600">
              Verified Profiles
            </Text>
          </VStack>
          <VStack
            gap={2}
            bg="white"
            px={{ base: 4, md: 6 }}
            py={{ base: 3, md: 4 }}
            borderRadius="2xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(251, 113, 133, 0.15)' }}
          >
            <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="black" color="like.600">
              10K+
            </Text>
            <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="semibold" color="gray.600">
              Successful Matches
            </Text>
          </VStack>
          <VStack
            gap={2}
            bg="white"
            px={{ base: 4, md: 6 }}
            py={{ base: 3, md: 4 }}
            borderRadius="2xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(251, 113, 133, 0.15)' }}
          >
            <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="black" color="premium.600">
              4.9⭐
            </Text>
            <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="semibold" color="gray.600">
              User Rating
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};
