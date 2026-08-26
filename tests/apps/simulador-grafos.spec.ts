import { test, expect, type Page, type Locator } from '@playwright/test';

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
 * los contadores después de BORRAR (que es donde suelen mentir). Los «HALLAZGO N» van en
 * ROJO a propósito: son defectos ABIERTOS a 26/08/2026, aún sin reparar, y afirman lo que
 * debería ocurrir. `npm run test:apps` no forma parte de `npm run build`, así que no
 * detienen ningún despliegue.
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

    // Tres nodos sueltos. Se pulsa lejos del centro: ahí el texto «Lienzo vacío» se come
    // el clic (HALLAZGO 2, más abajo).
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
   * HALLAZGO 1 (cálculo, alto) — ABIERTO a 26/08/2026.
   *
   * A* devuelve un camino PEOR que Dijkstra sobre el preset que trae la propia app, y lo
   * presenta sin ninguna advertencia: «Camino A* encontrado: A → B → F → H con coste 11»
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
    // El óptimo, calculado a mano en el caso 1, es 10. La app devuelve 11.
    expect(await metrica(page, 'Coste total')).toBe('10');
    await expect(page.locator('[class*="resultValue"]')).toHaveText('A → C → B → F → H');
  });

  /**
   * HALLAZGO 2 (operativa, bajo) — ABIERTO a 26/08/2026.
   *
   * Con el lienzo vacío, el rótulo «Lienzo vacío. Carga un preset o añade nodos.» se dibuja
   * como un `<text>` SVG sin `pointer-events: none` justo en el centro del lienzo (400, 250
   * de 800×500). Como `handleSvgClick` solo crea un nodo cuando el objetivo del puntero es
   * el propio `<svg>` o un `<rect>`, pulsar sobre ese rótulo NO hace nada y no avisa de
   * nada — y el centro del lienzo es precisamente donde pulsa quien acaba de leer «haz clic
   * en el lienzo para crear un nodo nuevo». Fuera del rótulo funciona a la primera.
   *
   * Las hermanas `.nodoLabel` y `.aristaPeso` sí llevan `pointer-events: none` en el CSS
   * Module; a este rótulo se le olvidó.
   */
  test('REGRESIÓN 386 — el rótulo «Lienzo vacío» ya no se come el clic en el centro del lienzo', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Limpiar grafo' }).click();
    await page.getByRole('button', { name: 'Añadir nodo' }).click();

    await clicEnLienzo(page, 0.5, 0.5); // el centro exacto, encima del rótulo
    await expect(nodos(page)).toHaveCount(1);
  });

  /**
   * HALLAZGO 3 (accesibilidad, medio) — ABIERTO a 26/08/2026.
   *
   * Los cuatro botones que eligen algoritmo son un conmutador excluyente: el activo se
   * distingue solo por color (`.algoritmoActive`) y ninguno expone estado accesible —
   * `aria-pressed` está ausente en los 15 botones de control de la app (0 apariciones en
   * `page.tsx`). Un lector de pantalla anuncia «BFS» y «Dijkstra» igual, esté cual esté
   * seleccionado. Es la regla 2 del §5 del CLAUDE.md global; el candado
   * `npm run check:a11y-jsx` la lista como «toggle sin aria-pressed» pero solo avisa,
   * porque exige criterio.
   *
   * En la misma pasada, el candado señala 16 incumplimientos de las dos reglas unívocas
   * (emoji junto a texto sin `aria-hidden`: 🗑 Eliminar, 📍 Marcar origen, 🎯 Marcar destino,
   * ▶ Iniciar, ⏸ Pausar, ⏭ Paso y diez 💡 del bloque educativo). El fichero es de junio de
   * 2026, anterior al candado, así que es pasivo: no rompe el build.
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
