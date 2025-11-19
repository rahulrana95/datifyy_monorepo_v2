/**
 * Admin Management Page
 * Add and manage admin users (Super Admin only)
 */

import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Table,
  Badge,
  Portal,
} from '@chakra-ui/react';
import { AdminLayout } from '../../../components/admin';
import { useAdminStore } from '../../../stores/adminStore';

// Mock admin data
const mockAdmins = [
  { id: '1', name: 'Super Admin', email: 'admin@datifyy.com', role: 'ADMIN_ROLE_SUPER', status: 'active', createdAt: Date.now() / 1000 },
  { id: '2', name: 'Support Admin', email: 'support@datifyy.com', role: 'ADMIN_ROLE_SUPPORT', status: 'active', createdAt: Date.now() / 1000 - 86400 },
  { id: '3', name: 'Genie Admin', email: 'genie@datifyy.com', role: 'ADMIN_ROLE_GENIE', status: 'active', createdAt: Date.now() / 1000 - 172800 },
];

export const AdminManagement = () => {
  const { admin } = useAdminStore();
  const [admins] = useState(mockAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN_ROLE_SUPPORT',
  });

  const isSuperAdmin = admin?.role === 'ADMIN_ROLE_SUPER';

  const handleAddAdmin = () => {
    console.log('Adding admin:', newAdmin);
    setIsModalOpen(false);
    setNewAdmin({ name: '', email: '', password: '', role: 'ADMIN_ROLE_SUPPORT' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN_ROLE_SUPER':
        return 'purple';
      case 'ADMIN_ROLE_GENIE':
        return 'pink';
      default:
        return 'blue';
    }
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <Box textAlign="center" py={20}>
          <Text fontSize="xl" color="gray.600">
            Access Denied
          </Text>
          <Text color="gray.500" mt={2}>
            Only super admins can access this page
          </Text>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Admin Management
            </Text>
            <Text color="gray.500" fontSize="sm">
              Manage admin users and permissions
            </Text>
          </Box>
          <Button
            bg="pink.500"
            color="white"
            _hover={{ bg: 'pink.600' }}
            onClick={() => setIsModalOpen(true)}
          >
            + Add Admin
          </Button>
        </HStack>

        {/* Admins Table */}
        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
        >
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="gray.50">
                <Table.ColumnHeader pl={5} py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  ADMIN
                </Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  EMAIL
                </Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  ROLE
                </Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  STATUS
                </Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  CREATED
                </Table.ColumnHeader>
                <Table.ColumnHeader pr={5} py={3} fontWeight="semibold" color="gray.600" fontSize="xs" textAlign="right">
                  ACTIONS
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {admins.map((adminUser, index) => (
                <Table.Row
                  key={adminUser.id}
                  bg={index % 2 === 0 ? 'white' : 'gray.25'}
                  _hover={{ bg: 'pink.50' }}
                >
                  <Table.Cell pl={5} py={4}>
                    <HStack gap={3}>
                      <Box
                        w="36px"
                        h="36px"
                        borderRadius="lg"
                        bg="linear-gradient(135deg, #ED64A6 0%, #F687B3 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="sm"
                        fontWeight="bold"
                        color="white"
                      >
                        {adminUser.name.charAt(0).toUpperCase()}
                      </Box>
                      <Text fontWeight="medium" fontSize="sm" color="gray.800">
                        {adminUser.name}
                      </Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell py={4}>
                    <Text fontSize="sm" color="gray.600">
                      {adminUser.email}
                    </Text>
                  </Table.Cell>
                  <Table.Cell py={4}>
                    <Badge
                      colorPalette={getRoleColor(adminUser.role)}
                      size="sm"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                    >
                      {adminUser.role.replace('ADMIN_ROLE_', '')}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell py={4}>
                    <Badge
                      colorPalette={adminUser.status === 'active' ? 'green' : 'red'}
                      size="sm"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                    >
                      {adminUser.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell py={4}>
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(adminUser.createdAt)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell pr={5} py={4} textAlign="right">
                    <HStack gap={2} justify="flex-end">
                      <Button
                        size="xs"
                        variant="ghost"
                        color="gray.600"
                        _hover={{ bg: 'gray.100' }}
                      >
                        Edit
                      </Button>
                      {adminUser.role !== 'ADMIN_ROLE_SUPER' && (
                        <Button
                          size="xs"
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                        >
                          Delete
                        </Button>
                      )}
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </VStack>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <Portal>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.400"
            zIndex={200}
            onClick={() => setIsModalOpen(false)}
          />
          <Box
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="white"
            borderRadius="xl"
            boxShadow="xl"
            p={6}
            w="400px"
            maxW="90vw"
            zIndex={201}
          >
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  Add New Admin
                </Text>
                <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  ✕
                </Button>
              </HStack>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Full Name
                </Text>
                <Input
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="Admin Name"
                  px={4}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Email
                </Text>
                <Input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@datifyy.com"
                  px={4}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Password
                </Text>
                <Input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="••••••••"
                  px={4}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Role
                </Text>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                  }}
                >
                  <option value="ADMIN_ROLE_SUPPORT">Support</option>
                  <option value="ADMIN_ROLE_GENIE">Genie</option>
                  <option value="ADMIN_ROLE_SUPER">Super Admin</option>
                </select>
              </Box>

              <HStack gap={3} pt={2}>
                <Button
                  flex={1}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.300"
                  color="gray.600"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  bg="pink.500"
                  color="white"
                  _hover={{ bg: 'pink.600' }}
                  onClick={handleAddAdmin}
                >
                  Add Admin
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Portal>
      )}
    </AdminLayout>
  );
};

export default AdminManagement;
