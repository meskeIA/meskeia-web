import { test, expect, Page } from '@playwright/test';

/**
 * Testigo de componente — el botón de `components/EducationalSection.tsx` con la página traducida.
 *
 * Origen: cabo C0250 (inspector 14/10/2026, visto en simulador-genetica y generador-loteria). El
 * botón pintaba su rótulo como texto suelto, {isOpen ? 'Ocultar guía educativa' : 'Ver guía
 * educativa'}: el traductor del navegador cambia ese nodo de texto por <font>, React sigue
 * actualizando el nodo viejo —ya fuera del documento— y al abrir la guía el botón seguía diciendo
 * «Ver guía educativa» con aria-expanded=true. El rótulo visible y el nombre accesible mentían.
 * Es la forma del cabo C0243 en un componente que monta casi todo el catálogo.
 * REPARADO el 16/10/2026 con un <span> con key por estado, la receta del hallazgo 3314.
 *
 * Mismo traductor simulado que tests/apps/pies-portal-traducidos.spec.ts (cada texto a
 * <font><font>…). Se mide en dos apps de familias distintas.
 */

const APPS = ['/simulador-genetica/', '/calculadora-porcentajes/'] as const;

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

test.describe('EducationalSection — el botón de la guía con la página traducida (cabo C0250)', () => {
  for (const ruta of APPS) {
    test(`${ruta}: abrir y cerrar la guía traducida cambia el rótulo y no tumba la página`, async ({ page }) => {
      test.setTimeout(60_000);
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
      });

      await page.goto(ruta);
      const boton = page.getByRole('button', { name: /guía educativa/ }).first();
      await expect(boton).toHaveAttribute('aria-expanded', 'false');
      // Hidratado: React ya ha puesto sus props en el botón.
      await page.waitForFunction(() => {
        const b = Array.from(document.querySelectorAll('button[aria-expanded]')).find((x) => /guía educativa/.test(x.textContent ?? ''));
        return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
      });

      await traducir(page);
      await boton.click();
      await expect(boton).toHaveAttribute('aria-expanded', 'true');
      await expect(boton).toHaveText('⬆️ Ocultar guía educativa');

      await traducir(page);
      await boton.click();
      await expect(boton).toHaveAttribute('aria-expanded', 'false');
      await expect(boton).toHaveText('⬇️ Ver guía educativa');
      expect(errores).toEqual([]);
    });
  }
});
