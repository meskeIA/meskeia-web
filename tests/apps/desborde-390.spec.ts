/**
 * Cabos C0200 y C0201 (turno de noche a11y del 09/10/2026) — a 390 px de ancho la página no
 * puede ser más ancha que la pantalla. `documentElement.scrollWidth` NO lo delata (html y body
 * llevan overflow-x: hidden y recortan): se mide `body.scrollWidth`, como en C0154.
 */
import { test, expect } from '@playwright/test';

for (const ruta of ['/seguimiento-habitos/', '/calculadora-matematica/']) {
  test(`${ruta} · a 390 px nada fuerza un ancho mayor que la pantalla`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const r = await page.evaluate(() => {
      const ancho = document.documentElement.clientWidth;
      // Los culpables: elementos cuyo borde derecho pasa del ancho y que no están dentro de
      // una caja que desplace por su cuenta (esa sí es legítima).
      const culpables = Array.from(document.body.querySelectorAll('*'))
        .filter((el) => {
          const caja = el.getBoundingClientRect();
          if (caja.right <= ancho + 1 || caja.width === 0) return false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return false;
          }
          return true;
        })
        .slice(0, 6)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} → ${Math.round(el.getBoundingClientRect().right)}`);
      return { body: document.body.scrollWidth, ancho, culpables };
    });
    expect(r.body, `body ${r.body} px en ${r.ancho}: ${r.culpables.join(' · ')}`).toBeLessThanOrEqual(r.ancho);
  });
}

test('/seguimiento-habitos/ · a 390 px, con un hábito, ninguna de las tres vistas desborda (C0200)', async ({
  page,
}) => {
  // El turno de noche midió 451 px; en carga limpia (sin hábitos) no se reproduce, así que se
  // siembra uno ANTES de que la página cargue (addInitScript: sin carrera con la hidratación).
  await page.addInitScript(() => {
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem(
      'meskeia_habitos_v2',
      JSON.stringify({
        version: '2.0',
        habitos: [
          {
            id: 'h1',
            nombre: 'Ejercicio diario con estiramientos',
            icono: '💪',
            color: '#2E86AB',
            categoria: 'salud',
            frecuencia: 'diario',
            objetivo: 30,
            tipo: 'construir',
            registros: { [hoy]: { completado: true } },
            fechaCreacion: hoy,
          },
        ],
      }),
    );
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/seguimiento-habitos/');
  await page.waitForLoadState('networkidle');
  for (const vista of ['Mis Hábitos', 'Calendario', 'Estadísticas']) {
    const boton = page.getByRole('button', { name: vista, exact: true });
    await expect(async () => {
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
    }).toPass({ timeout: 15000 });
    const r = await page.evaluate(() => {
      const culpables = Array.from(document.body.querySelectorAll('*'))
        .filter((el) => el.getBoundingClientRect().right > 391)
        .slice(-4)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} → ${Math.round(el.getBoundingClientRect().right)}`);
      return { ancho: document.body.scrollWidth, culpables };
    });
    expect(r.ancho, `${vista}: body ${r.ancho} px · ${r.culpables.join(' · ')}`).toBeLessThanOrEqual(390);
  }
  // Y el modal de hábito nuevo, con sus rejillas de iconos, colores y categorías
  await page.getByRole('button', { name: 'Mis Hábitos', exact: true }).click();
  await page.getByRole('button', { name: /Nuevo Hábito/ }).click();
  await expect(page.getByRole('heading', { name: 'Nuevo Hábito' })).toBeVisible();
  const conModal = await page.evaluate(() => document.body.scrollWidth);
  expect(conModal, `modal: body ${conModal} px`).toBeLessThanOrEqual(390);
});

test('/calculadora-matematica/ · a 390 px ninguno de los cinco tipos desborda (C0201)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/calculadora-matematica/');
  await page.waitForLoadState('networkidle');
  for (const tipo of ['Matrices 2×2', 'Fracciones', 'Potencias', 'Raíces', 'Logaritmos']) {
    const boton = page.locator('[class*="tipoBtn"]').filter({ hasText: tipo });
    await expect(async () => {
      await boton.click();
      await expect(boton).toHaveClass(/tipoActivo/, { timeout: 1000 });
    }).toPass({ timeout: 15000 });
    const ancho = await page.evaluate(() => document.body.scrollWidth);
    expect(ancho, `${tipo}: body ${ancho} px`).toBeLessThanOrEqual(390);
  }
});
