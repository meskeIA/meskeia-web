# BACKLOG.md - meskeIA Web

> **Última actualización**: 2026-06-08
> **Apps totales**: 995 | **Suites**: 13
> **Uso**: Claude Code lee este fichero al inicio de cada sesión y trabaja la siguiente tarea disponible.

---

## 📊 Estado de Suites (referencia rápida)

| Suite | Apps | Estado |
|-------|------|--------|
| 🧮 Estudiantes | 49 | ✅ Bien cubierta |
| 📚 Cultura General | 44 | ✅ Bien cubierta |
| ⚡ Productividad | 39 | ✅ Bien cubierta |
| 📈 Finanzas | 35 | ✅ Bien cubierta |
| 🔧 Herramientas Técnicas | 32 | ✅ Bien cubierta |
| 🎨 Diseño y Desarrollo | 28 | 🟡 Aceptable |
| 🏥 Salud y Bienestar | 28 | 🟡 Aceptable |
| 📢 Marketing y Contenido | 25 | 🟡 Aceptable |
| 🏘️ Inmobiliaria y Hogar | 24 | 🟡 Aceptable |
| 🎲 Juegos y Ocio | 20 | 🟡 Aceptable |
| ✈️ Viajes y Turismo | 15 | 🟡 Aceptable (era GAP) |
| 💼 Freelance y Autónomo | 62+ | ✅ Bien cubierta |

**Valor diferencial meskeIA**: Gratuito · Sin registro · 100% local en el PC · Total confidencialidad

---

## 🔴 URGENTE — Mantenimiento Técnico

> Tareas técnicas que afectan la calidad y seguridad de toda la plataforma.

- [x] **Disclaimers: 5 apps corregidas** — severity/collapsible ajustados según DISCLAIMER-POLICY.md: aditivos-e-alimentarios, guia-especias, guia-infusiones → severity="high" collapsible={false}; checklist-cambio-regimen-autonomo, orientador-contrato-mercantil → severity="critical"→"high". `visualizador-cancer` se mantiene en severity="critical" intencionalmente (decisión del usuario). *(resuelto: 2026-05-04)*

- [x] **5 nuevas apps creadas** — Basadas en analytics de uso real. Con patrón v2.0 completo y build OK. *(2026-05-04)*
  - `quiz-tabla-periodica` — 40 preguntas en 5 categorías (suites: estudiantes, juegos, cultura)
  - `simulador-sesgos-inversor` — 8 escenarios de sesgos cognitivos financieros (suite: finanzas)
  - `simulador-circuitos-electricos` — Serie/paralelo hasta 6R, Ohm, potencia (suites: estudiantes, tecnicas)
  - `test-tolerancia-riesgo-detallado` — 20 preguntas en 5 dimensiones, 5 perfiles con asignación activos (suite: finanzas)
  - `simulador-reacciones-quimicas` — Estequiometría + reactivo limitante para 20 reacciones reales (suites: estudiantes, tecnicas)

- [x] **Disclaimers: 6 apps corregidas** — severity="high"→"critical" en: estimador-fire, optimizador-rentas-60, orientador-seguro-vida, planificador-chequeos-medicos, residencia-vs-cuidado-en-casa, selector-actividades-movilidad. `visualizador-cancer` se mantiene en critical intencionalmente (decisión del usuario). *(resuelto: 2026-05-11)*

- [x] **npm audit: 11 vulnerabilidades transitivas resueltas** — `npm audit fix` (sin --force) limpió 10/13 (dompurify, flatted, minimatch, fast-uri, brace-expansion, picomatch, path-to-regexp, ip-address, hono, @hono/node-server, express-rate-limit). Solo `package-lock.json` modificado. Build OK. *(resuelto: 2026-05-11)*

- [x] **npm audit: brace-expansion reapareció** — Nueva vuln moderate en `brace-expansion` detectada en auditoría 2026-05-17. Corregida con `npm audit fix` sin --force. Quedan 2 moderate (postcss vía next — deuda aceptada). *(resuelto: 2026-05-17)*

- [x] **npm audit: vuln `ws` moderate corregida** — `ws 8.0.0–8.20.0` en `@libsql/isomorphic-ws` (GHSA-58qx-3vcg-4xpx). Corregida con `npm audit fix`. *(resuelto: 2026-05-25)*

- [x] **Actualizaciones menores** — `@anthropic-ai/sdk` 0.96→0.98, `@tanstack/react-query` 5.100.10→5.100.14, `@types/react` 19.2.14→19.2.15, `baseline-browser-mapping` 2.10.30→2.10.32. Build 1.273 páginas OK. *(resuelto: 2026-05-25)*

- [x] **Actualizaciones menores** — `@anthropic-ai/sdk` 0.98.0→0.100.1, `baseline-browser-mapping` 2.10.32→2.10.33, `resend` 6.12.3→6.12.4. Build 1.281 páginas OK. *(resuelto: 2026-05-31)*

- [x] **Disclaimer `orientador-ayuda-vivienda-rural` corregido** — severity="medium"→"critical" (suites inmobiliaria+finanzas → nivel 1 CRÍTICO). *(resuelto: 2026-05-31)*

- [x] **npm audit: vuln `tmp` high corregida** — Path Traversal en `tmp` (prefix/postfix no saneado). Corregida con `npm audit fix` sin --force. *(resuelto: 2026-05-31)*

- [ ] **npm audit: vuln `uuid/exceljs` moderate pendiente** — `exceljs >=3.5.0` depende de `uuid <11.1.1` (GHSA-w5hq-g745-h8pq, buffer bounds check). Fix requiere `npm audit fix --force` con downgrade a `exceljs@3.4.0` (breaking change desde 4.4.0). Riesgo bajo para nuestro uso (lectura/escritura Excel, no generación UUID con buf). Pospuesto hasta que exceljs publique versión >=4.x con uuid corregido. *(detectado: 2026-05-25)*

- [x] **npm audit: vuln `hono` moderate REAPARECIDA — corregida** — 4 CVEs moderados en `hono@4.12.18` (IP restriction bypass IPv6, Set-Cookie injection en cookie helper, JWT middleware acepta cualquier scheme, `app.mount()` enrutado incorrecto con paths percent-encoded). Llegaba transitivamente vía `@modelcontextprotocol/sdk@1.29.0` → `@hono/node-server`. Ya se había resuelto el 2026-05-11 (mismo patrón de reaparición que `brace-expansion` en 2026-05-17). Corregida con `npm audit fix` sin --force — solo `package-lock.json` modificado, build 1.161 páginas OK. De 5 a 4 vuln moderadas (las 4 restantes son deuda aceptada / ya trackeadas). *(detectado y resuelto: 2026-06-08)*

- [x] **Disclaimer `guia-productos-limpieza` corregido** — severity="high"→"critical" (suites `[inmobiliaria, salud]` exigen Nivel 1 CRÍTICO según DISCLAIMER-POLICY.md). `variant="general"` y `collapsible={false}` ya eran correctos (mismo patrón que `adaptacion-hogar`, `planificador-boda`). Detectado por `audit-disclaimers.mjs --solo-criticos`. *(detectado y resuelto: 2026-06-08)*

> Nota: `visualizador-cancer` sigue marcado como "urgente" por el script de auditoría (severity="critical" cuando el nivel esperado por sus suites sería "high"), pero es una **decisión intencional del usuario documentada en este mismo BACKLOG** (resuelto 2026-05-04 y 2026-05-11) — no constituye incidencia real, no reabrir.

- [ ] **Actualizar dependencias (Fase 6)**: `npm outdated` → evaluar actualizaciones. Priorizar: Next.js, React, Chart.js. Sesión dedicada por alto riesgo de breaking changes.
  - *Impacto*: Rendimiento, seguridad, compatibilidad futura
  - *Complejidad*: Alta (sesión separada, con build verification)
  - *Estado 2026-03-01*:
    - ✅ `@types/node` 20→22 **completado** (build 459 páginas OK, commit b527402). Alineado con Node.js v22 local + Vercel. No actualizar a v25 (no es LTS).
    - ⏸️ `eslint` 9→10 **suspendido indefinidamente** hasta que `eslint-config-next` soporte oficialmente ESLint 10. No revisar en audits hasta que haya confirmación oficial de compatibilidad. Riesgo: lint se rompe completamente si se actualiza antes.
    - ✅ Next.js/React al día.
    - ✅ `@trpc/*` 11.10.0 → 11.12.0 **completado** (2026-03-09). Build OK.
    - ✅ `@trpc/*` 11.14.1 → 11.16.0 **completado** (2026-03-30). Build OK.
    - ✅ `baseline-browser-mapping` 2.10.10 → 2.10.12 **completado** (2026-03-30).
    - ✅ `@modelcontextprotocol/sdk` 1.27.1 → 1.28.0 **completado** (2026-03-30).
    - ✅ `@tanstack/react-query` 5.95.0 → 5.95.2 **completado** (2026-03-30).
    - ✅ `eslint` 9.39.3 → 9.39.4 **completado** (2026-03-30). No subir a v10.
    - ✅ Next.js 16.2.2 → 16.2.3, React 19.2.4 → 19.2.5, `@anthropic-ai/sdk` 0.82.0 → 0.88.0, `@tanstack/react-query` 5.96.2 → 5.99.0, `mathjs` 15.1.1 → 15.2.0, `dotenv` 17.4.1 → 17.4.2, `baseline-browser-mapping` 2.10.15 → 2.10.18, `eslint-config-next` + `@next/bundle-analyzer` + `@next/third-parties` → 16.2.3. Build 782 páginas OK. **completado** (2026-04-13).
    - ✅ Next.js 16.2.3 → 16.2.4, `@next/bundle-analyzer` + `@next/third-parties` + `eslint-config-next` → 16.2.4, `@tanstack/react-query` 5.99.0 → 5.99.2, `hls.js` 1.6.15 → 1.6.16, `baseline-browser-mapping` 2.10.18 → 2.10.20, `@axe-core/playwright` 4.11.1 → 4.11.2, `@anthropic-ai/sdk` 0.88.0 → 0.90.0. Build 535 apps OK. **completado** (2026-04-20).
    - ✅ `@anthropic-ai/sdk` 0.90.0 → 0.91.1, `@libsql/client` 0.17.2 → 0.17.3, `@tanstack/react-query` 5.99.2 → 5.100.5, `baseline-browser-mapping` 2.10.20 → 2.10.23. **completado** (2026-04-27).
    - ✅ `@anthropic-ai/sdk` 0.91.1 → 0.92.0, `@tanstack/react-query` 5.100.5 → 5.100.9, `@trpc/*` 11.16.0 → 11.17.0, `zod` 4.3.6 → 4.4.3, `baseline-browser-mapping` 2.10.23 → 2.10.27, `@axe-core/playwright` 4.11.2 → 4.11.3. Build OK. **completado** (2026-05-04).
    - ✅ `next` 16.2.4→16.2.6, `@next/bundle-analyzer`+`eslint-config-next` 16.2.4→16.2.6, `react`+`react-dom` 19.2.5→19.2.6, `@anthropic-ai/sdk` 0.92.0→0.95.1, `resend` 6.12.2→6.12.3, `baseline-browser-mapping` 2.10.27→2.10.29, `@types/node` 22.19.17→22.19.18. Build OK. **completado** (2026-05-11).
    - ✅ `@anthropic-ai/sdk` 0.95.1→0.96.0, `@playwright/test` 1.59.1→1.60.0, `@tanstack/react-query` 5.100.9→5.100.10, `@types/node` 22.19.18→22.19.19, `baseline-browser-mapping` 2.10.29→2.10.30. Build 925 páginas OK. **completado** (2026-05-17).
    - 🔴 `typescript` 5.9.3 → 6.0.3 disponible (major, breaking changes potenciales). Requiere sesión dedicada. *(detectado: 2026-03-30)*
    - ✅ `sql.js` 1.14.0 → 1.14.1 **completado** (2026-03-09).
    - ✅ `@types/node` 22.19.13 → 22.19.15 **completado** (2026-03-09). No subir a v25 (no LTS).
    - ✅ `dompurify` + `minimatch` + 8 vuln transitivas más resueltas con `npm audit fix` sin --force (2026-05-11). Solo `package-lock.json` modificado, build OK.
    - ✅ `next`+`@next/bundle-analyzer`+`eslint-config-next` 16.2.6→16.2.7, `react`+`react-dom` 19.2.6→19.2.7, `@tanstack/react-query` 5.100.14→5.101.0, `@types/react` 19.2.15→19.2.17, `@anthropic-ai/sdk` 0.100.1→0.102.0, `js-yaml` 4.1.1→4.2.0, `baseline-browser-mapping` 2.10.33→2.10.34, `@types/node` 22.19.19→22.19.20 (parche, sigue en v22 LTS). Build 1.161 páginas OK. **completado** (2026-06-08).

- [x] **ai-index.json: texto desactualizado** — Corregido a 250 apps, suites actualizadas, fecha 2026-03-01. *(resuelto: 2026-03-01)*

- [x] **ai-index.json: sincronizado** — Añadidas 13 entradas faltantes (8 guías, 4 quizzes, 1 orientador). Total: 392 entradas, `total_tools` corregido. *(resuelto: 2026-04-01)*

- [x] **Disclaimers: 26 apps corregidas** — severity y collapsible ajustados según DISCLAIMER-POLICY.md. 16 apps nivel 1 → critical, 10 apps nivel 2 → high. Re-auditoría: 0 incidencias. *(resuelto: 2026-03-30)*

- [x] **Dark mode (verificado)** — Los 25 CSS modules sin `[data-theme]` son falsos positivos: usan colores de marca o semánticos intencionales (juegos, espejo, hero). Resto de interfaz usa variables CSS de globals.css. Dark mode funciona correctamente en toda la plataforma. *(verificado: 2026-03-01)*

- [x] **Disclaimers: 4 apps Suite Freelance corregidos** — severity="medium"→"high", eliminado collapsible={true} en calculadora-precio-por-proyecto, orientador-diversificacion-clientes, planificador-vacaciones-autonomo, simulador-colchon-emergencia-freelance. *(resuelto: 2026-04-20)*

- [x] **Disclaimers: 21 visualizadores corregidos** — 18 médicos/farmacológicos (acetilcolina, adrenalina, analgesicos, anestesia, antibioticos, aspirina, cortisol, estrogenos, gaba, hierro, ibuprofeno, insulina-glucosa, magnesio, paracetamol, serotonina, tiroides, vitamina-b12, vitamina-d): severity="low"→"high", eliminado collapsible={true}. 3 financieros (deuda-publica, mercados-financieros, tipos-interes-bce): severity="medium"→"high", eliminado collapsible={true}. Re-auditoría: 3 urgentes restantes son severity=critical intencional (correcto). *(resuelto: 2026-04-27)*

---

## 🟠 DEUDA TÉCNICA ACEPTADA — No revisar en auditorías rutinarias

> Items analizados estratégicamente y **conscientemente pospuestos**. NO reabrir hasta que cambien las condiciones documentadas más abajo. Esto evita reevaluarlos cada semana sin motivo.

### 1. Vuln PostCSS / Next (3 vuln moderadas residuales en npm audit)

- **CVE**: GHSA-qx2v-qp2m-jg93 — XSS via `</style>` no escapado en `CSS Stringify` de PostCSS.
- **Estado**: `postcss@8.4.31` está pinned por Next.js 16.2.6. El único fix que ofrece `npm audit` sería downgrade a `next@9.3.3` (incompatible — no aplicable).
- **Riesgo real para meskeIA**: **prácticamente cero**. PostCSS solo se ejecuta en build-time (servidor Vercel), procesando nuestros propios CSS Modules. No hay flujo donde un atacante pueda inyectar CSS que PostCSS procese. La vuln es runtime XSS, no build-time.
- **Decisión (2026-05-11)**: **NO actuar**. Las 3 vuln se mantendrán en `npm audit` hasta que Next.js actualice su pinning de PostCSS.
- **Condiciones para reabrir**:
  - Next.js publica una versión que actualiza PostCSS a ≥8.5.10 → actualizar Next.js como siempre.
  - Aparece un CVE de severidad **high/critical** en PostCSS, o bien
  - meskeIA empieza a procesar CSS proveniente de usuarios (no es el caso ni se prevé).

### 2. TypeScript 5.9.3 → 6.0.3 (major)

- **Necesidad operacional**: ninguna. TS 5.9 compila los 923 apps sin errores. Next.js 16.2.6 funciona perfectamente con TS 5.9. No se usan features que requieran TS 6.
- **Necesidad de seguridad**: ninguna (TypeScript no es un riesgo runtime).
- **Riesgo si actualizamos ahora**:
  - Cambios en inferencia de tipos sobre 923 apps con casts frágiles (`as never`, `as Float32Array<ArrayBuffer>`, jStat sin tipos…) → estimación: 50-200 errores nuevos.
  - Reescribir typings custom en [types/](types/) (`algebrite.d.ts`, `jstat.d.ts`, `sql-js.d.ts`).
  - Plugin `"next"` en `tsconfig.json` puede requerir versión de `eslint-config-next` que oficialmente soporte TS 6.
  - Coste: 2-4 h en escenario optimista, 6-8 h si los typings custom dan guerra.
- **Decisión (2026-05-11)**: **POSPONER indefinidamente**.
- **Condiciones para reabrir**:
  - Vercel/Next.js anuncia compatibilidad oficial de Next.js con TS 6 o lo requiere (no es el caso hoy).
  - `eslint-config-next` o `@types/react` empieza a requerir TS 6.
  - Salen features de TS 6 que necesitamos concretamente para algo del producto.
  - Pasan ≥6 meses sin necesidad y se quiere consolidar la deuda en una sesión dedicada.

### 3. ESLint 9 → 10 (suspendido desde 2026-03)

- **Decisión vigente**: no actualizar hasta que `eslint-config-next` declare oficialmente compatibilidad con ESLint 10. Riesgo: el lint se rompe completamente.
- **Condiciones para reabrir**: anuncio oficial de Vercel/Next.js o release notes de `eslint-config-next` confirmando soporte ESLint 10.

### 4. `@types/node` v22 → v25

- **Decisión vigente**: mantenerse en v22 (LTS). v25 no es LTS.
- **Condiciones para reabrir**: nueva LTS de Node.js > 22 ampliamente disponible en Vercel.

---

## 🟡 NUEVAS APPS — Alta Prioridad (cubrir gaps de suites)

> Suites con menos cobertura. Cada app nueva en estas suites tiene mayor impacto relativo.

### ✈️ Viajes y Turismo (15 apps — objetivo cubierto)

> ⚠️ `guia-visados-espana` **descartada**: políticas de visados cambian frecuentemente por motivos imprevistos (diplomacia, pandemias, reciprocidad). Inviable mantener actualizado sin riesgo de dar información errónea en un tema crítico para el viajero.

### 💼 Freelance y Autónomo (17 apps — reducir gap con mejoras en apps existentes)

> ⚠️ Apps fiscales con datos dinámicos **descartadas**:
> - `calculadora-cuota-autonomo` — Cuota SS por tramos se revisa anualmente (ya hubo 2 cambios en 2 años). Alta probabilidad de quedar desactualizada.
> - `comparador-asalariado-autonomo` — Cálculo depende de gastos deducibles individuales muy variables; simplificación excesiva con riesgo de malinterpretación.
> - `simulador-declaracion-trimestral` — Modelo 303+130, riesgo legal.
>
> **Estrategia**: Cubrir Freelance mediante mejoras en apps existentes (ver sección 🔵), no con nuevas apps fiscales dinámicas.

### 🎲 Juegos y Ocio (20 apps — ⛔ SUITE CERRADA)

> **Decisión 2026-05-25**: Los datos de analytics confirman que la suite no genera tracción real. Los juegos arcade y casuales tienen 1–3 usos cada uno. Los quizzes educativos alcanzan como máximo 12 usos. En comparación, los simuladores educativos y las herramientas financieras generan 100–400 usos. El público de meskeIA busca resolver algo concreto, no entretenerse.
>
> **No añadir más apps a esta suite** salvo que un quiz concreto surja como necesidad real detectada en analytics (no por iniciativa propia).
>
> ~~**Candidatos descartados**~~: quiz de tablas de multiplicar (`tablas-multiplicar` ya existe), quiz de presidentes/reyes de España, quiz de capitales europeas (`quiz-paises-capitales` ya existe). Todos descartados por baja demanda demostrada.

---

## 🟢 NUEVAS APPS — Media Prioridad

> Suites mejor cubiertas pero con oportunidades relevantes para usuarios españoles.

### 📈 Finanzas

> ⚠️ Apps fiscales con datos dinámicos **descartadas**:
> - `simulador-pension-publica` — La Seguridad Social ya ofrece simulador oficial con datos reales de cotización del usuario (Mi SS). Nuestra estimación genérica no puede competir y tiene alto riesgo de desactualización con cada reforma del sistema.
> - `calculadora-irpf-nomina` — Tablas de retención IRPF se actualizan con cada Presupuestos Generales. La AEAT tiene su propio simulador oficial. Sin ventaja diferencial.

### 🏘️ Inmobiliaria y Hogar

> ✅ `calculadora-reformas-hogar` **implementada** — ver sección ✅

---

## 🟣 PROFESIONALIZACIÓN DE APPS EXISTENTES

> Aplicar el patrón v2.0: tabla comparativa, casos de uso, FAQ, guía paso a paso, tips, warning box.
> **Estado actual**: ✅ CICLO COMPLETO — todas las apps elegibles profesionalizadas. *(verificado auditoría: 2026-03-23)*
> **No aplica a**: juegos, cursos, guías (sub-apps), utilidades triviales (cronómetro, dado, espejo, lupa, diapasón, notas, contador-manual, ruleta, radio).
> **Nuevas apps**: aplicar patrón v2.0 en Fase 2 del ciclo de creación según CLAUDE.md.

### 🔴 Candidatos prioritarios (top uso real en analytics — 2026-03-15)

> Apps con más usos reales que aún están pendientes de profesionalizar. Priorizar estas sobre el resto.

- [x] **calculadora-notas** — #5 en ranking (45 usos). ✅ Ya profesionalizada (2026-02-23). *(verificado en auditoría: 2026-03-16)*
- [x] **generador-anagramas** — #7 en ranking (43 usos). ✅ Ya profesionalizada: tabla comparativa, 4 casos de uso, 8 FAQs, guía 6 pasos, 6 tips, warning box. *(verificado en auditoría: 2026-03-16)*
- [x] **generador-tonos** — #11 en ranking (33 usos). ✅ Profesionalizada: tabla 8 rangos de frecuencia, 4 casos de uso, 8 FAQs, guía test de audición 6 pasos, 6 tips, warning box 5 puntos. *(2026-03-16)*
- [x] **conversor-braille** — #10 en ranking (34 usos). ✅ Ya profesionalizada: tabla comparativa 5 tipos, 4 casos de uso, 8 FAQs, guía 6 pasos, 6 tips, warning box 6 puntos. *(verificado en auditoría: 2026-03-16)*

---

### 🟡 Pendientes confirmados (genuinamente sin EducationalSection)

- [x] **generador-utm** — Tabla comparativa 5 parámetros, 4 casos de uso (Google Ads/Email/Instagram/Black Friday), FAQ 5 preguntas, guía 6 pasos, tips + errores comunes. *(2026-03-01)*
- [x] **checklist-coberturas-seguros** — Tabla comparativa 8 tipos de seguros, 4 casos de uso (freelance/familia/hipoteca/jubilación), FAQ 5 preguntas, guía 6 pasos, tips + errores. DisclaimerCard corregida (collapsible: false). *(2026-03-01)*

### 🟡 Nuevos candidatos detectados en barrido (sin EducationalSection)

> Apps reales con potencial educativo que no están en el patrón v2.0 aún.

- [x] **calculadora-alquiler-vs-compra** — Ya tiene EducationalSection. *(verificado: 2026-03-01)*
- [x] **calculadora-suscripciones** — Ya tiene EducationalSection. *(verificado: 2026-03-01)*
- [x] **generador-contrasenas** — Ya tiene EducationalSection. *(verificado: 2026-03-01)*
- [x] **validador-regex** — Ya tiene EducationalSection. *(verificado: 2026-03-01)*
- [x] **calculadora-mcd-mcm** — Ya tiene EducationalSection. *(verificado: 2026-03-01)*
- [x] **paises-del-mundo** — Ya tiene EducationalSection. *(verificado: 2026-03-01)*
- [x] **seguimiento-habitos** — Ya tiene EducationalSection. *(verificado: 2026-03-01)*
- [x] **planificador-menu** — Ya tiene EducationalSection. *(verificado: 2026-03-01)*

### 🟡 Nuevos candidatos reales (barrido 2026-03-01 — genuinamente sin EducationalSection)

> Filtrado: excluidos juegos, cursos, guías y utilidades triviales. Ordenados por potencial educativo + audiencia.

**Alta prioridad** (audiencia amplia, alto valor educativo):
- [x] **calculadora-combustible** — Tabla comparativa gasolina/diésel/GLP/eléctrico, 4 casos de uso, FAQ 6 preguntas, guía 6 pasos, 6 tips eficiencia, warning 6 errores. *(2026-03-01)*
- [x] **calculadora-porcentajes** — Tabla comparativa 5 modos de cálculo, 4 casos de uso (IVA/descuentos/inflación/notas), FAQ 6 preguntas, guía 5 pasos, 6 trucos mentales, warning 5 errores. *(2026-03-01)*
- [x] **calculadora-roommates** — Tabla comparativa 4 métodos de división, 4 casos de uso (estudiantes/viaje/oficina/pareja), FAQ 6 preguntas, guía 5 pasos, 6 consejos convivencia, warning 6 errores. *(2026-03-01)*
- [x] **contador-palabras** — Tabla comparativa 6 tipos de contenido, 4 casos de uso (SEO/email/discurso/RRSS), FAQ 6 preguntas, guía 5 pasos, 6 consejos de escritura, warning 4 errores. *(2026-03-01)*
- [x] **generador-firma-email** — Tabla comparativa 4 plantillas, 4 casos de uso (freelance/empresa/marketing/creativo), FAQ 6 preguntas, guía 5 pasos, 6 buenas prácticas, warning 4 errores. *(2026-03-01)*
- [x] **lista-equipaje** — Tabla comparativa 5 aerolíneas (Vueling/Ryanair/Iberia/EasyJet/WizzAir), 4 casos de uso, FAQ 6 preguntas, guía 5 pasos, 6 trucos de packing, warning 4 errores. *(2026-03-01)*

**Media prioridad** (potencial educativo sólido):
- [x] **calculadora-descuentos** — EducationalSection añadida: tipos de descuento, trampas marketing, FAQ, guía 5 pasos, 6 tips, warning. *(2026-03-01)*
- [x] **calculadora-pintura** — EducationalSection añadida: tipos de pintura, casos por estancia, FAQ, guía 5 pasos, 6 tips, warning. *(2026-03-01)*
- [x] **calculadora-porciones** — EducationalSection añadida: métodos medición, situaciones vitales, FAQ ración vs porción, guía 5 pasos, 6 hábitos, warning. *(2026-03-01)*
- [x] **generador-carruseles** — ✅ Ya profesionalizada (verificado auditoría 2026-03-23).
- [x] **contador-silabas** — ✅ Profesionalizada: tabla fenómenos fonéticos (diptongo/hiato/sinalefa), 4 casos uso, 8 FAQs, guía análisis métrico 6 pasos, 6 tips, warning. *(2026-03-16)*
- [x] **test-velocidad-escritura** — ✅ Profesionalizada: tabla WPM por nivel/profesión, 4 casos uso, 8 FAQs, guía plan 6 semanas, 6 tips, warning. *(2026-03-16)*
- [x] **generador-tipografias** — ✅ Profesionalizada: tabla 5 familias tipográficas, 4 casos uso, 8 FAQs, guía elección 6 pasos, 6 principios, warning. *(2026-03-16)*
- [x] **comparador-textos** — ✅ Profesionalizada: tabla 5 tipos comparación (diff/similitud/hash/semántica), 4 casos uso, 8 FAQs, guía 6 pasos, 6 tips, warning. *(2026-03-16)*
- [x] **conversor-imagenes** — ✅ Profesionalizada: tabla 5 formatos imagen (JPEG/PNG/WebP/GIF/SVG), 4 casos uso, 8 FAQs, guía elección 6 pasos, 6 tips, warning. *(2026-03-16)*
- [x] **test-habitos-saludables** — ✅ Profesionalizada: tabla 5 áreas hábitos, 4 perfiles beneficiarios, 8 FAQs (evidencia científica), guía plan 6 semanas, 6 claves, warning. *(2026-03-16)*
- [x] **planificador-mudanzas** — ✅ Ya profesionalizada (verificado auditoría 2026-03-23).
- [x] ~~**calculadora-percentiles**~~ — Descartada: funcionalidad cubierta por `orientador-percentiles` (infantil OMS), `calculadora-estadistica` (percentiles genéricos) y `estadistica-avanzada`. Sin valor diferencial. *(descartada: 2026-04-01)*

**Potencial educativo específico**:
- [x] **conversor-binario** — Tabla comparativa sistemas numéricos, EducationalSection añadida. *(2026-03-09 — verificado commit 336e1be)*
- [x] **calculadora-sistemas-numericos** — ✅ Ya profesionalizada (verificado auditoría 2026-03-23).
- [x] **conversor-morse** — ✅ Ya profesionalizada (verificado auditoría 2026-03-23).
- [x] **calculadora-edad-mascotas** — ✅ Ya profesionalizada (verificado auditoría 2026-03-23).
- [x] **calculadora-aspectos** — ✅ Ya profesionalizada (verificado auditoría 2026-03-23).

### ✅ Verificadas como ya profesionalizadas (barrido 2026-03-01)

> Estaban marcadas como pendientes pero ya tenían EducationalSection implementada.

- [x] **tabla-periodica** — Historia, comparativa metales/no metales, casos de uso ESO/Bachillerato/Universidad, FAQ, guía estequiometría, tips. 1.020 líneas.
- [x] **creador-paletas** — Comparativa armonías, casos de uso profesionales, FAQ, tips, errores. 733 líneas.
- [x] **calculadora-coste-vivienda** — DisclaimerCard financial, EducationalSection, FAQ avanzado. 827 líneas.
- [x] **calculadora-fondo-emergencia** — ✅ ya implementada.
- [x] **calculadora-tir-van** — ✅ ya implementada.
- [x] **simulador-compraventa-inmueble** — ✅ ya implementada.
- [x] **calculadora-regla-50-30-20** — ✅ ya implementada.
- [x] **planificador-cashflow** — ✅ ya implementada.
- [x] **calculadora-break-even** — ✅ ya implementada.
- [x] **analizador-densidad-seo** — ✅ ya implementada.
- [x] **calculadora-electricidad** — ✅ ya implementada.
- [x] **calculadora-calorias-ejercicio** — ✅ ya implementada.
- [x] **calculadora-colesterol** — ✅ ya implementada.
- [x] **calculadora-estadistica** — ✅ ya implementada.
- [x] **generador-og-images** — ✅ ya implementada.
- [x] **calculadora-tarifa-freelance** — ✅ ya implementada. *(verificado: 2026-03-01)*
- [x] **calculadora-imc** — ✅ ya implementada. *(verificado: 2026-03-01)*
- [x] **calculadora-iva** — ✅ ya implementada. *(verificado: 2026-03-01)*

---

## 🔵 MEJORAS DE APPS EXISTENTES

> Apps ya publicadas que pueden mejorar en calidad, contenido educativo o experiencia.

- [x] ~~**lista-equipaje**: modo "por días de viaje"~~ — Descartada: la app ya tiene categorías personalizables, filtro por tipo/clima/duración y persistencia. El modo por días solo reorganiza la misma información sin valor añadido significativo. *(descartada: 2026-04-01)*

- [x] **calculadora-jubilacion**: Resuelto con `orientador-edad-jubilacion` (nueva app) + sistema dual 2026 integrado en `estimador-pension-publica`. Datos de pensiones actualizados en `data/fiscal/pensiones.ts`. *(2026-04-01)*

- [x] **simulador-hipoteca**: Comparativa fija vs variable vs mixta en un mismo visualizador. Añadido tipo 'mixta' al simulador (2 fases) + panel comparador en tiempo real con los 3 tipos simultáneos + tabla educativa actualizada a 4 columnas. *(2026-03-09)*

- [x] **estimador-irpf + estimador-sueldo-neto**: Integrar deducción por rentas bajas del trabajo (art. 80 bis LIRPF, hasta 340 €/año para rendimientos del trabajo < 18.276 €). Datos centralizados en `data/fiscal/irpf.ts`. *(2026-04-01)*

- [x] ~~**DisclaimerCard medical (Grupo B)**~~ — Descartada: las 8 apps son de bajo riesgo (hábitos, porciones, edad mascotas) y ya tienen disclaimers custom adecuados ("orientativa", "consulta profesional"). Añadir exoneración formal es desproporcionado. *(descartada: 2026-04-01)*

---

## ✨ NUEVAS APPS — Tendencias España 2026

> Ideas detectadas en análisis de tendencias con WebSearch. Selección aprobada por usuario.

### Tendencias abril 2026 (campaña renta, vivienda, SMI, pensiones, energía)

- [x] **test-obligado-declarar-renta** — `finanzas`+`freelance` · Test interactivo: ¿estoy obligado a declarar la Renta 2025? Umbrales 22.000 €/15.876 €, parados, IMV, deducciones rentas bajas. DisclaimerCard `financial` severity `high`. *(2026-04-01)*
- [x] ~~**calculadora-actualizacion-alquiler-ine**~~ — Ya existía `estimador-actualizacion-alquiler`. Actualizado IRAV con datos INE 2025 completo + Q1 2026 + IPC ene-feb 2026. *(2026-04-01)*
- [x] **estimador-smi** — `finanzas`+`legal-fiscal` · App unificada: SMI 2026 neto (IRPF+SS+deducción rentas bajas), atrasos retroactivos y comparativa SMI vs salario medio en 52 provincias. Fusiona 3 propuestas (neto + atrasos + comparador provincial). *(2026-04-01)*
- [x] ~~**simulador-pension-sistema-dual**~~ — Integrado en `estimador-pension-publica`: comparativa automática fórmula clásica (300/350) vs ampliada 2026 (302/352,33). La SS aplica la más favorable. *(2026-04-01)*
- [x] **orientador-edad-jubilacion** — `jubilacion`+`finanzas` · ¿Cuándo me jubilo? Tabla progresiva 2024-2027 por año de nacimiento y años cotizados. 66a 10m en 2026, 67 en 2027. *(2026-04-01)*
- [x] **orientador-deduccion-obras-energeticas** — `inmobiliaria`+`finanzas`+`legal-fiscal` · Orientador 3 deducciones IRPF (20/40/60%) por obras energéticas (DA 50.ª LIRPF). Requisitos, plazos, bases máximas, estimación ahorro fiscal. DisclaimerCard severity `critical`. *(2026-04-01)*
- [x] ~~**estimador-certificado-energetico**~~ — Ya existía `estimacion-certificacion-energetica`. Actualizada con aviso: NO existe prohibición F/G (mito). Obligatorio tener certificado (RD 390/2021). *(2026-04-01)*
- [x] **orientador-alquiler-habitaciones** — `inmobiliaria`+`legal-fiscal` · Orientador sobre reglas del alquiler por habitaciones en zona tensionada (Ley 12/2023 + Prop. Ley 2025 + RDL 8/2026). Techo de renta, +300 municipios declarados, SERPAVI, sanciones. *(2026-04-01)*
- [x] ~~**comparador-smi-sueldo-provincia**~~ — Fusionada en `estimador-smi` (pestaña "Por provincia"). *(2026-04-01)*

### Propuestas descartadas (abril 2026)

> - ~~**calculadora-deduccion-rentas-bajas**~~ — Integrada como mejora en `estimador-irpf` y `estimador-sueldo-neto`. No requiere app nueva. *(2026-04-01)*
> - ~~**calculadora-retenciones-ahorro-30**~~ — El tramo 30% para >300.000 € ya está implementado en `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (`data/fiscal/inmuebles.ts`) y usado por `estimador-plusvalias-irpf`. *(2026-04-01)*

### Tendencias marzo 2026 (propuestas 2026-03-19)

- [x] **simulador-bono-joven-alquiler** — Ya implementada en sesión anterior. *(verificado: 2026-04-01)*
- [x] **orientador-aval-ico** — Ya implementada en sesión anterior. *(verificado: 2026-04-01)*
- [x] **calculadora-costes-teletrabajo** — Ya implementada en sesión anterior. *(verificado: 2026-04-01)*
- [x] **quiz-historia-espana** — Ya implementada en sesión anterior. *(verificado: 2026-04-01)*

### Tendencias anteriores (2026-03-18) — completadas

> Las 5 propuestas de la sesión anterior ya están implementadas (ver sección ✅).

---

## ⚪ IDEAS FUTURAS

> Ideas que requieren más investigación o que son para fases posteriores.

- **Guía interactiva "Montar una SL en España"**: Journey completo con calculadoras integradas (costes, impuestos, pasos legales).
- **Simulador de cartera de ETFs con rebalanceo**: Más avanzado que el simulador actual. Requiere datos históricos embebidos.
- **Generador de plan de negocio básico**: Plantilla estructurada exportable a PDF/texto.
- **Calculadora de huella hídrica**: Complemento a la calculadora de huella de carbono existente.
- **Comparador de operadoras de móvil en España**: Datos embebidos actualizados trimestralmente.

---

## ✅ COMPLETADAS (archivo histórico)

> Historial de tareas finalizadas con fecha de completado.

### Apps nuevas
- [x] **quiz-simbolos-quimicos** — Quiz tabla periódica: 85 elementos, modos símbolo→nombre y nombre→símbolo, 3 dificultades (fácil/medio/difícil), racha, estadísticas y revisión de errores al final. Nuevo data/elementos-quimicos.ts. EducationalSection v2.0. Suites: estudiantes, cultura. *(2026-03-18)*
- [x] **requisitos-nomada-digital** — Orientador elegibilidad Visa Nómada Digital (Ley 28/2022). Doble perfil empleado/freelancer, cálculo ingresos mínimos (200% SMI), checklist 10 requisitos, lista documentación, nuevo módulo data/fiscal/nomada-digital.ts. EducationalSection v2.0 completa. Suites: legal-fiscal, freelance. *(2026-03-18)*
- [x] **estimador-actualizacion-alquiler** — Calculadora IRAV/IPC para actualización de renta de alquiler 2026 según Ley de Vivienda (Ley 12/2023). Doble modo: IRAV trimestral (contratos desde 26/05/2023) e IPC interanual (contratos anteriores). Datos en data/fiscal/alquiler.ts. EducationalSection completa v2.0. Suites: inmobiliaria, legal-fiscal. *(2026-03-18)*
- [x] **checklist-declaracion-renta** — Checklist declaración de la renta 2026 (ejercicio 2025) con 5 perfiles (asalariado/autónomo/pensionista/inversor/arrendador), fechas clave, EducationalSection completa (tabla, 4 escenarios, 8 FAQs, guía 6 pasos, 6 tips, warning). Suites: legal-fiscal, finanzas, freelance. Build 504 páginas OK. *(2026-03-18)*
- [x] **planificador-itinerario** — Organiza días, actividades, horarios y notas de viaje. Exporta a .txt. 100% local. *(2026-02-24)*
- [x] **calculadora-tension-arterial** — Clasificación ESH/ESC 2018 (9 categorías), TAM, presión de pulso, historial localStorage. *(2026-02-24)*
- [x] **planificador-chequeos-medicos** — Checklist 16 revisiones preventivas filtrado por grupo de edad y sexo. Fuente: Ministerio de Sanidad y SEMFyC. *(2026-02-24)*
- [x] **guia-seguro-viaje** — Coberturas recomendadas por destino (Europa/mundo/riesgo) y tipo de viaje. Checklist 12 puntos pre-contratación. *(nota: `calculadora-seguro-viaje` descartada por inviabilidad de estimación de costes — implementada como guía)* *(2026-02-24)*
- [x] **simulador-jet-lag** — Jet lag por diferencia horaria, 35 ciudades, 5 niveles de impacto, recomendaciones por dirección. *(2026-02-23)*
- [x] **quiz-paises-capitales** — Quiz geografía 195 países, 3 modos (capital/país/bandera), 5 dificultades. *(2026-02-23)*
- [x] **checklist-documentos-viaje** — Checklist documentos por tipo destino (España/Europa/Internacional). *(2026-02-23)*
- [x] **juego-ahorcado** — Ahorcado en español, 4 categorías × 30 palabras, SVG progresivo, stats localStorage. *(2026-02-23)*

### Mejoras apps existentes
- [x] **lista-equipaje** — Categorías personalizables: eliminar items (✕), añadir a categoría existente, nueva categoría personalizada, persistencia localStorage. *(2026-02-24)*

### Apps descartadas (con justificación)
- [x] **guia-visados-espana** — Descartada: políticas de visados cambian con frecuencia imprevisible (diplomacia, pandemias). Inviable mantener datos fiables. *(2026-02-25)*
- [x] **calculadora-cuota-autonomo** — Descartada: cuota SS por tramos revisada anualmente. Alta probabilidad de quedarse desactualizada con riesgo real para el usuario. *(2026-02-25)*
- [x] **comparador-asalariado-autonomo** — Descartada: depende de gastos deducibles individuales muy variables; simplificación con riesgo de malinterpretación. *(2026-02-25)*
- [x] **calculadora-retencion-irpf** — Descartada como app independiente (demasiado trivial). Lógica integrada en profesionalización de `generador-facturas`. *(2026-02-25)*
- [x] **quiz-cultura-general** — Descartado: universo abierto inabarcable. Modelo correcto = quizzes de universo acotado (como `quiz-paises-capitales`). *(2026-02-25)*
- [x] **simulador-pension-publica** — Descartado: la SS tiene simulador oficial con datos reales del usuario (Mi SS). Sin ventaja diferencial. *(2026-02-25)*
- [x] **calculadora-irpf-nomina** — Descartado: tablas IRPF se actualizan con PGE. AEAT tiene simulador oficial. Sin ventaja diferencial. *(2026-02-25)*
- [x] **calculadora-reformas-hogar** — Presupuesto estimado por tipo de reforma (10 partidas) y nivel de calidad (básica/estándar/premium). Precios referencia España 2026. DisclaimerCard financial. *(2026-02-25)*

### Mantenimiento y correcciones
- [x] **DisclaimerCard medical — exoneración responsabilidad** — Añadida cláusula explícita en `DefaultContent` (10 apps) y en `calculadora-estadistica-medica`, `calculadora-sueno`, `calculadora-medicamentos-mascotas`. *(2026-02-24)*

### Profesionalizaciones
- [x] **calculadora-fire** — Tabla comparativa 5 variantes FIRE, 4 casos de uso, FAQ 5 preguntas. *(2026-02-23)*
- [x] **calculadora-amortizacion-hipoteca** — Tabla cuota vs plazo, 4 casos de uso, FAQ 5 preguntas (comisiones Ley 5/2019, IRPF, sistema francés). *(2026-02-23)*
- [x] **calculadora-notas** — Tabla comparativa sistemas calificación, 4 casos de uso (ESO/EvAU/ECTS/Erasmus), FAQ 5 preguntas. *(2026-02-23)*
- [x] **calculadora-seguro-vida** — Tabla comparativa (temporal/entera/unit-linked/PIAS), 4 casos de uso (joven/familia/autónomo/jubilado), warning infraasegurarse. DisclaimerCard corregida (no collapsible). *(2026-02-25)*
- [x] **comparador-tipos-seguros** — Guía paso a paso 6 pasos, FAQ legal 6 preguntas. DisclaimerCard variant financial corregida. *(2026-02-25)*
- [x] **generador-facturas** — Tabla comparativa 5 tipos de factura, 4 casos de uso (autónomo/SL/UE/minorista), FAQ fiscal 6 preguntas, warning sanciones LGT. DisclaimerCard sin collapsible. *(2026-02-25)*
- [x] **calculadora-deuda** — Tabla comparativa (Bola de Nieve/Avalancha/Solo Mínimos × 5 criterios), 4 casos de uso, FAQ 6 preguntas (pago mínimo/hipoteca/consolidar/mora), warning ejemplo 5.000€ al 20% TAE. Fix collapsible + type="button". *(2026-02-25)*

### Mantenimiento técnico
- [x] **CSP Enforcement** — Activado enforcement en `vercel.json` + `next.config.ts`. *(2026-02-23)*
- [x] **Seguridad API analytics** — Endpoints protegidos con `x-api-key: ANALYTICS_SECRET`. *(2026-02-23)*
- [x] **Sanitización errores API** — 7 API routes ya no exponen `error.message` interno. *(2026-02-23)*
- [x] **Validación inputs analytics** — Límites de longitud y rango en `track` y `duration`. *(2026-02-23)*
- [x] **Reemplazar xlsx por exceljs** — CVEs críticos eliminados en `conversor-formatos`. *(2026-02-23)*
- [x] **Fix CVEs jsPDF** — 3 CVEs eliminados con `npm audit fix`. *(2026-02-23)*
- [x] **ai-index.json auditado** — 27 apps añadidas. `total_tools` corregido y actualizado a 238. *(2026-02-23)*
- [x] **Dark mode corregido** — 8 CSS modules con fondos claros en estados error/danger corregidos. *(2026-02-23)*

---

## 📋 INSTRUCCIONES PARA CLAUDE CODE

Al iniciar sesión, seguir este orden:
1. Leer este BACKLOG.md
2. Tomar la primera tarea disponible en 🔴 (si hay urgentes)
3. Si no hay urgentes, tomar la primera tarea en 🟡
4. Ejecutar el checklist completo de CLAUDE.md al crear apps
5. Marcar como completada añadiéndola a la sección ✅ con fecha
6. Actualizar el contador de apps totales en la cabecera de este fichero

**Criterio de prioridad**: 🔴 → 🟡 → 🟢 → 🔵
**No iniciar nueva tarea sin completar la anterior** (salvo que requiera sesión separada por alta complejidad).
