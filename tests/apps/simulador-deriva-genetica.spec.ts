import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * Simulador de Deriva Genética y Selección — Inspector, primera inspección (09/11/2026)
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Simulador de Deriva Genética y Selección»: Wright-Fisher de 2 alelos con selección
 *   (w_AA, w_Aa, w_aa), mutación (μ, ν), migración (m, p_m), deriva con N, G generaciones y K
 *   trayectorias. Da P(fijación A), P(pérdida A), tiempo medio, p̄ final, H inicial y H final, las
 *   trayectorias y un histograma de las p finales. La guía enseña H_t ≈ H₀(1−1/(2N))^t y dice que
 *   «H final menor que H inicial confirma que la deriva … redujo la diversidad».
 *
 * ES ESTOCÁSTICA: Math.random se sustituye por mulberry32 con semilla (addInitScript) para que el
 * test sea reproducible, pero cada tolerancia sale de la varianza teórica, no de la semilla.
 *
 * ESPERADOS CALCULADOS APARTE (Wright-Fisher con binomial EXACTO; cadena de Markov para 2N = 100,
 * recursiones de media y varianza para el resto; script en .inspector-trabajo, no la app)
 *   A1 · Mutación μ = 0,01 desde p0 = 1, N = 1000, G = 100: E[p] = (1−μ)^100 = 0,99^100 = 0,366032
 *        sd(p_100) = 0,0695 → sd(p̄) con K = 50 = 0,0098 → tolerancia ± 0,04 (4 sd)
 *   A2 · Migración m = 0,1, p_m = 0, desde p0 = 1, N = 1000, G = 10: E[p] = 0,9^10 = 0,348678
 *        sd(p̄) K = 50 = 0,0032 → ± 0,015
 *   A3 · Direccional w = (1; 0,95; 0,8), p0 = 0,5, N = 1000, G = 100: determinista p_100 = 0,997798;
 *        con deriva (800 réplicas binomiales) 0,997576, sd(p̄) K = 50 = 0,0007 → ± 0,004
 *   A4 · Equilibradora w = (0,9; 1; 0,6), p0 = 0,3, N = 1000, G = 200:
 *        p* = (w_Aa − w_aa)/(2w_Aa − w_AA − w_aa) = 0,4/0,5 = 0,8 (la recursión llega a 0,800000)
 *        sd estacionaria por población ≈ 0,021 → sd(p̄) K = 50 ≈ 0,003 → ± 0,015
 *   B  · p0 = 1 y p0 = 0 son absorbentes: P(fijación) 100 % / 0 %, p̄ 1 / 0, H 0; HW 100-0-0.
 *        N = 1000, p0 = 0,5, G = 10: sd(p_10) = 0,035 → p̄ = 0,5 ± 0,03 y nada se fija ni se pierde.
 *   C  · w_AA = w_Aa = w_aa = 0: fitness medio nulo, nadie deja descendencia; p' = (…)/w̄ es 0/0.
 *        Debe rechazarse o avisar. La app lo simula como deriva neutra.
 *
 * HALLAZGOS — todos REPARADOS el 09/11/2026 (/reparar; el modelo pasó a motor.ts):
 *   C = 4346 · H1 = 4342 · H2 = 4345 · H3 = 4344 · H4 = 4343 · H5 = 4347 · H6 = 4348 · H7 = 4349 ·
 *   H8 = 4350 · H9 = 4351 · H10 = 4352. Lo que decía cada uno:
 *   H1 (alto) · «H final» es 2·p̄·(1−p̄) de la MEDIA de las K poblaciones, no la media de 2pq de cada
 *        una. Deriva pura N = 50, p0 = 0,5, G = 100, K = 50: E[H] = 0,5·(1−1/100)^100 = 0,183016,
 *        sd(media) = 0,0283 → [0,083; 0,283]. La app da 0,47-0,50 (E[2p̄q̄] = 0,4937).
 *   H2 (medio) · «Tiempo medio» pinta G cuando nada se fijó ni perdió: HW (N = 1000, G = 100) → «100»
 *        (Kimura: −4N(p ln p + q ln q) = 2772,6 generaciones). Con p0 = 1 da 1, y ya estaba fijado (0).
 *   H3 (medio) · Con N ≥ 500 cuenta como fijada la población que alguna vez tocó p ≥ 0,999 (≤ 2 copias
 *        de a con N = 1000), aunque luego no se fije. Direccional N = 1000 K = 50: P(fijación)·K debe
 *        ser el número de trayectorias que acaban en p = 1 (sin mutación ni migración, absorbente);
 *        medido 38 frente a 30, 37/36, 31/25, 40/33, 41/36. Binomial: 64,5 % fijadas, 75,0 % «tocaron».
 *   H4 (medio) · El muestreo para 2N ≥ 30 es una normal redondeada y acotada, no la binomial de
 *        Wright-Fisher: con 1 copia en 2N = 100 (p0 = 0,01, N = 50), P(perdido en g = 10) binomial =
 *        0,8386; la app da 0,804 en 5000 réplicas (sd 0,0052, 6,6 sd). Su P(fijación) a largo plazo
 *        sale 0,0125 en vez de 1/(2N) = 0,01.
 *   H5 (bajo) · Al mover K tras simular, la leyenda dice «Media de las 20 simulaciones» sobre 50.
 *   H6 (bajo) · Formato: μ y ν con toExponential («0.0e+0», «1.0e-2») y el % pegado («36,0%»).
 *   H7 (bajo) · En oscuro los rótulos del gráfico (#6b7280 sobre #1a1a1a, 11,5 px) dan 3,60:1 (< 4,5).
 *   H8 (bajo) · El histograma solo da sus cuentas en `title` de <div>: no llegan al lector de pantalla.
 *   H9 (bajo) · Ninguna de las 5 preguntas del FAQPage está en la FAQ visible (dos la repiten con otras
 *        palabras y la mutación sale «10⁻⁵–10⁻⁶» en una y «10⁻⁶ a 10⁻⁴» en la otra).
 *   H10 (bajo) · «Regla 4Ns: si |s|·N ≪ 1»: el nombre lleva el 4 y la condición no.
 */

function generadorConSemilla(semilla: number): void {
  let a = semilla;
  Math.random = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CONTROLES = ['#p0', '#N', '#wAA', '#wAa', '#waa', '#mu', '#nu', '#m', '#pm', '#G', '#K'];

/** «36,0 %», «0,366», «1.234» → número (formato español, con o sin espacio antes del %). */
function num(texto: string): number {
  return Number(texto.replace(/[\s %]/g, '').replace(/\./g, '').replace(',', '.'));
}

function zonaResultados(page: Page): Locator {
  return page.locator('[role="status"]', { hasText: 'Resultados de la simulación' });
}

async function metricas(page: Page): Promise<Record<string, string>> {
  return zonaResultados(page).evaluate((zona) => {
    const out: Record<string, string> = {};
    for (const c of Array.from(zona.querySelectorAll('div'))) {
      const ps = c.querySelectorAll(':scope > p');
      if (ps.length === 2) out[(ps[0].textContent ?? '').trim()] = (ps[1].textContent ?? '').trim();
    }
    return out;
  });
}

async function simular(page: Page): Promise<Record<string, string>> {
  await page.getByRole('button', { name: 'Simular', exact: true }).click();
  await expect(zonaResultados(page)).toBeVisible();
  return metricas(page);
}

async function elegirModo(page: Page, boton: string, nEsperado: number): Promise<void> {
  await page.getByRole('button', { name: boton, exact: true }).click();
  await esperarValorEnReact(page, '#N', nEsperado);
}

async function celdasHW(page: Page): Promise<Record<string, number>> {
  const caja = page.locator('section', {
    has: page.getByRole('heading', { name: /Equilibrio de Hardy-Weinberg/ }),
  });
  const pares = await caja.evaluate((s) =>
    Array.from(s.querySelectorAll('strong')).map((st) => [
      (st.textContent ?? '').trim(),
      (st.nextElementSibling?.textContent ?? '').trim(),
    ]),
  );
  return Object.fromEntries(pares.map(([k, v]) => [k, num(v)]));
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(generadorConSemilla, 20261109);
  await page.goto('/simulador-deriva-genetica/');
  await esperarHidratacion(page, CONTROLES);
});

test.describe('Inspector 09/11/2026 · casos con verdad comprobable', () => {
  test('A1 (normal) · mutación μ = 0,01 desde p0 = 1: p̄ tras 100 generaciones ≈ 0,99^100 = 0,366', async ({ page }) => {
    await sembrarValor(page, '#p0', 1);
    await sembrarValor(page, '#N', 1000);
    await sembrarValor(page, '#mu', 0.01);
    await sembrarValor(page, '#K', 50);
    const m = await simular(page);
    expect(Math.abs(num(m['p̄ final']) - 0.366032), `p̄ final = ${m['p̄ final']}`).toBeLessThan(0.04);
    expect(num(m['P(fijación A)'])).toBe(0);
    expect(num(m['P(pérdida A)'])).toBe(0);
  });

  test('A2 (normal) · migración m = 0,1 con p_m = 0 desde p0 = 1: p̄ tras 10 generaciones ≈ 0,9^10 = 0,3487', async ({ page }) => {
    await sembrarValor(page, '#p0', 1);
    await sembrarValor(page, '#N', 1000);
    await sembrarValor(page, '#m', 0.1);
    await sembrarValor(page, '#pm', 0);
    await sembrarValor(page, '#G', 10);
    await sembrarValor(page, '#K', 50);
    const m = await simular(page);
    expect(Math.abs(num(m['p̄ final']) - 0.348678), `p̄ final = ${m['p̄ final']}`).toBeLessThan(0.015);
  });

  test('A3 (normal) · selección direccional (1; 0,95; 0,8) con N = 1000: p̄ ≈ 0,9976 y A no se pierde', async ({ page }) => {
    await elegirModo(page, 'Selección direccional', 200);
    await sembrarValor(page, '#N', 1000);
    await sembrarValor(page, '#K', 50);
    const m = await simular(page);
    expect(Math.abs(num(m['p̄ final']) - 0.9976), `p̄ final = ${m['p̄ final']}`).toBeLessThan(0.004);
    expect(num(m['P(pérdida A)'])).toBe(0);
  });

  test('A4 (normal) · selección equilibradora (0,9; 1; 0,6) desde 0,3: converge a p* = 0,4/0,5 = 0,8', async ({ page }) => {
    await elegirModo(page, 'Selección equilibradora', 200);
    await sembrarValor(page, '#wAA', 0.9);
    await sembrarValor(page, '#waa', 0.6);
    await sembrarValor(page, '#p0', 0.3);
    await sembrarValor(page, '#N', 1000);
    await sembrarValor(page, '#K', 50);
    const m = await simular(page);
    expect(Math.abs(num(m['p̄ final']) - 0.8), `p̄ final = ${m['p̄ final']}`).toBeLessThan(0.015);
    expect(num(m['P(fijación A)'])).toBe(0);
    expect(num(m['P(pérdida A)'])).toBe(0);
  });

  test('B (límite) · p0 = 1 y p0 = 0 son absorbentes; con N = 1000 y 10 generaciones apenas hay deriva', async ({ page }) => {
    await sembrarValor(page, '#p0', 1);
    let m = await simular(page);
    expect(num(m['P(fijación A)'])).toBe(100);
    expect(num(m['P(pérdida A)'])).toBe(0);
    expect(num(m['p̄ final'])).toBe(1);
    expect(num(m['H inicial (2pq)'])).toBe(0);
    expect(num(m['H final'])).toBe(0);
    expect(await celdasHW(page)).toEqual({ 'AA (p²)': 100, 'Aa (2pq)': 0, 'aa (q²)': 0 });

    await sembrarValor(page, '#p0', 0);
    m = await simular(page);
    expect(num(m['P(fijación A)'])).toBe(0);
    expect(num(m['P(pérdida A)'])).toBe(100);
    expect(num(m['p̄ final'])).toBe(0);
    expect(await celdasHW(page)).toEqual({ 'AA (p²)': 0, 'Aa (2pq)': 0, 'aa (q²)': 100 });

    // p0 = 0,5, N = 1000, G = 10: sd(p_10) = sqrt(0,25·(1 − 0,9995^10)) = 0,035; p̄ de 50 → sd 0,005
    await sembrarValor(page, '#p0', 0.5);
    await sembrarValor(page, '#N', 1000);
    await sembrarValor(page, '#G', 10);
    await sembrarValor(page, '#K', 50);
    m = await simular(page);
    expect(Math.abs(num(m['p̄ final']) - 0.5)).toBeLessThan(0.03);
    expect(num(m['P(fijación A)'])).toBe(0);
    expect(num(m['P(pérdida A)'])).toBe(0);
    expect(num(m['H inicial (2pq)'])).toBe(0.5);
  });

  test('REPARADO (hallazgo 4346) · C (se rechaza) · fitness 0, 0, 0: avisa y no simula', async ({ page }) => {
    // w̄ = 0 → antes la app dejaba p igual (if (wAvg > 0)) y simulaba deriva neutra como si w = 1, 1, 1.
    await sembrarValor(page, '#wAA', 0);
    await sembrarValor(page, '#wAa', 0);
    await sembrarValor(page, '#waa', 0);
    await page.getByRole('button', { name: 'Simular', exact: true }).click();
    // El anunciador de rutas de Next también es role="alert": se acota a <main>.
    await expect(page.locator('main').getByRole('alert')).toBeVisible({ timeout: 2000 });
    await expect(zonaResultados(page)).toHaveCount(0);
  });
});

test.describe('Inspector 09/11/2026 · hallazgos reparados', () => {
  test('REPARADO H1 (hallazgo 4342) · deriva pura N = 50, K = 50: H final ≈ 0,5·0,99^100 = 0,183, no ≈ 0,49', async ({ page }) => {
    // Antes: heteroFinal = 2·pFinalMedio·(1 − pFinalMedio), con pFinalMedio la MEDIA de las K p.
    // Lo que enseña la guía (H_t ≈ H₀(1−1/(2N))^t) es la media de 2·p_i·q_i de cada población.
    await sembrarValor(page, '#K', 50);
    const m = await simular(page);
    expect(num(m['H inicial (2pq)'])).toBe(0.5);
    expect(Math.abs(num(m['H final']) - 0.183016), `H final = ${m['H final']}`).toBeLessThan(0.1);
  });

  test('REPARADO H2 (hallazgo 4345) · «Tiempo medio» ya no pinta G cuando nada se fijó, y da 0 con p0 = 1', async ({ page }) => {
    await elegirModo(page, 'Hardy-Weinberg (N=1000)', 1000);
    let m = await simular(page);
    expect(num(m['P(fijación A)']) + num(m['P(pérdida A)'])).toBe(0);
    // Ninguna se fijó ni se perdió en 100 generaciones: «100» no es una media medida (teórica 2772,6)
    expect(m['Tiempo medio (gen.)']).not.toBe('100');
    await expect(zonaResultados(page)).toContainText('ninguna población se fijó ni se perdió en 100 generaciones');
    await elegirModo(page, 'Deriva pura (N=50)', 50);
    await sembrarValor(page, '#p0', 1);
    m = await simular(page);
    // Fijado desde la generación 0
    expect(num(m['Tiempo medio (gen.)'])).toBe(0);
  });

  test('REPARADO H3 (hallazgo 4344) · N = 1000: P(fijación)·K = trayectorias que acaban en p = 1', async ({ page }) => {
    // Sin mutación ni migración, p = 1 es absorbente: una población fijada termina en p = 1.
    // Antes la app marcaba «fijada» la que tocaba p ≥ 0,999 (con N = 1000, aún quedan 1-2 copias de a).
    await elegirModo(page, 'Selección direccional', 200);
    await sembrarValor(page, '#N', 1000);
    await sembrarValor(page, '#K', 50);
    await simular(page);
    const corridas = await page.evaluate(async () => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Simular');
      const out: { marcadas: number; enUno: number }[] = [];
      for (let i = 0; i < 5; i++) {
        btn?.click();
        await new Promise((r) => setTimeout(r, 0));
        const zona = document.querySelector('[role="status"]');
        let pf = NaN;
        for (const c of Array.from(zona?.querySelectorAll('div') ?? [])) {
          const ps = c.querySelectorAll(':scope > p');
          if (ps.length === 2 && ps[0].textContent?.trim() === 'P(fijación A)') {
            pf = Number((ps[1].textContent ?? '').replace(/[\s %]/g, '').replace(',', '.'));
          }
        }
        const svg = document.querySelector('svg[role="img"]');
        const yDe = (rotulo: string) => {
          const t = Array.from(svg?.querySelectorAll('text') ?? []).find((x) => x.textContent === rotulo);
          return Number(t?.parentElement?.querySelector('line')?.getAttribute('y1'));
        };
        const y0 = yDe('0,00');
        const y1 = yDe('1,00');
        const trayectorias = Array.from(svg?.querySelectorAll('path') ?? []).slice(0, 50);
        const enUno = trayectorias.filter((p) => {
          const m = (p.getAttribute('d') ?? '').match(/([\d.]+)\s*$/);
          const pFinal = (y0 - Number(m?.[1])) / (y0 - y1);
          return pFinal > 1 - 0.00025; // media copia de 2N = 2000
        }).length;
        out.push({ marcadas: Math.round((pf / 100) * 50), enUno });
      }
      return out;
    });
    for (const c of corridas) expect(c.marcadas, JSON.stringify(corridas)).toBe(c.enUno);
  });

  test('REPARADO H4 (hallazgo 4343) · 1 copia en 2N = 100: P(perdido en 10 generaciones) = 0,8386 (binomial)', async ({ page }) => {
    // Cadena de Markov binomial exacta: P(0 copias en g = 10 | 1 copia, 2N = 100) = 0,8386.
    // 100 corridas de K = 50 = 5000 réplicas → sd 0,0052; tolerancia ± 0,02 (3,8 sd).
    // La normal redondeada del sampleBinomial viejo daba 0,8019 (y 0,804 medido).
    await sembrarValor(page, '#p0', 0.01);
    await sembrarValor(page, '#G', 10);
    await sembrarValor(page, '#K', 50);
    await simular(page);
    const media = await page.evaluate(async () => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Simular');
      let suma = 0;
      for (let i = 0; i < 100; i++) {
        btn?.click();
        await new Promise((r) => setTimeout(r, 0));
        const zona = document.querySelector('[role="status"]');
        for (const c of Array.from(zona?.querySelectorAll('div') ?? [])) {
          const ps = c.querySelectorAll(':scope > p');
          if (ps.length === 2 && ps[0].textContent?.trim() === 'P(pérdida A)') {
            suma += Number((ps[1].textContent ?? '').replace(/[\s %]/g, '').replace(',', '.'));
          }
        }
      }
      return suma / 100 / 100;
    });
    expect(Math.abs(media - 0.8386), `P(pérdida) media = ${media}`).toBeLessThan(0.02);
  });

  test('REPARADO H5 (hallazgo 4347) · mover K tras simular no cambia cuántas trayectorias dice la leyenda', async ({ page }) => {
    await sembrarValor(page, '#K', 50);
    await simular(page);
    await sembrarValor(page, '#K', 20);
    // Correcto: o se retira el resultado viejo, o la leyenda sigue diciendo las 50 que se dibujaron
    if ((await zonaResultados(page).count()) === 0) return;
    const leyenda = (await page.getByText(/Media de las \d+ simulaciones/).textContent()) ?? '';
    expect(Number(leyenda.match(/\d+/)?.[0])).toBe(50);
    await expect(page.getByText(/en las 50 simulaciones \(20 intervalos\)/)).toBeVisible();
  });

  test('REPARADO H6 (hallazgo 4348) · formato español: μ sin punto decimal y % separado con espacio duro', async ({ page }) => {
    await sembrarValor(page, '#mu', 0.01);
    await expect(page.locator('label[for="mu"]')).not.toContainText(/\d\.\d/, { timeout: 1000 });
    await expect(page.locator('label[for="mu"]')).toContainText('0,0100');
    const m = await simular(page);
    // Regla del 25/09/2026 (CLAUDE.md global §2): espacio duro U+00A0 entre la cifra y el %
    expect(m['P(fijación A)'].endsWith(String.fromCharCode(0xa0) + '%'), m['P(fijación A)']).toBe(true);
    expect(m['P(fijación A)']).toMatch(/\d %$/);
    expect(m['P(fijación A)']).toMatch(/\d %$/);
  });

  test('REPARADO H7 (hallazgo 4349) · en oscuro los rótulos del gráfico llegan a 4,5:1', async ({ page }) => {
    await activarTema(page, 'dark');
    await prepararParaMedir(page);
    await simular(page);
    const ratio = await page.locator('svg[role="img"]').evaluate((svg) => {
      const lum = ([r, g, b]: number[]) => {
        const f = (c: number) => {
          const x = c / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
      const fondo = lum(rgb(getComputedStyle(svg).backgroundColor));
      const texto = lum(rgb(getComputedStyle(svg.querySelector('text') as Element).fill));
      return (Math.max(fondo, texto) + 0.05) / (Math.min(fondo, texto) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('REPARADO H8 (hallazgo 4350) · el histograma da sus cuentas al lector de pantalla', async ({ page }) => {
    await sembrarValor(page, '#K', 50);
    await simular(page);
    const seccion = page.locator('section', {
      has: page.getByRole('heading', { name: 'Distribución de frecuencias finales p(A)' }),
    });
    const img = seccion.getByRole('img');
    await expect(img).toHaveCount(1);
    // Las cuentas de los intervalos del nombre accesible suman las 50 simulaciones
    const nombre = (await img.getAttribute('aria-label')) ?? '';
    const cuentas = Array.from(nombre.matchAll(/: (\d+)/g)).map((x) => Number(x[1]));
    expect(cuentas.reduce((a, b) => a + b, 0), nombre).toBe(50);
  });

  test('REPARADO H9 (hallazgo 4351) · un solo FAQPage, con las preguntas de la FAQ visible', async ({ page }) => {
    await comprobarFaqPageUnico(page);
  });

  test('REPARADO H10 (hallazgo 4352) · la «regla 4Ns» lleva el 4 en su condición', async ({ page }) => {
    const tip = page.getByText(/Regla 4Ns/);
    await expect(tip).toHaveCount(1);
    expect((await tip.textContent()) ?? '').not.toContain('|s|·N ≪ 1');
  });
});
