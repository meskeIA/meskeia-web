import { test, expect, type Page, type Locator } from '@playwright/test';
import { asentarAntesDeTraducir } from './_hidratacion';

/**
 * Testigo de familia — el rótulo que se queda VIEJO con la página traducida (cabo C0243).
 *
 * DE DÓNDE SALE
 * `<span aria-hidden>{emoji}</span>{' '}{x ? 'Ocultar solución' : 'Ver solución'}`: el texto
 * variable es un nodo de texto con hermanos. El traductor del navegador lo sustituye por un
 * <font>; al cambiar x, React escribe en el nodo de texto que ya no está en la página, y en
 * pantalla sigue el rótulo anterior. No cae nada: miente en silencio (generador-loteria, 14/10).
 * Receta (f254d87d): el texto variable como HIJO ÚNICO de su elemento,
 * `<span>{x ? 'Ocultar…' : 'Ver…'}</span>`: React usa entonces textContent y se lleva el <font>.
 *
 * Las nueve apps de la nota del 14/10/2026 del cabo, reparadas el 06/11/2026. El censo de la
 * forma en el resto del catálogo (más de cien nodos, ~35 de ellos el título de sección de los
 * visualizadores) queda en el cabo: añadir aquí la fila de cada app que se repare.
 * Control: sin la reparación, el caso de generador-laberintos lee «Ver solución» tras pulsar.
 */

// Traductor simulado: cada nodo de texto visible, a <font><font>texto</font></font>
const traducir = async (page: Page) => {
  await asentarAntesDeTraducir(page);
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
};

const hidratado = (loc: Locator) =>
  expect
    .poll(() => loc.evaluate((b) => Object.keys(b).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);

interface Caso {
  slug: string;
  /** El rótulo antes y después de pulsar */
  antes: string;
  despues: string;
  /** Lo que hay que hacer para que el conmutador esté en pantalla */
  preparar?: (page: Page) => Promise<void>;
}

const generar = (nombre: RegExp) => async (page: Page) => {
  const boton = page.getByRole('button', { name: nombre }).first();
  await hidratado(boton);
  await boton.click();
};

const CASOS: Caso[] = [
  { slug: 'generador-laberintos', antes: 'Ver solución', despues: 'Ocultar solución', preparar: generar(/Generar laberinto/) },
  { slug: 'generador-crucigramas', antes: 'Ver solución', despues: 'Ocultar solución', preparar: generar(/Generar crucigrama/) },
  { slug: 'generador-fichas-calculo', antes: 'Ver soluciones', despues: 'Ocultar soluciones', preparar: generar(/Generar ficha/) },
  { slug: 'generador-nonogramas', antes: 'Ver solución', despues: 'Ocultar solución' },
  { slug: 'generador-sudokus', antes: 'Ver soluciones', despues: 'Ocultar soluciones', preparar: generar(/Generar sudokus/) },
  { slug: 'generador-sopa-letras', antes: 'Ver solución', despues: 'Ocultar solución', preparar: generar(/Generar sopa de letras/) },
  { slug: 'preparar-entrevista-competencias', antes: 'Ver un ejemplo completo', despues: 'Ocultar ejemplo' },
  { slug: 'estimador-hipoteca', antes: 'Ver código HTML', despues: 'Ocultar código' },
  { slug: 'temporizador-pomodoro', antes: 'Configuración', despues: 'Ocultar' },
];

test.describe('rótulo que cambia con la página traducida (C0243)', () => {
  for (const c of CASOS) {
    test(`${c.slug}: «${c.antes}» pasa a «${c.despues}» también con la página traducida`, async ({ page }) => {
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));

      await page.goto(`/${c.slug}/`);
      if (c.preparar) await c.preparar(page);
      const boton = page.getByRole('button', { name: c.antes, exact: true });
      await expect(boton).toBeVisible({ timeout: 15_000 });
      await hidratado(boton);
      // El mismo botón después de pulsar, aunque su nombre cambie
      await boton.evaluate((b) => b.setAttribute('data-c0243', '1'));
      const mismo = page.locator('[data-c0243="1"]');

      await traducir(page);
      await mismo.click();
      await expect(mismo).toHaveText(new RegExp(c.despues.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      await expect(mismo).not.toContainText(c.antes);
      expect(errores).toEqual([]);
    });
  }
});

// La misma clase fuera de un botón: un veredicto y un título de ficha (hallazgo 4244,
// visualizador-reacciones-quimicas, 08/11/2026). Control: sin la reparación, el veredicto seguía
// en «Aún no cuadra» con la clase balanceOk, y el título en «Síntesis: A + B → AB».
test.describe('texto que cambia con la página traducida, fuera de un botón (C0243)', () => {
  test('visualizador-reacciones-quimicas: el veredicto del balanceo y el título de la ficha de Tipos', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto('/visualizador-reacciones-quimicas/');

    const balanceo = page.getByRole('button', { name: 'Balanceo', exact: true });
    await hidratado(balanceo);
    await balanceo.click();
    const veredicto = page.locator('[class*="estadoBalance"]');
    await expect(veredicto).toContainText('Aún no cuadra');
    await traducir(page);
    // H₂ y H₂O a 2 → [2, 1, 2]
    await page.getByRole('button', { name: 'Aumentar coeficiente de H₂', exact: true }).click();
    await page.getByRole('button', { name: 'Aumentar coeficiente de H₂O', exact: true }).click();
    await expect(veredicto).toContainText('¡Ecuación balanceada!');
    await expect(veredicto).not.toContainText('Aún no cuadra');

    await page.getByRole('button', { name: 'Tipos', exact: true }).click();
    const titulo = page.locator('h3[class*="tipoDetalleNombre"]');
    await expect(titulo).toHaveText('Síntesis: A + B → AB');
    await traducir(page);
    await page.getByRole('button', { name: /Combustión/ }).click();
    await expect(titulo).toHaveText('Combustión: CₓHᵧ + O₂ → CO₂ + H₂O');
    expect(errores).toEqual([]);
  });
});
