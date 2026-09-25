import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Orientador IMC — test de regresión (Inspector; 1.ª pasada 25/09/2026)
 *
 * Segmento «cálculo», riesgo 2 (salud): la app calcula el IMC y pone una etiqueta clínica
 * («Peso normal», «Obesidad grado III — requiere atención médica especializada»). Una etiqueta
 * falsa alarma a quien no lo necesita o tranquiliza a quien sí.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LA FUENTE DE CADA CORTE
 *   OMS, oficina regional para Europa — adultos de más de 20 años:
 *     bajo peso < 18,5 · normal 18,5–24,9 · preobesidad 25,0–29,9 · obesidad I 30,0–34,9 ·
 *     obesidad II 35,0–39,9 · obesidad III ≥ 40.
 *   OMS, nota descriptiva «Obesity and overweight»: en adultos, sobrepeso ≥ 25 y obesidad ≥ 30;
 *   de 5 a 19 años se usa el IMC para la edad (Growth Reference), no estos cortes.
 *   La app declara esos mismos cortes (page.tsx:58-65 y su tabla de las l. 436-459) y un rango
 *   de peso = 18,5·h² … 24,9·h² (page.tsx:67-73, y la FAQ de metadata.ts).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (altura en CENTÍMETROS: page.tsx:352)
 *   1 · 70 kg, 175 cm → h² = 3,0625 → IMC 70 / 3,0625 = 22,857 → «22,9», peso normal.
 *       Rango: 18,5·3,0625 = 56,656 → «56,7»; 24,9·3,0625 = 76,256 → «76,3». Dentro: sin diferencia.
 *   2 · 72,25 kg, 170 cm → h² = 2,89 → IMC 25,000 → sobrepeso (≥ 25 es sobrepeso para la OMS).
 *       Techo del rango 24,9·2,89 = 71,961 → «72,0»; exceso 72,25 − 71,961 = 0,289 → «0,3 kg».
 *   3 · 53,465 kg, 170 cm → IMC 18,500 → peso normal (18,5 ya es normal); suelo 53,465 → sin diferencia.
 *   4 · 50 kg, 170 cm → IMC 17,301 → «17,3», bajo peso; déficit 53,465 − 50 = 3,465 → «3,5 kg».
 *   5 · Comparador por defecto (175 cm; 60, 75, 90 kg) → 19,592 «19,6» normal · 24,490 «24,5»
 *       normal · 29,388 «29,4» sobrepeso, exceso 90 − 76,256 = 13,744 → «+13,7 kg».
 *   6 · Rechazo — 70 kg con «1,75» en la altura (metros, como pide la guía de la propia app en
 *       page.tsx:861): no describe a nadie en un campo en cm. Debe rechazarse o avisarse; NUNCA
 *       convertirse en una etiqueta clínica. Ídem un peso de −70 kg.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS ABIERTOS (test.fail — pasan en verde hoy y avisarán al repararse)
 *   A · Entradas imposibles reescritas al límite en silencio (NumberInput acota al salir,
 *       page.tsx:337-355, y `calcular` no valida): «1,75» → 50 cm → IMC 280,0 «Obesidad grado
 *       III»; −70 kg → 1 kg → IMC 0,3 «Bajo peso».
 *   B · Campos vacíos: parseSpanishNumber('') = NaN y `NaN <= 0` es false (page.tsx:111, 146,
 *       149) → «No definido» con «🚨 Obesidad grado III» (y «✅ Ideal» en la tabla del comparador).
 *   C · Franja 24,9 ≤ IMC < 25: la etiqueta dice «Peso normal» (corte < 25, l. 60) pero el techo
 *       del rango es 24,9·h² (l. 71), así que sale «Diferencia sobre rango … 0,0 kg»; y entre
 *       24,95 y 24,99 se muestra «25,0» con la etiqueta «Peso normal».
 *   D · Contraste: texto blanco sobre el color de la categoría (OrientadorIMC.module.css:197-204,
 *       769-777, 849-856, 735-747) y cifra del IMC en el color de la categoría (l. 189-195).
 *   E · Fila activa de la tabla OMS: var(--primary) sobre su propio velo (css:265-272).
 *   F · Contenido: la FAQ dice 71,9 kg donde la app muestra 72,0; umbrales asiáticos 23/27,5
 *       presentados como «sobrepeso/obesidad» de la OMS; emoji leído en la etiqueta del resultado.
 */

const URL = '/orientador-imc/';

const campo = (page: Page, nombre: string): Locator =>
  page.getByRole('textbox', { name: nombre, exact: true });
const valorIMC = (page: Page): Locator => page.locator('[class*="imcValue"]');
const etiqueta = (page: Page): Locator => page.locator('[class*="imcClasificacion"]');
const panel = (page: Page): Locator => page.locator('[class*="resultsPanel"]');

async function abrir(page: Page): Promise<void> {
  await page.goto(URL);
  await esperarHidratacion(page, ['input[inputmode="decimal"]']);
}

/** Escribe como un usuario (fill + cambio de foco) y pulsa «Calcular IMC». */
async function calcular(page: Page, peso: string, altura: string): Promise<void> {
  await campo(page, 'Peso').fill(peso);
  await esperarValorEnReact(page, campo(page, 'Peso'), peso);
  await campo(page, 'Altura').fill(altura);
  await esperarValorEnReact(page, campo(page, 'Altura'), altura);
  await page.getByRole('button', { name: 'Calcular IMC' }).click();
}

/** Espera a que terminen las transiciones CSS (los colores de categoría se animan). */
async function asentar(page: Page): Promise<void> {
  await page.waitForFunction(() => document.getAnimations().length === 0);
}

/**
 * Contraste WCAG del texto de `el` sobre su fondo REAL: compone los fondos semitransparentes
 * de toda la cadena de antepasados hasta dar con uno opaco.
 */
async function contraste(loc: Locator): Promise<number> {
  return loc.evaluate((el) => {
    const canal = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lin = (v: number) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const capas: number[][] = [];
    let nodo: Element | null = el;
    while (nodo) {
      const c = canal(getComputedStyle(nodo).backgroundColor);
      const alfa = c.length > 3 ? c[3] : 1;
      if (alfa > 0) capas.push([c[0], c[1], c[2], alfa]);
      if (alfa === 1) break;
      nodo = nodo.parentElement;
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const t = canal(getComputedStyle(el).color);
    const at = t.length > 3 ? t[3] : 1;
    const texto = [0, 1, 2].map((i) => t[i] * at + fondo[i] * (1 - at));
    const [l1, l2] = [lum(texto), lum(fondo)].sort((p, q) => q - p);
    return (l1 + 0.05) / (l2 + 0.05);
  });
}

test.describe('Orientador IMC · cálculo y clasificación OMS', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('Caso 1 · 70 kg y 175 cm → IMC 22,9, peso normal, rango 56,7 - 76,3 kg', async ({ page }) => {
    await calcular(page, '70', '175');
    // 70 / 1,75² = 22,857 → «22,9»; rango 18,5·3,0625 = 56,656 y 24,9·3,0625 = 76,256
    await expect(valorIMC(page)).toHaveText('22,9');
    await expect(etiqueta(page)).toContainText('Peso normal');
    await expect(panel(page)).toContainText('56,7 - 76,3');
    await expect(panel(page).getByText(/Diferencia (sobre|bajo) rango/)).toHaveCount(0);
    await expect(panel(page).locator('tr[class*="activo"]')).toContainText('18,5 - 24,9');
  });

  test('Caso 2 · borde 25,0 (72,25 kg y 170 cm) → sobrepeso, 0,3 kg sobre el rango', async ({ page }) => {
    await calcular(page, '72,25', '170');
    // 72,25 / 2,89 = 25,000 → sobrepeso (OMS: ≥ 25); exceso 72,25 − 24,9·2,89 (71,961) = 0,289
    await expect(valorIMC(page)).toHaveText('25,0');
    await expect(etiqueta(page)).toContainText('Sobrepeso');
    await expect(panel(page)).toContainText('53,5 - 72,0');
    const exceso = panel(page).locator('[class*="resultCards"] > *', { hasText: 'Diferencia sobre rango IMC estándar OMS' });
    await expect(exceso).toContainText('0,3');
    await expect(panel(page).locator('tr[class*="activo"]')).toContainText('25 - 29,9');
  });

  test('Caso 3 · borde 18,5 (53,465 kg y 170 cm) → peso normal, sin diferencia', async ({ page }) => {
    await calcular(page, '53,465', '170');
    // 53,465 / 2,89 = 18,500 → peso normal (18,5 ya es normal); es justo el suelo del rango
    await expect(valorIMC(page)).toHaveText('18,5');
    await expect(etiqueta(page)).toContainText('Peso normal');
    await expect(panel(page).getByText(/Diferencia (sobre|bajo) rango/)).toHaveCount(0);
  });

  test('Caso 4 · 50 kg y 170 cm → IMC 17,3, bajo peso, 3,5 kg bajo el rango', async ({ page }) => {
    await calcular(page, '50', '170');
    // 50 / 2,89 = 17,301 → «17,3»; déficit 18,5·2,89 (53,465) − 50 = 3,465 → «3,5»
    await expect(valorIMC(page)).toHaveText('17,3');
    await expect(etiqueta(page)).toContainText('Bajo peso');
    const deficit = panel(page).locator('[class*="resultCards"] > *', { hasText: 'Diferencia bajo rango IMC estándar OMS' });
    await expect(deficit).toContainText('3,5');
  });

  test('Caso 5 · comparador por defecto (175 cm; 60, 75 y 90 kg)', async ({ page }) => {
    await page.getByRole('button', { name: /Comparador/ }).click();
    const filas = page.locator('[class*="tablaComparativa"] tbody tr');
    await expect(filas).toHaveCount(3);
    // 60 / 3,0625 = 19,592 · 75 / 3,0625 = 24,490 · 90 / 3,0625 = 29,388; 90 − 76,256 = 13,744
    await expect(filas.nth(0)).toContainText('19,6');
    await expect(filas.nth(0)).toContainText('Peso normal');
    await expect(filas.nth(1)).toContainText('24,5');
    await expect(filas.nth(1)).toContainText('Peso normal');
    await expect(filas.nth(2)).toContainText('29,4');
    await expect(filas.nth(2)).toContainText('Sobrepeso');
    await expect(filas.nth(2)).toContainText('+13,7 kg');
    await expect(page.locator('[class*="pesoIdealInfo"]')).toContainText('56,7 - 76,3 kg');
  });

  // ─── Hallazgo A: entradas imposibles reescritas al límite y clasificadas ────────────────
  test('HALLAZGO A · «1,75» en la altura (metros) no puede acabar en «Obesidad grado III»', async ({ page }) => {
    test.fail(true, 'Hallazgo A abierto: el blur acota 1,75 a 50 cm y la app da IMC 280,0 · Obesidad grado III');
    await calcular(page, '70', '1,75');
    // 70 kg con 1,75 m es un IMC 22,9: lo que no puede salir es la etiqueta de 50 cm. Se mira
    // la ETIQUETA, no el panel: la tabla OMS del panel lista siempre «Obesidad grado III». El
    // clic es un evento discreto y React confirma el render antes de devolverlo; tras una
    // reparación que rechace la entrada, la etiqueta no existe y la lista queda vacía.
    const etiquetas = (await etiqueta(page).allInnerTexts()).join(' ');
    expect(etiquetas).not.toContain('Obesidad grado III');
  });

  test('HALLAZGO A · un peso de −70 kg no puede acabar en «Bajo peso» con IMC 0,3', async ({ page }) => {
    test.fail(true, 'Hallazgo A abierto: el blur acota −70 a 1 kg y la app da IMC 0,3 · Bajo peso');
    await calcular(page, '-70', '175');
    // Misma razón que el anterior: la tabla OMS del panel siempre dice «Bajo peso»
    const etiquetas = (await etiqueta(page).allInnerTexts()).join(' ');
    expect(etiquetas).not.toContain('Bajo peso');
  });

  // ─── Hallazgo B: campos vacíos → NaN clasificado como obesidad III ──────────────────────
  test('HALLAZGO B · «Calcular IMC» con los campos vacíos no da ninguna clasificación', async ({ page }) => {
    test.fail(true, 'Hallazgo B abierto: sale «No definido» con «🚨 Obesidad grado III»');
    await page.getByRole('button', { name: 'Calcular IMC' }).click();
    await expect(etiqueta(page)).toHaveCount(0);
  });

  test('HALLAZGO B · comparador: vaciar el peso del perfil 3 no lo clasifica como obesidad III', async ({ page }) => {
    test.fail(true, 'Hallazgo B abierto: el perfil vacío sale «No definido · Obesidad grado III · ✅ Ideal»');
    await page.getByRole('button', { name: /Comparador/ }).click();
    await campo(page, 'Perfil 3').fill('');
    await esperarValorEnReact(page, campo(page, 'Perfil 3'), '');
    // Perfiles 1 y 2 quedan en 60 y 75 kg (peso normal): en todo el comparador (que siempre
    // existe; la leyenda dice solo «Obesidad») no debe aparecer «Obesidad grado III».
    await expect(page.locator('[class*="comparadorContent"]')).not.toContainText('Obesidad grado III');
  });

  // ─── Hallazgo C: franja 24,9 ≤ IMC < 25 ─────────────────────────────────────────────────
  test('HALLAZGO C · 72 kg y 170 cm (IMC 24,91, peso normal) no muestra «0,0 kg sobre el rango»', async ({ page }) => {
    test.fail(true, 'Hallazgo C abierto: «Peso normal» junto a «Diferencia sobre rango IMC estándar OMS 0,0 kg»');
    await calcular(page, '72', '170');
    // 72 / 2,89 = 24,913 → peso normal (< 25). 72 − 71,961 = 0,039 → la tarjeta dice «0,0 kg»
    await expect(etiqueta(page)).toContainText('Peso normal');
    await expect(panel(page).getByText('Diferencia sobre rango IMC estándar OMS')).toHaveCount(0);
  });

  test('HALLAZGO C · 72,2 kg y 170 cm: la cifra mostrada y la etiqueta no se contradicen', async ({ page }) => {
    test.fail(true, 'Hallazgo C abierto: muestra «25,0» con la etiqueta «Peso normal»');
    await calcular(page, '72,2', '170');
    // 72,2 / 2,89 = 24,983 → a un decimal «25,0», que la tabla de la app llama sobrepeso
    await expect(valorIMC(page)).toBeVisible();
    const mostrado = `${await valorIMC(page).innerText()} · ${await etiqueta(page).innerText()}`;
    expect(mostrado).not.toMatch(/^25,0 · .*Peso normal/);
  });

  // ─── Hallazgo D: contraste del color de categoría ───────────────────────────────────────
  test('HALLAZGO D · calculadora: la etiqueta (≥ 4,5:1) y la cifra grande (≥ 3:1) en las 6 categorías y 2 temas', async ({ page }) => {
    test.fail(true, 'Hallazgo D abierto: blanco sobre #f39c12 = 2,19:1; cifra #f39c12 sobre #fafafa = 2,10:1');
    // 170 cm: 50 → 17,3 · 65 → 22,5 · 78 → 27,0 · 95 → 32,9 · 110 → 38,1 · 125 → 43,3
    const casos: Array<[string, string]> = [
      ['50', 'Bajo peso'], ['65', 'Peso normal'], ['78', 'Sobrepeso'],
      ['95', 'Obesidad grado I'], ['110', 'Obesidad grado II'], ['125', 'Obesidad grado III'],
    ];
    const fallos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      for (const [peso, nombre] of casos) {
        await calcular(page, peso, '170');
        await expect(etiqueta(page)).toContainText(nombre);
        await asentar(page);
        const rEtiqueta = await contraste(etiqueta(page));
        const rCifra = await contraste(valorIMC(page));
        if (rEtiqueta < 4.5) fallos.push(`${tema} · ${nombre} · etiqueta ${rEtiqueta.toFixed(2)}`);
        if (rCifra < 3) fallos.push(`${tema} · ${nombre} · cifra ${rCifra.toFixed(2)}`);
      }
    }
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO D · comparador: pastillas, «IMC en rango» y cifra de la tabla cumplen AA en los 2 temas', async ({ page }) => {
    test.fail(true, 'Hallazgo D abierto: pastilla «Sobrepeso» 2,19:1; «IMC en rango estándar OMS» 2,87:1');
    await page.getByRole('button', { name: /Comparador/ }).click();
    const fallos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      await asentar(page);
      const medir = async (sel: string, minimo: number) => {
        const els = page.locator(sel);
        const n = await els.count();
        for (let i = 0; i < n; i++) {
          const r = await contraste(els.nth(i));
          if (r < minimo) fallos.push(`${tema} · ${sel} #${i} · ${r.toFixed(2)}`);
        }
      };
      await medir('[class*="resumenClasificacion"]', 4.5);
      await medir('[class*="tagClasificacion"]', 4.5);
      await medir('[class*="badgeSaludable"]', 4.5);
      await medir('[class*="tablaComparativa"] tbody td:nth-child(3)', 4.5);
    }
    expect(fallos).toEqual([]);
  });

  // ─── Hallazgo E: fila activa de la tabla OMS ────────────────────────────────────────────
  test('HALLAZGO E · la fila activa de la tabla OMS cumple 4,5:1 en claro y en oscuro', async ({ page }) => {
    test.fail(true, 'Hallazgo E abierto: var(--primary) sobre su velo = 3,17:1 en claro y 2,63:1 en oscuro');
    await calcular(page, '70', '175');
    const celda = panel(page).locator('tr[class*="activo"] td').first();
    for (const tema of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      await asentar(page);
      expect(await contraste(celda), tema).toBeGreaterThanOrEqual(4.5);
    }
  });

  // ─── Hallazgo F: contenido ──────────────────────────────────────────────────────────────
  test('HALLAZGO F · la FAQ da para 1,70 m el mismo techo que la app (24,9 × 2,89 = 71,961 → 72,0)', async ({ page }) => {
    test.fail(true, 'Hallazgo F abierto: la FAQ (metadata.ts) dice 71,9 kg; la app muestra 72,0');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld).toContain('entre 53,5 kg y 72,0 kg');
  });

  test('HALLAZGO F · los puntos 23/27,5 de la OMS no se presentan como «sobrepeso/obesidad» asiáticos', async ({ page }) => {
    test.fail(true, 'Hallazgo F abierto: page.tsx:800 dice «sobrepeso desde IMC 23, obesidad desde IMC 27,5»');
    // OMS 2004 (Lancet 363:157): se MANTIENEN los cortes internacionales; 23 y 27,5 son puntos
    // de acción de salud pública, y el riesgo empieza entre 22 y 25 según la población.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tarjeta = page.locator('[class*="escenarioCard"]', { hasText: 'origen asiático' });
    await expect(tarjeta).toBeVisible();
    await expect(tarjeta).not.toContainText('sobrepeso desde IMC 23');
  });

  test('HALLAZGO F · el lector de pantalla no lee el emoji de la etiqueta del resultado', async ({ page }) => {
    test.fail(true, 'Hallazgo F abierto: el nombre accesible es «✅ Peso normal» (page.tsx:392, 571)');
    await calcular(page, '70', '175');
    await expect(etiqueta(page)).toContainText('Peso normal');
    const arbol = await page.locator('[class*="imcDisplay"]').ariaSnapshot();
    expect(arbol).not.toContain('✅');
  });
});

test.describe('Orientador IMC · móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('sin desbordamiento horizontal en calculadora ni en comparador', async ({ page }) => {
    await abrir(page);
    await calcular(page, '70', '175');
    await expect(valorIMC(page)).toHaveText('22,9');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    // tap() lleva el botón a la vista y toca en su centro (lejos del indicador de next dev)
    await page.getByRole('button', { name: /Comparador/ }).tap();
    await expect(page.locator('[class*="tablaComparativa"] tbody tr')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});
