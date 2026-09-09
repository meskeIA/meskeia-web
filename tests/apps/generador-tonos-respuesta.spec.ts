import { test, expect, type Page } from '@playwright/test';

/**
 * Generador de Tonos — medida de respuesta con el micrófono.
 *
 * Fichero aparte del de regresión del Inspector (`generador-tonos.spec.ts`) a propósito: aquel
 * arranca Chromium instrumentando la Web Audio API y este necesita además el micrófono
 * simulado, y `test.use()` es por fichero — meterlos juntos obligaría a que uno de los dos
 * corriese con los flags del otro.
 *
 * Lo que se prueba aquí NO es que la curva salga bonita: es que la app se calle cuando no
 * puede medir. Una gráfica de respuesta en frecuencia es convincente por su propia forma, así
 * que el fallo peligroso de esta función no es equivocarse en un decibelio, es dibujar una
 * curva plausible sobre datos que no existen —micrófono denegado, cancelación de eco activa,
 * ningún tono que despegue del ruido— y que el usuario se la crea.
 *
 * Los tres casos de abajo son exactamente esos tres.
 */

const RUTA = '/generador-tonos/';

/**
 * El aviso de la app, no el de Next.
 *
 * Next monta un <div role="alert" id="__next-route-announcer__"> permanente para anunciar los
 * cambios de ruta, así que getByRole('alert') a secas devuelve dos elementos y el test falla
 * por ambigüedad aunque la app esté haciendo lo correcto.
 */
const avisoDeLaApp = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)');

/** El botón de una ranura, con cualquiera de sus tres rótulos (medir / midiendo / repetir). */
const botonMedida = (page: Page, ranura: 'A' | 'B') =>
  page.getByRole('button', { name: new RegExp(`(Medir|Midiendo|Repetir medida) ${ranura}`) });

/** Sustituye getUserMedia por una que falla, como cuando el usuario deniega el permiso. */
async function conMicrofonoDenegado(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: () => Promise.reject(new DOMException('Denegado', 'NotAllowedError')),
    });
  });
}

/**
 * Deja abrir el micrófono pero hace que la pista declare la cancelación de eco todavía
 * activa: es el navegador que ignora en silencio lo que se le pidió.
 */
async function conCancelacionDeEcoImpuesta(page: Page) {
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async (restricciones: MediaStreamConstraints) => {
        const stream = await original(restricciones);
        const pista = stream.getAudioTracks()[0];
        pista.getSettings = () => ({ echoCancellation: true, noiseSuppression: false, autoGainControl: false });
        return stream;
      },
    });
  });
}

test.use({
  launchOptions: {
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      // Sin usuario delante, el AudioContext nacería suspendido y no emitiría ningún tono.
      '--autoplay-policy=no-user-gesture-required',
    ],
  },
  permissions: ['microphone'],
});

test.describe('Generador de Tonos — la sección de medida', () => {
  test('la sección existe y no hay gráfica hasta que haya una medida', async ({ page }) => {
    await page.goto(RUTA);

    await expect(page.getByRole('heading', { name: 'Medir la respuesta con el micrófono' })).toBeVisible();
    await expect(botonMedida(page, 'A')).toBeVisible();
    await expect(botonMedida(page, 'B')).toBeVisible();

    // Sin datos no se dibuja nada: ni gráfica, ni tabla, ni botón de borrar.
    await expect(page.locator('svg[role="img"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Borrar medidas' })).toHaveCount(0);
  });

  test('las limitaciones se leen ANTES de medir, no escondidas tras el resultado', async ({ page }) => {
    await page.goto(RUTA);

    // Que la medida es relativa y comparativa tiene que estar a la vista de entrada: es lo que
    // impide leer una curva suelta como un veredicto sobre el altavoz.
    await expect(page.getByText('Qué es y qué no es esta medida')).toBeVisible();
    await expect(page.getByText(/ninguna de las tres partes\s+está calibrada/)).toBeVisible();
  });
});

test.describe('Generador de Tonos — se calla cuando no puede medir', () => {
  test('micrófono denegado: lo dice y no dibuja ninguna curva', async ({ page }) => {
    await conMicrofonoDenegado(page);
    await page.goto(RUTA);

    await botonMedida(page, 'A').click();

    const aviso = avisoDeLaApp(page);
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText(/permiso al navegador/i);
    await expect(page.locator('svg[role="img"]')).toHaveCount(0);
  });

  test('cancelación de eco impuesta por el navegador: NO se mide, y se explica por qué', async ({ page }) => {
    await conCancelacionDeEcoImpuesta(page);
    await page.goto(RUTA);

    await botonMedida(page, 'A').click();

    const aviso = avisoDeLaApp(page);
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('cancelación de eco');
    // Lo que de verdad se prueba: NO hay gráfica. Con la cancelación activa la curva saldría
    // igualmente dibujable, y sería una invención completa.
    await expect(page.locator('svg[role="img"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Borrar medidas' })).toHaveCount(0);
  });
});

test.describe('Generador de Tonos — una medida completa', () => {
  test('mide de principio a fin y nunca presume de puntos que no tiene', async ({ page }) => {
    await page.goto(RUTA);

    const botonA = botonMedida(page, 'A');
    await botonA.click();

    // Mientras mide, no se puede lanzar otra medida encima.
    await expect(botonMedida(page, 'B')).toBeDisabled();

    // La retícula son 26 tercios de octava; con márgenes, la pasada entera no llega a 20 s.
    await expect(botonA).toBeEnabled({ timeout: 25000 });

    const hayAviso = await avisoDeLaApp(page).count();
    if (hayAviso > 0) {
      // Con el micrófono simulado de Chromium no hay acoplamiento acústico real, así que cada
      // punto recoge un pedazo de ruido distinto. Lo CORRECTO es entonces descartar la medida
      // y decirlo — no pintar el zigzag como si fuera la respuesta de un altavoz.
      await expect(avisoDeLaApp(page)).toContainText(
        /no llegó a despegar|saltan demasiado entre frecuencias vecinas|se ha interrumpido/i,
      );
      // Y descartada quiere decir descartada: ni gráfica, ni resumen, ni tabla de números.
      await expect(page.locator('svg[role="img"]')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Borrar medidas' })).toHaveCount(0);
      return;
    }

    // Si sí midió algo, el recuento tiene que estar a la vista: «N de 26 puntos medidos».
    await expect(page.locator('svg[role="img"]')).toBeVisible();
    const resumen = page.getByText(/de 26 puntos medidos/);
    await expect(resumen.first()).toBeVisible();

    // Y la tabla de la medida tiene UNA fila por tercio de octava, huecos incluidos: los
    // puntos sin señal se nombran («sin medida»), no se omiten ni se rellenan con un número.
    // Se acota al <details> propio porque la página tiene además tablas del bloque educativo.
    const detalle = page.locator('details', { has: page.locator('summary', { hasText: 'Ver los números' }) });
    await detalle.locator('summary').click();
    await expect(detalle.locator('tbody tr')).toHaveCount(26);
  });
});
