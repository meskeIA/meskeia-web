/**
 * comparador-coste-vida — primera inspección del Inspector (11/11/2026)
 *
 * La app no calcula a partir de lo que teclea el usuario: elige dos ciudades de una lista cerrada
 * (55, en `CIUDADES` de app/comparador-coste-vida/page.tsx) y muestra, para cada partida y para el
 * índice (Madrid = 100), la diferencia `Math.round((B − A) / A × 100)`. Los esperados de abajo salen
 * de aplicar esa fórmula a los valores escritos en `CIUDADES`, resueltos antes de abrir la app
 * (.inspector-trabajo/comparador-coste-vida-datos.mjs).
 *
 * Formato: las cifras de cuatro dígitos van sin punto de millar (1300 €/mes), como manda la RAE y
 * hace Intl es-ES (CLAUDE.md global §2): no es un defecto. El «%» pegado SÍ lo es (25/09/2026): los
 * casos de cifras lo normalizan y lo vigila aparte un test.fail().
 */
import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { esperarValorEnReact } from './_hidratacion';

const RUTA = '/comparador-coste-vida/';
const PIXEL7 = devices['Pixel 7'];

/** Un <select> no tiene `_valueTracker`: se espera a que React le haya colgado su onChange. */
async function esperarSelectores(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      ['#ciudad-a', '#ciudad-b', '#orden'].every((sel) => {
        const el = document.querySelector(sel) as unknown as Record<string, unknown> | null;
        if (!el) return false;
        const clave = Object.keys(el).find((k) => k.startsWith('__reactProps$'));
        const props = clave ? (el[clave] as { onChange?: unknown } | null) : null;
        return typeof props?.onChange === 'function';
      }),
    null,
    { timeout: 15000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarSelectores(page);
}

async function elegir(page: Page, a: string, b: string): Promise<void> {
  await page.locator('#ciudad-a').selectOption(a);
  await esperarValorEnReact(page, '#ciudad-a', a);
  await page.locator('#ciudad-b').selectOption(b);
  await esperarValorEnReact(page, '#ciudad-b', b);
}

/** El resumen «B es un N % más cara que A»: primer hijo de la región viva que contiene la tabla. */
function resumen(page: Page): Locator {
  return page
    .locator('[aria-live="polite"]')
    .filter({ has: page.getByRole('table', { name: 'Comparación de costes' }) })
    .locator(':scope > div')
    .first();
}

/** Espacio duro a espacio, espacios colapsados y sin espacio ante «%»: compara solo la cifra. */
const normal = (t: string): string =>
  t.replace(/ /g, ' ').replace(/\s+/g, ' ').replace(/ %/g, '%').trim();

/** Las cuatro celdas de una fila de la tabla comparativa, normalizadas. */
async function celdas(page: Page, etiqueta: RegExp): Promise<string[]> {
  const fila = page.getByRole('table', { name: 'Comparación de costes' }).getByRole('row', { name: etiqueta });
  return (await fila.getByRole('cell').allTextContents()).map(normal);
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
}

interface NodoLd {
  '@type'?: string;
  featureList?: unknown[];
  features?: unknown[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function leerLd(page: Page): Promise<NodoLd[]> {
  return page.$$eval('script[type="application/ld+json"]', (ss) =>
    ss.map((s) => JSON.parse(s.textContent ?? '{}') as NodoLd),
  );
}

test.describe('comparador-coste-vida — comparar dos ciudades (escritorio)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('caso normal: Valencia (A) frente a Barcelona (B)', async ({ page }) => {
    // Índice 87 → 115: (115 − 87) / 87 = 32,18 % → 32. Partidas: 850 → 1300 = 52,94 → +53;
    // 11 → 14 = 27,27 → +27; 260 → 300 = 15,38 → +15; 45 → 80 = 77,78 → +78; 32 → 35 = 9,375 → +9.
    await elegir(page, 'Valencia', 'Barcelona');
    await expect.poll(async () => normal((await resumen(page).textContent()) ?? '')).toBe(
      'Barcelona es un 32% más cara que Valencia',
    );
    expect(await celdas(page, /^Alquiler/)).toEqual(['Alquiler (1 hab, centro)', '850 €/mes', '+53%', '1300 €/mes']);
    expect(await celdas(page, /^Cena/)).toEqual(['Cena restaurante económico', '11 €/pers.', '+27%', '14 €/pers.']);
    expect(await celdas(page, /^Supermercado/)).toEqual(['Supermercado mensual est.', '260 €/mes', '+15%', '300 €/mes']);
    expect(await celdas(page, /^Transporte/)).toEqual(['Transporte público mensual', '45 €/mes', '+78%', '80 €/mes']);
    expect(await celdas(page, /^Internet/)).toEqual(['Internet fibra mensual', '32 €/mes', '+9%', '35 €/mes']);
    expect(await celdas(page, /^Índice total/)).toEqual(['Índice total (Madrid = 100)', '87', '+32%', '115']);
  });

  test('caso normal invertido: Barcelona (A) frente a Valencia (B) da la diferencia sobre A', async ({ page }) => {
    // (87 − 115) / 115 = −24,35 % → −24 (no −32: la base es la ciudad A). Alquiler 1300 → 850 =
    // −34,62 → −35; transporte 80 → 45 = −43,75 → −44.
    await elegir(page, 'Barcelona', 'Valencia');
    await expect.poll(async () => normal((await resumen(page).textContent()) ?? '')).toBe(
      'Valencia es un 24% más barata que Barcelona',
    );
    expect(await celdas(page, /^Alquiler/)).toEqual(['Alquiler (1 hab, centro)', '1300 €/mes', '-35%', '850 €/mes']);
    expect(await celdas(page, /^Transporte/)).toEqual(['Transporte público mensual', '80 €/mes', '-44%', '45 €/mes']);
    expect(await celdas(page, /^Índice total/)).toEqual(['Índice total (Madrid = 100)', '115', '-24%', '87']);
  });

  test('límite: la misma ciudad en A y en B da «=» en todas las filas', async ({ page }) => {
    // Madrid ya es la A por defecto; la B pasa de Londres a Madrid. Todas las diferencias, 0.
    await elegir(page, 'Madrid', 'Madrid');
    await expect.poll(async () => normal((await resumen(page).textContent()) ?? '')).toBe(
      'Madrid y Madrid tienen un coste de vida similar',
    );
    for (const etiqueta of [/^Alquiler/, /^Cena/, /^Supermercado/, /^Transporte/, /^Internet/, /^Índice total/]) {
      expect((await celdas(page, etiqueta))[2]).toBe('=');
    }
  });

  test('límite: la más barata (El Cairo, 28) frente a la más cara (Nueva York, 250), en los dos sentidos', async ({ page }) => {
    // (250 − 28) / 28 = 792,86 % → 793; alquiler 250 → 3200 = +1180 %; transporte 15 → 130 = 766,67 → 767.
    await elegir(page, 'El Cairo', 'Nueva York');
    await expect.poll(async () => normal((await resumen(page).textContent()) ?? '')).toBe(
      'Nueva York es un 793% más cara que El Cairo',
    );
    expect(await celdas(page, /^Alquiler/)).toEqual(['Alquiler (1 hab, centro)', '250 €/mes', '+1180%', '3200 €/mes']);
    expect(await celdas(page, /^Transporte/)).toEqual(['Transporte público mensual', '15 €/mes', '+767%', '130 €/mes']);
    // Al revés: (28 − 250) / 250 = −88,8 % → −89; alquiler 3200 → 250 = −92,19 → −92.
    await elegir(page, 'Nueva York', 'El Cairo');
    await expect.poll(async () => normal((await resumen(page).textContent()) ?? '')).toBe(
      'El Cairo es un 89% más barata que Nueva York',
    );
    expect(await celdas(page, /^Alquiler/)).toEqual(['Alquiler (1 hab, centro)', '3200 €/mes', '-92%', '250 €/mes']);
    expect(await celdas(page, /^Índice total/)).toEqual(['Índice total (Madrid = 100)', '250', '-89%', '28']);
  });

  test('rechazo: no hay nada que teclear, solo las 55 ciudades de la lista', async ({ page }) => {
    // El caso «vacío, negativo, texto, 1.500 / 1,5» no aplica: la herramienta no tiene ningún campo
    // libre. Se comprueba que siga siendo así y que los dos selectores ofrezcan las 55 de CIUDADES.
    await expect(page.locator('main input, main textarea')).toHaveCount(0);
    await expect(page.locator('#ciudad-a option')).toHaveCount(55);
    await expect(page.locator('#ciudad-b option')).toHaveCount(55);
  });

  test('ranking: 55 ciudades; por índice de El Cairo (28) a Nueva York (250); alfabético de Ámsterdam a Zúrich', async ({ page }) => {
    const items = page.getByRole('listitem').filter({ has: page.locator('[aria-label^="Índice "]') });
    await expect(items).toHaveCount(55);
    await expect(items.first()).toContainText('El Cairo');
    await expect(items.first()).toContainText('28');
    await expect(items.last()).toContainText('Nueva York');
    await expect(items.last()).toContainText('250');
    await page.locator('#orden').selectOption('ciudad');
    await esperarValorEnReact(page, '#orden', 'ciudad');
    await expect(items.first()).toContainText('Ámsterdam');
    await expect(items.last()).toContainText('Zúrich');
  });

  test('la pregunta «coste/costo» tiene la misma respuesta en el FAQPage y en la FAQ visible (C0570)', async ({ page }) => {
    const ld = await leerLd(page);
    const faq = ld.find((n) => n['@type'] === 'FAQPage');
    const q = faq?.mainEntity?.find((e) => e.name === '¿Es lo mismo «coste de vida» que «costo de vida»?');
    expect(q).toBeTruthy();
    const dd = page.locator('dt', { hasText: '¿Es lo mismo «coste de vida» que «costo de vida»?' }).locator('xpath=following-sibling::dd[1]');
    expect(normal((await dd.textContent()) ?? '')).toBe(normal(q?.acceptedAnswer.text ?? ''));
  });

  // ─── Hallazgos abiertos ────────────────────────────────────────────────────────────────────

  test('ABIERTO: el índice contradice su propia tabla (Chicago frente a Toronto)', async ({ page }) => {
    test.fail(); // ABIERTO: el índice está escrito a mano y no se deriva de las partidas
    // Toronto iguala a Chicago en alquiler, cena y supermercado y la supera en transporte
    // (100 → 130 = +30 %) e internet (45 → 55 = +22,2 % → +22). Con un índice que «pondera
    // vivienda, alimentación, transporte público e internet» (guía), Toronto no puede ser más barata.
    await elegir(page, 'Chicago', 'Toronto');
    expect(await celdas(page, /^Alquiler/)).toEqual(['Alquiler (1 hab, centro)', '1900 €/mes', '=', '1900 €/mes']);
    expect(await celdas(page, /^Cena/)).toEqual(['Cena restaurante económico', '18 €/pers.', '=', '18 €/pers.']);
    expect(await celdas(page, /^Supermercado/)).toEqual(['Supermercado mensual est.', '380 €/mes', '=', '380 €/mes']);
    expect(await celdas(page, /^Transporte/)).toEqual(['Transporte público mensual', '100 €/mes', '+30%', '130 €/mes']);
    expect(await celdas(page, /^Internet/)).toEqual(['Internet fibra mensual', '45 €/mes', '+22%', '55 €/mes']);
    // Obtenido: «Toronto es un 2% más barata que Chicago» (índice 175 → 172).
    await expect(resumen(page)).not.toContainText('más barata');
  });

  test('ABIERTO: la tabla de ciudades españolas de la guía da otro alquiler de Madrid que el comparador', async ({ page }) => {
    test.fail(); // ABIERTO: dos juegos de cifras para las mismas ciudades en la misma página
    await elegir(page, 'Madrid', 'Sevilla');
    expect(await celdas(page, /^Alquiler/)).toEqual(['Alquiler (1 hab, centro)', '1100 €/mes', '-27%', '800 €/mes']);
    await abrirGuia(page);
    const tabla = page.locator('table').filter({ hasText: 'Alquiler 1 hab. centro' });
    const madrid = tabla.getByRole('row', { name: /^Madrid/ }).getByRole('cell');
    const alquilerGuia = Number(((await madrid.nth(1).textContent()) ?? '').replace(/\D/g, ''));
    // Obtenido: «~1.400 €» frente a los 1100 €/mes del comparador.
    expect(alquilerGuia).toBe(1100);
  });

  test('ABIERTO: el FAQPage cuenta a Suiza entre los países nórdicos', async ({ page }) => {
    test.fail(); // ABIERTO: Suiza linda con Francia, Alemania, Austria, Liechtenstein e Italia (ficha país, MAEC, julio 2026)
    const faq = (await leerLd(page)).find((n) => n['@type'] === 'FAQPage');
    const q = faq?.mainEntity?.find((e) => e.name.startsWith('¿Qué ciudades tienen mejor relación entre salario'));
    expect(q).toBeTruthy();
    expect(q?.acceptedAnswer.text ?? '').not.toMatch(/nórdicos como Noruega o Suiza/);
  });

  test('ABIERTO: la FAQ visible mete el ocio en el índice y «Limitaciones» dice que no está', async ({ page }) => {
    test.fail(); // ABIERTO: dos definiciones del índice en la misma guía
    await abrirGuia(page);
    await expect(page.getByText('El coste del ocio, sanidad y educación no está reflejado')).toBeVisible();
    const dd = page.locator('dt', { hasText: '¿Incluye el coste de vida los impuestos?' }).locator('xpath=following-sibling::dd[1]');
    await expect(dd).not.toContainText('ocio');
  });

  test('ABIERTO: la metadata promete «más de 55 ciudades» y la lista tiene 55', async ({ page }) => {
    test.fail(); // ABIERTO: recuento escrito a mano (también en el JSON-LD y en applications.ts)
    await expect(page.locator('#ciudad-a option')).toHaveCount(55);
    const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(descripcion).not.toContain('más de 55');
  });

  test('ABIERTO: la metadata fecha los datos en 2024-2025 y la página en 2025-2026', async ({ page }) => {
    test.fail(); // ABIERTO: fechas distintas para el mismo conjunto de datos
    await expect(page.getByText('Datos 2025-2026', { exact: false }).first()).toBeVisible();
    const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(descripcion).toContain('2025-2026');
  });

  test('ABIERTO: el JSON-LD no declara características (features)', async ({ page }) => {
    test.fail(); // ABIERTO: CLAUDE.md §1.ter pide 4-8
    const app = (await leerLd(page)).find((n) => n['@type'] === 'WebApplication');
    expect(app).toBeTruthy();
    const lista = app?.featureList ?? app?.features ?? [];
    expect(lista.length).toBeGreaterThanOrEqual(4);
  });

  test('ABIERTO: el «%» del resumen y de las diferencias va pegado (debe llevar espacio duro)', async ({ page }) => {
    test.fail(); // ABIERTO: CLAUDE.md global §2, «15 %» con U+00A0 (25/09/2026)
    await elegir(page, 'Valencia', 'Barcelona');
    // toHaveText normaliza el espacio: se mira el carácter anterior al «%» por su código.
    const texto = (await resumen(page).textContent()) ?? '';
    const dif = (await page.getByRole('row', { name: /^Alquiler/ }).getByRole('cell').nth(2).textContent()) ?? '';
    expect([texto.charCodeAt(texto.indexOf('%') - 1), dif.charCodeAt(dif.indexOf('%') - 1)]).toEqual([0xa0, 0xa0]);
  });

  test('ABIERTO: el redondeo de los negativos no es simétrico (−37,5 % sale −37)', async ({ page }) => {
    test.fail(); // ABIERTO: Math.round lleva el empate hacia +∞; formatNumber de @/lib lo aleja de cero
    // Lisboa → Madrid, transporte 40 → 55 = +37,5 % → +38 (el positivo sí se aleja de cero).
    await elegir(page, 'Lisboa', 'Madrid');
    expect((await celdas(page, /^Transporte/))[2]).toBe('+38%');
    // Barcelona → Viena, transporte 80 → 50 = −37,5 % → esperado −38; obtenido −37.
    await elegir(page, 'Barcelona', 'Viena');
    expect((await celdas(page, /^Transporte/))[2]).toBe('-38%');
  });

  test('ABIERTO: el nombre accesible de los selectores no contiene su rótulo visible', async ({ page }) => {
    test.fail(); // ABIERTO: WCAG 2.5.3; el aria-label «Primera ciudad para comparar» tapa el <label> «Ciudad A»
    await expect(page.getByRole('combobox', { name: 'Primera ciudad para comparar' })).toHaveCount(1);
    await expect(page.getByRole('combobox', { name: /Ciudad A/ })).toHaveCount(1);
  });

  test('ABIERTO: la caja estática «Errores frecuentes» lleva role="alert"', async ({ page }) => {
    test.fail(); // ABIERTO: no es un aviso que aparezca por una acción; con la guía plegada no está en el árbol
    await abrirGuia(page);
    await expect(page.getByRole('alert').filter({ hasText: 'Errores frecuentes al comparar ciudades' })).toHaveCount(0);
  });

  test('ABIERTO: con el ranking «Por alquiler» no se ve el alquiler de ninguna ciudad', async ({ page }) => {
    test.fail(); // ABIERTO: cada fila sigue mostrando el índice, que deja de ir en orden
    await page.locator('#orden').selectOption('alquiler');
    await esperarValorEnReact(page, '#orden', 'alquiler');
    const items = page.getByRole('listitem').filter({ has: page.locator('[aria-label^="Índice "]') });
    await expect(items.first()).toContainText('El Cairo');
    await expect(items.last()).toContainText('Nueva York');
    // Sevilla paga 800 €/mes de alquiler; su fila muestra «83» (el índice).
    await expect(items.filter({ hasText: 'Sevilla' })).toContainText('800');
  });

  test('ABIERTO: la guía da dos topes distintos para la diferencia de IRPF entre comunidades', async ({ page }) => {
    test.fail(); // ABIERTO: paso 2 «entre 50 y 300 €» frente a «hasta 400 €/mes» de los errores frecuentes
    await abrirGuia(page);
    const paso2 = (await page.getByText('Un mismo bruto puede suponer entre').textContent()) ?? '';
    const aviso = (await page.getByText('Un sueldo bruto idéntico puede generar hasta').textContent()) ?? '';
    const tope = (t: string, re: RegExp): number => Number((t.match(re) ?? [])[1]);
    expect(tope(paso2, /entre \d+ y (\d+) €/)).toBe(tope(aviso, /hasta (\d+) €/));
  });
});

test.describe('comparador-coste-vida — móvil (Pixel 7)', () => {
  test.use({
    viewport: PIXEL7.viewport,
    userAgent: PIXEL7.userAgent,
    deviceScaleFactor: PIXEL7.deviceScaleFactor,
    isMobile: PIXEL7.isMobile,
    hasTouch: PIXEL7.hasTouch,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('tras elegir la ciudad B el resumen queda a la vista y la página no desborda en horizontal', async ({ page }) => {
    await page.locator('#ciudad-b').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await elegir(page, 'Valencia', 'Barcelona');
    await expect(resumen(page)).toBeInViewport();
    await expect.poll(async () => normal((await resumen(page).textContent()) ?? '')).toBe(
      'Barcelona es un 32% más cara que Valencia',
    );
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  });

  test('ABIERTO: en móvil la tabla no dice qué columna es cada ciudad y la de B se parte en dos líneas', async ({ page }) => {
    test.fail(); // ABIERTO: .filaCabecera { display: none } y la rejilla 1fr auto 55px auto con la etiqueta a todo el ancho
    await elegir(page, 'Valencia', 'Barcelona');
    const fila = page.getByRole('table', { name: 'Comparación de costes' }).getByRole('row', { name: /^Alquiler/ });
    const altoA = (await fila.getByRole('cell').nth(1).boundingBox())?.height ?? 0;
    const altoB = (await fila.getByRole('cell').nth(3).boundingBox())?.height ?? 0;
    expect.soft(altoB, '«1300 €/mes» en una línea, como «850 €/mes»').toBeLessThanOrEqual(altoA + 2);
    await expect(page.getByRole('columnheader', { name: 'Valencia' })).toBeVisible();
  });
});
