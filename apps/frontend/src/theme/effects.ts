/**
 * Visual Effects for Datifyy
 * Shadows, borders, animations, and transitions
 */

// Box shadows for depth and elevation
export const shadows = {
  // No shadow
  none: 'none',

  // Small shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',

  // Large shadows
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Special shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Colored shadows for romantic effect
  primary: '0 10px 25px -5px rgba(255, 61, 111, 0.3)',
  secondary: '0 10px 25px -5px rgba(168, 85, 247, 0.3)',
  romantic: '0 10px 30px -5px rgba(255, 61, 111, 0.4)',
} as const;

// Border radius for rounded corners
export const borderRadius = {
  none: '0',
  sm: '0.125rem',      // 2px
  DEFAULT: '0.25rem',  // 4px
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  full: '9999px',      // Fully rounded (pills, circles)
} as const;

// Animation durations
export const durations = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  slower: '500ms',
} as const;

// Easing functions
export const easings = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Custom romantic easing
  romantic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Transition presets
export const transitions = {
  // Basic transitions
  fast: `all ${durations.fast} ${easings.easeInOut}`,
  normal: `all ${durations.normal} ${easings.easeInOut}`,
  slow: `all ${durations.slow} ${easings.easeInOut}`,

  // Property-specific
  colors: `color ${durations.normal} ${easings.easeInOut}, background-color ${durations.normal} ${easings.easeInOut}, border-color ${durations.normal} ${easings.easeInOut}`,
  transform: `transform ${durations.normal} ${easings.easeOut}`,
  opacity: `opacity ${durations.normal} ${easings.easeInOut}`,

  // Special effects
  romantic: `all ${durations.slow} ${easings.romantic}`,
  bounce: `transform ${durations.normal} ${easings.bounce}`,
} as const;

// Keyframe animations
export const animations = {
  // Fade animations
  fadeIn: {
    name: 'fadeIn',
    keyframes: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    animation: `fadeIn ${durations.normal} ${easings.easeIn} forwards`,
  },

  fadeOut: {
    name: 'fadeOut',
    keyframes: `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `,
    animation: `fadeOut ${durations.normal} ${easings.easeOut} forwards`,
  },

  // Slide animations
  slideInUp: {
    name: 'slideInUp',
    keyframes: `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    animation: `slideInUp ${durations.slow} ${easings.easeOut} forwards`,
  },

  slideInDown: {
    name: 'slideInDown',
    keyframes: `
      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    animation: `slideInDown ${durations.slow} ${easings.easeOut} forwards`,
  },

  // Scale animations
  scaleIn: {
    name: 'scaleIn',
    keyframes: `
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
    animation: `scaleIn ${durations.normal} ${easings.easeOut} forwards`,
  },

  // Romantic pulse (for heart animations)
  heartbeat: {
    name: 'heartbeat',
    keyframes: `
      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        10% { transform: scale(1.1); }
        20% { transform: scale(1); }
        30% { transform: scale(1.1); }
        40% { transform: scale(1); }
      }
    `,
    animation: `heartbeat 1s ${easings.ease} infinite`,
  },

  // Shimmer effect for loading states
  shimmer: {
    name: 'shimmer',
    keyframes: `
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
    `,
    animation: `shimmer 2s ${easings.linear} infinite`,
  },
} as const;

// Z-index layers
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
} as const;

export type Shadow = keyof typeof shadows;
export type BorderRadius = keyof typeof borderRadius;
export type Duration = keyof typeof durations;
export type Easing = keyof typeof easings;
export type Animation = keyof typeof animations;
export type ZIndex = keyof typeof zIndex;
