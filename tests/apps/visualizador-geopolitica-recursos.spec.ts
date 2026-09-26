import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * visualizador-geopolitica-recursos — test de regresión del Inspector (PRIMERA inspección, 25/09/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Geopolítica de los Recursos» · sub «Petróleo, litio, tierras raras y más: quién los produce,
 * dónde están las reservas y por qué definen el poder del siglo XXI». No calcula nada: su verdad
 * comprobable son los DATOS (top 5 productores, mayores reservas, dependencia de la UE, proyección
 * de demanda «fuente: AIE») y la OPERATIVA (5 pestañas de recurso, 5 conflictos desplegables).
 *
 * POR QUÉ SE INSPECCIONÓ
 * ──────────────────────
 * Sospecha CON CASO de _private/inspector/SOSPECHAS.md (24/09/2026): «el Triángulo del Litio
 * representa el 60 % de las reservas mundiales» (page.tsx:185 y :451, FAQ metadata.ts:46), el
 * mismo dato que el hallazgo 1532 corrigió en visualizador-cadenas-suministro. SE SOSTIENE.
 *
 * FUENTES DE LOS VALORES ESPERADOS (consultadas el 25/09/2026, resueltos a mano ANTES de ejecutar)
 * ──────────────────────────────────────────────────────────────────────────────────────────────
 * · USGS, Mineral Commodity Summaries 2026 (febrero de 2026), capítulo LITHIUM
 *   https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-lithium.pdf — t de litio contenido:
 *     Reservas: Chile 9.200.000 · Australia 8.400.000 · China 4.600.000 · Argentina 4.400.000 ·
 *     EE. UU. 4.400.000 · mundo 37.000.000. Bolivia NO figura en la tabla de reservas.
 *       → Chile 24,9 % · Australia 22,7 % · China 12,4 %.
 *       → «Triángulo» (Chile + Argentina + Bolivia) = 13,6 / 37 = 36,8 % ≈ 37 %.
 *     Recursos medidos e indicados (~150 Mt): Argentina 28 · Bolivia 23 · Chile 13 Mt → 64/150 = 42,7 %.
 *     Producción 2025 (mundo 290.000 t sin EE. UU.): Australia 92.000 (31,7 %) · China 62.000
 *     (21,4 %) · Chile 56.000 (19,3 %) · Zimbabue 28.000 (9,7 %) · Argentina 23.000 (7,9 %).
 *   Y el ORIGEN de la lista de la app, MCS 2023 (mcs2023-lithium.pdf): «Identified lithium resources
 *   are distributed as follows: Bolivia, 21 million tons; Argentina, 20 million tons; Chile, 11
 *   million tons» (de 98 Mt). La app pone esos RECURSOS en «Mayores Reservas» como «21 % mundial».
 * · USGS MCS 2026, RARE EARTHS (mcs2026-rare-earths.pdf), t de óxidos:
 *     Producción 2025: China 270.000 · EE. UU. 51.000 · Australia 29.000 · Birmania 22.000 ·
 *     Tailandia 4.800 · Rusia 2.600 · mundo 390.000 → China 69,2 % · Rusia 0,7 %.
 *     Reservas: China 44 Mt · Brasil 11 Mt · Australia 6,3 Mt · Rusia 3,8 Mt · Vietnam 3,5 Mt ·
 *     mundo >75 Mt → Vietnam ≤ 4,7 %, quinto, no segundo.
 * · USGS MCS 2026, COPPER (mcs2026-copper.pdf), miles de t: producción minera 2025 Chile 5.300 ·
 *   Congo (Kinshasa) 3.200 · Perú 2.700 · China 1.800 · mundo 23.000 → la RD del Congo es la segunda.
 * · USGS MCS 2026, TANTALUM y COBALT: el tántalo (coltán) va a condensadores electrónicos; el
 *   cobalto es el de las baterías («lithium-ion batteries, the leading global use for cobalt»).
 * · EIA, FAQ «What countries are the top producers and consumers of oil?» (datos de 2023):
 *   EE. UU. 21,91 Mb/d = 22 % · Arabia Saudí 11 % · Rusia 11 % · Canadá 6 % · China 5 % · Irak 4 %.
 * · OPEP, Annual Statistical Bulletin 2025, tabla 3.1 (fin de 2024, millones de barriles):
 *   Oriente Medio 871.218 de 1.566.869 = 55,6 % (y eso SIN las arenas bituminosas de Canadá).
 * · AIE, Global Critical Minerals Outlook 2024, resumen ejecutivo, escenario NZE (el más exigente),
 *   de hoy a 2040: litio «by a factor of nine»; «Graphite demand almost quadruples by 2040 in the
 *   NZE Scenario, while demand for nickel, cobalt and rare earth elements doubled».
 * · Critical Raw Materials Act (Reglamento (UE) 2024/1252): JRC-RMIS, «34 CRMs for the EU, of which
 *   17 are identified as Strategic Raw Materials»; Comisión Europea, página de la CRMA, «2030
 *   Benchmarks»: extracción 10 %, transformación 40 %, reciclado 25 %.
 * · Contraste: WCAG 2.2, 1.4.3 (4,5:1 texto normal; 3:1 desde 24 px, o 18,66 px en negrita).
 * · Formato: CLAUDE.md global §2 («15 %» con espacio duro U+00A0, desde el 25/09/2026).
 *
 * Los casos que llevaban test.fail() afirmaban lo CORRECTO y fallaban por los hallazgos
 * 1916-1934 del acta del 25/09/2026. Reparados el 26/09/2026: se quitó la marca y se releyó
 * cada caso; los que consagraban el defecto o presuponían otra reparación llevan comentario.
 * Fuentes añadidas en la reparación: OPEP, ASB 2025, tablas 9.1 y 9.2 (gas, 2024); Eurostat
 * (dependencia 2023 y proveedores 2024); Comisión Europea, Study on the Critical Raw Materials
 * for the EU 2023 (dependencia de importaciones, media 2016-2020); Comisión Europea, REPowerEU
 * (gas ruso: 45 % en 2021, 12 % en 2025).
 */

const RUTA = '/visualizador-geopolitica-recursos/';
/** Espacio duro entre cifra y «%» (CLAUDE.md global §2). */
const NB = ' ';
const RECURSOS = ['Petróleo', 'Gas Natural', 'Litio', 'Tierras Raras', 'Cobre'] as const;
type NombreRecurso = (typeof RECURSOS)[number];

const MOVIL = {
  viewport: { width: 360, height: 740 },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

/** Selecciona un recurso y devuelve su panel. */
async function elegir(page: Page, recurso: NombreRecurso): Promise<Locator> {
  const pestana = page.getByRole('tab', { name: recurso, exact: true });
  await pestana.click();
  await expect(pestana).toHaveAttribute('aria-selected', 'true');
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByRole('heading', { level: 3 })).toHaveText(recurso);
  return panel;
}

/** Los productores del panel como [país, porcentaje]. */
async function productores(panel: Locator): Promise<[string, number][]> {
  const filas = await panel.locator('[class*="barraLabel"]').evaluateAll((els) =>
    els.map((el) => Array.from(el.querySelectorAll('span')).map((s) => (s.textContent ?? '').trim())),
  );
  return filas.map(([pais, pct]) => [pais, Number(pct.replace(/[^\d,]/g, '').replace(',', '.'))]);
}

async function reservas(panel: Locator): Promise<string[]> {
  return (await panel.locator('[class*="reservasList"] li').allInnerTexts()).map((t) => t.trim());
}

/** Despliega un conflicto y devuelve el texto de su cuerpo. */
async function abrirConflicto(page: Page, titulo: RegExp): Promise<Locator> {
  const boton = page.getByRole('button', { name: titulo });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-expanded', 'true');
  const id = await boton.getAttribute('aria-controls');
  const cuerpo = page.locator(`[id="${id}"]`);
  await expect(cuerpo).toBeVisible();
  return cuerpo;
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
}

/** Las preguntas del FAQPage del JSON-LD, como {pregunta: respuesta}. */
async function faq(page: Page): Promise<Record<string, string>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (j['@type'] === 'FAQPage' && j.mainEntity) {
      return Object.fromEntries(j.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]));
    }
  }
  throw new Error('No hay FAQPage en el JSON-LD');
}

/** Los datos del gráfico de Chart.js, leídos de las props de React del <Bar>. */
async function datosGrafico(page: Page): Promise<{ etiquetas: string[]; series: { label: string; data: number[] }[] }> {
  return page.locator('canvas').first().evaluate((canvas) => {
    const clave = Object.keys(canvas).find((k) => k.startsWith('__reactFiber$'));
    if (!clave) throw new Error('El canvas no tiene fibra de React');
    type Fibra = { memoizedProps?: { data?: { labels: string[]; datasets: { label: string; data: number[] }[] } }; return: Fibra | null };
    for (let f: Fibra | null = (canvas as unknown as Record<string, Fibra>)[clave]; f; f = f.return) {
      const d = f.memoizedProps?.data;
      if (d?.datasets) return { etiquetas: d.labels, series: d.datasets.map((s) => ({ label: s.label, data: s.data })) };
    }
    throw new Error('No se encontraron las props «data» del gráfico');
  });
}

/**
 * El PEOR contraste de los elementos visibles que casan con el selector. Compone los fondos
 * semitransparentes de los ancestros y, si hay un degradado, mide contra CADA parada: el
 * texto tiene que leerse en todo el recorrido.
 */
async function peorContraste(page: Page, selector: string): Promise<{ ratio: number; texto: string } | null> {
  return page.evaluate((sel) => {
    const parse = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map((x) => parseFloat(x));
      return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]];
    };
    const lum = (c: number[]): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const mezclar = (arriba: number[], abajo: number[]): number[] => {
      const a = arriba[3];
      return [0, 1, 2].map((i) => arriba[i] * a + abajo[i] * (1 - a)).concat(1);
    };
    /** Todas las combinaciones de fondo posibles (una por parada de cada degradado). */
    const fondos = (el: Element): number[][] => {
      const capas: number[][][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.backgroundImage.includes('gradient')) {
          const paradas = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []).map(parse);
          capas.push(paradas);
          if (paradas.every((p) => p[3] >= 1)) break;
          continue;
        }
        const c = parse(cs.backgroundColor);
        if (c[3] > 0) {
          capas.push([c]);
          if (c[3] >= 1) break;
        }
      }
      let res: number[][] = [[255, 255, 255, 1]];
      for (let i = capas.length - 1; i >= 0; i--) res = capas[i].flatMap((p) => res.map((r) => mezclar(p, r)));
      return res;
    };
    let peor: { ratio: number; texto: string } | null = null;
    for (const el of Array.from(document.querySelectorAll(sel))) {
      if (!el.getClientRects().length) continue;
      const c = parse(getComputedStyle(el).color);
      for (const bg of fondos(el)) {
        const texto = mezclar(c, bg);
        const l1 = lum(texto);
        const l2 = lum(bg);
        const ratio = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
        if (!peor || ratio < peor.ratio) peor = { ratio, texto: (el.textContent ?? '').trim().slice(0, 40) };
      }
    }
    return peor;
  }, selector);
}

// ════════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — elegir un recurso muestra su ficha completa
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 1 · elegir un recurso muestra su ficha', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('arranca en Petróleo y cada pestaña muestra 5 productores, 3 reservas y 3 usos', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Petróleo', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab')).toContainText([...RECURSOS]);
    await expect(page.getByRole('tab')).toHaveCount(RECURSOS.length);
    for (const r of RECURSOS) {
      const panel = await elegir(page, r);
      expect(await productores(panel)).toHaveLength(5);
      expect(await reservas(panel)).toHaveLength(3);
      await expect(panel.locator('[class*="usosList"] li')).toHaveCount(3);
      // Solo una pestaña seleccionada a la vez
      await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);
    }
  });

  // Reescrito al reparar el hallazgo 1933: «Criticidad UE: Crítico» era un juicio propio que
  // contradecía el «Riesgo: Medio» de la tabla. La insignia dice ahora lo que dice la ley
  // (Reglamento (UE) 2024/1252, anexo I: el litio para baterías es materia prima estratégica).
  test('Litio: estratégica según la CRMA y productores ordenados de mayor a menor', async ({ page }) => {
    const panel = await elegir(page, 'Litio');
    await expect(panel.locator('[class*="criticidadBadge"]')).toHaveText(
      'Ley europea de materias primas críticas: materia prima estratégica (litio para baterías)',
    );
    // Los productores salen ordenados de mayor a menor
    const p = await productores(panel);
    const cifras = p.map(([, v]) => v);
    expect([...cifras].sort((a, b) => b - a)).toEqual(cifras);
  });

  // Reescrito en la reparación del 26/09/2026: el caso original consagraba las cifras del BP
  // Statistical Review 2021 (fin de 2020), sin año en pantalla y con el «%» pegado. Ahora la app
  // usa la serie más reciente de reservas probadas, la de la OPEP (ASB 2025, tabla 3.1, fin de
  // 2024: Venezuela 303.221, Arabia Saudí 267.200, Irán 208.600 de 1.566.869 millones de
  // barriles), que excluye las arenas bituminosas; la nota de fuente lo dice y remite a BP.
  test('las reservas de petróleo coinciden con la OPEP (ASB 2025, fin de 2024) y citan la fuente', async ({ page }) => {
    const panel = await elegir(page, 'Petróleo');
    expect(await reservas(panel)).toEqual([`Venezuela: 19,4${NB}%`, `Arabia Saudí: 17,1${NB}%`, `Irán: 13,3${NB}%`]);
    await expect(panel).toContainText('OPEP, Annual Statistical Bulletin 2025');
    await expect(panel).toContainText('arenas bituminosas');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — último elemento, acordeón y móvil de 360 px
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 2 · límites de la operativa', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('el último recurso (Cobre) abre su panel con el id que anuncia su pestaña', async ({ page }) => {
    const pestana = page.getByRole('tab', { name: 'Cobre', exact: true });
    await elegir(page, 'Cobre');
    const id = await pestana.getAttribute('aria-controls');
    await expect(page.locator(`[id="${id}"]`)).toHaveAttribute('role', 'tabpanel');
  });

  test('los conflictos se abren y cierran de uno en uno; el último también', async ({ page }) => {
    const golfo = page.getByRole('button', { name: /Guerra del Golfo/ });
    const litio = page.getByRole('button', { name: /Diplomacia del Litio/ });
    await abrirConflicto(page, /Guerra del Golfo/);
    await abrirConflicto(page, /Diplomacia del Litio/);
    // Abrir el quinto cierra el primero: acordeón exclusivo
    await expect(golfo).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[id^="conflicto-body-"]')).toHaveCount(1);
    await litio.click();
    await expect(litio).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[id^="conflicto-body-"]')).toHaveCount(0);
  });

  test.describe('móvil de 360 px', () => {
    test.use({ ...MOVIL });

    test('sin desbordamiento horizontal y con las 5 pestañas a la vista', async ({ page }) => {
      const anchos = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(anchos.sw).toBeLessThanOrEqual(anchos.cw);
      for (const r of RECURSOS) await expect(page.getByRole('tab', { name: r, exact: true })).toBeVisible();
    });

    // HALLAZGO 1926 [medio] (reparado el 26/09/2026): por debajo de 580 px el CSS ocultaba las
    // columnas «Importación UE» y «Principal proveedor». Ahora cada fila se apila como ficha.
    // La cifra ya no es el «98%» de la Comisión de 2020: su estudio de 2023 da una dependencia de
    // importaciones del 100 % en tierras raras ligeras y pesadas.
    test('la tabla de dependencia enseña el porcentaje importado y el proveedor', async ({ page }) => {
      const fila = page.locator('[class*="gridDependenciaFila"]').filter({ hasText: 'Tierras Raras' });
      await expect(fila.getByText(`100${NB}%`)).toBeVisible();
      await expect(fila.getByText('China', { exact: true })).toBeVisible();
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CASO 3 (no debe ocurrir) — datos que contradicen la fuente oficial
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 3 · el Triángulo del Litio (sospecha con caso, hallazgo 1532 de cadenas-suministro)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // HALLAZGO [alto] (Inspector 25/09/2026, reparado el 26/09/2026). USGS MCS 2026: 36,8 %.
  test('la tarjeta «Diplomacia del Litio» no atribuye al Triángulo el 60 % de las reservas', async ({ page }) => {
    const cuerpo = await abrirConflicto(page, /Diplomacia del Litio/);
    await expect(cuerpo).not.toContainText(/60\s?%/);
    await expect(cuerpo).toContainText(/37\s?%/);
  });

  // HALLAZGO [alto] (mismo hallazgo, segundo sitio: page.tsx:451, «más del 60%»).
  test('la guía educativa no dice que el Triángulo tenga más del 60 % de las reservas', async ({ page }) => {
    await abrirGuia(page);
    const parrafo = page.locator('h4', { hasText: 'Triángulo del Litio' }).locator('xpath=following-sibling::p[1]');
    await expect(parrafo).not.toContainText(/60\s?%/);
  });

  // HALLAZGO [alto] (mismo hallazgo, tercer sitio: la FAQ del JSON-LD, metadata.ts:46).
  test('la FAQ del JSON-LD no dice que el Triángulo tenga el 60 % de las reservas', async ({ page }) => {
    const respuestas = await faq(page);
    expect(respuestas['¿Por qué es tan importante el litio en la geopolítica actual?']).not.toMatch(/60\s?%/);
  });

  // HALLAZGO [alto] (Inspector 25/09/2026, reparado el 26/09/2026): «Mayores Reservas» del litio
  // son los RECURSOS de Bolivia, Argentina y Chile del MCS 2023 (21, 20 y 11 Mt) puestos como
  // «% mundial». USGS MCS 2026: reservas Chile 24,9 %, Australia 22,7 %, China 12,4 %; Bolivia 0.
  test('las mayores reservas de litio son Chile, Australia y China, y Bolivia no figura', async ({ page }) => {
    const panel = await elegir(page, 'Litio');
    const lista = await reservas(panel);
    expect(lista.join(' | ')).not.toContain('Bolivia');
    expect(lista[0]).toMatch(/^Chile/);
    expect(lista[1]).toMatch(/^Australia/);
  });
});

test.describe('Caso 3 · otras cifras de producción y reservas frente a su fuente', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // HALLAZGO [medio] (reparado el 26/09/2026): top 5 de litio de ~2022. USGS MCS 2026 (2025): Australia 31,7 %,
  // China 21,4 %, Chile 19,3 %, Zimbabue 9,7 %, Argentina 7,9 %. Zimbabue, cuarto, no aparece.
  test('Litio: Zimbabue está entre los 5 primeros productores y China es segunda', async ({ page }) => {
    const p = await productores(await elegir(page, 'Litio'));
    expect(p.map(([pais]) => pais)).toContain('Zimbabue');
    expect(p[1][0]).toBe('China');
  });

  // HALLAZGO [medio] (reparado el 26/09/2026): tierras raras. USGS MCS 2026 (2025): China 69,2 %, Rusia 0,7 %
  // (2.600 de 390.000 t; fuera del top 5, que cierra Tailandia con 4.800 t).
  test('Tierras raras: China produce ~69 % y Rusia no llega al 1 %', async ({ page }) => {
    const p = new Map(await productores(await elegir(page, 'Tierras Raras')));
    expect(p.get('China')).toBeGreaterThanOrEqual(68);
    expect(p.get('Rusia') ?? 0).toBeLessThan(1);
  });

  // HALLAZGO [medio] (reparado el 26/09/2026): reservas de tierras raras. USGS MCS 2026: China 44 Mt, Brasil
  // 11 Mt, Australia 6,3 Mt… Vietnam 3,5 Mt de >75 Mt (≤ 4,7 %), no el 18 % ni el segundo puesto.
  test('Tierras raras: Vietnam no es la segunda reserva mundial con el 18 %', async ({ page }) => {
    const lista = await reservas(await elegir(page, 'Tierras Raras'));
    expect(lista.join(' | ')).not.toContain('Vietnam (18%)');
    expect(lista[1]).toMatch(/^Brasil/);
  });

  // HALLAZGO [medio] (reparado el 26/09/2026): petróleo. EIA (2023): EE. UU. 22 % de la producción mundial.
  test('Petróleo: EE. UU. produce en torno al 22 %, no el 14 %', async ({ page }) => {
    const p = new Map(await productores(await elegir(page, 'Petróleo')));
    // «EEUU» pasó a «EE. UU.» (abreviatura de la RAE) en la misma reparación.
    expect(p.get('EE. UU.')).toBeGreaterThanOrEqual(20);
    await expect(page.getByRole('tabpanel')).toContainText('EIA (EE. UU.), datos de 2023');
  });

  // HALLAZGO [bajo] (reparado el 26/09/2026): cobre. USGS MCS 2026 (2025): la RD del Congo (3.200 kt, 13,9 %)
  // es la segunda, por delante de Perú (2.700 kt, 11,7 %); Chile 23 %, no 27 %.
  test('Cobre: la RD del Congo es el segundo productor', async ({ page }) => {
    const p = await productores(await elegir(page, 'Cobre'));
    expect(p[1][0]).toMatch(/Congo/);
  });

  // HALLAZGO [bajo] (reparado el 26/09/2026): el Golfo «alberga más del 60 %» de las reservas probadas.
  // OPEP, ASB 2025: Oriente Medio 871.218 de 1.566.869 millones de barriles = 55,6 %.
  test('Guerra del Golfo: no afirma que el Golfo tenga hoy más del 60 % de las reservas', async ({ page }) => {
    const cuerpo = await abrirConflicto(page, /Guerra del Golfo/);
    await expect(cuerpo).not.toContainText(/más del 60\s?%/);
  });

  // HALLAZGO [medio] (reparado el 26/09/2026): el título habla de coltán (tántalo, condensadores) y el texto
  // de cobalto (baterías). USGS MCS 2026, capítulos TANTALUM y COBALT.
  test('el conflicto del Congo no llama «coltán de las baterías» al cobalto', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Congo/ })).not.toContainText('coltán de las baterías');
  });

  // HALLAZGO [medio] (reparado el 26/09/2026): el gráfico «fuente: AIE» multiplica por 2-4 lo que da la AIE.
  // GCMO 2024, NZE (el escenario más alto), hoy → 2040: grafito ≈ ×4; níquel, cobalto y tierras
  // raras ×2. La app: grafito ×8, níquel ×5, cobalto ×4, tierras raras ×6.
  test('el gráfico de demanda 2040 no supera lo que proyecta la AIE en su escenario NZE', async ({ page }) => {
    const { etiquetas, series } = await datosGrafico(page);
    const s2040 = series.find((s) => s.label.includes('2040'));
    expect(s2040).toBeDefined();
    const valor = (m: string): number => s2040!.data[etiquetas.indexOf(m)];
    expect(valor('Grafito')).toBeLessThanOrEqual(4);
    expect(valor('Níquel')).toBeLessThanOrEqual(2.5);
    expect(valor('Cobalto')).toBeLessThanOrEqual(2.5);
    expect(valor('Tierras Raras')).toBeLessThanOrEqual(2.5);
  });

  // HALLAZGO [medio] (reparado el 26/09/2026): la CRMA fija 34 materias primas FUNDAMENTALES, de las que 17
  // son estratégicas (JRC-RMIS), y el reciclado de referencia es el 25 %, no el 15 % (Comisión).
  test('la guía describe bien la Ley de Materias Primas Críticas', async ({ page }) => {
    await abrirGuia(page);
    const texto = page.locator('h4', { hasText: 'Materias Primas Críticas' }).locator('xpath=following-sibling::p[1]');
    await expect(texto).toBeVisible();
    await expect(texto).not.toContainText('34 materias primas estratégicas');
    await expect(texto).toContainText(/25\s?%\s+del reciclado/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Accesibilidad, contraste y formato
// ════════════════════════════════════════════════════════════════════════════
test.describe('Accesibilidad y formato', () => {
  // HALLAZGO [medio] (reparado el 26/09/2026): los botones de conflicto no fijan fondo ni color y se quedan con
  // el gris por defecto del navegador. En oscuro (color-scheme: dark, que pone el conmutador de
  // tema) ese gris es rgb(107,107,107) y el título va en #e8e8e8: 2,71:1. En claro es rgb(240,
  // 240,240) con borde «outset»: se lee, pero no es el diseño de la tarjeta.
  test('en tema oscuro los títulos de los conflictos se leen (≥ 4,5:1)', async ({ page }) => {
    await page.goto(RUTA);
    await activarTema(page, 'dark');
    const c = await peorContraste(page, '[class*="conflictoTitulo"]');
    expect(c?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
  });

  // HALLAZGO [medio] (reparado el 26/09/2026): texto pequeño bajo 4,5:1 en claro. Cabecera de la tabla blanca
  // sobre el degradado primary→secondary 2,80-4,11:1 (2,23-2,79:1 en oscuro); semáforo naranja
  // 2,86:1; verde 3,32:1; rojo 3,95:1; badge de criticidad 2,86:1 («Alto») y 3,95:1 («Crítico»);
  // % importado 3,93:1; pestaña activa 3,62:1.
  // Tras la reparación se mide también el tema oscuro (el acta midió el claro y, en la cabecera,
  // el oscuro), y la insignia en sus DOS variantes: Petróleo («no figura») y Litio («estratégica»).
  for (const tema of ['light', 'dark'] as const) {
    test(`el texto pequeño de la app cumple 4,5:1 en tema ${tema === 'light' ? 'claro' : 'oscuro'}`, async ({ page }) => {
      await page.goto(RUTA);
      // Sin transiciones: las pestañas y las filas animan el fondo y se mediría a mitad de camino
      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
      await activarTema(page, tema);
      const selectores = [
        '[class*="gridDependenciaHeader"] > span',
        // Los semáforos «Riesgo» se sustituyeron por el estatus en la CRMA (hallazgo 1933)
        '[class*="crmaEstrategica"]',
        '[class*="crmaNoFigura"]',
        '[class*="criticidadBadge"]',
        '[class*="gridDependenciaFila"] [class*="porcentaje"]',
        '[role="tab"][aria-selected="true"]',
        '[class*="fuente"]',
      ];
      const fallos: string[] = [];
      for (const sel of selectores) {
        const c = await peorContraste(page, sel);
        if (c && c.ratio < 4.5) fallos.push(`${sel} «${c.texto}» ${c.ratio}`);
      }
      await elegir(page, 'Litio');
      for (const sel of ['[class*="criticidadBadge"]', '[role="tab"][aria-selected="true"]']) {
        const c = await peorContraste(page, sel);
        if (c && c.ratio < 4.5) fallos.push(`Litio ${sel} «${c.texto}» ${c.ratio}`);
      }
      expect(fallos).toEqual([]);
    });
  }

  test.describe('estructura accesible', () => {
    test.beforeEach(async ({ page }) => {
      await abrir(page);
    });

    // HALLAZGO [bajo] (reparado el 26/09/2026): cinco role="progressbar" sin nombre accesible (axe:
    // aria-progressbar-name); además, una cuota de mercado no es una barra de progreso.
    // Reparado: una cuota no es una barra de progreso y la cifra ya está en la etiqueta de texto,
    // así que la barra pasa a ser su dibujo, oculto a la tecnología de apoyo (aria-hidden).
    test('las barras de productores tienen nombre accesible', async ({ page }) => {
      const sinNombre = await page.locator('[role="progressbar"]').evaluateAll((els) =>
        els.filter((e) => !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).length,
      );
      expect(sinNombre).toBe(0);
      const barras = page.locator('[class*="barraHorizontal"]');
      await expect(barras).toHaveCount(5);
      for (const b of await barras.all()) await expect(b).toHaveAttribute('aria-hidden', 'true');
    });

    // HALLAZGO [medio] (reparado el 26/09/2026): el gráfico de demanda es un <canvas role="img"> sin texto
    // alternativo (axe: role-img-alt); sus seis multiplicadores no existen fuera del lienzo.
    test('el gráfico de demanda tiene alternativa textual', async ({ page }) => {
      const canvas = page.locator('canvas').first();
      const nombre = (await canvas.getAttribute('aria-label')) ?? (await canvas.textContent()) ?? '';
      expect(nombre.trim().length).toBeGreaterThan(0);
      // Reparado con aria-label y con una tabla de datos equivalente, visible
      expect(nombre).toContain('Litio: se multiplica por nueve');
      const tabla = page.getByRole('table', { name: /Datos del gráfico/ });
      await expect(tabla.getByRole('row')).toHaveCount(6);
      await expect(tabla.getByRole('row', { name: /Grafito/ })).toContainText('Casi se cuadruplica');
    });

    // HALLAZGO [bajo] (reparado el 26/09/2026): la barra de China (60 %) lleva width:120 % y el recorte la
    // deja llena: la escala es ×2, así que el carril entero vale 50 %.
    // Reescrito al repararlo: las barras dejaron de ser role="progressbar" (hallazgo 1930), así
    // que se localizan por su clase; si no, el caso pasaría midiendo cero barras. Se exige además
    // proporción: China, 69,2 %, ocupa ≈ 69 % del carril (antes la escala era ×2).
    test('ninguna barra de productor se sale de su carril', async ({ page }) => {
      await page.addStyleTag({ content: '* { transition: none !important; }' });
      await elegir(page, 'Tierras Raras');
      const barras = page.locator('[class*="barraHorizontal"]');
      await expect(barras).toHaveCount(5);
      const proporciones = await barras.evaluateAll((els) =>
        els.map((e) => (e.firstElementChild as HTMLElement).getBoundingClientRect().width / e.getBoundingClientRect().width),
      );
      for (const r of proporciones) expect(r).toBeLessThanOrEqual(1.001);
      expect(proporciones[0]).toBeCloseTo(0.692, 2);
    });

    // HALLAZGO [bajo] (reparado el 26/09/2026): «%» pegado a la cifra (CLAUDE.md §2: espacio duro U+00A0),
    // «DRC» (sigla inglesa; en español RD del Congo) y «2000s» (calco del inglés).
    // La cifra del caso era el 47 % de Australia, que era el dato desfasado (hallazgo 1918): el
    // USGS MCS 2026 da 31,7 %. Se añade que ninguna cifra del cuerpo lleve el «%» pegado.
    test('formato español: «31,7 %» con espacio duro, sin «DRC» ni «2000s»', async ({ page }) => {
      const litio = await elegir(page, 'Litio');
      await expect(litio).toContainText(`31,7${NB}%`);
      expect(await page.locator('body').innerText()).not.toMatch(/\d%/);
      const cuerpo = await page.locator('body').innerText();
      expect(cuerpo).not.toMatch(/\bDRC\b/);
      expect(cuerpo).not.toContain('2000s');
    });
  });
});
