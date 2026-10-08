import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { parseSpanishNumber } from '../../lib/formatters';
import { REFRACTARIO_ABSOLUTO } from '../../app/simulador-potencial-accion/motor';

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
 *
 * REINSPECCIÓN DEL 07/10/2026, por la firma de rotura (73,5 % de visitas cortas y 6,4 % de
 * recargas en 219 visitas, sobre todo móviles desde México). Las seis reparaciones del 20/09
 * siguen en pie (la 980 se vigila ahora en el propio lienzo). Se añaden los casos en móvil
 * —con el DEDO, no con el setter— y la cuenta de POST de analytics por carga, que descarta
 * la firma falsa por remontaje. Los hallazgos nuevos van con `test.fail()` y su motivo.
 *
 * REINSPECCIÓN DEL 08/10/2026, tras la reparación del 2952 (contraste, edd92c04) y el refactor
 * de las relacionadas (99e1ee7e). El 2952 llega a sus casos en los dos temas, pero no al modo
 * sostenido, donde el rótulo «Estímulo» del lienzo cae sobre la última barra naranja. Casos
 * nuevos (umbral −60, los extremos de los controles, el estímulo continuo justo en la asíntota)
 * en el bloque «Inspector 08/10/2026», al final.
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
  // Desde el 08/10/2026 (hallazgos 2953 y 3066) la tarjeta sale del mismo integrador que la
  // simulación: −70 + 40·(1 − 0,98^20) = −56,70, la misma cifra que el máximo alcanzado (la forma
  // cerrada daba −56,81 → «-56,8»).
  const despolarizacion = tarjeta(page, 'Despolarización del pulso');
  await expect(despolarizacion).toHaveText('-56,7 mV');
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

/* ══════════════════════════════════════════════════════════════════════════════
   Reinspección del 07/10/2026
   ══════════════════════════════════════════════════════════════════════════════ */

const UA_MOVIL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

/** Huella de los píxeles del lienzo: cambia si y solo si se ha redibujado otra cosa. */
async function huellaLienzo(page: Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const datos = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let h = 0;
    for (let i = 0; i < datos.length; i += 37) h = (h * 31 + datos[i]) >>> 0;
    return h;
  });
}

/**
 * Punto más alto y más bajo del trazo de V_m (#2E86AB) DIBUJADO en el tramo [desde, hasta] ms,
 * en mV, con la escala que declara el componente (−100..+50 mV, 0..50 ms, márgenes
 * 30/30/50/60). Vale en móvil, donde una columna de píxel abarca 0,3 ms y el «centro» de
 * medirTrazado ya no es fiable en los tramos verticales.
 */
async function extremosDelTrazo(page: Page, desde: number, hasta: number): Promise<{ cima: number; fondo: number }> {
  return page.evaluate(
    ({ desde, hasta }) => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const escala = canvas.width / rect.width;
      const img = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
      const pad = { top: 30, right: 30, bottom: 50, left: 60 };
      const plotW = rect.width - pad.left - pad.right;
      const plotH = rect.height - pad.top - pad.bottom;
      const aVoltios = (y: number) => -100 + ((pad.top + plotH - y) / plotH) * 150;
      const aMilisegundos = (x: number) => ((x - pad.left) / plotW) * 50;
      const esTrazo = (r: number, g: number, b: number) =>
        Math.abs(r - 46) < 40 && Math.abs(g - 134) < 40 && Math.abs(b - 171) < 40;
      let cima = -Infinity;
      let fondo = Infinity;
      for (let xp = 0; xp < canvas.width; xp++) {
        const t = aMilisegundos(xp / escala);
        if (t < desde || t > hasta) continue;
        for (let yp = Math.floor(pad.top * escala); yp <= Math.ceil((pad.top + plotH) * escala); yp++) {
          const i = (yp * canvas.width + xp) * 4;
          if (img.data[i + 3] > 200 && esTrazo(img.data[i], img.data[i + 1], img.data[i + 2])) {
            const v = aVoltios(yp / escala);
            if (v > cima) cima = v;
            if (v < fondo) fondo = v;
          }
        }
      }
      return { cima, fondo };
    },
    { desde, hasta },
  );
}

/** Contraste WCAG de un texto contra el fondo compuesto de sus ancestros. */
async function contrasteDe(page: Page, selector: string): Promise<{ ratio: number; texto: string }> {
  return page.locator(selector).first().evaluate((el) => {
    const leer = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    };
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const capa = leer(getComputedStyle(n).backgroundColor);
      if (capa[3] > 0) capas.push(capa);
      if (capa[3] >= 1) break;
    }
    let fondo = [255, 255, 255];
    for (const c of capas.reverse()) fondo = fondo.map((v, i) => c[3] * c[i] + (1 - c[3]) * v);
    const lineal = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const luminancia = (c: number[]) => 0.2126 * lineal(c[0]) + 0.7152 * lineal(c[1]) + 0.0722 * lineal(c[2]);
    const [a, b] = [luminancia(leer(getComputedStyle(el).color)), luminancia(fondo)].sort((x, y) => y - x);
    return { ratio: (a + 0.05) / (b + 0.05), texto: (el.textContent ?? '').trim() };
  });
}

interface PreguntaLd {
  name: string;
  acceptedAnswer: { text: string };
}

/** Los bloques JSON-LD de la página (los inyecta layout.tsx desde metadata.ts). */
async function leerJsonLd(page: Page): Promise<Record<string, unknown>[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
      (s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>,
    ),
  );
}

const normalizar = (s: string) => s.replace(/["“”«»]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Arrastra el pulgar de un deslizador con el DEDO (eventos táctiles reales por CDP, no el
 * setter): de donde esté hasta pasado el extremo indicado. El pulgar mide 22 px
 * (.slider::-webkit-slider-thumb) y la pista solo 6, que es justo lo que hay que probar.
 */
async function arrastrarConElDedo(page: Page, selector: string, hacia: 'izquierda' | 'derecha'): Promise<void> {
  const deslizador = page.locator(selector);
  await deslizador.scrollIntoViewIfNeeded();
  const caja = await deslizador.boundingBox();
  if (!caja) throw new Error(`${selector} no está en pantalla`);
  const { valor, min, max } = await deslizador.evaluate((el) => {
    const r = el as HTMLInputElement;
    return { valor: Number(r.value), min: Number(r.min), max: Number(r.max) };
  });
  const PULGAR = 22;
  const x0 = caja.x + PULGAR / 2 + ((valor - min) / (max - min)) * (caja.width - PULGAR);
  const x1 = hacia === 'derecha' ? caja.x + caja.width + 30 : caja.x - 30;
  const y = caja.y + caja.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
  for (let k = 1; k <= 12; k++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x0 + ((x1 - x0) * k) / 12, y }],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

test('hallazgo 980 (REPARADO): con umbral −45 mV el PA arranca en el umbral, sin retroceder a −55 mV', async ({ page }) => {
  await sembrarValor(page, UMBRAL, -45);
  await sembrarValor(page, INTENSIDAD, 40);

  // A mano (Euler a 0,1 ms con τ = 5 ms, pulso de 5 ms): V = −70 + 40·(1 − 0,98^k) cruza
  // −45 mV en k = 49 pasos (−44,86 mV; con k = 48 se queda en −45,17) → t = 9,8 ms, latencia
  // 4,80 ms. En t = 9,3 ms va por −46,4 mV y de ahí sube sin parar hasta el pico (10,8 ms).
  await expect(tarjeta(page, 'Latencia')).toHaveText('4,80 ms');

  // Con el −55 cableado, el trazo RETROCEDÍA de −45 a −55 mV justo al disparar: el borde
  // inferior del trazo en 9,3–10,7 ms tocaba −55. Ahora no baja de −47 (−46,4 menos el
  // grosor del trazo). El umbral de −50 deja 3 mV de margen a un lado y 5 al otro.
  const { fondo } = await extremosDelTrazo(page, 9.3, 10.7);
  expect(fondo).toBeGreaterThan(-50);
});

// Hallazgo 2952, REPARADO el 07/10/2026 (edd92c04) y verificado el 08/10/2026: 4,61:1 en
// «DISPARA» y 4,94:1 en «Sí» (claro); 5,19:1 en «SUBUMBRAL» y 7,20:1 en «No» (oscuro).
test('contraste en tema claro: el veredicto «DISPARA» (4,5:1) y el «Sí» (3:1) se leen', async ({ page }) => {
  await sembrarValor(page, INTENSIDAD, 30);
  await expect(barraEstado(page)).toContainText('La neurona DISPARA');
  const si = await contrasteDe(page, '[class*="resultCard"] [class*="resultValue"]');
  expect(si.texto).toBe('Sí');
  // Con sondeo y no con una lectura: globals.css anima color y fondo 0,3 s, y una lectura a
  // media transición da otra cifra (2,32 en vez de 2,51 el 07/10/2026).
  // Veredicto: 15,2 px a peso 600 → texto normal, 4,5:1. «Sí»: 20,8 px negrita → grande, 3:1.
  await expect.poll(async () => (await contrasteDe(page, '[class*="statusBar"]')).ratio).toBeGreaterThanOrEqual(4.5);
  await expect
    .poll(async () => (await contrasteDe(page, '[class*="resultCard"] [class*="resultValue"]')).ratio)
    .toBeGreaterThanOrEqual(3);
});

test('contraste en tema oscuro: el veredicto de fábrica «SUBUMBRAL» y el «No» se leen', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('meskeia-theme', 'dark'));
  await page.reload();
  await esperarHidratacion(page, [INTENSIDAD, UMBRAL, DURACION]);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(barraEstado(page)).toContainText('SUBUMBRAL');
  const no = await contrasteDe(page, '[class*="resultCard"] [class*="resultValue"]');
  expect(no.texto).toBe('No');
  await expect.poll(async () => (await contrasteDe(page, '[class*="statusBar"]')).ratio).toBeGreaterThanOrEqual(4.5);
  await expect
    .poll(async () => (await contrasteDe(page, '[class*="resultCard"] [class*="resultValue"]')).ratio)
    .toBeGreaterThanOrEqual(3);
});

// REPARADO el 08/10/2026 (hallazgo 2953, junto al 3066): la tarjeta sale de `respuestaEstimulo`,
// que usa el mismo integrador que la simulación. Con 2,5 ms pide 15/(1 − 0,98^25) = 37,83 u.a.
test('el veredicto y la tarjeta «Despolarización del pulso» no se contradicen (pulso 2,5 ms, I = 38, umbral −55)', async ({ page }) => {
  await sembrarValor(page, DURACION, 2.5);
  await sembrarValor(page, INTENSIDAD, 38);
  await expect(etiquetaControl(page, 'Duración del pulso')).toContainText('2,5 ms');
  await expect(etiquetaControl(page, 'Intensidad del estímulo')).toContainText('38 u.a.');

  // A mano con el modelo que la app declara (τ = 5 ms): −70 + 38·(1 − e^(−0,5)) = −55,05 mV,
  // a 0,05 mV del umbral sin cruzarlo, y harían falta 15/0,3935 = 38,12 u.a. → NO dispara.
  // Euler: −70 + 38·(1 − 0,98^25) = −54,93 mV → dispara. Sea cual sea la reparación, el panel
  // tiene que decir una sola cosa: dispara si y solo si la intensidad llega a la que pide.
  const pie = await page
    .locator('[class*="resultCard"]')
    .filter({ hasText: 'Despolarización del pulso' })
    .locator('[class*="resultRange"]')
    .innerText();
  const m = pie.match(/([\d.,]+)\s*u\.a\. harían falta/);
  expect(m).not.toBeNull();
  const necesaria = parseSpanishNumber(m![1]);
  const dispara = (await barraEstado(page).innerText()).includes('DISPARA');
  expect(dispara).toBe(38 >= necesaria);
});

test('el refractario absoluto del modelo dura lo que dice la FAQ de la propia app', async ({ page }) => {
  test.fail(
    true,
    'ABIERTO (07/10/2026): REFRACTARIO_ABSOLUTO = 8 ms (la plantilla entera, hiperpolarización incluida) frente al «absoluto (1-2 ms)» de la FAQ',
  );
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const faq = page.locator('[class*="faqItem"]').filter({ hasText: '¿Qué es el periodo refractario?' });
  const texto = await faq.innerText();
  // La FAQ: «absoluto (1-2 ms): canales de Na⁺ inactivados, IMPOSIBLE disparar. relativo
  // (3-5 ms): hiperpolarización, NECESITA estímulo más fuerte». El FAQPage dice «≈1-2 ms».
  const m = texto.match(/absoluto\s*\((\d+)-(\d+)\s*ms\)/);
  expect(m).not.toBeNull();
  const maximoDeclarado = Number(m![2]);

  // Lo observable (lo vigila, en verde, el caso límite del refractario de más arriba): con
  // estímulo continuo al máximo (pulso 5 ms cada 5 ms, I = 40) el 1.er PA sale en 7,3 ms y la
  // plantilla de 8 ms ignora el estímulo entero —también los 5 ms de hiperpolarización, que
  // la FAQ llama relativo—, así que el 2.º llega en 18,5: 11,2 ms entre PAs, 89 Hz, y ninguna
  // intensidad baja de 8 ms (125 Hz), frente a los «~500 Hz» que la FAQ atribuye al
  // refractario. No se comprueba aquí para no tapar la reparación, que cambiará esa cifra.
  // Si la reparación reescribe la FAQ en vez del modelo, hay que adaptar esta lectura.
  expect(REFRACTARIO_ABSOLUTO).toBeLessThanOrEqual(maximoDeclarado);
});

test('el FAQPage y la FAQ visible dan la MISMA respuesta a «¿Qué significa la ley del todo o nada?»', async ({ page }) => {
  test.fail(
    true,
    'ABIERTO (07/10/2026): la pregunta está en las dos bocas con textos distintos; la reparación es UNA constante en metadata.ts que importen las dos',
  );
  const bloques = await leerJsonLd(page);
  const faqPage = bloques.find((b) => b['@type'] === 'FAQPage');
  expect(faqPage).toBeDefined();
  const preguntas = (faqPage!.mainEntity as PreguntaLd[]) ?? [];
  const deLd = preguntas.find((p) => /todo o nada/i.test(p.name));
  expect(deLd).toBeDefined();

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const visible = page
    .locator('[class*="faqItem"]')
    .filter({ has: page.locator('h4', { hasText: 'todo o nada' }) })
    .locator('p')
    .first();
  expect(normalizar(await visible.innerText())).toBe(normalizar(deLd!.acceptedAnswer.text));
});

test('el jsonLd no promete una «animación en tiempo real» que la app no tiene', async ({ page }) => {
  test.fail(
    true,
    'ABIERTO (07/10/2026): featureList dice «Animación V_m(t) en tiempo real con las 5 fases» y el lienzo es un trazado estático',
  );
  // A mano: el trazo se recalcula al mover un control, pero sin tocar nada no se mueve.
  const antes = await huellaLienzo(page);
  await page.waitForTimeout(2000);
  const despues = await huellaLienzo(page);
  const app = (await leerJsonLd(page)).find((b) => b['@type'] === 'WebApplication');
  const rasgos = ((app?.featureList as string[] | undefined) ?? []).join(' · ');
  // Si algún día el lienzo se anima, la promesa pasa a ser cierta y este caso deja de fallar.
  if (despues === antes) expect(rasgos).not.toMatch(/animaci[oó]n/i);
});

test('el bloque educativo no da una cifra redonda sin fuente («los 4 iones cubren 90 %»)', async ({ page }) => {
  test.fail(
    true,
    'ABIERTO (07/10/2026): «Los 4 cubren 90 % de la fisiología neuronal básica», sin fuente (neutralidad editorial, regla 1)',
  );
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const iones = page.locator('[class*="tipCard"]').filter({ hasText: 'Memoriza los iones clave' });
  await expect(iones).toBeVisible();
  await expect(iones).not.toContainText(/90\s*%/);
});

/* ── Móvil: la firma de rotura sale sobre todo de móviles (80 % de visitas cortas en móvil
      tras la reparación, frente al 65 % en escritorio) ── */
test.describe('móvil 390×844, con el dedo', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: UA_MOVIL,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    serviceWorkers: 'block',
  });

  test('caso normal: de fábrica no dispara; arrastrando la intensidad con el dedo hasta el tope dispara y redibuja el lienzo', async ({ page }) => {
    // Fábrica: I = 20 u.a., pulso 5 ms, umbral −55 mV. A mano:
    //   simulación (Euler)   −70 + 20·(1 − 0,98^50) = −57,3 mV → subumbral
    //   tarjeta, con el mismo integrador desde el 08/10/2026 (2953): −57,3 mV y harían falta
    //   15/(1 − 0,98^50) = 23,6 u.a. (la forma cerrada, 15/0,632, daba 23,7 y −57,4)
    await expect(barraEstado(page)).toContainText('SUBUMBRAL');
    await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-57,3 mV');
    await expect(tarjeta(page, 'Despolarización del pulso')).toHaveText('-57,3 mV');
    await expect(page.locator('[class*="resultCard"]').filter({ hasText: 'Despolarización del pulso' })).toContainText('23,6 u.a.');
    // Nada se sale por los lados en 390 px
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    // El lienzo de fábrica dibuja la respuesta pasiva: la cima del trazo, −57,3 mV (+ grosor)
    const fabrica = await extremosDelTrazo(page, 0, 50);
    expect(fabrica.cima).toBeGreaterThan(-60);
    expect(fabrica.cima).toBeLessThan(-54);
    const antes = await huellaLienzo(page);

    await arrastrarConElDedo(page, INTENSIDAD, 'derecha');
    // I = 40 → lo del caso de dato: latencia 5·ln(40/25) = 2,35 ms → 2,30 en la rejilla de
    // 0,1 ms, un PA y pico de +35,0 mV
    await expect(etiquetaControl(page, 'Intensidad del estímulo')).toContainText('40 u.a.');
    await expect(barraEstado(page)).toContainText('La neurona DISPARA');
    await expect(tarjeta(page, 'Latencia')).toHaveText('2,30 ms');
    await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('35,0 mV');
    expect(await huellaLienzo(page)).not.toBe(antes);
    // Y el lienzo pinta el pico: la cima del trazo pasa de −57 a +35 mV (más el marcador)
    const tras = await extremosDelTrazo(page, 0, 50);
    expect(tras.cima).toBeGreaterThan(30);
    await expect(page).toHaveURL(/\/simulador-potencial-accion\/$/);
  });

  test('caso límite: con el dedo, «Estímulo sostenido» saca el intervalo y un tren de 4 PA a 89 Hz', async ({ page }) => {
    await arrastrarConElDedo(page, INTENSIDAD, 'derecha');
    await expect(etiquetaControl(page, 'Intensidad del estímulo')).toContainText('40 u.a.');
    const boton = page.getByRole('button', { name: /Estímulo sostenido/ });
    await boton.scrollIntoViewIfNeeded();
    await boton.tap();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(INTERVALO)).toBeVisible();
    // A mano (pulso 5 ms cada 10 ms, I = 40): 1.er PA en 7,3 ms; la plantilla acaba en 15,4 y
    // el umbral queda elevado, −55 + 15·e^(−s/2); con V = −70 + 40·(1 − 0,98^k) se cruzan en
    // s = 3,1 ms → 2.º PA en 18,5 ms (11,2 ms → 89 Hz). El 3.º en 29,7 ms; el pulso de 35-40
    // no llega (−56,2 frente a −49,8) y el 4.º sale en el de 45-50, en 46,6 ms: 4 PA.
    await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('4');
    await expect(tarjeta(page, 'Frecuencia de disparo')).toHaveText('89 Hz');
  });

  test('caso a rechazar: arrastrando la intensidad más allá del extremo izquierdo se queda en 0 u.a. y en reposo', async ({ page }) => {
    await arrastrarConElDedo(page, INTENSIDAD, 'izquierda');
    await expect(etiquetaControl(page, 'Intensidad del estímulo')).toContainText('(0 u.a.)');
    // Sin estímulo: −70 + 0 = −70,0 mV en las dos tarjetas, sin disparo ni NaN
    await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-70,0 mV');
    await expect(tarjeta(page, 'Despolarización del pulso')).toHaveText('-70,0 mV');
    await expect(barraEstado(page)).toContainText('SUBUMBRAL');
    const panel = await page.locator('[class*="resultsPanel"]').innerText();
    expect(panel).not.toMatch(/NaN|Infinity|∞|undefined/);
  });

  test('una visita usando la app con el dedo registra UN solo POST a /api/analytics/track/', async ({ page, context, baseURL }) => {
    // page.tsx monta un solo <Footer appName=…> y un solo return: nada remonta el árbol. Si
    // algo lo remontara, su AnalyticsTracker volvería a registrar la visita y la firma lo
    // contaría como recarga (caso test-perfil-inversor, 26/09/2026).
    // El rastreador solo emite con host de producción y sin webdriver: se sirve el build local
    // bajo https://meskeia.com y analytics se contesta aquí, sin que salga nada.
    await context.addInitScript(() =>
      Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }),
    );
    const visitas: string[] = [];
    await context.route(/^https?:\/\/(?!meskeia\.com\/|localhost[:/])/, (route) => route.abort());
    await context.route('https://meskeia.com/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/analytics/')) {
        if (url.pathname.startsWith('/api/analytics/track')) visitas.push(route.request().postData() ?? '');
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
        return;
      }
      const respuesta = await route.fetch({ url: `${baseURL}${url.pathname}${url.search}` });
      await route.fulfill({ response: respuesta });
    });

    await page.goto('https://meskeia.com/simulador-potencial-accion/');
    await esperarHidratacion(page, [INTENSIDAD, UMBRAL, DURACION]);
    await expect.poll(() => visitas.length).toBe(1);

    // Uso normal: intensidad al tope, modo sostenido, intervalo, vuelta al único, bloque educativo
    await arrastrarConElDedo(page, INTENSIDAD, 'derecha');
    await expect(barraEstado(page)).toContainText('La neurona DISPARA');
    const sostenido = page.getByRole('button', { name: /Estímulo sostenido/ });
    await sostenido.scrollIntoViewIfNeeded();
    await sostenido.tap();
    await expect(page.locator(INTERVALO)).toBeVisible();
    await arrastrarConElDedo(page, INTERVALO, 'izquierda');
    await page.getByRole('button', { name: /Estímulo único/ }).tap();
    await page.getByRole('button', { name: 'Ver guía educativa' }).tap();
    await page.waitForTimeout(1000);

    expect(visitas).toHaveLength(1);
    expect((JSON.parse(visitas[0]) as { aplicacion: string }).aplicacion).toBe('simulador-potencial-accion');
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
   Inspector 08/10/2026 — umbral −60, extremos de los controles y estímulo continuo
   ══════════════════════════════════════════════════════════════════════════════ */

/** Número de una tarjeta («-56,5 mV», «2,00 ms»…), leído con el parser canónico. */
async function cifra(page: Page, rotulo: string): Promise<number> {
  const texto = (await tarjeta(page, rotulo).innerText()).replace(/\s*(mV|ms|Hz)\s*$/, '');
  return parseSpanishNumber(texto);
}

/** Los «X u.a. harían falta para cruzar el umbral» del pie de la tarjeta, o null si no está. */
async function intensidadQueHaceFalta(page: Page): Promise<number | null> {
  const pie = await page
    .locator('[class*="resultCard"]')
    .filter({ hasText: 'Despolarización del pulso' })
    .locator('[class*="resultRange"]')
    .innerText();
  const m = pie.match(/([\d.,]+)\s*u\.a\. harían falta/);
  return m ? parseSpanishNumber(m[1]) : null;
}

/**
 * Contraste de un rótulo del LIENZO medido por píxel. El lienzo es transparente: cada píxel se
 * compone sobre el fondo del envoltorio antes de comparar. Fondo = el color compuesto más
 * frecuente en la caja del rótulo; texto = el píxel más contrastado con él (a 2× hay trazos del
 * glifo con cobertura total, que dan el fillStyle exacto). La caja sale de las mismas cuentas
 * que page.tsx: márgenes 30/30/50/60, rango −100..+50 mV, «Umbral» a 11 px sobre su línea y
 * «Estímulo» a 10 px alineado a la derecha en y = 26.
 */
async function contrasteRotuloLienzo(page: Page, rotulo: 'Umbral' | 'Estímulo'): Promise<number> {
  return page.evaluate((rotulo) => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const escala = canvas.width / rect.width;
    const ctx = canvas.getContext('2d')!;
    const plotW = rect.width - 90;
    const plotH = rect.height - 80;
    const umbral = Number((document.querySelector('#estimulo-umbral') as HTMLInputElement).value);
    const yToPx = (v: number) => 30 + plotH - ((v + 100) / 150) * plotH;
    ctx.save();
    let caja: { x: number; y: number; w: number; h: number };
    if (rotulo === 'Umbral') {
      ctx.font = '11px system-ui';
      caja = { x: 68, y: yToPx(umbral) - 13, w: ctx.measureText(`Umbral (${umbral} mV)`).width, h: 10 };
    } else {
      // Desde el 08/10/2026 (hallazgo 3067) va en el margen izquierdo, alineado a la derecha en
      // x = 60 − 4 y con la línea base en y = 30 − 8: ahí no cae ninguna barra de estímulo.
      ctx.font = '10px system-ui';
      const w = ctx.measureText('Estímulo').width;
      caja = { x: 60 - 4 - w, y: 13, w, h: 10 };
    }
    ctx.restore();
    const leer = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      const p = m ? m[1].split(/[\s,/]+/).filter(Boolean).map(Number) : [255, 255, 255];
      return [p[0], p[1], p[2]];
    };
    const base = leer(getComputedStyle(canvas.parentElement as HTMLElement).backgroundColor);
    const img = ctx.getImageData(
      Math.floor(caja.x * escala),
      Math.floor(caja.y * escala),
      Math.ceil(caja.w * escala),
      Math.ceil(caja.h * escala),
    ).data;
    const lineal = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: number[]) => 0.2126 * lineal(c[0]) + 0.7152 * lineal(c[1]) + 0.0722 * lineal(c[2]);
    const razon = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    };
    const pixeles: number[][] = [];
    const frecuencia = new Map<string, number>();
    for (let i = 0; i < img.length; i += 4) {
      const a = img[i + 3] / 255;
      const c = [0, 1, 2].map((k) => Math.round(a * img[i + k] + (1 - a) * base[k]));
      pixeles.push(c);
      frecuencia.set(c.join(','), (frecuencia.get(c.join(',')) ?? 0) + 1);
    }
    const fondo = [...frecuencia.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
    return Math.max(...pixeles.map((c) => razon(c, fondo)));
  }, rotulo);
}

test.describe('Inspector 08/10/2026 — umbral −60, extremos de los controles y estímulo continuo', () => {
  // A 2× el texto de 10-11 px del lienzo tiene trazos con cobertura total (es una opción del
  // contexto, no fuerza un worker nuevo).
  test.use({ deviceScaleFactor: 2 });

  test('caso normal: umbral −60 mV, pulso de 3 ms e I = 30 dispara un PA a los 2,00 ms', async ({ page }) => {
    // Las tres siembras parten de la fábrica (umbral −55, 5 ms, 20 u.a.): las tres mueven algo.
    await sembrarValor(page, UMBRAL, -60);
    await sembrarValor(page, DURACION, 3);
    await sembrarValor(page, INTENSIDAD, 30);
    await expect(etiquetaControl(page, 'Umbral de disparo')).toContainText('-60 mV');

    // A mano (τ = 5 ms, paso 0,1 ms): V = −70 + 30·(1 − 0,98^k) supera −60 en k = 21 (−59,63;
    // con k = 20 se queda en −60,03) → t = 7,0 ms, latencia 2,00 ms. Analítica: 5·ln(30/20) =
    // 2,03 ms, que sobre la rejilla de 0,1 ms es 2,00 también con el factor exacto e^(−0,02).
    await expect(barraEstado(page)).toContainText('La neurona DISPARA. 1 potencial de acción registrado.');
    await expect(tarjeta(page, '¿Disparó?')).toHaveText('Sí');
    await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('1');
    await expect(tarjeta(page, 'Latencia')).toHaveText('2,00 ms');
    await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('35,0 mV');
    // Un solo pulso: no hay segundo PA y la tarjeta de frecuencia no sale.
    await expect(page.locator('[class*="resultCard"]').filter({ hasText: 'Frecuencia de disparo' })).toHaveCount(0);

    // Tarjeta del pulso: −70 + 30·(1 − e^(−3/5)) = −56,46 mV y 10/0,4512 = 22,16 u.a. La fórmula
    // discreta que propone el 2953 daría −56,36 y 22,00: ±0,5 cubre las dos y caza el defecto
    // que vigila esta tarjeta (979: anunciar la asíntota, −40 mV, en vez de lo alcanzado).
    expect(await cifra(page, 'Despolarización del pulso')).toBeCloseTo(-56.45, 0);
    const falta = await intensidadQueHaceFalta(page);
    expect(falta).not.toBeNull();
    expect(falta!).toBeCloseTo(22.1, 0);
    expect(falta!).toBeLessThan(30); // coherente con el disparo
  });

  test('caso límite: en las dos esquinas de los controles no hay disparo posible', async ({ page }) => {
    // Esquina 1: pulso mínimo (0,5 ms), umbral más permisivo (−65 mV), intensidad máxima (40).
    await sembrarValor(page, DURACION, 0.5);
    await sembrarValor(page, UMBRAL, -65);
    await sembrarValor(page, INTENSIDAD, 40);
    // A mano: 5 pasos de estímulo → −70 + 40·(1 − 0,98^5) = −66,16 mV (analítica −66,19): a
    // 1,2 mV del umbral más bajo del control. Harían falta 5/(1 − e^(−0,1)) = 52,5 u.a., más
    // que el tope del deslizador (40): con 0,5 ms la neurona no puede disparar nunca.
    await expect(barraEstado(page)).toContainText('SUBUMBRAL');
    await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('0');
    await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-66,2 mV');
    expect(await cifra(page, 'Despolarización del pulso')).toBeCloseTo(-66.2, 0);
    expect((await intensidadQueHaceFalta(page))!).toBeGreaterThan(40);

    // Esquina 2: pulso máximo (5 ms) y umbral más exigente (−40 mV), con la intensidad al tope.
    await sembrarValor(page, DURACION, 5);
    await sembrarValor(page, UMBRAL, -40);
    // A mano: −70 + 40·(1 − 0,98^50) = −44,57 mV (analítica −44,72): no llega a −40. Harían falta
    // 30/(1 − e^(−1)) = 47,5 u.a.: con umbral −40 el modo único no dispara con nada.
    await expect(barraEstado(page)).toContainText('SUBUMBRAL');
    await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('0');
    expect(await cifra(page, 'V_m máximo alcanzado')).toBeCloseTo(-44.65, 0);
    expect(await cifra(page, 'Despolarización del pulso')).toBeCloseTo(-44.65, 0);
    expect((await intensidadQueHaceFalta(page))!).toBeGreaterThan(40);
    const panel = await page.locator('[class*="resultsPanel"]').innerText();
    expect(panel).not.toMatch(/NaN|Infinity|∞|undefined/);
  });

  test('caso a rechazar: estímulo continuo justo en la asíntota (I = 15) no dispara; con 16 sí', async ({ page }) => {
    await page.getByRole('button', { name: /Estímulo sostenido/ }).click();
    // Pulso de 5 ms cada 5 ms = estímulo continuo desde t = 5 ms (sale de 10 ms: mueve algo).
    await sembrarValor(page, INTERVALO, 5);
    await expect(etiquetaControl(page, 'Umbral de disparo')).toContainText('-55 mV');

    // I = 15: la membrana tiende a −70 + 15 = −55 mV, que es el umbral EXACTO, y la condición de
    // disparo es estricta (V > umbral): se acerca sin cruzarlo. En 45 ms llega a
    // −70 + 15·(1 − 0,98^451) = −55,002 → «-55,0 mV» y ningún PA.
    await sembrarValor(page, INTENSIDAD, 15);
    await expect(barraEstado(page)).toContainText('SUBUMBRAL');
    await expect(tarjeta(page, '¿Disparó?')).toHaveText('No');
    await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('0');
    await expect(tarjeta(page, 'V_m máximo alcanzado')).toHaveText('-55,0 mV');

    // I = 16: asíntota −54 mV, por encima. Cruza cuando 16·(1 − 0,98^k) > 15 → k = 138 →
    // latencia 13,70 ms (analítica 5·ln 16 = 13,86; con el factor exacto, 13,80). La plantilla de
    // 8 ms y otros 13,8 de carga ponen el 2.º PA hacia 40,5 ms y ya no cabe un 3.º: 2 PA a
    // ~46 Hz (1000/21,8). La horquilla cubre Euler y el factor exacto.
    await sembrarValor(page, INTENSIDAD, 16);
    await expect(barraEstado(page)).toContainText('La neurona DISPARA');
    await expect(tarjeta(page, 'Nº potenciales de acción')).toHaveText('2');
    const latencia = await cifra(page, 'Latencia');
    expect(latencia).toBeGreaterThanOrEqual(13.6);
    expect(latencia).toBeLessThanOrEqual(13.95);
    const hz = await cifra(page, 'Frecuencia de disparo');
    expect(hz).toBeGreaterThanOrEqual(44);
    expect(hz).toBeLessThanOrEqual(48);
  });

  // REPARADO el 08/10/2026 (hallazgo 3066): la intensidad necesaria se calcula con el tren de
  // pulsos sumado. A mano, la respuesta a 1 u.a. llega como mucho a 0,7330 mV en 50 ms, así que
  // hacen falta 15/0,7330 = 20,46 u.a. y la tarjeta dice «20,5».
  test('en modo sostenido, la tarjeta del pulso no pide más intensidad de la que ya dispara', async ({ page }) => {
    // Sostenido de fábrica (pulso 5 ms cada 10 ms, umbral −55) e I = 21.
    await page.getByRole('button', { name: /Estímulo sostenido/ }).click();
    await expect(etiquetaControl(page, 'Intervalo entre pulsos')).toContainText('10,0 ms');
    await sembrarValor(page, INTENSIDAD, 21);
    // A mano: 1.er pulso → −70 + 21·0,6358 = −56,65 mV; 5 ms sin estímulo → −70 + 13,35·0,3642 =
    // −65,14; el 2.º pulso parte de ahí y cruza −55 a los 4,9 ms (t = 19,8 ms, latencia 14,80).
    // La tarjeta: 15/(1 − e^(−1)) = 23,7 u.a. «harían falta», con 21 disparando.
    await expect(barraEstado(page)).toContainText('La neurona DISPARA');
    await expect(tarjeta(page, 'Latencia')).toHaveText('14,80 ms');
    const falta = await intensidadQueHaceFalta(page);
    expect(falta).toBeCloseTo(20.5, 1);
    expect(21).toBeGreaterThanOrEqual(falta!);
    // Y por debajo de ella no dispara: con 20 u.a. el panel dice subumbral.
    await sembrarValor(page, INTENSIDAD, 20);
    await expect(barraEstado(page)).toContainText('SUBUMBRAL');
  });

  test('2952 (REPARADO): los rótulos del lienzo llegan a 4,5:1 en modo único, en los dos temas', async ({ page }) => {
    // Claro: «Umbral» #A82E68 y «Estímulo» #A3520A sobre #FAFAFA → 6,18:1 y 5,34:1.
    await expect.poll(() => contrasteRotuloLienzo(page, 'Umbral')).toBeGreaterThanOrEqual(4.5);
    await expect.poll(() => contrasteRotuloLienzo(page, 'Estímulo')).toBeGreaterThanOrEqual(4.5);
    // Oscuro: #E58BB5 y #E07A1F sobre #1A1A1A → 7,20:1 y 5,78:1 (antes 2,70:1 el «Umbral»).
    await page.addInitScript(() => localStorage.setItem('meskeia-theme', 'dark'));
    await page.reload();
    await esperarHidratacion(page, [INTENSIDAD, UMBRAL, DURACION]);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => contrasteRotuloLienzo(page, 'Umbral')).toBeGreaterThanOrEqual(4.5);
    await expect.poll(() => contrasteRotuloLienzo(page, 'Estímulo')).toBeGreaterThanOrEqual(4.5);
  });

  // REPARADO el 08/10/2026 (hallazgo 3067): el rótulo pasó al margen izquierdo, donde no cae
  // ninguna barra, y queda sobre el fondo liso contra el que se eligió su color.
  test('en modo sostenido el rótulo «Estímulo» del lienzo sigue legible (4,5:1) sobre la barra naranja', async ({ page }) => {
    await page.getByRole('button', { name: /Estímulo sostenido/ }).click();
    await expect(etiquetaControl(page, 'Intervalo entre pulsos')).toContainText('10,0 ms');
    // A mano, claro: barra #E07A1F al 60 % sobre #FAFAFA = rgb(234,173,119); texto #A3520A →
    // 2,86:1. Oscuro: la barra sobre #1A1A1A = rgb(145,84,29); texto #E07A1F → 2,01:1. Es texto
    // de 10 px: exige 4,5:1. La espera deja pasar la transición de tema de globals.css.
    await expect.poll(() => contrasteRotuloLienzo(page, 'Estímulo')).toBeGreaterThanOrEqual(4.5);
    await page.addInitScript(() => localStorage.setItem('meskeia-theme', 'dark'));
    await page.reload();
    await esperarHidratacion(page, [INTENSIDAD, UMBRAL, DURACION]);
    await page.getByRole('button', { name: /Estímulo sostenido/ }).click();
    await expect.poll(() => contrasteRotuloLienzo(page, 'Estímulo')).toBeGreaterThanOrEqual(4.5);
  });

  // REPARADO el 08/10/2026 (hallazgo 3068): los seis `color: var(--primary)` del módulo pasan a
  // `var(--primary-texto)`.
  test('en tema claro, el azul de marca como texto llega a 4,5:1 (valores de los controles y títulos del bloque educativo)', async ({ page }) => {
    // A mano: #2E86AB sobre #FFFFFF = 4,11:1 y sobre #FAFAFA = 3,94:1. A 16,8 px en negrita no
    // es texto grande (hace falta 18,66 px en negrita): exige 4,5:1. --primary-texto (#26718F)
    // da 5,47:1 y 5,24:1.
    await expect
      .poll(async () => (await contrasteDe(page, 'label[for="estimulo-intensidad"] strong')).ratio)
      .toBeGreaterThanOrEqual(4.5);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const consejo = page.locator('[class*="tipCard"] strong').first();
    await expect(consejo).toBeVisible();
    await expect
      .poll(async () => (await contrasteDe(page, '[class*="tipCard"] strong')).ratio)
      .toBeGreaterThanOrEqual(4.5);
  });

  test('«Apps relacionadas» pinta sus 4 tarjetas en el HTML servido y tras hidratar, sin error de hidratación', async ({ page, request }) => {
    // Refactor 99e1ee7e: page.tsx pinta <RelatedApps /> sin prop y layout.tsx monta
    // <ConRelacionadas slug>. Las 4 de data/app-relations.ts deben viajar ya en el HTML.
    const html = await (await request.get('/simulador-potencial-accion/')).text();
    const servidas = (html.match(/href="\/[a-z0-9-]+\/#from=related-simulador-potencial-accion"/g) ?? []).map((h) =>
      h.slice(6, -1),
    );
    expect(servidas).toHaveLength(4);

    const errores: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
    page.on('pageerror', (e) => errores.push(e.message));
    await page.reload();
    await esperarHidratacion(page, [INTENSIDAD, UMBRAL, DURACION]);
    const enlaces = page.locator('a[href*="#from=related-simulador-potencial-accion"]');
    await expect(enlaces).toHaveCount(4);
    const hidratadas = await enlaces.evaluateAll((anclas) => anclas.map((a) => a.getAttribute('href') ?? ''));
    expect(hidratadas).toEqual(servidas);
    expect(errores.filter((e) => /hydrat|did not match|server rendered/i.test(e))).toEqual([]);
  });
});
