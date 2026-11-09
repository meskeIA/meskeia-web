import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, leerValorEnReact } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * simulador-colisiones — Inspector, primera inspección (09/11/2026).
 *
 * Choque frontal en 1D de A (izquierda) contra B (derecha) con coeficiente de restitución e:
 *   v'A = [(mA − e·mB)·vA + mB·(1 + e)·vB] / (mA + mB)
 *   v'B = [mA·(1 + e)·vA + (mB − e·mA)·vB] / (mA + mB)
 * que con e = 1 da el choque elástico y con e = 0 el perfectamente inelástico
 * v' = (mA·vA + mB·vB) / (mA + mB). Comprobación independiente de la energía perdida:
 * ΔEk = −(1 − e²)·μ·(vA − vB)²/2, con μ = mA·mB/(mA + mB). Todos los esperados están
 * resueltos a mano con esas fórmulas ANTES de ejecutar la app.
 *
 * Lo que da bien (verde): v'A, v'B, el momento antes y después, Ek antes y después, ΔEk y su
 * porcentaje en un choque parcial (e = 0,5), en el tramo extremo de los deslizadores (20 kg a
 * +10 m/s contra 1 kg a −10 m/s, e = 0) y en un elástico con rebote; el aviso cuando A no
 * alcanza a B (vA ≤ vB); en móvil se maneja con el dedo y no desborda.
 *
 * HALLAZGOS — todos REPARADOS el 09/11/2026 (H1 = 4389, H2 = 4390, H3 = 4391, H4 = 4392, H5 = 4393,
 * H6 = 4394, H7 = 4395, H8 = 4396, H9 = 4397, H10 = 4398, H11 = 4399). Lo que decían:
 *   H1 (alto)   · La animación mueve A en sentido CONTRARIO a v'A (pos = impacto − signo·rapidez):
 *                 con e = 0 los dos cuerpos que «se pegan» salen despedidos en sentidos opuestos, y
 *                 un A que rebota (v'A = −4,33) avanza y se mete en B.
 *   H2 (medio)  · Con vA ≤ vB avisa de que no habrá choque, pero el botón sigue activo y pinta un
 *                 choque con «Resultados de la Colisión» inventados (v'B = −2,00, ΔEk = −24,50 J).
 *   H3 (bajo)   · La aproximación no se anima: los bloques esperan 600 ms y saltan al punto de
 *                 impacto (la transición solo existe en la fase «pre», y el salto ocurre en «impact»).
 *   H4 (medio)  · Contraste de los colores puestos en línea: «Objeto B (naranja)» 2,97:1, «Objeto
 *                 A (azul)» 4,11:1 (3,35:1 en oscuro), v'B 2,85:1 a 24 px, ΔEk 2,85:1 / 2,75:1, y el
 *                 aviso «no colisionarán» 3,62:1 en oscuro.
 *   H5 (bajo)   · Móvil 390 px: los rótulos del SVG (velocidades y masas) quedan a 7-8 px de caja.
 *   H6 (bajo)   · Formato: «4.5 kg», «+2.5 m/s», «/ 6.5» con punto decimal; «(-45,4%)» sin espacio.
 *   H7 (bajo)   · Fórmula sustituida: «[4−0,50·2)·5 + 2·1,50·-2]» (paréntesis desparejado, negativo
 *                 sin paréntesis).
 *   H8 (medio)  · La guía llama «prácticamente elásticas» a las colisiones del LHC y en la frase
 *                 siguiente dice que su energía cinética crea partículas: por su propia tabla, inelásticas.
 *   H9 (bajo)   · «una mola comprimida» (catalanismo): en la tabla de la misma página, «muelle».
 *   H10 (bajo)  · El FAQPage sitúa el tema en «Física de 2.º de Bachillerato (dinámica y cantidad de
 *                 movimiento)»; el RD 243/2022 (anexo II) lo pone en Física y Química de 1.º, bloque
 *                 «E. Estática y dinámica». Física de 2.º: campos, ondas y física moderna.
 *   H11 (bajo)  · El FAQPage dice que e «varía entre 0 y 1»; la página enseña la superelástica (e > 1).
 */

const RUTA = '/simulador-colisiones/';
const DESLIZADORES = ['#masa-a', '#masa-b', '#velocidad-a', '#velocidad-b', '#coeficiente-restitucion'];

interface Entrada {
  m1: number;
  m2: number;
  v1: number;
  v2: number;
  e: number;
}

interface Fotograma {
  t: number;
  xa: number;
  xb: number;
  wa: number;
  wb: number;
}

interface PreguntaFaq {
  pregunta: string;
  respuesta: string;
}

const normalizar = (s: string): string => s.replace(/\s+/g, ' ').trim();

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, DESLIZADORES);
}

/** Mueve solo los deslizadores que cambian (sembrar el valor que ya tiene no prueba nada). */
async function fijar(page: Page, { m1, m2, v1, v2, e }: Entrada): Promise<void> {
  const pares: [string, number][] = [
    ['#masa-a', m1],
    ['#masa-b', m2],
    ['#velocidad-a', v1],
    ['#velocidad-b', v2],
    ['#coeficiente-restitucion', e],
  ];
  for (const [selector, valor] of pares) {
    if ((await leerValorEnReact(page, selector)) !== String(valor)) await sembrarValor(page, selector, valor);
  }
}

function resultados(page: Page): Locator {
  return page.getByRole('status').filter({ hasText: 'Resultados de la Colisión' });
}

function aviso(page: Page): Locator {
  return page.getByRole('alert').filter({ hasText: 'no colisionarán' });
}

/** El SVG de la pista: el que define los marcadores de las flechas. */
function pista(page: Page): Locator {
  return page.locator('svg').filter({ has: page.locator('marker#arrow-b1-r') });
}

async function simular(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: /Simular colisión|Volver a simular/ }).click();
  const r = resultados(page);
  await expect(r).toBeVisible({ timeout: 6000 });
  return r;
}

async function velocidadFinal(r: Locator, letra: 'A' | 'B'): Promise<string> {
  const valor = r
    .getByText(new RegExp(`^Velocidad final ${letra}$`, 'i'))
    .locator('xpath=following-sibling::p[1]');
  return normalizar(await valor.innerText());
}

async function texto(r: Locator): Promise<string> {
  return normalizar(await r.innerText());
}

/**
 * Pulsa «Simular» y graba, fotograma a fotograma, dónde se PINTAN los bloques (en % del ancho
 * del SVG). Mide lo renderizado y no el atributo x: la transición CSS mueve el bloque sin tocar
 * el atributo, y un salto sin transición también se ve aquí.
 */
async function grabarSimulacion(page: Page): Promise<Fotograma[]> {
  await page.evaluate(() => {
    const w = window as unknown as { __fotogramas: unknown[]; __grabando: boolean };
    const svg = document.getElementById('arrow-b1-r')?.closest('svg');
    if (!svg) throw new Error('No encuentro el SVG de la pista (marker #arrow-b1-r)');
    const rects = Array.from(svg.querySelectorAll('rect'));
    const ra = rects[0];
    const rb = rects[1];
    if (!ra || !rb) throw new Error('La pista no tiene los dos bloques');
    w.__fotogramas = [];
    w.__grabando = true;
    const t0 = performance.now();
    const paso = (): void => {
      if (!w.__grabando) return;
      const s = svg.getBoundingClientRect();
      const a = ra.getBoundingClientRect();
      const b = rb.getBoundingClientRect();
      w.__fotogramas.push({
        t: performance.now() - t0,
        xa: ((a.left - s.left) / s.width) * 100,
        xb: ((b.left - s.left) / s.width) * 100,
        wa: (a.width / s.width) * 100,
        wb: (b.width / s.width) * 100,
      });
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
  await page.getByRole('button', { name: /Simular colisión|Volver a simular/ }).click();
  await expect(resultados(page)).toBeVisible({ timeout: 6000 });
  await page.waitForTimeout(200);
  return page.evaluate(() => {
    const w = window as unknown as { __fotogramas: Fotograma[]; __grabando: boolean };
    w.__grabando = false;
    return w.__fotogramas;
  });
}

/**
 * El choque es el fotograma con menos hueco entre el borde derecho de A y el izquierdo de B (el
 * primero, si hay empate). dA y dB: cuánto se mueve cada bloque desde ahí hasta el final.
 * `intermedias`: posiciones distintas de A a medio camino entre la salida y el choque.
 */
function analizar(f: Fotograma[]): { dA: number; dB: number; intermedias: number } {
  expect(f.length, 'se grabaron fotogramas').toBeGreaterThan(20);
  const hueco = (x: Fotograma): number => x.xb - (x.xa + x.wa);
  let iChoque = 0;
  f.forEach((x, i) => {
    if (hueco(x) < hueco(f[iChoque]) - 1e-6) iChoque = i;
  });
  const inicio = f[0];
  const choque = f[iChoque];
  const fin = f[f.length - 1];
  const intermedias = new Set(
    f
      .slice(0, iChoque)
      .filter((x) => x.xa > inicio.xa + 0.5 && x.xa < choque.xa - 0.5)
      .map((x) => x.xa.toFixed(1)),
  ).size;
  return { dA: fin.xa - choque.xa, dB: fin.xb - choque.xb, intermedias };
}

async function leerJsonLd(page: Page): Promise<{ faq: PreguntaFaq[]; bloquesFaq: number; features: string[] }> {
  return page.evaluate(() => {
    const faq: { pregunta: string; respuesta: string }[] = [];
    let bloquesFaq = 0;
    let features: string[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of nodos) {
        if (n['@type'] === 'FAQPage') {
          bloquesFaq++;
          for (const q of n.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
            faq.push({ pregunta: q.name, respuesta: q.acceptedAnswer.text });
          }
        }
        if (n['@type'] === 'WebApplication' && Array.isArray(n.featureList)) {
          features = n.featureList as string[];
        }
      }
    }
    return { faq, bloquesFaq, features };
  });
}

test.describe('simulador-colisiones · escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · 4 kg a +5 m/s contra 2 kg a −2 m/s con e = 0,5', async ({ page }) => {
    // A mano: v'A = [(4 − 0,5·2)·5 + 2·1,5·(−2)] / 6 = (15 − 6)/6 = 1,5 m/s
    //         v'B = [4·1,5·5 + (2 − 0,5·4)·(−2)] / 6 = 30/6 = 5 m/s   (e = (5 − 1,5)/(5 + 2) = 0,5 ✓)
    //         p = 4·5 + 2·(−2) = 16 = 4·1,5 + 2·5
    //         Ek = ½·4·25 + ½·2·4 = 54 J → ½·4·2,25 + ½·2·25 = 29,5 J; ΔEk = −24,5 J = −45,37 %
    //         (−(1 − 0,25)·(8/6)·49/2 = −24,5 ✓)
    await fijar(page, { m1: 4, m2: 2, v1: 5, v2: -2, e: 0.5 });
    await expect(page.getByText('Colisión inelástica parcial', { exact: true })).toBeVisible();
    const r = await simular(page);
    expect(await velocidadFinal(r, 'A')).toBe('1,50 m/s');
    expect(await velocidadFinal(r, 'B')).toBe('5,00 m/s');
    const t = await texto(r);
    expect(t).toContain('Antes: 16,00 kg·m/s');
    expect(t).toContain('Después: 16,00 kg·m/s');
    expect(t).toContain('Conservado');
    expect(t).toContain('Antes: 54,00 J');
    expect(t).toContain('Después: 29,50 J');
    expect(t).toContain('ΔEk = -24,50 J');
    expect(t).toMatch(/\(-45,4\s?%\)/);
  });

  test('CASO 2 (límite) · tramo extremo: 20 kg a +10 m/s contra 1 kg a −10 m/s, e = 0', async ({ page }) => {
    // A mano: v' = (20·10 + 1·(−10)) / 21 = 190/21 = 9,0476 m/s para los dos (se quedan unidos)
    //         p = 190 antes y 21·190/21 = 190 después
    //         Ek = ½·20·100 + ½·1·100 = 1050 J → ½·21·(190/21)² = 18050/21 = 859,52 J
    //         ΔEk = −190,476 J = −18,14 %   (−(20/21)·400/2 = −190,48 ✓)
    //         1050 sin punto de millar: con cuatro cifras no se agrupa (RAE 2010, CLAUDE.md §2)
    await fijar(page, { m1: 20, m2: 1, v1: 10, v2: -10, e: 0 });
    await expect(page.getByText('Colisión perfectamente inelástica', { exact: true })).toBeVisible();
    const r = await simular(page);
    expect(await velocidadFinal(r, 'A')).toBe('9,05 m/s');
    expect(await velocidadFinal(r, 'B')).toBe('9,05 m/s');
    const t = await texto(r);
    expect(t).toContain('Antes: 190,00 kg·m/s');
    expect(t).toContain('Después: 190,00 kg·m/s');
    expect(t).toContain('Antes: 1050,00 J');
    expect(t).toContain('Después: 859,52 J');
    expect(t).toContain('ΔEk = -190,48 J');
    expect(t).toMatch(/\(-18,1\s?%\)/);
  });

  test('CASO elástico con rebote · 2 kg a +5 m/s contra 4 kg a −2 m/s, e = 1', async ({ page }) => {
    // A mano: v'A = [(2 − 4)·5 + 4·2·(−2)] / 6 = −26/6 = −4,333 m/s
    //         v'B = [2·2·5 + (4 − 2)·(−2)] / 6 = 16/6 = 2,667 m/s
    //         p = 10 − 8 = 2 = 2·(−4,333) + 4·2,667;  Ek = 25 + 8 = 33 J antes y después
    await fijar(page, { m1: 2, m2: 4, v1: 5, v2: -2, e: 1 });
    await expect(page.getByText('Colisión perfectamente elástica', { exact: true })).toBeVisible();
    const r = await simular(page);
    expect(await velocidadFinal(r, 'A')).toBe('-4,33 m/s');
    expect(await velocidadFinal(r, 'B')).toBe('2,67 m/s');
    const t = await texto(r);
    expect(t).toContain('Antes: 2,00 kg·m/s');
    expect(t).toContain('Después: 2,00 kg·m/s');
    expect(t).toContain('Antes: 33,00 J');
    expect(t).toContain('Después: 33,00 J');
    expect(t).toMatch(/ΔEk = (0,00|≈0) J/);
  });

  test('CASO 3 (a rechazar) · con vA ≤ vB avisa de que A no alcanza a B; con vA > vB no avisa', async ({ page }) => {
    // A va detrás (izquierda): solo hay choque si vA − vB > 0 (FAQ visible de la propia app)
    await expect(aviso(page)).toHaveCount(0); // estado inicial: +5 contra −2
    await fijar(page, { m1: 4, m2: 2, v1: -2, v2: 5, e: 0.5 });
    await expect(aviso(page)).toBeVisible();
    await fijar(page, { m1: 4, m2: 2, v1: 3, v2: 3, e: 0.5 }); // velocidad relativa 0
    await expect(aviso(page)).toBeVisible();
  });

  test('HALLAZGO (09/11/2026, REPARADO) H2 · si A no alcanza a B (vA = −2, vB = +5) no se pinta un choque inventado', async ({
    page,
  }) => {
    // Esperado: no hay choque, así que o no hay resultado o las velocidades no cambian
    // (v'A = −2, v'B = +5, ΔEk = 0). Hoy aplica la fórmula a un choque que no ocurre:
    // v'A = [(4 − 1)·(−2) + 2·1,5·5]/6 = 1,5 · v'B = [4·1,5·(−2) + 0·5]/6 = −2 · ΔEk = 8,5 − 33 = −24,5 J
    await fijar(page, { m1: 4, m2: 2, v1: -2, v2: 5, e: 0.5 });
    await expect(aviso(page)).toBeVisible();
    const boton = page.getByRole('button', { name: /Simular colisión/ });
    if (await boton.isEnabled()) {
      await boton.click();
      await page.waitForTimeout(3000);
    }
    if ((await resultados(page).count()) > 0) {
      expect(await velocidadFinal(resultados(page), 'A')).toBe('-2,00 m/s');
      expect(await velocidadFinal(resultados(page), 'B')).toBe('5,00 m/s');
    }
    await expect(page.getByText(/ΔEk = -24,50 J/)).toHaveCount(0);
  });

  test('ANIMACIÓN · B sale en el sentido de v\'B (testigo de la grabación)', async ({ page }) => {
    // Caso 1: v'B = +5 → B avanza a la derecha desde el choque. Caso 2: v'B = +9,05 → ídem.
    await fijar(page, { m1: 4, m2: 2, v1: 5, v2: -2, e: 0.5 });
    const caso1 = analizar(await grabarSimulacion(page));
    expect(caso1.dB).toBeGreaterThan(0.5);
    await fijar(page, { m1: 20, m2: 1, v1: 10, v2: -10, e: 0 });
    const caso2 = analizar(await grabarSimulacion(page));
    expect(caso2.dB).toBeGreaterThan(0.5);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H1 · A sale en el sentido de v\'A y, con e = 0, A y B se mueven juntos', async ({
    page,
  }) => {
    // Caso 1: v'A = +1,5 → A debe avanzar (hoy retrocede de 43 % a 38,5 %).
    await fijar(page, { m1: 4, m2: 2, v1: 5, v2: -2, e: 0.5 });
    const caso1 = analizar(await grabarSimulacion(page));
    expect.soft(caso1.dA, "v'A = +1,5: A avanza").toBeGreaterThan(0.5);
    // Caso 2: v'A = v'B = +9,05 → mismo desplazamiento (hoy A a 15,9 % y B a 84,1 %).
    await fijar(page, { m1: 20, m2: 1, v1: 10, v2: -10, e: 0 });
    const caso2 = analizar(await grabarSimulacion(page));
    expect.soft(caso2.dA, "v' = +9,05: A avanza").toBeGreaterThan(0.5);
    expect.soft(Math.abs(caso2.dA - caso2.dB), 'e = 0: se mueven juntos').toBeLessThan(1);
    // Rebote: v'A = −4,33 → A retrocede (hoy avanza hasta el 56 % y se mete en B, que está en el 65 %).
    await fijar(page, { m1: 2, m2: 4, v1: 5, v2: -2, e: 1 });
    const rebote = analizar(await grabarSimulacion(page));
    expect.soft(rebote.dA, "v'A = −4,33: A retrocede").toBeLessThan(-0.5);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H3 · la aproximación se anima: A pasa por posiciones intermedias antes del choque', async ({
    page,
  }) => {
    // El JSON-LD promete «fases pre-colisión, impacto y post-colisión». Hoy A está quieto en el
    // 18 % durante 600 ms y aparece de golpe en el 43 %: 0 posiciones intermedias.
    await fijar(page, { m1: 4, m2: 2, v1: 5, v2: -2, e: 0.5 });
    const { intermedias } = analizar(await grabarSimulacion(page));
    expect(intermedias).toBeGreaterThanOrEqual(3);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H4 · en claro, los textos con el color de cada objeto llegan a su umbral', async ({
    page,
  }) => {
    await prepararParaMedir(page); // sin transiciones: se mide el color final, no el del fundido
    await activarTema(page, 'light');
    // 16 px en negrita no es texto grande: 4,5:1 (hoy 4,11 y 2,97)
    const tituloA = page.getByRole('heading', { name: 'Objeto A (azul)' });
    const tituloB = page.getByRole('heading', { name: 'Objeto B (naranja)' });
    expect.soft(await contrasteSobreFondoReal(tituloA), 'Objeto A (azul)').toBeGreaterThanOrEqual(4.5);
    expect.soft(await contrasteSobreFondoReal(tituloB), 'Objeto B (naranja)').toBeGreaterThanOrEqual(4.5);
    await fijar(page, { m1: 4, m2: 2, v1: 5, v2: -2, e: 0.5 });
    const r = await simular(page);
    // v'B a 24 px en negrita: texto grande, 3:1 (hoy 2,85). ΔEk a 13,6 px: 4,5:1 (hoy 2,85)
    const valorB = r.getByText(/^Velocidad final B$/i).locator('xpath=following-sibling::p[1]');
    expect.soft(await contrasteSobreFondoReal(valorB), "v'B").toBeGreaterThanOrEqual(3);
    expect.soft(await contrasteSobreFondoReal(r.getByText(/^ΔEk =/)), 'ΔEk con pérdida').toBeGreaterThanOrEqual(4.5);
    // Sin pérdida (e = 1) el ΔEk sale en verde #27AE60: hoy 2,75:1
    await fijar(page, { m1: 4, m2: 2, v1: 5, v2: -2, e: 1 });
    const r2 = await simular(page);
    expect.soft(await contrasteSobreFondoReal(r2.getByText(/^ΔEk =/)), 'ΔEk sin pérdida').toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H4 · en oscuro, «Objeto A (azul)» y el aviso «no colisionarán» llegan a 4,5:1', async ({
    page,
  }) => {
    await prepararParaMedir(page); // sin el fundido del cambio de tema (sin él se mide 1,79:1 a medio camino)
    await activarTema(page, 'dark');
    // Hoy 3,35:1 (#2E86AB sobre #2d2d2d) y 3,62:1 (reserva #c0621a de --naranja-texto sobre su tinte)
    const tituloA = page.getByRole('heading', { name: 'Objeto A (azul)' });
    expect.soft(await contrasteSobreFondoReal(tituloA), 'Objeto A (azul)').toBeGreaterThanOrEqual(4.5);
    await fijar(page, { m1: 4, m2: 2, v1: -2, v2: -2, e: 1 });
    await expect(aviso(page)).toBeVisible();
    expect.soft(await contrasteSobreFondoReal(aviso(page)), 'aviso «no colisionarán»').toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H6 · coma decimal y % separado: «4,5 kg», «+2,5 m/s», «(-45,4 %)»', async ({
    page,
  }) => {
    await fijar(page, { m1: 4.5, m2: 2, v1: 2.5, v2: -2, e: 1 });
    await expect.soft(page.locator('label[for="masa-a"]')).toHaveText('Masa: 4,5 kg');
    await expect.soft(page.locator('label[for="velocidad-a"]')).toHaveText('Velocidad: +2,5 m/s');
    await expect.soft(pista(page).getByText('4,5 kg')).toHaveCount(1);
    await fijar(page, { m1: 4, m2: 2, v1: 5, v2: -2, e: 0.5 });
    const r = await simular(page);
    // CLAUDE.md §2: el % va separado por un espacio duro (U+00A0)
    const espacioDuro = String.fromCharCode(0x00a0);
    expect.soft(await r.innerText()).toContain(`(-45,4${espacioDuro}%)`);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H7 · la fórmula sustituida cierra sus paréntesis y pone los negativos entre paréntesis', async ({
    page,
  }) => {
    // Esperado (caso 1): «= [(4−0,50·2)·5 + 2·1,50·(−2)] / 6». Hoy: «= [4−0,50·2)·5 + 2·1,50·-2] / 6».
    await fijar(page, { m1: 4, m2: 2, v1: 5, v2: -2, e: 0.5 });
    const r = await simular(page);
    const lineas = (
      await r.locator('p').filter({ hasText: /= \[/ }).filter({ hasNotText: /m[AB]/ }).allInnerTexts()
    ).map(normalizar);
    expect(lineas).toHaveLength(2);
    for (const l of lineas) {
      expect(l.split('(').length, l).toBe(l.split(')').length);
      expect(l.split('[').length, l).toBe(l.split(']').length);
      expect(l, 'un negativo tras un operador va entre paréntesis').not.toMatch(/[·+−-]\s?-\d/);
    }
  });

  test('JSON-LD · un solo FAQPage con al menos cinco preguntas y de 4 a 8 características', async ({ page }) => {
    const { bloquesFaq, faq, features } = await leerJsonLd(page);
    expect(bloquesFaq).toBe(1);
    expect(faq.length).toBeGreaterThanOrEqual(5);
    expect(features.length).toBeGreaterThanOrEqual(4);
    expect(features.length).toBeLessThanOrEqual(8);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H8 · la guía no llama «elásticas» a las colisiones del LHC', async ({ page }) => {
    // La tabla de la propia guía: elástica = energía cinética conservada. La tarjeta del LHC dice
    // «prácticamente elásticas en términos de bariones» y a renglón seguido que «la energía
    // cinética crea nuevas partículas»: por esa definición, es una colisión inelástica.
    const guia = normalizar((await page.locator('main').textContent()) ?? '');
    expect(guia).toContain('LHC');
    expect(guia).not.toContain('prácticamente elásticas');
  });

  test('HALLAZGO (09/11/2026, REPARADO) H9 · «muelle» (o «resorte»), no «mola»', async ({ page }) => {
    const guia = normalizar((await page.locator('main').textContent()) ?? '');
    expect(guia).toContain('muelle comprimido'); // la tabla ya lo dice así
    expect(guia).not.toMatch(/\bmola\b/);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H10 · el FAQPage no sitúa el momento lineal en Física de 2.º de Bachillerato', async ({
    page,
  }) => {
    // RD 243/2022, anexo II (boe.es, BOE-A-2022-5521): Física de 2.º = «A. Campo gravitatorio.
    // B. Campo electromagnético. C. Vibraciones y ondas. D. Física relativista, cuántica, nuclear
    // y de partículas.»; Física y Química de 1.º, bloque «E. Estática y dinámica»: «Interpretación
    // de las leyes de la dinámica en términos de magnitudes como el momento lineal y el impulso
    // mecánico».
    const { faq } = await leerJsonLd(page);
    for (const q of faq) expect(q.respuesta, q.pregunta).not.toMatch(/2\.º de Bachillerato/);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H11 · el FAQPage no limita e a [0, 1] cuando la página enseña e > 1', async ({
    page,
  }) => {
    const { faq } = await leerJsonLd(page);
    const coef = faq.find((q) => /coeficiente de restitución/i.test(q.pregunta));
    if (!coef) throw new Error('El FAQPage no tiene la pregunta del coeficiente de restitución');
    // La tabla («Superelástica, e > 1») y la FAQ visible («Sí, en las llamadas colisiones superelásticas»)
    expect(coef.respuesta).toMatch(/superelástic|mayor que 1|e\s*>\s*1/i);
  });
});

test.describe('simulador-colisiones · móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('se maneja con el dedo: el deslizador responde al toque, el botón se pulsa y el resultado no desborda', async ({
    page,
  }) => {
    const deslizador = page.locator('#masa-a');
    await deslizador.scrollIntoViewIfNeeded();
    const caja = await deslizador.boundingBox();
    if (!caja) throw new Error('El deslizador de masa A no tiene caja');
    await page.touchscreen.tap(caja.x + caja.width - 2, caja.y + caja.height / 2);
    await expect(page.locator('label[for="masa-a"]')).not.toHaveText('Masa: 4 kg');
    expect(Number(await deslizador.inputValue())).toBeGreaterThanOrEqual(19);

    const boton = page.getByRole('button', { name: /Simular colisión/ });
    await boton.scrollIntoViewIfNeeded();
    const cajaBoton = await boton.boundingBox();
    expect(cajaBoton?.height ?? 0).toBeGreaterThanOrEqual(44);
    await boton.tap();
    await expect(resultados(page)).toBeVisible({ timeout: 6000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('HALLAZGO (09/11/2026, REPARADO) H5 · los rótulos del SVG se leen (≥ 9 px de alto)', async ({ page }) => {
    // viewBox de 500 unidades en 324 px: fontSize 8-9 → 5,2-5,8 px; cajas de 7-8 px hoy.
    const alturas = await pista(page)
      .locator('text')
      .evaluateAll((ts) =>
        ts.filter((t) => /m\/s|kg/.test(t.textContent ?? '')).map((t) => t.getBoundingClientRect().height),
      );
    expect(alturas.length).toBeGreaterThan(0);
    expect(Math.min(...alturas)).toBeGreaterThanOrEqual(9);
  });
});
