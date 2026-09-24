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
// Límites: solo el presupuesto aparta el bootcamp (desde 2.000 €). Empate a 20 entre dos vías que
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
  // compiten menos y empatan menos (recuento del motor el 24/09/2026).
  expect(empates).toBe(57_371);
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
        if (r[4] === 0 && COSTE_MINIMO[res.tipo] >= 2000 && !/presupuesto/.test(avisa)) c.presupuestoSinAviso++;
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

  test('1445: con «Menos de 2.000 €» el bootcamp se aparta y se dice; el máster cabe en universidad pública', async ({ page }) => {
    // Cambiar de sector · 3-6 meses · Otro sector · MENOS DE 2.000 € · Tecnología · 1-3 años ·
    // Online · Tecnología · Lo antes posible · Habilidades → bootcamp 36 (desde 2.000 €) ·
    // certificación 26 (desde 200 €), que cumple todos los límites.
    await abrirTest(page);
    await responder(page, [2, 0, 2, 0, 2, 1, 1, 0, 0, 2]);
    expect(await tituloResultado(page)).toBe('Certificación Profesional');
    await expect(aviso(page)).toContainText(
      'Por afinidad encajaría más el bootcamp (36 puntos), pero su coste orientativo empieza en 2.000 €, y tu presupuesto es de menos de 2.000 €.',
    );
    expect(await minimoPublicado(page)).toBeLessThan(2000);
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
      'Ninguna vía cumple a la vez todo lo que has declarado. El máster universitario es la que menos choca con tus límites, pero dura 1-2 años, más de lo que puedes dedicar («3-6 meses a tiempo completo»).',
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
      'Ninguna vía cumple a la vez todo lo que has declarado. El bootcamp es la que menos choca con tus límites, pero no da un título universitario oficial, y has respondido que lo necesitas.',
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
    expect(faqMaster).toContain('la tasa de empleo en 2019 de los graduados universitarios del curso 2013-2014 era del 86,1 %, y la de los titulados de máster, del 87,3 %');
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
