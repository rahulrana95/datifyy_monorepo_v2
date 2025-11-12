/**
 * Datifyy Landing Page - Beautiful Premium Dating Platform
 * Romantic design following Datifyy theme
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  Input,
  Stack,
  Link,
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { datifyyTheme } from '../theme/datifyy.theme';
import { useAuthStore } from '../features/auth/store/auth.store';
import { AuthModal } from '../features/auth/components/AuthModal';

// ==================== ANIMATIONS ====================
const float = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  33% { transform: translateY(-30px) translateX(15px) rotate(8deg); }
  66% { transform: translateY(-15px) translateX(-12px) rotate(-6deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); opacity: 0.88; }
`;

const heartbeat = keyframes`
  0%, 100% { transform: scale(1); }
  10%, 30% { transform: scale(1.08); }
  20%, 40% { transform: scale(0.96); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.35),
                0 0 40px rgba(244, 63, 94, 0.18),
                0 0 60px rgba(244, 63, 94, 0.08);
  }
  50% {
    box-shadow: 0 0 30px rgba(244, 63, 94, 0.55),
                0 0 60px rgba(244, 63, 94, 0.28),
                0 0 90px rgba(244, 63, 94, 0.15);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// ==================== STYLED COMPONENTS ====================
const RomanticText = styled(Heading)`
  background: ${datifyyTheme.colors.text.gradient};
  background-size: 200% 200%;
  animation: ${shimmer} 6s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: ${datifyyTheme.fonts.heading};
  font-weight: ${datifyyTheme.fontWeights.black};
  line-height: ${datifyyTheme.lineHeights.tight};
  letter-spacing: ${datifyyTheme.letterSpacing.tighter};
`;

const GlassCard = styled(Box)`
  background: ${datifyyTheme.colors.background.glass};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: ${datifyyTheme.radii['3xl']};
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${datifyyTheme.shadows.glass};
  transition: all ${datifyyTheme.transitions.slow};

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: ${datifyyTheme.shadows.premium};
    border-color: rgba(244, 63, 94, 0.35);
  }
`;

const PremiumCard = styled(Card.Root)`
  background: linear-gradient(145deg, #ffffff 0%, ${datifyyTheme.colors.primary[50]} 100%);
  border-radius: ${datifyyTheme.radii['3xl']};
  padding: ${datifyyTheme.space[10]};
  border: 1px solid ${datifyyTheme.colors.primary[200]};
  box-shadow: ${datifyyTheme.shadows.card};
  transition: all ${datifyyTheme.transitions.slow};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(244, 63, 94, 0.12),
      rgba(217, 70, 239, 0.10),
      transparent
    );
    transition: left 0.7s ease;
  }

  &:hover {
    transform: translateY(-16px) scale(1.03);
    box-shadow: ${datifyyTheme.shadows.cardHover};
    border-color: ${datifyyTheme.colors.primary[300]};

    &::before {
      left: 100%;
    }
  }
`;

const FloatingHeart = styled(Box)<{ delay?: number }>`
  animation: ${float} 12s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
  pointer-events: none;
  filter: blur(1.2px);
  opacity: 0.12;
`;

const PulsingBadge = styled(Box)`
  animation: ${pulse} 3s ease-in-out infinite;
`;

const HeartbeatBadge = styled(Box)`
  animation: ${heartbeat} 1.4s ease-in-out infinite;
`;

const GlowButton = styled(Button)`
  animation: ${glow} 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.25),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const FadeInSection = styled(Box)`
  animation: ${fadeInUp} 0.7s ease-out;
`;

const ScaleInSection = styled(Box)`
  animation: ${scaleIn} 0.6s ease-out;
`;

const SlideInSection = styled(Box)`
  animation: ${slideInRight} 0.8s ease-out;
`;

export const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
    }
  };

  return (
    <Box w="full" position="relative" bg={datifyyTheme.colors.background.primary}>
      {/* ==================== HERO SECTION ==================== */}
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        position="relative"
        overflow="hidden"
        background={datifyyTheme.colors.background.hero}
      >
        {/* Floating Hearts Background */}
        {[
          { emoji: '💕', top: '10%', left: '6%', delay: 0, size: '90px' },
          { emoji: '💖', top: '20%', right: '10%', delay: 2, size: '75px' },
          { emoji: '💗', bottom: '15%', left: '12%', delay: 4, size: '85px' },
          { emoji: '💝', bottom: '25%', right: '8%', delay: 3, size: '70px' },
          { emoji: '❤️', top: '50%', left: '4%', delay: 5, size: '65px' },
          { emoji: '💓', top: '35%', right: '4%', delay: 6, size: '80px' },
        ].map((heart, i) => (
          <FloatingHeart
            key={i}
            position="absolute"
            top={heart.top}
            bottom={heart.bottom}
            left={heart.left}
            right={heart.right}
            fontSize={heart.size}
            delay={heart.delay}
          >
            {heart.emoji}
          </FloatingHeart>
        ))}

        <Container maxW="1400px" px={{ base: 6, md: 10, lg: 14 }} py={{ base: 20, md: 28, lg: 36 }}>
          <FadeInSection>
            <VStack gap={18} align="center" textAlign="center">
              {/* Launch Badge */}
              <HeartbeatBadge>
                <Badge
                  bg={datifyyTheme.colors.accent.gradient}
                  color="white"
                  px={10}
                  py={3}
                  borderRadius="full"
                  fontSize="md"
                  fontWeight="800"
                  letterSpacing="wide"
                  boxShadow="0 12px 35px rgba(217, 70, 239, 0.45)"
                  textTransform="uppercase"
                >
                  💝 Now Launching • Join the Love Revolution
                </Badge>
              </HeartbeatBadge>

              {/* Main Headline */}
              <VStack gap={8} maxW="1200px">
                <Heading
                  size={{ base: "4xl", md: "6xl", lg: "7xl" }}
                  color={datifyyTheme.colors.text.primary}
                  fontWeight="900"
                  fontFamily={datifyyTheme.fonts.heading}
                  letterSpacing="tighter"
                  lineHeight="0.98"
                >
                  Where Real Love
                </Heading>
                <RomanticText
                  size={{ base: "4xl", md: "6xl", lg: "7xl" }}
                  fontWeight="900"
                  lineHeight="0.98"
                >
                  Meets Real People
                </RomanticText>
                <HStack gap={6} pt={6}>
                  <Text fontSize={{ base: "5xl", md: "6xl" }}>💕</Text>
                  <Text fontSize={{ base: "5xl", md: "6xl" }}>✨</Text>
                  <Text fontSize={{ base: "5xl", md: "6xl" }}>🔥</Text>
                </HStack>
              </VStack>

              {/* Subheadline */}
              <Text
                fontSize={{ base: "lg", md: "2xl", lg: "3xl" }}
                color={datifyyTheme.colors.text.secondary}
                maxW="1000px"
                lineHeight="1.55"
                fontWeight="500"
              >
                Say goodbye to endless swiping and fake profiles. Meet
                {' '}
                <Text as="span" color={datifyyTheme.colors.primary[600]} fontWeight="800">
                  100% verified singles
                </Text>
                {' '}who are serious about finding meaningful connections.
              </Text>

              {/* Trust Metrics */}
              <Grid
                templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
                gap={{ base: 8, md: 12 }}
                w="full"
                maxW="1100px"
                pt={10}
              >
                {[
                  { icon: "✓", label: "100% Verified", subtext: "Government ID check", gradient: datifyyTheme.colors.primary.gradient },
                  { icon: "🔒", label: "Bank-Level Security", subtext: "End-to-end encrypted", gradient: datifyyTheme.colors.trust.gradient },
                  { icon: "👥", label: "10,000+ Members", subtext: "Active community", gradient: datifyyTheme.colors.secondary.gradient },
                  { icon: "⭐", label: "4.9/5 Rating", subtext: "Loved by users", gradient: datifyyTheme.colors.accent.gradient },
                ].map((metric, i) => (
                  <GlassCard key={i} p={8} textAlign="center">
                    <VStack gap={4}>
                      <Box
                        fontSize="4xl"
                        w="80px"
                        h="80px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="full"
                        bg={metric.gradient}
                        color="white"
                        fontWeight="900"
                        boxShadow={datifyyTheme.shadows.glow}
                      >
                        {metric.icon}
                      </Box>
                      <VStack gap={1}>
                        <Text fontWeight="800" fontSize="md" color={datifyyTheme.colors.text.primary}>
                          {metric.label}
                        </Text>
                        <Text fontSize="xs" color={datifyyTheme.colors.text.tertiary} fontWeight="500">
                          {metric.subtext}
                        </Text>
                      </VStack>
                    </VStack>
                  </GlassCard>
                ))}
              </Grid>

              {/* Primary CTA */}
              <VStack w="full" maxW="800px" pt={14} gap={8}>
                <GlowButton
                  onClick={handleGetStarted}
                  bg={datifyyTheme.colors.primary.gradient}
                  color="white"
                  px={{ base: 14, md: 20 }}
                  py={{ base: 7, md: 9 }}
                  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                  borderRadius="full"
                  fontWeight="800"
                  boxShadow="0 18px 55px rgba(244, 63, 94, 0.45)"
                  _hover={{
                    transform: 'translateY(-5px) scale(1.06)',
                    boxShadow: '0 28px 75px rgba(244, 63, 94, 0.55)',
                  }}
                  transition="all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                >
                  Find Your Perfect Match 💘
                </GlowButton>

                <Text fontSize={{ base: "md", md: "lg" }} color={datifyyTheme.colors.text.secondary} fontWeight="600">
                  Join <Text as="span" color={datifyyTheme.colors.primary[600]} fontWeight="800">10,000+ verified singles</Text> waiting to meet you
                </Text>

                <HStack justify="center" gap={{ base: 6, md: 12 }} pt={3} fontSize="sm" color={datifyyTheme.colors.text.tertiary} fontWeight="700" flexWrap="wrap">
                  {[
                    { icon: "✓", text: "Free to join" },
                    { icon: "🔒", text: "Verified profiles" },
                    { icon: "⚡", text: "Instant matches" },
                    { icon: "💝", text: "Real connections" },
                  ].map((item, i) => (
                    <HStack key={i} gap={2}>
                      <Box
                        fontSize="lg"
                        bg={datifyyTheme.colors.primary[100]}
                        p={1.5}
                        borderRadius="md"
                        color={datifyyTheme.colors.primary[600]}
                      >
                        {item.icon}
                      </Box>
                      <Text>{item.text}</Text>
                    </HStack>
                  ))}
                </HStack>
              </VStack>
            </VStack>
          </FadeInSection>
        </Container>
      </Box>

      {/* ==================== HOW IT WORKS ==================== */}
      <Box
        py={{ base: 28, md: 36, lg: 44 }}
        background={`linear-gradient(180deg,
          ${datifyyTheme.colors.primary[50]} 0%,
          #ffffff 50%,
          ${datifyyTheme.colors.secondary[50]} 100%
        )`}
      >
        <Container maxW="1400px" px={{ base: 6, md: 10, lg: 14 }}>
          <VStack gap={24}>
            {/* Header */}
            <ScaleInSection>
              <VStack textAlign="center" gap={8} maxW="900px" mx="auto">
                <PulsingBadge>
                  <Badge
                    bg={datifyyTheme.colors.secondary.gradient}
                    color="white"
                    px={8}
                    py={2.5}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="700"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    boxShadow="0 10px 28px rgba(249, 115, 22, 0.35)"
                  >
                    ✨ Simple & Effective
                  </Badge>
                </PulsingBadge>
                <RomanticText size={{ base: "3xl", md: "5xl", lg: "6xl" }} textAlign="center">
                  How Datifyy Works
                </RomanticText>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  color={datifyyTheme.colors.text.secondary}
                  fontWeight="500"
                  lineHeight="1.6"
                >
                  Finding your perfect match is easier than you think
                </Text>
              </VStack>
            </ScaleInSection>

            {/* Steps */}
            <Grid
              templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }}
              gap={12}
              w="full"
            >
              {[
                {
                  step: '01',
                  icon: '📝',
                  title: 'Create Your Profile',
                  desc: 'Sign up in minutes and complete your profile verification. Upload photos, share your interests, and tell us what you\'re looking for in a partner.',
                  gradient: datifyyTheme.colors.primary.gradient,
                },
                {
                  step: '02',
                  icon: '🎯',
                  title: 'Get Smart Matches',
                  desc: 'Our AI and expert team curate perfect matches based on your preferences, values, and compatibility. No random swiping, only quality connections.',
                  gradient: datifyyTheme.colors.accent.gradient,
                },
                {
                  step: '03',
                  icon: '💬',
                  title: 'Start Meaningful Conversations',
                  desc: 'Chat securely, have video dates, and get guidance from our relationship coaches. Build genuine connections that lead to lasting relationships.',
                  gradient: datifyyTheme.colors.trust.gradient,
                },
              ].map((step, i) => (
                <SlideInSection key={i} style={{ animationDelay: `${i * 0.15}s` }}>
                  <PremiumCard>
                    <Card.Body>
                      <VStack align="start" gap={8}>
                        <HStack gap={4} w="full" justify="space-between">
                          <Box
                            fontSize="6xl"
                            p={5}
                            bg={step.gradient}
                            borderRadius="2xl"
                            display="inline-flex"
                            boxShadow={datifyyTheme.shadows.glow}
                          >
                            {step.icon}
                          </Box>
                          <Text
                            fontSize="5xl"
                            fontWeight="900"
                            color={datifyyTheme.colors.primary[200]}
                            fontFamily={datifyyTheme.fonts.heading}
                          >
                            {step.step}
                          </Text>
                        </HStack>

                        <VStack align="start" gap={4}>
                          <Heading
                            size="xl"
                            color={datifyyTheme.colors.text.primary}
                            fontWeight="800"
                            fontFamily={datifyyTheme.fonts.heading}
                          >
                            {step.title}
                          </Heading>
                          <Text
                            color={datifyyTheme.colors.text.secondary}
                            lineHeight="relaxed"
                            fontSize="md"
                          >
                            {step.desc}
                          </Text>
                        </VStack>
                      </VStack>
                    </Card.Body>
                  </PremiumCard>
                </SlideInSection>
              ))}
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* ==================== SUCCESS STORIES ==================== */}
      <Box
        py={{ base: 28, md: 36, lg: 44 }}
        background={`linear-gradient(180deg,
          ${datifyyTheme.colors.secondary[50]} 0%,
          rgba(255, 255, 255, 0.95) 30%,
          ${datifyyTheme.colors.accent[50]} 70%,
          ${datifyyTheme.colors.primary[50]} 100%
        )`}
        position="relative"
      >
        {/* Decorative elements */}
        <Box
          position="absolute"
          top="8%"
          left="4%"
          fontSize="110px"
          opacity={0.05}
          transform="rotate(-12deg)"
        >
          💕
        </Box>
        <Box
          position="absolute"
          bottom="12%"
          right="6%"
          fontSize="130px"
          opacity={0.05}
          transform="rotate(18deg)"
        >
          💖
        </Box>

        <Container maxW="1400px" px={{ base: 6, md: 10, lg: 14 }}>
          <VStack gap={28}>
            {/* Header */}
            <ScaleInSection>
              <VStack textAlign="center" gap={8} maxW="1000px" mx="auto">
                <HeartbeatBadge>
                  <Badge
                    bg={datifyyTheme.colors.primary.gradient}
                    color="white"
                    px={10}
                    py={3}
                    borderRadius="full"
                    fontSize="md"
                    fontWeight="800"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    boxShadow="0 12px 35px rgba(244, 63, 94, 0.38)"
                  >
                    💑 Real Love, Real Stories
                  </Badge>
                </HeartbeatBadge>
                <RomanticText size={{ base: "3xl", md: "5xl", lg: "6xl" }} textAlign="center" lineHeight="1.1">
                  Love Stories That
                  <br />
                  Make You Believe
                </RomanticText>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  color={datifyyTheme.colors.text.secondary}
                  fontWeight="600"
                  lineHeight="1.6"
                  maxW="900px"
                >
                  These couples found their{' '}
                  <Text as="span" color={datifyyTheme.colors.primary[600]} fontWeight="800">
                    soulmate
                  </Text>
                  {' '}on Datifyy. Your love story could be next 💕
                </Text>
              </VStack>
            </ScaleInSection>

            {/* Testimonials */}
            <Grid
              templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }}
              gap={12}
              w="full"
            >
              {[
                {
                  name: "Priya & Arjun",
                  location: "Mumbai",
                  story: "The verification process made us feel safe from day one. Every conversation felt meaningful. We're now planning our future together!",
                  duration: "Engaged after 4 months",
                },
                {
                  name: "Ananya & Rahul",
                  location: "Bangalore",
                  story: "Unlike other apps, Datifyy's curated matches were spot-on. The admin support made everything effortless. Found my perfect match!",
                  duration: "Together 8 months",
                },
                {
                  name: "Meera & Vikram",
                  location: "Delhi",
                  story: "Quality over quantity. Every match was verified and genuine. The best decision we made was trusting Datifyy's process.",
                  duration: "Married 3 months ago",
                },
              ].map((story, i) => (
                <PremiumCard key={i}>
                  <Card.Body>
                    <VStack gap={8} align="start">
                      <HStack gap={5}>
                        <Box
                          w="85px"
                          h="85px"
                          borderRadius="full"
                          bg={datifyyTheme.colors.primary.gradient}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="42px"
                          boxShadow={datifyyTheme.shadows.glow}
                        >
                          💑
                        </Box>
                        <VStack align="start" gap={1}>
                          <Text fontWeight="800" fontSize="lg" color={datifyyTheme.colors.text.primary}>
                            {story.name}
                          </Text>
                          <Text fontSize="sm" color={datifyyTheme.colors.text.tertiary} fontWeight="600">
                            📍 {story.location}
                          </Text>
                        </VStack>
                      </HStack>

                      <HStack gap={0.5}>
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <Text key={i} color={datifyyTheme.colors.accent[500]} fontSize="lg">
                            ⭐
                          </Text>
                        ))}
                      </HStack>

                      <Text
                        color={datifyyTheme.colors.text.secondary}
                        lineHeight="relaxed"
                        fontSize="md"
                        fontStyle="italic"
                      >
                        "{story.story}"
                      </Text>

                      <HStack justify="space-between" w="full" pt={3}>
                        <Badge
                          bg={datifyyTheme.colors.primary.gradient}
                          color="white"
                          borderRadius="full"
                          px={5}
                          py={1.5}
                          fontSize="xs"
                          fontWeight="700"
                          boxShadow={datifyyTheme.shadows.button}
                        >
                          {story.duration}
                        </Badge>
                        <Text fontSize="2xl">💕</Text>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </PremiumCard>
              ))}
            </Grid>

            {/* CTA */}
            <Button
              onClick={handleGetStarted}
              size="lg"
              bg={datifyyTheme.colors.secondary.gradient}
              color="white"
              px={18}
              py={8}
              fontSize="lg"
              borderRadius="full"
              fontWeight="700"
              boxShadow={datifyyTheme.shadows.premium}
              _hover={{
                transform: 'translateY(-4px) scale(1.05)',
                boxShadow: datifyyTheme.shadows.glowStrong,
              }}
              transition="all 0.35s ease"
            >
              Start Your Love Story 💖
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* ==================== FEATURES ==================== */}
      <Box
        py={{ base: 28, md: 36, lg: 44 }}
        background={`linear-gradient(180deg,
          ${datifyyTheme.colors.primary[50]} 0%,
          #ffffff 50%,
          ${datifyyTheme.colors.primary[50]} 100%
        )`}
      >
        <Container maxW="1400px" px={{ base: 6, md: 10, lg: 14 }}>
          <VStack gap={24}>
            {/* Header */}
            <VStack textAlign="center" gap={7} maxW="900px" mx="auto">
              <PulsingBadge>
                <Badge
                  bg={datifyyTheme.colors.accent.gradient}
                  color="white"
                  px={8}
                  py={2.5}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="700"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  boxShadow="0 10px 28px rgba(217, 70, 239, 0.35)"
                >
                  ✨ Why Datifyy Is Different
                </Badge>
              </PulsingBadge>
              <RomanticText size={{ base: "3xl", md: "5xl", lg: "6xl" }} textAlign="center">
                Premium Features for Real Love
              </RomanticText>
            </VStack>

            {/* Features Grid */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={12}
            >
              {[
                {
                  icon: '🛡️',
                  title: '100% Verified Profiles',
                  desc: 'Every member verified through Government ID, workplace confirmation, and photo validation. No bots, no fake profiles.',
                  gradient: datifyyTheme.colors.primary.gradient,
                },
                {
                  icon: '🎯',
                  title: 'Expert-Curated Matches',
                  desc: 'Relationship experts combined with AI ensure every match is highly compatible based on your preferences.',
                  gradient: datifyyTheme.colors.accent.gradient,
                },
                {
                  icon: '💬',
                  title: '24/7 Dating Concierge',
                  desc: 'Personal guidance from certified relationship coaches anytime. Get advice and support throughout your journey.',
                  gradient: datifyyTheme.colors.trust.gradient,
                },
                {
                  icon: '📹',
                  title: 'Safe Video Dates',
                  desc: 'Built-in video calling with moderation features. Meet safely before meeting in person, all within our app.',
                  gradient: datifyyTheme.colors.secondary.gradient,
                },
                {
                  icon: '🔒',
                  title: 'Bank-Level Security',
                  desc: 'Your data is encrypted and never shared. We take your privacy seriously with enterprise-grade security.',
                  gradient: datifyyTheme.colors.primary.gradient,
                },
                {
                  icon: '💝',
                  title: 'Love Guarantee',
                  desc: 'Find meaningful connection in 6 months or get premium features free. We\'re confident you\'ll find your match.',
                  gradient: datifyyTheme.colors.accent.gradient,
                },
              ].map((feature, i) => (
                <GlassCard key={i} p={10}>
                  <VStack align="start" gap={8}>
                    <Box
                      fontSize="60px"
                      p={6}
                      bg={feature.gradient}
                      borderRadius="3xl"
                      display="inline-flex"
                      boxShadow={datifyyTheme.shadows.glow}
                    >
                      {feature.icon}
                    </Box>

                    <VStack align="start" gap={4}>
                      <Heading
                        size="lg"
                        color={datifyyTheme.colors.text.primary}
                        fontWeight="800"
                        fontFamily={datifyyTheme.fonts.heading}
                      >
                        {feature.title}
                      </Heading>
                      <Text
                        color={datifyyTheme.colors.text.secondary}
                        lineHeight="relaxed"
                        fontSize="md"
                      >
                        {feature.desc}
                      </Text>
                    </VStack>
                  </VStack>
                </GlassCard>
              ))}
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* ==================== STATISTICS ==================== */}
      <Box
        py={{ base: 24, md: 32 }}
        background={datifyyTheme.colors.primary.gradient}
        position="relative"
      >
        <Container maxW="1200px" px={{ base: 6, md: 10 }}>
          <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap={10}
            textAlign="center"
          >
            {[
              { number: '10,000+', label: 'Verified Members' },
              { number: '2,500+', label: 'Matches Made' },
              { number: '850+', label: 'Success Stories' },
              { number: '4.9/5', label: 'User Rating' },
            ].map((stat, i) => (
              <VStack key={i} gap={3}>
                <Heading
                  size="5xl"
                  color="white"
                  fontWeight="900"
                  fontFamily={datifyyTheme.fonts.heading}
                >
                  {stat.number}
                </Heading>
                <Text
                  fontSize="lg"
                  color="whiteAlpha.950"
                  fontWeight="600"
                  letterSpacing="wide"
                >
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ==================== FINAL CTA ==================== */}
      <Box
        py={{ base: 36, md: 44, lg: 52 }}
        background={`
          radial-gradient(ellipse at top, ${datifyyTheme.colors.primary[500]}, ${datifyyTheme.colors.primary[700]}),
          radial-gradient(ellipse at bottom, ${datifyyTheme.colors.accent[600]}, ${datifyyTheme.colors.accent[800]})
        `}
        position="relative"
        overflow="hidden"
      >
        {/* Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.08}
          background="repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,255,255,.1) 50px, rgba(255,255,255,.1) 100px)"
        />

        {/* Floating Hearts */}
        <FloatingHeart position="absolute" top="12%" left="10%" fontSize="100px" opacity={0.1} delay={0}>
          💕
        </FloatingHeart>
        <FloatingHeart position="absolute" bottom="18%" right="12%" fontSize="95px" opacity={0.12} delay={3}>
          💖
        </FloatingHeart>

        <Container maxW="1300px" px={{ base: 6, md: 10, lg: 14 }} position="relative" zIndex={1}>
          <VStack gap={14} textAlign="center">
            <VStack gap={8}>
              <Heading
                size={{ base: "3xl", md: "5xl", lg: "7xl" }}
                color="white"
                fontWeight="900"
                fontFamily={datifyyTheme.fonts.heading}
                letterSpacing="tighter"
                lineHeight="1.05"
              >
                Ready to Find Your
                <br />
                Perfect Match?
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "2xl" }}
                color="whiteAlpha.950"
                maxW="900px"
                lineHeight="relaxed"
                fontWeight="500"
              >
                Join 10,000+ verified singles who chose quality over endless swiping.
                <br />
                <Text as="span" fontWeight="700">
                  Your meaningful connection starts here.
                </Text>
              </Text>
            </VStack>

            <Box w="full" maxW="800px">
              <GlassCard p={4} bg="rgba(255, 255, 255, 0.95)">
                <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
                  <Input
                    placeholder="Enter your email to find love"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="white"
                    color={datifyyTheme.colors.text.primary}
                    border="2px solid transparent"
                    size="lg"
                    fontSize="md"
                    borderRadius="2xl"
                    px={7}
                    py={8}
                    fontWeight="500"
                    _placeholder={{ color: 'gray.400' }}
                    _focus={{
                      outline: 'none',
                      borderColor: datifyyTheme.colors.primary[500],
                      boxShadow: `0 0 0 3px ${datifyyTheme.colors.primary[200]}`
                    }}
                  />
                  <Button
                    onClick={handleGetStarted}
                    bg="white"
                    color={datifyyTheme.colors.primary[700]}
                    size="lg"
                    px={12}
                    py={8}
                    fontSize="md"
                    borderRadius="2xl"
                    fontWeight="700"
                    minW={{ base: 'full', sm: '260px' }}
                    boxShadow="0 10px 28px rgba(0, 0, 0, 0.16)"
                    _hover={{
                      transform: 'scale(1.05)',
                      boxShadow: '0 18px 44px rgba(0, 0, 0, 0.25)',
                    }}
                    transition="all 0.35s ease"
                  >
                    Start Your Journey 💕
                  </Button>
                </Stack>
              </GlassCard>

              <Text fontSize="sm" color="whiteAlpha.950" pt={7} fontWeight="600">
                🎁 Get 7 days of Premium features FREE • No credit card required
              </Text>
            </Box>

            {/* App Store Buttons */}
            <HStack gap={5} pt={10} flexWrap="wrap" justify="center">
              {[
                { icon: "🍎", title: "App Store", subtitle: "Download on the" },
                { icon: "▶️", title: "Google Play", subtitle: "Get it on" },
              ].map((store, i) => (
                <Button
                  key={i}
                  bg="rgba(255, 255, 255, 0.16)"
                  backdropFilter="blur(10px)"
                  color="white"
                  border="2px solid rgba(255, 255, 255, 0.3)"
                  px={10}
                  py={8}
                  borderRadius="2xl"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-3px)',
                    borderColor: 'rgba(255, 255, 255, 0.45)'
                  }}
                  transition="all 0.35s ease"
                >
                  <HStack gap={3}>
                    <Box fontSize="36px">{store.icon}</Box>
                    <VStack align="start" gap={0}>
                      <Text fontSize="2xs" fontWeight="normal" opacity={0.9}>{store.subtitle}</Text>
                      <Text fontSize="lg" fontWeight="bold">{store.title}</Text>
                    </VStack>
                  </HStack>
                </Button>
              ))}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* ==================== FOOTER ==================== */}
      <Box bg={datifyyTheme.colors.gray[900]} color="white" py={{ base: 24, md: 28 }}>
        <Container maxW="1400px" px={{ base: 6, md: 10, lg: 14 }}>
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap={20}
          >
            {/* Brand */}
            <VStack align="start" gap={10}>
              <HStack gap={3}>
                <Box fontSize="50px">💝</Box>
                <VStack align="start" gap={0}>
                  <RomanticText size="2xl" fontWeight="900">
                    Datifyy
                  </RomanticText>
                  <Text fontSize="xs" color="whiteAlpha.700" fontWeight="700" letterSpacing="widest">
                    VERIFIED DATING
                  </Text>
                </VStack>
              </HStack>
              <Text color="whiteAlpha.800" fontSize="sm" lineHeight="relaxed" maxW="300px">
                Where verified hearts find real love. Building meaningful connections through trust,
                expert curation, and genuine care.
              </Text>
              <HStack gap={6} pt={3}>
                {['📱', '📷', '🐦', '💼'].map((icon, i) => (
                  <Box
                    key={i}
                    fontSize="28px"
                    cursor="pointer"
                    opacity={0.7}
                    _hover={{ opacity: 1, transform: 'scale(1.3)' }}
                    transition="all 0.35s ease"
                  >
                    {icon}
                  </Box>
                ))}
              </HStack>
            </VStack>

            {/* Links */}
            {[
              { title: "Product", links: ['Home', 'How it Works', 'Features', 'Success Stories', 'Pricing'] },
              { title: "Safety & Trust", links: ['Trust & Safety', 'Community Guidelines', 'Safety Tips', 'Report Issue'] },
              { title: "Company", links: ['About Us', 'Careers', 'Press', 'Contact'] },
            ].map((section, i) => (
              <VStack key={i} align="start" gap={6}>
                <Text fontWeight="bold" fontSize="lg">{section.title}</Text>
                {section.links.map((link, j) => (
                  <Link
                    key={j}
                    color="whiteAlpha.700"
                    fontSize="sm"
                    _hover={{ color: 'white', textDecoration: 'none', transform: 'translateX(3px)' }}
                    transition="all 0.3s"
                  >
                    {link}
                  </Link>
                ))}
              </VStack>
            ))}
          </Grid>

          <Box borderTop="1px solid" borderColor="whiteAlpha.200" mt={20} pt={10}>
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={6}
              direction={{ base: 'column', md: 'row' }}
            >
              <HStack gap={2}>
                <Text fontSize="xl">💕</Text>
                <Text color="whiteAlpha.700" fontSize="sm" fontWeight="500">
                  © 2024 Datifyy. Made with love in India
                </Text>
              </HStack>
              <HStack gap={8}>
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((link, i) => (
                  <Link
                    key={i}
                    color="whiteAlpha.700"
                    fontSize="sm"
                    _hover={{ color: 'white', textDecoration: 'none' }}
                  >
                    {link}
                  </Link>
                ))}
              </HStack>
            </Flex>
          </Box>
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
