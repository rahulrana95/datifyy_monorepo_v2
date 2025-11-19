/**
 * Admin Profile Settings Page
 * Edit admin profile information
 */

import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { AdminLayout } from '../../../components/admin';
import { useAdminStore } from '../../../stores/adminStore';

export const AdminProfile = () => {
  const { admin } = useAdminStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
  });

  const isSuperAdmin = admin?.role === 'ADMIN_ROLE_SUPER';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Call API to update admin profile
      console.log('Saving profile:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: admin?.name || '',
      email: admin?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Profile Settings
          </Text>
          <Text color="gray.500" fontSize="sm">
            Manage your admin account information
          </Text>
        </Box>

        {/* Profile Card */}
        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
          p={6}
          maxW="600px"
        >
          <VStack align="stretch" gap={6}>
            {/* Avatar */}
            <HStack gap={4}>
              <Box
                w="80px"
                h="80px"
                borderRadius="xl"
                bg="linear-gradient(135deg, #ED64A6 0%, #F687B3 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </Text>
              </Box>
              <VStack align="start" gap={0}>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {admin?.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {admin?.role.replace('ADMIN_ROLE_', '')} Admin
                </Text>
              </VStack>
            </HStack>

            {/* Form Fields */}
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Full Name
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  px={4}
                  size="lg"
                  bg={isEditing ? 'white' : 'gray.50'}
                  borderColor="gray.200"
                  _hover={{ borderColor: isEditing ? 'pink.300' : 'gray.200' }}
                  _focus={{
                    borderColor: 'pink.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-pink-500)',
                  }}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Email Address
                </Text>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing || !isSuperAdmin}
                  px={4}
                  size="lg"
                  bg={isEditing && isSuperAdmin ? 'white' : 'gray.50'}
                  borderColor="gray.200"
                  _hover={{ borderColor: isEditing && isSuperAdmin ? 'pink.300' : 'gray.200' }}
                  _focus={{
                    borderColor: 'pink.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-pink-500)',
                  }}
                />
                {!isSuperAdmin && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Only super admins can change email address
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Role
                </Text>
                <Input
                  value={admin?.role.replace('ADMIN_ROLE_', '') || ''}
                  disabled
                  px={4}
                  size="lg"
                  bg="gray.50"
                  borderColor="gray.200"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Role can only be changed by super admin
                </Text>
              </Box>
            </VStack>

            {/* Actions */}
            <HStack gap={3} pt={2}>
              {isEditing ? (
                <>
                  <Button
                    size="md"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.300"
                    color="gray.600"
                    _hover={{ bg: 'gray.50' }}
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="md"
                    bg="pink.500"
                    color="white"
                    _hover={{ bg: 'pink.600' }}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <HStack gap={2}>
                        <Spinner size="sm" />
                        <Text>Saving...</Text>
                      </HStack>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  size="md"
                  bg="pink.500"
                  color="white"
                  _hover={{ bg: 'pink.600' }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>

        {/* Security Section */}
        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
          p={6}
          maxW="600px"
        >
          <VStack align="stretch" gap={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              Security
            </Text>

            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Password
              </Text>
              <HStack gap={3}>
                <Input
                  type="password"
                  value="••••••••"
                  disabled
                  px={4}
                  size="lg"
                  bg="gray.50"
                  borderColor="gray.200"
                  flex={1}
                />
                <Button
                  size="lg"
                  bg="white"
                  border="1px solid"
                  borderColor="pink.300"
                  color="pink.600"
                  _hover={{ bg: 'pink.50' }}
                >
                  Change
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </AdminLayout>
  );
};

export default AdminProfile;
