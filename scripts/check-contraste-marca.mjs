#!/usr/bin/env node
/**
 * Script: check-contraste-marca.mjs
 *
 * Candado del CONTRASTE DE LA MARCA en botones, distintivos y texto (cabo C0070). Se ejecuta
 * antes de cada build (`npm run build`, las dos tandas) y a mano con
 * `npm run check:contraste-marca` o `node scripts/check-contraste-marca.mjs [--tanda 1|2]`.
 *
 * QUÉ PROHÍBE
 * ───────────
 *   Tanda 1 — TEXTO BLANCO SOBRE LA MARCA, en cualquier selector: `var(--primary)`,
 *             `var(--secondary)`, sus hexadecimales (#2E86AB, #48A9A6) o su `rgb()`.
 *
 *                 blanco sobre --primary   → 4,11:1 en claro · 2,79:1 en oscuro (#3FA5D1)
 *                 blanco sobre --secondary → 2,80:1 en claro · 2,23:1 en oscuro (#5ABDB9)
 *
 *             Sustituto: `var(--primary-boton)` / `var(--secondary-boton)`, 5,47:1 y 5,15:1 en
 *             los dos temas. El blanco cuenta aunque lo ponga el estado base (`.btn` frente a
 *             `.btn:hover`) o la clase hermana de un compuesto (`.btn.activo`).
 *
 *   Tanda 2 — LA MARCA COMO COLOR DE TEXTO (`color`, `-webkit-text-fill-color`, o el degradado
 *             de un `background-clip: text`). #2E86AB da 4,11:1 sobre blanco y #48A9A6 2,68:1;
 *             y un literal, o un `--primary` redeclarado en local sin variante oscura, sigue
 *             siendo #2E86AB en oscuro: 4,24:1 sobre #1A1A1A. Sustituto: `var(--primary-texto)`
 *             / `var(--secondary-texto)`. Incluye el texto GRANDE (que en WCAG solo exige 3:1)
 *             a propósito: su tamaño real no se sabe por la forma del código —rem, clamp,
 *             herencia— y el token no cuesta nada.
 *
 *   Las dos, también cuando la marca llega por una VARIABLE PROPIA del módulo (`--cat-x: #2E86AB`
 *   y luego `color: var(--cat-x)`), desde el 30/10/2026 (cabo C0502: hallazgo 3683 de
 *   quiz-complejidad-algoritmos, y cuatro casos más en tres apps que el censo encontró y se
 *   repararon en el mismo commit). Se corrige el VALOR de la variable, no la declaración que la usa.
 *
 * En `app/`, `components/` y `styles/`, hojas `.module.css` y `style={{…}}` de los `.tsx`. El
 * criterio NO vive aquí: lo importa de `scripts/contraste-marca/clasificar.mjs`, el mismo que
 * usa el script de la campaña, para que lo que se migra y lo que se vigila no diverjan.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del cabo C0070, que nace de la reparación del 28/09/2026 en simulador-movimiento-circular
 * (8f5eb9b7, hallazgos 2381 y 2382): blanco sobre `var(--primary)` en el modo activo, el caso
 * activo, «Comprobar» y los números de la guía, y `--secondary` como texto en el título del
 * caso (2,68:1). El censo del 12/10/2026 dio 1.989 reglas de fondo y 5.405 de texto en 891
 * apps: ya no era un descuido por app, era la plantilla. La nota del 14/10 (lupa-digital, el
 * blanco sobre `#2E86AB` y `rgba(46,134,171,0.85)` escritos a mano) es la razón de que mire
 * también los literales. `npm run contraste-marca:probar-candado` le reinyecta la hoja de
 * movimiento-circular de antes de 8f5eb9b7 y exige que falle.
 *
 * RELACIÓN CON `check:contraste-cabeceras`
 * ────────────────────────────────────────
 * Aquel es el caso particular de los `<th>` (hallazgo 1175, sin pasivo desde el 22/09/2026) y
 * dejó fuera los botones a propósito, «campaña aparte»: es ésta. No se amplió aquel porque
 * está en el build sin pasivo, y meterle 2.844 bloques lo rompería hasta migrarlos; y porque
 * su tercera regla —un token `-texto` usado como fondo— no es de esta campaña. Los dos
 * conviven: lo que aquel vigila es un subconjunto de la tanda 1.
 *
 * QUÉ NO MIRA (lo cuenta la campaña en «aparte», no rompe)
 * ────────────────────────────────────────────────────────
 *   · Un fondo de marca SIN texto blanco a la vista (barras, puntos, o un color heredado del
 *     padre que solo resuelve el navegador). Tampoco el fondo de marca con texto oscuro.
 *   · Los tintes: `rgba(…, <0,5)` o dentro de `color-mix(…)`. `var(--hero-bg)` (8,33:1).
 *   · `--accent` (#7FB3D3) como texto: no tiene token. Sí rompe como FONDO de un texto blanco
 *     (unos 2,1:1), que no tiene sustituto mecánico y se resuelve a mano.
 *   · El texto de un `<canvas>` y el `fill` de un SVG: el color no está en un `color:`.
 *   · Un color que llega por una EXPRESIÓN de JS (`style={{ background: CATEGORIAS[c].color }}`,
 *     hallazgo 3758 de quiz-conceptos-inversion): el valor no está en el código del estilo. Eso
 *     solo lo ve un spec por píxel. Tampoco una variable propia declarada SOLO en oscuro.
 *   · Las apps con PALETA PROPIA (redeclaran `--primary` a otro tono): ahí no es la marca.
 *   · El estado deshabilitado (`:disabled`, exento en WCAG 1.4.3). `:not(:disabled)` sí cuenta.
 *   · Que el sustituto CUMPLA en la página real: eso se mide por píxel
 *     (`tests/contraste-cabeceras-tabla.spec.ts` es el patrón).
 *
 * PASIVO
 * ──────
 * Nació (c6458699) con todo el catálogo por migrar, fuera del build, y se enganchó por tandas,
 * cada una tras su migración: la tanda 1 (dfaf84a2) con `--tanda 1`, y tras la tanda 2
 * (4488bd1d, 18/10/2026) las dos, SIN pasivo. Si algún día tuviera que juzgar solo las líneas
 * añadidas, decirlo AQUÍ con el motivo.
 *
 * Un texto de marca sobre un fondo claro FIJO (un literal sin override oscuro) migra a `-boton`
 * y no a `-texto`: en oscuro `-texto` se aclara a #3FA5D1 y sobre blanco da 2,6:1 (los CTA de
 * los cursos y el «IA» del logo, 18/10/2026). Y el texto de marca sobre un TINTE de marca
 * (rgba 0,1-0,15) se queda en 4,36-4,48:1 aun con `-texto`: es del cabo C0278, no de aquí.
 *
 * ESCAPE
 * ──────
 * `marca-ok: <razón>` en la línea, en el comentario que la precede o en el del selector. **La
 * razón es obligatoria**: la marca a secas también rompe, como en `check:legal`.
 *
 * Opciones: `--tanda 1|2` (por defecto, las dos) · `--todo` (todas las líneas, no 12) ·
 * `--raiz <dir>` (otro árbol; lo usa la prueba) · `--sin-congelados` (fuera los cursos).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analizarCss, analizarTsx, conVariablesPropias, paletaPropia } from './contraste-marca/clasificar.mjs';
import { prefijosCongelados, esCongelado } from './contraste-marca/congelados.mjs';

const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i === -1 ? null : process.argv[i + 1];
};
const RAIZ = arg('--raiz') ? path.resolve(arg('--raiz')) : path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TANDAS = arg('--tanda') ? [Number(arg('--tanda'))] : [1, 2];
const VERBOSO = process.argv.includes('--todo');
const CONGELADOS = process.argv.includes('--sin-congelados') ? prefijosCongelados(RAIZ) : [];

if (TANDAS.some((t) => ![1, 2].includes(t))) {
  console.error('❌ --tanda solo admite 1 o 2.');
  process.exit(2);
}

const ARBOLES = ['app', 'components', 'styles'];
const SUSTITUTO = { 1: '--*-boton', 2: '--*-texto' };

function recorrer(dir, acc = []) {
  let entradas;
  try {
    entradas = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entradas) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, acc);
    else if (e.name.endsWith('.module.css') || e.name.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

const rel = (p) => path.relative(RAIZ, p).replace(/\\/g, '/');

/**
 * Tanda 2 en IMPRESIÓN (27/10/2026, cabo C0483): `--primary-texto` / `--secondary-texto` como
 * color de texto dentro de un `@media print`. El papel es blanco en los dos temas, y en oscuro
 * esos tokens valen su tono claro: impreso desde el tema oscuro, #3FA5D1 sobre blanco da 2,79:1.
 * Es justo lo que la tanda 2 hizo en esos bloques (4488bd1d): el título del parte del sonómetro
 * (hallazgo 3546, 5fcd18bc) y tres títulos del acta de generador-actas (C0483). El sustituto es
 * `-boton`, igual en los dos temas. Va aparte de `clasificar.mjs` porque la campaña no lo migra.
 */
function textoMarcaEnImpresion(css) {
  const t = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const lineas = css.split('\n');
  const out = [];
  let i = 0;
  while ((i = t.indexOf('@media print', i)) !== -1) {
    const abre = t.indexOf('{', i);
    if (abre === -1) break;
    let prof = 1;
    let j = abre + 1;
    while (j < t.length && prof > 0) { if (t[j] === '{') prof++; else if (t[j] === '}') prof--; j++; }
    const re = /(?:^|[;{\s])((?:-webkit-text-fill-)?color)\s*:\s*([^;}]*var\(--(?:primary|secondary)-texto\)[^;}]*)/g;
    const bloque = t.slice(abre, j);
    let m;
    while ((m = re.exec(bloque))) {
      const linea = t.slice(0, abre + m.index).split('\n').length + (m[0].startsWith('\n') ? 1 : 0);
      const cerca = lineas.slice(Math.max(0, linea - 4), linea).join('\n');
      const mk = cerca.match(/marca-ok:([^\n]*)/);
      const razon = mk ? mk[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim() : '';
      out.push({ linea, decl: `${m[1]}: ${m[2].trim()}`, escape: mk ? (/\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón') : null });
    }
    i = j;
  }
  return out;
}
const appDe = (r) => (r.startsWith('app/') ? r.split('/').slice(0, 2).join('/') : r);

const ficheros = ARBOLES.flatMap((a) => recorrer(path.join(RAIZ, a))).filter((f) => !esCongelado(rel(f), CONGELADOS));
const textos = new Map(ficheros.map((f) => [f, fs.readFileSync(f, 'utf8')]));

// La paleta propia se decide por APP: basta con que un fichero suyo redeclare la marca a otro tono
const conPaleta = new Set();
for (const [f, t] of textos) if (paletaPropia(t).length) conPaleta.add(appDe(rel(f)));

const errores = [];
const exentas = [];
for (const [f, t] of textos) {
  const r = rel(f);
  if (conPaleta.has(appDe(r))) continue;
  const { hallazgos } = f.endsWith('.css') ? analizarCss(t) : analizarTsx(t);
  for (const h of hallazgos) {
    if (!h.defecto || !TANDAS.includes(h.tanda)) continue;
    if (h.escape === 'firmado') { exentas.push(`${r}:${h.linea}`); continue; }
    const porQue = h.escape === 'sin razón' ? ' — lleva `marca-ok:` SIN razón escrita, y una excepción sin motivo no se puede revisar' : '';
    const que = h.tanda === 1 ? 'texto blanco sobre la marca' : 'la marca como color de texto';
    // Un degradado de marca lleva los dos tokens: se nombran todos los que tocaría la campaña
    const tokens = [...new Set(h.ediciones.map((e) => e.nuevo.match(/var\(--[a-z-]+\)/)?.[0]).filter(Boolean))];
    const como = h.automatico
      ? `usa ${tokens.map((x) => `\`${x}\``).join(' y ') || `\`${SUSTITUTO[h.tanda]}\``}`
      : `sin sustituto mecánico (${h.motivo}): resolverlo a mano y medirlo`;
    errores.push({ tanda: h.tanda, texto: `${r}:${h.linea} — \`${h.selector.slice(0, 80)}\` pone ${que} (\`${h.prop}: ${h.valor.slice(0, 70)}\`): ${como}.${porQue}` });
  }
  // La marca que llega por una variable propia del módulo (C0502): se analiza la hoja con cada
  // `var(--propia)` sustituido por su valor, y lo que sale de MÁS es lo que la pasada de arriba no ve.
  if (f.endsWith('.css')) {
    const { css: sustituido, propias } = conVariablesPropias(t);
    if (propias.size) {
      const ya = new Set(hallazgos.filter((h) => h.defecto).map((h) => `${h.tanda}:${h.linea}:${h.prop}`));
      for (const h of analizarCss(sustituido).hallazgos) {
        if (!h.defecto || !TANDAS.includes(h.tanda) || ya.has(`${h.tanda}:${h.linea}:${h.prop}`)) continue;
        if (h.escape === 'firmado') { exentas.push(`${r}:${h.linea}`); continue; }
        const porQue = h.escape === 'sin razón' ? ' — lleva `marca-ok:` SIN razón escrita' : '';
        const via = [...propias].filter(([nombre]) => new RegExp(String.raw`var\(\s*${nombre}\s*\)`).test(t.split('\n')[h.linea - 1] ?? '')).map(([nombre, p]) => `\`${nombre}: ${p.valor}\` (l. ${p.linea})`);
        const que = h.tanda === 1 ? 'texto blanco sobre la marca' : 'la marca como color de texto';
        errores.push({ tanda: h.tanda, texto: `${r}:${h.linea} — \`${h.selector.slice(0, 80)}\` pone ${que} a través de la variable propia ${via.join(' y ') || 'del módulo'}: cambia el VALOR de la variable a \`${SUSTITUTO[h.tanda]}\` (o a un tono medido que llegue a 4,5:1).${porQue}` });
      }
    }
  }
  if (TANDAS.includes(2) && f.endsWith('.css')) {
    for (const h of textoMarcaEnImpresion(t)) {
      if (h.escape === 'firmado') { exentas.push(`${r}:${h.linea}`); continue; }
      const porQue = h.escape === 'sin razón' ? ' — lleva `marca-ok:` SIN razón escrita' : '';
      errores.push({ tanda: 2, texto: `${r}:${h.linea} — \`${h.decl}\` dentro de @media print: el papel es blanco en los dos temas y en oscuro ese token es el tono CLARO (#3FA5D1 da 2,79:1): usa \`var(--primary-boton)\` / \`var(--secondary-boton)\`.${porQue}` });
    }
  }
}

if (errores.length) {
  console.error(`\n❌ Contraste de la marca: ${errores.length} problema(s)`);
  for (const t of TANDAS) {
    const de = errores.filter((e) => e.tanda === t);
    if (!de.length) continue;
    console.error(`\n   Tanda ${t} (${t === 1 ? 'fondo de marca con texto blanco' : 'marca como texto'}): ${de.length}`);
    for (const e of VERBOSO ? de : de.slice(0, 12)) console.error(`   · ${e.texto}`);
    if (!VERBOSO && de.length > 12) console.error(`   … y ${de.length - 12} más (--todo para verlos).`);
  }
  console.error('\n   La migración mecánica: node scripts/contraste-marca/campana.mjs --tanda N (simulación; --aplicar escribe).\n');
  process.exit(1);
}

console.log('✅ Contraste de la marca correcto');
console.log(`   · ${ficheros.length} ficheros de ${ARBOLES.join('/, ')}/ · tanda${TANDAS.length > 1 ? 's' : ''} ${TANDAS.join(' y ')}`);
if (conPaleta.size) console.log(`   · ${conPaleta.size} app(s) con paleta propia, fuera: ${[...conPaleta].slice(0, 5).join(', ')}`);
if (exentas.length) console.log(`   · ${exentas.length} exenta(s) con \`marca-ok\`: ${exentas.slice(0, 5).join(', ')}`);
