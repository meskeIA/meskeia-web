import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, ORDEN_COSTE, PREGUNTAS, type EjercicioKey } from '../../app/selector-ejercicio/motor';

/**
 * ¿Qué ejercicio te conviene? (selector-ejercicio) — reparado el 24/09/2026 desde una sospecha
 * del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342, repetidos aquí).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 7 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1, y pintaba paso / 10: en la
 *     pregunta 2 anunciaba 0,111 y pintaba 0,100.
 *   · Empates: el ganador salía de ordenar `Object.entries(puntos)`: a igualdad, el primero del
 *     objeto, siempre el gimnasio. Enumerado: 340.435 de los 1.376.256 perfiles (el 24,7 %)
 *     empatan en cabeza, y en 210.415 el criterio explícito cambia el ganador. Entre ellos, el
 *     perfil de abajo: con «Problemas de espalda o columna» la app mandaba al gimnasio, que
 *     puntúa 1 en esa pregunta, habiendo natación y yoga con 3.
 *   · Razones fijas: la app no da un «por qué»; las fichas (beneficios, equipo, consejos)
 *     describen la actividad, no al usuario. No había nada que reparar ahí.
 *
 * EL MOTOR (app/selector-ejercicio/motor.ts): las mismas preguntas y pesos (comprobado sobre
 * todas las combinaciones: sin empate, el ganador no cambia en ninguna). A igualdad de puntos,
 * primero la limitación física (pregunta 7), luego el objetivo (1), luego el presupuesto (5) y
 * por último el menor coste de partida; el empate se anuncia con el criterio que lo decide.
 */

async function esperarHidratacionBotones(page: Page): Promise<void> {
  // Sin <input> no hay rastreador de valor que sondear (`_hidratacion.ts`): el testigo es que
  // React haya colgado sus props del botón de inicio. Mismo criterio que selector-smartphone.
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
  await page.goto('/selector-ejercicio/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu ejercicio recomendado' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Perder peso · Menos de 30 minutos · Solo/a · En casa · 20 – 60 €/mes · Muy buena ·
// Problemas de espalda o columna · Variedad · Deporte de equipo · Eficacia.
// Pesos (gimnasio, running, natación, ciclismo, yoga-pilates, casa), pregunta a pregunta:
//   2,3,2,3,1,2 + 1,2,1,1,2,3 + 2,3,3,2,2,3 + 0,0,0,0,2,3 + 3,2,2,2,3,2 + 3,3,3,3,2,1 +
//   1,1,3,1,3,2 + 2,1,2,2,1,1 + 2,1,1,1,2,0 + 3,2,2,2,1,2
//   = gimnasio 19 · running 18 · natación 19 · ciclismo 17 · yoga 19 · casa 19.
// Cuádruple empate a 19. Espalda: natación 3 = yoga 3 > casa 2 > gimnasio 1. Entre natación y
// yoga, el objetivo «perder peso»: natación 2 > yoga 1. Antes: gimnasio, por ir primero.
const ESPALDA = [0, 0, 0, 0, 2, 3, 2, 1, 3, 1] as const;

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(7);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(5).click();
  await expect(grupo.locator('[role="radio"]').nth(5)).toHaveAttribute('aria-checked', 'true');
  await grupo.locator('[role="radio"]').nth(1).click();
  await expect(grupo.locator('[role="radio"]').nth(1)).toHaveAttribute('aria-checked', 'true');
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
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await expect(barra).toHaveAttribute('aria-valuetext', `Pregunta ${paso + 1} de 10`);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('un empate se anuncia, y con problemas de espalda no gana el gimnasio por ir primero', async ({ page }) => {
  await abrirTest(page);
  await responder(page, ESPALDA);
  await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Natación');
  const empate = page.locator('[class*="avisoEmpate"]');
  await expect(empate).toContainText(
    'la natación, el yoga o el pilates, el entrenamiento en casa y el gimnasio encajan exactamente igual',
  );
  await expect(empate).toContainText(
    'se muestra primero la natación porque se adapta mejor a la limitación física que has indicado y, a igualdad, encaja mejor con tu objetivo principal',
  );
});

test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  test.setTimeout(180_000);
  const DESEMPATE = [
    { id: 'limitaciones', frase: 'se adapta mejor a la limitación física' },
    { id: 'objetivo', frase: 'encaja mejor con tu objetivo principal' },
    { id: 'presupuesto', frase: 'encaja mejor con el presupuesto' },
  ];
  const r: Record<string, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  const peso = (id: string, k: EjercicioKey) => PREGUNTAS.find((p) => p.id === id)!.opciones.find((o) => o.valor === r[id])!.pesos[k];
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const max = Math.max(...CLAVES.map((k) => res.puntos[k]));
      if (res.puntos[res.ejercicio] !== max) mal('no tiene la puntuación máxima');
      const reales = CLAVES.filter((k) => k !== res.ejercicio && res.puntos[k] === max);
      if (reales.length !== res.empatados.length) mal('empatados mal contados');
      if (reales.length === 0 && res.criterioDesempate !== '') mal('criterio sin empate');
      if (reales.length > 0) empates++;
      for (const k of reales) {
        const decide = DESEMPATE.find(({ id }) => peso(id, res.ejercicio) !== peso(id, k));
        if (decide) {
          if (peso(decide.id, res.ejercicio) < peso(decide.id, k)) mal(`pierde en ${decide.id} contra ${k}`);
          if (!res.criterioDesempate.includes(decide.frase)) mal(`no nombra ${decide.id}`);
        } else {
          if (ORDEN_COSTE[res.ejercicio] > ORDEN_COSTE[k]) mal(`más caro que ${k}`);
          if (!res.criterioDesempate.includes('menor coste de partida')) mal('no nombra el coste');
        }
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
  expect(total).toBe(1_376_256);
  expect(empates).toBe(340_435);
});

/**
 * INSPECCIÓN DEL 24/09/2026 (Inspector, tras la reparación en lote del commit 99acf1e0).
 *
 * La reparación de hoy (radios, barra, empates) la cubren los cuatro tests de arriba y el
 * testigo de familia: no se repite aquí. Lo nuevo es lo que el usuario DECLARA como límite y
 * la app trata como un peso más (forma a de la familia; en selector-mascota, hallazgo 1332).
 *
 * Recuento del motor sobre las 1.376.256 combinaciones (scratchpad del Inspector, barrido.mjs):
 *   · Rodillas («Evito impactos») → running en 2.429 perfiles; articulares generales («Bajo
 *     impacto necesario») → running en 2.157. Juntos, 4.586: la cifra de la sospecha de esta
 *     tarde eran las DOS limitaciones sumadas, no solo la de rodillas.
 *   · Espalda → running en 20.884 (el FAQPage de la misma página dice bajo impacto).
 *   · «En casa, sin salir» → gimnasio, running, natación o ciclismo en 74.600 de 344.064.
 *   · «Cero euros, sin gasto» → gimnasio (25-50 €/mes) o natación (20-40 €/mes) en 72.411.
 *   · «Menos de 30 minutos» → ciclismo («salidas de 1-3 horas») o gimnasio («sesiones de
 *     45-75 min») en 70.567.
 *
 * Los perfiles se dan como índice de la opción en cada una de las 10 preguntas, en orden.
 */
test.describe('Inspección 24/09/2026 — límites declarados, datos de salud y contraste', () => {
  const texto = async (page: Page) => (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
  const recomendado = (page: Page) => page.locator('[class*="recomendacionValor"]').innerText();

  // Ganar músculo · 30-60 min · Me da igual · Instalación · 20-60 €/mes · Buena · Ninguna ·
  // Rutinas · Sala o máquinas · Eficacia. Pesos (gim, run, nat, cic, yoga, casa):
  //   3,0,1,1,1,2 + 2,3,2,2,3,3 + 3,2,2,2,2,2 + 3,0,3,1,2,0 + 3,2,2,2,3,2 + 3,2,2,2,2,2 +
  //   3,3,3,3,3,3 + 3,2,2,2,2,2 + 3,1,1,1,1,2 + 3,2,2,2,1,2
  //   = gimnasio 29 · running 17 · natación 20 · ciclismo 18 · yoga 20 · casa 20. Sin empate.
  test('caso normal: perfil de fuerza en instalación → gimnasio, sin aviso de empate', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [1, 1, 2, 2, 2, 2, 0, 0, 1, 1]);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Gimnasio y Entrenamiento de Fuerza');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(page.locator('[class*="statValor"]').nth(2)).toHaveText('25-50 €/mes según instalación');
  });

  test('caso que se rechaza: sin respuesta no se avanza, y «Anterior» conserva lo elegido', async ({ page }) => {
    await abrirTest(page);
    const siguiente = page.getByRole('button', { name: 'Siguiente pregunta' });
    await expect(siguiente).toBeDisabled();
    await page.locator('[role="radio"]').nth(3).click();
    await siguiente.click();
    await page.getByText('Pregunta 2 de 10').first().waitFor();
    await expect(siguiente).toBeDisabled();
    await page.getByRole('button', { name: 'Pregunta anterior' }).click();
    await expect(page.locator('[role="radio"]').nth(3)).toHaveAttribute('aria-checked', 'true');
    await expect(siguiente).toBeEnabled();
  });

  // Perder peso · <30 min · Solo · Aire libre · 0 € · Regular · RODILLAS · Rutinas · Individual ·
  // Eficacia. Pesos: 2,3,2,3,1,2 + 1,2,1,1,2,3 + 2,3,3,2,2,3 + 0,3,1,3,1,0 + 0,2,0,1,1,3 +
  //   2,2,2,2,2,2 + 2,0,3,2,2,2 + 3,2,2,2,2,2 + 1,3,3,3,2,2 + 3,2,2,2,1,2
  //   = gimnasio 16 · running 22 · natación 19 · ciclismo 21 · yoga 16 · casa 21.
  // Con el running apartado (la referencia filtra lo declarado como límite), empatan ciclismo y
  // casa a 21; rodillas 2 = 2, objetivo 3 > 2 → ciclismo. Hoy: running, sin mencionar la rodilla.
  test('HALLAZGO abierto: con «Problemas de rodillas» («Evito impactos») recomienda running', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la limitación de rodillas es un peso, no un filtro.
    await abrirTest(page);
    await responder(page, [0, 0, 0, 1, 0, 1, 1, 0, 2, 1]);
    expect(await recomendado(page)).not.toBe('Running y Carrera');
  });

  // Igual que el anterior con «Problemas articulares generales» («Bajo impacto necesario»),
  // motivación social y prioridad comodidad: gimnasio 13 · running 22 · natación 17 ·
  // ciclismo 20 · yoga 18 · casa 20. Sin el running: ciclismo = casa a 20; articular 2 = 2,
  // objetivo 3 > 2 → ciclismo.
  test('HALLAZGO abierto: con «Problemas articulares generales» recomienda running', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: «Bajo impacto necesario» tampoco filtra.
    await abrirTest(page);
    await responder(page, [0, 0, 0, 1, 0, 1, 3, 3, 2, 0]);
    expect(await recomendado(page)).not.toBe('Running y Carrera');
  });

  test('HALLAZGO abierto (motor): ningún perfil con rodillas o articulares debería dar running', () => {
    test.fail(); // HALLAZGO abierto: hoy 4.586 perfiles (2.429 rodillas + 2.157 articulares).
    test.setTimeout(180_000);
    const r: Record<string, string> = {};
    let running = 0;
    const recorrer = (i: number): void => {
      if (i === PREGUNTAS.length) {
        if ((r.limitaciones === 'rodillas' || r.limitaciones === 'general') && calcularResultado(r).ejercicio === 'running') running++;
        return;
      }
      for (const o of PREGUNTAS[i].opciones) {
        r[PREGUNTAS[i].id] = o.valor;
        recorrer(i + 1);
      }
    };
    recorrer(0);
    expect(running).toBe(0);
  });

  // Perder peso · <30 min · Solo · Aire libre · 0 € · Muy buena · ESPALDA · Progreso ·
  // Individual · Comodidad = gimnasio 15 · running 25 · natación 19 · ciclismo 21 · yoga 17 ·
  // casa 21. El FAQPage de la página: «problemas de rodilla o espalda → bajo impacto: natación,
  // acuagym, ciclismo estático o yoga». Se admite la reparación por filtro o por aviso.
  test('HALLAZGO abierto: con «Problemas de espalda» recomienda running y no lo menciona', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la pantalla contradice el FAQPage de la misma página.
    await abrirTest(page);
    await responder(page, [0, 0, 0, 1, 0, 3, 2, 2, 2, 0]);
    const valor = await recomendado(page);
    expect(valor !== 'Running y Carrera' || /espalda/i.test(await texto(page))).toBe(true);
  });

  // Ganar músculo · 1-2 h · Me da igual · EN CASA, SIN SALIR · 20-60 € · Muy buena · Ninguna ·
  // Social · Sala · Eficacia. Pesos: 3,0,1,1,1,2 + 3,2,3,3,2,2 + 3,2,2,2,2,2 + 0,0,0,0,2,3 +
  //   3,2,2,2,3,2 + 3,3,3,3,2,1 + 3,3,3,3,3,3 + 2,2,1,2,2,0 + 3,1,1,1,1,2 + 3,2,2,2,1,2
  //   = gimnasio 26 · running 17 · natación 18 · ciclismo 19 · yoga 19 · casa 19.
  // Entre lo que se hace en casa: yoga = casa a 19; limitación 3 = 3; objetivo músculo 2 > 1 →
  // entrenamiento en casa. Hoy: el gimnasio, a quien ha dicho «sin salir», y sin aviso.
  test('HALLAZGO abierto: «En casa, sin salir» → gimnasio', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: el lugar declarado es un peso; 74.600 perfiles salen fuera de casa.
    await abrirTest(page);
    await responder(page, [1, 2, 2, 0, 2, 3, 0, 3, 1, 1]);
    const valor = await recomendado(page);
    const fuera = ['Gimnasio y Entrenamiento de Fuerza', 'Running y Carrera', 'Natación', 'Ciclismo (Ruta o MTB)'].includes(valor);
    expect(!fuera || /sin salir|en casa/i.test(await texto(page))).toBe(true);
  });

  // Ganar músculo · Más de 2 h · Me da igual · Donde sea · CERO EUROS · Buena · Ninguna ·
  // Rutinas · Equipo · Eficacia. Pesos: 3,0,1,1,1,2 + 3,2,3,3,2,1 + 3,2,2,2,2,2 + 2,2,2,2,2,2 +
  //   0,2,0,1,1,3 + 3,2,2,2,2,2 + 3,3,3,3,3,3 + 3,2,2,2,2,2 + 2,1,1,1,2,0 + 3,2,2,2,1,2
  //   = gimnasio 25 · running 18 · natación 18 · ciclismo 19 · yoga 18 · casa 19.
  // Sin las cuotas (gimnasio 25-50 €/mes, natación 20-40 €/mes): ciclismo = casa a 19;
  // objetivo músculo 2 > 1 → entrenamiento en casa. Hoy: gimnasio con «25-50 €/mes».
  test('HALLAZGO abierto: «Cero euros, sin gasto» → gimnasio de 25-50 €/mes', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: el presupuesto es un peso; 72.411 perfiles con 0 € reciben una cuota.
    await abrirTest(page);
    await responder(page, [1, 3, 2, 3, 0, 2, 0, 0, 3, 1]);
    const valor = await recomendado(page);
    const conCuota = valor === 'Gimnasio y Entrenamiento de Fuerza' || valor === 'Natación';
    expect(!conCuota || /presupuesto|sin gasto|cero euros/i.test(await texto(page))).toBe(true);
  });

  // Perder peso · MENOS DE 30 MIN · Con compañía · Aire libre · >60 € · Muy sedentario ·
  // Ninguna · Variedad · Ninguna rutina · Diversión. Pesos: 2,3,2,3,1,2 + 1,2,1,1,2,3 +
  //   2,2,1,2,2,1 + 0,3,1,3,1,0 + 3,2,3,3,3,2 + 2,1,2,2,3,3 + 3,3,3,3,3,3 + 2,1,2,2,1,1 +
  //   2,2,2,2,3,3 + 1,2,2,3,2,1
  //   = gimnasio 18 · running 21 · natación 19 · ciclismo 24 · yoga 21 · casa 19.
  // Sale ciclismo, cuya ficha pide «salidas de 1-3 horas». Se admite ficha coherente o aviso.
  test('HALLAZGO abierto: «Menos de 30 minutos» → ciclismo con «salidas de 1-3 horas»', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la frecuencia de la ficha contradice el tiempo declarado.
    await abrirTest(page);
    await responder(page, [0, 0, 1, 1, 3, 0, 0, 1, 0, 2]);
    const frecuencia = await page.locator('[class*="statValor"]').first().innerText();
    expect(!/1-3 horas|45-75 min/.test(frecuencia) || /30 minutos|poco tiempo/i.test(await texto(page))).toBe(true);
  });

  // Cardio · 30-60 min · Solo · Aire libre · Hasta 20 € · Muy buena · Ninguna · Progreso ·
  // Individual · Eficacia = gimnasio 19 · running 29 · natación 23 · ciclismo 26 · yoga 18 ·
  // casa 20. Un running limpio, sin ninguna limitación, para mirar la ficha.
  const RUNNING_LIMPIO = [2, 1, 0, 1, 1, 3, 0, 2, 2, 1] as const;

  test('HALLAZGO abierto: la ficha de running afirma que el calzado es la principal causa de lesión', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: lo es la carga de entrenamiento y la lesión previa (revisiones sistemáticas).
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Running y Carrera');
    expect(await texto(page)).not.toContain('principal causa de lesión');
  });

  test('HALLAZGO abierto: la ficha de running da por «imprescindible» un sujetador deportivo a cualquiera', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: el test no pregunta nada que permita suponerlo.
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Running y Carrera');
    expect(await texto(page)).not.toContain('Sujetador deportivo de sujeción alta (imprescindible)');
  });

  test('HALLAZGO abierto: cifras en euros sin espacio antes del símbolo («80-150€»)', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: formato español obligatorio, «80-150 €».
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    await expect(page.locator('[class*="statValor"]').nth(2)).toContainText('zapatillas');
    expect(await page.locator('[class*="statValor"]').nth(2).innerText()).not.toMatch(/\d€/);
  });

  test('HALLAZGO abierto: la guía da «60-90 días» para consolidar un hábito, sin fuente', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: Lally et al. (2010) midieron mediana 66 días, rango 18-254.
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByText('Cómo crear el hábito deportivo')).toBeVisible();
    expect(await texto(page)).not.toContain('se consolida en 60-90 días');
  });

  test('HALLAZGO abierto: precios en euros y guía «en España» sin RegionBadge', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: §1.bis del CLAUDE.md, variant="es-data" (como selector-mascota, 1340).
    await page.goto('/selector-ejercicio/');
    await esperarHidratacionBotones(page);
    await expect(page.getByText('Datos de referencia: España')).toHaveCount(1, { timeout: 1_000 });
  });

  // ─── Contraste, con los colores COMPUTADOS y el fondo real compuesto ───
  async function contraste(page: Page, selector: string): Promise<number> {
    return page.locator(selector).first().evaluate((el) => {
      interface Rgba { r: number; g: number; b: number; a: number }
      const leer = (s: string): Rgba | null => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
      };
      const sobre = (f: Rgba, b: Rgba): Rgba => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
      const lum = (c: Rgba) => {
        const k = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * k(c.r) + 0.7152 * k(c.g) + 0.0722 * k(c.b);
      };
      const capas: Rgba[] = [];
      let base: Rgba = { r: 255, g: 255, b: 255, a: 1 };
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = leer(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) { if (c.a >= 1) { base = c; break; } capas.push(c); }
      }
      let fondo = base;
      for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
      const tinta = sobre(leer(getComputedStyle(el).color) as Rgba, fondo);
      const [a, b] = [lum(tinta), lum(fondo)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    });
  }
  // Todos son texto pequeño (13,6-16 px; 16 px en negrita no llega a «grande»): exigen 4,5:1.
  const TEXTOS_RESULTADO = ['recomendacionPerfil', 'statValor', 'beneficiosTitulo', 'equipoTitulo', 'btnRepetir'];

  test('HALLAZGO abierto: en tema claro, seis textos pequeños de marca no llegan a 4,5:1', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: --primary/--secondary como texto; lo que toca es --primary-texto/--secondary-texto.
    // Medido hoy: progresoPaso 3,93 · recomendacionPerfil 2,80 · statValor 4,11 ·
    // beneficiosTitulo 2,52 · equipoTitulo 3,63 · btnRepetir 3,93.
    await abrirTest(page);
    const medidos: Record<string, number> = { progresoPaso: await contraste(page, '[class*="progresoPaso"]') };
    await responder(page, RUNNING_LIMPIO);
    for (const c of TEXTOS_RESULTADO) medidos[c] = await contraste(page, `[class*="${c}"]`);
    expect(Object.entries(medidos).filter(([, v]) => v < 4.5)).toEqual([]);
  });

  test('en tema oscuro esos mismos textos sí pasan de 4,5:1', async ({ page }) => {
    // Medido hoy: progresoPaso 6,23 · perfil 6,17 · statValor 4,93 · beneficios 6,75 ·
    // equipo 5,60 · repetir 6,23. Es la guarda para cuando se drene el tema claro.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-ejercicio/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    await expect.poll(() => contraste(page, '[class*="progresoPaso"]')).toBeGreaterThanOrEqual(4.5);
    await responder(page, RUNNING_LIMPIO);
    for (const c of TEXTOS_RESULTADO) {
      await expect.poll(() => contraste(page, `[class*="${c}"]`), { message: c }).toBeGreaterThanOrEqual(4.5);
    }
  });
});
