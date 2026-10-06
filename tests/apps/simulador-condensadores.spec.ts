import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, esperarValorEnReact } from './_hidratacion';

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
