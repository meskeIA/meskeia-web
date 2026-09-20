import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-mcd-mcm (segmento CÁLCULO, riesgo 3, 161 usos, 93 s de estancia)
 * Primera inspección: 20/09/2026. Banco de pruebas: producción (meskeia.com), deploy de las 11:25.
 *
 * QUÉ PROMETE LA APP
 *   · <h1> «Calculadora MCD y MCM» y subtítulo «Calcula el Máximo Común Divisor y Mínimo Común
 *     Múltiplo de hasta 5 números». No anuncia ningún límite de tamaño para esos números.
 *   · metadata.ts y el JSON-LD prometen «explicación paso a paso del método», y la app la
 *     publica de verdad: la descomposición en factores primos de cada número, los factores
 *     comunes con menor exponente (MCD) y todos los factores con mayor exponente (MCM).
 *     Ese desarrollo es parte de la promesa: un resultado que no salga de él es un hallazgo.
 *   · El bloque educativo y el FAQPage prometen además la identidad `MCD(a,b) × MCM(a,b) = a × b`
 *     como comprobación («Si el producto no coincide, hay un error en alguno de los dos valores»)
 *     y presumen de que la herramienta «usa el algoritmo de Euclides internamente», que es
 *     «extremadamente eficiente incluso con números muy grandes».
 *
 * DÓNDE VIVE EL CÁLCULO — no hay motor aparte: todo en app/calculadora-mcd-mcm/page.tsx.
 *   · `mcdDos` es Euclides → exacto. Desde la reparación trabaja en BigInt.
 *   · `mcmDos` era `Math.abs(a * b) / mcdDos(a, b)`: pasaba por el PRODUCTO, que desborda el
 *     entero seguro mucho antes que el propio MCM (HALLAZGO 1). Ahora divide ANTES de
 *     multiplicar y en BigInt, así que no hay tope.
 *   · `mcmArray` encadena ese mcmDos con reduce, así que con 5 números el producto
 *     intermedio desbordaba ya con entradas de 4 cifras.
 *   · `factorizar` era división de prueba desde 2 de uno en uno SIN cortar en la raíz, y se
 *     llamaba TRES veces por número (factoresMcd, factoresMcm y el render) → HALLAZGO 2.
 *     Ahora corta en √n, anota el resto como último factor y se calcula UNA vez por número.
 *   · La entrada la lee parseSpanishNumber() de @/lib, el parser canónico: «1.500» son 1500
 *     (millar español) y «12abc» no entra. Comprobado en el CASO 3.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 84, 126 y 210, factorizados a mano
 *       84 = 2²·3·7 · 126 = 2·3²·7 · 210 = 2·3·5·7
 *       MCD = factores comunes con menor exponente = 2·3·7 = 42 (84/42=2, 126/42=3, 210/42=5)
 *       MCM = todos los factores con mayor exponente = 2²·3²·5·7 = 1260
 *            (1260/84=15, 1260/126=10, 1260/210=6)
 *       Se eligen tres números —no dos— porque el MCD y el MCM encadenados (reduce) son
 *       justo donde un fallo de asociación no se vería con una pareja.
 *
 *   CASO 2 (límite) — 123.456.789 y 987.654.321, donde a·b desborda 2^53
 *       123456789 = 3²·3607·3803 · 987654321 = 3²·17²·379721
 *       MCD = 3² = 9 ✔ (Euclides no pasa por el producto)
 *       MCM = 3²·17²·3607·3803·379721 = 13.548.070.123.626.141 exacto
 *       a·b = 121.932.631.112.635.269 > 2^53 = 9.007.199.254.740.992 → el producto se redondea
 *       a 121.932.631.112.635.264 ANTES de dividir, y el MCM sale 13.548.070.123.626.140:
 *       un número que no es múltiplo ni de 123456789 ni de 987654321.
 *
 *   CASO 2.bis (el mismo defecto con números de andar por casa) — 9973, 9967, 9949, 9941, 9937
 *       Cinco números de CUATRO cifras, que es justo lo que la app anuncia poder hacer.
 *       Son coprimos dos a dos (9937 = 19·523; los otros cuatro son primos), así que
 *       MCD = 1 y MCM = el producto = 97.691.116.197.127.785.803.
 *
 *   CASO 3 (rechazo) — lo que la app dice admitir es «números enteros positivos»
 *       «2,5» decimal · «0» · «−12» · «12abc» → los cuatro deben quedarse sin resultado,
 *       y un solo número tampoco basta. Ojo con el 0: la app lo RECHAZA, y desde la
 *       reparación lo declara antes de calcular en vez de dejar que se descubra fallando.
 *
 * LO QUE ESTÁ SANO (verificado en producción el 20/09/2026): el MCD y el MCM son exactos
 * mientras el resultado quepa en el entero seguro, incluidos los coprimos (8 y 9 → 1 y 72) y
 * el 1 (1 y 12 → 1 y 12, con «1 = 1» en la descomposición); las descomposiciones en primos son
 * correctas en todos los casos probados —incluido 9937 = 19 × 523, que no es primo pese a
 * parecerlo—; el parser es el canónico; y las cuatro entradas inválidas se rechazan con un
 * mensaje claro.
 *
 * HALLAZGOS — REPARADOS el 20/09/2026, el mismo día. Los tests que los afirmaban estaban
 * marcados con `test.fail()`; retirada la marca, quedan al final como candado de regresión.
 *   1. MCM exacto en BigInt (13.548.070.123.626.141 y 97.691.116.197.127.785.803).
 *   2. Factorización cortada en √n + una sola llamada por número + tope de entrada de un
 *      billón, declarado en pantalla: 999.999.999.989 y 12 responden al instante donde antes
 *      la pestaña no volvía.
 *   3. El aviso de entrada inválida lleva role="alert" y aria-live="polite".
 *   4. Cada campo tiene <label> y su id: el nombre accesible ya no depende del placeholder.
 *   5. La restricción («enteros positivos», tope) se declara ANTES de calcular, y la
 *      curiosidad «MCD(a, 0) = a» del bloque educativo dice ahora por qué aquí el 0 no entra.
 */

const RUTA = '/calculadora-mcd-mcm/';
const campo = (n: number) => `input[placeholder="Número ${n}"]`;

/** Texto de un nodo, con el espacio duro de Intl normalizado. */
async function texto(loc: Locator): Promise<string> {
  return ((await loc.textContent()) ?? '').replace(/ /g, ' ').trim();
}

/** El valor de la tarjeta de resultado (ResultCard) cuyo título contiene ese texto. */
function tarjeta(page: Page, titulo: string): Locator {
  return page
    .locator('[class*="ResultCard"][class*="card"]')
    .filter({ hasText: titulo })
    .locator('p[class*="value"]')
    .first();
}

const mcd = (page: Page) => texto(tarjeta(page, 'MCD (Máximo Común Divisor)'));
const mcm = (page: Page) => texto(tarjeta(page, 'MCM (Mínimo Común Múltiplo)'));

/** La descomposición en primos que la app publica para uno de los números introducidos. */
function descomposicion(page: Page, numeroFormateado: string): Locator {
  return page
    .locator('[class*="factorRow"]')
    .filter({ hasText: `${numeroFormateado} =` })
    .locator('[class*="factors"]');
}

/** El producto de factores con el que la app justifica el MCD y el MCM (el «paso a paso»). */
function metodo(page: Page, cual: 'mcd' | 'mcm'): Locator {
  const rotulo =
    cual === 'mcd' ? 'Factores comunes con menor exponente' : 'Todos los factores con mayor exponente';
  return page.locator('[class*="methodItem"]').filter({ hasText: rotulo }).locator('code');
}

const mensajeError = (page: Page) => page.locator('[class*="errorMsg"]');
const marcadorSinResultado = (page: Page) =>
  page.getByText('Introduce al menos 2 números y pulsa');

/** Escribe en un campo y comprueba que el ESTADO de React lo recogió (no solo el DOM). */
async function escribir(page: Page, n: number, valor: string): Promise<void> {
  await page.fill(campo(n), valor);
  await esperarValorEnReact(page, campo(n), valor);
}

/** Vacía la calculadora: `limpiar()` devuelve los campos a tres y todos en blanco. */
async function limpiar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Limpiar' }).click();
  await esperarValorEnReact(page, campo(1), '');
}

async function calcular(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Calcular MCD y MCM' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Calculadora MCD y MCM');
  // Antes del primer clic: un clic anterior a la hidratación también se pierde.
  await esperarHidratacion(page, [campo(1), campo(2), campo(3)]);
});

test('CASO 1 · 84, 126 y 210: MCD 42, MCM 1260 y el paso a paso que lleva a ellos', async ({
  page,
}) => {
  await escribir(page, 1, '84');
  await escribir(page, 2, '126');
  await escribir(page, 3, '210');
  await calcular(page);

  // A mano: 84 = 2²·3·7, 126 = 2·3²·7, 210 = 2·3·5·7 → MCD = 2·3·7 = 42, MCM = 2²·3²·5·7 = 1260
  expect(await mcd(page)).toBe('42');
  expect(await mcm(page)).toBe('1260'); // es-ES no agrupa los millares hasta 5 cifras

  // La descomposición publicada, que es parte de lo que la app promete
  expect(await texto(descomposicion(page, '84'))).toBe('2^2 × 3 × 7');
  expect(await texto(descomposicion(page, '126'))).toBe('2 × 3^2 × 7');
  expect(await texto(descomposicion(page, '210'))).toBe('2 × 3 × 5 × 7');

  // Y el método: el desarrollo tiene que multiplicar EXACTAMENTE el resultado de arriba
  expect(await texto(metodo(page, 'mcd'))).toBe('2 × 3 × 7'); // = 42
  expect(await texto(metodo(page, 'mcm'))).toBe('2^2 × 3^2 × 5 × 7'); // = 1260
});

test('CASO 2 · 123.456.789 y 987.654.321: el MCD y las descomposiciones aguantan', async ({
  page,
}) => {
  await escribir(page, 1, '123456789');
  await escribir(page, 2, '987654321');
  await calcular(page);

  // Euclides no pasa por el producto: 987654321 = 8·123456789 + 9 y 123456789 = 13717421·9 + 0
  expect(await mcd(page)).toBe('9');
  expect(await texto(metodo(page, 'mcd'))).toBe('3^2');

  // Factorizadas a mano: 123456789 = 3²·3607·3803 y 987654321 = 3²·17²·379721
  expect(await texto(descomposicion(page, '123.456.789'))).toBe('3^2 × 3607 × 3803');
  expect(await texto(descomposicion(page, '987.654.321'))).toBe('3^2 × 17^2 × 379721');
  expect(await texto(metodo(page, 'mcm'))).toBe('3^2 × 17^2 × 3607 × 3803 × 379721');
});

test('CASO 3 · decimal, cero, negativo y texto se rechazan; un solo número no basta', async ({
  page,
}) => {
  const AVISO = 'Todos los valores deben ser números enteros positivos';

  // Decimal: la app dice admitir enteros positivos, y 2,5 no lo es
  await escribir(page, 1, '2,5');
  await escribir(page, 2, '10');
  await calcular(page);
  await expect(mensajeError(page)).toHaveText(AVISO);
  await expect(marcadorSinResultado(page)).toBeVisible();

  // Cero: rechazado porque el MCM con 0 no está definido. Desde la reparación eso se dice
  // encima de los campos y el bloque educativo lo explica al enseñar «MCD(a, 0) = a».
  await limpiar(page);
  await escribir(page, 1, '0');
  await escribir(page, 2, '12');
  await calcular(page);
  await expect(mensajeError(page)).toHaveText(AVISO);

  // Negativo
  await limpiar(page);
  await escribir(page, 1, '-12');
  await escribir(page, 2, '18');
  await calcular(page);
  await expect(mensajeError(page)).toHaveText(AVISO);

  // Lo que no es un número: parseSpanishNumber devuelve NaN en vez del 12 que daría parseFloat
  await limpiar(page);
  await escribir(page, 1, '12abc');
  await escribir(page, 2, '10');
  await calcular(page);
  await expect(mensajeError(page)).toHaveText(AVISO);
  await expect(marcadorSinResultado(page)).toBeVisible();

  // Con un solo número no hay nada que comparar
  await limpiar(page);
  await escribir(page, 1, '12');
  await calcular(page);
  await expect(mensajeError(page)).toHaveText('Introduce al menos 2 números');

  // Y el millar español SÍ entra: «1.500» son 1500, no 1,5 (MCD(1500,400)=100, MCM=6000)
  await limpiar(page);
  await escribir(page, 1, '1.500');
  await escribir(page, 2, '400');
  await calcular(page);
  expect(await mcd(page)).toBe('100');
  expect(await mcm(page)).toBe('6000');
});

test.describe('HALLAZGOS del 20/09/2026, reparados el mismo día', () => {
  test('HALLAZGO 1 · el MCM de 123.456.789 y 987.654.321 debe ser exacto', async ({ page }) => {
    // Antes de la reparación devolvía 13.548.070.123.626.140, uno menos, porque pasaba por
    // el producto a·b, que desborda 2^53.

    await escribir(page, 1, '123456789');
    await escribir(page, 2, '987654321');
    await calcular(page);

    // 3²·17²·3607·3803·379721 = 13.548.070.123.626.141 — que es, letra por letra, el producto
    // de los factores que la propia app imprime tres líneas más abajo.
    expect(await mcm(page)).toBe('13.548.070.123.626.141');
  });

  test('HALLAZGO 1.bis · cinco números de cuatro cifras ya desbordan el producto', async ({
    page,
  }) => {
    // Antes devolvía 97.691.116.197.127.800.000: 12.981 de más y cinco ceros de mentira.

    await page.getByRole('button', { name: '+ Añadir número' }).click();
    await page.getByRole('button', { name: '+ Añadir número' }).click();
    for (const [i, v] of ['9973', '9967', '9949', '9941', '9937'].entries()) {
      await escribir(page, i + 1, v);
    }
    await calcular(page);

    // Coprimos dos a dos → MCD 1 y MCM = su producto = 97.691.116.197.127.785.803
    expect(await mcd(page)).toBe('1');
    expect(await mcm(page)).toBe('97.691.116.197.127.785.803');
  });

  test('HALLAZGO 2 · un primo de 12 cifras se resuelve, y por encima del tope se avisa', async ({
    page,
  }) => {
    // Antes: la división de prueba no cortaba en √n y se repetía tres veces por número, así
    // que este mismo caso dejaba la pestaña sin responder (109 s sin atender ni a un 1+1).
    await escribir(page, 1, '999999999989');
    await escribir(page, 2, '12');
    await calcular(page);

    // 999.999.999.989 es primo y no comparte factores con 12 → MCD 1, MCM = 12·999.999.999.989
    await expect(tarjeta(page, 'MCM (Mínimo Común Múltiplo)')).toHaveText('11.999.999.999.868', {
      timeout: 15000,
    });
    expect(await mcd(page)).toBe('1');
    // El corte en la raíz anota el resto como último factor: sale primo, no una lista vacía
    expect(await texto(descomposicion(page, '999.999.999.989'))).toBe('999999999989');

    // Por encima del tope se avisa en vez de bloquear el hilo
    await limpiar(page);
    await escribir(page, 1, '9999999999999'); // 13 cifras
    await escribir(page, 2, '12');
    await calcular(page);
    await expect(mensajeError(page)).toHaveText('Cada número debe ser como mucho 1.000.000.000.000');
    await expect(marcadorSinResultado(page)).toBeVisible();
  });

  test('HALLAZGO 3 · el aviso de entrada inválida debe anunciarse al lector de pantalla', async ({
    page,
  }) => {
    // Antes el <div> del error no llevaba ni role="alert" ni aria-live.

    await escribir(page, 1, '2,5');
    await escribir(page, 2, '10');
    await calcular(page);

    // CLAUDE.md §5: <div role="alert" aria-live="polite">Error: …</div>. Sin eso, quien no ve
    // la pantalla pulsa «Calcular» y no se entera de que no ha pasado nada.
    await expect(mensajeError(page)).toHaveAttribute('role', 'alert');
    await expect(mensajeError(page)).toHaveAttribute('aria-live', 'polite');
  });

  test('HALLAZGO 4 · cada campo tiene etiqueta propia, no solo el placeholder', async ({ page }) => {
    // Antes el único nombre accesible salía del placeholder, que desaparece al escribir.
    // `getByLabel` casa por subcadena y «Número 1» resuelve también al botón «Eliminar el
    // número 1»: se pide el CAMPO por su rol.
    const primero = page.getByRole('textbox', { name: 'Número 1', exact: true });
    await expect(primero).toBeVisible();
    await expect(primero).toHaveAttribute('id', 'numero-1');

    // Y la etiqueta sigue ahí con el campo relleno, que es justo lo que el placeholder no hace
    await escribir(page, 1, '84');
    await expect(page.getByRole('textbox', { name: 'Número 1', exact: true })).toHaveValue('84');
  });

  test('HALLAZGO 5 · la restricción se declara ANTES de calcular', async ({ page }) => {
    // Antes solo se descubría fallando, mientras el bloque educativo enseñaba «MCD(a, 0) = a».
    const reglas = page.locator('#reglas-entrada');
    await expect(reglas).toBeVisible(); // sin haber pulsado nada
    await expect(reglas).toContainText('enteros positivos');
    await expect(reglas).toContainText('1.000.000.000.000');
    await expect(reglas).toContainText('0 no se admite');

    // Y cada campo la lleva como descripción, para quien no ve la pantalla
    await expect(
      page.getByRole('textbox', { name: 'Número 1', exact: true }),
    ).toHaveAttribute('aria-describedby', 'reglas-entrada');
  });
});
