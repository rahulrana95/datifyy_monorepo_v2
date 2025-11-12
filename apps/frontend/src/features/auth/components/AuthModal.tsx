/**
 * Auth Modal Component
 * Handles Login, Signup, and Password Reset flows using Chakra UI v3
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  Input,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { useAuthStore } from '../store/auth.store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register, requestPasswordReset, isLoading } = useAuthStore();

  const handleClose = () => {
    setShowResetPassword(false);
    setResetEmailSent(false);
    setMessage(null);
    setErrors({});
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setResetEmail('');
    onClose();
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!loginEmail || !validateEmail(loginEmail)) {
      setErrors({ email: 'Invalid email address' });
      return;
    }
    if (loginPassword.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    try {
      await login(loginEmail, loginPassword);
      setMessage({ type: 'success', text: 'Welcome back!' });
      setTimeout(handleClose, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (signupName.length < 2) {
      setErrors({ name: 'Name must be at least 2 characters' });
      return;
    }
    if (!signupEmail || !validateEmail(signupEmail)) {
      setErrors({ email: 'Invalid email address' });
      return;
    }
    if (signupPassword.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    try {
      await register(signupEmail, signupPassword, signupName);
      setMessage({ type: 'success', text: 'Account created! Please verify your email.' });
      setTimeout(handleClose, 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not create account',
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!resetEmail || !validateEmail(resetEmail)) {
      setErrors({ email: 'Invalid email address' });
      return;
    }

    try {
      await requestPasswordReset(resetEmail);
      setResetEmailSent(true);
      setMessage({ type: 'success', text: 'Check your inbox for reset instructions.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not send reset email',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(23, 23, 23, 0.6)"
        backdropFilter="blur(8px)"
        zIndex={1400}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={1401}
        bg="white"
        borderRadius="2xl"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        width={{ base: '90%', sm: '400px', md: '450px' }}
        maxHeight="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <VStack gap={6} p={8} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Heading size="lg" fontFamily="heading" color="gray.900">
              {showResetPassword ? 'Reset Password' : 'Welcome to Datifyy'}
            </Heading>
            <Button
              variant="ghost"
              onClick={handleClose}
              size="sm"
              borderRadius="lg"
              _hover={{ bg: 'gray.100' }}
            >
              ✕
            </Button>
          </Flex>

          {/* Message */}
          {message && (
            <Box
              p={3}
              borderRadius="lg"
              bg={message.type === 'success' ? 'green.50' : 'red.50'}
              color={message.type === 'success' ? 'green.700' : 'red.700'}
              fontSize="sm"
            >
              {message.text}
            </Box>
          )}

          {showResetPassword ? (
            // Password Reset Form
            resetEmailSent ? (
              <VStack gap={4} py={4}>
                <Text color="gray.700" textAlign="center">
                  We've sent password reset instructions to your email.
                </Text>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmailSent(false);
                  }}
                >
                  Back to Login
                </Button>
              </VStack>
            ) : (
              <form onSubmit={handleResetPassword}>
                <VStack gap={6} align="stretch">
                  <Text color="gray.600" fontSize="sm">
                    Enter your email address and we'll send you instructions to reset your
                    password.
                  </Text>

                  <VStack gap={2} align="stretch">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Email
                    </Text>
                    <Input
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      type="email"
                      placeholder="you@example.com"
                      borderRadius="xl"
                      borderWidth="2px"
                      borderColor={errors.email ? 'red.500' : 'gray.200'}
                      _focus={{
                        borderColor: 'primary.500',
                        boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1)',
                      }}
                    />
                    {errors.email && (
                      <Text color="red.500" fontSize="sm">
                        {errors.email}
                      </Text>
                    )}
                  </VStack>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    bg="linear-gradient(to right, #f43f5e, #fb7185)"
                    color="white"
                    borderRadius="full"
                    fontWeight="semibold"
                    size="lg"
                    _hover={{
                      transform: 'translateY(-2px) scale(1.02)',
                    }}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Text
                    color="primary.500"
                    fontSize="sm"
                    textAlign="center"
                    onClick={() => setShowResetPassword(false)}
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Back to Login
                  </Text>
                </VStack>
              </form>
            )
          ) : (
            // Login/Signup Tabs
            <>
              {/* Tab Buttons */}
              <Flex gap={2} bg="gray.50" p={1} borderRadius="xl">
                <Button
                  flex={1}
                  borderRadius="lg"
                  fontWeight="semibold"
                  variant={activeTab === 'login' ? 'solid' : 'ghost'}
                  bg={activeTab === 'login' ? 'white' : 'transparent'}
                  color={activeTab === 'login' ? 'primary.500' : 'gray.600'}
                  onClick={() => {
                    setActiveTab('login');
                    setMessage(null);
                    setErrors({});
                  }}
                  _hover={{
                    bg: activeTab === 'login' ? 'white' : 'gray.100',
                  }}
                >
                  Login
                </Button>
                <Button
                  flex={1}
                  borderRadius="lg"
                  fontWeight="semibold"
                  variant={activeTab === 'signup' ? 'solid' : 'ghost'}
                  bg={activeTab === 'signup' ? 'white' : 'transparent'}
                  color={activeTab === 'signup' ? 'primary.500' : 'gray.600'}
                  onClick={() => {
                    setActiveTab('signup');
                    setMessage(null);
                    setErrors({});
                  }}
                  _hover={{
                    bg: activeTab === 'signup' ? 'white' : 'gray.100',
                  }}
                >
                  Sign Up
                </Button>
              </Flex>

              {/* Login Form */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin}>
                  <VStack gap={6} align="stretch">
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Email
                      </Text>
                      <Input
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={errors.email ? 'red.500' : 'gray.200'}
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1)',
                        }}
                      />
                      {errors.email && (
                        <Text color="red.500" fontSize="sm">
                          {errors.email}
                        </Text>
                      )}
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Password
                      </Text>
                      <Input
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={errors.password ? 'red.500' : 'gray.200'}
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1)',
                        }}
                      />
                      {errors.password && (
                        <Text color="red.500" fontSize="sm">
                          {errors.password}
                        </Text>
                      )}
                    </VStack>

                    <Text
                      color="primary.500"
                      fontSize="sm"
                      textAlign="right"
                      onClick={() => setShowResetPassword(true)}
                      cursor="pointer"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Forgot password?
                    </Text>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      bg="linear-gradient(to right, #f43f5e, #fb7185)"
                      color="white"
                      borderRadius="full"
                      fontWeight="semibold"
                      size="lg"
                      _hover={{
                        transform: 'translateY(-2px) scale(1.02)',
                      }}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </VStack>
                </form>
              )}

              {/* Signup Form */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignup}>
                  <VStack gap={6} align="stretch">
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Name
                      </Text>
                      <Input
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        type="text"
                        placeholder="John Doe"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={errors.name ? 'red.500' : 'gray.200'}
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1)',
                        }}
                      />
                      {errors.name && (
                        <Text color="red.500" fontSize="sm">
                          {errors.name}
                        </Text>
                      )}
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Email
                      </Text>
                      <Input
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={errors.email ? 'red.500' : 'gray.200'}
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1)',
                        }}
                      />
                      {errors.email && (
                        <Text color="red.500" fontSize="sm">
                          {errors.email}
                        </Text>
                      )}
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Password
                      </Text>
                      <Input
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={errors.password ? 'red.500' : 'gray.200'}
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1)',
                        }}
                      />
                      {errors.password && (
                        <Text color="red.500" fontSize="sm">
                          {errors.password}
                        </Text>
                      )}
                    </VStack>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      bg="linear-gradient(to right, #f43f5e, #fb7185)"
                      color="white"
                      borderRadius="full"
                      fontWeight="semibold"
                      size="lg"
                      _hover={{
                        transform: 'translateY(-2px) scale(1.02)',
                      }}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>

                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      By signing up, you agree to our Terms of Service and Privacy Policy
                    </Text>
                  </VStack>
                </form>
              )}
            </>
          )}
        </VStack>
      </Box>
    </>
  );
};
