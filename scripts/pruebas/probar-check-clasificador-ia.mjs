#!/usr/bin/env node
/**
 * Script: probar-check-clasificador-ia.mjs  (`npm run clasificador-ia:probar-candado`)
 *
 * Le reinyecta a `check-clasificador-ia.mjs` el defecto REAL del 18/09/2026 —`cruce-seo.mjs`
 * sumando `modo='chatgpt'` sin lista blanca, que infló el canal IA de 359 a 439— y exige que
 * falle. Un candado que nunca se ha visto fallar no es un candado: es un adorno que devuelve OK.
 *
 * Todo ocurre sobre un ÁRBOL DESECHABLE (`--raiz`), copia de los cuatro ficheros reales: el
 * repositorio no se toca en ningún momento, así que la prueba no puede dejar a medias un
 * fichero de producción si se interrumpe.
 *
 * Los ocho casos, y por qué cada uno está aquí:
 *   1. El estado actual PASA — si no, todo lo demás no significa nada.
 *   2. El CASO DE ORIGEN falla (chatgpt sin lista blanca en `cruce-seo.mjs`).
 *   3. Un UA añadido en un solo sitio falla (la divergencia por exceso).
 *   4. Un UA retirado de un solo sitio falla (la divergencia por defecto).
 *   5. Una sintaxis que el candado no sabe leer FALLA en vez de aprobar en silencio — es la
 *      condición que separa «está bien» de «no he mirado» (el `tsc` ciego del 14/08/2026).
 *   6. El escape documentado funciona.
 *   7. Sin `cruce-seo.mjs` (que es gitignored: así se ve el árbol en Vercel y en un clon nuevo)
 *      PASA con aviso. Si este caso fallara, el candado rompería todos los despliegues.
 *   8. El referrer `'chatgpt.com'` NO dispara la regla 2: es una visita con clic, no el modo.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts/check-clasificador-ia.mjs');

const FICHEROS = [
  'lib/analytics-rollup.ts',
  'scripts/digest-diario.mjs',
  'scripts/analizar-ia-paginas.mjs',
  'scripts/cruce-seo.mjs',
];

const casos = [];
const anotar = (nombre, ok, detalle = '') => casos.push({ nombre, ok, detalle });

/** Monta un árbol desechable con copias de los cuatro ficheros y devuelve su raíz. */
function montar() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clasif-ia-'));
  for (const f of FICHEROS) {
    const origen = path.join(RAIZ, f);
    if (!fs.existsSync(origen)) continue; // cruce-seo.mjs puede no estar (gitignored)
    const destino = path.join(dir, f);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(origen, destino);
  }
  return dir;
}

function candado(raiz) {
  const r = spawnSync(process.execPath, [CANDADO, '--raiz', raiz], { encoding: 'utf8' });
  return { codigo: r.status, salida: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const leer = (raiz, f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const escribir = (raiz, f, t) => fs.writeFileSync(path.join(raiz, f), t);

/** Sustituye exigiendo que el ancla exista: un caso que no se monta no puede dar por bueno nada. */
function sustituir(raiz, f, ancla, reemplazo) {
  const t = leer(raiz, f);
  if (!t.includes(ancla)) return false;
  escribir(raiz, f, t.replace(ancla, reemplazo));
  return true;
}

const hayCruce = fs.existsSync(path.join(RAIZ, 'scripts/cruce-seo.mjs'));

// ── 1. El estado actual pasa ──────────────────────────────────────────────────
{
  const raiz = montar();
  const { codigo, salida } = candado(raiz);
  anotar('el estado actual del repositorio PASA', codigo === 0, salida.trim().split('\n').pop());
  fs.rmSync(raiz, { recursive: true, force: true });
}

// ── 2. EL CASO DE ORIGEN: chatgpt sin lista blanca en cruce-seo.mjs ───────────
if (hayCruce) {
  const raiz = montar();
  // Se deshace la reparación del 18/09 en sus TRES sitios, para que la copia quede como estaba:
  // la declaración de la lista, la columna que la consulta pedía y la suma que no filtraba.
  const t = leer(raiz, 'scripts/cruce-seo.mjs')
    .replace(/const UA_IA_OK = `[\s\S]*?`;/, '')
    .replace(/, SUM\(CASE WHEN \$\{UA_IA_OK\} THEN 1 ELSE 0 END\) nUaIA/, '')
    .replace(
      // `\s+else`, no `\s*\n\s*else`: el `\s*` es voraz y se come ya el salto de línea, así que
      // exigir un `\n` detrás no casaba nunca y el caso se montaba en falso (visto al escribirlo).
      /if \(modo === 'referral-ia'\) a\.ia30 \+= n;\s+else if \(modo === 'chatgpt'\) a\.ia30 \+= Number\(r\.nUaIA \|\| 0\);/,
      "if (modo === 'referral-ia' || modo === 'chatgpt') a.ia30 += n;"
    );
  // Se comprueba que desapareció la DECLARACIÓN, no toda mención: el nombre sigue citado en el
  // comentario de cabecera, y exigir su ausencia total daba un montaje en falso silencioso.
  const montado = !/const UA_IA_OK\s*=/.test(t)
    && !/nUaIA/.test(t)
    && /'referral-ia' \|\| modo === 'chatgpt'/.test(t);
  escribir(raiz, 'scripts/cruce-seo.mjs', t);
  const { codigo, salida } = candado(raiz);
  anotar(
    'CASO DE ORIGEN (18/09/2026): chatgpt sin lista blanca en cruce-seo.mjs → falla',
    montado && codigo === 1 && /cruce-seo/.test(salida),
    montado ? `código ${codigo}` : '⚠️ el caso NO se pudo montar: las anclas han cambiado'
  );
  fs.rmSync(raiz, { recursive: true, force: true });
} else {
  anotar('CASO DE ORIGEN: cruce-seo.mjs no está en este árbol', true, 'omitido (gitignored)');
}

// ── 3. Un UA añadido en un solo sitio ─────────────────────────────────────────
{
  const raiz = montar();
  const ok = sustituir(
    raiz, 'scripts/analizar-ia-paginas.mjs',
    '/^(Claude-User|openai-mcp|MistralAI-MCPClient)/i',
    '/^(Claude-User|openai-mcp|MistralAI-MCPClient|perplexity-mcp)/i'
  );
  const { codigo, salida } = candado(raiz);
  anotar('un UA añadido en UNA sola copia → falla', ok && codigo === 1 && /SOBRAN/.test(salida),
    ok ? `código ${codigo}` : 'no se pudo montar');
  fs.rmSync(raiz, { recursive: true, force: true });
}

// ── 4. Un UA retirado de un solo sitio ────────────────────────────────────────
{
  const raiz = montar();
  const ok = sustituir(
    raiz, 'scripts/digest-diario.mjs',
    "{ ua: 'MistralAI-MCPClient', nombre: 'Mistral' },", ''
  );
  const { codigo, salida } = candado(raiz);
  anotar('un UA retirado de UNA sola copia → falla', ok && codigo === 1 && /FALTAN/.test(salida),
    ok ? `código ${codigo}` : 'no se pudo montar');
  fs.rmSync(raiz, { recursive: true, force: true });
}

// ── 5. Sintaxis desconocida: tiene que FALLAR, no aprobar ─────────────────────
{
  const raiz = montar();
  const ok = sustituir(
    raiz, 'scripts/analizar-ia-paginas.mjs',
    'const MCP_CLIENTES_IA = /^(Claude-User|openai-mcp|MistralAI-MCPClient)/i;',
    'const CLIENTES = new Map([["Claude-User", 1], ["openai-mcp", 1], ["MistralAI-MCPClient", 1]]);'
  );
  const { codigo, salida } = candado(raiz);
  anotar(
    'una sintaxis que no sabe leer → FALLA (no aprueba en silencio)',
    ok && codigo === 1 && /no sé leer/.test(salida),
    ok ? `código ${codigo}` : 'no se pudo montar'
  );
  fs.rmSync(raiz, { recursive: true, force: true });
}

// ── 6. El escape documentado funciona ─────────────────────────────────────────
if (hayCruce) {
  const raiz = montar();
  const t = leer(raiz, 'scripts/cruce-seo.mjs')
    .replace(/const UA_IA_OK = `[\s\S]*?`;/, "const UA_IA_OK = `LIKE 'Claude-User%' OR LIKE 'openai-mcp%' OR LIKE 'MistralAI-MCPClient%'`;")
    .replace(
      /if \(modo === 'referral-ia'\) a\.ia30 \+= n;/,
      "// clasificador-ia-ok: caso de prueba del probador\n      if (modo === 'referral-ia' || modo === 'chatgpt') a.ia30 += n;"
    );
  escribir(raiz, 'scripts/cruce-seo.mjs', t);
  const { codigo } = candado(raiz);
  anotar('el escape `clasificador-ia-ok:` silencia la regla 2', codigo === 0, `código ${codigo}`);
  fs.rmSync(raiz, { recursive: true, force: true });
} else {
  anotar('escape: cruce-seo.mjs no está en este árbol', true, 'omitido');
}

// ── 7. EL ÁRBOL REAL DE VERCEL: solo lo que git tiene versionado ──────────────
//
// Se le pregunta a git cuáles de los cuatro viajan en el clon, en vez de retirar a mano el que
// uno CREA que falta. La primera versión de esta prueba quitaba solo `cruce-seo.mjs`, daba verde,
// y el despliegue falló igualmente: `digest-diario.mjs` también está gitignored y el candado lo
// exigía. La prueba compartía la suposición equivocada del candado, así que no podía cazarla.
{
  const raiz = montar();
  const versionados = new Set(
    FICHEROS.filter((f) => spawnSync('git', ['ls-files', '--error-unmatch', f],
      { cwd: RAIZ, encoding: 'utf8' }).status === 0)
  );
  const omitidos = FICHEROS.filter((f) => !versionados.has(f));
  for (const f of omitidos) fs.rmSync(path.join(raiz, f), { force: true });

  const { codigo, salida } = candado(raiz);
  anotar(
    `el árbol REAL de Vercel (${versionados.size} de ${FICHEROS.length} versionados) → PASA con aviso`,
    codigo === 0 && (omitidos.length === 0 || /no está en el árbol/.test(salida)),
    omitidos.length ? `ausentes: ${omitidos.join(', ')} · código ${codigo}` : `código ${codigo}`
  );
  fs.rmSync(raiz, { recursive: true, force: true });
}

// ── 8. El referrer 'chatgpt.com' no es el modo: no debe disparar ──────────────
{
  const raiz = montar();
  // `analytics-rollup.ts` ya contiene `ref === 'chatgpt.com'`; se comprueba que sigue pasando
  // incluso si se le añade otra línea con el referrer y nada de lista blanca alrededor.
  const t = leer(raiz, 'lib/analytics-rollup.ts').replace(
    "if (ref === 'chatgpt.com') return 'chatgpt';",
    "if (ref === 'chatgpt.com') return 'chatgpt';\n    // otra mención suelta del referrer, sin lista blanca cerca:\n    if (ref === 'chatgpt.com/share') return 'chatgpt';"
  );
  escribir(raiz, 'lib/analytics-rollup.ts', t);
  const { codigo } = candado(raiz);
  anotar("el referrer 'chatgpt.com' NO dispara la regla 2", codigo === 0, `código ${codigo}`);
  fs.rmSync(raiz, { recursive: true, force: true });
}

// ── Resultado ─────────────────────────────────────────────────────────────────

console.log('\n🔒 Trampas al candado del clasificador IA\n');
let fallan = 0;
for (const c of casos) {
  console.log(`   ${c.ok ? '✅' : '❌'} ${c.nombre}${c.detalle ? `  — ${c.detalle}` : ''}`);
  if (!c.ok) fallan++;
}
console.log('');
if (fallan) {
  console.error(`❌ ${fallan} de ${casos.length} trampas NO se comportaron como se esperaba.\n`);
  process.exit(1);
}
console.log(`✅ Las ${casos.length} trampas se comportan como se espera: el candado ve lo que dice ver.\n`);
