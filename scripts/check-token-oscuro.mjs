#!/usr/bin/env node
/**
 * Script: check-token-oscuro.mjs
 *
 * Candado del TOKEN SIN VARIANTE OSCURA. Se ejecuta antes de cada build (`npm run build`)
 * y a mano con `npm run check:token-oscuro`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Que un `.module.css` declare con un color LITERAL un token que `globals.css` define
 * distinto en claro y en oscuro (`--text-muted`, `--bg-card`, `--border`…) sin
 * redeclararlo en la variante oscura de ese mismo selector. En oscuro, ese selector sigue
 * sirviendo el valor del claro, y los componentes compartidos que viven dentro —el aviso
 * legal, el pie, RelatedApps— lo heredan con él.
 *
 * Cuenta como variante oscura, para el mismo selector:
 *   · `[data-theme='dark'] <selector>` (con comillas o sin ellas) y
 *     `:global([data-theme='dark']) <selector>`;
 *   · para `:root` / `html`, además `[data-theme='dark']` a secas y `:root[data-theme='dark']`;
 *   · una regla del mismo selector dentro de `@media (prefers-color-scheme: dark)`.
 * Una declaración que ya solo vale en claro (`[data-theme='light'] …`,
 * `:not([data-theme='dark'])`, `@media (prefers-color-scheme: light)`) no la necesita.
 * Un valor `var(--otro)` tampoco: se resuelve en cada tema.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del drenaje del tema claro del 22/09/2026 (commit dd66add0), que pasó `--text-muted` de
 * #999999 a #6E6E6E en el `.container` de 364 módulos. Cuatro de ellos
 * —`calculadora-z-score-altman`, `calculadora-amortizacion-inmovilizado`,
 * `calculadora-valoracion-empresa` y `simulador-financiacion-empresarial`— no lo
 * redeclaraban en su bloque `[data-theme='dark'] .container`: con #999999 el oscuro cumplía
 * por casualidad (~5:1) y con #6E6E6E cayó a 2,48–2,81:1 en TODO su texto secundario. Llegó
 * a producción y lo destapó la remedición del 23/09/2026, no ningún aviso.
 *
 * El Cuadre no podía verlo: compara conjuntos antes/después y el token no desapareció,
 * nunca había estado en el bloque oscuro — «nacer no es una sorpresa». Y el barrido de
 * contraste solo lo ve en las rutas que mide.
 *
 * Al medir el pasivo salió una segunda forma, peor: un `:root` DE MÓDULO con la paleta clara
 * copiada de globals (`selector-canal-venta`, `selector-financiacion-empresa`). `:root` es
 * global y le ganaba al bloque oscuro de globals, así que en oscuro el `<html>` entero servía
 * los tokens del claro: el aviso legal en una franja blanca y la pregunta del cuestionario en
 * #1A1A1A sobre la tarjeta oscura. El barrido de contraste lo dio por bueno, porque el muted
 * salía a 5,10… sobre el blanco que no debía estar ahí.
 *
 * SIN PASIVO
 * ──────────
 * Barre el árbol entero. Las seis apps se repararon el 23/09/2026 antes de crearlo, así que
 * solo puede encenderlo código nuevo.
 *
 * QUÉ NO MIRA, Y POR QUÉ
 * ──────────────────────
 *   · `--primary`, `--secondary`, `--success`, `--warning`, `--error`. También cambian de
 *     tema en globals, pero el 23/09/2026 había 472 módulos que redeclaran la marca en su
 *     `.container` sin variante oscura, y 24-113 los semánticos: son colores de identidad y
 *     de estado, no de texto ni de superficie, y cambiarlos altera el aspecto de 472 apps.
 *     Campaña aparte, como los 2.042 botones de `check:contraste-cabeceras`. Si se drena,
 *     se saca de `FUERA` y el candado pasa a exigirlo.
 *   · Si el valor oscuro que se declara CUMPLE contraste: eso lo miden los specs
 *     `tests/contraste-text-muted-*.spec.ts`. Este candado solo exige que exista. Un valor se
 *     decide midiendo contra el fondo REAL donde se usa: el #757575 de agosto se eligió contra
 *     blanco (4,60:1) y sobre el #FAFAFA en que vivía daba 4,41:1.
 *   · Los `style={{…}}` del JSX, que no declaran tokens en el catálogo.
 *
 * SE PLANTA SI NO PUEDE MIRAR
 * ───────────────────────────
 * La lista de tokens la saca de `app/globals.css` al arrancar, así que un token nuevo queda
 * cubierto sin tocar este fichero. Pero si el formato de globals cambia y el parser deja de
 * encontrar el bloque oscuro, la lista sale vacía y el candado daría verde sin mirar nada
 * (la trampa de `scripts/CLAUDE.md`). Por eso rompe si `--text-muted` no aparece entre los
 * tokens temáticos, o si no ha leído ningún `.module.css`.
 *
 * ESCAPE
 * ──────
 * `oscuro-ok: <razón>` en la línea de la declaración o en el comentario que la precede.
 * **La razón es obligatoria**: la marca a secas también rompe el build.
 *
 * Sus casos de prueba se le reinyectan con `npm run oscuro:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iRaiz = process.argv.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_DEFECTO;
const VERBOSO = process.argv.includes('--todo');

/** Cambian de tema pero son campaña aparte (ver «QUÉ NO MIRA»). */
const FUERA = new Set(['--primary', '--secondary', '--success', '--warning', '--error']);
const ARBOLES = ['app', 'components'];

const RE_OSCURO = /\[data-theme\s*=\s*['"]?dark['"]?\]/;
const RE_SOLO_CLARO = /\[data-theme\s*=\s*['"]?light['"]?\]|:not\(\s*\[data-theme\s*=\s*['"]?dark['"]?\]\s*\)/;
/** Un color escrito tal cual. `var(…)` no, porque se resuelve en cada tema. */
const RE_LITERAL = /^(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|hwb\(|lab\(|lch\(|oklab\(|oklch\(|color\(|[a-z]+$)/i;
const NO_COLOR = new Set(['inherit', 'initial', 'unset', 'revert', 'currentcolor', 'transparent', 'none']);

// ─── Parser: reglas con su pila de at-rules y su línea ─────────────────────────
/**
 * Recorre el CSS carácter a carácter llevando la pila de bloques, en vez de casar
 * `selector { … }` con una regex: una regla dentro de `@media (prefers-color-scheme: dark)`
 * es OSCURA aunque su selector no lo diga, y la regex perdía ese contexto.
 * Los comentarios se sustituyen por espacios del mismo largo para no mover las líneas.
 */
function reglas(css) {
  const limpio = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const salida = [];
  const pila = [];
  let inicio = 0;
  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];
    if (c === '{') {
      pila.push({ prelude: limpio.slice(inicio, i).trim(), desde: i + 1 });
      inicio = i + 1;
    } else if (c === '}') {
      const b = pila.pop();
      if (!b) { inicio = i + 1; continue; }
      const cuerpo = limpio.slice(b.desde, i);
      if (!b.prelude.startsWith('@') && !cuerpo.includes('{')) {
        salida.push({
          selector: b.prelude.replace(/\s+/g, ' '),
          contexto: pila.map((p) => p.prelude),
          cuerpo,
          desde: b.desde,
        });
      }
      inicio = i + 1;
    } else if (c === ';' && pila.length === 0) {
      inicio = i + 1;
    }
  }
  return salida;
}

const lineaDe = (txt, pos) => txt.slice(0, pos).split('\n').length;

// ─── Tokens temáticos, sacados de globals ──────────────────────────────────────
function tokensTematicos() {
  const ruta = path.join(RAIZ, 'app', 'globals.css');
  if (!fs.existsSync(ruta)) return { error: `no existe ${ruta}` };
  const claro = new Map();
  const oscuro = new Map();
  for (const r of reglas(fs.readFileSync(ruta, 'utf8'))) {
    if (r.contexto.length) continue;
    const destino = r.selector === ':root' ? claro : /^(:root)?\[data-theme=["']?dark["']?\]$/.test(r.selector) ? oscuro : null;
    if (!destino) continue;
    for (const [, k, v] of r.cuerpo.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) destino.set(k, v.trim().toLowerCase());
  }
  const tokens = [...oscuro.keys()].filter((k) => claro.has(k) && claro.get(k) !== oscuro.get(k) && !FUERA.has(k));
  return { tokens: new Set(tokens) };
}

// ─── Escape ────────────────────────────────────────────────────────────────────
function clasificarEscape(texto) {
  const m = texto.match(/oscuro-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

/** La línea de la declaración y el comentario que la precede, entero. */
function escapeEn(lineas, n) {
  const propia = clasificarEscape(lineas[n - 1] ?? '');
  if (propia) return propia;
  let i = n - 2;
  if (i < 0 || !/\*\/\s*$/.test(lineas[i])) return null;
  const trozo = [];
  for (; i >= 0; i--) {
    trozo.unshift(lineas[i]);
    if (lineas[i].includes('/*')) break;
  }
  return clasificarEscape(trozo.join('\n'));
}

function recorrer(dir, sufijo, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') recorrer(p, sufijo, out); }
    else if (e.name.endsWith(sufijo)) out.push(p);
  }
  return out;
}

// ─── Barrido ───────────────────────────────────────────────────────────────────
const errores = [];
const exentas = [];
const { tokens, error: errorGlobals } = tokensTematicos();
if (errorGlobals || !tokens.has('--text-muted')) {
  console.error('\n❌ Token sin variante oscura: no puedo leer los tokens temáticos de app/globals.css');
  console.error(`   ${errorGlobals ?? 'no aparece --text-muted entre los que cambian de tema: el parser ya no encuentra el bloque :root o el [data-theme="dark"]'}.`);
  console.error('   Sin esa lista el candado daría verde sin mirar nada.\n');
  process.exit(1);
}

let hojas = 0;
let declaraciones = 0;
for (const ruta of ARBOLES.flatMap((a) => recorrer(path.join(RAIZ, a), '.module.css'))) {
  hojas++;
  const txt = fs.readFileSync(ruta, 'utf8');
  const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
  const lineas = txt.split('\n');
  const todas = reglas(txt);

  /** selector base → tokens que declara su variante oscura */
  const cubiertos = new Map();
  const anotar = (base, k) => {
    const s = cubiertos.get(base) ?? new Set();
    s.add(k);
    cubiertos.set(base, s);
  };
  const claras = [];
  for (const r of todas) {
    const mediaOscura = r.contexto.some((p) => /prefers-color-scheme\s*:\s*dark/.test(p));
    const mediaClara = r.contexto.some((p) => /prefers-color-scheme\s*:\s*light/.test(p));
    const decl = [...r.cuerpo.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)]
      .filter(([, k]) => tokens.has(k))
      .map((m) => ({ k: m[1], v: m[2].trim(), pos: r.desde + m.index }));
    if (!decl.length) continue;
    for (const parte of r.selector.split(',').map((s) => s.trim())) {
      if (RE_OSCURO.test(parte) || mediaOscura) {
        let base = parte
          .replace(/:global\(\s*(\[data-theme\s*=\s*['"]?dark['"]?\])\s*\)/, '$1')
          .replace(RE_OSCURO, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (base === '' || base === ':root' || base === 'html') base = ':root';
        for (const d of decl) anotar(base, d.k);
      } else if (!RE_SOLO_CLARO.test(parte) && !mediaClara) {
        const base = parte === 'html' ? ':root' : parte;
        for (const d of decl) claras.push({ base, ...d });
      }
    }
  }

  for (const c of claras) {
    const v = c.v.toLowerCase();
    if (!RE_LITERAL.test(v) || NO_COLOR.has(v)) continue;
    declaraciones++;
    if (cubiertos.get(c.base)?.has(c.k)) continue;
    const n = lineaDe(txt, c.pos);
    const esc = escapeEn(lineas, n);
    if (esc === 'firmado') {
      exentas.push(`${rel}:${n}`);
      continue;
    }
    const porQue = esc === 'sin razón'
      ? ' — lleva `oscuro-ok:` SIN razón escrita, y una excepción sin motivo no se puede revisar'
      : '';
    const donde = c.base === ':root'
      ? `\`:root\` de módulo, que es GLOBAL: en oscuro pisa ${c.k} de globals en TODA la página. Quita el token (globals ya lo define en los dos temas) o pásalo a \`.container\` con su variante oscura`
      : `Añade \`${c.k}\` a \`[data-theme='dark'] ${c.base}\``;
    errores.push(`${rel}:${n} — \`${c.base} { ${c.k}: ${c.v} }\` sin variante oscura: en oscuro sirve el valor del claro. ${donde}.${porQue}`);
  }
}

if (hojas === 0) {
  console.error(`\n❌ Token sin variante oscura: no he leído ningún .module.css en ${ARBOLES.join('/, ')}/ de ${RAIZ}\n`);
  process.exit(1);
}

// ─── Resultado ─────────────────────────────────────────────────────────────────
if (errores.length) {
  const muestra = VERBOSO ? errores : errores.slice(0, 12);
  console.error(`\n❌ Token sin variante oscura: ${errores.length} problema(s)\n`);
  for (const e of muestra) console.error(`   · ${e}`);
  if (!VERBOSO && errores.length > 12) console.error(`\n   … y ${errores.length - 12} más (--todo para verlos).`);
  console.error('');
  process.exit(1);
}

console.log('✅ Token sin variante oscura: correcto');
console.log(`   · ${hojas} hojas .module.css de app/ y components/, sin pasivo`);
console.log(`   · ${declaraciones} declaraciones con color literal de ${tokens.size} tokens que cambian de tema, todas con su variante oscura`);
if (exentas.length) console.log(`   · ${exentas.length} exenta(s) con \`oscuro-ok\`: ${exentas.slice(0, 5).join(', ')}`);
