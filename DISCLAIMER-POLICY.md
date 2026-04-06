# Política de Disclaimers meskeIA

> **Versión**: 1.0.0 (2026-03-19)
> **Autor**: Claude Code
> **Aplicación**: Todas las apps de meskeIA (300+)
> **Estado**: Política oficial — aplicar en nuevas apps y en la revisión global

---

## Índice

1. [Principio General](#1-principio-general)
2. [Niveles de Riesgo](#2-niveles-de-riesgo)
3. [Clasificación por Suites](#3-clasificación-por-suites)
4. [Textos Estándar por Nivel](#4-textos-estándar-por-nivel)
5. [Reglas de Colapsabilidad](#5-reglas-de-colapsabilidad)
6. [Componente DataReference](#6-componente-datareference)
7. [Checklist para Nuevas Apps](#7-checklist-para-nuevas-apps)
8. [Guía de Auditoría](#8-guía-de-auditoría)

---

## 1. Principio General

El sistema de disclaimers de meskeIA tiene **dos objetivos distintos** que nunca deben mezclarse en el mismo elemento:

| Objetivo | Componente | Contenido |
|----------|-----------|-----------|
| **Responsabilidad legal** | `DisclaimerCard` | Texto de descarga de responsabilidad, nivel de riesgo |
| **Transparencia de datos** | `DataReference` | Normativa aplicada, fuente oficial, fecha de verificación |

**meskeIA no ejerce actividades reguladas** (no es asesor financiero, fiscal, médico ni jurídico). Todas las herramientas son orientativas. Esta distinción debe quedar clara al usuario en toda app donde exista riesgo de confusión.

---

## 2. Niveles de Riesgo

### Nivel 1 — CRÍTICO

**Criterio**: La app orienta sobre decisiones con consecuencias económicas, legales o vitales graves y potencialmente irreversibles o de difícil corrección.

**Señales de identificación**:
- Afecta a patrimonio significativo (hipoteca, herencia, jubilación, inversión con capital real)
- Implica normativa fiscal o tributaria de cualquier tipo (IRPF, IVA, IS, plusvalías, retenciones, deducciones...)
- Implica normativa legal (sucesiones, contratos, plazos legales, sanciones)
- Puede afectar a la salud de forma directa (orientación médica, medicamentos, indicadores clínicos)
- El error puede tener consecuencias retroactivas (inspección fiscal, liquidaciones, recargos)

**Reglas obligatorias**:
- `collapsible={false}` — nunca colapsable
- `severity="critical"`
- Texto completo de descarga de responsabilidad (ver sección 4)
- Mención explícita al tipo de profesional a consultar
- Sin `localStorage` ni `sessionStorage`

---

### Nivel 2 — ALTO

**Criterio**: Orientación financiera, de salud o de gestión con impacto real pero donde el usuario dispone de margen de corrección antes de actuar.

**Señales de identificación**:
- Calculadoras de ahorro, seguros, rentabilidades, costes
- Estimadores de presupuesto, deuda, inversión orientativa
- Orientación nutricional, de hábitos de salud o ejercicio
- Herramientas de autónomos sin componente fiscal directo

**Reglas obligatorias**:
- `collapsible={false}` — nunca colapsable
- `severity="high"`
- Texto de descarga de responsabilidad + recomendación de profesional (ver sección 4)
- Sin `localStorage` ni `sessionStorage`

---

### Nivel 3 — MEDIO

**Criterio**: Herramientas de apoyo a decisiones cotidianas sin implicaciones legales, fiscales ni médicas directas.

**Señales de identificación**:
- Planificadores de menú, rutinas, bodas, tareas
- Calculadoras de propinas, descuentos, porciones
- Herramientas de productividad personal
- Tests de perfil o hábitos sin implicaciones clínicas

**Reglas**:
- `collapsible={true}` — permitido
- `severity="medium"`
- Estado inicial: **expandido** en cada nueva sesión
- Storage: **`sessionStorage`** (no persiste entre sesiones)
- Texto orientativo breve (ver sección 4)

---

### Nivel 4 — INFORMATIVO

**Criterio**: Contenido educativo o de curiosidad donde el resultado no conduce a ninguna decisión de impacto real.

**Señales de identificación**:
- Calculadoras matemáticas, físicas, estadísticas
- Quizzes de conocimiento general
- Generadores (nombres, gitignore, lotería)
- Herramientas de referencia técnica para profesionales del dominio

**Reglas**:
- `DisclaimerCard` **opcional**
- Si se incluye: `collapsible={true}`, `severity="low"`
- Storage: **`localStorage`** (persiste entre sesiones)
- `LegalNotice` sigue siendo obligatorio en todas las apps

---

## 3. Clasificación por Suites

### Nivel por defecto de cada suite

| Suite | Nivel por defecto | Justificación |
|-------|:-----------------:|---------------|
| `inmobiliaria` | **1 — CRÍTICO** | Hipotecas, compraventa, plusvalías. Decisiones de gran impacto económico y legal |
| `finanzas` | **1 ó 2 — variable** | Suite heterogénea (ver disparadores abajo) |
| `salud` | **1 ó 2 — variable** | Depende del componente clínico (ver disparadores abajo) |
| `freelance` | **2 — ALTO** | Fiscalidad, cotizaciones, facturación con impacto real |
| `marketing` | **3 — MEDIO** | Sin implicaciones legales directas |
| `productividad` | **3 — MEDIO** | Organización personal sin consecuencias graves |
| `estudiantes` | **4 — INFORMATIVO** | Matemáticas, ciencias, estudio |
| `tecnicas` | **4 — INFORMATIVO** | Herramientas de referencia para profesionales |
| `diseno` | **4 — INFORMATIVO** | Utilidades técnicas sin implicaciones de decisión |
| `juegos` | **4 — INFORMATIVO** | Entretenimiento puro |
| `cultura` | **4 — INFORMATIVO** | Conocimiento general, quizzes |

### Disparadores de Nivel 1 CRÍTICO dentro de suites variables

#### Suite `finanzas` → Nivel 1 CRÍTICO si la app trata:
- Jubilación o pensiones
- Herencias, sucesiones o legítimas
- Hipotecas o compraventa inmobiliaria
- **Cualquier componente fiscal** (IRPF, IVA, IS, plusvalías, retenciones, deducciones, cuotas SS...)
- Inversiones con capital real (acciones, fondos, planes de pensiones)
- Plazos o sanciones legales

#### Suite `salud` → Nivel 1 CRÍTICO si la app trata:
- Orientación sobre medicamentos (dosis, interacciones, pauta)
- Indicadores clínicos (tensión arterial, colesterol, osteoporosis, IMC con derivación clínica)
- Seguimiento de embarazo o fertilidad
- Orientación sobre discapacidad, dependencia o fragilidad
- Diagnóstico o screening de condiciones de salud

### Regla para apps multi-suite

> **El nivel de riesgo aplicable es siempre el de la suite de mayor riesgo.**

**Ejemplo**: App en `['productividad', 'finanzas']` con componente fiscal → Nivel 1 CRÍTICO.

---

## 4. Textos Estándar por Nivel

### Nivel 1 CRÍTICO — Variante financiera / fiscal / inmobiliaria

```
Esta herramienta tiene carácter exclusivamente orientativo y no constituye
asesoramiento financiero, fiscal ni jurídico. Los resultados son estimaciones
basadas en los datos introducidos y pueden no reflejar tu situación real.

La fiscalidad y las decisiones financieras de alto impacto requieren la
intervención de un profesional cualificado (asesor fiscal, gestor, abogado
o entidad financiera regulada).

TÚ ERES RESPONSABLE de verificar esta información con un profesional antes
de tomar cualquier decisión. meskeIA no ejerce actividades reguladas y no
se responsabiliza de las consecuencias derivadas del uso de esta herramienta.
```

### Nivel 1 CRÍTICO — Variante médica / salud

```
Esta herramienta tiene carácter exclusivamente orientativo y no constituye
diagnóstico médico, prescripción ni consejo sanitario. Los resultados son
estimaciones de referencia y no reemplazan la valoración clínica individualizada.

Cualquier decisión relacionada con tu salud debe tomarse siempre bajo la
supervisión de un médico o profesional sanitario cualificado.

TÚ ERES RESPONSABLE de consultar con un profesional antes de actuar sobre
esta información. meskeIA no ejerce actividades sanitarias reguladas y no
se responsabiliza de las consecuencias derivadas del uso de esta herramienta.
```

### Nivel 2 ALTO — Variante financiera

```
Esta herramienta tiene carácter orientativo. Los resultados son estimaciones
y no constituyen asesoramiento financiero ni fiscal.

Te recomendamos contrastar los resultados con un profesional cualificado
antes de tomar decisiones importantes. meskeIA no se responsabiliza de
decisiones basadas en el uso de esta herramienta.
```

### Nivel 2 ALTO — Variante médica / salud

```
Esta herramienta tiene carácter orientativo. Los resultados son referencias
generales y no sustituyen la valoración de un profesional sanitario.

Consulta siempre con tu médico o especialista antes de realizar cambios
significativos en tu salud o hábitos. meskeIA no se responsabiliza de
decisiones basadas en el uso de esta herramienta.
```

### Nivel 3 MEDIO

```
La información proporcionada por esta herramienta tiene carácter orientativo.
Los resultados pueden variar según tu situación particular.

meskeIA no se responsabiliza de decisiones basadas en el uso de esta herramienta.
```

### Nivel 4 INFORMATIVO *(opcional)*

```
Esta herramienta es de uso educativo y de referencia. Los resultados tienen
finalidad informativa.
```

---

## 5. Reglas de Colapsabilidad

| Nivel | Colapsable | Estado inicial | Storage |
|-------|:---------:|:--------------:|:-------:|
| **1 — CRÍTICO** | ❌ No | Siempre expandido | Ninguno |
| **2 — ALTO** | ❌ No | Siempre expandido | Ninguno |
| **3 — MEDIO** | ✅ Sí | Expandido en cada sesión | `sessionStorage` |
| **4 — INFORMATIVO** | ✅ Sí | Puede iniciar colapsado | `localStorage` |

### Justificación del sessionStorage en Nivel 3

El uso de `localStorage` en disclaimers de Nivel 3 daba falsa sensación de seguridad: el usuario podría haber cerrado el aviso sin leerlo, y en la siguiente sesión ya no lo vería. Con `sessionStorage`, el aviso se muestra expandido al iniciar cada sesión de navegación, garantizando exposición regular al mensaje.

### DataReference — siempre visible

El componente `DataReference` **nunca es colapsable**, independientemente del nivel de la app. Es un bloque compacto (2-3 líneas) cuya información — normativa aplicada, fuente y fecha — es demasiado relevante para ocultarse.

---

## 6. Componente DataReference

### Cuándo incluirlo

Obligatorio en apps que usen datos normativos con fecha de caducidad:
- Tipos impositivos (IRPF, IVA, IS, ITP...)
- Tramos de cotización (autónomos, SS)
- Tipos de interés (demora, legal, hipotecario)
- Coeficientes (plusvalía municipal, amortización...)
- Normativa por CCAA
- Datos de pensiones y Seguridad Social

Opcional (recomendado) en apps con datos que puedan variar pero con menor criticidad.

### Fuente de datos

Los módulos `data/fiscal/` ya contienen los metadatos necesarios:

```typescript
// Ejemplo: data/fiscal/irpf.ts
export const FISCAL_IRPF_META = {
  fuente: 'Ley 35/2006 del IRPF + LPGE 2025',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/...',
  nota: 'Verificar en la Agencia Tributaria para cálculo exacto.'
};
```

### Uso en una app

```tsx
import { FISCAL_IRPF_META } from '@/data/fiscal';

<DataReference
  normativa="IRPF 2025"
  fuente={FISCAL_IRPF_META.fuente}
  verificado={FISCAL_IRPF_META.verificado}
  urlOficial={FISCAL_IRPF_META.urlOficial}
/>
```

### Resultado visual

```
📅 Datos de referencia
Normativa aplicada: IRPF 2025 — Ley 35/2006 + LPGE 2025
Última verificación: enero 2026  ·  Fuente oficial: AEAT →
```

### Posición en la página

`DataReference` se coloca **inmediatamente después** de `DisclaimerCard`, antes del contenido principal.

```
1. <MeskeiaLogo />
2. Hero Section
3. <LegalNotice />
4. <DisclaimerCard variant="financial" severity="critical" />   ← Nivel 1
5. <DataReference normativa="..." fuente="..." ... />           ← Si aplica
6. Herramienta / Calculadora principal
7. Resultados
8. <EducationalSection>
9. <RelatedApps />
10. <ShareCard appName="..." />
11. <Footer appName="..." />
```

---

## 7. Checklist para Nuevas Apps

Antes de hacer commit de cualquier nueva app, verificar:

```
DISCLAIMER — Paso 1: ¿Necesita DisclaimerCard?
[ ] ¿La app da consejos personalizados sobre temas fiscales, legales, médicos o financieros?
[ ] ¿El usuario podría tomar decisiones de impacto basándose en el resultado?
  → SÍ a cualquiera: necesita DisclaimerCard (ir a Paso 2)
  → NO a ambas: añadir `// @disclaimer: exempt` en línea 2 del page.tsx (después de 'use client')

DISCLAIMER — Paso 2: Configurar DisclaimerCard
[ ] ¿He identificado el nivel de riesgo correcto? (1-4)
[ ] ¿La app pertenece a varias suites? → aplicar el nivel más alto
[ ] ¿Hay componente fiscal? → Nivel 1 CRÍTICO obligatorio
[ ] ¿El DisclaimerCard usa la variante correcta? (financial/medical/general/educational/technical)
[ ] ¿El severity coincide con el nivel? (critical/high/medium/low)
[ ] ¿Nivel 1 o 2 → collapsible={false}?
[ ] ¿Nivel 3 → sessionStorage?
[ ] ¿El texto del disclaimer es el estándar de la política o una personalización justificada?

DATA REFERENCE
[ ] ¿La app usa datos normativos con fecha de caducidad?
[ ] Si sí → ¿He incluido <DataReference>?
[ ] ¿Los metadatos vienen de data/fiscal/ o están documentados en la app?

LEGAL
[ ] ¿LegalNotice presente bajo el hero?
[ ] ¿DisclaimerCard NO está dentro de EducationalSection?
```

### Directiva `@disclaimer: exempt`

Apps que **no necesitan DisclaimerCard** deben declararlo explícitamente en su `page.tsx`:

```tsx
'use client';
// @disclaimer: exempt
```

Esto aplica a: apps educativas puras, juegos, tests de reflexión/autoconocimiento, visualizadores con datos de ejemplo, quizzes de conocimiento, herramientas técnicas sin consejo profesional.

El script `audit-disclaimers.mjs` lee esta directiva. Apps sin `DisclaimerCard` ni `@disclaimer: exempt` se flagean como pendientes de revisión.

---

## 8. Guía de Auditoría

### Cómo identificar inconsistencias

El script `scripts/audit-disclaimers.ts` genera un informe automático con:

1. **Apps sin DisclaimerCard** que deberían tenerlo (según su suite)
2. **Apps con `collapsible={true}`** en Nivel 1 o 2 (error crítico)
3. **Apps con suite fiscal** sin `severity="critical"`
4. **Apps que usan `localStorage`** en disclaimers de Nivel 3

### Prioridad de corrección

| Prioridad | Caso | Riesgo |
|-----------|------|--------|
| 🔴 Urgente | Nivel 1 con `collapsible={true}` | Disclaimer puede estar oculto |
| 🔴 Urgente | App fiscal con severity < critical | Infravaloración del riesgo |
| 🟡 Alta | App de salud clínica sin variante `medical` | Mensaje incorrecto |
| 🟡 Alta | Nivel 3 usando `localStorage` | Cambiar a `sessionStorage` |
| 🟢 Normal | App sin DataReference pero con datos normativos | Transparencia |
| 🟢 Normal | Texto no estándar en Nivel 1/2 | Homogeneidad |

### Cuándo re-auditar

- **Anualmente** (enero): Verificar que los datos fiscales siguen vigentes
- **Al añadir una nueva suite**: Definir su nivel por defecto
- **Tras cambio normativo relevante**: Actualizar módulos `data/fiscal/` y re-auditar apps afectadas

---

## Control de versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-03-19 | Versión inicial — arquitectura completa acordada |

---

**Documento generado en sesión de revisión global de disclaimers**
**Proyecto**: meskeIA Web (https://meskeia.com)
