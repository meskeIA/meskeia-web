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
 *   grupo (Mo, Ag, Au). La NIST Atomic Spectra Database no está en la lista de fuentes de la
 *   tarea, así que las otras catorce excepciones que declara la app (Nb, Ru, Rh, La, Ce, Gd, Pt,
 *   Ac, Th, Pa, U, Np, Cm, Lr) no se cotejan con una fuente: solo que la página es coherente con
 *   la lista que ella misma publica en su FAQ.
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
 * HALLAZGOS ABIERTOS el 04/11/2026, con `test.fail()` y el comentario «ABIERTO»:
 *   A · cationes del bloque f: la abreviada vacía el 5p/6p del núcleo y no suma
 *   B · Og⁻, Og²⁻, Og³⁻, Ts²⁻, Ts³⁻ y Lv³⁻ dejan la página en blanco
 *   C · cabo C0275: «tungs» y «tungsteno» no encuentran el W
 *   D · el buscador no encuentra «oxigeno», «nitrogeno» ni «hidrogeno» sin tilde
 *   E · el Lr se llama «Lawrencio» en la ficha y «laurencio» en la FAQ y en su aviso
 *   F · los botones de copiar se anuncian «en orden en orden de llenado»
 *   G · la guía da «el 20 % de las preguntas» sin fuente
 *   H · el magnetismo del átomo aislado se presenta como el de «la sustancia»
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
    'cromo, cobre, niobio, molibdeno, rutenio, rodio, paladio, plata, lantano, cerio, gadolinio, platino, oro, actinio, torio, protactinio, uranio, neptunio, curio y laurencio',
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
// HALLAZGOS ABIERTOS (04/11/2026)
// ═══════════════════════════════════════════════════════════════════════════════════════════

// A · ABIERTO, hallazgo (inspector 04/11/2026). Al ionizar, el motor quita siempre del n más
// alto, y en el bloque f eso vacía el 5p (n = 5) o el 6p (n = 6), que están DENTRO del núcleo
// [Xe] o [Rn], antes que el 4f (n = 4) o el 5f (n = 5). La abreviada sale entonces con el
// núcleo entero MÁS un 5p/6p suelto, y no suma: Eu³⁺ tiene 63 − 3 = 60 electrones y la app
// escribe «[Xe] 4f⁷ 5p⁵» = 54 + 7 + 5 = 66. En el barrido de las 1.264 combinaciones que
// ofrece la app, 130 no suman (todas de Ce a Sg). Esperado: tras el 6s (y el 5d/6d) salen
// electrones del 4f/5f, y el núcleo de gas noble queda intacto:
//   Eu³⁺ (60 e⁻) = [Xe] 4f⁶ · Ce⁴⁺ (54 e⁻) = [Xe] · U⁴⁺ (88 e⁻) = [Rn] 5f² · U⁶⁺ (86 e⁻) = [Rn]
test('A · ABIERTO: los cationes del bloque f conservan el núcleo de gas noble y la abreviada suma', async ({ page }) => {
  test.fail();
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

// B · ABIERTO, hallazgo (inspector 04/11/2026). La app ofrece cargas negativas a los tres
// últimos elementos, pero el motor no admite más de 118 electrones: analizar() devuelve null
// y la página entera devuelve null (`if (!resultado) return null;`). Og⁻, Og²⁻, Og³⁻, Ts²⁻,
// Ts³⁻ y Lv³⁻ dejan la pantalla en blanco, sin logo, sin buscador y sin forma de volver salvo
// recargando. También se llega sin pulsar la carga: el ejemplo «O²⁻» deja la carga en −2 y al
// elegir después el Og (118 + 2 = 120 electrones) la página desaparece.
// Esperado: el h1 y el buscador siguen ahí (el botón no se ofrece o se avisa).
test.describe('B · ABIERTO: una carga de más de 118 electrones no deja la página en blanco', () => {
  test('Og⁻', async ({ page }) => {
    test.fail();
    await abrir(page);
    await elegir(page, 'Oganesón', 'Og', 118);
    await carga(page, 'Og⁻');
    await expect(page.locator('h1')).toHaveText('Configuración electrónica', { timeout: 3000 });
    await expect(page.locator('#buscador')).toBeVisible({ timeout: 3000 });
  });

  test('el ejemplo O²⁻ y después el oganesón', async ({ page }) => {
    test.fail();
    await abrir(page);
    await page.getByRole('button', { name: /O²⁻/ }).click();
    await expect(page.locator('#titulo-resultado')).toHaveText('Ion Oxígeno 2−');
    await elegir(page, 'Oganesón', 'Og', 118);
    await expect(page.locator('h1')).toHaveText('Configuración electrónica', { timeout: 3000 });
  });
});

// C · ABIERTO, hallazgo (inspector 04/11/2026) — cabo C0275. El commit 21b793a0 (30/10/2026,
// C0504) cambió el nombre del W a «Wolframio» sin el alias, y el buscador compara con
// nombre.startsWith: «tungs» y «tungsteno» ya no encuentran nada. tabla-periodica lo resolvió
// en 490be061 con `otrosNombres: ['Tungsteno']` y la búsqueda sobre ellos; su comentario ancla
// el nombre preferente: «wolframio» (acuerdo RAC-RAE-RSEQ-Fundéu, An. Quím. 113, 2017, 65-67)
// y «tungsteno», que recoge el DLE. Esperado: una sugerencia, el W.
test('C · ABIERTO (cabo C0275): «tungs» y «tungsteno» encuentran el wolframio', async ({ page }) => {
  test.fail();
  await abrir(page);
  for (const q of ['tungs', 'tungsteno']) {
    await page.fill('#buscador', q);
    await expect(sugerencias(page), q).toHaveCount(1, { timeout: 3000 });
    await expect(sugerencias(page).first()).toContainText('Wolframio');
  }
});

// D · ABIERTO, hallazgo (inspector 04/11/2026). El buscador compara con toLowerCase().startsWith
// sin quitar tildes: «oxigeno», «nitrogeno» e «hidrogeno» no dan ninguna sugerencia y Enter no
// hace nada, sin aviso. Afecta a los 14 nombres con tilde (Hidrógeno, Nitrógeno, Oxígeno,
// Flúor, Neón, Fósforo, Argón, Níquel, Arsénico, Kriptón, Xenón, Tántalo, Radón, Oganesón).
// tabla-periodica normaliza el texto antes de comparar. Esperado: una sugerencia cada uno.
test('D · ABIERTO: el buscador encuentra los nombres escritos sin tilde', async ({ page }) => {
  test.fail();
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

// E · ABIERTO, hallazgo (inspector 04/11/2026). El elemento 103 se llama «Lawrencio» en la ficha,
// la tabla y el buscador, pero «laurencio» en la FAQ visible y en el texto de su propio aviso de
// excepción («En el laurencio los efectos relativistas…»); buscar «laurencio» no da nada.
// Esperado: el aviso de excepción del Lr nombra el elemento como lo nombra su ficha.
test('E · ABIERTO: el Lr se llama igual en su ficha y en su aviso de excepción', async ({ page }) => {
  test.fail();
  await abrir(page);
  await elegir(page, 'Lawrencio', 'Lr', 103);
  const nombre = ((await page.locator('#titulo-resultado').textContent()) ?? '').trim().toLowerCase();
  const aviso = page.locator('h3', { hasText: 'Este elemento es una excepción' }).locator('xpath=..');
  expect(((await aviso.textContent()) ?? '').toLowerCase()).toContain(`en el ${nombre}`);
});

// F · ABIERTO, hallazgo (inspector 04/11/2026). El aria-label de los tres botones «Copiar» es
// `Copiar la configuración en orden ${titulo}`, y el título ya trae su propia frase: un lector
// de pantalla oye «Copiar la configuración en orden en orden de llenado», «… en orden ordenada
// por niveles» y «… en orden abreviada con gas noble». Esperado: ninguno repite «en orden».
test('F · ABIERTO: los botones de copiar tienen un nombre accesible gramatical', async ({ page }) => {
  test.fail();
  await abrir(page);
  const nombres = await page
    .locator('button', { hasText: /^Copiar$/ })
    .evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-label') ?? ''));
  expect(nombres).toHaveLength(3);
  for (const n of nombres) expect(n).not.toMatch(/en orden (en orden|ordenada|abreviada)/);
});

// G · ABIERTO, hallazgo (inspector 04/11/2026). La tarjeta «Repaso antes de un examen» afirma
// que las excepciones y los aniones «son el 20 % de las preguntas», sin fuente ni contexto
// (neutralidad editorial, regla 1: cifras sin fuente). Esperado: la cifra con su fuente, o sin cifra.
test('G · ABIERTO: la guía no da el «20 % de las preguntas» sin fuente', async ({ page }) => {
  test.fail();
  await abrir(page);
  await expect(page.locator('main')).not.toContainText('son el 20 % de las preguntas');
});

// H · ABIERTO, hallazgo (inspector 04/11/2026). Los desapareados deciden el magnetismo del ÁTOMO
// aislado, pero la guía («Si queda algún electrón sin pareja, la sustancia es paramagnética») y
// el FAQPage («la sustancia es paramagnética y es atraída por un imán… el hierro, con cuatro
// desapareados, responde a un campo magnético») lo trasladan a la sustancia. Con el Cu la ficha
// dice «Paramagnético · Es atraído por un campo magnético»; el cobre metálico, el N₂ o el Cl₂
// son diamagnéticos aunque sus átomos tengan electrones sin pareja, y lo que hace al hierro
// responder a un imán es el ferromagnetismo del metal. Esperado: la guía habla del átomo.
test('H · ABIERTO: la guía no atribuye a la sustancia el magnetismo del átomo aislado', async ({ page }) => {
  test.fail();
  await abrir(page);
  await expect(page.locator('main')).not.toContainText('la sustancia es paramagnética');
  const faq = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(faq.join('\n')).not.toContain('la sustancia es paramagnética');
});
