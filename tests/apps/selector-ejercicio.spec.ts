import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, EJERCICIOS, ORDEN_COSTE, PREGUNTAS, TECHO_CUOTA, TECHO_SESION, type EjercicioKey } from '../../app/selector-ejercicio/motor';

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
 *     objeto, siempre el gimnasio.
 *   · Razones fijas: la app no da un «por qué»; las fichas (beneficios, equipo, consejos)
 *     describen la actividad, no al usuario. No había nada que reparar ahí.
 *
 * EL MOTOR (app/selector-ejercicio/motor.ts): las mismas preguntas y pesos. A igualdad de
 * puntos, primero la limitación física (pregunta 7), luego el objetivo (1), luego el
 * presupuesto (5) y por último el menor coste de partida; el empate se anuncia con el criterio
 * que lo decide.
 *
 * SEGUNDA REPARACIÓN, el mismo 24/09/2026 (hallazgos 1378-1388 del Inspector): lo declarado
 * como límite —una limitación física o la prioridad de bajo impacto frente al running, «En casa,
 * sin salir», la cuota mensual y el tiempo por sesión— pasa de peso a FILTRO, y lo apartado se
 * dice en pantalla. Los dos tests de abajo que suponían otra cosa se reescribieron, cada uno con
 * su motivo en un comentario.
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
// REESCRITO el 24/09/2026 (hallazgo 1380): este test exigía la NATACIÓN a quien acababa de
// responder «En casa, sin salir»; consagraba el defecto. Ahora, en casa solo caben el yoga o el
// pilates y el entrenamiento en casa, empatados a 19: espalda yoga 3 > casa 2 → yoga. La
// natación, que iba primera por puntos (espalda 3, objetivo 2), se aparta y se dice.
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

test('un empate se anuncia, y con problemas de espalda en casa gana el yoga por la limitación', async ({ page }) => {
  await abrirTest(page);
  await responder(page, ESPALDA);
  await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Yoga y Pilates');
  const empate = page.locator('[class*="avisoEmpate"]');
  await expect(empate).toContainText('el yoga o el pilates y el entrenamiento en casa encajan exactamente igual');
  await expect(empate).toContainText('se muestra primero el yoga o el pilates porque se adapta mejor a la limitación física que has indicado');
  await expect(page.locator('[class*="avisoRecorte"][role="note"]')).toContainText(
    'Por puntos iba por delante la natación, pero no se hace en casa y has indicado «En casa, sin salir».',
  );
});

test('motor: ningún empate queda en silencio, el criterio que se anuncia es verdad y los filtros se cumplen', () => {
  // REESCRITO el 24/09/2026. Antes exigía que la recomendada tuviera la puntuación máxima de las
  // SEIS actividades; desde los hallazgos 1378-1382 la máxima se toma entre las ADMITIDAS, y los
  // empates se cuentan entre ellas: 276.594 (antes, 340.435 entre las seis).
  test.setTimeout(240_000);
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
      // Los filtros, recalculados aquí a partir de las fichas.
      const bajoImpacto = ['rodillas', 'espalda', 'general'].includes(r.limitaciones) || r.prioridad === 'impacto';
      const admitidas = CLAVES.filter((k) =>
        !(bajoImpacto && k === 'running') &&
        !(r.lugar === 'casa' && k !== 'yoga-pilates' && k !== 'entrenamiento-casa') &&
        EJERCICIOS[k].cuotaMin <= TECHO_CUOTA[r.presupuesto] &&
        EJERCICIOS[k].sesionMinima <= TECHO_SESION[r.tiempo]);
      if (!admitidas.includes(res.ejercicio)) mal('recomienda una actividad que no pasa los filtros');
      const max = Math.max(...admitidas.map((k) => res.puntos[k]));
      if (res.puntos[res.ejercicio] !== max) mal('no tiene la puntuación máxima de las admitidas');
      const reales = admitidas.filter((k) => k !== res.ejercicio && res.puntos[k] === max);
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
      // Todo lo que iba por delante y se ha apartado sale en pantalla con su motivo.
      if (res.avisosDescarte.length !== res.apartados.length) mal('apartada sin aviso');
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
  expect(empates).toBe(276_594);
});

/**
 * HALLAZGOS 1378-1388 (Inspección del 24/09/2026), reparados el mismo día. El Inspector los dejó
 * como test.fail(); se retiran, y cada test exige ahora la reparación con su caso literal.
 * Recuento del Inspector antes de reparar, sobre las 1.376.256 combinaciones: running con
 * rodillas o articulares 4.586 · con espalda 20.884 · fuera de casa con «En casa, sin salir»
 * 74.600 · cuota con «Cero euros» 72.411 · ciclismo o gimnasio con «Menos de 30 minutos» 70.567.
 * Los perfiles se dan como índice de la opción en cada una de las 10 preguntas, en orden.
 */
test.describe('Hallazgos 1378-1388 — límites declarados, datos de salud y contraste', () => {
  const texto = async (page: Page) => (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
  const recomendado = (page: Page) => page.locator('[class*="recomendacionValor"]').innerText();
  const aviso = (page: Page) => page.locator('[class*="avisoRecorte"][role="note"]');

  /** Recorre las 1.376.256 combinaciones con el motor real. */
  function barrer(visitar: (r: Record<string, string>, res: ReturnType<typeof calcularResultado>) => void): void {
    const r: Record<string, string> = {};
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

  // Ganar músculo · 30-60 min · Me da igual · Instalación · 20-60 €/mes · Buena · Ninguna ·
  // Rutinas · Sala o máquinas · Eficacia. Pesos (gim, run, nat, cic, yoga, casa):
  //   3,0,1,1,1,2 + 2,3,2,2,3,3 + 3,2,2,2,2,2 + 3,0,3,1,2,0 + 3,2,2,2,3,2 + 3,2,2,2,2,2 +
  //   3,3,3,3,3,3 + 3,2,2,2,2,2 + 3,1,1,1,1,2 + 3,2,2,2,1,2
  //   = gimnasio 29 · running 17 · natación 20 · ciclismo 18 · yoga 20 · casa 20. Sin empate ni filtro.
  test('caso normal: perfil de fuerza en instalación → gimnasio, sin avisos', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [1, 1, 2, 2, 2, 2, 0, 0, 1, 1]);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Gimnasio y Entrenamiento de Fuerza');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(aviso(page)).toHaveCount(0);
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

  // ─ 1378: rodillas, articulaciones y la prioridad «Bajo impacto» ─

  // Perder peso · <30 min · Solo · Aire libre · 0 € · Regular · RODILLAS · Rutinas · Individual ·
  // Eficacia. Pesos: 2,3,2,3,1,2 + 1,2,1,1,2,3 + 2,3,3,2,2,3 + 0,3,1,3,1,0 + 0,2,0,1,1,3 +
  //   2,2,2,2,2,2 + 2,0,3,2,2,2 + 3,2,2,2,2,2 + 1,3,3,3,2,2 + 3,2,2,2,1,2
  //   = gimnasio 16 · running 22 · natación 19 · ciclismo 21 · yoga 16 · casa 21.
  // Filtros: running (impacto, rodillas), ciclismo (salidas de 1-3 horas con «Menos de 30
  // minutos», hallazgo 1382), gimnasio y natación (cuota con «Cero euros», 1381). Quedan yoga
  // 16 y casa 21 → entrenamiento en casa. El Inspector esperaba el ciclismo porque solo apartaba
  // el running; con el tiempo declarado, el ciclismo tampoco cabe.
  test('1378 rodillas («Evito impactos»): no sale el running, y se dice por qué', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 0, 1, 0, 1, 1, 0, 2, 1]);
    expect(await recomendado(page)).toBe('Entrenamiento en Casa');
    await expect(aviso(page)).toContainText('Por puntos iba por delante el running, pero es una actividad de impacto y has indicado «Problemas de rodillas o piernas».');
    await expect(aviso(page)).toContainText('Por puntos iba por delante el ciclismo, pero su ficha habla de salidas de 1-3 horas y has indicado «Menos de 30 minutos».');
    const t = await texto(page);
    expect(t).toContain('consulta con un fisioterapeuta o un médico deportivo qué ejercicios te convienen');
    expect(t).toContain('elige ejercicios sin saltos ni impactos');
  });

  // Igual que el anterior con «Problemas articulares generales», motivación social y prioridad
  // comodidad: gimnasio 13 · running 22 · natación 17 · ciclismo 20 · yoga 18 · casa 20.
  // Sin running (impacto), ciclismo (tiempo), gimnasio y natación (cuota): casa 20 > yoga 18.
  test('1378 articulares («Bajo impacto necesario»): no sale el running', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 0, 1, 0, 1, 3, 3, 2, 0]);
    expect(await recomendado(page)).toBe('Entrenamiento en Casa');
    await expect(aviso(page)).toContainText('es una actividad de impacto y has indicado «Problemas articulares generales»');
  });

  // Cardio · 30-60 min · Solo · Aire libre · Hasta 20 € · Muy buena · Ninguna · Progreso ·
  // Individual · BAJO IMPACTO PARA LAS ARTICULACIONES. Pesos: 1,3,3,3,1,1 + 2,3,2,2,3,3 +
  //   2,3,3,2,2,3 + 0,3,1,3,1,0 + 1,3,1,2,2,3 + 3,3,3,3,2,1 + 3,3,3,3,3,3 + 3,3,2,3,1,2 +
  //   1,3,3,3,2,2 + 1,0,3,2,3,2
  //   = gimnasio 17 · running 27 · natación 24 · ciclismo 26 · yoga 20 · casa 20.
  // Sin limitación, pero la prioridad declarada es el bajo impacto: sin el running, ciclismo 26.
  test('1378 prioridad «Bajo impacto para las articulaciones»: no sale el running', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [2, 1, 0, 1, 1, 3, 0, 2, 2, 3]);
    expect(await recomendado(page)).toBe('Ciclismo (Ruta o MTB)');
    await expect(aviso(page)).toContainText('Por puntos iba por delante el running, pero es una actividad de impacto y priorizas el bajo impacto para las articulaciones.');
  });

  test('1378 y 1379 (motor): con una limitación física o la prioridad de bajo impacto, nunca running', () => {
    // Antes: 4.586 con rodillas o articulares, 20.884 con espalda y 2.354 con la prioridad.
    test.setTimeout(240_000);
    let mal = 0;
    barrer((r, res) => {
      const bajoImpacto = ['rodillas', 'espalda', 'general'].includes(r.limitaciones) || r.prioridad === 'impacto';
      if (bajoImpacto && res.ejercicio === 'running') mal++;
    });
    expect(mal).toBe(0);
  });

  // ─ 1379: espalda ─

  // Perder peso · <30 min · Solo · Aire libre · 0 € · Muy buena · ESPALDA · Progreso ·
  // Individual · Comodidad = gimnasio 15 · running 25 · natación 19 · ciclismo 21 · yoga 17 ·
  // casa 21. Sin running (impacto; el FAQPage de la página: «problemas de rodilla o espalda →
  // bajo impacto»), ciclismo (tiempo), gimnasio y natación (cuota): casa 21 > yoga 17.
  test('1379 espalda: no sale el running, y la pantalla nombra la espalda', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 0, 1, 0, 3, 2, 2, 2, 0]);
    expect(await recomendado(page)).toBe('Entrenamiento en Casa');
    await expect(aviso(page)).toContainText('es una actividad de impacto y has indicado «Problemas de espalda o columna»');
  });

  // ─ 1380: «En casa, sin salir» ─

  // Ganar músculo · 1-2 h · Me da igual · EN CASA, SIN SALIR · 20-60 € · Muy buena · Ninguna ·
  // Social · Sala · Eficacia = gimnasio 26 · running 17 · natación 18 · ciclismo 19 · yoga 19 ·
  // casa 19. En casa: yoga = casa a 19; limitación 3 = 3; objetivo músculo 2 > 1 → casa.
  test('1380 «En casa, sin salir»: entrenamiento en casa, no el gimnasio', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [1, 2, 2, 0, 2, 3, 0, 3, 1, 1]);
    expect(await recomendado(page)).toBe('Entrenamiento en Casa');
    await expect(aviso(page)).toContainText('Por puntos iba por delante el gimnasio, pero no se hace en casa y has indicado «En casa, sin salir».');
    await expect(page.locator('[class*="avisoEmpate"]')).toContainText('se muestra primero el entrenamiento en casa porque encaja mejor con tu objetivo principal');
  });

  test('1380, 1381 y 1382 (motor): ni fuera de casa, ni cuotas que no caben, ni sesiones que no caben', () => {
    // Antes: 74.600 fuera de casa · 72.411 cuotas con «Cero euros» y 38.916 gimnasios con «Hasta
    // 20 €/mes» · 70.567 ciclismos o gimnasios con «Menos de 30 minutos».
    test.setTimeout(240_000);
    const mal = { casa: 0, cuota: 0, sesion: 0, equipoSinAviso: 0 };
    barrer((r, res) => {
      const f = EJERCICIOS[res.ejercicio];
      if (r.lugar === 'casa' && !f.enCasa) mal.casa++;
      if (f.cuotaMin > TECHO_CUOTA[r.presupuesto]) mal.cuota++;
      if (f.sesionMinima > TECHO_SESION[r.tiempo]) mal.sesion++;
      // Con «Cero euros», el equipo de partida que no es cuota (zapatillas, bicicleta) se avisa.
      if (r.presupuesto === 'cero' && f.equipoDePartida && !res.aTenerEnCuenta.some((t) => t.includes(f.equipoDePartida))) mal.equipoSinAviso++;
    });
    expect(mal).toEqual({ casa: 0, cuota: 0, sesion: 0, equipoSinAviso: 0 });
  });

  // ─ 1381: «Cero euros, sin gasto» ─

  // Ganar músculo · Más de 2 h · Me da igual · Donde sea · CERO EUROS · Buena · Ninguna ·
  // Rutinas · Equipo · Eficacia = gimnasio 25 · running 18 · natación 18 · ciclismo 19 · yoga 18
  // · casa 19. Sin las cuotas (gimnasio, natación): ciclismo = casa a 19; objetivo 2 > 1 → casa.
  test('1381 «Cero euros, sin gasto»: sin cuota de gimnasio, y se dice', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [1, 3, 2, 3, 0, 2, 0, 0, 3, 1]);
    expect(await recomendado(page)).toBe('Entrenamiento en Casa');
    await expect(aviso(page)).toContainText('Por puntos iba por delante el gimnasio, pero su cuota (25-50 €/mes según instalación) no cabe en «Cero euros, sin gasto».');
  });

  // ─ 1382: «Menos de 30 minutos» ─

  // Perder peso · MENOS DE 30 MIN · Con compañía · Aire libre · >60 € · Muy sedentario ·
  // Ninguna · Variedad · Ninguna rutina · Diversión = gimnasio 18 · running 21 · natación 19 ·
  // ciclismo 24 · yoga 21 · casa 19. Sin el ciclismo (salidas de 1-3 horas): running = yoga a
  // 21; limitación 3 = 3; objetivo perder peso 3 > 1 → running, con sesiones de 20-60 min.
  test('1382 «Menos de 30 minutos»: no sale el ciclismo de 1-3 horas, y el FAQPage dice lo mismo', async ({ page, request }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 1, 1, 3, 0, 0, 1, 0, 2]);
    expect(await recomendado(page)).toBe('Running y Carrera');
    await expect(page.locator('[class*="statValor"]').first()).toHaveText('3-4 días/semana, sesiones de 20-60 min');
    await expect(aviso(page)).toContainText('Por puntos iba por delante el ciclismo, pero su ficha habla de salidas de 1-3 horas y has indicado «Menos de 30 minutos».');
    // El FAQPage ya no da el ciclismo como opción para quien tiene poco tiempo.
    const html = await (await request.get('/selector-ejercicio/')).text();
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((b) => b.includes('"FAQPage"')) ?? '';
    expect(faq).toContain('Con menos de 30 minutos por sesión, este test aparta las actividades cuya sesión habitual es más larga, como el gimnasio (sesiones de 45-75 min) o el ciclismo de ruta (salidas de 1-3 horas).');
    expect(faq).not.toContain('caminar rápido, ciclismo o entrenamientos HIIT');
  });

  // Cardio · 30-60 min · Solo · Aire libre · Hasta 20 € · Muy buena · Ninguna · Progreso ·
  // Individual · Eficacia = gimnasio 19 · running 29 · natación 23 · ciclismo 26 · yoga 18 ·
  // casa 20. Un running limpio, sin ninguna limitación, para mirar la ficha.
  const RUNNING_LIMPIO = [2, 1, 0, 1, 1, 3, 0, 2, 2, 1] as const;

  // ─ 1383, 1386, 1388: la ficha de running y el formato ─

  test('1383 la ficha de running ya no dice que el calzado es la principal causa de lesión', async ({ page }) => {
    // Fuentes: Saragiotto et al., Sports Med 2014 (PMID 24809248): «The main risk factor reported
    // was previous injury (last 12 months)»; Correia et al., J Sport Health Sci 2024 (PMID
    // 38697289): «the multifactorial basis of injury incidence in running».
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Running y Carrera');
    const t = await texto(page);
    expect(t).not.toContain('principal causa de lesión');
    expect(t).toContain('haber tenido otra lesión en los últimos 12 meses (Saragiotto et al., 2014)');
  });

  test('1386 la ficha de running no da por «imprescindible» un sujetador a cualquiera', async ({ page }) => {
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    const t = await texto(page);
    expect(t).not.toContain('Sujetador deportivo de sujeción alta (imprescindible)');
    expect(t).toContain('Si usas sujetador, uno deportivo de sujeción alta');
  });

  test('1388 formato español: espacio antes de «€» y entre cifra y unidad, en pantalla y en todas las fichas', async ({ page }) => {
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    await expect(page.locator('[class*="statValor"]').nth(2)).toHaveText('Casi gratuito — solo zapatillas de calidad (~80-150 € que duran 500-800 km)');
    // Las seis fichas, enteras: «300-1.500€», «1,6-2g/kg», «1h», «2x1 metros» eran los casos.
    const pegadas = CLAVES.flatMap((k) => {
      const f = EJERCICIOS[k];
      return [f.frecuencia, f.inicio, f.coste, ...f.beneficios, ...f.equipo, ...f.consejos].filter((s) => /\d€|\dg\/|\dh\b|\dx\d/.test(s)).map((s) => `${k}: ${s}`);
    });
    expect(pegadas).toEqual([]);
  });

  // ─ 1385: el hábito ─

  test('1385 la guía atribuye la cifra del hábito (Lally et al., 2010) con su dispersión', async ({ page }) => {
    // Fuente: Lally, van Jaarsveld, Potts y Wardle, «How are habits formed», Eur J Soc Psychol
    // 2010;40(6):998-1009 (resumen en Crossref: 96 voluntarios, 12 semanas, «ranged from 18 to
    // 254 days»); los 66 días y que el ejercicio tardó más, en el resumen de la BPS.
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByText('Cómo crear el hábito deportivo')).toBeVisible();
    const t = await texto(page);
    expect(t).not.toContain('se consolida en 60-90 días');
    expect(t).not.toContain('21 días como se creía');
    expect(t).toContain('en torno a 66 días, con enormes diferencias entre personas: de 18 a 254 días');
    expect(t).toContain('Lally y colaboradores');
    expect(t).not.toMatch(/Lally[^.]*demostr/);
  });

  // ─ 1387: región ─

  test('1387 precios en euros: RegionBadge «Datos de referencia: España»', async ({ page }) => {
    await page.goto('/selector-ejercicio/');
    await esperarHidratacionBotones(page);
    await expect(page.getByText('Datos de referencia: España. La metodología es universal')).toHaveCount(1);
    await expect(page.locator('[role="note"][aria-label*="España"]')).toHaveCount(1);
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

  test('1384 en tema claro, los textos pequeños de marca llegan a 4,5:1', async ({ page }) => {
    // Medido antes de reparar: progresoPaso 3,93 · recomendacionPerfil 2,80 · statValor 4,11 ·
    // beneficiosTitulo 2,52 · equipoTitulo 3,63 · btnRepetir 3,93.
    await abrirTest(page);
    const medidos: Record<string, number> = { progresoPaso: await contraste(page, '[class*="progresoPaso"]') };
    await responder(page, RUNNING_LIMPIO);
    for (const c of TEXTOS_RESULTADO) medidos[c] = await contraste(page, `[class*="${c}"]`);
    expect(Object.entries(medidos).filter(([, v]) => v < 4.5)).toEqual([]);
  });

  test('en tema oscuro esos mismos textos siguen por encima de 4,5:1', async ({ page }) => {
    // Medido el 24/09/2026 antes de reparar: progresoPaso 6,23 · perfil 6,17 · statValor 4,93 ·
    // beneficios 6,75 · equipo 5,60 · repetir 6,23. En oscuro, los tokens -texto son los mismos
    // colores que --primary/--secondary, así que la reparación del claro no los mueve.
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

  test('los avisos nuevos (recorte y «a tener en cuenta») se leen en los dos temas', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 0, 1, 0, 1, 1, 0, 2, 1]);
    for (const c of ['avisoRecorteItem', 'aTenerItem', 'aTenerTitulo']) expect(await contraste(page, `[class*="${c}"]`), c).toBeGreaterThanOrEqual(4.5);
    await page.evaluate(() => localStorage.setItem('meskeia-theme', 'dark'));
    await abrirTest(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await responder(page, [0, 0, 0, 1, 0, 1, 1, 0, 2, 1]);
    for (const c of ['avisoRecorteItem', 'aTenerItem', 'aTenerTitulo']) expect(await contraste(page, `[class*="${c}"]`), `oscuro ${c}`).toBeGreaterThanOrEqual(4.5);
  });

  test('hero de resultados: --hero-bg sin degradado, con el blanco por encima de 4,5:1 (familia, forma b)', async ({ page }) => {
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    const hero = page.locator('[class*="heroResultados"]');
    expect(await hero.evaluate((e) => getComputedStyle(e).backgroundImage)).toBe('none');
    expect(await contraste(page, '[class*="heroSubtitleSm"]')).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="heroTitleSm"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('foco: al pulsar «Ver resultado» el foco va al encabezado del resultado (familia, forma g)', async ({ page }) => {
    await abrirTest(page);
    await responder(page, RUNNING_LIMPIO);
    await expect
      .poll(() => page.evaluate(() => `${document.activeElement?.tagName}:${document.activeElement?.textContent ?? ''}`))
      .toBe('H1:Tu ejercicio recomendado');
  });
});
