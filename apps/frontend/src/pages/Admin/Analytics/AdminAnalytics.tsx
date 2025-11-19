/**
 * Admin Analytics Dashboard
 * Comprehensive analytics with Nivo charts
 */

import { useState } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { AdminLayout } from '../../../components/admin';

// Mock data - replace with real API data
const userGrowthData = [
  {
    id: 'users',
    data: [
      { x: 'Jan', y: 120 },
      { x: 'Feb', y: 180 },
      { x: 'Mar', y: 250 },
      { x: 'Apr', y: 320 },
      { x: 'May', y: 480 },
      { x: 'Jun', y: 620 },
    ],
  },
];

const signupsData = [
  { month: 'Jan', signups: 45 },
  { month: 'Feb', signups: 62 },
  { month: 'Mar', signups: 78 },
  { month: 'Apr', signups: 85 },
  { month: 'May', signups: 120 },
  { month: 'Jun', signups: 145 },
];

const activeUsersData = [
  {
    id: 'daily_active',
    data: [
      { x: 'Mon', y: 280 },
      { x: 'Tue', y: 320 },
      { x: 'Wed', y: 350 },
      { x: 'Thu', y: 310 },
      { x: 'Fri', y: 420 },
      { x: 'Sat', y: 480 },
      { x: 'Sun', y: 390 },
    ],
  },
];

const availabilityData = [
  { id: 'Available', value: 450, color: '#48BB78' },
  { id: 'Unavailable', value: 170, color: '#F56565' },
];

const genderData = [
  { id: 'Male', value: 320, color: '#4299E1' },
  { id: 'Female', value: 280, color: '#ED64A6' },
  { id: 'Non-binary', value: 20, color: '#9F7AEA' },
];

const cityData = [
  { city: 'Mumbai', users: 180 },
  { city: 'Delhi', users: 150 },
  { city: 'Bangalore', users: 120 },
  { city: 'Chennai', users: 85 },
  { city: 'Hyderabad', users: 70 },
  { city: 'Pune', users: 65 },
  { city: 'Kolkata', users: 50 },
];

const countryData = [
  { country: 'India', users: 520 },
  { country: 'USA', users: 85 },
  { country: 'UK', users: 45 },
  { country: 'Canada', users: 30 },
  { country: 'Australia', users: 20 },
];

const ageData = [
  { age: '18-24', users: 180 },
  { age: '25-30', users: 220 },
  { age: '31-35', users: 120 },
  { age: '36-40', users: 60 },
  { age: '40+', users: 40 },
];

export const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Summary stats
  const totalUsers = 620;
  const activeUsers = 480;
  const availableForDating = 450;
  const todaySignups = 12;

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
                data={userGrowthData}
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
                data={availabilityData}
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
                data={activeUsersData}
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
                data={signupsData}
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
                data={genderData}
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
              data={cityData}
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
