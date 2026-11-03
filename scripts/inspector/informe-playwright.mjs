/**
 * informe-playwright.mjs — qué specs salieron en verde en un informe JSON de Playwright
 *
 * Lo usan `cerrar.mjs --revalidar-commits` (18/10/2026, cabo C0161), donde nació, y
 * `validar-familias.mjs` (03/11/2026), que mira además el testigo de la familia. Vive aparte para
 * que los dos lean el informe con el mismo criterio.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Specs en verde según un informe JSON de Playwright: ruta absoluta del spec en minúsculas →
 * 'verde' | 'inestable' | 'rojo'. Manda el peor de sus tests. Verde = cada test `expected` o
 * `skipped`. Un `flaky` (pasó al reintentar) no cuenta: aquí se decide sacar una app de la cola
 * sin mirarla, y ante la duda se queda.
 */
export function specsDelInforme(ruta) {
  const j = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  const raizTests = j.config?.rootDir;
  if (!raizTests) throw new Error(`${ruta} no parece un informe JSON de Playwright (falta config.rootDir)`);
  const peso = { verde: 0, inestable: 1, rojo: 2 };
  const verde = new Map();
  const recorrer = (s) => {
    for (const sp of s.specs ?? []) {
      const f = path.resolve(raizTests, sp.file).toLowerCase();
      for (const t of sp.tests) {
        const e = t.status === 'expected' || t.status === 'skipped' ? 'verde' : t.status === 'flaky' ? 'inestable' : 'rojo';
        if (peso[e] >= peso[verde.get(f) ?? 'verde']) verde.set(f, e);
      }
    }
    for (const hija of s.suites ?? []) recorrer(hija);
  };
  for (const s of j.suites ?? []) recorrer(s);
  return verde;
}
