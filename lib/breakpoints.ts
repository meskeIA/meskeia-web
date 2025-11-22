/**
 * Breakpoints del Sistema Responsive meskeIA
 * Sincronizado con variables CSS en globals.css
 */

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Media queries predefinidas para uso en JavaScript
 */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.tablet - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  wide: `(min-width: ${BREAKPOINTS.wide}px)`,

  // Helpers adicionales
  minTablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
  minDesktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  minWide: `(min-width: ${BREAKPOINTS.wide}px)`,

  maxMobile: `(max-width: ${BREAKPOINTS.tablet - 1}px)`,
  maxTablet: `(max-width: ${BREAKPOINTS.desktop - 1}px)`,
  maxDesktop: `(max-width: ${BREAKPOINTS.wide - 1}px)`,
} as const;

/**
 * Spacing scale sincronizado con CSS
 */
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

/**
 * Typography scale sincronizado con CSS
 */
export const FONT_SIZES = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
} as const;

/**
 * Container widths sincronizados con CSS
 */
export const CONTAINER_WIDTHS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;
