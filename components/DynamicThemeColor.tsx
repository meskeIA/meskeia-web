'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Componente que actualiza el meta theme-color dinámicamente según el tema activo
 * Mejora la integración nativa en móviles (Android/iOS)
 */
export default function DynamicThemeColor() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Esperar a que el tema esté resuelto
    if (!resolvedTheme) return;

    // Colores según tema
    const themeColors = {
      light: '#2E86AB', // Azul meskeIA para tema claro
      dark: '#1A5A7A',  // Azul más oscuro para tema oscuro
    };

    const color = themeColors[resolvedTheme as keyof typeof themeColors] || themeColors.light;

    // Actualizar o crear meta tag theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      // Crear si no existe
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    // Actualizar color
    metaThemeColor.setAttribute('content', color);

    // También actualizar para iOS Safari (status bar)
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');

    if (!appleStatusBar) {
      appleStatusBar = document.createElement('meta');
      appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(appleStatusBar);
    }

    // iOS soporta: default, black, black-translucent
    // Usamos black-translucent para dark mode
    appleStatusBar.setAttribute('content', resolvedTheme === 'dark' ? 'black-translucent' : 'default');

    console.log(`✅ Theme-color actualizado: ${color} (${resolvedTheme})`);
  }, [resolvedTheme]);

  return null; // No renderiza nada visualmente
}
