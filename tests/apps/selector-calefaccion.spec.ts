import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, PREGUNTAS, SISTEMAS } from '../../app/selector-calefaccion/motor';

/**
 * Asesor de Calefacción (selector-calefaccion) — reparado el 24/09/2026 desde una sospecha del
 * Inspector sobre la familia de los selectores (la de selector-smartphone 950/951 y
 * selector-mascota 1341/1342, repetida aquí).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1 y máximo 10, y pintaba paso / 10:
 *     en la pregunta 2 anunciaba 1/9 = 0,111 y pintaba 0,100.
 *   · Empates: el motor ordenaba el array de puntuaciones con `sort` estable, así que a
 *     igualdad ganaba siempre el primero (la aerotermia). Enumerado: 24.687 de los 331.776
 *     perfiles (7,4 %) empatan en cabeza, y en 19.931 el criterio explícito cambia el ganador.
 *   · Razones fijas por sistema: en 39 perfiles ganaba la caldera de gas a quien había dicho
 *     que su caldera tiene MÁS de 10 años, y la app le respondía «Con una caldera reciente en
 *     buen estado, mantenerla es la decisión económicamente más sensata».
 *
 * EL MOTOR (app/selector-calefaccion/motor.ts): los mismos pesos (comprobado sobre las 331.776
 * combinaciones: sin empate, el ganador no cambia en ninguna). A igualdad de puntos, primero el
 * que más encaja con el presupuesto de instalación (pregunta 9) y luego el de menor coste de
 * instalación; el empate se anuncia. Las razones citan las respuestas que más han sumado.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>, así que `esperarHidratacion` de `_hidratacion.ts` (que sondea
 * el rastreador de valor de un input) no tiene testigo. El equivalente para una app de solo
 * botones es que React haya colgado sus props del botón de inicio: antes, el clic se pierde.
 * Mismo criterio que `selector-smartphone.spec.ts`.
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
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
  await page.goto('/selector-calefaccion/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

/** Responde las diez preguntas por el ÍNDICE de la opción, y pide el resultado. */
async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu sistema de calefacción ideal' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles, con las cuentas hechas a mano
// ─────────────────────────────────────────────────────────────────────────────

// Piso en bloque · Menos de 60 m² · Radiadores de agua · Frío · Sí, menos de 5 años ·
// Refrigeración imprescindible · 4 – 5 meses · No tengo espacio · Menos de 3.000 € · Subvenciones sí.
//   aerotermia 1+1+2+2 = 6 · bomba 2+2+3+2 = 9 · caldera 2+1+4+2 = 9 · pellet 2+1 = 3 ·
//   eléctrico 1+2+2+4 = 9. Triple empate a 9. El presupuesto da eléctrico +4, bomba +2 y
//   caldera 0: van por ese orden. Antes ganaba la bomba de calor por ir antes en el array.
const EMPATE_A_TRES = [0, 0, 0, 0, 0, 0, 1, 2, 0, 0] as const;

// Piso en bloque · 60 – 100 m² · Radiadores de agua · Frío · Sí, MÁS DE 10 AÑOS · Poco o nada ·
// 4 – 5 meses · No tengo espacio · 3.000 – 8.000 € · Prefiero no complicarme.
//   aerotermia 1+1+2 = 4 · bomba 2+1+2 = 5 · caldera 2+1+2+1 = 6 · pellet 2+1 = 3 ·
//   eléctrico 1+2 = 3. Gana la caldera de gas, sola. Antes le decía «Con una caldera reciente
//   en buen estado…» a quien acababa de responder que la suya tiene más de 10 años.
const CALDERA_VIEJA = [0, 1, 0, 0, 1, 2, 1, 2, 1, 2] as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Accesibilidad del armazón (el invariante de la familia)
// ─────────────────────────────────────────────────────────────────────────────

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);

  await grupo.locator('[role="radio"]').nth(2).click();
  await expect(grupo.locator('[role="radio"]').nth(2)).toHaveAttribute('aria-checked', 'true');
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
    const pedido = Number(await page.locator('[class*="progresoRelleno"]').getAttribute('data-progreso')) / 100;
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo(pedido, 6);
    // Y lo que se VE: el ancho real del relleno.
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await expect(barra).toHaveAttribute('aria-valuetext', `Pregunta ${paso + 1} de 10`);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Empates y razones, en pantalla
// ─────────────────────────────────────────────────────────────────────────────

test('un empate a tres se anuncia y se deshace por el presupuesto, no por el orden del código', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, EMPATE_A_TRES);

  const principal = page.locator('[class*="recomendacionValor"]').first();
  await expect(principal).toHaveText('Radiadores Eléctricos de Bajo Consumo');
  await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('Bomba de Calor (split)');

  const empate = page.locator('[class*="avisoEmpate"]');
  await expect(empate).toContainText(
    'los radiadores eléctricos de bajo consumo, la bomba de calor (split) y la caldera de gas encajan exactamente igual',
  );
  await expect(empate).toContainText('se muestran primero los radiadores eléctricos de bajo consumo porque encajan mejor con el presupuesto de instalación');
  // La razón principal cita la respuesta que más ha sumado.
  expect(texto).toContain('Presupuesto de instalación: has respondido «Menos de 3.000 €», que suma 4 puntos a los radiadores eléctricos de bajo consumo.');
});

test('las razones salen de las respuestas: a una caldera de más de 10 años no se le llama reciente', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, CALDERA_VIEJA);

  await expect(page.locator('[class*="recomendacionValor"]').first()).toHaveText('Caldera de Gas');
  await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
  expect(texto).not.toContain('Con una caldera reciente en buen estado');
  expect(texto).not.toContain('Tu caldera es reciente');
  // Las tres que más le suman: radiadores (+2), sin sitio para la unidad exterior (+2), frío (+1).
  expect(texto).toContain('Distribución del calor: has respondido «Radiadores de agua», que suma 2 puntos a la caldera de gas.');
  expect(texto).toContain('Unidad exterior: has respondido «No tengo espacio», que suma 2 puntos a la caldera de gas.');
  expect(texto).toContain('Clima: has respondido «Frío o muy frío», que suma 1 punto a la caldera de gas.');
  // Y el consejo de transición, que antes iba en «Por qué», sigue estando.
  expect(texto).toContain('Planifica la transición a bomba de calor o aerotermia');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. El motor, sobre las 331.776 combinaciones (sin navegador)
// ─────────────────────────────────────────────────────────────────────────────

test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  test.setTimeout(120_000);
  const r: Record<number, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); else fallos.length++; };
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const max = Math.max(...CLAVES.map((k) => res.puntos[k]));
      if (res.puntos[res.sistemaPrincipal] !== max) mal('el recomendado no tiene la puntuación máxima');
      const empatadosReales = CLAVES.filter((k) => k !== res.sistemaPrincipal && res.puntos[k] === max);
      if (empatadosReales.length !== res.empatados.length || empatadosReales.some((k) => !res.empatados.includes(k))) mal('empatados mal contados');
      if (empatadosReales.length > 0) {
        empates++;
        const pres = PREGUNTAS[8].opciones.find((o) => o.valor === r[9])?.pesos ?? {};
        for (const k of empatadosReales) {
          const dP = (pres[res.sistemaPrincipal] ?? 0) - (pres[k] ?? 0);
          // Nunca pierde contra un empatado ni por presupuesto ni, a igualdad, por coste; y
          // la frase nombra el criterio que de verdad lo ha separado.
          if (dP < 0) mal(`pierde por presupuesto contra ${k}`);
          if (dP > 0 && !res.criterioDesempate.includes('mejor con el presupuesto de instalación')) mal('no nombra el presupuesto');
          if (dP === 0 && !(SISTEMAS[res.sistemaPrincipal].costeInstalacionMin < SISTEMAS[k].costeInstalacionMin)) mal(`no es más barato que ${k}`);
          if (dP === 0 && !res.criterioDesempate.includes('coste de instalación es el más bajo')) mal('no nombra el coste');
        }
      } else if (res.criterioDesempate !== '') {
        mal('anuncia un criterio sin empate');
      }
      // Cada razón cita una respuesta que el usuario ha dado.
      for (const razon of res.razones) {
        const citada = razon.match(/«([^»]+)»/)?.[1];
        if (citada && !PREGUNTAS.some((p) => p.opciones.some((o) => o.etiqueta === citada && r[p.id] === o.valor))) mal(`razón que cita «${citada}», no respondida`);
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
  expect(total).toBe(331_776);
  expect(empates).toBe(24_687);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Inspección 24/09/2026 (Inspector) — la primera sobre la reparación 99acf1e0.
//    Lo que el usuario declara como LÍMITE, lo que la app promete y los datos de su contenido.
//    Cada hallazgo abierto va como test.fail(): pasa hoy y se pone rojo cuando se repare.
//    Los esperados se resolvieron a mano con los pesos de motor.ts ANTES de ejecutar la app.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspección 24/09/2026 — restricciones declaradas, promesas y datos', () => {
  type Respuestas = Record<number, string>;

  /** Responde por la ETIQUETA literal de cada opción, pregunta a pregunta, y pide el resultado. */
  async function responderEtiquetas(page: Page, etiquetas: readonly string[]): Promise<void> {
    for (let i = 0; i < etiquetas.length; i++) {
      const literal = etiquetas[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const opcion = page
        .locator('[role="radiogroup"] [role="radio"]')
        .filter({ has: page.locator('[class*="opcionEtiqueta"]', { hasText: new RegExp('^' + literal + '$') }) });
      await expect(opcion, `pregunta ${i + 1}: «${etiquetas[i]}»`).toHaveCount(1);
      await opcion.click();
      await page.getByRole('button', { name: i === etiquetas.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
    }
    await page.getByRole('heading', { name: 'Tu sistema de calefacción ideal' }).waitFor();
  }

  /** El texto del RESULTADO (tarjetas, empate, costes, razones, subvenciones y consejos), sin la guía. */
  async function textoResultado(page: Page): Promise<string> {
    const bloques = ['recomendacionGrid', 'avisoEmpate', 'costesSection', 'razonesSection', 'subvencionesSection', 'consejosSection'];
    const partes: string[] = [];
    for (const b of bloques) {
      for (const t of await page.locator(`[class*="${b}"]`).allInnerTexts()) partes.push(t);
    }
    return partes.join(' ').replace(/\s+/g, ' ');
  }

  /** El resultado MÁS la guía educativa desplegada. */
  async function textoConGuia(page: Page): Promise<string> {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = await page.locator('[class*="resultadosContainer"]').innerText();
    return `${await textoResultado(page)} ${guia}`.replace(/\s+/g, ' ');
  }

  async function principal(page: Page): Promise<string> {
    return (await page.locator('[class*="recomendacionValor"]').first().innerText()).trim();
  }

  const claveDe = (nombre: string) => CLAVES.find((k) => SISTEMAS[k].nombre === nombre);

  /** Recorre las 331.776 combinaciones con el motor real. */
  function barrer(visitar: (r: Respuestas, res: ReturnType<typeof calcularResultado>) => void): void {
    const r: Respuestas = {};
    const rec = (i: number): void => {
      if (i === PREGUNTAS.length) {
        visitar(r, calcularResultado(r));
        return;
      }
      for (const o of PREGUNTAS[i].opciones) {
        r[PREGUNTAS[i].id] = o.valor;
        rec(i + 1);
      }
    };
    rec(0);
  }

  /**
   * Contraste WCAG del texto con su fondo REAL, con los colores computados: compone las capas
   * rgba de los antepasados y, si hay un degradado, toma el peor punto bajo la extensión del
   * texto (Range, no la caja de bloque). Tiene en cuenta la opacidad del propio elemento.
   */
  async function contraste(page: Page, selector: string): Promise<number> {
    return page.locator(selector).first().evaluate((el) => {
      type Rgba = { r: number; g: number; b: number; a: number };
      const parse = (s: string): Rgba | null => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const sobre = (fg: Rgba, bg: Rgba): Rgba => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1,
      });
      const lum = (c: Rgba) => {
        const f = (v: number) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
      };
      const ratio = (a: Rgba, b: Rgba) => {
        const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
        return (x + 0.05) / (y + 0.05);
      };
      const cs = getComputedStyle(el);
      const color = parse(cs.color) ?? { r: 0, g: 0, b: 0, a: 1 };
      const texto: Rgba = { ...color, a: color.a * Number(cs.opacity) };

      // ¿Hay un degradado debajo? Entonces manda él (va encima del background-color).
      for (let e: Element | null = el; e; e = e.parentElement) {
        const img = getComputedStyle(e).backgroundImage;
        if (img.includes('linear-gradient(135deg')) {
          const paradas = [...img.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0]) ?? { r: 0, g: 0, b: 0, a: 1 });
          const caja = e.getBoundingClientRect();
          const L = (caja.width + caja.height) * Math.SQRT1_2;
          const cx = caja.left + caja.width / 2;
          const cy = caja.top + caja.height / 2;
          const en = (x: number, y: number): Rgba => {
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

      const capas: Rgba[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c && c.a > 0) {
          capas.push(c);
          if (c.a >= 1) break;
        }
      }
      let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
      return ratio(sobre(texto, fondo), fondo);
    });
  }

  async function ponerTemaOscuro(page: Page): Promise<void> {
    await page.evaluate(() => localStorage.setItem('meskeia-theme', 'dark'));
    await abrirTest(page);
    // Sembrar el tema puede pasar en falso: se comprueba que la página lo ha aplicado de verdad.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim().toLowerCase())).toBe('#1a1a1a');
  }

  // ─ Perfiles, con las cuentas hechas a mano (pesos de motor.ts) ─

  // Casa unifamiliar o chalet · 100 – 180 m² · Suelo radiante · Frío o muy frío · No, sin gas natural ·
  // Poco o nada · 6 o más meses · Sí, tengo espacio exterior · 8.000 – 15.000 € · Sí, quiero aprovecharlas.
  //   aerotermia 2+2+3+1+2+2+2+3+2 = 19 · pellet 1+1+2+1+1+1 = 7 · bomba 1+2 = 3 · caldera 1 · eléctrico 0.
  const NORMAL = ['Casa unifamiliar o chalet', '100 – 180 m²', 'Suelo radiante', 'Frío o muy frío', 'No, sin gas natural', 'Poco o nada', '6 o más meses', 'Sí, tengo espacio exterior', '8.000 – 15.000 €', 'Sí, quiero aprovecharlas'] as const;

  // Piso en bloque · 60 – 100 m² · Suelo radiante · Templado · Sí, más de 10 años · Sí, me sería muy útil ·
  // 4 – 5 meses · Sí, tengo espacio exterior · MENOS DE 3.000 € · Sí, quiero aprovecharlas.
  //   aerotermia 3+2+2+1+2+2 = 12 · bomba 2+1+1+1+2+2 = 9 · eléctrico 1+4 = 5 · pellet 1 · caldera 0.
  //   Caben en 3.000 € los de mínimo ≤ 3.000 (bomba 2.000, caldera 2.500, eléctrico 800): gana la bomba (9).
  const PRESUPUESTO_BAJO = ['Piso en bloque', '60 – 100 m²', 'Suelo radiante', 'Templado', 'Sí, más de 10 años', 'Sí, me sería muy útil', '4 – 5 meses', 'Sí, tengo espacio exterior', 'Menos de 3.000 €', 'Sí, quiero aprovecharlas'] as const;

  // Casa unifamiliar o chalet · 100 – 180 m² · Suelo radiante · Templado · No, sin gas natural · Sí, imprescindible ·
  // 6 o más meses · NO TENGO ESPACIO · 8.000 – 15.000 € · Sí, quiero aprovecharlas.
  //   aerotermia 2+2+3+2+2+2+2+3+2 = 20 · bomba 1+1+3 = 5 · pellet 1+1+1+1+1 = 5 · caldera 2 · eléctrico 2.
  //   Sin aerotermia ni split (los dos necesitan unidad exterior): gana el pellet (5).
  const SIN_EXTERIOR = ['Casa unifamiliar o chalet', '100 – 180 m²', 'Suelo radiante', 'Templado', 'No, sin gas natural', 'Sí, imprescindible', '6 o más meses', 'No tengo espacio', '8.000 – 15.000 €', 'Sí, quiero aprovecharlas'] as const;

  // Piso en bloque · 60 – 100 m² · Radiadores de agua · Frío o muy frío · NO, SIN GAS NATURAL · Poco o nada ·
  // 4 – 5 meses · No tengo espacio · 3.000 – 8.000 € · Prefiero no complicarme.
  //   caldera 2+1+2+1 = 6 · bomba 2+1+2 = 5 · aerotermia 1+1+2 = 4 · pellet 2+1+1 = 4 · eléctrico 1+2 = 3.
  //   Sin caldera de gas (no hay gas) ni aerotermia/split (no hay unidad exterior): pellet (4) frente a eléctrico (3).
  const SIN_GAS = ['Piso en bloque', '60 – 100 m²', 'Radiadores de agua', 'Frío o muy frío', 'No, sin gas natural', 'Poco o nada', '4 – 5 meses', 'No tengo espacio', '3.000 – 8.000 €', 'Prefiero no complicarme'] as const;

  // Casa unifamiliar o chalet · 100 – 180 m² · Suelo radiante · Templado · SÍ, MENOS DE 5 AÑOS · Poco o nada ·
  // 4 – 5 meses · Sí, tengo espacio exterior · 8.000 – 15.000 € · Sí, quiero aprovecharlas.
  //   aerotermia 2+2+3+2+2+3+2 = 16 · caldera 4 · bomba 1+2 = 3 · pellet 1+1+1 = 3 · eléctrico 0.
  const CALDERA_RECIENTE = ['Casa unifamiliar o chalet', '100 – 180 m²', 'Suelo radiante', 'Templado', 'Sí, menos de 5 años', 'Poco o nada', '4 – 5 meses', 'Sí, tengo espacio exterior', '8.000 – 15.000 €', 'Sí, quiero aprovecharlas'] as const;

  // ─ Caso normal: pasa ─

  test('caso normal: chalet con suelo radiante y 8.000 – 15.000 € → aerotermia, que cabe en el presupuesto', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const texto = await textoResultado(page);
    await expect(page.locator('[class*="recomendacionValor"]').first()).toHaveText('Aerotermia');
    await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('Caldera o Estufa de Pellet');
    await expect(page.locator('[class*="costeValor"]').first()).toHaveText('8.000 – 15.000 €');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    // Las tres que más suman a la aerotermia: suelo radiante (+3), el presupuesto (+3) y, de los +2, el de menor número.
    expect(texto).toContain('Distribución del calor: has respondido «Suelo radiante», que suma 3 puntos a la aerotermia.');
    expect(texto).toContain('Presupuesto de instalación: has respondido «8.000 – 15.000 €», que suma 3 puntos a la aerotermia.');
    expect(texto).toContain('Tipo de vivienda: has respondido «Casa unifamiliar o chalet», que suma 2 puntos a la aerotermia.');
  });

  // ─ Restricciones declaradas que se tratan como PESO y no como FILTRO ─

  test('HALLAZGO presupuesto (navegador): con «Menos de 3.000 €» recomienda la aerotermia de 8.000 – 15.000 €', async ({ page }) => {
    // HALLAZGO abierto: el presupuesto de instalación suma puntos pero no acota (mismo defecto
    // que selector-smartphone, hallazgo 943; la referencia filtra por tramo y lo dice). Esperado
    // a mano: la bomba de calor (split), 9 puntos y desde 2.000 €, o un aviso expreso del desfase
    // con «Menos de 3.000 €». Obtenido hoy: Aerotermia, 8.000 – 15.000 €, sin mencionar el tramo.
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, PRESUPUESTO_BAJO);
    const nombre = await principal(page);
    const k = claveDe(nombre);
    const cabe = k !== undefined && SISTEMAS[k].costeInstalacionMin <= 3000;
    const avisa = /3\.000 €/.test(await textoResultado(page));
    expect(cabe || avisa, `recomienda ${nombre}`).toBe(true);
  });

  test('HALLAZGO presupuesto (motor): ningún perfil con «Menos de 3.000 €» debería recibir un sistema que empieza por encima', () => {
    // HALLAZGO abierto: hoy son 45.812 de los 82.944 perfiles con ese tramo (45.585 aerotermia,
    // desde 8.000 €, y 227 pellet, desde 5.000 €). Si la reparación opta por AVISAR en vez de
    // filtrar, este recuento seguirá siendo > 0 y el que manda es el test de navegador.
    test.fail();
    test.setTimeout(60_000);
    let fuera = 0;
    barrer((r, res) => {
      if (r[9] === 'bajo' && SISTEMAS[res.sistemaPrincipal].costeInstalacionMin > 3000) fuera++;
    });
    expect(fuera).toBe(0);
  });

  test('HALLAZGO unidad exterior (navegador): con «No tengo espacio» recomienda aerotermia, y como alternativa el split', async ({ page }) => {
    // HALLAZGO abierto: la pregunta 8 («Sin posibilidad de instalar unidad exterior») solo suma
    // a caldera y eléctrico; no descarta nada. La aerotermia necesita unidad exterior (la propia
    // app lo escribe en sus contras) y el split también. Esperado a mano: pellet (5), o un aviso.
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, SIN_EXTERIOR);
    const nombre = await principal(page);
    const necesitaExterior = nombre === 'Aerotermia' || nombre === 'Bomba de Calor (split)';
    const avisa = /unidad exterior/i.test(await textoResultado(page));
    expect(!necesitaExterior || avisa, `recomienda ${nombre}`).toBe(true);
  });

  test('HALLAZGO unidad exterior (motor): sin espacio exterior no debería salir un sistema que la necesita', () => {
    // HALLAZGO abierto: hoy 102.275 de los 110.592 perfiles con «No tengo espacio» (92,5 %):
    // 83.972 aerotermia y 18.303 bomba de calor (split).
    test.fail();
    test.setTimeout(60_000);
    let contradicen = 0;
    barrer((r, res) => {
      if (r[8] === 'no' && (res.sistemaPrincipal === 'aerotermia' || res.sistemaPrincipal === 'bomba-calor')) contradicen++;
    });
    expect(contradicen).toBe(0);
  });

  test('HALLAZGO sin gas natural: a quien no tiene acometida le recomienda la caldera de gas', async ({ page }) => {
    // HALLAZGO abierto: «No, sin gas natural — No hay acometida de gas en mi zona» no resta ni
    // descarta la caldera de gas. Ocurre en 12 perfiles (11 por empate); este es el único sin
    // empate. Esperado a mano: pellet (4), descartadas la caldera (sin gas) y aerotermia/split
    // (sin unidad exterior), o un aviso. Obtenido hoy: Caldera de Gas, 6 frente a 5.
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, SIN_GAS);
    const nombre = await principal(page);
    const avisa = /sin gas natural|acometida/i.test(await textoResultado(page));
    expect(nombre !== 'Caldera de Gas' || avisa, `recomienda ${nombre}`).toBe(true);
  });

  test('HALLAZGO caldera reciente: recomienda instalar aerotermia y, a la vez, que no tiene sentido cambiar la caldera', async ({ page }) => {
    // HALLAZGO abierto: «Tu mejor opción: Aerotermia · Instalación 8.000 – 15.000 €» junto al
    // consejo «Tu caldera es reciente: no tiene sentido cambiarla ahora». Esperado: un resultado
    // coherente consigo mismo (o se recomienda conservarla, o se dice que la aerotermia es para
    // cuando toque cambiarla). Barrido: 78.999 de los 82.944 perfiles con caldera de < 5 años.
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, CALDERA_RECIENTE);
    const nombre = await principal(page);
    const texto = await textoResultado(page);
    expect(nombre !== 'Caldera de Gas' && texto.includes('no tiene sentido cambiarla ahora'), `recomienda ${nombre}`).toBe(false);
  });

  // ─ Promesas que la app no cumple ─

  test('HALLAZGO promesa: la intro ofrece «Pros y contras de cada tecnología» y el resultado no muestra ninguno', async ({ page }) => {
    // HALLAZGO abierto: SISTEMAS define pros y contras de los cinco sistemas, pero page.tsx no
    // los pinta (tampoco antes de 99acf1e0). La promesa está en la intro y en las features de
    // la metadata.
    test.fail();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-calefaccion/');
    await esperarHidratacionBotones(page);
    const promete = (await page.locator('[class*="introFeatures"]').innerText()).includes('Pros y contras de cada tecnología');
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await responderEtiquetas(page, NORMAL);
    const texto = await textoResultado(page);
    const k = claveDe(await principal(page));
    const muestra = k !== undefined && [...SISTEMAS[k].pros, ...SISTEMAS[k].contras].some((s) => texto.includes(s));
    expect(!promete || muestra).toBe(true);
  });

  test('HALLAZGO metadata: anuncia «suelo radiante» como uno de los sistemas resultado', async ({ request }) => {
    // HALLAZGO abierto: los resultados posibles son los cinco de SISTEMAS (aerotermia, split,
    // caldera de gas, pellet, radiadores eléctricos); el suelo radiante es una RESPUESTA de la
    // pregunta 3, no un resultado, y los radiadores eléctricos no se nombran. Hoy: 4 apariciones
    // de «suelo radiante o pellet» en el HTML servido (description, openGraph y los dos schema).
    test.fail();
    const html = await (await request.get('/selector-calefaccion/')).text();
    expect(html.match(/suelo radiante o pellet/g) ?? []).toHaveLength(0);
  });

  // ─ Datos ─

  test('HALLAZGO FAQ ≠ pantalla: horquillas de instalación y COP distintos en el FAQPage', async ({ request }) => {
    // HALLAZGO abierto: la pantalla dice pellet 5.000 – 12.000 €, caldera de gas 2.500 – 5.000 €
    // y COP 3-4; el FAQPage (lo que leen las IA) dice pellet 4.000-8.000 €, gas 2.500-4.500 € y
    // COP 3-5.
    test.fail();
    const html = await (await request.get('/selector-calefaccion/')).text();
    const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    const faq = bloques.find((b) => b.includes('"FAQPage"')) ?? '';
    expect(faq, 'no se encontró el FAQPage').not.toBe('');
    expect(faq).toContain(SISTEMAS.pellet.costeInstalacion.split(' – ')[0]); // «5.000»
    expect(faq).toContain(SISTEMAS.pellet.costeInstalacion.split(' – ')[1].replace(' €', '')); // «12.000»
    expect(faq).not.toContain('COP 3-5');
  });

  test('HALLAZGO dato: MOVES (movilidad eléctrica) y un «PERTE Industria Verde» inexistente como ayudas a la calefacción', async ({ page }) => {
    // HALLAZGO abierto: MOVES III es el programa de incentivos a la MOVILIDAD ELÉCTRICA (idae.es,
    // RDL 3/2025); no financia calefacción. No existe un «PERTE Industria Verde»: el PERTE de
    // descarbonización industrial es para la industria manufacturera (planderecuperacion.gob.es).
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const texto = await textoConGuia(page);
    expect(texto).not.toMatch(/\bMOVES\b/);
    expect(texto).not.toContain('PERTE Industria Verde');
  });

  test('HALLAZGO dato: la UE no exige «mezcla con hidrógeno o biogás» a las calderas de gas desde 2025', async ({ page }) => {
    // HALLAZGO abierto: lo que rige desde el 01/01/2025 es la prohibición de INCENTIVOS
    // financieros a calderas autónomas de combustibles fósiles (Directiva (UE) 2024/1275, art.
    // 17.15, y la guía de la Comisión de 17/10/2024). No hay requisito de mezcla.
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    expect(await textoConGuia(page)).not.toContain('mezcla con hidrógeno o biogás');
  });

  test('HALLAZGO texto: la guía pinta «Next Generation EUcanalizados», sin espacio', async ({ page }) => {
    // HALLAZGO abierto: en JSX, el salto de línea entre </strong> y «canalizados» se come el
    // espacio. Sale en la sección «Cómo aprovechar las subvenciones» de la guía desplegada.
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    expect(await textoConGuia(page)).not.toContain('EUcanalizados');
  });

  test('HALLAZGO fechado: «Subvenciones disponibles en 2025» y la guía «España 2025», a 24/09/2026', async ({ page }) => {
    // HALLAZGO abierto: contenido anclado a un año cerrado y presentado en presente (mismo
    // defecto que selector-smartphone, hallazgo 948). También en el FAQPage: «En 2025 siguen activas».
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    expect(await textoConGuia(page)).not.toMatch(/disponibles en 2025|España 2025|tecnologías en 2025/);
  });

  test('HALLAZGO marcas: el consejo de clima frío recomienda Mitsubishi, Daikin y Fujitsu', async ({ page }) => {
    // HALLAZGO abierto: la familia da perfiles técnicos, no marcas. Sale con clima «Frío o muy
    // frío» y aerotermia o split como recomendación: 76.593 perfiles.
    test.fail();
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    expect(await textoResultado(page)).not.toMatch(/Mitsubishi|Daikin|Fujitsu/);
  });

  test('HALLAZGO región: contenido de España (IDAE, CCAA, Canarias, euros) sin RegionBadge', async ({ page }) => {
    // HALLAZGO abierto: §1.bis del CLAUDE.md; mismo defecto que selector-mascota, hallazgo 1340.
    test.fail();
    await abrirTest(page);
    await expect(page.locator('[role="note"][aria-label*="España"]')).toHaveCount(1, { timeout: 2000 });
  });

  test('HALLAZGO pregunta 5: una caldera de entre 5 y 10 años no tiene respuesta', () => {
    // HALLAZGO abierto: las opciones son «Sí, menos de 5 años» y «Sí, más de 10 años». La guía
    // llama reciente a la de «menos de 7 años», el consejo habla de «10-12 años» y de «10-15», la
    // guía de una vida útil de 15-20 y la tarjeta de «15 – 25 años» para cualquier sistema.
    test.fail();
    const etiquetas = PREGUNTAS.find((p) => p.id === 5)?.opciones.map((o) => o.etiqueta) ?? [];
    const menos = Number(etiquetas.join(' ').match(/menos de (\d+) años/)?.[1] ?? NaN);
    const mas = Number(etiquetas.join(' ').match(/más de (\d+) años/)?.[1] ?? NaN);
    const intermedia = etiquetas.some((e) => /\d+\s*(?:–|-|a|y)\s*\d+\s*años/.test(e));
    expect(intermedia || menos >= mas, `menos de ${menos} / más de ${mas}`).toBe(true);
  });

  // ─ Contraste, medido con los colores computados ─

  test('HALLAZGO contraste: textos pequeños en color de marca por debajo de 4,5:1', async ({ page }) => {
    // HALLAZGO abierto (mismo defecto que selector-mascota, hallazgo 1343). Medido el 24/09/2026:
    // claro — progresoPaso 3,93 · razonesTitulo 3,67 · subvencionesTitulo 2,50 · costeValor 3,93 ·
    // btnRepetir 3,93; oscuro — costeValor 4,36 · costeLabel 4,39. Ningún candado lo mira: el de
    // cabeceras de tabla deja fuera, a propósito, el color de marca como texto.
    test.fail();
    const medidas: Record<string, number> = {};
    await abrirTest(page);
    medidas['claro progresoPaso'] = await contraste(page, '[class*="progresoPaso"]');
    await responderEtiquetas(page, NORMAL);
    for (const s of ['razonesTitulo', 'subvencionesTitulo', 'costeValor', 'btnRepetir']) {
      medidas[`claro ${s}`] = await contraste(page, `[class*="${s}"]`);
    }
    await ponerTemaOscuro(page);
    await responderEtiquetas(page, NORMAL);
    for (const s of ['costeValor', 'costeLabel']) {
      medidas[`oscuro ${s}`] = await contraste(page, `[class*="${s}"]`);
    }
    const bajos = Object.entries(medidas).filter(([, v]) => v < 4.5).map(([k, v]) => `${k} ${v.toFixed(2)}`);
    expect(bajos).toEqual([]);
  });

  test('HALLAZGO hero de resultados: blanco sobre el degradado azul→teal, en lugar de --hero-bg', async ({ page }) => {
    // HALLAZGO abierto: la intro usa --hero-bg (obligatorio en los hero), la pantalla de
    // resultado un degradado --primary → --secondary. Medido sobre la extensión real del texto:
    // claro — subtítulo 2,80 (exige 4,5); oscuro — título 2,40 (exige 3, texto grande) y
    // subtítulo 2,18.
    test.fail();
    const bajos: string[] = [];
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const subClaro = await contraste(page, '[class*="heroSubtitleSm"]');
    if (subClaro < 4.5) bajos.push(`claro subtítulo ${subClaro.toFixed(2)}`);
    await ponerTemaOscuro(page);
    await responderEtiquetas(page, NORMAL);
    const tituloOscuro = await contraste(page, '[class*="heroTitleSm"]');
    const subOscuro = await contraste(page, '[class*="heroSubtitleSm"]');
    if (tituloOscuro < 3) bajos.push(`oscuro título ${tituloOscuro.toFixed(2)}`);
    if (subOscuro < 4.5) bajos.push(`oscuro subtítulo ${subOscuro.toFixed(2)}`);
    expect(bajos).toEqual([]);
  });
});
