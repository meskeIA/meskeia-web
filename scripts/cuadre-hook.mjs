#!/usr/bin/env node
/**
 * cuadre-hook.mjs — lo que el harness ejecuta por su cuenta
 *
 * No lo llama Claude: lo llaman los hooks de Claude Code declarados en
 * `~/.claude/settings.json`. Esa es la condición que sostiene todo el invento — si el
 * verificador dependiera de que el generador se acuerde de ejecutarlo, volvería a depender
 * del generador.
 *
 * Eventos:
 *   inicia     (SessionStart)      anota el commit de partida y dónde vive el transcript
 *   peticion   (UserPromptSubmit)  guarda tu texto LITERAL, sin que lo resuma nadie
 *   cierre     (SessionEnd)        cuenta, reconcilia y avisa (no bloquea: no hay qué)
 *   no-verify  (PreToolUse/Bash)   rechaza cualquier orden con --no-verify
 *
 * Cada uno recibe por entrada estándar el JSON del evento y NO IMPRIME NADA salvo que
 * tenga algo que decir. Si el directorio de trabajo no es meskeia-web, termina en silencio:
 * estos hooks son globales y no tienen nada que hacer en XFinanzas ni en Genealogía.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_ESTADO = path.join(RAIZ, 'scratch', 'cuadre');
const evento = process.argv[2];

/** Lee el JSON del evento. Si no llega nada utilizable, no se inventa: se calla. */
async function entrada() {
  const trozos = [];
  for await (const t of process.stdin) trozos.push(t);
  try {
    return JSON.parse(trozos.join('')) || {};
  } catch {
    return {};
  }
}

const datos = await entrada();

// ── Guardia: estos hooks solo tienen sentido dentro de meskeia-web ───────────
const dondeEstamos = path.resolve(datos.cwd || process.cwd());
const dentro = dondeEstamos === RAIZ || dondeEstamos.startsWith(`${RAIZ}${path.sep}`);

// ── PreToolUse · la puerta de once caracteres ────────────────────────────────
//
// `git commit --no-verify` salta el pre-commit entero, y los commits los teclea Claude:
// el único candado que bloquea sería puenteable por el auditado. No hace falta mala
// intención — basta un falso positivo un día con prisa. Así es como mueren los candados.
// Lo corta el harness, que es quien no forma parte del trato.
if (evento === 'no-verify') {
  // Se juzga la orden SIN su texto entrecomillado ni los cuerpos de heredoc: el mensaje de un
  // commit puede hablar de `--no-verify` sin usarlo, y de hecho el primero que lo hizo fue el
  // commit que creó este candado, que quedó bloqueado por explicar la regla que implantaba.
  //
  // `-n` a secas es la forma corta, pero también es el flag de media docena de órdenes
  // inocentes (`head -n`, `sort -n`, `grep -n "commit"`), así que solo cuenta cuando va
  // detrás de un `git commit` en ese mismo segmento. `--no-edit` no lo dispara.
  const orden = String(datos.tool_input?.command || '');
  const desnuda = orden
    .replace(/<<-?\s*'?"?(\w+)'?"?[\s\S]*?^\s*\1\s*$/gm, ' ') // cuerpos de heredoc
    .replace(/'[^']*'/g, ' ') // comillas simples
    .replace(/"[^"]*"/g, ' '); // comillas dobles
  if (dentro && (/--no-verify/.test(desnuda) || /git\s+commit\b[^|&;]*\s-\w*n\w*\b/.test(desnuda))) {
    process.stderr.write(
      'El proyecto no permite --no-verify: desarma el guardián de secretos, los goldens de cálculo y el Cuadre a la vez.\n' +
        'Si el Cuadre ha bloqueado un commit y la sorpresa es correcta, autorízala dejando la razón escrita:\n' +
        '  CUADRE_OK="por qué es correcto" git commit -m "…"\n',
    );
    process.exit(2); // 2 = bloquea la herramienta y devuelve el motivo a la sesión
  }
  process.exit(0);
}

if (!dentro) process.exit(0);

const ficheroSesion = (id) => path.join(DIR_ESTADO, `sesion-${id || 'sin-id'}.json`);

function leer(ruta) {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch {
    return null;
  }
}

function escribir(ruta, contenido) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(`${ruta}.tmp`, JSON.stringify(contenido, null, 2), 'utf8');
  fs.renameSync(`${ruta}.tmp`, ruta);
}

// ── SessionStart · la línea base ─────────────────────────────────────────────
//
// Se anota el HEAD de partida, no el del último commit: una sesión puede commitear tres
// veces, y lo que hay que cuadrar contra lo que pediste es TODO lo que ha pasado desde que
// te sentaste, no el último trozo. Si la sesión se reanuda o se compacta, la base NO se
// vuelve a tocar: perderla sería perder la mitad izquierda de la comparación.
if (evento === 'inicia') {
  const ruta = ficheroSesion(datos.session_id);
  const previo = leer(ruta);
  if (previo?.base) {
    previo.transcript = datos.transcript_path || previo.transcript || null;
    escribir(ruta, previo);
    process.exit(0);
  }
  let base = null;
  try {
    base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: RAIZ, encoding: 'utf8' }).trim();
  } catch {
    process.exit(0); // sin repositorio no hay nada que cuadrar
  }
  escribir(ruta, {
    sesion: datos.session_id || 'sin-id',
    inicio: new Date().toISOString(),
    base,
    transcript: datos.transcript_path || null,
    peticiones: [],
    autorizados: [],
    actas: [],
  });
  process.exit(0);
}

// ── UserPromptSubmit · lo que pediste, literal ───────────────────────────────
//
// El lado izquierdo de la comparación tiene que venir de ti. Si lo resumiera el modelo,
// el Cuadre estaría comparando lo tocado contra la versión que el auditado da de su
// propio encargo, que es exactamente el círculo que este sistema existe para romper.
if (evento === 'peticion') {
  const ruta = ficheroSesion(datos.session_id);
  const estado = leer(ruta) || {
    sesion: datos.session_id || 'sin-id',
    inicio: new Date().toISOString(),
    base: (() => {
      try {
        return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: RAIZ, encoding: 'utf8' }).trim();
      } catch {
        return null;
      }
    })(),
    transcript: datos.transcript_path || null,
    peticiones: [],
    autorizados: [],
    actas: [],
  };
  const texto = String(datos.prompt || '').trim();
  if (texto) estado.peticiones = [...(estado.peticiones || []), texto].slice(-40);
  if (datos.transcript_path) estado.transcript = datos.transcript_path;
  escribir(ruta, estado);
  process.exit(0);
}

// ── SessionEnd · contar al cerrar, sin bloquear ──────────────────────────────
if (evento === 'cierre') {
  const { spawnSync } = await import('node:child_process');
  spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'cuadre.mjs'), '--cierre'], {
    cwd: RAIZ,
    stdio: 'ignore',
    timeout: 25000,
  });
  process.exit(0);
}

process.exit(0);
