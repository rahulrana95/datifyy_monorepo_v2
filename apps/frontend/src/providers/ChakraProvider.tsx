/**
 * Chakra Provider
 * Wraps the app with Chakra UI's theme system
 */

import React from 'react';
import { ChakraProvider as BaseChakraProvider } from '@chakra-ui/react';
import { system } from '../theme';

interface ChakraProviderProps {
  children: React.ReactNode;
}

export const ChakraProvider: React.FC<ChakraProviderProps> = ({ children }) => {
  return (
    <BaseChakraProvider value={system}>
      {children}
    </BaseChakraProvider>
  );
};
