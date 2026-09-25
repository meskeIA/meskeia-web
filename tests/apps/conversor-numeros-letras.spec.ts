import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — conversor-numeros-letras (segmento CÁLCULO / LENGUA, riesgo 3)
 *
 * La app promete en su <h1> «Números a Letras» y en su subtítulo «Escribe cualquier cifra en
 * palabras con las reglas del español bien aplicadas: apócope, concordancia de género, cien
 * frente a ciento y escala larga. Para cheques, pagarés, contratos y facturas». La ayuda bajo
 * el campo añade dos promesas verificables: «Admite los dos formatos: 3.847,50 y 3,847.50» y
 * «Hasta 999.999.999.999 y dos decimales». Al usarse para rellenar pagarés y cheques, la
 * promesa es de EXACTITUD LITERAL: lo que sale se copia tal cual a un documento con valor
 * económico.
 *
 * DÓNDE VIVE EL CÁLCULO — lib/numeroALetras.ts (motor puro, sin React ni DOM)
 *   · enteroALetras()   ← descompone en millones / millares / unidades y compone los grupos
 *                         de tres. Aplica apócope («un», «veintiún») y concordancia de
 *                         género («doscientas», «una») según el sustantivo que sigue.
 *   · cantidadALetras() ← redondea a céntimos (Math.round(|v| × 100)), escoge singular o
 *                         plural de la moneda, añade «de» tras millón/millones y la fracción
 *                         en letras o como 00/100.
 *   · numeroALetras()   ← número suelto; los decimales se leen cifra a cifra tras «coma», a
 *                         partir de las cifras TAL COMO SE TECLEARON (partesNumericas()).
 *   app/…/page.tsx      ← parseSpanishNumber() y partesNumericas() de lib/formatters.ts para
 *                         leer la entrada, y LIMITE_NUMERO_A_LETRAS = 999.999.999.999.
 *
 * ── SEGUNDA INSPECCIÓN · 24/08/2026 (verificación de las reparaciones) ────────────────────
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — importe 3.847,50 € con los decimales en letras
 *       «tres mil ochocientos cuarenta y siete euros con cincuenta céntimos»
 *       Norma: 3.847 = 3 millares + 847; «mil» es invariable y no lleva numeral cuando vale
 *       uno; la conjunción «y» solo aparece entre decena y unidad (cuarenta y siete), nunca
 *       entre centena y decena (OLE 2010, § 10.4). Sin «de» porque el numeral no termina en
 *       millón/millones. Los céntimos son subunidad y sí forman número.
 *
 *   CASO 2 (límite) — cuatro fronteras a la vez
 *       a) 1.000.000 € → «un millón de euros»  (DPD, s. v. «millón»: si millón/millones NO va
 *          seguido de otro numeral, el sustantivo cuantificado se introduce con «de»)
 *       b) 999.999.999.999,99 € → el tope declarado CON sus dos decimales, y aquí «millones»
 *          va sin «de» porque le siguen más numerales
 *       c) 3,847.50 € → los dos separadores juntos: el ÚLTIMO es el decimal, así que es el
 *          mismo importe del caso 1
 *       d) 0,50 en modo número suelto → «cero coma cinco cero», con el cero final que solo
 *          existe en lo tecleado
 *
 *   CASO 3 (rechazo) — «12abc» y compañía: aviso «No se reconoce esa cantidad. Escribe solo
 *       cifras, con coma o punto decimal.» y NINGÚN importe en letras. Un importe plausible
 *       pero equivocado es el peor resultado posible en un pagaré.
 *
 * ESTADO DE LOS 5 HALLAZGOS DE LA PRIMERA INSPECCIÓN (24/08/2026) — los cinco VERIFICADOS
 * REPARADOS en el navegador; sus tests dejan de ser testigos y pasan a ser candados de
 * regresión, con la norma que los justifica escrita encima de cada uno.
 *
 * HALLAZGO 263 de la segunda pasada —hijo de la reparación del tope (nº 4)— REPARADO el
 * 24/08/2026: en la franja [999.999.999.999,995 , 1.000.000.000.000) la comprobación de la
 * página usaba Math.floor(|v|) y dejaba pasar el valor, pero cantidadALetras() redondea los
 * céntimos por encima del tope y lanzaba SU mensaje interno, que llegaba crudo a la interfaz
 * con el número sin formato español. Ahora las dos comprobaciones miran la parte entera ya
 * redondeada. Su testigo es la REGRESIÓN 6, al final.
 */

const RUTA = '/conversor-numeros-letras/';

/** Escribe la cantidad y devuelve el texto en letras que muestra el panel de resultado. */
async function enLetras(pagina: Page, entrada: string): Promise<string> {
  await pagina.locator('#cantidad').fill('');
  await pagina.locator('#cantidad').fill(entrada);
  const resultado = pagina.locator('p[aria-live="polite"]');
  await expect(resultado).toBeVisible();
  return (await resultado.innerText()).trim();
}

/** Escribe la cantidad y devuelve el aviso de rechazo que muestra el panel. */
async function avisoDe(pagina: Page, entrada: string): Promise<string> {
  await pagina.locator('#cantidad').fill('');
  await pagina.locator('#cantidad').fill(entrada);
  const aviso = pagina.locator('[role="region"][aria-label="Resultado"] [role="alert"]');
  await expect(aviso).toBeVisible();
  return (await aviso.innerText()).trim();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // La app es un client component: sin hidratar no hay resultado que comprobar.
  await expect(page.locator('#cantidad')).toBeVisible();
  await expect(page.locator('p[aria-live="polite"]')).toBeVisible();
});

// ─── CASO 1 · normal ──────────────────────────────────────────────────────────

test('CASO 1 · 3.847,50 € con la parte entera y los céntimos como número', async ({ page }) => {
  // 3.847 = tres mil + ochocientos + cuarenta y siete (OLE 2010, § 10.4: a partir de 31, en
  // tres palabras). Los céntimos son subunidad y forman número: «cincuenta céntimos».
  expect(await enLetras(page, '3.847,50')).toBe(
    'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos',
  );

  // Y va entera a la línea que la app invita a copiar en un documento.
  await expect(page.locator('[role="region"][aria-label="Resultado"] em')).toHaveText(
    '«Págese por este pagaré la cantidad de tres mil ochocientos cuarenta y siete euros con cincuenta céntimos»',
  );

  // El mismo importe con el formato de cheque latinoamericano: fracción sobre cien.
  await page.getByRole('button', { name: /Fracción 00\/100/ }).click();
  expect(await enLetras(page, '3.847,50')).toBe(
    'tres mil ochocientos cuarenta y siete euros con 50/100',
  );

  // Y sin decimales, que es la tercera opción que ofrece la app.
  await page.getByRole('button', { name: /Sin decimales/ }).click();
  expect(await enLetras(page, '3.847,50')).toBe('tres mil ochocientos cuarenta y siete euros');
});

test('CASO 1 · trampas del español: apócope, cien/ciento, quinientos y mil', async ({ page }) => {
  // Apócope ante sustantivo (DPD, s. v. «uno»): «veintiún euros», no «veintiuno euros».
  expect(await enLetras(page, '21')).toBe('veintiún euros');
  expect(await enLetras(page, '31')).toBe('treinta y un euros');
  // «Cien» son 100 exactos o multiplicador; «ciento» cuando le sigue un número menor.
  expect(await enLetras(page, '100')).toBe('cien euros');
  expect(await enLetras(page, '101')).toBe('ciento un euros');
  expect(await enLetras(page, '100.000')).toBe('cien mil euros'); // nunca «ciento mil»
  // Centenas irregulares: quinientos, setecientos y novecientos.
  expect(await enLetras(page, '500')).toBe('quinientos euros');
  expect(await enLetras(page, '700')).toBe('setecientos euros');
  expect(await enLetras(page, '900')).toBe('novecientos euros');
  // «Mil» no lleva numeral cuando vale uno: mil euros, jamás «un mil euros».
  expect(await enLetras(page, '1.000')).toBe('mil euros');
  expect(await enLetras(page, '2.000')).toBe('dos mil euros');
  expect(await enLetras(page, '21.000')).toBe('veintiún mil euros');
  // El singular de la moneda, solo con el 1.
  expect(await enLetras(page, '1')).toBe('un euro');
  // Con más numerales detrás, «millones» va sin «de», y así lo hace la app (correcto).
  expect(await enLetras(page, '1.234.567,89')).toBe(
    'un millón doscientos treinta y cuatro mil quinientos sesenta y siete euros con ochenta y nueve céntimos',
  );
});

test('CASO 1 · concordancia de género con una moneda femenina', async ({ page }) => {
  await page.locator('#moneda').selectOption('GBP');
  // El numeral concuerda con el sustantivo femenino: «una», «veintiuna», «doscientas».
  expect(await enLetras(page, '1')).toBe('una libra');
  expect(await enLetras(page, '21')).toBe('veintiuna libras');
  expect(await enLetras(page, '201')).toBe('doscientas una libras');
  expect(await enLetras(page, '200.000')).toBe('doscientas mil libras');
  // Pero «millón» es sustantivo masculino y NO concuerda con la moneda (DPD, s. v. «millón»):
  // doscientos un millones de libras, nunca «doscientas una millones».
  expect(await enLetras(page, '201.000.000')).toBe('doscientos un millones de libras');
});

test('CASO 1 · las mayúsculas conservan la tilde', async ({ page }) => {
  await page.getByRole('button', { name: /MAYÚSCULAS/ }).click();
  // OLE 2010, § 3.4.2: las mayúsculas se acentúan igual que las minúsculas.
  expect(await enLetras(page, '16')).toBe('DIECISÉIS EUROS');
  expect(await enLetras(page, '21')).toBe('VEINTIÚN EUROS');
  expect(await enLetras(page, '1.000.000')).toBe('UN MILLÓN DE EUROS');
});

// ─── CASO 2 · límite ──────────────────────────────────────────────────────────

test('CASO 2a · el millón redondo lleva «de» y el compuesto no', async ({ page }) => {
  // DPD, s. v. «millón»: si millón/millones NO va seguido de otro numeral, el sustantivo
  // cuantificado se introduce con «de». Es el ejemplo que la propia app ofrece en «Prueba
  // con:», y lo que se copia al pagaré.
  expect(await enLetras(page, '1.000.000')).toBe('un millón de euros');
  await expect(page.locator('[role="region"][aria-label="Resultado"] em')).toHaveText(
    '«Págese por este pagaré la cantidad de un millón de euros»',
  );
  expect(await enLetras(page, '2.000.000')).toBe('dos millones de euros');
  expect(await enLetras(page, '21.000.000')).toBe('veintiún millones de euros');
  expect(await enLetras(page, '100.000.000')).toBe('cien millones de euros');
  // Escala larga: 10⁹ son mil millones (DPD, s. v. «billón»), y también piden «de».
  expect(await enLetras(page, '1.000.000.000')).toBe('mil millones de euros');
  // Con otro numeral detrás, NADA de «de»
  expect(await enLetras(page, '1.234.567')).toBe(
    'un millón doscientos treinta y cuatro mil quinientos sesenta y siete euros',
  );
  // El «de» sobrevive a los tres estilos de decimales y al signo
  expect(await enLetras(page, '1.000.000,50')).toBe('un millón de euros con cincuenta céntimos');
  expect(await enLetras(page, '-1.000.000')).toBe('menos un millón de euros');
  await page.getByRole('button', { name: /Fracción 00\/100/ }).click();
  expect(await enLetras(page, '1.000.000')).toBe('un millón de euros con 00/100');
});

test('CASO 2b · el tope declarado, con sus dos decimales y con la escala larga', async ({ page }) => {
  // La ayuda anuncia «Hasta 999.999.999.999 y dos decimales»: el máximo CON céntimos entra.
  // 999.999.999.999 = 999.999 millones + 999.999; «millones» sin «de» porque le siguen más
  // numerales.
  expect(await enLetras(page, '999.999.999.999,99')).toBe(
    'novecientos noventa y nueve mil novecientos noventa y nueve millones ' +
      'novecientos noventa y nueve mil novecientos noventa y nueve euros con noventa y nueve céntimos',
  );
  // Y la etiqueta de control muestra la misma cifra en formato español
  await expect(page.locator('[role="region"][aria-label="Resultado"] span').first()).toHaveText(
    '999.999.999.999,99 EUR',
  );

  // El mismo tope en modo número suelto, sin moneda ni «de»
  await page.getByRole('button', { name: /Número suelto/ }).click();
  expect(await enLetras(page, '999.999.999.999')).toBe(
    'novecientos noventa y nueve mil novecientos noventa y nueve millones ' +
      'novecientos noventa y nueve mil novecientos noventa y nueve',
  );
  expect(await enLetras(page, '1.000.000.000')).toBe('mil millones');
  expect(await enLetras(page, '1.000.000')).toBe('un millón'); // suelto no lleva «de»: no hay sustantivo
});

test('CASO 2c · los dos separadores juntos: el último es el decimal', async ({ page }) => {
  // Regla del proyecto (lib/formatters.ts, 24/08/2026): con punto Y coma presentes, el último
  // separador es el decimal. Vale en los dos convenios y es lo que promete la ayuda.
  await expect(page.locator('#cantidad ~ p').first()).toContainText('3.847,50 y 3,847.50');
  expect(await enLetras(page, '3,847.50')).toBe(
    'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos',
  );
  expect(await enLetras(page, '1,234,567.89')).toBe(
    'un millón doscientos treinta y cuatro mil quinientos sesenta y siete euros con ochenta y nueve céntimos',
  );
  // El formato español sigue leyéndose exactamente igual que antes
  expect(await enLetras(page, '3.847,50')).toBe(
    'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos',
  );
  expect(await enLetras(page, '1234,56')).toBe(
    'mil doscientos treinta y cuatro euros con cincuenta y seis céntimos',
  );
  expect(await enLetras(page, '3.847,50 €')).toBe(
    'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos',
  );
  // Con UN SOLO separador la ambigüedad es irreducible y gana el español: 1.234 son mil
  // doscientos treinta y cuatro, y 2.500 son dos mil quinientos, no 2,5.
  expect(await enLetras(page, '1.234')).toBe('mil doscientos treinta y cuatro euros');
  expect(await enLetras(page, '2.500')).toBe('dos mil quinientos euros');
});

test('CASO 2d · cero, negativo, redondeo a céntimos y lectura cifra a cifra', async ({ page }) => {
  expect(await enLetras(page, '0')).toBe('cero euros'); // plural: solo el 1 lleva singular
  expect(await enLetras(page, '-21')).toBe('menos veintiún euros'); // el signo no se pierde
  expect(await enLetras(page, '1,50')).toBe('un euro con cincuenta céntimos');
  expect(await enLetras(page, '0,05')).toBe('cero euros con cinco céntimos');
  expect(await enLetras(page, '0,01')).toBe('cero euros con un céntimo'); // fracción singular
  // Redondeo a céntimos, como cualquier factura: 0,005 → 0,01 y 0,004 → 0,00.
  expect(await enLetras(page, '0,005')).toBe('cero euros con un céntimo');
  expect(await enLetras(page, '0,004')).toBe('cero euros');

  // Número suelto: los decimales se leen cifra a cifra tras «coma», incluido el cero final
  // que el usuario tecleó (DPD: 3,45 es «tres coma cuatro cinco», no «cuarenta y cinco»).
  await page.getByRole('button', { name: /Número suelto/ }).click();
  expect(await enLetras(page, '3,45')).toBe('tres coma cuatro cinco');
  expect(await enLetras(page, '0,50')).toBe('cero coma cinco cero');
  expect(await enLetras(page, '0,05')).toBe('cero coma cero cinco');
  expect(await enLetras(page, '21')).toBe('veintiuno'); // suelto va sin apócope
});

// ─── CASO 3 · rechazo ─────────────────────────────────────────────────────────

test('CASO 3 · vacío, texto y fuera de rango se rechazan sin inventar cifras', async ({ page }) => {
  const panel = page.locator('[role="region"][aria-label="Resultado"]');

  await page.locator('#cantidad').fill('');
  await expect(panel).toContainText('Escribe una cantidad para verla en letras.');

  // Lo que no es un número devuelve NaN y la app dice lo que ya anunciaba su mensaje. Un
  // importe plausible pero equivocado es el peor resultado posible en un pagaré: «12abc»
  // llegó a valer doce euros y «1e3», mil.
  for (const basura of ['abc', '12abc', '1.2.3', '1e3', '2,5,3']) {
    expect(await avisoDe(page, basura)).toBe(
      'No se reconoce esa cantidad. Escribe solo cifras, con coma o punto decimal.',
    );
  }

  // Cifras arábigo-índicas: tampoco son «solo cifras» para el parser.
  await page.locator('#cantidad').fill('٣');
  await expect(panel.locator('[role="alert"]')).toBeVisible();

  // Un billón supera el tope de 999.999.999.999 que declara la propia app.
  expect(await avisoDe(page, '1.000.000.000.000')).toBe(
    'La cantidad máxima admitida es 999.999.999.999.',
  );
});

// ─── CANDADOS DE REGRESIÓN DE LAS 5 REPARACIONES DEL 24/08/2026 ───────────────
// Los cinco se verificaron reparados en la segunda inspección. Estos bloques fijan el
// comportamiento correcto para que una regresión los ponga en rojo.

/**
 * HALLAZGO 1 (alto) · REPARADO. DPD, s. v. «millón»: si millón(es) no va seguido de otro
 * numeral, el sustantivo cuantificado se introduce con «de». Faltaba, y se alcanzaba pulsando
 * el ejemplo 1.000.000 que la propia app ofrece, de modo que la línea preparada para copiar
 * decía «Págese por este pagaré la cantidad de un millón euros». Cubierto arriba por CASO 2a;
 * aquí queda el caso femenino, donde el error se veía doble («un millón libras»).
 */
test('REGRESIÓN 1 · «de» tras millón también con moneda femenina', async ({ page }) => {
  await page.locator('#moneda').selectOption('GBP');
  expect(await enLetras(page, '1.000.000')).toBe('un millón de libras');
  expect(await enLetras(page, '2.000.000')).toBe('dos millones de libras');
});

/**
 * HALLAZGO 2 (alto) · REPARADO en lib/formatters.ts, que usa todo el catálogo. La ayuda del
 * campo prometía los dos formatos y parseSpanishNumber() resolvía siempre a favor del
 * español, así que 3,847.50 € se escribía en el pagaré como «tres euros con ochenta y cinco
 * céntimos» y 1,234,567.89 € como «un euro con veintitrés céntimos». Cubierto por CASO 2c.
 * Aquí queda fijada la otra mitad de la regla: la etiqueta de control tiene que enseñar el
 * importe ya interpretado, para que el error de convenio se vea antes de firmar.
 */
test('REGRESIÓN 2 · la etiqueta confirma cómo se ha interpretado la cifra', async ({ page }) => {
  const etiqueta = page.locator('[role="region"][aria-label="Resultado"] span').first();
  await page.locator('#cantidad').fill('3,847.50');
  await expect(etiqueta).toHaveText('3847,50 EUR'); // es-ES no agrupa los millares de 4 cifras
  await page.locator('#cantidad').fill('1,234,567.89');
  await expect(etiqueta).toHaveText('1.234.567,89 EUR');
});

/**
 * HALLAZGO 3 (medio) · REPARADO en lib/formatters.ts. parseFloat() aceptaba prefijos
 * numéricos y notación científica, así que «12abc» valía 12 y «1e3» valía 1000: importes
 * plausibles pero equivocados, y encima contradiciendo el propio mensaje de error de la app.
 * Cubierto por CASO 3.
 */

/**
 * HALLAZGO 4 (bajo) · REPARADO. La ayuda anuncia «Hasta 999.999.999.999 y dos decimales»,
 * pero el tope se comparaba contra el valor CON decimales, así que el propio máximo declarado
 * se rechazaba. Ahora se compara la parte entera. Cubierto por CASO 2b; aquí la frontera fina.
 */
test('REGRESIÓN 4 · la frontera del tope, céntimo a céntimo', async ({ page }) => {
  expect(await enLetras(page, '999.999.999.999,98')).toContain('con noventa y ocho céntimos');
  expect(await enLetras(page, '999.999.999.999,99')).toContain('con noventa y nueve céntimos');
  // Un euro más allá del tope sí se rechaza, con el mensaje que la app declara
  expect(await avisoDe(page, '1.000.000.000.000')).toBe(
    'La cantidad máxima admitida es 999.999.999.999.',
  );
});

/**
 * HALLAZGO 5 (bajo) · REPARADO. En modo «número suelto» los decimales se leen cifra a cifra, y
 * salían del número ya convertido: el cero final que el usuario escribió no estaba en el
 * número (0,50 vale 0,5). Ahora la app pasa al motor las cifras TAL COMO SE TECLEARON, que es
 * lo que devuelve partesNumericas() y lo único que las recuerda.
 */
test('REGRESIÓN 5 · el número suelto conserva el cero final de los decimales', async ({ page }) => {
  await page.getByRole('button', { name: /Número suelto/ }).click();
  expect(await enLetras(page, '0,50')).toBe('cero coma cinco cero');
  expect(await enLetras(page, '1,20')).toBe('uno coma dos cero');
  expect(await enLetras(page, '3.847,50')).toBe(
    'tres mil ochocientos cuarenta y siete coma cinco cero',
  );
  // También cuando las cifras llegan en formato internacional
  expect(await enLetras(page, '3,847.50')).toBe(
    'tres mil ochocientos cuarenta y siete coma cinco cero',
  );
  expect(await enLetras(page, '0,000')).toBe('cero coma cero cero cero');
  // Y sigue leyendo cifra a cifra lo que no lleva cero final
  expect(await enLetras(page, '3,45')).toBe('tres coma cuatro cinco');
});

// ─── TESTIGO DEL HALLAZGO ABIERTO (afirma el fallo tal y como está hoy) ───────

/**
 * TESTIGO · hallazgo de la segunda inspección (24/08/2026), bajo, ABIERTO. Es hijo de la
 * reparación del hallazgo 4: la página comprueba el tope con Math.floor(|v|), de modo que
 * 999.999.999.999,995 pasa el filtro; después cantidadALetras() redondea a céntimos
 * (Math.round(|v| × 100)) y el entero resultante ya es 1.000.000.000.000, así que el motor
 * lanza SU excepción y el page.tsx la muestra tal cual.
 *
 * Consecuencia: en la franja [999.999.999.999,995 , 1.000.000.000.000) el usuario ve un
 * mensaje distinto del que la app declara, y con el número SIN formato español —
 * «(999999999999)» — que el CLAUDE.md prohíbe expresamente en cualquier cifra de interfaz.
 *
 * LO CORRECTO cuando se repare, y hay que invertir este test: el mismo aviso que la app da un
 * céntimo más allá, «La cantidad máxima admitida es 999.999.999.999.».
 */
/**
 * REGRESIÓN 6 (hallazgo 263) — la franja de medio céntimo bajo el tope.
 *
 * En modo importe la cantidad se redondea a céntimos ANTES de leerse, así que el tope hay
 * que comprobarlo sobre la parte entera ya redondeada. Comprobándolo antes, la franja
 * [999.999.999.999,995 , 1.000.000.000.000) pasaba el filtro de la página y reventaba dentro
 * del motor, que soltaba su mensaje interno con el número sin formato español —justo lo que
 * el CLAUDE.md prohíbe en cualquier cifra de interfaz— en una app que se usa para rellenar
 * pagarés. La frontera real está en el medio céntimo, y a cada lado responde quien debe.
 */
test('REGRESIÓN 6 · la franja de medio céntimo bajo el tope la rechaza la app, no el motor', async ({ page }) => {
  // 999.999.999.999,994 redondea a ,99 y se acepta: la frontera está en el medio céntimo.
  expect(await enLetras(page, '999.999.999.999,994')).toContain('con noventa y nueve céntimos');

  // Y medio céntimo más arriba redondea a un billón, que no cabe: contesta la app, con su
  // mensaje y su número en formato español
  expect(await avisoDe(page, '999.999.999.999,995')).toBe(
    'La cantidad máxima admitida es 999.999.999.999.',
  );
  // El mismo aviso que un billón redondo, que nunca estuvo en duda
  expect(await avisoDe(page, '1.000.000.000.000')).toBe(
    'La cantidad máxima admitida es 999.999.999.999.',
  );
});

/**
 * ── MEJORA · 26/08/2026 · la coma que puede ser millar ────────────────────────────────────
 *
 * «830,400» no tiene una lectura correcta: en España son ochocientos treinta con cuarenta y
 * en México, Perú u Honduras son ochocientos treinta mil cuatrocientos. `parseSpanishNumber`
 * resuelve a favor del español —es el formato obligatorio del proyecto y la ambigüedad es
 * irreducible sin saber quién escribe—, así que hasta ahora la app leía el importe MIL VECES
 * más pequeño sin decir nada.
 *
 * De dónde sale: entre el 17 y el 21 de agosto esta app hizo 282 visitas, el 62 % desde
 * países que agrupan los millares con coma (MX 111, PE 29, HN 20, DO 15), y sus consultas en
 * Bing llegaban con el número dentro — «como se escribe 830,400.00 en letras», «como se
 * escribe $17,149.16 pesos en letra».
 *
 * La app no adivina: dice cómo lo ha leído y ofrece la otra lectura a un clic. Al pulsarlo
 * reescribe el campo con la forma inequívoca, de modo que lo que se copia al pagaré es
 * siempre lo que se ve escrito.
 */
test('MEJORA · la coma ambigua se avisa y la otra lectura está a un clic', async ({ page }) => {
  const aviso = page.locator('[role="region"][aria-label="Resultado"] [role="status"]');

  // Lectura por defecto, la española: 830,400 → 830,40 € redondeado a céntimos.
  expect(await enLetras(page, '830,400')).toBe('ochocientos treinta euros con cuarenta céntimos');

  // Y la app lo dice, con las dos cantidades a la vista.
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText('830,400');
  await expect(aviso).toContainText('830.400');

  // Un clic y pasa a la lectura americana. 830.400 = ochocientos treinta mil cuatrocientos:
  // «mil» invariable, sin «y» entre centena y decena (OLE 2010, § 10.4).
  await page.getByRole('button', { name: 'Leer 830.400' }).click();
  await expect(page.locator('#cantidad')).toHaveValue('830.400');
  await expect(page.locator('p[aria-live="polite"]')).toHaveText(
    'ochocientos treinta mil cuatrocientos euros',
  );

  // Resuelta la duda, el aviso se retira: «830.400» ya no admite dos lecturas.
  await expect(aviso).toHaveCount(0);
});

test('MEJORA · el aviso calla donde no hay duda, para no dejar de informar', async ({ page }) => {
  const aviso = page.locator('[role="region"][aria-label="Resultado"] [role="status"]');

  // Millar español bien escrito: aquí avisar saltaría ante cualquier importe redondo.
  expect(await enLetras(page, '1.500')).toBe('mil quinientos euros');
  await expect(aviso).toHaveCount(0);

  // Dos decimales tras la coma: no hay millar posible.
  expect(await enLetras(page, '830,40')).toBe('ochocientos treinta euros con cuarenta céntimos');
  await expect(aviso).toHaveCount(0);

  // Dos comas: el millar ya se delata solo y el parser lo lee bien sin ayuda.
  expect(await enLetras(page, '85,911,818')).toBe(
    'ochenta y cinco millones novecientos once mil ochocientos dieciocho euros',
  );
  await expect(aviso).toHaveCount(0);

  // Los dos separadores juntos: el último es el decimal, sin duda que resolver.
  expect(await enLetras(page, '830,400.00')).toBe(
    'ochocientos treinta mil cuatrocientos euros',
  );
  await expect(aviso).toHaveCount(0);
});

/**
 * ══════════════════════════════════════════════════════════════════════════════════════════
 * TERCERA INSPECCIÓN · 24/09/2026 — re-inspección por FIRMA DE ROTURA
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Vuelve a la cola porque en los 30 días hasta el 23/09 hizo 82,2 % de visitas cortas
 * (catálogo 62,3 %) y 6,8 % de recargas (catálogo 2,9 %) en 73 visitas. Se buscó lo que
 * impide USAR la app, no solo lo que calcula mal.
 *
 * LOS 6 HALLAZGOS ANTERIORES (232-236 y 263) SIGUEN REPARADOS: los cubren, sin cambios, los
 * bloques CASO 2a / REGRESIÓN 1 (232), CASO 2c / REGRESIÓN 2 (233), CASO 3 (234), CASO 2b /
 * REGRESIÓN 4 (235), REGRESIÓN 5 (236) y REGRESIÓN 6 (263), que pasan hoy. No se duplican aquí
 * 21, 100, 101, 1.000.000, 21.000, 0,05 ni el negativo -21: ya están arriba.
 *
 * ESPERADOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   · Regla del parser (lib/formatters.ts): fuera espacios (normal, NBSP y fino U+202F) y un
 *     €, $ o £ pegado; con los dos separadores manda el último; con uno solo, el español.
 *     De ahí: 1500 · 1.500 · 1 500 · 1500 € · €1500 → 1.500; 1500,50 · 1.500,50 · 1,500.50 ·
 *     1500.5 · «1 500,50» con NBSP (lo que pega Excel en es-ES) → 1.500,50.
 *   · Norma: DPD, s. v. «uno» §2.2 (las leyes de la apócope rigen dentro de los numerales
 *     complejos: «treinta y un kilos») y §2.3 (concordancia; con «mil» interpuesto es
 *     opcional, «cuarenta y una mil libras»; las centenas concuerdan siempre: «setecientas mil
 *     toneladas»); DPD, s. v. «millón» (con «de» si no sigue otro numeral).
 *   · Género de las monedas: DLE, s. v. «lempira»: «1. m. Unidad monetaria de Honduras.»
 *     (consultado el 24/09/2026), y Ley Monetaria de Honduras, art. 1: «La unidad monetaria
 *     de Honduras es el Lempira».
 *
 * ── REPARACIÓN · 24/09/2026 — los 8 hallazgos (1537-1544) ─────────────────────────────────
 * Sus testigos `test.fail` pasan a ser REGRESIONES con el número de hallazgo en el título:
 *   1537 lempira masculino (DLE) · 1538 resultado junto al campo y campo en la primera pantalla
 *   · 1539 lo tecleado sustituye al ejemplo y se avisa del redondeo · 1540 el símbolo elige la
 *   moneda o se avisa · 1541 los textos de ayuda recuperan su regla oscura · 1542 símbolos de
 *   las monedas del selector (CLDR 48) · 1543 etiqueta con las cifras tecleadas · 1544
 *   --primary-boton / --secondary-boton / --primary-texto.
 * Las reglas de la marca de moneda, en `separarMarcaMoneda` (lib/numeroALetras.ts), con sus
 * casos en tests/numero-a-letras.spec.ts.
 */
test.describe('Inspección 24/09/2026 — importes reales, lempira, móvil y tema oscuro', () => {
  const panel = (page: Page) => page.locator('[role="region"][aria-label="Resultado"]');

  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['#cantidad']);
  });

  test('las formas reales de teclear o pegar 1.500 € se leen todas igual', async ({ page }) => {
    for (const entrada of ['1500', '1.500', '1 500', '1500 €', '€1500', '  1500  ', '+1500']) {
      expect(await enLetras(page, entrada), entrada).toBe('mil quinientos euros');
    }
    // «1 500,50» con NBSP y con espacio fino: es lo que llega al copiar de Excel o de Intl
    for (const entrada of ['1500,50', '1.500,50', '1,500.50', '1500.5', '1 500,50', '1 500,50', '1.500,50 €']) {
      expect(await enLetras(page, entrada), entrada).toBe('mil quinientos euros con cincuenta céntimos');
    }
    // DPD, s. v. «millón»: millones redondos, con «de»
    expect(await enLetras(page, '15.000.000')).toBe('quince millones de euros');
    expect(await enLetras(page, '-20')).toBe('menos veinte euros');

    // «1,500»: coma sola = decimal español (1,50 €), y la app avisa con la otra lectura a un clic
    expect(await enLetras(page, '1,500')).toBe('un euro con cincuenta céntimos');
    await expect(panel(page).locator('[role="status"]')).toContainText('1,500');
    await expect(page.getByRole('button', { name: 'Leer 1500' })).toBeVisible();
  });

  test('clásicos que faltaban: 1.000.001, doscientas y veintiuna mil libras', async ({ page }) => {
    // DPD «uno» §2.2: la apócope rige dentro del numeral complejo, como «treinta y un kilos»
    expect(await enLetras(page, '1.000.001')).toBe('un millón un euros');

    await page.locator('#moneda').selectOption('GBP');
    // DPD «uno» §2.3: las centenas concuerdan siempre con el sustantivo femenino
    expect(await enLetras(page, '200')).toBe('doscientas libras');
    // DPD «uno» §2.3: con «mil» interpuesto la concordancia es opcional; la app da la femenina,
    // que según el DPD «se está imponiendo en la lengua actual»
    expect(await enLetras(page, '21.000')).toBe('veintiuna mil libras');

    // Suelto no hay sustantivo detrás, así que va la forma plena (DPD «uno» §2.2)
    await page.getByRole('button', { name: /Número suelto/ }).click();
    expect(await enLetras(page, '1.000.001')).toBe('un millón uno');
  });

  test.describe('portapapeles', () => {
    test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

    test('Copiar deja en el portapapeles exactamente el importe en letras', async ({ page }) => {
      expect(await enLetras(page, '1.500,50')).toBe('mil quinientos euros con cincuenta céntimos');
      await page.getByRole('button', { name: /Copiar/ }).click();
      await expect(page.getByRole('button', { name: /Copiado/ })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        'mil quinientos euros con cincuenta céntimos',
      );
    });
  });

  /**
   * REGRESIÓN 1537 (alto, dato) · REPARADO el 24/09/2026. El lempira estaba declarado
   * femenino en MONEDAS y la app escribía en el cheque «una lempira» y «doscientas lempiras».
   * DLE, s. v. «lempira»: «1. m. Unidad monetaria de Honduras» (https://dle.rae.es/lempira,
   * consultado el 24/09/2026). Con el masculino, la apócope y las centenas en -os (DPD, s. v.
   * «uno» §2.2 y §2.3). El género de las 17 monedas se coteja con el DLE en
   * tests/numero-a-letras.spec.ts; aquí, el caso de la ficha tal como se ve en pantalla.
   */
  test('REGRESIÓN 1537 · el lempira es masculino: un lempira, veintiún y doscientos lempiras', async ({ page }) => {
    await page.locator('#moneda').selectOption('HNL');
    expect(await enLetras(page, '1')).toBe('un lempira');
    expect(await enLetras(page, '21')).toBe('veintiún lempiras');
    expect(await enLetras(page, '200')).toBe('doscientos lempiras');
    expect(await enLetras(page, '21.000')).toBe('veintiún mil lempiras');
    await expect(page.locator('[role="region"][aria-label="Resultado"] em')).toHaveText(
      '«Págese por este documento la cantidad de veintiún mil lempiras»',
    );
  });

  /**
   * REGRESIÓN 1540 (medio, operativa) · REPARADO el 24/09/2026. El símbolo tecleado se tiraba
   * y el importe salía en la moneda del selector (euro por defecto) sin decir nada.
   *   · «£» solo puede ser la libra → la app ELIGE la libra y lo dice. 1.500 = mil quinientas
   *     libras: centena en femenino, que es obligatorio (DPD, s. v. «uno» §2.3).
   *   · «$» lo usan seis pesos y el dólar (CLDR 48) → la app NO adivina: escribe en la moneda
   *     elegida y AVISA de que el símbolo no es el de esa moneda, hasta que se elige una que sí.
   *   · Si con «£» en el campo se vuelve a elegir el euro a mano, se respeta, pero se avisa y
   *     la libra queda a un clic.
   */
  test('REGRESIÓN 1540 · el símbolo tecleado elige la moneda o se avisa, nunca se tira', async ({ page }) => {
    const nota = panel(page).locator('[role="status"]');

    // «£1.500»: la app pasa a la libra y lo dice
    expect(await enLetras(page, '£1.500')).toBe('mil quinientas libras');
    await expect(page.locator('#moneda')).toHaveValue('GBP');
    await expect(nota).toContainText('Moneda elegida por «£»: libra (Reino Unido)');

    // «$1,500.00» con el euro elegido: sigue en euros, pero con el aviso a la vista
    await page.locator('#moneda').selectOption('EUR');
    expect(await enLetras(page, '$1,500.00')).toBe('mil quinientos euros');
    await expect(nota).toHaveText(
      '«$» puede ser el peso o el dólar, pero el texto sale en euros, la moneda elegida. Elige la tuya en «Moneda».',
    );
    // Elegida una moneda de «$», cuadra y el aviso se retira
    await page.locator('#moneda').selectOption('MXN');
    await expect(page.locator('p[aria-live="polite"]')).toHaveText('mil quinientos pesos');
    await expect(nota).toHaveCount(0);

    // «£» en el campo y el euro elegido a mano: se respeta, se avisa y la libra está a un clic
    expect(await enLetras(page, '£1.500')).toBe('mil quinientas libras');
    await page.locator('#moneda').selectOption('EUR');
    await expect(page.locator('p[aria-live="polite"]')).toHaveText('mil quinientos euros');
    await expect(nota).toContainText('«£» indica la libra, pero el texto sale en euros');
    await page.getByRole('button', { name: 'Escribir en libras' }).click();
    await expect(page.locator('#moneda')).toHaveValue('GBP');
    await expect(page.locator('p[aria-live="polite"]')).toHaveText('mil quinientas libras');

    // Dos monedas que se contradicen no se resuelven adivinando
    expect(await avisoDe(page, '$1.500 €')).toBe('«$» y «€» no son la misma moneda: deja solo una.');

    // Y en «Número suelto» no hay moneda que escribir: se dice que el símbolo queda fuera
    await page.getByRole('button', { name: /Número suelto/ }).click();
    expect(await enLetras(page, '£1.500')).toBe('mil quinientos');
    await expect(nota).toContainText('«£» se ha dejado fuera');
  });

  /**
   * REGRESIÓN 1542 (bajo, operativa) · REPARADO el 24/09/2026. Se aceptaban €, $ y £, pero se
   * rechazaban con «Escribe solo cifras» los símbolos de las monedas del propio selector.
   * Símbolos de CLDR 48 para cada moneda en su país. Todos son inequívocos dentro del selector,
   * así que además eligen la moneda: el texto dice «soles», «quetzales»…
   */
  test('REGRESIÓN 1542 · los símbolos de las monedas del selector se aceptan como €, $ y £', async ({ page }) => {
    const casos: Array<[string, string, string]> = [
      ['S/ 1,500.00', 'PEN', 'mil quinientos soles'],
      ['S/. 1,500.00', 'PEN', 'mil quinientos soles'],
      ['Q1,500.00', 'GTQ', 'mil quinientos quetzales'],
      ['RD$1,500.00', 'DOP', 'mil quinientos pesos'],
      ['L 1,500.00', 'HNL', 'mil quinientos lempiras'], // masculino: hallazgo 1537
      ['US$1,500.00', 'USD', 'mil quinientos dólares'],
      ['₡1500', 'CRC', 'mil quinientos colones'],
      ['1.500 EUR', 'EUR', 'mil quinientos euros'], // el código ISO, como lo etiqueta la app
      ['1500 soles', 'PEN', 'mil quinientos soles'],
    ];
    for (const [entrada, codigo, esperado] of casos) {
      expect(await enLetras(page, entrada), entrada).toBe(esperado);
      await expect(page.locator('#moneda'), entrada).toHaveValue(codigo);
    }

    // «C$1,500»: una sola coma es decimal español, como sin símbolo (1,50 córdobas), y la otra
    // lectura sigue a un clic. Al pulsarla, el campo se reescribe SIN perder el símbolo.
    expect(await enLetras(page, 'C$1,500')).toBe('un córdoba con cincuenta centavos');
    await page.getByRole('button', { name: 'Leer 1500' }).click();
    await expect(page.locator('#cantidad')).toHaveValue('C$1500');
    await expect(page.locator('p[aria-live="polite"]')).toHaveText('mil quinientos córdobas');
  });

  /**
   * REGRESIÓN 1543 (bajo, contenido) · REPARADO el 24/09/2026. En «Número suelto» la etiqueta
   * forzaba dos decimales mientras el texto leía todas las cifras. Ahora enseña las cifras tal
   * como se teclearon, igual que las lee el texto.
   */
  test('REGRESIÓN 1543 · en número suelto la etiqueta enseña la cifra que se lee', async ({ page }) => {
    await page.getByRole('button', { name: /Número suelto/ }).click();
    const etiqueta = panel(page).locator('span').first();
    expect(await enLetras(page, '1,5')).toBe('uno coma cinco');
    await expect(etiqueta).toHaveText('1,5');
    expect(await enLetras(page, '0,001')).toBe('cero coma cero cero uno');
    await expect(etiqueta).toHaveText('0,001');
    expect(await enLetras(page, '3,14159')).toBe('tres coma uno cuatro uno cinco nueve');
    await expect(etiqueta).toHaveText('3,14159');
    // El cero final tecleado, que el texto lee (REGRESIÓN 5), también está en la etiqueta
    expect(await enLetras(page, '12.345,50')).toBe('doce mil trescientos cuarenta y cinco coma cinco cero');
    await expect(etiqueta).toHaveText('12.345,50');
    expect(await enLetras(page, '-7')).toBe('menos siete');
    await expect(etiqueta).toHaveText('-7');
  });

  /**
   * REGRESIÓN 1539 (medio, operativa), la mitad del redondeo · REPARADO el 24/09/2026. Con más
   * de dos decimales, un importe se redondea a céntimos: «3.847,501500» salía exactamente
   * igual que 3.847,50, sin ningún aviso. Ahora se dice cómo se ha leído.
   */
  test('REGRESIÓN 1539 · un importe con más de dos decimales avisa del redondeo', async ({ page }) => {
    expect(await enLetras(page, '3.847,501500')).toBe(
      'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos',
    );
    await expect(panel(page).locator('[role="status"]')).toHaveText(
      'Un importe lleva dos decimales como mucho: 3.847,501500 se ha leído como 3847,50.',
    );
    // Con dos decimales, nada que avisar
    expect(await enLetras(page, '3.847,50')).toBe(
      'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos',
    );
    await expect(panel(page).locator('[role="status"]')).toHaveCount(0);
    // En número suelto no se redondea: se leen todas las cifras
    await page.getByRole('button', { name: /Número suelto/ }).click();
    expect(await enLetras(page, '3.847,501500')).toBe(
      'tres mil ochocientos cuarenta y siete coma cinco cero uno cinco cero cero',
    );
    await expect(panel(page).locator('[role="status"]')).toHaveCount(0);
  });

  /**
   * REGRESIÓN 1541 (medio, accesibilidad) · REPARADO el 24/09/2026. ff406b1b (26/08) metió la
   * regla oscura del aviso de coma ambigua EN MEDIO de la lista de .helper, .ejemplosLabel y
   * .toggleAyuda: en oscuro los tres heredaban el fondo ámbar. Vuelven a su lista (color
   * #94a3b8, sin fondo), y el aviso conserva el suyo.
   */
  test('REGRESIÓN 1541 · en oscuro los textos de ayuda no llevan el fondo ámbar del aviso', async ({ page }) => {
    const ayudas = [
      page.locator('#cantidad ~ p').first(),
      page.getByText('Prueba con:'),
      page.getByText('Con tildes, como manda la ortografía'),
    ];
    await expect(ayudas[0]).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // tema claro
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // Lectura ÚNICA tras la transición de 0,3 s de globals.css: un toHaveCSS con reintentos
    // casaría con el primer fotograma de la transición, que aún es transparente.
    await page.waitForTimeout(700);
    for (const ayuda of ayudas) {
      expect(await ayuda.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
      expect(await ayuda.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(148, 163, 184)'); // #94a3b8
    }
    // El aviso de la coma ambigua sí conserva su fondo ámbar
    await enLetras(page, '830,400');
    const aviso = panel(page).locator('[role="status"]');
    await page.waitForTimeout(400);
    expect(await aviso.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(245, 158, 11, 0.14)');
  });

  /**
   * REGRESIÓN 1544 (bajo, accesibilidad) · REPARADO el 24/09/2026. Texto blanco sobre el color
   * de marca y color de marca como texto pequeño, por debajo de 4,5:1. Ahora los fondos con
   * texto blanco usan --primary-boton / --secondary-boton (iguales en los dos temas) y los
   * textos de marca --primary-texto (o el acento en oscuro). Medido con el fondo EFECTIVO: los
   * fondos translúcidos de los ancestros se componen sobre el primero opaco.
   */
  for (const tema of ['claro', 'oscuro'] as const) {
    test(`REGRESIÓN 1544 · controles con color de marca a 4,5:1 o más, tema ${tema}`, async ({ page }) => {
      await page.getByRole('button', { name: /MAYÚSCULAS/ }).click(); // se mide ACTIVO
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      await page.waitForTimeout(700); // transiciones de fondo y color (0,2-0,3 s)
      const controles = {
        'modo activo': page.getByRole('button', { name: /Importe con moneda/ }),
        'MAYÚSCULAS activo': page.getByRole('button', { name: /MAYÚSCULAS/ }),
        'chip de ejemplo': page.getByRole('button', { name: '1.000.000' }),
        'Copiar': page.getByRole('button', { name: /Copiar/ }),
        'pista del estilo activo': page.locator('[aria-pressed="true"] small').first(),
        // 19,2 px/600 en móvil ya no es «texto grande»: también pide 4,5:1
        'texto en letras': page.locator('p[aria-live="polite"]'),
      };
      for (const [nombre, control] of Object.entries(controles)) {
        expect(await contrasteEfectivo(control), `${nombre} (${tema})`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test.describe('en móvil (390×844, táctil)', () => {
    // Enumerado en vez de `...devices['Pixel 7']`: un `devices` dentro de un describe forzaría
    // un worker nuevo, y estas cinco opciones no.
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('sin scroll horizontal', async ({ page }) => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    });

    /**
     * REGRESIÓN 1538 (medio, operativa) — el hallazgo que mejor explicaba la firma de rotura
     * (se entra, no se ve nada y se recarga). REPARADO el 24/09/2026:
     *   · el resultado va JUSTO DEBAJO del campo (antes: moneda, tres estilos de decimales y
     *     MAYÚSCULAS en medio, ~770 px), y los ajustes finos detrás del resultado;
     *   · el campo llega en la primera pantalla (antes, y=847 en 412×839): hero compacto y la
     *     DisclaimerCard en su sitio del estándar, tras los resultados;
     *   · al tocar el campo se sube bajo la barra del logo, para que el resultado quede en la
     *     mitad de pantalla que deja libre el teclado virtual.
     * El teclado no se puede emular aquí, así que se fija su presupuesto: con el campo tocado,
     * el texto en letras tiene que acabar en la MITAD SUPERIOR de la ventana (844 / 2 = 422 px).
     */
    test('REGRESIÓN 1538 · al llegar se ve el campo, y al escribir el resultado queda sobre el teclado', async ({ page }) => {
      const campo = page.locator('#cantidad');
      const texto = page.locator('p[aria-live="polite"]');
      // Al llegar, sin tocar nada: el campo entero dentro de la primera pantalla
      const alLlegar = await campo.boundingBox();
      expect(alLlegar!.y + alLlegar!.height).toBeLessThanOrEqual(844);

      await campo.tap();
      await campo.fill('1500');
      await expect(texto).toHaveText('mil quinientos euros');
      await expect(campo).toBeInViewport();
      await expect(texto).toBeInViewport();
      const caja = await texto.boundingBox();
      expect(caja!.y + caja!.height, 'el texto en letras, por encima de donde abre el teclado').toBeLessThanOrEqual(422);
      // Y el campo no queda debajo de la barra fija del logo (~62 px)
      expect((await campo.boundingBox())!.y).toBeGreaterThanOrEqual(62);
    });

    test('REGRESIÓN 1538 · pulsar un ejemplo deja el resultado a la vista', async ({ page }) => {
      await page.getByRole('button', { name: '1.000.000' }).tap();
      await expect(page.locator('p[aria-live="polite"]')).toHaveText('un millón de euros');
      await expect(page.locator('p[aria-live="polite"]')).toBeInViewport();
    });

    /**
     * REGRESIÓN 1539 (medio, operativa) · REPARADO el 24/09/2026. El campo llega relleno con
     * el ejemplo 3.847,50 y el cursor quedaba al final: teclear «1500» producía «3.847,501500»,
     * que se redondeaba a 3.847,50 sin aviso. Ahora, al entrar en el campo se selecciona todo y
     * lo tecleado SUSTITUYE al ejemplo. (Si aun así se añaden cifras, avisa: el test de arriba
     * «REGRESIÓN 1539 · un importe con más de dos decimales…».)
     */
    test('REGRESIÓN 1539 · tocar el campo y teclear 1500 sustituye al ejemplo', async ({ page }) => {
      await page.locator('#cantidad').tap();
      await page.keyboard.type('1500');
      await expect(page.locator('#cantidad')).toHaveValue('1500');
      await expect(page.locator('p[aria-live="polite"]')).toHaveText('mil quinientos euros');
    });
  });

  test('REGRESIÓN 1539 · con ratón, el primer clic selecciona el ejemplo y el segundo coloca el cursor', async ({ page }) => {
    const campo = page.locator('#cantidad');
    await campo.click();
    await page.keyboard.type('21');
    await expect(campo).toHaveValue('21');
    await expect(page.locator('p[aria-live="polite"]')).toHaveText('veintiún euros');
    // Ya dentro del campo, un clic coloca el cursor para corregir, como en cualquier campo
    await campo.click();
    await page.keyboard.press('End');
    await page.keyboard.type('0');
    await expect(campo).toHaveValue('210');
  });
});

/**
 * Contraste WCAG entre el color del texto y su fondo EFECTIVO: compone los fondos
 * translúcidos de los ancestros (el tinte del estilo activo, por ejemplo) sobre el primero
 * opaco. Leer solo el fondo del propio elemento da un «transparente» que no se puede medir.
 */
async function contrasteEfectivo(control: Locator): Promise<number> {
  return control.evaluate((el) => {
    const rgba = (c: string) => {
      const n = (c.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const capas: number[][] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let fondo = [255, 255, 255];
    for (const c of capas.reverse()) fondo = fondo.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const a = lum(rgba(getComputedStyle(el).color));
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

/**
 * ══════════════════════════════════════════════════════════════════════════════════════════
 * CUARTA INSPECCIÓN · 25/09/2026 — re-inspección por FIRMA DE ROTURA
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * La firma (30 días hasta el 24/09/2026): 81,6 % de visitas cortas (catálogo 62,4 %) y 6,6 %
 * de recargas tras visita corta (catálogo 3,1 %), en 76 visitas. La ventana termina el día de
 * la reparación de los hallazgos 1537-1544, así que aún no la refleja.
 *
 * LO QUE EXPLICA LA FIRMA: los hallazgos 1538 y 1539, reparados el 24/09. Con el campo relleno
 * con 3.847,50 y el cursor al final, teclear «1500» daba «3.847,501500», que se redondeaba a
 * 3.847,50: el panel NO cambiaba. Entrar, teclear, no ver nada y recargar es exactamente esa
 * firma. Hoy se sostiene en escritorio (clic y Tab) y en móvil (toque, segundo toque, es-MX):
 * lo tecleado sustituye al ejemplo y el texto queda sobre el teclado. Una visita corta, además,
 * es lo esperable en un conversor: se teclea, se copia y se va.
 *
 * ESPERADOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal) — 21.201 libras. 21.201 = 21 millares + 201. La libra es femenina (DLE,
 *     s. v. «libra»). Las centenas concuerdan SIEMPRE con el sustantivo femenino y «uno» pasa a
 *     «una» (DPD, s. v. «uno» §2.3): «doscientas una». Con «mil» interpuesto la concordancia
 *     es opcional y la app elige la femenina (fijado el 24/09): «veintiuna mil».
 *       → «veintiuna mil doscientas una libras»
 *     En euros, masculino y apócope ante el sustantivo (§2.2): «veintiún mil doscientos un euros».
 *     Y la consulta real de Bing «$17,149.16 pesos»: dos separadores, manda el último → 17.149,16;
 *     «ciento» porque le sigue un número menor; «dieciséis» con tilde (OLE 2010).
 *       → «diecisiete mil ciento cuarenta y nueve pesos con dieciséis centavos» · «… con 16/100»
 *   CASO 2 (límite) — 0 € → «cero euros» (plural con cero). 0,01 £ → «cero libras con un
 *     penique» (penique m.). 200.000 £ → «doscientas mil libras» (centena femenina ante «mil»).
 *     1.000.000 £ → «un millón de libras» (DPD, s. v. «millón»: con «de» si no sigue otro
 *     numeral). 1.000.000.000 £ → «mil millones de libras» (escala larga: no es «un billón»).
 *   CASO 3 (rechazo) — «1'500.00»: el apóstrofo no es separador en español (DPD, s. v.
 *     «números» §1.1d: «No debe utilizarse el apóstrofo con este valor: ⊗3’1416»). Y «1,5
 *     millones» lleva letras. Los dos, con el aviso de la app y SIN ningún importe en letras.
 *
 * LA SOSPECHA «M.N.» Y LA MONEDA POR DEFECTO, DESCARTADA COMO HALLAZGO: con el navegador en
 * es-MX la app arranca en euros («Págese por este pagaré… euros»), igual que en es-ES. Pero no
 * promete detectar el país ni el formato «M.N.»: ni el <h1> «Números a Letras», ni la metadata,
 * ni la FAQ, ni el bloque educativo mencionan cheques mexicanos; lo que promete para
 * Latinoamérica es la fracción «con 50/100», y la da («… pesos con 16/100»), que es una
 * variante en uso, no un formato incorrecto. El euro se ve en el selector, justo encima del
 * campo, y un «$» tecleado ya dispara el aviso. Lo que SÍ es un hallazgo, abajo: el «M.N.»
 * tecleado se tira en silencio con el euro elegido.
 *
 * HALLAZGOS (test.fail: afirman lo CORRECTO y hoy fallan; al repararse, se quita la marca)
 *   A · «Págese» por «Páguese» en la línea modelo para el documento (ortografía)
 *   B · número suelto: la FAQ niega «tres coma cuarenta y cinco» contra el DPD §3.4
 *   C · medio céntimo: 0,145 se anuncia «0,15» y se escribe «catorce céntimos»
 *   D · «M.N.» tecleado con el euro elegido: se descarta sin aviso
 *   E · «Lps.» (lempira) y «¢» (colón) se rechazan aunque la ayuda diga «con o sin símbolo»
 */
test.describe('Inspección 25/09/2026 — firma de rotura, México, redondeo y norma del DPD', () => {
  const panel = (page: Page) => page.locator('[role="region"][aria-label="Resultado"]');
  const texto = (page: Page) => page.locator('p[aria-live="polite"]');
  // Solo el aviso de la app: getByRole('alert') casaría también con el anunciador de rutas de Next
  const aviso = (page: Page) => panel(page).locator('[role="alert"]');
  const notas = (page: Page) => panel(page).locator('[role="status"]');

  /** Escribe como el usuario (fill) y espera a que el ESTADO de React lo haya recogido. */
  async function escribir(page: Page, entrada: string): Promise<void> {
    await page.locator('#cantidad').fill(entrada);
    await esperarValorEnReact(page, '#cantidad', entrada);
  }

  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['#cantidad']);
  });

  test('CASO 1 · 21.201 libras y euros, y la consulta real «$17,149.16 pesos»', async ({ page }) => {
    // DPD «uno» §2.2: apócope ante sustantivo masculino
    await escribir(page, '21.201');
    await expect(texto(page)).toHaveText('veintiún mil doscientos un euros');

    // DPD «uno» §2.3: centena y «una» concuerdan con la libra (f.)
    await page.locator('#moneda').selectOption('GBP');
    await expect(texto(page)).toHaveText('veintiuna mil doscientas una libras');

    // «$» y «pesos» no dicen QUÉ peso: la app no adivina y avisa hasta que se elige
    await page.locator('#moneda').selectOption('EUR');
    await escribir(page, '$17,149.16 pesos');
    await expect(texto(page)).toHaveText('diecisiete mil ciento cuarenta y nueve euros con dieciséis céntimos');
    await expect(notas(page)).toContainText('pero el texto sale en euros');
    await page.locator('#moneda').selectOption('MXN');
    await expect(texto(page)).toHaveText('diecisiete mil ciento cuarenta y nueve pesos con dieciséis centavos');
    await expect(notas(page)).toHaveCount(0);
    // La fracción sobre cien que promete el bloque «Facturas en Latinoamérica»
    await page.getByRole('button', { name: /Fracción 00\/100/ }).click();
    await expect(texto(page)).toHaveText('diecisiete mil ciento cuarenta y nueve pesos con 16/100');
  });

  test('CASO 2 · cero, un penique, centenas femeninas ante «mil», millón y mil millones', async ({ page }) => {
    await escribir(page, '0');
    await expect(texto(page)).toHaveText('cero euros');

    await page.locator('#moneda').selectOption('GBP');
    const casos: Array<[string, string]> = [
      ['0,01', 'cero libras con un penique'],
      ['200.000', 'doscientas mil libras'], // DPD «uno» §2.3: la centena concuerda siempre
      ['1.000.000', 'un millón de libras'], // DPD «millón»: con «de»
      ['1.000.000.000', 'mil millones de libras'], // escala larga: 10⁹ no es «un billón»
    ];
    for (const [entrada, esperado] of casos) {
      await escribir(page, entrada);
      await expect(texto(page), entrada).toHaveText(esperado);
    }
  });

  test('CASO 3 · el apóstrofo suizo y las cifras con letras se rechazan sin inventar importe', async ({ page }) => {
    // DPD «números» §1.1d: el apóstrofo no es separador en español (⊗3’1416)
    for (const entrada of ["1'500.00", "1'234'567,50", '1,5 millones']) {
      await escribir(page, entrada);
      await expect(aviso(page), entrada).toHaveText(
        'No se reconoce esa cantidad. Escribe solo cifras, con coma o punto decimal.',
      );
      await expect(texto(page), entrada).toHaveCount(0);
    }
  });

  test('FIRMA · con teclado (Tab) lo tecleado también sustituye al ejemplo', async ({ page }) => {
    await page.locator('#moneda').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#cantidad')).toBeFocused();
    await page.keyboard.type('21');
    await esperarValorEnReact(page, '#cantidad', '21');
    await expect(texto(page)).toHaveText('veintiún euros');
  });

  test.describe('con el navegador en español de México (es-MX)', () => {
    test.use({ locale: 'es-MX' });

    test('SOSPECHA descartada · arranca en euros, pero «$ … M.N.» elige el peso y da la fracción', async ({ page }) => {
      expect(await page.evaluate(() => navigator.language)).toBe('es-MX');
      // No promete detectar el país: el euro por defecto se ve en el selector, sobre el campo
      await expect(page.locator('#moneda')).toHaveValue('EUR');

      await escribir(page, '$1,500.00 M.N.');
      await expect(page.locator('#moneda')).toHaveValue('EUR'); // «$» es ambiguo: no adivina…
      await expect(notas(page)).toContainText('«$» puede ser el peso o el dólar'); // …y avisa
      await page.locator('#moneda').selectOption('MXN');
      await expect(texto(page)).toHaveText('mil quinientos pesos');
      await page.getByRole('button', { name: /Fracción 00\/100/ }).click();
      await expect(texto(page)).toHaveText('mil quinientos pesos con 00/100');
      await expect(panel(page).locator('em')).toHaveText(
        '«Págese por este documento la cantidad de mil quinientos pesos con 00/100»',
      );

      // El formato de México con los dos separadores se lee sin duda que resolver
      await escribir(page, '830,400.00');
      await expect(texto(page)).toHaveText('ochocientos treinta mil cuatrocientos pesos con 00/100');
    });

    /**
     * HALLAZGO D (bajo, operativa). «M.N.» es «moneda nacional», la marca de los importes de
     * México. La app lo admite al final de la cifra (separarMarcaMoneda) pero no lo usa: con el
     * euro elegido, «1,500.00 M.N.» sale «mil quinientos euros» SIN ningún aviso, mientras que
     * «$1,500.00» sí avisa. Es la clase de fallo del hallazgo 1540 («la marca no se descarta:
     * elige la moneda o se avisa»). Lo correcto: pasar al peso mexicano o avisar.
     */
    test('HALLAZGO D · «1,500.00 M.N.» con el euro elegido no se escribe en euros sin avisar', async ({ page }) => {
      test.fail();
      await escribir(page, '1,500.00 M.N.');
      await expect(texto(page)).toBeVisible();
      await expect(async () => {
        const moneda = await page.locator('#moneda').inputValue();
        const avisos = await notas(page).allInnerTexts();
        expect(moneda === 'MXN' || avisos.some((a) => a.includes('M.N.'))).toBe(true);
      }).toPass({ timeout: 2000 });
    });
  });

  test.describe('en móvil con el navegador en es-MX (390×844, táctil)', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      locale: 'es-MX',
    });

    test('FIRMA · tocar, teclear 1,500.00 tecla a tecla y volver a tocar: sustituye y se ve', async ({ page }) => {
      const campo = page.locator('#cantidad');
      await campo.tap();
      await page.keyboard.type('1,500.00', { delay: 20 });
      await esperarValorEnReact(page, '#cantidad', '1,500.00');
      await expect(texto(page)).toHaveText('mil quinientos euros');
      // Presupuesto del teclado virtual (REGRESIÓN 1538): el texto, en la mitad superior
      const caja = await texto(page).boundingBox();
      expect(caja!.y + caja!.height).toBeLessThanOrEqual(422);

      // Salir del campo y volver a tocarlo: lo nuevo sustituye otra vez, no se añade
      await page.locator('h1').tap();
      await campo.tap();
      await page.keyboard.type('830,400.00', { delay: 20 });
      await esperarValorEnReact(page, '#cantidad', '830,400.00');
      await expect(texto(page)).toHaveText('ochocientos treinta mil cuatrocientos euros');
      await expect(texto(page)).toBeInViewport();
      await expect(page.getByRole('button', { name: /Copiar/ })).toBeInViewport();
    });
  });

  /**
   * HALLAZGO A (medio, contenido). La línea modelo que la app ofrece para el documento dice
   * «Págese», que no existe: el subjuntivo de «pagar» es «pague» (g → gu ante e) y con el
   * enclítico, «páguese». Es la fórmula que da el propio DPD (s. v. «números» §3.2a): «Páguese
   * al portador de este cheque la cantidad de veinticinco mil trescientos treinta y ocho euros».
   * Sale en TODO importe, en una app que promete «las reglas del español bien aplicadas».
   * Ojo al reparar: las expectativas de «CASO 1 · 3.847,50 €…», «CASO 2a», «REGRESIÓN 1537» y
   * «SOSPECHA descartada» copian hoy «Págese» y habrá que corregirlas a la vez.
   */
  test('HALLAZGO A · la línea para el documento dice «Páguese», no «Págese»', async ({ page }) => {
    test.fail();
    await escribir(page, '1.500');
    await expect(texto(page)).toHaveText('mil quinientos euros');
    await expect(panel(page).locator('em')).toHaveText(/^«Páguese /, { timeout: 2000 });
  });

  /**
   * HALLAZGO B (medio, contenido). La FAQ (en pantalla y en el FAQPage JSON-LD) responde a
   * «¿3,45 es "tres coma cuarenta y cinco"?» con «Suelto no: las cifras tras la coma se leen una
   * a una», y el modo «Número suelto» solo da esa lectura. El DPD (s. v. «números» §3.4) dice
   * otra cosa: «Para expresar con palabras los números decimales, debe mencionarse primero la
   * parte entera y después la decimal, unidas ambas por la conjunción y o por la preposición
   * con: 20,58 = veinte (unidades o enteros) con cincuenta y ocho (centésimas)» — la parte
   * decimal como NÚMERO—, y la lectura con «coma» («siete coma cero ocho») es un recurso «del
   * registro oral» que «no es apropiado en documentos de carácter técnico, administrativo o
   * contable», que son justo los contratos y facturas para los que la app dice servir. La cita
   * «DPD: 3,45 es "tres coma cuatro cinco", no "cuarenta y cinco"» del CASO 2d no está en el DPD.
   * Lo correcto: ofrecer la forma escrita del §3.4 para documentos.
   */
  test('HALLAZGO B · número suelto: la forma escrita del DPD §3.4 para 3,45', async ({ page }) => {
    test.fail();
    await page.getByRole('button', { name: /Número suelto/ }).click();
    await escribir(page, '3,45');
    await expect(texto(page)).toBeVisible();
    await expect(panel(page)).toContainText('tres con cuarenta y cinco centésimas', { timeout: 2000 });
  });

  /**
   * HALLAZGO C (bajo, cálculo). cantidadALetras() redondea con Math.round(|v| × 100), y en coma
   * flotante 0,145 × 100 = 14,499999…, así que escribe 14 céntimos; la etiqueta y el aviso de
   * redondeo usan formatNumber (Intl), que redondea el decimal tecleado y dicen 0,15. La app
   * se contradice en pantalla: «se ha leído como 0,15» encima de «catorce céntimos». El motor
   * promete redondear «igual que haría cualquier factura» (al alza en el medio céntimo). Pasa
   * en 4.588 de los 100.000 medios céntimos entre 0,005 y 999,995 (0,145 · 0,285 · 1,005 ·
   * 2,135…).
   */
  test('HALLAZGO C · el medio céntimo se escribe como lo anuncia la propia app', async ({ page }) => {
    test.fail();
    const etiqueta = panel(page).locator('span').first();
    await escribir(page, '0,145');
    await expect(etiqueta).toHaveText('0,15 EUR');
    await expect(notas(page)).toHaveText('Un importe lleva dos decimales como mucho: 0,145 se ha leído como 0,15.');
    await expect(texto(page)).toHaveText('cero euros con quince céntimos', { timeout: 2000 });
    await escribir(page, '1,0050');
    await expect(etiqueta).toHaveText('1,01 EUR');
    await expect(texto(page)).toHaveText('un euro con un céntimo', { timeout: 2000 });
  });

  /**
   * HALLAZGO E (bajo, operativa). La ayuda del campo dice «con o sin símbolo de moneda», y el
   * 24/09 se añadieron los de CLDR (hallazgo 1542). Faltan las abreviaturas de uso diario de
   * dos monedas del selector: «Lps.» para el lempira (Honduras, ~7 % de las visitas en agosto)
   * y «¢», que sustituye a «₡» en las etiquetas de precios de Costa Rica porque «₡» no está en
   * el teclado. Las dos se rechazan con «Escribe solo cifras». También «$U» (peso uruguayo) y
   * «U$S» (dólar en el Río de la Plata).
   */
  test('HALLAZGO E · «Lps.» y «¢» se leen como lempiras y colones', async ({ page }) => {
    test.fail();
    const casos: Array<[string, string, string]> = [
      ['Lps. 1,500.00', 'HNL', 'mil quinientos lempiras'],
      ['¢1.500', 'CRC', 'mil quinientos colones'],
    ];
    for (const [entrada, codigo, esperado] of casos) {
      await page.locator('#moneda').selectOption('EUR');
      await escribir(page, entrada);
      await expect(texto(page), entrada).toHaveText(esperado, { timeout: 2000 });
      await expect(page.locator('#moneda'), entrada).toHaveValue(codigo);
    }
  });
});
