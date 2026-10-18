#!/usr/bin/env node
/**
 * censo.mjs — censo del cabo C0226: los tokens SEMÁNTICOS (--danger, --error, --success,
 * --warning) que un `.module.css` declara con un color literal y NO redeclara en la variante
 * oscura del mismo selector, de modo que en oscuro sirven el valor del claro.
 *
 *   node scripts/contraste-semanticos/censo.mjs            resumen y los que fallan
 *   node scripts/contraste-semanticos/censo.mjs --json <ruta>   detalle completo
 *
 * El cabo lo pide medido: «muchos pueden usarse solo como borde o fondo, donde no hay defecto».
 * Por eso cada caso sale con DOS datos:
 *   · si el token se usa como TEXTO (`color:` o `-webkit-text-fill-color:` en la hoja, o
 *     `color: 'var(--x)'` en un `style={{}}` de un `.tsx` de la misma app);
 *   · el contraste de su valor claro sobre los fondos del tema oscuro de globals: la página
 *     #1A1A1A, la tarjeta #2D2D2D y `--hover` #383838 (y el #2A2A2A que redeclaran ~460
 *     módulos). Se informa del PEOR. Es la cota de lo que se verá; el fondo exacto de cada
 *     elemento lo mide por píxel `tests/contraste-semanticos-oscuro.spec.ts`.
 *
 * El criterio de «variante oscura del mismo selector» es el de `check-token-oscuro.mjs`:
 * `[data-theme='dark'] <sel>`, `:global([data-theme='dark']) <sel>` y una regla del mismo
 * selector dentro de `@media (prefers-color-scheme: dark)`.
 *
 * El censo del 12/10/2026 (117 módulos) se hizo con un script en la copia de /reparar que no
 * se conservó; éste vive en el repositorio para que la cifra se pueda repetir.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsearCss, luminancia } from '../contraste-marca/clasificar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const iJson = process.argv.indexOf('--json');
const JSON_SALIDA = iJson === -1 ? null : process.argv[iJson + 1];

export const SEMANTICOS = ['--danger', '--error', '--success', '--warning'];
export const FONDOS_OSCUROS = ['#1A1A1A', '#2A2A2A', '#2D2D2D', '#383838'];

const RE_OSCURO = /\[data-theme\s*=\s*['"]?dark['"]?\]/;
const RE_SOLO_CLARO = /\[data-theme\s*=\s*['"]?light['"]?\]|:not\(\s*\[data-theme\s*=\s*['"]?dark['"]?\]\s*\)/;

/** Contraste WCAG entre dos hexadecimales. */
export function contraste(a, b) {
  const la = luminancia(a);
  const lb = luminancia(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Un literal de color a hexadecimal de 6 cifras, o null (rgb() y nombres comunes incluidos). */
export function aHex(v) {
  const s = v.trim().toLowerCase().replace(/\s*!important$/, '');
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) return m[1].length === 3 ? `#${m[1].split('').map((c) => c + c).join('')}` : `#${m[1]}`;
  m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (m && (m[4] === undefined || +m[4] >= 1)) return `#${[m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, '0')).join('')}`;
  const NOMBRES = { red: '#ff0000', green: '#008000', orange: '#ffa500', white: '#ffffff', black: '#000000' };
  return NOMBRES[s] ?? null;
}

function recorrer(dir, suf, acc = []) {
  let es;
  try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of es) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, suf, acc);
    else if (e.name.endsWith(suf)) acc.push(p);
  }
  return acc;
}

const baseOscura = (parte) => {
  const b = parte.replace(/:global\(\s*(\[data-theme\s*=\s*['"]?dark['"]?\])\s*\)/, '$1').replace(RE_OSCURO, '').replace(/\s+/g, ' ').trim();
  return b === '' || b === ':root' || b === 'html' ? ':root' : b;
};

/**
 * Los tokens semánticos sin variante oscura de una hoja, con su uso como texto.
 * Exportado: lo usa también el candado `check-token-oscuro.mjs` para los semánticos.
 */
export function semanticosSinOscuro(css, tsxDeLaApp = '') {
  const bloques = parsearCss(css);
  const cubiertos = new Map();
  const claras = [];
  for (const b of bloques) {
    const decl = b.decls.filter((d) => SEMANTICOS.includes(`--${d.prop.replace(/^--/, '')}`) && d.prop.startsWith('--'));
    if (!decl.length) continue;
    for (const parte of b.selector.split(',').map((s) => s.trim())) {
      if (RE_OSCURO.test(parte) || b.contexto.oscuroMedia) {
        const base = baseOscura(parte);
        const s = cubiertos.get(base) ?? new Set();
        for (const d of decl) s.add(d.prop);
        cubiertos.set(base, s);
      } else if (!RE_SOLO_CLARO.test(parte)) {
        for (const d of decl) claras.push({ base: parte === 'html' ? ':root' : parte, token: d.prop, valor: d.valor, linea: d.linea });
      }
    }
  }
  const usoTexto = (token) => {
    const re = new RegExp(String.raw`var\(\s*${token}\s*[,)]`);
    const enCss = bloques.some((b) => b.decls.some((d) => /^(color|-webkit-text-fill-color)$/.test(d.prop) && re.test(d.valor)));
    const enTsx = new RegExp(String.raw`color\s*:\s*[^,}]*var\(\s*${token}\s*[,)]`).test(tsxDeLaApp);
    return enCss || enTsx;
  };
  const salida = [];
  for (const c of claras) {
    if (cubiertos.get(c.base)?.has(c.token)) continue;
    const hex = aHex(c.valor);
    if (!hex) continue; // var(...) u otra cosa que se resuelve en cada tema
    const ratios = FONDOS_OSCUROS.map((f) => contraste(hex, f));
    salida.push({ ...c, hex, texto: usoTexto(c.token), peor: Math.min(...ratios) });
  }
  return salida;
}

// ─── Ejecución directa ────────────────────────────────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fmt = (n) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(n);
  const casos = [];
  const hojas = ['app', 'components'].flatMap((a) => recorrer(path.join(RAIZ, a), '.module.css'));
  for (const h of hojas) {
    const rel = path.relative(RAIZ, h).replace(/\\/g, '/');
    const dirApp = rel.startsWith('app/') && rel.split('/').length > 2 ? path.join(RAIZ, ...rel.split('/').slice(0, 2)) : path.dirname(h);
    const tsx = recorrer(dirApp, '.tsx').map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    for (const c of semanticosSinOscuro(fs.readFileSync(h, 'utf8'), tsx)) casos.push({ fichero: rel, ...c });
  }
  const modulos = new Set(casos.map((c) => c.fichero));
  const texto = casos.filter((c) => c.texto);
  const fallan = texto.filter((c) => c.peor < 4.5);
  console.log(`\nCenso C0226 — tokens semánticos con literal y sin variante oscura`);
  console.log(`   ${hojas.length} hojas · ${casos.length} declaraciones en ${modulos.size} módulos`);
  console.log(`   usadas como TEXTO: ${texto.length} en ${new Set(texto.map((c) => c.fichero)).size} módulos`);
  console.log(`   … y de ésas, por debajo de 4,5:1 en algún fondo oscuro: ${fallan.length} en ${new Set(fallan.map((c) => c.fichero)).size} módulos`);
  console.log(`   solo como borde o fondo (sin defecto de texto): ${casos.length - texto.length}\n`);
  const porToken = {};
  for (const c of fallan) (porToken[`${c.token} ${c.hex}`] ??= []).push(c);
  for (const [k, cs] of Object.entries(porToken).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`   · ${String(cs.length).padStart(3)} × ${k} (peor ${fmt(Math.min(...cs.map((c) => c.peor)))}:1)`);
  }
  if (JSON_SALIDA) {
    fs.writeFileSync(JSON_SALIDA, JSON.stringify(casos, null, 1));
    console.log(`\nDetalle en ${JSON_SALIDA}`);
  }
}
