/**
 * Main Application Component
 * Datifyy Dating Platform - Reference Design
 */

import React from 'react';
import './App.css';
import { LandingPageReference } from './pages/LandingPage.reference';
import { Header } from './shared/components/Header';
import { Box } from '@chakra-ui/react';

const App: React.FC = () => {
  return (
    <Box w="full" minH="100vh">
      <Header />
      <LandingPageReference />
    </Box>
  );
};

export default App;