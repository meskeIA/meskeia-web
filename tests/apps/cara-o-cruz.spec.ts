import { test, expect, type Page } from '@playwright/test';
import { jsonLd, faqJsonLd } from '../../app/cara-o-cruz/metadata';

/**
 * Cara o Cruz — test de regresión del Inspector (1.ª pasada, 08/11/2026).
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Cara o Cruz» · «Lanza una moneda virtual con animación realista. Incluye historial y
 *   estadísticas para visualizar la ley de grandes números».
 * · Pantalla: la moneda gira 1,5 s y cae en ¡CARA! o ¡CRUZ!; contadores de caras y cruces con su
 *   porcentaje, barra de distribución, «Total: N lanzamientos», racha actual, mejor racha de cada
 *   lado, los 20 últimos lanzamientos y «Reiniciar».
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS (a mano, antes de ejecutar la app)
 * ──────────────────────────────────────────────────────────────────────
 * · El motor es `Math.random() < 0.5 ? 'cara' : 'cruz'` (page.tsx). Con Math.random uniforme en
 *   [0, 1), P(cara) = P([0; 0,5)) = 1/2 exacto: basta comprobar que cada valor cae del lado
 *   debido, frontera incluida (0,49999999999999994 → cara; 0,5 → cruz).
 * · El azar se FIJA: `forzarMoneda` sustituye el valor de Math.random SOLO en la llamada que
 *   provoca el clic en «Lanzar Moneda» (se arma en la captura del clic sobre window y se desarma
 *   en su burbuja; React escucha en document, entre medias). Nada de lo demás de la página ve un
 *   Math.random distinto. Ningún caso puede salir rojo por mala suerte.
 * · El vuelo lo lleva `page.clock`: instalado antes de cargar y parado; cada lanzamiento son
 *   1.501 ms de `runFor` (el setTimeout de la app es de 1.500 ms).
 * · CASO 1: 0,2 0,4 0,6 0 0,49999 0,3 0,5 → C C X C C C X → caras 5 (5/7 = 71,43 % → 71,4),
 *   cruces 2 (28,57 % → 28,6), racha actual 1 cruz, mejor cara 3, mejor cruz 1; historial, de
 *   reciente a antiguo: cruz cara cara cara cruz cara cara.
 * · CASO 2: 12 caras y 13 cruces seguidas → 12/25 = 48,0 % · 13/25 = 52,0 % · racha actual 13
 *   cruz · mejor cara 12 · mejor cruz 13 · el historial enseña 20 fichas: 13 cruces y 7 caras.
 * · CASO 3 (rechazo): un doble clic, un clic con la moneda en el aire o dos Enter seguidos NO
 *   cuentan dos lanzamientos (el botón está deshabilitado durante el vuelo).
 * · Serie fija de 120 valores (mulberry32, semilla 20261108): los contadores, porcentajes y rachas
 *   se recalculan en el test desde la serie, sin mirar la app.
 *
 * Lo que la app da bien se comprueba con el separador libre antes del «%» (\s?), para que el
 * hallazgo del formato no tape la mecánica; el formato va en su propio test.
 *
 * HALLAZGOS 4230-4238 (08/11/2026), REPARADOS el mismo día, con su test al final: un doble clic (o dos
 * toques) en «Lanzar Moneda» con un resultado en pantalla pulsa «Reiniciar», que sube bajo el
 * puntero al desmontarse el resultado, y borra las estadísticas · «%» pegado a la cifra ·
 * «Total: 1 lanzamientos» · el resultado no se anuncia (sin región viva) · la racha actual dice el
 * lado solo con un emoji · `features` vacía · la FAQ del JSON-LD responde «Sí» a decisiones
 * importantes y la página dice «No» · el «dato curioso» de las 1.024 tiradas · «mejores de 3
 * anula la aleatoriedad».
 */

const RUTA = '/cara-o-cruz/';
const NBSP = ' ';

type VentanaMoneda = Window & { __colaMoneda: number[]; __llamadasArmadas: number };

/** Script de inicio: fija Math.random solo para la llamada del clic en «Lanzar Moneda». */
function forzarMoneda(): void {
  const original = Math.random.bind(Math);
  const w = window as unknown as VentanaMoneda;
  w.__colaMoneda = [];
  w.__llamadasArmadas = 0;
  let armado = false;
  window.addEventListener(
    'click',
    (e) => {
      const b = e.target instanceof Element ? e.target.closest('button') : null;
      if (b && /Lanzar Moneda/.test(b.textContent ?? '')) armado = true;
    },
    true,
  );
  window.addEventListener('click', () => {
    armado = false;
  });
  Math.random = function (): number {
    if (armado) {
      armado = false;
      w.__llamadasArmadas++;
      const v = w.__colaMoneda.shift();
      return v === undefined ? original() : v;
    }
    return original();
  };
  try {
    localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
  } catch {
    /* sin almacenamiento: saldrá el aviso */
  }
}

async function esperarBotonHidratado(page: Page): Promise<void> {
  // Sin inputs: el testigo es el fiber de React en el botón (cabecera de _hidratacion.ts: un clic
  // en cuanto el botón tiene fiber llega 6 de 6).
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll('button')].find((x) =>
        (x.textContent ?? '').includes('Lanzar Moneda'),
      );
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactFiber$')));
    },
    null,
    { timeout: 15000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(forzarMoneda);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Cara o Cruz');
  await esperarBotonHidratado(page);
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(ahora + 1000);
}

const botonLanzar = (page: Page) => page.getByRole('button', { name: /Lanzar Moneda/ });

async function encolar(page: Page, valores: number[]): Promise<void> {
  await page.evaluate((v) => {
    (window as unknown as VentanaMoneda).__colaMoneda.push(...v);
  }, valores);
}

/** Un lanzamiento completo: clic y 1.501 ms de reloj (el vuelo dura 1.500). */
async function lanzar(page: Page): Promise<void> {
  await botonLanzar(page).click();
  await page.clock.runFor(1501);
}

interface Lectura {
  valores: string[];
  porcentajes: string[];
  etiquetas: string[];
  rachas: string[];
  historial: (string | null)[];
  resultado: string[];
  vacio: boolean;
  reiniciar: boolean;
  /** Primer coeficiente de la matriz de la moneda: 1 enseña la cara, −1 la cruz (rotateY 180°). */
  m11: number | null;
  armadas: number;
}

async function leer(page: Page): Promise<Lectura> {
  return page.evaluate(() => {
    const q = (s: string) => [...document.querySelectorAll(s)].map((e) => (e.textContent ?? '').trim());
    // Lo que se VE: sin el texto .sr-only que nombra el lado para el lector de pantalla
    const qVisible = (s: string) =>
      [...document.querySelectorAll(s)].map((e) =>
        [...e.childNodes]
          .filter((n) => !(n instanceof Element && n.classList.contains('sr-only')))
          .map((n) => n.textContent ?? '')
          .join('')
          .trim(),
      );
    const moneda = [...document.querySelectorAll('[class]')].find((el) =>
      [...el.classList].some((c) => /(^|_)coin$/.test(c)),
    );
    let m11: number | null = null;
    if (moneda) {
      const t = getComputedStyle(moneda).transform;
      m11 = t === 'none' ? 1 : Number(t.replace(/^matrix(3d)?\(/, '').split(',')[0]);
    }
    return {
      valores: q('[class*="statValue"]'),
      porcentajes: q('[class*="statPercent"]'),
      etiquetas: q('[class*="distributionLabels"] span'),
      rachas: qVisible('[class*="rachaValue"]'),
      historial: [...document.querySelectorAll('[class*="historialItem"]')].map((e) => e.getAttribute('title')),
      resultado: q('[class*="resultadoTexto"]'),
      vacio: q('[class*="emptyStats"]').some((t) => t === 'Lanza la moneda para ver las estadísticas'),
      reiniciar: [...document.querySelectorAll('button')].some((b) => (b.textContent ?? '').trim() === 'Reiniciar'),
      m11,
      armadas: (window as unknown as { __llamadasArmadas: number }).__llamadasArmadas,
    };
  });
}

/** «71,4» con cualquier espacio (o ninguno) antes del «%»: la mecánica, no el formato. */
const pct = (cifra: string) => new RegExp(`^${cifra}\\s?%$`);

/** Generador fijo (mulberry32) para una serie «aleatoria» reproducible. */
function serieFija(semilla: number, n: number): number[] {
  let a = semilla >>> 0;
  const salida: number[] = [];
  for (let i = 0; i < n; i++) {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    salida.push(((t ^ (t >>> 14)) >>> 0) / 4294967296);
  }
  return salida;
}

test.describe('Cara o Cruz — escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · C C X C C C X → 5 caras (71,4) y 2 cruces (28,6), racha actual 1 cruz, mejores 3 y 1', async ({
    page,
  }) => {
    let r = await leer(page);
    expect(r.vacio).toBe(true);
    expect(r.reiniciar).toBe(false);

    await encolar(page, [0.2, 0.4, 0.6, 0, 0.49999, 0.3, 0.5]);
    await botonLanzar(page).click();
    // En el aire: botón deshabilitado y sin resultado hasta los 1.500 ms
    await expect(page.getByRole('button', { name: 'Lanzando...' })).toBeDisabled();
    await page.clock.runFor(1499);
    expect((await leer(page)).historial).toHaveLength(0);
    await page.clock.runFor(2);
    await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CARA!');
    r = await leer(page);
    expect(r.valores).toEqual(['1', '0']);
    expect(r.porcentajes[0]).toMatch(pct('100,0'));
    expect(r.porcentajes[1]).toMatch(pct('0,0'));
    expect(r.rachas).toEqual(['1 👑', '1 👑', '0 🦅']);
    expect(r.m11).toBeCloseTo(1, 3); // la moneda enseña la cara

    await lanzar(page); // 0,4 → cara
    await lanzar(page); // 0,6 → cruz
    await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CRUZ!');
    await expect.poll(async () => (await leer(page)).m11).toBeCloseTo(-1, 3); // girada 180°

    for (let i = 0; i < 4; i++) await lanzar(page); // 0 → cara, 0,49999 → cara, 0,3 → cara, 0,5 → cruz
    await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CRUZ!');
    r = await leer(page);
    expect(r.armadas).toBe(7);
    expect(r.valores).toEqual(['5', '2']);
    expect(r.porcentajes[0]).toMatch(pct('71,4'));
    expect(r.porcentajes[1]).toMatch(pct('28,6'));
    expect(r.etiquetas[1]).toBe('Total: 7 lanzamientos');
    expect(r.rachas).toEqual(['1 🦅', '3 👑', '1 🦅']);
    expect(r.historial).toEqual(['cruz', 'cara', 'cara', 'cara', 'cruz', 'cara', 'cara']);
  });

  test('CASO 2 (límite) · frontera de Math.random, 12 caras + 13 cruces y el historial capado a 20', async ({
    page,
  }) => {
    const caras = [0, 0.49999999999999994, 0.1, 0.2, 0.3, 0.4, 0.45, 0.01, 0.33, 0.25, 0.49, 0.05];
    const cruces = [0.5, 0.9999999999999999, 0.6, 0.7, 0.8, 0.9, 0.55, 0.99, 0.66, 0.75, 0.51, 0.95, 0.85];
    await encolar(page, [...caras, ...cruces]);
    for (let i = 1; i <= 25; i++) {
      await lanzar(page);
      if (i === 2) await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CARA!'); // 0,49999999999999994
      if (i === 13) await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CRUZ!'); // 0,5 exacto
      if (i === 14) await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CRUZ!'); // 0,9999999999999999
    }
    await expect(page.locator('[class*="distributionLabels"] span').nth(1)).toHaveText('Total: 25 lanzamientos');
    const r = await leer(page);
    expect(r.valores).toEqual(['12', '13']);
    expect(r.porcentajes[0]).toMatch(pct('48,0'));
    expect(r.porcentajes[1]).toMatch(pct('52,0'));
    expect(r.rachas).toEqual(['13 🦅', '12 👑', '13 🦅']);
    expect(r.historial).toEqual([...Array(13).fill('cruz'), ...Array(7).fill('cara')]);
  });

  test('CASO 2 bis (límite) · Reiniciar deja la app como recién cargada y el siguiente lanzamiento es el 1.º', async ({
    page,
  }) => {
    await encolar(page, [0.1, 0.2, 0.9, 0.7]);
    for (let i = 0; i < 3; i++) await lanzar(page);
    await expect(page.locator('[class*="distributionLabels"] span').nth(1)).toHaveText('Total: 3 lanzamientos');
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(page.locator('[class*="emptyStats"]')).toHaveText('Lanza la moneda para ver las estadísticas');
    let r = await leer(page);
    expect(r.reiniciar).toBe(false);
    expect(r.resultado).toEqual([]);
    expect(r.historial).toEqual([]);
    // La moneda vuelve a la cara: la transición de 0,1 s se lee hasta el valor final
    await expect.poll(async () => (await leer(page)).m11).toBeCloseTo(1, 3);

    await lanzar(page); // 0,7 → cruz
    await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CRUZ!');
    r = await leer(page);
    expect(r.valores).toEqual(['0', '1']);
    expect(r.rachas).toEqual(['1 🦅', '0 👑', '1 🦅']);
    expect(r.historial).toEqual(['cruz']);
  });

  test('CASO 3 (rechazo) · doble clic, clic en el aire y dos Enter seguidos cuentan UN lanzamiento cada uno', async ({
    page,
  }) => {
    await encolar(page, [0.1, 0.9, 0.1, 0.9, 0.1, 0.9]);
    const total = page.locator('[class*="distributionLabels"] span').nth(1);

    // Doble clic: el 2.º clic cae con el botón ya deshabilitado
    await botonLanzar(page).dblclick();
    await page.clock.runFor(1501);
    await expect(total).toHaveText(/^Total: 1 lanzamientos?$/);

    // Clic de ratón con la moneda en el aire (a los 500 ms) sobre el botón deshabilitado, medido
    // DURANTE el vuelo: al lanzar se desmonta el resultado anterior y el botón sube (ver el
    // hallazgo del doble clic que borra, al final), así que la caja de antes ya no es el botón.
    await botonLanzar(page).click();
    await page.clock.runFor(500);
    const enVuelo = page.getByRole('button', { name: 'Lanzando...' });
    await expect(enVuelo).toBeDisabled();
    const caja = await enVuelo.boundingBox();
    if (!caja) throw new Error('El botón «Lanzando...» no tiene caja');
    await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.clock.runFor(1001);
    await expect(total).toHaveText('Total: 2 lanzamientos');

    // Teclado: dos Enter seguidos → uno; el foco sigue en el botón y otro Enter lanza otra vez
    await botonLanzar(page).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.clock.runFor(1501);
    await expect(total).toHaveText('Total: 3 lanzamientos');
    await expect(botonLanzar(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await page.clock.runFor(1501);
    await expect(total).toHaveText('Total: 4 lanzamientos');

    const r = await leer(page);
    expect(r.armadas).toBe(4);
    expect(r.historial).toEqual(['cruz', 'cara', 'cruz', 'cara']);
  });

  test('serie fija de 120 valores · contadores, porcentajes, rachas e historial casan con la secuencia', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const valores = serieFija(20261108, 120);
    // Recuento independiente de la app
    const seq = valores.map((v) => (v < 0.5 ? 'cara' : 'cruz'));
    const caras = seq.filter((s) => s === 'cara').length;
    const cruces = seq.length - caras;
    let maxCara = 0;
    let maxCruz = 0;
    let c = 0;
    let x = 0;
    for (const s of seq) {
      if (s === 'cara') {
        c++;
        x = 0;
        maxCara = Math.max(maxCara, c);
      } else {
        x++;
        c = 0;
        maxCruz = Math.max(maxCruz, x);
      }
    }
    let actual = 1;
    for (let i = seq.length - 2; i >= 0 && seq[i] === seq[seq.length - 1]; i--) actual++;
    // Décimas redondeadas a la mitad hacia arriba, en enteros: sin coma flotante
    const decimas = (k: number) => Math.floor((2000 * k + seq.length) / (2 * seq.length));
    const comoTexto = (d: number) => `${Math.floor(d / 10)},${d % 10}`;
    const emoji = (s: string) => (s === 'cara' ? '👑' : '🦅');

    await encolar(page, valores);
    for (let i = 0; i < valores.length; i++) await lanzar(page);
    await expect(page.locator('[class*="distributionLabels"] span').nth(1)).toHaveText('Total: 120 lanzamientos');
    const r = await leer(page);
    expect(r.armadas).toBe(120);
    expect(r.valores).toEqual([String(caras), String(cruces)]);
    expect(r.porcentajes[0]).toMatch(pct(comoTexto(decimas(caras))));
    expect(r.porcentajes[1]).toMatch(pct(comoTexto(decimas(cruces))));
    expect(r.rachas).toEqual([
      `${actual} ${emoji(seq[seq.length - 1])}`,
      `${maxCara} 👑`,
      `${maxCruz} 🦅`,
    ]);
    expect(r.historial).toEqual(seq.slice(-20).reverse());
  });
});

test.describe('Cara o Cruz — móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('sin desborde horizontal y un doble toque cuenta un lanzamiento', async ({ page }) => {
    await abrir(page);
    const anchos = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(anchos.sw).toBeLessThanOrEqual(anchos.cw);

    await encolar(page, [0.2, 0.8]);
    await botonLanzar(page).scrollIntoViewIfNeeded();
    const caja = await botonLanzar(page).boundingBox();
    if (!caja) throw new Error('El botón «Lanzar Moneda» no tiene caja');
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.clock.runFor(1501);
    await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CARA!');
    const r = await leer(page);
    expect(r.armadas).toBe(1);
    expect(r.historial).toEqual(['cara']);
    const tras = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(tras).toBeLessThanOrEqual(0);
  });

  test('HALLAZGO 4230 (REPARADO) · dos toques seguidos en la parte baja de «Lanzar Moneda» no borran las estadísticas', async ({
    page,
  }) => {
    // Antes, con un resultado en pantalla, al lanzar se desmontaba el «¡CRUZ!» y el bloque
    // centrado subía ~27 px: «Reiniciar» quedaba bajo el dedo. Medido el 08/11/2026 (Pixel 7
    // emulado, 390 px): tras 4 lanzamientos, dos toques 8 px sobre el borde inferior del botón →
    // «Total: 1». Ahora el hueco del resultado está reservado y «Reiniciar» se deshabilita en vuelo.
    await abrir(page);
    await encolar(page, [0.1, 0.9, 0.1, 0.9, 0.1]);
    for (let i = 0; i < 4; i++) await lanzar(page);
    const total = page.locator('[class*="distributionLabels"] span').nth(1);
    await expect(total).toHaveText('Total: 4 lanzamientos');
    await botonLanzar(page).scrollIntoViewIfNeeded();
    const caja = await botonLanzar(page).boundingBox();
    if (!caja) throw new Error('El botón «Lanzar Moneda» no tiene caja');
    const x = caja.x + caja.width / 2;
    const y = caja.y + caja.height - 8;
    await page.touchscreen.tap(x, y);
    await page.touchscreen.tap(x, y);
    await page.clock.runFor(1501);
    await expect(page.locator('[class*="resultadoTexto"]')).toHaveText('¡CARA!');
    await expect(total).toHaveText('Total: 5 lanzamientos', { timeout: 1000 });
  });
});

test.describe('Cara o Cruz — referencias de probabilidad (sin navegador)', () => {
  test('(0,5)^10 = 1/1.024 ≈ 0,1 % · racha de ≥10 caras en 1.024 tiradas: 39,3 % · «mejor de 3» justa: 1/2', () => {
    expect(0.5 ** 10).toBe(1 / 1024);
    // Programación dinámica exacta: estado = longitud de la racha de caras en curso (0..9)
    const n = 1024;
    const k = 10;
    let dist = new Array<number>(k).fill(0);
    dist[0] = 1;
    for (let i = 0; i < n; i++) {
      const nueva = new Array<number>(k).fill(0);
      for (let r = 0; r < k; r++) {
        nueva[0] += dist[r] * 0.5;
        if (r + 1 < k) nueva[r + 1] += dist[r] * 0.5;
      }
      dist = nueva;
    }
    const pAlMenosUna = 1 - dist.reduce((a, b) => a + b, 0);
    expect(pAlMenosUna).toBeCloseTo(0.3926, 3);
    // Rachas maximales esperadas de ≥10 caras: 1/2¹⁰ + (n − 10)/2¹¹ = 0,496
    expect(1 / 2 ** 10 + (n - 10) / 2 ** 11).toBeCloseTo(0.496, 3);
    // ≥10 iguales seguidos (caras o cruces) en 1.024 tiradas: equivale a ≥9 «igual que el
    // anterior» seguidos en las 1.023 transiciones, que son lanzamientos justos independientes
    let dist2 = new Array<number>(9).fill(0);
    dist2[0] = 1;
    for (let i = 0; i < n - 1; i++) {
      const nueva = new Array<number>(9).fill(0);
      for (let r = 0; r < 9; r++) {
        nueva[0] += dist2[r] * 0.5;
        if (r + 1 < 9) nueva[r + 1] += dist2[r] * 0.5;
      }
      dist2 = nueva;
    }
    expect(1 - dist2.reduce((a, b) => a + b, 0)).toBeCloseTo(0.6327, 3);
    // Mejor de 3 con p = 1/2: p² + 2p²(1 − p) = 1/2
    const p = 0.5;
    expect(p * p + 2 * p * p * (1 - p)).toBe(0.5);
  });
});

test.describe('Cara o Cruz — hallazgos del 08/11/2026 (reparados)', () => {
  test('HALLAZGO 4230 (REPARADO) · un doble clic en «Lanzar Moneda» con resultados previos no borra las estadísticas', async ({
    page,
  }) => {
    // Antes, al lanzar se desmontaba el «¡CRUZ!» anterior y el bloque centrado subía (33-73 px
    // según el alto de la ventana): «Reiniciar» quedaba bajo el puntero y el 2.º clic del doble
    // clic lo pulsaba; el lanzamiento en vuelo caía después y pasaba a ser el 1.º de la serie.
    // Medido el 08/11/2026 tras 4 lanzamientos: a 1280×720 el doble clic en el CENTRO del botón
    // dejaba «Total: 1»; a 1280×900, el que caía 8 px sobre su borde inferior. Esperado: N + 1.
    await abrir(page);
    await encolar(page, Array.from({ length: 12 }, (_, i) => (i % 2 ? 0.9 : 0.1)));
    const total = page.locator('[class*="distributionLabels"] span').nth(1);
    const leerTotal = async () => Number(((await total.textContent()) ?? '').match(/\d+/)?.[0] ?? 0);
    const obtenido: string[] = [];
    const esperado: string[] = [];
    for (const fraccion of [0.5, 0.85]) {
      for (let i = 0; i < 4; i++) await lanzar(page);
      const antes = await leerTotal();
      const caja = await botonLanzar(page).boundingBox();
      if (!caja) throw new Error('El botón «Lanzar Moneda» no tiene caja');
      await botonLanzar(page).dblclick({ position: { x: caja.width / 2, y: caja.height * fraccion } });
      await page.clock.runFor(1501);
      await expect(page.locator('[class*="resultadoTexto"]')).toHaveCount(1);
      obtenido.push(`${fraccion}: ${antes} → ${await leerTotal()}`);
      esperado.push(`${fraccion}: ${antes} → ${antes + 1}`);
    }
    expect(obtenido).toEqual(esperado);
  });

  test('HALLAZGO 4230 (REPARADO) · el «Lanzar Moneda» no se mueve durante el vuelo y «Reiniciar» no se puede pulsar en él', async ({
    page,
  }) => {
    await abrir(page);
    await encolar(page, [0.1, 0.9, 0.2]);
    for (let i = 0; i < 2; i++) await lanzar(page);
    // Puntero fuera: el :hover sube el botón 3 px y no es lo que se mide
    await page.mouse.move(0, 0);
    const antes = await botonLanzar(page).boundingBox();
    await botonLanzar(page).click();
    await page.clock.runFor(300);
    const enVuelo = await page.getByRole('button', { name: 'Lanzando...' }).boundingBox();
    if (!antes || !enVuelo) throw new Error('Sin caja del botón');
    expect(Math.abs(enVuelo.y - antes.y)).toBeLessThanOrEqual(1);
    await expect(page.getByRole('button', { name: 'Reiniciar' })).toBeDisabled();
    await page.clock.runFor(1201);
    await expect(page.getByRole('button', { name: 'Reiniciar' })).toBeEnabled();
    await expect(page.locator('[class*="distributionLabels"] span').nth(1)).toHaveText('Total: 3 lanzamientos');
  });

  test('HALLAZGO 4233 (REPARADO) · el «%» va separado de la cifra con espacio duro: «100,0 %»', async ({ page }) => {
    // CLAUDE.md global §2 (decidido el 25/09/2026): «15 %» con U+00A0. Antes «100,0%» en las dos
    // tarjetas y en la leyenda de la barra; también el bloque educativo y el JSON-LD.
    await abrir(page);
    await encolar(page, [0.2]);
    await lanzar(page);
    await expect(page.locator('[class*="statPercent"]').first()).toHaveText(`100,0${NBSP}%`);
    await expect(page.locator('[class*="distributionLabels"] span').first()).toHaveText(`Cara 100,0${NBSP}%`);
    // Ningún «%» pegado a una cifra en el texto de la página ni en el JSON-LD
    // (solo la app: las tarjetas de relacionadas y el pie no son suyos)
    const texto = (
      await page.locator('[class*="mainContent"], [class*="guideSection"]').allTextContents()
    ).join(' ');
    expect(texto).not.toMatch(/\d%/);
    expect(texto).not.toMatch(/\d %/); // espacio normal: el «%» saltaría solo de línea
    expect(JSON.stringify(faqJsonLd)).not.toMatch(/\d%/);
  });

  test('HALLAZGO 4234 (REPARADO) · con un lanzamiento la leyenda dice «Total: 1 lanzamiento», en singular', async ({ page }) => {
    // Antes «Total: 1 lanzamientos». El rótulo es una sola cadena (sin texto que aparezca junto a
    // hermanos: check:ternario-traducido).
    await abrir(page);
    await encolar(page, [0.9, 0.1]);
    await lanzar(page);
    await expect(page.locator('[class*="distributionLabels"] span').nth(1)).toHaveText('Total: 1 lanzamiento');
    await lanzar(page);
    await expect(page.locator('[class*="distributionLabels"] span').nth(1)).toHaveText('Total: 2 lanzamientos');
  });

  test('HALLAZGO 4231 (REPARADO) · el resultado se anuncia en una región viva que existe desde la carga', async ({ page }) => {
    // Antes no había ningún aria-live ni role="status" en la app: el «¡CARA!» se montaba en un
    // <div> condicional y el lector de pantalla no decía nada tras pulsar «Lanzar Moneda». (El
    // anunciador de rutas de Next vive en un shadow root: querySelectorAll no lo ve.) Y las dos
    // caras de la moneda se leían a la vez: ahora la moneda es aria-hidden.
    await abrir(page);
    const vivasAlCargar = await page.evaluate(
      () => document.querySelectorAll('[aria-live="polite"], [aria-live="assertive"], [role="status"]').length,
    );
    expect(vivasAlCargar).toBeGreaterThan(0);
    await encolar(page, [0.2]);
    await lanzar(page);
    const anunciado = await page.evaluate(() =>
      [...document.querySelectorAll('[aria-live="polite"], [aria-live="assertive"], [role="status"]')].some((e) =>
        /cara/i.test(e.textContent ?? ''),
      ),
    );
    expect(anunciado).toBe(true);
    const zonaMoneda = await page.locator('[class*="coinArea"]').ariaSnapshot();
    expect(zonaMoneda).not.toMatch(/CARA[\s\S]*CRUZ/);
  });

  test('HALLAZGO 4232 (REPARADO) · la racha actual dice en texto de qué lado es, no solo con un emoji', async ({ page }) => {
    // Antes el árbol accesible era «Racha actual 3 🦅»: el lado solo lo decía el emoji (y las
    // fichas del historial eran «🦅 🦅 🦅»).
    await abrir(page);
    await encolar(page, [0.9, 0.9, 0.9]);
    for (let i = 0; i < 3; i++) await lanzar(page);
    const arbol = await page.locator('[class*="rachaItem"]').first().ariaSnapshot();
    expect(arbol).toMatch(/3 cruces/i);
    const historial = await page.locator('[class*="historialGrid"]').ariaSnapshot();
    expect(historial).toMatch(/cruz[\s\S]*cruz[\s\S]*cruz/);
    expect(historial).not.toContain('🦅');
  });

  test('HALLAZGO 4235 (REPARADO) · el JSON-LD declara al menos 4 características (features)', () => {
    // §1.ter del CLAUDE.md de meskeia-web: 4-8 características reales. Antes `features: []`.
    const lista = jsonLd.featureList as string[];
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.length).toBeLessThanOrEqual(8);
  });

  test('HALLAZGO 4236 (REPARADO) · la FAQ del JSON-LD no responde «Sí» a usarla para decisiones importantes', () => {
    // La página dice «No para decisiones importantes» y lo pone entre los «Errores comunes».
    const p = faqJsonLd.mainEntity.find((q) => q.name.includes('decisiones importantes'));
    expect(p).toBeDefined();
    // Sin \b: en una RegExp sin /u la «í» no es carácter de palabra y «Sí,» no tendría frontera
    expect(p?.acceptedAnswer.text).not.toMatch(/^Sí[\s,.]/);
  });

  test('HALLAZGO 4237 (REPARADO) · el «dato curioso» no dice que en 1.024 tiradas es esperable una racha de 10 caras', async ({
    page,
  }) => {
    // P(al menos una racha de ≥10 caras en 1.024 tiradas) = 39,3 % y se esperan 0,50 rachas
    // (test de referencias, arriba). Lo que vale ≈ 1 es el número de VENTANAS solapadas.
    await abrir(page);
    const texto = ((await page.locator('[class*="faqTip"]').first().textContent()) ?? '').replace(/\s+/g, ' ');
    expect(texto).not.toContain('es estadísticamente esperable que una vez salga cara 10 seguidas');
    expect(texto).toContain('39 %');
    expect(texto).toContain('63 %');
  });

  test('HALLAZGO 4238 (REPARADO) · la guía no dice que un «mejor de 3» anula la aleatoriedad', async ({ page }) => {
    // Acordado ANTES de lanzar, un mejor de 3 con moneda justa da 1/2 a cada lado (referencias,
    // arriba). Lo que rompe el método es proponerlo DESPUÉS de ver el resultado.
    await abrir(page);
    const texto = (await page.locator('[class*="stepGuide"]').textContent()) ?? '';
    expect(texto).not.toContain('anula la aleatoriedad');
  });
});

/**
 * Cabo C0679 (comprobado el 09/11/2026): las dos afirmaciones que la 1.ª inspección dejó sin anclar.
 *
 * (a) FAQ visible, «¿Las monedas físicas son perfectamente equitativas?»: «Estudios de la Universidad
 *     de Stanford demuestran que las monedas físicas pueden caer con un ligero sesgo hacia el lado que
 *     estaba boca arriba […] (sesgo de Diaconis, ~51/49)». Lo comprobable sin la fuente es el texto:
 *     el verbo «demuestran» (regla 3 de neutralidad editorial, §1.quinquies del CLAUDE.md de
 *     meskeia-web: «propuso», «identificó») y la atribución a una institución en vez de a un trabajo
 *     con autores y año. La cifra ~51/49 NO se ancla: la red de fuentes no tiene ninguna académica, y
 *     el criterio del usuario (cabo C0203) es matizarla o retirarla, no corregirla de memoria. El test
 *     no exige nada sobre la cifra: la redacción nueva es decisión del usuario (nivel 3).
 *
 * (b) JSON-LD (faqJsonLd, 5.ª pregunta): «Una moneda virtual es matemáticamente perfecta en su
 *     aleatoriedad». El motor es `Math.random() < 0.5` (page.tsx, una llamada por lanzamiento, ningún
 *     crypto.getRandomValues): un generador pseudoaleatorio del navegador. Con Math.random sustituido
 *     por mulberry32 de semilla fija (679), dos cargas independientes dan la MISMA serie, la que dicta
 *     la semilla calculada aquí sin mirar la app: el resultado es determinista dada la semilla. La
 *     frase no está en el title, la description, la FAQ visible ni en ninguna guía (no hay guía con
 *     esta app); solo en el JSON-LD, que no se ve en la página.
 */
type VentanaSembrada = Window & { __llamadasRandom: number; __llamadasCrypto: number };

/** Script de inicio del cabo C0679: Math.random ENTERO sustituido por mulberry32 con semilla fija. */
function sembrarMathRandom(semilla: number): void {
  let a = semilla >>> 0;
  const w = window as unknown as VentanaSembrada;
  w.__llamadasRandom = 0;
  w.__llamadasCrypto = 0;
  Math.random = function (): number {
    w.__llamadasRandom++;
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const original = crypto.getRandomValues.bind(crypto) as unknown as (x: ArrayBufferView) => ArrayBufferView;
  (crypto as unknown as { getRandomValues: (x: ArrayBufferView) => ArrayBufferView }).getRandomValues = (x) => {
    w.__llamadasCrypto++;
    return original(x);
  };
  try {
    localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
  } catch {
    /* sin almacenamiento: saldrá el aviso */
  }
}

test.describe('Cabo C0679 — «demuestran» de Stanford y la moneda «matemáticamente perfecta»', () => {
  test('(b) el motor es Math.random: con semilla fija dos cargas dan la misma serie, la que dicta la semilla, sin crypto.getRandomValues', async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const N = 10;
    // Esperado, antes de mirar la app: la serie de la semilla 679 (cara si < 0,5). Las llamadas que
    // el resto de la página haga a Math.random antes del 1.er clic la desplazan: se miden.
    const dictada = serieFija(679, 200).map((v) => (v < 0.5 ? 'cara' : 'cruz'));
    const series: string[][] = [];
    for (let carga = 0; carga < 2; carga++) {
      const ctx = await browser.newContext({ baseURL: test.info().project.use.baseURL });
      const page = await ctx.newPage();
      await page.addInitScript(sembrarMathRandom, 679);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.clock.install();
      await page.goto(RUTA);
      await expect(page.locator('h1')).toHaveText('Cara o Cruz');
      await esperarBotonHidratado(page);
      const ahora = await page.evaluate(() => Date.now());
      await page.clock.pauseAt(ahora + 1000);
      const previas = await page.evaluate(() => (window as unknown as VentanaSembrada).__llamadasRandom);
      const resultados: string[] = [];
      for (let i = 0; i < N; i++) {
        const antes = await page.evaluate(() => (window as unknown as VentanaSembrada).__llamadasRandom);
        await lanzar(page);
        const despues = await page.evaluate(() => (window as unknown as VentanaSembrada).__llamadasRandom);
        expect(despues - antes).toBe(1); // una sola llamada a Math.random por lanzamiento
        const t = (await page.locator('[class*="resultadoTexto"]').textContent()) ?? '';
        resultados.push(t === '¡CARA!' ? 'cara' : t === '¡CRUZ!' ? 'cruz' : `?${t}`);
      }
      expect(await page.evaluate(() => (window as unknown as VentanaSembrada).__llamadasCrypto)).toBe(0);
      expect(resultados).toEqual(dictada.slice(previas, previas + N));
      series.push(resultados);
      await ctx.close();
    }
    expect(series[1]).toEqual(series[0]);
  });

  test('HALLAZGO (ABIERTO) · (b) el JSON-LD no llama «matemáticamente perfecta en su aleatoriedad» a una moneda que tira de Math.random', () => {
    // ABIERTO (cabo C0679, 09/11/2026). Tipo promesa: el texto promete más de lo que hace la app,
    // que es un generador pseudoaleatorio (test anterior). La 2.ª pregunta del mismo JSON-LD los llama
    // ya «pseudoaleatorios» y aun así responde «Sí» a «¿Es realmente aleatorio…?». Redactarlo, del usuario.
    test.fail();
    const quinta = faqJsonLd.mainEntity.find((q) => q.name.includes('física y una virtual'));
    expect(quinta).toBeDefined();
    expect(quinta?.acceptedAnswer.text).not.toContain('matemáticamente perfecta');
  });

  test('HALLAZGO (ABIERTO) · (a) la FAQ visible no da el sesgo de Diaconis por «demostrado» por «Estudios de la Universidad de Stanford»', async ({
    page,
  }) => {
    // ABIERTO (cabo C0679, 09/11/2026). Regla 3 de §1.quinquies: «demostró» para un resultado sin
    // trabajo citado → «propuso», «estimó». Se juzga solo lo que está en el texto: el verbo y la
    // atribución a una institución sin autores ni año. La cifra ~51/49 queda a decisión del usuario
    // (matizarla o retirarla, cabo C0203): este test no la mira.
    test.fail();
    await abrir(page);
    const item = page.locator('[class*="faqItem"]').filter({ hasText: '¿Las monedas físicas son perfectamente equitativas?' });
    await expect(item).toHaveCount(1);
    const texto = ((await item.textContent()) ?? '').replace(/\s+/g, ' ');
    expect(texto).not.toMatch(/\bdemuestra|\bdemostr/i);
    expect(texto).not.toContain('Estudios de la Universidad de Stanford');
  });
});

/*
 * Cabo C0716 (12/11/2026). El CASO 3 («…el foco sigue en el botón y otro Enter lanza otra vez»)
 * salía rojo 1 de cada 6 veces. No era el test: con reloj REAL, tras lanzar con Enter el foco cae
 * a <body> las 5 veces de 5 (el botón se deshabilita en el vuelo y Chrome le quita el foco); con
 * page.clock el salto de 1.501 ms a veces llegaba antes de que Chrome lo retirara y el caso
 * pasaba. La app devuelve ahora el foco al botón al aterrizar si lo tenía al lanzar. Aquí, con el
 * reloj de verdad y sin forzar la moneda. Control: sin la devolución, el foco está en BODY.
 */
test.describe('Cabo C0716 — el foco vuelve a «Lanzar Moneda» al aterrizar (reloj real)', () => {
  test('tres lanzamientos con Enter seguidos, sin volver a enfocar: el foco sigue en el botón', async ({ page }) => {
    test.setTimeout(30_000);
    await page.goto(RUTA);
    await esperarBotonHidratado(page);
    await botonLanzar(page).focus();
    for (let i = 1; i <= 3; i++) {
      await page.keyboard.press('Enter');
      await expect(page.getByRole('button', { name: 'Lanzando...' })).toBeDisabled();
      await expect(botonLanzar(page), `lanzamiento ${i}: al aterrizar, el foco vuelve al botón`).toBeFocused({ timeout: 4000 });
    }
    await expect(page.locator('[class*="distributionLabels"] span').nth(1)).toHaveText('Total: 3 lanzamientos');
  });
});
