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
 * REPARADOS el 14/11/2026 (/reparar, hallazgos 4690-4700): la app calcula ahora con
 * app/orientador-tarifa-freelance/motor.ts. La cuota de autónomos ya no es un gasto escrito a mano:
 * sale de cotizacionRETADesdeActividad (simplificada) y el IRPF de calcularCuotaIntegraGeneral sobre
 * el rendimiento neto de la simplificada (ingresos − gastos − cuota − 5 % de difícil justificación),
 * con el mínimo personal a tipo cero. La facturación sin margen es la menor que deja el neto pedido;
 * el margen va encima, y cuota e IRPF se enseñan con la facturación final. El desplegable de IRPF
 * pasa a ser la RETENCIÓN (pago a cuenta, informativa). Los esperados se recalcularon a mano, sin
 * importar el motor, en .reparar-trabajo/tarifa-esperados.mjs de la tanda (tablas copiadas de
 * data/fiscal): búsqueda por céntimos de la facturación anual y punto fijo del tramo del RETA.
 *   Por defecto (2.000 € netos, gastos 235 €/mes sin cuota, 40 h, 70 %, margen 15 %):
 *     facturación sin margen 37.472,35 €/año × 1,15 = 43.093,20 €/año = 3.591,10 €/mes
 *     ingresos − gastos 40.273,20 € → computable simplificada en el tramo 11 (2.760-3.190 €):
 *     cuota 1.437,91 × 31,50 % = 452,94 €/mes · rendimiento IRPF 33.096,01 € → cuota 7.039,80 €
 *     → neto 27.798,10 € (2.316,51 €/mes) · tarifa 3.591,10 / 102,667 h = 34,98 €/h, 279,83 €/día
 *   Margen 0: 3.122,70 €/mes, cuota 427,21 € (tramo 10), IRPF 5.525,87 €, neto 2.000,00 €/mes, 30,42 €/h.
 *   CASO 1 (2.500 €, 35 h, 75 %, margen 10 %): 4.268,94 €/mes, 44,35 €/h, 310,47 €/día, IRPF 9.692,39 €.
 *   CASO 2 (3.000 €, sin gastos, 1 h, 0 días libres, 100 %, margen 0): 4.460,37 €/mes, cuota 504,41 €,
 *     IRPF 11.471,43 €, 1.025,37 €/h, 205,07 €/día, neto 36.000 €.
 *
 * HALLAZGOS del 14/11/2026 (reparados el mismo día; antes llevaban test.fail())
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
/** Los gastos fijos ya no empiezan por la cuota de autónomos: el 1 es «Alquiler oficina/coworking». */
const gastoFijo = (n: number): string => campo(`Importe del gasto fijo ${n} en euros`);
const RETENCION = '#tipo-retencion';
const gastoVariable = (n: number): string => campo(`Importe del gasto variable ${n} en euros`);

/** Quita los espacios duros para comparar con el texto que se lee. */
const plano = (t: string | null): string => (t ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/** Importe en euros tal como lo pinta la app en es-ES («28.361 €», «3823,79 €»). Solo para leer la salida. */
const leerEuros = (t: string): number => Number(t.replace(/[^\d,-]/g, '').replace(',', '.'));

/** El panel de resultados es una región con nombre; su única región viva es el resumen (hallazgo 4699). */
function panel(page: Page): Locator {
  return page.getByRole('region', { name: 'Tu Tarifa Recomendada' });
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

  test('valores por defecto · 2.000 € netos, 235 € de gastos + cuota del tramo, 40 h, 70 %, margen 15 % → 34,98 €/h', async ({ page }) => {
    // Cabecera: 3.591,10 €/mes · 220 días × 0,70 = 154 (12,833/mes) · 8 h/día → 1.232 h/año (102,667/mes)
    // → 34,978 €/h (con IVA 42,32 €) · 279,83 €/día · 1.399,13 €/sem · cuota 452,94 € · IRPF 7.039,80 €
    // · gastos y cuota (235 + 452,94) × 12 = 8.255,30 € · neto 27.798,10 € (2.316,51 €/mes)
    expect(await cifra(page, 'Tarifa por Hora')).toBe('34,98 €/h');
    expect(await nota(page, 'Tarifa por Hora')).toBe('Con IVA: 42,32 €/h');
    expect(await cifra(page, 'Tarifa por Día')).toBe('279,83 €/día');
    expect(await cifra(page, 'Tarifa por Semana')).toBe('1399,13 €/sem');
    expect(await fila(page, 'Facturación necesaria')).toBe('3591,10 €');
    expect(await fila(page, 'Gastos de la actividad')).toBe('-235,00 €');
    expect(await fila(page, 'Cuota de autónomos')).toBe('-452,94 €');
    expect(await fila(page, 'IRPF (promedio mensual)')).toBe('-586,65 €');
    expect(await cifra(page, 'Facturación Anual')).toBe('43.093 €');
    expect(await cifra(page, 'Gastos y Cuota Anuales')).toBe('8255 €');
    expect(await cifra(page, 'IRPF Estimado')).toBe('7040 €');
    expect(await cifra(page, 'Beneficio Neto')).toBe('27.798 €');
    expect(await nota(page, 'Beneficio Neto')).toBe('2316,51 €/mes');
    expect(await dias(page, 'Días laborables')).toBe('220');
    expect(await dias(page, 'Días facturables')).toBe('154');
    expect(await dias(page, 'Horas facturables')).toBe('1232');
  });

  test('CASO 1 (normal) · 2.500 €, 35 h, ocupación 75 %, margen 10 % → 44,35 €/h y 310,47 €/día', async ({ page }) => {
    // Cabecera: 4.268,94 €/mes (51.227,33 €/año) · cuota 478,68 € (tramo 12) · IRPF 9.692,39 €
    // · 96,25 h y 13,75 días facturables al mes.
    await poner(page, INGRESO, '2500');
    await poner(page, HORAS, '35');
    await poner(page, OCUPACION, '75');
    await page.locator(RETENCION).selectOption('15');
    await poner(page, MARGEN, '10');
    await expect.poll(() => fila(page, 'Facturación necesaria')).toBe('4268,94 €');
    expect(await cifra(page, 'Tarifa por Hora')).toBe('44,35 €/h');
    expect(await nota(page, 'Tarifa por Hora')).toBe('Con IVA: 53,67 €/h');
    expect(await cifra(page, 'Tarifa por Día')).toBe('310,47 €/día');
    expect(await nota(page, 'Tarifa por Día')).toBe('Con IVA: 375,67 €/día');
    expect(await cifra(page, 'Tarifa por Semana')).toBe('1552,34 €/sem');
    expect(await nota(page, 'Tarifa por Semana')).toBe('Con IVA: 1878,34 €/sem');
    expect(await fila(page, 'Cuota de autónomos')).toBe('-478,68 €');
    expect(await cifra(page, 'IRPF Estimado')).toBe('9692 €');
    expect(await fila(page, 'Horas facturables/mes')).toBe('96,3 h');
    expect(await fila(page, 'Días facturables/mes')).toBe('13,8 días');
    expect(await cifra(page, 'Facturación Anual')).toBe('51.227 €');
    expect(await dias(page, 'Días laborables')).toBe('220');
    expect(await dias(page, 'Días facturables')).toBe('165');
    expect(await dias(page, 'Horas facturables')).toBe('1155');
  });

  test('CASO 3 (rechazo) · horas 0 se acotan a 1 al salir del campo y la tarifa es la de 1 h: 1399,13 €/h', async ({ page }) => {
    // 154 días × 0,2 h = 30,8 h/año (2,567/mes) → 3.591,10 / 2,5667 = 1.399,13 €/h
    await page.locator(HORAS).fill('0');
    await esperarValorEnReact(page, HORAS, '0');
    await page.locator(HORAS).press('Tab');
    await esperarValorEnReact(page, HORAS, '1');
    await expect.poll(() => cifra(page, 'Tarifa por Hora')).toBe('1399,13 €/h');
    expect(await fila(page, 'Horas facturables/mes')).toBe('2,6 h');
    expect(await dias(page, 'Horas facturables')).toBe('31');
  });

  test('CASO 3 (rechazo) · un ingreso neto negativo se acota a 0 y la facturación solo cubre gastos y cuota: 507,01 €', async ({ page }) => {
    // Neto 0: ingresos − gastos = cuota mínima de la tabla reducida (205,88 × 12 = 2.470,57 €), sin
    // IRPF → facturación 2.820 + 2.470,57 = 5.290,57 €/año × 1,15 = 6.084,17 € = 507,01 €/mes.
    await page.locator(INGRESO).fill('-1000');
    await esperarValorEnReact(page, INGRESO, '-1000');
    await page.locator(INGRESO).press('Tab');
    await esperarValorEnReact(page, INGRESO, '0');
    await expect.poll(() => fila(page, 'Facturación necesaria')).toBe('507,01 €');
  });

  test('un ingreso neto a medio escribir (vacío) no da tarifa y el resumen dice qué falta', async ({ page }) => {
    await page.locator(INGRESO).fill('');
    await esperarValorEnReact(page, INGRESO, '');
    await expect.poll(() => cifra(page, 'Tarifa por Hora')).toBe('—');
    await expect(panel(page).getByRole('status')).toContainText('el ingreso neto mensual');
  });

  test('la retención (pago a cuenta) no cambia la tarifa: con el 7 % el cliente adelanta 251,38 €/mes', async ({ page }) => {
    // 3.591,10 × 0,07 = 251,377 → 251,38 €; con el 15 % por defecto, 538,67 €. La tarifa sigue en 34,98 €/h.
    expect(await fila(page, 'Retención que adelanta el cliente')).toBe('538,67 €');
    await page.locator(RETENCION).selectOption('7');
    await expect.poll(() => fila(page, 'Retención que adelanta el cliente')).toBe('251,38 €');
    expect(await cifra(page, 'Tarifa por Hora')).toBe('34,98 €/h');
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

  test('HALLAZGO A (14/11/2026, REPARADO) · margen 0 es 0 %, no 15 %: 30,42 €/h y 2.000,00 €/mes netos', async ({ page }) => {
    // Cabecera: 3.122,70 €/mes → 3.122,70 / 102,667 = 30,416 €/h; neto exactamente el pedido.
    // Antes: `|| 15` → el margen 0 se calculaba como 15 %.
    await poner(page, MARGEN, '0');
    await esperarValorEnReact(page, MARGEN, '0');
    await expect.poll(() => fila(page, 'Facturación necesaria')).toBe('3122,70 €');
    expect(await cifra(page, 'Tarifa por Hora')).toBe('30,42 €/h');
    expect(await nota(page, 'Beneficio Neto')).toBe('2000,00 €/mes');
  });

  test('HALLAZGO A (14/11/2026, REPARADO) · CASO 2 (límite): vacaciones, festivos y enfermedad a 0 y margen 0 → 261 días y 1025,37 €/h', async ({ page }) => {
    // Cabecera: 261 laborables = facturables · 52,2 h/año (4,35/mes) · 4.460,37 €/mes → 1.025,37 €/h
    // (con IVA 1.240,70 €) · 205,07 €/día · IRPF 11.471,43 € · neto 36.000 € (3.000,00 €/mes).
    // Antes: 0 → 22, 14 y 5 días (220 laborables) y margen 15 %.
    await poner(page, INGRESO, '3000');
    for (let i = 1; i <= 4; i++) await poner(page, gastoFijo(i), '0');
    for (let i = 1; i <= 3; i++) await poner(page, gastoVariable(i), '0');
    await poner(page, HORAS, '1');
    await poner(page, VACACIONES, '0');
    await poner(page, FESTIVOS, '0');
    await poner(page, ENFERMEDAD, '0');
    await poner(page, OCUPACION, '100');
    await poner(page, MARGEN, '0');
    await expect.poll(() => fila(page, 'Gastos de la actividad')).toBe('-0,00 €');
    await expect.poll(() => dias(page, 'Días laborables')).toBe('261');
    expect(await dias(page, 'Días facturables')).toBe('261');
    expect(await dias(page, 'Horas facturables')).toBe('52');
    expect(await fila(page, 'Facturación necesaria')).toBe('4460,37 €');
    expect(await fila(page, 'Cuota de autónomos')).toBe('-504,41 €');
    expect(await cifra(page, 'Tarifa por Hora')).toBe('1025,37 €/h');
    expect(await nota(page, 'Tarifa por Hora')).toBe('Con IVA: 1240,70 €/h');
    expect(await cifra(page, 'Tarifa por Día')).toBe('205,07 €/día');
    expect(await cifra(page, 'IRPF Estimado')).toBe('11.471 €');
    expect(await cifra(page, 'Beneficio Neto')).toBe('36.000 €');
    expect(await nota(page, 'Beneficio Neto')).toBe('3000,00 €/mes');
  });

  test('HALLAZGO B (14/11/2026, REPARADO) · IVA «0 % (Exento)»: «Con IVA» es igual a la tarifa sin IVA', async ({ page }) => {
    // Antes: `|| 21` → «Con IVA» sumaba el 21 % con el exento elegido.
    await page.locator('#tipo-iva').selectOption('0');
    await expect(page.locator('#tipo-iva')).toHaveValue('0');
    await expect.poll(() => nota(page, 'Tarifa por Hora')).toBe('Con IVA: 34,98 €/h');
    expect(await nota(page, 'Tarifa por Día')).toBe('Con IVA: 279,83 €/día');
    expect(await nota(page, 'Tarifa por Semana')).toBe('Con IVA: 1399,13 €/sem');
  });

  test('HALLAZGO C (14/11/2026, REPARADO) · «IRPF Estimado» con la escala (art. 63.1.2.º), no la retención del 15 %', async ({ page }) => {
    // CASO 1. Rendimiento neto de la simplificada = (facturación − gastos − cuota) × 12 − 5 % de
    // difícil justificación (tope 2.000 €), leído de la propia app. La cuota sale de
    // calcularCuotaIntegraGeneral (TRAMOS_IRPF_2025, mínimo personal 5.550 € a tipo cero). Cabecera:
    // 9.692,39 €. Antes: 15 % × rendimiento (la retención, pago a cuenta) = 5.920 €.
    await poner(page, INGRESO, '2500');
    await poner(page, HORAS, '35');
    await poner(page, OCUPACION, '75');
    await page.locator(RETENCION).selectOption('15');
    await poner(page, MARGEN, '10');
    await expect.poll(() => fila(page, 'Facturación necesaria')).toBe('4268,94 €');
    const facturacion = leerEuros(await fila(page, 'Facturación necesaria'));
    const gastos = leerEuros((await fila(page, 'Gastos de la actividad')).replace('-', ''));
    const cuota = leerEuros((await fila(page, 'Cuota de autónomos')).replace('-', ''));
    const previo = (facturacion - gastos - cuota) * 12;
    const esperado = calcularCuotaIntegraGeneral(previo - reduccionGastosDificilJustificacion(previo), MINIMOS_IRPF_2025.personal);
    const irpf = leerEuros(await cifra(page, 'IRPF Estimado'));
    expect(Math.abs(irpf - esperado)).toBeLessThanOrEqual(1);
    expect(irpf).toBe(9692);
  });

  test('HALLAZGO D (14/11/2026, REPARADO) · la cuota de autónomos es la del tramo del propio escenario (452,94 € por defecto)', async ({ page }) => {
    // Por defecto: ingresos − gastos SIN la cuota = (3.591,10 − 235) × 12 = 40.273,20 €
    // → cotizacionRETADesdeActividad(…, 'simplificada'): tabla general, 2.760–3.190 €/mes,
    // base mínima 1.437,91 € × 31,50 % = 452,94 €/mes. Antes: 300 € escritos a mano como gasto fijo.
    const cuota = leerEuros((await fila(page, 'Cuota de autónomos')).replace('-', ''));
    const gastos = leerEuros((await fila(page, 'Gastos de la actividad')).replace('-', ''));
    const facturacion = leerEuros(await fila(page, 'Facturación necesaria'));
    const tramo = cotizacionRETADesdeActividad((facturacion - gastos) * 12, REGIMEN_DIRECTA_POR_DEFECTO).cuotaMensual;
    expect(cuota).toBeCloseTo(tramo, 2);
    expect(cuota).toBe(452.94);
    await expect(page.locator('input[aria-label^="Concepto del gasto fijo"]').first()).not.toHaveValue(/cuota aut/i);
  });

  test('HALLAZGO E (14/11/2026, REPARADO) · el aviso es de nivel 1 CRÍTICO (calcula IRPF, IVA y cuota de autónomos)', async ({ page }) => {
    // <DisclaimerCard severity="critical"> pinta aria-label="Aviso importante"; antes iba con severity="high".
    await expect(page.locator('[aria-label="Aviso importante"]')).toHaveCount(1, { timeout: 2000 });
  });

  test('HALLAZGO F (14/11/2026, REPARADO) · FAQPage: el 7 % dura el año de inicio y los dos siguientes; la cuota mínima no es 200 €', async ({ page }) => {
    // data/fiscal/cnae-iae.ts (art. 101.5.a LIRPF y 95.1 RIRPF): «15 % con carácter general y 7 % durante
    // el año de inicio de la actividad y los dos siguientes», y solo en actividades profesionales.
    // TRAMOS_RETA_2025: cuota mínima 205,88 €/mes (tabla reducida, tramo 1).
    const faq = await faqPage(page);
    const ivaIrpf = faq.find((p) => /IVA y el IRPF/.test(p.q));
    const empleado = faq.find((p) => /empleado/.test(p.q));
    expect(ivaIrpf, 'la pregunta del IVA y el IRPF sigue en el FAQPage').toBeTruthy();
    expect(empleado, 'la pregunta del freelance frente al empleado sigue en el FAQPage').toBeTruthy();
    expect(plano(ivaIrpf?.a ?? '')).not.toContain('más de dos años de actividad');
    expect(plano(ivaIrpf?.a ?? '')).toContain('7 % durante el año de inicio de la actividad y los dos siguientes');
    expect(plano(empleado?.a ?? '')).not.toContain('desde 200 €');
    expect(plano(empleado?.a ?? '')).toContain('desde 205,88 €');
  });

  test('HALLAZGO G (14/11/2026, REPARADO) · si el subtítulo promete tarifa «por proyecto», la app la da', async ({ page }) => {
    const subtitulo = plano(await page.locator('header p').first().textContent());
    const og = (await page.locator('meta[property="og:description"]').getAttribute('content')) ?? '';
    const prometeProyecto = /proyecto/i.test(subtitulo) || /proyecto/i.test(og);
    const tarjetaProyecto = await panel(page).getByRole('heading', { level: 3, name: /proyecto/i }).count();
    expect(prometeProyecto && tarjetaProyecto === 0).toBe(false);
  });

  test('HALLAZGO H (14/11/2026, REPARADO) · un gasto negativo (−200 €) no se suma en silencio', async ({ page }) => {
    // Antes: «Subtotal gastos variables: -120,00 €/mes» y la tarifa bajaba sin aviso. Ahora el −200 no
    // se suma (80,00 € = 30 + 50) y un role="alert" lo dice.
    await page.locator(gastoVariable(1)).fill('-200');
    await esperarValorEnReact(page, gastoVariable(1), '-200');
    await esperarPaginaAsentada(page);
    const subtotal = plano(await page.getByText(/Subtotal gastos variables/).textContent());
    expect(subtotal).not.toMatch(/-\s?\d/);
    expect(subtotal).toContain('80,00 €');
    await expect(page.locator(gastoVariable(1))).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#aviso-gastos-variables')).toContainText('no puede ser negativo');
  });

  test('HALLAZGO I (14/11/2026, REPARADO) · la región viva no relee ~500 caracteres en cada pulsación', async ({ page }) => {
    // Antes: un único role="status" aria-live="polite" aria-atomic="true" que envolvía las 7 tarjetas,
    // el desglose y los días: 507 caracteres con los valores por defecto.
    const longitudes = await page.locator('[aria-live]').evaluateAll((els) => els.map((e) => (e.textContent ?? '').length));
    expect(Math.max(0, ...longitudes)).toBeLessThanOrEqual(200);
    await expect(panel(page).getByRole('status')).toHaveText(/34,98\s€ por hora/);
  });

  test('HALLAZGO J (14/11/2026, REPARADO) · «%» separado de la cifra con espacio duro en los desplegables', async ({ page }) => {
    // CLAUDE.md §2 (25/09/2026): «15 %», no «15%». Antes: «21% (General)», «15% (Retención estándar en factura)»…
    const textos = await page.locator(`${RETENCION} option, #tipo-iva option`).allTextContents();
    expect(textos.length).toBe(7);
    expect(textos.join(' | ')).not.toMatch(/\d%/);
    expect(textos.join(' | ')).toContain('21 % (General)');
  });
});
