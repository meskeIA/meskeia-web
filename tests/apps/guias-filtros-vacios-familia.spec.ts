import { test, expect, type Page } from '@playwright/test';

/**
 * Testigo de familia — ningún filtro de una guía-directorio deja la guía vacía (cabo C0658, D).
 *
 * DE DÓNDE SALE
 * guia-frutas-exoticas (inspector 07/11/2026): «Sabor = Aromático» daba 0 fichas, porque las
 * opciones se escribían a mano y ninguna fruta llevaba ese sabor (lo mismo en guia-tipos-arroz).
 * Medido el 07/11/2026 en todas las app/guia-* (.reparar-trabajo/medir-c0658-d.mjs de la copia de
 * reparar): cinco más con una opción que no casaba con nada (aceite-oliva: Marruecos y Picante
 * intenso; aves-comunes: Migratoria y Ocasional; cortes-carne: Crudo; tejidos-fibras:
 * Natural-Mineral; vinagres-mundo: acidez Muy alta). Receta: la lista de opciones se deriva de
 * las fichas (`ORDEN.filter((x) => FICHAS.some(…))`), así que una opción sin fichas no sale.
 *
 * QUÉ MIDE
 * Recorre cada <option> de cada <select> y cada botón con aria-pressed de cada role="group", y
 * exige que no aparezca el aviso de «sin resultados». Control: con la lista escrita a mano,
 * «Filtrar por método de cocción = Crudo» de guia-cortes-carne lo enciende.
 * Una guía nueva con filtros: su fila aquí.
 */

const SLUGS = [
  'guia-aceite-oliva',
  'guia-aves-comunes',
  'guia-cortes-carne',
  'guia-frutas-exoticas',
  'guia-tejidos-fibras',
  'guia-tipos-arroz',
  'guia-vinagres-mundo',
];

const VACIO = /no (hay|se (han )?encontr|encontramos|coincide)|sin resultados|ning[uú]n[ao]? (resultado|ficha|coincid)|0 resultados|mostrando 0/i;

const avisoVacio = (page: Page) =>
  page.evaluate((re) => {
    const r = new RegExp(re, 'i');
    return [...document.querySelectorAll('p, div, span, li')].some(
      (e) =>
        e.children.length === 0 &&
        (e as HTMLElement).offsetParent !== null &&
        r.test(e.textContent || '') &&
        !e.closest('footer, details, [class*="educat" i], [class*="faq" i]'),
    );
  }, VACIO.source);

test.describe('guías-directorio · ningún filtro deja la guía vacía (C0658)', () => {
  for (const slug of SLUGS) {
    test(`${slug}: cada opción de filtro deja alguna ficha`, async ({ page }) => {
      await page.goto(`/${slug}/`);
      // Hidratado: un control de filtro ya tiene sus props de React
      const control = page.locator('[role="group"] button[aria-pressed], select').first();
      await expect(control).toBeVisible();
      await expect
        .poll(() => control.evaluate((b) => Object.keys(b).some((k) => k.startsWith('__reactProps$'))))
        .toBe(true);
      expect(await avisoVacio(page), 'al cargar no sale el aviso (si no, la fila no mide)').toBe(false);

      const vacias: string[] = [];
      let probadas = 0;

      const selects = page.locator('select');
      for (let s = 0; s < (await selects.count()); s++) {
        const sel = selects.nth(s);
        if (!(await sel.isVisible())) continue;
        const opciones = await sel
          .locator('option')
          .evaluateAll((os) => os.map((o) => ({ v: (o as HTMLOptionElement).value, t: (o.textContent || '').trim() })));
        const etiqueta = (await sel.getAttribute('aria-label')) ?? `select ${s}`;
        for (const o of opciones.slice(1)) {
          await sel.selectOption(o.v);
          await expect(sel).toHaveValue(o.v);
          probadas++;
          if (await avisoVacio(page)) vacias.push(`${etiqueta} = ${o.t}`);
        }
        await sel.selectOption(opciones[0].v);
      }

      const grupos = page.locator('[role="group"]');
      for (let g = 0; g < (await grupos.count()); g++) {
        const grupo = grupos.nth(g);
        if (!(await grupo.isVisible())) continue;
        const botones = grupo.locator('button[aria-pressed]');
        const n = await botones.count();
        if (n < 2) continue;
        const etiqueta = (await grupo.getAttribute('aria-label')) ?? `grupo ${g}`;
        const inicial = await botones.evaluateAll((bs) => bs.findIndex((b) => b.getAttribute('aria-pressed') === 'true'));
        for (let b = 0; b < n; b++) {
          if (b === inicial) continue;
          const btn = botones.nth(b);
          const texto = ((await btn.textContent()) || '').trim();
          await btn.click();
          await expect(btn).toHaveAttribute('aria-pressed', 'true');
          probadas++;
          if (await avisoVacio(page)) vacias.push(`${etiqueta} = ${texto}`);
          if (inicial >= 0) await botones.nth(inicial).click();
          else await btn.click();
        }
      }

      expect(probadas, 'la guía tiene filtros que probar').toBeGreaterThan(0);
      expect(vacias).toEqual([]);
    });
  }
});
