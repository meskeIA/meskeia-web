import { test, expect, type Page } from '@playwright/test';
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
      const esperado = res.puntuacion >= UMBRAL ? 'compra' : res.puntuacion <= -UMBRAL ? 'alquila' : 'espera';
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
// Cada hallazgo abierto va como test.fail(): pasa hoy y se pone rojo cuando se repare. La
// aserción de cada uno es la CONDICIÓN del defecto, así que se enciende se repare por donde se
// repare (filtrando o avisando; cambiando la FAQ o la pantalla).
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
  // +3 +4 −1 −1 +1 0 +1 +1 0 0 = +8 → comprar (el umbral incluye el +8).
  const MAS_8 = ['Más de 7 años', 'Contrato indefinido o funcionario', 'Entre el 10% y el 20%', 'No descarto que ocurra', 'En pareja, sin hijos aún', 'Equilibrado, sin grandes diferencias', 'La acepto si los números tienen sentido', 'Solo algo menor (coche, tarjeta...)', 'Me generaría pérdidas asumibles', 'Optimizar el gasto mensual'] as const;
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

  // ─ Hallazgos abiertos ─

  test('«Menos del 10 %» ahorrado no puede salir en «comprar» sin avisar de la entrada', async ({ page }) => {
    // HALLAZGO abierto: el ahorro es un PESO (−4), no un límite. La propia opción dice «Entrada
    // insuficiente en la mayoría de casos» y la FAQ, que el banco financia hasta el 80 % y los
    // gastos van aparte. La única huella en pantalla es «resta 4 puntos». Barrido: 13.620 de los
    // 262.144 perfiles con esa respuesta salen en «comprar».
    test.fail();
    test.setTimeout(90_000);
    await abrirTest(page);
    await responderEtiquetas(page, SIN_AHORRO);
    const texto = await textoResultado(page);
    const compra = texto.includes('Tu situación apunta a comprar');
    const avisa = /insuficiente|no (te )?alcanza|no cubre|80\s?%/i.test(texto);
    const n = contar((r, v) => r.ahorro === 'bajo' && v === 'compra');
    expect(compra && !avisa, `«comprar» sin aviso de la entrada (${n} perfiles en el motor)`).toBe(false);
  });

  test('«Menos de 3 años» en la ciudad no puede salir en «comprar» sin avisar del plazo', async ({ page }) => {
    // HALLAZGO abierto: la guía de la propia app dice «Si tienes que vender antes de amortizarlos,
    // perderás dinero casi con certeza» y la FAQ, «Con un horizonte de menos de 5 años, la compra
    // raramente compensa». El horizonte solo resta 4. Barrido: 12.340 de 262.144 salen en «comprar».
    test.fail();
    test.setTimeout(90_000);
    await abrirTest(page);
    await responderEtiquetas(page, HORIZONTE_CORTO);
    const texto = await textoResultado(page);
    const compra = texto.includes('Tu situación apunta a comprar');
    const avisa = /amortiz|equilibrio|perder(ás)? dinero|raramente compensa|costes (de compra|iniciales|de transacción)/i.test(texto);
    const n = contar((r, v) => r.horizonte === 'corto' && v === 'compra');
    expect(compra && !avisa, `«comprar» con horizonte < 3 años sin aviso (${n} perfiles en el motor)`).toBe(false);
  });

  test('la escala del ahorro cuadra con lo que la FAQ dice que hace falta', async ({ page }) => {
    // HALLAZGO abierto: la FAQ pide 60.000-70.000 € para un piso de 200.000 € (20 % de entrada +
    // 10-15 % de gastos = 30-35 %), pero la pregunta 3 llama «Lo mínimo» a tener entre el 10 % y el
    // 20 % y «Entrada cómoda con algo de colchón» a tener entre el 20 % y el 30 %. Con data/itp-ccaa
    // los gastos de una usada de 200.000 € van del 3,5 % (Ceuta y Melilla) al 10,5 % (Cataluña):
    // con menos del 20 % no se llega a entrada + gastos en ninguna comunidad.
    test.fail();
    await abrirTest(page);
    const faq = await faqServido(page);
    // Hasta la pregunta 3: «Más de 7 años» · «Contrato indefinido o funcionario».
    for (const etiqueta of ['Más de 7 años', 'Contrato indefinido o funcionario']) {
      await page.locator('[role="radio"]', { has: page.getByText(etiqueta, { exact: true }) }).click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await page.getByText('¿Cuánto ahorro tienes disponible para la entrada y gastos?').waitFor();
    const opciones = (await page.locator('[role="radio"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' '));
    const pideMasDel30 = faq.includes('necesitarías disponer de entre 60.000 y 70.000 € en ahorros');
    const llamaMinimoAl10a20 = opciones.some((o) => o.includes('Entre el 10% y el 20%') && o.includes('Lo mínimo'));
    expect(pideMasDel30 && llamaMinimoAl10a20, opciones.join(' | ')).toBe(false);
  });

  test('los gastos de compra de la guía y la FAQ cuadran con data/itp-ccaa', async ({ page }) => {
    // HALLAZGO abierto: guía «En total, entre un 10% y un 15% adicional sobre el precio» y FAQ
    // «en España, entre el 10% y el 15% adicional del precio», escritos a mano. Con el motor de
    // compraventa del repo (ITP general + notaría + registro, 200.000 €, usada): País Vasco 4,5 %,
    // Madrid 6,5 %, Andalucía 7,5 %, Cataluña 10,5 %; obra nueva (IVA 10 % + AJD) 10,5-12 %.
    // 18 de los 19 territorios quedan por debajo del 10 % en vivienda usada.
    test.fail();
    const precio = 200_000;
    const usada = (Object.keys(ITP_CCAA) as ComunidadAutonoma[]).map((c) => (calcularITP(precio, c) + calcularNotario(precio) + calcularRegistro(precio)) / precio);
    const bajoDiez = usada.filter((x) => x < 0.10).length;
    await abrirTest(page);
    const faq = await faqServido(page);
    const anuncia = faq.includes('entre el 10% y el 15% adicional del precio');
    expect(anuncia && bajoDiez > 0, `${bajoDiez} de ${usada.length} territorios bajo el 10 %`).toBe(false);
  });

  test('la guía y la FAQ dan el mismo plazo para que comprar compense', async ({ page }) => {
    // HALLAZGO abierto: la guía dice «La regla general es que necesitas entre 5 y 8 años» y, más
    // abajo, «más de 7-10 años»; la FAQ, «generalmente en 7 a 12 años». Ninguno cita fuente.
    test.fail();
    await abrirTest(page);
    const faq = await faqServido(page);
    await responderEtiquetas(page, NORMAL);
    const guia = await guiaDesplegada(page);
    const contradice = guia.includes('entre 5 y 8 años') && faq.includes('7 a 12 años');
    expect(contradice).toBe(false);
  });

  test('tema claro: el veredicto «esperar» y «alquilar» se lee (texto grande, 3:1)', async ({ page }) => {
    // HALLAZGO abierto: el título del veredicto es la cifra principal de la app (24 px en negrita).
    // «Espera antes de decidir» va en #e8a020 = 2,22:1 y «Por ahora, mejor alquilar» en --secondary
    // = 2,80:1. «Esperar» sale en 667.152 de las 1.048.576 combinaciones. En oscuro pasan (6,22 y 6,17).
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, MAS_7);
    const espera = await contraste(page, '[class*="veredictoValor"]');
    await abrirTest(page);
    await responderEtiquetas(page, MENOS_8);
    const alquila = await contraste(page, '[class*="veredictoValor"]');
    expect(Math.min(espera, alquila), `espera ${espera.toFixed(2)} · alquila ${alquila.toFixed(2)}`).toBeGreaterThanOrEqual(3);
  });

  test('«alquilar» no pide ahorrar para la entrada a quien tiene más del 30 %', async ({ page }) => {
    // HALLAZGO abierto: los próximos pasos son fijos por veredicto. Barrido: 20.585 perfiles con
    // «Más del 30%» (y 33.027 con «Entre el 20% y el 30%») salen en «alquilar» y reciben
    // «Establece un objetivo de ahorro para la entrada».
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, ALQUILA_CON_AHORRO);
    const texto = await textoResultado(page);
    const alquila = texto.includes('Por ahora, mejor alquilar');
    expect(alquila && texto.includes('Más del 30%') && texto.includes('Establece un objetivo de ahorro para la entrada')).toBe(false);
  });

  test('la FAQ no atribuye a los primeros años unos intereses del 30-50 % del capital', async ({ page }) => {
    // HALLAZGO abierto: 200.000 € al 3 % a 30 años (cuota 843,21 €): los intereses de los cinco
    // primeros años son 28.405 € = 14,2 % del capital; los de toda la vida, 103.555 € = 51,8 %.
    // Lo que supera el 50 % en los primeros años es la parte de INTERÉS de cada cuota (58,7 %).
    test.fail();
    await abrirTest(page);
    expect(await faqServido(page)).not.toContain('pueden superar el 30-50% del capital en los primeros años');
  });

  test('la FAQ de ahorros no ignora el aval ICO que recoge data/fiscal', async ({ page }) => {
    // HALLAZGO abierto: data/fiscal/ayudas-personas.ts ('aval-ico-vivienda'): aval del Estado para
    // jóvenes y familias con hijos menores «sin necesidad de ahorrar el 20% inicial». La FAQ dice,
    // sin matiz, «necesitas cubrir el 20% restante con ahorros propios».
    test.fail();
    await abrirTest(page);
    const faq = await faqServido(page);
    expect(faq.includes('necesitas cubrir el 20% restante con ahorros propios') && !/aval/i.test(faq)).toBe(false);
  });

  test('monta el aviso de región (§1.bis): hipoteca, ITP, AJD e IBI son de España', async ({ page }) => {
    // HALLAZGO abierto: mismo caso que selector-mascota 1340 y selector-calefaccion 1400.
    test.fail();
    await abrirTest(page);
    await expect(page.locator('[role="note"][aria-label*="España"]')).toHaveCount(1, { timeout: 2_000 });
  });

  test('lleva <DataReference> tras el aviso, porque publica cifras normativas', async ({ page }) => {
    // HALLAZGO abierto: gastos de compra (ITP o IVA, AJD), 80 % de financiación: sin normativa,
    // fuente ni fecha de verificación (política de disclaimers, «App sin DataReference»).
    test.fail();
    await abrirTest(page);
    await expect(page.locator('[role="note"][aria-label="Datos de referencia normativos"]')).toHaveCount(1, { timeout: 2_000 });
  });

  test('el JSON-LD WebApplication declara sus funciones (§1.ter)', async ({ page }) => {
    // HALLAZGO abierto: metadata.ts exporta jsonLd con `features: []`; el servido lleva
    // "featureList":[] (las 8 funciones solo están en la etiqueta meta `schema:WebApplication`).
    test.fail();
    await abrirTest(page);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.map((b) => JSON.parse(b) as { '@type'?: string; featureList?: string[] }).find((j) => j['@type'] === 'WebApplication');
    expect(app?.featureList?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  test('tema claro: los textos pequeños en color de marca llegan a 4,5:1', async ({ page }) => {
    // HALLAZGO abierto: «Pregunta N de 10» (--primary, 13,6 px) 3,93 · razonesTitulo (--primary,
    // 14,4 px) 3,67 · «← Repetir el test» 3,93. Misma forma que selector-mascota 1343; allí se
    // resolvió con --primary-texto. Ningún candado lo mira.
    test.fail();
    await abrirTest(page);
    const paso = await contraste(page, '[class*="progresoPaso"]');
    await responderEtiquetas(page, NORMAL);
    const titulo = await contraste(page, '[class*="razonesTitulo"]');
    const repetir = await contraste(page, '[class*="btnRepetir"]');
    expect(Math.min(paso, titulo, repetir), `paso ${paso.toFixed(2)} · razones ${titulo.toFixed(2)} · repetir ${repetir.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
  });

  test('de familia: el hero del resultado se lee (subtítulo a 4,5:1)', async ({ page }) => {
    // HALLAZGO abierto (de FAMILIA, lo tienen también las referencias): .heroResultados usa
    // linear-gradient(--primary → --secondary) y no --hero-bg. Subtítulo 2,87 en claro y 2,21 en
    // oscuro; el <h1> 3,29 / 2,46; «Empezar el test» 3,20 / 2,42; «Siguiente» 3,26 / 2,44.
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    expect(await contraste(page, '[class*="heroSubtitleSm"]')).toBeGreaterThanOrEqual(4.5);
  });
});
