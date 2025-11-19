import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  Flex,
  Grid,
  Card,
  Input,
} from '@chakra-ui/react';
import { useAdminStore } from '../../../stores/adminStore';

export const UserDetails: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const {
    isAuthenticated,
    selectedUser,
    userSuggestions,
    isLoading,
    fetchUserDetails,
    fetchSuggestions,
    createDate,
    clearSelectedUser,
  } = useAdminStore();

  const [schedulingUser, setSchedulingUser] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    if (userId) {
      fetchUserDetails(userId);
      fetchSuggestions(userId);
    }
    return () => clearSelectedUser();
  }, [isAuthenticated, userId, navigate, fetchUserDetails, fetchSuggestions, clearSelectedUser]);

  const handleScheduleDate = async (suggestedUserId: string) => {
    if (!selectedUser || !scheduleTime) return;

    try {
      await createDate({
        user1Id: selectedUser.userId,
        user2Id: suggestedUserId,
        scheduledTime: Math.floor(new Date(scheduleTime).getTime() / 1000),
        durationMinutes: 60,
        dateType: 'online',
        notes: scheduleNotes,
      });
      setSchedulingUser(null);
      setScheduleTime('');
      setScheduleNotes('');
      alert('Date scheduled successfully!');
    } catch (error) {
      alert('Failed to schedule date');
    }
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

  if (isLoading && !selectedUser) {
    return (
      <Flex minH="100vh" justify="center" align="center" bg="gray.50">
        <Spinner size="xl" color="pink.500" />
      </Flex>
    );
  }

  if (!selectedUser) {
    return (
      <Flex minH="100vh" justify="center" align="center" bg="gray.50">
        <Text color="gray.500">User not found</Text>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={4}>
        <Container maxW="1200px">
          <Flex justify="space-between" align="center">
            <HStack gap={4}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
              >
                ← Back
              </Button>
              <Heading
                size="lg"
                bgGradient="linear(to-r, pink.500, rose.500)"
                bgClip="text"
              >
                User Details
              </Heading>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="1200px" py={6}>
        <Grid templateColumns={{ base: '1fr', lg: '350px 1fr' }} gap={6}>
          {/* User Profile Card */}
          <Box bg="white" borderRadius="xl" boxShadow="sm" p={6}>
            <VStack gap={4} align="center">
              <Box
                w="96px"
                h="96px"
                borderRadius="full"
                bg="pink.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="2xl"
                fontWeight="bold"
                color="pink.700"
                overflow="hidden"
              >
                {selectedUser.photoUrl ? (
                  <img src={selectedUser.photoUrl} alt={selectedUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  selectedUser.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </Box>
              <VStack gap={1}>
                <Heading size="md">{selectedUser.name}</Heading>
                <Text color="gray.600" fontSize="sm">
                  {selectedUser.email}
                </Text>
                {selectedUser.phone && (
                  <Text color="gray.500" fontSize="sm">
                    {selectedUser.phone}
                  </Text>
                )}
              </VStack>

              <Badge colorPalette={getStatusColor(selectedUser.accountStatus)}>
                {selectedUser.accountStatus}
              </Badge>

              <Box w="full" pt={4} borderTop="1px solid" borderColor="gray.100">
                <VStack gap={2} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="sm">Age</Text>
                    <Text fontWeight="medium">{selectedUser.age || '-'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="sm">Gender</Text>
                    <Text fontWeight="medium">{selectedUser.gender || '-'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="sm">Joined</Text>
                    <Text fontWeight="medium">{formatDate(selectedUser.createdAt)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="sm">Photos</Text>
                    <Text fontWeight="medium">{selectedUser.photoCount}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="sm">Availability</Text>
                    <Text fontWeight="medium">{selectedUser.availabilityCount}</Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Suggestions */}
          <VStack gap={4} align="stretch">
            <Box bg="white" borderRadius="xl" boxShadow="sm" p={6}>
              <Heading size="md" mb={4}>
                Date Suggestions
              </Heading>

              {userSuggestions.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={4}>
                  No suggestions available. User may need to set preferences and availability.
                </Text>
              ) : (
                <VStack gap={4} align="stretch">
                  {userSuggestions.map((suggestion) => (
                    <Card.Root key={suggestion.user.userId} size="sm">
                      <Card.Body>
                        <HStack justify="space-between" align="start">
                          <HStack gap={3}>
                            <Box
                              w="48px"
                              h="48px"
                              borderRadius="full"
                              bg="pink.100"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="md"
                              fontWeight="medium"
                              color="pink.700"
                              overflow="hidden"
                              flexShrink={0}
                            >
                              {suggestion.user.photoUrl ? (
                                <img src={suggestion.user.photoUrl} alt={suggestion.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                suggestion.user.name?.charAt(0)?.toUpperCase() || '?'
                              )}
                            </Box>
                            <VStack align="start" gap={0}>
                              <Text fontWeight="medium">{suggestion.user.name}</Text>
                              <Text color="gray.500" fontSize="sm">
                                {suggestion.user.age} years • {suggestion.user.city || 'Unknown location'}
                              </Text>
                              {suggestion.commonInterests.length > 0 && (
                                <Text color="pink.500" fontSize="xs">
                                  Common: {suggestion.commonInterests.join(', ')}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                          <VStack align="end" gap={2}>
                            <Badge colorPalette="pink">
                              {Math.round(suggestion.compatibilityScore * 100)}% Match
                            </Badge>
                            {schedulingUser === suggestion.user.userId ? (
                              <VStack gap={2} align="stretch">
                                <Input
                                  type="datetime-local"
                                  size="xs"
                                  value={scheduleTime}
                                  onChange={(e) => setScheduleTime(e.target.value)}
                                />
                                <Input
                                  placeholder="Notes..."
                                  size="xs"
                                  value={scheduleNotes}
                                  onChange={(e) => setScheduleNotes(e.target.value)}
                                />
                                <HStack gap={1}>
                                  <Button
                                    size="xs"
                                    colorScheme="pink"
                                    onClick={() => handleScheduleDate(suggestion.user.userId)}
                                    disabled={!scheduleTime}
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => setSchedulingUser(null)}
                                  >
                                    Cancel
                                  </Button>
                                </HStack>
                              </VStack>
                            ) : (
                              <Button
                                size="xs"
                                colorScheme="pink"
                                onClick={() => setSchedulingUser(suggestion.user.userId)}
                              >
                                Schedule Date
                              </Button>
                            )}
                          </VStack>
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserDetails;
