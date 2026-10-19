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
 * ── Las tres recetas que el invariante no veía (cabo C0196, 17/10/2026) ─────
 * El 10/10 este testigo dio 22/22 en verde el día en que el Inspector midió en las tres
 * seguro-* foco perdido, teclado sin patrón y doble toque sin guarda (3116-3139). Ahora mide:
 *   · FOCO: tras «Empezar», «Siguiente» y «Anterior», el foco en el destino que la app prepara
 *     (tabindex="-1", el enunciado o el título del resultado), no en <body>.
 *   · TECLADO (APG): un solo radio con tabindex 0; ArrowDown y Fin mueven foco y marca.
 *   · DOBLE TOQUE: ratón real, el 2.º clic de la ráfaga (`detail` 2) en el mismo punto cuando la
 *     pantalla nueva ya está pintada, en cada «Siguiente» hasta el resultado, a 390×844.
 * La guarda NO se fija por su forma: hay tres variantes en la familia (por botón, en captura
 * sobre el contenedor y en captura sobre window, la de seguro-hogar) y se acepta cualquiera que
 * pase el caso. La de window es la única que cubre un ENLACE ajeno bajo el dedo (Apps
 * relacionadas, Delegum), que es lo que pasó en las seguro-*: es la que se copia en una nueva.
 * Los huecos de salud y coche van con `falla` en su fila; el doble toque de salud, «omitido»
 * porque su caso no es determinista (ver la fila).
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

/** Un hueco abierto y declarado: el caso se escribe ANTES de repararlo (`check:familias`). */
interface Hueco {
  /** Opcional solo para el candado, que cuenta cada `falla:` literal como hueco abierto. */
  falla?: string;
  omitido?: never;
}

/**
 * Un hueco abierto cuyo caso NO es determinista: una marca `falla` en algo que cae en rojo
 * 1 de cada 4 veces rompería el build las otras 3. Se omite con la razón y se quita al reparar.
 */
interface Omitido {
  omitido: string;
  falla?: never;
}

interface Hermana {
  slug: string;
  /** La app abre con una pantalla de presentación y un botón «Empezar el test». */
  empezar: boolean;
  /** Las tres recetas que el invariante de radios no ve (cabo C0196), con su hueco si sigue abierto. */
  recetas?: { foco?: Hueco; teclado?: Hueco; dobleToque?: Hueco | Omitido };
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
    // Huecos 3132, 3133 y 3134 REPARADOS el 19/10/2026: tabindex itinerante y flechas, foco al
    // enunciado y guarda en captura sobre window.
  },
  {
    slug: 'selector-seguro-hogar',
    empezar: true,
  },
  {
    slug: 'selector-seguro-salud',
    empezar: true,
    recetas: {
      foco: { falla: 'hallazgo 3122: tras «Empezar», «Siguiente» y «Anterior» el foco cae a <body>' },
      teclado: { falla: 'hallazgo 3123: los radios no tienen tabindex itinerante ni flechas (APG)' },
      // Hallazgos 3125 y 3126, abiertos: sin guarda. Medido el 17/10/2026, 1 de 4 en rojo (el
      // segundo toque tras «Ver resultado» cae en la tarjeta de Delegum según dónde quede la
      // página): no determinista, así que no lleva `falla`. Al repararla, quitar `omitido`.
      dobleToque: { omitido: 'hallazgos 3125 y 3126 abiertos; el caso cae en rojo 1 de 4 veces' },
    },
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

    // ── Las tres recetas que el invariante de radios no ve (cabo C0196, 17/10/2026) ──
    // El 10/10 el testigo dio 22/22 en verde el mismo día en que el Inspector midió en las tres
    // seguro-* foco perdido, teclado sin patrón y doble toque sin guarda (3116-3139). Receta de
    // referencia: selector-seguro-hogar (y antes selector-smartphone, 1680, 1681, 2657 y 2659).

    test('el foco va al enunciado (o al título del resultado) tras Empezar, Siguiente y Anterior', async ({ page }) => {
      if (h.recetas?.foco?.falla) test.fail();
      const grupo = await abrirTest(page, h);
      if (h.empezar) await esperarFocoEnTitulo(page, 'tras «Empezar»');
      await grupo.locator('button').first().click();
      await botonSiguiente(page).click();
      await esperarFocoEnTitulo(page, 'tras «Siguiente»');
      await page.getByRole('button', { name: /anterior/i }).first().click();
      await esperarFocoEnTitulo(page, 'tras «Anterior»');
    });

    test('teclado del patrón de radios: una sola parada de Tab y las flechas mueven foco y marca', async ({ page }) => {
      if (h.recetas?.teclado?.falla) test.fail();
      const grupo = await abrirTest(page, h);
      const radios = grupo.locator('[role="radio"]');
      const n = await radios.count();
      const indices = await radios.evaluateAll((rs) => rs.map((r) => r.getAttribute('tabindex')));
      expect(indices.filter((t) => t === '0'), 'tabindex itinerante: un solo radio con 0').toHaveLength(1);
      expect(indices.filter((t) => t === '-1'), 'los demás, con -1').toHaveLength(n - 1);
      const desde = indices.indexOf('0');
      await radios.nth(desde).focus();
      await page.keyboard.press('ArrowDown');
      const destino = (desde + 1) % n;
      await expect(radios.nth(destino), 'ArrowDown lleva el foco a la siguiente').toBeFocused();
      await expect(radios.nth(destino), 'y la marca').toHaveAttribute('aria-checked', 'true');
      await page.keyboard.press('End');
      await expect(radios.nth(n - 1), 'Fin va a la última').toBeFocused();
      await expect(radios.nth(n - 1)).toHaveAttribute('aria-checked', 'true');
      await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
    });

    /**
     * Ratón de verdad, no eventos sintéticos: pulsar, esperar lo que tarda en repintar (150 ms,
     * dentro del intervalo de un doble toque) y el 2.º clic de la ráfaga EN EL MISMO PUNTO, que
     * el navegador entrega con `detail` 2. Lo que haya debajo tras el primero es lo que pisa: así
     * solo cae en rojo lo que le pasa a una persona, no una guarda «de otra variante». A 390×844,
     * donde se midieron 3116, 3125-3126 y 3134. Se repite en CADA «Siguiente», el último incluido.
     */
    test('doble toque: el segundo clic de la ráfaga no contesta la pregunta nueva ni saca de la app', async ({ page }) => {
      test.skip(Boolean(h.recetas?.dobleToque?.omitido), h.recetas?.dobleToque?.omitido);
      if (h.recetas?.dobleToque?.falla) test.fail();
      test.setTimeout(90_000);
      await page.setViewportSize({ width: 390, height: 844 });
      await abrirTest(page, h);
      const url = page.url();
      for (let paso = 1; paso <= 30; paso++) {
        await page.locator('[role="radiogroup"]').first().locator('button').first().click(); // suelto: cierra la ráfaga
        const opcionesDe = () => page.locator('[role="radiogroup"]').first().innerText();
        const antes = await opcionesDe();
        await botonSiguiente(page).scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        const caja = (await botonSiguiente(page).boundingBox())!;
        const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
        await page.mouse.move(x, y);
        await page.mouse.down({ clickCount: 1 });
        await page.mouse.up({ clickCount: 1 });
        // El 2.º toque cae sobre la pantalla NUEVA: se espera a que esté pintada (y a que el foco
        // la desplace), no un tiempo fijo, que daba un resultado u otro según la carga.
        await expect
          .poll(async () => ((await page.locator('[role="radiogroup"]').count()) === 0 ? 'fin' : await opcionesDe()), {
            intervals: [20],
            timeout: 3000,
          })
          .not.toBe(antes);
        await page.waitForTimeout(80);
        await page.mouse.down({ clickCount: 2 });
        await page.mouse.up({ clickCount: 2 });
        await page.waitForTimeout(400);
        expect(page.url(), `paso ${paso}: la ráfaga no saca de la app`).toBe(url);
        const grupos = page.locator('[role="radiogroup"]');
        if ((await grupos.count()) === 0) return; // resultado
        // Las opciones cambian de pregunta a pregunta (la barra no sirve: alguna cuenta respondidas)
        expect(await opcionesDe(), `paso ${paso}: el primer clic avanzó`).not.toBe(antes);
        await expect(grupos.first().locator('[aria-checked="true"]'), `paso ${paso}: la ráfaga no contesta la pregunta nueva`).toHaveCount(0);
      }
      throw new Error('30 pasos sin llegar al resultado');
    });
  });
}

/**
 * El foco, en el destino que la app le prepara (el enunciado o el título del resultado, con
 * tabindex="-1"), no en <body> ni en un botón. No se exige encabezado: formacion-postgrado lleva
 * el enunciado en un <p>, y cumple la receta igual.
 */
async function esperarFocoEnTitulo(page: Page, momento: string): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return 'body';
          return el.getAttribute('tabindex') === '-1' && el.tagName !== 'BUTTON' ? 'destino' : el.tagName;
        }),
      { message: `${momento}: dónde está el foco` },
    )
    .toBe('destino');
}
