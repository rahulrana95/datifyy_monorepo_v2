/**
 * Header Component - Enhanced Romantic Design
 * Beautiful navigation header with romantic styling and animations
 */

import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  Container,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useAuthStore } from '../../../features/auth/store/auth.store';
import { AuthModal } from '../../../features/auth/components/AuthModal';
import { datifyyTheme } from '../../../theme/datifyy.theme';

// Romantic heart beat animation
const heartbeat = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.15);
  }
  20%, 40% {
    transform: scale(1);
  }
`;

const LogoText = styled(Text)`
  background: ${datifyyTheme.colors.primary.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: ${datifyyTheme.fonts.heading};
  font-weight: ${datifyyTheme.fontWeights.black};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }

  .heart-icon {
    animation: ${heartbeat} 1.5s ease-in-out infinite;
    font-size: 1.5em;
  }
`;

const GlassHeader = styled(Box)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${datifyyTheme.colors.primary[100]};
  box-shadow: ${datifyyTheme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${datifyyTheme.zIndices.sticky};
  transition: all 0.3s ease;
`;

export const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLoginClick = () => {
    setAuthModalTab('login');
    setIsModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthModalTab('signup');
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <GlassHeader as="header">
        <Container maxW="1400px" px={{ base: 6, md: 10 }}>
          <Flex
            h={{ base: '16', md: '20' }}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Logo */}
            <LogoText fontSize={{ base: '2xl', md: '3xl' }}>
              <span className="heart-icon">💝</span>
              Datifyy
            </LogoText>

            {/* Desktop Navigation */}
            <HStack gap={{ base: 3, md: 4 }} display={{ base: 'none', md: 'flex' }}>
              {isAuthenticated && user ? (
                <HStack gap={4}>
                  <Box
                    bg={datifyyTheme.colors.primary[50]}
                    px={5}
                    py={2}
                    borderRadius="full"
                    border={`2px solid ${datifyyTheme.colors.primary[200]}`}
                  >
                    <Text
                      fontWeight="700"
                      color={datifyyTheme.colors.primary[700]}
                      fontSize="md"
                    >
                      Hi, {user.name} 💕
                    </Text>
                  </Box>
                  <Button variant="ghost" onClick={handleLogout} size="md">
                    Logout
                  </Button>
                </HStack>
              ) : (
                <>
                  <Button variant="ghost" onClick={handleLoginClick} size="md">
                    Login
                  </Button>
                  <Button
                    variant="solid"
                    onClick={handleSignupClick}
                    size="md"
                    px={8}
                  >
                    Sign Up 💕
                  </Button>
                </>
              )}
            </HStack>

            {/* Mobile Menu - Simplified */}
            <HStack gap={2} display={{ base: 'flex', md: 'none' }}>
              {isAuthenticated && user ? (
                <>
                  <Text fontSize="sm" fontWeight="600" color="primary.700">
                    {user.name.split(' ')[0]}
                  </Text>
                  <Button variant="ghost" onClick={handleLogout} size="sm">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={handleLoginClick} size="sm">
                    Login
                  </Button>
                  <Button variant="solid" onClick={handleSignupClick} size="sm">
                    Sign Up
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </GlassHeader>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        defaultTab={authModalTab}
      />
    </>
  );
};
