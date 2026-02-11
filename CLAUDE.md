# CLAUDE.md - Instrucciones específicas del proyecto meskeia-web

> **NOTA**: Este archivo complementa las instrucciones globales en `~/.claude/CLAUDE.md`
> Las reglas comunes (paleta meskeIA, TypeScript, formato español, etc.) están en el archivo global.

## Proyecto: meskeia-web

### Ubicación
- **Repositorio**: `C:\Users\jaceb\meskeia-web`
- **Hosting**: Vercel (meskeia.com)
- **Despliegue**: Automático via GitHub push a main

---

## Arquitectura de Clasificación: Suites + Momentos

meskeIA usa un sistema de clasificación bidimensional para organizar las apps:

### Suites Temáticas (11) - "¿Qué problema resuelve?"

Clasificación **NO excluyente**: una app puede pertenecer a múltiples suites.
Ordenadas alfabéticamente por nombre.

| ID | Suite | Icono | Descripción |
|----|-------|-------|-------------|
| `cultura` | Cultura General | 📚 | Conocimiento, referencias |
| `diseno` | Diseño y Desarrollo | 🎨 | Herramientas para diseñadores/devs |
| `estudiantes` | Estudiantes | 🧮 | Matemáticas, ciencias, estudio |
| `finanzas` | Finanzas e Inversión | 📈 | Ahorro, inversión, planificación |
| `freelance` | Freelance y Autónomo | 💼 | Herramientas para independientes |
| `tecnicas` | Herramientas Técnicas | 🔧 | Herramientas especializadas |
| `inmobiliaria` | Inmobiliaria y Hogar | 🏘️ | Hipotecas, alquiler, gestión hogar |
| `juegos` | Juegos y Ocio | 🎲 | Diversión y entretenimiento |
| `marketing` | Marketing y Contenido | 📢 | SEO, redes sociales, contenido |
| `productividad` | Productividad | ⚡ | Organización personal |
| `salud` | Salud y Bienestar | 🏥 | Salud, nutrición, mascotas |

### Momentos (7) - "¿Cuándo lo usas?"

Clasificación **NO excluyente**: una app puede aplicar a múltiples momentos.

| ID | Momento | Icono |
|----|---------|-------|
| `trabajo` | En el trabajo | 💼 |
| `estudio` | Estudiando | 🎓 |
| `casa` | En casa | 🏠 |
| `dinero` | Gestionando dinero | 💰 |
| `creando` | Creando contenido | 🎨 |
| `relax` | Tiempo libre | 🎮 |
| `curiosidad` | Por curiosidad | 🔍 |

### Archivos de datos

| Archivo | Descripción |
|---------|-------------|
| `data/suites.ts` | Definición de las 11 suites (id, name, icon, description) |
| `data/applications.ts` | Base de datos de apps (re-exporta suites y moments) |
| `data/implemented-apps.ts` | URLs de apps realmente implementadas |
| `data/app-relations.ts` | Cross-linking entre apps |
| `public/ai-index.json` | Índice para indexación por IAs |

---

## Sección Guías

Las Guías son **landing pages** que agrupan herramientas para un **proceso de decisión a corto-medio plazo** con implicaciones económicas/legales en España.

### Características de una Guía

- **Decisión concreta**: El usuario debe elegir entre alternativas (ej: ¿compro o alquilo?)
- **Journey claro**: Proceso con inicio y fin definidos
- **5-7 herramientas**: Apps meskeIA existentes que cubren el proceso
- **Audiencia amplia**: No nichos técnicos específicos

### Guías implementadas (3)

| Guía | URL | Herramientas | Descripción |
|------|-----|--------------|-------------|
| Comprar Casa | `/guia/comprar-casa/` | 5 | Hipoteca, gastos, alquiler vs compra |
| Freelance | `/guia/freelance/` | 3 | Tarifas, facturas, IVA |
| Invertir | `/guia/invertir/` | 4 | Perfil inversor, interés compuesto, cartera |

### Estructura de carpetas para Guías

```
app/guia/
├── comprar-casa/
│   ├── metadata.ts
│   ├── page.tsx
│   └── GuiaComprarCasa.module.css
├── freelance/
│   ├── metadata.ts
│   ├── page.tsx
│   └── GuiaFreelance.module.css
└── invertir/
    ├── metadata.ts
    ├── page.tsx
    └── GuiaInvertir.module.css
```

### Estructura estándar de una Guía (page.tsx)

Cada guía incluye:
1. **Hero Section**: Título, subtítulo, stats (herramientas, pasos, gratuito)
2. **Journey Steps**: 4 pasos del proceso con tips
3. **Caso de Estudio**: Ejemplo real con nombre, situación y conclusión
4. **Tools Grid**: Cards con enlaces a las herramientas
5. **FAQ Section**: 5 preguntas frecuentes colapsables
6. **Disclaimer**: Aviso legal (solo en guías financieras)
7. **CTA Section**: Llamada a la acción principal
8. **Cross-linking**: Enlaces a otras guías relacionadas
9. **RelatedApps + Footer**

### Configuración en app/page.tsx

Las guías se definen en el array `guidesData`:

```typescript
const guidesData = [
  {
    id: 'nombre-guia',
    name: 'Nombre Visible',
    icon: '🎯',
    description: 'Descripción breve',
    url: '/guia/nombre-guia/',
    toolsCount: 5,
    available: true,  // false = muestra "Próximamente"
  },
];
```

### Cuándo NO crear una Guía

- Contenido educativo sin decisión (usar Cursos)
- Audiencia muy técnica/nicho
- Sin herramientas meskeIA asociadas
- Proceso a muy largo plazo (ej: jubilación)
- Temas legalmente sensibles sin datos objetivos

---

## Reglas OBLIGATORIAS al crear nuevas apps

### 1. Cada app DEBE tener al menos una Suite

```typescript
// En data/applications.ts
{
  name: "Calculadora de IVA",
  suites: ['fiscal', 'freelance'],  // OBLIGATORIO: mínimo 1 suite
  contexts: ['trabajo', 'dinero'],   // OBLIGATORIO: mínimo 1 momento
  icon: "🧾",
  description: "...",
  url: "/calculadora-iva/",
  keywords: [...]
}
```

### 2. Cada app DEBE tener al menos un Momento (context)

El campo `contexts` indica cuándo el usuario típicamente usaría la app.

### 3. Checklist al crear nueva app

```
[ ] 1. Crear carpeta app/[nombre-app]/ con metadata.ts, page.tsx, .module.css
[ ] 2. Añadir entrada en data/applications.ts:
      - suites: SuiteType[] (OBLIGATORIO, mínimo 1)
      - contexts: MomentType[] (OBLIGATORIO, mínimo 1)
[ ] 3. Añadir URL en data/implemented-apps.ts
[ ] 4. Añadir relaciones en data/app-relations.ts
[ ] 5. Ejecutar npm run build (verificar que compila)
[ ] 6. Commit y push a GitHub
```

### 4. Ejemplo de app multi-suite

Una app puede resolver múltiples problemas:

```typescript
{
  name: "Simulador de Hipoteca",
  suites: ['inmobiliaria', 'finanzas'],  // Problema inmobiliario Y financiero
  contexts: ['dinero', 'casa'],           // Cuando gestionas dinero O en casa
  // ...
}
```

---

## Seguridad y Calidad del Código

### TypeScript Estricto (desde 2026-02-06)

- **`ignoreBuildErrors: false`** en `next.config.ts` - El build falla si hay errores TS
- **0 errores TypeScript** verificados en todo el proyecto (220+ apps)
- Archivos de tipos custom: `types/algebrite.d.ts`, `types/jstat.d.ts`, `types/sql-js.d.ts`, `lib/schema-dts.d.ts`

### Cabeceras de Seguridad HTTP (desde 2026-02-06)

Configuradas en **dos capas** (`next.config.ts` headers() + `vercel.json`):

| Cabecera | Valor | Protección |
|----------|-------|------------|
| `X-Frame-Options` | `DENY` | Anti-clickjacking |
| `X-Content-Type-Options` | `nosniff` | Anti-MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control de referrer |
| `X-XSS-Protection` | `1; mode=block` | XSS (legacy) |
| `Permissions-Policy` | camera, geolocation, payment... bloqueados | APIs innecesarias |
| `Content-Security-Policy-Report-Only` | CSP completo | CSP sin bloqueo (monitor) |

**PENDIENTE**: CSP en modo report-only. Tras verificar que no hay violaciones en consola (`[Report Only]`), cambiar a `Content-Security-Policy` (enforcement) en `next.config.ts` y `vercel.json`.

### CORS en API Routes (desde 2026-02-06)

Todas las API routes en `app/api/` tienen CORS restringido a `meskeia.com` (no `*`).

### RGPD Analytics (desde 2026-02-06)

- Analytics anonimizados (sin datos personales identificables)
- JSON-LD schema en metadata.ts de apps profesionalizadas

---

## Stack Tecnológico: tRPC + React Query (desde 2026-02-11)

### Arquitectura Híbrida

meskeIA usa una **estrategia híbrida** para APIs:

| Enfoque | Cuándo usar | Estado |
|---------|-------------|--------|
| **tRPC + React Query** | Nuevas apps que necesiten APIs | ✅ Recomendado |
| **API Routes (legacy)** | Apps existentes (220+) | ✅ Mantenido |

**Principio**: No migrar código legacy que funciona. Usar tRPC solo para nuevas apps.

---

### ¿Cuándo usar tRPC?

#### ✅ Usar tRPC cuando:
- Creas una **nueva app** que necesita consumir datos del servidor
- La app necesita **múltiples queries** con estado complejo
- Quieres **type-safety end-to-end** (servidor → cliente)
- La app tiene **formularios con validación** Zod
- Necesitas **cache automático** y revalidación (React Query)

#### ❌ NO usar tRPC cuando:
- La app **NO consume APIs** (solo frontend)
- Es un **simple POST fire-and-forget** sin respuesta (ej: analytics tracking)
- Estás **modificando una app existente** que ya usa API Routes (mantener consistencia)
- La app es **crítica** y afecta a 220+ apps (ej: AnalyticsTracker)

---

### Estructura de Archivos tRPC

```
meskeia-web/
├── server/
│   ├── trpc.ts                    # Configuración base tRPC
│   └── routers/
│       ├── _app.ts                # Router principal (combina todos)
│       ├── analytics.ts           # Router de analytics (ejemplo)
│       └── validaciones.ts        # Router de validaciones (futuro)
├── lib/
│   └── trpc.ts                    # Cliente tRPC para React
├── app/
│   ├── providers.tsx              # Wrapper React Query + tRPC
│   ├── layout.tsx                 # Incluye <Providers>
│   └── api/trpc/[trpc]/
│       └── route.ts               # Handler Next.js para tRPC
└── app/[tu-app]/
    └── page.tsx                   # Consume hooks tRPC
```

---

### Template: Nueva App con tRPC

#### 1. Crear Router (server/routers/ejemplo.ts)

```typescript
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const ejemploRouter = router({
  // Query (GET): Obtener datos
  getDatos: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limite: z.number().int().positive().default(10),
      })
    )
    .query(async ({ input }) => {
      const { id, limite } = input;

      // Tu lógica aquí (fetch DB, API externa, etc.)
      const datos = await obtenerDatos(id, limite);

      return {
        status: 'success',
        data: datos,
      };
    }),

  // Mutation (POST): Crear/actualizar datos
  crearDato: publicProcedure
    .input(
      z.object({
        nombre: z.string().min(1),
        valor: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { nombre, valor } = input;

      // Tu lógica aquí
      const resultado = await crearEnDB(nombre, valor);

      return {
        status: 'success',
        data: resultado,
      };
    }),
});
```

#### 2. Registrar Router (server/routers/_app.ts)

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

#### 3. Consumir en React (app/mi-app/page.tsx)

```typescript
'use client';

import { trpc } from '@/lib/trpc';
import { useState } from 'react';

export default function MiAppPage() {
  const [id, setId] = useState('123');

  // Query: Se ejecuta automáticamente, con cache
  const { data, isLoading, error } = trpc.ejemplo.getDatos.useQuery({
    id,
    limite: 20,
  });

  // Mutation: Se ejecuta manualmente
  const createMutation = trpc.ejemplo.crearDato.useMutation({
    onSuccess: () => {
      console.log('Creado con éxito');
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      nombre: 'Test',
      valor: 42,
    });
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Mis Datos</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={handleCreate}>Crear Nuevo</button>
    </div>
  );
}
```

---

### Ventajas de tRPC

1. **Type-Safety End-to-End**
   - Los tipos se infieren automáticamente desde el servidor
   - Autocompletado completo en el cliente
   - Errores de tipo en tiempo de desarrollo

2. **Menos Código Boilerplate**
   ```typescript
   // ❌ Antes (API Routes + fetch)
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   useEffect(() => {
     setLoading(true);
     fetch('/api/datos')
       .then(res => res.json())
       .then(setData)
       .catch(setError)
       .finally(() => setLoading(false));
   }, []);

   // ✅ Ahora (tRPC)
   const { data, isLoading, error } = trpc.datos.get.useQuery();
   ```

3. **Cache Automático**
   - React Query gestiona el cache (staleTime: 60s por defecto)
   - Revalidación automática cuando la ventana vuelve a tener foco
   - Invalidación manual con `utils.invalidate()`

4. **Validación con Zod**
   - Inputs validados automáticamente antes de llegar al servidor
   - Mensajes de error tipados y descriptivos

5. **Batching Automático**
   - Múltiples queries en paralelo se combinan en 1 request HTTP
   - Reduce latencia y mejora performance

---

### Decisiones Arquitectónicas

#### Por qué tRPC para nuevas apps

1. **Developer Experience**: Type-safety completo reduce bugs
2. **Performance**: Cache + batching automático
3. **Mantenibilidad**: Cambios en el servidor se reflejan automáticamente en cliente
4. **Validación**: Zod en ambos lados (cliente + servidor)
5. **Ecosistema**: React Query es estándar de la industria

#### Por qué mantener API Routes legacy

1. **Estabilidad**: 220+ apps funcionando correctamente
2. **Bajo riesgo**: No arriesgarse a romper código estable
3. **Pragmatismo**: "Si no está roto, no lo arregles"
4. **Compatibilidad**: Futuras apps pueden seguir usando API Routes si lo necesitan
5. **Coste/Beneficio**: Migrar 220+ apps requeriría semanas sin beneficio real

#### Estrategia a largo plazo

- **Corto plazo** (3-6 meses):
  - Nuevas apps con APIs → tRPC
  - Apps existentes → Mantener API Routes
  - No forzar migraciones

- **Medio plazo** (6-12 meses):
  - Si una app legacy necesita refactorización mayor → Considerar migrar a tRPC
  - Mantener ambos enfoques coexistiendo

- **Largo plazo** (12+ meses):
  - Evaluar si vale la pena migrar apps legacy más usadas
  - Decisión basada en métricas (uso, mantenimiento, bugs)

---

### Ejemplo Real: dashboard-analytics

El dashboard-analytics fue migrado a tRPC como **prueba de concepto**:

**Archivos modificados:**
- `server/routers/analytics.ts` - 3 procedures (getStats, getIPConfig, updateIPFilter)
- `app/dashboard-analytics/page.tsx` - Usa hooks tRPC en lugar de fetch()

**Resultado:**
- ✅ Build sin errores (434 páginas)
- ✅ Funcionando en producción (https://meskeia.com/dashboard-analytics)
- ✅ Type-safety completo
- ✅ Cache automático con React Query

**Lecciones aprendidas:**
- Turso result types requieren casts `any` temporales
- React Query reduce código en ~40%
- tRPC batching combina queries automáticamente

---

## Componentes disponibles

Ver `components/README.md` para documentación completa.

**Actualizaciones recientes (2026-02-06):**
- `DisclaimerCard` - Nueva variante `'technical'` disponible
- `NumberInput` - Nueva prop opcional `suffix?: string`

---

## Para instrucciones completas

Las instrucciones detalladas de desarrollo están en:
- **Global**: `~/.claude/CLAUDE.md` (aplicable a todos los proyectos meskeIA)
- **Componentes**: `components/README.md`
- **Estrategia**: `ESTRATEGIA-NUEVA-WEB-MESKEIA.md`

---

## Herramientas de Desarrollo

### Plugins de Claude Code Instalados

Plugins disponibles para mejorar el flujo de desarrollo:

| Plugin | Comando | Uso |
|--------|---------|-----|
| `code-review` | `/code-review` | Revisión de código antes de commits/PRs |
| `audit` | `/audit` | Auditoría de seguridad del codebase |
| `analyze-codebase` | `/analyze-codebase` | Análisis comprehensivo del proyecto |
| `bug-detective` | `/bug-detective` | Debugging sistemático paso a paso |
| `debugger` | `/debugger` | Especialista en errores y fallos de tests |

**Cuándo usar cada uno:**
- **Antes de PR importante**: `/code-review` + `/audit`
- **Error difícil de encontrar**: `/bug-detective`
- **Onboarding o documentación**: `/analyze-codebase`

### Testing de Frontend

**Opción 1: Playwright MCP** (automatizado)
- Configurado en `settings.local.json`
- Ideal para: Tests de regresión, CI/CD, scripts repetibles
- Herramientas: `mcp__playwright__browser_*`

**Opción 2: Chrome Integration** (interactivo)
- El usuario tiene Claude integrado en Chrome
- Ideal para: Validación visual rápida, debugging en tiempo real, demos
- Uso: Validar cambios de UI directamente en el navegador

**Recomendación**: Usar ambos según el contexto:
- Playwright para tests automatizados y verificaciones programáticas
- Chrome para validación visual interactiva cuando el usuario lo solicite

---

## Control de versiones de este documento

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.5.0 | 2026-02-11 | Stack tRPC: Nueva sección completa con arquitectura híbrida, templates, decisiones arquitectónicas |
| 1.4.0 | 2026-02-06 | Auditoría de seguridad: TS estricto, security headers, CORS, RGPD, SEO JSON-LD |
| 1.3.1 | 2026-02-03 | Sincronizado con CLAUDE.md global v2.12.0 (Sistema LegalNotice) |
| 1.3.0 | 2025-12-28 | Añadida sección Guías (5 guías implementadas) |
| 1.2.0 | 2025-12-24 | Añadidos plugins de Claude Code y documentación de testing |
| 1.1.0 | 2025-12-21 | Añadida arquitectura Suites + Momentos |
| 1.0.0 | 2025-12-19 | Versión inicial |
