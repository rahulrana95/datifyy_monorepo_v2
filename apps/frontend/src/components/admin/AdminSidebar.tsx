/**
 * Admin Sidebar Component
 * Collapsible navigation menu for admin dashboard
 */

import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  adminRole?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: string[]; // If empty, available to all
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { id: 'users', label: 'Users', icon: '👥', path: '/admin/users' },
  { id: 'admins', label: 'Admins', icon: '🔐', path: '/admin/admins', roles: ['ADMIN_ROLE_SUPER'] },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/admin/profile' },
  { id: 'genie', label: 'Genie', icon: '✨', path: '/admin/genie', roles: ['ADMIN_ROLE_GENIE', 'ADMIN_ROLE_SUPER'] },
];

export const AdminSidebar = ({ isCollapsed, onToggle, adminRole }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(adminRole || '');
  });

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w={isCollapsed ? '70px' : '240px'}
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      transition="width 0.2s ease"
      zIndex={100}
      display="flex"
      flexDirection="column"
    >
      {/* Logo */}
      <Box p={4} borderBottom="1px solid" borderColor="gray.100">
        <HStack gap={3} justify={isCollapsed ? 'center' : 'flex-start'}>
          <Box
            w="40px"
            h="40px"
            borderRadius="lg"
            bg="linear-gradient(135deg, #ED64A6 0%, #F687B3 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Text fontSize="lg" fontWeight="bold" color="white">
              D
            </Text>
          </Box>
          {!isCollapsed && (
            <VStack align="start" gap={0}>
              <Text
                fontSize="md"
                fontWeight="bold"
                bgGradient="linear(to-r, pink.600, pink.400)"
                bgClip="text"
              >
                Datifyy
              </Text>
              <Text fontSize="xs" color="gray.500">
                Admin
              </Text>
            </VStack>
          )}
        </HStack>
      </Box>

      {/* Menu Items */}
      <VStack flex={1} p={3} gap={1} align="stretch">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/admin/users' && location.pathname.startsWith('/admin/users'));

          const menuButton = (
            <Box
              key={item.id}
              as="button"
              w="100%"
              p={3}
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent={isCollapsed ? 'center' : 'flex-start'}
              gap={3}
              bg={isActive ? 'pink.50' : 'transparent'}
              color={isActive ? 'pink.600' : 'gray.600'}
              fontWeight={isActive ? 'semibold' : 'medium'}
              _hover={{
                bg: isActive ? 'pink.100' : 'gray.50',
                color: isActive ? 'pink.700' : 'gray.700',
              }}
              transition="all 0.15s"
              onClick={() => navigate(item.path)}
            >
              <Text fontSize="xl">{item.icon}</Text>
              {!isCollapsed && (
                <Text fontSize="sm">{item.label}</Text>
              )}
            </Box>
          );

          return menuButton;
        })}
      </VStack>

      {/* Collapse Toggle */}
      <Box p={3} borderTop="1px solid" borderColor="gray.100">
        <Box
          as="button"
          w="100%"
          p={3}
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? 'center' : 'flex-start'}
          gap={3}
          bg="transparent"
          color="gray.500"
          border="none"
          _hover={{ bg: 'pink.50', color: 'pink.600' }}
          _focus={{ boxShadow: '0 0 0 2px rgba(237, 100, 166, 0.2)', outline: 'none' }}
          _active={{ bg: 'pink.100' }}
          transition="all 0.15s"
          onClick={onToggle}
        >
          <Text fontSize="lg">{isCollapsed ? '→' : '←'}</Text>
          {!isCollapsed && (
            <Text fontSize="sm">Collapse</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
