import { test, expect, devices, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * visualizador-idiomas-mundo — «El Mapa de los Idiomas del Mundo»
 *
 * Inspector, 18/11/2026 (primera inspección). Explicador sin entradas que teclear: cuatro
 * pestañas (familias, más hablados, en peligro, curiosidades) con tablas fijas en page.tsx que
 * se pintan como barras, un embudo y tarjetas. Lo comprobable es (a) que cada barra mida lo que
 * dice su cifra, (b) que las cifras de la app cuadren entre sí y con su FAQPage, y (c) que se
 * puedan leer y manejar en escritorio, con teclado y en móvil.
 *
 * DATOS DE REFERENCIA: LAS CIFRAS DE LA PROPIA APP. La página cita Ethnologue y el Atlas de la
 * UNESCO, que no están en la red de fuentes de la tarea; por eso ninguna cifra se coteja aquí con
 * una fuente externa, y los hallazgos son incoherencias de la app consigo misma.
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal)
 *     Los más hablados (escala = total del inglés, 1.460 M):
 *       Inglés: nativos 380 ÷ 1.460 = 26,03 % · L2 1.080 ÷ 1.460 = 73,97 % → «380 M», «+1080 M»,
 *       «1460 M» (cuatro cifras sin agrupar: RAE 2010). Mandarín: 920 ÷ 1.460 = 63,01 % · 200 ÷
 *       1.460 = 13,70 %. «Más del doble de nativos»: 920 ÷ 380 = 2,42 ✓.
 *     Familias (escala = indoeuropea, 3.200 M): Sino-tibetana 1.300 ÷ 3.200 = 0,406 del ancho;
 *       Austronesia 386 ÷ 3.200 = 0,121; Japónica 128 ÷ 3.200 = 0,040. Austronesia ÷ Japónica =
 *       3,02 → la app las pinta iguales: 200 px las dos (HALLAZGO).
 *   CASO 2 (límite: los extremos de cada escala)
 *     Japonés, el más pequeño del top: L2 3 ÷ 1.460 = 0,205 % ✓.
 *     Embudo: 3.000 ÷ 7.000 = 42,86 % · 1.500 ÷ 7.000 = 21,43 % · 350 ÷ 7.000 = 5 %. La app los
 *       dibuja al 70, 45 y 22 % (HALLAZGO).
 *     Yagán: si la última hablante nativa murió en 2022 (lo dice la tarjeta), quedan 0, no «1
 *       hablante» (HALLAZGO).
 *     Jemer: 33 + 23 + 12 = 68 letras; el titular dice 74 (HALLAZGO).
 *     Palabra alemana: R-i-n-d-f-l-e-i-s-c-h (11) + etikettierung (13) + s + überwachung (11) + s
 *       + aufgaben (8) + übertragung (11) + s + gesetz (6) = 63 letras ✓.
 *   CASO 3 (operativa: no hay entrada que rechazar)
 *     Teclado: Tab desde «Las grandes familias» lleva a «Los más hablados»; Enter cambia el h2 y
 *       aria-pressed; Enter en Japónica la despliega con «Japonés, ryukyuense» y «~10 lenguas» ✓.
 *     Móvil (Pixel 7, pista de ~208 px): ninguna cifra de las barras debería quedar cortada.
 *       Predicho a mano: «+110 M» del árabe cabe en 7,53 % × 208 ≈ 16 px → cortadas (HALLAZGO).
 *
 * Los HALLAZGOS ABIERTOS van con test.fail(): cuando se reparen, Playwright marcará el test como
 * «pasó inesperadamente»; entonces se quita el test.fail() y el comentario pasa a REPARADO.
 */

const RUTA = '/visualizador-idiomas-mundo/';

/** Tabla TOP_IDIOMAS de la app (millones): la escala de las barras es el total del inglés. */
const TOP: readonly { nombre: string; nativos: number; total: number }[] = [
  { nombre: 'Inglés', nativos: 380, total: 1460 },
  { nombre: 'Mandarín', nativos: 920, total: 1120 },
  { nombre: 'Hindi', nativos: 345, total: 610 },
  { nombre: 'Español', nativos: 485, total: 560 },
  { nombre: 'Árabe', nativos: 310, total: 420 },
  { nombre: 'Francés', nativos: 80, total: 310 },
  { nombre: 'Bengalí', nativos: 230, total: 270 },
  { nombre: 'Portugués', nativos: 230, total: 260 },
  { nombre: 'Ruso', nativos: 150, total: 255 },
  { nombre: 'Japonés', nativos: 125, total: 128 },
];
const ESCALA_TOP = 1460;

/** Tabla FAMILIAS de la app (millones de hablantes): la escala es la indoeuropea. */
const FAMILIAS: readonly { nombre: string; hablantes: number }[] = [
  { nombre: 'Indoeuropea', hablantes: 3200 },
  { nombre: 'Sino-tibetana', hablantes: 1300 },
  { nombre: 'Níger-Congo', hablantes: 530 },
  { nombre: 'Austronesia', hablantes: 386 },
  { nombre: 'Afroasiática', hablantes: 350 },
  { nombre: 'Dravídica', hablantes: 250 },
  { nombre: 'Turca', hablantes: 200 },
  { nombre: 'Japónica', hablantes: 128 },
];

const NAV = 'nav[aria-label="Secciones del explicador"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

async function irA(page: Page, titulo: string): Promise<void> {
  await page.locator(NAV).getByRole('button', { name: titulo }).click();
  await expect(page.locator('h2').first()).toContainText(titulo);
}

/** Ancho de cada bloque de familia relativo al de la indoeuropea, en el orden de la tabla. */
async function anchosRelativosFamilias(page: Page): Promise<number[]> {
  const anchos = await page
    .locator('[class*="_familiasGrid"] > button')
    .evaluateAll((bs) => bs.map((b) => b.getBoundingClientRect().width));
  return anchos.map((a) => a / anchos[0]);
}

/** Contraste WCAG entre dos colores sRGB [r, g, b]. */
function contraste(a: readonly number[], b: readonly number[]): number {
  const lum = ([r, g, bl]: readonly number[]): number => {
    const f = (v: number): number => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

interface PreguntaLd {
  name?: string;
  acceptedAnswer?: { text?: string };
}
interface BloqueLd {
  '@type'?: string;
  featureList?: string[];
  mainEntity?: PreguntaLd[];
}

async function respuestasFaq(page: Page): Promise<string[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = textos.map((t) => JSON.parse(t) as BloqueLd).find((b) => b['@type'] === 'FAQPage');
  return (faq?.mainEntity ?? []).map((p) => p.acceptedAnswer?.text ?? '');
}

/** El texto (textContent, también lo plegado) de las cuatro pestañas y del bloque educativo. */
async function textoDeLaApp(page: Page): Promise<string> {
  const partes: string[] = [];
  for (const titulo of ['Las grandes familias', 'Los más hablados', 'En peligro', 'Curiosidades']) {
    await irA(page, titulo);
    partes.push((await page.locator('[class*="_seccionContent"]').first().textContent()) ?? '');
  }
  partes.push((await page.locator('[class*="_warningBox"]').first().evaluate((el) => el.parentElement?.textContent ?? '')) ?? '');
  return partes.join('\n');
}

test.describe('visualizador-idiomas-mundo — barras, cifras y teclado (escritorio)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  const erroresJs: string[] = [];

  test.beforeEach(async ({ page }) => {
    erroresJs.length = 0;
    page.on('pageerror', (e) => erroresJs.push(String(e)));
    await abrir(page);
  });

  test('carga con su h1, las cuatro pestañas y las ocho familias, sin errores', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('El Mapa de los Idiomas del Mundo');
    await expect(page.locator(NAV).getByRole('button')).toHaveCount(4);
    await expect(page.locator('[class*="_familiasGrid"] > button')).toHaveCount(8);
    await expect(page.locator('h2').first()).toContainText('Las grandes familias');
    expect(erroresJs).toEqual([]);
  });

  test('CASO 1 · cada barra del top 10 mide nativos ÷ 1.460 y L2 ÷ 1.460 (±0,05 puntos)', async ({ page }) => {
    await irA(page, 'Los más hablados');
    const barras = await page.locator('[class*="_barraItem"]').evaluateAll((items) =>
      items.map((it) => ({
        nombre: it.querySelector('[class*="_barraNombre"]')?.textContent ?? '',
        nat: parseFloat((it.querySelector('[class*="_barraNativos"]') as HTMLElement).style.width),
        l2: parseFloat((it.querySelector('[class*="_barraL2"]') as HTMLElement).style.width),
        total: it.querySelector('[class*="_barraTotal"]')?.textContent ?? '',
      })),
    );
    expect(barras.map((b) => b.nombre)).toEqual(TOP.map((t) => t.nombre));
    for (const [i, t] of TOP.entries()) {
      // p. ej. Inglés 380 ÷ 1.460 × 100 = 26,03 %; Japonés L2 3 ÷ 1.460 × 100 = 0,205 % (CASO 2)
      expect(barras[i].nat, `${t.nombre} nativos`).toBeCloseTo((t.nativos / ESCALA_TOP) * 100, 1);
      expect(barras[i].l2, `${t.nombre} L2`).toBeCloseTo(((t.total - t.nativos) / ESCALA_TOP) * 100, 1);
      expect(barras[i].total).toBe(`${t.total} M`);
    }
    const ingles = page.locator('[class*="_barraItem"]').first();
    await expect(ingles.locator('[class*="_barraTexto"]')).toHaveText(['380 M', '+1080 M']);
    // «más del doble de nativos»: 920 ÷ 380 = 2,42
    await expect(page.locator('[class*="_insight"]').first()).toContainText('más del doble de nativos');
    expect(920 / 380).toBeGreaterThan(2);
  });

  test('CASO 1 · la sino-tibetana mide 1.300 ÷ 3.200 = 0,406 del ancho de la indoeuropea', async ({ page }) => {
    const rel = await anchosRelativosFamilias(page);
    expect(rel[1]).toBeCloseTo(1300 / 3200, 2);
    await expect(page.locator('[class*="_familiasGrid"] > button').first()).toHaveAttribute(
      'aria-label',
      'Indoeuropea: 3200 millones de hablantes',
    );
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · los bloques de familia no son proporcionales: seis de ocho miden lo mismo', async ({ page }) => {
    // JSON-LD: «Familias lingüísticas con bloques proporcionales por hablantes». Esperado: ancho ÷
    // ancho indoeuropea = hablantes ÷ 3.200 (Japónica 0,040; Austronesia 0,121; Níger-Congo 0,166).
    // Obtenido a 1280 px: Níger-Congo, Austronesia, Afroasiática, Dravídica, Turca y Japónica a
    // 200 px las seis (0,235), por el suelo Math.max(…, 15) y el min-width: 200px del módulo.
    const rel = await anchosRelativosFamilias(page);
    const fuera: string[] = [];
    for (const [i, f] of FAMILIAS.entries()) {
      const esperado = f.hablantes / 3200;
      if (Math.abs(rel[i] - esperado) >= 0.05) fuera.push(`${f.nombre}: ${rel[i].toFixed(3)} frente a ${esperado.toFixed(3)}`);
    }
    expect(fuera).toEqual([]);
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · el embudo dibuja 3.000 de 7.000 lenguas al 70 % del ancho', async ({ page }) => {
    // Esperado: valor ÷ 7.000 → 42,86 %, 21,43 % y 5 %. Obtenido: anchos fijos 70, 45 y 22 %, que
    // dicen visualmente que el 70 % de las lenguas está en peligro (el texto dice «casi la mitad»).
    await irA(page, 'En peligro');
    const niveles = await page.locator('[class*="_embudoNivel"]').evaluateAll((ns) =>
      ns.map((n) => ({
        valor: Number((n.querySelector('[class*="_embudoValor"]')?.textContent ?? '').replace(/\./g, '')),
        ancho: parseFloat((n as HTMLElement).style.width),
      })),
    );
    expect(niveles.map((n) => n.valor)).toEqual([7000, 3000, 1500, 350]);
    for (const n of niveles) {
      expect(n.ancho, `nivel de ${n.valor}`).toBeCloseTo((n.valor / 7000) * 100, 0);
    }
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · Yagán: «1 hablante» en la tarjeta que dice que la última murió en 2022', async ({ page }) => {
    // La propia tarjeta: «Cristina Calderón fue la última hablante nativa. Falleció en 2022.»
    // Esperado: 0 hablantes nativos (o «extinta/sin hablantes nativos») · obtenido: «1 hablante».
    await irA(page, 'En peligro');
    const tarjeta = page.locator('[class*="_lenguaCard"]').filter({ hasText: 'Yagán' });
    const detalle = (await tarjeta.locator('[class*="_lenguaDetalle"]').textContent()) ?? '';
    const meta = (await tarjeta.locator('[class*="_lenguaMeta"]').textContent()) ?? '';
    expect(detalle).toMatch(/última hablante nativa[^.]*\.\s*Falleció en 2022/);
    const vivos = Number(/(\d+)\s+hablantes?/.exec(meta)?.[1] ?? 0);
    expect(vivos, `meta «${meta}»`).toBe(0);
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · Jemer «74 letras» con un desglose que suma 68', async ({ page }) => {
    // «33 consonantes, 23 vocales y 12 vocales independientes»: 33 + 23 + 12 = 68 ≠ 74.
    await irA(page, 'Curiosidades');
    const tarjeta = page.locator('[class*="_curiosidadCard"]').filter({ hasText: 'El alfabeto más largo' });
    const dato = (await tarjeta.locator('[class*="_curiosidadDato"]').textContent()) ?? '';
    const detalle = (await tarjeta.locator('[class*="_curiosidadDetalle"]').textContent()) ?? '';
    const titular = Number(/(\d+)\s+letras/.exec(dato)?.[1]);
    const primeraFrase = detalle.split('.')[0];
    const suma = Array.from(primeraFrase.matchAll(/(\d+)\s+(?:consonantes|vocales)/g)).reduce((s, m) => s + Number(m[1]), 0);
    expect(suma, `«${dato}» frente a «${primeraFrase}»`).toBe(titular);
  });

  test('CASO 2 · la palabra alemana tiene las 63 letras que dice', async ({ page }) => {
    await irA(page, 'Curiosidades');
    const detalle =
      (await page
        .locator('[class*="_curiosidadCard"]')
        .filter({ hasText: 'La palabra más larga' })
        .locator('[class*="_curiosidadDetalle"]')
        .textContent()) ?? '';
    const palabra = /"([^"]+)"/.exec(detalle)?.[1] ?? '';
    const dicha = Number(/\((\d+) letras\)/.exec(detalle)?.[1]);
    expect(palabra).toBe('Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz');
    expect(Array.from(palabra).length).toBe(63);
    expect(dicha).toBe(63);
  });

  test('CASO 3 · teclado: Tab y Enter cambian de pestaña; Enter despliega una familia', async ({ page }) => {
    await page.locator(NAV).getByRole('button').first().focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('h2').first()).toContainText('Los más hablados');
    await expect(page.locator(NAV).getByRole('button', { name: 'Los más hablados' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(NAV).getByRole('button', { name: 'Las grandes familias' })).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Space');
    await expect(page.locator('h2').first()).toContainText('Las grandes familias');
    const japonica = page.getByRole('button', { name: 'Japónica: 128 millones de hablantes' });
    await japonica.focus();
    await page.keyboard.press('Enter');
    await expect(japonica).toHaveAttribute('aria-expanded', 'true');
    await expect(japonica).toContainText('Japonés, ryukyuense');
    await expect(japonica).toContainText('~10 lenguas');
    await page.keyboard.press('Enter');
    await expect(japonica).toHaveAttribute('aria-expanded', 'false');
    expect(erroresJs).toEqual([]);
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · cifras pintadas por debajo de 4,5:1 en el tema claro', async ({ page }) => {
    // Texto de 11,2 px (barras), 15,2 px negrita (familias) y 17,6 px negrita (embudo): ninguno es
    // «texto grande» (18,66 px negrita), así que exige 4,5:1. Medido: blanco sobre #2E86AB 4,11:1 y
    // sobre #48A9A6 2,80:1 (barras), embudo 4,11 · 2,85 · 3,82:1, y siete de las ocho cifras de
    // familia en su color sobre blanco (Turca #F39C12 2,19:1, Japónica #1ABC9C 2,41:1…).
    const rgb = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const bajos: string[] = [];
    const familias = await page.locator('[class*="_familiasGrid"] > button').evaluateAll((bs) =>
      bs.map((b) => ({
        n: b.querySelector('[class*="_familiaNombre"]')?.textContent ?? '',
        c: getComputedStyle(b.querySelector('[class*="_familiaHablantes"]') as Element).color,
        f: getComputedStyle(b).backgroundColor,
      })),
    );
    for (const x of familias) {
      const r = contraste(rgb(x.c), rgb(x.f));
      if (r < 4.5) bajos.push(`familia ${x.n}: ${r.toFixed(2)}:1`);
    }
    await irA(page, 'Los más hablados');
    const barras = await page.locator('[class*="_barraTexto"]').evaluateAll((ts) =>
      ts.map((t) => ({ t: t.textContent ?? '', c: getComputedStyle(t).color, f: getComputedStyle(t.parentElement as Element).backgroundColor })),
    );
    for (const x of barras) {
      const r = contraste(rgb(x.c), rgb(x.f));
      if (r < 4.5) bajos.push(`barra «${x.t}»: ${r.toFixed(2)}:1`);
    }
    await irA(page, 'En peligro');
    const embudo = await page.locator('[class*="_embudoValor"]').evaluateAll((vs) =>
      vs.map((v) => ({ t: v.textContent ?? '', c: getComputedStyle(v).color, f: getComputedStyle(v.parentElement as Element).backgroundColor })),
    );
    for (const x of embudo) {
      const r = contraste(rgb(x.c), rgb(x.f));
      if (r < 4.5) bajos.push(`embudo «${x.t}»: ${r.toFixed(2)}:1`);
    }
    expect(bajos).toEqual([]);
  });
});

test.describe('visualizador-idiomas-mundo — lo que leen buscadores y asistentes, y el texto', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('el JSON-LD declara cuatro características', async ({ page }) => {
    const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = textos.map((t) => JSON.parse(t) as BloqueLd).find((b) => b['@type'] === 'WebApplication');
    expect(app?.featureList?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · la FAQPage da otras cifras que la página', async ({ page }) => {
    // FAQ: «entre 6.500 y 7.000 idiomas vivos» · página: «Hay más de 7.000 idiomas en el mundo».
    // FAQ: «el español (480 millones de nativos)… el hindi (340 millones)» · barras: 485 M y 345 M.
    const faq = (await respuestasFaq(page)).join('\n');
    const discrepancias: string[] = [];
    const contexto = (await page.locator('[class*="_contexto"]').first().textContent()) ?? '';
    const masDe = Number((/más de ([\d.]+) idiomas/.exec(contexto)?.[1] ?? '0').replace(/\./g, ''));
    const rango = /entre ([\d.]+) y ([\d.]+) idiomas/.exec(faq);
    if (rango && Number(rango[2].replace(/\./g, '')) <= masDe) {
      discrepancias.push(`FAQ «${rango[0]}» frente a página «más de ${masDe} idiomas»`);
    }
    await irA(page, 'Los más hablados');
    const nativosPagina = async (nombre: string): Promise<number> =>
      Number(
        ((await page.locator('[class*="_barraItem"]').filter({ hasText: nombre }).locator('[class*="_barraNativos"]').textContent()) ?? '')
          .replace(/\D/g, ''),
      );
    for (const [nombre, patron] of [
      ['Español', /español \((\d+) millones de nativos\)/],
      ['Hindi', /hindi \((\d+) millones\)/],
    ] as const) {
      const enFaq = Number(patron.exec(faq)?.[1]);
      const enPagina = await nativosPagina(nombre);
      if (enFaq !== enPagina) discrepancias.push(`${nombre}: FAQ ${enFaq} M frente a barra ${enPagina} M`);
    }
    expect(discrepancias).toEqual([]);
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · porcentajes pegados al número («95%», «40%»…)', async ({ page }) => {
    // Formato español (CLAUDE.md, 25/09/2026): «95 %» con espacio duro U+00A0. Página: 95%, 2%,
    // 12% y 80% (bloque educativo); FAQPage: 96%, 4% y 40%.
    const texto = `${await textoDeLaApp(page)}\n${(await respuestasFaq(page)).join('\n')}`;
    const pegados = Array.from(texto.matchAll(/\d+(?:%| %)/g)).map((m) => m[0]);
    expect(pegados).toEqual([]);
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · afirmaciones discutidas y cifras redondas sin fuente ni atribución', async ({ page }) => {
    // Neutralidad editorial 1 y 3 del CLAUDE.md: cifra popular sin fuente / marco discutido dado por
    // hecho. La única nota de fuentes (Ethnologue, UNESCO) cubre hablantes y lenguas en peligro, y
    // está dentro del bloque plegado. Cada frase de abajo debe ir atribuida (autor, organismo o año
    // en el mismo párrafo) o retirarse.
    const frases: readonly RegExp[] = [
      /Los hopi no distinguen pasado y futuro/,
      /una de las lenguas más simples conocidas/,
      /lengua más antigua de Europa occidental/,
      /95\s?%[^.]*10 idiomas/,
      /80\s?% de las plantas medicinales/,
      /12\s?% de las lenguas escritas/,
      /Cada\s+dos semanas\s+muere un idioma/,
    ];
    const atribucion = /\([^()]*\b(1[89]|20)\d{2}\)|según|fuente|propuso|sostiene|discut/i;
    const sinFuente: string[] = [];
    for (const titulo of ['Las grandes familias', 'Los más hablados', 'En peligro', 'Curiosidades']) {
      await irA(page, titulo);
      const parrafos = await page.locator('[class*="_seccionContent"] p').allTextContents();
      for (const p of parrafos) for (const f of frases) if (f.test(p) && !atribucion.test(p)) sinFuente.push(p.trim().slice(0, 90));
    }
    const educativo = await page.locator('[class*="_warningBox"]').first().evaluate((el) =>
      Array.from(el.parentElement?.querySelectorAll('p') ?? []).map((p) => p.textContent ?? ''),
    );
    for (const p of educativo) for (const f of frases) if (f.test(p) && !atribucion.test(p)) sinFuente.push(p.trim().slice(0, 90));
    expect(sinFuente).toEqual([]);
  });
});

test.describe('visualizador-idiomas-mundo — en móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 3 · en móvil se cambia de pestaña con un toque', async ({ page }) => {
    await page.locator(NAV).getByRole('button', { name: 'Los más hablados' }).tap();
    await expect(page.locator('h2').first()).toContainText('Los más hablados');
    await expect(page.locator('[class*="_barraItem"]')).toHaveCount(10);
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · en móvil siete cifras de las barras salen cortadas', async ({ page }) => {
    // Pista de ~208 px: «+110 M» (árabe) cabe en 16 px, «+105 M» (ruso) en 15, «230 M» (bengalí y
    // portugués) en 33… Medido en Pixel 7: Mandarín L2, Hindi L2, Árabe L2, Francés L2, Bengalí,
    // Portugués y Ruso L2 con scrollWidth > clientWidth (text-overflow: ellipsis).
    await page.locator(NAV).getByRole('button', { name: 'Los más hablados' }).tap();
    await expect(page.locator('[class*="_barraItem"]')).toHaveCount(10);
    const cortadas = await page.locator('[class*="_barraTexto"]').evaluateAll((ts) =>
      ts.filter((t) => t.scrollWidth > t.clientWidth + 0.5).map((t) => t.textContent ?? ''),
    );
    expect(cortadas).toEqual([]);
  });

  test.fail('HALLAZGO ABIERTO (18/11/2026) · en móvil las ocho familias miden lo mismo (width: 100% !important)', async ({ page }) => {
    // Esperado: Japónica 128 ÷ 3.200 = 0,040 del ancho de la indoeuropea · obtenido 1,000 (364 px las ocho).
    const rel = await anchosRelativosFamilias(page);
    expect(rel[7]).toBeCloseTo(128 / 3200, 1);
    expect(rel[1]).toBeCloseTo(1300 / 3200, 1);
  });
});
