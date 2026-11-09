import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * bingo-personalizado (S0263, 09/11/2026) — PASO 4.bis de /nueva-app-meskeia: la app tiene
 * estado de varias fases (elegir lista y tamaño → generar → sacar bolas → comprobar), así que
 * se verifican TRANSICIONES. Los cálculos (respuestas, tamaños, cartones) tienen sus casos en
 * tests/bingo-personalizado-motor.spec.ts.
 *
 *  · Estado inicial: tablas del 2 al 9 (40 respuestas), 3×5 elegido, bombo sin partida.
 *  · Sumas y restas hasta 20 tiene 20 respuestas: el 3×5 (necesita 23) se desactiva y se usa el
 *    3×4 (18), con su aviso. En juego entran las 20.
 *  · El mismo n.º de partida da el mismo cartón; «Otra tirada» da otro aunque haya un n.º escrito.
 *  · Sacadas las 20 bolas, cualquier cartón está lleno y el bombo se para.
 *  · En los juegos de clase el bombo arranca con las respuestas ocultas; en los de casa, visibles.
 *  · Una lista propia de 3 líneas no llena ningún cartón: no se puede generar.
 */

const RUTA = '/bingo-personalizado/';
const CAMPO_PARTIDA = 'input[placeholder="Al azar"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [CAMPO_PARTIDA]);
}

async function generarConPartida(page: Page, numero: string): Promise<void> {
  await page.locator(CAMPO_PARTIDA).fill(numero);
  await esperarValorEnReact(page, CAMPO_PARTIDA, numero);
  await page.getByRole('button', { name: 'Generar cartones' }).click();
}

const carton1 = (page: Page) => page.getByRole('table', { name: /^Cartón número 1 de la partida/ });

test.describe('bingo-personalizado', () => {
  test('estado inicial: tablas, 3×5 y bombo esperando a la partida', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Tablas de multiplicar' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: '3×5', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('40 respuestas distintas · en cada partida entran en juego 30.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sacar bola' })).toBeDisabled();
    await expect(page.getByText('Genera los cartones para empezar')).toBeVisible();
  });

  test('una lista corta desactiva los tamaños que no llena y usa el mayor que sí', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Sumas y restas hasta 20' }).click();
    await expect(page.getByRole('button', { name: '3×5', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: '5×5', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: '3×4', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('El 3×5 necesita 23 respuestas y esta lista tiene 20: se usará el 3×4.')).toBeVisible();
  });

  test('partida completa: reproducible, bombo hasta el final y comprobación', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Sumas y restas hasta 20' }).click();
    await generarConPartida(page, '123');

    await expect(page.getByRole('table')).toHaveCount(25);
    await expect(carton1(page).locator('tr')).toHaveCount(3);
    await expect(carton1(page).locator('tr').first().locator('td')).toHaveCount(4);
    const primero = await carton1(page).innerText();

    // «Otra tirada» ignora el 123 escrito y da otros cartones…
    await page.getByRole('button', { name: 'Otra tirada' }).click();
    await expect(page.locator(CAMPO_PARTIDA)).toHaveValue('');
    expect(await carton1(page).innerText()).not.toBe(primero);
    // …y volver a escribir el 123 devuelve exactamente los de antes
    await generarConPartida(page, '123');
    expect(await carton1(page).innerText()).toBe(primero);

    // Juego de clase: las respuestas arrancan ocultas
    await expect(page.getByRole('button', { name: 'Mostrar respuestas' })).toHaveAttribute('aria-pressed', 'false');

    const comprobar = page.getByLabel('N.º del cartón que canta');
    await comprobar.fill('99');
    await expect(page.getByRole('status').filter({ hasText: 'no hay cartón n.º 99' })).toBeVisible();

    const sacar = page.getByRole('button', { name: 'Sacar bola' });
    await sacar.click();
    await expect(page.getByText('1 de 20 han salido')).toBeVisible();
    for (let i = 1; i < 20; i++) await sacar.click();
    await expect(page.getByText('20 de 20 han salido')).toBeVisible();
    await expect(sacar).toBeDisabled();

    await comprobar.fill('1');
    await expect(page.getByRole('status').filter({ hasText: 'Cartón 1: ✓ cartón lleno.' })).toBeVisible();
  });

  test('juego de casa: respuestas visibles y dibujo en cada casilla', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Animales', exact: true }).click();
    await generarConPartida(page, '7');
    await expect(page.getByRole('button', { name: 'Mostrar respuestas' })).toHaveAttribute('aria-pressed', 'true');
    const casilla = carton1(page).locator('td').first();
    await expect(casilla.locator('span[aria-hidden="true"]')).not.toBeEmpty();

    // En una partida de palabras, las de 3 letras («oso», «pez») van con la misma letra que
    // las de 4-8; la grande es solo para partidas en que todo es corto (números, símbolos)
    const tamanos = await page.locator('td').evaluateAll((celdas) => {
      const porLargo = new Map<number, Set<string>>();
      for (const td of celdas) {
        const texto = td.querySelectorAll('span')[1];
        if (!texto) continue;
        const n = (texto.textContent ?? '').length;
        if (n > 8) continue;
        const clave = n <= 3 ? 3 : 8;
        if (!porLargo.has(clave)) porLargo.set(clave, new Set());
        porLargo.get(clave)!.add(getComputedStyle(texto).fontSize);
      }
      return { cortas: [...(porLargo.get(3) ?? [])], medias: [...(porLargo.get(8) ?? [])] };
    });
    expect(tamanos.cortas.length).toBeGreaterThan(0);
    expect(tamanos.cortas).toEqual(tamanos.medias);
  });

  test('impresión: los cartones 5×5 de animales caben a 3 por hoja A4', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Animales', exact: true }).click();
    await page.getByRole('button', { name: '5×5', exact: true }).click();
    await page.getByRole('slider').fill('3');
    await expect(page.getByText('Número de cartones: 3')).toBeVisible();
    await generarConPartida(page, '7');
    await expect(page.getByRole('table')).toHaveCount(3);

    // Con la casilla a 14 mm, el título y 3 cartones no cabían en la primera hoja: salían 2
    const pdf = await page.pdf({ format: 'A4' });
    const hojas = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
    expect(hojas).toBe(1);

    // Y la casilla no se estira por su contenido (dibujo + palabra caben en los 12 mm)
    await page.emulateMedia({ media: 'print' });
    const altos = await carton1(page).locator('td').evaluateAll((celdas) =>
      celdas.map((td) => td.getBoundingClientRect().height),
    );
    const mm12 = (12 * 96) / 25.4;
    for (const alto of altos) expect(alto).toBeLessThan(mm12 + 1.5);
  });

  test('partida de números: la letra grande se mantiene', async ({ page }) => {
    await abrir(page);
    await generarConPartida(page, '5');
    // Tablas del 2 al 9: todos los productos tienen 1-2 cifras → textoCorto (1,25rem > la base)
    const [numero, base] = await carton1(page)
      .locator('td span')
      .nth(1)
      .evaluate((s) => [getComputedStyle(s).fontSize, getComputedStyle(document.body).fontSize]);
    expect(parseFloat(numero)).toBeGreaterThan(parseFloat(base));
  });

  test('lista propia demasiado corta: avisa y no deja generar', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Lista propia' }).click();
    const area = page.getByLabel('Tu lista');
    const texto = 'gato = cat\nperro = dog\nperro = dog\nsol';
    await area.fill(texto);
    await esperarValorEnReact(page, area, texto);
    await expect(page.getByText('1 línea(s) repetida(s) descartada(s).')).toBeVisible();
    await expect(page.getByText(/Esta lista tiene 3 respuestas distintas y el cartón más pequeño \(3×3\) necesita 14/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generar cartones' })).toBeDisabled();
  });
});
