#!/usr/bin/env node
/**
 * reparar.mjs — reparación del cabo C0226: da variante oscura a los tokens semánticos que pintan
 * TEXTO y que en oscuro servían el valor del claro por debajo de 4,5:1.
 *
 *   node scripts/contraste-semanticos/reparar.mjs             simulación
 *   node scripts/contraste-semanticos/reparar.mjs --aplicar   escribe
 *
 * Qué hace, por cada módulo que el censo (`censo.mjs`) da como defecto —token declarado con
 * literal, sin variante oscura, usado como texto y con su valor claro por debajo de 4,5:1 sobre
 * algún fondo oscuro del sitio—:
 *
 *   1. Justo detrás del bloque claro que declara el token, añade su variante:
 *      `[data-theme='dark'] .container { --danger: #FCA5A5; }`. Valores medidos por píxel:
 *        --danger, --error → #FCA5A5 · --success → #86EFAC · --warning → #FFA726 (el de globals)
 *      La primera elección (#F98080 y #66BB6A) se hizo contra los fondos PLANOS del oscuro y
 *      cumplía en todos (≥ 4,71 y 4,96:1 sobre `--hover` #383838), pero el texto semántico suele
 *      ir sobre un tinte de su propio color, más claro: 4,25-4,42:1 en calculadora-matematica,
 *      glosario-fisica-quimica y comparador-vehiculos. Con éstos, 5,59-7,8:1 sobre esos tintes;
 *      son además los tonos que el catálogo ya usaba para ese texto en oscuro. El #EF5350 del
 *      --error oscuro de globals NO sirve: 3,36:1 sobre #383838.
 *
 *   2. Si el MISMO módulo usa ese token como FONDO de un texto blanco (botones «Eliminar»,
 *      distintivos), aclararlo en oscuro hundiría el blanco (#FCA5A5 con blanco: 1,90:1). Ahí
 *      añade un override oscuro del fondo con un tono oscuro del mismo color —#B91C1C, #15803D,
 *      #B45309, 5,02-6,47:1 con blanco—, salvo que el bloque ya tenga su propio fondo oscuro.
 *      Eran 28 bloques el 18/10/2026; en claro se quedan como estaban (otra población).
 *
 * Escritura atómica como la campaña de C0070: temporal → reanálisis (el censo del fichero tiene
 * que quedar sin defectos) → renombrado.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsearCss, esBlanco } from '../contraste-marca/clasificar.mjs';
import { semanticosSinOscuro } from './censo.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APLICAR = process.argv.includes('--aplicar');

export const TEXTO_OSCURO = { '--danger': '#FCA5A5', '--error': '#FCA5A5', '--success': '#86EFAC', '--warning': '#FFA726' };
export const FONDO_OSCURO = { '--danger': '#B91C1C', '--error': '#B91C1C', '--success': '#15803D', '--warning': '#B45309' };

const RE_OSCURO = /\[data-theme\s*=\s*['"]?dark['"]?\]/;
const quitarTema = (s) => s.replace(/:global\(\s*(\[data-theme[^\]]*\])\s*\)/g, '$1').replace(/\[data-theme[^\]]*\]\s*/g, '').replace(/\s+/g, ' ').trim();

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

const defectos = (css, tsx) => semanticosSinOscuro(css, tsx).filter((c) => c.texto && c.peor < 4.5);

/** Las inserciones { en, texto } de un fichero, o [] si no tiene defectos. */
export function plan(css, tsx) {
  const casos = defectos(css, tsx);
  if (!casos.length) return { inserciones: [], tokens: [], fondos: [] };
  const bloques = parsearCss(css);
  const nl = css.includes('\r\n') ? '\r\n' : '\n';
  const inserciones = [];

  // 1. Variante oscura del token, detrás del bloque claro que lo declara
  const porBloque = new Map();
  for (const c of casos) {
    const b = bloques.find((x) => x.decls.some((d) => d.prop === c.token && d.linea === c.linea));
    if (!b) throw new Error(`no encuentro el bloque de ${c.token} (L${c.linea})`);
    const e = porBloque.get(b) ?? { base: c.base, tokens: new Set() };
    e.tokens.add(c.token);
    porBloque.set(b, e);
  }
  for (const [b, { base, tokens }] of porBloque) {
    const decls = [...tokens].map((t) => `  ${t}: ${TEXTO_OSCURO[t]};`).join(nl);
    inserciones.push({
      en: b.fin,
      texto: `${nl}${nl}/* En oscuro servía el valor del claro como texto, por debajo de 4,5:1 (C0226).${nl}   Medido por píxel, también sobre el tinte de su propio color. */${nl}[data-theme='dark'] ${base} {${nl}${decls}${nl}}`,
    });
  }

  // 2. Fondo oscuro propio donde ese token hace de fondo de un texto blanco
  const cambiados = new Set(casos.map((c) => c.token));
  const conFondoOscuro = new Set(
    bloques.filter((b) => b.selector.split(',').every((p) => RE_OSCURO.test(p)) && b.decls.some((d) => /^background(-color)?$/.test(d.prop)))
      .flatMap((b) => b.selector.split(',').map((p) => quitarTema(p))),
  );
  const fondos = [];
  for (const b of bloques) {
    if (b.selector.split(',').some((p) => RE_OSCURO.test(p))) continue;
    const fondo = b.decls.find((d) => /^background(-color)?$/.test(d.prop) && [...cambiados].some((t) => new RegExp(`var\\(\\s*${t}\\s*[,)]`).test(d.valor)));
    const color = [...b.decls].reverse().find((d) => d.prop === 'color');
    if (!fondo || !color || !esBlanco(color.valor)) continue;
    const partes = b.selector.split(',').map((p) => p.trim());
    if (partes.every((p) => conFondoOscuro.has(quitarTema(p)))) continue;
    const token = [...cambiados].find((t) => new RegExp(`var\\(\\s*${t}\\s*[,)]`).test(fondo.valor));
    const selector = partes.map((p) => `[data-theme='dark'] ${p}`).join(`,${nl}`);
    inserciones.push({
      en: b.fin,
      texto: `${nl}${nl}/* Con ${token} aclarado en oscuro, el blanco de encima se hundía: fondo oscuro propio (C0226) */${nl}${selector} {${nl}  background: ${FONDO_OSCURO[token]};${nl}}`,
    });
    fondos.push(`${b.selector} (${token})`);
  }
  return { inserciones, tokens: casos.map((c) => c.token), fondos };
}

function aplicarInserciones(css, inserciones) {
  let salida = css;
  for (const ins of [...inserciones].sort((a, b) => b.en - a.en)) salida = salida.slice(0, ins.en) + ins.texto + salida.slice(ins.en);
  return salida;
}

// ─── Ejecución ────────────────────────────────────────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let ficheros = 0;
  let tokens = 0;
  let fondos = 0;
  const muestra = [];
  for (const h of ['app', 'components'].flatMap((a) => recorrer(path.join(RAIZ, a), '.module.css'))) {
    const rel = path.relative(RAIZ, h).replace(/\\/g, '/');
    const dirApp = rel.startsWith('app/') && rel.split('/').length > 2 ? path.join(RAIZ, ...rel.split('/').slice(0, 2)) : path.dirname(h);
    const tsx = recorrer(dirApp, '.tsx').map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    const css = fs.readFileSync(h, 'utf8');
    const p = plan(css, tsx);
    if (!p.inserciones.length) continue;
    ficheros++;
    tokens += p.tokens.length;
    fondos += p.fondos.length;
    if (muestra.length < 3) muestra.push({ rel, p, nuevo: aplicarInserciones(css, p.inserciones) });
    if (APLICAR) {
      const nuevo = aplicarInserciones(css, p.inserciones);
      if (defectos(nuevo, tsx).length) throw new Error(`${rel}: tras reparar quedan defectos`);
      if (parsearCss(nuevo).length !== parsearCss(css).length + p.inserciones.length) throw new Error(`${rel}: los bloques no cuadran`);
      fs.writeFileSync(`${h}.c0226-tmp`, nuevo);
      fs.renameSync(`${h}.c0226-tmp`, h);
    }
  }
  console.log(`\nC0226 — ${APLICAR ? 'APLICADO' : 'simulación'}: ${tokens} tokens con variante oscura nueva en ${ficheros} módulos · ${fondos} fondos oscuros propios`);
  for (const m of muestra) {
    console.log(`\n   ${m.rel}${m.p.fondos.length ? ` · fondos: ${m.p.fondos.join('; ')}` : ''}`);
    for (const ins of m.p.inserciones) console.log(ins.texto.split(/\r?\n/).filter(Boolean).map((l) => `      + ${l}`).join('\n'));
  }
}
