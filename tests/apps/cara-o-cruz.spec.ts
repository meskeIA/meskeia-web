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
 * HALLAZGOS ABIERTOS (08/11/2026), con test.fail() al final del fichero: un doble clic (o dos
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
      rachas: q('[class*="rachaValue"]'),
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

  test('HALLAZGO (ABIERTO) · dos toques seguidos en la parte baja de «Lanzar Moneda» no borran las estadísticas', async ({
    page,
  }) => {
    // Con un resultado en pantalla, al lanzar se desmonta el «¡CRUZ!» y el bloque centrado sube
    // ~27 px: «Reiniciar» queda bajo el dedo. Medido el 08/11/2026 (Pixel 7 emulado, 390 px):
    // tras 4 lanzamientos, dos toques 8 px sobre el borde inferior del botón → «Total: 1».
    test.fail();
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
    // Mejor de 3 con p = 1/2: p² + 2p²(1 − p) = 1/2
    const p = 0.5;
    expect(p * p + 2 * p * p * (1 - p)).toBe(0.5);
  });
});

test.describe('Cara o Cruz — hallazgos abiertos (08/11/2026)', () => {
  test('HALLAZGO (ABIERTO) · un doble clic en «Lanzar Moneda» con resultados previos no borra las estadísticas', async ({
    page,
  }) => {
    // Al lanzar se desmonta el «¡CRUZ!» anterior y el bloque centrado sube (33-73 px según el
    // alto de la ventana): «Reiniciar» queda bajo el puntero y el 2.º clic del doble clic lo
    // pulsa; el lanzamiento en vuelo cae después y pasa a ser el 1.º de la serie. Medido el
    // 08/11/2026 tras 4 lanzamientos: a 1280×720 el doble clic en el CENTRO del botón deja
    // «Total: 1»; a 1280×900, el que cae 8 px sobre su borde inferior. Esperado: N + 1.
    test.fail();
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

  test('HALLAZGO (ABIERTO) · el «%» va separado de la cifra con espacio duro: «100,0 %»', async ({ page }) => {
    // CLAUDE.md global §2 (decidido el 25/09/2026): «15 %» con U+00A0. Hoy «100,0%» en las dos
    // tarjetas y en la leyenda de la barra.
    test.fail();
    await abrir(page);
    await encolar(page, [0.2]);
    await lanzar(page);
    await expect(page.locator('[class*="statPercent"]').first()).toHaveText(`100,0${NBSP}%`);
    await expect(page.locator('[class*="distributionLabels"] span').first()).toHaveText(`Cara 100,0${NBSP}%`);
  });

  test('HALLAZGO (ABIERTO) · con un lanzamiento la leyenda dice «Total: 1 lanzamiento», en singular', async ({ page }) => {
    // Hoy «Total: 1 lanzamientos». Al repararlo: la palabra que alterna, en un <span> siempre
    // montado (check:ternario-traducido).
    test.fail();
    await abrir(page);
    await encolar(page, [0.9]);
    await lanzar(page);
    await expect(page.locator('[class*="distributionLabels"] span').nth(1)).toHaveText('Total: 1 lanzamiento');
  });

  test('HALLAZGO (ABIERTO) · el resultado se anuncia en una región viva que existe desde la carga', async ({ page }) => {
    // Hoy no hay ningún aria-live ni role="status" en la app: el «¡CARA!» se monta en un <div>
    // condicional y el lector de pantalla no dice nada tras pulsar «Lanzar Moneda». (El
    // anunciador de rutas de Next vive en un shadow root: querySelectorAll no lo ve.)
    test.fail();
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
  });

  test('HALLAZGO (ABIERTO) · la racha actual dice en texto de qué lado es, no solo con un emoji', async ({ page }) => {
    // Hoy el árbol accesible es «Racha actual 3 🦅»: el lado solo lo dice el emoji (y las
    // fichas del historial son «🦅 🦅 🦅»).
    test.fail();
    await abrir(page);
    await encolar(page, [0.9, 0.9, 0.9]);
    for (let i = 0; i < 3; i++) await lanzar(page);
    const arbol = await page.locator('[class*="rachaItem"]').first().ariaSnapshot();
    expect(arbol).toMatch(/cruz/i);
  });

  test('HALLAZGO (ABIERTO) · el JSON-LD declara al menos 4 características (features)', () => {
    // §1.ter del CLAUDE.md de meskeia-web: 4-8 características reales. Hoy `features: []`.
    test.fail();
    expect((jsonLd.featureList as string[]).length).toBeGreaterThanOrEqual(4);
  });

  test('HALLAZGO (ABIERTO) · la FAQ del JSON-LD no responde «Sí» a usarla para decisiones importantes', () => {
    // La página dice «No para decisiones importantes» y lo pone entre los «Errores comunes».
    test.fail();
    const p = faqJsonLd.mainEntity.find((q) => q.name.includes('decisiones importantes'));
    expect(p).toBeDefined();
    // Sin \b: en una RegExp sin /u la «í» no es carácter de palabra y «Sí,» no tendría frontera
    expect(p?.acceptedAnswer.text).not.toMatch(/^Sí[\s,.]/);
  });

  test('HALLAZGO (ABIERTO) · el «dato curioso» no dice que en 1.024 tiradas es esperable una racha de 10 caras', async ({
    page,
  }) => {
    // P(al menos una racha de ≥10 caras en 1.024 tiradas) = 39,3 % y se esperan 0,50 rachas
    // (test de referencias, arriba). Lo que vale ≈ 1 es el número de VENTANAS solapadas.
    test.fail();
    await abrir(page);
    const texto = (await page.locator('[class*="faqTip"]').first().textContent()) ?? '';
    expect(texto).not.toContain('es estadísticamente esperable que una vez salga cara 10 seguidas');
  });

  test('HALLAZGO (ABIERTO) · la guía no dice que un «mejor de 3» anula la aleatoriedad', async ({ page }) => {
    // Acordado ANTES de lanzar, un mejor de 3 con moneda justa da 1/2 a cada lado (referencias,
    // arriba). Lo que rompe el método es proponerlo DESPUÉS de ver el resultado.
    test.fail();
    await abrir(page);
    const texto = (await page.locator('[class*="stepGuide"]').textContent()) ?? '';
    expect(texto).not.toContain('anula la aleatoriedad');
  });
});
