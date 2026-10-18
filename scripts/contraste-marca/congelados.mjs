/**
 * congelados.mjs — los prefijos de apps CONGELADAS (hoy, los cursos), leídos de su ÚNICA fuente:
 * `PREFIJOS_CONGELADOS` en `scripts/inspector/sincronizar.mjs` (16/10/2026, S0208).
 *
 * Ese script no exporta la constante y ejecuta cosas al importarse, así que se lee su texto.
 * Si la línea cambia de forma y no se encuentra, se PLANTA: devolver [] dejaría dentro de la
 * campaña lo que el usuario congeló, sin que nada lo dijera.
 */

import fs from 'node:fs';
import path from 'node:path';

export function prefijosCongelados(raiz) {
  const ruta = path.join(raiz, 'scripts', 'inspector', 'sincronizar.mjs');
  const txt = fs.readFileSync(ruta, 'utf8');
  const m = txt.match(/const PREFIJOS_CONGELADOS\s*=\s*\[([^\]]*)\]/);
  if (!m) throw new Error(`no encuentro PREFIJOS_CONGELADOS en ${ruta}: no se puede saber qué está congelado`);
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
}

/** ¿El fichero (ruta relativa con `/`) es de una app congelada? */
export const esCongelado = (rel, prefijos) => prefijos.some((p) => rel.startsWith(`app/${p}`));
