import { test, expect } from '@playwright/test';

/**
 * Testigo de familia — el JSON-LD principal de la app sale UNA vez en el HTML servido.
 *
 * Hallazgo 4142 (visualizador-algebra-lineal, 05/11/2026): layout.tsx inyecta el `jsonLd` de
 * metadata.ts y page.tsx lo repetía con su propio <script type="application/ld+json">, así que el
 * WebApplication salía dos veces. /reparar midió el patrón (`JSON.stringify(jsonLd)` en page.tsx)
 * en las hermanas: 14 apps con su layout inyectando lo mismo, todas con 2 bloques (en
 * visualizador-cerebro-emociones el tipo es LearningResource). Reparadas el mismo día retirando
 * el bloque de la página. Este testigo mide el COMPORTAMIENTO (el HTML que se sirve), no el código.
 */

const FAMILIA: ReadonlyArray<[slug: string, tipo: string]> = [
  ['visualizador-algebra-lineal', 'WebApplication'],
  ['visualizador-radioactividad', 'WebApplication'],
  ['visualizador-proteinas-plegamiento', 'WebApplication'],
  ['simulador-multiplicador-gasto', 'WebApplication'],
  ['calculadora-propinas', 'WebApplication'],
  ['visualizador-reino-vegetal', 'WebApplication'],
  ['generador-contrasenas', 'WebApplication'],
  ['visualizador-polimeros-materiales', 'WebApplication'],
  ['visualizador-tipos-activos', 'WebApplication'],
  ['visualizador-tabla-periodica-interactiva', 'WebApplication'],
  ['visualizador-cerebro-emociones', 'LearningResource'],
  ['visualizador-biomas-terrestres', 'WebApplication'],
  ['orientador-facturacion-retencion', 'WebApplication'],
  ['guia-superalimentos', 'WebApplication'],
  ['estimacion-ahorro-hidrico', 'WebApplication'],
];

for (const [slug, tipo] of FAMILIA) {
  test(`${slug}: un solo «${tipo}» y un solo FAQPage en el HTML servido`, async ({ request }) => {
    const html = await (await request.get(`/${slug}/`)).text();
    const cuenta = (t: string): number => (html.match(new RegExp(`"@type":"${t}"`, 'g')) ?? []).length;
    expect(cuenta(tipo), tipo).toBe(1);
    expect(cuenta('FAQPage'), 'FAQPage').toBe(1);
  });
}
