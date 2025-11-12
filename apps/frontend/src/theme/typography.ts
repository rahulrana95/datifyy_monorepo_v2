/**
 * Typography System for Datifyy
 * Elegant, modern fonts for a premium dating experience
 */

export const typography = {
  // Font families
  fonts: {
    // Primary font: Modern, clean, and elegant
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

    // Headings: Slightly more elegant
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Monospace for code/technical content
    mono: '"JetBrains Mono", "Fira Code", Monaco, Consolas, monospace',
  },

  // Font sizes with line heights
  sizes: {
    // Extra small
    xs: {
      fontSize: '0.75rem',      // 12px
      lineHeight: '1rem',        // 16px
    },

    // Small
    sm: {
      fontSize: '0.875rem',     // 14px
      lineHeight: '1.25rem',     // 20px
    },

    // Base (default body text)
    base: {
      fontSize: '1rem',          // 16px
      lineHeight: '1.5rem',      // 24px
    },

    // Large
    lg: {
      fontSize: '1.125rem',     // 18px
      lineHeight: '1.75rem',     // 28px
    },

    // Extra large
    xl: {
      fontSize: '1.25rem',      // 20px
      lineHeight: '1.75rem',     // 28px
    },

    // 2X large
    '2xl': {
      fontSize: '1.5rem',       // 24px
      lineHeight: '2rem',        // 32px
    },

    // 3X large
    '3xl': {
      fontSize: '1.875rem',     // 30px
      lineHeight: '2.25rem',     // 36px
    },

    // 4X large
    '4xl': {
      fontSize: '2.25rem',      // 36px
      lineHeight: '2.5rem',      // 40px
    },

    // 5X large
    '5xl': {
      fontSize: '3rem',          // 48px
      lineHeight: '1',           // Tight
    },

    // 6X large (hero text)
    '6xl': {
      fontSize: '3.75rem',      // 60px
      lineHeight: '1',           // Tight
    },

    // 7X large (display text)
    '7xl': {
      fontSize: '4.5rem',       // 72px
      lineHeight: '1',           // Tight
    },
  },

  // Font weights
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text transforms
  textTransform: {
    uppercase: 'uppercase' as const,
    lowercase: 'lowercase' as const,
    capitalize: 'capitalize' as const,
    none: 'none' as const,
  },
} as const;

// Predefined text styles for common use cases
export const textStyles = {
  // Display titles (hero sections)
  displayLarge: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['7xl'].fontSize,
    lineHeight: typography.sizes['7xl'].lineHeight,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },

  displayMedium: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['5xl'].fontSize,
    lineHeight: typography.sizes['5xl'].lineHeight,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },

  // Headings
  h1: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['4xl'].fontSize,
    lineHeight: typography.sizes['4xl'].lineHeight,
    fontWeight: typography.weights.bold,
  },

  h2: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['3xl'].fontSize,
    lineHeight: typography.sizes['3xl'].lineHeight,
    fontWeight: typography.weights.semibold,
  },

  h3: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['2xl'].fontSize,
    lineHeight: typography.sizes['2xl'].lineHeight,
    fontWeight: typography.weights.semibold,
  },

  h4: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl.fontSize,
    lineHeight: typography.sizes.xl.lineHeight,
    fontWeight: typography.weights.semibold,
  },

  h5: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg.fontSize,
    lineHeight: typography.sizes.lg.lineHeight,
    fontWeight: typography.weights.medium,
  },

  h6: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.base.fontSize,
    lineHeight: typography.sizes.base.lineHeight,
    fontWeight: typography.weights.medium,
  },

  // Body text
  bodyLarge: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.lg.fontSize,
    lineHeight: typography.sizes.lg.lineHeight,
    fontWeight: typography.weights.normal,
  },

  body: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.base.fontSize,
    lineHeight: typography.sizes.base.lineHeight,
    fontWeight: typography.weights.normal,
  },

  bodySmall: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm.fontSize,
    lineHeight: typography.sizes.sm.lineHeight,
    fontWeight: typography.weights.normal,
  },

  // Special text styles
  caption: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs.fontSize,
    lineHeight: typography.sizes.xs.lineHeight,
    fontWeight: typography.weights.normal,
  },

  overline: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs.fontSize,
    lineHeight: typography.sizes.xs.lineHeight,
    fontWeight: typography.weights.semibold,
    textTransform: typography.textTransform.uppercase,
    letterSpacing: typography.letterSpacing.wider,
  },

  button: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.base.fontSize,
    lineHeight: typography.sizes.base.lineHeight,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },

  link: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.base.fontSize,
    lineHeight: typography.sizes.base.lineHeight,
    fontWeight: typography.weights.medium,
    textDecoration: 'none',
  },
} as const;

export type FontSize = keyof typeof typography.sizes;
export type FontWeight = keyof typeof typography.weights;
export type TextStyle = keyof typeof textStyles;
