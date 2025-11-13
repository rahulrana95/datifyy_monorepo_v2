/**
 * Datifyy Color System - Reference Implementation
 * Based on: https://github.com/rahulrana95/datifyy-monorepo
 *
 * A comprehensive color palette designed specifically for a dating application
 */

export const colors = {
  // ==================== BRAND COLORS ====================
  // Primary brand pink - used for main actions, CTAs, and brand identity
  brand: {
    50: '#fef7f7',
    100: '#fde8ea',
    200: '#fbd5d9',
    300: '#f8b3ba',
    400: '#f38695',
    500: '#e85d75',  // Main brand pink
    600: '#d14361',
    700: '#b23151',
    800: '#952b49',
    900: '#842439',
  },

  // ==================== SWIPE ACTION COLORS ====================
  // Like/Match - Green spectrum
  like: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main like green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Nope/Pass - Red spectrum
  nope: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main nope red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Super Like - Blue spectrum
  superLike: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main super like blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Boost - Gold/Orange spectrum
  boost: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Main boost gold
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // ==================== STATUS & USER STATES ====================
  // Online status
  online: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',  // Online green
  },

  // Away status
  away: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',  // Away yellow/orange
  },

  // Offline status
  offline: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',  // Offline gray
  },

  // Verified badge
  verified: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  // Verified blue
  },

  // Premium features
  premium: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // Main premium purple
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // ==================== MESSAGE STATES ====================
  message: {
    sent: '#94a3b8',      // Gray - message sent
    delivered: '#3b82f6', // Blue - message delivered
    read: '#e85d75',      // Brand pink - message read
    typing: '#f59e0b',    // Orange - typing indicator
  },

  // ==================== GRAY SCALE ====================
  // Warm-toned neutrals for text, borders, and backgrounds
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // ==================== SEMANTIC COLORS ====================
  // Standard semantic colors for UI feedback
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // ==================== FEATURE-SPECIFIC COLORS ====================
  // Video call
  videoCall: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    500: '#14b8a6',  // Teal
  },

  // Voice message
  voiceMessage: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',  // Purple
  },

  // Photo sharing
  photoShare: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',  // Amber
  },

  // Location sharing
  locationShare: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',  // Red
  },

  // ==================== HEART ANIMATIONS ====================
  heart: {
    like: '#22c55e',      // Green heart for like
    love: '#e85d75',      // Pink heart for love
    superLike: '#3b82f6', // Blue heart for super like
  },

  // ==================== BACKGROUND VARIANTS ====================
  background: {
    default: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    brand: '#fef7f7',
    brandLight: '#fde8ea',
    dark: '#171717',
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
  },

  // Gradient backgrounds
  gradient: {
    brand: 'linear-gradient(135deg, #e85d75 0%, #d14361 100%)',
    brandLight: 'linear-gradient(135deg, #fef7f7 0%, #fde8ea 100%)',
    like: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    nope: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    superLike: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    premium: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    boost: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    hero: 'linear-gradient(180deg, #fef7f7 0%, #fde8ea 50%, #fbd5d9 100%)',
  },

  // ==================== TEXT COLORS ====================
  text: {
    primary: '#171717',
    secondary: '#404040',
    tertiary: '#737373',
    quaternary: '#a3a3a3',
    muted: '#d4d4d4',
    inverse: '#ffffff',
    brand: '#e85d75',
    link: '#3b82f6',
  },
};

export default colors;
