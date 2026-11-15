import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * estimacion-deduccion-discapacidad — el mínimo valorado al tipo marginal
 * Escrita el 12/09/2026, tras reparar el defecto.
 *
 * QUÉ DEFECTO VIGILA
 * ──────────────────
 * Es el mismo error del art. 63.1.2.º LIRPF con otra forma. Aquí no había ninguna base de la
 * que restar: la app pedía al usuario su tipo marginal y publicaba `ahorro = mínimo × marginal`,
 * con el texto «el mínimo reduce la base liquidable, no la cuota».
 *
 * La premisa es falsa. El mínimo NO reduce la base: forma parte de la base liquidable general
 * y se grava a tipo cero aplicando la escala dos veces y restando. La consecuencia práctica es
 * que **el ahorro no depende del tipo marginal de quien declara**: el mínimo se valora siempre
 * a los tipos bajos de la escala. La app SOBREESTIMABA el ahorro hasta más del doble — con el
 * mínimo máximo de 12.000 € y un marginal del 45 % publicaba 5.400 € donde la ley da 2.535 €.
 *
 * El parámetro `tipoMarginal` desapareció con el defecto, aquí y en la tool
 * `calcular_deduccion_discapacidad` del MCP de Delegum, porque no interviene en el resultado.
 *
 * Normas verificadas en sesión el 12/09/2026 contra la AEAT (manual de ayuda de Renta 2025,
 * «8.4.3.1 Cuota íntegra estatal»; arts. 60 y 61 LIRPF para los importes del mínimo).
 *
 * CÓMO SE CALCULA EL AHORRO, A MANO
 * ─────────────────────────────────
 * Es lo que la escala aplica al mínimo por discapacidad ENCIMA del mínimo personal de 5.550 €:
 *     ahorro = escala(5.550 + mínimo) − escala(5.550)
 * Escala: 12.450 @19 % · 20.200 @24 % · 35.200 @30 % …
 *
 *   mínimo  3.000 € → escala(8.550) − escala(5.550)  = 3.000×19 %                 =   570,00 €
 *   mínimo  6.000 € → escala(11.550) − escala(5.550) = 6.000×19 %                 = 1.140,00 €
 *   mínimo  9.000 € → escala(14.550) − escala(5.550) = 6.900×19 % + 2.100×24 %    = 1.815,00 €
 *   mínimo 12.000 € → escala(17.550) − escala(5.550) = 6.900×19 % + 5.100×24 %    = 2.535,00 €
 *
 * Es una cota INFERIOR: quien tenga además mínimos por descendientes o ascendientes los apila
 * debajo, y el de discapacidad cae en tramos algo más altos.
 *
 * ── Inspección del 15/11/2026 (primera, segmento fiscal) ─────────────────────────────────
 * Fuentes de los esperados, leídas ese día:
 *   · `data/fiscal/irpf.ts`: TRAMOS_IRPF_2025 (19 % hasta 12.450 · 24 % hasta 20.200 · 30 %
 *     hasta 35.200), MINIMOS_IRPF_2025.personal = 5.550, `calcularCuotaIntegraGeneral`.
 *   · `data/fiscal/dependencia.ts`: DEDUCCIONES_IRPF_DISCAPACIDAD_2025 (3.000 / 9.000 + 3.000).
 *   · BOE, Ley 35/2006 consolidada (BOE-A-2006-20764): art. 60.1 y 60.2 (3.000 / 9.000 € y
 *     3.000 € por asistencia ante «ayuda de terceras personas o movilidad reducida, o un grado
 *     de discapacidad igual o superior al 65 por ciento»), art. 60.3 (pensionistas de
 *     incapacidad permanente total, absoluta o gran invalidez → grado ≥ 33 %; ≥ 65 % solo para
 *     la incapacidad declarada judicialmente), art. 61.3.ª (circunstancias a la fecha de
 *     devengo), art. 19.2.f (+3.500 € / +7.750 € de gastos para trabajadores activos con
 *     discapacidad) y art. 81 bis (hasta 1.200 €/año por descendiente o ascendiente con
 *     discapacidad, con abono anticipado).
 *
 * El motor da lo que la ley pide para las cuatro combinaciones que admite la app (casos 3-5).
 * Los casos con `test.fail()` vigilan hallazgos ABIERTOS de esa inspección: el día que se
 * reparen darán «unexpectedly passed» y hay que quitarles la marca y dejar el caso como
 * comprobación normal.
 *
 * Nota sobre el test «ya no se pregunta el tipo marginal»: su `toContainText('cota inferior')`
 * sigue valiendo desde el 15/11/2026 porque la nota ya condiciona la cota a la base mínima
 * (caso REPARADO «cota inferior»).
 *
 * ── Reparación del 15/11/2026 ─────────────────────────────────────────────────────────────
 * Las etiquetas de grado llevan ahora «%» con espacio duro: los localizadores por nombre dicen
 * «Del 33 % al 64 %» y «65 % o superior» (Playwright normaliza el U+00A0 a espacio).
 * Arts. 58.1, 59.1, 60.3 y 61 (reglas 2.ª, 3.ª y 5.ª) releídos ese día en el BOE consolidado.
 */

const RUTA = '/estimacion-deduccion-discapacidad/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

async function fila(page: Page, etiqueta: string): Promise<string> {
  const f = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return limpiar(await f.locator('span').nth(1).innerText());
}

/** La misma celda SIN normalizar los espacios: para mirar el espacio duro antes del «%». */
async function filaCruda(page: Page, etiqueta: string): Promise<string> {
  const f = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return (await f.locator('span').nth(1).textContent()) ?? '';
}

async function ahorro(page: Page): Promise<string> {
  return limpiar(await page.locator('css=p:below(:text("Ahorro fiscal estimado"))').first().innerText());
}

async function estimar(page: Page, opciones: { titular?: string; grado?: string; asistencia?: boolean }): Promise<void> {
  if (opciones.titular) await page.getByRole('radio', { name: opciones.titular }).check();
  if (opciones.grado) await page.getByRole('radio', { name: opciones.grado }).check();
  if (opciones.asistencia) await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Estimar ahorro fiscal por discapacidad' }).click();
}

/** Respuesta de una pregunta del FAQPage que sirve el layout (lo que leen buscadores e IA). */
async function respuestaFaqJsonLd(page: Page, pregunta: string): Promise<string> {
  const bloques = await page.$$eval('script[type="application/ld+json"]', (ss) => ss.map((s) => s.textContent ?? ''));
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (j['@type'] !== 'FAQPage') continue;
    const q = j.mainEntity?.find((e) => e.name === pregunta);
    if (q) return q.acceptedAnswer.text;
  }
  throw new Error(`La pregunta «${pregunta}» no está en el FAQPage`);
}

/** Lista `featureList` del WebApplication que sirve el layout. */
async function featuresJsonLd(page: Page): Promise<string[]> {
  const bloques = await page.$$eval('script[type="application/ld+json"]', (ss) => ss.map((s) => s.textContent ?? ''));
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; featureList?: string[] | string };
    if (j['@type'] !== 'WebApplication') continue;
    const f = j.featureList ?? [];
    return Array.isArray(f) ? f : f.split(',').map((s) => s.trim());
  }
  throw new Error('No hay WebApplication en el JSON-LD');
}

/**
 * Respuesta de una pregunta de la FAQ VISIBLE. Va dentro de <EducationalSection>, que nace
 * plegada pero monta su contenido (lo oculta por CSS): se lee con textContent.
 */
async function respuestaFaqVisible(page: Page, pregunta: string): Promise<string> {
  const h4 = page.locator('h4', { hasText: pregunta }).first();
  const texto = await h4.locator('xpath=following-sibling::p[1]').textContent();
  return limpiar(texto ?? '');
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Estimación de Deducción IRPF por Discapacidad'
  );
  // 15/11/2026: antes de marcar radios o pulsar, React tiene que haber montado los controles;
  // un clic previo a la hidratación se pierde y el caso mediría los valores por defecto.
  await esperarHidratacion(page, ['input[name="grado"]', 'input[name="titular"]']);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · contribuyente con grado 33-64 %, sin acreditar asistencia', async ({ page }) => {
  // Mínimo = 3.000 € (art. 60, sin el incremento por gastos de asistencia).
  // Ahorro = escala(8.550) − escala(5.550) = 3.000 × 19 % = 570,00 €, al 19,00 % efectivo.
  // Antes de la reparación, con el marginal por defecto del 24 %, publicaba 720,00 €; y con
  // un marginal del 47 %, 1.410,00 €, que es dos veces y media lo que la ley concede.
  await estimar(page, { grado: 'Del 33 % al 64 %' });

  expect(await fila(page, 'Total mínimo aplicable')).toBe('3000,00 €');
  expect(await fila(page, 'Tipo al que se valora el mínimo')).toBe('19,00 %');
  expect(await ahorro(page)).toBe('570,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · grado ≥ 65 %: 9.000 + 3.000 € y el mínimo cruza al segundo tramo', async ({ page }) => {
  // Mínimo = 9.000 € (art. 60) + 3.000 € de gastos de asistencia, que con grado ≥ 65 % proceden
  // por el propio grado, sin acreditar nada más = 12.000 €.
  // Ahorro = escala(17.550) − escala(5.550)
  //        = (12.450 − 5.550)×19 % + (17.550 − 12.450)×24 %
  //        = 6.900×19 % + 5.100×24 % = 1.311,00 + 1.224,00 = 2.535,00 €
  // Tipo efectivo = 2.535 / 12.000 = 21,125 % → 21,13 %
  //
  // Este es el caso donde el defecto valía más: con un marginal del 45 % la app publicaba
  // 5.400,00 €, es decir 2.865,00 € de ahorro que no existen.
  await estimar(page, { grado: '65 % o superior' });

  expect(await fila(page, 'Mínimo por discapacidad')).toBe('9000,00 €');
  expect(await fila(page, 'Gastos de asistencia')).toBe('3000,00 €');
  expect(await fila(page, 'Total mínimo aplicable')).toBe('12.000,00 €');
  expect(await fila(page, 'Tipo al que se valora el mínimo')).toBe('21,13 %');
  expect(await ahorro(page)).toBe('2535,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('ya no se pregunta el tipo marginal, porque no interviene', async ({ page }) => {
  // El selector de tipo marginal era la cara visible del defecto: prometía que el ahorro
  // dependía de la renta de quien declara. Si vuelve a aparecer, el error ha vuelto con él.
  await expect(page.getByLabel('Tipo marginal IRPF aproximado')).toHaveCount(0);

  await estimar(page, { grado: '65 % o superior' });
  const nota = page.locator('css=div[role="note"]').last();
  await expect(nota).toContainText('no reduce la base liquidable');
  await expect(nota).toContainText('tipo cero');
  await expect(nota).toContainText('no depende de tu tipo marginal');
  await expect(nota).toContainText('cota inferior');
});

// ═════════════════════════════════════════════════════════════════════════════
// Inspección del 15/11/2026 — casos que el motor resuelve bien
// ═════════════════════════════════════════════════════════════════════════════

test('CASO 3 · descendiente con grado 33-64 % y movilidad reducida: 3.000 + 3.000 €', async ({ page }) => {
  // Art. 60.2 LIRPF: 3.000 € por el descendiente con discapacidad, más 3.000 € por gastos de
  // asistencia porque acredita movilidad reducida (casilla marcada) = 6.000 €.
  // Ahorro = escala(5.550 + 6.000) − escala(5.550) = escala(11.550) − escala(5.550)
  //        = 2.194,50 − 1.054,50 = 1.140,00 € (todo cae en el tramo del 19 %) → 19,00 %.
  await estimar(page, { titular: 'Un descendiente (hijo/a)', grado: 'Del 33 % al 64 %', asistencia: true });

  expect(await fila(page, 'Mínimo por discapacidad')).toBe('3000,00 €');
  expect(await fila(page, 'Gastos de asistencia')).toBe('3000,00 €');
  expect(await fila(page, 'Total mínimo aplicable')).toBe('6000,00 €');
  expect(await fila(page, 'Tipo al que se valora el mínimo')).toBe('19,00 %');
  expect(await ahorro(page)).toBe('1140,00 €');
});

test('CASO 4 · ascendiente con grado ≥ 65 % SIN marcar la casilla: el grado basta para los 3.000 €', async ({ page }) => {
  // Art. 60.2 LIRPF: 9.000 € por el ascendiente con grado ≥ 65 %, y el aumento de 3.000 € por
  // asistencia procede también por «un grado de discapacidad igual o superior al 65 por
  // ciento», sin acreditar ayuda de terceros = 12.000 €.
  // Ahorro = escala(17.550) − escala(5.550) = 3.589,50 − 1.054,50 = 2.535,00 €;
  // tipo = 2.535 / 12.000 = 21,125 % → 21,13 %.
  await estimar(page, { titular: 'Un ascendiente (padre/madre)', grado: '65 % o superior' });
  await expect(page.getByRole('checkbox').first()).not.toBeChecked();

  expect(await fila(page, 'Mínimo por discapacidad')).toBe('9000,00 €');
  expect(await fila(page, 'Gastos de asistencia')).toBe('3000,00 €');
  expect(await fila(page, 'Total mínimo aplicable')).toBe('12.000,00 €');
  expect(await fila(page, 'Tipo al que se valora el mínimo')).toBe('21,13 %');
  expect(await ahorro(page)).toBe('2535,00 €');
});

test('CASO 5 · grado ≥ 65 % CON la casilla marcada: los supuestos son alternativos, no se suman', async ({ page }) => {
  // Art. 60.1: los tres supuestos del aumento (ayuda de terceros, movilidad reducida, grado
  // ≥ 65 %) dan derecho a UN aumento de 3.000 €, no a uno por supuesto. Esperado: 3.000 € de
  // asistencia (no 6.000), 12.000 € de total y el mismo ahorro de 2.535,00 €.
  await estimar(page, { grado: '65 % o superior', asistencia: true });

  expect(await fila(page, 'Gastos de asistencia')).toBe('3000,00 €');
  expect(await fila(page, 'Total mínimo aplicable')).toBe('12.000,00 €');
  expect(await ahorro(page)).toBe('2535,00 €');
});

test('CASO 6 · no se puede pedir un grado inferior al 33 %, y «Limpiar» retira el resultado', async ({ page }) => {
  // Art. 60.3 LIRPF: solo es persona con discapacidad a efectos del impuesto quien acredita un
  // grado ≥ 33 %. La app no admite otra cosa: el grupo de grado ofrece exactamente dos opciones,
  // las dos ≥ 33 %, y no hay ningún campo numérico donde colar un grado o una renta inválidos.
  const grados = page.locator('input[name="grado"]');
  await expect(grados).toHaveCount(2);
  expect(await grados.evaluateAll((is) => is.map((i) => (i as HTMLInputElement).value))).toEqual(['33a65', '65oMas']);

  await estimar(page, { titular: 'Un ascendiente (padre/madre)', grado: '65 % o superior', asistencia: true });
  expect(await ahorro(page)).toBe('2535,00 €');

  await page.getByRole('button', { name: 'Limpiar formulario' }).click();
  await expect(page.getByText('Completa los datos y pulsa')).toBeVisible();
  await expect(page.getByText('Ahorro fiscal estimado')).toHaveCount(0);
  await expect(page.getByRole('radio', { name: 'El contribuyente' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Del 33 % al 64 %' })).toBeChecked();
  await expect(page.getByRole('checkbox').first()).not.toBeChecked();
});

// ═════════════════════════════════════════════════════════════════════════════
// Inspección del 15/11/2026 — hallazgos ABIERTOS (test.fail hasta que se reparen)
// ═════════════════════════════════════════════════════════════════════════════

test('REPARADO · el FAQPage no dice que el ahorro depende del tipo marginal (3.600 € al 30 %)', async ({ page }) => {
  // El FAQPage respondía «¿Cuánto dinero me puedo ahorrar…?» con «depende del tipo marginal… con
  // un tipo marginal del 30 %, el ahorro fiscal sería de 3.600 €» para el mínimo de 12.000 €.
  // Reparado el 15/11/2026: la respuesta sale del motor, 2.535,00 € (art. 63.1.2.º, cálculo del
  // CASO 2), sea cual sea el marginal, con la base mínima de 17.550 € que lo hace cierto.
  // La cifra se escribe «2535,00 €»: con cuatro cifras enteras no se agrupa (formato del proyecto).
  const r = await respuestaFaqJsonLd(page, '¿Cuánto dinero me puedo ahorrar en la declaración de la renta por discapacidad?');
  expect(r).not.toContain('3.600');
  expect(r).toMatch(/2\.?535/);
  expect(r).toMatch(/17\.?550/);
});

test('REPARADO · la tabla comparativa no valora el mínimo al 30 % ni al 45 %', async ({ page }) => {
  // La tabla del bloque educativo publicaba «Ahorro al 45 %: 5.400 €» para 12.000 € de mínimo, y
  // «Ahorro al 19 %: 2.280 €». Por el art. 63.1.2.º, 12.000 € sobre el mínimo personal ahorran
  // 2.535,00 € (CASO 2) a cualquier renta suficiente, y 6.000 € ahorran 1.140,00 € (CASO 3).
  const filas = await page.locator('table tr').evaluateAll((trs) => trs.map((tr) => tr.textContent ?? ''));
  expect(filas.some((f) => /Ahorro al (30|45)/.test(f))).toBe(false);
  expect(filas.join(' ')).toMatch(/2\.?535/);
  expect(filas.join(' ')).toMatch(/1\.?140/);
});

test('REPARADO · features del JSON-LD no promete el ahorro «según tipo marginal»', async ({ page }) => {
  // La app no pide el tipo marginal y su motor no lo usa (desde el 12/09/2026).
  const f = await featuresJsonLd(page);
  expect(f.some((x) => /tipo marginal/i.test(x))).toBe(false);
  expect(f.some((x) => /tipo cero/i.test(x))).toBe(true);
});

test('REPARADO · la incapacidad permanente absoluta o gran invalidez equivale a ≥ 33 %, no a ≥ 65 %', async ({ page }) => {
  // Art. 60.3 LIRPF (BOE-A-2006-20764): «se considerará acreditado un grado de discapacidad igual
  // o superior al 33 por ciento en el caso de los pensionistas de la Seguridad Social que tengan
  // reconocida una pensión de incapacidad permanente total, absoluta o gran invalidez». El 65 %
  // solo se presume para la incapacidad declarada judicialmente. La FAQ visible asimila la
  // absoluta y la gran invalidez a ≥ 65 %: quien la siga marcará «65 % o superior» y la app le
  // dará 2.535,00 € de ahorro (CASO 2) en vez de 570,00 € (CASO 1). Reparado el 15/11/2026.
  const r = await respuestaFaqVisible(page, '¿La incapacidad permanente equivale a discapacidad a efectos del IRPF?');
  expect(r).not.toMatch(/65\s*%\s*\(absoluta/);
  expect(r).toContain('declara judicialmente');
});

test('REPARADO · la discapacidad reconocida a mitad de año no se prorratea: cuenta la fecha de devengo', async ({ page }) => {
  // Art. 61.3.ª LIRPF: «La determinación de las circunstancias personales y familiares que deban
  // tenerse en cuenta a efectos de lo establecido en los artículos 57, 58, 59 y 60 de esta Ley,
  // se realizará atendiendo a la situación existente en la fecha de devengo del Impuesto». La
  // FAQ visible decía que «el mínimo se aplica proporcionalmente al período del año».
  const r = await respuestaFaqVisible(page, '¿Qué pasa si la discapacidad se reconoce a mitad de año?');
  expect(r).not.toContain('proporcionalmente');
  expect(r).toContain('devengo');
});

test('REPARADO · «cota inferior» solo vale con base suficiente: con 12.000 € de base el ahorro es 1.225,50 €', async ({ page }) => {
  // La app no pide la renta y llama a su cifra «cota inferior». Con la fórmula canónica
  // `calcularCuotaIntegraGeneral` (data/fiscal/irpf.ts), contribuyente con grado ≥ 65 % y base
  // liquidable general de 12.000 € (una pensión, por ejemplo):
  //   sin el mínimo de discapacidad: escala(12.000) − escala(5.550) = 2.280,00 − 1.054,50 = 1.225,50 €
  //   con él: mínimo 5.550 + 12.000 = 17.550 > base → se limita a 12.000 → cuota 0,00 €
  //   ahorro real = 1.225,50 €; la app muestra 2.535,00 € y dice que ahorrarías «un poco más».
  // Vale cualquiera de las dos reparaciones: pedir la base, o condicionar el texto a la base
  // mínima (5.550 € + el mínimo: 17.550 € en este caso). Reparado el 15/11/2026 con la
  // segunda: la nota dice la base que hace cierta la cifra y que con menos el ahorro es menor.
  await estimar(page, { grado: '65 % o superior' });
  expect(await ahorro(page)).toBe('2535,00 €');
  const hayEntradaDeRenta = (await page.getByLabel(/base liquidable|renta|ingresos/i).count()) > 0;
  const nota = (await page.locator('css=div[role="note"]').last().textContent()) ?? '';
  const condicionaLaCota = /17\.?550/.test(nota) || !/cota inferior/.test(nota);
  expect(hayEntradaDeRenta || condicionaLaCota).toBe(true);
  // Con grado 33-64 % la base mínima es 5.550 + 3.000 = 8.550 €.
  await estimar(page, { grado: 'Del 33 % al 64 %' });
  await expect(page.locator('css=div[role="note"]').last()).toContainText('8550,00');
});

test('REPARADO · el FAQPage del familiar a cargo: los 3.000 € de asistencia proceden por el grado ≥ 65 %', async ({ page }) => {
  // Hallazgo 4792. Art. 60.2 LIRPF: el aumento de 3.000 € procede ante ayuda de terceros,
  // movilidad reducida «o un grado de discapacidad igual o superior al 65 por ciento» (CASO 4:
  // la app da 12.000 € al ascendiente con ≥ 65 % sin marcar la casilla). El FAQPage lo
  // condicionaba a que «necesiten asistencia», lo llamaba «deducción» y callaba la regla 2.ª
  // del art. 61 (no hay mínimo si el familiar declara con más de 1.800 €).
  const r = await respuestaFaqJsonLd(page, '¿Se puede aplicar el mínimo por discapacidad de un familiar a cargo?');
  expect(r).not.toContain('más 3.000 € si necesitan asistencia');
  expect(r).toMatch(/65 % o más, que da derecho por sí solo/);
  expect(r).toContain('1.800');
});

test('REPARADO · tabla y ejemplos salen de data/fiscal y del motor, no de literales', async ({ page }) => {
  // Hallazgo 4790. No cambia ninguna cifra (hoy coinciden con data/fiscal), así que se prueba lo
  // que sí cambió en pantalla: la fila única de ahorro con «cualquier marginal» y el ejemplo del
  // trabajador, que ahora habla del «Ahorro por el mínimo» (570,00 €, CASO 1).
  const filas = await page.locator('table tr').evaluateAll((trs) => trs.map((tr) => tr.textContent ?? ''));
  expect(filas.some((f) => /cualquier marginal/.test(f))).toBe(true);
  const body = (await page.locator('body').textContent()) ?? '';
  expect(body).toMatch(/Ahorro por el mínimo: 570,00/);
});

test('ABIERTO · la app calla el art. 19.2.f (+3.500 €) y la deducción del art. 81 bis (1.200 €)', async ({ page }) => {
  // El ejemplo «Trabajador con discapacidad del 40 %, salario bruto 28.000 €» da «Ahorro: 570 €»,
  // y el recuadro de limitaciones solo excluye las deducciones autonómicas. Con data/fiscal
  // (COTIZACIONES_SS_2025: 6,48 % → 1.814,40 €; art. 20: 0; gastos 2.000 €; TRAMOS_IRPF_2025):
  //   sin discapacidad: base 24.185,60, mínimo 5.550 → escala(24.185,60) − escala(5.550) = 4.366,68 €
  //   con ella: gastos +3.500 € (art. 19.2.f) → base 20.685,60, mínimo 8.550 → 4.371,18 − 1.624,50 = 2.746,68 €
  //   ahorro real = 1.620,00 € (570 del mínimo + 3.500 × 30 % = 1.050 del art. 19.2.f).
  // Y por un hijo o un ascendiente con discapacidad a cargo, el art. 81 bis da hasta 1.200 €/año
  // de deducción en la cuota diferencial, anticipable a 100 €/mes, que la app no menciona.
  test.fail();
  const texto = (await page.locator('body').textContent()) ?? '';
  expect(texto).toMatch(/(?<![\d.])1\.?200(,00)?\s?€/);
  expect(texto).toMatch(/(?<![\d.])3\.?500(,00)?\s?€/);
});

test('REPARADO · requisito del ascendiente: convivencia, no «o dependencia económica»', async ({ page }) => {
  // Art. 59.1 LIRPF: mínimo por el ascendiente «que conviva con el contribuyente»; solo se
  // asimila a la convivencia el ascendiente con discapacidad que, dependiendo del contribuyente,
  // esté internado en un centro especializado. La nota de requisitos ofrecía la dependencia
  // económica como alternativa general a la convivencia. Reparado el 15/11/2026, con las reglas
  // 2.ª (1.800 € declarados) y 5.ª (medio año de convivencia) del art. 61, leídas en el BOE.
  await page.getByRole('radio', { name: 'Un ascendiente (padre/madre)' }).check();
  const nota = page.getByRole('note').filter({ hasText: 'Requisitos para aplicar el mínimo por ascendiente' });
  await expect(nota).toBeVisible();
  await expect(nota).not.toContainText('o dependencia económica', { timeout: 1000 });
  await expect(nota).toContainText('centro especializado');
  await expect(nota).toContainText('1800,00');
});

test('REPARADO · DataReference cita la Ley del IRPF, no la LAPAD', async ({ page }) => {
  // La app mostraba «Mínimos por discapacidad IRPF 2025 — Ley 39/2006 LAPAD + LPGE 2025 + RD
  // 1051/2013 … + RDL 17/2026», verificado el 14/07/2026 y con enlace al IMSERSO: es la meta de
  // las prestaciones de dependencia (FISCAL_DEPENDENCIA_META). Los mínimos son arts. 60-61 de la
  // Ley 35/2006: ahora usa FISCAL_IRPF_META.
  const ref = page.getByRole('note', { name: 'Datos de referencia normativos' });
  await expect(ref).toContainText('35/2006', { timeout: 1000 });
  await expect(ref).not.toContainText('LAPAD');
});

test('REPARADO · el «%» del resultado y de las etiquetas va con espacio duro (U+00A0)', async ({ page }) => {
  // Norma de formato de meskeIA (25/09/2026): «19,00 %» con espacio duro para que el «%» no
  // salte solo de línea. La celda llevaba un espacio normal (U+0020) y las etiquetas lo pegaban.
  await estimar(page, { grado: 'Del 33 % al 64 %' });
  expect(await filaCruda(page, 'Tipo al que se valora el mínimo')).toBe(`19,00${String.fromCharCode(160)}%`);
  const etiqueta = await page.locator('input[value="65oMas"] + span').textContent();
  expect(etiqueta).toBe(`65${String.fromCharCode(160)}% o superior`);
});

test('REPARADO · el resultado se anuncia a los lectores de pantalla', async ({ page }) => {
  // Tras pulsar «Estimar ahorro» el foco se quedaba en el botón y la tarjeta de resultados no
  // tenía región viva: el lector no decía nada (WCAG 4.1.3). La única región viva de la página
  // era el anunciador de rutas de Next, que se excluye. Ahora la tarjeta lleva una región
  // aria-live="polite" siempre montada.
  await estimar(page, { grado: 'Del 33 % al 64 %' });
  expect(await ahorro(page)).toBe('570,00 €');
  const vivas = page
    .locator('[aria-live]:not(#__next-route-announcer__), [role="status"]')
    .filter({ hasText: '570,00' });
  expect(await vivas.count()).toBeGreaterThan(0);
});
