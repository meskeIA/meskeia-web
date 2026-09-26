import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * Inspector — visualizador-jubilacion-perspectiva (segmento FISCAL, RIESGO 1 CRÍTICO)
 * Primera inspección: 26/09/2026. Entró por una SOSPECHA con caso (SOSPECHAS.md, 26/09):
 * «page.tsx:24 tiene su propia copia de la escala del porcentaje, con la forma del
 * hallazgo 1093 sin reparar». Medida en el navegador: CONFIRMADA.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Tu Jubilación en Perspectiva»
 *   sub.  «Visualiza tu vida laboral y cómo se traduce en pensión — año a año»
 *   meta. «…cuántos años cotizas, qué porcentaje de pensión generas y cómo cambia según
 *          cuándo empezaste a trabajar.»
 *   Una sola entrada (deslizador «¿A qué edad empezaste a cotizar?», 16-40) y tres salidas:
 *   el porcentaje de la base reguladora a los 67 (años cotizados = 67 − edad de inicio),
 *   las tarjetas de hitos y un gráfico Chart.js con el porcentaje para 0-45 años cotizados.
 *
 * De dónde sale cada cifra esperada — `data/fiscal/pensiones.ts`, NUNCA de memoria
 * ─────────────────────────────────────────────────────────────────────────────────
 *   · TRAMOS_PORCENTAJE_PENSION_2025 (l. 94-98), DT 9.ª LGSS, escala de 2026:
 *       180 meses → 50 % · meses 181-229 → 50 + (m − 180) × 0,21
 *       meses 230-438 → 60,29 + (m − 229) × 0,19 · más de 438 → 100 % · menos de 180 → 0
 *     (es la que aplica el motor compartido `calcularPorcentajePension(meses)` de
 *     lib/calculadoras/pensionPublica.ts:91, que la app NO usa: lleva su propia copia en
 *     page.tsx:24 con el tramo del 0,21 % hasta el mes 276, 96 meses en vez de 49.)
 *   · COTIZACION_MINIMA (l. 62-67): anosMinimosAcceso 15 · anosParaCien 36,5 · mesesParaCien 438.
 *   · TABLA_EDAD_JUBILACION fila 2027 (l. 43): 67 años sin cotización suficiente;
 *     jubilación a los 65 con 38 años y 6 meses cotizados.
 *   · COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025 (l. 191): < 38a6m → 1,875 % por trimestre
 *     · REQUISITOS_ANTICIPADA_VOLUNTARIA.maxMesesAnticipacion 24 (l. 214)
 *     · REQUISITOS_ANTICIPADA_INVOLUNTARIA.maxMesesAnticipacion 48 (l. 199).
 *
 * CASOS (resueltos a mano ANTES de abrir el navegador)
 * ───────────────────────────────────────────────────
 *   Serie del gráfico (años → meses = 12 × años):
 *     14 → 168 m  → 0 %        (rechazo: por debajo de los 180 meses de acceso)
 *     15 → 180 m  → 50 %       (límite inferior exacto)
 *     19 → 228 m  → 50 + 48 × 0,21 = 60,08 %   (aún dentro del primer tramo: la app acierta)
 *     20 → 240 m  → 60,29 + 11 × 0,19 = 62,38 %  (app: 62,60)
 *     25 → 300 m  → 60,29 + 71 × 0,19 = 73,78 %  (app: 74,72) ← el caso de la sospecha
 *     27 → 324 m  → 60,29 + 95 × 0,19 = 78,34 %  (app: 79,28)
 *     36 → 432 m  → 60,29 + 203 × 0,19 = 98,86 % (app: 99,80)
 *     37 → 444 m  → pasa del mes 438 → 100 %
 *     45 → 540 m  → 100 %      (más de 40 años: tope)
 *   Deslizador (años = 67 − edad de inicio):
 *     40 → 27 años → 78,34 % → «78,3 %»   (app: «79,3%»)
 *     31 → 36 años → 98,86 % → «98,9 %»   (app: «99,8%»); faltan 438 − 432 = 6 MESES
 *                    (app: «Te faltan 1 años más»)
 *     30 → 37 años → 100 %; hito 💯 a los 30 + 36 años y 6 meses = 66 años y 6 meses
 *     16 → 51 años → 100 %
 *     10 (imposible) → el control lo capa a 16 · 99 → lo capa a 40
 *
 * Los casos que llevaban marca de fallo esperado documentaban los hallazgos 2229-2238 del
 * acta del 26/09/2026. REPARADOS el 26/09/2026: la app llama al motor compartido y deriva de
 * data/fiscal todas sus cifras (app/visualizador-jubilacion-perspectiva/escala.ts); las
 * marcas se retiraron y cada caso afirma ya el comportamiento correcto.
 */

const RUTA = '/visualizador-jubilacion-perspectiva/';
const DESLIZADOR = 'input[type="range"]';

/** Espacio duro (U+00A0), que es el que debe separar la cifra del % (Ortografía RAE 2010). */
const ESPACIO_DURO = String.fromCharCode(160);

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [DESLIZADOR]);
}

/** «79,3%» o «78,3 %» → 79.3 / 78.3 */
function aNumero(texto: string): number {
  return Number(texto.replace(new RegExp(ESPACIO_DURO, 'g'), ' ').replace(/[%\s]/g, '').replace(',', '.'));
}

const pctPrincipal = (page: Page): Locator => page.locator('[class*="resultadoPct"]');
const textoResultado = (page: Page): Locator => page.locator('[class*="resultadoInfo"] p');

/**
 * La serie del gráfico, leída de la instancia de Chart.js. La app no la expone en `window`:
 * vive en un `useRef` del componente, así que se sube por la fibra de React del <canvas>
 * hasta el gancho cuyo `.current` es un Chart dibujado en ESE canvas.
 */
async function leerGrafico(page: Page): Promise<{ datos: number[]; colorEjes: string; colorRejilla: string; etiquetasY: string[] } | null> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const bruto = canvas as unknown as Record<string, unknown>;
    const clave = Object.keys(bruto).find((k) => k.startsWith('__reactFiber$'));
    interface Gancho { memoizedState: unknown; next: Gancho | null }
    interface Fibra { memoizedState: unknown; return: Fibra | null }
    interface Grafico {
      canvas?: unknown;
      data?: { datasets: { data: number[] }[] };
      scales?: {
        x: { options: { ticks: { color: string }; grid: { color: string } } };
        y: { ticks: { label: string }[] };
      };
    }
    let fibra = (clave ? bruto[clave] : null) as Fibra | null;
    while (fibra) {
      let gancho = fibra.memoizedState as Gancho | null;
      while (gancho && typeof gancho === 'object' && 'next' in gancho) {
        const ref = gancho.memoizedState as { current?: Grafico } | null;
        const inst = ref && typeof ref === 'object' ? ref.current : undefined;
        if (inst && inst.canvas === canvas && inst.data && inst.scales) {
          return {
            datos: [...inst.data.datasets[0].data],
            colorEjes: String(inst.scales.x.options.ticks.color),
            colorRejilla: String(inst.scales.x.options.grid.color),
            etiquetasY: inst.scales.y.ticks.map((t) => String(t.label)),
          };
        }
        gancho = gancho.next;
      }
      fibra = fibra.return;
    }
    return null;
  });
}

async function serie(page: Page): Promise<number[]> {
  await expect.poll(async () => (await leerGrafico(page))?.datos.length ?? 0).toBe(46);
  const g = await leerGrafico(page);
  return g ? g.datos : [];
}

/** Contraste WCAG entre dos colores «rgb(…)»/«#rrggbb», con la opacidad del texto ya mezclada. */
function contraste(a: [number, number, number], b: [number, number, number]): number {
  const lum = (c: [number, number, number]) => {
    const f = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function aRgb(color: string): [number, number, number] {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split('').map((c) => c + c).join('') : hex[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const p = (color.match(/[\d.]+/g) ?? []).map(Number);
  return [p[0], p[1], p[2]];
}

/** Contraste efectivo de un texto: su color, mezclado con la opacidad acumulada, sobre su fondo opaco. */
async function contrasteEfectivo(loc: Locator): Promise<number> {
  const m = await loc.evaluate((el) => {
    const fondo = (e: Element | null): string => {
      while (e) {
        const c = getComputedStyle(e).backgroundColor;
        const a = c.match(/rgba?\(([^)]+)\)/);
        const partes = a ? a[1].split(/[ ,/]+/).filter(Boolean).map(Number) : [];
        if (partes.length >= 3 && (partes[3] ?? 1) > 0.5) return c;
        e = e.parentElement;
      }
      return 'rgb(255, 255, 255)';
    };
    let opacidad = 1;
    let e: Element | null = el;
    while (e) {
      opacidad *= Number(getComputedStyle(e).opacity);
      e = e.parentElement;
    }
    return { color: getComputedStyle(el).color, fondo: fondo(el), opacidad };
  });
  const fg = aRgb(m.color);
  const bg = aRgb(m.fondo);
  const mezcla: [number, number, number] = [0, 1, 2].map((i) => fg[i] * m.opacidad + bg[i] * (1 - m.opacidad)) as [number, number, number];
  return contraste(mezcla, bg);
}

test.use({ colorScheme: 'light' });

test.describe('visualizador-jubilacion-perspectiva — escala del porcentaje (DT 9.ª LGSS)', () => {
  test('gráfico: los puntos donde la escala copiada coincide con data/fiscal', async ({ page }) => {
    await abrir(page);
    const s = await serie(page);
    // Esperados de TRAMOS_PORCENTAJE_PENSION_2025 (pensiones.ts l. 94-98). Precisión 1
    // (± 0,05 puntos): el motor redondea a centésimas y el defecto que se vigila es de 0,2-1 punto.
    expect(s[14]).toBe(0); // 168 meses < 180 (COTIZACION_MINIMA.mesesMinimosAcceso) → sin pensión
    expect(s[15]).toBeCloseTo(50, 1); // 180 meses exactos
    expect(s[19]).toBeCloseTo(60.08, 1); // 228 meses: 50 + 48 × 0,21, aún en el primer tramo
    expect(s[37]).toBeCloseTo(100, 1); // 444 meses > 438 (COTIZACION_MINIMA.mesesParaCien)
    expect(s[45]).toBeCloseTo(100, 1); // más de 40 años: tope del 100 %
  });

  test('gráfico: 25 años cotizados = 73,78 % (el caso de la sospecha)', async ({ page }) => {
    // Hallazgo 2229 (REPARADO 26/09/2026): page.tsx:24 reimplementaba la escala con el tramo
    // del 0,21 % hasta el mes 276 (96 meses) en vez de hasta el 229 (49 meses), la forma del
    // hallazgo 1093 ya reparada en data/fiscal. 300 meses → 60,29 + 71 × 0,19 = 73,78 %;
    // la app dibujaba 74,72. Ahora llama a calcularPorcentajePension(meses).
    await abrir(page);
    const s = await serie(page);
    expect(s[25]).toBeCloseTo(73.78, 1);
    expect(s[20]).toBeCloseTo(62.38, 1); // 240 meses: 60,29 + 11 × 0,19
    expect(s[36]).toBeCloseTo(98.86, 1); // 432 meses: 60,29 + 203 × 0,19
    expect(s[27]).toBeCloseTo(78.34, 1); // 324 meses: 60,29 + 95 × 0,19
    expect(s[32]).toBeCloseTo(89.74, 1); // 384 meses: 60,29 + 155 × 0,19
  });

  test('deslizador 40 años → 27 cotizados → 78,3 %', async ({ page }) => {
    // Hallazgo 2229 (REPARADO 26/09/2026), el de la escala copiada: 324 meses →
    // 60,29 + 95 × 0,19 = 78,34 % (pensiones.ts l. 97); la app publicaba «79,3%».
    await abrir(page);
    await sembrarValor(page, DESLIZADOR, 40);
    await expect(page.locator('[class*="timelineResumen"]')).toContainText('27 años cotizando');
    expect(aNumero(await pctPrincipal(page).innerText())).toBeCloseTo(78.34, 1);
  });

  test('deslizador 31 años → 36 cotizados → 98,9 %', async ({ page }) => {
    // Hallazgo 2229 (REPARADO 26/09/2026), escala copiada: 432 meses → 98,86 %; la app daba «99,8%».
    await abrir(page);
    await sembrarValor(page, DESLIZADOR, 31);
    await expect(page.locator('[class*="timelineResumen"]')).toContainText('36 años cotizando');
    expect(aNumero(await pctPrincipal(page).innerText())).toBeCloseTo(98.86, 1);
  });

  test('límites del deslizador: edad imposible capada, 100 % a partir de 36,5 años y su hito', async ({ page }) => {
    await abrir(page);
    // Rechazo: una edad de inicio de 10 no la admite el control, que la capa a su mínimo 16
    // (parte del 23 inicial, así que la siembra SÍ mueve el estado).
    expect(await sembrarValorAcotado(page, DESLIZADOR, 10)).toBe('16');
    await expect(page.locator('[class*="timelineResumen"]')).toContainText('51 años cotizando');
    // 612 meses > 438 → 100 % (TRAMOS_PORCENTAJE_PENSION_2025, tope)
    expect(aNumero(await pctPrincipal(page).innerText())).toBeCloseTo(100, 1);

    // 30 → 37 años = 444 meses > 438 → 100 %, y el hito 💯 cae en 30 años + 438 meses =
    // 66 años y 6 meses. Hasta el 26/09/2026 este caso afirmaba «67 años»: consagraba el
    // redondeo ⌈36,5⌉ = 37 del hallazgo 2232, que la ficha pide quitar (el 100 % llega con
    // 36 años y 6 meses cotizados, COTIZACION_MINIMA.mesesParaCien).
    await sembrarValor(page, DESLIZADOR, 30);
    await expect(page.locator('[class*="timelineResumen"]')).toContainText('37 años cotizando');
    expect(aNumero(await pctPrincipal(page).innerText())).toBeCloseTo(100, 1);
    await expect(textoResultado(page)).toContainText('alcanzas el 100');
    const hitoCien = page.locator('[class*="hitoCard"]').filter({ hasText: 'Alcanzas el 100' });
    await expect(hitoCien).toContainText('66 años y 6 meses');
    await expect(hitoCien).toContainText('36 años y 6 meses cotizados');

    // 31 → 36 años: 31 + 36 años y 6 meses = 67 años y 6 meses > 67: NO debe haber hito del 100 %
    await sembrarValor(page, DESLIZADOR, 31);
    await expect(page.locator('[class*="hitoCard"]').filter({ hasText: 'Alcanzas el 100' })).toHaveCount(0);

    // Por arriba: 99 se capa a 40 → 27 años (≥ 15: hay pensión; el porcentaje lo vigila otro caso)
    expect(await sembrarValorAcotado(page, DESLIZADOR, 99)).toBe('40');
    await expect(page.locator('[class*="timelineResumen"]')).toContainText('27 años cotizando');
  });

  test('«Te faltan…» para el 100 %: 36 años cotizados → faltan 6 meses, no «1 años»', async ({ page }) => {
    // Hallazgo 2232 (REPARADO 26/09/2026): la app restaba de ⌈COTIZACION_MINIMA.anosParaCien⌉
    // = 37 y escribía «Te faltan 1 años más». Según COTIZACION_MINIMA.mesesParaCien (l. 66)
    // faltan 438 − 432 = 6 meses.
    await abrir(page);
    await sembrarValor(page, DESLIZADOR, 31);
    await expect(textoResultado(page)).toContainText('Te faltan 6 meses más');
    await expect(textoResultado(page)).not.toContainText('1 años');
    // 40 → 27 años = 324 meses → faltan 438 − 324 = 114 meses = 9 años y 6 meses (la app decía «10 años»)
    await sembrarValor(page, DESLIZADOR, 40);
    await expect(textoResultado(page)).toContainText('Te faltan 9 años y 6 meses más');
  });
});

test.describe('visualizador-jubilacion-perspectiva — datos y textos', () => {
  test('hito de los 65: exige 38 años y 6 meses cotizados', async ({ page }) => {
    // Hallazgo 2233 (REPARADO 26/09/2026): el hito decía «Jubilación si tienes +38 años
    // cotizados», escrito a mano. TABLA_EDAD_JUBILACION fila 2027 (pensiones.ts l. 43), la que
    // usa la propia app para su edad de 67: cotizacionPara65 = 38 años y 6 meses.
    await abrir(page);
    await expect(
      page.locator('[class*="hitoCard"]').filter({ hasText: 'Jubilación si tienes' }),
    ).toContainText('38 años y 6 meses');
  });

  test('FAQ (JSON-LD): 25 años cotizados no son «aproximadamente el 80%»', async ({ page }) => {
    // Hallazgo 2230 (REPARADO 26/09/2026): dos respuestas de la FAQPage decían que con 25 años
    // se cobra «aproximadamente el 80%» y que de 15 a 25 años cada año suma «un 3%»: es la
    // escala anterior a la Ley 27/2011. Con TRAMOS_PORCENTAJE_PENSION_2025: 300 meses → 73,78 %,
    // y un año suma 12 × 0,21 = 2,52 o 12 × 0,19 = 2,28 puntos.
    await abrir(page);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain('FAQPage');
    expect(faq).not.toMatch(/25 años[^.]*80\s?%/);
    expect(faq).not.toMatch(/un [23]\s?%/);
    expect(faq).toContain(`73,78${ESPACIO_DURO}%`);
    expect(faq).toContain('2,52 puntos por año');
    expect(faq).toContain('2,28 puntos por año');
    expect(faq).toContain('36 años y 6 meses');
  });

  test('texto educativo: anticipada a los 63 con 38 años cotizados', async ({ page }) => {
    // Hallazgo 2231 (REPARADO 26/09/2026): decía «la penalización puede ser del 12-16%». Con
    // 38 años (< 38a6m) la edad ordinaria es 67 (TABLA_EDAD_JUBILACION 2027, l. 43): a los 63
    // son 48 meses, fuera de la voluntaria (máx. 24, l. 214) y dentro de la involuntaria (máx.
    // 48, l. 199) → 16 trimestres × 1,875 % (l. 191) = 30 %.
    await abrir(page);
    const parrafo = page.locator('h3', { hasText: 'Jubilación anticipada' }).locator('xpath=following-sibling::p[1]');
    // Se colapsan los saltos de línea del JSX, pero NO el espacio duro (que \s también atraparía)
    const texto = ((await parrafo.textContent()) ?? '').replace(/[ \n\t]+/g, ' ');
    expect(texto).toContain('63 años');
    expect(texto).not.toMatch(/12-16\s?%/);
    expect(texto).toContain('48 meses');
    expect(texto).toContain(`16 trimestres × 1,875${ESPACIO_DURO}% = 30${ESPACIO_DURO}%`);
  });

  test('texto educativo: empezar a los 35 → 32 años → 89,74 %', async ({ page }) => {
    // Hallazgo 2234 (REPARADO 26/09/2026): «Si empiezas a los 35, llegarás con 32 años —
    // aproximadamente un 88%». 384 meses → 60,29 + 155 × 0,19 = 89,74 % (pensiones.ts l. 97);
    // y el deslizador de la misma página, en 35, publicaba «90,7%». Tolerancia ± 0,5.
    await abrir(page);
    const parrafo = page.locator('h3', { hasText: 'empiezo tarde' }).locator('xpath=following-sibling::p[1]');
    const texto = (await parrafo.textContent()) ?? '';
    const m = texto.match(/empiezas a los 35[^.]*?(\d+(?:,\d+)?)\s?%/);
    expect(m).not.toBeNull();
    expect(aNumero(m ? m[1] : 'NaN')).toBeCloseTo(89.74, 0);
    // Y el deslizador en 35 dice lo mismo que el texto (la app daba «90,7%»)
    await sembrarValor(page, DESLIZADOR, 35);
    expect(aNumero(await pctPrincipal(page).innerText())).toBeCloseTo(89.74, 1);
  });

  test('formato: el porcentaje va separado del % con espacio duro', async ({ page }) => {
    // Hallazgo 2235 (REPARADO 26/09/2026): `${formatNumber(pctPension, 1)}%` lo pegaba
    // («100,0%»), y también las marcas del eje Y. Regla del CLAUDE.md global §2 (25/09/2026).
    await abrir(page);
    await expect(pctPrincipal(page)).toHaveText(`100,0${ESPACIO_DURO}%`);
    await sembrarValor(page, DESLIZADOR, 40);
    await expect(pctPrincipal(page)).toHaveText(`78,3${ESPACIO_DURO}%`);
    await expect(textoResultado(page)).toContainText(`78,34${ESPACIO_DURO}%`);
    const g = await leerGrafico(page);
    const etiquetas = g ? g.etiquetasY : [];
    expect(etiquetas.length).toBeGreaterThan(0);
    for (const e of etiquetas) expect(e).toMatch(new RegExp(`^\\d+${ESPACIO_DURO}%$`));
  });
});

test.describe('visualizador-jubilacion-perspectiva — accesibilidad', () => {
  for (const tema of ['light', 'dark'] as const) {
    test(`tarjeta «Inicio cotización» legible (≥ 4,5:1) — tema ${tema}`, async ({ page }) => {
      // Hallazgo 2236 (REPARADO 26/09/2026): la primera tarjeta cumplía SIEMPRE
      // `h.edad <= edadInicio` y recibía `.hitoFuturo { opacity: 0.5 }`: su descripción quedaba
      // a 2,02:1 en claro y 2,37:1 en oscuro. Se retiró la atenuación.
      await abrir(page);
      await prepararParaMedir(page);
      await activarTema(page, tema);
      const tarjeta = page.locator('[class*="hitoCard"]').filter({ hasText: 'Inicio cotización' });
      for (const parte of ['hitoDesc', 'hitoEdad', 'hitoTitulo']) {
        expect(await contrasteEfectivo(tarjeta.locator(`[class*="${parte}"]`)), parte).toBeGreaterThanOrEqual(4.5);
      }
    });

    test(`texto de marca legible (≥ 4,5:1) — tema ${tema}`, async ({ page }) => {
      // Hallazgo 2237 (REPARADO 26/09/2026): --primary como color de texto pequeño daba
      // .hitoEdad 4,11:1 y .enlaceApp 3,77:1 en claro (3,50 y 3,08 en oscuro). Ahora --primary-texto.
      await abrir(page);
      await prepararParaMedir(page);
      await activarTema(page, tema);
      const edades = page.locator('[class*="hitoEdad"]');
      const n = await edades.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        expect(await contrasteEfectivo(edades.nth(i)), `hitoEdad ${i}`).toBeGreaterThanOrEqual(4.5);
      }
      const enlaces = page.locator('[class*="enlaceApp"] a');
      expect(await enlaces.count()).toBe(2);
      for (let i = 0; i < 2; i++) {
        expect(await contrasteEfectivo(enlaces.nth(i)), `enlaceApp ${i}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test('gráfico en oscuro: los ejes se leen (≥ 4,5:1)', async ({ page }) => {
    // Hallazgo 2238 (REPARADO 26/09/2026): el gráfico se creaba una vez con los colores por
    // defecto de Chart.js (#666) y no tenía variante oscura: sobre la tarjeta oscura (#2A2A2A),
    // 2,50:1. Ahora lee los tokens y un MutationObserver sobre `data-theme` lo repinta.
    await abrir(page);
    await prepararParaMedir(page); // sin transiciones: el fondo se mediría a medio camino
    await activarTema(page, 'light');
    await expect.poll(async () => (await leerGrafico(page))?.colorEjes ?? '').not.toBe('');
    const claro = await leerGrafico(page);
    await activarTema(page, 'dark');
    await expect.poll(async () => (await leerGrafico(page))?.colorEjes).not.toBe(claro?.colorEjes);
    const g = await leerGrafico(page);
    const fondo = await page.locator('[class*="chartContainer"]').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(contraste(aRgb(g ? g.colorEjes : '#666'), aRgb(fondo))).toBeGreaterThanOrEqual(4.5);
    // La rejilla también sigue al tema (la de claro, #E5E5E5, sería una línea blanca en oscuro)
    expect(g?.colorRejilla).not.toBe(claro?.colorRejilla);
  });
});
