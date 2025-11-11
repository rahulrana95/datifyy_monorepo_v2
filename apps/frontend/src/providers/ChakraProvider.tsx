/**
 * Chakra UI v3 Provider
 * Wraps the app with Chakra UI v3 context
 */

import React from 'react';
import { ChakraProvider as ChakraBaseProvider } from '@chakra-ui/react';
import { defaultSystem } from '@chakra-ui/react';

interface CustomChakraProviderProps {
  children: React.ReactNode;
}

export const ChakraProvider: React.FC<CustomChakraProviderProps> = ({
  children,
}) => {
  return (
    <ChakraBaseProvider value={defaultSystem}>
      {children}
    </ChakraBaseProvider>
  );
};