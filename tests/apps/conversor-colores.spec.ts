import { test, expect, type Page } from '@playwright/test';
import {
  COLORES_NOMBRADOS,
  COLORES_BASE,
  buscarColores,
  colorPorHex,
  nombreDeColor,
} from '../../data/colores-nombrados';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Convertidor de Colores — test de regresión (02/09/2026)
 *
 * Cubre las dos funciones añadidas ese día y el defecto que arrastraba el rótulo:
 *
 *  (a) ELEGIR POR NOMBRE. La tabla `data/colores-nombrados.ts` la comparten esta app y
 *      `identificador-color-camara`. Aquí se navega (nombre → color) y allí se calcula
 *      (color → nombre). Los casos de abajo prueban las dos direcciones sobre el módulo,
 *      sin navegador, porque son matemática y datos.
 *
 *  (b) DESCARGAR EL COLOR COMO IMAGEN. Lo único que promete esta función es que el archivo
 *      contenga EXACTAMENTE el color elegido, y eso no se puede comprobar mirando la
 *      interfaz: hay que descargar el fichero y leerle un píxel. Es lo que hace el caso 4.
 *
 *  (c) EL RÓTULO DEL NOMBRE. Hasta esa fecha era un diccionario de 14 HEX con coincidencia
 *      exacta: bastaba mover un slider para que dijera «Color personalizado». El caso 3
 *      fija que ya no ocurre.
 *
 * ⚠️ El caso 1 protege además a la app de cámara: `nombreDeColor()` opera SOLO sobre el
 * conjunto de cobertura (`basico: true`), así que añadir pigmentos a la tabla no puede
 * cambiar el nombre que aquella app da a un color. Si alguien marca `basico: true` en una
 * entrada nueva, este test y `identificador-color-camara.spec.ts` lo dicen.
 */

const RUTA = '/conversor-colores/';

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — LA TABLA COMPARTIDA (sin navegador)
// ═══════════════════════════════════════════════════════════════════════════

test('caso 1 · la tabla de colores es íntegra y el conjunto de cobertura no se ha movido', () => {
  // Ni HEX ni nombres repetidos: un duplicado haría que dos muestras distintas de la
  // parrilla llevaran al mismo sitio, o que `colorPorHex` devolviera la primera por azar.
  const hexes = COLORES_NOMBRADOS.map((c) => c.hex);
  const nombres = COLORES_NOMBRADOS.map((c) => c.nombre);
  expect(hexes.filter((h, i) => hexes.indexOf(h) !== i), 'HEX duplicados').toEqual([]);
  expect(nombres.filter((n, i) => nombres.indexOf(n) !== i), 'nombres duplicados').toEqual([]);

  // Formato canónico: almohadilla y mayúsculas. `colorPorHex` indexa por esta forma.
  for (const c of COLORES_NOMBRADOS) {
    expect(c.hex, `HEX de ${c.nombre}`).toMatch(/^#[0-9A-F]{6}$/);
  }

  // Todo color que NO es del conjunto de cobertura debe declarar de dónde sale su valor:
  // son pigmentos y nombres de uso común sin HEX canónico, y la interfaz lo muestra.
  const sinReferencia = COLORES_NOMBRADOS.filter((c) => !c.basico && !c.nota).map((c) => c.nombre);
  expect(sinReferencia, 'colores no básicos sin `nota` que declare la referencia').toEqual([]);

  // El conjunto de cobertura es el de la app de cámara, y son 48 desde el hallazgo 393.
  // Que crezca no es un error de por sí, pero obliga a revisar el test de aquella app:
  // cada entrada nueva le roba territorio a sus vecinas en el vecino más cercano.
  expect(COLORES_BASE.length, 'tamaño del conjunto de cobertura').toBe(48);
  expect(COLORES_NOMBRADOS.length).toBeGreaterThan(COLORES_BASE.length);
});

test('caso 1.bis · los cinco nombres que fija la app de cámara siguen saliendo igual', () => {
  // Mismos valores que `tests/apps/identificador-color-camara.spec.ts`, resueltos a mano
  // allí con la fórmula redmean. Se repiten aquí porque quien toque ESTA tabla no tiene
  // por qué saber que hay otra app viviendo de ella.
  expect(nombreDeColor(255, 0, 0)).toBe('Rojo');
  expect(nombreDeColor(128, 128, 128)).toBe('Gris');
  expect(nombreDeColor(46, 134, 171)).toBe('Azul petróleo');
  expect(nombreDeColor(70, 130, 180)).toBe('Azul acero');
  expect(nombreDeColor(0, 128, 0)).toBe('Verde');

  // Y un pigmento NO puede ganar el vecino más cercano, porque no está en la cobertura.
  // #CC7722 es «Ocre» exacto en la tabla, pero como nombre aproximado debe salir un
  // nombre corriente: a quien usa la app de cámara por daltonismo le sirve «Naranja
  // tostado», no «Ocre».
  expect(colorPorHex('#CC7722')?.nombre, 'Ocre existe en la tabla').toBe('Ocre');
  expect(COLORES_BASE.some((c) => c.nombre === 'Ocre'), 'Ocre NO está en la cobertura').toBe(false);
});

test('caso 1.ter · el buscador encuentra por nombre, alias y HEX', () => {
  const nombresDe = (q: string) => buscarColores(q).map((c) => c.nombre);

  // Alias sin tildes: es como se teclea de verdad.
  expect(nombresDe('lapislazuli')).toContain('Azul lapislázuli');
  expect(nombresDe('esmeralda')).toContain('Verde esmeralda');
  // «Oliva» se llama así, pero casi nadie la busca sin el «verde» delante.
  expect(nombresDe('verde oliva')).toContain('Oliva');
  // Alias latinoamericano.
  expect(nombresDe('durazno')).toContain('Melocotón');
  // Por HEX, con y sin almohadilla.
  expect(nombresDe('2e86ab')).toEqual(['Azul petróleo']);
  expect(nombresDe('#66023C')).toEqual(['Púrpura de Tiro']);
  // Y no inventa resultados.
  expect(nombresDe('zzzz')).toEqual([]);

  // Filtro por familia: acota de verdad, no solo reordena.
  const azules = buscarColores('', 'azul');
  expect(azules.length).toBeGreaterThan(5);
  expect(azules.every((c) => c.familia === 'azul')).toBe(true);
});

// ═══════════════════════════════════════════════════════════════════════════
// Utillaje de navegador
// ═══════════════════════════════════════════════════════════════════════════

const rotulo = (page: Page) => page.locator('[class*="colorInfo"]');
const campoHex = (page: Page) => page.getByPlaceholder('#000000');

/** Lee el color real de un píxel del archivo descargado, decodificándolo en el navegador. */
async function pixelDelArchivo(page: Page, bytes: Buffer, mime: string) {
  const b64 = bytes.toString('base64');
  return page.evaluate(
    async ({ b64, mime }) => {
      const url = `data:${mime};base64,${b64}`;
      const img = new Image();
      await new Promise((ok, ko) => {
        img.onload = ok;
        img.onerror = ko;
        img.src = url;
      });
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      // Una esquina y el centro: si el relleno no cubriera todo, se vería aquí.
      const esquina = ctx.getImageData(0, 0, 1, 1).data;
      const centro = ctx.getImageData(c.width >> 1, c.height >> 1, 1, 1).data;
      return {
        ancho: img.naturalWidth,
        alto: img.naturalHeight,
        esquina: [esquina[0], esquina[1], esquina[2], esquina[3]],
        centro: [centro[0], centro[1], centro[2], centro[3]],
      };
    },
    { b64, mime },
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — ELEGIR POR NOMBRE EN LA INTERFAZ
// ═══════════════════════════════════════════════════════════════════════════

test('caso 2 · buscar un color por su nombre lo carga en el convertidor', async ({ page }) => {
  await page.goto(RUTA);

  const buscador = page.getByLabel('Buscar un color por su nombre');
  await buscador.fill('ocre');

  // Solo queda una muestra y es la que se busca.
  const muestras = page.locator('[class*="nombresGrid"] button');
  await expect(muestras).toHaveCount(1);
  await muestras.first().click();

  // El color entra por los cuatro formatos, no solo en el HEX.
  await expect(campoHex(page)).toHaveValue('#CC7722');
  await expect(page.locator('code', { hasText: 'rgb(204, 119, 34)' })).toBeVisible();

  // Y el rótulo lo llama por su nombre EXACTO, sin «lo más parecido a»: el HEX está en la
  // tabla. Si dijera «Naranja tostado» estaríamos contradiciendo a la muestra que se acaba
  // de pulsar.
  await expect(rotulo(page)).toHaveText('Ocre');

  // La referencia del valor está a mano: son pigmentos sin HEX oficial y la app lo dice.
  await buscador.fill('lapisl');
  await expect(muestras.first()).toHaveAttribute('title', /Valor convencional/);
});

test('caso 2.bis · el filtro por familia acota y el buscador informa cuando no hay nada', async ({ page }) => {
  await page.goto(RUTA);
  const muestras = page.locator('[class*="nombresGrid"] button');
  const total = await muestras.count();
  expect(total).toBe(COLORES_NOMBRADOS.length);

  await page.getByRole('button', { name: 'Azules', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Azules', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const azules = await muestras.count();
  expect(azules).toBeLessThan(total);
  expect(azules).toBe(COLORES_NOMBRADOS.filter((c) => c.familia === 'azul').length);

  // Sin resultados se explica, en vez de dejar un hueco en blanco.
  await page.getByLabel('Buscar un color por su nombre').fill('zzzz');
  await expect(muestras).toHaveCount(0);
  await expect(page.getByText(/Ningún color con ese nombre/)).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — EL RÓTULO DEL NOMBRE YA NO SE APAGA AL TOCAR UN SLIDER
// ═══════════════════════════════════════════════════════════════════════════

test('caso 3 · el nombre sigue informando con un color cualquiera', async ({ page }) => {
  await page.goto(RUTA);

  // Arranque: #2E86AB está en la tabla, así que es nombre exacto.
  await expect(rotulo(page)).toHaveText('Azul petróleo');

  // Un HEX que NO está en la tabla. Antes daba «Color personalizado» y se acabó la
  // información; ahora da el más parecido, dicho como aproximación.
  await campoHex(page).fill('#2E86AC');
  await expect(rotulo(page)).toContainText('lo más parecido a');
  await expect(rotulo(page)).toContainText('Azul petróleo');

  // Un color inventado cualquiera: tiene que caer en la familia correcta, no en «Gris».
  await campoHex(page).fill('#7A3B9E');
  await expect(rotulo(page)).toContainText('lo más parecido a');
  await expect(rotulo(page), 'un morado debe recibir un nombre de morado').toContainText(
    /Morado|Violeta|Índigo|Lila/,
  );

  // Y en ningún caso vuelve el rótulo mudo de antes.
  await expect(rotulo(page)).not.toContainText('Color personalizado');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 4 — LA DESCARGA: EL ARCHIVO CONTIENE EL COLOR EXACTO
//
// Es la única verdad dura de esta función. Un PNG que se ve azul en la miniatura no
// prueba nada: lo que se promete es que el píxel sea EXACTAMENTE el HEX elegido.
// ═══════════════════════════════════════════════════════════════════════════

test('caso 4 · el PNG descargado tiene el color exacto, el tamaño pedido y el HEX en el nombre', async ({
  page,
}) => {
  await page.goto(RUTA);
  await campoHex(page).fill('#CC7722');

  // Tamaño móvil vertical: además comprueba que ancho y alto no se intercambian.
  await page.getByRole('button', { name: /Móvil/ }).click();
  await expect(page.getByText('color-CC7722-1080x1920.png')).toBeVisible();

  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar 1080 × 1920/ }).click(),
  ]);

  expect(descarga.suggestedFilename()).toBe('color-CC7722-1080x1920.png');

  const ruta = await descarga.path();
  const bytes = await import('node:fs').then((fs) => fs.promises.readFile(ruta));

  // Un color plano en PNG comprime a nada. Si esto se dispara, algo más se está pintando.
  expect(bytes.length, 'un color plano de 1080×1920 no debe pesar cientos de KB').toBeLessThan(200_000);

  const leido = await pixelDelArchivo(page, bytes, 'image/png');
  expect(leido.ancho).toBe(1080);
  expect(leido.alto).toBe(1920);
  // #CC7722 = rgb(204, 119, 34), opaco. EXACTO, no aproximado: es lo que promete el PNG.
  expect(leido.esquina).toEqual([204, 119, 34, 255]);
  expect(leido.centro).toEqual([204, 119, 34, 255]);
});

test('caso 4.bis · el nombre del archivo lleva el HEX FINAL, no el del color que se eligió', async ({
  page,
}) => {
  await page.goto(RUTA);

  // Se elige «Verde esmeralda» por su nombre…
  await page.getByLabel('Buscar un color por su nombre').fill('esmeralda');
  await page.locator('[class*="nombresGrid"] button').first().click();
  await expect(campoHex(page)).toHaveValue('#2ECC71');
  await expect(page.getByText('color-2ECC71-1920x1080.png')).toBeVisible();

  // …y después se retoca con un slider. El archivo NO puede seguir llamándose como el
  // color de partida: un «verde esmeralda» que ya no lo es engaña más que no poner nombre.
  await campoHex(page).fill('#1E8449');
  await expect(page.getByText('color-1E8449-1920x1080.png')).toBeVisible();

  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar 1920 × 1080/ }).click(),
  ]);
  expect(descarga.suggestedFilename()).toBe('color-1E8449-1920x1080.png');

  const bytes = await import('node:fs').then(async (fs) =>
    fs.promises.readFile((await descarga.path())!),
  );
  const leido = await pixelDelArchivo(page, bytes, 'image/png');
  expect(leido.centro).toEqual([30, 132, 73, 255]); // #1E8449
});

test('caso 4.ter · el tamaño a medida se acota y el aviso de JPEG dice la verdad', async ({ page }) => {
  await page.goto(RUTA);
  await campoHex(page).fill('#000080');

  await page.getByRole('button', { name: /A medida/ }).click();
  // Por rol, no por etiqueta: «Alto» también casa dentro de «Azul cobalto» de la parrilla.
  const ancho = page.getByRole('spinbutton', { name: 'Ancho' });
  const alto = page.getByRole('spinbutton', { name: 'Alto' });

  // Por encima del máximo se acota a 4096 (límite seguro de lienzo en móviles), y el
  // nombre del archivo muestra ya el valor acotado: lo que se anuncia es lo que se baja.
  await ancho.fill('99999');
  await alto.fill('5');
  await expect(page.getByText('color-000080-4096x16.png')).toBeVisible();

  // JPEG: la app debe advertir de que el color deja de ser exacto, porque es cierto.
  await page.getByRole('button', { name: /JPEG/ }).click();
  await expect(page.getByText(/ya no será exactamente #000080/)).toBeVisible();
  await expect(page.getByText('color-000080-4096x16.jpeg')).toBeVisible();

  // Y con PNG seleccionado, el aviso dice lo contrario: color exacto.
  await page.getByRole('button', { name: /PNG/ }).click();
  await expect(page.getByText(/conserva el color/)).toBeVisible();
});

test('caso 4.quater · descargar el color no manda nada a ningún servidor', async ({ page }) => {
  // La app promete «se genera en tu navegador». Se comprueba que la descarga no dispara
  // ninguna petición de salida que no sea GET de la propia página.
  const salidas: string[] = [];
  page.on('request', (r) => {
    if (r.method() !== 'GET') salidas.push(`${r.method()} ${r.url()}`);
  });

  await page.goto(RUTA);
  await expect(page.getByText(/no se envía a ningún servidor/)).toBeVisible();
  await campoHex(page).fill('#FFFFFF');

  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar 1920 × 1080/ }).click(),
  ]);
  expect(descarga.suggestedFilename()).toBe('color-FFFFFF-1920x1080.png');
  expect(salidas, 'la descarga debe resolverse entera en el navegador').toEqual([]);
});

// ═══════════════════════════════════════════════════════════════════════════
// INSPECTOR · 07/10/2026 — LA CONVERSIÓN EN SÍ
//
// Hasta aquí el spec cubría lo añadido el 02/09 (nombres y descarga). Lo que la app
// promete en su <h1> —convertir entre HEX, RGB, HSL y CMYK— no lo vigilaba nada. Los
// valores esperados se resolvieron A MANO con las fórmulas estándar antes de ejecutar la
// app (HSL: L = (máx+mín)/2, S = d/(máx+mín) si L ≤ 0,5 o d/(2−máx−mín) si no; CMYK:
// K = 1 − máx, C = (máx − R)/máx…), y cada caso deja el cálculo en su comentario.
//
// Los casos con `test.fail()` son HALLAZGOS ABIERTOS: describen lo que la app DEBERÍA
// hacer y hoy no hace. Al repararlos, quitar el `test.fail()` y pasar el comentario a
// pasado («REPARADO»).
// ═══════════════════════════════════════════════════════════════════════════

const CAMPO_HEX = 'input[placeholder="#000000"]';
/** Campos numéricos del panel de valores: 0 R · 1 G · 2 B · 3 H · 4 S · 5 L · 6 C · 7 M · 8 Y · 9 K */
const numero = (page: Page, i: number) =>
  page.locator('[class*="mainContent"] input[type="number"]').nth(i);
/** Las tres salidas de texto: 0 rgb() · 1 hsl() · 2 cmyk() */
const salida = (page: Page, i: number) => page.locator('[class*="codeOutput"]').nth(i);

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, [CAMPO_HEX]);
}

async function escribirHex(page: Page, valor: string) {
  await page.locator(CAMPO_HEX).fill(valor);
  await esperarValorEnReact(page, CAMPO_HEX, valor);
}

async function escribirNumero(page: Page, i: number, valor: number) {
  const campo = numero(page, i);
  await campo.fill(String(valor));
  await esperarValorEnReact(page, campo, valor);
}

async function esperarColor(
  page: Page,
  hex: string,
  rgb: string,
  hsl: string,
  cmyk: string,
) {
  await expect(salida(page, 0)).toHaveText(rgb);
  await expect(salida(page, 1)).toHaveText(hsl);
  await expect(salida(page, 2)).toHaveText(cmyk);
  await expect(page.locator(CAMPO_HEX)).toHaveValue(hex);
}

test.describe('Inspector · conversión (escritorio)', () => {
  test('I1 · normal · #7A3B9E → rgb(122, 59, 158) · hsl(278, 46%, 43%) · cmyk(23%, 63%, 0%, 38%)', async ({
    page,
  }) => {
    await abrir(page);
    // 7A = 122, 3B = 59, 9E = 158. máx 158, mín 59, d = 99.
    //   L = 217/510 = 0,4255 → 43 · S = 99/217 = 0,4562 → 46
    //   H = ((122−59)/99 + 4)/6 · 360 = (0,6364 + 4)/6 · 360 = 278,18 → 278
    //   K = 97/255 = 0,3804 → 38 · C = (158−122)/158 = 0,2278 → 23 · M = 99/158 = 0,6266 → 63 · Y = 0
    await escribirHex(page, '#7A3B9E');
    await esperarColor(page, '#7A3B9E', 'rgb(122, 59, 158)', 'hsl(278, 46%, 43%)', 'cmyk(23%, 63%, 0%, 38%)');
    await expect(page.locator('[class*="colorDisplay"]')).toHaveCSS('background-color', 'rgb(122, 59, 158)');
  });

  test('I1.bis · normal · por RGB (255, 128, 0) → #FF8000 · hsl(30, 100%, 50%) · cmyk(0%, 50%, 100%, 0%)', async ({
    page,
  }) => {
    await abrir(page);
    // Desde el arranque (46, 134, 171): los tres canales cambian.
    // L = 255/510 = 0,5 → 50 (no > 0,5, así que S = d/(máx+mín) = 255/255 → 100)
    // H = (128/255)/6 · 360 = 30,12 → 30 · K = 0 · M = 127/255 = 0,498 → 50 · Y = 100
    await escribirNumero(page, 0, 255);
    await escribirNumero(page, 1, 128);
    await escribirNumero(page, 2, 0);
    await esperarColor(page, '#FF8000', 'rgb(255, 128, 0)', 'hsl(30, 100%, 50%)', 'cmyk(0%, 50%, 100%, 0%)');
  });

  test('I1.ter · normal · por HSL (120, 100, 25) → #008000 · cmyk(100%, 0%, 100%, 50%)', async ({ page }) => {
    await abrir(page);
    // Desde el arranque hsl(198, 58%, 43%): los tres cambian.
    // q = 0,25 · 2 = 0,5 · p = 0 · R: t = 2/3 → p = 0 · G: t = 1/3 → q = 0,5 → 127,5 → 128 · B: t = 0 → 0
    // CMYK de (0, 128, 0): K = 127/255 = 0,498 → 50 · C = 1 → 100 · M = 0 · Y = 100
    await escribirNumero(page, 3, 120);
    await escribirNumero(page, 4, 100);
    await escribirNumero(page, 5, 25);
    await esperarColor(page, '#008000', 'rgb(0, 128, 0)', 'hsl(120, 100%, 25%)', 'cmyk(100%, 0%, 100%, 50%)');
  });

  test('I1.quater · normal · por CMYK (0, 100, 100, 0) → #FF0000 · hsl(0, 100%, 50%)', async ({ page }) => {
    await abrir(page);
    // Desde el arranque cmyk(73, 22, 0, 33): los cuatro cambian.
    // R = 255·(1−0)·(1−0) = 255 · G = 255·(1−1) = 0 · B = 0
    await escribirNumero(page, 6, 0);
    await escribirNumero(page, 7, 100);
    await escribirNumero(page, 8, 100);
    await escribirNumero(page, 9, 0);
    await esperarColor(page, '#FF0000', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)', 'cmyk(0%, 100%, 100%, 0%)');
  });

  test('I2 · límite · negro, blanco, gris puro (S = 0) y tono 360 = 0', async ({ page }) => {
    await abrir(page);
    // Negro: K = 1 − 0 = 1 → atajo de la fórmula a (0, 0, 0, 100).
    await escribirHex(page, '#000000');
    await esperarColor(page, '#000000', 'rgb(0, 0, 0)', 'hsl(0, 0%, 0%)', 'cmyk(0%, 0%, 0%, 100%)');
    // Blanco: máx = mín → S = 0 y H = 0; L = 1 → 100; K = 0 y C = M = Y = 0.
    await escribirHex(page, '#FFFFFF');
    await esperarColor(page, '#FFFFFF', 'rgb(255, 255, 255)', 'hsl(0, 0%, 100%)', 'cmyk(0%, 0%, 0%, 0%)');
    // Gris 128: L = 256/510 = 0,502 → 50 · K = 127/255 = 0,498 → 50 (los dos redondeos caen al 50).
    await escribirHex(page, '#808080');
    await esperarColor(page, '#808080', 'rgb(128, 128, 128)', 'hsl(0, 0%, 50%)', 'cmyk(0%, 0%, 0%, 50%)');

    // Tono 360 (el máximo del control) = rojo, igual que 0. Desde el gris: H 0 → 360, S 0 → 100.
    await escribirNumero(page, 3, 360);
    await escribirNumero(page, 4, 100);
    await esperarColor(page, '#FF0000', 'rgb(255, 0, 0)', 'hsl(360, 100%, 50%)', 'cmyk(0%, 100%, 100%, 0%)');
  });

  test('I2.bis · el FAQPage dice lo mismo que la app y que la tabla', async ({ page }) => {
    await abrir(page);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    // «#2E86AB … El resultado es RGB(46, 134, 171)»: 2E = 46, 86 = 134, AB = 171.
    expect(ld).toContain('RGB(46, 134, 171)');
    await expect(salida(page, 0)).toHaveText('rgb(46, 134, 171)');
    // «El ocre … #CC7722, el azul lapislázuli … #26619C y el verde oliva … #808000»
    expect(colorPorHex('#CC7722')?.nombre).toBe('Ocre');
    expect(colorPorHex('#26619C')?.nombre).toBe('Azul lapislázuli');
    expect(colorPorHex('#808000')?.nombre).toBe('Oliva');
    // «Buscador de 71 colores»
    expect(ld).toContain('Buscador de 71 colores');
    expect(COLORES_NOMBRADOS.length).toBe(71);
  });

  // ── Lo que debe rechazarse ───────────────────────────────────────────────

  test('I3 · rechazo · R = 300 no puede producir rgb(300…), saturación 218 % ni K negativo', async ({
    page,
  }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): los campos numéricos no acotan ni validan');
    await abrir(page);
    // Si no se acotara, con R = 300: r = 1,1765 · L = (1,1765 + 0,5255)/2 = 0,851 → 85
    //   S = 0,651/(2 − 1,702) = 2,184 → 218 % · K = 1 − 1,1765 = −0,176 → −18 %
    // y el HEX diría FF (255): cuatro formatos que no describen el mismo color.
    // Esperado: rechazar (se queda en 46) o acotar a 255 → rgb(255, 134, 171).
    await numero(page, 0).fill('300');
    await expect(salida(page, 0)).toHaveText(/^rgb\((46|255), 134, 171\)$/);
    await expect(salida(page, 2)).not.toContainText('-');
  });

  test('I3.bis · rechazo · K = 150 no puede dar RGB negativo', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): los campos numéricos no acotan ni validan');
    await abrir(page);
    // Con K = 1,5 la fórmula da (1 − K) = −0,5 → R = 255·0,27·(−0,5) = −34, G = −99, B = −127,
    // y de ahí hsl(18, −58 %, −32 %). Esperado: rechazar o acotar K a 100 → rgb(0, 0, 0).
    await numero(page, 9).fill('150');
    await expect(salida(page, 0)).not.toContainText('-');
    await expect(salida(page, 1)).not.toContainText('-');
  });

  test('I3.ter · rechazo · HEX pegado sin «#» (como lo copia Figma): o se acepta o se avisa', async ({
    page,
  }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): el campo HEX descarta en silencio lo que no es #RRGGBB');
    await abrir(page);
    await escribirHex(page, '#7A3B9E');
    // El FAQPage promete «basta con pegar el código HEX». 2E86AB → rgb(46, 134, 171).
    // Hoy el campo muestra 2E86AB y todo lo demás sigue en el morado anterior, sin aviso.
    await page.locator(CAMPO_HEX).fill('2E86AB');
    await expect
      .poll(
        async () =>
          (await salida(page, 0).textContent()) === 'rgb(46, 134, 171)' ||
          (await page.locator(CAMPO_HEX).getAttribute('aria-invalid')) === 'true',
        { message: 'el campo dice 2E86AB y los valores siguen en rgb(122, 59, 158), sin aviso' },
      )
      .toBe(true);
  });

  test('I3.quater · rechazo · «#GG0000» se rechaza CON aviso, no en silencio', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): el campo HEX descarta en silencio lo que no es #RRGGBB');
    await abrir(page);
    await page.locator(CAMPO_HEX).fill('#GG0000');
    // El color no debe cambiar (no hay color que mostrar)…
    await expect(salida(page, 0)).toHaveText('rgb(46, 134, 171)');
    // …pero el campo no puede quedarse diciendo «#GG0000» junto a un color que no es ese.
    await expect(page.locator(CAMPO_HEX)).toHaveAttribute('aria-invalid', 'true');
  });

  test('I3.quinquies · tecleo · vaciar R no escribe «0» ni cambia el color a medio teclear', async ({
    page,
  }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): setX(Number(e.target.value)) reescribe «0» en estados intermedios');
    await abrir(page);
    const r = numero(page, 0);
    await r.click();
    await r.press('End');
    for (let i = 0; i < 3; i++) await r.press('Backspace');
    // Hoy: Number('') = 0, el campo se rellena con «0» y el color salta a #0086AB.
    await expect(r).toHaveValue('');
    await expect(salida(page, 0)).toHaveText('rgb(46, 134, 171)');
  });

  test('I3.sexies · tecleo · «-5» pulsación a pulsación no se convierte en R = 5', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): setX(Number(e.target.value)) reescribe «0» en estados intermedios');
    await abrir(page);
    const r = numero(page, 0);
    await r.click();
    await r.press('Control+a');
    // «-» → el navegador entrega '' → Number('') = 0 → React escribe «0» → «5» → «05» → R = 5.
    // Esperado: un negativo se rechaza (R sigue en 46) o se acota a 0; nunca 5.
    await r.pressSequentially('-5');
    await expect(salida(page, 0)).toHaveText(/^rgb\((46|0), 134, 171\)$/);
  });

  // ── Accesibilidad ────────────────────────────────────────────────────────

  test('I4 · los 6 deslizadores y los 10 campos numéricos tienen nombre accesible', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): las <label> R/G/B/H/S/L/C/M/Y/K y HEX no están asociadas');
    await abrir(page);
    const arbol = await page.locator('[class*="mainContent"]').ariaSnapshot();
    const sinNombre = arbol
      .split('\n')
      .filter((l) => /^\s*- (slider|spinbutton)(?: \[[^\]]*\])?:/.test(l))
      .map((l) => l.trim());
    // Hoy salen 16 líneas «- slider: "46"», «- spinbutton: "46"»… sin decir de qué canal son.
    expect(sinNombre).toEqual([]);
    // Y el campo HEX se llama por su placeholder, «#000000».
    await expect(page.getByRole('textbox', { name: /hex/i })).toHaveCount(1);
  });

  test('I4.bis · cada botón de copiar dice QUÉ copia', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): «📋» y tres «📋 Copiar» indistinguibles');
    await abrir(page);
    for (const formato of ['HEX', 'RGB', 'HSL', 'CMYK']) {
      await expect(
        page.getByRole('button', { name: new RegExp(`copiar.*${formato}`, 'i') }),
        `botón de copiar ${formato}`,
      ).toHaveCount(1);
    }
  });

  test('I4.ter · ninguna región viva atómica envuelve controles', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): el panel entero es role=status aria-atomic=true');
    await abrir(page);
    // Con aria-atomic, cada paso de un deslizador re-anuncia el panel completo
    // (título, tres secciones, botones y las tres salidas).
    const controles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[aria-live][aria-atomic="true"]')).reduce(
        (n, el) => n + el.querySelectorAll('input, button').length,
        0,
      ),
    );
    expect(controles).toBe(0);
  });

  // ── Contenido ────────────────────────────────────────────────────────────

  test('I5 · el ejemplo «hover» del bloque educativo da el HEX que calcula la propia app', async ({
    page,
  }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): el texto dice #256A8A y hsl(198, 58%, 35%) es #256E8D');
    await abrir(page);
    // hsl(198, 58%, 35%): q = 0,35 · 1,58 = 0,553 · p = 0,147 · h = 0,55
    //   R: t = 0,883 → p = 0,147 → 37 = 25 · G: t = 0,55 → 0,147 + 0,406 · 0,7 = 0,4312 → 110 = 6E
    //   B: t = 0,217 → q = 0,553 → 141 = 8D  ⇒  #256E8D
    await escribirNumero(page, 5, 35);
    await expect(page.locator(CAMPO_HEX)).toHaveValue('#256E8D');
    await expect(page.locator('p', { hasText: 'solo reduces L' })).toContainText('#256E8D');
  });

  test('I5.bis · un PNG 4K de color plano: el tamaño que se promete es el que sale', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): «unos pocos KB aunque pidas 4K» y en Chromium pesa ~161 KB');
    await abrir(page);
    await escribirHex(page, '#7A3B9E');
    await page.getByRole('button', { name: /4K/ }).click();
    const [descarga] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Descargar 3840 × 2160/ }).click(),
    ]);
    const bytes = await import('node:fs').then(async (fs) =>
      fs.promises.readFile((await descarga.path())!),
    );
    // Medido el 07/10/2026: 164.955 bytes. «Unos pocos KB» se toma con holgura: < 20 KB.
    const aviso = (await page.locator('[class*="descargaAvisoFormato"]').textContent()) ?? '';
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    const prometePocos = /pocos KB/.test(aviso + ld);
    expect(prometePocos ? bytes.length : 0, 'la pantalla y el FAQPage prometen «unos pocos KB»').toBeLessThan(
      20_000,
    );
  });

  test('I5.ter · «Errores comunes»: el titular no dice lo contrario que su explicación', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): «Copiar HEX con el # al CSS» como error, y luego «verifica que el # esté»');
    await abrir(page);
    const item = page.locator('li', { hasText: 'Verifica que el # esté incluido' });
    await expect(item).toHaveCount(1);
    await expect(item).not.toContainText('Copiar HEX con el #');
  });

  test('I5.quater · la prosa del bloque educativo usa formato español', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): «4.5:1», «16.7M colores», «0-100%», «0%=gris»');
    await abrir(page);
    // Fuera los <code> y las funciones CSS citadas en el texto (hsl(198, 58%, 43%)): ahí
    // «58%» o «0.5» son sintaxis CSS, no prosa.
    const prosa = await page.locator('[class*="guideSection"]').evaluate((el) => {
      const copia = el.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('code').forEach((c) => c.remove());
      return (copia.textContent ?? '').replace(/(?:rgba?|hsla?)\([^)]*\)/g, '');
    });
    // Hoy: «16.7M» ×3 · «0-100%», «0%=gris», «100%=blanco»… ×7 · «4.5:1» ×3.
    expect(prosa.match(/\d\.\d+:1|\d+\.\d+M\b|\d%/g) ?? []).toEqual([]);
  });

  test('I5.quinquies · el código exportado no presenta un nombre aproximado como exacto', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): <h4>Morado</h4> para un color que la app llama «lo más parecido a Morado»');
    await abrir(page);
    await escribirHex(page, '#7A3B9E');
    await expect(page.locator('[class*="colorInfo"]')).toContainText('lo más parecido a');
    await page.getByRole('button', { name: 'Mostrar código' }).click();
    await expect(page.locator('[class*="codeBlock"]')).not.toContainText('<h4>Morado</h4>');
  });

  test('I5.sexies · el JSON-LD no promete deslizadores CMYK que no existen', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): «Sliders … HSL y CMYK» y CMYK solo tiene campos numéricos');
    await abrir(page);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    const prometeCmyk = /Sliders[^"]*CMYK/.test(ld);
    const slidersCmyk = await page.locator('[class*="cmykGrid"] input[type="range"]').count();
    expect(!prometeCmyk || slidersCmyk > 0, `promete sliders CMYK: ${prometeCmyk} · hay: ${slidersCmyk}`).toBe(true);
  });
});

test.describe('Inspector · móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('M1 · la conversión funciona igual a 390 px', async ({ page }) => {
    await abrir(page);
    await escribirHex(page, '#7A3B9E');
    await esperarColor(page, '#7A3B9E', 'rgb(122, 59, 158)', 'hsl(278, 46%, 43%)', 'cmyk(23%, 63%, 0%, 38%)');
  });

  test('M2 · nada se sale de la pantalla: ni el panel ni el botón de copiar el HEX', async ({ page }) => {
    test.fail(true, 'HALLAZGO ABIERTO (07/10/2026): .hexInputGroup (378 px de min-content) ensancha la columna 1fr a 443,7 px');
    await abrir(page);
    const medida = await page.evaluate(() => {
      const copiar = document.querySelector('[class*="hexInputGroup"] button')!.getBoundingClientRect();
      return {
        // html y body llevan overflow-x: hidden (globals.css): por eso
        // documentElement.scrollWidth da 390 y no delata nada. El desborde está en el body.
        html: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        copiarDerecha: Math.round(copiar.right),
      };
    });
    expect(medida.html).toBe(390);
    // Hoy: body 460 y el botón de copiar el HEX va de x = 374 a 427 (se ven 16 de 53 px).
    expect(medida.body, 'ancho del contenido').toBeLessThanOrEqual(390);
    expect(medida.copiarDerecha, 'borde derecho del botón Copiar HEX').toBeLessThanOrEqual(390);
  });
});
