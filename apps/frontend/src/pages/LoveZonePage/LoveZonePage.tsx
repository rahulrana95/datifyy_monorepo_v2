/**
 * Love Zone Page
 * User dates dashboard with statistics and date management
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Button,
  Spinner,
  Grid,
  Flex,
} from '@chakra-ui/react';
import { Header } from '../../shared/components/Header/Header';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

// Types
interface UserSummary {
  ID: number;
  Name: string;
  Age: number;
  Gender: string;
  Location: string;
  PhotoURL: string;
  Bio: string;
  Occupation: string;
}

interface DateSuggestion {
  ID: number;
  SuggestedUser: UserSummary;
  CompatibilityScore: number;
  Reasoning: string;
  Status: string;
  CreatedAt: string;
}

interface ScheduledDate {
  ID: number;
  OtherUser: UserSummary;
  ScheduledTime: string;
  DurationMinutes: number;
  Status: string;
  DateType: string;
  PlaceName: string;
  Address: string;
  City: string;
  Notes: string;
  CreatedAt: string;
  ConfirmedAt: string | null;
  CompletedAt: string | null;
}

interface RejectedDate {
  ID: number;
  RejectedUser: UserSummary;
  CompatibilityScore: number;
  RejectedAt: string;
}

interface Statistics {
  TotalSuggestions: number;
  PendingSuggestions: number;
  AcceptedSuggestions: number;
  RejectedSuggestions: number;
  TotalScheduledDates: number;
  UpcomingDates: number;
  PastDates: number;
  CompletedDates: number;
  CancelledDates: number;
  AcceptanceRate: number;
  CompletionRate: number;
}

interface DashboardData {
  pendingSuggestions: DateSuggestion[];
  upcomingDates: ScheduledDate[];
  pastDates: ScheduledDate[];
  rejectedDates: RejectedDate[];
  statistics: Statistics;
}

type TabType = 'suggestions' | 'upcoming' | 'past' | 'rejected';

export const LoveZonePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('suggestions');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    fetchDashboard();
  }, [isAuthenticated, navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual user ID from auth
      const userId = 3;
      const response = await fetch(`http://localhost:8080/api/v1/user/love-zone/dashboard?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setDashboardData({
          pendingSuggestions: data.pendingSuggestions || [],
          upcomingDates: data.upcomingDates || [],
          pastDates: data.pastDates || [],
          rejectedDates: data.rejectedDates || [],
          statistics: data.statistics || {},
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'yellow',
      accepted: 'green',
      rejected: 'red',
      scheduled: 'blue',
      confirmed: 'green',
      completed: 'purple',
      cancelled: 'red',
    };
    return statusColors[status] || 'gray';
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="bg">
        <Header />
        <Flex h="80vh" align="center" justify="center">
          <VStack gap={4}>
            <Spinner size="xl" color="brand.500" />
            <Text color="fg.muted">Loading Love Zone...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg">
      <Header />

      <Container maxW="1400px" py={8}>
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <Box>
            <Heading size="xl" color="fg" mb={2}>
              Love Zone
            </Heading>
            <Text color="fg.muted" fontSize="lg">
              Manage your dates, view suggestions, and track your dating journey
            </Text>
          </Box>

          {/* Statistics Dashboard */}
          {dashboardData?.statistics && (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 6 }} gap={4}>
              <Box bg="white" p={4} borderRadius="md" borderWidth="1px" borderColor="border">
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" color="fg.muted" fontWeight="medium">Total Suggestions</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.600">{dashboardData.statistics.TotalSuggestions}</Text>
                  <Text fontSize="xs" color="fg.muted">All time</Text>
                </VStack>
              </Box>

              <Box bg="white" p={4} borderRadius="md" borderWidth="1px" borderColor="border">
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" color="fg.muted" fontWeight="medium">Pending</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="yellow.600">{dashboardData.statistics.PendingSuggestions}</Text>
                  <Text fontSize="xs" color="fg.muted">Need response</Text>
                </VStack>
              </Box>

              <Box bg="white" p={4} borderRadius="md" borderWidth="1px" borderColor="border">
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" color="fg.muted" fontWeight="medium">Upcoming Dates</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">{dashboardData.statistics.UpcomingDates}</Text>
                  <Text fontSize="xs" color="fg.muted">Scheduled</Text>
                </VStack>
              </Box>

              <Box bg="white" p={4} borderRadius="md" borderWidth="1px" borderColor="border">
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" color="fg.muted" fontWeight="medium">Completed</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">{dashboardData.statistics.CompletedDates}</Text>
                  <Text fontSize="xs" color="fg.muted">Past dates</Text>
                </VStack>
              </Box>

              <Box bg="white" p={4} borderRadius="md" borderWidth="1px" borderColor="border">
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" color="fg.muted" fontWeight="medium">Acceptance Rate</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">{dashboardData.statistics.AcceptanceRate.toFixed(0)}%</Text>
                  <Text fontSize="xs" color="fg.muted">Suggestions</Text>
                </VStack>
              </Box>

              <Box bg="white" p={4} borderRadius="md" borderWidth="1px" borderColor="border">
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" color="fg.muted" fontWeight="medium">Completion Rate</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">{dashboardData.statistics.CompletionRate.toFixed(0)}%</Text>
                  <Text fontSize="xs" color="fg.muted">Scheduled dates</Text>
                </VStack>
              </Box>
            </SimpleGrid>
          )}

          {/* Tabs */}
          <Box bg="white" p={6} borderRadius="md" borderWidth="1px" borderColor="border">
            {/* Tab Headers */}
            <HStack gap={2} mb={6} borderBottomWidth="2px" borderColor="border" pb={2}>
              <Button
                variant={activeTab === 'suggestions' ? 'solid' : 'ghost'}
                colorScheme={activeTab === 'suggestions' ? 'brand' : 'gray'}
                size="sm"
                onClick={() => setActiveTab('suggestions')}
              >
                Suggestions
                {dashboardData && dashboardData.pendingSuggestions.length > 0 && (
                  <Badge ml={2} colorScheme="yellow" borderRadius="full">
                    {dashboardData.pendingSuggestions.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'upcoming' ? 'solid' : 'ghost'}
                colorScheme={activeTab === 'upcoming' ? 'brand' : 'gray'}
                size="sm"
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
                {dashboardData && dashboardData.upcomingDates.length > 0 && (
                  <Badge ml={2} colorScheme="blue" borderRadius="full">
                    {dashboardData.upcomingDates.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'past' ? 'solid' : 'ghost'}
                colorScheme={activeTab === 'past' ? 'brand' : 'gray'}
                size="sm"
                onClick={() => setActiveTab('past')}
              >
                Past Dates
              </Button>
              <Button
                variant={activeTab === 'rejected' ? 'solid' : 'ghost'}
                colorScheme={activeTab === 'rejected' ? 'brand' : 'gray'}
                size="sm"
                onClick={() => setActiveTab('rejected')}
              >
                Rejected
              </Button>
            </HStack>

            {/* Tab Content */}
            <VStack align="stretch" gap={4} minH="400px">
              {/* Suggestions Tab */}
              {activeTab === 'suggestions' && (
                <>
                  {dashboardData && dashboardData.pendingSuggestions.length > 0 ? (
                    dashboardData.pendingSuggestions.map((suggestion) => (
                      <Box key={suggestion.ID} p={4} borderWidth="1px" borderColor="border" borderRadius="md">
                        <Grid templateColumns={{ base: '1fr', md: 'auto 1fr auto' }} gap={4} alignItems="start">
                          <Box
                            w="60px"
                            h="60px"
                            borderRadius="full"
                            bg="brand.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                            fontSize="xl"
                            color="brand.600"
                          >
                            {suggestion.SuggestedUser.Name.charAt(0).toUpperCase()}
                          </Box>

                          <VStack align="start" flex={1} gap={1}>
                            <HStack>
                              <Heading size="md" color="fg">{suggestion.SuggestedUser.Name}</Heading>
                              <Badge colorScheme={getStatusColor(suggestion.Status)}>
                                {suggestion.Status}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="fg.muted">
                              {suggestion.SuggestedUser.Age} • {suggestion.SuggestedUser.Gender}
                            </Text>
                            {suggestion.SuggestedUser.Bio && (
                              <Text fontSize="sm" color="fg.muted">
                                {suggestion.SuggestedUser.Bio.substring(0, 100)}...
                              </Text>
                            )}
                            <Badge colorScheme="brand" fontSize="sm" mt={2}>
                              {suggestion.CompatibilityScore}% Match
                            </Badge>

                            {suggestion.Reasoning && (
                              <Box mt={3} p={3} bg="bg.subtle" borderRadius="md">
                                <Text fontSize="sm" fontWeight="medium" color="fg" mb={1}>
                                  Why this match?
                                </Text>
                                <Text fontSize="sm" color="fg.muted">
                                  {suggestion.Reasoning.substring(0, 200)}...
                                </Text>
                              </Box>
                            )}
                          </VStack>

                          {suggestion.Status === 'pending' && (
                            <VStack gap={2}>
                              <Button colorScheme="green" size="sm" w="100px">
                                Accept
                              </Button>
                              <Button colorScheme="red" variant="outline" size="sm" w="100px">
                                Reject
                              </Button>
                            </VStack>
                          )}
                        </Grid>
                      </Box>
                    ))
                  ) : (
                    <Flex h="300px" align="center" justify="center">
                      <VStack gap={2}>
                        <Text color="fg.muted" fontSize="lg">No pending suggestions</Text>
                        <Text color="fg.muted" fontSize="sm">Check back later for new matches!</Text>
                      </VStack>
                    </Flex>
                  )}
                </>
              )}

              {/* Upcoming Dates Tab */}
              {activeTab === 'upcoming' && (
                <>
                  {dashboardData && dashboardData.upcomingDates.length > 0 ? (
                    dashboardData.upcomingDates.map((date) => (
                      <Box key={date.ID} p={4} borderWidth="1px" borderColor="border" borderRadius="md" bg="blue.50">
                        <HStack align="start" gap={4}>
                          <Box
                            w="60px"
                            h="60px"
                            borderRadius="full"
                            bg="blue.500"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                            fontSize="xl"
                            color="white"
                          >
                            {date.OtherUser.Name.charAt(0).toUpperCase()}
                          </Box>

                          <VStack align="start" flex={1} gap={2}>
                            <HStack>
                              <Heading size="md" color="fg">{date.OtherUser.Name}</Heading>
                              <Badge colorScheme={getStatusColor(date.Status)}>
                                {date.Status}
                              </Badge>
                              <Badge colorScheme="cyan">{date.DateType}</Badge>
                            </HStack>

                            <Text fontSize="sm" color="fg.muted">
                              {date.OtherUser.Age} • {date.OtherUser.Gender}
                            </Text>

                            <Box bg="white" p={3} borderRadius="md" w="full">
                              <Text fontSize="sm" fontWeight="medium" color="brand.600" mb={1}>
                                Date Time
                              </Text>
                              <Text fontSize="sm" color="fg">
                                {formatDate(date.ScheduledTime)}
                              </Text>
                              <Text fontSize="xs" color="fg.muted" mt={1}>
                                Duration: {date.DurationMinutes} minutes
                              </Text>
                            </Box>

                            {date.Notes && (
                              <Box bg="white" p={3} borderRadius="md" w="full">
                                <Text fontSize="xs" color="fg.muted" whiteSpace="pre-wrap">
                                  {date.Notes}
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    ))
                  ) : (
                    <Flex h="300px" align="center" justify="center">
                      <VStack gap={2}>
                        <Text color="fg.muted" fontSize="lg">No upcoming dates</Text>
                        <Text color="fg.muted" fontSize="sm">Your scheduled dates will appear here</Text>
                      </VStack>
                    </Flex>
                  )}
                </>
              )}

              {/* Past Dates Tab */}
              {activeTab === 'past' && (
                <>
                  {dashboardData && dashboardData.pastDates.length > 0 ? (
                    dashboardData.pastDates.map((date) => (
                      <Box key={date.ID} p={4} borderWidth="1px" borderColor="border" borderRadius="md" opacity={0.8}>
                        <HStack align="start" gap={4}>
                          <Box
                            w="50px"
                            h="50px"
                            borderRadius="full"
                            bg="purple.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                            fontSize="lg"
                            color="purple.600"
                          >
                            {date.OtherUser.Name.charAt(0).toUpperCase()}
                          </Box>

                          <VStack align="start" flex={1} gap={1}>
                            <HStack>
                              <Heading size="sm" color="fg">{date.OtherUser.Name}</Heading>
                              <Badge colorScheme={getStatusColor(date.Status)} size="sm">
                                {date.Status}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="fg.muted">
                              {formatDate(date.ScheduledTime)}
                            </Text>
                            {date.CompletedAt && (
                              <Text fontSize="xs" color="fg.muted">
                                Completed: {formatDate(date.CompletedAt)}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    ))
                  ) : (
                    <Flex h="300px" align="center" justify="center">
                      <VStack gap={2}>
                        <Text color="fg.muted" fontSize="lg">No past dates</Text>
                        <Text color="fg.muted" fontSize="sm">Your completed dates will appear here</Text>
                      </VStack>
                    </Flex>
                  )}
                </>
              )}

              {/* Rejected Dates Tab */}
              {activeTab === 'rejected' && (
                <>
                  {dashboardData && dashboardData.rejectedDates.length > 0 ? (
                    dashboardData.rejectedDates.map((rejection) => (
                      <Box key={rejection.ID} p={4} borderWidth="1px" borderColor="border" borderRadius="md" opacity={0.6}>
                        <HStack align="start" gap={4}>
                          <Box
                            w="50px"
                            h="50px"
                            borderRadius="full"
                            bg="gray.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                            fontSize="lg"
                            color="gray.600"
                          >
                            {rejection.RejectedUser.Name.charAt(0).toUpperCase()}
                          </Box>

                          <VStack align="start" flex={1} gap={1}>
                            <Heading size="sm" color="fg">{rejection.RejectedUser.Name}</Heading>
                            <Text fontSize="sm" color="fg.muted">
                              {rejection.RejectedUser.Age} • {rejection.RejectedUser.Gender}
                            </Text>
                            <Text fontSize="xs" color="fg.muted">
                              Rejected: {formatDate(rejection.RejectedAt)}
                            </Text>
                            <Badge colorScheme="gray" size="sm">
                              {rejection.CompatibilityScore}% Match
                            </Badge>
                          </VStack>
                        </HStack>
                      </Box>
                    ))
                  ) : (
                    <Flex h="300px" align="center" justify="center">
                      <VStack gap={2}>
                        <Text color="fg.muted" fontSize="lg">No rejected dates</Text>
                        <Text color="fg.muted" fontSize="sm">Rejected suggestions will appear here</Text>
                      </VStack>
                    </Flex>
                  )}
                </>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
