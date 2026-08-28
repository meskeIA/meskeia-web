# app/delegum/ — dos gotchas de cableado

> Bajado del índice de memoria el 28/08/2026 (fase 2 de la recomposición de `MEMORY.md`): son
> detalles de código que solo importan al tocar Delegum. La estrategia del vertical (qué se migra
> y qué no) sigue en el índice. Fichas completas: `project_delegum_mcp`,
> `project_delegum_atribucion_from`.

## La URL del MCP lleva barra final

El endpoint es `meskeia.com/api/mcp/delegum/` **con barra**. Sin ella el cliente no conecta, y el
mismo detalle aplica al registrarlo en Claude Desktop. → `project_delegum_mcp`

Tool nueva **solo si el LLM hace mal la tarea sin ella**: el valor está en el dato normativo de
`data/fiscal`, no en el árbol de decisión, que la IA ya domina. El ciclo de ampliación está
cerrado.

## Atribución: `?from=delegum` y su fallback `ref_dominio`

Delegum es la **excepción** del resto de verticales. Stemum, Coquinum y Cronicum se sirven por
host-rewrite, así que la columna `host` ya los atribuye sola; las apps que Delegum enlaza viven en
`meskeia.com`, de modo que su `host` siempre dice `meskeia.com`. Sin señal explícita, su tráfico es
indistinguible del orgánico.

Dos capas, y las dos hay que respetarlas al añadir un CTA:

1. **`?from=delegum`** en los enlaces salientes (constante `FROM` en `soluciones/page.tsx`). Es
   frágil por diseño: depende de cablearlo a mano en cada enlace, y ya se olvidó una vez en las
   tres ramas primarias de `DescubreVertical`.
2. **`ref_dominio`** — fallback automático en `components/AnalyticsTracker.tsx`: si
   `document.referrer` es uno de los cinco dominios propios **y difiere del host actual**, guarda
   el hostname. Solo se captura al dump; **no** está cableado en `getNavegacion` ni tiene tile en
   el dashboard, y así se queda a propósito.

⚠️ Medido el 20/07/2026: que no aparezcan transiciones `delegum → app` **no es un bug de
instrumentación**. El cableado se verificó en producción. Es falta de tráfico. Si sigue en cero,
léelo como señal de tráfico y **no vuelvas a auditar el cableado**.

⚠️ La navegación **interna** entre apps ya no usa `?from=`, pasó al fragmento (`#from=`). Los
`?from=delegum` y `?from=meskeia` de aquí son cross-dominio y no cambian.
