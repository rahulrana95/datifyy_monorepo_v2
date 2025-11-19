/**
 * Admin Header Component
 * Fixed top header with breadcrumbs and admin profile
 */

import { Box, HStack, VStack, Text, Button } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';

interface AdminHeaderProps {
  sidebarWidth: string;
}

const getBreadcrumbs = (pathname: string): { label: string; path: string }[] => {
  const parts = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [];

  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    let label = part.charAt(0).toUpperCase() + part.slice(1);

    // Custom labels
    if (part === 'admin' && index === 0) {
      label = 'Admin';
    } else if (part === 'users' && parts[index - 1] === 'admin') {
      label = 'Users';
    } else if (part === 'dashboard') {
      label = 'Dashboard';
    } else if (part === 'admins') {
      label = 'Admin Management';
    } else if (part === 'profile') {
      label = 'Profile';
    } else if (part === 'genie') {
      label = 'Genie';
    }

    // Skip UUID-like parts but show as "User Details"
    if (part.match(/^[a-f0-9-]{36}$/i)) {
      label = 'User Details';
    }

    breadcrumbs.push({ label, path: currentPath });
  });

  return breadcrumbs;
};

export const AdminHeader = ({ sidebarWidth }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAdminStore();

  const breadcrumbs = getBreadcrumbs(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={sidebarWidth}
      right={0}
      h="64px"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex={99}
      display="flex"
      alignItems="center"
      px={6}
      transition="left 0.2s ease"
    >
      <HStack justify="space-between" w="100%">
        {/* Breadcrumbs */}
        <HStack gap={2}>
          {breadcrumbs.map((crumb, index) => (
            <HStack key={crumb.path} gap={2}>
              {index > 0 && (
                <Text color="gray.400" fontSize="sm">/</Text>
              )}
              <Text
                fontSize="sm"
                color={index === breadcrumbs.length - 1 ? 'gray.800' : 'gray.500'}
                fontWeight={index === breadcrumbs.length - 1 ? 'medium' : 'normal'}
                cursor={index < breadcrumbs.length - 1 ? 'pointer' : 'default'}
                _hover={index < breadcrumbs.length - 1 ? { color: 'pink.600' } : {}}
                onClick={() => {
                  if (index < breadcrumbs.length - 1) {
                    navigate(crumb.path);
                  }
                }}
              >
                {crumb.label}
              </Text>
            </HStack>
          ))}
        </HStack>

        {/* Admin Profile & Actions */}
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
      </HStack>
    </Box>
  );
};
