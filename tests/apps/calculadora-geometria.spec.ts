import { test, expect, devices, Locator, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-geometria (segmento CÁLCULO, riesgo 3, 197 usos/90 d)
 * Primera inspección: 18/09/2026. Banco de pruebas: producción.
 *
 * QUÉ PROMETE LA APP
 *   · <h1> «📐 Calculadora de Geometría» y subtítulo «Calcula áreas, perímetros, volúmenes y
 *     superficies de figuras geométricas». Catorce figuras: ocho planas (cuadrado, rectángulo,
 *     triángulo, círculo, trapecio, rombo, pentágono, hexágono) y seis sólidos (cubo, prisma,
 *     cilindro, esfera, cono, pirámide).
 *   · metadata.ts / JSON-LD: «Visualización interactiva de cada figura», «Soporte para
 *     polígonos regulares e irregulares», y en el FAQPage «también permite calcular el
 *     perímetro si introduces los tres lados». Las tres son falsas (HALLAZGO 4).
 *   · El bloque educativo repite las fórmulas de la tabla 2D/3D y presume de «4 decimales de
 *     precisión», que es justo lo que hace verosímil un perímetro inventado (HALLAZGO 2).
 *
 * DÓNDE VIVE EL CÁLCULO — no hay motor aparte: un único `useMemo` de app/…/page.tsx con un
 * switch por figura. La entrada la lee parseSpanishNumber() de @/lib (parser canónico), y los
 * campos son <NumberInput>, que es type="text" + inputMode="decimal": el navegador NO
 * normaliza lo tecleado, así que el «0,125 → 0.125 → 125» que muerde a las apps con
 * type="number" aquí no puede darse. Comprobado igualmente (CASO 4.bis).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — círculo de radio 10
 *       Área = πr² = 100π = 314,159265358979… → «314,1593»
 *       Perímetro = 2πr = 20π = 62,83185307… → «62,8319»
 *       Diámetro = 2r = 20
 *       Elegido con resultado cerrado a propósito: 100π y 20π se comprueban a mano, y su
 *       cociente ha de ser exactamente r/2 = 5 (invariante área↔perímetro del círculo).
 *
 *   CASO 1.bis (invariantes con resultado exacto, para que el redondeo no tape nada)
 *       · Esfera r = 3 → V = (4/3)π·27 = 36π  y  S = 4π·9 = 36π. Los DOS son 113,0973:
 *         el único radio con V = S es r = 3, así que la igualdad prueba las dos fórmulas.
 *       · Rombo d₁ = 8, d₂ = 6 → A = 24; lado = √(4²+3²) = 5 (terna 3-4-5) → P = 4·5 = 20.
 *         Aquí perímetro y lado tienen que cuadrar entre sí: P = 4·lado, exacto.
 *       · Pirámide de base cuadrada l = 6, h = 4 → apotema lateral = √(3²+4²) = 5 (otra vez
 *         3-4-5), V = (1/3)·36·4 = 48, S = 36 + 4·(6·5/2) = 36 + 60 = 96.
 *       · Cono r = 3, h = 4 → generatriz = 5, V = 12π = 37,6991, S = 9π + 15π = 24π = 75,3982.
 *
 *   CASO 2 (límite) — cuadrado de lado 0 y de lado −5
 *       Un lado de 0 no es un cuadrado degenerado del que informar: es la ausencia de figura,
 *       y uno negativo no existe. En los dos la app debe callar, NO imprimir «Área 0,0000 u²»
 *       ni un área positiva por elevar al cuadrado el signo. Y «abc» no debe ni entrar.
 *
 *   CASO 3 (rechazo) — triángulo de base 8, altura 4 y lado 3
 *       El campo «Lado (opcional)» se anuncia «Para perímetro exacto» y el código lo duplica
 *       (P = b + 2·lado), o sea que son los dos lados iguales de un isósceles. Con base 8 eso
 *       da los lados 8-3-3, y 3 + 3 = 6 < 8: la desigualdad triangular lo prohíbe.
 *       No hace falta ni suponer isósceles: con base 8 y altura 4, CUALQUIER triángulo tiene
 *       los otros dos lados ≥ √(4²+4²) cada uno en el mejor caso (el isósceles minimiza la
 *       suma), luego P ≥ 8 + 2·5,656854 = 19,3137. Un perímetro de 14 es imposible.
 *       → La app debe rechazar el dato, no emitir cifra. HOY emite 14,0000 (HALLAZGO 1).
 *
 *   CASO 4 (el parseo) — cuadrado de lado «1.500»
 *       parseSpanishNumber lee el punto que parte el número en grupos de tres como millar:
 *       1500. Área = 1500² = 2.250.000 y perímetro = 6.000. Con el parseo casero
 *       parseFloat(x.replace(',', '.')) habría leído 1,5 y devuelto un área de 2,25 —un
 *       millón de veces menor— sin ningún aviso.
 *
 *   CASO 4.bis (el reverso, tecleado con el teclado) — círculo de radio «2,500»
 *       Tres decimales tecleados. Si el campo fuese type="number", el navegador lo habría
 *       normalizado a «2.500» y parseSpanishNumber leería 2500 (millar español). Como es
 *       type="text", el valor llega tal cual y la coma sola es decimal: r = 2,5.
 *       Área = π·6,25 = 19,634954… → «19,6350» · Diámetro = 5.
 *
 * LO QUE ESTÁ SANO (verificado en producción el 18/09/2026): las catorce figuras calculan
 * bien el área, el volumen y la superficie; los límites 0 y negativo se rechazan en todas; el
 * parser es el canónico y aguanta el millar con punto, el millar con coma y la coma decimal.
 *
 * LOS 5 HALLAZGOS del 18/09/2026, al final, ya como candados de regresión: se repararon ese
 * mismo día. El de fondo es el del triángulo: con base y altura el área está determinada pero
 * el perímetro NO —hay infinitos triángulos con esas dos medidas—, así que o se declara el
 * supuesto o se pide el dato que falta. Ahora hace las dos cosas según lo que se teclee.
 *
 * CABO C0386 (05/11/2026), al final: las 15 clases del bloque educativo que el .module.css no
 * declaraba. Hallazgo 4147, REPARADO en e6fbd112 el mismo día, con un caso hermano que
 * garantiza que los localizadores siguen encontrando lo que miden. Comprobado de nuevo el
 * 07/11/2026 (cabo C0386, modo cabo): escritorio y Pixel 7, claro y oscuro, en el último bloque.
 */

/** Texto de un nodo, con el espacio duro de Intl normalizado. */
async function texto(loc: Locator): Promise<string> {
  return ((await loc.textContent()) ?? '').replace(/ /g, ' ').trim();
}

/** El valor —con su unidad— de la tarjeta de resultado cuyo título es EXACTAMENTE ese. */
function tarjeta(page: Page, titulo: string): Locator {
  return page
    .locator('[role="status"] h3')
    .filter({ hasText: new RegExp(`^${titulo}$`) })
    .locator('xpath=../..')
    .locator('p')
    .first();
}

const resultado = (page: Page, titulo: string) => texto(tarjeta(page, titulo));

/** El aviso que sustituye a los resultados cuando la app no calcula nada. */
const sinResultados = (page: Page) =>
  page.locator('[role="status"]').getByText('Ingresa las medidas para calcular');

/** «14,0000u» → 14. Deshace el formato español para poder comparar magnitudes. */
function aNumero(valor: string): number {
  return Number(valor.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.'));
}

const campo = (etiqueta: string) => `input[aria-label="${etiqueta}"]`;

/** Escribe en un campo y comprueba que el estado de React lo recogió. */
async function escribir(page: Page, etiqueta: string, valor: string): Promise<void> {
  await page.fill(campo(etiqueta), valor);
  await esperarValorEnReact(page, campo(etiqueta), valor);
}

/**
 * Elige dimensión y figura. Las dos pulsaciones vacían los campos (`limpiar()`), así que
 * cualquier valor que se escriba después parte de vacío y MUEVE de verdad el estado.
 */
async function elegir(page: Page, dimension: '2D - Planas' | '3D - Sólidos', figura: string) {
  await page.getByRole('button', { name: dimension }).click();
  await page.getByRole('button', { name: figura }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/calculadora-geometria/');
  // La app arranca en 2D · Cuadrado, cuyo único campo es «Lado».
  await esperarHidratacion(page, [campo('Lado')]);
});

test.describe('Figuras planas (2D)', () => {
  test('CASO 1 · círculo de radio 10: 100π de área y 20π de perímetro', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Círculo');
    await escribir(page, 'Radio', '10');

    // Área = π·10² = 100π = 314,159265358979… → 4 decimales, formato español.
    expect(await resultado(page, 'Área')).toBe('314,1593 u²');
    // Circunferencia = 2π·10 = 20π = 62,83185307…
    expect(await resultado(page, 'Perímetro')).toBe('62,8319 u');
    expect(await resultado(page, 'Diámetro')).toBe('20,0000 u');

    // Invariante del círculo: área/perímetro = r/2 = 5, sea cual sea el radio.
    const area = aNumero(await resultado(page, 'Área'));
    const perimetro = aNumero(await resultado(page, 'Perímetro'));
    expect(area / perimetro).toBeCloseTo(5, 4);
  });

  test('CASO 1.bis · rombo 8×6: el perímetro cuadra con el lado que la app misma calcula', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Rombo');
    await escribir(page, 'Diagonal mayor', '8');
    await escribir(page, 'Diagonal menor', '6');

    // A = (d₁·d₂)/2 = 24 · lado = √(4²+3²) = 5 (terna 3-4-5) · P = 4·5 = 20
    expect(await resultado(page, 'Área')).toBe('24,0000 u²');
    expect(await resultado(page, 'Lado')).toBe('5,0000 u');
    expect(await resultado(page, 'Perímetro')).toBe('20,0000 u');
    expect(aNumero(await resultado(page, 'Perímetro')))
      .toBeCloseTo(4 * aNumero(await resultado(page, 'Lado')), 4);
  });

  test('CASO 1.ter · polígonos regulares: hexágono de lado 2 y pentágono de lado 5', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Hexágono');
    await escribir(page, 'Lado', '2');

    // Apotema = l√3/2 = √3 = 1,7320508… · P = 6·2 = 12 · A = (P·a)/2 = (3√3/2)·4 = 10,3923
    expect(await resultado(page, 'Apotema')).toBe('1,7321 u');
    expect(await resultado(page, 'Perímetro')).toBe('12,0000 u');
    expect(await resultado(page, 'Área')).toBe('10,3923 u²');

    await elegir(page, '2D - Planas', 'Pentágono');
    await escribir(page, 'Lado', '5');
    // Apotema = l/(2·tan(36°)) = 5/1,45308506 = 3,44095480… · P = 25 · A = (25·3,4409548)/2
    expect(await resultado(page, 'Apotema')).toBe('3,4410 u');
    expect(await resultado(page, 'Perímetro')).toBe('25,0000 u');
    expect(await resultado(page, 'Área')).toBe('43,0119 u²');
  });

  test('CASO 2 · lado 0 y lado negativo no producen número', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Cuadrado');

    await escribir(page, 'Lado', '0');
    // Ni «Área 0,0000 u²»: un lado de 0 no es una figura de la que informar.
    await expect(sinResultados(page)).toBeVisible();
    await expect(tarjeta(page, 'Área')).toHaveCount(0);

    // Y un lado negativo tampoco, aunque (−5)² sea un número perfectamente imprimible.
    await escribir(page, 'Lado', '-5');
    await expect(sinResultados(page)).toBeVisible();
    await expect(tarjeta(page, 'Área')).toHaveCount(0);
  });

  test('CASO 2.bis · lo que no es un número no llega ni a entrar en el campo', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Cuadrado');
    await escribir(page, 'Lado', '7');
    expect(await resultado(page, 'Área')).toBe('49,0000 u²');

    // El filtro de NumberInput sólo admite cifras, coma, punto y signo menos: React descarta
    // el cambio y restaura el valor anterior, así que el 49 de antes sigue en pantalla.
    await page.fill(campo('Lado'), 'abc');
    await esperarValorEnReact(page, campo('Lado'), '7');
    expect(await resultado(page, 'Área')).toBe('49,0000 u²');
  });

  test('CASO 4 · el separador de millar español se lee como millar, no como decimal', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Cuadrado');
    await escribir(page, 'Lado', '1.500');

    // 1.500² = 2.250.000 y 4·1.500 = 6.000. Con parseFloat(x.replace(',', '.')) el lado
    // habría valido 1,5 y el área 2,25: un millón de veces menos, sin ningún aviso.
    // es-ES no agrupa los millares de cuatro cifras, de ahí «6000,0000».
    expect(await resultado(page, 'Área')).toBe('2.250.000,0000 u²');
    expect(await resultado(page, 'Perímetro')).toBe('6000,0000 u');
  });

  test('CASO 4.bis · tres decimales TECLEADOS no se convierten en millar', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Círculo');

    // Se teclea letra a letra a propósito: el defecto que se busca aquí lo introduce el
    // NAVEGADOR al normalizar un type="number" («2,500» → «2.500»), y sembrar el valor lo
    // saltaría. Este campo es type="text" + inputMode="decimal", así que no normaliza.
    const radio = page.locator(campo('Radio'));
    await radio.click();
    await radio.pressSequentially('2,500', { delay: 20 });
    await esperarValorEnReact(page, campo('Radio'), '2,500');

    // r = 2,5 → A = π·6,25 = 19,63495408… y diámetro 5. Si se hubiera leído 2500, el área
    // sería 19.634.954,08 u²: un millón de veces mayor.
    expect(await resultado(page, 'Área')).toBe('19,6350 u²');
    expect(await resultado(page, 'Diámetro')).toBe('5,0000 u');
  });

  test('triángulo con un lado COHERENTE con la base y la altura', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Triángulo');
    await escribir(page, 'Base', '6');
    await escribir(page, 'Altura', '4');
    await escribir(page, 'Lado (opcional)', '5');

    // Isósceles de base 6 y lados 5: su altura es √(5²−3²) = 4, o sea que el dato encaja.
    // A = (6·4)/2 = 12 · P = 6 + 2·5 = 16.
    expect(await resultado(page, 'Área')).toBe('12,0000 u²');
    expect(await resultado(page, 'Perímetro')).toBe('16,0000 u');
  });
});

test.describe('Sólidos (3D)', () => {
  test('CASO 1.bis · esfera de radio 3: volumen y superficie valen los dos 36π', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Esfera');
    await escribir(page, 'Radio', '3');

    // V = (4/3)π·27 = 36π = 113,09733552… · S = 4π·9 = 36π. r = 3 es el único radio con
    // V = S, así que la coincidencia prueba las dos fórmulas a la vez.
    expect(await resultado(page, 'Volumen')).toBe('113,0973 u³');
    expect(await resultado(page, 'Superficie Total')).toBe('113,0973 u²');
  });

  test('CASO 1.bis · cono 3-4-5: generatriz exacta, volumen 12π y superficie 24π', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Cono');
    await escribir(page, 'Radio de la base', '3');
    await escribir(page, 'Altura', '4');

    // g = √(3²+4²) = 5 · V = (1/3)·9π·4 = 12π = 37,69911184…
    // Lateral = πrg = 15π = 47,12388980… · S = 9π + 15π = 24π = 75,39822369…
    expect(await resultado(page, 'Generatriz')).toBe('5,0000 u');
    expect(await resultado(page, 'Volumen')).toBe('37,6991 u³');
    expect(await resultado(page, 'Área Lateral')).toBe('47,1239 u²');
    expect(await resultado(page, 'Superficie Total')).toBe('75,3982 u²');
  });

  test('CASO 1.bis · pirámide de base 6 y altura 4: V = 48 y S = 96, exactos', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Pirámide');
    await escribir(page, 'Lado de la base', '6');
    await escribir(page, 'Altura', '4');

    // Apotema lateral = √(3²+4²) = 5 · base = 36 · lateral = 4·(6·5)/2 = 60
    // V = (1/3)·36·4 = 48 · S = 36 + 60 = 96
    expect(await resultado(page, 'Volumen')).toBe('48,0000 u³');
    expect(await resultado(page, 'Área Base')).toBe('36,0000 u²');
    expect(await resultado(page, 'Superficie Total')).toBe('96,0000 u²');
  });

  test('cubo de lado 3 y prisma 3×4×10', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Cubo');
    await escribir(page, 'Lado', '3');
    // V = 27 · S = 6·9 = 54 · diagonal espacial = 3√3 = 5,19615242…
    expect(await resultado(page, 'Volumen')).toBe('27,0000 u³');
    expect(await resultado(page, 'Superficie Total')).toBe('54,0000 u²');
    expect(await resultado(page, 'Diagonal Espacial')).toBe('5,1962 u');

    await elegir(page, '3D - Sólidos', 'Prisma');
    await escribir(page, 'Base', '3');
    await escribir(page, 'Altura de la base', '4');
    await escribir(page, 'Profundidad', '10');
    // Caja de 3×4×10 → V = 120 · S = 2(3·4 + 3·10 + 4·10) = 2·82 = 164
    expect(await resultado(page, 'Volumen')).toBe('120,0000 u³');
    expect(await resultado(page, 'Superficie Total')).toBe('164,0000 u²');
  });

  test('CASO 2 · un sólido con una medida a cero deja de producir número', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Cilindro');
    await escribir(page, 'Radio', '5');
    await escribir(page, 'Altura', '4');
    // V = π·25·4 = 100π = 314,15926536… · S = 2π·25 + 2π·5·4 = 90π = 282,74333882…
    expect(await resultado(page, 'Volumen')).toBe('314,1593 u³');
    expect(await resultado(page, 'Superficie Total')).toBe('282,7433 u²');

    // Y al bajar la altura a 0 los resultados tienen que DESAPARECER: un cilindro de altura
    // cero es un disco, no un sólido del que dar volumen.
    await escribir(page, 'Altura', '0');
    await expect(sinResultados(page)).toBeVisible();
    await expect(tarjeta(page, 'Volumen')).toHaveCount(0);
  });
});

test.describe('Los 5 hallazgos del 18/09/2026, reparados el mismo día', () => {
  // Ya son candados de regresión. Cada uno conserva escrito lo que la app hacía antes y con
  // qué medida se demostró; el 906 explica además por qué NO se reparó como pedía el acta.

  test('903 · el triángulo imposible se rechaza en vez de publicar un perímetro', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Triángulo');
    await escribir(page, 'Base', '8');
    await escribir(page, 'Altura', '4');
    await escribir(page, 'Lado (opcional)', '3');

    // El código hacía P = b + 2·l, o sea que tomaba el lado dado como los DOS lados iguales:
    // 8-3-3, y 3 + 3 = 6 < 8, que la desigualdad triangular prohíbe. Publicaba 14,0000 u, por
    // debajo incluso del mínimo geométrico de cualquier triángulo con esa base y esa altura
    // (el isósceles, 8 + 2·√(4²+4²) = 19,3137), en un campo que se anuncia «para perímetro
    // exacto». Ahora se rechaza por la razón exacta: ningún lado puede medir menos que la
    // altura que sostiene, y 3 < 4.
    await expect(page.locator('[role="status"]')).toContainText('Ingresa las medidas para calcular');
  });

  test('903.bis · con un lado posible, el perímetro es exacto y no una hipótesis', async ({ page }) => {
    // El 3-4-5 clásico, que es justo donde el supuesto del isósceles se veía mal: base 3,
    // altura 4 y lado 5 son un triángulo rectángulo de perímetro 12 exacto. El vértice está a
    // x = √(5² − 4²) = 3 de un extremo, así que el tercer lado mide √((3−3)² + 4²) = 4.
    await elegir(page, '2D - Planas', 'Triángulo');
    await escribir(page, 'Base', '3');
    await escribir(page, 'Altura', '4');
    await escribir(page, 'Lado (opcional)', '5');

    expect(await resultado(page, 'Área')).toBe('6,0000 u²');
    expect(await resultado(page, 'Perímetro')).toBe('12,0000 u');
    expect(await resultado(page, 'Tercer lado')).toBe('4,0000 u');
    // Y aquí NO hay supuesto que declarar, porque no se ha supuesto nada.
    await expect(page.locator('[class*="supuestoBox"]')).toHaveCount(0);
  });

  test('904 · el perímetro supuesto dice qué supone', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Triángulo');
    await escribir(page, 'Base', '3');
    await escribir(page, 'Altura', '4');

    // Con base y altura el área está determinada (6) pero el perímetro NO: hay infinitos
    // triángulos con esa base y esa altura. El código elige el isósceles —«Asumimos triángulo
    // isósceles», dice su comentario— y saca 3 + 2·√(1,5²+4²) = 11,5440 con cuatro decimales,
    // mientras la caja «Fórmulas aplicadas» enseña sólo «Área = (b×h)/2». Quien entre con el
    // triángulo rectángulo 3-4-5 (perímetro 12) se lleva 11,5440 y ninguna pista.
    // Lo mismo en el trapecio: B=10, b=6, h=4 → 24,9443 asumiendo lados laterales iguales,
    // cuando el trapecio rectángulo de esas mismas medidas mide 25,6569.
    expect(await resultado(page, 'Área')).toBe('6,0000 u²');
    await expect(page.locator('[role="status"]')).toContainText(/isósceles/i);
  });

  test('905 · el pentágono no acepta una apotema imposible', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Pentágono');
    await escribir(page, 'Lado', '5');
    await escribir(page, 'Apotema (opcional)', '100');

    // En un pentágono REGULAR la apotema la fija el lado: 5/(2·tan 36°) = 3,4410, y el área
    // sólo puede valer 43,0119 u². La app multiplica el perímetro por la apotema tecleada y
    // devuelve 1.250,0000 u², veintinueve veces más, sin avisar de nada. Una apotema de 100
    // con lado 5 exigiría un polígono de unos 126 lados.
    expect(aNumero(await resultado(page, 'Área'))).toBeLessThanOrEqual(43.02);
  });

  test('906 · el JSON-LD ya no promete lo que la app no tiene', async ({ page }) => {
    // Prometía tres cosas: «el perímetro si introduces los tres lados» —el triángulo pide
    // base, altura y UN lado—, «Visualización interactiva de cada figura» —no hay ni un svg
    // ni un canvas en toda la herramienta— y «Soporte para polígonos regulares e
    // irregulares», cuando pentágono y hexágono se calculan siempre como regulares. Es lo que
    // las IAs leen para fundamentar sus respuestas, así que la promesa falsa viajaba fuera de
    // la página.
    //
    // ⚠️ El «esperado» del acta apuntaba a AMPLIAR la app (tres campos de lado y un dibujo).
    // Se reparó al revés, que es lo que corresponde cuando lo que sobra es la promesa: el
    // texto describe ahora lo que la herramienta hace, incluido el perímetro exacto con un
    // solo lado, que sí existe desde el 903.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const todo = bloques.join(' ');
    expect(todo).not.toContain('si introduces los tres lados');
    expect(todo).not.toContain('Visualización interactiva de cada figura');
    expect(todo).not.toContain('polígonos regulares e irregulares');

    // Y lo que sí declara tiene que existir: el campo del lado del triángulo, uno solo.
    await elegir(page, '2D - Planas', 'Triángulo');
    await expect(page.locator('input[aria-label*="Lado"]')).toHaveCount(1);
    expect(await page.locator('[class*="mainContent"] svg, [class*="mainContent"] canvas').count()).toBe(0);
  });

  test('907 · los botones llevan type y el emoji del <h1> su aria-hidden', async ({ page }) => {
    // CLAUDE.md §5: todo <button> lleva type="button" y todo emoji junto a texto va en un
    // <span aria-hidden="true">. Once botones de esta página no declaran type (las dos
    // pestañas 2D/3D, las ocho figuras y «Limpiar») y el <h1> se lee «📐 Calculadora de
    // Geometría» con el emoji dentro. Es pasivo anterior al candado check:a11y-jsx, que sólo
    // juzga las líneas que un commit AÑADE; `node scripts/check-a11y-jsx.mjs
    // app/calculadora-geometria/page.tsx` lo lista entero (30 avisos, casi todos del bloque
    // educativo).
    const sinTipo = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((b) => !b.hasAttribute('type'))
        .map((b) => (b.textContent ?? '').trim().slice(0, 20)),
    );
    expect(sinTipo).toEqual([]);
    await expect(page.locator('h1 span[aria-hidden="true"]')).toHaveCount(1);
  });
});

test.describe('Cabo C0386 (05/11/2026) · las 15 clases del bloque educativo sin declarar', () => {
  // REPARADO (hallazgo 4147, e6fbd112, 05/11/2026): las 15 clases ya están declaradas en el
  // módulo. Lo que sigue describe lo que se midió ANTES de reparar.
  //
  // page.tsx usaba 15 clases que CalculadoraGeometria.module.css no declaraba, todas dentro de
  // <EducationalSection>: comparisonTable (l. 642), tableRow (643-715, 10 filas), tableHeader
  // (644-646), tableCell (650-716, 27 celdas), faqList (670, 684 y una por pregunta), faqItem,
  // faqQuestion y faqAnswer (798-894, 8 preguntas), stepByStep (915), step, stepNumber y
  // stepContent (916-985, 7 pasos), warningBox (1059), warningIntro (1061) y warningCard
  // (1067-1148, 8 tarjetas). `styles.x` vale undefined y React no escribe el atributo class:
  // 80 <div> y 10 <ul> de la guía salen sin class, y el reset global (* { margin: 0; padding: 0 })
  // les quita además los márgenes.
  //
  // Lo que se VE, medido el 05/11/2026 a 1280 y 390 px, en claro y en oscuro:
  //   · La «Comparación Completa» 2D/3D deja de ser una tabla: 30 líneas de 16 px apiladas a
  //     todo el ancho, sin columnas, sin bordes y con 0 px entre filas. «Característica»,
  //     «Figuras 2D» y «Sólidos 3D» salen como tres líneas de texto normal (peso 400), y en la
  //     fila «Fórmula de Área» se leen seguidos los cuatro casos de 2D y «No aplica (usan
  //     volumen)», que es de la columna 3D: qué valor es de qué columna solo se saca contando.
  //     Es lo único que pierde información; lo demás es estético.
  //   · La FAQ: cada pregunta, a 16 px como el texto, va pegada (0 px) a la última viñeta de la
  //     anterior, sin separación entre las ocho.
  //   · Los pasos: el «1»…«7» es un número suelto en su propia línea, sin el círculo del patrón.
  //   · «Errores comunes»: sin caja de aviso, y las 8 tarjetas sin fondo, borde ni relleno, frente
  //     a las .contentCard de la misma página (fondo, borde izquierdo de 3 px y 16 px de relleno).
  // No desborda a 390 px (lo apilado no puede) ni se vuelve ilegible en oscuro: el texto hereda
  // el color del body, 10,77:1 sobre el #303030 de la guía (15,96:1 en claro).

  async function abrirGuia(page: Page): Promise<Locator> {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = page.locator('[data-guia-educativa]');
    await expect(guia.getByText('Característica', { exact: true })).toBeVisible();
    return guia;
  }

  test('C0386 · lo que mide el caso del 4147 (REPARADO) está en la guía y se ve', async ({ page }) => {
    // Caso hermano, en verde antes y después de reparar. Nació para que test.fail() no diera
    // por bueno un caso que fallase por perder sus anclas; con el 4147 REPARADO sigue sirviendo:
    // si el texto de la guía cambia, el fallo dice que cambió la guía, no la maqueta.
    const guia = await abrirGuia(page);
    await expect(guia.getByText('Figuras 2D', { exact: true })).toBeVisible();
    await expect(guia.getByText('Longitud y anchura (plano)', { exact: true })).toBeVisible();
    await expect(guia.getByText('Longitud, anchura y altura (espacio)', { exact: true })).toBeVisible();
    await expect(guia.locator('li', { hasText: 'Flashcards:' })).toBeVisible();
    await expect(
      guia.getByRole('heading', { name: '¿Cuándo uso π = 3,14 y cuándo dejo π sin aproximar?' }),
    ).toBeVisible();
  });

  test('HALLAZGO 4147 (05/11/2026, REPARADO) · C0386 · la tabla 2D/3D sale en tres columnas y la FAQ con separación', async ({
    page,
  }) => {
    // Esperado: maquetado como el resto del catálogo (cada fila una rejilla de tres columnas,
    // cada pregunta separada de la anterior). Obtenido el 05/11/2026: 90 div/ul sin class, la
    // celda 2D y la 3D de «Dimensiones» una debajo de otra (y = 699 y 725, x = 57 las dos) y 0 px
    // entre la última viñeta de una pregunta y la siguiente. REPARADO el mismo día en /reparar:
    // las 15 clases declaradas en CalculadoraGeometria.module.css.
    const guia = await abrirGuia(page);

    // 1. Ningún <div> ni <ul> de la guía sin class (hoy 90: 80 div y 10 ul).
    const sinClase = await guia.locator('div:not([class]), div[class=""], ul:not([class]), ul[class=""]').count();
    expect.soft(sinClase, 'div/ul de la guía sin atributo class').toBe(0);

    // 2. Las dos celdas de la fila «Dimensiones» en la misma línea, la 3D a la derecha de la 2D
    //    (viewport de escritorio, 1280 px).
    const c2d = await guia.getByText('Longitud y anchura (plano)', { exact: true }).boundingBox();
    const c3d = await guia.getByText('Longitud, anchura y altura (espacio)', { exact: true }).boundingBox();
    expect.soft(Math.abs((c2d?.y ?? 0) - (c3d?.y ?? 9999)), 'celdas 2D y 3D en la misma fila').toBeLessThanOrEqual(2);
    expect.soft((c3d?.x ?? 0) - (c2d?.x ?? 0), 'la celda 3D, en su columna a la derecha').toBeGreaterThan(50);

    // 3. Separación visible entre una pregunta de la FAQ y la anterior (hoy 0 px).
    const li = await guia.locator('li', { hasText: 'Flashcards:' }).boundingBox();
    const h4 = await guia
      .getByRole('heading', { name: '¿Cuándo uso π = 3,14 y cuándo dejo π sin aproximar?' })
      .boundingBox();
    expect.soft((h4?.y ?? 0) - ((li?.y ?? 0) + (li?.height ?? 0)), 'hueco entre preguntas de la FAQ').toBeGreaterThanOrEqual(8);

    // 4. Las tarjetas de «Errores comunes» con borde y relleno, como las .contentCard.
    const tarjetaError = guia.locator('h4', { hasText: 'Confundir Perímetro con Área' }).locator('xpath=..');
    const estilo = await tarjetaError.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { borde: parseFloat(cs.borderLeftWidth), relleno: parseFloat(cs.paddingLeft) };
    });
    expect.soft(estilo.borde, 'borde de la tarjeta de error').toBeGreaterThanOrEqual(1);
    expect.soft(estilo.relleno, 'relleno de la tarjeta de error').toBeGreaterThanOrEqual(8);
  });

  test('HALLAZGO 4147 · a 390 px la tabla sigue en tres columnas sin desbordar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const guia = await abrirGuia(page);
    const c2d = await guia.getByText('Longitud y anchura (plano)', { exact: true }).boundingBox();
    const c3d = await guia.getByText('Longitud, anchura y altura (espacio)', { exact: true }).boundingBox();
    expect(Math.abs((c2d?.y ?? 0) - (c3d?.y ?? 9999))).toBeLessThanOrEqual(2);
    const anchoDoc = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(anchoDoc).toBeLessThanOrEqual(390);
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// Cabo C0386, hallazgo 4147 · comprobación puntual del 07/11/2026: ¿se sostiene e6fbd112?
// ───────────────────────────────────────────────────────────────────────────────
/**
 * Esperado, de la estructura de page.tsx (l. 642-720 y 795-897) y de la propia reparación:
 *   · La «Comparación Completa» lleva class y tiene 10 filas (cabecera + 9), cada una con class
 *     y TRES celdas que comparten la misma coordenada vertical, con la x creciendo de izquierda
 *     a derecha. Antes de reparar, la 2D y la 3D de «Dimensiones» estaban una debajo de otra.
 *   · 0 <div>/<ul> sin class en la guía (eran 80 div y 10 ul). Lo que queda sin class son h2,
 *     h3, h4, p y li, que el módulo pinta por selector descendiente (.contentCard p…).
 *   · Las 10 listas de la guía (2 de la tabla y 8 de la FAQ) con su sangría, y las 8 preguntas
 *     de la FAQ en tarjeta con borde y separadas de la siguiente.
 *   · Contraste del texto de la tabla ≥ 4,5:1 (WCAG 2.x, texto pequeño), calculado a mano antes
 *     de medir:
 *       claro  — celda #666666 sobre la fila alterna #F5F5F5: 5,27:1 (sobre #FFFFFF, 5,74:1);
 *                cabecera #FFFFFF sobre --primary-boton #26718F: 5,47:1.
 *       oscuro — celda #B0B0B0 sobre la fila alterna: con el --hover #383838 de globals saldría
 *                5,41:1, pero el módulo lo redeclara #333333 en oscuro → 5,83:1 (sobre el
 *                #2D2D2D de la tabla, 6,36:1); cabecera, 5,47:1 igual.
 * Medido el 07/11/2026, igual a 1280 px y en Pixel 7: mínimo 5,27 en claro y 5,47 en oscuro.
 */
interface MedidaGuia {
  claseTabla: string;
  filas: { clase: string; n: number; tops: number[]; lefts: number[] }[];
  divUlSinClase: number;
  listas: { clase: string; sangria: number }[];
  preguntas: { clase: string; borde: number }[];
  huecosFaq: number[];
  contrasteMin: { texto: string; ratio: number };
  anchoDoc: number;
}

async function medirGuia(page: Page): Promise<MedidaGuia> {
  return page.locator('[data-guia-educativa]').evaluate((guia): MedidaGuia => {
    const leer = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    };
    const sobre = (a: number[], b: number[]): number[] =>
      [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
    const fondo = (el: Element): number[] => {
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = leer(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) capas.push(c);
        if (c[3] >= 1) break;
      }
      return capas.reverse().reduce((res, capa) => sobre(capa, res), [255, 255, 255, 1]);
    };
    const lum = (c: number[]): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const ratio = (el: Element): number => {
      const bg = fondo(el);
      const fg = sobre(leer(getComputedStyle(el).color), bg);
      const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
    };

    // La tabla se busca por su texto, no por su class: si la class volviera a faltar, la
    // medida tiene que decirlo en vez de no encontrar nada.
    const cabecera = [...guia.querySelectorAll('div')].find((d) => (d.textContent ?? '').trim() === 'Característica');
    const tabla = cabecera?.parentElement?.parentElement;
    if (!tabla) throw new Error('no encuentro la tabla 2D/3D (celda «Característica»)');
    const filas = [...tabla.children].map((f) => {
      const rects = [...f.children].map((c) => c.getBoundingClientRect());
      return {
        clase: f.getAttribute('class') ?? '',
        n: rects.length,
        tops: rects.map((r) => Math.round(r.top)),
        lefts: rects.map((r) => Math.round(r.left)),
      };
    });
    const divUlSinClase = [...guia.querySelectorAll('div, ul')].filter((e) => !(e.getAttribute('class') ?? '').trim()).length;
    const listas = [...guia.querySelectorAll('ul')].map((u) => ({
      clase: u.getAttribute('class') ?? '',
      sangria: parseFloat(getComputedStyle(u).paddingLeft),
    }));
    const tarjetas = [...guia.querySelectorAll('h4')]
      .filter((h) => (h.textContent ?? '').trim().startsWith('¿'))
      .map((h) => h.parentElement as HTMLElement);
    const preguntas = tarjetas.map((t) => ({
      clase: t.getAttribute('class') ?? '',
      borde: parseFloat(getComputedStyle(t).borderTopWidth),
    }));
    const huecosFaq = tarjetas
      .slice(1)
      .map((t, i) => Math.round(t.getBoundingClientRect().top - tarjetas[i].getBoundingClientRect().bottom));
    let contrasteMin = { texto: '', ratio: 99 };
    for (const e of tabla.querySelectorAll('*')) {
      const tieneTexto = [...e.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim());
      if (!tieneTexto) continue;
      const r = ratio(e);
      if (r < contrasteMin.ratio) contrasteMin = { texto: (e.textContent ?? '').trim().slice(0, 40), ratio: r };
    }
    return {
      claseTabla: tabla.getAttribute('class') ?? '',
      filas,
      divUlSinClase,
      listas,
      preguntas,
      huecosFaq,
      contrasteMin,
      anchoDoc: document.documentElement.scrollWidth,
    };
  });
}

/** Sin overlay de Next ni transiciones, y dos lecturas seguidas iguales (receta de simulador-puertas-logicas). */
async function medirGuiaEstable(page: Page): Promise<MedidaGuia> {
  await page.addStyleTag({
    content: 'nextjs-portal { display: none !important; } *, *::before, *::after { animation: none !important; transition: none !important; }',
  });
  let previa = await medirGuia(page);
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(150);
    const actual = await medirGuia(page);
    if (JSON.stringify(actual) === JSON.stringify(previa)) return actual;
    previa = actual;
  }
  throw new Error('la medida de la guía no se estabiliza');
}

/** Tema oscuro con el conmutador de la propia web, no sembrando data-theme (el gestor lo pisa). */
async function ponerTema(page: Page, tema: 'claro' | 'oscuro'): Promise<void> {
  const html = page.locator('html');
  if (tema === 'claro') {
    await expect(html).not.toHaveAttribute('data-theme', 'dark');
    return;
  }
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(async () => {
    if ((await html.getAttribute('data-theme')) !== 'dark') {
      await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click({ timeout: 1000 });
    }
    await expect(html).toHaveAttribute('data-theme', 'dark', { timeout: 1000 });
  }).toPass({ timeout: 15000 });
}

async function comprobarGuiaMaquetada(page: Page, tema: 'claro' | 'oscuro'): Promise<void> {
  await ponerTema(page, tema);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.locator('[data-guia-educativa]').getByText('Característica', { exact: true })).toBeVisible();
  const m = await medirGuiaEstable(page);
  const anchoVista = page.viewportSize()?.width ?? 0;

  expect(m.claseTabla, 'la tabla 2D/3D lleva class').toMatch(/comparisonTable/);
  expect(m.filas, 'cabecera + 9 filas').toHaveLength(10);
  for (const [i, f] of m.filas.entries()) {
    expect.soft(f.clase, `fila ${i}: class`).toMatch(/tableRow/);
    expect.soft(f.n, `fila ${i}: tres celdas`).toBe(3);
    expect.soft(Math.max(...f.tops) - Math.min(...f.tops), `fila ${i}: las tres celdas a la misma altura (${f.tops.join(', ')})`).toBeLessThanOrEqual(1);
    expect.soft(f.lefts[0] < f.lefts[1] && f.lefts[1] < f.lefts[2], `fila ${i}: columnas de izquierda a derecha (${f.lefts.join(', ')})`).toBe(true);
  }
  expect.soft(m.divUlSinClase, '<div>/<ul> de la guía sin class (eran 80 + 10)').toBe(0);
  expect.soft(m.listas, 'las 10 listas de la guía').toHaveLength(10);
  for (const [i, l] of m.listas.entries()) {
    expect.soft(l.clase, `lista ${i}: class`).toMatch(/faqList/);
    expect.soft(l.sangria, `lista ${i}: sangría`).toBeGreaterThanOrEqual(16);
  }
  expect.soft(m.preguntas, 'las 8 preguntas de la FAQ').toHaveLength(8);
  for (const [i, p] of m.preguntas.entries()) {
    expect.soft(p.clase, `pregunta ${i}: class`).toMatch(/faqItem/);
    expect.soft(p.borde, `pregunta ${i}: borde de la tarjeta`).toBeGreaterThanOrEqual(1);
  }
  for (const [i, h] of m.huecosFaq.entries()) {
    expect.soft(h, `hueco entre la pregunta ${i} y la ${i + 1}`).toBeGreaterThanOrEqual(8);
  }
  expect
    .soft(m.contrasteMin.ratio, `contraste mínimo del texto de la tabla en ${tema} («${m.contrasteMin.texto}»)`)
    .toBeGreaterThanOrEqual(4.5);
  expect.soft(m.anchoDoc, 'sin desbordamiento horizontal').toBeLessThanOrEqual(anchoVista);
}

test.describe('Cabo C0386, hallazgo 4147 (07/11/2026) · escritorio: la reparación se sostiene', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  for (const tema of ['claro', 'oscuro'] as const) {
    test(`4147 · ${tema}: tabla 2D/3D en tres columnas, FAQ en tarjetas y texto de la tabla ≥ 4,5:1`, async ({ page }) => {
      await comprobarGuiaMaquetada(page, tema);
    });
  }
});

test.describe('Cabo C0386, hallazgo 4147 (07/11/2026) · Pixel 7: la reparación se sostiene', () => {
  // Enumerado y no `...devices['Pixel 7']`: este arrastra defaultBrowserType, que es de worker.
  const pixel7 = devices['Pixel 7'];
  test.use({
    viewport: pixel7.viewport,
    userAgent: pixel7.userAgent,
    deviceScaleFactor: pixel7.deviceScaleFactor,
    isMobile: pixel7.isMobile,
    hasTouch: pixel7.hasTouch,
  });
  for (const tema of ['claro', 'oscuro'] as const) {
    test(`4147 · ${tema}: tabla 2D/3D en tres columnas, FAQ en tarjetas y texto de la tabla ≥ 4,5:1`, async ({ page }) => {
      await comprobarGuiaMaquetada(page, tema);
    });
  }
});
