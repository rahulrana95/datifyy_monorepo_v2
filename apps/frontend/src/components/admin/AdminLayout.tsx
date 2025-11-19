/**
 * Admin Layout Component
 * Main layout wrapper with collapsible sidebar and fixed header
 */

import { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminStore } from '../../stores/adminStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, admin } = useAdminStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const sidebarWidth = isSidebarCollapsed ? '70px' : '240px';

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        adminRole={admin?.role}
      />

      {/* Header */}
      <AdminHeader sidebarWidth={sidebarWidth} />

      {/* Main Content */}
      <Box
        ml={sidebarWidth}
        pt="64px"
        minH="100vh"
        transition="margin-left 0.2s ease"
      >
        <Box p={6}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
