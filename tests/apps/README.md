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

## Antes de tocar un control: `_hidratacion.ts`

`page.goto()` no espera a que React haya ejecutado los chunks, solo a que se descarguen. En esa
ventana el DOM ya obedece y el estado de React no, así que una siembra perdida deja la página
descuadrada consigo misma y **el test pasa en verde midiendo otro escenario**. Por eso:

- Mover un `<input type="range">` → **`sembrarValor`** (o `sembrarValorAcotado` cuando el
  control capa el valor y el caso consiste justo en observar el recorte).
- Después de un `fill()` → **`esperarValorEnReact`**.
- Antes del primer clic de la página → **`esperarHidratacion`** con un input cualquiera de
  testigo; un clic anterior a la hidratación también se pierde.

Sembrar a mano con el setter nativo **rompe el build** (`npm run check:hidratacion`). Y hay un
fallo que ningún testigo ve: sembrar el valor que el input YA tiene. Para encontrarlos,
`SIEMBRA_ESTRICTA=1 npx playwright test tests/apps`; cada línea «SIEMBRA INÚTIL» es un caso que
hay que hacer partir de otro estado.

    npm run test:apps

Estado de qué app se ha inspeccionado y cuándo: `npm run inspector:cola -- --resumen`.
