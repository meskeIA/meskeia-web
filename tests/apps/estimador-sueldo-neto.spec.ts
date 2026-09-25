import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';
import { parseSpanishNumber } from '../../lib/formatters';

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
 *   · DEDUCCION_RENDIMIENTOS_TRABAJO_2026 (vía calcularDeduccionRentasBajas) — DA 61.ª
 *     LIRPF, redacción del RDL 5/2026 (0 € con íntegros ≥ 20.048,45 €, como en los dos casos
 *     siguientes)
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
 *    610,50 € (30.000 € de bruto). Es el mismo hallazgo que el commit 2b80033d reparó en
 *    seis motores de `lib/calculadoras`; esta app quedó fuera porque su cálculo vive en la
 *    propia página.
 *
 *    ⚠️ Corregido el 12/09/2026 lo que esta misma cabecera decía del caso de 120.000 €: el
 *    error NO eran 1.054,50 € sino 1.443,00 €. Los 1.054,50 € son la cuota del propio mínimo
 *    (5.550 × 19 %), no lo que se dejaba de cobrar. El error es 5.550 × (marginal − 19 %), y
 *    con el marginal en el 45 % da 1.443,00 €: es el TECHO del defecto, y se alcanza ya con
 *    80.000 € de bruto. Medido con la escala en la mano, no con la app.
 *    De paso, la reducción por tributación conjunta dejó de sumarse al mínimo: el art. 84.2
 *    dice «la base imponible se reducirá», así que es reducción de BASE y se valora al
 *    marginal, no a tipo cero. Sumarla al mínimo le daba el tratamiento del otro.
 *
 * La aritmética íntegra de cada caso, ya con las dos correcciones, va en su test.
 *
 * ── Re-inspección 25/09/2026 (INVALIDADA por 1a4072d9, 24/09/2026) ────────────
 * Motivo: la deducción por obtención de rendimientos del trabajo pasó a ser la DA 61.ª
 * sobre los ÍNTEGROS con las cuantías de 2026 (DEDUCCION_RENDIMIENTOS_TRABAJO_2026:
 * 590,89 € hasta 17.094 €, 590,89 − 0,2 × exceso, 0 € desde 20.048,45 €; art. 28 del
 * RDL 5/2026, BOE-A-2026-3810), con tope en la cuota íntegra GENERAL
 * (limitarDeduccionRendimientosTrabajo), y la base de cotización perdió el suelo de la
 * base mínima de jornada completa.
 *
 * Spec previo ejecutado TAL CUAL antes de tocarlo: 7 de 7 en verde. Ningún valor esperado
 * quedó desfasado: los CASOS 1 y 2 caen fuera de la zona de la DA 61.ª (íntegros ≥
 * 20.048,45 €) y por encima de la base mínima, y el CASO 0 ya se escribió con 1a4072d9.
 * Los arreglos 559, 560, 561 y 569 siguen en pie.
 *
 * Lo que cambia en el fichero: `calcular()` ya no se fía del valor del DOM (`toHaveValue`)
 * sino del estado de React (`esperarValorEnReact`), y cada `goto` espera a la hidratación
 * (`esperarHidratacion`), como manda `tests/apps/_hidratacion.ts`.
 *
 * Casos nuevos, resueltos a mano contra data/fiscal ANTES de ejecutar la app (bloque
 * «Re-inspección 25/09/2026» más abajo): 42.000 € en 14 pagas (normal, desglose entero),
 * 18.600 € (DA 61.ª parcial), 17.600 € (DA 61.ª topada en la cuota), 9.000 € (bajo el SMI,
 * sin suelo de base), tres idas y vueltas Neto→Bruto y los cuatro rechazos (vacío, 0,
 * negativo e «30.000.50»). El motor cuadró al céntimo en todos.
 * Los hallazgos abiertos van al final como `test.fail()`: afirman lo que DEBERÍA pasar.
 *
 * ── Reparados 25/09/2026 (hallazgos 1651-1660) ───────────────────────────────
 * El motor salió de page.tsx a `app/estimador-sueldo-neto/motor.ts`, y de él beben ahora la
 * calculadora, la tabla «12 vs 14 pagas», los cuatro perfiles, el ejemplo del SMI y las
 * horquillas del FAQPage (metadata.ts): ninguna cifra del bloque educativo puede volver a
 * contradecir a la calculadora. El ejemplo práctico grava el mínimo a tipo cero; el año
 * sale de FISCAL_IRPF_META.vigencia; los límites de la obligación de declarar, de
 * OBLIGACION_DECLARAR_2025. Los diez `test.fail()` son ya tests normales.
 */

const RUTA = '/estimador-sueldo-neto/';
/** El campo del salario: NumberInput no lleva id estable, pero sí este placeholder. */
const CAMPO = 'input[placeholder="30000"]';

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

/** Cuántas filas del desglose llevan esa etiqueta (0 si la app no la pinta). */
async function cuentaFilas(page: Page, etiquetaExacta: string): Promise<number> {
  return page.locator(`css=div:has(> span:text-is("${etiquetaExacta}"))`).count();
}

async function calcular(page: Page, salario: string): Promise<void> {
  const campo = page.locator(CAMPO);
  await campo.fill(salario);
  // El ESTADO de React, no el DOM: si la app aún no hubiera hidratado, el DOM mostraría la
  // cifra y el cálculo se haría con la anterior (ver tests/apps/_hidratacion.ts).
  await esperarValorEnReact(page, CAMPO, salario);
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
}

async function limpiarFormulario(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
}

async function hayResultados(page: Page): Promise<boolean> {
  return (await page.getByRole('heading', { level: 3, name: 'Salario Neto Anual', exact: true }).count()) > 0;
}

/** «42.000,01€» → 42000.01, con el parser canónico. */
async function numeroTarjeta(page: Page, titulo: string): Promise<number> {
  return parseSpanishNumber((await valorTarjeta(page, titulo)).replace('€', ''));
}

/** Texto del cuerpo con el bloque educativo abierto (nace colapsado). */
async function cuerpoConGuiaAbierta(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  return limpiar(await page.locator('body').innerText());
}

/** El JSON-LD del FAQPage, tal y como lo sirve el layout. */
async function faqJsonLd(page: Page): Promise<string> {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = scripts.find((s) => s.includes('"FAQPage"'));
  if (!faq) throw new Error('La página no sirve ningún JSON-LD de tipo FAQPage');
  return faq;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador Sueldo Neto ↔ Bruto');
  await esperarHidratacion(page, [CAMPO]);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 0 · DA 61.ª de 2026: 19.000 € brutos deducen 209,69 € (590,89 − 0,2 × 1.906)', async ({ page }) => {
  // SS 2026: 19.000 / 12 = 1.583,33 €/mes × 6,50 % × 12 = 1.235,00 €
  // RNT = 19.000 − 1.235 − 2.000 = 15.765,00 € → reducción art. 20 = 7.302 − 1,75 × 913 = 5.704,25 €
  // Base = 10.060,75 € → cuota = (10.060,75 − 5.550) × 19 % = 857,04 € (primer tramo entero)
  // Deducción DA 61.ª, redacción de 2026 (art. 28 del RDL 5/2026), sobre los ÍNTEGROS:
  //   590,89 − 0,2 × (19.000 − 17.094) = 209,69 € → IRPF = 857,04 − 209,69 = 647,35 €
  // Hasta el 24/09/2026 la app aplicaba la de 2025 sobre el NETO: 340 × (1 − 913 / 3.424) =
  //   249,34 € → 607,70 € de IRPF.
  await calcular(page, '19000');
  expect(await filaDesglose(page, 'Deducción por rendimientos del trabajo')).toBe('-209,69 €');
  expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('647,35 €');
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
  // Deducción DA 61.ª: 0 € (30.000 € íntegros superan los 20.048,45 € de 2026).
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
  await esperarHidratacion(page, [CAMPO]);
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
  await esperarHidratacion(page, [CAMPO]);
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
  await esperarHidratacion(page, [CAMPO]);
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

// ═════════════════════════════════════════════════════════════════════════════
// Re-inspección 25/09/2026 — casos resueltos a mano contra data/fiscal/irpf.ts
// ═════════════════════════════════════════════════════════════════════════════
test.describe('Re-inspección 25/09/2026 — DA 61.ª de 2026 y base de cotización sin suelo', () => {
  /**
   * NORMAL · 42.000 € brutos, soltero/a sin hijos, 14 pagas.
   *   SS (COTIZACIONES_SS_2026, base 42.000 / 12 = 3.500 €/mes < BASES_SS_2026.maxima 5.101,20):
   *     contingencias comunes 3.500 × 4,70 % × 12 = 1.974,00 €
   *     desempleo             3.500 × 1,55 % × 12 =   651,00 €
   *     formación profesional 3.500 × 0,10 % × 12 =    42,00 €
   *     MEI                   3.500 × 0,15 % × 12 =    63,00 €   → total 2.730,00 €
   *   RNT = 42.000 − 2.730 − 2.000 (GASTOS_DEDUCIBLES_TRABAJO_2025, art. 19.2.f) = 37.270,00 €
   *   Reducción art. 20 = 0 € (RNT ≥ 19.747,5 €, REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)
   *   Base liquidable general = 37.270,00 € (el mínimo NO se resta: art. 63.1.2.º)
   *   escala(37.270) = 12.450×19 % + 7.750×24 % + 15.000×30 % + 2.070×37 %
   *                  = 2.365,50 + 1.860,00 + 4.500,00 + 765,90 = 9.491,40 €
   *   escala(5.550)  = 1.054,50 € (MINIMOS_IRPF_2025.personal a tipo cero)
   *   cuota = 9.491,40 − 1.054,50 = 8.436,90 € (calcularCuotaIntegraGeneral)
   *   DA 61.ª 2026: 0 € (42.000 ≥ 20.048,45 €, DEDUCCION_RENDIMIENTOS_TRABAJO_2026.limiteMaximo)
   *   Neto = 42.000 − 2.730 − 8.436,90 = 30.833,10 € · /14 = 2.202,36 € · bruto /14 = 3.000,00 €
   *   Tipo efectivo 8.436,90 / 42.000 = 20,09 % · deducciones 11.166,90 € = 26,59 % del bruto
   */
  test('NORMAL · 42.000 € brutos en 14 pagas, soltero/a: desglose completo', async ({ page }) => {
    await page.locator('select').nth(1).selectOption('14');
    await calcular(page, '42000');
    expect(await hayResultados(page)).toBe(true);

    expect(await valorTarjeta(page, 'Salario Bruto Anual')).toBe('42.000,00€');
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('30.833,10€');
    expect(await valorTarjeta(page, 'Bruto Mensual (14 pagas)')).toBe('3000,00€');
    expect(await valorTarjeta(page, 'Neto Mensual (14 pagas)')).toBe('2202,36€');

    expect(await filaDesglose(page, 'Contingencias comunes (4,70%)')).toBe('1974,00 €');
    expect(await filaDesglose(page, 'Desempleo (1,55%)')).toBe('651,00 €');
    expect(await filaDesglose(page, 'Formación profesional (0,10%)')).toBe('42,00 €');
    expect(await filaDesglose(page, 'MEF - Equidad Intergeneracional (0,15%)')).toBe('63,00 €');
    expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('2730,00 €');

    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('8436,90 €');
    expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('20,09%');
    // Fuera de la zona de la DA 61.ª: la fila no se pinta.
    expect(await cuentaFilas(page, 'Deducción por rendimientos del trabajo')).toBe(0);

    expect(await filaDesglose(page, 'Total deducciones anuales')).toBe('11.166,90 €');
    expect(await filaDesglose(page, 'Porcentaje sobre bruto')).toBe('26,59%');
  });

  /**
   * LÍMITE · 18.600 € brutos: dentro del tramo decreciente de la DA 61.ª de 2026.
   *   SS = 18.600 × 6,50 % = 1.209,00 € (1.550 €/mes, sin tope ni suelo)
   *   RNT = 18.600 − 1.209 − 2.000 = 15.391,00 € → reducción art. 20, primer tramo decreciente:
   *     7.302 − 1,75 × (15.391 − 14.852) = 7.302 − 943,25 = 6.358,75 €
   *   Base = 15.391 − 6.358,75 = 9.032,25 € → cuota = (9.032,25 − 5.550) × 19 % = 661,63 €
   *   DA 61.ª (DEDUCCION_RENDIMIENTOS_TRABAJO_2026) sobre los ÍNTEGROS:
   *     590,89 − 0,2 × (18.600 − 17.094) = 590,89 − 301,20 = 289,69 € (< cuota: sin tope)
   *   IRPF = 661,6275 − 289,69 = 371,94 € · neto = 18.600 − 1.209 − 371,94 = 17.019,06 €
   *   Con la redacción de 2025 (340 € hasta 16.576 €, cero desde 18.276 €) la deducción
   *   sería 0 € y el IRPF 661,63 €: la diferencia es la que vigila este caso.
   */
  test('LÍMITE · 18.600 €: la DA 61.ª de 2026 deduce 289,69 € (590,89 − 0,2 × 1.506)', async ({ page }) => {
    await calcular(page, '18600');
    expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('1209,00 €');
    expect(await filaDesglose(page, 'Deducción por rendimientos del trabajo')).toBe('-289,69 €');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('371,94 €');
    expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('2,00%');
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('17.019,06€');
    expect(await filaDesglose(page, 'Total deducciones anuales')).toBe('1580,94 €');
  });

  /**
   * LÍMITE · 17.600 € brutos: la deducción supera la cuota y se topa en ella
   * (limitarDeduccionRendimientosTrabajo: tope = cuota íntegra GENERAL, peso del trabajo 1).
   *   SS = 17.600 × 6,50 % = 1.144,00 € · RNT = 17.600 − 1.144 − 2.000 = 14.456,00 €
   *   Reducción art. 20 = 7.302 € (RNT ≤ 14.852) → base 7.154,00 €
   *   cuota = (7.154 − 5.550) × 19 % = 304,76 €
   *   DA 61.ª: 590,89 − 0,2 × (17.600 − 17.094) = 489,69 € → topada a 304,76 € → IRPF 0,00 €
   *   Neto = 17.600 − 1.144 = 16.456,00 €
   */
  test('LÍMITE · 17.600 €: la deducción de 489,69 € se topa en la cuota íntegra (304,76 €)', async ({ page }) => {
    await calcular(page, '17600');
    expect(await filaDesglose(page, 'Deducción por rendimientos del trabajo')).toBe('-304,76 €');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('0,00 €');
    expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('1144,00 €');
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('16.456,00€');
  });

  /**
   * LÍMITE · 9.000 € brutos, por debajo del SMI anual (SMI_2026.anual = 17.094 €): solo puede
   * ser jornada parcial o parte del año, y se cotiza por lo cobrado (1a4072d9).
   *   Base de cotización = 9.000 / 12 = 750 €/mes (SIN subir a BASES_SS_2026.minima)
   *   contingencias comunes 750 × 4,70 % × 12 = 423,00 € · total 9.000 × 6,50 % = 585,00 €
   *   Con el suelo antiguo: 1.424,40 × 12 × 6,50 % = 1.111,03 € — lo que vigila este caso.
   *   RNT = 9.000 − 585 − 2.000 = 6.415 € → reducción art. 20 = 7.302 € → base 0 → cuota 0
   *   DA 61.ª: 590,89 € topada a la cuota (0 €) → la fila no se pinta · IRPF 0,00 €
   *   Neto = 9.000 − 585 = 8.415,00 € · /12 = 701,25 €
   */
  test('LÍMITE · 9.000 € (bajo el SMI): se cotiza por lo cobrado, 585,00 € y no 1.111,03 €', async ({ page }) => {
    await calcular(page, '9000');
    expect(await filaDesglose(page, 'Contingencias comunes (4,70%)')).toBe('423,00 €');
    expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('585,00 €');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('0,00 €');
    expect(await cuentaFilas(page, 'Deducción por rendimientos del trabajo')).toBe(0);
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('8415,00€');
    expect(await valorTarjeta(page, 'Neto Mensual (12 pagas)')).toBe('701,25€');
  });

  /**
   * IDA Y VUELTA · Neto → Bruto con los netos que la ida dio arriba. La vuelta itera hasta
   * que el neto cuadra a 1 céntimo; en el bruto eso son como mucho 0,01 / (dNeto/dBruto):
   *   · 42.000 €, marginal 37 %: dNeto/dBruto = 0,935 × 0,63 ≈ 0,59 → ±0,02 €
   *   · 18.600 €, zona de la DA 61.ª: 0,935 − (0,19 × 0,935 × 2,75 + 0,2) ≈ 0,25 → ±0,05 €
   *   · 9.000 €, sin IRPF: 0,935 → ±0,01 €
   * Precisión 0 de toBeCloseTo (±0,5 €): el defecto que vigila —una vuelta que no aplique la
   * misma DA 61.ª o el mismo suelo de cotización que la ida— se mide en cientos de euros
   * (sin la deducción, 18.600 € volverían ≈ 1.175 € más arriba; con el suelo viejo, 9.000 €
   * volverían como 9.526,03 €).
   */
  test('IDA Y VUELTA · Neto → Bruto devuelve 42.000, 18.600 y 9.000 € desde sus netos', async ({ page }) => {
    const casos: Array<[string, string, number]> = [
      ['30833,10', '30.833,10€', 42000],
      ['17019,06', '17.019,06€', 18600],
      ['8415', '8415,00€', 9000],
    ];
    await page.getByRole('button', { name: 'Neto → Bruto', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Neto → Bruto', exact: true })).toHaveAttribute('aria-pressed', 'true');
    for (const [neto, netoMostrado, brutoEsperado] of casos) {
      await calcular(page, neto);
      // Tres cálculos seguidos en la misma página: se espera a que la tarjeta sea la de ESTE
      // neto antes de leer el bruto, para no medir el del caso anterior.
      await expect.poll(() => valorTarjeta(page, 'Salario Neto Anual')).toBe(netoMostrado);
      expect(await numeroTarjeta(page, 'Salario Bruto Anual')).toBeCloseTo(brutoEsperado, 0);
    }
  });

  /**
   * RECHAZO · vacío, 0, negativo e ilegible. La guarda es `!(salarioNum > 0)` sobre
   * `parseSpanishNumber`, que devuelve NaN para «30.000.50» (dos puntos que no agrupan
   * millares). «-5000» lo reescribe a 0 el blur de NumberInput (min = 0) y cae igual.
   */
  test('RECHAZO · vacío, «0», «-5000» y «30.000.50» avisan y no pintan resultados', async ({ page }) => {
    const avisos: string[] = [];
    page.on('dialog', async (dialog) => {
      avisos.push(dialog.message());
      await dialog.accept();
    });

    // Vacío: estado inicial de la página.
    await esperarValorEnReact(page, CAMPO, '');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    expect(avisos).toEqual(['Por favor, introduce un salario válido']);
    expect(await hayResultados(page)).toBe(false);

    for (const entrada of ['0', '-5000', '30.000.50']) {
      avisos.length = 0;
      await limpiarFormulario(page);
      await esperarValorEnReact(page, CAMPO, '');
      await calcular(page, entrada);
      expect(avisos, `entrada «${entrada}»`).toEqual(['Por favor, introduce un salario válido']);
      expect(await hayResultados(page), `entrada «${entrada}»`).toBe(false);
    }
    // «30.000.50» se queda como se escribió: no se reinterpreta como 30.000,50 ni 3.000.050.
    await expect(page.locator(CAMPO)).toHaveValue('30.000.50');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Hallazgos 1651-1660 de la re-inspección del 25/09/2026 — REPARADOS el mismo día. Eran
// `test.fail()`; hoy son candados de regresión y deben pasar en verde.
// ═════════════════════════════════════════════════════════════════════════════
test.describe('Hallazgos 1651-1660 (reparados) — re-inspección del 25/09/2026', () => {
  /**
   * ALTO · El bloque educativo publica cifras del modelo viejo (reducción residual de 2.364 €
   * del art. 20, retirada el 09/09 en 2b80033d, y mínimo valorado al marginal, reparado el 12/09
   * en 6dda61c2) que contradicen a la calculadora de la misma página. Con la app:
   *   · 30.000 € (tabla «12 pagas vs 14 pagas»): neto 23.124,00 € e IRPF 410,50 €/mes;
   *     la tabla dice ~24.327 € y ~311 €.
   *   · 22.000 € soltero: base 17.227,65 € y neto 18.112,36 €; el perfil dice 16.206 € y ~18.545 €.
   *   · 35.000 €, dos ingresos, 1 hijo: base 30.725 € y neto 26.852,50 €; el perfil dice 28.362 €
   *     (= 30.725 − 2.364) y ~28.436 €. «Ahorra ~720 €/año vs soltero»: con el mínimo a tipo
   *     cero es 2.400 × 19 % = 456,00 € (IRPF 6.328,50 € soltero frente a 5.872,50 €).
   *   · 80.000 €, dos ingresos: base 74.021,06 € y neto 52.864,59 €; el perfil dice ~71.657 € y ~55.371 €.
   */
  test('bloque educativo — la tabla de 30.000 € y los perfiles cuadran con la calculadora', async ({ page }) => {
    const cuerpo = await cuerpoConGuiaAbierta(page);
    // La tabla es explícitamente «para un sueldo bruto de 30.000 €»: su neto es el del CASO 1.
    expect.soft(cuerpo).toContain('23.124');
    for (const cifraVieja of ['24.327', '~311 €', '16.206', '~18.545', '28.362', '~28.436', '~720 €', '~71.657', '~55.371']) {
      expect.soft(cuerpo, `cifra del modelo viejo «${cifraVieja}»`).not.toContain(cifraVieja);
    }
    // Reparado el 25/09/2026: la tabla y los perfiles salen del mismo motor que la calculadora
    // (app/estimador-sueldo-neto/motor.ts). Cifras recalculadas a mano contra data/fiscal:
    //   · Tabla 30.000 €: neto 23.124,00 € → 1.927,00 €/mes; IRPF 4.926,00 € → 410,50 €/mes (12 p.)
    //     y 351,86 € (14 p.); neto por paga en 14: 23.124 / 14 = 1.651,71 €.
    //   · 22.000 €: SS 1.430 · RNT 18.570 € → reducción art. 20 (segundo tramo decreciente)
    //     → base 17.227,65 € · cuota escala(17.227,65) − escala(5.550) = 3.512,14 − 1.054,50
    //     = 2.457,64 € (DA 61.ª: 0, íntegros ≥ 20.048,45) · neto 18.112,36 €.
    //   · 35.000 €, 1 hijo: SS 2.275 · base 30.725,00 € · mínimo 7.950 € → escala(30.725)
    //     7.383,00 − escala(7.950) 1.510,50 = 5.872,50 € · neto 26.852,50 € · sin hijo 6.328,50 €
    //     → ahorro 456,00 € (= 2.400 × 19 %), 38,00 €/mes.
    //   · 80.000 €: SS 3.978,94 € (base máxima) · base 74.021,06 € · cuota 23.156,48 € ·
    //     neto 52.864,59 €.
    for (const cifra of [
      '1927,00 €', '410,50 €', '351,86 €', '1651,71 €',
      '17.227,65 €', '2457,64 €', '18.112,36 €',
      '30.725,00 €', '5872,50 €', '26.852,50 €', '456,00 €', '38,00 €',
      '74.021,06 €', '23.156,48 €', '52.864,59 €',
    ]) {
      expect.soft(cuerpo, `cifra de la calculadora «${cifra}»`).toContain(cifra);
    }
  });

  /**
   * MEDIO · El «Ejemplo práctico» define la base liquidable como «lo que queda tras restar a tu
   * bruto la Seguridad Social, los gastos deducibles, la reducción por rendimientos del trabajo
   * y el mínimo personal/familiar», y le aplica la escala: enseña justo el método que el
   * art. 63.1.2.º prohíbe (calcularCuotaIntegraGeneral: el mínimo forma parte de la base y se
   * grava a tipo cero). check:minimo-irpf solo mira restas en el CÓDIGO, no la prosa.
   */
  test('bloque educativo — el ejemplo práctico no resta el mínimo de la base liquidable', async ({ page }) => {
    const cuerpo = await cuerpoConGuiaAbierta(page);
    expect(cuerpo).not.toMatch(/tras restar[^)]*mínimo personal/);
    // Reparado: base 30.000 € con el mínimo DENTRO → escala(30.000) 7.165,50 € − escala(5.550)
    // 1.054,50 € = 6.111,00 € de cuota íntegra (20,37 % efectivo).
    expect.soft(cuerpo).toContain('7165,50 €');
    expect.soft(cuerpo).toContain('1054,50 €');
    expect.soft(cuerpo).toContain('6111,00 €');
    expect.soft(cuerpo).toContain('20,37% efectivo');
  });

  /**
   * MEDIO · Ejercicio declarado frente a ejercicio calculado. Hero, <title>, description, og y
   * jsonLd dicen «2025», pero el cálculo usa COTIZACIONES_SS_2026 (MEI 0,15 %; en
   * COTIZACIONES_SS_2025 era 0,12 %), BASES_SS_2026 y la DA 61.ª de 2026
   * (calcularDeduccionRentasBajas(…, 2026)): 19.000 € deducen 209,69 € (CASO 0), cuando con la
   * de 2025 serían 0 € (≥ 18.276 €). El propio aviso de la página dice «Vigencia: 2026».
   */
  test('ejercicio — el hero y el <title> no anuncian 2025 cuando se calcula con 2026', async ({ page }) => {
    expect.soft(await page.locator('body').innerText()).toContain('Vigencia: 2026');
    const subtitulo = page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) }).locator('p');
    expect.soft(await subtitulo.innerText()).not.toContain('2025');
    expect.soft(await page.title()).not.toContain('2025');
    // Reparado: el año se deriva de FISCAL_IRPF_META.vigencia, el mismo que da el aviso.
    expect.soft(await subtitulo.innerText()).toContain('2026');
    expect.soft(await page.title()).toContain('2026');
    // Y la referencia normativa ya no duplica la ley en «normativa» y «fuente»: cita también
    // la DA 61.ª (RDL 5/2026) y la Orden de cotización.
    const referencias = limpiar((await page.getByRole('note', { name: 'Datos de referencia normativos' }).allInnerTexts()).join(' '));
    expect.soft(referencias).toContain('Real Decreto-ley 5/2026');
    expect.soft(referencias).toContain('Orden PJC/297/2026');
  });

  /**
   * MEDIO · Obligación de declarar escrita a mano: «Con dos o más pagadores, el límite baja a
   * 15.000 €», cuando OBLIGACION_DECLARAR_2025.trabajo.variosPagadores (data/fiscal/irpf.ts,
   * art. 96 LIRPF) es 15.876 €. Los 22.000 € y 1.500 € del mismo párrafo cuadran hoy con el
   * módulo, pero tampoco se derivan de él.
   */
  test('bloque educativo — el límite con varios pagadores es el de OBLIGACION_DECLARAR_2025 (15.876 €)', async ({ page }) => {
    const cuerpo = await cuerpoConGuiaAbierta(page);
    expect.soft(cuerpo).not.toContain('el límite baja a 15.000 €');
    expect.soft(cuerpo).toMatch(/15\.876/);
  });

  /**
   * MEDIO · El FAQPage (JSON-LD, lo que leen los buscadores con IA) da la cotización del
   * trabajador como «aproximadamente el 6,35 %: 4,70 % + 1,55 % + 0,10 %», sin el MEI; la app
   * aplica COTIZACIONES_SS_2026 = 4,70 + 1,55 + 0,10 + 0,15 = 6,50 % (1.950,00 € con 30.000 €).
   */
  test('FAQPage — la cotización del trabajador no es el 6,35 % sin MEI', async ({ page }) => {
    const faq = await faqJsonLd(page);
    expect.soft(faq).not.toContain('6,35');
    // Reparado: sale de COTIZACIONES_SS_2026 (4,70 + 1,55 + 0,10 + 0,15).
    expect.soft(faq).toContain('el 6,50 % de la base de cotización');
  });

  /**
   * BAJO · El FAQPage dice que con 30.000 € la retención ronda el 12-15 % y con 50.000 € el
   * 20-22 %; la calculadora de la página da 16,42 % (CASO 1) y 22,41 % (50.000 €: cuota
   * escala(44.750) − escala(5.550) = 12.259,00 − 1.054,50 = 11.204,50 €).
   */
  test('FAQPage — las horquillas de retención contienen lo que calcula la propia app', async ({ page }) => {
    const faq = await faqJsonLd(page);
    expect.soft(faq).not.toMatch(/30\.000 €, el 12-15 %/);
    expect.soft(faq).not.toMatch(/50\.000 €, el 20-22 %/);
    // Reparado: las cifras las da el mismo motor que la calculadora (CASO 1 y el de 50.000 €).
    expect.soft(faq).toContain('con 30.000 €, el 16,42 %');
    expect.soft(faq).toContain('con 50.000 €, el 22,41 %');
  });

  /**
   * BAJO · El aviso final imprime FISCAL_IRPF_META.verificado en crudo: «Datos verificados:
   * 2026-09-09», formato ISO; el DataReference de arriba ya lo da como 09/09/2026.
   */
  test('aviso — la fecha de verificación va en formato DD/MM/AAAA', async ({ page }) => {
    await expect(page.getByText(/^Datos verificados:/)).toHaveText(/^Datos verificados: \d{2}\/\d{2}\/\d{4}/, { timeout: 1000 });
  });

  /**
   * MEDIO · Los dos <select> («Situación familiar», «Número de pagas») llevan un <label>
   * visible sin `htmlFor` ni anidamiento: `select.labels.length` es 0 y un lector de pantalla
   * los anuncia sin nombre, justo en el control que cambia el IRPF.
   */
  test('accesibilidad — los dos desplegables tienen nombre accesible', async ({ page }) => {
    expect.soft(await page.getByRole('combobox', { name: 'Situación familiar' }).count()).toBe(1);
    expect.soft(await page.getByRole('combobox', { name: 'Número de pagas' }).count()).toBe(1);
  });

  /**
   * BAJO · El importe de la deducción va con `style={{ color: '#27ae60' }}` literal: en claro,
   * sobre #fff, da 2,87:1 (texto de 15,2 px, peso 500 → umbral AA 4,5:1). En oscuro, sobre
   * #2d2d2d, 4,79:1. Se miden los dos para que el arreglo de uno no rompa el otro.
   */
  test('accesibilidad — el importe de la deducción llega a 4,5:1 en los dos temas', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    // Sin transiciones: al cambiar de tema el fondo pasa por grises intermedios, y medido
    // en caliente el oscuro daba 2,55:1 en vez de su 4,79:1 real.
    await prepararParaMedir(page);
    await calcular(page, '18600');
    const importe = page.locator('css=div:has(> span:text-is("Deducción por rendimientos del trabajo")) > span').nth(1);
    const contraste = () => importe.evaluate((el) => {
      const nums = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const capas: number[][] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        const [r, g, b, a = 1] = nums(getComputedStyle(n).backgroundColor);
        if (a > 0) capas.push([r, g, b, a]);
        if (a >= 1) break;
      }
      let fondo = [255, 255, 255];
      for (const [r, g, b, a] of capas.reverse()) fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
      const [l1, l2] = [lum(nums(getComputedStyle(el).color)), lum(fondo)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    });
    expect.soft(await contraste(), 'tema claro').toBeGreaterThanOrEqual(4.5);
    await activarTema(page, 'dark');
    expect.soft(await contraste(), 'tema oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * BAJO · Tras un cálculo válido, una entrada rechazada deja en pantalla el resultado
   * anterior: 30.000 € → Calcular → «30.000.50» → Calcular salta el aviso, pero las tarjetas
   * siguen diciendo 30.000,00 € de bruto y 23.124,00 € de neto junto a un campo que dice otra
   * cosa. Debería retirar (o marcar como no vigente) el resultado.
   */
  test('rechazo tras un resultado — no queda en pantalla el cálculo de otra cifra', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await calcular(page, '30000');
    expect(await hayResultados(page)).toBe(true);
    await calcular(page, '30.000.50');
    expect(await hayResultados(page)).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Re-inspección 25/09/2026 (2.ª del día, tras reparar 1651-1660)
// ═════════════════════════════════════════════════════════════════════════════
/**
 * Casos resueltos a mano ANTES de ejecutar la app. Fuentes:
 *   · data/fiscal/irpf.ts — TRAMOS_IRPF_2025, MINIMOS_IRPF_2025, GASTOS_DEDUCIBLES_TRABAJO_2025,
 *     REDUCCION_RENDIMIENTOS_TRABAJO_2025, REDUCCION_TRIBUTACION_CONJUNTA_2025,
 *     DEDUCCION_RENDIMIENTOS_TRABAJO_2026, COTIZACIONES_SS_2026 (6,50 %), BASES_SS_2026.
 *   · Texto consolidado del BOE que esos módulos citan, leído en sesión el 25/09/2026:
 *     Ley 35/2006 (BOE-A-2006-20764) arts. 20, 42.3.c, 52.1, 58 y 61; Reglamento del IRPF
 *     (RD 439/2007, BOE-A-2007-6820) arts. 81, 83, 84, 85 y 86.
 *
 * Tres hallazgos de cálculo nuevos, todos con la norma literal:
 *
 * 1. ART. 20 LIRPF, último párrafo: «A estos efectos, el rendimiento neto del trabajo será el
 *    resultante de minorar el rendimiento íntegro en los gastos previstos en las letras a), b),
 *    c), d) y e) del artículo 19.2». La reducción se ENTRA con el bruto menos la Seguridad
 *    Social, SIN los 2.000 € de «otros gastos» de la letra f); luego se resta del rendimiento
 *    neto completo. El art. 83.3.d del Reglamento dice lo mismo para la retención («la cuantía
 *    del rendimiento neto del trabajo resultante de las minoraciones previstas en los párrafos
 *    a) y b)»). motor.ts entra con el rendimiento YA minorado en los 2.000 €, así que en la
 *    zona decreciente (bruto ≈ 15.900-23.300 €) la reducción sale hasta 3.500 € más alta.
 *    Contraprueba en la propia norma: la DA 61.ª de 2026 vale 590,89 € en el SMI (17.094 €)
 *    porque es exactamente la cuota íntegra del SMI calculada así —19 % × (8.659,95 − 5.550)—;
 *    con la lectura de la app la cuota del SMI sería 214,87 € y la deducción no casaría.
 *    ⚠️ Los goldens del CASO 0 (19.000 €), 18.600 €, 17.600 € y del perfil de 22.000 € del
 *    bloque educativo, más arriba, se calcularon con la misma lectura: al reparar, recalcularlos.
 *
 * 2. ART. 61.1.ª LIRPF y ART. 84.2.º RIRPF: con «Casado/a (dos ingresos)» cada cónyuge declara
 *    por separado y los dos tienen derecho al mínimo por los hijos comunes: se prorratea a
 *    partes iguales (1.200 € por el primero). El reglamento de retenciones dice lo mismo
 *    («Los descendientes se computarán por mitad, excepto cuando el contribuyente tenga
 *    derecho, de forma exclusiva…»), así que da igual si la app promete cuota o retención.
 *    El motor suma el mínimo ENTERO (2.400 €). La app hermana estimador-irpf ya prorratea.
 *
 * 3. RETENCIÓN frente a CUOTA: el desglose rotula «Retención IRPF anual» y «Tipo de retención
 *    efectivo», y el FAQPage dice que el neto es «el que recibes en cuenta»; pero la cifra es la
 *    cuota anual de la LIRPF: aplica la reducción por tributación conjunta del art. 84.2 y la
 *    deducción de la DA 61.ª, que el procedimiento de retención (RIRPF arts. 82-86) no aplica.
 */
test.describe('Re-inspección 25/09/2026 (2.ª) — reducción del art. 20, mínimo por descendientes y textos', () => {
  /** Escribe en un NumberInput por su nombre accesible y espera a que el ESTADO de React lo recoja. */
  async function escribirCampo(page: Page, nombre: string, valor: string, esperadoTrasBlur: string = valor): Promise<void> {
    const campo = page.getByRole('textbox', { name: nombre, exact: true });
    await campo.fill(valor);
    await campo.blur();
    await esperarValorEnReact(page, campo, esperadoTrasBlur);
  }

  /**
   * NORMAL · 40.000 € brutos, familia monoparental, 2 hijos (1 menor de 3 años), 14 pagas.
   *   SS = 40.000 × 6,50 % = 2.600,00 € (3.333,33 €/mes, bajo BASES_SS_2026.maxima)
   *   Rendimiento neto = 40.000 − 2.600 − 2.000 = 35.400 € · reducción art. 20 = 0 € (entrada
   *     bruto − SS = 37.400 € ≥ 19.747,5 €, con cualquiera de las dos lecturas)
   *   Base liquidable = 35.400 − 2.150 (REDUCCION_TRIBUTACION_CONJUNTA_2025.monoparental) = 33.250 €
   *   Mínimo = 5.550 + 2.400 + 2.700 + 2.800 = 13.450 € (entero: el otro progenitor no convive)
   *   escala(33.250) = 2.365,50 + 1.860,00 + 13.050 × 30 % = 8.140,50 €
   *   escala(13.450) = 2.365,50 + 1.000 × 24 % = 2.605,50 € → cuota = 5.535,00 € · DA 61.ª: 0 €
   *   Neto = 40.000 − 2.600 − 5.535 = 31.865,00 € · /14 = 2.276,07 € · tipo 13,84 %
   */
  test('NORMAL · 40.000 € monoparental, 2 hijos (1 menor de 3), 14 pagas', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Situación familiar' }).selectOption('familia_monoparental');
    await page.getByRole('combobox', { name: 'Número de pagas' }).selectOption('14');
    await escribirCampo(page, 'Número de hijos', '2');
    await escribirCampo(page, 'Hijos menores de 3 años', '1');
    await calcular(page, '40000');
    expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('2600,00 €');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('5535,00 €');
    expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('13,84%');
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('31.865,00€');
    expect(await valorTarjeta(page, 'Neto Mensual (14 pagas)')).toBe('2276,07€');
  });

  /**
   * LÍMITE · 400.000 € brutos, soltero/a: tramo del 47 % y base de cotización en la máxima.
   *   SS = 5.101,20 × 6,50 % × 12 = 3.978,94 € (331,578 €/mes)
   *   Base = 400.000 − 3.978,936 − 2.000 = 394.021,064 €
   *   escala(394.021,06) = 125.901,50 (cuota acumulada a 300.000 €, la misma que la tabla del
   *     art. 85.1 RIRPF) + 94.021,064 × 47 % (44.189,90) = 170.091,40 €
   *   cuota = 170.091,40 − 1.054,50 = 169.036,90 € · neto = 400.000 − 3.978,94 − 169.036,90
   *   = 226.984,16 € · tipo 42,26 %
   */
  test('LÍMITE · 400.000 €: tramo del 47 %, IRPF 169.036,90 €', async ({ page }) => {
    await calcular(page, '400000');
    expect(await filaDesglose(page, 'Total Seguridad Social')).toBe('3978,94 €');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('169.036,90 €');
    expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('42,26%');
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('226.984,16€');
  });

  /**
   * RECHAZO Y ACOTADO · «0» en Neto → Bruto avisa y no pinta nada; «3» hijos menores de 3 años
   * con 1 hijo se acota a 1 al salir del campo (max = número de hijos) y el cálculo usa 1:
   *   30.000 €, 1 hijo menor de 3: mínimo = 5.550 + 2.400 + 2.800 = 10.750 €
   *   escala(26.050) 5.980,50 − escala(10.750) (todo en el primer tramo: 10.750 × 19 %) 2.042,50
   *   = 3.938,00 € (con «3» sin acotar serían 5.550 + 2.400 + 8.400 = 16.350 € de mínimo)
   */
  test('RECHAZO · «0» en Neto → Bruto avisa; 3 menores de 3 con 1 hijo se acotan a 1', async ({ page }) => {
    const avisos: string[] = [];
    page.on('dialog', async (dialog) => {
      avisos.push(dialog.message());
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Neto → Bruto', exact: true }).click();
    await calcular(page, '0');
    expect(avisos).toEqual(['Por favor, introduce un salario válido']);
    expect(await hayResultados(page)).toBe(false);

    await page.getByRole('button', { name: 'Bruto → Neto', exact: true }).click();
    await escribirCampo(page, 'Número de hijos', '1');
    await escribirCampo(page, 'Hijos menores de 3 años', '3', '1');
    await calcular(page, '30000');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('3938,00 €');
  });

  /**
   * HALLAZGO (alto, cálculo) — la reducción del art. 20 se entra con el rendimiento YA minorado
   * en los 2.000 € del art. 19.2.f. 20.000 € brutos, soltero/a:
   *   SS = 1.300,00 € · entrada de la reducción = 20.000 − 1.300 = 18.700 € (art. 20, letras a-e)
   *   reducción = 2.364,34 − 1,14 × (18.700 − 17.673,52) = 1.194,15 €
   *   base = (20.000 − 1.300 − 2.000) − 1.194,15 = 15.505,85 €
   *   cuota = escala(15.505,85) 3.098,90 − 1.054,50 = 2.044,40 €
   *   DA 61.ª = 590,89 − 0,2 × (20.000 − 17.094) = 9,69 € → IRPF 2.034,71 € · tipo 10,17 %
   *   neto = 20.000 − 1.300 − 2.034,71 = 16.665,29 €
   * Hoy la app entra con 16.700 € → reducción 4.068 € → IRPF 1.344,99 €, neto 17.355,01 €.
   * El defecto es de cientos de euros: se comparan las cadenas exactas.
   */
  test.fail('HALLAZGO art. 20 · 20.000 €: IRPF 2.034,71 € y neto 16.665,29 €', async ({ page }) => {
    await calcular(page, '20000');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('2034,71 €');
    expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('10,17%');
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('16.665,29€');
  });

  /**
   * HALLAZGO (alto, cálculo) — contraprueba en el SMI (SMI_2026.anual = 17.094 €), 14 pagas.
   *   SS = 17.094 × 6,50 % = 1.111,11 € · entrada art. 20 = 15.982,89 €
   *   reducción = 7.302 − 1,75 × 1.130,89 = 5.322,94 € · base = 13.982,89 − 5.322,94 = 8.659,95 €
   *   cuota = (8.659,95 − 5.550) × 19 % = 590,89 € = DEDUCCION_RENDIMIENTOS_TRABAJO_2026.deduccionMaxima
   *   → la deducción de la DA 61.ª que se pinta es −590,89 € y el IRPF queda en 0,00 €.
   * Hoy: reducción 7.302 € (entrada 13.982,89 €), cuota 214,87 €, deducción pintada −214,87 €.
   */
  test.fail('HALLAZGO art. 20 · SMI 17.094 €: la cuota íntegra es 590,89 € y la DA 61.ª la anula entera', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Número de pagas' }).selectOption('14');
    await calcular(page, '17094');
    expect(await filaDesglose(page, 'Deducción por rendimientos del trabajo')).toBe('-590,89 €');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('15.982,89€');
  });

  /**
   * HALLAZGO (alto, cálculo) — el mismo defecto en el bloque educativo y en el FAQPage, que
   * beben del motor. Perfil «Recién graduado», 22.000 € soltero/a:
   *   SS 1.430 € · entrada art. 20 = 20.570 € ≥ 19.747,5 € → reducción 0 € → base 18.570,00 €
   *   cuota = escala(18.570) 3.834,30 − 1.054,50 = 2.779,80 € · DA 61.ª 0 € (≥ 20.048,45 €)
   *   neto = 22.000 − 1.430 − 2.779,80 = 17.790,20 €
   * FAQPage, 20.000 €: 2.034,71 / 20.000 = 10,17 % (hoy «6,72 %»).
   */
  test.fail('HALLAZGO art. 20 · perfil de 22.000 € y FAQPage de 20.000 €', async ({ page }) => {
    const cuerpo = await cuerpoConGuiaAbierta(page);
    expect.soft(cuerpo).toContain('18.570,00 €');
    expect.soft(cuerpo).toContain('2779,80 €');
    expect.soft(cuerpo).toContain('17.790,20 €');
    expect.soft(await faqJsonLd(page)).toContain('con 20.000 € brutos/año, el 10,17 %');
  });

  /**
   * HALLAZGO (alto, cálculo) — sospecha 1: mínimo por descendientes con «Casado/a (dos ingresos)».
   * 35.000 € brutos, 1 hijo, 12 pagas (el perfil «Técnico medio con familia»):
   *   SS 2.275 € · base 30.725 € (entrada art. 20 = 32.725 €: reducción 0 € con cualquier lectura)
   *   mínimo = 5.550 + 2.400 / 2 = 6.750 € (art. 61.1.ª LIRPF; art. 84.2.º RIRPF para la retención)
   *   cuota = escala(30.725) 7.383,00 − escala(6.750) 1.282,50 = 6.100,50 € · tipo 17,43 %
   *   neto = 35.000 − 2.275 − 6.100,50 = 26.624,50 €
   * Hoy suma los 2.400 € enteros: mínimo 7.950 €, IRPF 5.872,50 €, neto 26.852,50 €.
   */
  test.fail('HALLAZGO art. 61.1.ª · dos ingresos y 1 hijo: el mínimo del hijo se prorratea (IRPF 6.100,50 €)', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Situación familiar' }).selectOption('casado_dos_ingresos');
    await escribirCampo(page, 'Número de hijos', '1');
    await calcular(page, '35000');
    expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('6100,50 €');
    expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('17,43%');
    expect(await valorTarjeta(page, 'Salario Neto Anual')).toBe('26.624,50€');
  });

  /**
   * HALLAZGO (alto, cálculo) — el perfil del bloque educativo hereda el mínimo entero:
   *   «Mínimo personal + hijo 1»: 5.550 + 1.200 = 6.750,00 € (hoy 7.950,00 €)
   *   «Impacto del mínimo por el hijo»: IRPF sin hijo 6.328,50 € − con hijo 6.100,50 € = 228,00 €
   *   (= 1.200 × 19 %; hoy 456,00 €), y el consejo del modelo 145: 228 / 12 = 19,00 €/mes (hoy 38,00 €).
   */
  test.fail('HALLAZGO art. 61.1.ª · el perfil de 35.000 € con 1 hijo en dos ingresos', async ({ page }) => {
    const cuerpo = await cuerpoConGuiaAbierta(page);
    expect.soft(cuerpo).toMatch(/Mínimo personal \+ hijo 1[^:]*: 6750,00 €/);
    expect.soft(cuerpo).toContain('Impacto del mínimo por el hijo: 228,00 €');
    expect.soft(cuerpo).toContain('reducir tu retención mensual unos 19,00 €');
  });

  /**
   * HALLAZGO (medio, contenido) — «Retención IRPF anual» rotula la CUOTA anual. 30.000 €,
   * «Casado/a (un solo ingreso)», 0 hijos. Retención por el Reglamento (arts. 82-86 RIRPF):
   *   base art. 83 = 30.000 − 1.950 (SS) − 2.000 (19.2.f) − 0 (83.3.d: 28.050 ≥ 19.747,5)
   *   = 26.050 € — SIN la reducción de 3.400 € del art. 84.2 LIRPF, que el art. 83.3 no recoge
   *   mínimo art. 84 = 5.550 € · cuota art. 85.1 = 5.980,50 − 1.054,50 = 4.926,00 €
   *   tope art. 85.3 = 43 % × (30.000 − 17.197, art. 81 situación 2.ª) = 5.505,29 € (no muerde)
   *   tipo art. 86 = 16,42 % → retención 4.926,00 € (la app pinta 3.906,00 € y 13,02 %).
   * Lo correcto es cualquiera de las dos: o la fila no se llama «Retención», o vale 4.926,00 €.
   */
  test.fail('HALLAZGO retención · casado/a con un ingreso: la fila «Retención» no puede ser la cuota de la conjunta', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Situación familiar' }).selectOption('casado_un_ingreso');
    await calcular(page, '30000');
    await expect(page.getByRole('heading', { level: 3, name: 'Salario Neto Anual', exact: true })).toBeVisible();
    if ((await cuentaFilas(page, 'Retención IRPF anual')) > 0) {
      expect(await filaDesglose(page, 'Retención IRPF anual')).toBe('4926,00 €');
    }
    if ((await cuentaFilas(page, 'Tipo de retención efectivo')) > 0) {
      expect(await filaDesglose(page, 'Tipo de retención efectivo')).toBe('16,42%');
    }
  });

  /**
   * HALLAZGO (medio, contenido) — sospecha 2: la tarjeta «Solicita retribución flexible» dice
   * «hasta 1.500 € en seguro médico están exentos de IRPF por persona asegurada … familia de 4
   * personas, el límite exento es de 6.000 €/año». Art. 42.3.c.2.º LIRPF: 500 € anuales por
   * persona, o 1.500 € para cada una CON DISCAPACIDAD → familia de 4: 2.000 €. El paso 3 de la
   * misma página ya dice 500 €.
   */
  test.fail('HALLAZGO seguro médico · el exento es 500 € por persona (familia de 4: 2.000 €), no 1.500 €', async ({ page }) => {
    const cuerpo = await cuerpoConGuiaAbierta(page);
    expect.soft(cuerpo).not.toContain('hasta 1.500 € en seguro médico');
    expect.soft(cuerpo).not.toMatch(/4 personas, el límite exento es de 6\.000/);
  });

  /**
   * HALLAZGO (bajo, dato) — «El límite conjunto empresa + trabajador es de 10.000 €/año (o
   * 8.500 € si solo aporta la empresa)», escrito a mano. LIMITES_PLAN_PENSIONES_2025
   * (data/fiscal/pensiones.ts) ya lo tiene, y el art. 52.1 LIRPF da 1.500 € + 8.500 € «siempre
   * que tal incremento provenga de contribuciones empresariales»: solo empresa → 10.000 €.
   */
  test.fail('HALLAZGO plan de pensiones · no hay un límite de 8.500 € «si solo aporta la empresa»', async ({ page }) => {
    const cuerpo = await cuerpoConGuiaAbierta(page);
    expect(cuerpo).not.toContain('8.500 € si solo aporta la empresa');
  });

  /**
   * HALLAZGO (bajo, contenido) — cifras de ejemplo que no salen de su propia aritmética:
   *   · «Un aumento de 1.000 € brutos en el tramo del 37 % solo se traduce en ~630 € netos»: la
   *     calculadora da 45.000 € → 32.600,25 € y 46.000 € → 33.189,30 €: +589,05 € (1.000 − 65 de
   *     SS − 37 % × 935). Los ~630 € olvidan la Seguridad Social.
   *   · «Un seguro médico familiar de 1.500 €/año puede suponer un ahorro de ~380 € en IRPF …
   *     en el tramo del 30 %»: 1.500 × 30 % = 450 €.
   */
  test.fail('HALLAZGO cifras de ejemplo · subida de 1.000 € (+589,05 €) y seguro de 1.500 € al 30 % (450 €)', async ({ page }) => {
    await calcular(page, '45000');
    await expect.poll(() => valorTarjeta(page, 'Salario Neto Anual')).toBe('32.600,25€');
    await calcular(page, '46000');
    await expect.poll(() => valorTarjeta(page, 'Salario Neto Anual')).toBe('33.189,30€');
    const cuerpo = await cuerpoConGuiaAbierta(page);
    expect.soft(cuerpo).not.toContain('~630 € netos');
    expect.soft(cuerpo).not.toContain('~380 € en IRPF');
  });
});
