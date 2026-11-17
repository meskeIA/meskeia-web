import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * guia-metrica-estrofas — PRIMERA INSPECCIÓN (Inspector, 17/11/2026)
 *
 * La app promete en su <h1> «Métrica y Estrofas» y en su subtítulo «cómo contar sílabas, tipos de
 * verso, rima y las grandes estrofas de la poesía clásica». Tiene un CONTADOR de sílabas métricas
 * (motor propio en page.tsx: silabasPalabra → sinalefas entre palabras → ajuste por la última
 * palabra) y cuatro pestañas de fichas (tipos de verso, rima, estrofas, formas) con ejemplos de
 * autores. Lo comprobable: el cómputo métrico (sílabas fonológicas, sinalefa, diptongo/diéresis y la
 * ley del acento final: aguda +1, llana ±0, esdrújula −1) y que cada ficha cuadre con su definición.
 * No hay dato normativo ni fuente oficial en juego: la verdad es el cómputo hecho a mano.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — Quevedo, «Amor constante…», v. 7 (el soneto que la propia app reproduce):
 *       «nadar sabe mi llama la agua fría» → na-dar(2) sa-be(2) mi(1) lla-ma(2) la(1) a-gua(2)
 *       frí-a(2) = 12 · sinalefa «la_agua» −1 · «fría» llana ±0 → 11, endecasílabo.
 *     Sor Juana, redondilla, v. 1: «Hombres necios que acusáis» → hom-bres(2) ne-cios(2) que(1)
 *       a-cu-sáis(3) = 8 · sinalefa «que_acusáis» −1 · «acusáis» aguda +1 → 8, octosílabo.
 *
 *   CASO 2 (límite: la ley del acento final en sus tres salidas)
 *       aguda     «a la mujer sin razón» → a(1) la(1) mu-jer(2) sin(1) ra-zón(2) = 7, +1 → 8.
 *       esdrújula «Hemos perdido aun este crepúsculo» (la ficha «Decasílabo» de la app) → he-mos(2)
 *                 per-di-do(3) aun(1, sin tilde = «incluso», diptongo) es-te(2) cre-pús-cu-lo(4) = 12 ·
 *                 sinalefa «perdido_aun» −1 · esdrújula −1 → 10, decasílabo.
 *       llana     «La luna vino a la fragua» (el ejemplo del propio FAQPage) → la(1) lu-na(2) vi-no(2)
 *                 a(1) la(1) fra-gua(2) = 9 · «vino_a» −1 → 8.
 *       monosílabo final SIN tilde — Bécquer, Rima XXXVIII, v. 4: «¿sabes tú adónde va?» → sa-bes(2)
 *                 tú(1) a-dón-de(3) va(1) = 7 · «tú_adónde» −1 · «va» es monosílabo, tónico por
 *                 definición → aguda +1 → 7, heptasílabo. → HALLAZGO: la app lo trata como llana (6).
 *
 *   CASO 3 (difícil, y lo que debe rechazarse)
 *       «Verde que te quiero verde» (Lorca; la app lo usa en sus fichas de Romance y de Rima) →
 *           ver-de(2) que(1) te(1) quie-ro(2) ver-de(2) = 8, ninguna sinalefa, llana → 8, octosílabo.
 *           La «u» de «qu» no suena: «quie» es UNA sílaba. → HALLAZGO: la app da 9, eneasílabo.
 *       «12345 ¿?» → ninguna palabra: no hay verso que medir, no debe pintarse un cómputo.
 *           → HALLAZGO bajo: pinta «0», «-» y «Última palabra: -».
 *       «   » (solo espacios) → sin resultado. Coincide.
 *
 * Cómputos de los ejemplos de las fichas (a mano, verso a verso, en la tabla MANO de abajo):
 *   «Noche oscura» = no-che_os-cu-ra = 4 (la ficha la pone de PENTASÍLABO) · «Olas gigantes» = o-las
 *   gi-gan-tes = 5 (ficha: HEXASÍLABO) · «Del salón en el ángulo oscuro» = del-sa-lón-en-el-án-gu-lo_os-
 *   cu-ro = 10 (ficha: ENEASÍLABO; es el decasílabo de la Rima VII) · Darío, «Canción de otoño en
 *   primavera»: 9-9-9-9 (ficha Serventesio: «Cuatro endecasílabos») · haiku «salta una rana —el
 *   sonido» = sal-ta_u-na-ra-na_el-so-ni-do = 8 (ficha: 5-7-5) · «¡A las armas!» = a-las-ar-mas = 4 (la
 *   regla dice «5 sílabas») · «La hora» = la_ho-ra = 2 (el consejo dice «3 sílabas»).
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen fallarán por pasar y habrá
 * que quitarles el test.fail() (y cambiar ABIERTO por REPARADO). Cada uno afirma lo CORRECTO.
 */

const RUTA = '/guia-metrica-estrofas/';
const ENTRADA = 'input[aria-label="Verso para contar sílabas"]';
const NUMERO = '[class$="_contadorNumero"]';
const TIPO = '[class$="_contadorTipoVerso"]';
const INSIGNIA = '[class$="_contadorBadge"]';

/**
 * Sílabas métricas resueltas A MANO (sílabas fonológicas − sinalefas ± acento final). Las
 * derivaciones están en la cabecera y junto a cada test. Es la referencia: el contador de la app
 * solo se usa como juez donde coincide con esta tabla.
 */
const MANO: Record<string, number> = {
  'Noche oscura': 4,
  'Olas gigantes': 5,
  'Si de mi baja lira': 7,
  'Por las ramas del laurel': 8,
  'Del salón en el ángulo oscuro': 10,
  'Hemos perdido aun este crepúsculo': 10,
  'Yo no nací sino para quereros': 11,
  'La princesa está triste… ¿qué tendrá la princesa?': 14,
  'La princesa está triste, ¿qué tendrá la princesa?': 14,
  // Darío, «Canción de otoño en primavera» (ficha Serventesio): ju-ven-tud di-vi-no te-so-ro = 9 ·
  // ya-te-vas-pa-ra-no-vol-ver = 8 + 1 = 9 · cuan-do-quie-ro-llo-rar-no-llo-ro = 9 ·
  // y_a-ve-ces-llo-ro-sin-que-rer = 8 + 1 = 9
  'Juventud, divino tesoro,': 9,
  '¡ya te vas para no volver!': 9,
  'Cuando quiero llorar, no lloro...': 9,
  'y a veces lloro sin querer.': 9,
  // Haiku de Bashō (ficha Haiku): un-vie-jo_es-tan-que = 5 · sal-ta_u-na-ra-na_el-so-ni-do = 8 ·
  // del-a-gua_os-cu-ra = 5
  'Un viejo estanque,': 5,
  'salta una rana —el sonido': 8,
  'del agua oscura.': 5,
  '¡A las armas!': 4,
  'La hora': 2,
};

interface Conteo {
  silabas: number;
  tipo: string;
  insignias: string[];
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [ENTRADA]);
}

/**
 * Escribe el verso en el contador y lee lo que pinta. El contador vive en la primera pestaña
 * («Reglas y contador»); se vuelve a ella por POSICIÓN y no por nombre porque en móvil las pestañas
 * no tienen nombre accesible (es uno de los hallazgos, al final del fichero).
 */
async function contar(page: Page, verso: string): Promise<Conteo> {
  if ((await page.locator(ENTRADA).count()) === 0) await page.getByRole('tab').first().click();
  await page.locator(ENTRADA).fill(verso);
  await esperarValorEnReact(page, ENTRADA, verso);
  await expect(page.locator(NUMERO)).toHaveCount(1);
  return {
    silabas: Number(await page.locator(NUMERO).textContent()),
    tipo: ((await page.locator(TIPO).textContent()) ?? '').trim().toLowerCase(),
    insignias: (await page.locator(INSIGNIA).allTextContents()).map((t) => t.trim()),
  };
}

const sinComillas = (s: string): string => s.replace(/[“”]/g, '').trim();

/** «Endecasílabos» → 11: la medida que declara la cabecera de una ficha de estrofa. */
const MEDIDAS: Record<string, number> = {
  tetrasílabos: 4, pentasílabos: 5, hexasílabos: 6, heptasílabos: 7, octosílabos: 8,
  eneasílabos: 9, decasílabos: 10, endecasílabos: 11, dodecasílabos: 12, alejandrinos: 14,
};

function ultimaPalabra(verso: string): string {
  const palabras = verso.toLowerCase().match(/[a-záéíóúüñ]+/g) ?? [];
  return palabras[palabras.length - 1] ?? '';
}

/** Aproximación de la rima CONSONANTE: las tres últimas letras (-ado, -uda, -olo, -ía…). */
const colaConsonante = (verso: string): string => ultimaPalabra(verso).slice(-3);

/** Aproximación de la rima ASONANTE en palabra llana: sus dos últimas vocales, sin tilde. */
function colaAsonante(verso: string): string {
  const vocales = ultimaPalabra(verso)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^aeiou]/g, '');
  return vocales.slice(-2);
}

interface NodoLd {
  '@type'?: string;
  features?: unknown[];
  featureList?: unknown[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function jsonLd(page: Page): Promise<NodoLd[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      return ((j['@graph'] as Record<string, unknown>[] | undefined) ?? [j]) as unknown as NodoLd[];
    }),
  );
}

/** El texto de la guía educativa, aunque esté plegada (se oculta por CSS, sigue en el DOM). */
async function textoGuia(page: Page): Promise<string> {
  return ((await page.locator('[data-guia-educativa]').textContent()) ?? '').replace(/\s+/g, ' ');
}

function reglaCard(page: Page, titulo: string): Locator {
  // exact: «Sinalefa» casaría también con «Hiato (ruptura de sinalefa)»
  return page.locator('[class$="_reglaCard"]').filter({ has: page.getByRole('heading', { name: titulo, exact: true }) });
}

async function abrirEstrofa(page: Page, nombre: RegExp): Promise<Locator> {
  await page.getByRole('tab', { name: 'Estrofas' }).click();
  const cabecera = page.getByRole('tabpanel').getByRole('button', { name: nombre });
  await cabecera.click();
  await expect(cabecera).toHaveAttribute('aria-expanded', 'true');
  // El `has` se evalúa DENTRO de cada tarjeta: el localizador va sin el tabpanel delante.
  return page.locator('[class$="_estrofaCard"]').filter({ has: page.getByRole('button', { name: nombre }) });
}

async function forma(page: Page, nombre: string): Promise<Locator> {
  await page.getByRole('tab', { name: 'Formas poéticas' }).click();
  const tarjeta = page.locator('[class$="_formaCard"]').filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });
  await expect(tarjeta).toHaveCount(1);
  return tarjeta;
}

test.describe('guia-metrica-estrofas', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('estructura: h1, aviso legal y las cinco pestañas con su nombre en escritorio', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Métrica y Estrofas');
    await expect(page.getByRole('tab')).toHaveCount(5);
    for (const nombre of ['Reglas y contador', 'Tipos de verso', 'Rima', 'Estrofas', 'Formas poéticas']) {
      await expect(page.getByRole('tab', { name: nombre })).toBeVisible();
    }
    await expect(page.getByRole('tab', { name: 'Reglas y contador' })).toHaveAttribute('aria-selected', 'true');
  });

  test('CASO 1 (normal) · endecasílabo de Quevedo con sinalefa y octosílabo agudo de Sor Juana', async ({ page }) => {
    // na-dar(2) sa-be(2) mi(1) lla-ma(2) la(1) a-gua(2) frí-a(2) = 12 − 1 («la_agua») ± 0 (llana) = 11
    const quevedo = await contar(page, 'nadar sabe mi llama la agua fría');
    expect(quevedo.silabas).toBe(11);
    expect(quevedo.tipo).toBe('endecasílabo');
    expect(quevedo.insignias).toContain('1 sinalefa');
    expect(quevedo.insignias.join(' ')).toContain('llana');

    // hom-bres(2) ne-cios(2) que(1) a-cu-sáis(3) = 8 − 1 («que_acusáis») + 1 (aguda) = 8
    const sorJuana = await contar(page, 'Hombres necios que acusáis');
    expect(sorJuana.silabas).toBe(8);
    expect(sorJuana.tipo).toBe('octosílabo');
    expect(sorJuana.insignias).toContain('1 sinalefa');
    expect(sorJuana.insignias.join(' ')).toContain('aguda (+1)');
  });

  test('CASO 2 (límite) · la ley del acento final: aguda +1, esdrújula −1 y llana ±0', async ({ page }) => {
    // a(1) la(1) mu-jer(2) sin(1) ra-zón(2) = 7, aguda +1 → 8
    const aguda = await contar(page, 'a la mujer sin razón');
    expect(aguda.silabas).toBe(8);
    expect(aguda.insignias.join(' ')).toContain('aguda (+1)');

    // 12 fonológicas − 1 («perdido_aun») − 1 (esdrújula «crepúsculo») = 10, decasílabo
    const esdrujula = await contar(page, 'Hemos perdido aun este crepúsculo');
    expect(esdrujula.silabas).toBe(10);
    expect(esdrujula.tipo).toBe('decasílabo');
    expect(esdrujula.insignias.join(' ')).toContain('esdrújula (−1)');

    // El ejemplo del propio FAQPage: 9 − 1 («vino_a») ± 0 = 8
    const llana = await contar(page, 'La luna vino a la fragua');
    expect(llana.silabas).toBe(8);
    expect(llana.insignias).toContain('1 sinalefa');
    expect(llana.insignias.join(' ')).toContain('llana');
  });

  test('TESTIGO · los cinco botones de ejemplo dan su medida (11, 8, 7, 14 y 10)', async ({ page }) => {
    for (const [ejemplo, esperado] of [
      ['Yo no nací sino para quereros', 11], // ninguna sinalefa, llana
      ['Por las ramas del laurel', 8], // 7 + 1 (aguda)
      ['Si de mi baja lira', 7],
      ['La princesa está triste, ¿qué tendrá la princesa?', 14], // 15 − 1 («princesa_está»)
      ['Del salón en el ángulo oscuro', 10], // 11 − 1 («ángulo_oscuro»): DECASÍLABO
    ] as const) {
      await page.getByRole('button', { name: ejemplo, exact: true }).click();
      await esperarValorEnReact(page, ENTRADA, ejemplo);
      await expect(page.locator(NUMERO), ejemplo).toHaveText(String(esperado));
      expect(MANO[ejemplo]).toBe(esperado);
    }
  });

  test('TESTIGO · la corrección por acento se aplica a CADA verso: la redondilla de Sor Juana da 8 en los cuatro', async ({ page }) => {
    // Los cuatro terminan en aguda (acusáis, razón, ocasión, culpáis): sin el +1 serían heptasílabos.
    const redondilla = await abrirEstrofa(page, /Redondilla/);
    const versos = (await redondilla.locator('[class$="_estrofaVerso"]').allTextContents()).map((v) => v.trim());
    expect(versos).toEqual(['Hombres necios que acusáis', 'a la mujer sin razón,', 'sin ver que sois la ocasión', 'de lo mismo que culpáis.']);
    for (const v of versos) {
      const c = await contar(page, v);
      expect(c.silabas, v).toBe(8);
      expect(c.insignias.join(' '), v).toContain('aguda (+1)');
    }
  });

  test('TESTIGO · solo espacios no pinta ningún resultado', async ({ page }) => {
    await page.locator(ENTRADA).fill('   ');
    await esperarValorEnReact(page, ENTRADA, '   ');
    await expect(page.locator(NUMERO)).toHaveCount(0);
  });

  // ─────────────────────────────── HALLAZGOS DEL CONTADOR ───────────────────────────────

  test('HALLAZGO [calculo/alto] CASO 3 (difícil) · la «u» muda de «qu» cuenta como vocal: «quiero», «quien» suman una sílaba', async ({ page }) => {
    // REPARADO (hallazgo 4978). silabasPalabra() trataba la «u» de «qu» como núcleo: en «quie-» unía
    // u+i en un diptongo y dejaba la «e» como sílaba aparte (qu-i|e → 2 en vez de 1). Afectaba a
    // quiero, quien, siguiente… Ahora la «u» de «qu» y la de «gu» ante e/i no cuentan.
    // Control de «gu»: «guerra» = gue-rra (2) y «guapo» = gua-po (2: ante «a» la «u» sí suena).
    expect((await contar(page, 'guerra')).silabas).toBe(2);
    expect((await contar(page, 'guapo')).silabas).toBe(2);
    // Lorca (fichas Romance y Rima de la app): ver-de que te quie-ro ver-de = 8 · obtenido 9, eneasílabo
    // (expect.soft: cada verso es una comprobación aparte y el informe enseña las tres)
    const lorca = await contar(page, 'Verde que te quiero verde');
    expect.soft(lorca.silabas, 'Verde que te quiero verde').toBe(8);
    expect.soft(lorca.tipo).toBe('octosílabo');
    // Quevedo (soneto de la app), v. 9: 13 − 2 («Alma_a», «todo_un») = 11 · obtenido 12, dodecasílabo
    expect.soft((await contar(page, 'Alma a quien todo un dios prisión ha sido')).silabas, 'Alma a quien…').toBe(11);
    // Darío (ficha Serventesio): cuan-do quie-ro llo-rar no llo-ro = 9 · obtenido 10
    expect.soft((await contar(page, 'Cuando quiero llorar, no lloro...')).silabas, 'Cuando quiero llorar…').toBe(9);
  });

  test('HALLAZGO [calculo/alto] · la conjunción «y» no hace sinalefa: los ejemplos de romance, lira y décima de la app salen con una sílaba de más', async ({ page }) => {
    // REPARADO (hallazgo 4979). VOCALES = 'aeiouáéíóúü': la «y» conjunción (que suena /i/) nunca
    // contaba como vocal en contacto, así que «y_el», «pobre_y» no se fundían. Control: la «y»
    // consonante de «yo» no entra en sinalefa (ca-sa yo = 3, ninguna).
    const yo = await contar(page, 'casa yo');
    expect(yo.insignias.join(' ')).not.toContain('sinalefa');
    // Romance (Lorca), v. 4: y_el ca-ba-llo_en la mon-ta-ña = 10 − 2 = 8 · obtenido 9 (1 sinalefa)
    const romance = await contar(page, 'y el caballo en la montaña');
    expect.soft(romance.silabas, 'y el caballo en la montaña').toBe(8);
    expect.soft(romance.insignias).toContain('2 sinalefas');
    // Lira (Garcilaso), v. 5, un 11B: y la fu-ria del mar y_el mo-vi-mien-to = 12 − 1 = 11 · obtenido 12
    expect.soft((await contar(page, 'y la furia del mar y el movimiento')).silabas, 'y la furia…').toBe(11);
    // Décima (Calderón), v. 2: tan po-bre_y mí-se-ro_es-ta-ba = 10 − 2 = 8 · obtenido 9
    expect.soft((await contar(page, 'tan pobre y mísero estaba,')).silabas, 'tan pobre y mísero estaba').toBe(8);
  });

  test('HALLAZGO [calculo/medio] CASO 2 (límite) · un monosílabo final sin tilde se toma por llana y no suma 1', async ({ page }) => {
    // REPARADO (hallazgo 4981). acento() decidía por la última letra (vocal, n o s → llana) sin mirar
    // que la palabra tiene UNA sílaba: «va», «yo», «di», «fe» son tónicos y el verso es agudo.
    // Bécquer, Rima XXXVIII: sa-bes tú_a-dón-de va = 7 − 1 + 1 = 7 · obtenido 6, hexasílabo, «llana»
    const becquer = await contar(page, '¿sabes tú adónde va?');
    expect.soft(becquer.silabas, '¿sabes tú adónde va?').toBe(7);
    expect.soft(becquer.insignias.join(' '), '«va» es aguda').toContain('aguda (+1)');
    // Décima de Calderón, v. 6: 8 − 1 («pobre_y») + 1 («yo») = 8. La app da 8 por dos errores que se
    // anulan: ni ve la sinalefa ni el monosílabo, y lo explica como «llana (sin ajuste)».
    const calderon = await contar(page, 'más pobre y triste que yo?');
    expect.soft(calderon.silabas, 'más pobre y triste que yo').toBe(8);
    expect.soft(calderon.insignias, 'sinalefa «pobre_y»').toContain('1 sinalefa');
    expect.soft(calderon.insignias.join(' '), '«yo» es aguda').toContain('aguda (+1)');
  });

  test('HALLAZGO [calculo/medio] · la diéresis no separa: «süave», el ejemplo de la propia app, sale con 2 sílabas', async ({ page }) => {
    // REPARADO (hallazgo 4982). La regla «Diptongo y diéresis» dice que con diéresis las dos vocales
    // cuentan «como dos sílabas separadas (ü en palabras como "süave")»; esDiptongo() trataba la ü
    // como vocal débil átona.
    await expect(reglaCard(page, 'Diptongo y diéresis')).toContainText('süave');
    // (el contador SÍ resuelve bien la tilde que rompe el diptongo: «día» = dí-a = 2)
    expect((await contar(page, 'día')).silabas).toBe(2);
    // sü-a-ve = 3, llana → 3 · obtenido 2
    expect((await contar(page, 'süave')).silabas).toBe(3);
    // Control: la diéresis de «güi» no es poética, solo dice que la «u» suena: pin-güi-no = 3
    expect((await contar(page, 'pingüino')).silabas).toBe(3);
  });

  test('HALLAZGO [operativa/bajo] CASO 3 (rechazo) · una entrada sin letras pinta un cómputo «0 · - · Última palabra: -»', async ({ page }) => {
    // REPARADO (hallazgo 4996). Sin ninguna palabra no hay verso que medir: se avisa, no se pinta un 0.
    await page.locator(ENTRADA).fill('12345 ¿?');
    await esperarValorEnReact(page, ENTRADA, '12345 ¿?');
    await expect(page.getByText('No hay ninguna palabra que medir')).toBeVisible();
    await expect(page.locator(NUMERO)).toHaveCount(0);
    await expect(page.locator(TIPO)).toHaveCount(0);
  });

  // ─────────────────────────────── HALLAZGOS DE LAS FICHAS ───────────────────────────────

  test('HALLAZGO [contenido/alto] · tres fichas de «Tipos de verso» ilustran su medida con un verso de otra medida', async ({ page }) => {
    // ABIERTO. ESPERADO cada ejemplo mide lo que dice su ficha (a mano, y el contador de la app lo confirma)
    // OBTENIDO «Noche oscura» = 4 en la ficha Pentasílabo · «Olas gigantes» = 5 en Hexasílabo ·
    //          «Del salón en el ángulo oscuro» = 10 en Eneasílabo
    test.fail();
    await page.getByRole('tab', { name: 'Tipos de verso' }).click();
    const tarjetas = page.locator('[class*="_tipoCard"]');
    await expect(tarjetas).toHaveCount(8);
    const fichas: { medida: number; verso: string }[] = [];
    for (let i = 0; i < 8; i++) {
      fichas.push({
        medida: Number(await tarjetas.nth(i).locator('[class$="_tipoNumero"]').textContent()),
        verso: sinComillas((await tarjetas.nth(i).locator('em').textContent()) ?? ''),
      });
    }
    const descuadres: string[] = [];
    for (const f of fichas) {
      const c = await contar(page, f.verso);
      const aMano = MANO[f.verso];
      if (aMano !== undefined && aMano !== f.medida) descuadres.push(`«${f.verso}»: ficha ${f.medida}, a mano ${aMano}, contador ${c.silabas}`);
      else if (c.silabas !== f.medida) descuadres.push(`«${f.verso}»: ficha ${f.medida}, contador ${c.silabas}`);
    }
    expect(descuadres).toEqual([]);
  });

  test('HALLAZGO [contenido/medio] · la ficha Serventesio dice «Cuatro endecasílabos» y su ejemplo de Darío son eneasílabos', async ({ page }) => {
    // ABIERTO. ESPERADO los versos del ejemplo miden lo que declara la ficha (11)
    // OBTENIDO «Canción de otoño en primavera» va en eneasílabos: 9 · 9 · 9 · 9 (tabla MANO)
    test.fail();
    const ficha = await abrirEstrofa(page, /Serventesio/);
    const cabecera = (await ficha.getByRole('button').textContent()) ?? '';
    const nombreMedida = cabecera.toLowerCase().match(/[a-záéíóú]+sílabos|alejandrinos/)?.[0] ?? '';
    const declarada = MEDIDAS[nombreMedida];
    expect(declarada, `medida declarada en «${cabecera}»`).toBeTruthy();
    const versos = (await ficha.locator('[class$="_estrofaVerso"]').allTextContents()).map((v) => v.trim());
    expect(versos).toHaveLength(4);
    for (const v of versos) {
      const medida = MANO[v] ?? (await contar(page, v)).silabas;
      expect.soft(medida, v).toBe(declarada);
    }
  });

  test('HALLAZGO [contenido/medio] · el haiku de ejemplo es 5-8-5 y la ficha declara 5-7-5', async ({ page }) => {
    // ABIERTO. ESPERADO 5 · 7 · 5 (estructura de la ficha)
    // OBTENIDO 5 · 8 · 5: sal-ta_u-na-ra-na_el-so-ni-do = 8 (el contador de la app también da 8)
    test.fail();
    const haiku = await forma(page, 'Haiku');
    await expect(haiku.locator('[class$="_formaEstructura"]')).toHaveText('5 sílabas · 7 sílabas · 5 sílabas');
    const versos = (await haiku.locator('[class$="_formaVerso"]').allTextContents()).map((v) => v.trim());
    const medidas: number[] = [];
    for (const v of versos) medidas.push((await contar(page, v)).silabas);
    expect(medidas).toEqual([5, 7, 5]);
    for (const v of versos) if (MANO[v] !== undefined) expect(MANO[v], v).toBe(medidas[versos.indexOf(v)]);
  });

  test('HALLAZGO [contenido/medio] · la octava real de ejemplo no rima ABABABCC y es un texto «adaptado» atribuido a Ercilla', async ({ page }) => {
    // ABIERTO. ESPERADO A = v1, v3, v5 · B = v2, v4, v6 · C = v7, v8, en consonante
    // OBTENIDO v6 «congoja» no rima con «duda / sañuda»; el pareado «solo / vitola» no rima;
    //          atribución «La Araucana (adaptado) · Alonso de Ercilla»
    test.fail();
    const octava = await forma(page, 'Octava Real');
    await expect(octava).toContainText('ABABABCC');
    const versos = (await octava.locator('[class$="_formaVerso"]').allTextContents()).map((v) => v.trim());
    expect(versos).toHaveLength(8);
    const c = versos.map(colaConsonante);
    expect.soft([c[2], c[4]], 'rima A').toEqual([c[0], c[0]]);
    expect.soft([c[3], c[5]], 'rima B').toEqual([c[1], c[1]]);
    expect.soft(c[7], 'pareado C').toBe(c[6]);
    await expect.soft(octava.locator('[class$="_formaAtrib"]')).not.toContainText('adaptado', { timeout: 2000 });
  });

  test('HALLAZGO [contenido/medio] · el ejemplo de rima asonante empareja dos versos que no riman (é-e / á-a)', async ({ page }) => {
    // ABIERTO. ESPERADO dos versos con las mismas vocales desde la última tónica (p. ej. «ramas» /
    //          «montaña», á-a, del mismo romance)
    // OBTENIDO «Verde que te quiero verde» / «Verde viento. Verdes ramas» y el rótulo
    //          «-e / -a (e-e / a-a → solo vocales tónicas)», que además contradice la definición
    test.fail();
    await page.getByRole('tab', { name: 'Rima' }).click();
    const tarjeta = page.locator('[class$="_rimaTipoCard"]').filter({ has: page.getByRole('heading', { name: 'Rima asonante' }) });
    const versos = (await tarjeta.locator('[class$="_rimaVerso"]').allTextContents()).map(sinComillas);
    expect(versos).toHaveLength(2);
    expect.soft(colaAsonante(versos[1]), `${versos[0]} / ${versos[1]}`).toBe(colaAsonante(versos[0]));
    await expect.soft(tarjeta).not.toContainText('solo vocales tónicas', { timeout: 2000 });
  });

  test('HALLAZGO [contenido/medio] · el FAQPage da «aurora/hora» como rima asonante y es consonante (-ora)', async ({ page }) => {
    // ABIERTO. ESPERADO un par asonante de verdad: au-RO-ra / HO-ra coinciden en vocales Y consonantes
    //          desde la tónica («-ora»), que es la definición de consonante que da la misma respuesta
    // OBTENIDO «Por ejemplo, "aurora/hora" es asonante (ambas terminan en o-a)»
    test.fail();
    const faq = (await jsonLd(page)).find((n) => n['@type'] === 'FAQPage');
    const r = faq?.mainEntity?.find((q) => /rima consonante y rima asonante/.test(q.name))?.acceptedAnswer.text ?? '';
    expect(r.length).toBeGreaterThan(0);
    const par = r.match(/"([a-záéíóúñ]+)\/([a-záéíóúñ]+)" es asonante/);
    if (par) expect(colaConsonante(par[2]), par[0]).not.toBe(colaConsonante(par[1]));
  });

  test('HALLAZGO [contenido/medio] · los ejemplos de las reglas cuentan mal: «¡A las armas!» 5, «la hora» 3 y «poema» con sinalefa', async ({ page }) => {
    // ABIERTO. ESPERADO «¡A las armas!» = a-las-ar-mas = 4 · «La hora» = la_ho-ra = 2 · «poema» empieza
    //          por consonante: no puede hacer sinalefa con la palabra anterior (lo que lo deja en 2 es la
    //          sinéresis, poe-ma) · «dos vocales contiguas» forman diptongo solo si una es cerrada átona
    // OBTENIDO «5 sílabas» · «la-ho-ra = 3 sílabas, no 4» · «puede tener 2 sílabas métricas si forma
    //          sinalefa con la palabra anterior» · «Normalmente dos vocales contiguas … forman diptongo»
    //          y el título «Los diptongos son la excepción, no la regla»
    test.fail();
    const acento = reglaCard(page, 'Corrección por acento final');
    const dichoArmas = Number(((await acento.textContent()) ?? '').match(/(\d+) sílabas/)?.[1]);
    // El contador acierta (4); lo que falla es el texto de la regla
    expect((await contar(page, '¡A las armas!')).silabas).toBe(MANO['¡A las armas!']);
    expect.soft(dichoArmas, '¡A las armas! según la regla').toBe(MANO['¡A las armas!']);

    const guia = await textoGuia(page);
    const dichoHora = Number(guia.match(/la-ho-ra = (\d+) sílabas/)?.[1] ?? MANO['La hora']);
    expect((await contar(page, 'La hora')).silabas).toBe(MANO['La hora']);
    expect.soft(dichoHora, '«La hora» según el consejo').toBe(MANO['La hora']);

    // «este poema»: es-te po-e-ma = 5 y ninguna sinalefa posible (te + po); el contador lo sabe
    const poema = await contar(page, 'este poema');
    expect(poema.silabas).toBe(5);
    expect(poema.insignias.join(' ')).not.toContain('sinalefa');
    expect.soft(guia, '«poema» y la sinalefa').not.toContain('si forma sinalefa con la palabra anterior');

    await expect
      .soft(reglaCard(page, 'Diptongo y diéresis'), 'regla del diptongo')
      .not.toContainText('Normalmente dos vocales contiguas dentro de una misma palabra forman diptongo', { timeout: 2000 });
    expect.soft(guia, 'título del consejo').not.toContain('Los diptongos son la excepción, no la regla');
  });

  test('HALLAZGO [contenido/medio] · la guía enseña que la corrección por acento va solo en el último verso', async ({ page }) => {
    // ABIERTO. ESPERADO la corrección se aplica a CADA verso por su última palabra (es lo que hace el
    //          contador: ver el testigo de la redondilla, cuatro agudas y cuatro +1)
    // OBTENIDO «la corrección se aplica al último verso de cada unidad, no solo al primero» y «Si el
    //          último verso termina en palabra aguda, suma 1»
    test.fail();
    const guia = await textoGuia(page);
    expect.soft(guia, 'recuadro de confusiones').not.toContain('la corrección se aplica al último verso de cada unidad');
    expect.soft(guia, 'consejo del acento final').not.toContain('Si el último verso termina en palabra aguda');
  });

  test('HALLAZGO [contenido/bajo] · descripciones que contradicen a la propia app (heptasílabo «el más largo» de arte menor; pentasílabo en la lira)', async ({ page }) => {
    // ABIERTO. ESPERADO arte menor = 2 a 8 sílabas (FAQ visible) → el más largo es el octosílabo; la
    //          lira es 7a 11B 7a 7b 11B (ficha Lira): no lleva pentasílabos
    // OBTENIDO Heptasílabo: «El verso de arte menor más largo» · Pentasílabo: «especialmente en la
    //          lírica popular y en la lira»
    test.fail();
    await page.getByRole('tab', { name: 'Tipos de verso' }).click();
    const panel = page.getByRole('tabpanel');
    await expect(panel).toContainText('Octosílabo');
    await expect.soft(panel, 'heptasílabo').not.toContainText('El verso de arte menor más largo', { timeout: 2000 });
    const penta = page.locator('[class*="_tipoCard"]').filter({ hasText: 'Pentasílabo' });
    await expect.soft(penta, 'pentasílabo').not.toContainText('lira', { timeout: 2000 });
  });

  test('HALLAZGO [contenido/medio] · atribuciones que no casan: un «terceto» de las Soledades, que la propia app da como silva', async ({ page }) => {
    // ABIERTO. La ficha Silva dice que «Góngora la usó en las Soledades» (y cita su comienzo real, «Era
    // del año la estación florida»); la ficha Terceto atribuye a «Soledades» unos versos que abren la
    // dedicatoria del Polifemo, en octavas reales (sin fuente en la red para anclarlo: criterio C0203).
    // Sin anclar, en el acta: «Poema XX» para «Hemos perdido aun este crepúsculo», «Romance sonámbulo»
    // para «Por las ramas del laurel», «Noche oscura del alma» como título.
    test.fail();
    const silva = await forma(page, 'Silva');
    await expect(silva).toContainText('Soledades');
    const terceto = await abrirEstrofa(page, /Terceto/);
    await expect(terceto.locator('[class$="_estrofaAtrib"]')).not.toContainText('Soledades', { timeout: 2000 });
  });

  test('HALLAZGO [contenido/bajo] · el ejemplo de sinalefa subraya vocales que no se funden', async ({ page }) => {
    // ABIERTO. ESPERADO subrayadas las cuatro que se funden: la «a» de «la», la «a» inicial y la final
    //          de «alegría» y la «e» inicial de «eterna»
    // OBTENIDO la <u>a</u>l<u>e</u>gría <u>e</u>t<u>e</u>rna: subraya la «e» de «-le-» y la de «-ter-»
    //          y deja sin subrayar la «a» de «la» y la final de «alegría»
    test.fail();
    await expect(reglaCard(page, 'Sinalefa')).toContainText('la alegría eterna');
    const html = await reglaCard(page, 'Sinalefa').innerHTML();
    expect.soft(html, '«e» de «-le-»').not.toContain('l<u>e</u>gría');
    expect.soft(html, '«e» de «-ter-»').not.toContain('t<u>e</u>rna');
  });

  test('HALLAZGO [contenido/medio] · el JSON-LD promete ejemplos de Machado y versos desde el tetrasílabo, que no están', async ({ page }) => {
    // ABIERTO. ESPERADO cada característica, visible en la app
    // OBTENIDO «Ejemplos de Garcilaso, Machado, Lorca, Bécquer, Quevedo y más» (ningún verso de Machado)
    //          y «Tipos de verso: del tetrasílabo al alejandrino» (la pestaña empieza en el pentasílabo)
    test.fail();
    const app = (await jsonLd(page)).find((n) => n['@type'] === 'WebApplication');
    const features = ((app?.featureList ?? app?.features ?? []) as unknown[]).map(String);
    expect(features.length).toBeGreaterThanOrEqual(4);
    // El texto VISIBLE de la página: sin los <script>, que llevan el propio JSON-LD dentro.
    const textoVisible = async (): Promise<string> =>
      page.evaluate(() => {
        const clon = document.body.cloneNode(true) as HTMLElement;
        clon.querySelectorAll('script, style').forEach((n) => n.remove());
        return clon.textContent ?? '';
      });
    let todo = '';
    for (const nombre of ['Reglas y contador', 'Tipos de verso', 'Rima', 'Estrofas', 'Formas poéticas']) {
      await page.getByRole('tab', { name: nombre }).click();
      if (nombre === 'Estrofas') {
        const cabeceras = page.getByRole('tabpanel').getByRole('button');
        for (let i = 0; i < (await cabeceras.count()); i++) {
          await cabeceras.nth(i).click();
          todo += ' ' + (await textoVisible());
        }
      } else {
        todo += ' ' + (await textoVisible());
      }
    }
    if (features.some((f) => f.includes('Machado'))) expect.soft(todo, 'Machado en la página').toContain('Machado');
    if (features.some((f) => /tetrasílabo/i.test(f))) expect.soft(todo, 'ficha del tetrasílabo').toMatch(/Tetrasílabo/);
  });

  test('HALLAZGO [contenido/bajo] · el FAQPage pregunta por «el bachillerato» (Latam-friendly)', async ({ page }) => {
    // ABIERTO. ESPERADO «educación secundaria / preparatoria» (CLAUDE.md §1.bis; la respuesta ya dice
    //          «educación secundaria y preuniversitaria»)
    // OBTENIDO «¿Qué estrofas españolas son más habituales en el bachillerato y los comentarios de texto?»
    test.fail();
    const faq = (await jsonLd(page)).find((n) => n['@type'] === 'FAQPage');
    const preguntas = (faq?.mainEntity ?? []).map((q) => q.name);
    expect(preguntas.length).toBeGreaterThanOrEqual(5);
    for (const p of preguntas) expect(p).not.toMatch(/bachillerato/i);
  });
});

const PIXEL = devices['Pixel 7'];

test.describe('guia-metrica-estrofas en móvil', () => {
  test.use({
    viewport: PIXEL.viewport,
    userAgent: PIXEL.userAgent,
    deviceScaleFactor: PIXEL.deviceScaleFactor,
    isMobile: PIXEL.isMobile,
    hasTouch: PIXEL.hasTouch,
  });

  test('TESTIGO · el contador funciona en móvil (alejandrino de Darío = 14)', async ({ page }) => {
    await abrir(page);
    const c = await contar(page, 'La princesa está triste, ¿qué tendrá la princesa?');
    expect(c.silabas).toBe(14);
    expect(c.tipo).toBe('alejandrino');
  });

  test('HALLAZGO [accesibilidad/medio] · en ≤ 768 px las pestañas se quedan sin nombre accesible ni texto visible', async ({ page }) => {
    // REPARADO (hallazgo 4992). ESPERADO cada pestaña con nombre («Reglas y contador», «Tipos de verso»…)
    // OBTENIDO .tabNombre { display: none } en ≤ 768 px y el emoji va con aria-hidden: cinco role="tab"
    //          sin nombre, y en pantalla solo ✍️ 📏 🎵 🏛️ 📜. Ahora el nombre queda oculto solo a la
    //          vista, y el panel se nombra por su pestaña (aria-labelledby) y ellas lo controlan.
    await abrir(page);
    const pestanas = page.getByRole('tab');
    await expect(pestanas).toHaveCount(5);
    const nombres = ['Reglas y contador', 'Tipos de verso', 'Rima', 'Estrofas', 'Formas poéticas'];
    for (let i = 0; i < 5; i++) await expect(pestanas.nth(i)).toHaveAccessibleName(nombres[i], { timeout: 2000 });
    await page.getByRole('tab', { name: 'Rima' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Rima' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Rima' })).toHaveAttribute('aria-controls', 'panel-metrica');
  });
});
