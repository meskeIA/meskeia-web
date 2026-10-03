import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * Adaptador de Lectura para Dislexia — test de regresión (Inspector, 18/09/2026)
 *
 * La app no calcula ninguna cifra, pero su promesa SÍ es comprobable: cinco deslizadores
 * dicen un número y el texto de la vista previa tiene que recibir EXACTAMENTE ese número.
 * La verdad no vive en un resultado en pantalla sino en el CSS computado del bloque
 * adaptado, así que todo lo que se afirma aquí se lee con `toHaveCSS`.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (para poder auditar este fichero sin ejecutarlo)
 *   La app escribe estilos en línea sobre el bloque de vista previa (page.tsx, `estilosVista`):
 *       font-size      → `${tamano}px`                 tamaño en píxeles, tal cual
 *       letter-spacing → `${espaciadoLetras}em`        em SOBRE SU PROPIO font-size
 *       word-spacing   → `${espaciadoPalabras}em`      ídem
 *       line-height    → `${interlineado}`             sin unidad → multiplica al font-size
 *       max-width      → `${anchoColumna}%`            porcentaje, que el navegador deja en %
 *   Como `letter-spacing` y `word-spacing` van en em y el em se resuelve contra el font-size
 *   DEL PROPIO ELEMENTO, el píxel esperado es siempre el producto de los dos deslizadores:
 *       28 px × 0,12 em = 3,36 px  ·  28 px × 0,40 em = 11,2 px  ·  28 px × 2,5 = 70 px
 *   Ninguno de estos números se copió de lo que devuelve la app: se calcularon antes de
 *   abrir el navegador y después se comprobaron uno a uno en producción.
 *
 * RANGOS DECLARADOS POR LA APP (page.tsx)
 *   tamaño 14–36 px paso 1 · letras 0–0,3 em paso 0,01 · palabras 0–0,5 em paso 0,01
 *   interlineado 1,2–3,0 paso 0,1 · ancho 40–100 % paso 1 (paso 5 hasta el 18/09/2026,
 *   hallazgo 881, REPARADO)
 *   Por defecto: lexend · 20 px · 0,05 · 0,15 · 1,9 · 68 % · fondo crema #FEFDF6.
 *
 * ⚠️ POR QUÉ NINGÚN CASO PARTE DEL VALOR POR DEFECTO
 *   Sembrar en un deslizador el valor que ya tiene no prueba nada: el estado de React ya
 *   coincide y el caso daría verde aunque el evento se perdiera (ver `_hidratacion.ts`).
 *   Los cinco valores de cada caso son distintos de los de `PREFERENCIAS_DEFAULT`.
 *
 * ⚠️ `.textoAdaptado` lleva `transition: all 0.3s ease`, así que leer el estilo computado
 *   justo después de mover un deslizador devuelve un valor INTERMEDIO de la animación
 *   (medido: 25,327 px a los 100 ms de pedir 28 px). `toHaveCSS` reintenta hasta 5 s, que
 *   es lo que hace fiables estas comprobaciones; un `evaluate` suelto no lo sería.
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER (fijado por los CASOS 1, 2, 3 y 4)
 *   Los cinco deslizadores aplican su valor exacto, en el interior del rango y en los dos
 *   extremos; el `<input type="range">` capa por su cuenta lo que se salga del rango; el
 *   texto vacío muestra el marcador de posición sin perder los ajustes; 30.000 caracteres
 *   no rompen nada; y lo que se ajusta en el panel SÍ queda escrito en el almacenamiento
 *   del navegador. Recuperarlo fallaba hasta el 18/09/2026 (hallazgos 877 y 932, REPARADOS).
 *
 * ⚠️ ESTOS CASOS CORREN CONTRA EL SERVIDOR QUE HAYA EN EL 3050: playwright.config.ts reutiliza
 *   el que esté levantado (`next start` en las tandas del Inspector) y, si no hay ninguno,
 *   arranca `next dev`. La app NO se comporta igual en los dos, porque en dev React monta los
 *   efectos dos veces (StrictMode). Donde el entorno cambia el resultado se dice en el propio
 *   caso, con lo medido en cada uno. Ninguna afirmación de este fichero depende de en cuál se
 *   ejecute: las que valen para los dos entornos están escritas para fallar en los dos.
 *
 * LOS 9 HALLAZGOS del 18/09/2026 se repararon ese mismo día y sus casos, marcados aquí como
 * REGRESIÓN, pasaron de `test.fail()` a candado. Cada uno conserva escrito lo que la app hacía
 * antes y con qué medida se demostró: es lo que permite saber, si alguno se vuelve a poner
 * rojo, si lo que ha cambiado es la app o la afirmación. Re-inspección del 03/10/2026: los
 * nueve siguen cerrados.
 *
 * RE-INSPECCIÓN DEL 03/10/2026 (CASOS 6 a 11) — la app entró por la cola «firma de rotura»:
 * las visitas cortas pasaron del 68 % al 90 % desde justo después de la reparación del 18/09.
 * Lo que la explica con más probabilidad es la propia reparación del hallazgo 876: el
 * `overflow-wrap: anywhere` que evita que el panel se salga de la pantalla PARTE LAS PALABRAS
 * por cualquier letra y sin guion en cuanto no caben en la línea, y en móvil la columna del
 * texto adaptado mide 130 px (Pixel 7) o 95 px (360 px) con los ajustes de fábrica. Lo que
 * sigue abierto va en `test.fail()` con «ABIERTO, hallazgo (inspector 03/10/2026)».
 *
 * REPARACIÓN DEL 03/10/2026 (hallazgos 2724-2731): los ocho casos abiertos pasan a candado.
 *   · 2724 — la columna del texto adaptado tiene un SUELO de 20 caracteres (min-width) y los
 *     rellenos del móvil son más ajustados; `overflow-wrap: anywhere` pasa a `break-word`,
 *     que solo parte lo que no cabe ni en una línea entera. CASOS 8, 8.bis y 8.ter.
 *   · 2725 — en móvil, una muestra con los mismos estilos se queda fija arriba mientras se
 *     recorren los ajustes. CASO 9.
 *   · 2726/2729 — tokens de marca accesibles y marcadores de texto vacío con color propio.
 *     CASOS 12, 12.bis y 12.ter.
 *   · 2727/2728 — JSON-LD y bloque educativo con fuentes. CASOS 11 y 11.bis.
 *   · 2730 — «5 %» y «20 px» con U+00A0. CASO 10.
 *   · 2731 — «Copiar texto» lleva text/html con estilos en línea. CASOS 13.bis y 13.ter.
 */

/** Lo que la app guarda en `localStorage`, con los campos que miran estos casos. */
interface Guardado {
  fuente: string;
  tamano: number;
  espaciadoPalabras: number;
  colorFondo: string;
}

const RUTA = '/adaptador-dislexia/';

/** Los cinco deslizadores. Se pasan a `esperarHidratacion`: sin ellos no hay app. */
const DESLIZADORES = [
  '#slider-tamano',
  '#slider-letras',
  '#slider-palabras',
  '#slider-lineas',
  '#slider-ancho',
] as const;

/** El bloque que recibe los estilos en línea: es donde vive la verdad de esta app. */
const vistaPrevia = (page: Page) => page.getByRole('region', { name: 'Texto con formato aplicado' });

/** Texto de la etiqueta de un deslizador, que es donde la app dice qué valor cree tener. */
const etiqueta = (page: Page, id: string) => page.locator(`label[for="${id}"]`);

/** Borde derecho del panel de ajustes y ancho del viewport, para medir el recorte. */
async function bordeDerechoDelPanel(page: Page): Promise<{ derecha: number; viewport: number }> {
  return page.evaluate(() => {
    const aside = document.querySelector('aside[aria-label="Ajustes de lectura"]')!;
    return {
      derecha: Math.round(aside.getBoundingClientRect().right),
      viewport: window.innerWidth,
    };
  });
}

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, DESLIZADORES);
}

/**
 * Espera a que la vista previa pinte con Lexend, que es la fuente de fábrica y la más ancha de
 * las tres: medir con Arial (la de reserva mientras carga) aprobaría de más. Si Google Fonts no
 * responde en esta máquina, se mide con lo que haya y el caso lo dice en su anotación.
 */
async function esperarLexend(page: Page): Promise<void> {
  const ok = await page
    .waitForFunction(
      () =>
        document.fonts.check('20px "Lexend Deca"') &&
        getComputedStyle(
          document.querySelector('[aria-label="Texto con formato aplicado"]')!,
        ).fontFamily.includes('Lexend'),
      null,
      { timeout: 15000 },
    )
    .then(() => true)
    .catch(() => false);
  if (!ok) test.info().annotations.push({ type: 'aviso', description: 'Lexend no cargó: medido con Arial' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/**
 * Lo que se sale por la derecha de la pantalla, y lo que desborda la caja crema por dentro.
 * `html` y `body` llevan `overflow-x: hidden` (globals.css), así que el `scrollWidth` del
 * documento no basta: se miran los bordes de las piezas que pueden empujar.
 */
async function desbordes(page: Page): Promise<{ fuera: string[]; cajaDesborda: boolean }> {
  return page.evaluate(() => {
    const ancho = window.innerWidth;
    const piezas: Record<string, Element | null> = {
      panel: document.querySelector('aside[aria-label="Ajustes de lectura"]'),
      principal: document.querySelector('main'),
      vista: document.querySelector('[aria-label="Texto con formato aplicado"]'),
    };
    const fuera = Object.entries(piezas)
      .filter(([, el]) => !el || el.getBoundingClientRect().right > ancho + 0.5)
      .map(([n]) => n);
    const caja = piezas.vista as HTMLElement;
    return { fuera, cajaDesborda: caja.scrollWidth > caja.clientWidth + 1 };
  });
}

/** Los ajustes que recomienda la guía de la propia app: 24 px · letras 12 % · ancho 60 %. */
async function ajustesDeLaGuia(page: Page): Promise<void> {
  await sembrarValor(page, '#slider-tamano', 24);
  await sembrarValor(page, '#slider-letras', 0.12);
  await sembrarValor(page, '#slider-ancho', 60);
  await expect(vistaPrevia(page)).toHaveCSS('font-size', '24px');
  await expect(vistaPrevia(page)).toHaveCSS('letter-spacing', '2.88px'); // 0,12 em × 24 px
}

/** Abre la app en el tema pedido (next-themes lo lee de `meskeia-theme` antes de pintar). */
async function abrirEnTema(page: Page, tema: 'light' | 'dark') {
  await page.addInitScript((t) => localStorage.setItem('meskeia-theme', t), tema);
  await abrir(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
}

/**
 * Palabras del texto adaptado que el navegador reparte entre dos líneas o más. Se mide por
 * rectángulos de línea de un Range sobre cada palabra: si sus trozos caen en alturas
 * distintas, la palabra está partida.
 */
async function palabrasPartidas(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const region = document.querySelector('[aria-label="Texto con formato aplicado"]');
    if (!region) return ['(no hay vista previa)'];
    const partidas: string[] = [];
    const recorrido = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
    for (let nodo = recorrido.nextNode(); nodo; nodo = recorrido.nextNode()) {
      for (const m of (nodo.textContent ?? '').matchAll(/\S+/g)) {
        const inicio = m.index ?? 0;
        const rango = document.createRange();
        rango.setStart(nodo, inicio);
        rango.setEnd(nodo, inicio + m[0].length);
        const alturas = new Set(Array.from(rango.getClientRects()).map((r) => Math.round(r.top)));
        if (alturas.size > 1) partidas.push(m[0]);
      }
    }
    return partidas;
  });
}

/**
 * Contraste WCAG de un elemento contra su fondo EFECTIVO: compone las capas semitransparentes
 * de los ancestros hasta dar con una opaca. `pseudo` permite medir `::placeholder`.
 */
async function contraste(page: Page, selector: string, pseudo: string | null = null): Promise<number> {
  return page.evaluate(
    ({ sel, pseudoElemento }) => {
      interface Rgba {
        r: number;
        g: number;
        b: number;
        a: number;
      }
      const leer = (c: string): Rgba => {
        const n = (c.match(/[\d.]+/g) ?? []).map(Number);
        return { r: n[0] ?? 0, g: n[1] ?? 0, b: n[2] ?? 0, a: n.length > 3 ? n[3] : 1 };
      };
      const sobre = (arriba: Rgba, abajo: Rgba): Rgba => ({
        r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
        g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
        b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
        a: 1,
      });
      const el = document.querySelector(sel);
      if (!el) throw new Error(`No existe «${sel}»`);
      const capas: Rgba[] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = leer(getComputedStyle(n).backgroundColor);
        if (c.a > 0) {
          capas.push(c);
          if (c.a >= 1) break;
        }
      }
      let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
      const texto = sobre(leer(getComputedStyle(el, pseudoElemento).color), fondo);
      const canal = (v: number): number => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const lum = (c: Rgba): number => 0.2126 * canal(c.r) + 0.7152 * canal(c.g) + 0.0722 * canal(c.b);
      const [claro, oscuro] = [lum(texto), lum(fondo)].sort((a, b) => b - a);
      return Math.round(((claro + 0.05) / (oscuro + 0.05)) * 100) / 100;
    },
    { sel: selector, pseudoElemento: pseudo },
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (escritorio) — cada deslizador aplica EXACTAMENTE su valor
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 — los cinco deslizadores llegan al CSS del texto adaptado con el valor exacto', async ({
    page,
  }) => {
    // Los cinco distintos del valor por defecto (20 · 0,05 · 0,15 · 1,9 · 68).
    await sembrarValor(page, '#slider-tamano', 28);
    await sembrarValor(page, '#slider-letras', 0.12);
    await sembrarValor(page, '#slider-palabras', 0.4);
    await sembrarValor(page, '#slider-lineas', 2.5);
    await sembrarValor(page, '#slider-ancho', 50);

    const texto = vistaPrevia(page);
    await expect(texto).toHaveCSS('font-size', '28px'); // 28 px, tal cual
    await expect(texto).toHaveCSS('letter-spacing', '3.36px'); // 0,12 em × 28 px
    await expect(texto).toHaveCSS('word-spacing', '11.2px'); // 0,40 em × 28 px
    await expect(texto).toHaveCSS('line-height', '70px'); // 2,5 sin unidad × 28 px
    await expect(texto).toHaveCSS('max-width', '50%'); // 50 % del contenedor

    // Y lo que la app dice creer, que es lo que lee el usuario en el panel.
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 28 px');
    await expect(etiqueta(page, 'slider-letras')).toHaveText('Espacio letras: 12 %');
    await expect(etiqueta(page, 'slider-palabras')).toHaveText('Espacio palabras: 40 %');
    await expect(etiqueta(page, 'slider-ancho')).toHaveText('Ancho columna: 50 %');
  });

  test('CASO 1.bis — la fuente y el color de fondo elegidos llegan al texto, y quedan marcados', async ({
    page,
  }) => {
    // «Mono» y «Azul pálido»: ninguno es el valor por defecto (lexend + crema #FEFDF6).
    await page.getByRole('button', { name: /mono/i }).click();
    await page.getByRole('button', { name: 'Azul pálido' }).click();

    const texto = vistaPrevia(page);
    await expect(texto).toHaveCSS('font-family', '"Courier New", Courier, monospace');
    await expect(texto).toHaveCSS('background-color', 'rgb(238, 244, 255)'); // #EEF4FF
    await expect(page.getByRole('button', { name: /mono/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Azul pálido' })).toHaveAttribute('aria-pressed', 'true');

    // La app solo aplica Lexend cuando el <link> a Google Fonts ha terminado de cargar
    // (`fonteCargada` en page.tsx); hasta ese momento cae a Arial a propósito. Hay que
    // ESPERAR a esa condición: preguntar por `document.fonts.check` en un instante
    // cualquiera es una condición DISTINTA de la de la app, y elegir el valor esperado con
    // ella hacía que el caso fallase de forma intermitente cuando la fuente llegaba entre
    // la pregunta y la comprobación.
    await page.getByRole('button', { name: /lexend/i }).click();
    const lexendDisponible = await page
      .waitForFunction(() => document.fonts.check('20px "Lexend Deca"'), null, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    test.skip(
      !lexendDisponible,
      'Google Fonts no está disponible en esta máquina; la app cae a Arial a propósito.',
    );
    await expect(texto).toHaveCSS('font-family', '"Lexend Deca", Arial, sans-serif');
  });

  test('REGRESIÓN — el deslizador de ancho arranca en 70 mientras la etiqueta y el texto dicen 68 %', async ({
    page,
  }) => {
    // REPARADO el 18/09/2026 (hallazgo 881). `anchoColumna` por defecto es 68, pero el
    // control era min=40 step=5: 68 no caía en la rejilla y el navegador lo subía a 70. La
    // etiqueta decía 68 % y el texto se maquetaba al 68 %, así que el pomo —y el valor que
    // anunciaba un lector de pantalla— decían una cosa y la app hacía otra. Hoy es step=1.
    await expect(page.locator('#slider-ancho')).toHaveValue('68');
    await expect(etiqueta(page, 'slider-ancho')).toHaveText('Ancho columna: 68 %');
    await expect(vistaPrevia(page)).toHaveCSS('max-width', '68%');
  });

  test('REGRESIÓN — el interlineado se escribe con punto decimal, no con coma', async ({ page }) => {
    // REPARADO el 18/09/2026 (hallazgo 883). CLAUDE.md §2: formato español obligatorio, y
    // `toFixed()` prohibido para presentar cifras. `prefs.interlineado.toFixed(1)` imprimía
    // «1.9» en la etiqueta del control; hoy pasa por `formatNumber`.
    await expect(etiqueta(page, 'slider-lineas')).toHaveText('Interlineado: 1,9');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 (Pixel 7) — los extremos de los cinco deslizadores, y qué le pasa a la pantalla
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en móvil (Pixel 7)', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device
  // trae `defaultBrowserType` y Playwright no lo admite dentro de un describe.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
    expect(page.viewportSize()).toEqual({ width: 412, height: 839 }); // devices['Pixel 7']
  });

  test('CASO 2 — con todo al máximo el texto recibe los valores del extremo superior', async ({
    page,
  }) => {
    await sembrarValor(page, '#slider-tamano', 36);
    await sembrarValor(page, '#slider-letras', 0.3);
    await sembrarValor(page, '#slider-palabras', 0.5);
    await sembrarValor(page, '#slider-lineas', 3);
    await sembrarValor(page, '#slider-ancho', 100);

    const texto = vistaPrevia(page);
    await expect(texto).toHaveCSS('font-size', '36px');
    await expect(texto).toHaveCSS('letter-spacing', '10.8px'); // 0,3 em × 36 px
    await expect(texto).toHaveCSS('word-spacing', '18px'); // 0,5 em × 36 px
    await expect(texto).toHaveCSS('line-height', '108px'); // 3,0 × 36 px
    await expect(texto).toHaveCSS('max-width', '100%');
    await expect(etiqueta(page, 'slider-lineas')).toHaveText('Interlineado: 3,0');
  });

  test('CASO 2.bis — con todo al mínimo el texto sigue siendo legible y no hay valores basura', async ({
    page,
  }) => {
    await sembrarValor(page, '#slider-tamano', 14);
    await sembrarValor(page, '#slider-letras', 0);
    await sembrarValor(page, '#slider-palabras', 0);
    await sembrarValor(page, '#slider-lineas', 1.2);
    await sembrarValor(page, '#slider-ancho', 40);

    const texto = vistaPrevia(page);
    await expect(texto).toHaveCSS('font-size', '14px');
    // `letter-spacing: 0em` lo normaliza el navegador a «normal»; `word-spacing: 0em` no.
    await expect(texto).toHaveCSS('letter-spacing', 'normal');
    await expect(texto).toHaveCSS('word-spacing', '0px');
    await expect(texto).toHaveCSS('line-height', '16.8px'); // 1,2 × 14 px
    await expect(texto).toHaveCSS('max-width', '40%');
    // 14 px es el mínimo que declara la app: por debajo dejaría de cumplir su propia promesa.
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 14 px');
  });

  test('CASO 2.ter — un valor fuera de rango lo capa el propio control, sin romper nada', async ({
    page,
  }) => {
    expect(await sembrarValorAcotado(page, '#slider-tamano', 999)).toBe('36'); // max = 36
    expect(await sembrarValorAcotado(page, '#slider-letras', -5)).toBe('0'); // min = 0
    expect(await sembrarValorAcotado(page, '#slider-ancho', 1000)).toBe('100'); // max = 100

    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 36 px');
    await expect(etiqueta(page, 'slider-letras')).toHaveText('Espacio letras: 0 %');
    await expect(etiqueta(page, 'slider-ancho')).toHaveText('Ancho columna: 100 %');
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '36px');
  });

  test('REGRESIÓN — al subir el tamaño al máximo, el panel de ajustes se sale de la pantalla', async ({
    page,
  }) => {
    // REPARADO el 18/09/2026 (hallazgo 876). El ancho mínimo del bloque de texto (su palabra
    // más larga) estiraba la única columna del grid en móvil, y con ella el panel de ajustes.
    // Medido en producción con tamaño = 36: el panel acababa en 454 px sobre un viewport de
    // 412. Como `html, body` llevan `overflow-x: hidden` (globals.css), no había forma de
    // desplazarse hasta lo que quedaba fuera. ⚠️ La reparación (`overflow-wrap: anywhere`)
    // abrió el hallazgo del CASO 8: ver más abajo.
    await sembrarValor(page, '#slider-tamano', 36);
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '36px');

    const { derecha, viewport } = await bordeDerechoDelPanel(page);
    expect(derecha).toBeLessThanOrEqual(viewport);
  });

  test('REGRESIÓN — pegar un texto con una palabra larga expulsa los controles fuera de la pantalla', async ({
    page,
  }) => {
    // REPARADO el 18/09/2026 (hallazgo 876). Sin tocar ningún ajuste bastaba con pegar un
    // texto que contuviera un enlace o un correo largo, que es justo lo que la app invita a
    // pegar («un artículo, apuntes del colegio, un correo de trabajo»). Medido en producción
    // con este mismo correo de 83 caracteres: el panel llegaba a 995 px sobre un viewport de
    // 412, solo el 41 % del recorrido de los deslizadores quedaba en pantalla y dos de los
    // cinco botones de color («Azul pálido» y «Gris suave») quedaban enteros fuera.
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    const conCorreo =
      'Escribe a coordinacion.pedagogica.centro.educativo@institutoejemplolargo.edu.example';
    await textarea.fill(conCorreo);
    await esperarValorEnReact(page, textarea, conCorreo);

    const { derecha, viewport } = await bordeDerechoDelPanel(page);
    expect(derecha).toBeLessThanOrEqual(viewport);
  });

  test('CASO 8 — con los ajustes de fábrica, ninguna palabra del texto de ejemplo se parte entre dos líneas', async ({
    page,
  }) => {
    // REPARADO el 03/10/2026 (hallazgo 2724). Hoy: suelo de 20 caracteres en la columna y
    // rellenos de 16 px en móvil: 412 − 32 − 2 − 32 − 4 − 16 = 326 px de caja, y el suelo
    // (20 ch de Lexend a 20 px ≈ 250 px + 1 em del espaciado + 32 de relleno) supera al 68 %
    // (222 px), así que manda el suelo: unas 22 letras por línea. Lo que sigue es la
    // medida ANTERIOR, que es la que explica el caso:
    //
    // De dónde sale el ancho de la columna, calculado ANTES de abrir el navegador (Pixel 7,
    // 412 px): 412 − 2×24 de `.container` = 364 · − 2×1 de borde − 2×24 de `.seccionVista`
    // = 314 · − 2×2 de borde − 2×24 de `.vistaContenedor` = 262 · × 68 % (`anchoColumna` de
    // fábrica) = 178,2 px de caja · − 2×24 de su padding = 130,2 px para el texto. Con Lexend
    // a 20 px y 0,05 em de espaciado caben unas 10 letras por línea, y el texto de ejemplo
    // tiene palabras de 11 a 13 («correctamente», «configuración»).
    //
    // Antes del 18/09/2026 esas palabras desbordaban la caja crema pero salían ENTERAS. La
    // reparación del hallazgo 876 añadió `overflow-wrap: anywhere`, que las parte por donde
    // toque y sin guion: medido el 03/10/2026, «correctame|nte», «configuraci|ón»,
    // «experiment|a» y «combinació|n» (4 de 85 palabras). Con los ajustes que recomienda la
    // propia guía de la app (24 px · letras 12 % · ancho 60 %) son 32 de 85, en una columna de
    // 109,2 px. La Ortografía de la RAE (2010) solo admite partir por sílabas y con guion, y
    // en un lector para dislexia lo esperable es no partir. Simulando el CSS anterior al
    // 18/09 sobre esta misma página: 0 palabras partidas y el panel dentro de la pantalla.
    await esperarLexend(page);
    await expect.poll(() => palabrasPartidas(page), { timeout: 3000 }).toEqual([]);
    expect(await desbordes(page)).toEqual({ fuera: [], cajaDesborda: false });
  });

  test('CASO 8.ter (Pixel 7) — con los ajustes de la guía, ninguna palabra partida ni nada fuera de la pantalla', async ({
    page,
  }) => {
    // La guía de la app recomienda 24 px, letras al 10-15 % y columna al 55-65 %. Medido el
    // 03/10/2026 antes de reparar: 32 de 85 palabras partidas en una columna de 109 px.
    await ajustesDeLaGuia(page);
    await esperarLexend(page);
    await expect.poll(() => palabrasPartidas(page), { timeout: 3000 }).toEqual([]);
    expect(await desbordes(page)).toEqual({ fuera: [], cajaDesborda: false });
  });

  test('CASO 8.quater (Pixel 7) — una URL más larga que la línea se parte DENTRO de la caja (y solo ella)', async ({
    page,
  }) => {
    // El último recurso de `overflow-wrap: break-word`: lo que no cabe ni en una línea
    // entera se parte para no salirse de la caja crema (hallazgo 876). Las palabras normales
    // de la misma frase, no.
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    const conCorreo =
      'Escribe a coordinacion.pedagogica.centro.educativo@institutoejemplolargo.edu.example';
    await textarea.fill(conCorreo);
    await esperarValorEnReact(page, textarea, conCorreo);
    await esperarLexend(page);
    await expect.poll(() => palabrasPartidas(page), { timeout: 3000 }).toEqual([
      'coordinacion.pedagogica.centro.educativo@institutoejemplolargo.edu.example',
    ]);
    expect(await desbordes(page)).toEqual({ fuera: [], cajaDesborda: false });
  });

  test('CASO 9 — mientras se mueve un deslizador se ve al menos una parte del texto adaptado', async ({
    page,
  }) => {
    // REPARADO el 03/10/2026 (hallazgo 2725) con una muestra fija arriba, en el propio panel
    // de ajustes, que aplica los mismos estilos que la vista previa al primer párrafo. La
    // vista previa sigue donde estaba: lo que se comprueba ahora es que, con CADA deslizador
    // en el centro de la pantalla, la muestra está entera a la vista, no la tapa la barra del
    // logo ni tapa ella al pomo, y recibe el valor que se acaba de poner.
    //
    // El caso de origen —la medida que motivó el hallazgo— era este: la app promete «vista previa en tiempo real» (metadata.ts). En móvil el grid pasa a una
    // columna y el orden es panel → área de texto → vista previa: medido el 03/10/2026, la
    // vista previa empieza 1.263 px por debajo del deslizador de tamaño, con 839 px de
    // pantalla. No hay posición de desplazamiento en la que se vean a la vez el pomo y el
    // efecto de moverlo. Esperado: que la distancia entre los dos más el alto del deslizador
    // quepa en la altura de la pantalla.
    // La que se ve: la copia fija si está pintada, y si no, la que va en línea en el panel.
    const muestraVisible = () =>
      page.locator('[data-muestra="fija"], [data-muestra="en-linea"]').last().locator('[class*="muestraTexto"]');
    const valores: Record<string, number> = {
      '#slider-tamano': 30,
      '#slider-letras': 0.2,
      '#slider-palabras': 0.3,
      '#slider-lineas': 2.6,
      '#slider-ancho': 90,
    };
    for (const [sel, valor] of Object.entries(valores)) {
      await page.locator(sel).evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const v = await page.evaluate((selector) => {
        const s = document.querySelector(selector)!.getBoundingClientRect();
        const caja =
          document.querySelector('[data-muestra="fija"]') ?? document.querySelector('[data-muestra="en-linea"]');
        const m = caja!.querySelector('[class*="muestraTexto"]')!.getBoundingClientRect();
        // ¿Lo que se ve en el centro de la muestra es la muestra, o la barra del logo encima?
        const enMedio = document.elementFromPoint(m.left + m.width / 2, m.top + 4);
        return {
          aLaVista: m.top >= 0 && m.bottom <= window.innerHeight && m.height > 40,
          noTapaAlPomo: m.bottom <= s.top,
          noLaTapaNada: !!enMedio?.closest('[class*="muestraTexto"]'),
        };
      }, sel);
      expect(v, `con ${sel} en el centro`).toEqual({ aLaVista: true, noTapaAlPomo: true, noLaTapaNada: true });
      await sembrarValor(page, sel, valor);
    }
    // Y la muestra lleva lo que se acaba de poner, igual que la vista previa.
    await expect(muestraVisible()).toHaveCSS('font-size', '30px');
    await expect(muestraVisible()).toHaveCSS('letter-spacing', '6px'); // 0,2 em × 30 px
    await expect(muestraVisible()).toHaveCSS('line-height', '78px'); // 2,6 × 30 px
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '30px');
  });

  test('CASO 9.ter — el texto de ejemplo ya no manda a «la izquierda», que en móvil no existe', async ({
    page,
  }) => {
    // Hallazgo 2725, segunda parte: «Ajusta las opciones de la izquierda» solo vale en escritorio.
    await expect(vistaPrevia(page)).not.toContainText('izquierda');
  });

  test('CASO 9.bis — con el dedo, los botones de fuente y de fondo responden', async ({ page }) => {
    // Pulsación táctil real (`tap`, que exige hasTouch). Ninguno de los dos es el de fábrica.
    await page.getByRole('button', { name: /mono/i }).tap();
    await page.getByRole('button', { name: 'Gris suave' }).tap();

    await expect(page.getByRole('button', { name: /mono/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Gris suave' })).toHaveAttribute('aria-pressed', 'true');
    const texto = vistaPrevia(page);
    await expect(texto).toHaveCSS('font-family', '"Courier New", Courier, monospace');
    await expect(texto).toHaveCSS('background-color', 'rgb(245, 245, 245)'); // #F5F5F5
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 8.bis (360 px) — el móvil estrecho, donde la columna se queda en 95 px
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en móvil estrecho (360 px)', () => {
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 8.bis — con los ajustes de fábrica, ninguna palabra del texto de ejemplo se parte entre dos líneas', async ({
    page,
  }) => {
    // REPARADO el 03/10/2026 (hallazgo 2724): 360 − 32 − 2 − 32 − 4 − 16 = 274 px de caja,
    // todo para la columna (el suelo de 20 caracteres supera al 68 %). Medida ANTERIOR:
    //
    // Mismo cálculo que el CASO 8 con 360 px: 360 − 48 = 312 · − 50 = 262 · − 52 = 210 ·
    // × 68 % = 142,8 · − 48 = 94,8 px para el texto, unas 7 letras por línea. Medido el
    // 03/10/2026: 20 de 85 palabras partidas («aprendiz|aje», «configur|ación»,
    // «diferent|e,»…), y el texto de ejemplo de 567 caracteres ocupa 3.386 px de alto.
    await abrir(page);
    await esperarLexend(page);
    await expect.poll(() => palabrasPartidas(page), { timeout: 3000 }).toEqual([]);
    expect(await desbordes(page)).toEqual({ fuera: [], cajaDesborda: false });
  });

  test('CASO 8.ter (360 px) — con los ajustes de la guía, ninguna palabra partida ni nada fuera de la pantalla', async ({
    page,
  }) => {
    await abrir(page);
    await ajustesDeLaGuia(page);
    await esperarLexend(page);
    await expect.poll(() => palabrasPartidas(page), { timeout: 3000 }).toEqual([]);
    expect(await desbordes(page)).toEqual({ fuera: [], cajaDesborda: false });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — robustez del texto de entrada
// ═══════════════════════════════════════════════════════════════════════════
test.describe('robustez del texto', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 3 — vaciar el texto muestra el marcador de posición y NO pierde los ajustes', async ({
    page,
  }) => {
    await sembrarValor(page, '#slider-tamano', 26); // distinto del defecto (20)
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    await textarea.fill('');
    await esperarValorEnReact(page, textarea, '');

    await expect(vistaPrevia(page)).toContainText('El texto aparecerá aquí con tus ajustes aplicados');
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 26 px');
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '26px');
  });

  test('CASO 3.bis — 30.000 caracteres no rompen la app ni alteran los ajustes', async ({ page }) => {
    await sembrarValor(page, '#slider-lineas', 2.4); // distinto del defecto (1,9)
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    const largo = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod. '.repeat(
      430,
    );
    await textarea.fill(largo);
    await esperarValorEnReact(page, textarea, largo);

    await expect(vistaPrevia(page)).toContainText('Lorem ipsum dolor sit amet');
    await expect(vistaPrevia(page)).toHaveCSS('line-height', '48px'); // 2,4 × 20 px
    await expect(etiqueta(page, 'slider-lineas')).toHaveText('Interlineado: 2,4');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 4 — persistencia: las preferencias sobreviven a la recarga
// ═══════════════════════════════════════════════════════════════════════════
test.describe('arranque y persistencia', () => {
  const CLAVE = 'adaptador-dislexia-prefs';

  /** Preferencias completas y todas distintas de las de fábrica. */
  const GUARDADAS = {
    fuente: 'mono',
    tamano: 32,
    espaciadoLetras: 0.2,
    espaciadoPalabras: 0.3,
    interlineado: 2.2,
    anchoColumna: 45,
    colorFondo: '#EEF4FF',
  };

  /** Lo que la app tiene escrito ahora mismo en el almacenamiento del navegador. */
  const leerGuardado = (page: Page): Promise<Guardado | null> =>
    page.evaluate(
      (clave) => JSON.parse(localStorage.getItem(clave) ?? 'null') as Guardado | null,
      CLAVE,
    );

  test('CASO 4 — lo que se ajusta en el panel queda escrito en el almacenamiento del navegador', async ({
    page,
  }) => {
    await abrir(page);
    await sembrarValor(page, '#slider-tamano', 34); // distinto del defecto (20)
    await sembrarValor(page, '#slider-palabras', 0.45); // distinto del defecto (0,15)
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '34px');

    // Guardar siempre guardó; lo que fallaba era recuperar (hallazgos 877 y 932, REPARADOS el
    // 18/09/2026: lo vigilan los tres casos REGRESIÓN de abajo).
    await expect.poll(async () => (await leerGuardado(page))?.tamano).toBe(34);
    await expect.poll(async () => (await leerGuardado(page))?.espaciadoPalabras).toBe(0.45);
  });

  test('REGRESIÓN — el efecto que GUARDA pisa las preferencias antes de que el que las LEE llegue a aplicarlas', async ({
    page,
  }) => {
    // REPARADO el 18/09/2026 (hallazgo 932): el guardado espera ahora al estado `cargadas`.
    // Antes eran dos efectos sobre la misma clave y sin coordinación: uno cargaba y otro
    // guardaba en cada cambio de `prefs`. Secuencia que se MIDIÓ instrumentando
    // `localStorage` con `next dev` —el número es el campo `tamano`—:
    //     LEE 32      → el efecto de carga encontraba lo del usuario; su setPrefs quedaba ENCOLADO
    //     ESCRIBE 20  → el de guardado corría con el estado todavía de FÁBRICA y pisaba la clave
    //     LEE 20      → al volver a montar, el de carga ya solo podía leer lo que se acababa de pisar
    //     ESCRIBE 20  → y el almacenamiento se quedaba con los valores de fábrica
    // La configuración del usuario no solo no se aplicaba: se BORRABA. StrictMode (dos
    // montajes en dev) lo destapaba, no lo causaba; en producción, con un montaje único, se
    // salvaba por los pelos porque el re-render con lo leído llegaba después del primer guardado.
    await page.addInitScript(
      ({ clave, prefs }) => {
        localStorage.setItem(clave, JSON.stringify(prefs));
      },
      { clave: CLAVE, prefs: GUARDADAS },
    );
    await abrir(page);

    const texto = vistaPrevia(page);
    await expect(texto).toHaveCSS('font-size', '32px');
    await expect(texto).toHaveCSS('letter-spacing', '6.4px'); // 0,2 em × 32 px
    await expect(texto).toHaveCSS('word-spacing', '9.6px'); // 0,3 em × 32 px
    await expect(texto).toHaveCSS('line-height', '70.4px'); // 2,2 × 32 px
    await expect(texto).toHaveCSS('max-width', '45%');
    await expect(texto).toHaveCSS('font-family', '"Courier New", Courier, monospace');
    await expect(texto).toHaveCSS('background-color', 'rgb(238, 244, 255)'); // #EEF4FF
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 32 px');
    // Y el testigo más directo del defecto: lo sembrado sigue en el almacenamiento.
    expect((await leerGuardado(page))?.tamano).toBe(32);
  });

  test('REGRESIÓN — lo ajustado en esta visita NO se encuentra en la siguiente', async ({ page }) => {
    // REPARADO el 18/09/2026 (hallazgo 932). La otra cara de la misma carrera, la que rompía
    // la promesa que la app hace en su propio subtítulo («Tus preferencias se guardan
    // automáticamente») y en su FAQ («encontrarás la configuración tal como la dejaste»): el
    // ajuste SÍ llegaba a escribirse —lo comprueba la línea de abajo antes de recargar— y aun
    // así la visita siguiente arrancaba con los valores de fábrica.
    await abrir(page);
    await sembrarValor(page, '#slider-tamano', 34); // distinto del defecto (20)
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '34px');
    await expect.poll(async () => (await leerGuardado(page))?.tamano).toBe(34);

    await page.reload();
    await esperarHidratacion(page, DESLIZADORES);

    await expect(vistaPrevia(page)).toHaveCSS('font-size', '34px');
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 34 px');
  });

  test('REGRESIÓN — una preferencia guardada incompleta se descarta entera (y en producción tira la app a la pantalla de error)', async ({
    page,
  }) => {
    // REPARADO el 18/09/2026 (hallazgo 877): hoy `sanearPreferencias` valida campo a campo.
    // Antes era `JSON.parse(guardadas) as Preferencias`, un cast SIN comprobar: el try/catch
    // cubría el parseo, no la forma de lo parseado, y el usuario perdía su ajuste:
    //   · En producción el objeto incompleto llegaba al render y `prefs.interlineado.toFixed(1)`
    //     lanzaba sobre `undefined`: se veía «⚠️ Algo salió mal» en lugar de la app. Medido el
    //     18/09/2026 con '{"tamano":22}', 'null', '"20"', '[]' y
    //     '{"tamano":"grande","interlineado":"dos"}' — los cinco.
    //   · Con `next dev` no caía, pero solo porque la carrera de los dos efectos de arriba
    //     pisaba la clave con los valores de fábrica antes de que el segundo montaje la leyera.
    // Este caso afirma lo único aceptable: ni caerse, ni tirar en silencio el 22 que el
    // usuario tenía guardado y que se entiende perfectamente.
    await page.addInitScript((clave) => {
      localStorage.setItem(clave, '{"tamano":22}');
    }, CLAVE);
    await page.goto(RUTA);

    await expect(page.locator('h1')).toContainText('Adaptador de Lectura para Dislexia');
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 22 px');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 5 — accesibilidad: el listón es más alto porque la app es de accesibilidad
// ═══════════════════════════════════════════════════════════════════════════
test.describe('accesibilidad', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 5 — todos los botones llevan type="button" y los conmutadores, aria-pressed', async ({
    page,
  }) => {
    const sinType = await page.evaluate(
      () =>
        [...document.querySelectorAll('button')]
          .filter((b) => b.getAttribute('type') !== 'button')
          .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim()),
    );
    expect(sinType).toEqual([]);

    // Los tres de fuente y los cinco de color son conmutadores: aria-pressed obligatorio.
    await expect(page.locator('button[aria-pressed]')).toHaveCount(8);
    await expect(page.getByRole('button', { name: 'Crema' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('REGRESIÓN — cuatro de los cinco deslizadores anuncian un número que no es el de su etiqueta', async ({
    page,
  }) => {
    // REPARADO el 18/09/2026 (hallazgo 878). Solo `slider-tamano` llevaba `aria-valuetext`.
    // En los otros cuatro, un lector de pantalla leía el `value` crudo: «0,05» donde la
    // etiqueta visible dice «5 %», y «0,15» donde dice «15 %». La app se dirige a quien tiene
    // dificultades de lectura: la versión hablada del control no puede decir otra cosa.
    await expect(page.locator('#slider-letras')).toHaveAttribute('aria-valuetext', /5/);
    await expect(page.locator('#slider-palabras')).toHaveAttribute('aria-valuetext', /15/);
  });

  test('REGRESIÓN — la vista previa entera es una región viva y atómica: se relee sola a cada tecla', async ({
    page,
  }) => {
    // REPARADO el 18/09/2026 (hallazgo 879). `aria-live="polite"` + `aria-atomic="true"` sobre
    // el bloque que contiene TODO el texto adaptado (567 caracteres ya en el ejemplo de
    // fábrica) hacía que cada pulsación en el área de texto y cada paso de un deslizador
    // volvieran a anunciar el texto completo. Hoy lo que se anuncia es el resumen de ajustes.
    await expect(vistaPrevia(page)).not.toHaveAttribute('aria-atomic', 'true');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 6 y 7 (re-inspección del 03/10/2026) — un caso normal y dos que hay que tratar aparte
// ═══════════════════════════════════════════════════════════════════════════
test.describe('re-inspección: caso normal y entradas que se tratan aparte', () => {
  test('CASO 6 — un texto con tildes, ñ y diéresis sale intacto y con los seis ajustes exactos', async ({
    page,
  }) => {
    await abrir(page);
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    const frase = 'El pingüino Ñandú leyó él solo';
    await textarea.fill(frase);
    await esperarValorEnReact(page, textarea, frase);

    // Los seis distintos de fábrica (lexend · 20 · 0,05 · 0,15 · 1,9 · 68 · crema).
    await page.getByRole('button', { name: /arial/i }).click();
    await sembrarValor(page, '#slider-tamano', 24);
    await sembrarValor(page, '#slider-letras', 0.1);
    await sembrarValor(page, '#slider-palabras', 0.25);
    await sembrarValor(page, '#slider-lineas', 2);
    await sembrarValor(page, '#slider-ancho', 60);
    await page.getByRole('button', { name: 'Verde pálido' }).click();

    const texto = vistaPrevia(page);
    await expect(texto).toHaveText(frase); // ni una letra cambiada: la app no transforma el texto
    await expect(texto).toHaveCSS('font-family', 'Arial, Helvetica, sans-serif');
    await expect(texto).toHaveCSS('font-size', '24px');
    await expect(texto).toHaveCSS('letter-spacing', '2.4px'); // 0,10 em × 24 px
    await expect(texto).toHaveCSS('word-spacing', '6px'); // 0,25 em × 24 px
    await expect(texto).toHaveCSS('line-height', '48px'); // 2,0 × 24 px
    await expect(texto).toHaveCSS('max-width', '60%');
    await expect(texto).toHaveCSS('background-color', 'rgb(240, 247, 240)'); // #F0F7F0
    // El resumen hablado dice lo mismo que se ve (toHaveText normaliza los espacios).
    await expect(page.locator('[role="status"]').filter({ hasText: 'interlineado' })).toHaveText(
      'Arial · 24 px · interlineado 2,0 · letras 10 % · palabras 25 % · ancho 60 % · fondo Verde pálido',
    );
    // Y queda guardado tal cual, con el identificador interno de la fuente («sistema»).
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('adaptador-dislexia-prefs') ?? 'null') as unknown,
        ),
      )
      .toEqual({
        fuente: 'sistema',
        tamano: 24,
        espaciadoLetras: 0.1,
        espaciadoPalabras: 0.25,
        interlineado: 2,
        anchoColumna: 60,
        colorFondo: '#F0F7F0',
      });
  });

  test('CASO 7 — un texto con etiquetas HTML se muestra literal y no se ejecuta nada', async ({ page }) => {
    let dialogos = 0;
    page.on('dialog', async (d) => {
      dialogos++;
      await d.dismiss();
    });
    await abrir(page);
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    const html = '<b>hola</b> & <img src=x onerror="alert(1)">';
    await textarea.fill(html);
    await esperarValorEnReact(page, textarea, html);

    await expect(vistaPrevia(page)).toHaveText(html);
    await expect(vistaPrevia(page).locator('b, img')).toHaveCount(0);
    expect(dialogos).toBe(0);
  });

  test('CASO 7.bis — unas preferencias guardadas fuera de rango o de tipo se sanean campo a campo', async ({
    page,
  }) => {
    // tamano 99 → se capa a 36 (máximo de la app) · fuente «comic» → Lexend de fábrica ·
    // fondo #000000 (no está entre los cinco) → crema · interlineado "2" (texto, no número) →
    // 1,9 de fábrica · anchoColumna 45 → se respeta. Lo demás, de fábrica (0,05 y 0,15).
    await page.addInitScript(() => {
      localStorage.setItem(
        'adaptador-dislexia-prefs',
        '{"tamano":99,"fuente":"comic","colorFondo":"#000000","interlineado":"2","anchoColumna":45}',
      );
    });
    await abrir(page);

    const texto = vistaPrevia(page);
    await expect(texto).toHaveCSS('font-size', '36px');
    await expect(texto).toHaveCSS('letter-spacing', '1.8px'); // 0,05 em × 36 px
    await expect(texto).toHaveCSS('word-spacing', '5.4px'); // 0,15 em × 36 px
    await expect(texto).toHaveCSS('line-height', '68.4px'); // 1,9 × 36 px
    await expect(texto).toHaveCSS('max-width', '45%');
    await expect(texto).toHaveCSS('background-color', 'rgb(254, 253, 246)'); // #FEFDF6
    await expect(page.getByRole('button', { name: /lexend/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(etiqueta(page, 'slider-lineas')).toHaveText('Interlineado: 1,9');
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (JSON.parse(localStorage.getItem('adaptador-dislexia-prefs') ?? 'null') as Guardado | null)
              ?.tamano,
        ),
      )
      .toBe(36);
  });

  test('CASO 10 — el «%» va separado de la cifra con espacio duro (U+00A0)', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2730). CLAUDE.md §2 (decidido el 25/09/2026): «15 %»,
    // separado con U+00A0. Hasta entonces las etiquetas decían «Espacio letras: 5%» y el
    // resumen «letras 5 %» con un espacio normal (U+0020). Las cadenas de abajo llevan U+00A0.
    await abrir(page);
    const crudo = (l: Locator) => l.evaluate((el) => el.textContent ?? '');
    expect(await crudo(etiqueta(page, 'slider-letras'))).toContain('5 %');
    expect(await crudo(etiqueta(page, 'slider-ancho'))).toContain('68 %');
    const resumen = page.locator('[role="status"]').filter({ hasText: 'interlineado' });
    expect(await crudo(resumen)).toContain('letras 5 %');
    expect(await crudo(etiqueta(page, 'slider-tamano'))).toContain('20 px');
    // Y el bloque educativo, que tenía «el 5% y el 15%», «50–60%», «10-15%», «20–26px»…
    // (se lee el textContent, que incluye lo plegado de la guía; solo las piezas de la app)
    const todo = await page.evaluate(() =>
      Array.from(document.querySelectorAll('aside, main, [class*="guiaSeccion"]'))
        .map((el) => el.textContent ?? '')
        .join(' '),
    );
    expect(todo).toContain('¿Qué es la dislexia?');
    // Ni cifra pegada a su unidad, ni separada con un espacio normal que la deje saltar sola
    expect(todo.match(/\d ?(%|px)/g) ?? []).toEqual([]);
  });

  test('CASO 11 — el JSON-LD que leen buscadores e IA no contradice lo que dice la página de Lexend', async ({
    page,
  }) => {
    // REPARADO el 03/10/2026 (hallazgo 2727): el FAQPage dice ahora lo mismo que la página.
    // La reparación del hallazgo 880 (18/09/2026) corrigió la página —«sus letras especulares
    // siguen siendo casi simétricas… no es la fuente que busca quien confunde b/d o p/q»— pero
    // no tocó metadata.ts, cuyo FAQPage sigue diciendo que «Las fuentes diseñadas para
    // dislexia (Lexend, OpenDyslexic, Dyslexie) añaden rasgos diferenciadores a letras que
    // suelen confundirse».
    await page.goto(RUTA);
    const respuestas = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .filter((t) => t.includes('FAQPage'))
        .join(' '),
    );
    expect(respuestas.length).toBeGreaterThan(0);
    expect(respuestas).not.toMatch(/Lexend[^.]*añaden rasgos diferenciadores/);
    // Y lo dice en positivo, con la misma medida que la tabla de la página.
    expect(respuestas).toMatch(/Lexend no lo hace/);
    expect(respuestas).toMatch(/89\u00A0%/);
  });

  test('CASO 11.bis — las cifras del bloque educativo y del JSON-LD llevan su fuente', async ({ page }) => {
    // Hallazgo 2728. El «5-15 %» es del DSM-5 (APA, 2013) para el trastorno específico del
    // aprendizaje en edad ESCOLAR (lectura, escritura y matemáticas juntas), no para la
    // dislexia en toda la población: así se dice ahora, en la página y en el JSON-LD.
    await abrir(page);
    const pagina = await page.evaluate(() => document.body.textContent ?? '');
    expect(pagina).not.toMatch(/15\s?% de la población/);
    expect(pagina).toMatch(/DSM-5[^.]*2013/);
    expect(pagina).toMatch(/edad escolar/);
    // Las valoraciones de la tabla que no son una medida se presentan como impresión.
    const filas = page.locator('table tbody tr');
    for (const criterio of ['Fatiga visual', 'Apta para imprimir', 'Uso habitual']) {
      await expect(filas.filter({ hasText: criterio })).toContainText('Impresión subjetiva');
    }
    await expect(page.locator('table')).not.toContainText('muy buena');
    // La FAQ ya no promete que el adaptador «reduce la confusión de letras».
    expect(pagina).not.toMatch(/reduce la confusión de letras/);
    const ld = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .join(' '),
    );
    expect(ld).not.toMatch(/15\s?% de la población/);
    expect(ld).toMatch(/DSM-5/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 12 — contraste en los DOS temas (re-inspección del 03/10/2026)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('contraste en los dos temas', () => {
  /** Texto de marca y botón de marca: los que se ven sin abrir nada y los de la guía. */
  const MARCA = {
    'valor de la etiqueta': 'label[for="slider-tamano"] strong',
    'título «Ajustes»': 'aside[aria-label="Ajustes de lectura"] h2',
    'botón «Copiar texto»': 'section[aria-label="Vista previa del texto adaptado"] button',
    'botón de fuente activo': '[aria-label="Selección de fuente"] button[aria-pressed="true"]',
    'cabecera de la tabla': 'table th',
    'celda destacada': 'table td[class*="celdaDestacada"]',
    'h2 del bloque educativo': '[class*="guiaSeccion"] h2',
    'número de paso': '[class*="stepNumber"]',
  };

  for (const tema of ['light', 'dark'] as const) {
    test(`CASO 12 (${tema}) — el color de marca como texto y como fondo de botón llega a 4,5:1`, async ({
      page,
    }) => {
      // REPARADO el 03/10/2026 (hallazgo 2726): sin el --primary propio del módulo, con
      // --primary-texto como texto y --primary-boton como fondo. Calculado a mano ANTES: con la fórmula WCAG: #2E86AB sobre #FFFFFF = 4,11:1 (claro) y sobre
      // la tarjeta #2A2A2A = 3,50:1 (oscuro); blanco sobre #2E86AB = 4,11:1 en los dos. Es
      // texto pequeño (13,6 a 17,6 px en negrita), así que el mínimo es 4,5:1. El módulo
      // declara `--primary: #2E86AB` en `.container` y no lo redeclara en oscuro, así que
      // tampoco le llega el #3FA5D1 de globals ni los tokens `--primary-texto`/`--primary-boton`.
      await abrirEnTema(page, tema);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      await expect(page.locator('table th').first()).toBeVisible();
      const medidas: Record<string, number> = {};
      for (const [nombre, sel] of Object.entries(MARCA)) medidas[nombre] = await contraste(page, sel);
      expect(
        Object.values(medidas).every((v) => v >= 4.5),
        `contrastes en ${tema}: ${JSON.stringify(medidas)}`,
      ).toBe(true);
    });
  }

  test('CASO 12.bis (light) — los marcadores de texto vacío se leen en claro', async ({ page }) => {
    // #6E6E6E sobre el crema #FEFDF6 = 5,00:1 · placeholder del navegador #757575 sobre la
    // tarjeta blanca = 4,61:1. Los dos por encima de 4,5.
    await abrirEnTema(page, 'light');
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    await textarea.fill('');
    await esperarValorEnReact(page, textarea, '');
    expect(await contraste(page, '[aria-label="Texto con formato aplicado"] em')).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, 'textarea', '::placeholder')).toBeGreaterThanOrEqual(4.5);
  });

  test('CASO 12.ter (dark) — los marcadores de texto vacío se leen en oscuro', async ({ page }) => {
    // REPARADO el 03/10/2026 (hallazgo 2729): el de la vista previa lleva un gris fijo
    // (#595959, la caja es siempre clara) y el del área de texto, --text-secondary. ANTES:
    // La caja del texto adaptado es SIEMPRE clara (fondo crema), pero su marcador usa
    // `--text-muted`, que en oscuro vale #9B9B9B (e089700b, 22/09/2026): #9B9B9B sobre
    // #FEFDF6 = 2,73:1, calculado a mano. El del área de texto es el del navegador, #757575,
    // sobre la tarjeta oscura (#2A2A2A con un 4 % de blanco encima): ≈ 2,7:1.
    await abrirEnTema(page, 'dark');
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    await textarea.fill('');
    await esperarValorEnReact(page, textarea, '');
    const vista = await contraste(page, '[aria-label="Texto con formato aplicado"] em');
    const area = await contraste(page, 'textarea', '::placeholder');
    expect(vista >= 4.5 && area >= 4.5, `vista previa ${vista}:1 · área de texto ${area}:1`).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 13 — portapapeles: pegar funciona; «Copiar texto» no lleva la adaptación
// ═══════════════════════════════════════════════════════════════════════════
test.describe('portapapeles', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('CASO 13 — pegar con Ctrl+V llega a la vista previa con tildes, ñ y diéresis', async ({ page }) => {
    await abrir(page);
    const pegado = 'Texto pegado con Ctrl+V: ñandú, pingüino.';
    await page.evaluate((t) => navigator.clipboard.writeText(t), pegado);
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    await textarea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Control+V');
    await esperarValorEnReact(page, textarea, pegado);
    await expect(vistaPrevia(page)).toHaveText(pegado);
  });

  test('CASO 13.bis — «Copiar texto» lleva al portapapeles el texto CON el formato de la vista previa', async ({
    page,
  }) => {
    // REPARADO el 03/10/2026 (hallazgo 2731). ANTES: `copiarTexto` hacía `navigator.clipboard.writeText(texto)`: el portapapeles recibe solo
    // text/plain, idéntico a lo que el usuario pegó. Ningún ajuste (fuente, tamaño, espaciado,
    // fondo) viaja al pegarlo en un procesador de textos.
    await abrir(page);
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    await textarea.fill('Hola mundo');
    await esperarValorEnReact(page, textarea, 'Hola mundo');
    await page.getByRole('button', { name: /mono/i }).click();
    await sembrarValor(page, '#slider-tamano', 28);
    await page.getByRole('button', { name: 'Copiar texto' }).click();
    await expect(page.getByRole('button', { name: 'Copiado con formato' })).toBeVisible();

    const { tipos, html, plano } = await page.evaluate(async () => {
      const items = await navigator.clipboard.read();
      const item = items[0];
      return {
        tipos: items.flatMap((i) => [...i.types]),
        html: await (await item.getType('text/html')).text(),
        plano: await (await item.getType('text/plain')).text(),
      };
    });
    expect(tipos).toContain('text/html');
    expect(tipos).toContain('text/plain');
    expect(plano).toBe('Hola mundo'); // la reserva, para pegar donde no hay formato
    // Los estilos van EN LÍNEA y en puntos: 28 px × 0,75 = 21 pt; 0,05 em × 28 px = 1,4 px
    // = 1,05 pt; 1,9 × 28 px = 53,2 px = 39,9 pt. Calculado a mano.
    expect(html).toContain('Hola mundo');
    expect(html).toContain('Courier New');
    expect(html).toContain('font-size: 21pt');
    expect(html).toContain('letter-spacing: 1.05pt');
    expect(html).toContain('line-height: 39.9pt');
    expect(html).toContain('background-color: #FEFDF6');
  });

  test('CASO 13.ter — sin ClipboardItem cae a texto plano y lo dice', async ({ page }) => {
    // Un navegador sin ClipboardItem no puede copiar con formato: copiar en plano en
    // silencio era el defecto, así que el botón y el aviso hablado lo cuentan.
    await page.addInitScript(() => {
      Reflect.deleteProperty(window, 'ClipboardItem');
    });
    await abrir(page);
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    await textarea.fill('Hola mundo');
    await esperarValorEnReact(page, textarea, 'Hola mundo');
    await page.getByRole('button', { name: 'Copiar texto' }).click();
    await expect(page.getByRole('button', { name: 'Copiado sin formato' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'sin los ajustes' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Hola mundo');
  });
});
