import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────────────────
// CABO C0668 (/reparar 07/11/2026) — REPARADO. El buscador de notas comparaba con
// toLowerCase().includes() y no encontraba sin tilde: «cancion» no daba la nota «Canción de
// cuna». Ahora las dos partes pasan por normalizarBusqueda (lib/buscadorTablas), como las guías.
// Las notas son del usuario, así que no cabe una fila del testigo de familia
// (tests/apps/guias-buscador-tildes-familia.spec.ts): se siembran en localStorage ANTES de
// cargar (addInitScript), que la app lee al montar.
// Control (07/11/2026, next dev): con el filtro de antes, «cancion» deja la lista vacía.
// ─────────────────────────────────────────────────────────────────────────────────────────

const NOTAS = [
  {
    id: 'n1',
    titulo: 'Canción de cuna',
    contenido: 'Letra para aprender',
    categoria: 'personal',
    fechaCreacion: '2026-11-07T10:00:00.000Z',
    fechaModificacion: '2026-11-07T10:00:00.000Z',
  },
  {
    id: 'n2',
    titulo: 'Lista de la compra',
    contenido: 'Pan y leche',
    categoria: 'compras',
    fechaCreacion: '2026-11-07T11:00:00.000Z',
    fechaModificacion: '2026-11-07T11:00:00.000Z',
  },
];

test('el buscador encuentra la nota sin tilde (cabo C0668)', async ({ page }) => {
  await page.addInitScript((notas) => {
    localStorage.setItem('meskeia-notas', JSON.stringify(notas));
  }, NOTAS);
  await page.goto('/notas/');
  await expect(page.getByText('Lista de la compra')).toBeVisible();

  const buscador = page.getByPlaceholder('Buscar en notas...');
  await expect
    .poll(() => buscador.evaluate((i) => Object.keys(i).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);

  await buscador.fill('cancion');
  await expect(page.getByText('Canción de cuna')).toBeVisible();
  await expect(page.getByText('Lista de la compra')).toHaveCount(0);

  // Con tilde, lo mismo
  await buscador.fill('Canción');
  await expect(page.getByText('Canción de cuna')).toBeVisible();
  await expect(page.getByText('Lista de la compra')).toHaveCount(0);
});
