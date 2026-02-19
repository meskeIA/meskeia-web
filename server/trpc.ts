/**
 * Configuración base de tRPC
 * Define los procedimientos públicos y el contexto del servidor
 */

import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';

/**
 * Contexto de tRPC - incluye el request original para acceder a headers
 * Necesario para leer la IP real del cliente (x-forwarded-for) en los procedures
 */
export interface TRPCContext {
  req?: Request;
}

// Crear instancia de tRPC con contexto tipado
const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Router base para agrupar procedures
 */
export const router = t.router;

/**
 * Procedure público (sin autenticación)
 * Usar para endpoints que no requieren login
 */
export const publicProcedure = t.procedure;
