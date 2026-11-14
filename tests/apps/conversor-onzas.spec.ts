import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — conversor-onzas (segmento motor · Coquinum, riesgo 3)
 *
 * Primera inspección: 14/11/2026. La app promete en su <h1> «Conversor de onzas» y en el
 * subtítulo «De onzas a gramos, mililitros, libras y tazas», separando la onza de peso de la
 * onza líquida y la de EE. UU. de la de Reino Unido. Hay verdad comprobable: son definiciones.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/onzas.ts → convertir(valor, unidad, lista): valor × factor / factor destino.
 *   No lo usa el MCP (app/api/mcp/route.ts convierte con lib/calculadoras/conversorUnidades).
 *   app/conversor-onzas/page.tsx → lee con `parseFloat(x.replace(',', '.'))` y pinta con
 *   formatNumber: 0 decimales desde 100, 1 desde 10 y 2 por debajo.
 *
 * DEFINICIONES (exactas, del encargo del Inspector; el motor usa las mismas)
 *   onza avoirdupois = 28,349523125 g · libra = 453,59237 g = 16 oz
 *   onza líquida US = 29,5735295625 ml · imperial (UK) = 28,4130625 ml · taza US = 8 fl oz US
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal)
 *     8 oz (estado inicial) → 226,796185 g «227» · 0,5 lb «0,50» · 0,2268 kg «0,23»
 *     «2,5» oz (coma) → 70,8738 g «70,9» · 0,15625 lb «0,16» · 0,07087 kg «0,07»
 *     1000 lb → 16 000 oz «16.000» · 453 592,37 g «453.592» · 453,59 kg «454»
 *     12 fl oz US → 354,882 ml «355» · 0,3549 l «0,35» · 1,5 tazas «1,50»
 *     20 fl oz UK (pinta imperial) → 568,261 ml «568» · 0,5683 l «0,57» · 2,4019 tazas US «2,40»
 *   CASO 2 (límite)
 *     0 oz → «0,00» en las tres · vacío → sin cifras, con el texto de espera
 *     1 g → 0,035274 oz · 0,0022046 lb · 0,001 kg (con dos decimales fijos: 0,04 · 0,00 · 0,00)
 *     −8 oz → no es una cantidad de ingrediente: no debe dar «−227 g»
 *   CASO 3 (rechazo / lectura en español)
 *     «abc» → sin cifras · «12abc» y «1e3» → sin cifras (parseSpanishNumber da NaN)
 *     «1.500» g = mil quinientos → 52,9109 oz «52,9» · 3,30693 lb «3,31» · 1,5 kg «1,50»
 *     «1.234,5» g → 43,5457 oz «43,5» · 2,72162 lb «2,72»
 *     Ida y vuelta: 1500 oz → la app escribe «42.524» g; ese mismo «42.524» en gramos debe volver
 *     a 1499,99 oz «1500».
 *
 * HALLAZGOS del 14/11/2026 (ABIERTOS: sus tests afirman lo correcto y llevan test.fail())
 *   A. Parser casero: «1.500» g se lee 1,5 g (0,05 oz), «42.524» g vuelve como 1,50 oz, «12abc»
 *      se lee 12 y «1e3» se lee 1000.
 *   B. Dos decimales fijos por debajo de 10: 1 g → «0,04 oz» (+13 %), «0,00 lb» y «0,00 kg».
 *   C. Una cantidad negativa da cifras negativas sin aviso.
 *   D. Formato: «Verificado 2026-07» (fecha ISO) y «100%» pegado en el JSON-LD.
 *   E. Pestañas (role="tab") sin aria-controls ni role="tabpanel".
 *   F. FAQ del JSON-LD: la onza de peso solo es la avoirdupois; ni rastro de la troy (31,10 g).
 *   Las features del JSON-LD (7) describen lo que la app hace: sin hallazgo. No hay FAQ visible
 *   que pueda contradecir al JSON-LD.
 */

const RUTA = '/conversor-onzas/';
const ESPERA = 'Introduce una cantidad para ver la conversión';

/** La zona de resultado de la app (no el anunciador de rutas de Next). */
function zonaResultado(page: Page): Locator {
  return page.getByRole('region', { name: 'Conversor de onzas' }).getByRole('status');
}

/** Cifras pintadas, por abreviatura de unidad: { g: '227', lb: '0,50', kg: '0,23' }. */
async function leerResultado(page: Page): Promise<Record<string, string>> {
  const textos = (await zonaResultado(page).locator('span').allTextContents()).map((t) => t.trim());
  if (textos.length === 1) return { espera: textos[0] };
  const salida: Record<string, string> = {};
  for (let i = 0; i + 1 < textos.length; i += 2) salida[textos[i + 1]] = textos[i];
  return salida;
}

/** Cifra en formato español a número; «≈0» o un texto no numérico dan NaN. */
const aNumero = (s: string | undefined): number =>
  s && /^-?[\d.]+(,\d+)?$/.test(s) ? Number(s.replace(/\./g, '').replace(',', '.')) : NaN;

async function teclear(page: Page, texto: string): Promise<void> {
  await page.locator('#cantidad').fill(texto);
  await esperarValorEnReact(page, '#cantidad', texto);
}

async function elegirUnidad(page: Page, unidad: string): Promise<void> {
  await page.locator('#unidad').selectOption(unidad);
  await expect(page.locator('#unidad')).toHaveValue(unidad);
}

async function ldDeTipo(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!hallado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return hallado;
}

test.describe('conversor-onzas — Inspector 14/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#cantidad']);
  });

  // ── CASO 1 · normal ────────────────────────────────────────────────────────
  test('CASO 1 · estado inicial: 8 oz = 227 g, 0,50 lb y 0,23 kg', async ({ page }) => {
    // 8 × 28,349523125 = 226,796185 g; 8/16 = 0,5 lb; 0,226796 kg
    await expect.poll(() => leerResultado(page)).toEqual({ g: '227', lb: '0,50', kg: '0,23' });
  });

  test('CASO 1 · «2,5» oz se lee con la coma: 70,9 g, 0,16 lb, 0,07 kg', async ({ page }) => {
    // 2,5 × 28,349523125 = 70,8738 g; 2,5/16 = 0,15625 lb; 0,0709 kg
    await teclear(page, '2,5');
    await expect.poll(() => leerResultado(page)).toEqual({ g: '70,9', lb: '0,16', kg: '0,07' });
  });

  test('CASO 1 · 1000 lb: punto de millares desde cinco cifras enteras', async ({ page }) => {
    // 1000 × 16 = 16 000 oz; 1000 × 453,59237 = 453 592,37 g; 453,59 kg
    await elegirUnidad(page, 'lb');
    await teclear(page, '1000');
    await expect.poll(() => leerResultado(page)).toEqual({ oz: '16.000', g: '453.592', kg: '454' });
  });

  test('CASO 1 · onzas líquidas: 12 fl oz US y 20 fl oz UK', async ({ page }) => {
    await page.getByRole('tab', { name: /Onzas líquidas/ }).click();
    await expect(page.getByRole('tab', { name: /Onzas líquidas/ })).toHaveAttribute('aria-selected', 'true');
    // Estado inicial del volumen: 8 fl oz US = 236,588 ml = 1 taza
    await expect.poll(() => leerResultado(page)).toEqual({ ml: '237', l: '0,24', taza: '1,00' });
    // 12 × 29,5735295625 = 354,882 ml; 1,5 tazas
    await teclear(page, '12');
    await expect.poll(() => leerResultado(page)).toEqual({ ml: '355', l: '0,35', taza: '1,50' });
    // Reino Unido: 20 × 28,4130625 = 568,26125 ml; 568,26 / 236,588 = 2,4019 tazas US
    const uk = page.getByRole('button', { name: /Reino Unido/ });
    await uk.click();
    await expect(uk).toHaveAttribute('aria-pressed', 'true');
    await teclear(page, '20');
    await expect.poll(() => leerResultado(page)).toEqual({ ml: '568', l: '0,57', taza: '2,40' });
  });

  // ── CASO 2 · límite ────────────────────────────────────────────────────────
  test('CASO 2 · 0 oz da 0,00 en las tres; vacío y «abc» no dan cifras', async ({ page }) => {
    await teclear(page, '0');
    await expect.poll(() => leerResultado(page)).toEqual({ g: '0,00', lb: '0,00', kg: '0,00' });
    await teclear(page, '');
    await expect.poll(() => leerResultado(page)).toEqual({ espera: ESPERA });
    await teclear(page, 'abc');
    await expect.poll(() => leerResultado(page)).toEqual({ espera: ESPERA });
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · B · 1 g no se pinta como 0,04 oz ni como 0,00 lb/kg', async ({ page }) => {
    // 1 / 28,349523125 = 0,035274 oz; 1 / 453,59237 = 0,0022046 lb; 0,001 kg.
    // Hoy: «0,04 oz» (+13 %), «0,00 lb» y «0,00 kg», un cero exacto para una cantidad que no lo es.
    // Tolerancias por el tamaño del defecto: 5 % en las onzas (el error es 13 %) y 10 % en lb y kg
    // (el error es del 100 %); «0,035», «0,0353», «0,002» o «0,0022» pasan.
    test.fail();
    await elegirUnidad(page, 'g');
    await teclear(page, '1');
    await expect.poll(async () => (await leerResultado(page)).oz).toBeDefined();
    const r = await leerResultado(page);
    expect(Math.abs(aNumero(r.oz) / 0.0352739619 - 1)).toBeLessThan(0.05);
    expect(Math.abs(aNumero(r.lb) / 0.00220462262 - 1)).toBeLessThan(0.1);
    expect(Math.abs(aNumero(r.kg) / 0.001 - 1)).toBeLessThan(0.1);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · C · −8 oz no da «−227 g»', async ({ page }) => {
    // Una cantidad negativa de un ingrediente no existe; hoy pinta «-227 g | -0,50 lb | -0,23 kg»
    // sin aviso, cuando «abc» sí se queda sin cifras.
    test.fail();
    await teclear(page, '-8');
    await expect(zonaResultado(page)).not.toContainText('227', { timeout: 3000 });
  });

  // ── CASO 3 · rechazo y lectura en formato español ──────────────────────────
  test('HALLAZGO (14/11/2026, ABIERTO) · A · «1.500» g son mil quinientos: 52,9 oz, 3,31 lb, 1,50 kg', async ({ page }) => {
    // 1500 / 28,349523125 = 52,9109 oz; 1500 / 453,59237 = 3,30693 lb; 1,5 kg.
    // Hoy parseFloat('1.500') = 1,5 g → «0,05 oz | 0,00 lb | 0,00 kg».
    test.fail();
    await elegirUnidad(page, 'g');
    await teclear(page, '1.500');
    await expect.poll(() => leerResultado(page), { timeout: 3000 }).toEqual({ oz: '52,9', lb: '3,31', kg: '1,50' });
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · A · «1.234,5» g: 43,5 oz y 2,72 lb', async ({ page }) => {
    // 1234,5 / 28,349523125 = 43,5457 oz; 1234,5 / 453,59237 = 2,72162 lb.
    // Hoy '1.234,5'.replace(',', '.') = '1.234.5' → parseFloat = 1,234 g → «0,04 oz».
    test.fail();
    await elegirUnidad(page, 'g');
    await teclear(page, '1.234,5');
    await expect.poll(async () => {
      const r = await leerResultado(page);
      return [r.oz, r.lb];
    }, { timeout: 3000 }).toEqual(['43,5', '2,72']);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · A · la cifra que escribe la app no se puede volver a teclear', async ({ page }) => {
    // 1500 oz × 28,349523125 = 42 524,28 g → la app escribe «42.524». Ese mismo texto en gramos
    // es 42 524 g = 1499,99 oz → «1500». Hoy lo lee 42,524 g → «1,50 oz»: mil veces menos.
    test.fail();
    await teclear(page, '1500');
    await expect.poll(async () => (await leerResultado(page)).g).toBe('42.524');
    const gramos = (await leerResultado(page)).g;
    await elegirUnidad(page, 'g');
    await teclear(page, gramos);
    await expect.poll(async () => (await leerResultado(page)).oz, { timeout: 3000 }).toBe('1500');
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · A · «12abc» y «1e3» no son cantidades', async ({ page }) => {
    // parseSpanishNumber (lib/formatters) devuelve NaN para los dos. Hoy «12abc» = 12 oz → «340 g»
    // y «1e3» = 1000 oz → «28.350 g».
    test.fail();
    await teclear(page, '12abc');
    await expect(zonaResultado(page)).not.toContainText('340', { timeout: 3000 });
    await teclear(page, '1e3');
    await expect(zonaResultado(page)).not.toContainText('28.350', { timeout: 3000 });
  });

  // ── Contenido, formato y accesibilidad ─────────────────────────────────────
  test('HALLAZGO (14/11/2026, ABIERTO) · D · fecha de verificación en formato español y «%» con espacio duro', async ({ page }) => {
    // CLAUDE.md global §2: fechas DD/MM/AAAA (para un mes, «07/2026» o «julio de 2026») y «100 %»
    // con U+00A0. Hoy la nota dice «Verificado 2026-07» y featureList, «Funciona 100% en el navegador».
    test.fail();
    const nota = page.locator('p').filter({ hasText: 'Verificado' }).first();
    await expect(nota).not.toHaveText(/\d{4}-\d{2}/, { timeout: 3000 });
    const app = await ldDeTipo(page, 'WebApplication');
    const features = (app.featureList ?? []) as string[];
    for (const f of features) expect(f).not.toMatch(/\d%/);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · E · cada pestaña controla un role="tabpanel"', async ({ page }) => {
    // Patrón ARIA de pestañas: role="tab" con aria-controls hacia su role="tabpanel". Hoy ninguna
    // pestaña lleva aria-controls y no hay ningún tabpanel en la página.
    test.fail();
    const pestanas = page.getByRole('tab');
    await expect(pestanas).toHaveCount(2);
    for (const p of await pestanas.all()) {
      const id = await p.getAttribute('aria-controls');
      expect(id).not.toBeNull();
      await expect(page.locator(`[id="${id}"]`)).toHaveAttribute('role', 'tabpanel', { timeout: 3000 });
    }
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · F · la FAQ advierte de que la onza troy (31,10 g) es otra', async ({ page }) => {
    // «¿Cuánto es una onza en gramos?» responde 28,35 g sin decir que la onza de los metales
    // preciosos (troy) es otra unidad: 31,1034768 g exactos, un 9,7 % más. Ni la FAQ ni la página
    // la nombran, y quien pregunte por una onza de oro o de plata se lleva 28,35 g.
    test.fail();
    const faq = JSON.stringify(await ldDeTipo(page, 'FAQPage'));
    expect(faq).toMatch(/troy/i);
  });

  test('las cifras fijas del texto cuadran con las definiciones', async ({ page }) => {
    // 28,349523125 → «28,35 g»; 29,5735 → «29,57 ml»; 28,4131 → «28,41 ml».
    const nota = page.locator('p').filter({ hasText: 'Verificado' }).first();
    await expect(nota).toContainText('1 oz = 28,35 g');
    await expect(nota).toContainText('29,57 ml (EE. UU.)');
    await expect(page.getByRole('button', { name: 'Reino Unido (28,41 ml)' })).toHaveCount(0);
    await page.getByRole('tab', { name: /Onzas líquidas/ }).click();
    await expect(page.getByRole('button', { name: 'Reino Unido (28,41 ml)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'EE. UU. (29,57 ml)' })).toBeVisible();
  });
});
