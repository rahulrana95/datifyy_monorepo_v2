/**
 * Chakra UI v3 Provider
 * Wraps the app with Chakra UI v3 context and Datifyy romantic theme
 */

import React from 'react';
import { ChakraProvider as ChakraBaseProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { datifyyTheme } from '../theme/datifyy.theme';

interface CustomChakraProviderProps {
  children: React.ReactNode;
}

// Create Chakra UI v3 system with Datifyy romantic theme
const datifyySystem = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        // Primary - Romantic Rose/Pink
        primary: {
          50: { value: datifyyTheme.colors.primary[50] },
          100: { value: datifyyTheme.colors.primary[100] },
          200: { value: datifyyTheme.colors.primary[200] },
          300: { value: datifyyTheme.colors.primary[300] },
          400: { value: datifyyTheme.colors.primary[400] },
          500: { value: datifyyTheme.colors.primary[500] },
          600: { value: datifyyTheme.colors.primary[600] },
          700: { value: datifyyTheme.colors.primary[700] },
          800: { value: datifyyTheme.colors.primary[800] },
          900: { value: datifyyTheme.colors.primary[900] },
        },
        // Secondary - Coral/Peach
        secondary: {
          50: { value: datifyyTheme.colors.secondary[50] },
          100: { value: datifyyTheme.colors.secondary[100] },
          200: { value: datifyyTheme.colors.secondary[200] },
          300: { value: datifyyTheme.colors.secondary[300] },
          400: { value: datifyyTheme.colors.secondary[400] },
          500: { value: datifyyTheme.colors.secondary[500] },
          600: { value: datifyyTheme.colors.secondary[600] },
          700: { value: datifyyTheme.colors.secondary[700] },
          800: { value: datifyyTheme.colors.secondary[800] },
          900: { value: datifyyTheme.colors.secondary[900] },
        },
        // Accent - Magenta/Fuchsia
        accent: {
          50: { value: datifyyTheme.colors.accent[50] },
          100: { value: datifyyTheme.colors.accent[100] },
          200: { value: datifyyTheme.colors.accent[200] },
          300: { value: datifyyTheme.colors.accent[300] },
          400: { value: datifyyTheme.colors.accent[400] },
          500: { value: datifyyTheme.colors.accent[500] },
          600: { value: datifyyTheme.colors.accent[600] },
          700: { value: datifyyTheme.colors.accent[700] },
          800: { value: datifyyTheme.colors.accent[800] },
          900: { value: datifyyTheme.colors.accent[900] },
        },
      },
      fonts: {
        heading: { value: datifyyTheme.fonts.heading },
        body: { value: datifyyTheme.fonts.body },
        mono: { value: datifyyTheme.fonts.mono },
      },
      shadows: {
        xs: { value: datifyyTheme.shadows.xs },
        sm: { value: datifyyTheme.shadows.sm },
        md: { value: datifyyTheme.shadows.md },
        lg: { value: datifyyTheme.shadows.lg },
        xl: { value: datifyyTheme.shadows.xl },
        '2xl': { value: datifyyTheme.shadows['2xl'] },
        '3xl': { value: datifyyTheme.shadows['3xl'] },
        card: { value: datifyyTheme.shadows.card },
        cardHover: { value: datifyyTheme.shadows.cardHover },
        button: { value: datifyyTheme.shadows.button },
        buttonHover: { value: datifyyTheme.shadows.buttonHover },
        glass: { value: datifyyTheme.shadows.glass },
      },
      radii: {
        sm: { value: datifyyTheme.radii.sm },
        md: { value: datifyyTheme.radii.md },
        lg: { value: datifyyTheme.radii.lg },
        xl: { value: datifyyTheme.radii.xl },
        '2xl': { value: datifyyTheme.radii['2xl'] },
        '3xl': { value: datifyyTheme.radii['3xl'] },
        full: { value: datifyyTheme.radii.full },
      },
    },
  },
});

export const ChakraProvider: React.FC<CustomChakraProviderProps> = ({
  children,
}) => {
  return (
    <ChakraBaseProvider value={datifyySystem}>
      {children}
    </ChakraBaseProvider>
  );
};