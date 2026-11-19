import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { calcularMacros } from '../../lib/calculadoras/macros';

/**
 * Inspector — calculadora-macros (segmento cálculo · riesgo 2, salud/nutrición)
 *
 * Primera inspección: 18/11/2026, con el cabo C0710. La app promete en su <h1> «Calculadora de
 * Macros» y en la metadata «Proteínas, carbohidratos y grasas personalizados para tu peso y
 * actividad». El cálculo vive en page.tsx (calcular, l. 59-102), sin motor aparte: la página NO
 * importa lib/calculadoras/macros.ts, que es la copia que usa el servidor MCP (mismas constantes).
 *
 * LO QUE APLICA (page.tsx)
 *   · TMB Mifflin-St Jeor: 10·peso + 6,25·altura − 5·edad + 5 (hombre) / − 161 (mujer).
 *   · TDEE = TMB × 1,2 · 1,375 · 1,55 · 1,725 · 1,9 (sedentario … muy activo).
 *   · Objetivo = round(TDEE + ajuste): definición −500 · mantenimiento 0 · volumen +400.
 *   · Reparto (desde el 19/11/2026, hallazgo 5034, decidido por el usuario: cabo C0819): proteína
 *     en g/kg según objetivo (definición 2,1 · mantenimiento 1,7 · volumen 1,8, puntos medios de la
 *     tabla de la app), grasa = máx(20 % de las kcal, 0,6 g/kg en definición u 0,8 g/kg en el resto)
 *     y carbohidratos el resto; g = kcal / 4, 4 y 9. Antes: % fijo de las kcal (30/40/30 y
 *     25/50/25). Se pinta con formatNumber(…, 0); los g/kg, con un decimal. El motor es
 *     lib/calculadoras/macros.ts, el mismo que usa el MCP.
 *   Los coeficientes de Mifflin y los factores de actividad NO se pudieron cotejar con su fuente: la
 *   publicación original (Am J Clin Nutr 1990) y las opiniones de la EFSA (alojadas en
 *   efsa.onlinelibrary.wiley.com) están fuera de la red de fuentes de la tarea. Los esperados salen de
 *   la fórmula que la propia app declara en su caja «Fórmula Mifflin-St Jeor», su guía y su FAQPage.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   1 · hombre 70 kg, 175 cm, 30 años, moderado, mantenimiento:
 *       TMB 700 + 1093,75 − 150 + 5 = 1648,75 → «1649» · TDEE 1648,75 × 1,55 = 2555,5625 → «2556» ·
 *       objetivo 2556 · P 639 kcal → 159,75 g «160g», 2,28 g/kg «2,3» · C 1278 kcal → 319,5 g
 *       «320g», 4,56 «4,6» · G 639 kcal → 71 g «71g», 1,01 «1,0».
 *   1b · mismo perfil, mujer y definición: TMB 1482,75 → «1483» · TDEE 2298,2625 → «2298» ·
 *       objetivo round(1798,2625) = 1798.
 *   1c · mismo perfil, ligero 1648,75 × 1,375 = 2267,03 → 2267; activo × 1,725 = 2844,09 → 2844.
 *   2 · límite (bordes que acepta la app): mujer 30 kg, 100 cm, 100 años, sedentaria, definición:
 *       TMB 300 + 625 − 500 − 161 = 264 · TDEE 316,8 → 317 · objetivo round(−183,2) = −183. Una
 *       ingesta no puede ser negativa: debe rechazarse o llevar suelo.
 *   2b · mujer 45 kg, 150 cm, 30 años, sedentaria, definición: TMB 1076,5 → «1077» · TDEE 1291,8 →
 *       «1292» · objetivo round(791,8) = 792 · P 237,6 kcal → 59,4 g, 1,32 g/kg.
 *   2c · hombre 70/175/30, muy activo, volumen: TDEE 1648,75 × 1,9 = 3132,625 → «3133» · objetivo
 *       round(3532,625) = 3533 · P 883,25 kcal → 220,8 g «221g», 3,15 g/kg «3,2».
 *   3 · rechazo: altura «1,75» (metros) en un campo en cm. Debe rechazarse o avisarse; el blur de
 *       NumberInput (acotarAlSalir por defecto) la reescribe a 100 cm y la app calcula 1.829 kcal
 *       (TMB 700 + 625 − 150 + 5 = 1180; × 1,55), frente a 2.556 con 175 cm.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (18/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES', reducedMotion: 'reduce' });

const RUTA = '/calculadora-macros/';

type Campo = 'Peso' | 'Altura' | 'Edad';
type Sexo = 'Hombre' | 'Mujer';
type Objetivo = 'Definición' | 'Mantenimiento' | 'Volumen';
type Actividad = 'Sedentario' | 'Ligero' | 'Moderado' | 'Activo' | 'Muy activo';

interface Perfil {
  peso: string;
  altura: string;
  edad: string;
  sexo?: Sexo;
  objetivo?: Objetivo;
  actividad?: Actividad;
}

const campo = (page: Page, nombre: Campo): Locator =>
  page.getByRole('textbox', { name: nombre, exact: true });
const panel = (page: Page): Locator => page.locator('[class*="resultsPanel"]');
const aviso = (page: Page): Locator =>
  page.getByRole('note').filter({ hasText: 'NO reemplaza un plan nutricional' });

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[inputmode="decimal"]']);
}

async function elegir(page: Page, grupo: string, opcion: string): Promise<void> {
  const boton = page
    .getByRole('group', { name: grupo, exact: true })
    .getByRole('button', { name: new RegExp(`^${opcion}`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Escribe como un usuario (fill y cambio de foco al campo siguiente), elige y pulsa «Calcular Macros». */
async function calcular(page: Page, p: Perfil): Promise<void> {
  const valores: Array<[Campo, string]> = [['Peso', p.peso], ['Altura', p.altura], ['Edad', p.edad]];
  for (const [nombre, valor] of valores) {
    await campo(page, nombre).fill(valor);
    await esperarValorEnReact(page, campo(page, nombre), valor);
  }
  await elegir(page, 'Sexo', p.sexo ?? 'Hombre');
  await elegir(page, 'Objetivo', p.objetivo ?? 'Mantenimiento');
  await elegir(page, 'Nivel de actividad física', p.actividad ?? 'Moderado');
  await page.getByRole('button', { name: 'Calcular Macros' }).click();
}

/** El panel de resultados en una línea; \s también casa el espacio duro (U+00A0). */
async function texto(page: Page): Promise<string> {
  return (await panel(page).innerText()).replace(/\s+/g, ' ');
}

async function ponerTema(page: Page, tema: 'light' | 'dark'): Promise<void> {
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
  await page.waitForFunction(() => document.getAnimations().length === 0);
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
}

interface NodoJsonLd {
  '@type'?: string;
  featureList?: string[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function nodosJsonLd(page: Page): Promise<NodoJsonLd[]> {
  const nodos: NodoJsonLd[] = [];
  for (const b of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const d = JSON.parse(b) as NodoJsonLd & { '@graph'?: NodoJsonLd[] };
    nodos.push(...(d['@graph'] ?? [d]));
  }
  return nodos;
}

/** «1.400» → 1400; «2,0» → 2. Cifras escritas en formato español. */
const aNumero = (t: string): number => Number(t.replace(/\./g, '').replace(',', '.'));

test.describe('Cálculo: Mifflin-St Jeor, factor de actividad y reparto', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('Caso 1 · hombre 70 kg, 175 cm, 30 años, moderado, mantenimiento → 2556 kcal; 119 / 392 / 57 g', async ({ page }) => {
    await calcular(page, { peso: '70', altura: '175', edad: '30' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    const t = await texto(page);
    expect(t).toContain('Objetivo: Mantenimiento');
    expect(t).toContain('70 kg • 175 cm • 30 años');
    // TMB 1648,75 → 1649; TDEE 1648,75 × 1,55 = 2555,5625 → 2556; mantenimiento: objetivo = TDEE
    expect(t).toContain('Calorías diarias objetivo 2556 kcal');
    expect(t).toContain('TMB (Tasa Metabólica Basal) 1649 kcal');
    expect(t).toContain('TDEE (Gasto Total Diario) 2556 kcal');
    expect(t).toContain('= 1649 kcal');
    // Proteína primero (hallazgo 5034): 1,7 × 70 = 119 g → 476 kcal; grasa máx(20 % de 2556 = 511,2
    // kcal, 0,8 × 70 = 56 g = 504 kcal) = 511,2 kcal → 56,8 g; carbohidratos 2556 − 476 − 511,2 =
    // 1568,8 kcal → 392,2 g. Reparto 476/2556 = 18,6 % → 19 · 61,4 % → 61 · 20 %.
    expect(t).toMatch(/Proteínas 119 ?g 476 kcal 1,7 ?g\/kg/);
    expect(t).toMatch(/Carbohidratos 392 ?g 1569 kcal 5,6 ?g\/kg/);
    expect(t).toMatch(/Grasas 57 ?g 511 kcal 0,8 ?g\/kg/);
    expect(t).toMatch(/Proteínas \(19 ?%\) Carbohidratos \(61 ?%\) Grasas \(20 ?%\)/);
  });

  test('Caso 1b · mujer 70/175/30, moderado, definición → TMB 1483, TDEE 2298, 1798 kcal', async ({ page }) => {
    await calcular(page, { peso: '70', altura: '175', edad: '30', sexo: 'Mujer', objetivo: 'Definición' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    const t = await texto(page);
    // 700 + 1093,75 − 150 − 161 = 1482,75; × 1,55 = 2298,2625; − 500 = 1798,2625
    expect(t).toContain('TMB (Tasa Metabólica Basal) 1483 kcal');
    expect(t).toContain('TDEE (Gasto Total Diario) 2298 kcal');
    expect(t).toContain('Calorías diarias objetivo 1798 kcal');
    expect(t).toContain('- 161 = 1483 kcal');
  });

  test('Caso 1c · factores ligero (× 1,375 → 2267) y activo (× 1,725 → 2844) sobre TMB 1648,75', async ({ page }) => {
    // innerText (con sus saltos) y no toContainText, que lee textContent y pega «TDEE…)2267 kcal»
    await calcular(page, { peso: '70', altura: '175', edad: '30', actividad: 'Ligero' });
    await expect.poll(() => texto(page)).toContain('TDEE (Gasto Total Diario) 2267 kcal');
    await calcular(page, { peso: '70', altura: '175', edad: '30', actividad: 'Activo' });
    await expect.poll(() => texto(page)).toContain('TDEE (Gasto Total Diario) 2844 kcal');
  });

  test('Caso 2 · límite: mujer 30 kg, 100 cm, 100 años, sedentaria → TMB 264, TDEE 317', async ({ page }) => {
    // Con definición el objetivo saldría negativo: desde el 18/11/2026 (hallazgo 5032) se rechaza, y
    // el rechazo da la TMB y el TDEE. Reescrito el 19/11/2026 (hallazgo 5034): con mantenimiento
    // también se rechaza, porque la proteína por kg (1,7 × 30 = 51 g = 204 kcal) y la grasa mínima
    // (0,8 × 30 = 24 g = 216 kcal) suman 420 kcal, más que las 317 del objetivo; el rechazo da
    // igualmente la TMB y el TDEE. Antes salía con el reparto 25/50/25 de 317 kcal.
    await calcular(page, { peso: '30', altura: '100', edad: '100', sexo: 'Mujer', objetivo: 'Mantenimiento', actividad: 'Sedentario' });
    await expect(panel(page)).toContainText('metabolismo basal');
    const t = await texto(page);
    // 300 + 625 − 500 − 161 = 264; × 1,2 = 316,8 → 317
    expect(t).toContain('metabolismo basal estimado es de 264 kcal y el gasto diario de 317 kcal');
    expect(t).toContain('suman 420 kcal, más que el objetivo de 317 kcal');
    expect(t).not.toContain('Calorías diarias objetivo');
  });

  test('Caso 2b · mujer 45 kg, 150 cm, 30 años, sedentaria, definición → TMB 1077, TDEE 1292, 792 kcal', async ({ page }) => {
    await calcular(page, { peso: '45', altura: '150', edad: '30', sexo: 'Mujer', objetivo: 'Definición', actividad: 'Sedentario' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    const t = await texto(page);
    // 450 + 937,5 − 150 − 161 = 1076,5 → 1077; × 1,2 = 1291,8 → 1292; − 500 = 791,8 → 792
    expect(t).toContain('TMB (Tasa Metabólica Basal) 1077 kcal');
    expect(t).toContain('TDEE (Gasto Total Diario) 1292 kcal');
    expect(t).toContain('Calorías diarias objetivo 792 kcal');
  });

  test('Caso 2c · hombre 70/175/30, muy activo, volumen → TDEE 3133, 3533 kcal (+400)', async ({ page }) => {
    await calcular(page, { peso: '70', altura: '175', edad: '30', objetivo: 'Volumen', actividad: 'Muy activo' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    const t = await texto(page);
    // 1648,75 × 1,9 = 3132,625 → 3133; + 400 = 3532,625 → 3533
    expect(t).toContain('TDEE (Gasto Total Diario) 3133 kcal');
    expect(t).toContain('Calorías diarias objetivo 3533 kcal');
    expect(t).toContain('Ajuste por objetivo +400 kcal');
  });
});

/*
 * Motor (lib/calculadoras/macros.ts, el de la página y el del MCP), casos resueltos a mano el
 * 19/11/2026 antes de tocar la vista (hallazgo 5034, cabo C0819):
 *   · 2b mujer 45/150/30 sedentaria definición: 792 kcal · P 2,1 × 45 = 94,5 g = 378 kcal · grasa
 *     máx(20 % = 158,4 kcal, 0,6 × 45 = 27 g = 243 kcal) = 243 kcal = 27 g · C 792 − 378 − 243 =
 *     171 kcal = 42,75 g → 43 g.
 *   · 2c hombre 70/175/30 muy activo volumen: 3533 kcal · P 1,8 × 70 = 126 g = 504 kcal · grasa
 *     máx(706,6 kcal, 56 g = 504 kcal) = 706,6 kcal = 78,5 g → 79 g · C 3533 − 504 − 706,6 =
 *     2322,4 kcal = 580,6 g → 581 g · reparto 14 / 66 / 20.
 *   · mujer 300 kg, 100 cm, 100 años, sedentaria, definición: 3057 kcal · P 630 g = 2520 kcal y
 *     grasa 0,6 × 300 = 180 g = 1620 kcal suman 4140 > 3057 → error, sin cifra.
 */
test.describe('Motor de macros: proteína primero (hallazgo 5034)', () => {
  test('2b y 2c, resueltos a mano', () => {
    const d = calcularMacros({ peso: 45, altura: 150, edad: 30, sexo: 'mujer', nivelActividad: 'sedentario', objetivo: 'definicion' });
    expect(d.caloriasObjetivo).toBe(792);
    expect(d.macros).toEqual({
      proteinas: 95, // 94,5 → Math.round
      carbohidratos: 43,
      grasas: 27,
      caloriasProteinas: 378,
      caloriasCarbohidratos: 171,
      caloriasGrasas: 243,
    });
    const v = calcularMacros({ peso: 70, altura: 175, edad: 30, sexo: 'hombre', nivelActividad: 'muy_activo', objetivo: 'volumen' });
    expect(v.caloriasObjetivo).toBe(3533);
    expect(v.macros.proteinas).toBe(126);
    expect(v.macros.caloriasGrasas).toBeCloseTo(706.6, 2);
    expect(v.macros.grasas).toBe(79);
    expect(v.macros.caloriasCarbohidratos).toBeCloseTo(2322.4, 2);
    expect(v.macros.carbohidratos).toBe(581);
    expect(v.ratios).toEqual({ proteinas: 14, carbohidratos: 66, grasas: 20 });
  });

  test('si la proteína y la grasa mínima no caben en el objetivo, error y sin cifra', () => {
    expect(() =>
      calcularMacros({ peso: 300, altura: 100, edad: 100, sexo: 'mujer', nivelActividad: 'sedentario', objetivo: 'definicion' }),
    ).toThrow(/suman 4140 kcal, más que el objetivo de 3057 kcal/);
  });
});

test.describe('Hallazgos de cálculo (18/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · cambiar objetivo, sexo o peso tras calcular no deja un resultado viejo con el rótulo nuevo', async ({ page }) => {
    // REPARADO: el rótulo, la descripción, el «Ajuste por objetivo», la fórmula escrita y los g/kg
    // leían el estado VIVO, y las kcal y los gramos, el `resultado` del último clic. Ahora todo se
    // recalcula con los datos vivos. Para 70/175/30 moderado:
    //   · Definición → 2056 kcal (round(2555,5625 − 500)), no «Objetivo: Definición · 2556 kcal ·
    //     Déficit calórico de 500 kcal»;
    //   · Mujer → la fórmula «… − 161 =» cuadra en 1483 (1482,75 × 1,55 − 500 = 1798), no en 1649;
    //   · peso 80 → TMB 1582,75 (mujer), × 1,55 = 2453,26 − 500 → 1953 kcal, no «80 kg» con 2556.
    const fallos: string[] = [];
    await calcular(page, { peso: '70', altura: '175', edad: '30' });
    await expect.poll(() => texto(page)).toContain('Calorías diarias objetivo 2556 kcal');

    await elegir(page, 'Objetivo', 'Definición');
    let t = await texto(page);
    if (t.includes('Objetivo: Definición') && t.includes('Calorías diarias objetivo 2556 kcal')) {
      fallos.push('Definición con las 2556 kcal de mantenimiento');
    }
    expect(t).toContain('Calorías diarias objetivo 2056 kcal');
    await elegir(page, 'Sexo', 'Mujer');
    t = await texto(page);
    if (t.includes('- 161 = 1649 kcal')) fallos.push('fórmula de mujer «− 161 = 1649»');
    expect(t).toContain('- 161 = 1483 kcal');
    expect(t).toContain('Calorías diarias objetivo 1798 kcal');

    await campo(page, 'Peso').fill('80');
    await esperarValorEnReact(page, campo(page, 'Peso'), '80');
    t = await texto(page);
    if (t.includes('80 kg') && t.includes('Calorías diarias objetivo 2556 kcal')) fallos.push('80 kg con 2556 kcal');
    expect(t).toContain('80 kg • 175 cm • 30 años');
    expect(t).toContain('Calorías diarias objetivo 1953 kcal');
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · definición resta 500 kcal sin suelo: mujer 30 kg, 100 cm, 100 años, sedentaria → −183 kcal', async ({ page }) => {
    // REPARADO: TDEE 317 − 500 = −183 kcal salía como objetivo, con −14 g de proteína. Ahora se
    // rechaza y se dice por qué. Con un perfil corriente (2b: 45 kg, 150 cm, 30 años, sedentaria) el
    // mismo −500 fijo da 792 kcal, por debajo de la TMB (1077): sale con un aviso.
    await calcular(page, { peso: '30', altura: '100', edad: '100', sexo: 'Mujer', objetivo: 'Definición', actividad: 'Sedentario' });
    await expect(panel(page)).toContainText('no se puede proponer un objetivo de definición');
    const t = await texto(page);
    expect(t).toContain('metabolismo basal estimado es de 264 kcal y el gasto diario de 317 kcal');
    expect(t).not.toMatch(/Calorías diarias objetivo -\d/);
    expect(t).not.toMatch(/(Proteínas|Carbohidratos|Grasas) -\d/);

    await abrir(page);
    await calcular(page, { peso: '45', altura: '150', edad: '30', sexo: 'Mujer', objetivo: 'Definición', actividad: 'Sedentario' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    await expect(panel(page)).toContainText('por debajo de tu metabolismo basal estimado (1077 kcal)');
    // El mismo perfil en mantenimiento (1292 kcal) no queda por debajo de la TMB: sin aviso
    await elegir(page, 'Objetivo', 'Mantenimiento');
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    await expect(panel(page)).not.toContainText('por debajo de tu metabolismo basal');
  });

  test('HALLAZGO (18/11/2026, REPARADO) · entradas fuera de rango o ilegibles se calculan reescritas o como «No definido»', async ({ page }) => {
    // REPARADO: NumberInput acotaba al salir del campo (min/max 30-300 kg, 100-250 cm, 15-100 años)
    // y `calcular` no validaba (NaN <= 0 es false). Ahora se rechaza sin resultado, con el motivo:
    //   · altura «1,75» (metros) → antes 100 cm → 1829 kcal en vez de 2556 (−28 %);
    //   · edad 14 → antes 15 años; peso −70 → antes 30 kg → 1936 kcal;
    //   · peso «70,5,3» → antes «No definido kcal», «No definidog».
    const fallos: string[] = [];
    const casos: Array<[Perfil, string]> = [
      [{ peso: '70', altura: '1,75', edad: '30' }, '100 cm'],
      [{ peso: '70', altura: '175', edad: '14' }, '15 años'],
      [{ peso: '-70', altura: '175', edad: '30' }, '30 kg'],
      [{ peso: '70,5,3', altura: '175', edad: '30' }, 'No definido'],
    ];
    for (const [perfil, delator] of casos) {
      await abrir(page);
      await calcular(page, perfil);
      await expect(page.getByRole('button', { name: 'Calcular Macros' })).toBeVisible();
      const t = await texto(page);
      if (t.includes(delator)) fallos.push(`${JSON.stringify(perfil)} → «${delator}» en el resultado`);
      if (t.includes('Calorías diarias objetivo')) fallos.push(`${JSON.stringify(perfil)} → con resultado`);
    }
    expect(fallos).toEqual([]);
    // El campo conserva lo escrito y dice por qué no vale (el último caso abierto es «70,5,3»)
    await expect(campo(page, 'Peso')).toHaveValue('70,5,3');
    await expect(page.getByText('No se ha podido leer «70,5,3» como número.')).toBeVisible();
    await abrir(page);
    await calcular(page, { peso: '70', altura: '1,75', edad: '30' });
    await expect(campo(page, 'Altura')).toHaveValue('1,75');
    await expect(page.getByText('La altura va en centímetros: 175, no 1,75.')).toBeVisible();
  });

  test('HALLAZGO 5034 (18/11/2026, REPARADO 19/11/2026) · la proteína por kg que da la app caía fuera del rango que su propia tabla pide para ese objetivo', async ({ page }) => {
    // REPARADO: el reparto era un % fijo de las kcal, no la «proteína primero» por kg de su guía paso
    // a paso. 2c (volumen, muy activo, 70 kg) daba «221g · 3,2g/kg» con la tabla en 1,6 – 2,0 g/kg;
    // 2b (definición, sedentaria, 45 kg), «59g · 1,3g/kg» con la tabla en 2,0 – 2,2 g/kg. Ahora 1,8 y
    // 2,1 g/kg (126 g y 94,5 g).
    await abrirGuia(page);
    const rango = async (fila: RegExp): Promise<[number, number]> => {
      const celda = await page.getByRole('row', { name: fila }).getByRole('cell').nth(2).innerText();
      const m = celda.match(/([\d,]+)\s*[–-]\s*([\d,]+)\s*g\/kg/);
      if (!m) throw new Error(`Sin rango de proteína en «${celda}»`);
      return [aNumero(m[1]), aNumero(m[2])];
    };
    const proteinaPorKg = async (): Promise<number> => {
      const m = (await texto(page)).match(/Proteínas \d+ ?g [\d.]+ kcal ([\d,]+) ?g\/kg/);
      if (!m) throw new Error('Sin g/kg de proteína en el resultado');
      return aNumero(m[1]);
    };
    const fallos: string[] = [];
    const [vMin, vMax] = await rango(/Volumen/);
    const [dMin, dMax] = await rango(/Definición/);
    await calcular(page, { peso: '70', altura: '175', edad: '30', objetivo: 'Volumen', actividad: 'Muy activo' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    const v = await proteinaPorKg();
    if (v < vMin || v > vMax) fallos.push(`volumen ${v} g/kg fuera de ${vMin}–${vMax}`);
    await calcular(page, { peso: '45', altura: '150', edad: '30', sexo: 'Mujer', objetivo: 'Definición', actividad: 'Sedentario' });
    await expect(panel(page)).toContainText('45 kg');
    const d = await proteinaPorKg();
    if (d < dMin || d > dMax) fallos.push(`definición ${d} g/kg fuera de ${dMin}–${dMax}`);
    expect(fallos).toEqual([]);
    expect(v).toBe(1.8);
    expect(d).toBe(2.1);
  });
});

test.describe('Hallazgos de contenido (18/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · FAQPage de volumen: su ejemplo no cuadra con sus % ni con el reparto de la app', async ({ page }) => {
    // REPARADO: decía «proteínas 30-35 %… grasas 20-25 %» y su ejemplo daba 150 g (= 600 kcal, no
    // 660), es decir un 20 % de 2.970 kcal en proteína y 900 / 2.970 = 30 % en grasa. La app, en
    // volumen, reparte 25 / 50 / 25 con +400 kcal fijas (no +10 %). Ahora la respuesta describe eso:
    // TDEE 2.700 + 400 = 3.100 kcal; 775 kcal / 4 = 193,75 → 194 g; 1.550 / 4 = 387,5 → 388 g;
    // 775 / 9 = 86,1 → 86 g.
    const faq = (await nodosJsonLd(page)).find((n) => n['@type'] === 'FAQPage');
    const r = faq?.mainEntity?.find((q) => /ratio de macros/i.test(q.name))?.acceptedAnswer.text ?? '';
    expect(r, 'la pregunta del ratio para ganar músculo').not.toBe('');
    await calcular(page, { peso: '70', altura: '175', edad: '30', objetivo: 'Volumen' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    const pApp = Number((await texto(page)).match(/Proteínas \((\d+) ?%\)/)?.[1]);
    const fallos: string[] = [];
    const rangoP = r.match(/proteínas (\d+)\s*-\s*(\d+)\s*%/i);
    if (rangoP && (pApp < Number(rangoP[1]) || pApp > Number(rangoP[2]))) {
      fallos.push(`la app reparte ${pApp} % de proteína y el FAQPage dice ${rangoP[1]}-${rangoP[2]} %`);
    }
    const ej = (macro: string) => r.match(new RegExp(`${macro} ~(\\d+) g \\(([\\d.]+) kcal\\)`, 'i'));
    const total = r.match(/\(([\d.]+) kcal\):/);
    const p = ej('proteínas');
    const g = ej('grasas');
    if (p && Math.abs(Number(p[1]) * 4 - aNumero(p[2])) > 0.03 * aNumero(p[2])) {
      fallos.push(`${p[1]} g de proteína × 4 = ${Number(p[1]) * 4} kcal, no ${p[2]}`);
    }
    if (p && total && rangoP) {
      const cuota = (Number(p[1]) * 4) / aNumero(total[1]) * 100;
      if (cuota < Number(rangoP[1]) || cuota > Number(rangoP[2])) fallos.push(`la proteína del ejemplo es el ${cuota.toFixed(0)} %`);
    }
    const rangoG = r.match(/grasas (\d+)\s*-\s*(\d+)\s*%/i);
    if (g && total && rangoG) {
      const cuota = (Number(g[1]) * 9) / aNumero(total[1]) * 100;
      if (cuota < Number(rangoG[1]) || cuota > Number(rangoG[2])) fallos.push(`la grasa del ejemplo es el ${cuota.toFixed(0)} %`);
    }
    expect(fallos).toEqual([]);
    // Desde el 19/11/2026 (hallazgo 5034) la app fija la proteína por kg: el FAQPage describe ese
    // reparto. Ejemplo, 75 kg y TDEE 2.700 → 3.100 kcal: 1,8 × 75 = 135 g = 540 kcal; grasa 20 % =
    // 620 kcal (68,9 g, más que 0,8 × 75 = 60 g); carbohidratos 3.100 − 540 − 620 = 1.940 kcal = 485 g.
    expect(r).not.toMatch(/25\s%\sde proteínas/);
    expect(r).toContain('1,8 g por kilo de peso corporal');
    expect(r).toContain('3.100 kcal: 135 g de proteínas (540 kcal), unos 69 g de grasas (620 kcal) y 485 g de carbohidratos (1.940 kcal)');
    expect(135 * 4 + 620 + 485 * 4).toBe(3100);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · el paso 2 de la guía llama «Muy activo» al × 1,725, que en el selector es «Activo»', async ({ page }) => {
    // REPARADO: el selector aplica Activo = 1,725 («Ejercicio intenso 6-7 días/semana») y Muy activo =
    // 1,9 (2c: 1648,75 × 1,9 = 3133); la guía decía «Muy activo (6-7 días intensos): × 1,725» y omitía 1,9.
    await abrirGuia(page);
    const paso2 = await page.locator('li', { hasText: 'Multiplica por tu factor de actividad' }).innerText();
    expect(paso2).not.toMatch(/Muy activo[^.]*1,725/);
    expect(paso2).toContain('Activo (6-7 días intensos): × 1,725');
    expect(paso2).toContain('Muy activo (atleta o trabajo físico muy intenso): × 1,9');
  });

  test('HALLAZGO (18/11/2026, REPARADO) · el JSON-LD WebApplication no declara características (featureList vacía)', async ({ page }) => {
    // REPARADO: metadata.ts pasaba `features: []` (CLAUDE.md §1.ter pide 4-8 reales).
    const web = (await nodosJsonLd(page)).find((n) => n['@type'] === 'WebApplication');
    expect(web?.featureList?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · el aviso médico pega palabras: «actividad)que NO» y «colegiado.Especialmente»', async ({ page }) => {
    // REPARADO: el salto de línea JSX tras </strong> se comía el espacio.
    const t = await aviso(page).innerText();
    expect(t).not.toContain(')que NO');
    expect(t).not.toContain('colegiado.Especialmente');
    expect(t).toContain('actividad) que NO');
    expect(t).toContain('colegiado. Especialmente');
  });

  test('HALLAZGO (18/11/2026, REPARADO) · el resultado pega el % y la unidad: «Proteínas (25%)», «160g»', async ({ page }) => {
    // Cifras del Caso 1 con el reparto por kg desde el 19/11/2026 (hallazgo 5034): 19 %, 1,7 g/kg y 119 g.
    // REPARADO: regla del 25/09/2026 (CLAUDE.md global §2): «25 %» con espacio duro, como hace
    // formatPercentage; y el símbolo de unidad separado de la cifra («160 g», «2,3 g/kg»).
    await calcular(page, { peso: '70', altura: '175', edad: '30' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    const fallos: string[] = [];
    const leyenda = (await panel(page).locator('span', { hasText: /^Proteínas \(/ }).first().textContent()) ?? '';
    if (!/\(19[  ]%\)/.test(leyenda)) fallos.push(`leyenda «${leyenda}»`);
    const porKg = (await page.locator('[class$="_macroPorKg"]').first().textContent()) ?? '';
    if (!/^1,7 g\/kg$/.test(porKg.trim())) fallos.push(`g/kg «${porKg.trim()}»`);
    const gramos = (await page.locator('[class$="_macroGramos"]').first().textContent()) ?? '';
    if (!/^119[   ]g$/.test(gramos.trim())) fallos.push(`gramos «${gramos.trim()}»`);
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · «Bebe al menos 2 litros al día» y «pérdida sostenible sin rebote», sin fuente', async ({ page }) => {
    // REPARADO: CLAUDE.md §1.quinquies, punto 1 (cifras populares sin fuente) y promesa de resultado.
    // La cifra de agua no se pudo cotejar con la EFSA (fuera de la red de la tarea): se retira, igual
    // que el «80-90 % produce excelentes resultados» y las tres apps comerciales por su nombre.
    await abrirGuia(page);
    const hidratacion = await page.locator('div', { hasText: 'Hidratación como cuarto macro' }).last().innerText();
    if (/2 litros/.test(hidratacion)) expect(hidratacion).toMatch(/EFSA|OMS|AESAN|\b(19|20)\d{2}\b/);
    expect(hidratacion).toContain('cambia con el calor, la actividad física y tu tamaño corporal');
    await expect(page.getByText('sin rebote')).toHaveCount(0);
    await expect(page.getByText(/excelentes resultados|MyFitnessPal|Cronometer|Yazio/)).toHaveCount(0);
  });
});

test.describe('Hallazgos de accesibilidad (18/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · los gramos de carbohidratos y grasas no llegan a 3:1 en claro', async ({ page }) => {
    // REPARADO: color en línea sobre var(--hover) #F5F5F5, 28 px en negrita (texto grande, AA 3:1):
    // #3498DB 2,89:1 y #F39C12 2,01:1 en claro. Ahora por clase de la tarjeta, con variante oscura.
    await calcular(page, { peso: '70', altura: '175', edad: '30' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    await esperarPaginaAsentada(page);
    const fallos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await ponerTema(page, tema);
      const cifras = page.locator('[class$="_macroGramos"]');
      await expect(cifras).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        const r = await contrasteSobreFondoReal(cifras.nth(i));
        if (r < 3) fallos.push(`${tema} · ${await cifras.nth(i).innerText()} · ${r.toFixed(2)}:1`);
      }
    }
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · el lector de pantalla lee los emojis del resultado (⚖️, 🥩, 🍚, 🥑) y del hueco vacío (🥗)', async ({ page }) => {
    // REPARADO: objetivoIconoBig, macroIcono y placeholderIcon iban sin aria-hidden: se leían junto
    // al título y al nombre del macro.
    const fallos: string[] = [];
    if ((await panel(page).ariaSnapshot()).includes('🥗')) fallos.push('🥗');
    await calcular(page, { peso: '70', altura: '175', edad: '30' });
    await expect(panel(page)).toContainText('Calorías diarias objetivo');
    const arbol = await panel(page).ariaSnapshot();
    for (const e of ['⚖️', '🥩', '🍚', '🥑']) if (arbol.includes(e)) fallos.push(e);
    expect(fallos).toEqual([]);
  });
});

/*
 * ─── Cabo C0710: clases del aviso médico que el módulo no declara ─────────────────────────────
 * page.tsx:446, 453 y 459 ponen styles.disclaimerList, styles.highlight y styles.emergency, y
 * CalculadoraMacros.module.css no declara ninguna (las otras 83 clases que usa la página, sí): el
 * <ul> y los dos <p> salen SIN atributo class. Medido el 18/11/2026 en claro y oscuro, a 1280 y 390 px:
 *   · la lista sale con padding-left 0 y margen 0: las viñetas cuelgan en el relleno de la tarjeta,
 *     fuera de la columna del texto, y la última toca el párrafo siguiente (0 px);
 *   · «⚕️ Esta herramienta NO sustituye la valoración de un dietista-nutricionista colegiado… es
 *     OBLIGATORIO consultar» no se separa de la lista y se lee como continuación de la cuarta viñeta;
 *   · «🚨 Si presentas pérdida de peso involuntaria… consulta con tu médico inmediatamente» sale con
 *     el color y sin fondo, como el resto del aviso (rgb(26, 26, 26) sobre rgb(227, 242, 253) en
 *     claro; rgb(229, 229, 229) sobre rgb(13, 38, 68) en oscuro), cuando la pieza de DisclaimerCard que
 *     copia lo pinta en rojo sobre rosa (#b71c1c sobre #ffebee; #ff8a80 sobre #4a1a1a en oscuro).
 * Los localizadores van por rol y texto, no por clase: lo que se mide es justo que falta.
 * REPARADO el 18/11/2026: el módulo declara las tres, copiadas de DisclaimerCard.module.css.
 */
test.describe('Cabo C0710 · clases del aviso médico (1280 px)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await esperarPaginaAsentada(page);
  });

  test('C0710 · guardia: el cambio de tema llega al aviso (sin esto los casos de abajo medirían un solo tema)', async ({ page }) => {
    const fondos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await ponerTema(page, tema);
      fondos.push(await aviso(page).evaluate((el) => getComputedStyle(el).backgroundColor));
    }
    expect(new Set(fondos).size).toBe(2);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · C0710 · emergency: «consulta con tu médico inmediatamente» lleva clase y se distingue del resto del aviso, en claro y oscuro', async ({ page }) => {
    const urgencia = aviso(page).locator('p', { hasText: 'consulta con tu médico inmediatamente' });
    const normal = aviso(page).locator('p', { hasText: 'fórmulas generales' });
    await expect(urgencia).toBeVisible();
    await expect(normal).toBeVisible();
    const estilo = (loc: Locator) =>
      loc.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          clase: (el.getAttribute('class') ?? '').trim(),
          color: s.color,
          fondo: s.backgroundColor,
          borde: `${s.borderLeftWidth} ${s.borderLeftStyle} ${s.borderLeftColor}`,
        };
      });
    const fallos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await ponerTema(page, tema);
      const u = await estilo(urgencia);
      const n = await estilo(normal);
      if (!u.clase) fallos.push(`${tema} · sin atributo class`);
      if (u.color === n.color && u.fondo === n.fondo && u.borde === n.borde) {
        fallos.push(`${tema} · igual que el párrafo normal (${u.color} sobre ${u.fondo})`);
      }
    }
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · C0710 · highlight: «NO sustituye la valoración de un dietista-nutricionista» lleva clase y se separa de la lista', async ({ page }) => {
    const lista = aviso(page).locator('ul', { hasText: 'NO reemplaza un plan nutricional personalizado' });
    const destacado = aviso(page).locator('p', { hasText: 'NO sustituye la valoración de un dietista-nutricionista colegiado' });
    await expect(destacado).toBeVisible();
    const fallos: string[] = [];
    if (!((await destacado.getAttribute('class')) ?? '').trim()) fallos.push('sin atributo class');
    const cajaLista = await lista.boundingBox();
    const cajaParrafo = await destacado.boundingBox();
    const hueco = cajaParrafo!.y - (cajaLista!.y + cajaLista!.height);
    if (hueco <= 8) fallos.push(`pegado a la lista (${hueco.toFixed(0)} px)`);
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · C0710 · disclaimerList: la lista de limitaciones lleva clase y sangría', async ({ page }) => {
    const lista = aviso(page).locator('ul', { hasText: 'NO reemplaza un plan nutricional personalizado' });
    await expect(lista).toBeVisible();
    const fallos: string[] = [];
    if (!((await lista.getAttribute('class')) ?? '').trim()) fallos.push('sin atributo class');
    const sangria = await lista.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    if (!(sangria > 0)) fallos.push(`padding-left ${sangria} px: las viñetas cuelgan fuera de la columna`);
    expect(fallos).toEqual([]);
  });
});

test.describe('Móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('caso 1 sin desbordamiento horizontal', async ({ page }) => {
    await calcular(page, { peso: '70', altura: '175', edad: '30' });
    await expect.poll(() => texto(page)).toContain('Calorías diarias objetivo 2556 kcal');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('HALLAZGO (18/11/2026, REPARADO) · C0710 · a 390 px la lista, el destacado y la urgencia del aviso llevan clase', async ({ page }) => {
    const piezas: Record<string, Locator> = {
      disclaimerList: aviso(page).locator('ul', { hasText: 'NO reemplaza un plan nutricional personalizado' }),
      highlight: aviso(page).locator('p', { hasText: 'NO sustituye la valoración de un dietista-nutricionista colegiado' }),
      emergency: aviso(page).locator('p', { hasText: 'consulta con tu médico inmediatamente' }),
    };
    const sinClase: string[] = [];
    for (const [nombre, loc] of Object.entries(piezas)) {
      await expect(loc).toBeVisible();
      if (!((await loc.getAttribute('class')) ?? '').trim()) sinClase.push(nombre);
    }
    expect(sinClase).toEqual([]);
  });
});
