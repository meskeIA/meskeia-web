import { test, expect, devices, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — guia-razas-perros (segmento interactiva, modo primera)
 *
 * Primera inspección: 14/11/2026 (Opus 5.5), contra el servidor de la copia del Inspector.
 *
 * QUÉ PROMETE
 *   <h1> «Guía de Razas de Perros» y, debajo, «40 razas con temperamento, energía, mantenimiento y
 *   consejos para elegir la raza ideal». No calcula: la verdad comprobable es (a) que el buscador y
 *   los filtros (tamaño, energía, apto apartamento, apto con niños) devuelvan EXACTAMENTE su
 *   conjunto y en el orden del array, (b) que la ficha diga lo que dice el array y (c) que los
 *   datos y textos (grupo FCI, normativa, FAQ) cuadren con su fuente.
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/guia-razas-perros/page.tsx — array `RAZAS` inline, 40 objetos. `razasFiltradas` es un
 *   `filter` en el orden del array: cuatro igualdades/booleanos más un `includes` del texto
 *   normalizado (`normalizarBusqueda`: minúsculas y sin diacríticos, con `trim()`) sobre nombre,
 *   nombre inglés, origen y grupo. Los conjuntos de abajo se contaron leyendo el array ANTES de
 *   abrir la app.
 *
 * CONJUNTOS ESPERADOS, CONTADOS SOBRE EL ARRAY (40 fichas)
 *   Tamaño: Mini 4 · Pequeño 7 · Mediano 11 · Grande 15 · Gigante 3 (San Bernardo, Gran Danés,
 *           Mastín Español)
 *   Energía: Muy alta 8 · Alta 20 · Media 7 · Baja 5 · Solo apartamento 19 · Solo niños 33
 *   Apartamento + niños + Baja ............ 3  Bulldog Francés, Shih Tzu, Basset Hound (Shar Pei
 *                                              cae por niños; Mastín, por apartamento)
 *   «aleman» (sin tilde) ................. 10  los 10 de origen «Alemania» (dos de ellos, además,
 *                                              por el nombre: Pastor Alemán y Braco Alemán)
 *   Gigante + Baja ........................ 1  Mastín Español («1 raza encontrada», en singular)
 *   Gigante + Baja + apartamento .......... 0  y el aviso «No se encontraron razas…»
 *   Mini + Muy alta ....................... 0  (los 4 Mini son Alta o Media)
 *   «DÁLMATA» ............................. 1  Dálmata · «   » (solo espacios) → las 40
 *   «carlino» ............................. 0  raza que no está en la guía
 *
 * FUENTES DE LOS HALLAZGOS
 *   Grupos FCI: nomenclatura de la Fédération Cynologique Internationale por número de estándar
 *   (Dálmata n.º 153, grupo 6; Shar Pei n.º 309, grupo 2; Mastín Español n.º 91, grupo 2).
 *   fci.be no está en la lista de dominios de la tarea: no se pudo abrir.
 *   Seguro de RC: Ley 7/2023, art. 30.3 (BOE-A-2023-7936). Perros potencialmente peligrosos:
 *   Real Decreto 287/2002, anexo I (Rottweiler, Akita Inu).
 *
 * Los HALLAZGOS del final son `test.fail()`: afirman lo correcto y hoy fallan.
 */

const RUTA = '/guia-razas-perros/';
const BUSCADOR = 'input[aria-label="Buscar raza de perro"]';
const TOTAL = 40;
const SIN_RESULTADOS = 'No se encontraron razas con esos criterios. Prueba a cambiar los filtros.';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Sin esto, un clic o un fill anterior a la hidratación movería el DOM sin llegar a React.
  await esperarHidratacion(page, [BUSCADOR]);
}

/** Los nombres de las fichas que se muestran, en el orden del array. */
const fichas = (page: Page) => page.locator('main article h2');

/** «N razas encontradas» (región viva de la app). */
const contador = (page: Page) => page.locator('main p[aria-live="polite"]').filter({ hasText: 'encontrada' });

/** El aviso de «sin resultados», acotado a la app (el anunciador de rutas de Next también es alert). */
const avisoApp = (page: Page) => page.locator('main').getByRole('alert');

/** La ficha de una raza, por su nombre exacto. */
const ficha = (page: Page, nombre: string): Locator =>
  page.locator('main article').filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });

const botonTamano = (page: Page, t: string) =>
  page.getByRole('group', { name: 'Filtrar por tamaño' }).getByRole('button', { name: t, exact: true });
const botonEnergia = (page: Page, e: string) =>
  page.getByRole('group', { name: 'Filtrar por energía' }).getByRole('button', { name: e, exact: true });

/** Escribe en el buscador y espera a que el ESTADO de React lo haya recogido. */
async function buscar(page: Page, texto: string): Promise<void> {
  await page.getByLabel('Buscar raza de perro').fill(texto);
  await esperarValorEnReact(page, BUSCADOR, texto);
}

/** El contenido de la guía educativa (montado siempre; plegado por CSS hasta que se abre). */
const guia = (page: Page) => page.locator('[data-guia-educativa]');

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
}

/** Los bloques JSON-LD servidos, ya parseados. */
async function jsonLd(page: Page): Promise<Array<Record<string, unknown>>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  return bloques.map((t) => JSON.parse(t) as Record<string, unknown>);
}

interface PreguntaFaq {
  name: string;
  acceptedAnswer: { text: string };
}

async function faqJsonLd(page: Page): Promise<PreguntaFaq[]> {
  const faq = (await jsonLd(page)).find((j) => j['@type'] === 'FAQPage');
  return (faq?.mainEntity ?? []) as PreguntaFaq[];
}

/**
 * Contraste WCAG del texto de un elemento contra su fondo COMPUESTO: se suman los fondos
 * semitransparentes de los antepasados (el badge del grupo pinta su color con alfa 0x20) hasta
 * llegar a uno opaco.
 */
async function contraste(loc: Locator): Promise<number> {
  return loc.evaluate((el) => {
    const parse = (s: string): number[] => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    };
    const sobre = (arriba: number[], abajo: number[]): number[] =>
      [0, 1, 2].map((i) => arriba[i] * arriba[3] + abajo[i] * (1 - arriba[3])).concat(1);
    const lum = (c: number[]) =>
      c
        .slice(0, 3)
        .map((v) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        })
        .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let fondo = [255, 255, 255, 1];
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const texto = sobre(parse(getComputedStyle(el).color), fondo);
    const a = lum(texto);
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (normal, Pixel 7) — un filtro de tamaño, tres filtros combinados y una búsqueda por origen
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en móvil (Pixel 7): los filtros y el buscador devuelven su conjunto exacto', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']`: el device trae
  // `defaultBrowserType` y Playwright no lo admite dentro de un describe.
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
    expect(page.viewportSize()).toEqual({ width: 412, height: 839 }); // devices['Pixel 7']
  });

  test('CASO 1 — Gigante da 3; apartamento + niños + Baja da 3; «aleman» da los 10 de Alemania', async ({ page }) => {
    await expect(contador(page)).toHaveText(`${TOTAL} razas encontradas`);
    await expect(fichas(page)).toHaveCount(TOTAL);
    // Sin desbordamiento horizontal en 412 px.
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBe(0);

    // Tamaño Gigante: los tres del array con tamano 'Gigante', en su orden.
    await botonTamano(page, 'Gigante').tap();
    await expect(botonTamano(page, 'Gigante')).toHaveAttribute('aria-pressed', 'true');
    await expect(botonTamano(page, 'Todos')).toHaveAttribute('aria-pressed', 'false');
    await expect(fichas(page)).toHaveText(['San Bernardo', 'Gran Danés', 'Mastín Español']);
    await expect(contador(page)).toHaveText('3 razas encontradas');
    await botonTamano(page, 'Todos').tap();

    // Tres filtros a la vez: aptoApartamento && aptoNinos && energia 'Baja'.
    await page.getByLabel('Solo apto apartamento').check();
    await expect(contador(page)).toHaveText('19 razas encontradas');
    await page.getByLabel('Solo apto con niños').check();
    await botonEnergia(page, 'Baja').tap();
    await expect(fichas(page)).toHaveText(['Bulldog Francés', 'Shih Tzu', 'Basset Hound']);
    await expect(contador(page)).toHaveText('3 razas encontradas');
    await page.getByLabel('Solo apto apartamento').uncheck();
    await page.getByLabel('Solo apto con niños').uncheck();
    await botonEnergia(page, 'Todos').tap();
    await expect(contador(page)).toHaveText(`${TOTAL} razas encontradas`);

    // Buscar sin tilde por el origen: «aleman» casa con «Alemania» y con los nombres «… Alemán».
    await page.getByLabel('Buscar raza de perro').tap();
    await buscar(page, 'aleman');
    await expect(fichas(page)).toHaveText([
      'Pastor Alemán',
      'Boxer',
      'Schnauzer Mediano',
      'Rottweiler',
      'Dobermann',
      'Gran Danés',
      'Weimaraner',
      'Dachshund',
      'Pomerania',
      'Braco Alemán',
    ]);
    await expect(contador(page)).toHaveText('10 razas encontradas');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASOS 2 y 3 (escritorio) — el límite y lo que no debe encontrar nada
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en escritorio: límites del filtrado y búsqueda sin resultados', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 2 — Gigante + Baja deja solo el Mastín (en singular); con apartamento, ninguna y el aviso', async ({
    page,
  }) => {
    // Recuento por cada botón, contado sobre el array.
    const porTamano: Array<[string, number]> = [
      ['Mini', 4],
      ['Pequeño', 7],
      ['Mediano', 11],
      ['Grande', 15],
      ['Gigante', 3],
    ];
    for (const [t, n] of porTamano) {
      await botonTamano(page, t).click();
      await expect(contador(page), `Tamaño ${t}`).toHaveText(`${n} razas encontradas`);
    }
    const porEnergia: Array<[string, number]> = [
      ['Muy alta', 8],
      ['Alta', 20],
      ['Media', 7],
      ['Baja', 5],
    ];
    await botonTamano(page, 'Todos').click();
    for (const [e, n] of porEnergia) {
      await botonEnergia(page, e).click();
      await expect(contador(page), `Energía ${e}`).toHaveText(`${n} razas encontradas`);
    }

    // Gigante + Baja: San Bernardo y Gran Danés son 'Media'; queda el Mastín, y en singular.
    await botonTamano(page, 'Gigante').click();
    await botonEnergia(page, 'Baja').click();
    await expect(fichas(page)).toHaveText(['Mastín Español']);
    await expect(contador(page)).toHaveText('1 raza encontrada');
    await expect(avisoApp(page)).toHaveCount(0);

    // Un paso más: el Mastín no es apto apartamento → ninguna, y lo dice.
    await page.getByLabel('Solo apto apartamento').check();
    await expect(fichas(page)).toHaveCount(0);
    await expect(contador(page)).toHaveText('0 razas encontradas');
    await expect(avisoApp(page)).toHaveText(SIN_RESULTADOS);
    await page.getByLabel('Solo apto apartamento').uncheck();

    // Mini + Muy alta: los cuatro Mini son 'Alta' o 'Media'.
    await botonTamano(page, 'Mini').click();
    await botonEnergia(page, 'Muy alta').click();
    await expect(contador(page)).toHaveText('0 razas encontradas');
    await botonTamano(page, 'Todos').click();
    await botonEnergia(page, 'Todos').click();

    // Mayúsculas y tilde se normalizan; solo espacios es una búsqueda vacía (trim).
    await buscar(page, 'DÁLMATA');
    await expect(fichas(page)).toHaveText(['Dálmata']);
    await buscar(page, '   ');
    await expect(fichas(page)).toHaveCount(TOTAL);
    await expect(contador(page)).toHaveText(`${TOTAL} razas encontradas`);
  });

  test('CASO 3 — una raza que no está en la guía da 0 y el aviso; vaciar el buscador vuelve a las 40', async ({
    page,
  }) => {
    await buscar(page, 'carlino');
    await expect(fichas(page)).toHaveCount(0);
    await expect(contador(page)).toHaveText('0 razas encontradas');
    await expect(avisoApp(page)).toHaveText(SIN_RESULTADOS);
    // El contador es región viva: el lector de pantalla oye el «0».
    await expect(contador(page)).toHaveAttribute('aria-live', 'polite');

    await buscar(page, '');
    await expect(fichas(page)).toHaveCount(TOTAL);
    await expect(avisoApp(page)).toHaveCount(0);

    // El jsonLd lleva sus características y el FAQPage sus 5 preguntas.
    const bloques = await jsonLd(page);
    const app = bloques.find((j) => j['@type'] === 'WebApplication');
    expect(((app?.featureList ?? []) as string[]).length).toBeGreaterThanOrEqual(4);
    expect(await faqJsonLd(page)).toHaveLength(5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (inspector 14/11/2026) — afirman lo correcto y hoy fallan
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos abiertos', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [contenido/medio] · Dálmata, Shar Pei y Mastín Español, en un grupo FCI que no es el suyo', async ({
    page,
  }) => {
    test.fail();
    // FCI: Dálmata, estándar 153, grupo 6 (sabuesos, sección 3); Shar Pei, 309, grupo 2 (molosos);
    // Mastín Español, 91, grupo 2 (molosos, tipo montaña). Del grupo 9 (compañía) quedan, de las
    // 40, estas siete; del grupo 1 (pastoreo), estas tres.
    await buscar(page, 'compañía');
    await expect(fichas(page)).toHaveText([
      'Bulldog Francés',
      'Caniche',
      'Chihuahua',
      'Shih Tzu',
      'Bichón Frisé',
      'Maltés',
      'Cavalier King Charles Spaniel',
    ]); // hoy: 9, con Dálmata y Shar Pei
    await buscar(page, 'pastoreo');
    await expect(fichas(page)).toHaveText(['Pastor Alemán', 'Border Collie', 'Malinois Belga']); // hoy: + Mastín Español
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [dato/medio] · el seguro de RC es obligatorio para todo perro, no «en varias comunidades»', async ({
    page,
  }) => {
    test.fail();
    // Ley 7/2023, art. 30.3: el titular de un perro «deberá contratar y mantener en vigor un seguro
    // de responsabilidad civil por daños a terceros» (cuantía, por reglamento). En vigor desde el
    // 29/09/2023. La guía (consejo y FAQ visible) lo limita a algunas comunidades autónomas.
    await abrirGuia(page);
    await expect(page.getByText(/obligatorio en (varias|muchas) comunidades/)).toHaveCount(0); // hoy: 2
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [dato/medio] · las fichas del Rottweiler y el Akita no dicen que son perros potencialmente peligrosos', async ({
    page,
  }) => {
    test.fail();
    // Real Decreto 287/2002, anexo I, letras d) Rottweiler y h) Akita Inu: licencia, registro y
    // seguro obligatorios. La guía solo dice que la licencia «es obligatoria para algunas razas».
    await expect(ficha(page, 'Rottweiler')).toContainText(/potencialmente peligros/i);
    await expect(ficha(page, 'Akita')).toContainText(/potencialmente peligros/i);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [accesibilidad/medio] · el grupo FCI y el mantenimiento, por debajo de 4,5:1 en claro', async ({
    page,
  }) => {
    test.fail();
    // Colores puestos en línea desde COLOR_GRUPO y COLOR_MANTENIMIENTO (texto de 11,5-12,8 px).
    // Medido el 14/11/2026: Teckel 1,93:1 · Sabueso 1,95:1 · mantenimiento «Medio» 1,88:1.
    expect(await contraste(ficha(page, 'Dachshund').getByText('Teckel', { exact: true }))).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(ficha(page, 'Beagle').getByText('Sabueso', { exact: true }))).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(ficha(page, 'Shar Pei').getByText('Medio', { exact: true }))).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [accesibilidad/medio] · el grupo FCI, por debajo de 4,5:1 en oscuro', async ({
    page,
  }) => {
    test.fail();
    await page.addInitScript(() => window.localStorage.setItem('meskeia-theme', 'dark'));
    await abrir(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // Medido el 14/11/2026: Lebrel 2,01:1 · Pinscher-Schnauzer 2,14:1.
    expect(await contraste(ficha(page, 'Whippet').getByText('Lebrel', { exact: true }))).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(ficha(page, 'Boxer').getByText('Pinscher-Schnauzer', { exact: true }))).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [contenido/medio] · la FAQ visible y el FAQPage responden distinto a las mismas dos preguntas', async ({
    page,
  }) => {
    test.fail();
    // «¿Qué raza de perro es más adecuada para vivir en un apartamento?» / «¿Qué raza es mejor para
    // un piso pequeño?» y las dos de «niños pequeños»: listas de razas distintas, y la visible calla
    // el aviso de evitar razas de guarda con niños muy pequeños. Reparada, es UNA constante que
    // leen las dos, y la respuesta del FAQPage está en la página.
    await abrirGuia(page);
    const visible = (await guia(page).innerText()).replace(/\s+/g, ' ');
    for (const q of await faqJsonLd(page)) {
      if (/apartamento|niños/.test(q.name)) {
        expect(visible, q.name).toContain(q.acceptedAnswer.text.replace(/\s+/g, ' '));
      }
    }
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [contenido/bajo] · el FAQPage promete una escala de mantenimiento de 1 a 5', async ({
    page,
  }) => {
    test.fail();
    // La ficha da tres niveles (Alto, Medio, Bajo); no hay escala de 1 a 5.
    const textos = (await faqJsonLd(page)).map((q) => q.acceptedAnswer.text).join('\n');
    expect(textos).not.toContain('escala de 1 a 5');
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [contenido/bajo] · la guía educativa contradice a las fichas (Caniche, Bichón, Whippet)', async ({
    page,
  }) => {
    test.fail();
    await abrirGuia(page);
    // La tabla da al Caniche tamaño «Variable»; su ficha (y el filtro) dicen «Mediano».
    const fila = page.getByRole('row').filter({ hasText: 'Caniche' });
    const tamanoTabla = ((await fila.getByRole('cell').nth(1).textContent()) ?? '').trim();
    await expect(ficha(page, 'Caniche').getByText(tamanoTabla, { exact: true })).toHaveCount(1); // hoy: 0
    // «Persona en piso»: «Razas de baja energía», con el Bichón Frisé, que en su ficha es «Media».
    await expect(ficha(page, 'Bichón Frisé')).toContainText(/⚡\s*Baja/);
    // FAQ visible: «un Whippet grande»; la ficha del Whippet dice «Mediano».
    await expect(page.getByText(/Whippet grande/)).toHaveCount(0);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [contenido/bajo] · curiosidades que se contradicen: Lady y el Setter de Nixon', async ({
    page,
  }) => {
    test.fail();
    // Las dos fichas de cocker atribuyen a Lady («La Dama y el Vagabundo») su propia raza.
    await buscar(page, 'cocker');
    await expect(fichas(page)).toHaveText(['Cocker Spaniel Inglés', 'Cocker Spaniel Americano']);
    await expect(page.locator('main article').filter({ hasText: 'La Dama y el Vagabundo' })).toHaveCount(1); // hoy: 2
    // Setter: «Nixon tenía uno llamado King Timahoe. Richard Nixon lo mencionó en su famoso
    // "Checkers Speech" de 1952, aunque Checkers era en realidad un Cocker Spaniel».
    await buscar(page, '');
    await expect(ficha(page, 'Setter Irlandés')).not.toContainText('lo mencionó en su famoso');
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [contenido/bajo] · formato: «60-150€/mes», «8%», «100%», «7 AM»', async ({
    page,
  }) => {
    test.fail();
    await abrirGuia(page);
    // Solo la app (fichas y guía educativa), no el pie ni las relacionadas.
    const texto = `${await page.locator('main').innerText()}\n${await guia(page).innerText()}`;
    expect(texto).not.toMatch(/\d€/); // moneda con espacio: 60-150 €
    expect(texto).not.toMatch(/\d%/); // porcentaje con espacio duro: 8 %
    expect(texto).not.toMatch(/\b7 AM\b/); // horas en 24 h: 7:00
  });

  test('HALLAZGO (14/11/2026, ABIERTO) [contenido/bajo] · «considerado sistemáticamente» el más inteligente, sin fuente', async ({
    page,
  }) => {
    test.fail();
    // §1.quinquies 1 y 3: un ranking (Coren, 1994) presentado como consenso.
    await expect(ficha(page, 'Border Collie')).not.toContainText('Considerado sistemáticamente');
    await expect(ficha(page, 'Caniche')).not.toContainText('Considerado sistemáticamente');
  });
});
