/**
 * Configuración base de tRPC
 * Define los procedimientos públicos y el contexto del servidor
 */

import { initTRPC, TRPCError } from '@trpc/server';
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

/**
 * Procedure protegido (solo el propietario)
 *
 * Verifica la cabecera `x-analytics-key` contra la variable de entorno
 * ANALYTICS_SECRET. Sin cookies ni cuentas: la clave se guarda en el
 * localStorage del navegador del propietario y se envía en cada petición
 * tRPC. Se usa para el dashboard de analytics, cuyos datos son
 * confidenciales (uso interno, no expuestos al público).
 *
 * Fail-closed: si ANALYTICS_SECRET no está definida en el servidor, o la
 * clave no coincide, se deniega el acceso. Debe estar configurada en
 * .env.local (desarrollo) y en las variables de entorno de Vercel (producción).
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const secret = process.env.ANALYTICS_SECRET;
  const provided = ctx.req?.headers.get('x-analytics-key') ?? null;

  if (!secret || !provided || provided !== secret) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Acceso restringido al panel de analytics.',
    });
  }

  return next();
});
