#!/usr/bin/env node
/**
 * check-faq-unica.mjs — que una FAQ que se toca quede escrita UNA sola vez
 *
 * Ejecutar:  npm run check:faq-unica                    (lo ejecuta también `npm run build`)
 *            npm run check:faq-unica -- --desde <ref>   (lo añadido desde <ref>: commits incluidos)
 *            npm run check:faq-unica -- --todo          (catálogo entero: informa, NO rompe)
 *            node scripts/check-faq-unica.mjs app/x/page.tsx    (apps sueltas)
 *            … --raiz <dir>                             (otro repositorio: lo usan las pruebas)
 *
 * QUÉ BUSCA
 * ─────────
 * Una app con la MISMA pregunta en sus dos FAQ —el `faqJsonLd` de `metadata.ts` (o `layout.tsx`),
 * que leen los buscadores y los asistentes de IA, y la FAQ VISIBLE de `page.tsx`— y la respuesta
 * escrita dos veces, cuyas líneas de FAQ toca el commit. Rompe si, tocada, sigue así. La receta es
 * la de §1.ter del CLAUDE.md y la plantilla: un array `PREGUNTAS_FRECUENTES` en `metadata.ts`, del
 * que salen el `faqJsonLd` y la FAQ visible (`templates/app-base/`); o, si la app quiere dos FAQ
 * distintas, que la pregunta repetida salga de una constante compartida (garaje) o de una sola.
 * Dos FAQ con preguntas DISTINTAS no se tocan: medido el 01/11/2026, es lo normal (solo 5 de 534
 * apps con las dos FAQ las tenían con las mismas preguntas) y no es un defecto.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Auditoría de los procesos de revisión (01/11/2026), punto 2: 778 de los 3.907 hallazgos del
 * Inspector (20 %) hablaban de la FAQ, 490 de ellos en RE-inspecciones, y 172 de las 179 apps
 * inspeccionadas seguían con la FAQ escrita dos veces: cada reparación corregía las dos copias a
 * mano y la divergencia volvía. El caso que lo retrata es el de simulador-gastos-compraventa-
 * garaje: la reparación del hallazgo 578 corrigió el tipo de ITP en el JSON-LD y dejó la
 * redacción vieja en la FAQ visible (hallazgo 624, 07/09/2026); la del 670 añadió una frase a la
 * visible que no llegó al FAQPage (hallazgo 1200). §1.ter ya decía «nunca escribirla dos veces»,
 * pero solo para las apps nuevas, y nada lo comprobaba.
 *
 * QUÉ NO HACE, Y POR QUÉ
 * ──────────────────────
 * NO obliga a unificar el pasivo de golpe: juntar dos FAQ que ya divergen es decidir cuál de las
 * dos respuestas es la buena, y eso es criterio. Como `check:features` y `check:parser`, juzga lo
 * que el commit AÑADE: una app nueva, o una FAQ cuyas líneas toca. Tocar el title no obliga.
 * `--desde <ref>` existe porque esos candados miran `git diff HEAD` y los commits de la tarea de
 * /reparar, que no construye, nunca pasaban por ellos: la tarea lo pasa sobre su rama.
 *
 * Qué cuenta como «tocar la FAQ»: una línea añadida dentro del objeto `faqJsonLd` o del array
 * `PREGUNTAS_FRECUENTES`, o dentro de la sección visible de la FAQ de `page.tsx` (desde el
 * encabezado «Preguntas frecuentes» o «FAQ» hasta el siguiente `</section>` o `<h2`). Una app sin
 * FAQ visible no tiene nada duplicado y no se juzga.
 *
 * Escape: «faq-ok: <razón>» en `metadata.ts`, `layout.tsx` o `page.tsx` de la app (p. ej. una
 * app que comparte cada respuesta con constantes propias, como garaje). La razón es obligatoria.
 * Pruebas: npm run faq-unica:probar-candado (reinyecta la reparación a medias del hallazgo 624).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const valor = (n) => { const i = argv.indexOf(`--${n}`); return i !== -1 ? argv[i + 1] : null; };
const RAIZ = valor('raiz') ? path.resolve(valor('raiz')) : RAIZ_DEFECTO;
const DESDE = valor('desde');
const TODO = argv.includes('--todo');
const SUELTOS = argv.filter((a, i) => !a.startsWith('--') && !['--raiz', '--desde'].includes(argv[i - 1]));
const ESCAPE = /faq-ok:[ \t]*\S[^\n]{2,}/;
const MARCA = /faq-ok:/;
const CABECERA_HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

const git = (a) => execFileSync('git', ['-C', RAIZ, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
const leer = (rel) => { try { return fs.readFileSync(path.join(RAIZ, rel), 'utf8'); } catch { return null; } };

/** Rango de líneas (1-based) del objeto o array que abre en la línea de `patron`. */
function rangoDeclaracion(texto, patron) {
  const lineas = texto.split('\n');
  const ini = lineas.findIndex((l) => patron.test(l));
  if (ini === -1) return null;
  let prof = 0, empezado = false;
  for (let i = ini; i < lineas.length; i++) {
    for (const c of lineas[i].replace(/\/\/.*$/, '')) {
      if (c === '{' || c === '[') { prof++; empezado = true; }
      else if (c === '}' || c === ']') prof--;
    }
    if (empezado && prof <= 0) return [ini + 1, i + 1];
  }
  return [ini + 1, lineas.length];
}

/** Rango de la FAQ visible en un page.tsx, o null si no la tiene. */
function rangoFaqVisible(texto) {
  const lineas = texto.split('\n');
  const ini = lineas.findIndex((l) => /<h[23][^>]*>.*(Preguntas frecuentes|\bFAQ\b)/i.test(l) && !/^\s*(\/\/|\*|\{\/\*)/.test(l));
  if (ini === -1) return null;
  for (let i = ini + 1; i < Math.min(lineas.length, ini + 400); i++) {
    if (/<\/section>|<h2[\s>]/.test(lineas[i])) return [ini + 1, i + 1];
  }
  return [ini + 1, Math.min(lineas.length, ini + 400)];
}

/** Dónde vive el faqJsonLd de la app: metadata.ts o layout.tsx. */
function ficheroJsonLd(slug) {
  for (const f of ['metadata.ts', 'layout.tsx']) {
    const rel = `app/${slug}/${f}`;
    const t = leer(rel);
    if (t && /export const faqJsonLd\b/.test(t)) return { rel, texto: t };
  }
  return null;
}

/** El texto que se lee, para comparar una pregunta del JSON-LD con la FAQ visible. */
const normal = (t) => t.replace(/<[^>]*>/g, ' ').replace(/[{}]/g, ' ').replace(/\\(['"`])/g, '$1')
  .replace(/ |&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Las preguntas ESCRITAS DOS VECES: las del `faqJsonLd` que también están, con el mismo texto, en
 * la FAQ visible, y cuya respuesta del JSON-LD es un literal (no una constante compartida, como
 * `RESPUESTA_ITP_GARAJE_SEGUNDA_MANO` en garaje). Medido el 01/11/2026, la mayoría de las apps
 * tienen dos FAQ DISTINTAS —otras preguntas en cada sitio—, y eso no es un defecto (lo dice la
 * skill del Inspector, 2.bis); el defecto es la misma pregunta con su respuesta escrita dos veces.
 */
function preguntasDobles(slug) {
  const jl = ficheroJsonLd(slug);
  const page = leer(`app/${slug}/page.tsx`) ?? '';
  const rVis = rangoFaqVisible(page);
  if (!jl || !rVis) return [];
  const rFaq = rangoDeclaracion(jl.texto, /export const faqJsonLd\b/);
  const bloque = jl.texto.split('\n').slice(rFaq[0] - 1, rFaq[1]).join('\n');
  const visible = normal(page.split('\n').slice(rVis[0], rVis[1]).join(' '));
  const dobles = [];
  for (const m of bloque.matchAll(/name:\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1[\s\S]{0,300}?text:\s*(\S)/g)) {
    const pregunta = normal(m[2]);
    const literal = /['"`]/.test(m[3]);
    if (pregunta.length > 12 && literal && visible.includes(pregunta)) dobles.push(m[2].trim());
  }
  return dobles;
}

/** ¿Está la FAQ de la app en una sola fuente? (o no repite ninguna pregunta) */
function unificada(slug) {
  const jl = ficheroJsonLd(slug);
  const page = leer(`app/${slug}/page.tsx`) ?? '';
  if (!jl) return true;   // sin FAQPage no hay duplicado
  const rFaq = rangoDeclaracion(jl.texto, /export const faqJsonLd\b/);
  const bloque = jl.texto.split('\n').slice(rFaq[0] - 1, rFaq[1]).join('\n');
  if (/export const PREGUNTAS_FRECUENTES\b/.test(jl.texto) && /PREGUNTAS_FRECUENTES/.test(bloque) && /\bPREGUNTAS_FRECUENTES\b/.test(page)) return true;
  return preguntasDobles(slug).length === 0;
}

const tieneEscape = (slug) => ['metadata.ts', 'layout.tsx', 'page.tsx'].some((f) => ESCAPE.test(leer(`app/${slug}/${f}`) ?? ''));
const tieneMarcaSinRazon = (slug) => ['metadata.ts', 'layout.tsx', 'page.tsx']
  .some((f) => { const t = leer(`app/${slug}/${f}`) ?? ''; return MARCA.test(t) && !ESCAPE.test(t); });

/**
 * Los trozos del diff de un fichero: líneas añadidas (número en el fichero nuevo) y el texto
 * quitado y añadido de cada trozo; o 'nuevo' si el fichero se crea entero.
 */
function trozos(rel) {
  const base = DESDE ?? 'HEAD';
  let diff;
  try { diff = git(['diff', '--unified=0', '--no-color', base, '--', rel]).split('\n'); } catch { return []; }
  if (diff.some((l) => l.startsWith('new file mode'))) return 'nuevo';
  // Un fichero sin añadir a git no sale en el diff: es nuevo entero
  try { git(['ls-files', '--error-unmatch', '--', rel]); } catch { return 'nuevo'; }
  const lista = [];
  let actual = null;
  for (const l of diff) {
    const m = l.match(CABECERA_HUNK);
    if (m) {
      const ini = Number(m[1]); const n = m[2] === undefined ? 1 : Number(m[2]);
      actual = { lineas: Array.from({ length: n }, (_, i) => ini + i), quitado: [], anadido: [] };
      lista.push(actual);
    } else if (actual && l.startsWith('-') && !l.startsWith('---')) actual.quitado.push(l.slice(1));
    else if (actual && l.startsWith('+') && !l.startsWith('+++')) actual.anadido.push(l.slice(1));
  }
  return lista;
}

/**
 * El texto que se LEE de unas líneas de JSX: sin etiquetas ni atributos. Un arreglo de
 * accesibilidad (envolver un emoji en su span, un aria-label) no cambia la FAQ y no la toca.
 */
const textoLeido = (lineas) => lineas.join(' ').replace(/<[^>]*>/g, ' ').replace(/[{}]/g, ' ').replace(/\s+/g, ' ').trim();

const dentro = (n, r) => r && n >= r[0] && n <= r[1];

/** ¿Toca este cambio la FAQ de la app? */
function tocaFaq(slug, ficheros) {
  for (const rel of ficheros) {
    const lista = trozos(rel);
    const texto = leer(rel);
    if (!texto) continue;
    if (lista === 'nuevo') return `${rel} es nuevo`;
    if (rel.endsWith('page.tsx')) {
      const r = rangoFaqVisible(texto);
      // Dentro de la sección, sin su encabezado, y solo si cambia el texto que se lee
      const cuerpo = r && [r[0] + 1, r[1]];
      if (lista.some((t) => t.lineas.some((n) => dentro(n, cuerpo)) && textoLeido(t.quitado) !== textoLeido(t.anadido))) return `${rel}: la FAQ visible`;
    } else {
      const r1 = rangoDeclaracion(texto, /export const faqJsonLd\b/);
      const r2 = rangoDeclaracion(texto, /export const PREGUNTAS_FRECUENTES\b/);
      if (lista.some((t) => t.lineas.some((n) => dentro(n, r1) || dentro(n, r2)))) return `${rel}: el faqJsonLd`;
    }
  }
  return null;
}

function slugsCambiados() {
  if (SUELTOS.length) return [...new Set(SUELTOS.map((f) => f.replace(/\\/g, '/').match(/app\/([^/]+)\//)?.[1]).filter(Boolean))];
  const base = DESDE ?? 'HEAD';
  let nombres = [];
  try { nombres = git(['diff', '--name-only', '--diff-filter=ACM', base]).split('\n'); } catch { /* sin git */ }
  try { nombres.push(...git(['ls-files', '--others', '--exclude-standard', 'app']).split('\n')); } catch { /* idem */ }
  return [...new Set(nombres.map((f) => f.match(/^app\/([^/]+)\/(metadata\.ts|layout\.tsx|page\.tsx)$/)?.[1]).filter(Boolean))];
}

// ── --todo: el pasivo ─────────────────────────────────────────────────────────
if (TODO) {
  const apps = fs.readdirSync(path.join(RAIZ, 'app'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  let conAmbas = 0;
  const duplicadas = [];
  for (const s of apps) {
    const page = leer(`app/${s}/page.tsx`);
    if (!page || !ficheroJsonLd(s) || !rangoFaqVisible(page)) continue;
    conAmbas++;
    if (!unificada(s) && !tieneEscape(s)) duplicadas.push(`${s} (${preguntasDobles(s).length})`);
  }
  console.log(`📋 FAQ única — pasivo: ${duplicadas.length} de ${conAmbas} apps con FAQ visible y FAQPage repiten alguna pregunta con la respuesta escrita dos veces`);
  if (argv.includes('--lista')) console.log(`   ${duplicadas.join(', ')}`);
  console.log('   (modo --todo: informa, no rompe; se unifican cuando una sesión toca su FAQ; --lista las nombra)');
  process.exit(0);
}

// En Vercel no se ejecuta: el clon es shallow y `git diff HEAD` no significa lo mismo
if (process.env.VERCEL && !SUELTOS.length) { console.log('📋 FAQ única: en Vercel no se ejecuta (clon shallow)'); process.exit(0); }

const errores = [];
let juzgadas = 0;
for (const slug of slugsCambiados()) {
  const page = leer(`app/${slug}/page.tsx`);
  if (!page || !ficheroJsonLd(slug) || !rangoFaqVisible(page)) continue;
  const ficheros = [`app/${slug}/metadata.ts`, `app/${slug}/layout.tsx`, `app/${slug}/page.tsx`].filter((f) => leer(f) !== null);
  const motivo = SUELTOS.length ? 'revisión de fichero suelto' : tocaFaq(slug, ficheros);
  if (!motivo) continue;
  juzgadas++;
  if (tieneMarcaSinRazon(slug)) { errores.push(`app/${slug}: «faq-ok:» sin razón (la razón es obligatoria)`); continue; }
  if (tieneEscape(slug) || unificada(slug)) continue;
  const dobles = preguntasDobles(slug);
  errores.push(`app/${slug}: se toca su FAQ (${motivo}) y ${dobles.length} pregunta(s) siguen con la respuesta escrita dos veces: «${dobles[0].slice(0, 70)}»${dobles.length > 1 ? '…' : ''}`);
}

if (errores.length) {
  console.error(`\n✖ FAQ única — ${errores.length} app(s):`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('\n   Receta: un array PREGUNTAS_FRECUENTES ({ question, answer }) exportado en metadata.ts, del que');
  console.error('   salen el faqJsonLd (mainEntity: PREGUNTAS_FRECUENTES.map(…)) y la FAQ visible de page.tsx');
  console.error('   (PREGUNTAS_FRECUENTES.map(…)), modelo templates/app-base/; o la pregunta repetida, de una');
  console.error('   constante que importen las dos, o en un solo sitio. Si hay una razón, «faq-ok: <razón>».\n');
  process.exit(1);
}
console.log(`✅ FAQ única: ${juzgadas ? `${juzgadas} app(s) con la FAQ tocada, ninguna con una respuesta escrita dos veces` : 'ninguna FAQ tocada'}${DESDE ? ` (desde ${DESDE})` : ''}`);
