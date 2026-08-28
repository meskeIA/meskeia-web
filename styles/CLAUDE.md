# styles/ — la base de impresión no vale para todo

> Bajado del índice de memoria el 28/08/2026 (fase 2 de la recomposición de `MEMORY.md`): solo
> importa al escribir una app imprimible. Ficha completa: `project_familia_imprimible`.

`impresion.module.css` es la base común de la **familia imprimible** (sopa de letras, laberintos,
cartones de bingo, fichas de cálculo, sudokus, nonogramas, crucigramas): el usuario aporta algo
suyo, un algoritmo con restricción dura lo procesa y sale un artefacto para imprimir.

**Cuándo se importa**: toda app imprimible NUEVA de esa familia, en vez de escribir su propio
`@media print` desde cero. Fija margen (10 mm de `@page` + 8 mm de relleno propio, porque
«Márgenes: Ninguno» del navegador descarta el `@page`), casilla de 9 mm y línea de 0,35 mm.

⚠️ **Cuándo NO se importa**: apps cuya impresión es **una tabla para leer** (financieras,
fiscales). Ahí interesa apretar filas; aquí, dejar sitio para escribir a mano. Aplicarla a una
tabla de lectura estropea justo lo que esa tabla necesita.

Esto no contradice la regla de «nada de capas transversales»: es **opt-in** y solo se sirve en las
rutas que la importan.

## Gotcha que costó tres iteraciones

Al imprimir, las media queries se evalúan contra el ancho de **página** (~718 px en A4 con
márgenes), así que **se activa la maquetación de móvil**. La solución es expresar las medidas como
variables CSS que la base sobrescribe con `!important` en print.

> En cambios de impresión, la validación la cierra el usuario en el navegador: Claude no ve el PDF.
> Piloto de UNA app, validar, y solo entonces extender.
