import { test, expect, devices, type Page } from '@playwright/test';
import zlib from 'node:zlib';
import { ORIGEN } from './_puerto';
import { parseSpanishNumber } from '@/lib/formatters';
import { nombreDeColor } from '@/data/colores-nombrados';

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
 *     cercano (diferencia de color CIEDE2000)», «Códigos HEX, RGB y HSL con botón de copia»,
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
 * Los cinco hallazgos de la primera inspección (392-396, 26/08/2026) están REPARADOS: sus
 * tests (`REGRESIÓN 39x`) ya no llevan `test.fail()` y vigilan que la reparación se sostenga.
 * Los hallazgos de la re-inspección del 27/10/2026 que siguen ABIERTOS van al final, marcados
 * con `test.fail()`: afirman lo que la app debería hacer y hoy fallan a propósito. El día que
 * se reparen se pondrán en ROJO («expected to fail, but passed») y habrá que quitarles la
 * marca, quedando como regresión.
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
// propio page.tsx (rgbAHex, rgbAHsl con Math.round) y, para el nombre, con nombreDeColor sobre
// el conjunto de cobertura de data/colores-nombrados.ts. Desde el 13/10/2026 el vecino más
// cercano se mide con ΔE00 (CIEDE2000, motor validado contra los pares de Sharma et al. 2005
// en tests/diferencia-color-motor.spec.ts); hasta entonces era la distancia redmean, cuyas
// cifras se conservan entre corchetes porque explican el hallazgo 393:
//
//  RGB(255,0,0)     → #FF0000 · HSL: l=0,5 → s=d/(max+min)=1 → 0°,100%,50%
//                   · ΔE00: «Rojo» #E01B24 7,80 gana a «Carmesí» #DC143C 13,76
//                     [redmean: 8.407,5 frente a 12.632,6]
//  RGB(128,128,128) → #808080 · max=min → h=0, s=0; l=round(50,196)=50 → 0°,0%,50%
//                   · «Gris» #808080, ΔE00 = 0 (coincidencia exacta)
//  RGB(46,134,171)  → #2E86AB · h=(4+(rn-gn)/d)/6=0,549333 → 197,76° → round 198
//                   · s=0,490196/0,850980=0,576 → 58 · l=42,549 → 43 → 198°,58%,43%
//                   · «Azul petróleo» #2E86AB, ΔE00 = 0 (coincidencia exacta desde que la
//                     paleta tiene azules medios — hallazgo 393). Antes ganaba «Verde
//                     azulado» #008080 [redmean d=9.939,8], y el azul de marca de meskeIA se
//                     llamaba verde.
//  RGB(70,130,180)  → #4682B4 · h=(4-0,545455)/6=0,575758 → 207,27° → 207
//                   · s=0,431373/0,980392=0,44 → 44 · l=49,0196 → 49 → 207°,44%,49%
//                   · «Azul acero» #4682B4, ΔE00 = 0 (coincidencia exacta). Antes ganaba
//                     «Gris» [redmean d=15.100,6]: un azul con 44 % de saturación se llamaba gris,
//                     y esta app existe para poner NOMBRE al color a quien no lo distingue.
//  RGB(0,128,0)     → #008000 · l=0,250980 → 25 · s=d/(max+min)=1 → 100 · h=120°
//                   · «Verde» #008000, ΔE00 = 0 (coincidencia exacta)
// ═══════════════════════════════════════════════════════════════════════════

const CASOS_COLOR = [
  { rgb: [255, 0, 0], hex: '#FF0000', rgbTexto: '255, 0, 0', hsl: '0°, 100%, 50%', nombre: 'Rojo' },
  { rgb: [128, 128, 128], hex: '#808080', rgbTexto: '128, 128, 128', hsl: '0°, 0%, 50%', nombre: 'Gris' },
  { rgb: [46, 134, 171], hex: '#2E86AB', rgbTexto: '46, 134, 171', hsl: '198°, 58%, 43%', nombre: 'Azul petróleo' },
  { rgb: [70, 130, 180], hex: '#4682B4', rgbTexto: '70, 130, 180', hsl: '207°, 44%, 49%', nombre: 'Azul acero' },
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
// REGRESIONES de los hallazgos 392-396 (REPARADOS). Ya no llevan test.fail: vigilan que la
// reparación se sostenga. Los comentarios cuentan el defecto en pasado, tal como era.
// ═══════════════════════════════════════════════════════════════════════════

test('REGRESIÓN 392 · volver al modo foto tras usar la cámara no deja lienzo fantasma', async ({ page }) => {
  // REPARADO. `cambiarModo` reiniciaba color, calibración y aviso, pero NO `hayImagen`. Al
  // desmontarse la sección del modo imagen se perdía el lienzo dibujado; al volver, el <canvas>
  // era nuevo (300 × 150 por defecto, transparente) pero se mostraba igual y el texto seguía
  // diciendo «Toca cualquier punto de la imagen». Un clic leía un píxel transparente →
  // rgb(0,0,0) y la app respondía «Negro #000000» con total aplomo. Lo peor: el público
  // declarado de la app (daltonismo y baja visión) es justo el que no puede ver que ahí ya no
  // hay ninguna foto.
  await page.goto(RUTA);
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await cargarFoto(page, 255, 0, 0);
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#FF0000');

  await page.getByRole('tab', { name: 'Cámara en vivo' }).click();
  await page.getByRole('tab', { name: 'Desde una foto' }).click();

  // El lienzo vuelve a estar oculto y fuera del tabulador: no hay dónde pulsar, que es la
  // reparación. Antes se mostraba —vacío y transparente— y respondía «Negro #000000».
  const lienzo = page.locator('canvas[role=button]');
  await expect(lienzo).not.toBeVisible();
  await expect(lienzo).toHaveAttribute('tabindex', '-1');

  // Y la ayuda vuelve a pedir una foto en vez de invitar a tocar una que ya no está.
  await expect(page.getByText('Sube una foto o una captura de pantalla')).toBeVisible();

  // Sin foto no hay lectura ninguna.
  await expect(page.locator('section[aria-label="Color identificado"]')).toHaveCount(0);
});

test('REGRESIÓN 394 · el fallo de cámara se clasifica por el nombre estándar del error', async ({ page }) => {
  // REPARADO: page.tsx miraba `err.message` en vez de `err.name`. Consecuencias medidas el
  // 26/08/2026:
  //   · NotFoundError → el mensaje real de Chrome es «Requested device not found», que NO
  //     contiene «NotFound»: la rama «No se encontró ninguna cámara» era CÓDIGO MUERTO.
  //   · NotAllowedError en Firefox y Safari → «The request is not allowed by the user agent
  //     or the platform in the current context.», que no contiene «Permission» ni
  //     «NotAllowed»: en un iPhone que denegaba el permiso el usuario veía esa frase EN INGLÉS
  //     (con doble punto final) en vez de la instrucción de cómo reactivarlo.
  await simularFalloDeCamara(page, 'NotFoundError', 'Requested device not found');
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Activar cámara' }).click();

  // Acotado al visor: Next inyecta su propio role="alert" (#__next-route-announcer__).
  const alerta = page.locator('section[aria-label="Cámara en vivo"] [role=alert]');
  await expect(alerta).toBeVisible();
  // Esperado: «No se encontró ninguna cámara…» · Antes de la reparación salía «…: Requested
  // device not found.»
  await expect(alerta).toContainText('No se encontró ninguna cámara');
  await expect(alerta, 'no debe filtrarse texto en inglés a una interfaz en español').not.toContainText(/[Rr]equested device/);
});

test('REGRESIÓN 395 · el cuentagotas responde a Enter y Espacio, no solo al clic', async ({ page }) => {
  // REPARADO. El <canvas> del modo imagen declaraba role="button" y tabIndex={0}, así que
  // entraba en el recorrido del tabulador, pero solo tenía onClick: sin onKeyDown, Enter y
  // Espacio no hacían nada. Era una parada de tabulador muerta (WCAG 2.1.1) en una app cuyo
  // público declarado incluye baja visión, que es quien más navega con teclado. (Espacio se
  // comprueba en el caso 8, con un píxel que solo se lee por teclado.)
  await page.goto(RUTA);
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await cargarFoto(page, 255, 0, 0);

  const lienzo = page.locator('canvas[role=button]');
  await lienzo.focus();
  await expect(lienzo).toBeFocused();
  await lienzo.press('Enter');

  // Esperado: activar con Enter da una lectura, igual que el clic. Antes no pasaba nada.
  await expect(page.locator('section[aria-label="Color identificado"]')).toBeVisible({ timeout: 2000 });
});

test('REGRESIÓN 396 · lo que se refresca 9 veces por segundo NO es una región viva', async ({ page }) => {
  // REPARADO. El bloque de resultado era un <section aria-live="polite"> que envolvía nombre, HEX,
  // RGB, HSL, calibración y los tres botones de copiar, y su contenido se refresca unas 8
  // veces por segundo con la cámara en marcha (medido el 26/08/2026: 26 cambios en 3 s). Un
  // lector de pantalla encolaba cada uno y nunca vaciaba la cola, así que no llegaba a oírse
  // ni la etiqueta de «Congelar lectura», que es justamente la salida del bucle.
  //
  // La reparación NO es refrescar menos —enseñar el color en directo es la función de la
  // app— sino dejar de ANUNCIAR cada refresco. Por eso lo que se comprueba es que la
  // sección ya no es región viva, y que el contenido sigue actualizándose.
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Activar cámara' }).click();
  await esperarCamaraEnMarcha(page);
  const seccion = page.locator('section[aria-label="Color identificado"]');
  await expect(seccion).toBeVisible();

  expect(await seccion.getAttribute('aria-live'), 'aria-live del bloque de resultado').toBeNull();
  expect(await seccion.getAttribute('role'), 'role del bloque de resultado').toBeNull();

  // Y ninguna región viva de la página envuelve un botón: releerlos enteros en cada
  // actualización es lo que hacía inaudible la salida del bucle.
  const vivasConBotones = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[aria-live]'))
      .filter((el) => el.querySelector('button'))
      .map((el) => el.getAttribute('aria-label') || el.className),
  );
  expect(vivasConBotones, 'regiones vivas que envuelven botones').toEqual([]);

  // La lectura SÍ sigue viva en pantalla: la app no ha dejado de hacer su trabajo.
  const cambios = await page.evaluate(async () => {
    const sec = document.querySelector('section[aria-label="Color identificado"]')!;
    let prev = sec.textContent;
    let n = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 2000) {
      await new Promise((r) => setTimeout(r, 60));
      if (sec.textContent !== prev) {
        n++;
        prev = sec.textContent;
      }
    }
    return n;
  });
  expect(cambios, 'la lectura debe seguir refrescándose en pantalla').toBeGreaterThan(0);
});

test('REGRESIÓN 393 · la paleta tiene azules medios y el azul acero se llama azul', async ({ page }) => {
  // REPARADO. La PALETA (entonces en page.tsx, hoy en data/colores-nombrados.ts) saltaba de
  // «Azul» #0057E7 (un azul vivo y muy saturado) a «Celeste» #87CEEB y «Verde azulado» #008080:
  // no había ningún azul medio ni apagado. Con la distancia redmean de entonces, #4682B4 (azul
  // acero, HSL 207°, 44 % de SATURACIÓN — cualquier cosa menos gris) caía más cerca de «Gris»
  // #808080 (d = 15.100,6) que de «Verde azulado» (d = 18.217,8), calculado a mano con la
  // fórmula del propio fichero. Y el azul de la marca, #2E86AB, salía «Verde azulado». Faltaba
  // cobertura de paleta justo en la franja de los azules de uso diario (vaqueros, loza,
  // pintura), y el público declarado —daltonismo— es el que no puede corregir mentalmente un
  // «Gris» que en realidad es azul. Hoy la paleta tiene tres azules medios y el nombre se elige
  // con ΔE00 (cd5aa836).
  await page.goto(RUTA);
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await cargarFoto(page, 70, 130, 180);
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });

  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#4682B4'); // el código sí es exacto
  // Esperado: un nombre de la familia del azul. Antes de la reparación: «Gris».
  await expect(NOMBRE_COLOR(page)).toContainText(/[Aa]zul|[Cc]eleste/);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 4 — «¿Son el mismo color?» (semilla S0202, 13/10/2026)
//
// El par #9D7181 (rosa grisáceo) / #578D7F (verde grisáceo) NO sale de la app: lo construye
// `tests/diferencia-color-motor.spec.ts` desplazando un gris a lo largo del núcleo de la
// matriz de deuteranopía de Machado, así que es un par de confusión por construcción. Con
// visión típica, ΔE00 = 39,8 (distintos); con deuteranopía, 0 (iguales). Ninguna otra de las
// visiones comparadas baja de 1, de modo que el aviso tiene que nombrar solo la deuteranopía.
// ═══════════════════════════════════════════════════════════════════════════
test('caso 4 · comparar A y B: veredicto con ΔE00 y aviso de la visión que los confunde', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('tab', { name: 'Desde una foto' }).click();

  // Sin nada guardado no hay sección de comparación
  await expect(page.getByRole('heading', { name: '¿Son el mismo color?' })).toHaveCount(0);

  await cargarFoto(page, 0x9d, 0x71, 0x81);
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });
  await page.getByRole('button', { name: 'Guardar como color A' }).click();

  const seccion = page.locator('section[aria-labelledby="titulo-comparar"]');
  await expect(seccion).toContainText('#9D7181');
  await expect(seccion).toContainText('Falta: guarda un color como B');
  await expect(seccion.locator('table')).toHaveCount(0);

  await cargarFoto(page, 0x57, 0x8d, 0x7f);
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });
  await page.getByRole('button', { name: 'Guardar como color B' }).click();

  await expect(seccion).toContainText('#578D7F');
  // Hasta el 13/10/2026 las dos muestras se llamaban «Gris»: la app decía que eran distintas
  // y les daba el mismo nombre. Con ΔE00 son «Lila» y «Verde azulado».
  await expect(seccion).toContainText('Lila');
  await expect(seccion).toContainText('Verde azulado');
  await expect(seccion).not.toContainText('Gris');
  await expect(seccion.getByRole('status')).toHaveText(
    'Colores distintos (diferencia ΔE00 de 39,8 con visión típica). Atención: con deuteranopía se verían prácticamente iguales.',
  );

  // Una fila por visión, en el orden del motor, y la de deuteranopía marcada como confusión
  const filas = seccion.locator('tbody tr');
  await expect(filas).toHaveCount(6);
  await expect(filas.nth(0)).toContainText('Visión típica');
  await expect(filas.nth(0)).toContainText('39,8');
  const deutan = filas.filter({ hasText: 'Deuteranopía' });
  await expect(deutan).toContainText('No se distinguen');
  await expect(deutan.locator('td').last()).toHaveClass(/celdaConfusion/);

  // En 412 px la tabla cabe entera: la columna del resultado, la que importa, no se esconde
  // detrás de un desplazamiento lateral (así salía en la primera versión, con frases largas).
  const tabla = await seccion.locator('table').evaluate((t) => [t.parentElement!.scrollWidth, t.parentElement!.clientWidth]);
  expect(tabla[0]).toBeLessThanOrEqual(tabla[1]);

  // Guardar el MISMO color en los dos lados: iguales en todas las visiones, sin aviso
  await page.getByRole('button', { name: 'Guardar como color A' }).click();
  await expect(seccion.getByRole('status')).toHaveText('No se distinguen (diferencia ΔE00 de 0,0 con visión típica).');

  await page.getByRole('button', { name: 'Vaciar comparación' }).click();
  await expect(seccion).toHaveCount(0);

  // Nada desborda en 412 px
  const ancho = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(ancho[0]).toBe(ancho[1]);
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 27/10/2026 — «¿Son el mismo color?» (2757d1e4) y nombre por ΔE00 (cd5aa836)
//
// DE DÓNDE SALEN LOS ESPERADOS: de una implementación PROPIA de sRGB (IEC 61966-2-1, D65) →
// CIELAB → CIEDE2000 escrita aparte del motor y validada antes contra los 34 pares de prueba de
// Sharma, Wu y Dalal (2005): los 34 coinciden a 4 decimales. Las simulaciones de daltonismo,
// con las matrices de Machado, Oliveira y Fernandes (2009) aplicadas sobre RGB LINEAL (filas que
// suman 1; determinante ≈ 0 en protanopía y deuteranopía, 0,236 en tritanopía, que es lo que
// declara lib/calculadoras/daltonismo.ts) y cuantizadas a 8 bits como hace la app.
// Los ΔE00 se escriben con los 4 decimales de esa implementación; la app los pinta con uno, y
// ninguno de los elegidos está a menos de 0,02 de un redondeo (x,x5), así que la diferencia de
// precisión entre la matriz sRGB de 4 decimales y la de 7 del motor (~0,01) no los mueve.
// ═══════════════════════════════════════════════════════════════════════════

const SECCION_RESULTADO = 'section[aria-label="Color identificado"]';
const SECCION_COMPARAR = 'section[aria-labelledby="titulo-comparar"]';

/** PNG RGBA de 8 bits (tipo de color 6) a partir de una función (x, y) → [r, g, b, a]. */
function pngRgba(ancho: number, alto: number, pixel: (x: number, y: number) => [number, number, number, number]): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  const filas: Buffer[] = [];
  for (let y = 0; y < alto; y++) {
    const fila = Buffer.alloc(1 + ancho * 4);
    for (let x = 0; x < ancho; x++) fila.set(pixel(x, y), 1 + x * 4);
    filas.push(fila);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozo('IHDR', ihdr),
    trozo('IDAT', zlib.deflateSync(Buffer.concat(filas), { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

const rgbDeHex = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/** Abre el modo foto esperando a que React responda (un clic antes de hidratar se pierde). */
async function abrirModoFoto(page: Page) {
  await expect(async () => {
    await page.getByRole('tab', { name: 'Desde una foto' }).click();
    await expect(page.locator('input[type=file]')).toBeAttached({ timeout: 1000 });
  }).toPass({ timeout: 10000 });
}

/**
 * Sube un PNG del color dado, lo toca y espera a que la app lo muestre. Si ya había una lectura,
 * espera a que la carga de la foto nueva la retire (`setColor(null)` en el onload): sin eso, un
 * clic rápido leía la foto ANTERIOR, que tiene el mismo tamaño de lienzo.
 */
async function leerFoto(page: Page, hex: string) {
  const [r, g, b] = rgbDeHex(hex);
  const habiaLectura = (await page.locator(SECCION_RESULTADO).count()) > 0;
  await page.setInputFiles('input[type=file]', { name: 'color.png', mimeType: 'image/png', buffer: pngSolido(r, g, b) });
  if (habiaLectura) await expect(page.locator(SECCION_RESULTADO)).toHaveCount(0);
  await expect(page.locator('canvas[role=button]')).toBeVisible();
  await page.locator('canvas[role=button]').click({ position: { x: 40, y: 30 } });
  await expect(valorDeCodigo(page, 'HEX')).toHaveText(hex);
}

/** Guarda `a` como color A y `b` como color B, vaciando antes cualquier comparación anterior. */
async function compararPar(page: Page, a: string, b: string) {
  const vaciar = page.getByRole('button', { name: 'Vaciar comparación' });
  if (await vaciar.count()) await vaciar.click();
  await leerFoto(page, a);
  await page.getByRole('button', { name: 'Guardar como color A' }).click();
  await leerFoto(page, b);
  await page.getByRole('button', { name: 'Guardar como color B' }).click();
  await expect(page.locator(SECCION_COMPARAR).getByRole('status')).not.toBeEmpty();
}

/** Las seis filas de la tabla: [visión, ΔE00 tal como se lee, resultado, ¿marcada como confusión?]. */
function filasDeLaTabla(page: Page) {
  return page.locator(`${SECCION_COMPARAR} tbody tr`).evaluateAll((trs) =>
    trs.map((tr) => {
      const celdas = [...tr.querySelectorAll('th, td')].map((c) => (c.textContent ?? '').trim());
      const ultima = tr.querySelector('td:last-child');
      return [celdas[0], celdas[2], celdas[3], !!ultima && /celdaConfusion/.test(ultima.className)] as const;
    }),
  );
}

/** El ΔE00 del veredicto, leído como número (formato español). */
async function deltaDelVeredicto(page: Page) {
  const texto = (await page.locator(SECCION_COMPARAR).getByRole('status').textContent()) ?? '';
  const m = texto.match(/ΔE00 de ([\d.,]+) con visión típica/);
  expect(m, `el veredicto no da la cifra: «${texto}»`).not.toBeNull();
  return { texto, cifra: parseSpanishNumber(m![1]) };
}

/** Contraste WCAG 2.x entre el texto de un elemento y el fondo de otro, medido en la página. */
function contrasteEn(page: Page, selectorTexto: string, selectorFondo: string) {
  return page.evaluate(
    ([st, sf]) => {
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const L = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const canales = (s: string) => (s.match(/[\d.]+/g) ?? []).map((x) => +x);
      // Fondo efectivo: compone las capas semitransparentes sobre la primera opaca
      const fondo = (el: Element | null) => {
        const capas: number[][] = [];
        for (let e = el; e; e = e.parentElement) {
          const c = canales(getComputedStyle(e).backgroundColor);
          const a = c.length > 3 ? c[3] : 1;
          if (a > 0) capas.push([...c.slice(0, 3), a]);
          if (a >= 1) break;
        }
        let base = [255, 255, 255];
        for (const c of capas.reverse()) base = base.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
        return base;
      };
      const t = document.querySelector(st)!;
      const lt = L(canales(getComputedStyle(t).color));
      const lf = L(fondo(document.querySelector(sf)));
      return (Math.max(lt, lf) + 0.05) / (Math.min(lt, lf) + 0.05);
    },
    [selectorTexto, selectorFondo] as const,
  );
}

// ─── CASO 5 — un par normal: «Rojo» #E01B24 frente a «Carmesí» #DC143C ───────────────
//
// Calculado con la implementación propia (ΔE00 de cada visión, y los dos colores simulados):
//   Visión típica   #E01B24 · #DC143C   ΔE00 6,7754 → 6,8 · Distintos
//   Deuteranomalía  #A57018 · #A06D36   5,7318 → 5,7 · Parecidos
//   Protanomalía    #93521D · #8F5039   8,6276 → 8,6 · Distintos
//   Deuteranopía    #908017 · #8B7E35   4,2685 → 4,3 · Parecidos
//   Protanopía      #625721 · #5C553B   7,6727 → 7,7 · Distintos
//   Tritanopía      #F70023 · #F20029   1,8364 → 1,8 · Casi iguales  ← la única que los confunde
// Las mini-muestras prueban el ESPACIO en que se aplica Machado: en RGB lineal la deuteranopía
// de #E01B24 da rgb(144, 128, 23); aplicada sobre los 0-255 con gamma daría un rojo de ~97.
test('caso 5 · Rojo frente a Carmesí: ΔE00 en las seis visiones y aviso de la tritanopía', async ({ page }) => {
  await page.goto(RUTA);
  await abrirModoFoto(page);
  await compararPar(page, '#E01B24', '#DC143C');

  const seccion = page.locator(SECCION_COMPARAR);
  await expect(seccion.locator('[class*=compararNombre]')).toHaveText(['Rojo', 'Carmesí']);
  await expect(seccion.getByRole('status')).toHaveText(
    'Colores distintos (diferencia ΔE00 de 6,8 con visión típica). Atención: con tritanopía se verían prácticamente iguales.',
  );
  expect(await filasDeLaTabla(page)).toEqual([
    ['Visión típica', '6,8', 'Distintos', false],
    ['Deuteranomalía', '5,7', 'Parecidos', false],
    ['Protanomalía', '8,6', 'Distintos', false],
    ['Deuteranopía', '4,3', 'Parecidos', false],
    ['Protanopía', '7,7', 'Distintos', false],
    ['Tritanopía', '1,8', 'Casi iguales', true],
  ]);

  const minis = await seccion.locator('tbody tr').evaluateAll((trs) =>
    trs.map((tr) => [...tr.querySelectorAll('[class*=miniMuestra] [class*=miniMuestra]')].map((s) => getComputedStyle(s).backgroundColor)),
  );
  expect(minis[3], 'deuteranopía simulada en RGB lineal').toEqual(['rgb(144, 128, 23)', 'rgb(139, 126, 53)']);
  expect(minis[5], 'tritanopía simulada en RGB lineal').toEqual(['rgb(247, 0, 35)', 'rgb(242, 0, 41)']);
});

// ─── CASO 6 — los extremos y las fronteras que la app SÍ resuelve bien ─────────────────
//
//   #000000 / #FFFFFF: L* 0 frente a 100, a* = b* = 0 → ΔE00 = 100 exacto (S_L = 1 con L̄ = 50).
//     Machado conserva el blanco y el negro (cada fila suma 1), así que las seis visiones dan 100.
//   #808080 / #7D7E7E: ΔE00 1,0192 → tramo [1; 2,5) → «Casi iguales» (se lee 1,0).
//   #808080 / #7E7A83: ΔE00 6,0163 → tramo [6; ∞) → «Colores distintos» (se lee 6,0).
// La cifra se compara como número con ±0,05: vale «1,0» y vale «1,02» si un día se muestran
// dos decimales, que es una de las salidas del hallazgo de la frontera (al final).
test('caso 6 · negro y blanco dan ΔE00 100 en todas las visiones; 1,02 es «casi iguales» y 6,02 «distintos»', async ({ page }) => {
  await page.goto(RUTA);
  await abrirModoFoto(page);

  await compararPar(page, '#000000', '#FFFFFF');
  const seccion = page.locator(SECCION_COMPARAR);
  await expect(seccion.locator('[class*=compararNombre]')).toHaveText(['Negro', 'Blanco']);
  await expect(seccion.getByRole('status')).toHaveText('Colores distintos (diferencia ΔE00 de 100,0 con visión típica).');
  for (const fila of await filasDeLaTabla(page)) expect(fila.slice(1)).toEqual(['100,0', 'Distintos', false]);

  await compararPar(page, '#808080', '#7D7E7E');
  let v = await deltaDelVeredicto(page);
  expect(v.texto).toMatch(/^Casi iguales: solo se nota juntos y fijándose \(/);
  expect(v.cifra).toBeCloseTo(1.0192, 1);

  await compararPar(page, '#808080', '#7E7A83');
  v = await deltaDelVeredicto(page);
  expect(v.texto).toMatch(/^Colores distintos \(/);
  expect(v.cifra).toBeCloseTo(6.0163, 1);
});

// ─── CASO 7 — el nombre es el de la paleta con MENOR ΔE00 ────────────────────────────────
//
// Vecino más cercano entre los 48 colores `basico: true` de data/colores-nombrados.ts, con la
// implementación propia. Entre paréntesis, cuánto le saca el segundo candidato (margen en ΔE00):
// todos por encima de 1, así que la diferencia de precisión con el motor no puede cambiarlos.
// En la inspección se cotejaron además 1.200 colores (800 al azar y 400 casi grises): 1.200 de
// 1.200 con el mismo nombre que la app.
const NOMBRES_DELTA_E = [
  ['#23418C', 'Azul'], // ΔE 13,12 · margen 2,79 — con redmean era «Gris oscuro»
  ['#708090', 'Azul grisáceo'], // 7,62 · 1,26 — el «azul apagado se llama azul» del bloque educativo
  ['#3283BC', 'Azul acero'], // 2,11 · 3,89
  ['#FF8C00', 'Naranja'], // 4,21 · 9,01
  ['#A52A2A', 'Rojo oscuro'], // 9,11 · 1,29
  ['#F17148', 'Coral'], // 4,17 · 4,71
  ['#49087C', 'Índigo'], // 1,19 · 6,81
  ['#D6A249', 'Mostaza'], // 7,69 · 8,68
  ['#0D6E64', 'Verde azulado'], // 7,87 · 13,64
  ['#A8EF09', 'Verde lima'], // 4,06 · 9,87
  ['#FDFB08', 'Amarillo'], // 0,86 · 9,97
  ['#E5B4BF', 'Rosa'], // 4,87 · 5,94
  ['#CE189E', 'Magenta'], // 4,64 · 11,23
  ['#243B3F', 'Gris oscuro'], // 10,32 · 6,96
  ['#B4B4B4', 'Gris claro'], // 3,19 · 12,14
  ['#000000', 'Negro'], // 0 · 17,56
  ['#FFFFFF', 'Blanco'], // 0 · 10,14
] as const;

test('caso 7 · el nombre de cada color es el de la paleta con menor ΔE00', async ({ page }) => {
  await page.goto(RUTA);
  await abrirModoFoto(page);
  for (const [hex, nombre] of NOMBRES_DELTA_E) {
    await leerFoto(page, hex);
    await expect(NOMBRE_COLOR(page).locator('span').first(), `nombre de ${hex}`).toHaveText(nombre);
  }
});

// ─── CASO 8 — lo que debe RECHAZARSE, y la calibración ───────────────────────────────────
//
// Esta app no tiene ningún campo donde escribir un HEX: los que llegan a hexARgb los escribe
// rgbAHex, así que el «HEX mal formado» no puede entrar por aquí. Lo que sí debe rechazar:
//   · un píxel TRANSPARENTE (no es un color: es que ahí no hay imagen; hallazgo 392);
//   · calibrar con una lectura demasiado oscura: (32,32,32) tiene media 32 < 45 → aviso y nada.
// Y la calibración normal, a mano (von Kries por canal, page.tsx):
//   blanco medido (200,180,160) → media 180 → ganancias 0,9 / 1 / 1,125 → (180,180,180) #B4B4B4
//   lectura siguiente (100,150,200) → (90,150,225) #5A96E1 «Azul grisáceo» (ΔE 7,00 · margen 1,55)
//   sin calibración vuelve a (100,150,200) #6496C8 «Azul grisáceo» (ΔE 4,76 · margen 2,80)
test('caso 8 · un píxel transparente no da lectura, Espacio lee el centro y la calibración corrige la luz', async ({ page }) => {
  await page.goto(RUTA);
  await abrirModoFoto(page);

  // Mitad izquierda transparente (con RGB rojo debajo, que NO debe salir), derecha azul marino
  await page.setInputFiles('input[type=file]', {
    name: 'media.png',
    mimeType: 'image/png',
    buffer: pngRgba(120, 90, (x) => (x < 60 ? [255, 0, 0, 0] : [0, 0, 128, 255])),
  });
  const lienzo = page.locator('canvas[role=button]');
  await expect(lienzo).toBeVisible();
  await lienzo.click({ position: { x: 20, y: 30 } });
  await page.waitForTimeout(300);
  await expect(page.locator(SECCION_RESULTADO), 'un píxel transparente no es un color').toHaveCount(0);
  await expect(page.locator('section[aria-label="Colores recientes"]')).toHaveCount(0);

  // Espacio lee el centro (x = 60, ya opaco): la otra tecla que promete la reparación de 395
  await lienzo.focus();
  await lienzo.press(' ');
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#000080');
  await expect(NOMBRE_COLOR(page).locator('span').first()).toHaveText('Azul marino');

  // Calibración con un blanco cálido
  await leerFoto(page, '#C8B4A0'); // (200,180,160)
  await page.getByRole('button', { name: /Usar este blanco para calibrar/ }).click();
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#B4B4B4');
  await expect(valorDeCodigo(page, 'RGB')).toHaveText('180, 180, 180');
  await expect(page.locator(`${SECCION_RESULTADO} [role=status]`).first()).toHaveText('✓ Luz calibrada con este blanco');

  // La calibración se aplica a la lectura siguiente
  await page.setInputFiles('input[type=file]', { name: 'c.png', mimeType: 'image/png', buffer: pngSolido(100, 150, 200) });
  await expect(page.locator(SECCION_RESULTADO)).toHaveCount(0);
  await lienzo.click({ position: { x: 40, y: 30 } });
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#5A96E1');
  await expect(valorDeCodigo(page, 'RGB')).toHaveText('90, 150, 225');
  await expect(NOMBRE_COLOR(page).locator('span').first()).toHaveText('Azul grisáceo');

  await page.getByRole('button', { name: 'Quitar calibración' }).click();
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#6496C8');

  // Demasiado oscuro: se rechaza con un aviso y no se calibra
  await leerFoto(page, '#202020');
  await page.getByRole('button', { name: /Usar este blanco para calibrar/ }).click();
  await expect(page.locator(`${SECCION_RESULTADO} [role=status]`).first()).toHaveText(
    'Demasiado oscuro para calibrar. Apunta a un blanco bien iluminado.',
  );
  await expect(page.getByRole('button', { name: 'Quitar calibración' })).toHaveCount(0);
  await expect(valorDeCodigo(page, 'HEX')).toHaveText('#202020');
});

// ─── CASO 9 — la cámara en un Pixel 7, de la lectura a la comparación y vuelta ──────────
//
// La cámara falsa de Chromium no tiene un color conocido de antemano, así que aquí se exige lo
// comprobable: el medio entrega imagen de verdad; el nombre que pinta la app es el que da el
// motor para el RGB que pinta (el CÁLCULO del nombre lo prueba el caso 7 con valores literales;
// esto prueba el CABLEADO); el color congelado se guarda como A; volver al modo foto con la
// cámara en marcha apaga los tracks y no deja lienzo fantasma (392); y la cámara se reactiva.
test('caso 9 · en móvil, una lectura de la cámara se guarda como A, se compara con una foto y la cámara se reactiva', async ({ page }) => {
  await page.addInitScript(() => {
    // @ts-expect-error — almacén de la prueba
    window.__streams = [];
    const md = navigator.mediaDevices;
    const orig = md.getUserMedia.bind(md);
    md.getUserMedia = async (c?: MediaStreamConstraints) => {
      const s = await orig(c);
      // @ts-expect-error — idem
      window.__streams.push(s);
      return s;
    };
  });
  const estadoTracks = () =>
    page.evaluate(() =>
      (window as unknown as { __streams: MediaStream[] }).__streams.map((s) => s.getTracks().map((t) => t.readyState).join(',')),
    );

  await page.goto(RUTA);
  expect(page.viewportSize()?.width).toBe(412);
  // Un clic antes de hidratar se pierde: se repite mientras el botón siga ahí
  await expect(async () => {
    const activar = page.getByRole('button', { name: 'Activar cámara' });
    if (await activar.isVisible()) await activar.click();
    await expect(page.locator('video')).toHaveCount(1, { timeout: 2000 });
  }).toPass({ timeout: 10000 });
  await esperarCamaraEnMarcha(page);
  const medio = await estadoDelVideo(page);
  expect(medio!.readyState).toBeGreaterThanOrEqual(2);
  expect(medio!.ancho).toBeGreaterThan(0);

  // El cuentagotas sobre el vídeo da un color, y su nombre es el del motor para ese RGB
  await expect(valorDeCodigo(page, 'HEX')).toHaveText(/^#[0-9A-F]{6}$/);
  await page.getByRole('button', { name: /Congelar lectura/ }).click();
  const hexCamara = (await valorDeCodigo(page, 'HEX').textContent())!;
  const rgb = ((await valorDeCodigo(page, 'RGB').textContent()) ?? '').split(',').map((x) => parseInt(x, 10));
  expect('#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase(), 'RGB y HEX dicen lo mismo').toBe(hexCamara);
  await expect(NOMBRE_COLOR(page).locator('span').first()).toHaveText(nombreDeColor(rgb[0], rgb[1], rgb[2]));
  await page.getByRole('button', { name: 'Guardar como color A' }).click();
  await expect(page.locator(SECCION_COMPARAR)).toContainText(hexCamara);

  // Al modo foto con la cámara EN MARCHA
  await page.getByRole('tab', { name: 'Desde una foto' }).click();
  await expect.poll(estadoTracks, { message: 'la cámara sigue encendida' }).toEqual(['ended']);
  await expect(page.locator('video')).toHaveCount(0);
  const lienzo = page.locator('canvas[role=button]');
  await expect(lienzo, 'lienzo fantasma (392)').not.toBeVisible();
  await expect(lienzo).toHaveAttribute('tabindex', '-1');
  await expect(page.locator(SECCION_RESULTADO)).toHaveCount(0);
  await expect(page.getByText('Sube una foto o una captura de pantalla')).toBeVisible();
  // La comparación sobrevive al cambio de modo: es lo que permite comparar un objeto y una foto
  await expect(page.locator(SECCION_COMPARAR)).toContainText(hexCamara);

  await leerFoto(page, '#FF0000');
  await page.getByRole('button', { name: 'Guardar como color B' }).click();
  await expect(page.locator(SECCION_COMPARAR).getByRole('status')).toHaveText(/\(diferencia ΔE00 de [\d.,]+ con visión típica\)/);
  const ancho = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(ancho[0], 'nada desborda en 412 px').toBe(ancho[1]);

  // Vuelta a la cámara: hay que activarla otra vez, y arranca
  await page.getByRole('tab', { name: 'Cámara en vivo' }).click();
  await expect(page.locator('video')).toHaveCount(0);
  await page.getByRole('button', { name: 'Activar cámara' }).click();
  await esperarCamaraEnMarcha(page);
  await expect.poll(estadoTracks).toEqual(['ended', 'live']);
});

// ─── CASO 10 — sin el permiso de cámara, en un navegador de verdad (sin simular la excepción) ─
//
// El caso 3 sustituye getUserMedia por un rechazo NotAllowedError. Aquí no se simula nada: se
// lanza Chromium SIN `--use-fake-ui-for-media-stream` (que concede el permiso solo) y con un
// contexto que no lo concede. Chromium sin cabeza no puede enseñar el diálogo y rechaza en
// unos 80 ms (con NotSupportedError, medido el 27/10/2026). No se fija ese nombre, que es cosa
// del navegador sin cabeza: se exige que la app avise en español, ofrezca el modo imagen, no
// se quede colgada y deje reintentar.
test('caso 10 · sin el permiso de cámara la app avisa enseguida, ofrece el modo imagen y deja reintentar', async ({ playwright }) => {
  const navegador = await playwright.chromium.launch({ args: ['--use-fake-device-for-media-stream'] });
  try {
    const contexto = await navegador.newContext({ ...devices['Pixel 7'], baseURL: ORIGEN });
    const page = await contexto.newPage();
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto(RUTA);
    const alerta = page.locator('section[aria-label="Cámara en vivo"] [role=alert]');
    await expect(async () => {
      await page.getByRole('button', { name: 'Activar cámara' }).click({ timeout: 1000 });
      await expect(alerta).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
    await expect(alerta).toContainText('cámara');
    await expect(alerta, 'ofrece la salida').toContainText('modo imagen');
    await expect(page.locator('video')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Activar cámara' })).toBeEnabled();
    // Reintentar no la cuelga: vuelve a avisar
    await page.getByRole('button', { name: 'Activar cámara' }).click();
    await expect(alerta).toBeVisible();
    expect(errores).toEqual([]);
  } finally {
    await navegador.close();
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 27/10/2026 — hoy fallan a propósito (test.fail)
// ═══════════════════════════════════════════════════════════════════════════

test('ABIERTO · el nombre sobre su propio color se lee con al menos 3:1 (texto grande, WCAG 1.4.3)', async ({ page }) => {
  test.fail(); // ABIERTO: textoSobre() elige blanco o #1A1A1A con la luma Rec.601 sobre 0-255 y corte 0,6
  // La app promete, en la tarjeta «Baja visión» y en el FAQPage, que «el nombre se muestra en
  // letra grande y con alto contraste sobre el propio color». El nombre mide 1,6-2,4 rem con
  // peso 900, así que es texto GRANDE y le basta 3:1. Calculado a mano con la luminancia
  // relativa de WCAG 2.x (sRGB linealizado, 0,2126 / 0,7152 / 0,0722):
  //   #00FF00 → la app pone BLANCO: 1,37:1 (con #1A1A1A serían 12,68:1)
  //   #2ECC71 («Verde esmeralda», de la propia paleta) → blanco: 2,10:1 (con #1A1A1A, 8,28:1)
  //   #FF7F00 («Naranja», de la propia paleta) → blanco: 2,53:1 (con #1A1A1A, 6,87:1)
  // Sobre una rejilla sRGB de paso 5 (140.608 colores), el 9,9 % sale por debajo de 3:1.
  await page.goto(RUTA);
  await abrirModoFoto(page);
  const pobres: string[] = [];
  for (const hex of ['#00FF00', '#2ECC71', '#FF7F00']) {
    await leerFoto(page, hex);
    const k = await contrasteEn(page, `${SECCION_RESULTADO} > div > span`, `${SECCION_RESULTADO} > div`);
    if (k < 3) pobres.push(`${hex} ${k.toFixed(2)}:1`);
  }
  expect(pobres, 'nombres por debajo de 3:1 sobre su color').toEqual([]);
});

test('ABIERTO · la cifra del veredicto cae dentro del tramo que nombra', async ({ page }) => {
  test.fail(); // ABIERTO: el tramo se decide con el ΔE00 sin redondear y se enseña con un decimal
  // La nota de la app dice «por debajo de 1 no se aprecia y por encima de 6 se ve a simple
  // vista», y los tramos son [0; 1) iguales, [1; 2,5) casi iguales, [2,5; 6) parecidos y
  // [6; ∞) distintos. Calculado con la implementación propia:
  //   #808080 / #807F80: ΔE00 0,9712 → «No se distinguen» pero se escribe «1,0»
  //   #808080 / #7B8581: ΔE00 5,9772 → «Parecidos» pero se escribe «6,0»
  // y el caso 6 enseña la otra cara: 1,0192 se escribe «1,0» con «Casi iguales» y 6,0163 «6,0»
  // con «Colores distintos». La misma cifra en pantalla, dos veredictos.
  const TRAMOS: [RegExp, number, number][] = [
    [/^No se distinguen/, 0, 1],
    [/^Casi iguales/, 1, 2.5],
    [/^Parecidos/, 2.5, 6],
    [/^Colores distintos/, 6, Infinity],
  ];
  await page.goto(RUTA);
  await abrirModoFoto(page);
  const incoherentes: string[] = [];
  for (const [a, b] of [['#808080', '#807F80'], ['#808080', '#7B8581']]) {
    await compararPar(page, a, b);
    const v = await deltaDelVeredicto(page);
    const [, min, max] = TRAMOS.find(([re]) => re.test(v.texto))!;
    if (!(v.cifra >= min && v.cifra < max)) incoherentes.push(`${a}/${b}: «${v.texto}»`);
  }
  expect(incoherentes).toEqual([]);
});

test('ABIERTO · guardar el color A se anuncia (WCAG 4.1.3)', async ({ page }) => {
  test.fail(); // ABIERTO: la única región viva del bloque es la del veredicto, vacía hasta tener B
  // Al pulsar «Guardar como color A» aparece la muestra A y «Falta: guarda un color como B»,
  // pero fuera de toda región viva: el role="status" queda vacío («» medido el 27/10/2026) y
  // un lector de pantalla no dice nada. En un Pixel 7 el bloque nace además casi fuera de la
  // pantalla (su borde superior a 770 px de 839), así que tampoco se ve el efecto del botón.
  await page.goto(RUTA);
  await abrirModoFoto(page);
  await leerFoto(page, '#9D7181');
  await page.getByRole('button', { name: 'Guardar como color A' }).click();
  const vivo = await page
    .locator(`${SECCION_COMPARAR} [role=status], ${SECCION_COMPARAR} [aria-live], ${SECCION_COMPARAR}[aria-live]`)
    .allTextContents();
  expect(vivo.join(' '), 'lo que se anuncia al guardar A').toMatch(/Lila|#9D7181/);
});

test('ABIERTO · las cabeceras de la tabla comparativa cumplen 4,5:1 en modo oscuro', async ({ page }) => {
  test.fail(); // ABIERTO: --primary-texto sobre rgba(46,134,171,0,15) da 4,34:1 en oscuro
  // `.comparativaTable th` (la tabla «Cómo vería los dos colores cada tipo de visión» y la del
  // bloque educativo): texto de 0,82 rem y peso 700, así que NO es texto grande y pide 4,5:1.
  // Medido en la página: rgb(63, 165, 209) sobre rgba(46, 134, 171, 0,15) compuesto con la
  // tarjeta #2A2A2A (≈ rgb(43, 56, 61)) = 4,34:1 en oscuro (en claro, rgb(38, 113, 143) sobre
  // ≈ rgb(234, 243, 247) = 4,86:1, cumple).
  await page.goto(RUTA);
  await abrirModoFoto(page);
  await compararPar(page, '#9D7181', '#578D7F');
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  // Medir solo con el tema oscuro YA pintado: el fondo de la tarjeta es --bg-card #2A2A2A. En
  // claro la cabecera da 4,86:1, así que medir a destiempo daría un aprobado falso.
  await expect
    .poll(() => page.locator(SECCION_COMPARAR).evaluate((s) => getComputedStyle(s).backgroundColor))
    .toBe('rgb(42, 42, 42)');
  const sel = `${SECCION_COMPARAR} thead th`;
  const k = await contrasteEn(page, sel, sel);
  expect(k, `contraste de la cabecera en oscuro: ${k.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
});

test('ABIERTO · el featureList del JSON-LD separa el % de la cifra', async ({ page }) => {
  test.fail(); // ABIERTO: «Procesamiento 100% en el dispositivo» en metadata.ts → jsonLd.features
  // CLAUDE.md global §2 (25/09/2026): «15 %», separado con espacio duro U+00A0; lo que ya pega
  // el % se corrige app a app al pasar el Inspector.
  await page.goto(RUTA);
  const features = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent ?? '{}'))
      .filter((j) => j['@type'] === 'WebApplication')
      .flatMap((j) => j.featureList ?? []),
  );
  expect(features.length).toBeGreaterThanOrEqual(4);
  expect(features.filter((f: string) => /\d%/.test(f))).toEqual([]);
});
