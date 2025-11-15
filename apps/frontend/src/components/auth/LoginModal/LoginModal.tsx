/**
 * Login Modal Component
 * Modal for user login with email and password
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
import { create } from '@bufbuild/protobuf';
import { AuthService } from '../../../services/auth';
import { ApiClient } from '../../../services/base';
import type { TokenPair } from '../../../gen/auth/v1/messages_pb';
import { EmailPasswordCredentialsSchema } from '../../../gen/auth/v1/messages_pb';

export interface LoginModalTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onForgotPassword: () => void;
  onSignup: () => void;
  onSuccess?: (tokens: LoginModalTokens) => void;
}

export const LoginModal = ({
  open,
  onClose,
  onForgotPassword,
  onSignup,
  onSuccess,
}: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const extractTokens = (tokenPair: TokenPair): LoginModalTokens | null => {
    if (!tokenPair.accessToken?.token || !tokenPair.refreshToken?.token) {
      return null;
    }
    return {
      accessToken: tokenPair.accessToken.token,
      refreshToken: tokenPair.refreshToken.token,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual API base URL from config
      const apiClient = new ApiClient({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080' });
      const authService = new AuthService(apiClient);

      const response = await authService.loginWithEmail({
        credentials: create(EmailPasswordCredentialsSchema, {
          email,
          password,
          name: '',
        }),
      });

      if (response.tokens) {
        const tokens = extractTokens(response.tokens);
        if (tokens) {
          onSuccess?.(tokens);
          onClose();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
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
      setEmail('');
      setPassword('');
      setError('');
    }
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
                Welcome Back
              </Heading>
              <Text fontSize="md" color="fg.muted" mt={2}>
                Sign in to continue your journey
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                borderColor="gray.300"
                _hover={{ borderColor: 'brand.400' }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                required
              />
            </Stack>

            <Box textAlign="right">
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                  onForgotPassword();
                }}
                color="brand.600"
                fontSize="sm"
                fontWeight="medium"
                _hover={{ color: 'brand.700', textDecoration: 'underline' }}
              >
                Forgot password?
              </Link>
            </Box>

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
              loading={loading}
              w="full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box textAlign="center">
              <Text fontSize="sm" color="fg.muted">
                Don't have an account?{' '}
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    handleClose();
                    onSignup();
                  }}
                  color="brand.600"
                  fontWeight="semibold"
                  _hover={{ color: 'brand.700', textDecoration: 'underline' }}
                >
                  Sign up
                </Link>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Portal>
  );
};
