import { test, expect, devices, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado, esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — comparador-velocidad-almacenamiento (segmento interactiva · riesgo 3)
 *
 * Primera inspección: 16/11/2026. La app promete en su <h1> «Comparador de Velocidad de
 * Almacenamiento» y en el subtítulo «cuánto tarda en transferirse tu archivo en cada tecnología de
 * almacenamiento»; la metadata y el JSON-LD, 10 tecnologías, slider logarítmico de 1 MB a 1 TB,
 * presets y modo lectura/escritura.
 *
 * DÓNDE VIVE EL CÁLCULO (todo en app/comparador-velocidad-almacenamiento/page.tsx, sin motor aparte)
 *   · TECNOLOGIAS: velocidad de lectura y escritura en MB/s de cada tecnología.
 *   · sliderToMB(v) = 10^(v·6/100): el slider 0…100 (paso 0,5) recorre 1 MB … 10^6 MB = 1 TB.
 *     Los presets hacen la ida y vuelta mbToSlider → sliderToMB, que deja 24.999,999999999993 MB
 *     para la película de 25.000 MB (coma flotante).
 *   · segundos = tamaño (MB) / velocidad (MB/s). MB y GB DECIMALES (1 GB = 1000 MB): coherente con
 *     las velocidades en MB/s; no hay MiB ni GiB en ningún sitio.
 *   · formatTiempo: < 1 ms · «N ms» · «N,N s» (< 10 s) · «N s» redondeado · «N min N s» con los
 *     segundos TRUNCADOS (Math.floor) · «N h N min» con los minutos truncados.
 *
 * COHERENCIA DE LAS VELOCIDADES CON SU BUS (cuentas derivadas; USB-IF, SATA-IO y PCI-SIG no están
 * en la red de fuentes permitidas). Todas las «reales» quedan por debajo de su techo:
 *   SATA III 6 Gb/s · 8b/10b = 600 MB/s ≥ 550 · PCIe 3.0 ×4 8 GT/s · 128b/130b = 3.938 ≥ 3.500 ·
 *   PCIe 4.0 ×4 = 7.877 ≥ 7.000 · USB 3.2 Gen 2 10 Gb/s · 128b/132b = 1.212 ≥ 900 ·
 *   USB4 40 Gb/s · 128b/132b = 4.848 ≥ 3.500 · USB 3.2 Gen 1 5 Gb/s · 8b/10b = 500 ≥ 380 ·
 *   USB 2.0 480 Mb/s / 8 = 60 ≥ 35 · SD UHS-I SDR104 208 MHz × 4 bit / 8 = 104 ≥ 95.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/cva-esperados.mjs)
 *   CASO 1 (normal) — arranque: 25 GB (preset «Película 4K») · lectura
 *     25.000/7.000 = 3,571 s → «3,6 s» · /4.200 = 5,952 → «6,0 s» · /3.500 = 7,143 → «7,1 s» (NVMe
 *     Gen 3 y USB4) · /900 = 27,78 → «28 s» · /550 = 45,45 → «45 s» · /380 = 65,79 → 1 min 5,8 s ·
 *     /120 = 208,33 → «3 min 28 s» · /95 = 263,16 → «4 min 23 s» · /35 = 714,29 → «11 min 54 s».
 *     Escritura: /6.500 = 3,846 → «3,8 s» · /3.000 = 8,333 → «8,3 s» · /2.800 = 8,929 → «8,9 s» ·
 *     /800 = 31,25 → «31 s» · /520 = 48,08 → «48 s» · /300 = 83,33 → «1 min 23 s» · /110 = 227,27
 *     → «3 min 47 s» · /50 = 500 EXACTOS → «8 min 20 s» · /25 = 1.000 EXACTOS → «16 min 40 s».
 *   CASO 2 (límite) — el mínimo (1 MB), el máximo (1 TB) y el preset «Backup» (500 GB, el que cita
 *     el FAQPage: HDD «unos 70 minutos», USB 3.0 «unos 22», NVMe Gen 4 «71 segundos», USB 2.0
 *     «casi 4 horas»): 500.000/120 = 4.166,7 s = 69,4 min · /380 = 1.315,8 s = 21,9 min · /7.000 =
 *     71,4 s · /35 = 14.285,7 s = 3 h 58 min. 1 MB: /7.000 = 0,14 ms → «< 1 ms» … /35 = 28,6 ms →
 *     «29 ms». 1 TB: /7.000 = 142,9 s · /35 = 28.571 s = 7 h 56 min.
 *   CASO 3 (rechazo) — no hay campo de texto: el único valor libre es el slider 0…100. Un −20, un
 *     150 o un «abc» escritos en él no pueden dar un tamaño negativo, NaN ni fuera de 1 MB…1 TB: el
 *     control los acota a 0 (1 MB), 100 (1 TB) y, el texto, a su valor por defecto (50 → 1 GB).
 *
 *   Donde truncar y redondear los segundos dan cifras distintas (65,79 s: «1 min 5 s» o «1 min 6 s»)
 *   se admiten las dos: la convención de presentación no es lo que se vigila, la cuenta sí.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (16/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES', reducedMotion: 'reduce' });

const RUTA = '/comparador-velocidad-almacenamiento/';
const SLIDER = 'input[type="range"]';
const GRAFICO = 'section[aria-label="Comparativa de tiempos de transferencia"]';

/** Un esperado literal, o las dos lecturas admitidas (segundos truncados · redondeados). */
type Esperado = string | readonly [string, string];
type Fila = readonly [nombre: string, tiempo: Esperado, velocidad: string];

interface FilaPintada {
  nombre: string;
  tiempo: string;
  velocidad: string;
}

async function filas(page: Page): Promise<FilaPintada[]> {
  return page.locator(`${GRAFICO} [class$="_chartRow"]`).evaluateAll((rows) =>
    rows.map((r) => ({
      nombre: r.querySelector('[class$="_chartNombre"]')?.textContent ?? '',
      tiempo: r.querySelector('[class$="_chartTiempo"]')?.textContent ?? '',
      velocidad: r.querySelector('[class$="_chartVelocidad"]')?.textContent ?? '',
    })),
  );
}

const tamano = (page: Page) => page.locator('[class$="_sliderValor"]');

function comprobarTabla(pintadas: FilaPintada[], esperadas: readonly Fila[]): void {
  expect(pintadas.map((f) => f.nombre)).toEqual(esperadas.map((f) => f[0]));
  esperadas.forEach(([nombre, tiempo, velocidad], i) => {
    const admitidos = typeof tiempo === 'string' ? [tiempo] : [...tiempo];
    expect(admitidos, `${nombre}: pinta «${pintadas[i].tiempo}»`).toContain(pintadas[i].tiempo);
    expect(pintadas[i].velocidad, nombre).toBe(velocidad);
  });
}

function tiempoDe(pintadas: FilaPintada[], nombre: string): string {
  const fila = pintadas.find((f) => f.nombre === nombre);
  if (!fila) throw new Error(`No hay fila «${nombre}»`);
  return fila.tiempo;
}

async function modo(page: Page, nombre: 'Lectura' | 'Escritura'): Promise<void> {
  const boton = page.getByRole('group', { name: 'Modo de operación' }).getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(GRAFICO)).toContainText(`— ${nombre} —`);
}

async function preset(page: Page, nombre: string, esperado: string): Promise<void> {
  const boton = page.getByRole('button', { name: nombre, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  await expect(tamano(page)).toHaveText(esperado);
}

interface NodoJsonLd {
  '@type'?: string;
  featureList?: string[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function nodosJsonLd(page: Page): Promise<NodoJsonLd[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const nodos: NodoJsonLd[] = [];
  for (const b of bloques) {
    const d = JSON.parse(b) as NodoJsonLd & { '@graph'?: NodoJsonLd[] };
    nodos.push(...(d['@graph'] ?? [d]));
  }
  return nodos;
}

async function respuestaFaqPage(page: Page, pregunta: RegExp): Promise<string> {
  for (const n of await nodosJsonLd(page)) {
    if (n['@type'] !== 'FAQPage') continue;
    const q = (n.mainEntity ?? []).find((e) => pregunta.test(e.name));
    if (q) return q.acceptedAnswer.text;
  }
  throw new Error(`El FAQPage no tiene la pregunta ${pregunta}`);
}

const normalizar = (t: string): string => t.replace(/\s+/g, ' ').trim();

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [SLIDER]);
});

test.describe('Tiempo de transferencia = tamaño (MB) / velocidad (MB/s)', () => {
  test('CASO 1 — arranque: 25 GB («Película 4K») en lectura', async ({ page }) => {
    await expect(tamano(page)).toHaveText('25 GB');
    await expect(page.getByRole('button', { name: 'Película 4K', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(GRAFICO)).toContainText('25 GB — Lectura — escala logarítmica');
    comprobarTabla(await filas(page), [
      ['SSD NVMe Gen 4', '3,6 s', '7,0 GB/s'], //          25.000 / 7.000 = 3,571 s
      ['UFS 4.0 (móvil)', '6,0 s', '4,2 GB/s'], //         / 4.200 = 5,952 s
      ['SSD NVMe Gen 3', '7,1 s', '3,5 GB/s'], //          / 3.500 = 7,143 s
      ['USB4 / Thunderbolt 3/4', '7,1 s', '3,5 GB/s'], //  / 3.500 = 7,143 s
      ['USB 3.2 Gen 2', '28 s', '900 MB/s'], //            / 900 = 27,78 s
      ['SSD SATA', '45 s', '550 MB/s'], //                 / 550 = 45,45 s
      ['USB 3.0 / 3.2 Gen 1', ['1 min 5 s', '1 min 6 s'], '380 MB/s'], // / 380 = 65,79 s
      ['HDD Mecánico', '3 min 28 s', '120 MB/s'], //       / 120 = 208,33 s
      ['Tarjeta SD UHS-I', '4 min 23 s', '95 MB/s'], //    / 95 = 263,16 s
      ['USB 2.0', '11 min 54 s', '35 MB/s'], //            / 35 = 714,29 s (FAQPage: «unos 12 minutos»)
    ]);
  });

  test('CASO 1 — 25 GB en escritura (salvo SD y USB 2.0, hallazgo abierto aparte)', async ({ page }) => {
    await modo(page, 'Escritura');
    const pintadas = await filas(page);
    expect(pintadas.map((f) => f.nombre)).toEqual([
      'SSD NVMe Gen 4', 'SSD NVMe Gen 3', 'USB4 / Thunderbolt 3/4', 'UFS 4.0 (móvil)', 'USB 3.2 Gen 2',
      'SSD SATA', 'USB 3.0 / 3.2 Gen 1', 'HDD Mecánico', 'Tarjeta SD UHS-I', 'USB 2.0',
    ]);
    comprobarTabla(pintadas.slice(0, 8), [
      ['SSD NVMe Gen 4', '3,8 s', '6,5 GB/s'], //          25.000 / 6.500 = 3,846 s
      ['SSD NVMe Gen 3', '8,3 s', '3,0 GB/s'], //          / 3.000 = 8,333 s
      ['USB4 / Thunderbolt 3/4', '8,3 s', '3,0 GB/s'], //  / 3.000 = 8,333 s
      ['UFS 4.0 (móvil)', '8,9 s', '2,8 GB/s'], //         / 2.800 = 8,929 s
      ['USB 3.2 Gen 2', '31 s', '800 MB/s'], //            / 800 = 31,25 s
      ['SSD SATA', '48 s', '520 MB/s'], //                 / 520 = 48,08 s
      ['USB 3.0 / 3.2 Gen 1', '1 min 23 s', '300 MB/s'], // / 300 = 83,33 s
      ['HDD Mecánico', '3 min 47 s', '110 MB/s'], //       / 110 = 227,27 s
    ]);
    expect(pintadas[8].velocidad).toBe('50 MB/s');
    expect(pintadas[9].velocidad).toBe('25 MB/s');
  });

  test('CASO 2 — el mínimo del slider (Inicio): 1,0 MB, y la flecha izquierda no baja de ahí', async ({ page }) => {
    const slider = page.locator(SLIDER);
    await slider.focus();
    await page.keyboard.press('Home');
    await expect(tamano(page)).toHaveText('1,0 MB');
    // Mover el slider suelta el preset: ningún «Tipo de archivo» queda pulsado.
    await expect(page.getByRole('button', { name: 'Película 4K', exact: true })).toHaveAttribute('aria-pressed', 'false');
    comprobarTabla(await filas(page), [
      ['SSD NVMe Gen 4', '< 1 ms', '7,0 GB/s'], //          1 / 7.000 = 0,14 ms
      ['UFS 4.0 (móvil)', '< 1 ms', '4,2 GB/s'], //         0,24 ms
      ['SSD NVMe Gen 3', '< 1 ms', '3,5 GB/s'], //          0,29 ms
      ['USB4 / Thunderbolt 3/4', '< 1 ms', '3,5 GB/s'], //  0,29 ms
      ['USB 3.2 Gen 2', '1 ms', '900 MB/s'], //             1,11 ms
      ['SSD SATA', '2 ms', '550 MB/s'], //                  1,82 ms
      ['USB 3.0 / 3.2 Gen 1', '3 ms', '380 MB/s'], //       2,63 ms
      ['HDD Mecánico', '8 ms', '120 MB/s'], //              8,33 ms
      ['Tarjeta SD UHS-I', '11 ms', '95 MB/s'], //          10,53 ms
      ['USB 2.0', '29 ms', '35 MB/s'], //                   28,57 ms
    ]);
    await page.keyboard.press('ArrowLeft');
    await expect(slider).toHaveValue('0');
    await expect(tamano(page)).toHaveText('1,0 MB');
    await expect(page.locator(GRAFICO)).not.toContainText(/NaN|No definido|∞|-\d/);
  });

  test('CASO 2 — el máximo del slider (Fin): 1,0 TB, y la flecha derecha no sube de ahí', async ({ page }) => {
    const slider = page.locator(SLIDER);
    await slider.focus();
    await page.keyboard.press('End');
    await expect(tamano(page)).toHaveText('1,0 TB');
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('100');
    await expect(tamano(page)).toHaveText('1,0 TB');
    comprobarTabla(await filas(page), [
      ['SSD NVMe Gen 4', ['2 min 22 s', '2 min 23 s'], '7,0 GB/s'], //   10^6 / 7.000 = 142,86 s
      ['UFS 4.0 (móvil)', '3 min 58 s', '4,2 GB/s'], //                  238,10 s
      ['SSD NVMe Gen 3', ['4 min 45 s', '4 min 46 s'], '3,5 GB/s'], //   285,71 s
      ['USB4 / Thunderbolt 3/4', ['4 min 45 s', '4 min 46 s'], '3,5 GB/s'],
      ['USB 3.2 Gen 2', '18 min 31 s', '900 MB/s'], //                   1.111,11 s
      ['SSD SATA', '30 min 18 s', '550 MB/s'], //                        1.818,18 s
      ['USB 3.0 / 3.2 Gen 1', ['43 min 51 s', '43 min 52 s'], '380 MB/s'], // 2.631,58 s
      ['HDD Mecánico', ['2 h 18 min', '2 h 19 min'], '120 MB/s'], //     8.333,3 s = 138,9 min
      ['Tarjeta SD UHS-I', '2 h 55 min', '95 MB/s'], //                  10.526,3 s = 175,4 min
      ['USB 2.0', '7 h 56 min', '35 MB/s'], //                           28.571,4 s = 476,2 min
    ]);
  });

  test('CASO 2 — «Backup» (500 GB): las cifras que da el FAQPage salen de la app', async ({ page }) => {
    await preset(page, 'Backup', '500 GB');
    const pintadas = await filas(page);
    // FAQPage: «HDD mecánico (~120 MB/s) tarda unos 70 minutos» — 500.000 / 120 = 4.166,7 s = 69,4 min
    expect(tiempoDe(pintadas, 'HDD Mecánico')).toBe('1 h 9 min');
    // «USB 3.0 (~380 MB/s) unos 22 minutos» — 500.000 / 380 = 1.315,8 s
    expect(['21 min 55 s', '21 min 56 s']).toContain(tiempoDe(pintadas, 'USB 3.0 / 3.2 Gen 1'));
    // «SSD NVMe Gen 4 (~7.000 MB/s) unos 71 segundos» — 71,43 s
    expect(tiempoDe(pintadas, 'SSD NVMe Gen 4')).toBe('1 min 11 s');
    // «USB 2.0 (~35 MB/s) casi 4 horas» — 14.285,7 s = 238,1 min
    expect(tiempoDe(pintadas, 'USB 2.0')).toBe('3 h 58 min');
    const faq = await respuestaFaqPage(page, /copia de seguridad de 500 GB/);
    for (const cita of ['unos 70 minutos', 'unos 22 minutos', 'unos 71 segundos', 'casi 4 horas']) expect(faq).toContain(cita);
  });

  test('los presets ponen el tamaño que anuncian (MB y GB decimales) y se marcan con aria-pressed', async ({ page }) => {
    await preset(page, 'Foto', '5,0 MB');
    await preset(page, 'Canción', '10 MB');
    await preset(page, 'Vídeo HD', '500 MB');
    await preset(page, 'Juego AAA', '80 GB'); // 80.000 MB / 7.000 = 11,43 s
    expect(tiempoDe(await filas(page), 'SSD NVMe Gen 4')).toBe('11 s');
    await preset(page, 'Película 4K', '25 GB');
    await expect(page.getByRole('button', { name: 'Juego AAA', exact: true })).toHaveAttribute('aria-pressed', 'false');
  });

  test('la escala del slider: 1 MB · 1 GB · 1 TB en 0, 50 y 100 (×31,6 por cada cuarto)', async ({ page }) => {
    // sliderToMB(v) = 10^(6v/100): 25 → 10^1,5 = 31,6 MB · 50 → 10^3 MB · 75 → 10^4,5 = 31.623 MB
    await sembrarValor(page, SLIDER, '25');
    await expect(tamano(page)).toHaveText('32 MB');
    await sembrarValor(page, SLIDER, '50');
    await expect(tamano(page)).toHaveText('1,0 GB');
    await sembrarValor(page, SLIDER, '75');
    await expect(tamano(page)).toHaveText('32 GB');
    await expect(page.locator('[class$="_sliderLimits"]')).toHaveText(/1 MB\s*1 GB\s*1 TB/);
  });
});

test.describe('CASO 3 — valores que el control debe rechazar', () => {
  for (const [entrada, aceptado, rotulo] of [
    ['-20', '0', '1,0 MB'],
    ['150', '100', '1,0 TB'],
    ['abc', '50', '1,0 GB'],
  ] as const) {
    test(`slider «${entrada}»: se acota a ${aceptado} (${rotulo}), sin NaN ni negativos`, async ({ page }) => {
      expect(await sembrarValorAcotado(page, SLIDER, entrada)).toBe(aceptado);
      await expect(tamano(page)).toHaveText(rotulo);
      await expect(page.locator(GRAFICO)).not.toContainText(/NaN|No definido|∞|-\d/);
      expect(await filas(page)).toHaveLength(10);
    });
  }
});

test.describe('Hallazgos de cálculo (16/11/2026)', () => {
  test('HALLAZGO (16/11/2026, ABIERTO) · 500 s y 1.000 s exactos se pintan un segundo cortos', async ({ page }) => {
    // ABIERTO: el preset deja 24.999,999999999993 MB (ida y vuelta mbToSlider → sliderToMB) y
    // formatTiempo trunca los segundos con Math.floor: 499,9999 s → «8 min 19 s».
    // 25.000 / 50 = 500 s = 8 min 20 s · 25.000 / 25 = 1.000 s = 16 min 40 s ·
    // «Backup»: 500.000 / 800 = 625 s = 10 min 25 s (pinta «10 min 24 s»).
    test.fail();
    await modo(page, 'Escritura');
    const p25 = await filas(page);
    expect(tiempoDe(p25, 'Tarjeta SD UHS-I')).toBe('8 min 20 s');
    expect(tiempoDe(p25, 'USB 2.0')).toBe('16 min 40 s');
    await preset(page, 'Backup', '500 GB');
    expect(tiempoDe(await filas(page), 'USB 3.2 Gen 2')).toBe('10 min 25 s');
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · «60 s» en vez de «1 min» (por debajo de 60 s redondea; por encima, trunca)', async ({ page }) => {
    // ABIERTO: slider 78 → 10^4,68 = 47.863 MB («48 GB»); en escritura USB 3.2 Gen 2:
    // 47.863 / 800 = 59,83 s → formatNumber(59,83, 0) = «60 s». A partir de 60 s la app escribe
    // «1 min»: «60 s» no debería salir nunca.
    test.fail();
    await sembrarValor(page, SLIDER, '78');
    await expect(tamano(page)).toHaveText('48 GB');
    await modo(page, 'Escritura');
    expect((await filas(page)).map((f) => f.tiempo)).not.toContain('60 s');
  });
});

test.describe('Hallazgos de operativa (16/11/2026)', () => {
  test('HALLAZGO (16/11/2026, ABIERTO) · tras un preset, → y ← no vuelven al tamaño de partida', async ({ page }) => {
    // ABIERTO: el preset fija el slider en mbToSlider(25.000) = 73,299, fuera del paso 0,5; el
    // navegador dibuja el pulgar en 73,5 (10^4,41 = 25.704 MB, «26 GB»). → lleva a 74 («28 GB»)
    // y ← a 73,5: «26 GB», no los 25 GB de partida.
    test.fail();
    await page.locator(SLIDER).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tamano(page)).toHaveText('28 GB');
    await page.keyboard.press('ArrowLeft');
    await expect(tamano(page)).toHaveText('25 GB', { timeout: 1000 });
  });
});

test.describe('Móvil (Pixel 7)', () => {
  const pixel = devices['Pixel 7'];
  test.use({
    viewport: pixel.viewport,
    userAgent: pixel.userAgent,
    deviceScaleFactor: pixel.deviceScaleFactor,
    isMobile: pixel.isMobile,
    hasTouch: pixel.hasTouch,
  });

  test('con el dedo: el preset y el slider responden, sin desborde horizontal, y el tiempo se ve entero', async ({ page }) => {
    const boton = page.getByRole('button', { name: 'Backup', exact: true });
    await boton.tap();
    await expect(tamano(page)).toHaveText('500 GB');
    const caja = await page.locator(SLIDER).boundingBox();
    if (!caja) throw new Error('El slider no tiene caja');
    await page.touchscreen.tap(caja.x + 3, caja.y + caja.height / 2);
    await expect(tamano(page)).toHaveText('1,0 MB');
    const anchos = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(anchos.sw).toBeLessThanOrEqual(anchos.cw);
    const recortados = await page.locator(`${GRAFICO} [class$="_chartTiempo"]`).evaluateAll((els) =>
      els.filter((e) => e.scrollWidth > e.clientWidth).map((e) => e.textContent),
    );
    expect(recortados).toEqual([]);
  });

  test('HALLAZGO 4889 (REPARADO) · ningún nombre de tecnología se recorta en móvil', async ({ page }) => {
    // REPARADO: con 412 px la columna del nombre medía 130 px (`grid-template-columns: 130px 1fr
    // 90px`) y .chartNombre lleva `text-overflow: ellipsis`: 96 de 101 px. «SSD NVMe Gen 4» y
    // «SSD NVMe Gen 3» se leían igual («SSD NVMe Ge…»); también USB4, USB 3.0 y la tarjeta SD.
    // Ahora, por debajo de 560 px, el nombre va en su propia línea a todo el ancho.
    const nombres = page.locator(`${GRAFICO} [class$="_chartNombre"]`);
    await expect(nombres).toHaveCount(10);
    const recortados = await nombres.evaluateAll((els) =>
      els.filter((e) => e.scrollWidth > e.clientWidth).map((e) => e.textContent),
    );
    expect(recortados).toEqual([]);
  });
});

test.describe('Hallazgos de accesibilidad (16/11/2026)', () => {
  for (const tema of ['light', 'dark'] as const) {
    test(`HALLAZGO 4890 (REPARADO) · la categoría de cada fila llega a 4,5:1 (tema ${tema})`, async ({ page }) => {
      // REPARADO: CATEGORIAS[].color iba por style={{ color }}, texto de 11,2 px seminegrita. Medido:
      // claro «Almacenamiento interno» #2E86AB 4,11:1 y «USB / Externo» #16A34A 3,30:1; oscuro
      // (#2A2A2A) 3,50 · 4,36 · «Móvil (interno)» #B91C1C 2,22 · «Tarjeta SD/Flash» #92400E 2,02.
      // Ahora cada categoría toma su token -texto (--primary-, --verde-, --rojo-, --ambar-texto).
      await esperarPaginaAsentada(page);
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      await esperarPaginaAsentada(page);
      const etiquetas = page.locator(`${GRAFICO} [class$="_chartCategoria"]`);
      const bajos: string[] = [];
      for (let i = 0; i < (await etiquetas.count()); i++) {
        const r = await contrasteSobreFondoReal(etiquetas.nth(i));
        if (r < 4.5) bajos.push(`${await etiquetas.nth(i).textContent()}: ${r.toFixed(2)}:1`);
      }
      expect([...new Set(bajos)]).toEqual([]);
    });
  }

  test('HALLAZGO (16/11/2026, ABIERTO) · el slider anuncia el tamaño, no la posición «73.5»', async ({ page }) => {
    // ABIERTO: sin aria-valuetext el lector lee el valor crudo de la escala logarítmica («73.5»,
    // con punto); el tamaño va en un aria-label que cambia con cada paso.
    test.fail();
    await expect(page.locator(SLIDER)).toHaveAttribute('aria-valuetext', /25 GB/, { timeout: 1000 });
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · las barras role="meter" no salen de su rango', async ({ page }) => {
    // ABIERTO: aria-valuenow lleva los segundos (714,29 en USB 2.0) sin aria-valuemin ni
    // aria-valuemax, que por defecto valen 0 y 100: el valor queda fuera del rango declarado.
    test.fail();
    const fuera = await page.getByRole('meter').evaluateAll((els) =>
      els
        .filter((e) => Number(e.getAttribute('aria-valuenow')) > Number(e.getAttribute('aria-valuemax') ?? 100))
        .map((e) => e.getAttribute('aria-label')),
    );
    expect(fuera).toEqual([]);
  });
});

test.describe('Hallazgos de contenido (16/11/2026)', () => {
  test('HALLAZGO 4893 (REPARADO) · la nota del gráfico ya no promete «hasta un 30%» y da techos que cuadran con la app', async ({ page }) => {
    // REPARADO: la FAQ visible daba USB 3.0 «5 Gb/s = 625 MB/s teórico» frente a ~380 reales (+64 %) y
    // USB4 «~5.000 MB/s teórico» frente a 3.500 (+43 %); USB 2.0, 480 Mb/s / 8 = 60 MB/s frente a
    // 35 (+71 %). Aun con la codificación de línea (USB4 128b/132b: 4.848 MB/s) queda en +39 %.
    // Ahora la nota no da tope y pone dos ejemplos: USB 2.0, 480 / 8 = 60 MB/s; USB 3.0, 5 Gb/s ×
    // 8/10 (8b/10b) / 8 = 500 MB/s de datos, el mismo descuento que la app ya hacía en SATA III.
    const nota = (await page.locator(GRAFICO).getByText(/Velocidades reales medias/).textContent()) ?? '';
    expect(nota).not.toMatch(/hasta un \d+\s*%/);
    expect(nota).toMatch(/60 MB\/s en USB 2\.0 frente a ~35/);
    expect(nota).toMatch(/500 MB\/s de datos en USB 3\.0 frente a ~380/);
    // La FAQ visible y la de errores ya no presentan 625 MB/s como techo teórico a secas.
    await expect(page.getByText(/5 Gb\/s = 625 MB\/s/)).toHaveCount(0);
    const faq = await respuestaFaqPage(page, /USB 3\.0 es mucho más lento/);
    expect(faq).toContain('500 MB/s');
    expect(faq).not.toMatch(/\(625 MB\/s\)/);
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · la guía dice que cada cuarto del slider multiplica por ~1.000 (es ×31,6)', async ({ page }) => {
    // ABIERTO: 10^(6·25/100) = 31,6. ×1.000 es media escala (1 MB → 1 GB, las marcas del propio
    // slider en 0 y 50).
    test.fail();
    await expect(page.getByText(/cada cuarto del slider multiplica el tamaño por ~1\.000/)).toHaveCount(0, { timeout: 1000 });
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · «¿Qué es UFS…?» tiene una respuesta en la FAQ visible y otra en el FAQPage', async ({ page }) => {
    // ABIERTO: la visible habla de «bus MIPI M-PHY» y «modo Full Duplex»; la del FAQPage, de
    // «HS-G4, 2 lanes» y eMMC. La reparación es UNA constante que importen las dos.
    test.fail();
    const visible = await page
      .locator('[class$="_faqItem"]')
      .filter({ hasText: '¿Qué es UFS y por qué los móviles de gama alta son tan rápidos?' })
      .locator('p')
      .first()
      .textContent();
    const faq = await respuestaFaqPage(page, /¿Qué es UFS/);
    expect(normalizar(faq)).toBe(normalizar(visible ?? ''));
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · el FAQPage dice «más de 3 veces» entre HDD externo y NVMe interno (la app da 58)', async ({ page }) => {
    // ABIERTO: con las cifras de la app, 500 GB: HDD 1 h 9 min frente a NVMe Gen 4 1 min 11 s
    // (7.000 / 120 = 58 veces). El ×3 es HDD frente a USB 3.0 (380 / 120 = 3,2).
    test.fail();
    const faq = await respuestaFaqPage(page, /copia de seguridad de 500 GB/);
    expect(faq).not.toMatch(/más de 3 veces/);
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · la FAQ visible da el NVMe Gen 4 «casi tan rápido» como USB4 (la app le da el doble)', async ({ page }) => {
    // ABIERTO: 7.000 frente a 3.500 MB/s; con 25 GB, «3,6 s» frente a «7,1 s». Se busca con
    // locator y no con getByRole: la guía nace plegada y getByRole no ve lo oculto.
    test.fail();
    await expect(page.locator('h4').filter({ hasText: /NVMe Gen 4 es casi tan rápido como USB4/ })).toHaveCount(0, { timeout: 1000 });
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · formato: el «%» va pegado a la cifra', async ({ page }) => {
    // ABIERTO: «30%», «50-70%», «~20%», «10-30%» (dos veces) en la página; «(~20%)» en el FAQPage y
    // «100%» en las características del JSON-LD. Ortografía de la RAE (2010): «30 %», con espacio duro.
    test.fail();
    const textos = [
      (await page.locator(GRAFICO).getByText(/Velocidades reales medias/).textContent()) ?? '',
      ...(await page.locator('[class$="_guideSection"]').allTextContents()),
    ];
    for (const n of await nodosJsonLd(page)) {
      textos.push(...(n.featureList ?? []), ...(n.mainEntity ?? []).map((e) => e.acceptedAnswer.text));
    }
    expect(textos.join(' ').match(/.{0,20}\d%.{0,10}/g) ?? []).toEqual([]);
  });

  test('HALLAZGO (16/11/2026, ABIERTO) · la barra de USB4 usa el violeta prohibido #7C3AED', async ({ page }) => {
    // ABIERTO: TECNOLOGIAS[usb4].color = '#7C3AED' (rgb 124, 58, 237), prohibido por la identidad
    // de meskeIA. check:colores-prohibidos solo mira las líneas que añade un commit.
    test.fail();
    const fondo = await page
      .getByRole('meter', { name: /^USB4/ })
      .evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(fondo).not.toBe('rgb(124, 58, 237)');
  });
});

test.describe('Hallazgos de contenido (17/11/2026, cabo C0788)', () => {
  test('HALLAZGO (17/11/2026, ABIERTO) · la generación del bus de UFS 4.0 («HS-G4») no tiene fuente', async ({ page }) => {
    // ABIERTO (cabo C0788): la tabla de la guía da a UFS 4.0 la interfaz «MIPI M-PHY HS-G4» y el
    // FAQPage «(HS-G4, 2 lanes)», junto a 4.200 MB/s de lectura. Ni el repositorio ni la red de
    // fuentes oficiales (sin JEDEC ni MIPI) dan la tasa por carril de cada generación M-PHY ni la que
    // fija la norma UFS 4.0, y la app no da la de HS-G4 en ningún sitio: no se puede comprobar que dos
    // carriles HS-G4 lleguen a esos 4.200 MB/s (criterio C0203). Pasa a verde cuando la celda y el
    // FAQPage retiren la generación («bus MIPI M-PHY», como ya dice la FAQ visible) o la maticen; el
    // bus y la velocidad se quedan.
    test.fail();
    const tabla = page.locator('table').filter({ has: page.locator('th', { hasText: /^Interfaz$/ }) });
    const columna = (await tabla.locator('thead th').allTextContents()).map(normalizar).indexOf('Interfaz');
    expect(columna).toBeGreaterThan(0);
    const fila = tabla.locator('tbody tr').filter({ hasText: 'UFS 4.0 (móvil)' });
    await expect(fila).toHaveCount(1);
    await expect(fila.locator('td').nth(1)).toHaveText('~4.200 MB/s');
    const interfaz = normalizar((await fila.locator('td').nth(columna).textContent()) ?? '');
    expect(interfaz).toContain('M-PHY');
    const faq = await respuestaFaqPage(page, /¿Qué es UFS/);
    expect(faq).toContain('4.200 MB/s');
    expect(interfaz, 'celda «Interfaz» de UFS 4.0 en la tabla de la guía').not.toMatch(/HS-G\d/);
    expect(faq, 'respuesta del FAQPage a «¿Qué es UFS…?»').not.toMatch(/HS-G\d/);
  });
});
