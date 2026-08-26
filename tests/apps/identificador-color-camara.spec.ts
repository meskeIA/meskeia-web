import { test, expect, devices, type Page } from '@playwright/test';
import zlib from 'node:zlib';

/**
 * Identificador de Color por Cámara — test de regresión (Inspector, 26/08/2026)
 *
 * 57 usos reales, segmento «interactiva con cámara». Que use la cámara no la hace
 * inauditable: aquí hay DOS verdades comprobables y las dos se prueban abajo.
 *
 * QUÉ PROMETE (de donde salen los valores esperados de este fichero):
 *   - <h1> «🎨 Identificador de Color» + subtítulo: «descubre el nombre del color y sus
 *     códigos HEX, RGB y HSL en tiempo real. Pensado para daltonismo, baja visión y diseño».
 *   - metadata.ts → jsonLd.features: «Nombre del color en español calculado por vecino más
 *     cercano (distancia perceptual redmean)», «Códigos HEX, RGB y HSL con botón de copia»,
 *     «Modo imagen: sube una foto y toca cualquier punto para leer su color», «Procesamiento
 *     100% en el dispositivo: la cámara y las imágenes nunca salen del navegador».
 *   - FAQ: «¿Por qué la cámara trasera y no la frontal? La herramienta abre por defecto la
 *     cámara trasera» → la app debe pedir `facingMode: 'environment'`.
 *   - FAQ: «¿Se envían la cámara o las fotos a algún servidor? No.»
 *
 * (a) OPERATIVA DEL MEDIO: que la cámara arranque DE VERDAD. Que el <video> exista en el DOM
 *     no prueba nada; se exige `readyState >= 2`, `videoWidth > 0` y `paused === false`.
 *     Chromium arranca con `--use-fake-device-for-media-stream` (vídeo sintético) y
 *     `--use-fake-ui-for-media-stream` (concede el permiso sin diálogo).
 *
 * (b) CORRECCIÓN DEL COLOR: RGB → HEX → HSL → nombre es matemática exacta. El modo imagen
 *     permite FORZAR el píxel muestreado (se sube un PNG de color sólido generado aquí
 *     mismo), así que los valores esperados están resueltos a mano ANTES de ejecutar,
 *     no copiados de la salida.
 *
 * Todo el fichero corre en VIEWPORT MÓVIL (Pixel 7, 412 px), que es el uso real de la app.
 *
 * Los HALLAZGOS ABIERTOS van al final, marcados con `test.fail()`: afirman lo que la app
 * debería hacer y hoy fallan a propósito. El día que se reparen se pondrán en ROJO
 * («expected to fail, but passed») y habrá que quitarles la marca, quedando como regresión.
 */

test.use({
  ...devices['Pixel 7'],
  permissions: ['camera'],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
});

const RUTA = '/identificador-color-camara/';

// ═══════════════════════════════════════════════════════════════════════════
// Utillaje
// ═══════════════════════════════════════════════════════════════════════════

/** CRC-32 del PNG (polinomio 0xEDB88320), necesario para cerrar cada trozo. */
const TABLA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABLA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function trozo(tipo: string, datos: Buffer): Buffer {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length, 0);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo), 0);
  return Buffer.concat([largo, cuerpo, crc]);
}

/**
 * PNG de color sólido, RGB de 8 bits SIN canal alfa: así el navegador no premultiplica
 * nada y el píxel que lee la app es exactamente el que se pide aquí.
 * 120 × 90 px, por debajo del MAX_ANCHO_IMAGEN de la app (900), así que no se reescala.
 */
function pngSolido(r: number, g: number, b: number): Buffer {
  const ancho = 120;
  const alto = 90;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // profundidad de bits
  ihdr[9] = 2; // tipo de color 2 = RGB truecolor
  const filas: Buffer[] = [];
  for (let y = 0; y < alto; y++) {
    const fila = Buffer.alloc(1 + ancho * 3); // fila[0] = 0 → filtro None
    for (let x = 0; x < ancho; x++) {
      fila[1 + x * 3] = r;
      fila[2 + x * 3] = g;
      fila[3 + x * 3] = b;
    }
    filas.push(fila);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozo('IHDR', ihdr),
    trozo('IDAT', zlib.deflateSync(Buffer.concat(filas), { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

/** Estado real del medio. Se lee del elemento, no del DOM que lo envuelve. */
function estadoDelVideo(page: Page) {
  return page.evaluate(() => {
    const v = document.querySelector('video');
    if (!v) return null;
    return { readyState: v.readyState, ancho: v.videoWidth, alto: v.videoHeight, pausado: v.paused };
  });
}

/** La cámara simulada tarda unas décimas en entregar el primer fotograma. */
async function esperarCamaraEnMarcha(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const v = document.querySelector('video');
          return !!v && v.readyState >= 2 && v.videoWidth > 0 && !v.paused;
        }),
      { timeout: 15000, message: 'la cámara no llegó a entregar imagen' },
    )
    .toBe(true);
}

/** Sube el PNG al modo imagen y espera a que el lienzo tenga ya el tamaño de la foto. */
async function cargarFoto(page: Page, r: number, g: number, b: number) {
  await page.setInputFiles('input[type=file]', {
    name: 'color.png',
    mimeType: 'image/png',
    buffer: pngSolido(r, g, b),
  });
  await expect
    .poll(() => page.evaluate(() => document.querySelector<HTMLCanvasElement>('canvas[role=button]')?.width ?? 0), {
      timeout: 5000,
      message: 'la foto no llegó a dibujarse en el lienzo',
    })
    .toBe(120);
}

/** El valor visible de una fila de código (HEX / RGB / HSL): el 2.º span del botón. */
function valorDeCodigo(page: Page, etiqueta: 'HEX' | 'RGB' | 'HSL') {
  return page.locator(`section[aria-label="Color identificado"] button[aria-label^="Copiar código ${etiqueta}"] span`).nth(1);
}

const NOMBRE_COLOR = (page: Page) =>
  page.locator('section[aria-label="Color identificado"] > div').first();

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — VERDAD DURA DEL COLOR: RGB → HEX → HSL → nombre, con el píxel forzado
//
// Los cinco esperados están resueltos a mano ANTES de ejecutar, con las fórmulas del
// propio page.tsx (rgbAHex, rgbAHsl con Math.round, y nombreDeColor por distancia
// redmean de compuphase sobre la PALETA de 46 colores del fichero):
//
//  RGB(255,0,0)     → #FF0000 · HSL: l=0,5 → s=d/(max+min)=1 → 0°,100%,50%
//                   · redmean: «Rojo» #E01B24 d=8.407,5 gana a «Carmesí» #DC143C d=12.632,6
//  RGB(128,128,128) → #808080 · max=min → h=0, s=0; l=round(50,196)=50 → 0°,0%,50%
//                   · redmean: «Gris» #808080 d=0 (coincidencia exacta)
//  RGB(46,134,171)  → #2E86AB · h=(4+(rn-gn)/d)/6=0,549333 → 197,76° → round 198
//                   · s=0,490196/0,850980=0,576 → 58 · l=42,549 → 43 → 198°,58%,43%
//                   · redmean: «Verde azulado» #008080 d=9.939,8 gana a «Gris» d=20.788,2
//  RGB(70,130,180)  → #4682B4 · h=(4-0,545455)/6=0,575758 → 207,27° → 207
//                   · s=0,431373/0,980392=0,44 → 44 · l=49,0196 → 49 → 207°,44%,49%
//                   · redmean: «Gris» d=15.100,6 gana a «Verde azulado» d=18.217,8
//  RGB(0,128,0)     → #008000 · l=0,250980 → 25 · s=d/(max+min)=1 → 100 · h=120°
//                   · redmean: «Verde» #008000 d=0 (coincidencia exacta)
// ═══════════════════════════════════════════════════════════════════════════

const CASOS_COLOR = [
  { rgb: [255, 0, 0], hex: '#FF0000', rgbTexto: '255, 0, 0', hsl: '0°, 100%, 50%', nombre: 'Rojo' },
  { rgb: [128, 128, 128], hex: '#808080', rgbTexto: '128, 128, 128', hsl: '0°, 0%, 50%', nombre: 'Gris' },
  { rgb: [46, 134, 171], hex: '#2E86AB', rgbTexto: '46, 134, 171', hsl: '198°, 58%, 43%', nombre: 'Verde azulado' },
  // El nombre de este NO se afirma aquí: es un hallazgo abierto (ver al final del fichero).
  { rgb: [70, 130, 180], hex: '#4682B4', rgbTexto: '70, 130, 180', hsl: '207°, 44%, 49%', nombre: null },
  { rgb: [0, 128, 0], hex: '#008000', rgbTexto: '0, 128, 0', hsl: '120°, 100%, 25%', nombre: 'Verde' },
] as const;

test('caso 1 · el cuentagotas convierte RGB → HEX → HSL → nombre con exactitud', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('tab', { name: 'Desde una foto' }).click();

  for (const c of CASOS_COLOR) {
    await cargarFoto(page, c.rgb[0], c.rgb[1], c.rgb[2]);
    // El lienzo mide 120 × 90 y la foto es de color plano: cualquier punto sirve.
    await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });

    await expect(valorDeCodigo(page, 'HEX'), `HEX de rgb(${c.rgb.join(',')})`).toHaveText(c.hex);
    await expect(valorDeCodigo(page, 'RGB'), `RGB de ${c.hex}`).toHaveText(c.rgbTexto);
    await expect(valorDeCodigo(page, 'HSL'), `HSL de ${c.hex}`).toHaveText(c.hsl);
    if (c.nombre) await expect(NOMBRE_COLOR(page), `nombre de ${c.hex}`).toContainText(c.nombre);

    // El botón de copiar debe ofrecer el MISMO valor que se ve (si no, se copia otra cosa).
    await expect(page.getByRole('button', { name: `Copiar código HEX ${c.hex}` })).toBeVisible();
  }

  // Redondeo: enteros pelados. Ni «197,4°» ni «100.00 %» ni decimales de ningún tipo.
  await expect(valorDeCodigo(page, 'HSL')).toHaveText(/^\d{1,3}°, \d{1,3}%, \d{1,3}%$/);
  await expect(valorDeCodigo(page, 'HEX')).toHaveText(/^#[0-9A-F]{6}$/);

  // Historial: sin duplicados, el último delante y con tope de 8 (PALETA → slice(0, 8)).
  const historial = page.locator('section[aria-label="Colores recientes"] button');
  await expect(historial.first()).toHaveText('#008000');
  await expect(historial).toHaveCount(5); // los cinco colores del bucle, ninguno repetido
});

test('caso 1.bis · RGPD: la foto no sale del dispositivo', async ({ page }) => {
  // La FAQ y el jsonLd prometen «procesamiento 100% en el dispositivo». Se comprueba que
  // ninguna petición que no sea una descarga GET de la propia página sale del navegador.
  const salidas: string[] = [];
  page.on('request', (r) => {
    if (r.method() !== 'GET') salidas.push(`${r.method()} ${r.url()}`);
  });

  await page.goto(RUTA);
  // Lo dice en pantalla, no solo en el JSON-LD (el aviso se ve antes de elegir la foto).
  await expect(page.getByText(/nunca se envía a ningún servidor/i)).toBeVisible();
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await expect(page.getByText(/no se sube a ningún servidor/i)).toBeVisible();

  await cargarFoto(page, 46, 134, 171);
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#2E86AB');

  expect(salidas, 'la app no debe enviar la imagen a ningún servidor').toEqual([]);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — ARRANQUE DEL MEDIO EN MÓVIL (Pixel 7, 412 px)
// ═══════════════════════════════════════════════════════════════════════════

test('caso 2 · en móvil la cámara arranca de verdad, pide la trasera y se apaga del todo', async ({ page }) => {
  // Espía de getUserMedia: guarda las restricciones pedidas y el stream devuelto, para
  // poder comprobar después que los tracks quedan REALMENTE detenidos.
  await page.addInitScript(() => {
    // @ts-expect-error — almacén de la prueba, no del código de la app
    window.__constraints = [];
    // @ts-expect-error — idem
    window.__streams = [];
    const md = navigator.mediaDevices;
    const orig = md.getUserMedia.bind(md);
    md.getUserMedia = async (c?: MediaStreamConstraints) => {
      // @ts-expect-error — idem
      window.__constraints.push(JSON.parse(JSON.stringify(c)));
      const s = await orig(c);
      // @ts-expect-error — idem
      window.__streams.push(s);
      return s;
    };
  });

  await page.goto(RUTA);
  expect((await page.viewportSize())?.width, 'ancho del Pixel 7').toBe(412);

  await page.getByRole('button', { name: 'Activar cámara' }).click();
  await esperarCamaraEnMarcha(page);

  // (a) El medio entrega imagen de verdad: no basta con que el <video> exista.
  const medio = await estadoDelVideo(page);
  expect(medio!.readyState, 'readyState >= 2 (HAVE_CURRENT_DATA)').toBeGreaterThanOrEqual(2);
  expect(medio!.ancho, 'videoWidth > 0').toBeGreaterThan(0);
  expect(medio!.pausado).toBe(false);

  // La FAQ promete cámara TRASERA: «La herramienta abre por defecto la cámara trasera».
  const constraints = await page.evaluate(() => (window as unknown as { __constraints: MediaStreamConstraints[] }).__constraints);
  expect(constraints).toHaveLength(1);
  expect((constraints[0].video as MediaTrackConstraints).facingMode).toBe('environment');
  expect(constraints[0].audio, 'una app de color no debe pedir micrófono').toBe(false);

  // (b) Interfaz usable a 412 px: sin scroll horizontal y con los controles dentro.
  const layout = await page.evaluate(() => {
    const botones = [...document.querySelectorAll('section[aria-label="Cámara en vivo"] button')].map((b) => {
      const r = b.getBoundingClientRect();
      return { derecha: Math.round(r.right), alto: Math.round(r.height) };
    });
    return { scrollW: document.scrollingElement!.scrollWidth, innerW: window.innerWidth, botones };
  });
  expect(layout.scrollW, 'la página no debe desbordar a lo ancho en móvil').toBeLessThanOrEqual(layout.innerW + 1);
  expect(layout.botones).toHaveLength(2); // Congelar lectura + Apagar cámara
  for (const b of layout.botones) {
    expect(b.derecha, 'un control se sale del viewport').toBeLessThanOrEqual(layout.innerW);
    expect(b.alto, 'objetivo táctil por debajo de 44 px').toBeGreaterThanOrEqual(44);
  }

  // (c) Congelar fija la lectura: el valor deja de moverse aunque la cámara siga emitiendo.
  await expect(valorDeCodigo(page, 'HEX')).toHaveText(/^#[0-9A-F]{6}$/);
  await page.getByRole('button', { name: /Congelar lectura/ }).click();
  const congelado = await valorDeCodigo(page, 'HEX').textContent();
  await page.waitForTimeout(1500); // la cámara falsa cambia de color ~8 veces por segundo
  await expect(valorDeCodigo(page, 'HEX'), 'congelado no debe seguir cambiando').toHaveText(congelado!);
  // y la lectura fijada pasa al historial
  await expect(page.locator('section[aria-label="Colores recientes"] button').first()).toHaveText(congelado!);

  // (d) Apagar la cámara detiene los tracks DE VERDAD (si no, el piloto sigue encendido).
  await page.getByRole('button', { name: 'Apagar cámara' }).click();
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          (window as unknown as { __streams: MediaStream[] }).__streams.flatMap((s) =>
            s.getTracks().map((t) => t.readyState),
          ),
        ),
      { timeout: 5000, message: 'los tracks no llegaron a detenerse' },
    )
    .toEqual(['ended']);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Activar cámara' })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — PERMISO DENEGADO
//
// getUserMedia se sustituye por un rechazo con la excepción EXACTA que lanza Chrome
// cuando el usuario deniega el permiso: DOMException('Permission denied', 'NotAllowedError').
// Es determinista y no depende de cómo se comporte el Chromium sin cabeza.
// ═══════════════════════════════════════════════════════════════════════════

/** Sustituye getUserMedia por un rechazo con la excepción indicada y captura errores sueltos. */
async function simularFalloDeCamara(page: Page, nombre: string, mensaje: string) {
  await page.addInitScript(
    ({ nombre, mensaje }) => {
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => Promise.reject(new DOMException(mensaje, nombre)),
      });
      // @ts-expect-error — almacén de la prueba
      window.__sueltos = [];
      // @ts-expect-error — idem
      window.addEventListener('error', (e) => window.__sueltos.push(String(e.message)));
      // @ts-expect-error — idem
      window.addEventListener('unhandledrejection', (e) => window.__sueltos.push(`rejection: ${String(e.reason)}`));
    },
    { nombre, mensaje },
  );
}

test('caso 3 · con el permiso denegado avisa de forma accesible y no se rompe', async ({ page }) => {
  const consola: string[] = [];
  page.on('pageerror', (e) => consola.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') consola.push(m.text());
  });

  await simularFalloDeCamara(page, 'NotAllowedError', 'Permission denied');
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Activar cámara' }).click();

  // El aviso llega por role="alert": lo anuncia un lector de pantalla sin mover el foco.
  // Acotado al visor: Next inyecta su propio role="alert" (#__next-route-announcer__).
  const alerta = page.locator('section[aria-label="Cámara en vivo"] [role=alert]');
  await expect(alerta).toBeVisible();
  await expect(alerta).toContainText('Permiso de cámara denegado');
  await expect(alerta, 'debe decir CÓMO arreglarlo').toContainText('configuración del navegador');
  await expect(alerta, 'debe ofrecer la salida alternativa').toContainText('modo imagen');

  // No se queda en negro: no hay <video> huérfano y el botón sigue disponible para reintentar.
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Activar cámara' })).toBeEnabled();

  // Y no lanza ninguna excepción a la consola.
  const sueltos = await page.evaluate(() => (window as unknown as { __sueltos: string[] }).__sueltos);
  expect(sueltos).toEqual([]);
  expect(consola).toEqual([]);

  // El modo imagen sigue siendo utilizable sin cámara: la app no queda inservible.
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await cargarFoto(page, 255, 0, 0);
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#FF0000');
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — hoy fallan a propósito (test.fail).
// ═══════════════════════════════════════════════════════════════════════════

test('HALLAZGO · volver al modo foto tras usar la cámara deja un lienzo fantasma que responde «Negro»', async ({ page }) => {
  test.fail();
  // `cambiarModo` reinicia color, calibración y aviso, pero NO `hayImagen`. Al desmontarse
  // la sección del modo imagen se pierde el lienzo dibujado; al volver, el <canvas> es nuevo
  // (300 × 150 por defecto, transparente) pero se muestra igual y el texto sigue diciendo
  // «Toca cualquier punto de la imagen». Un clic lee un píxel transparente → rgb(0,0,0) y la
  // app responde «Negro #000000» con total aplomo. Lo peor: el público declarado de la app
  // (daltonismo y baja visión) es justo el que no puede ver que ahí ya no hay ninguna foto.
  await page.goto(RUTA);
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await cargarFoto(page, 255, 0, 0);
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#FF0000');

  await page.getByRole('tab', { name: 'Cámara en vivo' }).click();
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await page.locator('canvas[role=button]').click({ position: { x: 20, y: 20 } });

  // Esperado: sin foto cargada no debe haber lectura ninguna (o debe seguir la foto anterior).
  // Obtenido hoy: «#000000 / Negro», inventado a partir de un lienzo vacío.
  await expect(page.locator('section[aria-label="Color identificado"]')).toHaveCount(0);
});

test('HALLAZGO · el fallo de cámara se clasifica por el TEXTO inglés del error, no por su nombre', async ({ page }) => {
  test.fail();
  // page.tsx mira `err.message` en vez de `err.name`. Consecuencias medidas el 26/08/2026:
  //   · NotFoundError → el mensaje real de Chrome es «Requested device not found», que NO
  //     contiene «NotFound»: la rama «No se encontró ninguna cámara» es CÓDIGO MUERTO.
  //   · NotAllowedError en Firefox y Safari → «The request is not allowed by the user agent
  //     or the platform in the current context.», que no contiene «Permission» ni
  //     «NotAllowed»: en un iPhone que deniega el permiso el usuario ve esa frase EN INGLÉS
  //     (con doble punto final) en vez de la instrucción de cómo reactivarlo.
  await simularFalloDeCamara(page, 'NotFoundError', 'Requested device not found');
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Activar cámara' }).click();

  // Acotado al visor: Next inyecta su propio role="alert" (#__next-route-announcer__).
  const alerta = page.locator('section[aria-label="Cámara en vivo"] [role=alert]');
  await expect(alerta).toBeVisible();
  // Esperado: «No se encontró ninguna cámara…» · Obtenido: «…: Requested device not found.»
  await expect(alerta).toContainText('No se encontró ninguna cámara');
  await expect(alerta, 'no debe filtrarse texto en inglés a una interfaz en español').not.toContainText(/[Rr]equested device/);
});

test('HALLAZGO · el cuentagotas es un role="button" enfocable que el teclado no puede activar', async ({ page }) => {
  test.fail();
  // El <canvas> del modo imagen declara role="button" y tabIndex={0}, así que entra en el
  // recorrido del tabulador, pero solo tiene onClick: sin onKeyDown, Enter y Espacio no
  // hacen nada. Es una parada de tabulador muerta (WCAG 2.1.1) en una app cuyo público
  // declarado incluye baja visión, que es quien más navega con teclado.
  await page.goto(RUTA);
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await cargarFoto(page, 255, 0, 0);

  const lienzo = page.locator('canvas[role=button]');
  await lienzo.focus();
  await expect(lienzo).toBeFocused();
  await lienzo.press('Enter');

  // Esperado: activar con Enter da una lectura, igual que el clic. Obtenido: no pasa nada.
  await expect(page.locator('section[aria-label="Color identificado"]')).toBeVisible({ timeout: 2000 });
});

test('HALLAZGO · la región aria-live se reescribe ~9 veces por segundo con la cámara en marcha', async ({ page }) => {
  test.fail();
  // <section aria-live="polite"> envuelve nombre, HEX, RGB, HSL, calibración y botones, y la
  // lectura se refresca ~8 veces por segundo. Medido el 26/08/2026: 26 cambios en 3 s. Un
  // lector de pantalla encola cada uno y nunca vacía la cola, así que el usuario no llega a
  // oír ni la etiqueta del botón «Congelar lectura», que es justo la salida del bucle.
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Activar cámara' }).click();
  await esperarCamaraEnMarcha(page);
  await expect(page.locator('section[aria-label="Color identificado"]')).toBeVisible();

  const cambios = await page.evaluate(async () => {
    const sec = document.querySelector('section[aria-label="Color identificado"]')!;
    let prev = sec.textContent;
    let n = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 3000) {
      await new Promise((r) => setTimeout(r, 60));
      if (sec.textContent !== prev) {
        n++;
        prev = sec.textContent;
      }
    }
    return n;
  });

  // Esperado: como mucho unas pocas locuciones en 3 s. Obtenido: 26.
  expect(cambios, `la región viva cambió ${cambios} veces en 3 s`).toBeLessThanOrEqual(5);
});

test('HALLAZGO · la paleta no tiene ningún azul medio, así que el azul acero se llama «Gris»', async ({ page }) => {
  test.fail();
  // La PALETA de page.tsx salta de «Azul» #0057E7 (un azul vivo y muy saturado) a «Celeste»
  // #87CEEB y «Verde azulado» #008080: no hay ningún azul medio ni apagado. Con la distancia
  // redmean, #4682B4 (azul acero, HSL 207°, 44 % de SATURACIÓN — cualquier cosa menos gris)
  // cae más cerca de «Gris» #808080 (d = 15.100,6) que de «Verde azulado» (d = 18.217,8),
  // calculado a mano con la fórmula del propio fichero. Y el azul de la marca, #2E86AB, sale
  // «Verde azulado». El algoritmo no falla: falta cobertura de paleta justo en la franja de
  // los azules de uso diario (vaqueros, loza, pintura), y el público declarado —daltonismo—
  // es el que no puede corregir mentalmente un «Gris» que en realidad es azul.
  await page.goto(RUTA);
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await cargarFoto(page, 70, 130, 180);
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });

  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#4682B4'); // el código sí es exacto
  // Esperado: un nombre de la familia del azul. Obtenido: «Gris».
  await expect(NOMBRE_COLOR(page)).toContainText(/[Aa]zul|[Cc]eleste/);
});
