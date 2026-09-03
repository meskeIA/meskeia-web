import { test, expect } from '@playwright/test';

/**
 * visualizador-estructuras-datos — verificación de la guía por estructura · 03/09/2026 (S0112)
 *
 * La app era INVISIBLE en el cuadrante STEM (35 visitas de demanda con 7 impresiones en 90 días)
 * teniendo dentro cinco estructuras que se buscan por separado —pila, cola, lista enlazada,
 * array, BST— bajo dos únicos `<h2>` genéricos («Operaciones» y «Complejidad Temporal»).
 *
 * Este test fija lo que la reparación garantiza y una edición futura podría deshacer sin que
 * nada más protestara: que cada estructura conserva su propio encabezado de nivel 2 y que el
 * botón de cada bloque selecciona esa estructura en el simulador de arriba.
 */

const RUTA = '/visualizador-estructuras-datos/';

const ENCABEZADOS = [
  'Array (arreglo o vector)',
  'Pila (Stack): el principio LIFO',
  'Cola (Queue): el principio FIFO',
  'Lista enlazada (Linked List)',
  'Árbol binario de búsqueda (BST)',
];

test('cada estructura tiene su propio encabezado de nivel 2', async ({ page }) => {
  await page.goto(RUTA);
  for (const texto of ENCABEZADOS) {
    await expect(page.getByRole('heading', { level: 2, name: texto })).toBeVisible();
  }
});

test('el bloque de cada estructura la selecciona en el simulador', async ({ page }) => {
  await page.goto(RUTA);

  // De partida está seleccionada la primera pestaña
  await expect(page.getByRole('tab', { name: /Array/ })).toHaveAttribute('aria-selected', 'true');

  await page.getByRole('button', { name: 'Probar la cola en el simulador' }).click();
  await expect(page.getByRole('tab', { name: /Cola/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: /Array/ })).toHaveAttribute('aria-selected', 'false');

  await page.getByRole('button', { name: 'Probar la pila en el simulador' }).click();
  await expect(page.getByRole('tab', { name: /Pila/ })).toHaveAttribute('aria-selected', 'true');
});

test('el bloque del BST enlaza al simulador especializado de árboles', async ({ page }) => {
  await page.goto(RUTA);
  const enlace = page.getByRole('link', { name: /balanceo con rotaciones/ });
  await expect(enlace).toHaveAttribute('href', '/simulador-arboles-bst-avl/');
});

test('la tabla de coste de la pila dice O(1) en push y pop', async ({ page }) => {
  await page.goto(RUTA);
  // Valores escritos a mano: apilar y desapilar tocan un solo extremo, no recorren nada
  const bloquePila = page.locator('#pila-stack');
  await expect(bloquePila.getByRole('row', { name: /push/ })).toContainText('O(1)');
  await expect(bloquePila.getByRole('row', { name: /pop/ })).toContainText('O(1)');
});
