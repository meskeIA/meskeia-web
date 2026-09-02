import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — estimador-sueldo-neto (segmento fiscal, RIESGO 1 CRÍTICO, 17 usos)
 * Inspeccionada el 31/08/2026.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Estimador Sueldo Neto ↔ Bruto»
 *   sub.  «Oriéntate sobre tu salario bruto a neto o viceversa. IRPF y Seguridad
 *          Social para España 2025.»
 *   Bloque educativo: paso de salario bruto anual a neto = IRPF (por tramos,
 *   tras gastos deducibles art. 19, reducción art. 20 y deducción art. 80 bis)
 *   + cotizaciones SS del trabajador (6,50 % sobre la base de cotización).
 *
 * De dónde sale cada cifra esperada — TODO de `data/fiscal/irpf.ts` (única
 * fuente que la app importa, vía `@/data/fiscal`), NUNCA de memoria propia:
 *   · TRAMOS_IRPF_2025            — 19/24/30/37/45/47 % (Ley 35/2006 art. 63)
 *   · MINIMOS_IRPF_2025.personal  — 5.550 € (soltero, sin hijos)
 *   · GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral — 2.000 € (art. 19.2.f)
 *   · REDUCCION_RENDIMIENTOS_TRABAJO_2025 — art. 20 LIRPF (RNT ≥ 16.825 € → 2.364 €)
 *   · DEDUCCION_RENTAS_BAJAS_2025 (vía calcularDeduccionRentasBajas) — art. 80 bis
 *     (0 € cuando el RNT supera 18.276 €, como en los dos casos siguientes)
 *   · COTIZACIONES_SS_2026 — 4,70 + 1,55 + 0,10 + 0,15 = 6,50 % trabajador
 *     (Orden PJC/297/2026, DT 38ª LGSS)
 *   · BASES_SS_2026 — mínima 1.424,40 €/mes, máxima 5.101,20 €/mes
 *
 * CASOS (resueltos a mano ANTES de ejecutar la app; ver aritmética íntegra
 * en el comentario de cada test)
 * ────────────────────────────────────────────────────────────────────────
 *   CASO 1 (normal) — 30.000 € brutos, soltero/a, 0 hijos, 12 pagas
 *       SS anual 1.950,00 € (base 2.500 €/mes, dentro de mínima-máxima)
 *       RNT 26.050 € (≥ 16.825 → reducción art.20 = 2.364 €)
 *       base liquidable 18.136 € → IRPF 3.730,14 € (tramos 19 %/24 %)
 *       neto anual 24.319,86 €
 *
 *   CASO 2 (límite) — 120.000 € brutos, soltero/a, 0 hijos, 12 pagas
 *       mensual 10.000 €/mes > máxima 5.101,20 €/mes → base de cotización
 *       SE CLAVA en la máxima → SS anual 3.978,94 € (no crece más con el bruto)
 *       IRPF 38.649,68 € (tramos hasta el 45 %, base liquidable 106.107,06 €)
 *       neto anual 77.371,39 €
 *
 *   CASO 3 (reparado, hallazgo 559) — campo vacío (Calcular sin escribir nada)
 *       frente a «-5000» (negativo, control). `NumberInput` filtra bien las
 *       letras (regex `/^-?[\d.,]*$/` del onChange impide que «abc» llegue a
 *       escribirse), así que la vía real de disparo era el campo vacío: el
 *       estado inicial de la página, o tras «Limpiar». `parseSpanishNumber('')`
 *       da NaN, y la guarda ERA `if (salarioNum <= 0) alert(...)` — `NaN <= 0`
 *       es FALSE en JS, así que no atrapaba el vacío. Ahora la guarda es
 *       `if (!(salarioNum > 0)) alert(...)`: `!(NaN > 0)` es TRUE (NaN > 0 es
 *       FALSE), así que el vacío dispara el aviso igual que el negativo.
 *
 * ── Re-inspección independiente 31/08/2026 ──────────────────────────────────
 * Los 5 tests de arriba se re-ejecutaron sin tocar el código de la app: los 5
 * siguen en verde. Además de repetir CASO 1 (30.000 €) con 80.000 € (tope de
 * BASES_SS_2026.maxima + entra en el tramo del 45 %) como segundo ancla al
 * mismo caso límite, esta ronda encontró un hallazgo nuevo (hallazgo 569, ver
 * test más abajo): el selector «Casado/a (un solo ingreso)» no aplicaba
 * ninguna reducción frente a «Soltero/a».
 *
 * ── Reparado 02/09/2026 (hallazgo 569) ───────────────────────────────────────
 * `data/fiscal/irpf.ts` gana `REDUCCION_TRIBUTACION_CONJUNTA_2025` (art. 84.2.4º
 * LIRPF: 3.400 €/año biparental con un solo perceptor, 2.150 €/año monoparental)
 * y `calcularMinimosPersonales` la aplica según `situacion`. El caso monoparental
 * ya sumaba 2.150 € a mano; ahora sale de la misma constante centralizada.
 */

const RUTA = '/estimador-sueldo-neto/';

/** `formatCurrency` separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Valor de una tarjeta `ResultCard` («Salario Bruto Anual», «Neto Mensual (12 pagas)»…). */
async function valorTarjeta(page: Page, titulo: string): Promise<string> {
  const h3 = page.getByRole('heading', { level: 3, name: titulo, exact: true });
  const valor = h3.locator('xpath=../following-sibling::div[1]//p');
  return limpiar(await valor.innerText());
}

/** Importe de una fila del desglose («Retención IRPF anual», «Contingencias comunes (4,70%)»…). */
async function filaDesglose(page: Page, etiquetaExacta: string): Promise<string> {
  const fila = page.locator(`css=div:has(> span:text-is("${etiquetaExacta}"))`).first();
  return limpiar(await fila.locator('span').nth(1).innerText());
}

async function calcular(page: Page, salario: string): Promise<void> {
  const campo = page.getByPlaceholder('30000');
  await campo.fill(salario);
  await expect(campo).toHaveValue(salario);
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
}

async function limpiarFormulario(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
}

async function hayResultados(page: Page): Promise<boolean> {
  return (await page.getByRole('heading', { level: 3, name: 'Salario Neto Anual', exact: true }).count()) > 0;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador Sueldo Neto ↔ Bruto');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 (normal) · 30.000 € brutos, soltero/a, 0 hijos, 12 pagas', async ({ page }) => {
  await calcular(page, '30000');
  expect(await hayResultados(page)).toBe(true);

  // Tarjetas principales
  expect(await valorTarjeta(page, 'Salario Bruto Anual')).toBe('30.000,00€');
  expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('24.319,86€');
  expect(await valorTarjeta(page, 'Bruto Mensual (12 pagas)')).toBe('2500,00€');
  expect(await valorTarjeta(page, 'Neto Mensual (12 pagas)')).toBe('2026,66€');

  // IRPF — TRAMOS_IRPF_2025: 19 % hasta 12.450 € + 24 % hasta 18.136 €
  // (base liquidable = RNT 26.050 € - reducción art.20 2.364 € - mínimo 5.550 €)
  // 12.450 × 0,19 = 2.365,50 € · 5.686 × 0,24 = 1.364,64 € → 3.730,14 €
  expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('3730,14 €');
  expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('12,43%');

  // Seguridad Social — COTIZACIONES_SS_2026 sobre base 2.500 €/mes (sin tope)
  expect(await filaDesglose(page, 'Contingencias comunes (4,70%)')).toBe('1410,00 €'); // 2.500×4,70%×12
  expect(await filaDesglose(page, 'Desempleo (1,55%)')).toBe('465,00 €');              // 2.500×1,55%×12
  expect(await filaDesglose(page, 'Formación profesional (0,10%)')).toBe('30,00 €');   // 2.500×0,10%×12
  expect(await filaDesglose(page, 'MEF - Equidad Intergeneracional (0,15%)')).toBe('45,00 €'); // 2.500×0,15%×12
  expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('1950,00 €');

  // Resumen — 3.730,14 + 1.950,00 = 5.680,14 € · sobre 30.000 € = 18,93 %
  expect(await filaDesglose(page, 'Total deducciones anuales')).toBe('5680,14 €');
  expect(await filaDesglose(page, 'Porcentaje sobre bruto')).toBe('18,93%');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 (límite) · 120.000 € brutos: la base de cotización se clava en BASES_SS_2026.maxima', async ({ page }) => {
  await calcular(page, '120000');
  expect(await hayResultados(page)).toBe(true);

  expect(await valorTarjeta(page, 'Salario Bruto Anual')).toBe('120.000,00€');
  expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('77.371,39€');
  expect(await valorTarjeta(page, 'Bruto Mensual (12 pagas)')).toBe('10.000,00€');
  expect(await valorTarjeta(page, 'Neto Mensual (12 pagas)')).toBe('6447,62€');

  // 10.000 €/mes > BASES_SS_2026.maxima (5.101,20 €/mes) → la base de cotización
  // no sigue subiendo con el bruto: se clava en 5.101,20 €/mes.
  // 5.101,20 × 4,70% × 12 = 2.877,08 € (si no hubiera tope serían 5.640,00 €)
  expect(await filaDesglose(page, 'Contingencias comunes (4,70%)')).toBe('2877,08 €');
  expect(await filaDesglose(page, 'Desempleo (1,55%)')).toBe('948,82 €');
  expect(await filaDesglose(page, 'Formación profesional (0,10%)')).toBe('61,21 €');
  // SS anual = 5.101,20 × 6,50% × 12 = 3.978,94 €
  expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('3978,94 €');

  // IRPF: RNT 114.021,06 € (≥16.825 → reducción 2.364) → base liquidable 106.107,06 €
  // (tras mínimo personal 5.550 €), tramos 19/24/30/37 % completos + resto al 45 %
  // 2.365,50+1.860+4.500+9.176+20.748,18 = 38.649,68 €
  expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('38.649,68 €');
  expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('32,21%');

  // 38.649,68 + 3.978,94 = 42.628,61 € · sobre 120.000 € = 35,52 %
  expect(await filaDesglose(page, 'Total deducciones anuales')).toBe('42.628,61 €');
  expect(await filaDesglose(page, 'Porcentaje sobre bruto')).toBe('35,52%');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 (reparado) · Calcular con el campo VACÍO dispara el mismo aviso que «-5000»', async ({ page }) => {
  const avisos: string[] = [];
  page.on('dialog', async (dialog) => {
    avisos.push(dialog.message());
    await dialog.accept();
  });

  // Control: la guarda SÍ funciona con un negativo (ya lo hacía antes de reparar).
  await calcular(page, '-5000');
  expect(avisos).toEqual(['Por favor, introduce un salario válido']);
  expect(await hayResultados(page)).toBe(false);

  // NumberInput SÍ filtra bien las letras: "abc" nunca llega a escribirse
  // (regex /^-?[\d.,]*$/ del onChange), así que el campo se queda vacío.
  avisos.length = 0;
  await limpiarFormulario(page);
  await page.getByPlaceholder('30000').pressSequentially('abc');
  await expect(page.getByPlaceholder('30000')).toHaveValue('');

  // REPARADO (559) — pulsar Calcular con el campo VACÍO ahora dispara el mismo
  // aviso que el negativo: `!(NaN > 0)` es TRUE, así que la guarda atrapa el
  // vacío y ya no se pinta ningún panel de "resultados" con datos a medias.
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
  expect(avisos).toEqual(['Por favor, introduce un salario válido']);
  expect(await hayResultados(page)).toBe(false);
});

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Hallazgo 560 — la tabla "Tramos IRPF 2025" del bloque educativo, el SMI 2026 (tres
 * apariciones) y la base de cotización conjunta estaban escritos a mano en vez de
 * derivarse de TRAMOS_IRPF_2025 / SMI_2026 / BASES_SS_2026 (data/fiscal). Hoy coinciden
 * exactamente: el test ancla el DOM a esos módulos, no a memoria propia, así que si el
 * dato deja de derivarse (o el módulo cambia y el JSX no lo sigue), este test lo detecta.
 */
test('Hallazgo 560 — la tabla de tramos IRPF y las cifras de SMI/SS del bloque educativo están ancladas a data/fiscal', async ({ page }) => {
  await page.goto(RUTA);
  // El bloque educativo nace colapsado (REGLA #7): hay que abrirlo para que
  // innerText() lo recoja (el contenido está en el DOM pero oculto por CSS).
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  // limpiar(): formatCurrency separa la cifra del € con espacio duro (U+00A0), no ASCII.
  const cuerpo = limpiar(await page.locator('body').innerText());

  // TRAMOS_IRPF_2025, ahora derivada con formatCurrency (2 decimales, antes sin ellos)
  expect(cuerpo).toContain('0,00 €');
  expect(cuerpo).toContain('12.450,00 €');
  expect(cuerpo).toContain('20.200,00 €');
  expect(cuerpo).toContain('35.200,00 €');
  expect(cuerpo).toContain('60.000,00 €');
  expect(cuerpo).toContain('300.000,00 €');
  expect(cuerpo).toContain('En adelante');

  // SMI_2026 (mensual14=1.221, anual=17.094) — antes literal sin decimales.
  // formatCurrency (es-ES) NO agrupa millares en importes de 4 dígitos (1221,00 €),
  // solo desde 5 (17.094,00 €) — mismo comportamiento ya documentado en el spec de
  // simulador-modulos-vs-directa.
  expect(cuerpo).toMatch(/SMI 2026 es de 1221,00 €\/mes en 14 pagas/);
  expect(cuerpo).toMatch(/17\.094,00 € brutos anuales/);
  expect(cuerpo).toContain('Real Decreto 126/2026, de 18 de febrero, publicado en el BOE.');

  // BASES_SS_2026.maxima (5101,20 €/mes — 4 dígitos, sin separador de millares)
  expect(cuerpo).toMatch(/base de cotización máxima conjunta.*5101,20 €\/mes en 2026/);
});

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Hallazgo 561 — los 4 <button> de la app no llevaban type="button" (pasivo pre-23/08,
 * regla obligatoria del CLAUDE.md global §5). Sin <form> envolviendo el formulario no
 * había riesgo real de submit accidental, pero el candado check:a11y-jsx --todo lo
 * detectaría igualmente. Los dos toggles ganan además aria-pressed, al ser botones que
 * conmutan un estado visual.
 */
test('Hallazgo 561 — los 4 botones de la app llevan type="button"', async ({ page }) => {
  await page.goto(RUTA);
  for (const nombre of ['Bruto → Neto', 'Neto → Bruto', 'Calcular', 'Limpiar']) {
    await expect(page.getByRole('button', { name: nombre, exact: true })).toHaveAttribute('type', 'button');
  }
  await expect(page.getByRole('button', { name: 'Bruto → Neto', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Neto → Bruto', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Hallazgo 569 (reparado 02/09/2026) — «Casado/a (un solo ingreso)» debe aplicar
 * la reducción por tributación conjunta del art. 84.2.4º LIRPF (3.400 €/año en
 * la base imponible) frente a «Soltero/a». Con 30.000 € brutos:
 *   RNT 26.050 € - reducción art.20 (2.364 €) = base imponible 23.686 €
 *   Soltero:  base liquidable 23.686 - 5.550          = 18.136 € → IRPF 3.730,14 €
 *   Casado 1: base liquidable 23.686 - (5.550 + 3.400) = 14.736 € → IRPF 2.914,14 €
 *   (12.450 × 19 % + 2.286 × 24 % = 2.365,50 + 548,64 = 2.914,14 €)
 *   Neto casado 1 ingreso = 30.000 - 1.950 (SS) - 2.914,14 = 25.135,86 €
 */
test('Hallazgo 569 (reparado) — «Casado/a (un solo ingreso)» paga menos IRPF que «Soltero/a» por la reducción de tributación conjunta', async ({ page }) => {
  await page.goto(RUTA);
  await calcular(page, '30000');
  const netoSoltero = await valorTarjeta(page, 'Salario Neto Anual');
  const irpfSoltero = await filaDesglose(page, 'Retención IRPF anual');
  expect(netoSoltero).toBe('24.319,86€');
  expect(irpfSoltero).toBe('3730,14 €');

  await limpiarFormulario(page);
  await page.locator('select').first().selectOption({ label: 'Casado/a (un solo ingreso)' });
  await calcular(page, '30000');
  const netoCasadoUnIngreso = await valorTarjeta(page, 'Salario Neto Anual');
  const irpfCasadoUnIngreso = await filaDesglose(page, 'Retención IRPF anual');

  // Reparado: ya NO coinciden con el soltero, y el importe es el que exige el art. 84.2.4º.
  expect(irpfCasadoUnIngreso).toBe('2914,14 €');
  expect(netoCasadoUnIngreso).toBe('25.135,86€');
  expect(netoCasadoUnIngreso).not.toBe(netoSoltero);
});
