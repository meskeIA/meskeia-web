import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, ORDEN_PRIMA, PREGUNTAS, type Modalidad } from '../../app/selector-seguro-coche/motor';

/**
 * ¿Qué seguro de coche necesitas? (selector-seguro-coche) — reparado el 24/09/2026 desde una
 * sospecha del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra estaba BIEN: anuncia el mismo porcentaje (0-100) que pinta. No se ha tocado.
 *   · Empates: `reduce` con `>` estricto → a igualdad se quedaba la primera modalidad del
 *     objeto, terceros básico, la de MENOS cobertura. Enumerado: 12.580 de 93.312 perfiles
 *     empatan en cabeza, y en 5.359 cambia la recomendación. Entre ellos, el de abajo: un coche
 *     de menos de dos años y más de 25.000 € recibía «terceros básico».
 *   · Razones fijas: la app no da un «por qué» personal; la descripción y las coberturas son de
 *     la modalidad, no del usuario. Nada que reparar ahí.
 *
 * EL MOTOR (app/selector-seguro-coche/motor.ts): las mismas preguntas y pesos (sin empate, la
 * recomendación no cambia en ninguna combinación). A igualdad, primero la capacidad de pagar
 * una reparación de tu bolsillo (pregunta 9), luego el valor del coche (2) y por último la
 * prima más baja; el empate se anuncia.
 */

async function abrirTest(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-seguro-coche/');
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

async function responder(page: Page, indices: readonly number[]): Promise<void> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Ir a la siguiente pregunta' }).click();
  }
  await page.locator('[class*="resultadoTitulo"]').waitFor();
}

// Menos de 2 años · Más de 25.000 € · Sin financiar · Más de 5 años conduciendo · Sin
// siniestros · Uso ocasional · Ciudad · Garaje siempre · «Podría asumir parte» · Sin jóvenes.
// (básico, ampliado, TR con franquicia, TR sin franquicia), pregunta a pregunta:
//   P1 TRsf 3 · P2 TRsf 3 · P3 bás 1, amp 1, TRf 1 · P4 bás 1, amp 1 · P5 bás 1, amp 1 ·
//   P6 bás 2, amp 1 · P7 TRf 2, TRsf 1 · P8 bás 1, amp 1 · P9 TRf 3 · P10 bás 1, amp 1
//   = básico 7 · ampliado 6 · TR con franquicia 6 · TR sin franquicia 7.
// Empate a 7. La pregunta 9 no los separa (0 y 0); el valor del coche sí (TRsf 3, básico 0).
// Antes: terceros básico para un coche casi nuevo de más de 25.000 €, por ir primero.
const COCHE_NUEVO = [0, 0, 1, 2, 0, 0, 0, 0, 1, 2] as const;

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

test('la barra de progreso anuncia lo mismo que pinta (ya lo hacía; que no se estropee)', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  for (let paso = 0; paso < 3; paso++) {
    const [ahora, min, max] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
    );
    const anunciado = (ahora - min) / (max - min);
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo(paso / 10, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Ir a la siguiente pregunta' }).click();
  }
});

test('un empate se anuncia, y un coche casi nuevo de más de 25.000 € no recibe «terceros básico» por ir primero', async ({ page }) => {
  await abrirTest(page);
  await responder(page, COCHE_NUEVO);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Todo Riesgo sin Franquicia');
  await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
    'el todo riesgo sin franquicia y el seguro a terceros básico encajan exactamente igual; se muestra primero el todo riesgo sin franquicia porque encaja mejor con el valor de tu coche',
  );
});

test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  const DESEMPATE = [
    { indice: 8, frase: 'pagar una reparación de tu bolsillo' },
    { indice: 1, frase: 'el valor de tu coche' },
  ];
  const r: number[] = [];
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  const peso = (i: number, k: Modalidad) => PREGUNTAS[i].opciones[r[i]].pesos[k] ?? 0;
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const max = Math.max(...CLAVES.map((k) => res.puntos[k]));
      if (res.puntos[res.modalidad] !== max) mal('no tiene la puntuación máxima');
      const reales = CLAVES.filter((k) => k !== res.modalidad && res.puntos[k] === max);
      if (reales.length !== res.empatadas.length) mal('empatadas mal contadas');
      if (reales.length === 0 && res.criterioDesempate !== '') mal('criterio sin empate');
      if (reales.length > 0) empates++;
      for (const k of reales) {
        const decide = DESEMPATE.find(({ indice }) => peso(indice, res.modalidad) !== peso(indice, k));
        if (decide) {
          if (peso(decide.indice, res.modalidad) < peso(decide.indice, k)) mal(`pierde contra ${k}`);
          if (!res.criterioDesempate.includes(decide.frase)) mal('no nombra el criterio que decide');
        } else {
          if (ORDEN_PRIMA[res.modalidad] > ORDEN_PRIMA[k]) mal(`prima mayor que ${k}`);
          if (!res.criterioDesempate.includes('prima más baja')) mal('no nombra la prima');
        }
      }
      return;
    }
    for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
      r[i] = k;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(total).toBe(93_312);
  expect(empates).toBe(12_580);
});
