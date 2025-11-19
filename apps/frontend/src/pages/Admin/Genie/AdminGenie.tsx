/**
 * Admin Genie Dashboard
 * Manage dates and view date information (Genie role)
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
  Grid,
} from '@chakra-ui/react';
import { AdminLayout } from '../../../components/admin';
import { useAdminStore } from '../../../stores/adminStore';

// Mock date data
const mockDates = [
  {
    id: '1',
    user1: { name: 'Rahul K.', age: 28 },
    user2: { name: 'Priya S.', age: 26 },
    venue: 'Cafe Coffee Day, Mumbai',
    dateTime: Date.now() / 1000 + 86400,
    status: 'scheduled',
    compatibility: 85,
  },
  {
    id: '2',
    user1: { name: 'Amit P.', age: 30 },
    user2: { name: 'Neha R.', age: 28 },
    venue: 'The Oberoi, Delhi',
    dateTime: Date.now() / 1000 + 172800,
    status: 'scheduled',
    compatibility: 92,
  },
  {
    id: '3',
    user1: { name: 'Vikram M.', age: 27 },
    user2: { name: 'Anjali T.', age: 25 },
    venue: 'Starbucks, Bangalore',
    dateTime: Date.now() / 1000 - 86400,
    status: 'completed',
    compatibility: 78,
  },
  {
    id: '4',
    user1: { name: 'Rohan S.', age: 29 },
    user2: { name: 'Kavita L.', age: 27 },
    venue: 'Le Meridien, Pune',
    dateTime: Date.now() / 1000 - 172800,
    status: 'cancelled',
    compatibility: 65,
  },
];

export const AdminGenie = () => {
  const { admin } = useAdminStore();
  const [dates] = useState(mockDates);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  const isGenie = admin?.role === 'ADMIN_ROLE_GENIE' || admin?.role === 'ADMIN_ROLE_SUPER';

  const filteredDates = filter === 'all'
    ? dates
    : dates.filter(d => d.status === filter);

  const scheduledCount = dates.filter(d => d.status === 'scheduled').length;
  const completedCount = dates.filter(d => d.status === 'completed').length;
  const cancelledCount = dates.filter(d => d.status === 'cancelled').length;

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (!isGenie) {
    return (
      <AdminLayout>
        <Box textAlign="center" py={20}>
          <Text fontSize="xl" color="gray.600">
            Access Denied
          </Text>
          <Text color="gray.500" mt={2}>
            Only Genie admins can access this page
          </Text>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Genie Dashboard
          </Text>
          <Text color="gray.500" fontSize="sm">
            Manage and monitor dates between users
          </Text>
        </Box>

        {/* Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <StatCard label="Scheduled" value={scheduledCount} color="blue" />
          <StatCard label="Completed" value={completedCount} color="green" />
          <StatCard label="Cancelled" value={cancelledCount} color="red" />
        </Grid>

        {/* Filter */}
        <HStack gap={2}>
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              bg={filter === status ? 'pink.500' : 'white'}
              color={filter === status ? 'white' : 'gray.600'}
              border="1px solid"
              borderColor={filter === status ? 'pink.500' : 'gray.200'}
              _hover={{
                bg: filter === status ? 'pink.600' : 'gray.50',
              }}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </HStack>

        {/* Dates Table */}
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
                  COUPLE
                </Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  VENUE
                </Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  DATE & TIME
                </Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  COMPATIBILITY
                </Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontWeight="semibold" color="gray.600" fontSize="xs">
                  STATUS
                </Table.ColumnHeader>
                <Table.ColumnHeader pr={5} py={3} fontWeight="semibold" color="gray.600" fontSize="xs" textAlign="right">
                  ACTIONS
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredDates.map((dateItem, index) => (
                <Table.Row
                  key={dateItem.id}
                  bg={index % 2 === 0 ? 'white' : 'gray.25'}
                  _hover={{ bg: 'pink.50' }}
                >
                  <Table.Cell pl={5} py={4}>
                    <VStack align="start" gap={1}>
                      <HStack gap={2}>
                        <Box
                          w="24px"
                          h="24px"
                          borderRadius="full"
                          bg="blue.100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          fontWeight="bold"
                          color="blue.600"
                        >
                          {dateItem.user1.name.charAt(0)}
                        </Box>
                        <Text fontSize="sm" color="gray.800">
                          {dateItem.user1.name}, {dateItem.user1.age}
                        </Text>
                      </HStack>
                      <HStack gap={2}>
                        <Box
                          w="24px"
                          h="24px"
                          borderRadius="full"
                          bg="pink.100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          fontWeight="bold"
                          color="pink.600"
                        >
                          {dateItem.user2.name.charAt(0)}
                        </Box>
                        <Text fontSize="sm" color="gray.800">
                          {dateItem.user2.name}, {dateItem.user2.age}
                        </Text>
                      </HStack>
                    </VStack>
                  </Table.Cell>
                  <Table.Cell py={4}>
                    <Text fontSize="sm" color="gray.600">
                      {dateItem.venue}
                    </Text>
                  </Table.Cell>
                  <Table.Cell py={4}>
                    <Text fontSize="sm" color="gray.600">
                      {formatDateTime(dateItem.dateTime)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell py={4}>
                    <HStack gap={2}>
                      <Box
                        w="40px"
                        h="6px"
                        bg="gray.100"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box
                          w={`${dateItem.compatibility}%`}
                          h="100%"
                          bg={dateItem.compatibility >= 80 ? 'green.400' : dateItem.compatibility >= 60 ? 'yellow.400' : 'red.400'}
                          borderRadius="full"
                        />
                      </Box>
                      <Text fontSize="sm" color="gray.600">
                        {dateItem.compatibility}%
                      </Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell py={4}>
                    <Badge
                      colorPalette={getStatusColor(dateItem.status)}
                      size="sm"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                    >
                      {dateItem.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell pr={5} py={4} textAlign="right">
                    <HStack gap={2} justify="flex-end">
                      <Button
                        size="xs"
                        bg="white"
                        border="1px solid"
                        borderColor="pink.300"
                        color="pink.600"
                        _hover={{ bg: 'pink.50' }}
                      >
                        View
                      </Button>
                      {dateItem.status === 'scheduled' && (
                        <Button
                          size="xs"
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                        >
                          Cancel
                        </Button>
                      )}
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {filteredDates.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">No dates found</Text>
            </Box>
          )}
        </Box>
      </VStack>
    </AdminLayout>
  );
};

// Stat Card Component
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'red';
}) => {
  const colorMap = {
    blue: { bg: 'blue.50', text: 'blue.600' },
    green: { bg: 'green.50', text: 'green.600' },
    red: { bg: 'red.50', text: 'red.600' },
  };

  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={5}
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
    >
      <VStack align="start" gap={1}>
        <Text fontSize="xs" color="gray.500" fontWeight="medium">
          {label.toUpperCase()}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color={colorMap[color].text}>
          {value}
        </Text>
      </VStack>
    </Box>
  );
};

export default AdminGenie;
