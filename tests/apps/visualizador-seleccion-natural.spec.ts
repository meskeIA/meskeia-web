import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { prepararParaMedir } from '../_contraste';

/**
 * Selección Natural (visualizador-seleccion-natural) — generado por /inspector el 17/11/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Selección Natural» y el subtítulo «El motor de la evolución: cómo la naturaleza
 *   "elige" sin elegir». Es un explicador sin entradas de usuario: cuatro secciones (nav con
 *   aria-pressed) con tarjetas desplegables y, en «El Mecanismo», la «Simulación: camuflaje en
 *   acción»: 40 bichos de tres colores sobre fondo verde y cinco generaciones con
 *   «Siguiente generación →», «← Anterior» y «Reiniciar». La propia app enuncia el mecanismo: «Los
 *   verdes se camuflan, los rojos y azules son devorados», y rotula rojo y azul igual: «(visible)».
 *
 * LO QUE TIENE VERDAD COMPROBABLE, RESUELTO A MANO ANTES DE ABRIR LA APP
 *   GENERACIONES (page.tsx) es una tabla fija de porcentajes [verde, rojo, azul]; generarPoblacion
 *   pinta Math.round(p / 100 · 40) bichos de cada color, completa con verdes hasta 40 y baraja
 *   (Math.random: el ORDEN es aleatorio; los recuentos, no, y son lo único que se fija aquí).
 *     Gen 1  33/34/33 → 13,2 · 13,6 · 13,2 → 13 · 14 · 13 = 40
 *     Gen 2  50/28/22 → 20 · 11,2 · 8,8   → 20 · 11 · 9  = 40
 *     Gen 3  68/18/14 → 27,2 · 7,2 · 5,6  → 27 · 7 · 6   = 40
 *     Gen 4  82/10/8  → 32,8 · 4 · 3,2    → 33 · 4 · 3   = 40
 *     Gen 5  92/5/3   → 36,8 · 2 · 1,2    → 37 · 2 · 1   = 40
 *   Medido el 17/11/2026: los cinco recuentos y los cinco porcentajes coinciden con lo calculado,
 *   los límites (1.ª y 5.ª) no se rebasan ni con un clic forzado y Reiniciar vuelve a la 1.ª.
 *
 *   Contra el MECANISMO que la app enuncia (rojo y azul igual de visibles): si el depredador no los
 *   distingue, su razón se conserva, cualquiera que sea la intensidad de la selección. Con
 *   eficacias constantes, w(verde) = 1 y w(rojo) = w(azul) = w, el paso 33 → 50 % de verdes da
 *   0,50 = 0,33 / (0,33 + 0,67 w) → w = 0,4925, y entonces rojo = 0,34 w / 0,66 = 25,4 % y azul =
 *   0,33 w / 0,66 = 24,6 % en la 2.ª (la app: 28 y 22); en la 5.ª, 89,3 / 5,4 / 5,3 (la app:
 *   92 / 5 / 3). Y las cifras no son las de los 40 bichos que pinta: 14 de 40 = 35 %, no «34%».
 *
 * ABIERTOS (inspección del 17/11/2026), al final del fichero con test.fail: la tabla de la
 *   simulación frente a su mecanismo y a sus bichos · «33%» sin espacio · nombre accesible de
 *   «Anterior» y «Siguiente generación» sin su texto visible y cambio de generación mudo ·
 *   tarjetas desplegables con aria-pressed · número del pilar activo a 4,47:1 · pinzones y
 *   «20 años de miedo» · el dodo «cazado hasta la extinción» · «Los europeos la toleran».
 *
 * NOTA (no es hallazgo de cálculo): generarPoblacion corre en el render (useMemo) con Math.random;
 *   el HTML prerenderizado trae otro orden y React no corrige los atributos al hidratar (25 de 40
 *   aria-label distintos de sus props el 17/11/2026). Como es una permutación, recuentos y colores
 *   pintados siguen cuadrando. check:reloj-azar solo mira el valor inicial de un useState.
 */

const RUTA = '/visualizador-seleccion-natural/';

const COLORES = ['Verde (camuflado)', 'Rojo (visible)', 'Azul (visible)'] as const;
// COLORES_INDIVIDUO de page.tsx tal como los devuelve getComputedStyle
const RGB: Record<string, 'verde' | 'rojo' | 'azul'> = {
  'rgb(76, 175, 80)': 'verde',
  'rgb(229, 57, 53)': 'rojo',
  'rgb(30, 136, 229)': 'azul',
};

/** Esperados resueltos a mano (cabecera): porcentaje mostrado y bichos pintados por generación. */
const ESPERADO: Array<{ pct: number[]; n: number[] }> = [
  { pct: [33, 34, 33], n: [13, 14, 13] },
  { pct: [50, 28, 22], n: [20, 11, 9] },
  { pct: [68, 18, 14], n: [27, 7, 6] },
  { pct: [82, 10, 8], n: [33, 4, 3] },
  { pct: [92, 5, 3], n: [37, 2, 1] },
];

const nav = (page: Page) => page.locator('nav[aria-label="Secciones del explicador"] button');
const irA = async (page: Page, seccion: string): Promise<void> => {
  await nav(page).filter({ hasText: seccion }).click();
  await expect(nav(page).filter({ hasText: seccion })).toHaveAttribute('aria-pressed', 'true');
};
// Por su texto visible, no por su aria-label: el hallazgo de «label in name» lo cambiará
const siguiente = (page: Page) => page.locator('button', { hasText: 'Siguiente generación' });
const anterior = (page: Page) => page.locator('button', { hasText: 'Anterior' });
const reiniciar = (page: Page) => page.locator('button', { hasText: 'Reiniciar' });
const etiquetaGen = (page: Page) => page.getByText(/Generación \d+ de \d+/);

/** «33%», «33 %» o «32,5 %» → 33 / 32.5 */
const porcentaje = (s: string): number => Number((s.match(/([\d,]+)\s?%/)?.[1] ?? 'NaN').replace(',', '.'));

interface Lectura {
  gen: number;
  textos: string[];
  pct: number[];
  total: number;
  n: number[];
  pintados: number[];
}

async function leer(page: Page): Promise<Lectura> {
  const etiqueta = (await etiquetaGen(page).textContent()) ?? '';
  const gen = Number(etiqueta.match(/Generación (\d+) de 5/)?.[1] ?? NaN);
  const textos: string[] = [];
  for (const nombre of COLORES) {
    textos.push(((await page.getByText(nombre, { exact: true }).locator('xpath=following-sibling::div[1]').textContent()) ?? '').trim());
  }
  const bichos = await page.locator('[aria-label^="Individuo color"]').evaluateAll((els) =>
    els.map((e) => ({ label: (e.getAttribute('aria-label') ?? '').replace('Individuo color ', ''), bg: getComputedStyle(e).backgroundColor })),
  );
  const contar = (lista: string[]) => (['verde', 'rojo', 'azul'] as const).map((c) => lista.filter((x) => x === c).length);
  return {
    gen,
    textos,
    pct: textos.map(porcentaje),
    total: bichos.length,
    n: contar(bichos.map((b) => b.label)),
    pintados: contar(bichos.map((b) => RGB[b.bg] ?? '?')),
  };
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
});

// CASO 1 — normal. Arranca en la 1.ª generación con 13/14/13 bichos (33/34/33 %) y un clic en
// «Siguiente generación» la lleva a la 2.ª: 20/11/9 bichos y 50/28/22 % (cabecera).
test('caso normal — de la generación 1 a la 2: 13/14/13 bichos con 33/34/33 y luego 20/11/9 con 50/28/22', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Selección Natural');
  await expect(nav(page).filter({ hasText: 'El Mecanismo' })).toHaveAttribute('aria-pressed', 'true');

  let l = await leer(page);
  expect(l.gen).toBe(1);
  expect(l.total).toBe(40);
  expect(l.pct).toEqual([33, 34, 33]);
  expect(l.n).toEqual([13, 14, 13]);
  expect(l.pintados).toEqual(l.n); // el color pintado dice lo mismo que el aria-label

  await siguiente(page).click();
  await expect(etiquetaGen(page)).toContainText('Generación 2 de 5');
  l = await leer(page);
  expect(l.pct).toEqual([50, 28, 22]);
  expect(l.n).toEqual([20, 11, 9]); // 20 · round(11,2) · round(8,8)
  expect(l.pintados).toEqual(l.n);
  await expect(anterior(page)).toBeEnabled();
});

// CASO 2 — límite: la última generación. Cuatro clics llegan a la 5.ª: 37/2/1 bichos y 92/5/3 %.
// «Siguiente» queda deshabilitado, y un .click() por script sobre el botón (que salta la
// comprobación de accionabilidad de Playwright) no la pasa de la 5.ª ni rompe la página.
test('caso límite — en la 5.ª generación: 37/2/1 bichos con 92/5/3 y «Siguiente» deshabilitado; un clic forzado no la pasa', async ({ page }) => {
  for (let g = 2; g <= 5; g++) {
    await siguiente(page).click();
    await expect(etiquetaGen(page)).toContainText(`Generación ${g} de 5`);
  }
  await expect(siguiente(page)).toBeDisabled();
  await siguiente(page).evaluate((b) => (b as HTMLButtonElement).click());
  await expect(etiquetaGen(page)).toContainText('Generación 5 de 5');
  const l = await leer(page);
  expect(l.pct).toEqual([92, 5, 3]);
  expect(l.n).toEqual([37, 2, 1]); // round(36,8) · 2 · round(1,2)
  expect(l.total).toBe(40);
});

// CASO 3 — lo que debe impedirse: retroceder por debajo de la 1.ª generación. «Anterior» nace
// deshabilitado y un clic forzado no lleva a una «Generación 0» (GENERACIONES[-1] sería undefined
// y la página caería). Y «Reiniciar» desde la 3.ª vuelve a la 1.ª con 13/14/13.
test('caso que debe rechazarse — en la 1.ª no se retrocede y Reiniciar desde la 3.ª vuelve a 13/14/13', async ({ page }) => {
  await expect(anterior(page)).toBeDisabled();
  await anterior(page).evaluate((b) => (b as HTMLButtonElement).click());
  await expect(etiquetaGen(page)).toContainText('Generación 1 de 5');
  expect((await leer(page)).pct).toEqual([33, 34, 33]);

  await siguiente(page).click();
  await siguiente(page).click();
  await expect(etiquetaGen(page)).toContainText('Generación 3 de 5');
  expect((await leer(page)).n).toEqual([27, 7, 6]);
  await reiniciar(page).click();
  await expect(etiquetaGen(page)).toContainText('Generación 1 de 5');
  const l = await leer(page);
  expect(l.n).toEqual([13, 14, 13]);
  expect(l.pintados).toEqual([13, 14, 13]);
  await expect(anterior(page)).toBeDisabled();
});

// Invariante de las cinco generaciones, ida y vuelta: 40 bichos, cada recuento el calculado a mano
// y «Anterior» deshace exactamente lo que hizo «Siguiente».
test('invariante — las cinco generaciones dan los recuentos de la cabecera, también volviendo con «Anterior»', async ({ page }) => {
  for (let g = 0; g < 5; g++) {
    if (g > 0) await siguiente(page).click();
    await expect(etiquetaGen(page)).toContainText(`Generación ${g + 1} de 5`);
    const l = await leer(page);
    expect({ gen: l.gen, total: l.total, pct: l.pct, n: l.n }).toEqual({ gen: g + 1, total: 40, ...ESPERADO[g] });
    expect(l.pintados).toEqual(l.n);
  }
  for (let g = 3; g >= 0; g--) {
    await anterior(page).click();
    await expect(etiquetaGen(page)).toContainText(`Generación ${g + 1} de 5`);
    const l = await leer(page);
    expect({ pct: l.pct, n: l.n }).toEqual(ESPERADO[g]);
  }
});

test.describe('móvil 375 × 667 con toque', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Medido el 17/11/2026: scrollWidth 375 en las cuatro secciones y la rejilla de bichos a 5
  // columnas (≤ 768 px), así que 40 bichos son 8 filas completas.
  test('móvil — ninguna sección desborda, la rejilla pasa a 5 columnas y tocar avanza la generación', async ({ page }) => {
    for (const seccion of ['Ejemplos Clásicos', 'Darwin vs Lamarck', 'Datos Fascinantes', 'El Mecanismo']) {
      await nav(page).filter({ hasText: seccion }).tap();
      await expect(nav(page).filter({ hasText: seccion })).toHaveAttribute('aria-pressed', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth), seccion).toBeLessThanOrEqual(375);
    }
    const columnas = await page
      .locator('[aria-label^="Individuo color"]')
      .first()
      .evaluate((e) => getComputedStyle(e.parentElement as HTMLElement).gridTemplateColumns.split(' ').length);
    expect(columnas).toBe(5);
    await siguiente(page).tap();
    await expect(etiquetaGen(page)).toContainText('Generación 2 de 5');
    expect((await leer(page)).n).toEqual([20, 11, 9]);
  });
});

// ─── ABIERTOS (inspección del 17/11/2026) ──────────────────────────────────────────────────────
// Cada test expresa lo CORRECTO y lleva test.fail() mientras el defecto siga ahí.

// ABIERTO (calculo, medio) — la tabla de la simulación no cuadra con los bichos que pinta.
// Entrada: las cinco generaciones. Esperado: la cifra de cada color es la de sus bichos (n / total).
// Obtenido: «34%» de rojos en la 1.ª con 14 de 40 pintados (35 %); «14%» de azules en la 3.ª con
// 6 de 40 (15 %). Con 40 bichos cada uno vale 2,5 puntos: la tabla pide cifras imposibles.
test('ABIERTO — simulación: la cifra de cada color es la de los bichos que pinta', async ({ page }) => {
  test.fail();
  const desajustes: string[] = [];
  for (let g = 0; g < 5; g++) {
    if (g > 0) await siguiente(page).click();
    await expect(etiquetaGen(page)).toContainText(`Generación ${g + 1} de 5`);
    const l = await leer(page);
    l.n.forEach((n, i) => {
      const real = (n / l.total) * 100;
      if (Math.abs(real - l.pct[i]) >= 0.05) desajustes.push(`gen ${g + 1} ${COLORES[i]}: muestra ${l.textos[i]}, pinta ${n} de ${l.total} (${real} %)`);
    });
  }
  expect(desajustes).toEqual([]);
});

// ABIERTO (calculo, medio, mismo hallazgo) — rojo y azul, «(visible)» los dos, no conservan su razón.
// Esperado, del mecanismo que enuncia la app: si el depredador no los distingue, rojo:azul se
// queda en 34:33 (cabecera: 25,4 / 24,6 % en la 2.ª con eficacias constantes). Tolerancia: un bicho
// de 40 (2,5 puntos) en la cifra y en el recuento. Obtenido: 28 / 22 % y 11 / 9 bichos en la 2.ª,
// 18 / 14 % en la 3.ª; en la 5.ª quedan dos rojos por cada azul (5 / 3 %) sin que nada lo explique.
test('ABIERTO — simulación: rojo y azul, igual de visibles, conservan su razón', async ({ page }) => {
  test.fail();
  const fuera: string[] = [];
  for (let g = 0; g < 5; g++) {
    if (g > 0) await siguiente(page).click();
    await expect(etiquetaGen(page)).toContainText(`Generación ${g + 1} de 5`);
    const l = await leer(page);
    if (Math.abs(l.pct[1] - l.pct[2]) > 2.5 || Math.abs(l.n[1] - l.n[2]) > 1)
      fuera.push(`gen ${g + 1}: rojo ${l.textos[1]} (${l.n[1]}) · azul ${l.textos[2]} (${l.n[2]})`);
  }
  expect(fuera).toEqual([]);
});

// ABIERTO (contenido, bajo) — formato del porcentaje. Esperado: «33 %» con espacio duro (U+00A0),
// regla del 25/09/2026. Obtenido: «33%», «34%», «33%» en las tres tarjetas de proporción.
test('ABIERTO — formato: las proporciones llevan espacio duro antes del %', async ({ page }) => {
  test.fail();
  const l = await leer(page);
  for (const t of l.textos) expect(t).toMatch(/^\d+(,\d+)? %$/);
});

// ABIERTO (accesibilidad, medio) — «label in name» (WCAG 2.5.3, nivel A). Esperado: el nombre
// accesible contiene el texto visible. Obtenido: «← Anterior» se llama «Retroceder generación» y
// «Siguiente generación →», «Avanzar generación»: quien dicte «pulsa Siguiente generación» no llega.
test('ABIERTO — accesibilidad: el nombre de «Anterior» y «Siguiente generación» contiene su texto visible', async ({ page }) => {
  test.fail();
  await expect(siguiente(page)).toHaveAccessibleName(/Siguiente generación/, { timeout: 1000 });
  await siguiente(page).click();
  await expect(anterior(page)).toHaveAccessibleName(/Anterior/, { timeout: 1000 });
});

// ABIERTO (accesibilidad, medio, mismo hallazgo) — el cambio de generación es mudo. Esperado: la
// generación (y sus cifras) en una región viva. Obtenido: ni aria-live ni role="status" en la
// simulación; tras «Siguiente generación» el lector no dice nada.
test('ABIERTO — accesibilidad: el cambio de generación se anuncia en una región viva', async ({ page }) => {
  test.fail();
  await siguiente(page).click();
  // El anunciador de rutas de Next también lleva aria-live, pero no contiene la generación
  await expect(page.locator('[aria-live], [role="status"]').filter({ hasText: /Generación 2 de 5/ })).toHaveCount(1, {
    timeout: 1000,
  });
});

// ABIERTO (accesibilidad, bajo) — las 15 tarjetas que despliegan un detalle (4 pilares, 4 ejemplos
// y 7 datos) son conmutadores con aria-pressed. Esperado: aria-expanded, que es lo que hacen (el
// patrón de visualizador-ecosistema). Obtenido: el lector anuncia «pulsado / no pulsado».
test('ABIERTO — accesibilidad: las tarjetas desplegables usan aria-expanded, no aria-pressed', async ({ page }) => {
  test.fail();
  const casos: Array<[string, string]> = [
    ['El Mecanismo', 'Variación'],
    ['Ejemplos Clásicos', 'Polilla del abedul'],
    ['Datos Fascinantes', '20 años de miedo'],
  ];
  for (const [seccion, tarjeta] of casos) {
    await irA(page, seccion);
    const b = page.locator('button', { hasText: tarjeta }).first();
    await b.click();
    await expect(b).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 });
    await expect(b).not.toHaveAttribute('aria-pressed', /.*/, { timeout: 1000 });
  }
});

/** Peor contraste de los elementos del selector contra su fondo compuesto (alfa y degradados). */
async function contrasteMinimo(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const canal = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const [l1, l2] = [lum(a), lum(b)];
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const nums = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
    const colores = (s: string): number[][] => [...s.matchAll(/rgba?\([^)]*\)/g)].map((m) => nums(m[0]));
    const sobre = (base: number[], [r, g, b, a = 1]: number[]) => [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)];
    const els = [...document.querySelectorAll(sel)];
    if (!els.length) throw new Error(`no existe ${sel}`);
    let peor = Infinity;
    for (const el of els) {
      type Capa = { grad: number[][] } | { color: number[] };
      const capas: Capa[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        const grad = cs.backgroundImage !== 'none' ? colores(cs.backgroundImage) : [];
        const c = nums(cs.backgroundColor);
        const a = c.length === 4 ? c[3] : 1;
        if (grad.length) {
          capas.push({ grad });
          if (grad.every((g) => (g.length === 4 ? g[3] : 1) === 1)) break;
        }
        if (c.length && a > 0) {
          capas.push({ color: [c[0], c[1], c[2], a] });
          if (a === 1) break;
        }
      }
      let bases: number[][] = [[255, 255, 255]];
      for (const capa of capas.reverse()) {
        bases = 'grad' in capa ? capa.grad.flatMap((g) => bases.map((b) => sobre(b, g))) : bases.map((b) => sobre(b, capa.color));
      }
      const texto = nums(getComputedStyle(el).color).slice(0, 3);
      peor = Math.min(peor, ...bases.map((b) => ratio(texto, b)));
    }
    return Math.round(peor * 100) / 100;
  }, selector);
}

// ABIERTO (accesibilidad, bajo) — el número del pilar ACTIVO. Entrada: tema claro, pulsar
// «Variación». .pilarActivo pone `background:` con un degradado al 4 % que retira el blanco de la
// tarjeta, y el círculo del número añade rgba(46,134,171,0.1): #26718F sobre ≈ rgb(222,234,239).
// Esperado: 4,5:1 (texto de 11,5 px). Obtenido: 4,47:1. Receta de C0278: bajar el tinte, no el texto.
test('ABIERTO — contraste: el número del pilar activo llega a 4,5:1', async ({ page }) => {
  test.fail();
  await prepararParaMedir(page);
  await page.locator('button', { hasText: 'Variación' }).first().click();
  expect(await contrasteMinimo(page, 'div[class*="pilarNumero"]')).toBeGreaterThanOrEqual(4.5);
});

/** Texto de la página sin <script> ni <style> (la guía educativa está en el DOM aunque nazca plegada). */
const textoPagina = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('script, style').forEach((n) => n.remove());
    return copia.textContent ?? '';
  });

// ABIERTO (contenido, bajo) — los pinzones. Entrada: «Ejemplos Clásicos» → «Pico de los pinzones».
// Obtenido: «Darwin observó que cada isla tenía pinzones con picos diferentes». Es la leyenda que
// corrigió la historia de la ciencia (Sulloway, 1982, J. Hist. Biol. 15: 1-53): Darwin no etiquetó
// sus pinzones por isla, fue Gould quien los reconoció como pinzones en 1837, y en una misma isla
// conviven especies de picos distintos. Ninguna fuente de la red oficial lo trata (criterio C0203).
// Esperado: matizarlo o retirarlo.
test('ABIERTO — contenido: los pinzones no se atribuyen a una observación de Darwin isla por isla', async ({ page }) => {
  test.fail();
  await irA(page, 'Ejemplos Clásicos');
  const tarjeta = page.locator('button', { hasText: 'Pico de los pinzones' }).first();
  await tarjeta.click();
  await expect(tarjeta).not.toContainText('Darwin observó que cada isla tenía pinzones con picos diferentes', { timeout: 1000 });
});

// ABIERTO (contenido, bajo, mismo hallazgo) — «20 años de miedo». Entrada: «Datos Fascinantes» →
// «20 años de miedo». Obtenido: «Temía la controversia religiosa y social» como hecho; el «retraso
// de Darwin» por miedo es una interpretación discutida (van Wyhe, 2007, Notes Rec. R. Soc. 61:
// 177-205). Esperado: el motivo presentado como interpretación, o sin motivo.
test('ABIERTO — contenido: el «retraso» de Darwin no se da por miedo como hecho', async ({ page }) => {
  test.fail();
  await irA(page, 'Datos Fascinantes');
  const tarjeta = page.locator('button', { hasText: '20 años de miedo' }).first();
  await tarjeta.click();
  const t = (await tarjeta.textContent()) ?? '';
  expect(/miedo|Temía/.test(t) && !/debat|discut|historiador|interpret|se ha cuestionado|según/i.test(t)).toBe(false);
});

// ABIERTO (contenido, bajo) — el dodo. Entrada: «Datos Fascinantes» → «Sin miedo = extinción».
// Obtenido: «fue cazado hasta la extinción en menos de 100 años». La caza fue una causa; las
// especies que llegaron con los barcos (cerdos, macacos, ratas) y la pérdida de hábitat pesan
// tanto o más, y la tarjeta lo reduce a «sin miedo = extinción». Sin fuente en la red (C0203).
// Esperado: la causa matizada o retirada.
test('ABIERTO — contenido: el dodo no se da como «cazado hasta la extinción» sin más', async ({ page }) => {
  test.fail();
  await irA(page, 'Datos Fascinantes');
  const tarjeta = page.locator('button', { hasText: 'Sin miedo = extinción' }).first();
  await tarjeta.click();
  const t = (await tarjeta.textContent()) ?? '';
  expect(/cazado hasta la extinción/.test(t) && !/ratas|cerdos|macacos|introducid|llegaron con|hábitat/i.test(t)).toBe(false);
});

// ABIERTO (contenido, bajo) — la lactosa. Entrada: «Datos Fascinantes» → «Seguimos evolucionando»
// y la guía. Obtenido: «Los europeos la toleran por selección en poblaciones ganaderas» y «(común
// en europeos)». La persistencia de la lactasa varía mucho dentro de Europa y surgió también, por
// separado, en pueblos pastores de África oriental y Oriente Próximo; el marco solo europeo es el
// sesgo del §1.quinquies.5. Sin fuente en la red (EFSA redirige a Wiley, fuera de la lista).
// Esperado: «en algunas poblaciones con tradición ganadera» o similar.
test('ABIERTO — contenido: la tolerancia a la lactosa no se atribuye a «los europeos» en bloque', async ({ page }) => {
  test.fail();
  await irA(page, 'Datos Fascinantes');
  await page.locator('button', { hasText: 'Seguimos evolucionando' }).first().click();
  const texto = await textoPagina(page);
  expect(texto).toContain('lactosa');
  expect(texto).not.toMatch(/Los europeos la toleran|común en europeos/);
});
