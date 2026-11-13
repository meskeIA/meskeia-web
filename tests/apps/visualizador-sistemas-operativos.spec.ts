import { test, expect, type Page } from '@playwright/test';

/**
 * visualizador-sistemas-operativos — el Round Robin de «Planificación CPU» (/reparar 13/11/2026,
 * visto al medir el contraste del Gantt para el cabo C0297).
 *
 * Los cinco procesos de PROCESOS_GANTT (P1 0/5, P2 1/3, P3 2/8, P4 3/2, P5 4/4: llegada/ráfaga)
 * suman 22 ms de CPU. Round Robin con quantum 2, resuelto a mano con la convención de libro (los
 * que llegan durante un quantum entran en la cola ANTES que el proceso desalojado):
 *   P1 0-2 · P2 2-4 · P3 4-6 · P1 6-8 · P4 8-10 · P5 10-12 · P2 12-13 · P3 13-15 · P1 15-16 ·
 *   P5 16-18 · P3 18-20 · P3 20-22
 * Finales: P1 16, P2 13, P3 22, P4 10, P5 18. Espera = final − llegada − ráfaga: 11, 9, 12, 5, 10
 * → media 47/5 = 9,4 ms. Turnaround = final − llegada: 16, 12, 20, 7, 14 → 69/5 = 13,8 ms.
 * Throughput 5/22 por ms = 2,27 por 10 ms.
 *
 * El defecto: el proceso que acababa de usar la CPU volvía a la cola dos veces (en agregarLlegados
 * y en el `else`), así que P1 corría 0-2 y otra vez 2-4, salían bloques de duración cero y su final
 * se contaba dos veces: el bucle terminaba antes de repartir los 22 ms (con quantum 1, a los 14).
 */

const RUTA = '/visualizador-sistemas-operativos/';

async function abrirPlanificacion(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const pestana = page.getByRole('tab', { name: /Planificación CPU/ });
  await expect(pestana).toBeVisible({ timeout: 60_000 });
  // Sin input que sembrar: se espera a que React cuelgue sus props de la pestaña antes del clic
  await page.waitForFunction(
    () => {
      const b = Array.from(document.querySelectorAll('[role="tab"]')).find((t) => t.textContent?.includes('Planificación CPU'));
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    undefined,
    { timeout: 30_000 },
  );
  await pestana.click();
  await expect(page.getByRole('button', { name: 'Round Robin' })).toHaveAttribute('aria-pressed', 'true');
}

interface Bloque {
  proceso: string;
  ancho: number;
}

/** Los bloques del Gantt en orden, con su ancho en unidades del viewBox (28 por ms). */
async function bloquesGantt(page: Page): Promise<Bloque[]> {
  return page.locator('svg[aria-label*="Gantt"]').evaluate((svg) =>
    Array.from(svg.querySelectorAll('g')).map((g) => ({
      proceso: g.querySelector('text')?.textContent?.trim() ?? '',
      ancho: Number(g.querySelector('rect')?.getAttribute('width') ?? 0),
    })),
  );
}

test.describe('Round Robin (hallazgo de /reparar del 13/11/2026)', () => {
  test('quantum 2: el orden del Gantt y las métricas son las resueltas a mano', async ({ page }) => {
    await abrirPlanificacion(page);
    const bloques = await bloquesGantt(page);
    expect(bloques.map((b) => `${b.proceso}·${b.ancho / 28}`)).toEqual([
      'P1·2', 'P2·2', 'P3·2', 'P1·2', 'P4·2', 'P5·2', 'P2·1', 'P3·2', 'P1·1', 'P5·2', 'P3·2', 'P3·2',
    ]);
    const metricas = page.locator('[class*="metricaValor"]');
    await expect(metricas.nth(0)).toHaveText('9,4 ms');
    await expect(metricas.nth(1)).toHaveText('13,8 ms');
    await expect(metricas.nth(2)).toHaveText('2,27');
  });

  test('con cualquier quantum, cada proceso recibe su ráfaga entera y ningún bloque dura cero', async ({ page }) => {
    await abrirPlanificacion(page);
    const deslizador = page.locator('#quantum-slider');
    const rafaga: Record<string, number> = { P1: 5, P2: 3, P3: 8, P4: 2, P5: 4 };
    for (let q = 1; q <= 5; q++) {
      await deslizador.fill(String(q));
      await expect(page.getByText(`${q} ms`, { exact: true })).toBeVisible();
      const bloques = await bloquesGantt(page);
      const suma: Record<string, number> = {};
      for (const b of bloques) suma[b.proceso] = (suma[b.proceso] ?? 0) + b.ancho / 28;
      expect(bloques.filter((b) => b.ancho <= 0), `quantum ${q}: bloques de duración cero`).toEqual([]);
      expect(suma, `quantum ${q}: CPU recibida por proceso`).toEqual(rafaga);
    }
  });
});
