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
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={1000}
      bg="bg"
      borderBottomWidth="1px"
      borderColor="border"
      boxShadow="sm"
    >
      <Flex
        maxW="1400px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={3}
        align="center"
        justify="space-between"
      >
        {/* Logo and Navigation */}
        <HStack gap={{ base: 4, md: 10 }}>
          {/* Text Logo */}
          <Link to="/">
            <HStack gap={1}>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="800"
                color="brand.600"
                letterSpacing="-0.02em"
              >
                datifyy
              </Text>
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg="rose.500"
                mt={-2}
              />
            </HStack>
          </Link>

          {/* Navigation Links */}
          <HStack gap={1} display={{ base: 'none', md: 'flex' }}>
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                fontWeight="medium"
                color={isActive('/') ? 'brand.600' : 'fg.muted'}
                bg={isActive('/') ? 'brand.50' : 'transparent'}
                _hover={{ bg: 'bg.subtle', color: 'fg' }}
              >
                Home
              </Button>
            </Link>
            <Link to="/partner-preferences">
              <Button
                variant="ghost"
                size="sm"
                fontWeight="medium"
                color={isActive('/partner-preferences') ? 'brand.600' : 'fg.muted'}
                bg={isActive('/partner-preferences') ? 'brand.50' : 'transparent'}
                _hover={{ bg: 'bg.subtle', color: 'fg' }}
              >
                Partner Preferences
              </Button>
            </Link>
          </HStack>
        </HStack>

        {/* Desktop Auth/User Menu */}
        <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                fontWeight="medium"
                color="fg"
                _hover={{ bg: 'bg.subtle' }}
                onClick={onOpenLogin}
              >
                Sign in
              </Button>
              <Button
                bg="brand.600"
                color="white"
                size="sm"
                fontWeight="medium"
                _hover={{ bg: 'brand.700' }}
                _active={{ bg: 'brand.800' }}
                borderRadius="md"
                px={4}
                onClick={onOpenSignup}
              >
                Get Started
              </Button>
            </>
          ) : (
            <Box position="relative">
              <Button
                variant="ghost"
                size="sm"
                bg="transparent"
                color="fg"
                _hover={{ bg: 'bg.muted' }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                px={2}
              >
                <HStack gap={2}>
                  <Circle size="28px" bg="brand.600" color="white" fontWeight="bold" fontSize="xs">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </Circle>
                  <Text fontWeight="medium" fontSize="sm">
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
                  bg="bg"
                  borderWidth="1px"
                  borderColor="border"
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
            {/* Navigation Links */}
            <Button
              bg={isActive('/') ? 'brand.50' : 'transparent'}
              color={isActive('/') ? 'brand.600' : 'fg'}
              w="full"
              justifyContent="flex-start"
              _hover={{ bg: 'brand.50', color: 'brand.600' }}
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
            >
              Home
            </Button>
            <Button
              bg={isActive('/partner-preferences') ? 'brand.50' : 'transparent'}
              color={isActive('/partner-preferences') ? 'brand.600' : 'fg'}
              w="full"
              justifyContent="flex-start"
              _hover={{ bg: 'brand.50', color: 'brand.600' }}
              onClick={() => {
                navigate('/partner-preferences');
                setIsMobileMenuOpen(false);
              }}
            >
              Partner Preferences
            </Button>

            {!isAuthenticated ? (
              <>
                <Box borderTopWidth="1px" borderColor="border" my={2} />
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
