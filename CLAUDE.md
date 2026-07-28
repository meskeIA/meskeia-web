# CLAUDE.md - Instrucciones específicas del proyecto meskeia-web

> **NOTA**: Este archivo complementa las instrucciones globales en `~/.claude/CLAUDE.md`
> Las reglas comunes (paleta meskeIA, TypeScript, formato español, etc.) están en el archivo global.

## Proyecto: meskeia-web

### Ubicación
- **Repositorio**: `C:\Users\jaceb\meskeia-web`
- **Hosting**: Vercel (meskeia.com)
- **Despliegue**: Automático via GitHub push a main

---

## Arquitectura de Clasificación: Suites Temáticas

meskeIA organiza las apps en 13 Suites Temáticas (clasificación NO excluyente — una app puede pertenecer a múltiples suites).

> **Histórico**: el sistema de "Momentos" (cruce con suites) se eliminó el 2026-05-06 al volverse contraproducente con +800 apps (conteos absurdos como "Estudiando 446 apps" no permitían descubrimiento real).

### Suites (13) - "¿Qué problema resuelve?"

| ID | Suite | Icono | Descripción |
|----|-------|-------|-------------|
| `accesibilidad` | Accesibilidad e Inclusión | ♿ | Autismo, TDAH, dislexia, discapacidad |
| `cultura` | Cultura General | 📚 | Conocimiento, referencias, divulgación |
| `diseno` | Diseño y Contenido | 🎨 | Diseño, desarrollo, SEO, redes sociales (fusión 2026-05-06) |
| `estudiantes` | Estudiantes | 🧮 | Matemáticas, ciencias, estudio reglado |
| `finanzas` | Finanzas e Inversión | 📈 | Ahorro, inversión, planificación |
| `freelance` | Freelance y Autónomo | 💼 | Herramientas para independientes |
| `tecnicas` | Herramientas Técnicas | 🔧 | Herramientas especializadas |
| `inmobiliaria` | Inmobiliaria y Hogar | 🏘️ | Hipotecas, alquiler, gestión hogar |
| `juegos` | Juegos y Ocio | 🎲 | Diversión y entretenimiento |
| `legal-fiscal` | Legal, Fiscal y Patrimonio | ⚖️ | Impuestos, herencias, jubilación, pensiones (fusión 2026-05-06) |
| `productividad` | Productividad | ⚡ | Organización personal |
| `salud` | Salud y Bienestar | 🏥 | Salud, nutrición, mascotas |
| `viajes` | Viajes y Turismo | ✈️ | Planificación de viajes |

### Archivos de datos

| Archivo | Descripción |
|---------|-------------|
| `data/suites.ts` | Definición de las 13 suites |
| `data/applications.ts` | Base de datos de apps |
| `data/implemented-apps.ts` | URLs de apps implementadas |
| `data/app-relations.ts` | Cross-linking entre apps |
| `public/ai-index.json` | **Auto-generado en build** desde applications.ts — no editar manualmente |
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

## Template visualizador-historia/[slug]

Ruta dinámica para cronologías históricas. Cada historia = un archivo `data/historias/[slug].ts` + registro en `data/historias/index.ts`.

### Slugs activos

Catálogo cerrado (2026-05-09) con ~170 archivos en `data/historias/` — la lista viva está en `data/historias/index.ts`, NO mantener listas de slugs en docs. Las cronologías se sirven también en el vertical CRONICUM (`cronicum.com`, host-rewrite); una cronología nueva requiere además registrar su slug en `data/cronicum/puertas.ts` o no aparece en el portal.

### Workflow óptimo: crear múltiples historias en paralelo

**Fase paralela** (N agentes, uno por historia — no tocan archivos compartidos):
- Cada agente crea SOLO `data/historias/[slug].ts`
- Verifica con `npx tsc --noEmit` una vez y termina
- PROHIBIDO en agentes: `npm run build`, modificar index.ts, applications.ts, etc.

**Fase secuencial** (director de proyecto después de que todos los agentes terminan):
```
1. data/historias/index.ts  — añadir imports + entradas en registry
2. data/applications.ts     — añadir entradas con suites
3. data/implemented-apps.ts — añadir URLs
4. data/app-relations.ts    — añadir bloques appKey + cross-links mutuos
5. npm run build            — generateStaticParams() prerenderiza todo automáticamente
```

### Reglas de UX obligatorias (NO modificar)

Verificadas con el usuario y validadas en producción (2026-05-03):

| Tab | Comportamiento correcto |
|-----|------------------------|
| **Tab 1 — Línea del Tiempo** | Clic en período = toggle de panel **inline** debajo del SVG. **Nunca** navegar a otro tab. |
| **Tab 2 — Período en Detalle** | Botones fecha en flex-wrap + tarjeta grande con header coloreado + botones `← Anterior / Siguiente →` debajo con contador. |
| **Tab 3 — Comparativa** | **Tabla HTML** con 5 columnas (Período, Rango, Categoría, Obra icónica, Ámbito) + filtros por botones de categoría + buscador arriba. |
| **Tab 4 — Contexto Histórico** | Eras apiladas en **flex-column** (una sola columna), `border-left: 4px solid` por era, badges de hitos con color de categoría. |

### Estructura de datos (HistoriaData)

- `hitos[]`: **10 períodos** con `id, nombre, anioInicio, anioFin, color, categoria, descripcion, obraIconica, paises[]`
- `eras[]`: **exactamente 6 eras** con `nombre, desde, hasta, icono, hitosDestacados[], eventos[]`
- `categorias`: mapa `id → etiqueta` (**6-8 categorías**)
- `colores`: mapa `id → color hex` — **mismas claves exactas** que `categorias`, ni una más ni una menos
- `disclaimer: 'exempt'` para historia (educativo puro)
- `educativo` v2.0 con tamaños fijos: `intro` + `tablaComparativa[6]` + `escenarios[4]` + `faq[5]` + `pasos[5]` + `tips[4]` + `errores[4]`

### Restricciones críticas (errores frecuentes)

1. **`hitosDestacados` en eras**: usar el **`nombre`** exacto del hito, no el `id`. El template busca `data.hitos.find(h => h.nombre === nombre)`.
2. **Eras continuas**: el rango `desde/hasta` de las 6 eras debe cubrir `anioInicio→anioFin` sin huecos ni solapamientos.
3. **IDs de hitos**: kebab-case sin acentos ni caracteres especiales (`'reino-antiguo'`, `'conquista-constantinopla'`).
4. **Años negativos**: `anioInicio: -3100` = 3100 a.C. El template convierte automáticamente para mostrar.
5. **Suites estándar** para apps de historia: `suites: ["cultura", "estudiantes"]`.
6. **Archivo de referencia**: `data/historias/roma.ts` — el más completo y correcto para copiar la estructura.

### appKey en app-relations.ts

El appKey sigue el patrón `visualizador-historia-[slug]` (con guión, sin slash).

---

## Sección Guías

Las Guías son **landing pages** que agrupan herramientas para un **proceso de decisión a corto-medio plazo** con implicaciones económicas/legales en España.

### Características de una Guía

- **Decisión concreta**: El usuario debe elegir entre alternativas
- **Journey claro**: Proceso con inicio y fin definidos
- **5-7 herramientas**: Apps meskeIA existentes que cubren el proceso
- **Audiencia amplia**: No nichos técnicos específicos

### Guías implementadas

15 guías-journey en `app/guia/*/` — la lista viva está en `data/guides-journey.ts`, NO mantener tablas de guías en docs.

**Registro de una guía nueva (2 archivos OBLIGATORIOS)**: `app/guia/page.tsx` (array `guias`) + `data/guides-journey.ts` (array `guidesJourney`). Olvidar el segundo = la guía no aparece.

**Ver**: `app/guia/*/` para ejemplos completos

---

## Política de Disclaimers (OBLIGATORIO)

**Documento completo**: `_private/DISCLAIMER-POLICY.md` — leer SIEMPRE antes de crear una app.

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

**Nivel por defecto de cada suite** → ver tabla completa en `_private/DISCLAIMER-POLICY.md`.

---

## Registro de un simulador en Stemum

**Un solo sitio**: una entrada en `STEMUM_APPS` (`data/stemum.ts`), en la disciplina que le toque. Esa entrada es a la vez la pertenencia (breadcrumb, host-rewrite del proxy, contadores del hero) **y la tarjeta** que pinta la parrilla de `/stemum/[disciplina]/`. El orden dentro de la disciplina es el orden de la parrilla. Además, como cualquier app: `data/applications.ts` + `data/implemented-apps.ts` + `data/app-relations.ts`.

> **Histórico (2026-07-28)**: la parrilla era un array `APPS` hardcodeado en cada `app/stemum/[disciplina]/page.tsx`, así que registrar una app pedía DOS listas. Olvidar la segunda dejaba la app contada en el hero pero **sin tarjeta que la enlazase, y sin dar ningún error** — le pasó a `simulador-logica-secuencial` y a `ajustar-ecuaciones-quimicas`. Ahora cada parrilla se deriva de `appsDeDisciplina(disciplina)`.

**Candado**: `npm run check:stemum` — lo ejecuta también `npm run build`, y **rompe el build** si falla. Verifica que cada slug del catálogo tenga su carpeta en `app/`, esté en `implemented-apps.ts` y en `applications.ts`, que la disciplina exista, y que ninguna parrilla vuelva a listar apps a mano.

---

## Material de apoyo de Stemum (tablas de consulta)

Las tablas de consulta STEM (`app/tabla-*`) son un **contenedor subordinado** del portal Stemum: no son simuladores, no cuentan en el hero ni en los contadores de disciplina, y no entran en las parrillas de `/stemum/[disciplina]/`. Viven en la sección `stemum.com/material-apoyo/`.

**Criterio de admisión**: buscador SIEMPRE + al menos una capa que un PDF no pueda dar. Esa capa cambia por disciplina — demostración en matemáticas, ejemplo real o formulador en química, equivalencias y orden de magnitud en física. Una lista plana se queda en meskeIA y no entra en Stemum.

**Registro de una tabla nueva (4 archivos OBLIGATORIOS)**: `data/applications.ts` + `data/implemented-apps.ts` + `data/app-relations.ts` + **`STEMUM_MATERIAL_APOYO` en `data/stemum.ts`**. Olvidar el cuarto = la tabla existe en meskeIA pero no aparece en Stemum (aquí sí es silencioso: el candado comprueba las entradas que existen, no puede echar de menos una tabla que nadie declaró). Mismo agujero que `data/cronicum/puertas.ts` en las cronologías.

**Cross-linking bidireccional**: además de que la tabla enlace a sus simuladores, el simulador equivalente DEBE enlazar de vuelta a la tabla en `app-relations.ts`. Es el circuito que convierte una visita de consulta en una visita de exploración y al revés.

**Referencia para copiar**: `app/tabla-derivadas/` (buscador con foco automático, filtros por categoría con `aria-pressed`, filas desplegables con `aria-expanded` y ejemplo resuelto en cada una).

---

## Reglas OBLIGATORIAS al crear nuevas apps

### 1. Cada app DEBE tener al menos una Suite

```typescript
// En data/applications.ts
{
  name: "Calculadora de IVA",
  suites: ['freelance', 'tecnicas'],  // OBLIGATORIO: mínimo 1
  icon: "🧾",
  // ...
}
```

### 1.bis Lenguaje Latam-friendly (OBLIGATORIO desde 2026-05-06)

meskeIA sirve a todo el público hispanohablante (España + Latam = ~50% del tráfico). En toda app NUEVA, evitar términos exclusivos de España salvo que la app sea fiscal-España (ver tabla más abajo):

| Evitar (España-only) | Preferir (universal) |
|---|---|
| ESO, Bachillerato | secundaria, preparatoria, educación media |
| selectividad, EBAU, EvAU, PAU | examen de admisión universitaria |
| sobresaliente / notable / aprobado (sin contexto) | añadir nota numérica + tabla equivalencias |
| DNI, NIE, NIF, CIF | documento de identidad |
| AEAT, Hacienda española | autoridad fiscal de tu país |
| CCAA, comunidad autónoma | región / estado / provincia |
| Madrid, Barcelona como ejemplos | usar ciudad neutra o varias |
| "festivos en España" | "festivos de tu país" |

**Apps fiscales-España estructurales** (IRPF, IVA español, ITP/AJD, RETA, ISD…): añadir `<RegionBadge variant="es-only" />` justo después del hero. Ver componente `components/RegionBadge.tsx`.

**Apps con datos de referencia España pero metodología universal** (intereses, finanzas genéricas con ejemplos en €): usar `<RegionBadge variant="es-data" />`.

**Reglas técnicas adicionales**:
- Parser numérico: usar `parseSpanishNumber` que ya admite `1,234.56` y `1.234,56`
- Moneda: si no es contable-España, considerar dejar el símbolo configurable o usar genérico
- En bloques educativos, citar normativa España solo cuando sea relevante; preferir ejemplos universales

### 1.quater Cifras del catálogo (OBLIGATORIO desde 2026-05-06)

Las cifras del catálogo (número de apps, visualizadores, cursos, etc.) **solo aparecen vía variable** importada desde `@/data/implemented-apps` (`TOTAL_IMPLEMENTED_APPS`). **PROHIBIDO hardcodear números** de apps en textos UI/SEO/JSON-LD.

**Por qué**: El proyecto crece rápido (84 → 220 → 824 en pocos meses) y los números hardcoded quedan obsoletos sin aviso. Históricamente ha pasado en `FAQ.tsx`, `app/layout.tsx` (JSON-LD) y otros sitios. Cualquier cifra hardcoded es deuda técnica garantizada.

**Regla operativa**:
- Si una pieza de UI **necesita** la cifra para su mensaje → importar `TOTAL_IMPLEMENTED_APPS` y usar template literal: `` `${TOTAL_IMPLEMENTED_APPS} aplicaciones...` ``
- Si una pieza **no la necesita** → eliminarla en lugar de dejar un número que envejecerá. Ejemplo: la FAQ "¿son realmente gratuitas?" no necesita decir "todas las 84 apps", basta con "todas las aplicaciones".
- En JSON-LD/Schema.org: la `description` no requiere cifra, mejor omitirla.

**Auditoría manual periódica**: `grep -rE "\b[0-9]{2,4}\b\s+aplicaciones?" --include="*.tsx" --include="*.ts" --include="*.md"` para detectar regresiones.

### 1.ter JSON-LD / Structured Data (OBLIGATORIO desde 2026-05-06)

Toda app nueva DEBE incluir Schema.org JSON-LD para que Google y las IAs (ChatGPT, Perplexity, Gemini) reconozcan correctamente el contenido. Habilita rich snippets en SERP.

**Está automatizado en el template** (`templates/app-base/`):
- `metadata.template.ts` exporta `jsonLd` (WebApplication) Y `faqJsonLd` (FAQPage)
- `layout.template.ts` inyecta ambos `<script type="application/ld+json">` antes del `{children}`

**Solo hay que** rellenar correctamente al crear la app:
- `name`: nombre claro y descriptivo
- `description`: 1-2 frases sobre qué hace y para quién
- `url`: URL absoluta completa con barra final (`https://meskeia.com/[slug]/`)
- `category`: una de `EducationalApplication`, `FinanceApplication`, `UtilityApplication` o `BusinessApplication`
- `features`: 4-8 características reales de la app
- **`faqJsonLd`**: 5 preguntas reales que un usuario escribiría en Bing/Google/ChatGPT con respuestas de 2-4 frases y datos concretos. Sin mencionar "meskeIA". Variadas: qué es, cómo funciona, para quién, diferencia con alternativas, dato clave.

**Por qué FAQPage es obligatorio desde 2026-05-30**: Google deprecó FAQPage para rich snippets pero Bing Copilot, ChatGPT, Perplexity y Gemini SÍ usan FAQPage para grounding queries. Es la señal estructurada más directa para aparecer en respuestas de IAs. La campaña masiva de retrofit cubrió 826/842 apps existentes — las nuevas deben incluirlo desde el origen.

**Verificación**: tras el build, comprobar que `.next/server/app/[slug].html` contiene `"@type":"WebApplication"` Y `"@type":"FAQPage"`.

**Apps existentes sin JSON-LD/FAQPage**: usar `node scripts/faq-progress.mjs` para identificar. Solo hacer retrofit si la app tiene tráfico relevante.

### 1.quinquies Neutralidad editorial (OBLIGATORIO desde 2026-05-12)

Tras revisión global de 189 apps en 2026-05-12 (~400 correcciones aplicadas en historia, salud, finanzas, reflexión, legal-fiscal y gastronomía), estos son los **antipatrones editoriales** más frecuentes. Al generar o modificar apps, evítalos desde el origen:

1. **Cifras populares sin fuente verificable**. Ej: "10.000 pasos", "regla del 4%", "70% impostor", "33% Universidad de Wisconsin", "una copa al día es saludable". Si citas una cifra, atribuye fuente y año concretos; sospecha de las cifras redondas que circulan en blogs.

2. **Asunción de privilegio en el destinatario**. Ej: "ahorra el 20%", "fondo de 6 meses", "bloquea 2h semanales", "compra de gama media", "delega tareas". Pregúntate si el consejo excluye implícitamente a parte del público (rentas justas, jornadas no flexibles, sin patrimonio, sin equipo).

3. **"Demostró/documentó"** para marcos académicos discutidos (Kahneman, Janis, Csikszentmihalyi). Usa "propuso", "identificó", "popularizó". Los marcos son herramientas, no leyes.

4. **Lenguaje moralizador sobre elecciones legítimas**. Ej: "alimentos prohibidos", "carga del cuidador", "Optimismo Ciego", "deuda buena/mala", "vivir despacio = acto de resistencia". Evita adjetivos valorativos cuando hay opciones legítimas distintas.

5. **Bias EEUU/anglosajón sin matiz**. Ej: Ramsey, Cal Newport, FIRE, Trinity Study, S&P 500 como referencia universal, "regla 100-edad". Reconoce el origen cultural del marco; diversifica fuentes y referencias para el público hispanohablante.

6. **Asimetría territorial valorativa**. Ej: "Madrid favorable / Asturias onerosa" (ISD), "la auténtica / la versión americana", "vinos europeos clásicos / alternativas del Nuevo Mundo". Las diferencias geográficas son hechos; no las califiques como mejor/peor.

7. **"Optimizar X"** en títulos fiscales. Sustituye por "cumplimentar correctamente", "calcular con precisión", "aplicar las deducciones aplicables".

8. **Contexto colonial/histórico omitido** cuando es relevante (especias, ron caribeño, arroz Carolina, esclavitud en plantaciones). Una línea de contexto evita el tono romántico/folklórico; no se trata de convertir cada guía en libro de historia.

9. **Glamourización del alcohol como saludable** ("paradoja francesa", "vino cardioprotector", "una copa al día"). Refutado por WHO 2023; el alcohol es carcinógeno Grupo 1 IARC. Si aparece como dato histórico, matizar inmediatamente.

10. **Disclaimer incoherente con el riesgo real**. Ej: melatonina con `severity="low"` (es medicamento >1,9mg en España); guía de cócteles sin DisclaimerCard de alcohol cuando vino y cerveza sí lo tienen. Antes de decidir severity, releer `_private/DISCLAIMER-POLICY.md`.

**Cómo usarlo**: autocontrol al generar contenido. No es checklist obligatorio sino señales de alerta. Si algún antipatrón aplica al texto que estás escribiendo, formúlalo de forma neutra desde el inicio — es más fácil que corregirlo después.

**Revisión anual recomendada**: auditoría completa de neutralidad cada ~12 meses (similar a la de 2026-05-12) para detectar regresiones a medida que se añaden apps nuevas. Documento de referencia: este apartado del CLAUDE.md.

### 2. Ciclo de creación de nueva app (2 fases obligatorias)

Las nuevas apps se crean **siempre en dos fases**. La fase 2 es inmediata, no opcional.

**Fase 1 — App funcional** (skill `/nueva-app-meskeia`):
```
[ ] 1. Crear carpeta app/[nombre-app]/ (usar template: templates/app-base/, copiar también layout.template.ts → layout.tsx)
[ ] 2. Añadir entrada en data/applications.ts (suites)
[ ] 3. Añadir URL en data/implemented-apps.ts
[ ] 4. Añadir relaciones en data/app-relations.ts
[ ] 5. Incluir <EducationalSection> con bloque educativo básico en page.tsx
[ ] 6. Ejecutar npm run build (exit code 0) — genera ai-index.json automáticamente
```

**Fase 2 — Profesionalización v2.0** (inmediatamente después del build):
```
[ ] 8. Enriquecer el bloque educativo básico existente con el patrón v2.0 completo
[ ] 9. Verificar clase .warningBox en CSS Module (indicador de v2.0 completo)
[ ] 10. Build final, commit y push a GitHub
```

**Excepción**: Cursos (`/curso-*`) y Guías (`/guia/*`) están excluidos del patrón v2.0 por tener estructura propia. Juegos y ocio → patrón lite (ver `_private/PROFESIONALIZACION.md`).

**Instrucciones técnicas completas del patrón v2.0**: `_private/PROFESIONALIZACION.md` (carpeta local, excluida del deploy)

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
- ❌ PROHIBIDO: modificar archivos compartidos (applications.ts, implemented-apps.ts, app-relations.ts)
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
4. npm run build (una sola vez, verificar 0 errores) — genera ai-index.json automáticamente
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

**Migrado a tRPC** como prueba de concepto (2026):
- ✅ Funcionando en producción (protegido con `protectedProcedure` + clave `x-analytics-key`)
- ✅ Type-safety completo
- ✅ Reducción código ~40%

---

## Seguridad y Calidad del Código

### Guardián de secretos (hook pre-commit)

Un hook `pre-commit` bloquea el commit si detecta credenciales o rutas privadas
(`_private/`, `_backups/`, `.credentials/`, `scratch/`, `digests/`) en las líneas añadidas.

- `npm run check:secrets` — analiza lo que hay en staging (lo que ejecuta el hook)
- `npm run audit:secrets` — auditoría de todo el repositorio
- Falso positivo: añadir `pragma: allowlist-secret` en la línea · escape puntual: `git commit --no-verify`

> ⚠️ **Tras clonar el repositorio en otra máquina: `npm run hooks:install`.**
> `.git/hooks/` no se versiona, así que el hook no viaja y la protección desaparece sin avisar.

### Backups y recuperación de Turso

Turso es el **único dato de producción no reproducible desde GitHub**.

| Control | Cadencia | Qué valida |
|---------|----------|------------|
| `scripts/backup-turso.mjs` | Diaria 08:06 | Genera el dump (tablas + datos + índices/vistas/disparadores) |
| Verificador de Backups | Diaria 08:12 | Que el dump carga y sus cifras son coherentes |
| `npm run ensayo:restauracion` | **Semestral** | La vuelta atrás completa: esquema, índices, integridad y la app operando sobre la copia |

**Antes de ejecutar el ensayo, leer `_private/RUNBOOK-RESTAURACION-TURSO.md`** — contiene
la restauración a base desechable y el procedimiento de desastre real. La cadencia vive en
la Agenda Operativa del Centro de Mando (`restauracion-turso-semestral`).

> Gotcha de datos: `uso_aplicaciones.timestamp` es TEXT en formato español (`31/05/2026, 23:34:51`);
> `MIN`/`MAX` lo ordenan alfabéticamente y devuelven un rango falso. Usar `created_at` (ISO).

### TypeScript

- ⚠️ `ignoreBuildErrors: true` en `next.config.ts` — el build de producción NO type-chequea (limitación de RAM en Vercel: el type-check de +1.100 apps agota los 8 GB)
- Validación de tipos SIEMPRE en local: `npx tsc --noEmit` antes de commitear cambios sustanciales
- Objetivo: 0 errores TypeScript en todo el proyecto
- Archivos de tipos custom en `types/`
- Casts conocidos: Chart.js → `as never`, jStat → `Record`, libs sin tipos → `.d.ts` en `types/`

### Cabeceras de Seguridad HTTP

Configuradas en **dos capas** (`next.config.ts` + `vercel.json`):

| Cabecera | Protección |
|----------|------------|
| `X-Frame-Options: DENY` | Anti-clickjacking |
| `X-Content-Type-Options: nosniff` | Anti-MIME sniffing |
| `Referrer-Policy` | Control de referrer |
| `Permissions-Policy` | Bloquear APIs innecesarias |
| `Content-Security-Policy` | **CSP ENFORCED** (bloquea; `media-src` incluye `blob:`) |

⚠️ La CSP está en modo enforcement desde 2026 — cualquier recurso externo nuevo debe añadirse a la política o será bloqueado en producción.

### CORS en API Routes

Todas las API routes restringidas a `meskeia.com` (no `*`).

---

## Disciplina de Build (OBLIGATORIO)

### Regla de UN solo build

**NUNCA** lanzar más de un `npm run build` simultáneamente. Un build duplicado crea un lock en `.next/lock` que bloquea todos los builds posteriores y genera cadenas de reintentos innecesarios.

### Protocolo correcto

```bash
# UN solo build, con timeout de 10 minutos (600000ms) — valor canónico único
npm run build  # timeout: 600000

# Si falla → diagnosticar error → corregir → UN solo rebuild
# Si el build se queda "colgado" → verificar si .next/lock existe sin proceso node activo
```

### Reglas estrictas

1. **Timeout de 10 minutos** (600000ms) para `npm run build` — valor canónico en todo el ecosistema (docs, skills, memoria). El proyecto (+1.100 apps) tarda ~1-2 minutos en el PC actual (i7-14700/32GB); el margen extra cubre builds fríos. NO asumir que ha fallado antes de ese tiempo.
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

> Política vigente (2026-07-16): commit + push + deploy automático en el mismo flujo.
> No agrupar pushes salvo petición expresa del usuario.

```bash
# 1. Verificar build (timeout 10 min / 600000ms)
npm run build

# 2. Commit — staging selectivo, NUNCA git add . ni git add -A
git add app/ components/ data/ lib/ public/ types/ server/ templates/
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
- `/api/analytics/csp-violations` - Recibir informes CSP
- `/api/analytics/rollup` - Rollup/agregación Turso

---

## Archivos Auxiliares (Actualizar al crear apps)

### Automáticos (Next.js los genera)
- `sitemap.xml` - Desde `app/sitemap.ts`
- `robots.txt` - Desde `app/robots.ts`

### Manuales (actualizar siempre)
- `data/applications.ts` - Añadir app con suites
- `data/implemented-apps.ts` - Añadir URL
- `data/app-relations.ts` - Añadir relaciones
- `public/ai-index.json` - **Auto-generado** por `npm run build`, no editar

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

## 📅 Agenda Operativa — dónde viven las fechas (OBLIGATORIO)

**Toda decisión con fecha futura se anota en la Agenda Operativa, en la MISMA sesión en que se toma.**

`C:\Users\jaceb\Mis Desarrollos\Vigilancia\Centro de Mando\agenda.json` — fuente **única** del
"cuándo" de todo lo tutelado por Claude (meskeIA + programas del PC). Dos lectores: la tarjeta 📅
del panel (vista diaria del usuario) y la skill `/agenda` (ejecutar y actualizar).

Aplica a: revisiones periódicas, mediciones diferidas ("medir a los 3 meses"), hitos, ensayos,
auditorías anuales. Si en una sesión decides que algo se revisa más adelante, **la sesión no termina
sin crear su entrada**.

Cuatro reglas:
1. La agenda **no contiene instrucciones**, solo un puntero `donde` al documento vivo (doc, memoria
   o skill) y una línea de nota. Si el procedimiento cambia, se corrige **allí**, nunca duplicándolo.
2. Al completar: `ultimaVez` con la fecha real (cadencias) · borrar o reprogramar (hitos).
3. Nunca acumular notas encima de notas: se **corrige** lo anterior. Una entrada que contradice a
   otra es exactamente el fallo que este sistema evita.
4. **No crear recordatorios en ningún otro sitio** (ni en docs, ni sueltos en memoria, ni pidiendo
   al usuario que lo apunte). Si no está en la agenda, no existe.

Detalle completo y formato de entrada: skill `/agenda`.

---

## Para instrucciones completas

- **Global**: `~/.claude/CLAUDE.md` (reglas universales)
- **Disclaimers**: `_private/DISCLAIMER-POLICY.md` (política completa — niveles, textos, colapsabilidad)
- **Componentes**: `components/README.md`
- **Templates**: `templates/README.md`
- **Historial de cambios**: `git log` (CHANGELOG histórico archivado en `_private/archivo/`)

---

## Control de versiones

**Versión actual**: 1.7.0 (2026-07-16) - Homogeneización del ecosistema .claude (cifras vivas, timeout único 600000ms, TypeScript real, CSP enforced)

**Historial completo**: `git log` (CHANGELOG histórico archivado en `_private/archivo/`)

---

**Última actualización**: 2026-07-16
**Proyecto**: meskeIA Web (https://meskeia.com)
