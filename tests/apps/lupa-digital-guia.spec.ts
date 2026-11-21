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
 *
 * Inspector 21/11/2026 (modo cambio): la ventana mínima y el paso por la línea, la máscara negra
 * con «Invertir» que promete la FAQ, el giro del móvil y un hallazgo nuevo marcado con test.fail()
 * (la escala de la guía crece hacia abajo y sus dos controles la mueven en sentidos opuestos).
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

// ═══════════════════════════════════════════════════════════════════════════
// Inspector 21/11/2026 — modo cambio tras 054343e6 (S0275) y 9915bba7 (C0715)
// ═══════════════════════════════════════════════════════════════════════════

/** Centro de la línea guía en fracción de la altura del visor. */
async function centroDeLaLinea(page: Page): Promise<number> {
  const caja = await cajaEnVisor(page, 'linea');
  expect(caja, 'la línea guía está en el visor').not.toBeNull();
  return (caja!.arriba + caja!.abajo) / 2;
}

/**
 * Esperados a mano, de acotarGuia (guia.ts: el centro de la máscara va de alto/2 a 100 − alto/2;
 * el de la línea, de 0 a 100) y del teclado del asa (flecha ±2, Mayús+flecha y Re/Av Pág ±10):
 *   · ventana de 10 %: tope 5-95; centro 50 → velo de arriba hasta el 45 %, el de abajo desde el 55 %
 *   · «Inicio» → 5 (velo de arriba de alto 0, el de abajo desde el 10 %); «Av Pág» → 15;
 *     Mayús+↓ → 25; ↑ → 23
 *   · «Línea guía»: el centro sigue en 23 y el tope pasa a 0-100; «Inicio» → 0; de vuelta a la
 *     máscara de 10 %, el centro se reacota a 5
 *   · ventana de 40 %: tope 20-80, el centro 5 sube a 20 y el velo de abajo empieza en el 40 %
 */
test('Inspector 21/11/2026 — con la ventana mínima (10 %) el teclado del asa respeta su tope 5-95, y al pasar por la línea y ensanchar a 40 % la guía se reacota', async ({
  page,
}) => {
  await activarLupa(page);
  await page.getByRole('button', { name: /Máscara/ }).click();
  await page.locator('#control-guia-alto').fill('10');
  await expect(page.locator('label[for="control-guia-alto"]')).toHaveText(/10\s%/);

  const asa = page.getByRole('slider', { name: NOMBRE_ASA });
  await expect(asa).toHaveAttribute('aria-valuemin', '5');
  await expect(asa).toHaveAttribute('aria-valuemax', '95');
  await expect(asa).toHaveAttribute('aria-valuenow', '50');
  expect((await cajaEnVisor(page, 'velo-arriba'))?.abajo).toBeCloseTo(0.45, 2);
  expect((await cajaEnVisor(page, 'velo-abajo'))?.arriba).toBeCloseTo(0.55, 2);

  await asa.focus();
  await asa.press('Home');
  await expect(asa).toHaveAttribute('aria-valuenow', '5');
  expect((await cajaEnVisor(page, 'velo-arriba'))?.abajo).toBeCloseTo(0, 2);
  expect((await cajaEnVisor(page, 'velo-abajo'))?.arriba).toBeCloseTo(0.1, 2);
  await asa.press('PageDown');
  await expect(asa).toHaveAttribute('aria-valuenow', '15');
  await asa.press('Shift+ArrowDown');
  await expect(asa).toHaveAttribute('aria-valuenow', '25');
  await asa.press('ArrowUp');
  await expect(asa).toHaveAttribute('aria-valuenow', '23');

  await page.getByRole('button', { name: /Línea guía/ }).click();
  await expect(asa).toHaveAttribute('aria-valuenow', '23');
  await expect(asa).toHaveAttribute('aria-valuemin', '0');
  expect(await centroDeLaLinea(page)).toBeCloseTo(0.23, 2);
  await asa.focus();
  await asa.press('Home');
  await expect(asa).toHaveAttribute('aria-valuenow', '0');

  await page.getByRole('button', { name: /Máscara/ }).click();
  await expect(asa).toHaveAttribute('aria-valuenow', '5');
  expect((await cajaEnVisor(page, 'velo-abajo'))?.arriba).toBeCloseTo(0.1, 2);

  await page.locator('#control-guia-alto').fill('40');
  await expect(page.locator('label[for="control-guia-alto"]')).toHaveText(/40\s%/);
  await expect(asa).toHaveAttribute('aria-valuenow', '20');
  await expect(asa).toHaveAttribute('aria-valuemin', '20');
  await expect(asa).toHaveAttribute('aria-valuemax', '80');
  expect((await cajaEnVisor(page, 'velo-arriba'))?.abajo).toBeCloseTo(0, 2);
  expect((await cajaEnVisor(page, 'velo-abajo'))?.arriba).toBeCloseTo(0.4, 2);
});

/**
 * RESPUESTA_GUIA_LECTURA (metadata.ts) promete: «con "Invertir", por ejemplo, queda texto claro
 * sobre fondo oscuro dentro de una ventana rodeada de negro». El velo es negro al 82 %
 * (rgba(0, 0, 0, 0.82) en LupaDigital.module.css) y va FUERA del elemento filtrado: cada canal de
 * un punto del velo vale como mucho 0,18 × 255 = 45,9 con el filtro que sea (48 de tope por el
 * redondeo del PNG). En la ventana se ve la imagen: medido, (3, 140, 1) en «Normal» y
 * (255, 120, 255) con «Invertir»; basta con que algún punto pase de 100.
 */
test('Inspector 21/11/2026 — con «Invertir» la máscara sigue siendo negra (el filtro no llega a la guía) y por la ventana se ve la imagen', async ({
  page,
}) => {
  await activarLupa(page);
  await page.getByRole('button', { name: /Máscara/ }).click();
  await expect(page.getByRole('slider', { name: NOMBRE_ASA })).toHaveAttribute('aria-valuenow', '50');

  /** Canales de varios puntos del visor tal como se ven (captura del elemento, leída en un lienzo). */
  const pixeles = async () => {
    const png = await page.locator('canvas').locator('xpath=..').screenshot();
    return page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const lienzo = document.createElement('canvas');
      lienzo.width = img.width;
      lienzo.height = img.height;
      const g = lienzo.getContext('2d')!;
      g.drawImage(img, 0, 0);
      const px = (fx: number, fy: number) =>
        Array.from(g.getImageData(Math.round(img.width * fx), Math.round(img.height * fy), 1, 1).data).slice(0, 3);
      // Ventana de 20 % centrada en el 50 %: velos de 0 a 0,4 y de 0,6 a 1, lejos de los bordes amarillos
      return {
        velo: [px(0.5, 0.1), px(0.8, 0.3), px(0.5, 0.9), px(0.8, 0.7)],
        ventana: [px(0.3, 0.5), px(0.5, 0.5), px(0.7, 0.5)],
      };
    }, png.toString('base64'));
  };

  for (const filtro of ['Normal', 'Invertir']) {
    await page.getByRole('button', { name: new RegExp(filtro) }).click();
    await expect(page.locator('video')).toHaveCSS('filter', filtro === 'Invertir' ? /invert\(1\)/ : /^brightness\(1\) contrast\(1\)$/);
    await expect(page.locator('[data-guia]')).toHaveCSS('filter', 'none');
    const { velo, ventana } = await pixeles();
    for (const p of velo) expect(Math.max(...p), `${filtro}: punto del velo ${p}`).toBeLessThanOrEqual(48);
    expect(Math.max(...ventana.flat()), `${filtro}: la ventana deja ver la imagen (${JSON.stringify(ventana)})`).toBeGreaterThan(100);
  }
});

/**
 * HALLAZGO NUEVO (Inspector 21/11/2026, accesibilidad, bajo) — la posición de la guía se cuenta
 * DESDE ARRIBA (guia.ts) y eso choca con sus dos controles:
 *   · el rótulo visible la llama «Altura de la guía en el visor»: con «Fin» en el asa la línea queda
 *     pegada al borde de ABAJO (caja 0,997-1,003 del visor) y el rótulo dice «100 %». El asa lo
 *     arregla para el lector con su aria-valuetext («… de la altura del visor, desde arriba»); el
 *     rótulo que se ve no lo dice.
 *   · la misma flecha mueve la guía en sentidos opuestos: ↑ en el asa la SUBE (30 → 29 %, la línea
 *     de 0,30 a 0,29), y ↑ en el control de debajo de la imagen —un <input type="range">, que con ↑
 *     suma uno— la BAJA (30 → 31 %, la línea de 0,30 a 0,31).
 * Esperado: la misma flecha mueve la guía hacia el mismo lado en los dos controles, y el número que
 * se llama «Altura» crece hacia arriba (la guía abajo del todo = 0 %), o el rótulo dice desde dónde
 * se cuenta. Reparación natural: contar desde abajo (altura = 100 − distancia desde arriba).
 * Marcado con test.fail(): afirma lo que debería pasar y hoy falla en el primer expect.
 */
test('HALLAZGO NUEVO (accesibilidad) — la flecha ↑ debe mover la guía hacia el mismo lado en el asa y en el control de debajo, y «Altura … %» no debe valer 100 con la guía abajo del todo', async ({
  page,
}) => {
  test.fail();
  await activarLupa(page);
  await page.getByRole('button', { name: /Línea guía/ }).click();
  const asa = page.getByRole('slider', { name: NOMBRE_ASA });
  const rango = page.locator('#control-guia-posicion');
  const rotulo = page.locator('label[for="control-guia-posicion"]');

  await asa.focus();
  let antes = await centroDeLaLinea(page);
  await asa.press('ArrowUp');
  await expect.poll(() => centroDeLaLinea(page)).not.toBeCloseTo(antes, 3);
  const sentidoAsa = Math.sign((await centroDeLaLinea(page)) - antes);

  await rango.focus();
  antes = await centroDeLaLinea(page);
  await rango.press('ArrowUp');
  await expect.poll(() => centroDeLaLinea(page)).not.toBeCloseTo(antes, 3);
  const sentidoRango = Math.sign((await centroDeLaLinea(page)) - antes);
  expect(sentidoRango, '↑ en el control de debajo y en el asa (−1 = la guía sube)').toBe(sentidoAsa);

  // La guía abajo del todo, con la flecha que la baja en el asa
  await asa.focus();
  for (let i = 0; i < 60; i++) await asa.press(sentidoAsa < 0 ? 'ArrowDown' : 'ArrowUp');
  expect(await centroDeLaLinea(page)).toBeCloseTo(1, 1);
  const texto = (await rotulo.textContent()) ?? '';
  expect(/desde arriba/i.test(texto) || /:\s0\s%/.test(texto), `rótulo con la guía abajo: «${texto}»`).toBe(true);
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

  /**
   * Inspector 21/11/2026 — guia.ts promete que «la guía se queda en el mismo renglón al girar el
   * móvil». Esperado a mano: máscara de 20 % con el centro en 30 (diez ↑ de 2 desde 50) → velo de
   * arriba de 0 a 0,20 y el de abajo desde 0,40, con el visor en vertical (medido: 294 px de alto) y
   * en horizontal (495 px), sin tocar nada entre medias.
   */
  test('Inspector 21/11/2026 — al girar el móvil la máscara se queda en su franja (en % del visor, no en píxeles)', async ({
    page,
  }) => {
    await activarLupa(page);
    await page.getByRole('button', { name: /Máscara/ }).click();
    const asa = page.getByRole('slider', { name: NOMBRE_ASA });
    await asa.focus();
    for (let i = 0; i < 10; i++) await asa.press('ArrowUp');
    await expect(asa).toHaveAttribute('aria-valuenow', '30');

    const comprobar = async () => {
      expect((await cajaEnVisor(page, 'velo-arriba'))?.abajo).toBeCloseTo(0.2, 2);
      expect((await cajaEnVisor(page, 'velo-abajo'))?.arriba).toBeCloseTo(0.4, 2);
    };
    await comprobar();
    const altoVertical = (await cajaDelVisor(page)).alto;

    await page.setViewportSize({ width: PIXEL_7.viewport.height, height: PIXEL_7.viewport.width });
    await expect.poll(async () => (await cajaDelVisor(page)).alto).toBeGreaterThan(altoVertical + 100);
    await expect(asa).toHaveAttribute('aria-valuenow', '30');
    await comprobar();
  });
});
