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
| `data/fiscal/pensiones.ts` | Datos SS jubilación: porcentajes por años, pensión máx/mín, coeficientes anticipada 2025 |
| `data/fiscal/dependencia.ts` | Prestaciones SAAD, copago, cotización SS cuidadores, deducciones IRPF discapacidad, escala Zarit |
| `data/fiscal/maternidad.ts` | Permiso nacimiento (16 sem), prestación SS, deducción maternidad IRPF, gastos bebé, estilos parentales |

### ⚠️ Regla obligatoria para apps Legal-Fiscal y Jubilación

**ANTES de hardcodear cualquier dato normativo** (tipos impositivos, coeficientes, tramos, tipos de interés, plazos legales, datos de Seguridad Social), revisar si ya existe en `data/fiscal/`.

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

## Política de Disclaimers (OBLIGATORIO)

**Documento completo**: `DISCLAIMER-POLICY.md` — leer SIEMPRE antes de crear una app.

### Resumen ejecutivo

Cada app tiene un **nivel de riesgo** que determina el disclaimer obligatorio:

| Nivel | Cuándo | Colapsable | Severidad |
|-------|--------|:----------:|:---------:|
| **1 CRÍTICO** | Fiscal, herencias, hipotecas, orientación médica clínica | ❌ Nunca | `critical` |
| **2 ALTO** | Financiero general, salud/hábitos, autónomos sin fiscal | ❌ Nunca | `high` |
| **3 MEDIO** | Planificadores cotidianos, productividad | ✅ sessionStorage | `medium` |
| **4 INFORMATIVO** | Educativo puro, quizzes, generadores | ✅ localStorage | `low` |

### Regla fiscal — CRÍTICA

> **Cualquier componente fiscal** (IRPF, IVA, IS, plusvalías, retenciones, cuotas SS...) → **Nivel 1 CRÍTICO** obligatorio.

### Regla multi-suite

> Cuando una app pertenece a varias suites → aplicar siempre el **nivel más alto**.

### Componente DataReference (nuevo)

Apps con datos normativos con fecha de caducidad (tipos fiscales, tramos, intereses...) deben incluir `<DataReference>` inmediatamente después del `<DisclaimerCard>`:

```tsx
import DataReference from '@/components/DataReference';
import { FISCAL_IRPF_META } from '@/data/fiscal';

<DisclaimerCard variant="financial" severity="critical" />
<DataReference
  normativa="IRPF 2025"
  fuente={FISCAL_IRPF_META.fuente}
  verificado={FISCAL_IRPF_META.verificado}
  urlOficial={FISCAL_IRPF_META.urlOficial}
/>
```

**Nivel por defecto de cada suite** → ver tabla completa en `DISCLAIMER-POLICY.md`.

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

### 2. Ciclo de creación de nueva app (2 fases obligatorias)

Las nuevas apps se crean **siempre en dos fases**. La fase 2 es inmediata, no opcional.

**Fase 1 — App funcional** (skill `/nueva-app-meskeia`):
```
[ ] 1. Crear carpeta app/[nombre-app]/ (usar template: templates/app-base/)
[ ] 2. Añadir entrada en data/applications.ts (suites + contexts)
[ ] 3. Añadir URL en data/implemented-apps.ts
[ ] 4. Añadir relaciones en data/app-relations.ts
[ ] 5. Actualizar public/ai-index.json
[ ] 6. Incluir <EducationalSection> con bloque educativo básico en page.tsx
[ ] 7. Ejecutar npm run build (exit code 0)
```

**Fase 2 — Profesionalización v2.0** (inmediatamente después del build):
```
[ ] 8. Enriquecer el bloque educativo básico existente con el patrón v2.0 completo
[ ] 9. Verificar clase .warningBox en CSS Module (indicador de v2.0 completo)
[ ] 10. Build final, commit y push a GitHub
```

**Excepción**: Cursos (`/curso-*`) y Guías (`/guia/*`) están excluidos del patrón v2.0 por tener estructura propia. Juegos y ocio → patrón lite (ver `PROFESIONALIZACION.md`).

**Instrucciones técnicas completas del patrón v2.0**: `PROFESIONALIZACION.md`

### 3. Creación de múltiples apps en paralelo (agentes)

Cuando se crean **3 o más apps** en una misma sesión, usar agentes en paralelo para maximizar velocidad. Reglas OBLIGATORIAS:

**Fase secuencial ANTES (archivos compartidos):**
```
1. Crear/actualizar data/fiscal/*.ts si se necesitan datos normativos
2. Actualizar data/fiscal/index.ts con el nuevo export
3. Verificar que compila: npx tsc --noEmit data/fiscal/index.ts
```

**Fase paralela (agentes crean apps):**

Cada agente DEBE incluir estas instrucciones EXACTAS en su prompt:

```
## REGLAS CRÍTICAS PARA ESTE AGENTE
- ✅ Crea SOLO los 3 archivos de tu app (metadata.ts, page.tsx, .module.css)
- ✅ Puedes ejecutar `npx tsc --noEmit` UNA SOLA VEZ para verificar
- ❌ PROHIBIDO: ejecutar `npm run build` (conflicto de lock entre agentes)
- ❌ PROHIBIDO: modificar archivos compartidos (applications.ts, implemented-apps.ts, app-relations.ts, ai-index.json)
- ❌ PROHIBIDO: ejecutar `npx tsc --noEmit` más de una vez
- ❌ PROHIBIDO: reintentar comandos fallidos en bucle (sleep + retry)
- ❌ PROHIBIDO: ejecutar comandos en background (run_in_background)
- ⚠️ TERMINAR INMEDIATAMENTE después de crear los archivos y verificar TS una vez
- ⚠️ Si tsc falla, reportar el error y TERMINAR — no reintentar
- ⚠️ No usar JSX.Element ni React.JSX.Element como tipo de retorno (causa error TS)
```

**Fase secuencial DESPUÉS (registros + build):**
```
1. Actualizar data/applications.ts (añadir todas las apps nuevas)
2. Actualizar data/implemented-apps.ts (añadir URLs)
3. Actualizar data/app-relations.ts (añadir relaciones)
4. Actualizar public/ai-index.json (incrementar total, añadir entradas)
5. npm run build (una sola vez, verificar 0 errores)
6. Corregir errores si los hay (CSS: no usar `*` puro, TS: no usar JSX.Element)
7. Commit + push
```

**Razón**: Los agentes que no terminan limpiamente producen procesos zombie, locks de build, reintentos en cadena y docenas de notificaciones residuales. La clave es que cada agente cree sus archivos, verifique UNA vez, y termine inmediatamente.

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

## Disciplina de Build (OBLIGATORIO)

### Regla de UN solo build

**NUNCA** lanzar más de un `npm run build` simultáneamente. Un build duplicado crea un lock en `.next/lock` que bloquea todos los builds posteriores y genera cadenas de reintentos innecesarios.

### Protocolo correcto

```bash
# UN solo build, con timeout de 10 minutos (600000ms)
npm run build  # timeout: 600000

# Si falla → diagnosticar error → corregir → UN solo rebuild
# Si el build se queda "colgado" → verificar si .next/lock existe sin proceso node activo
```

### Reglas estrictas

1. **Timeout de 10 minutos** (600000ms) para `npm run build`. El proyecto tiene 360+ páginas y en equipos con recursos limitados puede tardar 5-8 minutos. NO asumir que ha fallado antes de ese tiempo.
2. **NUNCA lanzar builds en paralelo** — ni siquiera `npx tsc --noEmit` mientras un build está corriendo.
3. **NUNCA reintentar un build sin verificar primero** que el anterior ha terminado (comprobar si `.next/lock` existe).
4. **Si hay lock stale** (lock existe pero no hay proceso `next build` activo): eliminar con `rm -f .next/lock` y ENTONCES hacer UN solo build.
5. **No usar `run_in_background`** para builds — ejecutar siempre en foreground con timeout de 600000ms para poder ver el resultado directamente.

---

## Flujo de Despliegue (Vercel + GitHub)

### Hosting
- **Producción**: `meskeia.com` (Vercel)
- **Repositorio**: GitHub → meskeIA/meskeia-web
- **Despliegue**: Automático (push a `main` → deploy en ~60s)

### Proceso

```bash
# 1. Verificar build (timeout 10 min)
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
- **Disclaimers**: `DISCLAIMER-POLICY.md` (política completa — niveles, textos, colapsabilidad)
- **Componentes**: `components/README.md`
- **Templates**: `templates/README.md`
- **CHANGELOG**: `CHANGELOG.md` (historial completo)

---

## Control de versiones

**Versión actual**: 1.6.0 (2026-03-19) - Política de Disclaimers

**Ver historial completo**: `CHANGELOG.md`

---

**Última actualización**: 2026-03-19
**Proyecto**: meskeIA Web (https://meskeia.com)
