import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, ORDEN_PRIMA, PREGUNTAS, RESULTADOS, type Modalidad } from '../../app/selector-seguro-coche/motor';

/**
 * ¿Qué seguro de coche necesitas? (selector-seguro-coche) — reparado el 24/09/2026 desde una
 * sospecha del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra estaba BIEN: anuncia el mismo porcentaje (0-100) que pinta. No se ha tocado.
 *   · Empates: `reduce` con `>` estricto → a igualdad se quedaba la primera modalidad del
 *     objeto, terceros básico, la de MENOS cobertura. Enumerado: 12.580 de 93.312 perfiles
 *     empatan en cabeza, y en 5.359 cambia la recomendación. Entre ellos, el de abajo: un coche
 *     de menos de dos años y más de 25.000 € recibía «terceros básico».
 *   · Razones fijas: la app no da un «por qué» personal; la descripción y las coberturas son de
 *     la modalidad, no del usuario. Nada que reparar ahí.
 *
 * EL MOTOR (app/selector-seguro-coche/motor.ts): las mismas preguntas y pesos (sin empate, la
 * recomendación no cambia en ninguna combinación). A igualdad, primero la capacidad de pagar
 * una reparación de tu bolsillo (pregunta 9), luego el valor del coche (2) y por último la
 * prima más baja; el empate se anuncia.
 */

async function abrirTest(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-seguro-coche/');
  // Sin <input> no hay rastreador que sondear (`_hidratacion.ts`); el testigo es que React
  // haya colgado sus props del primer radio. Mismo criterio que selector-smartphone.
  await page.waitForFunction(
    () => {
      const boton = document.querySelector('[role="radiogroup"] button');
      return Boolean(boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$')));
    },
    null,
    { timeout: 20_000 },
  );
}

async function responder(page: Page, indices: readonly number[]): Promise<void> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Ir a la siguiente pregunta' }).click();
  }
  await page.locator('[class*="resultadoTitulo"]').waitFor();
}

// Menos de 2 años · Más de 25.000 € · Sin financiar · Más de 5 años conduciendo · Sin
// siniestros · Uso ocasional · Ciudad · Garaje siempre · «Podría asumir parte» · Sin jóvenes.
// (básico, ampliado, TR con franquicia, TR sin franquicia), pregunta a pregunta:
//   P1 TRsf 3 · P2 TRsf 3 · P3 bás 1, amp 1, TRf 1 · P4 bás 1, amp 1 · P5 bás 1, amp 1 ·
//   P6 bás 2, amp 1 · P7 TRf 2, TRsf 1 · P8 bás 1, amp 1 · P9 TRf 3 · P10 bás 1, amp 1
//   = básico 7 · ampliado 6 · TR con franquicia 6 · TR sin franquicia 7.
// Empate a 7. La pregunta 9 no los separa (0 y 0); el valor del coche sí (TRsf 3, básico 0).
// Antes: terceros básico para un coche casi nuevo de más de 25.000 €, por ir primero.
const COCHE_NUEVO = [0, 0, 1, 2, 0, 0, 0, 0, 1, 2] as const;

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

test('la barra de progreso anuncia lo mismo que pinta (ya lo hacía; que no se estropee)', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  for (let paso = 0; paso < 3; paso++) {
    const [ahora, min, max] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
    );
    const anunciado = (ahora - min) / (max - min);
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo(paso / 10, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Ir a la siguiente pregunta' }).click();
  }
});

test('un empate se anuncia, y un coche casi nuevo de más de 25.000 € no recibe «terceros básico» por ir primero', async ({ page }) => {
  await abrirTest(page);
  await responder(page, COCHE_NUEVO);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Todo Riesgo sin Franquicia');
  await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
    'el todo riesgo sin franquicia y el seguro a terceros básico encajan exactamente igual; se muestra primero el todo riesgo sin franquicia porque encaja mejor con el valor de tu coche',
  );
});

test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  const DESEMPATE = [
    { indice: 8, frase: 'pagar una reparación de tu bolsillo' },
    { indice: 1, frase: 'el valor de tu coche' },
  ];
  const r: number[] = [];
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  const peso = (i: number, k: Modalidad) => PREGUNTAS[i].opciones[r[i]].pesos[k] ?? 0;
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const max = Math.max(...CLAVES.map((k) => res.puntos[k]));
      if (res.puntos[res.modalidad] !== max) mal('no tiene la puntuación máxima');
      const reales = CLAVES.filter((k) => k !== res.modalidad && res.puntos[k] === max);
      if (reales.length !== res.empatadas.length) mal('empatadas mal contadas');
      if (reales.length === 0 && res.criterioDesempate !== '') mal('criterio sin empate');
      if (reales.length > 0) empates++;
      for (const k of reales) {
        const decide = DESEMPATE.find(({ indice }) => peso(indice, res.modalidad) !== peso(indice, k));
        if (decide) {
          if (peso(decide.indice, res.modalidad) < peso(decide.indice, k)) mal(`pierde contra ${k}`);
          if (!res.criterioDesempate.includes(decide.frase)) mal('no nombra el criterio que decide');
        } else {
          if (ORDEN_PRIMA[res.modalidad] > ORDEN_PRIMA[k]) mal(`prima mayor que ${k}`);
          if (!res.criterioDesempate.includes('prima más baja')) mal('no nombra la prima');
        }
      }
      return;
    }
    for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
      r[i] = k;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(total).toBe(93_312);
  expect(empates).toBe(12_580);
});

// ─────────────────────────────────────────────────────────────────────────────
// Inspección del 24/09/2026 (primera inspección de la app, tras la reparación en lote 99acf1e0).
//
// Los recorridos llevan las respuestas LITERALES y la suma hecha a mano con los pesos de
// motor.ts, en el orden (básico, ampliado, TR con franquicia, TR sin franquicia). Los recuentos
// de los comentarios salen de enumerar las 93.312 combinaciones con el motor real.
// Cada hallazgo abierto va como test.fail(): pasa hoy y se pone rojo cuando se repare.
// Lo que ya cubren los cuatro tests de arriba (radios, barra, el empate del coche nuevo y el
// barrido de empates) no se repite aquí.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspección 24/09/2026 — restricciones declaradas, fichas fijas, datos y contraste', () => {
  // 5-10 años · 3.000-10.000 € · No, de mi propiedad · Más de 5 años · Ninguno · Uso diario ·
  // Semiurbana · A veces en la calle · Podría asumir parte · Solo conductores con experiencia.
  // P1 (0,2,1,0) P2 (0,4,2,0) P3 (1,5,3,0) P4 (2,6,3,0) P5 (3,7,3,0) P6 (3,8,4,0) P7 (3,9,5,0)
  // P8 (3,10,6,0) P9 (3,10,9,0) P10 (4,11,9,0) → Terceros Ampliado 11 frente a 9, sin empate.
  const NORMAL = [2, 2, 1, 2, 0, 1, 1, 1, 1, 2] as const;

  // Igual de corriente, pero FINANCIADO: 5-10 años · 3.000-10.000 € · Sí, financiación activa ·
  // Más de 5 años · Ninguno · Ocasional · Carretera o rural · Garaje siempre · Sí, sin problemas ·
  // Solo con experiencia. P1 (0,2,1,0) P2 (0,4,2,0) P3 (0,4,3,3) P4 (1,5,3,3) P5 (2,6,3,3)
  // P6 (4,7,3,3) P7 (5,9,3,3) P8 (6,10,3,3) P9 (8,11,3,3) P10 (9,12,3,3) → Terceros Ampliado 12.
  const FINANCIADO = [2, 2, 0, 2, 0, 0, 2, 0, 0, 2] as const;

  // Nuevo, caro y financiado: Menos de 2 años · Más de 25.000 € · Sí, financiación activa · resto
  // como FINANCIADO. TRsf 3+3+3 = 9 · TRf 1 · básico 1+1+2+1+1+2+1 = 9 · ampliado 8. Empate a 9
  // entre básico y TRsf; la pregunta 9 («Sí, sin problemas»: básico 2, TRsf 0) deja delante al básico.
  const FINANCIADO_NUEVO = [0, 0, 0, 2, 0, 0, 2, 0, 0, 2] as const;

  // Más de 10 años · Menos de 3.000 € · No, de mi propiedad · Novel · Ninguno · Ocasional ·
  // Ciudad · A veces en la calle · Podría asumir parte · Joven esporádicamente.
  // P1 (3,1,0,0) P2 (6,1,0,0) P3 (7,2,1,0) P4 (7,2,3,2) P5 (8,3,3,2) P6 (10,4,3,2) P7 (10,4,5,3)
  // P8 (10,5,6,3) P9 (10,5,9,3) P10 (10,6,11,3) → TR con franquicia 11 frente a básico 10.
  const VIEJO_BARATO = [3, 3, 1, 0, 0, 0, 0, 1, 1, 1] as const;

  // Menos de 2 años · Más de 25.000 € · No, de mi propiedad · Más de 5 años · Ninguno · Ocasional ·
  // Carretera o rural · Garaje siempre · Sí, sin problemas · Solo con experiencia.
  // P1 (0,0,0,3) P2 (0,0,0,6) P3 (1,1,1,6) P4 (2,2,1,6) P5 (3,3,1,6) P6 (5,4,1,6) P7 (6,6,1,6)
  // P8 (7,7,1,6) P9 (9,8,1,6) P10 (10,9,1,6) → Terceros Básico 10 frente a 9, sin empate.
  const NUEVO_CARO_BASICO = [0, 0, 1, 2, 0, 0, 2, 0, 0, 2] as const;

  // Menos de 2 años · Más de 25.000 € · No, de mi propiedad · Novel · Ninguno · Uso diario ·
  // Ciudad · A veces en la calle · No, sería un problema serio · Sí, joven o novel FRECUENTE.
  // P1 (0,0,0,3) P2 (0,0,0,6) P3 (1,1,1,6) P4 (1,1,3,8) P5 (2,2,3,8) P6 (2,3,4,8) P7 (2,3,6,9)
  // P8 (2,4,7,9) P9 (2,4,7,12) P10 (2,4,8,14) → TR sin franquicia 14.
  const JOVEN_FRECUENTE = [0, 0, 1, 0, 0, 1, 0, 1, 2, 0] as const;

  // NORMAL con «Uso profesional o comercial intensivo» en la pregunta 6:
  // P1 (0,2,1,0) P2 (0,4,2,0) P3 (1,5,3,0) P4 (2,6,3,0) P5 (3,7,3,0) P6 (3,7,4,2) P7 (3,8,5,2)
  // P8 (3,9,6,2) P9 (3,9,9,2) P10 (4,10,9,2) → Terceros Ampliado 10 frente a 9.
  const PROFESIONAL = [2, 2, 1, 2, 0, 2, 1, 1, 1, 2] as const;

  const titulo = (page: Page) => page.locator('[class*="resultadoTitulo"]');
  const zonaResultado = (page: Page) => page.getByRole('region', { name: 'Tu recomendación de seguro' });

  async function abrirGuia(page: Page): Promise<string> {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
    return page.locator('body').innerText();
  }

  async function jsonLd(page: Page, tipo: string): Promise<Record<string, unknown>> {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
    if (!hallado) throw new Error(`no hay JSON-LD ${tipo}`);
    return hallado;
  }

  /**
   * Contraste WCAG con los colores COMPUTADOS: compone las capas rgba de los antepasados y la
   * opacidad acumulada; si hay un degradado debajo, toma el peor punto bajo la extensión real
   * del texto (Range), no bajo la caja de bloque.
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
      const color = parse(getComputedStyle(el).color) ?? { r: 0, g: 0, b: 0, a: 1 };
      let opacidad = 1;
      for (let e: Element | null = el; e; e = e.parentElement) opacidad *= Number(getComputedStyle(e).opacity);
      const texto: Rgba = { ...color, a: color.a * opacidad };

      for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
        const img = getComputedStyle(e).backgroundImage;
        if (img.includes('linear-gradient(135deg')) {
          const paradas = [...img.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0]) ?? { r: 0, g: 0, b: 0, a: 1 });
          const caja = e.getBoundingClientRect();
          const L = (caja.width + caja.height) * Math.SQRT1_2;
          const cx = caja.left + caja.width / 2;
          const cy = caja.top + caja.height / 2;
          const en = (x: number, y: number): Rgba => {
            const u = Math.min(1, Math.max(0, 0.5 + ((x - cx) + (y - cy)) * Math.SQRT1_2 / L));
            const [a, b] = [paradas[0], paradas[paradas.length - 1]];
            return { r: a.r + (b.r - a.r) * u, g: a.g + (b.g - a.g) * u, b: a.b + (b.b - a.b) * u, a: 1 };
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

  // ── Lo que está bien ────────────────────────────────────────────────────────

  test('caso normal: un coche de 5-10 años y 3.000-10.000 € recibe terceros ampliado (11 frente a 9), sin empate', async ({ page }) => {
    await abrirTest(page);
    await responder(page, NORMAL);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Ampliado');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    expect(calcularResultado(NORMAL).puntos).toEqual({
      terceros_basico: 4, terceros_ampliado: 11, todo_riesgo_franquicia: 9, todo_riesgo_sin_franquicia: 0,
    });
  });

  test('sin elegir opción no se avanza: «Siguiente» deshabilitado, y un clic forzado no mueve la pregunta ni la barra', async ({ page }) => {
    await abrirTest(page);
    const siguiente = page.getByRole('button', { name: 'Ir a la siguiente pregunta' });
    await expect(siguiente).toBeDisabled();
    await siguiente.click({ force: true });
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '0');
  });

  test('riesgo 2: el aviso de responsabilidad es financial/high, está desplegado y no se puede plegar', async ({ page }) => {
    // _private/DISCLAIMER-POLICY.md: «Calculadoras de ahorro, seguros…» → Nivel 2 ALTO,
    // severity="high", collapsible={false}. Y fuera de <EducationalSection>, que nace plegada.
    await abrirTest(page);
    const aviso = page.locator('[class*="disclaimerCard"]').first();
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveClass(/variant-financial/);
    await expect(aviso).toHaveClass(/severity-high/);
    await expect(aviso.locator('button')).toHaveCount(0);
    await expect(aviso).toContainText('no constituye asesoramiento financiero');
  });

  test('tema oscuro (con el conmutador real): los textos del resultado pasan de 4,5:1', async ({ page }) => {
    await abrirTest(page);
    await responder(page, FINANCIADO_NUEVO); // el que enseña el aviso de empate
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // El fondo de la página transiciona; se espera a que llegue a su valor oscuro antes de medir.
    await expect(page.locator('[class*="container"]').first()).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    await expect(page.locator('[class*="coberturaItem"]').first()).toHaveCSS('color', 'rgb(176, 176, 176)');
    await expect(page.locator('[class*="warningBox"]')).toHaveCSS('background-color', 'rgb(42, 34, 0)');
    // Medido el 24/09/2026: aviso de empate 9,47 · cobertura 6,62 · advertencia 11,58 · repetir 6,62.
    for (const sel of ['[class*="avisoEmpate"]', '[class*="coberturaItem"]', '[class*="warningBox"] span', '[class*="btnReiniciar"]']) {
      expect(await contraste(page, sel), sel).toBeGreaterThanOrEqual(4.5);
    }
  });

  // ── Hallazgos abiertos ──────────────────────────────────────────────────────

  test('HALLAZGO financiado: con financiación activa recomienda un seguro a terceros sin mencionar la financiación', async ({ page }) => {
    // HALLAZGO abierto: la propia guía dice «Si el coche es nuevo o financiado: todo riesgo» y
    // «el contrato de leasing o préstamo suele exigir todo riesgo», pero «Sí, sigue con
    // financiación activa» solo suma puntos (TRsf +3, TRf +1). Barrido: 7.209 de los 46.656
    // perfiles financiados acaban en terceros (2.986 básico, 4.223 ampliado; 1.989 por empate).
    // Esperado (referencia: filtrar o avisar): todo riesgo —en FINANCIADO, TRf y TRsf empatan a 3,
    // la pregunta 9 no los separa y el valor sí (TRf 1, TRsf 0) → TR con franquicia— o un aviso
    // que nombre la financiación. Obtenido: Terceros Ampliado (12), y en FINANCIADO_NUEVO
    // Terceros Básico por empate con la ficha «Ideal para vehículos antiguos de bajo valor».
    test.fail();
    await abrirTest(page);
    await responder(page, FINANCIADO);
    expect(await zonaResultado(page).innerText()).toMatch(/Todo Riesgo|[Ff]inanci/);
    await abrirTest(page);
    await responder(page, FINANCIADO_NUEVO);
    expect(await zonaResultado(page).innerText()).toMatch(/Todo Riesgo|[Ff]inanci/);
  });

  test('HALLAZGO valor: un coche de más de 10 años y menos de 3.000 € recibe todo riesgo sin que se nombre el valor', async ({ page }) => {
    // HALLAZGO abierto: la ficha de básico («Ideal para vehículos antiguos de bajo valor donde el
    // coste del seguro podría superar el valor del coche»), la guía («Más de 12 años → terceros
    // básico») y el FAQPage («El todo riesgo suele compensar cuando el valor del vehículo supera
    // los 8.000-10.000 €») dicen una cosa y el recuento otra. Barrido: 6.969 de los 11.664
    // perfiles SIN financiar con «Menos de 3.000 €» acaban en todo riesgo (5.657 con franquicia,
    // cuya ficha no dice nada del valor; 1.312 sin franquicia, con la advertencia genérica).
    // Esperado: terceros (básico 10 es el segundo) o un aviso que nombre el valor declarado.
    // Obtenido: Todo Riesgo con Franquicia (11).
    test.fail();
    await abrirTest(page);
    await responder(page, VIEJO_BARATO);
    expect(await zonaResultado(page).innerText()).toMatch(/Terceros|valor|3\.000/);
  });

  test('HALLAZGO ficha fija: a un coche de menos de 2 años y más de 25.000 € le dice «ideal para vehículos antiguos de bajo valor»', async ({ page }) => {
    // HALLAZGO abierto: la descripción de cada modalidad es fija. Barrido: 2.138 perfiles con
    // «Menos de 2 años» o «Más de 25.000 €» reciben el básico con esa frase; 2.414 con «Más de
    // 25.000 €» reciben el ampliado con «Una opción equilibrada para coches de valor medio».
    test.fail();
    await abrirTest(page);
    await responder(page, NUEVO_CARO_BASICO);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Básico');
    expect(await page.locator('[class*="resultadoSubtitulo"]').innerText()).not.toContain('Ideal para vehículos antiguos de bajo valor');
  });

  test('HALLAZGO conductor joven: a quien declara un conductor joven frecuente le promete «Conductor designado sin recargo»', async ({ page }) => {
    // HALLAZGO abierto: la guía dice «Los conductores menores de 25 años pagan primas más
    // elevadas» y el FAQPage que los noveles pagan más «en cualquier modalidad». Barrido: 12.129
    // perfiles con «Sí, conductor/a joven o novel frecuente» reciben esa ficha.
    test.fail();
    await abrirTest(page);
    await responder(page, JOVEN_FRECUENTE);
    await expect(titulo(page)).toHaveText('Todo Riesgo sin Franquicia');
    expect(await page.locator('[class*="coberturaItem"]').allInnerTexts()).not.toContain('Conductor designado sin recargo');
  });

  test('HALLAZGO uso profesional: el resultado no dice nada de un uso que hay que declarar en la póliza', async ({ page }) => {
    // HALLAZGO abierto: «Uso profesional o comercial intensivo» solo suma puntos; en los 23.328
    // perfiles que lo eligen, la pantalla —y la guía— no dicen que el uso se declara a la
    // aseguradora (art. 10 de la Ley 50/1980: si el riesgo se declaró inexacto, la prestación se
    // reduce en proporción a la prima). Esperado: una mención al uso declarado. Obtenido: la
    // ficha de terceros ampliado, idéntica a la del uso particular.
    test.fail();
    await abrirTest(page);
    await responder(page, PROFESIONAL);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Ampliado');
    expect(await zonaResultado(page).innerText()).toMatch(/profesional|comercial|declar/i);
  });

  test('HALLAZGO guía: «Si el coche es nuevo o financiado: todo riesgo obligatorio»', async ({ page }) => {
    // HALLAZGO abierto: la única obligación legal es la responsabilidad civil (RDL 8/2004,
    // art. 2.1, BOE-A-2004-18911); un coche nuevo sin financiar no tiene obligación de todo
    // riesgo, y en el financiado la exige, si acaso, el contrato. La propia guía, más abajo,
    // dice «suele exigir».
    test.fail();
    await abrirTest(page);
    expect(await abrirGuia(page)).not.toContain('todo riesgo obligatorio');
  });

  test('HALLAZGO Latam: la guía dice que el mínimo legal cubre los daños a los bienes de otros, también en Colombia y Chile', async ({ page }) => {
    // HALLAZGO abierto: nombra Colombia, México, Argentina y Chile y afirma «Normalmente se exige
    // por ley … RC obligatoria, que cubre los daños que puedas causar a otras personas o sus
    // bienes». En Colombia el SOAT cubre «los daños corporales que se causen a las personas»
    // (EOSF art. 192.1; Ley 769/2002, art. 42) y en Chile el SOAP la muerte y las lesiones
    // corporales (Ley 18.490, art. 24): ninguno cubre bienes.
    test.fail();
    await abrirTest(page);
    const guia = await abrirGuia(page);
    expect(guia).toContain('Colombia');
    expect(guia).not.toContain('que cubre los daños que puedas causar a otras personas o sus bienes');
  });

  test('HALLAZGO RegionBadge: normativa y cifras de España sin aviso de ámbito', async ({ page }) => {
    // HALLAZGO abierto (§1.bis): tramos en €, cobertura «zona UE», renovación con preaviso de un
    // mes (art. 22 de la Ley 50/1980) presentada a lectores de cuatro países latinoamericanos.
    test.fail();
    await abrirTest(page);
    await expect(page.locator('[role="note"][aria-label*="España"]')).toHaveCount(1);
  });

  test('HALLAZGO FAQPage: para un coche de más de 10 años y poco valor dice «terceros ampliado»; la guía, «terceros básico»', async ({ page }) => {
    // HALLAZGO abierto: el FAQPage (lo que leen las IA) y la guía se contradicen, y además los
    // tramos de la guía (3 / 7 / 12 años) no son los de la pregunta 1 (2 / 5 / 10).
    test.fail();
    await abrirTest(page);
    const faq = JSON.stringify(await jsonLd(page, 'FAQPage'));
    const guia = await abrirGuia(page);
    const faqAmpliado = faq.includes('más de diez años y un valor de mercado bajo, el seguro a terceros ampliado suele ser suficiente');
    const guiaBasico = /Más de 12 años → terceros básico/.test(guia);
    expect(faqAmpliado && guiaBasico, 'FAQ «ampliado» frente a guía «básico»').toBe(false);
  });

  test('HALLAZGO extranjero: «Cobertura en el extranjero (zona UE)» solo en las fichas de todo riesgo', async () => {
    // HALLAZGO abierto: el seguro obligatorio ya cubre la responsabilidad civil «en todo el
    // territorio del Espacio Económico Europeo» con una sola prima (RDL 8/2004, art. 4.1). Listarlo
    // solo en el todo riesgo sugiere que el de terceros no cubre fuera.
    test.fail();
    const enTR = RESULTADOS.todo_riesgo_franquicia.coberturas.some((c) => /extranjero|Europa/.test(c));
    const enTerceros = RESULTADOS.terceros_basico.coberturas.some((c) => /extranjero|Europa|EEE|UE/.test(c));
    expect(enTR && !enTerceros, 'solo el todo riesgo dice cubrir en el extranjero').toBe(false);
  });

  test('HALLAZGO cifras sin fuente: «el precio puede variar un 40 %», «franquicia habitualmente entre 150 € y 600 €»', async ({ page }) => {
    // HALLAZGO abierto (neutralidad editorial, regla 1): ninguna de las cifras atribuye fuente ni año.
    test.fail();
    await abrirTest(page);
    await abrirGuia(page);
    const consejo = await page.locator('li', { hasText: '40 %' }).innerText();
    expect(consejo).toMatch(/según|fuente|estudio|OCU|\(\d{4}\)/);
    expect(RESULTADOS.todo_riesgo_franquicia.advertencia).toMatch(/según|fuente|estudio|\(\d{4}\)/);
  });

  test('HALLAZGO todo riesgo: «Cualquier daño queda cubierto sin coste adicional»', async ({ page }) => {
    // HALLAZGO abierto: absoluto que la propia app desmiente («Lee el condicionado específico de
    // cada póliza: las coberturas incluidas pueden diferir», «Vehículo de sustitución incluido
    // (según póliza)»). Sale en los 26.236 perfiles que reciben TR sin franquicia.
    test.fail();
    await abrirTest(page);
    await responder(page, JOVEN_FRECUENTE);
    expect(await page.locator('[class*="resultadoSubtitulo"]').innerText()).not.toContain('Cualquier daño queda cubierto');
  });

  test('HALLAZGO JSON-LD: el WebApplication sale con featureList vacío', async ({ page }) => {
    // HALLAZGO abierto: metadata.ts pasa `features: []`; el CLAUDE.md (§1.ter) pide 4-8 reales.
    test.fail();
    await abrirTest(page);
    const app = await jsonLd(page, 'WebApplication');
    expect((app.featureList as unknown[]).length).toBeGreaterThanOrEqual(4);
  });

  test('HALLAZGO contraste: la opción marcada y «Siguiente →» no llegan a 4,5:1 en claro', async ({ page }) => {
    // HALLAZGO abierto: opción marcada #2E86AB sobre #e8f4fb, 0,95rem en 600 → 3,67:1;
    // «Siguiente →» blanco sobre #2E86AB, 1rem en 600 → 4,11:1 (igual en oscuro). No lo vigila
    // ningún candado (check:contraste-cabeceras solo mira <th>/<thead>).
    test.fail();
    await abrirTest(page);
    const radio = page.locator('[role="radio"]').nth(1);
    await radio.click();
    await expect(radio).toHaveCSS('background-color', 'rgb(232, 244, 251)');
    await expect(page.locator('[class*="btnPrimary"]')).toHaveCSS('opacity', '1');
    const marcada = await contraste(page, '[role="radio"][aria-checked="true"] [class*="opcionTexto"]');
    const siguiente = await contraste(page, '[class*="btnPrimary"]');
    expect({ marcada: marcada >= 4.5, siguiente: siguiente >= 4.5 }, `marcada ${marcada.toFixed(2)} · siguiente ${siguiente.toFixed(2)}`)
      .toEqual({ marcada: true, siguiente: true });
  });

  test('HALLAZGO de familia: el hero del resultado pone blanco sobre el degradado de marca y no llega al contraste', async ({ page }) => {
    // HALLAZGO abierto (de familia; lo tienen las dos referencias): medido bajo la extensión
    // real del texto en NORMAL, el subtítulo (0,95rem, opacidad 0,9) da 2,65:1 (exige 4,5); el
    // título (24px en negrita, exige 3) pasa por poco con 3,14. Los colores no cambian con el tema.
    test.fail();
    await abrirTest(page);
    await responder(page, NORMAL);
    const t = await contraste(page, '[class*="resultadoTitulo"]');
    const s = await contraste(page, '[class*="resultadoSubtitulo"]');
    expect({ titulo: t >= 3, subtitulo: s >= 4.5 }, `título ${t.toFixed(2)} · subtítulo ${s.toFixed(2)}`)
      .toEqual({ titulo: true, subtitulo: true });
  });
});
