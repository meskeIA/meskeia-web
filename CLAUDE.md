# CLAUDE.md - Instrucciones específicas del proyecto meskeia-web

> Complementa `~/.claude/CLAUDE.md`, que tiene lo **universal** a todos mis proyectos: español,
> formato español, TypeScript, accesibilidad, dark mode, secretos y disciplina de build.
> Lo de aquí abajo es lo que solo aplica a meskeIA.

## Proyecto: meskeia-web

Repositorio en `C:\Users\jaceb\meskeia-web`, hospedado en Vercel (meskeia.com). Push a `main` despliega solo.

Servidor de desarrollo y producción en el **puerto 3050** (`npm run dev` / `npm run start`). El resto de scripts, en `package.json`.

---

## ⚠️ Los CLAUDE.md de carpeta NO se cargan de forma fiable: hay que leerlos

Cargaron solos del 28/08 al 09/09/2026 (Claude Code 2.1.247-2.1.266), **ninguno** del 10 al
23/09 (siete pruebas el 20-21/09) y uno el 24/09: depende de la versión. Son 26,8 KB de trampas ya pagadas que
solo se leen si esta tabla lo manda, y se leen **antes de la primera escritura** en ese árbol:

| Antes de tocar… | Lee | Trampa que cubre |
|---|---|---|
| `data/*.ts` | `data/CLAUDE.md` | Cambiar el formato deja parsers mudos · una serie histórica se coteja por COCIENTES, no añadiendo el año |
| `scripts/*.mjs` | `scripts/CLAUDE.md` | Los parsers leen `data/` con regex: 0 items sin dar error, o 607 líneas de comentario dentro de un `<h1>` |
| Analytics, rollup o dashboard | `app/api/analytics/CLAUDE.md` | `timestamp` es TEXT español · cuatro cortes de instrumentación que parecen producto |
| `types/` o un `useMemo` con `switch` | `types/CLAUDE.md` | La unión discriminada no discrimina: sale `undefined` en pantalla y compila |
| Una app imprimible | `styles/CLAUDE.md` | La base de impresión NO vale para una tabla de lectura |
| `app/delegum/` | `app/delegum/CLAUDE.md` | Barra final en la URL del MCP · los CTA necesitan `?from=delegum` |
| `data/historias/` | `data/historias/CLAUDE.md` | Catálogo CERRADO (09/05/2026) · cuatro reglas de UX intocables |

---

## Identidad visual meskeIA (OBLIGATORIO)

Ya implementada en `app/globals.css` — **no duplicar la definición**, solo usar las variables.

| Variable | Color | Uso |
|---|---|---|
| `--primary` | `#2E86AB` | Azul meskeIA, color principal |
| `--secondary` | `#48A9A6` | Teal meskeIA |
| `--accent` | `#7FB3D3` | Azul claro |
| `--hero-bg` | `#1a5278` | Azul marino, **obligatorio en hero sections** |

❌ **Prohibido absoluto**: `#7C3AED` (violeta) y `#2DD4BF` (turquesa). No son la marca.

❌ No preguntar si aplicar la identidad meskeIA: se aplica siempre.

---

## Estructura estándar de una app (OBLIGATORIO)

```
1. <MeskeiaLogo />
2. Hero section
3. <LegalNotice />                       ← RGPD
4. Herramienta / calculadora
5. Resultados
6. <DisclaimerCard /> O `// @disclaimer: exempt` en la línea 2
7. <EducationalSection>                  ← contenido colapsable
8. <RelatedApps apps={getRelatedApps('slug')} />
9. <ShareCard appName="slug" />
10. <Footer appName="slug" />
```

**Los cinco obligatorios en TODAS las apps**: `MeskeiaLogo`, `LegalNotice`, `RelatedApps`, `ShareCard`, `Footer`. Se importan de `@/components`; los formateadores, de `@/lib`.

⚠️ **Nunca** ocultar dentro de `<EducationalSection>` un disclaimer legal, una advertencia de responsabilidad ni un aviso sobre datos personales: es responsabilidad jurídica, no maquetación.

**Catálogo de componentes con ejemplos**: `components/README.md` · **plantillas**: `templates/` y `templates/README.md` · **flujo completo de creación**: skill `/nueva-app-meskeia`.

---

## Arquitectura de Clasificación: Suites Temáticas

meskeIA organiza las apps en 13 Suites Temáticas (clasificación NO excluyente — una app puede pertenecer a múltiples suites).

> **Histórico**: el sistema de "Momentos" (cruce con suites) se eliminó el 2026-05-06 al volverse contraproducente con +800 apps (conteos absurdos como "Estudiando 446 apps" no permitían descubrimiento real).

### Suites (13) - "¿Qué problema resuelve?"

La lista viva (id, nombre, icono y descripción de cada suite) está en `data/suites.ts`. **NO duplicarla aquí**: una tabla copiada envejece en silencio y acaba contradiciendo al código.

### Archivos de datos

`data/suites.ts` · `data/applications.ts` · `data/implemented-apps.ts` · `data/app-relations.ts` — los nombres dicen lo que contienen. Dos que no se deducen leyendo el directorio:

- `public/ai-index.json` — **auto-generado en el build** desde applications.ts. No editar a mano.
- `data/fiscal/` — datos normativos centralizados, con la regla obligatoria de abajo.

### Módulos de datos fiscales (`data/fiscal/`)

Repositorio centralizado de datos normativos para la Suite Legal-Fiscal. Cada módulo incluye metadatos de versión, fuente oficial y fecha de verificación. El inventario vivo es `ls data/fiscal/` (25 módulos a 11/08/2026); **no se mantiene aquí una tabla de módulos**, porque la anterior listaba 10 de los 25 y llevaba meses dando una imagen falsa de lo que ya estaba cubierto.

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

Cronologías históricas: cada historia = `data/historias/[slug].ts` + registro en `data/historias/index.ts`. **Catálogo cerrado desde el 2026-05-09.**

El detalle completo (workflow con agentes en paralelo, las 4 reglas de UX que NO se modifican, estructura de `HistoriaData` y las 6 restricciones críticas) vive en **`data/historias/CLAUDE.md`**, que **hay que abrir a mano**: no se carga solo (ver la tabla del principio).

---

## Sección Guías

Las Guías son **landing pages** que agrupan herramientas para un **proceso de decisión a corto-medio plazo** con implicaciones económicas/legales en España.

### Características de una Guía

- **Decisión concreta**: El usuario debe elegir entre alternativas
- **Journey claro**: Proceso con inicio y fin definidos
- **5-7 herramientas**: Apps meskeIA existentes que cubren el proceso
- **Audiencia amplia**: No nichos técnicos específicos

### Guías implementadas

Guías-journey en `app/guia/*/` — la lista viva está en `data/guides-journey.ts`, NO mantener tablas de guías en docs.

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

## Registro de una app en un portal vertical

Cada vertical tiene **un solo sitio** donde se registra, además de los tres de cualquier app (`data/applications.ts` + `data/implemented-apps.ts` + `data/app-relations.ts`):

| Vertical | Dónde se registra | Qué aporta esa entrada |
|---|---|---|
| **Stemum** | `STEMUM_APPS` en `data/stemum.ts` | Pertenencia a disciplina (breadcrumb, proxy, contadores) **y** la tarjeta de la parrilla `/stemum/[disciplina]/` |
| **Coquinum** | `COQUINUM_APPS` en `data/coquinum.ts` | Pertenencia a categoría **y** la tarjeta de la parrilla **y** el nombre/icono del bloque «Más de [categoría]» |
| **Cronicum** | el array `slugs` de una puerta en `data/cronicum/puertas.ts` | La puerta por la que se llega a la cronología (el título, icono y descripción salen de `data/historias/[slug].ts`) |

En Stemum y Coquinum el orden dentro de la sección **es** el orden de la parrilla. En Cronicum cada cronología va en **exactamente una** puerta.

> Las parrillas se derivan de `appsDeDisciplina()` / `appsDeCategoria()`: registrar una app es
> UNA entrada. Por qué dejaron de ser arrays a mano (28/07/2026): cabecera de
> `scripts/check-verticales.mjs`.

**Candado**: `npm run check:verticales` — lo ejecuta también `npm run build`, y **rompe el build** si falla. Verifica, en los tres portales: que cada slug tenga su carpeta en `app/`, esté en `implemented-apps.ts` y en `applications.ts`, que la disciplina/categoría exista, que ninguna parrilla vuelva a listar apps a mano, y que ninguna cronología se quede sin puerta (ni aparezca en dos, ni una puerta apunte a una cronología inexistente).

---

## Material de apoyo de Stemum (tablas de consulta)

Las tablas de consulta STEM (`app/tabla-*`) son un **contenedor subordinado** del portal Stemum: no son simuladores, no cuentan en el hero ni en los contadores de disciplina, y no entran en las parrillas de `/stemum/[disciplina]/`. Viven en la sección `stemum.com/material-apoyo/`.

**Criterio de admisión**: buscador SIEMPRE + al menos una capa que un PDF no pueda dar. Esa capa cambia por disciplina — demostración en matemáticas, ejemplo real o formulador en química, equivalencias y orden de magnitud en física. Una lista plana se queda en meskeIA y no entra en Stemum.

**Registro de una tabla nueva (4 archivos OBLIGATORIOS)**: `data/applications.ts` + `data/implemented-apps.ts` + `data/app-relations.ts` + **`STEMUM_MATERIAL_APOYO` en `data/stemum.ts`**. Olvidar el cuarto = la tabla existe en meskeIA pero no aparece en Stemum, y esto sí sigue siendo silencioso: el candado comprueba las entradas declaradas, no puede echar de menos una tabla que nadie declaró.

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
- Parser: `parseSpanishNumber` (`@/lib`). Con los **dos** separadores manda el último; con uno solo
  la ambigüedad es irreducible y gana el español (`1.234` = mil). Devuelve `NaN` en lo que no es un
  número (`12abc`, `1e3`), así que no hace falta validar antes de llamarlo.
- Moneda: si no es contable-España, símbolo configurable o genérico.
- En bloques educativos, normativa España solo cuando sea relevante; preferir ejemplos universales.

### 1.quater Cifras del catálogo (OBLIGATORIO desde 2026-05-06)

Las cifras del catálogo **solo aparecen vía variable** importada de `@/data/implemented-apps`
(`TOTAL_IMPLEMENTED_APPS`). **PROHIBIDO hardcodear números** de apps en UI, SEO o JSON-LD: el
catálogo pasó de 84 a 824 en pocos meses y todo número escrito a mano queda obsoleto sin avisar
(ya ocurrió en `FAQ.tsx` y en el JSON-LD de `app/layout.tsx`).

- Si la UI **necesita** la cifra → `` `${TOTAL_IMPLEMENTED_APPS} aplicaciones…` ``
- Si **no** la necesita → eliminarla, no dejar un número que envejecerá. La FAQ "¿son gratuitas?"
  no necesita decir "todas las 84 apps". En JSON-LD, la `description` mejor sin cifra.

Auditoría: `grep -rE "\b[0-9]{2,4}\b\s+aplicaciones?" --include="*.tsx" --include="*.ts" --include="*.md"`

### 1.ter JSON-LD / Structured Data (OBLIGATORIO desde 2026-05-06)

Toda app nueva DEBE incluir Schema.org JSON-LD. **Está automatizado en el template**
(`templates/app-base/`): `metadata.template.ts` exporta `jsonLd` (WebApplication) y `faqJsonLd`
(FAQPage), y `layout.template.ts` inyecta ambos `<script type="application/ld+json">`.

**Solo hay que rellenarlo bien**: `name` descriptivo · `description` de 1-2 frases · `url` absoluta
con barra final · `category` (`EducationalApplication`, `FinanceApplication`, `UtilityApplication`
o `BusinessApplication`) · `features` con 4-8 características reales · **`faqJsonLd` con 5 preguntas**
que un usuario escribiría de verdad, respuestas de 2-4 frases con datos concretos, sin mencionar
"meskeIA", variadas (qué es, cómo funciona, para quién, diferencia con alternativas, dato clave).

⚠️ **FAQPage es obligatorio desde 2026-05-30** aunque Google lo deprecara para rich snippets: Bing
Copilot, ChatGPT, Perplexity y Gemini SÍ lo usan para grounding. Es la señal estructurada más
directa para aparecer en respuestas de IAs.

**Verificación**: tras el build, que `.next/server/app/[slug].html` contenga `"@type":"WebApplication"`
Y `"@type":"FAQPage"`. Para localizar apps viejas sin ello: `node scripts/faq-progress.mjs` (solo
merece retrofit si la app tiene tráfico relevante).

### 1.quinquies Neutralidad editorial (OBLIGATORIO desde 2026-05-12)

Antipatrones detectados al revisar 189 apps (~400 correcciones en historia, salud, finanzas,
reflexión, legal-fiscal y gastronomía). No son checklist sino señales de alerta: si alguna aplica
a lo que estás escribiendo, formúlalo neutro desde el inicio — es más fácil que corregirlo después.

1. **Cifras populares sin fuente** ("10.000 pasos", "regla del 4%", "una copa al día es saludable") → atribuye fuente y año; sospecha de las cifras redondas que circulan en blogs.
2. **Asunción de privilegio** ("ahorra el 20%", "fondo de 6 meses", "delega tareas") → ¿excluye a rentas justas, jornadas no flexibles, sin patrimonio, sin equipo?
3. **"Demostró/documentó"** para marcos discutidos (Kahneman, Janis, Csikszentmihalyi) → "propuso", "identificó", "popularizó". Son herramientas, no leyes.
4. **Moralizar elecciones legítimas** ("alimentos prohibidos", "deuda buena/mala", "carga del cuidador") → sin adjetivos valorativos donde hay opciones legítimas distintas.
5. **Bias EEUU/anglosajón sin matiz** (Ramsey, Cal Newport, FIRE, Trinity Study, S&P 500, "regla 100-edad") → reconoce el origen cultural del marco y diversifica referencias.
6. **Asimetría territorial valorativa** ("Madrid favorable / Asturias onerosa", "la auténtica / la americana") → las diferencias geográficas son hechos, no notas.
7. **"Optimizar X"** en títulos fiscales → "cumplimentar correctamente", "calcular con precisión", "aplicar las deducciones aplicables".
8. **Contexto colonial omitido** cuando es relevante (especias, ron caribeño, arroz Carolina) → una línea evita el tono romántico/folklórico, sin convertirlo en libro de historia.
9. **Alcohol como saludable** ("paradoja francesa", "vino cardioprotector") → refutado por WHO 2023; carcinógeno Grupo 1 IARC. Como dato histórico, matizar en el acto.
10. **Disclaimer incoherente con el riesgo** (melatonina con `severity="low"`, que es medicamento >1,9 mg en España; cócteles sin disclaimer de alcohol) → releer `_private/DISCLAIMER-POLICY.md` antes de decidir severity.

### 2. Ciclo de creación de nueva app (2 fases obligatorias)

Las apps se crean **siempre en dos fases**: **Fase 1 — app funcional** y **Fase 2 —
profesionalización v2.0**, que es inmediata, no opcional. Los pasos concretos de ambas, con su
checklist, están en la skill **`/nueva-app-meskeia`** (PASO 1 a PASO 5); las instrucciones
técnicas del patrón v2.0, en `_private/PROFESIONALIZACION.md`.

**Excepción**: Cursos (`/curso-*`) y Guías (`/guia/*`) están excluidos del patrón v2.0 por
tener estructura propia. Juegos y ocio → patrón lite.

### 3. Creación de múltiples apps en paralelo (agentes)

Cuando se crean **3 o más apps** en una misma sesión, usar agentes en paralelo para maximizar velocidad. Reglas OBLIGATORIAS:

**Fase secuencial ANTES (archivos compartidos):**
```
1. Crear/actualizar data/fiscal/*.ts si se necesitan datos normativos
2. Actualizar data/fiscal/index.ts con el nuevo export
3. Verificar que compila: npm run check:tipos
```

⚠️ Nunca `npx tsc --noEmit data/fiscal/index.ts`: con un fichero, tsc ignora el `tsconfig.json`
y da error siempre (§TypeScript).

**Fase paralela (agentes crean apps):**

Cada agente DEBE incluir estas instrucciones EXACTAS en su prompt:

```
## REGLAS CRÍTICAS PARA ESTE AGENTE
- ✅ Crea SOLO los 3 archivos de tu app (metadata.ts, page.tsx, .module.css)
- ✅ `npm run check:tipos` UNA SOLA VEZ. Si falla, reporta el error y TERMINA — no reintentes
- ❌ PROHIBIDO: `npm run build` (lock entre agentes) · modificar compartidos (applications.ts,
  implemented-apps.ts, app-relations.ts) · reintentar en bucle (sleep + retry) · run_in_background
- ⚠️ TERMINAR INMEDIATAMENTE tras crear los ficheros y verificar TS una vez
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

### 4. Modificar una app existente (bug o función nueva)

Mismo criterio del PASO 4.bis de `/nueva-app-meskeia`: si la app tiene estado interactivo (temporizador, foco/teclado, varias fases), verificar con `npx playwright test tests/apps/<slug>.spec.ts` antes del build final — crear el fichero si no existe. Una calculadora normal no lo necesita.

---

## Stack Tecnológico: tRPC + React Query

Criterio de uso, ubicación de cada pieza y plantilla de router: skill **`/trpc-meskeia`**. En una frase: tRPC para apps nuevas que consuman datos del servidor; las API Routes existentes se mantienen y **no se migran**.

---

## Seguridad y Calidad del Código

### Lo que vigila el `pre-commit`

Tres cosas, en este orden: **secretos**, **el Cuadre** y, solo si el commit toca datos o motores
de cálculo, los **goldens** (`test:calc`, ~5 s).

**Guardián de secretos** — bloquea si detecta credenciales o rutas privadas (`_private/`,
`_backups/`, `.credentials/`, `scratch/`, `digests/`) en las líneas añadidas.
`npm run check:secrets` analiza lo que hay en staging (lo que ejecuta el hook) ·
`npm run audit:secrets`, el repositorio entero · falso positivo: `pragma: allowlist-secret` en
la línea.

⚠️ **`git commit --no-verify` está PROHIBIDO** y lo rechaza un hook `PreToolUse`. Desarma los
tres a la vez, y el único candado que bloquea no puede ser puenteable con once caracteres por
quien escribe los commits. Cuando el Cuadre bloquea con razón, la salida es dejar la razón
escrita: `CUADRE_OK="por qué es correcto" git commit -m "…"`.

> ⚠️ **Tras clonar el repositorio en otra máquina: `npm run hooks:install`.**
> `.git/hooks/` no se versiona, así que el hook no viaja y la protección desaparece sin avisar.

### El Cuadre: lo que se tocó frente a lo que se pidió

`npm run cuadre` (y el `pre-commit`, que es donde **bloquea**) — cuenta y compara; no opina.
Cubre la clase de fallo que los otros candados no pueden ver: **se coló algo que nadie pidió**.
Los demás comprueban propiedades POSITIVAS («esto debe estar, y está»); ninguno mira un borrado.

**Nueve reglas**: test borrado · fichero nuevo en la raíz · candado fuera de la cadena del build ·
`@ts-ignore`/`eslint-disable`/`allowlist-secret` añadido a código que ya existía · paquete nuevo
(subir versión no cuenta) · dominio nuevo en la CSP · `DisclaimerCard`/`LegalNotice`/
`DataReference`/`RegionBadge`/`Footer`/`RelatedApps`/`ShareCard`/`role="alert"`/`aria-live` que
cae a CERO en un fichero de `app/` o `components/` · registro del catálogo que encoge · fichero
escrito fuera del ámbito declarado (el repositorio y los `additionalDirectories` de `settings.json`).

**Todas comparan CONJUNTOS antes/después, nunca líneas del diff**: un reformateo produce las
mismas líneas que un borrado. Por eso miran lo que DESAPARECE y son ciegas a lo que nace ya sin
algo —«nacer no es una sorpresa»—, que es lo que cubren los candados sin pasivo.

⚠️ **El radio del cambio NO dispara**: contado, un cambio desbocado y una reparación en lote son
el mismo número. Precio aceptado: 40 ficheros tocados sin borrar nada pasan en silencio.

Lo disparan los hooks, no Claude: `SessionStart` anota la base, `UserPromptSubmit` guarda la
petición **literal**, el `pre-commit` bloquea y `SessionEnd` reconcilia. Siempre que habla sale un
**toast de Windows** —también al autorizar—, porque un aviso impreso en la salida de una
herramienta lo lee el auditado.

> Las 9 reglas con sus precedentes, cómo se desencalla un commit bloqueado y los dos límites del
> diseño: skill **`/cuadre`**. Mediciones y crónica: cabeceras de `scripts/cuadre.mjs` y
> `scripts/cuadre-motor.mjs`. Sus trampas: **`npm run cuadre:probar-candado`**.

### Backups y recuperación de Turso

Turso es el **único dato de producción no reproducible desde GitHub**.

| Control | Cadencia | Qué valida |
|---------|----------|------------|
| `scripts/backup-turso.mjs` | Diaria, en la Rutina Matinal (05:30) | Genera el dump (tablas + datos + índices/vistas/disparadores) |
| Verificador de Backups | Diaria, en la misma cadena, tras los backups | Que el dump carga y sus cifras son coherentes |
| `npm run ensayo:restauracion` | **Semestral** | La vuelta atrás completa: esquema, índices, integridad y la app operando sobre la copia |

**Antes de ejecutar el ensayo, leer `_private/RUNBOOK-RESTAURACION-TURSO.md`** — contiene
la restauración a base desechable y el procedimiento de desastre real. La cadencia vive en
la Agenda Operativa del Centro de Mando (`restauracion-turso-semestral`).

> Gotcha de datos: `uso_aplicaciones.timestamp` es TEXT en formato español (`31/05/2026, 23:34:51`);
> `MIN`/`MAX` lo ordenan alfabéticamente y devuelven un rango falso. Usar `created_at` (ISO).

### Candado de accesibilidad JSX

`npm run check:a11y-jsx` — en el build, y **rompe el build** si el commit escribe un `<button>`
sin `type=` o un emoji junto a texto sin `aria-hidden` (las dos reglas del CLAUDE.md global §5
cuya corrección es unívoca). Las otras tres —`aria-pressed` que falta en un toggle,
`aria-pressed` que **sobra** y emoji en nodo propio— **solo avisan**: un `aria-pressed` en un
botón de acción es una regresión, no una mejora.
Juzga **las líneas que el commit añade** (el catálogo arrastra miles) · Escape:
`a11y-ok: <razón>` en esa línea o en la anterior · `npm run check:a11y-jsx -- --todo` mide el
pasivo (2,5 s, no rompe) y `node scripts/check-a11y-jsx.mjs <fichero>` audita uno.
> Salió de la tanda del Inspector del 21/08/2026: 15 hallazgos en 10 de 10 apps, siempre las
> mismas reglas. Crónica y pasivo: cabecera de `scripts/check-a11y-jsx.mjs` · casos:
> `scripts/pruebas/a11y-regla5.tsx`.

### Candado del aviso legal

`npm run check:legal` — en el build, y **rompe el build** si una app de `implementedAppsUrls` no
monta `<LegalNotice />`. Exige que se **monte** y no solo se importe, y que **no viva dentro de
`<EducationalSection>`**, que nace colapsada (la prohibición de «Estructura estándar»).
**Sin pasivo** · Escape: `legal-ok: <razón>` en el `page.tsx` de la app, y la razón es
obligatoria: la marca a secas también rompe.
> Salió del Inspector el 18/09/2026: `test-fragilidad` (escala FRAIL, riesgo 1) era la única de
> las 21 apps `app/test-*` sin aviso legal. Crónica y barrido: cabecera de
> `scripts/check-legal-notice.mjs` · pruebas: `npm run legal:probar-candado`.

### Candado de las celdas braille

`npm run check:braille` — en el build, y **rompe el build** si una celda que `conversor-braille`
puede EMITIR no tiene entrada en `brailleDots` (se dibujaría en blanco: en la hoja punzada, un
espacio), o si los puntos de una entrada no cuadran con su código Unicode.
**Sin pasivo** · **sin escape**, a propósito: no hay falso positivo posible.
⚠️ No mira si la celda es la CORRECTA para su carácter en tinta: eso lo dice el B 2 de la
Comisión Braille Española, y es trabajo del Inspector contra la fuente.
> Salió del mismo defecto dos veces: el 21/08/2026 (los tres indicadores) y el 22/09 (hallazgo
> 1183, `⠠` de la barra inclinada). Crónica y trampas: cabecera de
> `scripts/check-celdas-braille.mjs` · pruebas: `npm run braille:probar-candado`.

### Candado del mínimo personal del IRPF

`npm run check:minimo-irpf` — en el build, y **rompe el build** si en un fichero que calcula IRPF
aparece una resta cuyo sustraendo es un mínimo. El mínimo **no reduce la renta**
(art. 63.1.2.º LIRPF): se grava a TIPO CERO aplicando la escala dos veces y restando las cuotas;
restarlo de la base subestima la cuota. Fórmula canónica: **`calcularCuotaIntegraGeneral`** de
`@/data/fiscal`, con `cuotaEscalaGeneral` y `desglosarEscalaGeneral` (para los desgloses en
pantalla, que son los de la PRIMERA aplicación y por eso suman más que la cuota).
Barre el árbol entero, **sin pasivo** · Escape: `minimo-ok: <razón>` en esa línea o la anterior.
⚠️ La reducción por tributación conjunta del art. 84.2 (3.400 / 2.150 €) **sí** se resta de la base
y no lo dispara.
> Salió de tres reparaciones del mismo defecto en cuatro días (09-12/09/2026). Crónica y
> cifras: cabecera de `scripts/check-minimo-irpf.mjs` · pruebas: `npm run minimo:probar-candado`.

### Candado del contraste de las cabeceras de tabla

`npm run check:contraste-cabeceras` — en el build, y **rompe el build** si un `<th>`, `<thead>`
o `.th` pone **texto blanco sobre `var(--primary)` o `var(--secondary)`** (en CSS o en
`style={{…}}`): es texto pequeño, exige 4,5:1, y con blanco la marca da 4,11:1 el azul y 2,80:1
el teal (menos en oscuro). Vigila además que **un token
`-texto` no se use como FONDO** con blanco encima: `--primary-texto`/`--secondary-texto` son para
`color:`. Usar **`--primary-boton`** y **`--secondary-boton`**, iguales en **ambos temas**;
`var(--hero-bg)` (8,33:1) no lo enciende.
Barre **`app/` y `components/`**, **sin pasivo** · Escape: `contraste-ok: <razón>`, y la razón es
obligatoria.
⚠️ **Lo que NO mira**: el color de marca como TEXTO sobre fondo claro (se resuelve con
`--primary-texto`), ni botones y badges con fondo de marca (campaña aparte).
> Salió del hallazgo 1175 (21/09/2026): el color del `<thead>` estaba en el FONDO. Crónica:
> cabecera de `scripts/check-contraste-cabeceras.mjs` · pruebas: `npm run contraste:probar-candado`
> · por píxel: `tests/contraste-cabeceras-tabla.spec.ts`.

### Candado del token sin variante oscura

`npm run check:token-oscuro` — en el build, y **rompe el build** si un `.module.css` declara con
color literal un token que `globals.css` define distinto en cada tema (`--text-muted`,
`--bg-card`…) sin redeclararlo en la variante oscura de ese mismo selector, también en un
`:root` de módulo. Saca la lista de tokens de globals y se planta si no la encuentra.
**Al drenar un token en un tema, medir el otro.**
**Sin pasivo** · Fuera, a propósito: `--primary`, `--secondary` y los semánticos (campaña aparte)
· Escape: `oscuro-ok: <razón>`, razón obligatoria.
⚠️ Exige que la variante EXISTA, no que cumpla: eso lo miden `tests/contraste-text-muted-*.spec.ts`,
porque un valor se decide midiendo contra el fondo REAL.
> Salió del drenaje del claro del 22/09/2026 (`dd66add0`): en 4 módulos el oscuro cayó a
> 2,48–2,81:1. Crónica: cabecera de `scripts/check-token-oscuro.mjs` · pruebas:
> `npm run oscuro:probar-candado`.

### Candado del parser numérico

`npm run check:parser` — en el build, y **rompe el build** si el commit escribe
`parseFloat(x.replace(',', '.'))` o una variante del parseo casero, que lee «1.500» como 1,5 y
acepta `'12abc'` como 12. El canónico es **`parseSpanishNumber`** de `@/lib`.
Juzga **las líneas que el commit añade** · Escape: `parser-ok: <razón>` en esa línea o la
anterior (los hay: un `dataset` que escribe la propia app) · `npm run check:parser -- --todo`
mide el pasivo y `node scripts/check-parser-numerico.mjs <fichero>` audita uno.
⚠️ Sustituirlos en bloque NO: `parseSpanishNumber` devuelve NaN donde `parseFloat` daba un número,
y buena parte del pasivo no valida el resultado. El pasivo lo drena el Inspector app por app.
> Salió de `conversor-numeros-letras` (24/08/2026) y `calculadora-masa-madre` (25/08). Crónica y
> pasivo: cabecera de `scripts/check-parser-numerico.mjs` · casos: `scripts/pruebas/parser-numerico.tsx`.

### Candado de la hidratación en los tests

`npm run check:hidratacion` — en el build, y **rompe el build** si un test escribe en un input
con el setter nativo (`HTMLInputElement.prototype`) fuera de **`tests/apps/_hidratacion.ts`**,
que lo hace con sus esperas: `sembrarValor`, `sembrarValorAcotado` (si el control capa el valor)
y `esperarValorEnReact` (para los `fill()`).
`page.goto()` garantiza los chunks descargados, no que React los haya ejecutado: sembrar antes
cambia el DOM y no el estado, y el test pasa en verde midiendo otro escenario.
**Sin pasivo** · Escape: `hidratacion-ok: <razón>` en esa línea o la anterior (lo usa
`tests/hidratacion-carrera.spec.ts`, que reproduce la carrera).
⚠️ **No mira los `fill()` ni los clics** previos a la hidratación, que corren el mismo riesgo: por
la forma del código no admiten candado, así que hay que esperar antes. Tampoco ve sembrar el valor
que el input YA tiene (el caso pasa aunque la app esté sorda): eso lo audita
`SIEMBRA_ESTRICTA=1 npx playwright test tests/apps`.
> Salió de dos specs en rojo el 12/09/2026. Crónica: cabecera de
> `scripts/check-hidratacion-tests.mjs` · pruebas: `npm run hidratacion:probar-candado`.

### Candado de las familias de apps

`npm run check:familias` — en el build (~20 s), y **rompe el build** si el testigo de una familia
no está en verde o si su tabla no cubre cada `<NumberInput>` de cada hermana. Lee
`scripts/inspector/familias.mjs`: una familia nueva entra en el build con declararla allí. Es
el único que **ejecuta** en vez de leer, porque un aviso que dice lo contrario de lo que pasa no
lo delata ninguna forma del código.
**Sin pasivo** · Un hueco se escribe con `falla: '<razón>'` en su fila ANTES de repararlo (no
rompe y se imprime con su cuenta; una marca cuyo caso ya pasa **sí** rompe) · Escape:
`familia-ok: <razón>` en un campo que
no mueve ninguna cifra, razón obligatoria · En Vercel se omite la ejecución.
> Salió del hueco A1 de compraventa (23/09/2026). Crónica: cabecera de
> `scripts/check-familias.mjs` · pruebas: `npm run familias:probar-candado`.

### Candado de la tarjeta social

`npm run check:og-image` — en el build. **Rompe el build** si una app de portal no declara la og
de SU portal en `openGraph` y en `twitter`, si una página de portal se queda sin ella, si la
imagen no existe en `public/` o si cae bajo un redirect de `next.config.ts`; y, **sin pasivo**,
si cualquier app declara `openGraph` sin `images`.
⚠️ **Next NO hereda la imagen del layout raíz**: declarar `openGraph` en la página reemplaza
entero el del padre. Por eso `templates/app-base/` ya trae `images`.
Recorre el árbol de cada portal (uno nuevo, a `PORTALES`) · Escape: `og-ok: <razón>` en el
`metadata.ts`.
⚠️ **Delegum es la excepción: sus apps NO llevan la og del portal**, porque Delegum no sirve apps
bajo su dominio: su proxy no hace passthrough (`delegum.com/estimador-irpf/` da 404) y solo se ven
en meskeia.com. `DELEGUM_APP_SLUGS` alimenta Soluciones, no pertenencia. Sí la llevan las páginas
de su árbol (home, `/datos-fiscales/`, asistente y blog).
> Salió del 29/08/2026: tarjetas de Coquinum y Cronicum sin imagen. Crónica: cabecera de
> `scripts/check-og-image.mjs` · pruebas: `npm run og:probar-candado`.

### Candado de las obligaciones del CLAUDE.md

`npm run check:claude-md` — en el build, y **rompe el build** si una obligación de este fichero
desaparece o cambia de sección (la lista vive en el script), si cita un `npm run` o una ruta que
no existen, o si un «### Candado de…» no está de verdad en la cadena del build. Compara sin
mayúsculas, negritas ni saltos de línea: reformatear calla.
Sin escape, a propósito: retirar una obligación es quitarla de la lista, en el mismo commit ·
**Avisa** (no rompe) si una sección de candado pasa de 1.200 B o no nombra su caso de origen: la
crónica va a la cabecera de su script, y aquí queda qué rompe, qué barre, el escape y el origen.
> Salió del 24/09/2026: la poda con prisa del índice de memoria del 23/09 se llevó sus frenos sin
> que nada diera error, y este fichero crecía ~1.000 B/día. Crónica: cabecera de
> `scripts/check-claude-md.mjs` · pruebas: `npm run claude-md:probar-candado`.

### TypeScript

- ⚠️ `ignoreBuildErrors: true` en `next.config.ts` — el build de producción NO type-chequea (el type-check del catálogo agota los 8 GB de RAM de Vercel)
- Validación de tipos SIEMPRE en local: **`npm run check:tipos`** antes de commitear cambios sustanciales
  (lo ejecuta también `npm run build`; en Vercel se salta, para no encarecer cada despliegue)

  ⚠️ **NO usar `npx tsc --noEmit` a secas: puede estar CIEGO y devolver «0 errores» sin haber
  mirado nada**, por los restos que Next deja en `.next/dev/types/`. `check:tipos` los retira,
  revalida, y **falla si no consigue dejar la validación limpia**. Tampoco
  `npx tsc --noEmit <fichero>`: ignora el `tsconfig.json` y da error siempre. Los dos casos
  (14/08 y 10/09/2026), en la cabecera de `scripts/check-tipos.mjs`.
- Objetivo: 0 errores TypeScript en todo el proyecto
- Archivos de tipos custom en `types/`
- Casts conocidos: Chart.js → `as never`, jStat → `Record`, libs sin tipos → `.d.ts` en `types/`

### Cabeceras de Seguridad HTTP

Configuradas en **dos capas** (`next.config.ts` + `vercel.json`) — la lista exacta se lee ahí. Lo que no se deduce leyéndolas:

⚠️ La CSP está **en modo enforcement** desde 2026 (bloquea de verdad, y `media-src` incluye `blob:`): cualquier recurso externo nuevo debe añadirse a la política o será bloqueado en producción. Al tocar `Permissions-Policy`, `feature=()` desactiva cámara y micrófono **en silencio**; usar `(self)` y en AMBOS ficheros.

### CORS en API Routes

Todas las API routes restringidas a `meskeia.com` (no `*`).

---

## Disciplina de Build (OBLIGATORIO)

Las reglas generales —**UN solo build a la vez**, timeout de **10 minutos (600000 ms)** en primer
plano y nunca en segundo, no lanzar nada en paralelo, y qué hacer con un `.next/lock` huérfano—
están en el **CLAUDE.md global §7** y aplican aquí tal cual. Lo propio de meskeIA:

- El build del catálogo tarda **~1-2 minutos** en este PC (i7-14700/32 GB). El margen hasta
  los 10 minutos cubre los builds fríos: **no dar un build por fallido antes de ese tiempo**.
- **NUNCA** `npm run check:tipos` mientras un build está corriendo — lo ejecuta ya el propio build.
- Si hay lock huérfano (existe `.next/lock` sin proceso `next build` activo): `rm -f .next/lock`
  y **un** solo build.


### Servidor local de pruebas: detenerlo siempre al terminar

`npm run dev` y `npm run start` (puerto 3050) no terminan solos: quedan corriendo hasta que alguien los detiene. Si una tarea de implementación o verificación levanta el servidor para probar en navegador (Playwright u otro), **debe detenerse explícitamente antes de dar la tarea por terminada** — `Ctrl+C` en la terminal que lo lanzó, o `npx kill-port 3050`.

⚠️ Un servidor Node huérfano lanzado de forma interactiva bajo la cuenta del usuario puede bloquear la descarga limpia de su registro de perfil (`NTUSER.DAT`) al apagar Windows — Visor de sucesos, `Microsoft-Windows-User Profiles Service`, eventos 1512/1517, "acceso denegado: la causa suelen ser servicios ejecutándose como cuentas de usuario". Consecuencia observada: la configuración de esa sesión (incluido el color de fondo de escritorio) no se persiste, y el siguiente arranque puede mostrar pantalla en negro. Diagnosticado el 31/08/2026: un `next start -p 3050` llevaba viva desde una sesión de pruebas anterior sin cerrar, coincidiendo con los eventos del Visor de sucesos.

`npm run dev` ya se protegía solo (`predev: npx kill-port 3050`, mata cualquier proceso previo antes de arrancar); `npm run start` tenía el mismo hueco — no llevaba `prestart` — y es el comando usado para verificar rutas de API tras un build. Ya tiene el mismo guardián.

---

## Candados de juicio (OBLIGATORIO)

Tres reglas derivadas de clasificar las 29 entradas `feedback_*` de memoria (2026-08-01). No sustituyen al criterio: cubren **formas de fallo ya observadas y repetidas** en este proyecto. Cada una nombra el caso del que salió, porque de eso trata precisamente la segunda.

### 1. Candado tras cambio a escala

**Cuándo se dispara**: un cambio aplicado por script o de forma repetitiva a **más de 20 apps**, o que **renombre, mueva o retire una URL** (slug, ruta, entrada de `sitemap.ts`, enlace interno).

**Qué hacer antes del commit**:
1. **Verificar la salida, no la ejecución.** "El script terminó sin error" no dice nada sobre si las N salidas son correctas. Contar producidas vs esperadas y abrir 3 al azar.
2. **Grepear la condición negativa**: lo que NO debe existir tras el cambio (la ruta vieja, el patrón antiguo, el archivo que falta). Un grep que devuelve 0 es la prueba; que el build pase, no.
3. **Si la invariante puede repetirse** → dejarla como `scripts/check-*.mjs` enganchado a `npm run build`, igual que `check:verticales`, `check:enlaces` y `check:secrets`. Un candado que rompe el build vale más que cualquier recordatorio.

**De dónde sale**: 2026-05-26 — 438 apps (52% del catálogo) eran client components sin `layout.tsx`, así que su `metadata` se ignoraba y todas servían el title de la home; Google las trató como contenido duplicado y salieron 125 "rastreadas sin indexar" en Search Console. **El fallo fue silencioso durante meses.** Agravante que motiva el punto 1: el script que creó los 438 layouts introdujo su propio defecto (26 apps sin `jsonLd`), y también pasó desapercibido. Segundo caso, 2026-07-18: renombrados que dejaron 3 404 internos (una URL anunciada en `sitemap.ts` sin ruta detrás, dos enlaces obsoletos en cursos).

### 2. Nombrar el caso de origen de la regla que da luz verde

**Cuándo se dispara**: cuando parte de la justificación para proponer, construir o descartar algo sea *"cumple el criterio X"*, *"pasa el filtro Y"* o *"esto ya lo decidimos"*.

**Qué hacer**: no basta con invocar la regla. Hay que decir **de qué caso concreto nació** y **de qué trataba ese caso**, y solo entonces si aplica aquí.

- ❌ "Es una API nativa, así que pasa el filtro."
- ✅ "Pasa el filtro de APIs nativas, que salió del caso Tesseract (2026-07-24), donde el problema era **el peso de la descarga**. Aquí el peso no es el problema, así que ese filtro no dice nada sobre esta app."

**Si no se puede nombrar el caso de origen, la regla no se está aplicando: se está invocando.** Parar y verificar antes de seguir.

**De dónde sale**: tres fallos con la misma forma en ocho días, los tres por aplicar una regla del usuario fuera del caso que la generó.

| Fecha | La regla dio luz verde por... | Lo que quedaba fuera de esa regla |
|---|---|---|
| 24/07 | ser un hueco real de demanda | descarga de 5-15 MB al móvil (S0010, OCR) |
| 26/07 | ser "primera aproximación honesta" | el resultado era un juicio binario sobre la persona (S0014, rango auditivo) |
| 01/08 | ser una API nativa del navegador | Chrome envía el audio a Google (S0042, transcripción) |

Cada regla se escribió para su caso; el parecido superficial con el caso siguiente es exactamente la trampa.

### 3. Contador de veredicto repetido

**Cuándo se dispara**: en cualquier ritual recurrente que emita un veredicto (digest diario, semáforos del Centro de Mando, auditorías periódicas).

**Qué hacer**: el veredicto sale **acompañado del número de lecturas consecutivas que lleva diciendo lo mismo**. A partir de **5 iguales seguidas**, la lectura por defecto es *"el indicador está roto"*, no *"todo sigue bien"*, y se dice así en vez de repetirlo una vez más. El contador va **impreso en la salida**, no confiado a la memoria de nadie.

⚠️ **El contador va sobre el eje que discrimina, y la ausencia de un valor NO es una racha.** Antes de contar, mira qué valores llegan a salir de verdad: si uno de ellos exige condiciones que casi nada cumple, que lleve N lecturas sin aparecer no dice nada del indicador — sale de donde tiene que salir, que es de que ese valor es inalcanzable. Contar sobre él da la alarma equivocada, y encima suena a diligencia.

**De dónde sale**: el semáforo de la sección 9 del digest marcó ✅ durante **21 lecturas seguidas** mientras la métrica caía, y *Apps activas* llevaba 30 lecturas subiendo sin que su suelo llegara a hablar nunca. El principio ya estaba escrito ("un color que sale siempre deja de informar"); lo que faltaba era volverlo **mecánico**, porque un principio depende de que alguien lo recuerde y un contador no.

⚠️ **Y va sobre UNA sola población.** Si la serie mezcla dos cosas que se comportan distinto, la racha mide la mezcla y no el indicador. El caso: el contador del Inspector saltó con **8 `con_hallazgos_menores` seguidos**, pero aquellas ocho eran RE-inspecciones de apps recién reparadas —sus altos y críticos se habían arreglado días antes, así que solo podían quedar detalles—, mientras la serie de primeras inspecciones llevaba una racha de 2. Desde el 24/08/2026 `registrar.mjs` cuenta las dos por separado y cada una avisa de una cosa distinta: en primeras inspecciones, que el detector puede haber dejado de mirar; en re-inspecciones con hallazgos graves, que lo que no cierra es la reparación; con hallazgos menores, nada, porque es el resultado esperado. Que dispara donde debe y calla donde debe se comprueba con **`npm run inspector:probar-contador`**, que le reinyecta los cuatro casos sobre bases desechables.

**El aviso salió del caso simétrico** (23/08/2026): el Inspector llevaba **32 inspecciones sin un solo veredicto `ok`** y eso disparó la sospecha de detector roto. Se hizo la prueba —criterio escrito antes de ejecutarla, en `_private/inspector/PRUEBA-ESPECIFICIDAD.md`— y el detector estaba sano: los hallazgos verificados a mano eran reales. `ok` exigía que una app de 620-946 líneas no tuviera **ni un detalle**, algo que en este catálogo no ocurre (0/32); el eje informativo era la pareja `con_hallazgos` / `con_hallazgos_menores`, donde la racha máxima histórica era **4**, por debajo del umbral. Allí un color salía siempre y dejó de informar; aquí un valor no salía nunca y tampoco informaba. **Un indicador puede mentir por los dos extremos, y el contador no distingue solo: hay que decirle qué contar.**

---

## Flujo de Despliegue (Vercel + GitHub)

### Hosting
- **Producción**: `meskeia.com` (Vercel)
- **Repositorio**: GitHub → meskeIA/meskeia-web
- **Despliegue**: Automático (push a `main` → deploy en ~60s)

### Proceso

> **Política vigente (18/09/2026): se repara en el momento, se PUSHEA en lote.** Cada corrección
> lleva su commit atómico cuando se hace; el envío se agrupa en 2-3 pushes al día con la skill
> **`/push`**, que es donde vive el procedimiento completo. **No se difiere ninguna reparación**:
> lo único que espera es la subida.

```bash
# Durante la sesión — staging selectivo, NUNCA git add . ni git add -A
git add app/ components/ data/ lib/ public/ types/ server/ templates/
git commit -m "feat: descripción del cambio"

# Al cerrar el lote (build local + app-dates + push + verificación del deploy)
/push
```

**Por qué el lote**: el build es el **65 %** de la factura, y un push con 12 commits construye
**una** vez (cifras y antecedentes, en la skill `/push`). El historial no cambia: los commits
siguen siendo atómicos y `git revert <sha>` de una corrección suelta sigue valiendo.

**Sale con push propio, sin esperar al lote**: lo que hay que verificar EN PRODUCCIÓN (service
workers, cabeceras, redirects, CSP) y **una regresión introducida hoy**. El criterio es
*exposición nueva frente a exposición antigua*: lo que llevaba meses mal —los hallazgos del
Inspector, típicamente— va al lote. Lo gitignored (`_private/`, `digests/`, las skills,
`scripts/digest-diario.mjs`) no cuesta ningún deploy: ahí no hay nada que agrupar.

### ⚠️ app-dates.json lo refresca `/push`, y no es opcional

`data/app-dates.json` alimenta el `lastModified` del sitemap, y su generador deduce la
fecha de cada app del `git log` de `app/<slug>/`. Como el build se ejecuta **antes de que el
commit exista**, el JSON que genera no puede contener ese cambio: sin refrescarlo, el `lastmod`
va siempre un commit por detrás y hay que corregirlo después con un commit extra (los dos casos,
en la cabecera de `scripts/generate-app-dates.mjs`). Con el lote se hace **una vez al día**, en
**commit propio y no con `--amend`** — enmendar modificaría el último commit, que puede ser de
otra conversación.

El fichero **se commitea a propósito**: en Vercel el clon es shallow y `git log` daría
fechas falsas para todo el catálogo, así que allí el build solo lee este JSON.

> Ojo al usarlo para otra cosa: guarda fechas de **última modificación**, no de
> publicación. Para saber la antigüedad real de una app, la primera visita en Turso
> (`MIN(created_at)`).

### Variables de Entorno (Vercel Dashboard)

- `TURSO_DATABASE_URL` - Base de datos Turso
- `TURSO_AUTH_TOKEN` - Token autenticación

### API Routes (Serverless Functions)

Las rutas vivas son `ls app/api/analytics/`.

---

## Archivos Auxiliares

`sitemap.xml` y `robots.txt` los genera Next desde `app/sitemap.ts` y `app/robots.ts`;
`public/ai-index.json` lo genera `npm run build`. **Ninguno se edita a mano.** Los tres registros
manuales de toda app (`applications.ts` + `implemented-apps.ts` + `app-relations.ts`) están más
arriba, en «Registro de una app en un portal vertical».

---

## Herramientas de Desarrollo

### Dónde vive una skill (16/09/2026)

**Una skill de meskeIA se crea en `.claude/skills/` del proyecto**, no en `~/.claude/skills/`.
Allí solo quedan las cuatro transversales —`/agenda`, `/log`, `/markets`, `/correo`—, que sirven
también a los programas del PC.

El motivo es medible: la descripción de cada skill se carga en **todas** las sesiones de **todos**
los proyectos, y las 14 de meskeIA sumaban ~6 KB que pagaban XFinanzas, Genealogía y markets sin
usarlos nunca. Es la misma razón por la que el CLAUDE.md global no duplica los estándares de
meskeIA y por la que `/meskeia-dev-stack` se retiró el 10/09/2026.

⚠️ **No se versionan**: 10 de las 14 citan rutas privadas (`_private/`, `digests/`, `semillas/`)
y este repositorio es **público**. `.gitignore` las excluye salvo `cuadre` y `trpc-meskeia`, que
no contienen nada privado. Consecuencia asumida: no viajan a otra máquina — igual que antes, que
tampoco viajaban al no versionarse `~/.claude/`.

⚠️ **CRLF rompe el frontmatter en silencio**: la skill se carga igual, pero su `description:` no
se lee y el modelo ve el título `# H1` en su lugar. `semilla-diaria` llevaba así desde su
creación y nadie lo notó. Guardar siempre en LF.

> Los punteros `skill:<nombre>` de la Agenda se resuelven en los DOS directorios desde el
> 16/09/2026 (`agenda-hoy.mjs`). Antes solo miraba el global y daba por muerta cualquier skill
> mudada — que es como se descubrió esto.

Los comandos disponibles se ven con `/help`; las revisiones de código van por el `/code-review` integrado. Los plugins `code-review`, `audit`, `analyze-codebase`, `bug-detective`, `debugger` y `accessibility-expert` de `cc-marketplace` **se retiraron el 11/08/2026**: cero usos desde junio, y el primero además duplicaba el comando integrado.

**Testing de frontend interactivo**: sin MCP — verificado el 01/09/2026 que no hay ninguno
registrado en esta máquina (un permiso en `settings.json` no es un registro). Se usa
`@playwright/test` directo sobre el Chromium de `node_modules/playwright`:
`npx playwright test tests/apps/<slug>.spec.ts` arranca y cierra el servidor de dev solo
(`playwright.config.ts`). Lo usan `/inspector` y el PASO 4.bis de `/nueva-app-meskeia`.

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

`~/.claude/CLAUDE.md` (reglas universales) · `_private/DISCLAIMER-POLICY.md` (niveles, textos y
colapsabilidad) · `components/README.md` · `templates/README.md`. El historial de este fichero es
`git log CLAUDE.md`; el CHANGELOG antiguo, `_private/archivo/`.

---

**Proyecto**: meskeIA Web (https://meskeia.com)


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
