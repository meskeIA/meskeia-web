import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * calculadora-sistemas-numericos — Inspector, 20/09/2026
 *
 * QUÉ PROMETE LA APP
 *   · <h1> «Calculadora de Sistemas Numéricos» y subtítulo «Convierte entre binario, octal,
 *     decimal y hexadecimal con explicación paso a paso».
 *   · metadata: «Muestra el proceso paso a paso. Incluye operaciones aritméticas y lógicas
 *     en binario»; el jsonLd promete además «explicación paso a paso con DIVISIONES
 *     SUCESIVAS», «ancho de bits: 4, 8, 16 y 32 bits» y «complemento a 2».
 *   · El faqJsonLd llega a detallar el caso: «25 en decimal: 25÷2=12 resto 1, 12÷2=6 resto 0…
 *     La calculadora muestra este proceso paso a paso para cualquier número».
 *   · NO promete fracciones (101,101) ni negativos: el validador solo admite dígitos de la
 *     base, así que «-5» y «101,101» se rechazan por diseño y eso no es un hallazgo.
 *
 * LOS 3 CASOS, RESUELTOS A MANO ANTES DE ABRIR LA APP
 *
 *   CASO 1 (normal) — 2A en hexadecimal
 *       2A₁₆ = 2×16 + 10 = 42
 *       decimal 42 · binario 101010 (32+8+2), que la app agrupa de 4 en 4 → «0010 1010»
 *       octal 52 (5×8 + 2) · hex 2A
 *
 *   CASO 2 (límite) — dos límites distintos, porque la app tiene dos motores
 *       2.a PRECISIÓN. 53 unos en binario = 2⁵³ − 1 = 9.007.199.254.740.991, que es
 *           exactamente Number.MAX_SAFE_INTEGER: el último entero que un `number` de
 *           JavaScript representa sin perder un bit.
 *             hex   1FFFFFFFFFFFFF
 *             octal 377777777777777777   (2⁵³ = 4×8¹⁷ → «4» y 17 ceros; menos 1 → «3» y 17 sietes)
 *           Y un dígito más (2⁵³, «1» y 53 ceros) debe rechazarse: ahí ya no hay precisión.
 *       2.b ANCHO MÁXIMO. Suma 42 + 15 = 57 con el ancho de 32 bits, el mayor que ofrece.
 *           57 cabe de sobra en 32 bits (máximo 4.294.967.295), no hay desbordamiento:
 *             decimal 57 · hex 39 (3×16 + 9) · binario 0000 0000 0000 0000 0000 0000 0011 1001
 *           → HALLAZGO 1: hoy devuelve 0. Ver más abajo.
 *
 *   CASO 3 (rechazo) — «G» en hexadecimal
 *       G no es dígito de base 16 (0-9, A-F): hay que rechazarlo y NO emitir cifra.
 *       Variante: «2» en binario.
 *
 * HALLAZGOS ABIERTOS, escritos como TESTIGO (documentan lo que la app hace HOY; si se
 * reparan, estos bloques fallarán y habrá que invertirlos). NO se corrigen desde el test:
 *
 *   1. (crítico) El ancho de 32 BITS devuelve 0 en TODAS las operaciones. La máscara se
 *      calcula con `(1 << bits) - 1` y en JavaScript el contador de desplazamiento va módulo
 *      32, así que `1 << 32` vale 1 y la máscara sale 0: los dos operandos se enmascaran a
 *      cero antes de operar. 42 + 15 → 0; 240 OR 15 → 0; NOT 0 → 0 (debería ser 4.294.967.295).
 *      La explicación delata el estropicio, porque imprime «0 + 0 = 0 (módulo 4294967296)».
 *      Con 4, 8 y 16 bits todo cuadra.
 *
 *   2. (alto) Un desplazamiento igual al ancho del registro NO vacía el registro. El código
 *      hace `bLimited % bits`, de modo que con 8 bits un «<< 8» se convierte en «<< 0» y
 *      devuelve el operando intacto. En un registro de 8 bits, 1 << 8 es 0. Y la explicación
 *      escribe «00000001 << 8 = 00000001», que es justo lo contrario de lo que enseña el
 *      propio bloque educativo de la página («los bits extras se descartan»).
 *
 *   3. (medio) El paso a paso NO existe para la base de entrada DECIMAL, que es la que viene
 *      por defecto. `generateSteps()` se invoca siempre con base de destino 10, así que las
 *      divisiones sucesivas son código muerto: con 25 en decimal, «Ver proceso paso a paso»
 *      despliega UNA línea, «Valor original en decimal: 25». Es el caso exacto que el
 *      faqJsonLd promete resuelto con sus cinco divisiones.
 *
 *   4. (medio) «Número demasiado grande» NO retira el resultado anterior: el `return` del
 *      efecto deja `result` como estaba. Con 42 en pantalla y luego 99999999999999999999,
 *      el error convive con las cuatro tarjetas del 42, que ya no corresponden a lo escrito.
 *
 *   5. (medio) Un operando inválido en el panel de operaciones falla EN SILENCIO: la tarjeta
 *      de resultado desaparece y no se escribe ningún mensaje. El panel de conversión, en la
 *      misma página, sí avisa.
 *
 *   6. (bajo, accesibilidad) Los tres <input> no tienen id, ni aria-label, ni <label> asociada
 *      (los <label> no llevan htmlFor): `input.labels` está vacío en los tres. Y el mensaje de
 *      error no lleva role="alert" ni vive bajo ningún aria-live, así que el rechazo no se
 *      anuncia.
 */

const RUTA = '/calculadora-sistemas-numericos/';

const CONV = '[class*="conversionSection"]';
const OPS = '[class*="operationsSection"]';

const entradaConversion = (page: Page) => page.locator(`${CONV} input[type="text"]`).first();
const operandoA = (page: Page) => page.locator(`${OPS} input[type="text"]`).nth(0);
const operandoB = (page: Page) => page.locator(`${OPS} input[type="text"]`).nth(1);

/** Botón de una sección cuyo texto completo es exactamente `texto` (BIN/OCT/DEC/HEX, «8 bits»…). */
const boton = (page: Page, seccion: string, texto: string): Locator =>
  page.locator(`${seccion} button`, { hasText: new RegExp(`^${texto}$`) }).first();

/** El valor de una de las cuatro tarjetas de conversión, localizada por su rótulo. */
const tarjeta = (page: Page, rotulo: string): Locator =>
  page
    .locator(`${CONV} [class*="resultCard"]`)
    .filter({ hasText: rotulo })
    .locator('[class*="resultValue"]');

const errorConversion = (page: Page) => page.locator(`${CONV} [class*="errorMsg"]`);

/** Fija la base de entrada y escribe el valor, esperando a que React lo recoja. */
async function convertir(page: Page, base: string, valor: string) {
  await boton(page, CONV, base).click();
  await entradaConversion(page).fill(valor);
  await esperarValorEnReact(page, entradaConversion(page), valor.toUpperCase());
}

/** Las operaciones se eligen por su `title`, que es el único rótulo inequívoco de cada botón. */
const TITULO_OPERACION = {
  suma: 'Suma aritmética',
  resta: 'Resta aritmética',
  and: 'AND bit a bit',
  or: 'OR bit a bit',
  xor: 'XOR bit a bit',
  not: 'Complemento a 1',
  shl: 'Desplazamiento izquierda',
  shr: 'Desplazamiento derecha',
} as const;

interface Operacion {
  base?: string;
  bits: string;
  op: keyof typeof TITULO_OPERACION;
  a: string;
  b?: string;
}

async function operar(page: Page, { base = 'DEC', bits, op, a, b }: Operacion) {
  await boton(page, OPS, base).click();
  await boton(page, OPS, bits).click();
  await page.locator(`${OPS} button[title="${TITULO_OPERACION[op]}"]`).click();

  await operandoA(page).fill(a);
  await esperarValorEnReact(page, operandoA(page), a.toUpperCase());
  if (b !== undefined) {
    await operandoB(page).fill(b);
    await esperarValorEnReact(page, operandoB(page), b.toUpperCase());
  }

  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
}

const tarjetaOperacion = (page: Page) => page.locator(`${OPS} [class*="opResultCard"]`);

/**
 * Una fila del resultado de la operación: «Binario:», «Decimal:» o «Hexadecimal:».
 * El rótulo va anclado al principio y como expresión regular a propósito: `hasText` con una
 * cadena busca subcadena SIN distinguir mayúsculas, así que «Decimal:» casaba también con
 * «Hexadecimal:» y el localizador resolvía a dos filas.
 */
const filaOperacion = (page: Page, rotulo: string): Locator =>
  tarjetaOperacion(page)
    .locator('[class*="opResultRow"]')
    .filter({ hasText: new RegExp(`^${rotulo}`) })
    .locator('code');

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Calculadora de Sistemas Numéricos',
  );
  // Antes del primer clic: un clic anterior a la hidratación también se pierde.
  await esperarHidratacion(page, [`${CONV} input[type="text"]`, `${OPS} input[type="text"]`]);
});

// ──────────────────────────────────────────────────────────────────────────────
// CASO 1 — normal
// ──────────────────────────────────────────────────────────────────────────────

test('CASO 1 — 2A en hexadecimal son 42 en decimal, 101010 en binario y 52 en octal', async ({
  page,
}) => {
  await convertir(page, 'HEX', '2A');

  await expect(errorConversion(page)).toHaveCount(0);
  // A mano: 2A₁₆ = 2×16 + 10 = 42. 42 = 32+8+2 = 101010₂, que la app agrupa de 4 en 4.
  await expect(tarjeta(page, 'Decimal (Base 10)')).toHaveText('42');
  await expect(tarjeta(page, 'Binario (Base 2)')).toHaveText('0010 1010');
  await expect(tarjeta(page, 'Octal (Base 8)')).toHaveText('52'); // 5×8 + 2
  await expect(tarjeta(page, 'Hexadecimal (Base 16)')).toHaveText('2A');
});

test('CASO 1 (ida y vuelta) — 25 en decimal vuelve como 11001, 31 y 19', async ({ page }) => {
  // El ejemplo que el propio faqJsonLd de la app da por resuelto.
  await convertir(page, 'DEC', '25');
  await expect(tarjeta(page, 'Binario (Base 2)')).toHaveText('0001 1001'); // 16+8+1
  await expect(tarjeta(page, 'Octal (Base 8)')).toHaveText('31'); // 3×8 + 1
  await expect(tarjeta(page, 'Hexadecimal (Base 16)')).toHaveText('19'); // 1×16 + 9
});

// ──────────────────────────────────────────────────────────────────────────────
// CASO 2 — límite
// ──────────────────────────────────────────────────────────────────────────────

test('CASO 2.a — 53 unos en binario dan el mayor entero exacto, sin perder un solo bit', async ({
  page,
}) => {
  await convertir(page, 'BIN', '1'.repeat(53));

  await expect(errorConversion(page)).toHaveCount(0);
  // A mano: 2⁵³ − 1 = 9.007.199.254.740.991 = Number.MAX_SAFE_INTEGER.
  await expect(tarjeta(page, 'Decimal (Base 10)')).toHaveText('9007199254740991');
  await expect(tarjeta(page, 'Hexadecimal (Base 16)')).toHaveText('1FFFFFFFFFFFFF');
  // 2⁵³ = 4×8¹⁷ → en octal «4» y 17 ceros; menos 1 → «3» y 17 sietes.
  await expect(tarjeta(page, 'Octal (Base 8)')).toHaveText('377777777777777777');
});

test('CASO 2.a (rechazo por precisión) — un bit más, 2⁵³, se rechaza en vez de redondearse', async ({
  page,
}) => {
  await convertir(page, 'BIN', '1' + '0'.repeat(53));
  // 2⁵³ = 9.007.199.254.740.992 ya no es representable sin ambigüedad: se rechaza.
  await expect(errorConversion(page)).toHaveText('Número demasiado grande');
});

test('HALLAZGO 1 (TESTIGO, crítico) — con 32 bits toda operación devuelve 0', async ({ page }) => {
  await operar(page, { bits: '32 bits', op: 'suma', a: '42', b: '15' });

  // A MANO: 42 + 15 = 57, que cabe de sobra en 32 bits (máximo 4.294.967.295).
  //   decimal 57 · hex 39 · binario 0000 0000 0000 0000 0000 0000 0011 1001
  // HOY la app devuelve 0, porque `(1 << 32) - 1` vale 0 en JavaScript y esa máscara
  // pone a cero los dos operandos antes de sumarlos.
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('0'); // debería ser 57
  await expect(filaOperacion(page, 'Hexadecimal:')).toHaveText('0'); // debería ser 39
  await expect(tarjetaOperacion(page).locator('[class*="opExplanation"]')).toHaveText(
    '0 + 0 = 0 (módulo 4294967296)', // los operandos ya llegan enmascarados a cero
  );
});

test('HALLAZGO 1 (TESTIGO, crítico) — con 32 bits ni siquiera NOT 0 da 4.294.967.295', async ({
  page,
}) => {
  await operar(page, { bits: '32 bits', op: 'not', a: '0' });
  // A mano: NOT 0 en 32 bits = 4.294.967.295 (0xFFFFFFFF). Hoy: 0.
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('0');
});

test('con 8 y 16 bits las mismas operaciones sí cuadran: 42 + 15 = 57', async ({ page }) => {
  await operar(page, { bits: '8 bits', op: 'suma', a: '42', b: '15' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('57');
  await expect(filaOperacion(page, 'Binario:')).toHaveText('0011 1001'); // 32+16+8+1
  await expect(filaOperacion(page, 'Hexadecimal:')).toHaveText('39'); // 3×16 + 9

  await operar(page, { bits: '16 bits', op: 'suma', a: '42', b: '15' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('57');
  await expect(filaOperacion(page, 'Binario:')).toHaveText('0000 0000 0011 1001');
});

test('el desbordamiento de 8 bits y el complemento a 2 sí son correctos', async ({ page }) => {
  // 200 + 100 = 300; 300 − 256 = 44. En un registro de 8 bits se pierde el acarreo.
  await operar(page, { bits: '8 bits', op: 'suma', a: '200', b: '100' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('44');

  // 3 − 10 = −7, que en complemento a 2 de 8 bits es 256 − 7 = 249 = 0xF9 = 11111001.
  await operar(page, { bits: '8 bits', op: 'resta', a: '3', b: '10' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('249');
  await expect(filaOperacion(page, 'Binario:')).toHaveText('1111 1001');

  // 11001100 AND 10101010 = 10001000 → 136. (204 = 0xCC, 170 = 0xAA, 136 = 0x88)
  await operar(page, { bits: '8 bits', op: 'and', a: '204', b: '170' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('136');
  await expect(filaOperacion(page, 'Hexadecimal:')).toHaveText('88');
});

test('HALLAZGO 2 (TESTIGO, alto) — desplazar 8 posiciones en un registro de 8 bits no lo vacía', async ({
  page,
}) => {
  // Control: 1 << 3 en 8 bits = 00001000 = 8. Esto sí está bien.
  await operar(page, { bits: '8 bits', op: 'shl', a: '1', b: '3' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('8');

  // A MANO: 1 << 8 en un registro de 8 bits = 0 (el único bit se sale del registro).
  // HOY devuelve 1, porque el código desplaza `b % bits` = 8 % 8 = 0 posiciones.
  await operar(page, { bits: '8 bits', op: 'shl', a: '1', b: '8' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('1'); // debería ser 0
  await expect(tarjetaOperacion(page).locator('[class*="opExplanation"]')).toHaveText(
    '00000001 << 8 = 00000001', // y lo escribe como si desplazar 8 no hiciera nada
  );

  // Mismo defecto a la derecha: 128 >> 8 en 8 bits = 0. Hoy: 128.
  await operar(page, { bits: '8 bits', op: 'shr', a: '128', b: '8' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('128'); // debería ser 0
});

// ──────────────────────────────────────────────────────────────────────────────
// CASO 3 — rechazo
// ──────────────────────────────────────────────────────────────────────────────

test('CASO 3 — «G» no es un dígito hexadecimal: se rechaza y no se emite ninguna cifra', async ({
  page,
}) => {
  await convertir(page, 'HEX', 'G');
  await expect(errorConversion(page)).toHaveText('Valor inválido para base 16');
  await expect(page.locator(`${CONV} [class*="resultCard"]`)).toHaveCount(0);
});

test('CASO 3 (variante) — «2» no es un dígito binario, ni «8» uno octal', async ({ page }) => {
  await convertir(page, 'BIN', '2');
  await expect(errorConversion(page)).toHaveText('Valor inválido para base 2');
  await expect(page.locator(`${CONV} [class*="resultCard"]`)).toHaveCount(0);

  await convertir(page, 'OCT', '8');
  await expect(errorConversion(page)).toHaveText('Valor inválido para base 8');
  await expect(page.locator(`${CONV} [class*="resultCard"]`)).toHaveCount(0);
});

// ──────────────────────────────────────────────────────────────────────────────
// Los demás hallazgos abiertos, como TESTIGO
// ──────────────────────────────────────────────────────────────────────────────

test('HALLAZGO 3 (TESTIGO, medio) — en decimal el «paso a paso» es una sola línea', async ({
  page,
}) => {
  await convertir(page, 'DEC', '25');
  await page.locator(`${CONV} [class*="stepsToggle"]`).click();

  const pasos = page.locator(`${CONV} [class*="stepsContent"] [class*="step"]`);
  // El faqJsonLd promete las cinco divisiones de 25 (25÷2=12 r1, 12÷2=6 r0, …).
  // HOY solo sale el enunciado, porque generateSteps() se llama siempre con destino 10.
  await expect(pasos).toHaveCount(1);
  await expect(pasos.first()).toHaveText('Valor original en decimal: 25');

  // Y en binario sí hay pasos, pero solo los de la vuelta a decimal: ocho líneas,
  // ninguna de ellas una división sucesiva.
  await convertir(page, 'BIN', '11001');
  await expect(pasos).toHaveCount(8);
  await expect(pasos.nth(7)).toHaveText('Suma total = 25');
  await expect(page.locator(`${CONV} [class*="stepsContent"]`)).not.toContainText('÷');
});

test('HALLAZGO 4 (TESTIGO, medio) — «demasiado grande» convive con el resultado anterior', async ({
  page,
}) => {
  await convertir(page, 'DEC', '42');
  await expect(tarjeta(page, 'Decimal (Base 10)')).toHaveText('42');

  await convertir(page, 'DEC', '99999999999999999999'); // 10²⁰, muy por encima de 2⁵³
  await expect(errorConversion(page)).toHaveText('Número demasiado grande');

  // Deberían haber desaparecido: el efecto hace `return` sin limpiar el resultado, así que
  // el usuario ve un error y, debajo, las cuatro conversiones del 42 que ya no ha escrito.
  await expect(page.locator(`${CONV} [class*="resultCard"]`)).toHaveCount(4);
  await expect(tarjeta(page, 'Decimal (Base 10)')).toHaveText('42');
});

test('HALLAZGO 5 (TESTIGO, medio) — un operando inválido no dice nada', async ({ page }) => {
  await operar(page, { base: 'BIN', bits: '8 bits', op: 'suma', a: '1010', b: '1' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('11'); // 1010₂ + 1₂ = 10 + 1

  // «2» no es binario: la tarjeta desaparece y no se escribe ningún mensaje, al contrario
  // que en el panel de conversión de la misma página.
  await operar(page, { base: 'BIN', bits: '8 bits', op: 'suma', a: '1010', b: '2' });
  await expect(tarjetaOperacion(page)).toHaveCount(0);
  await expect(page.locator(`${OPS} [class*="errorMsg"]`)).toHaveCount(0);
});

test('HALLAZGO 6 (TESTIGO, bajo) — los tres campos no tienen etiqueta asociada', async ({
  page,
}) => {
  const sinEtiqueta = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLInputElement>('input[type="text"]')].map((i) => ({
      marcador: i.placeholder,
      etiquetas: i.labels ? i.labels.length : 0,
      aria: i.getAttribute('aria-label'),
      id: i.id,
    })),
  );
  expect(sinEtiqueta).toHaveLength(3);
  for (const campo of sinEtiqueta) {
    expect(campo.etiquetas).toBe(0); // los <label> de la app no llevan htmlFor
    expect(campo.aria).toBeNull();
    expect(campo.id).toBe('');
  }

  // Y el rechazo tampoco se anuncia: el mensaje no es un role="alert" ni vive bajo aria-live.
  await convertir(page, 'HEX', 'G');
  const anuncio = await errorConversion(page).evaluate((el) => ({
    role: el.getAttribute('role'),
    bajoAriaLive: Boolean(el.closest('[aria-live]')),
  }));
  expect(anuncio.role).toBeNull();
  expect(anuncio.bajoAriaLive).toBe(false);
});
