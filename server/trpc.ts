/**
 * Configuración base de tRPC
 * Define los procedimientos públicos y el contexto del servidor
 */

import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';

// Crear instancia de tRPC
const t = initTRPC.create({
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
