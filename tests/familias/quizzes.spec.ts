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
 * Lo que NO mide todavía: el doble toque en «Siguiente» (cabo C0082, con receta en la
 * referencia, ce0ad0bc) ni que el enunciado quede a la vista bajo la barra fija a 360 px. Son
 * recetas de la misma familia, y entran aquí como casos nuevos con su `falla` por hermana.
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
    opcion: /Alga|Briófito|Pteridófito|Gimnosperma|Monocotiledónea|Dicotiledónea/,
    foco: { falla: 'C0018, 23/10/2026: tras «Siguiente» el foco cae a body' },
  },
  {
    slug: 'quiz-mitos-ciencia',
    arranque: [EMPEZAR],
    opcion: /Verdad/,
    foco: { falla: 'C0018, 23/10/2026: tras «Siguiente» el foco cae a body' },
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
  });
}
