import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test('logo homepage móvil - screenshot diagnóstico', async ({ page }) => {
  await page.goto('http://localhost:3050', { waitUntil: 'networkidle' });
  
  // Screenshot completo de la zona del logo hero
  await page.screenshot({ path: 'tests/screenshots/logo-homepage-mobile.png', fullPage: false });
  
  // Screenshot del logo hero en específico
  const heroLogo = page.locator('.headerContent').first();
  if (await heroLogo.count() > 0) {
    await heroLogo.screenshot({ path: 'tests/screenshots/logo-hero-closeup.png' });
  }
  
  // Inspeccionar el SVG renderizado
  const svgInfo = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg');
    return Array.from(svgs).map(svg => {
      const rect = svg.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        computedWidth: window.getComputedStyle(svg).width,
        computedHeight: window.getComputedStyle(svg).height,
        attrWidth: svg.getAttribute('width'),
        attrHeight: svg.getAttribute('height'),
        viewBox: svg.getAttribute('viewBox'),
        parentClass: svg.parentElement?.className,
      };
    });
  });
  
  console.log('SVG info en móvil:', JSON.stringify(svgInfo, null, 2));
  
  // Comprobar bounding rect del contenedor del icono
  const logoIconInfo = await page.evaluate(() => {
    // Buscar por CSS module - buscar el div que contiene el SVG del logo
    const svgEl = document.querySelector('header svg, [class*="logoIcon"] svg');
    if (!svgEl) return 'NO SVG FOUND';
    const parent = svgEl.parentElement;
    const parentRect = parent?.getBoundingClientRect();
    return {
      parentWidth: parentRect?.width,
      parentHeight: parentRect?.height,
      parentClass: parent?.className,
    };
  });
  
  console.log('Logo icon container info:', JSON.stringify(logoIconInfo, null, 2));
  
  expect(true).toBe(true); // test siempre pasa, solo queremos los logs
});
