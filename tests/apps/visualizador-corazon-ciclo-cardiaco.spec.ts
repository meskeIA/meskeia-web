import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Visualizador del ciclo cardíaco — test de regresión (inspector 14/11/2026, primera inspección)
 *
 * Qué hace la app (page.tsx, sin motor aparte ni datos de data/fiscal):
 *   · «El latido del corazón»: deslizador de 40 a 200 lpm; al pulsar «Iniciar latido» alterna
 *     «Sístole»/«Diástole» con un setInterval de (60/lpm)/2 s, y anima el ❤️ con
 *     --duracion-latido = 60/lpm s.
 *   · «Las 4 válvulas»: tarjetas con su ficha.
 *   · «ECG»: trazado SVG que se desplaza; un complejo P-QRS-T cada 200 unidades del viewBox y el
 *     desplazamiento recorre 600 unidades en 2.400 / 1.200 / 4.000 ms según el ritmo.
 *   · «Gasto cardíaco»: GC = FC × VS / 1000 (L/min) con FC de 40 a 200 lpm y VS de 40 a 130 ml,
 *     barra frente a un «máximo referencial» de 25 L/min y un texto de interpretación por tramos
 *     (< 4, < 6, < 10, < 18, ≥ 18 L/min).
 *
 * DE DÓNDE SALE CADA ESPERADO (calculado a mano ANTES de abrir el navegador)
 *   CASO 1 (normal) — 75 lpm × 70 ml = 5.250 ml/min = 5,25 L/min (estado inicial) · 60 lpm × 80 ml
 *            = 4.800 ml/min = 4,8 L/min, 4,8 / 25 = 19,2 % de la barra, tramo 4-6 «reposo».
 *   CASO 2 (límite) — 200 × 130 = 26.000 ml/min = 26 L/min «26,0»; la barra se capa al 100 %
 *            (26/25 = 104 %) · 40 × 40 = 1.600 ml/min = 1,6 L/min, 6,4 % de la barra.
 *   CASO 3 (rechazo) — los deslizadores no admiten valores fuera de rango: FC 250 → 200 y VS 0 → 40
 *            (200 × 40 = 8.000 ml/min = «8,0»); FC −10 → 40 y VS 200 → 130 (40 × 130 = 5.200 =
 *            «5,2»); con teclado, Fin y → no pasan de 200.
 *   LATIDO — un ciclo dura 60/lpm s: 0,8 s a 75 lpm y 0,4 s a 150 lpm.
 *   ECG — lpm = 60.000 / (200 / v) = 300 · v, con v en unidades del viewBox por ms: normal 600/2.400
 *            = 0,25 → 75 lpm; taquicardia 600/1.200 = 0,5 → 150 lpm; bradicardia 600/4.000 = 0,15
 *            → 45 lpm (los tres que rotula la app).
 *   FISIOLOGÍA — la sístole ventricular es la fase CORTA en reposo: la propia FAQ de la app
 *            (metadata.ts) dice «a 70 latidos por minuto, un ciclo completo dura aproximadamente
 *            0,85 segundos, de los cuales unos 0,3 corresponden a la sístole» (0,3/0,857 = 35 %), y
 *            Guyton y Hall, Tratado de fisiología médica, cap. 9, da ~0,4 del ciclo a 72 lpm. No hay
 *            dominio de fisiología en la red de fuentes del Inspector: el caso se ancla en la FAQ.
 *
 * HALLAZGOS ABIERTOS (inspector 14/11/2026): los test.fail() de abajo. Cada uno afirma lo que la
 * app DEBERÍA hacer, así que hoy falla «como se espera»; al repararse, se quita el test.fail().
 */

const URL_APP = '/visualizador-corazon-ciclo-cardiaco/';

const seccion = (page: Page, titulo: string | RegExp): Locator =>
  page.locator('section', { has: page.getByRole('heading', { name: titulo }) });

const seccionGasto = (page: Page) => seccion(page, 'Gasto cardíaco');
const seccionLatido = (page: Page) => seccion(page, 'El latido del corazón');
const seccionEcg = (page: Page) => seccion(page, /ECG — Electrocardiograma/);

/** La cifra grande del gasto, la que va encima de «litros / minuto». */
const valorGasto = (page: Page) =>
  seccionGasto(page).getByText('litros / minuto', { exact: true }).locator('xpath=preceding-sibling::div[1]');

const interpretacion = (page: Page) =>
  seccionGasto(page).locator('div', { has: page.locator('strong', { hasText: 'Interpretación:' }) });

/**
 * Solo la frase que cambia con el gasto (getComparacion): la coletilla fija que la sigue («…los
 * atletas tienen frecuencias cardíacas en reposo más bajas…») casaría con /reposo/ en todos los tramos.
 */
async function frasePorTramo(page: Page): Promise<string> {
  const texto = await interpretacion(page).innerText();
  return texto.replace(/^Interpretación:\s*/, '').split('El entrenamiento físico')[0].trim();
}

async function fijarGasto(page: Page, fc: number, vs: number) {
  await sembrarValor(page, '#slider-fc', fc);
  await sembrarValor(page, '#slider-vs', vs);
}

/** Etiqueta de la tarjeta de referencia «~N L/min» (la línea de debajo de la cifra). */
async function rotuloReferencia(page: Page, valor: string): Promise<string> {
  return seccionGasto(page)
    .getByText(valor, { exact: true })
    .locator('xpath=following-sibling::div[1]')
    .innerText();
}

/** Muestrea el rótulo de fase del latido durante `ms` y devuelve la duración media de cada fase. */
async function medirFases(page: Page, ms: number): Promise<{ sistole: number; diastole: number }> {
  const muestras = await seccionLatido(page).evaluate(
    (sec, duracion) =>
      new Promise<Array<[number, string]>>((resolver) => {
        const out: Array<[number, string]> = [];
        const t0 = performance.now();
        const paso = (): void => {
          const rotulo = Array.from(sec.querySelectorAll('div')).find(
            (d) => d.children.length === 0 && /^(Sístole|Diástole) \(/.test(d.textContent ?? ''),
          );
          out.push([performance.now() - t0, rotulo?.textContent ?? '']);
          if (performance.now() - t0 < duracion) requestAnimationFrame(paso);
          else resolver(out);
        };
        requestAnimationFrame(paso);
      }),
    ms,
  );
  const tramos: Array<[string, number]> = [];
  let inicio = muestras[0][0];
  let fase = muestras[0][1];
  for (const [t, f] of muestras) {
    if (f !== fase) {
      tramos.push([fase, t - inicio]);
      inicio = t;
      fase = f;
    }
  }
  // El primer tramo empezó antes de muestrear: fuera.
  const completos = tramos.slice(1);
  const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const sis = completos.filter(([f]) => f.startsWith('Sístole')).map(([, d]) => d);
  const dia = completos.filter(([f]) => f.startsWith('Diástole')).map(([, d]) => d);
  if (sis.length === 0 || dia.length === 0) throw new Error(`Sin tramos completos: ${JSON.stringify(tramos)}`);
  return { sistole: media(sis), diastole: media(dia) };
}

/** Velocidad del trazado ECG (unidades del viewBox por ms), desenrollando el `% 200`. */
async function velocidadEcg(page: Page, ms: number): Promise<number> {
  return page.getByRole('img', { name: 'Trazado ECG animado' }).evaluate(
    (el, duracion) =>
      new Promise<number>((resolver) => {
        const g = el.querySelector('g');
        const leer = (): number => Number(/translate\((-?[\d.e+-]+)/.exec(g?.getAttribute('transform') ?? '')?.[1]);
        const out: Array<[number, number]> = [];
        const t0 = performance.now();
        const paso = (): void => {
          out.push([performance.now(), leer()]);
          if (performance.now() - t0 < duracion) requestAnimationFrame(paso);
          else {
            let recorrido = 0;
            for (let i = 1; i < out.length; i++) {
              let d = out[i][1] - out[i - 1][1];
              if (d > 100) d -= 200; // vuelta del módulo
              recorrido += d;
            }
            resolver(-recorrido / (out[out.length - 1][0] - out[0][0]));
          }
        };
        requestAnimationFrame(paso);
      }),
    ms,
  );
}

/** ¿El rótulo de una escala contiene, en horizontal, la posición de su valor en el deslizador? */
async function escalaDe(page: Page, id: string, min: number, max: number) {
  return page.locator(`#${id}`).evaluate(
    (input, { min: lo, max: hi }) => {
      const r = input.getBoundingClientRect();
      const escala = input.nextElementSibling;
      return Array.from(escala?.querySelectorAll('span') ?? []).map((sp) => {
        const b = sp.getBoundingClientRect();
        const n = Number(/\d+/.exec(sp.textContent ?? '')?.[0]);
        const pos = r.left + ((n - lo) / (hi - lo)) * r.width;
        return {
          texto: sp.textContent ?? '',
          contiene: b.left - 1 <= pos && pos <= b.right + 1,
          centroComoValor: Math.round(lo + (((b.left + b.right) / 2 - r.left) / r.width) * (hi - lo)),
        };
      });
    },
    { min, max },
  );
}

async function jsonLdDe(page: Page, tipo: string): Promise<Record<string, unknown>[]> {
  return page.evaluate((t) => {
    const nodos: Record<string, unknown>[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const lista = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of lista) if (n['@type'] === t) nodos.push(n);
    }
    return nodos;
  }, tipo);
}

test.describe('visualizador-corazon-ciclo-cardiaco', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-bpm', '#slider-fc', '#slider-vs']);
  });

  // ------------------------------------------------------------------ gasto cardíaco

  test('CASO 1 (normal): GC = FC × VS — 75 × 70 = 5,25 L/min y 60 × 80 = 4,8 L/min', async ({ page }) => {
    // Estado inicial: 75 lpm × 70 ml = 5.250 ml/min
    await expect(valorGasto(page)).toHaveText('5,25');
    await expect(seccionGasto(page).getByText(/^GC = \d/)).toHaveText('GC = 75 lpm × 70 ml = 5250 ml/min');

    await fijarGasto(page, 60, 80);
    await expect(seccionGasto(page).locator('label[for="slider-fc"]')).toContainText('60 lpm');
    await expect(seccionGasto(page).locator('label[for="slider-vs"]')).toContainText('80 ml');
    await expect(valorGasto(page)).toHaveText('4,8');
    // 4,8 / 25 = 19,2 % de la barra
    await expect(seccionGasto(page).getByRole('progressbar').locator('div').first()).toHaveAttribute(
      'style',
      /width:\s*19\.2%/,
    );
    await expect(interpretacion(page)).toContainText('Rango de reposo normal');
  });

  test('CASO 2 (límite): 200 × 130 = 26,0 L/min con la barra capada al 100 %; 40 × 40 = 1,6 L/min', async ({ page }) => {
    await fijarGasto(page, 200, 130);
    await expect(valorGasto(page)).toHaveText('26,0');
    await expect(seccionGasto(page).getByRole('progressbar').locator('div').first()).toHaveAttribute(
      'style',
      /width:\s*100%/,
    );

    await fijarGasto(page, 40, 40);
    await expect(valorGasto(page)).toHaveText('1,6');
    await expect(seccionGasto(page).getByRole('progressbar').locator('div').first()).toHaveAttribute(
      'style',
      /width:\s*6\.4%/,
    );
  });

  test('CASO 3 (rechazo): FC y VS fuera de rango se capan a 40-200 lpm y 40-130 ml', async ({ page }) => {
    // Parte de 75/70: 250 y 0 mueven el estado de verdad.
    expect(await sembrarValorAcotado(page, '#slider-fc', 250)).toBe('200');
    expect(await sembrarValorAcotado(page, '#slider-vs', 0)).toBe('40');
    await expect(valorGasto(page)).toHaveText('8,0'); // 200 × 40 = 8.000 ml/min

    expect(await sembrarValorAcotado(page, '#slider-fc', -10)).toBe('40');
    expect(await sembrarValorAcotado(page, '#slider-vs', 200)).toBe('130');
    await expect(valorGasto(page)).toHaveText('5,2'); // 40 × 130 = 5.200 ml/min
    await expect(valorGasto(page)).not.toHaveText(/NaN|Infinity/);

    // Con teclado: Fin y flecha derecha no pasan de 200 lpm
    await page.locator('#slider-fc').focus();
    await page.keyboard.press('End');
    await page.keyboard.press('ArrowRight');
    await expect(seccionGasto(page).locator('label[for="slider-fc"]')).toContainText('200 lpm');
    await expect(valorGasto(page)).toHaveText('26,0'); // 200 × 130
  });

  test('las escalas de FC y VS del gasto ponen cada rótulo sobre su valor', async ({ page }) => {
    for (const [id, min, max] of [['slider-fc', 40, 200], ['slider-vs', 40, 130]] as const) {
      const rotulos = await escalaDe(page, id, min, max);
      expect(rotulos).toHaveLength(3);
      for (const r of rotulos) expect(r.contiene, `${id}: «${r.texto}» está sobre ${r.centroComoValor}`).toBe(true);
    }
  });

  // ------------------------------------------------------------------ latido y ECG

  test('el latido dura 60/lpm: 0,8 s a 75 lpm y 0,4 s a 150 lpm', async ({ page }) => {
    const corazon = page.getByRole('img', { name: /Corazón/ });
    const boton = seccionLatido(page).getByRole('button', { name: /latido/ });

    await boton.click(); // a 75 lpm, el estado inicial
    await expect(corazon).toHaveAttribute('style', /--duracion-latido:\s*0\.80s/);
    const a75 = await medirFases(page, 3300);
    expect(Math.abs(a75.sistole + a75.diastole - 800)).toBeLessThan(80);

    await sembrarValor(page, '#slider-bpm', 150);
    await expect(corazon).toHaveAttribute('style', /--duracion-latido:\s*0\.40s/);
    const a150 = await medirFases(page, 2500);
    expect(Math.abs(a150.sistole + a150.diastole - 400)).toBeLessThan(60);
  });

  test('el trazado ECG pasa a 75, 150 y 45 lpm según el ritmo elegido', async ({ page }) => {
    await seccionEcg(page).scrollIntoViewIfNeeded();
    const casos: Array<[RegExp, number]> = [
      [/^Normal/, 75],
      [/^Taquicardia/, 150],
      [/^Bradicardia/, 45],
    ];
    for (const [ritmo, lpm] of casos) {
      const boton = seccionEcg(page).getByRole('button', { name: ritmo });
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      // Al cambiar de ritmo el efecto reinicia el trazado a 0 (un salto atrás de menos de 200 que el
      // desenrollado contaría como retroceso): se mide cuando ya ha arrancado el ritmo nuevo.
      await page.waitForTimeout(300);
      const lpmMedido = 300 * (await velocidadEcg(page, 2500));
      expect(Math.abs(lpmMedido - lpm), `${ritmo}: ${lpmMedido.toFixed(1)} lpm`).toBeLessThan(lpm * 0.08);
    }
  });

  // ------------------------------------------------------------------ hallazgos abiertos

  test('HALLAZGO ABIERTO [contenido/medio]: sístole y diástole duran lo mismo; en reposo la sístole es la fase corta', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/medio]
    // ENTRADA  «Iniciar latido» a 75 lpm (ciclo de 0,8 s)
    // ESPERADO sístole ≈ 0,3 s y diástole ≈ 0,5 s: la FAQ de la propia app da 0,3 s de 0,857 s a
    //          70 lpm (35 %); Guyton y Hall, cap. 9, ~0,4 del ciclo a 72 lpm → fracción < 0,42
    // OBTENIDO sístole 400 ms y diástole 400 ms (setInterval de duracionMs/2): 50 % a cualquier lpm
    //          (medido 0,48-0,49 por el temblor del temporizador; el umbral deja ese margen)
    await seccionLatido(page).getByRole('button', { name: /latido/ }).click();
    const { sistole, diastole } = await medirFases(page, 4000);
    expect(sistole / (sistole + diastole)).toBeLessThan(0.42);
  });

  test('HALLAZGO ABIERTO [contenido/medio]: la interpretación del gasto contradice las tarjetas de referencia y la FAQ', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/medio]
    // ENTRADA  FC 100 × VS 80 = 8 L/min · FC 150 × VS 100 = 15 L/min · FC 100 × VS 70 = 7 L/min ·
    //          FC 150 × VS 120 = 18 L/min
    // ESPERADO el texto de interpretación dice lo mismo que la tarjeta de su cifra («~8 L/min
    //          Actividad ligera», «~15 L/min Ejercicio moderado»); 100 lpm y 70 ml, los dos en el rango
    //          normal que da la propia app («Normal (60-100 bpm)»; la FAQ: «normalmente 70 ml en
    //          reposo»), es reposo; y 18 L/min no es «solo atletas de élite» si la FAQ dice que
    //          «durante ejercicio intenso puede superar los 20-25 litros»
    // OBTENIDO 8 → «Actividad moderada»; 15 → «Ejercicio intenso»; 7 → «Actividad moderada — el
    //          corazón trabaja más para cubrir la demanda muscular»; 18 → «¡Esfuerzo máximo! Solo
    //          atletas de élite…»
    const lecturas: Record<string, boolean> = {};

    await fijarGasto(page, 100, 80);
    await expect(valorGasto(page)).toHaveText('8,0');
    const tarjeta8 = (await rotuloReferencia(page, '~8 L/min')).toLowerCase();
    lecturas['8 L/min coincide con su tarjeta'] = (await frasePorTramo(page)).toLowerCase().includes(tarjeta8);

    await fijarGasto(page, 150, 100);
    await expect(valorGasto(page)).toHaveText('15,0');
    const tarjeta15 = (await rotuloReferencia(page, '~15 L/min')).toLowerCase();
    lecturas['15 L/min coincide con su tarjeta'] = (await frasePorTramo(page)).toLowerCase().includes(tarjeta15);

    await fijarGasto(page, 100, 70);
    await expect(valorGasto(page)).toHaveText('7,0');
    lecturas['7 L/min con FC y VS normales es reposo'] = /reposo/i.test(await frasePorTramo(page));

    await fijarGasto(page, 150, 120);
    await expect(valorGasto(page)).toHaveText('18,0');
    const [faq] = await jsonLdDe(page, 'FAQPage');
    const faqIntenso = /ejercicio intenso puede superar los 20/.test(JSON.stringify(faq));
    const paginaElite = /Solo atletas de élite/.test(await frasePorTramo(page));
    lecturas['18 L/min: FAQ y página no se contradicen'] = !(faqIntenso && paginaElite);

    expect(lecturas).toEqual({
      '8 L/min coincide con su tarjeta': true,
      '15 L/min coincide con su tarjeta': true,
      '7 L/min con FC y VS normales es reposo': true,
      '18 L/min: FAQ y página no se contradicen': true,
    });
  });

  test.describe('con prefers-reduced-motion: reduce', () => {
    // Opción de CONTEXTO, no de lanzamiento: no fuerza un worker nuevo.
    test.use({ reducedMotion: 'reduce' });

    test('HALLAZGO ABIERTO [accesibilidad/medio]: el trazado ECG se mueve sin fin, sin pausa y con movimiento reducido', async ({ page }) => {
      test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [accesibilidad/medio]
      // ENTRADA  prefers-reduced-motion: reduce, cargar la página y esperar 300 ms
      // ESPERADO el trazado quieto, o un control para pausarlo (WCAG 2.2.2 «Pausar, detener, ocultar»,
      //          nivel A: movimiento que arranca solo, dura más de 5 s y va junto a otro contenido);
      //          el ❤️ sí respeta la preferencia (animation: none en @media)
      // OBTENIDO transform translate(0, 0) → translate(-66.675, 0) en 250 ms y 0 botones de pausa:
      //          el requestAnimationFrame no consulta la preferencia
      expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
      const g = page.getByRole('img', { name: 'Trazado ECG animado' }).locator('g');
      const t1 = await g.getAttribute('transform');
      await page.waitForTimeout(300);
      const t2 = await g.getAttribute('transform');
      const pausas = await seccionEcg(page).getByRole('button', { name: /paus|deten|parar/i }).count();
      expect(t1 === t2 || pausas > 0, `transform ${t1} → ${t2}, botones de pausa: ${pausas}`).toBe(true);
    });
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: los rótulos P, QRS y T no siguen al trazado que se desplaza', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/bajo]
    // ENTRADA  ritmo normal, 30 fotogramas en 1 s
    // ESPERADO el rótulo «QRS» sobre el pico R del trazado en todo momento (a menos de 4 % del ancho)
    // OBTENIDO rótulos en x fijas (80, 42, 133: «posición fija, referencial») y el trazado desplazándose
    //          de 0 a −200: la mayor parte del tiempo «QRS» cae sobre la línea de base o la onda T
    const img = page.getByRole('img', { name: 'Trazado ECG animado' });
    await img.scrollIntoViewIfNeeded();
    const desvios = await img.evaluate(
      (el) =>
        new Promise<number[]>((resolver) => {
          const svg = el.querySelector('svg') as SVGSVGElement;
          const ruta = el.querySelector('path') as SVGPathElement;
          const rotulo = Array.from(el.querySelectorAll('text')).find((t) => t.textContent === 'QRS') as SVGTextElement;
          const ancho = svg.getBoundingClientRect().width;
          const out: number[] = [];
          const paso = (): void => {
            const b = rotulo.getBoundingClientRect();
            const centro = (b.left + b.right) / 2;
            const ctm = ruta.getScreenCTM() as DOMMatrix;
            // picos R del trazado: los vértices más altos (y mínima) de la ruta
            const vertices = Array.from((ruta.getAttribute('d') ?? '').matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)).map((m) => [Number(m[1]), Number(m[2])]);
            const yMin = Math.min(...vertices.map((v) => v[1]));
            const picos = vertices.filter((v) => v[1] === yMin).map((v) => new DOMPoint(v[0], v[1]).matrixTransform(ctm).x);
            out.push(Math.min(...picos.map((x) => Math.abs(x - centro))) / ancho);
            if (out.length < 30) setTimeout(() => requestAnimationFrame(paso), 30);
            else resolver(out);
          };
          requestAnimationFrame(paso);
        }),
    );
    expect(Math.max(...desvios)).toBeLessThan(0.04);
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: el QRS del ritmo «normal» se dibuja con dos ondas R (forma RSR\')', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/bajo]
    // ENTRADA  la ruta del trazado, primer complejo (x de 0 a 200)
    // ESPERADO un solo pico R (Q, R y S: una deflexión positiva entre dos negativas)
    // OBTENIDO L70,50 L80,15 L85,80 L90,15 L100,50: dos picos de la misma altura (x = 80 y x = 90)
    //          separados por una S, la forma en «M» (rSR') de un bloqueo de rama, no la de un QRS normal
    const d = (await page.getByRole('img', { name: 'Trazado ECG animado' }).locator('path').getAttribute('d')) ?? '';
    const v = Array.from(d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g))
      .map((m) => [Number(m[1]), Number(m[2])])
      .filter(([x]) => x >= 0 && x < 200);
    const frecuencias = new Map<number, number>();
    for (const [, y] of v) frecuencias.set(y, (frecuencias.get(y) ?? 0) + 1);
    const base = [...frecuencias.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const alturaMax = Math.max(...v.map(([, y]) => base - y));
    const picosR = v.filter(([, y], i) => i > 0 && i < v.length - 1 && y < v[i - 1][1] && y < v[i + 1][1] && base - y > alturaMax / 2);
    expect(picosR).toHaveLength(1);
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: la escala del latido rotula «75 lpm (reposo)» donde el deslizador marca ~120', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/bajo]
    // ENTRADA  escala bajo el deslizador de 40 a 200 lpm
    // ESPERADO cada rótulo sobre su valor: 75 lpm cae al (75 − 40)/160 = 21,9 % del ancho
    // OBTENIDO «75 lpm (reposo)» centrado al 50,7 %, que en el deslizador es ~121 lpm
    const rotulos = await escalaDe(page, 'slider-bpm', 40, 200);
    expect(rotulos.map((r) => `${r.texto}: ${r.contiene}`)).toEqual(rotulos.map((r) => `${r.texto}: true`));
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: dos presiones confunden la arterial con la ventricular', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/bajo]
    // ENTRADA  guía educativa («Diástole») y ficha de la válvula pulmonar
    // ESPERADO en diástole el ventrículo baja a unos pocos mmHg: si estuviera a 80 mmHg la mitral no
    //          podría abrirse, y la propia ficha aórtica dice que se abre «cuando la presión ventricular
    //          supera 80 mmHg»; los 80 mmHg son la mínima de la AORTA. Y la pulmonar se abre al superar
    //          la diastólica de la arteria pulmonar (~8-10 mmHg), con el mismo criterio que la aórtica (80,
    //          la diastólica aórtica), no los 25 mmHg de la sistólica pulmonar
    // OBTENIDO «Es la presión mínima del corazón (~80 mmHg)» y «La presión requerida es menor (25 mmHg)
    //          que en la aórtica (80 mmHg)»
    await page.getByRole('button', { name: 'Ver información sobre Válvula Pulmonar' }).click();
    const ficha = await page.getByRole('region', { name: /Detalles de Válvula Pulmonar/ }).innerText();
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect({
      guia: /presión mínima del corazón \(~80/.test(guia),
      pulmonar: /requerida es menor \(25 mmHg\)/.test(ficha),
    }).toEqual({ guia: false, pulmonar: false });
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: «Semilular» y «Semilunares» en las tarjetas de las válvulas', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/bajo]
    // ENTRADA  tarjetas «Válvula Aórtica» y «Válvula Pulmonar»
    // ESPERADO «Semilunar (salida izquierda)» y «Semilunar (salida derecha)»
    // OBTENIDO «Semilular (salida izquierda)» (errata) y «Semilunares (salida derecha)» (plural)
    const aortica = await page.getByRole('button', { name: 'Ver información sobre Válvula Aórtica' }).innerText();
    const pulmonar = await page.getByRole('button', { name: 'Ver información sobre Válvula Pulmonar' }).innerText();
    expect([aortica.includes('Semilunar (salida izquierda)'), pulmonar.includes('Semilunar (salida derecha)')]).toEqual([true, true]);
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: miles sin punto, «%» pegado y «bpm» junto a «lpm»', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/bajo]
    // ENTRADA  FC 200 × VS 130, y los botones de ritmo del ECG
    // ESPERADO «26.000 ml/min», «100 % del máximo referencial» con espacio duro (CLAUDE.md global §2)
    //          y la misma unidad que el resto de la app («lpm»)
    // OBTENIDO «GC = 200 lpm × 130 ml = 26000 ml/min», «100% del máximo referencial» y
    //          «Normal (60-100 bpm)», «Taquicardia (>100 bpm)», «Bradicardia (<60 bpm)»
    await fijarGasto(page, 200, 130);
    await expect(valorGasto(page)).toHaveText('26,0');
    const formula = await seccionGasto(page).getByText(/^GC = \d/).innerText();
    const pct = await seccionGasto(page).getByText(/del máximo referencial/).innerText();
    const ritmos = await seccionEcg(page).getByRole('group', { name: 'Tipo de ritmo cardíaco' }).innerText();
    expect({ formula: formula.includes('26.000 ml/min'), pct: pct.startsWith('100 %'), bpm: /bpm/.test(ritmos) }).toEqual({
      formula: true,
      pct: true,
      bpm: false,
    });
  });

  test('HALLAZGO ABIERTO [accesibilidad/bajo]: la barra se anuncia con punto decimal y por encima de su máximo; el botón de latido cambia de nombre y de estado a la vez', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [accesibilidad/bajo]
    // ENTRADA  estado inicial (75 × 70); FC 200 × VS 130; pulsar «Iniciar latido»
    // ESPERADO nombre «… 5,25 de 25 L/min»; aria-valuenow ≤ aria-valuemax; un conmutador con
    //          aria-pressed conserva su nombre (WAI-ARIA APG, Button) o lo cambia sin aria-pressed
    // OBTENIDO «Gasto cardíaco: 5.25 de 25 L/min»; aria-valuenow 26 con aria-valuemax 25; «Pausar latido»
    //          con aria-pressed="true" (el lector dice «Pausar latido, pulsado»)
    const barra = seccionGasto(page).getByRole('progressbar');
    const nombre = (await barra.getAttribute('aria-label')) ?? '';
    await fijarGasto(page, 200, 130);
    await expect(valorGasto(page)).toHaveText('26,0');
    const ahora = Number(await barra.getAttribute('aria-valuenow'));
    const tope = Number(await barra.getAttribute('aria-valuemax'));
    const boton = seccionLatido(page).getByRole('button', { name: /latido/ });
    const antes = await boton.getAttribute('aria-label');
    await boton.click();
    const despues = await boton.getAttribute('aria-label');
    const pulsado = await boton.getAttribute('aria-pressed');
    expect({
      decimal: nombre.includes('5,25'),
      dentroDelRango: ahora <= tope,
      conmutador: pulsado === null || antes === despues,
    }).toEqual({ decimal: true, dentroDelRango: true, conmutador: true });
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: el JSON-LD no declara ninguna característica', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 14/11/2026) [contenido/bajo]
    // ENTRADA  WebApplication.featureList
    // ESPERADO 4-8 características que la app hace (CLAUDE.md §1.ter)
    // OBTENIDO «featureList»: []
    const [app] = await jsonLdDe(page, 'WebApplication');
    expect((app.featureList as unknown[] | undefined)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });
});
