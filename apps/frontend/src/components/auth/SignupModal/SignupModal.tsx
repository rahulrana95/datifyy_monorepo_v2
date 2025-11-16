/**
 * Signup Modal Component
 * Modal for user registration with email, name, and password
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Heading,
  Link,
  Stack,
  Portal,
  IconButton,
} from '@chakra-ui/react';
import { useAuthStore } from '../../../stores/authStore';

export interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSuccess?: () => void;
}

export const SignupModal = ({
  open,
  onClose,
  onLogin,
  onSuccess,
}: SignupModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  // Use Zustand store
  const { signup, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    try {
      await signup(email, password, name);
      onSuccess?.();
      onClose();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setValidationError('');
    clearError();
    onClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Clear form when modal closes
  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setValidationError('');
      clearError();
    }
  }, [open, clearError]);

  if (!open) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={1000}
        onClick={handleClose}
        role="presentation"
      />

      {/* Modal Content */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={1001}
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        minH="500px"
        maxW="440px"
        w="90%"
        p={6}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box mb={6}>
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box>
              <Heading size="xl" color="fg">
                Create Account
              </Heading>
              <Text fontSize="md" color="fg.muted" mt={2}>
                Join us and start your journey
              </Text>
            </Box>
            <IconButton
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              ✕
            </IconButton>
          </Box>
        </Box>

        {/* Body */}
        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={5} align="stretch">
            <Stack gap={2}>
              <Text fontWeight="medium" fontSize="sm" color="fg">
                Full Name <Text as="span" color="red.500">*</Text>
              </Text>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="lg"
                borderColor="gray.300"
                _hover={{ borderColor: 'brand.400' }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                required
              />
            </Stack>

            <Stack gap={2}>
              <Text fontWeight="medium" fontSize="sm" color="fg">
                Email <Text as="span" color="red.500">*</Text>
              </Text>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
                borderColor="gray.300"
                _hover={{ borderColor: 'brand.400' }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                required
              />
            </Stack>

            <Stack gap={2}>
              <Text fontWeight="medium" fontSize="sm" color="fg">
                Password <Text as="span" color="red.500">*</Text>
              </Text>
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                borderColor="gray.300"
                _hover={{ borderColor: 'brand.400' }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                required
              />
            </Stack>

            <Stack gap={2}>
              <Text fontWeight="medium" fontSize="sm" color="fg">
                Confirm Password <Text as="span" color="red.500">*</Text>
              </Text>
              <Input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="lg"
                borderColor="gray.300"
                _hover={{ borderColor: 'brand.400' }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                required
              />
            </Stack>

            {(validationError || error) && (
              <Box
                bg="red.50"
                borderColor="red.300"
                borderWidth="1px"
                borderRadius="md"
                p={3}
              >
                <Text color="red.700" fontSize="sm">
                  {validationError || error}
                </Text>
              </Box>
            )}

            <Button
              type="submit"
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              _active={{ bg: 'brand.700' }}
              loading={isLoading}
              w="full"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>

            <Box textAlign="center">
              <Text fontSize="sm" color="fg.muted">
                Already have an account?{' '}
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    handleClose();
                    onLogin();
                  }}
                  color="brand.600"
                  fontWeight="semibold"
                  _hover={{ color: 'brand.700', textDecoration: 'underline' }}
                >
                  Sign in
                </Link>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Portal>
  );
};
