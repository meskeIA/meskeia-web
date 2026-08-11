---
name: trpc-meskeia
description: Criterio y plantilla para usar tRPC + React Query en meskeIA. Cuándo conviene frente a las API Routes legacy, dónde vive cada pieza y cómo arrancar un router nuevo. Invocar al crear o modificar una app que consuma datos del servidor.
---

# Stack tRPC + React Query en meskeIA

> Salió del CLAUDE.md del proyecto el 11/08/2026 (`/doctor`, check 4): es criterio de una tarea concreta, no una regla que deba estar cargada en todas las sesiones.

## Arquitectura híbrida

| Enfoque | Cuándo usar | Estado |
|---------|-------------|--------|
| **tRPC + React Query** | Nuevas apps que necesiten APIs | ✅ Recomendado |
| **API Routes (legacy)** | Apps existentes (220+) | ✅ Mantenido |

**Principio**: No migrar código legacy que funciona. Usar tRPC solo para nuevas apps.

## ¿Cuándo usar tRPC?

### ✅ Usar tRPC cuando:
- Creas una **nueva app** que necesita consumir datos del servidor
- La app necesita **múltiples queries** con estado complejo
- Quieres **type-safety end-to-end** (servidor → cliente)
- Necesitas **cache automático** y revalidación

### ❌ NO usar tRPC cuando:
- La app **NO consume APIs** (solo frontend)
- Es un **simple POST fire-and-forget** (ej: analytics tracking)
- Estás **modificando una app existente** con API Routes
- La app es **crítica** (ej: AnalyticsTracker)

## Dónde vive cada pieza

`server/trpc.ts` (configuración base) · `server/routers/_app.ts` (router principal) · `lib/trpc.ts` (cliente React) · `app/providers.tsx` (wrapper React Query) · `app/api/trpc/[trpc]/route.ts` (handler Next.js).

## Arrancar un router nuevo

```bash
cp templates/trpc-router.template.ts server/routers/mi-router.ts
# Editar y registrar en server/routers/_app.ts
```

La plantilla trae query (GET) y mutation (POST/PUT) con validación Zod, ejemplos de uso en cliente e instrucciones paso a paso.

## Ejemplo real en producción

`dashboard-analytics` se migró a tRPC como prueba de concepto (2026): funciona en producción protegido con `protectedProcedure` + clave `x-analytics-key`, con type-safety completo y ~40% menos código que la versión con API Routes + fetch.
