import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * Testigo de familia · apps que abren la cámara o el micrófono con getUserMedia (cabo C0715,
 * 11/11/2026).
 *
 * INVARIANTE: un doble clic (o doble toque) en el botón que abre el medio, mientras getUserMedia
 * está pendiente, deja como mucho UN flujo vivo, y tras el botón de cerrar no queda ninguna pista
 * viva (la luz de la cámara se apaga, el micrófono se suelta).
 *
 * DE DÓNDE SALE: hallazgo 4487 de prueba-camara (7d008e1f8). El botón sigue siendo «Iniciar» hasta
 * que getUserMedia resuelve —una webcam real tarda cientos de ms—, así que el segundo clic abría el
 * medio otra vez; la segunda pista pisaba a la primera en el ref y esta quedaba viva tras «Detener».
 * Receta: un ref que ignora la segunda pulsación mientras se abre la primera, y una generación que
 * sube con cada apertura, con «Detener» y al desmontar, para cerrar el flujo que llega de una
 * apertura que ya no es la última.
 *
 * CÓMO MIDE: getUserMedia sustituido en un addInitScript que tarda 400 ms, cuenta las llamadas y
 * guarda cada flujo; dos clics separados 150 ms (un doble clic humano); 1,5 s de espera; pistas
 * vivas; botón de cerrar; pistas vivas otra vez. Se cuentan FLUJOS vivos, no pistas: amplificador
 * o el espejo podrían pedir audio y vídeo a la vez.
 *
 * CONTROL: sin la receta, prueba-microfono deja 2 flujos vivos y 1 tras «Detener» (medido el
 * 11/11/2026 al escribir este testigo; prueba-camara, 4 de 4 rondas el mismo día).
 *
 * Para añadir una hermana: una fila en APPS con su ruta, el botón que abre y el que cierra.
 */

interface AppMedio {
  slug: string;
  /** Nombre accesible del botón que abre el medio */
  abrir: RegExp;
  /** Nombre accesible del botón que lo cierra; null si la app lo cierra sola al acabar */
  cerrar: RegExp | null;
  /** Lo que hay que hacer antes de que el botón de abrir se pueda pulsar */
  antes?: (page: Page) => Promise<void>;
}

const APPS: AppMedio[] = [
  { slug: 'prueba-camara', abrir: /Iniciar Cámara/, cerrar: /^Detener$/ },
  { slug: 'prueba-camara', abrir: /Probar micrófono/, cerrar: /Detener micrófono/ },
  { slug: 'prueba-microfono', abrir: /Iniciar Micrófono/, cerrar: /Detener/ },
  { slug: 'luxometro', abrir: /Iniciar Medición/, cerrar: /Detener/ },
  { slug: 'ejercicios-vocalizacion', abrir: /Activar micrófono/, cerrar: /Desactivar micrófono/ },
  { slug: 'amplificador-sonido', abrir: /Iniciar amplificación/, cerrar: /Detener/ },
  { slug: 'identificador-color-camara', abrir: /^Activar cámara/, cerrar: /Apagar cámara/ },
  { slug: 'espejo', abrir: /Activar espejo/, cerrar: /Apagar/ },
  { slug: 'lupa-digital', abrir: /^Activar lupa$/, cerrar: /Desactivar|Detener|Apagar/ },
  {
    slug: 'daf-retroalimentacion-auditiva',
    abrir: /^Activar la retroalimentación/,
    cerrar: /Detener|Desactivar|Parar/,
    antes: async (page) => {
      await page.getByRole('checkbox', { name: /auriculares/ }).check();
    },
  },
  { slug: 'sonometro', abrir: /Iniciar medición/, cerrar: /Detener/ },
  { slug: 'afinador-instrumentos', abrir: /Iniciar afinador/, cerrar: /Detener/ },
  { slug: 'analizador-espectro', abrir: /Iniciar análisis/, cerrar: /Detener/ },
  { slug: 'generador-tonos', abrir: /Medir la frecuencia/, cerrar: /Dejar de medir/ },
  // La medida de respuesta dura ~20 s y cierra el micrófono sola: no tiene botón de cerrar
  { slug: 'generador-tonos', abrir: /^Medir A$/, cerrar: null },
];

test.use({
  permissions: ['camera', 'microphone'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});

interface Ventana {
  __aperturas: MediaStream[];
  __llamadas: number;
}

/** getUserMedia tarda `ms` en abrir, como un dispositivo real, y apunta cada flujo. */
async function aperturasLentas(page: Page, ms: number): Promise<void> {
  await page.addInitScript((retraso: number) => {
    const w = window as unknown as Ventana;
    w.__aperturas = [];
    w.__llamadas = 0;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c?: MediaStreamConstraints): Promise<MediaStream> => {
      w.__llamadas += 1;
      await new Promise((r) => window.setTimeout(r, retraso));
      const flujo = await original(c);
      w.__aperturas.push(flujo);
      return flujo;
    };
  }, ms);
}

async function flujosVivos(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      (window as unknown as Ventana).__aperturas.filter((f) => f.getTracks().some((p) => p.readyState === 'live'))
        .length,
  );
}

/** Espera a que React haya colgado su onClick: un clic anterior se pierde. */
async function esperarBotonVivo(boton: Locator): Promise<void> {
  await expect(boton).toBeVisible({ timeout: 15000 });
  await expect(boton).toBeEnabled();
  await expect
    .poll(() =>
      boton.evaluate((el) => {
        const bruto = el as unknown as Record<string, unknown>;
        const clave = Object.keys(bruto).find((k) => k.startsWith('__reactProps$'));
        const props = clave ? (bruto[clave] as Record<string, unknown> | null) : null;
        return Boolean(props && typeof props.onClick === 'function');
      }),
    )
    .toBe(true);
}

for (const app of APPS) {
  test(`${app.slug} · un doble clic en «${app.abrir.source}» con un medio que tarda 400 ms deja un solo flujo vivo y ninguno tras cerrar`, async ({
    page,
  }) => {
    test.slow();
    await aperturasLentas(page, 400);
    await page.goto(`/${app.slug}/`);
    if (app.antes) {
      await esperarBotonVivo(page.getByRole('button', { name: app.abrir }).first()).catch(() => {});
      await app.antes(page);
    }
    const boton = page.getByRole('button', { name: app.abrir }).first();
    await esperarBotonVivo(boton);
    await boton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const caja = await boton.boundingBox();
    if (!caja) throw new Error(`«${app.abrir.source}» no tiene caja en pantalla.`);
    const x = caja.x + caja.width / 2;
    const y = caja.y + caja.height / 2;
    await page.mouse.click(x, y);
    await page.waitForTimeout(150);
    await page.mouse.click(x, y);
    await page.waitForTimeout(1500);

    const llamadas = await page.evaluate(() => (window as unknown as Ventana).__llamadas);
    expect(llamadas, 'getUserMedia se llamó al menos una vez').toBeGreaterThan(0);
    expect(await flujosVivos(page), `flujos vivos tras el doble clic (${llamadas} llamadas)`).toBeLessThanOrEqual(1);

    if (app.cerrar) {
      const cerrar = page.getByRole('button', { name: app.cerrar }).first();
      await expect(cerrar).toBeVisible();
      await cerrar.click();
      await page.waitForTimeout(800);
      expect(await flujosVivos(page), 'flujos vivos tras cerrar').toBe(0);
    }
  });
}
