/**
 * Landing Page - Datifyy Reference Design
 * Based on: https://github.com/rahulrana95/datifyy-monorepo
 *
 * Main landing page with Hero, Features, How It Works, Testimonials, and CTA sections
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  SimpleGrid,
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { colors } from '../theme/colors.reference';
import { AuthModal } from '../features/auth/components/AuthModal';

// ==================== ANIMATIONS ====================
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;


// ==================== STYLED COMPONENTS ====================
const FloatingEmoji = styled.div<{ delay?: number }>`
  position: absolute;
  font-size: 3rem;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${(props) => props.delay || 0}s;
  opacity: 0.6;
  pointer-events: none;
`;

const ProfileCard = styled(Box)<{ rotation?: number }>`
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 1.5rem;
  transform: rotate(${(props) => props.rotation || 0}deg);
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(0deg) scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const GradientBox = styled(Box)`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  pointer-events: none;
`;

export const LandingPageReference: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGetStarted = () => {
    setIsModalOpen(true);
  };

  return (
    <Box w="full" minH="100vh" position="relative">
      {/* ==================== HERO SECTION ==================== */}
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        position="relative"
        overflow="hidden"
        bg={`linear-gradient(180deg, ${colors.brand[50]} 0%, ${colors.brand[100]} 50%, ${colors.brand[200]} 100%)`}
      >
        {/* Decorative blurred circles */}
        <GradientBox
          top="-20%"
          left="-10%"
          w="500px"
          h="500px"
          bg={colors.brand[300]}
        />
        <GradientBox
          bottom="-20%"
          right="-10%"
          w="600px"
          h="600px"
          bg={colors.superLike[300]}
        />

        <Container maxW="1200px" px={{ base: 6, md: 10 }}>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
            {/* Left Content */}
            <VStack align={{ base: 'center', lg: 'flex-start' }} gap={8} textAlign={{ base: 'center', lg: 'left' }}>
              {/* Badge */}
              <Badge
                bg={colors.gradient.brand}
                color="white"
                px={6}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="700"
                boxShadow="0 4px 12px rgba(232, 93, 117, 0.3)"
              >
                Let's be serious about love 💕
              </Badge>

              {/* Heading */}
              <Heading
                fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                fontWeight="900"
                lineHeight="1.1"
                color={colors.text.primary}
              >
                Find Your Perfect Match Today
              </Heading>

              {/* Subheading */}
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color={colors.text.secondary}
                maxW="600px"
              >
                Connect with millions of singles worldwide. Start your journey to find meaningful relationships and lasting love.
              </Text>

              {/* CTA Button */}
              <Button
                variant={"love" as any}
                size="xl"
                onClick={handleGetStarted}
                fontSize="lg"
                px={10}
                py={7}
              >
                Start Your Love Story →
              </Button>

              {/* Trust indicators */}
              <HStack gap={6} fontSize="sm" color={colors.text.tertiary} fontWeight="600" flexWrap="wrap">
                <HStack gap={2}>
                  <Text>✓</Text>
                  <Text>Free to join</Text>
                </HStack>
                <HStack gap={2}>
                  <Text>✓</Text>
                  <Text>No hidden fees</Text>
                </HStack>
                <HStack gap={2}>
                  <Text>✓</Text>
                  <Text>Safe & Secure</Text>
                </HStack>
              </HStack>

              {/* Stats */}
              <SimpleGrid columns={3} gap={8} pt={4} w="full" maxW="500px">
                {[
                  { value: '2M+', label: 'Active Users' },
                  { value: '500K+', label: 'Matches' },
                  { value: '95%', label: 'Success Rate' },
                ].map((stat, i) => (
                  <VStack key={i} gap={1}>
                    <Text fontSize="2xl" fontWeight="900" color={colors.brand[600]}>
                      {stat.value}
                    </Text>
                    <Text fontSize="sm" color={colors.text.tertiary}>
                      {stat.label}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </VStack>

            {/* Right Content - Profile Cards */}
            <Box position="relative" h="500px" display={{ base: 'none', lg: 'block' }}>
              {/* Floating emojis */}
              <FloatingEmoji style={{ top: '10%', left: '10%' }} delay={0}>
                💕
              </FloatingEmoji>
              <FloatingEmoji style={{ top: '20%', right: '10%' }} delay={1}>
                ✨
              </FloatingEmoji>
              <FloatingEmoji style={{ bottom: '30%', left: '5%' }} delay={2}>
                💖
              </FloatingEmoji>

              {/* Profile Card 1 */}
              <ProfileCard
                position="absolute"
                top="10%"
                left="5%"
                w="280px"
                rotation={-5}
                zIndex={2}
              >
                <VStack align="flex-start" gap={3}>
                  <Box
                    w="full"
                    h="200px"
                    borderRadius="xl"
                    bg={colors.gradient.brandLight}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="6xl"
                  >
                    👩
                  </Box>
                  <VStack align="flex-start" gap={1} w="full">
                    <Heading size="md">Sarah, 25</Heading>
                    <Text fontSize="sm" color={colors.text.tertiary}>
                      Marketing Manager
                    </Text>
                    <HStack gap={2} flexWrap="wrap" pt={2}>
                      <Badge colorScheme="pink" variant="subtle" fontSize="xs">
                        📸 Photography
                      </Badge>
                      <Badge colorScheme="pink" variant="subtle" fontSize="xs">
                        ✈️ Travel
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color={colors.text.quaternary} pt={2}>
                      2 km away
                    </Text>
                  </VStack>
                </VStack>
              </ProfileCard>

              {/* Profile Card 2 */}
              <ProfileCard
                position="absolute"
                bottom="10%"
                right="5%"
                w="280px"
                rotation={8}
                zIndex={1}
              >
                <VStack align="flex-start" gap={3}>
                  <Box
                    w="full"
                    h="200px"
                    borderRadius="xl"
                    bg={colors.gradient.like}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="6xl"
                  >
                    👨
                  </Box>
                  <VStack align="flex-start" gap={1} w="full">
                    <Heading size="md">Alex, 28</Heading>
                    <Text fontSize="sm" color={colors.text.tertiary}>
                      Software Engineer
                    </Text>
                    <HStack gap={2} flexWrap="wrap" pt={2}>
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        🎸 Music
                      </Badge>
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        💻 Tech
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color={colors.text.quaternary} pt={2}>
                      5 km away
                    </Text>
                  </VStack>
                </VStack>
              </ProfileCard>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* ==================== FEATURES SECTION ==================== */}
      <Box py={{ base: 20, md: 28 }} bg="white">
        <Container maxW="1200px" px={{ base: 6, md: 10 }}>
          <VStack gap={16}>
            {/* Section Header */}
            <VStack gap={4} textAlign="center" maxW="800px">
              <Badge
                bg={colors.gradient.superLike}
                color="white"
                px={6}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="700"
              >
                ✨ Why Choose Datifyy
              </Badge>
              <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} fontWeight="900">
                Everything You Need to Find Love
              </Heading>
              <Text fontSize="lg" color={colors.text.secondary}>
                Powerful features designed to help you connect authentically
              </Text>
            </VStack>

            {/* Features Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} w="full">
              {[
                {
                  icon: '🛡️',
                  title: '100% Verified Profiles',
                  desc: 'Every member is verified. No bots, no fake profiles. Just real people looking for real connections.',
                  color: colors.like[500],
                },
                {
                  icon: '🎯',
                  title: 'Smart Matching',
                  desc: 'Our advanced algorithm finds compatible matches based on your preferences and interests.',
                  color: colors.brand[500],
                },
                {
                  icon: '💬',
                  title: 'Instant Messaging',
                  desc: 'Connect instantly with your matches through our real-time chat feature.',
                  color: colors.superLike[500],
                },
                {
                  icon: '📹',
                  title: 'Video Dates',
                  desc: 'Get to know each other better with built-in video calling before meeting in person.',
                  color: colors.premium[500],
                },
                {
                  icon: '🔒',
                  title: 'Privacy First',
                  desc: 'Your data is encrypted and secure. Control who sees your profile and information.',
                  color: colors.boost[500],
                },
                {
                  icon: '💝',
                  title: 'Premium Experience',
                  desc: 'Unlock exclusive features and increase your chances of finding the perfect match.',
                  color: colors.nope[500],
                },
              ].map((feature, i) => (
                <Card.Root key={i} variant="elevated" p={8}>
                  <Card.Body>
                    <VStack align="flex-start" gap={4}>
                      <Box
                        fontSize="4xl"
                        w="70px"
                        h="70px"
                        borderRadius="xl"
                        bg={`${feature.color}15`}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {feature.icon}
                      </Box>
                      <Heading size="md" fontWeight="800">
                        {feature.title}
                      </Heading>
                      <Text color={colors.text.secondary} lineHeight="1.6">
                        {feature.desc}
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* ==================== CTA SECTION ==================== */}
      <Box py={{ base: 20, md: 28 }} bg={colors.gradient.hero}>
        <Container maxW="900px" px={{ base: 6, md: 10 }}>
          <VStack gap={8} textAlign="center">
            <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} fontWeight="900">
              Ready to Find Your Perfect Match?
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color={colors.text.secondary} maxW="700px">
              Join millions of singles who found love on Datifyy. Start your journey today!
            </Text>
            <Button
              variant={"love" as any}
              size="xl"
              onClick={handleGetStarted}
              fontSize="lg"
              px={12}
              py={8}
            >
              Get Started Now - It's Free! 💕
            </Button>
            <Text fontSize="sm" color={colors.text.tertiary}>
              No credit card required • Cancel anytime
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab="signup"
      />
    </Box>
  );
};
