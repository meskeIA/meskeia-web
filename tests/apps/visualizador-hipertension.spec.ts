import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * visualizador-hipertension — el color de los datos como texto y bajo texto (cabo C0798, 20/11/2026).
 *
 * Medido antes con tests/contraste-marca-datos.spec.ts (fila de la app, que recorre las cuatro
 * secciones en su estado inicial):
 *   · claro: «Riesgo: …» en el color de cada etapa sobre su pastel, 1,98 («Bajo», #2ECC71) a
 *     3,99:1; blanco sobre la fase 1 elegida (#E74C3C), 3,82:1.
 *   · oscuro: el nombre y los valores de cada etapa en el texto claro del tema sobre el pastel, que
 *     no cambiaba de tema, 1,06-1,17:1.
 * Aquí se miden los estados que el testigo no recorre: cada etapa, cada fase y cada órgano ELEGIDOS
 * (el botón con su relleno y el detalle que se abre), en los dos temas. Cada texto visible con
 * texto propio, contra su fondo compuesto: 4,5:1, o 3:1 si es grande (≥ 24 px, o ≥ 18,66 px en
 * negrita). Lo que lleva aria-hidden no cuenta.
 */

async function suspensos(page: Page, ambito: string): Promise<string[]> {
  return page.evaluate((sel) => {
    const lz = document.createElement('canvas');
    lz.width = lz.height = 1;
    const ctx = lz.getContext('2d', { willReadFrequently: true })!;
    const norm = (css: string): number[] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const can = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (p: number[]) => 0.2126 * can(p[0]) + 0.7152 * can(p[1]) + 0.0722 * can(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const fondo = (el: Element): number[] => {
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = norm(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) capas.push(c);
        if (c[3] >= 1) break;
      }
      let b = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) b = [0, 1, 2].map((k) => capas[i][k] * capas[i][3] + b[k] * (1 - capas[i][3]));
      return b;
    };
    const fuera: string[] = [];
    for (const raiz of Array.from(document.querySelectorAll(sel))) {
      for (const el of [raiz, ...Array.from(raiz.querySelectorAll('*'))]) {
        if (!Array.from(el.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? '').trim())) continue;
        if (el.closest('[aria-hidden="true"]')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const fg = norm(cs.color);
        const px = parseFloat(cs.fontSize);
        const umbral = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
        const f = fondo(el);
        const v = ratio(fg, f);
        if (v < umbral) fuera.push(`«${(el.textContent ?? '').trim().slice(0, 40)}» rgb(${fg.slice(0, 3)}) sobre rgb(${f.map(Math.round)}): ${v.toFixed(2)}:1`);
      }
    }
    return Array.from(new Set(fuera));
  }, ambito);
}

/** Elige uno a uno los botones de la sección y mide el botón elegido y el detalle. */
async function recorrerElegidos(page: Page, seccion: string, detalle: string): Promise<string[]> {
  await page.locator('nav[aria-label*="ecciones"] button', { hasText: seccion }).click();
  const botones = page.locator('main button[aria-pressed], [class*="seccionContent"] button[aria-pressed]');
  const n = await botones.count();
  expect(n, `botones de ${seccion}`).toBeGreaterThan(2);
  const fuera: string[] = [];
  for (let i = 0; i < n; i++) {
    const b = botones.nth(i);
    if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click();
    await expect(b).toHaveAttribute('aria-pressed', 'true');
    const nombre = ((await b.innerText()).split('\n')[0] ?? '').trim();
    for (const s of await suspensos(page, `[class*="seccionContent"] button[aria-pressed="true"], ${detalle}`)) {
      fuera.push(`${seccion} · ${nombre}: ${s}`);
    }
  }
  return fuera;
}

const SECCIONES: [string, string][] = [
  ['Presión arterial', '[class*="etapaDetalle"]'],
  ['Daño arterial', '[class*="faseDetalle"]'],
  ['Órganos diana', '[class*="organoDetalle"]'],
];

test.describe('visualizador-hipertension — etapas, fases y órganos elegidos se leen en los dos temas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visualizador-hipertension/');
    await prepararParaMedir(page);
  });

  for (const tema of ['claro', 'oscuro'] as const) {
    test(`C0798 · ${tema}: cada botón elegido y su detalle llegan a 4,5:1`, async ({ page }) => {
      test.setTimeout(90_000);
      if (tema === 'oscuro') await activarTemaOscuro(page);
      const fuera: string[] = [];
      for (const [seccion, detalle] of SECCIONES) fuera.push(...(await recorrerElegidos(page, seccion, detalle)));
      expect(fuera).toEqual([]);
    });
  }

  test('C0798 · en oscuro, las etapas sin elegir van sobre la tarjeta, no sobre el pastel claro', async ({ page }) => {
    await activarTemaOscuro(page);
    const fuera = await suspensos(page, '[class*="etapaBtn"]');
    expect(fuera).toEqual([]);
  });
});
