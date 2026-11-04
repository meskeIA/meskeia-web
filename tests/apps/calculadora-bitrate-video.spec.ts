import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — calculadora-bitrate-video (segmento motor · riesgo 3)
 *
 * Primera inspección: 04/11/2026. La app promete en su <h1> «Calculadora de Bitrate y Tamaño de
 * Vídeo» y en el subtítulo «Estima el bitrate y el espacio en disco para cualquier resolución y
 * códec». La metadata y el JSON-LD añaden la comparativa entre H.264, H.265, ProRes 422 y RAW.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/videografia.ts → calcularBitrateVideo(resolución, fps, minutos, códec)
 *     · bitrate = BASE_H264[resolución] × (fps / 30) × FACTOR[códec], redondeado a 0,1 Mbps
 *         BASE_H264 (Mbps a 30 fps): 480p 3 · 720p 7 · 1080p 12 · 2K 25 · 4K 45 · 8K 100
 *         FACTOR: H.264 1 · H.265 0,55 · ProRes 422 10 · RAW 40   (ninguno cita fuente)
 *     · tamaño_MB = bitrate × segundos / 8      ← MB decimales (10^6 B), correcto
 *     · tamaño_GB = tamaño_MB / 1024            ← mezcla: 1 «GB» = 1,024·10^9 B (ni GB ni GiB)
 *     · se presenta con toFixed(2) / interpolación del número: «3.30 GB», «24.8 Mbps»
 *   El mismo motor lo usan la API de ChatGPT (app/api/chatgpt/bitrate-video/route.ts) y la tool
 *   MCP calcular_bitrate_video (app/api/mcp/route.ts): lo que se diga del motor vale para ellas.
 *   app/calculadora-bitrate-video/page.tsx: duración = parseFloat(…) y, si es ≤ 0 o no es número,
 *   1 minuto, sin aviso.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 1080p · 25 fps · H.265 · 45 min
 *       bitrate = 12 × 25/30 × 0,55 = 5,5 Mbps
 *       tamaño  = 5,5 × 2700 s / 8 = 1856,25 MB = 1,86 GB (10^9 B) · 1,73 GiB (2^30 B)
 *       comparativa: H.264 10 Mbps → 3375 MB = 3,38 GB · ProRes 100 Mbps → 33,75 GB ·
 *       RAW 400 Mbps → 135 GB
 *
 *   CASO 2 (límite: el tramo más alto) — 8K · 120 fps · RAW · 600 min (el max del campo)
 *       bitrate = 100 × 4 × 40 = 16.000 Mbps
 *       tamaño  = 16.000 × 36.000 s / 8 = 72.000.000 MB = 72.000 GB = 72 TB
 *       Escala con los píxeles: 7680×4320 son EXACTAMENTE 4 veces 3840×2160. En un códec
 *       intra-frame (ProRes: cada fotograma independiente, lo dice el propio FAQPage) y en RAW
 *       («datos crudos del sensor», guía de la página) los datos de cada fotograma son
 *       proporcionales al número de fotositos: 8K debe dar ≈ 4 × 4K. Con la cifra de 4K de la
 *       app (RAW 30 fps 1800 Mbps), 8K RAW ≈ 7200 Mbps; ProRes ≈ 4 × 450 = 1800 Mbps.
 *       Lo mismo de 2K (2048×1080, la etiqueta del botón) frente a 1080p (1920×1080): +6,7 %
 *       de píxeles → H.264 ≈ 12 × 1,067 = 12,8 Mbps, no el doble.
 *
 *   CASO 3 (rechazo) — duración 0, «-5» o vacía
 *       No hay vídeo de 0 minutos ni de −5: la app debe avisar y no presentar un tamaño. Lo que
 *       NO debe hacer es calcular otra duración (1 min) sin decirlo.
 *
 *   Control cruzado con el FAQPage («4K a 25 fps durante 1 hora: 13 GB en H.264, 7 GB en H.265,
 *   270 GB en ProRes 422 y hasta 1.100 GB en RAW»), con el motor de la app:
 *       H.264 45 × 25/30 = 37,5 Mbps → 37,5 × 3600 / 8 = 16.875 MB ≈ 16,9 GB
 *       H.265 20,6 Mbps → 9270 MB ≈ 9,3 GB · ProRes 375 Mbps → 168,75 GB · RAW 1500 → 675 GB
 *
 * REPARACIÓN del 04/11/2026 (/reparar, hallazgos 4048-4056): el motor escala ProRes y RAW con
 * los píxeles desde su referencia en 4K a 30 fps (ProRes 450 · RAW 1.800 Mbps), 2K vale 12,8 Mbps
 * en H.264, los tamaños van en unidades SI (1 GB = 1000 MB, y TB por encima de 1000 GB) y todo
 * sale en formato español. Con eso cambian las cifras de los CASOS 1 y 2 en ProRes y RAW:
 *   CASO 1 — 1080p · 25 fps: ProRes 450 × ¼ × 25/30 = 93,75 → 93,8 Mbps · RAW 1800 × ¼ × 25/30 = 375
 *   CASO 2 — 8K · 120 fps: ProRes 450 × 4 × 4 = 7200 · RAW 1800 × 4 × 4 = 28.800 Mbps
 *            → 28.800 × 36.000 s / 8 = 129.600.000 MB = 129,6 TB
 *   (lo de arriba es la cuenta del Inspector con el modelo viejo, que se conserva como crónica).
 *
 * HALLAZGOS del 04/11/2026 — REPARADOS:
 *   A. «GB» = MB decimales ÷ 1024: CASO 1 da «1.81 GB» por 1,86 GB (−2,4 %).
 *   B. Formato no español en resultados, tabla, descripción y encabezado: «3.30 GB»,
 *      «24.8 Mbps», «16000 Mbps», «70312.50 GB», «1.5 min».
 *   C. ProRes/RAW no escalan con los píxeles: 8K = 2,22 × 4K (debería ser ×4).
 *   D. 2K (2048×1080) da 2,08 × 1080p con un 6,7 % más de píxeles.
 *   E. Duración 0, negativa o vacía → resultado de 1 min sin aviso.
 *   F. El FAQPage da otras cifras que el motor (4K 25 fps 1 h y la jornada de 8 h).
 *   G. Guía: «(45 × 600 ÷ 8) = 3,375 MB» se lee en español como 3 MB.
 *   H. Texto blanco sobre el color de cada códec: H.264 4,11:1, H.265 2,80:1, ProRes 2,26:1.
 *   I. El aria-label del campo tapa su etiqueta visible; tres <label> sin control; dos regiones
 *      vivas anidadas.
 */

test.use({ locale: 'es-ES', reducedMotion: 'reduce' });

const RUTA = '/calculadora-bitrate-video/';
const DURACION = '#duracion-input';

const resultados = (page: Page): Locator => page.locator('section[aria-label="Resultados"]');
const comparativa = (page: Page): Locator => page.locator('section[aria-label="Comparativa entre códecs"]');

/**
 * Lee una cifra tal como la pinta la app, hoy en formato US («3.30», «16000») y, tras la
 * reparación, en español («3,30», «16.000»): con coma, la coma es el decimal; sin coma, un punto
 * seguido de grupos de tres cifras es separador de miles; si no, el punto es el decimal.
 */
function leerCifra(texto: string): number {
  const t = texto.trim();
  if (t.includes(',')) return Number(t.replace(/\./g, '').replace(',', '.'));
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ''));
  return Number(t);
}

/** «45 Mbps» → 45 */
function leerMbps(texto: string): number {
  const m = texto.replace(/ /g, ' ').match(/([\d.,]+)\s*Mbps/);
  if (!m) throw new Error(`No hay Mbps en «${texto}»`);
  return leerCifra(m[1]);
}

const BYTES: Record<string, number> = {
  KB: 1e3,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
  KiB: 2 ** 10,
  MiB: 2 ** 20,
  GiB: 2 ** 30,
  TiB: 2 ** 40,
};

/** «1.81 GB» → bytes, leyendo GB como 10^9 y GiB como 2^30 (cada unidad, lo que dice su nombre). */
function leerBytes(texto: string): number {
  const m = texto.replace(/ /g, ' ').match(/([\d.,]+)\s*(KiB|MiB|GiB|TiB|KB|MB|GB|TB)\b/);
  if (!m) throw new Error(`No hay tamaño en «${texto}»`);
  return leerCifra(m[1]) * BYTES[m[2]];
}

async function elegirBoton(page: Page, grupo: string, nombre: RegExp | string): Promise<void> {
  const boton = page.getByRole('group', { name: grupo }).getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function ponerDuracion(page: Page, valor: string): Promise<void> {
  await page.locator(DURACION).fill(valor);
  await esperarValorEnReact(page, DURACION, valor);
}

async function configurar(
  page: Page,
  resolucion: RegExp,
  fps: string,
  codec: string,
  minutos: string,
): Promise<void> {
  await elegirBoton(page, 'Resolución', resolucion);
  await elegirBoton(page, 'Fotogramas por segundo (fps)', fps);
  await elegirBoton(page, 'Códec', codec);
  await ponerDuracion(page, minutos);
  await expect(comparativa(page).locator('h2')).toContainText(`${fps} · `);
}

/** Bitrate y tamaño de la fila de un códec en la tabla comparativa. */
async function filaCodec(page: Page, etiqueta: string): Promise<{ mbps: number; bytes: number; texto: string }> {
  const fila = comparativa(page).locator('tbody tr').filter({ hasText: etiqueta }).first();
  const celdas = fila.locator('td');
  const bitrate = (await celdas.nth(1).textContent()) ?? '';
  const tamano = (await celdas.nth(2).textContent()) ?? '';
  return { mbps: leerMbps(bitrate), bytes: leerBytes(tamano), texto: `${bitrate} · ${tamano}` };
}

const RE_1080 = /^1080p/;
const RE_2K = /^2K/;
const RE_4K = /^4K/;
const RE_8K = /^8K/;

/** Píxeles de una resolución, leídos del propio botón («2048×1080»). */
async function pixelesDe(page: Page, resolucion: RegExp): Promise<number> {
  const titulo = await page
    .getByRole('group', { name: 'Resolución' })
    .getByRole('button', { name: resolucion })
    .getAttribute('title');
  const m = (titulo ?? '').match(/(\d+)\s*×\s*(\d+)/);
  if (!m) throw new Error(`Sin dimensiones en el botón: «${titulo}»`);
  return Number(m[1]) * Number(m[2]);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [DURACION]);
});

test.describe('Bitrate: el modelo del motor (regresión)', () => {
  test('arranque — 4K · 30 fps · H.264 · 10 min: 45 Mbps (y ProRes 450 Mbps, la cifra de la FAQ visible)', async ({
    page,
  }) => {
    expect(leerMbps((await resultados(page).textContent()) ?? '')).toBe(45);
    // La FAQ visible: «4K ProRes 422 a 30 fps produce ≈450 Mbps ≈ 56 MB/s»
    expect((await filaCodec(page, 'ProRes 422')).mbps).toBe(450);
  });

  test('CASO 1 — 1080p · 25 fps · H.265 · 45 min: 12 × 25/30 × 0,55 = 5,5 Mbps', async ({ page }) => {
    await configurar(page, RE_1080, '25 fps', 'H.265', '45');
    expect(leerMbps((await resultados(page).textContent()) ?? '')).toBeCloseTo(5.5, 5);
    expect((await filaCodec(page, 'H.264')).mbps).toBeCloseTo(10, 5); // 12 × 25/30
    expect((await filaCodec(page, 'ProRes 422')).mbps).toBeCloseTo(93.8, 5); // 450 × ¼ × 25/30
    expect((await filaCodec(page, 'RAW')).mbps).toBeCloseTo(375, 5); // 1800 × ¼ × 25/30
  });

  test('CASO 2 — 8K · 120 fps · RAW · 600 min: 1800 × 4 (píxeles) × 4 (fps) = 28.800 Mbps', async ({ page }) => {
    await configurar(page, RE_8K, '120 fps', 'RAW', '600');
    expect(leerMbps((await resultados(page).textContent()) ?? '')).toBe(28800);
    expect((await filaCodec(page, 'H.264')).mbps).toBe(400);
    expect((await filaCodec(page, 'H.265')).mbps).toBe(220);
    expect((await filaCodec(page, 'ProRes 422')).mbps).toBe(7200);
  });
});

test.describe('Tamaño del fichero', () => {
  test('REPARADO A (4050) — CASO 1: 1856,25 MB son 1,86 GB, no «1.81 GB» (MB decimales ÷ 1024)', async ({
    page,
  }) => {
    // REPARADO el 04/11/2026. lib/calculadoras/videografia.ts dividía tamano_mb (MB DECIMALES)
    // entre 1024. Esperado 5,5 × 2700 / 8 = 1856,25 MB = 1,856·10^9 B (1,86 GB). Antes «1.81 GB».
    // Tolerancia 1 %: la mitad del defecto, y holgada para el redondeo a dos decimales (0,27 %).
    await configurar(page, RE_1080, '25 fps', 'H.265', '45');
    const tamano = (await resultados(page).locator('[class*="resultadoValor"]').nth(1).textContent()) ?? '';
    const bytes = leerBytes(tamano);
    expect(Math.abs(bytes / 1.85625e9 - 1), `«${tamano}»`).toBeLessThan(0.01);
  });

  test('REPARADO A (4050) — CASO 2: 129.600.000 MB son 129,6 TB (unidades SI, y TB por encima de 1000 GB)', async ({
    page,
  }) => {
    // REPARADO el 04/11/2026. Con el modelo reparado (hallazgo 4048) 8K RAW 120 fps = 28.800 Mbps:
    // 28.800 × 36.000 / 8 = 129,6·10^6 MB = 129,6 TB. Se presenta en TB.
    await configurar(page, RE_8K, '120 fps', 'RAW', '600');
    const tamano = (await resultados(page).locator('[class*="resultadoValor"]').nth(1).textContent()) ?? '';
    expect(tamano).toContain('TB');
    expect(Math.abs(leerBytes(tamano) / 129.6e12 - 1), `«${tamano}»`).toBeLessThan(0.01);
  });

  test('el tamaño es proporcional a la duración (45 → 90 min duplica el tamaño)', async ({ page }) => {
    await configurar(page, RE_1080, '25 fps', 'H.265', '45');
    const a = await filaCodec(page, 'ProRes 422');
    await ponerDuracion(page, '90');
    const b = await filaCodec(page, 'ProRes 422');
    expect(b.bytes / a.bytes).toBeCloseTo(2, 2);
  });
});

test.describe('Formato español', () => {
  test('REPARADO B (4053) — resultados, tabla y encabezado en formato español (CASO 2 y 1,5 min)', async ({
    page,
  }) => {
    // REPARADO el 04/11/2026. El motor usaba toFixed(2) y la página interpolaba el número y el id
    // de la resolución («16000 Mbps», «70312.50 GB», «1.5 min», «4k»). Ahora «28.800 Mbps»,
    // «129,60 TB», «1,5 min», «8K». Patrones prohibidos: un punto decimal (\d.\d{1,2}) o 5+
    // cifras sin agrupar.
    await configurar(page, RE_8K, '120 fps', 'RAW', '600');
    // innerText y no textContent: separa las celdas («H.264» y «400 Mbps» no se funden en «264400»).
    const texto8k = `${await resultados(page).innerText()} ${await comparativa(page).innerText()}`;
    expect(texto8k).toContain('28.800 Mbps');
    await ponerDuracion(page, '1.5');
    const h2 = (await comparativa(page).locator('h2').textContent()) ?? '';
    expect(h2).toContain('8K · 120 fps · 1,5 min');
    const texto = `${texto8k} ${await resultados(page).innerText()} ${h2}`;
    expect(texto.match(/\d\.\d{1,2}(?!\d)/g) ?? [], texto).toEqual([]);
    expect(texto.match(/\d{5,}/g) ?? [], texto).toEqual([]);
  });

  test('REPARADO G (4054) — la guía no escribe «3,375 MB» (en español, tres megas) por 3375 MB', async ({
    page,
  }) => {
    // REPARADO el 04/11/2026. Decía «(45 × 600 ÷ 8) = 3,375 MB ≈ 3,3 GB». 45 × 600 / 8 = 3375 MB
    // (cuatro cifras, sin agrupar, RAE 2010) = 3,375 GB ≈ 3,4 GB.
    const guia = (await page.getByText('El tamaño final del archivo', { exact: false }).textContent()) ?? '';
    expect(guia).not.toContain('3,375 MB');
    expect(guia).toContain('3375 MB ≈ 3,4 GB');
  });
});

test.describe('Escala con la resolución', () => {
  test('REPARADO C (4048) — ProRes y RAW de 8K: ≈ 4 veces los de 4K (4 veces los píxeles)', async ({ page }) => {
    // REPARADO el 04/11/2026. El motor multiplicaba una base H.264 (8K 100, 4K 45: ×2,22) por un
    // factor fijo, también en los códecs intra-frame. Esperado: cociente de bitrates = cociente de
    // píxeles (7680×4320 / 3840×2160 = 4), ±10 %. Antes: 1000/450 = 4000/1800 = 2,22 (a 30 fps).
    // Ahora ProRes y RAW escalan por píxeles desde su referencia en 4K: 1800 y 7200 Mbps.
    const cocientePixeles = (await pixelesDe(page, RE_8K)) / (await pixelesDe(page, RE_4K));
    expect(cocientePixeles).toBe(4);
    await configurar(page, RE_4K, '30 fps', 'H.264', '10');
    const prores4k = (await filaCodec(page, 'ProRes 422')).mbps;
    const raw4k = (await filaCodec(page, 'RAW')).mbps;
    await elegirBoton(page, 'Resolución', RE_8K);
    const prores8k = (await filaCodec(page, 'ProRes 422')).mbps;
    const raw8k = (await filaCodec(page, 'RAW')).mbps;
    expect(prores8k / prores4k / cocientePixeles, `ProRes ${prores4k} → ${prores8k}`).toBeGreaterThan(0.9);
    expect(raw8k / raw4k / cocientePixeles, `RAW ${raw4k} → ${raw8k}`).toBeGreaterThan(0.9);
  });

  test('REPARADO D (4049) — 2K (2048×1080) no dobla el bitrate de 1080p con un 6,7 % más de píxeles', async ({
    page,
  }) => {
    // REPARADO el 04/11/2026. BITRATE_BASE_H264 daba 1080p 12 Mbps y 2K 25 Mbps (×2,08) para
    // 2.211.840 / 2.073.600 = 1,067 veces los píxeles. Esperado: cociente de bitrates / cociente
    // de píxeles entre 0,75 y 1,35. Ahora 2K = 12,8 Mbps (12 × 1,067): relación 1,00.
    const cocientePixeles = (await pixelesDe(page, RE_2K)) / (await pixelesDe(page, RE_1080));
    await configurar(page, RE_1080, '30 fps', 'H.264', '10');
    const h264_1080 = (await filaCodec(page, 'H.264')).mbps;
    await elegirBoton(page, 'Resolución', RE_2K);
    const h264_2k = (await filaCodec(page, 'H.264')).mbps;
    const relacion = h264_2k / h264_1080 / cocientePixeles;
    expect(relacion, `${h264_1080} → ${h264_2k} Mbps con ×${cocientePixeles.toFixed(3)} píxeles`).toBeLessThan(1.35);
    expect(relacion).toBeGreaterThan(0.75);
  });
});

test.describe('CASO 3 — duraciones que no existen', () => {
  for (const valor of ['0', '-5', '']) {
    test(`REPARADO E (4051) — duración «${valor}»: aviso, no el resultado de 1 minuto en silencio`, async ({
      page,
    }) => {
      // REPARADO el 04/11/2026. page.tsx hacía `isNaN(v) || v <= 0 ? 1 : v` y presentaba «4k · 30
      // fps · 1 min», 45 Mbps → 338 MB, sin aviso. Ahora: aviso en role="alert" dentro de <main>
      // (no el anunciador de rutas de Next), ningún tamaño y el encabezado sin duración.
      await ponerDuracion(page, valor);
      const h2 = (await comparativa(page).locator('h2').textContent()) ?? '';
      expect(h2).not.toMatch(/min/);
      await expect(page.locator('main [role="alert"]')).toContainText('duración mayor que 0');
      await expect(resultados(page)).not.toContainText(/\d\s*(KB|MB|GB|TB)\b/);
      await expect(comparativa(page)).not.toContainText(/\d\s*(KB|MB|GB|TB)\b/);
      // El bitrate no depende de la duración y se sigue mostrando.
      expect(leerMbps((await resultados(page).textContent()) ?? '')).toBe(45);
    });
  }

  test('con una duración válida el aviso está vacío', async ({ page }) => {
    await ponerDuracion(page, '10');
    await expect(page.locator('main [role="alert"]')).toHaveText('');
    await expect(page.locator(DURACION)).toHaveAttribute('aria-invalid', 'false');
  });
});

test.describe('FAQPage frente al motor', () => {
  test('REPARADO F (4052) — «¿Cuánto espacio ocupa un vídeo 4K?»: las cifras del FAQPage son las de la app (±15 %)', async ({
    page,
  }) => {
    // REPARADO el 04/11/2026. metadata.ts. Esperado (motor, 4K 25 fps 60 min): H.264 16.875 MB,
    // H.265 9270 MB, ProRes 168.750 MB, RAW 675.000 MB. El FAQPage daba 13 / 7 / 270 / 1.100 GB;
    // ahora 17 / 9 / 169 / 675 GB. Solo se compara la cifra que el FAQPage dé para cada códec.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    let respuesta = '';
    for (const b of bloques) {
      const datos = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
      if (datos['@type'] !== 'FAQPage') continue;
      const q = (datos.mainEntity ?? []).find((e) => /espacio ocupa un v[ií]deo 4K/i.test(e.name));
      if (q) respuesta = q.acceptedAnswer.text;
    }
    expect(respuesta, 'la pregunta del FAQPage').not.toBe('');
    await configurar(page, RE_4K, '25 fps', 'H.264', '60');
    const discrepancias: string[] = [];
    for (const [etiqueta, patron] of [
      ['H.264', /([\d.,]+)\s*GB en H\.264/],
      ['H.265', /([\d.,]+)\s*GB en H\.265/],
      ['ProRes 422', /([\d.,]+)\s*GB en ProRes 422/],
      ['RAW', /([\d.,]+)\s*GB en RAW/],
    ] as const) {
      const m = respuesta.match(patron);
      if (!m) continue;
      const faq = leerCifra(m[1]) * 1e9;
      const app = (await filaCodec(page, etiqueta)).bytes;
      if (Math.abs(faq / app - 1) > 0.15) discrepancias.push(`${etiqueta}: FAQ ${m[1]} GB, app ${(app / 1e9).toFixed(2)} GB`);
    }
    expect(discrepancias, respuesta).toEqual([]);
  });
});

test.describe('Accesibilidad', () => {
  /** Contraste WCAG entre dos colores rgb()/rgba() de getComputedStyle. */
  function contraste(a: string, b: string): number {
    const lum = (rgb: string): number => {
      const [r, g, bl] = (rgb.match(/\d+(\.\d+)?/g) ?? ['0', '0', '0']).slice(0, 3).map((c) => {
        const s = Number(c) / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  }

  for (const tema of ['light', 'dark'] as const) {
  test(`REPARADO H (4055) — el texto blanco sobre el color de cada códec llega a 4,5:1 (tabla y botón activo, tema ${tema})`, async ({
    page,
  }) => {
    // REPARADO el 04/11/2026. page.tsx (CODECS[].color) por style={{ backgroundColor }} y
    // `color: white` en .codecBadge / .codecBtnActive. Texto de 12,8 px (badge) y 15,2 px (botón):
    // 4,5:1. Antes, en claro y oscuro: H.264 4,11 · H.265 2,80 · ProRes 2,26 · RAW 8,33. Ahora
    // --primary-boton, --secondary-boton, #4A5A6A y --hero-bg.
    await esperarPaginaAsentada(page);
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
    const bajos: string[] = [];
    const badges = await comparativa(page).locator('[class*="codecBadge"]').evaluateAll((els) =>
      els.map((e) => ({ t: e.textContent ?? '', c: getComputedStyle(e).color, f: getComputedStyle(e).backgroundColor })),
    );
    for (const b of badges) {
      const r = contraste(b.c, b.f);
      if (r < 4.5) bajos.push(`tabla ${b.t}: ${r.toFixed(2)}:1`);
    }
    for (const nombre of ['H.264', 'H.265', 'ProRes 422', 'RAW']) {
      await elegirBoton(page, 'Códec', nombre);
      const boton = page.getByRole('group', { name: 'Códec' }).getByRole('button', { name: nombre });
      const d = await boton.evaluate((e) => ({ c: getComputedStyle(e).color, f: getComputedStyle(e).backgroundColor }));
      const r = contraste(d.c, d.f);
      if (r < 4.5) bajos.push(`botón ${nombre}: ${r.toFixed(2)}:1`);
    }
    expect(bajos).toEqual([]);
  });
  }

  test('REPARADO I (4056) — el nombre accesible del campo contiene su etiqueta visible', async ({ page }) => {
    // REPARADO el 04/11/2026. El aria-label «Duración del vídeo en minutos» sustituía a la
    // etiqueta visible «Duración del vídeo (minutos)» (WCAG 2.5.3, la etiqueta en el nombre).
    await expect(page.locator(DURACION)).toHaveAccessibleName(/Duración del vídeo \(minutos\)/, { timeout: 1000 });
  });

  test('REPARADO I (4056) — los títulos de grupo no son <label> sin control', async ({ page }) => {
    // REPARADO el 04/11/2026. <label id=…> que no rotulaba ningún control (Resolución,
    // Fotogramas por segundo, Códec); el grupo ya se nombra con aria-labelledby. Ahora <span id>.
    const sinControl = await page
      .locator('main label')
      .evaluateAll((els) => els.filter((l) => !(l as HTMLLabelElement).control).map((l) => l.textContent));
    expect(sinControl).toEqual([]);
  });

  test('REPARADO I (4056) — una sola región viva para el resultado (no dos anidadas)', async ({ page }) => {
    // REPARADO el 04/11/2026. <section role="status" aria-live> contenía un
    // <p role="status" aria-live>: el lector podía anunciar la descripción dos veces.
    expect(await page.locator('[role="status"] [role="status"], [aria-live] [aria-live]').count()).toBe(0);
  });
});

/**
 * Cabo C0453 (turno de noche a11y del 25/10/2026) — se conserva tal cual de la versión anterior
 * de este spec; la primera inspección del 04/11/2026 lo había retirado sin motivo al reescribirlo.
 *
 * Los tres grupos de botones llevaban a la vez aria-labelledby y aria-label. Manda el primero,
 * así que el segundo no se anunciaba nunca y solo podía divergir del rótulo visible. Se fija
 * que cada grupo se llame como su rótulo y no lleve aria-label.
 */
for (const nombre of ['Resolución', 'Fotogramas por segundo (fps)', 'Códec']) {
  test(`el grupo «${nombre}» se llama como su rótulo visible`, async ({ page }) => {
    await page.goto(RUTA);
    const grupo = page.getByRole('group', { name: nombre, exact: true });
    await expect(grupo).toHaveCount(1);
    await expect(grupo).not.toHaveAttribute('aria-label');
  });
}
