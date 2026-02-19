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
    createContext: ({ req: request }) => ({ req: request }), // Pasar request para acceder a headers (IP, etc.)
  });

export { handler as GET, handler as POST };
