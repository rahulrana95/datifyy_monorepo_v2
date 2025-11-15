/**
 * Header Component
 * Consistent header for all pages with logo and auth buttons
 */

import { Box, Flex, HStack, Button, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo/Logo';

interface HeaderProps {
  isAuthenticated?: boolean;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
}

export const Header = ({ isAuthenticated = false, onOpenLogin, onOpenSignup }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  color="fg"
                  _hover={{ bg: 'brand.50', color: 'brand.600' }}
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  color="fg"
                  _hover={{ bg: 'brand.50', color: 'brand.600' }}
                >
                  Profile
                </Button>
              </Link>
            </>
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
                <Link to="/dashboard">
                  <Button variant="ghost" color="fg" w="full" justifyContent="flex-start">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" color="fg" w="full" justifyContent="flex-start">
                    Profile
                  </Button>
                </Link>
              </>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
};
