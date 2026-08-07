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

// ---------------------------------------------------------------------------
// REGLA 2 — Todo redirect que se lleve apps del catálogo a otro dominio debe
//           estar declarado en RUTAS_MIGRADAS (lib/trackingFrom.ts)
//
// POR QUÉ (2026-08-07): el 22/07 se añadió a next.config.ts un 301 de
// /visualizador-historia/:path* a cronicum.com, pero las 172 cronologías siguen
// en el catálogo con su URL interna. Un `next/link` hacia ella pide primero su
// payload RSC; ese fetch sigue el 308 hasta el dominio vertical y ahí lo corta la
// CSP de meskeIA, así que Next cae a navegación dura y, como el href lleva
// `#from=`, el usuario solo cambia de fragmento: se queda donde estaba.
// SIN ERROR VISIBLE. Estuvo así 16 días y lo delató un usuario, no el build.
//
// La invariante que se repite no es "alguien enlazó mal": es "se migró una
// familia de apps y nadie se lo contó al resolutor". Por eso el candado no mira
// los href, mira el par redirect ⇄ declaración, que es donde nace el fallo.
//
// Casan solo los redirects que de verdad se llevan apps del CATÁLOGO: para
// /delegum/:path* o /cronicum/:path* ninguna app tiene esa URL (son prefijos de
// implementación), así que quedan fuera sin necesidad de lista de excepciones.
// ---------------------------------------------------------------------------
const configTexto = readFileSync(path.join(RAIZ, 'next.config.ts'), 'utf8');
const trackingTexto = readFileSync(path.join(RAIZ, 'lib', 'trackingFrom.ts'), 'utf8');
const appsTexto = readFileSync(path.join(RAIZ, 'data', 'applications.ts'), 'utf8');

// { source: '/<prefijo>/:path*', …, destination: 'https://<otro dominio>/…' }
const REDIRECT_EXTERNO = /source:\s*'(\/[^']*?)\/:path\*'[^}]*?destination:\s*'(https?:\/\/[^']+)'/g;

const sinDeclarar = [];
for (const m of configTexto.matchAll(REDIRECT_EXTERNO)) {
  const prefijo = `${m[1]}/`;
  // ¿Se lleva alguna app del catálogo? (si no, es un prefijo de implementación)
  if (!appsTexto.includes(`url: "${prefijo}`)) continue;
  if (!trackingTexto.includes(`prefijo: '${prefijo}'`)) {
    sinDeclarar.push(`${prefijo} → ${m[2]}`);
  }
}

if (sinDeclarar.length) {
  console.error('\n❌ Familias de apps migradas a otro dominio SIN declarar en RUTAS_MIGRADAS:\n');
  sinDeclarar.forEach((f) => console.error('   ' + f));
  console.error(
    '\n   Esas apps siguen en el catálogo con su URL interna, así que meskeIA las\n' +
    '   enlazará con next/link: el fetch RSC seguirá el redirect fuera del dominio,\n' +
    '   la CSP lo cortará y el clic no navegará A NINGÚN SITIO, sin error visible.\n' +
    '   Añade el prefijo a RUTAS_MIGRADAS en lib/trackingFrom.ts.\n'
  );
  process.exit(1);
}

console.log('✅ Rutas migradas: toda familia redirigida fuera del dominio está declarada en el resolutor');
