import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Inspector — simulador-arboles-bst-avl (segmento cálculo, riesgo 3, 262 usos reales el
 * 25/08/2026 · 653 en la segunda inspección, 27/09/2026)
 *
 * ⚠️ ACTUALIZACIÓN 27/09/2026 — el cálculo ya NO vive en `page.tsx`: el 15/09/2026 se movió
 * (corte y pega) a `app/simulador-arboles-bst-avl/motor.ts`, que comparten el panel y los
 * «Casos para clase» (`casos.ts`, con su propio spec `simulador-arboles-bst-avl-casos.spec.ts`).
 * Las funciones y los convenios que se describen abajo son los mismos, solo cambió el fichero.
 * Los cinco hallazgos del 25/08/2026 (318-322) están REPARADOS y sus tests de regresión pasan;
 * la segunda inspección añade los suyos al final de este fichero.
 *
 * Primera inspección: 25/08/2026. El <h1> promete «Simulador de Árboles BST y AVL» y el
 * subtítulo «Inserta, elimina y busca nodos. Compara un árbol binario de búsqueda simple con
 * un AVL auto-balanceado y observa las rotaciones LL, RR, LR y RL paso a paso». La metadata
 * añade «los 4 recorridos (inorden, preorden, postorden, niveles)» y el JSON-LD lista entre
 * sus rasgos «Factor de balance visible en cada nodo (AVL)» y «Rotaciones LL, RR, LR, RL paso
 * a paso». Aquí la verdad es matemáticamente exacta y está en cualquier libro de algoritmos
 * (Adelson-Velsky y Landis, 1962; Knuth TAOCP vol. 3 §6.2.3), así que se trata como app
 * verificable: el árbol se dibuja a mano ANTES de abrir el navegador.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-arboles-bst-avl/page.tsx (no hay motor separado)
 *   · altura() / actualizarAltura()  → altura contada en NODOS: hoja = 1, árbol vacío = 0
 *   · factorBalance(n)               → altura(izq) − altura(der)
 *   · rotarDerecha(y) / rotarIzquierda(x) → rotaciones simples, devuelven la nueva subraíz
 *   · insertarBST()                  → inserción sin rebalanceo (modo BST)
 *   · insertarAVLConLog()            → inserción + los 4 casos, decididos comparando el valor
 *                                      insertado con el del hijo (LL: fb>1 y v<izq.valor ·
 *                                      RR: fb<−1 y v>der.valor · LR: fb>1 y v>izq.valor ·
 *                                      RL: fb<−1 y v<der.valor). Duplicado ⇒ return nodo
 *   · eliminarBST() / eliminarAVLConLog() → nodo con dos hijos ⇒ SUCESOR inorden (minNodo del
 *                                      subárbol derecho); en AVL rebalancearAVL() al subir
 *   · rebalancearAVL()               → tras borrado decide por el fb del HIJO, no por el valor
 *   · inorden/preorden/postorden/bfs → los cuatro recorridos del panel
 *   · calcularPosiciones()           → x = índice inorden · 50 + 30 · y = profundidad · 70 + 30
 *                                      (de ahí se lee la PROFUNDIDAD de cada nodo en el SVG)
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — las CUATRO rotaciones AVL, una por secuencia. Las cuatro terminan en el
 *   mismo árbol 20(10, 30) con altura 2 y los tres factores de balance a 0; lo que cambia es
 *   el camino y el nombre de la rotación. Ejemplo clásico de manual:
 *
 *     RR · insertar 10, 20, 30
 *       10 → 10.der = 20 → al insertar 30, altura(10) = 3 y fb(10) = 0 − 2 = −2, con 30 > 20
 *       ⇒ RR sobre el nodo 10 ⇒ rotarIzquierda(10) ⇒ 20(10, 30)
 *     LL · insertar 30, 20, 10
 *       30 → 30.izq = 20 → al insertar 10, fb(30) = 2 − 0 = +2, con 10 < 20
 *       ⇒ LL sobre el nodo 30 ⇒ rotarDerecha(30) ⇒ 20(10, 30)
 *     LR · insertar 30, 10, 20
 *       30.izq = 10, 10.der = 20 ⇒ fb(30) = +2 pero 20 > 10 (zig-zag)
 *       ⇒ LR sobre el nodo 30: rotarIzquierda(10) y después rotarDerecha(30) ⇒ 20(10, 30)
 *     RL · insertar 10, 30, 20
 *       10.der = 30, 30.izq = 20 ⇒ fb(10) = −2 pero 20 < 30 (zig-zag)
 *       ⇒ RL sobre el nodo 10: rotarDerecha(30) y después rotarIzquierda(10) ⇒ 20(10, 30)
 *
 *     Árbol final de las cuatro, dibujado:      20        raíz 20 (prof. 0, fb 0)
 *                                              /  \       hijos 10 y 30 (prof. 1, fb 0)
 *                                            10    30     nodos 3 · altura 2
 *       inorden   10, 20, 30      preorden  20, 10, 30
 *       postorden 10, 30, 20      niveles   20, 10, 30
 *
 *   CASO 2 (límite) — 1, 2, 3, 4, 5, 6, 7 en orden estrictamente creciente. Es EL contraste
 *   que la app promete enseñar, así que se verifican los DOS modos:
 *
 *     BST: cada valor entra siempre a la derecha ⇒ lista enlazada de 7 niveles
 *       1→2→3→4→5→6→7 · nodos 7 · ALTURA 7 · profundidad del 7 = 6
 *       inorden 1..7 · preorden 1..7 (idénticos: no hay ningún hijo izquierdo)
 *       postorden 7, 6, 5, 4, 3, 2, 1 · niveles 1..7
 *
 *     AVL: cuatro rotaciones RR encadenadas, todas del mismo tipo por ser inserción creciente
 *       ins 3 ⇒ RR en 1 ⇒ 2(1,3)
 *       ins 5 ⇒ RR en 3 ⇒ 2(1, 4(3,5))
 *       ins 6 ⇒ RR en 2 ⇒ 4( 2(1,3), 5(_,6) )
 *       ins 7 ⇒ RR en 5 ⇒ 4( 2(1,3), 6(5,7) )
 *
 *                        4          RAÍZ 4 · nodos 7 · ALTURA 3
 *                      /   \        todos los factores de balance = 0
 *                    2       6      1, 3, 5 y 7 son hojas (prof. 2)
 *                   / \     / \
 *                  1   3   5   7
 *       inorden   1, 2, 3, 4, 5, 6, 7      preorden  4, 2, 1, 3, 6, 5, 7
 *       postorden 1, 3, 2, 5, 7, 6, 4      niveles   4, 2, 6, 1, 3, 5, 7
 *       (el postorden es el recorrido donde un fallo pasa desapercibido: el 4 va el ÚLTIMO)
 *
 *   CASO 3 (rechazo) — duplicado, borrado en árbol vacío y borrado de un nodo con DOS hijos
 *
 *     a) Borrar 5 de un árbol vacío: no debe romper nada, solo avisar.
 *     b) Preset «Árbol balanceado» 50, 30, 70, 20, 40, 60, 80 ⇒ 0 rotaciones (ya equilibrado):
 *              50 · nodos 7 · altura 3 · inorden 20, 30, 40, 50, 60, 70, 80
 *            /    \
 *          30      70
 *         /  \    /  \
 *       20   40  60   80
 *     c) Insertar 40 otra vez ⇒ RECHAZADO (el árbol no cambia: sigue con 7 nodos).
 *     d) Eliminar 30 (dos hijos): sucesor inorden = minNodo(subárbol derecho de 30) = 40, así
 *        que 30 se sustituye por 40 y se borra el 40 original.
 *              50            nodos 6 · altura 3 · fb(40) = 1 − 0 = +1 (dentro de {−1,0,+1})
 *            /    \          inorden 20, 40, 50, 60, 70, 80
 *          40      70        preorden 50, 40, 20, 70, 60, 80
 *         /       /  \       postorden 20, 40, 60, 80, 70, 50
 *       20      60    80     0 rotaciones: fb(50) = 2 − 2 = 0
 *     e) Eliminar 20 ⇒ 50( 40, 70(60,80) ), fb(50) = 1 − 2 = −1, aún sin rotar.
 *     f) Eliminar 40 ⇒ fb(50) = 0 − 2 = −2 y fb(70) = 0 ⇒ RR en 50 TRAS BORRADO (rebalanceo
 *        en el borrado, que es el error clásico de omitir):
 *              70            nodos 4 · altura 3 · inorden 50, 60, 70, 80
 *            /    \          preorden 70, 50, 60, 80 · postorden 60, 50, 80, 70
 *          50      80        fb: 70 = +1 · 50 = −1 · 60 = 0 · 80 = 0
 *            \
 *             60
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * VEREDICTO DEL CÁLCULO: correcto. Las cuatro rotaciones, los cuatro recorridos, el contador
 * de nodos, la altura, el sucesor inorden y el rebalanceo en cascada tras el borrado salen
 * exactamente como en el papel, y el invariante |fb| ≤ 1 se sostiene sobre 45 inserciones y
 * 20 borrados aleatorios. Lo que sigue son hallazgos de operativa y de contenido.
 *
 * HALLAZGOS del 25/08/2026 — los cinco REPARADOS ese mismo día (se escribieron con
 * `test.fail()` y la marca se quitó al repararlos: hoy son red de regresión). El 27/09/2026 se
 * verificaron de nuevo en navegador y aguantan, con UNA salvedad en el [3]: el SVG ya no se
 * encoge, pero el centrado del contenedor deja la parte IZQUIERDA del árbol fuera del alcance
 * del desplazamiento (hallazgo nuevo [N1], al final). Y el [1] y el [5] dejaron restos en
 * controles y textos que la reparación no tocó ([N3] y [N6]).
 *
 *   [1] operativa/medio — El campo vacío se lee como CERO y muta el árbol sin avisar. Los dos
 *       botones guardan con `if (!Number.isNaN(Number(valor)))`, y `Number('')` es 0, no NaN.
 *       Consecuencias: clic en «Insertar» con el campo vacío ⇒ «Insertado 0» y aparece el nodo
 *       0; clic en «Eliminar» con el campo vacío sobre el árbol 0, 5, 10 ⇒ «Eliminado 0» y el
 *       nodo desaparece. Un <input type="number"> deja el value en '' con cualquier texto
 *       («abc»), así que basta teclear mal para insertar un 0 que nadie pidió.
 *
 *   [2] operativa/bajo — El rango −999..9999 de handleInsertar solo lo aplica el botón
 *       «Insertar». «Insertar varios» no pasa por esa validación: 12345 es rechazado por uno y
 *       aceptado por el otro en la misma pantalla.
 *
 *   [3] operativa/bajo — El SVG se ENCOGE en vez de desplazarse. El contenedor declara
 *       `overflow-x: auto`, pero `.arbolSvg { max-width: 100% }` lo anula: con 45 nodos el
 *       viewBox de 2.310 px se escala a ~990 px y la etiqueta del nodo baja de 14 px a 8 px
 *       (≈2 px en un móvil de 375 px). Los presets (≤ 7 nodos) y «Aleatorios (10)» no lo
 *       tocan; lo destapa el textarea «Insertar varios», que no tiene tope.
 *
 *   [4] contenido/bajo — El bloque educativo dice «árboles equilibrados (B-Tree, derivado de
 *       AVL)». El B-tree (Bayer y McCreight, 1972) no deriva del AVL (1962): es una
 *       generalización multivía pensada para bloques de disco, no un descendiente suyo.
 *
 *   [5] contenido/bajo — «rotaciones AVL animadas paso a paso» (OpenGraph) y «Inserción,
 *       borrado y búsqueda animadas» (JSON-LD) prometen de más: la inserción y el borrado se
 *       aplican de golpe y el deslizador de velocidad solo gobierna la BÚSQUEDA y el destello
 *       del nodo nuevo. El «paso a paso» que sí se entrega es textual: el historial numerado
 *       de rotaciones. REPARADO: desde el 27/09/2026 tiene su test de regresión sobre el
 *       OpenGraph y el WebApplication del JSON-LD servidos ([5] más abajo); el resto que quedó
 *       en la FAQ del JSON-LD es el [N6].
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-arboles-bst-avl/';

/** El mensaje «Última operación: …». La app es la única que monta un role="status". */
const mensaje = (page: Page) => page.locator('div[role="status"]');

/** Valor de una tarjeta de información, buscado por su etiqueta exacta. */
const infoDe = (page: Page, etiqueta: string) =>
  page.locator(`xpath=//span[normalize-space(.)='${etiqueta}']/following-sibling::span[1]`);

/** La lista de un recorrido, buscada por el nombre de su tarjeta. */
const recorrido = (page: Page, nombre: string) =>
  page.locator(`xpath=//div[normalize-space(.)='${nombre}']/following-sibling::div[2]`);

/** Las entradas del historial de rotaciones AVL, en orden. */
const historialRotaciones = (page: Page) =>
  page.locator('xpath=//div[contains(text(), "Historial de rotaciones AVL")]/following-sibling::ul/li');

const botonExacto = (page: Page, nombre: string) =>
  page.getByRole('button', { name: nombre, exact: true });

/**
 * Estructura del árbol leída del SVG: valor, factor de balance y PROFUNDIDAD, que se deduce
 * de la coordenada y (y = profundidad · 70 + 30 en calcularPosiciones).
 */
async function arbolDelSvg(page: Page) {
  return page.evaluate(() => {
    const svg = document.querySelector('svg[role="img"]');
    if (!svg) return [];
    return [...svg.querySelectorAll('g')].map((g) => {
      const textos = [...g.querySelectorAll('text')].map((t) => (t.textContent ?? '').trim());
      const circulo = g.querySelector('circle');
      const cy = circulo ? Number(circulo.getAttribute('cy')) : 0;
      return {
        valor: Number(textos[0]),
        factor: textos[1] === undefined ? null : Number(textos[1].replace('+', '')),
        profundidad: (cy - 30) / 70,
      };
    });
  });
}

/** Vacía el árbol y carga una secuencia por el textarea «Insertar varios». */
async function cargarSecuencia(page: Page, secuencia: string) {
  await botonExacto(page, 'Limpiar todo').click();
  await page.locator('#multi-input').fill(secuencia);
  await botonExacto(page, 'Insertar varios').click();
}

/** Los campos que el test toca. Hasta que React no monta su rastreador, un fill() se pierde. */
const CAMPOS = ['#ins-input', '#del-input', '#search-input', '#multi-input', '#casos-respuesta'] as const;

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Simulador de Árboles BST y AVL');
  // El <h1> llega en el HTML servido: no dice que la página responda. Esto sí (27/09/2026).
  await esperarHidratacion(page, CAMPOS);
});

test('la app promete lo que este fichero verifica', async ({ page }) => {
  // El subtítulo nombra las cuatro rotaciones y el contraste BST/AVL.
  await expect(page.getByText(/observa las rotaciones LL, RR, LR y RL paso a paso/)).toBeVisible();

  // Los dos modos, como conmutadores con aria-pressed (AVL es el de partida).
  await expect(page.getByRole('button', { name: /^BST/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: /^AVL/ })).toHaveAttribute('aria-pressed', 'true');

  // Los cuatro recorridos que promete la metadata, cada uno con su tarjeta.
  for (const nombre of ['INORDEN (LNR)', 'PREORDEN (NLR)', 'POSTORDEN (LRN)', 'POR NIVELES (BFS)']) {
    await expect(recorrido(page, nombre)).toHaveText('—'); // árbol vacío al entrar
  }

  // Los tres contadores y el árbol vacío de partida.
  await expect(infoDe(page, 'Número de nodos')).toHaveText('0');
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('0');
  await expect(page.getByText('El árbol está vacío. Inserta valores para comenzar.')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 1 — las cuatro rotaciones AVL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Las cuatro secuencias del manual. Cada una dispara UNA rotación distinta y las cuatro
 * terminan en el mismo árbol 20(10, 30): eso es justo lo que hace el caso discriminante,
 * porque el árbol final no distingue los casos pero el NOMBRE de la rotación sí.
 */
const ROTACIONES = [
  { tipo: 'RR', secuencia: '10, 20, 30', entrada: 'Rotación RR en nodo 10 (insertando 30)' },
  { tipo: 'LL', secuencia: '30, 20, 10', entrada: 'Rotación LL en nodo 30 (insertando 10)' },
  { tipo: 'LR', secuencia: '30, 10, 20', entrada: 'Rotación LR en nodo 30 (insertando 20)' },
  { tipo: 'RL', secuencia: '10, 30, 20', entrada: 'Rotación RL en nodo 10 (insertando 20)' },
] as const;

for (const caso of ROTACIONES) {
  test(`CASO 1 · rotación ${caso.tipo}: insertar ${caso.secuencia} deja 20(10, 30)`, async ({
    page,
  }) => {
    await cargarSecuencia(page, caso.secuencia);

    await expect(mensaje(page)).toContainText('Insertados 3 de 3 valores. Rotaciones aplicadas: 1.');

    // Una sola rotación, y del tipo que toca (dibujado en la cabecera de este fichero).
    await expect(page.getByText('Historial de rotaciones AVL (1)')).toBeVisible();
    await expect(historialRotaciones(page)).toHaveCount(1);
    await expect(historialRotaciones(page)).toContainText(caso.entrada);

    // El árbol resultante: raíz 20, hijos 10 y 30, altura 2, 3 nodos.
    await expect(infoDe(page, 'Número de nodos')).toHaveText('3');
    await expect(infoDe(page, 'Altura del árbol')).toHaveText('2');

    // Los cuatro recorridos, calculados a mano sobre 20(10, 30).
    await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('10, 20, 30');
    await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('20, 10, 30');
    await expect(recorrido(page, 'POSTORDEN (LRN)')).toHaveText('10, 30, 20');
    await expect(recorrido(page, 'POR NIVELES (BFS)')).toHaveText('20, 10, 30');

    // Y la forma real del dibujo: quién es la raíz y qué factor lleva cada nodo.
    const arbol = await arbolDelSvg(page);
    expect(arbol).toHaveLength(3);
    expect(arbol.find((n) => n.profundidad === 0)?.valor).toBe(20);
    expect(arbol.filter((n) => n.profundidad === 1).map((n) => n.valor).sort((a, b) => a - b)).toEqual([10, 30]);
    for (const nodo of arbol) expect(nodo.factor).toBe(0);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO 2 — 1..7 en orden creciente: BST degenera, AVL se equilibra
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 2 · BST con 1..7 degenera en lista enlazada de altura 7', async ({ page }) => {
  await page.getByRole('button', { name: /^BST/ }).click();
  await page.getByRole('button', { name: /Inserción ordenada/ }).click();

  await expect(infoDe(page, 'Tipo')).toHaveText('BST');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('7');
  // ALTURA 7: un nodo por nivel, porque cada valor entra siempre a la derecha.
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('7');

  // Sin hijos izquierdos, inorden y preorden coinciden; el postorden sale al revés.
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('1, 2, 3, 4, 5, 6, 7');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('1, 2, 3, 4, 5, 6, 7');
  await expect(recorrido(page, 'POSTORDEN (LRN)')).toHaveText('7, 6, 5, 4, 3, 2, 1');
  await expect(recorrido(page, 'POR NIVELES (BFS)')).toHaveText('1, 2, 3, 4, 5, 6, 7');

  // El dibujo lo confirma: el nodo k está a profundidad k−1, uno por nivel.
  const arbol = await arbolDelSvg(page);
  expect(arbol.map((n) => [n.valor, n.profundidad])).toEqual([
    [1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6],
  ]);
  // En modo BST no se pinta factor de balance (solo lo promete el JSON-LD para AVL).
  for (const nodo of arbol) expect(nodo.factor).toBeNull();
});

test('CASO 2 · AVL con 1..7 queda equilibrado: raíz 4, altura 3, cuatro rotaciones RR', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Inserción ordenada/ }).click(); // AVL es el modo de partida

  await expect(infoDe(page, 'Tipo')).toHaveText('AVL');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('7');
  // ALTURA 3 frente a la 7 del BST: es el contraste que la app promete enseñar.
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('3');
  await expect(mensaje(page)).toContainText('Rotaciones: 4.');

  // Las cuatro rotaciones son RR y en este orden exacto (dibujadas en la cabecera).
  await expect(historialRotaciones(page)).toHaveCount(4);
  await expect(historialRotaciones(page).nth(0)).toContainText('Rotación RR en nodo 1 (insertando 3)');
  await expect(historialRotaciones(page).nth(1)).toContainText('Rotación RR en nodo 3 (insertando 5)');
  await expect(historialRotaciones(page).nth(2)).toContainText('Rotación RR en nodo 2 (insertando 6)');
  await expect(historialRotaciones(page).nth(3)).toContainText('Rotación RR en nodo 5 (insertando 7)');

  // Los cuatro recorridos del árbol perfecto 4( 2(1,3), 6(5,7) ).
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('1, 2, 3, 4, 5, 6, 7');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('4, 2, 1, 3, 6, 5, 7');
  await expect(recorrido(page, 'POSTORDEN (LRN)')).toHaveText('1, 3, 2, 5, 7, 6, 4');
  await expect(recorrido(page, 'POR NIVELES (BFS)')).toHaveText('4, 2, 6, 1, 3, 5, 7');

  // Raíz 4, dos niveles por debajo, y TODOS los factores de balance a 0.
  const arbol = await arbolDelSvg(page);
  expect(arbol.find((n) => n.profundidad === 0)?.valor).toBe(4);
  expect(arbol.filter((n) => n.profundidad === 1).map((n) => n.valor).sort((a, b) => a - b)).toEqual([2, 6]);
  expect(arbol.filter((n) => n.profundidad === 2).map((n) => n.valor).sort((a, b) => a - b)).toEqual([1, 3, 5, 7]);
  for (const nodo of arbol) expect(nodo.factor).toBe(0);
});

test('CASO 2 · conmutar de BST degenerado a AVL reconstruye el mismo árbol de altura 3', async ({
  page,
}) => {
  await page.getByRole('button', { name: /^BST/ }).click();
  await page.getByRole('button', { name: /Inserción ordenada/ }).click();
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('7');

  await page.getByRole('button', { name: /^AVL/ }).click();

  await expect(mensaje(page)).toContainText('Árbol reconstruido y equilibrado con 4 rotación(es).');
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('3');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('7');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('4, 2, 1, 3, 6, 5, 7');
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 3 — duplicado, borrado en vacío y borrado de un nodo con dos hijos
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 3 · borrar de un árbol vacío avisa y no rompe nada', async ({ page }) => {
  await page.locator('#del-input').fill('5');
  await botonExacto(page, 'Eliminar').click();

  await expect(mensaje(page)).toContainText('El valor 5 no está en el árbol.');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('0');
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('0');
  await expect(page.getByText('El árbol está vacío. Inserta valores para comenzar.')).toBeVisible();

  // Y buscar en el vacío tampoco debe inventarse un recorrido.
  await page.locator('#search-input').fill('5');
  await botonExacto(page, 'Buscar').click();
  await expect(mensaje(page)).toContainText('Árbol vacío.');
});

test('CASO 3 · el duplicado se rechaza y el árbol no cambia', async ({ page }) => {
  await page.getByRole('button', { name: /Árbol balanceado/ }).click();
  await expect(infoDe(page, 'Número de nodos')).toHaveText('7');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('20, 30, 40, 50, 60, 70, 80');

  await page.locator('#ins-input').fill('40');
  await botonExacto(page, 'Insertar').click();

  await expect(mensaje(page)).toContainText('El valor 40 ya está en el árbol (no se permiten duplicados).');
  // Ni se duplica ni se pierde: los mismos 7 nodos y el mismo inorden ordenado ascendente.
  await expect(infoDe(page, 'Número de nodos')).toHaveText('7');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('20, 30, 40, 50, 60, 70, 80');
});

test('CASO 3 · borrar un nodo con dos hijos lo sustituye por el sucesor inorden', async ({ page }) => {
  await page.getByRole('button', { name: /Árbol balanceado/ }).click();
  // El preset ya está equilibrado: cero rotaciones al cargarlo.
  await expect(mensaje(page)).toContainText('Rotaciones: 0.');

  // Eliminar 30, que tiene dos hijos (20 y 40). Sucesor inorden = 40.
  await page.locator('#del-input').fill('30');
  await botonExacto(page, 'Eliminar').click();

  await expect(mensaje(page)).toContainText('Eliminado 30.');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('6');
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('3');
  // 40 ha ocupado el sitio de 30; el 40 original ha desaparecido (no está dos veces).
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('20, 40, 50, 60, 70, 80');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('50, 40, 20, 70, 60, 80');
  await expect(recorrido(page, 'POSTORDEN (LRN)')).toHaveText('20, 40, 60, 80, 70, 50');
  await expect(recorrido(page, 'POR NIVELES (BFS)')).toHaveText('50, 40, 70, 20, 60, 80');

  const arbol = await arbolDelSvg(page);
  expect(arbol.find((n) => n.valor === 50)?.profundidad).toBe(0);
  expect(arbol.find((n) => n.valor === 40)?.factor).toBe(1); // hijo izquierdo 20, ninguno derecho
  for (const nodo of arbol) expect(Math.abs(nodo.factor ?? 0)).toBeLessThanOrEqual(1);
});

test('CASO 3 · el borrado también rebalancea: eliminar 40 fuerza una RR sobre el 50', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Árbol balanceado/ }).click();
  for (const valor of ['30', '20', '40']) {
    await page.locator('#del-input').fill(valor);
    await botonExacto(page, 'Eliminar').click();
  }

  // fb(50) = 0 − 2 = −2 con fb(70) = 0 ⇒ rotación simple izquierda sobre el 50.
  await expect(mensaje(page)).toContainText('Eliminado 40. Se aplicaron 1 rotación(es).');
  await expect(historialRotaciones(page)).toHaveCount(1);
  await expect(historialRotaciones(page)).toContainText('Rotación RR en nodo 50 (tras borrado)');

  await expect(infoDe(page, 'Número de nodos')).toHaveText('4');
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('3');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('50, 60, 70, 80');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('70, 50, 60, 80');
  await expect(recorrido(page, 'POSTORDEN (LRN)')).toHaveText('60, 50, 80, 70');
  await expect(recorrido(page, 'POR NIVELES (BFS)')).toHaveText('70, 50, 80, 60');

  // La nueva raíz es el 70 y los factores siguen dentro de {−1, 0, +1}.
  const arbol = await arbolDelSvg(page);
  expect(arbol.find((n) => n.profundidad === 0)?.valor).toBe(70);
  expect(arbol.find((n) => n.valor === 70)?.factor).toBe(1);
  expect(arbol.find((n) => n.valor === 50)?.factor).toBe(-1);
});

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANTES — se sostienen sobre una tanda grande, no solo sobre los 3 casos
// ─────────────────────────────────────────────────────────────────────────────

test('invariantes AVL sobre 30 inserciones y 12 borrados: inorden ascendente y |fb| ≤ 1', async ({
  page,
}) => {
  // Secuencia fija (no aleatoria: un test tiene que poder repetirse igual).
  const valores = Array.from({ length: 30 }, (_, i) => ((i * 37) % 101) + 1);
  await cargarSecuencia(page, valores.join(', '));
  await expect(infoDe(page, 'Número de nodos')).toHaveText('30');

  const comprobar = async (nEsperado: number) => {
    const inorden = (await recorrido(page, 'INORDEN (LNR)').textContent())!
      .split(',')
      .map((s) => Number(s.trim()));
    // (a) el inorden de un BST sale SIEMPRE ordenado ascendente
    expect(inorden).toHaveLength(nEsperado);
    expect([...inorden].sort((a, b) => a - b)).toEqual(inorden);

    const arbol = await arbolDelSvg(page);
    // (c) el contador de la app coincide con los nodos realmente dibujados
    expect(arbol).toHaveLength(nEsperado);
    await expect(infoDe(page, 'Número de nodos')).toHaveText(String(nEsperado));
    // (c) y la altura declarada coincide con la profundidad máxima del dibujo + 1
    const alturaDibujada = Math.max(...arbol.map((n) => n.profundidad)) + 1;
    await expect(infoDe(page, 'Altura del árbol')).toHaveText(String(alturaDibujada));
    // (b) ningún factor de balance fuera de {−1, 0, +1}
    for (const nodo of arbol) {
      expect(nodo.factor).not.toBeNull();
      expect(Math.abs(nodo.factor!)).toBeLessThanOrEqual(1);
    }
    // los cuatro recorridos visitan exactamente el mismo multiconjunto
    for (const nombre of ['PREORDEN (NLR)', 'POSTORDEN (LRN)', 'POR NIVELES (BFS)']) {
      const lista = (await recorrido(page, nombre).textContent())!.split(',').map((s) => Number(s.trim()));
      expect([...lista].sort((a, b) => a - b)).toEqual([...inorden].sort((a, b) => a - b));
    }
  };

  await comprobar(30);

  for (let i = 0; i < 12; i += 1) {
    await page.locator('#del-input').fill(String(valores[i * 2]));
    await botonExacto(page, 'Eliminar').click();
    await expect(mensaje(page)).toContainText(`Eliminado ${valores[i * 2]}`);
  }
  await comprobar(18);
});

test('la búsqueda cuenta bien las comparaciones y la profundidad', async ({ page }) => {
  await page.getByRole('button', { name: /Árbol balanceado/ }).click();
  await page.locator('#vel-input').fill('100'); // animación al mínimo para no esperar de más

  // 60 está en 50 → 70 → 60: tres comparaciones, profundidad 2.
  await page.locator('#search-input').fill('60');
  await botonExacto(page, 'Buscar').click();
  await expect(mensaje(page)).toContainText('Encontrado 60 tras 3 comparación(es). Profundidad: 2.');

  // 65 no existe: el camino 50 → 70 → 60 se agota sin encontrarlo.
  await page.locator('#search-input').fill('65');
  await botonExacto(page, 'Buscar').click();
  await expect(mensaje(page)).toContainText('65 no está en el árbol. Búsqueda terminó tras 3 comparación(es).');
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS del 25/08/2026 — REPARADOS ese mismo dia. Tests de regresion.
// ─────────────────────────────────────────────────────────────────────────────

test(
  '[1] REGRESIÓN 318 — «Insertar» con el campo vacío no crea el nodo 0',
  async ({ page }) => {
    await page.locator('#ins-input').fill('');
    await botonExacto(page, 'Insertar').click();

    // Esperado: un aviso de valor inválido y el árbol intacto.
    // Obtenido: «Insertado 0.» y un nodo 0 en el árbol, porque Number('') es 0 y no NaN.
    await expect(infoDe(page, 'Número de nodos')).toHaveText('0');
    await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('—');
  },
);

test(
  '[1 bis] REGRESIÓN 318 — «Eliminar» con el campo vacío no borra el nodo 0',
  async ({ page }) => {
    await cargarSecuencia(page, '0, 5, 10');
    await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('0, 5, 10');

    await page.locator('#del-input').fill('');
    await botonExacto(page, 'Eliminar').click();

    // Esperado: el árbol sigue con sus 3 nodos.
    // Obtenido: «Eliminado 0.» e inorden «5, 10» — el campo vacío borra sin que nadie lo pida.
    await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('0, 5, 10');
    await expect(infoDe(page, 'Número de nodos')).toHaveText('3');
  },
);

test(
  '[2] REGRESIÓN 319 — «Insertar varios» aplica el mismo rango que «Insertar»',
  async ({ page }) => {
    // El botón «Insertar» rechaza 12345 por rango…
    await page.locator('#ins-input').fill('12345');
    await botonExacto(page, 'Insertar').click();
    await expect(mensaje(page)).toContainText('Valor fuera de rango');
    await expect(infoDe(page, 'Número de nodos')).toHaveText('0');

    // …y el textarea, en la misma pantalla, lo acepta.
    await page.locator('#multi-input').fill('12345');
    await botonExacto(page, 'Insertar varios').click();
    await expect(infoDe(page, 'Número de nodos')).toHaveText('0');
  },
);

test(
  '[3] REGRESIÓN 320 — con muchos nodos el SVG se desplaza, no se encoge',
  async ({ page }) => {
    const valores = Array.from({ length: 45 }, (_, i) => (i + 1) * 7);
    await cargarSecuencia(page, valores.join(', '));
    await expect(infoDe(page, 'Número de nodos')).toHaveText('45');

    const medida = await page.evaluate(() => {
      const svg = document.querySelector('svg[role="img"]') as SVGSVGElement;
      const contenedor = svg.parentElement as HTMLElement;
      return {
        anchoViewBox: Number((svg.getAttribute('viewBox') ?? '0 0 0 0').split(' ')[2]),
        anchoPintado: Math.round(svg.getBoundingClientRect().width),
        scroll: contenedor.scrollWidth,
        cliente: contenedor.clientWidth,
      };
    });

    // Esperado: el contenedor (overflow-x: auto) desborda y se desplaza, con el SVG a tamaño
    // real. Obtenido: max-width:100% lo encoge de 2.310 px a ~990 px y nunca hay scroll, así
    // que la etiqueta de cada nodo baja de 14 px a 8 px.
    expect(medida.anchoPintado).toBeGreaterThanOrEqual(medida.anchoViewBox);
    expect(medida.scroll).toBeGreaterThan(medida.cliente);

    // Reforzado el 27/09/2026 (hallazgo 2298): «hay scroll» no basta, porque con el centrado
    // del contenedor el desborde se repartía a los dos lados y solo el DERECHO era desplazable;
    // este test pasaba con 635 px del dibujo ocultos a la izquierda. Ahora mide lo que vio el
    // acta: el nodo más a la izquierda, con el scroll en su tope, empieza dentro del panel…
    const izq = await nodoMasIzquierdo(page);
    expect(izq.valor).toBe('7');
    expect(izq.izquierda).toBeGreaterThanOrEqual(izq.borde - 0.5);
    // …y el más a la derecha se alcanza desplazando hasta el final.
    const der = await nodoMasDerecho(page);
    expect(der.valor).toBe('315');
    expect(der.derecha).toBeLessThanOrEqual(der.borde + 0.5);
  },
);

test(
  '[4] REGRESIÓN 321 — el B-tree no se presenta como derivado del AVL',
  async ({ page }) => {
    // Bayer y McCreight (1972) publicaron el B-tree como estructura multivía para bloques de
    // disco; no es un descendiente del AVL de Adelson-Velsky y Landis (1962).
    await expect(page.getByText(/derivado de AVL/)).toHaveCount(0);
  },
);

test('[5] REGRESIÓN 322 — ni el OpenGraph ni el WebApplication prometen inserción animada', async ({
  page,
}) => {
  // Lo que la app anima de verdad es la BÚSQUEDA (camino nodo a nodo, con la velocidad del
  // deslizador); la inserción, el borrado y la rotación saltan al estado final.
  const og = await page.locator('meta[property="og:description"]').getAttribute('content');
  expect(og).not.toMatch(/animadas paso a paso/);
  expect(og).toContain('búsqueda animada');

  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const webApp = bloques.find((b) => b.includes('"WebApplication"')) ?? '';
  expect(webApp).not.toMatch(/Inserción, borrado y búsqueda animadas/);
  expect(webApp).toContain('búsqueda animada nodo a nodo');
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// SEGUNDA INSPECCIÓN — 27/09/2026
//
// CASO 4 (normal), RESUELTO A MANO ANTES DE ABRIR EL NAVEGADOR
//   Insertar 30, 20, 40, 10, 25, 35, 50, 5, 3.
//   · Hasta el 5 el árbol se llena sin romper nada: fb(10) = +1, fb(20) = +1, fb(30) = +1.
//   · El 3 cuelga del 5 ⇒ fb(10) = 2 − 0 = +2 con 3 < 5 ⇒ LL sobre el 10 ⇒ 5(3, 10).
//
//        AVL (1 rotación)                    BST (0 rotaciones)
//             30   +1                              30
//           /    \                               /    \
//        20 +1    40 0                         20      40
//        /  \     /  \                        /  \    /  \
//      5 0  25   35   50                    10   25  35   50
//     /  \                                  /
//    3    10                               5
//                                         /
//                                        3
//     nodos 9 · altura 4 (en NODOS)       nodos 9 · altura 5
//     in   3, 5, 10, 20, 25, 30, 35, 40, 50         (el mismo en los dos modos)
//     pre  30, 20, 5, 3, 10, 25, 40, 35, 50         30, 20, 10, 5, 3, 25, 40, 35, 50
//     post 3, 10, 5, 25, 20, 35, 50, 40, 30         3, 5, 10, 25, 20, 35, 50, 40, 30
//     BFS  30, 20, 40, 5, 25, 35, 50, 3, 10         30, 20, 40, 10, 25, 35, 50, 5, 3
//
//   Borrar 20 en el AVL (dos hijos: 5 y 25) ⇒ sube el SUCESOR inorden, 25 (mínimo del
//   subárbol derecho). Al quitar el 25 original, el nodo 25 se queda con 5 (altura 2) a la
//   izquierda y nada a la derecha ⇒ fb = +2 con fb(5) = 0 ⇒ LL TRAS BORRADO sobre el 25:
//             30   +1           nodos 8 · altura 4
//           /    \              in   3, 5, 10, 25, 30, 35, 40, 50
//        5 −1     40 0          pre  30, 5, 3, 25, 10, 40, 35, 50
//        /  \     /  \          post 3, 10, 25, 5, 35, 50, 40, 30
//       3  25 +1 35   50        BFS  30, 5, 40, 3, 25, 35, 50, 10
//          /
//        10
//   Discrimina el convenio: con el PREDECESOR (10) no habría rotación ninguna.
//
// S1 (sospecha heredada: `toleranciaDe` sin control de entero en recuentos) — se mide aquí:
//   · Preguntas: altura, rotaciones, factor de la raíz, valor de la raíz, hojas, nodos,
//     posición inorden y k-ésimo inorden. La mayor respuesta de los 12 casos es 60 (caso 10)
//     ⇒ tolerancia 0,6; la práctica (20.000 semillas medidas con el motor) no pasa de 7.
//     Ninguna respuesta llega a 100, así que el ENTERO VECINO no cuela nunca: descartada esa
//     forma («61» por 60 se rechaza, abajo).
//   · Sí cuela un DECIMAL, en los 12 casos y en el 100 % de los ejercicios de práctica, aunque
//     la propia app avisa de que «aquí todas las respuestas son enteras» ⇒ hallazgo [N5].
// ═════════════════════════════════════════════════════════════════════════════════════════

/** El veredicto de «Casos para clase» (no el anunciador de rutas de Next, que es otro alert). */
const veredictoCaso = (page: Page) =>
  page.locator('div[role="alert"]').filter({ hasText: /orrecto|Escribe un número/ });

async function responderCaso(page: Page, texto: string) {
  await page.locator('#casos-respuesta').fill(texto);
  await botonExacto(page, 'Comprobar').click();
}

/**
 * El nodo más a la IZQUIERDA del dibujo, con el contenedor desplazado al tope izquierdo
 * (scrollLeft = 0 es lo más lejos que puede llegar el usuario), frente al borde interior
 * izquierdo del contenedor. Si el círculo empieza antes que el borde, ese nodo no se ve NUNCA.
 */
async function nodoMasIzquierdo(page: Page) {
  return page.evaluate(() => {
    const svg = document.querySelector('svg[role="img"]') as SVGSVGElement;
    const contenedor = svg.parentElement as HTMLElement;
    contenedor.scrollLeft = 0;
    const borde = contenedor.getBoundingClientRect().left + contenedor.clientLeft;
    const circulos = [...svg.querySelectorAll('circle')];
    const primero = circulos.reduce((a, b) =>
      Number(a.getAttribute('cx')) <= Number(b.getAttribute('cx')) ? a : b,
    );
    return {
      valor: (primero.nextElementSibling?.textContent ?? '').trim(),
      izquierda: primero.getBoundingClientRect().left,
      borde,
    };
  });
}

/**
 * La otra mitad de [N1]: el nodo más a la DERECHA, con el contenedor desplazado hasta el final,
 * frente al borde interior derecho. Quitar el centrado no puede cambiar un hueco por otro.
 */
async function nodoMasDerecho(page: Page) {
  return page.evaluate(() => {
    const svg = document.querySelector('svg[role="img"]') as SVGSVGElement;
    const contenedor = svg.parentElement as HTMLElement;
    contenedor.scrollLeft = contenedor.scrollWidth;
    const caja = contenedor.getBoundingClientRect();
    const borde = caja.left + contenedor.clientLeft + contenedor.clientWidth;
    const circulos = [...svg.querySelectorAll('circle')];
    const ultimo = circulos.reduce((a, b) =>
      Number(a.getAttribute('cx')) >= Number(b.getAttribute('cx')) ? a : b,
    );
    return {
      valor: (ultimo.nextElementSibling?.textContent ?? '').trim(),
      derecha: ultimo.getBoundingClientRect().right,
      borde,
    };
  });
}

test('CASO 4 · AVL 30, 20, 40, 10, 25, 35, 50, 5, 3: una LL en el 10 y el borrado del 20 fuerza otra LL', async ({
  page,
}) => {
  await cargarSecuencia(page, '30, 20, 40, 10, 25, 35, 50, 5, 3');

  await expect(mensaje(page)).toContainText('Insertados 9 de 9 valores. Rotaciones aplicadas: 1.');
  await expect(historialRotaciones(page)).toHaveCount(1);
  await expect(historialRotaciones(page).nth(0)).toContainText('Rotación LL en nodo 10 (insertando 3)');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('9');
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('4');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('3, 5, 10, 20, 25, 30, 35, 40, 50');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('30, 20, 5, 3, 10, 25, 40, 35, 50');
  await expect(recorrido(page, 'POSTORDEN (LRN)')).toHaveText('3, 10, 5, 25, 20, 35, 50, 40, 30');
  await expect(recorrido(page, 'POR NIVELES (BFS)')).toHaveText('30, 20, 40, 5, 25, 35, 50, 3, 10');
  let arbol = await arbolDelSvg(page);
  expect(arbol.find((n) => n.valor === 30)?.factor).toBe(1);
  expect(arbol.find((n) => n.valor === 20)?.factor).toBe(1);
  expect(arbol.find((n) => n.valor === 5)?.profundidad).toBe(2);

  // Borrar el 20 (dos hijos) ⇒ sube el 25 y el 25 se desequilibra ⇒ LL tras borrado.
  await page.locator('#del-input').fill('20');
  await botonExacto(page, 'Eliminar').click();
  await expect(mensaje(page)).toContainText('Eliminado 20. Se aplicaron 1 rotación(es).');
  await expect(historialRotaciones(page).nth(1)).toContainText('Rotación LL en nodo 25 (tras borrado)');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('8');
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('4');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('3, 5, 10, 25, 30, 35, 40, 50');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('30, 5, 3, 25, 10, 40, 35, 50');
  await expect(recorrido(page, 'POSTORDEN (LRN)')).toHaveText('3, 10, 25, 5, 35, 50, 40, 30');
  await expect(recorrido(page, 'POR NIVELES (BFS)')).toHaveText('30, 5, 40, 3, 25, 35, 50, 10');
  arbol = await arbolDelSvg(page);
  expect(arbol.find((n) => n.valor === 5)?.factor).toBe(-1);
  expect(arbol.find((n) => n.valor === 25)?.factor).toBe(1);
  for (const nodo of arbol) expect(Math.abs(nodo.factor ?? 0)).toBeLessThanOrEqual(1);
});

test('CASO 4 · la misma secuencia en BST no rota y mide 5 de alto', async ({ page }) => {
  await page.getByRole('button', { name: /^BST/ }).click();
  await cargarSecuencia(page, '30, 20, 40, 10, 25, 35, 50, 5, 3');

  await expect(mensaje(page)).toContainText('Insertados 9 de 9 valores. Rotaciones aplicadas: 0.');
  await expect(infoDe(page, 'Altura del árbol')).toHaveText('5');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('3, 5, 10, 20, 25, 30, 35, 40, 50');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('30, 20, 10, 5, 3, 25, 40, 35, 50');
  await expect(recorrido(page, 'POSTORDEN (LRN)')).toHaveText('3, 5, 10, 25, 20, 35, 50, 40, 30');
  await expect(recorrido(page, 'POR NIVELES (BFS)')).toHaveText('30, 20, 40, 10, 25, 35, 50, 5, 3');
  const arbol = await arbolDelSvg(page);
  expect(arbol.find((n) => n.valor === 3)?.profundidad).toBe(4); // 30 → 20 → 10 → 5 → 3
});

test('LÍMITES · −999 y 9999 entran por los dos controles; −1000 y 10000 no entran por ninguno', async ({
  page,
}) => {
  for (const valor of ['-999', '9999']) {
    await page.locator('#ins-input').fill(valor);
    await botonExacto(page, 'Insertar').click();
    await expect(mensaje(page)).toContainText(`Insertado ${valor}.`);
  }
  for (const valor of ['-1000', '10000']) {
    await page.locator('#ins-input').fill(valor);
    await botonExacto(page, 'Insertar').click();
    await expect(mensaje(page)).toContainText('Valor fuera de rango. Introduce un número entero entre -999 y 9999.');
  }
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('-999, 9999');

  await cargarSecuencia(page, '-1000, -999, 9999, 10000');
  await expect(mensaje(page)).toContainText('Insertados 2 de 4 valores.');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('-999, 9999');
});

test('S1 · en «Casos para clase» el entero vecino NO cuela: 61 por 60 se rechaza', async ({ page }) => {
  // Caso 10: BST 50, 30, 70, 20, 40, 60, 80 y se borra el 50 ⇒ sube el sucesor inorden, 60.
  // Es la respuesta más alta de los doce casos: con la tolerancia del 1 % de entonces (0,6 < 1)
  // el vecino ya no colaba; desde el 27/09/2026 (hallazgo 2302) solo vale el entero exacto.
  await page.getByRole('button', { name: /^Caso 10:/ }).click();
  await responderCaso(page, '60');
  await expect(veredictoCaso(page)).toContainText('¡Correcto!');
  for (const vecino of ['61', '59', '70']) {
    await responderCaso(page, vecino);
    await expect(veredictoCaso(page)).toContainText('No es correcto');
  }
});

test.describe('En móvil (393 px)', () => {
  test.use({
    viewport: { width: 393, height: 851 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 4 (móvil) — el cálculo y los recorridos salen igual que en escritorio', async ({ page }) => {
    await page.locator('#multi-input').fill('30, 20, 40, 10, 25, 35, 50, 5, 3');
    await botonExacto(page, 'Insertar varios').click();
    await expect(infoDe(page, 'Altura del árbol')).toHaveText('4');
    await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('30, 20, 5, 3, 10, 25, 40, 35, 50');
    await expect(historialRotaciones(page)).toContainText('Rotación LL en nodo 10 (insertando 3)');
    // Y el documento no se sale de lado: sin scroll horizontal de página.
    const anchoDoc = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(anchoDoc).toBeLessThanOrEqual(393);
  });

  // REPARADO 27/09/2026 (hallazgo 2298): el contenedor ya no centra con `justify-content`;
  // centran los márgenes automáticos del SVG, que con desborde valen 0.
  test(
    '[N1] REPARADO — en móvil, con el ejemplo «Inserción ordenada» en BST, la raíz 1 se puede ver',
    async ({ page }) => {
      await page.getByRole('button', { name: /^BST/ }).click();
      await page.getByRole('button', { name: /Inserción ordenada/ }).click();
      await expect(infoDe(page, 'Altura del árbol')).toHaveText('7');

      // viewBox de 410 px (7 · 50 + 60) en un contenedor de ~200 px de contenido. Con
      // `justify-content: center` el desborde se repartía a los dos lados y el IZQUIERDO no
      // era desplazable: medido el 27/09/2026, 81 px del SVG quedaban antes del borde con
      // scrollLeft = 0. El nodo 1 (la RAÍZ del BST degenerado) no se veía nunca y el 2, a medias.
      const m = await nodoMasIzquierdo(page);
      expect(m.valor).toBe('1');
      expect(m.izquierda).toBeGreaterThanOrEqual(m.borde - 0.5);
      // Y el 7, al otro extremo, sigue alcanzándose desplazando hasta el final.
      const d = await nodoMasDerecho(page);
      expect(d.valor).toBe('7');
      expect(d.derecha).toBeLessThanOrEqual(d.borde + 0.5);
    },
  );

  // REPARADO 27/09/2026 (hallazgo 2298): con un árbol que CABE, el dibujo sigue centrado.
  // (A 393 px el panel deja ~200 px de dibujo y hasta un árbol de 3 nodos, 210 px, desborda:
  // se mide a 1280.)
  test('[N1 bis] REPARADO — un árbol que cabe en el panel sigue centrado', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await cargarSecuencia(page, '20, 10, 30');
    const m = await page.evaluate(() => {
      const svg = document.querySelector('svg[role="img"]') as SVGSVGElement;
      const c = svg.parentElement as HTMLElement;
      const cc = c.getBoundingClientRect();
      const sc = svg.getBoundingClientRect();
      return { izq: sc.left - cc.left, der: cc.right - sc.right, desborda: c.scrollWidth > c.clientWidth };
    });
    expect(m.desborda).toBe(false);
    expect(Math.abs(m.izq - m.der)).toBeLessThanOrEqual(1);
  });

  // REPARADO 27/09/2026 (hallazgo 2299): `.opRow` lleva `flex-wrap: wrap`.
  test('[N2] REPARADO — en móvil, el botón «Limpiar todo» cabe en la pantalla', async ({ page }) => {
    // Medido el 27/09/2026 a 393 px: la fila era `flex` sin `flex-wrap`; «Insertar varios» y
    // «Aleatorios (10)» cabían, pero «Limpiar todo» iba de x = 347 a x = 459 y el body lo
    // recortaba en 393 (se veían 46 de sus 112 px; a 360 px, solo 13).
    const aleatorios = await botonExacto(page, 'Aleatorios (10)').boundingBox();
    expect(aleatorios!.x + aleatorios!.width).toBeLessThanOrEqual(393);
    const limpiar = await botonExacto(page, 'Limpiar todo').boundingBox();
    expect(limpiar!.x + limpiar!.width).toBeLessThanOrEqual(393);
    expect(limpiar!.x).toBeGreaterThanOrEqual(0);
    // Y las filas campo + botón no se han partido: «Insertar» sigue al lado de su campo.
    const campo = await page.locator('#ins-input').boundingBox();
    const insertar = await botonExacto(page, 'Insertar').boundingBox();
    expect(Math.abs(campo!.y - insertar!.y)).toBeLessThanOrEqual(8);
  });

  test('[N2 bis] REPARADO — a 360 px tampoco se recorta ningún botón de «Insertar varios»', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    for (const nombre of ['Insertar varios', 'Aleatorios (10)', 'Limpiar todo']) {
      const caja = await botonExacto(page, nombre).boundingBox();
      expect(caja!.x, nombre).toBeGreaterThanOrEqual(0);
      expect(caja!.x + caja!.width, nombre).toBeLessThanOrEqual(360);
    }
  });
});

// REPARADO 27/09/2026 (hallazgo 2298): también en escritorio. El [3], reforzado, mide lo mismo;
// este se queda como testigo propio del acta.
test(
  '[N1] REPARADO — con 45 nodos el primero (7) se alcanza desplazando el dibujo',
  async ({ page }) => {
    const valores = Array.from({ length: 45 }, (_, i) => (i + 1) * 7);
    await cargarSecuencia(page, valores.join(', '));
    await expect(infoDe(page, 'Número de nodos')).toHaveText('45');

    // La reparación del 320 quitó `max-width: 100%` y el SVG ya se pintaba a tamaño real, pero
    // el contenedor seguía centrando (`display: flex; justify-content: center`): medido el
    // 27/09/2026 en 1280 px, 635 de los 2.310 px quedaban a la izquierda del borde y no había
    // desplazamiento que llegase a ellos. El test [3] no lo veía porque solo pedía scrollWidth
    // > clientWidth, que se cumple con el desborde DERECHO.
    const m = await nodoMasIzquierdo(page);
    expect(m.valor).toBe('7');
    expect(m.izquierda).toBeGreaterThanOrEqual(m.borde - 0.5);
    const d = await nodoMasDerecho(page);
    expect(d.valor).toBe('315');
    expect(d.derecha).toBeLessThanOrEqual(d.borde + 0.5);
  },
);

// REPARADO 27/09/2026 (hallazgo 2300): «Buscar» usa el mismo `leerValor` que Insertar y Eliminar.
test('[N3] REPARADO — «Buscar» con el campo vacío avisa en vez de buscar el 0', async ({ page }) => {
  await cargarSecuencia(page, '0, 5, 10');
  await page.locator('#vel-input').fill('100');
  await page.locator('#search-input').fill('');
  await botonExacto(page, 'Buscar').click();

  // Esperado: un aviso que pida el número, como ya hacen Insertar y Eliminar («Escribe …»).
  // Obtenido el 27/09/2026: «Encontrado 0 tras 2 comparación(es). Profundidad: 1.», porque el
  // botón hacía `Number(valorBuscar)` y Number('') es 0 (sin el 0 en el árbol: «0 no está en
  // el árbol. Búsqueda terminó tras 3 comparación(es).» sobre el ejemplo balanceado).
  await expect(mensaje(page)).toContainText('Escribe el valor del nodo que quieres buscar.');
  // Y no se anima nada: tras más de dos pasos de animación no ha salido ningún veredicto.
  await page.waitForTimeout(400);
  await expect(mensaje(page)).not.toContainText('Encontrado');
  await expect(mensaje(page)).not.toContainText('no está en el árbol');

  // La búsqueda de verdad sigue funcionando.
  await page.locator('#search-input').fill('10');
  await botonExacto(page, 'Buscar').click();
  await expect(mensaje(page)).toContainText('Encontrado 10');
});

// REPARADO 27/09/2026 (hallazgo 2301): un decimal se rechaza con el aviso de entero, en los dos
// controles de inserción, en vez de truncarse con Math.trunc.
test('[N4] REPARADO — «Insertar» rechaza 2.5 en vez de insertar un 2', async ({ page }) => {
  await page.locator('#ins-input').fill('2.5');
  await botonExacto(page, 'Insertar').click();

  // Esperado: el aviso de la propia app («Introduce un número entero…») y el árbol vacío.
  // Obtenido el 27/09/2026: «Insertado 2.» — Math.trunc sin avisar (y «-0.5» entraba como 0).
  await expect(infoDe(page, 'Número de nodos')).toHaveText('0');
  await expect(mensaje(page)).toContainText('Introduce un número entero entre -999 y 9999.');

  await page.locator('#ins-input').fill('-0.5');
  await botonExacto(page, 'Insertar').click();
  await expect(mensaje(page)).toContainText('tiene decimales');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('0');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('—');
});

test('[N4 bis] REPARADO — «Insertar varios» dice qué decimales rechaza y no los trunca', async ({
  page,
}) => {
  // Antes: «Insertados 1 de 2 valores», inorden «2»: el 2.5 entraba como 2 y el 2.7 se perdía
  // en silencio como duplicado del 2.
  await cargarSecuencia(page, '2.5, 2.7');
  await expect(mensaje(page)).toContainText('No se ha insertado ningún valor.');
  await expect(mensaje(page)).toContainText('«2.5», «2.7»');
  await expect(infoDe(page, 'Número de nodos')).toHaveText('0');

  // Mezclados con enteros: los enteros entran y el mensaje nombra los rechazados.
  await cargarSecuencia(page, '10 2.5 20 30');
  await expect(mensaje(page)).toContainText('Insertados 3 de 4 valores.');
  await expect(mensaje(page)).toContainText('Rechazados por tener decimales (los nodos son números enteros): «2.5».');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('10, 20, 30');

  // Eliminar y Buscar tampoco truncan: 10.5 no borra el 10.
  await page.locator('#del-input').fill('10.5');
  await botonExacto(page, 'Eliminar').click();
  await expect(mensaje(page)).toContainText('tiene decimales');
  await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('10, 20, 30');
  await page.locator('#search-input').fill('20.5');
  await botonExacto(page, 'Buscar').click();
  await expect(mensaje(page)).toContainText('tiene decimales');
});

// REPARADO 27/09/2026 (hallazgo 2302): la corrección exige el entero exacto (Number.isInteger
// antes de comparar), con el patrón de `simulador-mitosis-meiosis/casos.ts`.
test('[N5] REPARADO — «60,5» no es la raíz 60 del caso 10 ni «7,05» la altura 7 del caso 1', async ({
  page,
}) => {
  // La app avisaba ella misma de que «aquí todas las respuestas son enteras», pero corregía con
  // `toleranciaDe` = máx(0,01; 1 %) y ningún control de entero. Medido el 27/09/2026: pasaban
  // «60,5» y «59,4» (caso 10, tolerancia 0,6), «7,05» (caso 1, altura 7), «0,01» y «-0,01»
  // (caso 4, cero rotaciones), y en la práctica pasaba en el 100 % de las 20.000 semillas.
  await page.getByRole('button', { name: /^Caso 1:/ }).click();
  await responderCaso(page, '7,05');
  await expect(veredictoCaso(page)).toContainText('No es correcto');
  await expect(veredictoCaso(page)).toContainText('números enteros');
  await responderCaso(page, '7');
  await expect(veredictoCaso(page)).toContainText('¡Correcto!');

  await page.getByRole('button', { name: /^Caso 10:/ }).click();
  for (const casi of ['60,5', '60,6', '59,4']) {
    await responderCaso(page, casi);
    await expect(veredictoCaso(page)).toContainText('No es correcto');
  }

  await page.getByRole('button', { name: /^Caso 4:/ }).click();
  for (const casi of ['0,01', '-0,01']) {
    await responderCaso(page, casi);
    await expect(veredictoCaso(page)).toContainText('No es correcto');
  }
  await responderCaso(page, '0');
  await expect(veredictoCaso(page)).toContainText('¡Correcto!');
});

// REPARADO 27/09/2026 (hallazgo 2304): la FAQ dice lo que la app hace con los recorridos.
test('[N6] REPARADO — la FAQ del JSON-LD no promete recorridos animados', async ({ page }) => {
  // Los cuatro recorridos se pintan como listas de texto estáticas; lo único animado es la
  // búsqueda. La reparación del 322 corrigió el OpenGraph y el WebApplication, pero la FAQPage
  // seguía diciendo: «El simulador permite ejecutar los cuatro de forma animada».
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = bloques.find((b) => b.includes('"FAQPage"')) ?? '';
  expect(faq).toContain('recorridos');
  expect(faq).not.toMatch(/ejecutar los cuatro de forma animada/);
  expect(faq).not.toMatch(/recorridos?[^"]*animad/);
  expect(faq).toContain('muestra los cuatro a la vez');
});

// REPARADO 27/09/2026 (hallazgo 2305): el consejo propone un árbol que SÍ da la cascada, y
// este test ejecuta en el navegador exactamente lo que el consejo dice.
test('[N7] REPARADO — el consejo del borrado propone un ejemplo que da de verdad la cascada', async ({
  page,
}) => {
  // Antes: «Pruébalo: carga el preset balanceado y elimina valores; observa rotaciones en
  // cascada». Ese preset es un árbol perfecto de altura 3: solo la RAÍZ puede llegar a
  // fb = ±2, así que un borrado disparaba como mucho UNA rotación (medido con el motor sobre
  // las 5.040 órdenes de vaciado: máximo 1 por borrado y 2 en todo el vaciado).
  await page.getByRole('button', { name: /Árbol balanceado/ }).click();
  for (const valor of ['30', '20', '40']) {
    await page.locator('#del-input').fill(valor);
    await botonExacto(page, 'Eliminar').click();
  }
  await expect(historialRotaciones(page)).toHaveCount(1);
  await expect(page.getByText(/carga el preset balanceado/)).toHaveCount(0);

  // Ahora propone un árbol de Fibonacci de altura 5 (12 nodos, el AVL con menos nodos para su
  // altura: cada nodo interno tiene fb = +1). Resuelto a mano:
  //                80 +1
  //             /      \
  //          50 +1      110 +1
  //         /   \       /   \
  //      30 +1  70 +1  100 +1 120
  //      /  \    /      /
  //    20+1 40  60     90
  //    /
  //   10
  // Entra por niveles sin rotar. Borrar el 120 deja 110 con fb = 2 − 0 = +2 y fb(100) = +1 ⇒
  // LL en el 110 ⇒ 100(90, 110), de altura 2. Al subir, la raíz 80 queda con 4 a la izquierda
  // y 2 a la derecha ⇒ fb = +2 con fb(50) = +1 ⇒ SEGUNDA LL, en el 80. Resultado: raíz 50,
  // preorden 50, 30, 20, 10, 40, 80, 70, 60, 100, 90, 110 (verificado también con el motor).
  const consejo = page.getByText(/Pruébalo en modo AVL/);
  await expect(consejo).toContainText('80, 50, 110, 30, 70, 100, 120, 20, 40, 60, 90, 10');
  await expect(consejo).toContainText('elimina el 120');

  await cargarSecuencia(page, '80, 50, 110, 30, 70, 100, 120, 20, 40, 60, 90, 10');
  await expect(mensaje(page)).toContainText('Insertados 12 de 12 valores. Rotaciones aplicadas: 0.');
  await page.locator('#del-input').fill('120');
  await botonExacto(page, 'Eliminar').click();
  await expect(mensaje(page)).toContainText('Eliminado 120. Se aplicaron 2 rotación(es).');
  await expect(historialRotaciones(page)).toHaveCount(2);
  await expect(historialRotaciones(page).nth(0)).toContainText('Rotación LL en nodo 110 (tras borrado)');
  await expect(historialRotaciones(page).nth(1)).toContainText('Rotación LL en nodo 80 (tras borrado)');
  await expect(recorrido(page, 'PREORDEN (NLR)')).toHaveText('50, 30, 20, 10, 40, 80, 70, 60, 100, 90, 110');
});

// REPARADO 27/09/2026 (hallazgo 2303): la pregunta de la práctica lleva la aclaración del caso 12.
test('[N8] REPARADO — la práctica de rotaciones declara que una doble cuenta como una', async ({
  page,
}) => {
  // El ejercicio aleatorio se siembra con Date.now(): con el reloj fijado en 2^32 · 400 + 1 ms
  // la semilla (ToUint32) es 1 ⇒ «AVL: 25, 75, 55, 90, 20, 85, 5 · ¿Cuántas rotaciones…?».
  // A mano: RL en 25 (al insertar 55), RL en 75 (al insertar 85) y LL en 25 (al insertar 5).
  // La app responde 3 (una doble = UNA); quien cuente cada giro simple, como hacen muchos
  // manuales, dirá 5 y se le suspendía sin que el enunciado dijera cómo contar. El caso 12 lo
  // declara («una rotación doble cuenta como una sola») y el spec de casos lo justifica: «si
  // no, sería ambiguo». El 70,7 % de los ejercicios de rotaciones llevan alguna doble.
  await page.clock.setFixedTime(new Date(2 ** 32 * 400 + 1));
  await page.goto(RUTA);
  await esperarHidratacion(page, CAMPOS);
  await page.getByRole('button', { name: /Practicar/ }).click();

  const enunciado = page.locator('p[aria-live="polite"][aria-atomic="true"]');
  await expect(enunciado).toContainText('25, 75, 55, 90, 20, 85, 5');
  await expect(enunciado).toContainText('¿Cuántas rotaciones ejecuta el árbol en total?');
  await responderCaso(page, '3');
  await expect(veredictoCaso(page)).toContainText('¡Correcto!');
  await responderCaso(page, '5');
  await expect(veredictoCaso(page)).toContainText('No es correcto');

  await expect(enunciado).toContainText(/doble.*(una sola|como una)/i);
});
