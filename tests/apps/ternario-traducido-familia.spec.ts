import { test, expect, type Page } from '@playwright/test';

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

const traducir = (page: Page) =>
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
