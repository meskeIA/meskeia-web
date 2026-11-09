import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Temporizador Pomodoro — la cuenta atrás contra el reloj (09/11/2026, /reparar).
 *
 * Hermana de temporizador-visual: las dos restaban 1 por cada disparo de setInterval (hallazgo
 * 4325). Si el navegador no dispara el intervalo —pestaña en segundo plano, pantalla del móvil
 * bloqueada, portátil suspendido— la cuenta se paraba, y cada pausa tiraba lo marchado desde el
 * último tic. Ahora las dos miden contra un instante final (Date.now).
 *
 * El reloj lo lleva `page.clock`: instalado antes de cargar y PARADO antes del primer clic, así
 * que cada `runFor(n)` son n ms de marcha. `fastForward(n)` es la pestaña dormida: el reloj
 * salta y cada intervalo dispara una sola vez al volver.
 *
 * Esperados, a mano: Clásico, 25 min = 1500 s.
 *   · 10 s de marcha → 1490 s «24:50»; 60 s dormida + 1 s → 1500 − 71 = 1429 s «23:49».
 *   · 4 × (1,5 s de marcha + Pausar) = 6 s → 1494 s «24:54».
 *   · Descanso corto de 5 min con la pestaña dormida 6 min: al volver ha terminado y pasa a
 *     «Concentración», 25:00.
 */

const RUTA = '/temporizador-pomodoro/';

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento */
    }
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register = () => new Promise<ServiceWorkerRegistration>(() => {});
    }
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText(/Temporizador Pomodoro/);
  // Testigo de hidratación: el fiber de React en el botón Iniciar
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll('button')].find((x) => (x.textContent ?? '').includes('Iniciar'));
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactFiber$')));
    },
    null,
    { timeout: 15000 },
  );
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(ahora + 1000);
}

const principal = (page: Page): Locator => page.getByRole('button', { name: /Iniciar|Pausar/ });
const reloj = (page: Page): Locator => page.getByText(/^\d{2}:\d{2}$/).first();

test.describe('Temporizador Pomodoro — la cuenta mide el reloj, no los tics', () => {
  test('con la pestaña dormida 60 s, 25 min − 71 s de reloj marcan 23:49', async ({ page }) => {
    await abrir(page);
    await expect(reloj(page)).toHaveText('25:00');
    await principal(page).click();
    await page.clock.runFor(10000);
    await expect(reloj(page)).toHaveText('24:50');
    await page.clock.fastForward(60000);
    await page.clock.runFor(1000);
    await expect(reloj(page)).toHaveText('23:49');
  });

  test('las pausas no tiran lo marchado: 4 × 1,5 s = 6 s y marca 24:54', async ({ page }) => {
    await abrir(page);
    for (let i = 0; i < 4; i++) {
      await principal(page).click(); // Iniciar
      await page.clock.runFor(1500);
      await principal(page).click(); // Pausar
      await expect(principal(page)).toHaveText(/Iniciar/);
    }
    await expect(reloj(page)).toHaveText('24:54');
  });

  test('un descanso de 5 min con la pestaña dormida 6 min termina al volver y pasa a Concentración', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Descanso corto', exact: true }).click();
    await expect(reloj(page)).toHaveText('05:00');
    await principal(page).click();
    await page.clock.fastForward(6 * 60000);
    await page.clock.runFor(1000);
    await expect(page.getByRole('button', { name: 'Concentración', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(reloj(page)).toHaveText('25:00');
  });

  test('reiniciar en marcha vuelve a 25:00 entero, sin arrastrar lo marchado', async ({ page }) => {
    await abrir(page);
    await principal(page).click();
    await page.clock.runFor(3500);
    await page.getByRole('button', { name: 'Reiniciar temporizador' }).click();
    await expect(reloj(page)).toHaveText('25:00');
    await principal(page).click();
    await page.clock.runFor(1000);
    await expect(reloj(page)).toHaveText('24:59');
  });
});
