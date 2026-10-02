import { test, expect, devices, type Page } from '@playwright/test';
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

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 02/10/2026 — hermana de la familia «selectores» (referencia: selector-smartphone)
// ═════════════════════════════════════════════════════════════════════════════
//
// Invalidada por los lotes de CSS 586a4d61 (27/09) y a1d72a9c (28/09), que dieron 80 px arriba al
// `.hero` hasta 1.023 px. Lo que se comprobó que SÍ está bien: el <h1> de la intro y el de la
// pantalla de preguntas no quedan bajo la barra del logo a 360, 390, 800, 1.000 ni 1.024 px, en
// claro ni en oscuro; los 1.376.256 perfiles del motor siguen sin empates en silencio (276.594,
// todos anunciados); los límites declarados descartan con aviso.
//
// Hallazgos ABIERTOS que fija este bloque (con test.fail, afirman lo correcto):
//   · foco a <body> tras «Empezar», «Siguiente» y «Anterior» y, en móvil, la pregunta nueva fuera
//     de la vista (la forma del 1680 de smartphone, que aquí no llegó);
//   · radios sin flechas ni tabindex itinerante (la forma del 1681);
//   · el <h1> del RESULTADO bajo la barra del logo a 360 y 390 px (`.heroResultados` sin los 80 px);
//   · doble toque: en la pregunta 1 «Siguiente» saca de la app («Selector de Dieta», de las apps
//     relacionadas) y en la 3 contesta la 4 en silencio. La pregunta 1 tiene 7 opciones y la 3
//     solo 3: la tarjeta cambia de alto bajo el dedo (punto ciego de la familia: en la referencia
//     todas las preguntas tienen 4);
//   · «Menos de 30 minutos» admite natación y yoga con «sesiones de 30-60 min»;
//   · «Por puntos iba por delante» dicho de una apartada que EMPATABA a puntos;
//   · la prioridad «Bajo impacto» aparta el running, pero el HIIT de la ficha de casa sale sin el
//     aviso de saltos que sí lleva una limitación;
//   · la guía no está en el HTML servido y su recuadro «Consulta con un médico…» nace plegado;
//   · porcentajes pegados; «la principal causa de abandono y lesión» sin fuente.

/** ¿Pisa alguna pieza de la barra fija del logo las letras del elemento? (función de la Ronda) */
async function bajoLaBarra(page: Page, selector: string): Promise<{ tapado: boolean; top: number; bottom: number; barra: number }> {
  return page.evaluate((sel) => {
    const barra = [...document.querySelectorAll('body *')].find((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return cs.position === 'fixed' && r.top <= 1 && r.height < 120 && r.width > 300
        && !!e.querySelector('a[href="/"], a[href="https://meskeia.com/"]');
    });
    const el = document.querySelector(sel);
    if (!barra || !el) throw new Error(`sin barra (${!!barra}) o sin ${sel} (${!!el})`);
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const letras = [...rango.getClientRects()].filter((c) => c.width > 0);
    const piezas = [...barra.children].map((c) => c.getBoundingClientRect()).filter((c) => c.width > 0);
    return {
      tapado: piezas.some((p) => letras.some((c) =>
        !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom))),
      top: Math.round(el.getBoundingClientRect().top),
      bottom: Math.round(el.getBoundingClientRect().bottom),
      barra: Math.round(barra.getBoundingClientRect().bottom),
    };
  }, selector);
}

/** Deja el centro del botón a la altura pedida de la pantalla y devuelve ese punto. */
async function colocarBoton(page: Page, nombre: string | RegExp, donde: 'center' | 'end'): Promise<{ x: number; y: number }> {
  const boton = page.getByRole('button', { name: nombre });
  await boton.evaluate((e, blk) => e.scrollIntoView({ block: blk }), donde);
  const caja = (await boton.boundingBox())!;
  return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
}

async function responderTocando(page: Page, indices: readonly number[]): Promise<void> {
  for (let i = 0; i < indices.length; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} de 10`).first()).toBeVisible();
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).tap();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).tap();
  }
  await page.getByRole('heading', { name: 'Tu ejercicio recomendado' }).waitFor();
}

/** Un solo barrido de las 1.376.256 combinaciones para los tres recuentos de esta vuelta. */
let recuentos: { pocoConSesion30: number; porDelanteEmpatada: number; impactoSinAvisoSaltos: number } | null = null;
function recuentosReinspeccion() {
  if (recuentos) return recuentos;
  const cuenta = { pocoConSesion30: 0, porDelanteEmpatada: 0, impactoSinAvisoSaltos: 0 };
  const r: Record<string, string> = {};
  const rec = (i: number): void => {
    if (i === PREGUNTAS.length) {
      const res = calcularResultado(r);
      if (r.tiempo === 'poco' && EJERCICIOS[res.ejercicio].sesionMinima >= 30) cuenta.pocoConSesion30++;
      if (res.apartados.some((k) => res.puntos[k] === res.puntos[res.ejercicio])) cuenta.porDelanteEmpatada++;
      if (r.prioridad === 'impacto' && r.limitaciones === 'ninguna'
        && (res.ejercicio === 'entrenamiento-casa' || res.ejercicio === 'gimnasio')
        && !res.aTenerEnCuenta.some((t) => t.includes('sin saltos'))) cuenta.impactoSinAvisoSaltos++;
      return;
    }
    for (const o of PREGUNTAS[i].opciones) {
      r[PREGUNTAS[i].id] = o.valor;
      rec(i + 1);
    }
  };
  rec(0);
  recuentos = cuenta;
  return cuenta;
}

// Bienestar · 30-60 min · Con compañía · Instalación · Más de 60 € · Regular · Ninguna · Social ·
// Equipo · Diversión. Pesos (gim, run, nat, cic, yoga, casa), pregunta a pregunta:
//   1,2,2,2,3,2 + 2,3,2,2,3,3 + 2,2,1,2,2,1 + 3,0,3,1,2,0 + 3,2,3,3,3,2 + 2,2,2,2,2,2 +
//   3,3,3,3,3,3 + 2,2,1,2,2,0 + 2,1,1,1,2,0 + 1,2,2,3,2,1
//   = gimnasio 21 · running 19 · natación 20 · ciclismo 21 · yoga 24 · casa 14.
// Ningún filtro (sin limitación, fuera de casa, sin techo de cuota, ciclismo 60 ≤ 60 min): yoga solo.
const BIENESTAR_INSTALACION = [3, 1, 1, 2, 3, 1, 0, 3, 3, 2] as const;

// Mantener · MENOS DE 30 MIN · Con compañía · EN CASA · CERO EUROS · Regular · RODILLAS · Social ·
// Individual · Diversión. Pesos: 2,2,2,2,2,2 + 1,2,1,1,2,3 + 2,2,1,2,2,1 + 0,0,0,0,2,3 +
//   0,2,0,1,1,3 + 2,2,2,2,2,2 + 2,0,3,2,2,2 + 2,2,1,2,2,0 + 1,3,3,3,2,2 + 1,2,2,3,2,1
//   = gimnasio 13 · running 17 · natación 15 · ciclismo 18 · yoga 19 · casa 19.
// En casa solo caben yoga y casa, empatadas a 19: rodillas 2 = 2, mantener 2 = 2, presupuesto
// «Cero euros» casa 3 > yoga 1 → entrenamiento en casa, y el empate lo decide el presupuesto. Nada
// iba por delante de casa (ordenada primera), así que no hay aviso de recorte.
const LIMITE_CASA_CERO_RODILLAS = [5, 0, 1, 0, 0, 1, 1, 3, 2, 2] as const;

// Cardio · MENOS DE 30 MIN · Solo · Instalación · Más de 60 € · Muy buena · ESPALDA · Rutinas ·
// Individual · Bajo impacto = gimnasio 19 · running 19 · natación 27 · ciclismo 21 · yoga 22 ·
// casa 18. Con «Menos de 30 minutos» como límite ABIERTO solo caben sesiones que empiezan por
// debajo de 30 min: running (20, fuera por la espalda) y casa (20) → entrenamiento en casa.
const POCO_TIEMPO_NATACION = [2, 0, 0, 2, 3, 3, 2, 0, 2, 3] as const;

test.describe('re-inspección 02/10/2026 · escritorio', () => {
  test('caso normal: bienestar en instalación con más de 60 € → yoga o pilates, sin empate ni avisos', async ({ page }) => {
    await abrirTest(page);
    await responder(page, BIENESTAR_INSTALACION);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Yoga y Pilates');
    await expect(page.locator('[class*="statValor"]')).toHaveText([
      '3-5 días/semana, sesiones de 30-60 min',
      'Clases para principiantes presenciales o apps guiadas',
      'Gratis con apps o YouTube · 30-80 €/mes en estudio',
    ]);
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(page.locator('[class*="avisoRecorte"][role="note"]')).toHaveCount(0);
    await expect(page.locator('[class*="aTenerSection"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Tu ejercicio recomendado' })).toBeFocused();
  });

  test('la barra del logo no tapa el <h1> de la intro ni el de las preguntas (360-1.024 px, claro y oscuro), ni el del resultado desde 800 px', async ({ page }) => {
    test.setTimeout(90_000);
    // Lo que reparó el lote a1d72a9c en `.hero`, medido con la función de la Ronda. Medido el
    // 02/10/2026: h1 en y 80 (barra hasta 62-92) de 360 a 1.000 px; a 1.024, en y 48 sin pisarla.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-ejercicio/');
    await esperarHidratacionBotones(page);
    const anchos = [[360, 740], [390, 844], [800, 1112], [1000, 800], [1024, 768]] as const;
    for (const tema of ['claro', 'oscuro'] as const) {
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Repetir el test' }).click();
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      for (const [ancho, alto] of anchos) {
        await page.setViewportSize({ width: ancho, height: alto });
        await page.evaluate(() => window.scrollTo(0, 0));
        expect((await bajoLaBarra(page, 'h1')).tapado, `intro, ${ancho} px, ${tema}`).toBe(false);
      }
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.getByRole('button', { name: /Empezar el test/ }).click();
      for (const [ancho, alto] of anchos) {
        await page.setViewportSize({ width: ancho, height: alto });
        await page.evaluate(() => window.scrollTo(0, 0));
        expect((await bajoLaBarra(page, 'h1')).tapado, `pregunta 1, ${ancho} px, ${tema}`).toBe(false);
      }
      await page.setViewportSize({ width: 1280, height: 900 });
      await responder(page, BIENESTAR_INSTALACION);
      for (const [ancho, alto] of anchos.slice(2)) {
        await page.setViewportSize({ width: ancho, height: alto });
        await page.evaluate(() => window.scrollTo(0, 0));
        expect((await bajoLaBarra(page, 'h1')).tapado, `resultado, ${ancho} px, ${tema}`).toBe(false);
      }
      await page.setViewportSize({ width: 1280, height: 900 });
    }
  });

  test('HALLAZGO: con teclado, tras «Empezar», «Siguiente» y «Anterior» el foco no cae a <body> ni el Tab sale del cuestionario', async ({ page }) => {
    // ABIERTO (02/10/2026). La forma del 1680 de smartphone: el botón que tenía el foco se desmonta
    // («Empezar») o se desactiva («Siguiente» ante una pregunta sin responder, «Anterior» en la 1),
    // y el foco cae a <body>. Medido: tras Enter en «Siguiente», el Tab siguiente va a «Zonas de
    // Entrenamiento», la primera de las apps relacionadas, DESPUÉS del cuestionario. La referencia
    // lleva el foco al <h2 tabIndex=-1> del enunciado.
    test.fail();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-ejercicio/');
    await esperarHidratacionBotones(page);
    const caidas: string[] = [];
    const enBody = () => page.evaluate(() => document.activeElement === document.body);
    await page.getByRole('button', { name: /Empezar el test/ }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    if (await enBody()) caidas.push('Empezar');
    await page.locator('[role="radio"]').nth(2).focus();
    await page.keyboard.press('Space');
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 2 de 10').first().waitFor();
    if (await enBody()) caidas.push('Siguiente');
    await page.keyboard.press('Tab');
    if (!(await page.evaluate(() => !!document.activeElement?.closest('[class*="testContainer"]')))) caidas.push('el Tab sale del cuestionario');
    await page.getByRole('button', { name: 'Pregunta anterior' }).focus();
    await page.keyboard.press('Enter');
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    if (await enBody()) caidas.push('Anterior');
    expect(caidas).toEqual([]);
  });

  test('HALLAZGO: los radios siguen el patrón APG — una parada de Tab y las flechas mueven y marcan', async ({ page }) => {
    // ABIERTO (02/10/2026). La forma del 1681 de smartphone. Medido en la pregunta 1: 7 radios con
    // tabindex 0 (7 paradas de Tab) y ArrowDown no mueve el foco ni marca nada.
    test.fail();
    await abrirTest(page);
    const radios = page.locator('[role="radiogroup"] [role="radio"]');
    expect(await radios.evaluateAll((els) => els.filter((e) => (e as HTMLElement).tabIndex === 0).length)).toBe(1);
    await radios.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(radios.nth(1)).toBeFocused({ timeout: 1_000 });
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 });
  });

  test('HALLAZGO: con «Menos de 30 minutos» no se recomienda la natación de «sesiones de 30-60 min»', async ({ page }) => {
    // ABIERTO (02/10/2026). El techo de «Menos de 30 minutos» es 30 y el filtro descarta solo si la
    // sesión mínima lo SUPERA, así que 30 cabe en «menos de 30». Hoy sale «Natación» con
    // «Frecuencia: 3-4 días/semana, sesiones de 30-60 min» a quien acaba de declarar menos de 30.
    // El FAQPage promete lo contrario: «aparta las actividades cuya sesión habitual es más larga».
    test.fail();
    await abrirTest(page);
    await responder(page, POCO_TIEMPO_NATACION);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Entrenamiento en Casa', { timeout: 1_000 });
  });

  test('HALLAZGO (motor): con «Menos de 30 minutos», ninguna recomendada empieza en sesiones de 30 min', () => {
    // ABIERTO (02/10/2026). Barrido del 02/10/2026: 219.232 de los 344.064 perfiles con «Menos de
    // 30 minutos» (63,7 %) reciben yoga o pilates (170.441) o natación (48.791), las dos con
    // «sesiones de 30-60 min».
    test.fail();
    test.setTimeout(240_000);
    expect(recuentosReinspeccion().pocoConSesion30).toBe(0);
  });

  test('HALLAZGO: «Por puntos iba por delante» no se dice de una apartada que empataba a puntos', async ({ page }) => {
    // ABIERTO (02/10/2026). Perder peso · <30 min · Solo · En casa · 0 € · Regular · Ninguna ·
    // Social · Individual · Diversión: running 3+2+3+0+2+2+3+2+3+2 = 22 y casa 2+3+3+3+3+2+3+0+2+1
    // = 22. El running va antes solo por el desempate (perder peso 3 > 2) y se aparta por «En
    // casa»; la pantalla dice que iba por delante POR PUNTOS. En el barrido: 66.157 perfiles.
    test.fail();
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 0, 1, 0, 3, 2, 2]);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Entrenamiento en Casa');
    const aviso = page.locator('[class*="avisoRecorteItem"]');
    await expect(aviso).toContainText('el running');
    await expect(aviso).not.toContainText('Por puntos iba por delante el running', { timeout: 1_000 });
  });

  test('HALLAZGO (motor): ningún aviso «Por puntos iba por delante» habla de una apartada con los mismos puntos', () => {
    test.fail();
    test.setTimeout(240_000);
    expect(recuentosReinspeccion().porDelanteEmpatada).toBe(0); // hoy 66.157
  });

  test('HALLAZGO: con la prioridad «Bajo impacto», el entrenamiento en casa avisa de los saltos del HIIT', async ({ page }) => {
    // ABIERTO (02/10/2026). Perder peso · <30 min · Solo · En casa · 0 € · Muy sedentario · Ninguna ·
    // Rutinas · Ninguna rutina · BAJO IMPACTO = gimnasio 16 · running 18 · natación 18 · ciclismo
    // 18 · yoga 22 · casa 27 → casa. La prioridad aparta el running por impacto (pideBajoImpacto),
    // pero el aviso «elige ejercicios sin saltos ni impactos: muchas rutinas de HIIT los incluyen»
    // solo sale con una LIMITACIÓN; aquí la ficha recomienda el HIIT sin más. 19.892 perfiles.
    test.fail();
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 0, 0, 0, 3]);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Entrenamiento en Casa');
    await expect(page.locator('[class*="consejoItem"]').filter({ hasText: 'HIIT' })).toHaveCount(1);
    await expect(page.locator('[class*="aTenerItem"]').filter({ hasText: 'sin saltos ni impactos' })).toHaveCount(1, { timeout: 1_000 });
  });

  test('HALLAZGO (motor): con la prioridad «Bajo impacto» y sin limitación, casa o gimnasio llevan el aviso de saltos', () => {
    test.fail();
    test.setTimeout(240_000);
    expect(recuentosReinspeccion().impactoSinAvisoSaltos).toBe(0); // hoy 19.892
  });

  test('HALLAZGO: la guía educativa está en el HTML servido', async ({ request }) => {
    // ABIERTO (02/10/2026). EducationalSection monta SIEMPRE su contenido para el rastreador, pero
    // aquí va dentro de `pantalla === 'resultado'`: el HTML servido no lleva ni una línea de la guía.
    test.fail();
    const html = await (await request.get('/selector-ejercicio/')).text();
    expect(html).toContain('Cómo crear el hábito deportivo');
  });

  test('HALLAZGO: el recuadro «Consulta con un médico antes de iniciar ejercicio si:» se ve sin desplegar la guía', async ({ page }) => {
    // ABIERTO (02/10/2026). La lista de señales (dolor en el pecho, mareos, hipertensión, más de
    // 45 años sin ejercicio…) solo vive dentro de la guía plegada, y el test no pregunta por ninguna
    // de ellas. CLAUDE.md: nunca ocultar un aviso de responsabilidad dentro de <EducationalSection>.
    test.fail();
    await abrirTest(page);
    await responder(page, BIENESTAR_INSTALACION);
    await expect(page.getByText('Consulta con un médico antes de iniciar ejercicio si:')).toBeVisible({ timeout: 1_000 });
  });

  test('HALLAZGO: porcentajes con espacio duro, en fichas, guía y JSON-LD', async ({ page, request }) => {
    // ABIERTO (02/10/2026). Hoy pegados: «no subas más del 10% de carga» (gimnasio), «El 80% de tu
    // entrenamiento» (running), «al 70% de tu capacidad» y «al 100% una vez» (guía) y «100% en el
    // navegador» (featureList). La regla del 25/09/2026: «15 %» con U+00A0.
    test.fail();
    const fichas = CLAVES.flatMap((k) => {
      const f = EJERCICIOS[k];
      return [f.frecuencia, f.inicio, f.coste, f.descripcion, ...f.beneficios, ...f.equipo, ...f.consejos];
    });
    const html = await (await request.get('/selector-ejercicio/')).text();
    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    await abrirTest(page);
    await responder(page, BIENESTAR_INSTALACION);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
    const pegados = [...fichas, ...jsonLd, guia].flatMap((s) => [...s.matchAll(/.{0,15}\d%/g)].map((m) => m[0]));
    expect(pegados).toEqual([]);
  });

  test('HALLAZGO: la guía no da la sobreexigencia como «la principal causa de abandono y lesión» sin fuente', async ({ page }) => {
    // ABIERTO (02/10/2026). La propia ficha de running cita a Saragiotto et al. (2014): el factor
    // de riesgo que más se repite es una lesión en los 12 meses previos, y a Correia et al. (2024):
    // causas múltiples. La guía afirma una causa principal distinta, sin fuente.
    test.fail();
    await abrirTest(page);
    await responder(page, BIENESTAR_INSTALACION);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('[class*="resultadosContainer"]')).not.toContainText('la principal causa de abandono y lesión', { timeout: 1_000 });
  });
});

test.describe('re-inspección 02/10/2026 · móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  async function abrirMovil(page: Page): Promise<void> {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-ejercicio/');
    await esperarHidratacionBotones(page);
  }

  test('caso límite con toques: en casa, cero euros, menos de 30 min y rodillas → entrenamiento en casa por el presupuesto', async ({ page }) => {
    test.setTimeout(60_000);
    await abrirMovil(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    await responderTocando(page, LIMITE_CASA_CERO_RODILLAS);
    await expect(page.locator('[class*="recomendacionValor"]')).toHaveText('Entrenamiento en Casa');
    await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
      'Empate: con tus respuestas, el entrenamiento en casa y el yoga o el pilates encajan exactamente igual; se muestra primero el entrenamiento en casa porque encaja mejor con el presupuesto que has indicado.',
    );
    await expect(page.locator('[class*="avisoRecorte"][role="note"]')).toHaveCount(0);
    await expect(page.locator('[class*="aTenerItem"]')).toHaveText([
      'Has indicado «Problemas de rodillas o piernas»: antes de empezar, consulta con un fisioterapeuta o un médico deportivo qué ejercicios te convienen, y deja los que te causen dolor.',
      'Con esa limitación, elige ejercicios sin saltos ni impactos: muchas rutinas de HIIT los incluyen.',
    ]);
    await expect(page.locator('[class*="statValor"]').first()).toHaveText('4-5 días/semana, sesiones de 20-45 min');
    await expect(page.getByRole('heading', { name: 'Tu ejercicio recomendado' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test('rechazo: tocar «Siguiente» sin responder no avanza', async ({ page }) => {
    await abrirMovil(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
    const punto = await colocarBoton(page, 'Siguiente pregunta', 'center');
    await page.touchscreen.tap(punto.x, punto.y);
    await page.waitForTimeout(300);
    await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
  });

  test('HALLAZGO: el <h1> del resultado no queda bajo la barra del logo a 360 ni a 390 px', async ({ page }) => {
    // ABIERTO (02/10/2026). Los lotes dieron 80 px a `.hero`, no a `.heroResultados` (2rem). Medido
    // a 360 px, claro y oscuro: píldora del logo [15, 10, 141, 52] sobre las letras [45, 31, 315, 61].
    test.fail();
    test.setTimeout(60_000);
    await abrirMovil(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    await responderTocando(page, LIMITE_CASA_CERO_RODILLAS);
    const a360 = await bajoLaBarra(page, 'h1');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const a390 = await bajoLaBarra(page, 'h1');
    expect({ a360: a360.tapado, a390: a390.tapado }).toEqual({ a360: false, a390: false });
  });

  test('HALLAZGO: un doble toque en «Siguiente» de la pregunta 1 no saca de la app', async ({ page }) => {
    // ABIERTO (02/10/2026). La pregunta 1 tiene 7 opciones y la 2, cuatro: al pasar, la tarjeta
    // encoge y el segundo toque cae en «Selector de Dieta» (apps relacionadas). Medido con el botón
    // a cualquier altura entre 80 y 680 px a 360 px (240-800 a 390), con 60, 150 y 300 ms: se
    // navega a /selector-dieta/ y se pierde lo respondido.
    test.fail();
    await abrirMovil(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
    await page.locator('[role="radio"]').last().tap();
    const punto = await colocarBoton(page, 'Siguiente pregunta', 'center');
    await page.touchscreen.tap(punto.x, punto.y);
    await page.waitForTimeout(150);
    await page.touchscreen.tap(punto.x, punto.y);
    await page.waitForTimeout(800);
    expect(new URL(page.url()).pathname).toBe('/selector-ejercicio/');
    await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible({ timeout: 1_000 });
  });

  test('HALLAZGO: un doble toque en «Siguiente» de la pregunta 3 no contesta la 4', async ({ page }) => {
    // ABIERTO (02/10/2026). La 3 tiene 3 opciones y la 4, cuatro: con el botón al pie de la
    // pantalla, el segundo toque marca «Donde sea, lo que importe es moverme» (+2 a todas).
    // Lo mismo con «Empezar el test» tocado al pie (y ≈ 680): marca «Ganar flexibilidad y movilidad».
    test.fail();
    await abrirMovil(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    for (const n of [1, 2]) {
      await expect(page.getByText(`Pregunta ${n} de 10`).first()).toBeVisible();
      await page.locator('[role="radio"]').last().tap();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).tap();
    }
    await expect(page.getByText('Pregunta 3 de 10').first()).toBeVisible();
    await page.locator('[role="radio"]').last().tap();
    const punto = await colocarBoton(page, 'Siguiente pregunta', 'end');
    await page.touchscreen.tap(punto.x, punto.y);
    await page.waitForTimeout(150);
    await page.touchscreen.tap(punto.x, punto.y);
    await page.waitForTimeout(400);
    await expect(page.getByText('Pregunta 4 de 10').first()).toBeVisible();
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0, { timeout: 1_000 });
  });
});

test.describe('re-inspección 02/10/2026 · móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('HALLAZGO: tras tocar «Siguiente» a media pantalla, el enunciado de la pregunta nueva queda a la vista y bajo la barra', async ({ page }) => {
    // ABIERTO (02/10/2026). Nada lleva el foco ni el desplazamiento a la pregunta nueva: la página
    // se queda donde estaba el botón. Medido a 390 px: el enunciado de la 2 en y −317/−379 (fuera,
    // por encima; en pantalla, «Siguiente» desactivado y las apps relacionadas), y los de la 3, la 8
    // y la 10 asomando bajo la píldora del logo. Correcto: el enunciado entero entre la barra
    // (hasta y 62) y el pie de la pantalla.
    test.fail();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-ejercicio/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    const fuera: string[] = [];
    for (let i = 1; i <= 3; i++) {
      await expect(page.getByText(`Pregunta ${i} de 10`).first()).toBeVisible();
      await page.locator('[role="radio"]').last().tap();
      const punto = await colocarBoton(page, 'Siguiente pregunta', 'center');
      await page.touchscreen.tap(punto.x, punto.y);
      await expect(page.getByText(`Pregunta ${i + 1} de 10`).first()).toBeVisible();
      await page.waitForTimeout(150);
      const m = await bajoLaBarra(page, 'h2[class*="preguntaTexto"]');
      if (m.tapado || m.top < m.barra || m.bottom > 844) fuera.push(`P${i + 1}: enunciado en y ${m.top}-${m.bottom}, barra hasta ${m.barra}`);
    }
    expect(fuera).toEqual([]);
  });
});
