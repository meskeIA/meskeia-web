import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 28/09/2026 — primera inspección (segmento cálculo, riesgo 3)
 *
 * QUÉ PROMETE: <h1> «Simulador de Órbitas y Leyes de Kepler» · «Periodo, velocidades y energía
 * de una órbita a partir del semieje mayor y la excentricidad». Todo sale de `calcularOrbita`
 * (motor.ts) con G = 6,674·10⁻¹¹ y las masas de la app: μ_Sol = 1,327459·10²⁰ m³/s²,
 * μ_Tierra = 3,985713·10¹⁴ m³/s².
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (fórmulas escritas aparte, sin importar
 * el motor: T = 2π·√(a³/μ), vis-viva v = √(μ·(2/r − 1/a)), r = a(1 ∓ e)):
 *
 *   NORMAL · Sol, órbita real «Tierra» (a = 149.598.000 km, e = 0,0167)
 *     T = 31.554.264 s = 365,211 días                              → «365,21 días»
 *     r_p = 147.099.713 km → «147,100 millones de km» · r_a = 152.096.287 km → «152,096…»
 *     v_p = 30.290,1 m/s → «30,290 km/s» · v_a = 29.295,0 m/s → «29,295 km/s»
 *     (NASA Earth Fact Sheet: máx. 30,29 km/s, mín. 29,29 km/s) · (1+e)/(1−e) = 1,03397 → «1,034»
 *
 *   LÍMITE · e = 0 (estado inicial, geoestacionaria a = 42.164 km)
 *     T = 86.166,7 s = 23,9352 h → «23,94 horas» · v = √(μ/a) = 3.074,55 m/s → «3,075 km/s» en
 *     perigeo, apogeo, circular y media (en una circunferencia 2πa/T SÍ es la velocidad media)
 *     v_esc = √(2μ/a) = 4.348,08 m/s → «4,348 km/s»
 *   LÍMITE · e = 0,95 (el máximo del deslizador) con a = 1 UA alrededor del Sol
 *     T no cambia: «365,21 días» · r_p = 0,05·a = 7.479.900 km → «7,480 millones de km»
 *     v_p = 29.788,43·√39 = 186.028,7 m/s → «186,029 km/s» · v_a = 29.788,43·√(0,05/1,95)
 *     = 4.769,97 m/s → «4,770 km/s» · (1+e)/(1−e) = 39 → «39,000»
 *
 *   RECHAZO · Tierra, a = 5.000 km < R = 6.371 km → r_p < R: «La órbita corta la superficie»,
 *     «a 5000 km del centro … (6371 km)». Borde: a = 6.371 km, e = 0 → r_p = R, que NO es < R:
 *     T = 5.061,0 s = 84,35 min → «Una vuelta cada 84,4 minutos».
 *
 *   SOSPECHA DE LA SESIÓN DE AULA · «Media orbital» = 2πa/T = √(μ/a): es IDÉNTICA a la fila
 *     «Circular a r = a» para cualquier e. La velocidad media en el tiempo es el camino recorrido
 *     entre el tiempo, L/T, con L = 4a·E(e) (integral elíptica completa de 2.ª especie,
 *     integrada numéricamente; Ramanujan II da lo mismo a 6 cifras):
 *       Halley   e = 0,967  → L = 4,29806·a → L/T = 4.825,2 m/s «4,825»  · app «7,054» (+46,2 %)
 *       Molniya  e = 0,74   → L = 5,30510·a → L/T = 3.268,3 m/s «3,268»  · app «3,871» (+18,4 %)
 *       Mercurio e = 0,2056 → L = 6,21625·a → L/T = 47.368 m/s «47,368»  · app «47,878» (+1,1 %)
 *     Ancla externa del convenio: la NASA Mercury Fact Sheet da «Mean orbital velocity 47.36
 *     km/s» (con μ_Sol = 1,32712·10²⁰), que es L/T y NO √(μ/a) = 47,87. La propia app advierte
 *     en «Errores frecuentes» que √(GM/r) solo vale en órbitas circulares.
 *     (√(μ/a) sí es la media CUADRÁTICA de la velocidad en el tiempo —virial—, pero la fila no
 *     dice eso: dice «Media orbital» y se calcula como el perímetro de una circunferencia entre T.)
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspector 28/09/2026 — cálculo, límites, rechazo y la «Media orbital»', () => {
  const veredicto = (page: Page) => page.locator('section[role="status"]');
  const cuerpo = (page: Page, nombre: string) =>
    page.locator('[class*="cuerposGrid"] button').filter({ hasText: nombre });
  const orbitaReal = (page: Page, nombre: string) => page.getByRole('button', { name: nombre, exact: true });
  /** El valor de una fila de «Resultados», localizada por su etiqueta EXACTA. */
  const fila = (page: Page, etiqueta: string) =>
    page
      .locator('[class*="resultRow"]')
      .filter({ has: page.getByText(etiqueta, { exact: true }) })
      .locator('span')
      .nth(1);
  /** «4,825 km/s» → 4,825 · «913,6 m/s» → 0,9136: la velocidad en km/s. */
  const kms = (texto: string): number => {
    const m = texto.match(/(\d[\d.]*(?:,\d+)?)\s*(km\/s|m\/s)/);
    if (!m) return NaN;
    const n = Number(m[1].replace(/\./g, '').replace(',', '.'));
    return m[2] === 'm/s' ? n / 1000 : n;
  };

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#semieje', '#excentricidad', '#masa']);
  });

  test('NORMAL · la Tierra alrededor del Sol: tercera ley y vis-viva en los dos extremos', async ({ page }) => {
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Tierra').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 365,21 días');
    await expect(fila(page, 'Perihelio')).toHaveText('147,100 millones de km');
    await expect(fila(page, 'Afelio')).toHaveText('152,096 millones de km');
    await expect(fila(page, 'En el perihelio')).toHaveText('30,290 km/s');
    await expect(fila(page, 'En el afelio')).toHaveText('29,295 km/s');
    await expect(fila(page, 'Semieje mayor en UA')).toHaveText('1,000 UA');
    await expect(page.getByText(/= 1,034$/)).toBeVisible();
  });

  test('LÍMITE e = 0 · en la geoestacionaria todas las velocidades coinciden (3,075 km/s)', async ({ page }) => {
    // Estado inicial: Tierra, a = 42.164 km, e = 0. Aquí 2πa/T es la velocidad media de verdad,
    // y así debe seguir cuando se repare la fila para las órbitas excéntricas.
    await expect(veredicto(page)).toContainText('Una vuelta cada 23,94 horas');
    for (const etiqueta of ['En el perigeo', 'En el apogeo', 'Media orbital', 'Circular a r = a']) {
      await expect(fila(page, etiqueta), etiqueta).toHaveText('3,075 km/s');
    }
    await expect(fila(page, 'De escape en el perigeo')).toHaveText('4,348 km/s');
  });

  test('LÍMITE e = 0,95 · el periodo no se mueve y los extremos siguen la vis-viva', async ({ page }) => {
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Tierra').click(); // parte de e = 0,0167: sembrar 0,95 SÍ mueve el estado
    await sembrarValor(page, '#excentricidad', '0.95');
    await expect(veredicto(page)).toContainText('Una vuelta cada 365,21 días');
    await expect(fila(page, 'Perihelio')).toHaveText('7,480 millones de km');
    await expect(fila(page, 'En el perihelio')).toHaveText('186,029 km/s');
    await expect(fila(page, 'En el afelio')).toHaveText('4,770 km/s');
    await expect(page.getByText(/= 39,000$/)).toBeVisible();
  });

  test('RECHAZO · a = 5.000 km alrededor de la Tierra corta la superficie; a = R la roza sin cortarla', async ({ page }) => {
    await page.locator('#semieje').fill('5000');
    await esperarValorEnReact(page, '#semieje', 5000);
    await expect(veredicto(page)).toContainText('La órbita corta la superficie');
    await expect(veredicto(page)).toContainText('a 5000 km del centro');
    await expect(veredicto(page)).toContainText('(6371 km)');

    await page.locator('#semieje').fill('6371');
    await esperarValorEnReact(page, '#semieje', 6371);
    await expect(veredicto(page)).toContainText('Una vuelta cada 84,4 minutos');
  });

  test('Halley: extremos por vis-viva coherentes con la FAQ (≈ 54 km/s y < 1 km/s)', async ({ page }) => {
    // a = 2.667.950.000 km, e = 0,967: T = 75,306 años · v_p = 54.458,6 m/s · v_a = 913,64 m/s
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Cometa Halley').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 75,31 años');
    await expect(fila(page, 'En el perihelio')).toHaveText('54,459 km/s');
    await expect(fila(page, 'En el afelio')).toHaveText('913,6 m/s');
  });

  test('Mercurio: velocidades extremas frente a la NASA Mercury Fact Sheet (58,97 y 38,86 km/s)', async ({ page }) => {
    // Con las constantes de la app: v_p = 58.982,0 m/s y v_a = 38.864,7 m/s. La NASA usa
    // μ_Sol = 1,32712·10²⁰ (la app 1,32746·10²⁰): toBeCloseTo(…, 1) admite |Δ| < 0,05 km/s.
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Mercurio').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 87,96 días');
    expect(kms(await fila(page, 'En el perihelio').innerText())).toBeCloseTo(58.97, 1);
    expect(kms(await fila(page, 'En el afelio').innerText())).toBeCloseTo(38.86, 1);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): «Media orbital» se calcula como 2πa/T = √(μ/a) —el
  // perímetro de una CIRCUNFERENCIA de radio a entre el periodo—, así que en toda órbita
  // excéntrica sobrestima la velocidad media (camino recorrido / T = L/T) y además repite
  // siempre la cifra de «Circular a r = a».
  // Caso: Sol → «Cometa Halley» → esperado ≈ 4,825 km/s (L = 4,29806·a) · obtenido «7,054 km/s».
  // Tolerancia: toBeCloseTo(…, 1) = |Δ| < 0,05 km/s: admite cualquier aproximación seria del
  // perímetro y rechaza el defecto, que se desvía 2,23 km/s (Halley), 0,60 km/s (Molniya) y
  // 0,51 km/s (Mercurio).
  test('HALLAZGO ABIERTO · «Media orbital» debe ser el perímetro de la elipse entre T', async ({ page }) => {
    test.fail();
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Cometa Halley').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 75,31 años');
    expect.soft(kms(await fila(page, 'Media orbital').innerText()), 'Halley').toBeCloseTo(4.825, 1);

    // Mercurio: L/T = 47,368 km/s con las constantes de la app (NASA: 47,36).
    await orbitaReal(page, 'Mercurio').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 87,96 días');
    expect.soft(kms(await fila(page, 'Media orbital').innerText()), 'Mercurio').toBeCloseTo(47.37, 1);

    // Molniya: L = 5,30510·a → L/T = 3,268 km/s (la app da 3,871).
    await cuerpo(page, 'Tierra').click();
    await orbitaReal(page, 'Molniya').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 11,99 horas');
    expect.soft(kms(await fila(page, 'Media orbital').innerText()), 'Molniya').toBeCloseTo(3.268, 1);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): la nota de Calisto dice «Completa la resonancia
  // 1:2:4 con Ío y Europa». La resonancia de Laplace 1:2:4 es de Ío, Europa y GANIMEDES; Calisto
  // no está en ella. Lo enseña la propia app: Ío 1,77 días · Europa 3,55 · Ganimedes 7,16 (≈ 4×)
  // · Calisto 16,69 (9,4× Ío). Periodos JPL SSD (satélites, elementos medios): 1,76 · 3,53 ·
  // 7,16 · 16,69 días.
  // Caso: Júpiter → «Calisto» → esperado: ninguna resonancia 1:2:4 atribuida a Calisto ·
  // obtenido «Completa la resonancia 1:2:4 con Ío y Europa».
  test('HALLAZGO ABIERTO · la nota de Calisto no puede atribuirle la resonancia 1:2:4', async ({ page }) => {
    test.fail();
    await cuerpo(page, 'Júpiter').click();
    await orbitaReal(page, 'Calisto').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 16,69 días');
    await expect(page.locator('[class*="presetNota"]')).not.toContainText('1:2:4');
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): al cargar la Luna, el veredicto dice «Una vuelta
  // cada 27,45 días» y la nota que hay debajo, «27,3 días de periodo sidéreo». La app usa μ =
  // G·M_Tierra y la Luna tiene el 1,23 % de esa masa: con G·(M + m) sale 27,29 días (JPL: 27,322).
  // Caso: Tierra → «Luna» → esperado: el periodo del veredicto y el de la nota coinciden a una
  // décima · obtenido 27,45 frente a 27,3. (Si la nota deja de dar cifra, no hay contradicción.)
  test('HALLAZGO ABIERTO · la Luna: el periodo mostrado y el de su nota deben coincidir', async ({ page }) => {
    test.fail();
    await orbitaReal(page, 'Luna').click();
    await expect(veredicto(page)).toContainText('días');
    const nota = await page.locator('[class*="presetNota"]').innerText();
    const enNota = nota.match(/(\d+,\d+) días/);
    if (!enNota) return;
    const enVeredicto = (await veredicto(page).innerText()).match(/cada (\d+,\d+) días/);
    expect(enVeredicto, 'el veredicto da el periodo en días').not.toBeNull();
    const dias = (t: string) => Number(t.replace(',', '.'));
    // toBeCloseTo(…, 1) = |Δ| < 0,05 días: la nota da una décima; el defecto se desvía 0,15.
    expect(dias(enVeredicto![1])).toBeCloseTo(dias(enNota[1]), 1);
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): el veredicto escribe «alrededor de el Sol» y
  // «alrededor de Tierra», y la nota de la tercera ley «alrededor de Sol» / «alrededor de
  // Tierra». casos.ts ya resuelve el artículo (`deCuerpo`: «del Sol», «de la Tierra»).
  // Caso: Sol → «Tierra» → esperado «…alrededor del Sol» · obtenido «…alrededor de el Sol».
  test('HALLAZGO ABIERTO · «alrededor del Sol» y «de la Tierra», con su contracción y su artículo', async ({ page }) => {
    test.fail();
    await expect.soft(veredicto(page)).toContainText('alrededor de la Tierra');
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Tierra').click();
    await expect(veredicto(page)).toContainText('365,21 días');
    await expect.soft(veredicto(page)).toContainText('alrededor del Sol');
    await expect.soft(veredicto(page)).not.toContainText('de el Sol');
    await expect.soft(page.getByText(/cualquier órbita alrededor del Sol/)).toBeVisible();
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): «Fracción del periodo» separa el % con un espacio
  // normal (U+0020), no con el espacio duro (U+00A0) que exige el CLAUDE.md (decisión del
  // 25/09/2026: se corrige cuando pasa el Inspector).
  // Caso: carga con movimiento reducido → esperado «0,0 %» con U+00A0 · obtenido con U+0020.
  test('HALLAZGO ABIERTO · el porcentaje de «Fracción del periodo» va con espacio duro', async ({ page }) => {
    test.fail();
    // Sobre el textContent CRUDO: toHaveText normaliza los espacios y da U+00A0 = U+0020.
    await expect(fila(page, 'Fracción del periodo')).toHaveText(/%$/);
    expect(await fila(page, 'Fracción del periodo').evaluate((el) => el.textContent)).toBe('0,0 %');
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): el campo del semieje hace `Number(v) || 1`. Al
  // vaciarlo con la tecla de borrar, el estado salta a 1 y el campo se rellena solo con «1»; lo
  // que se escribe después queda DETRÁS: quien borra 42164 y teclea 7000 obtiene 17000 km.
  // Mismo manejador: «-5000» se acepta, la etiqueta dice «-5000 km» y el cálculo usa 1 km sin
  // decirlo («El perigeo queda a 1,0 km del centro»).
  // Caso: borrar el campo con Retroceso y teclear 7000 → esperado a = 7.000 km, T = 5.828,7 s
  // = 97,15 min («Una vuelta cada 97,1 minutos») · obtenido 17000 km, «6,13 horas».
  test('HALLAZGO ABIERTO · borrar el semieje y teclear 7000 deja 7000 km, no 17000', async ({ page }) => {
    test.fail();
    const campo = page.locator('#semieje');
    await campo.click();
    await page.keyboard.press('End');
    for (let i = 0; i < 6; i++) await page.keyboard.press('Backspace');
    await page.keyboard.type('7000');
    await expect(campo).toHaveValue('7000');
    await expect(veredicto(page)).toContainText('Una vuelta cada 97,1 minutos');
  });

  // HALLAZGO ABIERTO (inspector 28/09/2026): la órbita real «Cometa Halley» pone e = 0,967 en
  // el estado, pero el deslizador llega solo a 0,95: el control se queda en 0.95 (es lo que
  // anuncia un lector de pantalla, con la etiqueta diciendo 0,967) y, al pulsar ← una vez, la
  // excentricidad salta de 0,967 a 0,949 en vez de a 0,966.
  // Caso: Sol → «Cometa Halley» → esperado deslizador en 0.967 · obtenido 0.95; ← → esperado
  // «0,966» · obtenido «0,949».
  test('HALLAZGO ABIERTO · el deslizador de e refleja la excentricidad de Halley (0,967)', async ({ page }) => {
    test.fail();
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Cometa Halley').click();
    const etiqueta = page.locator('label[for="excentricidad"]');
    await expect(etiqueta).toContainText('0,967');
    const deslizador = page.locator('#excentricidad');
    await expect.soft(deslizador).toHaveValue('0.967');
    await deslizador.focus();
    await page.keyboard.press('ArrowLeft');
    await expect.soft(etiqueta).toContainText('0,966');
  });
});
