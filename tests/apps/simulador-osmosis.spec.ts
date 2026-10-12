import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Simulador de Ósmosis y Presión Osmótica — PASO 4.bis de /nueva-app-meskeia
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador de Ósmosis y Presión Osmótica». Una temperatura común y dos
 *   secciones, cada una con su región role="status": 1) dos disoluciones separadas por una
 *   membrana semipermeable (lado A y lado B, cada uno un role="group" con su soluto, su unidad y
 *   su concentración); 2) una célula animal o vegetal en un medio, con medios de referencia en
 *   botones y el mismo selector de disolución. Los tres selectores repiten los mismos botones y
 *   la misma etiqueta «Concentración», así que todo se busca dentro de su grupo.
 *
 * LA VERDAD, CALCULADA A MANO (R = 0,0820573661 atm·L/(mol·K); a 25 °C, R·T = 24,4654037)
 *   1) Inicial: A sacarosa 0,3 M, B glucosa 0,1 M, 25 °C
 *        osm A = 0,3 → «0,300 osmol/L» · π A = 0,3 · 24,4654 = 7,3396 → «7,34 atm»
 *        osm B = 0,1 → π B = 2,4465 → «2,45 atm»
 *        el agua va de B a A · Δπ = 0,2 · 24,4654 = 4,8931 atm → «4,89 atm»
 *        en kPa: 4,8931 · 101,325 = 495,79 → «495,8 kPa»
 *        columna: 0,2 · 1000 · 8,314462618 · 298,15 / 9810 = 50,539 m → «50,54 m»
 *   2) B con NaCl 0,15 M: osm 2 · 0,15 = 0,3 = A → «Ninguno»
 *   3) A con NaCl al 0,9 % m/v: 9/58,44 = 0,15400 M → osm 0,30801 → «0,308 osmol/L»
 *   4) Célula inicial: glóbulo rojo de 0,30 en suero fisiológico (0,308): +2,67 % → isotónico,
 *      «+2,7 %» y «La célula conserva su forma» · Δπ = 0,0080082 · 24,4654 = 0,19592 → «0,196 atm»
 *   5) Agua destilada: hipotónico; animal «se hincha», vegetal «turgente»
 *   6) Agua con sal al 3 %: 30/58,44 · 2 = 1,02669 → «1,027 osmol/L»; vegetal «plasmólisis»
 *   7) Rechazo: concentración del lado A vacía → «Falta un dato» y dice cuál, sin cifra de Δπ;
 *      temperatura vacía → las dos secciones lo piden.
 */

/** El valor de una tarjeta, localizado por su etiqueta (las clases del módulo van con hash). */
async function leerTarjeta(zona: Locator, etiqueta: string): Promise<string> {
  return zona.evaluate((raiz, lab) => {
    for (const d of raiz.querySelectorAll('div')) {
      const sp = d.querySelectorAll(':scope > span');
      if (sp.length === 2 && sp[0].textContent?.trim() === lab) {
        return sp[1].textContent?.trim() ?? '';
      }
    }
    return '';
  }, etiqueta);
}

function seccion(page: Page, titulo: RegExp): Locator {
  return page.locator('section', { has: page.getByRole('heading', { level: 2, name: titulo }) });
}

function estado(page: Page, titulo: RegExp): Locator {
  return seccion(page, titulo).locator('[role="status"]');
}

function grupo(page: Page, nombre: string): Locator {
  return page.getByRole('group', { name: nombre, exact: true });
}

async function escribir(caja: Locator, page: Page, valor: string): Promise<void> {
  await caja.fill(valor);
  await esperarValorEnReact(page, caja, valor);
}

function concentracion(page: Page, nombreGrupo: string): Locator {
  return grupo(page, nombreGrupo).getByRole('textbox', { name: 'Concentración', exact: true });
}

const MEMBRANA = /^1\. Dos disoluciones/;
const CELULA = /^2\. Una célula/;

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-osmosis/');
  await esperarHidratacion(page, ['input']);
});

test.describe('Simulador de Ósmosis', () => {
  test('1 · sacarosa 0,3 M frente a glucosa 0,1 M: el agua va de B a A con Δπ 4,89 atm', async ({ page }) => {
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('De B hacia A');
    await expect(zona).toContainText('4,89 atm');
    await expect(zona).toContainText('495,8 kPa');
    await expect(zona).toContainText('50,54 m');
    expect(await leerTarjeta(zona, 'Osmolaridad A (i·M)')).toBe('0,300 osmol/L');
    expect(await leerTarjeta(zona, 'Presión osmótica A')).toBe('7,34 atm');
    expect(await leerTarjeta(zona, 'Presión osmótica B')).toBe('2,45 atm');
    await expect(seccion(page, MEMBRANA).getByRole('img')).toHaveAttribute('aria-label', /del lado B al lado A/);
  });

  test('2 · NaCl 0,15 M frente a sacarosa 0,3 M: misma osmolaridad, sin paso neto', async ({ page }) => {
    await grupo(page, 'Lado B').getByRole('button', { name: /^Cloruro de sodio/ }).click();
    await escribir(concentracion(page, 'Lado B'), page, '0,15');
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('Ninguno');
    await expect(zona).toContainText('misma osmolaridad');
    await expect(grupo(page, 'Lado B').getByRole('button', { name: /^Cloruro de sodio/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(grupo(page, 'Lado B').getByRole('button', { name: /^Glucosa/ })).toHaveAttribute('aria-pressed', 'false');
  });

  test('3 · NaCl al 0,9 % m/v en el lado A: 0,308 osmol/L', async ({ page }) => {
    await grupo(page, 'Lado A').getByRole('button', { name: /^Cloruro de sodio/ }).click();
    await grupo(page, 'Lado A').getByRole('button', { name: /% masa\/volumen/ }).click();
    await escribir(concentracion(page, 'Lado A'), page, '0,9');
    expect(await leerTarjeta(estado(page, MEMBRANA), 'Osmolaridad A (i·M)')).toBe('0,308 osmol/L');
  });

  test('4 · glóbulo rojo en suero fisiológico: isotónico, conserva su forma', async ({ page }) => {
    const zona = estado(page, CELULA);
    await expect(zona).toContainText('Medio isotónico');
    await expect(zona).toContainText('La célula conserva su forma');
    expect(await leerTarjeta(zona, 'Medio frente al interior')).toBe('+2,7 %');
    expect(await leerTarjeta(zona, 'Diferencia de presión osmótica')).toBe('0,196 atm');
    await expect(
      grupo(page, 'Medios de referencia').getByRole('button', { name: /^Suero fisiológico/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('5 · agua destilada: la animal se hincha y la vegetal queda turgente', async ({ page }) => {
    await grupo(page, 'Medios de referencia').getByRole('button', { name: 'Agua destilada' }).click();
    const zona = estado(page, CELULA);
    await expect(zona).toContainText('Medio hipotónico');
    await expect(zona).toContainText('La célula se hincha');
    await expect(zona).toContainText('El agua entra en la célula');

    await grupo(page, 'Tipo de célula').getByRole('button', { name: /^Vegetal/ }).click();
    await expect(zona).toContainText('La célula queda turgente');
    await expect(seccion(page, CELULA).getByRole('img')).toHaveAttribute('aria-label', /Célula vegetal/);
  });

  test('6 · agua con sal al 3 %: plasmólisis en la célula vegetal', async ({ page }) => {
    await grupo(page, 'Tipo de célula').getByRole('button', { name: /^Vegetal/ }).click();
    await grupo(page, 'Medios de referencia').getByRole('button', { name: /^Agua con sal/ }).click();
    const zona = estado(page, CELULA);
    await expect(zona).toContainText('Medio hipertónico');
    await expect(zona).toContainText('plasmólisis');
    await expect(zona).toContainText('El agua sale de la célula');
    expect(await leerTarjeta(zona, 'Osmolaridad del medio')).toBe('1,027 osmol/L');
  });

  test('7 · sin concentración o sin temperatura no hay cifra: dice qué falta', async ({ page }) => {
    await escribir(concentracion(page, 'Lado A'), page, '');
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('Falta un dato');
    await expect(zona).toContainText('la concentración del lado A');
    await expect(zona).not.toContainText('atm');

    await escribir(page.getByRole('textbox', { name: 'Temperatura de las disoluciones', exact: true }), page, '');
    await expect(estado(page, CELULA)).toContainText('una temperatura válida');
  });
});
