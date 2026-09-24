import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

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
   * HALLAZGO abierto (alto, dato): el lempira es MASCULINO y la app lo declara femenino en
   * MONEDAS (lib/numeroALetras.ts, genero: 'femenino'). DLE, s. v. «lempira»: «1. m. Unidad
   * monetaria de Honduras»; Ley Monetaria de Honduras, art. 1: «La unidad monetaria de
   * Honduras es EL Lempira». Con la concordancia de las centenas, que es obligatoria (DPD
   * «uno» §2.3), la app escribe en el cheque «doscientas lempiras». Honduras aportaba 20 de
   * las 282 visitas del 17-21/08.
   */
  test('HALLAZGO lempira · el lempira es masculino: un lempira, veintiún y doscientos lempiras', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: HNL declarado femenino; da «una lempira», «doscientas lempiras»');
    await page.locator('#moneda').selectOption('HNL');
    expect(await enLetras(page, '1')).toBe('un lempira');
    expect(await enLetras(page, '21')).toBe('veintiún lempiras');
    expect(await enLetras(page, '200')).toBe('doscientos lempiras');
  });

  /**
   * HALLAZGO abierto (medio, operativa): el símbolo de moneda tecleado se descarta en silencio
   * y se escribe la moneda del selector, que por defecto es el euro. Quien pega «$1,500.00» o
   * «£1.500» lee «mil quinientos euros» sin ningún aviso. Lo correcto, con cualquier
   * reparación razonable: o el resultado no dice «euros», o la app avisa de que el símbolo
   * no coincide con la moneda elegida.
   */
  test('HALLAZGO símbolo · «£1.500» y «$1,500.00» no pueden salir en euros sin avisar', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: el £/$ tecleado se descarta y sale «mil quinientos euros» sin aviso');
    for (const entrada of ['£1.500', '$1,500.00']) {
      const texto = await enLetras(page, entrada);
      const avisos = await panel(page).locator('[role="status"], [role="alert"]').count();
      expect(avisos > 0 || !texto.includes('euros'), `${entrada} → «${texto}»`).toBe(true);
    }
  });

  /**
   * HALLAZGO abierto (bajo, operativa): la app tolera €, $ y £ pegados a la cifra, pero
   * rechaza el símbolo de monedas que ella misma ofrece en el selector: S/ (sol), Q
   * (quetzal), RD$ (peso dominicano), L (lempira), C$ (córdoba), ₡ (colón). El mensaje sí
   * explica qué quiere («Escribe solo cifras»), así que no es mudo, pero es incoherente con
   * «$1,500.00», que entra.
   */
  test('HALLAZGO símbolos · los de las monedas del selector se rechazan y el $ no', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: «S/ 1,500.00» se rechaza mientras «$1,500.00» se acepta');
    expect(await enLetras(page, '$1,500.00')).toBe('mil quinientos euros'); // el $ sí entra
    for (const entrada of ['S/ 1,500.00', 'Q1,500.00', 'RD$1,500.00']) {
      // enLetras espera al texto en letras: hoy no llega porque sale el aviso de rechazo
      expect(await enLetras(page, entrada), entrada).toContain('mil quinientos');
    }
  });

  /**
   * HALLAZGO abierto (bajo, contenido): en «Número suelto» la etiqueta de control, que es la
   * que confirma cómo se ha interpretado la cifra (REGRESIÓN 2), redondea a dos decimales lo
   * que el texto lee entero: «1,5» se etiqueta «1,50» y se lee «uno coma cinco»; «0,001» se
   * etiqueta «0,00» y se lee «cero coma cero cero uno».
   */
  test('HALLAZGO etiqueta · en número suelto la etiqueta enseña la cifra que se lee', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: la etiqueta de número suelto fuerza dos decimales');
    await page.getByRole('button', { name: /Número suelto/ }).click();
    const etiqueta = panel(page).locator('span').first();
    expect(await enLetras(page, '1,5')).toBe('uno coma cinco');
    await expect(etiqueta).toHaveText('1,5', { timeout: 1000 });
    expect(await enLetras(page, '0,001')).toBe('cero coma cero cero uno');
    await expect(etiqueta).toHaveText('0,001', { timeout: 1000 });
  });

  /**
   * HALLAZGO abierto (medio, accesibilidad): regresión de ff406b1b (26/08). La regla del aviso
   * de coma ambigua se insertó EN MEDIO de la lista de selectores oscuros de .helper,
   * .ejemplosLabel y .toggleAyuda, de modo que en tema oscuro esos tres textos pierden su
   * color (#94a3b8) y heredan el fondo ámbar del aviso: tres franjas marrones bajo el campo,
   * «Prueba con:» y «Con tildes…», con el texto a 4,12:1 (13,6 px, pide 4,5:1). En claro, sin
   * fondo. Lo correcto: fondo transparente también en oscuro.
   */
  test('HALLAZGO oscuro · los textos de ayuda no llevan el fondo ámbar del aviso', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: en oscuro .helper/.ejemplosLabel/.toggleAyuda tienen fondo rgba(245, 158, 11, 0.14)');
    const ayuda = page.locator('#cantidad ~ p').first();
    await expect(ayuda).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // tema claro: sin fondo
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // Lectura ÚNICA tras la transición de 0,3 s de globals.css: un toHaveCSS con reintentos
    // casaría con el primer fotograma de la transición, que aún es transparente.
    await page.waitForTimeout(700);
    expect(await ayuda.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  });

  /**
   * HALLAZGO abierto (bajo, accesibilidad): texto blanco sobre el color de marca en los
   * botones activos. «Importe con moneda» activo: blanco sobre #2E86AB = 4,11:1 en claro y
   * blanco sobre rgb(63,165,209) = 2,80:1 en oscuro, a 16 px/600 (no es texto grande: pide
   * 4,5:1). El CLAUDE.md lo deja fuera del candado de contraste («botones y badges con fondo
   * de marca, campaña aparte»), así que ningún candado lo habría parado.
   */
  test('HALLAZGO contraste · el botón de modo activo alcanza 4,5:1 en oscuro', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: blanco sobre --primary oscuro = 2,80:1');
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const activo = page.getByRole('button', { name: /Importe con moneda/ });
    await expect(activo).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(400); // la transición de fondo es de 0,2 s
    const ratio = await activo.evaluate((el) => {
      const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lum = (c: string) => {
        const [r, g, b] = rgb(c).map((v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const cs = getComputedStyle(el);
      const a = lum(cs.color);
      const b = lum(cs.backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

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
     * HALLAZGO abierto (medio, operativa) — el que mejor explica la firma de rotura. En móvil
     * el resultado vive ~770 px por debajo del campo (en medio: moneda, los tres estilos de
     * decimales y MAYÚSCULAS). Al tocar el campo y escribir, ni el texto en letras, ni el aviso
     * de rechazo, ni el de coma ambigua están a la vista, y eso sin contar el teclado virtual,
     * que tapa otra media pantalla. Medido en Pixel 7 (412×839): campo en y=847 (ya por debajo
     * de la primera pantalla), resultado en y=1615.
     */
    test('HALLAZGO móvil · al escribir en el campo, el resultado está a la vista', async ({ page }) => {
      test.fail(true, 'HALLAZGO abierto: el resultado queda fuera de la pantalla mientras se escribe');
      await page.locator('#cantidad').tap();
      await page.locator('#cantidad').fill('1500');
      await expect(page.locator('p[aria-live="polite"]')).toHaveText('mil quinientos euros');
      await expect(page.locator('#cantidad')).toBeInViewport();
      await expect(page.locator('p[aria-live="polite"]')).toBeInViewport({ timeout: 1000 });
    });

    /**
     * HALLAZGO abierto (medio, operativa): el campo llega RELLENO con 3.847,50 (no es un
     * placeholder). Al tocarlo el cursor queda al final, y quien teclea su importe sin borrar
     * produce «3.847,501500»: el parser lo acepta (la coma es el último separador, así que son
     * seis decimales) y el importe redondea a 3.847,50, de modo que el panel sigue diciendo
     * exactamente lo mismo que antes, sin aviso, pese a que la ayuda anuncia «dos decimales».
     * Lo correcto, con cualquier reparación: o sale el importe tecleado, o sale un aviso.
     */
    test('HALLAZGO precargado · tocar el campo y teclear 1500 no deja el resultado igual en silencio', async ({ page }) => {
      test.fail(true, 'HALLAZGO abierto: «3.847,50» + «1500» = «3.847,501500», leído como 3.847,50 sin aviso');
      await page.locator('#cantidad').tap();
      await page.keyboard.type('1500');
      await expect(page.locator('#cantidad')).toHaveValue(/1500$/);
      const texto = (await page.locator('p[aria-live="polite"]').textContent()) ?? '';
      const alertas = await panel(page).locator('[role="alert"], [role="status"]').count();
      expect(alertas > 0 || texto.startsWith('mil quinientos'), `obtenido «${texto}»`).toBe(true);
    });
  });
});
