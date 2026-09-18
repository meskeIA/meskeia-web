import { test, expect, devices, type Page } from '@playwright/test';
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
 *   interlineado 1,2–3,0 paso 0,1 · ancho 40–100 % paso 5
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
 *   del navegador. Lo que no funciona es recuperarlo: ver los hallazgos de persistencia.
 *
 * ⚠️ ESTOS CASOS CORREN CONTRA `next dev` (playwright.config.ts levanta el 3050), y la app
 *   NO se comporta igual que en producción, porque en dev React monta los efectos dos veces
 *   (StrictMode). Donde el entorno cambia el resultado se dice en el propio caso, con lo
 *   medido en cada uno. Ninguna afirmación de este fichero depende de en cuál se ejecute:
 *   las que valen para los dos entornos están escritas para fallar en los dos.
 *
 * LOS 9 HALLAZGOS del 18/09/2026 se repararon ese mismo día y sus casos, marcados aquí como
 * REGRESIÓN, pasaron de `test.fail()` a candado. Cada uno conserva escrito lo que la app hacía
 * antes y con qué medida se demostró: es lo que permite saber, si alguno se vuelve a poner
 * rojo, si lo que ha cambiado es la app o la afirmación.
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
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 28px');
    await expect(etiqueta(page, 'slider-letras')).toHaveText('Espacio letras: 12%');
    await expect(etiqueta(page, 'slider-palabras')).toHaveText('Espacio palabras: 40%');
    await expect(etiqueta(page, 'slider-ancho')).toHaveText('Ancho columna: 50%');
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
    // `anchoColumna` por defecto es 68, pero el control es min=40 step=5: 68 no cae en la
    // rejilla y el navegador lo sube a 70. La etiqueta sigue diciendo 68 % y el texto se
    // maqueta al 68 %, así que el pomo —y el valor que anuncia un lector de pantalla— dicen
    // una cosa y la app hace otra. Se arregla en cuanto el usuario toca el control.
    await expect(page.locator('#slider-ancho')).toHaveValue('68');
    await expect(etiqueta(page, 'slider-ancho')).toHaveText('Ancho columna: 68%');
    await expect(vistaPrevia(page)).toHaveCSS('max-width', '68%');
  });

  test('REGRESIÓN — el interlineado se escribe con punto decimal, no con coma', async ({ page }) => {
    // CLAUDE.md §2: formato español obligatorio, y `toFixed()` prohibido para presentar
    // cifras. `prefs.interlineado.toFixed(1)` imprime «1.9» (page.tsx, etiqueta del control).
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
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 14px');
  });

  test('CASO 2.ter — un valor fuera de rango lo capa el propio control, sin romper nada', async ({
    page,
  }) => {
    expect(await sembrarValorAcotado(page, '#slider-tamano', 999)).toBe('36'); // max = 36
    expect(await sembrarValorAcotado(page, '#slider-letras', -5)).toBe('0'); // min = 0
    expect(await sembrarValorAcotado(page, '#slider-ancho', 1000)).toBe('100'); // max = 100

    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 36px');
    await expect(etiqueta(page, 'slider-letras')).toHaveText('Espacio letras: 0%');
    await expect(etiqueta(page, 'slider-ancho')).toHaveText('Ancho columna: 100%');
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '36px');
  });

  test('REGRESIÓN — al subir el tamaño al máximo, el panel de ajustes se sale de la pantalla', async ({
    page,
  }) => {
    // El ancho mínimo del bloque de texto (su palabra más larga) estira la única columna del
    // grid en móvil, y con ella el panel de ajustes. Medido en producción con tamaño = 36:
    // el panel acaba en 454 px sobre un viewport de 412. Como `html, body` llevan
    // `overflow-x: hidden` (globals.css), no hay forma de desplazarse hasta lo que queda
    // fuera: el extremo derecho del recorrido de los cinco deslizadores —donde está el pomo
    // justo después de subirlos— deja de verse y de poder tocarse.
    await sembrarValor(page, '#slider-tamano', 36);
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '36px');

    const { derecha, viewport } = await bordeDerechoDelPanel(page);
    expect(derecha).toBeLessThanOrEqual(viewport);
  });

  test('REGRESIÓN — pegar un texto con una palabra larga expulsa los controles fuera de la pantalla', async ({
    page,
  }) => {
    // Sin tocar ningún ajuste: basta con pegar un texto que contenga un enlace o un correo
    // largo, que es justo lo que la app invita a pegar («un artículo, apuntes del colegio,
    // un correo de trabajo»). Medido en producción con este mismo correo de 83 caracteres:
    // el panel llega a 995 px sobre un viewport de 412, solo el 41 % del recorrido de los
    // deslizadores queda en pantalla y dos de los cinco botones de color («Azul pálido» y
    // «Gris suave») quedan enteros fuera, sin scroll horizontal posible.
    const textarea = page.getByRole('textbox', { name: 'Texto a adaptar para lectura' });
    const conCorreo =
      'Escribe a coordinacion.pedagogica.centro.educativo@institutoejemplolargo.edu.example';
    await textarea.fill(conCorreo);
    await esperarValorEnReact(page, textarea, conCorreo);

    const { derecha, viewport } = await bordeDerechoDelPanel(page);
    expect(derecha).toBeLessThanOrEqual(viewport);
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
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 26px');
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

    // La mitad sana del mecanismo: guardar sí guarda. Lo que falla es recuperar.
    await expect.poll(async () => (await leerGuardado(page))?.tamano).toBe(34);
    await expect.poll(async () => (await leerGuardado(page))?.espaciadoPalabras).toBe(0.45);
  });

  test('REGRESIÓN — el efecto que GUARDA pisa las preferencias antes de que el que las LEE llegue a aplicarlas', async ({
    page,
  }) => {
    // Dos efectos sobre la misma clave y sin coordinación: uno carga (page.tsx:61) y otro
    // guarda en cada cambio de `prefs` (page.tsx:71). Secuencia MEDIDA instrumentando
    // `localStorage` con `next dev` —el número es el campo `tamano`—:
    //     LEE 32      → el efecto de carga encuentra lo del usuario; su setPrefs queda ENCOLADO
    //     ESCRIBE 20  → el de guardado corre con el estado todavía de FÁBRICA y pisa la clave
    //     LEE 20      → al volver a montar, el de carga ya solo puede leer lo que se acaba de pisar
    //     ESCRIBE 20  → y el almacenamiento se queda con los valores de fábrica
    // Así que la configuración del usuario no solo no se aplica: se BORRA. StrictMode (dos
    // montajes en dev) es lo que lo destapa, no la causa; en producción, con un montaje
    // único, se salva por los pelos porque el re-render con lo leído llega después del
    // primer guardado. Basta con que el componente se monte dos veces para perderlo todo.
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
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 32px');
    // Y el testigo más directo del defecto: lo sembrado sigue en el almacenamiento.
    expect((await leerGuardado(page))?.tamano).toBe(32);
  });

  test('REGRESIÓN — lo ajustado en esta visita NO se encuentra en la siguiente', async ({ page }) => {
    // La otra cara de la misma carrera, y la que rompe la promesa que la app hace en su
    // propio subtítulo («Tus preferencias se guardan automáticamente») y en su FAQ
    // («encontrarás la configuración tal como la dejaste»): el ajuste SÍ llega a escribirse
    // —lo comprueba la línea de abajo antes de recargar— y aun así la visita siguiente
    // arranca con los valores de fábrica.
    await abrir(page);
    await sembrarValor(page, '#slider-tamano', 34); // distinto del defecto (20)
    await expect(vistaPrevia(page)).toHaveCSS('font-size', '34px');
    await expect.poll(async () => (await leerGuardado(page))?.tamano).toBe(34);

    await page.reload();
    await esperarHidratacion(page, DESLIZADORES);

    await expect(vistaPrevia(page)).toHaveCSS('font-size', '34px');
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 34px');
  });

  test('REGRESIÓN — una preferencia guardada incompleta se descarta entera (y en producción tira la app a la pantalla de error)', async ({
    page,
  }) => {
    // `JSON.parse(guardadas) as Preferencias` (page.tsx:65) es un cast SIN comprobar: el
    // try/catch cubre el parseo, no la forma de lo parseado. Lo que pasa después depende
    // del entorno, pero el usuario pierde su ajuste en los dos:
    //   · En producción el objeto incompleto llega al render y `prefs.interlineado.toFixed(1)`
    //     lanza sobre `undefined`: se ve «⚠️ Algo salió mal» en lugar de la app. Medido el
    //     18/09/2026 con '{"tamano":22}', 'null', '"20"', '[]' y
    //     '{"tamano":"grande","interlineado":"dos"}' — los cinco.
    //   · Con `next dev` no cae, pero solo porque la carrera de los dos efectos de arriba
    //     pisa la clave con los valores de fábrica antes de que el segundo montaje la lea.
    // Este caso afirma lo único aceptable: ni caerse, ni tirar en silencio el 22 que el
    // usuario tenía guardado y que se entiende perfectamente.
    await page.addInitScript((clave) => {
      localStorage.setItem(clave, '{"tamano":22}');
    }, CLAVE);
    await page.goto(RUTA);

    await expect(page.locator('h1')).toContainText('Adaptador de Lectura para Dislexia');
    await expect(etiqueta(page, 'slider-tamano')).toHaveText('Tamaño: 22px');
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
    // Solo `slider-tamano` lleva `aria-valuetext`. En los otros cuatro, un lector de pantalla
    // lee el `value` crudo: «0,05» donde la etiqueta visible dice «5 %», y «0,15» donde dice
    // «15 %». La app se dirige a quien tiene dificultades de lectura, así que la versión
    // hablada del control no puede decir otra cosa que la escrita.
    await expect(page.locator('#slider-letras')).toHaveAttribute('aria-valuetext', /5/);
    await expect(page.locator('#slider-palabras')).toHaveAttribute('aria-valuetext', /15/);
  });

  test('REGRESIÓN — la vista previa entera es una región viva y atómica: se relee sola a cada tecla', async ({
    page,
  }) => {
    // `aria-live="polite"` + `aria-atomic="true"` sobre el bloque que contiene TODO el texto
    // adaptado (567 caracteres ya en el ejemplo de fábrica) hace que cada pulsación en el
    // área de texto y cada paso de un deslizador vuelvan a anunciar el texto completo.
    await expect(vistaPrevia(page)).not.toHaveAttribute('aria-atomic', 'true');
  });
});
