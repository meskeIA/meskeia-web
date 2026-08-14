# Tests generados por el Inspector

Un fichero por app, `<slug>.spec.ts`, escrito por la skill `/inspector` al verificarla.

**Estos tests son el producto del Inspector, no un subproducto.** La segunda vuelta al
catálogo no la hace el Inspector: la hacen estos tests, gratis y en cada build. El
Inspector solo vuelve a una app cuando su código cambia, cuando su test se pone en rojo
o cuando nunca se ha visto.

Cada caso lleva el valor esperado **escrito literal** y un comentario de dónde sale
(calculado a mano, `data/fiscal`, o la fuente oficial). Un test que se limite a
comprobar que sale *algún* número no sirve: eso ya lo mira la Ronda cada noche.

    npm run test:apps

Estado de qué app se ha inspeccionado y cuándo: `npm run inspector:cola -- --resumen`.
