/**
 * Profile Page
 * User profile management page
 */

import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { Header } from '../../shared/components/Header/Header';

export const ProfilePage = () => {
  return (
    <Box minH="100vh" bg="bg">
      <Header />
      <Container maxW="1200px" py={8}>
        <Heading size="xl" color="fg" mb={4}>
          Profile
        </Heading>
        <Text color="fg.muted">
          Profile page - Coming soon...
        </Text>
      </Container>
    </Box>
  );
};
