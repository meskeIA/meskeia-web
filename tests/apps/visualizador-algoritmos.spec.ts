import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

/**
 * Inspector — visualizador-algoritmos (segmento INTERACTIVA, riesgo 3, 128 usos, 184 s de estancia)
 * Primera inspección: 23/09/2026. Banco de pruebas: `next start` local sobre el build del día.
 *
 * QUÉ PROMETE LA APP
 *   · metadata.ts: «los 7 algoritmos de ordenación: Bubble, Selection, Insertion, Quick, Merge, Heap
 *     y Counting Sort. Con el pseudocódigo resaltado línea a línea, contador de comparaciones e
 *     intercambios y tu propio array». El JSON-LD añade «Tabla comparativa de complejidad, memoria
 *     y estabilidad de los 7» y «prueba casos ya ordenados, invertidos o con repetidos».
 *   · Publica, en el modo individual: Comparaciones, Intercambios, Accesos, Tiempo y «Paso X de Y»;
 *     el pseudocódigo con la línea en curso resaltada; y el panel Mejor/Promedio/Peor/Espacio.
 *     En el modo «Comparar varios a la vez»: Comparaciones, MOVIMIENTOS (intercambios + escrituras)
 *     y Pasos de cada tarjeta, sobre el mismo array.
 *   · La app NO declara qué cuenta como comparación o intercambio. Este spec usa la definición de
 *     libro: una comparación = cada comparación entre dos claves del array; un intercambio = cada
 *     intercambio efectivo entre dos posiciones distintas.
 *
 * CÓMO SE FIJA LA ENTRADA
 *   · El array por defecto es ALEATORIO (25 valores entre 5 y 99). Se fija con «O escribe tu propio
 *     array» (#array-propio: enteros del 1 al 100, entre 2 y 50) o con cuatro presets de 20 valores.
 *   · Las barras se pintan en un <canvas>: el array NO está en el DOM. El test lo lee de las props
 *     del componente SortingCanvas en el árbol vigente de React (ver `leerBarras`), que es el mismo
 *     array que la app dibuja.
 *   · La animación va de 1 000 ms/paso (velocidad 1) a 10 ms/paso (velocidad 100). Los casos sanos
 *     corren a 90 (110 ms/paso): a 100 aparece el HALLAZGO 1 y los contadores dejan de ser fiables.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (script propio con los 7 algoritmos de
 * libro y contadores propios; mismas variantes que el pseudocódigo de la app: Bubble SIN bandera de
 * salida temprana, Selection con intercambio, Quick con partición de Lomuto y pivote = último)
 *
 *   CASO 1 (normal) — 5, 3, 8, 1, 9, 2 (8 inversiones)
 *       Bubble     15 comparaciones (5+4+3+2+1) · 8 intercambios (= inversiones) → 1, 2, 3, 5, 8, 9
 *       Selection  15 comparaciones · 4 intercambios (i=3 ya tiene su mínimo)
 *       Insertion  11 comparaciones: 8 que desplazan + 3 que detienen el bucle (i=2: 5>8 no;
 *                  i=4: 8>9 no; i=5: 1>2 no). Mueve 11 valores (8 desplazamientos + 3 inserciones)
 *       Quick      10 comparaciones (5 + 3 + 2, pivotes 2, 3 y 8) · 4 intercambios efectivos
 *       Merge      11 comparaciones · 16 escrituras
 *       Heap       15 comparaciones · 10 intercambios
 *       Counting    0 comparaciones · 6 escrituras
 *
 *   CASO 2 (límite)
 *       · Inverso 50, 40, 30, 20, 10: Bubble 10 y 10 = n(n−1)/2; Insertion 10 comparaciones
 *         (todas desplazan, ninguna detiene el bucle).
 *       · Ya ordenado 10, 20, 30, 40, 50: Insertion n−1 = 4 comparaciones. Bubble SIN salida
 *         temprana (la versión que muestra el pseudocódigo) hace 10; CON salida temprana, 4.
 *       · n = 2 (7, 3): los seis algoritmos por comparación hacen 1 comparación; Counting, 0.
 *
 *   CASO 3 (rechazo) — la ayuda dice «Números enteros del 1 al 100 separados por comas»
 *       «abc», «42» (uno solo) y vacío → aviso y el array no cambia. 51 valores → aviso del
 *       máximo. «5, abc, 3, 200, 8» y «2.5, 7.9, 3» deberían avisar: hoy se aplican EN SILENCIO
 *       como 5, 3, 8 y 2, 7, 3 (HALLAZGO 5).
 *
 * LO QUE ESTÁ SANO (verificado el 23/09/2026): los 7 dejan el array ordenado en todos los casos
 * a velocidades ≤ 99; Bubble, Selection, Quick, Merge, Heap y Counting cuadran con el libro en los
 * casos 1 y 2 y en los cuatro presets (Ya ordenado, Inverso, Casi ordenado, Con duplicados); la
 * comparativa da las mismas comparaciones que la ejecución individual; la tabla de complejidades
 * está bien en lo esencial (Quick peor O(n²), Heap no estable, Selection no estable, Merge O(n)).
 *
 * HALLAZGOS (los de cálculo y operativa van con test.fail(); se voltean al repararlos)
 *   1. A velocidad 100 (10 ms/paso) el primer paso tras «Play» se ejecuta DOS veces: el temporizador
 *      llega antes de que React actualice currentStepRef/barsRef, y como executeStep muta los
 *      objetos barra compartidos, un intercambio duplicado se DESHACE. 7, 3 con un «Paso» previo y
 *      luego «Play» termina en 7, 3 (sin ordenar) con 2 intercambios; 5, 3, 8, 1, 9, 2 da 16
 *      comparaciones en vez de 15. Con pausa y reanudación, cada reanudación suma otro paso.
 *   2. Insertion Sort solo cuenta las comparaciones que desplazan: omite la que detiene el bucle
 *      (A[j] > clave falso). Ya ordenado 10…50 → 0 comparaciones (libro: 4); caso 1 → 8 (libro: 11).
 *   3. El pseudocódigo resaltado no es la línea que se ejecuta en Quick, Merge, Heap y Counting.
 *   4. El panel individual publica «Intercambios 0» para Insertion, Merge y Counting mientras la
 *      comparativa, sobre el mismo array, publica sus movimientos (11, 16 y 6 en el caso 1).
 *   5. La entrada propia descarta en silencio lo que no entiende y trunca los decimales.
 *   6. Bubble: el panel dice «Mejor O(n)» pero la versión animada no tiene salida temprana.
 *   7. «▶️ Reiniciar» aparece siempre DESHABILITADO al terminar; y en la comparativa, volver a pulsar
 *      «Empezar carrera» tras la meta hace avanzar el contador más allá del total (46 / 45).
 */

const RUTA = '/visualizador-algoritmos/';

// ─── utilidades ────────────────────────────────────────────────────────────────────────────

/**
 * Array que la app DIBUJA, leído de las props de cada SortingCanvas (el canvas no lo expone en el
 * DOM). Se recorre el árbol VIGENTE desde la raíz (`FiberRoot.current`), no la fibra colgada del
 * nodo <canvas>: esa es la de su creación y alterna con su gemela en cada render, así que la mitad
 * de las veces devuelve el array de un render atrás (medido: tras «Usar este array» leía aún el
 * array aleatorio anterior). Índice = orden en pantalla (0 = el único del modo individual).
 *
 * Espera a que el lienzo EXISTA en ese árbol en vez de leerlo una sola vez. `esperarHidratacion`
 * no lo garantiza: React pone el rastreador al input durante el RENDER de la hidratación de su
 * límite de Suspense, antes de confirmarlo, y el árbol vigente es el confirmado. Medido el
 * 23/09/2026 con la CPU a 1/20: al volver `esperarHidratacion` el árbol tenía 110 fibras, dos
 * límites aún deshidratados y 0 lienzos; medio segundo después, 951 fibras y 1 lienzo. Así falló
 * el CASO 3 de 51 valores en la suite completa («hay 0»), que lee el array antes de tocar nada.
 */
async function leerBarras(page: Page, indiceCanvas = 0): Promise<number[]> {
  let foto: { total: number; lienzo: number[] | null } = { total: 0, lienzo: null };
  try {
    await expect
      .poll(
        async () => {
          foto = await page.evaluate((indice) => {
            type Fibra = {
              memoizedProps?: { bars?: { value: number }[]; maxValue?: number } | null;
              child: Fibra | null;
              sibling: Fibra | null;
              stateNode?: { current?: Fibra };
            };
            const doc = document as unknown as Record<string, unknown>;
            const clave = Object.keys(doc).find((k) => k.startsWith('__reactContainer$'));
            const raiz = clave ? (doc[clave] as Fibra).stateNode?.current : undefined;
            if (!raiz) return { total: 0, lienzo: null };
            const lienzos: number[][] = [];
            const pila: Fibra[] = [raiz];
            while (pila.length) {
              const f = pila.pop() as Fibra;
              const p = f.memoizedProps;
              if (p && p.bars && 'maxValue' in p) lienzos.push(p.bars.map((b) => b.value));
              if (f.sibling) pila.push(f.sibling);
              if (f.child) pila.push(f.child);
            }
            return { total: lienzos.length, lienzo: lienzos[indice] ?? null };
          }, indiceCanvas);
          return foto.lienzo !== null;
        },
        { timeout: 10000 },
      )
      .toBe(true);
  } catch {
    // El mensaje del poll solo diría «esperaba true»; el de abajo dice cuántos lienzos había.
  }
  if (!foto.lienzo) throw new Error(`No hay SortingCanvas nº ${indiceCanvas} (hay ${foto.total})`);
  return foto.lienzo;
}

/** Valor de una tarjeta de métricas del modo individual, por su etiqueta. */
function metrica(page: Page, etiqueta: string | RegExp): Locator {
  return page
    .getByText(etiqueta, { exact: typeof etiqueta === 'string' })
    .locator('xpath=preceding-sibling::div[1]');
}

function contadorPasos(page: Page): Locator {
  return page.getByRole('status').filter({ hasText: /^Paso \d+ de \d+$/ });
}

/** El aviso de la propia app bajo el campo del array (no el anunciador de rutas de Next). */
function avisoArray(page: Page): Locator {
  return page.locator('label[for="array-propio"]').locator('xpath=..').getByRole('alert');
}

async function usarArray(page: Page, texto: string): Promise<void> {
  await page.locator('#array-propio').fill(texto);
  await esperarValorEnReact(page, '#array-propio', texto);
  await page.getByRole('button', { name: 'Usar este array' }).click();
}

async function elegir(page: Page, algoritmo: string): Promise<void> {
  await page.getByRole('button', { name: algoritmo, exact: true }).click();
  await expect(page.getByRole('button', { name: algoritmo, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(contadorPasos(page)).toHaveText(/^Paso 0 de \d+$/);
}

/** Pulsa Play y espera a «Paso N de N» con el botón ya en «Reiniciar». */
async function ejecutarHastaElFinal(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Play/ }).click();
  await expect(page.getByRole('button', { name: /Reiniciar/ })).toBeVisible({ timeout: 20000 });
  const texto = (await contadorPasos(page).textContent()) ?? '';
  const m = texto.match(/^Paso (\d+) de (\d+)$/);
  expect(m && m[1] === m[2], `la animación no llegó al final: «${texto}»`).toBeTruthy();
}

async function correr(page: Page, algoritmo: string): Promise<{ comparaciones: string; intercambios: string; barras: number[] }> {
  await elegir(page, algoritmo);
  await ejecutarHastaElFinal(page);
  return {
    comparaciones: (await metrica(page, 'Comparaciones').textContent()) ?? '',
    intercambios: (await metrica(page, 'Intercambios').textContent()) ?? '',
    barras: await leerBarras(page),
  };
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#array-propio', '#speed-slider']);
});

// ─── CASO 1 ────────────────────────────────────────────────────────────────────────────────

test.describe('CASO 1 (normal) — 5, 3, 8, 1, 9, 2', () => {
  test.beforeEach(async ({ page }) => {
    // 90 = 110 ms por paso: por debajo del hallazgo 1 y distinto del 50 por defecto
    await sembrarValor(page, '#speed-slider', 90);
    await usarArray(page, '5, 3, 8, 1, 9, 2');
    await expect(contadorPasos(page)).toHaveText('Paso 0 de 29'); // Bubble: 15 comp. + 8 interc. + 6 «ordenado»
    expect(await leerBarras(page)).toEqual([5, 3, 8, 1, 9, 2]);
  });

  test('Bubble, Selection y Quick cuadran con el libro y dejan 1, 2, 3, 5, 8, 9', async ({ page }) => {
    // Bubble: 5+4+3+2+1 = 15 comparaciones; 8 intercambios = 8 inversiones del array
    expect(await correr(page, 'Bubble Sort')).toEqual({ comparaciones: '15', intercambios: '8', barras: [1, 2, 3, 5, 8, 9] });
    // Selection: 15 comparaciones; 4 intercambios (en i=3 el 5 ya es el mínimo)
    expect(await correr(page, 'Selection Sort')).toEqual({ comparaciones: '15', intercambios: '4', barras: [1, 2, 3, 5, 8, 9] });
    // Quick (Lomuto, pivote = último): particiones de 5 (pivote 2), 3 (pivote 3) y 2 (pivote 8)
    // comparaciones = 10; 4 intercambios efectivos (1↔5, 2↔3 al colocar el 2, 8↔3, 9↔8)
    expect(await correr(page, 'Quick Sort')).toEqual({ comparaciones: '10', intercambios: '4', barras: [1, 2, 3, 5, 8, 9] });
  });

  test('Merge, Heap y Counting cuadran con el libro', async ({ page }) => {
    // Merge: fusiones de 1 + 2 (mitad izquierda) + 1 + 2 (mitad derecha) + 5 (fusión final) = 11
    // comparaciones; no intercambia, escribe
    expect(await correr(page, 'Merge Sort')).toEqual({ comparaciones: '11', intercambios: '0', barras: [1, 2, 3, 5, 8, 9] });
    // Heap: construir el montículo + 5 extracciones = 15 comparaciones y 10 intercambios
    expect(await correr(page, 'Heap Sort')).toEqual({ comparaciones: '15', intercambios: '10', barras: [1, 2, 3, 5, 8, 9] });
    // Counting: no compara; reescribe los 6 valores desde el recuento
    expect(await correr(page, 'Counting Sort')).toEqual({ comparaciones: '0', intercambios: '0', barras: [1, 2, 3, 5, 8, 9] });
  });

  test('HALLAZGO 2 — Insertion Sort cuenta también la comparación que detiene el bucle', async ({ page }) => {
    test.fail(true, 'HALLAZGO 2: Insertion solo emite «compare» cuando A[j] > clave; la comparación que da falso y para el «mientras» no se cuenta. Caso 1: publica 8 (= inversiones), el libro da 11.');
    const r = await correr(page, 'Insertion Sort');
    expect(r.barras).toEqual([1, 2, 3, 5, 8, 9]); // la ordenación en sí es correcta
    console.log(`[HALLAZGO 2] Insertion caso 1 → comparaciones publicadas: ${r.comparaciones} (esperado 11)`);
    // 8 comparaciones que desplazan + 3 que detienen el bucle (5>8, 8>9 y 1>2 falsas)
    expect(r.comparaciones).toBe('11');
  });
});

// ─── CASO 2 ────────────────────────────────────────────────────────────────────────────────

test.describe('CASO 2 (límite) — inverso, ya ordenado y n = 2', () => {
  test.beforeEach(async ({ page }) => {
    await sembrarValor(page, '#speed-slider', 90);
  });

  test('Inverso 50, 40, 30, 20, 10: Bubble n(n−1)/2 = 10 comparaciones y 10 intercambios', async ({ page }) => {
    await usarArray(page, '50, 40, 30, 20, 10');
    await expect(contadorPasos(page)).toHaveText('Paso 0 de 25'); // 10 + 10 + 5 «ordenado»
    expect(await correr(page, 'Bubble Sort')).toEqual({ comparaciones: '10', intercambios: '10', barras: [10, 20, 30, 40, 50] });
    // Insertion en su peor caso: las 10 comparaciones desplazan y todas las claves llegan a j = −1
    const ins = await correr(page, 'Insertion Sort');
    expect(ins.comparaciones).toBe('10');
    expect(ins.barras).toEqual([10, 20, 30, 40, 50]);
  });

  test('n = 2 (7, 3): una comparación en los seis por comparación, ninguna en Counting', async ({ page }) => {
    await usarArray(page, '7, 3');
    await expect(contadorPasos(page)).toHaveText('Paso 0 de 4');
    for (const alg of ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Quick Sort', 'Merge Sort', 'Heap Sort']) {
      const r = await correr(page, alg);
      expect({ alg, comparaciones: r.comparaciones, barras: r.barras }).toEqual({ alg, comparaciones: '1', barras: [3, 7] });
    }
    const c = await correr(page, 'Counting Sort');
    expect({ comparaciones: c.comparaciones, barras: c.barras }).toEqual({ comparaciones: '0', barras: [3, 7] });
  });

  test('HALLAZGO 2 — ya ordenado 10…50: Insertion hace n−1 = 4 comparaciones, no 0', async ({ page }) => {
    test.fail(true, 'HALLAZGO 2: en su MEJOR caso Insertion publica 0 comparaciones; el O(n) que anuncia el panel son las n−1 = 4 comparaciones que detienen el bucle.');
    await usarArray(page, '10, 20, 30, 40, 50');
    await expect(contadorPasos(page)).toHaveText('Paso 0 de 15'); // aún con Bubble: 10 comparaciones + 5 «ordenado»
    const r = await correr(page, 'Insertion Sort');
    expect(r.barras).toEqual([10, 20, 30, 40, 50]);
    console.log(`[HALLAZGO 2] Insertion ya ordenado → comparaciones publicadas: ${r.comparaciones} (esperado 4)`);
    expect(r.comparaciones).toBe('4');
  });

  test('HALLAZGO 6 — Bubble: el «Mejor» del panel y el contador sobre un array ya ordenado cuadran', async ({ page }) => {
    test.fail(true, 'HALLAZGO 6: el panel dice «Mejor O(n)» pero el Bubble animado (y su pseudocódigo) no tiene salida temprana: sobre 5 valores ya ordenados hace 10 comparaciones, no n−1 = 4.');
    await usarArray(page, '10, 20, 30, 40, 50');
    await expect(contadorPasos(page)).toHaveText('Paso 0 de 15'); // 10 comparaciones + 5 «ordenado»
    const mejor = (await page.getByText('Mejor', { exact: true }).locator('xpath=following-sibling::div[1]').textContent())?.trim();
    const r = await correr(page, 'Bubble Sort');
    expect(r.barras).toEqual([10, 20, 30, 40, 50]);
    console.log(`[HALLAZGO 6] Bubble ya ordenado → «Mejor» = ${mejor}, comparaciones = ${r.comparaciones}`);
    // Si el panel promete O(n), la versión animada debe parar tras la primera pasada sin intercambios
    // (n−1 = 4). Si se repara cambiando el panel a O(n²), las 10 de hoy son las correctas.
    expect(r.comparaciones).toBe(mejor === 'O(n)' ? '4' : '10');
  });

  test('HALLAZGO 1 — a velocidad 100, «Paso» y luego «Play» sobre 7, 3 deja el array ORDENADO', async ({ page }) => {
    test.fail(true, 'HALLAZGO 1: a 10 ms/paso el primer paso tras Play se ejecuta dos veces; el intercambio duplicado se deshace y la app termina con 7, 3 marcado como ordenado y 2 intercambios. En 5, 3, 8, 1, 9, 2 con Play directo: 16 comparaciones en vez de 15.');
    await sembrarValor(page, '#speed-slider', 100);
    await usarArray(page, '7, 3');
    await expect(contadorPasos(page)).toHaveText('Paso 0 de 4'); // comparar, intercambiar, 2 «ordenado»
    await page.getByRole('button', { name: /Paso$/ }).click();
    await expect(contadorPasos(page)).toHaveText('Paso 1 de 4');
    await ejecutarHastaElFinal(page);
    const barras = await leerBarras(page);
    const intercambios = await metrica(page, 'Intercambios').textContent();
    console.log(`[HALLAZGO 1] 7, 3 a velocidad 100 → barras ${barras.join(', ')}, intercambios ${intercambios} (esperado 3, 7 y 1)`);
    expect(barras).toEqual([3, 7]);
    expect(intercambios).toBe('1');
  });
});

// ─── CASO 3 ────────────────────────────────────────────────────────────────────────────────

test.describe('CASO 3 (rechazo) — entrada propia inválida', () => {
  test('texto, un solo número y vacío se rechazan con aviso y sin tocar el array', async ({ page }) => {
    const antes = await leerBarras(page);
    for (const texto of ['abc', '42', '']) {
      await usarArray(page, texto);
      await expect(avisoArray(page)).toHaveText('Escribe al menos 2 números enteros entre 1 y 100, separados por comas.');
      expect(await leerBarras(page)).toEqual(antes);
    }
  });

  test('51 valores se rechazan con el aviso del máximo de 50', async ({ page }) => {
    const antes = await leerBarras(page);
    await usarArray(page, Array.from({ length: 51 }, (_, i) => i + 1).join(', '));
    await expect(avisoArray(page)).toHaveText('El máximo son 50 elementos para que la animación se siga bien.');
    expect(await leerBarras(page)).toEqual(antes);
  });

  test('HALLAZGO 5 — «5, abc, 3, 200, 8» y «2.5, 7.9, 3» avisan en vez de aplicarse recortados', async ({ page }) => {
    test.fail(true, 'HALLAZGO 5: el filtro descarta en silencio «abc» y «200» (se aplica 5, 3, 8) y parseInt trunca «2.5, 7.9» a 2, 7 sin avisar.');
    await usarArray(page, '5, abc, 3, 200, 8');
    await page.waitForTimeout(300); // solo para que el diagnóstico lea el estado ya asentado
    console.log(`[HALLAZGO 5] «5, abc, 3, 200, 8» → barras ${(await leerBarras(page)).join(', ')}, avisos: ${await avisoArray(page).count()}`);
    await expect(avisoArray(page)).toBeVisible();
    await usarArray(page, '2.5, 7.9, 3');
    await expect(avisoArray(page)).toBeVisible();
  });
});

// ─── Pseudocódigo, comparativa y controles ─────────────────────────────────────────────────

test.describe('Pseudocódigo resaltado, comparativa y controles', () => {
  test('HALLAZGO 3 — la línea resaltada es la que ejecuta la operación descrita', async ({ page }) => {
    test.fail(true, 'HALLAZGO 3: Quick resalta «para j desde bajo hasta alto - 1» al comparar con el pivote; Heap resalta la asignación «mayor = 2*raíz+1»; Merge resalta «copiar A[izq..medio] a L»; Counting resalta «fin para» al contar.');
    await usarArray(page, '5, 3, 8, 1');
    const casos: { alg: string; descripcion: RegExp; linea: string }[] = [
      { alg: 'Quick Sort', descripcion: /^Comparando \d+ con pivote/, linea: 'si A[j] <= pivote entonces' },
      { alg: 'Heap Sort', descripcion: /^Hijo izquierdo/, linea: 'si A[2*raíz+1] > A[mayor] entonces' },
      { alg: 'Merge Sort', descripcion: /^Comparando \d+ con \d+$/, linea: 'fusionar L y R de vuelta a A' },
      { alg: 'Counting Sort', descripcion: /^Cuenta del valor/, linea: 'recuento[v] = recuento[v] + 1' },
    ];
    const resaltada = page.locator('[class*="highlighted"] code');
    const descripcion = page.locator('[class*="stepDescription"] p');
    for (const c of casos) {
      await elegir(page, c.alg);
      for (let paso = 1; paso <= 10; paso++) {
        await page.getByRole('button', { name: /Paso$/ }).click();
        await expect(contadorPasos(page)).toHaveText(new RegExp(`^Paso ${paso} de`));
        if (c.descripcion.test((await descripcion.textContent()) ?? '')) break;
      }
      await expect(descripcion).toHaveText(c.descripcion);
      console.log(`[HALLAZGO 3] ${c.alg} · «${await descripcion.textContent()}» → resalta «${(await resaltada.textContent())?.trim()}»`);
      await expect(resaltada).toHaveText(c.linea);
    }
  });

  test('HALLAZGO 7 — al terminar, el botón «Reiniciar» está habilitado', async ({ page }) => {
    test.fail(true, 'HALLAZGO 7: el botón muestra «▶️ Reiniciar» y a la vez disabled={finished && currentStep >= totalSteps}, que al terminar siempre se cumple.');
    await sembrarValor(page, '#speed-slider', 90);
    await usarArray(page, '7, 3');
    await expect(contadorPasos(page)).toHaveText('Paso 0 de 4');
    await ejecutarHastaElFinal(page);
    const reiniciar = page.getByRole('button', { name: /Reiniciar/ });
    console.log(`[HALLAZGO 7] al terminar, «${await reiniciar.textContent()}» disabled=${await reiniciar.isDisabled()}`);
    await expect(reiniciar).toBeEnabled();
  });

  test.describe('modo comparativa sobre 5, 3, 8, 1, 9, 2', () => {
    test.beforeEach(async ({ page }) => {
      await usarArray(page, '5, 3, 8, 1, 9, 2');
      await expect(contadorPasos(page)).toHaveText('Paso 0 de 29');
      await page.getByRole('button', { name: /Comparar varios a la vez/ }).click();
      await sembrarValor(page, '#velocidad-comparativa', 100);
    });

    const seccion = (page: Page) => page.locator('section[aria-label="Comparativa de algoritmos"]');
    const tarjeta = (page: Page, alg: string) => seccion(page).locator('h2', { hasText: alg }).locator('xpath=..');
    const dato = (page: Page, alg: string, etiqueta: string) =>
      tarjeta(page, alg).locator('span', { hasText: new RegExp(`^${etiqueta}:`) });
    const contadorCarrera = (page: Page) => seccion(page).getByText(/^Paso \d+ \/ \d+$/);

    async function carrera(page: Page): Promise<void> {
      await page.getByRole('button', { name: /Empezar carrera/ }).click();
      await expect(contadorCarrera(page)).toHaveText('Paso 45 / 45', { timeout: 15000 }); // Insertion, el más largo: 45 pasos
      await expect(page.getByRole('button', { name: /Empezar carrera/ })).toBeVisible();
    }

    test('las comparaciones de cada tarjeta cuadran con la ejecución individual (y con el libro)', async ({ page }) => {
      await carrera(page);
      // Mismas cifras que el CASO 1 individual: Bubble 15, Quick 10, Merge 11. Movimientos:
      // Bubble 8 intercambios, Quick 4, Merge 16 escrituras; los cuatro dejan 1, 2, 3, 5, 8, 9.
      await expect(dato(page, 'Bubble Sort', 'Comparaciones')).toHaveText('Comparaciones: 15');
      await expect(dato(page, 'Bubble Sort', 'Movimientos')).toHaveText('Movimientos: 8');
      await expect(dato(page, 'Quick Sort', 'Comparaciones')).toHaveText('Comparaciones: 10');
      await expect(dato(page, 'Quick Sort', 'Movimientos')).toHaveText('Movimientos: 4');
      await expect(dato(page, 'Merge Sort', 'Comparaciones')).toHaveText('Comparaciones: 11');
      await expect(dato(page, 'Merge Sort', 'Movimientos')).toHaveText('Movimientos: 16');
      // Insertion mueve 11 valores (8 desplazamientos + 3 inserciones de la clave)
      await expect(dato(page, 'Insertion Sort', 'Movimientos')).toHaveText('Movimientos: 11');
      for (let i = 0; i < 4; i++) expect(await leerBarras(page, i)).toEqual([1, 2, 3, 5, 8, 9]);
    });

    test('HALLAZGO 7 — volver a pulsar «Empezar carrera» tras la meta no pasa de 45 / 45', async ({ page }) => {
      test.fail(true, 'HALLAZGO 7: tick() incrementa el progreso aunque ya no queden pasos: 46 / 45, 47 / 45…');
      await carrera(page);
      await page.getByRole('button', { name: /Empezar carrera/ }).click();
      await page.waitForTimeout(500); // el tick de más es inmediato; se lee después, sin sondeo
      const texto = await contadorCarrera(page).textContent();
      console.log(`[HALLAZGO 7] tras volver a pulsar → «${texto}»`);
      expect(texto).toBe('Paso 45 / 45');
    });

    test('HALLAZGO 4 — el panel individual de Insertion publica los mismos 11 movimientos que la comparativa', async ({ page }) => {
      test.fail(true, 'HALLAZGO 4: el panel individual solo cuenta pasos «swap»: Insertion, Merge y Counting salen con «Intercambios 0» mientras la comparativa les cuenta 11, 16 y 6 movimientos sobre el mismo array.');
      await carrera(page);
      await expect(dato(page, 'Insertion Sort', 'Movimientos')).toHaveText('Movimientos: 11');
      await page.getByRole('button', { name: /Un algoritmo en detalle/ }).click();
      await sembrarValor(page, '#speed-slider', 90);
      await elegir(page, 'Insertion Sort');
      await ejecutarHastaElFinal(page);
      const movimientos = await metrica(page, /^(Intercambios|Movimientos)$/).textContent();
      console.log(`[HALLAZGO 4] Insertion individual → ${movimientos} (comparativa: 11)`);
      expect(movimientos).toBe('11');
    });
  });
});
