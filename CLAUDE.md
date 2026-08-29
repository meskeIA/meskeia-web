# CLAUDE.md - Instrucciones específicas del proyecto meskeia-web

> Complementa `~/.claude/CLAUDE.md`, que tiene lo **universal** a todos mis proyectos: español,
> formato español, TypeScript, accesibilidad, dark mode, secretos y disciplina de build.
> Lo de aquí abajo es lo que solo aplica a meskeIA.

## Proyecto: meskeia-web

Repositorio en `C:\Users\jaceb\meskeia-web`, hospedado en Vercel (meskeia.com). Push a `main` despliega solo.

Servidor de desarrollo y producción en el **puerto 3050** (`npm run dev` / `npm run start`). El resto de scripts, en `package.json`.

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

El detalle completo (workflow con agentes en paralelo, las 4 reglas de UX que NO se modifican, estructura de `HistoriaData` y las 6 restricciones críticas) vive en **`data/historias/CLAUDE.md`**, que se carga solo al trabajar bajo ese directorio.

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

## Registro de una app en un portal vertical

Cada vertical tiene **un solo sitio** donde se registra, además de los tres de cualquier app (`data/applications.ts` + `data/implemented-apps.ts` + `data/app-relations.ts`):

| Vertical | Dónde se registra | Qué aporta esa entrada |
|---|---|---|
| **Stemum** | `STEMUM_APPS` en `data/stemum.ts` | Pertenencia a disciplina (breadcrumb, proxy, contadores) **y** la tarjeta de la parrilla `/stemum/[disciplina]/` |
| **Coquinum** | `COQUINUM_APPS` en `data/coquinum.ts` | Pertenencia a categoría **y** la tarjeta de la parrilla **y** el nombre/icono del bloque «Más de [categoría]» |
| **Cronicum** | el array `slugs` de una puerta en `data/cronicum/puertas.ts` | La puerta por la que se llega a la cronología (el título, icono y descripción salen de `data/historias/[slug].ts`) |

En Stemum y Coquinum el orden dentro de la sección **es** el orden de la parrilla. En Cronicum cada cronología va en **exactamente una** puerta.

> **Histórico (2026-07-28)**: las parrillas eran arrays `APPS` hardcodeados en cada `app/{stemum,coquinum}/[seccion]/page.tsx`, así que registrar una app pedía DOS listas (TRES en Coquinum, con `COQUINUM_APP_INFO`). Consecuencias reales: `simulador-logica-secuencial` y `ajustar-ecuaciones-quimicas` quedaron contadas en el hero de Stemum pero **sin tarjeta que las enlazase y sin dar ningún error**; en Coquinum 21 títulos y 17 iconos habían divergido, y la misma app se presentaba distinta en la parrilla y en el pie. Ahora las parrillas se derivan de `appsDeDisciplina()` / `appsDeCategoria()`, y `COQUINUM_APP_INFO` del catálogo.

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
- Parser numérico: usar `parseSpanishNumber`, que admite `1,234.56` y `1.234,56` — cuando
  aparecen los dos separadores, **el último es el decimal**. Con uno solo la ambigüedad es
  irreducible (`1.234`) y gana el español. Rechaza con `NaN` lo que no es un número
  (`12abc`, `1e3`, `1.2.3`), así que no hace falta validar antes de llamarlo.
  > Hasta el 24/08/2026 esta línea prometía los dos formatos y **el código no los admitía**:
  > `1,234.56` salía 1,23456. Lo destapó el Inspector en `conversor-numeros-letras`, que
  > repetía la promesa sobre el campo con el que se rellenan pagarés.
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
- ✅ Puedes ejecutar `npm run check:tipos` UNA SOLA VEZ para verificar
- ❌ PROHIBIDO: ejecutar `npm run build` (conflicto de lock entre agentes)
- ❌ PROHIBIDO: modificar archivos compartidos (applications.ts, implemented-apps.ts, app-relations.ts)
- ❌ PROHIBIDO: ejecutar `npm run check:tipos` más de una vez
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

Criterio de uso, ubicación de cada pieza y plantilla de router: skill **`/trpc-meskeia`**. En una frase: tRPC para apps nuevas que consuman datos del servidor; las API Routes existentes (220+) se mantienen y **no se migran**.

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

### Candado de accesibilidad JSX

`npm run check:a11y-jsx` — lo ejecuta también `npm run build`, y **rompe el build** si el
commit escribe un `<button>` sin `type=` o un emoji junto a texto sin `aria-hidden` (las dos
reglas del CLAUDE.md global §5 cuya corrección es unívoca). Las otras **tres** situaciones
—`aria-pressed` que falta en un toggle, `aria-pressed` que SOBRA, y emoji en nodo propio—
exigen criterio y **solo avisan**: un `aria-pressed` en un botón de acción es una regresión,
no una mejora.

> La regla del `aria-pressed` que sobra es de 24/08/2026 y sale del hallazgo 285: las cuatro
> opciones de `quiz-simbolos-quimicos` lo llevaban siendo botones de acción, y la regla que
> vigila el caso contrario no podía verlo porque solo salta cuando el botón no tiene **ningún**
> `aria-*` — allí había uno, del tipo equivocado. Señala solo lo que puede DEMOSTRAR por la
> forma del código: que `disabled` sea verdadero siempre que `aria-pressed` lo sea, o sea que
> pulsarlo lo deje fijo. Su caso de prueba —dos botones que debe cazar y dos conmutadores
> legítimos que debe dejar pasar— está en `scripts/pruebas/a11y-regla5.tsx`.

⚠️ Juzga **las líneas que el commit añade**, no el fichero entero, igual que `check:secrets`.
El catálogo arrastra ~5.000 incumplimientos en 731 ficheros (medido el 23/08/2026 con
`--todo`), así que un candado por fichero rompería el build al tocar cualquier app antigua y
acabaría desactivado. Lo que el fichero ya arrastraba se cuenta y se nombra, pero no detiene
nada. Falso positivo: `a11y-ok: <razón>` en esa línea o en la anterior.

`npm run check:a11y-jsx -- --todo` mide el pasivo entero (2,5 s, no rompe nada) y
`node scripts/check-a11y-jsx.mjs <fichero>` audita uno concreto.

> Sale de la tanda del Inspector del 21/08/2026: 15 hallazgos de accesibilidad en **10 de 10**
> apps, siempre las mismas tres reglas. No es que el candado fallara — no había candado. La
> skill `/audit-accesibilidad-jsx` solo mira las apps de los últimos 60 días, y aquellas eran
> de febrero-mayo. El pasivo sigue siendo suyo; lo nuevo ya es de este candado.

### Candado del parser numérico

`npm run check:parser` — lo ejecuta también `npm run build`, y **rompe el build** si el commit
escribe `parseFloat(x.replace(',', '.'))` o cualquier variante del parseo casero. El parser
canónico es **`parseSpanishNumber`** de `@/lib`.

`parseFloat` se queda con el prefijo numérico y descarta el resto sin avisar (`'12abc'` → 12,
`'1e3'` → 1000, `'10.5.3'` → 10,5), y el `.replace(',', '.')` de delante lee el millar español
mil veces más pequeño: «1.500» se convierte en 1,5.

⚠️ Igual que `check:a11y-jsx`, juzga **las líneas que el commit añade**, no el fichero entero, y
por una razón medida: el catálogo arrastra **191 usos en 87 ficheros** (25/08/2026), y de una
muestra de 60 **35 no validan el resultado del parseo**. Sustituirlos en bloque haría aparecer
«NaN» en pantalla en más de la mitad, porque `parseSpanishNumber` devuelve NaN donde `parseFloat`
devolvía un número: sería cambiar un defecto silencioso por uno visible en 87 apps a la vez. El
pasivo lo drena el Inspector app por app, que es donde se puede comprobar en navegador si esa app
maneja el NaN o si hay que añadirle la guarda. Falso positivo: `parser-ok: <razón>` en esa línea
o en la anterior — los hay de verdad, como parsear un `dataset` que escribe la propia app.

`npm run check:parser -- --todo` mide el pasivo entero y `node scripts/check-parser-numerico.mjs
<fichero>` audita uno concreto. Su caso de prueba —cuatro formas que debe cazar y cuatro que debe
dejar pasar— está en `scripts/pruebas/parser-numerico.tsx`.

> Sale de dos hallazgos del Inspector con el mismo defecto: `conversor-numeros-letras`
> (24/08/2026), que es con lo que se rellenan pagarés, y `calculadora-masa-madre` (hallazgo 290).
> Y su primera versión **era ciega a la forma más habitual del catálogo** —dos `replace`
> encadenados, `x.replace(/\./g, '').replace(',', '.')`, donde el paréntesis del primero rompía
> el patrón—: veía 153 de 188 usos reales. Se descubrió comparándolo con un `grep` independiente,
> no ejecutándolo.

### Candado de la tarjeta social

`npm run check:og-image` — lo ejecuta también `npm run build`. Vigila la imagen con la que un
enlace se convierte en tarjeta en X, WhatsApp, LinkedIn o Slack.

**Rompe el build** si una app de un portal vertical no declara la og de SU portal en `openGraph`
y en `twitter`, si una página de portal se queda sin ella, si la imagen no existe en `public/`, o
si la URL cae bajo un redirect de `next.config.ts` que la desvía a otro dominio.

⚠️ **Next NO hereda la imagen del layout raíz.** El merge de metadata es *shallow*: declarar
`openGraph` en la página reemplaza entero el del padre, así que la `ogImage` de
`generateBaseMetadata()` no llega. Con `twitter:card = summary_large_image` y ninguna imagen
detrás, la tarjeta se degrada a la pequeña con icono de documento. Por eso la plantilla
`templates/app-base/` ya trae `images`: una app nueva nace con imagen.

**Sin pasivo**: rompe también si cualquier app del catálogo declara `openGraph` sin `images`.
Nació como aviso —arrastraba 159 apps, y romper por ellas lo habría dejado desactivado en una
semana, criterio de `check:a11y-jsx` y `check:parser`—, pero el 29/08/2026 se drenó entero en
cuatro tandas, así que ya solo puede encenderlo una app nueva escrita sin imagen. Escape:
`og-ok: <razón>` en el `metadata.ts`. Al abrir un vertical nuevo se añade su entrada a `PORTALES` en el
script y el candado pasa a exigirlo. Los cuatro están cubiertos: **Coquinum** (84 apps),
**Stemum** (139 apps + 12 tablas de material de apoyo, que también se publican bajo stemum.com),
**Cronicum** (sus 182 páginas salen de un solo `generateMetadata`) y **Delegum** (21 páginas de
portal).

⚠️ **Delegum es la excepción: sus apps NO llevan la og del portal.** No es por falta de lista
—`DELEGUM_APP_SLUGS` existe, con 91 apps— sino porque **Delegum no sirve apps bajo su dominio**:
su proxy no hace passthrough de slugs del catálogo, así que `delegum.com/estimador-irpf/` da 404
mientras `coquinum.com/escandallo-food-cost/` da 200. Esas apps solo se ven bajo `meskeia.com`, de
modo que ponerles la og de Delegum las marcaría con una marca que el visitante nunca llega a ver.
`DELEGUM_APP_SLUGS` alimenta *Soluciones* (enrutado por journey), no pertenencia al portal. Lo que
sí es suyo son las páginas de su árbol: home, fichas de `/datos-fiscales/`, asistente y blog. De ahí que el candado
recorra el **árbol** de cada portal en vez de una lista de páginas: las 20 páginas propias de
Delegum llevaban sin imagen desde siempre y ninguna lista las habría echado de menos.

> Sale de la pregunta de por qué los posts de X de Coquinum y Cronicum salían sin imagen y los de
> meskeIA no (29/08/2026). No era X ni indexación: 159 apps declaraban `openGraph` sin `images`,
> 54 de ellas del portal gastro, porque **la plantilla no la incluía**. Y la og de Cronicum
> apuntaba a `meskeia.com/cronicum/og-image.png`, que el 308 canónico `/cronicum/:path+` desvía a
> `cronicum.com/og-image.png` — la imagen de meskeIA: la de Cronicum **no se sirvió nunca**,
> mientras el comentario del código afirmaba justo lo contrario. Ese segundo defecto es el que
> ningún ojo detecta leyendo el metadata, y es el que obliga a que el candado cruce la URL con los
> redirects. **Delegum tenía el mismo defecto, con el comentario falso palabra por palabra.** Los
> seis casos reinyectados —más los tres que debe dejar pasar— están en `npm run og:probar-candado`.
>
> ⚠️ **Dos de esos casos los escribió el propio candado fallando.** El de una página de portal sin
> imagen destapó que comprobaba la URL sobre el fichero entero, así que un `openGraph` sin imagen
> colaba si el `twitter` de al lado sí la tenía —y `og:image` es el que leen casi todas las
> plataformas—; ahora verifica bloque a bloque. Sin esa prueba, el candado habría dado luz verde a
> exactamente el defecto que existe para prevenir.

### TypeScript

- ⚠️ `ignoreBuildErrors: true` en `next.config.ts` — el build de producción NO type-chequea (limitación de RAM en Vercel: el type-check de +1.100 apps agota los 8 GB)
- Validación de tipos SIEMPRE en local: **`npm run check:tipos`** antes de commitear cambios sustanciales
  (lo ejecuta también `npm run build`; en Vercel se salta, para no encarecer cada despliegue)

  ⚠️ **NO usar `npx tsc --noEmit` a secas: puede estar CIEGO y devolver «0 errores» sin haber
  mirado nada.** Next escribe `.next/dev/types/routes.d.ts` y `validator.ts` sin truncar, así que
  al acortarse dejan restos de la versión anterior; sus cientos de errores de SINTAXIS abortan el
  análisis semántico de todo el proyecto. Y no basta con excluirlos del tsconfig, porque
  `next-env.d.ts` los importa explícitamente. Descubierto el 14/08/2026 inyectando
  `const x: number = "texto"` en `app/`: tsc devolvía 0 errores. `check:tipos` los retira si están
  corruptos, revalida, y **falla si no consigue dejar la validación limpia** — un validador que
  dice «0 errores» tiene que poder distinguir entre «está bien» y «no he mirado».
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
2. **NUNCA lanzar builds en paralelo** — ni siquiera `npm run check:tipos` mientras un build está corriendo.
3. **NUNCA reintentar un build sin verificar primero** que el anterior ha terminado (comprobar si `.next/lock` existe).
4. **Si hay lock stale** (lock existe pero no hay proceso `next build` activo): eliminar con `rm -f .next/lock` y ENTONCES hacer UN solo build.
5. **No usar `run_in_background`** para builds — ejecutar siempre en foreground con timeout de 600000ms para poder ver el resultado directamente.

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

> Política vigente (2026-07-16): commit + push + deploy automático en el mismo flujo.
> No agrupar pushes salvo petición expresa del usuario.

```bash
# 1. Verificar build (timeout 10 min / 600000ms)
npm run build

# 2. Commit — staging selectivo, NUNCA git add . ni git add -A
git add app/ components/ data/ lib/ public/ types/ server/ templates/
git commit -m "feat: descripción del cambio"

# 3. Si el commit ha tocado app/: refrescar app-dates.json ANTES del push
node scripts/generate-app-dates.mjs
git add data/app-dates.json
git commit --amend --no-edit      # aún sin pushear: enmendar es seguro

# 4. Push (Vercel despliega automáticamente)
git push origin main
```

### ⚠️ El paso 3 no es opcional (y es fácil de olvidar)

`data/app-dates.json` alimenta el `lastModified` del sitemap, y su generador deduce la
fecha de cada app del `git log` de `app/<slug>/`. Como el build del paso 1 se ejecuta
**antes de que el commit exista**, el JSON que genera no puede contener ese cambio: sin
el paso 3, el `lastmod` va siempre un commit por detrás y hay que corregirlo después con
un commit extra (ocurrió en `9472e33a` y `83227161` antes de documentarse esto).

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

Los comandos disponibles se ven con `/help`; las revisiones de código van por el `/code-review` integrado. Los plugins `code-review`, `audit`, `analyze-codebase`, `bug-detective`, `debugger` y `accessibility-expert` de `cc-marketplace` **se retiraron el 11/08/2026**: cero usos desde junio, y el primero además duplicaba el comando integrado.

**Testing de frontend**: Playwright MCP, registrado en **ámbito de usuario** (`~/.claude.json`, vía
`claude mcp add`), con `--browser chromium --headless`. Ese flag no es opcional: por defecto el MCP
busca el **Chrome del sistema**, que en este PC no existe (el navegador es Vivaldi), y falla al abrir
la primera página aunque `claude mcp list` diga `✔ Connected`. Con el flag usa el chromium que
Playwright ya tiene en `%LOCALAPPDATA%\ms-playwright`.

> ⚠️ **Un permiso no arranca un servidor.** Hasta el 12/08/2026 esta línea decía que Playwright estaba
> «configurado en `settings.local.json`», y era falso: la declaración vivía en `~/.claude/mcp-config.json`,
> que **solo se carga si se arranca con `claude --mcp-config <ruta>`**, mientras que `settings.json` únicamente
> tenía el permiso `mcp__playwright__*`. Como el permiso sí estaba, no saltaba ningún diálogo y parecía
> integrado — hasta que hizo falta y no existía. Los sitios que Claude Code carga solo son `~/.claude.json`
> (usuario/local) y `.mcp.json` en la raíz del repositorio.

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

---

**Proyecto**: meskeIA Web (https://meskeia.com) · el historial de este fichero es `git log CLAUDE.md`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
