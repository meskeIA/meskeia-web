import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, PREGUNTAS, UMBRAL_BASICA, UMBRAL_ESTANDAR } from '../../app/selector-seguro-hogar/motor';

/**
 * Asesor de Seguro de Hogar (selector-seguro-hogar) — reparado el 24/09/2026 desde una sospecha
 * del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 3 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1, y pintaba paso / 10: en la
 *     pregunta 2 anunciaba 0,111 y pintaba 0,100.
 *   · No hay empates que deshacer: es UNA puntuación contra dos umbrales (10 y 20).
 *   · Razones fijas por cobertura: en 10.226 perfiles salía «completa» sin un solo objeto de
 *     valor, y la app decía «Tienes objetos de valor que requieren cobertura específica»; en
 *     1.424 de ellos, además en centro urbano, «Vives en zona con riesgos específicos
 *     (inundación, incendio forestal, robo)».
 *
 * EL MOTOR (app/selector-seguro-hogar/motor.ts): mismas preguntas, puntos y umbrales (el
 * veredicto no cambia en ninguna de las 414.720 combinaciones). Las razones citan las
 * respuestas que más han sumado y, aparte, las que no han sumado nada.
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
  await page.goto('/selector-seguro-hogar/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu cobertura recomendada' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Propietario con hipoteca (3) · Unifamiliar (3) · Más de 50 años (3) · Contenido de más de
// 60.000 € (4) · CENTRO URBANO (2) · Familia con hijos (2) · NADA especialmente valioso (0) ·
// Incendio (3) · Siniestro importante (3) · La cobertura más amplia (3) = 26 → completa.
// Antes: «Tienes objetos de valor…» y «Vives en zona con riesgos específicos…».
const COMPLETA_SIN_OBJETOS = [0, 1, 3, 3, 0, 2, 0, 2, 2, 2] as const;

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(3);
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
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await expect(barra).toHaveAttribute('aria-valuetext', `Pregunta ${paso + 1} de 10`);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('las razones salen de las respuestas: sin objetos de valor no se afirma que los tengas', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, COMPLETA_SIN_OBJETOS);
  expect(texto).toContain('Multirriesgo Completa');
  expect(texto).not.toContain('Tienes objetos de valor que requieren cobertura específica');
  expect(texto).not.toContain('Vives en zona con riesgos específicos');
  expect(texto).toContain('Tu puntuación es 26: hasta 10, cobertura básica; hasta 20, multirriesgo estándar; por encima, multirriesgo completa.');
  // Las tres que más suman: el contenido (4) y los dos primeros 3 por orden de pregunta.
  expect(texto).toContain('Valor del Contenido: «Más de 60.000 €» suma 4 puntos.');
  expect(texto).toContain('Régimen de Tenencia: «Propietario/a con hipoteca vigente» suma 3 puntos.');
  expect(texto).toContain('Tipo de Vivienda: «Casa unifamiliar o adosado» suma 3 puntos.');
  // Y lo que no ha sumado, dicho.
  expect(texto).toContain('Objetos de Alto Valor: «No, nada especialmente valioso» no suma puntos.');
});

test('motor: el veredicto sigue los umbrales y las razones citan lo respondido', () => {
  const r: Record<string, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  let total = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const esperado = res.puntuacion <= UMBRAL_BASICA ? 'basica' : res.puntuacion <= UMBRAL_ESTANDAR ? 'estandar' : 'completa';
      if (res.veredicto !== esperado) mal('veredicto fuera de umbral');
      if (res.razones.length === 0) mal('sin razones');
      for (const x of [...res.razones, ...res.sinPeso]) {
        const citada = x.match(/«([^»]+)»/)?.[1];
        const op = PREGUNTAS.flatMap((p) => p.opciones.filter((o) => o.etiqueta === citada && r[p.id] === o.valor))[0];
        if (!op) mal(`cita «${citada}», no respondida`);
        else if (res.razones.includes(x) !== op.puntos > 0) mal(`«${citada}» en la lista equivocada`);
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
  expect(total).toBe(414_720);
});
