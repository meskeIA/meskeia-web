# Tests de apps

Un fichero por app, `<slug>.spec.ts`. Dos orígenes posibles, y el encabezado de cada
fichero dice cuál es el suyo:

- **`/inspector`**, al verificar una app ya publicada (el caso más frecuente).
- **`/nueva-app-meskeia` (PASO 4.bis)**, en apps con estado interactivo (temporizadores,
  eventos de teclado, varias fases) escritas **antes del primer deploy** — aquí no hay
  cálculo que verificar contra un valor a mano, sino transiciones de estado que un clic
  manual no siempre delata (ver `teclado-barrido-switch.spec.ts` como ejemplo).

**Estos tests son el producto, no un subproducto.** La segunda vuelta al catálogo no la
hace una persona releyendo el código: la hacen estos tests, gratis y en cada build. El
Inspector solo vuelve a una app cuando su código cambia, cuando su test se pone en rojo
o cuando nunca se ha visto.

Cada caso lleva el valor esperado **escrito literal** y un comentario de dónde sale
(calculado a mano, `data/fiscal`, o la fuente oficial). Un test que se limite a
comprobar que sale *algún* número no sirve: eso ya lo mira la Ronda cada noche.

    npm run test:apps

Estado de qué app se ha inspeccionado y cuándo: `npm run inspector:cola -- --resumen`.
