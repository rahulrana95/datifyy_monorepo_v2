/**
 * Availability Page
 * Premium dating app UI for managing date availability
 */

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  Badge,
  Input,
  Textarea,
  Flex,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Header } from '../../shared/components/Header/Header';
import { useAvailabilityStore } from '../../stores/availabilityStore';
import type { AvailabilitySlotInput, OfflineLocation } from '../../services/availability';

// ============================================================================
// Nominatim (OpenStreetMap) Types
// ============================================================================

interface NominatimSuggestion {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address: {
    amenity?: string;
    shop?: string;
    tourism?: string;
    building?: string;
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

// ============================================================================
// Types
// ============================================================================

type DateType = 'DATE_TYPE_ONLINE' | 'DATE_TYPE_OFFLINE' | 'DATE_TYPE_OFFLINE_EVENT';
type ViewMode = 'schedule' | 'add';

interface TimeSlot {
  startTime: number;
  endTime: number;
  label: string;
  date: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const generateTimeSlots = (daysAhead: number = 7): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const now = new Date();

  const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  startDate.setMinutes(0, 0, 0);

  if (now.getMinutes() > 0) {
    startDate.setHours(startDate.getHours() + 1);
  }

  for (let day = 0; day < daysAhead; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    for (let hour = 8; hour <= 22; hour++) {
      const slotStart = new Date(currentDate);
      slotStart.setHours(hour, 0, 0, 0);

      if (slotStart.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1);

        const dateStr = slotStart.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        const timeStr = slotStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        slots.push({
          startTime: Math.floor(slotStart.getTime() / 1000),
          endTime: Math.floor(slotEnd.getTime() / 1000),
          label: timeStr,
          date: dateStr
        });
      }
    }
  }

  return slots;
};

const formatDateOnly = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const formatTimeOnly = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const dateTypeLabels: Record<DateType, string> = {
  'DATE_TYPE_ONLINE': 'Virtual Date',
  'DATE_TYPE_OFFLINE': 'In-Person',
  'DATE_TYPE_OFFLINE_EVENT': 'Event'
};

const dateTypeDescriptions: Record<DateType, string> = {
  'DATE_TYPE_ONLINE': 'Video call from anywhere',
  'DATE_TYPE_OFFLINE': 'Meet at a cozy spot',
  'DATE_TYPE_OFFLINE_EVENT': 'Attend together'
};

// ============================================================================
// Component
// ============================================================================

export const AvailabilityPage = (): JSX.Element => {
  const { slots, isLoading, isSubmitting, error, fetchAvailability, submitAvailability, deleteSlot } = useAvailabilityStore();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('schedule');

  // Add mode state
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [dateType, setDateType] = useState<DateType>('DATE_TYPE_ONLINE');
  const [notes, setNotes] = useState('');
  const [offlineLocation, setOfflineLocation] = useState<OfflineLocation>({
    placeName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    latitude: 0,
    longitude: 0
  });

  // Schedule view state
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Location search state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Notification
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Generate available time slots
  const availableSlots = useMemo(() => generateTimeSlots(7), []);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, TimeSlot[]> = {};
    availableSlots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [availableSlots]);

  // Group existing slots by date for schedule view
  const scheduledByDate = useMemo(() => {
    const grouped: Record<string, typeof slots> = {};
    slots.forEach(slot => {
      const dateKey = formatDateOnly(slot.startTime);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    // Sort each group by time
    Object.values(grouped).forEach(group => {
      group.sort((a, b) => a.startTime - b.startTime);
    });
    return grouped;
  }, [slots]);

  // Get existing slot times
  const existingSlotTimes = useMemo(() => {
    return new Set(slots.map(s => s.startTime));
  }, [slots]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search location with debounce using Nominatim (OpenStreetMap)
  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept': 'application/json',
            // Required by Nominatim usage policy
            'User-Agent': 'Datifyy-Dating-App'
          }
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Location search error:', err);
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  };

  const handleSelectLocation = (suggestion: NominatimSuggestion) => {
    const addr = suggestion.address;

    // Build the address string
    const addressParts = [];
    if (addr.house_number) addressParts.push(addr.house_number);
    if (addr.road) addressParts.push(addr.road);
    if (addr.neighbourhood) addressParts.push(addr.neighbourhood);

    const streetAddress = addressParts.join(' ') || suggestion.display_name.split(',')[0];

    // Get city (could be city, town, village, or municipality)
    const city = addr.city || addr.town || addr.village || addr.municipality || '';

    // Get place name (amenity, shop, tourism, building, or first part of display_name)
    const placeName = addr.amenity || addr.shop || addr.tourism || addr.building || suggestion.name || suggestion.display_name.split(',')[0];

    setOfflineLocation({
      placeName: placeName,
      address: streetAddress,
      city: city,
      state: addr.state || '',
      country: addr.country || '',
      zipcode: addr.postcode || '',
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    });

    setLocationQuery(suggestion.display_name);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const clearLocation = () => {
    setLocationQuery('');
    setOfflineLocation({
      placeName: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
      latitude: 0,
      longitude: 0
    });
    setLocationSuggestions([]);
  };

  const handleSlotToggle = (startTime: number) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(startTime)) {
      newSelected.delete(startTime);
    } else {
      newSelected.add(startTime);
    }
    setSelectedSlots(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedSlots.size === 0) {
      setNotification({ type: 'error', message: 'Please select at least one time slot' });
      return;
    }

    if ((dateType === 'DATE_TYPE_OFFLINE' || dateType === 'DATE_TYPE_OFFLINE_EVENT') &&
        (!offlineLocation.placeName || !offlineLocation.address || !offlineLocation.city ||
         !offlineLocation.state || !offlineLocation.country || !offlineLocation.zipcode)) {
      setNotification({ type: 'error', message: 'Please fill in all location fields' });
      return;
    }

    const slotsToSubmit: AvailabilitySlotInput[] = Array.from(selectedSlots).map(startTime => ({
      startTime,
      endTime: startTime + 3600,
      dateType,
      notes: notes || undefined,
      offlineLocation: (dateType === 'DATE_TYPE_OFFLINE' || dateType === 'DATE_TYPE_OFFLINE_EVENT')
        ? offlineLocation
        : undefined
    }));

    try {
      const result = await submitAvailability(slotsToSubmit);
      if (result.success) {
        setNotification({ type: 'success', message: 'Your availability has been saved!' });
        setSelectedSlots(new Set());
        setNotes('');
        // Switch to schedule view after successful submit
        setViewMode('schedule');
      } else {
        setNotification({ type: 'error', message: result.message });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save'
      });
    }
  };

  const handleClearForm = () => {
    setSelectedSlots(new Set());
    setNotes('');
    setLocationQuery('');
    setOfflineLocation({
      placeName: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
      latitude: 0,
      longitude: 0
    });
    setLocationSuggestions([]);
  };

  const handleDeleteToggle = (slotId: string) => {
    const newSelected = new Set(selectedForDelete);
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    setSelectedForDelete(newSelected);
  };

  const handleSelectAllForDelete = () => {
    if (selectedForDelete.size === slots.length) {
      setSelectedForDelete(new Set());
    } else {
      setSelectedForDelete(new Set(slots.map(s => s.slotId)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedForDelete.size === 0) return;

    setIsDeleting(true);
    try {
      for (const slotId of selectedForDelete) {
        await deleteSlot(slotId);
      }
      setNotification({
        type: 'success',
        message: `Removed ${selectedForDelete.size} time slot${selectedForDelete.size > 1 ? 's' : ''}`
      });
      setSelectedForDelete(new Set());
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && slots.length === 0) {
    return (
      <Box minH="100vh" bg="bg">
        <Header />
        <Container maxW="600px" py={8} mx="auto">
          <VStack align="center" justify="center" minH="400px">
            <Spinner size="xl" color="brand.500" />
            <Text color="fg.muted">Loading your availability...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg" pb={{ base: '140px', md: '100px' }}>
      <Header />

      {/* Notification Toast */}
      {notification && (
        <Box
          position="fixed"
          top={4}
          left="50%"
          transform="translateX(-50%)"
          zIndex={1000}
          maxW="360px"
          w="90%"
          bg={notification.type === 'success' ? 'like.500' : 'nope.500'}
          color="white"
          p={4}
          borderRadius="xl"
          boxShadow="xl"
        >
          <HStack justify="space-between">
            <HStack gap={3}>
              <Text fontSize="lg">
                {notification.type === 'success' ? '✓' : '!'}
              </Text>
              <Text fontSize="sm" fontWeight="medium">{notification.message}</Text>
            </HStack>
            <Button
              size="xs"
              variant="ghost"
              color="white"
              onClick={() => setNotification(null)}
              _hover={{ bg: 'whiteAlpha.200' }}
              minW="auto"
              p={1}
            >
              ✕
            </Button>
          </HStack>
        </Box>
      )}

      {/* Page Header - More Compact */}
      <Box textAlign="center" py={4} px={4} bg="bg">
        <Heading
          size={{ base: 'lg', md: 'xl' }}
          color="fg"
          fontWeight="bold"
          mb={1}
        >
          Your Availability
        </Heading>
        <Text color="fg.muted" fontSize={{ base: 'xs', md: 'sm' }}>
          Let potential dates know when you're free
        </Text>
      </Box>

      {/* Sticky View Toggle */}
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        bg="bg"
        borderBottomWidth="1px"
        borderColor="border"
        py={3}
        px={4}
      >
        <Container maxW="600px" mx="auto" px={0}>
          <Box
            bg="white"
            borderRadius="2xl"
            p={1.5}
            borderWidth="1px"
            borderColor="border"
            boxShadow="sm"
          >
            <HStack gap={1}>
              <Button
                flex={1}
                size="md"
                bg={viewMode === 'schedule' ? 'brand.500' : 'transparent'}
                color={viewMode === 'schedule' ? 'white' : 'fg.muted'}
                onClick={() => setViewMode('schedule')}
                borderRadius="xl"
                fontWeight="semibold"
                fontSize="sm"
                h="40px"
                _hover={{
                  bg: viewMode === 'schedule' ? 'brand.600' : 'gray.100'
                }}
              >
                My Schedule {slots.length > 0 && `(${slots.length})`}
              </Button>
              <Button
                flex={1}
                size="md"
                bg={viewMode === 'add' ? 'brand.500' : 'transparent'}
                color={viewMode === 'add' ? 'white' : 'fg.muted'}
                onClick={() => setViewMode('add')}
                borderRadius="xl"
                fontWeight="semibold"
                fontSize="sm"
                h="40px"
                _hover={{
                  bg: viewMode === 'add' ? 'brand.600' : 'gray.100'
                }}
              >
                Add Times
              </Button>
            </HStack>
          </Box>
        </Container>
      </Box>

      <Container maxW="600px" py={4} px={4} mx="auto">
        <VStack align="stretch" gap={4}>

          {/* ============ SCHEDULE VIEW ============ */}
          {viewMode === 'schedule' && (
            <>
              {slots.length === 0 ? (
                <Box
                  bg="white"
                  borderRadius="2xl"
                  p={8}
                  borderWidth="1px"
                  borderColor="border"
                  textAlign="center"
                >
                  <Text fontSize="4xl" mb={4}>📅</Text>
                  <Heading size="md" color="fg" mb={2}>
                    No availability set
                  </Heading>
                  <Text color="fg.muted" fontSize="sm" mb={6}>
                    Add your available times to start matching
                  </Text>
                  <Button
                    bg="brand.500"
                    color="white"
                    onClick={() => setViewMode('add')}
                    borderRadius="xl"
                    size="lg"
                    _hover={{ bg: 'brand.600' }}
                  >
                    Add Availability
                  </Button>
                </Box>
              ) : (
                <>
                  {/* Select All / Delete Actions - Compact */}
                  <HStack justify="space-between" px={1} py={2}>
                    <HStack
                      gap={2}
                      cursor="pointer"
                      onClick={handleSelectAllForDelete}
                    >
                      <Box
                        w={4}
                        h={4}
                        borderRadius="md"
                        borderWidth="2px"
                        borderColor={selectedForDelete.size === slots.length ? 'brand.500' : 'gray.300'}
                        bg={selectedForDelete.size === slots.length ? 'brand.500' : 'white'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="all 0.15s"
                      >
                        {selectedForDelete.size === slots.length && (
                          <Text color="white" fontSize="2xs" fontWeight="bold">✓</Text>
                        )}
                      </Box>
                      <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                        {selectedForDelete.size > 0
                          ? `${selectedForDelete.size} selected`
                          : 'Select all'
                        }
                      </Text>
                    </HStack>
                    {selectedForDelete.size > 0 && (
                      <Button
                        size="xs"
                        bg="nope.500"
                        color="white"
                        onClick={handleDeleteSelected}
                        loading={isDeleting}
                        borderRadius="lg"
                        fontWeight="medium"
                        h="28px"
                        px={3}
                        fontSize="xs"
                        _hover={{ bg: 'nope.600' }}
                      >
                        Delete
                      </Button>
                    )}
                  </HStack>

                  {/* Scheduled Slots by Date - Compact Grid Layout */}
                  <VStack align="stretch" gap={3}>
                    {Object.entries(scheduledByDate).map(([date, daySlots]) => (
                      <Box
                        key={date}
                        bg="white"
                        borderRadius="xl"
                        p={3}
                        borderWidth="1px"
                        borderColor="border"
                      >
                        <Text fontWeight="semibold" color="fg" mb={2} fontSize="xs">
                          {date}
                        </Text>
                        <VStack align="stretch" gap={1.5}>
                          {daySlots.map(slot => (
                            <HStack
                              key={slot.slotId}
                              px={2.5}
                              py={2}
                              bg={selectedForDelete.has(slot.slotId) ? 'brand.50' : 'gray.50'}
                              borderRadius="lg"
                              borderWidth="1px"
                              borderColor={selectedForDelete.has(slot.slotId) ? 'brand.200' : 'transparent'}
                              cursor="pointer"
                              onClick={() => handleDeleteToggle(slot.slotId)}
                              transition="all 0.15s"
                              _hover={{ bg: selectedForDelete.has(slot.slotId) ? 'brand.100' : 'gray.100' }}
                              gap={2}
                            >
                              <Box
                                w={4}
                                h={4}
                                borderRadius="sm"
                                borderWidth="2px"
                                borderColor={selectedForDelete.has(slot.slotId) ? 'brand.500' : 'gray.300'}
                                bg={selectedForDelete.has(slot.slotId) ? 'brand.500' : 'white'}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                                transition="all 0.15s"
                              >
                                {selectedForDelete.has(slot.slotId) && (
                                  <Text color="white" fontSize="2xs" fontWeight="bold">✓</Text>
                                )}
                              </Box>
                              <VStack align="start" flex={1} gap={0.5}>
                                <HStack gap={2} align="center">
                                  <Text fontWeight="semibold" color="fg" fontSize="sm">
                                    {formatTimeOnly(slot.startTime)}
                                  </Text>
                                  <Badge
                                    bg="brand.100"
                                    color="brand.700"
                                    fontSize="2xs"
                                    borderRadius="md"
                                    px={1.5}
                                    py={0.5}
                                    fontWeight="medium"
                                  >
                                    {dateTypeLabels[slot.dateType as DateType]}
                                  </Badge>
                                </HStack>
                                {slot.offlineLocation && (
                                  <Text
                                    fontSize="2xs"
                                    color="fg.muted"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                  >
                                    📍 {slot.offlineLocation.placeName}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </>
              )}
            </>
          )}

          {/* ============ ADD VIEW ============ */}
          {viewMode === 'add' && (
            <>
              {/* Date Type Selection - Compact */}
              <Box
                bg="white"
                borderRadius="xl"
                p={3}
                borderWidth="1px"
                borderColor="border"
              >
                <Text fontWeight="semibold" mb={2} color="fg" fontSize="sm">
                  Date Type
                </Text>
                <VStack align="stretch" gap={1.5}>
                  {(['DATE_TYPE_ONLINE', 'DATE_TYPE_OFFLINE', 'DATE_TYPE_OFFLINE_EVENT'] as DateType[]).map(type => (
                    <Box
                      key={type}
                      px={3}
                      py={2.5}
                      borderRadius="lg"
                      borderWidth="2px"
                      borderColor={dateType === type ? 'brand.500' : 'gray.100'}
                      bg={dateType === type ? 'brand.50' : 'white'}
                      cursor="pointer"
                      transition="all 0.15s"
                      onClick={() => setDateType(type)}
                    >
                      <HStack justify="space-between">
                        <VStack align="start" gap={0}>
                          <Text fontWeight="semibold" color={dateType === type ? 'brand.700' : 'fg'} fontSize="sm">
                            {dateTypeLabels[type]}
                          </Text>
                          <Text fontSize="2xs" color="fg.muted">
                            {dateTypeDescriptions[type]}
                          </Text>
                        </VStack>
                        {dateType === type && (
                          <Box w={4} h={4} borderRadius="full" bg="brand.500" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                            <Text color="white" fontSize="xs">✓</Text>
                          </Box>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Offline Location Fields - Compact */}
              {(dateType === 'DATE_TYPE_OFFLINE' || dateType === 'DATE_TYPE_OFFLINE_EVENT') && (
                <Box
                  bg="white"
                  borderRadius="xl"
                  p={3}
                  borderWidth="1px"
                  borderColor="border"
                >
                  <Text fontWeight="semibold" mb={2} color="fg" fontSize="sm">
                    Meeting Location
                  </Text>
                  <VStack align="stretch" gap={3}>
                    {/* Search Input */}
                    <Box position="relative" ref={suggestionsRef}>
                      <Box position="relative">
                        <Input
                          value={locationQuery}
                          onChange={e => handleLocationQueryChange(e.target.value)}
                          onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                          placeholder="Search for a place, cafe, restaurant..."
                          size="md"
                          borderRadius="lg"
                          borderColor={offlineLocation.placeName ? 'brand.500' : 'gray.200'}
                          bg={offlineLocation.placeName ? 'brand.50' : 'white'}
                          pl={10}
                          pr={offlineLocation.placeName ? 10 : 4}
                          _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                        />
                        {/* Search Icon */}
                        <Box
                          position="absolute"
                          left={3}
                          top="50%"
                          transform="translateY(-50%)"
                          color={offlineLocation.placeName ? 'brand.500' : 'gray.400'}
                        >
                          {isSearchingLocation ? (
                            <Spinner size="sm" color="brand.500" />
                          ) : (
                            <Text fontSize="sm">🔍</Text>
                          )}
                        </Box>
                        {/* Clear Button */}
                        {offlineLocation.placeName && (
                          <Box
                            position="absolute"
                            right={2}
                            top="50%"
                            transform="translateY(-50%)"
                            w={5}
                            h={5}
                            borderRadius="full"
                            bg="gray.200"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            onClick={clearLocation}
                            _hover={{ bg: 'gray.300' }}
                            transition="all 0.15s"
                          >
                            <Text fontSize="xs" color="gray.600" fontWeight="bold" lineHeight={1}>×</Text>
                          </Box>
                        )}
                      </Box>

                      {/* Suggestions Dropdown */}
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          mt={1}
                          bg="white"
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor="gray.200"
                          boxShadow="lg"
                          zIndex={1000}
                          maxH="200px"
                          overflowY="auto"
                        >
                          {locationSuggestions.map(suggestion => {
                            const placeName = suggestion.address.amenity || suggestion.address.shop || suggestion.address.tourism || suggestion.address.building || suggestion.name || suggestion.display_name.split(',')[0];
                            return (
                              <Box
                                key={suggestion.place_id}
                                p={3}
                                cursor="pointer"
                                _hover={{ bg: 'brand.50' }}
                                onClick={() => handleSelectLocation(suggestion)}
                                borderBottomWidth="1px"
                                borderColor="gray.100"
                                _last={{ borderBottomWidth: 0 }}
                              >
                                <Text
                                  fontSize="sm"
                                  color="fg"
                                  fontWeight="medium"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                >
                                  {placeName}
                                </Text>
                                <Text
                                  fontSize="xs"
                                  color="fg.muted"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                >
                                  {suggestion.display_name}
                                </Text>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>

                    {/* Selected Location Details */}
                    {offlineLocation.placeName && (
                      <Box
                        bg="gray.50"
                        borderRadius="lg"
                        p={4}
                        borderWidth="1px"
                        borderColor="gray.100"
                      >
                        <VStack align="stretch" gap={2}>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="fg.muted" fontWeight="medium">Selected Location</Text>
                            <Badge bg="like.100" color="like.700" fontSize="xs" borderRadius="md">
                              ✓ Confirmed
                            </Badge>
                          </HStack>
                          <Text fontWeight="semibold" color="fg" fontSize="sm">
                            {offlineLocation.placeName}
                          </Text>
                          <Text fontSize="xs" color="fg.muted">
                            {offlineLocation.address}
                            {offlineLocation.city && `, ${offlineLocation.city}`}
                            {offlineLocation.state && `, ${offlineLocation.state}`}
                            {offlineLocation.zipcode && ` ${offlineLocation.zipcode}`}
                          </Text>
                          {offlineLocation.country && (
                            <Text fontSize="xs" color="fg.muted">
                              {offlineLocation.country}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {!offlineLocation.placeName && (
                      <Text fontSize="xs" color="fg.muted" textAlign="center" py={2}>
                        Start typing to search for a location
                      </Text>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Notes - Compact */}
              <Box
                bg="white"
                borderRadius="xl"
                p={3}
                borderWidth="1px"
                borderColor="border"
              >
                <Text fontWeight="semibold" mb={2} color="fg" fontSize="sm">
                  Notes <Text as="span" color="fg.muted" fontWeight="normal" fontSize="2xs">(Optional)</Text>
                </Text>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any preferences for your date..."
                  rows={2}
                  fontSize="sm"
                  borderRadius="lg"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                />
              </Box>

              {/* Time Slots Selection - Compact */}
              <Box
                bg="white"
                borderRadius="xl"
                p={3}
                borderWidth="1px"
                borderColor="border"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontWeight="semibold" color="fg" fontSize="sm">
                    Select Times
                  </Text>
                  {selectedSlots.size > 0 && (
                    <Badge
                      bg="brand.500"
                      color="white"
                      fontSize="2xs"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontWeight="semibold"
                    >
                      {selectedSlots.size}
                    </Badge>
                  )}
                </Flex>

                <VStack align="stretch" gap={3}>
                  {Object.entries(slotsByDate).map(([date, daySlots]) => (
                    <Box key={date}>
                      <Text fontWeight="medium" color="fg" mb={1.5} fontSize="2xs" textTransform="uppercase" letterSpacing="wide">
                        {date}
                      </Text>
                      <Flex gap={1.5} flexWrap="wrap">
                        {daySlots.map(slot => {
                          const isSelected = selectedSlots.has(slot.startTime);
                          const isExisting = existingSlotTimes.has(slot.startTime);

                          return (
                            <Button
                              key={slot.startTime}
                              size="sm"
                              bg={isExisting ? 'gray.100' : isSelected ? 'brand.500' : 'white'}
                              color={isExisting ? 'gray.400' : isSelected ? 'white' : 'fg'}
                              borderWidth="1px"
                              borderColor={isExisting ? 'gray.200' : isSelected ? 'brand.500' : 'gray.200'}
                              onClick={() => !isExisting && handleSlotToggle(slot.startTime)}
                              disabled={isExisting}
                              borderRadius="lg"
                              fontSize="2xs"
                              fontWeight="medium"
                              minW="65px"
                              h="32px"
                              px={2}
                              transition="all 0.15s"
                              _hover={isExisting ? {} : {
                                transform: 'scale(1.02)',
                                bg: isSelected ? 'brand.600' : 'brand.50',
                                borderColor: 'brand.500'
                              }}
                              _active={isExisting ? {} : {
                                transform: 'scale(0.98)'
                              }}
                            >
                              {slot.label}
                            </Button>
                          );
                        })}
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Error Display */}
              {error && (
                <Box
                  p={4}
                  bg="nope.50"
                  borderColor="nope.200"
                  borderWidth="1px"
                  borderRadius="xl"
                >
                  <Text color="nope.700" fontSize="sm">{error}</Text>
                </Box>
              )}
            </>
          )}
        </VStack>
      </Container>

      {/* Sticky Action Buttons - Only show in Add mode */}
      {viewMode === 'add' && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          borderTopWidth="1px"
          borderColor="gray.200"
          boxShadow="0 -4px 20px rgba(0, 0, 0, 0.08)"
          py={4}
          px={4}
          zIndex={100}
        >
          <Container maxW="600px" mx="auto">
            <HStack gap={3}>
              <Button
                size="lg"
                flex={1}
                onClick={handleClearForm}
                borderRadius="xl"
                bg="white"
                borderWidth="1px"
                borderColor="gray.300"
                color="gray.600"
                fontWeight="semibold"
                h={{ base: '52px', md: '48px' }}
                fontSize="sm"
                _hover={{
                  bg: 'gray.50',
                  borderColor: 'gray.400'
                }}
                disabled={selectedSlots.size === 0 && !notes}
              >
                Clear
              </Button>
              <Button
                size="lg"
                flex={2}
                bg="brand.500"
                color="white"
                onClick={handleSubmit}
                loading={isSubmitting}
                loadingText="Saving..."
                disabled={selectedSlots.size === 0}
                borderRadius="xl"
                fontWeight="semibold"
                h={{ base: '52px', md: '48px' }}
                fontSize="sm"
                boxShadow="lg"
                _hover={{
                  bg: 'brand.600',
                  transform: 'translateY(-1px)',
                  boxShadow: 'xl'
                }}
                _active={{
                  transform: 'scale(0.98)'
                }}
                transition="all 0.15s"
              >
                {selectedSlots.size > 0
                  ? `Save ${selectedSlots.size} Time${selectedSlots.size !== 1 ? 's' : ''}`
                  : 'Select Times'
                }
              </Button>
            </HStack>
          </Container>
        </Box>
      )}
    </Box>
  );
};
