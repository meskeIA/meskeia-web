import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

/**
 * Template de Router tRPC para meskeIA
 *
 * INSTRUCCIONES:
 * 1. Renombrar archivo a: [nombre-feature].ts
 * 2. Renombrar router: ejemploRouter → [nombre]Router
 * 3. Implementar lógica de negocio en procedures
 * 4. Registrar en server/routers/_app.ts
 * 5. Consumir en app con: trpc.[nombre].useQuery() o useMutation()
 */

export const ejemploRouter = router({
  /**
   * QUERY: Obtener datos (GET)
   * - Se ejecuta automáticamente en el cliente
   * - Con cache automático (React Query)
   * - Revalidación automática
   */
  getDatos: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limite: z.number().int().positive().default(10),
      })
    )
    .query(async ({ input }) => {
      const { id, limite } = input;

      // TODO: Implementar lógica de negocio
      // Ejemplos:
      // - const datos = await tursoClient.execute('SELECT ...');
      // - const datos = await fetch('https://api.externa.com/...').then(r => r.json());
      // - const datos = await calcularAlgo(id);

      return {
        status: 'success' as const,
        data: {
          id,
          items: [], // Tu array de datos
          total: 0,
        },
      };
    }),

  /**
   * MUTATION: Crear/actualizar datos (POST)
   * - Se ejecuta manualmente en el cliente
   * - Con callbacks onSuccess/onError
   */
  crearDato: publicProcedure
    .input(
      z.object({
        nombre: z.string().min(1, 'El nombre es obligatorio'),
        valor: z.number(),
        opcional: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { nombre, valor, opcional } = input;

      // TODO: Implementar lógica de creación
      // Ejemplos:
      // - await tursoClient.execute('INSERT INTO ...');
      // - await fetch('POST', data);
      // - await procesarDatos(input);

      return {
        status: 'success' as const,
        message: 'Dato creado correctamente',
        data: {
          id: 'nuevo-id',
          nombre,
          valor,
        },
      };
    }),

  /**
   * MUTATION: Actualizar dato existente
   */
  actualizarDato: publicProcedure
    .input(
      z.object({
        id: z.string(),
        cambios: z.object({
          nombre: z.string().optional(),
          valor: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { id, cambios } = input;

      // TODO: Implementar lógica de actualización

      return {
        status: 'success' as const,
        message: 'Dato actualizado correctamente',
        data: {
          id,
          ...cambios,
        },
      };
    }),
});

/**
 * EJEMPLO DE USO EN CLIENTE (app/mi-app/page.tsx):
 *
 * 'use client';
 *
 * import { trpc } from '@/lib/trpc';
 *
 * export default function MiAppPage() {
 *   // Query automática con cache
 *   const { data, isLoading, error } = trpc.ejemplo.getDatos.useQuery({
 *     id: '123',
 *     limite: 20,
 *   });
 *
 *   // Mutation manual
 *   const createMutation = trpc.ejemplo.crearDato.useMutation({
 *     onSuccess: (data) => {
 *       console.log('Creado:', data);
 *     },
 *     onError: (error) => {
 *       console.error('Error:', error.message);
 *     },
 *   });
 *
 *   const handleCreate = () => {
 *     createMutation.mutate({
 *       nombre: 'Test',
 *       valor: 42,
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       {isLoading && <p>Cargando...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *       {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
 *       <button onClick={handleCreate}>Crear</button>
 *     </div>
 *   );
 * }
 */
