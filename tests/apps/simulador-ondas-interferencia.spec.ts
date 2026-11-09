import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * simulador-ondas-interferencia — Inspector, primera inspección (09/11/2026).
 *
 * Tres pestañas: onda viajera (λ = v/f, T = 1/f, k = 2π/λ, ω = 2π·f), interferencia de dos
 * fuentes (mapa del desplazamiento instantáneo: rojo = cresta, azul = valle, blanco = 0) y ondas
 * estacionarias (f₁ = v/2L en cuerda fija-fija y tubo abierto-abierto, f = (2n−1)·v/4L en cuerda
 * fija-libre y tubo abierto-cerrado). Todos los esperados están resueltos a mano con esas
 * fórmulas, que son las de la propia guía de la app, ANTES de ejecutarla. Los deslizadores
 * tienen min/max, así que el caso «a rechazar» es que un valor fuera de rango (f = 0, f < 0,
 * L = 0, v enorme) se acote y no produzca ∞ ni NaN.
 *
 * Lo que da bien (verde): λ, T, k, ω; f₁, f del modo, λ y los cinco armónicos en las cuatro
 * fronteras; la posición de nodos y antinodos; en el mapa, el eje central es máximo con Δφ = 0 y
 * línea nodal (blanca) con Δφ = π, y con d = 0 y Δφ = π se anula todo.
 *
 * HALLAZGOS ABIERTOS (test.fail, el test describe lo correcto):
 *   H1 (medio)  · Cada nodo interior se dibuja DOS veces y la numeración se infla: cuerda
 *                 fija-fija modo 3 → N1…N6 (son 4 = n+1, como dice la guía); modo 5 → N1…N10 (6).
 *   H2 (medio)  · La leyenda dice «constructiva (rojo) y destructiva (azul)»; el mapa pinta el
 *                 desplazamiento: el eje de máximo sale azul en el valle y lo destructivo es blanco.
 *   H3 (medio)  · Tubo abierto-cerrado: el rótulo «cerrado» va en el extremo ABIERTO (x = 30, sobre
 *                 el antinodo A1); el tapón y el nodo están en x = 770.
 *   H4 (medio)  · La región viva (role=status, aria-atomic) incluye «Tiempo simulado» y cambia
 *                 ~60 veces por segundo sin tocar nada: un lector de pantalla no calla.
 *   H5 (medio)  · Oscuro: nodos y rótulos N en #111827 sobre #1a1a1a (1,02:1), invisibles; A, λ y
 *                 «cerrado» por debajo de 4,5:1. Claro: «2A» en teal sobre #fafafa, 2,68:1.
 *   H6 (bajo)   · Pestañas sin aria-pressed ni role=tab/aria-selected; lienzo con aria-label sin
 *                 role=img; emojis de «Mejores prácticas» sin aria-hidden.
 *   H7 (bajo)   · Con A = 2 la onda viajera se sale del viewBox (y de −30 a 250 en 0-220) y se corta.
 *   H8 (medio)  · El mapa de interferencia deforma las distancias: 12 m × 8 m en un lienzo 5:3
 *                 (escritorio, 11 %) que en móvil se estira a 308 × 360 px (×1,75 en vertical).
 *   H9 (bajo)   · Móvil 390 px: los rótulos del SVG (λ, N, A) quedan a 5-6 px de alto.
 *   H10 (bajo)  · FAQ escrita dos veces: el FAQPage y la FAQ visible preguntan lo mismo con
 *                 respuestas distintas (viajera/estacionaria, doble rendija).
 *   H11 (bajo)  · El JSON-LD promete «Patrones predefinidos: doble rendija» y no hay tal preset.
 */

const RUTA = '/simulador-ondas-interferencia/';
const SVG_VIAJERA = 'svg[aria-label="Onda viajera en el espacio"]';
const SVG_ESTACIONARIA = 'svg[aria-label="Onda estacionaria"]';
const LIENZO = 'canvas[aria-label="Mapa 2D de interferencia"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#ov-a', '#ov-f', '#ov-v']);
}

async function pestana(page: Page, nombre: string, testigo: string): Promise<void> {
  await page.getByRole('button', { name: nombre, exact: true }).click();
  await esperarHidratacion(page, [testigo]);
}

/** El valor de una fila de resultados, por su rótulo exacto. */
function valor(page: Page, rotulo: string): Locator {
  return page
    .locator('[role="status"]')
    .getByText(rotulo, { exact: true })
    .locator('xpath=following-sibling::span[1]');
}

async function armonicos(page: Page): Promise<string[]> {
  return page
    .locator('[role="status"] strong')
    .filter({ hasText: /^n = \d+$/ })
    .evaluateAll((els) =>
      els.map((e) =>
        (e.parentElement as HTMLElement).innerText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
          .join(' · '),
      ),
    );
}

/** cx de los círculos de nodo y x de los rótulos A# del SVG de estacionarias. */
async function marcas(page: Page): Promise<{ nodos: number[]; antinodos: number[]; rotulosN: string[] }> {
  return page.locator(SVG_ESTACIONARIA).evaluate((svg) => ({
    nodos: Array.from(svg.querySelectorAll('circle')).map((c) => Number(c.getAttribute('cx'))),
    antinodos: Array.from(svg.querySelectorAll('text'))
      .filter((t) => /^A\d+$/.test(t.textContent ?? ''))
      .map((t) => Number(t.getAttribute('x'))),
    rotulosN: Array.from(svg.querySelectorAll('text'))
      .map((t) => t.textContent ?? '')
      .filter((t) => /^N\d+$/.test(t)),
  }));
}

/** Posiciones distintas (las que distan menos de 3 unidades del viewBox cuentan como una). */
function distintas(xs: number[]): number[] {
  const orden = [...xs].sort((a, b) => a - b);
  const fuera: number[] = [];
  for (const x of orden) if (!fuera.length || x - fuera[fuera.length - 1] > 3) fuera.push(x);
  return fuera;
}

async function pixel(page: Page, x: number, y: number): Promise<number[]> {
  return page.locator(LIENZO).evaluate(
    (c, [px, py]) => {
      const ctx = (c as HTMLCanvasElement).getContext('2d');
      if (!ctx) return [-1, -1, -1];
      const d = ctx.getImageData(px, py, 1, 1).data;
      return [d[0], d[1], d[2]];
    },
    [x, y] as [number, number],
  );
}

function casi(obtenido: number[], esperado: number[], tolerancia = 2): boolean {
  return obtenido.every((v, i) => Math.abs(v - esperado[i]) <= tolerancia);
}

/** Contraste WCAG entre el fill (hex) de cada marca y el fondo pintado del SVG. */
async function contrastesSvg(page: Page, selector: string): Promise<Record<string, number>> {
  return page.locator(selector).evaluate((svg) => {
    const hex = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const rgb = (c: string): number[] => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = ([r, g, b]: number[]): number => {
      const f = (c: number): number => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a: number[], b: number[]): number => {
      const x = lum(a);
      const y = lum(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const fondo = rgb(getComputedStyle(svg).backgroundColor);
    const res: Record<string, number> = {};
    for (const t of Array.from(svg.querySelectorAll('text'))) {
      const fill = t.getAttribute('fill') ?? '';
      if (!fill.startsWith('#')) continue;
      const clave = `texto «${(t.textContent ?? '').replace(/\d+$/, '#')}» ${fill}`;
      if (!(clave in res)) res[clave] = ratio(hex(fill), fondo);
    }
    const c = svg.querySelector('circle');
    const fillC = c?.getAttribute('fill') ?? '';
    if (fillC.startsWith('#')) res[`círculo de nodo ${fillC}`] = ratio(hex(fillC), fondo);
    return res;
  });
}

/**
 * Con d = 0, Δφ = 0 y t = 0 el campo es 2A·sin(k·r)/√r alrededor de la fuente: anillos. Mide, en
 * píxeles de PANTALLA, la distancia de la fuente al SEGUNDO anillo blanco (r = λ) hacia la
 * derecha y hacia arriba. En un mapa sin deformar las dos son iguales.
 */
async function anilloHorizontalEntreVertical(page: Page): Promise<number> {
  return page.locator(LIENZO).evaluate((c) => {
    const lienzo = c as HTMLCanvasElement;
    const ctx = lienzo.getContext('2d');
    if (!ctx) return Number.NaN;
    const W = lienzo.width;
    const H = lienzo.height;
    const datos = ctx.getImageData(0, 0, W, H).data;
    const en = (x: number, y: number): number[] => {
      const i = (y * W + x) * 4;
      return [datos[i], datos[i + 1], datos[i + 2]];
    };
    // Centro del marcador de la fuente (#2563eb: g − r ≈ 62; el valle del campo tiene r = g)
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const [r, g, b] = en(x, y);
        if (b >= 200 && g - r >= 40) {
          sx += x;
          sy += y;
          n++;
        }
      }
    if (!n) return Number.NaN;
    const cx = Math.round(sx / n);
    const cy = Math.round(sy / n);
    const segundoBlanco = (paso: (k: number) => number[] | null): number => {
      const blancura: number[] = [];
      for (let k = 0; ; k++) {
        const p = paso(k);
        if (!p) break;
        blancura.push(Math.min(...p));
      }
      const maximos: number[] = [];
      for (let k = 9; k < blancura.length - 1; k++) {
        if (blancura[k] >= 235 && blancura[k] >= blancura[k - 1] && blancura[k] > blancura[k + 1]) {
          if (!maximos.length || k - maximos[maximos.length - 1] > 5) maximos.push(k);
        }
      }
      return maximos.length >= 2 ? maximos[1] : Number.NaN;
    };
    const dx = segundoBlanco((k) => (cx + k < W ? en(cx + k, cy) : null));
    const dy = segundoBlanco((k) => (cy - k >= 0 ? en(cx, cy - k) : null));
    const caja = lienzo.getBoundingClientRect();
    return (dx * (caja.width / W)) / (dy * (caja.height / H));
  });
}

async function cambiosDeRegionesVivasEn1s(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolver) => {
        const vivas = Array.from(
          document.querySelectorAll(
            'main [aria-live]:not([aria-live="off"]), main [role="status"], main [role="alert"], main [role="log"]',
          ),
        );
        let n = 0;
        const obs = new MutationObserver((m) => {
          n += m.length;
        });
        for (const v of vivas) obs.observe(v, { subtree: true, characterData: true, childList: true });
        setTimeout(() => {
          obs.disconnect();
          resolver(n);
        }, 1000);
      }),
  );
}

test.describe('Onda viajera', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · f = 2 Hz, v = 6 m/s → λ = 3,000 m, T = 0,500 s, k = 2,094 rad/m, ω = 12,566 rad/s', async ({
    page,
  }) => {
    // λ = v/f = 6/2 = 3 · T = 1/2 = 0,5 · k = 2π/3 = 2,0944 · ω = 2π·2 = 12,5664
    await sembrarValor(page, '#ov-f', 2);
    await sembrarValor(page, '#ov-v', 6);
    await expect(valor(page, 'Longitud de onda λ = v/f')).toHaveText('3,000 m');
    await expect(valor(page, 'Periodo T = 1/f')).toHaveText('0,500 s');
    await expect(valor(page, 'Número de onda k = 2π/λ')).toHaveText('2,094 rad/m');
    await expect(valor(page, 'Frecuencia angular ω = 2π·f')).toHaveText('12,566 rad/s');
  });

  test('CASO 2 (límite) · los dos extremos: f = 5, v = 1 → λ = 0,200 m; f = 0,5, v = 10 → λ = 20,000 m', async ({
    page,
  }) => {
    // f = 5, v = 1: λ = 0,2 · T = 0,2 · k = 2π/0,2 = 10π = 31,416 · ω = 10π = 31,416
    await sembrarValor(page, '#ov-f', 5);
    await sembrarValor(page, '#ov-v', 1);
    await expect(valor(page, 'Longitud de onda λ = v/f')).toHaveText('0,200 m');
    await expect(valor(page, 'Periodo T = 1/f')).toHaveText('0,200 s');
    await expect(valor(page, 'Número de onda k = 2π/λ')).toHaveText('31,416 rad/m');
    await expect(valor(page, 'Frecuencia angular ω = 2π·f')).toHaveText('31,416 rad/s');
    // f = 0,5, v = 10: λ = 20 · T = 2 · k = 2π/20 = 0,3142 · ω = π = 3,1416
    await sembrarValor(page, '#ov-f', 0.5);
    await sembrarValor(page, '#ov-v', 10);
    await expect(valor(page, 'Longitud de onda λ = v/f')).toHaveText('20,000 m');
    await expect(valor(page, 'Periodo T = 1/f')).toHaveText('2,000 s');
    await expect(valor(page, 'Número de onda k = 2π/λ')).toHaveText('0,314 rad/m');
    await expect(valor(page, 'Frecuencia angular ω = 2π·f')).toHaveText('3,142 rad/s');
  });

  test('CASO 3 (rechazo) · f = 0, f = −1 y v = 1000 se acotan al rango: nunca ∞ ni NaN', async ({ page }) => {
    // f = 0 dividiría por cero: el deslizador (min 0,5) lo deja en 0,5 → λ = 4/0,5 = 8 m, T = 2 s
    expect(await sembrarValorAcotado(page, '#ov-f', 0)).toBe('0.5');
    await expect(valor(page, 'Longitud de onda λ = v/f')).toHaveText('8,000 m');
    await expect(valor(page, 'Periodo T = 1/f')).toHaveText('2,000 s');
    await sembrarValor(page, '#ov-f', 3); // λ = 4/3 = 1,333 m, para que el −1 parta de otro estado
    await expect(valor(page, 'Longitud de onda λ = v/f')).toHaveText('1,333 m');
    expect(await sembrarValorAcotado(page, '#ov-f', -1)).toBe('0.5');
    await expect(valor(page, 'Longitud de onda λ = v/f')).toHaveText('8,000 m');
    // v = 1000 → máximo 10 m/s: λ = 10/0,5 = 20 m
    expect(await sembrarValorAcotado(page, '#ov-v', 1000)).toBe('10');
    await expect(valor(page, 'Longitud de onda λ = v/f')).toHaveText('20,000 m');
    await expect(page.locator('[role="status"]').filter({ hasText: /∞|No definido|NaN/ })).toHaveCount(0);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H4 · la región viva no debe cambiar sola: «Tiempo simulado» la hace hablar ~60 veces por segundo', async ({
    page,
  }) => {
    // El bloque de resultados es role=status + aria-live=polite + aria-atomic=true y lleva dentro
    // «Tiempo simulado», que avanza en cada fotograma. Medido: 59 cambios en 1 s sin tocar nada.
    test.fail();
    expect(await cambiosDeRegionesVivasEn1s(page)).toBe(0);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H7 · con A = 2 la onda cabe en su lienzo', async ({ page }) => {
    // yScale = 70 px por unidad y medio alto 110: con A > 110/70 = 1,57 la cresta sale del
    // viewBox (overflow hidden). Medido con A = 2: y de −29,95 a 249,95 en un viewBox 0-220.
    test.fail();
    await sembrarValor(page, '#ov-a', 2);
    const { min, max, alto } = await page.locator(SVG_VIAJERA).evaluate((svg) => {
      const ys = (svg.querySelector('polyline')?.getAttribute('points') ?? '')
        .split(' ')
        .map((p) => Number(p.split(',')[1]));
      return { min: Math.min(...ys), max: Math.max(...ys), alto: Number((svg.getAttribute('viewBox') ?? '').split(' ')[3]) };
    });
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeLessThanOrEqual(alto);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H6 · las pestañas dicen cuál está activa, el lienzo es una imagen y los emojis decorativos se ocultan', async ({
    page,
  }) => {
    test.fail();
    for (const nombre of ['Onda viajera', 'Interferencia 2 fuentes', 'Ondas estacionarias']) {
      const b = page.getByRole('button', { name: nombre, exact: true }).or(page.getByRole('tab', { name: nombre, exact: true }));
      const estado = await b.evaluate((el) => el.getAttribute('aria-pressed') ?? el.getAttribute('aria-selected'));
      expect(estado, `«${nombre}» expone su estado`).not.toBeNull();
    }
    await pestana(page, 'Interferencia 2 fuentes', '#if-d');
    await expect(page.locator(LIENZO)).toHaveAttribute('role', 'img');
    for (const emoji of ['📐', '🎯', '🔁', '🪕', '⚖️', '🧪']) {
      await expect(page.getByText(emoji, { exact: true })).toHaveAttribute('aria-hidden', 'true');
    }
  });
});

test.describe('Interferencia de dos fuentes', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await pestana(page, 'Interferencia 2 fuentes', '#if-f');
  });

  test('CASO 1 (normal) · v = 4 m/s, f = 2 Hz → λ = 2,000 m y d/λ = 1,50; «d = λ» pone d = 2,00 m', async ({ page }) => {
    // λ = 4/2 = 2 · d/λ = 3/2 = 1,5 (d = 3 m de partida)
    await sembrarValor(page, '#if-f', 2);
    await expect(valor(page, 'Longitud de onda λ')).toHaveText('2,000 m');
    await expect(valor(page, 'd / λ (separación en λ)')).toHaveText('1,50');
    await page.getByRole('button', { name: /Fuentes en fase/ }).click();
    await expect(page.locator('label[for="if-d"]')).toContainText('2,00 m');
    await expect(valor(page, 'd / λ (separación en λ)')).toHaveText('1,00');
    await page.getByRole('button', { name: /Mismo punto/ }).click();
    await expect(valor(page, 'd / λ (separación en λ)')).toHaveText('0,00');
  });

  test('CASO 2 (límite) · el eje central es máximo con Δφ = 0 y línea nodal con Δφ = π; con d = 0 y Δφ = π se anula todo', async ({
    page,
  }) => {
    // d = 3, f = 1,5, v = 4 → λ = 8/3, k = 2,3562 rad/m; fuentes en (±1,5; 0,5) m; t = 0.
    // Píxel (200, 185) → (x, y) = (0,015; 1,8075) m: r₁ ≈ r₂ ≈ 1,99 m, k·r ≈ 3π/2 → suma
    // A·(sin kr₁/√r₁ + sin kr₂/√r₂) = −1,417 → norma −0,708 → rgb(74, 74, 255), valle.
    // Píxel (200, 130) → y = 3,6485 m: suma +1,0008 → norma 0,500 → rgb(255, 127, 127), cresta.
    await page.getByRole('button', { name: 'Pausar' }).click();
    await page.getByRole('button', { name: 'Reiniciar tiempo' }).click();
    await expect(valor(page, 'Tiempo simulado')).toHaveText('0,00 s');
    await expect.poll(async () => casi(await pixel(page, 200, 185), [74, 74, 255])).toBe(true);
    await expect.poll(async () => casi(await pixel(page, 200, 130), [255, 127, 127])).toBe(true);
    // Δφ = π: en el eje r₁ = r₂ y las dos ondas llegan en oposición → 0 → blanco (≥ 250)
    await page.getByRole('button', { name: /Fuentes opuestas/ }).click();
    await expect(page.locator('label[for="if-dphi"]')).toContainText('3,14 rad');
    for (const y of [185, 160, 130, 100, 60]) {
      await expect.poll(async () => Math.min(...(await pixel(page, 200, y)))).toBeGreaterThanOrEqual(250);
    }
    // d = 0 con Δφ = π: las dos fuentes coinciden y se cancelan en todo el plano
    await page.getByRole('button', { name: /Mismo punto/ }).click();
    for (const [x, y] of [[100, 100], [300, 50], [350, 200]]) {
      await expect.poll(async () => Math.min(...(await pixel(page, x, y)))).toBeGreaterThanOrEqual(254);
    }
  });

  test('CASO 3 (rechazo) · d = −2 y f = 50 se acotan: d = 0,00 m y f = 5 Hz (λ = 0,800 m)', async ({ page }) => {
    expect(await sembrarValorAcotado(page, '#if-d', -2)).toBe('0');
    await expect(valor(page, 'd / λ (separación en λ)')).toHaveText('0,00');
    expect(await sembrarValorAcotado(page, '#if-f', 50)).toBe('5');
    await expect(valor(page, 'Longitud de onda λ')).toHaveText('0,800 m'); // 4/5
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H2 · la leyenda no llama «destructiva» al azul, que es el valle de una zona constructiva', async ({
    page,
  }) => {
    // El mapa pinta el desplazamiento (rojo cresta, azul valle, blanco 0: lo dice la escala
    // «Valle–Cresta» y el consejo de la FAQ «las líneas blancas son nodos»). El CASO 2 mide el eje
    // de máximo en azul. Hoy el subtítulo dice «constructiva (rojo) y destructiva (azul)».
    test.fail();
    await expect(page.getByText(/destructiva \(azul\)/)).toHaveCount(0);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H8 · el mapa no deforma: un frente circular mide lo mismo en horizontal y en vertical', async ({
    page,
  }) => {
    // Dominio 12 m × 8 m (3:2) en un lienzo 400 × 240 (5:3) pintado a 800 × 480: 66,7 px/m en x
    // frente a 60 px/m en y. Con d = 0 el segundo anillo blanco (r = λ) queda ~11 % más ancho
    // que alto.
    test.fail();
    await page.getByRole('button', { name: /Mismo punto/ }).click();
    await page.getByRole('button', { name: 'Pausar' }).click();
    await page.getByRole('button', { name: 'Reiniciar tiempo' }).click();
    await expect(valor(page, 'Tiempo simulado')).toHaveText('0,00 s');
    const relacion = await anilloHorizontalEntreVertical(page);
    expect(relacion).toBeGreaterThan(0.94);
    expect(relacion).toBeLessThan(1.06);
  });
});

test.describe('Ondas estacionarias', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await pestana(page, 'Ondas estacionarias', '#es-l');
  });

  test('CASO 1 (normal) · tubo abierto-cerrado, L = 0,5 m, v = 340 m/s, modo 2 → f₁ = 170 Hz, f = 510 Hz, λ = 0,667 m', async ({
    page,
  }) => {
    // f₁ = v/4L = 340/2 = 170 · modo 2 = armónico 2·2−1 = 3 → 510 · λ = 4L/3 = 0,6667
    // Armónicos impares: 170·(1, 3, 5, 7, 9) Hz y λ = 2/(1, 3, 5, 7, 9) m
    await page.getByRole('button', { name: 'Tubo abierto-cerrado' }).click();
    await sembrarValor(page, '#es-l', 0.5);
    await sembrarValor(page, '#es-v', 340);
    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(valor(page, 'Frecuencia fundamental f₁')).toHaveText('170,00 Hz');
    await expect(valor(page, 'Frecuencia de este modo')).toHaveText('510,00 Hz');
    await expect(valor(page, 'Longitud de onda λ')).toHaveText('0,667 m');
    await expect(valor(page, 'Tipo de armónicos')).toHaveText('Solo impares (1, 3, 5…)');
    await expect(page.getByText('Armónico 3', { exact: true })).toBeVisible();
    expect(await armonicos(page)).toEqual([
      'n = 1 · f = 170,0 Hz · λ = 2,00 m',
      'n = 3 · f = 510,0 Hz · λ = 0,67 m',
      'n = 5 · f = 850,0 Hz · λ = 0,40 m',
      'n = 7 · f = 1190,0 Hz · λ = 0,29 m',
      'n = 9 · f = 1530,0 Hz · λ = 0,22 m',
    ]);
    // Antinodo en el extremo abierto (x = 0) y en 2L/3; nodos en L/3 y en el cerrado (x = L).
    // En el viewBox: 30 + x/L·740 → antinodos 30 y 523,3; nodos 276,7 y 770 (muestreo 1,85).
    const m = await marcas(page);
    const ant = distintas(m.antinodos);
    const nod = distintas(m.nodos);
    expect(ant).toHaveLength(2);
    expect(Math.abs(ant[0] - 30)).toBeLessThanOrEqual(2);
    expect(Math.abs(ant[1] - 523.33)).toBeLessThanOrEqual(2);
    expect(nod).toHaveLength(2);
    expect(Math.abs(nod[0] - 276.67)).toBeLessThanOrEqual(2);
    expect(Math.abs(nod[1] - 770)).toBeLessThanOrEqual(2);
  });

  test('CASO 2 (límite) · cuerda fija-fija, L = 0,2 m (mín.), v = 500 m/s (máx.), modo 5 → f₁ = 1250 Hz, f = 6250 Hz, λ = 0,080 m', async ({
    page,
  }) => {
    // f₁ = 500/(2·0,2) = 1250 · f₅ = 6250 · λ = 2L/5 = 0,08. Cuatro cifras: es-ES no agrupa.
    await sembrarValor(page, '#es-l', 0.2);
    await sembrarValor(page, '#es-v', 500);
    await page.getByRole('button', { name: '5', exact: true }).click();
    await expect(valor(page, 'Frecuencia fundamental f₁')).toHaveText('1250,00 Hz');
    await expect(valor(page, 'Frecuencia de este modo')).toHaveText('6250,00 Hz');
    await expect(valor(page, 'Longitud de onda λ')).toHaveText('0,080 m');
    expect(await armonicos(page)).toEqual([
      'n = 1 · f = 1250,0 Hz · λ = 0,40 m',
      'n = 2 · f = 2500,0 Hz · λ = 0,20 m',
      'n = 3 · f = 3750,0 Hz · λ = 0,13 m',
      'n = 4 · f = 5000,0 Hz · λ = 0,10 m',
      'n = 5 · f = 6250,0 Hz · λ = 0,08 m',
    ]);
    // n + 1 = 6 posiciones de nodo (30 + j·148) y n = 5 antinodos (104 + j·148)
    const m = await marcas(page);
    const nod = distintas(m.nodos);
    expect(nod).toHaveLength(6);
    nod.forEach((x, j) => expect(Math.abs(x - (30 + j * 148))).toBeLessThanOrEqual(2));
    const ant = distintas(m.antinodos);
    expect(ant).toHaveLength(5);
    ant.forEach((x, j) => expect(Math.abs(x - (104 + j * 148))).toBeLessThanOrEqual(2));
  });

  test('CASO 3 (rechazo) · L = 0 y v = 1000 se acotan a 0,2 m y 500 m/s (f₁ = 1250 Hz, nunca ∞)', async ({ page }) => {
    expect(await sembrarValorAcotado(page, '#es-l', 0)).toBe('0.2');
    expect(await sembrarValorAcotado(page, '#es-v', 1000)).toBe('500');
    await expect(valor(page, 'Frecuencia fundamental f₁')).toHaveText('1250,00 Hz');
    await expect(page.locator('[role="status"]').filter({ hasText: /∞|No definido|NaN/ })).toHaveCount(0);
  });

  test('Cuerda fija-libre, L = 1 m, v = 200 m/s, modo 2 → f₁ = 50 Hz, f = 150 Hz, λ = 1,333 m', async ({ page }) => {
    // f₁ = v/4L = 50 · armónico 3 → 150 · λ = 4L/3
    await page.getByRole('button', { name: 'Cuerda fija-libre' }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(valor(page, 'Frecuencia fundamental f₁')).toHaveText('50,00 Hz');
    await expect(valor(page, 'Frecuencia de este modo')).toHaveText('150,00 Hz');
    await expect(valor(page, 'Longitud de onda λ')).toHaveText('1,333 m');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H1 · cada nodo se dibuja una vez: fija-fija modo 3 tiene 4 nodos (N1…N4)', async ({
    page,
  }) => {
    // La guía: «Cada modo n tiene n+1 nodos». El detector marca nodo en i si s[i−1] y s[i+1]
    // tienen signo opuesto, y eso se cumple en las DOS muestras que rodean cada cero: hoy N1…N6
    // (modo 3), N1…N10 (modo 5), dos nodos en el tubo abierto modo 1 (es uno).
    test.fail();
    await page.getByRole('button', { name: '3', exact: true }).click();
    const m = await marcas(page);
    expect(m.nodos).toHaveLength(4);
    expect(m.rotulosN).toEqual(['N1', 'N2', 'N3', 'N4']);
    await page.getByRole('button', { name: 'Tubo abierto-abierto' }).click();
    await page.getByRole('button', { name: '1', exact: true }).click();
    expect((await marcas(page)).nodos).toHaveLength(1);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H3 · en el tubo abierto-cerrado, «cerrado» rotula el extremo cerrado (derecha)', async ({
    page,
  }) => {
    // El tapón y el nodo están en x = 770 (extremo cerrado); el rótulo «cerrado» va en x = 30,
    // sobre el antinodo A1 del extremo abierto.
    test.fail();
    await page.getByRole('button', { name: 'Tubo abierto-cerrado' }).click();
    const x = Number(
      await page.locator(SVG_ESTACIONARIA).locator('text', { hasText: /^cerrado$/ }).getAttribute('x'),
    );
    expect(x).toBeGreaterThan(400);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H5 · en oscuro los nodos se ven y los rótulos llegan a 4,5:1', async ({ page }) => {
    // #111827 sobre #1a1a1a = 1,02:1 (círculo y N); A #2563eb 3,3:1; «cerrado» #6b7280 3,5:1.
    test.fail();
    await page.getByRole('button', { name: 'Tubo abierto-cerrado' }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await activarTema(page, 'dark');
    await prepararParaMedir(page);
    const c = await contrastesSvg(page, SVG_ESTACIONARIA);
    for (const [marca, ratio] of Object.entries(c)) {
      expect(ratio, marca).toBeGreaterThanOrEqual(marca.startsWith('círculo') ? 3 : 4.5);
    }
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H5 · en claro el rótulo «2A» de la onda viajera llega a 4,5:1', async ({ page }) => {
    // #48A9A6 (teal) a 11 px sobre #fafafa = 2,68:1
    test.fail();
    await pestana(page, 'Onda viajera', '#ov-a');
    await prepararParaMedir(page);
    const c = await contrastesSvg(page, SVG_VIAJERA);
    for (const [marca, ratio] of Object.entries(c)) expect(ratio, marca).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Metadatos', () => {
  test('HALLAZGO (09/11/2026, ABIERTO) H10 · el FAQPage pregunta lo que pregunta la FAQ visible (una sola constante)', async ({
    page,
  }) => {
    // «¿En qué se diferencia una onda viajera de una onda estacionaria?» (FAQPage) y «¿Cuál es la
    // diferencia entre una onda viajera y una estacionaria?» (visible) tienen respuestas distintas;
    // lo mismo «¿Cómo funciona el experimento de la doble rendija de Young?» / «¿Qué es…?».
    test.fail();
    await abrir(page);
    await comprobarFaqPageUnico(page);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H11 · si el JSON-LD promete un patrón de doble rendija, la app lo tiene', async ({
    page,
  }) => {
    // featureList: «Patrones predefinidos: doble rendija, fuentes opuestas». Los presets son
    // «Fuentes en fase, d = λ», «Fuentes opuestas (Δφ = π)» y «Mismo punto (d = 0)».
    test.fail();
    await abrir(page);
    const features = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; featureList?: string[] };
        if (j['@type'] === 'WebApplication') return j.featureList ?? [];
      }
      return [];
    });
    expect(features.length).toBeGreaterThanOrEqual(4);
    await pestana(page, 'Interferencia 2 fuentes', '#if-d');
    if (features.some((f) => /doble rendija/i.test(f))) {
      await expect(page.getByRole('button', { name: /doble rendija/i })).toHaveCount(1);
    }
  });
});

test.describe('Móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('los controles se usan con el dedo y no hay desbordamiento horizontal', async ({ page }) => {
    const ancho = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, vista: window.innerWidth }));
    expect(ancho.doc).toBeLessThanOrEqual(ancho.vista);
    // Un toque en el deslizador de frecuencia la cambia y λ = 4/f (v = 4 de partida) la sigue
    const caja = await page.locator('#ov-f').boundingBox();
    expect(caja).not.toBeNull();
    if (!caja) return;
    await page.touchscreen.tap(caja.x + caja.width * 0.75, caja.y + caja.height / 2);
    await expect.poll(async () => Number(await page.locator('#ov-f').inputValue())).toBeGreaterThan(1);
    const f = Number(await page.locator('#ov-f').inputValue());
    const lambda = (4 / f).toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    await expect(valor(page, 'Longitud de onda λ = v/f')).toHaveText(`${lambda} m`);
    // Las pestañas y los botones de modo responden al toque
    await page.getByRole('button', { name: 'Ondas estacionarias', exact: true }).tap();
    await esperarHidratacion(page, ['#es-l']);
    await page.getByRole('button', { name: '3', exact: true }).tap();
    await expect(page.getByText('Armónico 3', { exact: true })).toBeVisible();
    await expect(valor(page, 'Frecuencia de este modo')).toHaveText('300,00 Hz'); // 3·200/(2·1)
    const modo = await page.getByRole('button', { name: '3', exact: true }).boundingBox();
    expect(modo?.width ?? 0).toBeGreaterThanOrEqual(44);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H9 · en móvil los rótulos del SVG se leen (≥ 9 px de alto)', async ({ page }) => {
    // El viewBox 800 × 220 se encoge a 308 × 85 dentro de una caja de 308 × 180: los textos de
    // 10-12 unidades quedan en 5-6 px.
    test.fail();
    const altoLambda = await page.locator(SVG_VIAJERA).locator('text', { hasText: /^λ = / }).evaluate((t) => t.getBoundingClientRect().height);
    expect(altoLambda).toBeGreaterThanOrEqual(9);
    await page.getByRole('button', { name: 'Ondas estacionarias', exact: true }).tap();
    await esperarHidratacion(page, ['#es-l']);
    const altoN = await page.locator(SVG_ESTACIONARIA).locator('text', { hasText: /^N1$/ }).evaluate((t) => t.getBoundingClientRect().height);
    expect(altoN).toBeGreaterThanOrEqual(9);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) H8 · en móvil el mapa de interferencia no se estira en vertical', async ({ page }) => {
    // 12 m × 8 m pintados en 308 × 360 px: 25,7 px/m en x y 45 px/m en y (×1,75).
    test.fail();
    await page.getByRole('button', { name: 'Interferencia 2 fuentes', exact: true }).tap();
    await esperarHidratacion(page, ['#if-d']);
    await page.getByRole('button', { name: /Mismo punto/ }).tap();
    await page.getByRole('button', { name: 'Pausar' }).tap();
    await page.getByRole('button', { name: 'Reiniciar tiempo' }).tap();
    await expect(valor(page, 'Tiempo simulado')).toHaveText('0,00 s');
    const relacion = await anilloHorizontalEntreVertical(page);
    expect(relacion).toBeGreaterThan(0.94);
    expect(relacion).toBeLessThan(1.06);
  });
});
