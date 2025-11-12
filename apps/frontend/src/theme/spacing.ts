/**
 * Spacing System for Datifyy
 * Consistent spacing scale for margins, padding, gaps, etc.
 * Base unit: 4px (0.25rem)
 */

export const spacing = {
  // No space
  0: '0',

  // Extra small
  0.5: '0.125rem',    // 2px
  1: '0.25rem',       // 4px
  1.5: '0.375rem',    // 6px
  2: '0.5rem',        // 8px
  2.5: '0.625rem',    // 10px
  3: '0.75rem',       // 12px
  3.5: '0.875rem',    // 14px

  // Small
  4: '1rem',          // 16px
  5: '1.25rem',       // 20px
  6: '1.5rem',        // 24px
  7: '1.75rem',       // 28px

  // Medium
  8: '2rem',          // 32px
  9: '2.25rem',       // 36px
  10: '2.5rem',       // 40px
  11: '2.75rem',      // 44px
  12: '3rem',         // 48px

  // Large
  14: '3.5rem',       // 56px
  16: '4rem',         // 64px
  18: '4.5rem',       // 72px
  20: '5rem',         // 80px

  // Extra large
  24: '6rem',         // 96px
  28: '7rem',         // 112px
  32: '8rem',         // 128px
  36: '9rem',         // 144px
  40: '10rem',        // 160px

  // Special
  44: '11rem',        // 176px
  48: '12rem',        // 192px
  52: '13rem',        // 208px
  56: '14rem',        // 224px
  60: '15rem',        // 240px
  64: '16rem',        // 256px
  72: '18rem',        // 288px
  80: '20rem',        // 320px
  96: '24rem',        // 384px
} as const;

// Common spacing patterns for specific use cases
export const spacingPatterns = {
  // Component internal spacing
  componentPadding: {
    sm: spacing[2],     // 8px
    md: spacing[4],     // 16px
    lg: spacing[6],     // 24px
    xl: spacing[8],     // 32px
  },

  // Stack spacing (vertical gaps)
  stack: {
    xs: spacing[1],     // 4px
    sm: spacing[2],     // 8px
    md: spacing[4],     // 16px
    lg: spacing[6],     // 24px
    xl: spacing[8],     // 32px
  },

  // Inline spacing (horizontal gaps)
  inline: {
    xs: spacing[1],     // 4px
    sm: spacing[2],     // 8px
    md: spacing[3],     // 12px
    lg: spacing[4],     // 16px
    xl: spacing[6],     // 24px
  },

  // Section spacing (between major sections)
  section: {
    sm: spacing[12],    // 48px
    md: spacing[16],    // 64px
    lg: spacing[24],    // 96px
    xl: spacing[32],    // 128px
  },

  // Container padding
  container: {
    mobile: spacing[4],     // 16px
    tablet: spacing[6],     // 24px
    desktop: spacing[8],    // 32px
  },

  // Card spacing
  card: {
    padding: spacing[6],    // 24px
    gap: spacing[4],        // 16px
  },

  // Modal spacing
  modal: {
    padding: spacing[6],    // 24px
    gap: spacing[6],        // 24px
  },

  // Form spacing
  form: {
    fieldGap: spacing[4],      // 16px between form fields
    labelGap: spacing[1.5],    // 6px between label and input
    buttonGap: spacing[3],     // 12px between buttons
  },
} as const;

export type Spacing = keyof typeof spacing;
export type SpacingPattern = keyof typeof spacingPatterns;
