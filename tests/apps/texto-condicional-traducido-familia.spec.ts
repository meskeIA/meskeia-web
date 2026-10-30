import { test, expect, type Page, type Locator } from '@playwright/test';
import { asentarAntesDeTraducir } from './_hidratacion';

/**
 * Testigo de familia — texto suelto que aparece y desaparece, con la página traducida.
 *
 * DE DÓNDE SALE (cabo C0312, 19/10/2026; vecino de C0262 y de C0243)
 * `{x && 'texto'}` como hijo de JSX: al pasar x a false, React retira el nodo de texto, que con
 * la página traducida ya es un <font>, y la app cae con NotFoundError en removeChild — la misma
 * caída del ternario de C0262, que el candado check:ternario-traducido deja fuera a propósito.
 *
 * Medido el 19/10/2026 (.reparar-trabajo/medir-c0312.mjs de la copia de reparar):
 *   · CON HERMANOS cae: visualizador-germinacion (frases del resultado) y analizador-titulos-seo
 *     («Contiene números (recomendado)»).
 *   · Como HIJO ÚNICO de su elemento no cae (el ✓ de checklist-preparar-verifactu): React lo
 *     cambia con textContent. Es el control de abajo.
 * Receta: el texto condicional en su propio <span>; React retira el elemento, no el texto.
 * Reinyección: con `{germinaOK && '…'}` de vuelta en visualizador-germinacion, su test cae.
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

const hidratado = (loc: Locator) =>
  expect
    .poll(() => loc.evaluate((b) => Object.keys(b).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);

interface Caso {
  slug: string;
  /** Deja visible el texto condicional y devuelve lo que lo retira. */
  preparar: (page: Page) => Promise<() => Promise<void>>;
}

const CASOS: Caso[] = [
  {
    slug: 'visualizador-germinacion',
    preparar: async (page) => {
      const factores = page.getByRole('button', { name: /Factores/ }).first();
      await hidratado(factores);
      await factores.click();
      // germinaOK: «Las condiciones son adecuadas…»; quitar el agua lo retira
      return () => page.getByRole('button', { name: /^Agua / }).click();
    },
  },
  {
    slug: 'analizador-titulos-seo',
    preparar: async (page) => {
      const campo = page.locator('input[placeholder="Escribe tu título SEO aquí..."]');
      await hidratado(campo);
      await campo.fill('Guía completa de jardinería para principiantes en casa');
      await expect(page.getByText('(recomendado)')).toBeVisible();
      // Un número en el título retira «(recomendado)»
      return () => campo.fill('7 trucos de jardinería para principiantes en casa');
    },
  },
  {
    // Control: hijo único de su elemento. No cae ni ha caído nunca.
    slug: 'checklist-preparar-verifactu',
    preparar: async (page) => {
      const casilla = page.locator('input[type="checkbox"]').first();
      const etiqueta = page.locator('label').filter({ has: casilla }).first();
      await hidratado(casilla);
      await etiqueta.click();
      return () => etiqueta.click();
    },
  },
];

test.describe('texto condicional con la página traducida (C0312)', () => {
  for (const c of CASOS) {
    test(`${c.slug}: retirar el texto condicional con la página traducida no tumba la app`, async ({ page }) => {
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
      });

      await page.goto(`/${c.slug}/`);
      const retirar = await c.preparar(page);
      await traducir(page);
      await retirar();
      await page.waitForTimeout(300);

      await expect(page.getByText('Algo salió mal')).toHaveCount(0);
      expect(errores).toEqual([]);
    });
  }
});
