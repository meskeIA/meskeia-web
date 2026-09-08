# scripts/ — consumidores que parsean `data/` con regex

> Bajado del índice de memoria el 28/08/2026 (fase 2 de la recomposición de `MEMORY.md`): solo
> importa al tocar los scripts o los ficheros de datos que leen. Ficha completa:
> `reference_generador_posts_x` en la memoria del proyecto.

Varios consumidores leen los catálogos de `data/*.ts` **como texto, con expresiones regulares**,
no importándolos. Si cambia el formato del fichero de datos (comillas, estructura de los objetos,
nombre del `export`), el regex deja de hacer match y el consumidor se queda **con cero items y
sin dar ningún error**.

Ocurrió el 28/07/2026: el refactor de verticales convirtió `STEMUM_APP_DISCIPLINA` y
`COQUINUM_APP_CATEGORIA` en `Record` derivados, y de golpe se quedaron mudos **tres**
consumidores a la vez. Se descubrió por casualidad al abrir el generador.

**Al cambiar el formato de `stemum.ts` / `coquinum.ts` / `applications.ts` / `implemented-apps.ts`
/ `delegum/soluciones.ts` / `historias/*.ts`, repasar los cuatro:**

1. `scripts/cuadrante-stem.mjs`
2. `scripts/cuadrante-catalogo.mjs` (universo desde `implemented-apps.ts`; los verticales, por
   regex sobre `stemum.ts`, `coquinum.ts` y `delegum/soluciones.ts`). Avisa por consola del
   portal que se queda mudo, pero **no** detiene el cruce: el vertical es una columna informativa.
3. `scripts/semilla-diaria.mjs` (su universo Coquinum)
4. El **generador de posts para X**, que vive FUERA del repo:
   `C:\Users\jaceb\Mis Desarrollos\Mis Programas\generador-posts-x\servidor.js` (puerto 3005).
   Es el más fácil de olvidar precisamente porque no está aquí. Sus parsers avisan por consola
   si el número de apps reconocidas no cuadra con el de claves `slug:`, pero solo si alguien lo
   arranca y mira.
5. `scripts/generate-apps-demandadas.mjs` (08/09/2026) — saca los slugs de `applications.ts` con
   `/url:\s*"\/([^"/]+)\/"/g` para cruzarlos con el ranking de Turso. Este **sí se planta**: si
   quedan menos de 20 apps válidas aborta sin escribir, porque un `data/apps-demandadas.ts`
   vacío dejaría la portada rotando sobre el catálogo entero otra vez y en silencio.

La defensa no es el build —que no ve nada de esto— sino contar lo que sale: un parser que
devuelve 0 items donde había 133 no está «vacío», está roto.

## `data/cnae-sinonimos.json` no lo lee la app: lee su catálogo YA GENERADO

`conversor-cnae-iae` no importa `data/cnae-sinonimos.json` en tiempo de ejecución: lee
`public/datos/cnae-iae-catalogo.json`, un catálogo pre-generado que combina ese fichero con
las fuentes oficiales del BOE/INE. Editar el JSON de sinónimos y darlo por reparado sin más
deja el catálogo servido con los sinónimos VIEJOS — el build no lo detecta porque el JSON
fuente es válido y nadie lo importa desde `app/`.

**Tras tocar `data/cnae-sinonimos.json`, ejecutar `node scripts/generar-catalogos-cnae-iae.mjs`
antes de dar la reparación por buena.** Usa una caché local de las descargas oficiales (tarda
segundos, no requiere red si ya se descargó antes) y siempre reescribe el catálogo con los
sinónimos actuales, aunque imprima «Sin cambios respecto al catálogo publicado» — ese mensaje
solo habla de las fuentes OFICIALES, no de los sinónimos.

⚠️ **La fecha de verificación que se ve en pantalla NO sale del catálogo, sale de
`FISCAL_CNAE_IAE_META.verificado` en `data/fiscal/cnae-iae.ts`** — y ese sello se pone A MANO.
Regenerar ES verificar, así que tras regenerar hay que sellarlo con la fecha del día y
actualizar los tests que la comprueban literalmente (`tests/apps/conversor-cnae-iae.spec.ts`).
El generador la imprime al terminar, ya en las dos salidas.

> La página leyó `meta.generado` hasta el hallazgo 588, que lo unificó aquí porque el mismo
> catálogo mostraba dos fechas según la página (30/08 en meskeIA, 20/07 en la ficha de
> Delegum). Y hasta el 08/09/2026 el aviso del generador solo se imprimía cuando cambiaban
> las FUENTES OFICIALES: una regeneración por sinónimos —que es el caso habitual— salía por
> «sin novedades» y dejaba el sello por detrás sin decir nada.
