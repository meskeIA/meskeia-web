import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, PREGUNTAS, SISTEMAS } from '../../app/selector-calefaccion/motor';

/**
 * Asesor de Calefacción (selector-calefaccion) — reparado el 24/09/2026 desde una sospecha del
 * Inspector sobre la familia de los selectores (la de selector-smartphone 950/951 y
 * selector-mascota 1341/1342, repetida aquí).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1 y máximo 10, y pintaba paso / 10:
 *     en la pregunta 2 anunciaba 1/9 = 0,111 y pintaba 0,100.
 *   · Empates: el motor ordenaba el array de puntuaciones con `sort` estable, así que a
 *     igualdad ganaba siempre el primero (la aerotermia). Enumerado: 24.687 de los 331.776
 *     perfiles (7,4 %) empatan en cabeza, y en 19.931 el criterio explícito cambia el ganador.
 *   · Razones fijas por sistema: en 39 perfiles ganaba la caldera de gas a quien había dicho
 *     que su caldera tiene MÁS de 10 años, y la app le respondía «Con una caldera reciente en
 *     buen estado, mantenerla es la decisión económicamente más sensata».
 *
 * EL MOTOR (app/selector-calefaccion/motor.ts): los mismos pesos (comprobado sobre las 331.776
 * combinaciones: sin empate, el ganador no cambia en ninguna). A igualdad de puntos, primero el
 * que más encaja con el presupuesto de instalación (pregunta 9) y luego el de menor coste de
 * instalación; el empate se anuncia. Las razones citan las respuestas que más han sumado.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>, así que `esperarHidratacion` de `_hidratacion.ts` (que sondea
 * el rastreador de valor de un input) no tiene testigo. El equivalente para una app de solo
 * botones es que React haya colgado sus props del botón de inicio: antes, el clic se pierde.
 * Mismo criterio que `selector-smartphone.spec.ts`.
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
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
  await page.goto('/selector-calefaccion/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

/** Responde las diez preguntas por el ÍNDICE de la opción, y pide el resultado. */
async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu sistema de calefacción ideal' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles, con las cuentas hechas a mano
// ─────────────────────────────────────────────────────────────────────────────

// Piso en bloque · Menos de 60 m² · Radiadores de agua · Frío · Sí, menos de 5 años ·
// Refrigeración imprescindible · 4 – 5 meses · No tengo espacio · Menos de 3.000 € · Subvenciones sí.
//   aerotermia 1+1+2+2 = 6 · bomba 2+2+3+2 = 9 · caldera 2+1+4+2 = 9 · pellet 2+1 = 3 ·
//   eléctrico 1+2+2+4 = 9. Triple empate a 9. El presupuesto da eléctrico +4, bomba +2 y
//   caldera 0: van por ese orden. Antes ganaba la bomba de calor por ir antes en el array.
const EMPATE_A_TRES = [0, 0, 0, 0, 0, 0, 1, 2, 0, 0] as const;

// Piso en bloque · 60 – 100 m² · Radiadores de agua · Frío · Sí, MÁS DE 10 AÑOS · Poco o nada ·
// 4 – 5 meses · No tengo espacio · 3.000 – 8.000 € · Prefiero no complicarme.
//   aerotermia 1+1+2 = 4 · bomba 2+1+2 = 5 · caldera 2+1+2+1 = 6 · pellet 2+1 = 3 ·
//   eléctrico 1+2 = 3. Gana la caldera de gas, sola. Antes le decía «Con una caldera reciente
//   en buen estado…» a quien acababa de responder que la suya tiene más de 10 años.
const CALDERA_VIEJA = [0, 1, 0, 0, 1, 2, 1, 2, 1, 2] as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Accesibilidad del armazón (el invariante de la familia)
// ─────────────────────────────────────────────────────────────────────────────

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
    // Y lo que se VE: el ancho real del relleno.
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await expect(barra).toHaveAttribute('aria-valuetext', `Pregunta ${paso + 1} de 10`);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Empates y razones, en pantalla
// ─────────────────────────────────────────────────────────────────────────────

test('un empate a tres se anuncia y se deshace por el presupuesto, no por el orden del código', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, EMPATE_A_TRES);

  const principal = page.locator('[class*="recomendacionValor"]').first();
  await expect(principal).toHaveText('Radiadores Eléctricos de Bajo Consumo');
  await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('Bomba de Calor (split)');

  const empate = page.locator('[class*="avisoEmpate"]');
  await expect(empate).toContainText(
    'los radiadores eléctricos de bajo consumo, la bomba de calor (split) y la caldera de gas encajan exactamente igual',
  );
  await expect(empate).toContainText('se muestran primero los radiadores eléctricos de bajo consumo porque encajan mejor con el presupuesto de instalación');
  // La razón principal cita la respuesta que más ha sumado.
  expect(texto).toContain('Presupuesto de instalación: has respondido «Menos de 3.000 €», que suma 4 puntos a los radiadores eléctricos de bajo consumo.');
});

test('las razones salen de las respuestas: a una caldera de más de 10 años no se le llama reciente', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, CALDERA_VIEJA);

  await expect(page.locator('[class*="recomendacionValor"]').first()).toHaveText('Caldera de Gas');
  await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
  expect(texto).not.toContain('Con una caldera reciente en buen estado');
  expect(texto).not.toContain('Tu caldera es reciente');
  // Las tres que más le suman: radiadores (+2), sin sitio para la unidad exterior (+2), frío (+1).
  expect(texto).toContain('Distribución del calor: has respondido «Radiadores de agua», que suma 2 puntos a la caldera de gas.');
  expect(texto).toContain('Unidad exterior: has respondido «No tengo espacio», que suma 2 puntos a la caldera de gas.');
  expect(texto).toContain('Clima: has respondido «Frío o muy frío», que suma 1 punto a la caldera de gas.');
  // Y el consejo de transición, que antes iba en «Por qué», sigue estando.
  expect(texto).toContain('Planifica la transición a bomba de calor o aerotermia');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. El motor, sobre las 331.776 combinaciones (sin navegador)
// ─────────────────────────────────────────────────────────────────────────────

test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  test.setTimeout(120_000);
  const r: Record<number, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); else fallos.length++; };
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const max = Math.max(...CLAVES.map((k) => res.puntos[k]));
      if (res.puntos[res.sistemaPrincipal] !== max) mal('el recomendado no tiene la puntuación máxima');
      const empatadosReales = CLAVES.filter((k) => k !== res.sistemaPrincipal && res.puntos[k] === max);
      if (empatadosReales.length !== res.empatados.length || empatadosReales.some((k) => !res.empatados.includes(k))) mal('empatados mal contados');
      if (empatadosReales.length > 0) {
        empates++;
        const pres = PREGUNTAS[8].opciones.find((o) => o.valor === r[9])?.pesos ?? {};
        for (const k of empatadosReales) {
          const dP = (pres[res.sistemaPrincipal] ?? 0) - (pres[k] ?? 0);
          // Nunca pierde contra un empatado ni por presupuesto ni, a igualdad, por coste; y
          // la frase nombra el criterio que de verdad lo ha separado.
          if (dP < 0) mal(`pierde por presupuesto contra ${k}`);
          if (dP > 0 && !res.criterioDesempate.includes('mejor con el presupuesto de instalación')) mal('no nombra el presupuesto');
          if (dP === 0 && !(SISTEMAS[res.sistemaPrincipal].costeInstalacionMin < SISTEMAS[k].costeInstalacionMin)) mal(`no es más barato que ${k}`);
          if (dP === 0 && !res.criterioDesempate.includes('coste de instalación es el más bajo')) mal('no nombra el coste');
        }
      } else if (res.criterioDesempate !== '') {
        mal('anuncia un criterio sin empate');
      }
      // Cada razón cita una respuesta que el usuario ha dado.
      for (const razon of res.razones) {
        const citada = razon.match(/«([^»]+)»/)?.[1];
        if (citada && !PREGUNTAS.some((p) => p.opciones.some((o) => o.etiqueta === citada && r[p.id] === o.valor))) mal(`razón que cita «${citada}», no respondida`);
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
  expect(total).toBe(331_776);
  expect(empates).toBe(24_687);
});
