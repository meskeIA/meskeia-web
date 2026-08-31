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
 *   CASO 3 (rechazo) — campo vacío (Calcular sin escribir nada) frente a
 *       «-5000» (negativo, control)
 *       `NumberInput` sí filtra bien las letras: el regex `/^-?[\d.,]*$/` de
 *       su onChange impide que «abc» llegue a escribirse (el campo se queda
 *       vacío). Pero pulsar Calcular con el campo VACÍO — el estado inicial
 *       de la página, o tras «Limpiar» — SÍ es alcanzable sin escribir nada
 *       raro, y ahí está el hallazgo: `parseSpanishNumber('')` da NaN, y la
 *       guarda del botón es `if (salarioNum <= 0) alert(...)`. `NaN <= 0` es
 *       FALSE en JS, así que la guarda NO atrapa el campo vacío: no salta
 *       ningún alert y se pinta un panel de resultados con «No definido» en
 *       casi todos los campos, pero «Tipo de retención efectivo: 0,00 %» —
 *       una cifra que parece un resultado válido y no lo es. Con «-5000» sí
 *       funciona: `-5000 <= 0` es TRUE y salta el alert correcto.
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
test('CASO 3 (rechazo) · Calcular con el campo VACÍO no dispara el aviso que sí dispara «-5000»', async ({ page }) => {
  const avisos: string[] = [];
  page.on('dialog', async (dialog) => {
    avisos.push(dialog.message());
    await dialog.accept();
  });

  // Control: la guarda `salarioNum <= 0` SÍ funciona con un negativo.
  await calcular(page, '-5000');
  expect(avisos).toEqual(['Por favor, introduce un salario válido']);
  expect(await hayResultados(page)).toBe(false);

  // NumberInput SÍ filtra bien las letras: "abc" nunca llega a escribirse
  // (regex /^-?[\d.,]*$/ del onChange), así que el campo se queda vacío.
  avisos.length = 0;
  await limpiarFormulario(page);
  await page.getByPlaceholder('30000').pressSequentially('abc');
  await expect(page.getByPlaceholder('30000')).toHaveValue('');

  // HALLAZGO — pero pulsar Calcular con el campo VACÍO (el estado inicial de
  // la página, alcanzable sin escribir nada raro) sí cuela: parseSpanishNumber('')
  // da NaN, y `NaN <= 0` es FALSE en JS. La guarda no dispara ningún alert() y
  // la app pinta un panel de resultados con «No definido» en casi todo, pero
  // con un «0,00 %» de retención que parece un cálculo real y no lo es.
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
  expect(avisos).toEqual([]); // no salta ningún alert, a diferencia del negativo
  expect(await hayResultados(page)).toBe(true); // pero SÍ se pinta un panel de "resultados"

  expect(await valorTarjeta(page, 'Salario Bruto Anual')).toBe('No definido€');
  expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('No definido€');
  expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('No definido');
  // La cifra engañosa: no es "No definido", es un 0,00% que parece un cálculo real.
  expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('0,00%');
});
