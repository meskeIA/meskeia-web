/**
 * API Route Handler para tRPC
 * Expone el router tRPC como endpoint de Next.js
 * Ruta: /api/trpc/*
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';

// Handler para GET y POST
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}), // Sin contexto por ahora (no necesitamos auth)
  });

export { handler as GET, handler as POST };
