import { test, expect, type Page } from '@playwright/test';
import {
  COLORES_NOMBRADOS,
  COLORES_BASE,
  buscarColores,
  colorPorHex,
  nombreDeColor,
} from '../../data/colores-nombrados';

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
