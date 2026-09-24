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
 * EL MOTOR (app/selector-formacion-postgrado/motor.ts): las mismas preguntas y pesos
 * (comprobado sobre todas las combinaciones: sin empate, el ganador no cambia). A igualdad,
 * primero la motivación (pregunta 1), luego el objetivo profesional (5) y por último el menor
 * coste mínimo; el empate se anuncia. Las razones citan las respuestas que más han sumado.
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

// Estabilidad laboral · 3-6 meses · Recién graduado · Menos de 2.000 € · Administración Pública ·
// Sin experiencia · Presencial · Empresa, finanzas… · Lo antes posible · Título universitario.
// (máster, FP, bootcamp, oposiciones, certificación), pregunta a pregunta:
//   P1 op 4, cert 1 · P2 boot 4, cert 2 · P3 máster 3, FP 3, op 2 · P4 op 3, cert 4, FP 2 ·
//   P5 op 5, cert 1 · P6 máster 3, FP 3, op 2 · P7 máster 3, FP 3, op 2 · P8 máster 4, cert 3 ·
//   P9 boot 4, cert 4 · P10 máster 5
//   = máster 18 · FP 11 · bootcamp 8 · oposiciones 18 · certificación 15.
// Empate a 18; la motivación («estabilidad laboral») da 4 a oposiciones y 0 al máster.
// Antes: máster, por ser la primera clave.
const EMPATE = [0, 0, 0, 0, 0, 0, 0, 2, 0, 0] as const;

// Igual, pero sector «Tecnología…» y «Me interesan más las habilidades que el título»:
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
  // La comparativa sigue el mismo orden: oposiciones antes que máster, aunque empaten a 18.
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
      const max = Math.max(...CLAVES.map((k) => res.puntos[k]));
      if (res.puntos[res.tipo] !== max || res.orden[0] !== res.tipo) mal('no encabeza con la puntuación máxima');
      const reales = CLAVES.filter((k) => k !== res.tipo && res.puntos[k] === max);
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
  expect(empates).toBe(88_071);
});

/**
 * INSPECCIÓN 24/09/2026 (Inspector, primera inspección de la app).
 *
 * Barrido con el motor real sobre las 1.048.576 combinaciones (2,6 s). Las respuestas que declaran
 * un LÍMITE suman puntos pero no acotan nada:
 *   · «Menos de 2.000 €» → máster (ficha desde 3.000 €) o bootcamp (desde 2.000 €):
 *     52.194 de 262.144 perfiles (máster 37.741 · bootcamp 14.453).
 *   · «3-6 meses a tiempo completo» (100.335 de 262.144) o «Unas semanas o meses de aprendizaje
 *     flexible» (89.219 de 262.144) → máster o FP (1-2 años) u oposiciones (2-5 años).
 *   · «Necesito un título universitario oficial reconocido» → una vía que no lo da:
 *     120.554 de 262.144 (certificación 56.495 · bootcamp 30.474 · oposiciones 21.816 · FP 11.769).
 * La referencia (selector-smartphone 943, selector-mascota 1332/1333) FILTRA lo declarado o AVISA
 * del desfase en pantalla: los tests de navegador aceptan cualquiera de las dos reparaciones.
 *
 * Las respuestas van por índice de opción (0-3) en el orden de las preguntas 1 a 10.
 */
test.describe('Inspección 24/09/2026 — restricciones declaradas, datos de la guía y accesibilidad', () => {
  interface PreguntaFaq { name: string; acceptedAnswer: { text: string } }
  interface BloqueJsonLd { '@type'?: string; mainEntity?: PreguntaFaq[] }

  const tituloResultado = (page: Page) => page.locator('[class*="resultadoTitulo"]').innerText();

  /** El mínimo de «Coste orientativo: 2.000 – 12.000 €.», en euros. */
  const minimoPublicado = async (page: Page): Promise<number> => {
    const nota = await page.locator('[class*="warningBox"]').innerText();
    const m = nota.match(/Coste orientativo:\s*([\d.,]+)/);
    return m ? parseSpanishNumber(m[1]) : Number.NaN;
  };

  /** El bloque educativo entero (se monta siempre; plegado solo se oculta por CSS). */
  const textoGuia = (page: Page) =>
    page.locator('[class*="guideSection"]').evaluateAll((els) => els.map((e) => e.textContent ?? '').join(' '));

  const leerFaq = async (page: Page): Promise<{ p: string; r: string }[]> => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b) as BloqueJsonLd).find((j) => j['@type'] === 'FAQPage');
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

  // Especializarme académicamente · 1-2 años compaginando · Trabajo en mi sector · 6.000-15.000 € ·
  // Especializarme con título oficial · 3-7 años · Híbrido · Empresa, finanzas… · Sin urgencia ·
  // Necesito un título universitario oficial.
  const NORMAL = [1, 1, 1, 2, 1, 2, 2, 2, 3, 0] as const;

  test('caso normal: especialización con título oficial → máster 35, sin empate, comparativa en su orden', async ({ page }) => {
    // A mano (pesos de motor.ts): máster 4+3+3+3+4+2+3+4+4+5 = 35 · certificación 4+4+3 = 11 ·
    // FP 1+3+2+2+2 = 10 · bootcamp 3+2+2 = 7 · oposiciones 2.
    await abrirTest(page);
    const texto = await responder(page, NORMAL);
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Máster Universitario');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    expect(await page.locator('[class*="alternativaPct"]').allInnerTexts()).toEqual(['35 pts', '11 pts', '10 pts', '7 pts', '2 pts']);
    const etiquetas = (await page.locator('[class*="alternativaLabel"]').allInnerTexts()).map((e) => e.replace(/^\S+\s/, ''));
    expect(etiquetas).toEqual(['Máster', 'Certificación', 'FP Superior', 'Bootcamp', 'Oposiciones']);
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

  test('cada barra de la comparativa, si anuncia un valor, anuncia la misma fracción que pinta', async ({ page }) => {
    // Lo anunciado coincide con lo pintado: pts / puntuación de la recomendada (35 en el caso
    // normal). Lo que está mal es el rol, no la fracción (ver el test.fail de más abajo).
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

  test('presupuesto «Menos de 2.000 €»: la vía recomendada cabe en él, o la pantalla avisa', async ({ page }) => {
    // HALLAZGO abierto: el presupuesto es un peso y no un filtro (52.194 de 262.144 perfiles con
    // «Menos de 2.000 €» acaban en máster o bootcamp, y la pantalla no dice nada del presupuesto).
    test.fail();
    // Cambiar de sector · 3-6 meses · Otro sector · MENOS DE 2.000 € · Tecnología · 1-3 años ·
    // Online · Tecnología · Lo antes posible · Habilidades → bootcamp 36 («2.000 – 12.000 €») ·
    // certificación 26 (desde 200 €), que es lo que quedaría filtrando.
    await abrirTest(page);
    let texto = await responder(page, [2, 0, 2, 0, 2, 1, 1, 0, 0, 2]);
    expect.soft((await minimoPublicado(page)) < 2000 || /presupuesto/i.test(texto), `bootcamp → ${await tituloResultado(page)}`).toBe(true);
    // Especializarme · 1-2 años · Recién graduado · MENOS DE 2.000 € · título oficial · Sin experiencia ·
    // Presencial · Empresa · Sin urgencia · Necesito título → máster 33 («3.000 – 30.000 €») · FP 19.
    await abrirTest(page);
    texto = await responder(page, [1, 1, 0, 0, 1, 0, 0, 2, 3, 0]);
    expect.soft((await minimoPublicado(page)) < 2000 || /presupuesto/i.test(texto), `máster → ${await tituloResultado(page)}`).toBe(true);
  });

  test('tiempo «3-6 meses» o «Unas semanas o meses»: la duración recomendada cabe, o la pantalla avisa', async ({ page }) => {
    // HALLAZGO abierto: el tiempo disponible es un peso y no un filtro (189.554 de 524.288 perfiles
    // con esas dos respuestas acaban en una vía de 1 año o más, sin aviso).
    test.fail();
    const larga = /Duración estimada: (1-2 años|2-5 años)/;
    // Especializarme · 3-6 MESES A TIEMPO COMPLETO · Recién graduado · >15.000 € o beca · título oficial ·
    // Sin experiencia · Presencial · Empresa · Sin urgencia · Necesito título → máster 34 · FP 14.
    await abrirTest(page);
    let texto = await responder(page, [1, 0, 0, 3, 1, 0, 0, 2, 3, 0]);
    expect.soft(!larga.test(texto) || /3-6 meses|tiempo disponible/i.test(texto), `3-6 meses → ${await tituloResultado(page)}`).toBe(true);
    // Estabilidad · UNAS SEMANAS O MESES · Desempleado · <2.000 € · Administración Pública · 1-3 años ·
    // Autónomo · Administración · LO ANTES POSIBLE, EN MESES · Titulación pública → oposiciones 27
    // («2-5 años de preparación») · certificación 17.
    await abrirTest(page);
    texto = await responder(page, [0, 3, 3, 0, 0, 1, 3, 1, 0, 1]);
    expect.soft(!larga.test(texto) || /semanas o meses|tiempo disponible/i.test(texto), `semanas → ${await tituloResultado(page)}`).toBe(true);
  });

  test('«Necesito un título universitario oficial»: sale el máster, o la pantalla avisa de que la vía no lo da', async ({ page }) => {
    // HALLAZGO abierto: 120.554 de 262.144 perfiles con esa respuesta acaban en una vía que no da
    // título universitario, y la tabla de la guía lo reconoce («Certificado propio» para el bootcamp).
    test.fail();
    // Cambiar de sector · 3-6 meses · Otro sector · 2.000-6.000 € · Tecnología · 1-3 años · Online ·
    // Tecnología · Lo antes posible · NECESITO TÍTULO UNIVERSITARIO → bootcamp 35 · máster 5.
    await abrirTest(page);
    const texto = await responder(page, [2, 0, 2, 1, 2, 1, 1, 0, 0, 0]);
    const titulo = await tituloResultado(page);
    expect(titulo === 'Máster Universitario' || /título universitario/i.test(texto), `obtenido: ${titulo}`).toBe(true);
  });

  test('motor: ningún perfil queda fuera de su presupuesto, de su tiempo o de su título declarado', () => {
    // HALLAZGO abierto (los tres de arriba, contados). Hoy: 52.194 · 189.554 · 120.554.
    // Si la reparación elige AVISAR en vez de filtrar, estos recuentos no bajan: cámbialos por los
    // perfiles que se quedan sin aviso.
    test.fail();
    test.setTimeout(120_000);
    const r: Record<number, number> = {};
    const cuenta = { presupuesto: 0, tiempo: 0, titulo: 0 };
    const largas: TipoFormacion[] = ['master', 'fp_superior', 'oposiciones'];
    const recorrer = (i: number): void => {
      if (i === PREGUNTAS.length) {
        const { tipo } = calcularResultado(r);
        if (r[4] === 0 && COSTE_MINIMO[tipo] >= 2000) cuenta.presupuesto++;
        if ((r[2] === 0 || r[2] === 3) && largas.includes(tipo)) cuenta.tiempo++;
        if (r[10] === 0 && tipo !== 'master') cuenta.titulo++;
        return;
      }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
        r[PREGUNTAS[i].id] = k;
        recorrer(i + 1);
      }
    };
    recorrer(0);
    expect.soft(cuenta.presupuesto, '«Menos de 2.000 €» → máster o bootcamp').toBe(0);
    expect.soft(cuenta.tiempo, '«3-6 meses» o «semanas» → vía de 1 año o más').toBe(0);
    expect.soft(cuenta.titulo, '«Necesito un título universitario» → otra vía').toBe(0);
  });

  test('el coste mínimo del máster no supera el precio público de un máster de 60 ECTS', async ({ page }) => {
    // HALLAZGO abierto: la ficha publica «3.000 – 30.000 €» (y COSTE_MINIMO = 3.000 desempata con
    // él), la guía dice «universidades públicas desde 1.500 €», y el máster no habilitante público
    // cuesta en Andalucía 13,68 €/crédito (Junta de Andalucía, nota del 08/08/2024, precio mantenido
    // en 2025/26 por el Decreto 142/2025): 60 ECTS × 13,68 € = 820,80 €, con bonificación del 99 %
    // de los créditos aprobados en primera matrícula.
    test.fail();
    await abrirTest(page);
    await responder(page, NORMAL);
    expect.soft(await minimoPublicado(page), 'ficha del máster').toBeLessThanOrEqual(820.8);
    const guia = await textoGuia(page);
    const desde = guia.match(/públicas desde ([\d.,]+)\s*€/)?.[1];
    if (desde) expect.soft(parseSpanishNumber(desde), 'guía: «universidades públicas desde…»').toBeLessThanOrEqual(820.8);
  });

  test('guía y FAQ: medicina y psicología clínica no tienen máster habilitante', async ({ page }) => {
    // HALLAZGO abierto: Medicina se ejerce con el Grado (Orden ECI/332/2008, 360 ECTS) y la
    // especialidad por residencia MIR; Psicología Clínica, por residencia PIR (RD 2490/1998). El
    // máster habilitante de psicología es el de Psicología General Sanitaria (Ley 33/2011, DA 7.ª).
    test.fail();
    await abrirTest(page);
    const frase = (await textoGuia(page)).match(/[^.]*másteres habilitantes[^.]*\./i)?.[0] ?? '';
    expect.soft(frase, 'guía').not.toMatch(/medicina|psicología clínica/i);
    const faqMaster = (await leerFaq(page)).find((q) => /Vale la pena hacer un máster/.test(q.p))?.r ?? '';
    const casiObligatorio = faqMaster.match(/[^.]*casi obligatorio[^.]*\./)?.[0] ?? '';
    expect.soft(casiObligatorio, 'FAQ').not.toMatch(/medicina|psicología clínica/i);
  });

  test('guía: el cuerpo de Maestros no exige el máster de profesorado', async ({ page }) => {
    // HALLAZGO abierto: LOE art. 93 exige para primaria el título de Maestro o el Grado equivalente;
    // la formación pedagógica de postgrado (el máster) es del art. 94, para ESO y bachillerato.
    // Además el MIR/EIR/FIR se presenta como «oposición» en una sección cuyo resultado es
    // «Funcionario de carrera» y «un empleo de por vida», cuando da un contrato de residencia
    // temporal (RD 1146/2006).
    test.fail();
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect.soft(guia).not.toMatch(/\(Maestros[^)]*\):\s*requieren máster/);
    expect.soft(guia).not.toMatch(/Cuerpos sanitarios \(MIR/);
  });

  test('FAQ: la cifra del INE sobre el empleo de los titulados de máster es la que publica el INE', async ({ page }) => {
    // HALLAZGO abierto: la EILU 2019 del INE (última edición, 29/10/2020) da una tasa de empleo del
    // 86,1 % a los titulados universitarios y del 87,3 % a los de máster: 1,2 puntos, no un 8 %.
    test.fail();
    await abrirTest(page);
    const faqMaster = (await leerFaq(page)).find((q) => /Vale la pena hacer un máster/.test(q.p))?.r ?? '';
    expect(faqMaster).not.toMatch(/un 8\s?% superior/);
  });

  test('FAQ: las duraciones y las vías son las de la pantalla', async ({ page }) => {
    // HALLAZGO abierto: el FAQ (lo que leen buscadores e IA) da «3-9 meses» al bootcamp y «1-4 años»
    // a las oposiciones; la ficha dice «3-6 meses» y «2-5 años de preparación». La primera respuesta
    // enumera las opciones sin la FP de grado superior, que es una de las cinco que da la app.
    test.fail();
    await abrirTest(page);
    const faq = await leerFaq(page);
    const bootcamp = faq.find((q) => /bootcamp de un máster/.test(q.p))?.r ?? '';
    expect.soft(bootcamp, 'bootcamp').toContain(FORMACIONES.bootcamp.duracion);
    const rangoOposiciones = FORMACIONES.oposiciones.duracion.match(/\d+-\d+ años/)?.[0] ?? '2-5 años';
    const oposiciones = faq.find((q) => /oposiciones/.test(q.p))?.r ?? '';
    expect.soft(oposiciones, 'oposiciones').toContain(rangoOposiciones);
    expect.soft(faq[0]?.r ?? '', 'primera respuesta').toMatch(/\bFP\b|Formación Profesional/);
  });

  test('guía: la inserción de la FP superior sale de la estadística oficial', async ({ page }) => {
    // HALLAZGO abierto: «superior al 75 % en muchas familias profesionales». El Ministerio de
    // Educación (nota del 26/11/2025, titulados de 2020-2021) da un 51,1 % de afiliación al primer
    // año en grado superior; en torno al 75 % solo a los tres años y solo en tres familias
    // (Informática y Comunicaciones, Fabricación Mecánica, Instalación y Mantenimiento).
    test.fail();
    await abrirTest(page);
    expect(await textoGuia(page)).not.toMatch(/superior\s+al\s+75\s?%\s+en muchas familias/);
  });

  test('aviso de región: los datos de España se señalan (§1.bis)', async ({ page }) => {
    // HALLAZGO abierto: guía «en España», SEPE, FP Dual, Administración General del Estado, MIR,
    // precios en euros y «según institución, CCAA y modalidad» en el resultado, sin RegionBadge.
    test.fail();
    await abrirTest(page);
    expect(await page.locator('[role="note"][aria-label*="España"]').count()).toBeGreaterThan(0);
  });

  test('guía: sin ranking fechado en un año cerrado ni certificaciones de otro país', async ({ page }) => {
    // HALLAZGO abierto: «Certificaciones más demandadas en España (2025)», a 24/09/2026 y sin fuente,
    // con el CPA (licencia de contable público de EE. UU.) en la lista.
    test.fail();
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect.soft(guia).not.toMatch(/más demandadas en España \(2025\)/);
    expect.soft(guia).not.toMatch(/\bCPA\b/);
  });

  test('la comparativa no se anuncia como «barra de progreso»', async ({ page }) => {
    // HALLAZGO abierto: cinco role="progressbar" (árbol de accesibilidad: nombre «🎓 Máster: 35
    // puntos», valuenow 35, valuemin 0, valuemax 35, sin aria-valuetext). Un lector dice «barra de
    // progreso, 100 %»: progreso de ninguna tarea, y el 100 % es relativo a la recomendada, no al
    // máximo posible (37 para el máster). El ítem ya dice en texto «Máster» y «35 pts».
    test.fail();
    await abrirTest(page);
    await responder(page, NORMAL);
    expect(await page.locator('[class*="alternativas"] [role="progressbar"]').count()).toBe(0);
  });

  test('la comparativa no lee los emojis ni dice «1 pts»', async ({ page }) => {
    // HALLAZGO abierto: el emoji de LABELS va como texto suelto (sin aria-hidden) en la etiqueta y
    // dentro del aria-label de la barra; el candado a11y-jsx no lo ve porque sale de una cadena de
    // datos, no de JSX. Con 1 punto la pantalla dice «1 pts» y la barra «1 puntos».
    test.fail();
    await abrirTest(page);
    await responder(page, NORMAL);
    const emojiSuelto = await page.locator('[class*="alternativaLabel"]').evaluateAll((els) =>
      els.filter((e) => [...e.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && /\p{Extended_Pictographic}/u.test(n.textContent ?? ''))).length,
    );
    expect.soft(emojiSuelto, 'etiquetas con emoji leído').toBe(0);
    const nombres = await page.locator('[class*="alternativaBarWrap"] > *').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));
    expect.soft(nombres.filter((n) => /\p{Extended_Pictographic}/u.test(n)), 'aria-label con emoji').toEqual([]);
    // Estabilidad · Unas semanas · Desempleado · <2.000 € · Administración · 1-3 años · Autónomo ·
    // Administración · Lo antes posible · Titulación pública → el máster suma 1 (sector, +1).
    await abrirTest(page);
    await responder(page, [0, 3, 3, 0, 0, 1, 3, 1, 0, 1]);
    expect.soft(await page.locator('[class*="alternativaPct"]').allInnerTexts()).not.toContain('1 pts');
  });

  test('tras «Ver resultado» el foco o un anuncio llevan al resultado', async ({ page }) => {
    // HALLAZGO abierto: la sección del test se desmonta con el botón que tenía el foco, y el foco cae
    // a <body>; el resultado no está en ninguna región viva. Es de familia: la referencia
    // (selector-smartphone) tampoco mueve el foco.
    test.fail();
    await abrirTest(page);
    await responder(page, NORMAL);
    const llega = await page.evaluate(() => {
      const seccion = document.querySelector('section[class*="resultado"]');
      const activo = document.activeElement;
      const enFoco = Boolean(seccion && activo && seccion.contains(activo));
      const anunciado = Boolean(seccion && (seccion.closest('[aria-live], [role="status"]') || seccion.querySelector('[aria-live], [role="status"]')));
      return enFoco || anunciado;
    });
    expect(llega).toBe(true);
  });

  test('contraste en claro: textos pequeños en color de marca ≥ 4,5:1', async ({ page }) => {
    // HALLAZGO abierto. Medido hoy: preguntaNumero 4,11 · «Siguiente →» 4,11 (blanco sobre #2E86AB) ·
    // resultadoBadge 3,65 · h3 de la guía 3,77 (#2E86AB sobre fondo claro).
    test.fail();
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

  test('contraste en oscuro: textos pequeños en color de marca ≥ 4,5:1', async ({ page }) => {
    // HALLAZGO abierto. El módulo redeclara --primary: #2E86AB en .container y no en su variante
    // oscura, así que tapa el #3FA5D1 oscuro de globals (check:token-oscuro deja --primary fuera a
    // propósito). Medido hoy: preguntaNumero 4,11 · «Siguiente →» 4,11 · resultadoBadge 3,13 ·
    // h3 de la guía 3,21.
    test.fail();
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
});
