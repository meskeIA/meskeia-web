import { test, expect, type Page } from '@playwright/test';
import { asentarAntesDeTraducir } from './_hidratacion';

/**
 * Testigo de familia — un rótulo que alterna texto suelto y fragmento, con la página traducida.
 *
 * DE DÓNDE SALE (cabo C0262, 19/10/2026; hallazgo 3314 y cabo C0233)
 * La forma {copiado ? '✓ Copiado' : <><span aria-hidden>📋</span> Copiar</>}: al cambiar de rama,
 * React retira un nodo de texto suelto que el traductor del navegador ya ha cambiado por <font>,
 * y la app cae con NotFoundError en removeChild («Algo salió mal»). Se reparó en ShareCard y los
 * cuatro pies de portal (ecebbe72) y el 19/10/2026 en las 18 apariciones de una sola línea del
 * catálogo, con la misma receta: cada rama en su <span> con key. La key es lo que importa: dos
 * <span> sin ella se reutilizarían y React volvería a retirar el texto de dentro.
 *
 * Aquí se mide en las que cambian de rama con un clic: se traduce, se pulsa, se espera al otro
 * rótulo, se vuelve a traducir y se espera a que vuelva el primero. Ningún error de página.
 * Reinyección: con el ternario viejo en generador-sombras, el test de esa app cae.
 */

// Antes del primer <font>, la página entera asentada (cabo C0493: ver asentarAntesDeTraducir)
const traducir = async (page: Page) => {
  await asentarAntesDeTraducir(page);
  return traducirYa(page);
};
const traducirYa = (page: Page) =>
  page.evaluate(() => {
    const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const padre = n.parentElement;
        if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodos: Text[] = [];
    while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
    for (const nodo of nodos) {
      const exterior = document.createElement('font');
      const interior = document.createElement('font');
      interior.textContent = nodo.nodeValue;
      exterior.appendChild(interior);
      nodo.parentNode?.replaceChild(exterior, nodo);
    }
  });

interface Caso {
  slug: string;
  /** El botón, por su texto de reposo. */
  boton: RegExp;
  /** El texto que enseña tras el clic. */
  despues: RegExp;
}

const CASOS: Caso[] = [
  { slug: 'generador-sombras', boton: /^📋 Copiar$/, despues: /Copiado/ },
  { slug: 'generador-gitignore', boton: /^📋 Copiar$/, despues: /Copiado/ },
  { slug: 'generador-tipografias', boton: /^📋 Copiar$/, despues: /Copiado/ },
  { slug: 'generador-gradientes', boton: /^📋 Copiar$/, despues: /Copiado/ },
  { slug: 'cara-o-cruz', boton: /Lanzar Moneda/, despues: /Lanzando/ },
  // La encontró el candado check:ternario-traducido al nacer (19/10/2026): el censo de la tanda no la vio
  { slug: 'generador-incipit', boton: /^📋 Copiar$/, despues: /Copiado/ },
];

test.describe('ternario de texto y fragmento con la página traducida (C0262)', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  for (const c of CASOS) {
    test(`${c.slug}: cambiar de rótulo con la página traducida no tumba la app`, async ({ page }) => {
      test.setTimeout(60_000);
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
      });

      await page.goto(`/${c.slug}/`);
      const boton = page.locator('button').filter({ hasText: c.boton }).first();
      await expect(boton).toBeVisible();
      // Hidratado: React ya ha puesto sus props en el botón.
      await expect
        .poll(() => boton.evaluate((b) => Object.keys(b).some((k) => k.startsWith('__reactProps$'))))
        .toBe(true);

      await traducir(page);
      await boton.click();
      await expect(page.locator('button').filter({ hasText: c.despues }).first()).toBeVisible();

      await traducir(page);
      // Vuelve solo (los «Copiado» duran unos segundos; la moneda acaba de girar)
      await expect(page.locator('button').filter({ hasText: c.boton }).first()).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('Algo salió mal')).toHaveCount(0);
      expect(errores).toEqual([]);
    });
  }
});

// Cabo C0438 (25/10/2026): dos FRAGMENTOS con texto suelto y distinta forma. conversor-colores
// caía al pasar de PNG a JPEG con la página traducida (medido antes de la campaña: NotFoundError
// en removeChild, con .reparar-trabajo/medir-c0438.mjs de la copia). Se va y se vuelve,
// traduciendo antes de cada cambio.
test('C0438 · conversor-colores: cambiar el formato de descarga con la página traducida no tumba la app', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
  });
  await page.goto('/conversor-colores/');
  const jpeg = page.getByRole('button', { name: /JPEG/ });
  const png = page.getByRole('button', { name: /PNG/ });
  await expect(jpeg).toBeVisible();
  await expect
    .poll(() => jpeg.evaluate((b) => Object.keys(b).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);

  await traducir(page);
  await jpeg.click();
  await expect(jpeg).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/JPEG comprime por bloques/)).toBeVisible();

  await traducir(page);
  await png.click();
  await expect(png).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/PNG conserva el color/)).toBeVisible();
  await expect(page.getByText('Algo salió mal')).toHaveCount(0);
  expect(errores).toEqual([]);
});
