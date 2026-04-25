import { test } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'tests', 'screenshots-darkmode');

async function enableDarkMode(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.setItem('meskeia-theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle' });
  // Esperar rehidratación de next-themes
  await page.waitForTimeout(800);
}

test('dark mode - homepage desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await enableDarkMode(page);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '01-homepage-desktop-dark.png'),
    fullPage: false,
  });
});

test('dark mode - homepage mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await enableDarkMode(page);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '02-homepage-mobile-dark.png'),
    fullPage: false,
  });
});

test('dark mode - app calculadora (ejemplo)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/calculadora-porcentajes');
  await page.waitForLoadState('networkidle');
  await enableDarkMode(page);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '03-app-desktop-dark.png'),
    fullPage: true,
  });
});

test('dark mode - app calculadora mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/calculadora-porcentajes');
  await page.waitForLoadState('networkidle');
  await enableDarkMode(page);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '04-app-mobile-dark.png'),
    fullPage: true,
  });
});

test('dark mode - logo header closeup', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 400 });
  await page.goto('/calculadora-porcentajes');
  await page.waitForLoadState('networkidle');
  await enableDarkMode(page);
  // Recorte del área del logo
  const logoEl = page.locator('[class*="headerBar"]').first();
  await logoEl.screenshot({
    path: path.join(SCREENSHOTS_DIR, '05-logo-dark-closeup.png'),
  });
});
