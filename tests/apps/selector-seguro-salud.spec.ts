import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, PESOS, PREGUNTAS, UMBRAL_COMPLEMENTARIO, UMBRAL_PUBLICO } from '../../app/selector-seguro-salud/motor';

/**
 * Asesor de Seguro de Salud (selector-seguro-salud) — reparado el 24/09/2026 desde una
 * sospecha del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1, y pintaba paso / 10: en la
 *     pregunta 2 anunciaba 0,111 y pintaba 0,100.
 *   · No hay empates: es UNA puntuación contra dos umbrales, más tres respuestas que fuerzan
 *     «sanidad pública» (seguro completo de empresa, MUFACE/ISFAS o «Nada, no quiero gasto»).
 *   · Razones fijas: «sanidad pública» empezaba SIEMPRE por «Tu uso médico actual no justifica
 *     el coste mensual de un seguro privado», también en los 41.408 perfiles en los que lo
 *     había decidido «Nada, no quiero gasto extra» y la puntuación sola habría dado «seguro
 *     completo»; y «seguro completo» salía sin una sola razón en 14.312 perfiles.
 *
 * EL MOTOR (app/selector-seguro-salud/motor.ts): mismos puntos, umbrales y respuestas que
 * fuerzan (veredicto y puntuación idénticos en las 1.048.576 combinaciones). Las razones dicen
 * qué ha decidido el resultado y qué respuestas han sumado y restado.
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
  await page.goto('/selector-seguro-salud/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu perfil de cobertura sanitaria' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Muy frecuente (+3) · Varios especialistas (+3) · Comunidad con más presión (+2) · 2 o más
// hijos (+3) · Autónomo (+2) · Acceso rápido crítico (+3) · Dental, gasto importante (+3) ·
// Seguro anterior satisfecho (+2) · «NADA, no quiero gasto extra» (−3) · Sin seguro de
// empresa (0) = 18 → la puntuación diría «completo», y la respuesta «Nada» fuerza «pública».
// Antes: «Tu uso médico actual no justifica el coste mensual de un seguro privado».
const NADA_CON_USO_ALTO = [3, 2, 2, 2, 1, 3, 2, 0, 0, 2] as const;

// Muy frecuente (+3) · Varios especialistas (+3) · Comunidad con más presión (+2) · Sin hijos ·
// Por cuenta ajena · Acceso rápido «muy importante» (+2) · Dental, gasto importante (+3) ·
// Seguro anterior satisfecho (+2) · Más de 100 €/mes (+1) · Sin seguro de empresa = 16 →
// completo. Antes, «Por qué esta orientación» salía VACÍO: sus tres razones exigían hijos,
// ser autónomo o acceso «crítico».
const COMPLETO_SIN_HIJOS = [3, 2, 2, 0, 0, 2, 2, 0, 3, 2] as const;

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

test('si lo decide el presupuesto, se dice: no se atribuye a un uso médico bajo', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, NADA_CON_USO_ALTO);
  await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Sanidad pública es suficiente');
  expect(texto).not.toContain('Tu uso médico actual no justifica');
  expect(texto).toContain('Has dicho que no quieres ningún gasto extra: con ese presupuesto la orientación es la sanidad pública');
  expect(texto).toContain('Sin esa respuesta, tu puntuación (18) apuntaría a «seguro privado completo recomendado».');
  expect(texto).toContain('Visitas al médico: «Muy frecuente (más de 10 veces)» suma 3 puntos.');
  expect(texto).toContain('Especialistas: «Sí, varios especialistas» suma 3 puntos.');
  expect(texto).toContain('Hijos: «Sí, 2 o más hijos» suma 3 puntos.');
});

test('«seguro completo» siempre dice por qué, aunque no haya hijos ni se sea autónomo', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, COMPLETO_SIN_HIJOS);
  await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Seguro privado completo recomendado');
  await expect(page.locator('[class*="razonItem"]')).not.toHaveCount(0);
  expect(texto).toContain('Tu puntuación es 16: desde 8, un seguro privado completo.');
  expect(texto).toContain('Salud dental: «Es un gasto importante para mí cada año» suma 3 puntos.');
});

test('motor: el veredicto no cambia, y las razones dicen qué lo ha decidido', () => {
  test.setTimeout(180_000);
  const r: Record<number, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  let total = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      let puntos = 0;
      for (const [id, porRespuesta] of Object.entries(PESOS)) puntos += porRespuesta[r[Number(id)]] ?? 0;
      const porPuntos = puntos <= UMBRAL_PUBLICO ? 'publico' : puntos <= UMBRAL_COMPLEMENTARIO ? 'complementario' : 'completo';
      const forzado = r[10] === 'si_completo' || r[10] === 'muface' || r[9] === 'nada';
      if (res.puntuacion !== puntos) mal('puntuación distinta');
      if (res.veredicto !== (forzado ? 'publico' : porPuntos)) mal('veredicto distinto');
      if (res.razones.length === 0) mal('sin razones');
      if (res.razones.some((x) => x.includes('Tu uso médico actual no justifica'))) mal('razón fija de antes');
      if (forzado && porPuntos !== 'publico' && !res.razones.some((x) => x.startsWith('Sin esa respuesta'))) mal('no dice qué daría la puntuación');
      for (const x of res.razones) {
        const citada = x.match(/«([^»]+)»/)?.[1];
        if (citada && !citada.startsWith('seguro') && !citada.startsWith('sanidad')
          && !PREGUNTAS.some((p) => p.opciones.some((o) => o.etiqueta === citada && r[p.id] === o.valor))) mal(`cita «${citada}», no respondida`);
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
