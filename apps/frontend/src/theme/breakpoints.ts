/**
 * Responsive Breakpoints for Datifyy
 * Mobile-first approach
 */

export const breakpoints = {
  // Mobile devices
  xs: '375px',    // Small phones
  sm: '640px',    // Large phones

  // Tablets
  md: '768px',    // Tablets (portrait)
  lg: '1024px',   // Tablets (landscape) / Small laptops

  // Desktop
  xl: '1280px',   // Desktop
  '2xl': '1536px', // Large desktop
} as const;

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,

  // Max-width queries (for mobile-specific styles)
  maxSm: `@media (max-width: ${breakpoints.sm})`,
  maxMd: `@media (max-width: ${breakpoints.md})`,
  maxLg: `@media (max-width: ${breakpoints.lg})`,
  maxXl: `@media (max-width: ${breakpoints.xl})`,

  // Between breakpoints
  smToMd: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
  mdToLg: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  lgToXl: `@media (min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,

  // Device-specific
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
} as const;

// Container max widths per breakpoint
export const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type MediaQuery = keyof typeof mediaQueries;
