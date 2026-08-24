import { test, expect, Page } from '@playwright/test';

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
