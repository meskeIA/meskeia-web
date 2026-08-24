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

// ---------------------------------------------------------------------------
// REGLA 3 — Ningún enlace interno literal puede apuntar a una ruta que no existe
//
// POR QUÉ (2026-08-24): el 16/03 el commit 035a31a0 renombró 29 apps
// (calculadora/simulador → estimador/orientador). Cinco meses después, 21 de las
// 29 URLs viejas seguían devolviendo 404 sin redirect —correcto, porque ya no
// tenían tráfico que preservar (1 de 21 con impresiones en GSC, y 2)—, pero
// app/curso-decisiones-inversion/CourseContext.tsx seguía enlazando a DOS de
// ellas con `available: true`. Googlebot sigue los enlaces internos aunque la
// URL vieja ya no reciba impresiones: de ahí el aviso «No se ha encontrado
// (404)» que Search Console mandó ese día. Lo delató el correo de Google, no el
// build, cinco meses tarde.
//
// Es la TERCERA vez que se repite la misma forma: renombrar a escala y dejar
// enlaces internos colgando (18/07/2026, tres 404 internos tras otros
// renombrados). La regla 1 de CLAUDE.md pide convertir en candado la invariante
// que se repite, y ésta es "todo href literal resuelve a una página real".
//
// LÍMITES DELIBERADOS, para que el candado no mienta sobre su alcance:
//   · Solo hrefs LITERALES. Los construidos (`href={`/${slug}/`}`) no se miran:
//     su destino no existe hasta ejecutar.
//   · Los hrefs con extensión (.pdf, .png…) apuntan a public/, no a páginas: fuera.
//   · Un href raíz-relativo escrito DENTRO de un vertical (app/cronicum/page.tsx
//     enlaza a /europa/) es correcto en su dominio, donde la raíz es el vertical.
//     Se resuelve contra el prefijo DE ESE fichero, y solo ahí se admiten rutas
//     dinámicas. Un componente compartido (components/DelegumHeader.tsx) puede
//     probar todos los prefijos, pero únicamente contra rutas ESTÁTICAS.
//
// La primera versión de este candado admitía cualquier prefijo con dinámicas, y
// eso lo dejaba inerte: /cronicum/[slug]/ casaba con cualquier ruta de un solo
// segmento, que es la forma de casi toda app del catálogo. Daba verde al propio
// fallo que venía a cazar. Lo delató la prueba de especificidad —reinyectar el
// caso de origen y exigir que falle— antes de llegar a producción.
// Escape puntual: `enlace-ok: <razón>` en la línea o en la anterior.
// ---------------------------------------------------------------------------
const PREFIJOS_VERTICAL = ['/delegum', '/cronicum', '/stemum', '/coquinum'];

/** Rutas con página real bajo app/, con los grupos (x) plegados. */
function rutasDeApp(dir, prefijo, acc) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === 'api' || e.name.startsWith('_')) continue;
    const hijo = path.join(dir, e.name);
    // Los grupos de rutas —(marketing)— no aportan segmento a la URL.
    const ruta = e.name.startsWith('(') ? prefijo : `${prefijo}/${e.name}`;
    try {
      statSync(path.join(hijo, 'page.tsx'));
      acc.add(`${ruta}/`);
    } catch { /* carpeta sin página propia: solo contenedor */ }
    rutasDeApp(hijo, ruta, acc);
  }
  return acc;
}

const RUTAS = rutasDeApp(path.join(RAIZ, 'app'), '', new Set(['/']));
const DINAMICAS = [...RUTAS].filter((r) => r.includes('['));

/** Redirects declarados en next.config.ts (estáticos y de familia con :path*). */
const REDIRECTS = new Set();
const PREFIJOS_REDIRIGIDOS = [];
for (const m of configTexto.matchAll(/source:\s*'(\/[^']+)'/g)) {
  const s = m[1];
  if (s.includes('(')) continue; // patrón de headers(), no una ruta
  const familia = s.match(/^(.*)\/:path[*+]$/);
  if (familia) PREFIJOS_REDIRIGIDOS.push(`${familia[1]}/`);
  else REDIRECTS.add(s.endsWith('/') ? s : `${s}/`);
}

/** ¿Casa la ruta con alguna dinámica? /curso-x/leccion/3/ ⇄ /curso-x/leccion/[id]/ */
function casaDinamica(ruta) {
  const segs = ruta.split('/').filter(Boolean);
  return DINAMICAS.some((d) => {
    const ds = d.split('/').filter(Boolean);
    const catchAll = ds.some((s) => s.startsWith('[...'));
    if (!catchAll && ds.length !== segs.length) return false;
    return ds.every((s, i) => {
      if (s.startsWith('[...')) return true; // absorbe el resto
      return s.startsWith('[') || s === segs[i];
    });
  });
}

function resuelve(ruta, rel) {
  if (RUTAS.has(ruta) || REDIRECTS.has(ruta)) return true;
  if (PREFIJOS_REDIRIGIDOS.some((p) => ruta.startsWith(p))) return true;
  if (casaDinamica(ruta)) return true;
  // Escrito dentro de un vertical: allí la raíz del dominio es el prefijo, y la
  // ruta puede ser dinámica (las puertas de Cronicum son /cronicum/[slug]/).
  const propio = PREFIJOS_VERTICAL.find((p) =>
    rel.startsWith(path.join('app', p.slice(1)) + path.sep)
  );
  if (propio) return RUTAS.has(`${propio}${ruta}`) || casaDinamica(`${propio}${ruta}`);
  // Componente compartido: puede servirse bajo cualquier vertical, pero solo se
  // acepta contra una ruta ESTÁTICA — una dinámica de un segmento casaría con todo.
  return PREFIJOS_VERTICAL.some((p) => RUTAS.has(`${p}${ruta}`));
}

// href="/x" · href='/x' · href={'/x'} · href={`/x`} · href: '/x'
const PATRON_HREF = /href\s*[=:]\s*\{?\s*["'`](\/[^"'`{}\s]*)["'`]/g;
const CON_EXTENSION = /\.[a-z0-9]{2,4}$/i;

const rotos = new Map();
let comprobados = 0;
for (const carpeta of CARPETAS) {
  for (const f of ficheros(path.join(RAIZ, carpeta))) {
    const rel = path.relative(RAIZ, f);
    const lineas = readFileSync(f, 'utf8').split('\n');
    lineas.forEach((linea, i) => {
      const previa = i > 0 ? lineas[i - 1] : '';
      if (/enlace-ok:/.test(linea) || /enlace-ok:/.test(previa)) return;
      // Ejemplo de marcado dentro de una cadena (glosarios de programación).
      if (/<\s*(Link|a)\b/.test(linea) && /["'`]\s*<\s*(Link|a)\b/.test(linea)) return;
      PATRON_HREF.lastIndex = 0;
      for (const m of linea.matchAll(PATRON_HREF)) {
        let ruta = m[1].split('#')[0].split('?')[0];
        if (!ruta || ruta.startsWith('/api/') || CON_EXTENSION.test(ruta)) continue;
        if (!ruta.endsWith('/')) ruta += '/';
        comprobados++;
        if (resuelve(ruta, rel)) continue;
        if (!rotos.has(ruta)) rotos.set(ruta, []);
        rotos.get(ruta).push(`${rel}:${i + 1}`);
      }
    });
  }
}

if (rotos.size) {
  console.error('\n❌ Enlaces internos hacia rutas que NO existen (404 para el usuario y para Googlebot):\n');
  for (const [ruta, sitios] of [...rotos].sort()) {
    console.error(`   ${ruta.padEnd(46)} ← ${sitios.slice(0, 4).join(', ')}${sitios.length > 4 ? ` (+${sitios.length - 4})` : ''}`);
  }
  console.error(
    `\n   ${rotos.size} ruta(s) sin página detrás. Apunta el enlace a la ruta viva, o\n` +
    '   añade el 301 a next.config.ts si la URL vieja aún conserva impresiones.\n' +
    '   Falso positivo: comentario `enlace-ok: <razón>` en la línea o en la anterior.\n'
  );
  process.exit(1);
}

console.log(`✅ Enlaces internos: ${comprobados} enlaces literales revisados, todos con página real detrás`);
