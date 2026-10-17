import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { PUERTO } from './_puerto';

/**
 * Testigo de familia — la píldora «Stemum › disciplina» no tapa el título (cabo C0101).
 *
 * Bajo stemum.com la barra fija de MeskeiaLogo no lleva el logo de meskeia.com (hasta x ≈ 203) sino
 * la píldora «Stemum › disciplina», que llega a x = 232 (Física) … 287 (Matemáticas). Desde 1024 px
 * las apps del lote a1d72a9c pierden el hueco de 80 px del hero y el título centrado puede quedar
 * debajo. Se reparó app a app (2589 simulador-punnett, 2651 visualizador-volumenes, 2859
 * simulador-campo-magnetico) y el 17/10/2026 se midieron las 34 de la lista del cabo: tapaban cinco
 * (equilibrio-quimico hasta 1092 px, lotka-volterra 1026, movimiento-circular 1058,
 * tabla-periodica-tendencias 1120 y estadistica-cotidiana 1134), reparadas con el mismo hueco bajo
 * [data-brand='stemum'].
 *
 * Lo que mide: los rectángulos del TEXTO del h1 (un Range, no la caja del h1, que ocupa todo el
 * ancho) frente al de la píldora, de 1000 a 1200 px cada 4. Ni un píxel de intersección. El ancho
 * de la píldora depende de la DISCIPLINA y el riesgo, de lo que mida el título: no se deduce, se mide.
 * Control: sin las reglas del 17/10, las cinco salían rojas en esta misma medida
 * (.reparar-trabajo/medir-pildora.mjs de esa tanda).
 */
test.use({ launchOptions: { args: [`--host-resolver-rules=MAP stemum.com 127.0.0.1:${PUERTO}`] } });

const APPS = [
  'calculadora-configuracion-electronica',
  'simulador-calorimetria',
  'simulador-campo-electrico',
  'simulador-campo-magnetico',
  'simulador-cifrado-cesar',
  'simulador-colisiones',
  'simulador-deriva-genetica',
  'simulador-equilibrio-quimico',
  'simulador-fotosintesis-factores',
  'simulador-gas-ideal',
  'simulador-lotka-volterra',
  'simulador-mitosis-meiosis',
  'simulador-movimiento-circular',
  'simulador-ondas-interferencia',
  'simulador-orbitas-kepler',
  'simulador-plano-inclinado',
  'simulador-proyectiles',
  'simulador-tabla-periodica-tendencias',
  'simulador-tcp-handshake',
  'simulador-titulacion',
  'simulador-vsepr',
  'visualizador-arquitectura-computador',
  'visualizador-calculo-visual',
  'visualizador-ciclo-nitrogeno',
  'visualizador-efecto-doppler',
  'visualizador-embriogenesis',
  'visualizador-estadistica-cotidiana',
  'visualizador-estadistica-inferencial',
  'visualizador-logica-proposicional',
  'visualizador-motor-electrico',
  'visualizador-trigonometria',
  'simulador-punnett',
  'visualizador-volumenes',
  'simulador-pendulo',
];

for (const slug of APPS) {
  test(`${slug}: bajo stemum.com la píldora no tapa el h1 de 1000 a 1200 px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto(`http://stemum.com/${slug}/`);
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await expect(page.locator('[class*="stemumPill"]')).toBeVisible();
    const tapados: string[] = [];
    for (let ancho = 1000; ancho <= 1200; ancho += 4) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.waitForTimeout(60);
      const r = await page.evaluate(() => {
        const pildora = document.querySelector('[class*="stemumPill"]')!.getBoundingClientRect();
        const rango = document.createRange();
        rango.selectNodeContents(document.querySelector('h1')!);
        let solape = 0;
        for (const c of Array.from(rango.getClientRects())) {
          if (c.width < 1) continue;
          const x = Math.min(pildora.right, c.right) - Math.max(pildora.left, c.left);
          const y = Math.min(pildora.bottom, c.bottom) - Math.max(pildora.top, c.top);
          if (x > 0 && y > 0) solape = Math.max(solape, x);
        }
        return solape;
      });
      if (r > 0) tapados.push(`${ancho} px (${Math.round(r)} px)`);
    }
    expect(tapados, 'anchos en que la píldora pisa el texto del h1').toEqual([]);
  });
}
