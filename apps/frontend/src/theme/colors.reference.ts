/**
 * Datifyy Color Palette
 * Premium, romantic, and warm colors for a luxury dating experience
 * Carefully curated for emotional connection and visual harmony
 */

export const colors = {
  // Brand Colors - Romantic Rose & Blush
  brand: {
    50: '#fff5f7',    // Lightest blush - barely there pink
    100: '#ffe3e8',   // Soft cotton candy
    200: '#ffc7d3',   // Delicate rose
    300: '#ff9fb0',   // Sweet pink
    400: '#ff7a91',   // Warm coral pink
    500: '#ff5875',   // Primary - Passionate rose (main brand)
    600: '#e8396b',   // Deep rose
    700: '#d1215d',   // Rich crimson
    800: '#b01450',   // Dark ruby
    900: '#8a0f42',   // Deepest burgundy
  },

  // Like Colors - Fresh Meadow Green (success, match)
  like: {
    50: '#f0fdf6',
    100: '#dcfce9',
    200: '#bbf7d5',
    300: '#86efb4',
    400: '#4ade88',
    500: '#22c55e',   // Primary like green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Nope Colors - Elegant Coral Red (decline, pass)
  nope: {
    50: '#fef5f5',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',   // Primary nope red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Super Like Colors - Celestial Blue (special interest)
  superLike: {
    50: '#eff8ff',
    100: '#dbeeff',
    200: '#bfe0ff',
    300: '#93c9ff',
    400: '#60a8ff',
    500: '#3b82f6',   // Primary super like blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Boost Colors - Golden Sunset (premium feature)
  boost: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',   // Primary boost gold
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Premium Colors - Royal Purple (VIP features)
  premium: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',   // Primary premium purple
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Neutral Grays - Soft & Elegant
  gray: {
    50: '#fafafa',    // Almost white
    100: '#f5f5f5',   // Light mist
    200: '#e5e5e5',   // Soft cloud
    300: '#d4d4d4',   // Silver
    400: '#a3a3a3',   // Medium gray
    500: '#737373',   // Steel
    600: '#525252',   // Charcoal
    700: '#404040',   // Dark charcoal
    800: '#262626',   // Almost black
    900: '#171717',   // Rich black
  },

  // Warm Neutrals - For premium feel
  warmGray: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },

  // Accent Colors - Complementary romance
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',   // Romantic rose accent
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },

  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',   // Vibrant pink accent
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },

  // Text Colors - Premium hierarchy
  text: {
    primary: '#171717',       // Rich black for headings
    secondary: '#525252',     // Charcoal for body text
    tertiary: '#a3a3a3',      // Medium gray for hints
    quaternary: '#d4d4d4',    // Light gray for disabled
    inverse: '#ffffff',       // White on dark backgrounds
    brand: '#ff5875',         // Brand pink for emphasis
    like: '#22c55e',          // Like green
    nope: '#ef4444',          // Nope red
  },

  // Background Colors - Layered elegance
  background: {
    default: '#f0f0f0',       // Base page background (20% darker)
    paper: '#fafafa',         // Card/surface background (20% darker)
    elevated: '#ffffff',      // Elevated surfaces
    overlay: 'rgba(0, 0, 0, 0.5)',  // Modal overlay
    hover: '#e8e8e8',         // Hover states (darker)
    pressed: '#d8d8d8',       // Active/pressed states (darker)
    brand: '#ffe3e8',         // Branded backgrounds (slightly darker pink)
    brandSubtle: '#ffc7d3',   // Very subtle brand tint (darker)
    premium: '#f3e8ff',       // Premium feature backgrounds (darker)
  },

  // Border Colors - Subtle definition
  border: {
    default: '#e5e5e5',       // Default borders
    subtle: '#f5f5f5',        // Very light borders
    strong: '#d4d4d4',        // Emphasized borders
    brand: '#ff5875',         // Brand colored borders
    hover: '#d4d4d4',         // Hover state borders
  },

  // Gradients - Romantic & Premium
  gradient: {
    brand: 'linear-gradient(135deg, #ff5875 0%, #ff7a91 100%)',
    romantic: 'linear-gradient(135deg, #ff5875 0%, #f43f5e 50%, #ec4899 100%)',
    sunset: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ff5875 100%)',
    premium: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
    like: 'linear-gradient(135deg, #22c55e 0%, #4ade88 100%)',
    nope: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    superLike: 'linear-gradient(135deg, #3b82f6 0%, #60a8ff 100%)',
    boost: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    hero: 'linear-gradient(135deg, #ff5875 0%, #a855f7 50%, #60a8ff 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },

  // Shadow Colors - Depth & elevation
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    brand: '0 10px 40px -5px rgba(255, 88, 117, 0.4)',       // Soft pink glow
    like: '0 10px 40px -5px rgba(34, 197, 94, 0.4)',         // Soft green glow
    nope: '0 10px 40px -5px rgba(239, 68, 68, 0.4)',         // Soft red glow
    premium: '0 10px 40px -5px rgba(168, 85, 247, 0.4)',     // Soft purple glow
    romantic: '0 20px 60px -15px rgba(255, 88, 117, 0.5)',   // Romantic pink aura
  },

  // Status Colors - Feedback & alerts
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Overlay Colors - Glass morphism & modals
  overlay: {
    light: 'rgba(255, 255, 255, 0.95)',      // Light overlay
    medium: 'rgba(255, 255, 255, 0.8)',      // Medium overlay
    dark: 'rgba(23, 23, 23, 0.6)',           // Dark overlay
    darker: 'rgba(23, 23, 23, 0.8)',         // Darker overlay
    darkest: 'rgba(23, 23, 23, 0.95)',       // Almost opaque
    glass: 'rgba(255, 255, 255, 0.1)',       // Glass effect
    glassStrong: 'rgba(255, 255, 255, 0.2)', // Stronger glass
    brandGlass: 'rgba(255, 88, 117, 0.1)',   // Brand tinted glass
  },

  // Special Effects - Premium touches
  glow: {
    brand: '0 0 20px rgba(255, 88, 117, 0.5), 0 0 40px rgba(255, 88, 117, 0.3)',
    premium: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
    like: '0 0 20px rgba(34, 197, 94, 0.5)',
    romantic: '0 0 30px rgba(255, 88, 117, 0.6), 0 0 60px rgba(255, 88, 117, 0.4), 0 0 90px rgba(255, 88, 117, 0.2)',
  },
} as const;

export type ColorPalette = typeof colors;
