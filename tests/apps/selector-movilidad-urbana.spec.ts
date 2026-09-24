import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, COSTE_MENSUAL_MINIMO, PREGUNTAS, type TipoTransporte } from '../../app/selector-movilidad-urbana/motor';

/**
 * Selector de Movilidad Urbana (selector-movilidad-urbana) — reparado el 24/09/2026 desde una
 * sospecha del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra, en cambio, estaba BIEN: anuncia porcentaje (0-100) con valuenow = el mismo
 *     porcentaje que pinta. No se ha tocado; el caso de abajo lo fija para que siga así.
 *   · Empates: `reduce` que partía de «combinación» y solo cambiaba con `>` estricto → a
 *     igualdad ganaba la combinación multimodal y, sin ella, el coche. Enumerado: 8.673 de
 *     78.732 perfiles empatan en cabeza, y en 5.033 cambia el ganador.
 *   · Razones fijas: la descripción del transporte público decía «Vives en una ciudad bien
 *     comunicada, tus horarios son regulares…» también a quien había marcado red «Deficiente o
 *     inexistente» u horarios nocturnos (12.911 perfiles).
 *
 * EL MOTOR (app/selector-movilidad-urbana/motor.ts): las mismas preguntas y pesos (sin empate,
 * el ganador no cambia en ninguna combinación). A igualdad, primero la movilidad física
 * (pregunta 10), luego la distancia (1) y por último el menor coste mensual; el empate se
 * anuncia. Las descripciones hablan del medio y las razones citan las respuestas.
 */

async function abrirTest(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-movilidad-urbana/');
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
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver mi resultado' : 'Siguiente pregunta' }).click();
  }
  await page.locator('[class*="resultadoTitulo"]').waitFor();
  return (await page.locator('[class*="resultadoCard"]').innerText()).replace(/\s+/g, ' ');
}

// Menos de 5 km · Red muy completa · Bultos habitualmente · Horarios irregulares con frecuencia
// · Coste importante pero asumible · Aparcamiento gratuito · Seguridad: poco · Clima moderado ·
// Sostenibilidad fundamental · En buena forma física.
// (coche, transporte público, moto, bici, combinación), pregunta a pregunta:
//   P1 bici 3, TP 2, comb 1 · P2 TP 4, comb 2 · P3 coche 4 · P4 coche 3, moto 2 ·
//   P5 TP 2, moto 2, bici 1, comb 2 · P6 coche 3, moto 1 · P7 moto 2, bici 2, comb 2 ·
//   P8 comb 3, TP 1, moto 1 · P9 bici 4, TP 3, comb 1 · P10 bici 3, moto 2, comb 2, TP 1
//   = coche 10 · TP 13 · moto 10 · bici 13 · combinación 13.
// Triple empate a 13; la movilidad física da bici 3 > combinación 2 > TP 1.
// Antes: combinación multimodal, por ser el valor inicial del reduce.
const EMPATE = [0, 0, 0, 0, 1, 0, 2, 1, 0, 2] as const;

// Menos de 5 km · Red DEFICIENTE · Bultos habitualmente · Horarios irregulares con frecuencia ·
// Coste crítico · Aparcamiento con coste notable · Seguridad: mucho · Clima moderado ·
// Sostenibilidad fundamental · Buena forma.
//   coche 3+4+3+1+2 = 13 · TP 2+4+3+1+3+1 = 14 · bici 3+3+4+3 = 13. Gana el transporte
//   público, y antes se le decía «Vives en una ciudad bien comunicada, tus horarios son
//   regulares» a quien había respondido lo contrario de las dos cosas.
const TP_SIN_RED = [0, 2, 0, 0, 0, 1, 0, 1, 0, 2] as const;

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
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo((paso + 1) / 10, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('un empate se anuncia y lo deshace la movilidad física, no el valor inicial del reduce', async ({ page }) => {
  await abrirTest(page);
  await responder(page, EMPATE);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Bicicleta o Patinete Eléctrico');
  await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
    'la bici o el patinete eléctrico, la combinación multimodal y el transporte público encajan exactamente igual; se muestra primero la bici o el patinete eléctrico porque responde mejor a lo que has indicado sobre tu movilidad física',
  );
});

test('las razones salen de las respuestas: con red deficiente no se lee «ciudad bien comunicada»', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, TP_SIN_RED);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Transporte Público');
  await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
  expect(texto).not.toContain('Vives en una ciudad bien comunicada');
  expect(texto).not.toContain('tus horarios son regulares');
  expect(texto).not.toContain('Red amplia y frecuente en tu zona');
  expect(texto).toContain('Coste mensual: has respondido «Crítica, quiero el mínimo gasto posible», que suma 4 puntos al transporte público.');
  expect(texto).toContain('Seguridad vial: has respondido «Mucho, es una prioridad para mí», que suma 3 puntos al transporte público.');
  expect(texto).toContain('Sostenibilidad: has respondido «Sí, es fundamental para mí», que suma 3 puntos al transporte público.');
});

test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  const DESEMPATE = [
    { indice: 9, frase: 'responde mejor a lo que has indicado sobre tu movilidad física' },
    { indice: 0, frase: 'encaja mejor con la distancia de tu trayecto' },
  ];
  const r: number[] = [];
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  const peso = (i: number, k: TipoTransporte) => PREGUNTAS[i].opciones[r[i]].pesos[k] ?? 0;
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const max = Math.max(...CLAVES.map((k) => res.puntos[k]));
      if (res.puntos[res.tipo] !== max) mal('no tiene la puntuación máxima');
      const reales = CLAVES.filter((k) => k !== res.tipo && res.puntos[k] === max);
      if (reales.length !== res.empatados.length) mal('empatados mal contados');
      if (reales.length === 0 && res.criterioDesempate !== '') mal('criterio sin empate');
      if (reales.length > 0) empates++;
      for (const k of reales) {
        const decide = DESEMPATE.find(({ indice }) => peso(indice, res.tipo) !== peso(indice, k));
        if (decide) {
          if (peso(decide.indice, res.tipo) < peso(decide.indice, k)) mal(`pierde contra ${k}`);
          if (!res.criterioDesempate.includes(decide.frase)) mal('no nombra el criterio que decide');
        } else {
          if (COSTE_MENSUAL_MINIMO[res.tipo] > COSTE_MENSUAL_MINIMO[k]) mal(`más caro que ${k}`);
          if (!res.criterioDesempate.includes('coste mensual es el más bajo')) mal('no nombra el coste');
        }
      }
      for (const razon of res.razones) {
        const citada = razon.match(/«([^»]+)»/)?.[1];
        if (!PREGUNTAS.some((p, j) => p.opciones[r[j]].texto === citada)) mal(`cita «${citada}», no respondida`);
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
  expect(total).toBe(78_732);
  expect(empates).toBe(8_673);
});
