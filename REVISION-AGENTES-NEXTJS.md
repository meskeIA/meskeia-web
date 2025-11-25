# 📋 REVISIÓN DE AGENTES - Migración a Next.js

**Fecha:** 2025-11-25
**Contexto:** Actualización de sistema de agentes de HTML/CSS/JS a Next.js 16.0.3 + React + TypeScript
**Total de agentes analizados:** 21 agentes

---

## 🎯 OBJETIVO DE LA REVISIÓN

Identificar qué agentes del sistema actual (HTML-based) son:
1. **OBSOLETOS** → Mover a `_legacy/agentes/`
2. **ACTUALIZABLES** → Reescribir para Next.js
3. **VÁLIDOS** → Mantener sin cambios (independientes de framework)

---

## 📊 ANÁLISIS POR CATEGORÍA

### 1️⃣ DISEÑO Y UI (4 agentes)

#### ❌ OBSOLETO: `meskeia_design_agent.py`
- **Razón**: Aplica CSS inline, now we use CSS Modules + globals.css
- **Estado actual**: Variables CSS ya definidas en `app/globals.css`
- **Acción**: Mover a `_legacy/` - Ya no se necesita aplicar paleta manualmente

#### ❌ OBSOLETO: `logo-footer-favicon.py`
- **Razón**: Inyecta HTML inline de 50+ líneas, now we use `<MeskeiaLogo />` y `<Footer />`
- **Estado actual**: Componentes creados en `components/`
- **Acción**: Mover a `_legacy/` - Reemplazado completamente por componentes React

#### ❌ OBSOLETO: `estructura_html_standard.txt`
- **Razón**: Template HTML5, now we use Next.js structure (metadata.ts + page.tsx)
- **Estado actual**: CLAUDE.md REGLA #8 define estructura Next.js
- **Acción**: Mover a `_legacy/` - Estructura completamente diferente en Next.js

#### ✅ ACTUALIZABLE: `chartjs_personalizado.txt`
- **Razón**: Chart.js es independiente del framework, solo cambiar implementación
- **Cambios necesarios**:
  - Importar Chart.js en componente React con `useEffect`
  - Usar `useRef` para canvas
  - Mantener paleta de colores meskeIA
- **Acción**: Crear versión Next.js en `fase-1-core/agentes/chartjs_nextjs.txt`

---

### 2️⃣ LOCALIZACIÓN Y FORMATOS (2 agentes)

#### ✅ ACTUALIZABLE: `localization_agent_universal.txt`
- **Razón**: Principios son válidos, pero implementación cambia
- **Cambios necesarios**:
  - Referenciar `lib/formatters.ts` en lugar de código inline
  - Añadir ejemplos con componentes React
  - Mantener principios de formato español
- **Acción**: Actualizar para referenciar utilidades en lugar de código inline

#### ✅ VÁLIDO: `api_keys_seguras.txt`
- **Razón**: Independiente de framework, principios son iguales
- **Cambios menores**:
  - Añadir referencia a `.env.local` (Next.js convention)
  - Mencionar `NEXT_PUBLIC_` prefix para variables cliente
- **Acción**: Actualización menor, mantener en `fase-1-core/agentes/`

---

### 3️⃣ FUNCIONALIDAD WEB (3 agentes)

#### ❌ OBSOLETO: `pwa_manifest.txt`
- **Razón**: Next.js usa `next-pwa` plugin, no manifest.json manual
- **Cambios necesarios**:
  - Reescribir completamente para next-pwa
  - Configuración en `next.config.ts`
  - Service Worker automático
- **Acción**: Crear versión Next.js o mover a `_legacy/` (PWA no es prioridad ahora)

#### ❌ OBSOLETO: `localstorage_patterns.txt`
- **Razón**: Patrones en vanilla JS, en React usamos hooks personalizados
- **Cambios necesarios**:
  - Crear `useLocalStorage` hook
  - Implementar con `useState` + `useEffect`
  - SSR-safe (verificar `typeof window !== 'undefined'`)
- **Acción**: Crear versión Next.js con custom hooks

#### ✅ ACTUALIZABLE: `seo_completo.txt`
- **Razón**: SEO sigue siendo importante, pero implementación cambia radicalmente
- **Cambios necesarios**:
  - Usar `metadata.ts` en lugar de meta tags HTML
  - `generateMetadata()` function
  - Structured data con `script type="application/ld+json"`
  - Mantener principios de SEO
- **Acción**: Reescribir completamente para Next.js App Router

---

### 4️⃣ BACKEND Y DATOS (3 agentes)

#### ✅ VÁLIDO: `flask_setup.txt`
- **Razón**: Backend Flask es independiente de frontend
- **Nota**: meskeIA v2.0 usa Next.js con SSG (sin backend), pero Flask sigue siendo válido para XElements
- **Acción**: Mantener sin cambios en `fase-1-core/agentes/`

#### ⚪ NO APLICABLE: `agente_importacion_datos.txt`
- **Razón**: En backup, rara vez usado
- **Acción**: Mantener en `backup/` sin cambios

#### ⚪ NO APLICABLE: `deployment_build.txt`
- **Razón**: En backup, deployment de Next.js es diferente (Vercel/Netlify)
- **Cambios necesarios (si se reactiva)**:
  - `npm run build` en lugar de minificación manual
  - `npm run export` para SSG
  - Configuración de Vercel/Netlify
- **Acción**: Mantener en `backup/` hasta que se necesite

---

### 5️⃣ TESTING Y CALIDAD (5 agentes)

#### ✅ VÁLIDO: `qa_testing_automatico.txt`
- **Razón**: Playwright MCP es independiente del framework frontend
- **Cambios menores**:
  - Actualizar selectores si cambió estructura HTML de componentes
  - Añadir tests para componentes React interactivos
- **Acción**: Mantener con actualización menor de ejemplos

#### ✅ VÁLIDO: `qa_tester_playwright.py`
- **Razón**: Script Python ejecutable independiente
- **Acción**: Mantener sin cambios en raíz

#### ✅ VÁLIDO: `qa_tester_examples.py`
- **Razón**: Ejemplos ejecutables independientes
- **Acción**: Mantener sin cambios en raíz

#### ⚪ NO APLICABLE: `testing_validacion.txt`
- **Razón**: En backup, redundante con qa_testing_automatico
- **Acción**: Mantener en `backup/`

#### ⚪ NO APLICABLE: `agente_validacion_final.txt`
- **Razón**: En backup, solapado con testing_validacion
- **Acción**: Mantener en `backup/`

---

### 6️⃣ ANALYTICS Y MONITOREO (2 agentes)

#### ✅ ACTUALIZABLE: `analytics_avanzado.txt`
- **Razón**: Google Analytics 4 sigue siendo válido, pero implementación cambia
- **Cambios necesarios**:
  - Usar componente `<AnalyticsTracker />` (ya existe)
  - Implementar con `useEffect` en lugar de script inline
  - `next/script` component para carga optimizada
- **Acción**: Actualizar para referenciar componente existente

#### ⚪ NO APLICABLE: `meta_verificador_agentes.txt`
- **Razón**: En backup, uso ocasional
- **Cambios necesarios (si se reactiva)**:
  - Actualizar checklist para verificar componentes React en lugar de HTML inline
  - Verificar estructura Next.js (metadata.ts, page.tsx, .module.css)
- **Acción**: Mantener en `backup/` hasta que se necesite

---

### 7️⃣ SEGURIDAD Y VALIDACIÓN (Nuevos - Nov 2025)

#### ✅ VÁLIDO: `detector_api_keys_hardcodeadas.py`
- **Razón**: Script Python ejecutable independiente del framework
- **Acción**: Mantener sin cambios en `fase-2-inteligencia/`

---

### 8️⃣ AUTOMATIZACIÓN Y META-AGENTES (Nov 2025)

#### ✅ VÁLIDO: `generador_agentes.py`
- **Razón**: Meta-agente independiente del framework frontend
- **Acción**: Mantener sin cambios en `fase-2-inteligencia/`

#### ✅ VÁLIDO: Sistema de Automatización Git Hook
- **Razón**: Git hooks independientes del framework
- **Acción**: Mantener sin cambios

---

## 📈 RESUMEN EJECUTIVO

### Estadísticas de Revisión:

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| ❌ OBSOLETOS | 4 | 19% |
| ✅ ACTUALIZABLES | 6 | 29% |
| ✅ VÁLIDOS | 6 | 29% |
| ⚪ NO APLICABLES | 5 | 23% |
| **TOTAL** | **21** | **100%** |

---

## 🎯 PLAN DE ACCIÓN

### FASE 1: Limpieza (Mover a _legacy/)

**Agentes OBSOLETOS** (4):
- `meskeia_design_agent.py`
- `logo-footer-favicon.py`
- `estructura_html_standard.txt`
- `pwa_manifest.txt` (PWA no es prioridad)

**Razón**: Reemplazados completamente por:
- CSS Modules + `globals.css`
- Componentes React (`<MeskeiaLogo />`, `<Footer />`)
- Estructura Next.js (REGLA #8 en CLAUDE.md)

---

### FASE 2: Actualización (Crear versiones Next.js)

**Agentes ACTUALIZABLES** (6):

1. **chartjs_personalizado.txt** → `chartjs_nextjs.txt`
   - Implementación con React hooks
   - `useRef` + `useEffect`

2. **localization_agent_universal.txt** → Actualizar inline
   - Referenciar `lib/formatters.ts`
   - Ejemplos con componentes

3. **api_keys_seguras.txt** → Actualización menor
   - Añadir `.env.local` y `NEXT_PUBLIC_`

4. **localstorage_patterns.txt** → `localstorage_nextjs.txt`
   - Custom hooks (`useLocalStorage`)
   - SSR-safe implementation

5. **seo_completo.txt** → `seo_nextjs.txt`
   - Usar `metadata.ts`
   - `generateMetadata()`

6. **analytics_avanzado.txt** → Actualizar inline
   - Referenciar `<AnalyticsTracker />`

---

### FASE 3: Mantener Sin Cambios

**Agentes VÁLIDOS** (6):
- `flask_setup.txt`
- `qa_testing_automatico.txt`
- `qa_tester_playwright.py`
- `qa_tester_examples.py`
- `detector_api_keys_hardcodeadas.py`
- `generador_agentes.py`

**Agentes en BACKUP** (5):
- `agente_importacion_datos.txt`
- `deployment_build.txt`
- `testing_validacion.txt`
- `agente_validacion_final.txt`
- `meta_verificador_agentes.txt`

---

## 📝 ESTRUCTURA PROPUESTA DESPUÉS DE LA ACTUALIZACIÓN

```
Agentes/
├── _legacy/                              # NUEVO - Agentes HTML obsoletos
│   ├── meskeia_design_agent.py
│   ├── logo-footer-favicon.py
│   ├── estructura_html_standard.txt
│   └── pwa_manifest.txt
│
├── fase-1-core/
│   ├── agentes/
│   │   ├── chartjs_nextjs.txt           # NUEVO - Versión React
│   │   ├── localization_agent_universal.txt  # ACTUALIZADO
│   │   ├── api_keys_seguras.txt         # ACTUALIZACIÓN MENOR
│   │   ├── localstorage_nextjs.txt      # NUEVO - Con hooks
│   │   ├── seo_nextjs.txt               # NUEVO - metadata.ts
│   │   ├── analytics_avanzado.txt       # ACTUALIZADO
│   │   ├── flask_setup.txt              # SIN CAMBIOS
│   │   └── qa_testing_automatico.txt    # SIN CAMBIOS
│   │
│   ├── validadores/
│   └── aplicadores/
│
├── fase-2-inteligencia/
│   ├── detector_api_keys_hardcodeadas.py  # SIN CAMBIOS
│   └── generador_agentes.py               # SIN CAMBIOS
│
├── fase-3-monitoring/
├── fase-4-mejoras/
│
├── backup/                              # Mantener como está
│   ├── agente_importacion_datos.txt
│   ├── deployment_build.txt
│   ├── testing_validacion.txt
│   ├── agente_validacion_final.txt
│   └── meta_verificador_agentes.txt
│
├── qa_tester_playwright.py              # SIN CAMBIOS
└── qa_tester_examples.py                # SIN CAMBIOS
```

---

## ⚠️ NOTAS IMPORTANTES

### 1. **Filosofía de Mantenimiento**
- **NO borrar nada** - Mover a `_legacy/` para referencia futura
- **Backups completos** antes de cualquier cambio
- **Documentar razones** de obsolescencia

### 2. **Prioridades**
1. **Alta**: Agentes que afectan desarrollo diario (seo, localization, analytics)
2. **Media**: Agentes específicos de funcionalidad (chartjs, localstorage)
3. **Baja**: Agentes en backup o uso ocasional

### 3. **Compatibilidad con CLAUDE.md y SKILLS**
- CLAUDE.md ya actualizado ✅
- SKILLS ya actualizado ✅
- Agentes deben ser consistentes con estas guías

---

## 🎯 DECISIÓN ESTRATÉGICA

**¿Proceder con la actualización de AGENTES?**

**Opción A**: Actualizar AHORA
- ✅ Consistencia inmediata con CLAUDE.md y SKILLS
- ✅ Evita confusión futura
- ❌ Requiere tiempo (~2-3 horas)

**Opción B**: Actualizar GRADUALMENTE
- ✅ Solo actualizar agentes cuando se necesiten
- ✅ Menos trabajo inmediato
- ❌ Riesgo de usar agentes obsoletos por error

**Opción C**: Mantener AMBOS sistemas
- ✅ No se pierde funcionalidad HTML
- ❌ Confusión sobre cuál usar
- ❌ Mantenimiento duplicado

---

## 💡 RECOMENDACIÓN

**Proceder con OPCIÓN A: Actualización completa AHORA**

**Razón**:
1. Ya invertimos tiempo en actualizar CLAUDE.md y SKILLS
2. Sistema de agentes es crítico para desarrollo futuro
3. Evita usar agentes obsoletos por error
4. Documentación completa y consistente

**Tiempo estimado**: 2-3 horas
**Beneficio**: Sistema completamente actualizado y consistente

---

**Estado actual**: PENDIENTE DE CONFIRMACIÓN

¿Proceder con la actualización de agentes?

---

**Fecha de revisión:** 2025-11-25
**Revisado por:** Claude Code
**Próximo paso:** Esperar confirmación del usuario para proceder con actualización
