import { test, expect, devices, type Page } from '@playwright/test';
import { calcularResultado, PREGUNTAS, UMBRAL } from '../../app/selector-alquiler-vs-compra/motor';
import { calcularITP, calcularNotario, calcularRegistro, ITP_CCAA, type ComunidadAutonoma } from '../../data/itp-ccaa';

/**
 * ¿Alquilar o comprar? (selector-alquiler-vs-compra) — reparado el 24/09/2026 desde una
 * sospecha del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra pintaba (paso + 1) / 10 y anunciaba aria-valuenow = paso + 1 con MÍNIMO 1: en
 *     la pregunta 1, un décimo de barra pintado y 0 % anunciado; en la 2, 0,2 frente a 0,111.
 *   · No hay empates que deshacer: es UNA puntuación contra dos umbrales (±8).
 *   · Razones fijas por veredicto: en 33.798 perfiles salía «comprar» con «Contrato temporal o
 *     en transición» o «Autónomo reciente», y la app decía «Tu estabilidad laboral y
 *     permanencia prevista justifican la inversión».
 *
 * EL MOTOR (app/selector-alquiler-vs-compra/motor.ts): mismas preguntas, puntos y umbrales
 * (el veredicto no cambia en ninguna de las 1.048.576 combinaciones). Las razones citan las
 * respuestas que más empujan hacia el veredicto y, aparte, las que empujan en contra, con la
 * puntuación y los umbrales a la vista.
 *
 * DESDE LA INSPECCIÓN DEL 24/09/2026 (hallazgos 1459-1461) el veredicto SÍ cambia en 53.688
 * perfiles: con un ahorro por debajo del 20 % o menos de 3 años de plazo, «comprar» pasa a
 * «esperar» y el resultado dice por qué (ver `LIMITES` en el motor).
 */

async function esperarHidratacionBotones(page: Page): Promise<void> {
  // Sin <input> no hay rastreador que sondear (`_hidratacion.ts`): el testigo es que React
  // haya colgado sus props del botón de inicio. Mismo criterio que selector-smartphone.
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) => /Empezar el test/.test(b.textContent ?? ''));
      if (!boton) return false;
      return Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function abrirTest(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-alquiler-vs-compra/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu resultado' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Indefinidamente (+4) · Contrato TEMPORAL (−3) · Más del 30 % (+4) · Muy improbable
// cambiar de ciudad (+3) · Con hijos (+3) · Compra más razonable (+3) · Hipoteca como
// instrumento (+3) · Sin cargas (+3) · Tengo margen (+2) · Patrimonio (+3) = +25 → comprar.
// Antes: «Tu estabilidad laboral y permanencia prevista justifican la inversión».
const COMPRA_CON_CONTRATO_TEMPORAL = [3, 1, 3, 2, 2, 0, 2, 0, 2, 0] as const;

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(3).click();
  await expect(grupo.locator('[role="radio"]').nth(3)).toHaveAttribute('aria-checked', 'true');
  await grupo.locator('[role="radio"]').nth(0).click();
  await expect(grupo.locator('[role="radio"]').nth(0)).toHaveAttribute('aria-checked', 'true');
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
});

test('la barra de progreso anuncia lo mismo que pinta', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  for (let paso = 0; paso < 3; paso++) {
    const [ahora, min, max] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
    );
    const anunciado = (ahora - min) / (max - min);
    // Esta app pinta la pregunta EN CURSO (1/10 ya en la primera); lo anunciado la sigue.
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo((paso + 1) / 10, 6);
    const pedido = Number(await page.locator('[class*="progresoRelleno"]').getAttribute('data-progreso')) / 100;
    expect(anunciado).toBeCloseTo(pedido, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await expect(barra).toHaveAttribute('aria-valuetext', `Pregunta ${paso + 1} de 10`);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('las razones salen de las respuestas: con contrato temporal no se alaba la estabilidad laboral', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, COMPRA_CON_CONTRATO_TEMPORAL);
  expect(texto).toContain('Tu situación apunta a comprar');
  expect(texto).not.toContain('Tu estabilidad laboral y permanencia prevista justifican la inversión');
  expect(texto).not.toContain('Los factores clave — estabilidad laboral');
  expect(texto).toContain('Tu puntuación total es +25: a partir de +8 la orientación es comprar, hasta −8 alquilar');
  // Lo que más empuja a comprar: los dos +4 y el primer +3, por orden de pregunta.
  expect(texto).toContain('Horizonte Temporal: «Indefinidamente» suma 4 puntos hacia la compra.');
  expect(texto).toContain('Capacidad de Entrada: «Más del 30%» suma 4 puntos hacia la compra.');
  expect(texto).toContain('Flexibilidad Geográfica: «Muy improbable, estoy arraigado/a» suma 3 puntos hacia la compra.');
  // Y el contrato temporal aparece donde debe: en sentido contrario.
  expect(texto).toMatch(/Lo que apunta en sentido contrario/i); // el título va en mayúsculas por CSS
  expect(texto).toContain('Estabilidad Laboral: «Contrato temporal o en transición» resta 3 puntos: empuja hacia seguir de alquiler.');
});

test('motor: las razones van en la dirección del veredicto y citan lo respondido', () => {
  test.setTimeout(180_000);
  const r: Record<string, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  let total = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      // Reescrito el 24/09/2026: este esperado era el umbral puro, y consagraba el defecto de los
      // hallazgos 1459 y 1460 («comprar» con menos del 10 % ahorrado o menos de 3 años de plazo).
      // Ahora, si la puntuación da «comprar» con un ahorro por debajo del 20 % o un horizonte de
      // menos de 3 años, el veredicto es «esperar».
      const porPuntos = res.puntuacion >= UMBRAL ? 'compra' : res.puntuacion <= -UMBRAL ? 'alquila' : 'espera';
      const conLimite = ['bajo', 'justo'].includes(r.ahorro) || r.horizonte === 'corto';
      const esperado = porPuntos === 'compra' && conLimite ? 'espera' : porPuntos;
      if (res.veredicto !== esperado) mal('veredicto fuera de umbral');
      if (res.veredicto !== 'espera' && res.razones.length === 0) mal('veredicto sin razones');
      const aFavor = res.veredicto === 'alquila' ? 'resta' : 'suma';
      const enContra = aFavor === 'suma' ? 'resta' : 'suma';
      if (res.razones.some((x) => !x.includes(` ${aFavor} `))) mal('una razón empuja en contra');
      if (res.contrapeso.some((x) => !x.includes(` ${enContra} `))) mal('un contrapeso empuja a favor');
      for (const x of [...res.razones, ...res.contrapeso]) {
        const citada = x.match(/«([^»]+)»/)?.[1];
        if (!PREGUNTAS.some((p) => p.opciones.some((o) => o.etiqueta === citada && r[p.id] === o.valor))) mal(`cita «${citada}», no respondida`);
      }
      return;
    }
    for (const o of PREGUNTAS[i].opciones) {
      r[PREGUNTAS[i].id] = o.valor;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(total).toBe(1_048_576);
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// Inspección 24/09/2026 (primera del Inspector). Casos resueltos a mano ANTES de ejecutar, con
// los pesos de motor.ts: se suman las 10 respuestas y se compara con ±8.
//
// Las cifras normativas se contrastan con data/itp-ccaa.ts y data/fiscal, nunca de memoria.
// Los 14 hallazgos (1459-1472) se repararon el mismo día: sus test.fail() pasaron a exigir la
// reparación (al final del describe).
// ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('Inspección 24/09/2026 — restricciones declaradas, cifras de la guía y la FAQ, contraste', () => {
  type Rgba = { r: number; g: number; b: number; a: number };
  type Respuestas = Record<string, string>;

  /** Responde por la ETIQUETA literal de cada opción, como lo repetiría una persona. */
  async function responderEtiquetas(page: Page, etiquetas: readonly string[]): Promise<void> {
    for (let i = 0; i < etiquetas.length; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]', { has: page.getByText(etiquetas[i], { exact: true }) }).click();
      await page.getByRole('button', { name: i === etiquetas.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
    }
    await page.getByRole('heading', { name: 'Tu resultado' }).waitFor();
  }

  /** La pantalla de resultado, sin la guía (que está plegada) ni el aviso final. */
  async function textoResultado(page: Page): Promise<string> {
    const todo = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
    const corte = todo.indexOf('Alquilar (arrendar) vs Comprar: lo que nadie te cuenta');
    return corte > 0 ? todo.slice(0, corte) : todo;
  }

  /** Lo que leen los buscadores y las IA: el FAQPage servido. */
  async function faqServido(page: Page): Promise<string> {
    type Pregunta = { name: string; acceptedAnswer: { text: string } };
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques
      .map((b) => JSON.parse(b) as { '@type'?: string; mainEntity?: Pregunta[] })
      .find((j) => j['@type'] === 'FAQPage');
    return (faq?.mainEntity ?? []).map((q) => `${q.name} ${q.acceptedAnswer.text}`).join(' ');
  }

  async function guiaDesplegada(page: Page): Promise<string> {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
  }

  /** Recorre las 1.048.576 combinaciones con el motor real y cuenta las que cumplen `pred`. */
  function contar(pred: (r: Respuestas, veredicto: string) => boolean): number {
    const r: Respuestas = {};
    let n = 0;
    const rec = (i: number): void => {
      if (i === PREGUNTAS.length) {
        if (pred(r, calcularResultado(r).veredicto)) n++;
        return;
      }
      for (const o of PREGUNTAS[i].opciones) {
        r[PREGUNTAS[i].id] = o.valor;
        rec(i + 1);
      }
    };
    rec(0);
    return n;
  }

  /**
   * Contraste WCAG con los colores COMPUTADOS y el fondo compuesto real (capas rgba de los
   * antepasados; si hay un degradado de 135°, el peor punto bajo la extensión del texto).
   */
  async function contraste(page: Page, selector: string): Promise<number> {
    return page.locator(selector).first().evaluate((el) => {
      type C = { r: number; g: number; b: number; a: number };
      const parse = (s: string): C | null => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const sobre = (fg: C, bg: C): C => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1,
      });
      const lum = (c: C) => {
        const f = (v: number) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
      };
      const ratio = (a: C, b: C) => {
        const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
        return (x + 0.05) / (y + 0.05);
      };
      const cs = getComputedStyle(el);
      const color = parse(cs.color) ?? { r: 0, g: 0, b: 0, a: 1 };
      const texto: C = { ...color, a: color.a * Number(cs.opacity) };
      for (let e: Element | null = el; e; e = e.parentElement) {
        const img = getComputedStyle(e).backgroundImage;
        if (img.includes('linear-gradient(135deg')) {
          const paradas = [...img.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0]) ?? { r: 0, g: 0, b: 0, a: 1 });
          const caja = e.getBoundingClientRect();
          const L = (caja.width + caja.height) * Math.SQRT1_2;
          const cx = caja.left + caja.width / 2;
          const cy = caja.top + caja.height / 2;
          const en = (x: number, y: number): C => {
            const u = Math.min(1, Math.max(0, 0.5 + ((x - cx) + (y - cy)) * Math.SQRT1_2 / L));
            return {
              r: paradas[0].r + (paradas[1].r - paradas[0].r) * u,
              g: paradas[0].g + (paradas[1].g - paradas[0].g) * u,
              b: paradas[0].b + (paradas[1].b - paradas[0].b) * u,
              a: 1,
            };
          };
          const rango = document.createRange();
          rango.selectNodeContents(el);
          let peor = Infinity;
          for (const t of Array.from(rango.getClientRects())) {
            for (const [x, y] of [[t.left, t.top], [t.right, t.top], [t.left, t.bottom], [t.right, t.bottom]]) {
              const fondo = en(x, y);
              peor = Math.min(peor, ratio(sobre(texto, fondo), fondo));
            }
          }
          return peor;
        }
        if (e === document.body) break;
      }
      const capas: C[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c && c.a > 0) {
          capas.push(c);
          if (c.a >= 1) break;
        }
      }
      let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
      return ratio(sobre(texto, fondo), fondo);
    });
  }

  /** Con el conmutador REAL, y comprobando que el oscuro se aplica de verdad (fondo incluido). */
  async function temaOscuro(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(26, 26, 26)');
  }

  // ─ Perfiles, con la suma hecha a mano ─

  // +3 +4 +2 +3 +1 0 +1 +1 0 +2 = +17 → comprar. Sin ninguna respuesta negativa: no hay contrapeso.
  const NORMAL = ['Más de 7 años', 'Contrato indefinido o funcionario', 'Entre el 20% y el 30%', 'Muy improbable, estoy arraigado/a', 'En pareja, sin hijos aún', 'Equilibrado, sin grandes diferencias', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Me generaría pérdidas asumibles', 'Estabilidad y echar raíces'] as const;
  // +3 +4 +2 −1 −2 0 +1 +1 0 0 = +8 → comprar (el umbral incluye el +8).
  // Reescrito el 24/09/2026: el perfil del umbral llevaba «Entre el 10% y el 20%», que desde la
  // reparación de los hallazgos 1459-1461 es un límite (no llega a la entrada) y da «esperar»;
  // ese caso vive ahora en MAS_8_SIN_ENTRADA. Este cambia el ahorro a «Entre el 20% y el 30%»
  // (+3) y la situación personal a «En transición» (−3) para seguir sumando +8.
  const MAS_8 = ['Más de 7 años', 'Contrato indefinido o funcionario', 'Entre el 20% y el 30%', 'No descarto que ocurra', 'En transición (separación, nido vacío...)', 'Equilibrado, sin grandes diferencias', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Me generaría pérdidas asumibles', 'Optimizar el gasto mensual'] as const;
  // +4 +2 −1 −1 +1 0 +1 +1 0 0 = +7 → esperar.
  const MAS_7 = ['Indefinidamente', 'Autónomo consolidado (+3 años)', 'Entre el 10% y el 20%', 'No descarto que ocurra', 'En pareja, sin hijos aún', 'Equilibrado, sin grandes diferencias', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Me generaría pérdidas asumibles', 'Optimizar el gasto mensual'] as const;
  // −4 −3 −1 −1 −1 0 +1 +1 0 0 = −8 → alquilar.
  const MENOS_8 = ['Menos de 3 años', 'Contrato temporal o en transición', 'Entre el 10% y el 20%', 'No descarto que ocurra', 'Vivo solo/a, sin planes inmediatos', 'Equilibrado, sin grandes diferencias', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Me generaría pérdidas asumibles', 'Optimizar el gasto mensual'] as const;
  // +4 +4 −4 +3 +3 +3 +1 +1 −3 +2 = +14 → la app dice comprar a quien tiene MENOS DEL 10 % ahorrado
  // («Entrada insuficiente en la mayoría de casos», según la propia opción) y para quien vender
  // en 3-4 años «Sería un problema grave».
  const SIN_AHORRO = ['Indefinidamente', 'Contrato indefinido o funcionario', 'Menos del 10% del precio buscado', 'Muy improbable, estoy arraigado/a', 'Con hijos o planificándolos', 'Alquiler caro, compra más razonable', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Sería un problema grave', 'Estabilidad y echar raíces'] as const;
  // −4 +4 +4 +1 +3 +3 +3 +3 +2 +3 = +22 → comprar, con MENOS DE 3 AÑOS en la ciudad.
  const HORIZONTE_CORTO = ['Menos de 3 años', 'Contrato indefinido o funcionario', 'Más del 30%', 'Trabajo en remoto, tengo libertad total', 'Con hijos o planificándolos', 'Alquiler caro, compra más razonable', 'La veo como un instrumento financiero que estoy dispuesto a usar', 'No, situación económica despejada', 'Tengo margen, no me preocupa', 'Construir patrimonio a largo plazo'] as const;
  // −4 −3 +4 −4 −1 −3 −3 +3 −2 −3 = −16 → alquilar, con MÁS DEL 30 % ahorrado.
  const ALQUILA_CON_AHORRO = ['Menos de 3 años', 'Contrato temporal o en transición', 'Más del 30%', 'Sí, es bastante probable', 'Vivo solo/a, sin planes inmediatos', 'Compra muy cara, alquiler razonable', 'Me incomoda asumir una deuda grande y prolongada', 'No, situación económica despejada', 'No quiero asumir ese riesgo en ningún caso', 'Flexibilidad y libertad de movimiento'] as const;

  // ─ Lo que está bien ─

  test('caso normal: +17, comprar, las tres razones de más peso y sin contrapeso', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const texto = await textoResultado(page);
    expect(texto).toContain('Tu situación apunta a comprar');
    expect(texto).toContain('Tu puntuación total es +17');
    expect(texto).toContain('Estabilidad Laboral: «Contrato indefinido o funcionario» suma 4 puntos hacia la compra.');
    expect(texto).toContain('Horizonte Temporal: «Más de 7 años» suma 3 puntos hacia la compra.');
    expect(texto).toContain('Flexibilidad Geográfica: «Muy improbable, estoy arraigado/a» suma 3 puntos hacia la compra.');
    // Ninguna respuesta resta: la sección de contrapeso no se monta.
    expect(texto).not.toMatch(/Lo que apunta en sentido contrario/i);
  });

  test('umbrales: +8 es comprar, +7 esperar y −8 alquilar', async ({ page }) => {
    const casos: [readonly string[], string, string][] = [
      [MAS_8, '+8', 'Tu situación apunta a comprar'],
      [MAS_7, '+7', 'Espera antes de decidir'],
      [MENOS_8, '−8', 'Por ahora, mejor alquilar'],
    ];
    for (const [perfil, puntos, titulo] of casos) {
      await abrirTest(page);
      await responderEtiquetas(page, perfil);
      const texto = await textoResultado(page);
      expect(texto, puntos).toContain(`Tu puntuación total es ${puntos}:`);
      expect(texto, puntos).toContain(titulo);
    }
  });

  test('sin respuesta no se avanza, y «Anterior» conserva lo marcado', async ({ page }) => {
    await abrirTest(page);
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Pregunta anterior' })).toBeDisabled();
    await page.locator('[role="radio"]', { has: page.getByText('Más de 7 años', { exact: true }) }).click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
    await page.getByRole('button', { name: 'Pregunta anterior' }).click();
    await expect(page.locator('[role="radio"]', { has: page.getByText('Más de 7 años', { exact: true }) })).toHaveAttribute('aria-checked', 'true');
  });

  test('tema oscuro: los textos de marca y el veredicto pasan el contraste', async ({ page }) => {
    await abrirTest(page);
    await temaOscuro(page);
    // Medido el 24/09/2026: 6,23 · veredicto «espera» 6,22 · razonesTitulo 5,86 · btnRepetir 6,23.
    expect(await contraste(page, '[class*="progresoPaso"]')).toBeGreaterThanOrEqual(4.5);
    await responderEtiquetas(page, MAS_7);
    expect(await contraste(page, '[class*="veredictoValor"]')).toBeGreaterThanOrEqual(3); // 24 px en negrita
    expect(await contraste(page, '[class*="razonesTitulo"]')).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="btnRepetir"]')).toBeGreaterThanOrEqual(4.5);
  });

  // ─ Hallazgos reparados el 24/09/2026 ─
  // Eran test.fail() que documentaban el defecto; ahora exigen la reparación, con el texto
  // esperado entero. Las cifras de gastos se calcularon a mano con data/itp-ccaa y el precio de
  // 200.000 €: notaría 758,98 € + registro 236,22 € = 0,498 % del precio;
  //   usada:  Ceuta y Melilla 6 % con la bonificación del 50 % (art. 57 bis TRLITPAJD) = 3 % → 3,5 %;
  //           Cataluña 10 % → 10,5 %.
  //   nueva:  IVA 10 % + AJD de la vivienda habitual: País Vasco 0 % → 10,5 %; 1,5 % → 12 %.
  //   ahorro para una usada: 20 % + 3,498 % = 46.995 € ≈ 47.000 €; 20 % + 10,498 % ≈ 61.000 €.
  // Si data/itp-ccaa cambia un tipo, estos literales se ponen en rojo: es el aviso de que la guía
  // y la FAQ publican otra cifra, y hay que recalcularlos a mano.
  const FRASE_GASTOS_HOY =
    'con los tipos generales de cada comunidad (sin reducciones por colectivo), los impuestos, la notaría y el registro de una vivienda de 200.000 € suman del 3,5 % (Ceuta y Melilla) al 10,5 % (Cataluña) del precio si es usada, y del 10,5 % al 12 % si es nueva';

  // +3 +4 −1 −1 +1 0 +1 +1 0 0 = +8, con «Entre el 10% y el 20%»: era el perfil del umbral +8.
  // Ahora el ahorro no llega a la entrada y «comprar» no puede salir (hallazgo 1461 + familia a).
  const MAS_8_SIN_ENTRADA = ['Más de 7 años', 'Contrato indefinido o funcionario', 'Entre el 10% y el 20%', 'No descarto que ocurra', 'En pareja, sin hijos aún', 'Equilibrado, sin grandes diferencias', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Me generaría pérdidas asumibles', 'Optimizar el gasto mensual'] as const;

  const aviso = (page: Page, id: string) => page.locator(`[data-limite="${id}"]`);
  /** El texto del aviso sin el icono decorativo (⚠️, aria-hidden) que lo encabeza. */
  const textoAviso = async (page: Page, id: string): Promise<string> =>
    (await aviso(page, id).innerText()).replace(/^⚠️\s*/, '').replace(/\s+/g, ' ');
  const proximos = async (page: Page): Promise<string[]> => page.locator('[class*="proximoItem"]').allInnerTexts();

  test('1459 «Menos del 10 %» ahorrado: no sale «comprar», y el aviso explica la entrada, los gastos y el aval ICO', async ({ page }) => {
    // SIN_AHORRO: +14 por puntos → antes «Tu situación apunta a comprar». Ahora «esperar» con el
    // aviso. Financiación: «normalmente, hasta un máximo del 80 %» del valor de tasación (Banco de
    // España, Portal del Cliente Bancario, 12/03/2024). Aval: data/fiscal/ayudas-personas.ts.
    await abrirTest(page);
    await responderEtiquetas(page, SIN_AHORRO);
    const texto = await textoResultado(page);
    expect(texto).not.toContain('Tu situación apunta a comprar');
    await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Espera antes de decidir');
    await expect(page.locator('[class*="veredictoDesc"]')).toHaveText(
      'Por puntuación, tus respuestas apuntarían a comprar, pero has declarado algo que ninguna otra respuesta compensa: mientras siga así, comprar no sale como recomendación. Justo debajo tienes qué es y qué puedes hacer.',
    );
    expect(await textoAviso(page, 'ahorro')).toBe(
      `Has declarado un ahorro de «Menos del 10% del precio buscado». El banco suele financiar como máximo el 80 % del valor de tasación (según el Banco de España), así que la entrada —el 20 %— y los gastos de compra salen del ahorro. En España, ${FRASE_GASTOS_HOY}. Con menos del 20 % no se llega ni a la entrada. La vía que existe para ese hueco es el Aval ICO para primera vivienda: Aval del Estado que cubre parte de la entrada de la hipoteca para facilitar el acceso a la primera vivienda a jóvenes y familias con hijos menores, sin necesidad de ahorrar el 20% inicial. Comprueba si cumples sus requisitos.`,
    );
    await expect(aviso(page, 'ahorro').getByRole('link', { name: 'Comprueba si cumples sus requisitos' })).toHaveAttribute('href', '/orientador-aval-ico/');
    expect(texto).toContain('Tu puntuación total es +14: a partir de +8 la orientación es comprar, hasta −8 alquilar, y entre medias, esperar. Aquí pasa de ese umbral, pero lo que has declarado arriba impide recomendar la compra.');
    expect(await proximos(page)).toEqual([
      'Calcula cuánto te falta: la entrada que el banco no financia más los gastos de compra de tu comunidad',
      'Comprueba si cumples los requisitos del aval ICO para la primera vivienda',
      'Compara con la calculadora de alquiler vs compra cuando tengas datos concretos',
    ]);
  });

  test('familia a: ningún perfil con el ahorro bajo el 20 % o menos de 3 años de plazo sale en «comprar»', () => {
    // Barrido del motor real. Antes salían en «comprar» 13.620 perfiles con «Menos del 10 %»,
    // 29.472 con «Entre el 10% y el 20%» y 12.340 con «Menos de 3 años» (actas 1459-1461); hoy
    // son 53.688 perfiles distintos (1.744 cumplen dos límites a la vez) y los 53.688 salen en
    // «esperar» con su aviso.
    test.setTimeout(90_000);
    let violan = 0;
    let limitados = 0;
    let sinAviso = 0;
    contar((r, v) => {
      const res = calcularResultado(r);
      const conLimite = ['bajo', 'justo'].includes(r.ahorro) || r.horizonte === 'corto';
      if (conLimite && v === 'compra') violan++;
      if (res.limitado) {
        limitados++;
        if (res.veredictoPorPuntos !== 'compra' || res.veredicto !== 'espera' || res.limites.length === 0) sinAviso++;
      }
      return false;
    });
    expect({ violan, limitados, sinAviso }).toEqual({ violan: 0, limitados: 53_688, sinAviso: 0 });
  });

  test('1460 «Menos de 3 años» en la ciudad: no sale «comprar», y el aviso dice por qué', async ({ page }) => {
    // HORIZONTE_CORTO: +22 por puntos. Con menos de 3 años los gastos de compra (del 3,5 % al
    // 10,5 % en una usada) no se recuperan salvo revalorización o un ahorro de alquiler que no se
    // puede dar por hecho: lo que ya decía la guía de la propia app.
    await abrirTest(page);
    await responderEtiquetas(page, HORIZONTE_CORTO);
    await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Espera antes de decidir');
    expect(await textoAviso(page, 'horizonte')).toBe(
      'Has declarado que prevés quedarte «Menos de 3 años». Los gastos de compra no se recuperan al vender (del 3,5 % (Ceuta y Melilla) al 10,5 % (Cataluña) del precio solo en impuestos, notaría y registro de una vivienda usada, más los de la venta), y en tan poco tiempo solo compensan si la vivienda se revaloriza o si el alquiler que te ahorras supera con creces lo que cuesta ser propietario: ninguna de las dos cosas se puede dar por hecha.',
    );
    await expect(aviso(page, 'ahorro')).toHaveCount(0); // «Más del 30%»: el ahorro no es el límite
    expect(await proximos(page)).toEqual([
      'Repite el test cuando sepas si vas a quedarte más de 3 años en la zona',
      'Compara con la calculadora de alquiler vs compra cuando tengas datos concretos',
    ]);
  });

  test('1461 la escala del ahorro cuadra con la FAQ: del 10 al 20 % ya no es «Lo mínimo», y el +8 que se queda corto no sale «comprar»', async ({ page }) => {
    await abrirTest(page);
    const faq = await faqServido(page);
    expect(faq).not.toContain('necesitarías disponer de entre 60.000 y 70.000 € en ahorros');
    for (const etiqueta of ['Más de 7 años', 'Contrato indefinido o funcionario']) {
      await page.locator('[role="radio"]', { has: page.getByText(etiqueta, { exact: true }) }).click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await page.getByText('¿Cuánto ahorro tienes disponible para la entrada y gastos?').waitFor();
    expect(await page.locator('[role="radio"] [class*="opcionDesc"]').allInnerTexts()).toEqual([
      'No llega a la entrada que el banco no suele financiar',
      'Todavía no cubre la entrada y los gastos sin aval ni ayuda',
      'Cubre la entrada; los gastos, según la comunidad y la vivienda',
      'Cubre la entrada y los gastos en la mayoría de casos',
    ]);
    // El antiguo perfil del umbral +8 tenía entre el 10 y el 20 %: ahora es «esperar», con aviso.
    await abrirTest(page);
    await responderEtiquetas(page, MAS_8_SIN_ENTRADA);
    const texto = await textoResultado(page);
    expect(texto).toContain('Tu puntuación total es +8:');
    await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Espera antes de decidir');
    expect(await textoAviso(page, 'ahorro')).toContain('Has declarado un ahorro de «Entre el 10% y el 20%».');
  });

  test('1462 los gastos de compra de la guía y la FAQ salen de data/itp-ccaa, no de un «10-15 %» a mano', async ({ page }) => {
    // Comprobación independiente de ./cifras.ts: se recalcula aquí con el motor de compraventa.
    const precio = 200_000;
    const usada = (Object.keys(ITP_CCAA) as ComunidadAutonoma[]).map(
      (c) => (calcularITP(precio, c, 'vivienda') + calcularNotario(precio) + calcularRegistro(precio)) / precio,
    );
    expect(Math.round(Math.min(...usada) * 1000) / 10).toBe(3.5);
    expect(Math.round(Math.max(...usada) * 1000) / 10).toBe(10.5);
    await abrirTest(page);
    const faq = await faqServido(page);
    expect(faq).not.toMatch(/10% y (el )?15%/);
    expect(faq).toContain(`En cuanto a los gastos, en España, ${FRASE_GASTOS_HOY}. Para una vivienda usada de 200.000 €, eso supone reunir entre 47.000 € y 61.000 €, según la comunidad.`);
    await responderEtiquetas(page, NORMAL);
    const guia = await guiaDesplegada(page);
    expect(guia).not.toMatch(/10% y (un )?15%/);
    expect(guia).toContain(`pero los gastos no: en España, ${FRASE_GASTOS_HOY}.`);
  });

  test('1463 la guía y la FAQ dicen lo mismo del plazo, sin horquillas sin fuente', async ({ page }) => {
    const SIN_PLAZO = 'No hay un número de años que valga para todos: depende de los gastos de compra y de venta, de lo que cueste el alquiler frente a ser propietario y de cómo evolucionen los precios.';
    const DEL_TEST = 'Este test trata un horizonte de «Menos de 3 años» como un límite (con él no recomienda comprar, digan lo que digan las demás respuestas) y uno de «Más de 7 años» o «Indefinidamente» como un factor a favor.';
    await abrirTest(page);
    const faq = await faqServido(page);
    await responderEtiquetas(page, NORMAL);
    const guia = await guiaDesplegada(page);
    for (const [donde, t] of [['FAQ', faq], ['guía', guia]] as const) {
      expect(t, donde).toContain(`${SIN_PLAZO}`);
      expect(t, donde).toContain(DEL_TEST);
      expect(t, donde).not.toMatch(/5 y 8 años|7 a 12 años|7-10 años|próximos 5 años|estudios sobre el mercado/);
    }
  });

  test('1464 tema claro: el título del veredicto se lee en los tres casos', async ({ page }) => {
    // Esperar #9A6200 = 5,1:1 sobre la tarjeta blanca (era #e8a020, 2,22) · alquilar
    // --secondary-texto #327874 = 5,15 (era --secondary, 2,80) · comprar --primary-texto 5,47.
    const casos: [readonly string[], string, number][] = [
      [MAS_7, 'Espera antes de decidir', 5.1],
      [MENOS_8, 'Por ahora, mejor alquilar', 5.15],
      [NORMAL, 'Tu situación apunta a comprar', 5.47],
    ];
    for (const [perfil, titulo, esperado] of casos) {
      await abrirTest(page);
      await responderEtiquetas(page, perfil);
      await expect(page.locator('[class*="veredictoValor"]')).toHaveText(titulo);
      expect(await contraste(page, '[class*="veredictoValor"]'), titulo).toBeCloseTo(esperado, 1);
    }
  });

  test('1465 los próximos pasos no piden ahorrar para la entrada a quien ya la tiene', async ({ page }) => {
    // ALQUILA_CON_AHORRO: −16, «alquilar», con «Más del 30%».
    await abrirTest(page);
    await responderEtiquetas(page, ALQUILA_CON_AHORRO);
    await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Por ahora, mejor alquilar');
    expect(await proximos(page)).toEqual([
      'Define un plazo en el que revisarás esta decisión (1-2 años)',
      'Tu ahorro ya alcanza la entrada: lo que inclina el resultado hacia el alquiler son otros factores',
      'Sigue el mercado de tu zona sin prisas',
      'Compara con la calculadora de alquiler vs compra cuando tengas datos concretos',
    ]);
    // Barrido: ningún perfil con el 20 % o más recibe un paso que le pida ahorrar para la entrada
    // (antes: 20.585 con «Más del 30%» y 33.027 con «Entre el 20% y el 30%» en «alquilar»).
    test.setTimeout(90_000);
    const n = contar((r) =>
      ['suficiente', 'holgado'].includes(r.ahorro) &&
      calcularResultado(r).proximosPasos.some((p) => /objetivo de ahorro|ahorra para la entrada/.test(p)),
    );
    expect(n).toBe(0);
  });

  test('1466 la FAQ da el peso de los intereses con un ejemplo calculado, no «30-50 % del capital en los primeros años»', async ({ page }) => {
    // Sistema francés, 200.000 € al 3 % a 30 años, calculado aquí aparte: cuota 843,21 €;
    // intereses del primer año 5.942,90 € sobre 10.118,50 € pagados = 58,7 %; intereses totales
    // 843,2081 × 360 − 200.000 = 103.554,90 €.
    const i = 0.03 / 12;
    const cuota = (200_000 * i) / (1 - (1 + i) ** -360);
    expect(cuota).toBeCloseTo(843.21, 2);
    expect(cuota * 360 - 200_000).toBeCloseTo(103_554.9, 0);
    await abrirTest(page);
    const faq = await faqServido(page);
    expect(faq).not.toContain('30-50%');
    expect(faq).toContain('los intereses de la hipoteca (por ejemplo, con 200.000 € al 3 % a 30 años, el 58,7 % de lo que se paga el primer año son intereses, y en toda la vida del préstamo suman unos 103.555 €)');
  });

  test('1467 la FAQ de ahorros nombra el aval ICO de data/fiscal', async ({ page }) => {
    await abrirTest(page);
    const faq = await faqServido(page);
    expect(faq).not.toContain('necesitas cubrir el 20% restante con ahorros propios');
    expect(faq).toContain('La excepción es el Aval ICO para primera vivienda: Aval del Estado que cubre parte de la entrada de la hipoteca');
  });

  test('1468 monta el aviso de región tras el hero', async ({ page }) => {
    await abrirTest(page);
    const region = page.locator('[role="note"][aria-label*="España"]');
    await expect(region).toHaveCount(1);
    await expect(region).toContainText('Datos de referencia: España (impuestos, gastos de compra, financiación y ayudas).');
  });

  test('1469 lleva <DataReference> justo después del aviso de responsabilidad', async ({ page }) => {
    await abrirTest(page);
    const ref = page.locator('[role="note"][aria-label="Datos de referencia normativos"]');
    await expect(ref).toHaveCount(1);
    await expect(ref).toContainText('Gastos de compra de vivienda (ITP, IVA y AJD)');
    await expect(ref).toContainText('Financiación habitual de hasta el 80 % del valor de tasación: Banco de España, Portal del Cliente Bancario (12/03/2024).');
    // Orden en el DOM: el DisclaimerCard y, a continuación, el sello.
    const siguiente = await page.locator('[class*="disclaimerCard"]').first().evaluate((el) => el.nextElementSibling?.getAttribute('aria-label') ?? '');
    expect(siguiente).toBe('Datos de referencia normativos');
  });

  test('1470 el JSON-LD WebApplication declara sus 7 funciones', async ({ page }) => {
    await abrirTest(page);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.map((b) => JSON.parse(b) as { '@type'?: string; featureList?: string[] }).find((j) => j['@type'] === 'WebApplication');
    expect(app?.featureList).toHaveLength(7);
    expect(app?.featureList).toContain('Avisa cuando el ahorro para la entrada o el plazo de permanencia impiden recomendar la compra');
  });

  test('1471 tema claro: los textos pequeños de marca llegan a 4,5:1', async ({ page }) => {
    // --primary-texto #26718F: 5,47 sobre blanco; sobre el fondo de la página y de la sección de
    // razones (capa azul al 6 %) queda algo por debajo, y por encima de 4,5.
    await abrirTest(page);
    const paso = await contraste(page, '[class*="progresoPaso"]');
    await responderEtiquetas(page, NORMAL);
    const titulo = await contraste(page, '[class*="razonesTitulo"]');
    const repetir = await contraste(page, '[class*="btnRepetir"]');
    expect(Math.min(paso, titulo, repetir), `paso ${paso.toFixed(2)} · razones ${titulo.toFixed(2)} · repetir ${repetir.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
  });

  test('1472 de familia: hero del resultado sobre --hero-bg, y botones sobre --primary-boton, en los dos temas', async ({ page }) => {
    // Blanco sobre #1a5278 = 8,33 (el subtítulo lleva opacidad 0,88) · sobre #26718F = 5,47.
    for (const oscuro of [false, true]) {
      await abrirTest(page);
      if (oscuro) await temaOscuro(page);
      const tema = oscuro ? 'oscuro' : 'claro';
      await page.locator('[role="radio"]').first().click();
      await expect(page.locator('[class*="btnSiguiente"]')).toHaveCSS('opacity', '1');
      expect(await contraste(page, '[class*="btnSiguiente"]'), `Siguiente (${tema})`).toBeCloseTo(5.47, 1);
      for (let i = 0; i < NORMAL.length; i++) {
        await page.locator('[role="radiogroup"] [role="radio"]', { has: page.getByText(NORMAL[i], { exact: true }) }).click();
        await page.getByRole('button', { name: i === NORMAL.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
      }
      await page.getByRole('heading', { name: 'Tu resultado' }).waitFor();
      await expect(page.locator('[class*="heroResultados"]')).toHaveCSS('background-image', 'none');
      await expect(page.locator('[class*="heroResultados"]')).toHaveCSS('background-color', 'rgb(26, 82, 120)');
      expect(await contraste(page, '[class*="heroTitleSm"]'), `h1 (${tema})`).toBeCloseTo(8.33, 1);
      expect(await contraste(page, '[class*="heroSubtitleSm"]'), `subtítulo (${tema})`).toBeGreaterThanOrEqual(4.5);
    }
    // «Empezar el test →», en la intro.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-alquiler-vs-compra/');
    await esperarHidratacionBotones(page);
    expect(await contraste(page, '[class*="btnStart"]'), 'Empezar').toBeCloseTo(5.47, 1);
  });

  test('familia g: al pulsar «Ver resultado» el foco va al encabezado del resultado, no a <body>', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    await expect(page.getByRole('heading', { name: 'Tu resultado' })).toBeFocused();
  });
});

// Visto en la sesión de reparación del 24/09/2026 (la misma forma que las hermanas de seguros):
// a 360 y 390 px la barra fija del logo (10-52 px) tapaba el título de la intro (46-84 px) y el
// «Tu resultado» (31-61 px). Mide el TEXTO de h1/h2 contra las cajas de la barra fija.
test('móvil y escritorio: el logo fijo no tapa el título, ni en la intro ni en el resultado', async ({ page }) => {
  const solapes: string[] = [];
  const medir = (momento: string) => page.evaluate((m) => {
    window.scrollTo(0, 0);
    const fuera: string[] = [];
    const fijos = Array.from(document.querySelectorAll('[class*="headerBar"] > *')).map((e) => e.getBoundingClientRect());
    for (const h of Array.from(document.querySelectorAll('h1, h2')).slice(0, 3)) {
      const rango = document.createRange();
      rango.selectNodeContents(h);
      for (const t of Array.from(rango.getClientRects())) for (const f of fijos) {
        if (t.left < f.right && f.left < t.right && t.top < f.bottom && f.top < t.bottom) {
          fuera.push(`${m}: «${(h.textContent ?? '').slice(0, 30)}» ${Math.round(t.top)}-${Math.round(t.bottom)} bajo ${Math.round(f.top)}-${Math.round(f.bottom)}`);
        }
      }
    }
    return fuera;
  }, momento);
  for (const ancho of [360, 390, 768, 1024, 1280]) {
    await page.setViewportSize({ width: ancho, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-alquiler-vs-compra/');
    await esperarHidratacionBotones(page);
    solapes.push(...(await medir(`${ancho}px intro`)));
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    await responder(page, Array(10).fill(0));
    solapes.push(...(await medir(`${ancho}px resultado`)));
  }
  expect(solapes).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// Re-inspección 09/10/2026 (Inspector en tarea, copia aparte). Invalidada por el refactor de las
// relacionadas del 08/10 (99e1ee7e); entra por los cabos C0008, C0011, C0016 y C0104. El testigo
// de familia (tests/familias/selectores.spec.ts) ya mide radios y barra de la pregunta 1: esto es
// lo que el testigo no ve. App de referencia: selector-smartphone (b0f31109 y 02/10/2026).
//
// Cada valor esperado se resolvió A MANO con los pesos de motor.ts (suma de las 10 respuestas
// contra ±8, razones = las 3 de más peso hacia el veredicto, a igual peso por orden de pregunta)
// ANTES de abrir el navegador. Los test.fail() son hallazgos ABIERTOS (pendientes de número,
// inspector 09/10/2026): cuando se reparen, pasan a exigir la reparación.
// ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('Re-inspección 09/10/2026 — razones ocultas, foco, teclado, móvil, guía y cifras', () => {
  // +4 «Indefinidamente» · +2 «Autónomo consolidado» · +4 «Más del 30%» · +1 «remoto» · +3 «Con hijos»
  // · −2 «Ambos están muy caros» · +1 «La acepto» · −1 «dependientes» · 0 «asumibles» · +2 «Estabilidad»
  // = +14 ≥ +8 → comprar, sin límites (ahorro ≥ 20 %, horizonte ≥ 3 años).
  const NORMAL_14 = ['Indefinidamente', 'Autónomo consolidado (+3 años)', 'Más del 30%', 'Trabajo en remoto, tengo libertad total', 'Con hijos o planificándolos', 'Ambos están muy caros', 'La acepto si los números tienen sentido', 'Tengo dependientes a mi cargo', 'Me generaría pérdidas asumibles', 'Estabilidad y echar raíces'] as const;
  // −1 «Entre 3 y 7 años» · −3 «temporal» · +2 «20-30 %» · −1 «No descarto» · −1 «solo» · −3 «Compra muy
  // cara» · +1 «La acepto» · −1 «dependientes» · 0 «asumibles» · 0 «Optimizar» = −7 → esperar (alquilar
  // empieza en −8 INCLUIDO: −7 se queda a un punto).
  const MENOS_7 = ['Entre 3 y 7 años', 'Contrato temporal o en transición', 'Entre el 20% y el 30%', 'No descarto que ocurra', 'Vivo solo/a, sin planes inmediatos', 'Compra muy cara, alquiler razonable', 'La acepto si los números tienen sentido', 'Tengo dependientes a mi cargo', 'Me generaría pérdidas asumibles', 'Optimizar el gasto mensual'] as const;
  // −1 «Entre 3 y 7 años» · +2 «Autónomo consolidado» · +2 «20-30 %» · +1 «remoto» · +1 «pareja»
  // · 0 «Equilibrado» · +1 «La acepto» · +1 «leve» · +2 «Tengo margen» · +2 «Estabilidad» = +11 → comprar.
  const OCULTO_11 = ['Entre 3 y 7 años', 'Autónomo consolidado (+3 años)', 'Entre el 20% y el 30%', 'Trabajo en remoto, tengo libertad total', 'En pareja, sin hijos aún', 'Equilibrado, sin grandes diferencias', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Tengo margen, no me preocupa', 'Estabilidad y echar raíces'] as const;
  // +4 +4 −4 +3 +3 +3 +1 +1 −3 +2 = +14 con «Menos del 10%» → esperar con el aviso del ahorro (lleva «%»).
  const SIN_AHORRO_14 = ['Indefinidamente', 'Contrato indefinido o funcionario', 'Menos del 10% del precio buscado', 'Muy improbable, estoy arraigado/a', 'Con hijos o planificándolos', 'Alquiler caro, compra más razonable', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Sería un problema grave', 'Estabilidad y echar raíces'] as const;

  async function contestar(page: Page, etiquetas: readonly string[]): Promise<void> {
    for (let i = 0; i < etiquetas.length; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]', { has: page.getByText(etiquetas[i], { exact: true }) }).click();
      await page.getByRole('button', { name: i === etiquetas.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
    }
    await page.getByRole('heading', { name: 'Tu resultado' }).waitFor();
  }
  const razones = (page: Page) => page.locator('[class*="razonItem"]').allInnerTexts();
  async function guia(page: Page): Promise<string> {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
  }

  test('caso normal: +14 → comprar; las tres razones de más peso y el contrapeso, en orden', async ({ page }) => {
    // Razones: los dos +4 por orden de pregunta (horizonte, ahorro) y el +3 (situación personal); los
    // +2 (laboral, prioridad) y los +1 quedan fuera. Contrapeso: −2 (mercado) y −1 (cargas).
    await abrirTest(page);
    await contestar(page, NORMAL_14);
    await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Tu situación apunta a comprar');
    await expect(page.locator('[class*="puntuacionNota"]')).toContainText('Tu puntuación total es +14: a partir de +8 la orientación es comprar, hasta −8 alquilar, y entre medias, esperar.');
    expect(await razones(page)).toEqual([
      'Horizonte Temporal: «Indefinidamente» suma 4 puntos hacia la compra.',
      'Capacidad de Entrada: «Más del 30%» suma 4 puntos hacia la compra.',
      'Situación Personal: «Con hijos o planificándolos» suma 3 puntos hacia la compra.',
      'Mercado Local: «Ambos están muy caros» resta 2 puntos: empuja hacia seguir de alquiler.',
      'Cargas Económicas: «Tengo dependientes a mi cargo» resta 1 punto: empuja hacia seguir de alquiler.',
    ]);
    await expect(page.locator('[data-limite]')).toHaveCount(0);
    expect(await page.locator('[class*="proximoItem"]').allInnerTexts()).toEqual([
      'Usa la calculadora de alquiler vs compra para validar los números de tu caso concreto',
      'Consulta con una entidad financiera para conocer tu capacidad hipotecaria real',
      'Analiza el mercado de tu zona y define tu presupuesto máximo',
      'Plantéate contratar un seguro de hogar adecuado antes de escriturar',
    ]);
  });

  test('caso límite: −7 es esperar, con lo que empuja a cada lado y el paso del ahorro que ya alcanza', async ({ page }) => {
    // En «esperar», razones = hacia comprar (+2 ahorro, +1 deuda) y contrapeso = hacia alquilar, los 3
    // de más peso: −3 laboral, −3 mercado y, de los cuatro −1, el primero por orden (horizonte).
    await abrirTest(page);
    await contestar(page, MENOS_7);
    await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Espera antes de decidir');
    await expect(page.locator('[class*="puntuacionNota"]')).toContainText('Tu puntuación total es −7:');
    // textContent: el título va en mayúsculas por CSS.
    expect(await page.locator('[class*="razonesTitulo"]').allTextContents()).toEqual(['Lo que empuja hacia comprar', 'Lo que empuja hacia alquilar']);
    expect(await razones(page)).toEqual([
      'Capacidad de Entrada: «Entre el 20% y el 30%» suma 2 puntos hacia la compra.',
      'Tolerancia a la Deuda: «La acepto si los números tienen sentido» suma 1 punto hacia la compra.',
      'Estabilidad Laboral: «Contrato temporal o en transición» resta 3 puntos: empuja hacia seguir de alquiler.',
      'Mercado Local: «Compra muy cara, alquiler razonable» resta 3 puntos: empuja hacia seguir de alquiler.',
      'Horizonte Temporal: «Entre 3 y 7 años» resta 1 punto: empuja hacia seguir de alquiler.',
    ]);
    expect(await page.locator('[class*="proximoItem"]').allInnerTexts()).toEqual([
      'Identifica los 1-2 factores que más te frenan y trabájalos',
      'Pon un plazo de revisión: en 6-12 meses repite este test',
      'Tu ahorro ya alcanza la entrada: lo que falta por aclarar son otros factores',
      'Habla con un profesional inmobiliario o financiero sin compromiso',
    ]);
  });

  test('rechazo: sin responder la pregunta 10, «Ver resultado» no lleva al resultado', async ({ page }) => {
    await abrirTest(page);
    for (let i = 0; i < 9; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').first().click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await expect(page.getByText('Pregunta 10 de 10').first()).toBeVisible();
    const ver = page.getByRole('button', { name: 'Ver resultado' });
    await expect(ver).toBeDisabled();
    await ver.click({ force: true });
    await expect(page.getByText('Pregunta 10 de 10').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tu resultado' })).toHaveCount(0);
  });

  test('motor (C0011 b, descartado en esta forma): lo recortado a 3 nunca pesa más que lo mostrado en su dirección', () => {
    // Barrido de las 1.048.576 combinaciones (09/10/2026). Las razones se recortan a 3 en 954.965
    // perfiles y el contrapeso en 645.547, y TODOS esconden al menos una respuesta (7 preguntas no
    // tienen opción de 0 puntos y se enseñan 6 como mucho). Pero el recorte es siempre por peso:
    // 0 perfiles con una respuesta oculta más pesada que una mostrada de su misma dirección.
    test.setTimeout(120_000);
    const r: Record<string, string> = {};
    let mal = 0;
    const peso = (f: string) => Number(f.match(/(\d+) punto/)?.[1] ?? Number.NaN);
    const rec = (i: number): void => {
      if (i === PREGUNTAS.length) {
        const res = calcularResultado(r);
        const empujes = PREGUNTAS
          .map((p) => ({ cat: p.categoria, puntos: p.opciones.find((o) => o.valor === r[p.id])?.puntos ?? 0 }))
          .filter((e) => e.puntos !== 0);
        const aFavor = res.veredicto === 'alquila' ? -1 : 1;
        const tramos: [number, string[]][] = [[aFavor, res.razones], [-aFavor, res.contrapeso]];
        for (const [signo, frases] of tramos) {
          const mostradas = new Set(frases.map((f) => f.split(':')[0]));
          const minimo = Math.min(...frases.map(peso));
          if (empujes.some((e) => Math.sign(e.puntos) === signo && !mostradas.has(e.cat) && Math.abs(e.puntos) > minimo)) mal++;
        }
        return;
      }
      for (const o of PREGUNTAS[i].opciones) {
        r[PREGUNTAS[i].id] = o.valor;
        rec(i + 1);
      }
    };
    rec(0);
    expect(mal).toBe(0);
  });

  test.fail('C0011 b: lo que se enseña explica la puntuación — las respuestas a la vista suman los +11', async ({ page }) => {
    // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). OCULTO_11 da +11 → comprar. La
    // pantalla enseña +2 (laboral), +2 (ahorro), +2 (riesgo de venta) —los tres +2 primeros por orden
    // de pregunta— y −1 (horizonte): +5. No se ven «Estabilidad y echar raíces» (+2) ni los cuatro +1
    // (+6 en total), y las tres razones (+6) no llegan al +8 que la nota de al lado da como umbral.
    // El veredicto «comprar» dice «abajo tienes qué respuestas pesan a favor y cuáles en contra, para
    // que compruebes que el resultado se sostiene en tu caso», y con lo enseñado no se puede.
    // Barrido del motor: en 105.636 de los 120.194 «comprar» y 180.139 de los 207.542 «alquilar» lo
    // enseñado no llega al umbral; en 840, ni las tres razones solas.
    // Esperado: +11 entre lo que se enseña (con todas las respuestas, o con un resumen del resto que
    // diga cuánto suma). Obtenido hoy: +5.
    await abrirTest(page);
    await contestar(page, OCULTO_11);
    await expect(page.locator('[class*="puntuacionNota"]')).toContainText('Tu puntuación total es +11:');
    const texto = (await page.locator('[class*="razonesSection"]').allTextContents()).join(' ');
    const aLaVista = [...texto.matchAll(/(suman?|restan?) (\d+) puntos?/g)]
      .reduce((s, m) => s + (m[1].startsWith('suma') ? 1 : -1) * Number(m[2]), 0);
    expect(aLaVista).toBe(11);
  });

  test.fail('C0016 a: tras «Empezar», «Siguiente» y «Anterior» el foco va al enunciado de la pregunta nueva', async ({ page }) => {
    // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). Forma del 1680 de
    // selector-smartphone (reparado en b0f31109 con un useEffect sobre [pantalla, paso]). Aquí solo
    // se lleva el foco al «Tu resultado». Medido el 09/10/2026:
    //   «Empezar» desaparece → foco en <body> · «Siguiente» se desactiva en la pregunta nueva (sin
    //   responder) → <body>, y el siguiente Tab sale DESPUÉS del cuestionario, al enlace «Ir a
    //   Orientador Alquiler vs Compra» de las relacionadas · «Anterior» conserva el foco y la pregunta
    //   cambia sin que nada la anuncie (y en la 1 se desactiva → <body>).
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-alquiler-vs-compra/');
    await esperarHidratacionBotones(page);
    const foco = () => page.evaluate(() => {
      const a = document.activeElement as HTMLElement | null;
      if (!a || a === document.body) return 'body';
      if (a.getAttribute('role') === 'radio') return `radio ${a.querySelector('span')?.textContent ?? ''}`;
      return `${a.tagName.toLowerCase()} ${a.getAttribute('aria-label') ?? a.textContent ?? ''}`.trim();
    });
    const vistos: string[] = [];
    await page.getByRole('button', { name: /Empezar el test/ }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    vistos.push(await foco());
    await page.locator('[role="radiogroup"] [role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 2 de 10').first().waitFor();
    vistos.push(await foco());
    await page.keyboard.press('Tab');
    vistos.push(await foco());
    await page.locator('[role="radiogroup"] [role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 3 de 10').first().waitFor();
    vistos.push(await foco());
    await page.getByRole('button', { name: 'Pregunta anterior' }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 2 de 10').first().waitFor();
    vistos.push(await foco());
    // Obtenido hoy: ['body', 'body', 'a Ir a Orientador Alquiler vs Compra', 'body', 'button Pregunta anterior'].
    expect(vistos).toEqual([
      'h2 ¿Cuánto tiempo prevés quedarte en esta ciudad o zona?',
      'h2 ¿Cuál es tu situación laboral actual?',
      'radio Contrato indefinido o funcionario',
      'h2 ¿Cuánto ahorro tienes disponible para la entrada y gastos?',
      'h2 ¿Cuál es tu situación laboral actual?',
    ]);
  });

  test.fail('C0016 b: teclado de radios (APG): las flechas mueven y marcan, y el grupo es UNA parada de Tab', async ({ page }) => {
    // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). Forma del 1681 de
    // selector-smartphone (reparado en b0f31109: tabindex itinerante y teclaEnOpcion). Medido el
    // 09/10/2026: tabIndex [0, 0, 0, 0] (cuatro paradas de Tab), y ArrowDown sobre «Menos de 3 años»
    // no mueve el foco ni marca nada. La referencia, en el mismo navegador: [0, −1, −1, −1] y la
    // flecha pasa a la segunda opción.
    await abrirTest(page);
    const radios = page.locator('[role="radiogroup"] [role="radio"]');
    expect(await radios.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex))).toEqual([0, -1, -1, -1]);
    await radios.nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(radios.nth(1)).toBeFocused({ timeout: 1_000 });
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 });
    await page.keyboard.press('End');
    await expect(radios.nth(3)).toBeFocused();
    await expect(page.locator('[role="radiogroup"] [aria-checked="true"]')).toHaveCount(1);
    // En la pregunta 1 «Anterior» está desactivado: tras el grupo, la siguiente parada es «Siguiente».
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeFocused();
  });

  test.fail('C0104 (3): la guía educativa está en el HTML servido y se puede abrir antes del resultado', async ({ page }) => {
    // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). Forma del 2663 de
    // selector-smartphone. EducationalSection monta siempre su contenido «porque Googlebot no hace
    // clic», pero aquí el componente entero va dentro de `pantalla === 'resultado'`: el HTML servido
    // no trae ni una línea de la guía (ni «Costes ocultos…» ni la frase de los gastos), y quien no
    // termina las 10 preguntas no la ve. Obtenido hoy: false y 0 botones en la intro y en el test.
    const html = await (await page.request.get('/selector-alquiler-vs-compra/')).text();
    expect(html).toContain('Costes ocultos de la compra que nadie menciona');
    await page.goto('/selector-alquiler-vs-compra/');
    await esperarHidratacionBotones(page);
    await expect(page.getByRole('button', { name: 'Ver guía educativa' })).toHaveCount(1, { timeout: 1_000 });
  });

  test.fail('C0008: las cifras de «Costes ocultos» no se publican sin fuente', async ({ page }) => {
    // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). Sobrevivieron al 1463, que retiró
    // las horquillas sin fuente del plazo: page.tsx, l. 401-405, escritas a mano y sin derivar de
    // nada de data/ (data/fiscal no tiene IBI, seguro ni comisión de agencia). Si la reparación
    // conserva una cifra con su fuente, este test se reescribe con la fuente literal.
    await abrirTest(page);
    await contestar(page, NORMAL_14);
    const texto = await guia(page);
    const sinFuente = [
      /200-1\.500[\s ]€\/año en pisos/,
      /Regla práctica: 1[\s ]?% del valor del inmueble al año/,
      /obligatorio con hipoteca \(100-400[\s ]€\/año\)/,
      /agencia \(3-5[\s ]?%\)/,
    ].filter((re) => re.test(texto)).map(String);
    // Obtenido hoy: las cuatro.
    expect(sinFuente).toEqual([]);
  });

  test.fail('la guía no dice «pagarás IRPF por la ganancia» sin sus exenciones (data/fiscal/ganancia-inmueble.ts)', async ({ page }) => {
    // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). data/fiscal/ganancia-inmueble.ts
    // (arts. 33.4.b y 38 LIRPF): la ganancia por transmitir la vivienda habitual está exenta para los
    // mayores de 65 años, y total o parcialmente si se reinvierte en otra vivienda habitual. La guía,
    // que habla de la vivienda que el usuario compraría para vivir, dice «si vendes, pagarás agencia
    // (3-5%), plusvalía municipal e IRPF por la ganancia», sin matiz.
    await abrirTest(page);
    await contestar(page, NORMAL_14);
    const texto = await guia(page);
    const hablaDelIrpf = /IRPF/.test(texto);
    expect(hablaDelIrpf ? /reinvers|mayores de 65/i.test(texto) : true).toBe(true);
  });

  test.fail('los porcentajes llevan espacio duro antes del «%» (CLAUDE.md §2, desde el 25/09/2026)', async ({ page }) => {
    // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). Medido el 09/10/2026 con
    // textContent (el carácter real), en las opciones y en el resultado con la guía abierta: 0 con
    // U+00A0, 9 pegados («Menos del 10% del precio buscado», «Entre el 10% y el 20%», «Más del 30%»,
    // «1% del valor», «(3-5%)», «30-35%» y «el 20% inicial» del aval, que viene de
    // data/fiscal/ayudas-personas.ts) y 21 con espacio normal (porcentaje() de cifras.ts: «80 %»,
    // «20 %», «3,5 %»…, y FRASE_INTERESES).
    await abrirTest(page);
    const textos: string[] = [];
    for (let i = 0; i < SIN_AHORRO_14.length; i++) {
      textos.push((await page.locator('[role="radiogroup"]').textContent()) ?? '');
      await page.locator('[role="radiogroup"] [role="radio"]', { has: page.getByText(SIN_AHORRO_14[i], { exact: true }) }).click();
      await page.getByRole('button', { name: i === 9 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
    }
    await page.getByRole('heading', { name: 'Tu resultado' }).waitFor();
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    textos.push((await page.locator('[class*="resultadosContainer"]').textContent()) ?? '');
    const separadores = [...textos.join(' ').matchAll(/\d([\s ]?)%/g)]
      .map((m) => (m[1] === ' ' ? 'U+00A0' : m[1] === '' ? 'pegado' : 'espacio normal'));
    expect(separadores.length).toBeGreaterThan(0);
    expect(separadores.filter((s) => s !== 'U+00A0')).toEqual([]);
  });

  // ─ Móvil ─────────────────────────────────────────────────────────────────────────────

  /** ¿Pisa alguna pieza de la barra fija del logo las letras del elemento? */
  async function bajoLaBarra(page: Page, selector: string): Promise<{ tapado: boolean; top: number; bottom: number; barra: number }> {
    return page.evaluate((sel) => {
      const piezas = Array.from(document.querySelectorAll('[class*="headerBar"] > *')).map((c) => c.getBoundingClientRect()).filter((c) => c.width > 0);
      const el = document.querySelector(sel);
      if (!el || piezas.length === 0) throw new Error(`sin barra (${piezas.length}) o sin ${sel}`);
      const rango = document.createRange();
      rango.selectNodeContents(el);
      const letras = Array.from(rango.getClientRects()).filter((c) => c.width > 0);
      const caja = el.getBoundingClientRect();
      return {
        tapado: piezas.some((p) => letras.some((c) => !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom))),
        top: Math.round(caja.top),
        bottom: Math.round(caja.bottom),
        barra: Math.round(Math.max(...piezas.map((p) => p.bottom))),
      };
    }, selector);
  }

  /** Deja el centro del botón a la altura y del viewport y devuelve ese punto. */
  async function colocar(page: Page, nombre: string | RegExp, y: number): Promise<{ x: number; y: number }> {
    const boton = page.getByRole('button', { name: nombre });
    await boton.evaluate((e, yy) => {
      const r = e.getBoundingClientRect();
      window.scrollBy(0, r.top + r.height / 2 - yy);
    }, y);
    const caja = await boton.boundingBox();
    if (!caja) throw new Error(`sin caja para ${String(nombre)}`);
    return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
  }

  async function abrirMovil(page: Page): Promise<void> {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-alquiler-vs-compra/');
    await esperarHidratacionBotones(page);
  }

  test.describe('móvil 390 px', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent: devices['Pixel 7'].userAgent,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test.fail('C0104 (1): tras «Empezar» y «Siguiente», el enunciado de la pregunta queda a la vista y por debajo de la barra del logo', async ({ page }) => {
      // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). Forma del 2657 de
      // selector-smartphone. Aquí no hay foco programático en las preguntas, así que la página no se
      // mueve: la pregunta nueva se pinta donde estaba la anterior. Medido el 09/10/2026 tocando
      // como un usuario (tap(), que desplaza lo justo): a 390 px las 10 preguntas en y 20..74 (P4 y
      // P8, 20..101) con la barra hasta 52 → letras tapadas; a 360 px la 1 en y −58..23 y de la 2 a
      // la 10 por ENCIMA del borde (y −58..−4 / −85..−4). Con el botón a media pantalla, de la 3 a
      // la 10 por encima del borde en los dos anchos. Si se repara llevando el foco al enunciado
      // (C0016 a), hace falta además el scroll-margin-top de la referencia, o reaparece el 2657.
      await abrirMovil(page);
      await page.getByRole('button', { name: /Empezar el test/ }).tap();
      const fuera: string[] = [];
      for (let i = 1; i <= 5; i++) {
        await expect(page.getByText(`Pregunta ${i} de 10`).first()).toBeVisible();
        await page.waitForTimeout(150);
        const m = await bajoLaBarra(page, '[class*="preguntaTexto"]');
        if (m.tapado || m.top < m.barra) fuera.push(`P${i}: enunciado en y ${m.top}..${m.bottom}, barra hasta ${m.barra}`);
        await page.locator('[role="radiogroup"] [role="radio"]').nth(3).tap();
        await page.getByRole('button', { name: 'Siguiente pregunta' }).tap();
      }
      expect(fuera, 'enunciados bajo la barra o fuera de la vista').toEqual([]);
    });

    test('C0104 (1), descartado en el resultado: «Tu resultado» tiene el foco y queda por debajo de la barra', async ({ page }) => {
      // Medido el 09/10/2026 a 360 y 390 px, con el botón donde lo deja tap(), a media pantalla y
      // abajo del todo: el <h1> enfocado en y 80..109, scroll 0, barra hasta 52.
      await abrirMovil(page);
      await page.getByRole('button', { name: /Empezar el test/ }).tap();
      for (let i = 0; i < 10; i++) {
        await page.locator('[role="radiogroup"] [role="radio"]').nth(3).tap();
        await page.getByRole('button', { name: i === 9 ? 'Ver resultado' : 'Siguiente pregunta' }).tap();
      }
      const titulo = page.getByRole('heading', { name: 'Tu resultado' });
      await expect(titulo).toBeFocused();
      await page.waitForTimeout(150);
      const m = await bajoLaBarra(page, 'h1');
      expect({ tapado: m.tapado, debajo: m.top >= m.barra }, `h1 en y ${m.top}..${m.bottom}, barra hasta ${m.barra}`).toEqual({ tapado: false, debajo: true });
    });
  });

  test.describe('móvil 360 px', () => {
    test.use({
      viewport: { width: 360, height: 740 },
      userAgent: devices['Pixel 7'].userAgent,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    // +3 +4 +2 +3 +1 0 +1 +1 0 +2 = +17 → comprar (el NORMAL de la inspección del 24/09, con el que se
    // midió la pantalla del resultado).
    const NORMAL_17 = ['Más de 7 años', 'Contrato indefinido o funcionario', 'Entre el 20% y el 30%', 'Muy improbable, estoy arraigado/a', 'En pareja, sin hijos aún', 'Equilibrado, sin grandes diferencias', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Me generaría pérdidas asumibles', 'Estabilidad y echar raíces'] as const;

    test('C0104 (2), descartado en «Empezar»: un doble toque no contesta la pregunta 1', async ({ page }) => {
      // Medido el 09/10/2026 con el botón a 15 alturas (y 120..680, de 40 en 40): el segundo toque
      // (detail 2) cae siempre en algo sin acción.
      await abrirMovil(page);
      const p = await colocar(page, /Empezar el test/, 360);
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(150);
      await page.touchscreen.tap(p.x, p.y);
      await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
      await page.waitForTimeout(300);
      await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
    });

    test.fail('C0104 (2): un doble toque en «Siguiente» de la pregunta 1 no contesta la 2', async ({ page }) => {
      // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). Forma del 2659 de
      // selector-smartphone (receta `clicDeMas`: se ignora el clic con detail > 1 si el anterior
      // cambió de pantalla). Medido el 09/10/2026 a 360 y 390 px: con «Siguiente» entre y 150 y 350,
      // el segundo toque (detail 2) cae en «Contrato temporal o en transición» de la pregunta 2 y la
      // deja marcada (−3 puntos) sin que nadie la elija. En las otras ocho transiciones no pasa.
      await abrirMovil(page);
      await page.getByRole('button', { name: /Empezar el test/ }).tap();
      await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
      await page.waitForTimeout(400);
      await page.locator('[role="radiogroup"] [role="radio"]').nth(3).tap();
      const p = await colocar(page, 'Siguiente pregunta', 300);
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(150);
      await page.touchscreen.tap(p.x, p.y);
      await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
      await page.waitForTimeout(300);
      // Obtenido hoy: 1 («Contrato temporal o en transición»).
      await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0, { timeout: 1_000 });
    });

    test.fail('C0104 (2): un doble toque en «Ver resultado» no saca de la app', async ({ page }) => {
      // ABIERTO (hallazgo pendiente de número, inspector 09/10/2026). El primer toque monta el
      // resultado y el foco al «Tu resultado» sube la página arriba del todo; el segundo cae en lo que
      // haya allí, que es la cabecera común: el enlace «Contacto» y la banda de Delegum que pinta
      // <LegalNotice />. Medido el 09/10/2026 a 360 y 390 px con el botón a 15 alturas (y 280..560):
      // y 300-320 → /contacto/; y 360-460 → https://delegum.com/soluciones/?from=meskeia. El
      // resultado no se guarda: se pierden las 10 respuestas. Delegum se sirve aquí sin red.
      await page.route(/^https:\/\/(www\.)?delegum\.com\//, (ruta) => ruta.fulfill({ status: 200, contentType: 'text/html', body: '<title>delegum</title>externo' }));
      await abrirMovil(page);
      const origen = new URL(page.url()).origin;
      await page.getByRole('button', { name: /Empezar el test/ }).tap();
      for (let i = 0; i < 10; i++) {
        await page.locator('[role="radiogroup"] [role="radio"]', { has: page.getByText(NORMAL_17[i], { exact: true }) }).tap();
        if (i < 9) await page.getByRole('button', { name: 'Siguiente pregunta' }).tap();
      }
      await page.waitForTimeout(400);
      const p = await colocar(page, 'Ver resultado', 400);
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(150);
      await page.touchscreen.tap(p.x, p.y);
      await page.waitForTimeout(600);
      // Obtenido hoy: https://delegum.com/soluciones/?from=meskeia.
      expect(page.url()).toBe(`${origen}/selector-alquiler-vs-compra/`);
      await expect(page.getByRole('heading', { name: 'Tu resultado' })).toBeVisible({ timeout: 1_000 });
    });
  });
});
