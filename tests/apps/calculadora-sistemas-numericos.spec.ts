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
 * LOS SEIS HALLAZGOS, REPARADOS EL 20/09/2026. Los bloques de abajo eran TESTIGO —fijaban
 * lo que la app hacía mal— y se han invertido: ahora exigen el comportamiento correcto. El
 * cálculo vive desde entonces en `app/calculadora-sistemas-numericos/motor.ts`, con sus
 * casos unitarios en `tests/sistemas-numericos-motor.spec.ts`.
 *
 *   1. (crítico) El ancho de 32 BITS devolvía 0 en TODAS las operaciones: la máscara
 *      `(1 << 32) - 1` vale 0 en JavaScript, porque el contador de desplazamiento va módulo
 *      32, y enmascaraba los dos operandos a cero antes de operar. El motor usa BigInt.
 *
 *   2. (alto) Un desplazamiento igual al ancho del registro no lo vaciaba: el contador se
 *      reducía con `b % bits`, así que «<< 8» sobre 8 bits se convertía en «<< 0».
 *
 *   3. (medio) El paso a paso no existía para la base DECIMAL, la de por defecto:
 *      `generateSteps()` se llamaba siempre con destino 10 y las divisiones sucesivas eran
 *      código muerto, justo el proceso que el faqJsonLd promete resuelto para el 25.
 *
 *   4. (medio) «Número demasiado grande» no retiraba el resultado anterior.
 *
 *   5. (medio) Un operando inválido en el panel de operaciones fallaba en silencio.
 *
 *   6. (bajo, accesibilidad) Los tres <input> no tenían id, ni aria-label, ni <label>
 *      asociada, y el mensaje de error no se anunciaba.
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

test('HALLAZGO 1 (crítico, reparado) — con 32 bits la suma da 57, no 0', async ({ page }) => {
  await operar(page, { bits: '32 bits', op: 'suma', a: '42', b: '15' });

  // A MANO: 42 + 15 = 57, que cabe de sobra en 32 bits (máximo 4.294.967.295).
  //   decimal 57 · hex 39 (3×16 + 9) · binario 0000 0000 0000 0000 0000 0000 0011 1001
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('57');
  await expect(filaOperacion(page, 'Hexadecimal:')).toHaveText('39');
  await expect(filaOperacion(page, 'Binario:')).toHaveText('0000 0000 0000 0000 0000 0000 0011 1001');
  await expect(tarjetaOperacion(page).locator('[class*="opExplanation"]')).toHaveText(
    '42 + 15 = 57', // y la explicación ya no habla de operandos enmascarados a cero
  );
});

test('HALLAZGO 1 (crítico, reparado) — con 32 bits NOT 0 da 4.294.967.295', async ({ page }) => {
  // A mano: NOT 0 en 32 bits = 2³² − 1 = 4.294.967.295 (0xFFFFFFFF).
  await operar(page, { bits: '32 bits', op: 'not', a: '0' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('4294967295');
  await expect(filaOperacion(page, 'Hexadecimal:')).toHaveText('FFFFFFFF');
});

test('HALLAZGO 1 (crítico, reparado) — el bit 31 no se vuelve negativo', async ({ page }) => {
  // 1 << 31 = 2.147.483.648. Con enteros de 32 bits CON signo saldría −2.147.483.648:
  // es la trampa que hacía falta esquivar, y por eso el motor opera con BigInt.
  await operar(page, { bits: '32 bits', op: 'shl', a: '1', b: '31' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('2147483648');

  // 240 OR 15 = 255 (1111 0000 | 0000 1111), también con el ancho grande.
  await operar(page, { bits: '32 bits', op: 'or', a: '240', b: '15' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('255');
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

test('HALLAZGO 2 (alto, reparado) — desplazar 8 posiciones en un registro de 8 bits lo vacía', async ({
  page,
}) => {
  // Control: 1 << 3 en 8 bits = 00001000 = 8.
  await operar(page, { bits: '8 bits', op: 'shl', a: '1', b: '3' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('8');

  // A MANO: 1 << 8 en un registro de 8 bits = 0 (el único bit se sale del registro).
  await operar(page, { bits: '8 bits', op: 'shl', a: '1', b: '8' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('0');
  await expect(tarjetaOperacion(page).locator('[class*="opExplanation"]')).toContainText(
    '00000001 << 8 = 00000000',
  );

  // Simétrico a la derecha: 128 >> 8 en 8 bits = 0.
  await operar(page, { bits: '8 bits', op: 'shr', a: '128', b: '8' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('0');
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

test('HALLAZGO 3 (medio, reparado) — en decimal salen las cinco divisiones sucesivas', async ({
  page,
}) => {
  await convertir(page, 'DEC', '25');
  await page.locator(`${CONV} [class*="stepsToggle"]`).click();

  const contenido = page.locator(`${CONV} [class*="stepsContent"]`);
  // Las cinco divisiones que el propio faqJsonLd da por resueltas para el 25.
  await expect(contenido).toContainText('25 ÷ 2 = 12, resto = 1');
  await expect(contenido).toContainText('12 ÷ 2 = 6, resto = 0');
  await expect(contenido).toContainText('6 ÷ 2 = 3, resto = 0');
  await expect(contenido).toContainText('3 ÷ 2 = 1, resto = 1');
  await expect(contenido).toContainText('1 ÷ 2 = 0, resto = 1');
  await expect(contenido).toContainText('Leyendo los restos de abajo a arriba: 11001');

  // Y octal y hexadecimal, agrupando los bits: 011 001 → 31₈ · 0001 1001 → 19₁₆.
  await expect(contenido).toContainText('31 en octal');
  await expect(contenido).toContainText('19 en hexadecimal');
});

test('HALLAZGO 3 (medio, reparado) — desde binario se explica el valor posicional', async ({
  page,
}) => {
  await convertir(page, 'BIN', '11001');
  await page.locator(`${CONV} [class*="stepsToggle"]`).click();

  const contenido = page.locator(`${CONV} [class*="stepsContent"]`);
  await expect(contenido).toContainText('1 × 2^0 = 1 × 1 = 1');
  await expect(contenido).toContainText('Suma total = 25');
  // Ya está en binario: no tiene sentido dividirlo sucesivamente entre 2.
  await expect(contenido).not.toContainText('÷ 2');
});

test('HALLAZGO 4 (medio, reparado) — «demasiado grande» retira el resultado anterior', async ({
  page,
}) => {
  await convertir(page, 'DEC', '42');
  await expect(tarjeta(page, 'Decimal (Base 10)')).toHaveText('42');

  await convertir(page, 'DEC', '99999999999999999999'); // 10²⁰, muy por encima de 2⁵³
  await expect(errorConversion(page)).toHaveText('Número demasiado grande');

  // No puede quedar en pantalla la conversión de un valor que ya no está escrito.
  await expect(page.locator(`${CONV} [class*="resultCard"]`)).toHaveCount(0);
});

test('HALLAZGO 5 (medio, reparado) — un operando inválido se rechaza con mensaje', async ({
  page,
}) => {
  await operar(page, { base: 'BIN', bits: '8 bits', op: 'suma', a: '1010', b: '1' });
  await expect(filaOperacion(page, 'Decimal:')).toHaveText('11'); // 1010₂ + 1₂ = 10 + 1

  // «2» no es binario: se dice por qué, igual que hace el panel de conversión de al lado.
  await operar(page, { base: 'BIN', bits: '8 bits', op: 'suma', a: '1010', b: '2' });
  await expect(tarjetaOperacion(page)).toHaveCount(0);
  const aviso = page.locator(`${OPS} [role="alert"]`);
  await expect(aviso).toHaveCount(1);
  await expect(aviso).toContainText('operando B');
});

test('HALLAZGO 6 (bajo, reparado) — los tres campos tienen etiqueta asociada', async ({
  page,
}) => {
  const campos = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLInputElement>('input[type="text"]')].map((i) => ({
      marcador: i.placeholder,
      etiquetas: i.labels ? i.labels.length : 0,
      id: i.id,
    })),
  );
  expect(campos).toHaveLength(3);
  for (const campo of campos) {
    expect(campo.etiquetas).toBeGreaterThan(0);
    expect(campo.id).not.toBe('');
  }

  // Y el rechazo se anuncia: el mensaje es un role="alert".
  await convertir(page, 'HEX', 'G');
  await expect(errorConversion(page)).toHaveAttribute('role', 'alert');
});

test('HALLAZGO 6 (bajo, reparado) — los botones de copiar tienen nombre accesible', async ({
  page,
}) => {
  await convertir(page, 'DEC', '42');
  // Eran cuatro botones cuyo único contenido era el emoji 📋, con title pero sin aria-label.
  for (const base of ['binario', 'octal', 'decimal', 'hexadecimal']) {
    await expect(page.getByRole('button', { name: `Copiar el valor en ${base}` })).toHaveCount(1);
  }
});
