import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * simulador-gas-ideal · casos para clase (tarea de tipo A, 28/09/2026)
 *
 * Doce problemas de PV = nRT y de las leyes de Boyle, Charles y Gay-Lussac, que es la parte
 * de la app que cae en el temario de secundaria; la pestaña de ciclos (Carnot, Otto…) queda
 * fuera. Los casos calculan SOLO con `calcularGasIdeal` y `calcularProceso` de `motor.ts`, que
 * se EXTRAJERON de los dos `useMemo` de page.tsx sin tocar una operación: lo que resuelve el
 * alumno y lo que pinta la app sale de la misma función.
 *
 * CONVENIO DE ESTA APP:
 *   · R = 8,314 J/(mol·K) y 1 atm = 101.325 Pa (R = 0,08205 atm·L/(mol·K); la app rotula
 *     0,0821, y con ese redondeo los casos siguen dentro de la tolerancia del 1 %);
 *   · T(K) = T(°C) + 273,15 (con 273 también entra: los casos 7, 9 y 12 están elegidos así);
 *   · ⚠️ nada que dependa de n en la pestaña Procesos (Q, ΔU, W isotermo): su estado de fábrica
 *     no cumple PV = nRT (1 atm·10 L frente a 1 mol·300 K, un factor 2,46) — anotado en
 *     _private/inspector/SOSPECHAS.md el 28/09/2026.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano, sin mirar la app):
 *   1 · P = nRT/V = 2·8,314·300 / 0,010 m³ = 498.840 Pa = 4,9232 atm             → 4,92 atm
 *   2 · V = nRT/P = 8,314·273,15 / 101.325 = 0,0224127 m³                         → 22,41 L
 *   3 · n = PV/RT = 202.650·0,005 / (8,314·298,15) = 0,40876                     → 0,41 mol
 *   4 · T = PV/nR = 151.987,5·0,012 / (0,5·8,314) = 438,742 K = 165,592 °C        → 165,6 °C
 *   5 · Boyle: P₂ = 1·10/4                                                         = 2,5 atm
 *   6 · Charles: V₂ = 2·360/300                                                    = 2,4 L
 *   7 · Gay-Lussac: P₂ = 2·333,15/293,15 = 2,27290 (con °C daría 6 atm)           → 2,27 atm
 *   8 · Boyle: V₂ = 4·3/1,5                                                        = 8 L
 *   9 · combinada: V₂ = 6·(1/2)·(400,15/300,15) = 3,99950                          → 4,00 L
 *  10 · W = P·ΔV = 2·101.325·(0,008 − 0,005) = 607,95 J (V₂ = 5·480/300 = 8 L)    → 608 J
 *  11 · Gay-Lussac: T₂ = 300·1,8/1,2                                              = 450 K
 *  12 · Charles: T₂ = 2·293,15 = 586,30 K = 313,15 °C (duplicar los °C da 40)     → 313 °C
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  comprobarRespuesta,
  toleranciaDe,
  generarEjercicioAleatorio,
} from '../../app/simulador-gas-ideal/casos';
import { R, ATM_TO_PA, calcularGasIdeal, calcularProceso } from '../../app/simulador-gas-ideal/motor';

const RUTA = '/simulador-gas-ideal/';

const A_MANO: Readonly<Record<number, number>> = {
  1: 4.92,
  2: 22.41,
  3: 0.41,
  4: 165.6,
  5: 2.5,
  6: 2.4,
  7: 2.27,
  8: 8,
  9: 4,
  10: 608,
  11: 450,
  12: 313,
};

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («2,27 atm» → 2). */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

const redondeo = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

test.describe('simulador-gas-ideal · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondeo(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?|Bachillerato|selectividad)\b/i;
    // La sigla va aparte y con mayúsculas: con /i, el pronombre «eso» la disparaba en falso.
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      // Los casos 5, 6, 8 y 11 son exactos y no piden redondear: está bien que no lo digan.
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      if (!exacto) {
        expect(caso.enunciado, `caso ${caso.id}: se redondea y el enunciado no lo pide`).toMatch(/redonde|decimal|unidades|décima/i);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.magnitud)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      expect(redondeo(resolverCaso(m.datos).valor, m.datos.decimales ?? 2)).toBe(m.respuesta);
    }
  });

  test('7 · el convenio queda fijado: R = 8,314, 1 atm = 101.325 Pa, kelvin con 273,15', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO[caso.id]);
    }

    // (b) Las constantes, y el motor movido: 1 mol a 273,15 K y 1 atm ocupa 22,413 L.
    expect(R).toBe(8.314);
    expect(ATM_TO_PA).toBe(101325);
    expect(calcularGasIdeal('V', 1, 0, 273.15, 1)).toBeCloseTo(22.4127, 4);
    const boyle = calcularProceso({ proceso: 'isotermo', P1atm: 1, V1L: 10, T1K: 300, V2L: 4, T2K: 600, nMol: 1, gamma: 1.4 });
    expect(boyle!.P2 / ATM_TO_PA).toBeCloseTo(2.5, 10);

    // (c) Los convenios de los libros entran: R = 0,0821 en el caso 1, 273 en el 7, «22,4 L».
    expect(comprobarRespuesta((2 * 0.0821 * 300) / 10, 4.92).correcto).toBe(true);
    expect(comprobarRespuesta((2 * 333) / 293, 2.27).correcto).toBe(true);
    expect(comprobarRespuesta(22.4, 22.41).correcto).toBe(true);

    // (d) Los errores del tema NO entran: trabajar en °C (caso 7 → 6 atm, caso 12 → 40 °C).
    expect(comprobarRespuesta((2 * 60) / 20, 2.27).correcto).toBe(false);
    expect(comprobarRespuesta(40, 313).correcto).toBe(false);
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    expect(comprobarRespuesta(608, 608).correcto).toBe(true);
    expect(comprobarRespuesta(NaN, 2.5).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 2.5).motivo).not.toMatch(/NaN/);
    expect(toleranciaDe(0)).toBe(0.01);
    expect(toleranciaDe(450)).toBeCloseTo(4.5, 10);
    // Borde exacto de la tolerancia, por los dos lados (hallazgo 1211 del 22/09/2026).
    expect(comprobarRespuesta(0.42, 0.41).correcto).toBe(true);
    expect(comprobarRespuesta(0.4, 0.41).correcto).toBe(true);
  });
});

test.describe('simulador-gas-ideal · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta', '#P']);
  });

  test('el caso 5 se comprueba en la pestaña Procesos con la cifra de la solución', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('2,5');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');

    // Lo que dice «Verlo en el simulador» es verdad: Isotermo con P₁ = 1, V₁ = 10 y V₂ = 4.
    const verlo = seccion(page).getByRole('button', { name: 'Verlo en el simulador' });
    await expect(verlo).toHaveAttribute('aria-expanded', 'false');
    await verlo.click();
    await expect(seccion(page)).toContainText('Isotermo');

    await page.getByRole('tab', { name: 'Procesos' }).click();
    await page.locator('#V2').fill('4');
    // exact: el texto de «Verlo en el simulador» cita la misma cifra dentro de una frase.
    await expect(page.getByText('2,500 atm', { exact: true })).toBeVisible();
  });

  test('trabajar en °C en el caso 7 se rechaza y la solución enseña la cifra', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 7:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('6');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).not.toContainText('Correcto');
    await seccion(page).getByRole('button', { name: /Ver solución/ }).click();
    await expect(seccion(page)).toContainText('2,27 atm');
  });

  test('la ley del gas ideal de arriba sigue funcionando con la sección añadida', async ({ page }) => {
    // De fábrica: 1 mol, 22,4 L y 273,15 K → P = 1,000 atm (1,0006 con R = 8,314).
    await expect(page.getByText(/1,001 atm|1,000 atm/).first()).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 28/09/2026 — primera inspección (segmento cálculo, riesgo 3)
 *
 * QUÉ PROMETE
 *   <h1>: «Simulador de Gas Ideal y Termodinámica» — «Manipula presión, volumen, temperatura y
 *   cantidad. Compara procesos y ciclos termodinámicos con diagramas P-V interactivos».
 *   metadata: «Simula la ley del gas ideal PV=nRT, los procesos termodinámicos (isotermo,
 *   isobárico, adiabático) y los ciclos de Carnot, Otto, Diesel y Stirling».
 *   Bloque educativo: tabla de procesos (isobárico Q = nCₚ·ΔT, ΔU = nCᵥ·ΔT), «Verifica el
 *   primer principio», «Si tu ciclo da una η mayor [que Carnot], hay un error».
 *
 * CONVENIO: R = 8,314 J/(mol·K) · 1 atm = 101.325 Pa · 1 L = 0,001 m³ · γ = 1,4 de fábrica,
 *   Cᵥ = R/(γ−1) = 20,785 J/(mol·K) y Cₚ = γ·Cᵥ = 29,099 J/(mol·K).
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   NORMAL · Ley del gas ideal, calcular V con P = 2 atm, T = 300 K, n = 0,5 mol
 *     V = nRT/P = 0,5·8,314·300 / 202.650 = 1.247,1 / 202.650 = 0,00615396 m³ → «6,154 L».
 *
 *   NORMAL · Procesos, adiabático de fábrica (P₁ 1 atm, V₁ 10 L, T₁ 300 K, V₂ 20 L, γ 1,4)
 *     P₂ = P₁·(V₁/V₂)^γ = 0,5^1,4 = 0,378929 atm · T₂ = 300·0,5^0,4 = 227,357 K
 *     W = (P₁V₁ − P₂V₂)/(γ−1) = (1.013,25 − 767,90)/0,4 = 613,38 J · ΔU = −W.
 *
 *   NORMAL · Ciclos de fábrica (Th 800 K, Tc 300 K, V₁ 2 L, V₂ 20 L, n 1, γ 1,4, r 10, rc 2)
 *     Carnot: η = 1 − 300/800 = 62,50 % · Qh = nRTh·ln10 = 6.651,2·2,302585 = 15.314,95 J
 *             Qc = nRTc·ln10 = 5.743,11 J · W = 9.571,85 J.
 *     Otto:   η = 1 − 10^−0,4 = 1 − 0,398107 = 60,19 %.
 *     Diesel: η = 1 − 10^−0,4·(2^1,4 − 1)/(1,4·1) = 1 − 0,398107·1,170726 = 53,39 %
 *             (a igual r el Otto rinde MÁS que el Diesel).
 *
 *   LÍMITE · el estado inicial de «Procesos» de fábrica NO cumple PV = nRT
 *     P₁V₁ = 101.325·0,010 = 1.013,25 J  frente a  nRT₁ = 1·8,314·300 = 2.494,20 J (×2,4616).
 *     El n que cumple el estado es 1.013,25/2.494,2 = 0,40624 mol; el P₁ que cumple el n de
 *     fábrica, 2.494,2/0,010/101.325 = 2,4616 atm. Sea cual sea la fuente buena, hay
 *     invariantes que NO dependen de n y que un gas ideal cumple siempre:
 *       · isobárico: ΔU/W = 1/(γ−1) = 2,5 y Q/ΔU = γ = 1,4. De fábrica (T₂ 600 K) la app da
 *         W = 1013,25 J (de V₁), ΔU = 1·20,785·300 = 6235,50 J y Q = 7248,75 J (de n):
 *         ΔU/W = 6,154 y Q/ΔU = 1,162. Con el W que enseña, ΔU = 2.533,13 y Q = 3.546,38 J.
 *       · isocórico: ΔU = V·(P₂ − P₁)/(γ−1) = 0,010·101.325/0,4 = 2.533,13 J; la app, 6235,50.
 *       · isotermo:  W = P₂V₂·ln(V₂/V₁) = 0,5·20·101,325·ln2 = 702,33 J; la app, nRT·ln2 =
 *         1728,85 J. Y su diagrama dibuja P = nRT/V: el punto 1 a 2,4616 atm y el 2 a 1,2308,
 *         con P₁ = 1 atm y P₂ = 0,500 atm impresos al lado.
 *
 *   LÍMITE · Ciclos fuera de su dominio
 *     Otto r = 12: T₂ = 300·12^0,4 = 810,58 K > T pico 800 K → Qh = 20,785·(800 − 810,58) =
 *       −219,82 J, W = −138,46 J, y η = 1 − 12^−0,4 = 62,99 % > η Carnot 62,50 %.
 *     Diesel: la «T pico» NO entra en el cálculo (T₃ = T₂·rc). r = 20: T₃ = 300·20^0,4·2 =
 *       1.988,67 K; η = 1 − 20^−0,4·1,170726 = 64,68 % > «η Carnot» 62,50 %, calculada con
 *       una T pico de 800 K que el ciclo no respeta.
 *
 *   RECHAZO · T = −50 K en «Ley del gas ideal» (calcular P, V 22,4 L, n 1 mol)
 *     Una temperatura absoluta negativa no existe. La app imprime P = 1·8,314·(−50)/0,0224 =
 *     −18.558 Pa = «−0,183 atm». Igual en «Procesos», isobárico con T₂ = −300 K → V₂ = −10 L.
 *
 * Los tests con `test.fail()` afirman lo que DEBERÍA pasar: hoy fallan a propósito. Al
 * reparar, se les quita la marca y se reescribe su comentario en pasado («REPARADO»).
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import { parseSpanishNumber } from '../../lib/formatters';

/** Primera cifra en formato español de un texto («-0,183 atm» → −0,183; «15.314,95 J» → 15314,95). */
function cifra(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,\d+)?/);
  if (!m) throw new Error(`Sin cifra en «${texto}»`);
  return parseSpanishNumber(m[0].replace('−', '-'));
}

/** Fila de resultados por su rótulo exacto (las celdas llevan clases de CSS Modules con hash). */
function filaResultado(page: Page, rotulo: RegExp) {
  return page
    .locator('[class*="resultRow"]')
    .filter({ has: page.locator('[class*="resultLabel"]', { hasText: rotulo }) });
}

async function valorFila(page: Page, rotulo: RegExp): Promise<number> {
  return cifra(await filaResultado(page, rotulo).locator('[class*="resultValue"]').first().innerText());
}

async function abrirPestana(page: Page, nombre: 'Procesos' | 'Ciclos', testigo: string) {
  await page.getByRole('tab', { name: nombre }).click();
  await esperarHidratacion(page, [testigo]);
}

async function escribir(page: Page, selector: string, valor: string, enReact: number | string) {
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, enReact);
}

const PROCESO = {
  isotermo: 'Isotermo (T cte)',
  isobaro: 'Isobárico (P cte)',
  isocoro: 'Isocórico (V cte)',
  adiabatico: 'Adiabático (Q=0)',
} as const;

/** P (atm) que representa en el diagrama P-V de «Procesos» el punto n.º `i` (0 o 1). */
async function presionDibujada(page: Page, i: 0 | 1): Promise<number> {
  const svg = page.locator('svg[aria-label="Diagrama presión-volumen del proceso"]');
  // Geometría fija de page.tsx: padT = 25, plotH = 305; Pmín rotulado en y = 334, Pmáx en y = 33.
  // textContent y no innerText: un <text> de SVG no es un HTMLElement.
  const pMin = cifra((await svg.locator('text[y="334"]').textContent()) ?? '');
  const pMax = cifra((await svg.locator('text[y="33"]').textContent()) ?? '');
  const cy = Number(await svg.locator('circle').nth(i).getAttribute('cy'));
  return pMin + ((25 + 305 - cy) / 305) * (pMax - pMin);
}

/** Un ciclo que se sale de su dominio o se rechaza con aviso o no publica η > η Carnot. */
async function etaNoSuperaCarnot(page: Page) {
  const panel = page.locator('[class*="controlsPanel"]');
  if ((await filaResultado(page, /^Eficiencia η$/).count()) === 0) {
    await expect(panel.locator('[role="alert"], [role="status"]').first()).toBeVisible();
    return;
  }
  const eta = await valorFila(page, /^Eficiencia η$/);
  const etaCarnot = await valorFila(page, /^η Carnot \(cota máx\)$/);
  expect.soft(eta, `η ${eta} % frente a η Carnot ${etaCarnot} %`).toBeLessThanOrEqual(etaCarnot);
  expect.soft(await valorFila(page, /^Calor absorbido Qh$/), 'Qh de un ciclo motor').toBeGreaterThan(0);
}

test.describe('Inspector 28/09/2026 — lo que la app hace bien (candados de regresión)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta', '#P', '#V', '#T', '#n']);
  });

  test('NORMAL · calcular V con P = 2 atm, T = 300 K y n = 0,5 mol da 6,154 L', async ({ page }) => {
    await page.locator('#calcvar').selectOption('V');
    await esperarValorEnReact(page, '#calcvar', 'V');
    await escribir(page, '#P', '2', 2);
    await escribir(page, '#T', '300', 300);
    await escribir(page, '#n', '0.5', 0.5);
    // V = 0,5·8,314·300 / (2·101.325) = 0,00615396 m³ = 6,15396 L. Un error de unidades
    // (atm sin pasar a Pa, L sin pasar a m³) lo movería en un factor ≥ 100: basta con 2 decimales.
    expect(await valorFila(page, /^Volumen V$/)).toBeCloseTo(6.154, 2);
  });

  test('NORMAL · el adiabático de fábrica cumple PVᵞ = cte, TVᵞ⁻¹ = cte y ΔU = −W', async ({ page }) => {
    await abrirPestana(page, 'Procesos', '#P1');
    await page.getByRole('button', { name: PROCESO.adiabatico }).click();
    await expect(page.getByRole('button', { name: PROCESO.adiabatico })).toHaveAttribute('aria-pressed', 'true');
    const p1 = cifra(await page.locator('#P1').inputValue());
    const v1 = cifra(await page.locator('#V1').inputValue());
    const p2 = await valorFila(page, /^P₂$/);
    const v2 = await valorFila(page, /^V₂$/);
    // T₂ = 300·0,5^0,4 = 227,357 K → «227,36 K». No depende de P₁ ni de n.
    expect(await valorFila(page, /^T₂$/)).toBeCloseTo(227.36, 1);
    // P₂/P₁ = 0,5^1,4 = 0,378929 (P₂ sale con 3 decimales: 0,379).
    expect(p2 / p1).toBeCloseTo(0.3789, 3);
    // W = (P₁V₁ − P₂V₂)·101,325/(γ−1) con lo que enseña la propia pantalla: (10 − 7,58)·101,325/0,4
    // ≈ 613 J. El redondeo de P₂ a milésimas mueve ±2,5 J; el defecto que vigila es un ×2,46.
    const wEsperado = ((p1 * v1 - p2 * v2) * 101.325) / 0.4;
    const w = await valorFila(page, /^Trabajo W$/);
    expect(w / wEsperado).toBeCloseTo(1, 1);
    expect(await valorFila(page, /^Calor Q$/)).toBe(0);
    expect(await valorFila(page, /^ΔU$/)).toBeCloseTo(-w, 1);
  });

  test('NORMAL · Carnot de fábrica: η 62,50 %, Qh 15.314,95 J y W 9.571,85 J', async ({ page }) => {
    await abrirPestana(page, 'Ciclos', '#Th');
    // η = 1 − 300/800; Qh = 1·8,314·800·ln(20/2); Qc = 1·8,314·300·ln10; W = Qh − Qc.
    // Confundir ln con log10 lo dividiría por 2,30: medio julio de tolerancia sobra.
    expect(await valorFila(page, /^Eficiencia η$/)).toBeCloseTo(62.5, 1);
    expect(await valorFila(page, /^Calor absorbido Qh$/)).toBeCloseTo(15314.95, 0);
    expect(await valorFila(page, /^Trabajo neto W$/)).toBeCloseTo(9571.85, 0);
  });

  test('NORMAL · a igual compresión (r = 10) el Otto rinde más que el Diesel: 60,19 % frente a 53,39 %', async ({ page }) => {
    await abrirPestana(page, 'Ciclos', '#Th');
    await page.getByRole('button', { name: 'Otto (gasolina)' }).click();
    await esperarHidratacion(page, ['#r']);
    // 1 − 10^−0,4 = 0,601893
    const otto = await valorFila(page, /^Eficiencia η$/);
    expect(otto).toBeCloseTo(60.19, 1);
    await page.getByRole('button', { name: 'Diesel' }).click();
    await esperarHidratacion(page, ['#rc']);
    // 1 − 10^−0,4·(2^1,4 − 1)/(1,4·(2 − 1)) = 1 − 0,398107·1,170726 = 0,533926
    const diesel = await valorFila(page, /^Eficiencia η$/);
    expect(diesel).toBeCloseTo(53.39, 1);
    expect(otto).toBeGreaterThan(diesel);
  });

  test('A11Y · todos los botones llevan type="button" y los selectores de proceso aria-pressed', async ({ page }) => {
    await abrirPestana(page, 'Procesos', '#P1');
    const tipos = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.getAttribute('type')));
    for (const t of tipos) expect(t).toBe('button');
    await page.getByRole('button', { name: PROCESO.isocoro }).click();
    await expect(page.getByRole('button', { name: PROCESO.isocoro })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: PROCESO.isotermo })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('tab', { name: 'Procesos' })).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Inspector 28/09/2026 — hallazgos abiertos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta', '#P', '#V', '#T', '#n']);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): el estado inicial de «Procesos» se teclea con
  // CUATRO campos libres (P₁, V₁, T₁, n) sin exigir PV = nRT, y el de fábrica la incumple
  // (1.013,25 J frente a 2.494,20 J, ×2,4616). El motor mezcla las dos fuentes: P₂, V₂ y el W
  // isobárico salen de P₁V₁; el ΔU, el Q y el W isotermo, de n. Los invariantes de abajo no
  // dependen de cuál sea la fuente buena: los cumple cualquier gas ideal.
  test('HALLAZGO · isobárico de fábrica: ΔU/W = 1/(γ−1) = 2,5 y Q/ΔU = γ = 1,4', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Procesos', '#P1');
    await page.getByRole('button', { name: PROCESO.isobaro }).click();
    await expect(page.getByRole('button', { name: PROCESO.isobaro })).toHaveAttribute('aria-pressed', 'true');
    const w = await valorFila(page, /^Trabajo W$/);
    const q = await valorFila(page, /^Calor Q$/);
    const du = await valorFila(page, /^ΔU$/);
    // Hoy: W 1013,25 · ΔU 6235,50 · Q 7248,75 → ΔU/W = 6,154 y Q/ΔU = 1,162. Con el W que
    // enseña, lo coherente es ΔU = 2.533,13 J y Q = 3.546,38 J. El defecto es un ×2,46.
    expect.soft(du / w, `ΔU ${du} J / W ${w} J`).toBeCloseTo(2.5, 1);
    expect.soft(q / du, `Q ${q} J / ΔU ${du} J`).toBeCloseTo(1.4, 1);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): mismo defecto, isocórico de fábrica hasta 600 K.
  test('HALLAZGO · isocórico de fábrica: ΔU = V·(P₂ − P₁)/(γ−1) con lo que enseña la pantalla', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Procesos', '#P1');
    await page.getByRole('button', { name: PROCESO.isocoro }).click();
    await expect(page.getByRole('button', { name: PROCESO.isocoro })).toHaveAttribute('aria-pressed', 'true');
    const v2 = await valorFila(page, /^V₂$/);
    const p2 = await valorFila(page, /^P₂$/);
    const t2 = await valorFila(page, /^T₂$/);
    const t1 = cifra(await page.locator('#T1').inputValue());
    // P₁ = P₂·T₁/T₂ → ΔU = V₂·P₂·(1 − T₁/T₂)·101,325/0,4 = 10·2·0,5·101,325/0,4 = 2.533,13 J.
    // Hoy: 6235,50 J (= n·Cᵥ·ΔT con n = 1), un ×2,46.
    const esperado = (v2 * p2 * (1 - t1 / t2) * 101.325) / 0.4;
    const du = await valorFila(page, /^ΔU$/);
    expect(du / esperado, `ΔU ${du} J frente a ${esperado.toFixed(2)} J`).toBeCloseTo(1, 1);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): mismo defecto, isotermo de fábrica hasta 20 L.
  test('HALLAZGO · isotermo de fábrica: W = P₂V₂·ln(V₂/V₁) con lo que enseña la pantalla', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Procesos', '#P1');
    await expect(page.getByRole('button', { name: PROCESO.isotermo })).toHaveAttribute('aria-pressed', 'true');
    const v1 = cifra(await page.locator('#V1').inputValue());
    const p2 = await valorFila(page, /^P₂$/);
    const v2 = await valorFila(page, /^V₂$/);
    // 0,5 atm·20 L·101,325·ln 2 = 702,33 J. Hoy: nRT·ln 2 = 1728,85 J, un ×2,46.
    const esperado = p2 * v2 * 101.325 * Math.log(v2 / v1);
    const w = await valorFila(page, /^Trabajo W$/);
    expect(w / esperado, `W ${w} J frente a ${esperado.toFixed(2)} J`).toBeCloseTo(1, 1);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): el diagrama P-V del isotermo dibuja P = nRT/V
  // (punto 1 a 2,4616 atm, punto 2 a 1,2308 atm) mientras el campo dice P₁ = 1 atm y el
  // resultado P₂ = 0,500 atm. Misma causa que los tres anteriores, síntoma distinto: el
  // diagrama contradice los números de su propio panel.
  test('HALLAZGO · el diagrama del isotermo de fábrica sitúa los puntos 1 y 2 en P₁ y P₂', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Procesos', '#P1');
    const p1 = cifra(await page.locator('#P1').inputValue());
    const p2 = await valorFila(page, /^P₂$/);
    // Rótulos del eje a 2 decimales: el error de lectura es < 0,01 atm; el defecto, 1,46 atm.
    expect.soft(Math.abs((await presionDibujada(page, 0)) - p1), 'punto 1 frente a P₁').toBeLessThan(0.05);
    expect.soft(Math.abs((await presionDibujada(page, 1)) - p2), 'punto 2 frente a P₂').toBeLessThan(0.05);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): el ΔU del isobárico y del isocórico usa γ, pero
  // el selector de γ solo se ve en el adiabático. Tras elegir 1,67 allí, el isobárico de fábrica
  // pasa de ΔU 6235,50 J a 3722,69 J (Cᵥ = 8,314/0,67) sin que el panel diga con qué γ calcula.
  test('HALLAZGO · el isobárico enseña el γ con el que calcula ΔU', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Procesos', '#P1');
    await page.getByRole('button', { name: PROCESO.adiabatico }).click();
    await page.locator('#gamma').selectOption('1.67');
    await esperarValorEnReact(page, '#gamma', 1.67);
    await page.getByRole('button', { name: PROCESO.isobaro }).click();
    await expect(page.getByRole('button', { name: PROCESO.isobaro })).toHaveAttribute('aria-pressed', 'true');
    // Control: el ΔU SÍ ha cambiado con ese γ oculto (1·(8,314/0,67)·300 = 3722,69 J).
    expect(await valorFila(page, /^ΔU$/)).toBeCloseTo(3722.69, 0);
    await expect(page.locator('[class*="controlsPanel"]')).toContainText('1,67');
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): nada rechaza una temperatura absoluta negativa
  // (ni un n negativo): la app imprime presiones y volúmenes negativos. Con n vaciado (→ 0)
  // el isobárico imprime W = Q = 1013,25 J para un gas sin moles.
  test('HALLAZGO · T = −50 K no produce una presión negativa', async ({ page }) => {
    test.fail();
    await escribir(page, '#T', '-50', -50);
    // Hoy: P = 1·8,314·(−50)/0,0224 m³ = −18.558 Pa → «-0,183 atm».
    if ((await filaResultado(page, /^Presión P$/).count()) > 0) {
      expect.soft(await valorFila(page, /^Presión P$/), 'P con T = −50 K').toBeGreaterThanOrEqual(0);
    }
    await abrirPestana(page, 'Procesos', '#P1');
    await page.getByRole('button', { name: PROCESO.isobaro }).click();
    await escribir(page, '#T2', '-300', -300);
    // Hoy: V₂ = 10·(−300/300) = «-10,000 L».
    if ((await filaResultado(page, /^V₂$/).count()) > 0) {
      expect.soft(await valorFila(page, /^V₂$/), 'V₂ con T₂ = −300 K').toBeGreaterThanOrEqual(0);
    }
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): al cambiar «Calcular», el campo que se habilita
  // recupera el valor tecleado ANTES, no el recién calculado, así que no se puede comprobar un
  // resultado despejando otra variable. V = 11,2 L → P = 2,001 atm; al pasar a calcular V, P
  // vuelve a 1 y V sale 22,413 L en vez de 11,20 L.
  test('HALLAZGO · despejar P y luego V devuelve el volumen de partida', async ({ page }) => {
    test.fail();
    await escribir(page, '#V', '11.2', 11.2);
    // P = 1·8,314·273,15/0,0112 = 202.765 Pa = 2,00114 atm → «2,001 atm».
    expect(await valorFila(page, /^Presión P$/)).toBeCloseTo(2.001, 3);
    await page.locator('#calcvar').selectOption('V');
    await esperarValorEnReact(page, '#calcvar', 'V');
    // Con P = 2,00114 (o 2,001 redondeado) → V = 11,200 (11,201) L. Hoy 22,413 L: 11 L de error.
    expect(await valorFila(page, /^Volumen V$/)).toBeCloseTo(11.2, 1);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): mismo mecanismo. Al vaciar V (→ 0) el resultado
  // desaparece sin ningún aviso y el campo «calculado» P vuelve a enseñar el 1 de fábrica, que
  // no sale de ningún cálculo: «Estado actual» dice P 1,000 atm con V 0,000 L.
  test('HALLAZGO · con V vaciado el campo calculado no enseña un P que no salió de ningún cálculo', async ({ page }) => {
    test.fail();
    await escribir(page, '#V', '', 0);
    expect.soft(await page.locator('#P').inputValue(), 'P deshabilitado').not.toBe('1');
    const estado = page.locator('div', { has: page.locator('p', { hasText: /^Estado actual$/ }) }).last();
    await expect.soft(estado).not.toContainText('1,000 atm');
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): el Otto no comprueba que la T pico supere la T
  // tras la compresión. r = 12 (dentro del 8-12 que cita la propia guía): T₂ = 810,58 K > 800 K,
  // Qh = −219,82 J, W = −138,46 J y η = 62,99 % impresa junto a una η Carnot de 62,50 %.
  test('HALLAZGO · Otto con r = 12: no publica una η mayor que la de Carnot', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Ciclos', '#Th');
    await page.getByRole('button', { name: 'Otto (gasolina)' }).click();
    await esperarHidratacion(page, ['#r']);
    await escribir(page, '#r', '12', 12);
    await etaNoSuperaCarnot(page);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): en el Diesel la «T pico» no entra en el cálculo
  // (T₃ = T₂·rc), solo en la η Carnot de referencia. De 800 a 2000 K el trabajo sigue en
  // 11.707,93 J; y con r = 20 (dentro del 15-22 que cita la guía) η = 64,68 % > «Carnot» 62,50 %,
  // con un T₃ real de 1.988,67 K.
  test('HALLAZGO · Diesel: la T pico cuenta y la η no supera la de Carnot', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Ciclos', '#Th');
    await page.getByRole('button', { name: 'Diesel' }).click();
    await esperarHidratacion(page, ['#rc']);
    if ((await page.locator('#Tho').count()) > 0) {
      const w800 = await valorFila(page, /^Trabajo neto W$/);
      await escribir(page, '#Tho', '2000', 2000);
      expect.soft(await valorFila(page, /^Trabajo neto W$/), 'W con T pico 2000 K frente a 800 K').not.toBeCloseTo(w800, 0);
      await escribir(page, '#Tho', '800', 800);
    }
    await escribir(page, '#r', '20', 20);
    await etaNoSuperaCarnot(page);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): el campo P₂ del isobárico no tiene nombre
  // accesible (<label> sin htmlFor y <input> sin id): un lector de pantalla anuncia «1» a secas.
  test('HALLAZGO · el campo P₂ del isobárico tiene nombre accesible', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Procesos', '#P1');
    await page.getByRole('button', { name: PROCESO.isobaro }).click();
    await expect(page.getByRole('spinbutton', { name: /P₂/ })).toHaveCount(1);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): la FAQ del JSON-LD (la que leen los asistentes de
  // IA) afirma «El Diesel tiene mayor eficiencia teórica a igual relación de compresión». Es al
  // revés, y lo dicen la propia app (r = 10: Otto 60,19 %, Diesel 53,39 %; test de arriba) y la
  // FAQ visible («el Otto es más eficiente en términos absolutos para el mismo r»).
  test('HALLAZGO · la FAQ del JSON-LD no dice que el Diesel rinde más a igual compresión', async ({ page }) => {
    test.fail();
    const ld = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join('\n'),
    );
    expect(ld).toContain('FAQPage');
    expect(ld).not.toMatch(/Diesel tiene mayor eficiencia te[óo]rica a igual relaci[óo]n de compresi[óo]n/);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): el «%» va con espacio normal (U+0020) y no con el
  // duro (U+00A0) que manda el CLAUDE.md desde el 25/09/2026: en los resultados de «Ciclos»
  // («62,50 %») y en el texto nuevo de la sección de aula del 28/09 («tolerancia del 1 %»).
  test('HALLAZGO · el % va con espacio duro', async ({ page }) => {
    test.fail();
    // toContainText normaliza los espacios (el duro también): se lee el texto crudo.
    const aula = (await page.locator('section[aria-labelledby="casos-aula-titulo"]').textContent()) ?? '';
    expect.soft(aula, 'intro de la sección de aula').toMatch(/tolerancia del 1\u00A0%/);
    await abrirPestana(page, 'Ciclos', '#Th');
    const eta = await filaResultado(page, /^Eficiencia η$/).locator('[class*="resultValue"]').first().textContent();
    expect.soft(eta ?? '', 'η del ciclo').toMatch(/\u00A0%$/);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): en el isocórico el rango de V es 0 y el respaldo
  // `|| 1` está en m³: el eje V del diagrama va de −90,0 L a 110,0 L para un proceso a 10 L.
  test('HALLAZGO · el eje V del diagrama isocórico no empieza en un volumen negativo', async ({ page }) => {
    test.fail();
    await abrirPestana(page, 'Procesos', '#P1');
    await page.getByRole('button', { name: PROCESO.isocoro }).click();
    await expect(page.getByRole('button', { name: PROCESO.isocoro })).toHaveAttribute('aria-pressed', 'true');
    const svg = page.locator('svg[aria-label="Diagrama presión-volumen del proceso"]');
    // Rótulos de V en y = padT + plotH + 15 = 345; el primero es el mínimo.
    // textContent y no innerText: un <text> de SVG no es un HTMLElement.
    expect(cifra((await svg.locator('text[y="345"]').first().textContent()) ?? '')).toBeGreaterThanOrEqual(0);
  });
});
