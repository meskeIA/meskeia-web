/**
 * Cliente tRPC para React
 * Proporciona hooks tipados para consumir procedures del servidor
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

/**
 * Cliente tRPC con inferencia de tipos automática
 * Uso: const { data } = trpc.analytics.getStats.useQuery({ limite: 100 });
 */
export const trpc = createTRPCReact<AppRouter>();
