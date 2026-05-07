import { chromium } from '@playwright/test';

const browser = await chromium.launch();

// Desktop home
const ctx1 = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const p1 = await ctx1.newPage();
await p1.goto('http://localhost:3050/', { waitUntil: 'networkidle' });
await p1.screenshot({ path: '/tmp/home-final.png', fullPage: false });
await p1.goto('http://localhost:3050/apps/', { waitUntil: 'networkidle' });
await p1.screenshot({ path: '/tmp/apps-desktop-final.png', fullPage: false });
await ctx1.close();

// Mobile
const ctx2 = await browser.newContext({ viewport: { width: 412, height: 900 }, isMobile: true });
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:3050/apps/', { waitUntil: 'networkidle' });
await p2.screenshot({ path: '/tmp/apps-mobile-final.png', fullPage: false });
await ctx2.close();

await browser.close();
console.log('OK');
