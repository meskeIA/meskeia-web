import { test, expect } from '@playwright/test';
import { APPS_DEMANDADAS } from '../../data/apps-demandadas';

/**
 * Regresión del módulo «Apps del día» de la portada.
 *
 * Desde el 08/09/2026 las tarjetas rotan dentro del pool de apps con demanda
 * demostrada (`data/apps-demandadas.ts`) en vez de sortearse entre las +1.100 del
 * catálogo. Lo que este test protege es justo eso: que ninguna tarjeta vuelva a
 * salir de fuera del pool, porque el fallo sería SILENCIOSO — la portada seguiría
 * pintando cuatro tarjetas correctas y solo se notaría meses después en los clics.
 */
test.describe('Apps del día (portada)', () => {
  test('las cuatro tarjetas salen del pool de apps demandadas', async ({ page }) => {
    await page.goto('/');

    const seccion = page.getByRole('region', { name: /apps del día/i });
    await expect(seccion).toBeVisible();

    // El componente monta las tarjetas en un efecto: esperar a que el skeleton se vaya.
    await expect(seccion).not.toHaveAttribute('aria-busy', 'true');

    const enlaces = seccion.getByRole('link');
    await expect(enlaces).toHaveCount(4);

    const pool = new Set<string>(APPS_DEMANDADAS);
    const hrefs = await enlaces.evaluateAll((nodos) =>
      nodos.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? '')
    );

    for (const href of hrefs) {
      // Formato esperado: /slug/#from=home-daily — withFrom marca en el FRAGMENTO, no en
      // query, para no generar URLs duplicadas indexables (lo vigila check:enlaces-internos).
      const slug = href.split(/[?#]/)[0].replace(/\//g, '');
      expect(pool.has(slug), `${slug} no está en el pool de apps demandadas`).toBe(true);
      expect(href, `${href} ha perdido la marca de origen`).toContain('from=home-daily');
    }

    // Cuatro apps distintas: una repetida delataría un fallo del barajado.
    expect(new Set(hrefs).size).toBe(4);
  });
});
