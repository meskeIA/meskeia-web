# CHANGELOG - meskeIA Web

> ⚠️ **CONGELADO (2026-07-16)**: este changelog se mantuvo hasta febrero de 2026 y no
> registra los hitos posteriores (verticales Delegum/Cronicum/Stemum/Coquinum, MCP,
> analytics con rollup, +1.100 apps). Desde entonces la fuente del historial es
> **`git log`** — los mensajes de commit siguen la convención feat/fix/refactor/docs/chore.

Historial de cambios del proyecto meskeia-web hasta 2026-02 (entonces Next.js 16.0.3).

---

## [2.13.0] - 2026-02-06 - Auditoría de Seguridad

### Añadido
- **TypeScript estricto**: `ignoreBuildErrors: false` en `next.config.ts` (186 errores corregidos → 0)
- **Security headers HTTP**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **CSP report-only**: Content-Security-Policy-Report-Only (pendiente enforcement)
- **vercel.json**: Configuración de cabeceras de seguridad a nivel CDN (doble capa con next.config.ts)
- **DisclaimerCard**: Nueva variante `'technical'` (5 variantes totales)
- **NumberInput**: Nueva prop opcional `suffix?: string`

### Modificado
- **CORS restringido**: 8 API routes con origin `meskeia.com` (antes `*`)
- **Tipos custom**: `types/algebrite.d.ts`, `types/jstat.d.ts`, `types/sql-js.d.ts`, `lib/schema-dts.d.ts`

### Seguridad
- Analytics RGPD compliant (datos anonimizados en Turso)
- JSON-LD SEO schemas en apps profesionalizadas

---

## [2.12.0] - 2026-02-03 - Sistema LegalNotice

### Añadido
- **Componente #10**: Nuevo `LegalNotice` (Enlaces Legales + Copyright RGPD)
- Responsive completo: 1 línea PC, 2 líneas móvil
- Textos adaptativos: "Términos de Uso" → "Términos" en móvil
- Copyright automático con año actual (© 2026 meskeIA)

### Modificado
- **Footer**: Sin copyright (ahora en LegalNotice)
- **DisclaimerCard**: `showTermsLink={false}` como default (evita duplicación con LegalNotice)
- **220+ apps**: LegalNotice implementado en todas las apps
- **68 apps**: Migración LastUpdated → LegalNotice
- **7 apps**: Corrección variant="legal" → "financial"

### Mejorado
- Cumplimiento RGPD: enlaces legales siempre visibles
- Estructura estándar de página actualizada
- Checklist con validación de LegalNotice

---

## [2.11.0] - 2026-02-02 - DisclaimerCard Estandarizado

### Añadido
- **Componente #11**: `DisclaimerCard` (Avisos Legales Especializados)
- 4 variantes: `financial`, `medical`, `educational`, `general`
- 4 niveles de severidad: `critical`, `high`, `medium`, `low`
- Mantenimiento centralizado: cambios en 1 componente afectan 37+ apps

### Modificado
- **37 apps**: Migración masiva a DisclaimerCard estandarizado
- Protección legal mejorada en apps financieras, fiscales, seguros y salud

---

## [2.10.0] - 2026-01-19 - Accesibilidad A11Y

### Añadido
- **REGLA #12**: Estándares de Accesibilidad (basados en Vercel Web Interface Guidelines)
- Reglas ARIA obligatorias: `aria-label`, `aria-hidden`, `aria-live`
- Focus states con `:focus-visible` (evita ring al hacer clic)
- Formularios accesibles: `autocomplete`, `inputMode`, no bloquear paste
- Imágenes con dimensiones explícitas (`width`, `height`) para prevenir CLS
- Lazy loading (`loading="lazy"`) para imágenes below-fold
- Soporte teclado para elementos interactivos
- Animaciones respetuosas: `@media (prefers-reduced-motion: reduce)`

### Mejorado
- Checklist A11Y añadido al proceso de revisión

---

## [2.9.0] - 2025-12-19 - CLAUDE.md Global

### Modificado
- **UBICACIÓN GLOBAL**: CLAUDE.md movido a `~/.claude/CLAUDE.md`
- Se aplica automáticamente a TODOS los proyectos meskeIA
- No es necesario recordar instrucciones en cada sesión

---

## [2.8.0] - 2025-12-19 - Plan Estratégico + Analytics Mejorado

### Añadido
- **DOCUMENTO ESTRATÉGICO**: Plan de Mejora meskeIA 2025
- Nueva sección en CLAUDE.md: consulta obligatoria para features server-side
- Alertas automáticas para cambios que afecten privacidad

---

## [2.7.0] - 2025-12-18 - Vercel + Analytics v3.0

### Añadido
- **MIGRACIÓN HOSTING**: De Webempresa a Vercel (despliegue automático via GitHub)
- **Analytics v3.0**: Nueva arquitectura Turso (SQLite cloud) + API Routes
  - Base de datos: Turso (EU West - Irlanda, cumple RGPD)
  - API Routes: `/api/analytics/*` como Vercel Serverless Functions
  - Dashboard: `/dashboard-analytics` con Chart.js
  - Filtro IP para excluir pruebas de desarrollo

### Modificado
- Flujo de despliegue: `git push origin main` → deploy automático en ~60s
- Variables de entorno: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (Vercel Dashboard)
- Checklist: `git push` en lugar de subida manual FTP

---

## [2.6.0] - 2025-12-16 - RelatedApps Cross-Linking

### Añadido
- **Componente #9**: `RelatedApps` para cross-linking entre apps
- Sistema de relaciones en `data/app-relations.ts` (150+ apps mapeadas)
- Grid responsive: 4 columnas → 2 → 1
- Máximo 4 apps relacionadas mostradas

### Modificado
- **154+ apps**: Cross-linking activo

---

## [2.5.0] - 2025-12-09 - Videos Self-Hosted

### Añadido
- **Migración completa**: Next.js 16.0.3 + React 19 + TypeScript
- **Componentes reutilizables**: Logo, Footer, NumberInput, ResultCard, EducationalSection, TextToSpeech
- **Utilidades formato español**: `lib/formatters.ts` (9 funciones)
- **Subdomain desarrollo**: `next.meskeia.com` configurado
- **SEO bloqueado**: robots.txt en desarrollo
- **Analytics desactivado**: Solo activo en `meskeia.com`
- **Videos self-hosted**: Cursos con videos en `/videos/` (sin YouTube)

### Modificado
- **Convención nombres**: Prefijos estandarizados (`calculadora-`, `conversor-`, `generador-`, etc.)
- **Hero Section**: Instrucción explícita de color obligatorio (gradiente meskeIA)
- **Componente TextToSpeech**: Compatibilidad móvil mejorada

### Mejorado
- Checklist archivos auxiliares: `ai-index.json`, `implemented-apps.ts`

---

## [2.4.0] - 2025-12-08 - Video YouTube

### Añadido
- **Componente #8**: Botón Video YouTube para introducción a cursos
- Hero Section con enlace a video resumen (< 2 minutos)

---

## [1.5.0] - 2026-02-11 - Stack tRPC

### Añadido (Arquitectura)
- **Arquitectura híbrida**: tRPC + React Query para nuevas apps
- API Routes legacy mantenidas para apps existentes (220+)
- Documentación completa: cuándo usar tRPC vs API Routes

### Añadido (Código)
- `server/trpc.ts` - Configuración base tRPC
- `server/routers/_app.ts` - Router principal
- `server/routers/analytics.ts` - Router de analytics (ejemplo)
- `lib/trpc.ts` - Cliente tRPC para React
- `app/providers.tsx` - Wrapper React Query + tRPC
- `app/api/trpc/[trpc]/route.ts` - Handler Next.js para tRPC

### Modificado
- **dashboard-analytics**: Migrado a tRPC como prueba de concepto
- Reducción de código ~40% con React Query

---

## [1.4.0] - 2026-02-06 - Auditoría de Seguridad (Proyecto)

### Añadido
- Documentación Security Headers en CLAUDE.md proyecto
- Documentación CORS en CLAUDE.md proyecto
- Documentación RGPD Analytics en CLAUDE.md proyecto

---

## [1.3.1] - 2026-02-03 - Sincronización LegalNotice

### Modificado
- CLAUDE.md proyecto sincronizado con global v2.12.0 (Sistema LegalNotice)

---

## [1.3.0] - 2025-12-28 - Sección Guías

### Añadido
- **Sección Guías**: Landing pages para procesos de decisión
- **3 guías implementadas**: Comprar Casa, Freelance, Invertir
- Estructura estándar: Hero, Journey Steps, Caso de Estudio, Tools Grid, FAQ, CTA
- Configuración en `app/page.tsx` con array `guidesData`

---

## [1.2.0] - 2025-12-24 - Herramientas de Desarrollo

### Añadido
- **Plugins Claude Code**: code-review, audit, analyze-codebase, bug-detective, debugger
- **Testing Frontend**: Documentación Playwright MCP + Chrome Integration
- Recomendaciones de uso según contexto

---

## [1.1.0] - 2025-12-21 - Arquitectura Suites + Momentos

### Añadido
- **Sistema de clasificación bidimensional**:
  - **Suites temáticas (11)**: "¿Qué problema resuelve?"
  - **Momentos (7)**: "¿Cuándo lo usas?"
- Clasificación NO excluyente: apps pueden tener múltiples suites/momentos
- Archivos de datos: `data/suites.ts`, `data/applications.ts`

### Modificado
- Todas las apps DEBEN tener al menos 1 suite + 1 momento

---

## [1.0.0] - 2025-12-19 - Versión Inicial Proyecto

### Añadido
- CLAUDE.md específico del proyecto meskeia-web
- Complementa instrucciones globales en `~/.claude/CLAUDE.md`
- Ubicación repositorio, hosting Vercel, despliegue automático

---

## [Legacy HTML] - Hasta 2025-11-24 - DEPRECADO

### Deprecado
- **HTML vanilla**: Migración completa a Next.js 16.0.3
- **Ubicación backup**: `_legacy/CLAUDE-legacy-2025-11-25.md`
- **Uso**: Solo para proyectos HTML existentes (no para nuevas apps)

---

**Mantenido por**: Claude Code
**Proyecto**: meskeIA Web (https://meskeia.com)
**Stack**: Next.js 16.0.3 + React 19 + TypeScript + Vercel
**Última actualización**: 2026-02-16
