/**
 * Script: check-stemum.mjs
 *
 * Candado de coherencia del portal Stemum. Se ejecuta antes de cada build
 * (`npm run build`) y a mano con `npm run check:stemum`.
 *
 * Existe por un fallo real: hasta el 28/07/2026 cada app de Stemum se registraba
 * en DOS listas — el mapa de `data/stemum.ts` (breadcrumb, proxy, contadores) y
 * el array `APPS` hardcodeado dentro de `app/stemum/[disciplina]/page.tsx` (la
 * parrilla). Registrar solo la primera dejaba la app contada en el hero pero sin
 * tarjeta que la enlazase, y el build pasaba sin una queja. Le pasó a
 * `simulador-logica-secuencial` y a `ajustar-ecuaciones-quimicas`.
 *
 * Ahora la parrilla se deriva del catálogo, así que ese desajuste ya es
 * imposible. Este script vigila lo que sigue siendo posible: un slug mal escrito,
 * una app del catálogo sin carpeta en `app/`, sin registrar en meskeIA, una
 * disciplina inventada, o que alguien vuelva a hardcodear una parrilla.
 *
 * Los datos se leen con expresiones regulares sobre los .ts (mismo enfoque que
 * `generate-llm-index.js`) para no depender de la carga de TypeScript en el
 * entorno de build. Si el formato de los ficheros cambia y el parseo se
 * desincroniza, el script falla en vez de dar un OK vacío.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');
const existe = (rel) => fs.existsSync(path.join(RAIZ, rel));

const errores = [];
const DISCS_RUTA = 'app/stemum';

// ─── Lectura del catálogo ────────────────────────────────────────────────────
const stemum = leer('data/stemum.ts');

const trozo = (desde, hasta) => {
  const i = stemum.indexOf(desde);
  if (i < 0) throw new Error(`No encuentro "${desde}" en data/stemum.ts`);
  const j = hasta ? stemum.indexOf(hasta, i) : stemum.length;
  return stemum.slice(i, j < 0 ? stemum.length : j);
};

// Disciplinas: 'slug': 'Etiqueta'
const bloqueDiscs = trozo('export const STEMUM_DISCIPLINAS', 'export type StemumApp');
const disciplinas = [...bloqueDiscs.matchAll(/'([a-z-]+)':\s*'([^']+)'/g)].map((m) => m[1]);

// Apps y material de apoyo: objetos { slug, icon, titulo, desc, disciplina }
const REGEX_ENTRADA =
  /\{\s*slug:\s*'([^']+)',\s*icon:\s*'([^']*)',\s*titulo:\s*'([^']*)',\s*desc:\s*'([^']*)',\s*disciplina:\s*'([^']*)',\s*\}/g;

const entradas = (bloque, nombre) => {
  const lista = [...bloque.matchAll(REGEX_ENTRADA)].map((m) => ({
    slug: m[1],
    icon: m[2],
    titulo: m[3],
    desc: m[4],
    disciplina: m[5],
  }));
  // Control anti-falso-OK: tantas entradas parseadas como slugs hay en el bloque.
  // Se cuenta la clave `slug:` a secas (sin exigir el valor en la misma línea):
  // si se exigiera, un cambio de formato haría bajar los dos contadores a la vez
  // y el descuadre pasaría desapercibido.
  const slugs = (bloque.match(/^\s*slug:/gm) ?? []).length;
  if (lista.length !== slugs) {
    errores.push(
      `Parseo desincronizado en ${nombre}: ${slugs} entradas en el fichero, ` +
        `${lista.length} reconocidas. Revisa REGEX_ENTRADA en este script.`,
    );
  }
  return lista;
};

const apps = entradas(
  trozo('export const STEMUM_APPS', 'export function appsDeDisciplina'),
  'STEMUM_APPS',
);
const material = entradas(
  trozo('export const STEMUM_MATERIAL_APOYO', 'export const STEMUM_MATERIAL_DISCIPLINA'),
  'STEMUM_MATERIAL_APOYO',
);

if (!apps.length) errores.push('STEMUM_APPS está vacío o no se ha podido leer.');

// ─── Registros de meskeIA ───────────────────────────────────────────────────
const implementadas = leer('data/implemented-apps.ts');
const applications = leer('data/applications.ts');

// ─── Comprobaciones ─────────────────────────────────────────────────────────
const vistos = new Map();

for (const { slug, icon, titulo, desc, disciplina } of [...apps, ...material]) {
  const esMaterial = material.some((m) => m.slug === slug);
  const donde = esMaterial ? 'STEMUM_MATERIAL_APOYO' : 'STEMUM_APPS';

  if (vistos.has(slug)) {
    errores.push(`Slug duplicado: "${slug}" (${vistos.get(slug)} y ${donde}).`);
  }
  vistos.set(slug, donde);

  if (!disciplinas.includes(disciplina)) {
    errores.push(
      `"${slug}" declara la disciplina "${disciplina}", que no está en STEMUM_DISCIPLINAS.`,
    );
  }
  if (!icon.trim()) errores.push(`"${slug}" no tiene icon: la tarjeta saldría sin emoji.`);
  if (!titulo.trim()) errores.push(`"${slug}" no tiene titulo.`);
  if (!desc.trim()) errores.push(`"${slug}" no tiene desc.`);

  if (!existe(`app/${slug}/page.tsx`)) {
    errores.push(`"${slug}" está en ${donde} pero no existe app/${slug}/page.tsx: enlace roto.`);
  }
  if (!implementadas.includes(`"/${slug}/"`)) {
    errores.push(`"${slug}" no está en data/implemented-apps.ts.`);
  }
  if (!applications.includes(`url: "/${slug}/"`)) {
    errores.push(
      `"${slug}" no está en data/applications.ts: quedaría sin descripción en el llms.txt del portal.`,
    );
  }
}

// Cada disciplina necesita su página y al menos una app en la parrilla.
for (const disc of disciplinas) {
  const pagina = `${DISCS_RUTA}/${disc}/page.tsx`;
  if (!existe(pagina)) {
    errores.push(`La disciplina "${disc}" no tiene su página ${pagina}.`);
    continue;
  }
  const cuantas = apps.filter((a) => a.disciplina === disc).length;
  if (!cuantas) errores.push(`La disciplina "${disc}" no tiene ninguna app en STEMUM_APPS.`);

  // La parrilla debe derivarse del catálogo, no volver a listar apps a mano.
  const src = leer(pagina);
  if (/const APPS = \[/.test(src)) {
    errores.push(
      `${pagina} vuelve a llevar una lista APPS hardcodeada. Usa appsDeDisciplina('${disc}'): ` +
        'una segunda lista es justo el fallo que este candado evita.',
    );
  } else if (!src.includes(`appsDeDisciplina('${disc}')`)) {
    errores.push(`${pagina} no pinta su parrilla con appsDeDisciplina('${disc}').`);
  }
}

// ─── Resultado ──────────────────────────────────────────────────────────────
if (errores.length) {
  console.error(`\n❌ Stemum: ${errores.length} problema(s) de coherencia\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('');
  process.exit(1);
}

const porDisc = disciplinas
  .map((d) => `${d} ${apps.filter((a) => a.disciplina === d).length}`)
  .join(' · ');
console.log(
  `✅ Stemum coherente: ${apps.length} apps (${porDisc}) + ${material.length} de material de apoyo`,
);
