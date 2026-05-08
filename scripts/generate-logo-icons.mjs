/**
 * Genera todos los PNG de logo, favicon y og-image a partir del SVG oficial.
 * Uso: node scripts/generate-logo-icons.mjs
 * Requiere: @playwright/test (ya instalado en el proyecto)
 */

import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const svgSource = readFileSync(path.join(publicDir, 'logo-meskeIA.svg'), 'utf-8');

// Tamaños de icono para PWA + favicon + Apple
const iconSizes = [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 384, 512];

function iconFilename(size) {
  if (size === 180) return 'apple-touch-icon.png';
  if (size === 16)  return 'icon-16.png';
  if (size === 32)  return 'icon-32.png';
  if (size === 48)  return 'icon-48.png';
  return `icon-${size}x${size}.png`;
}

function svgAtSize(size) {
  return svgSource.replace('width="300" height="300"', `width="${size}" height="${size}"`);
}

function iconHtml(size) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>* { margin:0; padding:0; } body { width:${size}px; height:${size}px; overflow:hidden; background:transparent; }</style>
</head>
<body>${svgAtSize(size)}</body>
</html>`;
}

const ogHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width:1200px; height:630px; overflow:hidden;
      background: #F5F7FA;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    }
    .brand   { display:flex; align-items:center; gap:40px; margin-bottom:30px; }
    .name    { font-size:100px; font-weight:300; color:#1A1A1A; letter-spacing:8px; line-height:1; }
    .name b  { color:#2E86AB; font-weight:700; }
    .divider { width:120px; height:3px; background:#2E86AB; margin-bottom:30px; border-radius:2px; }
    .tagline { font-size:28px; color:#666666; font-weight:300; letter-spacing:1.5px; text-align:center; }
  </style>
</head>
<body>
  <div class="brand">
    ${svgAtSize(200)}
    <div class="name">meske<b>IA</b></div>
  </div>
  <div class="divider"></div>
  <div class="tagline">Aplicaciones web gratuitas para simplificar tu día a día</div>
</body>
</html>`;

async function run() {
  console.log('🚀 Iniciando generación de iconos con Playwright...\n');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // ── Iconos PNG ──────────────────────────────────────────────────────
  for (const size of iconSizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(iconHtml(size), { waitUntil: 'networkidle' });
    const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: size, height: size } });
    const fname = iconFilename(size);
    writeFileSync(path.join(publicDir, fname), buf);
    console.log(`  ✓ ${fname.padEnd(24)} ${size}×${size}px`);
  }

  // favicon-16x16.png (alias del icon-16.png)
  const buf16 = readFileSync(path.join(publicDir, 'icon-16.png'));
  writeFileSync(path.join(publicDir, 'favicon-16x16.png'), buf16);
  console.log('  ✓ favicon-16x16.png       (alias de icon-16.png)');

  // logo-meskeIA.png + icon_meskeia.png (512px, sin fondo redondeado)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(iconHtml(512), { waitUntil: 'networkidle' });
  const buf512 = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 512, height: 512 } });
  writeFileSync(path.join(publicDir, 'logo-meskeIA.png'), buf512);
  writeFileSync(path.join(publicDir, 'icon_meskeia.png'), buf512);
  console.log('  ✓ logo-meskeIA.png        512×512px');
  console.log('  ✓ icon_meskeia.png        512×512px (alias)');

  // app/icon.png (Next.js usa este archivo para el ícono automático)
  const appIconPath = path.join(__dirname, '..', 'app', 'icon.png');
  writeFileSync(appIconPath, buf512);
  console.log('  ✓ app/icon.png            512×512px');

  // ── OG Image 1200×630 ──────────────────────────────────────────────
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(ogHtml, { waitUntil: 'networkidle' });
  const ogBuf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  writeFileSync(path.join(publicDir, 'og-image.png'), ogBuf);
  console.log('  ✓ og-image.png            1200×630px');

  await browser.close();
  console.log('\n✅ Todos los iconos generados correctamente.');
}

run().catch(err => { console.error('❌ Error:', err); process.exit(1); });
