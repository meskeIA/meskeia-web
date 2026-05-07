# Reposicionamiento meskeIA — Documento de Seguimiento

> **Fuente de verdad** del proyecto de revisión estratégica iniciado el 2026-05-05.
> Aquí se registra: contexto, decisiones tomadas, qué se ha implementado y qué queda por hacer.

**Última actualización:** 2026-05-07 (Plan A descubrimiento cerrado en fase de medición + 27 simuladores creados — solo queda esperar 2-3 semanas para ver datos)

---

## 1. Contexto inicial

A 9 meses del arranque (con 1 mes de mantenimiento por disclaimers), 3 meses reales de operativa continua, **816 apps en producción** y crecimiento orgánico sin difusión activa (~100 visitas/día), se identificó la necesidad de hacer una revisión global del proyecto:

- ¿Qué hemos hecho bien?
- ¿Qué tenemos pendiente?
- ¿Hacia dónde dirigirnos en el futuro?

El proyecto había crecido por acumulación de tipologías (calculadoras → simuladores → herramientas → cursos → guías journey → guías directorio → historias → juegos…) y el catálogo se había vuelto inabarcable mentalmente.

---

## 2. Hallazgos de la auditoría con datos reales (2026-05-05)

### 2.1 Muestra analizada

- **Periodo**: 01/02/2026 → 05/05/2026 (3 meses)
- **3.175 eventos**, **2.959 sesiones**, **1.237 IPs únicas**
- **505 de 824 apps** han recibido al menos 1 visita (61,3% del catálogo descubierto)
- Crecimiento mensual sostenido: feb 484 → mar 1.052 → abr 1.066 eventos

### 2.2 Concentración del tráfico (Pareto)

| Cuartil | Apps que lo acumulan |
|---------|----------------------|
| 50% del tráfico | **21 apps** |
| 80% del tráfico | **133 apps** |
| 95% del tráfico | **347 apps** |

### 2.3 Top apps (lo que la gente realmente usa)

1. `tabla-periodica` (341 visitas, 38m duración media) — Estudiantes
2. `test-perfil-inversor` (292, 8m, 63% recurrentes) — Finanzas
3. `simulador-genetica` (137, 91m) — Bachillerato/Universidad
4. `conversor-braille` (101) — Accesibilidad
5. `simulador-puertas-logicas` (90) — Universidad/FP
6. `generador-anagramas` (87) — Curiosidad
7. `calculadora-notas` (70) — Estudiantes
8. `meskeIA` (home, 58)
9. `juego-memoria` (54)
10. `estimador-compraventa-inmueble` (48)

→ **8 de 12 son educativas o de finanzas personales**.

### 2.4 Inversión invertida (visualizadores vs simuladores)

| Tipo | Apps | Engagement |
|------|------|-----------|
| Simuladores | 16 | 43m duración, 41% recurrentes |
| Tests | 18 | 8m duración, **63% recurrentes** |
| Cursos | 11 | 3m 51s, 42% recurrentes |
| Visualizadores | 113 | **55s** duración, **18%** recurrentes |

→ 7× más visualizadores que simuladores, pero los simuladores generan 20× más minutos de uso por app.

### 2.5 Problema de descubrimiento

- 98,9% de sesiones aparentaba ser 1 sola app — **artefacto del bug del `sesion_id`** que regeneraba un id nuevo en cada page load. Corregido el 2026-05-06.
- 1,7% del tráfico llega a la home; el 98,3% entra directo a una app desde Google.

### 2.6 Geografía

- España: 35% (348 IPs)
- Latam: 23% (MX 242, CO 104, AR 103, BO 82, EC 45, PE 38, CL 32, CR 51…)
- USA: 25% (gran parte hispanohablante)

→ Casi la mitad del tráfico no es España.

---

## 3. Reposicionamiento confirmado

**Identidad estratégica adoptada el 2026-05-06:**

> **meskeIA es una plataforma gratuita de aplicaciones web en español: estudio (visualizadores, ciencia, historia), finanzas personales (inversión, hipotecas, impuestos) y herramientas prácticas (productividad, diseño, juegos y más). Sin registro y sin publicidad.**

Esta definición canónica se inyectó en 8 sitios de la web (home, /acerca, /apps, JSON-LD WebSite, og-image, footer, etc.) en commit `33e079e5`.

### Implicaciones

1. **Público real**: estudiantes (ESO/Bach/Universidad/FP) + adultos activos en finanzas personales
2. **Público hispanohablante completo**: España + Latam (no solo España)
3. **Eje de curiosidad/ocio**: minoritario pero útil como escaparate
4. **No somos**: toolbox de productividad, suite de marketing, suite de diseño (estos crecieron por acumulación, no por estrategia)

### Implicación práctica para apps nuevas

- Apps no fiscales-España: usar términos universales, formato decimal flexible, evitar referencias culturales solo de España
- Apps fiscales-España: claras como tales, no aparentar universalidad

---

## 4. Plan A — Descubrimiento interno (CERRADO ✅ — fase de medición)

**Objetivo**: medir y mejorar la métrica "apps por sesión" (objetivo 2,0+) sin crear apps nuevas.

| Fase | Qué se hace | Estado | Commit/Notas |
|------|------------|--------|--------------|
| **0** | Tracking de origen de clics + fix del `sesion_id` | ✅ COMPLETADA (2026-05-06) | `25c3831e`, `756339f3`, `ebfd1c20` |
| **L** | Auditoría Latam-friendly + adaptación apps top + RegionBadge en 56 apps | ✅ COMPLETADA (2026-05-06) | varios |
| **A+B** | Pestaña 🧭 Navegación en dashboard + tracking `?from=` en home, búsqueda, catálogo, sidebar | ✅ COMPLETADA (2026-05-07) | `e2191d6d` |
| **1** | Componente `ContinuaCon` con datos dinámicos | ⏸️ EN PAUSA | Decidir tras 2-3 semanas de datos en pestaña Navegación |
| **2** | Home con tracción real (top semanal, caminos) | ⏸️ EN PAUSA | Decidir cuando los datos muestren si la home es motor de descubrimiento o solo escaparate |
| **3** | Decisión sobre `app-relations.ts` (4.680 líneas curadas) | ⏸️ EN PAUSA | Decidir cuando el ratio de continuación de RelatedApps tenga muestra suficiente |

**Cambio de enfoque (2026-05-07)**: en lugar de ejecutar a ciegas las FASES 1-3, primero se construyó el **observatorio cuantitativo** (pestaña Navegación con KPIs de apps por sesión, distribución, transiciones origen→destino y ratio de continuación por app). A 2-3 semanas, los datos dirán si vale la pena cada una de esas fases o si el problema está en otro sitio.

**Mejoras adicionales aplicadas en este eje**:

- Cross-linking en top 19 apps (2026-05-06): RelatedApps reescrito en `tabla-periodica`, `test-perfil-inversor`, `simulador-genetica`, `calculadora-notas`, `generador-anagramas`, etc.
- Filtro de datacenters cloud (2026-05-06): scrapers Tencent/AWS marcados como `bot` en analytics.
- Tracking `?from=` en 5 puntos (2026-05-07): `home-daily` (DailyApps), `search` (SearchBar), `catalog` y `catalog-guides` (/apps), `sidebar-recent` (Sidebar/SidebarMobile). `related-{slug}` ya existía.

---

## 5. Plan B — Identidad y taxonomía (CERRADO ✅)

**Objetivo**: simplificar la taxonomía a escala (15→13 suites, eliminar Momentos), refactor del catálogo y home, y redefinir frontera Estudiantes ↔ Cultura. Ejecutado entre 2026-05-06 y 2026-05-07.

| Fase | Qué se hace | Estado | Commit |
|------|------------|--------|--------|
| **1** | Fusión de suites: Marketing→Diseño, Jubilación→Legal/Fiscal | ✅ | `605589d7` |
| **2** | Eliminar sistema de Momentos (`MomentType`, `contexts`, vistas, página) | ✅ | `605589d7` |
| **3** | Sidebar simplificado: 1 botón "Catálogo completo" | ✅ | `119cbd22` |
| **4** | Refactor `/apps` con cards compactas + pestaña "Caminos guiados" | ✅ | `6be93918` |
| **5** | Cleanup CSS huérfano (-816 líneas en `app/page.module.css`) | ✅ | `d037deaf` |
| **6** | Redefinir frontera Estudiantes ↔ Cultura por reglas de patrón | ✅ | `9500461c` |

**Pulidos visuales aplicados** (2026-05-07):
- Eliminado botón "Buscar" del sidebar (redundante con SearchBar central)
- Eliminadas vistas internas `Por qué meskeIA` y `Preguntas frecuentes` (duplicaban `/acerca`)
- `/apps` cambia a 2 columnas (era 4 con nombres truncados)
- Iconos de suite quitados de las cards colapsadas (`/apps` y "Apps del día")
- Eliminado link "Apps" del footer del home (redundante con sidebar)

**Resultados taxonomía final** (FASE 6):

| Suite | Apps |
|-------|-----:|
| Cultura General | 418 |
| Estudiantes | 283 |
| Salud y Bienestar | 174 |
| Herramientas Técnicas | 121 |
| Finanzas e Inversión | 118 |
| Productividad | 113 |
| Freelance y Autónomo | 70 |
| Legal, Fiscal y Patrimonio | 62 (fusión) |
| Diseño y Contenido | 61 (fusión) |
| Inmobiliaria y Hogar | 55 |
| Juegos y Ocio | 36 |
| Accesibilidad e Inclusión | 16 |
| Viajes y Turismo | 15 |

→ De 15 suites con conteos cuasi-idénticos (Cultura 423 / Estudiantes 387 prácticamente solapadas) a 13 suites con frontera real.

---

## 6. Plan C — SEO técnico (CERRADO ✅)

| Tarea | Estado | Commit |
|-------|--------|--------|
| SEO sweep top 19 apps (titles ≤60 chars, descriptions ≤160 chars, canonical) | ✅ | `ad182c70` |
| Auditoría rutas dinámicas + fix canonical en 2 cursos | ✅ | `36bc16a2` |
| JSON-LD top 19 (Schema.org WebApplication, vía layout.tsx) | ✅ | `72b18285` |
| JSON-LD siguientes 50 apps + scripts auto-aplicación | ✅ | `10564e99` |
| Fix sistémico: template y CLAUDE.md exigen JSON-LD a apps nuevas | ✅ | `22370c84` |
| Cobertura total JSON-LD: ~89 apps activas (top 19 + 50 + ~20 manual) | ✅ | — |

**Bug del `sesion_id` arreglado** (`ebfd1c20`): el tracker generaba un id nuevo en cada page load, invalidando todas las métricas de "apps por sesión". Ahora persiste con `sessionStorage` durante toda la pestaña.

**Cifras hardcoded eliminadas** del catálogo (84, 220, 250, 621): ahora todas las cifras vienen de la variable `TOTAL_IMPLEMENTED_APPS`. Regla 1.quater añadida a CLAUDE.md.

---

## 7. Decisiones estratégicas tomadas (registro)

| Fecha | Decisión | Motivo |
|-------|----------|--------|
| 2026-05-05 | NO eliminar apps con baja visita | A 3 meses sin difusión, "0 visitas" = "no descubierta", no "inútil" |
| 2026-05-06 | Adoptar reposicionamiento "estudio + finanzas + herramientas" | Confirmado por datos analíticos y filosofía de /acerca |
| 2026-05-06 | Servir a Latam además de España | 23% del tráfico Latam directo + 25% USA hispanohablante |
| 2026-05-06 | NO tocar visualizadores | Generan SEO long-tail útil. No añadir más, no eliminar |
| 2026-05-06 | NO crear apps nuevas hasta resolver descubrimiento interno | Mayor ROI esperado: subir apps/sesión es la palanca |
| 2026-05-06 | NO añadir redirects 301 al limpiar rutas | 0 visitas a rutas eliminadas (eran query params, no paths) |
| 2026-05-06 | Posponer análisis de apps con 0 visitas | Las palancas activadas (X, RelatedApps, JSON-LD) necesitan 2-3 meses para producir efecto |
| 2026-05-07 | Mantener rotación aleatoria de "Apps del día" | Decidir cuando haya datos del home con sesion_id arreglado |
| 2026-05-07 | NO redistribuir Estudiantes vs Cultura quirúrgicamente | Solo 1.7% del tráfico ve el catálogo; opción intermedia con reglas suficiente |
| 2026-05-07 | Crear 27 simuladores en una sola sesión (10 ciencias + 11 informática + 6 fiscal-España) | Cierra los 3 bloques abiertos del REPOSICIONAMIENTO. Justificado por 43m duración y 41% recurrencia de simuladores frente a 55s/18% de visualizadores |
| 2026-05-07 | Construir pestaña Navegación ANTES de implementar FASES 1-3 del Plan A | Mejor medir primero qué pasa que ejecutar a ciegas componentes "ContinuaCon", refactor app-relations, etc. |

---

## 8. Métricas a seguir

| Métrica | Valor 2026-05-05 | Objetivo | Dónde verla |
|---------|-----------------:|----------|-------------|
| Apps por sesión (real, post-fix `sesion_id`) | a medir | 2,0+ | Pestaña 🧭 Navegación (KPI destacado) |
| Distribución sesiones single-app vs multi-app | a medir | <60% single-app | Pestaña 🧭 Navegación |
| Top transiciones origen→destino | a medir | identificar 5 rutas frecuentes | Pestaña 🧭 Navegación |
| Ratio de continuación por app (puente vs puerta) | a medir | top apps ≥50% | Pestaña 🧭 Navegación |
| % catálogo descubierto | 61,3% | 80%+ | Pestaña Resumen IA |
| Recurrencia global | 28,5% | 40%+ | Pestaña Visión General |
| % tráfico Latam global | 23% | 30%+ a 1 mes | Pestaña Resumen IA |
| `calculadora-notas` % Latam | 4% | 20%+ a 1 mes | Por app |
| Apps con >40% Latam | 11 | 18+ a 1 mes | — |
| Apps con JSON-LD activo | 89 | crecer si Search Console valida tracción | — |

---

## 9. Pendiente (corta lista)

### Espera (datos en cocción — nada que hacer hasta entonces)

1. **Revisión inicial de la pestaña 🧭 Navegación** — primera revisión a 7-14 días desde el 2026-05-07: muestra suficiente para apps por sesión y distribución, pero las transiciones con `?from=` explícito necesitan 3-5 días para empezar a aparecer.
2. **Revisión cuantitativa a 2-3 semanas**: con muestra suficiente, decidir:
   - Si vale la pena el componente `ContinuaCon` dinámico (FASE 1 original)
   - Si la home necesita refactor con tracción real (FASE 2 original)
   - Si `app-relations.ts` debe simplificarse o reescribirse a dinámico (FASE 3 original)
3. **Métricas Latam**: comprobar si `calculadora-notas` con escalas Latam mueve el % de tráfico Latam a 2-3 semanas.

### A largo plazo (~agosto 2026)

4. **Sweep adicional JSON-LD**: aplicar a apps que hayan ganado tráfico, si Search Console muestra tracción en las 89 actuales. Reglas y scripts ya disponibles (`scripts/apply-jsonld-batch.mjs`, `scripts/top-apps-next-50.mjs`).
5. **Análisis de apps con 0 visitas**: solo cuando las palancas (difusión X, JSON-LD, RelatedApps mejorado, refactor catálogo) hayan tenido 2-3 meses para producir efecto. Antes de eso, "0 visitas" sigue significando "no descubierta", no "inútil".

### Bloques estratégicos abiertos (sin urgencia)

6. **Apps fiscales-España**: ¿señalizar visualmente más allá del `RegionBadge`? (mejora UX-Latam si hace falta)
7. **Filosofía como filtro evolutivo**: criterio claro de "qué SÍ creamos / qué NO" para apps futuras. Pendiente de formalizar como decálogo.

### Cerrado en esta sesión (ya no figura como pendiente)

- ~~Doblar apuesta en simuladores y tests~~ → 27 simuladores creados el 2026-05-07: 10 ciencias + 11 informática + 6 fiscal-España visual.
- ~~Implementar componente ContinuaCon a ciegas~~ → Reemplazado por enfoque de medición previa con pestaña Navegación.

---

## 10. Documentos relacionados

- `BACKLOG.md` — Tareas tácticas (cola corta)
- `CHANGELOG.md` — Historial técnico
- `DISCLAIMER-POLICY.md` — Política legal de las apps
- `data/applications.ts` — Catálogo
- `data/suites.ts` — 13 suites temáticas
- `app/dashboard-analytics/page.tsx` — Dashboard de analytics

---

## 11. Bitácora resumida

- **2026-05-05**: Auditoría inicial (816 apps, 11→15 suites, 25+ tipologías). Diagnóstico estratégico inicial.
- **2026-05-06 mañana**: Auditoría con datos Turso (3 meses). Identificación Pareto extremo + inversión invertida (visualizadores vs simuladores). Confirmación reposicionamiento.
- **2026-05-06 día**: FASE 0 tracking + Auditoría Latam-friendly + RegionBadge a 56 apps + Cross-linking en top apps + filtro datacenters + SEO sweep top 19 + JSON-LD top 19 + JSON-LD top 50 + fix sistémico template + decisión apps 0-visitas.
- **2026-05-07 mañana**: Plan B identidad/taxonomía completo (FASES 1-6). Pulidos visuales adicionales. Cierre del plan.
- **2026-05-07 tarde**: 27 simuladores creados en 8 tandas paralelas (10 ciencias Bachillerato/Universidad + 11 informática FP/Universidad + 6 fiscal-España visual). Cierra los 3 bloques abiertos del REPOSICIONAMIENTO.
- **2026-05-07 noche**: Plan A descubrimiento cerrado en fase de medición. Pestaña 🧭 Navegación en dashboard + tracking `?from=` en home, búsqueda, catálogo y sidebar. Las FASES 1-3 originales (ContinuaCon, home dinámica, refactor app-relations) quedan EN PAUSA hasta tener 2-3 semanas de datos.

**Total de la sesión 2026-05-05 a 2026-05-07**: ~35 commits, ~3.500 líneas eliminadas (código muerto), 13 suites, 0 momentos, 89 apps con JSON-LD, 56 con RegionBadge, 14 apps Latam-friendly, **27 simuladores nuevos** y **observatorio cuantitativo de navegación**. Ahora toca esperar para ver datos antes de seguir tocando.
