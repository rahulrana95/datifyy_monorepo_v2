import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Table,
  Badge,
  Spinner,
  Flex,
  Grid,
} from '@chakra-ui/react';
import { useAdminStore } from '../../../stores/adminStore';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    admin,
    isAuthenticated,
    users,
    totalUsers,
    currentPage,
    totalPages,
    isLoading,
    fetchUsers,
    searchUsers,
    logout,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    fetchUsers({ page: 1, pageSize: 20 });
  }, [isAuthenticated, navigate, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchUsers(searchQuery.trim());
    } else {
      fetchUsers({ page: 1 });
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers({ page: newPage });
  };

  const handleUserClick = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'suspended':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Calculate stats
  const activeUsers = users.filter(u => u.accountStatus.toLowerCase() === 'active').length;
  const pendingUsers = users.filter(u => u.accountStatus.toLowerCase() === 'pending').length;
  const verifiedUsers = users.filter(u => u.emailVerified).length;

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        py={4}
        boxShadow="sm"
      >
        <Box maxW="1100px" mx="auto" px={4}>
          <Flex justify="space-between" align="center">
            <HStack gap={6}>
              <HStack gap={3}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  bg="linear-gradient(135deg, #ED64A6 0%, #F687B3 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="lg" fontWeight="bold" color="white">
                    D
                  </Text>
                </Box>
                <VStack align="start" gap={0}>
                  <Heading
                    size="md"
                    bgGradient="linear(to-r, pink.600, pink.400)"
                    bgClip="text"
                  >
                    Datifyy Admin
                  </Heading>
                  <Text color="gray.500" fontSize="xs">
                    Dashboard
                  </Text>
                </VStack>
              </HStack>
            </HStack>
            <HStack gap={4}>
              {admin && (
                <HStack
                  gap={3}
                  bg="gray.50"
                  px={4}
                  py={2}
                  borderRadius="lg"
                >
                  <Box
                    w="32px"
                    h="32px"
                    borderRadius="full"
                    bg="pink.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="sm" fontWeight="bold" color="pink.600">
                      {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                    </Text>
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      {admin.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {admin.role.replace('ADMIN_ROLE_', '')}
                    </Text>
                  </VStack>
                </HStack>
              )}
              <Button
                size="sm"
                bg="white"
                border="1px solid"
                borderColor="pink.300"
                color="pink.600"
                _hover={{ bg: 'pink.50', borderColor: 'pink.400' }}
                _focus={{ boxShadow: '0 0 0 2px rgba(237, 100, 166, 0.3)' }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="1100px" mx="auto" px={4} py={8}>
        <VStack gap={8} align="stretch">
          {/* Welcome & Stats */}
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={6}>
              Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}
            </Text>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
              {/* Total Users */}
              <Box
                bg="white"
                borderRadius="xl"
                p={5}
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="80px"
                  h="80px"
                  bg="pink.50"
                  borderRadius="full"
                  transform="translate(20px, -20px)"
                />
                <VStack align="start" gap={1} position="relative">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" letterSpacing="0.5px">
                    TOTAL USERS
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                    {totalUsers.toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="pink.500">
                    All registered users
                  </Text>
                </VStack>
              </Box>

              {/* Active Users */}
              <Box
                bg="white"
                borderRadius="xl"
                p={5}
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="80px"
                  h="80px"
                  bg="green.50"
                  borderRadius="full"
                  transform="translate(20px, -20px)"
                />
                <VStack align="start" gap={1} position="relative">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" letterSpacing="0.5px">
                    ACTIVE
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                    {activeUsers}
                  </Text>
                  <Text fontSize="xs" color="green.500">
                    Ready for matching
                  </Text>
                </VStack>
              </Box>

              {/* Pending Users */}
              <Box
                bg="white"
                borderRadius="xl"
                p={5}
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="80px"
                  h="80px"
                  bg="yellow.50"
                  borderRadius="full"
                  transform="translate(20px, -20px)"
                />
                <VStack align="start" gap={1} position="relative">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" letterSpacing="0.5px">
                    PENDING
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="yellow.600">
                    {pendingUsers}
                  </Text>
                  <Text fontSize="xs" color="yellow.600">
                    Awaiting activation
                  </Text>
                </VStack>
              </Box>

              {/* Verified Users */}
              <Box
                bg="white"
                borderRadius="xl"
                p={5}
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="80px"
                  h="80px"
                  bg="pink.50"
                  borderRadius="full"
                  transform="translate(20px, -20px)"
                />
                <VStack align="start" gap={1} position="relative">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" letterSpacing="0.5px">
                    VERIFIED
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="pink.600">
                    {verifiedUsers}
                  </Text>
                  <Text fontSize="xs" color="pink.500">
                    Email confirmed
                  </Text>
                </VStack>
              </Box>
            </Grid>
          </Box>

          {/* Users Table */}
          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
          >
            {/* Table Header */}
            <Flex
              justify="space-between"
              align="center"
              p={5}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              <VStack align="start" gap={0}>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  User Management
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {totalUsers} total users in database
                </Text>
              </VStack>

              <form onSubmit={handleSearch}>
                <HStack gap={2}>
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    width="280px"
                    size="sm"
                    px={4}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    _hover={{ borderColor: 'pink.300' }}
                    _focus={{
                      borderColor: 'pink.500',
                      bg: 'white',
                      boxShadow: '0 0 0 2px rgba(237, 100, 166, 0.1)',
                    }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    bg="pink.500"
                    color="white"
                    _hover={{ bg: 'pink.600' }}
                    borderRadius="lg"
                    px={4}
                  >
                    Search
                  </Button>
                </HStack>
              </form>
            </Flex>

            {isLoading ? (
              <Flex justify="center" align="center" py={16}>
                <VStack gap={3}>
                  <Spinner size="lg" color="pink.500" />
                  <Text color="gray.500" fontSize="sm">Loading users...</Text>
                </VStack>
              </Flex>
            ) : (
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row bg="gray.50">
                    <Table.ColumnHeader pl={5} py={3} fontWeight="semibold" color="gray.600" fontSize="xs" letterSpacing="0.5px">
                      USER
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs" letterSpacing="0.5px">
                      EMAIL
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs" letterSpacing="0.5px">
                      STATUS
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs" letterSpacing="0.5px">
                      GENDER
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs" letterSpacing="0.5px">
                      JOINED
                    </Table.ColumnHeader>
                    <Table.ColumnHeader pr={5} py={3} fontWeight="semibold" color="gray.600" fontSize="xs" letterSpacing="0.5px" textAlign="right">
                      ACTIONS
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {users.map((user, index) => (
                    <Table.Row
                      key={user.userId}
                      _hover={{ bg: 'pink.50' }}
                      cursor="pointer"
                      onClick={() => handleUserClick(user.userId)}
                      bg={index % 2 === 0 ? 'white' : 'gray.25'}
                      transition="all 0.15s"
                    >
                      <Table.Cell pl={5} py={4}>
                        <HStack gap={3}>
                          <Box
                            w="36px"
                            h="36px"
                            borderRadius="lg"
                            bg="linear-gradient(135deg, #FED7E2 0%, #FEEBC8 100%)"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="sm"
                            fontWeight="bold"
                            color="pink.600"
                            overflow="hidden"
                            flexShrink={0}
                          >
                            {user.photoUrl ? (
                              <img src={user.photoUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              user.name?.charAt(0)?.toUpperCase() || '?'
                            )}
                          </Box>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium" fontSize="sm" color="gray.800">
                              {user.name || 'Unknown'}
                            </Text>
                            {user.age > 0 && (
                              <Text color="gray.500" fontSize="xs">
                                {user.age} years old
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell py={4}>
                        <Text fontSize="sm" color="gray.600">
                          {user.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell py={4}>
                        <Badge
                          colorPalette={getStatusColor(user.accountStatus)}
                          size="sm"
                          borderRadius="md"
                          px={2}
                          py={0.5}
                          fontSize="xs"
                          fontWeight="medium"
                        >
                          {user.accountStatus}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell py={4}>
                        <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                          {user.gender || '-'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell py={4}>
                        <Text fontSize="sm" color="gray.500">
                          {formatDate(user.createdAt)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell pr={5} py={4} textAlign="right">
                        <Button
                          size="xs"
                          variant="outline"
                          bg="white"
                          borderColor="pink.300"
                          color="pink.600"
                          _hover={{ bg: 'pink.50', borderColor: 'pink.400' }}
                          _focus={{ boxShadow: '0 0 0 2px rgba(237, 100, 166, 0.3)' }}
                          borderRadius="md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(user.userId);
                          }}
                        >
                          View Profile
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Flex
                justify="space-between"
                align="center"
                py={4}
                px={5}
                borderTop="1px solid"
                borderColor="gray.100"
                bg="gray.50"
              >
                <Text fontSize="sm" color="gray.500">
                  Showing page {currentPage} of {totalPages}
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.600"
                    _hover={{ bg: 'white' }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    borderRadius="md"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.600"
                    _hover={{ bg: 'white' }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    borderRadius="md"
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
