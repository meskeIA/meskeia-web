#!/usr/bin/env node
/**
 * check-motores-consumidos.mjs — que ningún motor de cálculo se quede sin lector
 *
 * Ejecutar:  npm run check:motores            (lo ejecuta también `npm run build`)
 *            npm run check:motores -- --lista  (imprime quién consume cada motor)
 *
 * QUÉ EXIGE
 * ─────────
 * Que cada fichero de `lib/calculadoras/` lo alcance ALGUIEN: una app, una API route, un
 * servidor MCP, otro motor, un componente o un test. Uno solo basta. Si un motor no tiene
 * ningún lector, el build se rompe nombrándolo.
 *
 * Y exige lo simétrico, que es lo que hace que el primero no se pueda burlar con un comentario:
 * si la cabecera de un motor declara «Usada por: MCP server (calcular_x)», esa tool tiene que
 * estar registrada de verdad en `app/api/mcp/route.ts` o en `app/api/mcp/delegum/route.ts`.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del commit `49b4e691` (07/06/2026), que reenfocó el MCP de meskeIA al dominio «vida» y retiró
 * 142 tools fiscales-laborales porque pasaban a ser competencia de Delegum. Su mensaje afirmaba:
 *
 *     «NO se toca lib/calculadoras/: las calculadoras retiradas siguen vivas en la web y en
 *      los GPTs (/api/chatgpt/*).»
 *
 * De las 142, eso era cierto para 55 y **falso para 87**: 3 las llamaba una app, 52 vivían en
 * `/api/chatgpt/`, y 87 no las alcanzaba ya nada. Nadie lo comprobó, y nada avisó. El residuo
 * quedó a la vista quince meses —`app/api/mcp/route.ts` conservaba los rótulos «── Lote P/Q/R/S/T»
 * sin ningún import debajo— sin que eso rompiera nada.
 *
 * Lo que cuesta no enterarse no es teórico: el 13/08/2026 se reparó `permisoParental` (calculaba
 * con las 16 semanas derogadas el 31/07/2025) y `excedenteCotizacionSS`; el 09/09/2026, ocho más
 * en la pasada de motores compartidos. Once reparaciones de normativa sobre código que no podía
 * llegar a nadie por ninguna vía.
 *
 * Los 86 se retiraron el 10/09/2026 —`herenciaConjunta` se conservó porque tiene test y lo cita
 * `sucesiones.ts`—, así que este candado nace con el pasivo a cero. Es la condición que lo hace
 * viable: puede romper el build de verdad, no solo avisar como `check:parser` o `check:a11y-jsx`.
 *
 * POR QUÉ NO BASTABA CON MIRAR LA CABECERA
 * ────────────────────────────────────────
 * `scripts/audit-motores-fiscales.mjs` ya dejó escrito el 07/09/2026 que «la cabecera "Usada por:
 * MCP server (...)" NO demuestra que la tool exista: es un comentario, y en 107 casos miente».
 * Por eso aquí el criterio principal es el import real, y la coherencia de la cabecera se
 * comprueba **además**, para que un motor no pueda parecer vivo por lo que dice de sí mismo.
 *
 * ESCAPE
 * ──────
 * `// motor-ok: <razón>` en las primeras 40 líneas del motor. Para el caso legítimo de una pieza
 * que existe sin lector todavía —una API a medio publicar—. Exige escribir la razón, que es lo
 * que convierte la excepción en una decisión y no en un descuido.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LISTA = process.argv.includes('--lista');

const DIR_MOTORES = path.join(RAIZ, 'lib/calculadoras');
const ROUTERS_MCP = ['app/api/mcp/route.ts', 'app/api/mcp/delegum/route.ts'];

// Dónde se busca. `lib/` está incluido a propósito: un motor que solo consume otro motor sigue
// teniendo lector, y su cadena acaba en algo que sí se sirve.
const AMBITOS = ['app', 'components', 'lib', 'server', 'data', 'tests', 'scripts'];

function recorrer(dir, salida = []) {
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch { return salida; }
  for (const e of entradas) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, salida);
    else if (/\.(ts|tsx|js|mjs)$/.test(e.name)) salida.push(p);
  }
  return salida;
}

const motores = fs.readdirSync(DIR_MOTORES).filter((f) => f.endsWith('.ts')).map((f) => f.replace(/\.ts$/, ''));

const ficheros = [];
for (const a of AMBITOS) recorrer(path.join(RAIZ, a), ficheros);

const contenidos = new Map();
for (const f of ficheros) {
  const rel = f.replace(/\\/g, '/').replace(RAIZ.replace(/\\/g, '/') + '/', '');
  contenidos.set(rel, fs.readFileSync(f, 'utf8'));
}

/** Tools realmente registradas en los dos servidores MCP: `servidor.tool('nombre', ...)`. */
const toolsRegistradas = new Set();
for (const r of ROUTERS_MCP) {
  const src = contenidos.get(r);
  if (!src) continue;
  for (const m of src.matchAll(/\.tool\(\s*\n?\s*['"]([a-z0-9_]+)['"]/g)) toolsRegistradas.add(m[1]);
}

const sinLector = [];
const cabeceraMiente = [];
const consumidores = new Map();

for (const motor of motores) {
  const propio = `lib/calculadoras/${motor}.ts`;
  const src = contenidos.get(propio) ?? '';

  // Escape declarado, con razón escrita.
  const escape = src.split('\n').slice(0, 40).find((l) => /\/\/\s*motor-ok:\s*\S+/.test(l));

  const lectores = [];
  for (const [rel, c] of contenidos) {
    if (rel === propio) continue;
    // Import por alias (@/lib/calculadoras/x) o relativo (./x, ../calculadoras/x)
    if (new RegExp(`calculadoras/${motor}(['"\`/])`).test(c)) { lectores.push(rel); continue; }
    if (rel.startsWith('lib/calculadoras/') && new RegExp(`from\\s+['"]\\./${motor}['"]`).test(c)) lectores.push(rel);
  }
  consumidores.set(motor, lectores);

  if (lectores.length === 0 && !escape) sinLector.push(motor);

  // La cabecera no puede prometer una tool que no existe.
  const declara = src.match(/Usada por:.*?\(([a-z0-9_,\s]+)\)/);
  if (declara) {
    const prometidas = declara[1].split(',').map((s) => s.trim()).filter(Boolean);
    const fantasmas = prometidas.filter((t) => t.length > 4 && !toolsRegistradas.has(t));
    if (fantasmas.length && !escape) cabeceraMiente.push({ motor, fantasmas });
  }
}

if (LISTA) {
  for (const motor of motores) {
    const l = consumidores.get(motor) ?? [];
    console.log(`${motor.padEnd(34)} ${String(l.length).padStart(2)}  ${l.slice(0, 3).join(', ')}${l.length > 3 ? ` (+${l.length - 3})` : ''}`);
  }
  console.log(`\n${motores.length} motores · ${toolsRegistradas.size} tools registradas en los dos MCP`);
  process.exit(0);
}

let falla = false;

if (sinLector.length) {
  falla = true;
  console.error(`\n✗ MOTORES SIN LECTOR: ${sinLector.length} de ${motores.length}\n`);
  console.error('  No los alcanza ninguna app, API, MCP, motor, componente ni test, así que nadie');
  console.error('  puede recibir un número salido de ahí — pero sí se paga su mantenimiento.\n');
  for (const m of sinLector) console.error(`    lib/calculadoras/${m}.ts`);
  console.error('\n  Conéctalo a quien deba usarlo, retíralo, o declara «// motor-ok: <razón>» en él.');
}

if (cabeceraMiente.length) {
  falla = true;
  console.error(`\n✗ CABECERA QUE PROMETE UNA TOOL INEXISTENTE: ${cabeceraMiente.length}\n`);
  console.error('  «Usada por: MCP server (x)» y esa tool no está registrada en ningún router.');
  console.error('  Es lo que hizo que 87 motores pareciesen vivos durante quince meses.\n');
  for (const { motor, fantasmas } of cabeceraMiente) {
    console.error(`    lib/calculadoras/${motor}.ts → ${fantasmas.join(', ')}`);
  }
  console.error('\n  Registra la tool o corrige la cabecera para que diga quién lo usa de verdad.');
}

if (falla) process.exit(1);

console.log(`✓ motores: los ${motores.length} tienen lector, y ninguna cabecera promete una tool que no existe`);
