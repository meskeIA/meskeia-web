/**
 * Providers para la aplicación
 * Configura tRPC + React Query
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configuración por defecto para queries
            // 10 min: el dashboard se consulta unas pocas veces al día y no
            // necesita datos "al segundo". Evita re-consultar Turso al navegar
            // entre pestañas. Botón "Actualizar Datos" fuerza refresco manual.
            staleTime: 10 * 60 * 1000, // 10 minutos
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          // Clave de acceso al panel de analytics. Solo el navegador del
          // propietario la tiene (guardada en localStorage tras introducirla
          // en la puerta de entrada del dashboard). Las apps públicas no usan
          // tRPC, así que esta cabecera solo viaja desde el dashboard.
          headers() {
            if (typeof window === 'undefined') return {};
            const key = window.localStorage.getItem('meskeia_analytics_key');
            return key ? { 'x-analytics-key': key } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
