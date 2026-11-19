import { test, expect, type Page } from '@playwright/test';
import { parseSpanishNumber } from '../../lib/formatters';
import {
  calcularCostes,
  calcularRecomendacion,
  modelosDe,
  PREGUNTAS,
  SEGMENTOS,
  textoPrecios,
} from '../../app/selector-vehiculo/motor';

/**
 * Inspector — selector-vehiculo (segmento CÁLCULO, riesgo 2)
 *
 * Primera inspección: 19/11/2026. No confundir con selector-vehiculo-electrico (familia
 * «selectores»): esta app no pertenece a ninguna familia.
 *
 * QUÉ PROMETE
 *   <h1>: «¿Qué coche te conviene?» · «13 preguntas para dar con el coche que realmente se adapta a ti»
 *   intro: «te recomienda el segmento y la motorización más adecuados, con comparativa de costes
 *          anuales y a 5 años»; «Etiqueta DGT y modelos de referencia».
 *   metadata: og:title «Test en 9 preguntas», twitter «Test de 9 preguntas» (son 13: hallazgo).
 *
 * DÓNDE VIVE EL CÁLCULO — calcularRecomendacion() dentro de app/selector-vehiculo/page.tsx
 *   km anuales: <10.000 → 8000 · 10-20.000 → 15.000 · 20-35.000 → 27.500 · >35.000 → 42.000
 *   combustible/año = km/100 × (gasolina 7,5 L × 1,65 € · diésel 5,5 L × 1,55 € · HEV 5,2 L × 1,65 €
 *                     · eléctrico 16 kWh × precio), con precio 0,22 (carga en casa/trabajo),
 *                     0,38 (solo pública) o 0,45 (sin carga); Math.round a euros.
 *   mantenimiento: gasolina 400 · diésel 450 · HEV 350 · eléctrico 200
 *   fijos: 650 + 35 + 120 = 805 · total = combustible + mant. + 805 · 5 años = total × 5
 *   La motorización NO sale de la tabla: es una cadena de reglas (eléctrico → PHEV → diésel →
 *   HEV sin carga → gasolina → HEV).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Índices de opción por pregunta (0 = la primera): km · conducción · viajes 300+ km · personas ·
 *   carga · presupuesto · zona · aparcamiento · terreno · acceso · nuevo/usado · prioridad · años.
 *
 *   CASO 1 (normal) — 20-35.000 km, autopista, algún viaje, solo/pareja, SIN carga, 15-25.000 €,
 *   ciudad media, garaje, terreno nunca, acceso indiferente, nuevo, «Bajo coste de uso», 3-7 años.
 *     Segmento: 1 persona, km altos + carretera, acceso no importa → «Berlina o Familiar».
 *     Motor: sin carga cómoda (ni eléctrico ni PHEV); km altos + carretera + años ≠ corto +
 *            presupuesto ≠ bajo → «Diésel», etiqueta C.
 *     Tabla (27.500 km, 0,45 €/kWh):
 *       eléctrico 275 × 16 × 0,45 = 1980 → 1980 + 200 + 805 = 2985 → × 5 = 14.925  (más barato)
 *       HEV       275 × 5,2 × 1,65 = 2359,5 → 2360 → 3515 → 17.575
 *       gasolina  275 × 7,5 × 1,65 = 3403,125 → 3403 → 4608 → 23.040
 *       diésel    275 × 5,5 × 1,55 = 2344,375 → 2344 → 3599 → 17.995  (recomendado)
 *     Razón: «27.500 km/año en carretera → el diésel amortiza su coste inicial en 2-3 años».
 *     ⇒ HALLAZGO: el diésel recomendado (a quien prioriza «Bajo coste de uso») cuesta 84 €/año más
 *       que el HEV de su propia tabla, y la tarjeta dice que tiene «el menor coste por km en
 *       autovía». En el modelo de la app el diésel no alcanza nunca al HEV: por 100 km gasta
 *       0,055 € menos y paga 100 € más de mantenimiento → empate a 181.818 km/año.
 *     REPARADO 19/11/2026: con «Bajo coste de uso» la regla del diésel ya no se aplica y sale
 *     «Híbrido (HEV)» (rama final); la tabla no cambia. El diésel sigue saliendo con otras
 *     prioridades, sin decir que sea el más barato.
 *
 *   CASO 2 (límite: el punto en que cambia la motorización, 10-20.000 km frente a 20-35.000 km)
 *     Mismo perfil salvo el km: ciudad, viajes nunca, solo/pareja, carga en casa, 25-40.000 €,
 *     gran ciudad, garaje, terreno nunca, acceso indiferente, me da igual, «Bajo coste de uso», 3-7.
 *     2a · 10-20.000 km → regla 1 (carga cómoda + ciudad + km bajos + ahorro) → «100% Eléctrico»,
 *          CERO, «Compacto (tipo B/C)» (gran ciudad + km bajos + 1 persona + garaje).
 *          Tabla 15.000 km, 0,22 €/kWh: eléctrico 528 → 1533 → 7665 · HEV 1287 → 2442 → 12.210 ·
 *          gasolina 1856,25 → 1856 → 3061 → 15.305 · diésel 1278,75 → 1279 → 2534 → 12.670.
 *     2b · 20-35.000 km → ya no hay km bajos; carga cómoda + presupuesto alto + km altos → PHEV.
 *          La fila «PHEV» usa la fórmula del eléctrico puro: 275 × 16 × 0,22 = 968 → 1973 → 9865.
 *          ⇒ HALLAZGOS: coste del PHEV = el del eléctrico puro (0 € de gasolina); ejemplos del
 *            mercado de GASOLINA (Renault Clio, Toyota Corolla, Seat Ibiza: compacto-bc no tiene
 *            lista «phev» y cae a la de gasolina); razones «no haces viajes largos → eléctrico
 *            totalmente viable» y «… + viajes largos → PHEV ideal» a quien dijo «Prácticamente nunca».
 *
 *   CASO 3 (rechazo) — sin elegir opción, «Siguiente pregunta» está deshabilitado y no avanza; en
 *     la pregunta 13, «Ver mi recomendación» tampoco. No hay forma de llegar al resultado con
 *     preguntas sin contestar.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y habrá
 * que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const RUTA = '/selector-vehiculo/';

// km · conducción · viajes · personas · carga · presupuesto · zona · aparcamiento · terreno ·
// acceso · nuevo/usado · prioridad · años
const DIESEL_SIN_CARGA = [2, 3, 1, 0, 3, 1, 1, 0, 2, 2, 0, 1, 1] as const;
const EV_KM_MEDIO = [1, 0, 2, 0, 0, 2, 0, 0, 2, 2, 2, 1, 1] as const;
const PHEV_KM_ALTO = [2, 0, 2, 0, 0, 2, 0, 0, 2, 2, 2, 1, 1] as const;
// <10.000 km, ciudad, viajes nunca, 1, sin carga, 15-25.000, gran ciudad, CALLE, terreno nunca,
// acceso «Algo importante», 2.ª mano reciente, «Precio inicial bajo», 3-7 años.
const URBANO_ACCESO_ALGO = [0, 0, 2, 0, 3, 1, 0, 1, 2, 1, 1, 0, 1] as const;
// 10-20.000 km, mixto, algún viaje, 5 o más, sin carga, 15-25.000, ciudad, CALLE, nunca, indiferente,
// nuevo, ahorro, 3-7 años.
const MONOVOLUMEN_CALLE = [1, 1, 1, 2, 3, 1, 1, 1, 2, 2, 0, 1, 1] as const;
// 20-35.000 km, carretera, algún viaje, 1, SOLO pública, 15-25.000, pueblo, garaje, nunca,
// indiferente, nuevo, «Impacto medioambiental», más de 7 años.
const PLANETA_DIESEL = [2, 2, 1, 0, 2, 1, 2, 0, 2, 2, 0, 3, 2] as const;
// 10-20.000 km, carretera, algún viaje, 1, sin carga, 15-25.000, ciudad, garaje, terreno FRECUENTE,
// indiferente, nuevo, ahorro, 3-7 años → SUV mediano + HEV (rama final).
const HEV_SUV_MEDIANO = [1, 2, 1, 0, 3, 1, 1, 0, 0, 2, 0, 1, 1] as const;
// Como el caso 1 pero presupuesto «Hasta 15.000 €» → gasolina con km altos.
const GASOLINA_KM_ALTOS = [2, 3, 1, 0, 3, 0, 1, 0, 2, 2, 0, 1, 1] as const;
// Más de 35.000 km, autopista, algún viaje, FAMILIA 3-4, sin carga, 15-25.000, ciudad, garaje,
// nunca, indiferente, nuevo, ahorro, 3-7 años.
const FAMILIA_AUTOPISTA = [3, 3, 1, 1, 3, 1, 1, 0, 2, 2, 0, 1, 1] as const;

/** Las respuestas del motor (id de pregunta → valor) para unos índices de opción. */
function perfil(indices: readonly number[]): Record<number, string> {
  return Object.fromEntries(PREGUNTAS.map((p, i) => [p.id, p.opciones[indices[i]].valor]));
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Sin <input> no hay rastreador que sondear: el testigo es que React haya colgado sus props del
  // botón de inicio (mismo criterio que selector-movilidad-urbana).
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent?.includes('Empezar el test'));
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    null,
    { timeout: 20_000 },
  );
}

const opciones = (page: Page) => page.locator('main button[aria-pressed]');

async function responder(page: Page, indices: readonly number[]): Promise<void> {
  await abrir(page);
  await page.getByRole('button', { name: 'Empezar el test' }).click();
  for (let i = 0; i < indices.length; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} de 13`)).toBeVisible();
    await opciones(page).nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver mi recomendación' : 'Siguiente pregunta' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Tu recomendación personalizada' })).toBeVisible();
}

const limpiar = (t: string) => t.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/** Celdas de una fila de la tabla de costes, sin la del motor: combustible, mant., fijos, año, 5 años. */
async function fila(page: Page, motor: string): Promise<string[]> {
  const celdas = await page.getByRole('row').filter({ hasText: motor }).getByRole('cell').allInnerTexts();
  return celdas.slice(1).map(limpiar);
}

const euros = (t: string) => parseSpanishNumber(t.replace(/[€\s ]/g, ''));

const razones = (page: Page) => page.locator('h3:has-text("Por qué esta recomendación") + ul > li');
const avisoApp = (page: Page) => page.getByRole('alert').filter({ has: page.getByRole('heading', { name: 'Ten en cuenta' }) });
const ejemplos = (page: Page) => page.getByText('Ejemplos del mercado:').locator('xpath=following-sibling::div');

async function jsonLd(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!hallado) throw new Error(`Sin JSON-LD ${tipo}`);
  return hallado;
}

test.describe('selector-vehiculo — los tres casos resueltos a mano', () => {
  test('caso 1 · 27.500 km por autopista sin carga y «Bajo coste de uso» → Berlina o Familiar híbrida, y la tabla sale de la fórmula', async ({ page }) => {
    // REPARADO 19/11/2026 (5235): salía «Diésel», 3599 €/año, al lado de un HEV de 3515 €. Con la
    // prioridad «Bajo coste de uso» la regla del diésel ya no se aplica y cae a la rama final (HEV).
    await responder(page, DIESEL_SIN_CARGA);
    await expect(page.getByText('Basada en tu perfil de 27.500 km/año')).toBeVisible();
    await expect(page.getByText('Berlina o Familiar', { exact: true })).toBeVisible();
    await expect(page.getByText('Híbrido (HEV)', { exact: true })).toBeVisible();
    await expect(page.getByText('ECO', { exact: true })).toBeVisible();
    // Esperados del comentario de cabecera (caso 1)
    expect(await fila(page, '100% Eléctrico')).toEqual(['1980,00 €', '200,00 €', '805,00 €', '2985,00 €', '14.925,00 €']);
    expect(await fila(page, 'Híbrido (HEV)')).toEqual(['2360,00 €', '350,00 €', '805,00 €', '3515,00 €', '17.575,00 €']);
    expect(await fila(page, 'Gasolina')).toEqual(['3403,00 €', '400,00 €', '805,00 €', '4608,00 €', '23.040,00 €']);
    expect(await fila(page, 'Diésel')).toEqual(['2344,00 €', '450,00 €', '805,00 €', '3599,00 €', '17.995,00 €']);
    await expect(page.getByRole('row').filter({ hasText: 'Híbrido (HEV)' })).toContainText('Recomendado');
    await expect(page.getByRole('row').filter({ hasText: '100% Eléctrico' })).toContainText('Más barato');
    await expect(razones(page)).toHaveText([/Sin punto de carga propio → el híbrido convencional es la opción más eficiente disponible$/]);
    await expect(avisoApp(page)).toHaveCount(0);
  });

  test('caso 2a · 15.000 km con carga en casa → eléctrico, 528 € de electricidad a 0,22 €/kWh', async ({ page }) => {
    await responder(page, EV_KM_MEDIO);
    await expect(page.getByText('Basada en tu perfil de 15.000 km/año')).toBeVisible();
    await expect(page.getByText('Compacto (tipo B/C)', { exact: true })).toBeVisible();
    await expect(page.getByText('100% Eléctrico', { exact: true })).toBeVisible();
    await expect(page.getByText('CERO', { exact: true })).toBeVisible();
    expect(await fila(page, '100% Eléctrico')).toEqual(['528,00 €', '200,00 €', '805,00 €', '1533,00 €', '7665,00 €']);
    expect(await fila(page, 'Híbrido (HEV)')).toEqual(['1287,00 €', '350,00 €', '805,00 €', '2442,00 €', '12.210,00 €']);
    expect(await fila(page, 'Gasolina')).toEqual(['1856,00 €', '400,00 €', '805,00 €', '3061,00 €', '15.305,00 €']);
    expect(await fila(page, 'Diésel')).toEqual(['1279,00 €', '450,00 €', '805,00 €', '2534,00 €', '12.670,00 €']);
    await expect(page.getByText('Más barato')).toHaveCount(0); // el recomendado ya es el más barato
  });

  test('caso 2b · el mismo perfil con 27.500 km cruza la frontera → PHEV, con su propia fila y la del eléctrico', async ({ page }) => {
    await responder(page, PHEV_KM_ALTO);
    await expect(page.getByText('Basada en tu perfil de 27.500 km/año')).toBeVisible();
    await expect(page.getByText('Híbrido Enchufable (PHEV)', { exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'PHEV' })).toContainText('Recomendado');
    // REPARADO 19/11/2026 (5234). Hasta entonces la fila «PHEV» era la del eléctrico puro
    // (968 € = 275 × 16 × 0,22, 200 € de mantenimiento) y la del eléctrico desaparecía. Ahora, con
    // el supuesto de la nota (mitad de los km en eléctrico, mitad con el consumo del HEV):
    //   275 × (0,5 × 16 × 0,22 + 0,5 × 5,2 × 1,65) = 484 + 1179,75 = 1663,75 → 1664
    //   1664 + 350 (mantenimiento del HEV) + 805 = 2819 → × 5 = 14.095
    expect(await fila(page, 'PHEV')).toEqual(['1664,00 €', '350,00 €', '805,00 €', '2819,00 €', '14.095,00 €']);
    expect(await fila(page, '100% Eléctrico')).toEqual(['968,00 €', '200,00 €', '805,00 €', '1973,00 €', '9865,00 €']);
    await expect(page.getByRole('row').filter({ hasText: '100% Eléctrico' })).toContainText('Más barato');
    expect(await fila(page, 'Híbrido (HEV)')).toEqual(['2360,00 €', '350,00 €', '805,00 €', '3515,00 €', '17.575,00 €']);
    await expect(page.getByText(/PHEV: supone la mitad de los km en eléctrico/)).toBeVisible();
  });

  test('caso 3 · sin contestar no se avanza, ni en la primera ni en la última pregunta', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Empezar el test' }).click();
    const siguiente = page.getByRole('button', { name: 'Siguiente pregunta' });
    await expect(page.getByText('Pregunta 1 de 13')).toBeVisible();
    await expect(siguiente).toBeDisabled();
    await siguiente.click({ force: true });
    await expect(page.getByText('Pregunta 1 de 13')).toBeVisible();
    await expect(opciones(page).and(page.locator('[aria-pressed="true"]'))).toHaveCount(0);
    for (let i = 1; i <= 12; i++) {
      await opciones(page).first().click();
      await siguiente.click();
    }
    await expect(page.getByText('Pregunta 13 de 13')).toBeVisible();
    const ver = page.getByRole('button', { name: 'Ver mi recomendación' });
    await expect(ver).toBeDisabled();
    await ver.click({ force: true });
    await expect(page.getByRole('heading', { name: 'Tu recomendación personalizada' })).toHaveCount(0);
    await opciones(page).first().click();
    await expect(ver).toBeEnabled();
  });
});

test.describe('selector-vehiculo — hallazgos (inspector 19/11/2026)', () => {
  test('HALLAZGO 5235 · a quien prioriza el bajo coste de uso no se le recomienda un motor más caro que el HEV de su propia tabla', async ({ page }) => {
    // REPARADO 19/11/2026: caso 1 → «Diésel ✓ Recomendado» 3599,00 €/año frente a «Híbrido (HEV)»
    // 3515,00 €, con la tarjeta diciendo que el diésel «tiene el menor coste por km en autovía».
    // Con estos consumos el diésel no alcanza nunca al HEV (empate a 181.818 km/año).
    await responder(page, DIESEL_SIN_CARGA);
    const recomendado = await page.getByRole('row').filter({ hasText: 'Recomendado' }).getByRole('cell').nth(4).innerText();
    const hev = (await fila(page, 'Híbrido (HEV)'))[3];
    expect(euros(recomendado)).toBeLessThanOrEqual(euros(hev));
  });

  test('HALLAZGO 5235 · cuando sale el diésel, la tarjeta no lo llama el de menor coste ni la razón dice que se amortiza', async ({ page }) => {
    // Con otra prioridad el diésel sigue saliendo (PLANETA_DIESEL): su texto dice lo que la tabla
    // sostiene, que gasta menos que la gasolina (2344 € frente a 3403 € a 27.500 km).
    await responder(page, PLANETA_DIESEL);
    await expect(page.getByText('Diésel', { exact: true })).toBeVisible();
    // La tarjeta del motor y las razones (la guía dice, con razón, que el ELÉCTRICO tiene el menor
    // coste por km: no se mira)
    const tarjeta = page.getByText('Motorización recomendada', { exact: true }).locator('..');
    await expect(tarjeta).not.toContainText('menor coste por km');
    await expect(tarjeta).toContainText('mira la fila del híbrido');
    await expect(razones(page).filter({ hasText: 'amortiza' })).toHaveCount(0);
    await expect(razones(page).first()).toHaveText(/27\.500 km\/año en carretera → el diésel gasta menos combustible que la gasolina \(2344,00\s€ frente a 3403,00\s€ al año en la tabla\)$/);
  });

  test('HALLAZGO 5234 · el coste del PHEV incluye la gasolina de sus kilómetros en térmico', async ({ page }) => {
    // REPARADO 19/11/2026: la fila «PHEV» era 275 × 16 kWh × 0,22 € = 968,00 € de electricidad,
    // 0 € de gasolina y 200 € de mantenimiento, exactamente el eléctrico puro. Ahora el PHEV es un
    // motor propio en motor.ts (cifras del caso 2b).
    await responder(page, PHEV_KM_ALTO);
    const [combustible, mantenimiento] = await fila(page, 'PHEV');
    expect(euros(combustible)).toBeGreaterThan(968);
    expect(euros(mantenimiento)).toBeGreaterThan(200);
  });

  test('HALLAZGO 5234 · motor: la cuota eléctrica del PHEV se aplica a los km, y sin km eléctricos sería el HEV', () => {
    const c = calcularCostes(27_500, 0.22);
    expect(c.phev).toEqual({ combustible: 1664, mantenimiento: 350, total: 2819, total5: 14_095 });
    // Con la mitad de los km en eléctrico, la energía es la media de la del eléctrico y la del HEV
    expect(c.phev.combustible).toBe(Math.round((c.electrico.combustible + c.hibrido.combustible) / 2));
    expect(c.phev.mantenimiento).toBe(c.hibrido.mantenimiento);
  });

  test('HALLAZGO 5236 · los ejemplos del mercado de un PHEV son PHEV, no coches de gasolina', async ({ page }) => {
    // REPARADO 19/11/2026: urbano, compacto-bc y monovolumen no tienen lista «phev» y caían a la
    // de gasolina: caso 2b → «Renault Clio · Toyota Corolla · Seat Ibiza» bajo «Híbrido Enchufable
    // (PHEV)». Ahora, sin lista, no hay ejemplos (el acta admitía «o ningún ejemplo»).
    await responder(page, PHEV_KM_ALTO);
    await expect(page.getByText('Compacto (tipo B/C)', { exact: true })).toBeVisible();
    await expect(page.getByText('Ejemplos del mercado:')).toHaveCount(0);
    await expect(page.getByText(/Renault Clio|Seat Ibiza/)).toHaveCount(0);
    // Y donde la hay, la de su motor
    expect(modelosDe('suv-familiar', 'phev')).toEqual(['Peugeot 3008 PHEV', 'Hyundai Tucson PHEV', 'Kia Sportage PHEV']);
    expect(modelosDe('monovolumen', 'phev')).toEqual([]);
  });

  test('HALLAZGO 5237 · las razones del PHEV no contradicen «Prácticamente nunca» viajes largos', async ({ page }) => {
    // REPARADO 19/11/2026: caso 2b → «Tienes punto de carga … y no haces viajes largos → eléctrico
    // totalmente viable» y, debajo, «Presupuesto alto + carga disponible + viajes largos → PHEV
    // ideal». La primera se disparaba con motorPrincipal === 'electrico', que el PHEV cumplía.
    await responder(page, PHEV_KM_ALTO);
    await expect(razones(page).filter({ hasText: 'eléctrico totalmente viable' })).toHaveCount(0);
    await expect(razones(page).filter({ hasText: 'viajes largos' })).toHaveCount(0);
    await expect(razones(page)).toHaveText([
      /^✓\s*27\.500 km\/año con carga en casa → el PHEV hace en eléctrico los trayectos del día a día/,
      /^✓\s*Presupuesto de más de 25\.000 € → cabe el sobreprecio de un híbrido enchufable$/,
    ]);
  });

  test('HALLAZGO 5238 · «Por qué esta recomendación» no da razones contrarias al segmento recomendado (urbano)', async ({ page }) => {
    // REPARADO 19/11/2026: acceso «Algo importante» + calle → «Urbano o Compacto B» con «se prioriza
    // la altura de acceso del SUV frente al compacto» y, a la vez, «tamaño compacto más manejable».
    await responder(page, URBANO_ACCESO_ALGO);
    await expect(page.getByText('Urbano o Compacto B', { exact: true })).toBeVisible();
    await expect(razones(page).filter({ hasText: 'se prioriza la altura de acceso del SUV' })).toHaveCount(0);
    await expect(razones(page).filter({ hasText: 'tamaño compacto más manejable' })).toHaveCount(1);
    // Cuando el segmento SÍ es un SUV, la razón del acceso sigue saliendo: «Algo importante» en
    // una ciudad media aparcando en la calle → SUV compacto (rama «ciudad + calle»).
    const suv = calcularRecomendacion(perfil([0, 0, 2, 0, 3, 1, 1, 1, 2, 1, 1, 0, 1]));
    expect(suv.segmentoKey).toBe('suv-compacto');
    expect(suv.razones).toContain('Facilidad de acceso relevante → se prioriza la altura de acceso del SUV frente al compacto');
  });

  test('HALLAZGO 5238 · a un monovolumen de 7 plazas no se le da la razón «tamaño compacto»', async ({ page }) => {
    // REPARADO 19/11/2026: 5 o más personas + calle → «Monovolumen o SUV Grande 7 plazas» con
    // «Aparcar habitualmente en calle → tamaño compacto más manejable para maniobrar».
    await responder(page, MONOVOLUMEN_CALLE);
    await expect(page.getByText('Monovolumen o SUV Grande 7 plazas', { exact: true })).toBeVisible();
    await expect(razones(page).filter({ hasText: 'tamaño compacto' })).toHaveCount(0);
    await expect(razones(page).filter({ hasText: '5 o más ocupantes habituales' })).toHaveCount(1);
  });

  test('HALLAZGO 5238 · con prioridad medioambiental y diésel no se dice que se maximizan las cero emisiones', async ({ page }) => {
    // REPARADO 19/11/2026: «Impacto medioambiental» + 27.500 km por carretera → «Diésel» (C) con la
    // razón «Prioridad medioambiental → se maximiza la eficiencia y/o cero emisiones en el uso
    // cotidiano». Ahora la razón depende del motor recomendado, y con diésel o gasolina no sale.
    await responder(page, PLANETA_DIESEL);
    await expect(page.getByText('Diésel', { exact: true })).toBeVisible();
    await expect(razones(page).filter({ hasText: 'Prioridad medioambiental' })).toHaveCount(0);
    // El mismo «Impacto medioambiental» con 15.000 km sale HEV, y su razón dice lo que la tabla
    // sostiene (5,2 L/100 km frente a 7,5 y 5,5).
    const hev = calcularRecomendacion(perfil([1, 2, 1, 0, 3, 1, 1, 0, 0, 2, 0, 3, 1]));
    expect(hev.motorPrincipal).toBe('hibrido');
    expect(hev.razones).toContain('Prioridad medioambiental → el híbrido consume menos combustible que la gasolina y el diésel de la tabla');
  });

  test('HALLAZGO 5239 · el aviso de ahorro gasolina/HEV cuadra con la tabla de al lado', async ({ page }) => {
    // REPARADO 19/11/2026: 27.500 km y presupuesto «Hasta 15.000 €» → gasolina; el aviso decía
    // «puede suponer 500-900 € de ahorro al año» y la tabla da 4608 − 3515 = 1093 € (HEV) y
    // 4608 − 3599 = 1009 € (diésel). Ahora el aviso lee esas dos restas.
    await responder(page, GASOLINA_KM_ALTOS);
    const aviso = limpiar(await avisoApp(page).innerText());
    const ahorroHev = euros((await fila(page, 'Gasolina'))[3]) - euros((await fila(page, 'Híbrido (HEV)'))[3]);
    const ahorroDiesel = euros((await fila(page, 'Gasolina'))[3]) - euros((await fila(page, 'Diésel'))[3]);
    expect(ahorroHev).toBe(1093);
    expect(ahorroDiesel).toBe(1009);
    expect(aviso).not.toContain('500-900');
    expect(aviso).toContain('un híbrido te ahorraría unos 1093,00 € al año de uso frente a la gasolina, y un diésel unos 1009,00 €');
    // Con más de 35.000 km (42.000 en el cálculo): 1644 € y 1567 €
    const mucho = calcularRecomendacion(perfil([3, 3, 1, 0, 3, 0, 1, 0, 2, 2, 0, 1, 1]));
    expect(mucho.motorPrincipal).toBe('gasolina');
    expect(limpiar(mucho.alertas.join(' '))).toContain('unos 1644,00 € al año de uso frente a la gasolina, y un diésel unos 1567,00 €');
  });

  test('HALLAZGO 5240 · el precio de la electricidad de la nota es el que usa la cifra', async ({ page }) => {
    // REPARADO 19/11/2026: sin carga, 15.000 km → «100% Eléctrico» 1080,00 € = 150 × 16 × 0,45 €/kWh;
    // la nota decía «electricidad doméstica 0,22 €/kWh», con la que saldrían 528 €. Con solo carga
    // pública usa 0,38 €/kWh, que tampoco se decía.
    await responder(page, HEV_SUV_MEDIANO);
    const nota = limpiar(await page.getByText(/Fijos: seguro medio 650/).innerText());
    const precio = parseSpanishNumber(nota.match(/electricidad ([\d,]+) €\/kWh/)![1]);
    const electricidad = euros((await fila(page, '100% Eléctrico'))[0]);
    expect(electricidad).toBe(1080);
    expect(precio).toBe(0.45);
    expect(electricidad).toBe(Math.round(150 * 16 * precio));
    expect(nota).toContain('electricidad 0,45 €/kWh (sin punto de carga propio, toda la recarga en cargadores rápidos)');
    // Solo carga pública: 0,38 €/kWh, y lo dice
    const publica = calcularRecomendacion(perfil([2, 2, 1, 0, 2, 1, 2, 0, 2, 2, 0, 3, 2]));
    expect(publica.costes.electrico.combustible).toBe(Math.round(275 * 16 * 0.38));
    expect(textoPrecios(publica)).toContain('electricidad 0,38 €/kWh (solo en cargadores públicos)');
  });

  test('HALLAZGO 5247 · bajo «Híbrido (HEV)» con etiqueta ECO no salen híbridos enchufables', async ({ page }) => {
    // REPARADO 19/11/2026: SUV mediano + HEV → «Toyota RAV4 Hybrid · Kia Sorento Hybrid ·
    // Mitsubishi Outlander PHEV». Un PHEV de ≥ 40 km es «0 emisiones», no ECO (Orden PCI/810/2018,
    // BOE-A-2018-10856, anexo II). La lista de berlina-familiar metía igual el «Skoda Octavia iV».
    await responder(page, HEV_SUV_MEDIANO);
    await expect(page.getByText('Híbrido (HEV)', { exact: true })).toBeVisible();
    await expect(ejemplos(page)).toHaveText(/Toyota RAV4 Hybrid\s*Kia Sorento Hybrid$/);
    for (const seg of Object.keys(SEGMENTOS) as (keyof typeof SEGMENTOS)[]) {
      expect(modelosDe(seg, 'hibrido').join(' '), seg).not.toMatch(/PHEV|\biV\b|enchufable/i);
    }
  });

  test('HALLAZGO 5249 · una familia con 42.000 km por autopista y acceso indiferente puede salir en berlina', async ({ page }) => {
    // REPARADO 19/11/2026: la rama «familia + carretera» era `accesoImportante ? 'suv-familiar' :
    // 'suv-familiar'` (el comentario decía «SUV familiar o berlina»). La misma persona sola salía
    // «Berlina o Familiar». Ahora la familia sigue la regla de la línea de «km altos + carretera».
    await responder(page, FAMILIA_AUTOPISTA);
    await expect(page.getByText('Berlina o Familiar', { exact: true })).toBeVisible({ timeout: 2_000 });
    // Con acceso «Algo importante» sigue en SUV, y con 15.000 km mixtos también
    const conAcceso = [...FAMILIA_AUTOPISTA];
    conAcceso[9] = 1;
    expect(calcularRecomendacion(perfil(conAcceso)).segmentoKey).toBe('suv-familiar');
    const kmMedios = [...FAMILIA_AUTOPISTA];
    kmMedios[0] = 1;
    kmMedios[1] = 1;
    expect(calcularRecomendacion(perfil(kmMedios)).segmentoKey).toBe('suv-familiar');
  });

  test('HALLAZGO 5243 · tras «Empezar», «Siguiente», el resultado y «Repetir» el foco no se pierde en el body', async ({ page }) => {
    // REPARADO 19/11/2026: el botón de inicio se desmontaba y «Siguiente» quedaba deshabilitado en la
    // pregunta nueva (aún sin responder): el foco caía a <body> y el siguiente Tab iba al logo. Igual
    // al ver el resultado y al repetir el test. Ahora va al enunciado, al título del resultado y,
    // de vuelta al principio, a «Empezar el test».
    await abrir(page);
    await page.getByRole('button', { name: 'Empezar el test' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 1 de 13')).toBeVisible();
    const enunciado = page.getByRole('heading', { level: 2, name: PREGUNTAS[0].pregunta });
    await expect(enunciado).toBeFocused();
    // El siguiente Tab entra en las opciones, no vuelve al logo
    await page.keyboard.press('Tab');
    await expect(opciones(page).first()).toBeFocused();
    await opciones(page).nth(1).click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 de 13')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: PREGUNTAS[1].pregunta })).toBeFocused();
    // Resultado y «Repetir el test»
    await responder(page, DIESEL_SIN_CARGA);
    await expect(page.getByRole('heading', { level: 1, name: 'Tu recomendación personalizada' })).toBeFocused();
    await page.getByRole('button', { name: 'Repetir el test' }).focus();
    await page.keyboard.press('Enter');
    const empezar = page.getByRole('button', { name: 'Empezar el test' });
    await expect(empezar).toBeFocused();
    await expect(empezar).toBeInViewport();
  });

  test('HALLAZGO 5244 · un doble clic en «Empezar el test» no contesta la pregunta 1', async ({ page }) => {
    // REPARADO 19/11/2026: el segundo clic caía sobre «Más de 35.000 km» y lo dejaba marcado
    // (42.000 km/año en el cálculo) sin que el usuario lo hubiera elegido. Ahora useGuardaRafaga.
    await abrir(page);
    await page.getByRole('button', { name: 'Empezar el test' }).dblclick();
    await expect(page.getByText('Pregunta 1 de 13')).toBeVisible();
    await expect(opciones(page).and(page.locator('[aria-pressed="true"]'))).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
    // Un clic suelto sobre una opción sigue contestando
    await opciones(page).nth(2).click();
    await expect(opciones(page).nth(2)).toHaveAttribute('aria-pressed', 'true');
  });

  test('HALLAZGO 5245 · los metadatos dicen las mismas 13 preguntas que la página', async ({ page }) => {
    // REPARADO 19/11/2026: og:title «Test en 9 preguntas», twitter:description «Test de 9 preguntas»
    // y la característica «Test de 9 preguntas sobre uso y perfil» del meta schema:WebApplication;
    // la página dice «13 preguntas» y la barra «Pregunta 1 de 13». Ahora el número sale de TOTAL.
    await page.goto(RUTA);
    await expect(page.getByText('13 preguntas para dar con el coche')).toBeVisible();
    expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toContain('Test en 13 preguntas');
    expect(await page.locator('meta[name="twitter:description"]').getAttribute('content')).toContain('Test de 13 preguntas');
    const meta = await page.locator('meta[name="schema:WebApplication"]').getAttribute('content');
    expect(meta).toContain('Test de 13 preguntas');
    expect(meta).not.toContain('9 preguntas');
  });

  test('HALLAZGO 5246 · el JSON-LD WebApplication lista al menos 4 características', async ({ page }) => {
    // REPARADO 19/11/2026: jsonLd de metadata.ts con `features: []` → «featureList»: [] en el HTML
    // servido. Ahora lleva las seis que propuso el Inspector tras verlas funcionar.
    await page.goto(RUTA);
    const app = await jsonLd(page, 'WebApplication');
    const lista = app.featureList as string[];
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.length).toBeLessThanOrEqual(8);
    expect(lista).toContain('Test de 13 preguntas sobre uso, situación y prioridades');
  });

  test('HALLAZGO 5241 · el FAQPage da bien las etiquetas DGT', async ({ page }) => {
    // REPARADO 19/11/2026: «solo pueden circular libremente vehículos con etiqueta ECO o ZERO» (la
    // etiqueta es «0 emisiones»/CERO) y «etiqueta B (la mayoría de gasolina anteriores a 2015 y
    // diésel anteriores a 2019)». La Orden PCI/810/2018 (BOE-A-2018-10856, anexo II, leída el
    // 19/11/2026) da la C a la «gasolina Euro 4/IV, 5/V o 6/VI o diésel Euro 6/VI» y la B a la
    // «gasolina Euro 3/III o diésel Euro 4/IV o 5/V»; fechas de la DGT en FECHAS_DGT de etiqueta-dgt.
    await page.goto(RUTA);
    const faq = JSON.stringify(await jsonLd(page, 'FAQPage'));
    expect(faq).not.toContain('ZERO');
    expect(faq).not.toContain('gasolina anteriores a 2015');
    expect(faq).not.toContain('solo pueden circular libremente');
    expect(faq).toContain('«0 emisiones» (CERO)');
    expect(faq).toContain('La C corresponde a los turismos de gasolina Euro 4, 5 o 6 (en general, matriculados desde 2006) y a los diésel Euro 6 (desde septiembre de 2015)');
    expect(faq).toContain('la B, a los de gasolina Euro 3 (desde 2001) y a los diésel Euro 4 o 5 (de 2006 a agosto de 2015)');
  });

  test('HALLAZGO 5242 · el acceso de la C a las ZBE se dice igual en la tarjeta, el aviso y el FAQPage', async ({ page }) => {
    // REPARADO 19/11/2026: tres versiones incompatibles —tarjeta C «restricciones ZBE solo en alta
    // contaminación», FAQPage «solo pueden circular libremente ECO o ZERO», aviso «sin etiqueta CERO
    // o ECO tienen limitaciones en Madrid, Barcelona, Sevilla»— y ninguna como app/etiqueta-dgt/zbe.ts
    // (Barcelona no restringe la C ni la B). Ahora las tres dicen ZBE_SEGUN_CIUDAD.
    const comun = 'Cada ciudad fija en su ordenanza qué distintivos entran en su ZBE y dónde';
    await page.goto(RUTA);
    expect(JSON.stringify(await jsonLd(page, 'FAQPage'))).toContain(comun);
    // Tarjeta de la C (diésel, PLANETA_DIESEL)
    await responder(page, PLANETA_DIESEL);
    const tarjeta = page.getByText('Motorización recomendada', { exact: true }).locator('..');
    await expect(tarjeta).toContainText(comun);
    await expect(tarjeta).toContainText('Diésel Euro 6 (matriculado desde septiembre de 2015)');
    await expect(tarjeta).not.toContainText('solo en alta contaminación');
    // Aviso de gran ciudad (PHEV_KM_ALTO vive en «Gran ciudad»)
    await responder(page, PHEV_KM_ALTO);
    await expect(avisoApp(page)).toContainText(comun);
    await expect(avisoApp(page)).not.toContainText('Madrid, Barcelona, Sevilla');
  });

  test('HALLAZGO 5248 · el FAQPage no pregunta por «2025» en una página de 2026', async ({ page }) => {
    // REPARADO 19/11/2026: «¿Merece la pena comprar un coche eléctrico en 2025?» → sin año.
    await page.goto(RUTA);
    const faq = JSON.stringify(await jsonLd(page, 'FAQPage'));
    expect(faq).not.toContain('en 2025?');
    expect(faq).toContain('¿Merece la pena comprar un coche eléctrico?');
  });
});
