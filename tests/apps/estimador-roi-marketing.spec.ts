import { test, expect } from '@playwright/test';

/**
 * estimador-roi-marketing — el nombre de cada canal en el ranking (cabo C0565, 02/11/2026)
 *
 * C0409 (25/10/2026) dio `min-width: 0` al nombre del ranking para que el ROI no se saliera de
 * la tarjeta a 390 px. Con `flex: 1` (base 0) el nombre era lo único que encogía, junto a un ROI
 * y un beneficio que no lo hacen: a 412 px «Email Marketing» medía 10 px y se pintaba una letra
 * por línea, y el testigo `tests/apps/desborde-390.spec.ts` seguía en verde porque solo mide el
 * desborde horizontal. Es la forma del hallazgo 3893 de simulador-bono-joven-alquiler.
 *
 * CASO (con los cinco canales que trae la app al cargar): a 360, 390 y 412 px
 *   esperado: cada nombre con ancho para su palabra más larga — «Facebook/Instagram» son unos
 *             150 px en la fuente de la tarjeta; se exige ≥ 150 px —, y sin desborde horizontal
 *   obtenido antes de reparar: 38, 68 y 10 px para «Email Marketing»; 47, 77 y 20 px para
 *             «Facebook/Instagram Ads».
 */

const RUTA = '/estimador-roi-marketing/';

test('C0565 — a 360, 390 y 412 px el nombre de cada canal del ranking se lee: ninguno por debajo de 150 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(RUTA);
  for (const ancho of [360, 390, 412]) {
    await page.setViewportSize({ width: ancho, height: 844 });
    const medidas = await page.evaluate(() => ({
      nombres: Array.from(document.querySelectorAll('[class*="rankingNombre"]')).map((e) => ({
        texto: (e.textContent ?? '').trim(),
        ancho: Math.round(e.getBoundingClientRect().width),
      })),
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(medidas.nombres.length, `${ancho} px`).toBeGreaterThan(1);
    for (const n of medidas.nombres) expect(n.ancho, `${ancho} px · ${n.texto}`).toBeGreaterThanOrEqual(150);
    expect(medidas.scroll, `${ancho} px`).toBeLessThanOrEqual(medidas.cliente);
  }
});
