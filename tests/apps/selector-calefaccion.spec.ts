import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, PREGUNTAS, SISTEMAS, TECHO_PRESUPUESTO } from '../../app/selector-calefaccion/motor';

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
 *     igualdad ganaba siempre el primero (la aerotermia).
 *   · Razones fijas por sistema: en 39 perfiles ganaba la caldera de gas a quien había dicho
 *     que su caldera tiene MÁS de 10 años, y la app le respondía «Con una caldera reciente en
 *     buen estado, mantenerla es la decisión económicamente más sensata».
 *
 * EL MOTOR (app/selector-calefaccion/motor.ts): a igualdad de puntos, primero el que más encaja
 * con el presupuesto de instalación (pregunta 9) y luego el de menor coste de instalación; el
 * empate se anuncia. Las razones citan las respuestas que más han sumado.
 *
 * SEGUNDA REPARACIÓN, el mismo 24/09/2026 (hallazgos 1389-1404 del Inspector): el presupuesto,
 * la falta de unidad exterior y la falta de gas natural pasan de pesos a FILTROS, y lo apartado
 * se dice en pantalla; la pregunta 5 gana la opción «Sí, entre 5 y 10 años», así que las
 * combinaciones pasan de 331.776 a 414.720. Los tests de arriba que suponían otra cosa se
 * reescribieron, cada uno con su motivo en un comentario.
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
//   eléctrico 1+2+2+4 = 9. Triple empate a 9 entre bomba, caldera y eléctrico.
//   REESCRITO el 24/09/2026 (hallazgo 1390): este test exigía la bomba de calor (split) como
//   alternativa a quien acaba de decir que NO tiene espacio para la unidad exterior que el split
//   necesita; consagraba el defecto. Ahora el split se aparta y el empate queda entre el
//   eléctrico y la caldera: el presupuesto da eléctrico +4 y caldera 0, así que va primero el
//   eléctrico. Y como la caldera es de menos de 5 años, el eléctrico se presenta para cuando
//   toque sustituirla (hallazgo 1392).
const EMPATE_A_TRES = [0, 0, 0, 0, 0, 0, 1, 2, 0, 0] as const;

// Piso en bloque · 60 – 100 m² · Radiadores de agua · Frío · Sí, MÁS DE 10 AÑOS · Poco o nada ·
// 4 – 5 meses · No tengo espacio · 3.000 – 8.000 € · Prefiero no complicarme.
//   aerotermia 1+1+2 = 4 · bomba 2+1+2 = 5 · caldera 2+1+2+1 = 6 · pellet 2+1 = 3 ·
//   eléctrico 1+2 = 3. Gana la caldera de gas, sola. Antes le decía «Con una caldera reciente
//   en buen estado…» a quien acababa de responder que la suya tiene más de 10 años.
//   El índice de la pregunta 5 pasa de 1 a 2: la opción nueva «Sí, entre 5 y 10 años»
//   (hallazgo 1401) va entre la de menos de 5 y la de más de 10.
const CALDERA_VIEJA = [0, 1, 0, 0, 2, 2, 1, 2, 1, 2] as const;

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

test('un empate se anuncia y se deshace por el presupuesto, no por el orden del código', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, EMPATE_A_TRES);

  const principal = page.locator('[class*="recomendacionValor"]').first();
  await expect(principal).toHaveText('Radiadores Eléctricos de Bajo Consumo');
  await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('Caldera de Gas');

  const empate = page.locator('[class*="avisoEmpate"]');
  await expect(empate).toContainText('los radiadores eléctricos de bajo consumo y la caldera de gas encajan exactamente igual');
  await expect(empate).toContainText('se muestran primero los radiadores eléctricos de bajo consumo porque encajan mejor con el presupuesto de instalación');
  // El split, empatado a 9, no está entre los empatados: no cabe su unidad exterior.
  await expect(empate).not.toContainText('bomba de calor');
  await expect(page.locator('[class*="recomendacionLabel"]').first()).toHaveText('Para cuando sustituyas tu caldera');
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
  // Y el consejo de transición sigue estando. REESCRITO el 24/09/2026: antes exigía «a bomba de
  // calor o aerotermia», los dos sistemas que necesitan la unidad exterior que este perfil no
  // puede poner (hallazgo 1390). Sin espacio exterior, el relevo es «un sistema renovable».
  expect(texto).toContain('Planifica la transición a un sistema renovable para cuando haya que sustituir la caldera.');
  expect(texto).not.toContain('Planifica la transición a bomba de calor o aerotermia');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. El motor, sobre las 414.720 combinaciones (sin navegador)
// ─────────────────────────────────────────────────────────────────────────────

test('motor: ningún empate queda en silencio, el criterio que se anuncia es verdad y los filtros se cumplen', () => {
  // REESCRITO el 24/09/2026. Antes exigía que el recomendado tuviera la puntuación máxima de
  // TODOS los sistemas; desde los hallazgos 1389-1391 la máxima se toma entre los ADMITIDOS (los
  // que caben en el presupuesto, tienen unidad exterior si la necesitan y gas si lo necesitan).
  // Las cuentas nuevas: 414.720 perfiles (pregunta 5 con cinco opciones) y 36.816 empates.
  test.setTimeout(180_000);
  const r: Record<number, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); else fallos.length++; };
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      // Los filtros, recalculados aquí sin mirar el motor.
      const admitidos = CLAVES.filter((k) =>
        SISTEMAS[k].costeInstalacionMin <= TECHO_PRESUPUESTO[r[9]] &&
        !(r[8] === 'no' && (k === 'aerotermia' || k === 'bomba-calor')) &&
        !(r[5] === 'no_gas' && k === 'caldera-gas'));
      if (!admitidos.includes(res.sistemaPrincipal)) mal('recomienda un sistema que no pasa los filtros');
      if (res.sistemaAlternativa && !admitidos.includes(res.sistemaAlternativa)) mal('alternativa que no pasa los filtros');
      if ((res.sistemaAlternativa === null) !== (admitidos.length === 1)) mal('alternativa mal resuelta');
      const max = Math.max(...admitidos.map((k) => res.puntos[k]));
      if (res.puntos[res.sistemaPrincipal] !== max) mal('el recomendado no tiene la puntuación máxima de los admitidos');
      const empatadosReales = admitidos.filter((k) => k !== res.sistemaPrincipal && res.puntos[k] === max);
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
  expect(total).toBe(414_720);
  expect(empates).toBe(36_816);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Hallazgos 1389-1404 (Inspección 24/09/2026), reparados el mismo día.
//    El Inspector dejó cada uno como test.fail(); se retiran y cada test exige ahora la
//    reparación con su caso literal. Los esperados se recalcularon a mano con los pesos de
//    motor.ts (el de la pregunta 5 incluido) y los filtros nuevos.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Hallazgos 1389-1404 — límites declarados, promesas, datos y contraste', () => {
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

  /** El texto del RESULTADO (tarjetas, avisos, costes, razones, pros y contras, ayudas y consejos), sin la guía. */
  async function textoResultado(page: Page): Promise<string> {
    const bloques = ['recomendacionGrid', 'avisoRecorte', 'avisoEmpate', 'costesSection', 'razonesSection', 'prosContrasGrid', 'subvencionesSection', 'consejosSection'];
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

  /** Recorre las 414.720 combinaciones con el motor real. */
  function barrer(visitar: (r: Respuestas, res: ReturnType<typeof calcularResultado>) => void): number {
    const r: Respuestas = {};
    let total = 0;
    const rec = (i: number): void => {
      if (i === PREGUNTAS.length) {
        total++;
        visitar(r, calcularResultado(r));
        return;
      }
      for (const o of PREGUNTAS[i].opciones) {
        r[PREGUNTAS[i].id] = o.valor;
        rec(i + 1);
      }
    };
    rec(0);
    return total;
  }

  /** El HTML servido y sus bloques JSON-LD. */
  async function htmlServido(request: import('@playwright/test').APIRequestContext): Promise<{ html: string; cabecera: string; faq: string; app: string }> {
    const html = await (await request.get('/selector-calefaccion/')).text();
    // Lo que declara la app en sus metadatos (<head>); el cuerpo lleva además las tarjetas de
    // otras apps (RelatedApps), que no son de esta.
    const cabecera = html.split('</head>')[0];
    const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    return {
      html,
      cabecera,
      faq: bloques.find((b) => b.includes('"FAQPage"')) ?? '',
      app: bloques.find((b) => b.includes('"WebApplication"')) ?? '',
    };
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
  //   Ningún filtro aparta a la aerotermia (8.000 ≤ 15.000, hay unidad exterior, no necesita gas).
  const NORMAL = ['Casa unifamiliar o chalet', '100 – 180 m²', 'Suelo radiante', 'Frío o muy frío', 'No, sin gas natural', 'Poco o nada', '6 o más meses', 'Sí, tengo espacio exterior', '8.000 – 15.000 €', 'Sí, quiero aprovecharlas'] as const;

  // Hallazgo 1389. Piso en bloque · 60 – 100 m² · Suelo radiante · Templado · Sí, más de 10 años ·
  // Sí, me sería muy útil · 4 – 5 meses · Sí, tengo espacio exterior · MENOS DE 3.000 € · Sí.
  //   aerotermia 3+2+2+1+2+2 = 12 · bomba 2+1+1+1+2+2 = 9 · eléctrico 1+4 = 5 · pellet 1 · caldera 0.
  //   Caben en 3.000 € los de mínimo ≤ 3.000 (bomba 2.000, caldera 2.500, eléctrico 800): gana
  //   la bomba (9) y la alternativa es el eléctrico (5); la aerotermia (desde 8.000 €) se aparta.
  const PRESUPUESTO_BAJO = ['Piso en bloque', '60 – 100 m²', 'Suelo radiante', 'Templado', 'Sí, más de 10 años', 'Sí, me sería muy útil', '4 – 5 meses', 'Sí, tengo espacio exterior', 'Menos de 3.000 €', 'Sí, quiero aprovecharlas'] as const;

  // Hallazgo 1390. Casa unifamiliar o chalet · 100 – 180 m² · Suelo radiante · Templado · No, sin gas natural ·
  // Sí, imprescindible · 6 o más meses · NO TENGO ESPACIO · 8.000 – 15.000 € · Sí.
  //   aerotermia 20 · bomba 1+1+3 = 5 · pellet 1+1+1+1+1 = 5 · caldera 2 · eléctrico 2.
  //   Sin aerotermia ni split (los dos necesitan unidad exterior) ni caldera (no hay gas): pellet
  //   (5) y, de alternativa, el eléctrico (2).
  const SIN_EXTERIOR = ['Casa unifamiliar o chalet', '100 – 180 m²', 'Suelo radiante', 'Templado', 'No, sin gas natural', 'Sí, imprescindible', '6 o más meses', 'No tengo espacio', '8.000 – 15.000 €', 'Sí, quiero aprovecharlas'] as const;

  // Hallazgo 1391. Piso en bloque · 60 – 100 m² · Radiadores de agua · Frío o muy frío · NO, SIN GAS NATURAL ·
  // Poco o nada · 4 – 5 meses · No tengo espacio · 3.000 – 8.000 € · Prefiero no complicarme.
  //   caldera 2+1+2+1 = 6 · bomba 2+1+2 = 5 · aerotermia 1+1+2 = 4 · pellet 2+1+1 = 4 · eléctrico 1+2 = 3.
  //   Sin caldera (no hay gas) ni aerotermia/split (no hay unidad exterior): pellet (4) frente a eléctrico (3).
  const SIN_GAS = ['Piso en bloque', '60 – 100 m²', 'Radiadores de agua', 'Frío o muy frío', 'No, sin gas natural', 'Poco o nada', '4 – 5 meses', 'No tengo espacio', '3.000 – 8.000 €', 'Prefiero no complicarme'] as const;

  // Hallazgo 1392. Casa unifamiliar o chalet · 100 – 180 m² · Suelo radiante · Templado · SÍ, MENOS DE 5 AÑOS ·
  // Poco o nada · 4 – 5 meses · Sí, tengo espacio exterior · 8.000 – 15.000 € · Sí.
  //   aerotermia 2+2+3+2+2+3+2 = 16 · caldera 4 · bomba 1+2 = 3 · pellet 1+1+1 = 3 · eléctrico 0.
  const CALDERA_RECIENTE = ['Casa unifamiliar o chalet', '100 – 180 m²', 'Suelo radiante', 'Templado', 'Sí, menos de 5 años', 'Poco o nada', '4 – 5 meses', 'Sí, tengo espacio exterior', '8.000 – 15.000 €', 'Sí, quiero aprovecharlas'] as const;

  // ─ Caso normal ─

  test('caso normal: chalet con suelo radiante y 8.000 – 15.000 € → aerotermia, sin avisos de recorte', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const texto = await textoResultado(page);
    await expect(page.locator('[class*="recomendacionValor"]').first()).toHaveText('Aerotermia');
    await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('Caldera o Estufa de Pellet');
    await expect(page.locator('[class*="recomendacionLabel"]').first()).toHaveText('Tu mejor opción');
    await expect(page.locator('[class*="costeValor"]').first()).toHaveText('8.000 – 15.000 €');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(page.locator('[class*="avisoRecorte"]')).toHaveCount(0);
    expect(texto).toContain('Distribución del calor: has respondido «Suelo radiante», que suma 3 puntos a la aerotermia.');
    expect(texto).toContain('Presupuesto de instalación: has respondido «8.000 – 15.000 €», que suma 3 puntos a la aerotermia.');
    expect(texto).toContain('Tipo de vivienda: has respondido «Casa unifamiliar o chalet», que suma 2 puntos a la aerotermia.');
  });

  // ─ 1389, 1390, 1391: lo declarado como límite es un filtro, y se dice ─

  test('1389 presupuesto (navegador): con «Menos de 3.000 €» sale la bomba de calor y se dice por qué no la aerotermia', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, PRESUPUESTO_BAJO);
    expect(await principal(page)).toBe('Bomba de Calor (split)');
    await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('Radiadores Eléctricos de Bajo Consumo');
    await expect(page.locator('[class*="costeValor"]').first()).toHaveText('2.000 – 5.000 €');
    const aviso = page.locator('[class*="avisoRecorte"][role="note"]');
    await expect(aviso).toContainText('Con tus respuestas iba por delante la aerotermia, con 12 puntos, pero su instalación empieza en 8.000 € y no cabe en tu presupuesto («Menos de 3.000 €»).');
    // La horquilla de la bomba (2.000 – 5.000 €) se sale por arriba del tramo: se avisa.
    expect(await textoResultado(page)).toContain('La parte alta de la horquilla de instalación de la bomba de calor (split), 2.000 – 5.000 €, supera tu presupuesto («Menos de 3.000 €»)');
  });

  test('1389 presupuesto (motor): ningún perfil recibe un sistema cuyo mínimo de instalación no cabe en su tramo', () => {
    // Antes: 45.812 de los 82.944 perfiles con «Menos de 3.000 €» (aerotermia y pellet).
    test.setTimeout(120_000);
    const fuera: string[] = [];
    let conTramo = 0;
    const total = barrer((r, res) => {
      if (r[9] === 'bajo') conTramo++;
      if (SISTEMAS[res.sistemaPrincipal].costeInstalacionMin > TECHO_PRESUPUESTO[r[9]]) fuera.push(JSON.stringify(r));
      if (res.sistemaAlternativa && SISTEMAS[res.sistemaAlternativa].costeInstalacionMin > TECHO_PRESUPUESTO[r[9]]) fuera.push(`alt ${JSON.stringify(r)}`);
    });
    expect(total).toBe(414_720);
    expect(conTramo).toBe(103_680);
    expect(fuera.slice(0, 5)).toEqual([]);
  });

  test('1390 unidad exterior (navegador): sin espacio exterior, ni aerotermia ni split, y se dice', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, SIN_EXTERIOR);
    expect(await principal(page)).toBe('Caldera o Estufa de Pellet');
    await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('Radiadores Eléctricos de Bajo Consumo');
    const aviso = page.locator('[class*="avisoRecorte"][role="note"]');
    await expect(aviso).toContainText('iba por delante la aerotermia, con 20 puntos, pero necesita una unidad exterior y has indicado que no tienes espacio para ella.');
    await expect(aviso).toContainText('iba por delante la bomba de calor (split), con 5 puntos, pero necesita una unidad exterior');
  });

  test('1390 y 1391 (motor): sin unidad exterior no sale un sistema que la necesita; sin gas, no sale la caldera de gas', () => {
    // Antes: 102.275 de los 110.592 perfiles con «No tengo espacio» y 12 con «No, sin gas natural».
    test.setTimeout(120_000);
    const mal: string[] = [];
    barrer((r, res) => {
      for (const k of [res.sistemaPrincipal, res.sistemaAlternativa]) {
        if (!k) continue;
        if (r[8] === 'no' && (k === 'aerotermia' || k === 'bomba-calor')) mal.push(`${k} sin exterior ${JSON.stringify(r)}`);
        if (r[5] === 'no_gas' && k === 'caldera-gas') mal.push(`caldera sin gas ${JSON.stringify(r)}`);
      }
      // Todo lo que iba por delante y se ha apartado sale en pantalla con su motivo.
      if (res.avisosDescarte.length !== res.apartados.length) mal.push(`apartados sin aviso ${JSON.stringify(r)}`);
    });
    expect(mal.slice(0, 5)).toEqual([]);
  });

  test('1391 sin gas natural: a quien no tiene acometida no se le recomienda la caldera de gas', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, SIN_GAS);
    expect(await principal(page)).toBe('Caldera o Estufa de Pellet');
    const aviso = page.locator('[class*="avisoRecorte"][role="note"]');
    await expect(aviso).toContainText('iba por delante la caldera de gas, con 6 puntos, pero necesita acometida de gas natural y has indicado que no la hay en tu zona.');
  });

  // ─ 1392: caldera reciente ─

  test('1392 caldera reciente: el sistema que gana es «para cuando sustituyas tu caldera», sin contradecirse', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, CALDERA_RECIENTE);
    expect(await principal(page)).toBe('Aerotermia');
    await expect(page.locator('[class*="recomendacionLabel"]').first()).toHaveText('Para cuando sustituyas tu caldera');
    const texto = await textoResultado(page);
    expect(texto).toContain('Tu caldera de gas tiene menos de 5 años: lo habitual es conservarla mientras funcione bien. Aerotermia es el sistema que mejor encaja con tu vivienda para cuando llegue el momento de sustituirla.');
    expect(texto).not.toContain('Tu mejor opción');
    expect(texto).not.toContain('no tiene sentido cambiarla ahora');
  });

  test('1392 (motor): con caldera de menos de 5 años, o gana la caldera o se planifica la sustitución', () => {
    // Antes: 78.999 de los 82.944 perfiles con «Sí, menos de 5 años» recibían otro sistema como
    // «tu mejor opción» junto al consejo de no cambiar la caldera.
    test.setTimeout(120_000);
    const mal: string[] = [];
    barrer((r, res) => {
      if (r[5] !== 'si_reciente') {
        if (res.planificarSustitucion) mal.push(`planifica sin caldera reciente ${JSON.stringify(r)}`);
        return;
      }
      if (res.sistemaPrincipal !== 'caldera-gas' && !res.planificarSustitucion) mal.push(JSON.stringify(r));
      if (res.consejos.some((c) => c.includes('no tiene sentido cambiarla'))) mal.push(`consejo viejo ${JSON.stringify(r)}`);
    });
    expect(mal.slice(0, 5)).toEqual([]);
  });

  // ─ 1393, 1394: promesas ─

  test('1393 pros y contras: el resultado pinta los del sistema recomendado y los de la alternativa', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-calefaccion/');
    await esperarHidratacionBotones(page);
    await expect(page.locator('[class*="introFeatures"]')).toContainText('Ventajas e inconvenientes del sistema recomendado y de la alternativa');
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await responderEtiquetas(page, NORMAL);
    const bloque = (await page.locator('[class*="prosContrasGrid"]').innerText()).replace(/\s+/g, ' ');
    for (const k of ['aerotermia', 'pellet'] as const) {
      for (const linea of [...SISTEMAS[k].pros, ...SISTEMAS[k].contras]) expect(bloque, `${k}: ${linea}`).toContain(linea);
    }
    // Uno de la ficha, literal: sale en pantalla.
    expect(bloque).toContain('Requiere espacio exterior para la unidad');
  });

  test('1394 metadata: los resultados que anuncia son los cinco sistemas de verdad, y el schema lleva características', async ({ request }) => {
    const { html, cabecera, app } = await htmlServido(request);
    expect(html.match(/suelo radiante o pellet/g) ?? []).toHaveLength(0);
    expect(cabecera).toContain('aerotermia, bomba de calor (split), caldera de gas, pellet o radiadores eléctricos');
    // Familia de selectores, forma e: el jsonLd tenía `features: []` (featureList vacía).
    const lista = (JSON.parse(app) as { featureList?: string[] }).featureList ?? [];
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.length).toBeLessThanOrEqual(8);
    expect(lista).toContain('Ventajas e inconvenientes del sistema recomendado y de la alternativa');
  });

  // ─ 1395-1399: datos ─

  test('1395 FAQPage = pantalla: horquillas y rendimiento salen de las mismas constantes del motor', async ({ request }) => {
    const { faq } = await htmlServido(request);
    expect(faq, 'no se encontró el FAQPage').not.toBe('');
    expect(faq).toContain(SISTEMAS.pellet.costeInstalacion); // «5.000 – 12.000 €», la de la tarjeta
    expect(faq).toContain(SISTEMAS['caldera-gas'].costeInstalacion); // «2.500 – 5.000 €»
    expect(faq).toContain('unos 4 kWh de calor por cada kWh eléctrico');
    expect(faq).not.toContain('COP 3-5');
    expect(faq).not.toContain('4.000 y 8.000');
    // Sin porcentajes de subvención sin fuente (30-70 %, 40-60 %, 40-70 % en tres sitios distintos).
    expect(faq).not.toMatch(/\d+\s*%/);
  });

  test('1396 ayudas: ni MOVES ni «PERTE Industria Verde»; el tipo de ayuda verificado y dónde mirar', async ({ page, request }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const texto = await textoConGuia(page);
    expect(texto).not.toMatch(/\bMOVES\b/);
    expect(texto).not.toMatch(/PERTE/);
    // Sin porcentajes de subvención: ni en el bloque de ayudas ni en ninguna frase sobre ayudas.
    expect(await page.locator('[class*="subvencionesSection"]').innerText()).not.toMatch(/\d+\s*%/);
    expect(texto).not.toMatch(/(ayudas?|subvenci\w+)[^.]*\d+\s*%|\d+\s*%[^.]*(ayudas?|subvenci\w+)/i);
    expect(texto).not.toContain('las subvenciones públicas están haciendo');
    // idae.es, programa 6 del RD 477/2021: renovables térmicas en vivienda, sin aire-aire.
    expect(texto).toContain('El programa estatal de 2021 (Real Decreto 477/2021, con fondos europeos Next Generation EU) cubría esas tecnologías y dejaba fuera los equipos aire-aire, como los splits.');
    const { cabecera, faq, app } = await htmlServido(request);
    expect(`${cabecera} ${faq} ${app}`).not.toMatch(/PERTE|MOVES/);
  });

  test('1397 normativa: la UE no exige mezcla con hidrógeno; lo que rige es el fin de las ayudas a calderas fósiles', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const texto = await textoConGuia(page);
    expect(texto).not.toContain('mezcla con hidrógeno o biogás');
    expect(texto).not.toContain('menor apoyo de subvenciones');
    // Directiva (UE) 2024/1275, art. 17.15.
    expect(texto).toContain('desde el 1 de enero de 2025, los países de la UE no pueden conceder incentivos financieros para instalar calderas independientes de combustibles fósiles (Directiva (UE) 2024/1275, art. 17.15)');
  });

  test('1398 fechado: nada anclado a 2025 en presente, ni en la pantalla ni en el HTML servido', async ({ page, request }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    expect(await textoConGuia(page)).not.toMatch(/disponibles en 2025|España 2025|tecnologías en 2025|Normativa 2025/);
    const { cabecera, faq, app } = await htmlServido(request);
    expect(`${cabecera} ${faq} ${app}`).not.toMatch(/En 2025 siguen activas|calefacción 2025/);
  });

  test('1399 marcas: el consejo de clima frío da un criterio técnico, sin marcas', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const texto = await textoResultado(page);
    expect(texto).not.toMatch(/Mitsubishi|Daikin|Fujitsu|marcas japonesas/);
    expect(texto).toContain('pide su rendimiento (COP) y su potencia con temperaturas exteriores bajo cero');
  });

  // ─ 1400-1402 ─

  test('1400 región: RegionBadge «Datos de referencia: España»', async ({ page }) => {
    await abrirTest(page);
    await expect(page.locator('[role="note"][aria-label*="España"]')).toHaveCount(1);
    await expect(page.getByText('Datos de referencia: España. La metodología es universal')).toBeVisible();
  });

  test('1401 pregunta 5: una caldera de 5 a 10 años tiene respuesta, y ya no hay vidas útiles sin fuente', async ({ page }) => {
    const etiquetas = PREGUNTAS.find((p) => p.id === 5)?.opciones.map((o) => o.etiqueta) ?? [];
    expect(etiquetas).toContain('Sí, entre 5 y 10 años');
    await abrirTest(page);
    // La misma caldera de 7 años del caso de la ficha, en el caso normal.
    await responderEtiquetas(page, [...NORMAL.slice(0, 4), 'Sí, entre 5 y 10 años', ...NORMAL.slice(5)]);
    const texto = await textoConGuia(page);
    expect(texto).toContain('Tu caldera de gas tiene entre 5 y 10 años');
    // Las cifras incompatibles: «15 – 25 años» para todo, «10-12», «10-15», «15-20», «menos de 7».
    expect(texto).not.toMatch(/15 – 25 años|10-12 años|10-15 años|15-20 años|menos de 7 años|Vida útil/);
  });

  test('1402 texto: «Next Generation EU» ya no se pega a la palabra siguiente', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    const texto = await textoConGuia(page);
    expect(texto).not.toMatch(/EU[a-záéíóú]/);
    expect(texto).toContain('Next Generation EU) cubría');
  });

  // ─ 1403, 1404: contraste, medido con los colores computados ─

  test('1403 contraste: los textos pequeños de marca llegan a 4,5:1 en claro y en oscuro', async ({ page }) => {
    // Medido antes de reparar: claro — progresoPaso 3,93 · razonesTitulo 3,67 · subvencionesTitulo
    // 2,50 · costeValor 3,93 · btnRepetir 3,93; oscuro — costeValor 4,36 · costeLabel 4,39.
    const medidas: Record<string, number> = {};
    await abrirTest(page);
    medidas['claro progresoPaso'] = await contraste(page, '[class*="progresoPaso"]');
    await responderEtiquetas(page, NORMAL);
    for (const s of ['razonesTitulo', 'subvencionesTitulo', 'costeValor', 'costeLabel', 'btnRepetir', 'recomendacionValor', 'prosContrasSub']) {
      medidas[`claro ${s}`] = await contraste(page, `[class*="${s}"]`);
    }
    await ponerTemaOscuro(page);
    medidas['oscuro progresoPaso'] = await contraste(page, '[class*="progresoPaso"]');
    await responderEtiquetas(page, NORMAL);
    for (const s of ['razonesTitulo', 'subvencionesTitulo', 'costeValor', 'costeLabel', 'btnRepetir', 'recomendacionValor', 'prosContrasSub']) {
      medidas[`oscuro ${s}`] = await contraste(page, `[class*="${s}"]`);
    }
    const bajos = Object.entries(medidas).filter(([, v]) => v < 4.5).map(([k, v]) => `${k} ${v.toFixed(2)}`);
    expect(bajos).toEqual([]);
  });

  test('1403 contraste: el aviso de recorte se lee en los dos temas', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, SIN_EXTERIOR);
    expect(await contraste(page, '[class*="avisoRecorteItem"]')).toBeGreaterThanOrEqual(4.5);
    await ponerTemaOscuro(page);
    await responderEtiquetas(page, SIN_EXTERIOR);
    expect(await contraste(page, '[class*="avisoRecorteItem"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('1404 hero de resultados: --hero-bg, sin degradado, y el blanco pasa en los dos temas', async ({ page }) => {
    // Antes (degradado --primary → --secondary): claro subtítulo 2,80; oscuro título 2,40 y
    // subtítulo 2,18. --hero-bg da 8,33:1 con blanco.
    const bajos: string[] = [];
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    expect(await page.locator('[class*="heroResultados"]').evaluate((e) => getComputedStyle(e).backgroundImage)).toBe('none');
    const subClaro = await contraste(page, '[class*="heroSubtitleSm"]');
    const tituloClaro = await contraste(page, '[class*="heroTitleSm"]');
    if (subClaro < 4.5) bajos.push(`claro subtítulo ${subClaro.toFixed(2)}`);
    if (tituloClaro < 3) bajos.push(`claro título ${tituloClaro.toFixed(2)}`);
    await ponerTemaOscuro(page);
    await responderEtiquetas(page, NORMAL);
    const tituloOscuro = await contraste(page, '[class*="heroTitleSm"]');
    const subOscuro = await contraste(page, '[class*="heroSubtitleSm"]');
    if (tituloOscuro < 3) bajos.push(`oscuro título ${tituloOscuro.toFixed(2)}`);
    if (subOscuro < 4.5) bajos.push(`oscuro subtítulo ${subOscuro.toFixed(2)}`);
    expect(bajos).toEqual([]);
  });

  // ─ Familia de selectores, forma g ─

  test('foco: al pulsar «Ver resultado» el foco va al encabezado del resultado, no a <body>', async ({ page }) => {
    await abrirTest(page);
    await responderEtiquetas(page, NORMAL);
    await expect
      .poll(() => page.evaluate(() => `${document.activeElement?.tagName}:${document.activeElement?.textContent ?? ''}`))
      .toBe('H1:Tu sistema de calefacción ideal');
  });
});
