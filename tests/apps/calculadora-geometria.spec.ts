import { test, expect, Locator, Page } from '@playwright/test';
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
    expect(await resultado(page, 'Área')).toBe('314,1593u²');
    // Circunferencia = 2π·10 = 20π = 62,83185307…
    expect(await resultado(page, 'Perímetro')).toBe('62,8319u');
    expect(await resultado(page, 'Diámetro')).toBe('20,0000u');

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
    expect(await resultado(page, 'Área')).toBe('24,0000u²');
    expect(await resultado(page, 'Lado')).toBe('5,0000u');
    expect(await resultado(page, 'Perímetro')).toBe('20,0000u');
    expect(aNumero(await resultado(page, 'Perímetro')))
      .toBeCloseTo(4 * aNumero(await resultado(page, 'Lado')), 4);
  });

  test('CASO 1.ter · polígonos regulares: hexágono de lado 2 y pentágono de lado 5', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Hexágono');
    await escribir(page, 'Lado', '2');

    // Apotema = l√3/2 = √3 = 1,7320508… · P = 6·2 = 12 · A = (P·a)/2 = (3√3/2)·4 = 10,3923
    expect(await resultado(page, 'Apotema')).toBe('1,7321u');
    expect(await resultado(page, 'Perímetro')).toBe('12,0000u');
    expect(await resultado(page, 'Área')).toBe('10,3923u²');

    await elegir(page, '2D - Planas', 'Pentágono');
    await escribir(page, 'Lado', '5');
    // Apotema = l/(2·tan(36°)) = 5/1,45308506 = 3,44095480… · P = 25 · A = (25·3,4409548)/2
    expect(await resultado(page, 'Apotema')).toBe('3,4410u');
    expect(await resultado(page, 'Perímetro')).toBe('25,0000u');
    expect(await resultado(page, 'Área')).toBe('43,0119u²');
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
    expect(await resultado(page, 'Área')).toBe('49,0000u²');

    // El filtro de NumberInput sólo admite cifras, coma, punto y signo menos: React descarta
    // el cambio y restaura el valor anterior, así que el 49 de antes sigue en pantalla.
    await page.fill(campo('Lado'), 'abc');
    await esperarValorEnReact(page, campo('Lado'), '7');
    expect(await resultado(page, 'Área')).toBe('49,0000u²');
  });

  test('CASO 4 · el separador de millar español se lee como millar, no como decimal', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Cuadrado');
    await escribir(page, 'Lado', '1.500');

    // 1.500² = 2.250.000 y 4·1.500 = 6.000. Con parseFloat(x.replace(',', '.')) el lado
    // habría valido 1,5 y el área 2,25: un millón de veces menos, sin ningún aviso.
    // es-ES no agrupa los millares de cuatro cifras, de ahí «6000,0000».
    expect(await resultado(page, 'Área')).toBe('2.250.000,0000u²');
    expect(await resultado(page, 'Perímetro')).toBe('6000,0000u');
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
    expect(await resultado(page, 'Área')).toBe('19,6350u²');
    expect(await resultado(page, 'Diámetro')).toBe('5,0000u');
  });

  test('triángulo con un lado COHERENTE con la base y la altura', async ({ page }) => {
    await elegir(page, '2D - Planas', 'Triángulo');
    await escribir(page, 'Base', '6');
    await escribir(page, 'Altura', '4');
    await escribir(page, 'Lado (opcional)', '5');

    // Isósceles de base 6 y lados 5: su altura es √(5²−3²) = 4, o sea que el dato encaja.
    // A = (6·4)/2 = 12 · P = 6 + 2·5 = 16.
    expect(await resultado(page, 'Área')).toBe('12,0000u²');
    expect(await resultado(page, 'Perímetro')).toBe('16,0000u');
  });
});

test.describe('Sólidos (3D)', () => {
  test('CASO 1.bis · esfera de radio 3: volumen y superficie valen los dos 36π', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Esfera');
    await escribir(page, 'Radio', '3');

    // V = (4/3)π·27 = 36π = 113,09733552… · S = 4π·9 = 36π. r = 3 es el único radio con
    // V = S, así que la coincidencia prueba las dos fórmulas a la vez.
    expect(await resultado(page, 'Volumen')).toBe('113,0973u³');
    expect(await resultado(page, 'Superficie Total')).toBe('113,0973u²');
  });

  test('CASO 1.bis · cono 3-4-5: generatriz exacta, volumen 12π y superficie 24π', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Cono');
    await escribir(page, 'Radio de la base', '3');
    await escribir(page, 'Altura', '4');

    // g = √(3²+4²) = 5 · V = (1/3)·9π·4 = 12π = 37,69911184…
    // Lateral = πrg = 15π = 47,12388980… · S = 9π + 15π = 24π = 75,39822369…
    expect(await resultado(page, 'Generatriz')).toBe('5,0000u');
    expect(await resultado(page, 'Volumen')).toBe('37,6991u³');
    expect(await resultado(page, 'Área Lateral')).toBe('47,1239u²');
    expect(await resultado(page, 'Superficie Total')).toBe('75,3982u²');
  });

  test('CASO 1.bis · pirámide de base 6 y altura 4: V = 48 y S = 96, exactos', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Pirámide');
    await escribir(page, 'Lado de la base', '6');
    await escribir(page, 'Altura', '4');

    // Apotema lateral = √(3²+4²) = 5 · base = 36 · lateral = 4·(6·5)/2 = 60
    // V = (1/3)·36·4 = 48 · S = 36 + 60 = 96
    expect(await resultado(page, 'Volumen')).toBe('48,0000u³');
    expect(await resultado(page, 'Área Base')).toBe('36,0000u²');
    expect(await resultado(page, 'Superficie Total')).toBe('96,0000u²');
  });

  test('cubo de lado 3 y prisma 3×4×10', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Cubo');
    await escribir(page, 'Lado', '3');
    // V = 27 · S = 6·9 = 54 · diagonal espacial = 3√3 = 5,19615242…
    expect(await resultado(page, 'Volumen')).toBe('27,0000u³');
    expect(await resultado(page, 'Superficie Total')).toBe('54,0000u²');
    expect(await resultado(page, 'Diagonal Espacial')).toBe('5,1962u');

    await elegir(page, '3D - Sólidos', 'Prisma');
    await escribir(page, 'Base', '3');
    await escribir(page, 'Altura de la base', '4');
    await escribir(page, 'Profundidad', '10');
    // Caja de 3×4×10 → V = 120 · S = 2(3·4 + 3·10 + 4·10) = 2·82 = 164
    expect(await resultado(page, 'Volumen')).toBe('120,0000u³');
    expect(await resultado(page, 'Superficie Total')).toBe('164,0000u²');
  });

  test('CASO 2 · un sólido con una medida a cero deja de producir número', async ({ page }) => {
    await elegir(page, '3D - Sólidos', 'Cilindro');
    await escribir(page, 'Radio', '5');
    await escribir(page, 'Altura', '4');
    // V = π·25·4 = 100π = 314,15926536… · S = 2π·25 + 2π·5·4 = 90π = 282,74333882…
    expect(await resultado(page, 'Volumen')).toBe('314,1593u³');
    expect(await resultado(page, 'Superficie Total')).toBe('282,7433u²');

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

    expect(await resultado(page, 'Área')).toBe('6,0000u²');
    expect(await resultado(page, 'Perímetro')).toBe('12,0000u');
    expect(await resultado(page, 'Tercer lado')).toBe('4,0000u');
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
    expect(await resultado(page, 'Área')).toBe('6,0000u²');
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
