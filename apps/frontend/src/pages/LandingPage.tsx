/**
 * Datifyy Landing Page - Romantic Pink Theme
 * World-Class Dating Platform with Love-First Design
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

// Romantic Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  33% { transform: translateY(-30px) translateX(15px) rotate(8deg); }
  66% { transform: translateY(-18px) translateX(-12px) rotate(-6deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.88); }
`;

const shimmer = keyframes`
  0% { background-position: -1200px 0; }
  100% { background-position: 1200px 0; }
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

// Styled Components
const RomanticText = styled(Heading)`
  background: ${datifyyTheme.colors.text.gradient};
  background-size: 200% 200%;
  animation: ${shimmer} 8s linear infinite;
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
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: ${datifyyTheme.radii['3xl']};
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${datifyyTheme.shadows.glass};
  transition: all ${datifyyTheme.transitions.slow};

  &:hover {
    transform: translateY(-16px) scale(1.03);
    box-shadow: ${datifyyTheme.shadows.premium};
    border-color: rgba(244, 63, 94, 0.4);
  }
`;

const PremiumCard = styled(Card.Root)`
  background: linear-gradient(145deg, #ffffff 0%, ${datifyyTheme.colors.primary[50]} 100%);
  border-radius: ${datifyyTheme.radii['3xl']};
  padding: ${datifyyTheme.space[12]};
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
      rgba(244, 63, 94, 0.15),
      rgba(217, 70, 239, 0.12),
      transparent
    );
    transition: left 0.8s ease;
  }

  &:hover {
    transform: translateY(-20px) scale(1.04);
    box-shadow: ${datifyyTheme.shadows.cardHover};
    border-color: ${datifyyTheme.colors.primary[300]};

    &::before {
      left: 100%;
    }
  }
`;

const FloatingHeart = styled(Box)<{ delay?: number }>`
  animation: ${float} 14s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
  pointer-events: none;
  filter: blur(1.5px);
  opacity: 0.15;
`;

const PulsingBadge = styled(Box)`
  animation: ${pulse} 3.5s ease-in-out infinite;
`;

const ShimmerButton = styled(Button)`
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 220%;
    height: 220%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.35) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(35deg);
    animation: ${shimmer} 3.5s infinite;
  }
`;

const FadeInSection = styled(Box)`
  animation: ${fadeInUp} 0.8s ease-out;
`;

export const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');

  return (
    <Box w="full" position="relative" bg={datifyyTheme.colors.background.primary}>
      {/* ROMANTIC HERO SECTION */}
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
          { emoji: '💕', top: '12%', left: '8%', delay: 0, size: '95px' },
          { emoji: '💖', top: '22%', right: '12%', delay: 2, size: '80px' },
          { emoji: '💗', bottom: '18%', left: '15%', delay: 4, size: '88px' },
          { emoji: '💝', bottom: '28%', right: '10%', delay: 3, size: '75px' },
          { emoji: '❤️', top: '55%', left: '6%', delay: 5, size: '70px' },
          { emoji: '💓', top: '40%', right: '5%', delay: 6, size: '82px' },
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

        <Container maxW="1600px" px={{ base: 6, md: 12, lg: 16 }} py={{ base: 24, md: 32, lg: 40 }}>
          <FadeInSection>
            <VStack gap={20} align="center" textAlign="center">
              {/* Launch Badge */}
              <PulsingBadge>
                <Badge
                  bg={datifyyTheme.colors.accent.gradient}
                  color="white"
                  px={10}
                  py={3}
                  borderRadius="full"
                  fontSize="md"
                  fontWeight="700"
                  letterSpacing="wide"
                  boxShadow="0 10px 30px rgba(217, 70, 239, 0.45)"
                  textTransform="uppercase"
                >
                  ✨ Just Launched • Join 10,000+ Verified Singles
                </Badge>
              </PulsingBadge>

              {/* Main Headline */}
              <VStack gap={8} maxW="1400px">
                <Heading
                  size={{ base: "4xl", md: "6xl", lg: "7xl" }}
                  color={datifyyTheme.colors.text.primary}
                  fontWeight="900"
                  fontFamily={datifyyTheme.fonts.heading}
                  letterSpacing="tighter"
                  lineHeight="1"
                >
                  Where Verified Hearts
                </Heading>
                <RomanticText
                  size={{ base: "4xl", md: "6xl", lg: "7xl" }}
                  fontWeight="900"
                  lineHeight="1"
                >
                  Find Real Love
                </RomanticText>
                <HStack gap={5} pt={6}>
                  <Text fontSize="5xl">💕</Text>
                  <Text fontSize="5xl">✨</Text>
                  <Text fontSize="5xl">💖</Text>
                </HStack>
              </VStack>

              {/* Subheadline */}
              <Text
                fontSize={{ base: "lg", md: "2xl", lg: "3xl" }}
                color={datifyyTheme.colors.text.secondary}
                maxW="1100px"
                lineHeight="relaxed"
                fontWeight="500"
              >
                India's most trusted dating platform. 100% verified profiles. Expert-curated matches.
                <br />
                <Text as="span" color={datifyyTheme.colors.primary[600]} fontWeight="700">
                  Real people, real connections, real love.
                </Text>
              </Text>

              {/* Trust Badges */}
              <Grid
                templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                gap={{ base: 10, md: 14 }}
                w="full"
                maxW="1200px"
                pt={12}
              >
                {[
                  { icon: "✓", label: "100% Verified", subtext: "Government ID", gradient: datifyyTheme.colors.primary.gradient },
                  { icon: "🔒", label: "Bank-Level Security", subtext: "End-to-end encrypted", gradient: datifyyTheme.colors.trust.gradient },
                  { icon: "👥", label: "10,000+ Members", subtext: "Join the community", gradient: datifyyTheme.colors.secondary.gradient },
                  { icon: "⭐", label: "4.9/5 Rating", subtext: "Loved by users", gradient: datifyyTheme.colors.accent.gradient },
                ].map((metric, i) => (
                  <GlassCard key={i} p={10} textAlign="center">
                    <VStack gap={5}>
                      <Box
                        fontSize="5xl"
                        w="90px"
                        h="90px"
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
                      <VStack gap={2}>
                        <Text fontWeight="800" fontSize="lg" color={datifyyTheme.colors.text.primary}>
                          {metric.label}
                        </Text>
                        <Text fontSize="sm" color={datifyyTheme.colors.text.tertiary} fontWeight="500">
                          {metric.subtext}
                        </Text>
                      </VStack>
                    </VStack>
                  </GlassCard>
                ))}
              </Grid>

              {/* Premium CTA */}
              <Box w="full" maxW="800px" pt={12}>
                <GlassCard p={4}>
                  <Stack direction={{ base: 'column', sm: 'row' }} gap={4}>
                    <Input
                      placeholder="Enter your email to find love"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      border="2px solid"
                      borderColor="transparent"
                      fontSize="lg"
                      px={8}
                      py={8}
                      bg="white"
                      borderRadius="2xl"
                      fontWeight="500"
                      _focus={{
                        outline: 'none',
                        borderColor: datifyyTheme.colors.primary[400],
                        boxShadow: `0 0 0 4px ${datifyyTheme.colors.primary[100]}`
                      }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                    <ShimmerButton
                      bg={datifyyTheme.colors.primary.gradient}
                      color="white"
                      px={14}
                      py={8}
                      fontSize="lg"
                      borderRadius="2xl"
                      fontWeight="700"
                      boxShadow={datifyyTheme.shadows.button}
                      _hover={{
                        transform: 'scale(1.06)',
                        boxShadow: datifyyTheme.shadows.buttonHover,
                      }}
                      transition="all 0.35s ease"
                      minW={{ base: 'full', sm: '260px' }}
                    >
                      Start Free  💕
                    </ShimmerButton>
                  </Stack>
                </GlassCard>

                <HStack justify="center" gap={12} pt={7} fontSize="md" color={datifyyTheme.colors.text.tertiary} fontWeight="600">
                  {[
                    { icon: "✓", text: "Free forever" },
                    { icon: "🔒", text: "100% secure" },
                    { icon: "⚡", text: "2-min setup" },
                  ].map((item, i) => (
                    <HStack key={i} gap={2}>
                      <Text fontSize="lg" color={datifyyTheme.colors.primary[500]}>{item.icon}</Text>
                      <Text>{item.text}</Text>
                    </HStack>
                  ))}
                </HStack>
              </Box>
            </VStack>
          </FadeInSection>
        </Container>
      </Box>

      {/* SUCCESS STORIES SECTION */}
      <Box
        py={{ base: 32, md: 40, lg: 48 }}
        background={`linear-gradient(180deg,
          ${datifyyTheme.colors.primary[50]} 0%,
          ${datifyyTheme.colors.accent[50]} 50%,
          ${datifyyTheme.colors.primary[50]} 100%
        )`}
      >
        <Container maxW="1600px" px={{ base: 6, md: 12, lg: 16 }}>
          <VStack gap={28}>
            {/* Header */}
            <VStack textAlign="center" gap={8} maxW="1000px" mx="auto">
              <PulsingBadge>
                <Badge
                  bg={datifyyTheme.colors.primary.gradient}
                  color="white"
                  px={10}
                  py={3}
                  borderRadius="full"
                  fontSize="md"
                  fontWeight="700"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  boxShadow={datifyyTheme.shadows.button}
                >
                  💑 Real Love Stories
                </Badge>
              </PulsingBadge>
              <RomanticText size={{ base: "3xl", md: "5xl", lg: "6xl" }} textAlign="center">
                They Found Their Forever
              </RomanticText>
              <Text
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color={datifyyTheme.colors.text.secondary}
                fontWeight="500"
                lineHeight="relaxed"
                maxW="900px"
              >
                Join thousands of verified couples who found genuine love on Datifyy
              </Text>
            </VStack>

            {/* Testimonials */}
            <Grid
              templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }}
              gap={14}
              w="full"
            >
              {[
                {
                  name: "Priya & Arjun",
                  location: "Mumbai",
                  story: "The verification process made us feel safe from day one. Every conversation felt meaningful. We are now planning our future together!",
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
                    <VStack gap={10} align="start">
                      <HStack gap={6}>
                        <Box
                          w="95px"
                          h="95px"
                          borderRadius="full"
                          bg={datifyyTheme.colors.primary.gradient}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="46px"
                          boxShadow={datifyyTheme.shadows.glow}
                        >
                          💑
                        </Box>
                        <VStack align="start" gap={2}>
                          <Text fontWeight="800" fontSize="xl" color={datifyyTheme.colors.text.primary}>
                            {story.name}
                          </Text>
                          <Text fontSize="md" color={datifyyTheme.colors.text.tertiary} fontWeight="600">
                            📍 {story.location}
                          </Text>
                        </VStack>
                      </HStack>

                      <HStack gap={1}>
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <Text key={i} color={datifyyTheme.colors.accent[500]} fontSize="xl">
                            ⭐
                          </Text>
                        ))}
                      </HStack>

                      <Text
                        color={datifyyTheme.colors.text.secondary}
                        lineHeight="relaxed"
                        fontSize="lg"
                        fontStyle="italic"
                      >
                        "{story.story}"
                      </Text>

                      <HStack justify="space-between" w="full" pt={4}>
                        <Badge
                          bg={datifyyTheme.colors.primary.gradient}
                          color="white"
                          borderRadius="full"
                          px={6}
                          py={2}
                          fontSize="sm"
                          fontWeight="700"
                          boxShadow={datifyyTheme.shadows.button}
                        >
                          {story.duration}
                        </Badge>
                        <Text fontSize="3xl">💕</Text>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </PremiumCard>
              ))}
            </Grid>

            {/* CTA */}
            <ShimmerButton
              size="lg"
              bg={datifyyTheme.colors.secondary.gradient}
              color="white"
              px={20}
              py={9}
              fontSize="xl"
              borderRadius="full"
              fontWeight="700"
              boxShadow={datifyyTheme.shadows.premium}
              _hover={{
                transform: 'translateY(-4px) scale(1.06)',
                boxShadow: datifyyTheme.shadows.glowStrong,
              }}
              transition="all 0.35s ease"
            >
              Read More Success Stories  →
            </ShimmerButton>
          </VStack>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Box
        py={{ base: 32, md: 40, lg: 48 }}
        background={`linear-gradient(180deg,
          ${datifyyTheme.colors.secondary[50]} 0%,
          #ffffff 50%,
          ${datifyyTheme.colors.secondary[50]} 100%
        )`}
      >
        <Container maxW="1600px" px={{ base: 6, md: 12, lg: 16 }}>
          <VStack gap={28}>
            {/* Header */}
            <VStack textAlign="center" gap={8} maxW="1000px" mx="auto">
              <PulsingBadge>
                <Badge
                  bg={datifyyTheme.colors.secondary.gradient}
                  color="white"
                  px={10}
                  py={3}
                  borderRadius="full"
                  fontSize="md"
                  fontWeight="700"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  boxShadow="0 10px 30px rgba(249, 115, 22, 0.4)"
                >
                  ✨ Why Datifyy Is Different
                </Badge>
              </PulsingBadge>
              <RomanticText size={{ base: "3xl", md: "5xl", lg: "6xl" }} textAlign="center">
                Dating Reimagined with Love & Trust
              </RomanticText>
            </VStack>

            {/* Features Grid */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={14}
            >
              {[
                {
                  icon: '🛡️',
                  title: '100% Verified Profiles',
                  desc: 'Every member verified through Government ID, workplace confirmation, and photo validation. No bots, no fake profiles, just real people looking for love.',
                  gradient: datifyyTheme.colors.primary.gradient,
                },
                {
                  icon: '🎯',
                  title: 'Expert-Curated Matches',
                  desc: 'Our team of relationship experts combined with AI ensures every match is highly compatible based on your deep preferences and values.',
                  gradient: datifyyTheme.colors.accent.gradient,
                },
                {
                  icon: '💬',
                  title: '24/7 Dating Concierge',
                  desc: 'Personal guidance from certified relationship coaches anytime. Get advice, tips, and support throughout your journey to finding love.',
                  gradient: datifyyTheme.colors.trust.gradient,
                },
                {
                  icon: '📹',
                  title: 'Safe Video Dates',
                  desc: 'Built-in video calling with moderation features. Meet safely before meeting in person, all within our secure and private app.',
                  gradient: datifyyTheme.colors.secondary.gradient,
                },
                {
                  icon: '🔒',
                  title: 'Bank-Level Security',
                  desc: 'Your data is encrypted and never shared without consent. We take your privacy and safety seriously with enterprise-grade security protocols.',
                  gradient: datifyyTheme.colors.primary.gradient,
                },
                {
                  icon: '💝',
                  title: 'Love Guarantee',
                  desc: 'Find meaningful connection in 6 months or get premium features free. We are confident you will find your perfect match with us.',
                  gradient: datifyyTheme.colors.accent.gradient,
                },
              ].map((feature, i) => (
                <GlassCard key={i} p={12}>
                  <VStack align="start" gap={10}>
                    <Box
                      fontSize="70px"
                      p={7}
                      bg={feature.gradient}
                      borderRadius="3xl"
                      display="inline-flex"
                      boxShadow={datifyyTheme.shadows.glow}
                    >
                      {feature.icon}
                    </Box>

                    <VStack align="start" gap={5}>
                      <Heading
                        size="xl"
                        color={datifyyTheme.colors.text.primary}
                        fontWeight="800"
                        fontFamily={datifyyTheme.fonts.heading}
                      >
                        {feature.title}
                      </Heading>
                      <Text
                        color={datifyyTheme.colors.text.secondary}
                        lineHeight="relaxed"
                        fontSize="lg"
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

      {/* FINAL CTA */}
      <Box
        py={{ base: 40, md: 48, lg: 56 }}
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
          opacity={0.1}
          background="repeating-linear-gradient(45deg, transparent, transparent 55px, rgba(255,255,255,.12) 55px, rgba(255,255,255,.12) 110px)"
        />

        {/* Floating Hearts */}
        <FloatingHeart position="absolute" top="15%" left="12%" fontSize="110px" opacity={0.12} delay={0}>
          💕
        </FloatingHeart>
        <FloatingHeart position="absolute" bottom="20%" right="15%" fontSize="100px" opacity={0.14} delay={3}>
          💖
        </FloatingHeart>

        <Container maxW="1400px" px={{ base: 6, md: 12, lg: 16 }} position="relative" zIndex={1}>
          <VStack gap={16} textAlign="center">
            <VStack gap={10}>
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
                fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                color="whiteAlpha.950"
                maxW="1000px"
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

            <Box w="full" maxW="850px">
              <GlassCard p={4} bg="rgba(255, 255, 255, 0.95)">
                <Stack direction={{ base: 'column', sm: 'row' }} gap={4}>
                  <Input
                    placeholder="Enter your email to find love"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="white"
                    color={datifyyTheme.colors.text.primary}
                    border="2px solid transparent"
                    size="lg"
                    fontSize="lg"
                    borderRadius="2xl"
                    px={8}
                    py={9}
                    fontWeight="500"
                    _placeholder={{ color: 'gray.400' }}
                    _focus={{
                      outline: 'none',
                      borderColor: datifyyTheme.colors.primary[500],
                      boxShadow: `0 0 0 4px ${datifyyTheme.colors.primary[200]}`
                    }}
                  />
                  <Button
                    bg="white"
                    color={datifyyTheme.colors.primary[700]}
                    size="lg"
                    px={14}
                    py={9}
                    fontSize="lg"
                    borderRadius="2xl"
                    fontWeight="700"
                    minW={{ base: 'full', sm: '280px' }}
                    boxShadow="0 12px 32px rgba(0, 0, 0, 0.18)"
                    _hover={{
                      transform: 'scale(1.07)',
                      boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28)',
                    }}
                    transition="all 0.35s ease"
                  >
                    Start Your Journey 💕
                  </Button>
                </Stack>
              </GlassCard>

              <Text fontSize="md" color="whiteAlpha.950" pt={8} fontWeight="600">
                🎁 Get 7 days of Premium features FREE • No credit card required
              </Text>
            </Box>

            {/* App Store Buttons */}
            <HStack gap={6} pt={12} flexWrap="wrap" justify="center">
              {[
                { icon: "🍎", title: "App Store", subtitle: "Download on the" },
                { icon: "▶️", title: "Google Play", subtitle: "Get it on" },
              ].map((store, i) => (
                <Button
                  key={i}
                  bg="rgba(255, 255, 255, 0.18)"
                  backdropFilter="blur(12px)"
                  color="white"
                  border="2px solid rgba(255, 255, 255, 0.35)"
                  px={12}
                  py={9}
                  borderRadius="2xl"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.28)',
                    transform: 'translateY(-4px)',
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  }}
                  transition="all 0.35s ease"
                >
                  <HStack gap={4}>
                    <Box fontSize="38px">{store.icon}</Box>
                    <VStack align="start" gap={0}>
                      <Text fontSize="xs" fontWeight="normal" opacity={0.92}>{store.subtitle}</Text>
                      <Text fontSize="xl" fontWeight="bold">{store.title}</Text>
                    </VStack>
                  </HStack>
                </Button>
              ))}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* PREMIUM FOOTER */}
      <Box bg={datifyyTheme.colors.gray[900]} color="white" py={{ base: 28, md: 32, lg: 36 }}>
        <Container maxW="1600px" px={{ base: 6, md: 12, lg: 16 }}>
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap={24}
          >
            {/* Brand */}
            <VStack align="start" gap={12}>
              <HStack gap={4}>
                <Box fontSize="56px">💝</Box>
                <VStack align="start" gap={0}>
                  <RomanticText size="2xl" fontWeight="900">
                    Datifyy
                  </RomanticText>
                  <Text fontSize="sm" color="whiteAlpha.700" fontWeight="700" letterSpacing="widest">
                    VERIFIED DATING
                  </Text>
                </VStack>
              </HStack>
              <Text color="whiteAlpha.800" fontSize="md" lineHeight="relaxed" maxW="320px">
                Where verified hearts find real love. Building meaningful connections through trust,
                expert curation, and genuine care.
              </Text>
              <HStack gap={7} pt={4}>
                {['📱', '📷', '🐦', '💼'].map((icon, i) => (
                  <Box
                    key={i}
                    fontSize="32px"
                    cursor="pointer"
                    opacity={0.7}
                    _hover={{ opacity: 1, transform: 'scale(1.4)' }}
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
              <VStack key={i} align="start" gap={8}>
                <Text fontWeight="bold" fontSize="xl">{section.title}</Text>
                {section.links.map((link, j) => (
                  <Link
                    key={j}
                    color="whiteAlpha.700"
                    fontSize="md"
                    _hover={{ color: 'white', textDecoration: 'none', transform: 'translateX(4px)' }}
                    transition="all 0.3s"
                  >
                    {link}
                  </Link>
                ))}
              </VStack>
            ))}
          </Grid>

          <Box borderTop="1px solid" borderColor="whiteAlpha.200" mt={24} pt={12}>
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={8}
              direction={{ base: 'column', md: 'row' }}
            >
              <HStack gap={3}>
                <Text fontSize="2xl">💕</Text>
                <Text color="whiteAlpha.700" fontSize="md" fontWeight="500">
                  © 2024 Datifyy. Made with love in India
                </Text>
              </HStack>
              <HStack gap={10}>
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((link, i) => (
                  <Link
                    key={i}
                    color="whiteAlpha.700"
                    fontSize="md"
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
    </Box>
  );
};
