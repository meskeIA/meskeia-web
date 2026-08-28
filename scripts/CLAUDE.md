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

**Al cambiar el formato de `stemum.ts` / `coquinum.ts` / `applications.ts` / `historias/*.ts`,
repasar los tres:**

1. `scripts/cuadrante-stem.mjs`
2. `scripts/semilla-diaria.mjs` (su universo Coquinum)
3. El **generador de posts para X**, que vive FUERA del repo:
   `C:\Users\jaceb\Mis Desarrollos\Mis Programas\generador-posts-x\servidor.js` (puerto 3005).
   Es el más fácil de olvidar precisamente porque no está aquí. Sus parsers avisan por consola
   si el número de apps reconocidas no cuadra con el de claves `slug:`, pero solo si alguien lo
   arranca y mira.

La defensa no es el build —que no ve nada de esto— sino contar lo que sale: un parser que
devuelve 0 items donde había 133 no está «vacío», está roto.
