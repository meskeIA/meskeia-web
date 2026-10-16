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

## Medir contraste: `_contraste.ts`

**`contrasteSobreFondoReal`** compone las capas semitransparentes de los ancestros, que es lo
que hace falta para un texto sobre un tinte en oscuro. No copiar otra versión casera: hay 93, y
las que buscan el primer fondo opaco aprueban de más (un 4,42:1 pasó por bueno, cabo C0120). Las
copias se migran cuando su app pasa por el Inspector. Fondos con imagen o degradado: por píxel.

## Trampas de la emulación ya medidas

Ninguna es un defecto de la app; todas han dado rojos (o verdes) falsos. Antes de perseguir un
rojo que no se reproduce aislado, mirar si es una de estas:

- **Bajo `next dev` el modo estricto ejecuta cada efecto dos veces**: un rastreador emite dos
  avisos por carga. Contar por montaje (2 en desarrollo, 1 en producción; se distingue con
  `document.querySelector('nextjs-portal')`), como `simulador-teorema-central-limite` y
  `simulador-potencial-accion` (C0073, C0171).
- **`esperarHidratacion` vuelve antes que los `useEffect`**: lo que una app ajusta en un efecto
  (el tamaño de un lienzo, una escala) se mide con `expect.poll`, no al instante (C0216).
- **Una transición CSS** (`transition: r 0.2s`, `width…`) se mide a medias si el test lee justo
  después del cambio: `expect.poll` hasta el valor final (C0160, kmeans).
- **`context.route` no ve los WebSocket**: una página servida bajo `https://meskeia.com` saca el
  de HMR a producción y bajo `next dev` no se hidrata. Puente con `page.routeWebSocket` al
  servidor local (C0171).
- **El micrófono falso de Chromium pierde audio** con la máquina cargada (huecos de ceros): un
  hueco es un clic de banda ancha de verdad y la app hace bien en leerlo (C0113).
- **Tras un deslizamiento con `Input.dispatchTouchEvent`, el primer `tap()` no genera click**, y un
  `scrollIntoView` suave lanzado desde un botón que se pone `disabled` en el mismo clic se
  cancela (C0073).
- **Móvil emulado (`isMobile` + `hasTouch`)**: teclear en un campo con `keyboard.type`, tocar
  otro y volver a teclear deja pulsaciones sin `input` (2 de 3 en `estimador-impuesto-sucesiones`):
  sembrar el primer campo (C0091).
- **Recorrer el texto del `body`** sin excluir `script, style` cuenta el payload de React, que
  desde 99e1ee7e lleva los iconos de las relacionadas (C0175).

    npm run test:apps

Estado de qué app se ha inspeccionado y cuándo: `npm run inspector:cola -- --resumen`.
