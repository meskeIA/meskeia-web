# APPS-REFLEXION.md - Herramientas de Reflexión meskeIA

> **Creado**: 2026-04-02
> **Estado**: Fase de diseño — listado de ideas pendiente de priorización
> **Origen**: Artículo "La dictadura de lo urgente" (El País, 02/04/2026) + reflexión sobre brecha de IA

---

## Concepto

Una nueva dimensión de apps meskeIA que **no calculan ni simulan**, sino que ayudan al usuario a **pensar mejor** sobre situaciones complejas de su vida profesional y personal.

### Principio fundacional

> "La IA amplifica lo que ya eres. Si piensas bien, te hace mejor. Si no, te vuelve dependiente."

Estas herramientas no dan respuestas — **hacen las preguntas correctas** para que el usuario llegue a sus propias conclusiones.

### ADN meskeIA aplicado a reflexión

Las apps de reflexión mantienen el mismo ADN que las calculadoras:

| Característica | Calculadora | App de reflexión |
|---|---|---|
| **Interactiva** | Introduces números | Respondes preguntas/checklist |
| **Resultado tangible** | Cifra, gráfico | Diagnóstico, mapa, perfil |
| **Estructura clara** | Fórmula detrás | Framework académico detrás |
| **Accionable** | "Te sale a X €" | "Tu punto ciego es Y, considera Z" |
| **Educativa** | Sección colapsable | Sección colapsable con el framework |
| **Sin registro** | ✅ | ✅ |
| **100% local** | ✅ | ✅ |

### Lo que NO son

- ❌ Artículos o posts para leer pasivamente
- ❌ Coaching genérico ("piensa en positivo")
- ❌ Tests de personalidad tipo BuzzFeed
- ❌ Contenido motivacional vacío

### Lo que SÍ son

- ✅ Herramientas interactivas con preguntas bien diseñadas
- ✅ Basadas en frameworks académicos o profesionales reconocidos
- ✅ Devuelven un resultado visual (radar, perfil, mapa)
- ✅ Sugieren acciones concretas según las respuestas
- ✅ El usuario sale sabiendo algo que no sabía al entrar

---

## Formato estándar

Cada app de reflexión sigue esta estructura:

```
1. Contexto breve (2-3 frases: qué vas a reflexionar y por qué importa)
2. Preguntas / Checklist (5-12 ítems, respuestas tipo escala o sí/no)
3. Resultado visual (radar, barra, perfil, mapa de calor)
4. Interpretación personalizada (qué significa TU resultado)
5. Acciones sugeridas (2-3 cosas concretas que puedes hacer)
6. Sección educativa (framework detrás, para quien quiera profundizar)
```

**Tiempo estimado de uso**: 3-5 minutos (deliberadamente breve — la reflexión sigue después)

### Decisiones de diseño validadas (2026-04-02)

Tras revisión de las dos primeras apps implementadas, se fijaron estas reglas para todas las apps de reflexión:

#### 1. Preguntas intercaladas (OBLIGATORIO)

Las preguntas de cada dimensión se intercalan en patrón ABABABABAB, **nunca agrupadas** (AAAAABBBBB).

```typescript
// ✅ CORRECTO — intercaladas
const PREGUNTAS = [
  { id: 1, dimension: 'A' },
  { id: 6, dimension: 'B' },
  { id: 2, dimension: 'A' },
  { id: 7, dimension: 'B' },
  // ...
];

// ❌ INCORRECTO — agrupadas por dimensión
const PREGUNTAS = [
  { id: 1, dimension: 'A' },
  { id: 2, dimension: 'A' },
  // ... todas las A, luego todas las B
];
```

**Razón**: Agrupar por dimensión permite al usuario detectar el patrón y ajustar inconscientemente sus respuestas (sesgo por agrupación).

#### 2. Sin etiquetas de dimensión durante las preguntas (OBLIGATORIO)

Las etiquetas de dimensión (ej. "⚙️ Eficiencia", "🌱 Cultura") **NO se muestran** junto a cada pregunta. Solo aparecen en la sección de resultado (barras de puntuación y mapa 2D).

```tsx
// ✅ CORRECTO — solo número de pregunta
<div className={styles.questionHeader}>
  <span className={styles.questionNumber}>{index + 1}</span>
</div>

// ❌ INCORRECTO — etiqueta de dimensión visible
<div className={styles.questionHeader}>
  <span className={styles.questionNumber}>{index + 1}</span>
  <span className={styles.dimensionTag}>⚙️ Eficiencia</span>
</div>
```

**Razón**: Ciertas dimensiones tienen connotaciones más positivas que otras (ej. "Exploración" suena más moderno que "Explotación", "Cultura" suena más deseable que "Eficiencia"). Mostrarlas sesga las respuestas.

#### 3. Líneas de umbral en el mapa 2D (OBLIGATORIO)

El mapa bidimensional incluye **líneas discontinuas** en las posiciones de los umbrales de scoring, para que el usuario vea las fronteras entre perfiles.

```
Umbral bajo (14/25) → posición 45% del eje
Umbral alto (18/25) → posición 65% del eje
```

Se añaden 4 líneas: 2 verticales (eje X) + 2 horizontales (eje Y), con estilo `dashed`, opacidad sutil (15%), y soporte dark mode.

**Razón**: Sin las líneas, el usuario ve su punto en el mapa pero no sabe a qué distancia está de cambiar de perfil. Las líneas convierten los 4 cuadrantes visuales en las 9 zonas reales del scoring.

### Patrón técnico de referencia

Las dos apps implementadas sirven como plantilla exacta:

- **Estructura TSX**: `diagnostico-explotacion-exploracion/page.tsx`
- **Estructura CSS**: `diagnostico-explotacion-exploracion/DiagnosticoExplotacionExploracion.module.css`
- **Scoring**: 2 dimensiones × 5 preguntas × escala 1-5 = 0-25 por dimensión
- **Perfiles**: 6 (4 extremos + 2 intermedios), cada uno con fortalezas/riesgos/acciones
- **Umbrales**: 18 (alto) y 14 (bajo) sobre 25

---

## Catálogo de ideas

### Categoría 1: Empresa y Management

Apps para profesionales, managers o emprendedores que quieren pensar mejor sobre cómo gestionan.

| # | App propuesta | Framework base | Pregunta que responde |
|---|---|---|---|
| 1 | **Diagnóstico explotación vs exploración** | James G. March (1991) | ¿Tu empresa/equipo está demasiado centrado en el corto plazo? |
| 2 | **Auditoría de reuniones** | Análisis de valor de tiempo | ¿Cuántas de tus reuniones podrían ser un email (y viceversa)? |
| 3 | **Mapa de decisiones urgentes vs importantes** | Matriz Eisenhower adaptada | ¿Vives apagando fuegos o construyendo futuro? |
| 4 | **Test de delegación efectiva** | Modelo Situacional (Hersey-Blanchard) | ¿Delegas bien o solo sueltas tareas? |
| 5 | **Diagnóstico de comunicación interna** | Artículo "La dictadura de lo urgente" | ¿Tu equipo comunica rápido pero sin profundidad? |
| 6 | **Checklist pre-mortem** | Gary Klein (pre-mortem analysis) | Antes de lanzar algo: ¿por qué podría fallar? |

### Categoría 2: Uso inteligente de IA

Apps para cualquier persona que quiera usar la IA como amplificador, no como muleta.

| # | App propuesta | Framework base | Pregunta que responde |
|---|---|---|---|
| 7 | **Diagnóstico de brecha IA** | Análisis propio (uso vs capacidad) | ¿Usas la IA para pensar mejor o para dejar de pensar? |
| 8 | **Evaluador de prompts** | Principios de prompt engineering | ¿Tus instrucciones a la IA son específicas o vagas? |
| 9 | **Test de dependencia tecnológica** | Escala de autonomía digital | ¿Podrías hacer tu trabajo si mañana no tuvieras IA? |
| 10 | **Mapa de automatización personal** | Análisis de tareas (rutinaria vs creativa) | ¿Qué tareas deberías automatizar y cuáles proteger? |

### Categoría 3: Carrera profesional

Apps para reflexionar sobre la dirección de tu vida laboral.

| # | App propuesta | Framework base | Pregunta que responde |
|---|---|---|---|
| 11 | **Diagnóstico de estancamiento profesional** | Modelo de flujo (Csikszentmihalyi) | ¿Estás en zona de confort, estrés o flujo? |
| 12 | **Mapa de dependencia de clientes** | Análisis de concentración de riesgo | ¿Tu negocio depende demasiado de pocos clientes? |
| 13 | **Auditoría de habilidades vs mercado** | Gap analysis profesional | ¿Lo que sabes hacer es lo que el mercado necesita? |
| 14 | **Test de síndrome del impostor** | Escala de Clance (adaptada) | ¿Subestimas tu competencia real? |

### Categoría 4: Productividad y ritmo vital

Apps para pensar sobre cómo gestionas tu tiempo y energía.

| # | App propuesta | Framework base | Pregunta que responde |
|---|---|---|---|
| 15 | **Test de ritmo vital** | Concepto "kletskassa" + cronobiología | ¿Vives en modo urgencia permanente? |
| 16 | **Auditoría de energía semanal** | Modelo de gestión de energía (Loehr/Schwartz) | ¿Dónde gastas energía sin retorno? |
| 17 | **Diagnóstico de multitarea** | Investigación sobre context-switching | ¿Tu multitarea es productiva o destructiva? |
| 18 | **Mapa de compromisos vs capacidad** | Análisis de carga realista | ¿Has dicho sí a más de lo que puedes hacer bien? |

### Categoría 5: Pensamiento crítico y decisiones

Apps para mejorar la calidad de tus decisiones.

| # | App propuesta | Framework base | Pregunta que responde |
|---|---|---|---|
| 19 | **Detector de sesgos cognitivos** | Kahneman (Sistema 1 y 2) | ¿Qué sesgos podrían estar afectando tu decisión actual? |
| 20 | **Análisis de decisión reversible vs irreversible** | Jeff Bezos (puertas tipo 1 y tipo 2) | ¿Estás dándole vueltas a algo que podrías probar sin riesgo? |
| 21 | **Test de pensamiento de grupo** | Irving Janis (groupthink) | ¿Tu equipo realmente debate o solo confirma? |
| 22 | **Checklist de segunda opinión** | Principio de adversario (red team) | Antes de decidir: ¿has buscado activamente razones para NO hacerlo? |

### Categoría 6: Emprendimiento y negocio

Apps para emprendedores que necesitan parar y pensar antes de actuar.

| # | App propuesta | Framework base | Pregunta que responde |
|---|---|---|---|
| 23 | **Diagnóstico de modelo de negocio** | Business Model Canvas (simplificado) | ¿Los 4 pilares de tu negocio están equilibrados? |
| 24 | **Test de validación de idea** | Lean Startup (Ries) | ¿Tu idea resuelve un problema real o solo te gusta a ti? |
| 25 | **Mapa de riesgo del emprendedor** | Análisis de riesgos personales | ¿Qué pasa si esto no funciona? ¿Lo has pensado? |
| 26 | **Auditoría de propuesta de valor** | Value Proposition Canvas (Osterwalder) | ¿Lo que ofreces encaja con lo que tu cliente necesita? |

---

## Integración en meskeIA

### Suites donde encajan

No necesitan suite nueva. Se distribuyen en las existentes:

| App | Suite principal | Suites secundarias |
|---|---|---|
| Explotación vs exploración | Productividad | Freelance |
| Brecha IA | Cultura General | Productividad |
| Mapa de delegación | Productividad | Freelance |
| Estancamiento profesional | Productividad | Cultura General |
| Sesgos cognitivos | Cultura General | Productividad |
| Modelo de negocio | Freelance | Finanzas |
| ... | ... | ... |

### Disclaimer

Nivel **4 INFORMATIVO** para la mayoría. Nivel **3 MEDIO** si tocan salud mental (síndrome del impostor, estrés, ansiedad).

### Diferenciación técnica

Estas apps usan `'use client'` como todas, con esta estructura de datos:

```typescript
interface Pregunta {
  id: number;
  texto: string;
  dimension: 'dimensionA' | 'dimensionB';  // Nombre específico por app
}

interface Perfil {
  nombre: string;
  emoji: string;
  descripcion: string;
  fortalezas: string[];
  riesgos: string[];
  acciones: string[];
}
```

**Estado**: `respuestas` (Record<number, number>) + `mostrarResultado` (boolean).
**Componentes obligatorios**: MeskeiaLogo, LegalNotice, EducationalSection, RelatedApps, ShareCard, Footer.

---

## Prioridad sugerida (por impacto + viabilidad)

### Implementado — Categoría 1: Empresa y Management (6/6 ✅)

| # | App | Dimensiones | Commit |
|---|-----|-------------|--------|
| 1 | Diagnóstico Explotación vs Exploración | explotacion / exploracion | 41199eb |
| 2 | Auditoría de Reuniones | eficiencia / cultura | 6ac308e |
| 3 | Mapa Decisiones Urgentes vs Importantes | vision / filtro | 6e73ea4 |
| 4 | Test de Delegación Efectiva | acompanamiento / autonomia | 2b69845 |
| 5 | Diagnóstico de Comunicación Interna | velocidad / profundidad | d2afa04 |
| 6 | Checklist Pre-Mortem | anticipacion / accion | 2bd5659 |

### Implementado — Categoría 2: Uso Inteligente de IA (4/4 ✅)

| # | App | Dimensiones | Commit |
|---|-----|-------------|--------|
| 7 | Diagnóstico de Brecha IA | criterio / aprovechamiento | 0741282 |
| 8 | Evaluador de Prompts | entrada / salida | eeae92a |
| 9 | Test de Dependencia Tecnológica | autonomia / adaptabilidad | d7113eb |
| 10 | Mapa de Automatización Personal | automatizacion / proteccion | b4c1fa1 |

### Pendiente — Categoría 3: Carrera Profesional (0/4)
11-14. Estancamiento profesional, Dependencia clientes, Habilidades vs mercado, Síndrome impostor

### Pendiente — Categoría 4: Productividad y Ritmo Vital (0/4)
15-18. Ritmo vital, Energía semanal, Multitarea, Compromisos vs capacidad

### Pendiente — Categoría 5: Pensamiento Crítico y Decisiones (0/4)
19-22. Sesgos cognitivos, Decisión reversible/irreversible, Pensamiento de grupo, Segunda opinión

### Pendiente — Categoría 6: Emprendimiento y Negocio (0/4)
23-26. Modelo de negocio, Validación de idea, Riesgo emprendedor, Propuesta de valor

---

## Métricas de éxito

¿Cómo sabemos si estas apps funcionan?

- **Tiempo de uso**: Deberían tener sesiones más largas que las calculadoras (~3-5 min vs ~1-2 min)
- **Tasa de completar**: >60% de usuarios que empiezan deberían llegar al resultado
- **Compartir**: Estas apps tienen alto potencial de compartir resultados (ShareCard)
- **Retorno**: ¿Vuelven los usuarios? (difícil de medir sin registro, pero analytics de sesión ayuda)

---

## Próximos pasos

1. ✅ Documento de criterios creado (este archivo)
2. ✅ Patrón validado con 2 apps + revisión de diseño (preguntas intercaladas, sin etiquetas, líneas umbral)
3. ✅ Categoría 1 completa: 6/6 apps de Empresa y Management
4. ✅ Categoría 2 completa: 4/4 apps de Uso Inteligente de IA
5. [ ] Categoría 3: Carrera Profesional (4 apps)
6. [ ] Categoría 4: Productividad y Ritmo Vital (4 apps)
7. [ ] Categoría 5: Pensamiento Crítico y Decisiones (4 apps)
8. [ ] Categoría 6: Emprendimiento y Negocio (4 apps)

---

**Última actualización**: 2026-04-02
**Apps implementadas**: 10/26
**Categorías completas**: 2/6
