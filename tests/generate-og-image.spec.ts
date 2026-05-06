import { test } from '@playwright/test';
import path from 'path';

test('generar og-image.png con nuevo logo Enjambre', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 630 });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px;
        height: 630px;
        background: #F5F8FA;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 28px;
        font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      }
      .logo-row {
        display: flex;
        align-items: center;
        gap: 32px;
      }
      .wordmark {
        font-size: 100px;
        line-height: 1;
        letter-spacing: -0.01em;
      }
      .meske {
        font-weight: 400;
        color: #2C3E50;
        letter-spacing: 0.04em;
      }
      .ia {
        font-weight: 600;
        color: #2E86AB;
      }
      .tagline {
        font-size: 30px;
        color: #666666;
        font-weight: 300;
        letter-spacing: 0.01em;
      }
      .bar {
        width: 80px;
        height: 3px;
        background: linear-gradient(90deg, #2E86AB, #48A9A6);
        border-radius: 2px;
      }
    </style>
    </head>
    <body>
      <div class="logo-row">
        <svg viewBox="0 0 132 132" xmlns="http://www.w3.org/2000/svg" width="160" height="160">
          <defs>
            <linearGradient id="og-bg" x1="0" y1="0" x2="132" y2="132" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stop-color="#3A9BC1"/>
              <stop offset="45%"  stop-color="#2E86AB"/>
              <stop offset="100%" stop-color="#1F6A8B"/>
            </linearGradient>
            <radialGradient id="og-core" cx="50%" cy="45%" r="55%">
              <stop offset="0%"   stop-color="#FFFFFF"/>
              <stop offset="60%"  stop-color="#9BDCD8"/>
              <stop offset="100%" stop-color="#48A9A6"/>
            </radialGradient>
          </defs>
          <rect width="132" height="132" rx="29" fill="url(#og-bg)"/>
          <circle cx="66" cy="66" r="18" fill="url(#og-core)"/>
          <circle cx="66" cy="66" r="7"  fill="#1F6A8B"/>
          <g fill="#FFFFFF">
            <circle cx="26"  cy="26"  r="4.5"/>
            <circle cx="106" cy="30"  r="3.5"/>
            <circle cx="108" cy="104" r="5"/>
            <circle cx="28"  cy="108" r="3"/>
            <circle cx="62"  cy="20"  r="2"/>
            <circle cx="20"  cy="66"  r="2.5"/>
            <circle cx="112" cy="66"  r="2.5"/>
            <circle cx="66"  cy="112" r="2"/>
          </g>
        </svg>
        <div class="wordmark">
          <span class="meske">meske</span><span class="ia">IA</span>
        </div>
      </div>
      <div class="bar"></div>
      <div class="tagline">Estudio, finanzas y herramientas. Gratis y en español.</div>
    </body>
    </html>
  `);

  await page.screenshot({
    path: path.join(process.cwd(), 'public', 'og-image.png'),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
});
