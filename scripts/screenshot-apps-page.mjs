import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

await page.goto('http://localhost:3050/apps/', { waitUntil: 'networkidle' });

// Captura inicial (pestaña Apps colapsadas)
await page.screenshot({ path: '/tmp/apps-tab-collapsed.png', fullPage: false });

// Expandir una card (clic en el primer .appCardHeader)
await page.locator('button[aria-expanded="false"]').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/apps-tab-expanded.png', fullPage: false });

// Cambiar a pestaña Caminos guiados
await page.locator('button[role="tab"]').nth(1).click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/guias-tab.png', fullPage: false });

await browser.close();
console.log('✅ Screenshots guardados en /tmp/');
