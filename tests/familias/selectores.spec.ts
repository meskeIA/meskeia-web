/**
 * TESTIGO DE FAMILIA — los asesores de preguntas encadenadas (11 apps hermanas)
 *
 * Un solo fichero que prueba EL MISMO invariante en las once a la vez.
 *
 * ── Por qué existe ───────────────────────────────────────────────────────────
 * Once `selector-*` comparten el mismo armazón de test escrito once veces: una pregunta en
 * pantalla con sus opciones dentro de un `role="radiogroup"` y una barra `role="progressbar"`.
 * El Inspector lo encontró roto en `selector-smartphone` (hallazgos 950 y 951, reparados en
 * `4fe972a2` y anteriores): las opciones eran `<button aria-pressed>` —un conmutador— dentro
 * de un grupo que decía ser de radios sin un solo radio, y `aria-valuenow` anunciaba el número
 * de pregunta mientras el relleno pintaba las respondidas. El 24/09/2026 salió IGUAL en
 * `selector-mascota` (1341 y 1342, `934e57bc`), y la sospecha de esa misma inspección lo
 * localizó en otras nueve. Es la forma exacta de una familia: la reparación de una tenía que
 * llegar a las demás, y no llegó hasta que alguien las buscó.
 *
 * ── El invariante ────────────────────────────────────────────────────────────
 *   > Una elección ÚNICA entre varias se anuncia como tal: cada opción del grupo es un
 *   > `role="radio"` con `aria-checked`, ninguna lleva `aria-pressed`, y al pulsar una queda
 *   > marcada ella sola.
 *   > La barra de progreso anuncia la MISMA fracción que pinta:
 *   > (aria-valuenow − aria-valuemin) / (aria-valuemax − aria-valuemin) = ancho del relleno.
 *
 * Y se mide COMPORTAMIENTO, no forma: el grep de `aria-pressed` solo sirvió para localizar
 * las once (la regla de `scripts/inspector/familias.mjs`). La fracción pintada es el ancho
 * REAL del relleno sobre el de la barra, no el `style` que lo pide; y la anunciada sale de los
 * tres atributos, no de suponer que el mínimo es cero. Por eso cuenta como sana
 * `selector-movilidad-urbana`, que anuncia porcentajes (0-100) y siempre cuadró, y como rota
 * cualquier barra que empiece en 1 aunque su `valuenow` «parezca» bien.
 *
 * Lo que NO mide: el motor de cada app (empates, razones, presupuesto). Esos son distintos en
 * cada hermana —puntos contra umbral en unas, reparto entre candidatas en otras— y los mide
 * el spec de cada una en `tests/apps/`.
 *
 * ── Cómo se amplía ───────────────────────────────────────────────────────────
 * Dirigido por datos: toda la verdad vive en `HERMANAS`. Una hermana nueva es una fila
 * (y su slug en `scripts/inspector/familias.mjs`, que el candado `check:familias` compara con
 * esta tabla). Estas apps no tienen ningún `<NumberInput>`, así que sus filas no llevan
 * campos: el candado solo exige que cada hermana tenga su bloque y que esto pase.
 */

import { test, expect, type Page, type Locator } from '@playwright/test';

interface Hermana {
  slug: string;
  /** La app abre con una pantalla de presentación y un botón «Empezar el test». */
  empezar: boolean;
}

const HERMANAS: Hermana[] = [
  {
    slug: 'selector-smartphone',
    empezar: true,
  },
  {
    slug: 'selector-mascota',
    empezar: true,
  },
  {
    slug: 'selector-alquiler-vs-compra',
    empezar: true,
  },
  {
    slug: 'selector-calefaccion',
    empezar: true,
  },
  {
    slug: 'selector-ejercicio',
    empezar: true,
  },
  {
    slug: 'selector-formacion-postgrado',
    empezar: false,
  },
  {
    slug: 'selector-movilidad-urbana',
    empezar: false,
  },
  {
    slug: 'selector-portatil',
    empezar: true,
  },
  {
    slug: 'selector-seguro-coche',
    empezar: false,
  },
  {
    slug: 'selector-seguro-hogar',
    empezar: true,
  },
  {
    slug: 'selector-seguro-salud',
    empezar: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estas apps no tienen ningún <input>, así que `esperarHidratacion` de
 * `tests/apps/_hidratacion.ts` (que sondea el rastreador de valor de un input) no tiene
 * testigo. El equivalente para una app de solo botones es que React haya colgado sus props del
 * primer botón con el que se va a interactuar: antes de eso, el clic cambia el DOM y no llega
 * al estado. Mismo criterio que `tests/apps/selector-smartphone.spec.ts`.
 */
async function esperarHidratacionBotones(page: Page, selector: string, texto = ''): Promise<void> {
  await page.waitForFunction(
    ({ sel, txt }) => {
      const boton = Array.from(document.querySelectorAll(sel)).find((b) => (b.textContent ?? '').includes(txt));
      if (!boton) return false;
      return Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    { sel: selector, txt: texto },
    { timeout: 20_000 },
  );
}

async function abrirTest(page: Page, h: Hermana): Promise<Locator> {
  // Sin animaciones: el relleno cambia de ancho con una transición, y se mide el ancho real.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/${h.slug}/`);
  if (h.empezar) {
    await esperarHidratacionBotones(page, 'button', 'Empezar');
    await page.getByRole('button', { name: /Empezar/ }).first().click();
  }
  const grupo = page.locator('[role="radiogroup"]').first();
  await grupo.waitFor();
  await esperarHidratacionBotones(page, '[role="radiogroup"] button');
  return grupo;
}

/** La fracción que anuncia la barra, a partir de sus tres atributos. */
async function fraccionAnunciada(barra: Locator): Promise<number> {
  const [ahora, minimo, maximo] = await Promise.all(
    ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
  );
  return (ahora - minimo) / (maximo - minimo);
}

/** La fracción que se VE: el ancho real del relleno sobre el ancho interior de la barra. */
async function fraccionPintada(barra: Locator): Promise<number> {
  return barra.evaluate((el) => {
    const relleno = el.firstElementChild as HTMLElement | null;
    if (!relleno) return Number.NaN;
    return relleno.getBoundingClientRect().width / el.clientWidth;
  });
}

async function comprobarBarra(page: Page, momento: string): Promise<number> {
  const barra = page.locator('[role="progressbar"]').first();
  const anunciada = await fraccionAnunciada(barra);
  expect(Number.isFinite(anunciada), `${momento}: la barra no declara valuenow/valuemin/valuemax`).toBe(true);
  // Se espera a que el ancho asiente, por si queda alguna transición.
  await expect
    .poll(() => fraccionPintada(barra), { message: `${momento}: lo pintado frente a lo anunciado (${anunciada.toFixed(3)})` })
    .toBeCloseTo(anunciada, 2);
  return anunciada;
}

const botonSiguiente = (page: Page) =>
  page.getByRole('button', { name: /siguiente|ver (mi )?resultado/i }).first();

// ─────────────────────────────────────────────────────────────────────────────
// El invariante, en cada hermana
// ─────────────────────────────────────────────────────────────────────────────

for (const h of HERMANAS) {
  test.describe(h.slug, () => {
    test('las opciones son radios de verdad: aria-checked, sin aria-pressed, una sola marcada', async ({ page }) => {
      const grupo = await abrirTest(page, h);
      const opciones = grupo.locator('button');
      const n = await opciones.count();
      expect(n, 'la primera pregunta tiene al menos dos opciones').toBeGreaterThan(1);

      await expect(grupo.locator('[role="radio"]')).toHaveCount(n);
      await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
      await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);

      await opciones.nth(1).click();
      await expect(opciones.nth(1)).toHaveAttribute('aria-checked', 'true');
      await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);

      // Cambiar de opción MUEVE la marca: sigue habiendo una sola.
      await opciones.nth(0).click();
      await expect(opciones.nth(0)).toHaveAttribute('aria-checked', 'true');
      await expect(opciones.nth(1)).toHaveAttribute('aria-checked', 'false');
      await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
    });

    test('la barra de progreso anuncia la misma fracción que pinta', async ({ page }) => {
      const grupo = await abrirTest(page, h);

      const inicio = await comprobarBarra(page, 'pregunta 1 sin responder');
      // Por el botón y no por su rol: este caso mide la barra, y no debe caerse antes por el
      // otro invariante.
      await grupo.locator('button').first().click();
      await comprobarBarra(page, 'pregunta 1 respondida');
      await botonSiguiente(page).click();
      const barra = page.locator('[role="progressbar"]').first();
      await expect.poll(() => fraccionAnunciada(barra), { message: 'al avanzar, la barra avanza' }).toBeGreaterThan(inicio);
      await comprobarBarra(page, 'pregunta 2');
    });
  });
}
