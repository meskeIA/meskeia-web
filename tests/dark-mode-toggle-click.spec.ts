import { test } from '@playwright/test';
import path from 'path';

const DIR = path.join(process.cwd(), 'tests', 'screenshots-darkmode');

test('simular clic en toggle del Sidebar (modo oscuro)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Capturar estado light mode ANTES
  await page.screenshot({ path: path.join(DIR, '10-homepage-light-antes.png') });

  // Verificar data-theme ANTES del clic
  const themeBefore = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  console.log('data-theme ANTES del clic:', themeBefore);

  // Hacer clic en el toggle del Sidebar
  const sidebarToggle = page.locator('[class*="themeToggle"]').first();
  await sidebarToggle.click();
  await page.waitForTimeout(600);

  // Verificar data-theme DESPUÉS del clic
  const themeAfter = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  const bgBody = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  const bgPage = await page.evaluate(() => {
    const el = document.querySelector('[class*="pageWrapper"]');
    return el ? window.getComputedStyle(el).backgroundColor : 'NO ENCONTRADO';
  });

  console.log('data-theme DESPUÉS del clic:', themeAfter);
  console.log('body background:', bgBody);
  console.log('pageWrapper background:', bgPage);

  // Capturar estado DESPUÉS del clic
  await page.screenshot({ path: path.join(DIR, '11-homepage-dark-postclic.png') });
});
