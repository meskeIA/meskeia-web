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
