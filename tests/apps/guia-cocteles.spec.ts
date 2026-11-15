import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — guia-cocteles (segmento interactiva, riesgo 4)
 *
 * Primera inspección: 15/11/2026 (Opus 5.5), contra el servidor de la copia del Inspector.
 *
 * QUÉ PROMETE
 *   <h1> «Guía de Cócteles Clásicos» y subtítulo «45 recetas con ingredientes, método, copa,
 *   origen e historia»; metadata y jsonLd: 45 cócteles, filtros por familia y base alcohólica,
 *   búsqueda «por nombre, ingrediente, origen o perfil», 7 opciones sin alcohol. No calcula nada
 *   (ni graduación final, ni unidades de bebida, ni raciones), así que la verdad comprobable es
 *   (a) que los filtros y el buscador devuelvan EXACTAMENTE su conjunto, (b) que el FAQPage y los
 *   textos no contradigan a las fichas, y (c) el contenido frente a la política de alcohol del
 *   proyecto (CLAUDE.md §1.quinquies, puntos 1, 9 y 10).
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/guia-cocteles/page.tsx — array COCTELES (45 literales). El filtrado (`coctelesFiltrados`)
 *   es igualdad exacta de familia y base, más un `includes` de SUBCADENA, normalizado sin
 *   acentos, sobre nombre, origen, ingredientes, perfil y descripción. Los conjuntos de abajo se
 *   contaron leyendo el array ANTES de abrir la página.
 *
 * LOS CONJUNTOS ESPERADOS, CONTADOS SOBRE EL ARRAY (45 fichas)
 *   Familias ...... Sour 8 · Highball 7 · Martini 6 · Tropical 6 · Spritz 6 · Cremoso 5 · Sin alcohol 7
 *   Sour + Gin .... 2 (Gimlet, White Lady)
 *   Base Sin alcohol ... 7, y las 7 llevan la insignia de graduación «Sin alcohol»
 *   Familia Sin alcohol + base Gin ... 0 → «0 cócteles» y el aviso de vacío
 *   «pina colada» = «PIÑA COLADA» ... 2 (Piña Colada, Piña Colada cremosa)
 *   «rob roy» ... 1, con el contador en singular («1 cóctel»)
 *   «   » (solo espacios) ... 45 · «xyz» ... 0
 *   Ingrediente con la PALABRA «gin» ... 7: Gimlet, White Lady, Gin Tonic, Tom Collins,
 *     Martini Dry, Dirty Martini («vodka o gin»), Negroni
 *   Ingrediente con la PALABRA «ron» ... 8: Daiquiri, Mojito, Cuba Libre, Dark & Stormy,
 *     Piña Colada, Mai Tai, Bahama Mama, Piña Colada cremosa
 *
 * HALLAZGOS ABIERTOS (15/11/2026) — van con test.fail(): cuando se reparen, el caso «pasará»,
 * Playwright lo marcará como fallo inesperado, y entonces se quita el test.fail() y se escribe
 * REPARADO en su comentario.
 *   A. El buscador casa SUBCADENAS dentro de palabras: «gin» da 16 (ginger, Virgin, original) y
 *      «ron» da 18 (Negroni, terrón, convirtieron, pronunciado, gastronómica).
 *   B. «sin alcohol» en el buscador da 5 de las 7 sin alcohol: no mira familia ni graduación.
 *   C. El Amaretto Sour sale con base «Coñac / Brandy» y su lista no lleva coñac ni brandy.
 *   D. El FAQPage da otra receta del Mojito (45/30 ml frente a 50/25 ml de la ficha) y dice que
 *      el Virgin Mojito lleva «más lima» (las dos fichas llevan 25 ml).
 *   E. La misma pregunta (agitar o remover un Martini) con veredictos opuestos en el FAQPage
 *      («no está "mal"») y en la FAQ visible («técnicamente incorrecto»).
 *   F. Textos que atribuyen al alcohol un efecto beneficioso (dormir, digerir, remedio).
 *   G. Cifras sin fuente con el % pegado (506%, 30-40%, 90%, 80%).
 *   H. Los emojis de método, copa y base se leen en voz alta en las 45 fichas.
 *   I. La guía recomienda un «Champán Spritz» que no está entre las 45.
 *
 * LO QUE SÍ ESTÁ BIEN, y por eso se fija aquí: el aviso de alcohol (DisclaimerCard «alcohol»,
 * severity high, no plegable) está fuera de la sección educativa y se ve al cargar; la guía cita
 * el Grupo 1 de la IARC y que no hay nivel seguro (OMS, comunicado del 04/01/2023, cotejado en
 * who.int); y el contexto colonial del ron está escrito (antipatrón 8).
 */

const RUTA = '/guia-cocteles/';
const BUSCADOR = 'input[aria-label="Buscar cóctel"]';
const TOTAL = 45;

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Un clic en un filtro antes de la hidratación se pierde: se espera al buscador como testigo.
  await esperarHidratacion(page, [BUSCADOR]);
}

/** Los títulos de las fichas que se muestran, en el orden del array. */
const fichas = (page: Page) => page.locator('main article h2');

/** «45 cócteles» — el párrafo con aria-live de los controles. */
const contador = (page: Page) => page.locator('main p[aria-live="polite"]');

const ficha = (page: Page, nombre: string) =>
  page.locator('main article').filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });

const familia = (page: Page, nombre: string) =>
  page.getByRole('group', { name: 'Filtrar por familia' }).getByRole('button', { name: nombre, exact: true });

const base = (page: Page, nombre: string) =>
  page.getByRole('group', { name: 'Filtrar por base' }).getByRole('button', { name: nombre, exact: true });

/** Escribe en el buscador y espera a que el ESTADO de React lo haya recogido. */
async function buscar(page: Page, texto: string): Promise<void> {
  await page.getByLabel('Buscar cóctel').fill(texto);
  await esperarValorEnReact(page, BUSCADOR, texto);
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toHaveAttribute('aria-expanded', 'true');
}

interface PreguntaLd {
  pregunta: string;
  respuesta: string;
}

/** Las preguntas del FAQPage del JSON-LD (las lee el buscador, no el usuario). */
async function faqPage(page: Page): Promise<PreguntaLd[]> {
  return page.evaluate(() => {
    const preguntas: { pregunta: string; respuesta: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      if (j['@type'] !== 'FAQPage') continue;
      for (const q of j.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
        preguntas.push({ pregunta: q.name, respuesta: q.acceptedAnswer.text });
      }
    }
    return preguntas;
  });
}

/** Mililitros de un ingrediente de una ficha («25 ml de zumo de lima fresco» → 25). */
async function mlDe(page: Page, coctel: string, ingrediente: RegExp): Promise<number> {
  const items = await ficha(page, coctel).getByRole('listitem').allTextContents();
  const item = items.find((t) => ingrediente.test(t));
  if (!item) throw new Error(`«${coctel}» no lleva ${ingrediente}`);
  return Number(item.match(/(\d+)\s*ml/)?.[1]);
}

test.describe('guia-cocteles — filtros, buscador y contenido', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) — 45 fichas; Sour da 8, Sour + Gin da 2; base Sin alcohol da las 7', async ({ page }) => {
    // La cifra del subtítulo, la del contador y las fichas montadas son la misma: 45 del array.
    await expect(page.getByText(`${TOTAL} recetas con ingredientes`)).toBeVisible();
    await expect(contador(page)).toHaveText(`${TOTAL} cócteles`);
    await expect(fichas(page)).toHaveCount(TOTAL);

    // Las 8 entradas con familia 'Sour' del array, en su orden.
    await familia(page, 'Sour').click();
    await expect(familia(page, 'Sour')).toHaveAttribute('aria-pressed', 'true');
    await expect(familia(page, 'Todas')).toHaveAttribute('aria-pressed', 'false');
    await expect(fichas(page)).toHaveText([
      'Margarita',
      'Daiquiri',
      'Whiskey Sour',
      'Pisco Sour',
      'Amaretto Sour',
      'Gimlet',
      'White Lady',
      'Cosmopolitan',
    ]);
    await expect(contador(page)).toHaveText('8 cócteles');

    // Cruce de los dos ejes: de esos 8, los de base 'Gin'.
    await base(page, 'Gin').click();
    await expect(fichas(page)).toHaveText(['Gimlet', 'White Lady']);
    await expect(contador(page)).toHaveText('2 cócteles');

    // Base 'Sin alcohol': las 7 del final del array, y cada una con su insignia de graduación.
    await familia(page, 'Todas').click();
    await base(page, 'Sin alcohol').click();
    const sinAlcohol = [
      'Virgin Mojito',
      'Shirley Temple',
      'Arnold Palmer',
      'Virgin Mary',
      'Limonada de frambuesa',
      'Agua de Valencia sin alcohol',
      'Cucumber Cooler',
    ];
    await expect(fichas(page)).toHaveText(sinAlcohol);
    for (const nombre of sinAlcohol) {
      // familia «Sin alcohol» + graduación «Sin alcohol»: dos insignias en la cabecera
      await expect(ficha(page, nombre).getByText('Sin alcohol', { exact: true })).toHaveCount(2);
    }
    // El jsonLd promete «7 opciones sin alcohol / mocktails»: cuadra con la familia.
    await base(page, 'Todas').click();
    await familia(page, 'Sin alcohol').click();
    await expect(fichas(page)).toHaveText(sinAlcohol);
  });

  test('CASO 2 (límite) — un cruce sin resultados lo dice; acentos, mayúsculas, singular y espacios', async ({ page }) => {
    // Ninguna ficha es a la vez de familia «Sin alcohol» y base «Gin».
    await familia(page, 'Sin alcohol').click();
    await base(page, 'Gin').click();
    await expect(fichas(page)).toHaveCount(0);
    await expect(contador(page)).toHaveText('0 cócteles');
    await expect(page.getByText('No se encontraron cócteles con esos criterios.')).toBeVisible();
    await familia(page, 'Todas').click();
    await base(page, 'Todas').click();
    await expect(fichas(page)).toHaveCount(TOTAL);

    // normalizarBusqueda quita tildes y mayúsculas en los dos lados: «ñ» → «n».
    const pina = ['Piña Colada', 'Piña Colada cremosa'];
    await buscar(page, 'pina colada');
    await expect(fichas(page)).toHaveText(pina);
    await buscar(page, 'PIÑA COLADA');
    await expect(fichas(page)).toHaveText(pina);

    // Un solo resultado: el contador pasa al singular.
    await buscar(page, 'rob roy');
    await expect(fichas(page)).toHaveText(['Rob Roy']);
    await expect(contador(page)).toHaveText('1 cóctel');

    // Solo espacios: el `.trim()` lo trata como búsqueda vacía.
    await buscar(page, '   ');
    await expect(fichas(page)).toHaveCount(TOTAL);
  });

  test('CASO 3 (rechazo) — lo que no existe da 0 con aviso; el aviso de alcohol se ve sin abrir nada', async ({ page }) => {
    await buscar(page, 'xyz');
    await expect(fichas(page)).toHaveCount(0);
    await expect(contador(page)).toHaveText('0 cócteles');
    await expect(page.getByText('No se encontraron cócteles con esos criterios.')).toBeVisible();

    // Aviso de alcohol (política de disclaimers, nivel 2, no plegable): visible al cargar, sin
    // abrir la guía, y NO dentro del contenido colapsable.
    await expect(page.getByText('Aviso importante: bebida alcohólica')).toBeVisible();
    await expect(page.getByText('Ninguna cantidad de alcohol está exenta de riesgo.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ver guía educativa' })).toHaveAttribute('aria-expanded', 'false');
    await expect(
      page.locator('[data-guia-educativa]').getByText('Aviso importante: bebida alcohólica'),
    ).toHaveCount(0);

    // La guía cita la IARC y la OMS (comunicado del 04/01/2023: «No level of alcohol consumption
    // is safe for our health»; Grupo 1 de la IARC). Cotejado en who.int el 15/11/2026.
    await abrirGuia(page);
    const guia = page.locator('[data-guia-educativa]');
    await expect(guia).toContainText('carcinógeno Grupo 1 IARC');
    await expect(guia).toContainText('no existe nivel seguro de consumo');
  });

  test('HALLAZGO A (15/11/2026, ABIERTO) — buscar «gin» o «ron» casa subcadenas dentro de otras palabras', async ({ page }) => {
    // Esperado: las fichas que llevan gin (7) o ron (8) en sus ingredientes, contadas en el array.
    // Hoy «gin» da 16: entran Moscow Mule, Dark & Stormy y Shirley Temple por «ginger», Virgin
    // Mojito y Virgin Mary por «Virgin», Mai Tai y Bellini por «original», Americano y Agua de
    // Valencia sin alcohol por mencionar el gin en la descripción. «ron» da 18: Negroni y
    // Americano por «Negroni», Old Fashioned por «terrón», White Lady, Cosmopolitan y Sex on the
    // Beach por «convirtieron», Campari Spritz por «pronunciado», Virgin Mary por «gastronómica».
    test.fail();
    await buscar(page, 'gin');
    await expect(fichas(page)).toHaveText([
      'Gimlet',
      'White Lady',
      'Gin Tonic',
      'Tom Collins',
      'Martini Dry',
      'Dirty Martini',
      'Negroni',
    ]);
    await buscar(page, 'ron');
    await expect(fichas(page)).toHaveText([
      'Daiquiri',
      'Mojito',
      'Cuba Libre',
      'Dark & Stormy',
      'Piña Colada',
      'Mai Tai',
      'Bahama Mama',
      'Piña Colada cremosa',
    ]);
  });

  test('HALLAZGO B (15/11/2026, ABIERTO) — «sin alcohol» en el buscador da 5 de las 7 sin alcohol', async ({ page }) => {
    // Cada una de las 7 lleva «Sin alcohol» escrito dos veces en su cabecera, pero el buscador no
    // mira familia, base ni graduación: solo encuentra las que lo dicen en la descripción o en el
    // nombre. Faltan Virgin Mojito y Virgin Mary, los dos mocktails más conocidos de la lista.
    test.fail();
    await buscar(page, 'sin alcohol');
    await expect(fichas(page)).toHaveText([
      'Virgin Mojito',
      'Shirley Temple',
      'Arnold Palmer',
      'Virgin Mary',
      'Limonada de frambuesa',
      'Agua de Valencia sin alcohol',
      'Cucumber Cooler',
    ]);
  });

  test('HALLAZGO C (15/11/2026, ABIERTO) — la base «Coñac / Brandy» devuelve el Amaretto Sour, que no lleva ninguno', async ({ page }) => {
    // Su lista: amaretto (licor), limón, bourbon opcional, clara y cereza. El único destilado de
    // la receta es el bourbon. El pisco sí es aguardiente de uva: el filtro debería dar solo él.
    test.fail();
    // Premisa (pasa hoy): la lista de ingredientes de la ficha no nombra coñac ni brandy.
    await expect(ficha(page, 'Amaretto Sour').getByRole('list')).not.toContainText(/co[ñn]ac|brandy/i);
    await base(page, 'Coñac / Brandy').click();
    await expect(fichas(page)).toHaveText(['Pisco Sour']);
  });

  test('HALLAZGO D (15/11/2026, ABIERTO) — el FAQPage da otra receta del Mojito que la ficha', async ({ page }) => {
    // Ficha del Mojito: 50 ml de ron, 25 ml de lima, 15 ml de jarabe. FAQPage: «ron blanco cubano
    // (45 ml), zumo de lima (30 ml)». Y «el Virgin Mojito sustituye el ron por agua con gas y más
    // lima», cuando las dos fichas llevan 25 ml de lima.
    test.fail();
    const faq = await faqPage(page);
    const mojito = faq.find((q) => /receta cl[áa]sica/i.test(q.pregunta) && /Mojito/.test(q.pregunta));
    expect(mojito, 'el FAQPage tiene la pregunta del Mojito').toBeTruthy();
    const ingredientesFicha = (await ficha(page, 'Mojito').getByRole('listitem').allTextContents()).join(' · ');
    for (const ml of (mojito?.respuesta ?? '').match(/\d+\s*ml/g) ?? []) {
      expect(ingredientesFicha, `«${ml}» del FAQPage no está en la ficha del Mojito`).toContain(ml);
    }
    const sinAlcohol = faq.find((q) => /sin alcohol/i.test(q.pregunta));
    if (sinAlcohol && /m[áa]s lima/i.test(sinAlcohol.respuesta)) {
      const limaVirgin = await mlDe(page, 'Virgin Mojito', /lima/i);
      const limaMojito = await mlDe(page, 'Mojito', /lima/i);
      expect(limaVirgin, '«más lima» exige más lima en el Virgin Mojito que en el Mojito').toBeGreaterThan(limaMojito);
    }
  });

  test('HALLAZGO E (15/11/2026, ABIERTO) — agitar un Martini: «no está mal» en el FAQPage, «incorrecto» en la página', async ({ page }) => {
    // FAQPage, «¿Cuál es la diferencia entre agitar (shake) y remover (stir) un cóctel?»: «Agitar
    // un Martini no está "mal", pero cambia su textura y claridad». FAQ visible, «¿Por qué el
    // Martini se revuelve y no se agita?»: «es técnicamente incorrecto y produce un resultado
    // inferior». La reparación es UNA constante que lean las dos (check:faq-unica).
    test.fail();
    await abrirGuia(page);
    const visible = await page
      .locator('[data-guia-educativa] li')
      .filter({ hasText: '¿Por qué el Martini se revuelve y no se agita?' })
      .textContent();
    const ld = (await faqPage(page)).find((q) => /agitar/i.test(q.pregunta) && /remover/i.test(q.pregunta));
    const ldPermite = /no est[áa] "?mal/i.test(ld?.respuesta ?? '');
    const visibleCondena = /t[ée]cnicamente incorrecto/i.test(visible ?? '');
    expect(ldPermite && visibleCondena, 'las dos FAQ dan veredictos opuestos').toBe(false);
  });

  test('HALLAZGO F (15/11/2026, ABIERTO) — textos que presentan el alcohol como beneficioso', async ({ page }) => {
    // CLAUDE.md §1.quinquies punto 9: el alcohol no se presenta como saludable. Hot Toddy: «La
    // ciencia moderna confirma que la miel…» y remata «El alcohol... simplemente ayuda a dormir»,
    // como remedio «cuando se tiene frío o los primeros síntomas de un resfriado». Sobremesa: «El
    // whisky y los bitters facilitan la digestión». Aperitivo: «no superar los 2 unidades de
    // alcohol» como si por debajo fuera inocuo, en la misma guía que dice que no hay nivel seguro.
    test.fail();
    await abrirGuia(page);
    await expect(page.getByText(/ayuda a dormir/i)).toHaveCount(0);
    await expect(page.getByText(/facilitan? la digesti[óo]n/i)).toHaveCount(0);
    await expect(page.getByText(/no superar los 2 unidades/i)).toHaveCount(0);
  });

  test('HALLAZGO G (15/11/2026, ABIERTO) — cifras sin fuente y con el % pegado al número', async ({ page }) => {
    // «creció un 506% entre 2015 y 2022», «un 30-40% menos de zumo», «el 90% de los cócteles
    // clásicos», «definen el 80% del sabor»: ninguna cita fuente (§1.quinquies punto 1) y las
    // cuatro pegan el % (Ortografía de la RAE, 2010: «506 %», con espacio duro). Si la reparación
    // conserva una cifra CON su fuente, esta comprobación del formato sigue valiendo.
    test.fail();
    await abrirGuia(page);
    const texto = (await page.locator('[data-guia-educativa]').innerText()).replace(/\s+/g, ' ');
    expect(texto).not.toMatch(/\d%/);
  });

  test('HALLAZGO H (15/11/2026, ABIERTO) — el lector lee los emojis de método, copa y base en cada ficha', async ({ page }) => {
    // `🍸 {c.metodo}`, `🥂 {c.copa}` y `🍾 {c.base}` no llevan aria-hidden: el árbol de
    // accesibilidad de cada ficha dice «🍸 Agitado (shaker) 🥂 Copa Margarita…», 45 veces.
    // check:a11y-jsx lo deja en aviso a propósito (emoji delante de una expresión pide criterio).
    test.fail();
    const arbol = await ficha(page, 'Margarita').ariaSnapshot();
    expect(arbol).not.toContain('🍸');
    expect(arbol).not.toContain('🥂');
    expect(arbol).not.toContain('🍾');
  });

  test('HALLAZGO I (15/11/2026, ABIERTO) — la guía recomienda cócteles que no están entre las 45', async ({ page }) => {
    // «¿Qué cóctel para cada ocasión?» nombra 16 cócteles distintos (el Bellini, dos veces); 15
    // tienen ficha y «Champán Spritz» no: buscarlo da «0 cócteles».
    test.fail();
    const recomendados = [
      'Aperol Spritz', 'Campari Spritz', 'Negroni', 'Americano', 'Bellini',
      'Old Fashioned', 'Manhattan', 'Rob Roy', 'Irish Coffee',
      'Kir Royal', 'Champán Spritz', 'Cosmopolitan',
      'Virgin Mojito', 'Arnold Palmer', 'Cucumber Cooler', 'Virgin Mary',
    ];
    for (const nombre of recomendados) {
      await expect(ficha(page, nombre), `«${nombre}» se recomienda y no tiene ficha`).toHaveCount(1);
    }
  });
});
