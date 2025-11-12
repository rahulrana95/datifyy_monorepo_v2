/**
 * Main Application Component
 * Focused on the beautiful Datifyy Landing Page experience
 */

import React from 'react';
import './App.css';
import { LandingPage } from './pages/LandingPage';
import { Header } from './shared/components/Header';
import { Box } from '@chakra-ui/react';

const App: React.FC = () => {
  return (
    <Box w="full" minH="100vh">
      <Header />
      <LandingPage />
    </Box>
  );
};

export default App;