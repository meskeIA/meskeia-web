import { test, expect, Page } from '@playwright/test';
import { asentarAntesDeTraducir } from './_hidratacion';

/**
 * Testigo de familia — el botón «Compartir» de los pies de portal con la página traducida.
 *
 * Origen: hallazgo 3314 (generador-loteria, 15/10/2026). `components/ShareCard.tsx` pintaba su
 * botón como {copiado ? '✓ ¡Copiado!' : <><span>🔗</span> Copiar enlace</>}: al copiar, React
 * retiraba el texto suelto « Copiar enlace», que el traductor del navegador ya había cambiado
 * por <font>, y la app caía con NotFoundError en removeChild (la forma del cabo C0233). Los
 * cuatro pies de portal (Stemum, Coquinum, Cronicum, Delegum) tenían la misma forma en su
 * «Compartir» → «✓ Enlace copiado». REPARADOS el 15/10/2026 con un <span> con key por estado.
 *
 * Sin `navigator.share` (escritorio), el botón copia al portapapeles y cambia de rótulo: es la
 * rama que cambia el DOM, y la que se mide aquí con el mismo traductor simulado del spec de
 * generador-loteria (cada texto a <font><font>…).
 */

const PORTALES = ['/stemum/', '/coquinum/', '/cronicum/', '/delegum/'] as const;

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

test.describe('pies de portal — «Compartir» con la página traducida (hallazgo 3314)', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test.beforeEach(async ({ page }) => {
    // La rama del portapapeles es la del escritorio sin hoja de compartir del sistema.
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'share', { value: undefined, configurable: true });
    });
  });

  for (const ruta of PORTALES) {
    test(`${ruta}: copiar y volver con la página traducida no tumba la página`, async ({ page }) => {
      test.setTimeout(60_000);
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
      });

      await page.goto(ruta);
      const boton = page.locator('footer').getByRole('button', { name: /Compartir/ });
      await expect(boton).toHaveCount(1);
      // Hidratado: React ya ha puesto sus props en el botón.
      await page.waitForFunction(() => {
        const b = Array.from(document.querySelectorAll('footer button')).find((x) => /Compartir/.test(x.textContent ?? ''));
        return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
      });

      await traducir(page);
      await boton.click();
      const copiado = page.locator('footer').getByRole('button', { name: /Enlace copiado/ });
      await expect(copiado).toHaveText('✓ Enlace copiado');
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('ref=share');

      await traducir(page);
      await expect(page.locator('footer').getByRole('button', { name: /Compartir/ })).toHaveText('🔗 Compartir', { timeout: 5_000 });
      expect(errores).toEqual([]);
    });
  }
});
