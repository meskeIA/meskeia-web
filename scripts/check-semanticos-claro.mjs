#!/usr/bin/env node
/**
 * check-semanticos-claro.mjs — que ningún texto rojo, naranja, ámbar o verde escrito en un
 * `.module.css` se quede por debajo de su umbral de contraste en el tema CLARO (cabo C0296).
 *
 * Ejecutar:  npm run check:semanticos-claro          (lo ejecuta también `npm run build`)
 *            npm run check:semanticos-claro -- --todo   lista también lo que no juzga
 *            node scripts/check-semanticos-claro.mjs app/x/X.module.css   (hojas sueltas)
 *
 * QUÉ BUSCA
 * ─────────
 * Un `color:` (o `-webkit-text-fill-color:`) del tema claro cuyo valor es un color de familia
 * semántica —rojo, naranja, ámbar o verde, por su tono— escrito como literal, como token propio
 * del módulo (`--danger: #ef4444` y luego `var(--danger)`) o como token global sin variante de
 * texto (`var(--error)` es #F44336: 3,68:1 sobre blanco). Lo mide contra el fondo que sabe:
 * el de la misma regla si lo declara (un `rgba()` compuesto sobre blanco, un `color-mix()`
 * compuesto con su base) y, si no, contra el
 * BLANCO, que es la cota alta (sobre #FAFAFA o un tinte el contraste real es menor). Desde el
 * cabo C0592 (03/11/2026), si la regla no pone fondo y una clase ANTECESORA de su selector sí
 * (`.aviso strong` con `.aviso { background: rgba(…) }`), contra ese: un tinte translúcido se
 * compone sobre la página, #FAFAFA. Al nacer encendió 24 reglas en 20 hojas, migradas a la
 * receta en el mismo commit. Desde el cabo C0608 (04/11/2026), si ni la regla ni su selector
 * ponen fondo, contra el de la antecesora más cercana EN EL DOM, que lee del JSX de los `.tsx`
 * que importan la hoja (`.warningList li strong` dentro de un `.warningBox` que pinta el TSX,
 * hallazgos 3940 y 3992): encendió 38 reglas en 26 hojas, migradas en el mismo commit. Umbral
 * 4,5:1, o 3:1 si la misma regla declara texto grande (≥ 24 px, o ≥ 18,66 px en negrita) o es
 * un `::before`/`::after`/`::marker` (iconos y viñetas: no-texto, WCAG 1.4.11).
 *
 * La receta es un token de TEXTO por familia, como `--primary-texto` de C0070: `--rojo-texto`,
 * `--naranja-texto`, `--ambar-texto` y `--verde-texto`, escrito con el color de antes como
 * reserva: `color: var(--rojo-texto, #ef4444)`. Rompe también con un token de éstos SIN reserva
 * (se escribió cuando el oscuro la necesitaba, abajo; se mantiene porque deja escrito el color
 * que se sustituyó). `familia()` y `analizarHoja()` se exportan: los usó la campaña.
 *
 * LA PASADA OSCURA (cabo C0681, 15/11/2026)
 * ─────────────────────────────────────────
 * Hasta el 15/11/2026 globals ponía los cuatro tokens a `initial` en oscuro y mandaba la
 * reserva: el color de antes de cada módulo, que en oscuro nadie había medido (455 usos bajo
 * 4,5:1 en el censo scripts/contraste-semanticos/censo-reserva-oscuro.mjs). Se eligió `initial`
 * porque un tono claro encima de un tinte claro que no cambia en oscuro da 1,3:1. Medido por
 * píxel (scripts/contraste-semanticos/medir-reserva-oscuro.mjs, 531 rutas): de 841 textos que
 * pinta la receta en oscuro, 398 pasan a cumplir con un valor oscuro y ninguno deja de hacerlo.
 * Ahora valen FAMILIAS[x].oscuro, y `analizarOscuro()` rompe con la receta sobre un fondo que
 * SIGUE CLARO en oscuro: el de la regla, el de otra clase del mismo elemento, el de una clase
 * antecesora del selector o el de la antecesora en el DOM, sin variante oscura y sin que la
 * regla redeclare `color` en oscuro. Lo translúcido se compone sobre la tarjeta oscura y lo de
 * `@media print` no cuenta. Al nacer encendió 18 reglas en 13 hojas, en el mismo commit: 12 con
 * color fijo sobre su fondo fijo (insignias, hovers), las 3 de analizador-densidad-seo con la
 * barra separada de la cifra (ponían la cifra del tono de su propio fondo), las 2 de
 * generador-actas con una regla para el papel blanco del acta y escape en la general, y 1 falso
 * positivo con escape (visualizador-gps: «Tú» es hija del punto rojo, pero va debajo de él).
 *
 * EL LITERAL SIN VARIANTE OSCURA (cabo C0708, 15/11/2026)
 * ───────────────────────────────────────────────────────
 * Un rojo, naranja, ámbar o verde LITERAL (`color: #dc2626`) que pasa en claro no lo tocó la
 * campaña de C0296, y se pinta igual en oscuro. `analizarOscuro(css, { literales: true })` lo
 * mide contra su fondo en oscuro (las mismas fuentes que la pasada de arriba) o, sin fondo,
 * contra la tarjeta #2D2D2D, y rompe si su selector no redeclara `color` en oscuro y no llega al
 * umbral. Caso de origen: el hallazgo 4425 del Inspector (conjugador-verbos, 11/11/2026), el
 * aviso de error en #dc2626 a 2,97:1. Al nacer encendió 103 usos en 75 hojas: 102 pasaron a la
 * receta en la campaña de C0708 (comprobadas con las tres pasadas por hoja) y 1 lleva escape
 * (InfoBox, cuyo fondo lo elige el TSX con `styles[\`${type}Box\`]`). El censo del cabo daba 226
 * contra los fondos planos; la diferencia es lo que este cálculo sí ve: fondos claros fijos,
 * iconos a 3:1, texto grande, @media print, congeladas y portales.
 * ⚠️ Mismo límite que la pasada de arriba: un fondo claro que pone otro componente o una clase
 * dinámica no se ve, y la receta lo empeoraría. Si sospechas, mídelo por píxel con
 * scripts/contraste-semanticos/medir-reserva-oscuro.mjs (la reserva es el literal de antes).
 *
 * QUÉ NO JUZGA, Y POR QUÉ
 * ───────────────────────
 *   · El texto cuyo fondo es OSCURO: el de la propia regla o el de una clase antecesora del
 *     selector que el módulo pinta oscura (`.footer a` con `.footer { background: #1a1a2e }`,
 *     los bloques de código, los héroes). Ahí oscurecer el texto lo empeora. Era el ruido
 *     conocido del censo del 19/10.
 *   · Un fondo que no sabe leer (degradado claro, `var()` que no resuelve, imagen).
 *   · El fondo de un antecesor que el JSX del mismo fichero no deja ver: un hijo pintado por
 *     OTRO componente (otro fichero), un `className` que no es `styles.x` ni `styles['x']`, o
 *     un fondo de la antecesora que no está en su regla base (`.x` a secas). Lo mide el píxel.
 *     Incluye la clase que el TSX elige con plantilla (`styles[\`${type}Box\`]`,
 *     `styles[etiqueta.clase]`): así se escapó InfoBox a C0681 y a C0708 (successTitle a 1,37:1).
 *     Límite ACEPTADO (cabo C0774, 17/11/2026): en la campaña de C0708 eran 7 de 103 sitios
 *     (test-salud-negocio-freelance, visualizador-cambio-climatico-tipping-points,
 *     guia-tejidos-fibras, orientador-medicamentos-mascotas, comparador-formas-juridicas, InfoBox),
 *     revisados a mano, y solo InfoBox empeoraba. Resolver la plantilla contra las clases del módulo
 *     que encajan (`Box` → successBox, medicalBox…) obliga a elegir contra cuál medir cuando
 *     encajan varias, y en un candado sin pasivo cada lectura nueva rompe el build en el acto.
 *   · `var(--x, #lit)` con `--x` sin declarar en la hoja: lo pone el TSX en su `style`.
 *   · Los `style={{ color }}` de los `.tsx`, el `fill` de un SVG y el texto de un `<canvas>`.
 *   · Las apps congeladas (los cursos, 16/10/2026: publicados, sin drenar su pasivo).
 *   · Los portales con paleta propia (home y páginas de Coquinum, Cronicum, Delegum y Stemum,
 *     y sus pies): su oro y su terracota son marca, no semánticos, y van sobre héroes y pies
 *     oscuros que pone el TSX. La marca la vigila check:contraste-marca.
 *   · Lo que va con `opacity` en un antecesor: el contraste real lo mide el píxel.
 * Que el sustituto cumpla en su fondo REAL lo mide por píxel tests/contraste-semanticos-claro.spec.ts.
 *
 * DE DÓNDE SALE
 * ─────────────
 * C0296 (18/10/2026), visto al reparar C0226 (los semánticos en OSCURO, check:token-oscuro):
 * en claro tampoco cumplían adaptacion-hogar (#E74C3C sobre #fdf2f2, 3,6:1) y mi-ip (el 3G
 * #ffc107 sobre blanco, 1,6:1), reparados a mano en f9af2556. El censo del 19/10 (929 reglas en
 * 471 hojas, con un script que se perdió con la copia de /reparar) lo hizo campaña, y el
 * hallazgo 3600 (calculadora-legibilidad, 30/10) volvió a dar la misma forma. Este detector,
 * reescrito el 31/10/2026, contó 1.138 reglas en 513 hojas antes de la campaña: más que el
 * del 19/10 porque resuelve los tokens propios de cualquier nombre (`--color-warn`), los
 * globales y `styles/`; las diferencias no se pueden reconciliar con un script que no existe.
 *
 * Sin pasivo: barre el árbol entero. Escape: «semanticos-ok: <razón>» en la línea del color o
 * en la anterior, con la razón obligatoria (la marca a secas también rompe).
 *
 * Pruebas: `npm run semanticos-claro:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsearCss, luminancia } from './contraste-marca/clasificar.mjs';
import { aHex, contraste } from './contraste-semanticos/censo.mjs';
import { prefijosCongelados, esCongelado } from './contraste-marca/congelados.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Los cuatro tokens de texto con su valor (≥ 4,5:1 sobre blanco, #FAFAFA, #F5F5F5 y el tinte
 *  al 20 % de su familia). Los mismos que `app/globals.css`. */
export const FAMILIAS = {
  rojo: { token: '--rojo-texto', claro: '#B91C1C', oscuro: '#FCA5A5' },
  naranja: { token: '--naranja-texto', claro: '#B93E0B', oscuro: '#FDBA74' },
  ambar: { token: '--ambar-texto', claro: '#8A5A00', oscuro: '#FCD34D' },
  verde: { token: '--verde-texto', claro: '#136E35', oscuro: '#86EFAC' },
};

/** Valores del claro de los tokens de globals que pueden aparecer como `var()`. */
const GLOBALES = {
  '--error': '#f44336', '--success': '#4caf50', '--warning': '#ff9800',
  '--bg-card': '#ffffff', '--bg-primary': '#fafafa', '--hover': '#f5f5f5', '--border': '#e5e5e5',
  '--hero-bg': '#1a5278', '--primary': '#2e86ab', '--secondary': '#48a9a6',
  '--primary-boton': '#26718f', '--secondary-boton': '#327874',
  ...Object.fromEntries(Object.values(FAMILIAS).map((f) => [f.token, f.claro.toLowerCase()])),
};

const RE_OSCURO = /\[data-theme\s*=\s*["']?dark["']?\s*\]|:global\(\s*\.dark\s*\)/i;
const RE_ESCAPE = /semanticos-ok:\s*(\S.*)?/;
/** Por debajo, el texto blanco encima pasa de 4,5:1: es un fondo oscuro. */
const LUM_OSCURO = 0.183;

function hsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

/** La familia semántica de un color por su tono, o null (grises, azules, violetas…). */
export function familia(hex) {
  const { h, s } = hsl(hex);
  if (s < 0.3) return null;
  if (h >= 340 || h < 14) return 'rojo';
  if (h < 30) return 'naranja'; // #d97706 (32°) es el ámbar-600 de Tailwind, no un naranja

  if (h < 62) return 'ambar';
  if (h >= 75 && h < 170) return 'verde';
  return null;
}

const aHex6 = (r, g, b) => `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
const canales = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const sobre = (hex, a, base = '#ffffff') => aHex6(...canales(hex).map((c, i) => c * a + canales(base)[i] * (1 - a)));

/**
 * Resuelve un valor de fondo a { hex } o { tipo } ('degradado', 'otro', 'transparente'). Lo
 * translúcido se compone sobre `base` (blanco en claro; la tarjeta oscura en la pasada oscura),
 * y los tokens de globals se leen de `globales`.
 */
function resolverFondo(valor, tokens, base = '#ffffff', globales = GLOBALES) {
  let v = valor.trim().toLowerCase().replace(/\s*!important$/, '');
  if (/^(transparent|none|inherit|initial|unset)$/.test(v)) return { tipo: 'transparente' };
  const mv = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
  if (mv) v = tokens[mv[1]] ?? globales[mv[1]] ?? (mv[2] ? mv[2].trim() : null) ?? '';
  // color-mix(in srgb, A p%, B): el tinte de las insignias de Coquinum (214 fondos así); con
  // `transparent` como B es A al p % sobre la base
  const mx = v.match(/^color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+)\)$/);
  if (mx) {
    const a = resolverFondo(mx[1], tokens, base, globales);
    const b = mx[3].trim() === 'transparent' ? { hex: base } : resolverFondo(mx[3], tokens, base, globales);
    if (!a.hex || !b.hex) return { tipo: 'otro' };
    const p = +mx[2] / 100;
    const [ca, cb] = [canales(a.hex), canales(b.hex)];
    return { hex: aHex6(...ca.map((c, i) => c * p + cb[i] * (1 - p))) };
  }
  if (/gradient\(/.test(v)) {
    const colores = [...v.matchAll(/#[0-9a-f]{3,6}\b|rgba?\([^)]*\)|var\(\s*--[\w-]+\s*\)/g)].map((m) => {
      const x = m[0].startsWith('var(') ? tokens[m[0].slice(4, -1).trim()] ?? globales[m[0].slice(4, -1).trim()] : m[0];
      return x ? resolverFondo(x, tokens, base, globales) : null;
    });
    if (colores.length && colores.every((c) => c?.hex && luminancia(c.hex) < LUM_OSCURO)) return { hex: colores[0].hex };
    return { tipo: 'degradado' };
  }
  if (/url\(/.test(v)) return { tipo: 'otro' };
  const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+%?)\s*)?\)/);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4];
    if (a === 0) return { tipo: 'transparente' };
    return { hex: sobre(aHex6(+m[1], +m[2], +m[3]), a, base) };
  }
  const h = aHex(v.split(/\s+/)[0] ?? '');
  return h ? { hex: h } : { tipo: 'otro' };
}

/**
 * Las clases ANTECESORAS en el DOM de cada clase de un módulo, leídas del JSX de los `.tsx` que lo
 * importan (cabo C0608, 04/11/2026): `.warningList li strong` no nombra a `.warningBox` en su
 * selector, pero el TSX pinta la lista DENTRO de la caja, y el tinte de la caja es su fondo.
 * Devuelve Map<'.clase', Array<Array<'.clase'>>>: por cada aparición de la clase, sus antecesoras
 * de la más cercana a la más lejana. `ident` es el nombre del import (`styles`, casi siempre).
 *
 * Es una lectura de TEXTO, no un parser de TSX: busca las etiquetas por su `<Nombre`, salta el
 * interior de las llaves del atributo para encontrar el `>` que cierra, y cierra una etiqueta con
 * su `</Nombre>`. Un `i<n` o un `useState<number>` se toman por etiquetas sin clases y no aportan
 * nada; un cierre que no encuentra su apertura se ignora. Lo que se pinta en otro componente (un
 * hijo en otro fichero) no se ve: lo mide el píxel.
 */
export function anidamientoDeTsx(fuentes) {
  const mapa = new Map();
  for (const { texto, ident } of fuentes) {
    const src = texto.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
    const reClase = new RegExp(`\\b${ident}\\.([A-Za-z_][\\w]*)|\\b${ident}\\[\\s*['"]([\\w-]+)['"]\\s*\\]`, 'g');
    const pila = [];
    const reEtiqueta = /<(\/?)([A-Za-z][\w.]*)/g;
    let m;
    while ((m = reEtiqueta.exec(src))) {
      const nombre = m[2];
      // Una etiqueta va tras `(`, `>`, `}`, `?`, `:`, `&&`, `||`, `=`, `,`, `[`, `{` o un `return`;
      // `i<n`, `a < b` o `useState<number>` llevan un identificador delante y no lo son. Y tras
      // el nombre, un espacio, `>` o `/`. Un cierre `</x>` va tras texto y no se confunde.
      if (!/[\s>/]/.test(src[reEtiqueta.lastIndex] ?? '')) continue;
      const antes = src.slice(Math.max(0, m.index - 12), m.index).trimEnd();
      if (!m[1] && antes && !/[(>}?:&|=,[{;]$|\breturn$/.test(antes)) continue;
      if (m[1]) {
        const i = pila.map((e) => e.nombre).lastIndexOf(nombre);
        if (i >= 0) pila.length = i;
        continue;
      }
      // Fin de la etiqueta de apertura: el primer `>` fuera de llaves y de comillas
      let j = reEtiqueta.lastIndex;
      let llaves = 0;
      let comilla = null;
      for (; j < src.length; j++) {
        const ch = src[j];
        if (comilla) { if (ch === comilla && src[j - 1] !== '\\') comilla = null; continue; }
        if (ch === '"' || ch === "'" || ch === '`') comilla = ch;
        else if (ch === '{') llaves++;
        else if (ch === '}') llaves--;
        else if (ch === '>' && llaves <= 0) break;
        else if (ch === '<' && llaves <= 0) { j = -1; break; } // no era una etiqueta
      }
      if (j < 0 || j >= src.length) continue;
      const atributos = src.slice(reEtiqueta.lastIndex, j);
      const clases = [...atributos.matchAll(reClase)].map((x) => `.${x[1] ?? x[2]}`);
      const antecesoras = pila.slice().reverse().flatMap((e) => e.clases);
      for (const c of clases) {
        if (!mapa.has(c)) mapa.set(c, []);
        mapa.get(c).push(antecesoras);
      }
      if (src[j - 1] !== '/') pila.push({ nombre, clases });
      reEtiqueta.lastIndex = j + 1;
    }
  }
  return mapa;
}

const ultimoFondo = (decls) => decls.filter((d) => /^background(-color)?$/.test(d.prop)).at(-1);
/** Los compuestos de un selector (`.a > .b .c` → ['.a', '.b', '.c']). */
const compuestos = (sel) => sel.replace(/\s*[>+~]\s*/g, ' ').trim().split(/\s+/);
const clasesDe = (comp) => (comp.match(/\.[A-Za-z0-9_-]+/g) ?? []);

/**
 * Los textos semánticos de una hoja que no llegan a su umbral en claro. Cada caso lleva
 * `accion`: 'receta' (con el valor nuevo en `nuevo`), 'aparte' (no juzgado, con `motivo`) o
 * 'sin-reserva' (el token de texto usado sin el color del oscuro detrás), y `escape` si su
 * línea lo lleva.
 */
export function analizarHoja(css, { dom = null } = {}) {
  const bloques = parsearCss(css);
  const lineas = css.split('\n');
  const claros = bloques.filter((b) => !b.contexto.oscuroMedia && !RE_OSCURO.test(b.selector));

  // Tokens propios del módulo (su valor del claro, resolviendo un nivel de var())
  const tokens = {};
  for (const b of claros) for (const d of b.decls) if (d.prop.startsWith('--')) tokens[d.prop] ??= d.valor.trim();
  for (const [k, v] of Object.entries(tokens)) {
    const mv = v.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    tokens[k] = mv ? tokens[mv[1]] ?? GLOBALES[mv[1]] ?? v : v;
  }

  // Clases que el módulo pinta con fondo oscuro
  const clasesOscuras = new Set();
  // Y el fondo (claro u oscuro) que el módulo da a una clase en su regla BASE, `.clase` a secas:
  // lo hereda a la vista el texto de `.clase strong` si su regla no pone fondo (C0592).
  const fondoDeClase = new Map();
  for (const b of claros) {
    const f = ultimoFondo(b.decls);
    if (!f) continue;
    const r = resolverFondo(f.valor, tokens);
    if (r.hex && luminancia(r.hex) < LUM_OSCURO) {
      for (const p of b.selector.split(',')) for (const c of clasesDe(compuestos(p.trim()).at(-1) ?? '')) clasesOscuras.add(c);
    }
    if (!r.hex) continue;
    // Un tinte translúcido del antecesor está sobre la PÁGINA (--bg-primary, #FAFAFA), no sobre
    // blanco: así se midió el 3940 por píxel (4,36:1), y contra blanco daba 4,55:1 y callaba.
    const m = f.valor.trim().toLowerCase().match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
    const hex = m && +m[4] < 1
      ? aHex6(...[1, 2, 3].map((i) => +m[i] * +m[4] + 250 * (1 - +m[4])))
      : r.hex;
    for (const p of b.selector.split(',')) if (/^\.[\w-]+$/.test(p.trim())) fondoDeClase.set(p.trim(), hex);
  }

  /**
   * El fondo que el texto hereda de una clase ANTECESORA de su selector (cabo C0592, 02/11/2026):
   * `.avisoConstante strong` no pone fondo, pero `.avisoConstante` sí, un tinte naranja, y el
   * naranja del texto se quedaba en 4,36:1 mientras el candado lo medía contra blanco (5,02:1).
   * Hallazgo 3940 de tabla-integrales. De varias partes del selector, la de menor contraste; de
   * varios antecesores, el más cercano. Si el selector no da ninguno, el antecesor que solo
   * existe en el DOM (`.warningList strong` dentro de un `.warningBox` que pone el TSX), por
   * `dom`, el anidamiento que lee anidamientoDeTsx (C0608).
   */
  const fondoHeredado = (selector, hexTexto) => {
    let peor = null;
    const anotar = (hex) => { if (hex && (!peor || contraste(hexTexto, hex) < contraste(hexTexto, peor))) peor = hex; };
    for (const p of selector.split(',')) {
      const comps = compuestos(p.trim());
      const antecesores = comps.slice(0, -1).reverse();
      const hex = antecesores.flatMap((c) => clasesDe(c)).map((k) => fondoDeClase.get(k)).find(Boolean);
      if (hex) { anotar(hex); continue; }
      // Ni la regla ni el selector ponen fondo: el de la antecesora más cercana EN EL DOM de la
      // clase más interna del selector, según el TSX (C0608). De varias apariciones, la peor.
      if (!dom) continue;
      const k = comps.slice().reverse().flatMap((c) => clasesDe(c)).find((c) => dom.has(c));
      for (const lista of k ? dom.get(k) : []) anotar(lista.map((a) => fondoDeClase.get(a)).find(Boolean));
    }
    return peor;
  };

  const casos = [];
  for (const b of claros) {
    for (const d of b.decls) {
      if (!/^(color|-webkit-text-fill-color)$/.test(d.prop)) continue;
      const importante = /!important\s*$/i.test(d.valor);
      const valor = d.valor.replace(/\s*!important\s*$/i, '').trim();
      let hex = aHex(valor);
      let via = 'literal';
      const mv = valor.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
      if (!hex && mv) {
        if (Object.values(FAMILIAS).some((f) => f.token === mv[1])) {
          // Ya es la receta. Sin reserva y sin declararlo el módulo, en oscuro no hay color:
          // el token no existe en ese tema y `color` cae a lo heredado.
          if (!mv[2] && !(mv[1] in tokens)) casos.push({ linea: d.linea, selector: b.selector, valor: d.valor, accion: 'sin-reserva' });
          continue;
        }
        if (tokens[mv[1]] && aHex(tokens[mv[1]])) { hex = aHex(tokens[mv[1]]); via = 'token-modulo'; }
        else if (GLOBALES[mv[1]] && /^--(error|success|warning)$/.test(mv[1])) { hex = GLOBALES[mv[1]]; via = 'token-global'; }
        else if (mv[2] && aHex(mv[2])) { hex = aHex(mv[2]); via = 'reserva'; }
      }
      if (!hex) continue;
      const fam = familia(hex);
      if (!fam) continue;

      const tam = b.decls.find((x) => x.prop === 'font-size')?.valor ?? '';
      const px = (m => m ? (m[2] === 'rem' || m[2] === 'em' ? +m[1] * 16 : +m[1]) : 0)(tam.match(/^([\d.]+)(px|rem|em)$/));
      const negrita = /^(bold|bolder|[6-9]00)$/.test(b.decls.find((x) => x.prop === 'font-weight')?.valor.trim() ?? '');
      const pseudo = /::?(before|after|marker)\b/.test(b.selector);
      const umbral = px >= 24 || (px >= 18.66 && negrita) || pseudo ? 3 : 4.5;

      const fDecl = ultimoFondo(b.decls);
      const heredado = fDecl ? null : fondoHeredado(b.selector, hex);
      const fondo = fDecl ? resolverFondo(fDecl.valor, tokens) : heredado ? { hex: heredado, heredado: true } : { tipo: 'ninguno' };
      const hexFondo = fondo.hex ?? '#ffffff';
      const ratio = contraste(hex, hexFondo);
      if (ratio >= umbral) continue;

      const caso = {
        linea: d.linea, desde: d.desde, hasta: d.hasta, selector: b.selector, valor: d.valor, hex, fam, via,
        fondo: fondo.hex ?? fondo.tipo, ratio: Math.round(ratio * 100) / 100, umbral,
      };
      const esc = [lineas[d.linea - 1], lineas[d.linea - 2]].map((l) => l?.match(RE_ESCAPE)).find(Boolean);
      if (esc) caso.escape = esc[1]?.replace(/\*\/.*$/, '').trim() || '';

      const partes = b.selector.split(',').map((p) => p.trim());
      const padreOscuro = partes.some((p) => compuestos(p).slice(0, -1).some((c) => clasesDe(c).some((k) => clasesOscuras.has(k))));
      if (fondo.hex && luminancia(fondo.hex) < LUM_OSCURO) Object.assign(caso, { accion: 'aparte', motivo: 'fondo oscuro en la regla' });
      else if (padreOscuro) Object.assign(caso, { accion: 'aparte', motivo: 'fondo oscuro del antecesor' });
      else if (fondo.tipo === 'degradado' || fondo.tipo === 'otro') Object.assign(caso, { accion: 'aparte', motivo: `fondo ${fondo.tipo}` });
      else if (via === 'reserva') Object.assign(caso, { accion: 'aparte', motivo: 'var() que pone el TSX' });
      else Object.assign(caso, { accion: 'receta', nuevo: `var(${FAMILIAS[fam].token}, ${valor})${importante ? ' !important' : ''}` });
      casos.push(caso);
    }
  }
  return casos;
}

// ─── La pasada OSCURA de la receta (cabo C0681, 15/11/2026) ──────────────────

/** Valores del oscuro de los tokens de globals que pueden aparecer como `var()` en un fondo. */
const GLOBALES_OSCURO = {
  ...GLOBALES,
  '--error': '#ef5350', '--success': '#66bb6a', '--warning': '#ffa726',
  '--bg-card': '#2d2d2d', '--bg-primary': '#1a1a1a', '--hover': '#383838', '--border': '#404040',
  '--primary': '#3fa5d1', '--secondary': '#5abdb9',
  ...Object.fromEntries(Object.values(FAMILIAS).map((f) => [f.token, f.oscuro.toLowerCase()])),
};
/** Lo translúcido en oscuro se compone sobre la tarjeta, #2D2D2D (el peor de los dos fondos). */
const BASE_OSCURA = '#2d2d2d';

/** `[data-theme='dark'] .x`, `:global([data-theme="dark"]) .x` o `.x` dentro de una media oscura → `.x`. */
const baseDeOscuro = (parte) =>
  parte.replace(/:global\(\s*(\[data-theme\s*=\s*["']?dark["']?\s*\])\s*\)/i, '$1').replace(RE_OSCURO, '').replace(/\s+/g, ' ').trim();

/**
 * Los textos pintados con la receta `var(--x-texto, X)` que en OSCURO quedarían sobre un fondo
 * claro. En oscuro los cuatro tokens valen un tono claro (FAMILIAS[x].oscuro), así que una regla
 * cuyo fondo sigue claro en ese tema —el de la regla, el de una clase antecesora del selector o
 * el de la antecesora en el DOM, sin variante oscura— necesita su propio color oscuro:
 * `[data-theme='dark'] .x { color: <el de antes> }`. Cada caso lleva `escape` si su línea lo lleva.
 *
 * Con `literales: true` mira en cambio el color semántico LITERAL (`color: #dc2626`, sin `var()`)
 * cuyo selector no lo redeclara en oscuro (cabo C0708): ese literal se pinta igual en los dos
 * temas, y se mide contra su fondo en oscuro o, si no tiene, contra la tarjeta #2D2D2D (el peor
 * de la página y la tarjeta para un texto de luminancia media). Cada caso lleva `nuevo`, la receta.
 */
export function analizarOscuro(css, { dom = null, literales = false } = {}) {
  const bloques = parsearCss(css);
  const lineas = css.split('\n');
  const esOsc = (b) => b.contexto.oscuroMedia || RE_OSCURO.test(b.selector);
  const enPantalla = bloques.filter((b) => !b.contexto.impresion);
  const claros = enPantalla.filter((b) => !esOsc(b));
  const oscuros = enPantalla.filter(esOsc);

  // Tokens del módulo en oscuro: su valor del claro, pisado por el que redeclare un bloque oscuro
  const tokens = {};
  for (const b of claros) for (const d of b.decls) if (d.prop.startsWith('--')) tokens[d.prop] ??= d.valor.trim();
  for (const b of oscuros) for (const d of b.decls) if (d.prop.startsWith('--')) tokens[d.prop] = d.valor.trim();
  for (const [k, v] of Object.entries(tokens)) {
    const mv = v.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    tokens[k] = mv ? tokens[mv[1]] ?? GLOBALES_OSCURO[mv[1]] ?? v : v;
  }

  // Lo que los bloques oscuros redeclaran, por selector base: fondo y color
  const enOscuro = new Map();
  for (const b of oscuros) {
    for (const p of b.selector.split(',')) {
      const k = baseDeOscuro(p);
      const e = enOscuro.get(k) ?? {};
      const f = ultimoFondo(b.decls);
      if (f) e.fondo = f.valor;
      if (b.decls.some((d) => /^(color|-webkit-text-fill-color)$/.test(d.prop))) e.color = true;
      enOscuro.set(k, e);
    }
  }
  const resolver = (valor) => resolverFondo(valor, tokens, BASE_OSCURA, GLOBALES_OSCURO);
  /** El fondo de una parte de selector en oscuro: el de su variante oscura o, si no la tiene, el del claro. */
  const fondoDe = (parte, declsClaro) => {
    const osc = enOscuro.get(parte.trim())?.fondo;
    if (osc) return resolver(osc);
    const f = declsClaro && ultimoFondo(declsClaro);
    return f ? resolver(f.valor) : null;
  };

  // El fondo en oscuro de cada clase en su regla BASE (`.clase` a secas), como fondoDeClase del claro
  const fondoDeClase = new Map();
  for (const b of claros) {
    for (const p of b.selector.split(',')) {
      if (!/^\.[\w-]+$/.test(p.trim())) continue;
      const r = fondoDe(p, b.decls);
      if (r?.hex) fondoDeClase.set(p.trim(), r.hex);
    }
  }
  for (const [k, e] of enOscuro) if (/^\.[\w-]+$/.test(k) && e.fondo && !fondoDeClase.has(k)) {
    const r = resolver(e.fondo);
    if (r.hex) fondoDeClase.set(k, r.hex);
  }

  const casos = [];
  for (const b of claros) {
    for (const d of b.decls) {
      if (!/^(color|-webkit-text-fill-color)$/.test(d.prop)) continue;
      let fam;
      let hexTexto;
      const valorLimpio = d.valor.replace(/\s*!important\s*$/i, '').trim();
      if (literales) {
        if (valorLimpio.includes('var(')) continue;
        hexTexto = aHex(valorLimpio);
        fam = hexTexto && familia(hexTexto);
        if (!fam) continue;
      } else {
        const mv = d.valor.match(/var\(\s*(--(rojo|naranja|ambar|verde)-texto)\s*,/);
        if (!mv) continue;
        fam = mv[2];
        hexTexto = FAMILIAS[fam].oscuro;
      }
      const partes = b.selector.split(',').map((p) => p.trim());
      // Su variante oscura ya pone color: la receta no llega a pintarse en oscuro
      if (partes.every((p) => enOscuro.get(p)?.color)) continue;

      const tam = b.decls.find((x) => x.prop === 'font-size')?.valor ?? '';
      const px = (m => m ? (m[2] === 'rem' || m[2] === 'em' ? +m[1] * 16 : +m[1]) : 0)(tam.match(/^([\d.]+)(px|rem|em)$/));
      const negrita = /^(bold|bolder|[6-9]00)$/.test(b.decls.find((x) => x.prop === 'font-weight')?.valor.trim() ?? '');
      const pseudo = /::?(before|after|marker)\b/.test(b.selector);
      const umbral = px >= 24 || (px >= 18.66 && negrita) || pseudo ? 3 : 4.5;

      let peor = null;
      for (const p of partes) {
        if (enOscuro.get(p)?.color) continue;
        const propio = fondoDe(p, b.decls);
        let hex = propio?.hex ?? null;
        if (!propio) {
          const comps = compuestos(p);
          // Primero las otras clases del MISMO elemento (`.stepButton.stepCompleted` hereda a la
          // vista el fondo de `.stepButton`); después las antecesoras del selector y las del DOM
          const mismo = (comps.at(-1) ?? '').replace(/:.*$/, '');
          hex = [mismo, ...comps.slice(0, -1).reverse()].flatMap((c) => clasesDe(c)).map((k) => fondoDeClase.get(k)).find(Boolean) ?? null;
          if (!hex && dom) {
            const k = comps.slice().reverse().flatMap((c) => clasesDe(c)).find((c) => dom.has(c));
            for (const lista of k ? dom.get(k) : []) {
              const h = lista.map((a) => fondoDeClase.get(a)).find(Boolean);
              if (h && (!hex || contraste(hexTexto, h) < contraste(hexTexto, hex))) hex = h;
            }
          }
        }
        if (hex && (!peor || contraste(hexTexto, hex) < contraste(hexTexto, peor))) peor = hex;
      }
      // Sin fondo propio: la página o la tarjeta oscuras, donde la receta cumple; el literal no
      if (!peor && !literales) continue;
      peor ??= BASE_OSCURA;
      const ratio = contraste(hexTexto, peor);
      if (ratio >= umbral) continue;
      const reserva = d.valor.match(/var\(\s*--[\w-]+\s*,\s*(.+)\)\s*(!important)?\s*$/)?.[1]?.trim() ?? '';
      const caso = {
        linea: d.linea, selector: b.selector, valor: d.valor, fam, fondo: peor,
        ratio: Math.round(ratio * 100) / 100, umbral, reserva,
      };
      if (literales) {
        Object.assign(caso, { hex: hexTexto, desde: d.desde, hasta: d.hasta });
        caso.nuevo = `var(${FAMILIAS[fam].token}, ${valorLimpio})${/!important\s*$/i.test(d.valor) ? ' !important' : ''}`;
      }
      const esc = [lineas[d.linea - 1], lineas[d.linea - 2]].map((l) => l?.match(RE_ESCAPE)).find(Boolean);
      if (esc) caso.escape = esc[1]?.replace(/\*\/.*$/, '').trim() || '';
      casos.push(caso);
    }
  }
  return casos;
}

// ─── Ejecución directa ────────────────────────────────────────────────────────

function recorrer(dir, acc = []) {
  let es;
  try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of es) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, acc);
    else if (e.name.endsWith('.module.css')) acc.push(p);
  }
  return acc;
}

function recorrerTsx(dir, acc = [], recursivo = true) {
  let es;
  try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of es) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (recursivo) recorrerTsx(p, acc); }
    else if (e.name.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

/**
 * Qué `.tsx` importa cada hoja, y con qué nombre: Map<ruta absoluta de la hoja, [{ texto, ident }]>.
 * Una sola pasada por los TSX de `dirs`, para no releer `components/` por cada una de sus hojas.
 */
export function indiceTsx(raiz, dirs, recursivo = true) {
  const indice = new Map();
  for (const f of dirs.flatMap((d) => recorrerTsx(path.resolve(raiz, d), [], recursivo))) {
    const texto = fs.readFileSync(f, 'utf8');
    for (const m of texto.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.module\.css)['"]/g)) {
      const hoja = m[2].startsWith('@/') ? path.join(raiz, m[2].slice(2)) : path.resolve(path.dirname(f), m[2]);
      if (!indice.has(hoja)) indice.set(hoja, []);
      indice.get(hoja).push({ texto, ident: m[1] });
    }
  }
  return indice;
}

const RE_PORTAL = /^app\/(coquinum|cronicum|delegum|stemum)\/|^components\/(Coquinum|Cronicum|Delegum|Stemum)[A-Za-z]*\.module\.css$/;

/** Las hojas que barre el candado: app/, components/ y styles/, sin congeladas ni portales. */
export function hojasDelArbol(raiz = RAIZ) {
  const cong = prefijosCongelados(raiz);
  return ['app', 'components', 'styles']
    .flatMap((a) => recorrer(path.join(raiz, a)))
    .filter((h) => {
      const rel = path.relative(raiz, h).replace(/\\/g, '/');
      return !esCongelado(rel, cong) && !RE_PORTAL.test(rel);
    });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const TODO = args.includes('--todo');
  const sueltas = args.filter((a) => !a.startsWith('--'));
  const hojas = sueltas.length ? sueltas.map((s) => path.resolve(s)) : hojasDelArbol();
  // Un árbol sin hojas daría verde sin haber mirado nada
  if (!hojas.length) {
    console.error('❌ check:semanticos-claro — no encuentro ninguna hoja .module.css que mirar');
    process.exit(2);
  }
  const fmt = (n) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(n);
  const rompen = [];
  const sinRazon = [];
  const aparte = [];
  const enOscuro = [];
  const literalOscuro = [];
  // Los TSX que importan cada hoja (C0608): del árbol, o del directorio de cada hoja suelta
  const indice = sueltas.length
    ? indiceTsx(RAIZ, [...new Set(hojas.map((h) => path.dirname(h)))], false)
    : indiceTsx(RAIZ, ['app', 'components']);
  for (const h of hojas) {
    const rel = path.relative(RAIZ, h).replace(/\\/g, '/');
    const fuentes = indice.get(path.resolve(h));
    const dom = fuentes ? anidamientoDeTsx(fuentes) : null;
    for (const c of analizarHoja(fs.readFileSync(h, 'utf8'), { dom })) {
      if (c.escape === '') sinRazon.push({ rel, ...c });
      else if (c.escape) continue;
      else if (c.accion === 'aparte') aparte.push({ rel, ...c });
      else rompen.push({ rel, ...c });
    }
    for (const c of analizarOscuro(fs.readFileSync(h, 'utf8'), { dom })) {
      if (c.escape === '') sinRazon.push({ rel, ...c, oscuro: true });
      else if (!c.escape) enOscuro.push({ rel, ...c });
    }
    for (const c of analizarOscuro(fs.readFileSync(h, 'utf8'), { dom, literales: true })) {
      if (c.escape === '') sinRazon.push({ rel, ...c, oscuro: true });
      else if (!c.escape) literalOscuro.push({ rel, ...c });
    }
  }
  const linea = (c) => c.accion === 'sin-reserva'
    ? `   ${c.rel}:${c.linea}  ${c.selector}  ${c.valor}`
    : `   ${c.rel}:${c.linea}  ${c.selector}  ${c.valor} sobre ${c.fondo === 'ninguno' ? 'blanco (la regla no pone fondo)' : c.fondo} = ${fmt(c.ratio)}:1 (umbral ${fmt(c.umbral)})`;
  if (TODO && aparte.length) {
    console.log(`\nNo juzgados (${aparte.length}): el fondo no es claro o no se sabe leer`);
    for (const c of aparte) console.log(`${linea(c)} · ${c.motivo}`);
  }
  if (enOscuro.length) {
    console.error(`\n❌ check:semanticos-claro — la receta, que en oscuro es un tono claro, sobre un fondo que sigue claro en oscuro (C0681)`);
    for (const c of enOscuro) console.error(`   ${c.rel}:${c.linea}  ${c.selector}  ${c.valor} sobre ${c.fondo} = ${fmt(c.ratio)}:1 en oscuro (umbral ${fmt(c.umbral)})`);
    console.error(`\n   Si el fondo es claro y fijo en los dos temas: un color fijo que cumpla sobre él, no la receta.`);
    console.error(`   Si solo sigue claro en una parte (un papel, una insignia): una regla para esa parte con su color.`);
    console.error(`   Falso positivo (el texto no va encima de ese fondo): «semanticos-ok: <razón>» en la línea del color.\n`);
  }
  if (literalOscuro.length) {
    console.error(`\n❌ check:semanticos-claro — color semántico LITERAL sin variante oscura, que en oscuro no llega a su umbral (C0708)`);
    for (const c of literalOscuro) console.error(`   ${c.rel}:${c.linea}  ${c.selector}  ${c.valor} sobre ${c.fondo} = ${fmt(c.ratio)}:1 en oscuro (umbral ${fmt(c.umbral)})\n      → ${c.nuevo}`);
    console.error(`\n   El literal se pinta igual en los dos temas. Receta: var(--x-texto, <el literal>), que en oscuro`);
    console.error(`   vale un tono claro de su familia; o una regla [data-theme='dark'] con su propio color.`);
    console.error(`   Falso positivo (su fondo real sigue claro en oscuro y lo pone el TSX): «semanticos-ok: <razón>».\n`);
  }
  if (rompen.length || sinRazon.length || enOscuro.length || literalOscuro.length) {
    if (rompen.length || sinRazon.length) console.error(`\n❌ check:semanticos-claro — texto rojo, naranja, ámbar o verde que no se lee en el tema claro`);
    for (const c of rompen) console.error(`${linea(c)}\n      → ${c.accion === 'sin-reserva' ? 'falta la reserva: la receta lleva detrás el color de antes (C0296)' : c.nuevo}`);
    for (const c of sinRazon) console.error(`${linea(c)}\n      → el escape semanticos-ok necesita su razón`);
    console.error(`\n   Receta: var(--rojo-texto, <color de antes>), y lo mismo con --naranja-texto, --ambar-texto`);
    console.error(`   y --verde-texto. En oscuro valen un tono claro de su familia (C0681).`);
    console.error(`   Falso positivo (el fondo real es oscuro y lo pone el TSX): «semanticos-ok: <razón>».\n`);
    process.exit(1);
  }
  console.log(`✅ check:semanticos-claro — ${hojas.length} hojas, ningún texto semántico por debajo de su umbral en claro, ni receta sobre fondo claro ni literal sin variante en oscuro${aparte.length ? ` (${aparte.length} no juzgados: --todo)` : ''}`);
}
