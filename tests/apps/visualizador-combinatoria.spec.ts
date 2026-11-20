import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * visualizador-combinatoria — árbol de posibilidades (/reparar 20/11/2026, cabo C0297)
 *
 * Visto al medir el contraste de su SVG: cada nivel del árbol repetía 1, 2, 3… sin mirar la rama
 * (bajo el «1» volvía a salir el «1»), los hijos de padres distintos caían en la misma x y se
 * pintaban unos encima de otros (con n = 4 y k = 2 se veían 6 hojas de 12, una gris debajo de una
 * azul), y con n = 5 solo se dibujaba la raíz.
 *
 * CASOS, resueltos a mano:
 *   n = 4, k = 2 (valores iniciales): P(4,2) = 4·3 = 12 hojas; bajo cada elemento del primer nivel,
 *     los otros tres, así que ningún nodo repite el valor de su padre; 12 x distintas.
 *   n = 5, k = 3: P(5,3) = 5·4·3 = 60 hojas, en 60 x distintas (el árbol se ensancha y hace scroll).
 */

interface Nodo { valor: string; x: number; y: number }

async function nodosDelArbol(page: Page): Promise<Nodo[]> {
  return page.locator("svg[aria-label^='Árbol de permutaciones'] g").evaluateAll((gs) =>
    gs.map((g) => {
      const c = g.querySelector('circle')!;
      return { valor: g.querySelector('text')?.textContent ?? '', x: +c.getAttribute('cx')!, y: +c.getAttribute('cy')! };
    }),
  );
}

function hojas(nodos: Nodo[]): Nodo[] {
  const yMax = Math.max(...nodos.map((n) => n.y));
  return nodos.filter((n) => n.y === yMax);
}

test.describe('visualizador-combinatoria', () => {
  test('el árbol de P(n,k) tiene P(n,k) hojas sin montarse y sin repetir el valor en la rama', async ({ page }) => {
    await page.goto('/visualizador-combinatoria/');
    await esperarPaginaAsentada(page);

    const nodos = await nodosDelArbol(page);
    const finales = hojas(nodos);
    expect(finales).toHaveLength(12);
    expect(new Set(finales.map((h) => h.x)).size).toBe(12);
    // Las hojas que cuelgan del primer «1» del nivel 1 son 2, 3 y 4, en orden
    expect(finales.slice(0, 3).map((h) => h.valor)).toEqual(['2', '3', '4']);
    expect(finales.map((h) => h.valor).join('')).toBe('234134124123');

    await page.locator('#n-total').fill('5');
    await page.locator('#k-elegir').fill('3');
    await expect(page.locator('#k-elegir')).toHaveValue('3');
    const finales5 = hojas(await nodosDelArbol(page));
    expect(finales5).toHaveLength(60);
    expect(new Set(finales5.map((h) => h.x)).size).toBe(60);
  });
});
