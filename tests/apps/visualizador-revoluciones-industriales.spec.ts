import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarPaginaAsentada, esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * visualizador-revoluciones-industriales — test de regresión del Inspector (PRIMERA inspección, 20/11/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Revoluciones Industriales» · sub «De la máquina de vapor a la IA y la Industria 4.0 —
 * cronología interactiva de 13 fases que transformaron la economía mundial». No calcula nada: su
 * verdad comprobable es la OPERATIVA de sus cuatro pestañas (Línea del Tiempo, Fase en Detalle,
 * Comparativa con filtro por era y buscador, Contexto Histórico por eras) y la COHERENCIA de sus
 * datos: la misma fecha, era o país no puede decir dos cosas en dos sitios.
 *
 * DE DÓNDE SALEN LOS ESPERADOS (resueltos a mano ANTES de abrir la app)
 * ────────────────────────────────────────────────────────────────────
 * · El array MOVIMIENTOS de page.tsx (13 fases): nombre, años, era (ETIQUETAS_ERA), países e hito.
 *   El orden de la pestaña Fase en Detalle y de la Comparativa es el del array.
 * · Línea del tiempo: anoAX(año) = 40 + (año − 1400) / 630 × 1040. Las fases en curso se pintan
 *   hasta 2030, así que Industria 4.0 (2011) mide 31,4 px, Energías Renovables (2000) 49,5 px e IA
 *   e Industria (2020) 16,5 px, y el rótulo solo se pinta si la barra pasa de 60 px.
 * · Contexto: una fase sale en una era si empieza antes de que acabe la era y acaba después de que
 *   empiece (`anioInicio < hasta && anioFin > desde`). 1ª Revolución (1760-1870) → Primera
 *   Revolución Industrial y Era del Ferrocarril; hitos 1769, 1793 y 1825.
 * · Coherencia: las fechas de cada revolución en la ficha, la tabla de la guía y el FAQPage
 *   (1760-1840, 1870-1914, 1945-2000, Industria 4.0 desde 2011) son las que debe repetir la vista
 *   por eras.
 * · Hechos de consenso: Stockton–Darlington, 27/09/1825; Pearl Street (Nueva York) abrió el
 *   04/09/1882, después de la central de Edison en Holborn Viaduct (Londres, 1882) y del alumbrado
 *   público de Godalming (1881): fue la primera central comercial de EE. UU., no «la primera
 *   central eléctrica». La desmotadora de Whitney (1793) disparó el cultivo esclavista de algodón
 *   en el sur de EE. UU. (CLAUDE.md del proyecto, §1.quinquies, n.º 8: contexto colonial omitido).
 * · Ortografía: «dactilógrafo» y «telegráfico» (esdrújula); «15 %» con espacio duro (CLAUDE.md
 *   global §2, desde el 25/09/2026).
 * · Contraste: WCAG 2.2, 1.4.3 — 4,5:1 texto normal; 3:1 desde 24 px, o 18,66 px en negrita.
 * · JSON-LD: CLAUDE.md del proyecto §1.ter, `features` con 4-8 características reales.
 * · Patrón ARIA de pestañas (WAI-ARIA APG, «Tabs»): las flechas mueven entre pestañas y el panel
 *   se nombra por la suya.
 *
 * Los casos 1-3 afirman lo que la app hace bien. Los marcados con test.fail() afirman lo CORRECTO
 * y hoy fallan por un hallazgo: cuando se repare, Playwright avisará para quitarles la marca.
 */

const RUTA = '/visualizador-revoluciones-industriales/';
const SVG = 'svg[aria-label="Línea del tiempo de las revoluciones industriales"]';

/** Las 13 fases en el orden del array (pestaña Fase en Detalle y Comparativa). */
const FASES = [
  'Manufactura Preindustrial',
  'Primera Revolución Industrial',
  'Era del Ferrocarril',
  'Segunda Revolución Industrial',
  'Producción en Serie — Fordismo',
  'Industria Petroquímica y Plásticos',
  'Tercera Revolución Industrial',
  'Automatización Robótica',
  'Revolución Digital',
  'Globalización Industrial',
  'Industria 4.0',
  'IA e Industria',
  'Energías Renovables',
] as const;

const ERAS_FILTRO = ['Preindustrial', '1ª Revolución', '2ª Revolución', '3ª Revolución', 'Industria 4.0', 'Industria 5.0'] as const;

async function abrir(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

/** Sin transiciones: el botón activo cambia de color en 0,18 s y medir a mitad daría otra cifra. */
async function sinTransiciones(page: Page): Promise<void> {
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
}

async function pestana(page: Page, nombre: string): Promise<void> {
  const tab = page.getByRole('tab', { name: nombre, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
}

interface Ficha {
  nombre: string;
  periodo: string;
  era: string;
  descripcion: string;
  paises: string[];
  hito: string;
  contador: string;
}

/** La ficha visible en el panel (Fase en Detalle, o la que abre una barra de la línea del tiempo). */
async function leerFicha(page: Page): Promise<Ficha> {
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 3 })).toHaveCount(1);
  return page.getByRole('tabpanel').evaluate((panel) => {
    const t = (e: Element | null | undefined): string => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const h3 = panel.querySelector('h3') as HTMLElement;
    const cab = h3.parentElement as HTMLElement;
    const periodo = cab.querySelector(':scope > p');
    const h4 = Array.from(panel.querySelectorAll('h4')).find((h) => t(h) === 'Países líderes');
    const etiquetaHito = Array.from(panel.querySelectorAll('span')).find((s) => t(s) === 'Hito icónico');
    const parrafos = Array.from(panel.querySelectorAll('p')).filter((p) => p !== periodo && t(p).length > 80);
    return {
      nombre: t(h3),
      periodo: t(periodo),
      era: t(cab.querySelector(':scope > span')),
      descripcion: t(parrafos[0]),
      paises: Array.from(h4?.nextElementSibling?.querySelectorAll('span') ?? []).map((s) => t(s)),
      hito: t(etiquetaHito?.nextElementSibling),
      contador: Array.from(panel.querySelectorAll('span')).map((s) => t(s)).find((x) => /^\d+ \/ \d+$/.test(x)) ?? '',
    };
  });
}

/** Recorre las 13 fichas con «Siguiente» desde la primera. */
async function todasLasFichas(page: Page): Promise<Ficha[]> {
  await pestana(page, 'Fase en Detalle');
  const fichas: Ficha[] = [];
  for (let i = 0; i < FASES.length; i++) {
    await expect(page.getByText(`${i + 1} / ${FASES.length}`, { exact: true })).toBeVisible();
    fichas.push(await leerFicha(page));
    if (i < FASES.length - 1) await page.getByRole('button', { name: 'Fase siguiente' }).click();
  }
  return fichas;
}

async function filasComparativa(page: Page): Promise<string[][]> {
  return page.getByRole('tabpanel').locator('tbody tr').evaluateAll((trs) =>
    trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent ?? '').trim())),
  );
}

interface EraContexto {
  nombre: string;
  rango: string;
  fases: string[];
  eventos: string[];
}

async function erasDelContexto(page: Page): Promise<EraContexto[]> {
  await pestana(page, 'Contexto Histórico');
  return page.getByRole('tabpanel').locator('h3').evaluateAll((hs) =>
    hs.map((h3) => {
      const t = (e: Element | null | undefined): string => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
      // h3 → bloque del título → cabecera de la era → tarjeta de la era
      const tarjeta = h3.parentElement?.parentElement?.parentElement as HTMLElement;
      return {
        nombre: t(h3),
        rango: t(h3.nextElementSibling),
        fases: Array.from(tarjeta.querySelectorAll('span[style]')).map((s) => t(s)),
        eventos: Array.from(tarjeta.querySelectorAll('li')).map((li) => t(li)),
      };
    }),
  );
}

const barras = (page: Page): Locator => page.locator(`${SVG} g:has(rect)`);
const barra = (page: Page, rotulo: RegExp): Locator => barras(page).filter({ hasText: rotulo });

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
  await expect(page.locator('[data-guia-educativa]').getByText('Preguntas frecuentes', { exact: true })).toBeVisible();
}

/** Texto de la guía educativa (el contenedor de <EducationalSection>, montado siempre). */
async function textoGuia(page: Page): Promise<string> {
  return page.locator('[data-guia-educativa]').innerText();
}

async function bloquesLd(page: Page): Promise<Record<string, unknown>[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as Record<string, unknown>);
}

async function faqPage(page: Page): Promise<Record<string, string>> {
  for (const b of await bloquesLd(page)) {
    if (b['@type'] === 'FAQPage') {
      const preguntas = b.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
      return Object.fromEntries(preguntas.map((q) => [q.name, q.acceptedAnswer.text]));
    }
  }
  throw new Error('No hay FAQPage en el JSON-LD');
}

interface Medida {
  texto: string;
  ratio: number;
  minimo: number;
}

/**
 * Contraste WCAG del texto de cada elemento: su color (con la opacidad heredada) contra los fondos
 * compuestos hacia arriba. Mínimo 3:1 si es texto grande (≥ 24 px, o ≥ 18,66 px en negrita).
 */
async function contrastes(loc: Locator): Promise<Medida[]> {
  return loc.evaluateAll((els) => {
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
    const mezclar = (a: number[], b: number[]): number[] => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
    const fondo = (el: Element): number[] => {
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) {
          capas.push(c);
          if (c[3] >= 1) break;
        }
      }
      let r = [255, 255, 255, 1];
      for (let i = capas.length - 1; i >= 0; i--) r = mezclar(capas[i], r);
      return r;
    };
    return els.map((el) => {
      let op = 1;
      for (let x: Element | null = el; x; x = x.parentElement) op *= parseFloat(getComputedStyle(x).opacity);
      const bg = fondo(el);
      const cs = getComputedStyle(el);
      const c = parse(cs.color);
      const tx = mezclar([c[0], c[1], c[2], c[3] * op], bg);
      const l1 = lum(tx);
      const l2 = lum(bg);
      const px = parseFloat(cs.fontSize);
      const grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      return {
        texto: (el.textContent ?? '').trim().slice(0, 40),
        ratio: Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100,
        minimo: grande ? 3 : 4.5,
      };
    });
  });
}

const suspensos = (ms: Medida[], donde: string): string[] =>
  ms.filter((m) => m.ratio < m.minimo).map((m) => `${donde} · ${m.texto} ${m.ratio}:1 (mín. ${m.minimo})`);

// ════════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — cada control enseña lo que promete
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 1 · cada pestaña muestra los datos de la fase elegida', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('Fase en Detalle: «Era del Ferrocarril» enseña sus datos y es el único botón pulsado', async ({ page }) => {
    await pestana(page, 'Fase en Detalle');
    const boton = page.getByRole('button', { name: 'Era del Ferrocarril', exact: true });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    // Un solo botón de fase pulsado (el resto, false)
    await expect(page.getByRole('tabpanel').locator('button[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Manufactura Preindustrial', exact: true })).toHaveAttribute('aria-pressed', 'false');
    // MOVIMIENTOS[2]: Stockton–Darlington, 27/09/1825
    expect(await leerFicha(page)).toEqual({
      nombre: 'Era del Ferrocarril',
      periodo: '1825 – 1900',
      era: '1ª Revolución',
      descripcion:
        'El ferrocarril Stockton–Darlington (1825) inaugura el transporte masivo de personas y mercancías. En 1870 hay 210.000 km de vías en el mundo. El ferrocarril unifica naciones y mercados.',
      paises: ['Reino Unido', 'EE.UU.', 'Europa'],
      hito: 'Ferrocarril Stockton–Darlington (1825)',
      contador: '3 / 13',
    });
  });

  test('Línea del tiempo: la barra de la Segunda Revolución abre su ficha (1870 – 1914) y un segundo clic la cierra', async ({ page }) => {
    // 13 barras, una por fase
    await expect(barras(page)).toHaveCount(13);
    const segunda = barra(page, /^Segunda/);
    await segunda.click();
    const f = await leerFicha(page);
    expect([f.nombre, f.periodo, f.era]).toEqual(['Segunda Revolución Industrial', '1870 – 1914', '2ª Revolución']);
    expect(f.paises).toEqual(['EE.UU.', 'Alemania']);
    expect(f.hito).toBe('Sistema eléctrico de Edison en Manhattan (1882)');
    // La barra elegida se marca con el borde
    await expect(segunda.locator('rect')).not.toHaveAttribute('stroke', 'none');
    await segunda.click();
    await expect(page.getByRole('tabpanel').getByRole('heading', { level: 3 })).toHaveCount(0);
    await expect(segunda.locator('rect')).toHaveAttribute('stroke', 'none');
  });

  test('Comparativa: «3ª Revolución» deja sus 3 fases y «japon» sin tilde encuentra las dos de Japón', async ({ page }) => {
    await pestana(page, 'Comparativa');
    expect((await filasComparativa(page)).map((f) => f[0])).toEqual([...FASES]);
    await page.getByRole('button', { name: '3ª Revolución', exact: true }).click();
    await expect(page.getByRole('button', { name: '3ª Revolución', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Todas', exact: true })).toHaveAttribute('aria-pressed', 'false');
    // eraId 'tercera': tercera-rev, robotica, digital
    expect((await filasComparativa(page)).map((f) => `${f[0]} ${f[1]}`)).toEqual([
      'Tercera Revolución Industrial 1945–2000',
      'Automatización Robótica 1961–Presente',
      'Revolución Digital 1969–Presente',
    ]);

    await page.getByRole('button', { name: 'Todas', exact: true }).click();
    await esperarHidratacion(page, ['input[type="search"]']);
    const buscador = page.getByRole('searchbox', { name: 'Buscar fase industrial' });
    await buscador.fill('japon');
    await esperarValorEnReact(page, 'input[type="search"]', 'japon');
    // «Japón» solo figura en los países de tercera-rev y robotica
    expect((await filasComparativa(page)).map((f) => f[0])).toEqual(['Tercera Revolución Industrial', 'Automatización Robótica']);
  });

  test('Contexto: la 1ª Revolución reúne Primera Revolución y Ferrocarril y los hitos de 1769, 1793 y 1825', async ({ page }) => {
    const eras = await erasDelContexto(page);
    expect(eras.map((e) => e.nombre)).toEqual([
      'Preindustrial',
      '1ª Revolución Industrial',
      '2ª Revolución Industrial',
      '3ª Revolución Industrial',
      'Industria 4.0',
      'Industria 5.0 e IA',
    ]);
    const primera = eras[1];
    expect(primera.fases).toEqual(['Primera Revolución Industrial', 'Era del Ferrocarril']);
    expect(primera.eventos.map((e) => e.slice(0, 4))).toEqual(['1769', '1793', '1825']);
    // Preindustrial: una fase y ningún hito (no hay eventos antes de 1760)
    expect(eras[0].fases).toEqual(['Manufactura Preindustrial']);
    expect(eras[0].eventos).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — la primera y la última fase, un filtro que lo vacía todo, la última era, móvil
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 2 · extremos de la cronología y filtros vacíos', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('primera fase con «Anterior» deshabilitado; tras 12 «Siguiente», 13 / 13 y «Siguiente» deshabilitado', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(String(e)));
    await pestana(page, 'Fase en Detalle');
    const f = await leerFicha(page);
    expect([f.nombre, f.periodo, f.era, f.contador]).toEqual(['Manufactura Preindustrial', '1400 – 1760', 'Preindustrial', '1 / 13']);
    expect(f.hito).toBe('Estatutos del Gremio de Tejedores de Lana (York, 1400)');
    await expect(page.getByRole('button', { name: 'Fase anterior' })).toBeDisabled();
    const siguiente = page.getByRole('button', { name: 'Fase siguiente' });
    for (let i = 0; i < 12; i++) await siguiente.click();
    await expect(page.getByText('13 / 13', { exact: true })).toBeVisible();
    await expect(siguiente).toBeDisabled();
    // Pulsar de más no lo saca del rango
    await siguiente.click({ force: true });
    await expect(page.getByText('13 / 13', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Fase anterior' }).click();
    await expect(page.getByText('12 / 13', { exact: true })).toBeVisible();
    expect(errores).toEqual([]);
  });

  test('Comparativa: Preindustrial + «japon» no deja nada y lo dice; «Todas» y buscador vacío devuelven las 13', async ({ page }) => {
    await pestana(page, 'Comparativa');
    await esperarHidratacion(page, ['input[type="search"]']);
    const buscador = page.getByRole('searchbox', { name: 'Buscar fase industrial' });
    await page.getByRole('button', { name: 'Preindustrial', exact: true }).click();
    await buscador.fill('japon');
    await esperarValorEnReact(page, 'input[type="search"]', 'japon');
    expect(await filasComparativa(page)).toEqual([['Sin resultados para la búsqueda actual.']]);
    await page.getByRole('button', { name: 'Todas', exact: true }).click();
    await buscador.fill('');
    await esperarValorEnReact(page, 'input[type="search"]', '');
    expect((await filasComparativa(page)).map((f) => f[0])).toEqual([...FASES]);
  });

  test('Contexto: la última era (2020 – hoy) reúne las 7 fases en curso y el hito de 2023', async ({ page }) => {
    const ultima = (await erasDelContexto(page)).at(-1) as EraContexto;
    expect([ultima.nombre, ultima.rango]).toEqual(['Industria 5.0 e IA', '2020 – hoy']);
    // Las de anioFin 9999, en el orden del array
    expect(ultima.fases).toEqual([
      'Industria Petroquímica y Plásticos',
      'Automatización Robótica',
      'Revolución Digital',
      'Globalización Industrial',
      'Industria 4.0',
      'IA e Industria',
      'Energías Renovables',
    ]);
    expect(ultima.eventos.map((e) => e.slice(0, 4))).toEqual(['2023']);
  });

  // HALLAZGO [bajo] (Inspector 20/11/2026): «cronología» de 13 fases, pero el orden de Fase en
  // Detalle (y de la Comparativa) es el del array: «Siguiente» va de Fordismo (1913) a
  // Petroquímica (1900) y la última, 13 / 13, es Energías Renovables (2000), detrás de IA e
  // Industria (2020). Esperado: años de inicio sin retroceder y la más reciente al final.
  test.fail('la cronología avanza en el tiempo y la última fase es la más reciente', async ({ page }) => {
    const fichas = await todasLasFichas(page);
    const inicios = fichas.map((f) => Number(f.periodo.slice(0, 4)));
    const retrocesos = inicios.flatMap((a, i) => (i > 0 && a < inicios[i - 1] ? [`${fichas[i - 1].nombre} (${inicios[i - 1]}) → ${fichas[i].nombre} (${a})`] : []));
    expect(retrocesos).toEqual([]);
    expect(fichas.at(-1)?.nombre).toBe('IA e Industria');
  });

  // HALLAZGO [medio, junto al de teclado] (Inspector 20/11/2026): las tres fases más recientes
  // —las de la promesa del título, «a la IA y la Industria 4.0»— no tienen rótulo (barras de 31,4,
  // 49,5 y 16,5 px; el rótulo exige > 60) ni <title> ni aria-label: solo se distinguen por color.
  test.fail('cada barra de la línea del tiempo tiene nombre (rótulo, <title> o aria-label)', async ({ page }) => {
    const sinNombre = await barras(page).evaluateAll((gs) =>
      gs
        .filter((g) => !g.querySelector('text')?.textContent && !g.querySelector('title')?.textContent && !g.getAttribute('aria-label'))
        .map((g) => Math.round(Number(g.querySelector('rect')?.getAttribute('x')))),
    );
    // Antes: x = 1049 (Industria 4.0), 1030 (Energías Renovables), 1063 (IA e Industria)
    expect(sinNombre).toEqual([]);
  });

  test.describe('en un Pixel 7 (412 × 839)', () => {
    test.use({
      viewport: { width: 412, height: 839 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.8078.4 Mobile Safari/537.36',
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    });

    test('ninguna pestaña ni la guía desbordan en horizontal, y tocar una barra abre su ficha', async ({ page }) => {
      const ancho = (): Promise<number> => page.evaluate(() => document.documentElement.scrollWidth);
      expect(await ancho()).toBeLessThanOrEqual(412);
      // La línea del tiempo (1.100 px) se desplaza dentro de su caja, no arrastra la página
      const primera = barra(page, /^Primera/);
      await primera.tap();
      const f = await leerFicha(page);
      expect([f.nombre, f.periodo]).toEqual(['Primera Revolución Industrial', '1760 – 1840']);
      expect(await ancho()).toBeLessThanOrEqual(412);
      for (const t of ['Fase en Detalle', 'Comparativa', 'Contexto Histórico']) {
        await page.getByRole('tab', { name: t, exact: true }).tap();
        await expect(page.getByRole('tab', { name: t, exact: true })).toHaveAttribute('aria-selected', 'true');
        expect(await ancho(), t).toBeLessThanOrEqual(412);
      }
      await page.getByRole('button', { name: 'Ver guía educativa' }).tap();
      await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
      expect(await ancho()).toBeLessThanOrEqual(412);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CASO 3 (no debe romper) — teclado, doble clic y entradas raras
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 3 · teclado, doble clic y entradas raras no rompen nada', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('Enter y Espacio activan pestaña y filtro; «<script>%%%» no encuentra nada; el doble clic deja la barra coherente', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(String(e)));

    // Doble clic sobre una barra: abre y cierra; lo que importa es que borde y ficha cuadren
    const ferrocarril = barra(page, /^Era del Ferrocarril/);
    await ferrocarril.dblclick();
    const abierta = await page.getByRole('tabpanel').getByRole('heading', { level: 3 }).count();
    const trazo = await ferrocarril.locator('rect').getAttribute('stroke');
    expect(trazo !== 'none').toBe(abierta === 1);

    const comparativa = page.getByRole('tab', { name: 'Comparativa', exact: true });
    await comparativa.focus();
    await page.keyboard.press('Enter');
    await expect(comparativa).toHaveAttribute('aria-selected', 'true');

    const segunda = page.getByRole('button', { name: '2ª Revolución', exact: true });
    await segunda.focus();
    await page.keyboard.press('Space');
    await expect(segunda).toHaveAttribute('aria-pressed', 'true');
    // eraId 'segunda': segunda-rev, fordismo, petroquimica
    expect((await filasComparativa(page)).map((f) => f[0])).toEqual([
      'Segunda Revolución Industrial',
      'Producción en Serie — Fordismo',
      'Industria Petroquímica y Plásticos',
    ]);

    await esperarHidratacion(page, ['input[type="search"]']);
    await page.getByRole('searchbox', { name: 'Buscar fase industrial' }).fill('<script>%%%');
    await esperarValorEnReact(page, 'input[type="search"]', '<script>%%%');
    expect(await filasComparativa(page)).toEqual([['Sin resultados para la búsqueda actual.']]);
    expect(errores).toEqual([]);
  });

  // HALLAZGO [medio] (Inspector 20/11/2026): las barras son <g onClick> sin tabindex, sin rol y
  // dentro de un <svg role="img">: con teclado no se llega a ninguna («Haz clic en una fase») y el
  // lector de pantalla no las anuncia. WCAG 2.1.1 y 4.1.2.
  test.fail('con Tab se llega a la primera barra y Enter abre su ficha', async ({ page }) => {
    await page.getByRole('tab', { name: 'Contexto Histórico', exact: true }).focus();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('svg[aria-label^="Línea del tiempo"]')))).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tabpanel').getByRole('heading', { level: 3 })).toHaveCount(1);
  });

  // HALLAZGO [bajo] (Inspector 20/11/2026): role="tablist"/"tab" sin el teclado del patrón (las
  // flechas no hacen nada) y el tabpanel sin nombre (ni aria-controls ni aria-labelledby).
  test.fail('las flechas mueven entre pestañas y el panel se nombra por su pestaña', async ({ page }) => {
    await page.getByRole('tab', { name: 'Línea del Tiempo', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Fase en Detalle', exact: true })).toBeFocused({ timeout: 1000 });
    await expect(page.getByRole('tabpanel', { name: /Línea del Tiempo|Fase en Detalle/ })).toHaveCount(1, { timeout: 1000 });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de coherencia y contenido — afirman lo correcto; hoy fallan
// ════════════════════════════════════════════════════════════════════════════
test.describe('Hallazgos de coherencia y contenido (Inspector 20/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // HALLAZGO [bajo]: la misma revolución con dos fechas. Ficha, tabla de la guía y FAQPage dicen
  // 1ª 1760-1840, 2ª 1870-1914 e Industria 4.0 desde 2011; la vista por eras, 1760-1870,
  // 1870-1945 y 2000-2020 (y su propio hito «2011 Alemania lanza Industrie 4.0» cae dentro).
  test.fail('cada revolución tiene las mismas fechas en la vista por eras que en su ficha', async ({ page }) => {
    const fichas = await todasLasFichas(page);
    const eras = await erasDelContexto(page);
    const normal = (s: string): string => s.replace(/Presente|hoy/, 'hoy');
    const pares: [string, string][] = [
      ['1ª Revolución Industrial', 'Primera Revolución Industrial'],
      ['2ª Revolución Industrial', 'Segunda Revolución Industrial'],
      ['3ª Revolución Industrial', 'Tercera Revolución Industrial'],
      ['Industria 4.0', 'Industria 4.0'],
    ];
    const distintas = pares.flatMap(([era, fase]) => {
      const r = normal(eras.find((e) => e.nombre === era)?.rango ?? '');
      const p = normal(fichas.find((f) => f.nombre === fase)?.periodo ?? '');
      return r === p ? [] : [`${era}: era ${r} · ficha ${p}`];
    });
    // Antes: 1ª 1760 – 1870 / 1760 – 1840 · 2ª 1870 – 1945 / 1870 – 1914 · Industria 4.0 2000 – 2020 / 2011 – hoy
    expect(distintas).toEqual([]);
  });

  // HALLAZGO [bajo]: Globalización (1985) se rotula «Industria 4.0», que según la propia app
  // empieza en 2000 (eras) o 2011 (ficha); Energías Renovables (2000) se rotula «Industria 5.0»,
  // marco de la Comisión Europea de 2021 (FAQ visible). Y la IA es «pilar de la Industria 4.0» en
  // el FAQPage y en la tabla de la guía, pero su fase es «Industria 5.0» y su ficha dice que con
  // ella «Surge la Industria 5.0», cuando la FAQ visible la define como reorientación humana y no
  // como salto tecnológico.
  test.fail('ninguna fase se rotula con una era que aún no había empezado, y la IA no está en dos eras', async ({ page }) => {
    const fichas = await todasLasFichas(page);
    const eras = await erasDelContexto(page);
    const anacronicas = fichas.flatMap((f) => {
      const era = eras.find((e) => e.nombre.startsWith(f.era));
      const desdeEra = Number(era?.rango.slice(0, 4));
      const inicio = Number(f.periodo.slice(0, 4));
      return inicio < desdeEra ? [`${f.nombre} (${inicio}) rotulada ${f.era} (desde ${desdeEra})`] : [];
    });
    expect(anacronicas).toEqual([]);
    const faq = Object.values(await faqPage(page)).join(' ');
    const ia = fichas.find((f) => f.nombre === 'IA e Industria') as Ficha;
    if (faq.includes('pilares de la Industria 4.0')) expect(ia.era).toBe('Industria 4.0');
  });

  // HALLAZGO [bajo]: el paso 2 de la guía da como líderes «EE.UU. y Alemania (2ª y 3ª), Global-China
  // (4ª)», pero la ficha de la 3ª dice EE.UU., Japón y Global y la de Industria 4.0, Alemania y Global.
  test.fail('los países líderes de la guía son los de las fichas', async ({ page }) => {
    const fichas = await todasLasFichas(page);
    const paises = (n: string): string[] => fichas.find((f) => f.nombre === n)?.paises ?? [];
    await abrirGuia(page);
    const paso2 = await page.getByText('Observa qué país lideró cada oleada', { exact: true }).locator('xpath=following-sibling::p').innerText();
    const choques: string[] = [];
    if (/Alemania \(2ª y 3ª\)/.test(paso2) && !paises('Tercera Revolución Industrial').includes('Alemania')) choques.push('3ª: guía Alemania, ficha no');
    if (/China \(4ª\)/.test(paso2) && !paises('Industria 4.0').includes('China')) choques.push('4ª: guía China, ficha no');
    expect(choques).toEqual([]);
  });

  // HALLAZGO [bajo]: la columna «Tecnología motriz» de la Comparativa pinta el «Hito icónico»
  // recortado: «Estatutos del Gremio de Tejedores de Lana», «Entrada de China en la OMC»,
  // «ChatGPT y Copilot en entornos industriales» no son tecnologías motrices.
  test.fail('la columna «Tecnología motriz» no trae el hito de la fase', async ({ page }) => {
    await pestana(page, 'Comparativa');
    const cabecera = await page.getByRole('tabpanel').locator('thead th').nth(3).innerText();
    const filas = await filasComparativa(page);
    const columna = Object.fromEntries(filas.map((f) => [f[0], f[3]]));
    if (/tecnolog/i.test(cabecera)) {
      expect(columna['Manufactura Preindustrial']).not.toBe('Estatutos del Gremio de Tejedores de Lana');
      expect(columna['Globalización Industrial']).not.toBe('Entrada de China en la OMC');
    }
  });

  // HALLAZGO [bajo]: la ficha de Industria 4.0 dice que el FEM «acuña» el término «Cuarta
  // Revolución Industrial» en Davos 2016; la FAQ visible, que lo «popularizó» y que la estrategia
  // Industrie 4.0 (literalmente, 4.ª revolución industrial) es de 2011, fecha que la app repite en
  // su hito. Y el FAQPage presenta las cuatro revoluciones como lo que «suelen distinguir los
  // historiadores», cuando la 3ª y la 4ª son marcos de divulgación discutidos (§1.quinquies, n.º 3).
  test.fail('el origen del término «Cuarta Revolución Industrial» se cuenta igual en la ficha y en la FAQ', async ({ page }) => {
    const fichas = await todasLasFichas(page);
    const i40 = fichas.find((f) => f.nombre === 'Industria 4.0') as Ficha;
    expect(i40.descripcion).not.toMatch(/acuña/);
    const faq = Object.values(await faqPage(page)).join(' ');
    expect(faq).not.toContain('Los historiadores suelen distinguir cuatro');
  });

  // HALLAZGO [bajo]: «Edison inaugura la primera central eléctrica en Pearl Street» — Pearl Street
  // (04/09/1882) llegó después de Godalming (1881) y de la propia central de Edison en Holborn
  // Viaduct, Londres (1882): fue la primera central comercial de EE. UU.
  test.fail('Pearl Street no se presenta como la primera central eléctrica', async ({ page }) => {
    const eras = await erasDelContexto(page);
    const e1882 = eras.flatMap((e) => e.eventos).find((e) => e.startsWith('1882')) ?? '';
    expect(e1882).toContain('Pearl Street');
    expect(e1882).not.toMatch(/la primera central eléctrica en Pearl Street/);
  });

  // HALLAZGO [bajo] §1.quinquies n.º 8: la desmotadora «dispara la producción textil» sin una
  // palabra de que disparó el cultivo esclavista de algodón que alimentó la 1ª Revolución textil.
  test.fail('la desmotadora de algodón y la industria textil se cuentan con su contexto esclavista', async ({ page }) => {
    const contexto = (await erasDelContexto(page)).flatMap((e) => e.eventos).join(' ');
    await abrirGuia(page);
    expect(`${contexto} ${await textoGuia(page)}`).toMatch(/esclav/i);
  });

  // HALLAZGO [bajo]: ortografía y formato — «datilógrafos» (es «dactilógrafos»), «telégraficos»
  // (es «telegráficos») y «50%» / «−90%» sin el espacio duro (CLAUDE.md global §2).
  test.fail('ortografía de la guía y porcentajes con espacio duro', async ({ page }) => {
    await pestana(page, 'Fase en Detalle');
    await page.getByRole('button', { name: 'Energías Renovables', exact: true }).click();
    const renovables = (await leerFicha(page)).descripcion;
    await abrirGuia(page);
    const guia = await textoGuia(page);
    expect(guia).not.toContain('datilógrafos');
    expect(guia).not.toContain('telégraficos');
    expect(`${renovables} ${guia}`.match(/\d(?: )?%/g) ?? []).toEqual([]);
  });

  // HALLAZGO [bajo] §1.ter: el WebApplication del JSON-LD no lleva `features`.
  test.fail('el JSON-LD declara entre 4 y 8 características', async ({ page }) => {
    const app = (await bloquesLd(page)).find((b) => b['@type'] === 'WebApplication') as Record<string, unknown>;
    const features = (app.features ?? app.featureList ?? []) as string[];
    expect(features.length).toBeGreaterThanOrEqual(4);
    expect(features.length).toBeLessThanOrEqual(8);
  });

  test('la FAQ «¿Cuántas revoluciones…?» dice lo mismo en la página y en el FAQPage', async ({ page }) => {
    const faq = await faqPage(page);
    await abrirGuia(page);
    const visible = await page.getByText('¿Cuántas revoluciones industriales ha habido?', { exact: true }).locator('xpath=following-sibling::p').innerText();
    expect(faq['¿Cuántas revoluciones industriales ha habido y cuáles son?']).toBe(visible);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de contraste (WCAG 1.4.3) — REPARADOS el 21/11/2026 (cabo C0645, receta de
// visualizador-filosofia: tono por tema con mezclar y tonosPorTema, relleno y tinta de
// rellenoConTinta en botón, filtro y cabecera)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Hallazgos de contraste (Inspector 20/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // HALLAZGO 5316 [medio] (REPARADO): en claro, «Todas» —el filtro activo al abrir la Comparativa—
  // era blanco sobre #FAFAFA (1,04:1): `.filtroCatBtnActivo` pone el texto blanco y solo las eras
  // ponían fondo. Y el botón activo con el ratón encima tomaba `--primary-texto` sobre el color de
  // la era (`:hover`, 0,2,0, gana a `.filtroCatBtnActivo`, 0,1,0): 1,05-1,72:1. Ahora «Todas» va
  // sobre --primary-boton, también con el ratón encima, y cada era con su relleno y tinta.
  test('tema claro: el filtro activo se lee, también «Todas» y con el ratón encima', async ({ page }) => {
    await activarTema(page, 'light');
    await sinTransiciones(page);
    await pestana(page, 'Comparativa');
    await page.mouse.move(0, 0);
    const todas = page.getByRole('button', { name: 'Todas', exact: true });
    const fallos = suspensos(await contrastes(todas), 'Todas (por defecto)');
    for (const era of ERAS_FILTRO) {
      const b = page.getByRole('button', { name: era, exact: true });
      await b.click();
      fallos.push(...suspensos(await contrastes(b), `${era} con el ratón encima`));
    }
    await todas.click();
    await expect(todas).toHaveAttribute('aria-pressed', 'true');
    fallos.push(...suspensos(await contrastes(todas), 'Todas con el ratón encima'));
    expect(fallos).toEqual([]);
  });

  // HALLAZGO 5316 [medio] (REPARADO): en oscuro, `[data-theme='dark'] .filtroCatBtn` y
  // `.movimientoBtn` (0,2,0) ganaban al `color: #fff` del activo (0,1,0): gris #B0B0B0 sobre el
  // color de la era o la fase, 1,22-4,45:1 en 11 de 13 fases y en las 6 eras.
  test('tema oscuro: el botón activo de fase y de era se lee (≥ 4,5:1)', async ({ page }) => {
    test.setTimeout(60_000);
    await activarTema(page, 'dark');
    await sinTransiciones(page);
    await pestana(page, 'Fase en Detalle');
    const fallos: string[] = [];
    for (const fase of FASES) {
      const b = page.getByRole('button', { name: fase, exact: true });
      await b.click();
      await page.mouse.move(0, 0);
      await expect(b).toHaveAttribute('aria-pressed', 'true');
      fallos.push(...suspensos(await contrastes(b), 'fase'));
    }
    await pestana(page, 'Comparativa');
    for (const era of ERAS_FILTRO) {
      const b = page.getByRole('button', { name: era, exact: true });
      await b.click();
      await page.mouse.move(0, 0);
      fallos.push(...suspensos(await contrastes(b), 'era'));
    }
    expect(fallos).toEqual([]);
  });

  // HALLAZGO 5317 [medio] (REPARADO): el color de cada fase se usaba como TEXTO sin variante
  // oscura —nombre de la fase en la Comparativa, insignia de era, insignias del Contexto, título de
  // la ficha de la línea del tiempo—: en oscuro 1,20-3,34:1 (todos menos Fordismo); en claro,
  // Fordismo (#F57F17) 2,31-2,54, Energías Renovables 3,51-3,68 e Industria 4.0 3,57-4,23.
  for (const tema of ['light', 'dark'] as const) {
    test(`tema ${tema === 'light' ? 'claro' : 'oscuro'}: el texto pintado con el color de la fase se lee`, async ({ page }) => {
      test.setTimeout(60_000);
      await activarTema(page, tema);
      await sinTransiciones(page);
      const fallos: string[] = [];
      for (const r of [/^Era del Ferrocarril/, /^Industria Petroquímica/, /^Producción en/]) {
        await barra(page, r).click();
        fallos.push(...suspensos(await contrastes(page.getByRole('tabpanel').getByRole('heading', { level: 3 })), 'ficha de la línea'));
        await barra(page, r).click();
      }
      await pestana(page, 'Comparativa');
      fallos.push(...suspensos(await contrastes(page.getByRole('tabpanel').locator('tbody td strong')), 'Comparativa · fase'));
      fallos.push(...suspensos(await contrastes(page.getByRole('tabpanel').locator('tbody td:nth-child(3) span')), 'Comparativa · era'));
      await pestana(page, 'Contexto Histórico');
      fallos.push(...suspensos(await contrastes(page.getByRole('tabpanel').locator('span[style]')), 'Contexto'));
      expect(fallos).toEqual([]);
    });
  }

  // HALLAZGO 5318 [medio] (REPARADO): la cabecera de Fase en Detalle ponía blanco sobre el color de
  // la fase: Fordismo 2,65 (título), 2,41 (fechas) y 2,09 (era); Energías Renovables 3,65 en las
  // fechas; la etiqueta de era (blanca sobre un 25 % de blanco) no llegaba a 4,5 en 8 de 13.
  test('la cabecera de cada ficha en detalle se lee (título ≥ 3:1, fechas y era ≥ 4,5:1)', async ({ page }) => {
    test.setTimeout(60_000);
    await activarTema(page, 'light');
    await sinTransiciones(page);
    await pestana(page, 'Fase en Detalle');
    const fallos: string[] = [];
    for (const fase of FASES) {
      await page.getByRole('button', { name: fase, exact: true }).click();
      const cab = page.getByRole('tabpanel').getByRole('heading', { level: 3, name: fase }).locator('xpath=..');
      fallos.push(...suspensos(await contrastes(cab.locator(':scope > h3, :scope > p, :scope > span')), fase));
    }
    expect(fallos).toEqual([]);
  });
});
