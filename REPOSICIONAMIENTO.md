# Reposicionamiento meskeIA — Documento de Seguimiento

> **Fuente de verdad** del proyecto de revisión estratégica iniciado el 2026-05-05.
> Aquí se registra: contexto, decisiones tomadas, qué se ha implementado y qué queda por hacer.
> Actualizar este documento al final de cada sesión que toque el tema.

**Última actualización:** 2026-05-06 (sesión madrugada — JSON-LD top 19 + 50 + decisión apps 0-visitas)

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

1. `tabla-periodica` (341 visitas, 38m de duración media) — Estudiantes
2. `test-perfil-inversor` (292 visitas, 8m duración, 63% recurrentes) — Finanzas
3. `simulador-genetica` (137 visitas, 91m duración) — Bachillerato/Universidad
4. `conversor-braille` (101) — Accesibilidad
5. `simulador-puertas-logicas` (90) — Universidad/FP
6. `generador-anagramas` (87) — Curiosidad
7. `calculadora-notas` (70) — Estudiantes
8. `meskeIA` (home, 58)
9. `juego-memoria` (54)
10. `estimador-compraventa-inmueble` (48)

→ **8 de 12 son educativas o de finanzas personales.**

### 2.4 Hallazgo crítico: la inversión está invertida

| Tipo | Apps | Engagement |
|------|------|-----------|
| **Simuladores** | 16 | 43m duración, 41% recurrentes |
| **Tests** | 18 | 8m duración, **63% recurrentes** |
| **Cursos** | 11 | 3m 51s, 42% recurrentes |
| **Visualizadores** | 113 | **55s** duración, **18%** recurrentes |

→ Tienes **7× más visualizadores que simuladores**, pero los simuladores generan **20× más minutos de uso por app**.

### 2.5 Problema de descubrimiento (el más grave)

- **98,9% de sesiones = 1 sola app por sesión**
- La gente entra desde Google a UNA app y se va
- No hay puente interno que les lleve a otras apps

→ Resolverlo puede multiplicar el tráfico **sin crear ni una app más**.

### 2.6 Geografía

- España: 35% (348 IPs) — la web está localizada solo para España
- Latam: 23% (MX 242, CO 104, AR 103, BO 82, EC 45, PE 38, CL 32, CR 51…)
- USA: 25% (gran parte hispanohablante)

→ **Casi la mitad del tráfico no es España**, pero la web no lo está sirviendo conscientemente (todo en clave fiscal/normativa española).

---

## 3. Reposicionamiento confirmado

**Identidad estratégica adoptada el 2026-05-06:**

> **meskeIA es una herramienta de estudio + finanzas personales, con apertura a la curiosidad.**

Inspirada en la filosofía de la página *Acerca de*: "el conocimiento debe ser un bien compartido y gratuito".

### Implicaciones

1. **Público real**: estudiantes (ESO/Bach/Universidad/FP) + adultos activos en finanzas personales
2. **Público hispanohablante completo**: España + Latam (no solo España)
3. **Eje de curiosidad/ocio**: minoritario pero útil como escaparate
4. **No somos**: toolbox de productividad, suite de marketing, suite de diseño (estos crecieron por acumulación, no por estrategia)

### Implicación práctica para apps nuevas

- Apps **no fiscales-España**: usar términos universales ("impuesto sobre la renta" no "IRPF"), formato decimal flexible, evitar referencias culturales solo de España
- Apps **fiscales-España**: claras como tales, no aparentar universalidad

---

## 4. Plan de mejora del descubrimiento interno

### Objetivo único

**Subir la métrica "apps por sesión" de 1,07 actual a 2,0+** sin crear apps nuevas.

### Por qué es la prioridad

- Mayor ROI conocido (impacto alto, esfuerzo bajo)
- Resuelve el problema raíz identificado en datos
- No requiere decidir "qué borrar" (que era prematuro a 3 meses)

### Plan en 4 fases progresivas

| Fase | Qué se hace | Riesgo | Estado |
|------|------------|--------|--------|
| **0** | Tracking de origen de clics | 🟢 Cero | ✅ COMPLETADA (2026-05-06) — acumulando datos |
| **1** | Componente `ContinuaCon` con datos dinámicos | 🟢 Bajo | ⏳ Pendiente (esperar 3-5 días de datos FASE 0) |
| **2** | Home con tracción real (top semanal, caminos) | 🟡 Bajo | ⏳ Pendiente |
| **3** | Decisión sobre `app-relations.ts` (4.680 líneas curadas) | A decidir | ⏳ Pendiente (depende de FASE 0) |
| **L** | Auditoría Latam-friendly + adaptación apps top | 🟢 Bajo | ✅ COMPLETADA (2026-05-06 tarde) |

### Detalle de FASE 0 — Tracking

**Objetivo**: medir el CTR real de RelatedApps y los pares "viene de → va a", para tener base empírica antes de cualquier rediseño.

**Cambios técnicos**:

1. `RelatedApps.tsx`: añadir `?from=related-{slug-origen}` a cada `href` (usando `usePathname` de Next.js, sin tocar las 724 apps que lo usan).
2. `AnalyticsTracker.tsx`: leer parámetro `?from` y guardarlo en `datos_adicionales.from`.
3. (Posterior) Nueva pestaña "Navegación" en `dashboard-analytics` con:
   - CTR de RelatedApps por app
   - Top pares "from → to"
   - Apps con RelatedApps muerto (CTR <1%)
   - Evolución semanal de "apps por sesión"
   - Origen de visitas (orgánico / interno / share / X / mcp)

**Privacidad**: no rompe la filosofía RGPD-sin-cookies actual. No añade cookies, ni datos personales, ni identifica al usuario. Solo metadato de navegación dentro de `datos_adicionales` (campo que ya existía). No requiere actualizar `/privacidad` ni `/terminos`.

**Plan de medición**:
- 1 semana acumulando datos tras desplegar
- Revisión conjunta antes de pasar a FASE 1

---

## 5. Decisiones tomadas (registro)

| Fecha | Decisión | Motivo |
|-------|----------|--------|
| 2026-05-05 | NO eliminar apps con baja visita | A 3 meses de tracking sin difusión activa, "0 visitas" significa "no descubierta" no "inútil" |
| 2026-05-06 | Adoptar reposicionamiento "estudio + finanzas personales + curiosidad" | Confirmado por datos analíticos y por filosofía de la página *Acerca de* |
| 2026-05-06 | Servir a Latam además de España | 23% del tráfico Latam directo + 25% USA hispanohablante |
| 2026-05-06 | NO tocar visualizadores | Generan SEO long-tail útil. No añadir más, pero no eliminar |
| 2026-05-06 | NO crear apps nuevas hasta resolver descubrimiento interno | Mayor ROI esperado: subir apps/sesión es la palanca |
| 2026-05-06 | Empezar por FASE 0 (tracking) | Sin datos de CTR cualquier rediseño es ideología |

---

## 6. Decisiones a tomar más adelante

- **Latam — alcance**: ¿solo apps no-fiscales? ¿o pivote a algunas adaptadas? (decidir tras FASE 2)
- **Suites infrautilizadas** (Marketing 31 apps, Diseño 30 apps): ¿fusionar en "Técnicas"? ¿mantener? (decidir cuando haya datos de uso por suite)
- **app-relations.ts** (4.680 líneas curadas a mano): mantener / simplificar / sustituir por dinámico (decidir tras FASE 0)
- **Apps fiscales-España**: ¿señalizar visualmente que son solo para España? (mejora UX-Latam)
- **Doblar apuesta en simuladores y tests**: roadmap específico cuando descubrimiento esté resuelto

---

## 7. Bitácora de avances

### 2026-05-05
- Auditoría inicial del catálogo (816 apps, 11→15 suites, 25+ tipologías)
- Diagnóstico estratégico inicial: crisis de identidad, inflación de tipologías, BACKLOG táctico

### 2026-05-06 (mañana)
- Auditoría con datos reales de Turso (3 meses de tracking)
- Identificación de Pareto extremo: 21 apps = 50% del tráfico
- Hallazgo de inversión invertida (visualizadores vs simuladores)
- Confirmación del reposicionamiento por parte del usuario
- Creación de este documento de seguimiento
- **FASE 0 implementada y validada**: tracking `?from=related-{slug}` en `RelatedApps` + lectura en `AnalyticsTracker` (commits `25c3831e` y `756339f3`). Verificado en producción con clics reales del usuario.

### 2026-05-06 (tarde) — Auditoría Latam-friendly + implementación quick wins
- **Auditoría Latam de top 33 apps** completada con datos geográficos reales (23% Latam directo + 25% USA hispanohablante).
- **Hallazgo clave**: la mayoría de menciones España están en bloques educativos, no en lógica de cálculo. Apps técnicamente universales con apariencia "españolizada".
- **Implementación completa de las 6 prioridades**:

  | # | Tarea | Estado |
  |---|-------|--------|
  | 5 | Componente `RegionBadge` con 3 variantes | ✅ |
  | 2 | 2 apps fiscales etiquetadas con `<RegionBadge variant="es-only" />` (`estimador-compraventa-inmueble`, `orientador-tarifa-freelance`) | ✅ |
  | 6 | Regla "1.bis Lenguaje Latam-friendly" añadida en `CLAUDE.md` proyecto | ✅ |
  | 3 | Quick wins de copy en 9 apps top (ESO/Bachillerato/selectividad → universal) | ✅ |
  | 4 | Bloques educativos pulidos en 3 apps (`estimador-prestamos`, `calculadora-fechas`, `estimador-cartera-inversion`) | ✅ |
  | 1 | `calculadora-notas` ampliada con 6 escalas Latam (MX, AR, CL, CO, PE, VE), 15 resultados de conversión, tabla con 7 columnas, tab EvAU marcado como 🇪🇸 | ✅ |

- **Total modificado**: 14 apps + 1 componente nuevo + 1 doc proyecto.
- **Tiempo**: ~2,5 horas.
- **Build**: 0 errores, 1088 páginas generadas.
- **Apps top que NO necesitaban cambio** (ya Latam-friendly): `juego-memoria`, `curso-negociacion`, `generador-gradientes`, `curso-pensamiento-sistemico`, `conversor-braille`, `generador-anagramas`, `calculadora-cocina`, `calculadora-estadistica`, `contraste-colores`, `test-perfil-inversor`.

### 2026-05-06 (sesión tarde-noche) — Cobertura completa de RegionBadge

Tras el sweep inicial de las 2 apps fiscales del top 33, se completa la cobertura de **todas las apps fiscales-España** del catálogo:

- **Total apps con `<RegionBadge>` ahora: 56** (vs 2 antes de esta sesión)
- **52 con variant `es-only`**: cálculo fiscal/legal estructural España (IRPF, RETA, ITP/AJD, IBI, ISD, plusvalía, SAAD, prestaciones SS, modelos AEAT…)
- **4 con variant `es-data`**: tests/planificadores universales con datos referenciales España (`test-zarit-cuidador`, `test-estilo-parental`, `planificador-gastos-bebe`, `visualizador-ciclo-vida-freelance`, `visualizador-tipos-cliente-freelance`)

**Método**: 3 scripts incrementales con criterio de seguridad (skip si ya tiene badge, fallback al patrón `</header>` si no encuentra el patrón ideal). Bug del regex (coma trailing en imports multilínea) corregido con script de fix. Build verificado: 1088 páginas, 0 errores.

**Apps no etiquetadas conscientemente**: `simulador-hipoteca`, `estimador-hipoteca`, `estimador-prestamos` (ya pulidas con copy multi-país en sesión anterior), `generador-facturas` (formato puede ser universal, requiere revisión manual), apps puramente educativas/lúdicas.

### 2026-05-06 (sesión noche) — Mejora de RelatedApps en top apps (opción C)

Mejorar el descubrimiento interno (1,07 apps/sesión actual → objetivo 2,0+) en las apps que generan más tráfico. Cambios en `data/app-relations.ts`:

| App | Cambio aplicado |
|-----|-----------------|
| **tabla-periodica** (#1, 344 visitas) | De 3 apps todas química → 4 apps con cross-sell estudiantil (genética, calc-notas, glosario) |
| **test-perfil-inversor** (#2, 293 visitas) | De 4 apps todas perfiles/sesgos → mezcla con apps de **acción** (cartera, interés compuesto) |
| **simulador-genetica** (#3, 147 visitas, 102m duración) | De familia biomedicina genérica → cross-sell estudiantil top |
| **calculadora-notas** (#7, 70 visitas) | De productividad genérica → apps top educativas (tabla, genética, glosario) |
| **simulador-genetica** (#3) | Bridge a apps top educativas para aprovechar la audiencia de máxima permanencia |
| **generador-anagramas** (#6, 87 visitas) | De solo texto → mezcla con juegos de palabras (Wordle, Ahorcado) |
| **curso-optimizacion-ia** (#12) — **GAP cerrado** | NO tenía entrada → ahora tiene 4 apps cruzadas con otros cursos y herramientas |
| **curso-pensamiento-sistemico**, **curso-negociacion** | También sin entrada → añadidas con cross-cursos + herramientas relevantes |

Títulos personalizados añadidos para los 3 cursos en `getRelatedAppsTitle` ("Otros cursos meskeIA").

**Hipótesis a validar**: con FASE 0 ya activa midiendo el `?from=related-{slug}`, en 1-2 semanas sabremos:
- Si los nuevos pares cross-categoría (química → matemáticas, anagramas → juegos) funcionan
- Si los cursos cerrar el gap mueve la métrica de apps por sesión
- Qué relaciones siguen siendo "muertas" para mejorar más

### 2026-05-06 (sesión noche tardía) — Filtro de datacenters cloud (opción E)

Auditoría de geografía sospechosa reveló **~215 eventos de tráfico no humano no detectado** (6,8% del total) procedente de:
- **Tencent Cloud HK** (~79 eventos, 75 IPs distintas, duración 0s)
- **Tencent Cloud China continental** (~62 eventos, 60 IPs)
- **AWS Singapur** (~28 eventos)
- **Episodio puntual Kazajistán** (46 eventos en 3 minutos, IP única)

La hipótesis del usuario sobre VPN era parcialmente correcta, pero la mayoría son **scrapers desde datacenters cloud**, no humanos con VPN. Detectado por patrón típico: 1 IP por visita + duración 0s + rangos IP de proveedor cloud conocido.

**Implementación**: añadida constante `DATACENTER_PATTERNS` y función `esIpDatacenter()` en `app/api/analytics/track/route.ts`. Los eventos de IPs en estos rangos se marcan como `modo='bot'` y aparecen en la fila "Bots" del dashboard (no contaminan el "Total Real").

**Patrones cubiertos** (rangos detectados empíricamente):
- Tencent Cloud: `43.128/15`, `43.152/14`, `49.232.x`, `82.156-157.x`, `101.32.x`, `101.42.x`, `119.28.x`, `124.156.x`, `129.226.x`, `140.143.x`, `150.109.x`, `152.136.x`, `192.144.x`
- AWS Singapur: `47.128-129.x`, `18.136.x`, `43.172-173.x`

**Mantenimiento**: si en futuras auditorías aparecen nuevos rangos de scraping en el dashboard de geografía, añadirlos a la lista. Build verificado: 1088 páginas, 0 errores.

### 2026-05-06 (sesión madrugada) — Auditoría SEO de top 19 apps + quick fixes (opción B)

Auditoría SEO de las 19 apps top reveló score medio **6,2/14** y 3 patrones sistémicos:
- 19/19 sin `alternates.canonical` (las apps top no usan `generateBaseMetadata` que ya lo provee)
- 19/19 sin JSON-LD / Structured Data
- 18/19 con title largo (>60 chars); 5 con title que se trunca en Google (>70 chars)
- 4 con description larga (>180 chars) que también se trunca

**Implementado** (opción B = quick fixes + canonical sistemático):

5 titles acortados (problema crítico de truncado en SERP):
- `curso-optimizacion-ia`: 107 → 64 chars
- `visualizador-algoritmos`: 86 → 62 chars
- `estimador-compraventa-inmueble`: 82 → 58 chars
- `generador-loteria`: 77 → 62 chars
- `calculadora-cocina`: 75 → 61 chars

4 descriptions acortadas (problema de truncado):
- `simulador-puertas-logicas`: 214 → 168 chars
- `visualizador-algoritmos`: 203 → 162 chars
- `curso-optimizacion-ia`: 202 → 153 chars
- `curso-negociacion`: 188 → 156 chars

Canonical absoluto añadido a las 19 apps top (`alternates.canonical: 'https://meskeia.com/{slug}/'`). Importante ahora que existe el parámetro `?from=related-{slug}` del tracking FASE 0: Google podría indexar variantes y considerarlas duplicadas.

**Pendiente para próxima sesión SEO**:
- JSON-LD / Structured Data (Prioridad 2): helper genérico aplicado a las 19 apps top. Permite rich snippets, FAQ, breadcrumb. Requiere decisión de diseño (¿WebApplication? ¿Course? ¿FAQ por app?).
- Resto del catálogo (~800 apps): si el patrón funciona en top 19, replicar a las siguientes 100-200.

#### Nota técnica: cobertura de canonical en TODA la web (verificado 2026-05-06)

Pregunta surgida tras los cambios: "¿el canonical solo está en las 19 apps top, qué pasa con las otras ~640?"

**Respuesta: TODAS las apps de meskeIA tienen canonical funcional. Verificado con curl en producción.**

Cómo funciona:
- `app/layout.tsx` (root) usa `generateBaseMetadata()` de `lib/metadata.ts`
- `generateBaseMetadata()` define `metadataBase: 'https://meskeia.com'` + `alternates: { canonical: './' }`
- Por la herencia de metadata de Next.js 13+, **toda página que NO declare `alternates` propio** hereda la del root layout
- `canonical: './'` con `metadataBase` resuelve automáticamente a la URL completa de la página actual

Verificación empírica (curl a producción 2026-05-06):
- `algebra-ecuaciones` (sin canonical en su metadata.ts) → HTML servido contiene `<link rel="canonical" href="https://meskeia.com/algebra-ecuaciones/"/>` ✅
- `temporizador-pomodoro` (sin canonical en su metadata.ts) → idéntico ✅

Cobertura real (727 metadata.ts contados):
| Tipo | Cantidad | Canonical |
|------|---------:|-----------|
| Con `alternates` explícito en metadata.ts | 89 | ✅ Explícito |
| Sin `alternates` propio | ~640 | ✅ Heredado del root |

Los 19 canonicals que se añadieron explícitamente en esta sesión son **redundantes técnicamente** (ya funcionaban vía herencia) pero útiles para:
- Auditoría rápida con grep
- Predictibilidad si alguien toca `lib/metadata.ts`
- Comportamiento explícito en las apps de mayor tráfico

**Implicación**: NO hay que aplicar canonical a las 640 apps restantes. Ya funcionan correctamente.

**Caso a vigilar**: si en el futuro una app específica añade `alternates: { ... }` a su metadata.ts pero olvida `canonical`, o lo escribe mal, romperá su SEO. Auditar con grep si se sospecha.

### 2026-05-06 (sesión madrugada — auditoría rutas dinámicas) — Bug de canonical en cursos detectado y corregido

Auditoría de las rutas dinámicas (`/visualizador-historia/[slug]/` y subrutas de cursos `/curso-X/[capitulo]/[leccion]/`) tras el SEO sweep anterior. Verificado todo con `curl` en producción.

**Hallazgos**:

| Ruta | Estado | Mecanismo |
|------|--------|-----------|
| `/visualizador-historia/[slug]/` (101 slugs) | ✅ Correcto | `generateMetadata()` con canonical absoluto por slug |
| Guías journey `/guia/X/` (8 rutas) | ✅ Correcto | Sin canonical hardcodeado en metadata.ts → herencia root |
| Cursos sin canonical hardcodeado (11 de 13) | ✅ Correcto | Herencia root resuelve a URL actual |
| **Cursos `curso-optimizacion-ia` y `curso-negociacion`** | ❌ Bug → ✅ Corregido | Layout cascadeaba canonical fijo a TODAS las lecciones |

**Detalle del bug**:

El `layout.tsx` de cada curso hace `export { metadata } from './metadata'`. En el SEO sweep anterior se añadió `alternates: { canonical: 'https://meskeia.com/curso-X/' }` a 2 cursos del top 19. Como Next.js cascadea metadata de layouts a todas las páginas hijas, esto provocó que **20 lecciones heredaran el canonical de la homepage del curso** — Google las habría tratado como duplicados.

Verificado con `curl`:
- Antes: `https://meskeia.com/curso-negociacion/preparacion/fundamentos-negociacion/` → canonical apuntaba a `/curso-negociacion/`
- Después del fix: cada lección obtiene su canonical correcto vía herencia del root layout (que usa `metadataBase` + `canonical: './'`)

**Fix aplicado**: eliminado el bloque `alternates: { canonical: ... }` de:
- `app/curso-optimizacion-ia/metadata.ts`
- `app/curso-negociacion/metadata.ts`

Las homepages de ambos cursos siguen teniendo canonical correcto vía herencia (mismo patrón verificado en las ~640 apps sin canonical explícito).

**Build**: 1088 páginas, 0 errores.

**Lección aprendida**: cuando una app tiene rutas hijas (cursos, contenedores), el `layout.tsx` no debe llevar `canonical` hardcodeado en su metadata. La herencia del root layout es la solución correcta y se aplica automáticamente.

**Total auditoría**: 0 problemas en historias dinámicas (verificadas), 0 en guías, 2 cursos con bug (corregidos).

### 2026-05-06 (sesión madrugada — JSON-LD en top 19) — Structured Data desplegado

Aplicado JSON-LD / Structured Data a las 19 apps top (las mismas del SEO sweep anterior). Habilita rich snippets en Google y permite que IAs (ChatGPT, Perplexity) reconozcan mejor el contenido como app web.

**Helper aprovechado**: `lib/schema-templates.ts` (ya existía con `generateWebAppSchema`, `generateFAQSchema`, `generateHowToSchema`, etc.). No fue necesario crear nada nuevo.

**Patrón aplicado** (per app):
1. `metadata.ts`: `import { generateWebAppSchema } from '@/lib/schema-templates'` + `export const jsonLd = generateWebAppSchema({...})`
2. `layout.tsx`: importa `jsonLd` y renderiza `<script type="application/ld+json">` antes de `{children}`

**Por qué `layout.tsx` y no `page.tsx`**: las páginas top tienen múltiples estados/returns (ej. `test-perfil-inversor` tiene 3 returns: start, quiz, resultado). Si el `<script>` va dentro del `page.tsx` solo aparece en uno de los estados. Al ponerlo en el `layout.tsx` (server component), aparece SIEMPRE antes del contenido, sin depender del estado del componente cliente.

**Categorías Schema.org asignadas**:

| Categoría | Apps |
|-----------|------|
| `EducationalApplication` (10) | tabla-periodica, simulador-genetica, simulador-puertas-logicas, calculadora-notas, juego-memoria, calculadora-estadistica, calculadora-geometria, contador-silabas, visualizador-algoritmos, curso-optimizacion-ia, curso-negociacion |
| `FinanceApplication` (2) | test-perfil-inversor, estimador-compraventa-inmueble |
| `UtilityApplication` (6) | conversor-braille, generador-anagramas, calculadora-cocina, creador-paletas, generador-loteria, generador-tonos |

**Verificación**: el build genera 2 schemas por página top — el `WebSite` global (root layout) + el `WebApplication` específico de la app. Confirmado en HTML estático (`.next/server/app/tabla-periodica.html`).

**Nota sobre cursos**: el JSON-LD del `layout.tsx` cursos cascadea a todas las lecciones (`/curso-X/Y/Z/`). Esto es intencional y beneficioso: Google ve cada lección como parte del curso. Si en el futuro queremos schemas por lección, tocaría refactor por lección.

**Build**: 1088 páginas, 0 errores.

**Pendiente para próxima sesión SEO** (cuando datos justifiquen):
- Replicar JSON-LD a las siguientes 100-200 apps
- Considerar `Course` schema específico (mejor que WebApplication para los 2 cursos top)
- FAQ schema en apps con bloques de preguntas frecuentes (mayor probabilidad de rich snippets)

### 2026-05-06 (sesión madrugada — JSON-LD ampliado a top 50 siguientes)

Tras validar las top 19 con Google Rich Results Test (✅ 1 elemento válido, warning opcional `aggregateRating` ignorado intencionalmente), se extiende el JSON-LD a las siguientes 50 apps por tráfico.

**Identificación**: query Turso (top 300 ordenadas por visitas reales, excluyendo bots/MCP/ChatGPT, excluyendo las ya con jsonLd y la home `meskeIA`), filtrando apps con folder existente. Resultado: 50 apps válidas con visitas entre 11 y 63.

**Script de auto-aplicación**: `scripts/apply-jsonld-batch.mjs`. Para cada app:
1. Extrae `title` y `description` del `metadata.ts` existente
2. Asigna `applicationCategory` por patrón del slug (FinanceApplication para hipotecas/IVA/inversión, EducationalApplication para cursos/simuladores/glosarios, UtilityApplication para conversores/generadores)
3. Añade `import { generateWebAppSchema }` y `export const jsonLd`
4. Modifica el `layout.tsx` (creando uno si no existe, ej. guías journey)

**Resultados**:
- 46 apps con metadata + layout actualizados
- 4 apps que ya tenían `jsonLd` manual pre-existente (`calculadora-fechas`, `enchufes-por-pais`, `generador-contrasenas`, `presupuesto-viaje`): solo se actualizó el layout para cargarlo
- 1 caso que requirió fix manual (`curso-decisiones-inversion`: layout con formato multilínea no detectado por la regex del script)
- 4 layouts nuevos creados para guías journey (`guia/comprar-casa`, `guia/invertir`, `guia/freelance`) y otras (`ejercicios-vocalizacion`, `planificador-rutinas`, `comparador-formas-juridicas`)
- 4 layouts de cursos con `CourseProvider` actualizados con regex específico

**Verificación**: 50/50 apps con `WebApplication` schema en HTML estático generado (`.next/server/app/...html`). Build limpio: 1088 páginas, 0 errores.

**Cobertura total tras este sweep**: 19 (top SEO sweep) + 50 (este) + ~20 con jsonLd previo manual = **~89 apps** con JSON-LD activo (vs ~20 en sesión anterior).

**Calidad del schema en este lote**: features genéricos ("Funciona en navegador, sin registro, gratis, en español") frente a features detallados de las 19 top. Decisión consciente: priorizar cobertura sobre detalle. Si Search Console muestra tracción en alguna app concreta, se puede enriquecer manualmente ese lote después.

---

## 8. Métricas a seguir

| Métrica | Valor actual (2026-05-05) | Objetivo |
|---------|--------------------------|----------|
| Apps por sesión | 1,07 | 2,0+ |
| % catálogo descubierto | 61,3% | 80%+ |
| Recurrencia global | 28,5% | 40%+ |
| CTR RelatedApps | (acumulando desde 2026-05-06) | medir y luego optimizar |
| % tráfico Latam global | 23% | 30%+ a 1 mes |
| `calculadora-notas` % Latam | 4% | 20%+ a 1 mes (tras escalas Latam) |
| Apps con >40% Latam | 11 | 18+ a 1 mes |

---

## 9. Documentos relacionados

- `BACKLOG.md` — Tareas tácticas (cola corta)
- `CHANGELOG.md` — Historial técnico
- `DISCLAIMER-POLICY.md` — Política legal de las apps
- `data/applications.ts` — Catálogo
- `app/dashboard-analytics/page.tsx` — Dashboard de analytics

---

**Próximo paso al retomar:**
1. Revisar datos de tracking FASE 0 (CTR de RelatedApps por app, top pares "from→to") tras 3-5 días de acumulación.
2. Comprobar si la apertura Latam de `calculadora-notas` y los quick wins de copy mueven el % Latam (medir en 2-3 semanas).
3. Decidir parámetros de FASE 1 (componente `ContinuaCon`) con datos reales.
4. **Sweep adicional JSON-LD** (revisar ~2026-08-06): aplicar el patrón a las apps que hayan ganado tráfico en los últimos 3 meses, siempre que Search Console muestre tracción en las 89 actuales.

**Pospuesto por inmadurez de los datos** (decisión 2026-05-06):
- **Análisis de apps con 0 visitas**: sería medir el mundo *antes* de las palancas que se han activado en estas mismas sesiones. Concretamente:
  - Difusión en X iniciada hace solo 1 semana
  - `RelatedApps` mejorado en top apps en esta sesión (cross-linking necesita semanas para internalizarse)
  - JSON-LD desplegado hoy (Google indexa a su ritmo)
  - 50 apps top con SEO mejorado pendiente de verse efecto
- **Criterio para retomarlo**: mínimo 2-3 meses de difusión activa + nuevo SEO maduros. Antes de eso, "0 visitas" sigue significando "no descubierta", no "inútil".
