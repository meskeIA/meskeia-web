# app/api/analytics/ — leer antes de tocar nada de Analytics

> Bajado del índice de memoria el 28/08/2026 (fase 2 de la recomposición de `MEMORY.md`): siete
> entradas que solo importan al tocar Analytics y que ocupaban sitio en el índice todos los días.
> Este fichero se carga automáticamente al trabajar bajo `app/api/analytics/`. Las fichas
> completas siguen en la memoria del proyecto y se citan en cada apartado.

## Qué es Analytics aquí (definición aprobada el 20/08/2026)

El **registro propio del después-del-clic**: quién nos usa de verdad separando cada especie de
tráfico, si algo se ha roto, y si las apuestas estratégicas se materializan. La métrica norte es
**amplitud del catálogo activo + adquisición orgánica + presencia en canal IA**. La frecuencia
individual es inmedible por diseño RGPD, y la palanca de retención está refutada por los propios
datos: no la persigas. → `project_analytics_dashboard_revision`

**Regla «ventana o fuera»** para auditar cualquier vista nueva:
1. Toda métrica de lectura periódica va en **ventana** (30d + Δ7d). El total histórico solo como
   hito: con ~250 días de serie, un acumulado converge y deja de moverse.
2. Cada vista debe poder decir **qué decisión alimenta**. «Forense ocasional» se declara como tal;
   «ninguna» → fuera.

Umbral canónico, alineado con el digest: **app activa = ≥5 usos/30d** (⚠️ 1-4 · 💤 0).

## Al consultar la base

- **`modo <> 'bot'` SIEMPRE.** El rollup ya lo excluye; una consulta a mano, no.
- **`uso_aplicaciones.timestamp` es TEXT en formato español** (`31/05/2026, 23:34:51`): `MIN`/`MAX`
  lo ordenan alfabéticamente y devuelven un rango falso. Usar `created_at` (ISO).
- **El foso IA se cuenta por lista BLANCA**, nunca por descarte. → `project_analytics_bots_duracion`
- ⚠️ **La IP de una fila `mcp` es de Vercel**, no del usuario: no sirve para geografía ni para
  distinguir personas.
- ⚠️ **`LIKE '%Linux%'` pilla Android.** Filtrar sistemas de escritorio así infla el escritorio.
- **`IA · lectura` mide CITABILIDAD, no visitas.**
- **Identificar a alguien es por HUELLA (UA + resolución + IP), nunca por IP sola.** Una IP puede
  ser una clase entera o un CGNAT. → `project_grafo_covisita`

## Especies de tráfico que NO son visita (y es deliberado)

- **NotebookLM / `IA · lectura`**: hay una persona detrás (correlación r=0,82 con el tráfico), pero
  no es una visita. **Queda fuera del pulso y fuera del foso a propósito.** No lo sumes «para que
  cuadre». → `project_ia_lectura_notebooklm`
- **Referrer sin `from`**: inatribuible **por decisión RGPD**, no por un fallo. Una sesión sin
  origen NO se investiga. → `reference_analytics_referrer_no_capturado`
- **`pag:error`**: sí hay una persona, pero es alguien que **se quedó sin la herramienta**, no
  alguien que la usó. Fuera del pulso, como el resto de `pag:`. Su lectura no es el total del día
  —el ruido de fondo son 2-3 caídas, ~7,6 por cada 1.000 visitas— sino la **concentración** en una
  misma ruta o un mismo mensaje, que es lo que distingue un bug de la red del visitante. Lo vigila
  la sección `E` del digest diario; `ChunkLoadError` no es bug propio.

## Cortes de instrumentación conocidos (un escalón en la serie que NO es el producto)

- **`pag:` — 20/08/2026** (commit `3d5226ed`): siete páginas emitían el mismo `appName`, `meskeIA`,
  incluida `app/error.tsx`. Cada página de error se contaba como visita. Si *Apps activas* da un
  escalón o `meskeIA` desaparece del top, **es esto**. → `project_corte_identificador_pag_analytics`
- **`pag:error` — el identificador NACIÓ ese mismo día.** ⚠️ Cualquier cero anterior al 20/08/2026
  es **ceguera del instrumento, no ausencia de errores**: antes las caídas se contabilizaban como
  visitas normales. El 28/08 se investigó un supuesto brote «desde el 21/08» que no existía como
  tal — sencillamente era el primer día en que se veían. Antes de leer una serie de `pag:error`,
  comprobar que empieza después de esa fecha.
- **`datos_adicionales` de `pag:error` — 28/08/2026** (commit `77ee868e`): desde entonces lleva
  `ruta`, `nombre`, `msg` y `digest`. Las filas anteriores lo tienen a `null` y **no son
  diagnosticables a posteriori**: no se sabe ni qué página cayó. El digest diario las cuenta aparte
  y lo dice.
- **`home-search` — 07/08/2026** (commit `ebeb3aa1`): la home no se medía. Afecta al share de
  RelatedApps, no al absoluto.

## Al tocar el dashboard o el rollup

- **Leer los ABSOLUTOS: el share engaña.** Un porcentaje cae cuando crece su denominador, que suele
  ser justo el objetivo estratégico. → `project_dashboard_navegacion`
- El dashboard está **protegido**: `ANALYTICS_SECRET` vive en Vercel.
  → `project_dashboard_analytics_protegido`
- Tras tocar el rollup, verificar con **`rollup-verify` + `dashboard-smoke`**, no con el build.
  → `project_analytics_optimizacion`

## Al cruzar con GSC o Bing

Las ventanas no coinciden (Analytics 30d Madrid · GSC 28d con ~3d de retardo · Bing ~6 meses
móviles) y **el ratio entre fuentes no cabe en el digest**: solo tendencias, nunca valores
absolutos comparados. → `reference_ventanas_gsc_bing_ratio`
