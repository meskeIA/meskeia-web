import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * visualizador-estilos-literarios — test de regresión del Inspector (PRIMERA inspección, 25/09/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «📚 Estilos y Movimientos Literarios» · sub «Del Neoclasicismo a la literatura posmoderna —
 * autores, obras y fragmentos» (antes de la reparación: «De la Ilustración al Posmodernismo») ·
 * JSON-LD: «10 movimientos literarios», «Filtros por período histórico y región geográfica»,
 * «Autores representativos con obras clave», «Fragmentos literales de las obras, con autor, obra
 * y año» (antes: «Fragmentos literarios ilustrativos atribuidos»). No calcula nada: su «resultado con verdad comprobable» es el
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
 *
 * REPARACIÓN (25/09/2026, hallazgos 1880-1893): se retiran todas las marcas test.fail().
 * · La tarjeta deja de ser un <button> con h2 y párrafos dentro (HTML no válido): ahora es un
 *   <li> y el botón «Ver X» vive dentro de su h2. Los selectores que buscaban
 *   `button[aria-label^="Ver "] h2` pasan a `[class*="movimientoCard"] h2`; lo que miden no cambia.
 * · El filtro de región «Universal» desaparece: solo lo llevaba Literatura Posmoderna, que
 *   ahora se rotula y se filtra por las regiones de sus autores (Europa, América Latina, EEUU).
 *   El caso 3 recorre las cuatro regiones que quedan.
 * · Bécquer: el esperado del acta («…la llama de tu amor») era el texto real de «Podrá
 *   nublarse el sol eternamente», pero ese poema NO está en las Rimas de 1871 que cita la
 *   atribución: es «Amor eterno», que Rodríguez Correa publicó en la 4.ª ed. de las Obras
 *   (1885), fuera de las Rimas (es.wikipedia «Rimas (Bécquer)», apéndices de la ed. de
 *   Montesinos). La app pasa a la rima XXI («¿Qué es poesía?…»), que sí es de las Rimas;
 *   texto en es.wikisource, Obras, t. III (1885), p. 159.
 *
 * RE-INSPECCIÓN (27/09/2026, tras b1a0c6af y el arreglo del logo 586a4d61)
 * ─────────────────────────────────────────────────────────────────────
 * Los 14 hallazgos 1880-1893 se verifican en navegador y aguantan. Casos nuevos (bloque del
 * final), resueltos a mano leyendo el array `movimientos` antes de ejecutar:
 * · S.XX + América Latina → Modernismo, Vanguardias, Boom, Posmoderna (los cuatro con 'sxx' en
 *   `periodos` y 'latam' en `regiones`); S.XIX + EEUU → Romanticismo y Naturalismo.
 * · Fragmentos que la reparación no cotejó, contra fuente:
 *   Darío, «Yo soy aquel que ayer no más decía…», primer poema de Cantos de vida y esperanza
 *   (Madrid, 1905) — es.wikisource «Yo soy aquel que ayer no más decía».
 *   Huidobro, Altazor (Madrid, 1931), comienzo del Canto I: «Altazor ¿por qué perdiste tu
 *   primera serenidad? / ¿Qué ángel malo se paró en la puerta de tu sonrisa / Con la espada en
 *   la mano?» — Gaceta de la Universidad de Guadalajara, «Altazor».
 *   Camus, L'Étranger (Gallimard, 1942), íncipit: «Aujourd'hui, maman est morte. Ou peut-être
 *   hier, je ne sais pas. […] « Mère décédée. Enterrement demain. Sentiments distingués. » Cela
 *   ne veut rien dire.» — fr.wikipedia «Aujourd'hui, maman est morte».
 *   Ginsberg, Howl and Other Poems (City Lights, 1956): «I saw the best minds of my generation
 *   destroyed by madness, starving hysterical naked, / dragging themselves through the negro
 *   streets at dawn looking for an angry fix,».
 *   Calvino, Se una notte d'inverno un viaggiatore (Einaudi, 1979), íncipit: «Stai per
 *   cominciare a leggere il nuovo romanzo Se una notte d'inverno un viaggiatore di Italo Calvino.
 *   Rilassati. Raccogliti. Allontana da te ogni altro pensiero.»
 *   Los cinco anclan: texto de la obra (o traducción fiel, declarada), obra y año correctos.
 * · Kerouac, The Dharma Bums (1958): en español «Los vagabundos del Dharma» (Anagrama, trad.
 *   Mariano Antolín Rato, ISBN 978-84-339-6139-6). No hay edición «El dharma de los vagabundos».
 * · WCAG 2.2, 2.5.3 (Label in Name): el nombre accesible de un control con texto visible debe
 *   CONTENER ese texto.
 * · Logo fijo (MeskeiaLogo): hasta 768 px la barra baja a 52 px y el hero deja 80 px (586a4d61);
 *   desde 769 px el logo ocupa x 20-203 / y 15-77 y el hero vuelve a 48 px de relleno, así que
 *   un título centrado que empiece antes de x = 203 queda debajo (medido: 769-989 px).
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

/** Tarjeta entera (el <li>), para leer lo que rotula además del nombre. */
const tarjetaEntera = (page: Page, nombre: string) =>
  page.locator('[class*="movimientoCard"]').filter({ has: tarjeta(page, nombre) });

async function nombresEnParrilla(page: Page): Promise<string[]> {
  return page.locator('[class*="movimientoCard"] h2').allTextContents();
}

async function filtrar(page: Page, periodo: string, region: string): Promise<void> {
  await page.getByRole('group', { name: 'Filtrar por período' }).getByRole('button', { name: periodo, exact: true }).click();
  await page.getByRole('group', { name: 'Filtrar por región' }).getByRole('button', { name: region, exact: true }).click();
}

/**
 * Botón «← Todos los movimientos» de ARRIBA del detalle. Se localiza por clase y no por su
 * nombre accesible, que hoy es «Volver al listado» y cambiará al reparar el 2.5.3 (ver el
 * bloque de la re-inspección): así los casos que solo lo pulsan no se rompen con el arreglo.
 */
const botonVolverArriba = (page: Page) =>
  page.locator('[class*="btnVolver"]:not([class*="btnVolverBottom"])');

async function volverAlListado(page: Page): Promise<void> {
  await botonVolverArriba(page).click();
  await expect(page.locator('[class*="movimientoCard"] h2').first()).toBeVisible();
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('heading', { name: 'Preguntas frecuentes sobre movimientos literarios' })).toBeVisible();
  // El contenido de <EducationalSection> entra con un fadeIn de 0,5 s que no se acorta con
  // reduced-motion: medido al vuelo, el texto sale con opacidad 0 y contraste 1:1. Se espera
  // a que acabe antes de medir (lo destapó la reparación del 25/09/2026: número de paso = 1).
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
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
    await botonVolverArriba(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="movimientoCard"] h2')).toHaveCount(10);
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
      // Sin «Universal»: se retiró en la reparación del 1881 (ver cabecera)
      for (const r of ['Todas las regiones', 'Europa', 'América Latina', 'EEUU']) {
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
// HALLAZGOS — afirman lo correcto; reparados el 25/09/2026 (sin test.fail)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Hallazgos del Inspector (25/09/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // HALLAZGO [medio] (Inspector 25/09/2026): 3 de los 10 «fragmentos representativos», entre
  // comillas y con autor, obra y año, NO son el texto de la obra. REPARADO: los tres son ahora
  // texto real (o traducción fiel, declarada bajo la cita) y dicen dónde están en la obra.
  test('los fragmentos entre comillas son el texto de la obra (Bécquer, Zola, Voltaire)', async ({ page }) => {
    await tarjeta(page, 'Romanticismo').click();
    const becquer = await leerDetalle(page);
    // Ni el final inventado ni el poema que no es de las Rimas de 1871 (ver cabecera)
    expect(becquer.fragmento).not.toContain('nunca te olvidaré');
    expect(becquer.fragmento).not.toContain('Podrá nublarse');
    // Rima XXI (es.wikisource, Obras t. III, 1885, p. 159): «¿Qué es poesía? dices mientras
    // clavas / En mi pupila tu pupila azul; / ¿Qué es poesía? ¿Y tú me lo preguntas? / Poesía... eres tú.»
    expect(becquer.fragmento).toBe(
      '«¿Qué es poesía?, dices mientras clavas / en mi pupila tu pupila azul; / ¿Qué es poesía? ¿Y tú me lo preguntas? / Poesía… eres tú.»',
    );
    expect(becquer.atribucion).toBe('— Gustavo Adolfo Bécquer, Rimas (1871)');
    await expect(page.locator('[class*="fragmentoNota"]')).toHaveText('Rima XXI.');
    await volverAlListado(page);

    await tarjeta(page, 'Naturalismo').click();
    // «Germinal brotaba» no está en la novela: el final es «Des hommes poussaient, une armée
    // noire, vengeresse, qui germait lentement dans les sillons…» (fr.wikisource, VII, 6)
    const zola = (await leerDetalle(page)).fragmento;
    expect(zola).not.toContain('Germinal brotaba');
    expect(zola).toContain('Brotaban hombres, un ejército negro, vengador, que germinaba lentamente en los surcos');
    await expect(page.locator('[class*="fragmentoNota"]')).toContainText('original en francés');
    await volverAlListado(page);

    await tarjeta(page, 'Neoclasicismo').click();
    // Cap. 1 (fr.wikisource, Garnier 1877): «…dans ce meilleur des mondes possibles, le château
    // de monseigneur le baron était le plus beau des châteaux…»
    const voltaire = (await leerDetalle(page)).fragmento;
    expect(voltaire).not.toContain('con la fe sencilla');
    expect(voltaire).toContain('en este mejor de los mundos posibles, el castillo del señor barón era el más bello de los castillos');
  });

  // HALLAZGO [medio] (Inspector 25/09/2026): cada movimiento tiene UNA región y UN periodo de
  // filtro, pero la tarjeta enseña varios: el filtro esconde lo que la propia tarjeta rotula.
  test('el filtro de región incluye los movimientos cuya tarjeta lleva esa región', async ({ page }) => {
    // Premisa: la tarjeta de Naturalismo lleva la insignia «EEUU»
    await expect(tarjetaEntera(page, 'Naturalismo').locator('[class*="regionBadge"]', { hasText: 'EEUU' })).toHaveCount(1);
    await filtrar(page, 'Todos', 'EEUU');
    // Esperado: Naturalismo y Generación Beat · antes: solo Generación Beat
    expect(await nombresEnParrilla(page)).toContain('Naturalismo');
    expect(await nombresEnParrilla(page)).toContain('Generación Beat');
    // Modernismo rotula «España» → sale con Europa; Vanguardias (Huidobro, Neruda) → América Latina
    await filtrar(page, 'Todos', 'Europa');
    expect(await nombresEnParrilla(page)).toContain('Modernismo');
    await filtrar(page, 'Todos', 'América Latina');
    expect(await nombresEnParrilla(page)).toContain('Vanguardias');
    // Modernismo (s.XIX–XX) sale con S.XIX; Posmoderna (s.XX–XXI) sale con S.XX
    await filtrar(page, 'S.XIX', 'Todas las regiones');
    expect(await nombresEnParrilla(page)).toContain('Modernismo');
    await filtrar(page, 'S.XX', 'Todas las regiones');
    expect(await nombresEnParrilla(page)).toContain('Literatura Posmoderna');

    // Invariante general: cada insignia de región de cada tarjeta sobrevive a su propio filtro
    await filtrar(page, 'Todos', 'Todas las regiones');
    const rotulos = await page.locator('[class*="movimientoCard"]').evaluateAll((cards) =>
      cards.map((c) => ({
        nombre: (c.querySelector('h2')?.textContent ?? '').trim(),
        regiones: Array.from(c.querySelectorAll('[class*="regionBadge"]')).map((b) => (b.textContent ?? '').trim()),
      })),
    );
    const filtroDe: Record<string, string> = { Europa: 'Europa', España: 'Europa', 'América Latina': 'América Latina', EEUU: 'EEUU' };
    for (const { nombre, regiones } of rotulos) {
      for (const r of regiones) {
        expect(filtroDe[r], `insignia sin filtro: ${r}`).toBeDefined();
        await filtrar(page, 'Todos', filtroDe[r]);
        expect(await nombresEnParrilla(page), `${nombre} con ${r}`).toContain(nombre);
      }
    }
  });

  test.describe('en un móvil de 360 px', () => {
    test.use({ ...MOVIL });

    // HALLAZGO [medio] (Inspector 25/09/2026): al elegir un movimiento de la parte baja de la
    // parrilla, la página conserva el desplazamiento y se aterriza a mitad del detalle.
    test('al elegir el último movimiento, su cabecera queda a la vista', async ({ page }) => {
      await tarjeta(page, 'Literatura Posmoderna').click();
      await expect(page.locator('[class*="detalleNombre"]')).toHaveText('Literatura Posmoderna');
      // Antes de la reparación: scrollY 1681 y la cabecera 1165 px por encima del borde; se veía
      // «El nombre de la rosa». REPARADO (verificado el 27/09/2026 a 393 px: cabecera a 234 px)
      await expect(page.locator('[class*="detalleNombre"]')).toBeInViewport({ timeout: 2000 });
    });

    // HALLAZGO [bajo] (Inspector 25/09/2026): el contenido va pegado a los bordes (la clase
    // `.main` —max-width 1200 px, padding 1,25-2 rem— está definida y no se aplica) y el botón
    // inferior «← Volver al listado» sale sin estilo (lleva el modificador sin la base).
    test('el listado deja margen lateral y los dos botones de volver comparten estilo', async ({ page }) => {
      await tarjeta(page, 'Realismo').click();
      await leerDetalle(page);
      const radio = await page.locator('[class*="btnVolverBottom"]').evaluate((b) => getComputedStyle(b).borderTopLeftRadius);
      // .btnVolver: border-radius 8px; antes de la reparación el de abajo heredaba el del navegador
      expect(radio).toBe('8px');
      await volverAlListado(page);
      const x = await page.locator('[class*="filtros"]').evaluate((e) => e.getBoundingClientRect().x);
      expect(x).toBeGreaterThanOrEqual(16);
    });
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): el foco se pierde en <body> al abrir y al cerrar
  // un movimiento, y el aviso de «sin resultados» no se anuncia (sin role="status").
  test('el foco acompaña al cambio de vista y el vacío se anuncia', async ({ page }) => {
    await tarjeta(page, 'Realismo').focus();
    await page.keyboard.press('Enter');
    await leerDetalle(page);
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
    await botonVolverArriba(page).focus();
    await page.keyboard.press('Enter');
    await expect(tarjeta(page, 'Realismo')).toBeFocused();
    await filtrar(page, 'S.XVII–XVIII', 'América Latina');
    await expect(page.getByRole('status').filter({ hasText: 'No hay movimientos' })).toHaveCount(1);
  });

  // HALLAZGO [medio] (Inspector 25/09/2026): en oscuro, el filtro ACTIVO pone el gris
  // --text-secondary sobre el azul --primary: 1,29:1. `[data-theme='dark'] .filtroBtn`
  // (0,2,0) gana al `color: white` de `.filtroBtnActivo` (0,1,0).
  test('en tema oscuro el filtro activo se lee (≥ 4,5:1)', async ({ page }) => {
    await activarTema(page, 'dark');
    const c = await peorContraste(page, '[class*="filtroBtnActivo"]');
    expect(c?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
    // Reparación (25/09/2026): lo que se cambió en claro se mide también en oscuro
    const fallos: string[] = [];
    const anotar = (donde: string, r: { ratio: number } | null): void => {
      if (!r || r.ratio < 4.5) fallos.push(`${donde} ${r?.ratio ?? 'sin medir'}`);
    };
    anotar('insignia de región', await peorContraste(page, '[class*="regionBadge"]'));
    for (const m of ['Neoclasicismo', 'Vanguardias', 'Literatura Posmoderna']) {
      await tarjeta(page, m).click();
      await leerDetalle(page);
      anotar(`${m} · periodo`, await peorContraste(page, '[class*="detallePeriodo"]'));
      anotar(`${m} · región`, await peorContraste(page, '[class*="detalleRegion"]'));
      anotar(`${m} · etiqueta de obra`, await peorContraste(page, '[class*="obraTag"]'));
      await volverAlListado(page);
    }
    await abrirGuia(page);
    anotar('número de paso', await peorContraste(page, '[class*="stepNumber"]'));
    expect(fallos).toEqual([]);
  });

  // HALLAZGO [medio] (Inspector 25/09/2026): texto pequeño por debajo de 4,5:1 en claro. Lo
  // peor es el periodo y la región de la cabecera del detalle sobre el color del movimiento
  // (8 de 10), justo el dato de fechas: Vanguardias y Posmoderna 2,94:1 / 2,41-2,44:1.
  test('el texto pequeño cumple 4,5:1 en tema claro', async ({ page }) => {
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
    // Re-inspección 27/09/2026: también «60s» y «los '60», y sobre TODO el texto visible
    const calco = /\b\d{2,4}s\b|\blos \d{4}\b|\blos '\d{2}\b/g;
    // JSON-LD: ya pasaba («los años 60-70» es forma admitida por la RAE)
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld.match(calco) ?? []).toEqual([]);
    await abrirGuia(page);
    // Antes de la reparación: ['los 1940', '1940s', '1950s', '1960s'] (FAQ de Borges, de las
    // fechas y de la Beat). REPARADO: «los años cuarenta», «años cincuenta», «años sesenta»
    expect((await textoGuia(page)).match(calco) ?? []).toEqual([]);
    expect((await page.locator('body').innerText()).match(calco) ?? []).toEqual([]);
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): el JSON-LD llama «Modernismo» a Joyce, Woolf y
  // Faulkner, justo la confusión contra la que advierte la FAQ de la página; y la página
  // describe el Modernism anglosajón como «concienciación social» (es monólogo interior).
  test('Modernismo y Modernism no se confunden entre la página y el JSON-LD', async ({ page }) => {
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld).not.toContain('Modernismo (Joyce');
    await abrirGuia(page);
    expect(await textoGuia(page)).not.toContain('concienciación social');
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): dos datos falsos en la guía.
  test('la guía no sitúa El coronel (1961) en el XIX ni a Darío en París en 1890', async ({ page }) => {
    await abrirGuia(page);
    const texto = await textoGuia(page);
    expect(texto).not.toMatch(/Para el XIX:\s*El coronel no tiene quien le escriba/);
    // Instituto Cervantes: «Entre 1889 y 1893 vive en varios países de Centroamérica»
    expect(texto).not.toMatch(/en 1890 coexistían en París[^.]*Darío/);
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): Ferlinghetti no tiene ningún «Un jardín de luz
  // solar»; su libro de 1958 es «Un Coney Island de la mente»; y «El «prosa espontánea»».
  test('Generación Beat: obras de Ferlinghetti reales y concordancia del rasgo de Kerouac', async ({ page }) => {
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
    await abrirGuia(page);
    const texto = await textoGuia(page);
    expect(texto).not.toContain('selectividad');
    expect(texto).not.toContain('exámenes españoles');
    expect(texto).not.toContain('conformidad americana');
  });

  // HALLAZGO [bajo] (Inspector 25/09/2026): §1.quinquies — comparar a los hippies con el
  // nazismo como recurso decorativo en una guía de literatura.
  test('la guía no usa el nazismo como analogía decorativa', async ({ page }) => {
    await abrirGuia(page);
    expect(await textoGuia(page)).not.toContain('nazismo');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN (27/09/2026) — casos nuevos y hallazgos que quedan abiertos
// ════════════════════════════════════════════════════════════════════════════

/**
 * ¿Pisa alguna pieza de la barra fija de MeskeiaLogo las LETRAS del <h1>? Misma medida que
 * `tituloTapado` de scripts/ronda.mjs: cajas del texto (Range.getClientRects), no la del h1.
 */
async function tituloTapadoPorLogo(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const barra = Array.from(document.querySelectorAll('body *')).find((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return cs.position === 'fixed' && r.top <= 1 && r.height < 120 && r.width > 300 && e.querySelector('a[href="/"]');
    });
    const h1 = document.querySelector('h1');
    if (!barra || !h1) throw new Error('Sin barra del logo o sin <h1>: la medida no vale');
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    const letras = Array.from(rango.getClientRects()).filter((c) => c.width > 0);
    const piezas = Array.from(barra.children).map((c) => c.getBoundingClientRect()).filter((c) => c.width > 0);
    return piezas.some((p) => letras.some((c) => !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom)));
  });
}

/** Borde inferior de la barra fija del logo (lo que tape por encima de esa línea no se ve). */
async function bordeBarraLogo(page: Page): Promise<number> {
  return page.locator('[class*="headerBar"]').evaluate((b) =>
    Math.max(...Array.from(b.children).map((c) => c.getBoundingClientRect().bottom)),
  );
}

test.describe('Re-inspección (27/09/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // CASO NORMAL — resuelto a mano con `periodos` y `regiones` de cada movimiento en page.tsx
  test('S.XX + América Latina y S.XIX + EEUU dejan justo los movimientos que les tocan', async ({ page }) => {
    await filtrar(page, 'S.XX', 'América Latina');
    // Modernismo ['sxix','sxx'] + latam · Vanguardias ['sxx'] + latam · Boom ['sxx'] + latam ·
    // Posmoderna ['sxx','contemporaneo'] + latam. Fuera: Existencialismo (solo europa), Beat (eeuu)
    expect(await nombresEnParrilla(page)).toEqual(['Modernismo', 'Vanguardias', 'Boom Latinoamericano', 'Literatura Posmoderna']);
    await filtrar(page, 'S.XIX', 'EEUU');
    // Romanticismo ['clasico','sxix'] + eeuu (Poe) · Naturalismo ['sxix'] + eeuu
    expect(await nombresEnParrilla(page)).toEqual(['Romanticismo', 'Naturalismo']);
    await filtrar(page, 'Contemporáneo', 'Europa');
    expect(await nombresEnParrilla(page)).toEqual(['Literatura Posmoderna']);
  });

  // S1b — los cinco fragmentos que la reparación de b1a0c6af no cotejó (fuentes en la cabecera)
  test('Darío y Huidobro: texto literal, obra y año de primera edición', async ({ page }) => {
    await tarjeta(page, 'Modernismo').click();
    let f = await leerDetalle(page);
    expect(f.periodo).toBe('1880–1920');
    expect(f.regiones).toEqual(['América Latina', 'España']);
    // es.wikisource «Yo soy aquel que ayer no más decía»: los cuatro primeros versos
    expect(f.fragmento).toBe(
      '«Yo soy aquel que ayer no más decía / el verso azul y la canción profana, / en cuya noche un ruiseñor había / que era alondra de luz por la mañana.»',
    );
    // Cantos de vida y esperanza: Madrid, Tipografía de la Revista de Archivos, 1905
    expect(f.atribucion).toBe('— Rubén Darío, Cantos de Vida y Esperanza (1905)');
    await volverAlListado(page);

    await tarjeta(page, 'Vanguardias').click();
    f = await leerDetalle(page);
    // Altazor, comienzo del Canto I (Gaceta UDG): «…en la puerta de tu sonrisa / Con la espada en la mano?»
    expect(f.fragmento).toBe(
      '«Altazor ¿por qué perdiste tu primera serenidad? / ¿Qué ángel malo se paró en la puerta de tu sonrisa / con la espada en la mano?»',
    );
    expect(f.atribucion).toBe('— Vicente Huidobro, Altazor (1931)');
  });

  test('Camus, Ginsberg y Calvino: traducción fiel, declarada como tal, con obra y año', async ({ page }) => {
    const nota = page.locator('[class*="fragmentoNota"]');

    await tarjeta(page, 'Existencialismo').click();
    let f = await leerDetalle(page);
    // «Aujourd'hui, maman est morte. Ou peut-être hier, je ne sais pas.» … «Mère décédée.
    // Enterrement demain. Sentiments distingués.» «Cela ne veut rien dire.»
    expect(f.fragmento).toContain('Hoy ha muerto mamá. O quizás ayer. No lo sé.');
    expect(f.fragmento).toContain('Entierro mañana.');
    expect(f.fragmento).toContain('Esto no quiere decir nada.');
    expect(f.atribucion).toBe('— Albert Camus, El extranjero (1942)');
    await expect(nota).toHaveText('Comienzo de la novela. Traducción al español del original en francés.');
    await volverAlListado(page);

    await tarjeta(page, 'Generación Beat').click();
    f = await leerDetalle(page);
    // «I saw the best minds of my generation destroyed by madness, starving hysterical naked, /
    // dragging themselves through the negro streets at dawn looking for an angry fix,»
    expect(f.fragmento).toContain('Vi las mejores mentes de mi generación destruidas por la locura');
    expect(f.fragmento).toContain('buscando una dosis furiosa');
    expect(f.atribucion).toBe('— Allen Ginsberg, Aullido (1956)');
    await expect(nota).toContainText('original en inglés');
    await volverAlListado(page);

    await tarjeta(page, 'Literatura Posmoderna').click();
    f = await leerDetalle(page);
    // «Stai per cominciare a leggere il nuovo romanzo … Rilassati. Raccogliti. Allontana da te
    // ogni altro pensiero.»
    expect(f.fragmento).toContain('Estás a punto de empezar a leer la nueva novela de Italo Calvino');
    expect(f.fragmento).toContain('Relájate.');
    expect(f.atribucion).toBe('— Italo Calvino, Si una noche de invierno un viajero (1979)');
    await expect(nota).toHaveText('Comienzo de la novela. Traducción al español del original en italiano.');
  });

  // Regresión de 586a4d61 (logo fijo sobre el título) a los cuatro anchos pedidos
  test('el logo fijo no tapa el <h1> a 360, 768, 1024 ni 1280 px', async ({ page }) => {
    for (const [ancho, alto] of [[360, 740], [768, 1024], [1024, 768], [1280, 900]]) {
      await page.setViewportSize({ width: ancho, height: alto });
      // Medido el 27/09/2026: a 360 y 768 el título empieza en y = 79 (logo hasta 52); a 1024
      // y 1280 empieza en x = 220 y 348 (logo hasta x = 203)
      await expect.poll(() => tituloTapadoPorLogo(page), { message: `a ${ancho} px` }).toBe(false);
    }
  });

  // HALLAZGO [bajo] (Inspector 27/09/2026, id 2312) — REPARADO 27/09/2026: entre 769 y 989 px
  // (iPad en vertical: 810, 820, 834 px) el logo tapaba el 📚 y la «E» de «Estilos». 586a4d61
  // daba 80 px al hero solo hasta 768 px; por encima volvían los 48 px de `.hero` y el logo, ya
  // grande, llega a x = 203 y y = 77, mientras el título centrado empezaba en x = 93-198 y y = 47.
  // Se aplica el mismo bloque que 3de36a1f: 100 px de relleno arriba entre 769 y 1439 px.
  test('el logo fijo tampoco tapa el <h1> en tableta vertical (769-980 px)', async ({ page }) => {
    for (const ancho of [769, 800, 834, 900, 980]) {
      await page.setViewportSize({ width: ancho, height: 1100 });
      await expect.poll(() => tituloTapadoPorLogo(page), { message: `a ${ancho} px`, timeout: 2000 }).toBe(false);
    }
  });

  // S1a · HALLAZGO [bajo] (Inspector 27/09/2026, id 2311) — REPARADO 27/09/2026: WCAG 2.5.3
  // (Label in Name). El botón de arriba enseñaba «← Todos los movimientos» y su aria-label era
  // «Volver al listado»: quien lo maneja por voz diciendo lo que lee no lo encontraba. Se quita
  // el aria-label (el texto basta) y la flecha va en aria-hidden, también en el botón de abajo.
  test('el nombre accesible del botón de arriba contiene su texto visible', async ({ page }) => {
    await tarjeta(page, 'Realismo').click();
    await leerDetalle(page);
    const visible = (await botonVolverArriba(page).innerText()).replace(/^←\s*/, '').trim();
    expect(visible).toBe('Todos los movimientos');
    // Antes: 0 botones cuyo nombre contuviera «Todos los movimientos»
    await expect(page.getByRole('button', { name: visible })).toHaveCount(1);
    // Y la flecha no se lee: el nombre es exactamente el texto
    await expect(page.getByRole('button', { name: 'Todos los movimientos', exact: true })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Volver al listado', exact: true })).toHaveCount(1);
  });

  // HALLAZGO [bajo] (Inspector 27/09/2026, id 2313) — REPARADO 27/09/2026: la tercera obra de
  // Kerouac se rotulaba «El dharma de los vagabundos», título sin edición en español. The Dharma
  // Bums (1958) es «Los vagabundos del Dharma» (Anagrama, trad. Mariano Antolín Rato). Misma
  // clase que el 1890. Revisada de paso la Beat con el mismo criterio: Nova Express de Burroughs
  // se publica en español como «Expreso Nova» (Minotauro, trad. Enrique Pezzoni, 1972).
  test('Generación Beat: la obra de Kerouac lleva su título en español', async ({ page }) => {
    await tarjeta(page, 'Generación Beat').click();
    const kerouac = (await leerDetalle(page)).autores.find((a) => a.nombre === 'Jack Kerouac');
    // Antes: ['En el camino', 'Los subterráneos', 'El dharma de los vagabundos']
    expect(kerouac?.obras).toEqual(['En el camino', 'Los subterráneos', 'Los vagabundos del Dharma']);
    const burroughs = (await leerDetalle(page)).autores.find((a) => a.nombre === 'William S. Burroughs');
    expect(burroughs?.obras).toEqual(['El almuerzo desnudo', 'Expreso Nova', 'Queer']);
  });

  // HALLAZGO [medio] (Inspector 27/09/2026, id 2310) — REPARADO 27/09/2026: en oscuro, el título
  // del recuadro «Errores frecuentes al estudiar literatura» (h3, 14,7 px negrita: texto normal,
  // exige 4,5:1) mantenía el rojo literal #c0392b de claro sobre el fondo oscuro: 2,21:1. Ahora
  // `[data-theme='dark'] .warningHeader h3` toma #f1948a, y también el aspa «✗» de cada error
  // (::before), que tenía el mismo rojo. En claro no cambia (5,1:1).
  test('en tema oscuro el título del recuadro de errores se lee (≥ 4,5:1)', async ({ page }) => {
    await activarTema(page, 'dark');
    await abrirGuia(page);
    // El tema oscuro está aplicado de verdad: el recuadro toma su fondo de `[data-theme='dark'] .warningBox`
    await expect(page.locator('[class*="warningBox"]')).toHaveCSS('background-color', 'rgba(231, 76, 60, 0.1)');
    const c = await peorContraste(page, '[class*="warningHeader"] h3');
    // peorContraste recorta el texto a 40 caracteres
    expect(c?.texto).toBe('Errores frecuentes al estudiar literatura'.slice(0, 40));
    // Antes: 2,21
    expect(c?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
    // El aspa de cada error comparte el color del título (que ya da ≥ 4,5:1, luego ≥ 3:1 de gráfico)
    const colores = await page.locator('[class*="warningBox"]').evaluate((box) => ({
      h3: getComputedStyle(box.querySelector('h3') as Element).color,
      aspa: getComputedStyle(box.querySelector('li') as Element, '::before').color,
    }));
    expect(colores.aspa).toBe(colores.h3);
  });

  test.describe('en un móvil de 393 × 851', () => {
    test.use({
      viewport: { width: 393, height: 851 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true,
    });

    // CASO LÍMITE — el último de la parrilla, abierto desde el fondo de la página y cerrado
    // con el botón de abajo: la vista y el foco no pueden quedar bajo la barra fija del logo
    test('el último movimiento: se abre con la cabecera a la vista y al volver su tarjeta queda visible', async ({ page }) => {
      const ultimo = tarjeta(page, 'Literatura Posmoderna');
      await ultimo.scrollIntoViewIfNeeded();
      await ultimo.click();
      await expect(page.locator('[class*="detalleNombre"]')).toHaveText('Literatura Posmoderna');
      await expect(page.locator('[class*="detalleNombre"]')).toBeInViewport();
      const barra = await bordeBarraLogo(page);
      // Medido el 27/09/2026: barra hasta 52 px; «← Todos los movimientos» empieza en 96 px
      // (scroll-margin-top: 6rem de .detalle)
      const arriba = await botonVolverArriba(page).evaluate((b) => b.getBoundingClientRect().top);
      expect(arriba).toBeGreaterThanOrEqual(barra);

      const abajo = page.locator('[class*="btnVolverBottom"]');
      await abajo.scrollIntoViewIfNeeded();
      await abajo.click();
      await expect(ultimo).toBeFocused();
      await expect(ultimo).toBeInViewport();
      const top = await ultimo.evaluate((b) => b.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(barra);
    });
  });
});
