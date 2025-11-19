/**
 * Admin Analytics Dashboard
 * Comprehensive analytics with Nivo charts
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { AdminLayout } from '../../../components/admin';
import { useAdminStore } from '../../../stores/adminStore';

export const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const [ageDemographics, setAgeDemographics] = useState<any[]>([]);
  const [countryStats, setCountryStats] = useState<any[]>([]);

  const {
    platformStats,
    userGrowthData,
    activeUsersData,
    signupsData,
    demographicsData,
    locationData,
    availabilityStats,
    isLoading,
    fetchPlatformStats,
    fetchUserGrowth,
    fetchActiveUsers,
    fetchSignups,
    fetchDemographics,
    fetchLocationStats,
    fetchAvailabilityStats,
  } = useAdminStore();

  // Fetch all analytics data on component mount and when timeRange changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Calculate date range based on timeRange
      const endTime = Math.floor(Date.now() / 1000);
      let startTime: number;

      switch (timeRange) {
        case 'daily':
          startTime = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000); // Last 7 days
          break;
        case 'weekly':
          startTime = Math.floor((Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) / 1000); // Last 12 weeks
          break;
        case 'monthly':
          startTime = Math.floor((Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) / 1000); // Last 12 months
          break;
        case 'yearly':
          startTime = Math.floor((Date.now() - 5 * 365 * 24 * 60 * 60 * 1000) / 1000); // Last 5 years
          break;
        default:
          startTime = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000); // Last 30 days
      }

      // Fetch all analytics in parallel
      await Promise.all([
        fetchPlatformStats(),
        fetchUserGrowth(timeRange, startTime, endTime),
        fetchActiveUsers(timeRange, startTime, endTime),
        fetchSignups(timeRange, startTime, endTime),
        fetchDemographics('gender'),
        fetchLocationStats('city'),
        fetchAvailabilityStats(),
      ]);

      // Fetch age demographics separately
      await fetchDemographics('age_group');
    };

    fetchAnalytics();

    // Fetch country stats separately
    const fetchCountryData = async () => {
      await fetchLocationStats('country');
    };
    fetchCountryData();
  }, [timeRange, fetchPlatformStats, fetchUserGrowth, fetchActiveUsers, fetchSignups, fetchDemographics, fetchLocationStats, fetchAvailabilityStats]);

  // Transform data for charts
  const userGrowthChartData = [
    {
      id: 'users',
      data: userGrowthData.map(point => ({ x: point.label, y: point.value })),
    },
  ];

  const signupsChartData = signupsData.map(point => ({
    month: point.label,
    signups: point.value,
  }));

  const activeUsersChartData = [
    {
      id: 'daily_active',
      data: activeUsersData.map(point => ({ x: point.label, y: point.value })),
    },
  ];

  const availabilityChartData = availabilityStats
    ? [
        { id: 'Available', value: availabilityStats.availableUsers, color: '#48BB78' },
        { id: 'Unavailable', value: availabilityStats.unavailableUsers, color: '#F56565' },
      ]
    : [];

  const genderChartData = demographicsData.map(item => ({
    id: item.category,
    value: item.count,
    color: item.category === 'MALE' ? '#4299E1' : item.category === 'FEMALE' ? '#ED64A6' : '#9F7AEA',
  }));

  const cityChartData = locationData.map(item => ({
    city: item.locationName,
    users: item.userCount,
  }));

  // For now, use demographics data for age if available, or empty array
  const ageData = ageDemographics.length > 0
    ? ageDemographics
    : [];

  const countryData = countryStats.length > 0
    ? countryStats
    : [];

  // Summary stats from real data
  const totalUsers = platformStats?.totalUsers || 0;
  const activeUsers = platformStats?.activeUsers || 0;
  const availableForDating = platformStats?.availableForDating || 0;
  const todaySignups = platformStats?.todaySignups || 0;

  if (isLoading && !platformStats) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <Spinner size="xl" color="pink.500" />
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
            Analytics Dashboard
          </Text>
          <Text color="gray.500" fontSize="sm">
            Overview of platform metrics and user engagement
          </Text>
        </Box>

        {/* Quick Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard label="Total Users" value={totalUsers.toLocaleString()} color="pink" />
          <StatCard label="Active Users" value={activeUsers.toLocaleString()} color="green" />
          <StatCard label="Available for Dating" value={availableForDating.toLocaleString()} color="blue" />
          <StatCard label="Today's Signups" value={todaySignups.toLocaleString()} color="purple" />
        </Grid>

        {/* Time Range Filter */}
        <HStack gap={2}>
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              bg={timeRange === range ? 'pink.500' : 'white'}
              color={timeRange === range ? 'white' : 'gray.600'}
              border="1px solid"
              borderColor={timeRange === range ? 'pink.500' : 'gray.200'}
              _hover={{
                bg: timeRange === range ? 'pink.600' : 'gray.50',
              }}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </HStack>

        {/* Charts Row 1 */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={4}>
          {/* User Growth */}
          <ChartCard title="User Growth" subtitle="Total registered users over time">
            <Box h="300px">
              <ResponsiveLine
                data={userGrowthChartData}
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 'auto' }}
                curve="catmullRom"
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                colors={['#ED64A6']}
                pointSize={8}
                pointColor="#fff"
                pointBorderWidth={2}
                pointBorderColor="#ED64A6"
                enableArea={true}
                areaOpacity={0.1}
                useMesh={true}
              />
            </Box>
          </ChartCard>

          {/* Availability */}
          <ChartCard title="Dating Availability" subtitle="Users available vs unavailable">
            <Box h="300px">
              <ResponsivePie
                data={availabilityChartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.6}
                padAngle={2}
                cornerRadius={4}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                enableArcLinkLabels={false}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="#fff"
              />
            </Box>
          </ChartCard>
        </Grid>

        {/* Charts Row 2 */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={4}>
          {/* Daily Active Users */}
          <ChartCard title="Daily Active Users" subtitle="Users active per day this week">
            <Box h="280px">
              <ResponsiveLine
                data={activeUsersChartData}
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 'auto' }}
                curve="monotoneX"
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                }}
                colors={['#48BB78']}
                pointSize={6}
                pointColor="#fff"
                pointBorderWidth={2}
                pointBorderColor="#48BB78"
                enableArea={true}
                areaOpacity={0.15}
                useMesh={true}
              />
            </Box>
          </ChartCard>

          {/* Signups */}
          <ChartCard title="Monthly Signups" subtitle="New registrations by month">
            <Box h="280px">
              <ResponsiveBar
                data={signupsChartData}
                keys={['signups']}
                indexBy="month"
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                padding={0.3}
                colors={['#9F7AEA']}
                borderRadius={4}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="#fff"
              />
            </Box>
          </ChartCard>
        </Grid>

        {/* Charts Row 3 */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr 1fr' }} gap={4}>
          {/* Gender Distribution */}
          <ChartCard title="Gender Distribution" subtitle="Users by gender">
            <Box h="250px">
              <ResponsivePie
                data={genderChartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.5}
                padAngle={2}
                cornerRadius={4}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                enableArcLinkLabels={true}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#666"
                arcLinkLabelsThickness={1}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="#fff"
              />
            </Box>
          </ChartCard>

          {/* Age Distribution */}
          <ChartCard title="Age Distribution" subtitle="Users by age group">
            <Box h="250px">
              <ResponsiveBar
                data={ageData}
                keys={['users']}
                indexBy="age"
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                padding={0.3}
                colors={['#ED64A6']}
                borderRadius={4}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="#fff"
              />
            </Box>
          </ChartCard>

          {/* Country Distribution */}
          <ChartCard title="Users by Country" subtitle="Geographic distribution">
            <Box h="250px">
              <ResponsiveBar
                data={countryData}
                keys={['users']}
                indexBy="country"
                layout="horizontal"
                margin={{ top: 20, right: 20, bottom: 20, left: 80 }}
                padding={0.3}
                colors={['#4299E1']}
                borderRadius={4}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="#fff"
              />
            </Box>
          </ChartCard>
        </Grid>

        {/* Charts Row 4 */}
        <ChartCard title="Users by City" subtitle="Top cities by user count">
          <Box h="300px">
            <ResponsiveBar
              data={cityChartData}
              keys={['users']}
              indexBy="city"
              margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
              padding={0.3}
              colors={['#F687B3']}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#fff"
            />
          </Box>
        </ChartCard>
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
  value: string;
  color: 'pink' | 'green' | 'blue' | 'purple';
}) => {
  const colorMap = {
    pink: { bg: 'pink.50', text: 'pink.600', accent: 'pink.500' },
    green: { bg: 'green.50', text: 'green.600', accent: 'green.500' },
    blue: { bg: 'blue.50', text: 'blue.600', accent: 'blue.500' },
    purple: { bg: 'purple.50', text: 'purple.600', accent: 'purple.500' },
  };

  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={5}
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        w="60px"
        h="60px"
        bg={colorMap[color].bg}
        borderRadius="full"
        transform="translate(15px, -15px)"
      />
      <VStack align="start" gap={1} position="relative">
        <Text fontSize="xs" color="gray.500" fontWeight="medium" letterSpacing="0.5px">
          {label.toUpperCase()}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color={colorMap[color].text}>
          {value}
        </Text>
      </VStack>
    </Box>
  );
};

// Chart Card Component
const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <Box
    bg="white"
    borderRadius="xl"
    p={5}
    boxShadow="sm"
    border="1px solid"
    borderColor="gray.100"
  >
    <VStack align="start" gap={1} mb={4}>
      <Text fontSize="md" fontWeight="semibold" color="gray.800">
        {title}
      </Text>
      <Text fontSize="xs" color="gray.500">
        {subtitle}
      </Text>
    </VStack>
    {children}
  </Box>
);

export default AdminAnalytics;
