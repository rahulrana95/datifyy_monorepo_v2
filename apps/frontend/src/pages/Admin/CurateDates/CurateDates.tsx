/**
 * Admin Curate Dates Page
 * AI-powered date matching and curation with enhanced UX
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Badge,
  Grid,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { AdminLayout } from '../../../components/admin';
import {
  getCurationCandidates,
  curateDates,
  CurationCandidate,
  MatchResult
} from '../../../services/admin/adminService';

type FilterType = 'all' | 'matches' | 'non-matches';

export const CurateDates = () => {
  const [candidates, setCandidates] = useState<CurationCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CurationCandidate | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // Fetch candidates on mount
  const fetchCandidates = useCallback(async () => {
    setIsLoadingCandidates(true);
    try {
      const response = await getCurationCandidates();
      setCandidates(response.candidates || []);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch candidates';
      alert(errorMsg);
    } finally {
      setIsLoadingCandidates(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSelectCandidate = async (candidate: CurationCandidate) => {
    setSelectedCandidate(candidate);
    setMatches([]);

    // Get all other candidate IDs except the selected one
    // Backend will automatically find candidates based on user's partner preferences
    setIsLoadingMatches(true);
    try {
      const response = await curateDates(candidate.userId);
      setMatches(response.matches || []);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to analyze compatibility';
      alert(errorMsg);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getMatchQuality = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'green', emoji: '🌟' };
    if (score >= 60) return { label: 'Good', color: 'blue', emoji: '💙' };
    if (score >= 40) return { label: 'Fair', color: 'orange', emoji: '🟡' };
    return { label: 'Poor', color: 'red', emoji: '⚠️' };
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter matches based on selected filter
  const filteredMatches = matches.filter(match => {
    if (filter === 'matches') return match.isMatch;
    if (filter === 'non-matches') return !match.isMatch;
    return true;
  }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Calculate statistics
  const stats = {
    total: matches.length,
    matches: matches.filter(m => m.isMatch).length,
    excellent: matches.filter(m => m.compatibilityScore >= 80).length,
    good: matches.filter(m => m.compatibilityScore >= 60 && m.compatibilityScore < 80).length,
    avgScore: matches.length > 0
      ? (matches.reduce((sum, m) => sum + m.compatibilityScore, 0) / matches.length).toFixed(1)
      : 0,
  };

  return (
    <AdminLayout>
      <VStack align="stretch" gap={4} mb={4}>
        <Heading size="lg">💝 Curate Dates</Heading>
        <Text color="gray.600">AI-powered date matching and compatibility analysis</Text>
      </VStack>

      <Grid templateColumns="380px 1fr" gap={6} h="calc(100vh - 200px)">
        {/* Left Panel - Candidate List */}
        <Box
          borderRight="1px solid"
          borderColor="gray.200"
          overflowY="auto"
          pr={4}
        >
          <VStack align="stretch" gap={3}>
            <HStack justify="space-between" mb={2}>
              <Heading size="md">Available Users</Heading>
              <Button
                size="sm"
                colorScheme="pink"
                onClick={fetchCandidates}
                disabled={isLoadingCandidates}
              >
                {isLoadingCandidates ? <Spinner size="sm" /> : 'Refresh'}
              </Button>
            </HStack>

            {isLoadingCandidates ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner color="pink.500" size="lg" />
              </Flex>
            ) : candidates.length === 0 ? (
              <Box p={6} bg="gray.50" borderRadius="lg" textAlign="center">
                <Text fontSize="3xl" mb={2}>👥</Text>
                <Text color="gray.500">No users available for dates</Text>
              </Box>
            ) : (
              candidates.map((candidate) => (
                <Box
                  key={candidate.userId}
                  p={4}
                  bg={selectedCandidate?.userId === candidate.userId ? 'pink.50' : 'white'}
                  borderColor={selectedCandidate?.userId === candidate.userId ? 'pink.500' : 'gray.200'}
                  borderWidth="2px"
                  borderRadius="lg"
                  cursor="pointer"
                  onClick={() => handleSelectCandidate(candidate)}
                  _hover={{
                    borderColor: 'pink.400',
                    shadow: 'md',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                >
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="lg">
                        {candidate.name}
                      </Text>
                      <Badge colorScheme="pink" fontSize="sm">{candidate.age} yrs</Badge>
                    </HStack>

                    <Text fontSize="sm" color="gray.600">
                      {candidate.email}
                    </Text>

                    <HStack gap={2} flexWrap="wrap">
                      <Badge colorScheme="blue" fontSize="xs" variant="subtle">
                        {candidate.gender}
                      </Badge>
                      {candidate.emailVerified && (
                        <Badge colorScheme="green" fontSize="xs" variant="subtle">
                          ✓ Verified
                        </Badge>
                      )}
                    </HStack>

                    <HStack justify="space-between" mt={1}>
                      <Text fontSize="xs" color="gray.500">
                        {candidate.availableSlotsCount} slots available
                      </Text>
                      <Badge colorScheme="purple" fontSize="xs">
                        {candidate.profileCompletion}%
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>
              ))
            )}
          </VStack>
        </Box>

        {/* Right Panel - Compatibility Results */}
        <Box overflowY="auto">
          {!selectedCandidate ? (
            <Flex h="full" align="center" justify="center" direction="column" gap={4}>
              <Text fontSize="6xl">💝</Text>
              <Heading size="md" color="gray.600">
                Select a User to Begin
              </Heading>
              <Text color="gray.500" textAlign="center" maxW="400px">
                Choose a user from the left panel to see AI-powered compatibility analysis with other available users
              </Text>
            </Flex>
          ) : (
            <VStack align="stretch" gap={4}>
              {/* Header with User Info */}
              <Box p={5} bg="gradient-to-r" bgGradient="linear(to-r, pink.50, purple.50)" borderRadius="lg" border="1px solid" borderColor="pink.200">
                <VStack align="stretch" gap={3}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md">
                        Finding Matches for {selectedCandidate.name}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {selectedCandidate.age} yrs • {selectedCandidate.gender} • {selectedCandidate.profileCompletion}% complete
                      </Text>
                    </VStack>
                    <Badge colorScheme="pink" fontSize="md" px={3} py={1}>
                      {selectedCandidate.availableSlotsCount} slots
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              {/* Loading State */}
              {isLoadingMatches ? (
                <Flex justify="center" align="center" h="400px" direction="column" gap={4}>
                  <Spinner size="xl" color="pink.500" />
                  <VStack gap={2}>
                    <Text color="gray.700" fontWeight="medium" fontSize="lg">
                      Analyzing Compatibility...
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      AI is evaluating profiles, preferences, and interests
                    </Text>
                  </VStack>
                </Flex>
              ) : matches.length === 0 ? (
                <Box p={8} bg="gray.50" borderRadius="lg" textAlign="center">
                  <Text fontSize="4xl" mb={2}>🔍</Text>
                  <Text color="gray.500">No matches analyzed yet</Text>
                </Box>
              ) : (
                <>
                  {/* Stats Summary */}
                  <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                    <Box p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
                      <VStack align="start" gap={1}>
                        <Text fontSize="xs" color="gray.600" fontWeight="medium">Total Analyzed</Text>
                        <Text fontSize="2xl" color="gray.700" fontWeight="bold">{stats.total}</Text>
                      </VStack>
                    </Box>
                    <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                      <VStack align="start" gap={1}>
                        <Text fontSize="xs" color="green.700" fontWeight="medium">Matches</Text>
                        <Text fontSize="2xl" color="green.600" fontWeight="bold">{stats.matches}</Text>
                        <Text fontSize="xs" color="green.600">≥60% score</Text>
                      </VStack>
                    </Box>
                    <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                      <VStack align="start" gap={1}>
                        <Text fontSize="xs" color="blue.700" fontWeight="medium">Avg. Score</Text>
                        <Text fontSize="2xl" color="blue.600" fontWeight="bold">{stats.avgScore}%</Text>
                      </VStack>
                    </Box>
                    <Box p={4} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
                      <VStack align="start" gap={1}>
                        <Text fontSize="xs" color="purple.700" fontWeight="medium">Excellent</Text>
                        <Text fontSize="2xl" color="purple.600" fontWeight="bold">{stats.excellent}</Text>
                        <Text fontSize="xs" color="purple.600">≥80% score</Text>
                      </VStack>
                    </Box>
                  </Grid>

                  {/* Filter Buttons */}
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      variant={filter === 'all' ? 'solid' : 'outline'}
                      colorScheme="pink"
                      onClick={() => setFilter('all')}
                    >
                      All ({matches.length})
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'matches' ? 'solid' : 'outline'}
                      colorScheme="green"
                      onClick={() => setFilter('matches')}
                    >
                      ✓ Matches ({stats.matches})
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'non-matches' ? 'solid' : 'outline'}
                      colorScheme="gray"
                      onClick={() => setFilter('non-matches')}
                    >
                      Non-Matches ({stats.total - stats.matches})
                    </Button>
                  </HStack>

                  {/* Match Cards */}
                  <VStack align="stretch" gap={4} mt={2}>
                    {filteredMatches.length === 0 ? (
                      <Box p={6} bg="gray.50" borderRadius="lg" textAlign="center">
                        <Text color="gray.500">No results for this filter</Text>
                      </Box>
                    ) : (
                      filteredMatches.map((match) => (
                        <MatchCard
                          key={match.userId}
                          match={match}
                          getScoreColor={getScoreColor}
                          getMatchQuality={getMatchQuality}
                        />
                      ))
                    )}
                  </VStack>
                </>
              )}
            </VStack>
          )}
        </Box>
      </Grid>
    </AdminLayout>
  );
};

// Separate Match Card Component for better organization
interface MatchCardProps {
  match: MatchResult;
  getScoreColor: (score: number) => string;
  getMatchQuality: (score: number) => { label: string; color: string; emoji: string };
}

const MatchCard = ({ match, getScoreColor, getMatchQuality }: MatchCardProps) => {
  const quality = getMatchQuality(match.compatibilityScore);

  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      borderWidth="2px"
      borderColor={match.isMatch ? 'green.300' : 'gray.200'}
      shadow={match.isMatch ? 'md' : 'sm'}
      transition="all 0.2s"
      _hover={{ shadow: 'lg' }}
    >
      <VStack align="stretch" gap={4}>
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" gap={1} flex="1">
            <HStack>
              <Text fontWeight="bold" fontSize="xl">
                {match.name}
              </Text>
              <Text fontSize="lg">{quality.emoji}</Text>
            </HStack>
            <HStack gap={2}>
              <Badge colorScheme="blue" variant="subtle">{match.age} yrs</Badge>
              <Badge colorScheme="purple" variant="subtle">{match.gender}</Badge>
              <Badge colorScheme={quality.color} variant="subtle">{quality.label} Match</Badge>
            </HStack>
          </VStack>

          <VStack align="end" gap={2}>
            <HStack align="baseline">
              <Text
                fontSize="4xl"
                fontWeight="bold"
                color={`${getScoreColor(match.compatibilityScore)}.500`}
              >
                {match.compatibilityScore.toFixed(0)}
              </Text>
              <Text fontSize="lg" color="gray.500">%</Text>
            </HStack>
            <Badge
              colorScheme={match.isMatch ? 'green' : 'gray'}
              fontSize="md"
              px={4}
              py={1}
              borderRadius="full"
            >
              {match.isMatch ? '✓ Recommended' : 'Not Recommended'}
            </Badge>
          </VStack>
        </HStack>

        <Box h="1px" bg="gray.200" />

        {/* AI Analysis Section */}
        <Box>
          <Text fontWeight="semibold" mb={2} color="gray.700" fontSize="md">
            🤖 AI Analysis
          </Text>
          <Text color="gray.600" fontSize="sm" lineHeight="tall" whiteSpace="pre-line">
            {match.reasoning}
          </Text>
        </Box>

        {/* Matched and Mismatched Aspects */}
        {((match.matchedAspects && match.matchedAspects.length > 0) ||
          (match.mismatchedAspects && match.mismatchedAspects.length > 0)) && (
          <Box>
            <Text fontWeight="semibold" mb={3} color="gray.700" fontSize="md">
              📊 Compatibility Details
            </Text>
            <VStack align="stretch" gap={3}>
                {/* Matched Aspects */}
                {match.matchedAspects && match.matchedAspects.length > 0 && (
                  <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                    <Text fontWeight="semibold" mb={2} color="green.800" fontSize="sm">
                      ✓ Strengths ({match.matchedAspects.length})
                    </Text>
                    <VStack align="stretch" gap={1}>
                      {match.matchedAspects.map((aspect, idx) => (
                        <HStack key={idx} gap={2}>
                          <Text color="green.600" fontSize="xs">✓</Text>
                          <Text fontSize="xs" color="gray.700">{aspect}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Mismatched Aspects */}
                {match.mismatchedAspects && match.mismatchedAspects.length > 0 && (
                  <Box p={3} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                    <Text fontWeight="semibold" mb={2} color="red.800" fontSize="sm">
                      ✗ Challenges ({match.mismatchedAspects.length})
                    </Text>
                    <VStack align="stretch" gap={1}>
                      {match.mismatchedAspects.map((aspect, idx) => (
                        <HStack key={idx} gap={2}>
                          <Text color="red.600" fontSize="xs">✗</Text>
                          <Text fontSize="xs" color="gray.700">{aspect}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
          </Box>
        )}

        {/* Action Buttons (for future implementation) */}
        {match.isMatch && (
          <HStack justify="flex-end" pt={2}>
            <Button size="sm" colorScheme="green" variant="outline">
              👍 Approve Match
            </Button>
            <Button size="sm" colorScheme="yellow" variant="outline">
              ⏸️ Review Later
            </Button>
            <Button size="sm" colorScheme="red" variant="ghost">
              ❌ Reject
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};
