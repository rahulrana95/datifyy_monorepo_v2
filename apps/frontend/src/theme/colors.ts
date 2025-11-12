/**
 * Romantic Color Palette for Datifyy
 * Inspired by love, warmth, and connection
 *
 * Primary: Warm coral-pink gradient (better than Tinder's orange)
 * Secondary: Soft lavender-purple for romance
 * Accent: Rose gold for premium feel
 */

export const colors = {
  // Primary brand colors - Warm coral to pink gradient
  primary: {
    50: '#fff1f3',    // Lightest blush
    100: '#ffe4e8',   // Soft pink
    200: '#ffcdd6',   // Light coral
    300: '#ffa3b5',   // Medium pink
    400: '#ff6b8e',   // Coral pink
    500: '#ff3d6f',   // Primary brand color (vibrant coral-pink)
    600: '#f01d55',   // Deep coral
    700: '#d91448',   // Rich pink
    800: '#b31543',   // Dark pink
    900: '#94173f',   // Deepest pink
  },

  // Secondary colors - Soft lavender/purple for romance
  secondary: {
    50: '#faf5ff',    // Lightest lavender
    100: '#f3e8ff',   // Soft lavender
    200: '#e9d5ff',   // Light purple
    300: '#d8b4fe',   // Medium lavender
    400: '#c084fc',   // Purple
    500: '#a855f7',   // Secondary brand color (vibrant purple)
    600: '#9333ea',   // Deep purple
    700: '#7e22ce',   // Rich purple
    800: '#6b21a8',   // Dark purple
    900: '#581c87',   // Deepest purple
  },

  // Accent color - Rose gold for premium elements
  accent: {
    50: '#fef7ee',
    100: '#fdecd4',
    200: '#fbd5a8',
    300: '#f8b871',
    400: '#f59242',   // Rose gold
    500: '#f27318',
    600: '#e3590e',
    700: '#bc430e',
    800: '#963713',
    900: '#792f13',
  },

  // Neutral grays - Warm tinted
  gray: {
    50: '#fafafa',    // Almost white
    100: '#f5f5f5',   // Very light gray
    200: '#e5e5e5',   // Light gray
    300: '#d4d4d4',   // Medium-light gray
    400: '#a3a3a3',   // Medium gray
    500: '#737373',   // Mid gray
    600: '#525252',   // Dark-medium gray
    700: '#404040',   // Dark gray
    800: '#262626',   // Very dark gray
    900: '#171717',   // Almost black
  },

  // Semantic colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#065f46',
  },

  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#991b1b',
  },

  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#92400e',
  },

  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1e40af',
  },

  // Special gradients for romantic effects
  gradients: {
    primary: 'linear-gradient(135deg, #ff3d6f 0%, #ff6b8e 100%)',
    secondary: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
    romantic: 'linear-gradient(135deg, #ff3d6f 0%, #a855f7 100%)',
    sunset: 'linear-gradient(135deg, #f59242 0%, #ff3d6f 50%, #a855f7 100%)',
    roseGold: 'linear-gradient(135deg, #f59242 0%, #ff6b8e 100%)',
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: '#171717',      // Almost black for main text
    secondary: '#525252',    // Medium gray for secondary text
    tertiary: '#a3a3a3',     // Light gray for subtle text
    inverse: '#ffffff',      // White text on dark backgrounds
    link: '#ff3d6f',         // Primary color for links
  },

  // Border colors
  border: {
    light: '#e5e5e5',
    DEFAULT: '#d4d4d4',
    dark: '#a3a3a3',
  },

  // Special: Heart colors for like/love features
  heart: {
    empty: '#d4d4d4',
    filled: '#ff3d6f',
    super: '#a855f7',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
