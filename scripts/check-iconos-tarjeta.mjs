#!/usr/bin/env node
/**
 * Script: check-iconos-tarjeta.mjs
 *
 * Candado de los ICONOS DE TARJETA QUE EL LECTOR LEE JUNTO A SU TEXTO. Se ejecuta antes de cada
 * build (`npm run build`) y a mano con `npm run check:iconos-tarjeta`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Un `span`/`div` cuya clase es el icono de una tarjeta o de un aviso (lista CERRADA en
 * `CLASES_ICONO`) sin `aria-hidden="true"`. El icono va en su propio nodo, junto al título de la
 * tarjeta, y el lector de pantalla lo anuncia pegado a él: «📚Estudiante de Bachillerato»,
 * «libros, Estudiante de…». Es decoración: el título ya dice lo que la tarjeta es.
 *
 * Es la subclase con respuesta clara del aviso «emoji en nodo propio» de `check:a11y-jsx`, que
 * solo avisa porque en general pide criterio (1.485 casos de juicio puro: a veces el emoji ES el
 * dato). Con estas clases no lo es: se llaman «icono» y van al lado de un título.
 *
 * DE DÓNDE SALE
 * ─────────────
 * 1. Tema C del turno de noche de accesibilidad (cabo C0088, montado el 07/11/2026): cinco clases
 *    con prefijo, `eduEscenarioIcon`, `eduTipIcon`, `eduTipIcono`, `warningIcon` y `warningIcono`;
 *    153 nodos en 71 ficheros que el turno fue drenando en las apps no inspeccionadas, y C0661
 *    (9b86f89d) en las cuatro inspeccionadas.
 * 2. Cabo C0723 (hallazgo 4556, calculadora-notas, 12/11/2026): C0661 contó 1 nodo en esa app y
 *    había 11. Los otros 10 llevaban las mismas clases SIN el prefijo `edu` (`escenarioIcon`,
 *    `tipIcono`), que el detector del turno no veía: 618 nodos en 76 ficheros. La campaña del
 *    13/11/2026 los ocultó todos y dejó este candado, que vigila las ocho a la vez.
 *
 * El detector del tema C de `Vigilancia/ActasNocturnas/turno-a11y.mjs` IMPORTA este fichero
 * (`iconosSinOcultar`, `CLASES_ICONO`): la lista de clases vive aquí y solo aquí. Una copia en el
 * turno fue exactamente lo que dejó fuera las tres clases sin prefijo.
 *
 * SIN PASIVO
 * ──────────
 * Barre todos los `.tsx`/`.jsx` de `app/` y `components/`. Tras la campaña no queda ningún nodo:
 * solo puede encenderlo código nuevo, que nace copiando la tarjeta de su app hermana. `--todo` se
 * admite y hace lo mismo, por simetría con los demás.
 *
 * QUÉ NO MIRA, Y POR QUÉ
 * ──────────────────────
 *   · Una clase parecida (`warningIconWrap`, `tipIconBox`): la lista es cerrada a propósito; una
 *     clase nueva se añade a `CLASES_ICONO` con su caso.
 *   · El icono que ES el dato (`EXCLUIDOS`): se reconoce por fichero y contenido, no por línea.
 *   · Un nodo ya oculto por dentro (`<span className={styles.warningIcon}><span aria-hidden="true">⚠️</span></span>`).
 *   · Si el icono es un emoji: un texto con letras dentro de la clase también cuenta, y entonces
 *     la salida no es `aria-hidden` sino sacar el texto del icono o escapar con razón.
 *
 * ESCAPE
 * ──────
 * `iconos-tarjeta-ok: <razón>` en la línea o en las tres anteriores. **La razón es obligatoria**:
 * la marca a secas también rompe el build.
 *
 * Sus casos de prueba se le reinyectan con `npm run iconos-tarjeta:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Las clases de icono de tarjeta. Lista CERRADA: una nueva entra con su caso de origen. */
export const CLASES_ICONO = [
  // Tema C del turno (C0088, 07/11/2026)
  'eduEscenarioIcon', 'eduTipIcon', 'eduTipIcono', 'warningIcon', 'warningIcono',
  // Las mismas sin el prefijo `edu` (C0723, 13/11/2026)
  'escenarioIcon', 'tipIcon', 'tipIcono',
];

// Exportadas: la comparación mecánica del turno (`normalizarParIconos`) las usa tal cual
export const RE_CLASE = new RegExp(`\\bstyles(?:\\.(?:${CLASES_ICONO.join('|')})\\b|\\[['"](?:${CLASES_ICONO.join('|')})['"]\\])`);
// Una etiqueta de apertura con sus atributos, que pueden llevar llaves (y un «>» dentro de ellas)
export const RE_APERTURA = /<([a-zA-Z][\w.]*)((?:[^<>{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)>/g;
export const RE_ARIA_HIDDEN = /(^|\s)aria-hidden(?:="true"|=\{true\})?(?=[\s/]|$)/;

/**
 * Cambia los comentarios por espacios del MISMO largo: no mueve ni líneas ni índices, así que una
 * posición del texto limpio vale en el original. El repositorio cita JSX en sus comentarios
 * (scripts/CLAUDE.md, «Un regex sobre código fuente cruza comentarios»).
 */
const sinComentarios = (txt) => txt
  .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:'"`\\])(\/\/.*)$/gm, (_, a, c) => a + ' '.repeat(c.length));

/** Los nodos en que el icono es el dato. Por fichero y contenido: la línea se mueve. */
export const EXCLUIDOS = [
  { rel: 'app/generador-hashes/page.tsx', clases: ['warningIcon'], contenido: ['🚫', '✅'], motivo: 'el icono es el dato: separa los errores (🚫) del uso correcto (✅)' },
  { rel: 'app/simulador-reemplazo-paginas/page.tsx', clases: ['warningIcon'], contenido: ['⚠'], motivo: 'fuera de la lista por decisión del 27/10/2026 (README del turno, tema C)' },
];

/**
 * Los nodos de icono de tarjeta sin aria-hidden de un texto: [{ linea, contenido, columna }].
 * `estropear` ('sin-aria' | 'sin-exclusiones') solo lo usan las pruebas, para comprobar que sus
 * casos fallan con el detector roto.
 */
export function iconosSinOcultar(textoOriginal, rel = '', estropear = null) {
  if (!CLASES_ICONO.some((c) => textoOriginal.includes(c))) return [];
  const texto = sinComentarios(textoOriginal);
  const excl = estropear === 'sin-exclusiones' ? null : EXCLUIDOS.find((x) => x.rel === rel);
  const casos = [];
  for (const m of texto.matchAll(RE_APERTURA)) {
    const atribs = m[2];
    if (!RE_CLASE.test(atribs)) continue;
    if (estropear !== 'sin-aria' && RE_ARIA_HIDDEN.test(atribs)) continue;
    const fin = m.index + m[0].length;
    const contenido = (texto.slice(fin).match(/^[^<]*/) || [''])[0].trim();
    // Ya oculto por dentro: el emoji en su propio span aria-hidden (calculadora-suscripciones)
    if (estropear !== 'sin-aria' && !contenido && /^\s*<span\s+aria-hidden="true">[^<]*<\/span>\s*<\//.test(texto.slice(fin))) continue;
    const clase = (atribs.match(/styles(?:\.(\w+)|\[['"](\w+)['"]\])/) || []).slice(1).find(Boolean);
    if (excl && excl.clases.includes(clase) && excl.contenido.includes(contenido)) continue;
    casos.push({ linea: texto.slice(0, m.index).split('\n').length, contenido, indice: m.index, apertura: m[0] });
  }
  return casos;
}

/** Los .tsx/.jsx de `app/` y `components/` bajo `raiz`, con barras normales. */
export function fuentesJsx(raiz) {
  const rels = [];
  for (const dir of ['app', 'components']) {
    const abs = path.join(raiz, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs, { recursive: true })) {
      if (/\.(tsx|jsx)$/.test(f) && !/(^|[\\/])node_modules[\\/]/.test(f)) rels.push(`${dir}/${String(f).replace(/\\/g, '/')}`);
    }
  }
  return rels;
}

function escapeEn(lineas, n) {
  const trozo = lineas.slice(Math.max(0, n - 4), n).join('\n');
  const m = trozo.match(/iconos-tarjeta-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

/** Barre `raiz`: { errores, exentos, ficheros }. */
export function barrer(raiz) {
  const errores = [];
  const exentos = [];
  const rels = fuentesJsx(raiz);
  for (const rel of rels) {
    const txt = fs.readFileSync(path.join(raiz, rel), 'utf8');
    const casos = iconosSinOcultar(txt, rel);
    if (!casos.length) continue;
    const lineas = txt.split('\n');
    for (const c of casos) {
      const escape = escapeEn(lineas, c.linea);
      if (escape === 'firmado') { exentos.push(`${rel}:${c.linea}`); continue; }
      errores.push({ rel, linea: c.linea, contenido: c.contenido, sinRazon: escape === 'sin razón' });
    }
  }
  return { errores, exentos, ficheros: rels.length };
}

const esPrincipal = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (esPrincipal) {
  const RAIZ_DEFECTO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const iRaiz = process.argv.indexOf('--raiz');
  const RAIZ = iRaiz !== -1 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_DEFECTO;
  const { errores, exentos, ficheros } = barrer(RAIZ);

  if (ficheros === 0) {
    console.error(`\n❌ Iconos de tarjeta: no he encontrado ningún .tsx en app/ ni components/ de ${RAIZ}\n`);
    process.exit(1);
  }
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(errores, null, 1));
    process.exit(errores.length ? 1 : 0);
  }
  if (errores.length) {
    const nFich = new Set(errores.map((e) => e.rel)).size;
    console.error(`\n❌ Iconos de tarjeta sin aria-hidden: ${errores.length} nodo(s) en ${nFich} fichero(s)\n`);
    for (const e of errores.slice(0, 60)) {
      const porQue = e.sinRazon ? ' — lleva `iconos-tarjeta-ok:` SIN razón escrita' : '';
      console.error(`   · ${e.rel}:${e.linea} «${e.contenido}» — el lector lo lee pegado al título de la tarjeta. Añade aria-hidden="true" en la misma etiqueta.${porQue}`);
    }
    if (errores.length > 60) console.error(`   … y ${errores.length - 60} más`);
    console.error('');
    process.exit(1);
  }
  console.log('✅ Iconos de tarjeta: correcto');
  console.log(`   · ${ficheros} ficheros de app/ y components/, ${CLASES_ICONO.length} clases, sin pasivo`);
  if (exentos.length) console.log(`   · ${exentos.length} exento(s) con \`iconos-tarjeta-ok\`: ${exentos.slice(0, 5).join(', ')}`);
}
