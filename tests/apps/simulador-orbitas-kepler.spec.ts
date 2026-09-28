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
import {
  G,
  UA,
  ANIO,
  CUERPOS,
  PRESETS,
  calcularOrbita,
  perimetroElipse,
} from '../../app/simulador-orbitas-kepler/motor';

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
 *   LÍMITE · e = 0,95 (el máximo del deslizador el día de la inspección) con a = 1 UA alrededor del Sol
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
    // Estado inicial: Tierra, a = 42.164 km, e = 0. Aquí 2πa/T es la velocidad media de verdad
    // (L = 2πa), y así sigue tras reparar la fila para las órbitas excéntricas (hallazgo 2333).
    await expect(veredicto(page)).toContainText('Una vuelta cada 23,94 horas');
    for (const etiqueta of ['En el perigeo', 'En el apogeo', 'Media orbital', 'Circular a r = a']) {
      await expect(fila(page, etiqueta), etiqueta).toHaveText('3,075 km/s');
    }
    await expect(fila(page, 'De escape en el perigeo')).toHaveText('4,348 km/s');
  });

  // 0,95 era el máximo del deslizador hasta el 28/09/2026; desde el hallazgo 2339 llega a 0,99.
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

  // REPARADO (28/09/2026) · hallazgo 2333: «Media orbital» se calculaba como 2πa/T = √(μ/a) —el
  // perímetro de una CIRCUNFERENCIA de radio a entre el periodo—, así que en toda órbita
  // excéntrica sobrestimaba la velocidad media (camino recorrido / T = L/T) y además repetía
  // siempre la cifra de «Circular a r = a». Ahora es `perimetroElipse(a, e) / T` (motor.ts, por
  // la media aritmético-geométrica de Gauss).
  // Caso: Sol → «Cometa Halley» → esperado ≈ 4,825 km/s (L = 4,29806·a) · antes «7,054 km/s».
  // Tolerancia: toBeCloseTo(…, 1) = |Δ| < 0,05 km/s: admite cualquier aproximación seria del
  // perímetro y rechaza el defecto, que se desviaba 2,23 km/s (Halley), 0,60 km/s (Molniya) y
  // 0,51 km/s (Mercurio). El texto exacto va aparte: el motor da 4,8252 · 47,3681 · 3,2683.
  test('REPARADO · «Media orbital» es el perímetro de la elipse entre T', async ({ page }) => {
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Cometa Halley').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 75,31 años');
    expect.soft(kms(await fila(page, 'Media orbital').innerText()), 'Halley').toBeCloseTo(4.825, 1);
    await expect.soft(fila(page, 'Media orbital'), 'Halley').toHaveText('4,825 km/s');
    // Y ya no repite la circular (√(μ/a) = 7,054 km/s).
    await expect.soft(fila(page, 'Circular a r = a'), 'Halley').toHaveText('7,054 km/s');

    // Mercurio: L/T = 47,368 km/s con las constantes de la app (NASA: 47,36).
    await orbitaReal(page, 'Mercurio').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 87,96 días');
    expect.soft(kms(await fila(page, 'Media orbital').innerText()), 'Mercurio').toBeCloseTo(47.37, 1);
    await expect.soft(fila(page, 'Media orbital'), 'Mercurio').toHaveText('47,368 km/s');

    // Molniya: L = 5,30510·a → L/T = 3,268 km/s (la app daba 3,871).
    await cuerpo(page, 'Tierra').click();
    await orbitaReal(page, 'Molniya').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 11,99 horas');
    expect.soft(kms(await fila(page, 'Media orbital').innerText()), 'Molniya').toBeCloseTo(3.268, 1);
    await expect.soft(fila(page, 'Media orbital'), 'Molniya').toHaveText('3,268 km/s');
  });

  // REPARADO (28/09/2026) · hallazgo 2333, el motor sin navegador: el perímetro de la elipse
  // contra la integración numérica hecha a mano (Simpson, 200.000 intervalos, fuera del motor):
  // L/a = 4,298062 (e = 0,967) · 5,305102 (0,74) · 6,216250 (0,2056) · 4,113903 (0,99) · 2π (0).
  test('REPARADO · perimetroElipse coincide con la integral hecha a mano, y en e = 0 da 2πa', async () => {
    expect(perimetroElipse(1, 0)).toBeCloseTo(2 * Math.PI, 12);
    expect(perimetroElipse(1, 0.2056)).toBeCloseTo(6.21625, 5);
    expect(perimetroElipse(1, 0.74)).toBeCloseTo(5.305102, 5);
    expect(perimetroElipse(1, 0.967)).toBeCloseTo(4.298062, 5);
    expect(perimetroElipse(1, 0.99)).toBeCloseTo(4.113903, 5);
    // En e = 0 la media es la circular; en cuanto hay excentricidad, estrictamente menor.
    const geo = calcularOrbita(42_164, 0, tierra, 1000);
    expect(geo.vMedia).toBeCloseTo(geo.vCircular, 6);
    const molniya = calcularOrbita(26_600, 0.74, tierra, 1000);
    expect(molniya.vMedia).toBeLessThan(molniya.vCircular);
    expect(molniya.vMedia / 1000).toBeCloseTo(3.2683, 4);
  });

  // REPARADO (28/09/2026) · hallazgo 2334: la nota de Calisto decía «Completa la resonancia
  // 1:2:4 con Ío y Europa». La resonancia de Laplace 1:2:4 es de Ío, Europa y GANIMEDES; Calisto
  // no está en ella. Lo enseña la propia app: Ío 1,77 días · Europa 3,55 · Ganimedes 7,16 (≈ 4×)
  // · Calisto 16,69 (9,4× Ío). Periodos JPL SSD (satélites, elementos medios): 1,76 · 3,53 ·
  // 7,16 · 16,69 días. La resonancia pasa a la nota de Ganimedes, que es a quien corresponde.
  // Caso: Júpiter → «Calisto» → esperado: ninguna resonancia 1:2:4 atribuida a Calisto ·
  // antes «Completa la resonancia 1:2:4 con Ío y Europa».
  test('REPARADO · la nota de Calisto no le atribuye la resonancia 1:2:4, que es de Ganimedes', async ({ page }) => {
    await cuerpo(page, 'Júpiter').click();
    await orbitaReal(page, 'Calisto').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 16,69 días');
    await expect(page.locator('[class*="presetNota"]')).not.toContainText('1:2:4');

    await orbitaReal(page, 'Ganimedes').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 7,16 días');
    await expect(page.locator('[class*="presetNota"]')).toContainText('1:2:4');
  });

  // REPARADO (28/09/2026) · hallazgo 2335: al cargar la Luna, el veredicto decía «Una vuelta
  // cada 27,45 días» y la nota que hay debajo, «27,3 días de periodo sidéreo», sin explicar la
  // diferencia. La app usa μ = G·M_Tierra y la Luna tiene el 1,23 % de esa masa: con G·(M + m)
  // sale 27,29 días (JPL: 27,322).
  // DECISIÓN: no se cambia el motor. «La masa del satélite no influye en el periodo» es lo que
  // enseña la app (FAQ, pista de la masa y caso 7(c) de arriba), y la Luna es justo el ejemplo de
  // dónde esa aproximación deja de valer. Lo que se repara es la contradicción muda: la nota da
  // ahora el periodo REAL, dice por qué el simulador marca algo más y da la cifra con G·(M + m).
  // El test original pedía que la primera cifra de la nota coincidiera con el veredicto; con la
  // nota explicativa esa lectura ya no aplica, así que se afirma lo que la nota debe decir.
  // A mano: T(G·M) = 2π·√(3,844·10⁸³ / 3,985713·10¹⁴) = 2.371.929 s = 27,4529 d → «27,45 días»;
  // T(G·(M + m)), m = 7,346·10²² kg (NASA Moon Fact Sheet) = 27,2856 d → «27,29 días»;
  // m/M = 7,346·10²² / 5,972·10²⁴ = 1,230 % → «1,2 %».
  test('REPARADO · la Luna: la nota explica por qué su periodo real no es el del veredicto', async ({ page }) => {
    await orbitaReal(page, 'Luna').click();
    await expect(veredicto(page)).toContainText('Una vuelta cada 27,45 días');
    const nota = page.locator('[class*="presetNota"]');
    await expect(nota).toContainText('27,32 días'); // periodo sidéreo real (JPL: 27,322)
    await expect(nota).toContainText('G·(M + m)');
    await expect(nota).toContainText('27,29 días');
    // El % de la nota, con espacio duro (hallazgo 2337).
    expect(await nota.evaluate((el) => el.textContent)).toContain('1,2\u00A0% de la masa de la Tierra');

    // La cifra con G·(M + m) de la nota, recalculada fuera del motor.
    const a = 384_400e3;
    const conMasaLuna = (2 * Math.PI * Math.sqrt(a ** 3 / (G * (5.972e24 + 7.346e22)))) / 86400;
    expect(redondeo(conMasaLuna, 2)).toBe(27.29);
    expect(PRESETS.tierra.find((p) => p.id === 'luna')?.nota).toContain('27,29 días');
  });

  // REPARADO (28/09/2026) · hallazgo 2336: el veredicto escribía «alrededor de el Sol» y
  // «alrededor de Tierra», y la nota de la tercera ley «alrededor de Sol» / «alrededor de
  // Tierra». Ahora los dos (y la descripción accesible del dibujo, con el mismo defecto) usan
  // `deCuerpo` de casos.ts: «del Sol», «de la Tierra», «de Marte», «de Júpiter».
  // Caso: Sol → «Tierra» → esperado «…alrededor del Sol» · antes «…alrededor de el Sol».
  test('REPARADO · «alrededor del Sol» y «de la Tierra», con su contracción y su artículo', async ({ page }) => {
    const dibujo = page.locator('svg[role="img"]');
    await expect.soft(veredicto(page)).toContainText('alrededor de la Tierra');
    await expect.soft(page.getByText(/cualquier órbita alrededor de la Tierra/)).toBeVisible();
    await expect.soft(dibujo).toHaveAttribute('aria-label', /alrededor de la Tierra,/);
    await cuerpo(page, 'Sol').click();
    await orbitaReal(page, 'Tierra').click();
    await expect(veredicto(page)).toContainText('365,21 días');
    await expect.soft(veredicto(page)).toContainText('alrededor del Sol');
    await expect.soft(veredicto(page)).not.toContainText('de el Sol');
    await expect.soft(page.getByText(/cualquier órbita alrededor del Sol/)).toBeVisible();
    await expect.soft(dibujo).toHaveAttribute('aria-label', /alrededor del Sol,/);
    await cuerpo(page, 'Marte').click();
    await expect.soft(veredicto(page)).toContainText('alrededor de Marte');
  });

  // REPARADO (28/09/2026) · hallazgo 2337: «Fracción del periodo» separaba el % con un espacio
  // normal (U+0020), no con el espacio duro (U+00A0) que exige el CLAUDE.md (decisión del
  // 25/09/2026: se corrige cuando pasa el Inspector). Ahora sale de `formatPercentage`; el otro
  // % visible de la app (paso de la solución del caso 11 y nota de la Luna) también va con U+00A0.
  // Caso: carga con movimiento reducido → esperado «0,0 %» con U+00A0 · antes con U+0020.
  test('REPARADO · el porcentaje de «Fracción del periodo» va con espacio duro', async ({ page }) => {
    // Sobre el textContent CRUDO: toHaveText normaliza los espacios y da U+00A0 = U+0020.
    await expect(fila(page, 'Fracción del periodo')).toHaveText(/%$/);
    // El paso de comprobación del caso 11 («la diferencia es del 0,01 %»), también con U+00A0.
    const pasoCaso11 = CASOS[10].pasos.find((p) => p.includes('%'));
    expect(pasoCaso11).toContain('0,01\u00A0%');
    expect(pasoCaso11).not.toContain('0,01\u0020%');
    expect(await fila(page, 'Fracción del periodo').evaluate((el) => el.textContent)).toBe('0,0 %');
  });

  // REPARADO (28/09/2026) · hallazgo 2338: el campo del semieje hacía `Number(v) || 1`. Al
  // vaciarlo con la tecla de borrar, el estado saltaba a 1 y el campo se rellenaba solo con «1»;
  // lo que se escribía después quedaba DETRÁS: quien borraba 42164 y tecleaba 7000 obtenía
  // 17000 km. Mismo manejador: «-5000» se aceptaba, la etiqueta decía «-5000 km» y el cálculo
  // usaba 1 km sin decirlo («El perigeo queda a 1,0 km del centro»).
  // Ahora el campo es de texto con su propio estado, se lee con `parseSpanishNumber` y un valor
  // vacío, no numérico o < 1 km (el tope del motor) no llega al cálculo: se avisa debajo del
  // campo, en región viva, diciendo con qué semieje siguen los resultados. El campo muestra las
  // cifras sin puntos de millar («42164», como antes el type="number"): borrando cifras de
  // «42.164» saldría «42.16», que en español es 42,16 km. La cifra agrupada está en la etiqueta.
  // Caso: borrar el campo con Retroceso y teclear 7000 → esperado a = 7.000 km, T = 5.828,7 s
  // = 97,15 min («Una vuelta cada 97,1 minutos») · antes 17000 km, «6,13 horas».
  test('REPARADO · borrar el semieje y teclear 7000 deja 7000 km, no 17000', async ({ page }) => {
    const campo = page.locator('#semieje');
    const aviso = page.locator('#semieje-aviso');
    await expect(campo).toHaveValue('42164');
    await campo.click();
    await page.keyboard.press('End');
    for (let i = 0; i < 6; i++) await page.keyboard.press('Backspace');
    // Vacío: se queda vacío (no se rellena con «1») y se dice con qué semieje sigue el cálculo.
    // Ese semieje es el ÚLTIMO número válido que hubo en el campo: cada retroceso dejaba uno
    // (4216 → 421 → 42 → 4) y el cálculo es en vivo, así que es 4 km, el mismo de la etiqueta.
    await expect(campo).toHaveValue('');
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
    await expect(aviso).toContainText('Escribe el semieje mayor en km.');
    await expect(aviso).toContainText('los resultados siguen siendo los de a = 4 km');
    await expect(page.locator('label[for="semieje"]')).toContainText('4 km');

    await page.keyboard.type('7000');
    await expect(campo).toHaveValue('7000');
    await expect(veredicto(page)).toContainText('Una vuelta cada 97,1 minutos');
    await expect(aviso).toHaveText('');
    await expect(campo).toHaveAttribute('aria-invalid', 'false');
  });

  // REPARADO (28/09/2026) · hallazgo 2338, la otra mitad: el negativo (y el cero, y lo que no
  // es un número) ya no se calcula en silencio con 1 km. Y el formato español se lee como tal:
  // «6.771» son 6.771 km (400 km de altura), T = 2π·√(6,771·10⁶³ / 3,985713·10¹⁴) = 5.545,1 s
  // = 92,42 min → «92,4 minutos». Con el antiguo type="number" el navegador lo leía como 6,771.
  test('REPARADO · un semieje negativo, cero o no numérico se rechaza y se dice, sin calcular con 1 km', async ({ page }) => {
    const campo = page.locator('#semieje');
    const aviso = page.locator('#semieje-aviso');
    const etiqueta = page.locator('label[for="semieje"]');

    await campo.fill('-5000');
    await esperarValorEnReact(page, '#semieje', '-5000');
    await expect(aviso).toContainText('El semieje mayor tiene que ser de al menos 1 km.');
    await expect(aviso).toContainText('los resultados siguen siendo los de a = 42.164 km');
    await expect(etiqueta).toContainText('42.164 km');
    await expect(veredicto(page)).toContainText('Una vuelta cada 23,94 horas');
    await expect(veredicto(page)).not.toContainText('1,0 km del centro');

    await campo.fill('0');
    await esperarValorEnReact(page, '#semieje', '0');
    await expect(aviso).toContainText('El semieje mayor tiene que ser de al menos 1 km.');
    await expect(veredicto(page)).toContainText('Una vuelta cada 23,94 horas');

    await campo.fill('abc');
    await esperarValorEnReact(page, '#semieje', 'abc');
    await expect(aviso).toContainText('«abc» no es un número');
    await expect(veredicto(page)).toContainText('Una vuelta cada 23,94 horas');

    await campo.fill('6.771');
    await esperarValorEnReact(page, '#semieje', '6.771');
    await expect(aviso).toHaveText('');
    await expect(etiqueta).toContainText('6771 km');
    await expect(veredicto(page)).toContainText('Una vuelta cada 92,4 minutos');
  });

  // REPARADO (28/09/2026) · la masa del satélite tenía la misma forma que el hallazgo 2338
  // (`Math.max(Number(v) || 0, 0)` en un type="number"): vaciarla la ponía a 0 y un negativo se
  // cambiaba a 0 sin decirlo. Mismo tratamiento que el semieje. Solo mueve la energía total:
  // geoestacionaria, ε = μ/2a = 3,985713·10¹⁴ / 8,4328·10⁷ = 4.726.440,6 J/kg →
  // 1.000 kg: «−4,726 GJ» · 500 kg: «−2,363 GJ».
  test('REPARADO · la masa del satélite: vacía o negativa se avisa y no se inventa', async ({ page }) => {
    const campo = page.locator('#masa');
    const aviso = page.locator('#masa-aviso');
    const energia = fila(page, 'Total del satélite');
    await expect(campo).toHaveValue('1000');
    await expect(energia).toHaveText('−4,726 GJ');

    await campo.fill('');
    await esperarValorEnReact(page, '#masa', '');
    await expect(campo).toHaveValue('');
    await expect(aviso).toContainText('Escribe la masa del satélite en kg.');
    await expect(aviso).toContainText('se calcula con 1000 kg');
    await expect(energia).toHaveText('−4,726 GJ');

    await campo.fill('500');
    await esperarValorEnReact(page, '#masa', '500');
    await expect(aviso).toHaveText('');
    await expect(energia).toHaveText('−2,363 GJ');

    await campo.fill('-3');
    await esperarValorEnReact(page, '#masa', '-3');
    await expect(aviso).toContainText('La masa del satélite no puede ser negativa.');
    await expect(energia).toHaveText('−2,363 GJ');
  });

  // REPARADO (28/09/2026) · sospecha de la sesión: «T²/a³» salía en notación de programador,
  // «9,9050e-14 s²/m³». Ahora usa `cientifico` de casos.ts, la misma de las soluciones.
  // A mano: 4π²/μ. Tierra: 39,478418 / 3,985713·10¹⁴ = 9,904983·10⁻¹⁴ → «9,905·10⁻¹⁴».
  // Sol: 39,478418 / 1,327459·10²⁰ = 2,973985·10⁻¹⁹ → «2,974·10⁻¹⁹».
  test('REPARADO · T²/a³ en notación científica española, no «9,9050e-14»', async ({ page }) => {
    await expect(fila(page, 'T²/a³ (tercera ley)')).toHaveText('9,905·10⁻¹⁴ s²/m³');
    await cuerpo(page, 'Sol').click();
    await expect(veredicto(page)).toContainText('365,21 días');
    await expect(fila(page, 'T²/a³ (tercera ley)')).toHaveText('2,974·10⁻¹⁹ s²/m³');
  });

  // REPARADO (28/09/2026) · hallazgo 2339: la órbita real «Cometa Halley» pone e = 0,967 en el
  // estado, pero el deslizador llegaba solo a 0,95: el control se quedaba en 0.95 (es lo que
  // anunciaba un lector de pantalla, con la etiqueta diciendo 0,967) y, al pulsar ← una vez, la
  // excentricidad saltaba de 0,967 a 0,949 en vez de a 0,966. El máximo es ahora
  // EXCENTRICIDAD_MAX = 0,99 (motor.ts), el mismo tope que ya aplicaba el motor.
  // Caso: Sol → «Cometa Halley» → esperado deslizador en 0.967 · antes 0.95; ← → esperado
  // «0,966» · antes «0,949».
  test('REPARADO · el deslizador de e refleja la excentricidad de Halley (0,967)', async ({ page }) => {
    await expect(page.locator('#excentricidad')).toHaveAttribute('max', '0.99');
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
