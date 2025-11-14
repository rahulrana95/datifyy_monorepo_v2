/**
 * Datifyy Theme System
 * Premium Chakra UI v3 theme with romantic, cohesive design
 * All components automatically follow the theme
 */

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { colors } from './colors.reference';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Brand colors - Romantic Rose & Blush
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
        // Like colors - Fresh Meadow Green
        like: {
          50: { value: colors.like[50] },
          100: { value: colors.like[100] },
          200: { value: colors.like[200] },
          300: { value: colors.like[300] },
          400: { value: colors.like[400] },
          500: { value: colors.like[500] },
          600: { value: colors.like[600] },
          700: { value: colors.like[700] },
          800: { value: colors.like[800] },
          900: { value: colors.like[900] },
        },
        // Nope colors - Elegant Coral Red
        nope: {
          50: { value: colors.nope[50] },
          100: { value: colors.nope[100] },
          200: { value: colors.nope[200] },
          300: { value: colors.nope[300] },
          400: { value: colors.nope[400] },
          500: { value: colors.nope[500] },
          600: { value: colors.nope[600] },
          700: { value: colors.nope[700] },
          800: { value: colors.nope[800] },
          900: { value: colors.nope[900] },
        },
        // Super Like colors - Celestial Blue
        superLike: {
          50: { value: colors.superLike[50] },
          100: { value: colors.superLike[100] },
          200: { value: colors.superLike[200] },
          300: { value: colors.superLike[300] },
          400: { value: colors.superLike[400] },
          500: { value: colors.superLike[500] },
          600: { value: colors.superLike[600] },
          700: { value: colors.superLike[700] },
          800: { value: colors.superLike[800] },
          900: { value: colors.superLike[900] },
        },
        // Boost colors - Golden Sunset
        boost: {
          50: { value: colors.boost[50] },
          100: { value: colors.boost[100] },
          200: { value: colors.boost[200] },
          300: { value: colors.boost[300] },
          400: { value: colors.boost[400] },
          500: { value: colors.boost[500] },
          600: { value: colors.boost[600] },
          700: { value: colors.boost[700] },
          800: { value: colors.boost[800] },
          900: { value: colors.boost[900] },
        },
        // Premium colors - Royal Purple
        premium: {
          50: { value: colors.premium[50] },
          100: { value: colors.premium[100] },
          200: { value: colors.premium[200] },
          300: { value: colors.premium[300] },
          400: { value: colors.premium[400] },
          500: { value: colors.premium[500] },
          600: { value: colors.premium[600] },
          700: { value: colors.premium[700] },
          800: { value: colors.premium[800] },
          900: { value: colors.premium[900] },
        },
        // Rose accent colors
        rose: {
          50: { value: colors.rose[50] },
          100: { value: colors.rose[100] },
          200: { value: colors.rose[200] },
          300: { value: colors.rose[300] },
          400: { value: colors.rose[400] },
          500: { value: colors.rose[500] },
          600: { value: colors.rose[600] },
          700: { value: colors.rose[700] },
          800: { value: colors.rose[800] },
          900: { value: colors.rose[900] },
        },
        // Pink accent colors
        pink: {
          50: { value: colors.pink[50] },
          100: { value: colors.pink[100] },
          200: { value: colors.pink[200] },
          300: { value: colors.pink[300] },
          400: { value: colors.pink[400] },
          500: { value: colors.pink[500] },
          600: { value: colors.pink[600] },
          700: { value: colors.pink[700] },
          800: { value: colors.pink[800] },
          900: { value: colors.pink[900] },
        },
      },
      fonts: {
        body: {
          value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif`
        },
        heading: {
          value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif`
        },
      },
    },
    semanticTokens: {
      colors: {
        // Background semantic tokens
        'bg': {
          DEFAULT: { value: colors.background.default },
          muted: { value: colors.gray[100] },
          subtle: { value: colors.gray[50] },
          canvas: { value: colors.background.paper },
          surface: { value: colors.background.paper },
        },
        // Foreground semantic tokens
        'fg': {
          DEFAULT: { value: colors.text.primary },
          muted: { value: colors.text.secondary },
          subtle: { value: colors.text.tertiary },
          disabled: { value: colors.text.quaternary },
        },
        // Border semantic tokens
        'border': {
          DEFAULT: { value: colors.border.default },
          muted: { value: colors.border.subtle },
          emphasized: { value: colors.border.strong },
        },
        // Brand color palette semantic tokens
        'brand': {
          solid: { value: colors.brand[500] },
          contrast: { value: colors.gray[50] },
          fg: { value: colors.brand[700] },
          muted: { value: colors.brand[100] },
          subtle: { value: colors.brand[200] },
          emphasized: { value: colors.brand[300] },
          focusRing: { value: colors.brand[500] },
        },
        // Like color palette semantic tokens
        'like': {
          solid: { value: colors.like[500] },
          contrast: { value: colors.gray[50] },
          fg: { value: colors.like[700] },
          muted: { value: colors.like[100] },
          subtle: { value: colors.like[200] },
          emphasized: { value: colors.like[300] },
          focusRing: { value: colors.like[500] },
        },
        // Nope color palette semantic tokens
        'nope': {
          solid: { value: colors.nope[500] },
          contrast: { value: colors.gray[50] },
          fg: { value: colors.nope[700] },
          muted: { value: colors.nope[100] },
          subtle: { value: colors.nope[200] },
          emphasized: { value: colors.nope[300] },
          focusRing: { value: colors.nope[500] },
        },
        // Super Like color palette semantic tokens
        'superLike': {
          solid: { value: colors.superLike[500] },
          contrast: { value: colors.gray[50] },
          fg: { value: colors.superLike[700] },
          muted: { value: colors.superLike[100] },
          subtle: { value: colors.superLike[200] },
          emphasized: { value: colors.superLike[300] },
          focusRing: { value: colors.superLike[500] },
        },
        // Boost color palette semantic tokens
        'boost': {
          solid: { value: colors.boost[500] },
          contrast: { value: colors.gray[50] },
          fg: { value: colors.boost[700] },
          muted: { value: colors.boost[100] },
          subtle: { value: colors.boost[200] },
          emphasized: { value: colors.boost[300] },
          focusRing: { value: colors.boost[500] },
        },
        // Premium color palette semantic tokens
        'premium': {
          solid: { value: colors.premium[500] },
          contrast: { value: colors.gray[50] },
          fg: { value: colors.premium[700] },
          muted: { value: colors.premium[100] },
          subtle: { value: colors.premium[200] },
          emphasized: { value: colors.premium[300] },
          focusRing: { value: colors.premium[500] },
        },
        // Rose color palette semantic tokens
        'rose': {
          solid: { value: colors.rose[500] },
          contrast: { value: colors.gray[50] },
          fg: { value: colors.rose[700] },
          muted: { value: colors.rose[100] },
          subtle: { value: colors.rose[200] },
          emphasized: { value: colors.rose[300] },
          focusRing: { value: colors.rose[500] },
        },
        // Pink color palette semantic tokens
        'pink': {
          solid: { value: colors.pink[500] },
          contrast: { value: colors.gray[50] },
          fg: { value: colors.pink[700] },
          muted: { value: colors.pink[100] },
          subtle: { value: colors.pink[200] },
          emphasized: { value: colors.pink[300] },
          focusRing: { value: colors.pink[500] },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: colors.background.default,
      color: colors.text.primary,
      fontFamily: 'body',
      lineHeight: 1.6,
    },
  },
});

export const system = createSystem(defaultConfig, config);

export default system;
