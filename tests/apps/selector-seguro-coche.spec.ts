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
// Los 15 hallazgos (1473-1487) se repararon el mismo día: sus test.fail() pasaron a exigir la
// reparación (al final del describe).
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

  test('tema oscuro: la nota de lo declarado, «Siguiente» y el hero del resultado también pasan', async ({ page }) => {
    // Medido tras la reparación del 24/09/2026 (hallazgos 1486 y 1487 en oscuro).
    await abrirTest(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[class*="container"]').first()).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    await page.locator('[role="radio"]').nth(1).click();
    // --primary-boton es el mismo #26718F en los dos temas.
    await expect(page.locator('[class*="btnPrimary"]')).toHaveCSS('background-color', 'rgb(38, 113, 143)');
    await expect(page.locator('[class*="btnPrimary"]')).toHaveCSS('opacity', '1'); // deja de estar deshabilitado
    expect(await contraste(page, '[class*="btnPrimary"]'), 'Siguiente').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[role="radio"][aria-checked="true"] [class*="opcionTexto"]'), 'opción marcada').toBeGreaterThanOrEqual(4.5);
    await page.getByRole('button', { name: 'Ir a la siguiente pregunta' }).click();
    for (let i = 1; i < FINANCIADO_NUEVO.length; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(FINANCIADO_NUEVO[i]).click();
      await page.getByRole('button', { name: i === FINANCIADO_NUEVO.length - 1 ? 'Ver resultado' : 'Ir a la siguiente pregunta' }).click();
    }
    await titulo(page).waitFor();
    expect(await contraste(page, '[class*="avisoNota"]'), 'nota').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="resultadoTitulo"]'), 'título del resultado').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="resultadoSubtitulo"]'), 'subtítulo del resultado').toBeGreaterThanOrEqual(4.5);
  });

  // ── Hallazgos reparados el 24/09/2026 ───────────────────────────────────────
  // Eran test.fail() que documentaban el defecto; ahora exigen la reparación. Los textos
  // esperados se escriben enteros, y las modalidades que se nombran salen de la suma a mano de
  // los comentarios de cada perfil (arriba), no del motor.

  /** Recorre las 93.312 combinaciones con el motor real. */
  function barrer(visita: (r: readonly number[]) => void): void {
    const r: number[] = [];
    const rec = (i: number): void => {
      if (i === PREGUNTAS.length) { visita(r); return; }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) { r[i] = k; rec(i + 1); }
    };
    rec(0);
  }

  const nota = (page: Page, tipo: string) => page.locator(`[data-nota="${tipo}"]`);
  /** El texto de la nota sin el icono decorativo (⚠️, aria-hidden) que la encabeza. */
  const textoDeNota = async (page: Page, tipo: string): Promise<string> =>
    (await nota(page, tipo).innerText()).replace(/^⚠️\s*/, '');

  test('1473 financiado: con una recomendación a terceros se avisa del contrato y se nombra el todo riesgo que mejor encaja', async ({ page }) => {
    // Por qué nota y no filtro: la ley solo obliga a la RC (RDL 8/2004, art. 2.1, BOE-A-2004-18911);
    // el todo riesgo lo exige, si acaso, el contrato. Filtrar repondría el «todo riesgo
    // obligatorio» del hallazgo 1478. La recomendación por puntos no cambia.
    // FINANCIADO: TRf 3 y TRsf 3 empatan; la pregunta 9 («Sí, sin problemas») no los separa y el
    // valor (3.000-10.000 €: TRf 1, TRsf 0) deja delante el todo riesgo con franquicia.
    await abrirTest(page);
    await responder(page, FINANCIADO);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Ampliado');
    expect(await textoDeNota(page, 'financiacion')).toBe(
      'Has dicho que el coche sigue financiado. La ley solo obliga a la responsabilidad civil, pero tu contrato de préstamo o leasing puede exigir un seguro a todo riesgo: revísalo antes de contratar. Si lo exige, la opción que mejor encaja con tus respuestas es el todo riesgo con franquicia.',
    );
    // FINANCIADO_NUEVO: básico y TRsf empatan a 9 (gana el básico por la pregunta 9); el todo
    // riesgo que mejor encaja es el sin franquicia (9 frente a 1).
    await abrirTest(page);
    await responder(page, FINANCIADO_NUEVO);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Básico');
    expect(await textoDeNota(page, 'financiacion')).toContain('la opción que mejor encaja con tus respuestas es el todo riesgo sin franquicia.');

    // Barrido: los 7.209 financiados que acaban en terceros (el recuento del acta) llevan TODOS
    // la nota, con un todo riesgo como alternativa; ninguno que acabe en todo riesgo la lleva.
    let enTerceros = 0;
    const fallos: string[] = [];
    barrer((r) => {
      if (r[2] !== 0) return;
      const res = calcularResultado(r);
      const n = res.notas.find((x) => x.tipo === 'financiacion');
      const tr = res.modalidad.startsWith('todo_riesgo');
      if (!tr) enTerceros++;
      if (!tr && !(n && n.alternativa?.startsWith('todo_riesgo'))) fallos.push(JSON.stringify(r));
      if (tr && n) fallos.push(`${JSON.stringify(r)} con nota sobrante`);
    });
    expect(fallos.slice(0, 5)).toEqual([]);
    expect(enTerceros).toBe(7_209);
  });

  test('1474 valor: con menos de 3.000 € y un todo riesgo se nombra el valor y el terceros que mejor encaja', async ({ page }) => {
    // Como regla, el seguro indemniza según el valor del coche justo antes del siniestro (Ley
    // 50/1980, art. 26, BOE-A-1980-22501). VIEJO_BARATO: TRf 11 frente a básico 10, que es el
    // terceros mejor puntuado (ampliado 6).
    await abrirTest(page);
    await responder(page, VIEJO_BARATO);
    await expect(titulo(page)).toHaveText('Todo Riesgo con Franquicia');
    expect(await textoDeNota(page, 'valor-bajo')).toBe(
      'Has dicho que el coche vale «Menos de 3.000 €». Como regla, el seguro indemniza según el valor que tenía el coche justo antes del siniestro (Ley 50/1980 de Contrato de Seguro, art. 26), así que la prima de un todo riesgo puede acercarse a lo máximo que llegaría a pagarte. Pide también precio para el seguro a terceros básico, la modalidad a terceros que mejor encaja con tus respuestas.',
    );
    // Barrido: los 6.969 perfiles SIN financiar del acta, y todos los demás de menos de 3.000 €
    // que acaban en todo riesgo, llevan la nota con un terceros como alternativa.
    let sinFinanciar = 0;
    const fallos: string[] = [];
    barrer((r) => {
      if (r[1] !== 3) return;
      const res = calcularResultado(r);
      if (!res.modalidad.startsWith('todo_riesgo')) return;
      if (r[2] === 1) sinFinanciar++;
      const n = res.notas.find((x) => x.tipo === 'valor-bajo');
      if (!(n && n.alternativa?.startsWith('terceros'))) fallos.push(JSON.stringify(r));
    });
    expect(fallos.slice(0, 5)).toEqual([]);
    expect(sinFinanciar).toBe(6_969);
  });

  test('1475 ficha fija: un coche de menos de 2 años y más de 25.000 € ya no lee «ideal para vehículos antiguos de bajo valor»', async ({ page }) => {
    // Las fichas describen la modalidad, no a quién le va bien; lo que depende de lo declarado va
    // en la nota. NUEVO_CARO_BASICO: básico 10; el todo riesgo mejor puntuado es el sin
    // franquicia (6 frente a 1).
    await abrirTest(page);
    await responder(page, NUEVO_CARO_BASICO);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Básico');
    await expect(page.locator('[class*="resultadoSubtitulo"]')).toHaveText(
      'La cobertura mínima que exige la ley en España: la responsabilidad civil obligatoria, que paga los daños que causes a otras personas y a sus bienes. No cubre los daños de tu propio coche.',
    );
    expect(await textoDeNota(page, 'valor-alto')).toBe(
      'Has dicho que el coche tiene «Menos de 2 años (vehículo nuevo o casi nuevo)» y vale «Más de 25.000 €». Con un seguro a terceros, si tienes un accidente del que eres responsable, la reparación de tu coche la pagas tú. Si no podrías asumirla, compara también el todo riesgo sin franquicia, el todo riesgo que mejor encaja con tus respuestas.',
    );
    // Ninguna ficha dice ya para quién es «ideal»: son las mismas en los 93.312 perfiles.
    const fichas = JSON.stringify(RESULTADOS);
    expect(fichas).not.toMatch(/[Ii]deal para|valor medio|Recomendado para/);
  });

  test('1476 conductor joven: sin «Conductor designado sin recargo», y con el recordatorio de declararlo', async ({ page }) => {
    // JOVEN_FRECUENTE: TRsf 14. Declarar al conductor: Ley 50/1980, arts. 10 (al contratar) y 11
    // (si cambia después).
    await abrirTest(page);
    await responder(page, JOVEN_FRECUENTE);
    await expect(titulo(page)).toHaveText('Todo Riesgo sin Franquicia');
    expect(await page.locator('[class*="coberturaItem"]').allInnerTexts()).toEqual([
      'Todo lo incluido en terceros ampliado',
      'Daños propios por accidente, sin franquicia a tu cargo',
      'Daños en aparcamiento y actos vandálicos',
      'Vehículo de sustitución (según póliza)',
    ]);
    expect(await textoDeNota(page, 'conductor-joven')).toBe(
      'Has dicho que conducen el coche menores de 25 años («Sí, conductor/a joven o novel frecuente»): decláralos en la póliza tal como lo usan, como conductores habituales u ocasionales. Si no constan, o constan como ocasionales siendo habituales, en un siniestro la indemnización puede reducirse (Ley 50/1980 de Contrato de Seguro, arts. 10 y 11).',
    );
    // Barrido: los 62.208 perfiles con un menor de 25 (frecuente o esporádico) llevan la nota.
    let conJoven = 0;
    let sinNota = 0;
    barrer((r) => {
      if (r[9] > 1) return;
      conJoven++;
      if (!calcularResultado(r).notas.some((x) => x.tipo === 'conductor-joven')) sinNota++;
    });
    expect({ conJoven, sinNota }).toEqual({ conJoven: 62_208, sinNota: 0 });
  });

  test('1477 uso profesional: el resultado dice que ese uso se declara en la póliza', async ({ page }) => {
    // PROFESIONAL: ampliado 10 frente a TRf 9. Ley 50/1980, art. 10: declarado inexacto, la
    // prestación se reduce en proporción a la prima.
    await abrirTest(page);
    await responder(page, PROFESIONAL);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Ampliado');
    expect(await textoDeNota(page, 'uso-profesional')).toBe(
      'Has elegido «Uso profesional o comercial intensivo»: declara ese uso al contratar. Hay que declarar a la aseguradora todo lo que influya en el riesgo, y si se declaró de forma inexacta, en un siniestro la indemnización se reduce en proporción a la prima que habría correspondido (Ley 50/1980 de Contrato de Seguro, art. 10).',
    );
    let profesionales = 0;
    let sinNota = 0;
    barrer((r) => {
      if (r[5] !== 2) return;
      profesionales++;
      if (!calcularResultado(r).notas.some((x) => x.tipo === 'uso-profesional')) sinNota++;
    });
    expect({ profesionales, sinNota }).toEqual({ profesionales: 23_328, sinNota: 0 });
  });

  test('1478 guía: ya no dice «todo riesgo obligatorio»; la única obligación legal es la RC', async ({ page }) => {
    // RDL 8/2004, art. 2.1 (BOE-A-2004-18911): «Todo propietario de vehículos a motor que tenga
    // su estacionamiento habitual en España estará obligado a suscribir y mantener en vigor un
    // contrato de seguro» — el de responsabilidad civil.
    await abrirTest(page);
    const guia = await abrirGuia(page);
    expect(guia).not.toContain('todo riesgo obligatorio');
    expect(guia).toContain('Ninguna ley lo exige; si el coche está financiado, revisa el contrato, porque puede pedirlo.');
    expect(guia).toContain('Es una condición del contrato, no de la ley, que solo obliga a la responsabilidad civil.');
  });

  test('1479 Latam: la guía no atribuye a otros países lo que cubre el seguro obligatorio español', async ({ page }) => {
    // La guía se ciñe a la ley española (RDL 8/2004, arts. 2.1 y 4.1) y dice que en otros países
    // el mínimo, y lo que cubre, depende de su ley. Ya no nombra Colombia ni Chile.
    await abrirTest(page);
    const guia = await abrirGuia(page);
    expect(guia).not.toContain('que cubre los daños que puedas causar a otras personas o sus bienes');
    expect(guia).not.toMatch(/Colombia|Chile|Argentina|México/);
    expect(guia).toContain('y el seguro mínimo obligatorio, y lo que cubre, depende de la ley de cada uno. Esta guía describe el caso de España');
  });

  test('1481 RegionBadge: aviso de ámbito tras el hero', async ({ page }) => {
    await abrirTest(page);
    const aviso = page.locator('[role="note"][aria-label*="España"]');
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toContainText('Normativa de referencia: España.');
  });

  test('1480 FAQPage y guía: la misma orientación por antigüedad, con los tramos de la pregunta 1', async ({ page }) => {
    // A mano, con los pesos de la pregunta 1: <2 años TRsf 3 · 2-5 años TRf 2 · 5-10 años
    // ampliado 2 · >10 años básico 3. Y de la pregunta 2: >25.000 € TRsf 3 · 10.000-25.000 € TRf 2 ·
    // 3.000-10.000 € ampliado 2 · <3.000 € básico 3.
    await abrirTest(page);
    const faq = JSON.stringify(await jsonLd(page, 'FAQPage'));
    expect(faq).toContain('menos de 2 años → todo riesgo sin franquicia; entre 2 y 5 años → todo riesgo con franquicia; entre 5 y 10 años → terceros ampliado; más de 10 años → terceros básico');
    expect(faq).toContain('más de 25.000 € → todo riesgo sin franquicia; entre 10.000 € y 25.000 € → todo riesgo con franquicia; entre 3.000 € y 10.000 € → terceros ampliado; menos de 3.000 € → terceros básico');
    expect(faq).not.toContain('el seguro a terceros ampliado suele ser suficiente');
    await abrirGuia(page);
    const lista = page.locator('section', { has: page.getByRole('heading', { name: '¿Cómo influye la antigüedad del vehículo en la elección?' }) }).locator('li');
    expect(await lista.allInnerTexts()).toEqual([
      'Menos de 2 años → todo riesgo sin franquicia',
      'Entre 2 y 5 años → todo riesgo con franquicia',
      'Entre 5 y 10 años → terceros ampliado',
      'Más de 10 años → terceros básico',
    ]);
  });

  test('1482 extranjero: la RC en el Espacio Económico Europeo figura también en las fichas de terceros', async ({ page }) => {
    // RDL 8/2004, art. 4.1: la RC obligatoria cubre «mediante el pago de una sola prima, en todo
    // el territorio del Espacio Económico Europeo».
    expect(RESULTADOS.terceros_basico.coberturas).toContain('Esa misma cobertura en todo el Espacio Económico Europeo (EEE), con la misma prima');
    expect(RESULTADOS.terceros_ampliado.coberturas).toContain('Todo lo del terceros básico (responsabilidad civil válida en el EEE)');
    expect(JSON.stringify(RESULTADOS)).not.toMatch(/zona UE|toda Europa/);
    await abrirTest(page);
    await responder(page, NORMAL);
    await expect(page.locator('[class*="coberturaItem"]').first()).toHaveText('Todo lo del terceros básico (responsabilidad civil válida en el EEE)');
  });

  test('1483 cifras sin fuente: fuera el «40 %», la franquicia «entre 150 € y 600 €», los «500 €» y los «8.000-10.000 €»', async ({ page }) => {
    await abrirTest(page);
    const faq = JSON.stringify(await jsonLd(page, 'FAQPage'));
    expect(faq).not.toMatch(/150|600 €|500 €|8\.000/);
    expect(RESULTADOS.todo_riesgo_franquicia.advertencia).toBe(
      'En cada siniestro con daños propios pagas la franquicia pactada. Su importe cambia mucho de una póliza a otra: compáralo antes de contratar, junto con la prima.',
    );
    const guia = await abrirGuia(page);
    expect(guia).not.toContain('40 %');
    expect(guia).toContain('Compara siempre varios presupuestos: para la misma modalidad, el precio cambia mucho de una compañía a otra y según tu perfil.');
  });

  test('1484 todo riesgo sin franquicia: sin la promesa absoluta «Cualquier daño queda cubierto»', async ({ page }) => {
    await abrirTest(page);
    await responder(page, JOVEN_FRECUENTE);
    await expect(page.locator('[class*="resultadoSubtitulo"]')).toHaveText(
      'La modalidad más amplia: cubre los daños de tu coche en un accidente sin franquicia a tu cargo, dentro de los límites y exclusiones que fije la póliza.',
    );
  });

  test('1485 JSON-LD: el WebApplication declara 7 funciones reales', async ({ page }) => {
    await abrirTest(page);
    const app = await jsonLd(page, 'WebApplication');
    expect(app.featureList).toHaveLength(7);
    expect(app.featureList).toContain('Avisa cuando lo que declaras choca con la recomendación: financiación, valor del coche, uso profesional o conductores jóvenes');
  });

  test('1486 contraste en claro: la opción marcada y «Siguiente →» llegan a 4,5:1', async ({ page }) => {
    // Opción marcada: --primary-texto #26718F sobre #e8f4fb = 4,89 (era --primary, 3,67).
    // «Siguiente →»: blanco sobre --primary-boton #26718F = 5,47 (era --primary, 4,11).
    await abrirTest(page);
    const radio = page.locator('[role="radio"]').nth(1);
    await radio.click();
    await expect(radio).toHaveCSS('background-color', 'rgb(232, 244, 251)');
    await expect(radio).toHaveCSS('color', 'rgb(38, 113, 143)');
    await expect(page.locator('[class*="btnPrimary"]')).toHaveCSS('opacity', '1');
    const marcada = await contraste(page, '[role="radio"][aria-checked="true"] [class*="opcionTexto"]');
    const siguiente = await contraste(page, '[class*="btnPrimary"]');
    expect(marcada, 'opción marcada').toBeCloseTo(4.89, 1);
    expect(siguiente, 'Siguiente').toBeCloseTo(5.47, 1);
  });

  test('1487 de familia: el hero del resultado va sobre --hero-bg y se lee', async ({ page }) => {
    // Blanco sobre #1a5278 = 8,33; el subtítulo lleva opacidad 0,9 y sigue muy por encima de 4,5.
    await abrirTest(page);
    await responder(page, NORMAL);
    await expect(page.locator('[class*="resultadoCard"]')).toHaveCSS('background-image', 'none');
    await expect(page.locator('[class*="resultadoCard"]')).toHaveCSS('background-color', 'rgb(26, 82, 120)');
    expect(await contraste(page, '[class*="resultadoTitulo"]'), 'título').toBeCloseTo(8.33, 1);
    expect(await contraste(page, '[class*="resultadoSubtitulo"]'), 'subtítulo').toBeGreaterThanOrEqual(4.5);
  });

  test('familia g: al pulsar «Ver resultado» el foco va al título del resultado, no a <body>', async ({ page }) => {
    await abrirTest(page);
    await responder(page, NORMAL);
    await expect(titulo(page)).toBeFocused();
  });
});
