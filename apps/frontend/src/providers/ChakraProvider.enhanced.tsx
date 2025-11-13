/**
 * Enhanced Chakra UI v3 Provider - Romantic Theme
 * Complete override of ALL Chakra components with romantic styling
 * World-class UI design by experienced designer
 */

import React from 'react';
import {
  ChakraProvider as ChakraBaseProvider,
  createSystem,
  defaultConfig,
  defineRecipe,
} from '@chakra-ui/react';
import { datifyyTheme } from '../theme/datifyy.theme';

interface CustomChakraProviderProps {
  children: React.ReactNode;
}

// ==================== BUTTON RECIPE ====================
const buttonRecipe = defineRecipe({
  base: {
    fontWeight: '600',
    borderRadius: 'full',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: datifyyTheme.fonts.body,
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    _hover: {
      transform: 'translateY(-2px) scale(1.02)',
    },
    _active: {
      transform: 'translateY(0) scale(0.98)',
    },
    _disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  variants: {
    variant: {
      solid: {
        bg: datifyyTheme.colors.primary.gradient,
        color: 'white',
        boxShadow: datifyyTheme.shadows.button,
        _hover: {
          boxShadow: datifyyTheme.shadows.buttonHover,
          transform: 'translateY(-3px) scale(1.03)',
        },
        _active: {
          transform: 'translateY(0) scale(0.98)',
        },
      },
      outline: {
        borderColor: datifyyTheme.colors.primary[500],
        color: datifyyTheme.colors.primary[600],
        borderWidth: '2px',
        bg: 'transparent',
        _hover: {
          bg: datifyyTheme.colors.primary[50],
          borderColor: datifyyTheme.colors.primary[600],
        },
      },
      ghost: {
        color: datifyyTheme.colors.text.secondary,
        bg: 'transparent',
        _hover: {
          bg: 'rgba(244, 63, 94, 0.08)',
          color: datifyyTheme.colors.primary[600],
        },
      },
      subtle: {
        bg: datifyyTheme.colors.primary[50],
        color: datifyyTheme.colors.primary[700],
        _hover: {
          bg: datifyyTheme.colors.primary[100],
        },
      },
      link: {
        color: datifyyTheme.colors.primary[600],
        textDecoration: 'none',
        _hover: {
          textDecoration: 'underline',
          textDecorationColor: datifyyTheme.colors.primary[400],
        },
      },
    },
    size: {
      xs: {
        px: '3',
        py: '1.5',
        fontSize: 'xs',
        minH: '6',
      },
      sm: {
        px: '4',
        py: '2',
        fontSize: 'sm',
        minH: '8',
      },
      md: {
        px: '6',
        py: '3',
        fontSize: 'md',
        minH: '10',
      },
      lg: {
        px: '8',
        py: '4',
        fontSize: 'lg',
        minH: '12',
      },
      xl: {
        px: '10',
        py: '5',
        fontSize: 'xl',
        minH: '14',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});

// ==================== INPUT RECIPE ====================
const inputRecipe = defineRecipe({
  base: {
    borderRadius: 'xl',
    borderWidth: '2px',
    borderColor: datifyyTheme.colors.primary[200],
    fontFamily: datifyyTheme.fonts.body,
    color: datifyyTheme.colors.text.primary,
    bg: 'white',
    transition: 'all 0.3s ease',
    fontSize: 'md',
    fontWeight: '500',
    _placeholder: {
      color: datifyyTheme.colors.text.muted,
      fontWeight: '400',
    },
    _focus: {
      borderColor: datifyyTheme.colors.primary[500],
      boxShadow: `0 0 0 3px ${datifyyTheme.colors.primary[200]}`,
      outline: 'none',
    },
    _hover: {
      borderColor: datifyyTheme.colors.primary[300],
    },
    _invalid: {
      borderColor: 'red.500',
      _focus: {
        borderColor: 'red.500',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
      },
    },
  },
  variants: {
    size: {
      sm: {
        px: '3',
        py: '2',
        fontSize: 'sm',
        minH: '8',
      },
      md: {
        px: '4',
        py: '3',
        fontSize: 'md',
        minH: '10',
      },
      lg: {
        px: '6',
        py: '4',
        fontSize: 'lg',
        minH: '12',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// ==================== BADGE RECIPE ====================
const badgeRecipe = defineRecipe({
  base: {
    fontWeight: '700',
    borderRadius: 'full',
    letterSpacing: 'wide',
    fontFamily: datifyyTheme.fonts.body,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'uppercase',
  },
  variants: {
    variant: {
      solid: {
        bg: datifyyTheme.colors.primary.gradient,
        color: 'white',
        boxShadow: datifyyTheme.shadows.button,
      },
      subtle: {
        bg: datifyyTheme.colors.primary[100],
        color: datifyyTheme.colors.primary[700],
      },
      outline: {
        borderWidth: '2px',
        borderColor: datifyyTheme.colors.primary[500],
        color: datifyyTheme.colors.primary[600],
        bg: 'transparent',
      },
    },
    size: {
      sm: {
        px: '2',
        py: '0.5',
        fontSize: 'xs',
      },
      md: {
        px: '3',
        py: '1',
        fontSize: 'sm',
      },
      lg: {
        px: '4',
        py: '1.5',
        fontSize: 'md',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});

// ==================== HEADING RECIPE ====================
const headingRecipe = defineRecipe({
  base: {
    fontFamily: datifyyTheme.fonts.heading,
    fontWeight: datifyyTheme.fontWeights.extrabold,
    color: datifyyTheme.colors.text.primary,
    letterSpacing: datifyyTheme.letterSpacing.tighter,
    lineHeight: datifyyTheme.lineHeights.tight,
  },
  variants: {
    size: {
      xs: { fontSize: datifyyTheme.fontSizes.lg },
      sm: { fontSize: datifyyTheme.fontSizes.xl },
      md: { fontSize: datifyyTheme.fontSizes['2xl'] },
      lg: { fontSize: datifyyTheme.fontSizes['3xl'] },
      xl: { fontSize: datifyyTheme.fontSizes['4xl'] },
      '2xl': { fontSize: datifyyTheme.fontSizes['5xl'] },
      '3xl': { fontSize: datifyyTheme.fontSizes['6xl'] },
      '4xl': { fontSize: datifyyTheme.fontSizes['6xl'] },
      '5xl': { fontSize: datifyyTheme.fontSizes['7xl'] },
      '6xl': { fontSize: datifyyTheme.fontSizes['7xl'] },
      '7xl': { fontSize: datifyyTheme.fontSizes['7xl'] },
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

// ==================== TEXT RECIPE ====================
const textRecipe = defineRecipe({
  base: {
    fontFamily: datifyyTheme.fonts.body,
    color: datifyyTheme.colors.text.secondary,
    lineHeight: datifyyTheme.lineHeights.relaxed,
  },
  variants: {
    variant: {
      body: {
        color: datifyyTheme.colors.text.secondary,
      },
      subtle: {
        color: datifyyTheme.colors.text.tertiary,
      },
      muted: {
        color: datifyyTheme.colors.text.muted,
      },
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

// ==================== CARD RECIPE ====================
const cardRecipe = defineRecipe({
  base: {
    bg: 'white',
    borderRadius: datifyyTheme.radii['3xl'],
    boxShadow: datifyyTheme.shadows.card,
    border: `1px solid ${datifyyTheme.colors.primary[100]}`,
    overflow: 'hidden',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  variants: {
    variant: {
      elevated: {
        boxShadow: datifyyTheme.shadows.cardHover,
        _hover: {
          transform: 'translateY(-8px)',
          boxShadow: datifyyTheme.shadows.premium,
          borderColor: datifyyTheme.colors.primary[200],
        },
      },
      outline: {
        borderWidth: '2px',
        borderColor: datifyyTheme.colors.primary[200],
        boxShadow: 'none',
        _hover: {
          borderColor: datifyyTheme.colors.primary[400],
          boxShadow: datifyyTheme.shadows.card,
        },
      },
      subtle: {
        bg: datifyyTheme.colors.primary[50],
        border: 'none',
        boxShadow: 'none',
      },
      filled: {
        bg: datifyyTheme.colors.background.secondary,
        border: 'none',
      },
    },
  },
  defaultVariants: {
    variant: 'elevated',
  },
});

// ==================== LINK RECIPE ====================
const linkRecipe = defineRecipe({
  base: {
    color: datifyyTheme.colors.primary[600],
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    _hover: {
      color: datifyyTheme.colors.primary[700],
      textDecoration: 'underline',
      textDecorationColor: datifyyTheme.colors.primary[400],
      textDecorationThickness: '2px',
    },
  },
});

// ==================== MODAL RECIPE ====================
const modalRecipe = defineRecipe({
  base: {
    bg: 'white',
    borderRadius: datifyyTheme.radii['3xl'],
    boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.35)',
    overflow: 'hidden',
  },
});

// ==================== TOOLTIP RECIPE ====================
const tooltipRecipe = defineRecipe({
  base: {
    bg: datifyyTheme.colors.gray[900],
    color: 'white',
    borderRadius: 'lg',
    px: '3',
    py: '2',
    fontSize: 'sm',
    fontWeight: '600',
    boxShadow: datifyyTheme.shadows.lg,
    maxW: '320px',
  },
});

// ==================== MENU RECIPE ====================
const menuRecipe = defineRecipe({
  base: {
    bg: 'white',
    borderRadius: datifyyTheme.radii['2xl'],
    boxShadow: datifyyTheme.shadows.premium,
    border: `1px solid ${datifyyTheme.colors.primary[100]}`,
    overflow: 'hidden',
    py: '2',
  },
});

// ==================== TABS RECIPE ====================
const tabsRecipe = defineRecipe({
  base: {
    borderColor: datifyyTheme.colors.primary[200],
  },
  variants: {
    variant: {
      line: {
        borderBottomWidth: '2px',
        borderColor: datifyyTheme.colors.primary[200],
      },
      enclosed: {
        border: 'none',
      },
      'soft-rounded': {
        bg: datifyyTheme.colors.primary[50],
        borderRadius: 'xl',
        p: '1',
      },
    },
  },
});

// ==================== CHECKBOX RECIPE ====================
const checkboxRecipe = defineRecipe({
  base: {
    borderRadius: 'md',
    borderWidth: '2px',
    borderColor: datifyyTheme.colors.primary[300],
    _checked: {
      bg: datifyyTheme.colors.primary.gradient,
      borderColor: datifyyTheme.colors.primary[500],
      color: 'white',
    },
    _focus: {
      boxShadow: `0 0 0 3px ${datifyyTheme.colors.primary[200]}`,
    },
  },
});

// ==================== RADIO RECIPE ====================
const radioRecipe = defineRecipe({
  base: {
    borderWidth: '2px',
    borderColor: datifyyTheme.colors.primary[300],
    _checked: {
      bg: datifyyTheme.colors.primary[500],
      borderColor: datifyyTheme.colors.primary[500],
      _before: {
        bg: 'white',
      },
    },
    _focus: {
      boxShadow: `0 0 0 3px ${datifyyTheme.colors.primary[200]}`,
    },
  },
});

// ==================== SWITCH RECIPE ====================
const switchRecipe = defineRecipe({
  base: {
    _checked: {
      bg: datifyyTheme.colors.primary.gradient,
    },
  },
});

// ==================== SLIDER RECIPE ====================
const sliderRecipe = defineRecipe({
  base: {
    bg: datifyyTheme.colors.primary[200],
    borderRadius: 'full',
  },
});

// ==================== PROGRESS RECIPE ====================
const progressRecipe = defineRecipe({
  base: {
    borderRadius: 'full',
    bg: datifyyTheme.colors.primary[100],
  },
});

// ==================== SPINNER RECIPE ====================
const spinnerRecipe = defineRecipe({
  base: {
    color: datifyyTheme.colors.primary[500],
  },
});

// ==================== ALERT RECIPE ====================
const alertRecipe = defineRecipe({
  base: {
    borderRadius: datifyyTheme.radii['2xl'],
    p: '4',
  },
  variants: {
    status: {
      success: {
        bg: 'green.50',
        color: 'green.800',
        borderColor: 'green.200',
      },
      error: {
        bg: 'red.50',
        color: 'red.800',
        borderColor: 'red.200',
      },
      warning: {
        bg: datifyyTheme.colors.secondary[50],
        color: datifyyTheme.colors.secondary[800],
        borderColor: datifyyTheme.colors.secondary[200],
      },
      info: {
        bg: datifyyTheme.colors.accent[50],
        color: datifyyTheme.colors.accent[800],
        borderColor: datifyyTheme.colors.accent[200],
      },
    },
  },
});

// ==================== DIVIDER RECIPE ====================
const dividerRecipe = defineRecipe({
  base: {
    borderColor: datifyyTheme.colors.primary[200],
    opacity: 0.5,
  },
});

// ==================== CREATE ROMANTIC SYSTEM ====================
const romanticSystem = createSystem(defaultConfig, {
  globalCss: {
    'html, body': {
      fontFamily: datifyyTheme.fonts.body,
      color: datifyyTheme.colors.text.primary,
      bg: datifyyTheme.colors.background.primary,
      scrollBehavior: 'smooth',
    },
    '::selection': {
      bg: datifyyTheme.colors.primary[200],
      color: datifyyTheme.colors.primary[900],
    },
    '::-webkit-scrollbar': {
      width: '12px',
    },
    '::-webkit-scrollbar-track': {
      bg: datifyyTheme.colors.primary[50],
    },
    '::-webkit-scrollbar-thumb': {
      bg: datifyyTheme.colors.primary[300],
      borderRadius: 'full',
      _hover: {
        bg: datifyyTheme.colors.primary[400],
      },
    },
    '*': {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    },
  },
  theme: {
    semanticTokens: {
      colors: {
        'bg.canvas': {
          value: datifyyTheme.colors.background.primary,
        },
        'bg.surface': {
          value: 'white',
        },
        'bg.subtle': {
          value: datifyyTheme.colors.primary[50],
        },
        'bg.muted': {
          value: datifyyTheme.colors.gray[100],
        },
        'fg.default': {
          value: datifyyTheme.colors.text.primary,
        },
        'fg.muted': {
          value: datifyyTheme.colors.text.tertiary,
        },
        'fg.subtle': {
          value: datifyyTheme.colors.text.muted,
        },
        'border.default': {
          value: datifyyTheme.colors.primary[200],
        },
        'border.muted': {
          value: datifyyTheme.colors.primary[100],
        },
        'border.subtle': {
          value: datifyyTheme.colors.primary[50],
        },
      },
    },
    tokens: {
      colors: {
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
        trust: {
          50: { value: datifyyTheme.colors.trust[50] },
          100: { value: datifyyTheme.colors.trust[100] },
          200: { value: datifyyTheme.colors.trust[200] },
          300: { value: datifyyTheme.colors.trust[300] },
          400: { value: datifyyTheme.colors.trust[400] },
          500: { value: datifyyTheme.colors.trust[500] },
          600: { value: datifyyTheme.colors.trust[600] },
          700: { value: datifyyTheme.colors.trust[700] },
          800: { value: datifyyTheme.colors.trust[800] },
          900: { value: datifyyTheme.colors.trust[900] },
        },
        gray: {
          50: { value: datifyyTheme.colors.gray[50] },
          100: { value: datifyyTheme.colors.gray[100] },
          200: { value: datifyyTheme.colors.gray[200] },
          300: { value: datifyyTheme.colors.gray[300] },
          400: { value: datifyyTheme.colors.gray[400] },
          500: { value: datifyyTheme.colors.gray[500] },
          600: { value: datifyyTheme.colors.gray[600] },
          700: { value: datifyyTheme.colors.gray[700] },
          800: { value: datifyyTheme.colors.gray[800] },
          900: { value: datifyyTheme.colors.gray[900] },
        },
      },
      fonts: {
        heading: { value: datifyyTheme.fonts.heading },
        body: { value: datifyyTheme.fonts.body },
        mono: { value: datifyyTheme.fonts.mono },
      },
      fontSizes: {
        xs: { value: datifyyTheme.fontSizes.xs },
        sm: { value: datifyyTheme.fontSizes.sm },
        md: { value: datifyyTheme.fontSizes.md },
        lg: { value: datifyyTheme.fontSizes.lg },
        xl: { value: datifyyTheme.fontSizes.xl },
        '2xl': { value: datifyyTheme.fontSizes['2xl'] },
        '3xl': { value: datifyyTheme.fontSizes['3xl'] },
        '4xl': { value: datifyyTheme.fontSizes['4xl'] },
        '5xl': { value: datifyyTheme.fontSizes['5xl'] },
        '6xl': { value: datifyyTheme.fontSizes['6xl'] },
        '7xl': { value: datifyyTheme.fontSizes['7xl'] },
      },
      fontWeights: {
        light: { value: datifyyTheme.fontWeights.light },
        normal: { value: datifyyTheme.fontWeights.normal },
        medium: { value: datifyyTheme.fontWeights.medium },
        semibold: { value: datifyyTheme.fontWeights.semibold },
        bold: { value: datifyyTheme.fontWeights.bold },
        extrabold: { value: datifyyTheme.fontWeights.extrabold },
        black: { value: datifyyTheme.fontWeights.black },
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
        premium: { value: datifyyTheme.shadows.premium },
        glass: { value: datifyyTheme.shadows.glass },
        glow: { value: datifyyTheme.shadows.glow },
        glowStrong: { value: datifyyTheme.shadows.glowStrong },
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
      spacing: {
        0: { value: datifyyTheme.space[0] },
        1: { value: datifyyTheme.space[1] },
        2: { value: datifyyTheme.space[2] },
        3: { value: datifyyTheme.space[3] },
        4: { value: datifyyTheme.space[4] },
        5: { value: datifyyTheme.space[5] },
        6: { value: datifyyTheme.space[6] },
        8: { value: datifyyTheme.space[8] },
        10: { value: datifyyTheme.space[10] },
        12: { value: datifyyTheme.space[12] },
        16: { value: datifyyTheme.space[16] },
        20: { value: datifyyTheme.space[20] },
        24: { value: datifyyTheme.space[24] },
        32: { value: datifyyTheme.space[32] },
        40: { value: datifyyTheme.space[40] },
        48: { value: datifyyTheme.space[48] },
        56: { value: datifyyTheme.space[56] },
        64: { value: datifyyTheme.space[64] },
      },
    },
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
      badge: badgeRecipe,
      heading: headingRecipe,
      text: textRecipe,
      card: cardRecipe,
      link: linkRecipe,
      modal: modalRecipe,
      tooltip: tooltipRecipe,
      menu: menuRecipe,
      tabs: tabsRecipe,
      checkbox: checkboxRecipe,
      radio: radioRecipe,
      switch: switchRecipe,
      slider: sliderRecipe,
      progress: progressRecipe,
      spinner: spinnerRecipe,
      alert: alertRecipe,
      divider: dividerRecipe,
    },
  },
});

export const ChakraProvider: React.FC<CustomChakraProviderProps> = ({ children }) => {
  return <ChakraBaseProvider value={romanticSystem}>{children}</ChakraBaseProvider>;
};
