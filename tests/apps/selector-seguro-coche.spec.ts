import { test, expect, devices, type Page } from '@playwright/test';
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
    // C0010 (decidido por el usuario el 09/10/2026): en seguros el profesional regulado es un
    // corredor o agente, no el «asesor fiscal, gestor, abogado o entidad financiera» del genérico.
    await expect(aviso).toContainText('corredor o agente de seguros registrado');
    await expect(aviso).not.toContainText('asesor fiscal');
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

// ─────────────────────────────────────────────────────────────────────────────
// Re-inspección del 10/10/2026 (la anterior quedó INVALIDADA).
//
// Familia «selectores»: lo que la receta de selector-smartphone (b0f31109) y las reparaciones del
// 09/10 de selector-alquiler-vs-compra (7cc1064e) y selector-formacion-postgrado (250b8baa)
// arreglaron y aquí NO ha llegado: teclado APG de los radios, foco tras «Siguiente»/«Anterior»,
// doble toque y enunciado/título bajo la barra fija en móvil. Y cuatro incoherencias entre lo
// declarado, el test y sus textos (guía y FAQPage).
//
// Las sumas, a mano con los pesos de motor.ts, en el orden (básico, ampliado, TR con franquicia,
// TR sin franquicia). Los recuentos de los comentarios salen de enumerar las 93.312
// combinaciones con el motor real el 10/10/2026.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Re-inspección 10/10/2026 — teclado, foco, doble toque, móvil y coherencia de textos', () => {
  // A · normal: Entre 2 y 5 años · 10.000-25.000 € · No, de mi propiedad · Entre 2 y 5 años
  // conduciendo · Uno leve · Uso diario · Ciudad · Siempre en la calle · Podría asumir parte ·
  // Solo con experiencia.
  // P1 (0,0,2,1) P2 (0,0,4,2) P3 (1,1,5,2) P4 (1,2,7,2) P5 (1,3,9,2) P6 (1,4,10,2) P7 (1,4,12,3)
  // P8 (1,6,13,3) P9 (1,6,16,3) P10 (2,7,16,3) → TR con franquicia 16, sin empate ni notas.
  const NORMAL_A = [1, 1, 1, 1, 1, 1, 0, 2, 1, 2] as const;

  // B · límite (empate que solo deshace la prima): Más de 10 años · 10.000-25.000 € · No, de mi
  // propiedad · Más de 5 años · Ninguno · Ocasional · Carretera o rural · Siempre en la calle ·
  // No, sería un problema económico serio · Solo con experiencia.
  // P1 (3,1,0,0) P2 (3,1,2,1) P3 (4,2,3,1) P4 (5,3,3,1) P5 (6,4,3,1) P6 (8,5,3,1) P7 (9,7,3,1)
  // P8 (9,9,4,1) P9 (9,9,4,4) P10 (10,10,4,4) → básico y ampliado a 10. La pregunta 9 no los
  // separa (0 y 0), el valor tampoco (0 y 0): gana la prima más baja, el básico.
  const EMPATE_PRIMA = [3, 1, 1, 2, 0, 0, 2, 2, 2, 2] as const;

  // C · no podría pagar una reparación y recibe terceros: Entre 2 y 5 años · 10.000-25.000 € · No,
  // de mi propiedad · Entre 2 y 5 años conduciendo · Ninguno · Ocasional · Carretera o rural ·
  // Garaje siempre · No, sería un problema económico serio · Solo con experiencia.
  // P1 (0,0,2,1) P2 (0,0,4,2) P3 (1,1,5,2) P4 (1,2,7,2) P5 (2,3,7,2) P6 (4,4,7,2) P7 (5,6,7,2)
  // P8 (6,7,7,2) P9 (6,7,7,5) P10 (7,8,7,5) → Terceros Ampliado 8; el todo riesgo mejor puntuado
  // es el con franquicia (7, frente a 5).
  const NO_PUEDE_PAGAR = [1, 1, 1, 1, 0, 0, 2, 0, 2, 2] as const;

  // D · menos de 3.000 € y la modalidad más cara: Menos de 2 años · Menos de 3.000 € · Sí,
  // financiado · Novel · Ninguno · Ocasional · Ciudad · Garaje siempre · Sí, sin problemas · Joven
  // frecuente. P1 (0,0,0,3) P2 (3,0,0,3) P3 (3,0,1,6) P4 (3,0,3,8) P5 (4,1,3,8) P6 (6,2,3,8)
  // P7 (6,2,5,9) P8 (7,3,5,9) P9 (9,4,5,9) P10 (9,4,6,11) → TR sin franquicia 11; el terceros mejor
  // puntuado, el básico (9).
  const BARATO_TRSF = [0, 3, 0, 0, 0, 0, 0, 0, 0, 0] as const;

  // E · conductor joven con un primer coche de poco valor: Más de 10 años · Menos de 3.000 € · No,
  // de mi propiedad · Novel · Ninguno · Uso diario · Semiurbana · A veces en la calle · Podría
  // asumir parte · Joven frecuente.
  // P1 (3,1,0,0) P2 (6,1,0,0) P3 (7,2,1,0) P4 (7,2,3,2) P5 (8,3,3,2) P6 (8,4,4,2) P7 (8,5,5,2)
  // P8 (8,6,6,2) P9 (8,6,9,2) P10 (8,6,10,4) → TR con franquicia 10; el terceros mejor puntuado es
  // el básico (8); el ampliado, 6.
  const JOVEN_PRIMER_COCHE = [3, 3, 1, 0, 0, 1, 1, 1, 1, 0] as const;

  const titulo = (page: Page) => page.locator('[class*="resultadoTitulo"]');
  const radios = (page: Page) => page.locator('[role="radiogroup"] [role="radio"]');
  const nota = (page: Page, tipo: string) => page.locator(`[data-nota="${tipo}"]`);

  /** El elemento con el foco, en una línea: «body», «radio …», «button …», «p ¿…?». */
  const foco = (page: Page): Promise<string> => page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return 'body';
    const rol = a.getAttribute('role') ?? a.tagName.toLowerCase();
    return `${rol} ${(a.getAttribute('aria-label') ?? a.textContent ?? '').trim()}`;
  });

  async function abrirGuia(page: Page): Promise<string> {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
    return page.locator('body').innerText();
  }

  async function respuestaFaq(page: Page, pregunta: string): Promise<string> {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b) as { '@type': string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
      .find((j) => j['@type'] === 'FAQPage');
    const q = faq?.mainEntity?.find((e) => e.name === pregunta);
    if (!q) throw new Error(`el FAQPage no tiene «${pregunta}»`);
    return q.acceptedAnswer.text;
  }

  /** Recorre las 93.312 combinaciones con el motor real. */
  function barrer(visita: (r: readonly number[]) => void): void {
    const r: number[] = [];
    const rec = (i: number): void => {
      if (i === PREGUNTAS.length) { visita(r); return; }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) { r[i] = k; rec(i + 1); }
    };
    rec(0);
  }

  // ── Lo que está bien ────────────────────────────────────────────────────────

  test('caso normal A: 2-5 años y 10.000-25.000 € con un siniestro leve → todo riesgo con franquicia 16, sin empate ni notas', async ({ page }) => {
    await abrirTest(page);
    await responder(page, NORMAL_A);
    await expect(titulo(page)).toHaveText('Todo Riesgo con Franquicia');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(page.locator('[data-nota]')).toHaveCount(0);
    expect(calcularResultado(NORMAL_A).puntos).toEqual({
      terceros_basico: 2, terceros_ampliado: 7, todo_riesgo_franquicia: 16, todo_riesgo_sin_franquicia: 3,
    });
  });

  test('caso límite B: básico y ampliado empatan a 10, ni la pregunta 9 ni el valor los separan, y la prima lo deshace en voz alta', async ({ page }) => {
    await abrirTest(page);
    await responder(page, EMPATE_PRIMA);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Básico');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveText(
      '⚖️ Empate: con tus respuestas, el seguro a terceros básico y el seguro a terceros ampliado encajan exactamente igual; se muestra primero el seguro a terceros básico porque es la modalidad de prima más baja.',
    );
  });

  test('bloqueado: en la pregunta 10 sin responder, «Ver resultado» está deshabilitado y un clic forzado no da resultado', async ({ page }) => {
    await abrirTest(page);
    for (let i = 0; i < 9; i++) {
      await radios(page).nth(0).click();
      await page.getByRole('button', { name: 'Ir a la siguiente pregunta' }).click();
    }
    const ver = page.getByRole('button', { name: 'Ver resultado' });
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    await expect(ver).toBeDisabled();
    await ver.click({ force: true });
    await page.waitForTimeout(300);
    await expect(titulo(page)).toHaveCount(0);
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
  });

  test('C0011 descartado: con menos de 3.000 € y el todo riesgo sin franquicia, la nota cita el valor y nombra el básico', async ({ page }) => {
    // La app no pregunta presupuesto ni promete renting (h1, metadata y guía). Lo que se buscó es la
    // forma del 1678: la cobertura más cara a quien declara un coche de poco valor. Pasa en 5.181
    // perfiles, y TODOS llevan la nota «valor-bajo» con un terceros como alternativa.
    await abrirTest(page);
    await responder(page, BARATO_TRSF);
    await expect(titulo(page)).toHaveText('Todo Riesgo sin Franquicia');
    await expect(nota(page, 'valor-bajo')).toContainText('Has dicho que el coche vale «Menos de 3.000 €»');
    await expect(nota(page, 'valor-bajo')).toContainText('Pide también precio para el seguro a terceros básico, la modalidad a terceros que mejor encaja con tus respuestas.');
    await expect(nota(page, 'conductor-joven')).toHaveCount(1);
    let caros = 0;
    let sinNota = 0;
    barrer((r) => {
      if (r[1] !== 3) return;
      const res = calcularResultado(r);
      if (res.modalidad !== 'todo_riesgo_sin_franquicia') return;
      caros++;
      if (!res.notas.some((n) => n.tipo === 'valor-bajo' && n.alternativa?.startsWith('terceros'))) sinNota++;
    });
    expect({ caros, sinNota }).toEqual({ caros: 5_181, sinNota: 0 });
  });

  test('C0104 (3) descartado: la guía educativa va en el HTML servido, fuera de la rama del resultado', async ({ page }) => {
    const html = await (await page.request.get('/selector-seguro-coche/')).text();
    expect(html).toContain('¿Qué es la franquicia y cómo afecta al precio?');
    expect(html).toContain('Conductores jóvenes: ¿qué seguro conviene?');
    await abrirTest(page);
    await expect(page.getByRole('button', { name: 'Ver guía educativa' })).toHaveCount(1);
  });

  // ── Hallazgos ABIERTOS (inspector 10/10/2026) ───────────────────────────────

  test('teclado de radios (APG): las flechas mueven y marcan, y el grupo es UNA parada de Tab', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). C0016. Forma del 1681 de selector-smartphone (b0f31109:
    // tabindex itinerante y teclaEnOpcion). Medido el 10/10/2026: tabIndex [0, 0, 0, 0], ArrowDown y
    // End sobre «Menos de 2 años» no mueven el foco ni marcan nada, y Tab recorre las cuatro opciones.
    test.fail();
    await abrirTest(page);
    expect(await radios(page).evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex))).toEqual([0, -1, -1, -1]);
    await radios(page).nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(radios(page).nth(1)).toBeFocused({ timeout: 1_000 });
    await expect(radios(page).nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 });
    await page.keyboard.press('End');
    await expect(radios(page).nth(3)).toBeFocused();
    await expect(page.locator('[role="radiogroup"] [aria-checked="true"]')).toHaveCount(1);
  });

  test('foco: tras «Siguiente» y «Anterior» va al enunciado de la pregunta nueva, no a <body>', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). C0016. Forma del 1679/1680 de selector-smartphone. «Siguiente»
    // sigue montado pero se DESACTIVA (la pregunta nueva no tiene respuesta) y el foco cae a <body>;
    // el Tab siguiente sale del cuestionario a «Ver guía educativa». Igual con «Anterior» al volver a
    // la 1. Obtenido el 10/10/2026: ['body', 'button Ver guía educativa', 'body'].
    test.fail();
    await abrirTest(page);
    const vistos: string[] = [];
    await radios(page).nth(1).click();
    await page.getByRole('button', { name: 'Ir a la siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 2 de 10').waitFor();
    vistos.push(await foco(page));
    await page.keyboard.press('Tab');
    vistos.push(await foco(page));
    await page.getByRole('button', { name: 'Volver a la pregunta anterior' }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 1 de 10').waitFor();
    vistos.push(await foco(page));
    expect(vistos[0], 'tras Siguiente').toContain('¿Cuál es el valor de mercado aproximado de tu coche?');
    expect(vistos[1], 'Tab tras Siguiente').toMatch(/^radio /);
    expect(vistos[2], 'tras Anterior').toContain('¿Cuántos años tiene tu vehículo?');
  });

  test('quien declara que no podría pagar una reparación y recibe terceros lo lee en el resultado, con el todo riesgo que mejor encaja', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). El motor llama a la pregunta 9 «el centro de la decisión entre
    // terceros y todo riesgo», y la nota «valor-alto» ya dice «Si no podrías asumirla, compara
    // también…». Pero quien contesta «No, sería un problema económico serio» y acaba en terceros no
    // lee nada que lo recoja. NO_PUEDE_PAGAR: Terceros Ampliado 8, sin ninguna nota.
    // Enumerado: de 31.104 perfiles con esa respuesta, 5.384 acaban en terceros (1.545 en el básico,
    // 76 de ellos por el desempate de la prima, como EMPATE_PRIMA); 3.159 sin nota de financiación
    // ni de valor alto (las dos que nombran un todo riesgo), 1.209 sin ninguna nota.
    test.fail();
    await abrirTest(page);
    await responder(page, NO_PUEDE_PAGAR);
    await expect(titulo(page)).toHaveText('Seguro a Terceros Ampliado');
    const notas = (await page.locator('[data-nota]').allInnerTexts()).join(' ');
    expect(notas).toContain('No, sería un problema económico serio');
    expect(notas).toContain('el todo riesgo con franquicia');
    let sinAviso = 0;
    barrer((r) => {
      if (r[8] !== 2) return;
      const res = calcularResultado(r);
      if (res.modalidad.startsWith('todo_riesgo')) return;
      if (!res.notas.some((n) => n.alternativa?.startsWith('todo_riesgo'))) sinAviso++;
    });
    expect(sinAviso).toBe(0);
  });

  test('FAQPage y guía: el todo riesgo con franquicia no se recomienda a «conductores experimentados» mientras el test les resta peso', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). El FAQPage dice que el TR con franquicia «resulta adecuado
    // para conductores experimentados con bajo historial de siniestros», y la guía, que con «buen
    // historial» la franquicia es «una excelente forma de reducir el coste». El test hace lo
    // contrario: «Más de 5 años con experiencia sólida» y «No, ninguno» dan 0 al TR con franquicia
    // (y +1 al básico y al ampliado); «novel» y «uno leve», +2 cada una. Enumerado: el TR con
    // franquicia gana en el 29,1 % de los experimentados sin siniestros, frente al 49,5 % de todos,
    // el 51,9 % de los noveles y el 62,0 % de quien tuvo un siniestro leve.
    // A mano: [1,1,1,2,0,1,1,1,1,2] → TRf 11 (4, 7, 11, 2); el mismo con «novel» y «uno leve»,
    // [1,1,1,0,1,1,1,1,1,2] → TRf 15 (2, 6, 15, 4).
    test.fail();
    expect(calcularResultado([1, 1, 1, 2, 0, 1, 1, 1, 1, 2]).puntos.todo_riesgo_franquicia).toBe(11);
    expect(calcularResultado([1, 1, 1, 0, 1, 1, 1, 1, 1, 2]).puntos.todo_riesgo_franquicia).toBe(15);
    await abrirTest(page);
    const faq = await respuestaFaq(page, '¿Qué es el todo riesgo con franquicia y para quién es recomendable?');
    const guia = await abrirGuia(page);
    const loDice = /conductores experimentados con bajo historial/.test(faq) || /conductor experimentado con buen historial/.test(guia);
    const trf = (p: number, o: number) => PREGUNTAS[p].opciones[o].pesos.todo_riesgo_franquicia ?? 0;
    const experimentadoLimpio = trf(3, 2) + trf(4, 0);
    const novelConParte = trf(3, 0) + trf(4, 1);
    expect(loDice && experimentadoLimpio < novelConParte, `texto ${loDice} · pesos TRf ${experimentadoLimpio} frente a ${novelConParte}`).toBe(false);
  });

  test('guía: «primer coche de bajo valor → terceros ampliado» no contradice lo que el test da a ese perfil', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Forma del 1480 (la guía orientaba con otros criterios que el
    // test). JOVEN_PRIMER_COCHE: el test da TR con franquicia (10) y su nota nombra el BÁSICO (8)
    // como terceros; el ampliado queda con 6. La guía, en la misma página: «Para el primer coche (de
    // bajo valor): terceros ampliado». Enumerado: con un menor de 25 y menos de 3.000 €, el ampliado
    // sale en el 5,5 % de los 15.552 perfiles (TRf 51,0 %, TRsf 23,4 %, básico 20,1 %).
    test.fail();
    await abrirTest(page);
    await responder(page, JOVEN_PRIMER_COCHE);
    await expect(titulo(page)).toHaveText('Todo Riesgo con Franquicia');
    const textoNota = await nota(page, 'valor-bajo').innerText();
    expect(textoNota).toContain('Pide también precio para el seguro a terceros básico');
    const guia = await abrirGuia(page);
    const guiaDiceAmpliado = guia.includes('Para el primer coche (de bajo valor): terceros ampliado');
    const testDaAmpliado = (await titulo(page).innerText()) === 'Seguro a Terceros Ampliado' || textoNota.includes('terceros ampliado');
    expect(guiaDiceAmpliado && !testDaAmpliado, 'la guía dice ampliado y el test, otra cosa').toBe(false);
  });

  test('FAQPage: «el de terceros… no repara tu propio coche» no contradice la ficha del terceros ampliado', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). La ficha del terceros ampliado (y la 4.ª respuesta del mismo
    // FAQPage) incluye robo, incendio y rotura de lunas del propio coche; la 1.ª respuesta dice del
    // seguro «de terceros», sin distinguir, que «no repara tu propio coche».
    test.fail();
    expect(RESULTADOS.terceros_ampliado.coberturas).toContain('Rotura de lunas (parabrisas, luneta, laterales)');
    await abrirTest(page);
    const q1 = await respuestaFaq(page, '¿Qué diferencia hay entre seguro a terceros y todo riesgo?');
    expect(q1).not.toMatch(/el de terceros cubre[^.]*pero no repara tu propio coche/);
  });

  test('doble clic (escritorio) en «Siguiente» de la pregunta 3 no contesta la 4', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). C0104 (2). La 3 tiene 2 opciones y la 4, 3: la botonera baja
    // y el segundo clic (detail 2) cae en «Más de 5 años con experiencia sólida» (+1 básico, +1
    // ampliado). Igual de la 5 (3 opciones) a la 6 (4): «Lo comparten varias personas…».
    test.fail();
    await abrirTest(page);
    for (const i of [0, 0]) {
      await radios(page).nth(i).click();
      await page.getByRole('button', { name: 'Ir a la siguiente pregunta' }).click();
    }
    await page.waitForTimeout(500);
    await radios(page).nth(0).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Ir a la siguiente pregunta' }).dblclick();
    await expect(page.getByText('Pregunta 4 de 10')).toBeVisible();
    await page.waitForTimeout(300);
    // Obtenido el 10/10/2026: 1 («Más de 5 años con experiencia sólida»).
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0, { timeout: 1_000 });
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
  async function colocar(page: Page, nombre: string, y: number): Promise<{ x: number; y: number }> {
    const boton = page.getByRole('button', { name: nombre, exact: true });
    await boton.evaluate((e, yy) => {
      const r = e.getBoundingClientRect();
      window.scrollBy(0, r.top + r.height / 2 - yy);
    }, y);
    const caja = await boton.boundingBox();
    if (!caja) throw new Error(`sin caja para ${nombre}`);
    return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
  }

  /**
   * Contesta tocando como un usuario. Lee la pregunta antes de tocar, como en selector-smartphone
   * (2659): a velocidad de máquina el toque llega a menos de 300 ms del de «Siguiente», Chrome lo
   * cuenta como el 2.º de la ráfaga, y la receta clicDeMas, cuando llegue, lo ignorará a propósito.
   */
  async function contestarTocando(page: Page, indices: readonly number[]): Promise<void> {
    for (const i of indices) {
      await page.waitForTimeout(500);
      await radios(page).nth(i).tap();
      await page.getByRole('button', { name: 'Ir a la siguiente pregunta' }).tap();
    }
  }

  async function dobleToque(page: Page, p: { x: number; y: number }): Promise<void> {
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(150);
    await page.touchscreen.tap(p.x, p.y);
  }

  test.describe('móvil 360 px', () => {
    test.use({
      viewport: { width: 360, height: 740 },
      userAgent: devices['Pixel 7'].userAgent,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('con «Siguiente» a media pantalla, el enunciado de cada pregunta nueva queda a la vista y bajo la barra', async ({ page }) => {
      // ABIERTO (inspector 10/10/2026). C0104 (1), forma del 3110 de alquiler-vs-compra y del 2657 de
      // selector-smartphone. Sin foco programático la página no se mueve y la pregunta nueva se pinta
      // donde estaba la anterior. Medido el 10/10/2026 a 360 y 390 px con el botón en y 360 (barra
      // hasta 52): P2 en y −60..−9, P3 −44..7, P5 −4..47, P6 11..62, P7 −112..−61, P8 −4..47,
      // P9 −20..57, P10 −46..31; solo la 4 (82..133) queda bien. Tocando donde lo deja tap(), bien.
      test.fail();
      await abrirTest(page);
      const fuera: string[] = [];
      for (let i = 1; i <= 10; i++) {
        await expect(page.getByText(`Pregunta ${i} de 10`)).toBeVisible();
        await page.waitForTimeout(150);
        const m = await bajoLaBarra(page, '[class*="preguntaTexto"]');
        if (i > 1 && (m.tapado || m.top < m.barra)) fuera.push(`P${i}: enunciado en y ${m.top}..${m.bottom}, barra hasta ${m.barra}`);
        if (i === 10) break;
        await page.waitForTimeout(500);
        await radios(page).nth(0).tap();
        const p = await colocar(page, 'Ir a la siguiente pregunta', 360);
        await page.touchscreen.tap(p.x, p.y);
      }
      expect(fuera, 'enunciados bajo la barra o fuera de la vista').toEqual([]);
    });

    test('con «Ver resultado» a media pantalla, el título del resultado tiene el foco y queda por debajo de la barra', async ({ page }) => {
      // ABIERTO (inspector 10/10/2026). C0104 (1). El h2 ya está a la vista y el foco no desplaza:
      // queda en y 49..111 con la barra hasta 52 (medido a 360 y 390 px). Falta el scroll-margin-top
      // de la receta (80 px).
      test.fail();
      await abrirTest(page);
      await contestarTocando(page, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
      await page.waitForTimeout(500);
      await radios(page).nth(0).tap();
      const p = await colocar(page, 'Ver resultado', 360);
      await page.touchscreen.tap(p.x, p.y);
      await expect(titulo(page)).toBeFocused();
      await page.waitForTimeout(150);
      const m = await bajoLaBarra(page, '[class*="resultadoTitulo"]');
      expect({ tapado: m.tapado, debajo: m.top >= m.barra }, `h2 en y ${m.top}..${m.bottom}, barra hasta ${m.barra}`).toEqual({ tapado: false, debajo: true });
    });

    test('un doble toque en «Siguiente» de la pregunta 3 no contesta la 4', async ({ page }) => {
      // ABIERTO (inspector 10/10/2026). C0104 (2), forma del 2659/3111. Medido el 10/10/2026 a 360 y
      // 390 px con el botón entre y 150 y 650: el segundo toque (detail 2) marca «Más de 5 años con
      // experiencia sólida» en la 4, y en la 6 «Lo comparten varias personas (coche de empresa o
      // familiar)» tras el doble toque en la 5.
      test.fail();
      await abrirTest(page);
      await contestarTocando(page, [0, 0]);
      await expect(page.getByText('Pregunta 3 de 10')).toBeVisible();
      await page.waitForTimeout(500);
      await radios(page).nth(0).tap();
      await page.waitForTimeout(400);
      await dobleToque(page, await colocar(page, 'Ir a la siguiente pregunta', 350));
      await expect(page.getByText('Pregunta 4 de 10')).toBeVisible();
      await page.waitForTimeout(300);
      // Obtenido el 10/10/2026: 1 («Más de 5 años con experiencia sólida»).
      await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0, { timeout: 1_000 });
    });

    test('un doble toque en «Ver resultado» no saca de la app', async ({ page }) => {
      // ABIERTO (inspector 10/10/2026). C0104 (2), forma del 3111 de alquiler-vs-compra. Con el botón
      // en la parte alta (y 100-150 a 360 px; 150-200 a 390), el h2 del resultado queda por encima de
      // la vista, el foco lo centra (y 339) y el enlace de Delegum de <LegalNotice /> baja a y 66..165:
      // el segundo toque lo abre y se pierden las 10 respuestas. Delegum se sirve aquí sin red.
      test.fail();
      await page.route(/^https:\/\/(www\.)?delegum\.com\//, (ruta) => ruta.fulfill({ status: 200, contentType: 'text/html', body: '<title>delegum</title>externo' }));
      await abrirTest(page);
      const origen = new URL(page.url()).origin;
      await contestarTocando(page, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
      await page.waitForTimeout(500);
      await radios(page).nth(0).tap();
      await page.waitForTimeout(400);
      await dobleToque(page, await colocar(page, 'Ver resultado', 150));
      await page.waitForTimeout(600);
      // Obtenido el 10/10/2026: https://delegum.com/soluciones/?from=meskeia.
      expect(page.url()).toBe(`${origen}/selector-seguro-coche/`);
      await expect(titulo(page)).toBeVisible({ timeout: 1_000 });
    });
  });

  test.describe('móvil 390 px', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent: devices['Pixel 7'].userAgent,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('un doble toque en «Siguiente» de la pregunta 6 no devuelve a la 6 por «Anterior»', async ({ page }) => {
      // ABIERTO (inspector 10/10/2026). C0104 (2). Forma propia de esta hermana: en móvil la botonera
      // va en columna inversa («Anterior» justo DEBAJO de «Siguiente»), y de la 6 (4 opciones) a la 7
      // (3) sube: el segundo toque cae en «Volver a la pregunta anterior». Medido a 390 px con el
      // botón entre y 150 y 650; a 360 px no pasa.
      test.fail();
      await abrirTest(page);
      await contestarTocando(page, [0, 0, 0, 0, 0]);
      await expect(page.getByText('Pregunta 6 de 10')).toBeVisible();
      await page.waitForTimeout(500);
      await radios(page).nth(0).tap();
      await page.waitForTimeout(400);
      await dobleToque(page, await colocar(page, 'Ir a la siguiente pregunta', 350));
      await page.waitForTimeout(400);
      // Obtenido el 10/10/2026: «Pregunta 6 de 10».
      await expect(page.getByText('Pregunta 7 de 10')).toBeVisible({ timeout: 1_000 });
    });
  });
});
