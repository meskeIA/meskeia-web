import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Testigo de familia — los botones de ayuda de «Casos para clase» (CasosAula.tsx), con la
 * página traducida por el navegador.
 *
 * DE DÓNDE SALE: hallazgo 3297 (d) de simulador-genetica, 14/10/2026, forma del cabo C0243. El
 * rótulo era `<span>🔑</span> {verSolucion ? 'Ocultar solución' : 'Ver solución'}`: el texto
 * variable, un nodo suelto junto al emoji. Un traductor del navegador cambia cada nodo de texto
 * por <font>; React sigue escribiendo en el nodo que el traductor retiró, y la solución se
 * abría (aria-expanded = true) con el botón diciendo todavía «Ver solución». El componente
 * está copiado en ~30 apps con el mismo rótulo (y los de «Verlo en el simulador» y «Ver por
 * qué pasa»), así que se reparó en todas: cada rótulo es ahora el único hijo de su <span>, y
 * React lo sustituye entero.
 *
 * Mide COMPORTAMIENTO, no la forma del código: abre cada app que tenga un CasosAula.tsx, la
 * traduce con el mismo traductor simulado que los specs del cabo C0233 y pulsa cada botón de
 * ayuda cerrado. La lista sale del árbol de `app/`, así que una hermana nueva entra sola.
 */

const RAIZ_APP = path.join(process.cwd(), 'app');
const SLUGS = fs
  .readdirSync(RAIZ_APP)
  .filter((slug) =>
    ['CasosAula.tsx', 'components/CasosAula.tsx'].some((rel) => fs.existsSync(path.join(RAIZ_APP, slug, rel))),
  )
  .sort();

test('hay apps con CasosAula que medir', () => {
  expect(SLUGS.length).toBeGreaterThan(20);
});

for (const slug of SLUGS) {
  test(`${slug} · traducida, cada botón de ayuda abierto pasa a «Ocultar…»`, async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto(`/${slug}/`);
    await esperarPaginaAsentada(page);

    // Dos variantes del componente: `casoAyudaBoton` y, en las de predicción (vsepr, ecosistema,
    // funciones), `aulaBtnSecundario` con aria-expanded.
    const cerrados = page.locator(
      '[class*="casoAyudaBoton"][aria-expanded="false"]:visible:enabled, [class*="aulaBtnSecundario"][aria-expanded="false"]:visible:enabled',
    );
    expect(await cerrados.count(), 'el CasosAula se ve en la página').toBeGreaterThan(0);

    // Uno a uno, sobre la página recién traducida: al abrirse, sale del filtro de «cerrados».
    for (let vuelta = 0; vuelta < 4 && (await cerrados.count()) > 0; vuelta++) {
      await page.evaluate(() => {
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
      const boton = cerrados.first();
      const antes = ((await boton.textContent()) ?? '').trim();
      const id = await boton.evaluate((el) => {
        const marca = `testigo-${Math.random().toString(36).slice(2)}`;
        el.setAttribute('data-testigo', marca);
        return marca;
      });
      await boton.click();
      const pulsado = page.locator(`[data-testigo="${id}"]`);
      await expect(pulsado).toHaveAttribute('aria-expanded', 'true');
      await expect(pulsado, `«${antes}» abierto`).toContainText('Ocultar');
    }
    expect(errores).toEqual([]);
  });
}
