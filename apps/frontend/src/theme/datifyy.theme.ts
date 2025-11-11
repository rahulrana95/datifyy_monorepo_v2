/**
 * Datifyy Romantic Pink Design System
 * World-Class Romantic Dating Platform
 * Color Psychology: Pink = Love, Romance, Warmth, Trust
 */

export const datifyyTheme = {
  // Romantic Pink Color Palette
  colors: {
    // Primary - Romantic Rose/Pink (Love, Romance, Passion)
    primary: {
      50: '#fff1f2',     // Lightest blush
      100: '#ffe4e6',    // Very light pink
      200: '#fecdd3',    // Light pink
      300: '#fda4af',    // Soft pink
      400: '#fb7185',    // Medium pink
      500: '#f43f5e',    // Vibrant rose
      600: '#e11d48',    // Deep rose
      700: '#be123c',    // Rich burgundy
      800: '#9f1239',    // Dark burgundy
      900: '#881337',    // Darkest burgundy
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)',
      soft: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      mesh: 'radial-gradient(at 0% 0%, rgba(244, 63, 94, 0.18) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(251, 113, 133, 0.15) 0px, transparent 50%)',
    },

    // Secondary - Coral/Peach Pink (Warm, Friendly, Approachable)
    secondary: {
      50: '#fff7ed',     // Lightest peach
      100: '#ffedd5',    // Very light peach
      200: '#fed7aa',    // Light coral
      300: '#fdba74',    // Soft coral
      400: '#fb923c',    // Medium coral
      500: '#f97316',    // Vibrant coral
      600: '#ea580c',    // Deep coral
      700: '#c2410c',    // Rich rust
      800: '#9a3412',    // Dark rust
      900: '#7c2d12',    // Darkest rust
      gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)',
      mesh: 'radial-gradient(at 100% 0%, rgba(249, 115, 22, 0.15) 0px, transparent 50%)',
    },

    // Accent - Magenta/Fuchsia (Premium, Vibrant, Exciting)
    accent: {
      50: '#fdf4ff',     // Lightest lavender
      100: '#fae8ff',    // Very light fuchsia
      200: '#f5d0fe',    // Light fuchsia
      300: '#f0abfc',    // Soft fuchsia
      400: '#e879f9',    // Medium fuchsia
      500: '#d946ef',    // Vibrant magenta
      600: '#c026d3',    // Deep magenta
      700: '#a21caf',    // Rich purple-pink
      800: '#86198f',    // Dark purple-pink
      900: '#701a75',    // Darkest purple-pink
      gradient: 'linear-gradient(135deg, #d946ef 0%, #e879f9 50%, #f0abfc 100%)',
    },

    // Trust - Soft Pink-Blue (Calm, Trustworthy, Secure)
    trust: {
      50: '#fef2f2',     // Lightest rose-tinted
      100: '#fee2e2',    // Very light rose
      200: '#fecaca',    // Light rose
      300: '#fca5a5',    // Soft rose-red
      400: '#f87171',    // Medium rose-red
      500: '#ef4444',    // Vibrant red-pink
      600: '#dc2626',    // Deep red
      700: '#b91c1c',    // Rich red
      800: '#991b1b',    // Dark red
      900: '#7f1d1d',    // Darkest red
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
    },

    // Neutral - Warm pinks/taupes (Sophisticated, Premium)
    gray: {
      50: '#fafafa',     // Off-white with pink tint
      100: '#f5f5f5',    // Very light gray-pink
      200: '#e5e5e5',    // Light gray
      300: '#d4d4d4',    // Medium-light gray
      400: '#a3a3a3',    // Medium gray
      500: '#737373',    // Medium-dark gray
      600: '#525252',    // Dark gray
      700: '#404040',    // Very dark gray
      800: '#262626',    // Almost black
      900: '#171717',    // Darkest
    },

    // Semantic colors (pink-tinted)
    success: '#f43f5e',  // Use primary pink for success
    warning: '#fb923c',  // Use coral for warnings
    error: '#dc2626',    // Deep red for errors
    info: '#e879f9',     // Fuchsia for info

    // Romantic Backgrounds
    background: {
      primary: '#ffffff',
      secondary: '#fff1f2',     // Soft pink tint
      tertiary: '#ffe4e6',      // Lighter pink
      dark: '#171717',
      overlay: 'rgba(23, 23, 23, 0.6)',
      glass: 'rgba(255, 255, 255, 0.75)',
      gradient: 'linear-gradient(180deg, #ffffff 0%, #fff1f2 50%, #ffe4e6 100%)',
      premium: 'linear-gradient(135deg, #fff1f2 0%, #fdf4ff 50%, #fff7ed 100%)',
      hero: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(244, 63, 94, 0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 50% 120%, rgba(217, 70, 239, 0.10) 0%, transparent 50%), linear-gradient(180deg, #ffffff 0%, #fff1f2 30%, #ffe4e6 70%, #fecdd3 100%)',
    },

    // Text colors
    text: {
      primary: '#171717',
      secondary: '#404040',
      tertiary: '#737373',
      inverse: '#ffffff',
      muted: '#a3a3a3',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #e879f9 100%)',
    },
  },

  // Premium Typography System - Responsive & Readable
  fonts: {
    heading: "'Playfair Display', 'Georgia', serif",  // Romantic serif
    body: "'Inter', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Monaco', monospace",
  },

  // Fluid Typography (scales with viewport)
  fontSizes: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',      // 12-14px
    sm: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',       // 14-16px
    md: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',        // 16-18px
    lg: 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',    // 18-20px
    xl: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',        // 20-24px
    '2xl': 'clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)',   // 24-30px
    '3xl': 'clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)', // 30-36px
    '4xl': 'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)',       // 36-48px
    '5xl': 'clamp(3rem, 2.55rem + 2.25vw, 3.75rem)',      // 48-60px
    '6xl': 'clamp(3.75rem, 3.15rem + 3vw, 4.5rem)',       // 60-72px
    '7xl': 'clamp(4.5rem, 3.75rem + 3.75vw, 6rem)',       // 72-96px
  },

  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeights: {
    none: 1,
    tight: 1.15,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Spacing System (8px base)
  space: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
  },

  // Border Radius - Softer, more romantic
  radii: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },

  // Romantic Pink Shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(244, 63, 94, 0.05)',
    sm: '0 2px 4px 0 rgba(244, 63, 94, 0.08), 0 1px 2px 0 rgba(244, 63, 94, 0.04)',
    md: '0 4px 8px -2px rgba(244, 63, 94, 0.10), 0 2px 4px -2px rgba(244, 63, 94, 0.06)',
    lg: '0 12px 24px -4px rgba(244, 63, 94, 0.12), 0 4px 8px -2px rgba(244, 63, 94, 0.08)',
    xl: '0 20px 40px -8px rgba(244, 63, 94, 0.15), 0 8px 16px -4px rgba(244, 63, 94, 0.10)',
    '2xl': '0 32px 64px -12px rgba(244, 63, 94, 0.20), 0 12px 24px -6px rgba(244, 63, 94, 0.12)',
    '3xl': '0 48px 96px -16px rgba(244, 63, 94, 0.25), 0 16px 32px -8px rgba(244, 63, 94, 0.15)',
    inner: 'inset 0 2px 4px 0 rgba(244, 63, 94, 0.06)',
    glow: '0 0 48px rgba(244, 63, 94, 0.30), 0 0 24px rgba(217, 70, 239, 0.20)',
    glowStrong: '0 0 64px rgba(244, 63, 94, 0.40), 0 0 32px rgba(217, 70, 239, 0.30)',
    card: '0 4px 16px -2px rgba(244, 63, 94, 0.08), 0 2px 8px -2px rgba(244, 63, 94, 0.04)',
    cardHover: '0 12px 32px -4px rgba(244, 63, 94, 0.15), 0 4px 12px -2px rgba(244, 63, 94, 0.10)',
    button: '0 6px 20px -4px rgba(244, 63, 94, 0.35), 0 2px 8px -2px rgba(244, 63, 94, 0.20)',
    buttonHover: '0 12px 32px -6px rgba(244, 63, 94, 0.45), 0 4px 12px -2px rgba(244, 63, 94, 0.30)',
    premium: '0 8px 32px -4px rgba(217, 70, 239, 0.25), 0 4px 16px -2px rgba(244, 63, 94, 0.20)',
    glass: '0 8px 32px 0 rgba(244, 63, 94, 0.10), inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-indices
  zIndices: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Smooth Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Romantic Component Styles
  components: {
    button: {
      primary: {
        background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)',
        color: 'white',
        padding: '16px 40px',
        borderRadius: '999px',  // Full round
        fontWeight: 600,
        fontSize: '16px',
        letterSpacing: '-0.01em',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 6px 20px -4px rgba(244, 63, 94, 0.35), 0 2px 8px -2px rgba(244, 63, 94, 0.20)',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: '0 12px 32px -6px rgba(244, 63, 94, 0.45), 0 4px 12px -2px rgba(244, 63, 94, 0.30)',
        },
        '&:active': {
          transform: 'translateY(0) scale(0.98)',
        },
      },
      secondary: {
        background: 'white',
        color: '#f43f5e',
        border: '2px solid #fb7185',
        padding: '14px 38px',
        borderRadius: '999px',
        fontWeight: 600,
        fontSize: '16px',
        letterSpacing: '-0.01em',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: '#fff1f2',
          borderColor: '#f43f5e',
        },
      },
      ghost: {
        background: 'transparent',
        color: '#404040',
        padding: '12px 24px',
        borderRadius: '16px',
        fontWeight: 500,
        fontSize: '16px',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: 'rgba(244, 63, 94, 0.08)',
          color: '#f43f5e',
        },
      },
      glass: {
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(24px)',
        color: '#171717',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        padding: '14px 32px',
        borderRadius: '20px',
        fontWeight: 600,
        fontSize: '16px',
        boxShadow: '0 8px 32px 0 rgba(244, 63, 94, 0.10), inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.9)',
          transform: 'translateY(-2px)',
        },
      },
    },
    card: {
      base: {
        background: 'white',
        borderRadius: '28px',
        padding: '32px',
        boxShadow: '0 4px 16px -2px rgba(244, 63, 94, 0.08), 0 2px 8px -2px rgba(244, 63, 94, 0.04)',
        border: '1px solid rgba(244, 63, 94, 0.08)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      elevated: {
        background: 'white',
        borderRadius: '28px',
        padding: '40px',
        boxShadow: '0 12px 32px -4px rgba(244, 63, 94, 0.15), 0 4px 12px -2px rgba(244, 63, 94, 0.10)',
        border: '1px solid rgba(244, 63, 94, 0.06)',
      },
      glass: {
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(24px)',
        borderRadius: '28px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px 0 rgba(244, 63, 94, 0.10), inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',
      },
      premium: {
        background: 'linear-gradient(145deg, #ffffff 0%, #fff1f2 100%)',
        border: '1px solid rgba(244, 63, 94, 0.12)',
        borderRadius: '28px',
        padding: '32px',
        boxShadow: '0 8px 32px -4px rgba(217, 70, 239, 0.18), 0 4px 16px -2px rgba(244, 63, 94, 0.15)',
      },
    },
  },
};
