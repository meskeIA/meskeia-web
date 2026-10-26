/**
 * TESTIGO DE FAMILIA — los quizzes de opción múltiple (16 apps hermanas, app/quiz-*)
 *
 * Un solo fichero que prueba EL MISMO invariante en las dieciséis a la vez.
 *
 * ── Por qué existe ───────────────────────────────────────────────────────────
 * Los dieciséis quizzes comparten el armazón —pregunta, cuatro opciones (o Verdad/Mito),
 * «Siguiente»— escrito dieciséis veces. El Inspector midió el mismo defecto en ocho de ocho
 * (cabo C0018, del 25/09 al 10/10/2026: tabla-periodica, literatura-universal,
 * biologia-molecular, simbolos-quimicos, verbos-irregulares, historia-espana, paises-capitales y
 * geografia-espana): al pulsar «Siguiente» el botón desaparece y el foco cae a <body>, así que
 * quien navega con teclado o lector de pantalla vuelve al principio de la página y no oye la
 * pregunta nueva. Se reparó app a app en esas ocho; las otras ocho no las midió nadie hasta el
 * 23/10/2026, y las ocho tenían el defecto.
 *
 * ── El invariante ────────────────────────────────────────────────────────────
 *   > Tras «Siguiente», el foco va al enunciado de la pregunta nueva —un elemento con
 *   > tabindex="-1" que no es un botón—, no a <body>.
 *
 * Se mide COMPORTAMIENTO: dónde está `document.activeElement` después del clic real, no si el
 * código tiene un `ref` o un `focus()` (la regla de `scripts/inspector/familias.mjs`: el grep de
 * un helper no dice quién protege). Receta de referencia: quiz-literatura-universal.
 *
 *   > Un doble toque en «Empezar», «Siguiente» o «Ver resultado» es UNA intención: el segundo
 *   > toque no contesta la pregunta nueva, no saca de la app ni se lleva la nota (cabo C0082,
 *   > 26/10/2026; receta de la referencia, ce0ad0bc, y `useGuardaRafaga` de lib/guardaRafaga.ts).
 *
 * Lo que NO mide todavía: que el enunciado quede a la vista bajo la barra fija a 360 px. Es
 * receta de la misma familia, y entra aquí como caso nuevo con su `falla` por hermana.
 * Tampoco el banco de cada quiz (barajado, niveles): lo mide el spec de cada uno en tests/apps/.
 *
 * ── Cómo se amplía ───────────────────────────────────────────────────────────
 * Dirigido por datos: toda la verdad vive en `HERMANAS`. Una hermana nueva es una fila (y su
 * slug en `scripts/inspector/familias.mjs`, que `check:familias` compara con esta tabla). Estas
 * apps no tienen ningún `<NumberInput>`: el candado solo exige que cada una tenga su bloque.
 */

import { test, expect, type Page } from '@playwright/test';

interface Hermana {
  slug: string;
  /** Botones que hay que pulsar, en orden, hasta ver la primera pregunta (nivel, modo, «Empezar»). */
  arranque: RegExp[];
  /** La opción que se contesta: por defecto la A, cuyo texto empieza por la letra. */
  opcion?: RegExp;
  /** Hueco abierto y declarado: el caso se escribe ANTES de repararlo (`check:familias`). */
  foco?: { falla?: string };
  /** Ídem para el doble toque; `omitido` si el caso no es determinista en esa hermana. */
  dobleToque?: { falla?: string; omitido?: string };
}

const EMPEZAR = /empezar|comenzar/i;

const HERMANAS: Hermana[] = [
  {
    slug: 'quiz-literatura-universal',
    arranque: [EMPEZAR],
  },
  {
    slug: 'quiz-biologia-molecular',
    arranque: [EMPEZAR],
  },
  {
    slug: 'quiz-historia-espana',
    arranque: [EMPEZAR],
  },
  {
    slug: 'quiz-geografia-espana',
    arranque: [EMPEZAR],
  },
  {
    slug: 'quiz-simbolos-quimicos',
    arranque: [EMPEZAR],
  },
  {
    slug: 'quiz-tabla-periodica',
    arranque: [EMPEZAR],
  },
  {
    slug: 'quiz-verbos-irregulares',
    arranque: [EMPEZAR],
  },
  {
    slug: 'quiz-paises-capitales',
    arranque: [EMPEZAR],
  },
  {
    // REPARADO el 23/10/2026 al declarar la familia (enfocarALaVista de lib/cromoFijo.ts).
    slug: 'quiz-complejidad-algoritmos',
    arranque: [EMPEZAR],
  },
  {
    // Sin pantalla de inicio: abre en la primera pregunta. REPARADO el 23/10/2026.
    slug: 'quiz-conceptos-financieros',
    arranque: [],
  },
  {
    // REPARADO el 23/10/2026 al declarar la familia.
    slug: 'quiz-conceptos-inversion',
    arranque: [EMPEZAR],
  },
  {
    // REPARADO el 23/10/2026 al declarar la familia.
    slug: 'quiz-figuras-retoricas',
    arranque: [EMPEZAR],
  },
  {
    // REPARADO el 23/10/2026 al declarar la familia.
    slug: 'quiz-metrica-estrofas',
    arranque: [EMPEZAR],
  },
  {
    // REPARADO el 23/10/2026 al declarar la familia.
    slug: 'quiz-reinos-naturaleza',
    arranque: [EMPEZAR],
  },
  {
    // Elige el modo y la pregunta aparece; las opciones son los seis grupos de plantas.
    slug: 'quiz-tipos-plantas',
    arranque: [/Modo Rápido/],
    // REPARADO el 23/10/2026 al declarar la familia.
    opcion: /Alga|Briófito|Pteridófito|Gimnosperma|Monocotiledónea|Dicotiledónea/,
  },
  {
    // REPARADO el 23/10/2026 al declarar la familia.
    slug: 'quiz-mitos-ciencia',
    arranque: [EMPEZAR],
    opcion: /Verdad/,
  },
];

/**
 * Estas apps no tienen <input>, así que `esperarHidratacion` (que sondea el rastreador de valor
 * de un input) no sirve: el equivalente es que React haya colgado sus props del botón con el que
 * se va a interactuar. Mismo criterio que tests/familias/selectores.spec.ts.
 */
async function pulsarHidratado(page: Page, texto: RegExp): Promise<void> {
  await page.waitForFunction(
    ({ fuente, banderas }) => {
      const patron = new RegExp(fuente, banderas);
      const boton = [...document.querySelectorAll('button')].find(
        (b) => (b as HTMLElement).offsetParent !== null && patron.test(b.textContent ?? ''),
      );
      return Boolean(boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$')));
    },
    { fuente: texto.source, banderas: texto.flags },
    { timeout: 20_000 },
  );
  await page.locator('button:visible').filter({ hasText: texto }).first().click();
}

/** Dónde está el foco: «destino» si es un elemento preparado (tabindex -1) que no es un botón. */
const dondeFoco = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return 'body';
    return el.getAttribute('tabindex') === '-1' && el.tagName !== 'BUTTON' ? 'destino' : el.tagName;
  });

for (const h of HERMANAS) {
  test.describe(h.slug, () => {
    test('tras «Siguiente», el foco va al enunciado de la pregunta nueva, no a <body>', async ({ page }) => {
      if (h.foco?.falla) test.fail();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${h.slug}/`);
      for (const boton of h.arranque) await pulsarHidratado(page, boton);
      await pulsarHidratado(page, h.opcion ?? /^\s*A\S/);
      await pulsarHidratado(page, /siguiente/i);
      await expect.poll(() => dondeFoco(page), { message: 'dónde está el foco tras «Siguiente»' }).toBe('destino');
    });

    /**
     * Elegir respuesta es una ACCIÓN: la opción queda deshabilitada y no se puede despulsar, así
     * que `aria-pressed` la anunciaba como «botón de alternar, no pulsado» (hallazgo 285 en
     * simbolos-quimicos; al declarar la familia, igual en complejidad-algoritmos,
     * conceptos-inversion y tipos-plantas, reparadas el 23/10/2026). Antes y después de responder.
     */
    test('las opciones de respuesta no llevan aria-pressed', async ({ page }) => {
      await page.goto(`/${h.slug}/`);
      for (const boton of h.arranque) await pulsarHidratado(page, boton);
      const opciones = page.locator('button:visible').filter({ hasText: h.opcion ?? /^\s*A\S/ });
      await expect(opciones.first()).toBeVisible();
      expect(await opciones.evaluateAll((bs) => bs.filter((b) => b.hasAttribute('aria-pressed')).length)).toBe(0);
      await pulsarHidratado(page, h.opcion ?? /^\s*A\S/);
      expect(
        await page.locator('button[aria-pressed]:disabled').count(),
        'tras responder, ningún botón deshabilitado anuncia un estado de conmutador',
      ).toBe(0);
    });

    /**
     * Ratón de verdad, como en tests/familias/selectores.spec.ts: el 1.er clic en el centro del
     * botón, esperar a que la pantalla NUEVA esté pintada y el 2.º clic de la ráfaga en el mismo
     * punto, que el navegador entrega con `detail` 2. Lo que haya debajo es lo que pisa: así solo
     * cae en rojo lo que le pasa a una persona. A 390×844, en el último botón del arranque, en
     * CADA «Siguiente» y en «Ver resultado». Medido el 30/09 en literatura-universal (46 de 56 a
     * 360 px) y el 10/10 en geografia-espana (hallazgo 3214).
     */
    test('doble toque: el segundo toque de la ráfaga no contesta, no saca de la app ni se come la nota', async ({ page }) => {
      test.skip(Boolean(h.dobleToque?.omitido), h.dobleToque?.omitido);
      if (h.dobleToque?.falla) test.fail();
      test.setTimeout(120_000);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${h.slug}/`);
      const url = page.url();
      const opciones = page.locator('button:visible').filter({ hasText: h.opcion ?? /^\s*A\S/ });
      const habilitadas = () => opciones.evaluateAll((bs) => bs.filter((b) => !(b as HTMLButtonElement).disabled).length);
      /** Los botones que se ven: la huella de la pantalla en la que se está. */
      const botonesVisibles = () => page.locator('main button:visible').allInnerTexts();

      /**
       * Clic suelto y, ya pintada la pantalla nueva, el 2.º de la ráfaga en el mismo punto.
       * Devuelve los botones visibles antes y después del 2.º: en el resultado tienen que ser los
       * mismos (si cambian, el toque ha pulsado «Repetir», «Volver a empezar» o «Cambiar nivel»).
       */
      async function dobleToque(boton: ReturnType<Page['locator']>, pintada: () => Promise<boolean>, paso: string) {
        await boton.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        const caja = (await boton.boundingBox())!;
        const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
        await page.mouse.move(x, y);
        await page.mouse.down({ clickCount: 1 });
        await page.mouse.up({ clickCount: 1 });
        await expect.poll(pintada, { intervals: [20], timeout: 3000, message: `${paso}: el primer toque cambia de pantalla` }).toBe(true);
        await page.waitForTimeout(80);
        const antes = await botonesVisibles();
        await page.mouse.down({ clickCount: 2 });
        await page.mouse.up({ clickCount: 2 });
        await page.waitForTimeout(400);
        expect(page.url(), `${paso}: la ráfaga no saca de la app`).toBe(url);
        return { antes, despues: await botonesVisibles() };
      }

      // Arranque: todos los botones menos el último, sueltos; el último, con ráfaga
      for (const b of h.arranque.slice(0, -1)) await pulsarHidratado(page, b);
      const ultimo = h.arranque.at(-1);
      if (ultimo) {
        await page.waitForFunction(
          ({ fuente, banderas }) => {
            const patron = new RegExp(fuente, banderas);
            const boton = [...document.querySelectorAll('button')].find(
              (el) => (el as HTMLElement).offsetParent !== null && patron.test(el.textContent ?? ''),
            );
            return Boolean(boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$')));
          },
          { fuente: ultimo.source, banderas: ultimo.flags },
          { timeout: 20_000 },
        );
        await dobleToque(page.locator('button:visible').filter({ hasText: ultimo }).first(), async () => (await habilitadas()) > 0, 'arranque');
        expect(await habilitadas(), 'arranque: la ráfaga no contesta la primera pregunta').toBe(await opciones.count());
      } else {
        await expect(opciones.first()).toBeVisible();
      }

      for (let paso = 1; paso <= 60; paso++) {
        await pulsarHidratado(page, h.opcion ?? /^\s*A\S/); // suelto: cierra la ráfaga
        await expect.poll(habilitadas, { message: `paso ${paso}: contestar deshabilita las opciones` }).toBe(0);
        const avanzar = page.locator('button:visible').filter({ hasText: /siguiente|resultado/i }).first();
        // Pantalla nueva: o una pregunta con sus opciones habilitadas, o el resultado (sin opciones)
        const esUltima = /resultado/i.test(await avanzar.innerText());
        const { antes, despues } = await dobleToque(
          avanzar,
          async () => (await opciones.count()) === 0 || (await habilitadas()) > 0,
          `paso ${paso}`,
        );
        if (esUltima || (await opciones.count()) === 0) {
          expect(despues, `paso ${paso}: la ráfaga no se come la nota (la pantalla del resultado sigue igual)`).toEqual(antes);
          expect(await opciones.count(), `paso ${paso}: la ráfaga no empieza otra partida`).toBe(0);
          return;
        }
        expect(await habilitadas(), `paso ${paso}: la ráfaga no contesta la pregunta nueva`).toBe(await opciones.count());
      }
      throw new Error('60 pasos sin llegar al resultado');
    });
  });
}
