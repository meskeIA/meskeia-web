import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Inspector — simulador-intervalos-confianza (segmento cálculo · estadística) · 19/11/2026
 *
 * Promete (h1, metadata y guía): generar 100 intervalos de confianza para μ a partir de muestras
 * N(μ, σ) y contar cuántos contienen μ (modo conceptual), y calcular el IC de una muestra
 * concreta con z o t de Student (modo calculadora). Todo el cálculo vive en page.tsx, sin motor
 * aparte: IC = X̄ ± crítico · s/√n, z por la inversa de Acklam, t de una tabla para df ≤ 30 y
 * Cornish-Fisher para df > 30.
 *
 * DE DÓNDE SALEN LOS ESPERADOS (calculados antes de mirar la app)
 *   · Cuantiles con jStat 1.9 (`normal.inv`, `studentt.inv`), cotejados con una integración
 *     numérica propia de la densidad t (mismas 5 cifras). El e-Handbook del NIST no está en la
 *     red de fuentes de la tarea. z(0,975) = 1,959964 · t(29; 0,975) = 2,04523 ·
 *     t(1; 0,995) = 63,65674 · t(31; 0,975) = 2,03951 · t(4; 0,975) = 2,77645.
 *   · La tabla t de la app (120 valores) cuadra con jStat a ±0,0005; Cornish-Fisher se aparta
 *     como mucho 4,2·10⁻⁴ (df 31 al 99 %): por eso los toBeCloseTo van a 2 decimales.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (19/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES', reducedMotion: 'reduce' });

const RUTA = '/simulador-intervalos-confianza/';

interface Trazo {
  color: string;
  puntos: [number, number][];
}
interface Dibujo {
  trazos: Trazo[];
  textos: string[];
}
type VentanaDibujo = Window & { __dibujo?: Dibujo };

/** Registra lo que pinta el canvas; cada clearRect (un dibujo nuevo) empieza el registro. */
function ganchoCanvas(): void {
  const P = CanvasRenderingContext2D.prototype;
  const w = window as VentanaDibujo;
  w.__dibujo = { trazos: [], textos: [] };
  let camino: [number, number][] = [];
  const oClear = P.clearRect;
  P.clearRect = function (this: CanvasRenderingContext2D, x: number, y: number, a: number, b: number) {
    w.__dibujo = { trazos: [], textos: [] };
    return oClear.call(this, x, y, a, b);
  };
  const oBegin = P.beginPath;
  P.beginPath = function (this: CanvasRenderingContext2D) {
    camino = [];
    return oBegin.call(this);
  };
  const oMove = P.moveTo;
  P.moveTo = function (this: CanvasRenderingContext2D, x: number, y: number) {
    camino.push([x, y]);
    return oMove.call(this, x, y);
  };
  const oLine = P.lineTo;
  P.lineTo = function (this: CanvasRenderingContext2D, x: number, y: number) {
    camino.push([x, y]);
    return oLine.call(this, x, y);
  };
  const oStroke = P.stroke;
  P.stroke = function (this: CanvasRenderingContext2D, ...args: unknown[]) {
    w.__dibujo?.trazos.push({ color: String(this.strokeStyle).toLowerCase(), puntos: camino.slice() });
    Reflect.apply(oStroke, this, args);
  };
  const oText = P.fillText;
  P.fillText = function (this: CanvasRenderingContext2D, ...args: unknown[]) {
    w.__dibujo?.textos.push(String(args[0]));
    Reflect.apply(oText, this, args);
  };
}

const TEAL = '#48a9a6'; // contiene μ
const ROSA = '#a82e68'; // no contiene μ
const NARANJA = '#e07a1f'; // la línea de μ

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(ganchoCanvas);
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#media-poblacional']);
  // El primer lote lo genera un efecto al montar: con él la app ya responde
  await expect(panelConceptual(page)).toContainText(/Generaciones\s*[1-9]/);
}

const panelConceptual = (page: Page): Locator =>
  page.getByRole('status').filter({ hasText: 'Cobertura empírica' });
const panelCalc = (page: Page): Locator => page.getByRole('status').filter({ hasText: 'para μ' });

/** Texto en una línea; \s también casa el espacio duro (U+00A0). */
async function texto(l: Locator): Promise<string> {
  return (await l.innerText()).replace(/\s+/g, ' ');
}

/** El contador «Generaciones» del panel conceptual. */
async function generacion(page: Page): Promise<number> {
  return Number((await texto(panelConceptual(page))).match(/Generaciones (\d+)/)?.[1]);
}

/** «-45,012» o «−45,012» → −45.012; «12.342,013» → 12342.013. */
const aNumero = (t: string): number =>
  Number(t.replace(/−/g, '-').replace(/\./g, '').replace(',', '.'));

/** «95» → el botón «95 %», lleve el % espacio normal o duro. */
async function elegirNivel(page: Page, nivel: string): Promise<void> {
  const boton = page
    .getByRole('group', { name: 'Nivel de confianza' })
    .getByRole('button', { name: new RegExp(`^${nivel}\\s%$`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function escribir(page: Page, nombre: string, valor: string, muestra: string): Promise<void> {
  const campo = page.getByRole('spinbutton', { name: nombre });
  await campo.fill(valor);
  await campo.press('Tab');
  await expect(campo).toHaveValue(muestra);
}

interface Ic {
  inferior: number;
  superior: number;
  critico: number;
  margen: number;
  anchura: number;
  texto: string;
}

async function leerIc(page: Page): Promise<Ic> {
  const t = await texto(panelCalc(page));
  const ic = t.match(/\[(\S+) ; (\S+)\]/);
  const crit = t.match(/crítico (\S+)/);
  const margen = t.match(/Margen de error ±(\S+)/);
  const anchura = t.match(/Anchura del IC (\S+)/);
  if (!ic || !crit || !margen || !anchura) throw new Error(`Panel sin el formato esperado: ${t}`);
  return {
    inferior: aNumero(ic[1]),
    superior: aNumero(ic[2]),
    critico: aNumero(crit[1]),
    margen: aNumero(margen[1]),
    anchura: aNumero(anchura[1]),
    texto: t,
  };
}

async function calculadora(page: Page, xBar: string, s: string, n: string, nivel: string, usarT: boolean): Promise<Ic> {
  await page.getByRole('button', { name: /Modo calculadora/ }).click();
  await escribir(page, 'Media muestral X̄', xBar, xBar);
  await escribir(page, 'Desviación muestral s', s, s);
  await escribir(page, 'Tamaño muestral n', n, n);
  await elegirNivel(page, nivel);
  const casilla = page.getByLabel(/Usar t de Student/);
  if (usarT) await casilla.check();
  else await casilla.uncheck();
  return leerIc(page);
}

interface Lote {
  ok: number;
  total: number;
  teal: Trazo[];
  rosa: Trazo[];
  muX: number;
  ejeIzq: number;
  ejeDer: number;
  etiqueta: string;
  cobertura: string;
}

/** Lee el panel y el ÚLTIMO dibujo del canvas, esperando a que los dos sean del mismo lote. */
async function leerLote(page: Page): Promise<Lote> {
  const t = await texto(panelConceptual(page));
  const m = t.match(/(\d+) de (\d+) contienen μ/);
  const c = t.match(/Cobertura empírica (\S+ %)/);
  if (!m || !c) throw new Error(`Panel sin el formato esperado: ${t}`);
  const ok = Number(m[1]);
  const total = Number(m[2]);
  await expect
    .poll(async () => (await page.evaluate(() => (window as VentanaDibujo).__dibujo?.textos ?? [])).join(' | '))
    .toContain(`${ok} de ${total} intervalos contienen μ`);
  const dibujo = await page.evaluate(() => (window as VentanaDibujo).__dibujo);
  if (!dibujo) throw new Error('Sin registro del canvas');
  const eje = dibujo.trazos.find((tr) => tr.puntos.length === 2 && tr.puntos[0][1] === tr.puntos[1][1] && ![TEAL, ROSA].includes(tr.color));
  const mu = dibujo.trazos.find((tr) => tr.color === NARANJA);
  if (!eje || !mu) throw new Error('Sin eje o sin línea de μ en el canvas');
  return {
    ok,
    total,
    teal: dibujo.trazos.filter((tr) => tr.color === TEAL),
    rosa: dibujo.trazos.filter((tr) => tr.color === ROSA),
    muX: mu.puntos[0][0],
    ejeIzq: eje.puntos[0][0],
    ejeDer: eje.puntos[1][0],
    etiqueta: dibujo.textos.find((x) => x.includes('intervalos contienen')) ?? '',
    cobertura: c[1],
  };
}

interface NodoJsonLd {
  '@type'?: string;
  description?: string;
  featureList?: string[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function nodosJsonLd(page: Page): Promise<NodoJsonLd[]> {
  const nodos: NodoJsonLd[] = [];
  for (const b of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const d = JSON.parse(b) as NodoJsonLd & { '@graph'?: NodoJsonLd[] };
    nodos.push(...(d['@graph'] ?? [d]));
  }
  return nodos;
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
}

test.describe('Modo calculadora: IC para μ con t y con z', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('caso normal · X̄ 75,5 · s 8 · n 30 · 95 % · t → [72,513 ; 78,487]', async ({ page }) => {
    // EE = 8/√30 = 1,460593 · t(29; 0,975) = 2,04523 → margen 2,98725 → [72,51275 ; 78,48725]
    const ic = await calculadora(page, '75,5', '8', '30', '95', true);
    expect(ic.texto).toContain('t con 29 g.l.');
    expect(ic.texto).toContain('Error estándar 1,4606');
    expect(ic.critico).toBeCloseTo(2.04523, 2);
    expect(ic.inferior).toBeCloseTo(72.51275, 2);
    expect(ic.superior).toBeCloseTo(78.48725, 2);
    expect(ic.margen).toBeCloseTo(2.98725, 2);
    expect(ic.anchura).toBeCloseTo(5.9745, 2);
  });

  test('mismo caso con z (σ conocida) → [72,637 ; 78,363]', async ({ page }) => {
    // z(0,975) = 1,959964 · margen = 1,959964 · 1,460593 = 2,86271 → [72,63729 ; 78,36271]
    const ic = await calculadora(page, '75,5', '8', '30', '95', false);
    expect(ic.critico).toBeCloseTo(1.959964, 2);
    expect(ic.inferior).toBeCloseTo(72.63729, 2);
    expect(ic.superior).toBeCloseTo(78.36271, 2);
    expect(ic.anchura).toBeCloseTo(5.72542, 2);
  });
});

test.describe('Límites: n mínimo, nivel más alto y df fuera de la tabla', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('n = 2 (1 g.l.) al 99 % · X̄ 0 · s 1 → [−45,012 ; 45,012]', async ({ page }) => {
    // EE = 1/√2 = 0,707107 · t(1; 0,995) = 63,65674 → margen 45,01211
    const ic = await calculadora(page, '0', '1', '2', '99', true);
    expect(ic.texto).toContain('t con 1 g.l.');
    expect(ic.critico).toBeCloseTo(63.65674, 2);
    expect(ic.inferior).toBeCloseTo(-45.01211, 2);
    expect(ic.superior).toBeCloseTo(45.01211, 2);
    expect(ic.anchura).toBeCloseTo(90.02423, 2);
  });

  test('n = 32 (31 g.l., Cornish-Fisher) · X̄ 75,5 · s 8 · 95 % → [72,616 ; 78,384]', async ({ page }) => {
    // EE = 8/√32 = 1,414214 · t(31; 0,975) = 2,03951 → margen 2,88431
    const ic = await calculadora(page, '75,5', '8', '32', '95', true);
    expect(ic.texto).toContain('t con 31 g.l.');
    expect(ic.critico).toBeCloseTo(2.03951, 2);
    expect(ic.inferior).toBeCloseTo(72.61569, 2);
    expect(ic.superior).toBeCloseTo(78.38431, 2);
  });

  test('modo conceptual con n = 5 y t → crítico 2,776 con 4 g.l. y EE σ/√n = 4,472', async ({ page }) => {
    // σ = 10 por defecto · 10/√5 = 4,472136 · t(4; 0,975) = 2,77645
    await page.getByRole('group', { name: 'Tamaño muestral' }).getByRole('button', { name: '5', exact: true }).click();
    await page.getByLabel(/Usar t de Student/).check();
    const t = await texto(panelConceptual(page));
    expect(t).toContain('Crítico t* 2,776 t con 4 g.l.');
    expect(t).toContain('Error estándar (σ/√n) 4,472');
  });
});

test.describe('Modo conceptual: lo que cuenta el panel es lo que dibuja el canvas', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('z al 95 % con n 30: 100 segmentos, verdes los que cruzan μ, rosas los que no, y la misma anchura', async ({ page }) => {
    const lote = await leerLote(page);
    expect(lote.total).toBe(100);
    expect(lote.teal.length + lote.rosa.length).toBe(100);
    expect(lote.teal.length).toBe(lote.ok);
    expect(lote.etiqueta).toContain(`${lote.ok} de 100 intervalos contienen μ`);
    expect(lote.cobertura.replace(/\s/g, ' ')).toBe(`${(lote.ok).toFixed(1).replace('.', ',')} %`);
    for (const s of [...lote.teal, ...lote.rosa]) {
      expect(s.puntos).toHaveLength(2);
      expect(s.puntos[0][1]).toBe(s.puntos[1][1]); // horizontal
    }
    for (const s of lote.teal) {
      expect(s.puntos[0][0]).toBeLessThanOrEqual(lote.muX + 0.01);
      expect(s.puntos[1][0]).toBeGreaterThanOrEqual(lote.muX - 0.01);
    }
    for (const s of lote.rosa) {
      const cruza = s.puntos[0][0] <= lote.muX && s.puntos[1][0] >= lote.muX;
      expect(cruza).toBe(false);
    }
    // Con σ conocida todos miden 2·z·σ/√n, y el eje abarca ±5·σ/√n: 2·1,959964/10 = 0,391993 del eje
    const anchoEje = lote.ejeDer - lote.ejeIzq;
    const sinRecortar = [...lote.teal, ...lote.rosa].filter(
      (s) => s.puntos[0][0] > lote.ejeIzq + 0.5 && s.puntos[1][0] < lote.ejeDer - 0.5,
    );
    expect(sinRecortar.length).toBeGreaterThan(90);
    for (const s of sinRecortar) {
      expect(s.puntos[1][0] - s.puntos[0][0]).toBeCloseTo(0.391993 * anchoEje, 0);
    }
  });

  test('cabo C0182 · «Generar 100 nuevos intervalos» genera 100 y suma una generación', async ({ page }) => {
    // El botón lleva el 100 escrito a mano, pero NUM_INTERVALOS_SIMULADOS vale 100: lo que lee el
    // usuario es cierto (esa parte del cabo se descarta)
    const boton = page.getByRole('button', { name: 'Generar 100 nuevos intervalos' });
    await expect(boton).toBeVisible();
    const antes = await generacion(page);
    await boton.click();
    await expect.poll(() => generacion(page)).toBeGreaterThan(antes);
    const lote = await leerLote(page);
    expect(lote.teal.length + lote.rosa.length).toBe(100);
    expect(lote.total).toBe(100);
  });

  test('t con n 5 al 95 %: en 2.000 intervalos la cobertura queda en 95 % ± 2,4 % (5σ)', async ({ page }) => {
    // σ de la proporción = √(0,95·0,05/2000) = 0,487 % → 5σ = 2,44 %. En la inspección: 95,80 %
    await page.getByRole('group', { name: 'Tamaño muestral' }).getByRole('button', { name: '5', exact: true }).click();
    await page.getByLabel(/Usar t de Student/).check();
    await expect(panelConceptual(page)).toContainText('t con 4 g.l.');
    const boton = page.getByRole('button', { name: /Generar .* nuevos intervalos/ });
    // Cada vuelta espera a un lote NUEVO (el efecto de cambiar n o t puede colar otro: da igual,
    // cada lote leído es una tanda independiente de 100, y ninguno se lee dos veces)
    let dentro = 0;
    let total = 0;
    let ultima = await generacion(page);
    for (let i = 0; i < 20; i++) {
      await boton.click();
      await expect.poll(() => generacion(page)).toBeGreaterThan(ultima);
      const t = await texto(panelConceptual(page));
      const m = t.match(/(\d+) de (\d+) contienen μ/);
      ultima = Number(t.match(/Generaciones (\d+)/)?.[1]);
      dentro += Number(m?.[1]);
      total += Number(m?.[2]);
    }
    expect(total).toBe(2000);
    expect(Math.abs(dentro / total - 0.95)).toBeLessThan(0.0244);
  });
});

test.describe('Entradas que deben rechazarse', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Modo calculadora/ }).click();
  });

  test('n = 1 y n = 0: el campo se marca inválido y la app calcula con el mínimo n = 2, a la vista', async ({ page }) => {
    const campo = page.getByRole('spinbutton', { name: 'Tamaño muestral n' });
    await campo.fill('1');
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('label[for="tamano-muestral-calc"]')).toContainText('n = 2');
    await campo.press('Tab');
    await expect(campo).toHaveValue('2');
    await expect(panelCalc(page)).toContainText('t con 1 g.l.');
    await escribir(page, 'Tamaño muestral n', '0', '2');
    await expect(panelCalc(page)).toContainText('t con 1 g.l.');
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · s = 0 (y s = −3, que se acota a 0) da un «IC al 95 %» de anchura cero', async ({ page }) => {
    // ABIERTO: X̄ 75,5 · s 0 · n 30 → la app pinta «[75,500 ; 75,500]», margen ±0,000 y el canvas
    // en blanco (sus textos caen en x = NaN). Una desviación nula o negativa no da intervalo: se
    // pide s > 0
    test.fail();
    await escribir(page, 'Desviación muestral s', '-3', '0');
    await expect(panelCalc(page)).not.toContainText('[75,500 ; 75,500]', { timeout: 2000 });
  });
});

test.describe('Hallazgos de formato (19/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · cabo C0182 · los porcentajes de la pantalla llevan espacio normal, no el duro', async ({ page }) => {
    // ABIERTO: «95 %» del botón de nivel, «97,0 %» de la cobertura, «esperado: 95 %», «IC al 95 %
    // para μ» y los de la guía salen con U+0020 ((nivel * 100).toFixed(0) y un « %» escrito en el
    // JSX). La norma (CLAUDE.md, §2) pide U+00A0 para que el % no salte solo de línea
    test.fail();
    const conEspacioNormal = async (l: Locator): Promise<string[]> =>
      [...((await l.textContent()) ?? '').matchAll(/\d([  ]?)%/g)]
        .filter((m) => m[1] !== ' ')
        .map((m) => m[0]);
    // Selector de modo y área de la herramienta (su hermano siguiente), sin RelatedApps ni el pie
    const selectorModo = page.getByRole('button', { name: /Modo conceptual/ }).locator('xpath=..');
    const herramienta = selectorModo.locator('xpath=following-sibling::div[1]');
    const malos = [
      ...(await conEspacioNormal(page.locator('header').filter({ has: page.locator('h1') }))),
      ...(await conEspacioNormal(selectorModo)),
      ...(await conEspacioNormal(herramienta)),
    ];
    await page.getByRole('button', { name: /Modo calculadora/ }).click();
    malos.push(...(await conEspacioNormal(panelCalc(page))));
    await abrirGuia(page);
    malos.push(
      ...(await conEspacioNormal(
        page.getByRole('heading', { name: /Valores críticos z\* habituales/ }).locator('xpath=ancestor::section[1]/..'),
      )),
    );
    expect(malos).toEqual([]);
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · X̄ = 12345 sale «[12342,013 ; 12347,987]», sin punto de millar', async ({ page }) => {
    // ABIERTO: fmt() es toFixed + replace('.', ','). Con cinco cifras enteras el formato español
    // agrupa: «[12.342,013 ; 12.347,987]» (8/√30 · 2,045 = 2,987)
    test.fail();
    // «12.345» es como el campo lo enseña al salir (toLocaleString es-ES agrupa desde 5 cifras)
    const ic = await calculadora(page, '12.345', '8', '30', '95', true);
    expect(ic.texto).toContain('[12.342,013 ; 12.347,987]');
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · metadata, features y FAQPage pegan el % a la cifra («95%»)', async ({ page }) => {
    // ABIERTO: description «al 95%», featureList «80%, 90%, 95% y 99%» y tres respuestas de la
    // FAQPage («al 95%», «95% al 99%», «n > 30» aparte): lo que leen buscadores y asistentes
    test.fail();
    const nodos = await nodosJsonLd(page);
    const textos = [
      (await page.locator('meta[name="description"]').getAttribute('content')) ?? '',
      ...nodos.flatMap((n) => [n.description ?? '', ...(n.featureList ?? [])]),
      ...nodos.flatMap((n) => (n.mainEntity ?? []).flatMap((q) => [q.name, q.acceptedAnswer.text])),
    ];
    const pegados = textos.flatMap((t) => t.match(/\d%/g) ?? []);
    expect(pegados).toEqual([]);
  });
});

test.describe('Hallazgos de contenido (19/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · la pregunta «z o t» está dos veces con criterios distintos', async ({ page }) => {
    // ABIERTO: la FAQ visible dice «usa z … cuando n es muy grande (n ≥ 30) y σ es estimada con s»;
    // la FAQPage, «t de Student cuando σ es desconocida y se estima con s» y «n > 30». Reparación:
    // UNA constante (PREGUNTAS_FRECUENTES) que pinten la FAQ visible y la FAQPage
    test.fail();
    const faq = (await nodosJsonLd(page)).find((n) => n['@type'] === 'FAQPage');
    const enJson = faq?.mainEntity?.find((q) => /z y cuándo/.test(q.name));
    expect(enJson).toBeDefined();
    await abrirGuia(page);
    const h4 = page.getByRole('heading', { level: 4, name: /cuándo.*z.*cuándo.*t/i });
    await expect(h4).toHaveCount(1);
    const visible = ((await h4.locator('xpath=following-sibling::p[1]').textContent()) ?? '').replace(/\s+/g, ' ').trim();
    expect(visible).toBe((enJson?.acceptedAnswer.text ?? '').replace(/\s+/g, ' ').trim());
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · la descripción del JSON-LD dice «IC verticales» y se dibujan horizontales', async ({ page }) => {
    // ABIERTO: el test del canvas comprueba que cada intervalo es un segmento horizontal
    test.fail();
    const app = (await nodosJsonLd(page)).find((n) => n['@type'] === 'WebApplication');
    expect(app?.description ?? '').not.toContain('verticales');
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · la guía dice que el IC «comunica más y se interpreta peor»', async ({ page }) => {
    // ABIERTO: el consejo de la FAQ «¿IC y test de hipótesis…?» da como razón para preferir el IC
    // que «se interpreta peor»: se contradice a sí mismo
    test.fail();
    await abrirGuia(page);
    await expect(page.getByText('se interpreta peor')).toHaveCount(0, { timeout: 2000 });
  });
});

test.describe('Hallazgos de accesibilidad (19/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO 5283 (19/11/2026, REPARADO) · los emojis de los botones de modo y de las tarjetas de escenario no se leen', async ({ page }) => {
    // REPARADO (20/11/2026): el botón decía «🎯 Modo conceptual …» y «🧮 Modo calculadora …» y las
    // tarjetas «📊 Encuestas…», «💊», «🏭», «📈». Ahora .modeIcon y .scenarioIcon llevan
    // aria-hidden, y check:iconos-tarjeta vigila scenarioIcon (C0851)
    await expect(page.getByRole('button', { name: /^Modo conceptual/ })).toHaveCount(1, { timeout: 2000 });
    await expect(page.getByRole('button', { name: /^Modo calculadora/ })).toHaveCount(1, { timeout: 2000 });
    await abrirGuia(page);
    const escenarios = page.getByRole('heading', { name: /escenarios donde usar IC/ }).locator('..');
    expect(await escenarios.ariaSnapshot()).not.toMatch(/📊|💊|🏭|📈/u);
  });
});
