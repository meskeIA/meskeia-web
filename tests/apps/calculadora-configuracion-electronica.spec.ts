import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * calculadora-configuracion-electronica — primera inspección, 04/11/2026.
 *
 * Ejecutar: npx playwright test tests/apps/calculadora-configuracion-electronica.spec.ts
 * (el motor tiene además sus pruebas unitarias en tests/configuracion-electronica-motor.spec.ts)
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   Referencia: el orden de Madelung (n+l creciente y, a igual n+l, n menor) escrito a mano en
 *   este fichero, sin importar el motor; capacidad 2(2l+1); núcleo de gas noble = el mayor gas
 *   noble de Z menor (He 2, Ne 10, Ar 18, Kr 36, Xe 54, Rn 86); y la comprobación que enseña la
 *   propia guía de la app: «Los superíndices tienen que sumar exactamente el número de electrones
 *   de la especie». Las excepciones ancladas son las del encargo (Cr, Cu, Pd) y sus análogas de
 *   grupo (Mo, Ag, Au). Las otras catorce excepciones que declara la app (Nb, Ru, Rh, La, Ce, Gd,
 *   Pt, Ac, Th, Pa, U, Np, Cm, Lr) quedaron sin fuente el 04/11/2026 (la NIST no estaba aún en la
 *   red de la tarea); el cabo C0632 (07/11/2026) las ancla en la NIST Atomic Spectra Database,
 *   junto con los iones, al final de este fichero.
 *
 *   CASO 1 · NORMAL — Fe, Z = 26, neutro (el elemento con el que abre la app)
 *     Madelung: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶ (2+2+6+2+6+2+6 = 26)
 *     por niveles: 1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s² · abreviada: [Ar] 3d⁶ 4s² (18 + 6 + 2 = 26)
 *     3d⁶ en cinco cajas: 2,1,1,1,1 → 4 desapareados → paramagnético
 *     bloque d · periodo 4 · grupo 4s + 3d = 2 + 6 = 8 · capa de valencia (n = 4): 2 · con el 3d: 8
 *     último electrón: el 6.º del 3d, el primero con espín abajo en la primera caja →
 *       n=3 · l=2 · mₗ=-2 · mₛ=−1/2 (convención de la app: las cajas de −l a +l)
 *     Fe³⁺: 23 electrones; salen los dos del 4s y uno del 3d → [Ar] 3d⁵, 5 desapareados
 *
 *   CASO 2 · LÍMITE — las excepciones y el Z más alto
 *     Cr [Ar] 3d⁵ 4s¹ (6 desapareados) · Cu [Ar] 3d¹⁰ 4s¹ (1) · Mo [Kr] 4d⁵ 5s¹ ·
 *     Ag [Kr] 4d¹⁰ 5s¹ · Au [Xe] 4f¹⁴ 5d¹⁰ 6s¹ · Pd [Kr] 4d¹⁰ (0 desapareados, diamagnético,
 *     periodo 5, grupo 10)
 *     Og, Z = 118: [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶ (86 + 14 + 10 + 2 + 6 = 118), bloque p, grupo
 *     10 + 2 + 6 = 18, con el aviso de que desde el 104 son predicciones
 *
 *   CASO 3 · RECHAZO — «0», «119», «-1» y «Xx» no son ningún elemento: el buscador no ofrece nada
 *     y Enter deja el hierro. El H no ofrece cationes: H⁺ no tendría electrones.
 *
 *   BARRIDO — los 118 neutros: solo los veinte que la FAQ visible nombra como excepciones se
 *     apartan de Madelung, y los veinte llevan el aviso de excepción. Pasa el 04/11/2026.
 *     (Con todas las cargas, 1.264 combinaciones: 130 abreviadas no suman; hallazgo A.)
 *
 * HALLAZGOS del 04/11/2026 (4040-4047), REPARADOS el mismo día en /reparar (el barrido de las
 * 1.264 combinaciones vive ahora en tests/configuracion-electronica-motor.spec.ts):
 *   A · cationes del bloque f: la abreviada vacía el 5p/6p del núcleo y no suma
 *   B · Og⁻, Og²⁻, Og³⁻, Ts²⁻, Ts³⁻ y Lv³⁻ dejan la página en blanco
 *   C · cabo C0275: «tungs» y «tungsteno» no encuentran el W
 *   D · el buscador no encuentra «oxigeno», «nitrogeno» ni «hidrogeno» sin tilde
 *   E · el Lr se llama «Lawrencio» en la ficha y «laurencio» en la FAQ y en su aviso
 *   F · los botones de copiar se anuncian «en orden en orden de llenado»
 *   G · la guía da «el 20 % de las preguntas» sin fuente
 *   H · el magnetismo del átomo aislado se presenta como el de «la sustancia»
 *
 * CABO C0632 (07/11/2026): las catorce excepciones y 38 iones, contra la NIST ASD, coinciden.
 * HALLAZGO ABIERTO: ocho iones (V⁺, Co⁺, Ni⁺, Y⁺, Ce²⁺, Th²⁺, Th³⁺, U²⁺) no dan el estado
 * fundamental que publica la NIST (al final del fichero).
 */

const RUTA = '/calculadora-configuracion-electronica/';

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#buscador']);
}

/** El texto de una de las tres líneas de configuración (el <p> que sigue a su cabecera). */
function linea(page: Page, titulo: string) {
  return page.locator('h3', { hasText: titulo }).locator('xpath=../following-sibling::p[1]');
}

/** Valor de una tarjeta de «Lo que dice esta configuración». */
function dato(page: Page, etiqueta: string) {
  return page
    .locator('span', { hasText: new RegExp(`^${etiqueta.replace(/[()]/g, '\\$&')}$`) })
    .first()
    .locator('xpath=following-sibling::span[1]');
}

async function elegir(page: Page, nombre: string, simbolo: string, z: number) {
  await page
    .getByRole('button', { name: `${nombre}, símbolo ${simbolo}, número atómico ${z}`, exact: true })
    .click();
}

async function carga(page: Page, texto: string) {
  await page.getByRole('group', { name: 'Carga del ion' }).getByRole('button', { name: texto, exact: true }).click();
}

function sugerencias(page: Page) {
  return page.locator('#buscador').locator('xpath=following-sibling::ul//button');
}

// ── Referencia independiente: Madelung escrito a mano ──────────────────────────────────────
const ORDEN = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
const CAPACIDAD: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 };
const VALOR_L: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 };
const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUPER[Number(d)])
    .join('');

function madelungPorNiveles(electrones: number): string {
  const subs: [string, number][] = [];
  let quedan = electrones;
  for (const o of ORDEN) {
    if (quedan <= 0) break;
    const entran = Math.min(CAPACIDAD[o[1]], quedan);
    subs.push([o, entran]);
    quedan -= entran;
  }
  return subs
    .sort((a, b) => Number(a[0][0]) - Number(b[0][0]) || VALOR_L[a[0][1]] - VALOR_L[b[0][1]])
    .map(([o, c]) => `${o}${sup(c)}`)
    .join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CASO 1 · NORMAL
// ═══════════════════════════════════════════════════════════════════════════════════════════
test.describe('CASO 1 · normal: el hierro y el Fe³⁺', () => {
  test('el hierro neutro da Madelung puro y todo lo que se deduce de él', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('#titulo-resultado')).toHaveText('Hierro');
    await expect(linea(page, 'En orden de llenado')).toHaveText('1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶');
    await expect(linea(page, 'Ordenada por niveles')).toHaveText('1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s²');
    await expect(linea(page, 'Abreviada con gas noble')).toHaveText('[Ar] 3d⁶ 4s²');
    await expect(page.locator('#titulo-resultado').locator('xpath=following-sibling::p[1]')).toHaveText(
      '26 electrones · bloque d (metales de transición) · periodo 4 · grupo 8',
    );
    await expect(dato(page, 'Electrones de la capa de valencia')).toHaveText('2');
    await expect(dato(page, 'Electrones de valencia (con el d interno)')).toHaveText('8');
    await expect(dato(page, 'Electrones desapareados')).toHaveText('4');
    await expect(dato(page, 'Comportamiento magnético')).toHaveText('Paramagnético');
    await expect(dato(page, 'Grupo')).toHaveText('8');
    await expect(dato(page, 'Números cuánticos del último electrón')).toHaveText('n=3 · l=2 · mₗ=-2 · mₛ=−1/2');
    // Madelung puro: no es una excepción
    await expect(page.locator('h3', { hasText: 'Este elemento es una excepción' })).toHaveCount(0);
  });

  test('Fe³⁺ pierde antes el 4s que el 3d: [Ar] 3d⁵ con cinco desapareados', async ({ page }) => {
    await abrir(page);
    await carga(page, 'Fe³⁺');
    await expect(page.locator('#titulo-resultado')).toHaveText('Ion Hierro 3+');
    await expect(linea(page, 'Abreviada con gas noble')).toHaveText('[Ar] 3d⁵');
    await expect(dato(page, 'Electrones desapareados')).toHaveText('5');
    await expect(page.getByText('Salen 2 electrones del 4s')).toBeVisible();
    await expect(page.getByText('Salen 1 electrón del 3d')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CASO 2 · LÍMITE
// ═══════════════════════════════════════════════════════════════════════════════════════════
test.describe('CASO 2 · límite: las excepciones al Aufbau y el oganesón', () => {
  const excepciones: [string, string, number, string, string][] = [
    ['Cromo', 'Cr', 24, '[Ar] 3d⁵ 4s¹', '6'],
    ['Cobre', 'Cu', 29, '[Ar] 3d¹⁰ 4s¹', '1'],
    ['Molibdeno', 'Mo', 42, '[Kr] 4d⁵ 5s¹', '6'],
    ['Plata', 'Ag', 47, '[Kr] 4d¹⁰ 5s¹', '1'],
    ['Oro', 'Au', 79, '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', '1'],
    ['Paladio', 'Pd', 46, '[Kr] 4d¹⁰', '0'],
  ];
  for (const [nombre, simbolo, z, abreviada, desapareados] of excepciones) {
    test(`${simbolo} = ${abreviada}, con su aviso de excepción`, async ({ page }) => {
      await abrir(page);
      await elegir(page, nombre, simbolo, z);
      await expect(linea(page, 'Abreviada con gas noble')).toHaveText(abreviada);
      await expect(dato(page, 'Electrones desapareados')).toHaveText(desapareados);
      await expect(page.locator('h3', { hasText: 'Este elemento es una excepción' })).toHaveCount(1);
    });
  }

  test('el paladio deja vacío el 5s y sigue en el periodo 5, grupo 10, diamagnético', async ({ page }) => {
    await abrir(page);
    await elegir(page, 'Paladio', 'Pd', 46);
    await expect(dato(page, 'Electrones de la capa de valencia')).toHaveText('0');
    await expect(dato(page, 'Periodo')).toHaveText('5');
    await expect(dato(page, 'Grupo')).toHaveText('10');
    await expect(dato(page, 'Comportamiento magnético')).toHaveText('Diamagnético');
  });

  test('el oganesón, Z = 118, es [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶ y avisa de que es una predicción', async ({ page }) => {
    await abrir(page);
    await elegir(page, 'Oganesón', 'Og', 118);
    await expect(linea(page, 'Abreviada con gas noble')).toHaveText('[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶');
    await expect(page.locator('#titulo-resultado').locator('xpath=following-sibling::p[1]')).toHaveText(
      '118 electrones · bloque p (elementos representativos) · periodo 7 · grupo 18',
    );
    await expect(page.locator('[role="note"]')).toContainText('A partir del elemento 104');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CASO 3 · RECHAZO
// ═══════════════════════════════════════════════════════════════════════════════════════════
test.describe('CASO 3 · rechazo: lo que no es un elemento no se elige', () => {
  test('«0», «119», «-1» y «Xx» no dan sugerencias y Enter deja el hierro', async ({ page }) => {
    await abrir(page);
    for (const q of ['0', '119', '-1', 'Xx']) {
      await page.fill('#buscador', q);
      await expect(sugerencias(page)).toHaveCount(0);
      await page.press('#buscador', 'Enter');
      await expect(page.locator('#titulo-resultado')).toHaveText('Hierro');
    }
  });

  test('el hidrógeno no ofrece cationes: H⁺ no tendría electrones', async ({ page }) => {
    await abrir(page);
    await elegir(page, 'Hidrógeno', 'H', 1);
    await expect(page.getByRole('group', { name: 'Carga del ion' }).getByRole('button')).toHaveText([
      'H³⁻',
      'H²⁻',
      'H⁻',
      'Neutro',
    ]);
  });

  test('«wolf» y «wolframio» encuentran el W (regresión de C0504)', async ({ page }) => {
    await abrir(page);
    for (const q of ['wolf', 'wolframio']) {
      await page.fill('#buscador', q);
      await expect(sugerencias(page)).toHaveCount(1);
      await expect(sugerencias(page).first()).toContainText('Wolframio');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// BARRIDO · los 118 neutros contra Madelung
// ═══════════════════════════════════════════════════════════════════════════════════════════
test('barrido · solo las veinte excepciones que publica la FAQ se apartan de Madelung', async ({ page }) => {
  test.setTimeout(120_000);
  await abrir(page);
  // La lista que la propia app publica en «¿Cuántas excepciones hay realmente?»
  const EXCEPCIONES_FAQ = ['Cr', 'Cu', 'Nb', 'Mo', 'Ru', 'Rh', 'Pd', 'Ag', 'La', 'Ce', 'Gd', 'Pt', 'Au', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Cm', 'Lr'];
  await expect(page.locator('h4', { hasText: '¿Cuántas excepciones hay realmente?' }).locator('xpath=following-sibling::p[1]')).toContainText(
    'cromo, cobre, niobio, molibdeno, rutenio, rodio, paladio, plata, lantano, cerio, gadolinio, platino, oro, actinio, torio, protactinio, uranio, neptunio, curio y lawrencio',
  );
  const etiquetas = await page
    .locator('[aria-label="Tabla periódica"] button')
    .evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-label') ?? ''));
  expect(etiquetas).toHaveLength(118);
  const apartados: string[] = [];
  const sinAviso: string[] = [];
  for (const etiqueta of etiquetas) {
    const z = Number(etiqueta.match(/número atómico (\d+)/)?.[1]);
    const simbolo = etiqueta.match(/símbolo (\w+)/)?.[1] ?? '';
    await page.getByRole('button', { name: etiqueta, exact: true }).click();
    await expect(page.locator('[aria-label="Tabla periódica"] button[aria-pressed="true"]')).toHaveAttribute('aria-label', etiqueta);
    const niveles = (await linea(page, 'Ordenada por niveles').textContent())?.trim();
    const aviso = await page.locator('h3', { hasText: 'Este elemento es una excepción' }).count();
    if (niveles !== madelungPorNiveles(z)) apartados.push(simbolo);
    if ((niveles !== madelungPorNiveles(z)) !== (aviso === 1)) sinAviso.push(simbolo);
  }
  expect(apartados).toEqual(EXCEPCIONES_FAQ);
  expect(sinAviso).toEqual([]);
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS del 04/11/2026 — REPARADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════

// A · REPARADO (hallazgo 4040). ionizar() vacía ahora primero lo que queda fuera del núcleo de
// gas noble (6s → 5d → 4f) y solo después el núcleo. Lo que hacía: quitaba siempre del n más
// alto, y en el bloque f eso vacía el 5p (n = 5) o el 6p (n = 6), que están DENTRO del núcleo
// [Xe] o [Rn], antes que el 4f (n = 4) o el 5f (n = 5). La abreviada sale entonces con el
// núcleo entero MÁS un 5p/6p suelto, y no suma: Eu³⁺ tiene 63 − 3 = 60 electrones y la app
// escribe «[Xe] 4f⁷ 5p⁵» = 54 + 7 + 5 = 66. En el barrido de las 1.264 combinaciones que
// ofrece la app, 130 no suman (todas de Ce a Sg). Esperado: tras el 6s (y el 5d/6d) salen
// electrones del 4f/5f, y el núcleo de gas noble queda intacto:
//   Eu³⁺ (60 e⁻) = [Xe] 4f⁶ · Ce⁴⁺ (54 e⁻) = [Xe] · U⁴⁺ (88 e⁻) = [Rn] 5f² · U⁶⁺ (86 e⁻) = [Rn]
test('A · REPARADO: los cationes del bloque f conservan el núcleo de gas noble y la abreviada suma', async ({ page }) => {
  await abrir(page);
  const casos: [string, string, number, string, string, number][] = [
    ['Europio', 'Eu', 63, 'Eu³⁺', '[Xe] 4f⁶', 60],
    ['Cerio', 'Ce', 58, 'Ce⁴⁺', '[Xe]', 54],
    ['Uranio', 'U', 92, 'U⁴⁺', '[Rn] 5f²', 88],
    ['Uranio', 'U', 92, 'U⁶⁺', '[Rn]', 86],
  ];
  for (const [nombre, simbolo, z, especie, abreviada, electrones] of casos) {
    await elegir(page, nombre, simbolo, z);
    await carga(page, especie);
    await expect(page.locator('#titulo-resultado').locator('xpath=following-sibling::p[1]')).toContainText(`${electrones} electrones`);
    await expect(linea(page, 'Abreviada con gas noble'), especie).toHaveText(abreviada);
  }
});

// B · REPARADO (hallazgo 4041): los botones solo ofrecen cargas con 1 a 118 electrones, al
// elegir un elemento con una carga que no cabe la carga vuelve a neutro, y si aun así llegara
// una, la página muestra el neutro en vez de quedarse en blanco. Lo que hacía: ofrecía cargas negativas a los tres
// últimos elementos, pero el motor no admite más de 118 electrones: analizar() devuelve null
// y la página entera devuelve null (`if (!resultado) return null;`). Og⁻, Og²⁻, Og³⁻, Ts²⁻,
// Ts³⁻ y Lv³⁻ dejan la pantalla en blanco, sin logo, sin buscador y sin forma de volver salvo
// recargando. También se llega sin pulsar la carga: el ejemplo «O²⁻» deja la carga en −2 y al
// elegir después el Og (118 + 2 = 120 electrones) la página desaparece.
// Esperado: el h1 y el buscador siguen ahí (el botón no se ofrece o se avisa).
test.describe('B · REPARADO: una carga de más de 118 electrones no deja la página en blanco', () => {
  test('el Og no ofrece aniones; el Ts solo Ts⁻ y el Lv hasta Lv²⁻', async ({ page }) => {
    await abrir(page);
    const botones = page.getByRole('group', { name: 'Carga del ion' }).getByRole('button');
    await elegir(page, 'Oganesón', 'Og', 118);
    await expect(botones.first()).toHaveText('Neutro');
    await expect(botones.filter({ hasText: '⁻' })).toHaveCount(0);
    await elegir(page, 'Teneso', 'Ts', 117);
    await expect(botones.filter({ hasText: '⁻' })).toHaveText(['Ts⁻']);
    await elegir(page, 'Livermorio', 'Lv', 116);
    await expect(botones.filter({ hasText: '⁻' })).toHaveText(['Lv²⁻', 'Lv⁻']);
    await expect(page.locator('h1')).toHaveText('Configuración electrónica');
  });

  test('el ejemplo O²⁻ y después el oganesón: vuelve a neutro y la página sigue en pie', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /O²⁻/ }).click();
    await expect(page.locator('#titulo-resultado')).toHaveText('Ion Oxígeno 2−');
    await elegir(page, 'Oganesón', 'Og', 118);
    await expect(page.locator('h1')).toHaveText('Configuración electrónica', { timeout: 3000 });
    await expect(page.locator('#buscador')).toBeVisible();
    await expect(page.locator('#titulo-resultado')).toHaveText('Oganesón');
    await expect(page.locator('#titulo-resultado').locator('xpath=following-sibling::p[1]')).toContainText('118 electrones');
  });
});

// C · REPARADO (hallazgo 4042) — cabo C0275: `otrosNombres: ['Tungsteno']` en el motor y el
// buscador mira también los otros nombres. Lo que pasaba: el commit 21b793a0 (30/10/2026,
// C0504) cambió el nombre del W a «Wolframio» sin el alias, y el buscador compara con
// nombre.startsWith: «tungs» y «tungsteno» ya no encuentran nada. tabla-periodica lo resolvió
// en 490be061 con `otrosNombres: ['Tungsteno']` y la búsqueda sobre ellos; su comentario ancla
// el nombre preferente: «wolframio» (acuerdo RAC-RAE-RSEQ-Fundéu, An. Quím. 113, 2017, 65-67)
// y «tungsteno», que recoge el DLE. Esperado: una sugerencia, el W.
test('C · REPARADO (cabo C0275): «tungs» y «tungsteno» encuentran el wolframio', async ({ page }) => {
  await abrir(page);
  for (const q of ['tungs', 'tungsteno']) {
    await page.fill('#buscador', q);
    await expect(sugerencias(page), q).toHaveCount(1, { timeout: 3000 });
    await expect(sugerencias(page).first()).toContainText('Wolframio');
  }
});

// D · REPARADO (hallazgo 4043): el buscador normaliza (minúsculas, sin tildes) la consulta y los
// nombres, como tabla-periodica. Lo que pasaba: el buscador comparaba con toLowerCase().startsWith
// sin quitar tildes: «oxigeno», «nitrogeno» e «hidrogeno» no dan ninguna sugerencia y Enter no
// hace nada, sin aviso. Afecta a los 14 nombres con tilde (Hidrógeno, Nitrógeno, Oxígeno,
// Flúor, Neón, Fósforo, Argón, Níquel, Arsénico, Kriptón, Xenón, Tántalo, Radón, Oganesón).
// tabla-periodica normaliza el texto antes de comparar. Esperado: una sugerencia cada uno.
test('D · REPARADO: el buscador encuentra los nombres escritos sin tilde', async ({ page }) => {
  await abrir(page);
  for (const [q, nombre] of [
    ['oxigeno', 'Oxígeno'],
    ['nitrogeno', 'Nitrógeno'],
    ['hidrogeno', 'Hidrógeno'],
  ]) {
    await page.fill('#buscador', q);
    await expect(sugerencias(page), q).toHaveCount(1, { timeout: 3000 });
    await expect(sugerencias(page).first()).toContainText(nombre);
  }
});

// E · REPARADO (hallazgo 4044): «lawrencio» en toda la app, como tabla-periodica y
// simulador-tabla-periodica-tendencias, y «Laurencio» como alias del buscador. Lo que pasaba: el elemento 103 se llamaba «Lawrencio» en la ficha,
// la tabla y el buscador, pero «laurencio» en la FAQ visible y en el texto de su propio aviso de
// excepción («En el laurencio los efectos relativistas…»); buscar «laurencio» no da nada.
// Esperado: el aviso de excepción del Lr nombra el elemento como lo nombra su ficha.
test('E · REPARADO: el Lr se llama igual en su ficha y en su aviso de excepción', async ({ page }) => {
  await abrir(page);
  await elegir(page, 'Lawrencio', 'Lr', 103);
  const nombre = ((await page.locator('#titulo-resultado').textContent()) ?? '').trim().toLowerCase();
  const aviso = page.locator('h3', { hasText: 'Este elemento es una excepción' }).locator('xpath=..');
  expect(((await aviso.textContent()) ?? '').toLowerCase()).toContain(`en el ${nombre}`);
  // y la otra forma sigue encontrándolo
  await page.fill('#buscador', 'laurencio');
  await expect(sugerencias(page)).toHaveCount(1, { timeout: 3000 });
  await expect(sugerencias(page).first()).toContainText('Lawrencio');
});

// F · REPARADO (hallazgo 4045): `Copiar la configuración ${titulo}`. Lo que pasaba: el aria-label de los tres botones «Copiar» es
// `Copiar la configuración en orden ${titulo}`, y el título ya trae su propia frase: un lector
// de pantalla oye «Copiar la configuración en orden en orden de llenado», «… en orden ordenada
// por niveles» y «… en orden abreviada con gas noble». Esperado: ninguno repite «en orden».
test('F · REPARADO: los botones de copiar tienen un nombre accesible gramatical', async ({ page }) => {
  await abrir(page);
  const nombres = await page
    .locator('button', { hasText: /^Copiar$/ })
    .evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-label') ?? ''));
  expect(nombres).toEqual([
    'Copiar la configuración en orden de llenado',
    'Copiar la configuración ordenada por niveles',
    'Copiar la configuración abreviada con gas noble',
  ]);
});

// G · REPARADO (hallazgo 4046): la tarjeta dice ya sin cifra por qué conviene practicarlos. Lo que pasaba: la tarjeta «Repaso antes de un examen» afirma
// que las excepciones y los aniones «son el 20 % de las preguntas», sin fuente ni contexto
// (neutralidad editorial, regla 1: cifras sin fuente). Esperado: la cifra con su fuente, o sin cifra.
test('G · REPARADO: la guía no da el «20 % de las preguntas» sin fuente', async ({ page }) => {
  await abrir(page);
  await expect(page.locator('main')).not.toContainText('son el 20 % de las preguntas');
  await expect(page.locator('main')).not.toContainText(/\d+\s?% de las preguntas/);
});

// H · REPARADO (hallazgo 4047): guía, ficha y FAQPage hablan del átomo aislado y avisan de que la
// sustancia puede ser diamagnética (Cu metálico, N₂, Cl₂). Lo que pasaba: los desapareados deciden el magnetismo del ÁTOMO
// aislado, pero la guía («Si queda algún electrón sin pareja, la sustancia es paramagnética») y
// el FAQPage («la sustancia es paramagnética y es atraída por un imán… el hierro, con cuatro
// desapareados, responde a un campo magnético») lo trasladan a la sustancia. Con el Cu la ficha
// dice «Paramagnético · Es atraído por un campo magnético»; el cobre metálico, el N₂ o el Cl₂
// son diamagnéticos aunque sus átomos tengan electrones sin pareja, y lo que hace al hierro
// responder a un imán es el ferromagnetismo del metal. Esperado: la guía habla del átomo.
test('H · REPARADO: la guía no atribuye a la sustancia el magnetismo del átomo aislado', async ({ page }) => {
  await abrir(page);
  await expect(page.locator('main')).not.toContainText('la sustancia es paramagnética');
  const faq = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(faq.join('\n')).not.toContain('la sustancia es paramagnética');
  await elegir(page, 'Cobre', 'Cu', 29);
  await expect(dato(page, 'Comportamiento magnético').locator('xpath=following-sibling::*[1]')).toContainText('átomo aislado');
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CABO C0632 (07/11/2026) · las catorce excepciones y los iones contra la NIST ASD
// ═══════════════════════════════════════════════════════════════════════════════════════════
//
// Fuente: NIST Atomic Spectra Database, «Ionization Energies Data», columnas «Ground Shells» y
// «Ground Config.» (formulario https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html), con las
// consultas
//   https://physics.nist.gov/cgi-bin/ASD/ie.pl?spectra=H-Lr+I&shells_out=on&conf_out=on&level_out=on
//   https://physics.nist.gov/cgi-bin/ASD/ie.pl?spectra=La-Lr+I  (· Nb-Rh+I · Sc-Zn+II; Y-Cd+II ·
//   La-Lu+IV · Fe+III; Cu+II; Eu+IV; Ce+III-V; Gd+III-IV; U+III-V; U+VII; Th+III-IV; La+III-IV)
// leídas el 07/11/2026. Los núcleos, como los define la nota (a) de la propia NIST:
// [Ar] = 1s2.2s2.2p6.3s2.3p6 · [Kr] = [Ar].3d10.4s2.4p6 · [Xe] = [Kr].4d10.5s2.5p6 ·
// [Rn] = [Xe].4f14.5d10.6s2.6p6 ([Cd].5p6 = [Xe]; [Hg].6p6 = [Rn]). Ninguna de las catorce lleva
// interrogante ni marca de asignación tentativa en la ASD. Los superíndices se comparan por
// subnivel: «4d4.5s» de la NIST es el «4d⁴ 5s¹» de la app.

test('C0632 · las catorce excepciones sin anclar coinciden con la NIST ASD', async ({ page }) => {
  await abrir(page);
  // [nombre, símbolo, Z, abreviada esperada, Ground Shells de la NIST tal cual]
  const casos: [string, string, number, string, string][] = [
    ['Niobio', 'Nb', 41, '[Kr] 4d⁴ 5s¹', 'Nb I · [Kr].4d4.5s'],
    ['Rutenio', 'Ru', 44, '[Kr] 4d⁷ 5s¹', 'Ru I · [Kr].4d7.5s'],
    ['Rodio', 'Rh', 45, '[Kr] 4d⁸ 5s¹', 'Rh I · [Kr].4d8.5s'],
    ['Lantano', 'La', 57, '[Xe] 5d¹ 6s²', 'La I · [Xe].5d.6s2'],
    ['Cerio', 'Ce', 58, '[Xe] 4f¹ 5d¹ 6s²', 'Ce I · [Xe].4f.5d.6s2'],
    ['Gadolinio', 'Gd', 64, '[Xe] 4f⁷ 5d¹ 6s²', 'Gd I · [Xe].4f7.5d.6s2'],
    ['Platino', 'Pt', 78, '[Xe] 4f¹⁴ 5d⁹ 6s¹', 'Pt I · [Xe].4f14.5d9.6s'],
    ['Actinio', 'Ac', 89, '[Rn] 6d¹ 7s²', 'Ac I · [Rn].6d.7s2'],
    ['Torio', 'Th', 90, '[Rn] 6d² 7s²', 'Th I · [Rn].6d2.7s2'],
    ['Protactinio', 'Pa', 91, '[Rn] 5f² 6d¹ 7s²', 'Pa I · [Rn].5f2.6d.7s2'],
    ['Uranio', 'U', 92, '[Rn] 5f³ 6d¹ 7s²', 'U I · [Rn].5f3.6d.7s2'],
    ['Neptunio', 'Np', 93, '[Rn] 5f⁴ 6d¹ 7s²', 'Np I · [Rn].5f4.6d.7s2'],
    ['Curio', 'Cm', 96, '[Rn] 5f⁷ 6d¹ 7s²', 'Cm I · [Rn].5f7.6d.7s2'],
    ['Lawrencio', 'Lr', 103, '[Rn] 5f¹⁴ 7s² 7p¹', 'Lr I · [Rn].5f14.7s2.7p'],
  ];
  for (const [nombre, simbolo, z, abreviada, nist] of casos) {
    await elegir(page, nombre, simbolo, z);
    await expect(linea(page, 'Abreviada con gas noble'), nist).toHaveText(abreviada);
    await expect(page.locator('h3', { hasText: 'Este elemento es una excepción' }), nist).toHaveCount(1);
  }
});

// Iones: los que toca el cambio de ionizar() de 445eae05 (tras el s y el d sale el f, sin tocar
// el núcleo: toda la serie Ln³⁺ y U³⁺; Eu³⁺, Ce⁴⁺, U⁴⁺ y U⁶⁺ ya están en el caso A) y los que
// pierden antes el ns (Fe²⁺, Cu⁺ y los cationes monovalentes del bloque d que la NIST no
// reordena). Coinciden todos con la NIST; con los cuatro del caso A son 38 de los 46 cotejados.
test('C0632 · los iones que toca ionizar() coinciden con la NIST ASD', async ({ page }) => {
  await abrir(page);
  // [nombre, símbolo, Z, especie, abreviada esperada, espectro y Ground Shells de la NIST]
  const casos: [string, string, number, string, string, string][] = [
    ['Hierro', 'Fe', 26, 'Fe²⁺', '[Ar] 3d⁶', 'Fe III · [Ar].3d6'],
    ['Cobre', 'Cu', 29, 'Cu⁺', '[Ar] 3d¹⁰', 'Cu II · [Ar].3d10'],
    ['Hierro', 'Fe', 26, 'Fe⁺', '[Ar] 3d⁶ 4s¹', 'Fe II · [Ar].3d6.4s'],
    ['Cromo', 'Cr', 24, 'Cr⁺', '[Ar] 3d⁵', 'Cr II · [Ar].3d5'],
    ['Escandio', 'Sc', 21, 'Sc⁺', '[Ar] 3d¹ 4s¹', 'Sc II · [Ar].3d.4s'],
    ['Titanio', 'Ti', 22, 'Ti⁺', '[Ar] 3d² 4s¹', 'Ti II · [Ar].3d2.4s'],
    ['Manganeso', 'Mn', 25, 'Mn⁺', '[Ar] 3d⁵ 4s¹', 'Mn II · [Ar].3d5.4s'],
    ['Zinc', 'Zn', 30, 'Zn⁺', '[Ar] 3d¹⁰ 4s¹', 'Zn II · [Ar].3d10.4s'],
    ['Circonio', 'Zr', 40, 'Zr⁺', '[Kr] 4d² 5s¹', 'Zr II · [Kr].4d2.5s'],
    ['Molibdeno', 'Mo', 42, 'Mo⁺', '[Kr] 4d⁵', 'Mo II · [Kr].4d5'],
    ['Tecnecio', 'Tc', 43, 'Tc⁺', '[Kr] 4d⁵ 5s¹', 'Tc II · [Kr].4d5.5s'],
    ['Cadmio', 'Cd', 48, 'Cd⁺', '[Kr] 4d¹⁰ 5s¹', 'Cd II · [Kr].4d10.5s'],
    ['Niobio', 'Nb', 41, 'Nb⁺', '[Kr] 4d⁴', 'Nb II · [Kr].4d4'],
    ['Rutenio', 'Ru', 44, 'Ru⁺', '[Kr] 4d⁷', 'Ru II · [Kr].4d7'],
    ['Rodio', 'Rh', 45, 'Rh⁺', '[Kr] 4d⁸', 'Rh II · [Kr].4d8'],
    ['Paladio', 'Pd', 46, 'Pd⁺', '[Kr] 4d⁹', 'Pd II · [Kr].4d9'],
    ['Plata', 'Ag', 47, 'Ag⁺', '[Kr] 4d¹⁰', 'Ag II · [Kr].4d10'],
    ['Lantano', 'La', 57, 'La²⁺', '[Xe] 5d¹', 'La III · [Xe].5d'],
    ['Lantano', 'La', 57, 'La³⁺', '[Xe]', 'La IV · [Cd].5p6'],
    ['Cerio', 'Ce', 58, 'Ce³⁺', '[Xe] 4f¹', 'Ce IV · [Xe].4f'],
    ['Praseodimio', 'Pr', 59, 'Pr³⁺', '[Xe] 4f²', 'Pr IV · [Xe].4f2'],
    ['Neodimio', 'Nd', 60, 'Nd³⁺', '[Xe] 4f³', 'Nd IV · [Xe].4f3'],
    ['Prometio', 'Pm', 61, 'Pm³⁺', '[Xe] 4f⁴', 'Pm IV · [Xe].4f4'],
    ['Samario', 'Sm', 62, 'Sm³⁺', '[Xe] 4f⁵', 'Sm IV · [Xe].4f5'],
    ['Gadolinio', 'Gd', 64, 'Gd²⁺', '[Xe] 4f⁷ 5d¹', 'Gd III · [Xe].4f7.5d'],
    ['Gadolinio', 'Gd', 64, 'Gd³⁺', '[Xe] 4f⁷', 'Gd IV · [Xe].4f7'],
    ['Terbio', 'Tb', 65, 'Tb³⁺', '[Xe] 4f⁸', 'Tb IV · [Xe].4f8'],
    ['Disprosio', 'Dy', 66, 'Dy³⁺', '[Xe] 4f⁹', 'Dy IV · [Xe].4f9'],
    ['Holmio', 'Ho', 67, 'Ho³⁺', '[Xe] 4f¹⁰', 'Ho IV · [Xe].4f10'],
    ['Erbio', 'Er', 68, 'Er³⁺', '[Xe] 4f¹¹', 'Er IV · [Xe].4f11'],
    ['Tulio', 'Tm', 69, 'Tm³⁺', '[Xe] 4f¹²', 'Tm IV · [Xe].4f12'],
    ['Iterbio', 'Yb', 70, 'Yb³⁺', '[Xe] 4f¹³', 'Yb IV · [Xe].4f13'],
    ['Lutecio', 'Lu', 71, 'Lu³⁺', '[Xe] 4f¹⁴', 'Lu IV · [Xe].4f14'],
    ['Uranio', 'U', 92, 'U³⁺', '[Rn] 5f³', 'U IV · [Rn].5f3'],
  ];
  for (const [nombre, simbolo, z, especie, abreviada, nist] of casos) {
    await elegir(page, nombre, simbolo, z);
    await carga(page, especie);
    await expect(linea(page, 'Abreviada con gas noble'), nist).toHaveText(abreviada);
  }
});

// HALLAZGO 4183 (07/11/2026, REPARADO) · cabo C0632. REPARADO: el motor lleva la tabla
// REORDENES_ION con estos ocho estados fundamentales, cotejados de nuevo en la NIST ASD el
// 07/11/2026, y el aviso de excepción compara ahora la configuración del átomo NEUTRO.
// Lo que se vio: ionizar() quita siempre los electrones del n más
// alto de fuera del núcleo y deja quietos los demás, pero el estado fundamental del ion libre que
// mide la NIST no siempre sale de vaciar el neutro: en ocho de los 46 iones cotejados el ion se
// reordena (el s o el d que queda pasa al d o al f). No es del cambio de 445eae05: con la regla
// anterior salían igual. En el Ce²⁺, Th²⁺, Th³⁺ y U²⁺, además, el aviso de excepción presenta la
// configuración de la app como «lo que se mide en el laboratorio».
//   V⁺  (V II)   NIST [Ar].3d4      · app [Ar] 3d³ 4s¹
//   Co⁺ (Co II)  NIST [Ar].3d8      · app [Ar] 3d⁷ 4s¹
//   Ni⁺ (Ni II)  NIST [Ar].3d9      · app [Ar] 3d⁸ 4s¹
//   Y⁺  (Y II)   NIST [Kr].5s2      · app [Kr] 4d¹ 5s¹
//   Ce²⁺ (Ce III) NIST [Xe].4f2     · app [Xe] 4f¹ 5d¹
//   Th²⁺ (Th III) NIST [Rn].5f.6d   · app [Rn] 6d²
//   Th³⁺ (Th IV)  NIST [Rn].5f      · app [Rn] 6d¹
//   U²⁺  (U III)  NIST [Rn].5f4     · app [Rn] 5f³ 6d¹
// Esperado: la configuración del estado fundamental que publica la NIST ASD.
test('HALLAZGO 4183 (07/11/2026, REPARADO) · cabo C0632: ocho iones no daban el estado fundamental de la NIST', async ({ page }) => {
  await abrir(page);
  const casos: [string, string, number, string, string, string][] = [
    ['Vanadio', 'V', 23, 'V⁺', '[Ar] 3d⁴', 'V II · [Ar].3d4'],
    ['Cobalto', 'Co', 27, 'Co⁺', '[Ar] 3d⁸', 'Co II · [Ar].3d8'],
    ['Níquel', 'Ni', 28, 'Ni⁺', '[Ar] 3d⁹', 'Ni II · [Ar].3d9'],
    ['Itrio', 'Y', 39, 'Y⁺', '[Kr] 5s²', 'Y II · [Kr].5s2'],
    ['Cerio', 'Ce', 58, 'Ce²⁺', '[Xe] 4f²', 'Ce III · [Xe].4f2'],
    ['Torio', 'Th', 90, 'Th²⁺', '[Rn] 5f¹ 6d¹', 'Th III · [Rn].5f.6d'],
    ['Torio', 'Th', 90, 'Th³⁺', '[Rn] 5f¹', 'Th IV · [Rn].5f'],
    ['Uranio', 'U', 92, 'U²⁺', '[Rn] 5f⁴', 'U III · [Rn].5f4'],
  ];
  for (const [nombre, simbolo, z, especie, abreviada, nist] of casos) {
    await elegir(page, nombre, simbolo, z);
    await carga(page, especie);
    await expect(linea(page, 'Abreviada con gas noble'), nist).toHaveText(abreviada);
    await expect(page.getByText('Este ion se reordena.'), nist).toBeVisible();
  }
  // El aviso de excepción del Ce²⁺ compara la del átomo NEUTRO, no la del ion
  await elegir(page, 'Cerio', 'Ce', 58);
  await carga(page, 'Ce²⁺');
  const excepcion = page.locator('div', { has: page.locator('h3', { hasText: 'Este elemento es una excepción' }) }).last();
  await expect(excepcion).toContainText('En el átomo neutro');
  await expect(excepcion).toContainText('6s²');
  // Y un ion que sigue la regla no dice que se reordena
  await elegir(page, 'Hierro', 'Fe', 26);
  await carga(page, 'Fe²⁺');
  await expect(page.getByText('Este ion se reordena.')).toHaveCount(0);
});
