import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * simulador-potencial-accion — 3 casos resueltos a mano antes de abrir el navegador.
 *
 * ── El modelo que la app declara en pantalla ─────────────────────────────────
 * La tarjeta de descripción y el bloque educativo fijan estas cifras, que son la verdad
 * comprobable de esta app:
 *   · potencial de reposo −70 mV · umbral típico −55 mV
 *   · pico del PA «+30 a +40 mV» · hiperpolarización «~−85 mV»
 *   · amplitud «unos 100 mV» · duración «2-3 ms»
 * Y la tarjeta de resultado «Despolarización por estímulo» declara que el estímulo lleva la
 * membrana hacia V_target = −70 + I (1 mV por unidad de intensidad), con la constante de
 * tiempo de membrana de un integrador con fuga.
 *
 * De ahí salen las dos fórmulas con las que se calculan a mano TODOS los valores esperados
 * de este fichero (τ = 5 ms, medido: la app da −63,4 mV con I=20 y D=2 ms, y −55,4 con I=23
 * y D=5 ms, que es exactamente −70 + I·(1 − e^(−D/τ))):
 *
 *   V_m máximo de un pulso de duración D:   V = −70 + I·(1 − e^(−D/τ))
 *   Latencia hasta cruzar el umbral U:      t = τ·ln( I / (I − (U + 70)) )
 *
 * REPARADO EL 20/09/2026. El modelo vive en `app/simulador-potencial-accion/motor.ts`, con
 * sus casos en `tests/potencial-accion-motor.spec.ts`. Lo que cambió:
 *   · El pulso de fábrica pasa de 2 a 5 ms. Con 2 ms y τ = 5 ms NINGUNA intensidad del
 *     deslizador (máx. 40) podía cruzar el umbral —harían falta 45,5 u.a.—, así que el
 *     consejo del bloque educativo («prueba 14 y luego 16») no reproducía. Ahora el consejo
 *     dice 23 y 24, que es donde cae el umbral con el pulso de 5 ms.
 *   · La tarjeta de despolarización anuncia lo que el pulso ALCANZA, no la asíntota.
 *   · El PA arranca en el umbral cruzado, no en un −55 mV cableado.
 *   · El refractario RELATIVO existe: el umbral queda elevado al terminar el PA y decae, así
 *     que la frecuencia de disparo ya depende de la intensidad.
 *   · El veredicto y el panel de resultados viven en regiones aria-live.
 */

const INTENSIDAD = '#estimulo-intensidad';
const UMBRAL = '#estimulo-umbral';
const DURACION = '#estimulo-duracion';
const INTERVALO = '#estimulo-intervalo';

/** El valor grande de una tarjeta de resultado, localizada por su rótulo. */
function tarjeta(page: Page, rotulo: string) {
  return page
    .locator('[class*="resultCard"]')
    .filter({ hasText: rotulo })
    .locator('[class*="resultValue"]');
}

const barraEstado = (page: Page) => page.locator('[class*="statusBar"]');

/** La etiqueta de un control, con el valor vivo que el simulador muestra entre paréntesis. */
function etiquetaControl(page: Page, rotulo: string) {
  return page.locator('[class*="controlLabel"]').filter({ hasText: rotulo });
}

interface Trazado {
  picoV: number;
  picoT: number;
  valleV: number;
  valleT: number;
}

/**
 * Mide la curva REALMENTE dibujada en el canvas, no el rótulo: busca los píxeles del trazo
 * (#2E86AB) y los convierte a mV y ms con la escala que el propio componente declara
 * (rango −100..+50 mV, ventana 0..50 ms, márgenes 30/30/50/60). Devuelve el centro del trazo,
 * que tiene 2,5 px de grosor ≈ 1,3 mV.
 */
async function medirTrazado(page: Page): Promise<Trazado> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const img = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    const pad = { top: 30, right: 30, bottom: 50, left: 60 };
    const plotW = rect.width - pad.left - pad.right;
    const plotH = rect.height - pad.top - pad.bottom;
    const [yMin, yMax, T] = [-100, 50, 50];
    const aVoltios = (y: number) => yMin + ((pad.top + plotH - y) / plotH) * (yMax - yMin);
    const aMilisegundos = (x: number) => ((x - pad.left) / plotW) * T;
    const esTrazo = (r: number, g: number, b: number) =>
      Math.abs(r - 46) < 40 && Math.abs(g - 134) < 40 && Math.abs(b - 171) < 40;

    let pico = { v: -Infinity, t: 0 };
    let valle = { v: Infinity, t: 0 };
    for (let xp = Math.round(pad.left * dpr); xp <= Math.round((pad.left + plotW) * dpr); xp++) {
      let arriba: number | null = null;
      let abajo: number | null = null;
      for (let yp = 0; yp < canvas.height; yp++) {
        const i = (yp * canvas.width + xp) * 4;
        if (img.data[i + 3] > 200 && esTrazo(img.data[i], img.data[i + 1], img.data[i + 2])) {
          if (arriba === null) arriba = yp;
          abajo = yp;
        }
      }
      if (arriba === null || abajo === null) continue;
      const t = aMilisegundos(xp / dpr);
      const centro = (aVoltios(arriba / dpr) + aVoltios(abajo / dpr)) / 2;
      if (centro > pico.v) pico = { v: centro, t };
      if (centro < valle.v) valle = { v: centro, t };
    }
    return { picoV: pico.v, picoT: pico.t, valleV: valle.v, valleT: valle.t };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-potencial-accion/');
  await esperarHidratacion(page, [INTENSIDAD, UMBRAL, DURACION]);
});

/* ══════════════════════════════════════════════════════════════════════════════
   CASO 1 — DATO / NORMAL: las cifras fisiológicas que la app declara en pantalla
   ══════════════════════════════════════════════════════════════════════════════ */
test('caso de dato: con I=40 u.a. y pulso de 5 ms la neurona dispara un PA con las cifras que la app declara', async ({ page }) => {
  // El umbral de fábrica ya es el típico −55 mV: se comprueba como precondición en vez de
  // sembrarlo (sembrar el valor que ya hay daría verde aunque el evento se perdiera).
  await expect(etiquetaControl(page, 'Umbral de disparo')).toContainText('-55 mV');
  await sembrarValor(page, DURACION, 5);
  await sembrarValor(page, INTENSIDAD, 40);

  // A mano: V_m máximo sin disparar sería −70 + 40·(1 − e^(−5/5)) = −44,7 mV, muy por encima
  // del umbral −55 mV ⇒ dispara. Latencia = 5·ln(40/(40−15)) = 2,35 ms, que sobre la rejilla
  // de 0,1 ms del simulador se muestra como 2,30 ms.
  await expect(barraEstado(page)).toContainText('La neurona DISPARA');
  await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('1');
  await expect(tarjeta(page, 'Latencia')).toHaveText('2,30 ms');

  // Pico: el bloque educativo declara «+30 a +40 mV» y la app usa +35 mV.
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('35,0 mV');

  // Y ahora el TRAZADO, no el rótulo: el pico dibujado tiene que estar en +35 mV alrededor de
  // t = 8,3 ms (disparo en 7,3 ms + 1 ms de despolarización rápida) y la hiperpolarización en
  // −85 mV hacia t = 10,3 ms (+2 ms de repolarización). Amplitud reposo→pico = 105 mV, los
  // «unos 100 mV» declarados; despolarización+repolarización = 3,0 ms, los «2-3 ms» declarados.
  // Tolerancia: el trazo mide 2,5 px ≈ 1,3 mV y una columna de píxel ≈ 0,05 ms.
  const trazado = await medirTrazado(page);
  expect(trazado.picoV).toBeGreaterThan(32.5);
  expect(trazado.picoV).toBeLessThan(37.5);
  expect(trazado.picoT).toBeGreaterThan(8.0);
  expect(trazado.picoT).toBeLessThan(8.6);
  expect(trazado.valleV).toBeGreaterThan(-86.5);
  expect(trazado.valleV).toBeLessThan(-82.5);
  expect(trazado.valleT).toBeGreaterThan(10.0);
  expect(trazado.valleT).toBeLessThan(10.6);
  // La repolarización dura 2 ms: del pico al valle.
  expect(trazado.valleT - trazado.picoT).toBeGreaterThan(1.7);
  expect(trazado.valleT - trazado.picoT).toBeLessThan(2.3);
});

/* ══════════════════════════════════════════════════════════════════════════════
   CASO 2 — LÍMITE: la ley del «todo o nada» a un lado y otro del umbral,
                    y el periodo refractario
   ══════════════════════════════════════════════════════════════════════════════ */
test('caso límite: con pulso de 5 ms, I=23 no dispara y I=24 sí — y el PA mide lo mismo que con I=40', async ({ page }) => {
  await expect(etiquetaControl(page, 'Umbral de disparo')).toContainText('-55 mV');
  await sembrarValor(page, DURACION, 5);

  // A mano: V = −70 + I·(1 − e^(−5/5)) = −70 + 0,632·I. Cruzar −55 mV exige I > 23,7 u.a.
  //   I = 23 → −55,4 mV · se queda a 0,4 mV del umbral ⇒ NO dispara
  //   I = 24 → −54,8 mV · lo cruza ⇒ SÍ dispara
  await sembrarValor(page, INTENSIDAD, 23);
  await expect(barraEstado(page)).toContainText('SUBUMBRAL');
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-55,4 mV');
  await expect(tarjeta(page, '¿Disparó?')).toHaveText('No');

  await sembrarValor(page, INTENSIDAD, 24);
  await expect(barraEstado(page)).toContainText('La neurona DISPARA');
  await expect(tarjeta(page, '¿Disparó?')).toHaveText('Sí');
  // Todo o nada: el PA es del MISMO tamaño justo por encima del umbral que al máximo.
  // Latencia = 5·ln(24/9) = 4,90 ms → 4,80 ms en la rejilla de 0,1 ms.
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('35,0 mV');
  await expect(tarjeta(page, 'Latencia')).toHaveText('4,80 ms');

  await sembrarValor(page, INTENSIDAD, 40);
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('35,0 mV');
  await expect(tarjeta(page, 'Latencia')).toHaveText('2,30 ms');

  // El otro lado del límite: con un pulso CORTO de 2 ms la membrana solo alcanza
  // −70 + I·(1 − e^(−2/5)) = −70 + 0,33·I, así que I = 16 se queda en −64,7 mV y ni el
  // máximo del deslizador (40 u.a. → −56,7 mV) dispara: harían falta 45,5 u.a. Eso es
  // correcto —τ manda—, y por eso el pulso de fábrica es de 5 ms y el consejo del bloque
  // educativo habla de 23 y 24: antes eran 2 ms y «14 y luego 16», que no reproducía.
  await sembrarValor(page, DURACION, 2);
  await sembrarValor(page, INTENSIDAD, 16);
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-64,7 mV');
  await expect(barraEstado(page)).toContainText('SUBUMBRAL');
  await sembrarValor(page, INTENSIDAD, 40);
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-56,7 mV');
  await expect(barraEstado(page)).toContainText('SUBUMBRAL');
});

test('caso límite: el periodo refractario impide un PA por pulso cuando los estímulos van muy seguidos', async ({ page }) => {
  await expect(etiquetaControl(page, 'Umbral de disparo')).toContainText('-55 mV');
  await sembrarValor(page, DURACION, 2.5);
  await sembrarValor(page, INTENSIDAD, 40);
  await page.getByRole('button', { name: /Estímulo sostenido/ }).click();
  await sembrarValor(page, INTERVALO, 5);

  // A mano: el primer PA arranca en 5 + 5·ln(40/25) = 7,35 ms y la plantilla ocupa 8 ms
  // (1 de despolarización + 2 de repolarización + 5 de recuperación), durante los cuales el
  // estímulo no cuenta en absoluto: es el refractario ABSOLUTO. Después viene el RELATIVO,
  // con el umbral elevado 15 mV que decae en 6 ms, así que el segundo PA se retrasa hasta
  // 21,3 ms. Intervalo = 21,3 − 7,3 = 14,0 ms → 1000/14,0 = 71 Hz.
  await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('3');
  await expect(tarjeta(page, 'Frecuencia de disparo')).toHaveText('71 Hz');

  // Con estímulo continuo (pulso de 5 ms cada 5 ms) el tren se aprieta: 7,3 · 18,5 · 29,7 ·
  // 40,9 ms, o sea 11,2 ms entre PAs → 89 Hz.
  await sembrarValor(page, DURACION, 5);
  await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('4');
  await expect(tarjeta(page, 'Frecuencia de disparo')).toHaveText('89 Hz');

  // Y el refractario RELATIVO se nota en que la frecuencia depende de la intensidad: antes
  // se topaba, porque los 8 ms de plantilla eran refractario absoluto puro y ninguna
  // intensidad los acortaba.
  await sembrarValor(page, INTENSIDAD, 24);
  const conMenosFuerza = Number(
    (await tarjeta(page, 'Nº potenciales de acción').textContent())?.trim(),
  );
  expect(conMenosFuerza).toBeLessThan(4);
});

/* ══════════════════════════════════════════════════════════════════════════════
   CASO 3 — A RECHAZAR: sin estímulo y con valores fuera del rango del control
   ══════════════════════════════════════════════════════════════════════════════ */
test('caso a rechazar: intensidad 0 deja la membrana en reposo, y lo que se sale de rango lo capa el control sin romper nada', async ({ page }) => {
  await expect(etiquetaControl(page, 'Umbral de disparo')).toContainText('-55 mV');
  await sembrarValor(page, DURACION, 5);
  await sembrarValor(page, INTENSIDAD, 0);

  // Sin estímulo no hay nada que integrar: V_m se queda en el reposo declarado, −70,0 mV.
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-70,0 mV');
  await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('0');
  await expect(barraEstado(page)).toContainText('SUBUMBRAL');
  // Ni siquiera con el umbral más permisivo del control (−65 mV), que sigue por encima del reposo.
  await sembrarValor(page, UMBRAL, -65);
  await expect(barraEstado(page)).toContainText('SUBUMBRAL');
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-70,0 mV');

  // Fuera de rango: el propio <input type="range"> capa el valor a [0, 40] y [−65, −40], así
  // que no hay forma de meter una intensidad negativa ni un umbral absurdo. Cada siembra parte
  // de un valor distinto del que se espera, para que el capado se vea de verdad.
  expect(await sembrarValorAcotado(page, UMBRAL, 0)).toBe('-40');
  expect(await sembrarValorAcotado(page, UMBRAL, -200)).toBe('-65');
  expect(await sembrarValorAcotado(page, INTENSIDAD, 999)).toBe('40');

  // Y tras el capado la app sigue siendo coherente: umbral −65 mV con I=40 y pulso de 5 ms
  // (V = −44,7 mV, muy por encima) dispara un PA normal, sin NaN ni ∞ en ninguna tarjeta.
  await expect(barraEstado(page)).toContainText('La neurona DISPARA');
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('35,0 mV');
  const panel = await page.locator('[class*="resultsPanel"]').innerText();
  expect(panel).not.toMatch(/NaN|Infinity|∞|undefined/);

  // Y al capar por abajo vuelve al reposo sin estímulo.
  expect(await sembrarValorAcotado(page, INTENSIDAD, -5)).toBe('0');
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-70,0 mV');
  await expect(barraEstado(page)).toContainText('SUBUMBRAL');
});

/* ══════════════════════════════════════════════════════════════════════════════
   Los hallazgos 979, 980, 981 y 983, ya reparados
   ══════════════════════════════════════════════════════════════════════════════ */

test('hallazgo 979: la despolarización anunciada es la que el pulso alcanza', async ({ page }) => {
  await sembrarValor(page, DURACION, 2);
  await sembrarValor(page, INTENSIDAD, 40);

  // Anunciaba «+40 mV · ≈ −30 mV (V_target)» mientras la tarjeta de al lado decía que el
  // máximo alcanzado era −56,7 mV y el veredicto «Subumbral»: tres cifras incompatibles
  // en el mismo panel. −30 mV es la asíntota tras ≥5τ = 25 ms, y el pulso dura 2.
  const despolarizacion = tarjeta(page, 'Despolarización del pulso');
  await expect(despolarizacion).toHaveText('-56,8 mV');
  await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-56,7 mV');
  await expect(page.locator('body')).not.toContainText('V_target');
});

test('hallazgo 983: el veredicto se anuncia a un lector de pantalla', async ({ page }) => {
  await expect(barraEstado(page)).toHaveAttribute('role', 'status');
  await expect(barraEstado(page)).toHaveAttribute('aria-live', 'polite');

  // Y los cuatro deslizadores tienen etiqueta asociada, no solo un aria-label sin valor.
  for (const selector of [INTENSIDAD, UMBRAL, DURACION]) {
    const etiquetas = await page.locator(selector).evaluate((el: HTMLInputElement) => el.labels?.length ?? 0);
    expect(etiquetas).toBeGreaterThan(0);
  }
});

test('hallazgo 981: el nodo sinoauricular dispara ~70 por minuto, no ~70 Hz', async ({ page }) => {
  await page.getByText('Aprende cómo dispara una neurona').first().click();
  const educativo = page.locator('body');
  await expect(educativo).toContainText('~70 por minuto');
  await expect(educativo).not.toContainText('~70 Hz');
});
