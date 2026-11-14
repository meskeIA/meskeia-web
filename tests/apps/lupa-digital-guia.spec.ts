import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Lupa Digital — guía de lectura (semilla S0275, 14/11/2026)
 *
 * QUÉ PROMETE (metadata.ts → features y RESPUESTA_GUIA_LECTURA): una «Línea guía» bajo el renglón
 * y una «Máscara» que deja ver solo una franja del visor y oscurece lo de arriba y lo de abajo;
 * las dos se mueven con el asa del borde izquierdo del visor (también con las flechas) o con su
 * control, la máscara deja elegir el alto de la ventana, y con la imagen congelada se arrastra
 * la IMAGEN bajo la ventana para ir pasando el texto.
 *
 * Todo va en % de la altura del visor, así que se mide la CAJA de cada pieza contra la del
 * visor —lo que se ve—, no el valor del control. Valores esperados, a mano: con la ventana de
 * 20 % centrada en el 50 %, el velo de arriba cubre del 0 al 40 % y el de abajo empieza en el
 * 60 %; el centro de la ventana no puede pasar del 90 % (100 − 20/2), y al ensanchar la
 * ventana a 40 % el tope baja al 80 % y la guía se recoloca ahí.
 *
 * Cámara simulada de Chromium, como en lupa-digital.spec.ts.
 */

test.use({
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
  permissions: ['camera'],
});

const RUTA = '/lupa-digital/';
const NOMBRE_ASA = 'Posición de la guía de lectura';

async function activarLupa(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#control-zoom']);
  await page.getByRole('button', { name: /Activar lupa/i }).click();
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

/** Caja de una pieza de la guía en fracción de la altura del visor: { arriba, abajo }. */
function cajaEnVisor(page: Page, parte: string) {
  return page.evaluate((p) => {
    const visor = document.querySelector('canvas')?.parentElement?.getBoundingClientRect();
    const pieza = document.querySelector(`[data-guia-parte="${p}"]`)?.getBoundingClientRect();
    if (!visor || !pieza) return null;
    return { arriba: (pieza.top - visor.top) / visor.height, abajo: (pieza.bottom - visor.top) / visor.height };
  }, parte);
}

test('S0275 — la máscara deja ver solo su franja, se mueve con el teclado dentro de su tope y se recoloca al ensanchar la ventana', async ({
  page,
}) => {
  await activarLupa(page);

  // Sin guía elegida no hay nada sobre la imagen (y los deslizadores siguen en su orden).
  await expect(page.locator('[data-guia]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Sin guía/ })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: /Máscara/ }).click();
  await expect(page.getByRole('button', { name: /Máscara/ })).toHaveAttribute('aria-pressed', 'true');

  const asa = page.getByRole('slider', { name: NOMBRE_ASA });
  await expect(asa).toHaveAttribute('aria-valuenow', '50');
  await expect(asa).toHaveAttribute('aria-valuemin', '10');
  await expect(asa).toHaveAttribute('aria-valuemax', '90');

  // Ventana de 20 % centrada en el 50 %: velo de 0 a 40 %, y el de abajo desde el 60 %.
  let arriba = await cajaEnVisor(page, 'velo-arriba');
  let abajo = await cajaEnVisor(page, 'velo-abajo');
  expect(arriba?.arriba).toBeCloseTo(0, 2);
  expect(arriba?.abajo).toBeCloseTo(0.4, 2);
  expect(abajo?.arriba).toBeCloseTo(0.6, 2);
  expect(abajo?.abajo).toBeCloseTo(1, 2);

  // Cinco flechas abajo, de 2 en 2: centro en el 60 % → velo de arriba hasta el 50 %.
  await asa.focus();
  for (let i = 0; i < 5; i++) await asa.press('ArrowDown');
  await expect(asa).toHaveAttribute('aria-valuenow', '60');
  arriba = await cajaEnVisor(page, 'velo-arriba');
  expect(arriba?.abajo).toBeCloseTo(0.5, 2);

  // «Fin» lleva al tope: la ventana entera sigue dentro del visor (centro en el 90 %).
  await asa.press('End');
  await expect(asa).toHaveAttribute('aria-valuenow', '90');
  abajo = await cajaEnVisor(page, 'velo-abajo');
  expect(abajo?.arriba).toBeCloseTo(1, 2);

  // Ventana de 40 %: el tope baja al 80 % y la guía se recoloca, sin salirse por abajo.
  await page.locator('#control-guia-alto').fill('40');
  await expect(page.locator('label[for="control-guia-alto"]')).toHaveText(/40\s%/);
  await expect(asa).toHaveAttribute('aria-valuenow', '80');
  await expect(asa).toHaveAttribute('aria-valuemax', '80');
  arriba = await cajaEnVisor(page, 'velo-arriba');
  abajo = await cajaEnVisor(page, 'velo-abajo');
  expect(arriba?.abajo).toBeCloseTo(0.6, 2);
  expect(abajo?.arriba).toBeCloseTo(1, 2);

  // La línea guía usa el mismo centro, ahora sin margen: va de borde a borde.
  await page.getByRole('button', { name: /Línea guía/ }).click();
  await expect(asa).toHaveAttribute('aria-valuemin', '0');
  await expect(asa).toHaveAttribute('aria-valuemax', '100');
  const linea = await cajaEnVisor(page, 'linea');
  expect(linea?.arriba).toBeCloseTo(0.8, 1);
  await expect(page.locator('[data-guia-parte^="velo"]')).toHaveCount(0);

  // «Sin guía» la retira entera.
  await page.getByRole('button', { name: /Sin guía/ }).click();
  await expect(page.locator('[data-guia]')).toHaveCount(0);
});

test.describe('en móvil (Pixel 7)', () => {
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  /** Arrastre con el dedo de verdad (touch nativo por CDP), de un punto de pantalla a otro. */
  async function arrastrarConElDedo(page: Page, desde: { x: number; y: number }, hasta: { x: number; y: number }) {
    const cdp = await page.context().newCDPSession(page);
    const dedo = (x: number, y: number) => [{ x: Math.round(x), y: Math.round(y), radiusX: 5, radiusY: 5, force: 1, id: 1 }];
    const pasos = 10;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: dedo(desde.x, desde.y) });
    for (let i = 1; i <= pasos; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: dedo(desde.x + ((hasta.x - desde.x) * i) / pasos, desde.y + ((hasta.y - desde.y) * i) / pasos),
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  }

  function cajaDelVisor(page: Page) {
    return page.evaluate(() => {
      const r = document.querySelector('canvas')?.parentElement?.getBoundingClientRect();
      return { x: r?.x ?? 0, y: r?.y ?? 0, ancho: r?.width ?? 0, alto: r?.height ?? 0 };
    });
  }

  test('S0275 — el asa se arrastra con el dedo; los velos dejan pasar el gesto: en directo desplaza la página y, congelada, el dedo en la ventana recorre la imagen', async ({
    page,
  }) => {
    await activarLupa(page);
    await page.getByRole('button', { name: /Línea guía/ }).click();
    await page.evaluate(() => document.querySelector('canvas')?.parentElement?.scrollIntoView({ block: 'center' }));

    // El asa, del 50 % al 25 % de la altura del visor con el dedo.
    const asa = page.getByRole('slider', { name: NOMBRE_ASA });
    const cajaAsa = await asa.boundingBox();
    let visor = await cajaDelVisor(page);
    expect(cajaAsa).not.toBeNull();
    const centroAsa = { x: cajaAsa!.x + cajaAsa!.width / 2, y: cajaAsa!.y + cajaAsa!.height / 2 };
    await arrastrarConElDedo(page, centroAsa, { x: centroAsa.x, y: visor.y + visor.alto * 0.25 });
    await expect
      .poll(async () => Number(await asa.getAttribute('aria-valuenow')))
      .toBeGreaterThanOrEqual(24);
    expect(Number(await asa.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(26);

    // Máscara en directo: un gesto vertical sobre el velo desplaza la página (C0067), no la guía.
    await page.getByRole('button', { name: /Máscara/ }).click();
    await page.evaluate(() => document.querySelector('canvas')?.parentElement?.scrollIntoView({ block: 'center' }));
    visor = await cajaDelVisor(page);
    const posAntes = await asa.getAttribute('aria-valuenow');
    const scrollAntes = await page.evaluate(() => window.scrollY);
    const enElVeloDeAbajo = { x: visor.x + visor.ancho / 2, y: visor.y + visor.alto * 0.9 };
    await arrastrarConElDedo(page, enElVeloDeAbajo, { x: enElVeloDeAbajo.x, y: enElVeloDeAbajo.y - 150 });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollAntes);
    await expect(asa).toHaveAttribute('aria-valuenow', posAntes ?? '');

    // Congelada a 4x: el dedo dentro de la ventana arrastra la IMAGEN bajo la guía.
    await page.getByRole('button', { name: '4x', exact: true }).click();
    await page.getByRole('button', { name: /Congelar/i }).click();
    const lienzo = page.locator('canvas');
    await expect(lienzo).toBeVisible();
    await page.evaluate(() => document.querySelector('canvas')?.parentElement?.scrollIntoView({ block: 'center' }));
    visor = await cajaDelVisor(page);
    const centro = Number(await asa.getAttribute('aria-valuenow')) / 100;
    const enLaVentana = { x: visor.x + visor.ancho / 2, y: visor.y + visor.alto * centro };
    await arrastrarConElDedo(page, enLaVentana, { x: enLaVentana.x - 80, y: enLaVentana.y });
    await expect(lienzo).toHaveAttribute('style', /translate\(-80px, 0px\) scale\(4\)/);
    await expect(asa).toHaveAttribute('aria-valuenow', posAntes ?? '');
  });
});
