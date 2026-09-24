import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, COSTE_MINIMO, PREGUNTAS, type TipoFormacion } from '../../app/selector-formacion-postgrado/motor';

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
