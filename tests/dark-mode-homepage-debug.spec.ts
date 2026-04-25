import { test } from '@playwright/test';

test('debug backgrounds homepage dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    localStorage.setItem('meskeia-theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const results = await page.evaluate(() => {
    const getInfo = (selector: string) => {
      const el = document.querySelector(selector);
      if (!el) return `NO ENCONTRADO: ${selector}`;
      const cs = window.getComputedStyle(el);
      return `${selector} → bg: ${cs.backgroundColor} | color: ${cs.color}`;
    };

    // Verificar data-theme en html
    const theme = document.documentElement.getAttribute('data-theme');

    // Variables CSS calculadas en el contexto del body
    const bgPrimary = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim();
    const bgCard = getComputedStyle(document.body).getPropertyValue('--bg-card').trim();

    return [
      `data-theme en html: ${theme}`,
      `--bg-primary calculada: "${bgPrimary}"`,
      `--bg-card calculada: "${bgCard}"`,
      getInfo('body'),
      getInfo('[class*="pageWrapper"]'),
      getInfo('[class*="mainContent"]'),
      getInfo('[class*="header"]'),
      getInfo('[class*="searchSection"]'),
      getInfo('[class*="dailySection"]'),
    ];
  });

  results.forEach(r => console.log(r));
});
