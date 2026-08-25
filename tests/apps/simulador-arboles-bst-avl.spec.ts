import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-arboles-bst-avl (segmento cálculo, riesgo 3, 262 usos reales)
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
 * HALLAZGOS del 25/08/2026. Se escriben con `test.fail()` afirmando lo que la app DEBERÍA
 * hacer y hoy falla a propósito, de modo que la suite queda en VERDE mientras el defecto siga
 * ahí. El día que se reparen saldrán en ROJO («expected to fail, but passed») y habrá que
 * quitarles la marca, con lo que pasan a ser red de regresión. El Inspector no repara.
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
 *       de rotaciones. No se marca con test.fail (es una promesa de metadata, no una aserción
 *       sobre el DOM); queda anotado aquí y verificado en el test del historial.
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

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Simulador de Árboles BST y AVL');
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
// HALLAZGOS — marcados test.fail() mientras el defecto siga en pie
// ─────────────────────────────────────────────────────────────────────────────

test.fail(
  '[1] operativa/medio — «Insertar» con el campo vacío no debería crear el nodo 0',
  async ({ page }) => {
    await page.locator('#ins-input').fill('');
    await botonExacto(page, 'Insertar').click();

    // Esperado: un aviso de valor inválido y el árbol intacto.
    // Obtenido: «Insertado 0.» y un nodo 0 en el árbol, porque Number('') es 0 y no NaN.
    await expect(infoDe(page, 'Número de nodos')).toHaveText('0');
    await expect(recorrido(page, 'INORDEN (LNR)')).toHaveText('—');
  },
);

test.fail(
  '[1 bis] operativa/medio — «Eliminar» con el campo vacío no debería borrar el nodo 0',
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

test.fail(
  '[2] operativa/bajo — «Insertar varios» debería aplicar el mismo rango que «Insertar»',
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

test.fail(
  '[3] operativa/bajo — con muchos nodos el SVG debería desplazarse, no encogerse',
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
  },
);

test.fail(
  '[4] contenido/bajo — el B-tree no deriva del AVL',
  async ({ page }) => {
    // Bayer y McCreight (1972) publicaron el B-tree como estructura multivía para bloques de
    // disco; no es un descendiente del AVL de Adelson-Velsky y Landis (1962).
    await expect(page.getByText(/derivado de AVL/)).toHaveCount(0);
  },
);
