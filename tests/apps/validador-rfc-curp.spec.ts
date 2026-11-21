import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * Inspector — validador-rfc-curp (segmento interactiva, riesgo 3)
 *
 * Primera inspección: 21/11/2026. La app promete en su <h1> «Validar RFC y CURP · Calculadora de
 * RFC»: revisa la estructura, la fecha y el dígito verificador de un RFC (física 13, moral 12) y de
 * una CURP (18), y arma las 10 primeras posiciones del RFC con nombre, apellidos y fecha. Todo el
 * cálculo vive en app/validador-rfc-curp/page.tsx (validarRfc, validarCurp, calcularRfc).
 *
 * FUENTE DE LOS ALGORITMOS
 *   No hay ningún dominio mexicano (SAT, RENAPO, DOF, gob.mx) en la lista de fuentes aprobadas de
 *   la tarea, y la app no cita ninguna URL. Los algoritmos se han escrito APARTE, de memoria y
 *   declarado así (.inspector-trabajo/rfc-curp-esperados.mjs):
 *     RFC (SAT): valores 0-9 = 0-9, A=10 … N=23, &=24, O=25 … Z=36, espacio=37, Ñ=38; pesos 13..2
 *       sobre 12 posiciones (la moral lleva un espacio delante); residuo 0 → «0», 11 − residuo = 10
 *       → «A», si no 11 − residuo.
 *     CURP (RENAPO): valores 0-9, A=10 … N=23, Ñ=24, O=25 … Z=36; pesos 18..2 sobre 17
 *       posiciones; dígito = (10 − suma mod 10) mod 10. Posición 17: dígito si nació en 19xx,
 *       letra si nació a partir de 2000. 32 claves de entidad + NE.
 *   El motor de la app coincide con ellos en todos los casos de abajo.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Persona ficticia: Ana Lucía Torres Vega, 12/07/1990, Jalisco, mujer.
 *   CASO 1 (normal)
 *     RFC TOVA900712K3 + dígito: suma 1344, 1344 mod 11 = 2 → 11 − 2 = 9 → TOVA900712K39 válido.
 *     CURP TOVA900712MJCRGN0 + dígito: suma 2512, mod 10 = 2 → 10 − 2 = 8 → TOVA900712MJCRGN08.
 *     Ejemplos de la propia app: GOMR850315H23 (suma 1240, r 8 → 3) y GORM850315HDFMMR05 (suma
 *     2355 → 5), válidos; GOMR850315H25, el «dictado» del escenario, debe pedir el 3.
 *     Calcular: Torres / Vega / Ana Lucía / 12-07-1990 → TOVA900712 · Ramos / Torres / Ana /
 *     15-03-1985 → RATA, palabra inconveniente → RATX850315.
 *   CASO 2 (límite)
 *     CURP HELD000229HNERNGA1 (Diego Herrera Luna, 29/02/2000, NE, letra A): suma 1879 → 1, válida.
 *     La misma con homonimia 0 (→ 1900, no bisiesto): HELD000229HNERNG01, la fecha no existe.
 *     29/02/2001: HELD010229HNERNGA8, la fecha no existe.
 *     RFC moral SAN150630Q7: « SAN150630Q7» suma 1364, r 0 → 0 → SAN150630Q70 válido.
 *     RFC moral con &: R&M190520K8 → suma 1498, r 2 → 9 → R&M190520K89 válido.
 *     Minúsculas y espacios «  tova900712k39  » → igual que TOVA900712K39.
 *     Residuo 1 → «A»: TOVA900712K8 suma 1354, r 1 → TOVA900712K8A válido (K80 pide la «A»).
 *     Suma múltiplo de 10 → 0: TOVA900712MJCRGN4 suma 2520 → TOVA900712MJCRGN40 válida.
 *     Calcular: de la Cruz / Peña / María Fernanda / 29-02-2000 → CUPF000229.
 *   CASO 3 (rechazo)
 *     TOVA900712K30 (dígito 9 + 1) → «debería terminar en "9"» · TOVA900712MJCRGN09 → «"8"».
 *     TOVA900231K30 (31/02, dígito calculado: suma 1320, r 0 → 0) → solo el error de fecha.
 *     TOVA900712MXXRGN01 (entidad XX, dígito calculado) → entidad no válida.
 *     11 caracteres de RFC y 17 de CURP → error de longitud.
 *
 * HALLAZGOS del 21/11/2026 (los abiertos llevan test.fail())
 *   A. El dígito verificador NO detecta cualquier carácter cambiado, y la página dice que sí. En el
 *      RFC la 3.ª posición de la persona física pesa 11 ≡ 0 (mod 11): GONR850315H23 cuadra igual
 *      que GOMR850315H23 (M=22 → N=23 suma 11). En la CURP la 9.ª pesa 10 ≡ 0 (mod 10):
 *      GORM850325HDFMMR05 (día 15 → 25) cuadra igual, y la 14.ª pesa 5: GORM850315HDFKMR05
 *      (consonante M → K) también. El motor acierta; lo falso es la promesa de la FAQ visible, del
 *      escenario «Cambiar una sola consonante interna rompe el dígito verificador» y del FAQPage.
 *   B. Las notas de los RFC genéricos están cambiadas: XEXX010101000 sí cuadra (suma 1342 =
 *      11 × 122 → 0) y la nota dice que «no sigue la regla del dígito verificador», junto a un
 *      desglose que dice que cuadra; XAXX010101000 no cuadra (suma 1294, r 7 → 4) y el desglose
 *      dice «Cuadra con el algoritmo del SAT».
 *   C. El validador da «Estructura correcta» a un RFC que empieza por una palabra del listado de
 *      inconvenientes (RATA850315K20), cuando la propia página explica que esas combinaciones no
 *      se asignan y el modo Calcular convierte RATA en RATX.
 *   D. El FAQPage (faqJsonLd) está escrito aparte de la FAQ visible: ninguna de sus 5 preguntas
 *      está en la página, y dos son la misma pregunta con otra respuesta (homoclave; fecha). El
 *      FAQPage llama homoclave a 3 caracteres; la página, a las posiciones 11 y 12.
 *   E. Pestañas: las flechas no mueven el foco entre ellas y el aria-controls de las dos
 *      inactivas apunta a un id que no existe.
 *   F. El <title> dice «Calculadora de RFC con Homoclave» y la app explica que la homoclave no se
 *      puede calcular por fuera (solo da las 10 primeras posiciones).
 *
 * SOSPECHA SIN FUENTE APROBADA (no es hallazgo): el listado de palabras inconvenientes del modo
 * Calcular (79) parece el de la CURP de RENAPO y no el del RFC del SAT, que de memoria es más
 * corto (41, sin VACA, LOCA, NACA, ROBA…). Si se confirma con el SAT, «Vargas Castro Ana» daría
 * VACA y la app escribe VACX.
 */

test.use({ locale: 'es-ES' });

const RUTA = '/validador-rfc-curp/';
const PIXEL7 = devices['Pixel 7'];

const resultado = (page: Page): Locator => page.getByRole('tabpanel').getByRole('alert');

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#campo-rfc']);
}

async function validarRfc(page: Page, valor: string): Promise<Locator> {
  await page.locator('#campo-rfc').fill(valor);
  await esperarValorEnReact(page, '#campo-rfc', valor.toUpperCase());
  await page.getByRole('button', { name: 'Validar RFC' }).click();
  const r = resultado(page);
  await expect(r).toBeVisible();
  return r;
}

async function irA(page: Page, pestania: RegExp, campo: string): Promise<void> {
  await page.getByRole('tab', { name: pestania }).click();
  await esperarHidratacion(page, [campo]);
}

async function validarCurp(page: Page, valor: string): Promise<Locator> {
  await page.locator('#campo-curp').fill(valor);
  await esperarValorEnReact(page, '#campo-curp', valor.toUpperCase());
  await page.getByRole('button', { name: 'Validar CURP' }).click();
  const r = resultado(page);
  await expect(r).toBeVisible();
  return r;
}

async function calcular(page: Page, paterno: string, materno: string, nombres: string, fecha: string): Promise<Locator> {
  for (const [sel, v] of [
    ['#campo-paterno', paterno],
    ['#campo-materno', materno],
    ['#campo-nombres', nombres],
    ['#campo-fecha', fecha],
  ] as const) {
    await page.locator(sel).fill(v);
    await esperarValorEnReact(page, sel, v);
  }
  await page.getByRole('button', { name: 'Calcular' }).click();
  const r = resultado(page);
  await expect(r).toBeVisible();
  return r;
}

/** Fila del desglose (valor + etiqueta + explicación) por su etiqueta. */
const fila = (r: Locator, etiqueta: string): Locator =>
  r.locator('h3', { hasText: etiqueta }).locator('xpath=../..');

test.describe('Validar RFC', () => {
  test.beforeEach(async ({ page }) => abrir(page));

  test('caso 1 · TOVA900712K39 (Torres Vega Ana, 12/07/1990) es un RFC de persona física bien formado', async ({ page }) => {
    // Esperado: suma 1344, 1344 mod 11 = 2 → dígito 9
    const r = await validarRfc(page, 'TOVA900712K39');
    await expect(r).toContainText('Estructura correcta · RFC de persona física');
    await expect(fila(r, 'Fecha de nacimiento')).toContainText('Corresponde al 12 de julio de 1990.');
    await expect(fila(r, 'Dígito verificador')).toContainText('Cuadra con el algoritmo del SAT');
  });

  test('caso 1 · el ejemplo de la app: GOMR850315H23 cuadra y el dictado GOMR850315H25 pide un 3', async ({ page }) => {
    // GOMR850315H2: suma 1240, mod 11 = 8 → 11 − 8 = 3
    let r = await validarRfc(page, 'GOMR850315H23');
    await expect(r).toContainText('Estructura correcta · RFC de persona física');
    r = await validarRfc(page, 'GOMR850315H25');
    await expect(r).toContainText('La estructura tiene problemas');
    await expect(r).toContainText('el RFC termina en "5" y según el algoritmo del SAT debería terminar en "3"');
  });

  test('caso 2 · minúsculas y espacios alrededor se normalizan', async ({ page }) => {
    const r = await validarRfc(page, '  tova900712k39  ');
    await expect(r).toContainText('Estructura correcta · RFC de persona física');
    await expect(fila(r, 'Iniciales')).toContainText('TOVA');
  });

  test('caso 2 · persona moral de 12: SAN150630Q70 y R&M190520K89 (espacio delante en el cálculo)', async ({ page }) => {
    // « SAN150630Q7»: suma 1364, r 0 → 0 · « R&M190520K8»: suma 1498, r 2 → 9 (& vale 24)
    let r = await validarRfc(page, 'SAN150630Q70');
    await expect(r).toContainText('Estructura correcta · RFC de persona moral');
    await expect(fila(r, 'Fecha de constitución')).toContainText('Corresponde al 30 de junio de 2015.');
    r = await validarRfc(page, 'R&M190520K89');
    await expect(r).toContainText('Estructura correcta · RFC de persona moral');
    await expect(fila(r, 'Iniciales')).toContainText('R&M');
  });

  test('caso 2 · residuo 1 → dígito «A»: TOVA900712K8A', async ({ page }) => {
    // TOVA900712K8: suma 1354, 1354 mod 11 = 1 → 11 − 1 = 10 → «A»
    const r = await validarRfc(page, 'TOVA900712K8A');
    await expect(r).toContainText('Estructura correcta · RFC de persona física');
    const malo = await validarRfc(page, 'TOVA900712K80');
    await expect(malo).toContainText('debería terminar en "A"');
  });

  test('caso 3 · dígito alterado en una unidad: TOVA900712K30 debe terminar en 9', async ({ page }) => {
    const r = await validarRfc(page, 'TOVA900712K30');
    await expect(r).toContainText('La estructura tiene problemas');
    await expect(r).toContainText('el RFC termina en "0" y según el algoritmo del SAT debería terminar en "9"');
  });

  test('caso 3 · 31 de febrero con dígito correcto: TOVA900231K30 solo falla por la fecha', async ({ page }) => {
    // TOVA900231K3: suma 1320, r 0 → dígito 0, así que el único error es la fecha
    const r = await validarRfc(page, 'TOVA900231K30');
    await expect(r).toContainText('La fecha "900231" no existe');
    await expect(r.locator('li')).toHaveCount(1);
  });

  test('caso 3 · longitud equivocada: 11 caracteres', async ({ page }) => {
    const r = await validarRfc(page, 'TOVA900712K');
    await expect(r).toContainText('El RFC tiene 11 caracteres. Un RFC de persona física tiene 13 y uno de persona moral (empresa) tiene 12.');
  });

  test('los RFC genéricos XAXX010101000 y XEXX010101000 se aceptan', async ({ page }) => {
    let r = await validarRfc(page, 'XAXX010101000');
    await expect(r).toContainText('Estructura correcta');
    await expect(r).toContainText('RFC genérico para ventas al público en general');
    r = await validarRfc(page, 'XEXX010101000');
    await expect(r).toContainText('Estructura correcta');
    await expect(r).toContainText('RFC genérico para residentes en el extranjero');
  });

  // ABIERTO (hallazgo B): XEXX01010100 → suma 1342 = 11 × 122 → dígito 0: SÍ sigue la regla
  test.fail('ABIERTO B · XEXX010101000 cuadra con el dígito y la nota dice que no sigue la regla', async ({ page }) => {
    const r = await validarRfc(page, 'XEXX010101000');
    await expect(fila(r, 'Dígito verificador')).toContainText('Cuadra con el algoritmo del SAT');
    await expect(r).not.toContainText('no sigue la regla del dígito verificador');
  });

  // ABIERTO (hallazgo B): XAXX01010100 → suma 1294, 1294 mod 11 = 7 → el algoritmo da 4, no 0
  test.fail('ABIERTO B · XAXX010101000 no cuadra con el algoritmo y el desglose dice que sí', async ({ page }) => {
    const r = await validarRfc(page, 'XAXX010101000');
    await expect(fila(r, 'Dígito verificador')).not.toContainText('Cuadra con el algoritmo del SAT');
  });

  // ABIERTO (hallazgo C): la propia página dice que el SAT no asigna esas combinaciones (RATA → RATX)
  test.fail('ABIERTO C · un RFC que empieza por RATA, con dígito correcto, se da por bien formado', async ({ page }) => {
    // RATA850315K2: suma 1133, r 0 → dígito 0
    const r = await validarRfc(page, 'RATA850315K20');
    await expect(r).toContainText(/inconveniente/i);
  });
});

test.describe('Validar CURP', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await irA(page, /Validar CURP/, '#campo-curp');
  });

  test('caso 1 · TOVA900712MJCRGN08: mujer, Jalisco, 12/07/1990, siglo XX', async ({ page }) => {
    // TOVA900712MJCRGN0: suma 2512, mod 10 = 2 → 8
    const r = await validarCurp(page, 'TOVA900712MJCRGN08');
    await expect(r).toContainText('Estructura correcta');
    await expect(fila(r, 'Fecha de nacimiento')).toContainText('Corresponde al 12 de julio de 1990.');
    await expect(fila(r, 'Sexo')).toContainText('M de mujer.');
    await expect(fila(r, 'Entidad de nacimiento')).toContainText('Clave de Jalisco.');
    await expect(r).toContainText('nació en el siglo XX (19xx)');
  });

  test('caso 1 · el ejemplo de la app GORM850315HDFMMR05 cuadra', async ({ page }) => {
    // GORM850315HDFMMR0: suma 2355 → 5
    const r = await validarCurp(page, 'GORM850315HDFMMR05');
    await expect(r).toContainText('Estructura correcta');
    await expect(fila(r, 'Entidad de nacimiento')).toContainText('Clave de Ciudad de México.');
  });

  test('caso 2 · 29/02/2000 con letra en la posición 17 y nacido en el extranjero (NE)', async ({ page }) => {
    // HELD000229HNERNGA: suma 1879, mod 10 = 9 → 1
    const r = await validarCurp(page, 'HELD000229HNERNGA1');
    await expect(r).toContainText('Estructura correcta');
    await expect(fila(r, 'Fecha de nacimiento')).toContainText('Corresponde al 29 de febrero de 2000.');
    await expect(fila(r, 'Entidad de nacimiento')).toContainText('Nacido en el extranjero');
    await expect(r).toContainText('nació a partir del año 2000');
  });

  test('caso 2 · 29/02 con dígito en la posición 17 (1900, no bisiesto) y 29/02/2001 no existen', async ({ page }) => {
    let r = await validarCurp(page, 'HELD000229HNERNG01');
    await expect(r).toContainText('La fecha de nacimiento "000229" no existe');
    r = await validarCurp(page, 'HELD010229HNERNGA8');
    await expect(r).toContainText('La fecha de nacimiento "010229" no existe');
  });

  test('caso 2 · minúsculas y espacios alrededor', async ({ page }) => {
    const r = await validarCurp(page, ' tova900712mjcrgn08 ');
    await expect(r).toContainText('Estructura correcta');
  });

  test('caso 2 · suma múltiplo de 10 → (10 − 0) mod 10 = dígito 0: TOVA900712MJCRGN40', async ({ page }) => {
    // TOVA900712MJCRGN4: suma 2520, mod 10 = 0 → 0 (no «10»)
    const r = await validarCurp(page, 'TOVA900712MJCRGN40');
    await expect(r).toContainText('Estructura correcta');
  });

  test('caso 3 · dígito alterado, entidad inexistente y longitud 17', async ({ page }) => {
    let r = await validarCurp(page, 'TOVA900712MJCRGN09');
    await expect(r).toContainText('la CURP termina en "9" y debería terminar en "8"');
    // TOVA900712MXXRGN0: suma 2749 → 1, así que solo falla la entidad
    r = await validarCurp(page, 'TOVA900712MXXRGN01');
    await expect(r).toContainText('"XX" no es una clave de entidad federativa válida');
    await expect(r.locator('li')).toHaveCount(1);
    r = await validarCurp(page, 'TOVA900712MJCRGN0');
    await expect(r).toContainText('La CURP tiene 17 caracteres y debe tener exactamente 18.');
  });
});

test.describe('Calcular RFC', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await irA(page, /Calcular RFC/, '#campo-paterno');
  });

  test('caso 1 · Torres / Vega / Ana Lucía / 12-07-1990 → TOVA900712', async ({ page }) => {
    const r = await calcular(page, 'Torres', 'Vega', 'Ana Lucía', '1990-07-12');
    await expect(r.getByText('TOVA900712', { exact: true })).toBeVisible();
    await expect(r).toContainText('Los tres caracteres que faltan (homoclave y dígito verificador) los asigna el SAT');
  });

  test('caso 1 · Ramos / Torres / Ana → RATA está en el listado de inconvenientes → RATX850315', async ({ page }) => {
    const r = await calcular(page, 'Ramos', 'Torres', 'Ana', '1985-03-15');
    await expect(r.getByText('RATX850315', { exact: true })).toBeVisible();
    await expect(r).toContainText('Tus iniciales daban RATA');
  });

  test('caso 2 · partículas, María + segundo nombre y 29/02/2000: de la Cruz / Peña / María Fernanda → CUPF000229', async ({ page }) => {
    const r = await calcular(page, 'de la Cruz', 'Peña', 'María Fernanda', '2000-02-29');
    await expect(r.getByText('CUPF000229', { exact: true })).toBeVisible();
    await expect(fila(r, 'Fecha (AAMMDD)')).toContainText('29 de febrero de 2000');
  });
});

test.describe('Lo que el dígito verificador no puede ver (hallazgo A)', () => {
  test.beforeEach(async ({ page }) => abrir(page));

  test('el motor aplica bien el algoritmo: GONR850315H23 cuadra igual que GOMR850315H23 (peso 11 en la 3.ª)', async ({ page }) => {
    // GONR850315H2: suma 1251, 1251 mod 11 = 8 → 3, igual que con M (N − M = 1, × 11)
    const r = await validarRfc(page, 'GONR850315H23');
    await expect(r).toContainText('Estructura correcta · RFC de persona física');
  });

  test('el motor aplica bien el algoritmo: día 15 → 25 y consonante M → K no cambian el dígito de la CURP', async ({ page }) => {
    await irA(page, /Validar CURP/, '#campo-curp');
    // GORM850325HDFMMR0: suma 2365 → 5 (peso 10 en la 9.ª) · GORM850315HDFKMR0: suma 2345 → 5 (peso 5, Δ = −2)
    let r = await validarCurp(page, 'GORM850325HDFMMR05');
    await expect(r).toContainText('Estructura correcta');
    r = await validarCurp(page, 'GORM850315HDFKMR05');
    await expect(r).toContainText('Estructura correcta');
  });

  // ABIERTO (hallazgo A): la página y el FAQPage prometen que un carácter cambiado siempre se detecta
  test.fail('ABIERTO A · la página no debe prometer que detecta cualquier carácter cambiado', async ({ page }) => {
    const texto = await page.evaluate(() => (document.body.textContent ?? '').replace(/\s+/g, ' '));
    const faqPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .join(' '),
    );
    expect(texto).not.toContain('detecta los dos errores humanos más comunes: cambiar un carácter por otro');
    expect(texto).not.toContain('Cambiar una sola consonante interna rompe el dígito verificador');
    expect(faqPage).not.toContain('una letra cambiada o dos caracteres intercambiados hacen que deje de cuadrar');
  });
});

test.describe('Privacidad: todo en el navegador', () => {
  test('ningún dato tecleado sale en una petición y la validación funciona sin conexión', async ({ page }) => {
    const peticiones: string[] = [];
    page.on('request', (req) => peticiones.push(`${req.url()} ${req.postData() ?? ''}`));
    await abrir(page);
    await validarRfc(page, 'TOVA900712K39');
    await irA(page, /Calcular RFC/, '#campo-paterno');
    await calcular(page, 'Torres', 'Vega', 'Ana Lucía', '1990-07-12');
    await irA(page, /Validar CURP/, '#campo-curp');
    await validarCurp(page, 'TOVA900712MJCRGN08');
    expect(peticiones.filter((p) => /TOVA900712|Torres|Vega/i.test(p))).toEqual([]);

    await page.context().setOffline(true);
    const r = await validarCurp(page, 'HELD000229HNERNGA1');
    await expect(r).toContainText('Estructura correcta');
    await page.context().setOffline(false);
  });
});

test.describe('Modo oscuro', () => {
  async function estable(leer: () => Promise<number>): Promise<number> {
    let anterior = await leer();
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 100));
      const actual = await leer();
      if (actual === anterior) return actual;
      anterior = actual;
    }
    return anterior;
  }

  test('el resultado (aviso, errores, desglose y notas) se lee a 4,5:1 en oscuro', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('meskeia-theme', 'dark'));
    await abrir(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    let r = await validarRfc(page, 'GOMR850315H25');
    const objetivos: [string, Locator][] = [
      ['aviso de error', r.getByText('La estructura tiene problemas')],
      ['lista de errores', r.locator('li').first()],
      ['explicación del desglose', fila(r, 'Dígito verificador').locator('p')],
      ['nota', r.getByText('El siglo de la fecha se deduce', { exact: false })],
    ];
    for (const [nombre, loc] of objetivos) {
      expect(await estable(() => contrasteSobreFondoReal(loc)), nombre).toBeGreaterThanOrEqual(4.5);
    }
    r = await validarRfc(page, 'GOMR850315H23');
    const ok = r.getByText('Estructura correcta · RFC de persona física');
    expect(await estable(() => contrasteSobreFondoReal(ok)), 'aviso correcto').toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Móvil (Pixel 7)', () => {
  test.use({
    viewport: PIXEL7.viewport,
    userAgent: PIXEL7.userAgent,
    deviceScaleFactor: PIXEL7.deviceScaleFactor,
    isMobile: PIXEL7.isMobile,
    hasTouch: PIXEL7.hasTouch,
  });

  test('caso 2 en móvil: HELD000229HNERNGA1 se valida con toques y nada desborda', async ({ page }) => {
    await abrir(page);
    await page.getByRole('tab', { name: /Validar CURP/ }).tap();
    await esperarHidratacion(page, ['#campo-curp']);
    await page.locator('#campo-curp').fill('HELD000229HNERNGA1');
    await esperarValorEnReact(page, '#campo-curp', 'HELD000229HNERNGA1');
    await page.getByRole('button', { name: 'Validar CURP' }).tap();
    const r = resultado(page);
    await expect(r).toContainText('Estructura correcta');
    await expect(fila(r, 'Fecha de nacimiento')).toContainText('Corresponde al 29 de febrero de 2000.');
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  });
});

test.describe('FAQ, promesa y accesibilidad', () => {
  test.beforeEach(async ({ page }) => abrir(page));

  // ABIERTO (hallazgo F): el <title> promete la homoclave que la app dice que no se puede calcular
  test.fail('ABIERTO F · el title no promete una «Calculadora de RFC con Homoclave»', async ({ page }) => {
    // La propia página: «¿Qué es exactamente la homoclave y por qué no se puede calcular?»
    await expect(page.getByText('por qué no se puede calcular', { exact: false }).first()).toBeAttached();
    expect(await page.title()).not.toMatch(/con homoclave/i);
  });

  // ABIERTO (hallazgo D): las 5 preguntas del faqJsonLd no están en la FAQ visible; dos repiten tema
  test.fail('ABIERTO D · un solo texto de FAQ para la página y el FAQPage', async ({ page }) => {
    await comprobarFaqPageUnico(page);
  });

  // ABIERTO (hallazgo E): patrón de pestañas sin flechas y con aria-controls colgando
  test.fail('ABIERTO E · las flechas mueven el foco entre pestañas y aria-controls apunta a algo', async ({ page }) => {
    await page.getByRole('tab', { name: /Validar RFC/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Calcular RFC/ })).toBeFocused();
    const colgando = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="tab"]'))
        .map((t) => t.getAttribute('aria-controls') ?? '')
        .filter((id) => id && !document.getElementById(id)),
    );
    expect(colgando).toEqual([]);
  });
});
