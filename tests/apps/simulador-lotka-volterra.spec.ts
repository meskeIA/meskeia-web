import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';
import { activarTemaOscuro } from '../_contraste';

/**
 * Inspector — simulador-lotka-volterra (segmento cálculo, riesgo 3). Primera inspección: 04/11/2026.
 *
 * El <h1> promete «Simulador Depredador-Presa · Modelo Lotka-Volterra y dinámica de poblaciones»;
 * la metadata, «ciclos, extinciones y equilibrios», modo clásico y modo con capacidad de carga,
 * gráfico temporal y diagrama de fases, 4 presets y «detección automática de picos, colapsos y
 * extinciones». La verdad es el propio sistema de EDO, así que cada cifra se contrasta con una
 * integración aparte (.inspector-trabajo/lotka-calculo*.mjs, ejecutada ANTES de abrir la app).
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-lotka-volterra/page.tsx (no importa motores ni data/)
 *   · paso(): RK4 de dx/dt = αx − βxy (o αx(1 − x/K) − βxy en logístico), dy/dt = δxy − γy,
 *     con Math.max(0, …) en cada paso
 *   · simular(): paso 0,02, muestra un punto de cada floor(pasos/1500), y CORTA la simulación
 *     con (0, 0) en cuanto x < 0,001 y y < 0,001 a la vez
 *   · detectarEventos(): máximos locales estrictos en ventana de 10 muestras y la primera
 *     «casi-extinción» (mínimo < 1) de cada especie; se pintan los 12 primeros
 *   · «Estado actual»: último punto animado, t con 1 decimal, poblaciones con 0 (formatNumber)
 *   Todos los parámetros son <input type="range"> con mínimo positivo: no hay campo de texto.
 *   La animación avanza en tiempo real (≈ 60 muestras/s), así que cada simulación tarda lo suyo:
 *   t = 10 son 501 muestras (≈ 8,5 s) y t ≥ 30 unas 1.500-1.700 (≈ 25-28 s).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — valores iniciales x₀ 40, y₀ 9, α 1, β 0,1, δ 0,075, γ 1,5, t = 10.
 *     Equilibrio (γ/δ, α/β) = (20, 10) · periodo lineal 2π/√(αγ) = 5,130 (la órbita, mayor,
 *     da 5,467) · V = δx − γ ln x + βy − α ln y = −3,830544 constante sobre la órbita.
 *     RK4 h = 0,0001: x(10) = 25,7984, y(10) = 3,4321 → «26 individuos» y «3 individuos».
 *     El esquema de la app (RK4 0,02) da lo mismo a 4 decimales y conserva V a 3·10⁻⁸.
 *     Primer pico de presas: 40,14 en t ≈ 5,54 → «Pico de presas: 40 ind. en t=5,5».
 *
 *   CASO 2 (límite) — presas y depredadores EN el equilibrio: x₀ = 20, y₀ = 10, t = 10.
 *     dx/dt = 20·(1 − 0,1·10) = 0 y dy/dt = 10·(0,075·20 − 1,5) = 0 → nada se mueve:
 *     «20 individuos» y «10 individuos», eje «Población — máx: 20», ningún evento.
 *     Y el logístico del preset «Equilibrio estable» (α 1, β 0,1, δ 0,08, γ 0,8, K 100):
 *     x* = γ/δ = 10, y* = (α/β)(1 − x* ÷ K) = 9; jacobiana [[−αx* ÷ K, −βx*], [δy*, 0]] =
 *     [[−0,1, −1], [0,72, 0]] → autovalores −0,05 ± 0,847i, foco estable. RK4 en t = 80:
 *     (9,8355; 9,3962) → «10 individuos» y «9 individuos».
 *
 *   CASO 3 (rechazo) — valores fuera del deslizador: x₀ 0 o 500, y₀ 0, β −1. El navegador los
 *     acota al rango del control (1, 200, 1 y 0,001) y la etiqueta lo dice.
 *
 *   SOBREPESCA (preset, clásico) — x₀ 40, y₀ 30, α 0,8, β 0,4, δ 0,05, γ 0,3, t = 80.
 *     Equilibrio (6, 2). V₀ = 10,172378: órbita cerrada enorme. RK4 h = 0,0001: en t = 34,92
 *     ambas bajan de 0,001 (x = 1,9·10⁻⁷, y = 0,000995) y AMBAS SE RECUPERAN: las presas
 *     rebrotan hasta 231,2 en t = 61,18. El RK4 de la app a 0,02, sin la regla de corte, da
 *     231,19 en t = 61,18 y conserva V a 1,6·10⁻⁴: el método es bueno; lo que extingue es el corte.
 *
 * Los casos con test.fail() son hallazgos ABIERTOS de esta inspección: cuando se reparen,
 * Playwright marcará el «fallo esperado» como inesperado; entonces se quita el test.fail() y el
 * comentario pasa a REPARADO.
 */

const URL_APP = '/simulador-lotka-volterra/';
const DESLIZADORES = ['#x0', '#y0', '#alfa', '#beta', '#delta', '#gamma', '#tTotal'];

async function abrir(page: Page): Promise<void> {
  await page.goto(URL_APP);
  await esperarHidratacion(page, DESLIZADORES);
}

/** El valor de una fila de «Estado actual del ecosistema». */
function fila(page: Page, etiqueta: string): Locator {
  return page.locator('main [class*="resultRow"]').filter({ hasText: etiqueta }).locator('span').nth(1);
}

const eventos = (page: Page): Locator => page.locator('main [class*="eventItem"]');
const eje = (page: Page, texto: string): Locator => page.locator('main svg text').filter({ hasText: texto });

async function simular(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Simular', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Estado actual del ecosistema' })).toBeVisible();
}

/** Espera a que la animación termine: los botones Pausar/Velocidad solo existen mientras anima. */
async function esperarFin(page: Page, ms: number): Promise<void> {
  await expect(page.getByRole('button', { name: /^(Pausar|Reanudar)$/ })).toBeHidden({ timeout: ms });
}

/** «10,0 u.t.» → 10 */
function aNumero(texto: string | null): number {
  const m = (texto ?? '').match(/(\d+)(?:,(\d+))?/);
  if (!m) throw new Error(`Sin número en «${texto}»`);
  return Number(`${m[1]}.${m[2] ?? '0'}`);
}

async function textoPrincipal(page: Page): Promise<string> {
  return ((await page.locator('main').textContent()) ?? '').replace(/\s+/g, ' ');
}

test.describe('Lotka-Volterra clásico: casos resueltos a mano', () => {
  test('valores iniciales con t = 10 → presas 26 y depredadores 3 (RK4: 25,80 y 3,43)', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await sembrarValor(page, '#tTotal', 10);
    await expect(page.locator('label[for="tTotal"]')).toHaveText('Tiempo total: 10 u.t.');
    await simular(page);
    await esperarFin(page, 40_000);
    await expect(fila(page, 'Tiempo simulado')).toHaveText('10,0 u.t.');
    await expect(fila(page, 'Presas (x)')).toHaveText('26 individuos');
    await expect(fila(page, 'Depredadores (y)')).toHaveText('3 individuos');
    await expect(fila(page, 'Modo')).toHaveText('Lotka-Volterra clásico');
    // Primer máximo de presas del RK4 preciso: 40,14 en t ≈ 5,54.
    await expect(eventos(page).filter({ hasText: 'Pico de presas' }).first()).toHaveText(
      /Pico de presas: 40 ind\. en t=5,5$/,
    );
  });

  test('en el equilibrio (x₀ = γ/δ = 20, y₀ = α/β = 10) las poblaciones no se mueven', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await sembrarValor(page, '#x0', 20);
    await sembrarValor(page, '#y0', 10);
    await sembrarValor(page, '#tTotal', 10);
    await simular(page);
    await esperarFin(page, 40_000);
    await expect(fila(page, 'Tiempo simulado')).toHaveText('10,0 u.t.');
    await expect(fila(page, 'Presas (x)')).toHaveText('20 individuos');
    await expect(fila(page, 'Depredadores (y)')).toHaveText('10 individuos');
    await expect(eje(page, 'Población')).toHaveText('Población — máx: 20');
    await expect(page.getByRole('heading', { name: 'Eventos detectados' })).toHaveCount(0);
  });

  test('fuera del rango del deslizador: x₀ 0 → 1, x₀ 500 → 200, y₀ 0 → 1, β −1 → 0,001', async ({ page }) => {
    await abrir(page);
    expect(await sembrarValorAcotado(page, '#x0', 0)).toBe('1');
    await expect(page.locator('label[for="x0"]')).toHaveText('Presas iniciales x₀: 1');
    expect(await sembrarValorAcotado(page, '#x0', 500)).toBe('200');
    await expect(page.locator('label[for="x0"]')).toHaveText('Presas iniciales x₀: 200');
    expect(await sembrarValorAcotado(page, '#y0', 0)).toBe('1');
    await expect(page.locator('label[for="y0"]')).toHaveText('Depredadores iniciales y₀: 1');
    expect(await sembrarValorAcotado(page, '#beta', -1)).toBe('0.001');
    await expect(page.locator('label[for="beta"]')).toHaveText('β (depredación): 0,001');
  });

  test('ABIERTO · sobrepesca: el clásico no se extingue, la órbita llega a t = 80 y las presas rebrotan a 231', async ({ page }) => {
    // Hallazgo de esta inspección: la regla «x < 0,001 y y < 0,001 → (0, 0) y break» de
    // simular() para la simulación en t = 34,9 con «0 individuos» y «0 individuos». El modelo
    // (RK4 h = 0,0001, y el propio RK4 de la app sin el corte) conserva V = 10,1724 y devuelve
    // las presas hasta 231,2 en t = 61,18. Contradice la FAQ visible: «El Lotka-Volterra clásico
    // nunca predice extinción matemática».
    test.setTimeout(120_000);
    await abrir(page);
    await page.getByRole('button', { name: /Sobrepesca/ }).click();
    await expect(page.locator('label[for="beta"]')).toHaveText('β (depredación): 0,400');
    await expect(page.locator('label[for="tTotal"]')).toHaveText('Tiempo total: 80 u.t.');
    await simular(page);
    await esperarFin(page, 90_000);
    test.fail();
    await expect(fila(page, 'Tiempo simulado')).toHaveText('80,0 u.t.');
    await expect(eje(page, 'Población')).toHaveText('Población — máx: 231');
  });

  test('ABIERTO · «Velocidad 4x» avanza más deprisa que 1x', async ({ page }) => {
    // Hallazgo de esta inspección: el efecto de la animación depende de puntosVisibles, así que
    // se reinicia en cada fotograma, pone ultimoTiempoRef a 0 y el incremento sale siempre
    // max(1, 0) = 1 muestra por fotograma. Medido: 1x 3,7 → 10,9 u.t. en 2 s; 4x 4,0 → 11,3.
    test.setTimeout(60_000);
    await abrir(page);
    const tiempo = fila(page, 'Tiempo simulado');
    const avanceEn = async (ms: number): Promise<number> => {
      const t0 = aNumero(await tiempo.textContent());
      await page.waitForTimeout(ms);
      return aNumero(await tiempo.textContent()) - t0;
    };
    await simular(page);
    const avance1 = await avanceEn(1500);
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await simular(page);
    const velocidad = page.getByRole('button', { name: /Velocidad/ });
    await velocidad.click();
    await velocidad.click();
    await expect(velocidad).toHaveText(/Velocidad 4x/);
    const avance4 = await avanceEn(1500);
    expect(avance1).toBeGreaterThan(0);
    test.fail();
    expect(avance4).toBeGreaterThan(2 * avance1);
  });

  test('ABIERTO · el rótulo «Modo» del resultado no cambia al pulsar otro modo sin volver a simular', async ({ page }) => {
    // Hallazgo de esta inspección: la fila «Modo» lee el estado del selector, no el de la
    // simulación pintada: tras simular el clásico y pulsar «Con capacidad de carga», las curvas
    // siguen siendo las del clásico y la fila dice «Con capacidad de carga».
    await abrir(page);
    await simular(page);
    await expect(fila(page, 'Modo')).toHaveText('Lotka-Volterra clásico');
    await page.getByRole('button', { name: 'Con capacidad de carga' }).click();
    test.fail();
    await expect(page.locator('main [class*="resultRow"]').filter({ hasText: 'Con capacidad de carga' })).toHaveCount(0);
  });

  test('ABIERTO · si la guía promete «picos máximos y mínimos», el panel muestra mínimos', async ({ page }) => {
    // Hallazgo de esta inspección: detectarEventos() solo emite máximos y la primera
    // «casi-extinción» (mínimo < 1). Con los valores iniciales y t = 10 el mínimo de presas
    // (8,08) y el de depredadores (3,17) no aparecen; con t = 100 la lista se queda en los 12
    // primeros de 37 eventos (último en t = 32,9).
    test.setTimeout(60_000);
    await abrir(page);
    await sembrarValor(page, '#tTotal', 10);
    await simular(page);
    await esperarFin(page, 40_000);
    await expect(eventos(page).first()).toBeVisible();
    const promete = (await textoPrincipal(page)).includes('picos máximos y mínimos');
    const minimos = await eventos(page).filter({ hasText: /mínimo/i }).count();
    test.fail();
    expect(promete ? minimos : 1).toBeGreaterThan(0);
  });
});

test.describe('Lotka-Volterra con capacidad de carga', () => {
  test('preset «Equilibrio estable» → converge a (γ/δ, (α/β)(1 − x*/K)) = (10, 9)', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await page.getByRole('button', { name: /Equilibrio estable/ }).click();
    await expect(page.locator('label[for="K"]')).toHaveText('K (capacidad de carga): 100');
    await expect(page.locator('label[for="delta"]')).toHaveText('δ (eficiencia conversión): 0,080');
    await simular(page);
    await esperarFin(page, 90_000);
    await expect(fila(page, 'Tiempo simulado')).toHaveText('80,0 u.t.');
    await expect(fila(page, 'Presas (x)')).toHaveText('10 individuos');
    await expect(fila(page, 'Depredadores (y)')).toHaveText('9 individuos');
    await expect(fila(page, 'Modo')).toHaveText('Con capacidad de carga');
  });

  test('ABIERTO · la guía da el equilibrio del logístico, no solo el del clásico (y* = 9, no α/β = 10)', async ({ page }) => {
    // Hallazgo de esta inspección: el paso 1 («x* = γ/δ, y* = α/β») y el consejo «Verifícalo con
    // la simulación» no dicen que y* = α/β es solo el clásico: en el preset de arriba la app
    // converge a 9, que es (α/β)(1 − γ/(δK)).
    await abrir(page);
    test.fail();
    await expect(page.getByText(/Calcula los puntos de equilibrio teóricos/)).toContainText('K');
  });
});

test.describe('Textos de la guía, FAQ y datos estructurados', () => {
  test('ABIERTO · δ = 0,075 con β = 0,1 son β/δ = 1,33 presas por depredador nacido, no ~13', async ({ page }) => {
    // En dx/dt = αx − βxy, dy/dt = δxy − γy se comen βxy presas y nacen δxy depredadores:
    // depredadores por presa = δ/β = 0,75, presas por depredador = β/δ = 1,33. «~13» es 1/δ, que
    // solo valdría con β = 1; la definición «cuántos depredadores genera cada presa» es δ/β.
    await abrir(page);
    test.fail();
    expect(await textoPrincipal(page)).not.toContain('~13 presas por depredador nacido');
  });

  test('ABIERTO · con γ = 1,5 la vida media es 1/γ = 0,67 u.t.; 0,46 es la semivida (ln 2/γ)', async ({ page }) => {
    await abrir(page);
    test.fail();
    expect(await textoPrincipal(page)).not.toContain('vida media ~0,46');
  });

  test('ABIERTO · «Con t=100 puedes ver 4-5 ciclos»: con los valores iniciales son 18 (periodo 5,47)', async ({ page }) => {
    // RK4 preciso: 19 máximos de presas en [0, 100], periodo medio 5,467; con el preset linces y
    // liebres 7,20 (≈ 14 ciclos); el diagrama de fases y los eventos de la propia app lo muestran.
    await abrir(page);
    test.fail();
    expect(await textoPrincipal(page)).not.toContain('4-5 ciclos completos');
  });

  test('ABIERTO · porcentajes con espacio duro: «10 %», no «10%»', async ({ page }) => {
    await abrir(page);
    test.fail();
    expect((await page.locator('main table').textContent()) ?? '').not.toMatch(/\d%/);
  });

  test('ABIERTO · «Caos demográfico» en un sistema de dos EDO autónomas: es periódico, no caótico', async ({ page }) => {
    // Poincaré-Bendixson: un sistema autónomo en el plano no tiene caos. Con el preset (α 1,8,
    // β 0,05, δ 0,05, γ 1,8) la órbita es cerrada (V conservada a 8·10⁻⁶) y la propia app pinta
    // picos de 146-147 cada 4,5 u.t.
    await abrir(page);
    test.fail();
    await expect(page.getByRole('button', { name: /Caos/ })).toHaveCount(0);
  });

  test('ABIERTO · la FAQ del JSON-LD no afirma un «umbral de extinción» que el modelo no tiene', async ({ page }) => {
    // Con los valores iniciales y β subida a 0,5 (máximo), el modelo y la app dan órbitas
    // cerradas (V conservada, presas máx 80,6, en t = 100 «2» y «1» individuos): ninguna
    // extinción. En el clásico ningún β ni α positivo cruza umbral alguno.
    await page.goto(URL_APP);
    const respuestas = await page.locator('script[type="application/ld+json"]').evaluateAll((ss) =>
      ss
        .map((s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>)
        .filter((j) => j['@type'] === 'FAQPage')
        .flatMap((j) => (j.mainEntity as { acceptedAnswer: { text: string } }[]).map((q) => q.acceptedAnswer.text)),
    );
    expect(respuestas.length).toBeGreaterThanOrEqual(5);
    test.fail();
    expect(respuestas.join(' ')).not.toMatch(/umbral de extinción|también se extinguen/);
  });

  test('ABIERTO · un solo FAQPage y con las preguntas de la FAQ visible', async ({ page }) => {
    // Las cinco preguntas del faqJsonLd no están en la página; «¿Por qué las poblaciones de
    // depredadores y presas oscilan en ciclos?» es la visible «¿Por qué oscilan las poblaciones?»
    // con otra respuesta. Reparación: UNA constante PREGUNTAS_FRECUENTES (check:faq-unica).
    await page.goto(URL_APP);
    test.fail();
    await comprobarFaqPageUnico(page);
  });

  test('ABIERTO · en oscuro los rótulos de los ejes llegan a 4,5:1 (hoy #6b7280 sobre #1a1a1a, 3,60:1)', async ({ page }) => {
    await abrir(page);
    await activarTemaOscuro(page);
    await simular(page);
    const rotulo = eje(page, 'Población');
    await expect(rotulo).toBeVisible();
    await page.waitForFunction(() => {
      const svg = document.querySelector('main svg[role="img"]');
      return Boolean(svg) && svg!.getAnimations().length === 0;
    });
    const ratio = await rotulo.evaluate((t) => {
      const svg = t.closest('svg')!;
      const rgb = (s: string): number[] => (s.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
      const lum = (c: number[]): number => {
        const [r, g, b] = c.map((v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const a = lum(rgb(getComputedStyle(t).fill));
      const b = lum(rgb(getComputedStyle(svg).backgroundColor));
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    test.fail();
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
