import { test, expect } from '@playwright/test';

// Los capítulos se esconden tras la aceptación del aviso médico (CourseContext, 24 h en
// localStorage). Se siembra con addInitScript, que corre antes que cualquier script de la
// página: el efecto que lee la clave ya la encuentra, sin carrera con la hidratación.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('curso-nutrisalud-consent', JSON.stringify({ timestamp: Date.now(), version: '1.0' }));
  });
});

/**
 * curso-nutrisalud — regresión del cabo C0222 (turno de noche a11y del 11/10/2026, tandas 4-7).
 *
 * Emojis que el candado de a11y no juzga porque piden criterio o llegan en una variable:
 *   · matriz-alimentaria: el semáforo ✅ ⚠️ ⛔ de las tres tarjetas dice algo que el título no
 *     dice → role="img" con nombre (el de la descripción: matriz intacta, alterada, destruida).
 *   · macronutrientes: ✅ ⛔ junto a «Grasas Beneficiosas» / «Grasas a Evitar» repiten el
 *     título → aria-hidden.
 *   · ChapterPage: el icono del capítulo anterior/siguiente llegaba en {chapter.icon} junto al
 *     título → aria-hidden.
 *   · glosario: los botones de categoría filtran → aria-pressed.
 */
test('C0222 · el semáforo de la matriz alimentaria se nombra', async ({ page }) => {
  await page.goto('/curso-nutrisalud/interacciones/matriz-alimentaria/');
  for (const nombre of ['Matriz intacta', 'Matriz alterada', 'Matriz destruida']) {
    await expect(page.getByRole('img', { name: nombre })).toHaveCount(1);
  }
});

test('C0222 · en macronutrientes el emoji que repite el título está oculto', async ({ page }) => {
  await page.goto('/curso-nutrisalud/fundamentos/macronutrientes/');
  const iconos = page.locator('[class*="exampleIcon"]').filter({ hasText: /✅|⛔/ });
  await expect.poll(() => iconos.count(), { timeout: 15000 }).toBeGreaterThanOrEqual(2);
  for (const icono of await iconos.all()) {
    await expect(icono).toHaveAttribute('aria-hidden', 'true');
  }
});

test('C0222 · la navegación entre capítulos no lee el icono', async ({ page }) => {
  await page.goto('/curso-nutrisalud/fundamentos/macronutrientes/');
  const titulos = page.locator('[class*="bottomNavTitle"]');
  await expect.poll(() => titulos.count(), { timeout: 15000 }).toBeGreaterThanOrEqual(2);
  for (const t of await titulos.all()) {
    // Ningún nodo de texto suelto con un emoji: el icono va en un span con aria-hidden
    const suelto = await t.evaluate((el) =>
      Array.from(el.childNodes).some(
        (n) => n.nodeType === 3 && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(n.textContent ?? ''),
      ),
    );
    expect(suelto).toBe(false);
  }
});

test('C0222 · los filtros del glosario llevan aria-pressed y conmutan', async ({ page }) => {
  await page.goto('/curso-nutrisalud/recursos/glosario/');
  const filtros = page.locator('[class*="categoryFilters"] button');
  expect(await filtros.count()).toBeGreaterThanOrEqual(2);
  await expect(filtros.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(filtros.nth(1)).toHaveAttribute('aria-pressed', 'false');
  await expect(async () => {
    await filtros.nth(1).click();
    await expect(filtros.nth(1)).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
  }).toPass({ timeout: 15000 });
  await expect(filtros.nth(0)).toHaveAttribute('aria-pressed', 'false');
});
