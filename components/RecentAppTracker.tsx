'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { addRecentApp } from '@/lib/recentApps';

/**
 * Componente invisible que registra automáticamente las apps visitadas.
 * Se monta en el layout principal para capturar todas las navegaciones.
 */
export default function RecentAppTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Solo registrar rutas de apps (no homepage ni páginas especiales)
    // addRecentApp ya tiene su propia lógica de exclusión
    if (pathname && pathname !== '/') {
      addRecentApp(pathname);
    }
  }, [pathname]);

  // Componente invisible, no renderiza nada
  return null;
}
