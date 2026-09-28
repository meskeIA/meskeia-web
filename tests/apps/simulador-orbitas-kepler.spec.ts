import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * simulador-orbitas-kepler · casos para clase (tarea de tipo A, 28/09/2026)
 *
 * La app es de las que tienen profesores dentro (37 visitas de aula, el 57 % de su tráfico),
 * y hasta hoy no tenía nada que asignar. Los doce casos viven en `casos.ts` y calculan con el
 * MISMO `calcularOrbita` de `motor.ts` que pinta el panel de «Resultados»: se EXTRAJO del
 * `useMemo` de page.tsx sin tocar una operación.
 *
 * CONVENIO DE ESTA APP:
 *   · G = 6,674·10⁻¹¹, M_Tierra = 5,972·10²⁴ kg, R_Tierra = 6.371 km, M_Sol = 1,989·10³⁰ kg,
 *     1 UA = 149.597.870,7 km, año juliano = 365,25 días (tabla NASA/IAU de motor.ts);
 *   · distancias al CENTRO del cuerpo; «altura» solo cuando el enunciado lo dice;
 *   · el periodo no depende ni de la excentricidad ni de la masa del satélite.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano, con T = 2π·√(a³/GM), sin mirar la app):
 *   1 · T_B = 3 h · 4^1,5 = 3 · 8                                               = 24 h
 *   2 · a_B/a_A = 8^(2/3)                                                        = 4
 *   3 · a = 2,656·10⁷ m: T = 43.079,3 s = 11,9665 h                             → 11,97 h
 *   4 · a = 6.371 + 420 = 6.791 km: T = 5.569,6 s = 92,827 min                   → 92,8 min
 *       (olvidar el radio da 1,43 min: suspende)
 *   5 · v = √(GM/a) = √(3,98571·10¹⁴ / 4,2164·10⁷) = 3.074,55 m/s               → 3,07 km/s
 *   6 · v_esc = √2 · 7,5 = 10,6066                                               → 10,61 km/s
 *   7 · r_apo = a(1 + e) = 20.000 · 1,25                                         = 25.000 km
 *   8 · e = (42.000 − 7.000)/(42.000 + 7.000) = 0,714286                         → 0,71
 *   9 · r_peri = 26.600 · 0,26 = 6.916 km; altura = 6.916 − 6.371               = 545 km
 *  10 · v_p/v_a = (1 + e)/(1 − e) = 1,2056/0,7944 = 1,51762                      → 1,52
 *  11 · a = 4 UA: T = 2,52436·10⁸ s = 7,99914 años (4^1,5 = 8 con la Tierra de patrón) → 8,00
 *  12 · M = 4π²a³/(G·T²), a = 4,218·10⁸ m, T = 1,77 · 86.400 s = 1,8981·10²⁷ kg → 1,90
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  comprobarRespuesta,
  toleranciaDe,
  generarEjercicioAleatorio,
  configuracionSimulador,
} from '../../app/simulador-orbitas-kepler/casos';
import { G, UA, ANIO, CUERPOS, calcularOrbita } from '../../app/simulador-orbitas-kepler/motor';

const RUTA = '/simulador-orbitas-kepler/';

const A_MANO: Readonly<Record<number, number>> = {
  1: 24,
  2: 4,
  3: 11.97,
  4: 92.8,
  5: 3.07,
  6: 10.61,
  7: 25000,
  8: 0.71,
  9: 545,
  10: 1.52,
  11: 8,
  12: 1.9,
};

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («11,97 h» → 2). */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

const redondeo = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;
const tierra = CUERPOS.find((c) => c.id === 'tierra')!;

test.describe('simulador-orbitas-kepler · casos para clase', () => {
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

  test('7 · el convenio queda fijado: constantes de la app, distancias al centro, T sin e ni masa', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO[caso.id]);
    }

    // (b) Las constantes del convenio.
    expect(G).toBe(6.674e-11);
    expect(UA).toBe(1.495978707e11);
    expect(ANIO).toBe(365.25 * 86400);
    expect(tierra.masa).toBe(5.972e24);
    expect(tierra.radio).toBe(6.371e6);

    // (c) El periodo no depende de la excentricidad ni de la masa del satélite (tercera ley).
    const circular = calcularOrbita(26600, 0, tierra, 1000);
    expect(calcularOrbita(26600, 0.74, tierra, 1000).periodo).toBeCloseTo(circular.periodo, 6);
    expect(calcularOrbita(26600, 0, tierra, 50).periodo).toBeCloseTo(circular.periodo, 6);

    // (d) El error clásico del caso 4: usar la altura como distancia al centro.
    const olvidoRadio = calcularOrbita(420, 0, tierra, 1000).periodo / 60; // 1,43 min
    expect(olvidoRadio).toBeCloseTo(1.43, 2);
    expect(comprobarRespuesta(olvidoRadio, 92.8).correcto).toBe(false);

    // (e) Con G = 6,67 y M = 5,97·10²⁴ (los redondeos de los libros) el caso 3 sigue bien.
    const libro = (2 * Math.PI * Math.sqrt(2.656e7 ** 3 / (6.67e-11 * 5.97e24))) / 3600;
    expect(comprobarRespuesta(libro, 11.97).correcto).toBe(true);
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    expect(comprobarRespuesta(92.8, 92.8).correcto).toBe(true);
    expect(comprobarRespuesta(NaN, 24).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 24).motivo).not.toMatch(/NaN/);
    expect(toleranciaDe(0)).toBe(0.01);
    expect(toleranciaDe(545)).toBeCloseTo(5.45, 10);
    // Borde exacto de la tolerancia, por los dos lados (hallazgo 1211 del 22/09/2026).
    expect(comprobarRespuesta(0.72, 0.71).correcto).toBe(true);
    expect(comprobarRespuesta(0.7, 0.71).correcto).toBe(true);
  });

  test('9 · lo que se puede cargar en el simulador cabe en sus controles', async () => {
    for (const caso of CASOS) {
      const cfg = configuracionSimulador(caso.datos);
      if (!cfg) continue;
      expect(Number.isInteger(cfg.semiejeKm), `caso ${caso.id}`).toBe(true);
      expect(cfg.excentricidad, `caso ${caso.id}`).toBeGreaterThanOrEqual(0);
      expect(cfg.excentricidad, `caso ${caso.id}`).toBeLessThanOrEqual(0.95);
    }
    // Los que se piden por proporción o por la masa no tienen órbita que cargar.
    for (const id of [1, 2, 6, 12]) {
      expect(configuracionSimulador(CASOS[id - 1].datos), `caso ${id}`).toBeNull();
    }
  });
});

test.describe('simulador-orbitas-kepler · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta', '#semieje']);
  });

  test('el caso 4 se carga en el simulador y el panel da la cifra de la solución', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 4:/ }).click();
    await seccion(page).getByRole('button', { name: /Cargar en el simulador/ }).click();
    // Tierra, a = 6.791 km, e = 0: T = 5.569,6 s → «92,8 minutos» en el veredicto de arriba.
    await expect(page.locator('#semieje')).toHaveValue('6791');
    await expect(page.getByText('Una vuelta cada 92,8 minutos')).toBeVisible();

    await seccion(page).locator('#casos-respuesta').fill('92,8');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');
  });

  test('el error de la altura se rechaza y la solución enseña la unidad', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 4:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('1,43');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).not.toContainText('Correcto');

    const verSolucion = seccion(page).getByRole('button', { name: /Ver solución/ });
    await expect(verSolucion).toHaveAttribute('aria-expanded', 'false');
    await verSolucion.click();
    await expect(seccion(page).getByRole('button', { name: /Ocultar solución/ })).toHaveAttribute('aria-expanded', 'true');
    await expect(seccion(page)).toContainText('92,8 min');
  });

  test('el simulador de arriba sigue funcionando con la sección añadida', async ({ page }) => {
    // Preset GPS: a = 26.560 km, e = 0 → 11,97 h, la misma cifra que el caso 3.
    await page.getByRole('button', { name: 'GPS', exact: true }).click();
    await expect(page.getByText('Una vuelta cada 11,97 horas')).toBeVisible();
  });
});
