# data/ — registros del catálogo

> Bajado del índice de memoria el 28/08/2026 (fase 2 de la recomposición de `MEMORY.md`): son
> avisos que solo importan al tocar `data/`, y en el índice ocupaban sitio todos los días.
> Este fichero se carga automáticamente al trabajar bajo `data/`. Fichas completas en la
> memoria del proyecto: `project_stemum`, `reference_generador_posts_x`.

## Una app puede estar registrada en TRES capas distintas

Ninguna implica a las otras, y buscar solo en una da falsos huérfanos:

| Capa | Ficheros | Qué declara |
|---|---|---|
| **1 · Catálogo** | `applications.ts` · `implemented-apps.ts` · `app-relations.ts` | Que la app existe en meskeIA |
| **2 · Portal vertical** | `stemum.ts` (`STEMUM_APPS`) · `coquinum.ts` (`COQUINUM_APPS`) · `cronicum/puertas.ts` | Que se sirve bajo su dominio propio |
| **3 · Material de apoyo** | `stemum.ts` (`STEMUM_MATERIAL_APOYO`) | Las tablas de consulta, que NO son simuladores |

⚠️ **Grepear `data/` ENTERO antes de concluir que una app está descolgada.** Mirar solo
`applications.ts`, o solo la lista del portal, hace parecer huérfana una app que sí se sirve
desde otra capa — y lo que sigue a esa conclusión suele ser retirarla.

`npm run check:verticales` (lo ejecuta el build) cubre las capas 1 y 2 y rompe si algo queda
descolgado. La capa 3 no la puede cubrir: comprueba lo declarado, y no puede echar de menos
una tabla que nadie declaró.

## Cambiar el FORMATO de estos ficheros rompe cosas fuera del build

`stemum.ts`, `coquinum.ts`, `applications.ts`, `implemented-apps.ts` y `historias/*.ts` los
parsean **con regex** consumidores que el build no ve, y que se quedan a cero **sin avisar**.
Ya pasó el 28/07/2026. Antes de cambiar comillas, estructura de los objetos o nombres de
export, leer `scripts/CLAUDE.md`.

## Datos normativos

Antes de escribir a mano un tipo, coeficiente, tramo o plazo legal, mirar si ya está en
`data/fiscal/` — la regla completa, con el porqué, está en el `CLAUDE.md` de la raíz.
