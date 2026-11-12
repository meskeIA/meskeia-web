import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValorAcotado } from './_hidratacion';

/**
 * visualizador-escala-universo — «La Escala del Universo», del quark a la Vía Láctea
 *
 * Inspector, 12/11/2026 (primera inspección). La app no calcula nada que teclee el usuario:
 * elige uno de los 14 niveles (botones, deslizador 0-13, línea logarítmica o fila de la tabla)
 * y pinta su tamaño, su notación, una comparación con el nivel anterior y un dato curioso. Lo
 * comprobable es la aritmética de esas cifras: el tamaño que escribe `formatMetros` a partir de
 * `metros`, las razones «X veces más grande que…», la posición logarítmica de la línea
 * (`pctLog`) y las conversiones a UA y años luz.
 *
 * DATOS DE REFERENCIA (los que da el encargo del Inspector, no de memoria):
 *   · 1 UA = 149.597.870.700 m exactos (resolución B2 de la IAU, 2012)
 *   · 1 año luz = 9,4607304725808 × 10¹⁵ m
 * El resto de cifras son LAS DE LA PROPIA APP: la notación de cada nivel (10⁻¹⁸ m, 12.700 km,
 * 100.000 años luz…), el Everest de 8.849 m de su objeto y el Burj Khalifa de 828 m de su dato
 * curioso. Los hallazgos de abajo son incoherencias de la app consigo misma, no discrepancias
 * con una fuente externa.
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal)
 *     Tierra: 1,27 × 10⁷ m ÷ 10³ = 12.700 km (su notación lo dice bien). Comparación con el
 *       Everest: 1,27e7 ÷ 8.849 = 1.435,2 → «1.435 veces» ✓.
 *       → el tamaño sale «12.70 millones km»: 1,27 × 10¹⁰ m, mil veces más (HALLAZGO).
 *     Sol: 1,39 × 10⁹ ÷ 1,27 × 10⁷ = 109,4 → «109 veces» ✓.
 *     Sistema solar: 9 × 10¹² m ÷ 149.597.870.700 m = 60,16 UA → «60 UA» ✓; 9e12 ÷ 1,39e9 =
 *       6.475 → «6.500 veces el diámetro del Sol» ✓.
 *     Montaña: 8.849 m ÷ 828 m = 10,69 veces el Burj Khalifa → la app dice «17 veces», que es
 *       8.849 ÷ 500, el rascacielos genérico del nivel anterior (HALLAZGO).
 *   CASO 2 (límite: los dos extremos del deslizador)
 *     Mínimo (Inicio): Quark, «1 × 10⁻¹⁸ m»; ← no baja de ahí.
 *     Máximo (Fin): Vía Láctea, 100.000 años luz × 9,4607304725808e15 = 9,4607 × 10²⁰ m; → no
 *       sube de ahí. Comparación con el sistema solar: 9,46e20 ÷ 9e12 = 1,05 × 10⁸, unos 105
 *       millones de veces → la app dice «100.000 millones de veces», mil veces más (HALLAZGO).
 *     Línea logarítmica: el humano cae en (log₁₀ 1,7 + 18) ÷ (log₁₀ 9,46e20 + 18) = 46,77 %, y
 *       la media geométrica de los extremos es √(10⁻¹⁸ × 9,46 × 10²⁰) = 30,8 m → la app dice que
 *       el humano está «exactamente a mitad de la escala» (HALLAZGO).
 *   CASO 3 (lo que debe rechazarse)
 *     Deslizador a 20, a −5 y a 6,5 (no se puede teclear; se siembra como haría un lector de
 *     pantalla o una extensión): el control lo acota a 13, 0 y 7 y la tarjeta enseña Vía Láctea,
 *     Quark y Ser Humano, sin «undefined» ni «NaN» ni error en la consola.
 *
 * Los hallazgos van con test.fail(): cuando se reparen, el test «pasará» y Playwright lo marcará
 * como fallo inesperado; entonces se quita el test.fail() y el comentario pasa a REPARADO.
 */

const RUTA = '/visualizador-escala-universo/';
const DESLIZADOR = 'input[type="range"]';

const UA_M = 149_597_870_700;
const ANIO_LUZ_M = 9.4607304725808e15;

/** Clases locales del módulo de la tarjeta del nivel activo (sufijo «_x», vale en dev y en build). */
const CAMPOS = {
  nombre: '_nivelNombre',
  notacion: '_nivelNotacion',
  tamano: '_metrosValor',
  objeto: '_objetoValor',
  comparacion: '_comparacionTexto',
  dato: '_datoTexto',
} as const;
type Tarjeta = Record<keyof typeof CAMPOS, string>;

/**
 * Tamaño de cada nivel, sacado de la notación que la propia app escribe a su lado (y que está
 * bien en los 14): es la cifra contra la que se coteja lo que pinta `formatMetros`.
 */
const NIVELES: readonly { nombre: string; metros: number }[] = [
  { nombre: 'Quark', metros: 1e-18 }, // 10⁻¹⁸ m
  { nombre: 'Protón / Neutrón', metros: 1e-15 }, // 10⁻¹⁵ m
  { nombre: 'Átomo', metros: 1e-10 }, // 10⁻¹⁰ m
  { nombre: 'Molécula de ADN', metros: 2e-9 }, // ~2 nm
  { nombre: 'Virus', metros: 1e-7 }, // 100 nm
  { nombre: 'Célula', metros: 1e-5 }, // 10 µm
  { nombre: 'Hormiga', metros: 1e-3 }, // 1 mm
  { nombre: 'Ser Humano', metros: 1.7 }, // 1,7 m
  { nombre: 'Rascacielos', metros: 500 }, // 500 m
  { nombre: 'Montaña', metros: 8849 }, // Everest, 8.849 m (su objeto)
  { nombre: 'Tierra', metros: 1.27e7 }, // 12.700 km
  { nombre: 'El Sol', metros: 1.39e9 }, // 1,4 millones de km
  { nombre: 'Sistema Solar', metros: 9e12 }, // 9 × 10¹² m (60 UA)
  { nombre: 'Vía Láctea', metros: 100_000 * ANIO_LUZ_M }, // 100.000 años luz
];

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [DESLIZADOR]);
}

async function leerTarjeta(page: Page): Promise<Tarjeta> {
  const datos = await page.evaluate((campos) => {
    const salida: Record<string, string> = {};
    for (const [clave, local] of Object.entries(campos)) {
      salida[clave] = document.querySelector(`[class*="${local}"]`)?.textContent ?? '';
    }
    return salida;
  }, CAMPOS);
  return datos as Tarjeta;
}

async function elegirNivel(page: Page, nombre: string): Promise<Tarjeta> {
  await page
    .locator('[class*="_nivelesGrid"]')
    .getByRole('button', { name: nombre, exact: true })
    .click();
  await expect(page.locator(`[class*="${CAMPOS.nombre}"]`)).toHaveText(nombre);
  return leerTarjeta(page);
}

/**
 * Lee una cifra tal como la pinta la app: en formato español («12.700», «1,7») y, mientras dure
 * el hallazgo de formato, también a la inglesa («1.7», «12.70»). Un punto seguido de grupos de
 * exactamente tres cifras es de millar; cualquier otro punto, decimal.
 */
function leerCifra(texto: string): number {
  const t = texto.trim();
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, '').replace(',', '.'));
  return Number(t.replace(',', '.'));
}

const SUPERINDICES: Record<string, string> = {
  '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
};
const leerExponente = (sup: string): number =>
  Number(Array.from(sup).map((c) => SUPERINDICES[c] ?? '').join(''));

const UNIDADES: Record<string, number> = {
  fm: 1e-15,
  pm: 1e-12,
  nm: 1e-9,
  'µm': 1e-6, // signo micro
  'μm': 1e-6, // mu griega
  mm: 1e-3,
  cm: 1e-2,
  m: 1,
  km: 1e3,
  'millones km': 1e9,
  'millones de km': 1e9,
  UA: UA_M,
  'años luz': ANIO_LUZ_M,
};

/** «12.700 km» → 1,27e7 · «1 × 10⁻¹⁸ m» → 1e-18 · «100.000 años luz» → 9,46e20. NaN si no la entiende. */
function aMetros(texto: string): number {
  const m = texto.trim().match(/^([\d.,]+)\s*(?:×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*)?(.+)$/);
  if (!m) return NaN;
  const unidad = UNIDADES[m[3].trim()];
  if (unidad === undefined) return NaN;
  const potencia = m[2] ? 10 ** leerExponente(m[2]) : 1;
  return leerCifra(m[1]) * potencia * unidad;
}

/** El factor de una comparación: «1.435 veces» → 1435 · «100.000 millones de veces» → 1e11 · «10⁸ veces» → 1e8. */
function factorDeComparacion(texto: string): number {
  const millones = texto.match(/([\d.,]+)\s*(mil\s+)?millones\s+de\s+veces/);
  if (millones) return leerCifra(millones[1]) * (millones[2] ? 1e9 : 1e6);
  const potencia = texto.match(/10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*veces/);
  if (potencia) return 10 ** leerExponente(potencia[1]);
  const simple = texto.match(/([\d.,]+)\s*veces/);
  return simple ? leerCifra(simple[1]) : NaN;
}

const errorRelativo = (obtenido: number, esperado: number): number =>
  Math.abs(obtenido - esperado) / esperado;

/** Contraste WCAG entre dos colores sRGB [r, g, b]. */
function contraste(a: readonly number[], b: readonly number[]): number {
  const lum = ([r, g, bl]: readonly number[]): number => {
    const f = (v: number): number => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

interface PreguntaLd {
  name?: string;
  acceptedAnswer?: { text?: string };
}
interface BloqueLd {
  '@type'?: string;
  description?: string;
  featureList?: string[];
  mainEntity?: PreguntaLd[];
}

async function bloquesLd(page: Page): Promise<BloqueLd[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as BloqueLd);
}

test.describe('visualizador-escala-universo — tamaños, razones y extremos de la escala', () => {
  const erroresJs: string[] = [];

  test.beforeEach(async ({ page }) => {
    erroresJs.length = 0;
    page.on('pageerror', (e) => erroresJs.push(String(e)));
    await abrir(page);
  });

  test('carga con los 14 niveles y el humano por defecto, sin errores', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('La Escala del Universo');
    await expect(page.locator('[class*="_nivelesGrid"] button')).toHaveCount(14);
    await expect(page.locator('table tbody tr')).toHaveCount(14);
    const t = await leerTarjeta(page);
    expect(t.nombre).toBe('Ser Humano');
    expect(t.notacion).toBe('1,7 m');
    expect(erroresJs).toEqual([]);
  });

  test('CASO 1 · Tierra, Sol y sistema solar: notación, UA y comparaciones cuadran a mano', async ({ page }) => {
    // Tierra: 1,27e7 m = 12.700 km · 1,27e7 ÷ 8.849 = 1.435,2
    const tierra = await elegirNivel(page, 'Tierra');
    expect(tierra.notacion).toBe('12.700 km');
    expect(factorDeComparacion(tierra.comparacion)).toBe(1435);
    // Sol: 1,39e9 ÷ 1,27e7 = 109,4
    const sol = await elegirNivel(page, 'El Sol');
    expect(factorDeComparacion(sol.comparacion)).toBe(109);
    expect(errorRelativo(aMetros(sol.tamano), 1.39e9)).toBeLessThan(0.01);
    // Sistema solar: 9e12 m ÷ 149.597.870.700 m = 60,16 UA · 9e12 ÷ 1,39e9 = 6.475
    const ss = await elegirNivel(page, 'Sistema Solar');
    expect(ss.notacion).toContain('60 UA');
    expect(Math.round(aMetros(ss.tamano) / UA_M)).toBe(60);
    expect(errorRelativo(factorDeComparacion(ss.comparacion), 9e12 / 1.39e9)).toBeLessThan(0.03);
  });

  test('CASO 1 · el tamaño pintado cuadra con la notación del nivel en los 14 niveles (±10 %)', async ({ page }) => {
    // El defecto que vigila es de órdenes de magnitud (×1.000): 10 % basta y deja pasar el
    // redondeo de «8,8 km» frente a 8.849 m (0,6 %). La Tierra entró al repararse el 4579.
    for (const { nombre, metros } of NIVELES) {
      const t = await elegirNivel(page, nombre);
      const obtenido = aMetros(t.tamano);
      expect(obtenido, `${nombre}: «${t.tamano}» frente a ${metros} m`).not.toBeNaN();
      expect(errorRelativo(obtenido, metros), `${nombre}: «${t.tamano}» frente a ${metros} m`).toBeLessThan(0.1);
    }
  });

  test('HALLAZGO (12/11/2026, REPARADO) · el tamaño de la Tierra sale «12.70 millones km», mil veces su diámetro', async ({ page }) => {
    // 1,27 × 10⁷ m ÷ 10³ = 12.700 km, lo que dice su propia notación al lado. `formatMetros`
    // divide entre 10⁶ en el tramo 10⁶ ≤ m < 10⁹ y le pone «millones km»: 12,7 × 10⁶ km.
    const t = await elegirNivel(page, 'Tierra');
    expect(errorRelativo(aMetros(t.tamano), 1.27e7), `tamaño «${t.tamano}»`).toBeLessThan(0.1);
  });

  test('CASO 1 · cada comparación «X veces» es la razón de su nivel con el anterior (±3 %)', async ({ page }) => {
    // Montaña, aparte: se compara con el Burj Khalifa, no con el rascacielos genérico (su test
    // propio). La Vía Láctea entró al repararse el 4580. Rascacielos: 500 ÷ 1,7 = 294 → «300» (2 %).
    for (let i = 1; i < NIVELES.length; i++) {
      const { nombre, metros } = NIVELES[i];
      if (nombre === 'Montaña') continue;
      const t = await elegirNivel(page, nombre);
      const esperado = metros / NIVELES[i - 1].metros;
      expect(errorRelativo(factorDeComparacion(t.comparacion), esperado), `${nombre}: «${t.comparacion}» frente a ${esperado}`).toBeLessThan(0.03);
    }
  });

  test('HALLAZGO (12/11/2026, REPARADO) · el Everest no es «17 veces más alto que el Burj Khalifa»', async ({ page }) => {
    // Con las cifras de la propia app (Everest 8.849 m en su objeto, Burj Khalifa 828 m en el dato
    // curioso del rascacielos): 8.849 ÷ 828 = 10,69. El 17 es 8.849 ÷ 500, el rascacielos genérico.
    // Vale cualquiera de las dos reparaciones: nombrar el Burj con ~11, o el rascacielos con ~17,7.
    const t = await elegirNivel(page, 'Montaña');
    const factor = factorDeComparacion(t.comparacion);
    const esperado = /Burj/.test(t.comparacion) ? 8849 / 828 : 8849 / 500;
    expect(errorRelativo(factor, esperado), `«${t.comparacion}» frente a ${esperado.toFixed(2)}`).toBeLessThan(0.08);
  });

  test('CASO 2 · extremos del deslizador: Quark en el mínimo y Vía Láctea en el máximo, sin pasarse', async ({ page }) => {
    const deslizador = page.locator(DESLIZADOR);
    await deslizador.focus();
    await page.keyboard.press('Home');
    await expect(page.locator(`[class*="${CAMPOS.nombre}"]`)).toHaveText('Quark');
    let t = await leerTarjeta(page);
    expect(t.notacion).toBe('10⁻¹⁸ m');
    expect(errorRelativo(aMetros(t.tamano), 1e-18)).toBeLessThan(0.01);
    await page.keyboard.press('ArrowLeft');
    await expect(deslizador).toHaveValue('0');
    await expect(page.locator(`[class*="${CAMPOS.nombre}"]`)).toHaveText('Quark');

    await page.keyboard.press('End');
    await expect(page.locator(`[class*="${CAMPOS.nombre}"]`)).toHaveText('Vía Láctea');
    t = await leerTarjeta(page);
    expect(t.notacion).toBe('100.000 años luz');
    // 100.000 × 9,4607304725808e15 m = 9,4607e20 m; la app guarda 9,46e20 (−0,006 %)
    expect(errorRelativo(aMetros(t.tamano), 100_000 * ANIO_LUZ_M)).toBeLessThan(0.001);
    await page.keyboard.press('ArrowRight');
    await expect(deslizador).toHaveValue('13');
    await expect(page.locator(`[class*="${CAMPOS.nombre}"]`)).toHaveText('Vía Láctea');
    expect(erroresJs).toEqual([]);
  });

  test('HALLAZGO (12/11/2026, REPARADO) · la Vía Láctea no es «100.000 millones de veces» el sistema solar', async ({ page }) => {
    // 9,46 × 10²⁰ m ÷ 9 × 10¹² m = 1,05 × 10⁸: unos 105 millones de veces. La app dice 10¹¹.
    // Tolerancia 15 %: el defecto es ×1.000 y deja pasar «unos 100 millones».
    const t = await elegirNivel(page, 'Vía Láctea');
    expect(errorRelativo(factorDeComparacion(t.comparacion), (100_000 * ANIO_LUZ_M) / 9e12), `«${t.comparacion}»`).toBeLessThan(0.15);
  });

  test('CASO 2 · la línea logarítmica pone al humano en el 46,77 % (no en la mitad)', async ({ page }) => {
    // (log₁₀ 1,7 + 18) ÷ (log₁₀ 9,46e20 + 18) × 100 = 18,2304 ÷ 38,9759 × 100 = 46,77
    const punto = page.getByRole('button', { name: 'Nivel Ser Humano, 1,7 m' });
    const left = await punto.evaluate((el) => parseFloat((el as HTMLElement).style.left));
    expect(left).toBeCloseTo(46.77, 1);
    const extremos = await page.getByRole('button', { name: /^Nivel (Quark|Vía Láctea),/ }).evaluateAll((els) =>
      els.map((el) => parseFloat((el as HTMLElement).style.left)),
    );
    expect(extremos).toEqual([0, 100]);
  });

  test('HALLAZGO (12/11/2026, REPARADO) · «el ser humano está exactamente a mitad de la escala» contradice su propia línea', async ({ page }) => {
    // La línea de la app lo pone en el 46,77 % (test anterior); la mitad logarítmica entre
    // 10⁻¹⁸ m y 9,46 × 10²⁰ m es √(9,46 × 10²) = 30,8 m, y humano/quark = 1,7 × 10¹⁸ frente a
    // galaxia/humano = 5,6 × 10²⁰ (330 veces de diferencia). «Exactamente» solo vale en el 50 %.
    // REPARADO: la tarjeta y el dato curioso dicen ahora «cerca de la mitad», algo más próximo a
    // lo pequeño, que es lo que pinta la línea. Se comprueba que no vuelva el «exactamente» y que
    // el texto dé la asimetría correcta (más cerca del quark: 18 órdenes frente a casi 21).
    const left = await page
      .getByRole('button', { name: 'Nivel Ser Humano, 1,7 m' })
      .evaluate((el) => parseFloat((el as HTMLElement).style.left));
    expect(left).toBeLessThan(50);
    const tarjetas = await page.locator('[class*="_compTexto"]').allTextContents();
    const humano = await leerTarjeta(page);
    for (const texto of [...tarjetas, humano.dato]) {
      expect(texto).not.toMatch(/exactamente (a mitad|medianos)|centro del universo/);
    }
    expect(tarjetas.join(' ')).toMatch(/cerca de la mitad[^.]*próximo a lo pequeño/);
    expect(humano.dato).toMatch(/18 órdenes[^.]*casi 21/);
  });

  test('CASO 3 · el deslizador acota a 20, −5 y 6,5 a niveles válidos, sin undefined ni NaN', async ({ page }) => {
    const casos: [string, string, string][] = [
      ['20', '13', 'Vía Láctea'],
      ['-5', '0', 'Quark'],
      ['6.5', '7', 'Ser Humano'],
    ];
    for (const [pedido, aceptado, nombre] of casos) {
      expect(await sembrarValorAcotado(page, DESLIZADOR, pedido)).toBe(aceptado);
      await expect(page.locator(`[class*="${CAMPOS.nombre}"]`)).toHaveText(nombre);
      const t = await leerTarjeta(page);
      for (const valor of Object.values(t)) {
        expect(valor).not.toMatch(/undefined|NaN/);
        expect(valor.length).toBeGreaterThan(0);
      }
    }
    expect(erroresJs).toEqual([]);
  });

  test('HALLAZGO (12/11/2026, REPARADO) · el tamaño se escribe en formato US: «1.7 m», «500.0 m», «100000 años luz»', async ({ page }) => {
    // `formatMetros` usa toFixed(): punto decimal y sin separador de millar. Esperado en es-ES:
    // «0,1 nm», «1 mm», «1,7 m», «500 m», «12.700 km», «1,39 × 10⁹ m», «100.000 años luz».
    const malos: string[] = [];
    for (const { nombre } of NIVELES) {
      const t = await elegirNivel(page, nombre);
      if (/\d\.\d{1,2}(?!\d)/.test(t.tamano) || /\d{5,}/.test(t.tamano)) malos.push(`${nombre}: «${t.tamano}»`);
    }
    expect(malos).toEqual([]);
  });

  test('HALLAZGO (12/11/2026, REPARADO) · el texto blanco de la cabecera del nivel no llega a 4,5:1 en 11 de 14 colores', async ({ page }) => {
    // La notación (16 px, opacidad 0,9) y el tamaño (17,6 px negrita, por debajo de los 18,66 px
    // de «texto grande») exigen 4,5:1. Medido: El Sol 2,03:1 la notación y 2,19:1 el nombre;
    // Virus, Célula y Vía Láctea, por debajo de 3:1 incluso en el nombre de 26 px.
    await page.addStyleTag({ content: '[class*="_nivelHeader"] { transition: none !important; }' });
    const bajos: string[] = [];
    for (const { nombre } of NIVELES) {
      await elegirNivel(page, nombre);
      const { fondo, opacidad } = await page.evaluate(() => {
        const cabecera = document.querySelector('[class*="_nivelHeader"]') as HTMLElement;
        const notacion = document.querySelector('[class*="_nivelNotacion"]') as HTMLElement;
        const rgb = getComputedStyle(cabecera).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
        return { fondo: rgb.slice(0, 3), opacidad: Number(getComputedStyle(notacion).opacity) };
      });
      const texto = fondo.map((c) => 255 * opacidad + c * (1 - opacidad));
      const ratio = contraste(fondo, texto);
      if (ratio < 4.5) bajos.push(`${nombre}: ${ratio.toFixed(2)}:1`);
    }
    expect(bajos).toEqual([]);
  });

  test('HALLAZGO (12/11/2026, REPARADO) · el deslizador se anuncia como «7», no como el nivel', async ({ page }) => {
    // Sin aria-valuetext un lector de pantalla lee el índice 0-13. En el arranque es Ser Humano.
    await expect(page.locator(DESLIZADOR)).toHaveAttribute('aria-valuetext', /Humano/, { timeout: 1000 });
  });

  test('HALLAZGO (12/11/2026, REPARADO) · Espacio en una fila de la tabla elige el nivel pero desplaza la página', async ({ page }) => {
    // onKeyDown acepta « » sin preventDefault: la página baja una pantalla (medido 1084 → 1732 px).
    const fila = page.locator('table tbody tr').nth(3);
    await fila.scrollIntoViewIfNeeded();
    await fila.focus();
    const antes = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Space');
    await expect(page.locator(`[class*="${CAMPOS.nombre}"]`)).toHaveText('Molécula de ADN');
    await page.waitForTimeout(300);
    // REPARADO: al cambiar de nivel la tarjeta de arriba cambia de alto (otro dato curioso) y el
    // anclaje de scroll del navegador corrige unas decenas de píxeles (medido 23 px); el defecto
    // era el desplazamiento de una pantalla (~500-650 px). Se exige menos de 100 px y la fila a la vista.
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - antes)).toBeLessThan(100);
    await expect(fila).toBeInViewport();
  });
});

test.describe('visualizador-escala-universo — lo que leen buscadores y asistentes', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('la página dice 39 órdenes de magnitud: de 10⁻¹⁸ m a 10²¹ m', async ({ page }) => {
    // 21 − (−18) = 39
    await expect(page.locator('[class*="_insight"]')).toContainText('39 órdenes de magnitud');
    await expect(page.locator('[class*="_compTexto"]').nth(1)).toContainText('10³⁹ veces');
  });

  test('HALLAZGO (12/11/2026, REPARADO) · la FAQ dice «unos 42 órdenes de magnitud» entre 10⁻¹⁸ y 10²¹ m', async ({ page }) => {
    // Sus propios extremos dan 21 − (−18) = 39, lo que dice la página dos veces.
    const faq = (await bloquesLd(page)).find((b) => b['@type'] === 'FAQPage');
    const respuesta = faq?.mainEntity?.[0]?.acceptedAnswer?.text ?? '';
    const ordenes = respuesta.match(/(\d+) órdenes de magnitud/);
    expect(ordenes?.[1], respuesta).toBe('39');
  });

  test('HALLAZGO (12/11/2026, REPARADO) · metadata, JSON-LD y FAQ hablan de «12 niveles» y la app tiene 14', async ({ page }) => {
    // El hero dice «14 niveles» y hay 14 botones; la description, og, twitter, el JSON-LD (su
    // description y la primera característica, que enumera 12 sin Protón ni Virus) y la FAQ, 12.
    const n = await page.locator('[class*="_nivelesGrid"] button').count();
    const bloques = await bloquesLd(page);
    const app = bloques.find((b) => b['@type'] === 'WebApplication');
    const faq = bloques.find((b) => b['@type'] === 'FAQPage');
    const textos = [
      (await page.locator('meta[name="description"]').getAttribute('content')) ?? '',
      (await page.locator('meta[property="og:description"]').getAttribute('content')) ?? '',
      (await page.locator('meta[name="twitter:description"]').getAttribute('content')) ?? '',
      app?.description ?? '',
      ...(app?.featureList ?? []),
      ...(faq?.mainEntity ?? []).map((p) => p.acceptedAnswer?.text ?? ''),
    ];
    const cuentas = textos.flatMap((t) => Array.from(t.matchAll(/(\d+) niveles/g)).map((m) => Number(m[1])));
    expect(cuentas.length).toBeGreaterThan(0);
    expect(cuentas.every((c) => c === n), `menciones: ${cuentas.join(', ')} · botones: ${n}`).toBe(true);
  });

  test('HALLAZGO (12/11/2026, REPARADO) · las analogías del protón y del núcleo no cuadran con la razón 100.000 de la app', async ({ page }) => {
    // La app da átomo ÷ protón = 10⁻¹⁰ ÷ 10⁻¹⁵ = 100.000 y, en «Comparaciones que asombran», un
    // átomo del tamaño de un campo de fútbol. Con esa razón, una pelota de tenis o una naranja
    // (~7 cm) darían un átomo de ~7 km, no un estadio; un átomo-campo (~100 m) da un núcleo de ~1 mm.
    const proton = await elegirNivel(page, 'Protón / Neutrón');
    expect(proton.dato).not.toMatch(/pelota de tenis[^.]*estadio/);
    const atomo = await elegirNivel(page, 'Átomo');
    expect(atomo.dato).not.toMatch(/naranja[^.]*campo de fútbol/);
  });
});
