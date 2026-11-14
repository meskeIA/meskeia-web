import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, esperarPaginaAsentada } from './_hidratacion';
import { calcularCuotaIntegraGeneral, MINIMOS_IRPF_2025 } from '../../data/fiscal/irpf';
import { reduccionGastosDificilJustificacion } from '../../data/fiscal/estimacion-directa';
import { cotizacionRETADesdeActividad, REGIMEN_DIRECTA_POR_DEFECTO } from '../../data/fiscal/autonomos';
import { PORCENTAJES_IVA } from '../../data/fiscal/iva';

/**
 * Inspector — orientador-tarifa-freelance (segmento fiscal)
 *
 * Primera inspección: 14/11/2026. La app promete en su <h1> «Orientador Tarifa Freelance» y en el
 * subtítulo «Calcula tu tarifa por hora, día y proyecto considerando todos tus gastos, impuestos y
 * vacaciones. Evita cobrar de menos». El cálculo vive en el useMemo de page.tsx (sin motor aparte):
 *   días laborables = 365 − 104 − vacaciones − festivos − enfermedad
 *   días facturables = laborables × ocupación · horas/día = horas semanales / 5
 *   facturación mensual F = (neto / (1 − IRPF) + gastos) × (1 + margen)
 *   tarifa hora = F / horas facturables al mes · día = F / días facturables al mes · semana = día × 5
 *   IRPF estimado = (12 F − 12 gastos) × tipo elegido · beneficio = rendimiento − IRPF
 * Su única dependencia de data/fiscal es FISCAL_AUTONOMOS_META (solo para <DataReference>).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/tarifa-esperados.mjs)
 *   Gastos por defecto: 300 + 0 + 50 + 30 + 25 (fijos) + 50 + 30 + 50 (variables) = 535 €/mes.
 *   CASO 1 (normal) — neto 2.500 €/mes, 35 h/sem, 22 + 14 + 5 días, ocupación 75 %, IRPF 15 %,
 *     IVA 21 %, margen 10 %:
 *       laborables 365 − 104 − 41 = 220 · facturables 220 × 0,75 = 165 (13,75/mes) · 7 h/día
 *       → 1.155 h/año (96,25/mes) · F = (2.500 / 0,85 + 535) × 1,10 = 3.823,794 €/mes
 *       → hora 3.823,794 / 96,25 = 39,728 → 39,73 € (con IVA × 1,21 = 48,07 €)
 *       → día 3.823,794 / 13,75 = 278,094 → 278,09 € (con IVA 336,49 €) · semana 1.390,47 €
 *       → facturación anual 45.885,53 € · rendimiento 39.465,53 € · beneficio 33.545,70 €
 *     IRPF de ese rendimiento por la ESCALA (data/fiscal/irpf.ts, calcularCuotaIntegraGeneral:
 *     TRAMOS_IRPF_2025 con el mínimo personal de 5.550 € a tipo cero, art. 63.1.2.º LIRPF), en la
 *     directa simplificada (REGIMEN_DIRECTA_POR_DEFECTO; 5 % de difícil justificación, tope 2.000 €,
 *     data/fiscal/estimacion-directa.ts): base 39.465,53 − 1.973,28 = 37.492,25 → cuota 8.519,13 €
 *     (9.249,25 € en la normal). La app dice 5.920 € = 15 % × 39.465,53: el 15 % es la RETENCIÓN
 *     (pago a cuenta, art. 101.5.a LIRPF), no el impuesto.
 *   CASO 2 (límite) — neto 3.000, los ocho gastos a 0, 1 h/sem (mínimo del campo), vacaciones,
 *     festivos y enfermedad a 0, ocupación 100 %, IRPF 21 %, margen 0 %:
 *       laborables 365 − 104 = 261 = facturables (21,75/mes) · 0,2 h/día → 52,2 h/año (4,35/mes)
 *       F = 3.000 / 0,79 = 3.797,468 €/mes → hora 872,98 € · día 174,60 € · semana 872,98 €
 *       → anual 45.569,62 € · IRPF 21 % 9.569,62 € · beneficio 36.000 € (3.000,00 €/mes)
 *   CASO 3 (rechazo) — horas semanales 0: al salir del campo se acota al mínimo (1 h) y la tarifa
 *     se calcula con 1 h: 154 días × 0,2 h = 30,8 h/año (2,57/mes) → 3.526,642 / 2,5667 = 1.374,02 €/h.
 *     Ingreso neto −1.000: se acota a 0 → F = 535 × 1,15 = 615,25 €. Un gasto de −200 € debería
 *     rechazarse o avisarse.
 *
 * HALLAZGOS del 14/11/2026 (los abiertos llevan test.fail())
 *   A. `parseSpanishNumber(x) || defecto` convierte un 0 legítimo en el valor por defecto: margen 0 →
 *      15 %, vacaciones/festivos/enfermedad 0 → 22/14/5; horas 0 con el foco dentro → 40 h.
 *   B. IVA «0 % (Exento)» → «Con IVA» suma el 21 % (mismo `|| 21`).
 *   C. «IRPF Estimado» es el tipo elegido (las retenciones 7/15 %) × rendimiento, no la cuota de la
 *      escala; la ficha JSON-LD promete «fórmula correcta».
 *   D. «Cuota autónomos 300 €» escrita a mano: el propio escenario por defecto cae en la tabla
 *      general, tramo 8 (cuota mínima 452,94 €); <DataReference> cita el RETA que la app no aplica.
 *   E. <DisclaimerCard severity="high">: con IRPF, IVA y cuota de autónomos va «critical».
 *   F. FAQPage: 15 % «para autónomos con más de dos años de actividad» (el 7 % dura el año de inicio
 *      y los dos siguientes) y cuota «desde 200 €» (la mínima de la tabla es 205,88 €).
 *   G. El subtítulo y la og:description prometen tarifa «por proyecto»: la app da hora, día y semana.
 *   H. Un gasto negativo se acepta sin aviso y rebaja la tarifa.
 *   I. La región viva (role="status", aria-atomic) abarca ~500 caracteres y se relee entera.
 *   J. «%» pegado a la cifra en los desplegables y textos («21% (General)»).
 */

const RUTA = '/orientador-tarifa-freelance/';
const campo = (rotulo: string): string => `input[aria-label="${rotulo}"]`;
const INGRESO = campo('Ingreso neto mensual');
const HORAS = campo('Horas semanales');
const VACACIONES = campo('Días vacaciones/año');
const FESTIVOS = campo('Días festivos/año');
const ENFERMEDAD = campo('Días enfermedad/año');
const OCUPACION = campo('% Ocupación facturable');
const MARGEN = campo('Margen de seguridad');
const gastoFijo = (n: number): string => campo(`Importe del gasto fijo ${n} en euros`);
const gastoVariable = (n: number): string => campo(`Importe del gasto variable ${n} en euros`);

/** Quita los espacios duros para comparar con el texto que se lee. */
const plano = (t: string | null): string => (t ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/** Importe en euros tal como lo pinta la app en es-ES («28.361 €», «3823,79 €»). Solo para leer la salida. */
const leerEuros = (t: string): number => Number(t.replace(/[^\d,-]/g, '').replace(',', '.'));

function panel(page: Page): Locator {
  return page.getByRole('status').filter({ hasText: 'Tu Tarifa Recomendada' });
}

/** La tarjeta de resultado por su título (h3 exacto), sin clases de módulo CSS. */
function tarjeta(page: Page, titulo: string): Locator {
  return panel(page).getByRole('heading', { level: 3, name: titulo, exact: true }).locator('xpath=ancestor::div[2]');
}

async function cifra(page: Page, titulo: string): Promise<string> {
  return plano(await tarjeta(page, titulo).locator('p').first().textContent());
}

async function nota(page: Page, titulo: string): Promise<string> {
  return plano(await tarjeta(page, titulo).locator('p').nth(1).textContent());
}

/** Fila del desglose mensual: rótulo y, a su lado, el importe. */
async function fila(page: Page, rotulo: string): Promise<string> {
  const span = panel(page).locator('span').filter({ hasText: new RegExp(`^${rotulo.replace(/[/()]/g, '\\$&')}$`) });
  return plano(await span.locator('xpath=following-sibling::span[1]').textContent());
}

/** Cifra del bloque «Días de Trabajo al Año»: el número va antes del rótulo. */
async function dias(page: Page, rotulo: string): Promise<string> {
  const span = panel(page).locator('span').filter({ hasText: new RegExp(`^${rotulo}$`) });
  return plano(await span.locator('xpath=preceding-sibling::span[1]').textContent());
}

/** Escribe en un campo como una persona, comprueba que React lo recogió y sale del campo (blur). */
async function poner(page: Page, selector: string, valor: string): Promise<void> {
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, valor);
  await page.locator(selector).press('Tab');
}

interface Pregunta {
  q: string;
  a: string;
}

async function faqPage(page: Page): Promise<Pregunta[]> {
  return page.evaluate(() => {
    const salida: { q: string; a: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of nodos) {
        if (n['@type'] !== 'FAQPage') continue;
        for (const e of n.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
          salida.push({ q: e.name, a: e.acceptedAnswer.text });
        }
      }
    }
    return salida;
  });
}

test.describe('orientador-tarifa-freelance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [INGRESO, HORAS, MARGEN, gastoFijo(1)]);
  });

  test('valores por defecto · 2.000 € netos, 535 € de gastos, 40 h, 70 %, IRPF 21 %, margen 15 % → 34,35 €/h', async ({ page }) => {
    // F = (2.000 / 0,79 + 535) × 1,15 = 3.526,642 €/mes · 220 días × 0,70 = 154 (12,833/mes) · 8 h/día
    // → 1.232 h/año (102,667/mes) → 34,350 €/h (con IVA 41,56 €) · 274,80 €/día · 1.374,02 €/sem
    // anual 42.319,71 € · rendimiento 35.899,71 € · IRPF 21 % 7.538,94 € · beneficio 28.360,77 € (2.363,40 €/mes)
    expect(await cifra(page, 'Tarifa por Hora')).toBe('34,35 €/h');
    expect(await nota(page, 'Tarifa por Hora')).toBe('Con IVA: 41,56 €/h');
    expect(await cifra(page, 'Tarifa por Día')).toBe('274,80 €/día');
    expect(await cifra(page, 'Tarifa por Semana')).toBe('1374,02 €/sem');
    expect(await fila(page, 'Facturación necesaria')).toBe('3526,64 €');
    expect(await fila(page, 'Total gastos')).toBe('-535,00 €');
    expect(await cifra(page, 'Facturación Anual')).toBe('42.320 €');
    expect(await cifra(page, 'Gastos Anuales')).toBe('6420 €');
    expect(await cifra(page, 'IRPF Estimado')).toBe('7539 €');
    expect(await cifra(page, 'Beneficio Neto')).toBe('28.361 €');
    expect(await nota(page, 'Beneficio Neto')).toBe('2363,40 €/mes');
    expect(await dias(page, 'Días laborables')).toBe('220');
    expect(await dias(page, 'Días facturables')).toBe('154');
    expect(await dias(page, 'Horas facturables')).toBe('1232');
  });

  test('CASO 1 (normal) · 2.500 €, 35 h, ocupación 75 %, IRPF 15 %, margen 10 % → 39,73 €/h y 278,09 €/día', async ({ page }) => {
    await poner(page, INGRESO, '2500');
    await poner(page, HORAS, '35');
    await poner(page, OCUPACION, '75');
    await page.locator('#tipo-irpf').selectOption('15');
    await poner(page, MARGEN, '10');
    await expect.poll(() => fila(page, 'Facturación necesaria')).toBe('3823,79 €');
    expect(await cifra(page, 'Tarifa por Hora')).toBe('39,73 €/h');
    expect(await nota(page, 'Tarifa por Hora')).toBe('Con IVA: 48,07 €/h');
    expect(await cifra(page, 'Tarifa por Día')).toBe('278,09 €/día');
    expect(await nota(page, 'Tarifa por Día')).toBe('Con IVA: 336,49 €/día');
    expect(await cifra(page, 'Tarifa por Semana')).toBe('1390,47 €/sem');
    expect(await nota(page, 'Tarifa por Semana')).toBe('Con IVA: 1682,47 €/sem');
    expect(await fila(page, 'Horas facturables/mes')).toBe('96,3 h');
    expect(await fila(page, 'Días facturables/mes')).toBe('13,8 días');
    expect(await cifra(page, 'Facturación Anual')).toBe('45.886 €');
    expect(await dias(page, 'Días laborables')).toBe('220');
    expect(await dias(page, 'Días facturables')).toBe('165');
    expect(await dias(page, 'Horas facturables')).toBe('1155');
  });

  test('CASO 3 (rechazo) · horas 0 se acotan a 1 al salir del campo y la tarifa es la de 1 h: 1374,02 €/h', async ({ page }) => {
    await page.locator(HORAS).fill('0');
    await esperarValorEnReact(page, HORAS, '0');
    await page.locator(HORAS).press('Tab');
    await esperarValorEnReact(page, HORAS, '1');
    await expect.poll(() => cifra(page, 'Tarifa por Hora')).toBe('1374,02 €/h');
    expect(await fila(page, 'Horas facturables/mes')).toBe('2,6 h');
    expect(await dias(page, 'Horas facturables')).toBe('31');
  });

  test('CASO 3 (rechazo) · un ingreso neto negativo se acota a 0 y la facturación solo cubre los gastos: 615,25 €', async ({ page }) => {
    await page.locator(INGRESO).fill('-1000');
    await esperarValorEnReact(page, INGRESO, '-1000');
    await page.locator(INGRESO).press('Tab');
    await esperarValorEnReact(page, INGRESO, '0');
    // F = (0 / 0,79 + 535) × 1,15 = 615,25 €
    await expect.poll(() => fila(page, 'Facturación necesaria')).toBe('615,25 €');
  });

  test('las opciones de IVA son las de data/fiscal (PORCENTAJES_IVA) más el 0 % del exento', async ({ page }) => {
    const valores = await page.locator('#tipo-iva option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
    expect(valores).toEqual([
      String(PORCENTAJES_IVA.general),
      String(PORCENTAJES_IVA.reducido),
      String(PORCENTAJES_IVA.superreducido),
      '0',
    ]);
  });

  test('HALLAZGO A (14/11/2026, ABIERTO) · margen 0 se calcula como 15 %: 29,87 €/h, no 34,35 €/h', async ({ page }) => {
    // F = 2.000 / 0,79 + 535 = 3.066,646 €/mes → 3.066,646 / 102,667 = 29,870 €/h;
    // beneficio = 12 × 2.000 = 24.000 € (2.000,00 €/mes). Hoy: `|| 15` → 34,35 €/h, 3526,64 €, 2363,40 €/mes.
    test.fail();
    await poner(page, MARGEN, '0');
    await esperarValorEnReact(page, MARGEN, '0');
    await expect.poll(() => fila(page, 'Facturación necesaria')).toBe('3066,65 €');
    expect(await cifra(page, 'Tarifa por Hora')).toBe('29,87 €/h');
    expect(await nota(page, 'Beneficio Neto')).toBe('2000,00 €/mes');
  });

  test('HALLAZGO A (14/11/2026, ABIERTO) · CASO 2 (límite): vacaciones, festivos y enfermedad a 0 y margen 0 → 261 días y 872,98 €/h', async ({ page }) => {
    // Hoy: 0 → 22, 14 y 5 días (220 laborables) y margen 15 % → 1191,02 €/h, 18,3 días/mes, 3450,00 €/mes.
    test.fail();
    await poner(page, INGRESO, '3000');
    for (let i = 1; i <= 5; i++) await poner(page, gastoFijo(i), '0');
    for (let i = 1; i <= 3; i++) await poner(page, gastoVariable(i), '0');
    await poner(page, HORAS, '1');
    await poner(page, VACACIONES, '0');
    await poner(page, FESTIVOS, '0');
    await poner(page, ENFERMEDAD, '0');
    await poner(page, OCUPACION, '100');
    await poner(page, MARGEN, '0');
    await expect.poll(() => fila(page, 'Total gastos')).toBe('-0,00 €');
    await expect.poll(() => dias(page, 'Días laborables')).toBe('261');
    expect(await dias(page, 'Días facturables')).toBe('261');
    expect(await dias(page, 'Horas facturables')).toBe('52');
    expect(await fila(page, 'Facturación necesaria')).toBe('3797,47 €');
    expect(await cifra(page, 'Tarifa por Hora')).toBe('872,98 €/h');
    expect(await nota(page, 'Tarifa por Hora')).toBe('Con IVA: 1056,31 €/h');
    expect(await cifra(page, 'Tarifa por Día')).toBe('174,60 €/día');
    expect(await cifra(page, 'IRPF Estimado')).toBe('9570 €');
    expect(await cifra(page, 'Beneficio Neto')).toBe('36.000 €');
    expect(await nota(page, 'Beneficio Neto')).toBe('3000,00 €/mes');
  });

  test('HALLAZGO B (14/11/2026, ABIERTO) · IVA «0 % (Exento)»: «Con IVA» debe ser igual a la tarifa sin IVA', async ({ page }) => {
    // Hoy: `|| 21` → «Con IVA: 41,56 €/h» (34,35 × 1,21) con el exento elegido.
    test.fail();
    await page.locator('#tipo-iva').selectOption('0');
    await expect(page.locator('#tipo-iva')).toHaveValue('0');
    await expect.poll(() => nota(page, 'Tarifa por Hora')).toBe('Con IVA: 34,35 €/h');
    expect(await nota(page, 'Tarifa por Día')).toBe('Con IVA: 274,80 €/día');
    expect(await nota(page, 'Tarifa por Semana')).toBe('Con IVA: 1374,02 €/sem');
  });

  test('HALLAZGO C (14/11/2026, ABIERTO) · «IRPF Estimado» con la escala (art. 63.1.2.º), no la retención del 15 %', async ({ page }) => {
    // CASO 1. Rendimiento = (facturación − gastos) × 12, leído de la propia app. La cuota sale de
    // calcularCuotaIntegraGeneral (TRAMOS_IRPF_2025, mínimo personal 5.550 € a tipo cero): entre la
    // directa simplificada (5 % de difícil justificación, tope 2.000 €) y la normal. Con 39.465,53 €:
    // entre 8.519 € y 9.249 €. Hoy: 15 % × 39.465,53 = 5.920 €, unos 2.600 € por debajo.
    test.fail();
    await poner(page, INGRESO, '2500');
    await poner(page, HORAS, '35');
    await poner(page, OCUPACION, '75');
    await page.locator('#tipo-irpf').selectOption('15');
    await poner(page, MARGEN, '10');
    await esperarPaginaAsentada(page);
    const facturacion = leerEuros(await fila(page, 'Facturación necesaria'));
    const gastos = leerEuros((await fila(page, 'Total gastos')).replace('-', ''));
    const rendimiento = (facturacion - gastos) * 12;
    const minimo = MINIMOS_IRPF_2025.personal;
    const cuotaSimplificada = calcularCuotaIntegraGeneral(rendimiento - reduccionGastosDificilJustificacion(rendimiento), minimo);
    const cuotaNormal = calcularCuotaIntegraGeneral(rendimiento, minimo);
    const irpf = leerEuros(await cifra(page, 'IRPF Estimado'));
    expect(irpf).toBeGreaterThanOrEqual(Math.floor(cuotaSimplificada) - 1);
    expect(irpf).toBeLessThanOrEqual(Math.ceil(cuotaNormal) + 1);
  });

  test('HALLAZGO D (14/11/2026, ABIERTO) · la cuota de autónomos no baja de la del tramo del propio escenario (452,94 € por defecto)', async ({ page }) => {
    // Escenario por defecto: ingresos − gastos SIN la cuota = 3.526,64 × 12 − (535 − 300) × 12 = 39.499,68 €
    // → cotizacionRETADesdeActividad(…, 'simplificada'): computable 2.929,23 €/mes → tabla general,
    // tramo 8 (2.760–3.190 €), base mínima 1.437,91 € × 31,50 % = 452,94 €/mes. Hoy: 300 € fijos.
    test.fail();
    await expect(page.locator('input[aria-label="Concepto del gasto fijo 1"]')).toHaveValue(/cuota aut/i);
    const cuota = leerEuros(await page.locator(gastoFijo(1)).inputValue());
    const gastos = leerEuros((await fila(page, 'Total gastos')).replace('-', ''));
    const facturacion = leerEuros(await fila(page, 'Facturación necesaria'));
    const ingresosMenosGastos = (facturacion - (gastos - cuota)) * 12;
    const minima = cotizacionRETADesdeActividad(ingresosMenosGastos, REGIMEN_DIRECTA_POR_DEFECTO).cuotaMensual;
    expect(cuota).toBeGreaterThanOrEqual(Math.round(minima * 100) / 100 - 0.01);
  });

  test('HALLAZGO E (14/11/2026, ABIERTO) · el aviso es de nivel 1 CRÍTICO (calcula IRPF, IVA y cuota de autónomos)', async ({ page }) => {
    // <DisclaimerCard severity="critical"> pinta aria-label="Aviso importante"; hoy va con severity="high".
    test.fail();
    await expect(page.locator('[aria-label="Aviso importante"]')).toHaveCount(1, { timeout: 2000 });
  });

  test('HALLAZGO F (14/11/2026, ABIERTO) · FAQPage: el 7 % dura el año de inicio y los dos siguientes; la cuota mínima no es 200 €', async ({ page }) => {
    // data/fiscal/cnae-iae.ts (art. 101.5.a LIRPF y 95.1 RIRPF): «15 % con carácter general y 7 % durante
    // el año de inicio de la actividad y los dos siguientes», y solo en actividades profesionales.
    // TRAMOS_RETA_2025: cuota mínima 205,88 €/mes (tabla reducida, tramo 1).
    test.fail();
    const faq = await faqPage(page);
    const ivaIrpf = faq.find((p) => /IVA y el IRPF/.test(p.q));
    const empleado = faq.find((p) => /empleado/.test(p.q));
    expect(ivaIrpf, 'la pregunta del IVA y el IRPF sigue en el FAQPage').toBeTruthy();
    expect(empleado, 'la pregunta del freelance frente al empleado sigue en el FAQPage').toBeTruthy();
    expect(plano(ivaIrpf?.a ?? '')).not.toContain('más de dos años de actividad');
    expect(plano(empleado?.a ?? '')).not.toContain('desde 200 €');
  });

  test('HALLAZGO G (14/11/2026, ABIERTO) · si el subtítulo promete tarifa «por proyecto», la app la da', async ({ page }) => {
    test.fail();
    const subtitulo = plano(await page.locator('header p').first().textContent());
    const og = (await page.locator('meta[property="og:description"]').getAttribute('content')) ?? '';
    const prometeProyecto = /proyecto/i.test(subtitulo) || /proyecto/i.test(og);
    const tarjetaProyecto = await panel(page).getByRole('heading', { level: 3, name: /proyecto/i }).count();
    expect(prometeProyecto && tarjetaProyecto === 0).toBe(false);
  });

  test('HALLAZGO H (14/11/2026, ABIERTO) · un gasto negativo (−200 €) no se suma en silencio', async ({ page }) => {
    // Hoy: «Subtotal gastos variables: -120,00 €/mes» y la tarifa baja de 34,35 a 31,55 €/h sin aviso.
    test.fail();
    await page.locator(gastoVariable(1)).fill('-200');
    await esperarValorEnReact(page, gastoVariable(1), '-200');
    await esperarPaginaAsentada(page);
    const subtotal = plano(await page.getByText(/Subtotal gastos variables/).textContent());
    expect(subtotal).not.toMatch(/-\s?\d/);
  });

  test('HALLAZGO I (14/11/2026, ABIERTO) · la región viva no relee ~500 caracteres en cada pulsación', async ({ page }) => {
    // Hoy: un único role="status" aria-live="polite" aria-atomic="true" que envuelve las 7 tarjetas,
    // el desglose y los días: 507 caracteres con los valores por defecto.
    test.fail();
    const longitudes = await page.locator('[aria-live]').evaluateAll((els) => els.map((e) => (e.textContent ?? '').length));
    expect(Math.max(0, ...longitudes)).toBeLessThanOrEqual(200);
  });

  test('HALLAZGO J (14/11/2026, ABIERTO) · «%» separado de la cifra con espacio duro en los desplegables', async ({ page }) => {
    // CLAUDE.md §2 (25/09/2026): «15 %», no «15%». Hoy: «21% (General)», «15% (Retención estándar en factura)»…
    test.fail();
    const textos = await page.locator('#tipo-irpf option, #tipo-iva option').allTextContents();
    expect(textos.join(' | ')).not.toMatch(/\d%/);
  });
});
