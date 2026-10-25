import { test, expect } from '@playwright/test';

/**
 * calculadora-bitrate-video — cabo C0453 (turno de noche a11y del 25/10/2026)
 *
 * Los tres grupos de botones llevaban a la vez aria-labelledby y aria-label. Manda el primero,
 * así que el segundo no se anunciaba nunca y solo podía divergir del rótulo visible. Se fija
 * que cada grupo se llame como su rótulo y no lleve aria-label.
 */
for (const nombre of ['Resolución', 'Fotogramas por segundo (fps)', 'Códec']) {
  test(`el grupo «${nombre}» se llama como su rótulo visible`, async ({ page }) => {
    await page.goto('/calculadora-bitrate-video/');
    const grupo = page.getByRole('group', { name: nombre, exact: true });
    await expect(grupo).toHaveCount(1);
    await expect(grupo).not.toHaveAttribute('aria-label');
  });
}
