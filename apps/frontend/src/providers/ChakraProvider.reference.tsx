/**
 * Chakra UI v3 Provider - Datifyy Reference Theme
 * Based on: https://github.com/rahulrana95/datifyy-monorepo
 * Complete theme matching the reference repository design system
 */

import React from 'react';
import {
  ChakraProvider as ChakraBaseProvider,
  createSystem,
  defaultConfig,
  defineRecipe,
} from '@chakra-ui/react';
import { colors } from '../theme/colors.reference';

interface CustomChakraProviderProps {
  children: React.ReactNode;
}

// ==================== BUTTON RECIPE ====================
const buttonRecipe = defineRecipe({
  base: {
    fontWeight: 'medium',
    borderRadius: 'lg',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    cursor: 'pointer',
    _disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      // Standard solid button
      solid: {
        bg: colors.brand[500],
        color: 'white',
        _hover: {
          bg: colors.brand[600],
          transform: 'translateY(-1px)',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },

      // Outline button
      outline: {
        bg: 'transparent',
        borderWidth: '2px',
        borderColor: colors.brand[500],
        color: colors.brand[600],
        _hover: {
          bg: colors.brand[50],
          transform: 'translateY(-1px)',
        },
      },

      // Ghost button
      ghost: {
        bg: 'transparent',
        color: colors.text.secondary,
        _hover: {
          bg: colors.brand[50],
          color: colors.brand[600],
        },
      },

      // Love button with gradient
      love: {
        background: colors.gradient.brand,
        color: 'white',
        boxShadow: '0 4px 12px rgba(232, 93, 117, 0.3)',
        _hover: {
          boxShadow: '0 6px 16px rgba(232, 93, 117, 0.4)',
          transform: 'translateY(-2px)',
        },
      },

      // Swipe Like (circular)
      swipeLike: {
        bg: colors.like[500],
        color: 'white',
        borderRadius: 'full',
        w: '56px',
        h: '56px',
        minW: '56px',
        p: '0',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
        _hover: {
          transform: 'scale(1.1)',
          boxShadow: '0 6px 16px rgba(34, 197, 94, 0.4)',
        },
      },

      // Swipe Nope (circular)
      swipeNope: {
        bg: colors.nope[500],
        color: 'white',
        borderRadius: 'full',
        w: '56px',
        h: '56px',
        minW: '56px',
        p: '0',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        _hover: {
          transform: 'scale(1.1)',
          boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
        },
      },

      // Swipe Super Like (circular)
      swipeSuperLike: {
        bg: colors.superLike[500],
        color: 'white',
        borderRadius: 'full',
        w: '56px',
        h: '56px',
        minW: '56px',
        p: '0',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        _hover: {
          transform: 'scale(1.1)',
          boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
        },
      },

      // Boost button
      boost: {
        bg: colors.boost[500],
        color: 'white',
        borderRadius: 'full',
        w: '56px',
        h: '56px',
        minW: '56px',
        p: '0',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
        _hover: {
          transform: 'scale(1.1)',
          boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)',
        },
      },

      // FAB (Floating Action Button)
      fab: {
        borderRadius: 'full',
        w: '64px',
        h: '64px',
        minW: '64px',
        p: '0',
        bg: colors.brand[500],
        color: 'white',
        boxShadow: '0 8px 16px rgba(232, 93, 117, 0.3)',
        _hover: {
          transform: 'scale(1.1)',
          boxShadow: '0 12px 24px rgba(232, 93, 117, 0.4)',
        },
      },

      // Subtle button
      subtle: {
        bg: colors.brand[50],
        color: colors.brand[700],
        _hover: {
          bg: colors.brand[100],
        },
      },

      // Premium button with gradient
      premium: {
        background: colors.gradient.premium,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        _before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          w: '100%',
          h: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transition: 'left 0.5s',
        },
        _hover: {
          _before: {
            left: '100%',
          },
        },
      },
    },

    size: {
      xs: {
        h: '28px',
        minW: '28px',
        fontSize: 'xs',
        px: '3',
      },
      sm: {
        h: '36px',
        minW: '36px',
        fontSize: 'sm',
        px: '4',
      },
      md: {
        h: '48px',
        minW: '48px',
        fontSize: 'md',
        px: '6',
      },
      lg: {
        h: '52px',
        minW: '52px',
        fontSize: 'lg',
        px: '8',
      },
      xl: {
        h: '56px',
        minW: '56px',
        fontSize: 'xl',
        px: '10',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});

// ==================== CARD RECIPE ====================
const cardRecipe = defineRecipe({
  base: {
    bg: 'white',
    borderRadius: 'xl',
    overflow: 'hidden',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  variants: {
    variant: {
      // Standard elevated card
      elevated: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        _hover: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        },
      },

      // Profile card for swiping
      profile: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        touchAction: 'pan-y pinch-zoom',
        _hover: {
          transform: 'scale(1.02)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
        },
      },

      // Match card
      match: {
        bg: 'linear-gradient(135deg, #fef7f7 0%, #ffffff 100%)',
        borderWidth: '2px',
        borderColor: colors.brand[200],
        boxShadow: '0 4px 12px rgba(232, 93, 117, 0.15)',
      },

      // Message card
      message: {
        bg: colors.background.secondary,
        border: 'none',
        boxShadow: 'none',
      },

      // Floating card
      floating: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      },

      // Subtle card
      subtle: {
        bg: colors.background.tertiary,
        boxShadow: 'none',
      },

      // Premium card
      premium: {
        background: colors.gradient.premium,
        color: 'white',
        boxShadow: '0 4px 16px rgba(168, 85, 247, 0.25)',
      },

      // Liked card (green tint)
      liked: {
        bg: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        borderWidth: '2px',
        borderColor: colors.like[200],
        opacity: 0.7,
      },

      // Passed card (red tint)
      passed: {
        bg: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
        borderWidth: '2px',
        borderColor: colors.nope[200],
        opacity: 0.7,
      },

      // Interactive card
      interactive: {
        cursor: 'pointer',
        _hover: {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
        },
        _focus: {
          outline: '2px solid',
          outlineColor: colors.brand[500],
          outlineOffset: '2px',
        },
      },

      // Glass card
      glass: {
        bg: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
    },

    size: {
      sm: {
        borderRadius: 'lg',
      },
      md: {
        borderRadius: 'xl',
      },
      lg: {
        borderRadius: '2xl',
      },
    },
  },
  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});

// ==================== INPUT RECIPE ====================
const inputRecipe = defineRecipe({
  base: {
    w: 'full',
    minW: 0,
    outline: 0,
    position: 'relative',
    appearance: 'none',
    transition: 'all 0.2s',
    _placeholder: {
      color: colors.text.quaternary,
    },
    _focus: {
      boxShadow: `0 0 0 1px ${colors.brand[500]}`,
      borderColor: colors.brand[500],
    },
    _invalid: {
      borderColor: colors.error[500],
      boxShadow: `0 0 0 1px ${colors.error[500]}`,
    },
    _disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      // Outline variant (default)
      outline: {
        borderWidth: '2px',
        borderColor: colors.gray[300],
        borderRadius: 'lg',
        bg: 'white',
        _hover: {
          borderColor: colors.gray[400],
        },
      },

      // Filled variant
      filled: {
        borderWidth: '2px',
        borderColor: 'transparent',
        bg: colors.gray[100],
        borderRadius: 'lg',
        _hover: {
          bg: colors.gray[200],
        },
        _focus: {
          bg: 'white',
          borderColor: colors.brand[500],
        },
      },

      // Flushed variant (bottom border only)
      flushed: {
        borderBottom: '2px solid',
        borderColor: colors.gray[300],
        borderRadius: '0',
        px: '0',
        _focus: {
          borderColor: colors.brand[500],
          boxShadow: `0 1px 0 0 ${colors.brand[500]}`,
        },
      },

      // Chat variant (pill shape)
      chat: {
        borderWidth: '2px',
        borderColor: colors.gray[200],
        borderRadius: 'full',
        bg: colors.gray[50],
        px: '6',
      },

      // Search variant
      search: {
        borderWidth: '2px',
        borderColor: colors.gray[300],
        borderRadius: 'full',
        bg: 'white',
        pl: '12',
      },

      // Premium variant with gradient border
      premium: {
        borderWidth: '2px',
        borderColor: 'transparent',
        bg: 'white',
        borderRadius: 'lg',
        position: 'relative',
        _before: {
          content: '""',
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          background: colors.gradient.premium,
          borderRadius: 'lg',
          zIndex: -1,
        },
      },
    },

    size: {
      xs: {
        h: '8',
        fontSize: 'xs',
        px: '3',
      },
      sm: {
        h: '9',
        fontSize: 'sm',
        px: '4',
      },
      md: {
        h: '12',
        fontSize: 'md',
        px: '4',
      },
      lg: {
        h: '14',
        fontSize: 'lg',
        px: '6',
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});

// ==================== CREATE DATIFYY SYSTEM ====================
const datifyyReferenceSystem = createSystem(defaultConfig, {
  globalCss: {
    'html, body': {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: colors.text.primary,
      scrollBehavior: 'smooth',
    },
    '::selection': {
      bg: colors.brand[100],
      color: colors.brand[900],
    },
    '::-webkit-scrollbar': {
      width: '12px',
    },
    '::-webkit-scrollbar-track': {
      bg: colors.background.secondary,
      borderRadius: 'full',
    },
    '::-webkit-scrollbar-thumb': {
      bg: colors.brand[300],
      borderRadius: 'full',
      _hover: {
        bg: colors.brand[400],
      },
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: colors.brand[50] },
          100: { value: colors.brand[100] },
          200: { value: colors.brand[200] },
          300: { value: colors.brand[300] },
          400: { value: colors.brand[400] },
          500: { value: colors.brand[500] },
          600: { value: colors.brand[600] },
          700: { value: colors.brand[700] },
          800: { value: colors.brand[800] },
          900: { value: colors.brand[900] },
        },
        like: {
          50: { value: colors.like[50] },
          500: { value: colors.like[500] },
          900: { value: colors.like[900] },
        },
        nope: {
          50: { value: colors.nope[50] },
          500: { value: colors.nope[500] },
          900: { value: colors.nope[900] },
        },
        superLike: {
          50: { value: colors.superLike[50] },
          500: { value: colors.superLike[500] },
          900: { value: colors.superLike[900] },
        },
        premium: {
          50: { value: colors.premium[50] },
          500: { value: colors.premium[500] },
          900: { value: colors.premium[900] },
        },
        gray: {
          50: { value: colors.gray[50] },
          100: { value: colors.gray[100] },
          200: { value: colors.gray[200] },
          300: { value: colors.gray[300] },
          400: { value: colors.gray[400] },
          500: { value: colors.gray[500] },
          600: { value: colors.gray[600] },
          700: { value: colors.gray[700] },
          800: { value: colors.gray[800] },
          900: { value: colors.gray[900] },
        },
      },
      fonts: {
        body: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        heading: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        mono: { value: "'SF Mono', 'Monaco', 'Courier New', monospace" },
      },
      fontSizes: {
        xs: { value: '0.75rem' },    // 12px
        sm: { value: '0.875rem' },   // 14px
        md: { value: '1rem' },       // 16px
        lg: { value: '1.125rem' },   // 18px
        xl: { value: '1.25rem' },    // 20px
        '2xl': { value: '1.5rem' },  // 24px
        '3xl': { value: '1.875rem' }, // 30px
        '4xl': { value: '2.25rem' },  // 36px
        '5xl': { value: '3rem' },     // 48px
        '6xl': { value: '3.75rem' },  // 60px
        '7xl': { value: '4.5rem' },   // 72px
        '8xl': { value: '6rem' },     // 96px
        '9xl': { value: '8rem' },     // 128px
      },
      fontWeights: {
        thin: { value: 100 },
        extralight: { value: 200 },
        light: { value: 300 },
        normal: { value: 400 },
        medium: { value: 500 },
        semibold: { value: 600 },
        bold: { value: 700 },
        extrabold: { value: 800 },
        black: { value: 900 },
      },
      radii: {
        sm: { value: '0.25rem' },
        md: { value: '0.375rem' },
        lg: { value: '0.5rem' },
        xl: { value: '0.75rem' },
        '2xl': { value: '1rem' },
        '3xl': { value: '1.5rem' },
        full: { value: '9999px' },
      },
    },
    semanticTokens: {
      colors: {
        colorPalette: {
          DEFAULT: { value: colors.brand[500] },
          50: { value: colors.brand[50] },
          100: { value: colors.brand[100] },
          200: { value: colors.brand[200] },
          300: { value: colors.brand[300] },
          400: { value: colors.brand[400] },
          500: { value: colors.brand[500] },
          600: { value: colors.brand[600] },
          700: { value: colors.brand[700] },
          800: { value: colors.brand[800] },
          900: { value: colors.brand[900] },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
      card: cardRecipe,
      input: inputRecipe,
    },
  },
});

export const ChakraProvider: React.FC<CustomChakraProviderProps> = ({ children }) => {
  return <ChakraBaseProvider value={datifyyReferenceSystem}>{children}</ChakraBaseProvider>;
};
