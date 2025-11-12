/**
 * Header Component
 * Main navigation header with authentication
 */

import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  Container,
} from '@chakra-ui/react';
import { useAuthStore } from '../../../features/auth/store/auth.store';
import { AuthModal } from '../../../features/auth/components/AuthModal';

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
      <Box
        as="header"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        shadow="sm"
        position="sticky"
        top={0}
        zIndex="sticky"
      >
        <Container maxW="container.xl">
          <Flex h="16" alignItems="center" justifyContent="space-between">
            {/* Logo */}
            <Flex alignItems="center" gap={2}>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                fontFamily="heading"
                bgGradient="linear(to-r, primary.500, accent.500)"
                bgClip="text"
                cursor="pointer"
                _hover={{
                  transform: 'scale(1.05)',
                }}
                transition="transform 0.2s"
              >
                Datifyy
              </Text>
            </Flex>

            {/* Desktop Navigation */}
            <HStack gap={4} display={{ base: 'none', md: 'flex' }}>
              {isAuthenticated && user ? (
                <HStack gap={4}>
                  <Text fontWeight="medium" color="gray.700">
                    Hi, {user.name}
                  </Text>
                  <Button
                    variant="ghost"
                    color="gray.700"
                    borderRadius="xl"
                    fontWeight="medium"
                    _hover={{
                      bg: 'rgba(244, 63, 94, 0.08)',
                      color: 'primary.500',
                    }}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </HStack>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    color="gray.700"
                    borderRadius="xl"
                    fontWeight="medium"
                    _hover={{
                      bg: 'rgba(244, 63, 94, 0.08)',
                      color: 'primary.500',
                    }}
                    onClick={handleLoginClick}
                  >
                    Login
                  </Button>
                  <Button
                    bgGradient="linear(to-r, primary.500, primary.400)"
                    color="white"
                    borderRadius="full"
                    fontWeight="semibold"
                    px={6}
                    shadow="button"
                    _hover={{
                      transform: 'translateY(-2px) scale(1.02)',
                      shadow: 'buttonHover',
                    }}
                    onClick={handleSignupClick}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        defaultTab={authModalTab}
      />
    </>
  );
};
