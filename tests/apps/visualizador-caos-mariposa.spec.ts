import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * Inspector — visualizador-caos-mariposa (segmento interactiva · física / sistemas dinámicos)
 *
 * Primera inspección: 18/11/2026. La app promete en su <h1> «Caos y Efecto Mariposa» y en el
 * subtítulo «El atractor de Lorenz y la sensibilidad a condiciones iniciales». Todo vive en
 * page.tsx, sin motor aparte: integra el sistema de Lorenz con σ = 10, ρ = 28, β = 8/3 por Euler
 * explícito (dt = 0,01, 7.000 pasos) desde x₀ = 0,1 y x₀ = 0,1 + ε (y₀ = z₀ = 0), pinta la
 * proyección x-z en un lienzo 700 × 350 (x ∈ [−22, 22], z ∈ [2, 48]) y anuncia el primer paso con
 * |Δx| + |Δz| > 5 («Las trayectorias divergen en el paso N»). El deslizador de ε va de 0 a 30 y
 * ε = 10^(−val/10): de 1 (izquierda) a 0,001 (derecha).
 *
 * LOS CASOS, RESUELTOS APARTE ANTES DE ABRIR EL NAVEGADOR (scripts propios del Inspector:
 * Euler con el dt de la app y RK4 con dt = 0,001, 0,0005 y 0,00025, que dan lo mismo)
 *   CASO 1 (normal) — ε = 0,01 por defecto. Con el Euler de la app, primer cruce en el paso 1.458;
 *     con las ecuaciones de Lorenz (RK4 convergido), en el 2.681 (t = 26,8). El marcador rojo debe
 *     aparecer en cuanto el progreso pasa del paso anunciado, y no antes.
 *   CASO 2 (límite) — los extremos del deslizador: ε = 0,001 (Euler 1.481 · Lorenz 2.849) y ε = 1
 *     (Euler 20 · Lorenz 19). Con la ε más pequeña la divergencia no puede llegar antes.
 *     Y la posición 19 (ε = 0,0126): primer cruce en el paso 54, en la salida desde el origen
 *     (equilibrio inestable); después las trayectorias vuelven a juntarse (a menos de 1, hasta
 *     0,013, entre los pasos 554 y 1.119; la distancia no pasa de 5 entre el 79 y el 1.454) y se
 *     separan de verdad en el 1.455. La ley d(t) ≈ ε·e^(λt) que da la propia página, con
 *     λ ≈ 0,906, mueve la divergencia ln(10^0,1)/0,906 ≈ 0,25 unidades (≈ 25 pasos) entre las
 *     posiciones 19 y 20; la app salta de 54 a 1.458.
 *   CASO 3 (rechazo) — un valor fuera del deslizador (45, −5) se recorta a 30 y 0: ε = 0,001 y 1,
 *     sin NaN ni Infinity. ε = 0 no se puede elegir (con ε = 0 las dos trayectorias serían
 *     idénticas y nunca divergirían).
 *   Exponente de Lyapunov máximo (Benettin): 0,903 con RK4 dt = 0,001 (el valor publicado es
 *     0,906) y 1,040 con el Euler dt = 0,01 de la app. 0,906 es en base e (nats por unidad de
 *     tiempo): 0,906 / ln 2 = 1,31 bits por unidad, y el error se duplica cada ln 2 / 0,906 = 0,77
 *     unidades, como dice el FAQPage.
 *   Contraste de la leyenda sobre el fondo medido rgb(250, 250, 250): #E67E22 = 2,73:1 y
 *     #E74C3C = 3,66:1 (texto normal de 13,6 px: 4,5:1).
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (18/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES', colorScheme: 'light' });

const RUTA = '/visualizador-caos-mariposa/';
const EPS = '#diferencia-inicial';
const PROGRESO = '#progreso-simulacion';

// ── Referencia: el sistema de Lorenz con RK4 (dt = 0,001), muestreado cada 0,01 como la app ──
// Válida para la condición inicial de la leyenda (x₀ = 0,1, y₀ = z₀ = 0) y el umbral de la app
// (|Δx| + |Δz| > 5). Si la reparación cambia cualquiera de los dos, se cambia aquí.
const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const X0 = 0.1;
type Punto = [number, number, number];

function derivada([x, y, z]: Punto): Punto {
  return [SIGMA * (y - x), x * (RHO - z) - y, x * y - BETA * z];
}

function pasoRk4(p: Punto, dt: number): Punto {
  const k1 = derivada(p);
  const k2 = derivada([p[0] + (k1[0] * dt) / 2, p[1] + (k1[1] * dt) / 2, p[2] + (k1[2] * dt) / 2]);
  const k3 = derivada([p[0] + (k2[0] * dt) / 2, p[1] + (k2[1] * dt) / 2, p[2] + (k2[2] * dt) / 2]);
  const k4 = derivada([p[0] + k3[0] * dt, p[1] + k3[1] * dt, p[2] + k3[2] * dt]);
  return [
    p[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    p[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    p[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
  ];
}

/** Primer «paso» (de 0,01) en que las dos trayectorias de Lorenz se separan más de 5. */
function pasoDivergenciaLorenz(eps: number): number {
  let a: Punto = [X0, 0, 0];
  let b: Punto = [X0 + eps, 0, 0];
  for (let i = 0; i < 7000; i++) {
    for (let s = 0; s < 10; s++) {
      a = pasoRk4(a, 0.001);
      b = pasoRk4(b, 0.001);
    }
    if (Math.abs(a[0] - b[0]) + Math.abs(a[2] - b[2]) > 5) return i;
  }
  return 7000;
}

// ── Lectura de la página ──

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [EPS, PROGRESO]);
}

/** El aviso de la app (no el anunciador de rutas de Next, que también es role="alert"). */
const avisoDivergencia = (page: Page): Locator => page.getByRole('alert').filter({ hasText: 'trayectorias' });
const rotuloEpsilon = (page: Page): Locator => page.locator(`label[for="diferencia-inicial"] strong`);

async function pasoAnunciado(page: Page): Promise<number> {
  const texto = await avisoDivergencia(page).innerText();
  const m = texto.match(/paso\s+([\d.\s  ]+)/);
  expect(m, `aviso: «${texto}»`).not.toBeNull();
  return Number(m![1].replace(/\D/g, ''));
}

const SUPERINDICES: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+',
};

/** ε del rótulo, admita la forma que admita: «1,00e-2», «1,00 × 10⁻²», «0,01» (o la de hoy, «1.00e-2»). */
function valorEpsilon(texto: string): number {
  const t = texto
    .replace(/\s/g, '')
    .replace(/−/g, '-')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => SUPERINDICES[c]);
  const m = t.match(/^(\d+(?:[.,]\d+)?)(?:(?:[×x·]10\^?|e)([+-]?\d+))?$/i);
  if (!m) return NaN;
  const mantisa = Number(m[1].replace(',', '.'));
  return m[2] !== undefined ? mantisa * 10 ** Number(m[2]) : mantisa;
}

async function epsilonMostrada(page: Page): Promise<number> {
  return valorEpsilon(await rotuloEpsilon(page).innerText());
}

/** Píxeles del rojo del marcador de divergencia (#E74C3C) en el lienzo, tras dejarle pintar. */
async function pixelesMarcador(page: Page): Promise<number> {
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
  return page.locator('canvas').evaluate((el) => {
    const lienzo = el as HTMLCanvasElement;
    const ctx = lienzo.getContext('2d');
    if (!ctx) return -1;
    const { data } = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (r > 200 && g > 50 && g < 110 && b > 40 && b < 90) n++;
    }
    return n;
  });
}

/** Texto de la página sin scripts (la guía educativa cuenta aunque esté plegada). */
async function textoDeLaPagina(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return (clon.textContent ?? '').replace(/\s+/g, ' ');
  });
}

// ─────────────────────────────────────────────────────────────────────────────

test('la referencia RK4 reproduce los valores convergidos del Inspector: 2.681 (ε = 0,01) y 2.849 (ε = 0,001)', () => {
  expect(pasoDivergenciaLorenz(0.01)).toBe(2681);
  expect(pasoDivergenciaLorenz(0.001)).toBe(2849);
});

test.describe('Dinámica del sistema de Lorenz', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal): con ε = 0,01 por defecto, el marcador de divergencia aparece cuando el progreso pasa del paso anunciado, y no antes', async ({ page }) => {
    expect(await epsilonMostrada(page)).toBeCloseTo(0.01, 6);
    const n = await pasoAnunciado(page);
    expect(n).toBeGreaterThanOrEqual(100);
    expect(n).toBeLessThan(7000);
    const antes = Math.floor(n / 100) * 100;
    await sembrarValor(page, PROGRESO, antes);
    await expect(page.locator('label[for="progreso-simulacion"]')).toContainText(`paso ${antes.toLocaleString('es-ES')}`);
    expect(await pixelesMarcador(page), `progreso ${antes} < paso ${n}: sin marcador`).toBe(0);
    await sembrarValor(page, PROGRESO, antes + 100);
    await expect.poll(() => pixelesMarcador(page), { message: `progreso ${antes + 100} > paso ${n}: con marcador` }).toBeGreaterThan(0);
  });

  test('CASO 2 (límite): los extremos del deslizador dan ε = 0,001 y ε = 1; con la ε más pequeña la divergencia no llega antes, y volver a 0,01 repite el paso', async ({ page }) => {
    const nDefecto = await pasoAnunciado(page);
    await sembrarValor(page, EPS, 30);
    const eps30 = await epsilonMostrada(page);
    const n30 = await pasoAnunciado(page);
    await sembrarValor(page, EPS, 0);
    const eps0 = await epsilonMostrada(page);
    const n0 = await pasoAnunciado(page);
    const [pequena, grande] = eps30 < eps0 ? [{ eps: eps30, n: n30 }, { eps: eps0, n: n0 }] : [{ eps: eps0, n: n0 }, { eps: eps30, n: n30 }];
    expect(pequena.eps).toBeCloseTo(0.001, 9);
    expect(grande.eps).toBeCloseTo(1, 9);
    expect(pequena.n, 'ε = 0,001 diverge no antes que ε = 0,01').toBeGreaterThanOrEqual(nDefecto);
    expect(grande.n, 'ε = 1 diverge no después que ε = 0,01').toBeLessThanOrEqual(nDefecto);
    await sembrarValor(page, EPS, 20);
    expect(await epsilonMostrada(page)).toBeCloseTo(0.01, 9);
    expect(await pasoAnunciado(page), 'determinista: la misma ε, el mismo paso').toBe(nDefecto);
  });

  test('CASO 3 (rechazo): un valor fuera del deslizador (45 y −5) se recorta a sus extremos, sin NaN ni Infinity', async ({ page }) => {
    expect(await sembrarValorAcotado(page, EPS, 45)).toBe('30');
    expect(await epsilonMostrada(page)).toBeCloseTo(0.001, 9);
    await expect(rotuloEpsilon(page)).not.toContainText(/NaN|Infinity/);
    await expect(avisoDivergencia(page)).not.toContainText(/NaN|Infinity/);
    expect(await sembrarValorAcotado(page, EPS, -5)).toBe('0');
    expect(await epsilonMostrada(page)).toBeCloseTo(1, 9);
    await expect(rotuloEpsilon(page)).not.toContainText(/NaN|Infinity/);
    await expect(avisoDivergencia(page)).not.toContainText(/NaN|Infinity/);
  });

  test.fail('HALLAZGO ABIERTO (cálculo): con ε = 0,01 el paso anunciado es el de las ecuaciones de Lorenz (2.681), no el del Euler con dt = 0,01 (1.458)', async ({ page }) => {
    // Euler explícito de primer orden con dt = 0,01: λ máx = 1,04 frente a 0,906, y la divergencia
    // con ε = 0,01 sale en el paso 1.458. RK4 convergido: 2.681 (RK4 con dt = 0,01 da 2.757 y
    // Heun con dt = 0,01, 2.821: la tolerancia de ±150 admite cualquier integrador de orden ≥ 2).
    const referencia = pasoDivergenciaLorenz(0.01);
    const n = await pasoAnunciado(page);
    expect(Math.abs(n - referencia), `app ${n} · Lorenz ${referencia}`).toBeLessThanOrEqual(150);
  });

  test.fail('HALLAZGO ABIERTO (cálculo): con ε = 0,0126 la divergencia anunciada no es la salida desde el origen (hoy paso 54; se separan de verdad en el 1.455)', async ({ page }) => {
    // Entre las posiciones 19 y 20 (ε × 0,79) la ley d(t) ≈ ε·e^(λt) mueve la divergencia ≈ 25
    // pasos; hoy 54 frente a 1.458, porque el primer cruce de 5 es la salida rápida desde el
    // equilibrio inestable del origen, tras la que las trayectorias vuelven a juntarse.
    await sembrarValor(page, EPS, 19);
    expect(await epsilonMostrada(page)).toBeCloseTo(0.0126, 4);
    const n19 = await pasoAnunciado(page);
    await sembrarValor(page, EPS, 20);
    const n20 = await pasoAnunciado(page);
    expect(Math.abs(n19 - n20), `posición 19: paso ${n19} · posición 20: paso ${n20}`).toBeLessThanOrEqual(150);
  });

  test.fail('HALLAZGO ABIERTO (cálculo): con ε = 0,1 el «● Punto de divergencia» anunciado se ve en el lienzo', async ({ page }) => {
    // Hoy: «divergen en el paso 39», en (x 3,22 · z 0,82), que cae bajo el borde inferior del
    // lienzo (z < 2): el marcador no se pinta.
    await sembrarValor(page, EPS, 10);
    expect(await epsilonMostrada(page)).toBeCloseTo(0.1, 9);
    const n = await pasoAnunciado(page);
    expect(n).toBeLessThan(7000);
    expect(await pixelesMarcador(page), `paso ${n} con el progreso en 7.000`).toBeGreaterThan(0);
  });

  test.fail('HALLAZGO ABIERTO (operativa): la pista «← … · … →» nombra bien el extremo de la ε más pequeña', async ({ page }) => {
    await sembrarValor(page, EPS, 30);
    const epsDerecha = await epsilonMostrada(page);
    await sembrarValor(page, EPS, 0);
    const epsIzquierda = await epsilonMostrada(page);
    const pista = await page.locator('small', { hasText: 'ε' }).innerText();
    const [izquierda, derecha] = pista.split('·');
    // Hoy: la derecha da ε = 0,001 y la pista dice «ε más grande →»
    if (epsDerecha < epsIzquierda) {
      expect(derecha, `derecha: ε = ${epsDerecha}`).toContain('pequeña');
      expect(izquierda, `izquierda: ε = ${epsIzquierda}`).toContain('grande');
    } else {
      expect(derecha).toContain('grande');
      expect(izquierda).toContain('pequeña');
    }
  });
});

test.describe('Formato español', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test.fail('CABO C0499 — HALLAZGO ABIERTO: la ε del rótulo va con coma decimal (hoy «1.00e-2» y «1.00e-3»)', async ({ page }) => {
    for (const [posicion, eps] of [[20, 0.01], [30, 0.001]] as const) {
      if (posicion !== 20) await sembrarValor(page, EPS, posicion);
      const texto = await rotuloEpsilon(page).innerText();
      expect(texto, `ε = ${eps}`).not.toMatch(/\d\.\d/);
      expect(valorEpsilon(texto)).toBeCloseTo(eps, 9);
    }
  });

  test.fail('HALLAZGO ABIERTO: ninguna cifra de la página con punto decimal (x₀ = 0.1, 0.506127, 0.00001, 0.9, 2.06)', async ({ page }) => {
    const bloques = ['El Atractor de Lorenz', 'Conceptos clave', 'Sistemas caóticos en el mundo real'];
    let texto = '';
    for (const titulo of bloques) {
      texto += ' ' + (await page.locator('section').filter({ has: page.getByRole('heading', { name: titulo }) }).textContent());
    }
    texto += ' ' + (await page.locator('[data-guia-educativa]').textContent());
    const conPunto = texto.match(/\d\.\d+/g) ?? [];
    expect(conPunto, `con punto: ${conPunto.join(' · ')}`).toHaveLength(0);
  });
});

test.describe('Accesibilidad', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test.fail('HALLAZGO ABIERTO: la leyenda «Trayectoria 2» y «Punto de divergencia» llega a 4,5:1 en el tema claro', async ({ page }) => {
    // Hoy: #E67E22 = 2,73:1 y #E74C3C = 3,66:1 sobre rgb(250, 250, 250), en style={{…}} en línea
    expect(await contrasteSobreFondoReal(page.getByText(/^■ Trayectoria 1/)), 'Trayectoria 1 (control)').toBeGreaterThanOrEqual(4.5);
    expect(await contrasteSobreFondoReal(page.getByText(/^■ Trayectoria 2/)), 'Trayectoria 2').toBeGreaterThanOrEqual(4.5);
    expect(await contrasteSobreFondoReal(page.getByText(/Punto de divergencia$/)), 'Punto de divergencia').toBeGreaterThanOrEqual(4.5);
  });

  test.fail('HALLAZGO ABIERTO: el deslizador de ε anuncia la ε, no su índice 0-30 (hoy «Diferencia inicial epsilon», «20»)', async ({ page }) => {
    const deslizador = page.getByRole('slider', { name: /Diferencia inicial/ });
    await expect(deslizador).toHaveValue('20');
    const visible = (await rotuloEpsilon(page).innerText()).trim();
    const valuetext = await deslizador.getAttribute('aria-valuetext');
    expect(valuetext, 'aria-valuetext').not.toBeNull();
    expect(valorEpsilon((valuetext ?? '').replace(/^[^\d]*/, '')), `aria-valuetext «${valuetext}» frente a «${visible}»`).toBeCloseTo(0.01, 9);
  });
});

test.describe('Textos y datos estructurados', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test.fail('HALLAZGO ABIERTO: λ ≈ 0,906 no son «0.9 bits» ni «un bit cada segundo» (son 1,31 bits por unidad; el FAQPage: se duplica cada 0,77)', async ({ page }) => {
    const texto = await textoDeLaPagina(page);
    expect(texto).not.toMatch(/0[.,]9\s*bits/);
    expect(texto).not.toMatch(/bit[^.]*cada segundo/);
  });

  test.fail('HALLAZGO ABIERTO: la fibrilación no es el ejemplo del corazón «demasiado regular»', async ({ page }) => {
    const texto = await textoDeLaPagina(page);
    expect(texto).toContain('Cardiología');
    expect(texto).not.toMatch(/demasiado regular[^.]*fibrilaci/i);
  });

  test.fail('HALLAZGO ABIERTO: el límite de unas dos semanas es del pronóstico del TIEMPO, y Mandelbrot no «mostró» que los precios sean caóticos', async ({ page }) => {
    const texto = await textoDeLaPagina(page);
    expect(texto).not.toContain('predecir el clima');
    expect(texto).not.toMatch(/Mandelbrot mostró que los precios tienen estructura caótica/);
  });

  test.fail('HALLAZGO ABIERTO: el WebApplication declara de 4 a 8 características (hoy featureList vacío)', async ({ page }) => {
    const caracteristicas = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; featureList?: string[] };
        if (j['@type'] === 'WebApplication') return j.featureList ?? [];
      }
      return null;
    });
    expect(caracteristicas).not.toBeNull();
    expect((caracteristicas ?? []).length).toBeGreaterThanOrEqual(4);
    expect((caracteristicas ?? []).length).toBeLessThanOrEqual(8);
  });

  test.fail('HALLAZGO ABIERTO: las cinco preguntas del FAQPage están en la página (hoy ninguna)', async ({ page }) => {
    await comprobarFaqPageUnico(page);
  });
});
