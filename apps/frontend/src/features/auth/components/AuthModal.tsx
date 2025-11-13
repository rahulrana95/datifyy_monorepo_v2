/**
 * Auth Modal Component - Clean Modern Design
 * Beautiful login/signup modal with elegant animations and smooth transitions
 * Following Datifyy reference design system
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
import { colors } from '../../../theme/colors.reference';

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
  z-index: 1400;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled(Box)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1401;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(232, 93, 117, 0.15), 0 0 0 1px rgba(232, 93, 117, 0.1);
  width: 90%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${scaleIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.brand[200]};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.brand[300]};
  }
`;

const HeartIcon = styled.span`
  font-size: 2rem;
  display: inline-block;
  animation: ${heartPulse} 2s ease-in-out infinite;
`;

const LabelText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: 8px;
`;

const LinkText = styled(Text)`
  color: ${colors.brand[500]};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;

  &:hover {
    color: ${colors.brand[600]};
    text-decoration: underline;
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  height: 52px;
  background: ${colors.gradient.brand};
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(232, 93, 117, 0.25);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(232, 93, 117, 0.35);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StyledInput = styled(Input)`
  height: 48px;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${colors.gray[200]};
  background: ${colors.gray[50]};
  font-size: 15px;
  padding: 0 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &::placeholder {
    color: ${colors.text.quaternary};
  }

  &:hover:not(:focus) {
    border-color: ${colors.brand[300]};
    background: white;
  }

  &:focus {
    outline: none;
    border-color: ${colors.brand[500]};
    background: white;
    box-shadow: 0 0 0 4px ${colors.brand[100]};
  }

  &.error {
    border-color: ${colors.nope[500]};
    background: #fef2f2;

    &:focus {
      border-color: ${colors.nope[500]};
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }
  }
`;

const TabButton = styled(Button)<{ active?: boolean }>`
  flex: 1;
  height: 44px;
  background: ${(props) => (props.active ? colors.brand[500] : 'transparent')} !important;
  color: ${(props) => (props.active ? 'white' : colors.text.secondary)} !important;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  border: none;
  box-shadow: none !important;
  outline: none !important;

  &:hover {
    background: ${(props) => (props.active ? colors.brand[600] : colors.brand[50])} !important;
    color: ${(props) => (props.active ? 'white' : colors.brand[600])} !important;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    background: ${(props) => (props.active ? colors.brand[700] : colors.brand[100])} !important;
  }

  &:focus {
    background: ${(props) => (props.active ? colors.brand[500] : 'transparent')} !important;
    box-shadow: none !important;
    outline: none !important;
  }

  &:focus-visible {
    outline: 2px solid ${colors.brand[500]} !important;
    outline-offset: 2px;
  }
`;

const MessageBox = styled(Box)<{ type: 'success' | 'error' }>`
  padding: 14px 16px;
  border-radius: 12px;
  background: ${(props) => (props.type === 'success' ? colors.like[50] : colors.nope[50])};
  color: ${(props) => (props.type === 'success' ? '#065f46' : '#991b1b')};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  animation: ${scaleIn} 0.3s ease-out;
  border: 1px solid ${(props) => (props.type === 'success' ? colors.like[200] : colors.nope[200])};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled(Button)`
  color: ${colors.text.tertiary};
  font-size: 20px;
  line-height: 1;
  padding: 0;
  width: 36px;
  height: 36px;
  min-width: auto;
  background: transparent;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;

  &:hover {
    background: ${colors.brand[50]};
    color: ${colors.brand[600]};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
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
        <VStack gap={0} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" p={6} pb={4}>
            <Flex align="center" gap={2}>
              <HeartIcon>💝</HeartIcon>
              <Heading
                fontSize={{ base: '22px', md: '24px' }}
                fontWeight="700"
                color={colors.text.primary}
              >
                {showResetPassword ? 'Reset Password' : 'Welcome Back'}
              </Heading>
            </Flex>
            <CloseButton onClick={handleClose}>✕</CloseButton>
          </Flex>

          {/* Main Content */}
          <Box px={6} pb={6}>
            {/* Message */}
            {message && (
              <MessageBox type={message.type}>
                <span>{message.type === 'success' ? '✓' : '⚠'}</span>
                {message.text}
              </MessageBox>
            )}

            {showResetPassword ? (
              // Password Reset Form
              resetEmailSent ? (
                <VStack gap={5} py={6}>
                  <Box textAlign="center" fontSize="48px">📧</Box>
                  <VStack gap={2}>
                    <Heading size="md" color={colors.text.primary}>Check Your Email</Heading>
                    <Text textAlign="center" color={colors.text.secondary} fontSize="14px">
                      We've sent password reset instructions to your email.
                    </Text>
                  </VStack>
                  <LinkText onClick={() => {
                    setShowResetPassword(false);
                    setResetEmailSent(false);
                  }}>
                    Back to Login
                  </LinkText>
                </VStack>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <VStack gap={5} align="stretch" pt={4}>
                    <Text color={colors.text.secondary} fontSize="14px" lineHeight="1.6">
                      Enter your email address and we'll send you instructions to reset your password.
                    </Text>

                    <VStack gap={1} align="stretch">
                      <LabelText>Email Address</LabelText>
                      <StyledInput
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        className={errors.email ? 'error' : ''}
                      />
                      {errors.email && (
                        <Text color={colors.nope[500]} fontSize="13px" fontWeight="500" mt={1}>
                          {errors.email}
                        </Text>
                      )}
                    </VStack>

                    <SubmitButton type="submit" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </SubmitButton>

                    <Text textAlign="center" fontSize="14px" color={colors.text.secondary}>
                      Remember your password?{' '}
                      <LinkText as="span" onClick={() => setShowResetPassword(false)}>
                        Sign in
                      </LinkText>
                    </Text>
                  </VStack>
                </form>
              )
            ) : (
              // Login/Signup Tabs
              <>
                {/* Tab Buttons */}
                <Flex
                  gap={2}
                  bg={colors.gray[100]}
                  p={1.5}
                  borderRadius="12px"
                  mt={message ? 4 : 0}
                >
                  <TabButton
                    active={activeTab === 'login'}
                    onClick={() => {
                      setActiveTab('login');
                      setMessage(null);
                      setErrors({});
                    }}
                  >
                    Sign In
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
                    <VStack gap={5} align="stretch" pt={5}>
                      <VStack gap={1} align="stretch">
                        <LabelText>Email Address</LabelText>
                        <StyledInput
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          type="email"
                          placeholder="you@example.com"
                          className={errors.email ? 'error' : ''}
                          autoFocus
                        />
                        {errors.email && (
                          <Text color={colors.nope[500]} fontSize="13px" fontWeight="500" mt={1}>
                            {errors.email}
                          </Text>
                        )}
                      </VStack>

                      <VStack gap={1} align="stretch">
                        <Flex justify="space-between" align="center">
                          <LabelText>Password</LabelText>
                          <LinkText onClick={() => setShowResetPassword(true)} fontSize="13px">
                            Forgot?
                          </LinkText>
                        </Flex>
                        <StyledInput
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          type="password"
                          placeholder="Enter your password"
                          className={errors.password ? 'error' : ''}
                        />
                        {errors.password && (
                          <Text color={colors.nope[500]} fontSize="13px" fontWeight="500" mt={1}>
                            {errors.password}
                          </Text>
                        )}
                      </VStack>

                      <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </SubmitButton>
                    </VStack>
                  </form>
                )}

                {/* Signup Form */}
                {activeTab === 'signup' && (
                  <form onSubmit={handleSignup}>
                    <VStack gap={5} align="stretch" pt={5}>
                      <VStack gap={1} align="stretch">
                        <LabelText>Full Name</LabelText>
                        <StyledInput
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          type="text"
                          placeholder="John Doe"
                          className={errors.name ? 'error' : ''}
                          autoFocus
                        />
                        {errors.name && (
                          <Text color={colors.nope[500]} fontSize="13px" fontWeight="500" mt={1}>
                            {errors.name}
                          </Text>
                        )}
                      </VStack>

                      <VStack gap={1} align="stretch">
                        <LabelText>Email Address</LabelText>
                        <StyledInput
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          type="email"
                          placeholder="you@example.com"
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                          <Text color={colors.nope[500]} fontSize="13px" fontWeight="500" mt={1}>
                            {errors.email}
                          </Text>
                        )}
                      </VStack>

                      <VStack gap={1} align="stretch">
                        <LabelText>Password</LabelText>
                        <StyledInput
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          type="password"
                          placeholder="Create a strong password"
                          className={errors.password ? 'error' : ''}
                        />
                        {errors.password && (
                          <Text color={colors.nope[500]} fontSize="13px" fontWeight="500" mt={1}>
                            {errors.password}
                          </Text>
                        )}
                        <Text fontSize="12px" color={colors.text.tertiary} mt={1}>
                          Must be at least 8 characters
                        </Text>
                      </VStack>

                      <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                      </SubmitButton>

                      <Text fontSize="12px" color={colors.text.tertiary} textAlign="center" lineHeight="1.6">
                        By signing up, you agree to our{' '}
                        <LinkText as="span" fontSize="12px">Terms</LinkText>
                        {' '}and{' '}
                        <LinkText as="span" fontSize="12px">Privacy Policy</LinkText>
                      </Text>
                    </VStack>
                  </form>
                )}
              </>
            )}
          </Box>
        </VStack>
      </ModalContainer>
    </>
  );
};
