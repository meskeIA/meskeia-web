import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, COSTE_MINIMO, PREGUNTAS, type TipoFormacion } from '../../app/selector-formacion-postgrado/motor';
import { FORMACIONES } from '../../app/selector-formacion-postgrado/motor';
import { parseSpanishNumber } from '../../lib/formatters';

/**
 * ¿Qué formación postgrado te conviene? (selector-formacion-postgrado) — reparado el 24/09/2026
 * desde una sospecha del Inspector sobre la familia de los selectores (selector-smartphone
 * 950/951 y selector-mascota 1341/1342, repetidos aquí).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra decía aria-valuenow = pregunta + 1 con mínimo 1, sin aria-label, y pintaba las
 *     respondidas contando la actual en cuanto se marca: con la pregunta 1 respondida anunciaba
 *     0 y pintaba 0,1.
 *   · Empates: `reduce` con `>=` sobre las claves → a igualdad ganaba el máster, el primero.
 *     Enumerado: 88.071 de 1.048.576 perfiles empatan en cabeza, y en 49.282 cambia el ganador.
 *     La comparativa de afinidad, ordenada con `sort` estable, repetía el sesgo.
 *   · Razones fijas: la descripción de cada vía hablaba del usuario. En 51.860 perfiles salía
 *     la certificación a quien había marcado «Sin experiencia o menos de 1 año», con «Tienes
 *     experiencia laboral y lo que necesitas es validar y ampliar habilidades concretas».
 *
 * EL MOTOR (app/selector-formacion-postgrado/motor.ts): las mismas preguntas y pesos. A igualdad,
 * primero la motivación (pregunta 1), luego el objetivo profesional (5) y por último el menor
 * coste mínimo; el empate se anuncia. Las razones citan las respuestas que más han sumado.
 * Desde la reparación de los hallazgos 1445-1458 (bloque del final), cuatro respuestas son
 * LÍMITES y no pesos (presupuesto, tiempo, urgencia y título): se elige entre las vías que los
 * cumplen, y si ninguna los cumple todos, entre las que incumplen menos, con un aviso.
 */

async function abrirTest(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-formacion-postgrado/');
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

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: /^Siguiente|^Ver resultado/ }).click();
  }
  await page.locator('[class*="resultadoTitulo"]').waitFor();
  return (await page.locator('section[class*="resultado"]').innerText()).replace(/\s+/g, ' ');
}

// Estabilidad laboral · 1-2 años compaginando · Recién graduado · Menos de 2.000 € ·
// Administración Pública · Sin experiencia · Presencial · Empresa, finanzas… · Sin urgencia ·
// Me interesan más las habilidades. (máster, FP, bootcamp, oposiciones, certificación), a mano:
//   P1 op 4, cert 1 · P2 máster 3, FP 3, op 2 · P3 máster 3, FP 3, op 2 · P4 op 3, cert 4, FP 2 ·
//   P5 op 5, cert 1 · P6 máster 3, FP 3, op 2 · P7 máster 3, FP 3, op 2 · P8 máster 4, cert 3 ·
//   P9 máster 4, FP 2 · P10 boot 4, cert 4
//   = máster 20 · FP 16 · bootcamp 4 · oposiciones 20 · certificación 13.
// Límites: ninguno aparta a nadie (el presupuesto apartaba el bootcamp hasta el 3104, 10/10/2026; con
// 4 puntos no cambia nada). Empate a 20 entre dos vías que
// lo cumplen todo; la motivación («estabilidad laboral») da 4 a oposiciones y 0 al máster.
//
// El perfil que usaba este test hasta la reparación de 1446/1447 ([0,0,0,0,0,0,0,2,0,0]: 3-6 meses,
// urgencia en meses y «Necesito un título universitario») recomendaba oposiciones, de 2-5 años y
// sin título universitario: consagraba el defecto. Ahora da certificación con un aviso.
const EMPATE = [0, 1, 0, 0, 0, 0, 0, 2, 3, 2] as const;

// Estabilidad · 3-6 meses · Recién graduado · Menos de 2.000 € · Administración Pública · Sin
// experiencia · Presencial · Tecnología · Lo antes posible · «Me interesan más las habilidades»:
//   máster 3+3+3 = 9 · FP 11 · bootcamp 4+5+4+4 = 17 · oposiciones 18 ·
//   certificación 1+2+4+1+3+4+4 = 19. Gana la certificación a quien ha marcado «Sin
//   experiencia», y antes se le decía «Tienes experiencia laboral…».
const CERTIFICACION_SIN_EXPERIENCIA = [0, 0, 0, 0, 0, 0, 0, 0, 0, 2] as const;

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

test('la barra de progreso anuncia lo mismo que pinta, también al marcar la respuesta', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]').first();
  const medir = async (momento: string) => {
    const [ahora, min, max] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
    );
    const anunciado = (ahora - min) / (max - min);
    const pedido = Number(await page.locator('[class*="progresoFill"]').getAttribute('data-progreso')) / 100;
    expect(anunciado, momento).toBeCloseTo(pedido, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth), { message: momento })
      .toBeCloseTo(anunciado, 2);
    return anunciado;
  };
  expect(await medir('pregunta 1 sin responder')).toBe(0);
  await page.locator('[role="radio"]').first().click();
  expect(await medir('pregunta 1 respondida')).toBeCloseTo(0.1, 6);
  await expect(barra).toHaveAttribute('aria-valuetext', 'Pregunta 1 de 10');
  await page.getByRole('button', { name: /^Siguiente/ }).click();
  await expect(barra).toHaveAttribute('aria-valuetext', 'Pregunta 2 de 10');
  expect(await medir('pregunta 2')).toBeCloseTo(0.1, 6);
});

test('un empate se anuncia y lo deshace la motivación, no ser la primera clave', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, EMPATE);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Preparación de Oposiciones');
  await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
    'la preparación de oposiciones y el máster universitario encajan exactamente igual; se muestra primero la preparación de oposiciones porque encaja mejor con tu motivación principal',
  );
  // La comparativa sigue el mismo orden: oposiciones antes que máster, aunque empaten a 20.
  const etiquetas = await page.locator('[class*="alternativaLabel"]').allInnerTexts();
  expect(etiquetas.slice(0, 2).map((e) => e.replace(/^\S+\s/, ''))).toEqual(['Oposiciones', 'Máster']);
  expect(texto).toContain('Motivación: has respondido «Conseguir estabilidad laboral y empleo seguro», que suma 4 puntos a la preparación de oposiciones.');
});

test('las razones salen de las respuestas: sin experiencia no se lee «Tienes experiencia laboral»', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, CERTIFICACION_SIN_EXPERIENCIA);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Certificación Profesional');
  await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
  expect(texto).not.toContain('Tienes experiencia laboral');
  // Las tres que más le suman, las tres de 4 puntos, por orden de pregunta.
  expect(texto).toContain('Presupuesto: has respondido «Menos de 2.000 €», que suma 4 puntos a la certificación profesional.');
  expect(texto).toContain('Urgencia: has respondido «Lo antes posible, en meses», que suma 4 puntos a la certificación profesional.');
  expect(texto).toContain('Título: has respondido «Me interesan más las habilidades que el título», que suma 4 puntos a la certificación profesional.');
});

test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  test.setTimeout(180_000);
  const DESEMPATE = [
    { id: 1, frase: 'encaja mejor con tu motivación principal' },
    { id: 5, frase: 'encaja mejor con tu objetivo profesional' },
  ];
  const r: Record<number, number> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  const peso = (id: number, k: TipoFormacion) => PREGUNTAS[id - 1].opciones[r[id]].pesos[k] ?? 0;
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      // Desde la reparación de 1445-1447 se elige entre las CANDIDATAS (las que incumplen menos
      // límites declarados), no entre las cinco: antes este test exigía la puntuación máxima de
      // todas, que es justo lo que recomendaba bootcamps a quien no podía pagarlos.
      const minimo = Math.min(...CLAVES.map((k) => res.incumple[k].length));
      const esperadas = CLAVES.filter((k) => res.incumple[k].length === minimo);
      if (esperadas.length !== res.candidatas.length || esperadas.some((k) => !res.candidatas.includes(k))) mal('candidatas mal elegidas');
      const max = Math.max(...res.candidatas.map((k) => res.puntos[k]));
      if (res.puntos[res.tipo] !== max || res.orden[0] !== res.tipo || !res.candidatas.includes(res.tipo)) mal('no encabeza con la puntuación máxima de las candidatas');
      const reales = res.candidatas.filter((k) => k !== res.tipo && res.puntos[k] === max);
      if (reales.length !== res.empatadas.length) mal('empatadas mal contadas');
      if (reales.length === 0 && res.criterioDesempate !== '') mal('criterio sin empate');
      if (reales.length > 0) empates++;
      for (const k of reales) {
        const decide = DESEMPATE.find(({ id }) => peso(id, res.tipo) !== peso(id, k));
        if (decide) {
          if (peso(decide.id, res.tipo) < peso(decide.id, k)) mal(`pierde en la pregunta ${decide.id} contra ${k}`);
          if (!res.criterioDesempate.includes(decide.frase)) mal(`no nombra la pregunta ${decide.id}`);
        } else {
          if (COSTE_MINIMO[res.tipo] > COSTE_MINIMO[k]) mal(`más cara que ${k}`);
          if (!res.criterioDesempate.includes('coste mínimo es el más bajo')) mal('no nombra el coste');
        }
      }
      if (res.razones.length === 0) mal('sin razones');
      for (const razon of res.razones) {
        const citada = razon.match(/«([^»]+)»/)?.[1];
        if (!PREGUNTAS.some((p) => p.opciones[r[p.id]].texto === citada)) mal(`cita «${citada}», no respondida`);
      }
      return;
    }
    for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
      r[PREGUNTAS[i].id] = k;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(total).toBe(1_048_576);
  // 88.071 antes de la reparación, cuando competían siempre las cinco vías; con los límites,
  // compiten menos y empatan menos (recuento del motor el 24/09/2026: 57.371). Desde el 3104
  // (10/10/2026) el presupuesto ya no aparta el bootcamp, que vuelve a competir: 62.110.
  expect(empates).toBe(62_110);
});

/**
 * REPARACIÓN 24/09/2026 — hallazgos 1445-1458 (Inspector, primera inspección de la app).
 *
 * La inspección dejó aquí 17 test.fail(); se han reescrito como tests en verde que reproducen el
 * caso de su ficha y exigen lo reparado. Los tres casos que ya pasaban (normal, rechazo y fracción
 * de la comparativa) se conservan; el normal cambia «35 pts» por «35 puntos» (ver 1456).
 *
 * Límites (hallazgos 1445-1447): la inspección aceptaba filtrar o avisar. La reparación hace las
 * dos cosas: FILTRA cuando alguna vía cumple todos los límites, y AVISA cuando ninguna puede
 * (p. ej. «Necesito un título universitario» con «3-6 meses»: el único título universitario, el
 * máster, dura 1-2 años). Por eso los barridos cuentan perfiles SIN aviso, no perfiles con la vía
 * «incumplidora»: esos últimos existen por lógica (163.840 perfiles no tienen ninguna vía posible).
 *
 * Las respuestas van por índice de opción (0-3) en el orden de las preguntas 1 a 10.
 */
test.describe('Reparación 24/09/2026 — restricciones declaradas, datos de la guía y accesibilidad', () => {
  interface PreguntaFaq { name: string; acceptedAnswer: { text: string } }
  interface BloqueJsonLd { '@type'?: string; mainEntity?: PreguntaFaq[]; featureList?: string[] }

  const tituloResultado = (page: Page) => page.locator('[class*="resultadoTitulo"]').innerText();
  const aviso = (page: Page) => page.locator('[class*="avisoRestricciones"]');

  /** El mínimo de «Coste orientativo: 2.000 – 12.000 €.», en euros. */
  const minimoPublicado = async (page: Page): Promise<number> => {
    const nota = await page.locator('[class*="warningBox"]').innerText();
    const m = nota.match(/Coste orientativo:\s*([\d.,]+)/);
    return m ? parseSpanishNumber(m[1]) : Number.NaN;
  };

  /** El bloque educativo entero (se monta siempre; plegado solo se oculta por CSS). */
  const textoGuia = (page: Page) =>
    page.locator('[class*="guideSection"]').evaluateAll((els) => els.map((e) => e.textContent ?? '').join(' ').replace(/\s+/g, ' '));

  const leerJsonLd = async (page: Page): Promise<BloqueJsonLd[]> =>
    (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b) as BloqueJsonLd);

  const leerFaq = async (page: Page): Promise<{ p: string; r: string }[]> => {
    const faq = (await leerJsonLd(page)).find((j) => j['@type'] === 'FAQPage');
    return (faq?.mainEntity ?? []).map((q) => ({ p: q.name, r: q.acceptedAnswer.text }));
  };

  /** Contraste WCAG del primer elemento visible, con el fondo compuesto capa a capa. */
  const contraste = (page: Page, selector: string): Promise<number> =>
    page.evaluate((sel) => {
      interface C { r: number; g: number; b: number; a: number }
      const parse = (c: string): C => {
        const p = (c.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const sobre = (x: C, y: C): C => ({ r: x.r * x.a + y.r * (1 - x.a), g: x.g * x.a + y.g * (1 - x.a), b: x.b * x.a + y.b * (1 - x.a), a: 1 });
      const lum = (c: C) => {
        const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
      };
      const el = [...document.querySelectorAll<HTMLElement>(sel)].find((x) => x.offsetParent !== null && (x.textContent ?? '').trim());
      if (!el) return Number.NaN;
      const capas: C[] = [];
      for (let n: HTMLElement | null = el; n; n = n.parentElement) {
        const bg = parse(getComputedStyle(n).backgroundColor);
        if (bg.a > 0) capas.push(bg);
        if (bg.a === 1) break;
      }
      let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
      for (const c of capas.reverse()) fondo = sobre(c, fondo);
      const texto = sobre(parse(getComputedStyle(el).color), fondo);
      const [l1, l2] = [lum(texto), lum(fondo)];
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }, selector);

  /** Las 1.048.576 combinaciones, una vez por worker: perfiles en falta tras la reparación. */
  interface Barrido { presupuestoSinAviso: number; tiempoSinAviso: number; tituloSinAviso: number; compatibleIgnorada: number; sinNingunaPosible: number }
  let barrido: Barrido | null = null;
  const barrer = (): Barrido => {
    if (barrido) return barrido;
    const c: Barrido = { presupuestoSinAviso: 0, tiempoSinAviso: 0, tituloSinAviso: 0, compatibleIgnorada: 0, sinNingunaPosible: 0 };
    const r: Record<number, number> = {};
    const largas: TipoFormacion[] = ['master', 'fp_superior', 'oposiciones'];
    const recorrer = (i: number): void => {
      if (i === PREGUNTAS.length) {
        const res = calcularResultado(r);
        const avisa = res.avisoRestricciones;
        // Desde el 3104 el bootcamp no se aparta por presupuesto: el aviso es `avisoPresupuesto`.
        if (r[4] === 0 && COSTE_MINIMO[res.tipo] >= 2000 && !/presupuesto/.test(`${avisa} ${res.avisoPresupuesto}`)) c.presupuestoSinAviso++;
        if ((r[2] === 0 || r[2] === 3 || r[9] === 0) && largas.includes(res.tipo) && !/dura /.test(avisa)) c.tiempoSinAviso++;
        if (r[10] === 0 && res.tipo !== 'master' && !/título universitario/.test(avisa)) c.tituloSinAviso++;
        const hayCompatible = CLAVES.some((k) => res.incumple[k].length === 0);
        if (hayCompatible && res.incumple[res.tipo].length > 0) c.compatibleIgnorada++;
        if (!hayCompatible) c.sinNingunaPosible++;
        return;
      }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
        r[PREGUNTAS[i].id] = k;
        recorrer(i + 1);
      }
    };
    recorrer(0);
    barrido = c;
    return c;
  };

  // Especializarme académicamente · 1-2 años compaginando · Trabajo en mi sector · 6.000-15.000 € ·
  // Especializarme con título oficial · 3-7 años · Híbrido · Empresa, finanzas… · Sin urgencia ·
  // Necesito un título universitario oficial.
  const NORMAL = [1, 1, 1, 2, 1, 2, 2, 2, 3, 0] as const;

  test('caso normal: especialización con título oficial → máster 35, sin empate, comparativa en su orden', async ({ page }) => {
    // A mano (pesos de motor.ts): máster 4+3+3+3+4+2+3+4+4+5 = 35 · certificación 4+4+3 = 11 ·
    // FP 1+3+2+2+2 = 10 · bootcamp 3+2+2 = 7 · oposiciones 2. Con «Necesito un título
    // universitario», solo el máster cumple: las otras cuatro llevan la nota «sin título
    // universitario oficial» en la comparativa.
    await abrirTest(page);
    const texto = await responder(page, NORMAL);
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Máster Universitario');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(aviso(page)).toHaveCount(0);
    // «35 puntos» y no «35 pts»: la abreviatura daba «1 pts» con un punto (hallazgo 1456).
    expect(await page.locator('[class*="alternativaPct"]').allInnerTexts()).toEqual(['35 puntos', '11 puntos', '10 puntos', '7 puntos', '2 puntos']);
    const etiquetas = (await page.locator('[class*="alternativaLabel"]').allInnerTexts()).map((e) => e.replace(/^\S+\s/, ''));
    expect(etiquetas).toEqual(['Máster', 'Certificación', 'FP Superior', 'Bootcamp', 'Oposiciones']);
    await expect(page.locator('[class*="alternativaIncumple"]').filter({ hasText: 'sin título universitario oficial' })).toHaveCount(4);
    // Las tres que más suman al máster; a igual valor (4 puntos), por número de pregunta.
    expect(texto).toContain('Título: has respondido «Necesito un título universitario oficial reconocido», que suma 5 puntos al máster universitario.');
    expect(texto).toContain('Motivación: has respondido «Especializarme académicamente en mi área», que suma 4 puntos al máster universitario.');
    expect(texto).toContain('Objetivo profesional: has respondido «Especializarme en un área concreta con título oficial», que suma 4 puntos al máster universitario.');
    expect(texto).toContain('Duración estimada: 1-2 años');
  });

  test('sin respuesta no se avanza, y «Anterior» conserva la opción marcada', async ({ page }) => {
    await abrirTest(page);
    const siguiente = page.getByRole('button', { name: /^Siguiente/ });
    const anterior = page.getByRole('button', { name: /Anterior/ });
    await expect(siguiente).toBeDisabled();
    await expect(anterior).toBeDisabled();
    await page.locator('[role="radio"]').nth(2).click();
    await expect(siguiente).toBeEnabled();
    await siguiente.click();
    await expect(page.locator('[class*="progresoTexto"]')).toHaveText('2 / 10');
    await expect(siguiente).toBeDisabled();
    await anterior.click();
    await expect(page.locator('[role="radio"]').nth(2)).toHaveAttribute('aria-checked', 'true');
  });

  test('cada barra de la comparativa pinta su fracción de la puntuación más alta', async ({ page }) => {
    // Pintado: pts / puntuación más alta (35 en el caso normal). Desde 1456 la barra es decorativa
    // (aria-hidden, sin valor anunciado): el texto de al lado dice los puntos.
    await abrirTest(page);
    await responder(page, NORMAL);
    const barras = page.locator('[class*="alternativaBarWrap"] > *');
    const medir = () =>
      barras.evaluateAll((els) =>
        els.map((e) => ({
          ahora: e.getAttribute('aria-valuenow'),
          min: Number(e.getAttribute('aria-valuemin') ?? 0),
          max: Number(e.getAttribute('aria-valuemax') ?? 1),
          pintado: e.getBoundingClientRect().width / (e.parentElement?.getBoundingClientRect().width ?? 1),
        })),
      );
    // El ancho lleva `transition: width 0.6s`: se espera a que el relleno llegue a su valor.
    const esperado = [35, 11, 10, 7, 2].map((p) => p / 35);
    await expect
      .poll(async () => Math.max(...(await medir()).map((m, i) => Math.abs(m.pintado - esperado[i]))), { message: 'relleno de las barras' })
      .toBeLessThan(0.005);
    for (const [i, m] of (await medir()).entries()) {
      if (m.ahora !== null) expect((Number(m.ahora) - m.min) / (m.max - m.min), `barra ${i + 1}`).toBeCloseTo(m.pintado, 2);
    }
  });

  test('1445: con «Menos de 2.000 €» el bootcamp se recomienda con el aviso de buscar uno subvencionado; el máster cabe en universidad pública', async ({ page }) => {
    // Cambiar de sector · 3-6 meses · Otro sector · MENOS DE 2.000 € · Tecnología · 1-3 años ·
    // Online · Tecnología · Lo antes posible · Habilidades → bootcamp 36 · certificación 26.
    // Reescrito el 10/10/2026 (hallazgo 3104, opción A decidida por el usuario): este test exigía
    // apartar el bootcamp por una horquilla sin fuente («desde 2.000 €») que la guía contradice
    // («algunos están subvencionados por el SEPE»). Ahora gana el bootcamp y se dice qué buscar.
    await abrirTest(page);
    await responder(page, [2, 0, 2, 0, 2, 1, 1, 0, 0, 2]);
    expect(await tituloResultado(page)).toBe('Bootcamp / Formación Online Intensiva');
    await expect(aviso(page)).toHaveCount(0);
    await expect(page.locator('[data-aviso="presupuesto"]')).toHaveText(
      '💶 Tu presupuesto es de menos de 2.000 €, y el coste orientativo del bootcamp en esta ficha empieza en 2.000 €. No se aparta por eso porque algunos están subvencionados (por ejemplo, por el SEPE) o tienen financiación: busca uno así antes de matricularte.',
    );
    // Especializarme · 1-2 años · Recién graduado · MENOS DE 2.000 € · título oficial · Sin
    // experiencia · Presencial · Empresa · Sin urgencia · Necesito título → máster 33: su mínimo es
    // ahora el precio público (820,80 €, hallazgo 1448), que cabe en el presupuesto.
    await abrirTest(page);
    await responder(page, [1, 1, 0, 0, 1, 0, 0, 2, 3, 0]);
    expect(await tituloResultado(page)).toBe('Máster Universitario');
    expect(await minimoPublicado(page)).toBeCloseTo(820.8, 2);
    expect(barrer().presupuestoSinAviso).toBe(0);
  });

  test('1446: con «3-6 meses» o «Unas semanas o meses» la vía larga se aparta, o se dice que no cabe', async ({ page }) => {
    // Especializarme · 3-6 MESES A TIEMPO COMPLETO · Recién graduado · >15.000 € o beca · título
    // oficial · Sin experiencia · Presencial · Empresa · Sin urgencia · Necesito título → ninguna
    // vía cumple (el título solo lo da el máster, que dura 1-2 años): máster 34, con aviso.
    await abrirTest(page);
    await responder(page, [1, 0, 0, 3, 1, 0, 0, 2, 3, 0]);
    expect(await tituloResultado(page)).toBe('Máster Universitario');
    await expect(aviso(page)).toContainText(
      // Reescrito el 09/10/2026 (hallazgo 3105): certificación y bootcamp también incumplen un solo límite
      // (el título), así que el máster no es «la que menos choca»: es la de más afinidad de las tres.
      'Ninguna vía cumple a la vez todo lo que has declarado. El máster universitario, la certificación profesional y el bootcamp son las que menos chocan con tus límites; se recomienda el máster universitario, que es la de más afinidad entre ellas, pero dura 1-2 años, más de lo que puedes dedicar («3-6 meses a tiempo completo»).',
    );
    // Estabilidad · UNAS SEMANAS O MESES · Desempleado · <2.000 € · Administración Pública ·
    // 1-3 años · Autónomo · Administración · LO ANTES POSIBLE · Titulación pública → oposiciones 27
    // (2-5 años) se aparta; certificación 17, que cumple todo.
    await abrirTest(page);
    await responder(page, [0, 3, 3, 0, 0, 1, 3, 1, 0, 1]);
    expect(await tituloResultado(page)).toBe('Certificación Profesional');
    await expect(aviso(page)).toContainText(
      'Por afinidad encajaría más la preparación de oposiciones (27 puntos), pero dura 2-5 años de preparación, más de lo que puedes dedicar («Unas semanas o meses de aprendizaje flexible»); y tampoco encaja con tu urgencia de incorporarte en meses.',
    );
    expect(barrer().tiempoSinAviso).toBe(0);
  });

  test('1447: «Necesito un título universitario oficial» → máster, o aviso de que la vía no lo da', async ({ page }) => {
    // Cambiar de sector · 3-6 meses · Otro sector · 2.000-6.000 € · Tecnología · 1-3 años · Online ·
    // Tecnología · Lo antes posible · NECESITO TÍTULO → el máster no cabe en 3-6 meses ni en la
    // urgencia (2 límites), el bootcamp solo incumple el título (1): bootcamp 35, con aviso.
    await abrirTest(page);
    await responder(page, [2, 0, 2, 1, 2, 1, 1, 0, 0, 0]);
    expect(await tituloResultado(page)).toBe('Bootcamp / Formación Online Intensiva');
    await expect(aviso(page)).toContainText(
      // Reescrito el 09/10/2026 (hallazgo 3105): la certificación incumple lo mismo que el bootcamp.
      'Ninguna vía cumple a la vez todo lo que has declarado. El bootcamp y la certificación profesional son las que menos chocan con tus límites; se recomienda el bootcamp, que es la de más afinidad entre ellas, pero no da un título universitario oficial, y has respondido que lo necesitas.',
    );
    const b = barrer();
    expect(b.tituloSinAviso).toBe(0);
    // Si alguna vía cumple todos los límites, la recomendada es una de ellas; si ninguna puede,
    // se avisa (los 163.840 perfiles con título + tiempo o urgencia incompatibles).
    expect(b.compatibleIgnorada).toBe(0);
    expect(b.sinNingunaPosible).toBe(163_840);
  });

  test('1448: el coste mínimo del máster es el precio público de 60 ECTS, en la ficha y en la guía', async ({ page }) => {
    // 60 ECTS × 13,68 €/crédito (máster no habilitante, primera matrícula, Junta de Andalucía,
    // curso 2026/2027) = 820,80 €. Antes: «3.000 – 30.000 €» y «universidades públicas desde 1.500 €».
    await abrirTest(page);
    await responder(page, NORMAL);
    expect(await minimoPublicado(page)).toBeCloseTo(820.8, 2);
    expect(COSTE_MINIMO.master).toBeCloseTo(60 * 13.68, 6);
    const guia = await textoGuia(page);
    expect(guia).not.toMatch(/públicas desde 1\.500/);
    expect(guia).toContain('60 créditos de un máster no habilitante cuestan 820,80 € en Andalucía (13,68 € por crédito en primera matrícula, curso 2026/2027)');
  });

  test('1449: medicina y psicología clínica no tienen máster habilitante (guía y FAQ)', async ({ page }) => {
    // Medicina: Grado de 360 ECTS (Orden ECI/332/2008) y especialidad por MIR; Psicología Clínica
    // por residencia (RD 2490/1998). Habilitantes reales: abogacía y procura (Ley 34/2006),
    // psicología general sanitaria (Ley 33/2011, DA 7.ª), profesorado (LOE, arts. 94-95),
    // arquitectura e ingenierías (UNED y Universidad de Granada, listas de másteres habilitantes).
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toMatch(/habilitantes \(arquitectura, medicina, psicología clínica\)/);
    expect(guia).toContain('Medicina no tiene máster habilitante: se ejerce con el grado de 360 créditos (Orden ECI/332/2008)');
    expect(guia).toContain('la psicología general sanitaria (Ley 33/2011, disposición adicional 7.ª)');
    const faqMaster = (await leerFaq(page)).find((q) => /Vale la pena hacer un máster/.test(q.p))?.r ?? '';
    expect(faqMaster).not.toContain('casi obligatorio');
    expect(faqMaster).toContain('Medicina, en cambio, se ejerce con el grado, y sus especialidades se obtienen por residencia (MIR), no por un máster.');
  });

  test('1450: el cuerpo de Maestros no exige el máster de profesorado, y el MIR no es una oposición', async ({ page }) => {
    // LOE art. 93 (Primaria: título de Maestro o Grado equivalente) y arts. 94-95 (Secundaria,
    // Bachillerato y FP: grado + formación pedagógica de postgrado). RD 1146/2006: el MIR es una
    // relación laboral especial de residencia, temporal.
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toMatch(/\(Maestros[^)]*\):\s*requieren máster/);
    expect(guia).not.toMatch(/Cuerpos sanitarios \(MIR/);
    expect(guia).not.toContain('empleo de por vida');
    expect(guia).toContain('para Primaria (Maestros), el título de Maestro o el Grado equivalente (LOE, art. 93)');
    expect(guia).toContain('contrato de residencia temporal (RD 1146/2006)');
  });

  test('1451: la cifra del INE sobre el empleo de los titulados de máster es la que publica el INE', async ({ page }) => {
    // INE, EILU 2019 (29/10/2020, última edición en INEbase): 86,1 % los graduados universitarios
    // del curso 2013-2014 y 87,3 % los titulados de máster. Antes: «un 8 % superior».
    await abrirTest(page);
    const faqMaster = (await leerFaq(page)).find((q) => /Vale la pena hacer un máster/.test(q.p))?.r ?? '';
    expect(faqMaster).not.toMatch(/8\s?% superior/);
    expect(faqMaster).toContain('la tasa de empleo en 2019 de los graduados universitarios del curso 2013-2014 era del 86,1\u00A0%, y la de los titulados de máster, del 87,3\u00A0%');
  });

  test('1452: el FAQ da las duraciones de la pantalla y las cinco vías', async ({ page }) => {
    await abrirTest(page);
    const faq = await leerFaq(page);
    const bootcamp = faq.find((q) => /bootcamp de un máster/.test(q.p))?.r ?? '';
    expect(bootcamp).toContain(`(${FORMACIONES.bootcamp.duracion})`);
    expect(bootcamp).not.toContain('3-9 meses');
    const oposiciones = faq.find((q) => /oposiciones/.test(q.p))?.r ?? '';
    expect(oposiciones).toContain(FORMACIONES.oposiciones.duracion);
    expect(oposiciones).not.toContain('1-4 años');
    // La cifra de aprobados («entre el 5 % y el 15 %») no tenía fuente: se ha retirado.
    expect(oposiciones).not.toMatch(/\d\s?%/);
    expect(faq[0]?.r ?? '').toContain(`una FP de grado superior (${FORMACIONES.fp_superior.duracion})`);
  });

  test('1453: la inserción de la FP superior sale de la estadística oficial, con su plazo', async ({ page }) => {
    // Ministerio de Educación, FP y Deportes, nota del 26/11/2025 (titulados 2020-2021): 51,1 % de
    // afiliación al primer año en grado superior; en torno al 65 % el primer año y cerca del 75 % al
    // tercero en Informática y Comunicaciones, Fabricación Mecánica e Instalación y Mantenimiento.
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toMatch(/superior\s+al\s+75\s?%\s+en muchas familias/);
    expect(guia).toContain('la tasa media de afiliación de los titulados de grado superior fue del 51,1 % al año de terminar');
  });

  test('1454: los datos de España se señalan (RegionBadge) y el resultado no habla de «CCAA»', async ({ page }) => {
    await abrirTest(page);
    await expect(page.locator('[role="note"][aria-label*="España"]')).toHaveCount(1);
    const texto = await responder(page, NORMAL);
    expect(texto).not.toContain('CCAA');
    // Equivalencias para quien viene de otro sistema (créditos, título propio, acceso con título extranjero).
    expect(await textoGuia(page)).toContain('Si vienes de otro sistema educativo');
  });

  test('1455: sin ranking fechado en un año cerrado ni certificaciones de otro país', async ({ page }) => {
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toMatch(/\(2025\)/);
    expect(guia).not.toMatch(/\bCPA\b/);
    expect(guia).toContain('Algunas certificaciones con reconocimiento internacional');
  });

  test('1456: la comparativa no es una barra de progreso, no lee los emojis y no dice «1 pts»', async ({ page }) => {
    await abrirTest(page);
    await responder(page, NORMAL);
    await expect(page.locator('[class*="alternativas"] [role="progressbar"]')).toHaveCount(0);
    await expect(page.locator('[class*="alternativaBarWrap"][aria-hidden="true"]')).toHaveCount(5);
    const emojiSuelto = await page.locator('[class*="alternativaLabel"]').evaluateAll((els) =>
      els.filter((e) => [...e.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && /\p{Extended_Pictographic}/u.test(n.textContent ?? ''))).length,
    );
    expect(emojiSuelto, 'etiquetas con emoji leído').toBe(0);
    // Estabilidad · Unas semanas · Desempleado · <2.000 € · Administración · 1-3 años · Autónomo ·
    // Administración · Lo antes posible · Titulación pública → el máster suma 1 (sector, +1).
    await abrirTest(page);
    await responder(page, [0, 3, 3, 0, 0, 1, 3, 1, 0, 1]);
    const puntos = await page.locator('[class*="alternativaPct"]').allInnerTexts();
    expect(puntos).toContain('1 punto');
    expect(puntos).not.toContain('1 pts');
  });

  test('1458: tras «Ver resultado» el foco va al título del resultado', async ({ page }) => {
    await abrirTest(page);
    await responder(page, NORMAL);
    await expect.poll(() => page.evaluate(() => {
      const activo = document.activeElement;
      return activo?.className.includes('resultadoTitulo') ? activo.textContent : `${activo?.tagName}`;
    })).toBe('Máster Universitario');
  });

  test('1457: contraste en claro, textos pequeños en color de marca ≥ 4,5:1', async ({ page }) => {
    // Medido antes de reparar: preguntaNumero 4,11 · «Siguiente →» 4,11 · resultadoBadge 3,65 ·
    // h3 de la guía 3,77.
    await abrirTest(page);
    await page.locator('[role="radio"]').first().click();
    await expect(page.getByRole('button', { name: /^Siguiente/ })).toBeEnabled();
    const medidas: Record<string, number> = {
      preguntaNumero: await contraste(page, '[class*="preguntaNumero"]'),
      siguiente: await contraste(page, '[class*="btnPrimary"]'),
    };
    await abrirTest(page);
    await responder(page, NORMAL);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    medidas.resultadoBadge = await contraste(page, '[class*="resultadoBadge"]');
    medidas.h3Guia = await contraste(page, '[class*="guideSection"] h3');
    for (const [clave, ratio] of Object.entries(medidas)) expect.soft(ratio, clave).toBeGreaterThanOrEqual(4.5);
  });

  test('1457: contraste en oscuro, textos pequeños en color de marca ≥ 4,5:1', async ({ page }) => {
    // El módulo ya no redeclara --primary en .container, que tapaba el #3FA5D1 oscuro de globals.
    // Medido antes de reparar: preguntaNumero 4,11 · «Siguiente →» 4,11 · resultadoBadge 3,13 ·
    // h3 de la guía 3,21.
    await abrirTest(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('[role="radio"]').first().click();
    await expect(page.getByRole('button', { name: /^Siguiente/ })).toBeEnabled();
    const medidas: Record<string, number> = {
      preguntaNumero: await contraste(page, '[class*="preguntaNumero"]'),
      siguiente: await contraste(page, '[class*="btnPrimary"]'),
    };
    for (const i of NORMAL) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(i).click();
      await page.getByRole('button', { name: /^Siguiente|^Ver resultado/ }).click();
    }
    await page.locator('[class*="resultadoTitulo"]').waitFor();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    medidas.resultadoBadge = await contraste(page, '[class*="resultadoBadge"]');
    medidas.h3Guia = await contraste(page, '[class*="guideSection"] h3');
    for (const [clave, ratio] of Object.entries(medidas)) expect.soft(ratio, clave).toBeGreaterThanOrEqual(4.5);
  });

  test('familia (forma e): el JSON-LD declara características reales', async ({ page }) => {
    await abrirTest(page);
    const web = (await leerJsonLd(page)).find((j) => j['@type'] === 'WebApplication');
    const features = web?.featureList ?? [];
    expect(features.length).toBeGreaterThanOrEqual(4);
    expect(features.length).toBeLessThanOrEqual(8);
  });
});

/**
 * RE-INSPECCIÓN 09/10/2026 (Inspector) — la app se invalidó por el refactor compartido de
 * relacionadas del 08/10 (99e1ee7e). Casos resueltos a mano con los pesos de motor.ts ANTES de
 * ejecutar la app, y las sospechas de la entrada de cabos sobre esta app:
 *
 *   · C0006 (desempate en superlativo encadenado, la forma del 1442 de mascota) — DESCARTADA.
 *     Ninguna opción de la pregunta 1 ni de la 5 da el mismo peso no nulo a dos vías, así que dos
 *     vías solo empatan en ellas a 0; quien no se separa por la motivación tiene 0 en ella igual que
 *     la recomendada, y entonces la recomendada no puede ganar a nadie por motivación (ídem con el
 *     objetivo). La cadena «y, a igualdad,» no se forma nunca: de 57.371 empates, 46.497 los deshace
 *     la motivación, 8.348 el objetivo y 2.526 el coste, y 0 encadenan dos criterios. El test de
 *     abajo lo fija: si un cambio de pesos lo hiciera posible, exige que el superlativo sea verdad
 *     frente a TODAS las empatadas.
 *   · C0104 (3) guía montada solo en el resultado — DESCARTADA: los 7 bloques están desde la carga.
 *   · C0104 (1) el título del resultado no queda bajo la barra (213-407 px frente a 52/77); sí queda
 *     fuera de la vista el enunciado de cada pregunta nueva (ver C0016 b).
 *   · Lo demás son hallazgos nuevos: test.fail() con «ABIERTO».
 */
test.describe('Re-inspección 09/10/2026 — casos a mano, sospechas de la familia y lo que el testigo no ve', () => {
  const textos = async (page: Page, sel: string): Promise<string[]> =>
    (await page.locator(sel).allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim());
  const sinEmoji = (s: string) => s.replace(/^\S+\s/, '');
  const textoGuia = (page: Page) =>
    page.locator('[class*="guideSection"]').evaluateAll((els) => els.map((e) => e.textContent ?? '').join(' ').replace(/\s+/g, ' '));
  const titulo = (page: Page) => page.locator('[class*="resultadoTitulo"]');
  const avisoRestricciones = (page: Page) => page.locator('[class*="avisoRestricciones"]');

  // Cambiar de sector · 1-2 años compaginando · Otro sector · 2.000-6.000 € · Habilidades prácticas
  // en mi sector · 1-3 años · PRESENCIAL · Sanidad, industria… · En 1-2 años · Titulación pública.
  const NORMAL_FP = [2, 1, 2, 1, 3, 1, 0, 3, 1, 1] as const;

  test('caso normal: FP de grado superior con 31 puntos, sin empate ni aviso', async ({ page }) => {
    // A mano (pesos de motor.ts):
    //   FP 3 (P2) + 2 (P3) + 3 (P4) + 4 (P5) + 2 (P6) + 3 (P7) + 5 (P8) + 4 (P9) + 5 (P10) = 31
    //   bootcamp 4 (P1) + 4 (P3) + 3 (P4) + 3 (P6) = 14 · certificación 2 + 2 + 3 + 2 = 9
    //   máster 3 (P2) + 3 (P7) + 3 (P9) = 9 · oposiciones 2 + 2 + 2 + 2 = 8.
    // Ningún límite: presupuesto hasta 6.000 €, «1-2 años» (24 meses) y «En 1-2 años» no apartan
    // nada (las oposiciones empiezan en 24) y no se pide título universitario. Máster y
    // certificación empatan a 9 FUERA de cabeza: la motivación da 2 a la certificación y 0 al
    // máster, así que la certificación va antes en la comparativa.
    await abrirTest(page);
    await responder(page, NORMAL_FP);
    await expect(titulo(page)).toHaveText('FP de Grado Superior');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(avisoRestricciones(page)).toHaveCount(0);
    expect(await textos(page, '[class*="alternativaPct"]')).toEqual(['31 puntos', '14 puntos', '9 puntos', '9 puntos', '8 puntos']);
    expect((await textos(page, '[class*="alternativaLabel"]')).map(sinEmoji)).toEqual(['FP Superior', 'Bootcamp', 'Certificación', 'Máster', 'Oposiciones']);
    // Las tres que más suman a la FP: 5 (sector), 5 (título) y 4 (objetivo, pregunta 5, antes que
    // la urgencia, pregunta 9, que también da 4).
    expect(await textos(page, '[class*="razones"] li')).toEqual([
      'Sector: has respondido «Sanidad, industria, comercio o sector técnico», que suma 5 puntos a la FP de grado superior.',
      'Título: has respondido «Prefiero titulación pública con valor en el mercado», que suma 5 puntos a la FP de grado superior.',
      'Objetivo profesional: has respondido «Adquirir habilidades prácticas reconocidas en mi sector», que suma 4 puntos a la FP de grado superior.',
    ]);
    await expect(page.locator('[class*="warningBox"]')).toContainText('Duración estimada: 1-2 años');
    await expect(page.locator('[class*="warningBox"]')).toContainText('Coste orientativo: 0 – 2.000 € (pública/privada)');
  });

  // Estabilidad · 1-2 años · Recién graduado · 2.000-6.000 € · Tecnología o startups · Sin
  // experiencia · Presencial · Empresa… · En 1-2 años · Habilidades más que el título.
  const EMPATE_COSTE = [0, 1, 0, 1, 2, 0, 0, 2, 1, 2] as const;

  test('límite: empate a 19 entre FP y máster que solo deshace el coste mínimo', async ({ page }) => {
    // A mano: máster 3 + 3 + 3 + 3 + 4 + 3 = 19 (P2, P3, P6, P7, P8, P9) · FP 3 + 3 + 3 + 3 + 3 + 4
    // = 19 (P2, P3, P4, P6, P7, P9) · certificación 1 + 2 + 3 + 3 + 4 = 13 · oposiciones
    // 4 + 2 + 2 + 2 + 2 = 12 · bootcamp 3 + 5 + 4 = 12. La motivación («estabilidad») y el objetivo
    // («tecnología») dan 0 a las dos empatadas: decide el coste mínimo, FP 0 € frente a máster
    // 820,80 €. Oposiciones y bootcamp empatan a 12 y la motivación da 4 a oposiciones.
    await abrirTest(page);
    await responder(page, EMPATE_COSTE);
    await expect(titulo(page)).toHaveText('FP de Grado Superior');
    await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
      'Empate: con tus respuestas, la FP de grado superior y el máster universitario encajan exactamente igual; se muestra primero la FP de grado superior porque su coste mínimo es el más bajo.',
    );
    expect(await textos(page, '[class*="alternativaPct"]')).toEqual(['19 puntos', '19 puntos', '13 puntos', '12 puntos', '12 puntos']);
    expect((await textos(page, '[class*="alternativaLabel"]')).map(sinEmoji)).toEqual(['FP Superior', 'Máster', 'Certificación', 'Oposiciones', 'Bootcamp']);
    expect((await textos(page, '[class*="razones"] li'))[0]).toBe('Urgencia: has respondido «En 1-2 años, puedo esperar», que suma 4 puntos a la FP de grado superior.');
  });

  // Cambiar de sector · 3-6 MESES · Otro sector · MENOS DE 2.000 € · Tecnología · Sin experiencia ·
  // Presencial · Tecnología · LO ANTES POSIBLE · NECESITO UN TÍTULO UNIVERSITARIO.
  const LIMITE_TODO = [2, 0, 2, 0, 2, 0, 0, 0, 0, 0] as const;

  test('límite: ninguna vía cumple todo; bootcamp y certificación incumplen uno solo y gana el de más afinidad', async ({ page }) => {
    // A mano: bootcamp 4 + 4 + 4 + 5 + 5 + 4 = 26 · certificación 2 + 2 + 4 + 3 + 3 + 4 = 18 · máster
    // 3 + 3 + 5 = 11 · FP 2 + 2 + 3 + 3 = 10 · oposiciones 3 + 2 + 2 = 7. Límites: 3-6 meses y «lo
    // antes posible» apartan máster, FP y oposiciones (12, 12 y 24 meses); el título aparta todo
    // menos el máster. Incumplen: máster 2, FP 3, bootcamp 1, oposiciones 3, certificación 1 →
    // bootcamp y certificación, y el bootcamp por afinidad (26 frente a 18).
    // Reescrito el 10/10/2026 (hallazgo 3104, opción A): hasta entonces «Menos de 2.000 €» apartaba
    // el bootcamp (2 límites) y ganaba la certificación SOLA. Ahora no se aparta: se avisa.
    await abrirTest(page);
    await responder(page, LIMITE_TODO);
    await expect(titulo(page)).toHaveText('Bootcamp / Formación Online Intensiva');
    await expect(avisoRestricciones(page)).toContainText(
      'Ninguna vía cumple a la vez todo lo que has declarado. El bootcamp y la certificación profesional son las que menos chocan con tus límites; se recomienda el bootcamp, que es la de más afinidad entre ellas, pero no da un título universitario oficial, y has respondido que lo necesitas.',
    );
    await expect(page.locator('[data-aviso="presupuesto"]')).toContainText('Tu presupuesto es de menos de 2.000 €');
    expect(await textos(page, '[class*="alternativaPct"]')).toEqual(['26 puntos', '18 puntos', '11 puntos', '10 puntos', '7 puntos']);
    expect(await page.locator('[class*="alternativaItem"]').evaluateAll((els) => els.map((e) => (e.querySelector('[class*="alternativaIncumple"]')?.textContent ?? '').trim()))).toEqual([
      'sin título universitario oficial',
      'sin título universitario oficial',
      'más larga que tu tiempo disponible · más larga que tu urgencia',
      'más larga que tu tiempo disponible · más larga que tu urgencia · sin título universitario oficial',
      'más larga que tu tiempo disponible · más larga que tu urgencia · sin título universitario oficial',
    ]);
  });

  test('rechazo: sin contestar la 10, «Ver resultado» no hace nada (ni clic forzado ni Enter)', async ({ page }) => {
    await abrirTest(page);
    const boton = page.getByRole('button', { name: /^Siguiente|^Ver resultado/ });
    for (let k = 0; k < 9; k++) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(1).click();
      await boton.click();
    }
    await expect(page.locator('[class*="progresoTexto"]')).toHaveText('10 / 10');
    await expect(boton).toHaveText(/Ver resultado/);
    await expect(boton).toBeDisabled();
    await boton.click({ force: true });
    await boton.evaluate((b) => (b as HTMLButtonElement).focus());
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await expect(titulo(page)).toHaveCount(0);
    await expect(page.locator('[class*="progresoTexto"]')).toHaveText('10 / 10');
  });

  test('C0006 descartada: ningún empate encadena dos criterios, y si los encadenara el superlativo sería verdad', () => {
    test.setTimeout(180_000);
    // La razón, comprobable sin enumerar: en las preguntas 1 y 5 ninguna opción da el MISMO peso
    // no nulo a dos vías.
    for (const id of [1, 5]) {
      for (const o of PREGUNTAS[id - 1].opciones) {
        const positivos = Object.values(o.pesos).filter((v) => (v ?? 0) > 0);
        expect(new Set(positivos).size, `pregunta ${id}, «${o.texto}»`).toBe(positivos.length);
      }
    }
    const r: Record<number, number> = {};
    const peso = (id: number, k: TipoFormacion) => PREGUNTAS[id - 1].opciones[r[id]].pesos[k] ?? 0;
    let empates = 0;
    let encadenados = 0;
    const falsos: string[] = [];
    const recorrer = (i: number): void => {
      if (i === PREGUNTAS.length) {
        const res = calcularResultado(r);
        if (res.empatadas.length === 0) return;
        empates++;
        const decisivo = (k: TipoFormacion) => (peso(1, res.tipo) !== peso(1, k) ? 0 : peso(5, res.tipo) !== peso(5, k) ? 1 : 2);
        const usados = [...new Set(res.empatadas.map(decisivo))];
        if (usados.length > 1) {
          encadenados++;
          // Leído contra TODAS las empatadas (hallazgo 1442 de mascota, 2678 de calefacción).
          if (usados.includes(2) && res.empatadas.some((k) => COSTE_MINIMO[k] < COSTE_MINIMO[res.tipo]) && falsos.length < 5) falsos.push(JSON.stringify(r));
          if (usados.includes(1) && res.empatadas.some((k) => peso(5, k) > peso(5, res.tipo)) && falsos.length < 5) falsos.push(JSON.stringify(r));
        }
        return;
      }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
        r[PREGUNTAS[i].id] = k;
        recorrer(i + 1);
      }
    };
    recorrer(0);
    // 57.371 hasta el 3104; desde el 10/10/2026 el bootcamp vuelve a competir con «Menos de 2.000 €».
    expect(empates).toBe(62_110);
    expect(encadenados).toBe(0);
    expect(falsos).toEqual([]);
  });

  test('C0104 (3) descartada: la guía está montada desde la carga, no solo en el resultado', async ({ page }) => {
    await abrirTest(page);
    await expect(page.locator('[role="radiogroup"]')).toHaveCount(1);
    await expect(page.locator('[class*="guideSection"]')).toHaveCount(7);
    // El botón que la despliega se anuncia como «Ver guía educativa» (aria-label de EducationalSection).
    await expect(page.getByRole('button', { name: 'Ver guía educativa' })).toHaveCount(1);
  });

  // REPARADO el 09/10/2026 (hallazgo 3099): tabindex itinerante y teclaEnOpcion, como smartphone.
  test('3099 teclado de radios (APG): las flechas mueven y marcan, y el grupo es una sola parada de Tab', async ({ page }) => {
    // La referencia de la familia (selector-smartphone, hallazgo 1681): tabindex 0 / -1 / -1 / -1 y
    // ArrowDown lleva el foco al radio siguiente y lo marca. Aquí, medido: los cuatro radios sin
    // tabindex (cuatro paradas de Tab) y ArrowDown deja el foco en el primero sin marcar nada.
    await abrirTest(page);
    const radios = page.locator('[role="radiogroup"] [role="radio"]');
    await radios.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(radios.nth(1)).toBeFocused();
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).not.toBe('radio');
  });

  // REPARADO el 09/10/2026 (hallazgo 3100): un efecto sobre [paso, preguntaActual] lleva el foco al enunciado.
  test('3100 tras «Siguiente» el foco va al enunciado de la pregunta nueva, no a <body>', async ({ page }) => {
    // Medido: el botón «Siguiente» se desactiva con el foco dentro (la pregunta 2 está sin
    // contestar) y el foco cae a <body>; el siguiente Tab sale a «Ver Guía Completa», DESPUÉS del
    // cuestionario. La referencia lo lleva al enunciado (smartphone, hallazgo 1680).
    await abrirTest(page);
    await page.locator('[role="radiogroup"] [role="radio"]').nth(1).click();
    await page.getByRole('button', { name: /^Siguiente/ }).click();
    await expect(page.locator('[class*="progresoTexto"]')).toHaveText('2 / 10');
    await expect
      .poll(() => page.evaluate(() => (document.activeElement === document.body ? 'BODY' : (document.activeElement?.textContent ?? '').trim())))
      .toBe('¿Cuánto tiempo puedes dedicar a la formación?');
  });

  // Cambiar de sector · 3-6 meses · Otro sector · 6.000-15.000 € · Tecnología · 1-3 años ·
  // PRESENCIAL · Tecnología · Lo antes posible · Habilidades más que el título.
  const PRESENCIAL_BOOT = [2, 0, 2, 2, 2, 1, 0, 0, 0, 2] as const;

  // REPARADO el 09/10/2026 (hallazgo 3102): `avisoModalidad` dice que la preferencia presencial no se cumple.
  test('3102 a quien prefiere formación presencial, una vía «online» no se le recomienda en silencio', async ({ page }) => {
    // A mano: bootcamp 4 + 4 + 4 + 3 + 5 + 3 + 5 + 4 + 4 = 36 · certificación 2 + 2 + 3 + 3 + 4 + 4
    // = 18 · FP 2 + 2 + 3 = 7 · máster 3 + 3 = 6 · oposiciones 2 + 2 = 4. Ningún límite aparta el
    // bootcamp: gana «Bootcamp / Formación Online Intensiva» a quien ha marcado «Presencial, con
    // contacto directo con docentes y compañeros», y nada en el resultado lo dice (la modalidad no
    // suma al bootcamp, así que tampoco sale en las razones). Enumerado: de 262.144 perfiles con
    // «Presencial», 40.903 reciben el bootcamp y 111.513 la certificación («Formato flexible y
    // online» como ventaja clave). La hermana selector-mascota dice las respuestas que juegan EN
    // CONTRA de la ganadora (`tensiones`, hallazgo 1443).
    await abrirTest(page);
    await responder(page, PRESENCIAL_BOOT);
    const tarjeta = (await page.locator('section[class*="resultado"]').innerText()).replace(/\s+/g, ' ');
    const recomiendaOnline = /online/i.test(`${await titulo(page).innerText()} ${(await textos(page, '[class*="resultadoPuntos"] [role="listitem"]')).join(' ')}`);
    expect(recomiendaOnline && !/presencial/i.test(tarjeta), 'vía online a quien prefiere presencial, sin decirlo').toBe(false);
    await expect(page.locator('[data-aviso="modalidad"]')).toHaveText(
      '🏫 Has respondido que prefieres «presencial, con contacto directo con docentes y compañeros», y el bootcamp se presenta aquí como formación online: esa preferencia no se cumple. Si eliges esta vía, comprueba antes de matricularte si hay un formato presencial.',
    );
  });

  // Especializarme · 1-2 años · DESEMPLEADO · Más de 15.000 € o beca · Título oficial · Más de 7
  // años · Híbrido · Empresa… · Sin urgencia · Certificado internacional.
  const MASTER_SIN_PREGUNTAR_GRADO = [1, 1, 3, 3, 1, 3, 2, 2, 3, 3] as const;

  // REPARADO el 09/10/2026 (hallazgo 3103): `requisitoAcceso` del máster, RD 822/2021, art. 18 (BOE, 09/10/2026).
  test('3103 si recomienda el máster, dice que su acceso pide un título universitario de grado', async ({ page }) => {
    // A mano: máster 4 + 3 + 4 + 4 + 2 + 3 + 4 + 4 + 2 = 30 · FP 1 + 3 + 3 + 2 + 2 + 2 = 13 ·
    // certificación 5 + 3 + 5 = 13 · bootcamp 3 + 2 = 5 · oposiciones 2 + 2 = 4; ningún límite.
    // Ninguna de las 10 preguntas pregunta si se tiene un grado, y la guía se dirige también a quien
    // solo ha «acumulado experiencia laboral»; la propia guía da el requisito por supuesto («la
    // opción más adecuada si tienes un grado universitario»; acceso con título extranjero, RD
    // 822/2021, art. 18.2), pero la tarjeta del resultado no lo dice. Enumerado: el máster sale en
    // 267.630 de 1.048.576 perfiles, 58.760 de ellos con «Llevo tiempo desempleado/a».
    await abrirTest(page);
    await responder(page, MASTER_SIN_PREGUNTAR_GRADO);
    await expect(titulo(page)).toHaveText('Máster Universitario');
    const tarjeta = (await page.locator('section[class*="resultado"]').innerText()).replace(/\s+/g, ' ');
    expect(tarjeta).toMatch(/\bgrado universitario|título (universitario )?de grado|un grado\b/i);
  });

  // Cambiar de sector · 3-6 meses · DESEMPLEADO · MENOS DE 2.000 € · Tecnología · 1-3 años · Online
  // · Tecnología · Lo antes posible · Habilidades más que el título.
  const DESEMPLEADO_SEPE = [2, 0, 3, 0, 2, 1, 1, 0, 0, 2] as const;

  // REPARADO el 10/10/2026 (hallazgo 3104, opción A decidida por el usuario): el bootcamp es
  // `subvencionable` y el presupuesto no lo aparta; `avisoPresupuesto` dice que busque uno
  // subvencionado. Con «Menos de 2.000 €» hoy sale el bootcamp en 18.211 perfiles, todos con el aviso.
  test('3104 el bootcamp no se aparta por un coste mínimo de 2.000 € que la propia guía contradice', async ({ page }) => {
    // A mano: bootcamp 4 + 4 + 3 + 5 + 3 + 3 + 5 + 4 + 4 = 35 · certificación 2 + 2 + 4 + 3 + 4 + 3 +
    // 4 + 4 = 26 · FP 3 + 2 + 2 = 7 · oposiciones 2 + 3 + 2 = 7 · máster 0. Con menos de 2.000 € se
    // aparta el bootcamp «porque su coste orientativo empieza en 2.000 €» (horquilla sin fuente),
    // y gana la certificación; la guía de la misma página dice que «algunos están subvencionados por
    // el SEPE o tienen financiación ISA». Enumerado: en 15.314 perfiles el bootcamp sería la
    // recomendación de no ser por ese mínimo.
    await abrirTest(page);
    await responder(page, DESEMPLEADO_SEPE);
    const aviso = await avisoRestricciones(page).allInnerTexts();
    const guia = await textoGuia(page);
    const aparta = aviso.some((a) => a.includes('coste orientativo empieza en 2.000 €'));
    expect(aparta && /subvencionados por el SEPE/.test(guia), 'aparta por 2.000 € lo que la guía dice que puede ser subvencionado').toBe(false);
    await expect(titulo(page)).toHaveText('Bootcamp / Formación Online Intensiva');
    await expect(page.locator('[data-aviso="presupuesto"]')).toContainText('algunos están subvencionados (por ejemplo, por el SEPE) o tienen financiación');
  });

  test('3104 motor: con «Menos de 2.000 €», ningún bootcamp sale sin el aviso, y ninguna otra vía lo lleva', () => {
    test.setTimeout(180_000);
    const r: Record<number, number> = {};
    let bootcamp = 0;
    let sinAviso = 0;
    let avisoAjeno = 0;
    const recorrer = (i: number): void => {
      if (i === PREGUNTAS.length) {
        const res = calcularResultado(r);
        const conPoco = r[4] === 0 && res.tipo === 'bootcamp';
        if (conPoco) bootcamp++;
        if (conPoco && !res.avisoPresupuesto) sinAviso++;
        if (!conPoco && res.avisoPresupuesto) avisoAjeno++;
        if (res.incumple.bootcamp.includes('presupuesto')) avisoAjeno++;
        return;
      }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
        r[PREGUNTAS[i].id] = k;
        recorrer(i + 1);
      }
    };
    recorrer(0);
    expect(bootcamp).toBe(18_211);
    expect(sinAviso).toBe(0);
    expect(avisoAjeno).toBe(0);
  });

  // Cambiar de sector · 3-6 meses · Otro sector · 2.000-6.000 € · Tecnología · 1-3 años · Online ·
  // Tecnología · Lo antes posible · NECESITO UN TÍTULO UNIVERSITARIO (el perfil del test de 1447).
  const MENOS_CHOCA = [2, 0, 2, 1, 2, 1, 1, 0, 0, 0] as const;

  // REPARADO el 09/10/2026 (hallazgo 3105): con varias candidatas igual de lejos, se nombran todas y
  // se dice que la recomendada es la de más afinidad entre ellas.
  test('3105 «es la que menos choca con tus límites» no se dice de una vía si otra choca exactamente igual', async ({ page }) => {
    // A mano: bootcamp 35 · certificación 2 + 2 + 2 + 3 + 4 + 3 + 4 = 20 · FP 2 + 3 + 2 = 7 · máster
    // 5 · oposiciones 2. Incumplen: bootcamp 1 (título) y certificación 1 (título); máster 2,
    // oposiciones 3, FP 3. Las dos candidatas chocan igual y la elegida lo es por afinidad, pero el
    // aviso afirma que el bootcamp es «la que menos choca». Enumerado: de 163.840 perfiles con ese
    // aviso, en 155.648 otra candidata incumple los mismos límites (la forma del superlativo del
    // 1442, aquí en el aviso de restricciones).
    await abrirTest(page);
    await responder(page, MENOS_CHOCA);
    await expect(titulo(page)).toHaveText('Bootcamp / Formación Online Intensiva');
    const notas = await page.locator('[class*="alternativaItem"]').evaluateAll((els) => els.map((e) => (e.querySelector('[class*="alternativaIncumple"]')?.textContent ?? '').trim()));
    expect(notas.slice(0, 2)).toEqual(['sin título universitario oficial', 'sin título universitario oficial']);
    await expect(avisoRestricciones(page)).not.toContainText('El bootcamp es la que menos choca con tus límites');
    await expect(avisoRestricciones(page)).toContainText(
      'El bootcamp y la certificación profesional son las que menos chocan con tus límites; se recomienda el bootcamp, que es la de más afinidad entre ellas, pero no da un título universitario oficial, y has respondido que lo necesitas.',
    );
  });

  test('3105 motor: en las 1.048.576 combinaciones, el superlativo solo se dice de una candidata SOLA', () => {
    test.setTimeout(180_000);
    const r: Record<number, number> = {};
    let superlativoFalso = 0;
    let conAviso = 0;
    const recorrer = (i: number): void => {
      if (i === PREGUNTAS.length) {
        const res = calcularResultado(r);
        if (!res.avisoRestricciones.startsWith('Ninguna vía cumple')) return;
        conAviso++;
        const sola = res.candidatas.length === 1;
        if (/es la que menos choca/.test(res.avisoRestricciones) !== sola) superlativoFalso++;
        return;
      }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
        r[PREGUNTAS[i].id] = k;
        recorrer(i + 1);
      }
    };
    recorrer(0);
    expect(conAviso).toBe(163_840);
    expect(superlativoFalso).toBe(0);
  });

  // REPARADO el 09/10/2026 (hallazgo 3106).
  test('3106 el «%» va separado con espacio duro (U+00A0), en la guía y en el FAQPage', async ({ page }) => {
    // Regla del 25/09/2026 (CLAUDE.md global §2): el código nuevo la cumple y lo anterior se corrige
    // cuando pasa el Inspector. Medido: «51,1 %», «65 %», «75 %» y «100 %» en la guía, y «86,1 %» y
    // «87,3 %» en el FAQPage, los seis con espacio normal (U+0020), que deja saltar el «%» solo.
    // Al repararlo, las cadenas literales de los tests 1451 y 1453 (de arriba) cambian con él.
    await abrirTest(page);
    // Sin `textoGuia`, que normaliza con /\s+/ y convierte el U+00A0 en espacio: así no medía nada.
    const guia = await page.locator('[class*="guideSection"]').evaluateAll((els) => els.map((e) => e.textContent ?? '').join(' ').replace(/[ \t\r\n]+/g, ' '));
    const faq = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    const conEspacioNormal = [...`${guia} ${faq}`.matchAll(/\d+(,\d+)? %/g)].map((m) => m[0]);
    expect(conEspacioNormal).toEqual([]);
    expect([...`${guia} ${faq}`.matchAll(/\d\u00A0%/g)].length).toBe(6);
  });

  test.describe('móvil 360 × 740', () => {
    test.use({
      viewport: { width: 360, height: 740 },
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    const fondoBarra = (page: Page) =>
      page.evaluate(() => Math.max(...[...document.querySelectorAll('[class*="headerBar"] > *')].map((e) => e.getBoundingClientRect().bottom)));

    test('C0104 (1): tras «Ver resultado» el título del resultado no queda bajo la barra del logo', async ({ page }) => {
      // Medido el 09/10: título a 213-407 px y barra hasta 52 px (77 en escritorio), con el botón
      // tocado al pie, en el centro o arriba de la pantalla.
      await abrirTest(page);
      for (let k = 0; k < 10; k++) {
        await page.waitForTimeout(500); // lee antes de contestar: un toque a <300 ms del de «Siguiente» es el doble toque que se ignora (3101)
        await page.locator('[role="radiogroup"] [role="radio"]').nth(3).tap();
        const boton = page.getByRole('button', { name: /^Siguiente|^Ver resultado/ });
        await boton.evaluate((b) => b.scrollIntoView({ block: 'end' }));
        await boton.tap();
      }
      await titulo(page).waitFor();
      const caja = await titulo(page).boundingBox();
      expect(caja?.y ?? -1).toBeGreaterThanOrEqual(await fondoBarra(page));
    });

    // REPARADO el 09/10/2026 (hallazgo 3100): el foco al enunciado lo trae a la vista, con scroll-margin-top de 80 px.
    test('3100 tras «Siguiente» el enunciado de la pregunta nueva se ve, debajo de la barra', async ({ page }) => {
      // Medido: con «Siguiente» en el centro de la pantalla, el enunciado de la pregunta 2 queda a
      // −197 px (fuera de la vista, por encima); nada desplaza la página ni lleva el foco a él.
      await abrirTest(page);
      await page.locator('[role="radiogroup"] [role="radio"]').nth(3).tap();
      const boton = page.getByRole('button', { name: /^Siguiente/ });
      await boton.evaluate((b) => b.scrollIntoView({ block: 'center' }));
      await boton.tap();
      await expect(page.locator('[class*="progresoTexto"]')).toHaveText('2 / 10');
      await page.waitForTimeout(300);
      const caja = await page.locator('[class*="preguntaTexto"]').boundingBox();
      expect(caja?.y ?? -1).toBeGreaterThanOrEqual(await fondoBarra(page));
    });

    // REPARADO el 09/10/2026 (hallazgo 3101): receta clicDeMas de la familia.
    test('3101 un doble toque en «Siguiente» avanza UNA pregunta, sin contestar la siguiente ni volver atrás', async ({ page }) => {
      test.setTimeout(120_000);
      // Doble clic REAL (mouse.dblclick: detail 1 y 2 en el mismo punto) en el centro de
      // «Siguiente», con la opción más baja marcada. Medido: en la 3 y en la 5 el segundo toque cae
      // en «Anterior» (la botonera de la pregunta nueva queda más arriba) y deshace el avance; en la
      // 4 marca en la 5 «Adquirir habilidades prácticas reconocidas en mi sector» (+4 FP, +3
      // certificación) sin que nadie la elija. La referencia descarta el clic de más (smartphone,
      // hallazgo 2659: `detail > 1` tras un cambio de pantalla).
      const anomalias: string[] = [];
      for (let q = 0; q < 10; q++) {
        await abrirTest(page);
        for (let k = 0; k < q; k++) {
          await page.waitForTimeout(500); // lee antes de contestar: un toque a <300 ms del de «Siguiente» es el doble toque que se ignora (3101)
          await page.locator('[role="radiogroup"] [role="radio"]').nth(3).tap();
          await page.getByRole('button', { name: /^Siguiente/ }).tap();
        }
        await page.waitForTimeout(500); // lee antes de contestar: un toque a <300 ms del de «Siguiente» es el doble toque que se ignora (3101)
        await page.locator('[role="radiogroup"] [role="radio"]').nth(3).tap();
        const boton = page.getByRole('button', { name: /^Siguiente|^Ver resultado/ });
        await boton.evaluate((b) => b.scrollIntoView({ block: 'center' }));
        const caja = await boton.boundingBox();
        if (!caja) throw new Error(`pregunta ${q + 1}: sin botón`);
        await page.mouse.dblclick(caja.x + caja.width / 2, caja.y + caja.height / 2);
        await page.waitForTimeout(400);
        if (q < 9) {
          const pregunta = await page.locator('[class*="progresoTexto"]').innerText();
          const marcadas = await page.locator('[role="radiogroup"] [aria-checked="true"]').count();
          if (pregunta !== `${q + 2} / 10` || marcadas !== 0) anomalias.push(`pregunta ${q + 1}: queda en ${pregunta} con ${marcadas} marcada(s)`);
        } else if ((await titulo(page).count()) !== 1 || !page.url().endsWith('/selector-formacion-postgrado/')) {
          anomalias.push(`pregunta 10: ${page.url()}`);
        }
      }
      expect(anomalias).toEqual([]);
    });
  });
});
