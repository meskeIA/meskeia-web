#!/usr/bin/env node
/**
 * frontera-contador.mjs — el recuento de la frontera de decisión (CLAUDE.md global §9).
 *
 * La frontera crece por evidencia, no por impresión: un tipo de decisión sube de nivel cuando el
 * usuario ha aceptado 5 veces SEGUIDAS la recomendación sin cambiarla Y hay un candado que lo
 * comprueba; baja en cuanto el usuario deshace o corrige una decisión mía de ese tipo. Ninguna de
 * las dos cosas puede confiarse a la memoria de nadie (Candados de juicio §3: el contador va
 * IMPRESO en la salida), así que este script las cuenta de donde quedan escritas:
 *
 *   1. Las preguntas: cada AskUserQuestion de nivel 3 lleva `metadata.source: "frontera:<tipo>"`.
 *      Se leen de las transcripciones de Claude Code (~/.claude/projects/*meskeia-web/*.jsonl).
 *   2. Las decisiones de nivel 2: línea final `Frontera: N2 <tipo> — <por qué>` en el commit.
 *      Los descensos, `Frontera: descenso <tipo> — <qué se corrigió>`. Un `git revert` de un
 *      commit N2 cuenta como corrección aunque nadie escriba la línea.
 *
 * Caso de origen (05/10/2026): al minar 290 conversaciones salieron 51 de 55 recomendaciones
 * aceptadas tal cual, y frases como «no tengo criterio suficiente, aplica la que pienses». Ese
 * recuento se hizo a mano con un extractor de usar y tirar; esto es ese extractor convertido en
 * instrumento, con la etiqueta para que el «tipo» no haya que adivinarlo después.
 *
 * Uso:
 *   node scripts/frontera-contador.mjs              → informe desde el inicio de la frontera
 *   node scripts/frontera-contador.mjs --historico  → además, las preguntas SIN etiqueta de
 *                                                     antes, agrupadas por su `header` (orientativo)
 *
 * Solo lee. No escribe nada ni sale del PC.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const INICIO = '2026-10-05';          // día en que se acordó la frontera y empezó el etiquetado
const UMBRAL_ASCENSO = 5;
const HISTORICO = process.argv.includes('--historico');
const REPO = process.cwd();

// Respuestas libres que devuelven la decisión: cuentan como aceptación (el usuario delega)
// El usuario escribe deprisa: «no tengo creiterio» (21/09/2026) tiene que casar igual que «criterio»
const DECIDE_TU = /no tengo (S+ )?crS*terio|como (mejor )?consideres|(la|lo) que (tú |tu )?(consideres|pienses|veas)|qu[eé] me aconsejas|cu[aá]l es tu recomendaci[oó]n|si (as[ií] )?lo ves|si piensas que|decide t[uú]/i;

// ── 1. Preguntas de las transcripciones ─────────────────────────────────────────────────────
function directoriosDeTranscripciones() {
  const base = path.join(os.homedir(), '.claude', 'projects');
  if (!existsSync(base)) return [];
  return readdirSync(base).filter((d) => /meskeia-web$/i.test(d)).map((d) => path.join(base, d));
}

function textoDe(contenido) {
  if (typeof contenido === 'string') return contenido;
  if (!Array.isArray(contenido)) return '';
  return contenido.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
}

function clasificar(pregunta, respuesta) {
  const conRecomendacion = (pregunta.options || []).some((o) => /recom/i.test(o.label));
  if (/doesn't want to proceed|tool use was rejected/i.test(respuesta)) return { resultado: 'rechazada', elegida: '', conRecomendacion };
  // Formato: Your questions have been answered: "<pregunta>"="<respuesta>", "<pregunta>"="<respuesta>". …
  const marca = `"${pregunta.question}"="`;
  const i = respuesta.indexOf(marca);
  const elegida = i >= 0 ? respuesta.slice(i + marca.length).split('"')[0] : '';
  const opciones = pregunta.options || [];
  const recomendada = opciones.find((o) => /recom/i.test(o.label));
  if (recomendada && elegida === recomendada.label) return { resultado: 'recomendada', elegida, conRecomendacion };
  if (opciones.some((o) => o.label === elegida)) return { resultado: recomendada ? 'otra' : 'opcion', elegida, conRecomendacion };
  if (DECIDE_TU.test(elegida)) return { resultado: 'decide-tu', elegida, conRecomendacion };
  return { resultado: 'libre', elegida, conRecomendacion };
}

function leerPreguntas() {
  const preguntas = [];
  for (const dir of directoriosDeTranscripciones()) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl'))) {
      const pendientes = new Map();
      for (const linea of readFileSync(path.join(dir, f), 'utf8').split('\n')) {
        if (!linea.trim()) continue;
        let e;
        try { e = JSON.parse(linea); } catch { continue; }   // la última línea de una sesión viva puede llegar a medias
        if (e.isSidechain || !e.message || !Array.isArray(e.message.content)) continue;
        for (const c of e.message.content) {
          if (e.type === 'assistant' && c.type === 'tool_use' && c.name === 'AskUserQuestion') {
            pendientes.set(c.id, { fecha: (e.timestamp || '').slice(0, 10), ts: e.timestamp || '', input: c.input || {} });
          }
          if (e.type === 'user' && c.type === 'tool_result' && pendientes.has(c.tool_use_id)) {
            const p = pendientes.get(c.tool_use_id);
            pendientes.delete(c.tool_use_id);
            const respuesta = typeof c.content === 'string' ? c.content : textoDe(c.content);
            const fuente = String(p.input.metadata?.source || '');
            const tipo = fuente.startsWith('frontera:') ? fuente.slice('frontera:'.length).trim() : '';
            for (const q of p.input.questions || []) {
              preguntas.push({ ...p, tipo, header: q.header || '', pregunta: q.question || '', ...clasificar(q, respuesta) });
            }
          }
        }
      }
    }
  }
  return preguntas.sort((a, b) => a.ts.localeCompare(b.ts));
}

// ── 2. Decisiones de nivel 2 en git ─────────────────────────────────────────────────────────
function leerCommits() {
  let salida = '';
  try {
    salida = execFileSync('git', ['log', `--since=${INICIO}`, '--format=%H%x1f%ad%x1f%s%x1f%b%x1e', '--date=short'],
      { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch {
    console.log('⚠️  No se pudo leer git en', REPO, '— la parte de decisiones N2 queda sin contar.');
    return { n2: [], descensos: [] };
  }
  const commits = salida.split('\x1e').map((r) => r.trim()).filter(Boolean).map((r) => {
    const [sha, fecha, asunto, cuerpo = ''] = r.split('\x1f');
    return { sha, fecha, asunto, cuerpo };
  });
  const n2 = [];
  const descensos = [];
  for (const c of commits) {
    for (const m of c.cuerpo.matchAll(/^Frontera:\s*N2\s+([^\s—-]+)\s*[—-]?\s*(.*)$/gim)) n2.push({ ...c, tipo: m[1], porque: m[2] });
    for (const m of c.cuerpo.matchAll(/^Frontera:\s*descenso\s+([^\s—-]+)\s*[—-]?\s*(.*)$/gim)) descensos.push({ ...c, tipo: m[1], porque: m[2] });
  }
  // Un revert de un commit N2 es una corrección aunque nadie escriba la línea de descenso
  for (const c of commits) {
    const m = c.cuerpo.match(/This reverts commit ([0-9a-f]{7,40})/i);
    if (!m) continue;
    const deshecho = n2.find((d) => d.sha.startsWith(m[1]) || m[1].startsWith(d.sha));
    if (deshecho) descensos.push({ ...c, tipo: deshecho.tipo, porque: `revert de ${deshecho.sha.slice(0, 8)} (${deshecho.asunto})` });
  }
  return { n2, descensos };
}

// ── Informe ─────────────────────────────────────────────────────────────────────────────────
const ACEPTA = new Set(['recomendada', 'decide-tu']);
const ETIQUETA = { recomendada: '✓', 'decide-tu': '✓?', otra: '✗', opcion: '·', libre: '…', rechazada: '⛔' };

function racha(serie) {
  let n = 0;
  for (let i = serie.length - 1; i >= 0 && ACEPTA.has(serie[i].resultado); i--) n++;
  return n;
}

function imprimirGrupo(titulo, grupos) {
  if (!grupos.size) { console.log(`   (ninguna)`); return; }
  const filas = [...grupos.entries()].sort((a, b) => racha(b[1]) - racha(a[1]) || b[1].length - a[1].length);
  for (const [tipo, serie] of filas) {
    const r = racha(serie);
    const cuenta = (k) => serie.filter((s) => s.resultado === k).length;
    const marcas = serie.slice(-10).map((s) => ETIQUETA[s.resultado]).join(' ');
    const aviso = r >= UMBRAL_ASCENSO ? `  ⬆️  CANDIDATO A ASCENSO (${titulo === 'etiquetadas' ? 'proponer al usuario si hay candado' : 'orientativo'})` : '';
    console.log(`   ${tipo.padEnd(26)} ${String(serie.length).padStart(3)} · racha ${r}/${UMBRAL_ASCENSO} · ` +
      `recom. ${cuenta('recomendada')} · decide-tú ${cuenta('decide-tu')} · otra ${cuenta('otra')} · libre ${cuenta('libre')} · rechazo ${cuenta('rechazada')}   [${marcas}]${aviso}`);
  }
}

const preguntas = leerPreguntas();
const desde = preguntas.filter((p) => p.fecha >= INICIO);
const etiquetadas = new Map();
for (const p of desde.filter((x) => x.tipo)) {
  if (!etiquetadas.has(p.tipo)) etiquetadas.set(p.tipo, []);
  etiquetadas.get(p.tipo).push(p);
}
const sinEtiqueta = desde.filter((p) => !p.tipo);

console.log(`\nFRONTERA DE DECISIÓN — recuento desde el ${INICIO.split('-').reverse().join('/')}`);
console.log(`Leyenda de la serie (últimas 10): ✓ recomendada · ✓? «decide tú» · ✗ otra opción · · sin recomendación · … texto libre · ⛔ rechazada\n`);

console.log(`1) Preguntas de nivel 3 etiquetadas («frontera:<tipo>»): ${desde.length - sinEtiqueta.length}`);
imprimirGrupo('etiquetadas', etiquetadas);
if (sinEtiqueta.length) {
  console.log(`\n   ⚠️  ${sinEtiqueta.length} pregunta(s) SIN etiqueta desde el inicio: no entran en ninguna racha.`);
  for (const p of sinEtiqueta.slice(-5)) console.log(`      ${p.fecha} · ${p.header} · ${p.pregunta.slice(0, 90)}`);
}

const { n2, descensos } = leerCommits();
console.log(`\n2) Decisiones de nivel 2 («Frontera: N2 <tipo>» en el commit): ${n2.length}`);
const porTipo = new Map();
for (const d of n2) porTipo.set(d.tipo, (porTipo.get(d.tipo) || 0) + 1);
if (!porTipo.size) console.log('   (ninguna)');
for (const [tipo, n] of [...porTipo.entries()].sort((a, b) => b[1] - a[1])) console.log(`   ${tipo.padEnd(26)} ${n}`);

console.log(`\n3) Descensos (corrección del usuario o revert de un N2): ${descensos.length}`);
for (const d of descensos) console.log(`   ⬇️  ${d.fecha} · ${d.tipo} · ${d.porque} (${d.sha.slice(0, 8)})`);
if (!descensos.length) console.log('   (ninguno)');

if (HISTORICO) {
  const antes = new Map();
  for (const p of preguntas.filter((x) => x.fecha < INICIO)) {
    const k = p.header || '(sin header)';
    if (!antes.has(k)) antes.set(k, []);
    antes.get(k).push(p);
  }
  const total = preguntas.filter((x) => x.fecha < INICIO);
  const conRec = total.filter((p) => p.conRecomendacion);
  console.log(`\n4) Histórico SIN etiqueta (antes del ${INICIO}), agrupado por header — orientativo, el header no es un tipo:`);
  console.log(`   ${total.length} preguntas · ${conRec.filter((p) => p.resultado === 'recomendada').length} de ${conRec.length} con recomendación aceptadas tal cual`);
  imprimirGrupo('historico', antes);
}
console.log('');
