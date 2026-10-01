#!/usr/bin/env node
/**
 * check-anio-titulo.mjs — que el año del título de una app fiscal salga del dato
 *
 * Ejecutar:  npm run check:anio-titulo            (lo ejecuta también `npm run build`)
 *            npm run check:anio-titulo -- --lista  (apps vigiladas y excepciones vigentes)
 *
 * QUÉ EXIGE
 * ─────────
 * Que ninguna app que importe de `@/data/fiscal` escriba A MANO un año en un título: el
 * `title` de su metadata, el de `openGraph` y el de `twitter`, o una `const title`. El año
 * se toma de la `vigencia` del `*_META` del módulo que sella sus datos:
 *
 *     const anio = FISCAL_AUTONOMOS_META.vigencia;
 *     title: `Estimador Cuota de Autónomo ${anio} - Orientación RETA | meskeIA`,
 *
 * Así, re-sellar el módulo en la revisión de enero actualiza también el título. Mira los
 * `metadata.ts` y `layout.tsx` de cada carpeta de `app/` cuyo código importe `@/data/fiscal`.
 *
 * DE DÓNDE SALE
 * ─────────────
 * De la semilla S0174 (01/10/2026). Once apps de Delegum calculaban con módulos sellados como
 * vigencia 2026 y se anunciaban «2025» en el título: `estimador-cuota-autonomo`,
 * `estimador-plusvalia-municipal`, `simulador-irpf-tramos`, `simulador-desglose-nomina`… En
 * una de ellas el FAQPage preguntaba «¿Cuánto se paga de cuota de autónomo en 2025?» y la
 * respuesta empezaba «En 2026».
 *
 * Por qué importa aunque esas páginas casi no reciban impresiones de Google: el probe de IA de
 * Delegum (05/08/2026) vio que las seis fuentes que citó ChatGPT llevaban 2026 en el título, y
 * que ante una pregunta sin año el índice prefiere lo que se anuncia del año en curso. Ese
 * hallazgo se anotó en el ciclo fiscal mensual, pero ni `/triaje-fiscal` ni
 * `/revision-fiscal-enero` miran los títulos, así que re-sellar un módulo no los arrastraba.
 *
 * SIN PASIVO
 * ──────────
 * Las 21 apps con un año a mano en el título (11 con «2025» y 10 con «2026», que hoy acierta
 * pero caducaría en enero) pasaron a derivarlo en el mismo commit que crea este fichero. Por
 * eso puede romper el build en vez de avisar.
 *
 * QUÉ NO CUENTA COMO AÑO A MANO
 * ─────────────────────────────
 * Un año pegado a un guion o a una barra: es un nombre o una referencia, no el año del dato.
 * «CNAE-2025» es el nombre de la clasificación, «Plan 2026-2030» el de un plan, «Ley 28/2022»
 * una norma. Tampoco lo que va dentro de `${…}`, que es justo la forma buena.
 *
 * QUÉ NO MIRA
 * ───────────
 * - Las `description`, las `keywords` ni el FAQPage. A propósito: un texto con IMPORTES
 *   escritos a mano tiene que llevar el año escrito a mano. «SMI 2026: 1.221 €» es verdad;
 *   derivar el año y no el importe daría en enero «SMI 2027: 1.221 €», que es falso. El
 *   título rara vez lleva cifras, y por eso es lo único que se puede exigir sin criterio.
 * - Si la `vigencia` del módulo es la correcta: eso es trabajo del triaje mensual.
 * - Un año escondido en una constante (`const ANIO = '2025'`) que luego se interpola: el
 *   candado ve el `${ANIO}` y calla. Es un hueco aceptado; la forma buena lee el META.
 *
 * ESCAPE
 * ──────
 * `anio-ok: <razón>` en la línea del título o en la anterior, con la razón en la misma línea:
 * la marca a secas también rompe. Caso legítimo vigente: `test-obligado-declarar-renta`, cuyo
 * «Renta 2025» es el EJERCICIO que se declara, no la vigencia del dato, y cambia con la
 * campaña junto a todo el cuerpo de la página.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `--raiz <dir>` analiza otro árbol. Existe solo para que `npm run anio-titulo:probar-candado`
 * monte apps desechables y compruebe que el candado se enciende y calla donde debe.
 */
function raizPedida() {
  const i = process.argv.indexOf('--raiz');
  return i !== -1 && process.argv[i + 1] ? path.resolve(process.argv[i + 1]) : null;
}

const RAIZ = raizPedida() ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LISTA = process.argv.includes('--lista');

const IMPORTA_FISCAL = /from\s+['"]@\/data\/fiscal(?:\/[^'"]*)?['"]/;
// Un año suelto: ni dentro de una referencia (28/2022) ni de un rango o nombre (CNAE-2025)
const ANIO_SUELTO = /(?<![\d/-])(?:19|20)\d{2}(?![\d/-])/;
// `title:` o `const title =`, seguido del literal. El cuerpo se acota a 300 caracteres: un
// título cabe de sobra, y una captura más larga es que el regex se ha perdido (scripts/CLAUDE.md).
const TITULO = /\btitle\s*[:=]\s*(['"`])((?:\\.|(?!\1)[\s\S]){0,300}?)\1/g;

/**
 * Vacía las líneas que son ENTERAS un comentario, conservando el número de líneas. Es la
 * misma función roma de check-legal-notice.mjs: no interpreta cadenas, así que no puede
 * desalinearse. Un título citado en un comentario no es un título.
 */
function soloCodigo(fuente) {
  let dentroDeBloque = false;
  return fuente
    .split('\n')
    .map((linea) => {
      const limpia = linea.trim();
      if (dentroDeBloque) {
        if (limpia.includes('*/')) dentroDeBloque = false;
        return '';
      }
      if (limpia.startsWith('//')) return '';
      if (limpia.startsWith('/*') || limpia.startsWith('*')) {
        if (limpia.startsWith('/*') && !limpia.includes('*/')) dentroDeBloque = true;
        return '';
      }
      return linea;
    })
    .join('\n');
}

/** ¿Lleva la línea (o la anterior) un `anio-ok:`? Devuelve la razón, '' si va a secas. */
function escapeDe(lineas, i) {
  for (const l of [lineas[i], lineas[i - 1]]) {
    const m = l?.match(/anio-ok:[ \t]*([^\n]*)/);
    if (m) return m[1].replace(/\*\/\s*$/, '').trim();
  }
  return null;
}

function importaFiscal(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(ts|tsx)$/.test(f)) continue;
    if (IMPORTA_FISCAL.test(fs.readFileSync(path.join(dir, f), 'utf8'))) return true;
  }
  return false;
}

const dirApp = path.join(RAIZ, 'app');
const vigiladas = [];
const aMano = [];         // { fichero, linea, titulo, anio }
const escapeSinRazon = [];
const conEscape = [];

for (const slug of fs.readdirSync(dirApp)) {
  const dir = path.join(dirApp, slug);
  if (!fs.statSync(dir).isDirectory() || !importaFiscal(dir)) continue;
  vigiladas.push(slug);

  for (const nombre of ['metadata.ts', 'layout.tsx']) {
    const ruta = path.join(dir, nombre);
    if (!fs.existsSync(ruta)) continue;
    const crudo = fs.readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');
    const lineasCrudas = crudo.split('\n');
    const codigo = soloCodigo(crudo);

    for (const m of codigo.matchAll(TITULO)) {
      const cuerpo = m[2].replace(/\$\{[^}]*\}/g, ' ');
      const anio = cuerpo.match(ANIO_SUELTO);
      if (!anio) continue;
      const i = codigo.slice(0, m.index).split('\n').length - 1;
      const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
      const razon = escapeDe(lineasCrudas, i);
      if (razon === '') escapeSinRazon.push(`${rel}:${i + 1}`);
      else if (razon) conEscape.push({ donde: `${rel}:${i + 1}`, razon });
      else aMano.push({ donde: `${rel}:${i + 1}`, titulo: m[2].trim(), anio: anio[0] });
    }
  }
}

// ── Salida ────────────────────────────────────────────────────────────────────

if (vigiladas.length === 0) {
  // Plantarse: cero apps fiscales es un parser mudo, no un catálogo limpio (scripts/CLAUDE.md)
  console.error('✗ check:anio-titulo no encuentra ninguna app que importe @/data/fiscal: el detector está roto.');
  process.exit(1);
}

if (LISTA) {
  console.log(`${vigiladas.length} apps importan @/data/fiscal y tienen vigilado el año del título`);
  console.log(`  títulos con «anio-ok:»: ${conEscape.length}`);
  for (const { donde, razon } of conEscape) console.log(`      ${donde} → ${razon}`);
  process.exit(0);
}

let falla = false;

if (aMano.length) {
  falla = true;
  console.error(`\n✗ AÑO ESCRITO A MANO EN EL TÍTULO de una app fiscal: ${aMano.length}\n`);
  console.error('  El año del título tiene que salir de la vigencia del módulo que sella los datos,');
  console.error('  o el re-sellado de enero deja el título anunciando el año anterior (semilla S0174).\n');
  for (const { donde, titulo, anio } of aMano) console.error(`    ${donde}  «${anio}» en: ${titulo}`);
  console.error('\n  Forma buena:  const anio = FISCAL_X_META.vigencia;  y  title: `… ${anio} …`');
  console.error('  Si el año NO es la vigencia del dato, «anio-ok: <razón>» en esa línea o en la anterior.');
}

if (escapeSinRazon.length) {
  falla = true;
  console.error(`\n✗ «anio-ok:» SIN RAZÓN ESCRITA: ${escapeSinRazon.length}\n`);
  for (const d of escapeSinRazon) console.error(`    ${d}`);
  console.error('\n  Una excepción sin motivo no se puede revisar después. Escribe la razón en la misma línea.');
}

if (falla) process.exit(1);
console.log(`✓ check:anio-titulo — ${vigiladas.length} apps fiscales sin año escrito a mano en el título (${conEscape.length} con «anio-ok:»)`);
