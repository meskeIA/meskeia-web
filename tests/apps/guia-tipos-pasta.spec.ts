import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — guia-tipos-pasta (segmento interactiva, Coquinum «ingredientes-despensa»)
 *
 * Primera inspección: 18/11/2026 (Opus 5.5), en la copia del Inspector contra `next start`.
 *
 * QUÉ PROMETE
 *   <h1> «Guía de Tipos de Pasta — tradición italiana» y subtítulo: «40 formas de pasta con su
 *   región, tiempo de cocción y salsa ideal». No calcula nada: la verdad comprobable es (a) que
 *   los cuatro filtros y el buscador devuelvan EXACTAMENTE su conjunto, (b) que fichas, tabla
 *   educativa, consejos y FAQPage no se contradigan, y (c) el contenido (CLAUDE.md §1.quinquies).
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/guia-tipos-pasta/page.tsx — array `pastas` (40 literales). El filtrado es
 *   `pastasFiltradas`: cuatro igualdades exactas (forma, región, salsa ∈ salsasIdeales,
 *   dificultad) y un `includes` normalizado SIN tildes (`normalizarBusqueda`) sobre nombre,
 *   nombreOriginal, salsas, platos, descripción y origen. NO busca en `region` ni en `curiosidad`.
 *   Los conjuntos de abajo se contaron leyendo ese array ANTES de abrir la app.
 *
 * CONJUNTOS ESPERADOS (40 fichas)
 *   Forma ...... Larga 10 · Corta 14 · Rellena 5 · Lámina 2 · Sopa 4 · Especial 5 (Gnocchi es
 *                «Especial» aunque el comentario del código lo cuente entre las 15 cortas)
 *   Región ..... Norte 15 · Centro 8 · Sur 10 · Sicilia/Cerdeña 4 · Internacional 3
 *                (Linguine pasó de Sur a Norte al reparar el hallazgo 1, 18/11/2026)
 *   Dificultad . Fácil 12 · Media 9 · Avanzada 19
 *   Larga + Pesto ......... 1 (Linguine)
 *   Rellena + Norte ....... 5 (las cinco rellenas son del Norte)
 *   Lámina + Sur .......... 0 (Lasagna es Norte y Cannelloni Centro)
 *   Sopa + Mar ............ 0 (las cuatro de sopa: Caldo, Tomate, Pesto o Mantequilla)
 *   «toscana» ............. 3 (origen de Pappardelle, Pici y Strozzapreti)
 *   «spatzle» sin diéresis  1 (Spätzle)
 *
 * HALLAZGOS ABIERTOS (cada uno con su test `test.fail()` al final; al repararlo, ese test pasa,
 * `test.fail` lo pone en rojo y hay que convertirlo en un test normal y marcarlo REPARADO)
 *   REPARADOS el 18/11/2026: 1, 3, 4 y 7.
 *   1. Linguine en «Sur» con origen «Génova/Liguria»; Capellini, mismo origen, en «Norte».
 *   2. «Internacional» agrupa tres pastas cuyo origen es «Italia»; Spätzle y Couscous, no italianas,
 *      van en regiones italianas.
 *   3. El consejo «pasta larga + salsa lisa… por eso el ragù va con tagliatelle» y la primera
 *      respuesta del FAQPage contradicen la tabla y las fichas (pasta larga plana → Carne).
 *   4. FAQPage: «la pasta fresca suele estar lista en 2-4 minutos»; la página da 4-6, 5-7, 6-8 y
 *      10-12 min (fresca) y la tabla 4-7 y 3-6. Y dice «angel hair» donde la ficha dice
 *      «Cabello de ángel».
 *   5. FAQPage: promete «tiempo de cocción exacto» (la página da rangos) y pregunta por la
 *      «carbonara auténtica» (§1.quinquies 6).
 *   6. `features` del JSON-LD vacía.
 *   7. El buscador no encuentra ninguna pasta por su nombre en español (macarrones, espaguetis,
 *      ñoquis, lasaña, canelones): «No hay pastas que coincidan».
 *   8. El buscador promete «región» y no busca en ella: «centro» da Farfalle (Norte).
 *   9. El contador «Mostrando N de 40» y el estado vacío no son región viva.
 *  10. Las píldoras de «Salsas ideales» dan 4,485:1 en claro (13,1 px, 600): por debajo de 4,5:1.
 *  11. Erratas: «muzzarella», «mantéca», «del 'escudella' navideño», «Trápani» y «Trapani».
 *  12. Afirmaciones sin fuente presentadas como hechos (Mafalda 1900, Kraft 2003, «DOP boloñesa»,
 *      pici etruscos, «la más fina del mundo», «la más consumida del mundo», el ingeniero).
 *  13. La dificultad: el bloque educativo manda al principiante a spaghetti y fusilli («Media»)
 *      y, como paso siguiente, a conchiglie («Fácil»); la escala no se explica en ningún sitio.
 */

const RUTA = '/guia-tipos-pasta/';
const BUSCADOR = 'input[aria-label="Buscar pasta"]';
const TOTAL = 40;

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Un clic en un filtro antes de la hidratación se pierde: el buscador hace de testigo.
  await esperarHidratacion(page, [BUSCADOR]);
}

const fichas = (page: Page) => page.locator('article h2');
const contador = (page: Page) => page.locator('p').filter({ hasText: /^Mostrando/ }).first();
const ficha = (page: Page, nombre: string) =>
  page.locator('article').filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });

async function pulsar(page: Page, grupo: string, opcion: string): Promise<void> {
  const boton = page.getByRole('group', { name: grupo }).getByRole('button', { name: opcion, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function buscar(page: Page, texto: string): Promise<void> {
  await page.locator(BUSCADOR).fill(texto);
  await esperarValorEnReact(page, BUSCADOR, texto);
}

/** «Nombre → Origen» de cada ficha visible, en el orden del array. */
async function origenes(page: Page): Promise<string[]> {
  return page.locator('article').evaluateAll((arts) =>
    arts.map((a) => {
      const spans = Array.from(a.querySelectorAll('span')).map((s) => s.textContent ?? '');
      const i = spans.indexOf('Origen:');
      return `${a.querySelector('h2')?.textContent ?? ''} → ${spans[i + 1] ?? ''}`;
    }),
  );
}

interface Pregunta {
  q: string;
  a: string;
}

async function leerFaqPage(page: Page): Promise<Pregunta[]> {
  return page.evaluate(() => {
    const salida: { q: string; a: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      if (j['@type'] !== 'FAQPage') continue;
      for (const m of j.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
        salida.push({ q: m.name, a: m.acceptedAnswer.text });
      }
    }
    return salida;
  });
}

async function textoDeLaPagina(page: Page): Promise<string> {
  // Incluye el bloque educativo plegado: su contenido está montado, solo oculto.
  return page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return (clon.textContent ?? '').replace(/\s+/g, ' ');
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (normal, escritorio) — los filtros devuelven su conjunto exacto
// ═══════════════════════════════════════════════════════════════════════════
test.describe('los filtros devuelven exactamente su conjunto', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 — Larga da 10, Larga+Pesto solo Linguine, Rellena+Norte las 5; limpiar vuelve a 40', async ({
    page,
  }) => {
    await expect(contador(page)).toHaveText(`Mostrando ${TOTAL} de ${TOTAL} tipos de pasta`);
    await expect(fichas(page)).toHaveCount(TOTAL);
    // El subtítulo promete 40 y el array tiene 40.
    await expect(page.getByText(/^40 formas de pasta con su región/)).toBeVisible();

    // Las 10 entradas con forma 'Larga' del array, en su orden.
    await pulsar(page, 'Forma', 'Larga');
    await expect(fichas(page)).toHaveText([
      'Spaghetti',
      'Linguine',
      'Tagliatelle',
      'Fettuccine',
      'Pappardelle',
      'Bucatini',
      'Capellini / Cabello de ángel',
      'Vermicelli',
      'Pici',
      'Mafaldine / Reginette',
    ]);
    await expect(contador(page)).toHaveText(`Mostrando 10 de ${TOTAL} tipos de pasta`);
    // El botón «Todas» del mismo grupo deja de estar pulsado.
    await expect(
      page.getByRole('group', { name: 'Forma' }).getByRole('button', { name: 'Todas', exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');

    // De las 10 largas, solo Linguine lleva Pesto entre sus salsas ideales.
    await pulsar(page, 'Salsa ideal', 'Pesto');
    await expect(fichas(page)).toHaveText(['Linguine']);

    // Limpiar es un botón de ACCIÓN: sin aria-pressed, y se retira cuando no queda filtro.
    const limpiar = page.getByRole('button', { name: 'Limpiar filtros' }).first();
    await expect(limpiar).toHaveAttribute('type', 'button');
    expect(await limpiar.getAttribute('aria-pressed')).toBeNull();
    await limpiar.click();
    await expect(fichas(page)).toHaveCount(TOTAL);
    await expect(page.getByRole('button', { name: 'Limpiar filtros' })).toHaveCount(0);

    // Las cinco rellenas son todas del Norte.
    await pulsar(page, 'Forma', 'Rellena');
    await pulsar(page, 'Región', 'Norte');
    await expect(fichas(page)).toHaveText([
      'Ravioli',
      'Tortellini',
      'Tortelli / Mezzelune',
      'Cappelletti',
      'Agnolotti',
    ]);
    await pulsar(page, 'Región', 'Todas');

    // Corta 14 y Especial 5: Gnocchi está en «Especial».
    await pulsar(page, 'Forma', 'Corta');
    await expect(fichas(page)).toHaveCount(14);
    await expect(page.getByRole('heading', { name: 'Gnocchi', exact: true })).toHaveCount(0);
    await pulsar(page, 'Forma', 'Especial');
    await expect(fichas(page)).toHaveText(['Gnocchi', 'Spätzle', 'Couscous', 'Fregola', 'Pizzoccheri']);
    await pulsar(page, 'Forma', 'Todas');

    // Dificultad: 12 + 9 + 19 = 40.
    await pulsar(page, 'Dificultad casera', 'Fácil');
    await expect(fichas(page)).toHaveCount(12);
    await pulsar(page, 'Dificultad casera', 'Media');
    await expect(fichas(page)).toHaveCount(9);
    await pulsar(page, 'Dificultad casera', 'Avanzada');
    await expect(fichas(page)).toHaveCount(19);
    await pulsar(page, 'Dificultad casera', 'Todas');

    // Buscador: «toscana» casa con el origen de tres fichas; sin diéresis encuentra Spätzle;
    // en mayúsculas, Lasagna; por plato, Ditalini.
    await buscar(page, 'toscana');
    await expect(fichas(page)).toHaveText(['Pappardelle', 'Pici', 'Strozzapreti']);
    await buscar(page, 'spatzle');
    await expect(fichas(page)).toHaveText(['Spätzle']);
    await buscar(page, 'LASAGNA');
    await expect(fichas(page)).toHaveText(['Lasagna']);
    await buscar(page, 'pasta e fagioli');
    await expect(fichas(page)).toHaveText(['Ditalini']);
  });

  test('CASO 1.bis — las regiones de las fichas (control de los hallazgos 1 y 2)', async ({
    page,
  }) => {
    await pulsar(page, 'Región', 'Sur');
    await expect(fichas(page)).toHaveCount(10);
    // REPARADO (hallazgo 1, 18/11/2026): Linguine, de origen ligur, ya no está en el Sur.
    expect(await origenes(page)).not.toContain('Linguine → Génova/Liguria');
    await pulsar(page, 'Región', 'Norte');
    await expect(fichas(page)).toHaveCount(15);
    expect(await origenes(page)).toContain('Linguine → Génova/Liguria');
    expect(await origenes(page)).toContain('Capellini / Cabello de ángel → Génova/Liguria');
    expect(await origenes(page)).toContain('Trofie → Liguria');
    await pulsar(page, 'Región', 'Internacional');
    expect(await origenes(page)).toEqual([
      'Radiatore → Italia (siglo XX)',
      'Pastina / Stelline → Italia',
      'Orzo / Risoni → Italia/Mediterráneo',
    ]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 (límite, móvil Pixel 7) — la combinación vacía y todas las opciones
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en móvil (Pixel 7): combinación sin resultados y opciones que devuelven algo', () => {
  // Se enumeran las opciones: `...devices['Pixel 7']` trae defaultBrowserType y no vale en un describe.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 2 — Lámina+Sur y Sopa+Mar dan 0 y lo dicen; ninguna opción suelta da 0; sin desbordar', async ({
    page,
  }) => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

    await pulsar(page, 'Forma', 'Lámina');
    await expect(fichas(page)).toHaveText(['Lasagna', 'Cannelloni']);
    await pulsar(page, 'Región', 'Sur');
    await expect(fichas(page)).toHaveCount(0);
    await expect(page.getByText('No hay pastas que coincidan con los filtros seleccionados.')).toBeVisible();
    await expect(contador(page)).toHaveText(`Mostrando 0 de ${TOTAL} tipos de pasta`);
    // El «Limpiar filtros» del estado vacío (el segundo) devuelve las 40.
    await page.getByRole('button', { name: 'Limpiar filtros' }).last().click();
    await expect(fichas(page)).toHaveCount(TOTAL);

    await pulsar(page, 'Forma', 'Sopa');
    await expect(fichas(page)).toHaveCount(4);
    await pulsar(page, 'Salsa ideal', 'Mar');
    await expect(fichas(page)).toHaveCount(0);
    await page.getByRole('button', { name: 'Limpiar filtros' }).first().click();

    await buscar(page, 'zzz');
    await expect(fichas(page)).toHaveCount(0);
    await expect(page.getByText('No hay pastas que coincidan con los filtros seleccionados.')).toBeVisible();
    await buscar(page, '');

    // Toda opción suelta de cada grupo devuelve al menos una ficha.
    const grupos: Record<string, string[]> = {
      Forma: ['Larga', 'Corta', 'Rellena', 'Lámina', 'Sopa', 'Especial'],
      Región: ['Norte', 'Centro', 'Sur', 'Sicilia/Cerdeña', 'Internacional'],
      'Salsa ideal': ['Tomate', 'Carne', 'Crema', 'Aceite-ajo', 'Pesto', 'Mar', 'Caldo', 'Mantequilla'],
      'Dificultad casera': ['Fácil', 'Media', 'Avanzada'],
    };
    for (const [grupo, opciones] of Object.entries(grupos)) {
      for (const opcion of opciones) {
        await pulsar(page, grupo, opcion);
        await expect(contador(page), `«${grupo} = ${opcion}» no devuelve nada`).not.toHaveText(
          `Mostrando 0 de ${TOTAL} tipos de pasta`,
        );
      }
      await pulsar(page, grupo, 'Todas');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 (operativa del buscador y coherencia de contenidos) — controles que pasan
// ═══════════════════════════════════════════════════════════════════════════
test.describe('contenido: lo que la página dice hoy (controles de los hallazgos 3 y 4)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 3 — tiempos de pasta fresca en fichas y tabla; la tabla empareja pasta larga plana con carne', async ({
    page,
  }) => {
    await expect(ficha(page, 'Tagliatelle')).toContainText('4-6 min (fresca)');
    await expect(ficha(page, 'Pappardelle')).toContainText('5-7 min (fresca)');
    await expect(ficha(page, 'Pici')).toContainText('6-8 min (fresca)');
    await expect(ficha(page, 'Orecchiette')).toContainText('10-12 min (fresca)');
    await expect(ficha(page, 'Tagliatelle')).toContainText('Carne');
    await expect(ficha(page, 'Pappardelle')).toContainText('Carne');

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tabla = page.getByRole('table');
    await expect(tabla.getByRole('row').filter({ hasText: 'Pasta larga plana' })).toContainText(
      'Carne, mantequilla, crema',
    );
    await expect(tabla.getByRole('row').filter({ hasText: 'Pasta larga plana' })).toContainText('4-7 min (fresca)');
    await expect(tabla.getByRole('row').filter({ hasText: 'Pasta rellena' })).toContainText('3-6 min (fresca)');
    // El buscador es un input de búsqueda con nombre accesible.
    await expect(page.getByRole('searchbox', { name: 'Buscar pasta' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — cada test afirma el comportamiento CORRECTO y hoy falla
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos abiertos (18/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // REPARADO (hallazgo 1, 18/11/2026) — Región «Sur» listaba Linguine con origen «Génova/Liguria»,
  // mientras Capellini (mismo origen) y Trofie (Liguria) iban en «Norte». Ahora Linguine es Norte.
  test('REPARADO 1 — Linguine (Génova/Liguria) está en Norte, como Capellini y Trofie', async ({ page }) => {
    await pulsar(page, 'Región', 'Norte');
    await expect(fichas(page)).toContainText(['Linguine'], { timeout: 2000 });
  });

  // ABIERTO (hallazgo 2) — «Internacional» = Radiatore, Pastina y Orzo, todas con origen «Italia».
  test.fail('ABIERTO 2 — ninguna ficha de «Internacional» tiene origen «Italia…»', async ({ page }) => {
    await pulsar(page, 'Región', 'Internacional');
    const italianas = (await origenes(page)).filter((o) => / → Italia/.test(o));
    expect(italianas).toEqual([]);
  });

  // REPARADO (hallazgo 3, 18/11/2026) — el consejo y el FAQPage decían «pasta larga + salsa lisa»
  // y ponían de ejemplo el ragù (salsa con tropezones de carne) con tagliatelle; la tabla dice
  // «Pasta larga plana → Carne» y las fichas de Tagliatelle, Pappardelle y Pici llevan Carne.
  // Ahora los tres separan la larga FINA (salsa ligera) de la larga PLANA (carne).
  test('REPARADO 3 — el consejo de maridaje no contradice a la tabla ni a las fichas', async ({ page }) => {
    const texto = await textoDeLaPagina(page);
    expect(texto).not.toContain('Por eso el ragù va con tagliatelle (lisa)');
    expect(texto).toContain('Salsa ligera con pasta fina; salsa con tropezones con pasta ancha o con hueco.');
    expect(texto).toContain('el ragù va con tagliatelle (ancha y porosa, al huevo)');
    const faq = await leerFaqPage(page);
    const larga = faq.find((p) => p.q === '¿Qué diferencia hay entre pasta corta y pasta larga?');
    expect(larga?.a ?? '').not.toContain('La pasta larga (spaghetti, linguine, tagliatelle) se adapta mejor a salsas líquidas o aceitosas');
    expect(larga?.a ?? '').toContain('La pasta larga y plana al huevo (tagliatelle, pappardelle) aguanta salsas de carne como el ragù');
  });

  // REPARADO (hallazgo 4, 18/11/2026) — el FAQPage daba «la pasta fresca suele estar lista en
  // 2-4 minutos» frente a 4-6/5-7/6-8/10-12 min (fresca) de las fichas y 4-7/3-6 de la tabla, y
  // «angel hair». Ahora: fresca al huevo 3-7 (rellenas 3-6), pici y orecchiette 6-12, capellini 2-3.
  test('REPARADO 4 — el FAQPage da para la pasta fresca los tiempos de la página', async ({ page }) => {
    const faq = await leerFaqPage(page);
    const tiempo = faq.find((p) => p.q === '¿Cuánto tiempo se tarda en cocer la pasta al dente?');
    expect(tiempo).toBeDefined();
    expect(tiempo?.a ?? '').not.toContain('la pasta fresca suele estar lista en 2-4 minutos');
    expect(tiempo?.a ?? '').not.toContain('angel hair');
    expect(tiempo?.a ?? '').toContain('capellini o cabello de ángel) necesita 2-3 minutos');
    expect(tiempo?.a ?? '').toContain('la pasta fresca al huevo, entre 3 y 7 minutos (las rellenas, de 3 a 6)');
    expect(tiempo?.a ?? '').toContain('como los pici o las orecchiette, de 6 a 12 minutos');
    // Las cifras salen de las fichas: Capellini 2-3, Tortellini 3-5, Pappardelle 5-7, Orecchiette 10-12.
    await expect(ficha(page, 'Capellini / Cabello de ángel')).toContainText('2-3 min');
    await expect(ficha(page, 'Tortellini')).toContainText('3-5 min (fresca)');
    await expect(ficha(page, 'Orecchiette')).toContainText('10-12 min (fresca)');
  });

  // ABIERTO (hallazgo 5) — «tiempo de cocción exacto» (la página da rangos y manda guiarse por el
  // paquete) y «carbonara auténtica» (§1.quinquies 6).
  test.fail('ABIERTO 5 — el FAQPage no promete exactitud ni habla de la versión «auténtica»', async ({ page }) => {
    const faq = await leerFaqPage(page);
    const todo = faq.map((p) => `${p.q} ${p.a}`).join(' ');
    expect(todo).not.toContain('tiempo de cocción exacto');
    expect(todo).not.toMatch(/aut[ée]ntic/i);
  });

  // ABIERTO (hallazgo 6) — `features: []` en el jsonLd (CLAUDE.md §1.ter: 4-8 reales).
  test.fail('ABIERTO 6 — el JSON-LD declara entre 4 y 8 características', async ({ page }) => {
    const features = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
        if (j['@type'] === 'WebApplication') return (j.featureList ?? j.features ?? []) as unknown[];
      }
      return [];
    });
    expect(features.length).toBeGreaterThanOrEqual(4);
  });

  // REPARADO (hallazgo 7, 18/11/2026) — «macarrones», «espaguetis», «ñoquis», «lasaña» y
  // «canelones» daban «No hay pastas que coincidan». Ahora el buscador mira también
  // NOMBRES_EN_ESPANOL (también «tallarines», «fideos» y «raviolis»).
  test('REPARADO 7 — el buscador encuentra cada pasta por su nombre en español', async ({ page }) => {
    const casos: [string, string][] = [
      ['macarrones', 'Maccheroni'],
      ['espaguetis', 'Spaghetti'],
      ['ñoquis', 'Gnocchi'],
      ['lasaña', 'Lasagna'],
      ['canelones', 'Cannelloni'],
      ['tallarines', 'Tagliatelle'],
      ['fideos', 'Vermicelli'],
      ['raviolis', 'Ravioli'],
    ];
    for (const [consulta, esperada] of casos) {
      await buscar(page, consulta);
      await expect(fichas(page), `«${consulta}» debería encontrar ${esperada}`).toContainText([esperada], {
        timeout: 2000,
      });
    }
  });

  // ABIERTO (hallazgo 8) — el placeholder dice «Buscar por nombre, salsa, plato o región…» y el
  // filtro no mira `region`: «centro» devuelve solo Farfalle (Norte, por «el centro queda más
  // grueso» de su descripción) en vez de las 8 del Centro.
  test.fail('ABIERTO 8 — buscar «centro» devuelve las 8 pastas de la región Centro', async ({ page }) => {
    await buscar(page, 'centro');
    await expect(fichas(page)).toContainText(
      ['Fettuccine', 'Pappardelle', 'Bucatini', 'Pici', 'Rigatoni', 'Gemelli', 'Strozzapreti', 'Cannelloni'],
      { timeout: 2000 },
    );
  });

  // ABIERTO (hallazgo 9) — ni el contador ni «No hay pastas que coincidan…» están en una región
  // viva: el lector de pantalla no oye el resultado de pulsar un filtro.
  test.fail('ABIERTO 9 — el contador y el estado vacío se anuncian (role=status o aria-live)', async ({ page }) => {
    const enRegionViva = (sel: ReturnType<typeof contador>) =>
      sel.evaluate((el) => el.closest('[role="status"], [aria-live]') !== null);
    expect(await enRegionViva(contador(page))).toBe(true);
    await pulsar(page, 'Forma', 'Lámina');
    await pulsar(page, 'Región', 'Sur');
    expect(await enRegionViva(page.getByText('No hay pastas que coincidan con los filtros seleccionados.'))).toBe(true);
  });

  // ABIERTO (hallazgo 10) — píldora «Tomate» de Spaghetti en claro: rgb(50,120,116) sobre el tinte
  // rgba(72,169,166,.15) compuesto en blanco (228,242,242) = 4,485:1, con 13,1 px y peso 600.
  test.fail('ABIERTO 10 — las píldoras de «Salsas ideales» llegan a 4,5:1 en claro', async ({ page }) => {
    const pildora = ficha(page, 'Spaghetti').getByText('Tomate', { exact: true });
    expect(await contrasteSobreFondoReal(pildora)).toBeGreaterThanOrEqual(4.5);
  });

  // ABIERTO (hallazgo 11) — erratas visibles.
  test.fail('ABIERTO 11 — sin «muzzarella», «mantéca», «del \'escudella\'» ni Trápani/Trapani a la vez', async ({
    page,
  }) => {
    const texto = await textoDeLaPagina(page);
    expect(texto).not.toContain('muzzarella');
    expect(texto).not.toContain('mantéca');
    expect(texto).not.toContain("del 'escudella'");
    expect(texto.includes('Trápani') && texto.includes('Trapani')).toBe(false);
  });

  // ABIERTO (hallazgo 12) — afirmaciones sin fuente presentadas como hechos (§1.quinquies 1 y 3).
  test.fail('ABIERTO 12 — sin las afirmaciones históricas y superlativos sin fuente', async ({ page }) => {
    const texto = await textoDeLaPagina(page);
    for (const frase of [
      'Creada en 1900 en honor a la princesa Mafalda',
      'Kraft introdujo el cavatappi',
      'codificada por la DOP boloñesa',
      'aparecen en las pinturas etruscas',
      'La pasta más fina del mundo',
      'el formato más consumido del mundo',
      'creada por un ingeniero industrial italiano',
    ]) {
      expect(texto, frase).not.toContain(frase);
    }
  });

  // ABIERTO (hallazgo 13) — «Cocinero casero principiante: empieza con penne, fusilli o
  // spaghetti … prueba bucatini o conchiglie», pero Spaghetti y Fusilli son «Media» y Conchiglie
  // «Fácil»: el paso siguiente es más fácil que el de partida.
  test.fail('ABIERTO 13 — las pastas de inicio no son más difíciles que las del paso siguiente', async ({ page }) => {
    const rango: Record<string, number> = { Fácil: 0, Media: 1, Avanzada: 2 };
    const nivel = async (nombre: string) =>
      rango[(await ficha(page, nombre).getByText(/^(Fácil|Media|Avanzada)$/).textContent()) ?? ''];
    const inicio = await Promise.all(['Penne', 'Fusilli', 'Spaghetti'].map(nivel));
    const siguiente = await Promise.all(['Bucatini', 'Conchiglie'].map(nivel));
    expect(Math.max(...inicio)).toBeLessThanOrEqual(Math.min(...siguiente));
  });
});
