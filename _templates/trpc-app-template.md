# Template: Nueva App con tRPC

Este template muestra cómo crear una nueva app meskeIA que consume datos del servidor usando tRPC + React Query.

## Estructura de archivos a crear

```
meskeia-web/
├── server/routers/
│   └── ejemplo.ts              # ← Crear este archivo (Router tRPC)
├── app/mi-app/
│   ├── metadata.ts             # ← Metadata SEO
│   ├── page.tsx                # ← Componente React con hooks tRPC
│   └── MiApp.module.css        # ← Estilos
└── server/routers/_app.ts      # ← Modificar: Registrar nuevo router
```

---

## 1. Crear Router tRPC (server/routers/ejemplo.ts)

```typescript
/**
 * Router de Ejemplo para tRPC
 * Migra la lógica de /api/ejemplo/* a procedures type-safe
 */

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const ejemploRouter = router({
  /**
   * Query: Obtener lista de items
   * Reemplaza: GET /api/ejemplo/items
   */
  getItems: publicProcedure
    .input(
      z.object({
        categoria: z.string().optional(),
        limite: z.number().int().positive().default(10),
      })
    )
    .query(async ({ input }) => {
      const { categoria, limite } = input;

      // Tu lógica aquí
      // Ejemplo: consultar base de datos, API externa, etc.
      const items = await obtenerItemsDeDB(categoria, limite);

      return {
        status: 'success',
        data: items,
        total: items.length,
      };
    }),

  /**
   * Query: Obtener un item por ID
   * Reemplaza: GET /api/ejemplo/items/:id
   */
  getItemById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const item = await obtenerItemPorId(input.id);

      if (!item) {
        throw new Error('Item no encontrado');
      }

      return {
        status: 'success',
        data: item,
      };
    }),

  /**
   * Mutation: Crear nuevo item
   * Reemplaza: POST /api/ejemplo/items
   */
  createItem: publicProcedure
    .input(
      z.object({
        nombre: z.string().min(1, 'El nombre es requerido'),
        descripcion: z.string().optional(),
        valor: z.number().positive('El valor debe ser positivo'),
      })
    )
    .mutation(async ({ input }) => {
      const { nombre, descripcion, valor } = input;

      // Validación adicional si es necesaria
      if (valor > 1000) {
        throw new Error('El valor no puede ser mayor a 1000');
      }

      // Tu lógica de creación
      const nuevoItem = await crearItemEnDB(nombre, descripcion, valor);

      return {
        status: 'success',
        data: nuevoItem,
        message: 'Item creado correctamente',
      };
    }),

  /**
   * Mutation: Actualizar item existente
   * Reemplaza: PUT /api/ejemplo/items/:id
   */
  updateItem: publicProcedure
    .input(
      z.object({
        id: z.string(),
        nombre: z.string().min(1).optional(),
        valor: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      const itemActualizado = await actualizarItemEnDB(id, updates);

      return {
        status: 'success',
        data: itemActualizado,
      };
    }),

  /**
   * Mutation: Eliminar item
   * Reemplaza: DELETE /api/ejemplo/items/:id
   */
  deleteItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await eliminarItemDeDB(input.id);

      return {
        status: 'success',
        message: 'Item eliminado correctamente',
      };
    }),
});

// Funciones helper (implementar según tu caso)
async function obtenerItemsDeDB(categoria?: string, limite?: number) {
  // Tu implementación aquí
  return [];
}

async function obtenerItemPorId(id: string) {
  // Tu implementación aquí
  return null;
}

async function crearItemEnDB(nombre: string, descripcion?: string, valor?: number) {
  // Tu implementación aquí
  return { id: '1', nombre, descripcion, valor };
}

async function actualizarItemEnDB(id: string, updates: any) {
  // Tu implementación aquí
  return { id, ...updates };
}

async function eliminarItemDeDB(id: string) {
  // Tu implementación aquí
}
```

---

## 2. Registrar Router (server/routers/_app.ts)

```typescript
import { router } from '../trpc';
import { analyticsRouter } from './analytics';
import { ejemploRouter } from './ejemplo';  // ← Añadir import

export const appRouter = router({
  analytics: analyticsRouter,
  ejemplo: ejemploRouter,  // ← Registrar aquí
});

export type AppRouter = typeof appRouter;
```

---

## 3. Crear Metadata (app/mi-app/metadata.ts)

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi App - Título Descriptivo | meskeIA',
  description: 'Descripción de mi app (150-160 caracteres)',
  keywords: 'keyword1, keyword2, keyword3',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mi App - meskeIA',
    description: 'Descripción para redes sociales',
    url: 'https://meskeia.com/mi-app',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
};
```

---

## 4. Crear Componente React (app/mi-app/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import styles from './MiApp.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  ResultCard,
  RelatedApps,
  LegalNotice,
} from '@/components';
import { trpc } from '@/lib/trpc';
import { getRelatedApps } from '@/data/app-relations';

export default function MiAppPage() {
  const [categoria, setCategoria] = useState('');
  const [nombre, setNombre] = useState('');
  const [valor, setValor] = useState('');

  // Query: Obtener items (se ejecuta automáticamente)
  const {
    data: itemsData,
    isLoading,
    error,
    refetch,
  } = trpc.ejemplo.getItems.useQuery({
    categoria: categoria || undefined,
    limite: 20,
  });

  // Mutation: Crear item
  const createMutation = trpc.ejemplo.createItem.useMutation({
    onSuccess: () => {
      // Recargar la lista después de crear
      refetch();
      // Limpiar formulario
      setNombre('');
      setValor('');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Mutation: Eliminar item
  const deleteMutation = trpc.ejemplo.deleteItem.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate({
      nombre,
      descripcion: 'Descripción de ejemplo',
      valor: parseFloat(valor) || 0,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este item?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎯 Mi App con tRPC</h1>
        <p className={styles.subtitle}>
          Ejemplo de app que consume APIs con type-safety completo
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de Creación */}
        <div className={styles.inputPanel}>
          <h2>Crear Nuevo Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del item"
              required
            />
            <NumberInput
              value={valor}
              onChange={setValor}
              label="Valor"
              placeholder="100"
            />
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Creando...' : 'Crear Item'}
            </button>
          </form>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2>Lista de Items</h2>

          {isLoading && <p>Cargando items...</p>}

          {error && (
            <div className={styles.error}>
              Error: {error.message}
            </div>
          )}

          {itemsData && (
            <>
              <p>Total: {itemsData.total} items</p>
              <div className={styles.itemsList}>
                {itemsData.data.map((item: any) => (
                  <div key={item.id} className={styles.itemCard}>
                    <h3>{item.nombre}</h3>
                    <p>Valor: {item.valor}</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className={styles.btnDelete}
                      disabled={deleteMutation.isLoading}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('mi-app')} />
      <Footer appName="mi-app" />
    </div>
  );
}
```

---

## 5. Crear Estilos (app/mi-app/MiApp.module.css)

```css
.container {
  --primary: #2E86AB;
  --secondary: #48A9A6;
  --bg-primary: #FAFAFA;
  --bg-card: #FFFFFF;
  --text-primary: #1A1A1A;
  --border: #E5E5E5;
  --radius: 12px;

  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  background: var(--bg-primary);
  min-height: 100vh;
}

[data-theme='dark'] .container {
  --bg-primary: #1A1A1A;
  --bg-card: #2A2A2A;
  --text-primary: #E5E5E5;
  --border: #404040;
}

.hero {
  text-align: center;
  margin: 80px 0 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: var(--radius);
  color: white;
}

.mainContent {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.inputPanel,
.resultsPanel {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.btnPrimary {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btnPrimary:hover {
  background: #256a8a;
  transform: translateY(-2px);
}

.btnPrimary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  padding: 1rem;
  background: #fee;
  border: 1px solid #f88;
  border-radius: var(--radius);
  color: #c33;
}

@media (max-width: 1024px) {
  .mainContent {
    grid-template-columns: 1fr;
  }
}
```

---

## 6. Registrar en data/app-relations.ts

```typescript
// Añadir relaciones con otras apps
'mi-app': [
  { url: '/app-relacionada-1/', icon: '🔗', name: 'App 1', description: 'Descripción' },
  { url: '/app-relacionada-2/', icon: '⚡', name: 'App 2', description: 'Descripción' },
],
```

---

## 7. Verificar y Desplegar

```bash
# 1. Verificar que compila sin errores
npm run build

# 2. Commit y push
git add .
git commit -m "feat: Añadir mi-app con tRPC

Nueva app que consume APIs con type-safety completo usando tRPC + React Query.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main

# 3. Vercel desplegará automáticamente en ~60 segundos
```

---

## Notas Importantes

- **Type-Safety**: Los tipos se infieren automáticamente, no necesitas definirlos manualmente
- **Cache**: React Query cachea los resultados automáticamente (staleTime: 60s)
- **Validación**: Zod valida los inputs antes de llegar al servidor
- **Error Handling**: Los errores lanzados en procedures se capturan en `error` del hook
- **Mutations**: Usa `useMutation` para POST/PUT/DELETE (acciones que modifican datos)
- **Queries**: Usa `useQuery` para GET (obtener datos, se ejecutan automáticamente)

---

## Recursos

- Documentación tRPC: https://trpc.io/docs
- React Query: https://tanstack.com/query/latest
- Zod: https://zod.dev
- CLAUDE.md del proyecto: `c:\Users\jaceb\meskeia-web\CLAUDE.md`
