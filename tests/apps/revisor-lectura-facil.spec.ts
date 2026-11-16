import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * revisor-lectura-facil — Inspector, primera inspección (16/11/2026)
 *
 * La app no calcula ningún índice de legibilidad (ni Fernández-Huerta ni Szigriszt): aplica trece
 * reglas por patrones sobre el texto. Los esperados de los tres casos están CONTADOS A MANO, frase a
 * frase y palabra a palabra, antes de abrir el navegador, aplicando los umbrales que la propia app
 * declara en «Las trece comprobaciones» (frase larga: más de 15 palabras, sugerencia distinta por
 * encima de 25; párrafo largo: más de 5 frases o más de 70 palabras; varias ideas: conector y más
 * de 12 palabras). No hay dato normativo: la UNE 153101:2018 EX solo se cita como inspiración.
 *
 * Los casos «HALLAZGO (…)» describían lo que DEBERÍA pasar y no pasaba. Reparados todos en /reparar
 * del 16/11/2026 (hallazgos 4812-4825): sin test.fail(), y comprobado que lo que afirman es lo correcto.
 */

const RUTA = '/revisor-lectura-facil/';
const AREA = '#texto-revisar';

async function escribir(page: Page, texto: string): Promise<void> {
  await page.locator(AREA).fill(texto);
  await esperarValorEnReact(page, AREA, texto);
}

/** El bloque de métricas (es la única sección con aria-live de la app). */
const metricas = (page: Page): Locator => page.locator('section[aria-live="polite"]');

/** La tarjeta de métrica cuyo rótulo es exactamente `rotulo`. */
const tarjeta = (page: Page, rotulo: string): Locator =>
  metricas(page).getByText(rotulo, { exact: true }).locator('xpath=..');

/** La cifra grande de una tarjeta (su primer span). */
const valor = (card: Locator): Locator => card.locator('span').first();

const panelFrases = (page: Page): Locator => page.getByRole('region', { name: 'Análisis frase a frase' });
const frases = (page: Page): Locator => panelFrases(page).locator('ol > li');
const avisosDe = (frase: Locator): Locator => frase.locator('ul > li');
/** «N palabras» de la cabecera de una frase (va antes que cualquier «Frase larga: N palabras»). */
const cabecera = (frase: Locator): Locator => frase.getByText(/^\d+ palabras?$/).first();
const filtros = (page: Page): Locator => page.getByRole('region', { name: 'Filtrar por tipo de aviso' });
const tablaSustituciones = (page: Page): Locator =>
  page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Dice' }) });

// ── Textos de los casos ──────────────────────────────────────────────────────────────────────

/** CASO 1: 8 + 20 + 6 palabras, en dos párrafos. */
const TEXTO_NORMAL =
  'Tienes que abonar la cuota antes del lunes.\n\n' +
  'La solicitud será revisada por la oficina en el plazo de tres meses desde el día en que la presentes. ' +
  'Te llamamos si falta algún papel.';

/** CASO 2: una frase por línea (cada línea es un párrafo), de 15, 16, 25 y 26 palabras. */
const UMBRALES = [
  'Mi hermana compra pan, leche y fruta en la tienda de la plaza cada mañana.',
  'Mi hermano compra pan, leche, queso y fruta en la tienda de la plaza cada tarde.',
  'Mi abuela compra pan, leche, queso, huevos, arroz, aceite y fruta en la tienda pequeña de la plaza mayor del pueblo cada lunes y jueves.',
  'Mi abuelo compra pan, leche, queso, huevos, arroz, aceite y fruta en la tienda pequeña de la plaza mayor del pueblo cada lunes y cada jueves.',
].join('\n');

const CINCO_FRASES = 'Hoy hace sol. Vamos al parque. Llevo la pelota. Mi perro corre mucho. Después comemos.';
const SEIS_FRASES = `${CINCO_FRASES} Luego volvemos a casa.`;

/** CASO 3: cinco frases (8, 9, 10, 10 y 14 palabras) que incumplen siete reglas distintas. */
const TEXTO_AVISOS =
  'Esto no vale sin la firma del titular. ' +
  'Debes enviar el formulario por email a la DGT. ' +
  'El 75 % de las personas lo hace en el plazo. ' +
  'Vamos a echar una mano a los vecinos del barrio. ' +
  'Mañana no abrimos la oficina porque el edificio entero está en obras de reforma.';

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [AREA]);
});

test.describe('Casos resueltos a mano', () => {
  test('CASO 1 (normal) · 3 frases en 2 párrafos: 34 palabras, 11,3 de media, 1 de 3 sin avisos y 3 avisos en 3 reglas', async ({ page, context }) => {
    // A mano: «Tienes que abonar la cuota antes del lunes.» = 8 palabras, tecnicismo «abonar» → pagar.
    // «La solicitud será revisada … la presentes.» = 20 palabras (> 15 y ≤ 25: «Busca dónde
    // cortarla en dos») y pasiva perifrástica «será revisada». «Te llamamos si falta algún papel.»
    // = 6 palabras, sin avisos. Total 34 palabras / 3 frases = 11,33 → «11,3»; 1 de 3 = 33 %.
    await escribir(page, TEXTO_NORMAL);

    const conformes = tarjeta(page, 'frases sin ningún aviso');
    await expect(valor(conformes)).toHaveText('1 de 3');
    await expect(conformes).toContainText(/33\s%\sdel texto/);
    const media = tarjeta(page, 'palabras por frase de media');
    await expect(valor(media)).toHaveText('11,3');
    await expect(media).toContainText('Dentro de la referencia de 15 palabras');
    const avisos = tarjeta(page, 'avisos en total');
    await expect(valor(avisos)).toHaveText('3');
    await expect(avisos).toContainText('repartidos en 3 reglas distintas');
    const palabras = tarjeta(page, 'palabras');
    await expect(valor(palabras)).toHaveText('34');
    await expect(palabras).toContainText('en 2 párrafos');

    // Filtros en el orden del catálogo de reglas: frase larga, voz pasiva, palabra difícil
    await expect(filtros(page).getByRole('button')).toHaveText([
      /^Todas \(3\)$/,
      /Frase larga \(1\)$/,
      /Voz pasiva \(1\)$/,
      /Palabra difícil \(1\)$/,
    ]);
    await expect(filtros(page).getByRole('button', { name: /^Todas/ })).toHaveAttribute('aria-pressed', 'true');

    await expect(frases(page)).toHaveCount(3);
    const [f1, f2, f3] = [frases(page).nth(0), frases(page).nth(1), frases(page).nth(2)];
    await expect(cabecera(f1)).toHaveText('8 palabras');
    await expect(avisosDe(f1)).toHaveText([/Palabra difícil: «abonar» → pagar/]);
    await expect(cabecera(f2)).toHaveText('20 palabras');
    await expect(avisosDe(f2)).toHaveText([
      /Frase larga: 20 palabras\s*Busca dónde cortarla en dos/,
      /Voz pasiva: «será revisada»/,
    ]);
    await expect(cabecera(f3)).toHaveText('6 palabras');
    await expect(f3).toContainText('Sin avisos.');

    const filas = tablaSustituciones(page).locator('tbody tr');
    await expect(filas).toHaveCount(1);
    await expect(filas.first().getByRole('cell')).toHaveText(['abonar', 'pagar']);

    // Las trece comprobaciones que promete (title de Twitter, cabecera de la sección)
    const reglas = page.getByRole('heading', { name: 'Las trece comprobaciones' }).locator('xpath=..');
    await expect(reglas.getByRole('heading', { level: 3 })).toHaveCount(13);

    // El informe copiado repite las mismas cifras
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Copiar informe completo' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Informe copiado al portapapeles' })).toBeVisible();
    // El portapapeles de Windows devuelve los saltos como CRLF: se normalizan antes de comparar
    const informe = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');
    expect(informe).toContain(
      'Palabras: 34\nFrases: 3\nMedia de palabras por frase: 11,3\nFrases sin ningún aviso: 1 de 3',
    );
    expect(informe).toContain('- Frase larga: 1\n- Voz pasiva: 1\n- Palabra difícil: 1');
    expect(informe).toContain('Frase 1 (8 palabras): Tienes que abonar la cuota antes del lunes.');
    expect(informe).toContain('Frase 2 (20 palabras):');
    expect(informe).not.toContain('Frase 3');
  });

  test('CASO 2 (límite) · 15 palabras sin aviso; 16 y 25, «Busca dónde cortarla»; 26, «Divídela en tres o cuatro»', async ({ page }) => {
    // Umbrales de la regla «Frase larga: más de 15 palabras»; por encima de 25 cambia la
    // sugerencia. Contadas a mano: 15, 16, 25 y 26 → 82 palabras, media 20,5, 1 de 4 (25 %).
    await escribir(page, UMBRALES);

    await expect(valor(tarjeta(page, 'frases sin ningún aviso'))).toHaveText('1 de 4');
    await expect(tarjeta(page, 'frases sin ningún aviso')).toContainText(/25\s%\sdel texto/);
    await expect(valor(tarjeta(page, 'palabras por frase de media'))).toHaveText('20,5');
    await expect(tarjeta(page, 'palabras por frase de media')).toContainText('Por encima de la referencia de 15 palabras');
    await expect(valor(tarjeta(page, 'avisos en total'))).toHaveText('3');
    await expect(tarjeta(page, 'avisos en total')).toContainText('repartidos en 1 regla distinta');
    await expect(valor(tarjeta(page, 'palabras'))).toHaveText('82');
    await expect(tarjeta(page, 'palabras')).toContainText('en 4 párrafos');

    await expect(frases(page)).toHaveCount(4);
    await expect(cabecera(frases(page).nth(0))).toHaveText('15 palabras');
    await expect(frases(page).nth(0)).toContainText('Sin avisos.');
    await expect(cabecera(frases(page).nth(1))).toHaveText('16 palabras');
    await expect(avisosDe(frases(page).nth(1))).toHaveText([/Frase larga: 16 palabras\s*Busca dónde cortarla en dos/]);
    await expect(cabecera(frases(page).nth(2))).toHaveText('25 palabras');
    await expect(avisosDe(frases(page).nth(2))).toHaveText([/Frase larga: 25 palabras\s*Busca dónde cortarla en dos/]);
    await expect(cabecera(frases(page).nth(3))).toHaveText('26 palabras');
    await expect(avisosDe(frases(page).nth(3))).toHaveText([/Frase larga: 26 palabras\s*Divídela en tres o cuatro frases/]);
  });

  test('CASO 2 (límite) · párrafo de 5 frases sin aviso y de 6 frases con «Párrafo largo»', async ({ page }) => {
    // «Más de 5 frases o de 70 palabras». 5 frases y 15 palabras → nada; 6 frases y 19 → aviso.
    await escribir(page, CINCO_FRASES);
    await expect(valor(tarjeta(page, 'frases sin ningún aviso'))).toHaveText('5 de 5');
    await expect(valor(tarjeta(page, 'avisos en total'))).toHaveText('0');
    await expect(filtros(page)).toHaveCount(0);
    await expect(page.getByText('Párrafo 1:', { exact: true })).toHaveCount(0);

    await escribir(page, SEIS_FRASES);
    await expect(valor(tarjeta(page, 'frases sin ningún aviso'))).toHaveText('6 de 6');
    // Con un solo aviso, en singular (hallazgo 4825)
    await expect(valor(tarjeta(page, 'aviso en total'))).toHaveText('1');
    await expect(page.getByText('Párrafo 1:', { exact: true }).locator('xpath=..')).toContainText(
      '6 frases y 19 palabras. Parte el párrafo.',
    );
    await expect(filtros(page).getByRole('button')).toHaveText([/^Todas \(1\)$/, /Párrafo largo \(1\)$/]);
  });

  test('CASO 2 (límite) · una sola palabra da 1 de 1 y media 1,0; un texto de solo espacios no da resultado', async ({ page }) => {
    await escribir(page, 'Hola');
    await expect(valor(tarjeta(page, 'frases sin ningún aviso'))).toHaveText('1 de 1');
    await expect(tarjeta(page, 'frases sin ningún aviso')).toContainText(/100\s%\sdel texto/);
    await expect(valor(tarjeta(page, 'palabras por frase de media'))).toHaveText('1,0');
    await expect(valor(tarjeta(page, 'avisos en total'))).toHaveText('0');
    await expect(frases(page)).toHaveCount(1);
    await expect(frases(page).first()).toContainText('Sin avisos.');

    await escribir(page, '   \n  ');
    await expect(metricas(page)).toHaveCount(0);
    await expect(panelFrases(page)).toHaveCount(0);
  });

  test('CASO 3 (debe avisar) · cinco frases que incumplen siete reglas: 0 de 5 sin avisos, 7 avisos en 7 reglas', async ({ page }) => {
    // A mano, frase a frase:
    //  1 «Esto no vale sin la firma del titular.» (8): «no … sin» → doble negación; empieza por
    //    «Esto» → referencia ambigua.
    //  2 «Debes enviar el formulario por email a la DGT.» (9): sigla «DGT» sin explicar (no es la
    //    primera frase del texto) y extranjerismo «email» → correo electrónico.
    //  3 «El 75 % de las personas lo hace en el plazo.» (10): porcentaje «75 %».
    //  4 «Vamos a echar una mano a los vecinos del barrio.» (10): figurado «echar una mano».
    //  5 «Mañana no abrimos la oficina porque … reforma.» (14 > 12): conector «porque».
    // 51 palabras / 5 frases = 10,2; un solo párrafo (5 frases, 51 palabras: no es largo).
    await escribir(page, TEXTO_AVISOS);

    await expect(valor(tarjeta(page, 'frases sin ningún aviso'))).toHaveText('0 de 5');
    await expect(valor(tarjeta(page, 'palabras por frase de media'))).toHaveText('10,2');
    await expect(valor(tarjeta(page, 'avisos en total'))).toHaveText('7');
    await expect(tarjeta(page, 'avisos en total')).toContainText('repartidos en 7 reglas distintas');
    await expect(valor(tarjeta(page, 'palabras'))).toHaveText('51');
    await expect(tarjeta(page, 'palabras')).toContainText('en 1 párrafo');

    await expect(frases(page)).toHaveCount(5);
    await expect(avisosDe(frases(page).nth(0))).toHaveText([/Doble negación/, /Referencia ambigua/]);
    await expect(avisosDe(frases(page).nth(1))).toHaveText([
      /Sigla sin explicar: «DGT»/,
      /Palabra extranjera: «email» → correo electrónico/,
    ]);
    await expect(avisosDe(frases(page).nth(2))).toHaveText([/Cifra complicada: «75 %»/]);
    await expect(avisosDe(frases(page).nth(3))).toHaveText([/Lenguaje figurado: «echar una mano» → ayudar/]);
    await expect(avisosDe(frases(page).nth(4))).toHaveText([/Varias ideas juntas: «porque»/]);

    const filas = tablaSustituciones(page).locator('tbody tr');
    await expect(filas).toHaveCount(2);
    await expect(filas.nth(0).getByRole('cell')).toHaveText(['email', 'correo electrónico']);
    await expect(filas.nth(1).getByRole('cell')).toHaveText(['echar una mano', 'ayudar']);

    // Un filtro deja solo las frases de esa regla
    await filtros(page).getByRole('button', { name: /Sigla sin explicar \(1\)/ }).click();
    await expect(frases(page)).toHaveCount(1);
    await expect(frases(page).first()).toContainText('la DGT.');
    await filtros(page).getByRole('button', { name: /^Todas/ }).click();
    await expect(frases(page)).toHaveCount(5);

    // Borrar vacía el área y retira el resultado
    await page.getByRole('button', { name: 'Borrar' }).click();
    await expect(page.locator(AREA)).toHaveValue('');
    await expect(metricas(page)).toHaveCount(0);
  });

  test('El texto no sale del navegador: escribir no lanza ninguna petición que lo lleve', async ({ page }) => {
    // Promesa de la página («El texto no se envía a ningún servidor») y de la característica
    // «El texto se analiza en el navegador» del JSON-LD.
    const marca = 'Zarzaparrilla secreta de prueba.';
    const conElTexto: string[] = [];
    page.on('request', (r) => {
      const cuerpo = r.postData() ?? '';
      if (r.url().includes('Zarzaparrilla') || cuerpo.includes('Zarzaparrilla')) conElTexto.push(r.url());
    });
    await escribir(page, marca);
    await expect(frases(page)).toHaveCount(1);
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(frases(page)).toHaveCount(4);
    expect(conElTexto).toEqual([]);
  });

  test('Control · un romano de verdad y una abreviatura de verdad siguen avisando', async ({ page }) => {
    // Las reparaciones de 4814 y 4818 acotan los patrones; no deben dejarlos mudos.
    await escribir(page, 'Vivimos en el siglo XXI. Llama al tel. de la oficina.');
    await expect(frases(page)).toHaveCount(2);
    await expect(frases(page).nth(0)).toContainText('Cifra complicada: «XXI»');
    await expect(frases(page).nth(1)).toContainText('Abreviatura: «tel.»');
  });

  test('Control · la sigla seguida de su nombre entre paréntesis no avisa', async ({ page }) => {
    await escribir(page, 'Llama al SEPE (Servicio de Empleo) por la mañana.');
    await expect(frases(page).first()).toContainText('Sin avisos.');
  });
});

test.describe('Hallazgos de la primera inspección (16/11/2026)', () => {
  // ── HALLAZGO siglas (alto, REPARADO) ─────────────────────────────────────────────────────────
  // La propia sugerencia dice «Escribe el nombre completo la primera vez y la sigla entre
  // paréntesis», pero el motor solo da por explicada «SIGLA (…)» o «(…) SIGLA»: el formato que
  // recomienda, «Nombre completo (SIGLA)», sigue avisando. Y avisa en cada frase, no solo la
  // primera vez (característica del JSON-LD: «sin explicar la primera vez»).
  test('HALLAZGO siglas (alto, REPARADO) · «Servicio de Empleo (SEPE)», el formato que recomienda la app, no debe avisar', async ({ page }) => {
    await escribir(page, 'Llama al Servicio de Empleo (SEPE) por la mañana.');
    await expect(frases(page).first()).toContainText('Sin avisos.');
  });

  test('HALLAZGO siglas (alto, REPARADO) · explicada la primera vez, la sigla no debe avisar en la frase siguiente', async ({ page }) => {
    await escribir(page, 'La Oficina de Empleo (SEPE) abre hoy. El SEPE cierra a las tres.');
    await expect(frases(page)).toHaveCount(2);
    await expect(panelFrases(page)).not.toContainText('Sigla sin explicar');
  });

  // ── HALLAZGO pasiva refleja (medio, REPARADO) ────────────────────────────────────────────────
  // El regex termina en \b, que en JavaScript sin la bandera «u» solo conoce [A-Za-z0-9_]: tras
  // «á» u «ó» no hay frontera de palabra si sigue un espacio o un punto. Las terminaciones -ará,
  // -erá, -irá y -ó, que el propio regex enumera, no casan nunca; en -arán casa «-ará» y la cita
  // sale truncada. El ejemplo de la app, «la solicitud se entenderá desestimada», no avisa.
  test('HALLAZGO pasiva refleja (medio, REPARADO) · «se revisará» debe avisar de voz pasiva', async ({ page }) => {
    await escribir(page, 'Mañana se revisará tu solicitud.');
    await expect(frases(page).first()).toContainText('Voz pasiva: «se revisará»');
  });

  test('HALLAZGO pasiva refleja (medio, REPARADO) · «se aprobó» debe avisar de voz pasiva', async ({ page }) => {
    await escribir(page, 'El lunes se aprobó la ayuda.');
    await expect(frases(page).first()).toContainText('Voz pasiva: «se aprobó»');
  });

  test('HALLAZGO pasiva refleja (medio, REPARADO) · «se revisarán» debe citarse entero, no como «se revisará»', async ({ page }) => {
    await escribir(page, 'Mañana se revisarán las solicitudes.');
    await expect(frases(page).first()).toContainText('Voz pasiva: «se revisarán»');
  });

  // ── HALLAZGO abreviaturas dentro de palabras (medio, REPARADO) ───────────────────────────────
  // dividirFrases protege «tel.», «dra.», «dr.»… buscándolas como SUBCADENA, así que «hotel.»,
  // «piedra.», «cartel.» o «Sandra.» no cierran la frase: dos frases se funden en una (y salta
  // «Frase larga») y además se avisa de una abreviatura que no existe.
  test('HALLAZGO abreviaturas (medio, REPARADO) · «… en el hotel. Después …» son 2 frases (10 y 9 palabras) sin avisos', async ({ page }) => {
    await escribir(
      page,
      'Mañana por la mañana dormiremos todos juntos en el hotel. Después iremos andando hasta la playa con los niños.',
    );
    await expect(frases(page)).toHaveCount(2);
    await expect(cabecera(frases(page).nth(0))).toHaveText('10 palabras');
    await expect(panelFrases(page)).not.toContainText('Abreviatura');
  });

  // ── HALLAZGO filtro sin salida (medio, REPARADO) ─────────────────────────────────────────────
  // Con un filtro de regla activo, si al corregir el texto ya no queda ningún aviso, el panel de
  // filtros desaparece (solo se pinta con avisos) pero el filtro sigue puesto: «Frases con el
  // aviso «Sigla sin explicar» · No hay frases con ese aviso.» y ningún botón para volver a Todas.
  test('HALLAZGO filtro sin salida (medio, REPARADO) · al quedar el texto sin avisos se debe ver la frase o poder volver a «Todas»', async ({ page }) => {
    await escribir(page, 'Hoy la OMS publica datos.');
    const sigla = filtros(page).getByRole('button', { name: /Sigla sin explicar \(1\)/ });
    await sigla.click();
    await expect(sigla).toHaveAttribute('aria-pressed', 'true');
    await escribir(page, 'Hoy la gente publica datos.');
    await expect(
      panelFrases(page)
        .getByText('Hoy la gente publica datos.')
        .or(filtros(page).getByRole('button', { name: /^Todas/ }))
        .first(),
    ).toBeVisible();
  });

  // ── HALLAZGO FAQ duplicada (medio, REPARADO) ─────────────────────────────────────────────────
  // Tres preguntas están en la FAQ visible y en el FAQPage con otra redacción («¿Cuántas
  // palabras…?», «¿… certificar…?», «¿… cifras y los porcentajes?»). check:faq-unica no las ve
  // porque el enunciado también cambia. La del FAQPage sobre la longitud añade que se señalan las
  // frases que encadenan ideas «aunque sean cortas», y el motor exige más de 12 palabras.
  async function respuestasFaq(page: Page): Promise<{ visibles: Map<string, string>; jsonLd: Map<string, string> }> {
    const claves: [string, RegExp][] = [
      ['longitud', /cuántas palabras/i],
      ['certificar', /certificar/i],
      ['cifras', /cifras y los porcentajes/i],
    ];
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques
      .map((t) => JSON.parse(t) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
      .find((b) => b['@type'] === 'FAQPage');
    const jsonLd = new Map<string, string>();
    for (const q of faq?.mainEntity ?? []) {
      const clave = claves.find(([, re]) => re.test(q.name));
      if (clave) jsonLd.set(clave[0], q.acceptedAnswer.text.replace(/\s+/g, ' ').trim());
    }
    const visibles = new Map<string, string>();
    const preguntas = page.locator('p').filter({ hasText: /^¿[^?]*\?$/ });
    for (const texto of await preguntas.allTextContents()) {
      const clave = claves.find(([, re]) => re.test(texto));
      if (!clave) continue;
      const respuesta = await page
        .locator('p', { hasText: texto })
        .filter({ hasText: /^¿[^?]*\?$/ })
        .first()
        .locator('xpath=following-sibling::p[1]')
        .textContent();
      visibles.set(clave[0], (respuesta ?? '').replace(/\s+/g, ' ').trim());
    }
    return { visibles, jsonLd };
  }

  test('HALLAZGO FAQ duplicada (medio, REPARADO) · una pregunta que está en las dos FAQ debe tener UNA respuesta', async ({ page }) => {
    const { visibles, jsonLd } = await respuestasFaq(page);
    expect(visibles.size + jsonLd.size).toBeGreaterThan(0);
    for (const [clave, respuesta] of jsonLd) {
      if (visibles.has(clave)) expect(visibles.get(clave), `pregunta «${clave}»`).toBe(respuesta);
    }
  });

  test('HALLAZGO FAQ duplicada (medio, REPARADO) · si el FAQPage dice «aunque sean cortas», una frase corta con «porque» debe avisar', async ({ page }) => {
    const { jsonLd, visibles } = await respuestasFaq(page);
    const prometeCortas = /aunque sean cortas/.test([...jsonLd.values(), ...visibles.values()].join(' '));
    await escribir(page, 'Mañana no abrimos porque hay obras.');
    if (prometeCortas) await expect(frases(page).first()).toContainText('Varias ideas juntas');
  });

  // ── HALLAZGO umbrales de la FAQ (bajo, REPARADO) ─────────────────────────────────────────────
  // Las dos FAQ dicen que «avisa a partir de 15 palabras y marca como grave a partir de 25». El
  // motor avisa con MÁS de 15 (16 en adelante, como dice la tarjeta de la regla) y no marca nada
  // como grave: el aviso de 26 palabras lleva la misma severidad que el de 16; solo cambia el
  // consejo. La reparación natural es el texto, no el motor (CASO 2 fija el umbral de la regla).
  test('HALLAZGO umbrales de la FAQ (bajo, REPARADO) · si la FAQ dice «a partir de 15», una frase de 15 palabras debe avisar', async ({ page }) => {
    const { jsonLd, visibles } = await respuestasFaq(page);
    const dice15 = /a partir de 15/.test([...jsonLd.values(), ...visibles.values()].join(' '));
    await escribir(page, UMBRALES.split('\n')[0]);
    if (dice15) await expect(frases(page).first()).toContainText('Frase larga');
  });

  test('HALLAZGO umbrales de la FAQ (bajo, REPARADO) · si la FAQ dice «grave a partir de 25», el aviso de 26 palabras debe marcarse distinto del de 16', async ({ page }) => {
    const { jsonLd, visibles } = await respuestasFaq(page);
    const diceGrave = /grave a partir de 25/.test([...jsonLd.values(), ...visibles.values()].join(' '));
    await escribir(page, UMBRALES);
    const clase16 = await avisosDe(frases(page).nth(1)).first().getAttribute('class');
    const clase26 = await avisosDe(frases(page).nth(3)).first().getAttribute('class');
    if (diceGrave) expect(clase26).not.toBe(clase16);
  });

  // ── HALLAZGO mayúsculas (bajo, REPARADO) ─────────────────────────────────────────────────────
  // Siglas y romanos se buscan con \b ASCII: «ATENCIÓN» sale como dos «siglas», «ATENCI» y «ÓN»;
  // y «DVD» o «CD», que la app tolera como siglas, salen como «Cifra complicada» (romanos).
  test('HALLAZGO mayúsculas (bajo, REPARADO) · «ATENCIÓN» no debe trocearse en las siglas «ATENCI» y «ÓN»', async ({ page }) => {
    await escribir(page, 'Lee con ATENCIÓN las instrucciones del aviso.');
    await expect(frases(page)).toHaveCount(1);
    await expect(frases(page).first()).not.toContainText('«ÓN»');
  });

  test('HALLAZGO mayúsculas (bajo, REPARADO) · «DVD», sigla tolerada, no es un número romano', async ({ page }) => {
    await escribir(page, 'Compra un DVD en la tienda.');
    await expect(frases(page)).toHaveCount(1);
    await expect(frases(page).first()).not.toContainText('Cifra complicada');
  });

  // ── HALLAZGO cifras (bajo, REPARADO) ─────────────────────────────────────────────────────────
  // contarPalabras usa \w+, que parte una cifra por sus separadores: «1.500.000» cuenta 3
  // palabras (el ejemplo de la app da 107 palabras en vez de 106 por «68,4»). Y la cita de la
  // cifra sale troceada: «1.500» por «1.500.000», «68,4» y «4 %» por «68,4 %».
  test('HALLAZGO cifras (bajo, REPARADO) · «Pagan 1.500.000 euros.» son 3 palabras', async ({ page }) => {
    await escribir(page, 'Pagan 1.500.000 euros.');
    await expect(cabecera(frases(page).first())).toHaveText('3 palabras');
  });

  test('HALLAZGO cifras (bajo, REPARADO) · «68,4 %» no debe citarse como «4 %»', async ({ page }) => {
    await escribir(page, 'El 68,4 % aprueba.');
    await expect(frases(page).first()).toContainText('Cifra complicada');
    await expect(frases(page).first()).not.toContainText('«4 %»');
  });

  // ── HALLAZGO sílabas (bajo, REPARADO) ────────────────────────────────────────────────────────
  // «Cinco sílabas o más»: a-yun-ta-mien-to y a-e-ro-puer-to tienen cinco y más de 9 letras, pero
  // contarSilabas cuenta cuatro (la «y» entre vocales se toma por vocal y el hiato «ae» no se parte).
  test('HALLAZGO sílabas (bajo, REPARADO) · «ayuntamiento» y «aeropuerto» (5 sílabas) son palabras muy largas', async ({ page }) => {
    await escribir(page, 'Ve al ayuntamiento o al aeropuerto.');
    await expect(frases(page).first()).toContainText(/Palabra muy larga: .*«ayuntamiento».*«aeropuerto»/);
  });

  // ── HALLAZGO diccionarios (bajo, REPARADO) ───────────────────────────────────────────────────
  // «implementar» propone «poner en marcha», que la propia app marca como lenguaje figurado; y
  // «perceptivo» (relativo a la percepción) propone «obligatorio», que es el sentido de «preceptivo».
  test('HALLAZGO diccionarios (bajo, REPARADO) · la alternativa que propone para «implementar» no debe disparar otro aviso', async ({ page }) => {
    await escribir(page, 'Vamos a implementar el plan.');
    const fila = tablaSustituciones(page).locator('tbody tr').filter({ hasText: 'implementar' });
    const alternativa = ((await fila.getByRole('cell').nth(1).textContent()) ?? '').trim();
    expect(alternativa).not.toBe('');
    await escribir(page, `Vamos a ${alternativa} el plan.`);
    await expect(frases(page).first()).toContainText('Sin avisos.');
  });

  test('HALLAZGO diccionarios (bajo, REPARADO) · «perceptivo» no debe proponerse como «obligatorio»', async ({ page }) => {
    await escribir(page, 'El sistema perceptivo humano es complejo.');
    await expect(frases(page)).toHaveCount(1);
    await expect(frases(page).first()).not.toContainText('«perceptivo» → obligatorio');
  });

  // ── HALLAZGO patrones literales (bajo, REPARADO) ─────────────────────────────────────────────
  test('HALLAZGO patrones literales (bajo, REPARADO) · «Aporte la documentación» debe avisar del tecnicismo como «aportar»', async ({ page }) => {
    // El diccionario solo casa el infinitivo como prefijo: el imperativo administrativo
    // («Aporte», «Abone», «Subsane», «Acredite») no avisa nunca.
    await escribir(page, 'Aporte la documentación antes del lunes.');
    await expect(frases(page).first()).toContainText(/Palabra difícil: «aport/);
  });

  test('HALLAZGO patrones literales (bajo, REPARADO) · «…, sin embargo, …» en una frase de 18 palabras debe avisar de varias ideas', async ({ page }) => {
    // El conector se busca rodeado de espacios: seguido de coma, como se escribe casi siempre
    // «sin embargo» y «no obstante», no se encuentra.
    await escribir(
      page,
      'Llegamos tarde al trabajo, sin embargo, nadie dijo nada al jefe ni a los compañeros de la oficina.',
    );
    await expect(frases(page).first()).toContainText('Varias ideas juntas');
  });

  test('HALLAZGO patrones literales (bajo, REPARADO) · «Es cada vez más caro» no es voz pasiva', async ({ page }) => {
    // «es» + cualquier palabra acabada en -ada/-ido casa como participio: «es cada», «es nada», «es vida».
    await escribir(page, 'Es cada vez más caro.');
    await expect(frases(page)).toHaveCount(1);
    await expect(frases(page).first()).not.toContainText('Voz pasiva');
  });

  // ── HALLAZGO salto de línea (bajo, REPARADO) ─────────────────────────────────────────────────
  // Cada salto de línea es un párrafo nuevo y parte la frase: un texto pegado de un PDF, con los
  // renglones cortados, nunca da «Frase larga».
  test('HALLAZGO salto de línea (bajo, REPARADO) · una frase de 23 palabras partida en dos renglones sigue siendo una frase larga', async ({ page }) => {
    await escribir(
      page,
      'La solicitud de la ayuda será revisada por la oficina\nen el plazo de tres meses desde el día en que la presentes.',
    );
    await expect(frases(page)).toHaveCount(1);
    await expect(frases(page).first()).toContainText('Frase larga: 23 palabras');
  });

  // ── HALLAZGO filtro de párrafo (bajo, REPARADO) ──────────────────────────────────────────────
  test('HALLAZGO filtro de párrafo (bajo, REPARADO) · con «Párrafo largo» no debe decir «No hay frases con ese aviso» bajo el aviso del párrafo', async ({ page }) => {
    await escribir(page, SEIS_FRASES);
    await filtros(page).getByRole('button', { name: /Párrafo largo \(1\)/ }).click();
    await expect(page.getByText('Párrafo 1:', { exact: true })).toBeVisible();
    await expect(panelFrases(page).getByText('No hay frases con ese aviso.')).toHaveCount(0);
  });

  // ── HALLAZGO formato (bajo, REPARADO) ────────────────────────────────────────────────────────
  test('HALLAZGO formato (bajo, REPARADO) · con una palabra y un aviso, singular: «1 palabra», «1 aviso en total»', async ({ page }) => {
    await escribir(page, 'Hola');
    await expect(cabecera(frases(page).first())).toHaveText('1 palabra');
    await escribir(page, SEIS_FRASES);
    await expect(metricas(page).getByText('aviso en total', { exact: true })).toBeVisible();
  });

  test('HALLAZGO formato (bajo, REPARADO) · el % va separado con espacio duro (U+00A0)', async ({ page }) => {
    // Formato español del proyecto (decidido el 25/09/2026): «33 %» con U+00A0, para que el % no
    // salte solo de renglón. Hoy lleva un espacio normal (también en las dos FAQ y en el ejemplo).
    await escribir(page, TEXTO_NORMAL);
    const nota = await tarjeta(page, 'frases sin ningún aviso').textContent();
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.locator(AREA)).toHaveValue(/68,4 %/);
    expect(nota ?? '').toContain('33 %');
  });
});
