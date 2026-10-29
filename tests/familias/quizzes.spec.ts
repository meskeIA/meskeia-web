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
 *   > Al contestar, el foco va a «Siguiente» SIN centrarlo: se ve entero y, si la página se ha
 *   > movido, lo justo para que asome por abajo, con el veredicto encima a la vista (hallazgo 3770,
 *   > 29/10/2026: con `focus()` a secas Chrome lo centraba y el veredicto quedaba bajo la píldora
 *   > del logo; receta, `enfocarSinCentrar` de lib/cromoFijo.ts).
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
  /** Ídem para «Siguiente» enfocado sin centrar (hallazgo 3770); `omitido` si no enfoca el botón. */
  sinCentrar?: { falla?: string; omitido?: string };
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
    // Al contestar no enfoca «Siguiente»: enfoca el bloque de la revelación con enfocarALaVista,
    // que lo pone arriba con el veredicto dentro. El caso del 3770 no se aplica.
    sinCentrar: { omitido: 'enfoca el bloque de la revelación, no el botón «Siguiente»' },
  },
];

/**
 * Estas apps no tienen <input>, así que `esperarHidratacion` (que sondea el rastreador de valor
 * de un input) no sirve: el equivalente es que React haya colgado sus props del botón con el que
 * se va a interactuar. Mismo criterio que tests/familias/selectores.spec.ts.
 */
async function pulsarHidratado(page: Page, texto: RegExp): Promise<void> {
  await esperarHidratado(page, texto);
  await page.locator('button:visible').filter({ hasText: texto }).first().click();
}

async function esperarHidratado(page: Page, texto: RegExp): Promise<void> {
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

    /**
     * El doble toque sobre la OPCIÓN (hallazgos 3679, 3701 y 3751, 28/10/2026). Al contestar, el
     * foco va a «Siguiente» y, si el botón está bajo el borde, el navegador sube la página y lo
     * deja bajo el dedo: el 2.º toque lo pulsaba y la explicación no llegaba a verse. A 360 × 740
     * y 375 × 667, donde lo midió el Inspector. Esperado: el 2.º toque no hace nada (sigue la misma
     * pregunta, contestada). Y lo que la guarda NO puede comerse: contestar y pulsar «Siguiente»
     * deprisa, con el dedo YA en otro sitio, que Chrome también cuenta como detail 2.
     */
    test('doble toque en la opción: el 2.º toque no se salta la explicación, y el «Siguiente» rápido pasa', async ({ page }) => {
      test.skip(Boolean(h.dobleToque?.omitido), h.dobleToque?.omitido);
      test.setTimeout(180_000);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const opciones = page.locator('button:visible').filter({ hasText: h.opcion ?? /^\s*A\S/ });
      const habilitadas = () => opciones.evaluateAll((bs) => bs.filter((b) => !(b as HTMLButtonElement).disabled).length);
      const avanzar = () => page.locator('button:visible').filter({ hasText: /siguiente|resultado/i }).first();
      const saltos: string[] = [];

      for (const viewport of [{ width: 360, height: 740 }, { width: 375, height: 667 }]) {
        await page.setViewportSize(viewport);
        await page.goto(`/${h.slug}/`);
        const url = page.url();
        for (const boton of h.arranque) await pulsarHidratado(page, boton);
        await esperarHidratado(page, h.opcion ?? /^\s*A\S/);
        for (let paso = 1; paso <= 60; paso++) {
          await expect.poll(habilitadas, { message: `${viewport.width} · paso ${paso}: pregunta nueva sin contestar` }).toBeGreaterThan(0);
          await page.waitForTimeout(350); // fuera de la ventana de ráfaga del «Siguiente» anterior
          const opcion = opciones.first();
          await opcion.scrollIntoViewIfNeeded();
          const caja = (await opcion.boundingBox())!;
          await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
          await page.mouse.down({ clickCount: 1 });
          await page.mouse.up({ clickCount: 1 });
          await expect.poll(habilitadas, { intervals: [20], timeout: 3000 }).toBe(0);
          await page.waitForTimeout(80);
          await page.mouse.down({ clickCount: 2 });
          await page.mouse.up({ clickCount: 2 });
          await page.waitForTimeout(400);
          expect(page.url(), `${viewport.width} · paso ${paso}: la ráfaga no saca de la app`).toBe(url);
          // Sigue en la pregunta contestada si «Siguiente» (o «Ver resultado») sigue a la vista y
          // ninguna opción está habilitada. En mitos-ciencia las opciones desaparecen al contestar:
          // por eso no vale mirar solo las opciones.
          const sigueContestada = (await avanzar().isVisible()) && (await habilitadas()) === 0;
          if (!sigueContestada) saltos.push(`${viewport.width} · paso ${paso}`);
          if (!sigueContestada) {
            if ((await habilitadas()) === 0) break; // saltó al resultado
            continue;
          }
          const esUltima = /resultado/i.test(await avanzar().innerText());
          await avanzar().click();
          if (esUltima) break;
        }
      }
      expect(saltos, 'el 2.º toque sobre la opción pulsó «Siguiente» y se saltó la explicación').toEqual([]);

      // El «Siguiente» rápido de quien ha movido el dedo hasta él: avanza
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/${h.slug}/`);
      for (const boton of h.arranque) await pulsarHidratado(page, boton);
      await pulsarHidratado(page, h.opcion ?? /^\s*A\S/);
      const sig = avanzar();
      await expect(sig).toBeVisible();
      await sig.scrollIntoViewIfNeeded();
      const c = (await sig.boundingBox())!;
      await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
      await page.mouse.down({ clickCount: 2 });
      await page.mouse.up({ clickCount: 2 });
      await expect.poll(habilitadas, { message: 'un «Siguiente» con detail 2 en otro punto se ha comido' }).toBeGreaterThan(0);
    });

    /**
     * Hallazgo 3770 (quiz-literatura-universal, 29/10/2026): al contestar, `focus()` a secas en
     * «Siguiente» deja que Chrome lo CENTRE, y con una explicación larga la página baja de golpe y
     * el veredicto se va bajo la píldora del logo. A 360 × 640, en las cinco primeras preguntas:
     * «Siguiente» con el foco, entero en la ventana, y si la página se ha movido al contestar, con
     * su borde inferior a menos de 40 px del de la ventana (`nearest`), no en el centro.
     */
    test('al contestar, «Siguiente» recibe el foco sin centrarse: se ve entero y la página no salta', async ({ page }) => {
      test.skip(Boolean(h.sinCentrar?.omitido), h.sinCentrar?.omitido);
      if (h.sinCentrar?.falla) test.fail();
      test.setTimeout(120_000);
      await page.setViewportSize({ width: 360, height: 640 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${h.slug}/`);
      for (const boton of h.arranque) await pulsarHidratado(page, boton);
      await esperarHidratado(page, h.opcion ?? /^\s*A\S/);
      const opciones = page.locator('button:visible').filter({ hasText: h.opcion ?? /^\s*A\S/ });
      const avanzar = () => page.locator('button:visible').filter({ hasText: /siguiente|resultado/i }).first();
      const fallos: string[] = [];
      for (let paso = 1; paso <= 5; paso++) {
        const opcion = opciones.first();
        await opcion.scrollIntoViewIfNeeded();
        await page.waitForTimeout(350); // fuera de la ventana de ráfaga del paso anterior
        const caja = (await opcion.boundingBox())!;
        const antes = await page.evaluate(() => window.scrollY);
        await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
        await expect(avanzar()).toBeFocused();
        // Hasta que la página deje de moverse (un desplazamiento suave anterior puede seguir en curso)
        let previo = -1;
        for (let i = 0; i < 30; i++) {
          await page.waitForTimeout(100);
          const y = await page.evaluate(() => window.scrollY);
          if (y === previo) break;
          previo = y;
        }
        const m = await avanzar().evaluate((b) => {
          const r = b.getBoundingClientRect();
          return { arriba: r.top, abajo: r.bottom, alto: window.innerHeight, scroll: window.scrollY };
        });
        const seMovio = Math.abs(m.scroll - antes) > 1;
        if (m.arriba < 0 || m.abajo > m.alto + 1) fallos.push(`paso ${paso}: «Siguiente» fuera (y = ${m.arriba}…${m.abajo})`);
        else if (seMovio && m.alto - m.abajo > 40) {
          fallos.push(`paso ${paso}: la página saltó ${Math.round(m.scroll - antes)} px y «Siguiente» quedó en y = ${Math.round(m.arriba)}…${Math.round(m.abajo)}`);
        }
        if (/resultado/i.test(await avanzar().innerText())) break;
        await avanzar().click();
      }
      expect(fallos).toEqual([]);
    });
  });
}
