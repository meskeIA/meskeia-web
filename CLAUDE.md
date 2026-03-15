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
| `data/suites.ts` | Definición de las 11 suites |
| `data/applications.ts` | Base de datos de apps |
| `data/implemented-apps.ts` | URLs de apps implementadas |
| `data/app-relations.ts` | Cross-linking entre apps |
| `public/ai-index.json` | Índice para indexación por IAs |
| `data/fiscal/` | **Datos normativos centralizados** (ver tabla abajo) |

### Módulos de datos fiscales (`data/fiscal/`)

Repositorio centralizado de datos normativos para la Suite Legal-Fiscal. Cada módulo incluye metadatos de versión, fuente oficial y fecha de verificación.

| Módulo | Contenido |
|--------|-----------|
| `data/fiscal/irpf.ts` | Tramos IRPF, mínimos personales y familiares 2025 |
| `data/fiscal/autonomos.ts` | Tramos RETA, tipo cotización, bonificaciones 2025 |
| `data/fiscal/inmuebles.ts` | ITP/AJD por CCAA, IVA obra nueva, coeficientes IIVTNU 2025, plusvalías IRPF |
| `data/fiscal/intereses.ts` | Tipos de demora comercial (Ley 3/2004) por semestre, interés legal, interés tributario |
| `data/fiscal/sucesiones.ts` | Tarifas ISD por CCAA, grupos, bonificaciones |
| `data/fiscal/donaciones.ts` | Tarifas impuesto donaciones por CCAA |
| `data/fiscal/sociedades.ts` | Tipos IS, regímenes especiales |

### ⚠️ Regla obligatoria para apps Legal-Fiscal

**ANTES de hardcodear cualquier dato normativo** (tipos impositivos, coeficientes, tramos, tipos de interés, plazos legales), revisar si ya existe en `data/fiscal/`.

```typescript
// ✅ CORRECTO — importar desde data/fiscal/
import { COEFICIENTES_IIVTNU_2025, TIPOS_DEMORA_COMERCIAL } from '@/data/fiscal';

// ❌ INCORRECTO — hardcodear en el componente
const coeficientes = [{ anios: 1, coef: 0.13 }, ...];
```

Cuando los datos no existan aún, **crear el módulo correspondiente** en `data/fiscal/` con metadatos de versión, y luego importarlo desde la app. Nunca inline.

---

## Sección Guías

Las Guías son **landing pages** que agrupan herramientas para un **proceso de decisión a corto-medio plazo** con implicaciones económicas/legales en España.

### Características de una Guía

- **Decisión concreta**: El usuario debe elegir entre alternativas
- **Journey claro**: Proceso con inicio y fin definidos
- **5-7 herramientas**: Apps meskeIA existentes que cubren el proceso
- **Audiencia amplia**: No nichos técnicos específicos

### Guías implementadas (3)

| Guía | URL | Herramientas |
|------|-----|--------------|
| Comprar Casa | `/guia/comprar-casa/` | 5 |
| Freelance | `/guia/freelance/` | 3 |
| Invertir | `/guia/invertir/` | 4 |

**Ver**: `app/guia/*/` para ejemplos completos

---

## Reglas OBLIGATORIAS al crear nuevas apps

### 1. Cada app DEBE tener al menos una Suite

```typescript
// En data/applications.ts
{
  name: "Calculadora de IVA",
  suites: ['freelance', 'tecnicas'],  // OBLIGATORIO: mínimo 1
  contexts: ['trabajo', 'dinero'],     // OBLIGATORIO: mínimo 1
  icon: "🧾",
  // ...
}
```

### 2. Checklist al crear nueva app

```
[ ] 1. Crear carpeta app/[nombre-app]/ (usar template: templates/app-base/)
[ ] 2. Añadir entrada en data/applications.ts (suites + contexts)
[ ] 3. Añadir URL en data/implemented-apps.ts
[ ] 4. Añadir relaciones en data/app-relations.ts
[ ] 5. Actualizar public/ai-index.json
[ ] 6. Ejecutar npm run build
[ ] 7. Commit y push a GitHub
```

---

## Stack Tecnológico: tRPC + React Query

### Arquitectura Híbrida

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
- Necesitas **cache automático** y revalidación

#### ❌ NO usar tRPC cuando:
- La app **NO consume APIs** (solo frontend)
- Es un **simple POST fire-and-forget** (ej: analytics tracking)
- Estás **modificando una app existente** con API Routes
- La app es **crítica** (ej: AnalyticsTracker)

---

### Estructura de Archivos tRPC

```
meskeia-web/
├── server/
│   ├── trpc.ts                    # Configuración base
│   └── routers/
│       ├── _app.ts                # Router principal
│       └── analytics.ts           # Ejemplo
├── lib/
│   └── trpc.ts                    # Cliente React
├── app/
│   ├── providers.tsx              # Wrapper React Query
│   └── api/trpc/[trpc]/route.ts   # Handler Next.js
```

---

### Template tRPC

**Ver**: `templates/trpc-router.template.ts` para plantilla completa con:
- Query (GET) con validación Zod
- Mutation (POST/PUT) con validación
- Ejemplos de uso en cliente
- Instrucciones paso a paso

**Uso**:
```bash
cp templates/trpc-router.template.ts server/routers/mi-router.ts
# Editar y registrar en server/routers/_app.ts
```

---

### Ventajas de tRPC

1. **Type-Safety End-to-End**: Tipos inferidos automáticamente
2. **Menos Boilerplate**: ~40% menos código que API Routes + fetch
3. **Cache Automático**: React Query gestiona el cache
4. **Validación**: Zod en cliente + servidor
5. **Batching**: Múltiples queries en 1 HTTP request

---

### Ejemplo Real: dashboard-analytics

**Migrado a tRPC** como prueba de concepto:
- ✅ Build sin errores (434 páginas)
- ✅ Funcionando en producción
- ✅ Type-safety completo
- ✅ Reducción código ~40%

---

## Seguridad y Calidad del Código

### TypeScript Estricto (desde 2026-02-06)

- `ignoreBuildErrors: false` en `next.config.ts`
- 0 errores TypeScript en todo el proyecto
- Archivos de tipos custom en `types/`

### Cabeceras de Seguridad HTTP

Configuradas en **dos capas** (`next.config.ts` + `vercel.json`):

| Cabecera | Protección |
|----------|------------|
| `X-Frame-Options: DENY` | Anti-clickjacking |
| `X-Content-Type-Options: nosniff` | Anti-MIME sniffing |
| `Referrer-Policy` | Control de referrer |
| `Permissions-Policy` | Bloquear APIs innecesarias |
| `CSP-Report-Only` | Monitor CSP (pendiente enforcement) |

**PENDIENTE**: Cambiar CSP de report-only a enforcement tras verificar sin violaciones.

### CORS en API Routes

Todas las API routes restringidas a `meskeia.com` (no `*`).

---

## Flujo de Despliegue (Vercel + GitHub)

### Hosting
- **Producción**: `meskeia.com` (Vercel)
- **Repositorio**: GitHub → meskeIA/meskeia-web
- **Despliegue**: Automático (push a `main` → deploy en ~60s)

### Proceso

```bash
# 1. Verificar build
npm run build

# 2. Commit
git add .
git commit -m "feat: descripción del cambio"

# 3. Push (Vercel despliega automáticamente)
git push origin main
```

### Variables de Entorno (Vercel Dashboard)

- `TURSO_DATABASE_URL` - Base de datos Turso
- `TURSO_AUTH_TOKEN` - Token autenticación

### API Routes (Serverless Functions)

- `/api/analytics/track` - Registrar uso
- `/api/analytics/stats` - Obtener estadísticas
- `/api/analytics/duration` - Actualizar duración
- `/api/analytics/ip-filter` - Gestionar IP excluida

---

## Archivos Auxiliares (Actualizar al crear apps)

### Automáticos (Next.js los genera)
- `sitemap.xml` - Desde `app/sitemap.ts`
- `robots.txt` - Desde `app/robots.ts`

### Manuales (actualizar siempre)
- `data/applications.ts` - Añadir app con suites + contexts
- `data/implemented-apps.ts` - Añadir URL
- `data/app-relations.ts` - Añadir relaciones
- `public/ai-index.json` - Incrementar total, añadir entrada

---

## Herramientas de Desarrollo

### Plugins de Claude Code

| Plugin | Comando | Uso |
|--------|---------|-----|
| `code-review` | `/code-review` | Revisión antes de commits |
| `audit` | `/audit` | Auditoría de seguridad |
| `analyze-codebase` | `/analyze-codebase` | Análisis completo |
| `bug-detective` | `/bug-detective` | Debugging paso a paso |

### Testing de Frontend

- **Playwright MCP**: Tests automatizados (settings.local.json)
- **Chrome Integration**: Validación visual interactiva

---

## Para instrucciones completas

- **Global**: `~/.claude/CLAUDE.md` (reglas universales)
- **Componentes**: `components/README.md`
- **Templates**: `templates/README.md`
- **CHANGELOG**: `CHANGELOG.md` (historial completo)

---

## Control de versiones

**Versión actual**: 1.5.0 (2026-02-11) - Stack tRPC

**Ver historial completo**: `CHANGELOG.md`

---

**Última actualización**: 2026-02-16
**Proyecto**: meskeIA Web (https://meskeia.com)
