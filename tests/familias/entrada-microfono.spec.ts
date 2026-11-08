import { test, expect, devices, type Page } from '@playwright/test';

/**
 * Testigo de familia · apps que meten el micrófono en un AudioContext (cabo C0629, 05/11/2026).
 *
 * INVARIANTE: un AudioContext que nace en 'suspended' no deja la app escuchando ceros en
 * silencio. La app lo reanuda (resume) y mide, y si el navegador no lo arranca, lo dice en un
 * role="alert".
 *
 * DE DÓNDE SALE: hallazgo 4071 de analizador-espectro (f0d02be3, 04/11/2026). El contexto se
 * creaba tras el `await` de getUserMedia, que en Safari de iOS lo deja fuera del gesto del usuario,
 * y nadie llamaba a resume(): «Detener» a la vista, «-- Hz» y ningún aviso. Al repararlo se vio que
 * sonometro, afinador-instrumentos, prueba-microfono y ejercicios-vocalizacion tampoco lo
 * reanudaban (las cinco que hacen createMediaStreamSource sin resume, por grep del 05/11/2026;
 * amplificador-sonido, daf-retroalimentacion-auditiva y generador-tonos ya lo reanudaban). La
 * receta vive en `mantenerAudioEnMarcha` de lib/useEntradaAudio.ts.
 *
 * ES UNA EMULACIÓN, NO SAFARI (el WebKit de Playwright no está en esta máquina): un addInitScript
 * envuelve el constructor de AudioContext para que cada instancia llame a suspend() al nacer. Dos
 * casos por app:
 *   · «resume arranca»: resume() es el real → la app tiene que llamarlo y el contexto, correr.
 *     Sin la receta: 0 llamadas a resume() y contexto 'suspended' (medido en el analizador).
 *   · «resume no arranca»: resume() resuelve sin hacer nada (el navegador se niega) → el
 *     contexto sigue suspendido y la app tiene que avisar con un role="alert" que lo diga.
 *
 * Para añadir una hermana: una fila en APPS con su ruta y el nombre de su botón de arranque.
 */

interface AppMicrofono {
  slug: string;
  /** Nombre accesible del botón que abre el micrófono */
  boton: RegExp;
}

const APPS: AppMicrofono[] = [
  { slug: 'analizador-espectro', boton: /Iniciar análisis/ },
  { slug: 'sonometro', boton: /Iniciar medición/ },
  { slug: 'afinador-instrumentos', boton: /Iniciar afinador/ },
  { slug: 'prueba-microfono', boton: /Iniciar Micrófono/ },
  { slug: 'ejercicios-vocalizacion', boton: /Activar micrófono/ },
  // S0260 (08/11/2026): la prueba de micrófono dentro de la de cámara
  { slug: 'prueba-camara', boton: /Probar micrófono/ },
];

test.use({
  ...devices['Pixel 7'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
  permissions: ['microphone'],
});

type VentanaEspia = Window & { __contextosApp?: AudioContext[]; __resumes?: number };

/** Cada AudioContext nace suspendido; se cuentan los resume() y se guarda el contexto de la app. */
async function espiar(page: Page, resumeArranca: boolean): Promise<void> {
  await page.addInitScript((arranca: boolean) => {
    const w = window as VentanaEspia;
    w.__contextosApp = [];
    w.__resumes = 0;
    const Original = window.AudioContext;
    class ContextoSuspendido extends Original {
      constructor(opciones?: AudioContextOptions) {
        super(opciones);
        void this.suspend();
      }
    }
    window.AudioContext = ContextoSuspendido;
    const conWebkit = window as unknown as { webkitAudioContext?: typeof AudioContext };
    if (conWebkit.webkitAudioContext) conWebkit.webkitAudioContext = ContextoSuspendido;
    const reanudar = Original.prototype.resume;
    Original.prototype.resume = function (this: AudioContext) {
      w.__resumes = (w.__resumes ?? 0) + 1;
      return arranca ? reanudar.call(this) : Promise.resolve();
    };
    const crearFuente = Original.prototype.createMediaStreamSource;
    Original.prototype.createMediaStreamSource = function (this: AudioContext, flujo: MediaStream) {
      w.__contextosApp?.push(this);
      return crearFuente.call(this, flujo);
    };
  }, resumeArranca);
}

/** Estado del último AudioContext creado por la página y los avisos role="alert" con texto. */
async function lectura(page: Page) {
  return page.evaluate(() => {
    const w = window as VentanaEspia;
    const avisos = [...document.querySelectorAll('[role="alert"]')]
      .map((e) => (e.textContent ?? '').trim())
      .filter((t) => t !== '');
    return { resumes: w.__resumes ?? 0, avisos };
  });
}

/** Estado del contexto que la página creó al abrir el micrófono (el último construido). */
async function estadoContexto(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const w = window as VentanaEspia;
    const lista = w.__contextosApp ?? [];
    return lista.length ? lista[lista.length - 1].state : null;
  });
}

/** Espera a que React haya montado el manejador del botón: un toque anterior se perdería. */
async function arrancar(page: Page, app: AppMicrofono): Promise<void> {
  await page.goto(`/${app.slug}/`);
  const boton = page.getByRole('button', { name: app.boton }).first();
  await expect(boton).toBeVisible();
  await expect
    .poll(() =>
      boton.evaluate((el) => Object.keys(el).some((k) => k.startsWith('__reactProps$'))),
    )
    .toBe(true);
  await boton.tap();
}

for (const app of APPS) {
  test.describe(`${app.slug} · AudioContext que nace suspendido (EMULACIÓN de Safari)`, () => {
    test('resume arranca: la app lo reanuda y el contexto corre, sin aviso de audio', async ({ page }) => {
      await espiar(page, true);
      await arrancar(page, app);
      await expect
        .poll(() => estadoContexto(page), { timeout: 8000, message: 'el contexto sigue sin correr' })
        .toBe('running');
      const l = await lectura(page);
      expect(l.resumes, 'la app llama a resume()').toBeGreaterThan(0);
      expect(l.avisos.filter((t) => /no ha arrancado el audio/.test(t))).toEqual([]);
    });

    test('resume no arranca: la app lo dice en un role="alert"', async ({ page }) => {
      await espiar(page, false);
      await arrancar(page, app);
      await expect
        .poll(async () => (await lectura(page)).avisos.some((t) => /no ha arrancado el audio/.test(t)), {
          timeout: 8000,
          message: 'el contexto sigue suspendido y la app no avisa',
        })
        .toBe(true);
      // poll: prueba-microfono reabre el micrófono a los 100 ms de conocer la lista de
      // dispositivos, y entre medias el último contexto es el viejo, ya cerrado
      await expect.poll(() => estadoContexto(page), { timeout: 8000 }).toBe('suspended');
      await expect
        .poll(async () => (await lectura(page)).avisos.some((t) => /no ha arrancado el audio/.test(t)))
        .toBe(true);
    });
  });
}
