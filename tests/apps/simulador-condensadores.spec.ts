import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
} from '../../app/simulador-condensadores/casos';
import { DIELECTRICOS, EPSILON_0 } from '../../app/simulador-condensadores/motor';

/**
 * Simulador de Condensadores — PASO 4.bis de /nueva-app-meskeia (06/10/2026)
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador de Condensadores» y el subtítulo «Capacidad, carga, campo y energía
 *   de un condensador (capacitor) de placas paralelas, el efecto del dieléctrico y la carga y
 *   descarga de un circuito RC». Tres partes:
 *     1) entradas A (cm²), d (mm), V (V) y un dieléctrico con botones aria-pressed; tarjetas
 *        «Capacidad C», «Carga Q = C·V», «Campo E = V/d», «Energía U = ½·C·V²».
 *     2) experimento: el mismo condensador en VACÍO a la V de la batería, lleno después con el
 *        dieléctrico elegido, con la batería conectada (V fija) o desconectada (Q fija). Tabla
 *        «En vacío / Con dieléctrico / Cambio».
 *     3) circuito RC: C de la parte 1 o tecleada en µF, R en kΩ, carga/descarga con
 *        aria-pressed y un deslizador t de 0 a 5τ (paso 0,05τ).
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO ANTES DE ABRIR EL NAVEGADOR
 *   ε₀ = 8,8541878128·10⁻¹² F/m (CODATA 2018). Presets: Serway y Jewett, tabla 26.1.
 *   La vista imprime con prefijo SI y 3 cifras decimales si la cifra es < 10, 2 si es < 100 y
 *   1 si es ≥ 100 (función `conPrefijo` de page.tsx); el campo va en V/m sin decimales.
 *
 *   Caso 1 — A = 100 cm² = 0,01 m², d = 1 mm = 0,001 m, vacío, V = 12 V
 *     C = ε₀·A/d     = 8,8541878128·10⁻¹² · 0,01 / 0,001 = 8,8541878128·10⁻¹¹ F → «88,54 pF»
 *     Q = C·V        = 12 · 8,8541878128·10⁻¹¹ = 1,0625025·10⁻⁹ C            → «1,063 nC»
 *     E = V/d        = 12 / 0,001 = 12.000 V/m                                → «12.000 V/m»
 *     U = ½·C·V²     = 72 · 8,8541878128·10⁻¹¹ = 6,375015·10⁻⁹ J             → «6,375 nJ»
 *     Con A = 200 cm² todo lo que lleva C se dobla: C = 177,0838 pF → «177,1 pF»,
 *     U = 12,75003 nJ → «12,75 nJ»; E no depende de A: sigue en «12.000 V/m».
 *
 *   Caso 2 — el mismo con papel (εr = 3,7)
 *     C = 3,7 · 88,541878 pF = 327,60495 pF → «327,6 pF» (es el dieléctrico por defecto).
 *
 *   Caso 3 — meter el papel en el de vacío cargado a 12 V
 *     Conectada (V fija):    V 12 → 12 («12,00 V», «igual»)
 *                            Q 1,0625025 → 3,7·1,0625025 = 3,931259 nC («3,931 nC», «× 3,70»)
 *     Desconectada (Q fija): V 12 → 12/3,7 = 3,243243 V («3,243 V», «÷ 3,70»)
 *                            Q 1,0625025 nC sin cambio («1,063 nC», «igual»)
 *                            E 12.000 → 3.243,243 V/m («3243 V/m»: con cuatro cifras es-ES no agrupa)
 *                            U 6,375015 → 6,375015/3,7 = 1,722977 nJ («1,723 nJ»)
 *
 *   Caso 4 — circuito RC, V = 12 V
 *     Con la C de la parte 1 (papel, 327,60495 pF) y R = 1.000 kΩ = 10⁶ Ω:
 *       τ = 10⁶ · 3,2760495·10⁻¹⁰ = 3,2760495·10⁻⁴ s → «327,6 µs»
 *     Tecleando C = 2 µF:  τ = 10⁶ · 2·10⁻⁶ = 2 s → «2,000 s»
 *     Tecleando C = 1 µF:  τ = 1 s → «1,000 s»
 *     Carga en t = τ (posición inicial del deslizador):
 *       V_C = 12·(1 − e⁻¹) = 12 · 0,6321206 = 7,585447 V → «7,585 V», «63,2 %»
 *       I   = (12/10⁶)·e⁻¹ = 4,414553 µA → «4,415 µA» · I₀ = 12/10⁶ = 12 µA → «12,00 µA»
 *     Descarga en t = τ: V_C = 12·e⁻¹ = 4,414553 V → «4,415 V», «36,8 %»
 *     Descarga en t = 2τ (20 pulsaciones de flecha a 0,05τ desde 1τ):
 *       V_C = 12·e⁻² = 12 · 0,1353353 = 1,624023 V → «1,624 V», «13,5 %»
 *
 *   Caso 5 — rechazo: separación 0 (y área negativa) no tienen condensador. Ninguna tarjeta,
 *     ningún dibujo, y un mensaje que dice qué falta; la parte 2, que toma C de la 1, tampoco
 *     calcula. Ni NaN ni ∞ en la página.
 *
 *   Caso 6 — RelatedApps pinta las 4 tarjetas registradas en data/app-relations.ts.
 */

const AREA = 'input[aria-label="Área de cada placa (cm²)"]';
const SEPARACION = 'input[aria-label="Separación entre placas d (mm)"]';
const TENSION = 'input[aria-label="Tensión de la batería V (V)"]';
const RESISTENCIA = 'input[aria-label="Resistencia R (kΩ)"]';
const CAPACIDAD = 'input[aria-label="Capacidad C (µF)"]';
const TIEMPO = '#tiempo-rc';

/** El valor de una tarjeta, localizado por su etiqueta (las clases van con hash). '' si no está. */
async function leerTarjeta(page: Page, etiqueta: string): Promise<string> {
  return page.evaluate((lab) => {
    for (const d of document.querySelectorAll('div')) {
      const sp = d.querySelectorAll(':scope > span');
      if (sp.length === 2 && sp[0].textContent?.trim() === lab) {
        return sp[1].textContent?.trim() ?? '';
      }
    }
    return '';
  }, etiqueta);
}

/** Las tres celdas (vacío, con dieléctrico, cambio) de una fila de la tabla del experimento. */
function filaExperimento(page: Page, magnitud: string): Locator {
  return page
    .locator('tbody tr')
    .filter({ has: page.locator('th[scope="row"]', { hasText: new RegExp(`^${magnitud}$`) }) })
    .locator('td');
}

/** Escribe en un NumberInput y espera a que el estado de React lo tenga. */
async function escribir(page: Page, selector: string, valor: string): Promise<void> {
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, valor);
}

function boton(page: Page, nombre: RegExp): Locator {
  return page.getByRole('button', { name: nombre });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-condensadores/');
  await esperarHidratacion(page, [AREA, SEPARACION, TENSION, RESISTENCIA, TIEMPO]);
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 1 — 100 cm², 1 mm, vacío, 12 V', () => {
  test('C = 88,54 pF, Q = 1,063 nC, E = 12.000 V/m, U = 6,375 nJ', async ({ page }) => {
    const vacio = boton(page, /^Vacío/);
    await vacio.click();
    await expect(vacio).toHaveAttribute('aria-pressed', 'true');
    await expect(boton(page, /^Papel/)).toHaveAttribute('aria-pressed', 'false');

    await expect.poll(() => leerTarjeta(page, 'Capacidad C')).toBe('88,54 pF');
    expect(await leerTarjeta(page, 'Carga Q = C·V')).toBe('1,063 nC');
    expect(await leerTarjeta(page, 'Campo E = V/d')).toBe('12.000 V/m');
    expect(await leerTarjeta(page, 'Energía U = ½·C·V²')).toBe('6,375 nJ');
  });

  test('doblar el área dobla C y U, y no toca E', async ({ page }) => {
    // 100, 1 y 12 son los valores con los que arranca: sembrarlos no probaría que la app escucha
    await boton(page, /^Vacío/).click();
    await escribir(page, AREA, '200');
    await expect.poll(() => leerTarjeta(page, 'Capacidad C')).toBe('177,1 pF');
    expect(await leerTarjeta(page, 'Energía U = ½·C·V²')).toBe('12,75 nJ');
    expect(await leerTarjeta(page, 'Campo E = V/d')).toBe('12.000 V/m');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 2 — papel (εr = 3,7)', () => {
  test('C = 327,6 pF, y al volver a vacío 88,54 pF', async ({ page }) => {
    // El papel es el dieléctrico de arranque: se pasa por vacío para ver que el botón actúa
    await boton(page, /^Vacío/).click();
    await expect.poll(() => leerTarjeta(page, 'Capacidad C')).toBe('88,54 pF');
    const papel = boton(page, /^Papel/);
    await papel.click();
    await expect(papel).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => leerTarjeta(page, 'Capacidad C')).toBe('327,6 pF');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 3 — batería conectada o desconectada al meter el papel', () => {
  test('conectada: V igual y Q × 3,70', async ({ page }) => {
    await boton(page, /^Papel/).click();
    const conectada = boton(page, /^Batería conectada/);
    await conectada.click();
    await expect(conectada).toHaveAttribute('aria-pressed', 'true');

    await expect(filaExperimento(page, 'Tensión V')).toHaveText(['12,00 V', '12,00 V', 'igual']);
    await expect(filaExperimento(page, 'Carga Q')).toHaveText(['1,063 nC', '3,931 nC', '× 3,70']);
    await expect(filaExperimento(page, 'Capacidad C')).toHaveText(['88,54 pF', '327,6 pF', '× 3,70']);
  });

  test('desconectada: V pasa a 3,243 V, Q igual, E y U ÷ 3,70', async ({ page }) => {
    await boton(page, /^Papel/).click();
    const desconectada = boton(page, /^Batería desconectada/);
    await desconectada.click();
    await expect(desconectada).toHaveAttribute('aria-pressed', 'true');
    await expect(boton(page, /^Batería conectada/)).toHaveAttribute('aria-pressed', 'false');

    await expect(filaExperimento(page, 'Tensión V')).toHaveText(['12,00 V', '3,243 V', '÷ 3,70']);
    await expect(filaExperimento(page, 'Carga Q')).toHaveText(['1,063 nC', '1,063 nC', 'igual']);
    await expect(filaExperimento(page, 'Campo E')).toHaveText(['12.000 V/m', '3243 V/m', '÷ 3,70']);
    await expect(filaExperimento(page, 'Energía U')).toHaveText(['6,375 nJ', '1,723 nJ', '÷ 3,70']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 4 — circuito RC con R = 1 MΩ', () => {
  test('con la C de la parte 1 (papel), τ = 327,6 µs', async ({ page }) => {
    await expect(boton(page, /^C de la parte 1/)).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => leerTarjeta(page, 'Constante de tiempo τ = R·C')).toBe('327,6 µs');
  });

  test('C tecleada: 2 µF da τ = 2 s y 1 µF da τ = 1 s; carga y descarga en τ y 2τ', async ({ page }) => {
    const tecleada = boton(page, /^Teclear C en µF/);
    await tecleada.click();
    await expect(tecleada).toHaveAttribute('aria-pressed', 'true');
    await esperarHidratacion(page, [CAPACIDAD]);

    // Arranca en 1 µF: primero 2 µF para ver que el campo manda, y luego el caso de 1 µF
    await escribir(page, CAPACIDAD, '2');
    await expect.poll(() => leerTarjeta(page, 'Constante de tiempo τ = R·C')).toBe('2,000 s');
    await escribir(page, CAPACIDAD, '1');
    await expect.poll(() => leerTarjeta(page, 'Constante de tiempo τ = R·C')).toBe('1,000 s');

    // Carga en t = τ
    const carga = boton(page, /^Carga$/);
    const descarga = boton(page, /^Descarga$/);
    await expect(carga).toHaveAttribute('aria-pressed', 'true');
    await expect(descarga).toHaveAttribute('aria-pressed', 'false');
    expect(await leerTarjeta(page, 'Tensión V_C(t)')).toBe('7,585 V');
    expect(await leerTarjeta(page, 'Carga acumulada (de la máxima)')).toMatch(/^63,2\s%$/);
    expect(await leerTarjeta(page, 'Corriente I(t)')).toBe('4,415 µA');
    expect(await leerTarjeta(page, 'Corriente inicial V/R')).toBe('12,00 µA');

    // Descarga en t = τ
    await descarga.click();
    await expect(descarga).toHaveAttribute('aria-pressed', 'true');
    await expect(carga).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => leerTarjeta(page, 'Tensión V_C(t)')).toBe('4,415 V');
    expect(await leerTarjeta(page, 'Carga que queda (de la máxima)')).toMatch(/^36,8\s%$/);

    // Descarga en t = 2τ: de 1τ a 2τ son 20 pasos de 0,05τ
    const deslizador = page.locator(TIEMPO);
    await deslizador.focus();
    for (let i = 0; i < 20; i++) await deslizador.press('ArrowRight');
    await expect(deslizador).toHaveValue('2');
    await expect.poll(() => leerTarjeta(page, 'Tensión V_C(t)')).toBe('1,624 V');
    expect(await leerTarjeta(page, 'Carga que queda (de la máxima)')).toMatch(/^13,5\s%$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 5 — rechazo: sin cifras inventadas', () => {
  test('separación 0: sin tarjetas ni dibujo, y dice qué falta', async ({ page }) => {
    await expect.poll(() => leerTarjeta(page, 'Capacidad C')).toBe('327,6 pF');
    await escribir(page, SEPARACION, '0');

    await expect(
      page.getByText('Para calcular falta la separación entre placas (mayor que 0).'),
    ).toBeVisible();
    expect(await leerTarjeta(page, 'Capacidad C')).toBe('');
    expect(await leerTarjeta(page, 'Energía U = ½·C·V²')).toBe('');
    await expect(page.getByText('El dibujo aparece cuando los datos son válidos.')).toBeVisible();
    await expect(page.getByText('Completa los datos de la parte 1 para ver el experimento.')).toBeVisible();
    await expect(page.getByText(/Para la parte 2 falta los datos de la parte 1/)).toBeVisible();
    expect(await leerTarjeta(page, 'Constante de tiempo τ = R·C')).toBe('');

    const texto = await page.locator('main').innerText();
    expect(texto).not.toMatch(/NaN|∞|Infinity|No definido/);
  });

  test('área negativa: lo mismo, nombrando el área', async ({ page }) => {
    await escribir(page, AREA, '-5');
    await expect(page.getByText('Para calcular falta el área de las placas (mayor que 0).')).toBeVisible();
    expect(await leerTarjeta(page, 'Capacidad C')).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 6 — apps relacionadas', () => {
  test('RelatedApps pinta 4 tarjetas', async ({ page }) => {
    await esperarPaginaAsentada(page);
    await expect(page.locator('section[aria-label="Aplicaciones relacionadas"] a')).toHaveCount(4);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (skill /casos-aula-meskeia, 06/10/2026) — `casos.ts` sin navegador
 *
 * Cada clave, resuelta a mano desde la definición ANTES de leer lo que devuelve la app. El
 * convenio que hay que vigilar es ε₀: la app usa CODATA (8,8541878128·10⁻¹²) y en clase se usa
 * 8,85·10⁻¹². Los casos que dependen de ε₀ se recalculan AQUÍ con los dos valores, con
 * fórmulas escritas en este test, y los dos tienen que redondear a la clave.
 *    1 · C = ε₀·0,004/0,0015 = 23,611 pF (clase 23,600) → 23,6   · sin pasar cm²: 236.112
 *    2 · C = 3,7·ε₀·0,01/0,0005 = 655,2 pF; Q = 12·C = 7,8625 nC → 7,86 · sin εr: 2,12
 *    3 · E = 150/0,0025 = 60.000 V/m = 60 kV/m (no usa ε₀)        · en V/m: 60.000
 *    4 · C = ε₀·0,005/0,0025 = 17,708 pF; U = ½·C·24² = 5,100 nJ → 5,10 · sin el ½: 10,20
 *    5 · d = ε₀·1,00059·10⁻⁴/(0,5·10⁻¹²) = 1,7719 mm → 1,77       · en m: 0,00
 *    6 · U₀ = ½·(ε₀·0,005/0,0015)·12² = 2,125 nJ; conectada ×5,6 = 11,90 → 11,9 · desconectada: 0,38
 *    7 · desconectada: V′ = 74/3,7 = 20 V                          · conectada: 74
 *    8 · U₀ = ½·(ε₀·0,005/0,001)·24² = 12,75 nJ; desconectada ÷2,1 = 6,071 → 6,07 · conectada: 26,78
 *    9 · τ = 220.000·2,2·10⁻⁶ = 0,484 s = 484 ms                   · en segundos: 0,484
 *   10 · τ = 0,47 s, t = 2τ: 9·(1 − e⁻²) = 7,782 V → 7,78          · e^(−t/τ): 1,22 · t = τ: 5,69
 *   11 · τ = 1 s: I = (12/2000)·e^(−1,5) = 1,3388 mA → 1,34        · la inicial: 6 · 1 − e: 4,66
 *   12 · τ = 2,2 s: t = −2,2·ln(1 − 8/12) = 2,2·ln 3 = 2,4169 → 2,42 · τ: 2,2 · descarga: 0,89
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_AULA: Record<number, number> = {
  1: 23.6,
  2: 7.86,
  3: 60,
  4: 5.1,
  5: 1.77,
  6: 11.9,
  7: 20,
  8: 6.07,
  9: 484,
  10: 7.78,
  11: 1.34,
  12: 2.42,
};

const EPSILON_CLASE = 8.85e-12;

/**
 * Las respuestas que dependen de ε₀, escritas aquí desde la definición (no con casos.ts ni con
 * el motor), para un ε₀ cualquiera. Cada una en la unidad que pide su caso.
 */
const CON_EPSILON: Record<number, (e0: number) => number> = {
  1: (e0) => ((e0 * 0.004) / 0.0015) / 1e-12,
  2: (e0) => (((e0 * 3.7 * 0.01) / 0.0005) * 12) / 1e-9,
  4: (e0) => (0.5 * ((e0 * 0.005) / 0.0025) * 24 * 24) / 1e-9,
  5: (e0) => ((e0 * 1.00059 * 1e-4) / 0.5e-12) * 1000,
  6: (e0) => (0.5 * ((e0 * 0.005) / 0.0015) * 144 * 5.6) / 1e-9,
  8: (e0) => (0.5 * ((e0 * 0.005) / 0.001) * 576) / 2.1 / 1e-9,
};

const redondeoAula = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

function casoAula(id: number) {
  const caso = CASOS.find((c) => c.id === id);
  if (!caso) throw new Error(`No existe el caso ${id}`);
  return caso;
}

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («7,86 nC» → 2). */
function decimalesMostradosAula(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

test.describe('simulador-condensadores · casos para clase', () => {
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
      expect(redondeoAula(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
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
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|chilenos|argentinos)|Bachillerato|selectividad)\b/i;
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostradosAula(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(!exacto);
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
      const r = resolverCaso(m.datos);
      expect(redondeoAula(r.valor, m.datos.decimales ?? 2)).toBe(m.respuesta);
      // C, Q y U son proporcionales a ε₀: con el de clase tiene que redondear a lo mismo.
      if (['capacidad', 'carga', 'energia'].includes(m.datos.magnitud)) {
        const clase = (r.valor * EPSILON_CLASE) / EPSILON_0;
        expect(redondeoAula(clase, m.datos.decimales ?? 2), m.enunciado).toBe(m.respuesta);
      }
    }
  });

  test('7 · el convenio queda fijado: claves a mano y ε₀ de clase = ε₀ CODATA tras redondear', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera de este bloque.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
    }

    // (b) Los casos con ε₀: con CODATA y con 8,85·10⁻¹² redondean a la clave, y el enunciado
    // declara 8,85·10⁻¹². Los que no dependen de ε₀ no lo nombran.
    for (const caso of CASOS) {
      const f = CON_EPSILON[caso.id];
      const d = caso.datos.decimales ?? 2;
      if (f) {
        expect(redondeoAula(f(EPSILON_0), d), `caso ${caso.id} con CODATA`).toBe(caso.respuesta);
        expect(redondeoAula(f(EPSILON_CLASE), d), `caso ${caso.id} con 8,85·10⁻¹²`).toBe(caso.respuesta);
        expect(caso.enunciado, `caso ${caso.id}`).toMatch(/ε₀ = 8,85·10⁻¹²/);
      } else {
        expect(caso.enunciado, `caso ${caso.id}`).not.toMatch(/8,85/);
      }
    }

    // (c) Un caso que nombra un dieléctrico escribe la εr de la MISMA lista que los botones.
    for (const caso of CASOS) {
      const id = caso.datos.dielectrico;
      if (!id || id === 'vacio') continue;
      const material = DIELECTRICOS.find((m) => m.id === id);
      expect(material, `caso ${caso.id}: dieléctrico ${id}`).toBeDefined();
      const er = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 5 }).format(material!.er);
      expect(caso.enunciado, `caso ${caso.id}`).toContain(er);
    }
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    const r = comprobarRespuesta(NaN, 7.86, casoAula(2).datos);
    expect(r.correcto).toBe(false);
    expect(r.motivo).not.toMatch(/NaN/);
    const borde = r.tolerancia;
    expect(borde).toBeCloseTo(0.005, 12);
    expect(comprobarRespuesta(7.86 + borde, 7.86, casoAula(2).datos).correcto).toBe(true);
    expect(comprobarRespuesta(7.86 - borde, 7.86, casoAula(2).datos).correcto).toBe(true);
    // 20 V y 484 ms exactos: no hay redondeo que tolerar.
    expect(comprobarRespuesta(20, 20, casoAula(7).datos).tolerancia).toBe(0);
    expect(comprobarRespuesta(484, 484, casoAula(9).datos).tolerancia).toBe(0);
  });

  test('9 · el corrector separa el redondeo del error de concepto', async () => {
    const tabla: ReadonlyArray<readonly [number, number, boolean, string]> = [
      [1, 23.6, true, 'la clave'],
      [1, 23.61, true, 'la cifra del panel'],
      [1, 23.5, false, 'vecino'],
      [2, 7.86, true, 'la clave'],
      [2, 7.863, true, 'la cifra del panel'],
      [2, 2.12, false, 'sin εr'],
      [2, 0.57, false, 'dividir por εr'],
      [3, 60, true, 'la clave'],
      [3, 60000, false, 'en V/m'],
      [4, 5.1, true, 'la clave'],
      [4, 10.2, false, 'sin el ½'],
      [5, 1.77, true, 'la clave'],
      [5, 0, false, 'en metros'],
      [6, 11.9, true, 'la clave'],
      [6, 0.4, false, 'batería desconectada'],
      [6, 2.1, false, 'sin dieléctrico'],
      [7, 20, true, 'la clave'],
      [7, 74, false, 'batería conectada'],
      [7, 273.8, false, 'multiplicar por εr'],
      [8, 6.07, true, 'la clave'],
      [8, 26.78, false, 'batería conectada'],
      [8, 12.75, false, 'sin cambio'],
      [9, 484, true, 'la clave'],
      [9, 0.484, false, 'en segundos'],
      [10, 7.78, true, 'la clave'],
      [10, 1.22, false, 'e^(−t/τ) en una carga'],
      [10, 5.69, false, 't = τ'],
      [11, 1.34, true, 'la clave'],
      [11, 6, false, 'la corriente inicial'],
      [11, 4.66, false, '1 − e^(−t/τ) en una corriente'],
      [12, 2.42, true, 'la clave'],
      [12, 2.2, false, 'responder τ'],
      [12, 0.89, false, 'la fórmula de la descarga'],
    ];
    const mal: string[] = [];
    for (const [id, r, entra, porque] of tabla) {
      const caso = casoAula(id);
      const v = comprobarRespuesta(r, caso.respuesta, caso.datos).correcto;
      if (v !== entra) mal.push(`caso ${id}: ${r} (${porque}) ${entra ? 'no entra' : 'entra'}`);
    }
    expect(mal).toEqual([]);
  });
});

/** Teclea una respuesta en el caso `id` y devuelve si el corrector la dio por buena. */
async function corregirAula(page: Page, id: number, respuesta: string): Promise<boolean> {
  await page.locator('#casos-aula').getByRole('button', { name: new RegExp(`^Caso ${id}:`) }).click();
  await expect(page.locator('#casos-titulo-caso')).toHaveText(new RegExp(`^Caso ${id} ·`));
  await page.locator('#casos-respuesta').fill(respuesta);
  await page.locator('#casos-comprobar').click();
  // Por su id y no por getByRole('alert'), que casa también con el anunciador de rutas de Next.
  const veredicto = page.locator('#casos-veredicto');
  await expect(veredicto).toBeVisible();
  return (await veredicto.innerText()).includes('¡Correcto!');
}

test.describe('simulador-condensadores · la sección de casos en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-condensadores/');
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('el caso 7 se corrige con la cifra de la solución', async ({ page }) => {
    expect(await corregirAula(page, 7, '20')).toBe(true);
  });

  test('el modo de batería equivocado en el caso 6 se rechaza y la solución enseña 11,9 nJ', async ({ page }) => {
    expect(await corregirAula(page, 6, '0,4')).toBe(false);
    const solucion = page.locator('#casos-aula').getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(page.locator('#casos-resultado')).toContainText('11,9 nJ');
  });
});
