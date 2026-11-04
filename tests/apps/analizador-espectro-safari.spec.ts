import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Analizador de espectro · un AudioContext que nace en 'suspended' (cabo C0096, 04/11/2026).
 *
 * LA SOSPECHA (inspector, 01/10/2026): en iOS Safari el AudioContext que no se crea dentro del
 * gesto del usuario puede arrancar en 'suspended', y la app lo crea DESPUÉS de
 * `await abrirEntradaAudio()` (es decir, de `getUserMedia`, que en el primer uso espera al diálogo
 * de permiso), sin llamar nunca a `resume()` ni mirar `state` ni escuchar `statechange`
 * (app/analizador-espectro/page.tsx, `const audioContext = new AudioContext();` en
 * `startAnalyzing`). Si el contexto se queda suspendido, el analizador no recibe muestras.
 *
 * ESTO ES UNA EMULACIÓN, NO SAFARI. En esta máquina no está el navegador WebKit de Playwright, así
 * que se reproduce la CONDICIÓN en Chromium: un `addInitScript` envuelve el constructor de
 * AudioContext (y webkitAudioContext, si existiera) para que cada instancia nueva llame a
 * `suspend()` nada más crearse; `resume()` queda intacto. Lo que prueba es cómo responde la app a
 * un contexto suspendido, no que Safari real lo suspenda en este flujo.
 *
 * Fichero aparte y no dentro de analizador-espectro.spec.ts porque el móvil (`devices['Pixel 7']`)
 * va al nivel del fichero, y aquel fija escritorio para sus casos generales.
 *
 * RESUELTO ANTES DE ABRIR EL NAVEGADOR, leído del código:
 *   · Control, sin envoltura: Chromium da el contexto por arrancado tras el toque (activación
 *     persistente), el pitido del micrófono falso llega al analizador (bytes > 20) y la cifra sale.
 *   · Con la envoltura: nadie llama a `resume()`, así que el contexto sigue en 'suspended', los
 *     bytes valen 0, la cifra queda en «-- Hz», el botón ya dice «Detener» y no hay aviso alguno:
 *     la pantalla es la misma que la de una sala en silencio.
 *   · Esperado de una app que se defiende: que reanude el contexto (y entonces mida) o que avise.
 */

test.use({
  ...devices['Pixel 7'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
  permissions: ['microphone'],
});

type VentanaEspia = Window & {
  __contextosApp?: AudioContext[];
  __resumes?: number;
  __maxByte?: number;
};

/**
 * Espía el contexto de la APP (el que llama a createMediaStreamSource), cuenta las llamadas a
 * `resume()` y guarda el byte más alto que lee el bucle de dibujo. Con `nacerSuspendido`, además,
 * cada AudioContext nuevo se suspende al crearse: la emulación de la política de Safari.
 */
async function espiar(page: Page, nacerSuspendido: boolean): Promise<void> {
  await page.addInitScript((suspender: boolean) => {
    const w = window as VentanaEspia;
    w.__contextosApp = [];
    w.__resumes = 0;
    w.__maxByte = 0;
    const Original = window.AudioContext;
    if (suspender) {
      class ContextoSuspendido extends Original {
        constructor(opciones?: AudioContextOptions) {
          super(opciones);
          void this.suspend();
        }
      }
      window.AudioContext = ContextoSuspendido;
      const conWebkit = window as unknown as { webkitAudioContext?: typeof AudioContext };
      if (conWebkit.webkitAudioContext) conWebkit.webkitAudioContext = ContextoSuspendido;
    }
    const reanudar = Original.prototype.resume;
    Original.prototype.resume = function (this: AudioContext) {
      w.__resumes = (w.__resumes ?? 0) + 1;
      return reanudar.call(this);
    };
    const crearFuente = Original.prototype.createMediaStreamSource;
    Original.prototype.createMediaStreamSource = function (this: AudioContext, flujo: MediaStream) {
      w.__contextosApp?.push(this);
      return crearFuente.call(this, flujo);
    };
    const leerBytes = AnalyserNode.prototype.getByteFrequencyData;
    AnalyserNode.prototype.getByteFrequencyData = function (
      this: AnalyserNode,
      arreglo: Parameters<typeof leerBytes>[0],
    ) {
      leerBytes.call(this, arreglo);
      let maximo = 0;
      for (let i = 0; i < arreglo.length; i++) if (arreglo[i] > maximo) maximo = arreglo[i];
      if (maximo > (w.__maxByte ?? 0)) w.__maxByte = maximo;
    };
  }, nacerSuspendido);
}

const frecuencia = (page: Page) => page.locator('[class*="freqValue"]');
/** Una cifra en hercios: «398 Hz», «1.002 Hz». «-- Hz» no casa. */
const CIFRA_HZ = /^\s*\d[\d.]*\s*Hz\s*$/;

/** Estado del contexto de la app, lo que ha leído el analizador y si hay algún aviso a la vista. */
async function lectura(page: Page) {
  return page.evaluate(() => {
    const w = window as VentanaEspia;
    const avisos = [
      ...document.querySelectorAll(
        '[class*="analyzerPanel"] [role="alert"], [class*="analyzerPanel"] [class*="errorMessage"], [class*="analyzerPanel"] [class*="infoMessage"]',
      ),
    ].filter((e) => (e.textContent ?? '').trim() !== '');
    return {
      contextos: w.__contextosApp?.length ?? 0,
      estado: w.__contextosApp?.[0]?.state ?? null,
      resumes: w.__resumes ?? 0,
      maxByte: w.__maxByte ?? 0,
      avisos: avisos.map((e) => (e.textContent ?? '').trim()),
    };
  });
}

async function iniciar(page: Page, nacerSuspendido: boolean): Promise<void> {
  await espiar(page, nacerSuspendido);
  await page.goto('/analizador-espectro/');
  await esperarHidratacion(page, ['#sensitivity-slider']);
  await page.getByRole('button', { name: /Iniciar análisis/ }).tap();
  await expect(page.getByRole('button', { name: /Detener/ })).toBeVisible({ timeout: 10_000 });
  await expect.poll(async () => (await lectura(page)).contextos).toBe(1);
}

test('control · sin la envoltura el contexto corre y el micrófono falso llega al analizador', async ({ page }) => {
  await iniciar(page, false);
  await expect.poll(async () => (await lectura(page)).estado).toBe('running');
  // Llegan muestras distintas de cero: el pitido del dispositivo falso, no un array de ceros.
  await expect.poll(async () => (await lectura(page)).maxByte, { timeout: 5000 }).toBeGreaterThan(20);
  await expect(frecuencia(page)).toHaveText(CIFRA_HZ, { timeout: 5000 });
});

test('la emulación es fiel: el contexto de la app, reanudado desde fuera, mide', async ({ page }) => {
  // Testigo de que la envoltura solo suspende y no rompe nada más: si la app no lo reanuda, se
  // reanuda aquí, y el mismo contexto pasa a 'running' y el analizador recibe el pitido. Es,
  // además, la reparación: un `resume()` sobre el contexto de la app basta.
  await iniciar(page, true);
  await page.evaluate(() => (window as VentanaEspia).__contextosApp?.[0]?.resume());
  await expect.poll(async () => (await lectura(page)).estado).toBe('running');
  await expect.poll(async () => (await lectura(page)).maxByte, { timeout: 5000 }).toBeGreaterThan(20);
  await expect(frecuencia(page)).toHaveText(CIFRA_HZ, { timeout: 5000 });
});

test(
  'ABIERTO, cabo C0096 (inspector 04/11/2026): con un AudioContext que nace en «suspended» (EMULACIÓN de Safari) la app no lo reanuda ni avisa, y no mide nada',
  async ({ page }) => {
    test.fail();
    // Esperado: la app llama a resume() y mide (contexto 'running', bytes > 20, cifra en Hz), o
    // avisa de que el audio no arranca. Obtenido el 04/11/2026 en Chromium con la envoltura
    // (Pixel 7, 4 s tras el toque): contexto 'suspended', 0 llamadas a resume(), byte máximo 0
    // en 241 lecturas del bucle, «-- Hz» y «--», región viva «Sin frecuencia dominante», botón
    // «Detener» y ningún aviso. Sin la envoltura, el mismo flujo da 'running', byte 252 y «398 Hz».
    // Reparación: `await audioContext.resume()` tras crearlo (o crearlo dentro del gesto, antes
    // del await de getUserMedia, y reanudarlo después), y si sigue sin correr, decirlo.
    await iniciar(page, true);
    await expect
      .poll(
        async () => {
          const l = await lectura(page);
          return l.estado === 'running' || l.avisos.length > 0;
        },
        { timeout: 6000, message: 'el contexto sigue en «suspended» y la app no avisa' },
      )
      .toBe(true);
    const l = await lectura(page);
    if (l.avisos.length === 0) {
      await expect.poll(async () => (await lectura(page)).maxByte, { timeout: 5000 }).toBeGreaterThan(20);
      await expect(frecuencia(page)).toHaveText(CIFRA_HZ, { timeout: 5000 });
    }
  },
);
