import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3050/', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/home-cards-sin-iconos.png', fullPage: false });
await browser.close();
console.log('OK');
