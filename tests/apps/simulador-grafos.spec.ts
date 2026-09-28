import { test, expect, type Page, type Locator } from '@playwright/test';
import { sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Simulador de Grafos — test de regresión del Inspector (26/08/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Simulador de Grafos» · subtítulo «BFS, DFS, Dijkstra y A* — paso a paso con
 * estructura auxiliar viva» · metadata y JSON-LD «4 algoritmos: BFS, DFS, Dijkstra, A*»,
 * «editor visual de nodos y aristas», «4 presets», «camino encontrado destacado y
 * métricas de complejidad». La tabla comparativa del bloque educativo declara además,
 * algoritmo a algoritmo, si el camino que devuelve es óptimo: BFS «Sí, en aristas»,
 * DFS «No», Dijkstra «Sí, en peso», A* «Sí, si h es admisible».
 *
 * Eso convierte la app en verdad comprobable DURA: un grafo de 8 nodos se resuelve a
 * mano en papel y el resultado es un número exacto, no una estimación.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * Los tres casos se resolvieron A MANO, arista a arista, ANTES de abrir el navegador,
 * sobre el preset «Grafo denso» que la propia app trae (8 nodos, 15 aristas, no dirigido):
 *
 *   A-B 4 · A-C 2 · A-D 7 · B-C 1 · B-E 5 · C-D 3 · C-F 6 · D-G 4
 *   E-F 2 · E-H 8 · F-G 1 · F-H 3 · G-H 5 · A-E 9 · B-F 4
 *
 * No se importa nada de `page.tsx`: los pesos están escritos aquí a mano a propósito, para
 * que el test contraste la app contra la aritmética y no contra sí misma.
 *
 * ESTADO DE LOS HALLAZGOS
 * ───────────────────────
 * Los tres «caso N» van en verde: la app los resuelve exactamente como el papel, incluidos
 * los contadores después de BORRAR (que es donde suelen mentir). Los tres «HALLAZGO N» del
 * 26/08/2026 (384, 385 y 386 en la base del Inspector) se REPARARON ese mismo día: sus tests
 * se llaman ahora «REGRESIÓN nnn» y son candados que afirman el comportamiento correcto.
 * La re-inspección del 28/09/2026 los confirmó en pie y añadió el bloque del final.
 * `npm run test:apps` no forma parte de `npm run build`, así que no detienen ningún
 * despliegue.
 */

const RUTA = '/simulador-grafos/';

/** El nombre accesible completo de cada botón de algoritmo (hay dos que contienen «Dijkstra»). */
const ALGORITMO = {
  bfs: 'BFS Anchura · cola FIFO',
  dfs: 'DFS Profundidad · pila LIFO',
  dijkstra: 'Dijkstra Camino más corto',
  astar: 'A* Dijkstra + heurística',
} as const;

/**
 * Abre la app y espera a que el componente cliente haya montado. El `useEffect` inicial
 * carga el preset «Cuadrícula 5×5», así que la presencia de círculos es la señal de que
 * ya hay React vivo detrás del SVG servido por el servidor.
 */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.locator('[class*="editorSvg"] [class*="nodoCircle"]').first()).toBeVisible({
    timeout: 20000,
  });
}

/**
 * Devuelve el valor de una tarjeta de métrica buscándola por su etiqueta visible.
 * Se lee `textContent` y no `innerText` a propósito: «Longitud del camino» mete la unidad
 * en un `<span>` anidado y el valor íntegro es «4aristas», sin espacio.
 */
async function metrica(page: Page, etiqueta: string): Promise<string> {
  const valor = await page
    .locator('[class*="metricCard"]', { has: page.getByText(etiqueta, { exact: true }) })
    .locator('[class*="metricValue"]')
    .textContent();
  return (valor ?? '').trim();
}

/** Etiquetas de los nodos del lienzo, en orden de creación (son `<text>` SVG). */
async function etiquetas(page: Page): Promise<string[]> {
  return page.locator('[class*="editorSvg"] [class*="nodoLabel"]').allTextContents();
}

const nodos = (page: Page): Locator => page.locator('[class*="editorSvg"] [class*="nodoCircle"]');
const aristas = (page: Page): Locator => page.locator('[class*="editorSvg"] line');

/**
 * Lanza el algoritmo elegido y espera a que la animación llegue al último paso.
 * La descripción del panel auxiliar imprime «Paso N / M»; el resultado final es N === M.
 */
async function ejecutar(page: Page, algoritmo: keyof typeof ALGORITMO): Promise<void> {
  await page.getByRole('button', { name: ALGORITMO[algoritmo] }).click();
  const boton = page.locator('[class*="calcBtn"]');
  await expect(boton).toBeEnabled();
  await boton.click();
  // Velocidad al mínimo (100 ms/paso) para no encadenar esperas de 700 ms.
  await page.locator('#vel-slider').fill('100');
  await expect
    .poll(
      async () => {
        const t = await page.locator('[class*="descripcionPaso"]').innerText();
        const m = t.match(/Paso\s+(\d+)\s*\/\s*(\d+)/);
        return m ? m[1] === m[2] : false;
      },
      { timeout: 30000 },
    )
    .toBe(true);
}

/** Crea un nodo pulsando en el lienzo, en coordenadas relativas a su caja (0..1). */
async function clicEnLienzo(page: Page, fx: number, fy: number): Promise<void> {
  const svg = page.locator('[class*="editorSvg"]');
  const caja = await svg.boundingBox();
  if (!caja) throw new Error('el lienzo no tiene caja');
  await svg.click({ position: { x: caja.width * fx, y: caja.height * fy } });
}

test.describe('Simulador de Grafos', () => {
  /**
   * CASO 1 (normal) — Dijkstra sobre el preset «Grafo denso», de A a H.
   *
   * Traza a mano, extracción a extracción:
   *   dist[A]=0 → relaja: B=4, C=2, D=7, E=9
   *   extrae C(2) → B=3 (por C), D=5 (por C), F=8 (por C)
   *   extrae B(3) → E=8 (por B), F=7 (por B)
   *   extrae D(5) → G=9 (por D)
   *   extrae F(7) → G=8 (por F), H=10 (por F)
   *   extrae E(8) → H por E costaría 8+8=16, no mejora
   *   extrae G(8) → H por G costaría 8+5=13, no mejora
   *   extrae H(10) → fin
   * Camino reconstruido hacia atrás: H←F←B←C←A  =>  A → C → B → F → H
   * Coste 2+1+4+3 = 10, que es el mínimo real (A-C-F-H son 11 y A-B-F-H son 11).
   *
   * Contadores esperados, también a mano:
   *   · Nodos visitados = 8 (se extraen los ocho antes de parar en H).
   *   · Aristas exploradas = 27 = suma de los grados de los siete nodos que llegan a
   *     relajar (A 4 + C 4 + B 4 + D 3 + F 5 + E 4 + G 3); H rompe el bucle sin explorar
   *     sus 3 aristas.
   */
  test('caso 1 — Dijkstra en el grafo denso da A → C → B → F → H con coste 10', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grafo denso' }).click();

    // El preset trae exactamente 8 nodos y 15 aristas, y marca origen A y destino H.
    // (El algoritmo por defecto es BFS: el botón dice el origen y el destino, no el método.)
    await expect(nodos(page)).toHaveCount(8);
    await expect(aristas(page)).toHaveCount(15);
    await expect(page.locator('[class*="calcBtn"]')).toHaveText(/de A a H$/);

    await ejecutar(page, 'dijkstra');
    await expect(page.locator('[class*="calcBtn"]')).toHaveText('Ejecutar DIJKSTRA de A a H');

    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → C → B → F → H');
    await expect(page.locator('[class*="descripcionPaso"]')).toContainText(
      'Camino más corto: A → C → B → F → H con coste 10.',
    );
    expect(await metrica(page, 'Coste total')).toBe('10');
    expect(await metrica(page, 'Longitud del camino')).toBe('4aristas');
    expect(await metrica(page, 'Nodos visitados')).toBe('8');
    expect(await metrica(page, 'Aristas exploradas')).toBe('27');
    expect(await metrica(page, 'Complejidad')).toBe('O((V + E) log V)');
  });

  /**
   * CASO 2 (límite) — lienzo vacío, y después un destino INALCANZABLE.
   *
   * Primero el grafo vacío: sin nodos no hay origen ni destino, y el botón debe estar
   * deshabilitado en vez de reventar al reconstruir el camino (es justo el último punto
   * del recuadro «Errores frecuentes» del propio bloque educativo).
   *
   * Después se construye a mano el grafo desconexo más pequeño que existe:
   *   tres nodos A, B, C y UNA sola arista A-B (peso 1, el valor por defecto del deslizador).
   * Con origen A y destino C, Dijkstra a mano:
   *   extrae A(0) → relaja B=1 · extrae B(1) → su único vecino A ya está visitado
   *   no queda ningún nodo no visitado con distancia finita  =>  NO EXISTE CAMINO
   * Contadores: Nodos visitados = 2 (A y B; C nunca entra), Aristas exploradas = 2
   * (la arista A-B se mira una vez desde cada extremo, por ser no dirigida).
   */
  test('caso 2 — lienzo vacío y destino inalcanzable en un grafo desconexo', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Limpiar grafo' }).click();

    await expect(nodos(page)).toHaveCount(0);
    await expect(aristas(page)).toHaveCount(0);
    expect(await page.locator('[class*="editorSvg"] text').textContent()).toBe(
      'Lienzo vacío. Carga un preset o añade nodos.',
    );
    const boton = page.locator('[class*="calcBtn"]');
    await expect(boton).toBeDisabled();
    await expect(boton).toHaveText('Marca origen y destino para continuar');

    // Tres nodos sueltos. Se pulsa lejos del centro: ahí el texto «Lienzo vacío» se comía
    // el clic (HALLAZGO 2 del 26/08/2026, REPARADO: su candado es REGRESIÓN 386, más abajo).
    await page.getByRole('button', { name: 'Añadir nodo' }).click();
    for (const fx of [0.2, 0.5, 0.8]) await clicEnLienzo(page, fx, 0.2);
    await expect(nodos(page)).toHaveCount(3);
    // Las etiquetas se asignan por orden de creación: A, B, C.
    expect(await etiquetas(page)).toEqual(['A', 'B', 'C']);

    // Una sola arista A-B; C queda aislado.
    await page.getByRole('button', { name: 'Añadir arista' }).click();
    await page.getByRole('button', { name: 'Nodo A' }).click();
    await page.getByRole('button', { name: 'Nodo B' }).click();
    await expect(aristas(page)).toHaveCount(1);

    await page.getByRole('button', { name: 'Marcar origen' }).click();
    await page.getByRole('button', { name: 'Nodo A' }).click();
    await page.getByRole('button', { name: 'Marcar destino' }).click();
    await page.getByRole('button', { name: 'Nodo C' }).click();

    await ejecutar(page, 'dijkstra');

    await expect(page.locator('[class*="descripcionPaso"]')).toContainText(
      'No existe camino de A a C.',
    );
    // Sin camino no puede haber coste ni longitud: la app debe decir «—», no 0.
    expect(await metrica(page, 'Coste total')).toBe('—');
    expect(await metrica(page, 'Longitud del camino')).toBe('—aristas');
    expect(await metrica(page, 'Nodos visitados')).toBe('2');
    expect(await metrica(page, 'Aristas exploradas')).toBe('2');
    // Y no debe aparecer ninguna tarjeta de «Camino encontrado».
    await expect(page.locator('[class*="resultValue"]')).toHaveCount(0);
  });

  /**
   * CASO 3 (lo que debe rechazarse / recalcularse) — borrar un nodo con cuatro aristas
   * colgando. Es el punto en el que los contadores de este tipo de app suelen mentir:
   * el defecto aparece al BORRAR, no al añadir.
   *
   * En el preset denso, C toca cuatro aristas (A-C, B-C, C-D y C-F). Al eliminar el nodo
   * deben desaparecer las cuatro: 8→7 nodos y 15→11 aristas, sin ninguna línea huérfana
   * apuntando a un nodo que ya no existe.
   *
   * Y el algoritmo tiene que recalcular sobre el grafo REAL, no sobre el de antes. A mano,
   * con las 11 aristas que quedan (A-B 4 · A-D 7 · B-E 5 · D-G 4 · E-F 2 · E-H 8 ·
   * F-G 1 · F-H 3 · G-H 5 · A-E 9 · B-F 4):
   *   dist[A]=0 → B=4, D=7, E=9
   *   extrae B(4) → F=8 (por B); E por B costaría 4+5=9, empata y NO mejora
   *   extrae D(7) → G=11 (por D)
   *   extrae F(8) → G=9 (por F), H=11 (por F)
   *   extrae E(9) → H por E costaría 17, no mejora
   *   extrae G(9) → H por G costaría 14, no mejora
   *   extrae H(11) → fin
   * Camino: H←F←B←A  =>  A → B → F → H, coste 4+4+3 = 11 (uno más que con C, como debe ser).
   * Contadores: Nodos visitados = 7 · Aristas exploradas = 3+3+2+4+4+3 = 19.
   */
  test('caso 3 — borrar un nodo con cuatro aristas colgando y recalcular', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grafo denso' }).click();
    await expect(nodos(page)).toHaveCount(8);
    await expect(aristas(page)).toHaveCount(15);

    await page.getByRole('button', { name: 'Eliminar' }).click();
    await page.getByRole('button', { name: 'Nodo C' }).click();

    // El nodo y SUS CUATRO aristas se van juntos.
    await expect(nodos(page)).toHaveCount(7);
    await expect(aristas(page)).toHaveCount(11);
    expect(await etiquetas(page)).toEqual(['A', 'B', 'D', 'E', 'F', 'G', 'H']);

    await ejecutar(page, 'dijkstra');

    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → B → F → H');
    expect(await metrica(page, 'Coste total')).toBe('11');
    expect(await metrica(page, 'Longitud del camino')).toBe('3aristas');
    expect(await metrica(page, 'Nodos visitados')).toBe('7');
    expect(await metrica(page, 'Aristas exploradas')).toBe('19');
  });

  /**
   * HALLAZGO 1 (cálculo, alto) — REPARADO el 26/08/2026 (hallazgo 384). Lo que sigue
   * describe el defecto TAL COMO ERA; desde la reparación, h se calibra con el menor
   * cociente peso/longitud del grafo y es admisible (re-inspección 28/09/2026: confirmado,
   * y A* coincide con Dijkstra en 20.000 grafos aleatorios).
   *
   * A* devolvía un camino PEOR que Dijkstra sobre el preset que trae la propia app, y lo
   * presentaba sin ninguna advertencia: «Camino A* encontrado: A → B → F → H con coste 11»
   * frente al «Camino más corto: A → C → B → F → H con coste 10» que da Dijkstra en el
   * mismo grafo, con el mismo origen y el mismo destino. El óptimo real es 10 (caso 1).
   *
   * La causa está en `distanciaEuclidea()`: h(n) = redondeo(distancia en PÍXELES / 10),
   * mientras que los pesos los pone el usuario con un deslizador de 1 a 99, sin relación
   * ninguna con la geometría del dibujo. En el grafo denso los nodos están en un círculo
   * de 180 px de radio, así que h vale entre 14 y 36 cuando el camino óptimo COMPLETO
   * cuesta 10: la heurística sobreestima por un factor de tres y A* degenera en búsqueda
   * voraz. Es exactamente el caso que el recuadro «Errores frecuentes» de la propia app
   * describe («Heurística A* no admisible (sobreestima) → encuentra camino, pero no
   * necesariamente el óptimo»), solo que aquí lo comete la app, no el alumno, y la tabla
   * comparativa sigue prometiendo «Camino óptimo: Sí, si h es admisible» sin decir en
   * ningún sitio que la h de este simulador no lo es.
   *
   * La demostración de que el fallo es la heurística y no el grafo: basta ARRASTRAR el
   * nodo C hacia el destino —sin tocar un solo peso ni una sola arista— para que h(C)
   * baje de 33 a 13 y A* pase a devolver 10 y el camino bueno. La misma pregunta sobre
   * el mismo grafo da dos respuestas distintas según dónde esté dibujado un nodo.
   */
  test('REGRESIÓN 384 — A* devuelve el mismo camino óptimo que Dijkstra en el preset de la app', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grafo denso' }).click();

    await ejecutar(page, 'astar');
    // El óptimo, calculado a mano en el caso 1, es 10. Antes de la reparación la app devolvía 11.
    expect(await metrica(page, 'Coste total')).toBe('10');
    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → C → B → F → H');
  });

  /**
   * HALLAZGO 2 (operativa, bajo) — REPARADO el 26/08/2026 (hallazgo 386). Descrito tal
   * como era; hoy el rótulo lleva `pointerEvents: 'none'`.
   *
   * Con el lienzo vacío, el rótulo «Lienzo vacío. Carga un preset o añade nodos.» se dibujaba
   * como un `<text>` SVG sin `pointer-events: none` justo en el centro del lienzo (400, 250
   * de 800×500). Como `handleSvgClick` solo crea un nodo cuando el objetivo del puntero es
   * el propio `<svg>` o un `<rect>`, pulsar sobre ese rótulo NO hacía nada y no avisaba de
   * nada — y el centro del lienzo es precisamente donde pulsa quien acaba de leer «haz clic
   * en el lienzo para crear un nodo nuevo». Fuera del rótulo funcionaba a la primera.
   *
   * Las hermanas `.nodoLabel` y `.aristaPeso` ya llevaban `pointer-events: none` en el CSS
   * Module; a este rótulo se le había olvidado.
   */
  test('REGRESIÓN 386 — el rótulo «Lienzo vacío» ya no se come el clic en el centro del lienzo', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Limpiar grafo' }).click();
    await page.getByRole('button', { name: 'Añadir nodo' }).click();

    await clicEnLienzo(page, 0.5, 0.5); // el centro exacto, encima del rótulo
    await expect(nodos(page)).toHaveCount(1);
  });

  /**
   * HALLAZGO 3 (accesibilidad, medio) — REPARADO el 26/08/2026 (hallazgo 385). Descrito
   * tal como era; hoy los 10 conmutadores llevan `aria-pressed` y los emojis `aria-hidden`.
   *
   * Los cuatro botones que eligen algoritmo son un conmutador excluyente: el activo se
   * distinguía solo por color (`.algoritmoActive`) y ninguno exponía estado accesible —
   * `aria-pressed` estaba ausente en los 15 botones de control de la app (0 apariciones en
   * `page.tsx`). Un lector de pantalla anunciaba «BFS» y «Dijkstra» igual, estuviera cual
   * estuviera seleccionado. Es la regla 2 del §5 del CLAUDE.md global; el candado
   * `npm run check:a11y-jsx` la lista como «toggle sin aria-pressed» pero solo avisa,
   * porque exige criterio.
   *
   * En la misma pasada, el candado señalaba 16 incumplimientos de las dos reglas unívocas
   * (emoji junto a texto sin `aria-hidden`: 🗑 Eliminar, 📍 Marcar origen, 🎯 Marcar destino,
   * ▶ Iniciar, ⏸ Pausar, ⏭ Paso y diez 💡 del bloque educativo). El fichero era de junio de
   * 2026, anterior al candado, así que era pasivo: no rompía el build.
   */
  test('REGRESIÓN 385 — los botones de algoritmo exponen aria-pressed', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: ALGORITMO.dijkstra }).click();

    await expect(page.getByRole('button', { name: ALGORITMO.dijkstra })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: ALGORITMO.bfs })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

/**
 * ════════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN del 28/09/2026
 * ════════════════════════════════════════════════════════════════════════════════════════
 *
 * Motivo: la analítica marcaba la app con FIRMA DE ROTURA (73,4 % de visitas cortas frente
 * al 62,6 % del catálogo y 6,3 % de recargas en la misma sesión frente al 3,1 %, sobre 79
 * visitas en 30 días). Se buscó lo que IMPIDE USAR la app, en escritorio y en móvil.
 *
 * Los tres reparados del 26/08 siguen en pie (sus REGRESIÓN, arriba). En escritorio el
 * cálculo es exacto en todos los casos resueltos a mano; lo que se encontró está en MÓVIL
 * y en la tabla de A*:
 *
 *   · En 390 px el lienzo se dibuja a 212 × 132,5 px porque el viewBox fijo de 800 × 500 se
 *     encaja dentro de cuatro rellenos anidados (16 + 32 + 24 + 16 px más bordes = 89 px por
 *     lado). Escala 0,265: los pesos de las aristas miden 2,9 px, las letras de los nodos
 *     3,7 px y cada nodo 11,7 px de diámetro. El grafo con pesos no se puede leer.
 *   · En el modo por defecto («Añadir nodo») el nodo se crea en `pointerdown`, y el lienzo
 *     lleva `touch-action: none`: quien intenta desplazar la página deslizando el dedo sobre
 *     el lienzo no se desplaza y deja un nodo fantasma en el grafo.
 *   · La tabla de A* imprime h y f con punto decimal y con el error de coma flotante a la
 *     vista (f = 7.609999999999999), desde que la reparación del 26/08 hizo decimal la h.
 *
 * Una sola `<Footer appName=…>`, al final del árbol y fuera de toda rama condicional: el
 * AnalyticsTracker se monta UNA vez por carga (medido: un único mensaje «[Analytics]» por
 * carga tras ejecutar, borrar, mover y cambiar de preset). La firma no es de las falsas.
 *
 * REPARADOS los tres el 28/09/2026 (hallazgos 2374, 2375 y 2376); sus tests se llaman ahora
 * «REGRESIÓN nnnn» y afirman el comportamiento correcto:
 *   · 2374 — los rellenos se recortan en móvil (lienzo de 212 → 316 px en 390) y nodos,
 *     rótulos y trazos se dimensionan con la escala REAL del lienzo, con mínimos en pantalla:
 *     nodos de 26 px, pesos de 11 px, letras de 12 px. Borrar una arista ya no exige acertar
 *     en una línea de medio píxel: se lleva el toque la arista más cercana en 16 px.
 *   · 2375 — el nodo se crea en el `click`, no en `pointerdown`, y el lienzo lleva
 *     `touch-action: manipulation`: deslizar desplaza la página y pellizcar amplía. Solo el
 *     arrastre de un nodo en «Mover» retiene el gesto.
 *   · 2376 — h, f, g y dist se pintan con `formatNumber` (coma decimal) y f = g + h se suma
 *     en centésimas, sin el ruido de coma flotante.
 */

/** Nombre accesible de un nodo del lienzo, sin confundir «Nodo A» con «Nodo A1». */
const nodo = (page: Page, id: string): Locator =>
  page.locator(`[class*="editorSvg"] g[role="button"][aria-label^="Nodo ${id}."], [class*="editorSvg"] g[role="button"][aria-label="Nodo ${id}"]`);

/** Celdas de la fila de la tabla A* (Nodo · g · h · f) de un nodo, en el paso mostrado. */
async function filaTablaA(page: Page, id: string): Promise<string[]> {
  const filas = page.locator('[class*="tablaDijkstra"] tbody tr');
  const fila = filas.filter({ has: page.locator('td:first-child', { hasText: new RegExp(`^${id}$`) }) });
  return (await fila.locator('td').allTextContents()).map((t) => t.trim());
}

/** Lleva un elemento al centro de la vista (sin animación) y lo toca con el dedo. */
async function tocar(loc: Locator): Promise<void> {
  await loc.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'auto' }));
  await loc.tap();
}

/**
 * Tamaños EN PANTALLA de lo que dibuja el lienzo. La fuente del peso se mide como la pinta el
 * navegador: su tamaño en unidades del viewBox por la escala de la matriz de pantalla.
 */
async function medirLienzo(
  page: Page,
): Promise<{ anchoLienzo: number; fuentePeso: number; fuenteNodo: number; diametroNodo: number }> {
  return page.evaluate(() => {
    const svg = document.querySelector('[class*="editorSvg"]') as SVGSVGElement;
    const peso = document.querySelector('[class*="editorSvg"] [class*="aristaPeso"]') as SVGTextElement;
    const letra = document.querySelector('[class*="editorSvg"] [class*="nodoLabel"]') as SVGTextElement;
    const circulo = document.querySelector('[class*="editorSvg"] [class*="nodoCircle"]') as SVGCircleElement;
    const escala = peso.getScreenCTM()?.a ?? 0;
    return {
      anchoLienzo: svg.getBoundingClientRect().width,
      fuentePeso: parseFloat(getComputedStyle(peso).fontSize) * escala,
      fuenteNodo: parseFloat(getComputedStyle(letra).fontSize) * escala,
      diametroNodo: circulo.getBoundingClientRect().width,
    };
  });
}

/**
 * Desliza un dedo en vertical con eventos táctiles de CDP (Playwright solo trae `tap`).
 * OJO: tras un deslizamiento así, el PRIMER toque de Playwright no genera `click` (medido el
 * 28/09/2026 también en una página en blanco, sin la app: es la emulación, no el lienzo).
 * Por eso en estos tests el deslizamiento va siempre después de los toques.
 */
async function deslizarDedo(page: Page, x: number, y0: number, dy: number, pasos = 10): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const dedo = (y: number) => [{ x, y, radiusX: 1, radiusY: 1, force: 1, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: dedo(y0) });
  for (let i = 1; i <= pasos; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: dedo(y0 + (dy * i) / pasos) });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

/**
 * Punto medio en pantalla de la arista entre dos nodos y su normal unitaria, hacia fuera del
 * centro del lienzo. Sale de los CÍRCULOS de los nodos, no de la línea, para que el test valga
 * también contra el código anterior a la reparación (medido el 28/09/2026 contra producción:
 * allí el toque en el centro de A-D la dejaba en 15 aristas).
 */
async function geometriaArista(
  page: Page,
  desde: string,
  hasta: string,
): Promise<{ x: number; y: number; nx: number; ny: number }> {
  const centroDe = (id: string) =>
    nodo(page, id)
      .locator('circle')
      .evaluate((el) => {
        const c = el as SVGCircleElement;
        const m = c.getScreenCTM();
        if (!m) throw new Error('el nodo no tiene matriz de pantalla');
        const p = new DOMPoint(c.cx.baseVal.value, c.cy.baseVal.value).matrixTransform(m);
        const centro = new DOMPoint(400, 250).matrixTransform(m);
        return { x: p.x, y: p.y, cx: centro.x, cy: centro.y };
      });
  const p1 = await centroDe(desde);
  const p2 = await centroDe(hasta);
  const x = (p1.x + p2.x) / 2;
  const y = (p1.y + p2.y) / 2;
  const largo = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  let nx = -(p2.y - p1.y) / largo;
  let ny = (p2.x - p1.x) / largo;
  if (nx * (x - p1.cx) + ny * (y - p1.cy) < 0) {
    nx = -nx;
    ny = -ny;
  }
  return { x, y, nx, ny };
}

const aristasPresentes = (page: Page): Promise<string[]> =>
  page
    .locator('[class*="editorSvg"] [data-arista]')
    .evaluateAll((gs) => gs.map((g) => g.getAttribute('data-arista') ?? ''));

test.describe('Inspector 28/09/2026 — escritorio: A*, límite y rechazo', () => {
  /**
   * CASO NORMAL — preset «Laberinto», de A a L, con A* y con Dijkstra.
   *
   * El laberinto es una rejilla 4 × 3 (A B C D / E F G H / I J K L) con 14 aristas de peso 1:
   *   A-B · B-C · C-D · A-E · C-G · D-H · E-F · G-H · F-J · G-K · H-L · I-J · J-K · E-I
   * Caminos mínimos de A a L: A-B-C-D-H-L y A-B-C-G-H-L, los dos de 5. Cualquier otro pasa
   * por la fila de abajo y cuesta 7.
   *
   * A* a mano. k = menor peso/longitud = 1 / 186,67 px (la arista horizontal, más larga que
   * la vertical de 150 px). h(n) = ⌊100 · k · distancia(n, L)⌋ / 100 con L en (680, 400):
   *   h(A) 3,40 · h(B) 2,56 · h(C) 1,89 · h(D) 1,60 · h(E) 3,10 · h(F) 2,15 · h(G) 1,28 ·
   *   h(H) 0,80 · h(I) 3,00 · h(J) 2,00 · h(K) 1,00 · h(L) 0
   * Extracciones por f mínima (empate → el que entró antes en abierto):
   *   A(3,40) → B f=3,56, E f=4,10 · B(3,56) → C f=3,89 · C(3,89) → D f=4,60, G f=4,28 ·
   *   E(4,10) → F f=4,15, I f=5 · F(4,15) → J f=5 · G(4,28) → H f=4,80, K f=5 ·
   *   D(4,60) → H por D daría g=4, NO mejora (pred[H] sigue siendo G) · H(4,80) → L f=5 ·
   *   I, J y K (f=5, entraron antes que L) · L(5) → fin.
   *   Camino L←H←G←C←B←A = A → B → C → G → H → L, coste 5. Nodos visitados 12. Aristas
   *   exploradas = grados de los 11 nodos expandidos = 2+2+3+3+2+3+2+3+2+3+2 = 27.
   *
   * Dijkstra a mano (empate → el primero en el orden A..L): A, B, E, C, F, I, D, G, J, H,
   * K, L. H se relaja primero desde D (dist 4) y G no la mejora → A → B → C → D → H → L,
   * coste 5, 12 visitados, 27 exploradas. Mismo coste por otro camino igual de corto: es
   * justo lo que la tabla comparativa promete («Sí, en peso» / «Sí, si h es admisible»).
   */
  test('caso normal — A* y Dijkstra en el laberinto dan coste 5 por caminos mínimos distintos', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Laberinto' }).click();
    await expect(nodos(page)).toHaveCount(12);
    await expect(aristas(page)).toHaveCount(14);

    await ejecutar(page, 'astar');
    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → B → C → G → H → L');
    expect(await metrica(page, 'Coste total')).toBe('5');
    expect(await metrica(page, 'Longitud del camino')).toBe('5aristas');
    expect(await metrica(page, 'Nodos visitados')).toBe('12');
    expect(await metrica(page, 'Aristas exploradas')).toBe('27');

    await ejecutar(page, 'dijkstra');
    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → B → C → D → H → L');
    expect(await metrica(page, 'Coste total')).toBe('5');
    expect(await metrica(page, 'Nodos visitados')).toBe('12');
    expect(await metrica(page, 'Aristas exploradas')).toBe('27');
  });

  /**
   * CASO NORMAL (2) — A* en el grafo denso PODA: 7 nodos visitados frente a los 8 de Dijkstra.
   *
   * Con h admisible (k = 1 / 137,77 px, la cuerda de B-C y F-G, de peso 1):
   *   h(A) 1 · h(B) 1,84 · h(C) 2,41 · h(D) 2,61 · h(E) 2,41 · h(F) 1,84 · h(G) 1 · h(H) 0
   * A(f=1) → B g4 f5,84 · C g2 f4,41 · D g7 f9,61 · E g9 f11,41 (4 exploradas)
   * C(4,41) → B g3 f4,84 · D g5 f7,61 · F g8 f9,84 (8)
   * B(4,84) → E g8 f10,41 · F g7 f8,84 (12)
   * D(7,61) → G g9 f10 (15)
   * F(8,84) → G g8 f9 · H g10 f10 ; E por F daría 9, no mejora (20)
   * G(9) → H por G daría 13, no mejora (23)
   * H(10) → fin. E (f 10,41) no llega a extraerse.
   * Camino A → C → B → F → H, coste 10 (el mismo óptimo del caso 1), 7 visitados, 23 exploradas.
   */
  test('caso normal — A* en el grafo denso llega al óptimo 10 visitando 7 nodos y 23 aristas', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grafo denso' }).click();
    await ejecutar(page, 'astar');
    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → C → B → F → H');
    expect(await metrica(page, 'Coste total')).toBe('10');
    expect(await metrica(page, 'Nodos visitados')).toBe('7');
    expect(await metrica(page, 'Aristas exploradas')).toBe('23');
  });

  /**
   * CASO LÍMITE — grafo DIRIGIDO sin salida desde el origen.
   *
   * En el denso marcado como dirigido, las tres aristas de H son de LLEGADA (E→H, F→H, G→H).
   * Con origen H y destino A, A* extrae H, no tiene ninguna arista de salida que explorar y
   * el conjunto abierto queda vacío: no existe camino. Visitados 1 (H), exploradas 0, y sin
   * camino no hay coste ni longitud: «—».
   */
  test('caso límite — A* dirigido de H a A: no existe camino, 1 visitado y 0 aristas', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grafo denso' }).click();
    await page.getByLabel('Dirigido').check();
    await page.getByRole('button', { name: 'Marcar origen' }).click();
    await nodo(page, 'H').click();
    await page.getByRole('button', { name: 'Marcar destino' }).click();
    await nodo(page, 'A').click();

    await ejecutar(page, 'astar');
    await expect(page.locator('[class*="descripcionPaso"]')).toContainText('No existe camino de H a A.');
    expect(await metrica(page, 'Coste total')).toBe('—');
    expect(await metrica(page, 'Longitud del camino')).toBe('—aristas');
    expect(await metrica(page, 'Nodos visitados')).toBe('1');
    expect(await metrica(page, 'Aristas exploradas')).toBe('0');
    await expect(page.locator('[class*="resultValue"]')).toHaveCount(0);
  });

  /**
   * CASO DE RECHAZO — peso 0 o negativo (la trampa clásica de Dijkstra) y arista duplicada.
   *
   * El deslizador de peso va de 1 a 99: pedirle 0 o −5 debe quedarse en 1, y la arista nace
   * con peso 1, nunca con un peso que rompa Dijkstra. En el denso (no dirigido), B→A es la
   * misma arista que A-B y debe rechazarse: siguen 15.
   *
   * Después se añade A-H con ese peso 1 y se ejecuta Dijkstra de A a H, a mano:
   *   extrae A(0) → relaja B=4, C=2, D=7, E=9 y H=1 (5 aristas exploradas)
   *   extrae H(1), la mínima → es el destino.
   *   Camino A → H, coste 1, 1 arista, 2 visitados, 5 exploradas.
   */
  test('caso de rechazo — peso 0 y −5 se quedan en 1, y la arista duplicada no se añade', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grafo denso' }).click();
    await page.getByRole('button', { name: 'Añadir arista' }).click();

    const peso = page.locator('#peso-slider');
    await sembrarValor(page, peso, 50); // parte de otro valor: sembrar el 1 inicial no probaría nada
    expect(await sembrarValorAcotado(page, peso, 0)).toBe('1');
    await sembrarValor(page, peso, 50);
    expect(await sembrarValorAcotado(page, peso, -5)).toBe('1');
    await expect(page.locator('[class*="pesoValue"]')).toHaveText('1');

    // B→A duplica A-B en un grafo no dirigido: se descarta.
    await nodo(page, 'B').click();
    await nodo(page, 'A').click();
    await expect(aristas(page)).toHaveCount(15);

    // A-H no existe: se añade con el peso 1 que dejó el deslizador.
    await nodo(page, 'A').click();
    await nodo(page, 'H').click();
    await expect(aristas(page)).toHaveCount(16);

    await ejecutar(page, 'dijkstra');
    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → H');
    expect(await metrica(page, 'Coste total')).toBe('1');
    expect(await metrica(page, 'Longitud del camino')).toBe('1aristas');
    expect(await metrica(page, 'Nodos visitados')).toBe('2');
    expect(await metrica(page, 'Aristas exploradas')).toBe('5');
  });

  /**
   * REGRESIÓN 2376 — REPARADO (28/09/2026). Descrito tal como era: la tabla de A* mostraba h
   * y f en formato de EE. UU. y con el error de coma flotante a la vista.
   *
   * Desde la reparación del 26/08, h(n) = ⌊100 · k · distancia⌋ / 100 es un decimal, y la tabla
   * lo pintaba con `{tabla[id].h}` y `{tabla[id].f}` a pelo, sin `formatNumber`. En el denso, al
   * final de A* de A a H, la fila de D debe decir h = 2,61 y f = 7,61:
   *   h(D) = ⌊100 · 360 / 137,77⌋ / 100 = ⌊261,3⌋ / 100 = 2,61 (D y H son diametralmente
   *   opuestos: 360 px) · g(D) = 5 (A-C-D, 2 + 3) · f = 5 + 2,61 = 7,61.
   * La app mostraba «2.61» y «7.609999999999999». Lo mismo en el laberinto (C: f =
   * 3.8899999999999997) y en los textos del paso («C(f=4.41)», «h[A] = 3.4»). CLAUDE.md §2:
   * coma decimal, nunca formato US.
   *
   * Lo que se afirma, todo resuelto a mano en los casos normales de arriba:
   *   · Denso, fila D al final: g 5 · h 2,61 · f 7,61. Los enteros van sin decimales (g 5, y
   *     la fila H: h 0 · f 10), los decimales con dos.
   *   · Denso, paso 1: «h[A] = 1, f = 1» (A y H son vecinos en el círculo: su cuerda es la
   *     misma de B-C, la arista de peso 1 que fija k, así que h(A) = 1 exacto). Paso 3: el
   *     conjunto abierto, ordenado por f, es C(f=4,41) · B(f=5,84) · D(f=9,61) · E(f=11,41).
   *   · Laberinto, fila C: g 2 · h 1,89 · f 3,89; paso 1: «h[A] = 3,40, f = 3,40».
   *   · Laberinto, fila I: g 2 · h 3 · f 5. I (120, 400) y L (680, 400) están a 560 px y
   *     k = 1 / 186,67, así que h(I) = 3 exacto; el truncado a centésimas lo dejaba en 2,99
   *     porque el producto en coma flotante sale 2,9999999999999996 (el mismo ruido, que el
   *     truncado convertía en una centésima entera).
   */
  test('REGRESIÓN 2376 — la tabla de A* escribe h y f con coma decimal y sin restos de coma flotante', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grafo denso' }).click();
    await ejecutar(page, 'astar');
    expect(await filaTablaA(page, 'D')).toEqual(['D', '5', '2,61', '7,61']);
    expect(await filaTablaA(page, 'H')).toEqual(['H', '10', '0', '10']);

    // Los textos de los pasos, retrocediendo al principio.
    const descripcion = page.locator('[class*="descripcionPaso"]');
    const paso = page.getByRole('button', { name: 'Paso', exact: true });
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(descripcion).toContainText('Inicio: g[A] = 0, h[A] = 1, f = 1.');
    await paso.click();
    await paso.click();
    await expect(descripcion).toContainText(
      'Expandimos vecinos: B(g=4, f=5,84), C(g=2, f=4,41), D(g=7, f=9,61), E(g=9, f=11,41).',
    );
    await expect(page.locator('[class*="auxItem"]')).toHaveText([
      'C(f=4,41)',
      'B(f=5,84)',
      'D(f=9,61)',
      'E(f=11,41)',
    ]);

    await page.getByRole('button', { name: 'Laberinto' }).click();
    await ejecutar(page, 'astar');
    expect(await filaTablaA(page, 'C')).toEqual(['C', '2', '1,89', '3,89']);
    expect(await filaTablaA(page, 'I')).toEqual(['I', '2', '3', '5']);
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(descripcion).toContainText('Inicio: g[A] = 0, h[A] = 3,40, f = 3,40.');
  });

  /**
   * REGRESIÓN 2375, con ratón — el nodo se crea en el clic y no al pulsar, así que arrastrar
   * sobre el fondo del lienzo (un gesto, no un clic) no deja ningún nodo. Un clic quieto sí.
   * Con ratón, un arrastre SÍ termina en `click` (pulsar y soltar sobre el mismo <svg>): por
   * eso la app descarta además todo gesto que se desplace más de 8 px.
   * Punto de partida: (320, 107,5) del viewBox, el fondo entre B, C, G y H de la cuadrícula.
   */
  test('REGRESIÓN 2375 — con ratón, arrastrar sobre el fondo no crea nodo y un clic sí', async ({ page }) => {
    await abrir(page);
    await expect(nodos(page)).toHaveCount(25);
    const svg = page.locator('[class*="editorSvg"]');
    // Sin esto el lienzo queda por debajo de los 720 px de la vista y el ratón pulsaría en el
    // vacío: el arrastre «pasaría» sin haber tocado el lienzo.
    await svg.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'auto' }));
    const caja = await svg.boundingBox();
    if (!caja) throw new Error('el lienzo no tiene caja');
    const x = caja.x + (320 * caja.width) / 800;
    const y = caja.y + (107.5 * caja.height) / 500;

    // Testigo de que el gesto llega de verdad al lienzo: el `click` que emite el navegador.
    await svg.evaluate((el) => {
      el.addEventListener('click', () => el.setAttribute('data-clics', String(Number(el.getAttribute('data-clics') ?? 0) + 1)));
    });
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 60, y + 20, { steps: 6 });
    await page.mouse.up();
    await expect(svg).toHaveAttribute('data-clics', '1');
    await page.waitForTimeout(300); // la comprobación es instantánea a propósito
    expect(await nodos(page).count()).toBe(25);

    await page.mouse.click(x, y);
    await expect(nodos(page)).toHaveCount(26);
    expect((await etiquetas(page)).slice(-1)).toEqual(['Z']);
  });

  /**
   * REGRESIÓN 2374, en escritorio — el reparto de tamaños por escala no encoge nada aquí.
   * A 1280 px el lienzo mide 662 px (escala 0,828): los nodos conservan su radio de 22
   * unidades (36,4 px) y los pesos suben de 9,1 a 11 px, el mínimo común a todos los anchos.
   */
  test('REGRESIÓN 2374 — en escritorio los nodos no cambian (36 px) y los pesos miden 11 px', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grafo denso' }).click();
    const medidas = await medirLienzo(page);
    expect(medidas.anchoLienzo).toBeGreaterThan(600);
    expect(medidas.diametroNodo).toBeCloseTo(36.4, 0);
    expect(medidas.fuentePeso).toBeCloseTo(11, 0);
  });
});

test.describe('Inspector 28/09/2026 — móvil 390 px (toque)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /**
   * CANDADO (lo que en móvil SÍ funciona): todo el flujo a toques, sin ratón.
   * Grafo denso → «Añadir arista» → tocar A y H (peso 1 por defecto) → A* → Ejecutar.
   * A mano: k no cambia (A-H es una cuerda de 137,77 px con peso 1, el mismo cociente mínimo);
   * A(f=1) relaja B, C, D, E y H(g=1, f=1) con 5 aristas; H es la de menor f → fin.
   * Camino A → H, coste 1, 2 visitados, 5 exploradas.
   */
  test('móvil — crear una arista y ejecutar A* solo con toques', async ({ page }) => {
    await abrir(page);
    await tocar(page.getByRole('button', { name: 'Grafo denso' }));
    await expect(aristas(page)).toHaveCount(15);
    await tocar(page.getByRole('button', { name: 'Añadir arista' }));
    await expect(page.getByRole('button', { name: 'Añadir arista' })).toHaveAttribute('aria-pressed', 'true');
    await tocar(nodo(page, 'A'));
    await tocar(nodo(page, 'H'));
    await expect(aristas(page)).toHaveCount(16);

    await tocar(page.getByRole('button', { name: ALGORITMO.astar }));
    await tocar(page.locator('[class*="calcBtn"]'));
    await sembrarValor(page, '#vel-slider', 100);
    await expect
      .poll(async () => {
        const t = await page.locator('[class*="descripcionPaso"]').innerText();
        const m = t.match(/Paso\s+(\d+)\s*\/\s*(\d+)/);
        return m ? m[1] === m[2] : false;
      }, { timeout: 30000 })
      .toBe(true);
    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → H');
    expect(await metrica(page, 'Coste total')).toBe('1');
    expect(await metrica(page, 'Nodos visitados')).toBe('2');
    expect(await metrica(page, 'Aristas exploradas')).toBe('5');
  });

  /**
   * REGRESIÓN 2374 — REPARADO (28/09/2026). Descrito tal como era: en un móvil de 390 px el
   * grafo no se podía leer.
   *
   * El lienzo es un SVG de viewBox fijo 800 × 500 metido dentro de cuatro rellenos anidados
   * (.container 16 px + .main 32 px + .panel 24 px + .editorContainer 16 px, más bordes): le
   * quedaban 212 px de ancho, escala 0,265. Los tamaños en pantalla salían de multiplicar por ella:
   *   · peso de arista: 11 × 0,265 = 2,9 px (en escritorio a 1366 px: 11 × 0,828 = 9,1 px)
   *   · letra del nodo: 14 × 0,265 = 3,7 px
   *   · diámetro del nodo: 44 × 0,265 = 11,7 px
   * Lo que se afirma es lo mínimo para usar el simulador con el dedo: que los pesos se lean al
   * menos como en escritorio (≥ 9 px) y que cada nodo mida al menos 24 px, el tamaño de
   * objetivo de WCAG 2.5.8. Medido tras la reparación: lienzo de 316 px, pesos de 11 px,
   * letras de 12 px y nodos de 26 px.
   *
   * Y como el reparto se hace con la escala REAL del lienzo, no con un punto de corte, se
   * repite la medida girando a un móvil de 360 px sin recargar (lienzo de 286 px).
   */
  test('REGRESIÓN 2374 — en 390 px los pesos se leen (≥ 9 px) y los nodos se pueden tocar (≥ 24 px)', async ({ page }) => {
    await abrir(page);
    await tocar(page.getByRole('button', { name: 'Grafo denso' }));
    const en390 = await medirLienzo(page);
    expect(en390.anchoLienzo).toBeGreaterThanOrEqual(300); // antes: 212 px
    expect(en390.fuentePeso).toBeGreaterThanOrEqual(9); // antes: 2,9 px
    expect(en390.fuenteNodo).toBeGreaterThanOrEqual(9); // antes: 3,7 px
    expect(en390.diametroNodo).toBeGreaterThanOrEqual(24); // antes: 11,7 px

    await page.setViewportSize({ width: 360, height: 780 });
    await expect.poll(async () => (await medirLienzo(page)).anchoLienzo).toBeLessThan(300);
    await expect.poll(async () => (await medirLienzo(page)).diametroNodo).toBeGreaterThanOrEqual(24);
    const en360 = await medirLienzo(page);
    expect(en360.fuentePeso).toBeGreaterThanOrEqual(9);
    expect(en360.fuenteNodo).toBeGreaterThanOrEqual(9);
  });

  /**
   * REGRESIÓN 2374 — borrar una arista con el dedo es fiable, y el toque se lo lleva la arista
   * MÁS CERCANA, no la que se dibujó encima.
   *
   * Antes, un toque en el punto medio exacto de A-D no la borraba: la línea medía medio píxel.
   * La trampa de la solución obvia (una diana transparente y gruesa por arista) está en este
   * mismo grafo: B-E cruza A-D a 28,6 unidades de su punto medio, con un ángulo de 45°, así que
   * pasa a 20 unidades (8 px en 390) de ese punto medio y se dibuja DESPUÉS. Con dianas de 24 px
   * el toque en el centro de A-D habría borrado B-E. Aquí:
   *   · toque en el centro de A-D → se va A-D (15 → 14) y B-E sigue;
   *   · toque a 10 px de G-H, por fuera del círculo (no hay otra arista cerca) → se va G-H
   *     (14 → 13): no hace falta acertar en la línea;
   *   · toque en el hueco vacío de la izquierda (x = 64 del viewBox, lejos de G y de sus
   *     aristas), a más de 16 px de toda arista → no se borra nada.
   */
  test('REGRESIÓN 2374 — borrar una arista con el dedo: gana la más cercana', async ({ page }) => {
    await abrir(page);
    await tocar(page.getByRole('button', { name: 'Grafo denso' }));
    // `exact`: en modo eliminar, cada nodo se anuncia con «… Pulsa Intro para eliminar este nodo».
    await tocar(page.getByRole('button', { name: 'Eliminar', exact: true }));
    await expect(page.getByRole('button', { name: 'Eliminar', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const svg = page.locator('[class*="editorSvg"]');
    await svg.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'auto' }));
    await expect(aristas(page)).toHaveCount(15);

    const ad = await geometriaArista(page, 'A', 'D');
    await page.touchscreen.tap(ad.x, ad.y);
    await expect(aristas(page)).toHaveCount(14);
    expect(await aristasPresentes(page)).not.toContain('A__D');
    expect(await aristasPresentes(page)).toContain('B__E');

    const gh = await geometriaArista(page, 'G', 'H');
    await page.touchscreen.tap(gh.x + gh.nx * 10, gh.y + gh.ny * 10);
    await expect(aristas(page)).toHaveCount(13);
    expect(await aristasPresentes(page)).not.toContain('G__H');

    const caja = await svg.boundingBox();
    if (!caja) throw new Error('el lienzo no tiene caja');
    await page.touchscreen.tap(caja.x + caja.width * 0.08, caja.y + caja.height * 0.5);
    await page.waitForTimeout(300); // instantánea a propósito: no debe pasar nada
    expect(await aristas(page).count()).toBe(13);
  });

  /**
   * REGRESIÓN 2375 — REPARADO (28/09/2026). Descrito tal como era: deslizar el dedo sobre el
   * lienzo para bajar por la página dejaba un nodo fantasma.
   *
   * En el modo por defecto, «Añadir nodo», el nodo se creaba en `onPointerDown` del SVG, y el
   * lienzo llevaba `touch-action: none` (necesario para arrastrar en modo «Mover»). Un
   * deslizamiento vertical que empezaba en el fondo del lienzo no desplazaba la página y SÍ
   * creaba un nodo: en la cuadrícula 5 × 5 de arranque, 25 → 26 nodos («Z») y la vista no se
   * movía. La pista dice «haz clic en el lienzo»: un deslizamiento no es un clic.
   * Punto de partida: (320, 107,5) del viewBox, el centro de la celda entre B, C, G y H, a
   * 47,5 unidades de la arista más cercana: fondo del lienzo, no un nodo ni una arista.
   *
   * Se afirman las dos mitades del defecto: ni nodo nuevo, ni página quieta (el dedo sube
   * 250 px; se exige que la página baje al menos 100, sin fijar la cifra exacta, que depende
   * de la inercia que simule el navegador).
   */
  test('REGRESIÓN 2375 — un deslizamiento que empieza en el lienzo no crea nodos y desplaza la página', async ({ page }) => {
    await abrir(page);
    const svg = page.locator('[class*="editorSvg"]');
    await svg.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'auto' }));
    await expect(page.getByRole('button', { name: 'Añadir nodo' })).toHaveAttribute('aria-pressed', 'true');
    await expect(nodos(page)).toHaveCount(25);

    const caja = await svg.boundingBox();
    if (!caja) throw new Error('el lienzo no tiene caja');
    const x = caja.x + (320 * caja.width) / 800;
    const y0 = caja.y + (107.5 * caja.height) / 500;
    const scrollAntes = await page.evaluate(() => window.scrollY);
    await deslizarDedo(page, x, y0, -250);
    // Margen para que React pinte lo que el gesto haya provocado: la comprobación de abajo
    // es instantánea a propósito, porque un `toHaveCount(25)` con reintentos podría darse por
    // bueno ANTES de que el nodo fantasma apareciera.
    await page.waitForTimeout(500);

    expect(await nodos(page).count()).toBe(25); // antes: 26, con el nodo «Z» donde empezó el dedo
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollAntes + 100); // antes: no se movía
  });

  /**
   * REGRESIÓN 2375 — lo que la reparación NO debe romper: un toque quieto en el fondo del
   * lienzo sigue creando un nodo (ahora en el `click`, que el navegador solo emite si el gesto
   * fue un toque). Mismo punto que arriba: 25 → 26, y el nuevo es «Z».
   */
  test('REGRESIÓN 2375 — un toque en el fondo del lienzo sigue creando un nodo', async ({ page }) => {
    await abrir(page);
    const svg = page.locator('[class*="editorSvg"]');
    await svg.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'auto' }));
    await expect(nodos(page)).toHaveCount(25);
    const caja = await svg.boundingBox();
    if (!caja) throw new Error('el lienzo no tiene caja');
    await page.touchscreen.tap(caja.x + (320 * caja.width) / 800, caja.y + (107.5 * caja.height) / 500);
    await expect(nodos(page)).toHaveCount(26);
    expect((await etiquetas(page)).slice(-1)).toEqual(['Z']);
  });

  /**
   * REGRESIÓN 2375 — en modo «Mover», el arrastre de un nodo SÍ se queda el gesto (el nodo
   * sigue al dedo y la página no se mueve), pero un deslizamiento que empieza en el FONDO del
   * lienzo desplaza la página igual que en los demás modos.
   *
   * No se puede resolver con touch-action en los nodos: Chromium lo ignora en los hijos de un
   * <svg> (medido el 28/09/2026 en una página en blanco). La app cancela el desplazamiento
   * con un touchmove no pasivo, y solo mientras hay un nodo agarrado.
   * A está en (80, 60) del viewBox; el dedo baja 60 px de pantalla, que en un lienzo de 316 px
   * (escala 0,395) son unas 152 unidades: A debe acabar por debajo de y = 150.
   */
  test('REGRESIÓN 2375 — en modo Mover el nodo sigue al dedo sin desplazar la página, y el fondo desplaza', async ({ page }) => {
    await abrir(page);
    // Por su clase: en modo mover, cada nodo se anuncia con «… Usa las flechas para mover el nodo».
    const botonMover = page.locator('[class*="toolBtn"]', { hasText: 'Mover' });
    await tocar(botonMover);
    await expect(botonMover).toHaveAttribute('aria-pressed', 'true');
    const svg = page.locator('[class*="editorSvg"]');
    await svg.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'auto' }));
    const caja = await svg.boundingBox();
    if (!caja) throw new Error('el lienzo no tiene caja');
    const circuloA = nodos(page).first();

    const scrollAntes = await page.evaluate(() => window.scrollY);
    await deslizarDedo(page, caja.x + (80 * caja.width) / 800, caja.y + (60 * caja.height) / 500, 60);
    await page.waitForTimeout(300);
    expect(Number(await circuloA.getAttribute('cx'))).toBeCloseTo(80, 0);
    expect(Number(await circuloA.getAttribute('cy'))).toBeGreaterThan(150);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollAntes);

    await deslizarDedo(page, caja.x + (320 * caja.width) / 800, caja.y + (300 * caja.height) / 500, -250);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollAntes + 100);
    await expect(nodos(page)).toHaveCount(25);
  });
});
