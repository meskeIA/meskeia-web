import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

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
