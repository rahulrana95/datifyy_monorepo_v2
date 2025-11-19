import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Flex,
} from '@chakra-ui/react';
import { useAdminStore } from '../../../stores/adminStore';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAdminStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch {
      // Error is handled by store
    }
  };

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #FFF5F5 0%, #FED7E2 30%, #FEEBC8 70%, #FFF5F5 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative elements */}
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="rgba(237, 100, 166, 0.1)"
        filter="blur(60px)"
      />
      <Box
        position="absolute"
        bottom="-20%"
        left="-10%"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="rgba(246, 135, 179, 0.1)"
        filter="blur(60px)"
      />

      <Flex minH="100vh" align="center" justify="center" p={4}>
        <Container maxW="420px">
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.15)"
            p={{ base: 6, md: 10 }}
            border="1px solid"
            borderColor="pink.100"
            position="relative"
            overflow="hidden"
          >
            {/* Top accent */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, #ED64A6, #F687B3, #FBB6CE)"
            />

            <VStack gap={8} align="stretch">
              {/* Logo & Header */}
              <VStack gap={3}>
                <Box
                  w="64px"
                  h="64px"
                  borderRadius="xl"
                  bg="linear-gradient(135deg, #ED64A6 0%, #F687B3 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 8px 16px rgba(237, 100, 166, 0.3)"
                >
                  <Text fontSize="2xl" fontWeight="bold" color="white">
                    D
                  </Text>
                </Box>
                <VStack gap={1}>
                  <Heading
                    size="xl"
                    bgGradient="linear(to-r, pink.600, pink.400)"
                    bgClip="text"
                    fontWeight="bold"
                    letterSpacing="-0.5px"
                  >
                    Admin Portal
                  </Heading>
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    Manage users and orchestrate perfect matches
                  </Text>
                </VStack>
              </VStack>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <VStack gap={5}>
                  <Box w="full">
                    <Text
                      mb={2}
                      color="gray.700"
                      fontSize="sm"
                      fontWeight="semibold"
                      letterSpacing="0.5px"
                    >
                      EMAIL ADDRESS
                    </Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@datifyy.com"
                      required
                      size="lg"
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.200"
                      borderRadius="xl"
                      _hover={{ borderColor: 'pink.300', bg: 'white' }}
                      _focus={{
                        borderColor: 'pink.500',
                        bg: 'white',
                        boxShadow: '0 0 0 3px rgba(237, 100, 166, 0.15)',
                      }}
                      _placeholder={{ color: 'gray.400' }}
                      transition="all 0.2s"
                    />
                  </Box>

                  <Box w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text
                        color="gray.700"
                        fontSize="sm"
                        fontWeight="semibold"
                        letterSpacing="0.5px"
                      >
                        PASSWORD
                      </Text>
                    </HStack>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      size="lg"
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.200"
                      borderRadius="xl"
                      _hover={{ borderColor: 'pink.300', bg: 'white' }}
                      _focus={{
                        borderColor: 'pink.500',
                        bg: 'white',
                        boxShadow: '0 0 0 3px rgba(237, 100, 166, 0.15)',
                      }}
                      _placeholder={{ color: 'gray.400' }}
                      transition="all 0.2s"
                    />
                  </Box>

                  {error && (
                    <Box
                      w="full"
                      p={3}
                      bg="red.50"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="red.200"
                    >
                      <Text color="red.600" fontSize="sm" textAlign="center">
                        {error}
                      </Text>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    width="full"
                    h="52px"
                    bg="linear-gradient(135deg, #ED64A6 0%, #F687B3 100%)"
                    color="white"
                    borderRadius="xl"
                    fontWeight="semibold"
                    fontSize="md"
                    letterSpacing="0.5px"
                    _hover={{
                      bg: 'linear-gradient(135deg, #D53F8C 0%, #ED64A6 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 24px rgba(237, 100, 166, 0.4)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                      boxShadow: '0 4px 12px rgba(237, 100, 166, 0.3)',
                    }}
                    loading={isLoading}
                    disabled={!email || !password || isLoading}
                    transition="all 0.2s"
                  >
                    Sign In to Dashboard
                  </Button>
                </VStack>
              </form>

              {/* Footer */}
              <Box pt={4} borderTop="1px solid" borderColor="gray.100">
                <VStack gap={2}>
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    Test credentials for demo access
                  </Text>
                  <HStack
                    gap={2}
                    bg="gray.50"
                    px={4}
                    py={2}
                    borderRadius="lg"
                    border="1px dashed"
                    borderColor="gray.200"
                  >
                    <Text fontSize="xs" color="gray.500">
                      admin@datifyy.com
                    </Text>
                    <Text fontSize="xs" color="gray.300">|</Text>
                    <Text fontSize="xs" color="gray.500">
                      Admin@123
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Copyright */}
          <Text
            textAlign="center"
            fontSize="xs"
            color="gray.500"
            mt={6}
          >
            © 2024 Datifyy. All rights reserved.
          </Text>
        </Container>
      </Flex>
    </Box>
  );
};

export default AdminLogin;
