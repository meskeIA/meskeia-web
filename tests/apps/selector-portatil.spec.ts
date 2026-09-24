import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, PREGUNTAS } from '../../app/selector-portatil/motor';

/**
 * Asesor de Portátil (selector-portatil) — reparado el 24/09/2026 desde una sospecha del
 * Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342, repetidos aquí).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1, y pintaba paso / 10: en la
 *     pregunta 2 anunciaba 0,111 y pintaba 0,100.
 *   · Empate de formato: con «A veces» fuera de casa y pantalla «Grande», portátil y
 *     sobremesa empatan a 2 y ganaba el portátil por ir primero en el array, sin decirlo
 *     (27.648 de los 331.776 perfiles).
 *   · Razones fijas por resultado: en 5.184 perfiles salía Mac a quien había respondido «No,
 *     ninguno» dispositivo Apple (por «Suite Adobe» + «Programación»), y la app le decía «Con
 *     tu ecosistema Apple ya establecido…»; y a cualquier gama alta o pro, «Tu uso intensivo o
 *     creativo justifica…», aunque la hubiera subido solo el presupuesto.
 *
 * EL MOTOR (app/selector-portatil/motor.ts): las mismas preguntas, pesos y reglas de formato,
 * sistema y gama (comprobado sobre las 331.776 combinaciones: formato, sistema, gama y modelos
 * idénticos a los de antes). Lo que cambia: el empate de formato se anuncia y lo decide la
 * pregunta de movilidad; las razones citan lo respondido y dicen cuándo manda el presupuesto.
 */

async function esperarHidratacionBotones(page: Page): Promise<void> {
  // Sin <input> no hay rastreador que sondear (`_hidratacion.ts`): el testigo es que React
  // haya colgado sus props del botón de inicio. Mismo criterio que selector-smartphone.
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
  await page.goto('/selector-portatil/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu ordenador ideal' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Uso básico · No juego · A VECES fuera de casa · Pantalla GRANDE · Ecosistema Apple ·
// Solo Windows · < 3 h · 2 – 3 años · Hasta 600 € · Reacondicionado sí.
//   Formato: «A veces» portátil +2 · «Grande» sobremesa +2 → empate a 2; la pregunta de
//   movilidad da 2 al portátil y 0 al sobremesa. Sistema: Apple +3, solo Windows −3 → Windows.
//   Gama: solo el presupuesto, −3 → de entrada.
const EMPATE_FORMATO = [0, 0, 1, 2, 0, 0, 0, 0, 0, 0] as const;

// Programación · No juego · A diario · Compacto · NINGÚN dispositivo Apple · Suite Adobe ·
// < 3 h · 2 – 3 años · 600 – 1.100 € · Reacondicionado sí.
//   Mac: Adobe +2, programación +1 = 3 → macOS. Antes: «Con tu ecosistema Apple ya
//   establecido…». Gama: programación +2 → media.
const MAC_SIN_APPLE = [3, 0, 0, 0, 2, 1, 0, 0, 1, 0] as const;

// Uso básico · No juego · Siempre en casa · Me da igual · Ningún Apple · Sin requisitos ·
// < 3 h · 2 – 3 años · MÁS DE 1.800 € · Prefiero nuevo.
//   Gama por uso: 0 → de entrada; el tramo «Más de 1.800 €» la sube a pro. Antes: «Tu uso
//   intensivo o creativo justifica invertir…», a quien acababa de responder uso básico.
const PRO_POR_PRESUPUESTO = [0, 0, 2, 3, 2, 3, 0, 0, 3, 2] as const;

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(3).click();
  await expect(grupo.locator('[role="radio"]').nth(3)).toHaveAttribute('aria-checked', 'true');
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

test('el empate de formato se anuncia y lo decide la pregunta de movilidad', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, EMPATE_FORMATO);
  await expect(page.locator('[class*="recomendacionValor"]').first()).toHaveText('Portátil');
  await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
    'el portátil y el sobremesa con monitor encajan exactamente igual; se muestra primero el portátil porque encaja mejor con lo que has dicho sobre llevarte el ordenador fuera de casa',
  );
  expect(texto).toContain('Formato — Portátil, por lo que has respondido: movilidad, «A veces» (+2).');
  expect(texto).toContain('Sistema — Windows: necesitas software que solo existe para Windows.');
});

test('las razones salen de las respuestas: sin un solo Apple no se habla de «tu ecosistema Apple»', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, MAC_SIN_APPLE);
  await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('macOS (Apple)');
  expect(texto).not.toContain('ecosistema Apple ya establecido');
  expect(texto).toContain(
    'Sistema — macOS, por lo que has respondido: software que necesitas, «Suite Adobe principalmente» (+2); uso principal, «Programación o ciencia de datos» (+1).',
  );
  expect(texto).toContain('Gama — media, por lo que has respondido: uso principal, «Programación o ciencia de datos» (+2).');
});

test('si la gama la sube el presupuesto, se dice: no se atribuye un uso intensivo', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, PRO_POR_PRESUPUESTO);
  await expect(page.locator('[class*="recomendacionValor"]').nth(2)).toHaveText('Workstation / Pro');
  expect(texto).not.toContain('Tu uso intensivo o creativo justifica');
  expect(texto).toContain('Gama — workstation o pro: con tu uso bastaría la gama de entrada; el salto responde a tu presupuesto de más de 1.800 €');
});

test('motor: ningún empate de formato en silencio, y ninguna razón cita algo no respondido', () => {
  test.setTimeout(120_000);
  const ops = PREGUNTAS.map((p) => p.opciones);
  const r: Record<number, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === ops.length) {
      total++;
      const res = calcularResultado(r);
      if (res.formatosEmpatados.length > 0) {
        empates++;
        if (!res.criterioDesempate.includes('encaja mejor con')) mal(`empate sin criterio: ${res.criterioDesempate}`);
      } else if (res.criterioDesempate !== '') {
        mal('criterio sin empate');
      }
      if (res.os === 'mac' && r[5] === 'no' && res.razones.some((x) => x.includes('ecosistema'))) mal('habla de ecosistema sin Apple');
      for (const razon of res.razones) {
        for (const m of razon.matchAll(/«([^»]+)»/g)) {
          if (!PREGUNTAS.some((p) => p.opciones.some((o) => o.etiqueta === m[1] && r[p.id] === o.valor))) mal(`cita «${m[1]}», no respondida`);
        }
      }
      return;
    }
    for (const o of ops[i]) {
      r[PREGUNTAS[i].id] = o.valor;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(total).toBe(331_776);
  expect(empates).toBe(27_648);
});
