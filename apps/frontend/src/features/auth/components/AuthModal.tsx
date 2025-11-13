/**
 * Auth Modal Component - Enhanced Romantic Design
 * Beautiful login/signup modal with romantic animations and smooth transitions
 */

import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  Box,
  VStack,
  Button,
  Text,
  Input,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useAuthStore } from '../store/auth.store';
import { datifyyTheme } from '../../../theme/datifyy.theme';

// Romantic animations
const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const heartPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

// Styled components
const Backdrop = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(23, 23, 23, 0.7);
  backdrop-filter: blur(12px);
  z-index: ${datifyyTheme.zIndices.modal};
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled(Box)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${datifyyTheme.zIndices.modal + 1};
  background: white;
  border-radius: ${datifyyTheme.radii['3xl']};
  box-shadow: ${datifyyTheme.shadows.premium};
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${scaleIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
`;

const HeartIcon = styled.span`
  font-size: 2.5rem;
  display: inline-block;
  animation: ${heartPulse} 2s ease-in-out infinite;
`;

const StyledInput = styled(Input)`
  border-radius: ${datifyyTheme.radii.xl};
  border-width: 2px;
  border-color: ${datifyyTheme.colors.primary[200]};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${datifyyTheme.colors.primary[300]};
  }

  &:focus {
    border-color: ${datifyyTheme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${datifyyTheme.colors.primary[200]};
  }

  &.error {
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }
  }
`;

const TabButton = styled(Button)<{ active?: boolean }>`
  flex: 1;
  background: ${(props) =>
    props.active ? datifyyTheme.colors.primary[500] : 'transparent'};
  color: ${(props) => (props.active ? 'white' : datifyyTheme.colors.text.secondary)};
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: ${datifyyTheme.radii.xl};

  &:hover {
    background: ${(props) =>
      props.active ? datifyyTheme.colors.primary[600] : datifyyTheme.colors.primary[50]};
    color: ${(props) => (props.active ? 'white' : datifyyTheme.colors.primary[600])};
  }
`;

const MessageBox = styled(Box)<{ type: 'success' | 'error' }>`
  padding: 16px;
  border-radius: ${datifyyTheme.radii.xl};
  background: ${(props) => (props.type === 'success' ? '#ecfdf5' : '#fef2f2')};
  color: ${(props) => (props.type === 'success' ? '#065f46' : '#991b1b')};
  font-size: 14px;
  font-weight: 600;
  animation: ${scaleIn} 0.3s ease-out;
  border: 2px solid ${(props) => (props.type === 'success' ? '#10b981' : '#ef4444')};
`;

const CloseButton = styled(Button)`
  color: ${datifyyTheme.colors.text.tertiary};
  font-size: 24px;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  min-width: auto;
  background: transparent;
  border-radius: ${datifyyTheme.radii.lg};
  transition: all 0.3s ease;

  &:hover {
    background: ${datifyyTheme.colors.primary[50]};
    color: ${datifyyTheme.colors.primary[600]};
    transform: scale(1.1);
  }
`;

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
      <Backdrop onClick={handleClose} />

      {/* Modal Content */}
      <ModalContainer onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <VStack gap={7} p={{ base: 6, md: 10 }} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={3}>
              <HeartIcon>💝</HeartIcon>
              <Heading
                size={{ base: 'lg', md: 'xl' }}
                fontFamily={datifyyTheme.fonts.heading}
                color={datifyyTheme.colors.text.primary}
              >
                {showResetPassword ? 'Reset Password' : 'Welcome to Datifyy'}
              </Heading>
            </Flex>
            <CloseButton onClick={handleClose}>✕</CloseButton>
          </Flex>

          {/* Message */}
          {message && <MessageBox type={message.type}>{message.text}</MessageBox>}

          {showResetPassword ? (
            // Password Reset Form
            resetEmailSent ? (
              <VStack gap={4} py={4}>
                <Text textAlign="center">
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
                      borderColor={errors.email ? 'red.500' : undefined}
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
                    variant="solid"
                    size="lg"
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
              <Flex
                gap={3}
                bg={datifyyTheme.colors.primary[50]}
                p={2}
                borderRadius={datifyyTheme.radii['2xl']}
              >
                <TabButton
                  active={activeTab === 'login'}
                  onClick={() => {
                    setActiveTab('login');
                    setMessage(null);
                    setErrors({});
                  }}
                >
                  Login
                </TabButton>
                <TabButton
                  active={activeTab === 'signup'}
                  onClick={() => {
                    setActiveTab('signup');
                    setMessage(null);
                    setErrors({});
                  }}
                >
                  Sign Up
                </TabButton>
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
                        borderColor={errors.email ? 'red.500' : undefined}
                      />
                      {errors.email && (
                        <Text color="red.500" fontSize="sm">
                          {errors.email}
                        </Text>
                      )}
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        color={datifyyTheme.colors.text.primary}
                      >
                        Password
                      </Text>
                      <StyledInput
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        className={errors.password ? 'error' : ''}
                      />
                      {errors.password && (
                        <Text color="#ef4444" fontSize="sm" fontWeight="600">
                          {errors.password}
                        </Text>
                      )}
                    </VStack>

                    <Text
                      color={datifyyTheme.colors.primary[600]}
                      fontSize="sm"
                      fontWeight="600"
                      textAlign="right"
                      onClick={() => setShowResetPassword(true)}
                      cursor="pointer"
                      transition="all 0.3s ease"
                      _hover={{
                        textDecoration: 'underline',
                        color: datifyyTheme.colors.primary[700],
                      }}
                    >
                      Forgot password?
                    </Text>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      variant="solid"
                      size="lg"
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
                        borderColor={errors.name ? 'red.500' : undefined}
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
                        borderColor={errors.email ? 'red.500' : undefined}
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
                        borderColor={errors.password ? 'red.500' : undefined}
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
                      variant="solid"
                      size="lg"
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
      </ModalContainer>
    </>
  );
};
