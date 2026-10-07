import { test, expect, devices, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Calculadora de Estadística Médica — regresión del CÁLCULO, no de la carga.
 * Origen: /inspector, 07/10/2026 (primera inspección; segmento cálculo, riesgo 2).
 *
 * QUÉ PROMETE
 *   · <h1>: «Calculadora de Estadística Médica». Subtítulo: «Sensibilidad, especificidad,
 *     valores predictivos, odds ratio, riesgo relativo y NNT».
 *   · Tres modos: Pruebas Diagnósticas (tabla 2×2 → sensibilidad, especificidad, VPP, VPN,
 *     LR+, LR−, prevalencia, exactitud), Epidemiología (a, b, c, d → OR e IC 95 % de Woolf,
 *     RR e IC 95 % por el método log, riesgos, ARR/ARI y NNT/NNH) y NNT Directo (CER y EER
 *     en % → NNT, ARR, RRR).
 *   · JSON-LD (featureList): «NNT directo … con IC 95% automático» y «Calculadora
 *     epidemiológica: riesgo relativo, odds ratio y reducción de riesgo (RAR/RRR)».
 *
 * DÓNDE VIVE EL CÁLCULO — tres `useMemo` dentro de app/calculadora-estadistica-medica/page.tsx
 * (no hay motor aparte). Los IC: Woolf para el OR, exp(ln OR ± 1,96·√(1/a+1/b+1/c+1/d)), y
 * Katz (log) para el RR, exp(ln RR ± 1,96·√(1/a − 1/(a+b) + 1/c − 1/(c+d))).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   Diagnóstico — sens = VP/(VP+FN) · esp = VN/(VN+FP) · VPP = VP/(VP+FP) · VPN = VN/(VN+FN)
 *   · LR+ = sens/(1−esp) · LR− = (1−sens)/esp.
 *   · D1 normal — VP 90, FP 10, FN 20, VN 180: sens 9/11 = 81,8 %; esp 18/19 = 94,7 %;
 *     VPP 90/100 = 90,0 %; VPN 180/200 = 90,0 %; LR+ = (9/11)·19 = 171/11 = 15,55;
 *     LR− = (2/11)/(18/19) = 38/198 = 0,19; prevalencia 110/300 = 36,7 %; exactitud 90,0 %.
 *   · D2a límite, especificidad 100 % — VP 90, FP 0, FN 10, VN 100: LR+ = 0,9/0 = ∞ (correcto
 *     que salga ∞); LR− = 0,1/1 = 0,10; VPN 100/110 = 90,9 %.
 *   · D2b límite, especificidad 0 % — VP 90, FP 50, FN 10, VN 0: LR+ = 0,9/(1−0) = 0,90.
 *     HALLAZGO: la app da «∞ · Cambio grande (prueba muy útil para confirmar)».
 *   · D2c límite, sensibilidad 0 % — VP 0, FP 10, FN 10, VN 90: LR− = (1−0)/0,9 = 1,11.
 *     HALLAZGO: la app da «∞». Las guardas de LR+ y LR− miran la variable equivocada.
 *   · D3 a rechazar — FN −20 (un recuento negativo). HALLAZGO: la app pinta sensibilidad
 *     90/70 = 128,6 % y exactitud 103,8 %.
 *
 *   Epidemiología — la cohorte del propio bloque educativo («Epidemiólogo»):
 *   · E1 normal — a 120, b 1.380, c 30, d 3.470: OR = 416.400/41.400 = 10,06;
 *     IC Woolf: SE = √(1/120+1/1380+1/30+1/3470) = 0,2066 → 6,71 – 15,08;
 *     RR = 0,08/0,008571 = 9,33; IC log: 6,28 – 13,86; riesgos 8,0 % y 0,9 %;
 *     ARI = 7,14 % → 7,1 %; NNH = 1/0,0714 = 14,0.
 *   · E2 límite — a 10, b 0, c 5, d 5: OR no finito, pero RR = 1/0,5 = 2,00, riesgos 100 % y
 *     50 %, ARI 50 %, NNH 2. HALLAZGO: la app no pinta nada y pide «Introduce los datos».
 *   · E3 a rechazar — a −5. HALLAZGO: la app pinta OR −0,83 y «Riesgo Expuestos −20,0 %».
 *   · S1 rótulo del OR — a 200, b 800, c 150, d 850: OR 1,42, IC 1,12 – 1,79, que NO incluye
 *     el 1 (significativo, según la propia FAQ de la página). HALLAZGO: la app lo rotula
 *     «Sin asociación significativa».
 *
 *   NNT — ARR = CER − EER · NNT = 1/ARR · RRR = ARR/CER.
 *   · N1 normal — CER 20, EER 12: ARR 8,0 %, NNT 12,5 («tratar a 13 pacientes»), RRR 40,0 %.
 *   · N2 límite — CER 20, EER 20: ARR 0, sin efecto. HALLAZGO: «Hay que tratar a Infinity
 *     pacientes para prevenir 1 evento».
 *   · N3 a rechazar — CER 120 %: fuera de [0, 100]. La app no da resultado (correcto).
 *
 * Los valores se comparan como TEXTO literal a la precisión que pinta la app; el `%` admite
 * espacio (duro o no) delante, para que el test no se rompa cuando la app adopte la regla
 * de formato del 25/09/2026.
 */

const URL = '/calculadora-estadistica-medica/';
const PANEL = '[class*="resultsPanel"]';

const escapar = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Cifra con `%` detrás, con o sin espacio (duro) delante. */
const pct = (v: string): RegExp => new RegExp(`^${escapar(v)}\\s?%$`);
/** Cifra sin unidad. */
const num = (v: string): RegExp => new RegExp(`^${escapar(v)}$`);

/** La tarjeta de resultado cuyo rótulo es exactamente `etiqueta`. */
function tarjeta(page: Page, etiqueta: string): Locator {
  return page
    .locator(`${PANEL} [class*="resultCard"]`)
    .filter({ has: page.locator('[class*="resultLabel"]', { hasText: new RegExp(`^${escapar(etiqueta)}$`) }) });
}
const cifra = (page: Page, etiqueta: string): Locator =>
  tarjeta(page, etiqueta).locator('[class*="resultValue"]');
const descripcion = (page: Page, etiqueta: string): Locator =>
  tarjeta(page, etiqueta).locator('[class*="resultDesc"]');

/** Escribe cada valor en el input de ese placeholder y espera a que React lo tenga. */
async function rellenar(page: Page, valores: ReadonlyArray<readonly [string, string]>): Promise<void> {
  for (const [placeholder, v] of valores) {
    const sel = `input[placeholder="${placeholder}"]`;
    await page.fill(sel, v);
    await esperarValorEnReact(page, sel, v);
  }
}
const tabla = (vp: string, fp: string, fn: string, vn: string) =>
  [['VP', vp], ['FP', fp], ['FN', fn], ['VN', vn]] as const;
const epi = (a: string, b: string, c: string, d: string) =>
  [['a', a], ['b', b], ['c', c], ['d', d]] as const;

async function modo(page: Page, nombre: RegExp): Promise<void> {
  await page.getByRole('button', { name: nombre }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await esperarHidratacion(page, ['input[placeholder="VP"]']);
});

// ═══════════════════════════════════════════════════════════════════════════
// MODO 1 — Pruebas diagnósticas
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Pruebas diagnósticas', () => {
  test('D1 — VP 90, FP 10, FN 20, VN 180: las ocho cifras de la tabla 2×2', async ({ page }) => {
    await rellenar(page, tabla('90', '10', '20', '180'));
    await expect(cifra(page, 'Sensibilidad')).toHaveText(pct('81,8')); // 90/110
    await expect(cifra(page, 'Especificidad')).toHaveText(pct('94,7')); // 180/190
    await expect(cifra(page, 'VPP')).toHaveText(pct('90,0')); // 90/100
    await expect(cifra(page, 'VPN')).toHaveText(pct('90,0')); // 180/200
    await expect(cifra(page, 'LR+')).toHaveText(num('15,55')); // 171/11
    await expect(cifra(page, 'LR-')).toHaveText(num('0,19')); // 38/198
    await expect(cifra(page, 'Prevalencia')).toHaveText(pct('36,7')); // 110/300
    await expect(cifra(page, 'Exactitud')).toHaveText(pct('90,0')); // 270/300
    await expect(descripcion(page, 'LR+')).toHaveText(/Cambio grande/); // > 10
    await expect(descripcion(page, 'LR-')).toHaveText(/Cambio moderado/); // 0,1–0,2
  });

  test('D2a — especificidad 100 % (FP 0): LR+ infinito y LR− 0,10', async ({ page }) => {
    await rellenar(page, tabla('90', '0', '10', '100'));
    await expect(cifra(page, 'Especificidad')).toHaveText(pct('100,0'));
    await expect(cifra(page, 'LR+')).toHaveText(num('∞')); // 0,9 / 0
    await expect(cifra(page, 'LR-')).toHaveText(num('0,10')); // 0,1 / 1
    await expect(cifra(page, 'VPN')).toHaveText(pct('90,9')); // 100/110
  });

  test('D2b — especificidad 0 % (VN 0): LR+ = 0,90, no infinito', async ({ page }) => {
    await rellenar(page, tabla('90', '50', '10', '0'));
    // Control: el resto de la tarjeta está bien.
    await expect(cifra(page, 'Sensibilidad')).toHaveText(pct('90,0'));
    await expect(cifra(page, 'Especificidad')).toHaveText(pct('0,0'));
    await expect(cifra(page, 'VPP')).toHaveText(pct('64,3')); // 90/140
    // LR+ = 0,9 / (1 − 0) = 0,90: una prueba positiva en TODOS los sanos no confirma nada.
    await expect(cifra(page, 'LR+')).toHaveText(num('0,90'), { timeout: 2000 });
  });

  test('D2c — sensibilidad 0 % (VP 0): LR− = 1,11, no infinito', async ({ page }) => {
    await rellenar(page, tabla('0', '10', '10', '90'));
    await expect(cifra(page, 'Especificidad')).toHaveText(pct('90,0'));
    await expect(cifra(page, 'LR+')).toHaveText(num('0,00')); // 0 / 0,1
    // LR− = (1 − 0) / 0,9 = 1,11
    await expect(cifra(page, 'LR-')).toHaveText(num('1,11'), { timeout: 2000 });
  });

  test('D3 — un recuento negativo (FN −20) no produce una sensibilidad del 128,6 %', async ({ page }) => {
    await rellenar(page, tabla('90', '10', '20', '180'));
    await expect(cifra(page, 'Sensibilidad')).toHaveText(pct('81,8')); // la app está viva
    await rellenar(page, [['FN', '-20']]);
    await expect(page.locator(PANEL)).not.toContainText('128,6', { timeout: 2000 });
    await expect(tarjeta(page, 'Sensibilidad')).toHaveCount(0, { timeout: 2000 });
  });

  test('D4 — indeterminación 0/0: con VP 0 y FP 0 el VPP no es «0,0 %»', async ({ page }) => {
    await rellenar(page, tabla('0', '0', '10', '90'));
    await expect(cifra(page, 'VPN')).toHaveText(pct('90,0')); // 90/100, definido
    await expect(cifra(page, 'VPP')).not.toHaveText(pct('0,0'), { timeout: 2000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MODO 2 — Epidemiología
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Epidemiología', () => {
  test.beforeEach(async ({ page }) => {
    await modo(page, /^Epidemiología/);
  });

  test('E1 — cohorte del bloque educativo (120 / 1.380 / 30 / 3.470): OR, RR, IC y NNH', async ({ page }) => {
    await rellenar(page, epi('120', '1380', '30', '3470'));
    await expect(cifra(page, 'Odds Ratio')).toHaveText(num('10,06')); // 416.400 / 41.400
    await expect(tarjeta(page, 'Odds Ratio')).toContainText(/IC 95\s?%:\s*6,71\s*[-–]\s*15,08/); // Woolf
    await expect(cifra(page, 'Riesgo Relativo')).toHaveText(num('9,33')); // 0,08 / 0,008571
    await expect(tarjeta(page, 'Riesgo Relativo')).toContainText(/IC 95\s?%:\s*6,28\s*[-–]\s*13,86/); // log
    await expect(cifra(page, 'Riesgo Expuestos')).toHaveText(pct('8,0')); // 120/1500
    await expect(cifra(page, 'Riesgo No Expuestos')).toHaveText(pct('0,9')); // 30/3500
    await expect(cifra(page, 'ARI')).toHaveText(pct('7,1')); // 8 − 0,857
    await expect(cifra(page, 'NNH')).toHaveText(num('14,0')); // 1 / 0,0714
  });

  test('E2 — celda b = 0: el RR (2,00) sigue siendo calculable y se muestra', async ({ page }) => {
    await rellenar(page, epi('10', '10', '5', '5'));
    await expect(cifra(page, 'Riesgo Relativo')).toHaveText(num('1,00')); // (10/20)/(5/10): control de que la app está viva
    await rellenar(page, [['b', '0']]);
    // RR = (10/10) / (5/10) = 2,00
    await expect(cifra(page, 'Riesgo Relativo')).toHaveText(num('2,00'), { timeout: 2000 });
  });

  test('E3 — un recuento negativo (a = −5) se rechaza, no da «Riesgo Expuestos −20,0 %»', async ({ page }) => {
    await rellenar(page, epi('50', '30', '20', '100'));
    await expect(cifra(page, 'Odds Ratio')).toHaveText(num('8,33')); // 5000/600, control
    await rellenar(page, [['a', '-5']]);
    await expect(tarjeta(page, 'Odds Ratio')).toHaveCount(0, { timeout: 2000 });
  });

  test('S1 — OR 1,42 con IC 1,12 – 1,79 (no incluye el 1) no se rotula «Sin asociación significativa»', async ({ page }) => {
    await rellenar(page, epi('200', '800', '150', '850'));
    await expect(cifra(page, 'Odds Ratio')).toHaveText(num('1,42')); // 170.000 / 120.000
    await expect(tarjeta(page, 'Odds Ratio')).toContainText(/IC 95\s?%:\s*1,12\s*[-–]\s*1,79/);
    await expect(descripcion(page, 'Odds Ratio')).not.toHaveText(/Sin asociación significativa/, { timeout: 2000 });
  });

  test('S2 — con la tabla rotulada Caso/Control, el «riesgo» no se presenta como incidencia sin aviso', async ({ page }) => {
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.getByRole('columnheader', { name: 'Caso' })).toBeVisible();
    await expect(cifra(page, 'Riesgo Expuestos')).toHaveText(pct('62,5')); // 50/80
    await expect(descripcion(page, 'Riesgo Relativo')).toHaveText(/cohortes/);
    await expect(tarjeta(page, 'Riesgo Expuestos')).toContainText(/cohorte/i, { timeout: 2000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MODO 3 — NNT directo
// ═══════════════════════════════════════════════════════════════════════════
test.describe('NNT directo', () => {
  test.beforeEach(async ({ page }) => {
    await modo(page, /^NNT Directo/);
  });

  test('N1 — CER 20 %, EER 12 %: ARR 8,0 %, NNT 12,5 y RRR 40,0 %', async ({ page }) => {
    await rellenar(page, [['20', '20'], ['12', '12']]);
    await expect(cifra(page, 'NNT')).toHaveText(num('12,5')); // 1 / 0,08
    await expect(descripcion(page, 'NNT')).toHaveText('Hay que tratar a 13 pacientes para prevenir 1 evento');
    await expect(cifra(page, 'ARR')).toHaveText(pct('8,0'));
    await expect(cifra(page, 'RRR')).toHaveText(pct('40,0')); // 8/20
  });

  test('N2 — CER = EER: sin efecto, y ninguna frase dice «Infinity»', async ({ page }) => {
    await rellenar(page, [['20', '20'], ['12', '20']]);
    await expect(cifra(page, 'NNT')).toHaveText(num('∞'));
    await expect(page.locator(PANEL)).not.toContainText('Infinity', { timeout: 2000 });
  });

  test('N3 — CER 120 % está fuera de rango y no produce NNT', async ({ page }) => {
    await rellenar(page, [['20', '20'], ['12', '12']]);
    await expect(cifra(page, 'NNT')).toHaveText(num('12,5'));
    await rellenar(page, [['20', '120']]);
    await expect(tarjeta(page, 'NNT')).toHaveCount(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Lo que la página DICE (bloque educativo y JSON-LD) frente a lo que calcula
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Contenido y promesa', () => {
  test('C1 — el aviso «99 % / 99 %» empareja bien prevalencia y VPP (0,1 % → 9 %; 1 % → 50 %)', async ({ page }) => {
    const texto = await page.locator('li', { hasText: 'Ignorar la prevalencia al calcular VPP' }).textContent();
    const prev = texto?.match(/prevalencia de la enfermedad es (\d+(?:,\d+)?)\s?%/)?.[1];
    const vpp = texto?.match(/VPP de solo (\d+(?:,\d+)?)\s?%/)?.[1];
    // Bayes con sens = esp = 0,99: 0,99p / (0,99p + 0,01(1−p)) → p 0,1 % = 9,0 % · p 1 % = 50,0 %
    const esperado: Record<string, string> = { '0,1': '9', '1': '50' };
    expect(prev, 'no se encuentra la prevalencia en el texto').toBeDefined();
    expect(vpp).toBe(esperado[prev ?? '']);
  });

  test('C2 — el IC del OR del «Epidemiólogo» coincide con el que da la propia calculadora (6,71 – 15,08)', async ({ page }) => {
    const texto = (await page.locator('p', { hasText: /IC 95\s?% OR/ }).textContent()) ?? '';
    const m = texto.match(/IC 95\s?% OR:\s*\[?(\d+,\d+)\s*[–-]\s*(\d+,\d+)/);
    expect(m, 'no se encuentra el IC en el texto').not.toBeNull();
    const aNumero = (s: string): number => Number(s.replace(',', '.'));
    expect(aNumero(m?.[1] ?? 'NaN')).toBeCloseTo(6.71, 1);
    expect(aNumero(m?.[2] ?? 'NaN')).toBeCloseTo(15.08, 1);
  });

  test('C3 — el FAQPage no pide VP/FP/FN/VN para calcular el OR y el RR', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
      .find((j) => j['@type'] === 'FAQPage');
    const p = faq?.mainEntity?.find((q) => /odds ratio y el riesgo relativo/i.test(q.name));
    expect(p, 'no se encuentra la pregunta del OR/RR').toBeDefined();
    expect(p?.acceptedAnswer.text ?? '').not.toMatch(/verdaderos positivos|\(VP\)/);
  });

  test('C4 — lo que promete el JSON-LD (IC 95 % en el NNT, RRR en epidemiología) está en pantalla', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.map((b) => JSON.parse(b) as { '@type'?: string; featureList?: string[] })
      .find((j) => j['@type'] === 'WebApplication');
    const rasgos = app?.featureList ?? [];
    expect(rasgos.length).toBeGreaterThan(0);
    if (rasgos.some((f) => /NNT/.test(f) && /IC 95/.test(f))) {
      await modo(page, /^NNT Directo/);
      await rellenar(page, [['20', '20'], ['12', '12']]);
      await expect(cifra(page, 'NNT')).toHaveText(num('12,5'));
      await expect(page.locator(PANEL)).toContainText('IC 95', { timeout: 2000 });
    }
    if (rasgos.some((f) => /epidemiol/i.test(f) && /RRR/.test(f))) {
      await modo(page, /^Epidemiología/);
      await rellenar(page, epi('120', '1380', '30', '3470'));
      await expect(page.locator(`${PANEL} [class*="resultLabel"]`, { hasText: /^RR[RI]$/ })).toHaveCount(1, { timeout: 2000 });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Accesibilidad
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Accesibilidad', () => {
  test('A1 — los dos campos del modo NNT se encuentran por su rótulo visible', async ({ page }) => {
    await modo(page, /^NNT Directo/);
    await expect(page.locator('input[placeholder="20"]')).toBeVisible();
    await expect(page.getByLabel('Tasa de eventos en grupo control (CER)')).toHaveCount(1, { timeout: 2000 });
    await expect(page.getByLabel('Tasa de eventos en grupo experimental (EER)')).toHaveCount(1, { timeout: 2000 });
  });

  test('A2 — las celdas de la tabla epidemiológica dicen qué son (no solo «a», «b», «c», «d»)', async ({ page }) => {
    await modo(page, /^Epidemiología/);
    // Desde el 07/10/2026 son campos de texto (inputMode numérico) leídos con parseSpanishNumber
    await expect(page.getByRole('textbox')).toHaveCount(4);
    await expect(page.getByRole('textbox', { name: /expuesto/i })).toHaveCount(4, { timeout: 2000 });
  });

  test('A3 — «Cargar ejemplo» (texto blanco sobre el azul de marca) llega a 4,5:1 en claro', async ({ page }) => {
    const ratio = await page.getByRole('button', { name: 'Cargar ejemplo' }).evaluate((el) => {
      const rgb = (s: string): number[] => (s.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
      const lin = (c: number): number => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = ([r, g, b]: number[]): number => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const cs = getComputedStyle(el);
      const a = lum(rgb(cs.color)), b = lum(rgb(cs.backgroundColor));
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('A4 — el modo activo no pierde su fondo al pasar el ratón por encima', async ({ page }) => {
    // Forma transversal del catálogo (`.modeBtn:hover` que pisa al activo). Aquí NO ocurre:
    // el :hover solo toca borde y desplazamiento. Queda como candado de regresión.
    const activo = page.getByRole('button', { name: /^Pruebas Diagnósticas/ });
    await expect(activo).toHaveAttribute('aria-pressed', 'true');
    const fondo = (): Promise<string> => activo.evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.mouse.move(0, 0);
    const antes = await fondo();
    await activo.hover();
    await expect.poll(fondo).toBe(antes);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Móvil (390 px)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en móvil (390 px)', () => {
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('M1 — D1 calcula igual en móvil', async ({ page }) => {
    await rellenar(page, tabla('90', '10', '20', '180'));
    await expect(cifra(page, 'Sensibilidad')).toHaveText(pct('81,8'));
    await expect(cifra(page, 'LR+')).toHaveText(num('15,55'));
    await expect(cifra(page, 'Sensibilidad')).toBeVisible();
  });

  test('M2 — los paneles de entrada y resultados caben en la pantalla (sin desbordar a 405 px)', async ({ page }) => {
    await expect(page.locator('[class*="inputPanel"]')).toBeVisible();
    const medida = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      entrada: document.querySelector('[class*="inputPanel"]')?.getBoundingClientRect().right ?? 0,
      resultados: document.querySelector('[class*="resultsPanel"]')?.getBoundingClientRect().right ?? 0,
      ancho: window.innerWidth,
    }));
    expect(medida.ancho).toBe(390);
    expect(medida.entrada).toBeGreaterThan(0);
    expect(medida.body).toBeLessThanOrEqual(390);
    expect(medida.entrada).toBeLessThanOrEqual(390);
    expect(medida.resultados).toBeLessThanOrEqual(390);
  });
});
