import { test, expect } from '@playwright/test';

test('verificar colores computed en dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/calculadora-porcentajes');
  await page.waitForLoadState('networkidle');

  // Activar dark mode
  await page.evaluate(() => {
    localStorage.setItem('meskeia-theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Verificar data-theme en html
  const dataTheme = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  console.log('data-theme en html:', dataTheme);

  // Verificar logoContainer background
  const logoContainerBg = await page.evaluate(() => {
    const el = document.querySelector('[class*="logoContainer"]');
    if (!el) return 'NO ENCONTRADO';
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log('logoContainer background:', logoContainerBg);

  // Verificar wordmark .meske color
  const meskeColor = await page.evaluate(() => {
    const el = document.querySelector('[class*="meske"]');
    if (!el) return 'NO ENCONTRADO';
    return window.getComputedStyle(el).color;
  });
  console.log('meske text color:', meskeColor);

  // Esperar el TransparencyBanner (500ms delay)
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    localStorage.setItem('meskeia-theme', 'dark');
    localStorage.removeItem('meskeia_transparency_banner_dismissed');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200); // > 500ms delay del banner

  const bannerBg = await page.evaluate(() => {
    const el = document.querySelector('[class*="content"]');
    if (!el) return 'NO ENCONTRADO';
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log('TransparencyBanner content background:', bannerBg);

  const bannerTitleColor = await page.evaluate(() => {
    const el = document.querySelector('[class*="title"]');
    if (!el) return 'NO ENCONTRADO';
    return window.getComputedStyle(el).color;
  });
  console.log('TransparencyBanner title color:', bannerTitleColor);

  expect(dataTheme).toBe('dark');
});
