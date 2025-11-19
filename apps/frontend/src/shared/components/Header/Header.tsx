/**
 * Header Component
 * Consistent header for all pages with logo and auth buttons
 */

import {
  Box,
  Flex,
  HStack,
  Button,
  IconButton,
  Text,
  VStack,
  Circle,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import { useAuthStore } from '../../../stores/authStore';

interface HeaderProps {
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
}

export const Header = ({ onOpenLogin, onOpenSignup }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={1000}
      bgGradient="linear(to-r, brand.50, rose.50, pink.50)"
      borderBottomWidth="1px"
      borderColor="brand.200"
      boxShadow="sm"
      backdropFilter="blur(10px)"
    >
      <Flex
        maxW="1400px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
      >
        {/* Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <HStack gap={4} display={{ base: 'none', md: 'flex' }}>
          {!isAuthenticated ? (
            <>
              <Button
                bg="transparent"
                color="brand.600"
                _hover={{ bg: 'brand.50', color: 'brand.700' }}
                _active={{ bg: 'brand.100' }}
                onClick={onOpenLogin}
              >
                Login
              </Button>
              <Button
                bg="brand.500"
                color="white"
                _hover={{ bg: 'brand.600' }}
                _active={{ bg: 'brand.700' }}
                borderRadius="full"
                px={6}
                onClick={onOpenSignup}
              >
                Get Started
              </Button>
            </>
          ) : (
            <Box position="relative">
              <Button
                bg="transparent"
                _hover={{ bg: 'brand.50' }}
                _active={{ bg: 'brand.100' }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <HStack gap={2}>
                  <Circle size="32px" bg="brand.500" color="white" fontWeight="bold" fontSize="sm">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </Circle>
                  <Text fontWeight="medium" color="fg">
                    {user?.name || user?.email?.split('@')[0]}
                  </Text>
                </HStack>
              </Button>
              {isUserMenuOpen && (
                <Box
                  position="absolute"
                  top="100%"
                  right={0}
                  mt={2}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="lg"
                  minW="200px"
                  zIndex={1000}
                >
                  <VStack gap={0} align="stretch">
                    <Button
                      bg="transparent"
                      color="fg"
                      justifyContent="flex-start"
                      _hover={{ bg: 'brand.50', color: 'brand.600' }}
                      onClick={() => {
                        navigate('/profile');
                        setIsUserMenuOpen(false);
                      }}
                    >
                      Profile
                    </Button>
                    <Button
                      bg="transparent"
                      color="fg"
                      justifyContent="flex-start"
                      _hover={{ bg: 'brand.50', color: 'brand.600' }}
                      onClick={() => {
                        navigate('/partner-preferences');
                        setIsUserMenuOpen(false);
                      }}
                    >
                      Partner Preference
                    </Button>
                    <Button
                      bg="transparent"
                      color="fg"
                      justifyContent="flex-start"
                      _hover={{ bg: 'brand.50', color: 'brand.600' }}
                      onClick={() => {
                        navigate('/settings');
                        setIsUserMenuOpen(false);
                      }}
                    >
                      Settings
                    </Button>
                    <Button
                      bg="transparent"
                      color="red.500"
                      justifyContent="flex-start"
                      _hover={{ bg: 'red.50', color: 'red.600' }}
                      onClick={async () => {
                        await logout();
                        navigate('/');
                        setIsUserMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </VStack>
                </Box>
              )}
            </Box>
          )}
        </HStack>

        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          aria-label="Menu"
          variant="ghost"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Box>☰</Box>
        </IconButton>
      </Flex>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <Box
          display={{ base: 'block', md: 'none' }}
          pb={4}
          px={4}
          borderTopWidth="1px"
          borderColor="border"
        >
          <Flex direction="column" gap={2}>
            {!isAuthenticated ? (
              <>
                <Button
                  bg="transparent"
                  color="brand.600"
                  _hover={{ bg: 'brand.50', color: 'brand.700' }}
                  _active={{ bg: 'brand.100' }}
                  w="full"
                  justifyContent="flex-start"
                  onClick={() => {
                    onOpenLogin?.();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  bg="brand.500"
                  color="white"
                  _hover={{ bg: 'brand.600' }}
                  w="full"
                  onClick={() => {
                    onOpenSignup?.();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <Box px={3} py={2} borderBottomWidth="1px" borderColor="border">
                  <HStack gap={2}>
                    <Circle size="32px" bg="brand.500" color="white" fontWeight="bold" fontSize="sm">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </Circle>
                    <Text fontWeight="medium" color="fg">
                      {user?.name || user?.email?.split('@')[0]}
                    </Text>
                  </HStack>
                </Box>
                <Button
                  bg="transparent"
                  color="fg"
                  w="full"
                  justifyContent="flex-start"
                  _hover={{ bg: 'brand.50', color: 'brand.600' }}
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Profile
                </Button>
                <Button
                  bg="transparent"
                  color="fg"
                  w="full"
                  justifyContent="flex-start"
                  _hover={{ bg: 'brand.50', color: 'brand.600' }}
                  onClick={() => {
                    navigate('/partner-preferences');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Partner Preference
                </Button>
                <Button
                  bg="transparent"
                  color="fg"
                  w="full"
                  justifyContent="flex-start"
                  _hover={{ bg: 'brand.50', color: 'brand.600' }}
                  onClick={() => {
                    navigate('/settings');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Settings
                </Button>
                <Button
                  bg="transparent"
                  color="red.500"
                  w="full"
                  justifyContent="flex-start"
                  _hover={{ bg: 'red.50', color: 'red.600' }}
                  onClick={async () => {
                    await logout();
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
};
