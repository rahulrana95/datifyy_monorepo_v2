/**
 * Datifyy Theme System
 * A romantic, modern design system for dating
 *
 * Usage:
 * import { theme } from '@/theme';
 * style={{ color: theme.colors.primary[500] }}
 */

import { colors } from './colors';
import { typography, textStyles } from './typography';
import { spacing, spacingPatterns } from './spacing';
import { breakpoints, mediaQueries, containerMaxWidths } from './breakpoints';
import { shadows, borderRadius, durations, easings, transitions, animations, zIndex } from './effects';

// Complete theme object
export const theme = {
  colors,
  typography,
  textStyles,
  spacing,
  spacingPatterns,
  breakpoints,
  mediaQueries,
  containerMaxWidths,
  shadows,
  borderRadius,
  durations,
  easings,
  transitions,
  animations,
  zIndex,
} as const;

// Export individual modules for tree-shaking
export { colors } from './colors';
export { typography, textStyles } from './typography';
export { spacing, spacingPatterns } from './spacing';
export { breakpoints, mediaQueries, containerMaxWidths } from './breakpoints';
export { shadows, borderRadius, durations, easings, transitions, animations, zIndex } from './effects';

// Export types
export type {
  ColorKey,
  ColorShade,
} from './colors';

export type {
  FontSize,
  FontWeight,
  TextStyle,
} from './typography';

export type {
  Spacing,
  SpacingPattern,
} from './spacing';

export type {
  Breakpoint,
  MediaQuery,
} from './breakpoints';

export type {
  Shadow,
  BorderRadius,
  Duration,
  Easing,
  Animation,
  ZIndex,
} from './effects';

// Theme type
export type Theme = typeof theme;

// Default export
export default theme;
