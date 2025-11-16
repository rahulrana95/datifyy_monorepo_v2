/**
 * Forgot Password Modal Component
 * Modal for requesting password reset via email
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

export interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const ForgotPasswordModal = ({
  open,
  onClose,
  onLogin,
}: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  // Use Zustand store
  const { requestPasswordReset, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleClose = () => {
    setEmail('');
    clearError();
    setSuccess(false);
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
                Reset Password
              </Heading>
              <Text fontSize="md" color="fg.muted" mt={2}>
                {success
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive reset instructions'}
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
        {success ? (
          <VStack gap={5} align="stretch">
            <Box
              bg="green.50"
              borderColor="green.300"
              borderWidth="1px"
              borderRadius="md"
              p={4}
            >
              <Text color="green.700" fontSize="sm">
                If an account exists with this email, you will receive password reset instructions shortly.
                Please check your inbox and spam folder.
              </Text>
            </Box>

            <Button
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              _active={{ bg: 'brand.700' }}
              w="full"
              onClick={() => {
                handleClose();
                onLogin();
              }}
            >
              Back to Sign In
            </Button>

            <Box textAlign="center">
              <Text fontSize="sm" color="fg.muted">
                Didn't receive an email?{' '}
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    setSuccess(false);
                  }}
                  color="brand.600"
                  fontWeight="semibold"
                  _hover={{ color: 'brand.700', textDecoration: 'underline' }}
                >
                  Try again
                </Link>
              </Text>
            </Box>
          </VStack>
        ) : (
          <Box as="form" onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">
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

              {error && (
                <Box
                  bg="red.50"
                  borderColor="red.300"
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                >
                  <Text color="red.700" fontSize="sm">
                    {error}
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
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Box textAlign="center">
                <Text fontSize="sm" color="fg.muted">
                  Remember your password?{' '}
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
        )}
      </Box>
    </Portal>
  );
};
