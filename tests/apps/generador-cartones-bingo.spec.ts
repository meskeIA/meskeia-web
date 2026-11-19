import { test, expect, type Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * Generador de Cartones de Bingo — inspección completa del 18/11/2026 (Inspector, modo primera).
 *
 * QUÉ PROMETE LA APP (hero, metadata, FAQPage y guía)
 *   · «Cartones únicos para imprimir en las dos modalidades, con bombo digital».
 *   · 90 bolas: 3 filas × 9 columnas, 15 números, CINCO por fila, cada columna una decena
 *     (1-9, 10-19 … 80-90) con entre 1 y 3 números, «de menor a mayor de arriba abajo».
 *   · 75 bolas: 5 × 5, 24 números y casilla libre central, columnas B-I-N-G-O.
 *   · «Hasta 40 cartones únicos y numerados por tirada»; «no hay dos cartones iguales».
 *   · El n.º de partida es la semilla: con la misma modalidad y cantidad da el juego idéntico,
 *     «si alguien pierde su cartón a media partida, o si se quiere repetir la misma sesión otro día».
 *   · Bombo digital: «extrae números sin repetición y guarda el historial completo».
 *   · «Impresión optimizada: dos cartones por fila y sin fondos de color».
 *
 * LAS REGLAS, ESCRITAS ANTES DE MIRAR LA SALIDA (el oráculo no reutiliza nada del código de la app)
 *   90 bolas · columna c: desde (c = 0 ? 1 : 10·c) hasta (c = 8 ? 90 : 10·c + 9) → la primera tiene
 *   9 números posibles y la novena 11. Por cartón: 3 filas de 9 casillas, 5 números en cada fila,
 *   1 ≤ números por columna ≤ 3, columna estrictamente creciente de arriba abajo, 15 distintos.
 *   75 bolas · columna c (B, I, N, G, O): de 15·c + 1 a 15·c + 15 → B 1-15, I 16-30, N 31-45,
 *   G 46-60, O 61-75; la casilla (fila 3, columna N) es la libre (★); 24 números distintos.
 *   Bombo: 90 extracciones dan los 90 números una vez cada uno (75 en la de 75) y después «No quedan
 *   bolas», deshabilitado.
 *
 * Barrido previo (18/11/2026): 200 cartones de 90 y 200 de 75 (partidas 1, 2, 777, 424242 y
 * 9999999, 40 cartones cada una): todos válidos y sin repetidos dentro de su tirada. Entre dos
 * cartones de 90 de una misma tirada de 40, el máximo de números en común fue 8 de 15 y el de
 * números en la misma casilla, 6. El bombo de 75 llegó a «75 de 75» y se deshabilitó.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const RUTA = '/generador-cartones-bingo/';
const DESLIZADOR = 'input[type="range"]';
const PARTIDA = 'input[inputmode="numeric"]';

interface CartonLeido {
  caption: string;
  cabecera: string[];
  filas: string[][];
}

async function leerCartones(page: Page): Promise<CartonLeido[]> {
  return page
    .locator('table')
    .filter({ has: page.locator('caption', { hasText: 'Cartón número' }) })
    .evaluateAll((tablas) =>
      tablas.map((t) => ({
        caption: t.querySelector('caption')?.textContent ?? '',
        cabecera: Array.from(t.querySelectorAll('thead th')).map((th) => (th.textContent ?? '').trim()),
        filas: Array.from(t.querySelectorAll('tbody tr')).map((tr) =>
          Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent ?? '').trim()),
        ),
      })),
    );
}

/** Rango de la columna c del cartón de 90, calculado aquí: 1-9, 10-19 … 70-79, 80-90. */
function rango90(c: number): [number, number] {
  return [c === 0 ? 1 : c * 10, c === 8 ? 90 : c * 10 + 9];
}

function erroresCarton90(filas: string[][]): string[] {
  const errores: string[] = [];
  if (filas.length !== 3) errores.push(`${filas.length} filas`);
  filas.forEach((fila, f) => {
    if (fila.length !== 9) errores.push(`fila ${f + 1} con ${fila.length} casillas`);
    const n = fila.filter((x) => x !== '').length;
    if (n !== 5) errores.push(`fila ${f + 1} con ${n} números`);
  });
  const todos: number[] = [];
  for (let c = 0; c < 9; c++) {
    const columna = filas.map((fila) => fila[c]).filter((x) => x !== '').map(Number);
    if (columna.length < 1 || columna.length > 3) errores.push(`columna ${c + 1} con ${columna.length}`);
    const [desde, hasta] = rango90(c);
    for (const x of columna) {
      if (!(x >= desde && x <= hasta)) errores.push(`columna ${c + 1} fuera de ${desde}-${hasta}: ${x}`);
    }
    for (let i = 1; i < columna.length; i++) {
      if (columna[i] <= columna[i - 1]) errores.push(`columna ${c + 1} no creciente`);
    }
    todos.push(...columna);
  }
  if (todos.length !== 15) errores.push(`${todos.length} números`);
  if (new Set(todos).size !== todos.length) errores.push('números repetidos');
  return errores;
}

function erroresCarton75(carton: CartonLeido): string[] {
  const errores: string[] = [];
  if (carton.cabecera.join('') !== 'BINGO') errores.push(`cabecera ${carton.cabecera.join(' ')}`);
  if (carton.filas.length !== 5) errores.push(`${carton.filas.length} filas`);
  const todos: number[] = [];
  for (let c = 0; c < 5; c++) {
    carton.filas.forEach((fila, f) => {
      if (fila.length !== 5) errores.push(`fila ${f + 1} con ${fila.length} casillas`);
      if (f === 2 && c === 2) {
        if (fila[c] !== '★') errores.push(`centro «${fila[c]}»`);
        return;
      }
      const x = Number(fila[c]);
      if (!(x >= 15 * c + 1 && x <= 15 * c + 15)) errores.push(`columna ${'BINGO'[c]} fuera de rango: ${fila[c]}`);
      todos.push(x);
    });
  }
  if (todos.length !== 24) errores.push(`${todos.length} números`);
  if (new Set(todos).size !== 24) errores.push('números repetidos');
  return errores;
}

async function generarPartida(page: Page, partida: string): Promise<void> {
  await page.locator(PARTIDA).fill(partida);
  await esperarValorEnReact(page, PARTIDA, partida);
  await page.getByRole('button', { name: 'Generar cartones' }).click();
}

async function cantar(page: Page, veces: number, total: number): Promise<number[]> {
  const bola = page.locator('[aria-live="polite"]', { hasText: /^(\d+|—)$/ });
  const salidos: number[] = [];
  for (let i = 1; i <= veces; i++) {
    await page.getByRole('button', { name: 'Cantar número' }).click();
    await expect(page.getByText(`${i} de ${total} bolas cantadas`)).toBeVisible();
    salidos.push(Number(await bola.textContent()));
  }
  return salidos;
}

test.describe('generador-cartones-bingo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [DESLIZADOR, PARTIDA]);
  });

  test('caso normal · 90 bolas, 6 cartones, partida 123456: cartones válidos, reproducibles y «Otra tirada» cambia de partida', async ({
    page,
  }) => {
    // 6 es el valor inicial del deslizador: no se siembra (sería una siembra que no prueba nada).
    await expect(page.getByText('Número de cartones: 6')).toBeVisible();
    await generarPartida(page, '123456');

    // Esperado: 6 cartones y la partida pedida, tal cual.
    await expect(page.locator('p', { hasText: 'cartones únicos generados' })).toHaveText(
      '6 cartones únicos generados. Partida n.º 123456.',
    );
    const cartones = await leerCartones(page);
    expect(cartones).toHaveLength(6);
    cartones.forEach((c, i) => {
      expect(c.caption).toBe(`Cartón número ${i + 1} de la partida 123456`);
      expect(c.cabecera, 'el cartón de 90 no lleva B-I-N-G-O').toEqual([]);
      expect(erroresCarton90(c.filas), `cartón ${i + 1}`).toEqual([]);
    });
    expect(new Set(cartones.map((c) => JSON.stringify(c.filas))).size, 'seis cartones distintos').toBe(6);

    // HUELLA, no cálculo: el primer cartón de la partida 123456 tal como salió el 18/11/2026. Vigila
    // la promesa «repetir exactamente la misma sesión otro día»: si el generador cambia, los n.º de
    // partida anotados por los usuarios dejan de reproducir sus cartones y esto se pone en rojo.
    expect(cartones[0].filas).toEqual([
      ['4', '12', '', '36', '42', '50', '', '', ''],
      ['', '16', '23', '', '', '', '60', '74', '80'],
      ['', '17', '29', '37', '', '', '', '75', '84'],
    ]);

    // Generar otra vez con el mismo n.º → exactamente los mismos cartones.
    await page.getByRole('button', { name: 'Generar cartones' }).click();
    expect(await leerCartones(page)).toEqual(cartones);

    // «Otra tirada» → n.º de partida nuevo (6 cifras, distinto de 123456) y el campo vacío.
    await page.getByRole('button', { name: 'Otra tirada' }).click();
    const resumen = (await page.locator('p', { hasText: 'cartones únicos generados' }).textContent()) ?? '';
    const nueva = Number(/Partida n\.º (\d+)\./.exec(resumen)?.[1]);
    expect(nueva).not.toBe(123456);
    expect(nueva).toBeGreaterThanOrEqual(100000);
    expect(nueva).toBeLessThanOrEqual(999999);
    await expect(page.locator(PARTIDA)).toHaveValue('');
  });

  test('límite · 200 cartones de 90 (5 tiradas de 40): todos cumplen las reglas y ninguno se repite en su tirada', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await sembrarValor(page, DESLIZADOR, 40);
    await expect(page.getByText('Número de cartones: 40')).toBeVisible();
    let total = 0;
    for (const partida of ['1', '2', '777', '424242', '9999999']) {
      await generarPartida(page, partida);
      await expect(page.locator('p', { hasText: 'cartones únicos generados' })).toHaveText(
        `40 cartones únicos generados. Partida n.º ${partida}.`,
      );
      const cartones = await leerCartones(page);
      expect(cartones).toHaveLength(40);
      const errores = cartones.flatMap((c, i) => erroresCarton90(c.filas).map((e) => `cartón ${i + 1}: ${e}`));
      expect(errores, `partida ${partida}`).toEqual([]);
      expect(new Set(cartones.map((c) => JSON.stringify(c.filas))).size, `partida ${partida} sin repetidos`).toBe(40);
      total += cartones.length;
    }
    expect(total).toBe(200);
  });

  test('límite · 200 cartones de 75 (5 tiradas de 40): B-I-N-G-O, rangos de 15 en 15, ★ central y sin repetidos', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.getByRole('button', { name: /75 bolas/ }).click();
    await expect(page.getByRole('button', { name: /75 bolas/ })).toHaveAttribute('aria-pressed', 'true');
    await sembrarValor(page, DESLIZADOR, 40);
    for (const partida of ['1', '2', '777', '424242', '9999999']) {
      await generarPartida(page, partida);
      await expect(page.locator('p', { hasText: 'cartones únicos generados' })).toHaveText(
        `40 cartones únicos generados. Partida n.º ${partida}.`,
      );
      const cartones = await leerCartones(page);
      expect(cartones).toHaveLength(40);
      const errores = cartones.flatMap((c, i) => erroresCarton75(c).map((e) => `cartón ${i + 1}: ${e}`));
      expect(errores, `partida ${partida}`).toEqual([]);
      expect(new Set(cartones.map((c) => JSON.stringify(c.filas))).size, `partida ${partida} sin repetidos`).toBe(40);
    }
    // Pie de la hoja: 40 cartones · nombre de la modalidad · 5 columnas.
    await expect(page.locator('p', { hasText: 'meskeia.com' }).last()).toHaveText(
      '40 cartones · 75 bolas · cartón 5×5 · 5 columnas · meskeia.com',
    );
  });

  test('límite · el bombo de 90 saca los 90 números una vez cada uno y después «No quedan bolas»', async ({ page }) => {
    test.setTimeout(120_000);
    const salidos = await cantar(page, 90, 90);
    // Esperado: el conjunto {1, …, 90} exacto, sin repetidos.
    expect([...salidos].sort((a, b) => a - b)).toEqual(Array.from({ length: 90 }, (_, i) => i + 1));
    const boton = page.getByRole('button', { name: 'No quedan bolas' });
    await expect(boton).toBeDisabled();
    await expect(page.locator('[aria-label="Números cantados"] span')).toHaveCount(90);
  });

  test('rechazo · n.º de partida «abc» o «0» no se toma como semilla, y el deslizador no pasa de 1-40', async ({
    page,
  }) => {
    for (const invalida of ['abc', '0']) {
      await generarPartida(page, invalida);
      const resumen = (await page.locator('p', { hasText: 'cartones únicos generados' }).textContent()) ?? '';
      // Esperado: partida al azar de 6 cifras (100000-999999), nunca 0 ni NaN.
      const n = Number(/Partida n\.º (\d+)\./.exec(resumen)?.[1]);
      expect(n, `«${invalida}» → ${resumen}`).toBeGreaterThanOrEqual(100000);
      expect(n, `«${invalida}» → ${resumen}`).toBeLessThanOrEqual(999999);
    }
    // El deslizador capa a su rango: 100 → 40 y 0 → 1.
    expect(await sembrarValorAcotado(page, DESLIZADOR, 100)).toBe('40');
    await expect(page.getByText('Número de cartones: 40')).toBeVisible();
    expect(await sembrarValorAcotado(page, DESLIZADOR, 0)).toBe('1');
    await expect(page.getByText('Número de cartones: 1')).toBeVisible();
  });

  test('impresión · a ancho de A4 la hoja sale a dos cartones por fila y sin los controles', async ({ page }) => {
    await sembrarValor(page, DESLIZADOR, 10);
    await generarPartida(page, '1');
    await expect(page.locator('p', { hasText: 'Partida n.º 1.' })).toBeVisible();
    await page.setViewportSize({ width: 718, height: 1000 });
    await page.emulateMedia({ media: 'print' });
    const medida = await page
      .locator('table')
      .filter({ has: page.locator('caption') })
      .first()
      .evaluate((tabla) => {
        const carton = tabla.parentElement as HTMLElement;
        const rejilla = carton.parentElement as HTMLElement;
        return {
          columnas: getComputedStyle(rejilla).gridTemplateColumns.split(' ').length,
          desborda: carton.scrollWidth > carton.clientWidth,
        };
      });
    expect(medida.columnas, 'dos cartones por fila').toBe(2);
    expect(medida.desborda, 'el cartón cabe en su media hoja').toBe(false);
    await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Generar cartones' })).toBeHidden();
  });

  // REPARADO, hallazgo 5119 (inspector 18/11/2026): la FAQ visible y el FAQPage dicen que basta
  // volver a introducir el n.º de partida para reponer un cartón perdido «a media partida». Antes
  // generar() vaciaba SIEMPRE el bombo: con 10 bolas cantadas, el contador volvía a «0 de 90».
  // Ahora la misma partida conserva lo cantado, y otra partida (otro n.º u «Otra tirada») lo vacía.
  test('HALLAZGO 5119 (18/11/2026, REPARADO) · regenerar la misma partida a media partida conserva el bombo', async ({ page }) => {
    await generarPartida(page, '123456');
    await expect(page.locator('p', { hasText: 'Partida n.º 123456.' })).toBeVisible();
    const antes = await leerCartones(page);
    await cantar(page, 10, 90);
    await page.getByRole('button', { name: 'Generar cartones' }).click();
    expect(await leerCartones(page), 'misma partida → mismos cartones').toEqual(antes);
    await expect(page.getByText('10 de 90 bolas cantadas')).toBeVisible({ timeout: 2000 });
    // Otra partida es otro juego: el bombo vuelve a cero.
    await generarPartida(page, '654321');
    await expect(page.locator('p', { hasText: 'Partida n.º 654321.' })).toBeVisible();
    await expect(page.getByText('0 de 90 bolas cantadas')).toBeVisible();
  });

  // REPARADO, hallazgo 5120 (inspector 18/11/2026): el «historial completo» del bombo solo existía
  // para la vista (div sin rol, número cantado distinguido solo por su clase). Ahora el panel es un
  // grupo con nombre que da al lector la lista de lo cantado de menor a mayor; la rejilla visual
  // queda aria-hidden. Esperado: el árbol cambia al cantar y lista exactamente lo que salió.
  test('HALLAZGO 5120 (18/11/2026, REPARADO) · el historial de números cantados llega al lector de pantalla', async ({
    page,
  }) => {
    const panel = page.getByRole('group', { name: 'Números cantados' });
    const antes = await panel.ariaSnapshot();
    const salidos = await cantar(page, 3, 90);
    const despues = await panel.ariaSnapshot();
    expect(despues, 'cantar tres números cambia lo que lee el lector').not.toBe(antes);
    expect(despues).toContain('Números cantados');
    const ordenados = [...salidos].sort((a, b) => a - b).join(', ');
    expect(despues).toContain(`3 cantados, de menor a mayor: ${ordenados}.`);
  });

  // ABIERTO, hallazgo (inspector 18/11/2026): la tabla del cartón usa table-layout automático y las
  // columnas se reparten por el ancho de su texto. Al imprimir (A4, dos por fila) la columna 1-9
  // queda en ~3,7-4,8 mm y la 10-19 en ~7,9 mm, frente a ~9,3 mm las demás; la base de impresión
  // de la familia fija 9 mm por casilla («por debajo de 8 mm la hoja se vuelve incómoda de
  // rellenar»). Esperado: las nueve columnas con el mismo ancho (±15 %).
  test('HALLAZGO (18/11/2026, ABIERTO) · al imprimir, la columna del 1 al 9 sale a menos de la mitad de ancho', async ({
    page,
  }) => {
    test.fail();
    await generarPartida(page, '1');
    await expect(page.locator('p', { hasText: 'Partida n.º 1.' })).toBeVisible();
    await page.setViewportSize({ width: 718, height: 1000 });
    await page.emulateMedia({ media: 'print' });
    const anchos = await page
      .locator('table')
      .filter({ has: page.locator('caption') })
      .evaluateAll((tablas) =>
        tablas.map((t) =>
          Array.from(t.querySelectorAll('tbody tr:first-child td')).map((td) => td.getBoundingClientRect().width),
        ),
      );
    for (const fila of anchos) {
      expect(Math.min(...fila) / Math.max(...fila)).toBeGreaterThanOrEqual(0.85);
    }
  });

  // ABIERTO, hallazgo (inspector 18/11/2026): la casilla libre del cartón de 75 pinta «★» sin texto
  // alternativo; el lector la lee como «estrella negra» en vez de «libre».
  test('HALLAZGO (18/11/2026, ABIERTO) · la casilla libre del cartón de 75 se anuncia como «estrella»', async ({ page }) => {
    test.fail();
    await page.getByRole('button', { name: /75 bolas/ }).click();
    await generarPartida(page, '1');
    const tabla = page.getByRole('table', { name: 'Cartón número 1 de la partida 1' });
    await expect(tabla, 'el cartón de 75 está en pantalla').toBeVisible();
    await expect(tabla.getByRole('cell', { name: /libre/i })).toHaveCount(1, { timeout: 2000 });
  });

  // ABIERTO, hallazgo (inspector 18/11/2026): la misma pregunta está dos veces con respuestas
  // distintas. FAQ visible «¿Puede haber dos cartones iguales?» → «No: … dos cartones distintos sí
  // pueden compartir muchos números…». FAQPage «¿Los cartones generados son distintos entre sí?» →
  // «Sí … Con 90 números … no hay repeticiones ni cartones casi idénticos» (calla la salvedad y solo
  // habla de 90 bolas). Esperado: una sola respuesta, en una constante que importen las dos.
  test('HALLAZGO (18/11/2026, ABIERTO) · la respuesta del FAQPage sobre cartones distintos no es la de la FAQ visible', async ({
    page,
  }) => {
    test.fail();
    const respuesta = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
        };
        if (j['@type'] !== 'FAQPage') continue;
        const q = (j.mainEntity ?? []).find((e) => e.name.includes('distintos entre sí'));
        if (q) return q.acceptedAnswer.text;
      }
      return '';
    });
    expect(respuesta).not.toBe('');
    const visible = (await page.locator('h4', { hasText: '¿Puede haber dos cartones iguales?' }).locator('xpath=following-sibling::p').textContent()) ?? '';
    expect(visible.replace(/\s+/g, ' ').trim()).toBe(respuesta);
  });
});
