import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, PREGUNTAS, UMBRAL } from '../../app/selector-alquiler-vs-compra/motor';

/**
 * ¿Alquilar o comprar? (selector-alquiler-vs-compra) — reparado el 24/09/2026 desde una
 * sospecha del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra pintaba (paso + 1) / 10 y anunciaba aria-valuenow = paso + 1 con MÍNIMO 1: en
 *     la pregunta 1, un décimo de barra pintado y 0 % anunciado; en la 2, 0,2 frente a 0,111.
 *   · No hay empates que deshacer: es UNA puntuación contra dos umbrales (±8).
 *   · Razones fijas por veredicto: en 33.798 perfiles salía «comprar» con «Contrato temporal o
 *     en transición» o «Autónomo reciente», y la app decía «Tu estabilidad laboral y
 *     permanencia prevista justifican la inversión».
 *
 * EL MOTOR (app/selector-alquiler-vs-compra/motor.ts): mismas preguntas, puntos y umbrales
 * (el veredicto no cambia en ninguna de las 1.048.576 combinaciones). Las razones citan las
 * respuestas que más empujan hacia el veredicto y, aparte, las que empujan en contra, con la
 * puntuación y los umbrales a la vista.
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
  await page.goto('/selector-alquiler-vs-compra/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu resultado' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Indefinidamente (+4) · Contrato TEMPORAL (−3) · Más del 30 % (+4) · Muy improbable
// cambiar de ciudad (+3) · Con hijos (+3) · Compra más razonable (+3) · Hipoteca como
// instrumento (+3) · Sin cargas (+3) · Tengo margen (+2) · Patrimonio (+3) = +25 → comprar.
// Antes: «Tu estabilidad laboral y permanencia prevista justifican la inversión».
const COMPRA_CON_CONTRATO_TEMPORAL = [3, 1, 3, 2, 2, 0, 2, 0, 2, 0] as const;

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

test('la barra de progreso anuncia lo mismo que pinta', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  for (let paso = 0; paso < 3; paso++) {
    const [ahora, min, max] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
    );
    const anunciado = (ahora - min) / (max - min);
    // Esta app pinta la pregunta EN CURSO (1/10 ya en la primera); lo anunciado la sigue.
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo((paso + 1) / 10, 6);
    const pedido = Number(await page.locator('[class*="progresoRelleno"]').getAttribute('data-progreso')) / 100;
    expect(anunciado).toBeCloseTo(pedido, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await expect(barra).toHaveAttribute('aria-valuetext', `Pregunta ${paso + 1} de 10`);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('las razones salen de las respuestas: con contrato temporal no se alaba la estabilidad laboral', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, COMPRA_CON_CONTRATO_TEMPORAL);
  expect(texto).toContain('Tu situación apunta a comprar');
  expect(texto).not.toContain('Tu estabilidad laboral y permanencia prevista justifican la inversión');
  expect(texto).not.toContain('Los factores clave — estabilidad laboral');
  expect(texto).toContain('Tu puntuación total es +25: a partir de +8 la orientación es comprar, hasta −8 alquilar');
  // Lo que más empuja a comprar: los dos +4 y el primer +3, por orden de pregunta.
  expect(texto).toContain('Horizonte Temporal: «Indefinidamente» suma 4 puntos hacia la compra.');
  expect(texto).toContain('Capacidad de Entrada: «Más del 30%» suma 4 puntos hacia la compra.');
  expect(texto).toContain('Flexibilidad Geográfica: «Muy improbable, estoy arraigado/a» suma 3 puntos hacia la compra.');
  // Y el contrato temporal aparece donde debe: en sentido contrario.
  expect(texto).toMatch(/Lo que apunta en sentido contrario/i); // el título va en mayúsculas por CSS
  expect(texto).toContain('Estabilidad Laboral: «Contrato temporal o en transición» resta 3 puntos: empuja hacia seguir de alquiler.');
});

test('motor: las razones van en la dirección del veredicto y citan lo respondido', () => {
  test.setTimeout(180_000);
  const r: Record<string, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  let total = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const esperado = res.puntuacion >= UMBRAL ? 'compra' : res.puntuacion <= -UMBRAL ? 'alquila' : 'espera';
      if (res.veredicto !== esperado) mal('veredicto fuera de umbral');
      if (res.veredicto !== 'espera' && res.razones.length === 0) mal('veredicto sin razones');
      const aFavor = res.veredicto === 'alquila' ? 'resta' : 'suma';
      const enContra = aFavor === 'suma' ? 'resta' : 'suma';
      if (res.razones.some((x) => !x.includes(` ${aFavor} `))) mal('una razón empuja en contra');
      if (res.contrapeso.some((x) => !x.includes(` ${enContra} `))) mal('un contrapeso empuja a favor');
      for (const x of [...res.razones, ...res.contrapeso]) {
        const citada = x.match(/«([^»]+)»/)?.[1];
        if (!PREGUNTAS.some((p) => p.opciones.some((o) => o.etiqueta === citada && r[p.id] === o.valor))) mal(`cita «${citada}», no respondida`);
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
  expect(total).toBe(1_048_576);
});
