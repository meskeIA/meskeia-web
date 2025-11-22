'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para detectar breakpoints responsive
 *
 * @param query - Media query CSS (ej: '(min-width: 768px)')
 * @returns boolean - true si la media query coincide
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Crear media query
    const mediaQuery = window.matchMedia(query);

    // Actualizar estado inicial
    setMatches(mediaQuery.matches);

    // Listener para cambios
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Añadir listener (compatible con navegadores antiguos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  // Prevenir errores de hidratación SSR
  if (!mounted) {
    return false;
  }

  return matches;
}

/**
 * Hooks predefinidos para breakpoints comunes
 */

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsWide(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

/**
 * Hook para obtener el breakpoint actual
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isWide = useIsWide();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isWide) return 'wide';
  return 'desktop';
}
