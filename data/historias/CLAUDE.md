# Template visualizador-historia/[slug]

> Salió del CLAUDE.md raíz el 11/08/2026 (`/doctor`, check 4): son 56 líneas que solo importan al tocar cronologías, y el catálogo está cerrado desde el 2026-05-09. Este fichero se carga automáticamente al trabajar bajo `data/historias/`.

Ruta dinámica para cronologías históricas. Cada historia = un archivo `data/historias/[slug].ts` + registro en `data/historias/index.ts`.

## Slugs activos

Catálogo cerrado (2026-05-09) con ~170 archivos en `data/historias/` — la lista viva está en `data/historias/index.ts`, NO mantener listas de slugs en docs. Las cronologías se sirven también en el vertical CRONICUM (`cronicum.com`, host-rewrite); una cronología nueva requiere además asignar su slug a una puerta en `data/cronicum/puertas.ts` o no aparece en el portal — lo comprueba `npm run check:verticales` desde el 2026-07-28.

## Workflow óptimo: crear múltiples historias en paralelo

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

## Reglas de UX obligatorias (NO modificar)

Verificadas con el usuario y validadas en producción (2026-05-03):

| Tab | Comportamiento correcto |
|-----|------------------------|
| **Tab 1 — Línea del Tiempo** | Clic en período = toggle de panel **inline** debajo del SVG. **Nunca** navegar a otro tab. |
| **Tab 2 — Período en Detalle** | Botones fecha en flex-wrap + tarjeta grande con header coloreado + botones `← Anterior / Siguiente →` debajo con contador. |
| **Tab 3 — Comparativa** | **Tabla HTML** con 5 columnas (Período, Rango, Categoría, Obra icónica, Ámbito) + filtros por botones de categoría + buscador arriba. |
| **Tab 4 — Contexto Histórico** | Eras apiladas en **flex-column** (una sola columna), `border-left: 4px solid` por era, badges de hitos con color de categoría. |

## Estructura de datos (HistoriaData)

- `hitos[]`: **10 períodos** con `id, nombre, anioInicio, anioFin, color, categoria, descripcion, obraIconica, paises[]`
- `eras[]`: **exactamente 6 eras** con `nombre, desde, hasta, icono, hitosDestacados[], eventos[]`
- `categorias`: mapa `id → etiqueta` (**6-8 categorías**)
- `colores`: mapa `id → color hex` — **mismas claves exactas** que `categorias`, ni una más ni una menos
- `disclaimer: 'exempt'` para historia (educativo puro)
- `educativo` v2.0 con tamaños fijos: `intro` + `tablaComparativa[6]` + `escenarios[4]` + `faq[5]` + `pasos[5]` + `tips[4]` + `errores[4]`

## Restricciones críticas (errores frecuentes)

1. **`hitosDestacados` en eras**: usar el **`nombre`** exacto del hito, no el `id`. El template busca `data.hitos.find(h => h.nombre === nombre)`.
2. **Eras continuas**: el rango `desde/hasta` de las 6 eras debe cubrir `anioInicio→anioFin` sin huecos ni solapamientos.
3. **IDs de hitos**: kebab-case sin acentos ni caracteres especiales (`'reino-antiguo'`, `'conquista-constantinopla'`).
4. **Años negativos**: `anioInicio: -3100` = 3100 a.C. El template convierte automáticamente para mostrar.
5. **Suites estándar** para apps de historia: `suites: ["cultura", "estudiantes"]`.
6. **Archivo de referencia**: `data/historias/roma.ts` — el más completo y correcto para copiar la estructura.

## appKey en app-relations.ts

El appKey sigue el patrón `visualizador-historia-[slug]` (con guión, sin slash).
