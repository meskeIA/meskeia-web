#!/usr/bin/env node
/**
 * check-enlaces-internos.mjs — candado anti-regresión del enlazado interno
 *
 * Rompe el build si vuelve a aparecer un enlace INTERNO con `?from=`.
 *
 * POR QUÉ (2026-07-28): los enlaces entre apps llevaban `?from=origen`, que crea
 * una URL distinta de la misma página. Para evitar duplicados se prohibió
 * `/*?from=` en robots.txt (26/05/2026) y eso dejó ~3.900 enlaces internos que
 * Googlebot veía pero no podía seguir: el catálogo quedó sin recomendaciones
 * internas y las apps solo existían vía sitemap. Ahora la marca interna viaja en
 * el FRAGMENTO (`#from=`), que Google ignora al resolver la URL.
 *
 * Sin este candado, la próxima app que copie el patrón antiguo volvería a cerrar
 * esas carreteras sin que nadie se entere. Ver lib/trackingFrom.ts.
 *
 * NO se revisan los saltos CROSS-DOMINIO (`https://…?from=meskeia|delegum`): son
 * deliberados, ningún robots.txt de los verticales los bloquea y funcionan bien.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const CARPETAS = ['app', 'components', 'lib', 'data'];
const EXTENSIONES = new Set(['.ts', '.tsx']);
// Ficheros que hablan del patrón antiguo en su documentación, no lo emiten.
const EXENTOS = new Set([
  path.join('lib', 'trackingFrom.ts'),
  path.join('components', 'RelatedApps.tsx'),
  path.join('components', 'AnalyticsTracker.tsx'),
  path.join('app', 'robots.ts'),
  path.join('app', 'sitemap.ts'),
  path.join('data', 'verticales.ts'),
]);

/** Enlace interno (empieza por /) que mete from= como parámetro de query. */
const PATRON = /["'`]\/[^"'`\s]*[?&]from=/g;

function* ficheros(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next') continue;
      yield* ficheros(p);
    } else if (EXTENSIONES.has(path.extname(e.name)) && statSync(p).size < 4_000_000) {
      yield p;
    }
  }
}

const fallos = [];
for (const carpeta of CARPETAS) {
  const base = path.join(RAIZ, carpeta);
  for (const f of ficheros(base)) {
    const rel = path.relative(RAIZ, f);
    if (EXENTOS.has(rel)) continue;
    const texto = readFileSync(f, 'utf8');
    const lineas = texto.split('\n');
    lineas.forEach((linea, i) => {
      if (linea.trimStart().startsWith('*') || linea.trimStart().startsWith('//')) return;
      PATRON.lastIndex = 0;
      if (PATRON.test(linea)) {
        fallos.push(`${rel}:${i + 1}  ${linea.trim().slice(0, 110)}`);
      }
    });
  }
}

if (fallos.length) {
  console.error('\n❌ Enlaces INTERNOS con ?from= (deben usar #from=, ver lib/trackingFrom.ts):\n');
  fallos.forEach((f) => console.error('   ' + f));
  console.error(`\n   ${fallos.length} enlace(s). Con ?from= robots.txt los bloquea y Googlebot no puede seguirlos.\n`);
  process.exit(1);
}

console.log('✅ Enlaces internos: ninguno usa ?from= (marca interna en fragmento)');
