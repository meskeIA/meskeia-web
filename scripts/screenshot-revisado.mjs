import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

// Home
await page.goto('http://localhost:3050/', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/home-revisado.png', fullPage: false });

// Apps tab
await page.goto('http://localhost:3050/apps/', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/apps-revisado.png', fullPage: false });

await browser.close();
console.log('Screenshots OK');
