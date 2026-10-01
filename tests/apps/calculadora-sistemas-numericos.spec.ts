import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  comprobarRespuesta,
  generarEjercicioAleatorio,
} from '../../app/calculadora-sistemas-numericos/casos';
import { desdeDecimal, operar as operarMotor } from '../../app/calculadora-sistemas-numericos/motor';

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
// Los demás hallazgos del 20/09/2026: eran TESTIGO y se REPARARON el mismo día; hoy exigen
// el comportamiento correcto.
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
  // Los tres de la calculadora: la casilla de «Casos para clase» (28/09/2026) va aparte y tiene
  // su propia etiqueta; acotado como en simulador-fluidos-bernoulli, sin relajar el recuento.
  const campos = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLInputElement>('input[type="text"]:not(#casos-respuesta)')].map((i) => ({
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * calculadora-sistemas-numericos · casos para clase (28/09/2026)
 *
 * Doce problemas de cambio de base y aritmética binaria. Variante propia del tipo A: la
 * respuesta es un NUMERAL en una base pedida (binario, octal, decimal o hexadecimal), así que
 * no hay tolerancia. `comprobarRespuesta` normaliza lo que teclea el alumno (espacios y guiones
 * bajos del binario agrupado, prefijos 0x/0b/0o, subíndice de la base, minúsculas), lo lee con
 * `esValidoParaBase` y `aDecimal` del motor y compara el NÚMERO: los ceros a la izquierda y
 * «d7» valen; el resultado escrito en otra base, no. Los casos calculan con el `motor.ts` que ya
 * existía, que NO se tocó.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano, sin mirar la app):
 *   1 · 45 = 32 + 8 + 4 + 1                                          → 101101₂
 *   2 · 10110110₂ = 128 + 32 + 16 + 4 + 2                            = 182
 *   3 · 1101 0111₂ → D 7                                             → D7₁₆ (215)
 *   4 · 101 110₂ → 5 6                                               → 56₈ (46)
 *   5 · B4₁₆ = 11·16 + 4                                             = 180
 *   6 · 2F₁₆ → 0010 1111                                             → 101111₂ (47)
 *   7 · 01011011₂ + 00110110₂ = 91 + 54 = 145                        → 10010001₂
 *   8 · #FF8000: el par verde es 80₁₆ = 8·16                         = 128
 *   9 · 200 AND 240 = 11001000 AND 11110000 = 11000000               = 192
 *  10 · rwx r-x --- = 4+2+1 · 4+1 · 0                                → 750₈
 *  11 · K = A + 10 = 65 + 10 = 75 = 4·16 + 11                        → 4B₁₆
 *  12 · 53 << 1 = 106 (< 256, no se pierde ningún bit en 8 bits)     = 106
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_CASOS: Readonly<Record<number, { canonica: string; valor: number }>> = {
  1: { canonica: '101101', valor: 45 },
  2: { canonica: '182', valor: 182 },
  3: { canonica: 'D7', valor: 215 },
  4: { canonica: '56', valor: 46 },
  5: { canonica: '180', valor: 180 },
  6: { canonica: '101111', valor: 47 },
  7: { canonica: '10010001', valor: 145 },
  8: { canonica: '128', valor: 128 },
  9: { canonica: '192', valor: 192 },
  10: { canonica: '750', valor: 488 },
  11: { canonica: '4B', valor: 75 },
  12: { canonica: '106', valor: 106 },
};

const casoN = (id: number) => CASOS.find((c) => c.id === id)!;

test.describe('calculadora-sistemas-numericos · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(r.valor, `caso ${caso.id}`).toBe(caso.respuesta);
      expect(caso.respuestaCanonica, `caso ${caso.id}`).toBe(desdeDecimal(caso.respuesta, caso.baseRespuesta));
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isSafeInteger(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      // La solución enseña la cifra de la casilla, en la base pedida.
      expect(caso.pasos.join('\n'), `caso ${caso.id}`).toContain(caso.respuestaTexto);
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain(caso.respuestaCanonica);
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
    // Y se pide en las cuatro bases, no solo en decimal.
    expect(new Set(CASOS.map((c) => c.baseRespuesta))).toEqual(new Set([2, 8, 10, 16]));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|argentinos|chilenos|uruguayos)|Bachillerato|selectividad)\b/i;
    // La sigla va aparte y con mayúsculas: con /i, el pronombre «eso» la disparaba en falso.
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · cada enunciado dice en qué base se responde', async () => {
    const NOMBRE: Record<number, RegExp> = { 2: /binari/i, 8: /octal/i, 10: /decimal/i, 16: /hexadecimal/i };
    for (const caso of CASOS) {
      expect(`${caso.enunciado} ${caso.etiquetaRespuesta}`, `caso ${caso.id}`).toMatch(NOMBRE[caso.baseRespuesta]);
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.baseRespuesta)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(resolverCaso(m.datos).valor).toBe(m.respuesta);
      expect(comprobarRespuesta(m.respuestaCanonica, m).correcto, `semilla ${m.semilla}`).toBe(true);
    }
  });

  test('7 · la corrección acepta las grafías legítimas y rechaza el resto', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuestaCanonica, `caso ${caso.id}`).toBe(A_MANO_CASOS[caso.id].canonica);
      expect(caso.respuesta, `caso ${caso.id}`).toBe(A_MANO_CASOS[caso.id].valor);
      expect(comprobarRespuesta(caso.respuestaCanonica, caso).correcto, `caso ${caso.id}`).toBe(true);
    }

    // (b) El motor que se importa sigue siendo el del acta.
    expect(desdeDecimal(45, 2)).toBe('101101');
    expect(desdeDecimal(215, 16)).toBe('D7');
    expect(operarMotor(200, 240, 'and', 8)).toMatchObject({ resultado: 192 });

    // (c) Grafías legítimas del mismo número: ceros a la izquierda, agrupado, prefijo,
    //     subíndice y minúsculas.
    for (const t of ['101101', '00101101', '0010 1101', '0b101101', '101101₂', '101101 (2)']) {
      expect(comprobarRespuesta(t, casoN(1)).correcto, t).toBe(true);
    }
    for (const t of ['d7', '0xD7', '#D7', 'D7₁₆']) {
      expect(comprobarRespuesta(t, casoN(3)).correcto, t).toBe(true);
    }
    expect(comprobarRespuesta('0o56', casoN(4)).correcto).toBe(true);

    // (d) Lo que NO vale: el resultado escrito en otra base, dígitos de otra base, un prefijo
    //     que contradice la base pedida y el error típico de los permisos (755 en vez de 750).
    expect(comprobarRespuesta('215', casoN(3)).correcto).toBe(false);
    expect(comprobarRespuesta('145', casoN(7)).correcto).toBe(false);
    expect(comprobarRespuesta('102101', casoN(1)).correcto).toBe(false);
    expect(comprobarRespuesta('0x2D', casoN(1)).correcto).toBe(false);
    expect(comprobarRespuesta('755', casoN(10)).correcto).toBe(false);
  });

  test('8 · corregir no lanza nunca y nunca dice «NaN»', async () => {
    for (const t of ['', '   ', '-5', '1,5', 'hola', '1'.repeat(80)]) {
      const v = comprobarRespuesta(t, casoN(1));
      expect(v.correcto, JSON.stringify(t)).toBe(false);
      expect(v.motivo, JSON.stringify(t)).not.toMatch(/NaN|undefined/);
      expect(v.motivo.trim(), JSON.stringify(t)).not.toBe('');
    }
  });
});

test.describe('calculadora-sistemas-numericos · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('el caso 3 acepta el hexadecimal en minúsculas', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 3:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('d7');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');
  });

  test('responder en decimal el caso 7 se rechaza y la solución enseña el binario', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 7:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('145');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).not.toContainText('¡Correcto!');
    const solucion = seccion(page).getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(seccion(page).locator('#casos-solucion')).toContainText('10010001');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN, 01/10/2026 — los 12 casos de aula (733055dc) y la calculadora tras b7733c6d
 *
 * LOS 12 CASOS, RESUELTOS A MANO ANTES DE ABRIR LA APP (coinciden con A_MANO_CASOS, de arriba):
 *   1 · 45 ÷ 2 → restos 1,0,1,1,0,1 leídos de abajo arriba                       → 101101₂
 *   2 · 10110110₂ = 128 + 32 + 16 + 4 + 2                                         = 182
 *   3 · 1101 | 0111 → D | 7                                                       → D7₁₆
 *   4 · 101 | 110 → 5 | 6                                                         → 56₈
 *   5 · B4₁₆ = 11·16 + 4                                                          = 180
 *   6 · 2 → 0010, F → 1111                                                        → 00101111₂
 *   7 · 01011011 + 00110110: acarreos en las columnas 2 a 7, 91 + 54 = 145        → 10010001₂
 *   8 · #FF8000 → verde 80₁₆ = 8·16                                               = 128
 *   9 · 11001000 AND 11110000 = 11000000                                          = 192
 *  10 · rwx r-x --- → 111 101 000 → 7 5 0                                         → 750₈
 *  11 · K = 65 + 10 = 75 = 4·16 + 11                                              → 4B₁₆
 *  12 · 00110101 << 1 = 01101010 (no sale ningún 1 del registro)                  = 106
 *
 * LA CORRECCIÓN ES EXACTA. En un cambio de base no cabe tolerancia: una tolerancia relativa del
 * 1 % (la forma vista en SOSPECHAS.md, 27-30/09) daría por bueno 751₈ (489) en el caso 10, cuya
 * respuesta vale 488. Se comprueba que la respuesta que difiere en UNA unidad se rechaza en los
 * doce, y en el navegador.
 *
 * LA CALCULADORA, RESUELTA A MANO:
 *   · 2026 = 1024+512+256+128+64+32+8+2 = 111 1110 1010₂ → octal 3752 (3·512+7·64+5·8+2) ·
 *     hexadecimal 7EA (7·256+14·16+10).
 *   · 0 → 0 en las cuatro bases (el binario se pinta relleno a un nibble: «0000»).
 *   · 2⁵³ + 1 = 9.007.199.254.740.993 no es representable en un `number`: parseInt lo redondea
 *     a 2⁵³ y la app debe RECHAZARLO, no convertir otro número.
 *   · «-5» y «10,5» se rechazan: la app no promete ni negativos ni fracciones.
 *
 * HALLAZGOS NUEVOS (todos bajos; los doce casos y su corrector están limpios):
 *   A · Un operando que no cabe en el ancho se recorta en silencio: 300 + 1 en 8 bits da 45 y la
 *       explicación dice «44 + 1 = 45», sin decir que 300 no cabe (300 mod 256 = 44).
 *   B · Los <h2> de los paneles llevan el emoji en el nombre accesible («📐 Conversión de Bases»).
 *   C · «Ver proceso paso a paso» es un desplegable con aria-pressed en vez de aria-expanded.
 *   D · Cuatro <label> sin control («Base de entrada:» ×2, «Ancho de bits:», «Operación:»): los dos
 *       juegos de botones BIN/OCT/DEC/HEX quedan sin nombre de grupo.
 *   E · «Practicar» lleva aria-pressed pero es una acción: pulsado otra vez sigue «presionado» y
 *       cambia de ejercicio.
 *   F · Bloque educativo: «En Python 2, 078 era tratado como decimal». La gramática oficial de
 *       Python 2.7 (Doc/reference/lexical_analysis.rst: decimalinteger ::= nonzerodigit digit* |
 *       "0"; octinteger ::= "0" octdigit+) no admite «078»: es un error de sintaxis.
 *   G · Bloque educativo: «Kilobyte = 1024 bytes = 2^10 (no 1000)». NIST, «Prefixes for binary
 *       multiples»: 1 kbit = 10³ bit = 1000 bit; 1024 es el prefijo binario kibi (IEC, 1998).
 *   H · Bloque educativo: «un sumador de 8 bits = 8 puertas lógicas en cascada». Cada columna
 *       del sumador da DOS salidas (suma y acarreo) y una puerta da una sola: son 8 sumadores
 *       completos en cascada, no 8 puertas.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** El numeral canónico de un valor en una base: sin ceros a la izquierda, en mayúsculas. */
const enBase = (valor: number, base: number) => valor.toString(base).toUpperCase();

test.describe('re-inspección 01/10/2026 · el corrector de los casos es exacto', () => {
  test('una respuesta que difiere en UNA unidad se rechaza en los doce casos', async () => {
    for (const caso of CASOS) {
      const valor = A_MANO_CASOS[caso.id].valor;
      for (const desvio of [valor - 1, valor + 1]) {
        const texto = enBase(desvio, caso.baseRespuesta);
        expect(comprobarRespuesta(texto, caso).correcto, `caso ${caso.id}: ${texto}`).toBe(false);
      }
    }
    // El caso de mayor valor: 750₈ = 488. Con un 1 % de tolerancia (±4,88) pasarían 747₈ a 754₈.
    expect(comprobarRespuesta('751', casoN(10)).correcto).toBe(false); // 489
    expect(comprobarRespuesta('747', casoN(10)).correcto).toBe(false); // 487
    expect(comprobarRespuesta('D8', casoN(3)).correcto).toBe(false); // 216 en vez de 215
  });

  test('grafías legítimas de más: hexadecimal partido, cero inicial, # y subíndice con prefijo', async () => {
    for (const t of ['D 7', '0d7', '#4b', '0x4B₁₆']) {
      const caso = t.toUpperCase().includes('4B') ? casoN(11) : casoN(3);
      expect(comprobarRespuesta(t, caso).correcto, t).toBe(true);
    }
    expect(comprobarRespuesta('0750', casoN(10)).correcto).toBe(true); // cero inicial al estilo C
    expect(comprobarRespuesta('182₁₀', casoN(2)).correcto).toBe(true);
    // Lo que NO vale: doble prefijo, separadores que no son espacio ni guion bajo, signo.
    for (const t of ['0b0b101101', '101.101', '101-101', '+101101', '101101b']) {
      expect(comprobarRespuesta(t, casoN(1)).correcto, t).toBe(false);
    }
    expect(comprobarRespuesta('182.0', casoN(2)).correcto).toBe(false);
    expect(comprobarRespuesta('D7h', casoN(3)).correcto).toBe(false);
  });

  test('el modo práctica: 300 ejercicios, cada respuesta recalculada APARTE desde su enunciado', async () => {
    const BASE: Record<string, number> = { binario: 2, octal: 8, decimal: 10, hexadecimal: 16 };
    for (let semilla = 1; semilla <= 300; semilla++) {
      const m = generarEjercicioAleatorio(semilla);
      const e = m.enunciado;
      let esperado: string;
      let conv: RegExpMatchArray | null;
      let suma: RegExpMatchArray | null;
      let and: RegExpMatchArray | null;
      let shl: RegExpMatchArray | null;
      if ((conv = e.match(/^Convierte ([0-9A-F]+)[₀-₉]+ \(en (\w+)\) a (\w+)\./))) {
        esperado = enBase(parseInt(conv[1], BASE[conv[2]]), BASE[conv[3]]);
      } else if ((suma = e.match(/^Suma en binario ([01]{8}) \+ ([01]{8}),/))) {
        const s = parseInt(suma[1], 2) + parseInt(suma[2], 2);
        expect(s, `semilla ${semilla}: la suma cabe en 8 bits`).toBeLessThan(256);
        esperado = enBase(s, 2);
      } else if ((and = e.match(/^Calcula ([01]{8}) AND ([01]{8}),/))) {
        esperado = enBase(parseInt(and[1], 2) & parseInt(and[2], 2), 2);
      } else if ((shl = e.match(/está el número (\d+)\. Desplaza/))) {
        esperado = enBase((Number(shl[1]) * 2) % 256, 10);
      } else {
        throw new Error(`semilla ${semilla}: enunciado sin forma conocida: ${e}`);
      }
      expect(m.respuestaCanonica, `semilla ${semilla}: ${e}`).toBe(esperado);
      expect(comprobarRespuesta(esperado, m).correcto, `semilla ${semilla}`).toBe(true);
      const unoMas = enBase(m.respuesta + 1, m.baseRespuesta);
      expect(comprobarRespuesta(unoMas, m).correcto, `semilla ${semilla}: ${unoMas}`).toBe(false);
    }
  });
});

test.describe('re-inspección 01/10/2026 · los doce casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');
  const casilla = (page: Page) => page.locator('#casos-respuesta');

  async function responder(page: Page, texto: string) {
    await casilla(page).fill(texto);
    await esperarValorEnReact(page, casilla(page), texto);
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
  }

  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('las doce respuestas resueltas a mano dan «¡Correcto!» y la de una unidad menos, no', async ({ page }) => {
    // Lo que teclearía el alumno: la respuesta de la cabecera de este bloque (el 6, con sus 8 bits).
    const TECLEADO: Record<number, [string, string]> = {
      1: ['101101', '101100'], 2: ['182', '181'], 3: ['D7', 'D6'], 4: ['56', '55'],
      5: ['180', '179'], 6: ['00101111', '00101110'], 7: ['10010001', '10010000'], 8: ['128', '127'],
      9: ['192', '191'], 10: ['750', '747'], 11: ['4B', '4A'], 12: ['106', '105'],
    };
    const alerta = seccion(page).getByRole('alert');
    for (let id = 1; id <= 12; id++) {
      await seccion(page).getByRole('button', { name: new RegExp(`^Caso ${id}:`) }).click();
      const [bien, mal] = TECLEADO[id];
      await responder(page, bien);
      await expect(alerta, `caso ${id}: ${bien}`).toHaveText(/¡Correcto!/);
      await responder(page, mal);
      await expect(alerta, `caso ${id}: ${mal}`).toContainText('No es correcto');
    }
  });

  test('el foco no se pierde al comprobar y el veredicto se anuncia en una región viva', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 1:/ }).click();
    await responder(page, '101101');
    const alerta = seccion(page).getByRole('alert');
    await expect(alerta).toHaveCount(1);
    await expect(alerta).toContainText('¡Correcto!');
    // El foco se queda en el botón pulsado, no cae al <body>.
    await expect(seccion(page).getByRole('button', { name: 'Comprobar' })).toBeFocused();

    // Con Enter en la casilla también se corrige, y el foco sigue en la casilla.
    await casilla(page).fill('101100');
    await esperarValorEnReact(page, casilla(page), '101100');
    await expect(alerta).toHaveCount(0); // al teclear se retira el veredicto anterior
    await casilla(page).press('Enter');
    await expect(alerta).toContainText('101100₂ vale 44 en decimal');
    await expect(casilla(page)).toBeFocused();

    // Al cambiar de caso no se queda pegado el veredicto ni la respuesta del anterior.
    await seccion(page).getByRole('button', { name: /^Caso 2:/ }).click();
    await expect(alerta).toHaveCount(0);
    await expect(casilla(page)).toHaveValue('');
  });

  test('HALLAZGO E · 2579 (bajo) — «Practicar» es una acción y no lleva aria-pressed', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2579: llevaba aria-pressed siendo una acción (cada
    // pulsación da otro ejercicio), así que se anunciaba «presionado» y no se soltaba nunca.
    // Se elige quitarlo y no convertirlo en conmutador: pulsarlo otra vez debe dar OTRO
    // ejercicio, no salir de la práctica. Que se está practicando lo dice el <h3>.
    const practicar = seccion(page).getByRole('button', { name: /Practicar/ });
    await expect(practicar).not.toHaveAttribute('aria-pressed', /.*/);
    await practicar.click();
    await expect(seccion(page).getByRole('heading', { level: 3 }).first()).toHaveText('Ejercicio de práctica');
    await expect(practicar).not.toHaveAttribute('aria-pressed', /.*/);
    await practicar.click();
    await expect(seccion(page).getByRole('heading', { level: 3 }).first()).toHaveText('Ejercicio de práctica');
    await expect(practicar).not.toHaveAttribute('aria-pressed', /.*/);
  });
});

test.describe('re-inspección 01/10/2026 · los casos en un móvil de 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('sin desbordamiento, botones de 44 px y la suma en columna sin partirse', async ({ page }) => {
    await esperarHidratacion(page, ['#casos-respuesta']);
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');

    const medidas = await page.evaluate(() => {
      const s = document.querySelector('section[aria-labelledby="casos-aula-titulo"]')!;
      return {
        scroll: document.documentElement.scrollWidth,
        ancho: document.documentElement.clientWidth,
        botones: [...s.querySelectorAll('[role="group"] button')].map((b) => {
          const r = b.getBoundingClientRect();
          return { w: r.width, h: r.height, right: r.right };
        }),
      };
    });
    expect(medidas.scroll).toBeLessThanOrEqual(medidas.ancho);
    expect(medidas.botones).toHaveLength(13); // 12 casos + Practicar
    for (const b of medidas.botones) {
      expect(b.w).toBeGreaterThanOrEqual(44);
      expect(b.h).toBeGreaterThanOrEqual(44);
      expect(b.right).toBeLessThanOrEqual(medidas.ancho);
    }

    await seccion.getByRole('button', { name: /^Caso 7:/ }).tap();
    await page.locator('#casos-respuesta').fill('1001 0001'); // agrupado, como lo escribiría a mano
    await esperarValorEnReact(page, '#casos-respuesta', '1001 0001');
    const comprobar = seccion.getByRole('button', { name: 'Comprobar' });
    await expect(comprobar).toBeInViewport();
    await comprobar.tap();
    await expect(seccion.getByRole('alert')).toContainText('¡Correcto!');

    await seccion.getByRole('button', { name: /Ver solución/ }).tap();
    const filas = await page.evaluate(() => {
      const sol = document.querySelector('#casos-solucion')!;
      const pasos = [...sol.querySelectorAll('[class*="casoPaso"]')];
      const columna = pasos.filter((p) => /^\s+(acarreos|\+|=)?\s+[01 ]+$/.test(p.textContent ?? ''));
      return {
        desborda: sol.scrollWidth > sol.clientWidth,
        filas: columna.map((p) => ({ t: p.textContent, h: p.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(p).lineHeight) })),
      };
    });
    expect(filas.desborda).toBe(false);
    expect(filas.filas).toHaveLength(4); // acarreos, A, + B, = suma
    for (const f of filas.filas) expect(f.h, f.t ?? '').toBeLessThan(f.lh * 1.5 + 4); // una sola línea
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

test.describe('re-inspección 01/10/2026 · la calculadora', () => {
  test('2026 en decimal: 111 1110 1010, 3752 y 7EA', async ({ page }) => {
    await convertir(page, 'DEC', '2026');
    await expect(errorConversion(page)).toHaveCount(0);
    await expect(tarjeta(page, 'Binario (Base 2)')).toHaveText('0111 1110 1010');
    await expect(tarjeta(page, 'Octal (Base 8)')).toHaveText('3752');
    await expect(tarjeta(page, 'Hexadecimal (Base 16)')).toHaveText('7EA');
  });

  test('0 sale 0 en las cuatro bases y su paso a paso lo dice', async ({ page }) => {
    await convertir(page, 'DEC', '0');
    await expect(tarjeta(page, 'Binario (Base 2)')).toHaveText('0000');
    await expect(tarjeta(page, 'Octal (Base 8)')).toHaveText('0');
    await expect(tarjeta(page, 'Decimal (Base 10)')).toHaveText('0');
    await expect(tarjeta(page, 'Hexadecimal (Base 16)')).toHaveText('0');
    await page.locator(`${CONV} [class*="stepsToggle"]`).click();
    await expect(page.locator(`${CONV} [class*="stepsContent"]`)).toContainText(
      'El cero se escribe igual en las cuatro bases: 0',
    );
  });

  test('2⁵³ + 1 en decimal se rechaza en vez de convertirse redondeado a 2⁵³', async ({ page }) => {
    await convertir(page, 'DEC', '9007199254740991'); // 2⁵³ − 1, el último exacto
    await expect(tarjeta(page, 'Hexadecimal (Base 16)')).toHaveText('1FFFFFFFFFFFFF');
    await convertir(page, 'DEC', '9007199254740993'); // 2⁵³ + 1
    await expect(errorConversion(page)).toHaveText('Número demasiado grande');
    await expect(page.locator(`${CONV} [class*="resultCard"]`)).toHaveCount(0);
  });

  test('negativos y fracciones se rechazan, que es lo que la app promete', async ({ page }) => {
    await convertir(page, 'DEC', '-5');
    await expect(errorConversion(page)).toHaveText('Valor inválido para base 10');
    await convertir(page, 'DEC', '10,5');
    await expect(errorConversion(page)).toHaveText('Valor inválido para base 10');
    await expect(page.locator(`${CONV} [class*="resultCard"]`)).toHaveCount(0);
  });

  test('lo que dicen los «Verlo en la calculadora» de los casos 7, 9 y 12 sale en el panel', async ({ page }) => {
    await operar(page, { base: 'BIN', bits: '8 bits', op: 'suma', a: '01011011', b: '00110110' });
    await expect(filaOperacion(page, 'Binario:')).toHaveText('1001 0001'); // 91 + 54 = 145
    await operar(page, { bits: '8 bits', op: 'and', a: '200', b: '240' });
    await expect(filaOperacion(page, 'Decimal:')).toHaveText('192');
    await operar(page, { bits: '8 bits', op: 'shl', a: '53', b: '1' });
    await expect(filaOperacion(page, 'Decimal:')).toHaveText('106');
  });

  test('HALLAZGO 939 (bajo, reparado) — la resta dice que 11111001 representa −7', async ({ page }) => {
    // 3 − 10 = −7; en 8 bits, 256 − 7 = 249 = 11111001.
    await operar(page, { bits: '8 bits', op: 'resta', a: '3', b: '10' });
    await expect(tarjetaOperacion(page).locator('[class*="opExplanation"]')).toContainText('−7');
    await expect(tarjetaOperacion(page).locator('[class*="opExplanation"]')).toContainText('11111001');
  });

  test('HALLAZGO A · 2575 (bajo) — un operando que no cabe en 8 bits se explica, no se recorta mudo', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2575: 300 + 1 en 8 bits daba 45 explicando «44 + 1 = 45»
    // sin nombrar el 300. Se elige EXPLICAR y no rechazar, por coherencia con la suma que
    // desborda, que la app ya resuelve con la semántica de registro (lo que no cabe se pierde).
    // A mano: 300 − 256 = 44; 44 + 1 = 45 = 0010 1101 = 0x2D.
    await operar(page, { bits: '8 bits', op: 'suma', a: '300', b: '1' });
    await expect(filaOperacion(page, 'Decimal:')).toHaveText('45');
    await expect(filaOperacion(page, 'Binario:')).toHaveText('0010 1101');
    const explicacion = tarjetaOperacion(page).locator('[class*="opExplanation"]');
    await expect(explicacion).toContainText('El operando A, 300, no cabe en 8 bits (máximo 255)');
    await expect(explicacion).toContainText('resto módulo 256, 44');
    await expect(explicacion).toContainText('44 + 1 = 45');
  });

  test('HALLAZGO B · 2576 (bajo) — los títulos de los paneles no leen el emoji', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2576: el emoji de cada título va en <span aria-hidden>.
    for (const nombre of ['Conversión de Bases', 'Operaciones Binarias', 'Tabla de Referencia Rápida']) {
      await expect(page.getByRole('heading', { level: 2, name: nombre, exact: true }), nombre).toHaveCount(1);
    }
    // Y los <h3> del bloque educativo, que nace colapsado.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    for (const nombre of [
      'Los 4 Sistemas Numéricos: Comparativa',
      'Casos de Uso Prácticos',
      'Preguntas Frecuentes',
      'Guía Paso a Paso: Convertir entre Bases',
      'Mejores Prácticas',
      'Conceptos Clave',
      'Binario (Base 2)',
      'Octal (Base 8)',
      'Decimal (Base 10)',
      'Hexadecimal (Base 16)',
    ]) {
      await expect(page.getByRole('heading', { level: 3, name: nombre, exact: true }), nombre).toHaveCount(1);
    }
  });

  test('HALLAZGO C · 2577 (bajo) — «Ver proceso paso a paso» es un desplegable con aria-expanded', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2577: llevaba aria-pressed (conmutador) y no aria-expanded.
    await convertir(page, 'DEC', '25');
    const desplegable = page.getByRole('button', { name: 'Ver proceso paso a paso', exact: true });
    await expect(desplegable).not.toHaveAttribute('aria-pressed', /.*/);
    await expect(desplegable).toHaveAttribute('aria-expanded', 'false');
    await expect(desplegable).toHaveAttribute('aria-controls', 'pasos-conversion');
    await desplegable.click();
    await expect(desplegable).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#pasos-conversion')).toContainText('25 ÷ 2 = 12, resto = 1');
  });

  test('HALLAZGO D · 2578 (bajo) — ninguna <label> de los paneles queda sin control', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2578: «Base de entrada:» (dos), «Ancho de bits:» y
    // «Operación:» eran <label> sin control. Ahora son rótulos de grupos role="group", y cada
    // panel es una región con el nombre de su <h2>, que es lo que distingue los dos «BIN».
    const huerfanas = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="conversionSection"] label, [class*="operationsSection"] label')]
        .filter((l) => !(l as HTMLLabelElement).control)
        .map((l) => l.textContent?.trim()),
    );
    expect(huerfanas).toEqual([]);
    await expect(page.getByRole('group', { name: /Base de entrada/ })).toHaveCount(2);
    const conversion = page.getByRole('region', { name: 'Conversión de Bases' });
    const operaciones = page.getByRole('region', { name: 'Operaciones Binarias' });
    await expect(conversion.getByRole('group', { name: 'Base de entrada:' }).getByRole('button')).toHaveCount(4);
    await expect(operaciones.getByRole('group', { name: 'Base de entrada:' }).getByRole('button')).toHaveCount(4);
    await expect(operaciones.getByRole('group', { name: 'Ancho de bits:' }).getByRole('button')).toHaveCount(4);
    await expect(operaciones.getByRole('group', { name: 'Operación:' }).getByRole('button')).toHaveCount(8);
  });
});

test.describe('re-inspección 01/10/2026 · el bloque educativo', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  });

  test('HALLAZGO F · 2580 (bajo) — Python 2 no leía «078» como decimal', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2580: la gramática de Python 2.7 (decimalinteger ::=
    // nonzerodigit digit* | "0"; octinteger ::= "0" octdigit+) no admite «078»: es un error de
    // sintaxis. Lo silencioso era otra cosa: «017» se leía como octal, 1×8 + 7 = 15.
    const punto = page.locator('li', { hasText: 'Mezclar BIN y OCT' });
    await expect(punto).not.toContainText('tratado como decimal');
    await expect(punto).toContainText('En Python 2, 078 también era un error de sintaxis');
    await expect(punto).toContainText('017 se leía en silencio como octal (vale 15');
  });

  test('HALLAZGO G · 2581 (bajo) — un kilobyte son 1000 bytes; 1024 es un kibibyte', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2581. NIST, «Prefixes for binary multiples»: 1 kbit =
    // 10³ bit = 1000 bit; 1 Kibit = 2¹⁰ bit = 1024 bit, prefijos binarios de la IEC (1998).
    // A mano: 10⁹ = 0x3B9ACA00 (3·16⁷ + 11·16⁶ + 9·16⁵ + 10·16⁴ + 12·16³ + 10·16² = 1.000.000.000)
    // y 2³⁰ = 0x40000000.
    const faq = (texto: string) => page.locator('[class*="faqItem"]', { hasText: texto });
    await expect(faq('nibble, un byte')).not.toContainText('Kilobyte = 1024 bytes');
    await expect(faq('nibble, un byte')).toContainText('Kilobyte (kB) = 1000 bytes');
    await expect(faq('nibble, un byte')).toContainText('1024 bytes = 2^10 es un kibibyte (KiB)');

    // La FAQ siguiente atribuía el KiB a «ISO»: lo definió la IEC.
    await expect(faq('1000 o 1024')).not.toContainText('ISO');
    await expect(faq('1000 o 1024')).toContainText('IEC');

    // «1 GB = 0x40000000» era 1 GiB.
    await expect(faq('hexadecimal si tenemos decimal')).not.toContainText('1 GB = 0x40000000');
    await expect(faq('hexadecimal si tenemos decimal')).toContainText('1 GiB = 2^30 bytes = 0x40000000');
    await expect(faq('hexadecimal si tenemos decimal')).toContainText('1 GB = 10^9 bytes = 0x3B9ACA00');
  });

  test('HALLAZGO H · 2582 (bajo) — un sumador de 8 bits no son 8 puertas lógicas', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2582: cada columna da suma Y acarreo (dos salidas) y una
    // puerta da una: son 8 sumadores completos en cascada. Cada uno, S = A ⊕ B ⊕ Cin (dos XOR)
    // y Cout = A·B + Cin·(A ⊕ B) (dos AND y un OR).
    const tarjeta = page.locator('[class*="escenarioCard"]', { hasText: 'Electrónica y hardware' });
    await expect(tarjeta).not.toContainText('8 puertas lógicas');
    await expect(tarjeta).toContainText('8 sumadores completos en cascada');
  });
});
