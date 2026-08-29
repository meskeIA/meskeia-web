/**
 * Script: check-og-image.mjs
 *
 * Candado de la TARJETA SOCIAL. Se ejecuta antes de cada build (`npm run build`)
 * y a mano con `npm run check:og-image`.
 *
 * Existe por un fallo real, encontrado el 29/08/2026 al preguntar por qué los
 * posts de X de Coquinum y Cronicum salían con la tarjeta pequeña y un icono
 * gris de documento mientras los de meskeIA llevaban imagen. Dos causas, las dos
 * silenciosas:
 *
 *  1. La plantilla `templates/app-base/metadata.template.ts` declaraba
 *     `openGraph` y `twitter` SIN `images`, y Next **no** hereda la del layout
 *     raíz: el merge de metadata es *shallow*, así que declarar `openGraph` en la
 *     página reemplaza entero el del padre y la `ogImage` de
 *     `generateBaseMetadata()` no llega. Con `twitter:card = summary_large_image`
 *     y ninguna imagen detrás, X, WhatsApp o LinkedIn degradan la tarjeta.
 *     Afectaba a 159 apps del catálogo, 54 de ellas del portal Coquinum.
 *
 *  2. La og de Cronicum apuntaba a `https://meskeia.com/cronicum/og-image.png`,
 *     que el 308 canónico de `next.config.ts` (`/cronicum/:path+` →
 *     `cronicum.com/:path+/`) desvía a `cronicum.com/og-image.png` — o sea
 *     `public/og-image.png`, la de meskeIA. La imagen de marca de Cronicum no se
 *     sirvió NUNCA, y el comentario del código afirmaba lo contrario.
 *
 * Lo que vigila, por tanto:
 *   A. Que cada app de un portal con imagen propia declare ESA imagen, en
 *      `openGraph` y en `twitter`. Sin pasivo: rompe el build.
 *   B. Que las páginas de portal declaren su imagen.
 *   C. Que toda imagen referenciada exista en `public/` y que ningún redirect de
 *      `next.config.ts` se la lleve por delante (la causa 2, que ningún ojo
 *      humano detecta leyendo el metadata).
 *   D. El pasivo de meskeIA (apps sin imagen fuera de los portales) se CUENTA y
 *      se nombra, pero no detiene el build: son 105 apps al escribir esto y
 *      romper por ellas dejaría el candado desactivado en una semana. Es el mismo
 *      criterio de `check:a11y-jsx` y `check:parser`.
 *
 * `--todo` lista el pasivo entero en vez de una muestra.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSO = process.argv.includes('--todo');
const errores = [];
const avisos = [];
const resumen = [];

const leer = (p) => fs.readFileSync(path.join(RAIZ, p), 'utf8');
const existe = (p) => fs.existsSync(path.join(RAIZ, p));

/**
 * Portales con imagen de marca propia. Al abrir un vertical nuevo (Stemum y
 * Delegum siguen pendientes de decisión a 29/08/2026), se añade aquí su entrada
 * y el candado pasa a exigirla.
 */
const PORTALES = [
  {
    nombre: 'Coquinum',
    // Fuente única del catálogo: la misma que usa `check:verticales`.
    catalogo: 'data/coquinum.ts',
    imagen: 'https://meskeia.com/coquinum/og-image.png',
    arbol: 'app/coquinum',
  },
  {
    nombre: 'Stemum',
    // Un solo catálogo para los dos grupos del portal: las 139 apps de
    // `STEMUM_APPS` y las 12 tablas de `STEMUM_MATERIAL_APOYO`, que también se
    // publican bajo stemum.com y comparten por tanto la misma tarjeta.
    catalogo: 'data/stemum.ts',
    imagen: 'https://meskeia.com/stemum/og-image.png',
    arbol: 'app/stemum',
  },
  {
    nombre: 'Cronicum',
    // Sus cronologías no tienen metadata.ts propio: las 182 páginas salen del
    // `generateMetadata` de [slug], que el recorrido del árbol ya alcanza.
    catalogo: null,
    imagen: 'https://cronicum.com/cronicum/og-image.png',
    arbol: 'app/cronicum',
  },
  {
    nombre: 'Delegum',
    // No tiene catálogo de apps: las apps de meskeIA vinculadas a Delegum
    // conservan la og de meskeIA (decisión del 29/08/2026, porque no forman una
    // lista de la que derivar). Lo que sí es suyo son las 21 páginas del árbol:
    // home, fichas de /datos-fiscales/, asistente y blog.
    catalogo: null,
    imagen: 'https://delegum.com/delegum/og-image.png',
    arbol: 'app/delegum',
  },
];

/** Todos los .ts/.tsx bajo un directorio, recursivamente. */
function ficherosDe(rel) {
  const salida = [];
  (function recorrer(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else if (/\.(ts|tsx)$/.test(e.name)) salida.push(path.relative(RAIZ, p).replaceAll('\\', '/'));
    }
  })(path.join(RAIZ, rel));
  return salida;
}

/** Rango [ini, fin] del objeto `{...}` que sigue a `clave:`, con llaves balanceadas. */
function bloque(texto, clave) {
  const re = new RegExp(`(^|[\\s{,])${clave}\\s*:\\s*\\{`, 'm');
  const m = texto.match(re);
  if (!m) return null;
  const ini = texto.indexOf('{', m.index + m[0].length - 1);
  let prof = 0;
  let comilla = null;
  for (let i = ini; i < texto.length; i++) {
    const c = texto[i];
    if (comilla) {
      if (c === '\\') i++;
      else if (c === comilla) comilla = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
    if (c === '{') prof++;
    else if (c === '}') { prof--; if (prof === 0) return [ini, i]; }
  }
  return null;
}

// ─── A y B. Cada portal usa SU imagen ───────────────────────────────────────
const imagenesUsadas = new Set();

for (const portal of PORTALES) {
  let apps = [];
  if (portal.catalogo) {
    const src = leer(portal.catalogo);
    apps = [...new Set([...src.matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1]))];
    if (!apps.length) {
      errores.push(`[${portal.nombre}] no se ha podido leer ningún slug de ${portal.catalogo}: el parseo está desincronizado.`);
      continue;
    }
  }

  let ok = 0;
  for (const slug of apps) {
    const rel = `app/${slug}/metadata.ts`;
    if (!existe(rel)) continue; // lo denuncia check:verticales, no este candado
    const t = leer(rel);
    for (const clave of ['openGraph', 'twitter']) {
      const b = bloque(t, clave);
      if (!b) {
        errores.push(`[${portal.nombre}] ${rel}: no declara \`${clave}\`, así que la tarjeta social sale sin imagen.`);
        continue;
      }
      if (!t.slice(b[0], b[1]).includes(portal.imagen)) {
        errores.push(`[${portal.nombre}] ${rel}: \`${clave}\` no usa la imagen del portal (${portal.imagen}).`);
      }
    }
    ok++;
  }

  // Páginas propias del portal. Se recorre el árbol entero en vez de una lista a
  // mano: así una página nueva queda vigilada desde que nace, que es justo lo que
  // no ocurrió con las 20 de Delegum (fichas fiscales, asistente y blog), todas
  // sin imagen sin que nada lo dijera.
  let paginas = 0;
  for (const rel of ficherosDe(portal.arbol)) {
    const t = leer(rel);
    if (!/openGraph\s*:\s*\{/.test(t)) continue; // hereda del layout: no es cosa nuestra
    paginas++;
    // Se comprueba BLOQUE A BLOQUE, no sobre el fichero entero: que la URL
    // aparezca en algún sitio no dice nada: un `openGraph` sin imagen colaba solo
    // porque el `twitter` de al lado sí la tenía, y `og:image` es justamente el
    // que leen casi todas las plataformas. Lo destapó `og:probar-candado`.
    //
    // Vale la URL literal o la constante OG_IMAGE del metadata del portal (así lo
    // declaran `app/cronicum/[slug]/page.tsx` y la home de Delegum, para tener una
    // sola definición). No basta con ver el nombre de la constante: se resuelve
    // dónde vive y se comprueba que ahí está de verdad la URL del portal.
    const imp = t.match(/import\s*\{[^}]*\bOG_IMAGE\b[^}]*\}\s*from\s*'([^']+)'/);
    const origen = imp ? `${path.posix.join(path.posix.dirname(rel), imp[1])}.ts` : rel;
    const constanteVale = existe(origen) && leer(origen).includes(portal.imagen);

    for (const clave of ['openGraph', 'twitter']) {
      const b = bloque(t, clave);
      if (!b) {
        errores.push(`[${portal.nombre}] ${rel}: declara \`openGraph\` pero no \`${clave}\`, así que la tarjeta sale incompleta.`);
        continue;
      }
      const dentro = t.slice(b[0], b[1]);
      const ok = dentro.includes(portal.imagen) || (dentro.includes('OG_IMAGE') && constanteVale);
      if (!ok) {
        errores.push(`[${portal.nombre}] ${rel}: \`${clave}\` no declara la imagen del portal (${portal.imagen}).`);
      }
    }
  }

  imagenesUsadas.add(portal.imagen);
  resumen.push(`${portal.nombre}: ${ok} apps + ${paginas} página(s) de portal con su og propia`);
}

// ─── C. Toda imagen referenciada existe y nadie la desvía ───────────────────
// Prefijos con redirect de host en next.config.ts: `source: '/xxx/:path+'` bajo
// la condición `has` (host meskeia.com). Una og servida desde meskeia.com que
// caiga bajo uno de ellos NO se sirve: se convierte en un 308 a otro dominio.
const nextConfig = leer('next.config.ts');
const prefijosRedirigidos = [...nextConfig.matchAll(/source:\s*'\/([a-z0-9-]+)\/:path\+'\s*,\s*has\b/g)].map((m) => m[1]);

// Imágenes de meskeIA que el resto del catálogo referencia, además de las de portal.
imagenesUsadas.add('https://meskeia.com/og-image.png');

for (const url of imagenesUsadas) {
  const { hostname, pathname } = new URL(url);
  const local = path.posix.join('public', pathname);
  if (!existe(local)) {
    errores.push(`[imagen] ${url} no existe en el repositorio (esperado en ${local}): la tarjeta saldría rota.`);
    continue;
  }
  const primerSegmento = pathname.split('/')[1];
  if (hostname.endsWith('meskeia.com') && prefijosRedirigidos.includes(primerSegmento)) {
    errores.push(
      `[imagen] ${url} cae bajo el redirect '/${primerSegmento}/:path+' de next.config.ts: ` +
      `meskeia.com la desvía a otro dominio y se acaba sirviendo otra imagen. ` +
      `Sírvela desde el dominio del portal (https://${primerSegmento}.com${pathname}).`,
    );
  }
}
resumen.push(`${imagenesUsadas.size} imágenes verificadas (existen y no las desvía ningún redirect)`);

// ─── D. Pasivo de meskeIA: se cuenta y se nombra, no rompe ──────────────────
const slugsDePortal = new Set();
for (const portal of PORTALES) {
  if (!portal.catalogo) continue;
  for (const m of leer(portal.catalogo).matchAll(/slug: '([a-z0-9-]+)'/g)) slugsDePortal.add(m[1]);
}

const sinImagen = [];
for (const dir of fs.readdirSync(path.join(RAIZ, 'app'), { withFileTypes: true })) {
  if (!dir.isDirectory() || slugsDePortal.has(dir.name)) continue;
  const rel = `app/${dir.name}/metadata.ts`;
  if (!existe(rel)) continue;
  const t = leer(rel);
  const b = bloque(t, 'openGraph');
  if (b && !t.slice(b[0], b[1]).includes('images')) sinImagen.push(dir.name);
}

if (sinImagen.length) {
  avisos.push(`${sinImagen.length} apps de meskeIA declaran \`openGraph\` sin \`images\`: su tarjeta social sale sin imagen.`);
  const muestra = VERBOSO ? sinImagen : sinImagen.slice(0, 8);
  for (const s of muestra) avisos.push(`   app/${s}/metadata.ts`);
  if (!VERBOSO && sinImagen.length > 8) avisos.push(`   … y ${sinImagen.length - 8} más (--todo para verlas)`);
}

// ─── Resultado ──────────────────────────────────────────────────────────────
if (avisos.length) {
  console.warn('\n⚠️  Tarjeta social: pasivo pendiente (no rompe el build)\n');
  for (const a of avisos) console.warn(`   ${a}`);
  console.warn('');
}

if (errores.length) {
  console.error(`\n❌ Tarjeta social: ${errores.length} problema(s)\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('✅ Tarjeta social coherente');
for (const r of resumen) console.log(`   · ${r}`);
