/**
 * App Router - Punto de entrada para todos los routers tRPC
 * Agrupa todos los routers de la aplicación
 */

import { router } from '../trpc';
import { analyticsRouter } from './analytics';

/**
 * Router principal de la aplicación
 * Aquí se añaden todos los sub-routers
 */
export const appRouter = router({
  analytics: analyticsRouter,
  // Futuro: Añadir más routers aquí
  // validation: validationRouter,
  // facturas: facturasRouter,
});

// Exportar tipo del router para inferencia en el cliente
export type AppRouter = typeof appRouter;
