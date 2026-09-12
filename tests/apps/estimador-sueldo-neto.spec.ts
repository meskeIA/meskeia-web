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
 *   · REDUCCION_RENDIMIENTOS_TRABAJO_2025 — art. 20 LIRPF (RNT ≥ 19.747,5 € → 0 €)
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
 *       RNT 26.050 € (≥ 19.747,5 → reducción art.20 = 0 €)
 *       base liquidable 26.050 € → IRPF 4.926,00 € (escala menos escala del mínimo)
 *       neto anual 23.124,00 €
 *
 *   CASO 2 (límite) — 120.000 € brutos, soltero/a, 0 hijos, 12 pagas
 *       mensual 10.000 €/mes > máxima 5.101,20 €/mes → base de cotización
 *       SE CLAVA en la máxima → SS anual 3.978,94 € (no crece más con el bruto)
 *       IRPF 41.156,48 € (tramos hasta el 45 %, base liquidable 114.021,06 €)
 *       neto anual 74.864,59 €
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
 * `data/fiscal/irpf.ts` gana `REDUCCION_TRIBUTACION_CONJUNTA_2025` (art. 84.2, reglas
 * 3ª y 4ª LIRPF: 3.400 €/año biparental con un solo perceptor, 2.150 €/año monoparental)
 * y la app la aplica según `situacion`. El caso monoparental ya sumaba 2.150 € a mano;
 * ahora sale de la misma constante centralizada.
 *
 * ── Goldens recalculados 12/09/2026 — DOS correcciones, ninguna cosmética ─────
 * Los tres tests de importes aparecieron en rojo en la suite del 11/09. Al recalcularlos
 * a mano contra la fuente (no contra lo que la app devuelve hoy) resultó que la primera
 * corrección ya estaba hecha en el código y la segunda no:
 *
 * 1. REDUCCIÓN DEL ART. 20 — el test estaba desfasado, la app calculaba bien.
 *    El commit 2b80033d (09/09/2026) retiró de data/fiscal la reducción residual de
 *    2.364 € para todo RNT ≥ 16.825 €. Verificado en sesión el 12/09/2026 contra la AEAT
 *    (Manual práctico Renta 2025, cap. 3, «Fase 3ª: determinación del rendimiento neto
 *    reducido»): esa reducción residual NO EXISTE. La escala tiene dos tramos decrecientes
 *    —7.302 € hasta 14.852 €, menos 1,75 hasta 17.673,52 €, menos 1,14 hasta 19.747,5 €—
 *    y a partir de 19.747,5 € vale CERO. Los dos casos de aquí (RNT 26.050 € y 114.021 €)
 *    están muy por encima, así que su reducción es 0 y la base sube en 2.364 €.
 *
 * 2. MÍNIMO PERSONAL Y FAMILIAR — aquí el defecto estaba en la APP, y se reparó.
 *    La app restaba el mínimo DE LA BASE antes de aplicar la escala, lo que lo valora al
 *    tipo marginal. El art. 63.1.2º LIRPF dice que el mínimo «no reduce la renta»: forma
 *    parte de la base liquidable general y se grava a tipo cero aplicando la escala dos
 *    veces y restando la cuota del mínimo de la cuota de la base. Subestimaba la cuota en
 *    610,50 € (30.000 € de bruto) y 1.054,50 € (120.000 €). Es el mismo hallazgo que el
 *    commit 2b80033d reparó en seis motores de `lib/calculadoras`; esta app quedó fuera
 *    porque su cálculo vive en la propia página.
 *    De paso, la reducción por tributación conjunta dejó de sumarse al mínimo: el art. 84.2
 *    dice «la base imponible se reducirá», así que es reducción de BASE y se valora al
 *    marginal, no a tipo cero. Sumarla al mínimo le daba el tratamiento del otro.
 *
 * La aritmética íntegra de cada caso, ya con las dos correcciones, va en su test.
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
  expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('23.124,00€');
  expect(await valorTarjeta(page, 'Bruto Mensual (12 pagas)')).toBe('2500,00€');
  expect(await valorTarjeta(page, 'Neto Mensual (12 pagas)')).toBe('1927,00€');

  // IRPF — base liquidable = RNT 26.050 € − reducción art.20 (0 €, el RNT supera los
  // 19.747,5 € en que se agota) = 26.050 €. El mínimo personal NO se resta de la base:
  // art. 63.1.2º, escala a la base completa menos escala al mínimo.
  //   escala(26.050) = 12.450×19 % + 7.750×24 % + 5.850×30 %
  //                  = 2.365,50 + 1.860,00 + 1.755,00 = 5.980,50 €
  //   escala(5.550)  = 5.550×19 %                     = 1.054,50 €
  //   cuota          = 5.980,50 − 1.054,50            = 4.926,00 €
  // Deducción art. 80 bis: 0 € (el RNT de 26.050 € supera el límite de 18.276 €).
  expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('4926,00 €');
  expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('16,42%');

  // Seguridad Social — COTIZACIONES_SS_2026 sobre base 2.500 €/mes (sin tope)
  expect(await filaDesglose(page, 'Contingencias comunes (4,70%)')).toBe('1410,00 €'); // 2.500×4,70%×12
  expect(await filaDesglose(page, 'Desempleo (1,55%)')).toBe('465,00 €');              // 2.500×1,55%×12
  expect(await filaDesglose(page, 'Formación profesional (0,10%)')).toBe('30,00 €');   // 2.500×0,10%×12
  expect(await filaDesglose(page, 'MEF - Equidad Intergeneracional (0,15%)')).toBe('45,00 €'); // 2.500×0,15%×12
  expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('1950,00 €');

  // Resumen — 4.926,00 + 1.950,00 = 6.876,00 € · sobre 30.000 € = 22,92 %
  expect(await filaDesglose(page, 'Total deducciones anuales')).toBe('6876,00 €');
  expect(await filaDesglose(page, 'Porcentaje sobre bruto')).toBe('22,92%');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 (límite) · 120.000 € brutos: la base de cotización se clava en BASES_SS_2026.maxima', async ({ page }) => {
  await calcular(page, '120000');
  expect(await hayResultados(page)).toBe(true);

  expect(await valorTarjeta(page, 'Salario Bruto Anual')).toBe('120.000,00€');
  expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('74.864,59€');
  expect(await valorTarjeta(page, 'Bruto Mensual (12 pagas)')).toBe('10.000,00€');
  expect(await valorTarjeta(page, 'Neto Mensual (12 pagas)')).toBe('6238,72€');

  // 10.000 €/mes > BASES_SS_2026.maxima (5.101,20 €/mes) → la base de cotización
  // no sigue subiendo con el bruto: se clava en 5.101,20 €/mes.
  // 5.101,20 × 4,70% × 12 = 2.877,08 € (si no hubiera tope serían 5.640,00 €)
  expect(await filaDesglose(page, 'Contingencias comunes (4,70%)')).toBe('2877,08 €');
  expect(await filaDesglose(page, 'Desempleo (1,55%)')).toBe('948,82 €');
  expect(await filaDesglose(page, 'Formación profesional (0,10%)')).toBe('61,21 €');
  // SS anual = 5.101,20 × 6,50% × 12 = 3.978,94 €
  expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('3978,94 €');

  // IRPF: RNT 114.021,06 € (muy por encima de 19.747,5 → reducción art.20 = 0) →
  // base liquidable 114.021,06 €, con los tramos 19/24/30/37 % completos + resto al 45 %:
  //   escala(114.021,06) = 2.365,50 + 1.860,00 + 4.500,00 + 9.176,00 + 24.309,48
  //                      = 42.210,98 €
  //   escala(5.550)      = 1.054,50 €   ← el mínimo, a tipo cero (art. 63.1.2º)
  //   cuota              = 42.210,98 − 1.054,50 = 41.156,48 €
  // Nótese que el mínimo vale aquí lo mismo que en el CASO 1 (1.054,50 €): ese es
  // justamente el efecto que persigue el art. 63.1.2º y el que el cálculo viejo rompía.
  expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('41.156,48 €');
  expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('34,30%');

  // 41.156,48 + 3.978,94 = 45.135,41 € · sobre 120.000 € = 37,61 %
  expect(await filaDesglose(page, 'Total deducciones anuales')).toBe('45.135,41 €');
  expect(await filaDesglose(page, 'Porcentaje sobre bruto')).toBe('37,61%');
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
 * la reducción por tributación conjunta del art. 84.2.3ª LIRPF (3.400 €/año en
 * la base imponible) frente a «Soltero/a». Con 30.000 € brutos, y ya con los goldens
 * recalculados el 12/09 (reducción del art. 20 = 0 y mínimo a tipo cero):
 *   RNT 26.050 € − reducción art.20 (0 €) = base imponible 26.050 €
 *   Soltero:  base liquidable 26.050 € → escala 5.980,50 − 1.054,50 = IRPF 4.926,00 €
 *   Casado 1: base liquidable 26.050 − 3.400 = 22.650 € (la reducción del art. 84.2 SÍ
 *             va contra la base) → escala 4.960,50 − 1.054,50 = IRPF 3.906,00 €
 *             (12.450×19 % + 7.750×24 % + 2.450×30 % = 2.365,50 + 1.860 + 735)
 *   Neto casado 1 ingreso = 30.000 − 1.950 (SS) − 3.906,00 = 24.144,00 €
 *   Ahorro = 1.020 €, que es el 30 % (tipo marginal) de los 3.400 € de reducción.
 */
test('Hallazgo 569 (reparado) — «Casado/a (un solo ingreso)» paga menos IRPF que «Soltero/a» por la reducción de tributación conjunta', async ({ page }) => {
  await page.goto(RUTA);
  await calcular(page, '30000');
  const netoSoltero = await valorTarjeta(page, 'Salario Neto Anual');
  const irpfSoltero = await filaDesglose(page, 'Retención IRPF anual');
  expect(netoSoltero).toBe('23.124,00€');
  expect(irpfSoltero).toBe('4926,00 €');

  await limpiarFormulario(page);
  await page.locator('select').first().selectOption({ label: 'Casado/a (un solo ingreso)' });
  await calcular(page, '30000');
  const netoCasadoUnIngreso = await valorTarjeta(page, 'Salario Neto Anual');
  const irpfCasadoUnIngreso = await filaDesglose(page, 'Retención IRPF anual');

  // Reparado: ya NO coinciden con el soltero, y el importe es el que exige el art. 84.2.3ª.
  expect(irpfCasadoUnIngreso).toBe('3906,00 €');
  expect(netoCasadoUnIngreso).toBe('24.144,00€');
  expect(netoCasadoUnIngreso).not.toBe(netoSoltero);
});
