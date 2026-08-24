import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — conversor-numeros-letras (segmento CÁLCULO, riesgo 3, 351 usos reales)
 *
 * Primera inspección: 24/08/2026. La app promete en su <h1> «Números a Letras» y en su
 * subtítulo «Escribe cualquier cifra en palabras con las reglas del español bien aplicadas:
 * apócope, concordancia de género, cien frente a ciento y escala larga. Para cheques,
 * pagarés, contratos y facturas». La metadata añade «17 monedas y formato 00/100». Hay,
 * por tanto, dos motores comprobables (importe con moneda y número suelto) y una ortografía
 * normada por la RAE contra la que contrastarlos.
 *
 * DÓNDE VIVE EL CÁLCULO — lib/numeroALetras.ts (motor puro, sin React ni DOM)
 *   · enteroALetras()   ← descompone en millones / millares / unidades y compone los grupos
 *                         de tres. Aplica apócope («un», «veintiún») y concordancia de
 *                         género («doscientas», «una») según el sustantivo que sigue.
 *   · cantidadALetras() ← redondea a céntimos (Math.round(|v| × 100)), escoge singular o
 *                         plural de la moneda y añade la fracción en letras o como 00/100.
 *   · numeroALetras()   ← número suelto; los decimales se leen cifra a cifra tras «coma».
 *   app/…/page.tsx      ← parseSpanishNumber() de lib/formatters.ts para leer la entrada,
 *                         y LIMITE_NUMERO_A_LETRAS = 999.999.999.999 como tope.
 *
 * LOS TRES CASOS, ESCRITOS LETRA A LETRA ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — importe 3.847,50 € con los decimales en letras
 *       «tres mil ochocientos cuarenta y siete euros con cincuenta céntimos»
 *       Norma: la parte entera son 3.847 = tres mil + ochocientos + cuarenta y siete; del 31
 *       en adelante el numeral se escribe en tres palabras (OLE 2010, § 10.4). Los céntimos
 *       son una subunidad y sí forman número: «con cincuenta céntimos».
 *       Junto a él, las trampas clásicas del español, resueltas a mano:
 *         21 € → «veintiún euros»  (apócope ante sustantivo; suelto sería «veintiuno»)
 *         100 € → «cien euros» · 101 € → «ciento un euros»  (nunca «cien uno»)
 *         500 € → «quinientos» · 700 € → «setecientos» · 900 € → «novecientos»
 *         1.000 € → «mil euros»  (jamás «un mil»)  · 2.000 € → «dos mil euros»
 *         100.000 € → «cien mil euros»  (nunca «ciento mil»)
 *         201 libras → «doscientas una libras»  (concordancia con moneda femenina)
 *
 *   CASO 2 (límite) — el tope admitido, el cero, el negativo y los decimales
 *       999.999.999.999 en modo número suelto:
 *       «novecientos noventa y nueve mil novecientos noventa y nueve millones novecientos
 *        noventa y nueve mil novecientos noventa y nueve»
 *       Norma: escala larga del español — 10⁹ son «mil millones», no «un billón», que son
 *       10¹² (DPD, s. v. «billón»); «millones» en plural y sin «de» porque le siguen más
 *       numerales.
 *       0 € → «cero euros» (plural: la moneda solo va en singular con el 1)
 *       −21 € → «menos veintiún euros» (el signo no se pierde)
 *       1,50 € → «un euro con cincuenta céntimos» · 0,05 € → «cero euros con cinco céntimos»
 *       3,45 suelto → «tres coma cuatro cinco» (cifra a cifra, no «cuarenta y cinco»)
 *
 *   CASO 3 (rechazo) — vacío, texto y fuera de rango
 *       ''      → sin resultado: «Escribe una cantidad para verla en letras.»
 *       'abc'   → «No se reconoce esa cantidad. Escribe solo cifras, con coma o punto decimal.»
 *       1.000.000.000.000 → «La cantidad máxima admitida es 999.999.999.999.»
 *
 * HALLAZGOS del 24/08/2026 — documentados aquí como TESTIGO, afirmando el comportamiento
 * defectuoso tal y como está hoy. Cuando se reparen, estos tests se ponen en rojo y hay que
 * invertirlos a la forma correcta, que va escrita en cada comentario.
 *   1. (alto) Falta la preposición «de» tras «millón/millones» cuando la cifra es un número
 *      redondo de millones: sale «un millón euros», «dos millones euros», «mil millones
 *      euros». El DPD (s. v. «millón») es explícito: si millón(es) NO va seguido de otro
 *      numeral, el sustantivo cuantificado se introduce con «de» — «un millón de euros»;
 *      solo desaparece cuando siguen más numerales — «un millón quinientos mil euros», que
 *      la app sí resuelve bien. Se alcanza con un clic en el ejemplo «1.000.000» que la
 *      propia app ofrece, y se cuela en la línea «Págese por este pagaré la cantidad de…».
 *   2. (alto) El texto de ayuda promete «Admite los dos formatos: 3.847,50 y 3,847.50», pero
 *      parseSpanishNumber() resuelve SIEMPRE a favor del español cuando ve punto y coma a la
 *      vez: 3,847.50 se convierte en 3,85 € y 1,234,567.89 en 1,23 €. El error es de tres a
 *      seis órdenes de magnitud y no avisa: en una app para cheques, la ayuda promete algo
 *      que el parser no hace.
 *   3. (medio) parseFloat() acepta prefijos numéricos, así que entra basura sin aviso pese a
 *      que el mensaje de error dice «Escribe solo cifras»: «12abc» → doce euros, «1.2.3» →
 *      un euro con veinte céntimos, «1e3» → mil euros.
 *   4. (bajo) La ayuda dice «Hasta 999.999.999.999 y dos decimales», pero 999.999.999.999,99
 *      se rechaza: el tope se compara contra el valor con decimales, no contra su entero.
 *   5. (bajo) En modo número suelto la lectura cifra a cifra pierde el cero final: 0,50 sale
 *      «cero coma cinco» y 1,20 «uno coma dos», cuando lo anunciado es leerlas una a una.
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
});

test('CASO 1 · las mayúsculas conservan la tilde', async ({ page }) => {
  await page.getByRole('button', { name: /MAYÚSCULAS/ }).click();
  // OLE 2010, § 3.4.2: las mayúsculas se acentúan igual que las minúsculas.
  expect(await enLetras(page, '16')).toBe('DIECISÉIS EUROS');
  expect(await enLetras(page, '21')).toBe('VEINTIÚN EUROS');
});

// ─── CASO 2 · límite ──────────────────────────────────────────────────────────

test('CASO 2 · el tope admitido, en escala larga del español', async ({ page }) => {
  await page.getByRole('button', { name: /Número suelto/ }).click();
  // 999.999.999.999 = 999.999 millones + 999.999. En español 10⁹ son «mil millones»
  // (escala larga, DPD s. v. «billón»), no «un billón», que son 10¹².
  expect(await enLetras(page, '999.999.999.999')).toBe(
    'novecientos noventa y nueve mil novecientos noventa y nueve millones ' +
      'novecientos noventa y nueve mil novecientos noventa y nueve',
  );
  expect(await enLetras(page, '1.000.000.000')).toBe('mil millones');
});

test('CASO 2 · cero, negativo y decimales', async ({ page }) => {
  expect(await enLetras(page, '0')).toBe('cero euros'); // plural: solo el 1 lleva singular
  expect(await enLetras(page, '-21')).toBe('menos veintiún euros'); // el signo no se pierde
  expect(await enLetras(page, '1,50')).toBe('un euro con cincuenta céntimos');
  expect(await enLetras(page, '0,05')).toBe('cero euros con cinco céntimos');
  expect(await enLetras(page, '0,01')).toBe('cero euros con un céntimo'); // fracción singular
  // Redondeo a céntimos, como cualquier factura: 0,005 → 0,01 y 0,004 → 0,00.
  expect(await enLetras(page, '0,005')).toBe('cero euros con un céntimo');
  expect(await enLetras(page, '0,004')).toBe('cero euros');

  // Número suelto: los decimales se leen cifra a cifra tras «coma».
  await page.getByRole('button', { name: /Número suelto/ }).click();
  expect(await enLetras(page, '3,45')).toBe('tres coma cuatro cinco');
  expect(await enLetras(page, '0,05')).toBe('cero coma cero cinco');
  expect(await enLetras(page, '21')).toBe('veintiuno'); // suelto va sin apócope
});

test('CASO 2 · el parser lee el formato español, con y sin separador de millar', async ({ page }) => {
  // Formato español obligatorio del proyecto: punto de millar, coma decimal.
  expect(await enLetras(page, '1.234,56')).toBe(
    'mil doscientos treinta y cuatro euros con cincuenta y seis céntimos',
  );
  expect(await enLetras(page, '1234,56')).toBe(
    'mil doscientos treinta y cuatro euros con cincuenta y seis céntimos',
  );
  expect(await enLetras(page, '2.500')).toBe('dos mil quinientos euros'); // millar, no 2,5
  expect(await enLetras(page, '3.847,50 €')).toBe(
    'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos',
  );
});

// ─── CASO 3 · rechazo ─────────────────────────────────────────────────────────

test('CASO 3 · vacío, texto y fuera de rango se rechazan sin inventar cifras', async ({ page }) => {
  const panel = page.locator('[role="region"][aria-label="Resultado"]');

  await page.locator('#cantidad').fill('');
  await expect(panel).toContainText('Escribe una cantidad para verla en letras.');

  await page.locator('#cantidad').fill('abc');
  await expect(panel.locator('[role="alert"]')).toHaveText(
    'No se reconoce esa cantidad. Escribe solo cifras, con coma o punto decimal.',
  );

  // Cifras arábigo-índicas: tampoco son «solo cifras» para el parser.
  await page.locator('#cantidad').fill('٣');
  await expect(panel.locator('[role="alert"]')).toBeVisible();

  // Un billón supera el tope de 999.999.999.999 que declara la propia app.
  await page.locator('#cantidad').fill('1.000.000.000.000');
  await expect(panel.locator('[role="alert"]')).toHaveText(
    'La cantidad máxima admitida es 999.999.999.999.',
  );
});

// ─── TESTIGOS DE LOS HALLAZGOS (afirman el fallo tal y como está hoy) ─────────

test('HALLAZGO 1 · los millones redondos salen sin la preposición «de»', async ({ page }) => {
  // DPD, s. v. «millón»: «un millón DE euros» cuando no sigue otro numeral. Al repararse,
  // estas líneas deben pasar a 'un millón de euros', 'dos millones de euros', 'mil millones
  // de euros' y 'un millón de libras'.
  expect(await enLetras(page, '1.000.000')).toBe('un millón euros');
  expect(await enLetras(page, '2.000.000')).toBe('dos millones euros');
  expect(await enLetras(page, '1.000.000.000')).toBe('mil millones euros');

  await page.locator('#moneda').selectOption('GBP');
  expect(await enLetras(page, '1.000.000')).toBe('un millón libras');
});

test('HALLAZGO 2 · el formato US que promete la ayuda da una cantidad mil veces menor', async ({ page }) => {
  await expect(page.locator('#cantidad ~ p').first()).toContainText('3.847,50 y 3,847.50');
  // Lo prometido: 'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos'.
  expect(await enLetras(page, '3,847.50')).toBe('tres euros con ochenta y cinco céntimos');
  // Lo prometido: 'un millón doscientos treinta y cuatro mil quinientos sesenta y siete
  // euros con ochenta y nueve céntimos'.
  expect(await enLetras(page, '1,234,567.89')).toBe('un euro con veintitrés céntimos');
});

test('HALLAZGO 3 · entra basura por el prefijo numérico de parseFloat', async ({ page }) => {
  // El mensaje de error dice «Escribe solo cifras», pero estas tres pasan sin aviso.
  expect(await enLetras(page, '12abc')).toBe('doce euros');
  expect(await enLetras(page, '1.2.3')).toBe('un euro con veinte céntimos');
  expect(await enLetras(page, '1e3')).toBe('mil euros');
});

test('HALLAZGO 4 · el tope con dos decimales se rechaza pese a anunciarse', async ({ page }) => {
  // La ayuda dice «Hasta 999.999.999.999 y dos decimales»; el céntimo lo tira fuera.
  await page.locator('#cantidad').fill('999.999.999.999,99');
  await expect(
    page.locator('[role="region"][aria-label="Resultado"] [role="alert"]'),
  ).toHaveText('La cantidad máxima admitida es 999.999.999.999.');
});

test('HALLAZGO 5 · el número suelto pierde el cero final de los decimales', async ({ page }) => {
  await page.getByRole('button', { name: /Número suelto/ }).click();
  // Anunciado: las cifras tras la coma se leen una a una → 'cero coma cinco cero'.
  expect(await enLetras(page, '0,50')).toBe('cero coma cinco');
  expect(await enLetras(page, '1,20')).toBe('uno coma dos');
});
