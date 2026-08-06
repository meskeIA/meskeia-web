#!/usr/bin/env node
/**
 * check-memoria.mjs — candado de higiene de la memoria del proyecto.
 *
 * Verifica la SALIDA, no que un proceso terminara: cuenta ficheros, comprueba
 * las condiciones negativas (lo que NO debe existir) y falla con exit 1.
 *
 * Uso:  npm run check:memoria
 *       node scripts/check-memoria.mjs --verbose
 *       MEMORIA_DIR=/otra/ruta node scripts/check-memoria.mjs
 *
 * Comprobaciones:
 *   1. Ningún fichero huérfano (todos enlazados desde MEMORY.md)
 *   2. Ningún enlace de MEMORY.md apunta a un fichero inexistente
 *   3. Ningún wikilink [[x]] sin destino
 *   4. `name:` del frontmatter == nombre de fichero
 *   5. Frontmatter mínimo presente (name, description, type)
 *   6. Punteros externos vivos (agenda.json, _private/, scripts/, código, CLAUDE.md)
 *   7. MEMORY.md por debajo del umbral de lectura
 *   8. Ninguna autorreferencia [[a-sí-mismo]]
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const VERBOSE = process.argv.includes('--verbose');
const REPO = path.resolve(import.meta.dirname, '..');

// El índice deja de leerse entero a partir de ~24,4 KB; el hook avisa en 17,1 KB.
const UMBRAL_AVISO = 17_100;
const UMBRAL_ERROR = 24_400;

// Tokens con forma de memoria que NO lo son (nombres de campo, variables…)
const FALSOS_POSITIVOS = new Set([
  'user_agent', 'user_id', 'user_prompt', 'user_config', 'user_login', 'user_path',
  'user_system_prompt', 'project_id', 'project_name', 'project_type', 'project_root',
]);

// Dónde se busca a memorias citadas desde fuera de la carpeta
const FUENTES_EXTERNAS = [
  path.join(os.homedir(), 'Mis Desarrollos', 'Vigilancia', 'Centro de Mando', 'agenda.json'),
  path.join(os.homedir(), '.claude', 'CLAUDE.md'),
  path.join(REPO, 'CLAUDE.md'),
  path.join(REPO, '_private'),
  path.join(REPO, 'scripts'),
  path.join(REPO, 'components'),
  path.join(REPO, 'lib'),
];

function localizarMemoria() {
  if (process.env.MEMORIA_DIR) return process.env.MEMORIA_DIR;
  const proyectos = path.join(os.homedir(), '.claude', 'projects');
  const derivada = path.join(proyectos, REPO.replace(/[:\\/]/g, '-'), 'memory');
  if (fs.existsSync(path.join(derivada, 'MEMORY.md'))) return derivada;
  // Fallback: cualquier carpeta de proyecto cuyo nombre acabe en el del repo
  if (fs.existsSync(proyectos)) {
    const base = path.basename(REPO);
    for (const d of fs.readdirSync(proyectos)) {
      const cand = path.join(proyectos, d, 'memory');
      if (d.endsWith(base) && fs.existsSync(path.join(cand, 'MEMORY.md'))) return cand;
    }
  }
  return null;
}

function ficherosDe(destino) {
  if (!fs.existsSync(destino)) return [];
  if (fs.statSync(destino).isFile()) return [destino];
  const salida = [];
  for (const entrada of fs.readdirSync(destino, { withFileTypes: true })) {
    const p = path.join(destino, entrada.name);
    if (entrada.isDirectory()) salida.push(...ficherosDe(p));
    else if (/\.(md|mjs|js|ts|tsx|json)$/.test(entrada.name)) salida.push(p);
  }
  return salida;
}

const DIR = localizarMemoria();
if (!DIR) {
  console.error('✖ No se encuentra la carpeta de memoria. Define MEMORIA_DIR.');
  process.exit(1);
}

const errores = [];
const avisos = [];

const indice = fs.readFileSync(path.join(DIR, 'MEMORY.md'), 'utf8');
const bytesIndice = Buffer.byteLength(indice, 'utf8');
const ficheros = fs.readdirSync(DIR).filter(f => f.endsWith('.md') && f !== 'MEMORY.md');
const slugs = new Set(ficheros.map(f => f.replace(/\.md$/, '')));

// --- 1 y 2: enlaces del índice ---
const enlazados = new Set([...indice.matchAll(/\]\(([^)]+\.md)\)/g)].map(m => m[1]));
for (const f of ficheros) {
  if (!enlazados.has(f)) errores.push(`Huérfano (sin enlace en MEMORY.md): ${f}`);
}
for (const e of enlazados) {
  if (!ficheros.includes(e)) errores.push(`MEMORY.md enlaza a un fichero inexistente: ${e}`);
}

// --- 3, 4, 5 y 8: contenido de cada ficha ---
for (const f of ficheros) {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const slug = f.replace(/\.md$/, '');

  const name = (raw.match(/^name:\s*(.*)$/m) || [])[1]?.trim().replace(/^["']|["']$/g, '');
  if (!name) errores.push(`Sin campo name: ${f}`);
  else if (name !== slug) errores.push(`name: desalineado en ${f} → "${name}"`);

  if (!/^description:\s*\S/m.test(raw)) errores.push(`Sin description: ${f}`);
  if (!/^\s*type:\s*(user|feedback|project|reference)\s*$/m.test(raw)) {
    avisos.push(`type ausente o no estándar: ${f}`);
  }

  for (const m of raw.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const destino = m[1].trim();
    if (destino === slug) errores.push(`Autorreferencia [[${destino}]] en ${f}`);
    else if (!slugs.has(destino)) errores.push(`Wikilink roto: ${f} → [[${destino}]]`);
  }
}

// --- 6: punteros externos vivos ---
const rotosExternos = new Map();
for (const fuente of FUENTES_EXTERNAS) {
  for (const fichero of ficherosDe(fuente)) {
    let texto;
    try { texto = fs.readFileSync(fichero, 'utf8'); } catch { continue; }
    for (const m of texto.matchAll(/\b(?:project|feedback|reference|user)_[a-z0-9_-]+/g)) {
      const token = m[0].replace(/\.md$/, '');
      if (FALSOS_POSITIVOS.has(token)) continue;
      // Vale si existe tal cual, o si es el prefijo de un fichero real (token cortado por un guion)
      if (slugs.has(token) || [...slugs].some(s => s.startsWith(token))) continue;
      const rel = path.relative(os.homedir(), fichero);
      if (!rotosExternos.has(token)) rotosExternos.set(token, new Set());
      rotosExternos.get(token).add(rel);
    }
  }
}
for (const [token, donde] of rotosExternos) {
  errores.push(`Puntero externo a una memoria que ya no existe: ${token} (en ${[...donde].join(', ')})`);
}

// --- 7: tamaño del índice ---
if (bytesIndice > UMBRAL_ERROR) errores.push(`MEMORY.md ${bytesIndice} B supera el límite de lectura (${UMBRAL_ERROR} B)`);
else if (bytesIndice > UMBRAL_AVISO) avisos.push(`MEMORY.md ${bytesIndice} B supera el objetivo (${UMBRAL_AVISO} B) — toca consolidar`);

// --- Informe ---
const pct = ((bytesIndice / UMBRAL_ERROR) * 100).toFixed(0);
console.log(`\n🧾 Memoria del proyecto — ${path.relative(os.homedir(), DIR)}`);
console.log(`   ${ficheros.length} fichas · MEMORY.md ${(bytesIndice / 1024).toFixed(1)} KB (${pct}% del límite de lectura) · ${enlazados.size} enlaces`);

if (VERBOSE) {
  const porTipo = {};
  for (const f of ficheros) porTipo[f.split('_')[0]] = (porTipo[f.split('_')[0]] || 0) + 1;
  console.log(`   Por tipo: ${Object.entries(porTipo).map(([t, n]) => `${t} ${n}`).join(' · ')}`);
  console.log(`   Punteros externos comprobados: ${FUENTES_EXTERNAS.filter(fs.existsSync).length}/${FUENTES_EXTERNAS.length} fuentes`);
}

if (avisos.length) {
  console.log(`\n⚠️  ${avisos.length} aviso(s):`);
  avisos.forEach(a => console.log(`   · ${a}`));
}
if (errores.length) {
  console.log(`\n✖ ${errores.length} error(es):`);
  errores.forEach(e => console.log(`   · ${e}`));
  console.log('');
  process.exit(1);
}
console.log(`\n✅ Sin huérfanos, sin enlaces rotos, sin punteros externos muertos.\n`);
