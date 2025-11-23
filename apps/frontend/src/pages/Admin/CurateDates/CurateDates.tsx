/**
 * Admin Curate Dates Page
 * AI-powered date matching and curation
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

export const CurateDates = () => {
  const [candidates, setCandidates] = useState<CurationCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CurationCandidate | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch candidates on mount
  const fetchCandidates = useCallback(async () => {
    setIsLoadingCandidates(true);
    setError(null);
    try {
      const response = await getCurationCandidates();
      setCandidates(response.candidates || []);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch candidates';
      setError(errorMsg);
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
    setError(null);

    // Get all other candidate IDs except the selected one
    const otherCandidateIds = candidates
      .filter(c => c.userId !== candidate.userId)
      .map(c => c.userId);

    if (otherCandidateIds.length === 0) {
      alert('No other candidates available for comparison');
      return;
    }

    setIsLoadingMatches(true);
    try {
      const response = await curateDates(candidate.userId, otherCandidateIds);
      setMatches(response.matches || []);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to analyze compatibility';
      setError(errorMsg);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <VStack align="stretch" gap={4} mb={4}>
        <Heading size="lg">Curate Dates</Heading>
        <Text color="gray.600">AI-powered date matching and compatibility analysis</Text>
      </VStack>

      <Grid templateColumns="400px 1fr" gap={6} h="calc(100vh - 200px)">
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
                <Spinner color="pink.500" />
              </Flex>
            ) : candidates.length === 0 ? (
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text color="gray.500" textAlign="center">
                  No users available for dates
                </Text>
              </Box>
            ) : (
              candidates.map((candidate) => (
                <Box
                  key={candidate.userId}
                  p={4}
                  bg={selectedCandidate?.userId === candidate.userId ? 'pink.50' : 'white'}
                  borderColor={selectedCandidate?.userId === candidate.userId ? 'pink.500' : 'gray.200'}
                  borderWidth="2px"
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => handleSelectCandidate(candidate)}
                  _hover={{
                    borderColor: 'pink.300',
                    shadow: 'sm',
                  }}
                  transition="all 0.2s"
                >
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="lg">
                        {candidate.name}
                      </Text>
                      <Badge colorScheme="pink">{candidate.age}</Badge>
                    </HStack>

                    <Text fontSize="sm" color="gray.600">
                      {candidate.email}
                    </Text>

                    <HStack gap={2} flexWrap="wrap">
                      <Badge colorScheme="blue" fontSize="xs">
                        {candidate.gender}
                      </Badge>
                      {candidate.emailVerified && (
                        <Badge colorScheme="green" fontSize="xs">
                          ✓ Email
                        </Badge>
                      )}
                      <Badge colorScheme="purple" fontSize="xs">
                        {candidate.profileCompletion}% Complete
                      </Badge>
                    </HStack>

                    <Text fontSize="xs" color="gray.500">
                      {candidate.availableSlotsCount} slots • Next: {formatDate(candidate.nextAvailableDate)}
                    </Text>
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
              <Text fontSize="xl" color="gray.500" textAlign="center">
                Select a user from the left to see compatibility analysis
              </Text>
            </Flex>
          ) : (
            <VStack align="stretch" gap={4}>
              <Box p={4} bg="pink.50" borderRadius="md">
                <VStack align="stretch" gap={2}>
                  <Heading size="md">
                    Analyzing Matches for {selectedCandidate.name}
                  </Heading>
                  <Text color="gray.600">
                    AI-powered compatibility analysis with other available users
                  </Text>
                </VStack>
              </Box>

              {isLoadingMatches ? (
                <Flex justify="center" align="center" h="300px" direction="column" gap={4}>
                  <Spinner size="xl" color="pink.500" />
                  <Text color="gray.600">Analyzing compatibility with AI...</Text>
                  <Text fontSize="sm" color="gray.500">This may take a few seconds</Text>
                </Flex>
              ) : matches.length === 0 ? (
                <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                  <Text color="gray.500" textAlign="center">
                    No matches found
                  </Text>
                </Box>
              ) : (
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" color="gray.600">
                    {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Analyzed
                  </Heading>

                  {matches
                    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                    .map((match) => (
                      <Box
                        key={match.userId}
                        p={6}
                        bg="white"
                        borderRadius="md"
                        borderWidth="2px"
                        borderColor={match.isMatch ? 'green.200' : 'gray.200'}
                      >
                        <VStack align="stretch" gap={4}>
                          {/* Header */}
                          <HStack justify="space-between">
                            <VStack align="start" gap={1}>
                              <Text fontWeight="bold" fontSize="xl">
                                {match.name}
                              </Text>
                              <HStack>
                                <Badge colorScheme="blue">{match.age}</Badge>
                                <Badge colorScheme="purple">{match.gender}</Badge>
                              </HStack>
                            </VStack>

                            <VStack align="end" gap={1}>
                              <Text
                                fontSize="3xl"
                                fontWeight="bold"
                                color={`${getScoreColor(match.compatibilityScore)}.500`}
                              >
                                {match.compatibilityScore.toFixed(0)}%
                              </Text>
                              <Badge
                                colorScheme={match.isMatch ? 'green' : 'gray'}
                                fontSize="sm"
                                px={3}
                                py={1}
                              >
                                {match.isMatch ? '✓ Match' : 'Not a Match'}
                              </Badge>
                            </VStack>
                          </HStack>

                          <Box h="1px" bg="gray.200" />

                          {/* Reasoning */}
                          <Box>
                            <Text fontWeight="semibold" mb={2} color="gray.700">
                              Analysis
                            </Text>
                            <Text color="gray.600" fontSize="sm" lineHeight="tall">
                              {match.reasoning}
                            </Text>
                          </Box>

                          {/* Matched Aspects */}
                          {match.matchedAspects && match.matchedAspects.length > 0 && (
                            <Box>
                              <Text fontWeight="semibold" mb={2} color="green.700">
                                ✓ Matched Aspects
                              </Text>
                              <VStack align="stretch" gap={1}>
                                {match.matchedAspects.map((aspect, idx) => (
                                  <Text key={idx} fontSize="sm" color="gray.600">
                                    • {aspect}
                                  </Text>
                                ))}
                              </VStack>
                            </Box>
                          )}

                          {/* Mismatched Aspects */}
                          {match.mismatchedAspects && match.mismatchedAspects.length > 0 && (
                            <Box>
                              <Text fontWeight="semibold" mb={2} color="red.700">
                                ✗ Mismatched Aspects
                              </Text>
                              <VStack align="stretch" gap={1}>
                                {match.mismatchedAspects.map((aspect, idx) => (
                                  <Text key={idx} fontSize="sm" color="gray.600">
                                    • {aspect}
                                  </Text>
                                ))}
                              </VStack>
                            </Box>
                          )}
                        </VStack>
                      </Box>
                    ))}
                </VStack>
              )}
            </VStack>
          )}
        </Box>
      </Grid>
    </AdminLayout>
  );
};
