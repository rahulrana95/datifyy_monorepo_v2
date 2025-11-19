/**
 * Admin Users Page
 * User management with bulk actions and drawer
 */

import { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Table,
  Badge,
  Spinner,
  Flex,
  Portal,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../components/admin';
import { useAdminStore } from '../../../stores/adminStore';

export const AdminUsers = () => {
  const navigate = useNavigate();
  const {
    users,
    totalUsers,
    currentPage,
    totalPages,
    isLoading,
    fetchUsers,
    searchUsers,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers({ page: 1, pageSize: 20 });
  }, [fetchUsers]);

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

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.userId)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleOpenDrawer = (user: any) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedUsers.size} users? This action cannot be undone.`)) {
      console.log('Deleting users:', Array.from(selectedUsers));
      setSelectedUsers(new Set());
    }
  };

  const handleBulkSuspend = () => {
    console.log('Suspending users:', Array.from(selectedUsers));
    setSelectedUsers(new Set());
  };

  const handleBulkActivate = () => {
    console.log('Activating users:', Array.from(selectedUsers));
    setSelectedUsers(new Set());
  };

  const handleBulkVerify = () => {
    console.log('Verifying users:', Array.from(selectedUsers));
    setSelectedUsers(new Set());
  };

  const handleBulkExport = () => {
    console.log('Exporting users:', Array.from(selectedUsers));
  };

  const handleBulkNotify = () => {
    console.log('Notifying users:', Array.from(selectedUsers));
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

  return (
    <AdminLayout>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            User Management
          </Text>
          <Text color="gray.500" fontSize="sm">
            Manage and monitor all registered users
          </Text>
        </Box>

        {/* Bulk Actions Bar */}
        {selectedUsers.size > 0 && (
          <Box
            bg="pink.50"
            borderRadius="lg"
            p={4}
            border="1px solid"
            borderColor="pink.200"
          >
            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <Text fontWeight="medium" color="pink.700">
                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
              </Text>
              <HStack gap={2} flexWrap="wrap">
                <Button size="sm" colorScheme="green" variant="outline" onClick={handleBulkActivate}>
                  Activate
                </Button>
                <Button size="sm" colorScheme="yellow" variant="outline" onClick={handleBulkSuspend}>
                  Suspend
                </Button>
                <Button size="sm" colorScheme="blue" variant="outline" onClick={handleBulkVerify}>
                  Verify
                </Button>
                <Button size="sm" colorScheme="purple" variant="outline" onClick={handleBulkExport}>
                  Export
                </Button>
                <Button size="sm" colorScheme="cyan" variant="outline" onClick={handleBulkNotify}>
                  Notify
                </Button>
                <Button size="sm" colorScheme="red" variant="outline" onClick={handleBulkDelete}>
                  Delete
                </Button>
              </HStack>
            </HStack>
          </Box>
        )}

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
                All Users
              </Text>
              <Text fontSize="sm" color="gray.500">
                {totalUsers} total users
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
                  px={3}
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
                  <Table.ColumnHeader pl={5} py={3} w="40px">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      style={{ width: '16px', height: '16px', accentColor: '#ED64A6' }}
                    />
                  </Table.ColumnHeader>
                  <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs" letterSpacing="0.5px">
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
                    bg={index % 2 === 0 ? 'white' : 'gray.25'}
                    transition="all 0.15s"
                  >
                    <Table.Cell pl={5} py={4}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.userId)}
                        onChange={() => handleSelectUser(user.userId)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '16px', height: '16px', accentColor: '#ED64A6' }}
                      />
                    </Table.Cell>
                    <Table.Cell py={4}>
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
                        bg="white"
                        border="1px solid"
                        borderColor="pink.300"
                        color="pink.600"
                        _hover={{ bg: 'pink.50', borderColor: 'pink.400' }}
                        _focus={{ boxShadow: '0 0 0 2px rgba(237, 100, 166, 0.3)' }}
                        borderRadius="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(user);
                        }}
                      >
                        View
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
                  bg="white"
                  border="1px solid"
                  borderColor="gray.300"
                  color="gray.600"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  borderRadius="md"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.300"
                  color="gray.600"
                  _hover={{ bg: 'gray.50' }}
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

      {/* User Drawer */}
      {isDrawerOpen && selectedUser && (
        <UserDrawer
          user={selectedUser}
          onClose={handleCloseDrawer}
          onViewFull={() => navigate(`/admin/users/${selectedUser.userId}`)}
        />
      )}
    </AdminLayout>
  );
};

// User Drawer Component
const UserDrawer = ({
  user,
  onClose,
  onViewFull,
}: {
  user: any;
  onClose: () => void;
  onViewFull: () => void;
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Portal>
      {/* Backdrop */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.400"
        zIndex={200}
        onClick={onClose}
      />

      {/* Drawer */}
      <Box
        position="fixed"
        top={0}
        right={0}
        bottom={0}
        w="400px"
        maxW="90vw"
        bg="white"
        boxShadow="xl"
        zIndex={201}
        overflow="auto"
      >
        {/* Header */}
        <Box p={5} borderBottom="1px solid" borderColor="gray.100">
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                User Details
              </Text>
              <Text fontSize="sm" color="gray.500">
                Quick view
              </Text>
            </VStack>
            <Button size="sm" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </HStack>
        </Box>

        {/* Content */}
        <VStack p={5} gap={4} align="stretch">
          {/* Profile */}
          <HStack gap={4}>
            <Box
              w="64px"
              h="64px"
              borderRadius="xl"
              bg="linear-gradient(135deg, #FED7E2 0%, #FEEBC8 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xl"
              fontWeight="bold"
              color="pink.600"
              overflow="hidden"
            >
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                {user.name || 'Unknown'}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {user.email}
              </Text>
            </VStack>
          </HStack>

          {/* Info Grid */}
          <Box bg="gray.50" borderRadius="lg" p={4}>
            <VStack gap={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">Status</Text>
                <Badge
                  colorPalette={user.accountStatus === 'active' ? 'green' : user.accountStatus === 'pending' ? 'yellow' : 'red'}
                  size="sm"
                >
                  {user.accountStatus}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">Gender</Text>
                <Text fontSize="sm" color="gray.800" textTransform="capitalize">
                  {user.gender || '-'}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">Age</Text>
                <Text fontSize="sm" color="gray.800">
                  {user.age > 0 ? `${user.age} years` : '-'}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">Email Verified</Text>
                <Text fontSize="sm" color={user.emailVerified ? 'green.600' : 'red.600'}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">Joined</Text>
                <Text fontSize="sm" color="gray.800">
                  {formatDate(user.createdAt)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Quick Actions */}
          <VStack gap={2} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
              Quick Actions
            </Text>
            <Button
              size="sm"
              bg="pink.500"
              color="white"
              _hover={{ bg: 'pink.600' }}
              onClick={onViewFull}
            >
              View Full Profile
            </Button>
            <HStack gap={2}>
              <Button
                flex={1}
                size="sm"
                colorScheme="green"
                variant="outline"
              >
                Activate
              </Button>
              <Button
                flex={1}
                size="sm"
                colorScheme="yellow"
                variant="outline"
              >
                Suspend
              </Button>
            </HStack>
            <HStack gap={2}>
              <Button
                flex={1}
                size="sm"
                colorScheme="blue"
                variant="outline"
              >
                Verify
              </Button>
              <Button
                flex={1}
                size="sm"
                colorScheme="cyan"
                variant="outline"
              >
                Message
              </Button>
            </HStack>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
            >
              Delete User
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Portal>
  );
};

export default AdminUsers;
