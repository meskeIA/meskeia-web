import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector · simulador-reemplazo-paginas (primera inspección, 08/11/2026)
 *
 * Los esperados se calcularon A MANO, paso a paso, antes de ejecutar la app (tema de sistemas
 * operativos: no hay fuente oficial en la red, así que el ancla es la tabla dibujada a mano).
 *
 * Criterios de cada algoritmo, tal como los define la propia app (bloque «Cómo resolver un
 * ejercicio» y tabla comparativa):
 *   · FIFO: sale la cargada hace más tiempo; un acierto no mueve la cola.
 *   · LRU: sale la usada hace más tiempo.
 *   · Optimal: sale la que tarda más en volver a usarse (o que no vuelve; empate → el primer marco).
 *   · Clock: bit de uso a 1 al cargar y al acertar; el puntero pone a 0 los bits a 1 que pasa y
 *     reemplaza la primera con bit 0.
 *   · LFU: sale la de menor contador (cuenta desde que entra en el marco); empate → la cargada antes.
 *
 * Cadena de Belady 1 2 3 4 1 2 5 1 2 3 4 5, a mano:
 *   FIFO 3 marcos → F F F F* F* F* F* H H F* F* H = 9 fallos; marcos al final [5, 3, 4]
 *   FIFO 4 marcos → F F F F H H F* F* F* F* F* F* = 10 fallos; marcos al final [4, 5, 2, 3]
 *   LRU 3 → 10 · LRU 4 → 8 · Optimal 3 → 7 · Optimal 4 → 6
 *   Clock 3 → 9 · Clock 4 → 10 (con todos los bits a 1 degenera en FIFO: TAMBIÉN tiene la anomalía)
 *   LFU 3 → 10 · LFU 4 → 8
 *
 * Cadena por defecto 7 0 1 2 0 3 0 4 2 3 0 3 0 3 2 1 2 0 1 7 0 1 (22 referencias), 3 marcos:
 *   FIFO 15 (marcos al final [7, 0, 1]) · LRU 12 · Optimal 9 → eficiencia FIFO 9/15 = 60,0 %.
 *
 * El formato del porcentaje se mira con /[\s ]?%/ en los casos de cálculo, para que sigan en
 * verde cuando se repare el hallazgo del «%» pegado (que tiene su propio test).
 */

const RUTA = '/simulador-reemplazo-paginas/';
const BELADY = '1,2,3,4,1,2,5,1,2,3,4,5';
const POR_DEFECTO = '7,0,1,2,0,3,0,4,2,3,0,3,0,3,2,1,2,0,1,7,0,1';
// Cadena hallada con una implementación propia de LFU y comprobada a mano (ver su test)
const LFU_ANOMALIA = '3,5,2,4,6,3,2,3,5,3,4,1,6,1,3,2,6,1,6,6';

const pct = (cifra: string): RegExp => new RegExp(`^${cifra}[\\s\\u00A0]?%$`);

async function fijarMarcos(page: Page, n: number): Promise<void> {
  await sembrarValor(page, '#marcos', n);
  await expect(page.locator('label[for="marcos"] strong')).toHaveText(String(n));
}

async function fijarCadena(page: Page, texto: string): Promise<void> {
  await page.locator('#cadena').fill(texto);
  await esperarValorEnReact(page, '#cadena', texto);
}

/** El bloque de resultados de un algoritmo (su <section> con el h3 «● FIFO — …»). */
function bloque(page: Page, nombre: string): Locator {
  return page
    .locator('main section')
    .filter({ has: page.locator('h3', { hasText: new RegExp(`^● ${nombre} —`) }) });
}

function metrica(b: Locator, etiqueta: string): Locator {
  return b.locator('[role="status"] > div').filter({ hasText: etiqueta }).locator('div').nth(1);
}

async function estados(b: Locator): Promise<string[]> {
  return (await b.locator('tbody tr').last().locator('td').allTextContents()).map((t) => t.trim());
}

/** Contenido de los marcos M1..Mn en el instante t (1-based). */
async function marcosEn(b: Locator, n: number, t: number): Promise<string[]> {
  const fila = b.locator('tbody tr');
  const valores: string[] = [];
  for (let i = 0; i < n; i++) valores.push((await fila.nth(i).locator('td').nth(t - 1).textContent())?.trim() ?? '');
  return valores;
}

/** Fallos de cada algoritmo en la tabla resumen del modo comparativa. */
async function fallosComparativa(page: Page): Promise<Record<string, string>> {
  const tabla = page.locator('main table').filter({ has: page.locator('th', { hasText: 'Tasa fallos' }) });
  await expect(tabla).toBeVisible();
  const salida: Record<string, string> = {};
  for (const alg of ['Optimal', 'LRU', 'Clock', 'FIFO', 'LFU']) {
    const fila = tabla.locator('tbody tr').filter({ hasText: alg });
    salida[alg] = ((await fila.locator('td').nth(1).textContent()) ?? '').trim();
  }
  return salida;
}

const avisoApp = (page: Page): Locator => page.locator('main [role="alert"]');

test.describe('simulador-reemplazo-paginas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#cadena', '#marcos']);
  });

  test('CASO 1 (normal) · anomalía de Belady con FIFO: 9 fallos con 3 marcos y 10 con 4', async ({ page }) => {
    await page.getByRole('button', { name: 'Cadena de Belady' }).click();
    await expect(page.locator('#cadena')).toHaveValue(BELADY);
    await expect(page.locator('label[for="marcos"] strong')).toHaveText('3');

    const fifo = bloque(page, 'FIFO');
    await expect(metrica(fifo, 'Fallos de página')).toHaveText('9');
    await expect(metrica(fifo, 'Aciertos (hits)')).toHaveText('3');
    await expect(metrica(fifo, 'Tasa de fallos')).toHaveText(pct('75,0')); // 9/12
    await expect(metrica(fifo, 'Hit ratio')).toHaveText(pct('25,0'));
    await expect(metrica(fifo, 'Eficiencia vs Optimal')).toHaveText(pct('77,8')); // 7/9
    expect(await estados(fifo)).toEqual(['F', 'F', 'F', 'F*', 'F*', 'F*', 'F*', 'H', 'H', 'F*', 'F*', 'H']);
    expect(await marcosEn(fifo, 3, 12)).toEqual(['5', '3', '4']);
    await expect(avisoApp(page)).toContainText('Con 3 marcos hay menos fallos que con 4 marcos');

    await fijarMarcos(page, 4);
    await expect(metrica(fifo, 'Fallos de página')).toHaveText('10');
    await expect(metrica(fifo, 'Aciertos (hits)')).toHaveText('2');
    expect(await estados(fifo)).toEqual(['F', 'F', 'F', 'F', 'H', 'H', 'F*', 'F*', 'F*', 'F*', 'F*', 'F*']);
    expect(await marcosEn(fifo, 4, 12)).toEqual(['4', '5', '2', '3']);
    // Con 5 marcos (5 páginas distintas) serían 5 fallos: con 4 ya no hay anomalía que avisar
    await expect(avisoApp(page)).toHaveCount(0);
  });

  test('CASO 1 (normal) · los cinco algoritmos sobre la cadena de Belady, 3 y 4 marcos', async ({ page }) => {
    await page.getByRole('button', { name: 'Cadena de Belady' }).click();
    await page.getByLabel('Comparar todos los algoritmos a la vez').check();
    await expect(page.locator('#cadena')).toHaveValue(BELADY);

    expect(await fallosComparativa(page)).toEqual({ Optimal: '7', LRU: '10', Clock: '9', FIFO: '9', LFU: '10' });
    expect(await estados(bloque(page, 'Optimal'))).toEqual(['F', 'F', 'F', 'F*', 'H', 'H', 'F*', 'H', 'H', 'F*', 'F*', 'H']);
    expect(await marcosEn(bloque(page, 'Optimal'), 3, 12)).toEqual(['4', '2', '5']);
    expect(await estados(bloque(page, 'LRU'))).toEqual(['F', 'F', 'F', 'F*', 'F*', 'F*', 'F*', 'H', 'H', 'F*', 'F*', 'F*']);
    expect(await marcosEn(bloque(page, 'LRU'), 3, 12)).toEqual(['3', '4', '5']);
    expect(await marcosEn(bloque(page, 'LFU'), 3, 12)).toEqual(['5', '1', '2']);

    await fijarMarcos(page, 4);
    // Clock pasa de 9 a 10: la anomalía de Belady no es exclusiva de FIFO
    expect(await fallosComparativa(page)).toEqual({ Optimal: '6', LRU: '8', Clock: '10', FIFO: '10', LFU: '8' });
  });

  test('CASO 1 bis (normal) · cadena por defecto con 3 marcos: FIFO 15, LRU 12, Optimal 9', async ({ page }) => {
    await expect(page.locator('#cadena')).toHaveValue(POR_DEFECTO);
    const fifo = bloque(page, 'FIFO');
    await expect(metrica(fifo, 'Fallos de página')).toHaveText('15');
    await expect(metrica(fifo, 'Aciertos (hits)')).toHaveText('7');
    await expect(metrica(fifo, 'Eficiencia vs Optimal')).toHaveText(pct('60,0')); // 9/15
    expect(await marcosEn(fifo, 3, 22)).toEqual(['7', '0', '1']);
    expect(await marcosEn(fifo, 3, 11)).toEqual(['0', '2', '3']);

    await page.locator('main button[aria-pressed]').filter({ hasText: 'Least Recently Used' }).click();
    await expect(metrica(bloque(page, 'LRU'), 'Fallos de página')).toHaveText('12');
    await page.locator('main button[aria-pressed]').filter({ hasText: 'Algoritmo óptimo' }).click();
    await expect(metrica(bloque(page, 'Optimal'), 'Fallos de página')).toHaveText('9');
  });

  test('CASO 1 ter (normal) · LFU con contador desde la carga: 10 fallos con 4 marcos y 11 con 5', async ({ page }) => {
    // A mano, 4 marcos: fallos en t1-t6, t9, t11, t12, t13 = 10 (desde t14 todo acierta).
    // 5 marcos: t1-t5 y luego 1 y 6 se expulsan entre sí en el único marco con contador 1
    // (t12, t13, t14, t17, t18, t19) = 11. Es la anomalía de Belady en LFU.
    await fijarCadena(page, LFU_ANOMALIA);
    await page.getByLabel('Comparar todos los algoritmos a la vez').check();
    await fijarMarcos(page, 4);
    expect((await fallosComparativa(page)).LFU).toBe('10');
    await fijarMarcos(page, 5);
    expect((await fallosComparativa(page)).LFU).toBe('11');
  });

  test('CASO 2 (límite) · 1 marco: cada cambio de página es un fallo en los cinco algoritmos', async ({ page }) => {
    // 0 F · 0 H · 99 F* · 99 H · 0 F* → 3 fallos, 2 aciertos, 60,0 % / 40,0 %, eficiencia 100 %
    await fijarCadena(page, '0,0,99,99,0');
    await fijarMarcos(page, 1);
    await expect(page.getByText('5 referencias · 2 páginas distintas')).toBeVisible();
    const fifo = bloque(page, 'FIFO');
    await expect(metrica(fifo, 'Fallos de página')).toHaveText('3');
    await expect(metrica(fifo, 'Aciertos (hits)')).toHaveText('2');
    await expect(metrica(fifo, 'Tasa de fallos')).toHaveText(pct('60,0'));
    await expect(metrica(fifo, 'Hit ratio')).toHaveText(pct('40,0'));
    await expect(metrica(fifo, 'Eficiencia vs Optimal')).toHaveText(pct('100,0'));
    expect(await estados(fifo)).toEqual(['F', 'H', 'F*', 'H', 'F*']);
    expect((await fifo.locator('tbody tr').first().locator('td').allTextContents()).map((t) => t.trim())).toEqual([
      '0', '0', '99', '99', '0',
    ]);

    await page.getByLabel('Comparar todos los algoritmos a la vez').check();
    expect(await fallosComparativa(page)).toEqual({ Optimal: '3', LRU: '3', Clock: '3', FIFO: '3', LFU: '3' });
    await expect(avisoApp(page)).toHaveCount(0);
  });

  test('CASO 2 (límite) · 10 marcos (máximo) y 60 referencias (máximo)', async ({ page }) => {
    // La cadena por defecto tiene 6 páginas distintas (7, 0, 1, 2, 3, 4): con 10 marcos solo
    // fallan las 6 primeras cargas, en todos los algoritmos.
    await page.getByLabel('Comparar todos los algoritmos a la vez').check();
    await fijarMarcos(page, 10);
    expect(await fallosComparativa(page)).toEqual({ Optimal: '6', LRU: '6', Clock: '6', FIFO: '6', LFU: '6' });
    await expect(bloque(page, 'FIFO').locator('tbody tr')).toHaveCount(11); // M1..M10 + Estado
    await expect(avisoApp(page)).toHaveCount(0);

    const sesenta = Array.from({ length: 60 }, (_, i) => i % 7).join(',');
    await fijarCadena(page, sesenta);
    await expect(page.getByText('60 referencias · 7 páginas distintas')).toBeVisible();
    await expect(avisoApp(page)).toHaveCount(0);
  });

  test('CASO 3 (rechazo) · fuera de 0-99, texto, vacía o más de 60 referencias', async ({ page }) => {
    const casos: [string, string][] = [
      ['1,2,100', 'Valor no válido: "100". Usa enteros entre 0 y 99.'],
      ['1,-1,2', 'Valor no válido: "-1". Usa enteros entre 0 y 99.'],
      ['1,2,a', 'Valor no válido: "a". Usa enteros entre 0 y 99.'],
      ['', 'La cadena está vacía'],
      [Array.from({ length: 61 }, (_, i) => i % 7).join(','), 'Máximo 60 referencias'],
    ];
    for (const [entrada, mensaje] of casos) {
      await fijarCadena(page, entrada);
      await expect(avisoApp(page)).toHaveText(mensaje);
      // Sin cadena válida no hay ningún resultado en pantalla
      await expect(page.locator('main [role="status"]')).toHaveCount(0);
    }
    await fijarCadena(page, BELADY);
    await expect(avisoApp(page)).toContainText('Anomalía de Belady');
    await expect(metrica(bloque(page, 'FIFO'), 'Fallos de página')).toHaveText('9');
  });

  test('HALLAZGO 4211 (REPARADO) · la FAQ y la tabla dicen que Clock y LFU no tienen anomalía de Belady', async ({
    page,
  }) => {
    // La propia app da Clock 9 → 10 en su ejemplo «Cadena de Belady» (3 → 4 marcos) y LFU
    // 10 → 11 en LFU_ANOMALIA (4 → 5 marcos): los casos 1 y 1 ter de arriba. Antes el FAQPage
    // decía «Solo ocurre con el algoritmo FIFO» y la tabla educativa ponía «No en la práctica» en
    // Clock y «No» en LFU, y el aviso solo vigilaba FIFO. Ninguno de los dos es algoritmo de pila
    // tal como los simula la app.
    await page.getByRole('button', { name: 'Cadena de Belady' }).click();
    await expect(avisoApp(page)).toContainText('Anomalía de Belady detectada en FIFO y Clock');
    await fijarCadena(page, LFU_ANOMALIA);
    await fijarMarcos(page, 4);
    await expect(avisoApp(page)).toContainText('LFU');
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(jsonLd).toContain('FAQPage');
    expect(jsonLd).not.toContain('Solo ocurre con el algoritmo FIFO');
    const tabla = page.locator('table').filter({ has: page.locator('th', { hasText: 'Anomalía Belady' }) });
    const celda = (alg: string): Locator => tabla.locator('tbody tr').filter({ hasText: alg }).locator('td').nth(4);
    expect(((await celda('Clock').textContent()) ?? '').trim()).not.toMatch(/^No\b/);
    expect(((await celda('LFU').textContent()) ?? '').trim()).not.toMatch(/^No\b/);
  });

  test('HALLAZGO 4212 (REPARADO) · el porcentaje va pegado a la cifra: «75,0%»', async ({ page }) => {
    // Formato español (RAE 2010, CLAUDE.md §2): «75,0 %» con espacio duro U+00A0.
    await page.getByRole('button', { name: 'Cadena de Belady' }).click();
    await expect(metrica(bloque(page, 'FIFO'), 'Eficiencia vs Optimal')).toHaveText('77,8 %');
    await page.getByLabel('Comparar todos los algoritmos a la vez').check();
    const resumen = page.locator('main table').filter({ has: page.locator('th', { hasText: 'Tasa fallos' }) });
    await expect(resumen.locator('tbody tr').filter({ hasText: 'FIFO' }).locator('td').nth(2)).toHaveText('75,0 %');
    await expect(metrica(bloque(page, 'FIFO'), 'Tasa de fallos')).toHaveText('75,0 %');
  });

  test('HALLAZGO 4213 (REPARADO) · «3.0» se lee como la página 3 y «1e1» como la 10, sin avisar', async ({
    page,
  }) => {
    // La etiqueta pide «enteros 0-99 separados por coma o espacio». Number() aceptaba «3.0», «1e1»
    // y «0x0A»: «1,2,3.0,4» (un punto tecleado por una coma) salía como 4 referencias 1 2 3 4 y
    // se perdía la página 0 sin ningún aviso.
    for (const [entrada, token] of [['1,2,3.0,4', '3.0'], ['1e1', '1e1'], ['0x0A', '0x0A'], ['+5', '+5']]) {
      await fijarCadena(page, entrada);
      await expect(avisoApp(page)).toHaveText(`Valor no válido: "${token}". Usa enteros entre 0 y 99.`);
    }
    // Lo bueno sigue valiendo, también con un cero a la izquierda en dos cifras
    await fijarCadena(page, '07 7 1'); // 07 y 7 son la misma página
    await expect(page.getByText('3 referencias · 2 páginas distintas')).toBeVisible();
  });

  test('HALLAZGO 4214 (REPARADO) · el eje de la gráfica repite etiquetas: 0, 1, 1, 2, 2, 3', async ({ page }) => {
    // Con 3 fallos como máximo, las seis rayas iban en 0; 0,6; 1,2; 1,8; 2,4 y 3, y Math.round
    // las rotulaba 0, 1, 1, 2, 2, 3: la raya «1» de 0,6 no estaba a la altura de un fallo. Ahora
    // van en enteros: paso ⌈3/5⌉ = 1 → 0, 1, 2, 3.
    await fijarCadena(page, '0,0,99,99,0');
    await fijarMarcos(page, 1);
    await page.getByLabel('Comparar todos los algoritmos a la vez').check();
    const eje = page.locator('svg[aria-label="Gráfica de fallos acumulados"] text[x="42"]');
    await expect(eje).toHaveText(['0', '1', '2', '3']);
    // Cadena por defecto, 3 marcos: rayas enteras y distintas
    await fijarCadena(page, POR_DEFECTO);
    await fijarMarcos(page, 3);
    const otras = await eje.allTextContents();
    expect(otras.length).toBeGreaterThan(1);
    expect(new Set(otras).size).toBe(otras.length);
    for (const r of otras) expect(r).toMatch(/^\d+$/);
  });

  test('HALLAZGO 4215 (REPARADO) · «1 referencias · 1 páginas distintas»', async ({ page }) => {
    await fijarCadena(page, '7');
    await expect(page.getByText(/^1 referencia · 1 página distinta$/)).toBeVisible({ timeout: 2000 });
    await fijarCadena(page, '7,7');
    await expect(page.getByText(/^2 referencias · 1 página distinta$/)).toBeVisible({ timeout: 2000 });
  });

  test('HALLAZGO 4216 (REPARADO) · once emojis decorativos junto a texto sin aria-hidden', async ({ page }) => {
    // 🐧 📊 🌐 📚 de los casos de uso, 📋 🎯 🔄 ⏱️ 🧭 📈 de las buenas prácticas y el ⚠ de
    // «Errores frecuentes»: el lector de pantalla los leía antes de cada título (CLAUDE.md §5).
    // Y los «●» de color delante de cada algoritmo, que se leían «círculo negro».
    const bolitas = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('span')).filter(
          (el) => el.textContent === '●' && !el.closest('[aria-hidden="true"]'),
        ).length,
    );
    expect(bolitas).toBe(0);
    const sueltos = await page.evaluate(() => {
      const re = /\p{Extended_Pictographic}/u;
      return Array.from(document.querySelectorAll('span'))
        .filter((el) => el.children.length === 0 && re.test(el.textContent ?? '') && !el.closest('[aria-hidden="true"]'))
        .map((el) => el.textContent);
    });
    expect(sueltos).toEqual([]);
  });
});
