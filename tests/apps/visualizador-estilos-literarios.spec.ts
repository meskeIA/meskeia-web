import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * visualizador-estilos-literarios — test de regresión del Inspector (PRIMERA inspección, 25/09/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «📚 Estilos y Movimientos Literarios» · sub «De la Ilustración al Posmodernismo — autores,
 * obras y fragmentos» · JSON-LD: «10 movimientos literarios», «Filtros por período histórico y
 * región geográfica», «Autores representativos con obras clave», «Fragmentos literarios
 * ilustrativos atribuidos». No calcula nada: su «resultado con verdad comprobable» es el
 * CONTENIDO (fechas, autor-obra, fragmentos entre comillas con autor, obra y año) y la
 * OPERATIVA (qué deja ver cada filtro, qué se ve al elegir un movimiento).
 *
 * POR QUÉ SE INSPECCIONÓ
 * ──────────────────────
 * Primera inspección (segmento interactiva, riesgo 3, 76 usos), con una sospecha previa por
 * grep: décadas al estilo inglés («1950s»). Se confirma en el texto visible (4 apariciones) y
 * se descarta en metadata/JSON-LD, donde «los años 60-70» es forma admitida por la RAE.
 *
 * FUENTES DE LOS VALORES ESPERADOS (resueltos a mano ANTES de abrir la app)
 * ────────────────────────────────────────────────────────────────────────
 * · Flaubert, Madame Bovary (1857), III, 6: «Elle n'était pas heureuse, ne l'avait jamais été.
 *   D'où venait donc cette insuffisance de la vie, cette pourriture instantanée des choses où
 *   elle s'appuyait ?» — Wikisource, ed. Conard 1910, p. 417.
 * · García Márquez, Cien años de soledad (Sudamericana, Buenos Aires, 1967): íncipit
 *   «Muchos años después, frente al pelotón de fusilamiento…» — Instituto Cervantes.
 * · Voltaire, Candide (1759) — BnF; cap. 1: «Candide écoutait attentivement, et croyait
 *   innocemment» (fr.wikisource, Garnier 1877). No hay en él «con la fe sencilla de quien aún
 *   no ha visto demasiado del mundo».
 * · Calvino, Se una notte d'inverno un viaggiatore (Einaudi, 1979).
 * · Bécquer, rima «Podrá nublarse el sol eternamente» (LXXXIV en el portal Bécquer de la
 *   Biblioteca Virtual Miguel de Cervantes): cierra «¡Todo sucederá! Podrá la muerte / cubrirme
 *   con su fúnebre crespón; / pero jamás en mí podrá apagarse / la llama de tu amor».
 * · Zola, Germinal (1885), final: «Des hommes poussaient, une armée noire, vengeresse, qui
 *   germait lentement dans les sillons, grandissant pour les récoltes du siècle futur, et dont
 *   la germination allait faire bientôt éclater la terre.» (fr.wikipedia / fr.wikisource).
 * · Ferlinghetti: Pictures of the Gone World (1955), A Coney Island of the Mind (1958; en
 *   español «Un Coney Island de la mente», Ciudad Seva), How to Paint Sunlight (2001)… —
 *   en.wikipedia «Lawrence Ferlinghetti». Ningún libro «Un jardín de luz solar».
 * · Darío: «Entre 1889 y 1893 vive en varios países de Centroamérica» — Instituto Cervantes,
 *   Biografía de Rubén Darío; primera estancia en París, junio-agosto de 1893.
 * · García Márquez, El coronel no tiene quien le escriba: primera edición 1961 (siglo XX).
 * · Décadas: RAE-ASALE, Ortografía, «La expresión de las décadas» y DPD s. v. «década»: «los
 *   años cincuenta», «la década de 1950»; «los 50s» es calco del inglés.
 * · Modernism anglosajón: técnicas de monólogo interior, «más o menos entre 1900 y 1940» —
 *   es.wikipedia «Modernismo anglosajón». Nada de «concienciación social».
 * · Contraste: WCAG 2.2, 1.4.3 (4,5:1 texto normal; 3:1 a partir de 24 px o 18,66 px negrita).
 * · §1.bis y §1.quinquies del CLAUDE.md del proyecto (Latam-friendly y neutralidad editorial);
 *   la app se creó el 24/05/2026, después de que §1.bis entrara en vigor (06/05/2026).
 *
 * Los casos 1-3 afirman lo que la app hace bien. Los marcados con test.fail() afirman lo
 * CORRECTO y hoy fallan por un hallazgo: cuando se repare, Playwright avisará para quitarles
 * la marca.
 */

const RUTA = '/visualizador-estilos-literarios/';

/** Los 10 movimientos en el orden de la parrilla (array `movimientos` de page.tsx). */
const MOVIMIENTOS = [
  'Neoclasicismo',
  'Romanticismo',
  'Realismo',
  'Naturalismo',
  'Modernismo',
  'Vanguardias',
  'Existencialismo',
  'Boom Latinoamericano',
  'Generación Beat',
  'Literatura Posmoderna',
];

const MOVIL = {
  viewport: { width: 360, height: 740 },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

async function abrir(page: Page): Promise<void> {
  // Sin animación de entrada del detalle (fadeIn desde opacidad 0): medir contraste o
  // posición a mitad de la animación daría cifras falsas.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

const tarjeta = (page: Page, nombre: string) =>
  page.getByRole('button', { name: `Ver ${nombre}`, exact: true });

async function nombresEnParrilla(page: Page): Promise<string[]> {
  return page.locator('button[aria-label^="Ver "] h2').allTextContents();
}

async function filtrar(page: Page, periodo: string, region: string): Promise<void> {
  await page.getByRole('group', { name: 'Filtrar por período' }).getByRole('button', { name: periodo, exact: true }).click();
  await page.getByRole('group', { name: 'Filtrar por región' }).getByRole('button', { name: region, exact: true }).click();
}

async function volverAlListado(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Volver al listado', exact: true }).click();
  await expect(page.locator('button[aria-label^="Ver "] h2').first()).toBeVisible();
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('heading', { name: 'Preguntas frecuentes sobre movimientos literarios' })).toBeVisible();
}

/** Texto de las secciones PROPIAS de la guía (sin RelatedApps, ShareCard ni Footer). */
async function textoGuia(page: Page): Promise<string> {
  const partes = await page.locator('[class*="guideSection"], [class*="warningBox"]').allInnerTexts();
  return partes.join('\n');
}

interface Ficha {
  nombre: string;
  periodo: string;
  regiones: string[];
  fragmento: string;
  atribucion: string;
  autores: { nombre: string; pais: string; rasgo: string; obras: string[] }[];
}

async function leerDetalle(page: Page): Promise<Ficha> {
  await expect(page.locator('[class*="detalleNombre"]')).toBeVisible();
  return page.evaluate(() => {
    const t = (sel: string, raiz: ParentNode = document): string =>
      (raiz.querySelector(sel)?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const sinEmoji = (s: string): string => s.replace(/^[\p{Extended_Pictographic}️\s]+/u, '').trim();
    return {
      nombre: t('[class*="detalleNombre"]'),
      periodo: sinEmoji(t('[class*="detallePeriodo"]')),
      regiones: Array.from(document.querySelectorAll('[class*="detalleRegion"]')).map((e) => sinEmoji(e.textContent ?? '')),
      fragmento: t('[class*="fragmentoTexto"]'),
      atribucion: t('[class*="fragmentoAtribucion"]'),
      autores: Array.from(document.querySelectorAll('[class*="autorCard"]')).map((c) => ({
        nombre: t('[class*="autorNombre"]', c),
        pais: t('[class*="autorPais"]', c),
        rasgo: t('[class*="autorRasgo"]', c),
        obras: Array.from(c.querySelectorAll('[class*="obraTag"]')).map((o) => sinEmoji(o.textContent ?? '')),
      })),
    };
  });
}

/**
 * Peor contraste (WCAG) del texto de los elementos visibles que casan con `selector`,
 * componiendo los fondos translúcidos hacia arriba y la opacidad heredada.
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
    const fondo = (el: Element): number[] => {
      const capas: number[][] = [];
      let e: Element | null = el;
      while (e) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) {
          capas.push(c);
          if (c[3] >= 1) break;
        }
        e = e.parentElement;
      }
      let res = [255, 255, 255, 1];
      for (let i = capas.length - 1; i >= 0; i--) res = mezclar(capas[i], res);
      return res;
    };
    let peor: { ratio: number; texto: string } | null = null;
    for (const el of Array.from(document.querySelectorAll(sel))) {
      if (!el.getClientRects().length) continue;
      let opacidad = 1;
      for (let x: Element | null = el; x; x = x.parentElement) opacidad *= parseFloat(getComputedStyle(x).opacity);
      const bg = fondo(el);
      const c = parse(getComputedStyle(el).color);
      const texto = mezclar([c[0], c[1], c[2], c[3] * opacidad], bg);
      const l1 = lum(texto);
      const l2 = lum(bg);
      const ratio = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
      if (!peor || ratio < peor.ratio) peor = { ratio, texto: (el.textContent ?? '').trim().slice(0, 40) };
    }
    return peor;
  }, selector);
}

// ════════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — elegir un movimiento muestra sus datos verdaderos
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 1 · elegir un movimiento muestra fechas, obras y fragmento comprobables', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('la parrilla ofrece los 10 movimientos que promete el JSON-LD, en orden', async ({ page }) => {
    expect(await nombresEnParrilla(page)).toEqual(MOVIMIENTOS);
    // La tabla de la guía («Los 10 movimientos de un vistazo») cuenta los mismos
    await abrirGuia(page);
    await expect(page.locator('[class*="comparativaTable"] tbody tr')).toHaveCount(10);
  });

  test('Realismo: periodo, región, fragmento literal de Madame Bovary (1857) y sus 4 autores', async ({ page }) => {
    await tarjeta(page, 'Realismo').click();
    const f = await leerDetalle(page);
    expect(f.nombre).toBe('Realismo');
    expect(f.periodo).toBe('Mediados – finales del XIX');
    expect(f.regiones).toEqual(['Europa']);
    // Flaubert, Madame Bovary, III, 6 (Wikisource, Conard 1910, p. 417), en traducción fiel
    expect(f.fragmento).toBe(
      '«Emma no era feliz, no lo había sido nunca. ¿De dónde venía esa insuficiencia de la vida, esa instantánea podredumbre de las cosas en que se apoyaba?»',
    );
    // Madame Bovary: edición en libro, Michel Lévy, abril de 1857 (BnF)
    expect(f.atribucion).toBe('— Gustave Flaubert, Madame Bovary (1857)');
    // «4 autores →» de la tarjeta = 4 fichas en el detalle
    expect(f.autores.map((a) => `${a.nombre} (${a.pais})`)).toEqual([
      'Gustave Flaubert (Francia)',
      'León Tolstói (Rusia)',
      'Benito Pérez Galdós (España)',
      'Charles Dickens (Gran Bretaña)',
    ]);
    // Autor-obra: Madame Bovary 1857, Anna Karénina 1877, Fortunata y Jacinta 1887, Oliver Twist 1838
    expect(f.autores[0].obras).toContain('Madame Bovary');
    expect(f.autores[1].obras).toContain('Anna Karénina');
    expect(f.autores[2].obras).toContain('Fortunata y Jacinta');
    expect(f.autores[3].obras).toContain('Oliver Twist');
  });

  test('Boom Latinoamericano: íncipit de Cien años de soledad (1967) y autores con su país', async ({ page }) => {
    await tarjeta(page, 'Boom Latinoamericano').click();
    const f = await leerDetalle(page);
    expect(f.periodo).toBe('1960–1975');
    expect(f.regiones).toEqual(['América Latina']);
    // Íncipit literal (Sudamericana, Buenos Aires, 1967 — Instituto Cervantes)
    expect(f.fragmento).toBe(
      '«Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.»',
    );
    expect(f.atribucion).toBe('— Gabriel García Márquez, Cien años de soledad (1967)');
    expect(f.autores.map((a) => `${a.nombre} (${a.pais})`)).toEqual([
      'Gabriel García Márquez (Colombia)',
      'Julio Cortázar (Argentina)',
      'Carlos Fuentes (México)',
      'Mario Vargas Llosa (Perú)',
    ]);
    // Rayuela 1963 · La muerte de Artemio Cruz 1962 · La ciudad y los perros 1963
    expect(f.autores[1].obras).toContain('Rayuela');
    expect(f.autores[2].obras).toContain('La muerte de Artemio Cruz');
    expect(f.autores[3].obras).toContain('La ciudad y los perros');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — primero y último, filtro que no deja nada, móvil de 360 px
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 2 · los extremos de la lista y un filtro que lo vacía todo', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('el primero (Neoclasicismo, Cándido 1759) y el último (Posmoderna, Calvino 1979)', async ({ page }) => {
    await tarjeta(page, 'Neoclasicismo').click();
    let f = await leerDetalle(page);
    expect(f.periodo).toBe('Siglos XVII–XVIII');
    // Candide ou l'Optimisme, 1759 (BnF)
    expect(f.atribucion).toBe('— Voltaire, Cándido (1759)');
    await volverAlListado(page);

    await tarjeta(page, 'Literatura Posmoderna').click();
    f = await leerDetalle(page);
    expect(f.periodo).toBe('1970–presente');
    // Se una notte d'inverno un viaggiatore, Einaudi, 1979 — y su íncipit en segunda persona
    expect(f.atribucion).toBe('— Italo Calvino, Si una noche de invierno un viajero (1979)');
    expect(f.fragmento).toContain('Estás a punto de empezar a leer la nueva novela de Italo Calvino');
  });

  test('S.XVII–XVIII + América Latina no deja nada, lo dice, y «Todos» lo restablece', async ({ page }) => {
    await filtrar(page, 'S.XVII–XVIII', 'América Latina');
    expect(await nombresEnParrilla(page)).toEqual([]);
    await expect(page.getByText('No hay movimientos para esta combinación de filtros.')).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Filtrar por período' }).getByRole('button', { name: 'S.XVII–XVIII', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');

    await filtrar(page, 'Todos', 'Todas las regiones');
    expect(await nombresEnParrilla(page)).toEqual(MOVIMIENTOS);
    await expect(page.getByText('No hay movimientos para esta combinación de filtros.')).toHaveCount(0);
  });

  test.describe('en un móvil de 360 px', () => {
    test.use({ ...MOVIL });

    test('ni la parrilla ni el detalle más largo desbordan en horizontal', async ({ page }) => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
      await tarjeta(page, 'Boom Latinoamericano').click();
      await leerDetalle(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CASO 3 (no debe romper) — teclado y filtros a lo loco
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 3 · teclado y cambios de filtro seguidos no rompen nada', () => {
  test('se abre y se cierra un movimiento con Enter, y 25 combinaciones de filtro no lanzan errores', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(String(e)));
    await abrir(page);

    await tarjeta(page, 'Realismo').focus();
    await page.keyboard.press('Enter');
    expect((await leerDetalle(page)).nombre).toBe('Realismo');
    await page.getByRole('button', { name: 'Volver al listado', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('button[aria-label^="Ver "] h2')).toHaveCount(10);
    expect(await nombresEnParrilla(page)).toEqual(MOVIMIENTOS);

    // Espacio sobre un filtro lo activa y mueve aria-pressed
    const europa = page.getByRole('group', { name: 'Filtrar por región' }).getByRole('button', { name: 'Europa', exact: true });
    await europa.focus();
    await page.keyboard.press('Space');
    await expect(europa).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('group', { name: 'Filtrar por región' }).getByRole('button', { name: 'Todas las regiones', exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');

    for (const p of ['Todos', 'S.XVII–XVIII', 'S.XIX', 'S.XX', 'Contemporáneo']) {
      for (const r of ['Todas las regiones', 'Europa', 'América Latina', 'EEUU', 'Universal']) {
        await filtrar(page, p, r);
        const n = (await nombresEnParrilla(page)).length;
        const vacio = await page.getByText('No hay movimientos para esta combinación de filtros.').count();
        // O hay tarjetas, o hay aviso de vacío: nunca las dos cosas ni ninguna
        expect(n > 0 ? 0 : 1).toBe(vacio);
      }
    }
    expect(errores).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// HALLAZGOS — afirman lo correcto; hoy fallan (test.fail)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Hallazgos del Inspector (25/09/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // HALLAZGO [medio] (Inspector 25/09/2026): 3 de los 10 «fragmentos representativos», entre
  // comillas y con autor, obra y año, NO son el texto de la obra.
  test('los fragmentos entre comillas son el texto de la obra (Bécquer, Zola, Voltaire)', async ({ page }) => {
    test.fail();
    await tarjeta(page, 'Romanticismo').click();
    const becquer = await leerDetalle(page);
    // Cierre real de la rima (BVMC, LXXXIV): «…pero jamás en mí podrá apagarse / la llama de tu amor»
    expect(becquer.fragmento).toContain('la llama de tu amor');
    expect(becquer.fragmento).not.toContain('nunca te olvidaré');
    await volverAlListado(page);

    await tarjeta(page, 'Naturalismo').click();
    // «Germinal brotaba» no está en la novela: el final es «Des hommes poussaient…»
    expect((await leerDetalle(page)).fragmento).not.toContain('Germinal brotaba');
    await volverAlListado(page);

    await tarjeta(page, 'Neoclasicismo').click();
    // Cap. 1: «Candide écoutait attentivement, et croyait innocemment»
    expect((await leerDetalle(page)).fragmento).not.toContain('con la fe sencilla');
  });

  // HALLAZGO [medio] (Inspector 25/09/2026): cada movimiento tiene UNA región y UN periodo de
  // filtro, pero la tarjeta enseña varios: el filtro esconde lo que la propia tarjeta rotula.
  test('el filtro de región incluye los movimientos cuya tarjeta lleva esa región', async ({ page }) => {
    test.fail();
    // Premisa (pasa hoy): la tarjeta de Naturalismo lleva la insignia «EEUU»
    await expect(tarjeta(page, 'Naturalismo').locator('[class*="regionBadge"]', { hasText: 'EEUU' })).toHaveCount(1);
    await filtrar(page, 'Todos', 'EEUU');
    // Esperado: Naturalismo y Generación Beat · obtenido: solo Generación Beat
    expect(await nombresEnParrilla(page)).toContain('Naturalismo');
  });

  test.describe('en un móvil de 360 px', () => {
    test.use({ ...MOVIL });

    // HALLAZGO [medio] (Inspector 25/09/2026): al elegir un movimiento de la parte baja de la
    // parrilla, la página conserva el desplazamiento y se aterriza a mitad del detalle.
    test('al elegir el último movimiento, su cabecera queda a la vista', async ({ page }) => {
      test.fail();
      await tarjeta(page, 'Literatura Posmoderna').click();
      await expect(page.locator('[class*="detalleNombre"]')).toHaveText('Literatura Posmoderna');
      // Hoy: scrollY 1681 y la cabecera 1165 px por encima del borde; se ve «El nombre de la rosa»
      await expect(page.locator('[class*="detalleNombre"]')).toBeInViewport({ timeout: 2000 });
    });

    // HALLAZGO [bajo] (Inspector 25/09/2026): el contenido va pegado a los bordes (la clase
    // `.main` —max-width 1200 px, padding 1,25-2 rem— está definida y no se aplica) y el botón
    // inferior «← Volver al listado» sale sin estilo (lleva el modificador sin la base).
    test('el listado deja margen lateral y los dos botones de volver comparten estilo', async ({ page }) => {
      test.fail();
      await tarjeta(page, 'Realismo').click();
      await leerDetalle(page);
      const radio = await page.locator('[class*="btnVolverBottom"]').evaluate((b) => getComputedStyle(b).borderTopLeftRadius);
      // .btnVolver: border-radius 8px; el de abajo hoy hereda el del navegador
      expect(radio).toBe('8px');
      await volverAlListado(page);
      const x = await page.locator('[class*="filtros"]').evaluate((e) => e.getBoundingClientRect().x);
      expect(x).toBeGreaterThanOrEqual(16);
    });
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): el foco se pierde en <body> al abrir y al cerrar
  // un movimiento, y el aviso de «sin resultados» no se anuncia (sin role="status").
  test('el foco acompaña al cambio de vista y el vacío se anuncia', async ({ page }) => {
    test.fail();
    await tarjeta(page, 'Realismo').focus();
    await page.keyboard.press('Enter');
    await leerDetalle(page);
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
    await page.getByRole('button', { name: 'Volver al listado', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(tarjeta(page, 'Realismo')).toBeFocused();
    await filtrar(page, 'S.XVII–XVIII', 'América Latina');
    await expect(page.getByRole('status').filter({ hasText: 'No hay movimientos' })).toHaveCount(1);
  });

  // HALLAZGO [medio] (Inspector 25/09/2026): en oscuro, el filtro ACTIVO pone el gris
  // --text-secondary sobre el azul --primary: 1,29:1. `[data-theme='dark'] .filtroBtn`
  // (0,2,0) gana al `color: white` de `.filtroBtnActivo` (0,1,0).
  test('en tema oscuro el filtro activo se lee (≥ 4,5:1)', async ({ page }) => {
    test.fail();
    await activarTema(page, 'dark');
    const c = await peorContraste(page, '[class*="filtroBtnActivo"]');
    expect(c?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
  });

  // HALLAZGO [medio] (Inspector 25/09/2026): texto pequeño por debajo de 4,5:1 en claro. Lo
  // peor es el periodo y la región de la cabecera del detalle sobre el color del movimiento
  // (8 de 10), justo el dato de fechas: Vanguardias y Posmoderna 2,94:1 / 2,41-2,44:1.
  test('el texto pequeño cumple 4,5:1 en tema claro', async ({ page }) => {
    test.fail();
    await activarTema(page, 'light');
    const fallos: string[] = [];
    const anotar = (donde: string, c: { ratio: number } | null): void => {
      if (c && c.ratio < 4.5) fallos.push(`${donde} ${c.ratio}`);
    };
    anotar('filtro activo', await peorContraste(page, '[class*="filtroBtnActivo"]'));
    anotar('insignia de región', await peorContraste(page, '[class*="regionBadge"]'));
    for (const m of MOVIMIENTOS) {
      await tarjeta(page, m).click();
      await leerDetalle(page);
      anotar(`${m} · periodo`, await peorContraste(page, '[class*="detallePeriodo"]'));
      anotar(`${m} · región`, await peorContraste(page, '[class*="detalleRegion"]'));
      if (m === 'Realismo') anotar('etiqueta de obra', await peorContraste(page, '[class*="obraTag"]'));
      await volverAlListado(page);
    }
    await abrirGuia(page);
    anotar('número de paso', await peorContraste(page, '[class*="stepNumber"]'));
    expect(fallos).toEqual([]);
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): 24 emojis junto a texto sin aria-hidden en la
  // guía (10 en la tabla, 8 «💡», 6 «❌»), más el «📖» del título de la sección educativa.
  test('los emojis decorativos de la guía llevan aria-hidden', async ({ page }) => {
    test.fail();
    await abrirGuia(page);
    const sueltos = await page.evaluate(() => {
      const re = /\p{Extended_Pictographic}/u;
      const out: string[] = [];
      for (const raiz of Array.from(document.querySelectorAll('[class*="guideSection"], [class*="warningBox"]'))) {
        const tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          const p = n.parentElement;
          if (!p || !re.test(n.textContent ?? '') || p.closest('[aria-hidden="true"]')) continue;
          out.push((n.textContent ?? '').trim().slice(0, 30));
        }
      }
      return out;
    });
    expect(sueltos).toEqual([]);
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): décadas calcadas del inglés en el texto visible.
  // RAE: «los años cuarenta» o «la década de 1940»; «1940s» y «los 1940» no son españoles.
  test('las décadas se escriben a la española (texto visible y JSON-LD)', async ({ page }) => {
    test.fail();
    const calco = /\b\d{4}s\b|\blos \d{4}\b/g;
    // JSON-LD: pasa hoy («los años 60-70» es forma admitida por la RAE)
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld.match(calco) ?? []).toEqual([]);
    await abrirGuia(page);
    // Hoy: ['los 1940', '1940s', '1950s', '1960s'] (FAQ de Borges, de las fechas y de la Beat)
    expect((await textoGuia(page)).match(calco) ?? []).toEqual([]);
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): el JSON-LD llama «Modernismo» a Joyce, Woolf y
  // Faulkner, justo la confusión contra la que advierte la FAQ de la página; y la página
  // describe el Modernism anglosajón como «concienciación social» (es monólogo interior).
  test('Modernismo y Modernism no se confunden entre la página y el JSON-LD', async ({ page }) => {
    test.fail();
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld).not.toContain('Modernismo (Joyce');
    await abrirGuia(page);
    expect(await textoGuia(page)).not.toContain('concienciación social');
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): dos datos falsos en la guía.
  test('la guía no sitúa El coronel (1961) en el XIX ni a Darío en París en 1890', async ({ page }) => {
    test.fail();
    await abrirGuia(page);
    const texto = await textoGuia(page);
    expect(texto).not.toMatch(/Para el XIX:\s*El coronel no tiene quien le escriba/);
    // Instituto Cervantes: «Entre 1889 y 1893 vive en varios países de Centroamérica»
    expect(texto).not.toMatch(/en 1890 coexistían en París[^.]*Darío/);
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): Ferlinghetti no tiene ningún «Un jardín de luz
  // solar»; su libro de 1958 es «Un Coney Island de la mente»; y «El «prosa espontánea»».
  test('Generación Beat: obras de Ferlinghetti reales y concordancia del rasgo de Kerouac', async ({ page }) => {
    test.fail();
    await tarjeta(page, 'Generación Beat').click();
    const f = await leerDetalle(page);
    const ferlinghetti = f.autores.find((a) => a.nombre === 'Lawrence Ferlinghetti');
    expect(ferlinghetti?.obras).not.toContain('Un jardín de luz solar');
    expect(ferlinghetti?.obras).toContain('Un Coney Island de la mente');
    expect(f.autores[0].rasgo.startsWith('El «prosa')).toBe(false);
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): §1.bis Latam-friendly — «bachillerato o
  // selectividad», «selectividad española» (con una afirmación sin fuente), «exámenes
  // españoles» y «conformidad americana» por estadounidense.
  test('la guía no da por hecho que el lector es de España', async ({ page }) => {
    test.fail();
    await abrirGuia(page);
    const texto = await textoGuia(page);
    expect(texto).not.toContain('selectividad');
    expect(texto).not.toContain('exámenes españoles');
    expect(texto).not.toContain('conformidad americana');
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): §1.quinquies — comparar a los hippies con el
  // nazismo como recurso decorativo en una guía de literatura.
  test('la guía no usa el nazismo como analogía decorativa', async ({ page }) => {
    test.fail();
    await abrirGuia(page);
    expect(await textoGuia(page)).not.toContain('nazismo');
  });
});
