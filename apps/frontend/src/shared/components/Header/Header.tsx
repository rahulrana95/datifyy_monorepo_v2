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
import { colors } from '../../../theme/colors.reference';

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
  background: ${colors.gradient.brand};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Inter', -apple-system, sans-serif;
  font-weight: 900;
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
  border-bottom: 1px solid ${colors.brand[100]};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1100;
  transition: all 0.3s ease;
`;

const LoginButton = styled(Button)`
  height: 40px;
  padding: 0 20px;
  background: transparent !important;
  color: ${colors.text.primary} !important;
  font-weight: 600;
  font-size: 15px;
  border-radius: 10px;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none !important;

  &:hover {
    background: ${colors.brand[50]} !important;
    color: ${colors.brand[600]} !important;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    background: ${colors.brand[100]} !important;
  }

  &:focus {
    box-shadow: none !important;
    outline: none !important;
  }

  &:focus-visible {
    outline: 2px solid ${colors.brand[500]} !important;
    outline-offset: 2px;
  }
`;

const SignUpButton = styled(Button)`
  height: 44px;
  padding: 0 28px;
  background: ${colors.gradient.brand} !important;
  color: white !important;
  font-weight: 600;
  font-size: 15px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(232, 93, 117, 0.25) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 6px 20px rgba(232, 93, 117, 0.35) !important;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    box-shadow: 0 4px 12px rgba(232, 93, 117, 0.25) !important;
    outline: none !important;
  }

  &:focus-visible {
    outline: 2px solid ${colors.brand[500]} !important;
    outline-offset: 2px;
  }
`;

const LogoutButton = styled(Button)`
  height: 40px;
  padding: 0 20px;
  background: transparent !important;
  color: ${colors.text.secondary} !important;
  font-weight: 600;
  font-size: 15px;
  border-radius: 10px;
  border: 2px solid ${colors.gray[200]} !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none !important;

  &:hover {
    background: ${colors.nope[50]} !important;
    color: ${colors.nope[600]} !important;
    border-color: ${colors.nope[200]} !important;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    box-shadow: none !important;
    outline: none !important;
  }

  &:focus-visible {
    outline: 2px solid ${colors.brand[500]} !important;
    outline-offset: 2px;
  }
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
            <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
              {isAuthenticated && user ? (
                <HStack gap={3}>
                  <Box
                    bg={colors.brand[50]}
                    px={5}
                    py={2}
                    borderRadius="full"
                    border={`2px solid ${colors.brand[200]}`}
                  >
                    <Text
                      fontWeight="600"
                      color={colors.brand[700]}
                      fontSize="15px"
                    >
                      Hi, {user.name} 💕
                    </Text>
                  </Box>
                  <LogoutButton onClick={handleLogout}>
                    Logout
                  </LogoutButton>
                </HStack>
              ) : (
                <>
                  <LoginButton onClick={handleLoginClick}>
                    Login
                  </LoginButton>
                  <SignUpButton onClick={handleSignupClick}>
                    Sign Up
                  </SignUpButton>
                </>
              )}
            </HStack>

            {/* Mobile Menu - Simplified */}
            <HStack gap={2} display={{ base: 'flex', md: 'none' }}>
              {isAuthenticated && user ? (
                <>
                  <Text fontSize="13px" fontWeight="600" color={colors.brand[700]}>
                    {user.name.split(' ')[0]}
                  </Text>
                  <LogoutButton onClick={handleLogout} style={{ height: '36px', padding: '0 16px', fontSize: '14px' }}>
                    Logout
                  </LogoutButton>
                </>
              ) : (
                <>
                  <LoginButton onClick={handleLoginClick} style={{ height: '36px', padding: '0 16px', fontSize: '14px' }}>
                    Login
                  </LoginButton>
                  <SignUpButton onClick={handleSignupClick} style={{ height: '40px', padding: '0 20px', fontSize: '14px' }}>
                    Sign Up
                  </SignUpButton>
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
